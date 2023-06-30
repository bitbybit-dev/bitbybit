import { LinesMesh } from "@babylonjs/core";
import { Base } from "./base-inputs";

// tslint:disable-next-line: no-namespace
export namespace Polyline {
    export class PolylinePropertiesDto {
        /**
         * Provide options without default values
         */
        constructor(points?: Base.Point3[]) {
            this.points = points;
        }
        /**
         * Points of the polyline
         */
        points: Base.Point3[];
    }
    export class PolylineDto {
        /**
         * Polyline with points
         */
        polyline: PolylinePropertiesDto;
    }
    export class PolylinesDto {
        /**
         * Polylines array
         */
        polylines: PolylinePropertiesDto[];
    }
    export class TransformPolylineDto {
        /**
         * Polyline to transform
         */
        polyline: PolylinePropertiesDto;
        /**
         * Transformation matrix or a list of transformation matrixes
         */
        matrix: Base.TransformMatrixes;
    }
    export class DrawPolylineDto {
        /**
         * Provide options without default values
         */
        constructor(polyline?: PolylinePropertiesDto) {
            this.polyline = polyline;
        }
        /**
         * Polyline
         */
        polyline: PolylinePropertiesDto;
        /**
         * Value between 0 and 1
         */
        opacity = 1;
        /**
         * Hex colour string
         */
        colours: string | string[] = "#444444";
        /**
         * Width of the polyline
         */
        size = 3;
        /**
         * Indicates wether the position of this polyline will change in time
         */
        updatable = false;
        /**
         * Line mesh variable in case it already exists and needs updating
         */
        polylineMesh?: LinesMesh;
    }
    export class DrawPolylinesDto {
        /**
         * Provide options without default values
         */
        constructor(polylines?: PolylinePropertiesDto[]) {
            this.polylines = polylines;
        }
        /**
         * Polylines
         */
        polylines: PolylinePropertiesDto[];
        /**
         * Value between 0 and 1
         */
        opacity = 1;
        /**
         * Hex colour string
         */
        colours: string | string[] = "#444444";
        /**
         * Width of the polyline
         */
        size = 3;
        /**
         * Indicates wether the position of this polyline will change in time
         */
        updatable = false;
        /**
         * Polyline mesh variable in case it already exists and needs updating
         */
        polylinesMesh?: LinesMesh;
    }
}
