/* eslint-disable @typescript-eslint/no-namespace */
export namespace Base {
    export type Color = string;
    export type ColorRGB = { r: number, g: number, b: number };
    export type Material = any;
    export type Point2 = [number, number];
    export type Vector2 = [number, number];
    export type Point3 = [number, number, number];
    export type Vector3 = [number, number, number];
    export type Line2 = { start: Base.Point2, end: Base.Point2 };
    export type Line3 = { start: Base.Point3, end: Base.Point3 };
    export type Polyline3 = { points: Base.Point3[], isClosed?: boolean, color?: number[] };
    export type Polyline2 = { points: Base.Point2[], isClosed?: boolean, color?: number[] };
    export type VerbCurve = { tessellate: (options: any) => any };
    export type VerbSurface = { tessellate: (options: any) => any };
    export type TransformMatrixes = [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number][];
}
