/* eslint-disable @typescript-eslint/no-namespace */
/**
 * Re-export Base namespace from @bitbybit-dev/base and extend with core-specific types.
 */
import { Base as BaseTypes } from "@bitbybit-dev/base";

export namespace Base {
    // Re-export all types from base package
    export type Color = BaseTypes.Color;
    export type ColorRGB = BaseTypes.ColorRGB;
    export type ColorRGBA = BaseTypes.ColorRGBA;
    export type Material = BaseTypes.Material;
    export type Point2 = BaseTypes.Point2;
    export type Vector2 = BaseTypes.Vector2;
    export type Point3 = BaseTypes.Point3;
    export type Vector3 = BaseTypes.Vector3;
    export type Axis3 = BaseTypes.Axis3;
    export type Axis2 = BaseTypes.Axis2;
    export type Segment2 = BaseTypes.Segment2;
    export type Segment3 = BaseTypes.Segment3;
    export type TrianglePlane3 = BaseTypes.TrianglePlane3;
    export type Triangle3 = BaseTypes.Triangle3;
    export type Mesh3 = BaseTypes.Mesh3;
    export type Plane3 = BaseTypes.Plane3;
    export type BoundingBox = BaseTypes.BoundingBox;
    export type Line2 = BaseTypes.Line2;
    export type Line3 = BaseTypes.Line3;
    export type Polyline3 = BaseTypes.Polyline3;
    export type Polyline2 = BaseTypes.Polyline2;
    export type TransformMatrix3x3 = BaseTypes.TransformMatrix3x3;
    export type TransformMatrixes3x3 = BaseTypes.TransformMatrixes3x3;
    export type TransformMatrix = BaseTypes.TransformMatrix;
    export type TransformMatrixes = BaseTypes.TransformMatrixes;

    // Re-export enums from base package
    export const horizontalAlignEnum = BaseTypes.horizontalAlignEnum;
    export type horizontalAlignEnum = BaseTypes.horizontalAlignEnum;
    export const verticalAlignmentEnum = BaseTypes.verticalAlignmentEnum;
    export type verticalAlignmentEnum = BaseTypes.verticalAlignmentEnum;
    export const topBottomEnum = BaseTypes.topBottomEnum;
    export type topBottomEnum = BaseTypes.topBottomEnum;
    export const basicAlignmentEnum = BaseTypes.basicAlignmentEnum;
    export type basicAlignmentEnum = BaseTypes.basicAlignmentEnum;

    // Core-specific types and enums
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
    /** NURBS curve type from verb-nurbs library */
    export type VerbCurve = { tessellate: (options: any) => any };
    /** NURBS surface type from verb-nurbs library */
    export type VerbSurface = { tessellate: (options: any) => any };
}
