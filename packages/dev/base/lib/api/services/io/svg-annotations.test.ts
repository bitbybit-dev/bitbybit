import { describe, expect, it } from "vitest";
import * as Inputs from "../../inputs";
import { parseSvgPathData, svgSubpathPoints } from "../helpers/files/svg/svg-path-data";
import { Svg } from "./svg";

const svg = new Svg();

const square: Inputs.IO.DrawingPolylineSegmentDto = { points: [[0, 0], [40, 0], [40, 30], [0, 30]], closed: true };
const hole: Inputs.IO.DrawingCircleSegmentDto = { center: [20, 15], radius: 6 };

const pathsOf = (text: string): string[] => [...text.matchAll(/<path d="([^"]*)"/g)].map(found => found[1]!);

const idsOf = (text: string): string[] => [...text.matchAll(/<pattern id="([^"]*)"/g)].map(found => found[1]!);

const fillsOf = (text: string): string[] => [...text.matchAll(/ fill="([^"]*)" fill-rule="evenodd"/g)].map(found => found[1]!);

const written = (text: Partial<Inputs.IO.DrawingTextDto>): string => pathsOf(svg.svgCreate({ parts: [{ paths: [], texts: [{ text: "I", position: [10, 20], height: 21, ...text }] }] }))[0]!;

describe("path data in cubic Beziers only", () => {
    const pointsOf = (data: string): Inputs.Base.Point2[] => parseSvgPathData(data).flatMap(subpath => svgSubpathPoints(subpath, 64, 0));
    const cubics = (segments: Inputs.IO.DrawingPathDto["segments"], tolerance = 0.01): string => svg.pathData({ path: { segments }, flipY: false, tolerance, cubicsOnly: true });

    it("should write a circle, an arc and a bulged polyline without an arc command, every point within the tolerance of the true curve", () => {
        // Act
        const circle = cubics([{ center: [20, 15], radius: 6 }]);
        const arc = cubics([{ center: [0, 0], radius: 10, startAngle: 0, endAngle: 90 }]);
        const slot = cubics([{ points: [[0, 0], [30, 0], [30, 10], [0, 10]], closed: true, bulges: [0, 1, 0, 1] }]);
        const offCircle = Math.max(...pointsOf(circle).map(point => Math.abs(Math.hypot(point[0] - 20, point[1] - 15) - 6)));
        const offArc = Math.max(...pointsOf(arc).map(point => Math.abs(Math.hypot(point[0], point[1]) - 10)));
        const offEnd = Math.max(...pointsOf(slot).filter(point => point[0] > 30).map(point => Math.abs(Math.hypot(point[0] - 30, point[1] - 5) - 5)));

        // Assert
        expect([circle, arc, slot].map(data => /[AQ]/.test(data))).toEqual([false, false, false]);
        expect(circle.startsWith("M26 15 C")).toBe(true);
        expect(circle.endsWith(" Z")).toBe(true);
        expect(arc.startsWith("M10 0 C")).toBe(true);
        expect(arc.endsWith(" 0 10")).toBe(true);
        expect(offCircle).toBeLessThan(0.01);
        expect(offArc).toBeLessThan(0.01);
        expect(offEnd).toBeLessThan(0.01);
        expect(slot.startsWith("M0 0 L30 0 C")).toBe(true);
    });

    it("should write an ellipse within the tolerance, with more cubics for a finer one", () => {
        // Arrange
        const ellipse: Inputs.IO.DrawingPathDto["segments"] = [{ center: [0, 0], majorAxis: [10, 0], ratio: 0.5 }];

        // Act
        const coarse = cubics(ellipse, 0.5);
        const fine = cubics(ellipse, 0.00001);
        const off = Math.max(...pointsOf(fine).map(point => Math.abs(Math.hypot(point[0] / 10, point[1] / 5) - 1) * 5));

        // Assert
        expect(off).toBeLessThan(0.0001);
        expect(fine.match(/C/g)!.length).toBeGreaterThan(coarse.match(/C/g)!.length);
        expect(/A/.test(fine)).toBe(false);
    });

    it("should raise a quadratic spline to the cubic that draws the same curve, and leave lines and cubics as they are", () => {
        // Act
        const quadratic = cubics([{ controlPoints: [[0, 0], [9, 12], [18, 0]], degree: 2 }]);
        const cubic = cubics([{ controlPoints: [[0, 0], [10, 10], [20, 10], [30, 0]], degree: 3 }]);
        const line = cubics([{ start: [0, 0], end: [5, 5] }]);
        const flipped = svg.pathData({ path: { segments: [{ controlPoints: [[0, 0], [9, 12], [18, 0]], degree: 2 }] }, cubicsOnly: true });

        // Assert
        expect(quadratic).toBe("M0 0 C6 8 12 8 18 0");
        expect(cubic).toBe("M0 0 C10 10 20 10 30 0");
        expect(line).toBe("M0 0 L5 5");
        expect(flipped).toBe("M0 0 C6 -8 12 -8 18 0");
    });

    it("should keep writing exact arcs when cubics are not asked for", () => {
        // Act
        const exact = svg.pathData({ path: { segments: [{ center: [0, 0], radius: 10, startAngle: 0, endAngle: 90 }] }, flipY: false });

        // Assert
        expect(exact).toBe("M10 0 A10 10 0 0 1 0 10");
    });
});

