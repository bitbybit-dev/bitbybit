import * as Inputs from "../../../../inputs";
import { InputError } from "../../../../kernel-calls";
import { angleWithinTurn } from "../../curves/conic-arcs";
import { degreesOf } from "../../geometry/scalars";
import { crc32 } from "../crc32";
import { drawingBounds, drawingSize, meetsReversed, patternUnitOf, pointsMeet } from "../drawing/drawing-geometry";
import { writerBudgetOf } from "../drawing/drawing-budget";
import { hatchFamiliesOf } from "../drawing/drawing-hatch";
import { textStrokesOf } from "../drawing/drawing-text";
import type { DrawingBounds, DrawingHatch, DrawingPart, DrawingPath, DrawingText } from "../drawing/drawing-types";
import { DEFAULT_LAYER, FULL_TURN_DEGREES, LEAST_TOLERANCE_SHARE, LINE_TYPE_PATTERNS, QUARTER_TURN_DEGREES } from "../drawing/drawing.constants";
import type { WorkBudget } from "../work-budget";
import { reversedStroke, strokeEnd, strokeOf } from "./svg-strokes";
import type { SvgMove, SvgStroke } from "./svg-strokes";
import { ID_UNSAFE, LEAST_VIEW_SPAN, MARGIN_SHARE, PATH_COLOR, PATTERN_ID_DIGITS, PATTERN_ID_RADIX, STROKE_SHARE, SVG_DECIMALS, SVG_UNITS, TRAILING_FRACTION_ZEROS } from "./svg.constants";

type Point2 = Inputs.Base.Point2;

export interface SvgDocumentOptions {
    readonly unit: string | undefined;
    readonly strokeWidth: number | undefined;
    readonly margin: number | undefined;
    readonly lineTypeScale: number | undefined;
    readonly tolerance: number;
    readonly property: string;
}

export interface SvgPathOptions {
    readonly flipY: boolean;
    readonly cubicsOnly: boolean;
    readonly tolerance: number;
    readonly property: string;
}

