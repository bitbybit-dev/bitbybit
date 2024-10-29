import { Inputs } from "..";
import { Context } from "../context";
import { GeometryHelper } from "../geometry-helper";
import { MathBitByBit } from "./math";
import { Vector } from "./vector";
import * as vrb from "verb-nurbs-web";

describe("Vector unit tests", () => {
    let vector: Vector;

    beforeAll(() => {
        const context = new Context();
        context.verb = vrb;
        vector = new Vector(context, new MathBitByBit(), new GeometryHelper(context));
    });

    it("should create xyz vector", () => {
        const res = vector.vectorXYZ({ x: 1, y: 2, z: 3 });
        expect(res).toEqual([1, 2, 3]);
    });

    it("should create xy vector", () => {
        const res = vector.vectorXY({ x: 1, y: 2 });
        expect(res).toEqual([1, 2]);
    });

    it("should remove all duplicate vectors", () => {
        const res = vector.removeAllDuplicateVectors({ vectors: [[1, 2], [1, 2], [2, 3], [2, 3]], tolerance: 0.1 });
        expect(res).toEqual([[1, 2], [2, 3]]);
    });

    it("should not remove duplicates vectors when tolerance is 0", () => {
        const res = vector.removeAllDuplicateVectors({ vectors: [[1, 2], [1, 2], [2, 3], [2, 3]], tolerance: 0 });
        expect(res).toEqual([[1, 2], [1, 2], [2, 3], [2, 3]]);
    });

    it("should remove all duplicate vectors with tolerance 0.0001", () => {
        const res = vector.removeAllDuplicateVectors({ vectors: [[1, 2], [1.00001, 2], [2, 3], [2, 3]], tolerance: 0.0001 });
        expect(res).toEqual([[1, 2], [2, 3]]);
    });

    it("should remove all duplicate vectors with tolerance 0.00001", () => {
        const res = vector.removeAllDuplicateVectors({ vectors: [[1, 2], [1.0000001, 2], [2, 3], [2, 3]], tolerance: 0.00001 });
        expect(res).toEqual([[1, 2], [2, 3]]);
    });

    it("should remove all duplicate vectors with tolerance 0.00001 that are not conseqtive", () => {
        const res = vector.removeAllDuplicateVectors({ vectors: [[1, 2], [1.0000001, 2], [2, 3], [2, 3], [1, 2.000000001]], tolerance: 0.00001 });
        expect(res).toEqual([[1, 2], [2, 3]]);
    });

    it("should remove consecutive duplicate vectors and not check first and last", () => {
        const res = vector.removeConsecutiveDuplicateVectors({ vectors: [[1, 2], [1, 2], [2, 3], [2, 3], [1, 2]], tolerance: 0.001, checkFirstAndLast: false });
        expect(res).toEqual([[1, 2], [2, 3], [1, 2]]);
    });

    it("should remove consecutive duplicate vectors and check first and last", () => {
        const res = vector.removeConsecutiveDuplicateVectors({ vectors: [[1.000001, 2], [1, 2], [2, 3], [2, 3], [1, 2]], tolerance: 0.001, checkFirstAndLast: true });
        expect(res).toEqual([[1, 2], [2, 3]]);
    });

    it("should measure angle between vectors", () => {
        const res = vector.angleBetween({ first: [1, 0, 0], second: [0, 1, 0] });
        expect(res).toBeCloseTo(90);
    });

    it("should measure angle between vectors", () => {
        const res = vector.angleBetween({ first: [1, 1.231, 0.3], second: [-13, 1, -0.5512] });
        expect(res).toBeCloseTo(124.51133246749056);
    });

    it("should measure angle between normalized 2d vectors", () => {
        const res = vector.angleBetweenNormalized2d({ first: [1, 1.231, 0.3], second: [-13, 1, -0.5512] });
        expect(res).toBeCloseTo(125.06491356368089);
    });

    it("should measure positive angle between normalized 2d vectors", () => {
        const res = vector.positiveAngleBetween({ first: [1, 0, 0], second: [0, 1, 0], reference: [0, 0, 1] });
        expect(res).toBeCloseTo(90);
    });

    it("should measure positive angle between normalized 2d vectors", () => {
        const res = vector.positiveAngleBetween({ first: [1, 0, 0], second: [0, 1, 0], reference: [0.5, -0.5, 1] });
        expect(res).toBeCloseTo(90);
    });

    it("should measure positive angle between normalized 2d vectors", () => {
        const res = vector.positiveAngleBetween({ first: [1, 1, 0], second: [0, 1, 0], reference: [0.5, 1, 1] });
        expect(res).toBeCloseTo(45);
    });

    it("should add all vectors", () => {
        const res = vector.addAll({ vectors: [[1, 2, 3], [3, 4, 5], [2, 3, 4]] });
        expect(res).toEqual([6, 9, 12]);
    });

    it("should add all vectors", () => {
        const res = vector.addAll({ vectors: [[1, 2, 3, 4, 5, 3, 4, 5, 6, 7]] });
        expect(res).toEqual([1, 2, 3, 4, 5, 3, 4, 5, 6, 7]);
    });

    it("should add two vectors", () => {
        const res = vector.add({ first: [1, 2, 3], second: [2, 3, 5] });
        expect(res).toEqual([3, 5, 8]);
    });

    it("should check if all values in the vector are true", () => {
        const res = vector.all({ vector: [true, true, true] });
        expect(res).toEqual(true);
    });

    it("should check if all values in the vector are true", () => {
        const res = vector.all({ vector: [true, false, true] });
        expect(res).toEqual(false);
    });

    it("should cross perpendicular vectors", () => {
        const res = vector.cross({ first: [1, 0, 0], second: [0, 1, 0] });
        expect(res).toEqual([0, 0, 1]);
    });

    it("should cross vectors", () => {
        const res = vector.cross({ first: [1, 1.2, 3], second: [-3, 1, -0.5] });
        expect(res).toEqual([-3.6, -8.5, 4.6]);
    });

    it("should compute dist squared", () => {
        const res = vector.distSquared({ first: [1, 2, 3], second: [4, 5, 6] });
        expect(res).toEqual(27);
    });

    it("should compute dist squared when vectors are the same", () => {
        const res = vector.distSquared({ first: [1, 2, 3], second: [1, 2, 3] });
        expect(res).toEqual(0);
    });

    it("should compute dist", () => {
        const res = vector.dist({ first: [1, 2, 3], second: [4, 5, 6] });
        expect(res).toEqual(5.196152422706632);
    });

    it("should compute dist", () => {
        const res = vector.dist({ first: [1, 2, 3], second: [1, 2, 3] });
        expect(res).toEqual(0);
    });

    it("should compute dist", () => {
        const res = vector.dist({ first: [1, -32, 3], second: [1, 23, -30] });
        expect(res).toEqual(64.1404708432983);
    });

    it("should compute div", () => {
        const res = vector.div({ vector: [1, -32, 3], scalar: 3 });
        expect(res).toEqual([1 / 3, -32 / 3, 1]);
    });

    it("should compute dot", () => {
        const res = vector.dot({ first: [1, 2, 3], second: [4, 5, 6] });
        expect(res).toEqual(32);
    });

    it("should compute domain", () => {
        const res = vector.domain({ vector: [1, 2, 3, 5, 6] });
        expect(res).toEqual(5);
    });

    it("should compute domain", () => {
        const res = vector.domain({ vector: [1, 2, -3, 5, 6, -12] });
        expect(res).toEqual(-13);
    });

    it("should check if there are no infinite values in vector", () => {
        const res = vector.finite({ vector: [1, 2, -3, 5, Infinity, -12] });
        expect(res).toEqual([true, true, true, true, false, true]);
    });

    it("should check if there are no infinite values in vector", () => {
        const res = vector.finite({ vector: [1, 2, -3, 5, 3, -12] });
        expect(res).toEqual([true, true, true, true, true, true]);
    });

    it("should check if vector is zero", () => {
        const res = vector.isZero({ vector: [0, 0, 0] });
        expect(res).toEqual(true);
    });

    it("should check if vector is zero", () => {
        const res = vector.isZero({ vector: [0, 0, 0, 0] });
        expect(res).toEqual(true);
    });

    it("should check if vector is zero", () => {
        const res = vector.isZero({ vector: [0, 1, 2] });
        expect(res).toEqual(false);
    });

    it("should compute lerp", () => {
        const res = vector.lerp({ first: [1, 2, 3], second: [4, 5, 6], fraction: 0.5 });
        expect(res).toEqual([2.5, 3.5, 4.5]);
    });

    it("should compute lerp", () => {
        const res = vector.lerp({ first: [1, 2, 3], second: [4, 5, 6], fraction: 0.1 });
        expect(res).toEqual([3.7, 4.7, 5.7]);
    });

    it("should find min value", () => {
        const res = vector.min({ vector: [1, 2, 3, -4, 3, 2] });
        expect(res).toEqual(-4);
    });

    it("should find max value", () => {
        const res = vector.max({ vector: [1, 2, 3, -4, 3, 2] });
        expect(res).toEqual(3);
    });

    it("should multiply vector", () => {
        const res = vector.mul({ vector: [1, 2, 3, -4, 3, 2], scalar: 2 });
        expect(res).toEqual([2, 4, 6, -8, 6, 4]);
    });

    it("should negate vector", () => {
        const res = vector.neg({ vector: [1, 2, 3, -4, 3, 2] });
        expect(res).toEqual([-1, -2, -3, 4, -3, -2]);
    });

    it("should compute norm squared", () => {
        const res = vector.normSquared({ vector: [1, 2, 3] });
        expect(res).toEqual(14);
    });

    it("should compute norm", () => {
        const res = vector.norm({ vector: [1, 2, 3] });
        expect(res).toEqual(3.7416573867739413);
    });

    it("should normalize vector", () => {
        const res = vector.norm({ vector: [1, 2, 3] });
        expect(res).toEqual(3.7416573867739413);
    });

    it("should find vector on ray", () => {
        const res = vector.onRay({ point: [1, 2, 3], vector: [1, 1, 1], distance: 3 });
        expect(res).toEqual([4, 5, 6]);
    });

    it("should create range", () => {
        const res = vector.range({ max: 5 });
        expect(res).toEqual([0, 1, 2, 3, 4]);
    });

    it("should compute signed angle between vectors", () => {
        const res = vector.signedAngleBetween({ first: [1, 0, 0], second: [0, 1, 0], reference: [0, 0, 1] });
        expect(res).toEqual(90);
    });

    it("should compute signed angle between vectors", () => {
        const res = vector.signedAngleBetween({ first: [-1, 0.3, -0.1], second: [0.2, 1.3, -0.5], reference: [-0.3, -0.5, 1] });
        expect(res).toEqual(279.35918473906344);
    });

    it("should create span", () => {
        const res = vector.span({ min: 1, max: 5, step: 0.5 });
        expect(res).toEqual([
            1, 1.5, 2, 2.5, 3,
            3.5, 4, 4.5, 5
        ]);
    });

    it("should create span ease in sine", () => {
        const res = vector.spanEaseItems({ min: 1, max: 5, ease: Inputs.Math.easeEnum.easeInSine, nrItems: 10, intervals: false });
        expect(res).toEqual([
            1,
            1.060768987951168,
            1.2412295168563663,
            1.5358983848622452,
            1.935822227524088,
            2.4288495612538425,
            2.9999999999999996,
            3.6319194266973245,
            4.305407289332278,
            5
        ]);
    });

    it("should create span ease in sine with intervals only", () => {
        const res = vector.spanEaseItems({ min: 1, max: 5, ease: Inputs.Math.easeEnum.easeInSine, nrItems: 10, intervals: true });
        expect(res).toEqual([
            1,
            0.06076898795116792,
            0.18046052890519837,
            0.2946688680058789,
            0.3999238426618428,
            0.4930273337297546,
            0.571150438746157,
            0.6319194266973249,
            0.6734878626349534,
            0.6945927106677221
        ]);
    });

    it("should create span ease out sine", () => {
        const res = vector.spanEaseItems({ min: 1, max: 5, ease: Inputs.Math.easeEnum.easeOutSine, nrItems: 10, intervals: false });
        expect(res).toEqual([
            1,
            1.6945927106677212,
            2.3680805733026746,
            3,
            3.571150438746157,
            4.064177772475912,
            4.464101615137754,
            4.758770483143634,
            4.9392310120488325,
            5
        ]);
    });

    it("should create span with linear items", () => {
        const res = vector.spanLinearItems({ nrItems: 10, min: 1, max: 5 });
        expect(res).toEqual([
            1,
            1.4444444444444444,
            1.8888888888888888,
            2.333333333333333,
            2.7777777777777777,
            3.2222222222222223,
            3.6666666666666665,
            4.111111111111111,
            4.5555555555555554,
            5
        ]);
    });

    it("should create span with linear items", () => {
        const res = vector.spanLinearItems({ nrItems: 15, min: -1, max: 5 });
        expect(res).toEqual([
            -1, -0.5714285714285714,
            -0.1428571428571429, 0.2857142857142858,
            0.7142857142857142, 1.1428571428571428,
            1.5714285714285716, 2,
            2.4285714285714284, 2.857142857142857,
            3.2857142857142856, 3.7142857142857144,
            4.142857142857143, 4.571428571428571,
            5
        ]);
    });

    it("should subtract two vectors", () => {
        const res = vector.sub({ first: [1, 2, 3], second: [2, 3, 5] });
        expect(res).toEqual([-1, -1, -2]);
    });

    it("should sum vector values", () => {
        const res = vector.sum({ vector: [1, 2, 3] });
        expect(res).toEqual(6);
    });
});

