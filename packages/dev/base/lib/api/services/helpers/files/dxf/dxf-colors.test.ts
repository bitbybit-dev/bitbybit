import { describe, expect, it } from "vitest";
import { ACI_PALETTE, nearestAciIndex, trueColorOf } from "./dxf-colors";

describe("AutoCAD index colors", () => {
    it("should hold the 255 index colors: nine fixed, 24 hues in five shades each full and pastel, and six greys", () => {
        // Act
        const palette = [ACI_PALETTE.length, ACI_PALETTE[0], ACI_PALETTE[9], ACI_PALETTE[10], ACI_PALETTE[29], ACI_PALETTE[172], ACI_PALETTE[254]];

        // Assert
        expect(palette).toEqual([255, [255, 0, 0], [255, 0, 0], [255, 170, 170], [255, 127.5, 0], [126, 126, 189], [255, 255, 255]]);
    });

    it.each([
        ["#ff0000", 1],
        ["#ffff00", 2],
        ["#00ff00", 3],
        ["#000000", 7],
        ["#ffffff", 7],
        ["#808080", 9],
        ["#ff8000", 30],
        ["#3f7fbf", 173],
    ])("should write %s as the nearest index color, %s, black and white both as 7", (hex, index) => {
        // Act
        const nearest = nearestAciIndex(hex);

        // Assert
        expect(nearest).toBe(index);
    });

    it("should write colors nearer black than any index color as 7, never as a dark hue, and a dark red still as the dark red index", () => {
        // Act
        const indexes = ["#010101", "#050505", "#0a0a0a", "#050506", "#000010", "#4f0000"].map(nearestAciIndex);

        // Assert
        expect(indexes).toEqual([7, 7, 7, 7, 7, 18]);
    });

    it("should read a short hex color as the long one it stands for", () => {
        // Act
        const indexes = [nearestAciIndex("#f80"), nearestAciIndex("#ff8800")];

        // Assert
        expect(indexes).toEqual([30, 30]);
    });
});

describe("DXF true colors", () => {
    it.each([["#ff8800", 0xff8800], ["#f80", 0xff8800], ["#010203", 0x010203]])("should write %s as the 24-bit number %s", (hex, number) => {
        // Act
        const written = trueColorOf(hex);

        // Assert
        expect(written).toBe(number);
    });
});
