/**
 * Interval represents an object that has two properties - min and max.
 * <div>
 *  <img src="../assets/images/blockly-images/base-types/interval.png" alt="Blockly Image"/>
 * </div>
 */
interface IntervalDto {
    /**
     * Minimum value of the interval
     * <div>
     *  <img src="../assets/images/blockly-images/base-types/interval-min.png" alt="Blockly Image"/>
     * </div>
     */
    min: number;
    /**
     * Maximum value of the interval
     * <div>
     *  <img src="../assets/images/blockly-images/base-types/interval-max.png" alt="Blockly Image"/>
     * </div>
     */
    max: number;
}

/**
 * UV usually represents 2D coordinates on 3D or 2D surfaces. It is similar to XY coordinates in planes. 
 * <div>
 *  <img src="../assets/images/blockly-images/base-types/uv.png" alt="Blockly Image"/>
 * </div>
 */
interface UVDto {
    /**
     * U coordinate of the surface
     * <div>
     *  <img src="../assets/images/blockly-images/base-types/uv-u.png" alt="Blockly Image"/>
     * </div>
     */
    u: number;
    /**
     * V coordinate of the surface
     * <div>
     *  <img src="../assets/images/blockly-images/base-types/uv-v.png" alt="Blockly Image"/>
     * </div>
     */
    v: number;
}
