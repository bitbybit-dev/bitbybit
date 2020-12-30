import { simplifyDeclaration } from "./simplify-declaration";

export const baseTypesString = simplifyDeclaration(`
/**
 * Interval represents an object that has two properties - min and max.
 * <div>
 *  <img src="../assets/images/blockly-images/base-types/interval.png" alt="Blockly Image"/>
 * </div>
 */
export declare class IntervalDto {
    /**
     * Minimum value of the interval
     * <div>
     *  <img src="../assets/images/blockly-images/base-types/interval-min.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_base_types_.intervaldto.html#min
     */
    min: number;
    /**
     * Maximum value of the interval
     * <div>
     *  <img src="../assets/images/blockly-images/base-types/interval-max.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_base_types_.intervaldto.html#max
     */
    max: number;
}
/**
 * UV usually represents 2D coordinates on 3D or 2D surfaces. It is similar to XY coordinates in planes.
 * <div>
 *  <img src="../assets/images/blockly-images/base-types/uv.png" alt="Blockly Image"/>
 * </div>
 */
export declare class UVDto {
    /**
     * U coordinate of the surface
     * <div>
     *  <img src="../assets/images/blockly-images/base-types/uv-u.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_base_types_.uvdto.html#u
     */
    u: number;
    /**
     * V coordinate of the surface
     * <div>
     *  <img src="../assets/images/blockly-images/base-types/uv-v.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_base_types_.uvdto.html#v
     */
    v: number;
}
`);
