/* eslint-disable @typescript-eslint/no-namespace */
/**
 * Base namespace containing foundational types and enums used across all bitbybit packages.
 * This is the single source of truth - other packages extend this via module augmentation.
 */
export namespace Base {
    // ============================================================================
    // Core Types
    // ============================================================================
    /**
     * A colour as a CSS string - a hex value such as #ff8800, or any other form the browser
     * accepts. This is the form every draw option and material takes; use the color API to convert
     * to and from RGB and HSL.
     */
    export type Color = string;
    /**
     * A colour as separate red, green and blue channels, each 0-255. Use it when you need to compute
     * with the channels; convert to a Color string before handing it to a draw call.
     */
    export type ColorRGB = { r: number, g: number, b: number };
    /**
     * Red, green and blue channels plus an alpha channel for transparency. Alpha 0 is fully
     * transparent, 1 fully opaque.
     */
    export type ColorRGBA = { r: number, g: number, b: number, a: number };
    /**
     * An engine material object, passed through untyped because its shape depends on which renderer
     * is in use. Create one through the engine's material API rather than by hand.
     */
    export type Material = any;
    /**
     * A point in the plane as [x, y]. Points and vectors share the same array shape - the difference
     * is meaning, not structure: a point is a position, a vector is a direction and a magnitude.
     */
    export type Point2 = [number, number];
    /**
     * A direction and magnitude in the plane as [x, y]. Structurally identical to Point2; use this
     * name where the value means a direction rather than a position.
     */
    export type Vector2 = [number, number];
    /**
     * A point in space as [x, y, z], and the single most common type in the whole API. Y is up.
     * A plain array, so it survives JSON, passes between kernels unchanged, and can be built by
     * ordinary array code without a constructor.
     */
    export type Point3 = [number, number, number];
    /**
     * A direction and magnitude in space as [x, y, z]. Structurally identical to Point3; use this
     * name where the value means a direction - a normal, an axis, an offset - rather than a position.
     * Many operations expect it normalised, and say so on the parameter.
     */
    export type Vector3 = [number, number, number];
    /**
     * An axis in space: an origin point and a direction vector. Used wherever an operation needs both
     * a position and an orientation - rotating about an arbitrary line, revolving a profile, mirroring
     * across a line.
     */
    export type Axis3 = { origin: Base.Point3, direction: Base.Vector3 };
    /**
     * An axis in the plane: an origin point and a direction vector.
     */
    export type Axis2 = { origin: Base.Point2, direction: Base.Vector2 };
    /**
     * A finite straight segment in the plane as a pair of points, [start, end].
     */
    export type Segment2 = [Point2, Point2];
    /**
     * A finite straight segment in space as a pair of points, [start, end]. The array form, as opposed
     * to Line3 which names its ends; both describe the same thing and different APIs prefer different
     * shapes.
     */
    export type Segment3 = [Point3, Point3];
    /** Triangle plane is efficient definition described by a normal vector and d value (N dot X = d) */
    export type TrianglePlane3 = { normal: Vector3; d: number; }
    /**
     * A triangle as three points. The winding order decides which way the face points, so reversing it
     * flips the normal.
     */
    export type Triangle3 = [Base.Point3, Base.Point3, Base.Point3];
    /**
     * A mesh as a flat list of triangles. The simplest possible mesh representation - no shared
     * vertices and no index buffer - which makes it easy to build and to reason about, at the cost of
     * repeating coordinates.
     */
    export type Mesh3 = Triangle3[];
    /**
     * An infinite plane: an origin point, a normal vector, and a direction vector that fixes the
     * plane's rotation about its own normal. That third field is what lets an operation place 2D
     * geometry on the plane with a predictable orientation rather than an arbitrary one.
     */
    export type Plane3 = { origin: Base.Point3, normal: Base.Vector3, direction: Base.Vector3 };
    /**
     * The axis-aligned box enclosing a shape, as a min and a max corner, with the centre and the
     * width, height and length filled in as a convenience. Use it to size a camera to a model, to lay
     * objects out without overlap, or to check a part fits a build volume.
     */
    export type BoundingBox = { min: Base.Point3, max: Base.Point3, center?: Base.Point3, width?: number, height?: number, length?: number };
    /**
     * A finite straight line in the plane, named as start and end.
     */
    export type Line2 = { start: Base.Point2, end: Base.Point2 };
    /**
     * A finite straight line in space, named as start and end. The named form, as opposed to Segment3
     * which is a pair of points; different APIs prefer different shapes.
     */
    export type Line3 = { start: Base.Point3, end: Base.Point3 };
    /**
     * A connected chain of points in space, optionally closed, with an optional colour. Closing it
     * turns the chain into an outline that can become a face.
     */
    export type Polyline3 = { points: Base.Point3[], isClosed?: boolean, color?: number[] };
    /**
     * A connected chain of points in the plane, optionally closed, with an optional colour.
     */
    export type Polyline2 = { points: Base.Point2[], isClosed?: boolean, color?: number[] };
    /**
     * A 3x3 transformation matrix as 9 numbers, for transforms in the plane.
     */
    export type TransformMatrix3x3 = [number, number, number, number, number, number, number, number, number];
    /**
     * A list of 3x3 transformation matrices, for producing patterned layouts in the plane.
     */
    export type TransformMatrixes3x3 = TransformMatrix3x3[];
    /**
     * A 4x4 transformation matrix as 16 numbers in row-major order. Translation, rotation and scale
     * combined into one value that any geometry API will accept, so the same transform applies
     * equally to points, curves and solids.
     */
    export type TransformMatrix = [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number];
    /**
     * A list of 4x4 transformation matrices. Applying a list transforms a shape once per matrix,
     * which is how patterned arrays and instanced layouts are produced in a single call.
     */
    export type TransformMatrixes = TransformMatrix[];

    // ============================================================================
    // Alignment Enums
    // ============================================================================
    /**
     * Horizontal alignment of content against its anchor: left, center or right.
     */
    export enum horizontalAlignEnum {
        left = "left",
        center = "center",
        right = "right",
    }
    /**
     * Vertical alignment of content against its anchor: top, middle or bottom.
     */
    export enum verticalAlignmentEnum {
        top = "top",
        middle = "middle",
        bottom = "bottom",
    }
    /**
     * Which of the two ends of something to act on - the top or the bottom. Used where an operation
     * can cap, extend or trim one end of a shape.
     */
    export enum topBottomEnum {
        top = "top",
        bottom = "bottom",
    }
    /**
     * Alignment against a nine-cell grid, combining a horizontal and a vertical position into one
     * value - topLeft through bottomRight. Used to place text and 2D content without needing two
     * separate alignment settings.
     */
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
