import { describe, expect, it } from "vitest";
import { nurbsCurvePoint } from "./nurbs";
import { WorkBudget } from "../files/work-budget";
import { angleWithinTurn, bulgeArcOf, bulgeOfSweep, conicArcAsNurbs, conicArcExtremes, conicArcOfEllipseArc, conicArcSamples, ellipseFramePoint, principalArcOf } from "./conic-arcs";
import type { ConicArc } from "./conic-arcs";

const tilted: ConicArc = { frame: { center: [1, 2, 3], xAxis: [4, 0, 4], yAxis: [0, 2, 0] }, start: 0.3, sweep: 4 };

describe("conic arcs", () => {
    it("should write any arc of an ellipse as rational quadratic pieces of at most a quarter turn that trace it exactly", () => {
        // Act
        const form = conicArcAsNurbs(tilted);
        const whole = conicArcAsNurbs({ ...tilted, sweep: 2 * Math.PI });

        // Assert
        expect(form.knots).toEqual([0, 0, 0, 1, 1, 2, 2, 3, 3, 3]);
        expect(whole.knots).toHaveLength(12);
        for (let step = 0; step <= 60; step++) {
            const point = nurbsCurvePoint(2, form.points, form.weights, form.knots, (3 * step) / 60);
            const local = [point[0] - 1, point[1] - 2, point[2] - 3];
            expect((local[0]! / 4) ** 2 + (local[1]! / 2) ** 2).toBeCloseTo(1, 12);
            expect(local[0]).toBeCloseTo(local[2]!, 12);
        }
        form.points[form.points.length - 1]!.forEach((value, axis) => expect(value).toBeCloseTo(ellipseFramePoint(tilted.frame, 4.3)[axis]!, 12));
    });

    it("should sample an arc evenly, its chords never further from it than the tolerance", () => {
        // Act
        const samples = conicArcSamples({ frame: { center: [0, 0, 0], xAxis: [10, 0, 0], yAxis: [0, 10, 0] }, start: 0, sweep: Math.PI }, 0.01);
        const wide = conicArcSamples({ frame: { center: [0, 0, 0], xAxis: [1, 0, 0], yAxis: [0, 1, 0] }, start: 0, sweep: -Math.PI }, 5);

        // Assert
        const step = Math.PI / (samples.length - 1);
        expect(10 * (1 - Math.cos(step / 2))).toBeLessThanOrEqual(0.01);
        expect(10 * (1 - Math.cos(Math.PI / (samples.length - 2) / 2))).toBeGreaterThan(0.01);
        expect(wide).toHaveLength(3);
        expect(wide[1]![1]).toBeCloseTo(-1, 12);
    });

    it("should charge a budget one step a sample, and give only the chord between the ends when the budget cannot pay for the samples", () => {
        // Arrange
        const half: ConicArc = { frame: { center: [0, 0, 0], xAxis: [10, 0, 0], yAxis: [0, 10, 0] }, start: 0, sweep: Math.PI };
        const roomy = new WorkBudget(1000);
        const tight = new WorkBudget(5);

        // Act
        const samples = conicArcSamples(half, 0.01, roomy);
        const chord = conicArcSamples(half, 0.01, tight);

        // Assert
        expect(samples).toEqual(conicArcSamples(half, 0.01));
        expect(roomy.spent).toBe(samples.length);
        expect(chord).toEqual([[10, 0, 0], ellipseFramePoint(half.frame, Math.PI)]);
        expect(tight.exhausted).toBe(true);
    });

    it("should give the bulge of a circular arc of a sweep, the inverse of the arc a bulge draws", () => {
        // Act
        const bulges = [Math.PI, Math.PI / 2, -Math.PI / 3].map(bulgeOfSweep);
        const sweeps = bulges.map(bulge => bulgeArcOf([0, 0, 0], [10, 0, 0], bulge).sweep);

        // Assert
        expect(bulges[0]).toBeCloseTo(1, 15);
        expect(bulges[1]).toBeCloseTo(Math.tan(Math.PI / 8), 15);
        sweeps.forEach((sweep, at) => expect(sweep).toBeCloseTo([Math.PI, Math.PI / 2, -Math.PI / 3][at]!, 12));
    });

    it("should give an arc's ends and every point where it turns back along an axis, which bound it exactly", () => {
        // Act
        const circle = conicArcExtremes({ frame: { center: [5, 5, 0], xAxis: [4, 0, 0], yAxis: [0, 4, 0] }, start: 0, sweep: 2 * Math.PI });
        const quarter = conicArcExtremes({ frame: { center: [0, 0, 0], xAxis: [1, 0, 0], yAxis: [0, 1, 0] }, start: 0.1, sweep: 1 });
        const clockwise = conicArcExtremes({ frame: { center: [0, 0, 0], xAxis: [2, 0, 0], yAxis: [0, 1, 0] }, start: 1, sweep: -2 });

        // Assert
        const span = (points: number[][], axis: number): number[] => [Math.min(...points.map(point => point[axis]!)), Math.max(...points.map(point => point[axis]!))];
        expect(span(circle, 0)).toEqual([1, 9]);
        expect(span(circle, 1).map(value => Math.round(value * 1e12) / 1e12)).toEqual([1, 9]);
        expect(span(quarter, 0)).toEqual([Math.cos(1.1), Math.cos(0.1)]);
        expect(span(quarter, 1)).toEqual([Math.sin(0.1), Math.sin(1.1)]);
        expect(span(clockwise, 0)).toEqual([2 * Math.cos(1), 2]);
    });

    it.each([1e20, -1e20, 1e300])("should end with a bounded list of points for an arc whose start %s is too large for its sweep to register", start => {
        // Act
        const extremes = conicArcExtremes({ frame: { center: [0, 0, 0], xAxis: [3, 0, 0], yAxis: [0, 2, 0] }, start, sweep: 2 * Math.PI });

        // Assert
        expect(extremes.length).toBeLessThanOrEqual(2 + 3 * 3);
    });

    it("should give a whole turn's extremes once each however many turns the sweep runs", () => {
        // Act
        const extremes = conicArcExtremes({ frame: { center: [0, 0, 0], xAxis: [3, 0, 0], yAxis: [0, 2, 0] }, start: 0, sweep: 1e6 });

        // Assert
        expect(extremes.length).toBeLessThanOrEqual(2 + 3 * 3);
        expect(Math.max(...extremes.map(point => point[0]))).toBe(3);
        expect(Math.min(...extremes.map(point => point[1]))).toBe(-2);
    });

    it("should sample no finer than a billionth of the radius, however small the tolerance", () => {
        // Arrange
        const arc: ConicArc = { frame: { center: [0, 0, 0], xAxis: [10, 0, 0], yAxis: [0, 10, 0] }, start: 0, sweep: 2 * Math.PI };

        // Act
        const tiny = conicArcSamples(arc, 1e-20);

        // Assert
        expect(tiny).toEqual(conicArcSamples(arc, 1e-8));
    });
});

