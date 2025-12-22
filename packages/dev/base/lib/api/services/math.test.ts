import { MathBitByBit } from "./math";
import * as Inputs from "../inputs";

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
        expect(result).toBeCloseTo(0.4539904997395468);
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

    it("should round to 3 decimals and keep non-zero trailing digits", () => {
        const result = math.roundAndRemoveTrailingZeros({ number: 1.32156, decimalPlaces: 3 });
        expect(result).toEqual(1.322);
    });

    it("should round to 3 decimals and remove trailing zeros", () => {
        const result = math.roundAndRemoveTrailingZeros({ number: 1.320000001, decimalPlaces: 3 });
        expect(result).toEqual(1.32);
    });

    it("should round 1.000 to 1 without decimals", () => {
        const result = math.roundAndRemoveTrailingZeros({ number: 1.000, decimalPlaces: 3 });
        expect(result).toEqual(1);
    });

    it("should round 1.0000001 to 1 with 3 decimals", () => {
        const result = math.roundAndRemoveTrailingZeros({ number: 1.0000001, decimalPlaces: 3 });
        expect(result).toEqual(1);
    });

    it("should round 5.12 to 5.12 with 3 decimals", () => {
        const result = math.roundAndRemoveTrailingZeros({ number: 5.12, decimalPlaces: 3 });
        expect(result).toEqual(5.12);
    });

    it("should round 5.1 to 5.1 with 3 decimals", () => {
        const result = math.roundAndRemoveTrailingZeros({ number: 5.1, decimalPlaces: 3 });
        expect(result).toEqual(5.1);
    });

    it("should round 3.14159 to 3.14 with 2 decimals", () => {
        const result = math.roundAndRemoveTrailingZeros({ number: 3.14159, decimalPlaces: 2 });
        expect(result).toEqual(3.14);
    });

    it("should round 10.00000001 to 10 with 2 decimals", () => {
        const result = math.roundAndRemoveTrailingZeros({ number: 10.00000001, decimalPlaces: 2 });
        expect(result).toEqual(10);
    });

    it("should round 0.505 to 0.51 with 2 decimals", () => {
        const result = math.roundAndRemoveTrailingZeros({ number: 0.505, decimalPlaces: 2 });
        expect(result).toEqual(0.51);
    });

    it("should round 0.500 to 0.5 with 2 decimals", () => {
        const result = math.roundAndRemoveTrailingZeros({ number: 0.500, decimalPlaces: 2 });
        expect(result).toEqual(0.5);
    });

    it("should round 2.9999 to 3 with 3 decimals", () => {
        const result = math.roundAndRemoveTrailingZeros({ number: 2.9999, decimalPlaces: 3 });
        expect(result).toEqual(3);
    });

    it("should round negative -1.320000001 to -1.32 with 3 decimals", () => {
        const result = math.roundAndRemoveTrailingZeros({ number: -1.320000001, decimalPlaces: 3 });
        expect(result).toEqual(-1.32);
    });

    it("should round negative -5.12789 to -5.128 with 3 decimals", () => {
        const result = math.roundAndRemoveTrailingZeros({ number: -5.12789, decimalPlaces: 3 });
        expect(result).toEqual(-5.128);
    });

    it("should handle 0 decimal places", () => {
        const result = math.roundAndRemoveTrailingZeros({ number: 5.6789, decimalPlaces: 0 });
        expect(result).toEqual(6);
    });

    it("should handle 5 decimal places with trailing zeros", () => {
        const result = math.roundAndRemoveTrailingZeros({ number: 1.123450000, decimalPlaces: 5 });
        expect(result).toEqual(1.12345);
    });

    it("should clamp value within range", () => {
        const result = math.clamp({ number: 1.5, min: 0, max: 3 });
        expect(result).toEqual(1.5);
    });

    it("should clamp value above max to max", () => {
        const result = math.clamp({ number: 5, min: 0, max: 3 });
        expect(result).toEqual(3);
    });

    it("should clamp value below min to min", () => {
        const result = math.clamp({ number: -1, min: 0, max: 3 });
        expect(result).toEqual(0);
    });

    it("should clamp negative values", () => {
        const result = math.clamp({ number: -5, min: -10, max: -2 });
        expect(result).toEqual(-5);
    });

    it("should lerp at t=0.5", () => {
        const result = math.lerp({ start: 0, end: 10, t: 0.5 });
        expect(result).toEqual(5);
    });

    it("should lerp at t=0", () => {
        const result = math.lerp({ start: 0, end: 10, t: 0 });
        expect(result).toEqual(0);
    });

    it("should lerp at t=1", () => {
        const result = math.lerp({ start: 0, end: 10, t: 1 });
        expect(result).toEqual(10);
    });

    it("should lerp at t=0.25", () => {
        const result = math.lerp({ start: 0, end: 10, t: 0.25 });
        expect(result).toEqual(2.5);
    });

    it("should lerp with negative values", () => {
        const result = math.lerp({ start: -10, end: 10, t: 0.5 });
        expect(result).toEqual(0);
    });

    it("should inverse lerp at midpoint", () => {
        const result = math.inverseLerp({ start: 0, end: 10, value: 5 });
        expect(result).toEqual(0.5);
    });

    it("should inverse lerp at start", () => {
        const result = math.inverseLerp({ start: 0, end: 10, value: 0 });
        expect(result).toEqual(0);
    });

    it("should inverse lerp at end", () => {
        const result = math.inverseLerp({ start: 0, end: 10, value: 10 });
        expect(result).toEqual(1);
    });

    it("should inverse lerp at 0.25", () => {
        const result = math.inverseLerp({ start: 0, end: 10, value: 2.5 });
        expect(result).toEqual(0.25);
    });

    it("should inverse lerp with same start and end return 0", () => {
        const result = math.inverseLerp({ start: 5, end: 5, value: 5 });
        expect(result).toEqual(0);
    });

    it("should smoothstep at 0", () => {
        const result = math.smoothstep({ number: 0 });
        expect(result).toEqual(0);
    });

    it("should smoothstep at 1", () => {
        const result = math.smoothstep({ number: 1 });
        expect(result).toEqual(1);
    });

    it("should smoothstep at 0.5", () => {
        const result = math.smoothstep({ number: 0.5 });
        expect(result).toEqual(0.5);
    });

    it("should smoothstep clamp below 0", () => {
        const result = math.smoothstep({ number: -0.5 });
        expect(result).toEqual(0);
    });

    it("should smoothstep clamp above 1", () => {
        const result = math.smoothstep({ number: 1.5 });
        expect(result).toEqual(1);
    });

    it("should return sign of positive number", () => {
        const result = math.sign({ number: 5 });
        expect(result).toEqual(1);
    });

    it("should return sign of negative number", () => {
        const result = math.sign({ number: -3.14 });
        expect(result).toEqual(-1);
    });

    it("should return sign of zero", () => {
        const result = math.sign({ number: 0 });
        expect(result).toEqual(0);
    });

    it("should return fractional part of positive number", () => {
        const result = math.fract({ number: 3.14 });
        expect(result).toBeCloseTo(0.14, 5);
    });

    it("should return fractional part of negative number", () => {
        const result = math.fract({ number: -2.3 });
        expect(result).toBeCloseTo(0.7, 5);
    });

    it("should return fractional part of integer", () => {
        const result = math.fract({ number: 5 });
        expect(result).toEqual(0);
    });

    it("should wrap value above max", () => {
        const result = math.wrap({ number: 1.5, min: 0, max: 1 });
        expect(result).toBeCloseTo(0.5, 5);
    });

    it("should wrap value below min", () => {
        const result = math.wrap({ number: -0.3, min: 0, max: 1 });
        expect(result).toBeCloseTo(0.7, 5);
    });

    it("should wrap angle 370 to 10 degrees", () => {
        const result = math.wrap({ number: 370, min: 0, max: 360 });
        expect(result).toBeCloseTo(10, 5);
    });

    it("should wrap value within range", () => {
        const result = math.wrap({ number: 0.5, min: 0, max: 1 });
        expect(result).toBeCloseTo(0.5, 5);
    });

    it("should handle wrap with zero range", () => {
        const result = math.wrap({ number: 5, min: 1, max: 1 });
        expect(result).toEqual(1);
    });

    it("should ping pong at 0.5", () => {
        const result = math.pingPong({ t: 0.5, length: 1 });
        expect(result).toEqual(0.5);
    });

    it("should ping pong at 1.5", () => {
        const result = math.pingPong({ t: 1.5, length: 1 });
        expect(result).toEqual(0.5);
    });

    it("should ping pong at 2.5", () => {
        const result = math.pingPong({ t: 2.5, length: 1 });
        expect(result).toEqual(0.5);
    });

    it("should ping pong at 1", () => {
        const result = math.pingPong({ t: 1, length: 1 });
        expect(result).toEqual(1);
    });

    it("should ping pong with negative t", () => {
        const result = math.pingPong({ t: -0.5, length: 1 });
        expect(result).toEqual(0.5);
    });

    it("should move towards target within delta", () => {
        const result = math.moveTowards({ current: 0, target: 10, maxDelta: 3 });
        expect(result).toEqual(3);
    });

    it("should move towards target and reach it", () => {
        const result = math.moveTowards({ current: 8, target: 10, maxDelta: 3 });
        expect(result).toEqual(10);
    });

    it("should move towards negative target", () => {
        const result = math.moveTowards({ current: 0, target: -10, maxDelta: 3 });
        expect(result).toEqual(-3);
    });

    it("should not overshoot target", () => {
        const result = math.moveTowards({ current: 9.5, target: 10, maxDelta: 1 });
        expect(result).toEqual(10);
    });

    it("should move backwards towards target", () => {
        const result = math.moveTowards({ current: 10, target: 0, maxDelta: 2 });
        expect(result).toEqual(8);
    });
});

