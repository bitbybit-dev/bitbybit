import { describe, expect, it } from "vitest";
import * as Inputs from "../../../../inputs";
import type * as Resolved from "../../../../resolved-inputs";
import { resolveDto } from "../../../../kernel-calls";
import { nurbsCurvePoint } from "../../curves/nurbs";
import { DxfGenerator } from "./dxf-generator";
import { entitiesOf, numberOf, numbersOf, readDxf, valueOf, valuesOf } from "../__test__/dxf-reader";
import type { DxfRecord } from "../__test__/dxf-reader";

type Point3 = Inputs.Base.Point3;

const write = (segments: Inputs.IO.DrawingPathDto["segments"], options: Partial<Inputs.IO.DxfModelDto> = {}): DxfRecord[] =>
    entitiesOf(readDxf(new DxfGenerator().generateDxf(resolveDto(Inputs.IO.DxfModelDto, {
        dxfPathsParts: [{ layer: "cut", color: "#ff0000", paths: [{ segments }] }],
        ...options,
    }) as Resolved.IO.DxfModelDto)));

const pointsOf = (record: DxfRecord, codes: [number, number, number]): Point3[] => {
    const xs = numbersOf(record, codes[0]);
    const ys = numbersOf(record, codes[1]);
    const zs = numbersOf(record, codes[2]);
    return xs.map((x, at): Point3 => [x, ys[at]!, zs[at] ?? 0]);
};

const cross = (a: Point3, b: Point3): Point3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit = (a: Point3): Point3 => {
    const length = Math.hypot(...a);
    return [a[0] / length, a[1] / length, a[2] / length];
};
const arbitraryAxes = (normal: Point3): [Point3, Point3, Point3] => {
    const z = unit(normal);
    const x = unit(Math.abs(z[0]) < 1 / 64 && Math.abs(z[1]) < 1 / 64 ? cross([0, 1, 0], z) : cross([0, 0, 1], z));
    return [x, cross(z, x), z];
};
const fromOcs = (axes: [Point3, Point3, Point3], point: Point3): Point3 =>
    [0, 1, 2].map(axis => axes[0][axis]! * point[0] + axes[1][axis]! * point[1] + axes[2][axis]! * point[2]) as Point3;

const distanceToPolyline = (point: Point3, polyline: Point3[]): number => {
    let nearest = Infinity;
    for (let at = 0; at + 1 < polyline.length; at++) {
        const start = polyline[at]!;
        const end = polyline[at + 1]!;
        const along = [end[0] - start[0], end[1] - start[1], end[2] - start[2]];
        const reach = along[0]! ** 2 + along[1]! ** 2 + along[2]! ** 2;
        const share = reach === 0 ? 0 : Math.min(1, Math.max(0, ((point[0] - start[0]) * along[0]! + (point[1] - start[1]) * along[1]! + (point[2] - start[2]) * along[2]!) / reach));
        nearest = Math.min(nearest, Math.hypot(point[0] - start[0] - share * along[0]!, point[1] - start[1] - share * along[1]!, point[2] - start[2] - share * along[2]!));
    }
    return nearest;
};

const closedPolyline = (records: DxfRecord[]): Point3[] => {
    const vertices = records.filter(record => record.kind === "VERTEX").map(record => pointsOf(record, [10, 20, 30])[0]!);
    return numberOf(records[0]!, 70) % 2 === 1 ? [...vertices, vertices[0]!] : vertices;
};

const largestGap = (points: readonly Point3[], curve: (share: number) => Point3): number =>
    Math.max(...Array.from({ length: 401 }, (_, step) => distanceToPolyline(curve(step / 400), [...points])));

