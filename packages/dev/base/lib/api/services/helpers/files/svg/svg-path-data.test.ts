import { describe, it, expect } from "vitest";
import type * as Inputs from "../../../../inputs";
import { parseSvgPathData, scanSvgNumbers, svgNumberAt, svgSubpathPoints } from "./svg-path-data";
import type { SvgArcSegment, SvgCubicSegment, SvgQuadSegment } from "./svg-path-types";

const near = (a: number, b: number, eps = 1e-9): boolean => Math.abs(a - b) < eps;

describe("svg path data", () => {
    it("parses absolute M/L into one open subpath", () => {
        const sp = parseSvgPathData("M 10 20 L 30 40 L 50 60");
        expect(sp).toHaveLength(1);
        expect(sp[0]!.start).toEqual([10, 20]);
        expect(sp[0]!.segments).toHaveLength(2);
        expect(sp[0]!.segments[0]).toEqual({ type: "line", to: [30, 40] });
        expect(sp[0]!.closed).toBe(false);
    });

    it("treats implicit coordinate pairs after M as linetos", () => {
        const sp = parseSvgPathData("M0 0 1 1 2 2");
        expect(sp[0]!.segments).toEqual([
            { type: "line", to: [1, 1] },
            { type: "line", to: [2, 2] },
        ]);
    });

    it("treats implicit pairs after relative m as relative linetos", () => {
        const sp = parseSvgPathData("m0 0 1 1 1 1");
        expect(sp[0]!.segments).toEqual([
            { type: "line", to: [1, 1] },
            { type: "line", to: [2, 2] },
        ]);
    });

    it("handles relative commands and H/V (absolute + relative)", () => {
        const sp = parseSvgPathData("M10 10 h5 v5 l-5 0 z");
        expect(sp[0]!.segments[0]).toEqual({ type: "line", to: [15, 10] });
        expect(sp[0]!.segments[1]).toEqual({ type: "line", to: [15, 15] });
        expect(sp[0]!.segments[2]).toEqual({ type: "line", to: [10, 15] });
        expect(sp[0]!.closed).toBe(true);
    });

    it("handles absolute H and V", () => {
        const sp = parseSvgPathData("M0 0 H10 V10");
        expect(sp[0]!.segments[0]).toEqual({ type: "line", to: [10, 0] });
        expect(sp[0]!.segments[1]).toEqual({ type: "line", to: [10, 10] });
    });

    it("parses scientific notation and sign-packed numbers", () => {
        const sp = parseSvgPathData("M1e2 1E1 L-5-5");
        expect(sp[0]!.start).toEqual([100, 10]);
        expect(sp[0]!.segments[0]).toEqual({ type: "line", to: [-5, -5] });
    });

    it("parses decimals without separators (M.5.5)", () => {
        const sp = parseSvgPathData("M.5.5 L1.5.5");
        expect(sp[0]!.start).toEqual([0.5, 0.5]);
        expect(sp[0]!.segments[0]).toEqual({ type: "line", to: [1.5, 0.5] });
    });

    it("reflects the control point for smooth cubic S", () => {
        const sp = parseSvgPathData("M0 0 C1 1 2 2 3 3 S5 5 6 6");
        const smooth = sp[0]!.segments[1] as SvgCubicSegment;
        expect(smooth.c1).toEqual([4, 4]);
        expect(smooth.c2).toEqual([5, 5]);
        expect(smooth.to).toEqual([6, 6]);
    });

    it("treats S with no preceding cubic as using current point for first control", () => {
        const sp = parseSvgPathData("M2 2 S5 5 6 6");
        const seg = sp[0]!.segments[0] as SvgCubicSegment;
        expect(seg.c1).toEqual([2, 2]);
    });

    it("reflects the control point for smooth quadratic T", () => {
        const sp = parseSvgPathData("M0 0 Q1 2 2 0 T6 0");
        const t = sp[0]!.segments[1] as SvgQuadSegment;
        expect(t.c).toEqual([3, -2]);
        expect(t.to).toEqual([6, 0]);
    });

    it("parses packed arc flags", () => {
        const sp = parseSvgPathData("M0 0 a5 5 0 016 6");
        const arc = sp[0]!.segments[0] as SvgArcSegment;
        expect(arc.type).toBe("arc");
        expect(arc.to).toEqual([6, 6]);
        expect(arc.deltaAngle).toBeGreaterThan(0);
    });

    it("converts a semicircle arc to center form", () => {
        const sp = parseSvgPathData("M0 0 A10 10 0 0 1 20 0");
        const arc = sp[0]!.segments[0] as SvgArcSegment;
        expect(near(arc.center[0], 10)).toBe(true);
        expect(near(arc.center[1], 0)).toBe(true);
        expect(near(arc.rx, 10)).toBe(true);
        expect(near(Math.abs(arc.deltaAngle), Math.PI)).toBe(true);
    });

    it("sets sweep sign from the sweep flag", () => {
        const cw = parseSvgPathData("M0 0 A10 10 0 0 0 20 0")[0]!.segments[0] as SvgArcSegment;
        const ccw = parseSvgPathData("M0 0 A10 10 0 0 1 20 0")[0]!.segments[0] as SvgArcSegment;
        expect(cw.deltaAngle).toBeLessThan(0);
        expect(ccw.deltaAngle).toBeGreaterThan(0);
    });

    it("should leave out an arc that ends where it starts", () => {
        // Act
        const sp = parseSvgPathData("M5 5 A5 5 0 0 1 5 5 L10 10");

        // Assert
        expect(sp[0]!.segments).toEqual([{ type: "line", to: [10, 10] }]);
    });

    it("falls back to a line when arc radius is zero", () => {
        const sp = parseSvgPathData("M0 0 A0 0 0 0 1 10 10");
        expect(sp[0]!.segments[0]).toEqual({ type: "line", to: [10, 10] });
    });

    it("scales up out-of-range arc radii", () => {
        const arc = parseSvgPathData("M0 0 A10 10 0 0 1 40 0")[0]!.segments[0] as SvgArcSegment;
        expect(arc.rx).toBeGreaterThanOrEqual(20 - 1e-9);
    });

    it("starts a new subpath after Z", () => {
        const sp = parseSvgPathData("M0 0 L1 0 Z M2 2 L3 2");
        expect(sp).toHaveLength(2);
        expect(sp[0]!.closed).toBe(true);
        expect(sp[1]!.start).toEqual([2, 2]);
    });

    it("ignores a lone moveto with no geometry", () => {
        const sp = parseSvgPathData("M5 5");
        expect(sp).toHaveLength(0);
    });
});

