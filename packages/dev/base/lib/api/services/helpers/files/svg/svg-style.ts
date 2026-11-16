import type { CssDeclaration, CssMatches } from "./svg-css";
import { parseDeclarations } from "./svg-css";
import { remembered } from "./svg-memo";
import type { SvgStyle } from "./svg-scene-types";
import type { SvgLength, ViewportSize } from "./svg-numbers";
import { pixelsOf, readLength } from "./svg-numbers";
import type { XmlNode } from "./svg-xml";
import { COLOR_PARTS_WITH_ALPHA, MAX_DASH_VALUES, PERCENT } from "./svg-reader.constants";

export type StyleProps = Record<string, string>;

export interface StyleState {
    props: StyleProps;
    opacity: number;
    opacitySet: boolean;
    displayNone: boolean;
}

export interface StyleReadings {
    opacity: (text: string | undefined) => number | undefined;
    length: (text: string | undefined) => SvgLength | undefined;
    dashes: (text: string | undefined) => readonly SvgLength[] | undefined;
    paintsNothing: (paint: string) => boolean;
}

interface Candidate {
    value: string;
    rank: number;
    order: number;
}

const PRESENTATION_PROPERTIES = [
    "fill", "stroke", "stroke-width", "stroke-dasharray", "opacity", "fill-opacity", "stroke-opacity",
    "fill-rule", "display", "visibility", "color", "clip-path", "mask",
];
export const STYLE_PROPERTIES: ReadonlySet<string> = new Set([...PRESENTATION_PROPERTIES, "transform"]);
const INHERITED = ["fill", "stroke", "stroke-width", "stroke-dasharray", "fill-opacity", "stroke-opacity", "fill-rule", "visibility", "color"];
const DASH_SEPARATORS = /\s*,\s*|\s+/;
const DEFAULT_COLOR = "black";

const RANK_ATTRIBUTE = 0;
const RANK_SHEET = 1;
const RANK_INLINE = 2;
const RANK_SHEET_IMPORTANT = 3;
const RANK_INLINE_IMPORTANT = 4;

export const INITIAL_STYLE: StyleState = { props: {}, opacity: 1, opacitySet: false, displayNone: false };

export const isKeyword = (value: string | undefined, keyword: string): boolean =>
    value !== undefined && value.length === keyword.length && value.toLowerCase() === keyword;

const outranks = (a: Candidate, b: Candidate): boolean => a.rank !== b.rank ? a.rank > b.rank : a.order >= b.order;

function offer(winners: Map<string, Candidate>, property: string, candidate: Candidate): void {
    if (!STYLE_PROPERTIES.has(property)) { return; }
    const current = winners.get(property);
    if (!current || outranks(candidate, current)) { winners.set(property, candidate); }
}

export function specifiedValues(node: XmlNode, css: CssMatches): StyleProps {
    const winners = new Map<string, Candidate>();
    for (const property of PRESENTATION_PROPERTIES) {
        const value = node.attrs[property];
        if (value !== undefined && value.trim() !== "") { offer(winners, property, { value: value.trim(), rank: RANK_ATTRIBUTE, order: 0 }); }
    }
    for (const match of css.get(node) ?? []) {
        offer(winners, match.declaration.property, {
            value: match.declaration.value,
            rank: match.declaration.important ? RANK_SHEET_IMPORTANT : RANK_SHEET,
            order: match.order,
        });
    }
    parseDeclarations(node.attrs["style"]).forEach((declaration: CssDeclaration, order: number) => {
        offer(winners, declaration.property, { value: declaration.value, rank: declaration.important ? RANK_INLINE_IMPORTANT : RANK_INLINE, order });
    });
    const values: StyleProps = {};
    winners.forEach((candidate, property) => { values[property] = candidate.value; });
    return values;
}

export function parseOpacity(value: string): number | undefined {
    const trimmed = value.trim();
    const number = parseFloat(trimmed);
    if (Number.isNaN(number)) { return undefined; }
    const fraction = trimmed.endsWith("%") ? number / PERCENT : number;
    return Math.min(1, Math.max(0, fraction));
}

export function computeStyle(specified: StyleProps, parent: StyleState, readings: StyleReadings): StyleState {
    const props: StyleProps = {};
    for (const property of INHERITED) {
        const inherited = parent.props[property];
        if (inherited !== undefined) { props[property] = inherited; }
    }
    for (const property of Object.keys(specified)) {
        const value = specified[property]!;
        const fromParent = parent.props[property];
        if (isKeyword(value, "inherit") || (isKeyword(value, "unset") && INHERITED.includes(property))) {
            if (fromParent === undefined) { delete props[property]; } else { props[property] = fromParent; }
        } else if (isKeyword(value, "initial") || isKeyword(value, "unset")) {
            delete props[property];
        } else if (property === "color" && isKeyword(value, "currentcolor")) {
            if (parent.props["color"] === undefined) { delete props["color"]; } else { props["color"] = parent.props["color"]; }
        } else {
            props[property] = value;
        }
    }
    const own = readings.opacity(props["opacity"]);
    return {
        props,
        opacity: parent.opacity * (own ?? 1),
        opacitySet: parent.opacitySet || own !== undefined,
        displayNone: parent.displayNone || isKeyword(props["display"], "none"),
    };
}