describe("DXF lines, arcs and circles", () => {
    it("should write a line with its Z, a 2D end at Z 0", () => {
        // Act
        const [line] = write([{ start: [1, 2], end: [3, 4, 5] }]);

        // Assert
        expect([pointsOf(line!, [10, 20, 30]), pointsOf(line!, [11, 21, 31])]).toEqual([[[1, 2, 0]], [[3, 4, 5]]]);
    });

    it("should write an arc in the XY plane with its radius and angles and no extrusion", () => {
        // Act
        const [arc] = write([{ center: [5, 3], radius: 2, startAngle: 30, endAngle: 120 }]);

        // Assert
        expect([arc!.kind, numberOf(arc!, 40), numberOf(arc!, 50), numberOf(arc!, 51), valueOf(arc!, 210)]).toEqual(["ARC", 2, 30, 120, undefined]);
    });

    it("should write an arc that wraps past a whole turn with both angles within one turn", () => {
        // Act
        const [arc] = write([{ center: [0, 0], radius: 1, startAngle: 350, endAngle: 370 }]);

        // Assert
        expect([numberOf(arc!, 50), numberOf(arc!, 51)]).toEqual([350, 10]);
    });

    it("should write an arc about -Z with its centre in the object coordinates that extrusion gives", () => {
        // Act
        const [arc] = write([{ center: [5, 3], radius: 2, startAngle: 0, endAngle: 90, normal: [0, 0, -1] }]);

        // Assert
        expect([pointsOf(arc!, [10, 20, 30]), pointsOf(arc!, [210, 220, 230])]).toEqual([[[-5, 3, 0]], [[0, 0, -1]]]);
    });

    it("should write a tilted arc in the plane its normal gives by the arbitrary axis rule, its angles as given", () => {
        // Arrange
        const tilted: Point3 = [1, -2, 0.5];

        // Act
        const [arc] = write([{ center: [4, -1, 7], radius: 3, startAngle: -45, endAngle: 45, normal: tilted }]);

        // Assert
        const center = fromOcs(arbitraryAxes(tilted), pointsOf(arc!, [10, 20, 30])[0]!);
        center.forEach((value, axis) => expect(value).toBeCloseTo([4, -1, 7][axis]!, 12));
        pointsOf(arc!, [210, 220, 230])[0]!.forEach((value, axis) => expect(value).toBeCloseTo(unit(tilted)[axis]!, 15));
        expect([numberOf(arc!, 50), numberOf(arc!, 51)]).toEqual([315, 45]);
    });

    it("should write a circle about +Z of any length without an extrusion, at its own centre", () => {
        // Act
        const [ring] = write([{ center: [4, -1, 7], radius: 3, normal: [0, 0, 5] }]);

        // Assert
        expect([ring!.kind, valueOf(ring!, 210), pointsOf(ring!, [10, 20, 30])]).toEqual(["CIRCLE", undefined, [[4, -1, 7]]]);
    });

    it("should write an arc whose ends meet as the circle it is", () => {
        // Act
        const [closedArc] = write([{ center: [1, 1], radius: 2, startAngle: 30, endAngle: 30 }]);

        // Assert
        expect([closedArc!.kind, numberOf(closedArc!, 40)]).toEqual(["CIRCLE", 2]);
    });
});

describe("DXF polylines", () => {
    it("should write a planar polyline as a light polyline with its count, closed flag and elevation", () => {
        // Act
        const [slot] = write([{ points: [[0, 0, 2], [30, 0, 2], [30, 10, 2], [0, 10, 2]], closed: true, bulges: [0, 1, 0, 1] }]);

        // Assert
        expect([slot!.kind, numberOf(slot!, 90), valueOf(slot!, 70), numberOf(slot!, 38)]).toEqual(["LWPOLYLINE", 4, "1", 2]);
    });

    it("should write a light polyline's vertices in the plane, only its bulges that are not 0", () => {
        // Act
        const [slot] = write([{ points: [[0, 0, 2], [30, 0, 2], [30, 10, 2], [0, 10, 2]], closed: true, bulges: [0, 1, 0, 1] }]);

        // Assert
        expect([pointsOf(slot!, [10, 20, 20]).map(point => [point[0], point[1]]), numbersOf(slot!, 42)]).toEqual([[[0, 0], [30, 0], [30, 10], [0, 10]], [1, 1]]);
    });

    it("should close a polyline whose last point repeats its first, dropping the repeat and its bulge", () => {
        // Act
        const [closedByPoint] = write([{ points: [[0, 0], [5, 0], [5, 5], [0, 0]], bulges: [0, -0.5, 0, 9] }]);

        // Assert
        expect([numberOf(closedByPoint!, 90), valueOf(closedByPoint!, 70), valueOf(closedByPoint!, 38), numbersOf(closedByPoint!, 42)]).toEqual([3, "1", undefined, [-0.5]]);
    });

    it("should write a polyline that leaves one Z as a 3D polyline", () => {
        // Act
        const [polyline] = write([{ points: [[0, 0, 0], [10, 0, 1], [10, 10, 2]], closed: true }]);

        // Assert
        expect([polyline!.kind, numberOf(polyline!, 70), valuesOf(polyline!, 100)]).toEqual(["POLYLINE", 9, ["AcDbEntity", "AcDb3dPolyline"]]);
    });

    it("should write a 3D polyline's vertices with the 3D vertex flag and subclass, owned by the polyline, closed by SEQEND", () => {
        // Act
        const [polyline, ...rest] = write([{ points: [[0, 0, 0], [10, 0, 1], [10, 10, 2]], closed: true }]);

        // Assert
        expect(rest.map(record => record.kind)).toEqual(["VERTEX", "VERTEX", "VERTEX", "SEQEND"]);
        expect(rest.slice(0, -1).map(record => [...pointsOf(record, [10, 20, 30])[0]!, numberOf(record, 70), valuesOf(record, 100).at(-1)])).toEqual([
            [0, 0, 0, 32, "AcDb3dPolylineVertex"], [10, 0, 1, 32, "AcDb3dPolylineVertex"], [10, 10, 2, 32, "AcDb3dPolylineVertex"],
        ]);
        expect(rest.every(record => valueOf(record, 330) === valueOf(polyline!, 5))).toBe(true);
    });
});

