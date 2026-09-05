/* eslint-disable @typescript-eslint/no-namespace */
/**
 * Re-export Base namespace from @bitbybit-dev/core and extend with BabylonJS-specific types.
 * This includes the base types + core extensions (VerbCurve, VerbSurface, colorMapStrategyEnum, etc.)
 */
import { Base as CoreBase } from "@bitbybit-dev/core";

/**
 * The BabylonJS build's re-export of the shared primitive types, so engine-specific code sees Point3,
 * Vector3, colours and the shared enumerations from one place.
 */
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

    // BabylonJS-specific types and enums
    /** Texture type for BabylonJS materials */
    export type Texture = any;

    /**
     * Which built-in skybox environment to use as the scene's background and image-based lighting:
     * default, clear sky, city or a plain grey gradient. The skybox lights the model as well as
     * filling the background, so changing it changes how materials look.
     */
    export enum skyboxEnum {
        default = "default",
        clearSky = "clearSky",
        city = "city",
        greyGradient = "greyGradient",
    }
    /**
     * How distance fog thickens: not at all, linearly between a start and an end distance, or
     * exponentially - squared exponential being the densest. Linear is the predictable one because you
     * set exactly where fog begins and ends.
     */
    export enum fogModeEnum {
        none = "none",
        exponential = "exponential",
        exponentialSquared = "exponentialSquared",
        linear = "linear",
    }
    /**
     * The direction a linear gradient runs, given either as a named direction such as to bottom right
     * or as an angle in degrees. The values match the CSS gradient syntax.
     */
    export enum gradientDirectionEnum {
        toTop = "to top",
        toTopRight = "to top right",
        toRight = "to right",
        toBottomRight = "to bottom right",
        toBottom = "to bottom",
        toBottomLeft = "to bottom left",
        toLeft = "to left",
        toTopLeft = "to top left",
        deg0 = "0deg",
        deg45 = "45deg",
        deg90 = "90deg",
        deg135 = "135deg",
        deg180 = "180deg",
        deg225 = "225deg",
        deg270 = "270deg",
        deg315 = "315deg",
    }
    /**
     * Where the centre of a radial gradient sits, as a named position or a percentage pair. The values
     * match the CSS gradient syntax.
     */
    export enum gradientPositionEnum {
        center = "center",
        top = "top",
        topLeft = "top left",
        topRight = "top right",
        bottom = "bottom",
        bottomLeft = "bottom left",
        bottomRight = "bottom right",
        left = "left",
        right = "right",
        centerTop = "50% 0%",
        centerBottom = "50% 100%",
        leftCenter = "0% 50%",
        rightCenter = "100% 50%",
    }
    /**
     * The shape of a radial gradient: a circle, or an ellipse that stretches to its container.
     */
    export enum gradientShapeEnum {
        circle = "circle",
        ellipse = "ellipse",
    }
    /**
     * How a background image tiles: repeating in both directions, in one direction only, not at all,
     * or with space or round adjusting the tiles so they fit the area exactly. The values match the
     * CSS background-repeat syntax.
     */
    export enum backgroundRepeatEnum {
        repeat = "repeat",
        repeatX = "repeat-x",
        repeatY = "repeat-y",
        noRepeat = "no-repeat",
        space = "space",
        round = "round",
    }
    /**
     * How a background image is scaled to its area: at its natural size, covering the area and
     * cropping the overflow, or contained entirely within it with empty space around. The values match
     * the CSS background-size syntax.
     */
    export enum backgroundSizeEnum {
        auto = "auto",
        cover = "cover",
        contain = "contain",
    }
    /**
     * Whether a background image scrolls with its content, stays fixed to the viewport, or scrolls
     * within its own element. The values match the CSS background-attachment syntax.
     */
    export enum backgroundAttachmentEnum {
        scroll = "scroll",
        fixed = "fixed",
        local = "local",
    }
    /**
     * Which box a background image is positioned and clipped against - the padding, border or content
     * box. The values match the CSS background-origin and background-clip syntax.
     */
    export enum backgroundOriginClipEnum {
        paddingBox = "padding-box",
        borderBox = "border-box",
        contentBox = "content-box",
    }
}
