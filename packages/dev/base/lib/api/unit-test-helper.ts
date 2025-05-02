import * as Inputs from "./inputs";
import { GeometryHelper, MathBitByBit, Vector } from "./services";

export const TOLERANCE = 1e-7;

export class UnitTestHelper {
    vector: Vector;
    constructor() {
        const math = new MathBitByBit();
        const geometryHelper = new GeometryHelper();
        this.vector = new Vector(math, geometryHelper);
    }

    expectPointCloseTo(
        received: Inputs.Base.Point3 | Inputs.Base.Vector3 | undefined,
        expected: Inputs.Base.Point3 | Inputs.Base.Vector3
    ) {
        expect(received).toBeDefined();
        if (!received) return;
        expect(received.length).toEqual(expected.length);
        expect(received[0]).toBeCloseTo(expected[0], TOLERANCE);
        expect(received[1]).toBeCloseTo(expected[1], TOLERANCE);
        if (expected.length > 2 && received.length > 2) {
            expect(received[2]).toBeCloseTo(expected[2], TOLERANCE);
        }
    }

    expectPointsCloseTo(
        received: Inputs.Base.Point3[] | Inputs.Base.Vector3[],
        expected: Inputs.Base.Point3[] | Inputs.Base.Vector3[]
    ) {
        expect(received.length).toEqual(expected.length);
        received.forEach((p, i) => this.expectPointCloseTo(p, expected[i]));
    }

    expectLineCloseTo(
        received: Inputs.Base.Line3 | undefined,
        expected: Inputs.Base.Line3
    ) {
        expect(received).toBeDefined();
        if (!received) return;
        this.expectPointCloseTo(received.start, expected.start);
        this.expectPointCloseTo(received.end, expected.end);
    }

    expectLinesCloseTo(
        received: Inputs.Base.Line3[],
        expected: Inputs.Base.Line3[]
    ) {
        expect(received.length).toEqual(expected.length);
        received.forEach((l, i) => this.expectLineCloseTo(l, expected[i]));
    }

    expectSegmentCloseTo(
        received: Inputs.Base.Segment3 | undefined,
        expected: Inputs.Base.Segment3,
        precision = TOLERANCE
    ) {
        expect(received).toBeDefined();
        if (!received) return;
        expect(received).toHaveLength(2);
        const order1Matches = Math.abs(this.vector.dist({ first: received[0], second: expected[0] })) < precision &&
            Math.abs(this.vector.dist({ first: received[1], second: expected[1] })) < precision;
        const order2Matches = Math.abs(this.vector.dist({ first: received[0], second: expected[1] })) < precision &&
            Math.abs(this.vector.dist({ first: received[1], second: expected[0] })) < precision;
        expect(order1Matches || order2Matches).toBe(true);
    }

    expectPlaneCloseTo(
        received: Inputs.Base.TrianglePlane3 | undefined,
        expected: Inputs.Base.TrianglePlane3,
        precision = TOLERANCE
    ) {
        expect(received).toBeDefined();
        if (!received) return;
        const normalDir1 = this.vector.sub({ first: received.normal, second: expected.normal });
        const normalDir2 = this.vector.add({ first: received.normal, second: expected.normal });
        const dir1Match = this.vector.lengthSq({ vector: normalDir1 as Inputs.Base.Vector3 }) < precision * precision;
        const dir2Match = this.vector.lengthSq({ vector: normalDir2 as Inputs.Base.Vector3 }) < precision * precision;
        expect(dir1Match || dir2Match).toBe(true);
        expect(received.d).toBeCloseTo(dir1Match ? expected.d : -expected.d, precision);
    }

    expectMatrixCloseTo(received: Inputs.Base.TransformMatrix | undefined, expected: Inputs.Base.TransformMatrix) {
        expect(received).toBeDefined();
        if (!received) return;
        expect(received).toHaveLength(16);
        expect(expected).toHaveLength(16);
        for (let i = 0; i < 16; i++) {
            expect(received[i]).toBeCloseTo(expected[i], TOLERANCE);
        }
    }

    expectMatrixesCloseTo(received: Inputs.Base.TransformMatrixes | undefined, expected: Inputs.Base.TransformMatrixes) {
        expect(received).toBeDefined();
        if (!received) return;
        expect(received.length).toEqual(expected.length);
        received.forEach((matrix, i) => this.expectMatrixCloseTo(matrix, expected[i]));
    }

    /** Helper to compare two arrays of points for near-equality, ignoring order */
    expectPointArraysCloseTo(
        actual: Inputs.Base.Point3[] | undefined,
        expected: Inputs.Base.Point3[],
        tolerance = 1e-6
    ) {
        // Use expectPointsClose helper for individual point comparison if needed
        const expectPointsClose = (act: Inputs.Base.Point3 | undefined, exp: Inputs.Base.Point3 | undefined, tol = 1e-6) => {
            const precision = Math.max(0, Math.ceil(-Math.log10(tol)) - 1);
            if (exp === undefined) {
                expect(act).toBeUndefined();
            } else {
                expect(act).toBeDefined();
                if (act) {
                    expect(act[0]).toBeCloseTo(exp[0], precision);
                    expect(act[1]).toBeCloseTo(exp[1], precision);
                    expect(act[2]).toBeCloseTo(exp[2], precision);
                }
            }
        };

        expect(actual).toBeDefined();

        // Proceed only if actual is defined
        if (actual) {
            expect(actual.length).toEqual(expected.length);

            // Sort both arrays to compare independent of order
            const sortedActual = this.sortPoints(actual);
            const sortedExpected = this.sortPoints(expected);

            for (let i = 0; i < sortedExpected.length; i++) {
                expectPointsClose(sortedActual[i], sortedExpected[i], tolerance);
            }
        }
    }

    sortPoints(points: Inputs.Base.Point3[]): Inputs.Base.Point3[] {
        return [...points].sort((a, b) => {
            if (a[0] !== b[0]) return a[0] - b[0];
            if (a[1] !== b[1]) return a[1] - b[1];
            return a[2] - b[2];
        });
    }

    sortPolylinesForComparison(polylines: Inputs.Base.Polyline3[]): Inputs.Base.Polyline3[] {
        return polylines.sort((a, b) => {
            const pA = a.points[0];
            const pB = b.points[0];
            if (pA[0] !== pB[0]) return pA[0] - pB[0];
            if (pA[1] !== pB[1]) return pA[1] - pB[1];
            return pA[2] - pB[2];
        });
    }

    expectFloatArraysClose(actual: number[], expected: number[], precision: number) {
        expect(actual.length).toBe(expected.length);
        actual.forEach((val, index) => {
            expect(val).toBeCloseTo(expected[index], precision);
        });
    };


}