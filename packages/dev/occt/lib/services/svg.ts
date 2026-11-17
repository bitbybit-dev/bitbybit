import type { BitbybitOcctModule, TopoDS_Compound, TopoDS_Shape, TopoDS_Wire } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import type { OccHelper } from "../occ-helper";
import * as Inputs from "../api/inputs";
import { PathBuilder, deleteQuietly } from "./base/path-builder";
import type { BuiltElement } from "./base/path-builder";
import type { FaceLoop, SvgFaceRule } from "./base/drawing-faces";
import { DrawingFaceBuilder, faceWorkBudgetFor } from "./base/drawing-faces";
import { normalizeSvg } from "@bitbybit-dev/base/lib/api/services/helpers/files/svg/svg-normalizer";
import { millimetresPerPixel } from "@bitbybit-dev/base/lib/api/services/helpers/files/svg/svg-numbers";
import type { SvgElement, SvgScene, SvgStyle, SvgSubpath } from "@bitbybit-dev/base/lib/api/services/helpers/files/svg/svg-scene-types";
import type { StyleReadings } from "@bitbybit-dev/base/lib/api/services/helpers/files/svg/svg-style";
import { fillsArea, styleReadings } from "@bitbybit-dev/base/lib/api/services/helpers/files/svg/svg-style";
import { LARGEST_KERNEL_COORDINATE, LEAST_SAMPLES_PER_ARC, MAX_BUILT_ELEMENTS, OUTLINE_POINT_CEILING, OUTLINE_POINT_FLOOR, OUTLINE_POINTS_PER_INPUT_CHARACTER, SAMPLES_PER_BEZIER, SAMPLES_PER_QUARTER_TURN } from "./svg-import.constants";
import { svgSubpathPoints } from "@bitbybit-dev/base/lib/api/services/helpers/files/svg/svg-path-data";
import { WorkBudget } from "@bitbybit-dev/base/lib/api/services/helpers/files/work-budget";
import { drawingOntoGround } from "./base/file-axes";
import { checkedChoice, checkedDirection, checkedNumber, checkedPoint, checkedWithin } from "./base/input-checks";
import { released, releasedOnError } from "./base/release";
import { InputError, resolveDto } from "@bitbybit-dev/base";
import { distance2, scale2 } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/vectors";
import type * as Resolved from "../api/resolved-inputs";

type Point2 = Inputs.Base.Point2;

interface PreparedElement {
    element: SvgElement;
    subpaths: SvgSubpath[];
    closed: boolean[];
}

interface BuiltItem {
    element: SvgElement;
    shape: TopoDS_Shape;
    isFace: boolean;
    closed: boolean;
}

interface ExtractedWires {
    wires: TopoDS_Wire[];
    cleanup: TopoDS_Shape[];
}

interface BuiltScene {
    drawing: TopoDS_Shape | undefined;
    items: BuiltItem[];
    warnings: string[];
    scene: SvgScene;
}

interface ImportBudgets {
    readonly faces: WorkBudget;
    readonly outlinePoints: WorkBudget;
}

const FACE_STRATEGIES = Object.values(Inputs.OCCT.svgFaceStrategyEnum);
const ALIGNMENTS = Object.values(Inputs.Base.basicAlignmentEnum);
const UNITS = Object.values(Inputs.Base.unitOfLengthEnum);

const outlinePointsWarning = (capacity: number): string =>
    `The filled elements of the SVG take more than ${capacity} outline points to sort into faces, more than the importer samples from a file of its size; the rest are returned as their outline wires.`;

/**
 * Importing SVG drawings as OpenCascade shapes. The importer parses the document (paths, basic
 * shapes, transforms, reused elements, nested viewports, units and the style cascade with CSS),
 * reduces every element to the generic path vocabulary of `path` and builds wires, and faces where
 * it can, laid on the ground plane and placed by the import options. `loadSVG` gives one compound
 * for the whole drawing; `loadSVGStructured` gives one shape per element with its fill and stroke.
 */
