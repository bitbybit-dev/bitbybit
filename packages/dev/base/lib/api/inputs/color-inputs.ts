/* eslint-disable @typescript-eslint/no-namespace */
import { Base } from "./base-inputs";

// tslint:disable-next-line: no-namespace
export namespace Color {
    export class HexDto {
        constructor(color?: Base.Color) {
            if (color !== undefined) { this.color = color; }
        }
        /**
         * Color hex
         * @default #0000ff
         */
        color: Base.Color = "#0000ff";
    }
    export class Rgb255Dto {
        constructor(colorRgb?: Base.ColorRGB) {
            if (colorRgb !== undefined) { this.colorRgb = colorRgb; }
        }
        /**
         * Color rgb
         * @default { "r": 0, "g": 0, "b": 255 }
         * @min 0
         * @max 255
         */
        colorRgb: Base.ColorRGB = { r: 0, g: 0, b: 255 };
    }
    export class Rgb1Dto {
        constructor(colorRgb?: Base.ColorRGB) {
            if (colorRgb !== undefined) { this.colorRgb = colorRgb; }
        }
        /**
         * Color rgb
         * @default { "r": 0, "g": 0, "b": 1 }
         * @min 0
         * @max 1
         */
        colorRgb: Base.ColorRGB = { r: 0, g: 0, b: 1 };
    }
    export class Rgba255Dto {
        constructor(colorRgba?: Base.ColorRGBA) {
            if (colorRgba !== undefined) { this.colorRgba = colorRgba; }
        }
        /**
         * Color rgba
         * @default { "r": 0, "g": 0, "b": 255, "a": 1 }
         * @min 0
         * @max 255
         */
        colorRgba: Base.ColorRGBA = { r: 0, g: 0, b: 255, a: 1 };
    }
    export class Rgba1Dto {
        constructor(colorRgba?: Base.ColorRGBA) {
            if (colorRgba !== undefined) { this.colorRgba = colorRgba; }
        }
        /**
         * Color rgba
         * @default { "r": 0, "g": 0, "b": 1, "a": 1 }
         * @min 0
         * @max 1
         */
        colorRgba: Base.ColorRGBA = { r: 0, g: 0, b: 1, a: 1 };
    }
    export class RgbAttomic255Dto {
        constructor(r?: number, g?: number, b?: number) {
            if (r !== undefined) { this.r = r; }
            if (g !== undefined) { this.g = g; }
            if (b !== undefined) { this.b = b; }
        }
        /**
         * Red component
         * @default 0
         * @minimum 0
         * @maximum 255
         */
        r = 0;
        /**
         * Green component
         * @default 0
         * @minimum 0
         * @maximum 255
         */
        g = 0;
        /**
         * Blue component
         * @default 255
         * @minimum 0
         * @maximum 255
         */
        b = 255;
    }

    export class RgbaAttomic255Dto {
        constructor(r?: number, g?: number, b?: number, a?: number) {
            if (r !== undefined) { this.r = r; }
            if (g !== undefined) { this.g = g; }
            if (b !== undefined) { this.b = b; }
            if (a !== undefined) { this.a = a; }
        }
        /**
         * Red component
         * @default 0
         * @minimum 0
         * @maximum 255
         */
        r = 0;
        /**
         * Green component
         * @default 0
         * @minimum 0
         * @maximum 255
         */
        g = 0;
        /**
         * Blue component
         * @default 255
         * @minimum 0
         * @maximum 255
         */
        b = 255;
        /**
         * Alpha component
         * @default 1
         * @minimum 0
         * @maximum 1
         */
        a = 1;
    }

