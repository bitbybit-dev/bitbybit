import * as Inputs from "../inputs";
import { MathBitByBit } from "./math";

export class Color {


    constructor(private readonly math: MathBitByBit) { }

    /**
     * Creates and returns a hex color string (pass-through for color input).
     * Example: '#FF5733' → '#FF5733'
     * @param inputs Color hex
     * @returns color string
     * @group create
     * @shortname color hex
     * @drawable false
     */
    hexColor(inputs: Inputs.Color.HexDto): Inputs.Base.Color {
        return inputs.color;
    }

    /**
     * Creates and returns rgb color object
     * @param inputs Color rgb
     * @returns color object
     * @group create
     * @shortname color rgb 0-255
     * @drawable false
     */
    rgb255Color(inputs: Inputs.Color.Rgb255Dto): Inputs.Base.ColorRGB {
        return inputs.colorRgb;
    }

    /**
     * Creates and returns rgb color object
     * @param inputs Color rgb
     * @returns color object
     * @group create
     * @shortname color rgb 0-1
     * @drawable false
     */
    rgb1Color(inputs: Inputs.Color.Rgb1Dto): Inputs.Base.ColorRGB {
        return inputs.colorRgb;
    }

    /**
     * Creates and returns rgba color object
     * @param inputs Color rgba
     * @returns color object
     * @group create
     * @shortname color rgba 0-255
     * @drawable false
     */
    rgba255Color(inputs: Inputs.Color.Rgba255Dto): Inputs.Base.ColorRGBA {
        return inputs.colorRgba;
    }

    /**
     * Creates and returns rgba color object
     * @param inputs Color rgba
     * @returns color object
     * @group create
     * @shortname color rgba 0-1
     * @drawable false
     */
    rgba1Color(inputs: Inputs.Color.Rgba1Dto): Inputs.Base.ColorRGBA {
        return inputs.colorRgba;
    }

    /**
     * Creates atomic rgb color object
     * @param inputs Color rgb
     * @returns color object
     * @group create
     * @shortname atomic color rgb 0-255
     * @drawable false
     */
    rgbAtomic255Color(inputs: Inputs.Color.RgbAttomic255Dto): Inputs.Base.ColorRGB {
        return { ...inputs };
    }

    /**
     * Creates atomic rgb color object
     * @param inputs Color rgb
     * @returns color object
     * @group create
     * @shortname atomic color rgb 0-1
     * @drawable false
     */
    rgbAtomic1Color(inputs: Inputs.Color.RgbAttomic1Dto): Inputs.Base.ColorRGB {
        return { ...inputs };
    }

    /**
     * Converts hex color to RGB object with r, g, b values (0-255 range).
     * Example: '#FF5733' → {r: 255, g: 87, b: 51}
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
     * Converts RGB values to hex color string (supports custom min/max ranges, auto-remaps to 0-255).
     * Example: r=255, g=87, b=51 with range [0,255] → '#ff5733'
     * Example: r=1, g=0.5, b=0.2 with range [0,1] → '#ff7f33'
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
     * Converts RGB object to hex color string (supports custom min/max ranges).
     * Example: {r: 1, g: 0.5, b: 0.2} with range [0,1] → '#ff7f33'
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
     * Converts hex color to RGB and remaps values to a custom range.
     * Example: '#FF5733' mapped to [0,1] → {r: 1, g: 0.341, b: 0.2}
     * Example: '#FF5733' mapped to [0,100] → {r: 100, g: 34.1, b: 20}
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
     * Extracts the red channel value from hex color (can be mapped to custom range).
     * Example: '#FF5733' with range [0,1] → 1
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
     * Extracts the green channel value from hex color (can be mapped to custom range).
     * Example: '#FF5733' with range [0,1] → 0.341
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
     * Extracts the blue channel value from hex color (can be mapped to custom range).
     * Example: '#FF5733' with range [0,1] → 0.2
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
     * Extracts the red channel value from RGB object.
     * Example: {r: 255, g: 87, b: 51} → 255
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
     * Extracts the green channel value from RGB object.
     * Example: {r: 255, g: 87, b: 51} → 87
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
     * Extracts the blue channel value from RGB object.
     * Example: {r: 255, g: 87, b: 51} → 51
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
     * Inverts a hex color (flips RGB channels: 255-r, 255-g, 255-b).
     * With blackAndWhite=true → returns '#000000' or '#ffffff' based on brightness.
     * Example: '#FF5733' → '#00a8cc', '#FF5733' with blackAndWhite=true → '#ffffff'
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
