/* eslint-disable @typescript-eslint/no-namespace */
import * as BABYLON from "@babylonjs/core";
import { Base } from "./base-inputs";

export namespace Polyline {
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
         */
        points: Base.Point3[];
        /**
         * Can contain is closed information
         */
        isClosed? = false;
        /**
         * Can contain color information
         */
        color?: string | number[];
    }
    export class PolylineDto {
        constructor(polyline?: PolylinePropertiesDto) {
            if (polyline !== undefined) { this.polyline = polyline; }
        }
        /**
         * Polyline with points
         */
        polyline: PolylinePropertiesDto;
    }
    export class PolylinesDto {
        constructor(polylines?: PolylinePropertiesDto[]) {
            if (polylines !== undefined) { this.polylines = polylines; }
        }
        /**
         * Polylines array
         */
        polylines: PolylinePropertiesDto[];
    }
    export class TransformPolylineDto {
        constructor(polyline?: PolylinePropertiesDto, transformation?: Base.TransformMatrixes) {
            if (polyline !== undefined) { this.polyline = polyline; }
            if (transformation !== undefined) { this.transformation = transformation; }
        }
        /**
         * Polyline to transform
         */
        polyline: PolylinePropertiesDto;
        /**
         * Transformation matrix or a list of transformation matrixes
         */
        transformation: Base.TransformMatrixes;
    }
    export class DrawPolylineDto {
        /**
         * Provide options without default values
         */
        constructor(polyline?: PolylinePropertiesDto, opacity?: number, colours?: string | string[], size?: number, updatable?: boolean, polylineMesh?: BABYLON.GreasedLineMesh) {
            if (polyline !== undefined) { this.polyline = polyline; }
            if (opacity !== undefined) { this.opacity = opacity; }
            if (colours !== undefined) { this.colours = colours; }
            if (size !== undefined) { this.size = size; }
            if (updatable !== undefined) { this.updatable = updatable; }
            if (polylineMesh !== undefined) { this.polylineMesh = polylineMesh; }
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
        polylineMesh?: BABYLON.GreasedLineMesh;
    }
    export class DrawPolylinesDto {
        /**
         * Provide options without default values
         */
        constructor(polylines?: PolylinePropertiesDto[], opacity?: number, colours?: string | string[], size?: number, updatable?: boolean, polylinesMesh?: BABYLON.GreasedLineMesh) {
            if (polylines !== undefined) { this.polylines = polylines; }
            if (opacity !== undefined) { this.opacity = opacity; }
            if (colours !== undefined) { this.colours = colours; }
            if (size !== undefined) { this.size = size; }
            if (updatable !== undefined) { this.updatable = updatable; }
            if (polylinesMesh !== undefined) { this.polylinesMesh = polylinesMesh; }
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
        polylinesMesh?: BABYLON.GreasedLineMesh;
    }
}