describe("DXF splines", () => {
    const controlPoints: Point3[] = [[0, 0, 1], [2, 5, 1], [6, 5, 1], [8, 0, 1]];

    it("should write a planar spline's flags, degree, counts, clamped knots and control points", () => {
        // Act
        const [plain] = write([{ controlPoints, degree: 3 }]);

        // Assert
        expect([numberOf(plain!, 70), numberOf(plain!, 71), numberOf(plain!, 72), numberOf(plain!, 73)]).toEqual([8, 3, 8, 4]);
        expect([numbersOf(plain!, 40), pointsOf(plain!, [10, 20, 30]), pointsOf(plain!, [210, 220, 230]), valuesOf(plain!, 41)]).toEqual([[0, 0, 0, 0, 1, 1, 1, 1], controlPoints, [[0, 0, 1]], []]);
    });

    it("should write a rational spline's flag and a weight after each control point", () => {
        // Act
        const [rational] = write([{ controlPoints, degree: 2, weights: [1, 2, 0.5, 1] }]);

        // Assert
        expect([numberOf(rational!, 70), numberOf(rational!, 71), numbersOf(rational!, 40), numbersOf(rational!, 41)]).toEqual([12, 2, [0, 0, 0, 1, 2, 2, 2], [1, 2, 0.5, 1]]);
        expect(rational!.pairs.filter(pair => pair.code === 10 || pair.code === 41).map(pair => pair.code)).toEqual([10, 41, 10, 41, 10, 41, 10, 41]);
    });

    it("should write a spline whose weights are all equal as not rational", () => {
        // Act
        const [even] = write([{ controlPoints, degree: 2, weights: [2, 2, 2, 2] }]);

        // Assert
        expect([numberOf(even!, 70), valuesOf(even!, 41)]).toEqual([8, []]);
    });

    it("should write a spline out of one plane without the planar flag or an extrusion", () => {
        // Act
        const [spatial] = write([{ controlPoints: [[0, 0, 0], [1, 1, 1], [2, 0, 2]], degree: 2 }]);

        // Assert
        expect([numberOf(spatial!, 70), valueOf(spatial!, 210)]).toEqual([0, undefined]);
    });

    it("should write a spline given unclamped knots as the same curve with clamped ones", () => {
        // Arrange
        const points: Point3[] = [[0, 0, 0], [3, 6, 0], [7, -2, 0], [10, 4, 0], [14, 0, 0]];
        const knots = [0, 1, 2, 3, 4, 5, 6, 7, 8];
        const weights = [1, 0.5, 2, 1, 1];

        // Act
        const [spline] = write([{ controlPoints: points, degree: 3, knots, weights }]);

        // Assert
        const written = numbersOf(spline!, 40);
        expect([written.slice(0, 4), written.slice(-4)]).toEqual([[3, 3, 3, 3], [5, 5, 5, 5]]);
        Array.from({ length: 21 }, (_, step) => 3 + step / 10).forEach(parameter => {
            const expected = nurbsCurvePoint(3, points, weights, knots, parameter);
            nurbsCurvePoint(3, pointsOf(spline!, [10, 20, 30]), numbersOf(spline!, 41), written, parameter).forEach((value, axis) => expect(value).toBeCloseTo(expected[axis]!, 12));
        });
    });

    it("should close a spline without knots into the smooth loop a uniform B-spline through its wrapped control points draws", () => {
        // Arrange
        const loop: Point3[] = [[0, 0, 0], [10, 0, 0], [10, 10, 0], [0, 10, 0], [-3, 5, 0]];
        const uniform = (t: number, p: Point3[]): Point3 => {
            const b = [(1 - t) ** 3, 3 * t ** 3 - 6 * t ** 2 + 4, -3 * t ** 3 + 3 * t ** 2 + 3 * t + 1, t ** 3];
            return [0, 1, 2].map(axis => p.reduce((sum, point, at) => sum + b[at]! * point[axis]!, 0) / 6) as Point3;
        };

        // Act
        const [spline] = write([{ controlPoints: loop, degree: 3, closed: true }]);

        // Assert
        const points = pointsOf(spline!, [10, 20, 30]);
        const knots = numbersOf(spline!, 40);
        points[0]!.forEach((value, axis) => expect(value).toBeCloseTo(points[points.length - 1]![axis]!, 12));
        loop.flatMap((_, span) => [0, 0.3, 0.7].map(t => [span, t] as const)).forEach(([span, t]) => {
            const expected = uniform(t, [0, 1, 2, 3].map(offset => loop[(span + offset) % loop.length]!));
            nurbsCurvePoint(3, points, undefined, knots, 3 + span + t).forEach((value, axis) => expect(value).toBeCloseTo(expected[axis]!, 12));
        });
    });
});

