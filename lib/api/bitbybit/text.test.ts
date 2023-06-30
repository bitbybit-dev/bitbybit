import { TextBitByBit } from "./text";

describe("Text unit tests", () => {
    let text: TextBitByBit;

    beforeAll(async () => {
        text = new TextBitByBit();
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
});