export class OCCTSVG {
    private readonly builder: PathBuilder;
    private readonly faceBuilder: DrawingFaceBuilder;

    constructor(
        occ: BitbybitOcctModule,
        private readonly och: OccHelper
    ) {
        this.builder = new PathBuilder(occ, och);
        this.faceBuilder = new DrawingFaceBuilder(occ, och);
    }

    private resolveRule(strategy: Inputs.OCCT.svgFaceStrategyEnum, style: SvgStyle, readings: StyleReadings): SvgFaceRule | undefined {
        if (strategy === Inputs.OCCT.svgFaceStrategyEnum.none) { return undefined; }
        if (!fillsArea(style, readings)) { return undefined; }
        if (strategy === Inputs.OCCT.svgFaceStrategyEnum.perSubpath) { return "perSubpath"; }
        if (strategy === Inputs.OCCT.svgFaceStrategyEnum.evenOdd) { return "evenOdd"; }
        if (strategy === Inputs.OCCT.svgFaceStrategyEnum.nonzero) { return "nonzero"; }
        return style.fillRule === "evenodd" ? "evenOdd" : "nonzero";
    }

    private extractWires(shape: TopoDS_Shape): ExtractedWires {
        if (this.och.enumService.getShapeTypeEnum(shape) === Inputs.OCCT.shapeTypeEnum.wire) {
            return { wires: [shape], cleanup: [shape] };
        }
        const wires: TopoDS_Wire[] = [];
        const cleanup: TopoDS_Shape[] = [shape];
        this.och.iteratorService.forEachShapeInCompound(shape, (_i: number, child: TopoDS_Shape) => {
            const typed = this.och.converterService.getActualTypeOfShape(child);
            if (typed !== child) { deleteQuietly(child); }
            cleanup.push(typed);
            if (this.och.enumService.getShapeTypeEnum(typed) === Inputs.OCCT.shapeTypeEnum.wire) {
                wires.push(typed);
            }
        });
        return { wires, cleanup };
    }

    private toPathSubpath(sp: SvgSubpath): Inputs.OCCT.PathSubpath {
        return {
            start: sp.start,
            closed: sp.closed,
            segments: sp.segments.map((seg) => {
                if (seg.type === "quad") {
                    return { type: "quadratic", c: seg.c, to: seg.to };
                }
                return seg;
            }),
        };
    }

    private prepare(element: SvgElement, tolerance: number): PreparedElement {
        const closed: boolean[] = [];
        const subpaths = element.subpaths.map((sp) => {
            const last = sp.segments[sp.segments.length - 1];
            const gap = last === undefined ? Infinity : distance2(last.to, sp.start);
            const closesWithin = !sp.closed && gap <= tolerance;
            closed.push(sp.closed || closesWithin);
            if (!closesWithin) { return sp; }
            if (gap === 0 || last!.type === "arc") { return { ...sp, closed: true }; }
            return { ...sp, closed: true, segments: [...sp.segments.slice(0, -1), { ...last!, to: sp.start }] };
        });
        return { element, subpaths, closed };
    }

    private styleToMeta(el: SvgElement): Partial<Inputs.OCCT.SVGShape<TopoDS_Shape>> {
        const meta: Partial<Inputs.OCCT.SVGShape<TopoDS_Shape>> = { elementType: el.tag };
        if (el.style.fill !== undefined) { meta.fill = el.style.fill; }
        if (el.style.stroke !== undefined) { meta.stroke = el.style.stroke; }
        if (el.style.strokeWidth !== undefined) { meta.strokeWidth = el.style.strokeWidth; }
        if (el.style.opacity !== undefined) { meta.opacity = el.style.opacity; }
        if (el.id !== undefined) { meta.id = el.id; }
        if (el.className !== undefined) { meta.className = el.className; }
        return meta;
    }

