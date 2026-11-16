import { affineScaling2 } from "../../geometry/affine2";
import * as Inputs from "../../../../inputs";
import { cssColorHex } from "../../color/css-colors";
import { angleWithinTurn, conicArcOfEllipseArc } from "../../curves/conic-arcs";
import type { ConicArc } from "../../curves/conic-arcs";
import { clampedUniformKnots } from "../../curves/nurbs-forms";
import { millimetresPerUnitOf } from "../../geometry/lengths";
import { distance2, distance3, length3, scale3 } from "../../geometry/vectors";
import { drawingBounds, patternUnitOf } from "../drawing/drawing-geometry";
import { writerBudgetOf } from "../drawing/drawing-budget";
import { drawingPartsOf } from "../drawing/drawing-model";
import { DEFAULT_LAYER, FIRST_PRINTABLE_CODE, FORBIDDEN_LAYER_CHARACTERS, FULL_TURN_DEGREES } from "../drawing/drawing.constants";
import { conicSegmentDto } from "../dxf/dxf-reader-dtos";
import { DXF_MAX_NAME_LENGTH } from "../dxf/dxf.constants";
import { lineTypeOfDashes } from "./svg-dash-patterns";
import { remembered } from "./svg-memo";
import { normalizeSvg } from "./svg-normalizer";
import type { SvgArcSegment, SvgElement, SvgSegment, SvgSubpath } from "./svg-scene-types";
import { styleReadings } from "./svg-style";
import { transformSubpath } from "./svg-transform";
import {
    FULL_TURN, HIGH_SURROGATE_AT_END, LAYER_STAND_IN, LEAST_ARC_SWEEP, NUMBER_PRECISION_SLACK, POINT_NOISE_SHARE, SAME_CONIC_SHARE, UNREAD_PAINT,
} from "./svg-reading.constants";

type Point2 = Inputs.Base.Point2;
type Point3 = Inputs.Base.Point3;
type SegmentDto = Inputs.IO.DrawingPathDto["segments"][number];

export interface SvgReadingOptions {
    readonly unit: Inputs.Base.unitOfLengthEnum | undefined;
    readonly includeInvisible: boolean;
}

interface ArcRun {
    readonly arc: ConicArc;
    readonly from: Point2;
    readonly to: Point2;
    readonly tolerance: number;
}

interface ReadElement {
    readonly layer: string;
    readonly color: string;
    readonly dashes: readonly number[] | undefined;
    readonly paths: readonly Inputs.IO.DrawingPathDto[];
}

const MIRROR_Y = affineScaling2(1, -1);

const plural = (count: number, one: string, many: string): string => (count === 1 ? one : many);

const pointOf = (point: Point2): Point3 => [point[0], point[1], 0];

const samePoint = (a: Point2, b: Point2): boolean =>
    distance2(a, b) <= POINT_NOISE_SHARE * Math.max(Math.abs(a[0]), Math.abs(a[1]), Math.abs(b[0]), Math.abs(b[1]));

const lineDto = (from: Point2, to: Point2): SegmentDto[] => (samePoint(from, to) ? [] : [{ start: pointOf(from), end: pointOf(to) }]);

const bezierDto = (controlPoints: readonly Point2[]): SegmentDto => ({
    controlPoints: controlPoints.map(pointOf),
    degree: controlPoints.length - 1,
    knots: clampedUniformKnots(controlPoints.length, controlPoints.length - 1),
});

const curveDtos = (from: Point2, segment: Exclude<SvgSegment, SvgArcSegment>): SegmentDto[] => {
    switch (segment.type) {
        case "line":
            return lineDto(from, segment.to);
        case "quad":
            return [bezierDto([from, segment.c, segment.to])];
        case "cubic":
            return [bezierDto([from, segment.c1, segment.c2, segment.to])];
    }
};

const isSameConic = (run: ArcRun, next: ConicArc): boolean => {
    const { frame } = run.arc;
    const major = length3(frame.xAxis);
    const minor = length3(frame.yAxis);
    const near = (a: Point3, b: Point3): boolean => distance3(a, b) <= run.tolerance;
    const sameSize = Math.abs(length3(next.frame.xAxis) - major) <= run.tolerance && Math.abs(length3(next.frame.yAxis) - minor) <= run.tolerance;
    const sameAxes = major - minor <= run.tolerance
        || (near(next.frame.xAxis, frame.xAxis) && near(next.frame.yAxis, frame.yAxis))
        || (near(next.frame.xAxis, scale3(frame.xAxis, -1)) && near(next.frame.yAxis, scale3(frame.yAxis, -1)));
    return sameSize && sameAxes && near(next.frame.center, frame.center);
};

