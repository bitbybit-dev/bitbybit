/* eslint-disable @typescript-eslint/no-namespace */
export namespace Base {
    export type Color = string;
    export type ColorRGB = { r: number, g: number, b: number };
    export type Point2 = [number, number];
    export type Vector2 = [number, number];
    export type Point3 = [number, number, number];
    export type Vector3 = [number, number, number];
    export type BoundingBox = { min: Base.Point3, max: Base.Point3, center?: Base.Point3, width?: number, height?: number, length?: number };
    export type Line2 = { start: Base.Point2, end: Base.Point2 };
    export type Line3 = { start: Base.Point3, end: Base.Point3 };
    export type Polyline3 = { points: Base.Point3[], isClosed?: boolean };
    export type Polyline2 = { points: Base.Point2[], isClosed?: boolean };
    export type VerbCurve = { tessellate: (options: any) => any };
    export type VerbSurface = { tessellate: (options: any) => any };
    export type TransformMatrix3x3 = [number, number, number, number, number, number, number, number, number];
    export type TransformMatrixes3x3 = TransformMatrix3x3[];
    export type TransformMatrix = [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number];
    export type TransformMatrixes = TransformMatrix[];
}
