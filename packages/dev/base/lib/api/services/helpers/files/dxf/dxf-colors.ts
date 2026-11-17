import { hexChannels, hslChannels } from "../../color/color-forms";
import {
    DXF_FIXED_COLORS, DXF_GRAYS, DXF_HUE_STEP_DEGREES, DXF_HUES, DXF_PASTEL_SHARE, DXF_PURE_HUE_LIGHTNESS, DXF_SHADES,
    DXF_TRUE_COLOR_GREEN, DXF_TRUE_COLOR_RED, DXF_WHITE_OR_BLACK,
} from "./dxf.constants";

type Rgb = readonly [number, number, number];

const hueRgb = (hue: number, level: number): Rgb => {
    const [red, green, blue] = hslChannels(hue, 1, DXF_PURE_HUE_LIGHTNESS);
    return [red * level, green * level, blue * level];
};

const pastel = (rgb: Rgb, level: number): Rgb => [
    rgb[0] + (level - rgb[0]) * DXF_PASTEL_SHARE,
    rgb[1] + (level - rgb[1]) * DXF_PASTEL_SHARE,
    rgb[2] + (level - rgb[2]) * DXF_PASTEL_SHARE,
];

const huePalette = (): Rgb[] => {
    const palette: Rgb[] = [];
    for (let hue = 0; hue < DXF_HUES; hue++) {
        for (const level of DXF_SHADES) {
            const full = hueRgb(hue * DXF_HUE_STEP_DEGREES, level);
            palette.push(full, pastel(full, level));
        }
    }
    return palette;
};

export const ACI_PALETTE: readonly Rgb[] = [
    ...DXF_FIXED_COLORS,
    ...huePalette(),
    ...DXF_GRAYS.map((gray): Rgb => [gray, gray, gray]),
];

const BLACK: Rgb = [0, 0, 0];

const INDEXED_COLORS: readonly (readonly [number, Rgb])[] = [[DXF_WHITE_OR_BLACK, BLACK], ...ACI_PALETTE.map((rgb, at): [number, Rgb] => [at + 1, rgb])];

export const nearestAciIndex = (hex: string): number => {
    const [red, green, blue] = hexChannels(hex)!;
    let nearest = DXF_WHITE_OR_BLACK;
    let nearestDistance = Infinity;
    for (const [index, rgb] of INDEXED_COLORS) {
        const distance = (rgb[0] - red) ** 2 + (rgb[1] - green) ** 2 + (rgb[2] - blue) ** 2;
        if (distance < nearestDistance) {
            nearestDistance = distance;
            nearest = index;
        }
    }
    return nearest;
};

export const trueColorOf = (hex: string): number => {
    const [red, green, blue] = hexChannels(hex)!;
    return red * DXF_TRUE_COLOR_RED + green * DXF_TRUE_COLOR_GREEN + blue;
};
