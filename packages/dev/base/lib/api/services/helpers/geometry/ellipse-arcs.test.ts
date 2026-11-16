import { describe, it, expect } from "vitest";
import type * as Inputs from "../../../inputs";
import { affineEllipseArc2, ellipseArcOfEndpoints2 } from "./ellipse-arcs";
import type { AffineMatrix2 } from "./affine2";
import type { EllipseArc2 } from "./ellipse-arcs";

type Point2 = Inputs.Base.Point2;

const pointAt = (arc: EllipseArc2, share: number): Point2 => {
    const t = arc.startAngle + arc.deltaAngle * share;
    const x = arc.rx * Math.cos(t);
    const y = arc.ry * Math.sin(t);
    const c = Math.cos(arc.xAxisRotation);
    const s = Math.sin(arc.xAxisRotation);
    return [arc.center[0] + c * x - s * y, arc.center[1] + s * x + c * y];
};
const mapped = (m: AffineMatrix2, p: Point2): Point2 => [m[0] * p[0] + m[2] * p[1] + m[4], m[1] * p[0] + m[3] * p[1] + m[5]];
const SHARES = Array.from({ length: 17 }, (_, k) => k / 16);
const TILTED: EllipseArc2 = ellipseArcOfEndpoints2([0, 0], [12, 3], 10, 4, 25 * Math.PI / 180, false, false)!;

describe("ellipse arcs from their end points", () => {
    it("should centre a half circle between its ends", () => {
        // Act
        const arc = ellipseArcOfEndpoints2([0, 0], [20, 0], 10, 10, 0, false, true)!;

        // Assert
        expect(arc.center[0]).toBeCloseTo(10, 12);
        expect(arc.center[1]).toBeCloseTo(0, 12);
        expect(Math.abs(arc.deltaAngle)).toBeCloseTo(Math.PI, 12);
    });

    it("should start and end a tilted arc at the points it was given, for every choice of the two flags", () => {
        // Act
        const arcs = [[false, false], [false, true], [true, false], [true, true]].map(([large, sweep]) =>
            ellipseArcOfEndpoints2([1, 2], [9, 5], 6, 3, 0.4, large!, sweep!)!);

        // Assert
        arcs.forEach((arc) => {
            expect(pointAt(arc, 0)[0]).toBeCloseTo(1, 12);
            expect(pointAt(arc, 0)[1]).toBeCloseTo(2, 12);
            expect(pointAt(arc, 1)[0]).toBeCloseTo(9, 12);
            expect(pointAt(arc, 1)[1]).toBeCloseTo(5, 12);
        });
        expect(arcs.map((arc) => [Math.abs(arc.deltaAngle) > Math.PI, arc.deltaAngle > 0])).toEqual([[false, false], [false, true], [true, false], [true, true]]);
    });

    it("should grow radii too small to reach from one end to the other until they reach", () => {
        // Act
        const arc = ellipseArcOfEndpoints2([0, 0], [40, 0], 10, 10, 0, false, true)!;

        // Assert
        expect(arc.rx).toBeCloseTo(20, 12);
        expect(arc.ry).toBeCloseTo(20, 12);
        expect(pointAt(arc, 1)[0]).toBeCloseTo(40, 12);
    });

    it("should give no arc between coincident ends or with a radius of 0", () => {
        // Act
        const arcs = [
            ellipseArcOfEndpoints2([5, 5], [5, 5], 5, 5, 0, false, true),
            ellipseArcOfEndpoints2([0, 0], [10, 10], 0, 5, 0, false, true),
            ellipseArcOfEndpoints2([0, 0], [10, 10], 5, -0, 0, false, true),
        ];

        // Assert
        expect(arcs).toEqual([undefined, undefined, undefined]);
    });
});

describe("ellipse arcs under affine maps", () => {
    const MAPS: [string, AffineMatrix2][] = [
        ["a rotation", [Math.cos(0.5), Math.sin(0.5), -Math.sin(0.5), Math.cos(0.5), 3, -2]],
        ["a skew", [1, 0, Math.tan(0.5), 1, 0, 0]],
        ["a general matrix", [1, 0.5, 0.2, 1, 3, 2]],
        ["a mirroring matrix", [-0.3, 1.1, 0.9, 0.4, 3, 2]],
        ["a non-uniform scale", [2, 0, 0, 0.5, 0, 0]],
    ];

    MAPS.forEach(([name, matrix]) => {
        it(`should put every point of the image arc where ${name} takes the original arc's point`, () => {
            // Act
            const image = affineEllipseArc2(matrix, TILTED);

            // Assert
            SHARES.forEach((share) => {
                const expected = mapped(matrix, pointAt(TILTED, share));
                const found = pointAt(image, share);
                expect(found[0]).toBeCloseTo(expected[0], 10);
                expect(found[1]).toBeCloseTo(expected[1], 10);
            });
        });
    });

    it("should keep the semi-axes of an arc under a rotation and turn its tilt by the rotation", () => {
        // Act
        const image = affineEllipseArc2([Math.cos(0.5), Math.sin(0.5), -Math.sin(0.5), Math.cos(0.5), 0, 0], TILTED);

        // Assert
        expect(image.rx).toBeCloseTo(TILTED.rx, 12);
        expect(image.ry).toBeCloseTo(TILTED.ry, 12);
        expect(image.xAxisRotation).toBeCloseTo(TILTED.xAxisRotation + 0.5, 12);
    });

    it("should keep the turn of an arc that crosses the half turn, either way round", () => {
        // Arrange
        const degrees = Math.PI / 180;
        const arcs: EllipseArc2[] = [-1, 1].map((turn) => ({ center: [0, 0], rx: 2, ry: 2, xAxisRotation: 0, startAngle: turn * -170 * degrees, deltaAngle: turn * -20 * degrees }));

        // Act
        const images = arcs.map((arc) => affineEllipseArc2([1, 0, 0, 1, 0, 0], arc));

        // Assert
        expect(images.map((image) => image.deltaAngle)).toEqual(arcs.map((arc) => expect.closeTo(arc.deltaAngle, 12)));
    });

    it("should give an arc of no turn no turn under any map", () => {
        // Act
        const image = affineEllipseArc2([-0.3, 1.1, 0.9, 0.4, 3, 2], { ...TILTED, deltaAngle: 0 });

        // Assert
        expect(image.deltaAngle).toBe(0);
    });

    it("should reverse the sweep of an arc under a reflection", () => {
        // Act
        const image = affineEllipseArc2([1, 0, 0, -1, 0, 0], TILTED);

        // Assert
        expect(Math.sign(image.deltaAngle)).toBe(-Math.sign(TILTED.deltaAngle));
    });
});
