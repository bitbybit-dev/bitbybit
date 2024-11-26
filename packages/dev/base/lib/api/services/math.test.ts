import { MathBitByBit } from "./math";
import * as Inputs from "../inputs/inputs";

describe("Math unit tests", () => {
    let math: MathBitByBit;

    beforeAll(() => {
        math = new MathBitByBit();
    });

    it("should create number", () => {
        const result = math.number({ number: 1 });
        expect(result).toEqual(1);
    });

    it("should perform addition", () => {
        const result = math.twoNrOperation({ first: 1, second: 2, operation: Inputs.Math.mathTwoNrOperatorEnum.add });
        expect(result).toEqual(3);
    });

    it("should perform subtraction", () => {
        const result = math.twoNrOperation({ first: 1, second: 2, operation: Inputs.Math.mathTwoNrOperatorEnum.subtract });
        expect(result).toEqual(-1);
    });

    it("should perform multiplication", () => {
        const result = math.twoNrOperation({ first: 1, second: 2, operation: Inputs.Math.mathTwoNrOperatorEnum.multiply });
        expect(result).toEqual(2);
    });

    it("should perform division", () => {
        const result = math.twoNrOperation({ first: 1, second: 2, operation: Inputs.Math.mathTwoNrOperatorEnum.divide });
        expect(result).toEqual(0.5);
    });

    it("should perform modulus", () => {
        const result = math.twoNrOperation({ first: 1, second: 2, operation: Inputs.Math.mathTwoNrOperatorEnum.modulus });
        expect(result).toEqual(1);
    });

    it("should perform power", () => {
        const result = math.twoNrOperation({ first: 2, second: 3, operation: Inputs.Math.mathTwoNrOperatorEnum.power });
        expect(result).toEqual(8);
    });

    it("should not perform unknown two nr operation", () => {
        const result = math.twoNrOperation({ first: 2, second: 3, operation: "unknown" as any });
        expect(result).toEqual(undefined);
    });

    it("should perform square root", () => {
        const result = math.oneNrOperation({ number: 4, operation: Inputs.Math.mathOneNrOperatorEnum.sqrt });
        expect(result).toEqual(2);
    });

    it("should perform absolute", () => {
        const result = math.oneNrOperation({ number: -4, operation: Inputs.Math.mathOneNrOperatorEnum.absolute });
        expect(result).toEqual(4);
    });

    it("should perform round", () => {
        const result = math.oneNrOperation({ number: 4.5, operation: Inputs.Math.mathOneNrOperatorEnum.round });
        expect(result).toEqual(5);
    });

    it("should perform floor", () => {
        const result = math.oneNrOperation({ number: 4.5, operation: Inputs.Math.mathOneNrOperatorEnum.floor });
        expect(result).toEqual(4);
    });

    it("should perform ceiling", () => {
        const result = math.oneNrOperation({ number: 4.5, operation: Inputs.Math.mathOneNrOperatorEnum.ceil });
        expect(result).toEqual(5);
    });

    it("should perform negate", () => {
        const result = math.oneNrOperation({ number: 4, operation: Inputs.Math.mathOneNrOperatorEnum.negate });
        expect(result).toEqual(-4);
    });

    it("should perform natural logarithm", () => {
        const result = math.oneNrOperation({ number: 4, operation: Inputs.Math.mathOneNrOperatorEnum.ln });
        expect(result).toEqual(1.3862943611198906);
    });

    it("should perform log base 10", () => {
        const result = math.oneNrOperation({ number: 100, operation: Inputs.Math.mathOneNrOperatorEnum.log10 });
        expect(result).toEqual(2);
    });

    it("should perform 10 to the power", () => {
        const result = math.oneNrOperation({ number: 2, operation: Inputs.Math.mathOneNrOperatorEnum.tenPow });
        expect(result).toEqual(100);
    });

    it("should perform sine", () => {
        const result = math.oneNrOperation({ number: 90, operation: Inputs.Math.mathOneNrOperatorEnum.sin });
        expect(result).toEqual(0.8939966636005579);
    });

    it("should perform cosine", () => {
        const result = math.oneNrOperation({ number: 90, operation: Inputs.Math.mathOneNrOperatorEnum.cos });
        expect(result).toEqual(-0.4480736161291702);
    });

    it("should perform tangent", () => {
        const result = math.oneNrOperation({ number: 90, operation: Inputs.Math.mathOneNrOperatorEnum.tan });
        expect(result).toEqual(-1.995200412208242);
    });

    it("should perform arcsine", () => {
        const result = math.oneNrOperation({ number: 0.5, operation: Inputs.Math.mathOneNrOperatorEnum.asin });
        expect(result).toEqual(0.5235987755982989);
    });

    it("should perform acos", () => {
        const result = math.oneNrOperation({ number: 0.5, operation: Inputs.Math.mathOneNrOperatorEnum.acos });
        expect(result).toEqual(1.0471975511965979);
    });

    it("should perform atan", () => {
        const result = math.oneNrOperation({ number: 0.5, operation: Inputs.Math.mathOneNrOperatorEnum.atan });
        expect(result).toEqual(0.4636476090008061);
    });

    it("should perform exponential", () => {
        const result = math.oneNrOperation({ number: 2, operation: Inputs.Math.mathOneNrOperatorEnum.exp });
        expect(result).toEqual(7.38905609893065);
    });

    it("should perform log", () => {
        const result = math.oneNrOperation({ number: 2, operation: Inputs.Math.mathOneNrOperatorEnum.log });
        expect(result).toEqual(0.6931471805599453);
    });

    it("should convert deg to rad", () => {
        const result = math.oneNrOperation({ number: 90, operation: Inputs.Math.mathOneNrOperatorEnum.degToRad });
        expect(result).toEqual(1.5707963267948966);
    });

    it("should convert rad to deg", () => {
        const result = math.oneNrOperation({ number: 3.14, operation: Inputs.Math.mathOneNrOperatorEnum.radToDeg });
        expect(result).toEqual(179.90874767107852);
    });

    it("should convert rad to deg", () => {
        const result = math.oneNrOperation({ number: 3.14, operation: "unknown" as any });
        expect(result).toEqual(undefined);
    });

    it("should remap a number", () => {
        const result = math.remap({ number: 0.5, fromLow: 0, fromHigh: 1, toLow: 0, toHigh: 10 });
        expect(result).toEqual(5);
    });

    it("should compute modulus for number", () => {
        const result = math.modulus({ number: 5, modulus: 2 });
        expect(result).toEqual(1);
    });

    it("should round to decimals", () => {
        const result = math.roundToDecimals({ number: 5.12345, decimalPlaces: 2 });
        expect(result).toEqual(5.12);
    });

    it("should compute random number", () => {
        const result = math.randomNumber({ low: 0, high: 10 });
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThanOrEqual(10);
    });

    it("should compute random", () => {
        const result = math.random();
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThanOrEqual(1);
    });

    it("should create random numbers", () => {
        const result = math.randomNumbers({ count: 10, low: 0, high: 10 });
        expect(result.length).toEqual(10);
        result.forEach(r => {
            expect(r).toBeGreaterThanOrEqual(0);
            expect(r).toBeLessThanOrEqual(10);
        });
    });

    it("should compute pi", () => {
        const result = math.pi();
        expect(result).toEqual(Math.PI);
    });

    it("should convert nr to fixed", () => {
        const result = math.toFixed({ number: 5.12345, decimalPlaces: 2 });
        expect(result).toEqual("5.12");
    });

    it("should add two numbers", () => {
        const result = math.add({ first: 1, second: 2 });
        expect(result).toEqual(3);
    });

    it("should subtract two numbers", () => {
        const result = math.subtract({ first: 1, second: 2 });
        expect(result).toEqual(-1);
    });

    it("should multiply two numbers", () => {
        const result = math.multiply({ first: 1, second: 2 });
        expect(result).toEqual(2);
    });

    it("should divide two numbers", () => {
        const result = math.divide({ first: 1, second: 2 });
        expect(result).toEqual(0.5);
    });

    it("should compute power", () => {
        const result = math.power({ first: 2, second: 3 });
        expect(result).toEqual(8);
    });

    it("should compute square root", () => {
        const result = math.sqrt({ number: 4 });
        expect(result).toEqual(2);
    });

    it("should compute absolute", () => {
        const result = math.abs({ number: -4 });
        expect(result).toEqual(4);
    });

    it("should compute round", () => {
        const result = math.round({ number: 4.5 });
        expect(result).toEqual(5);
    });

    it("should compute floor", () => {
        const result = math.floor({ number: 4.5 });
        expect(result).toEqual(4);
    });

    it("should compute ceiling", () => {
        const result = math.ceil({ number: 4.5 });
        expect(result).toEqual(5);
    });

    it("should compute negate", () => {
        const result = math.negate({ number: 4 });
        expect(result).toEqual(-4);
    });

    it("should compute natural logarithm", () => {
        const result = math.ln({ number: 4 });
        expect(result).toEqual(1.3862943611198906);
    });

    it("should compute log base 10", () => {
        const result = math.log10({ number: 100 });
        expect(result).toEqual(2);
    });

    it("should compute 10 to the power", () => {
        const result = math.tenPow({ number: 2 });
        expect(result).toEqual(100);
    });

    it("should compute sine", () => {
        const result = math.sin({ number: 90 });
        expect(result).toEqual(0.8939966636005579);
    });

    it("should compute cosine", () => {
        const result = math.cos({ number: 90 });
        expect(result).toEqual(-0.4480736161291702);
    });

    it("should compute tangent", () => {
        const result = math.tan({ number: 90 });
        expect(result).toEqual(-1.995200412208242);
    });

    it("should compute arcsine", () => {
        const result = math.asin({ number: 0.5 });
        expect(result).toEqual(0.5235987755982989);
    });

    it("should compute acos", () => {
        const result = math.acos({ number: 0.5 });
        expect(result).toEqual(1.0471975511965979);
    });

    it("should compute atan", () => {
        const result = math.atan({ number: 0.5 });
        expect(result).toEqual(0.4636476090008061);
    });

    it("should compute exponential", () => {
        const result = math.exp({ number: 2 });
        expect(result).toEqual(7.38905609893065);
    });

    it("should compute deg to rad", () => {
        const result = math.degToRad({ number: 90 });
        expect(result).toEqual(1.5707963267948966);
    });

    it("should compute rad to deg", () => {
        const result = math.radToDeg({ number: 3.14 });
        expect(result).toEqual(179.90874767107852);
    });

    it("should compute remap", () => {
        const result = math.remap({ number: 0.5, fromLow: 0, fromHigh: 1, toLow: 0, toHigh: 10 });
        expect(result).toEqual(5);
    });

    it("should compute ease in sine", () => {
        const result = math.ease({ x: 0.3, min: 0, max: 1, ease: Inputs.Math.easeEnum.easeInSine });
        expect(result).toEqual(0.1089934758116321);
    });

    it("should compute ease in sine", () => {
        const result = math.ease({ x: 0.7, min: 0, max: 1, ease: Inputs.Math.easeEnum.easeInSine });
        expect(result).toEqual(0.5460095002604531);
    });

    it("should compute ease out sine", () => {
        const result = math.ease({ x: 0.3, min: 0, max: 1, ease: Inputs.Math.easeEnum.easeOutSine });
        expect(result).toEqual(0.45399049973954675);
    });

    it("should compute ease out sine", () => {
        const result = math.ease({ x: 0.7, min: 0, max: 1, ease: Inputs.Math.easeEnum.easeOutSine });
        expect(result).toEqual(0.8910065241883678);
    });

    it("should compute ease in out sine", () => {
        const result = math.ease({ x: 0.3, min: 0, max: 1, ease: Inputs.Math.easeEnum.easeInOutSine });
        expect(result).toEqual(0.20610737385376343);
    });

    it("should compute ease in out sine", () => {
        const result = math.ease({ x: 0.9, min: 0, max: 1, ease: Inputs.Math.easeEnum.easeInOutSine });
        expect(result).toEqual(0.9755282581475768);
    });

    it("should compute ease in quad", () => {
        const result = math.ease({ x: 0.3, min: 0, max: 1, ease: Inputs.Math.easeEnum.easeInQuad });
        expect(result).toEqual(0.09);
    });

    it("should compute ease in quad", () => {
        const result = math.ease({ x: 0.8, min: 0, max: 1, ease: Inputs.Math.easeEnum.easeInQuad });
        expect(result).toEqual(0.6400000000000001);
    });

    it("should compute ease out quad", () => {
        const result = math.ease({ x: 0.3, min: 0, max: 1, ease: Inputs.Math.easeEnum.easeOutQuad });
        expect(result).toEqual(0.51);
    });

    it("should compute ease out quad", () => {
        const result = math.ease({ x: 0.85, min: 0, max: 1, ease: Inputs.Math.easeEnum.easeOutQuad });
        expect(result).toEqual(0.9775);
    });

    it("should compute ease in out quad", () => {
        const result = math.ease({ x: 0.3, min: 0, max: 1, ease: Inputs.Math.easeEnum.easeInOutQuad });
        expect(result).toEqual(0.18);
    });

    it("should compute ease in out quad", () => {
        const result = math.ease({ x: 0.7, min: 0, max: 1, ease: Inputs.Math.easeEnum.easeInOutQuad });
        expect(result).toEqual(0.82);
    });

    it("should compute ease in cubic", () => {
        const result = math.ease({ x: 0.3, min: 0, max: 1, ease: Inputs.Math.easeEnum.easeInCubic });
        expect(result).toEqual(0.027);
    });

    it("should compute ease in cubic", () => {
        const result = math.ease({ x: 0.9, min: 0, max: 1, ease: Inputs.Math.easeEnum.easeInCubic });
        expect(result).toEqual(0.7290000000000001);
    });

    it("should compute ease out cubic", () => {
        const result = math.ease({ x: 0.3, min: 0, max: 1, ease: Inputs.Math.easeEnum.easeOutCubic });
        expect(result).toEqual(0.657);
    });

    it("should compute ease out cubic", () => {
        const result = math.ease({ x: 0.6, min: 0, max: 1, ease: Inputs.Math.easeEnum.easeOutCubic });
        expect(result).toEqual(0.9359999999999999);
    });

    it("should compute ease in out cubic", () => {
        const result = math.ease({ x: 0.3, min: 0, max: 1, ease: Inputs.Math.easeEnum.easeInOutCubic });
        expect(result).toEqual(0.108);
    });

    it("should compute ease in out cubic", () => {
        const result = math.ease({ x: 0.75, min: 0, max: 1, ease: Inputs.Math.easeEnum.easeInOutCubic });
        expect(result).toEqual(0.9375);
    });

    it("should compute ease in quart", () => {
        const result = math.ease({ x: 0.3, min: 0, max: 1, ease: Inputs.Math.easeEnum.easeInQuart });
        expect(result).toEqual(0.0081);
    });

    it("should compute ease in quart", () => {
        const result = math.ease({ x: 0.9, min: 0, max: 1, ease: Inputs.Math.easeEnum.easeInQuart });
        expect(result).toEqual(0.6561000000000001);
    });

    it("should compute ease out quart", () => {
        const result = math.ease({ x: 0.3, min: 0, max: 1, ease: Inputs.Math.easeEnum.easeOutQuart });
        expect(result).toEqual(0.7599);
    });

    it("should compute ease out quart", () => {
        const result = math.ease({ x: 0.87, min: 0, max: 1, ease: Inputs.Math.easeEnum.easeOutQuart });
        expect(result).toEqual(0.99971439);
    });

    it("should compute ease in out quart", () => {
        const result = math.ease({ x: 0.3, min: 0, max: 1, ease: Inputs.Math.easeEnum.easeInOutQuart });
        expect(result).toEqual(0.0648);
    });

    it("should compute ease in out quart", () => {
        const result = math.ease({ x: 0.8, min: 0, max: 1, ease: Inputs.Math.easeEnum.easeInOutQuart });
        expect(result).toEqual(0.9872);
    });

    it("should compute ease in quint", () => {
        const result = math.ease({ x: 0.3, min: 0, max: 1, ease: Inputs.Math.easeEnum.easeInQuint });
        expect(result).toEqual(0.00243);
    });

    it("should compute ease in quint", () => {
        const result = math.ease({ x: 0.9, min: 0, max: 1, ease: Inputs.Math.easeEnum.easeInQuint });
        expect(result).toEqual(0.5904900000000002);
    });

    it("should compute ease out quint", () => {
        const result = math.ease({ x: 0.3, min: 0, max: 1, ease: Inputs.Math.easeEnum.easeOutQuint });
        expect(result).toEqual(0.8319300000000001);
    });

    it("should compute ease out quint", () => {
        const result = math.ease({ x: 0.9, min: 0, max: 1, ease: Inputs.Math.easeEnum.easeOutQuint });
        expect(result).toEqual(0.99999);
    });

    it("should compute ease in out quint", () => {
        const result = math.ease({ x: 0.3, min: 0, max: 1, ease: Inputs.Math.easeEnum.easeInOutQuint });
        expect(result).toEqual(0.03888);
    });

    it("should compute ease in out quint", () => {
        const result = math.ease({ x: 0.9, min: 0, max: 1, ease: Inputs.Math.easeEnum.easeInOutQuint });
        expect(result).toEqual(0.99984);
    });

    it("should compute ease in expo", () => {
        const result = math.ease({ x: 0.3, min: 0, max: 1, ease: Inputs.Math.easeEnum.easeInExpo });
        expect(result).toEqual(0.0078125);
    });

    it("should compute ease in expo", () => {
        const result = math.ease({ x: 0.9, min: 0, max: 1, ease: Inputs.Math.easeEnum.easeInExpo });
        expect(result).toEqual(0.5);
    });

    it("should compute ease out expo", () => {
        const result = math.ease({ x: 0.3, min: 0, max: 1, ease: Inputs.Math.easeEnum.easeOutExpo });
        expect(result).toEqual(0.875);
    });

    it("should compute ease out expo", () => {
        const result = math.ease({ x: 0.9, min: 0, max: 1, ease: Inputs.Math.easeEnum.easeOutExpo });
        expect(result).toEqual(0.998046875);
    });

    it("should compute ease in out expo", () => {
        const result = math.ease({ x: 0.3, min: 0, max: 1, ease: Inputs.Math.easeEnum.easeInOutExpo });
        expect(result).toEqual(0.03125);
    });

    it("should compute ease in out expo", () => {
        const result = math.ease({ x: 0.9, min: 0, max: 1, ease: Inputs.Math.easeEnum.easeInOutExpo });
        expect(result).toEqual(0.998046875);
    });

    it("should compute ease in circ", () => {
        const result = math.ease({ x: 0.3, min: 0, max: 1, ease: Inputs.Math.easeEnum.easeInCirc });
        expect(result).toEqual(0.04606079858305434);
    });

    it("should compute ease in circ", () => {
        const result = math.ease({ x: 0.9, min: 0, max: 1, ease: Inputs.Math.easeEnum.easeInCirc });
        expect(result).toEqual(0.5641101056459328);
    });

    it("should compute ease out circ", () => {
        const result = math.ease({ x: 0.3, min: 0, max: 1, ease: Inputs.Math.easeEnum.easeOutCirc });
        expect(result).toEqual(0.714142842854285);
    });

    it("should compute ease out circ", () => {
        const result = math.ease({ x: 0.9, min: 0, max: 1, ease: Inputs.Math.easeEnum.easeOutCirc });
        expect(result).toEqual(0.99498743710662);
    });

    it("should compute ease in out circ", () => {
        const result = math.ease({ x: 0.3, min: 0, max: 1, ease: Inputs.Math.easeEnum.easeInOutCirc });
        expect(result).toEqual(0.09999999999999998);
    });

    it("should compute ease in out circ", () => {
        const result = math.ease({ x: 0.9, min: 0, max: 1, ease: Inputs.Math.easeEnum.easeInOutCirc });
        expect(result).toEqual(0.9898979485566356);
    });

    it("should compute ease in elastic", () => {
        const result = math.ease({ x: 0.3, min: 0, max: 1, ease: Inputs.Math.easeEnum.easeInElastic });
        expect(result).toEqual(-0.0039062499999999918);
    });

    it("should compute ease in elastic", () => {
        const result = math.ease({ x: 0.9, min: 0, max: 1, ease: Inputs.Math.easeEnum.easeInElastic });
        expect(result).toEqual(-0.24999999999999986);
    });

    it("should compute ease out elastic", () => {
        const result = math.ease({ x: 0.3, min: 0, max: 1, ease: Inputs.Math.easeEnum.easeOutElastic });
        expect(result).toEqual(0.875);
    });

    it("should compute ease out elastic", () => {
        const result = math.ease({ x: 0.9, min: 0, max: 1, ease: Inputs.Math.easeEnum.easeOutElastic });
        expect(result).toEqual(0.998046875);
    });

    it("should compute ease in out elastic", () => {
        const result = math.ease({ x: 0.3, min: 0, max: 1, ease: Inputs.Math.easeEnum.easeInOutElastic });
        expect(result).toEqual(0.023938888847468056);
    });

    it("should compute ease in out elastic", () => {
        const result = math.ease({ x: 0.9, min: 0, max: 1, ease: Inputs.Math.easeEnum.easeInOutElastic });
        expect(result).toEqual(0.9996608434029943);
    });

    it("should compute ease in back", () => {
        const result = math.ease({ x: 0.3, min: 0, max: 1, ease: Inputs.Math.easeEnum.easeInBack });
        expect(result).toEqual(-0.08019953999999999);
    });

    it("should compute ease in back", () => {
        const result = math.ease({ x: 0.9, min: 0, max: 1, ease: Inputs.Math.easeEnum.easeInBack });
        expect(result).toEqual(0.5911720200000001);
    });

    it("should compute ease out back", () => {
        const result = math.ease({ x: 0.3, min: 0, max: 1, ease: Inputs.Math.easeEnum.easeOutBack });
        expect(result).toEqual(0.9071322600000001);
    });

    it("should compute ease out back", () => {
        const result = math.ease({ x: 0.9, min: 0, max: 1, ease: Inputs.Math.easeEnum.easeOutBack });
        expect(result).toEqual(1.01431422);
    });

    it("should compute ease in out back", () => {
        const result = math.ease({ x: 0.3, min: 0, max: 1, ease: Inputs.Math.easeEnum.easeInOutBack });
        expect(result).toEqual(-0.07883348399999998);
    });

    it("should compute ease in out back", () => {
        const result = math.ease({ x: 0.9, min: 0, max: 1, ease: Inputs.Math.easeEnum.easeInOutBack });
        expect(result).toEqual(1.0375185519999999);
    });

    it("should compute ease in bounce", () => {
        const result = math.ease({ x: 0.3, min: 0, max: 1, ease: Inputs.Math.easeEnum.easeInBounce });
        expect(result).toEqual(0.06937499999999996);
    });

    it("should compute ease in bounce", () => {
        const result = math.ease({ x: 0.9, min: 0, max: 1, ease: Inputs.Math.easeEnum.easeInBounce });
        expect(result).toEqual(0.9243750000000001);
    });

    it("should compute ease out bounce", () => {
        const result = math.ease({ x: 0.3, min: 0, max: 1, ease: Inputs.Math.easeEnum.easeOutBounce });
        expect(result).toEqual(0.6806249999999999);
    });

    it("should compute ease out bounce", () => {
        const result = math.ease({ x: 0.9, min: 0, max: 1, ease: Inputs.Math.easeEnum.easeOutBounce });
        expect(result).toEqual(0.9881249999999999);
    });

    it("should compute ease in out bounce", () => {
        const result = math.ease({ x: 0.3, min: 0, max: 1, ease: Inputs.Math.easeEnum.easeInOutBounce });
        expect(result).toEqual(0.045000000000000095);
    });

    it("should compute ease in out bounce", () => {
        const result = math.ease({ x: 0.9, min: 0, max: 1, ease: Inputs.Math.easeEnum.easeInOutBounce });
        expect(result).toEqual(0.97);
    });

    it("should compute ease in out bounce", () => {
        const result = math.ease({ x: 0.99, min: 0, max: 1, ease: Inputs.Math.easeEnum.easeInOutBounce });
        expect(result).toEqual(0.9946375000000001);
    });
});

