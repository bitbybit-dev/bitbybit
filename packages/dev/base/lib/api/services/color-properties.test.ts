import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { BaseBitByBit } from "./base-bitbybit";

const base = new BaseBitByBit();
const SEED = 20261018;
const HEX_COLOR = /^#[0-9a-f]{6}$/;
const SRGB_KNEE_STEP = 1e-7;

const channel = fc.integer({ min: 0, max: 255 });
const hexOf = (r: number, g: number, b: number): string => `#${[r, g, b].map(value => value.toString(16).padStart(2, "0")).join("")}`;

describe("colours against independent oracles", () => {
    describe("hex and rgb", () => {
        it("should turn every whole-number colour into its hex and back, both ways", () => {
            // Act & Assert
            fc.assert(fc.property(channel, channel, channel, (r, g, b) => {
                const hex = base.color.rgbToHex({ r, g, b });
                expect(hex).toBe(hexOf(r, g, b));
                expect(base.color.hexToRgb({ color: hex })).toEqual({ r, g, b });
                expect(base.color.hexToRgb({ color: hex.toUpperCase() })).toEqual({ r, g, b });
            }), { seed: SEED, numRuns: 500 });
        });

        it("should give the nearest whole channel of a colour in between, on 0 to 255 as on any other range, never letting one channel spill into the next", () => {
            // Act & Assert
            fc.assert(fc.property(fc.double({ min: 0, max: 255, noNaN: true }), fc.double({ min: 0, max: 255, noNaN: true }), fc.double({ min: 0, max: 255, noNaN: true }), (r, g, b) => {
                const expected = hexOf(Math.round(r), Math.round(g), Math.round(b));
                expect(base.color.rgbToHex({ r, g, b, min: 0, max: 255 })).toBe(expected);
                expect(base.color.rgbToHex({ r: r / 255, g: g / 255, b: b / 255, min: 0, max: 1 })).toBe(expected);
            }), { seed: SEED, numRuns: 300 });
        });

        it("should always give six hex digits, holding a channel outside its range at the nearest end", () => {
            // Act & Assert
            fc.assert(fc.property(fc.double({ min: -100, max: 400, noNaN: true }), channel, channel, (r, g, b) => {
                const hex = base.color.rgbToHex({ r, g, b });
                expect(hex).toMatch(HEX_COLOR);
                expect(hex).toBe(hexOf(Math.min(255, Math.max(0, Math.round(r))), g, b));
            }), { seed: SEED, numRuns: 300 });
        });

        it("should give half of a channel in the middle of 0 to 255 as 0x80, not a carry into the next channel", () => {
            // Act
            const hex = base.color.rgbToHex({ r: 127.5, g: 0, b: 0 });

            // Assert
            expect(hex).toBe("#800000");
        });

        it("should give a red past 255 as full red, not a black that dropped the carry", () => {
            // Act
            const hex = base.color.rgbToHex({ r: 256, g: 0, b: 0 });

            // Assert
            expect(hex).toBe("#ff0000");
        });

        it("should map every hex onto any range and back to the same hex", () => {
            // Act & Assert
            fc.assert(fc.property(channel, channel, channel, fc.double({ min: -10, max: 10, noNaN: true }), fc.double({ min: 0.5, max: 100, noNaN: true }), (r, g, b, from, span) => {
                const hex = hexOf(r, g, b);
                const mapped = base.color.hexToRgbMapped({ color: hex, from, to: from + span });
                expect(base.color.rgbToHex({ ...mapped, min: from, max: from + span })).toBe(hex);
            }), { seed: SEED, numRuns: 300 });
        });

        it("should give back the colour it started from when inverted twice", () => {
            // Act & Assert
            fc.assert(fc.property(channel, channel, channel, (r, g, b) => {
                const hex = hexOf(r, g, b);
                expect(base.color.invert({ color: base.color.invert({ color: hex }) })).toBe(hex);
            }), { seed: SEED, numRuns: 300 });
        });
    });

    describe("sRGB and linear light", () => {
        it("should bring every 8-bit channel back to itself through linear light", () => {
            // Act
            const back = Array.from({ length: 256 }, (_, value) => Math.round(base.color.linearToSrgb({ channel: base.color.srgbToLinear({ channel: value / 255 }) }) * 255));

            // Assert
            expect(back).toEqual(Array.from({ length: 256 }, (_, value) => value));
        });

        it("should keep 0 and 1 where they are and bring any channel back to within a ten-millionth", () => {
            // Act & Assert
            fc.assert(fc.property(fc.double({ min: 0, max: 1, noNaN: true }), (value) => {
                expect(Math.abs(base.color.linearToSrgb({ channel: base.color.srgbToLinear({ channel: value }) }) - value)).toBeLessThanOrEqual(SRGB_KNEE_STEP);
                expect(Math.abs(base.color.srgbToLinear({ channel: base.color.linearToSrgb({ channel: value }) }) - value)).toBeLessThanOrEqual(SRGB_KNEE_STEP);
            }), { seed: SEED, numRuns: 500 });
            expect([base.color.srgbToLinear({ channel: 0 }), base.color.srgbToLinear({ channel: 1 })]).toEqual([0, 1]);
            expect(base.color.linearToSrgb({ channel: 0 })).toBe(0);
            expect(base.color.linearToSrgb({ channel: 1 })).toBeCloseTo(1, 15);
        });

        it("should never darken a brighter channel by more than the standard's step at its knee", () => {
            // Act & Assert
            fc.assert(fc.property(fc.double({ min: 0, max: 1, noNaN: true }), fc.double({ min: 0, max: 1, noNaN: true }), (first, second) => {
                const [darker, brighter] = first < second ? [first, second] : [second, first];
                expect(base.color.srgbToLinear({ channel: brighter }) - base.color.srgbToLinear({ channel: darker })).toBeGreaterThanOrEqual(-SRGB_KNEE_STEP);
                expect(base.color.linearToSrgb({ channel: brighter }) - base.color.linearToSrgb({ channel: darker })).toBeGreaterThanOrEqual(-SRGB_KNEE_STEP);
            }), { seed: SEED, numRuns: 500 });
        });
    });
});