    private outlineOf(subpath: SvgSubpath, place: (p: Point2) => Point2, points: WorkBudget): Point2[] | undefined {
        const outline: Point2[] = [place(subpath.start)];
        let from = subpath.start;
        for (const segment of subpath.segments) {
            const samples = svgSubpathPoints({ start: from, segments: [segment], closed: false }, segment.type === "arc" ? LEAST_SAMPLES_PER_ARC : SAMPLES_PER_BEZIER, SAMPLES_PER_QUARTER_TURN);
            if (!points.spend(samples.length)) { return undefined; }
            for (let k = 1; k < samples.length; k++) { outline.push(place(samples[k]!)); }
            from = segment.to;
        }
        return outline;
    }

    private faceElement(prepared: PreparedElement, built: BuiltElement, inputs: Resolved.OCCT.LoadSVGDto, warnings: string[], readings: StyleReadings, budgets: ImportBudgets): BuiltItem {
        const element = prepared.element;
        const closed = prepared.closed.length > 0 && prepared.closed.every((c) => c);
        const rule = this.resolveRule(inputs.faceStrategy, element.style, readings);
        const unfaced: BuiltItem = { element, shape: built.shape, isFace: built.isFace, closed };
        if (rule === undefined || !prepared.closed.some((c) => c) || budgets.outlinePoints.exhausted) {
            return unfaced;
        }
        const { wires, cleanup } = this.extractWires(built.shape);
        const releaseWires = (): void => cleanup.filter((s) => s !== built.shape).forEach((s) => deleteQuietly(s));
        return releasedOnError(cleanup, () => {
            const aligned = wires.length === prepared.subpaths.length;
            const place = (p: Point2): Point2 => scale2([p[0], inputs.flipY ? -p[1] : p[1]], inputs.scale);
            const loops: FaceLoop[] = [];
            const open: TopoDS_Wire[] = [];
            for (let k = 0; k < wires.length; k++) {
                const wire = wires[k]!;
                if (!(aligned ? prepared.closed[k] : this.och.wiresService.isWireClosed({ shape: wire }))) {
                    open.push(wire);
                    continue;
                }
                const outline = aligned ? this.outlineOf(prepared.subpaths[k]!, place, budgets.outlinePoints) : undefined;
                if (aligned && outline === undefined) {
                    warnings.push(outlinePointsWarning(budgets.outlinePoints.capacity));
                    releaseWires();
                    return unfaced;
                }
                loops.push(outline === undefined ? { wire } : { wire, outline });
            }
            const faced = this.faceBuilder.build(loops, rule, warnings, budgets.faces);
            if (faced.faces.length === 0) {
                releaseWires();
                return { element, shape: built.shape, isFace: false, closed };
            }
            const parts: TopoDS_Shape[] = [...faced.faces, ...faced.unfaced, ...open];
            const shape = parts.length === 1 ? faced.faces[0]! : releasedOnError(faced.faces, () => this.och.converterService.makeCompound({ shapes: parts }));
            if (parts.length > 1) { faced.faces.forEach((f) => deleteQuietly(f)); }
            cleanup.forEach((s) => deleteQuietly(s));
            return { element, shape, isFace: true, closed };
        });
    }

    private placeAll(shapes: TopoDS_Shape[], inputs: Resolved.OCCT.LoadSVGDto): TopoDS_Shape | undefined {
        if (shapes.length === 0) { return undefined; }
        const drawing = this.och.converterService.makeCompound({ shapes });
        const grounded = released([drawing], () => drawingOntoGround(this.och, drawing));
        return released([grounded], () => inputs.keepOrigin ? this.oriented(grounded, inputs) : this.anchored(grounded, inputs));
    }

    private anchored(grounded: TopoDS_Shape, inputs: Resolved.OCCT.LoadSVGDto): TopoDS_Shape {
        const bbox = this.och.operationsService.boundingBoxOfShape({ shape: grounded });
        const alignment: string = inputs.alignment;
        const anchorX = alignment.endsWith("Left") ? bbox.min[0] : alignment.endsWith("Right") ? bbox.max[0] : bbox.center[0];
        const anchorZ = alignment.startsWith("top") ? bbox.max[2] : alignment.startsWith("bottom") ? bbox.min[2] : bbox.center[2];
        const shifted = this.och.transformsService.translate({ shape: grounded, translation: [-anchorX, -bbox.center[1], -anchorZ] });
        return released([shifted], () => this.oriented(shifted, inputs));
    }