describe("DXF ellipses", () => {
    it("should write an ellipse arc with its centre, major axis end, normal, ratio and parameters", () => {
        // Act
        const [arc] = write([{ center: [1, 2], majorAxis: [4, 0], ratio: 0.25, startParameter: 0.5, endParameter: 2 }]);

        // Assert
        expect([arc!.kind, ...pointsOf(arc!, [10, 20, 30])[0]!, ...pointsOf(arc!, [11, 21, 31])[0]!, ...pointsOf(arc!, [210, 220, 230])[0]!]).toEqual(["ELLIPSE", 1, 2, 0, 4, 0, 0, 0, 0, 1]);
        expect([numberOf(arc!, 40), numberOf(arc!, 41), numberOf(arc!, 42)]).toEqual([0.25, 0.5, 2]);
    });

    it("should write an ellipse arc that wraps past a whole turn with its end within the first turn", () => {
        // Act
        const [wrapping] = write([{ center: [0, 0], majorAxis: [0, 3], ratio: 0.5, startParameter: 5, endParameter: 1 }]);

        // Assert
        expect(numberOf(wrapping!, 41)).toBe(5);
        expect(numberOf(wrapping!, 42)).toBeCloseTo(1, 12);
    });

    it("should write a whole ellipse from 0 to 2 pi", () => {
        // Act
        const [whole] = write([{ center: [0, 0, 3], majorAxis: [2, 2], ratio: 1 }]);

        // Assert
        expect([numberOf(whole!, 41), numberOf(whole!, 42)]).toEqual([0, 2 * Math.PI]);
    });

    it("should write a tilted ellipse with its normal", () => {
        // Act
        const [tilted] = write([{ center: [0, 0], majorAxis: [1, 0, 0], ratio: 0.5, normal: [0, 1, 0] }]);

        // Assert
        expect(pointsOf(tilted!, [210, 220, 230])).toEqual([[0, 1, 0]]);
    });

    it("should write an ellipse arc from a negative parameter with both parameters within the first turn", () => {
        // Act
        const [negative] = write([{ center: [0, 0], majorAxis: [3, 0], ratio: 0.5, startParameter: -1, endParameter: 1 }]);

        // Assert
        expect(numberOf(negative!, 41)).toBeCloseTo(2 * Math.PI - 1, 12);
        expect(numberOf(negative!, 42)).toBeCloseTo(1, 12);
    });
});

describe("DXF curves in R12", () => {
    const controlPoints: Point3[] = [[0, 0, 0], [4, 9, 0], [9, -4, 0], [14, 6, 0]];
    const splineAt = (share: number): Point3 => nurbsCurvePoint(3, controlPoints, undefined, [0, 0, 0, 0, 1, 1, 1, 1], share);
    const ellipseAt = (share: number): Point3 => [10 * Math.cos(2 * Math.PI * share), 4 * Math.sin(2 * Math.PI * share), 0];

    it("should draw a spline as a polyline never further from it than the tolerance", () => {
        // Act
        const records = write([{ controlPoints, degree: 3 }], { acadVersion: "AC1009", curveTolerance: 0.05 });

        // Assert
        expect(largestGap(closedPolyline(records), splineAt)).toBeLessThanOrEqual(0.05 + 1e-9);
    });

    it("should draw a whole ellipse as a closed polyline of points on it, never further from it than the tolerance", () => {
        // Act
        const records = write([{ center: [0, 0], majorAxis: [10, 0], ratio: 0.4 }], { acadVersion: "AC1009", curveTolerance: 0.05 });

        // Assert
        const ellipse = closedPolyline(records);
        expect(numberOf(records[0]!, 70)).toBe(1);
        expect(largestGap(ellipse, ellipseAt)).toBeLessThanOrEqual(0.05 + 1e-9);
        ellipse.forEach(vertex => expect((vertex[0] / 10) ** 2 + (vertex[1] / 4) ** 2).toBeCloseTo(1, 12));
    });

    it("should draw more vertices for a finer tolerance", () => {
        // Act
        const coarse = write([{ controlPoints, degree: 3 }], { acadVersion: "AC1009", curveTolerance: 0.05 });
        const fine = write([{ controlPoints, degree: 3 }], { acadVersion: "AC1009", curveTolerance: 0.001 });

        // Assert
        expect(fine.filter(record => record.kind === "VERTEX").length).toBeGreaterThan(2 * coarse.filter(record => record.kind === "VERTEX").length);
    });
});
