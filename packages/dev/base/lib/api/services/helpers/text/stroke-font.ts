import type { VectorFont } from "../../../models/simplex";
import type { StrokeComposition, StrokeFontFacts, StrokeFontInk, StrokeGlyph, StrokePoint } from "../helper-types";
import { STROKE_LETTERS } from "./stroke-letters.constants";
import { BASELINE_REACH, FIRST_COMPOSED, FULL_MARK_ADVANCE, LAST_UNIT, LEAST_RISE_SHARE, MARK_GAP, MARK_RISE, MOST_UNITS, OGONEK, SOFT_DOTTED, SOFT_DOT_FLOOR, STROKE_MARKS, UNKNOWN_GLYPH } from "./stroke-marks.constants";

const HALF = 2;

const facts = new WeakMap<VectorFont, StrokeFontFacts>();

function strokesOf(points: readonly (number | undefined)[]): StrokePoint[][] {
    const strokes: StrokePoint[][] = [];
    let stroke: StrokePoint[] = [];
    let at = 0;
    while (at < points.length) {
        const x = points[at];
        if (x === undefined) {
            strokes.push(stroke);
            stroke = [];
            at += 1;
            continue;
        }
        stroke.push([x, points[at + 1]!]);
        at += 2;
    }
    if (stroke.length > 0) {
        strokes.push(stroke);
    }
    return strokes;
}

function readGlyph(font: VectorFont, code: number): StrokeGlyph {
    const [advance = 0, ...points] = font[code]!;
    return { advance, strokes: strokesOf(points) };
}

function factsOf(font: VectorFont): StrokeFontFacts {
    const known = facts.get(font);
    if (known !== undefined) {
        return known;
    }
    let highest = -Infinity;
    let lowest = Infinity;
    for (const key of Object.keys(font)) {
        const code = Number(key);
        if (!Number.isInteger(code)) {
            continue;
        }
        for (const stroke of readGlyph(font, code).strokes) {
            for (const point of stroke) {
                highest = Math.max(highest, point[1]);
                lowest = Math.min(lowest, point[1]);
            }
        }
    }
    const read: StrokeFontFacts = { lowest, highest, glyphs: new Map<number, StrokeGlyph>() };
    facts.set(font, read);
    return read;
}

function compositionOf(font: VectorFont, code: number): StrokeComposition | undefined {
    if (!Number.isInteger(code) || code < FIRST_COMPOSED || code > LAST_UNIT) {
        return undefined;
    }
    const units = String.fromCharCode(code).normalize("NFD");
    if (units.length < 2 || units.length > MOST_UNITS) {
        return undefined;
    }
    const base = units.charCodeAt(0);
    if (font[base] === undefined) {
        return undefined;
    }
    let above: number | undefined;
    let below: number | undefined;
    for (let at = 1; at < units.length; at += 1) {
        const mark = units.charCodeAt(at);
        if (above === undefined && STROKE_MARKS.above[mark] !== undefined) {
            above = mark;
        } else if (below === undefined && STROKE_MARKS.below[mark] !== undefined) {
            below = mark;
        } else {
            return undefined;
        }
    }
    return { base, above, below };
}

function placed(mark: readonly (number | undefined)[], x: number, y: number, wide: number, tall: number): StrokePoint[][] {
    return strokesOf(mark).map(stroke => stroke.map((point): StrokePoint => [x + point[0] * wide, y + point[1] * tall]));
}

function middleOf(points: readonly StrokePoint[]): number {
    let least = Infinity;
    let most = -Infinity;
    for (const point of points) {
        least = Math.min(least, point[0]);
        most = Math.max(most, point[0]);
    }
    return (least + most) / HALF;
}

