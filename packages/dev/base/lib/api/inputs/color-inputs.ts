/* eslint-disable @typescript-eslint/no-namespace */
import { Base } from "./base-inputs";

// tslint:disable-next-line: no-namespace
/**
 * Parameters for color handling: hex, RGB and HSL values, the components to combine or extract, and
 * the settings for blending, inverting and generating ranges of colors.
 */
export namespace Color {
    /**
     * A hex color for `color.hexColor` and `color.hexToRgb`.
     */
    export class HexDto {
        constructor(color?: Base.Color) {
            if (color !== undefined) { this.color = color; }
        }
        /**
         * The color as a hex text such as `#ff5733`, with or without the `#`.
         * @default #0000ff
         */
        color: Base.Color = "#0000ff";
    }
    /**
     * An `{ r, g, b }` color with channels from 0 to 255, for `color.rgb255Color`.
     */
    export class Rgb255Dto {
        constructor(colorRgb?: Base.ColorRGB) {
            if (colorRgb !== undefined) { this.colorRgb = colorRgb; }
        }
        /**
         * The color object; each channel from 0 to 255.
         * @default { "r": 0, "g": 0, "b": 255 }
         * @minimum 0
         * @maximum 255
         */
        colorRgb: Base.ColorRGB = { r: 0, g: 0, b: 255 };
    }
    /**
     * An `{ r, g, b }` color with channels from 0 to 1, for `color.rgb1Color`.
     */
    export class Rgb1Dto {
        constructor(colorRgb?: Base.ColorRGB) {
            if (colorRgb !== undefined) { this.colorRgb = colorRgb; }
        }
        /**
         * The color object; each channel from 0 to 1.
         * @default { "r": 0, "g": 0, "b": 1 }
         * @minimum 0
         * @maximum 1
         */
        colorRgb: Base.ColorRGB = { r: 0, g: 0, b: 1 };
    }
    /**
     * An `{ r, g, b, a }` color with color channels from 0 to 255 and opacity from 0 to 1, for
     * `color.rgba255Color`.
     */
    export class Rgba255Dto {
        constructor(colorRgba?: Base.ColorRGBA) {
            if (colorRgba !== undefined) { this.colorRgba = colorRgba; }
        }
        /**
         * The color object; `r`, `g` and `b` from 0 to 255 and `a` from 0 (transparent) to 1
         * (opaque).
         * @default { "r": 0, "g": 0, "b": 255, "a": 1 }
         * @minimum 0
         * @maximum 255
         */
        colorRgba: Base.ColorRGBA = { r: 0, g: 0, b: 255, a: 1 };
    }
    /**
     * An `{ r, g, b, a }` color with every channel from 0 to 1, for `color.rgba1Color`.
     */
    export class Rgba1Dto {
        constructor(colorRgba?: Base.ColorRGBA) {
            if (colorRgba !== undefined) { this.colorRgba = colorRgba; }
        }
        /**
         * The color object; every channel from 0 to 1, `a` being 0 for transparent and 1 for
         * opaque.
         * @default { "r": 0, "g": 0, "b": 1, "a": 1 }
         * @minimum 0
         * @maximum 1
         */
        colorRgba: Base.ColorRGBA = { r: 0, g: 0, b: 1, a: 1 };
    }
    /**
     * Separate red, green and blue values from 0 to 255, for color.rgbAtomic255Color.
     */
    export class RgbAttomic255Dto {
        constructor(r?: number, g?: number, b?: number) {
            if (r !== undefined) { this.r = r; }
            if (g !== undefined) { this.g = g; }
            if (b !== undefined) { this.b = b; }
        }
        /**
         * The red channel, from 0 to 255.
         * @default 0
         * @minimum 0
         * @maximum 255
         */
        r = 0;
        /**
         * The green channel, from 0 to 255.
         * @default 0
         * @minimum 0
         * @maximum 255
         */
        g = 0;
        /**
         * The blue channel, from 0 to 255.
         * @default 255
         * @minimum 0
         * @maximum 255
         */
        b = 255;
    }

    /**
     * Separate red, green, blue and alpha values from 0 to 255, for building a color.
     */
    export class RgbaAttomic255Dto {
        constructor(r?: number, g?: number, b?: number, a?: number) {
            if (r !== undefined) { this.r = r; }
            if (g !== undefined) { this.g = g; }
            if (b !== undefined) { this.b = b; }
            if (a !== undefined) { this.a = a; }
        }
        /**
         * The red channel, from 0 to 255.
         * @default 0
         * @minimum 0
         * @maximum 255
         */
        r = 0;
        /**
         * The green channel, from 0 to 255.
         * @default 0
         * @minimum 0
         * @maximum 255
         */
        g = 0;
        /**
         * The blue channel, from 0 to 255.
         * @default 255
         * @minimum 0
         * @maximum 255
         */
        b = 255;
        /**
         * The opacity, from 0 (transparent) to 1 (opaque).
         * @default 1
         * @minimum 0
         * @maximum 1
         */
        a = 1;
    }

