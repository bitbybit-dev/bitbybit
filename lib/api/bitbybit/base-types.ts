// tslint:disable-next-line: no-namespace
export namespace BaseTypes {
    /**
     * Interval represents an object that has two properties - min and max.
     */
    export class IntervalDto {
        /**
         * Minimum value of the interval
         */
        min = 0;
        /**
         * Maximum value of the interval
         */
        max = 1;
    }

    /**
     * UV usually represents 2D coordinates on 3D or 2D surfaces. It is similar to XY coordinates in planes.
     */
    export class UVDto {
        /**
         * U coordinate of the surface
         */
        u = 0;
        /**
         * V coordinate of the surface
         */
        v = 0;
    }
    /**
     * Intersection result of curve curve
     */
    export class CurveCurveIntersection {
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
    export class CurveSurfaceIntersection {
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
    export class SurfaceSurfaceIntersectionPoint {
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