function composedGlyph(font: VectorFont, composition: StrokeComposition): StrokeGlyph {
    const base = readGlyph(font, composition.base);
    const unit = font.height / STROKE_MARKS.height;
    const dotless = composition.above !== undefined && SOFT_DOTTED.has(composition.base);
    const kept = dotless ? base.strokes.filter(stroke => stroke.some(point => point[1] < SOFT_DOT_FLOOR * unit)) : base.strokes;
    const ink = kept.flat();
    if (ink.length === 0) {
        return base;
    }
    const strokes = [...kept];
    if (composition.above !== undefined) {
        const top = ink.reduce((most, point) => Math.max(most, point[1]), -Infinity);
        const floor = top + MARK_GAP * unit;
        const rise = Math.min(1, Math.max(LEAST_RISE_SHARE, (factsOf(font).highest - floor) / (MARK_RISE * unit)));
        const narrow = Math.min(1, base.advance / (FULL_MARK_ADVANCE * unit));
        strokes.push(...placed(STROKE_MARKS.above[composition.above]!, middleOf(ink), floor, unit * narrow, unit * rise));
    }
    if (composition.below !== undefined) {
        const mark = STROKE_MARKS.below[composition.below]!;
        const feet = ink.filter(point => Math.abs(point[1]) <= BASELINE_REACH * unit);
        const stood = feet.length > 0 ? feet : ink;
        const x = composition.below === OGONEK ? stood.reduce((most, point) => Math.max(most, point[0]), -Infinity) : middleOf(stood);
        const reach = strokesOf(mark).flat();
        const right = reach.reduce((most, point) => Math.max(most, point[0]), 0) * unit;
        const left = reach.reduce((least, point) => Math.min(least, point[0]), 0) * unit;
        const narrow = Math.min(1, right > 0 ? (base.advance - x) / right : 1, left < 0 ? x / -left : 1);
        strokes.push(...placed(mark, x, 0, unit * narrow, unit));
    }
    return { advance: base.advance, strokes };
}

function heldLetter(font: VectorFont, code: number): boolean {
    const overlay = STROKE_LETTERS.overlaid[code];
    return STROKE_LETTERS.drawn[code] !== undefined || (overlay !== undefined && font[overlay.base] !== undefined);
}

function letterGlyph(font: VectorFont, code: number): StrokeGlyph {
    const unit = font.height / STROKE_LETTERS.height;
    const { lowest, highest } = factsOf(font);
    const inked = (points: readonly (number | undefined)[]): StrokePoint[][] => placed(points, 0, 0, unit, unit)
        .map(stroke => stroke.map((point): StrokePoint => [point[0], Math.min(highest, Math.max(lowest, point[1]))]));
    const drawn = STROKE_LETTERS.drawn[code];
    if (drawn !== undefined) {
        const [advance = 0, ...points] = drawn;
        return { advance: advance * unit, strokes: inked(points) };
    }
    const overlay = STROKE_LETTERS.overlaid[code]!;
    const base = readGlyph(font, overlay.base);
    return { advance: base.advance, strokes: [...base.strokes, ...inked(overlay.strokes)] };
}

export function strokeGlyph(font: VectorFont, code: number): StrokeGlyph {
    const glyphs = factsOf(font).glyphs;
    const own = Number.isFinite(code) && code !== 0 && font[code] !== undefined;
    const lettered = !own && heldLetter(font, code);
    const composition = own || lettered ? undefined : compositionOf(font, code);
    const key = own || lettered || composition !== undefined ? code : UNKNOWN_GLYPH;
    const cached = glyphs.get(key);
    if (cached !== undefined) {
        return cached;
    }
    const glyph = lettered ? letterGlyph(font, code) : composition === undefined ? readGlyph(font, key) : composedGlyph(font, composition);
    glyphs.set(key, glyph);
    return glyph;
}

export function strokeFontInk(font: VectorFont): StrokeFontInk {
    const { lowest, highest } = factsOf(font);
    return { lowest: lowest / font.height, highest: highest / font.height };
}

export function strokeTextAdvance(font: VectorFont, text: string): number {
    let advance = 0;
    for (let unit = 0; unit < text.length; unit += 1) {
        advance += strokeGlyph(font, text.charCodeAt(unit)).advance;
    }
    return advance / font.height;
}

export function strokeTextStrokes(font: VectorFont, text: string): StrokePoint[][] {
    const strokes: StrokePoint[][] = [];
    let left = 0;
    for (let unit = 0; unit < text.length; unit += 1) {
        const glyph = strokeGlyph(font, text.charCodeAt(unit));
        const start = left;
        for (const stroke of glyph.strokes) {
            strokes.push(stroke.map((point): StrokePoint => [(start + point[0]) / font.height, point[1] / font.height]));
        }
        left += glyph.advance;
    }
    return strokes;
}
