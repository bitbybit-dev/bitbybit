import { LinesMesh } from '@babylonjs/core';

// tslint:disable-next-line: no-namespace
export namespace Curve {
    export class CurveDto {
        /**
         * Nurbs curve
         */
        curve: any;
    }
    export class DrawCurveDto {
        /**
         * Nurbs curve
         */
        curve: any;
        /**
         * Value between 0 and 1
         */
        opacity = 1;
        /**
         * Hex colour string
         */
        colour = '#444444';
        /**
         * Width of the polyline
         */
        width = 3;
        /**
         * Indicates wether the position of this polyline will change in time
         */
        updatable = false;
        /**
         * Curve mesh variable in case it already exists and needs updating
         */
        curveMesh: LinesMesh;
    }
    export class DrawCurvesDto {
        /**
         * Nurbs curves
         */
        curves: any[];
        /**
         * Value between 0 and 1
         */
        opacity = 1;
        /**
         * Hex colour string
         */
        colour = '#444444';
        /**
         * Width of the polyline
         */
        width = 3;
        /**
         * Indicates wether the position of this polyline will change in time
         */
        updatable = false;
        /**
         * Curve mesh variable in case it already exists and needs updating
         */
        curveMesh: LinesMesh;
    }
}
