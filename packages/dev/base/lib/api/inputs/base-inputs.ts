/* eslint-disable @typescript-eslint/no-namespace */
/**
 * Base namespace containing foundational types and enums used across all bitbybit packages.
 * This is the single source of truth - other packages extend this via module augmentation.
 */
export namespace Base {
    /**
     * A color as a CSS string - a hex value such as #ff8800, or any other form the browser
     * accepts. This is the form every draw option and material takes; use the color API to convert
     * to and from RGB and HSL.
     */
    export type Color = string;
    /**
     * A color as separate red, green and blue channels, each 0-255. Use it when you need to compute
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
     * Many operations expect it normalized, and say so on the parameter.
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
     * A coordinate frame: an origin, a normal (its z axis) and a direction (its x axis, square to the
     * normal); its y axis is the normal crossed with the direction, so the frame is right-handed. A
     * frame places things: shapes land on it, profiles are drawn in its plane.
     */
    export type Frame = { origin: Base.Point3, normal: Base.Vector3, direction: Base.Vector3 };
    /**
     * An infinite plane: an origin point, a normal vector, and a direction vector that fixes the
     * plane's rotation about its own normal.
     * @deprecated Use `Frame`, the same three fields; `Plane3` is removed in the next major version.
     */
    export type Plane3 = Frame;
    /**
     * The axis-aligned box enclosing a shape, as a min and a max corner, with the center and the
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
     * A connected chain of points in space, optionally closed, with an optional color. Closing it
     * turns the chain into an outline that can become a face.
     */
    export type Polyline3 = { points: Base.Point3[], isClosed?: boolean, color?: number[] };
    /**
     * A connected chain of points in the plane, optionally closed, with an optional color.
     */
    export type Polyline2 = { points: Base.Point2[], isClosed?: boolean, color?: number[] };
    /**
     * A 3x3 transformation matrix as 9 numbers, for transforms in the plane.
     */
    export type TransformMatrix3x3 = [number, number, number, number, number, number, number, number, number];
    /**
     * A list of 3x3 transformation matrices, applied one after another, first to last, as one
     * combined transform in the plane.
     */
    export type TransformMatrixes3x3 = TransformMatrix3x3[];
    /**
     * A 4x4 transformation matrix as 16 numbers in column-major order, so the translation sits at
     * indices 12 to 14. Translation, rotation and scale combined into one value that any geometry
     * API will accept, so the same transform applies equally to points, curves and solids.
     */
    export type TransformMatrix = [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number];
    /**
     * A list of 4x4 transformation matrices, applied one after another, first to last, as one
     * combined transform. A method that takes a list gives one result, not one per matrix.
     */
    export type TransformMatrixes = TransformMatrix[];

