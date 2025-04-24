import { GeometryHelper } from "./geometry-helper";
import { MathBitByBit } from "./math";
import { Point } from "./point";
import { TextBitByBit } from "./text";
import { Transforms } from "./transforms";
import { Vector } from "./vector";

describe("Text unit tests", () => {
    let text: TextBitByBit;

    beforeAll(async () => {
        const geometryHelper = new GeometryHelper();
        const math = new MathBitByBit();
        const vector = new Vector(math, geometryHelper);
        const transforms = new Transforms(vector, math);
        const points = new Point(geometryHelper, transforms, vector);
        text = new TextBitByBit(points);
    });

    it("should create a text", async () => {
        const result = text.create({ text: "Hello World, Matas" });
        expect(result).toEqual("Hello World, Matas");
    });

    it("should split text", async () => {
        const result = text.split({ text: "Hello World, Matas, Ubarevicius", separator: "," });
        expect(result).toEqual(["Hello World", " Matas", " Ubarevicius"]);
    });

    it("should replace all in text", async () => {
        const result = text.replaceAll({ text: "Hello World, Matas, Ubarevicius", search: ",", replaceWith: "-" });
        expect(result).toEqual("Hello World- Matas- Ubarevicius");
    });

    it("should join all items", async () => {
        const result = text.join({ list: ["Hello World", " Matas", " Ubarevicius"], separator: "," });
        expect(result).toEqual("Hello World, Matas, Ubarevicius");
    });

    it("should convert to string item", async () => {
        const result = text.toString({ item: [0, 0, 0] });
        expect(result).toEqual("0,0,0");
    });

    it("should convert to string items", async () => {
        const result = text.toStringEach({ list: [0, 1, 2] });
        expect(result).toEqual(["0", "1", "2"]);
    });

    it("should format string", () => {
        const result = text.format({ text: "Hello {0}, {1}", values: ["World", "Matas"] });
        expect(result).toEqual("Hello World, Matas");
    });

    it("should not format string if there are no values", () => {
        const result = text.format({ text: "Hello {0}, {1}", values: [] });
        expect(result).toEqual("Hello {0}, {1}");
    });

    it("should not format string if there are no placeholders", () => {
        const result = text.format({ text: "Hello World, Matas", values: ["dada"] });
        expect(result).toEqual("Hello World, Matas");
    });
});

