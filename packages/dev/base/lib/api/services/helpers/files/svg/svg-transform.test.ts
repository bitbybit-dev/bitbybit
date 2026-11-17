import type { AffineMatrix2 } from "../../geometry/affine2";
import { affinePoint2 } from "../../geometry/affine2";
import { describe, it, expect } from "vitest";
import type { Base } from "../../../../inputs/base-inputs";

import { parseTransform, parseTransformList, transformSegment } from "./svg-transform";
import type { SvgArcSegment, SvgCubicSegment, SvgQuadSegment } from "./svg-scene-types";
import { parseSvgPathData } from "./svg-path-data";
import { shapeToSubpaths } from "./svg-shapes";

const near = (a: number, b: number, eps = 1e-9): boolean => Math.abs(a - b) < eps;

const pointOnArc = (arc: SvgArcSegment, t: number): Base.Point2 => {
    const c = Math.cos(arc.xAxisRotation);
    const s = Math.sin(arc.xAxisRotation);
    const x = arc.rx * Math.cos(t);
    const y = arc.ry * Math.sin(t);
    return [arc.center[0] + c * x - s * y, arc.center[1] + s * x + c * y];
};

const inverseOf = (m: AffineMatrix2): AffineMatrix2 => {
    const det = m[0] * m[3] - m[1] * m[2];
    const a = m[3] / det;
    const b = -m[1] / det;
    const c = -m[2] / det;
    const d = m[0] / det;
    return [a, b, c, d, -(a * m[4] + c * m[5]), -(b * m[4] + d * m[5])];
};

const implicitValue = (arc: SvgArcSegment, p: Base.Point2): number => {
    const dx = p[0] - arc.center[0];
    const dy = p[1] - arc.center[1];
    const c = Math.cos(arc.xAxisRotation);
    const s = Math.sin(arc.xAxisRotation);
    const u = (c * dx + s * dy) / arc.rx;
    const v = (-s * dx + c * dy) / arc.ry;
    return u * u + v * v;
};

const worstDeviation = (original: SvgArcSegment, transform: string): number => {
    const m = parseTransform(transform);
    const image = transformSegment(m, original) as SvgArcSegment;
    const back = inverseOf(m);
    let worst = 0;
    for (let k = 0; k <= 32; k++) {
        const onImage = pointOnArc(image, image.startAngle + image.deltaAngle * k / 32);
        worst = Math.max(worst, Math.abs(implicitValue(original, affinePoint2(back, onImage)) - 1));
    }
    return worst;
};

const ellipseArc = (): SvgArcSegment => shapeToSubpaths("ellipse", { cx: "3", cy: "4", rx: "10", ry: "5" })[0]!.segments[1] as SvgArcSegment;
const tiltedPathArc = (): SvgArcSegment => parseSvgPathData("M0 0 A10 4 25 0 0 12 3")[0]!.segments[0] as SvgArcSegment;

describe("svg arc under transforms", () => {
    it("should keep every point of a rotated ellipse arc on the rotated ellipse", () => {
        // Act
        const deviation = worstDeviation(ellipseArc(), "rotate(30)");

        // Assert
        expect(deviation).toBeLessThan(1e-12);
    });

    it("should tilt a rotated ellipse arc by the rotation angle", () => {
        // Act
        const image = transformSegment(parseTransform("rotate(30)"), ellipseArc()) as SvgArcSegment;

        // Assert
        expect(image.xAxisRotation).toBeCloseTo(Math.PI / 6, 12);
        expect(image.rx).toBeCloseTo(10, 12);
        expect(image.ry).toBeCloseTo(5, 12);
    });

    it("should keep every point of a skewed ellipse arc on the skewed ellipse", () => {
        // Act
        const deviation = worstDeviation(ellipseArc(), "skewX(30)");

        // Assert
        expect(deviation).toBeLessThan(1e-12);
    });

    it("should keep every point of a tilted path arc on its image under a general matrix", () => {
        // Act
        const deviation = worstDeviation(tiltedPathArc(), "matrix(1 0.5 0.2 1 3 2)");

        // Assert
        expect(deviation).toBeLessThan(1e-12);
    });

    it("should keep every point of an arc on its image under a mirroring matrix", () => {
        // Act
        const deviation = worstDeviation(tiltedPathArc(), "matrix(-0.3 1.1 0.9 0.4 3 2)");

        // Assert
        expect(deviation).toBeLessThan(1e-12);
    });

    it("should keep every point of an arc on its image under a rotated reflection", () => {
        // Act
        const deviation = worstDeviation(ellipseArc(), "rotate(30) scale(1 -1)");

        // Assert
        expect(deviation).toBeLessThan(1e-12);
    });

    it("should start and end the image arc where the transform takes the original ends", () => {
        // Arrange
        const original = tiltedPathArc();
        const m = parseTransform("matrix(-0.3 1.1 0.9 0.4 3 2)");

        // Act
        const image = transformSegment(m, original) as SvgArcSegment;

        // Assert
        const start = affinePoint2(m, pointOnArc(original, original.startAngle));
        const end = affinePoint2(m, pointOnArc(original, original.startAngle + original.deltaAngle));
        const imageStart = pointOnArc(image, image.startAngle);
        const imageEnd = pointOnArc(image, image.startAngle + image.deltaAngle);
        expect(imageStart[0]).toBeCloseTo(start[0], 12);
        expect(imageStart[1]).toBeCloseTo(start[1], 12);
        expect(imageEnd[0]).toBeCloseTo(end[0], 12);
        expect(imageEnd[1]).toBeCloseTo(end[1], 12);
    });

    it("should pass the image arc through the image of the original arc's middle", () => {
        // Arrange
        const original = ellipseArc();
        const m = parseTransform("matrix(1 0.5 0.2 1 3 2)");

        // Act
        const image = transformSegment(m, original) as SvgArcSegment;

        // Assert
        const middle = affinePoint2(m, pointOnArc(original, original.startAngle + original.deltaAngle / 2));
        expect(implicitValue(image, middle)).toBeCloseTo(1, 12);
    });
});

