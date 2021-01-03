import { LinesMesh } from '@babylonjs/core';

// tslint:disable-next-line: no-namespace
export namespace Polyline {
    export class PolylineDto {
        /**
         * Points of the polyline
         */
        points: number[][];
    }
    export class DrawPolylineDto {
        /**
         * Polyline
         */
        polyline: PolylineDto;
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
         * Line mesh variable in case it already exists and needs updating
         */
        polylineMesh: LinesMesh;
    }
    export class DrawPolylinesDto {
        /**
         * Polylines
         */
        polylines: PolylineDto[];
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
         * Polyline mesh variable in case it already exists and needs updating
         */
        polylinesMesh: LinesMesh;
    }
}
