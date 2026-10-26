import type * as Inputs from "../../api/inputs";
import type { Bounds, DrawingLine } from "./svg-drawing-types";
import { DASH_STROKES, GAP_STROKES, MARGIN_SHARE, SIGNIFICANT_DIGITS, STROKE_SHARE, SVG_LENGTHS } from "./svg-drawing.constants";

function boundsOf(lines: readonly DrawingLine[]): Bounds {
    const bounds: Bounds = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
    lines.forEach(line => line.forEach(([x, y]) => {
        bounds.minX = Math.min(bounds.minX, x);
        bounds.maxX = Math.max(bounds.maxX, x);
        bounds.minY = Math.min(bounds.minY, -y);
        bounds.maxY = Math.max(bounds.maxY, -y);
    }));
    return bounds.minX === Infinity ? { minX: 0, minY: 0, maxX: 0, maxY: 0 } : bounds;
}

/**
 * The text of an SVG drawing of lines given in a plane whose y runs up, in model units: the visible
 * lines solid, the hidden ones dashed beneath them. SVG's y runs down, so every y is written negated
 * and the drawing reads the right way up; x is written as it is. The view box is the drawing's
 * bounds with a border of a fortieth of its larger side, strokes are a four-hundredth of that side
 * wide, and a line with fewer than two points is left out. Given the unit the model is in, the
 * drawing also states its width and height in it, metres written as centimetres, which SVG has.
 */
export function svgOfDrawing(visible: readonly DrawingLine[], hidden: readonly DrawingLine[], unit?: `${Inputs.Base.unitOfLengthEnum}`): string {
    const drawn = (lines: readonly DrawingLine[]): DrawingLine[] => lines.filter(line => line.length > 1);
    const visibleLines = drawn(visible);
    const hiddenLines = drawn(hidden);
    const bounds = boundsOf([...visibleLines, ...hiddenLines]);
    const larger = Math.max(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY);
    const size = larger > 0 ? larger : 1;
    const decimals = Math.min(15, Math.max(0, SIGNIFICANT_DIGITS - 1 - Math.floor(Math.log10(size))));
    const number = (value: number): string => {
        const rounded = Number(value.toFixed(decimals));
        return String(Object.is(rounded, -0) ? 0 : rounded);
    };
    const stroke = size * STROKE_SHARE;
    const margin = size * MARGIN_SHARE;
    const viewBox = [bounds.minX - margin, bounds.minY - margin, bounds.maxX - bounds.minX + 2 * margin, bounds.maxY - bounds.minY + 2 * margin];
    const path = (line: DrawingLine): string =>
        `<path d="${line.map(([x, y], at) => `${at === 0 ? "M" : "L"}${number(x)} ${number(-y)}`).join(" ")}"/>`;
    const group = (id: string, lines: DrawingLine[], dashed: boolean): string[] => lines.length === 0 ? [] : [
        `<g id="${id}" fill="none" stroke="#000000" stroke-width="${number(stroke)}" stroke-linecap="round" stroke-linejoin="round"${dashed ? ` stroke-dasharray="${number(stroke * DASH_STROKES)} ${number(stroke * GAP_STROKES)}"` : ""}>`,
        ...lines.map(path),
        "</g>",
    ];
    const length = unit === undefined ? undefined : SVG_LENGTHS[unit];
    const physical = (value: number): string => `${String(Number((value * length!.factor).toPrecision(SIGNIFICANT_DIGITS)))}${length!.unit}`;
    const sized = length === undefined ? "" : ` width="${physical(viewBox[2]!)}" height="${physical(viewBox[3]!)}"`;
    return [
        `<svg xmlns="http://www.w3.org/2000/svg"${sized} viewBox="${viewBox.map(number).join(" ")}">`,
        ...group("hidden", hiddenLines, true),
        ...group("visible", visibleLines, false),
        "</svg>",
        "",
    ].join("\n");
}