describe("svg transform lists", () => {
    it("should read numbers packed by their signs", () => {
        // Act
        const m = parseTransform("translate(-5-5)");

        // Assert
        expect(m).toEqual([1, 0, 0, 1, -5, -5]);
    });

    it("should read numbers packed by their decimal points", () => {
        // Act
        const m = parseTransform("matrix(.7 .7-.7 .7 0 0)");

        // Assert
        expect(m).toEqual([0.7, 0.7, -0.7, 0.7, 0, 0]);
    });

    it("should read a scale written as .5.5 as two factors", () => {
        // Act
        const p = affinePoint2(parseTransform("scale(.5.5)"), [2, 4]);

        // Assert
        expect(p).toEqual([1, 2]);
    });

    it("should read exponents", () => {
        // Act
        const p = affinePoint2(parseTransform("translate(1e1,2E1)"), [0, 0]);

        // Assert
        expect(p).toEqual([10, 20]);
    });

    it("should compose items separated by commas", () => {
        // Act
        const p = affinePoint2(parseTransform("translate(10,0),scale(2)"), [1, 1]);

        // Assert
        expect(p).toEqual([12, 2]);
    });

    it("should drop a whole list holding a matrix of too few numbers and say so, as a browser drops it", () => {
        // Act
        const parsed = parseTransformList("translate(5 0) matrix(1 0 0)");

        // Assert
        expect(parsed.malformed).toBe(true);
        expect(parsed.matrix).toEqual([1, 0, 0, 1, 0, 0]);
    });

    it("should drop a whole list that ends in text that is no transform", () => {
        // Act
        const parsed = parseTransformList("translate(5 0) bogus");

        // Assert
        expect(parsed.malformed).toBe(true);
        expect(parsed.matrix).toEqual([1, 0, 0, 1, 0, 0]);
    });

    it("should drop a whole list whose items take the wrong number of arguments or are left open", () => {
        // Act
        const parsed = ["translate(1 2 3)", "rotate(30 5)", "translate(100 0) scale(2", "scale()"].map(parseTransformList);

        // Assert
        expect(parsed).toEqual(parsed.map(() => ({ matrix: [1, 0, 0, 1, 0, 0], malformed: true })));
    });

    it("should drop a list naming a transform after a name every object inherits", () => {
        // Act
        const parsed = ["constructor(1)", "toString(1 2)", "translate(1 1) valueOf(2)"].map(parseTransformList);

        // Assert
        expect(parsed).toEqual(parsed.map(() => ({ matrix: [1, 0, 0, 1, 0, 0], malformed: true })));
    });

    it("should read a list with a long run of separators in time linear in its length", () => {
        // Act
        const parsed = [`${" ".repeat(100_000)}x`, `translate(1 2)${" ,".repeat(50_000)}scale(2)`].map(parseTransformList);

        // Assert
        expect(parsed).toEqual([{ matrix: [1, 0, 0, 1, 0, 0], malformed: true }, { matrix: [2, 0, 0, 2, 1, 2], malformed: false }]);
    }, 2_000);

    it("should report an unknown transform name as malformed", () => {
        // Act
        const parsed = parseTransformList("Rotate(90)");

        // Assert
        expect(parsed.malformed).toBe(true);
        expect(parsed.matrix).toEqual([1, 0, 0, 1, 0, 0]);
    });

    it("should not report a well formed list", () => {
        // Act
        const parsed = parseTransformList(" rotate(90 10 10) , skewY(10) ");

        // Assert
        expect(parsed.malformed).toBe(false);
    });

    it("should leave every point where it is under a rotation, a skew and a translation of zero", () => {
        // Act
        const moved = ["rotate(0)", "rotate(-0 4 5)", "skewX(0)", "skewY(-0)", "translate(-0, -0)"].map((text) => affinePoint2(parseTransform(text), [3, 7]));

        // Assert
        expect(moved).toEqual([[3, 7], [3, 7], [3, 7], [3, 7], [3, 7]]);
    });
});

