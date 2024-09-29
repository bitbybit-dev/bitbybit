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
