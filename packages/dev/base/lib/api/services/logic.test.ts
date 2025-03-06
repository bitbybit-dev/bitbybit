import { Logic } from "./logic";
import * as Inputs from "../inputs";

describe("Logic unit tests", () => {
    let logic: Logic;
    beforeAll(() => {
        logic = new Logic();
    });

    it("should create boolean true", () => {
        const res = logic.boolean({ boolean: true });
        expect(res).toBe(true);
    });

    it("should create boolean false", () => {
        const res = logic.boolean({ boolean: false });
        expect(res).toBe(false);
    });

    it("should create reandom list of boolean values", () => {
        const res = logic.randomBooleans({ length: 10, trueThreshold: 0.5 });
        expect(res.length).toBe(10);
    });

    it("should create reandom list of boolean values with true threshold on 1", () => {
        const res = logic.randomBooleans({ length: 10, trueThreshold: 1 });
        expect(res).toEqual([true, true, true, true, true, true, true, true, true, true]);
    });

    it("should create reandom list of boolean values with true threshold on 0", () => {
        const res = logic.randomBooleans({ length: 10, trueThreshold: 0 });
        expect(res).toEqual([false, false, false, false, false, false, false, false, false, false]);
    });

    it("should create threshold boolean list", () => {
        const res = logic.thresholdBooleanList({ numbers: [0.1, 0.2, 0.3], threshold: 0.2, inverse: false });
        expect(res).toEqual([true, false, false]);
    });

    it("should create inverted threshold boolean list", () => {
        const res = logic.thresholdBooleanList({ numbers: [0.1, 0.2, 0.3], threshold: 0.2, inverse: true });
        expect(res).toEqual([false, true, true]);
    });

    it("should create two threshold random gradient", () => {
        const res = logic.twoThresholdRandomGradient({ numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23], thresholdTotalTrue: 5, thresholdTotalFalse: 21, nrLevels: 10 });
        expect(res.length).toEqual(23);
        expect(res.filter(r => r === true).length).toBeGreaterThan(5);
        expect(res.filter(r => r === false).length).toBeGreaterThan(3);
    });

    it("should create boolean list based on gap thresholds", () => {
        const res = logic.thresholdGapsBooleanList({ numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], gapThresholds: [[2, 4], [6, 8]], inverse: false });
        expect(res).toEqual([
            false, true, true,
            true, false, true,
            true, true, false,
            false
        ]);
    });

    it("should create inverted boolean list based on gap thresholds", () => {
        const res = logic.thresholdGapsBooleanList({ numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], gapThresholds: [[2, 4], [6, 8]], inverse: true });
        expect(res).toEqual([
            true, false, false,
            false, true, false,
            false, false, true,
            true
        ]);
    });

    it("should invert true value with not", () => {
        const res = logic.not({ boolean: true });
        expect(res).toEqual(false);
    });

    it("should invert false value with not", () => {
        const res = logic.not({ boolean: false });
        expect(res).toEqual(true);
    });

    it("should invert a boolean list", () => {
        const res = logic.notList({ booleans: [false, false, true, false, true] });
        expect(res).toEqual([true, true, false, true, false]);
    });

    it("should compare two unequal values", () => {
        const res = logic.compare({ first: false, second: true, operator: Inputs.Logic.BooleanOperatorsEnum.equal });
        expect(res).toBe(false);
    });

    it("should compare two unequal values as equal without strict mode", () => {
        const res = logic.compare({ first: "1", second: 1 as any, operator: Inputs.Logic.BooleanOperatorsEnum.equal });
        expect(res).toBe(true);
    });

    it("should compare two unequal values as not equal without strict mode", () => {
        const res = logic.compare({ first: "1", second: 1 as any, operator: Inputs.Logic.BooleanOperatorsEnum.notEqual });
        expect(res).toBe(false);
    });

    it("should compare two unequal values as equal with strict mode", () => {
        const res = logic.compare({ first: "1", second: 1 as any, operator: Inputs.Logic.BooleanOperatorsEnum.tripleEqual });
        expect(res).toBe(false);
    });

    it("should compare two unequal values as not equal with strict mode", () => {
        const res = logic.compare({ first: "1", second: 1 as any, operator: Inputs.Logic.BooleanOperatorsEnum.tripleNotEqual });
        expect(res).toBe(true);
    });

    it("should compare two unequal values", () => {
        const res = logic.compare({ first: false, second: true, operator: Inputs.Logic.BooleanOperatorsEnum.notEqual });
        expect(res).toBe(true);
    });

    it("should compare two equal values", () => {
        const res = logic.compare({ first: false, second: false, operator: Inputs.Logic.BooleanOperatorsEnum.equal });
        expect(res).toBe(true);
    });

    it("should compare two equal values", () => {
        const res = logic.compare({ first: false, second: false, operator: Inputs.Logic.BooleanOperatorsEnum.notEqual });
        expect(res).toBe(false);
    });

    it("should check if 4 is less than 5", () => {
        const res = logic.compare({ first: 4, second: 5, operator: Inputs.Logic.BooleanOperatorsEnum.less });
        expect(res).toBe(true);
    });

    it("should check if 4 is greater than 5", () => {
        const res = logic.compare({ first: 4, second: 5, operator: Inputs.Logic.BooleanOperatorsEnum.greater });
        expect(res).toBe(false);
    });

    it("should check if 4 is less or equal to 5", () => {
        const res = logic.compare({ first: 5, second: 5, operator: Inputs.Logic.BooleanOperatorsEnum.lessOrEqual });
        expect(res).toBe(true);
    });

    it("should check if 5 is less or equal to 5", () => {
        const res = logic.compare({ first: 5, second: 5, operator: Inputs.Logic.BooleanOperatorsEnum.lessOrEqual });
        expect(res).toBe(true);
    });

    it("should check if 5 is greater or equal to 5", () => {
        const res = logic.compare({ first: 5, second: 5, operator: Inputs.Logic.BooleanOperatorsEnum.greaterOrEqual });
        expect(res).toBe(true);
    });

    it("should check if 6 is greater or equal to 5", () => {
        const res = logic.compare({ first: 5, second: 5, operator: Inputs.Logic.BooleanOperatorsEnum.greaterOrEqual });
        expect(res).toBe(true);
    });

    it("should return false if unknown operator is provided", () => {
        const res = logic.compare({ first: 5, second: 5, operator: "whatever" as any });
        expect(res).toBe(false);
    });

    it("should return value through the gate if boolean is true", () => {
        const res = logic.valueGate({ value: { d: "a" }, boolean: true });
        expect(res).toEqual({ d: "a" });
    });

    it("should not return value through the gate if boolean is false", () => {
        const res = logic.valueGate({ value: { d: "a" }, boolean: false });
        expect(res).toEqual(undefined);
    });

    it("should return first defined value", () => {
        const res = logic.firstDefinedValueGate({ value1: { d: "a" }, value2: { c: "x" } });
        expect(res).toEqual({ d: "a" });
    });

    it("should return first defined value", () => {
        const res = logic.firstDefinedValueGate({ value1: undefined, value2: { c: "x" } });
        expect(res).toEqual({ c: "x" });
    });

    it("should not return defined value if no values are defined", () => {
        const res = logic.firstDefinedValueGate({ value1: undefined, value2: undefined });
        expect(res).toEqual(undefined);
    });
});

