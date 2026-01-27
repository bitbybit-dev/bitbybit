/* eslint-disable @typescript-eslint/no-namespace */
/**
 * Base namespace containing foundational types and enums used across all bitbybit packages.
 * This is the single source of truth - other packages extend this via module augmentation.
 */
export namespace Base {
    // ============================================================================
    // Core Types
    // ============================================================================
    export type Color = string;
    export type ColorRGB = { r: number, g: number, b: number };
    export type ColorRGBA = { r: number, g: number, b: number, a: number };
    export type Material = any;
    export type Point2 = [number, number];
    export type Vector2 = [number, number];
    export type Point3 = [number, number, number];
    export type Vector3 = [number, number, number];
    export type Axis3 = { origin: Base.Point3, direction: Base.Vector3 };
    export type Axis2 = { origin: Base.Point2, direction: Base.Vector2 };
    export type Segment2 = [Point2, Point2];
    export type Segment3 = [Point3, Point3];
    /** Triangle plane is efficient definition described by a normal vector and d value (N dot X = d) */
    export type TrianglePlane3 = { normal: Vector3; d: number; }
    export type Triangle3 = [Base.Point3, Base.Point3, Base.Point3];
    export type Mesh3 = Triangle3[];
    export type Plane3 = { origin: Base.Point3, normal: Base.Vector3, direction: Base.Vector3 };
    export type BoundingBox = { min: Base.Point3, max: Base.Point3, center?: Base.Point3, width?: number, height?: number, length?: number };
    export type Line2 = { start: Base.Point2, end: Base.Point2 };
    export type Line3 = { start: Base.Point3, end: Base.Point3 };
    export type Polyline3 = { points: Base.Point3[], isClosed?: boolean, color?: number[] };
    export type Polyline2 = { points: Base.Point2[], isClosed?: boolean, color?: number[] };
    export type TransformMatrix3x3 = [number, number, number, number, number, number, number, number, number];
    export type TransformMatrixes3x3 = TransformMatrix3x3[];
    export type TransformMatrix = [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number];
    export type TransformMatrixes = TransformMatrix[];

    // ============================================================================
    // Alignment Enums
    // ============================================================================
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
    export enum basicAlignmentEnum {
        topLeft = "topLeft",
        topMid = "topMid",
        topRight = "topRight",
        midLeft = "midLeft",
        midMid = "midMid",
        midRight = "midRight",
        bottomLeft = "bottomLeft",
        bottomMid = "bottomMid",
        bottomRight = "bottomRight"
    }
}