describe("svg path data that is incomplete", () => {
    it("should end a command at an argument group it cannot complete and carry on at the next command", () => {
        // Act
        const subpaths = parseSvgPathData("M0 0 L1 2 3 L4 4 A5 5 0 2 1 9 9 L7 7");

        // Assert
        expect(subpaths).toEqual([{ start: [0, 0], segments: [{ type: "line", to: [1, 2] }, { type: "line", to: [4, 4] }, { type: "line", to: [7, 7] }], closed: false }]);
    });

    it("should start a subpath where the last one closed when a drawing command follows a close", () => {
        // Act
        const subpaths = parseSvgPathData("M2 3 L5 3 L5 6 Z L9 9");

        // Assert
        expect(subpaths.map((subpath) => [subpath.start, subpath.closed])).toEqual([[[2, 3], true], [[2, 3], false]]);
    });

    it("should pass over a close with no subpath open, at the start and after another close", () => {
        // Act
        const subpaths = parseSvgPathData("Z M0 0 L1 0 Z Z");

        // Assert
        expect(subpaths).toEqual([{ start: [0, 0], segments: [{ type: "line", to: [1, 0] }], closed: true }]);
    });
});

describe("svg numbers", () => {
    it("should scan numbers packed by signs, decimal points and exponents", () => {
        // Act
        const scanned = scanSvgNumbers("-5-5 .7.7,1e2 -.5e-1");

        // Assert
        expect(scanned).toStrictEqual({ numbers: [-5, -5, 0.7, 0.7, 100, -0.05], malformed: false });
    });

    it("should read no numbers from no text", () => {
        // Act
        const scanned = [undefined, ""].map(scanSvgNumbers);

        // Assert
        expect(scanned).toStrictEqual([{ numbers: [], malformed: false }, { numbers: [], malformed: false }]);
    });

    it("should stop at a character that is no number and say so", () => {
        // Act
        const scanned = scanSvgNumbers("1 2 x 3");

        // Assert
        expect(scanned).toStrictEqual({ numbers: [1, 2], malformed: true });
    });

    it("should read one number where it starts and say where it ends", () => {
        // Act
        const read = ["x-12.5e1y", "x.5", "x1e", "xe5"].map((text) => svgNumberAt(text, 1));

        // Assert
        expect(read).toEqual([[-125, 8], [0.5, 3], [1, 2], undefined]);
    });

    it("should read a number too large to hold as no number, so a list holding one is malformed and a path command ends at it", () => {
        // Act
        const read = ["1e999", "-1e400", "1e-999"].map((text) => svgNumberAt(text, 0));
        const scanned = scanSvgNumbers("1 1e999 2");
        const path = parseSvgPathData("M0 0 L1e999 0 L0 10 Z");

        // Assert
        expect(read).toEqual([undefined, undefined, [0, 6]]);
        expect(scanned).toStrictEqual({ numbers: [1], malformed: true });
        expect(path).toEqual([{ start: [0, 0], segments: [{ type: "line", to: [0, 10] }], closed: true }]);
    });

    it("should read numbers in path data as the scanner reads them in a list", () => {
        // Act
        const listed = scanSvgNumbers("1e1.5-.5e-1 1e").numbers;
        const path = parseSvgPathData("M1e1.5 L-.5e-1 1")[0]!;

        // Assert
        expect(listed).toEqual([10, 0.5, -0.05, 1]);
        expect(path.start).toEqual([10, 0.5]);
        expect(path.segments[0]!.to).toEqual([-0.05, 1]);
    });
});