interface PathWriting {
    readonly flipY: boolean;
    readonly cubicsOnly: boolean;
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

interface SvgPatterns {
    readonly ids: Map<string, string>;
    readonly taken: Set<string>;
    readonly definitions: string[];
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

const pathText = (path: DrawingPath, writing: PathWriting): string => {
    const words: string[] = [];
    let current: Point2 | undefined;
    let subpathStart: Point2 | undefined;
    for (const segment of path.segments) {
        let stroke: SvgStroke = strokeOf(segment, writing.tolerance, writing.budget, writing.cubicsOnly);
        if (writing.budget.exhausted) {
            throw tooLarge(writing);
        }
        if (!stroke.closed && meetsReversed(current, stroke.start, strokeEnd(stroke))) {
            stroke = reversedStroke(stroke);
        }
        if (!pointsMeet(current, stroke.start)) {
            words.push(charged(writing, `M${pointText(stroke.start, writing)}`));
            subpathStart = stroke.start;
        }
        for (const move of stroke.moves) {
            words.push(charged(writing, moveText(move, writing)));
        }
        current = strokeEnd(stroke);
        if (stroke.moves.length > 0 && pointsMeet(subpathStart, current)) {
            words.push(charged(writing, "Z"));
            current = subpathStart;
        }
    }
    return joined(writing, words, " ");
};

const boundedWriting = (parts: readonly DrawingPart[], flipY: boolean, tolerance: number, property: string, cubicsOnly = false): [PathWriting, DrawingBounds | undefined] => {
    const budget = writerBudgetOf(parts);
    const bounds = drawingBounds(parts, tolerance, budget);
    const writing = { flipY, cubicsOnly, tolerance: Math.max(tolerance, LEAST_TOLERANCE_SHARE * drawingSize(bounds)), budget, property };
    if (budget.exhausted) {
        throw tooLarge(writing);
    }
    return [writing, bounds];
};

export const pathDataOf = (path: DrawingPath, options: SvgPathOptions): string => {
    const part: DrawingPart = { layer: DEFAULT_LAYER, color: PATH_COLOR, lineType: Inputs.IO.lineTypeEnum.continuous, lineWeight: undefined, paths: [path], texts: [], hatches: [] };
    return pathText(path, boundedWriting([part], options.flipY, options.tolerance, options.property, options.cubicsOnly)[0]);
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

const patternLines = (hatch: DrawingHatch): string => {
    const side = svgNumber(hatch.spacing);
    return hatchFamiliesOf(hatch).map(family => {
        const at = svgNumber(hatch.spacing - family.phase);
        return family.turn === QUARTER_TURN_DEGREES ? `<line x1="${at}" y1="0" x2="${at}" y2="${side}"/>` : `<line x1="0" y1="${at}" x2="${side}" y2="${at}"/>`;
    }).join("");
};

const patternIdOf = (key: string, taken: ReadonlySet<string>): string => {
    const named = `hatch-${crc32(Uint8Array.from(key, character => character.charCodeAt(0))).toString(PATTERN_ID_RADIX).padStart(PATTERN_ID_DIGITS, "0")}`;
    let id = named;
    for (let count = 2; taken.has(id); count++) {
        id = `${named}-${count}`;
    }
    return id;
};

const lineWeightText = (weight: number): string => svgNumber(Math.max(weight, LEAST_VIEW_SPAN));

const hatchFillOf = (hatch: DrawingHatch, part: DrawingPart, strokeWidth: number, patterns: SvgPatterns, writing: PathWriting): string => {
    if (hatch.pattern === Inputs.IO.hatchPatternEnum.solid) {
        return part.color;
    }
    const weight = lineWeightText(part.lineWeight ?? strokeWidth);
    const side = svgNumber(hatch.spacing);
    const turn = svgNumber(-angleWithinTurn(hatch.angle, FULL_TURN_DEGREES));
    const key = [hatch.pattern, side, turn, part.color, weight].join(" ");
    let id = patterns.ids.get(key);
    if (id === undefined) {
        id = patternIdOf(key, patterns.taken);
        patterns.ids.set(key, id);
        patterns.taken.add(id);
        patterns.definitions.push(charged(writing, `    <pattern id="${id}" patternUnits="userSpaceOnUse" width="${side}" height="${side}" patternTransform="rotate(${turn})"><g fill="none" stroke="${part.color}" stroke-width="${weight}">${patternLines(hatch)}</g></pattern>`));
    }
    return `url(#${id})`;
};

const checkSpacings = (parts: readonly DrawingPart[], property: string): void => {
    parts.forEach((part, at) => part.hatches.forEach((hatch, index) => {
        if (hatch.pattern !== Inputs.IO.hatchPatternEnum.solid && hatch.spacing < LEAST_VIEW_SPAN) {
            const named = `${property}[${at}].hatches[${index}].spacing`;
            throw new InputError(`\`${named}\` is ${hatch.spacing}, finer than ${svgNumber(LEAST_VIEW_SPAN)}, the finest an SVG file draws here.`, named);
        }
    }));
};

const hatchText = (hatch: DrawingHatch, part: DrawingPart, strokeWidth: number, patterns: SvgPatterns, writing: PathWriting): string => {
    const data = joined(writing, hatch.boundaries.map(boundary => pathText(boundary, writing)).filter(text => text !== ""), " ");
    return data === "" ? "" : charged(writing, `      <path d="${data}" fill="${hatchFillOf(hatch, part, strokeWidth, patterns, writing)}" fill-rule="evenodd" stroke="none"/>`, data.length);
};

const textText = (text: DrawingText, writing: PathWriting): string => {
    const words: string[] = [];
    for (const stroke of textStrokesOf(text)) {
        stroke.forEach((point, at) => words.push(charged(writing, `${at === 0 ? "M" : "L"}${pointText([point[0], point[1]], writing)}`)));
    }
    const data = joined(writing, words, " ");
    return data === "" ? "" : charged(writing, `      <path d="${data}"/>`, data.length);
};

export const svgDocumentOf = (parts: readonly DrawingPart[], options: SvgDocumentOptions): string => {
    checkSpacings(parts, options.property);
    const [writing, bounds] = boundedWriting(parts, true, options.tolerance, options.property);
    const size = drawingSize(bounds);
    const margin = options.margin ?? size * MARGIN_SHARE;
    const strokeWidth = Math.max(options.strokeWidth ?? size * STROKE_SHARE, LEAST_VIEW_SPAN);
    const across = viewSpanOf(bounds?.min[0] ?? 0, bounds === undefined ? 0 : bounds.max[0] - bounds.min[0], margin, strokeWidth);
    const down = viewSpanOf(-(bounds?.max[1] ?? 0), bounds === undefined ? 0 : bounds.max[1] - bounds.min[1], margin, strokeWidth);
    const unit = options.unit === undefined ? undefined : SVG_UNITS[options.unit];
    const sized = unit === undefined ? "" : ` width="${svgNumber(across.span * unit[1])}${unit[0]}" height="${svgNumber(down.span * unit[1])}${unit[0]}"`;
    const patternUnit = options.lineTypeScale ?? patternUnitOf(bounds);
    const patterns: SvgPatterns = { ids: new Map<string, string>(), taken: new Set<string>(), definitions: [] };
    const head = [
        "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>",
        `<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" version="1.1"${sized} viewBox="${[across.from, down.from, across.span, down.span].map(svgNumber).join(" ")}">`,
    ].map(line => charged(writing, line));
    const body: string[] = [];
    for (const layer of layersOf(parts)) {
        body.push(charged(writing, `  <g id="${escaped(layer.id)}" inkscape:groupmode="layer" inkscape:label="${escaped(layer.label)}" fill="none" stroke-width="${svgNumber(strokeWidth)}" stroke-linecap="round" stroke-linejoin="round">`));
        for (const part of layer.parts) {
            const weight = part.lineWeight === undefined ? "" : ` stroke-width="${lineWeightText(part.lineWeight)}"`;
            body.push(charged(writing, `    <g stroke="${part.color}"${weight}${dashText(part.lineType, patternUnit)}>`));
            for (const hatch of part.hatches) {
                const line = hatchText(hatch, part, strokeWidth, patterns, writing);
                if (line !== "") {
                    body.push(line);
                }
            }
            for (const path of part.paths) {
                const data = pathText(path, writing);
                if (data !== "") {
                    body.push(charged(writing, `      <path d="${data}"/>`, data.length));
                }
            }
            const texts = part.texts.map(text => textText(text, writing)).filter(line => line !== "");
            const dashed = texts.length > 0 && part.lineType !== Inputs.IO.lineTypeEnum.continuous;
            if (dashed) {
                body.push(charged(writing, "      <g stroke-dasharray=\"none\">"));
            }
            for (const line of texts) {
                body.push(dashed ? `  ${line}` : line);
            }
            if (dashed) {
                body.push(charged(writing, "      </g>"));
            }
            body.push(charged(writing, "    </g>"));
        }
        body.push(charged(writing, "  </g>"));
    }
    const definitions = patterns.definitions.length === 0 ? [] : [charged(writing, "  <defs>")].concat(patterns.definitions, [charged(writing, "  </defs>")]);
    return joined(writing, head.concat(definitions, body, [charged(writing, "</svg>"), ""]), "\n");
};