    private oriented(shape: TopoDS_Shape, inputs: Resolved.OCCT.LoadSVGDto): TopoDS_Shape {
        return this.och.transformsService.alignAndTranslate({ shape, direction: inputs.direction, center: inputs.center });
    }

    private partsOf(drawing: TopoDS_Shape): TopoDS_Shape[] {
        const parts: TopoDS_Shape[] = [];
        return releasedOnError(parts, () => {
            this.och.iteratorService.forEachShapeInCompound(drawing, (_i: number, child: TopoDS_Shape) => {
                const typed = releasedOnError([child], () => this.och.converterService.getActualTypeOfShape(child));
                if (typed !== child) { deleteQuietly(child); }
                parts.push(typed);
            });
            return parts;
        });
    }

    private checkedOptions(inputs: Resolved.OCCT.LoadSVGDto): void {
        if (typeof inputs.svg !== "string") {
            throw new InputError(`\`svg\` is not text: it needs the SVG document as a string, and it is ${typeof inputs.svg}.`, "svg");
        }
        checkedChoice(inputs.faceStrategy, FACE_STRATEGIES, "faceStrategy");
        checkedChoice(inputs.alignment, ALIGNMENTS, "alignment");
        if (inputs.unit !== undefined) { checkedChoice(inputs.unit, UNITS, "unit"); }
        checkedNumber(inputs.scale, "scale");
        checkedWithin(inputs.tolerance, "tolerance", { atLeast: 0, below: LARGEST_KERNEL_COORDINATE });
        checkedDirection(inputs.direction, "direction");
        checkedPoint(inputs.center, "center");
    }

    private buildAndPlace(inputs: Resolved.OCCT.LoadSVGDto): BuiltScene {
        const scene = normalizeSvg(inputs.svg, inputs.unit === undefined ? {} : { unit: inputs.unit });
        const warnings = [...scene.warnings];
        const budgets: ImportBudgets = {
            faces: faceWorkBudgetFor(inputs.svg.length),
            outlinePoints: WorkBudget.forInput(inputs.svg.length, OUTLINE_POINTS_PER_INPUT_CHARACTER, OUTLINE_POINT_FLOOR, OUTLINE_POINT_CEILING),
        };

        if (inputs.makeRibbons) {
            warnings.push("makeRibbons is not supported yet; stroked paths are returned as wires.");
        }

        const drawn = scene.elements.filter((el) => !(el.style.hidden && !inputs.includeInvisible));
        if (drawn.length > MAX_BUILT_ELEMENTS) {
            warnings.push(`The SVG draws more than ${MAX_BUILT_ELEMENTS} elements; the first ${MAX_BUILT_ELEMENTS} are imported and the rest are left out.`);
        }
        const closingTolerance = inputs.tolerance / Math.abs(inputs.scale || 1);
        const prepared = drawn.slice(0, MAX_BUILT_ELEMENTS).map((el) => this.prepare(el, closingTolerance));
        const groups = prepared.map((p) => ({
            subpaths: p.subpaths.map((sp) => this.toPathSubpath(sp)),
            makeFaces: false,
        }));
        const placement: Resolved.OCCT.PathPlacementDto = { scale: inputs.scale, flipY: inputs.flipY, origin: [0, 0, 0] };
        const built = this.builder.buildGroups(groups, placement, {
            joinSegments: inputs.joinSegments,
            tolerance: inputs.tolerance,
            warnings,
            property: "svg",
        });

        const readings = styleReadings();
        const owned = built.flatMap((b) => (b ? [b.shape] : []));
        const items = releasedOnError(owned, () => prepared.flatMap((p, i) => {
            const b = built[i];
            if (!b) { return []; }
            const item = this.faceElement(p, b, inputs, warnings, readings, budgets);
            owned.push(item.shape);
            return [item];
        }));
        const shapes = items.map((it) => it.shape);
        const drawing = released(shapes, () => this.placeAll(shapes, inputs));

        return { drawing, items, warnings: [...new Set(warnings)], scene };
    }

