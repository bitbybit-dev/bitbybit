import * as Inputs from "../inputs";
import { MathBitByBit } from "./math";

/**
 * Colors in the two forms the library uses: a hex text such as `#ff5733`, and an object `{ r, g, b
 * }` or `{ r, g, b, a }` whose channels run either from 0 to 255 or from 0 to 1. The methods here
 * build colors in each form, convert between them with an explicit channel range, read single
 * channels and invert a color.
 */
export class Color {


    constructor(private readonly math: MathBitByBit) { }

    /**
     * Passes a hex color through unchanged, so a color can be given a name and reused.
     *
     * Example: '#FF5733' -> '#FF5733'
     * @param inputs - The hex color
     * @returns The same hex color
     * @group create
     * @shortname color hex
     * @drawable false
     */
    hexColor(inputs: Inputs.Color.HexDto): Inputs.Base.Color {
        return inputs.color;
    }

    /**
     * Passes an `{ r, g, b }` color with channels from 0 to 255 through unchanged, so it can be
     * given a name and reused.
     *
     * Example: { r: 255, g: 87, b: 51 } -> the same object
     * @param inputs - The color object
     * @returns The same color object
     * @group create
     * @shortname color rgb 0-255
     * @drawable false
     */
    rgb255Color(inputs: Inputs.Color.Rgb255Dto): Inputs.Base.ColorRGB {
        return inputs.colorRgb;
    }

    /**
     * Passes an `{ r, g, b }` color with channels from 0 to 1 through unchanged, so it can be
     * given a name and reused.
     *
     * Example: { r: 1, g: 0.34, b: 0.2 } -> the same object
     * @param inputs - The color object
     * @returns The same color object
     * @group create
     * @shortname color rgb 0-1
     * @drawable false
     */
    rgb1Color(inputs: Inputs.Color.Rgb1Dto): Inputs.Base.ColorRGB {
        return inputs.colorRgb;
    }

    /**
     * Passes an `{ r, g, b, a }` color with color channels from 0 to 255 and opacity from 0 to 1
     * through unchanged, so it can be given a name and reused.
     *
     * Example: { r: 255, g: 87, b: 51, a: 1 } -> the same object
     * @param inputs - The color object
     * @returns The same color object
     * @group create
     * @shortname color rgba 0-255
     * @drawable false
     */
    rgba255Color(inputs: Inputs.Color.Rgba255Dto): Inputs.Base.ColorRGBA {
        return inputs.colorRgba;
    }

    /**
     * Passes an `{ r, g, b, a }` color with every channel from 0 to 1 through unchanged, so it can
     * be given a name and reused.
     *
     * Example: { r: 1, g: 0.34, b: 0.2, a: 1 } -> the same object
     * @param inputs - The color object
     * @returns The same color object
     * @group create
     * @shortname color rgba 0-1
     * @drawable false
     */
    rgba1Color(inputs: Inputs.Color.Rgba1Dto): Inputs.Base.ColorRGBA {
        return inputs.colorRgba;
    }

    /**
     * Builds an `{ r, g, b }` color from three separate channel values from 0 to 255.
     *
     * Example: r 255, g 87, b 51 -> { r: 255, g: 87, b: 51 }
     * @param inputs - The red, green and blue values
     * @returns The color object
     * @group create
     * @shortname atomic color rgb 0-255
     * @drawable false
     * @example
     * ```typescript
     * const orange = bitbybit.color.rgbAtomic255Color({ r: 255, g: 87, b: 51 });
     * ```
     */
    rgbAtomic255Color(inputs: Inputs.Color.RgbAttomic255Dto): Inputs.Base.ColorRGB {
        return { ...inputs };
    }