describe("conics on their principal axes", () => {
    const pointsAlong = (arc: ConicArc): number[][] => [0, 0.25, 0.5, 0.75, 1].map(share => ellipseFramePoint(arc.frame, arc.start + share * arc.sweep));

    const expectSameArc = (actual: ConicArc, expected: ConicArc): void => {
        const expectedPoints = pointsAlong(expected);
        pointsAlong(actual).forEach((point, at) => point.forEach((value, axis) => expect(value).toBeCloseTo(expectedPoints[at]![axis]!, 12)));
    };

    it("should turn skewed conjugate radii onto perpendicular axes, the major the longer, tracing the same arc", () => {
        // Arrange
        const skewed: ConicArc = { frame: { center: [1, 2, 3], xAxis: [3, 1, 0], yAxis: [1, 2, 0] }, start: 0.4, sweep: 2.5 };

        // Act
        const principal = principalArcOf(skewed);

        // Assert
        const { xAxis, yAxis } = principal.frame;
        expect(xAxis[0] * yAxis[0] + xAxis[1] * yAxis[1] + xAxis[2] * yAxis[2]).toBeCloseTo(0, 12);
        expect(Math.hypot(...xAxis)).toBeGreaterThan(Math.hypot(...yAxis));
        expectSameArc(principal, skewed);
    });

    it("should swap perpendicular axes whose second is the longer, tracing the same arc the same way round", () => {
        // Arrange
        const tall: ConicArc = { frame: { center: [0, 0, 0], xAxis: [4, 0, 0], yAxis: [0, 8, 0] }, start: 0, sweep: Math.PI / 2 };

        // Act
        const principal = principalArcOf(tall);

        // Assert
        expect(principal.frame.xAxis).toEqual([0, 8, 0]);
        expect(principal.frame.yAxis).toEqual([-4, -0, -0]);
        expect(principal.sweep).toBe(Math.PI / 2);
        expectSameArc(principal, tall);
    });

    it("should keep perpendicular axes whose first is the longer as they are", () => {
        // Arrange
        const wide: ConicArc = { frame: { center: [0, 0, 0], xAxis: [8, 0, 0], yAxis: [0, 4, 0] }, start: 1, sweep: 2 };

        // Act
        const principal = principalArcOf(wide);

        // Assert
        expect(principal).toEqual(wide);
    });

    it("should keep a circle's axes as they are", () => {
        // Arrange
        const circle: ConicArc = { frame: { center: [0, 0, 0], xAxis: [0, 5, 0], yAxis: [-5, 0, 0] }, start: 0, sweep: 1 };

        // Act
        const principal = principalArcOf(circle);

        // Assert
        expect(principal).toEqual(circle);
    });
});

