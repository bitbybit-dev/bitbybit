/* eslint-disable @typescript-eslint/no-namespace */
import { Base } from "./base-inputs";

export namespace Polyline {
    export class PolylineCreateDto {
        /**
         * Provide options without default values
         */
        constructor(points?: Base.Point3[], isClosed?: boolean) {
            if (points !== undefined) { this.points = points; }
            if (isClosed !== undefined) { this.isClosed = isClosed; }
        }
        /**
         * Points of the polyline
         * @default undefined
         */
        points?: Base.Point3[];
        /**
         * Can contain is closed information
         * @default false
         */
        isClosed? = false;
    }
    export class PolylinePropertiesDto {
        /**
         * Provide options without default values
         */
        constructor(points?: Base.Point3[], isClosed?: boolean) {
            if (points !== undefined) { this.points = points; }
            if (isClosed !== undefined) { this.isClosed = isClosed; }
        }
        /**
         * Points of the polyline
         * @default undefined
         */
        points?: Base.Point3[];
        /**
         * Can contain is closed information
         * @default false
         */
        isClosed? = false;
        /**
         * Optional polyline color
         * @default #444444
         */
        color?: string | number[];
    }
    export class PolylineDto {
        constructor(polyline?: PolylinePropertiesDto) {
            if (polyline !== undefined) { this.polyline = polyline; }
        }
        /**
         * Polyline with points
         * @default undefined
         */
        polyline?: PolylinePropertiesDto;
    }
    export class PolylinesDto {
        constructor(polylines?: PolylinePropertiesDto[]) {
            if (polylines !== undefined) { this.polylines = polylines; }
        }
        /**
         * Polylines array
         * @default undefined
         */
        polylines?: PolylinePropertiesDto[];
    }
    export class TransformPolylineDto {
        constructor(polyline?: PolylinePropertiesDto, transformation?: Base.TransformMatrixes) {
            if (polyline !== undefined) { this.polyline = polyline; }
            if (transformation !== undefined) { this.transformation = transformation; }
        }
        /**
         * Polyline to transform
         * @default undefined
         */
        polyline?: PolylinePropertiesDto;
        /**
         * Transformation matrix or a list of transformation matrixes
         * @default undefined
         */
        transformation?: Base.TransformMatrixes;
    }
    export class DrawPolylineDto<T> {
        /**
         * Provide options without default values
         */
        constructor(polyline?: PolylinePropertiesDto, opacity?: number, colours?: string | string[], size?: number, updatable?: boolean, polylineMesh?: T) {
            if (polyline !== undefined) { this.polyline = polyline; }
            if (opacity !== undefined) { this.opacity = opacity; }
            if (colours !== undefined) { this.colours = colours; }
            if (size !== undefined) { this.size = size; }
            if (updatable !== undefined) { this.updatable = updatable; }
            if (polylineMesh !== undefined) { this.polylineMesh = polylineMesh; }
        }
        /**
         * Polyline
         * @default undefined
         */
        polyline?: PolylinePropertiesDto;
        /**
         * Value between 0 and 1
         * @default 1
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        opacity? = 1;
        /**
         * Hex colour string
         * @default #444444
         */
        colours?: string | string[] = "#444444";
        /**
         * Width of the polyline
         * @default 3
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        size? = 3;
        /**
         * Indicates wether the position of this polyline will change in time
         * @default false
         */
        updatable? = false;
        /**
         * Line mesh variable in case it already exists and needs updating
         * @default undefined
         */
        polylineMesh?: T;
    }
    export class DrawPolylinesDto<T> {
        /**
         * Provide options without default values
         */
        constructor(polylines?: PolylinePropertiesDto[], opacity?: number, colours?: string | string[], size?: number, updatable?: boolean, polylinesMesh?: T) {
            if (polylines !== undefined) { this.polylines = polylines; }
            if (opacity !== undefined) { this.opacity = opacity; }
            if (colours !== undefined) { this.colours = colours; }
            if (size !== undefined) { this.size = size; }
            if (updatable !== undefined) { this.updatable = updatable; }
            if (polylinesMesh !== undefined) { this.polylinesMesh = polylinesMesh; }
        }
        /**
         * Polylines
         * @default undefined
         */
        polylines?: PolylinePropertiesDto[];
        /**
         * Value between 0 and 1
         * @default 1
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        opacity? = 1;
        /**
         * Hex colour string
         * @default #444444
         */
        colours?: string | string[] = "#444444";
        /**
         * Width of the polyline
         * @default 3
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        size? = 3;
        /**
         * Indicates wether the position of this polyline will change in time
         * @default false
         */
        updatable? = false;
        /**
         * Polyline mesh variable in case it already exists and needs updating
         * @default undefined
         */
        polylinesMesh?: T;
    }
    export class SegmentsToleranceDto {
        constructor(segments?: Base.Segment3[]) {
            if (segments !== undefined) { this.segments = segments; }
        }
        /**
         * Segments array
         * @default undefined
         */
        segments?: Base.Segment3[];
        /**
         * Tolerance for the calculation
         * @default 1e-5
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1e-5
         */
        tolerance? = 1e-5;
    }
}
