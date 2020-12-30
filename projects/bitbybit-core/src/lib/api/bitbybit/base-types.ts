/**
 * Interval represents an object that has two properties - min and max.
 * <div>
 *  <img src="../assets/images/blockly-images/base-types/interval.png" alt="Blockly Image"/>
 * </div>
 */
export class IntervalDto {
    /**
     * Minimum value of the interval
     * <div>
     *  <img src="../assets/images/blockly-images/base-types/interval-min.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_base_types_.intervaldto.html#min
     */
    min = 0;
    /**
     * Maximum value of the interval
     * <div>
     *  <img src="../assets/images/blockly-images/base-types/interval-max.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_base_types_.intervaldto.html#max
     */
    max = 1;
}

/**
 * UV usually represents 2D coordinates on 3D or 2D surfaces. It is similar to XY coordinates in planes.
 * <div>
 *  <img src="../assets/images/blockly-images/base-types/uv.png" alt="Blockly Image"/>
 * </div>
 */
export class UVDto {
    /**
     * U coordinate of the surface
     * <div>
     *  <img src="../assets/images/blockly-images/base-types/uv-u.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_base_types_.uvdto.html#u
     */
    u = 0;
    /**
     * V coordinate of the surface
     * <div>
     *  <img src="../assets/images/blockly-images/base-types/uv-v.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_base_types_.uvdto.html#v
     */
    v = 0;
}
