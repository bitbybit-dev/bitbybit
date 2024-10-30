import { ContextBase } from "../context";
import { Color } from "./color";

describe("Color unit tests", () => {
    let color: Color;

    beforeAll(async () => {
        const context = new ContextBase();
        color = new Color(context);
    });

    it("should create hex color", () => {
        const res = color.hexColor({ color: "#ff0000" });
        expect(res).toEqual("#ff0000");
    });

    it("should convert hex to rgb", () => {
        const res = color.hexToRgb({ color: "#ff0000" });
        expect(res).toEqual({ r: 255, g: 0, b: 0 });
    });

    it("should convert hex to rgb mapped", () => {
        const res = color.hexToRgbMapped({ color: "#ff0000", from: 0, to: 1 });
        expect(res).toEqual({ r: 1, g: 0, b: 0 });
    });

    it("should get red param", () => {
        const res = color.getRedParam({ color: "#ff0000", from: 0, to: 1 });
        expect(res).toEqual(1);
    });

    it("should get green param", () => {
        const res = color.getGreenParam({ color: "#00ff00", from: 0, to: 1 });
        expect(res).toEqual(1);
    });

    it("should get blue param", () => {
        const res = color.getBlueParam({ color: "#0000ff", from: 0, to: 1 });
        expect(res).toEqual(1);
    });

    it("should convert rgb to hex", () => {
        const res = color.rgbToHex({ r: 255, g: 150, b: 23, min: 0, max: 255 });
        expect(res).toEqual("#ff9617");
    });

    it("should convert rgb to hex", () => {
        const res = color.rgbToHex({ r: 1, g: 0.3, b: 0.6, min: 0, max: 1 });
        expect(res).toEqual("#ff4d99");
    });

    it("should convert rgb obj to hex", () => {
        const res = color.rgbObjToHex({ rgb: { r: 1, g: 0.3, b: 0.6 }, min: 0, max: 1 });
        expect(res).toEqual("#ff4d99");
    });

    it("should get R from rgb obj", () => {
        const res = color.rgbToRed({ rgb: { r: 1, g: 0.3, b: 0.6 } });
        expect(res).toEqual(1);
    });

    it("should get G from rgb obj", () => {
        const res = color.rgbToGreen({ rgb: { r: 1, g: 0.3, b: 0.6 } });
        expect(res).toEqual(0.3);
    });

    it("should get B from rgb obj", () => {
        const res = color.rgbToBlue({ rgb: { r: 1, g: 0.3, b: 0.6 } });
        expect(res).toEqual(0.6);
    });

    it("should invert colors", () => {
        const res = color.invert({ color: "#ff4d99", blackAndWhite: false });
        expect(res).toEqual("#00b266");
    });

    it("should invert colors to black and white", () => {
        const res = color.invert({ color: "#ff4d99", blackAndWhite: true });
        expect(res).toEqual("#ffffff");
    });

    it("should invert colors to black and white", () => {
        const res = color.invert({ color: "#ffeeaa", blackAndWhite: true });
        expect(res).toEqual("#000000");
    });
});