    /**
     * Parses an SVG document into one compound on the ground, ready to draw, extrude or transform.
     *
     * `faceStrategy` decides which closed outlines become faces; `unit`, `scale` and `flipY` map SVG
     * units and its downward Y; `alignment`, `direction`, `center` and `keepOrigin` place it. A very
     * large file is read up to its limits; `loadSVGStructured` lists what was left out.
     * @param inputs - The SVG text and the import and placement options
     * @returns One compound holding every element
     * @group io
     * @shortname load svg
     * @drawable true
     * @example
     * ```typescript
     * const drawing = await bitbybit.occt.svg.loadSVG({
     *     svg: svgText,
     *     faceStrategy: Bit.Inputs.OCCT.svgFaceStrategyEnum.auto,
     *     makeRibbons: false,
     *     includeInvisible: false,
     *     joinSegments: true,
     *     tolerance: 1e-7,
     *     scale: 0.1,
     *     flipY: true,
     *     alignment: Bit.Inputs.Base.basicAlignmentEnum.midMid,
     *     direction: [0, 1, 0],
     *     center: [0, 0, 0],
     * });
     * ```
     */
    loadSVG(inputs: Inputs.OCCT.LoadSVGDto): TopoDS_Compound {
        const resolved = resolveDto(Inputs.OCCT.LoadSVGDto, inputs) as Resolved.OCCT.LoadSVGDto;
        this.checkedOptions(resolved);
        const { drawing } = this.buildAndPlace(resolved);
        return drawing ?? this.och.converterService.makeCompound({ shapes: [] });
    }

    /**
     * Parses an SVG document and builds one shape per drawable element, each bundled with its
     * resolved fill, stroke and stroke width, plus the warnings, the view box and the page size in
     * millimetres.
     *
     * Use it when the elements need their own colors or separate handling; `loadSVG` gives the
     * whole drawing as one shape.
     * @param inputs - The SVG text and the import and placement options
     * @returns The shapes with their styles, the warnings, the view box and the page size
     * @group io
     * @shortname load svg structured
     * @drawable false
     * @example
     * ```typescript
     * const options = new Bit.Inputs.OCCT.LoadSVGDto();
     * options.svg = svgText;
     * options.unit = Bit.Inputs.Base.unitOfLengthEnum.millimetre;
     * const result = await bitbybit.occt.svg.loadSVGStructured(options);
     * result.shapes.forEach(s => console.log(s.fill, s.stroke));
     * ```
     */
    loadSVGStructured(inputs: Inputs.OCCT.LoadSVGDto): Inputs.OCCT.SVGResult<TopoDS_Shape> {
        const resolved = resolveDto(Inputs.OCCT.LoadSVGDto, inputs) as Resolved.OCCT.LoadSVGDto;
        this.checkedOptions(resolved);
        const { drawing, items, warnings, scene } = this.buildAndPlace(resolved);
        const parts = drawing === undefined ? [] : released([drawing], () => this.partsOf(drawing));
        const shapes = items.map((it, i) => ({
            ...this.styleToMeta(it.element),
            shape: parts[i]!,
            isFace: it.isFace,
            closed: it.closed,
        } as Inputs.OCCT.SVGShape<TopoDS_Shape>));
        const result: Inputs.OCCT.SVGResult<TopoDS_Shape> = { shapes, warnings };
        if (scene.viewBox) { result.viewBox = scene.viewBox; }
        if (scene.width !== undefined && scene.height !== undefined) {
            result.documentWidth = scene.width * millimetresPerPixel();
            result.documentHeight = scene.height * millimetresPerPixel();
        }
        if (scene.millimetresPerUserUnit !== undefined) { result.millimetresPerUserUnit = scene.millimetresPerUserUnit; }
        return result;
    }
}
