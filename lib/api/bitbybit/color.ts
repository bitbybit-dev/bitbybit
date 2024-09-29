import * as Inputs from "../inputs/inputs";
import { Context } from "../context";

export class Color {


    constructor(private readonly context: Context) { }

    /**
     * Creates a hex color
     * @param inputs Color hex
     * @returns color string
     * @group create
     * @shortname color
     * @drawable false
     */
    hexColor(inputs: Inputs.Color.HexDto): Inputs.Base.Color {
        return inputs.color;
    }

    /**
     * Creates rgb color from hex
     * @param inputs Color hex
     * @returns rgb color
     * @group convert
     * @shortname hex to rgb
     * @drawable false
     */
    hexToRgb(inputs: Inputs.Color.HexDto): Inputs.Base.ColorRGB {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(inputs.color);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : undefined;
    }

    /**
     * Creates hex color from rgb
     * @param inputs Color hext
     * @returns hex color
     * @group convert
     * @shortname rgb to hex
     * @drawable false
     */
    rgbToHex(inputs: Inputs.Color.RGBMinMaxDto): Inputs.Base.Color {
        let r = inputs.r;
        let g = inputs.g;
        let b = inputs.b;

        // sometimes rgb values are in 0 - 100 or 0 - 1 ranges
        // so we need to remap them to 0 - 255
        if (inputs.max !== 255) {
            r = Math.round(this.context.remap(r, inputs.min, inputs.max, 0, 255));
            g = Math.round(this.context.remap(g, inputs.min, inputs.max, 0, 255));
            b = Math.round(this.context.remap(b, inputs.min, inputs.max, 0, 255));
        }

        const s = `#${Number(0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).substring(1, 7)}`;

        return s;
    }


    /**
     * Creates hex color from rgb obj that contains {r, g, b} properties in certain range
     * @param inputs Color hext
     * @returns hex color string
     * @group convert
     * @shortname rgb obj to hex
     * @drawable false
     */
    rgbObjToHex(inputs: Inputs.Color.RGBObjectMaxDto): Inputs.Base.Color {
        return this.rgbToHex({ r: inputs.rgb.r, g: inputs.rgb.g, b: inputs.rgb.b, min: inputs.min, max: inputs.max });
    }

    /**
     * Creates rgb color from hex and maps to different range if needed
     * @param inputs Color hext
     * @returns rgb color
     * @group convert
     * @shortname hex to rgb mapped
     * @drawable false
     */
    hexToRgbMapped(inputs: Inputs.Color.HexDtoMapped): Inputs.Base.ColorRGB {
        const rgb = this.hexToRgb(inputs);
        return {
            r: this.context.remap(rgb.r, 0, 255, inputs.from, inputs.to),
            g: this.context.remap(rgb.g, 0, 255, inputs.from, inputs.to),
            b: this.context.remap(rgb.b, 0, 255, inputs.from, inputs.to),
        };
    }

    /**
     * Get red param
     * @param inputs Color hext
     * @returns rgb color
     * @group hex to
     * @shortname red
     * @drawable false
     */
    getRedParam(inputs: Inputs.Color.HexDtoMapped): number {
        const rgb = this.hexToRgbMapped(inputs);
        return rgb.r;
    }

    /**
     * Get green param
     * @param inputs Color hext
     * @returns rgb color
     * @group hex to
     * @shortname green
     * @drawable false
     */
    getGreenParam(inputs: Inputs.Color.HexDtoMapped): number {
        const rgb = this.hexToRgbMapped(inputs);
        return rgb.g;
    }

    /**
     * Get blue param
     * @param inputs Color hext
     * @returns blue param
     * @group hex to
     * @shortname blue
     * @drawable false
     */
    getBlueParam(inputs: Inputs.Color.HexDtoMapped): number {
        const rgb = this.hexToRgbMapped(inputs);
        return rgb.b;
    }

    /**
     * RGB to red
     * @param inputs Color rgb
     * @returns red param
     * @group  rgb to
     * @shortname red
     * @drawable false
     */
    rgbToRed(inputs: Inputs.Color.RGBObjectDto): number {
        return inputs.rgb.r;
    }

    /**
     * RGB to green
     * @param inputs Color rgb
     * @returns green param
     * @group rgb to
     * @shortname green
     * @drawable false
     */
    rgbToGreen(inputs: Inputs.Color.RGBObjectDto): number {
        return inputs.rgb.g;
    }

    /**
     * RGB to blue
     * @param inputs Color rgb
     * @returns blue param
     * @group rgb to
     * @shortname blue
     * @drawable false
     */
    rgbToBlue(inputs: Inputs.Color.RGBObjectDto): number {
        return inputs.rgb.b;
    }
}