const isWhole = (run: ArcRun): boolean =>
    Math.abs(run.arc.sweep) >= FULL_TURN || (Math.abs(run.arc.sweep) > Math.PI && distance2(run.from, run.to) <= run.tolerance);

const continues = (run: ArcRun, next: ConicArc): boolean => Math.sign(run.arc.sweep) === Math.sign(next.sweep) && !isWhole(run) && isSameConic(run, next);

const counterclockwise = (run: ArcRun): ConicArc => {
    const { arc } = run;
    if (isWhole(run)) {
        return { frame: arc.frame, start: 0, sweep: FULL_TURN };
    }
    const start = arc.sweep < 0 ? arc.start + arc.sweep : arc.start;
    return { frame: arc.frame, start: angleWithinTurn(start, FULL_TURN), sweep: Math.abs(arc.sweep) };
};

const anglesWithinTurn = (dto: SegmentDto): SegmentDto =>
    ("startAngle" in dto ? { ...dto, startAngle: angleWithinTurn(dto.startAngle, FULL_TURN_DEGREES), endAngle: angleWithinTurn(dto.endAngle, FULL_TURN_DEGREES) } : dto);

const cutName = (name: string): string => {
    const cut = name.slice(0, DXF_MAX_NAME_LENGTH);
    return HIGH_SURROGATE_AT_END.test(cut) ? cut.slice(0, -1) : cut;
};

const isLayerCharacter = (character: string): boolean => character.charCodeAt(0) >= FIRST_PRINTABLE_CODE && !FORBIDDEN_LAYER_CHARACTERS.test(character);

const unitOfDrawing = (paths: readonly Inputs.IO.DrawingPathDto[]): number | undefined => {
    try {
        const parts = drawingPartsOf([{ paths }], "parts");
        return patternUnitOf(drawingBounds(parts, 0, writerBudgetOf(parts)));
    } catch {
        return undefined;
    }
};

class SvgReading {
    private readonly readings = styleReadings();
    private readonly colors = new Map<string, string | undefined>();
    private readonly layers = new Map<string, string>();
    private hidden = 0;
    private unreadColors = 0;
    private unmatchedDashes = 0;
    private renamedLayers = 0;
    private cutLayers = 0;
    private flatArcs = 0;

    constructor(private readonly includeInvisible: boolean, private readonly precision: number) { }

    elementOf(element: SvgElement): ReadElement | undefined {
        if (element.style.hidden === true && !this.includeInvisible) {
            this.hidden++;
            return undefined;
        }
        const paths = element.subpaths.flatMap(subpath => this.pathsOf(subpath));
        if (paths.length === 0) {
            return undefined;
        }
        return { layer: this.layerOf(element.layer), color: this.colorOf(element), dashes: element.style.strokeDashArray, paths };
    }

    lineTypeOf(dashes: readonly number[] | undefined, patternUnit: () => number | undefined): Inputs.IO.lineTypeEnum {
        if (dashes === undefined || !dashes.some(dash => dash > 0)) {
            return Inputs.IO.lineTypeEnum.continuous;
        }
        const lineType = lineTypeOfDashes(dashes, patternUnit);
        if (lineType === undefined) {
            this.unmatchedDashes++;
            return Inputs.IO.lineTypeEnum.dashed;
        }
        return lineType;
    }

    warnings(): string[] {
        const counted: readonly (readonly [number, string])[] = [
            [this.hidden, `${this.hidden} hidden ${plural(this.hidden, "element was", "elements were")} left out: set includeInvisible to read ${plural(this.hidden, "it", "them")}.`],
            [this.unreadColors, `${this.unreadColors} ${plural(this.unreadColors, "element is", "elements are")} painted with a gradient, a pattern or a color other than a hex, rgb() or named color; ${plural(this.unreadColors, "it was", "they were")} read as black.`],
            [this.unmatchedDashes, `${this.unmatchedDashes} ${plural(this.unmatchedDashes, "element is", "elements are")} dashed in a pattern no line type draws; ${plural(this.unmatchedDashes, "it was", "they were")} read as dashed.`],
            [this.renamedLayers, `${this.renamedLayers} layer ${plural(this.renamedLayers, "name holds", "names hold")} characters a layer name may not (< > / \\ " : ; ? * | = \` or a control character); each was replaced by ${LAYER_STAND_IN}.`],
            [this.cutLayers, `${this.cutLayers} layer ${plural(this.cutLayers, "name was", "names were")} longer than ${DXF_MAX_NAME_LENGTH} characters, the most a layer name holds, and ${plural(this.cutLayers, "was", "were")} cut to ${plural(this.cutLayers, "its", "their")} first ${DXF_MAX_NAME_LENGTH}.`],
            [this.flatArcs, `${this.flatArcs} ${plural(this.flatArcs, "arc was", "arcs were")} left out: a transform flattens ${plural(this.flatArcs, "it", "them")} to no width.`],
        ];
        return counted.filter(([count]) => count > 0).map(([, warning]) => warning);
    }