describe("svg transform", () => {
    it("returns identity for missing/empty transform", () => {
        expect(parseTransform(undefined)).toEqual([1, 0, 0, 1, 0, 0]);
        expect(parseTransform("")).toEqual([1, 0, 0, 1, 0, 0]);
    });

    it("composes translate then scale correctly", () => {
        const m = parseTransform("translate(10 20) scale(2)");
        expect(affinePoint2(m, [1, 1])).toEqual([12, 22]);
    });

    it("parses matrix() directly", () => {
        const m = parseTransform("matrix(1 0 0 1 5 6)");
        expect(affinePoint2(m, [0, 0])).toEqual([5, 6]);
    });

    it("rotates 90 degrees about origin", () => {
        const p = affinePoint2(parseTransform("rotate(90)"), [1, 0]);
        expect(near(p[0], 0)).toBe(true);
        expect(near(p[1], 1)).toBe(true);
    });

    it("rotates about a center point", () => {
        const p = affinePoint2(parseTransform("rotate(90 1 0)"), [1, 0]);
        expect(near(p[0], 1)).toBe(true);
        expect(near(p[1], 0)).toBe(true);
    });

    it("applies single-arg scale uniformly", () => {
        expect(affinePoint2(parseTransform("scale(3)"), [2, 4])).toEqual([6, 12]);
    });

    it("applies skewX", () => {
        const p = affinePoint2(parseTransform("skewX(45)"), [0, 1]);
        expect(near(p[0], 1)).toBe(true);
        expect(near(p[1], 1)).toBe(true);
    });

    it("transforms cubic control points exactly", () => {
        const seg = transformSegment(parseTransform("translate(5 0)"),
            { type: "cubic", c1: [0, 0], c2: [1, 1], to: [2, 2] }) as SvgCubicSegment;
        expect(seg.c1).toEqual([5, 0]);
        expect(seg.to).toEqual([7, 2]);
    });

    it("transforms quad control points exactly", () => {
        const seg = transformSegment(parseTransform("scale(2)"),
            { type: "quad", c: [1, 1], to: [2, 2] }) as SvgQuadSegment;
        expect(seg.c).toEqual([2, 2]);
        expect(seg.to).toEqual([4, 4]);
    });

    it("keeps a uniformly scaled circle arc as a circle arc", () => {
        const arc: SvgArcSegment = {
            type: "arc", to: [20, 0], center: [10, 0], rx: 10, ry: 10,
            xAxisRotation: 0, startAngle: Math.PI, deltaAngle: -Math.PI,
        };
        const out = transformSegment(parseTransform("scale(2)"), arc) as SvgArcSegment;
        expect(near(out.rx, 20)).toBe(true);
        expect(near(out.ry, 20)).toBe(true);
        expect(near(out.center[0], 20)).toBe(true);
    });

    it("turns a circle arc into an ellipse arc under non-uniform scale", () => {
        const arc: SvgArcSegment = {
            type: "arc", to: [10, 0], center: [0, 0], rx: 10, ry: 10,
            xAxisRotation: 0, startAngle: Math.PI, deltaAngle: -Math.PI,
        };
        const out = transformSegment(parseTransform("scale(1 0.5)"), arc) as SvgArcSegment;
        const radii = [out.rx, out.ry].sort((a, b) => a - b);
        expect(near(radii[0]!, 5)).toBe(true);
        expect(near(radii[1]!, 10)).toBe(true);
    });

    it("flips sweep direction under a reflection (flipY)", () => {
        const arc: SvgArcSegment = {
            type: "arc", to: [20, 0], center: [10, 0], rx: 10, ry: 10,
            xAxisRotation: 0, startAngle: 0, deltaAngle: Math.PI,
        };
        const out = transformSegment(parseTransform("scale(1 -1)"), arc) as SvgArcSegment;
        expect(Math.sign(out.deltaAngle)).toBe(-Math.sign(arc.deltaAngle));
    });
});