    /**
     * Builds an `{ r, g, b }` color from three separate channel values from 0 to 1.
     *
     * Example: r 1, g 0.34, b 0.2 -> { r: 1, g: 0.34, b: 0.2 }
     * @param inputs - The red, green and blue values
     * @returns The color object
     * @group create
     * @shortname atomic color rgb 0-1
     * @drawable false
     * @example
     * ```typescript
     * const orange = bitbybit.color.rgbAtomic1Color({ r: 1, g: 0.34, b: 0.2 });
     * ```
     */
    rgbAtomic1Color(inputs: Inputs.Color.RgbAttomic1Dto): Inputs.Base.ColorRGB {
        return { ...inputs };
    }

    /**
     * Reads a hex color into an `{ r, g, b }` object with channels from 0 to 255.
     *
     * The text may start with or without `#`; anything else than six hex digits throws an error.
     * Example: '#FF5733' -> { r: 255, g: 87, b: 51 }
     * @param inputs - The hex color
     * @returns The color object with channels from 0 to 255
     * @group convert
     * @shortname hex to rgb
     * @drawable false
     * @example
     * ```typescript
     * const rgb = bitbybit.color.hexToRgb({ color: "#ff5733" });
     * ```
     */
    hexToRgb(inputs: Inputs.Color.HexDto): Inputs.Base.ColorRGB {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(inputs.color);
        if (!result) {
            throw new Error(`Invalid hex color: ${inputs.color}`);
        }
        return {
            r: parseInt(result[1]!, 16),
            g: parseInt(result[2]!, 16),
            b: parseInt(result[3]!, 16)
        };
    }

    /**
     * Writes three channel values as a hex color.
     *
     * `min` and `max` say which range the values use; a range other than 0 to 255 is remapped
     * first, so channels from 0 to 1 work as well.
     * Example: r 255, g 87, b 51 in [0,255] -> '#ff5733'; r 1, g 0.5, b 0.2 in [0,1] -> '#ff8033'
     * @param inputs - The red, green and blue values and their range
     * @returns The hex color
     * @group convert
     * @shortname rgb to hex
     * @drawable false
     * @example
     * ```typescript
     * const hex = bitbybit.color.rgbToHex({ r: 1, g: 0.5, b: 0.2, min: 0, max: 1 });
     * ```
     */
    rgbToHex(inputs: Inputs.Color.RGBMinMaxDto): Inputs.Base.Color {
        let r = inputs.r;
        let g = inputs.g;
        let b = inputs.b;

        if (inputs.max !== 255) {
            r = Math.round(this.math.remap({ number: r, fromLow: inputs.min, fromHigh: inputs.max, toLow: 0, toHigh: 255 }));
            g = Math.round(this.math.remap({ number: g, fromLow: inputs.min, fromHigh: inputs.max, toLow: 0, toHigh: 255 }));
            b = Math.round(this.math.remap({ number: b, fromLow: inputs.min, fromHigh: inputs.max, toLow: 0, toHigh: 255 }));
        }

        const s = `#${Number(0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).substring(1, 7)}`;

        return s;
    }


    /**
     * Writes an `{ r, g, b }` color as a hex color.
     *
     * `min` and `max` say which range the channels use; a range other than 0 to 255 is remapped
     * first.
     * Example: { r: 1, g: 0.5, b: 0.2 } in [0,1] -> '#ff8033'
     * @param inputs - The color object and the range its channels use
     * @returns The hex color
     * @group convert
     * @shortname rgb obj to hex
     * @drawable false
     * @example
     * ```typescript
     * const hex = bitbybit.color.rgbObjToHex({ rgb: { r: 1, g: 0.5, b: 0.2 }, min: 0, max: 1 });
     * ```
     */
    rgbObjToHex(inputs: Inputs.Color.RGBObjectMaxDto): Inputs.Base.Color {
        return this.rgbToHex({ r: inputs.rgb.r, g: inputs.rgb.g, b: inputs.rgb.b, min: inputs.min, max: inputs.max });
    }