describe("texts, hatches and line weights in an SVG drawing", () => {

    it("should draw a text as the strokes of its letters, a capital as tall as the height, from its position on the baseline", () => {
        // Act
        const upright = written({});
        const small = written({ height: 2.1 });
        const word = written({ text: "IT" });

        // Assert
        expect(upright).toBe("M14 -41 L14 -20");
        expect(small).toBe("M10.4 -22.1 L10.4 -20");
        expect(word).toBe("M14 -41 L14 -20 M26 -41 L26 -20 M19 -41 L33 -41");
    });

    it("should place a text by its start, its middle or its end, and narrow or widen its letters", () => {
        // Act
        const middle = written({ anchor: "middle" });
        const end = written({ anchor: "end" });
        const narrow = written({ widthFactor: 0.5 });
        const narrowEnd = written({ widthFactor: 0.5, anchor: "end" });

        // Assert
        expect(middle).toBe("M10 -41 L10 -20");
        expect(end).toBe("M6 -41 L6 -20");
        expect(narrow).toBe("M12 -41 L12 -20");
        expect(narrowEnd).toBe("M8 -41 L8 -20");
    });

    it("should turn a text about its position, counterclockwise for a positive angle", () => {
        // Act
        const quarter = written({ rotation: 90 });
        const back = written({ rotation: -90, anchor: "end" });

        // Assert
        expect(quarter).toBe("M-11 -24 L10 -24");
        expect(back).toBe("M31 -24 L10 -24");
    });

    it("should draw an accented letter with its mark and an unknown character as a question mark", () => {
        // Act
        const plain = written({ text: "C" });
        const accented = written({ text: "Č" });
        const unknown = written({ text: "日" });

        // Assert
        expect(accented.startsWith(plain)).toBe(true);
        expect(accented.slice(plain.length)).toBe(" M17.5 -45 L20.5 -42.25 L23.5 -45");
        expect(unknown).toBe(written({ text: "?" }));
    });

    it("should size the drawing by its texts, from the lowest to the highest ink of the font", () => {
        // Act
        const text = svg.svgCreate({ parts: [{ paths: [], texts: [{ text: "I", position: [0, 0], height: 21 }] }], margin: 0 });
        const turned = svg.svgCreate({ parts: [{ paths: [], texts: [{ text: "I", position: [0, 0], height: 21, rotation: 90 }] }], margin: 0 });

        // Assert
        expect(text).toContain("viewBox=\"0 -25 8 32\"");
        expect(turned).toContain("viewBox=\"-25 -8 32 8\"");
    });

    it("should give a part its own line width, and none of its own when it states none", () => {
        // Act
        const text = svg.svgCreate({ parts: [{ paths: [{ segments: [square] }], lineWeight: 0.5 }, { paths: [{ segments: [hole] }] }], strokeWidth: 0.25 });

        // Assert
        expect(text.match(/<g stroke=[^>]*>/g)).toEqual(["<g stroke=\"#000000\" stroke-width=\"0.5\">", "<g stroke=\"#000000\">"]);
    });

    it("should fill a hatch with lines at its angle and spacing, the boundaries as one region with holes, under the part's paths", () => {
        // Arrange
        const hatch: Inputs.IO.DrawingHatchDto = { boundaries: [{ segments: [square] }, { segments: [hole] }] };

        // Act
        const text = svg.svgCreate({ parts: [{ color: "#0000ff", lineWeight: 0.25, paths: [{ segments: [square] }], hatches: [hatch] }] });
        const lines = text.split("\n");
        const id = idsOf(text)[0];

        // Assert
        expect(lines.slice(2, 5)).toEqual([
            "  <defs>",
            `    <pattern id="${id}" patternUnits="userSpaceOnUse" width="3" height="3" patternTransform="rotate(-45)"><g fill="none" stroke="#0000ff" stroke-width="0.25"><line x1="0" y1="1.5" x2="3" y2="1.5"/></g></pattern>`,
            "  </defs>",
        ]);
        expect(lines.slice(7, 9)).toEqual([
            `      <path d="M0 0 L40 0 L40 -30 L0 -30 L0 0 Z M26 -15 A6 6 0 0 0 20 -21 A6 6 0 0 0 14 -15 A6 6 0 0 0 20 -9 A6 6 0 0 0 26 -15 Z" fill="url(#${id})" fill-rule="evenodd" stroke="none"/>`,
            "      <path d=\"M0 0 L40 0 L40 -30 L0 -30 L0 0 Z\"/>",
        ]);
    });

    it("should name a pattern by what it draws, so two drawings in one page share an id only for patterns that look the same", () => {
        // Arrange
        const boundaries = [{ segments: [square] }];
        const drawn = (hatch: Partial<Inputs.IO.DrawingHatchDto>, color = "#ff0000"): string => svg.svgCreate({ parts: [{ color, paths: [], hatches: [{ boundaries, ...hatch }] }], strokeWidth: 0.2 });

        // Act
        const ids = [drawn({}), drawn({}), drawn({ spacing: 4 }), drawn({}, "#0000ff"), drawn({ angle: 30 }), drawn({ pattern: Inputs.IO.hatchPatternEnum.ansi37 })].map(text => idsOf(text)[0]!);

        // Assert
        expect(ids.every(id => /^hatch-[0-9a-f]{8}$/.test(id))).toBe(true);
        expect(ids[1]).toBe(ids[0]);
        expect(new Set(ids.slice(1)).size).toBe(5);
    });

    it("should draw one pattern for hatches whose angles differ by whole turns", () => {
        // Arrange
        const boundaries = [{ segments: [square] }];

        // Act
        const text = svg.svgCreate({ parts: [{ paths: [], hatches: [30, 390, -330].map(angle => ({ boundaries, angle })) }] });

        // Assert
        expect(text.match(/<pattern [^>]*>/g)).toHaveLength(1);
        expect(text).toContain("patternTransform=\"rotate(-30)\"");
        expect(new Set(fillsOf(text)).size).toBe(1);
    });

    it("should draw a line weight finer than the file's precision at that precision, and refuse a pattern spacing finer than it", () => {
        // Arrange
        const boundaries = [{ segments: [square] }];

        // Act
        const fine = svg.svgCreate({ parts: [{ paths: [{ segments: [square] }], lineWeight: 1e-7, hatches: [{ boundaries }] }] });
        const solid = (): string => svg.svgCreate({ parts: [{ paths: [], hatches: [{ boundaries, pattern: Inputs.IO.hatchPatternEnum.solid, spacing: 1e-7 }] }] });
        const refusal = (() => {
            try {
                svg.svgCreate({ parts: [{ paths: [] }, { paths: [], hatches: [{ boundaries }, { boundaries, spacing: 1e-7 }] }] });
                return undefined;
            } catch (error) {
                return error as { property?: string; message?: string };
            }
        })();

        // Assert
        expect(fine).toContain("<g stroke=\"#000000\" stroke-width=\"0.000001\">");
        expect(fine).toContain("stroke-width=\"0.000001\"><line");
        expect(solid).not.toThrow();
        expect(refusal?.property).toBe("parts[1].hatches[1].spacing");
        expect(refusal?.message).toBe("`parts[1].hatches[1].spacing` is 1e-7, finer than 0.000001, the finest an SVG file draws here.");
    });

    it("should leave a text that draws nothing out of the drawing's extent", () => {
        // Arrange
        const part: Inputs.IO.DrawingPartDto = { paths: [{ segments: [{ start: [0, 0], end: [10, 0] }] }] };

        // Act
        const blank = svg.svgCreate({ parts: [{ ...part, texts: [{ text: "", position: [500, 500] }, { text: "   ", position: [-500, -500] }] }] });

        // Assert
        expect(blank).toBe(svg.svgCreate({ parts: [part] }));
    });

    it("should write a part of 130,000 texts and one of 130,000 hatches, past the engine's limit on call arguments", () => {
        // Arrange
        const texts: Inputs.IO.DrawingTextDto[] = Array.from({ length: 130_000 }, (_, at) => ({ text: "I", position: [at, 0] }));
        const hatches: Inputs.IO.DrawingHatchDto[] = Array.from({ length: 130_000 }, (_, at) => ({ boundaries: [{ segments: [{ points: [[at, 0], [at + 1, 0], [at, 1]], closed: true }] }], pattern: Inputs.IO.hatchPatternEnum.solid }));

        // Act
        const written = [svg.svgCreate({ parts: [{ paths: [], texts }] }), svg.svgCreate({ parts: [{ paths: [], hatches }] })];

        // Assert
        expect(written.map(text => text.match(/<path /g)?.length)).toEqual([130_000, 130_000]);
    }, 120_000);

    it("should draw paired lines, crossed lines and solid ink, one pattern for hatches that look the same", () => {
        // Arrange
        const boundaries = [{ segments: [square] }];
        const hatches: Inputs.IO.DrawingHatchDto[] = [
            { boundaries, pattern: Inputs.IO.hatchPatternEnum.ansi32, angle: 30, spacing: 4 },
            { boundaries, pattern: Inputs.IO.hatchPatternEnum.ansi37, angle: 0, spacing: 2 },
            { boundaries, pattern: Inputs.IO.hatchPatternEnum.solid },
            { boundaries, pattern: Inputs.IO.hatchPatternEnum.ansi32, angle: 30, spacing: 4 },
        ];

        // Act
        const text = svg.svgCreate({ parts: [{ color: "#ff0000", paths: [], hatches }], strokeWidth: 0.2 });

        // Assert
        const [paired, crossed] = idsOf(text);
        expect(text.match(/<pattern [^>]*>.*<\/pattern>/g)).toEqual([
            `<pattern id="${paired}" patternUnits="userSpaceOnUse" width="4" height="4" patternTransform="rotate(-30)"><g fill="none" stroke="#ff0000" stroke-width="0.2"><line x1="0" y1="2" x2="4" y2="2"/><line x1="0" y1="3.333333" x2="4" y2="3.333333"/></g></pattern>`,
            `<pattern id="${crossed}" patternUnits="userSpaceOnUse" width="2" height="2" patternTransform="rotate(0)"><g fill="none" stroke="#ff0000" stroke-width="0.2"><line x1="0" y1="1" x2="2" y2="1"/><line x1="1" y1="0" x2="1" y2="2"/></g></pattern>`,
        ]);
        expect(fillsOf(text)).toEqual([`url(#${paired})`, `url(#${crossed})`, "#ff0000", `url(#${paired})`]);
    });

    it("should keep a text whole on a dashed part and take the length of a dash from the scale given", () => {
        // Act
        const text = svg.svgCreate({
            parts: [{ lineType: Inputs.IO.lineTypeEnum.hidden, paths: [{ segments: [square] }], texts: [{ text: "I", position: [10, 20], height: 21 }] }],
            lineTypeScale: 1.5,
        });

        // Assert
        expect(text).toContain("<g stroke=\"#000000\" stroke-dasharray=\"3 1.5\">");
        expect(text).toContain("      <g stroke-dasharray=\"none\">\n        <path d=\"M14 -41 L14 -20\"/>\n      </g>");
    });

    it("should write a drawing without texts, hatches or line weights as it always has, with no definitions", () => {
        // Act
        const text = svg.svgCreate({ parts: [{ paths: [{ segments: [square] }], texts: [], hatches: [] }] });

        // Assert
        expect(text).not.toContain("<defs>");
        expect(text).toBe(svg.svgCreate({ parts: [{ paths: [{ segments: [square] }] }] }));
    });

    it("should refuse a text that is not one line of drawable size, and a hatch without a region or with a pattern it does not know", () => {
        // Arrange
        const withText = (text: unknown): (() => string) => () => svg.svgCreate({ parts: [{ paths: [], texts: [text as Inputs.IO.DrawingTextDto] }] });
        const withHatch = (hatch: unknown): (() => string) => () => svg.svgCreate({ parts: [{ paths: [], hatches: [hatch as Inputs.IO.DrawingHatchDto] }] });
        const boundaries = [{ segments: [square] }];
        const notAList: unknown = "A";

        // Act
        const refusals = [
            withText({ text: "A\nB", position: [0, 0] }),
            withText({ text: "A\u007F", position: [0, 0] }),
            withText({ text: "A".repeat(2001), position: [0, 0] }),
            withText({ position: [0, 0] }),
            withText({ text: "A" }),
            withText({ text: "A", position: [0, 0], height: 0 }),
            withText({ text: "A", position: [0, 0], widthFactor: -1 }),
            withText({ text: "A", position: [0, 0], anchor: "centre" }),
            withText({ text: "A", position: [0, 0], rotation: Number.NaN }),
            withHatch({ boundaries: [] }),
            withHatch({ boundaries, pattern: "bricks" }),
            withHatch({ boundaries, spacing: 0 }),
            withHatch({ boundaries, angle: Infinity }),
            (): string => svg.svgCreate({ parts: [{ paths: [], lineWeight: 0 }] }),
            (): string => svg.svgCreate({ parts: [{ paths: [], texts: notAList as Inputs.IO.DrawingTextDto[] }] }),
            (): string => svg.svgCreate({ parts: [], lineTypeScale: 0 }),
        ];

        // Assert
        expect(refusals.map(refusal => {
            try {
                refusal();
                return "written";
            } catch (error) {
                return (error as { property?: string }).property;
            }
        })).toEqual([
            "parts[0].texts[0].text", "parts[0].texts[0].text", "parts[0].texts[0].text", "parts[0].texts[0].text", "parts[0].texts[0].position",
            "parts[0].texts[0].height", "parts[0].texts[0].widthFactor", "parts[0].texts[0].anchor", "parts[0].texts[0].rotation",
            "parts[0].hatches[0].boundaries", "parts[0].hatches[0].pattern", "parts[0].hatches[0].spacing", "parts[0].hatches[0].angle",
            "parts[0].lineWeight", "parts[0].texts", "lineTypeScale",
        ]);
    });
});
