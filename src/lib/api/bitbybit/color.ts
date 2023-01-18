import { BitByBitBlocklyHelperService } from "../../bit-by-bit-blockly-helper.service";

export class Color {

    /**
     * Creates rgb color from hex
     * <div>
     *  <img src="../assets/images/blockly-images/color/hexToRgb.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_color.Color.html#hexToRgb
     * @param inputs Color hext
     * @returns rgb color
     */
    hexToRgb(hex: string): { r: number, g: number, b: number } {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : undefined;
    }


    /**
     * Creates hex color from rgb
     * <div>
     *  <img src="../assets/images/blockly-images/color/rgbToHex.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_color.Color.html#rgbToHex
     * @param inputs Color hext
     * @returns rgb color
     */
    rgbToHex = (values) => {
        if (values.length < 3) throw new Error('values must contain R, G and B values')
        const r = values[0];
        const g = values[1];
        const b = values[2];

        let s = `#${Number(0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).substring(1, 7)}`

        if (values.length > 3) {
            s = s + Number(values[3]).toString(16)
        }
        return s
    }

    /**
     * Creates rgb color from hex and maps to 0 - 100 value
     * <div>
     *  <img src="../assets/images/blockly-images/color/hexToRgbMapped.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_color.Color.html#hexToRgbMapped
     * @param inputs Color hext
     * @returns rgb color
     */
    hexToRgbMapped(hex: string): { r: number, g: number, b: number } {
        const rgb = this.hexToRgb(hex);
        return {
            r: BitByBitBlocklyHelperService.remap(rgb.r, 0, 255, 0, 100),
            g: BitByBitBlocklyHelperService.remap(rgb.g, 0, 255, 0, 100),
            b: BitByBitBlocklyHelperService.remap(rgb.b, 0, 255, 0, 100),
        }
    }

    /**
     * Get red param
     * <div>
     *  <img src="../assets/images/blockly-images/color/getRedParam.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_color.Color.html#getRedParam
     * @param inputs Color hext
     * @returns rgb color
     */
    getRedParam(hex: string): number {
        const rgb = this.hexToRgbMapped(hex);
        return rgb.r;
    }

    /**
     * Get green param
     * <div>
     *  <img src="../assets/images/blockly-images/color/getGreenParam.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_color.Color.html#getGreenParam
     * @param inputs Color hext
     * @returns rgb color
     */
    getGreenParam(hex: string): number {
        const rgb = this.hexToRgbMapped(hex);
        return rgb.g;
    }

    /**
     * Get blue param
     * <div>
     *  <img src="../assets/images/blockly-images/color/getBlueParam.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_color.Color.html#getBlueParam
     * @param inputs Color hext
     * @returns rgb color
     */
    getBlueParam(hex: string): number {
        const rgb = this.hexToRgbMapped(hex);
        return rgb.b;
    }

    /**
     * Get red 255 param
     * <div>
     *  <img src="../assets/images/blockly-images/color/getRed255Param.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_color.Color.html#getRed255Param
     * @param inputs Color hext
     * @returns rgb color
     */
    getRed255Param(hex: string): number {
        const rgb = this.hexToRgb(hex);
        return rgb.r;
    }

    /**
     * Get green 255 param
     * <div>
     *  <img src="../assets/images/blockly-images/color/getGreen255Param.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_color.Color.html#getGreen255Param
     * @param inputs Color hext
     * @returns rgb color
     */
    getGreen255Param(hex: string): number {
        const rgb = this.hexToRgb(hex);
        return rgb.g;
    }

    /**
     * Get blue 255 param
     * <div>
     *  <img src="../assets/images/blockly-images/color/getBlue255Param.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_color.Color.html#getBlue255Param
     * @param inputs Color hext
     * @returns rgb color
     */
    getBlue255Param(hex: string): number {
        const rgb = this.hexToRgb(hex);
        return rgb.b;
    }
}