    /**
     * Separate red, green and blue values from 0 to 1, for color.rgbAtomic1Color.
     */
    export class RgbAttomic1Dto {
        constructor(r?: number, g?: number, b?: number) {
            if (r !== undefined) { this.r = r; }
            if (g !== undefined) { this.g = g; }
            if (b !== undefined) { this.b = b; }
        }
        /**
         * The red channel, from 0 to 1.
         * @default 0
         * @minimum 0
         * @maximum 1
         */
        r = 0;
        /**
         * The green channel, from 0 to 1.
         * @default 0
         * @minimum 0
         * @maximum 1
         */
        g = 0;
        /**
         * The blue channel, from 0 to 1.
         * @default 1
         * @minimum 0
         * @maximum 1
         */
        b = 1;
    }

    /**
     * Separate red, green, blue and alpha values from 0 to 1, for building a color.
     */
    export class RgbaAttomic1Dto {
        constructor(r?: number, g?: number, b?: number, a?: number) {
            if (r !== undefined) { this.r = r; }
            if (g !== undefined) { this.g = g; }
            if (b !== undefined) { this.b = b; }
            if (a !== undefined) { this.a = a; }
        }
        /**
         * The red channel, from 0 to 1.
         * @default 0
         * @minimum 0
         * @maximum 1
         */
        r = 0;
        /**
         * The green channel, from 0 to 1.
         * @default 0
         * @minimum 0
         * @maximum 1
         */
        g = 0;
        /**
         * The blue channel, from 0 to 1.
         * @default 1
         * @minimum 0
         * @maximum 1
         */
        b = 1;
        /**
         * The opacity, from 0 (transparent) to 1 (opaque).
         * @default 1
         * @minimum 0
         * @maximum 1
         */
        a = 1;
    }
    /**
     * A hex color and a mode for `color.invert`.
     */
    export class InvertHexDto {
        constructor(color?: Base.Color) {
            if (color !== undefined) { this.color = color; }
        }
        /**
         * The color to invert, as a hex text such as `#ff5733`.
         * @default #0000ff
         */
        color: Base.Color = "#0000ff";
        /**
         * When true, the result is black for a light color and white for a dark one instead of the
         * exact inverse; useful for readable text.
         */
        blackAndWhite = false;
    }
    /**
     * A hex color and a target range for `color.hexToRgbMapped`, `color.getRedParam`,
     * `color.getGreenParam` and `color.getBlueParam`.
     */
    export class HexDtoMapped {
        constructor(color?: Base.Color, from?: number, to?: number) {
            if (color !== undefined) { this.color = color; }
            if (from !== undefined) { this.from = from; }
            if (to !== undefined) { this.to = to; }
        }
        /**
         * The color as a hex text such as `#ff5733`.
         * @default #0000ff
         */
        color: Base.Color = "#0000ff";
        /**
         * The value a channel of 0 maps to.
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        from = 0;
        /**
         * The value a channel of 255 maps to; 1 gives channels from 0 to 1.
         * @default 255
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        to = 255;
    }
    /**
     * An `{ r, g, b }` color and the range its channels use, for `color.rgbObjToHex`.
     */
    export class RGBObjectMaxDto {
        constructor(rgb?: Base.ColorRGB, max?: number) {
            if (rgb !== undefined) { this.rgb = rgb; }
            if (max !== undefined) { this.max = max; }
        }
        /**
         * The color object to convert.
         * @default undefined
         */
        rgb!: Base.ColorRGB;
        /**
         * The lowest value a channel can have in this object, usually 0.
         * @default 0
         * @minimum 0
         * @maximum 255
         * @step 0.1
         */
        min = 0;
        /**
         * The highest value a channel can have in this object: 255 or 1; anything else is remapped
         * to 0 to 255 first.
         * @default 255
         * @minimum 0
         * @maximum 255
         * @step 0.1
         */
        max = 255;
    }
    /**
     * Three channel values and the range they use, for `color.rgbToHex`.
     */
    export class RGBMinMaxDto {
        constructor(r?: number, g?: number, b?: number, min?: number, max?: number) {
            if (r !== undefined) { this.r = r; }
            if (g !== undefined) { this.g = g; }
            if (b !== undefined) { this.b = b; }
            if (min !== undefined) { this.min = min; }
            if (max !== undefined) { this.max = max; }
        }
        /**
         * The red channel, within `min` to `max`.
         * @default 255
         * @minimum 0
         * @maximum 255
         * @step 1
         */
        r = 255;
        /**
         * The green channel, within `min` to `max`.
         * @default 255
         * @minimum 0
         * @maximum 255
         * @step 1
         */
        g = 255;
        /**
         * The blue channel, within `min` to `max`.
         * @default 255
         * @minimum 0
         * @maximum 255
         * @step 1
         */
        b = 255;
        /**
         * The lowest value a channel can have, usually 0.
         * @default 0
         * @minimum 0
         * @maximum 255
         * @step 0.1
         */
        min = 0;
        /**
         * The highest value a channel can have: 255 or 1; anything else is remapped to 0 to 255
         * first.
         * @default 255
         * @minimum 0
         * @maximum 255
         * @step 0.1
         */
        max = 255;
    }
    /**
     * An `{ r, g, b }` color for `color.rgbToRed`, `color.rgbToGreen` and `color.rgbToBlue`.
     */
    export class RGBObjectDto {
        constructor(rgb?: Base.ColorRGB) {
            if (rgb !== undefined) { this.rgb = rgb; }
        }
        /**
         * The color object to read a channel from.
         * @default undefined
         */
        rgb!: Base.ColorRGB;
    }
}