    /**
     * A run of numbers in one of a recipe's buffers: where it starts and how many numbers it holds.
     * @beta
     */
    export type RecipeRange = [number, number];
    /**
     * The numbers a recipe's nodes point into: coordinates in `f64`, triangle indices in `i32`.
     * @beta
     */
    export interface RecipeBuffers {
        /**
         * Coordinates: flat `x, y` pairs for polygons and `x, y, z` triples for triangle positions.
         * Every number in it is a coordinate, finite and between minus and plus one billion.
         */
        f64: Float64Array;
        /**
         * Triangle corners as positions counted from 0, three per triangle.
         */
        i32: Int32Array;
    }
    /**
     * A flat region in the XY plane: everything its boundary encloses, less everything any of its
     * holes encloses. The boundary and each hole are a range of `x, y` pairs without the first point
     * repeated, in either winding; a boundary that crosses itself keeps every loop it makes.
     * @beta
     */
    export interface RecipePolygonNode {
        /**
         * Always `polygon`.
         */
        op: "polygon";
        /**
         * The boundary, clockwise or counterclockwise.
         */
        points: RecipeRange;
        /**
         * The holes, clockwise or counterclockwise; they may overlap each other or reach past the
         * boundary, and only what lies inside the boundary is cut away.
         */
        holes: RecipeRange[];
    }
    /**
     * A flat disc in the XY plane. How many straight sides approximate it is left to the kernel that
     * builds the recipe.
     * @beta
     */
    export interface RecipeCircleNode {
        /**
         * Always `circle`.
         */
        op: "circle";
        /**
         * The centre, as `[x, y]`.
         */
        center: Point2;
        /**
         * The radius, above zero.
         */
        radius: number;
    }
    /**
     * A solid made by sweeping a polygon or circle node along a direction.
     * @beta
     */
    export interface RecipeExtrudeNode {
        /**
         * Always `extrude`.
         */
        op: "extrude";
        /**
         * The index of the polygon or circle node to sweep.
         */
        profile: number;
        /**
         * The direction of the sweep, which must not lie in the XY plane.
         */
        direction: Vector3;
        /**
         * How far to sweep along `direction`, which is normalised first, above zero.
         */
        depth: number;
    }
    /**
     * Everything on one side of a plane: the side `normal` points to. Used only as a tool of a
     * difference node, to cut a solid by the plane.
     * @beta
     */
    export interface RecipeHalfSpaceNode {
        /**
         * Always `halfSpace`.
         */
        op: "halfSpace";
        /**
         * A point on the plane.
         */
        origin: Point3;
        /**
         * The plane's normal, pointing into the half-space.
         */
        normal: Vector3;
    }
    /**
     * A solid with other solids or half-spaces cut away.
     * @beta
     */
    export interface RecipeDifferenceNode {
        /**
         * Always `difference`.
         */
        op: "difference";
        /**
         * The index of the solid to cut.
         */
        of: number;
        /**
         * The indices of what is cut away, all at once.
         */
        tools: number[];
    }
    /**
     * A node moved, turned or scaled by a matrix.
     * @beta
     */
    export interface RecipeTransformNode {
        /**
         * Always `transform`.
         */
        op: "transform";
        /**
         * The index of the node to transform.
         */
        of: number;
        /**
         * Sixteen numbers in column-major order, with 0, 0, 0, 1 as the bottom row: a move, a turn,
         * a mirror and a scale, never a projection.
         */
        matrix: TransformMatrix;
    }
    /**
     * A host solid with openings cut through it, such as a wall with its doors' and windows' holes.
     * The same as a difference, kept apart so an executor can cut openings through flat hosts in 2D.
     * @beta
     */
    export interface RecipeVoidsNode {
        /**
         * Always `voids`.
         */
        op: "voids";
        /**
         * The index of the host solid.
         */
        host: number;
        /**
         * The indices of the opening solids.
         */
        openings: number[];
    }
    /**
     * A triangle mesh: positions and the triangles between them.
     * @beta
     */
    export interface RecipeTrianglesNode {
        /**
         * Always `triangles`.
         */
        op: "triangles";
        /**
         * A range of `x, y, z` triples in `f64`.
         */
        positions: RecipeRange;
        /**
         * A range of `i32` indices into the positions, three per triangle.
         */
        indices: RecipeRange;
    }
    /**
     * Several solids taken together as one, filling the space any of them fills. Parts that
     * overlap may come back joined into one solid, depending on the kernel that builds it.
     * @beta
     */
    export interface RecipeCompoundNode {
        /**
         * Always `compound`.
         */
        op: "compound";
        /**
         * The indices of the solids.
         */
        of: number[];
    }
    /**
     * One step of a recipe. A node refers only to nodes before it, by their position in the list.
     * @beta
     */
    export type RecipeNode = RecipePolygonNode | RecipeCircleNode | RecipeExtrudeNode | RecipeHalfSpaceNode | RecipeDifferenceNode | RecipeTransformNode | RecipeVoidsNode | RecipeTrianglesNode | RecipeCompoundNode;
    /**
     * A value a recipe carries through to its results untouched.
     * @beta
     */
    export type RecipeTagValue = string | number | boolean | number[];
    /**
     * What a recipe builds: one node, placed by a matrix, labelled by a tag. Several roots may place
     * the same node, so a repeated part is described once.
     * @beta
     */
    export interface RecipeRoot {
        /**
         * The index of the node to build.
         */
        node: number;
        /**
         * Where the result is placed: sixteen numbers in column-major order, with 0, 0, 0, 1 as the
         * bottom row.
         */
        matrix: TransformMatrix;
        /**
         * Labels handed back with the result unchanged, such as an element's `globalId`.
         */
        tag: Record<string, RecipeTagValue>;
    }
    /**
     * Solids described as data rather than built: a list of steps (polygons, extrusions, cuts,
     * transforms, meshes) and the results to build from them. Every number is already resolved, so
     * a recipe has no variables or expressions; how finely circles are divided is left to the kernel
     * that builds it.
     *
     * Experimental: the recipe format may still change before it is declared stable.
     * @beta
     */
    export interface Recipe {
        /**
         * Always `bitbybit.recipe`.
         */
        format: "bitbybit.recipe";
        /**
         * The recipe format's version, 1.
         */
        version: 1;
        /**
         * How many millimetres one unit of the recipe is, for whoever reads the results: the
         * coordinates are in the recipe's own units, and an executor builds in them unscaled.
         */
        millimetresPerUnit: number;
        /**
         * The distance below which two positions count as the same, in the recipe's units, as the
         * recipe's source measured it. An executor may use it where it compares positions, or not.
         */
        tolerance: number;
        /**
         * The numbers the nodes point into.
         */
        buffers: RecipeBuffers;
        /**
         * The steps, each referring only to steps before it.
         */
        nodes: RecipeNode[];
        /**
         * The results to build.
         */
        roots: RecipeRoot[];
    }

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
