/* eslint-disable @typescript-eslint/no-namespace */
export namespace Base {
    export enum skyboxEnum {
        default = "default",
        clearSky = "clearSky",
        city = "city",
        greyGradient = "greyGradient",
    }
    export enum fogModeEnum {
        none = "none",
        exponential = "exponential",
        exponentialSquared = "exponentialSquared",
        linear = "linear",
    }
    export enum horizontalAlignEnum {
        left = "left",
        center = "center",
        right = "right",
    }
    export enum verticalAlignmentEnum {
        top = "top",
        middle = "middle",
        bottom = "bottom",
    }
    export enum topBottomEnum {
        top = "top",
        bottom = "bottom",
    }
    // Can't use BabylonJS types here as that crashes worker, which tries to include them
    export type Color = string;
    export type ColorRGB = { r: number, g: number, b: number };
    export type Point2 = [number, number];
    export type Vector2 = [number, number];
    export type Point3 = [number, number, number];
    export type Vector3 = [number, number, number];
    export type Axis3 = { origin: Base.Point3, direction: Base.Vector3 };
    export type Axis2 = { origin: Base.Point2, direction: Base.Vector2 };
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
    export type Polyline3 = { points: Base.Point3[], isClosed?: boolean };
    export type Polyline2 = { points: Base.Point2[], isClosed?: boolean };
    export type VerbCurve = { tessellate: (options: any) => any };
    export type VerbSurface = { tessellate: (options: any) => any };
    export type TransformMatrix3x3 = [number, number, number, number, number, number, number, number, number];
    export type TransformMatrixes3x3 = TransformMatrix3x3[];
    export type TransformMatrix = [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number];
    export type TransformMatrixes = TransformMatrix[];
}