    /**
     * Reads a hex color into an `{ r, g, b }` object with the channels remapped to a range of your
     * choice.
     *
     * Example: '#FF5733' mapped to [0,1] -> { r: 1, g: 0.341, b: 0.2 }
     * @param inputs - The hex color and the range to map the channels to
     * @returns The color object with channels in that range
     * @group convert
     * @shortname hex to rgb mapped
     * @drawable false
     * @example
     * ```typescript
     * const rgb = bitbybit.color.hexToRgbMapped({ color: "#ff5733", from: 0, to: 1 });
     * ```
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
     * Reads the red channel of a hex color, remapped to a range of your choice.
     *
     * Example: '#FF5733' in [0,1] -> 1
     * @param inputs - The hex color and the range to map the channel to
     * @returns The red channel in that range
     * @group hex to
     * @shortname red
     * @drawable false
     * @example
     * ```typescript
     * const red = bitbybit.color.getRedParam({ color: "#ff5733", from: 0, to: 1 });
     * ```
     */
    getRedParam(inputs: Inputs.Color.HexDtoMapped): number {
        const rgb = this.hexToRgbMapped(inputs);
        return rgb.r;
    }

    /**
     * Reads the green channel of a hex color, remapped to a range of your choice.
     *
     * Example: '#FF5733' in [0,1] -> 0.341
     * @param inputs - The hex color and the range to map the channel to
     * @returns The green channel in that range
     * @group hex to
     * @shortname green
     * @drawable false
     * @example
     * ```typescript
     * const green = bitbybit.color.getGreenParam({ color: "#ff5733", from: 0, to: 1 });
     * ```
     */
    getGreenParam(inputs: Inputs.Color.HexDtoMapped): number {
        const rgb = this.hexToRgbMapped(inputs);
        return rgb.g;
    }

    /**
     * Reads the blue channel of a hex color, remapped to a range of your choice.
     *
     * Example: '#FF5733' in [0,1] -> 0.2
     * @param inputs - The hex color and the range to map the channel to
     * @returns The blue channel in that range
     * @group hex to
     * @shortname blue
     * @drawable false
     * @example
     * ```typescript
     * const blue = bitbybit.color.getBlueParam({ color: "#ff5733", from: 0, to: 1 });
     * ```
     */
    getBlueParam(inputs: Inputs.Color.HexDtoMapped): number {
        const rgb = this.hexToRgbMapped(inputs);
        return rgb.b;
    }

    /**
     * Reads the red channel of an `{ r, g, b }` color.
     *
     * Example: { r: 255, g: 87, b: 51 } -> 255
     * @param inputs - The color object
     * @returns The red channel, in whatever range the object uses
     * @group rgb to
     * @shortname red
     * @drawable false
     */
    rgbToRed(inputs: Inputs.Color.RGBObjectDto): number {
        return inputs.rgb.r;
    }

    /**
     * Reads the green channel of an `{ r, g, b }` color.
     *
     * Example: { r: 255, g: 87, b: 51 } -> 87
     * @param inputs - The color object
     * @returns The green channel, in whatever range the object uses
     * @group rgb to
     * @shortname green
     * @drawable false
     */
    rgbToGreen(inputs: Inputs.Color.RGBObjectDto): number {
        return inputs.rgb.g;
    }

    /**
     * Reads the blue channel of an `{ r, g, b }` color.
     *
     * Example: { r: 255, g: 87, b: 51 } -> 51
     * @param inputs - The color object
     * @returns The blue channel, in whatever range the object uses
     * @group rgb to
     * @shortname blue
     * @drawable false
     */
    rgbToBlue(inputs: Inputs.Color.RGBObjectDto): number {
        return inputs.rgb.b;
    }

    /**
     * Inverts a hex color, turning each channel into its opposite: 255 minus the value.
     *
     * With `blackAndWhite` on, the result is plain black for a light color or white for a dark
     * one, which suits text on a colored background.
     * Example: '#FF5733' -> '#00a8cc'; with blackAndWhite -> '#ffffff'
     * @param inputs - The hex color and whether to reduce the result to black or white
     * @returns The inverted hex color
     * @group hex to
     * @shortname invert color
     * @drawable false
     * @example
     * ```typescript
     * const textColor = bitbybit.color.invert({ color: "#ff5733", blackAndWhite: true });
     * ```
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
