import { describe, expect, it } from "vitest";
import { simplex } from "../../../models/simplex";
import type { VectorFont } from "../../../models/simplex";
import type { StrokeGlyph } from "../helper-types";
import { strokeGlyph, strokeTextAdvance } from "./stroke-font";

const QUESTION_MARK = 63;
const COMPOSED_LETTERS = 314;
const LETTERS_OF_THEIR_OWN = "ÆØßæøĐđŁłŒœ";
const tiny: VectorFont = {
    height: 10,
    63: [6, 1, 0, 1, 9],
    72: [8, 0, 0, 0, 10, undefined, 6, 0, 6, 10, undefined, 0, 5, 6, 5],
    32: [4],
};

describe("the glyphs of a stroke font", () => {
    it("should read a glyph as its advance and one list of points for each stroke", () => {
        // Act
        const glyph = strokeGlyph(tiny, "H".charCodeAt(0));

        // Assert
        expect(glyph.advance).toBe(8);
        expect(glyph.strokes).toEqual([[[0, 0], [0, 10]], [[6, 0], [6, 10]], [[0, 5], [6, 5]]]);
    });

    it("should give a space its advance and no stroke", () => {
        // Act
        const glyph = strokeGlyph(tiny, " ".charCodeAt(0));

        // Assert
        expect(glyph).toEqual({ advance: 4, strokes: [] });
    });

    it("should draw a question mark for a character the font does not hold, for no character and for a code of 0", () => {
        // Arrange
        const mark = strokeGlyph(tiny, QUESTION_MARK);

        // Act
        const drawn = [strokeGlyph(tiny, "Z".charCodeAt(0)), strokeGlyph(tiny, "".charCodeAt(0)), strokeGlyph(tiny, 0), strokeGlyph(tiny, 128512)];

        // Assert
        expect(mark).toEqual({ advance: 6, strokes: [[[1, 0], [1, 9]]] });
        expect(drawn).toEqual([mark, mark, mark, mark]);
    });

    it("should read a glyph once for each font and never mix two fonts", () => {
        // Arrange
        const other: VectorFont = { height: 10, 63: [2], 72: [3, 0, 0, 1, 1] };

        // Act
        const first = strokeGlyph(tiny, 72);
        const again = strokeGlyph(tiny, 72);
        const elsewhere = strokeGlyph(other, 72);

        // Assert
        expect(again).toBe(first);
        expect(elsewhere).toEqual({ advance: 3, strokes: [[[0, 0], [1, 1]]] });
    });

    it("should draw an accented letter as its letter with the mark above it, at the letter's advance", () => {
        // Arrange
        const letter = strokeGlyph(simplex, "c".charCodeAt(0));

        // Act
        const accented = strokeGlyph(simplex, "č".charCodeAt(0));

        // Assert
        expect(accented.advance).toBe(letter.advance);
        expect(accented.strokes.slice(0, letter.strokes.length)).toEqual(letter.strokes);
        expect(accented.strokes.slice(letter.strokes.length)).toEqual([[[6, 19.25], [9, 15.25], [12, 19.25]]]);
    });

    it("should flatten a mark over a capital so that it ends at the font's highest ink", () => {
        // Act
        const accented = strokeGlyph(simplex, "Č".charCodeAt(0));

        // Assert
        expect(accented.strokes.at(-1)).toEqual([[7.5, 25], [10.5, 22.25], [13.5, 25]]);
    });

    it("should hang an ogonek from the letter's last foot on the baseline and a cedilla from the middle of its feet", () => {
        // Act
        const hooked = strokeGlyph(simplex, "ą".charCodeAt(0)).strokes.at(-1);
        const tailed = strokeGlyph(simplex, "ç".charCodeAt(0)).strokes.at(-1);

        // Assert
        expect(hooked?.[0]).toEqual([15, 0]);
        expect(hooked?.at(-1)).toEqual([17, -5]);
        expect(tailed?.[0]).toEqual([9.5, 0]);
    });

    it("should take the dot off an i or a j under a mark above, and keep it over a mark below", () => {
        // Arrange
        const stem = [[4, 14], [4, 0]];
        const dot = strokeGlyph(simplex, "i".charCodeAt(0)).strokes[0];

        // Act
        const acute = strokeGlyph(simplex, "í".charCodeAt(0));
        const hooked = strokeGlyph(simplex, "į".charCodeAt(0));
        const hatted = strokeGlyph(simplex, "ĵ".charCodeAt(0));

        // Assert
        expect(acute.strokes).toEqual([stem, [[3.2, 15.25], [6, 19.25]]]);
        expect(hooked.strokes.slice(0, 2)).toEqual([dot, stem]);
        expect(hooked.strokes).toHaveLength(3);
        expect(hatted.strokes).toHaveLength(2);
        expect(hatted.strokes[0]?.[0]).toEqual([6, 14]);
    });

    it("should compose a letter with one mark above and one below, and draw a question mark for two marks above", () => {
        // Arrange
        const mark = strokeGlyph(simplex, QUESTION_MARK);
        const plain = strokeGlyph(simplex, "o".charCodeAt(0));

        // Act
        const both = strokeGlyph(simplex, "ǭ".charCodeAt(0));
        const stacked = strokeGlyph(simplex, "ấ".charCodeAt(0));

        // Assert
        expect(both.strokes).toHaveLength(plain.strokes.length + 2);
        expect(stacked).toBe(mark);
    });

    it("should draw every Lithuanian letter, and a question mark for a letter no mark composes and for a mark on its own", () => {
        // Arrange
        const mark = strokeGlyph(simplex, QUESTION_MARK);

        // Act
        const drawn = [..."ąčęėįšųūžĄČĘĖĮŠŲŪŽ"].map(letter => strokeGlyph(simplex, letter.charCodeAt(0)));
        const refused = [..."Ðþŋ\u030C\u212A"].map(letter => strokeGlyph(simplex, letter.charCodeAt(0)));

        // Assert
        expect(drawn.filter(glyph => glyph === mark)).toEqual([]);
        expect(refused.filter(glyph => glyph !== mark)).toEqual([]);
    });

    it("should keep every letter drawn beyond the font's own glyphs inside the height those reach, a composed one at its letter's advance", () => {
        // Arrange
        const own = Object.keys(simplex).filter(key => key !== "height").map(Number);
        const heights = own.flatMap(code => strokeGlyph(simplex, code).strokes.flat().map(point => point[1]));
        const lowest = Math.min(...heights);
        const highest = Math.max(...heights);
        const mark = strokeGlyph(simplex, QUESTION_MARK);

        // Act
        const beyond = Array.from({ length: 0x10000 - 0x80 }, (_unit, index) => index + 0x80)
            .filter(code => !own.includes(code))
            .map(code => ({ code, glyph: strokeGlyph(simplex, code) }))
            .filter(({ glyph }) => glyph !== mark);
        const composed = beyond.filter(({ code }) => String.fromCharCode(code).normalize("NFD").length > 1);
        const undecomposed = beyond.filter(({ code }) => String.fromCharCode(code).normalize("NFD").length === 1);
        const outside = beyond.filter(({ glyph }) => glyph.strokes.flat().some(point => point[1] < lowest || point[1] > highest));
        const wider = beyond.filter(({ glyph }) => glyph.strokes.flat().some(point => point[0] < 0 || point[0] > glyph.advance));
        const moved = composed.filter(({ code, glyph }) => glyph.advance !== strokeGlyph(simplex, String.fromCharCode(code).normalize("NFD").charCodeAt(0)).advance);

        // Assert
        expect([lowest, highest]).toEqual([-7, 25]);
        expect(composed.length).toBe(COMPOSED_LETTERS);
        expect(String.fromCharCode(...undecomposed.map(({ code }) => code))).toBe(LETTERS_OF_THEIR_OWN);
        expect(outside.map(({ code }) => code)).toEqual([]);
        expect(wider.map(({ code }) => code)).toEqual([]);
        expect(moved.map(({ code }) => code)).toEqual([]);
    });

    it("should draw Ø, Ł and Đ and their small letters as their letter with one stroke across it, at the letter's advance", () => {
        // Arrange
        const plain = [..."OoLlDd"].map(letter => strokeGlyph(simplex, letter.charCodeAt(0)));

        // Act
        const crossed = [..."ØøŁłĐđ"].map(letter => strokeGlyph(simplex, letter.charCodeAt(0)));

        // Assert
        expect(crossed.map(glyph => glyph.advance)).toEqual(plain.map(glyph => glyph.advance));
        expect(crossed.map(glyph => glyph.strokes.slice(0, -1))).toEqual(plain.map(glyph => glyph.strokes));
        expect(crossed.map(glyph => glyph.strokes.at(-1))).toEqual([
            [[4, -1], [18, 22]],
            [[3, -1], [16, 15]],
            [[1, 8], [9, 13]],
            [[1, 9], [7, 13]],
            [[1, 11], [10, 11]],
            [[11, 18], [18, 18]],
        ]);
    });

    it("should draw ß, Æ, æ, Œ and œ with strokes of their own at their own advance, on the baseline and as tall as b, A, a, O and o", () => {
        // Arrange
        const mark = strokeGlyph(simplex, QUESTION_MARK);
        const reach = (glyph: StrokeGlyph): number[] => {
            const heights = glyph.strokes.flat().map(point => point[1]);
            return [Math.min(...heights), Math.max(...heights)];
        };
        const alike = [..."bAaOo"].map(letter => strokeGlyph(simplex, letter.charCodeAt(0)));

        // Act
        const drawn = [..."ßÆæŒœ"].map(letter => strokeGlyph(simplex, letter.charCodeAt(0)));

        // Assert
        expect(drawn.filter(glyph => glyph === mark)).toEqual([]);
        expect(drawn.map(glyph => glyph.advance)).toEqual([20, 23, 30, 26, 31]);
        expect(drawn.map(reach)).toEqual(alike.map(reach));
        expect(drawn.map(glyph => glyph.strokes.filter(stroke => stroke.length < 2))).toEqual([[], [], [], [], []]);
    });

    it("should measure a text holding the letters of their own as the sum of their advances", () => {
        // Act
        const advance = strokeTextAdvance(simplex, "Øłß Æœđ");

        // Assert
        expect(advance).toBe((22 + 8 + 20 + 16 + 23 + 31 + 19) / 21);
    });

    it("should scale a letter of its own to the font's height, hold a stroke across a letter inside the font's ink, and draw a question mark when the font lacks the letter", () => {
        // Arrange
        const boxed: VectorFont = { height: 42, 63: [12, 2, 0, 2, 40], 79: [44, 6, 0, 6, 42, 38, 42, 38, 0, 6, 0] };
        const mark = strokeGlyph(tiny, QUESTION_MARK);

        // Act
        const slashed = strokeGlyph(boxed, "Ø".charCodeAt(0));
        const sharp = strokeGlyph(boxed, "ß".charCodeAt(0));
        const lacking = strokeGlyph(tiny, "Ø".charCodeAt(0));

        // Assert
        expect(slashed.advance).toBe(44);
        expect(slashed.strokes.at(-1)).toEqual([[8, 0], [36, 42]]);
        expect(sharp.advance).toBe(40);
        expect(sharp.strokes[0]?.slice(0, 2)).toEqual([[8, 0], [8, 34]]);
        expect(lacking).toBe(mark);
    });

    it("should read every glyph of the simplex font as strokes of two or more points, but a dot's", () => {
        // Arrange
        const codes = Object.keys(simplex).filter(key => key !== "height").map(Number);

        // Act
        const glyphs = codes.map(code => ({ code, glyph: strokeGlyph(simplex, code) }));
        const points = glyphs.flatMap(({ glyph }) => glyph.strokes.flat());

        // Assert
        expect(codes.length).toBeGreaterThan(90);
        expect(glyphs.filter(({ glyph }) => !(glyph.advance > 0)).map(({ code }) => code)).toEqual([]);
        expect(glyphs.filter(({ glyph }) => glyph.strokes.some(stroke => stroke.length === 0)).map(({ code }) => code)).toEqual([]);
        expect(points.filter(point => !Number.isFinite(point[0]) || !Number.isFinite(point[1]))).toEqual([]);
    });
});