function parseDashArray(text: string): SvgLength[] | undefined {
    const trimmed = text.trim();
    if (trimmed === "" || isKeyword(trimmed, "none")) { return undefined; }
    const lengths: SvgLength[] = [];
    for (const token of trimmed.split(DASH_SEPARATORS)) {
        const length = readLength(token);
        if (length === undefined || length.value < 0) { return undefined; }
        lengths.push(length);
    }
    return lengths.some((length) => length.value > 0) ? lengths : undefined;
}

function dashArrayOf(dashes: readonly SvgLength[] | undefined, viewport: ViewportSize, strokeScale: number): number[] | undefined {
    if (dashes === undefined || dashes.length > MAX_DASH_VALUES) { return undefined; }
    const scaled = dashes.map((dash) => pixelsOf(dash, viewport, "other") * strokeScale);
    return dashes.length % 2 === 0 ? scaled : scaled.concat(scaled);
}

function paint(value: string | undefined, props: StyleProps): string | undefined {
    if (value === undefined) { return undefined; }
    return isKeyword(value, "currentcolor") ? props["color"] ?? DEFAULT_COLOR : value;
}

export function toSvgStyle(state: StyleState, viewport: ViewportSize, strokeScale: number, readings: StyleReadings): SvgStyle {
    const props = state.props;
    const style: SvgStyle = {};
    const fill = paint(props["fill"], props);
    if (fill !== undefined) { style.fill = fill; }
    const stroke = paint(props["stroke"], props);
    if (stroke !== undefined) { style.stroke = stroke; }
    const strokeWidth = readings.length(props["stroke-width"]);
    if (strokeWidth !== undefined) { style.strokeWidth = pixelsOf(strokeWidth, viewport, "other") * strokeScale; }
    const dashArray = dashArrayOf(readings.dashes(props["stroke-dasharray"]), viewport, strokeScale);
    if (dashArray !== undefined) { style.strokeDashArray = dashArray; }
    if (state.opacitySet) { style.opacity = state.opacity; }
    const fillOpacity = readings.opacity(props["fill-opacity"]);
    if (fillOpacity !== undefined) { style.fillOpacity = fillOpacity; }
    const strokeOpacity = readings.opacity(props["stroke-opacity"]);
    if (strokeOpacity !== undefined) { style.strokeOpacity = strokeOpacity; }
    const fillRule = props["fill-rule"];
    if (isKeyword(fillRule, "evenodd")) { style.fillRule = "evenodd"; } else if (isKeyword(fillRule, "nonzero")) { style.fillRule = "nonzero"; }
    const visibility = props["visibility"];
    if (state.displayNone || isKeyword(visibility, "hidden") || isKeyword(visibility, "collapse")) { style.hidden = true; }
    return style;
}

function isTransparent(color: string): boolean {
    const value = color.trim().toLowerCase();
    if (value === "transparent") { return true; }
    if (/^#(?:[0-9a-f]{3}0|[0-9a-f]{6}00)$/.test(value)) { return true; }
    const functional = /^(?:rgb|hsl)a?\((.*)\)$/.exec(value);
    if (!functional) { return false; }
    const parts = functional[1]!.split(/[\s,/]+/).filter((p) => p.length > 0);
    return parts.length === COLOR_PARTS_WITH_ALPHA && parseOpacity(parts[COLOR_PARTS_WITH_ALPHA - 1]!) === 0;
}

function paintsNothing(paint: string): boolean {
    return isKeyword(paint.trim(), "none") || isTransparent(paint);
}

export function styleReadings(): StyleReadings {
    const opacities = new Map<string, number | undefined>();
    const lengths = new Map<string, SvgLength | undefined>();
    const dashArrays = new Map<string, SvgLength[] | undefined>();
    const unpainted = new Map<string, boolean>();
    return {
        opacity: (text) => text === undefined ? undefined : remembered(opacities, text, parseOpacity),
        length: (text) => text === undefined ? undefined : remembered(lengths, text, readLength),
        dashes: (text) => text === undefined ? undefined : remembered(dashArrays, text, parseDashArray),
        paintsNothing: (paint) => remembered(unpainted, paint, paintsNothing),
    };
}

export function fillsArea(style: SvgStyle, readings: StyleReadings = styleReadings()): boolean {
    if (style.fill !== undefined && readings.paintsNothing(style.fill)) { return false; }
    return style.fillOpacity !== 0 && style.opacity !== 0;
}
