import { simplifyDeclaration } from '../simplify-declaration';

export const polylineInputsString = simplifyDeclaration(`
import { LinesMesh } from '@babylonjs/core';
export declare namespace Polyline {
    class PolylinePropertiesDto {
        /**
         * Points of the polyline
         */
        points: number[][];
    }
    class PolylineDto {
        /**
         * Polyline with points
         */
        polyline: PolylinePropertiesDto;
    }
    class PolylinesDto {
        /**
         * Polylines array
         */
        polylines: PolylinePropertiesDto[];
    }
    class TransformPolylineDto {
        /**
         * Polyline to transform
         */
        polyline: PolylinePropertiesDto;
        /**
         * Transformation matrix or a list of transformation matrixes
         */
        matrix: number[][] | number[][][];
    }
    class DrawPolylineDto {
        /**
         * Polyline
         */
        polyline: PolylinePropertiesDto;
        /**
         * Value between 0 and 1
         */
        opacity: number;
        /**
         * Hex colour string
         */
        colour: string;
        /**
         * Width of the polyline
         */
        width: number;
        /**
         * Indicates wether the position of this polyline will change in time
         */
        updatable: boolean;
        /**
         * Line mesh variable in case it already exists and needs updating
         */
        polylineMesh?: LinesMesh;
    }
    class DrawPolylinesDto {
        /**
         * Polylines
         */
        polylines: PolylinePropertiesDto[];
        /**
         * Value between 0 and 1
         */
        opacity: number;
        /**
         * Hex colour string
         */
        colour: string;
        /**
         * Width of the polyline
         */
        width: number;
        /**
         * Indicates wether the position of this polyline will change in time
         */
        updatable: boolean;
        /**
         * Polyline mesh variable in case it already exists and needs updating
         */
        polylinesMesh?: LinesMesh;
    }
}
`);
