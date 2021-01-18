import { simplifyDeclaration } from './simplify-declaration';

export const baseTypesString = simplifyDeclaration(`
export declare namespace BaseTypes {
    /**
     * Interval represents an object that has two properties - min and max.
     * <div>
     *  <img src="../assets/images/blockly-images/base-types/interval.svg" alt="Blockly Image"/>
     * </div>
     */
    class IntervalDto {
        /**
         * Minimum value of the interval
         * <div>
         *  <img src="../assets/images/blockly-images/base-types/interval-min.svg" alt="Blockly Image"/>
         * </div>
         * @link https://docs.bitbybit.dev/classes/_api_bitbybit_base_types_.basetypes.intervaldto.html#min
         */
        min: number;
        /**
         * Maximum value of the interval
         * <div>
         *  <img src="../assets/images/blockly-images/base-types/interval-max.svg" alt="Blockly Image"/>
         * </div>
         * @link https://docs.bitbybit.dev/classes/_api_bitbybit_base_types_.basetypes.intervaldto.html#max
         */
        max: number;
    }
    /**
     * UV usually represents 2D coordinates on 3D or 2D surfaces. It is similar to XY coordinates in planes.
     * <div>
     *  <img src="../assets/images/blockly-images/base-types/uv.svg" alt="Blockly Image"/>
     * </div>
     */
    class UVDto {
        /**
         * U coordinate of the surface
         * <div>
         *  <img src="../assets/images/blockly-images/base-types/uv-u.svg" alt="Blockly Image"/>
         * </div>
         * @link https://docs.bitbybit.dev/classes/_api_bitbybit_base_types_.basetypes.uvdto.html#u
         */
        u: number;
        /**
         * V coordinate of the surface
         * <div>
         *  <img src="../assets/images/blockly-images/base-types/uv-v.svg" alt="Blockly Image"/>
         * </div>
         * @link https://docs.bitbybit.dev/classes/_api_bitbybit_base_types_.basetypes.uvdto.html#v
         */
        v: number;
    }
    /**
     * Intersection result of curve curve
     */
    class CurveCurveIntersection {
        /**
         * Point of intersection on the first curve
         */
        point0: number[];
        /**
         * Point of intersection on the second curve
         */
        point1: number[];
        /**
         * Parameter of intersection on the first curve
         */
        u0: number;
        /**
         * Parameter of intersection on the second curve
         */
        u1: number;
    }
    /**
     * Intersection result of curve and surface
     */
    class CurveSurfaceIntersection {
        /**
         * Parameter of intersection on the curve
         */
        u: number;
        /**
         * UV Parameters of intersection on the surface
         */
        uv: UVDto;
        /**
         * Point of intersection on the curve
         */
        curvePoint: number[];
        /**
         * Point of intersection on the surface
         */
        surfacePoint: number[];
    }
    /**
     * Intersection point between two surfaces
     */
    class SurfaceSurfaceIntersectionPoint {
        /**
         * UV parameters of intersection on first surface
         */
        uv0: UVDto;
        /**
         * UV parameters of intersection on second surface
         */
        uv1: UVDto;
        /**
         * Point of intersection
         */
        point: number[];
        /**
         * Distance
         */
        dist: number;
    }
}
`);
