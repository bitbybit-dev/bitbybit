import * as Inputs from "../inputs";
import { MathBitByBit } from "./math";

export class Color {


    constructor(private readonly math: MathBitByBit) { }

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
            r = Math.round(this.math.remap({ number: r, fromLow: inputs.min, fromHigh: inputs.max, toLow: 0, toHigh: 255 }));
            g = Math.round(this.math.remap({ number: g, fromLow: inputs.min, fromHigh: inputs.max, toLow: 0, toHigh: 255 }));
            b = Math.round(this.math.remap({ number: b, fromLow: inputs.min, fromHigh: inputs.max, toLow: 0, toHigh: 255 }));
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
            r: this.math.remap({ number: rgb.r, fromLow: 0, fromHigh: 255, toLow: inputs.from, toHigh: inputs.to }),
            g: this.math.remap({ number: rgb.g, fromLow: 0, fromHigh: 255, toLow: inputs.from, toHigh: inputs.to }),
            b: this.math.remap({ number: rgb.b, fromLow: 0, fromHigh: 255, toLow: inputs.from, toHigh: inputs.to }),
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

    /**
     * Invert color
     * @param inputs hex color and black and white option
     * @returns inverted color
     * @group hex to
     * @shortname invert color
     * @drawable false
     */
    invert(inputs: Inputs.Color.InvertHexDto): Inputs.Base.Color {
        const { r, g, b } = this.hexToRgbMapped({ color: inputs.color, from: 0, to: 255 });
        if (inputs.blackAndWhite) {
            return (r * 0.299 + g * 0.587 + b * 0.114) > 186
                ? "#000000"
                : "#ffffff";
        }
        const rInv = (255 - r);
        const gInv = (255 - g);
        const bInv = (255 - b);
        return this.rgbToHex({ r: rInv, g: gInv, b: bInv, min: 0, max: 255 });
    }
}