    export class RgbAttomic1Dto {
        constructor(r?: number, g?: number, b?: number) {
            if (r !== undefined) { this.r = r; }
            if (g !== undefined) { this.g = g; }
            if (b !== undefined) { this.b = b; }
        }
        /**
         * Red component
         * @default 0
         * @minimum 0
         * @maximum 1
         */
        r = 0;
        /**
         * Green component
         * @default 0
         * @minimum 0
         * @maximum 1
         */
        g = 0;
        /**
         * Blue component
         * @default 1
         * @minimum 0
         * @maximum 1
         */
        b = 1;
    }

    export class RgbaAttomic1Dto {
        constructor(r?: number, g?: number, b?: number, a?: number) {
            if (r !== undefined) { this.r = r; }
            if (g !== undefined) { this.g = g; }
            if (b !== undefined) { this.b = b; }
            if (a !== undefined) { this.a = a; }
        }
        /**
         * Red component
         * @default 0
         * @minimum 0
         * @maximum 1
         */
        r = 0;
        /**
         * Green component
         * @default 0
         * @minimum 0
         * @maximum 1
         */
        g = 0;
        /**
         * Blue component
         * @default 1
         * @minimum 0
         * @maximum 1
         */
        b = 1;
        /**
         * Alpha component
         * @default 1
         * @minimum 0
         * @maximum 1
         */
        a = 1;
    }
    export class InvertHexDto {
        constructor(color?: Base.Color) {
            if (color !== undefined) { this.color = color; }
        }
        /**
         * Color hex
         * @default #0000ff
         */
        color: Base.Color = "#0000ff";
        /**
         * Choose to invert the color to black and white (useful for text color)
         */
        blackAndWhite = false;
    }
    export class HexDtoMapped {
        constructor(color?: Base.Color, from?: number, to?: number) {
            if (color !== undefined) { this.color = color; }
            if (from !== undefined) { this.from = from; }
            if (to !== undefined) { this.to = to; }
        }
        /**
         * Color hex
         * @default #0000ff
         */
        color: Base.Color = "#0000ff";
        /**
         * From min bound
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        from = 0;
        /**
         * To max bound
         * @default 255
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        to = 255;
    }
    export class RGBObjectMaxDto {
        constructor(rgb?: Base.ColorRGB, max?: number) {
            if (rgb !== undefined) { this.rgb = rgb; }
            if (max !== undefined) { this.max = max; }
        }
        /**
         * Red value component
         * @default undefined
         */
        rgb: Base.ColorRGB;
        /**
         * Min value of the range
         * @default 0
         * @minimum 0
         * @maximum 255
         * @step 0.1
         */
        min = 0;
        /**
         * Max value, it would automatically be remapped to whatever is needed if lower comes in
         * @default 255
         * @minimum 0
         * @maximum 255
         * @step 0.1
         */
        max = 255;
    }
    export class RGBMinMaxDto {
        constructor(r?: number, g?: number, b?: number, min?: number, max?: number) {
            if (r !== undefined) { this.r = r; }
            if (g !== undefined) { this.g = g; }
            if (b !== undefined) { this.b = b; }
            if (min !== undefined) { this.min = min; }
            if (max !== undefined) { this.max = max; }
        }
        /**
         * Red value component
         * @default 255
         * @minimum 0
         * @maximum 255
         * @step 1
         */
        r = 255;
        /**
         * Green value component
         * @default 255
         * @minimum 0
         * @maximum 255
         * @step 1
         */
        g = 255;
        /**
        * Blue value component
        * @default 255
        * @minimum 0
        * @maximum 255
        * @step 1
        */
        b = 255;
        /**
         * Min value of the range
         * @default 0
         * @minimum 0
         * @maximum 255
         * @step 0.1
         */
        min = 0;
        /**
         * Max value of the range
         * @default 255
         * @minimum 0
         * @maximum 255
         * @step 0.1
         */
        max = 255;
    }
    export class RGBObjectDto {
        constructor(rgb?: Base.ColorRGB) {
            if (rgb !== undefined) { this.rgb = rgb; }
        }
        /**
         * Red value component
         * @default undefined
         */
        rgb: Base.ColorRGB;
    }
}