describe("SVG arcs as conic arcs", () => {
    it("should turn an arc's radii by its rotation into the axes of its frame, its angles kept", () => {
        // Arrange
        const arc = { center: [3, -2] as [number, number], rx: 4, ry: 1, xAxisRotation: Math.PI / 6, startAngle: 0.5, deltaAngle: -2 };

        // Act
        const conic = conicArcOfEllipseArc(arc);

        // Assert
        expect(conic.frame.center).toEqual([3, -2, 0]);
        expect(conic.frame.xAxis[0]).toBeCloseTo(2 * Math.sqrt(3), 14);
        expect(conic.frame.xAxis[1]).toBeCloseTo(2, 14);
        expect(conic.frame.yAxis[0]).toBeCloseTo(-0.5, 14);
        expect(conic.frame.yAxis[1]).toBeCloseTo(Math.sqrt(3) / 2, 14);
        expect([conic.start, conic.sweep]).toEqual([0.5, -2]);
    });
});

describe("angles within a turn", () => {
    it.each([
        [370, 360, 10],
        [-30, 360, 330],
        [360, 360, 0],
        [-1e-17, 360, 0],
        [1e20, 360, 280],
    ])("should bring %s into the first turn of %s as %s", (angle, turn, within) => {
        // Act
        const wrapped = angleWithinTurn(angle, turn);

        // Assert
        expect(wrapped).toBe(within);
    });
});

describe("bulge arcs", () => {
    it("should measure a bulge's radius as the square root of the sum of squares, as every other length in base is", () => {
        // Act
        const half = bulgeArcOf([0, 0, 0], [2, 3, 0], 1);

        // Assert
        expect(half.frame.xAxis[0]).toBe(Math.sqrt(1 * 1 + 1.5 * 1.5));
    });

    it("should find a bulge's circle: half a turn for a bulge of 1, the turn's sign the bulge's", () => {
        // Act
        const left = bulgeArcOf([0, 0, 5], [10, 0, 5], 1);
        const right = bulgeArcOf([0, 0, 0], [10, 0, 0], -Math.tan(Math.PI / 8));

        // Assert
        expect(left.frame.center).toEqual([5, 0, 5]);
        expect(left.sweep).toBeCloseTo(Math.PI, 12);
        expect(ellipseFramePoint(left.frame, left.start + left.sweep / 2)[1]).toBeCloseTo(-5, 12);
        expect(right.sweep).toBeCloseTo(-Math.PI / 2, 12);
        expect(right.frame.xAxis[0]).toBeCloseTo(5 * Math.SQRT2, 12);
        expect(ellipseFramePoint(right.frame, right.start + right.sweep)[0]).toBeCloseTo(10, 12);
    });
});
