import * as Inputs from "../../../../inputs";
import { InputError } from "../../../../kernel-calls";
import { degreesOf } from "../../geometry/scalars";
import { distance2 } from "../../geometry/vectors";
import { drawingBounds, drawingSize, patternUnitOf } from "../drawing/drawing-geometry";
import { writerBudgetOf } from "../drawing/drawing-budget";
import type { DrawingBounds, DrawingPart, DrawingPath } from "../drawing/drawing-types";
import { DEFAULT_LAYER, LEAST_TOLERANCE_SHARE, LINE_TYPE_PATTERNS } from "../drawing/drawing.constants";
import type { WorkBudget } from "../work-budget";
import { reversedStroke, strokeEnd, strokeOf } from "./svg-strokes";
import type { SvgMove, SvgStroke } from "./svg-strokes";
import { ID_UNSAFE, LEAST_VIEW_SPAN, MARGIN_SHARE, PATH_COLOR, STROKE_SHARE, SVG_DECIMALS, SVG_JOIN_DISTANCE, SVG_UNITS, TRAILING_FRACTION_ZEROS } from "./svg.constants";

type Point2 = Inputs.Base.Point2;

export interface SvgDocumentOptions {
    readonly unit: string | undefined;
    readonly strokeWidth: number | undefined;
    readonly margin: number | undefined;
    readonly tolerance: number;
    readonly property: string;
}

export interface SvgPathOptions {
    readonly flipY: boolean;
    readonly tolerance: number;
    readonly property: string;
}

interface PathWriting {
    readonly flipY: boolean;
    readonly tolerance: number;
    readonly budget: WorkBudget;
    readonly property: string;
}

interface ViewSpan {
    readonly from: number;
    readonly span: number;
}

interface SvgLayer {
    readonly id: string;
    readonly label: string;
    readonly parts: DrawingPart[];
}

export const svgNumber = (value: number): string => {
    const text = value.toFixed(SVG_DECIMALS).replace(TRAILING_FRACTION_ZEROS, "$1");
    return text === "-0" ? "0" : text;
};

const tooLarge = (writing: PathWriting): InputError =>
    new InputError(`\`${writing.property}\` is too large to write as SVG: it takes more than ${writing.budget.capacity} steps, each character written and each control point blended counted, the most a drawing of its size may take.`, writing.property);

const charged = (writing: PathWriting, text: string, chargedBefore = 0): string => {
    if (!writing.budget.spend(text.length - chargedBefore + 1)) {
        throw tooLarge(writing);
    }
    return text;
};

const joined = (writing: PathWriting, texts: readonly string[], separator: string): string => {
    try {
        return texts.join(separator);
    } catch {
        throw tooLarge(writing);
    }
};

const pointText = (point: Point2, writing: PathWriting): string => `${svgNumber(point[0])} ${svgNumber(writing.flipY ? -point[1] : point[1])}`;

const moveText = (move: SvgMove, writing: PathWriting): string => {
    switch (move.kind) {
        case "L":
            return `L${pointText(move.to, writing)}`;
        case "Q":
            return `Q${pointText(move.control, writing)} ${pointText(move.to, writing)}`;
        case "C":
            return `C${pointText(move.control1, writing)} ${pointText(move.control2, writing)} ${pointText(move.to, writing)}`;
        case "A": {
            const rotation = degreesOf(writing.flipY ? -move.rotation : move.rotation);
            const sweep = move.counterclockwise !== writing.flipY ? 1 : 0;
            return `A${svgNumber(move.radiusX)} ${svgNumber(move.radiusY)} ${svgNumber(rotation)} ${move.large ? 1 : 0} ${sweep} ${pointText(move.to, writing)}`;
        }
    }
};

const near = (a: Point2 | undefined, b: Point2): boolean => a !== undefined && distance2(a, b) <= SVG_JOIN_DISTANCE;

const pathText = (path: DrawingPath, writing: PathWriting): string => {
    const words: string[] = [];
    let current: Point2 | undefined;
    let subpathStart: Point2 | undefined;
    for (const segment of path.segments) {
        let stroke: SvgStroke = strokeOf(segment, writing.tolerance, writing.budget);
        if (writing.budget.exhausted) {
            throw tooLarge(writing);
        }
        if (!near(current, stroke.start) && !stroke.closed && near(current, strokeEnd(stroke))) {
            stroke = reversedStroke(stroke);
        }
        if (!near(current, stroke.start)) {
            words.push(charged(writing, `M${pointText(stroke.start, writing)}`));
            subpathStart = stroke.start;
        }
        for (const move of stroke.moves) {
            words.push(charged(writing, moveText(move, writing)));
        }
        current = strokeEnd(stroke);
        if (stroke.moves.length > 0 && near(subpathStart, current)) {
            words.push(charged(writing, "Z"));
            current = subpathStart;
        }
    }
    return joined(writing, words, " ");
};

