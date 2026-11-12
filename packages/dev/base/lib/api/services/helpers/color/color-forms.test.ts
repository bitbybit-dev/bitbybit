import { describe, expect, it } from "vitest";
import { hexChannels, hslChannels } from "./color-forms";

describe("color forms", () => {
    it("should read six hex digits and three, with or without the hash, in either case", () => {
        // Act
        const read = ["#ff5733", "FF5733", "#f53", "F53", "#000", "#ffffff"].map(hexChannels);

        // Assert
        expect(read).toEqual([[255, 87, 51], [255, 87, 51], [255, 85, 51], [255, 85, 51], [0, 0, 0], [255, 255, 255]]);
    });

    it.each(["", "#", "#ff", "#ff57", "#ff57331", "#gg5733", "ff 573", "#ff5733 "])("should read nothing from %j", text => {
        // Act
        const read = hexChannels(text);

        // Assert
        expect(read).toBeUndefined();
    });

    it.each([
        { hue: 0, rgb: [1, 0, 0] },
        { hue: 60, rgb: [1, 1, 0] },
        { hue: 120, rgb: [0, 1, 0] },
        { hue: 180, rgb: [0, 1, 1] },
        { hue: 240, rgb: [0, 0, 1] },
        { hue: 300, rgb: [1, 0, 1] },
        { hue: 360, rgb: [1, 0, 0] },
        { hue: -120, rgb: [0, 0, 1] },
        { hue: 30, rgb: [1, 0.5, 0] },
    ])("should give the full hue $hue at saturation 1 and lightness 0.5", ({ hue, rgb }) => {
        // Act
        const channels = hslChannels(hue, 1, 0.5);

        // Assert
        channels.forEach((channel, at) => expect(channel).toBeCloseTo(rgb[at]!, 12));
    });

    it("should give grey at no saturation, black at no lightness and white at full lightness, whatever the hue", () => {
        // Act
        const grey = hslChannels(75, 0, 0.25);
        const black = hslChannels(200, 1, 0);
        const white = hslChannels(200, 1, 1);

        // Assert
        expect(grey).toEqual([0.25, 0.25, 0.25]);
        expect(black).toEqual([0, 0, 0]);
        expect(white).toEqual([1, 1, 1]);
    });

    it("should mix a part saturated hue toward its lightness", () => {
        // Act
        const channels = hslChannels(210, 0.6, 0.5);

        // Assert
        channels.forEach((channel, at) => expect(channel).toBeCloseTo([0.2, 0.5, 0.8][at]!, 12));
    });
});
