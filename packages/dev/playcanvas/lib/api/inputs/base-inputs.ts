/* eslint-disable @typescript-eslint/no-namespace */
/**
 * Re-export Base namespace from @bitbybit-dev/core and extend with PlayCanvas-specific types.
 * This includes the base types + core extensions (VerbCurve, VerbSurface, colorMapStrategyEnum, etc.)
 */
import { Base as CoreBase } from "@bitbybit-dev/core";

export namespace Base {
    // Re-export all types from core package (which includes base types)
    export type Color = CoreBase.Color;
    export type ColorRGB = CoreBase.ColorRGB;
    export type ColorRGBA = CoreBase.ColorRGBA;
    export type Material = CoreBase.Material;
    export type Point2 = CoreBase.Point2;
    export type Vector2 = CoreBase.Vector2;
    export type Point3 = CoreBase.Point3;
    export type Vector3 = CoreBase.Vector3;
    export type Axis3 = CoreBase.Axis3;
    export type Axis2 = CoreBase.Axis2;
    export type Segment2 = CoreBase.Segment2;
    export type Segment3 = CoreBase.Segment3;
    export type TrianglePlane3 = CoreBase.TrianglePlane3;
    export type Triangle3 = CoreBase.Triangle3;
    export type Mesh3 = CoreBase.Mesh3;
    export type Plane3 = CoreBase.Plane3;
    export type BoundingBox = CoreBase.BoundingBox;
    export type Line2 = CoreBase.Line2;
    export type Line3 = CoreBase.Line3;
    export type Polyline3 = CoreBase.Polyline3;
    export type Polyline2 = CoreBase.Polyline2;
    export type TransformMatrix3x3 = CoreBase.TransformMatrix3x3;
    export type TransformMatrixes3x3 = CoreBase.TransformMatrixes3x3;
    export type TransformMatrix = CoreBase.TransformMatrix;
    export type TransformMatrixes = CoreBase.TransformMatrixes;

    // Re-export enums from base package
    export const horizontalAlignEnum = CoreBase.horizontalAlignEnum;
    export type horizontalAlignEnum = CoreBase.horizontalAlignEnum;
    export const verticalAlignmentEnum = CoreBase.verticalAlignmentEnum;
    export type verticalAlignmentEnum = CoreBase.verticalAlignmentEnum;
    export const topBottomEnum = CoreBase.topBottomEnum;
    export type topBottomEnum = CoreBase.topBottomEnum;
    export const basicAlignmentEnum = CoreBase.basicAlignmentEnum;
    export type basicAlignmentEnum = CoreBase.basicAlignmentEnum;

    // Re-export core-specific types and enums
    export const colorMapStrategyEnum = CoreBase.colorMapStrategyEnum;
    export type colorMapStrategyEnum = CoreBase.colorMapStrategyEnum;
    export type VerbCurve = CoreBase.VerbCurve;
    export type VerbSurface = CoreBase.VerbSurface;

    // PlayCanvas-specific types
    /** Texture type for PlayCanvas materials */
    export type Texture = any;
}