const boundedWriting = (parts: readonly DrawingPart[], flipY: boolean, tolerance: number, property: string): [PathWriting, DrawingBounds | undefined] => {
    const budget = writerBudgetOf(parts);
    const bounds = drawingBounds(parts, tolerance, budget);
    const writing = { flipY, tolerance: Math.max(tolerance, LEAST_TOLERANCE_SHARE * drawingSize(bounds)), budget, property };
    if (budget.exhausted) {
        throw tooLarge(writing);
    }
    return [writing, bounds];
};

export const pathDataOf = (path: DrawingPath, options: SvgPathOptions): string => {
    const part: DrawingPart = { layer: DEFAULT_LAYER, color: PATH_COLOR, lineType: Inputs.IO.lineTypeEnum.continuous, paths: [path] };
    return pathText(path, boundedWriting([part], options.flipY, options.tolerance, options.property)[0]);
};

const escaped = (text: string): string => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const viewSpanOf = (from: number, extent: number, margin: number, least: number): ViewSpan => {
    const span = extent + 2 * margin;
    return span >= least ? { from: from - margin, span } : { from: from - margin - (least - span) / 2, span: least };
};

const layersOf = (parts: readonly DrawingPart[]): SvgLayer[] => {
    const layers = new Map<string, SvgLayer>();
    const taken = new Set<string>();
    const nextSuffix = new Map<string, number>();
    for (const part of parts) {
        const key = part.layer.toUpperCase();
        const known = layers.get(key);
        if (known !== undefined) {
            known.parts.push(part);
            continue;
        }
        const base = `layer-${part.layer.replace(ID_UNSAFE, "-")}`;
        let id = base;
        if (taken.has(id)) {
            let count = nextSuffix.get(base) ?? 2;
            while (taken.has(`${base}-${count}`)) {
                count++;
            }
            id = `${base}-${count}`;
            nextSuffix.set(base, count + 1);
        }
        taken.add(id);
        layers.set(key, { id, label: part.layer, parts: [part] });
    }
    return [...layers.values()];
};

const dashText = (lineType: Inputs.IO.lineTypeEnum, unit: number): string => {
    const elements = LINE_TYPE_PATTERNS[lineType]!.elements;
    return elements.length === 0 ? "" : ` stroke-dasharray="${elements.map(element => svgNumber(Math.abs(element) * unit)).join(" ")}"`;
};

export const svgDocumentOf = (parts: readonly DrawingPart[], options: SvgDocumentOptions): string => {
    const [writing, bounds] = boundedWriting(parts, true, options.tolerance, options.property);
    const size = drawingSize(bounds);
    const margin = options.margin ?? size * MARGIN_SHARE;
    const strokeWidth = Math.max(options.strokeWidth ?? size * STROKE_SHARE, LEAST_VIEW_SPAN);
    const across = viewSpanOf(bounds?.min[0] ?? 0, bounds === undefined ? 0 : bounds.max[0] - bounds.min[0], margin, strokeWidth);
    const down = viewSpanOf(-(bounds?.max[1] ?? 0), bounds === undefined ? 0 : bounds.max[1] - bounds.min[1], margin, strokeWidth);
    const unit = options.unit === undefined ? undefined : SVG_UNITS[options.unit];
    const sized = unit === undefined ? "" : ` width="${svgNumber(across.span * unit[1])}${unit[0]}" height="${svgNumber(down.span * unit[1])}${unit[0]}"`;
    const patternUnit = patternUnitOf(bounds);
    const lines = [
        "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>",
        `<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" version="1.1"${sized} viewBox="${[across.from, down.from, across.span, down.span].map(svgNumber).join(" ")}">`,
    ].map(line => charged(writing, line));
    for (const layer of layersOf(parts)) {
        lines.push(charged(writing, `  <g id="${escaped(layer.id)}" inkscape:groupmode="layer" inkscape:label="${escaped(layer.label)}" fill="none" stroke-width="${svgNumber(strokeWidth)}" stroke-linecap="round" stroke-linejoin="round">`));
        for (const part of layer.parts) {
            lines.push(charged(writing, `    <g stroke="${part.color}"${dashText(part.lineType, patternUnit)}>`));
            for (const path of part.paths) {
                const data = pathText(path, writing);
                if (data !== "") {
                    lines.push(charged(writing, `      <path d="${data}"/>`, data.length));
                }
            }
            lines.push(charged(writing, "    </g>"));
        }
        lines.push(charged(writing, "  </g>"));
    }
    lines.push(charged(writing, "</svg>"), "");
    return joined(writing, lines, "\n");
};