    private pathsOf(given: SvgSubpath): Inputs.IO.DrawingPathDto[] {
        const subpath = transformSubpath(MIRROR_Y, given);
        const segments: SegmentDto[] = [];
        let run: ArcRun | undefined;
        let from = subpath.start;
        for (const segment of subpath.segments) {
            if (segment.type === "arc") {
                const arc = conicArcOfEllipseArc(segment);
                if (run !== undefined && continues(run, arc)) {
                    run = { ...run, arc: { frame: run.arc.frame, start: run.arc.start, sweep: run.arc.sweep + arc.sweep }, to: segment.to };
                } else {
                    this.pushConic(segments, run);
                    run = { arc, from, to: segment.to, tolerance: Math.max(SAME_CONIC_SHARE * length3(arc.frame.xAxis), this.precision) };
                }
            } else {
                this.pushConic(segments, run);
                run = undefined;
                segments.push(...curveDtos(from, segment));
            }
            from = segment.to;
        }
        this.pushConic(segments, run);
        if (subpath.closed) {
            segments.push(...lineDto(from, subpath.start));
        }
        return segments.length === 0 ? [] : [{ segments }];
    }

    private pushConic(segments: SegmentDto[], run: ArcRun | undefined): void {
        if (run === undefined) {
            return;
        }
        const arc = counterclockwise(run);
        if (arc.sweep < LEAST_ARC_SWEEP) {
            segments.push(...lineDto(run.from, run.to));
            return;
        }
        const dto = conicSegmentDto({ kind: "conic", center: arc.frame.center, xAxis: arc.frame.xAxis, yAxis: arc.frame.yAxis, start: arc.start, sweep: arc.sweep });
        if (dto === undefined) {
            this.flatArcs++;
        } else {
            segments.push(anglesWithinTurn(dto));
        }
    }

    private colorOf(element: SvgElement): string {
        const paint = [element.style.stroke, element.style.fill].find(value => value !== undefined && !this.readings.paintsNothing(value));
        if (paint === undefined) {
            return UNREAD_PAINT;
        }
        const hex = remembered(this.colors, paint, cssColorHex);
        if (hex === undefined) {
            this.unreadColors++;
        }
        return hex ?? UNREAD_PAINT;
    }

    private layerOf(label: string | undefined): string {
        return label === undefined ? DEFAULT_LAYER : remembered(this.layers, label, given => this.layerNameOf(given));
    }

    private layerNameOf(label: string): string {
        let name = label.trim();
        if (name.length > DXF_MAX_NAME_LENGTH) {
            this.cutLayers++;
            name = cutName(name).trim();
        }
        const allowed = Array.from(name, character => (isLayerCharacter(character) ? character : LAYER_STAND_IN)).join("");
        if (allowed !== name) {
            this.renamedLayers++;
        }
        return allowed === "" ? DEFAULT_LAYER : allowed;
    }
}

export const readSvgDrawing = (svg: string, options: SvgReadingOptions): Inputs.IO.SvgDrawingDto => {
    const scene = normalizeSvg(svg, options.unit === undefined ? {} : { unit: options.unit });
    const userUnit = options.unit === undefined ? 1 : (scene.millimetresPerUserUnit ?? millimetresPerUnitOf(options.unit)) / millimetresPerUnitOf(options.unit);
    const reading = new SvgReading(options.includeInvisible, NUMBER_PRECISION_SLACK * userUnit);
    const elements: ReadElement[] = [];
    for (const element of scene.elements) {
        const read = reading.elementOf(element);
        if (read !== undefined) {
            elements.push(read);
        }
    }
    let patternUnit: number | undefined;
    let measured = false;
    const unitOfAll = (): number | undefined => {
        if (!measured) {
            measured = true;
            patternUnit = unitOfDrawing(elements.flatMap(element => element.paths));
        }
        return patternUnit;
    };
    const parts = new Map<string, Inputs.IO.DrawingPartDto>();
    for (const element of elements) {
        const lineType = reading.lineTypeOf(element.dashes, unitOfAll);
        const key = `${element.layer}\n${element.color}\n${lineType}`;
        const part: Inputs.IO.DrawingPartDto = parts.get(key) ?? { layer: element.layer, color: element.color, lineType, paths: [] };
        parts.set(key, part);
        for (const path of element.paths) {
            part.paths.push(path);
        }
    }
    return {
        parts: [...parts.values()],
        unit: options.unit,
        viewBox: scene.viewBox === undefined ? undefined : [...scene.viewBox],
        warnings: scene.warnings.concat(reading.warnings()),
    };
};
