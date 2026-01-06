/* eslint-disable @typescript-eslint/no-namespace */
export namespace Base {
    /**
     * Defines how colors are mapped to entities when there are more entities than colors.
     * - firstColorForAll: Uses the first color for all entities (legacy behavior)
     * - lastColorRemainder: Maps colors 1:1, then uses last color for remaining entities
     * - repeatColors: Cycles through colors in a repeating pattern
     * - reversedColors: After exhausting colors, reverses direction (ping-pong pattern)
     */
    export enum colorMapStrategyEnum {
        /** Uses the first color for all entities (legacy behavior) */
        firstColorForAll = "firstColorForAll",
        /** Maps colors 1:1, then uses last color for remaining entities */
        lastColorRemainder = "lastColorRemainder",
        /** Cycles through colors in a repeating pattern */
        repeatColors = "repeatColors",
        /** After exhausting colors, reverses direction (ping-pong pattern) */
        reversedColors = "reversedColors",
    }
    export type Color = string;
    export type ColorRGB = { r: number, g: number, b: number };
    export type Material = any;
    export type Texture = any;
    export type Point2 = [number, number];
    export type Vector2 = [number, number];
    export type Point3 = [number, number, number];
    export type Vector3 = [number, number, number];
    export type Axis3 = {origin: Base.Point3, direction: Base.Vector3};
    export type Axis2 = {origin: Base.Point2, direction: Base.Vector2};
    export type Segment2 = [Point2, Point2];
    export type Segment3 = [Point3, Point3];
    // Triangle plane is efficient defininition described by a normal vector and d value (N dot X = d)
    export type TrianglePlane3 = { normal: Vector3; d: number; }
    export type Triangle3 = [Base.Point3, Base.Point3, Base.Point3];
    export type Mesh3 = Triangle3[];
    export type Plane3 = { origin: Base.Point3, normal: Base.Vector3, direction: Base.Vector3 };
    export type BoundingBox = { min: Base.Point3, max: Base.Point3, center?: Base.Point3, width?: number, height?: number, length?: number };
    export type Line2 = { start: Base.Point2, end: Base.Point2 };
    export type Line3 = { start: Base.Point3, end: Base.Point3 };
    export type Polyline3 = { points: Base.Point3[], isClosed?: boolean, color?: number[] };
    export type Polyline2 = { points: Base.Point2[], isClosed?: boolean, color?: number[] };
    export type VerbCurve = { tessellate: (options: any) => any };
    export type VerbSurface = { tessellate: (options: any) => any };
    export type TransformMatrix3x3 = [number, number, number, number, number, number, number, number, number];
    export type TransformMatrixes3x3 = TransformMatrix3x3[];
    export type TransformMatrix = [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number];
    export type TransformMatrixes = TransformMatrix[];
}