describe("svg path sampling", () => {
    it("should sample an arc of a tilted ellipse onto that ellipse, ending where the arc ends", () => {
        // Arrange
        const subpath = parseSvgPathData("M0 0 A10 4 25 1 0 12 3")[0]!;
        const arc = subpath.segments[0] as SvgArcSegment;
        const onEllipse = ([x, y]: Inputs.Base.Point2): number => {
            const dx = x - arc.center[0];
            const dy = y - arc.center[1];
            const u = (Math.cos(arc.xAxisRotation) * dx + Math.sin(arc.xAxisRotation) * dy) / arc.rx;
            const v = (-Math.sin(arc.xAxisRotation) * dx + Math.cos(arc.xAxisRotation) * dy) / arc.ry;
            return u * u + v * v;
        };

        // Act
        const points = svgSubpathPoints(subpath, 24, 32);

        // Assert
        points.forEach((point) => expect(onEllipse(point)).toBeCloseTo(1, 12));
        expect(points[points.length - 1]![0]).toBeCloseTo(12, 12);
        expect(points[points.length - 1]![1]).toBeCloseTo(3, 12);
        expect(points.length).toBeGreaterThan(32);
    });

    it("should sample a quadratic Bezier on the curve", () => {
        // Act
        const points = svgSubpathPoints(parseSvgPathData("M0 0 Q10 20 20 0")[0]!, 24, 32);

        // Assert
        expect(points).toHaveLength(25);
        points.forEach(([x, y]) => {
            const t = x / 20;
            expect(y).toBeCloseTo(2 * t * (1 - t) * 20, 12);
        });
    });

    it("should sample a cubic Bezier on the curve and keep straight segments as their end points", () => {
        // Act
        const points = svgSubpathPoints(parseSvgPathData("M0 0 C0 10 10 10 10 0 L20 0")[0]!, 4, 32);

        // Assert
        expect(points).toEqual([[0, 0], [1.5625, 5.625], [5, 7.5], [8.4375, 5.625], [10, 0], [20, 0]]);
    });
});
