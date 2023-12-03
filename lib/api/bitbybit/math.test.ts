import { MathBitByBit } from "./math";
import * as Inputs from "../inputs/inputs";

describe("Math unit tests", () => {
    let math: MathBitByBit;

    beforeAll(async () => {
        math = new MathBitByBit();
    });

    it("should create number", async () => {
        const result = math.number({ number: 1 });
        expect(result).toEqual(1);
    });

    it("should perform addition", async () => {
        const result = math.twoNrOperation({ first: 1, second: 2, operation: Inputs.Math.mathTwoNrOperatorEnum.add });
        expect(result).toEqual(3);
    });

    it("should perform subtraction", async () => {
        const result = math.twoNrOperation({ first: 1, second: 2, operation: Inputs.Math.mathTwoNrOperatorEnum.subtract });
        expect(result).toEqual(-1);
    });

    it("should perform multiplication", async () => {
        const result = math.twoNrOperation({ first: 1, second: 2, operation: Inputs.Math.mathTwoNrOperatorEnum.multiply });
        expect(result).toEqual(2);
    });

    it("should perform division", async () => {
        const result = math.twoNrOperation({ first: 1, second: 2, operation: Inputs.Math.mathTwoNrOperatorEnum.divide });
        expect(result).toEqual(0.5);
    });

    it("should perform modulus", async () => {
        const result = math.twoNrOperation({ first: 1, second: 2, operation: Inputs.Math.mathTwoNrOperatorEnum.modulus });
        expect(result).toEqual(1);
    });

    it("should perform power", async () => {
        const result = math.twoNrOperation({ first: 2, second: 3, operation: Inputs.Math.mathTwoNrOperatorEnum.power });
        expect(result).toEqual(8);
    });

    it("should perform square root", async () => {
        const result = math.oneNrOperation({ number: 4, operation: Inputs.Math.mathOneNrOperatorEnum.sqrt });
        expect(result).toEqual(2);
    });

    it("should perform absolute", async () => {
        const result = math.oneNrOperation({ number: -4, operation: Inputs.Math.mathOneNrOperatorEnum.absolute });
        expect(result).toEqual(4);
    });

    it("should perform round", async () => {
        const result = math.oneNrOperation({ number: 4.5, operation: Inputs.Math.mathOneNrOperatorEnum.round });
        expect(result).toEqual(5);
    });

    it("should perform floor", async () => {
        const result = math.oneNrOperation({ number: 4.5, operation: Inputs.Math.mathOneNrOperatorEnum.floor });
        expect(result).toEqual(4);
    });

    it("should perform ceiling", async () => {
        const result = math.oneNrOperation({ number: 4.5, operation: Inputs.Math.mathOneNrOperatorEnum.ceil });
        expect(result).toEqual(5);
    });

    it("should perform negate", async () => {
        const result = math.oneNrOperation({ number: 4, operation: Inputs.Math.mathOneNrOperatorEnum.negate });
        expect(result).toEqual(-4);
    });

    it("should perform natural logarithm", async () => {
        const result = math.oneNrOperation({ number: 4, operation: Inputs.Math.mathOneNrOperatorEnum.ln });
        expect(result).toEqual(1.3862943611198906);
    });

    it("should perform log base 10", async () => {
        const result = math.oneNrOperation({ number: 100, operation: Inputs.Math.mathOneNrOperatorEnum.log10 });
        expect(result).toEqual(2);
    });

    it("should perform 10 to the power", async () => {
        const result = math.oneNrOperation({ number: 2, operation: Inputs.Math.mathOneNrOperatorEnum.tenPow });
        expect(result).toEqual(100);
    });

    it("should perform sine", async () => {
        const result = math.oneNrOperation({ number: 90, operation: Inputs.Math.mathOneNrOperatorEnum.sin });
        expect(result).toEqual(0.8939966636005579);
    });

    it("should perform cosine", async () => {
        const result = math.oneNrOperation({ number: 90, operation: Inputs.Math.mathOneNrOperatorEnum.cos });
        expect(result).toEqual(-0.4480736161291702);
    });

    it("should perform tangent", async () => {
        const result = math.oneNrOperation({ number: 90, operation: Inputs.Math.mathOneNrOperatorEnum.tan });
        expect(result).toEqual(-1.995200412208242);
    });

    it("should perform arcsine", async () => {
        const result = math.oneNrOperation({ number: 0.5, operation: Inputs.Math.mathOneNrOperatorEnum.asin });
        expect(result).toEqual(0.5235987755982989);
    });

    it("should remap a number", async () => {
        const result = math.remap({ number: 0.5, fromLow: 0, fromHigh: 1, toLow: 0, toHigh: 10 });
        expect(result).toEqual(5);
    });

});

