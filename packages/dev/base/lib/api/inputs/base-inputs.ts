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
     * A connected chain of points in space, optionally closed, with an optional color: a hex text
     * such as `#ff0000`, or `[r, g, b]` values from 0 to 1. Closing it turns the chain into an
     * outline that can become a face.
     */
    export type Polyline3 = { points: Base.Point3[], isClosed?: boolean, color?: string | number[] };
    /**
     * A connected chain of points in the plane, optionally closed, with an optional color: a hex
     * text such as `#ff0000`, or `[r, g, b]` values from 0 to 1.
     */
    export type Polyline2 = { points: Base.Point2[], isClosed?: boolean, color?: string | number[] };
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
         * Coordinates: flat `x, y` pairs for polygons, `x, y, z` triples for triangle positions and
         * vertices, sixteen numbers for each frame of a loft, and the control points, weights and
         * knots of a brep node's curves and surfaces. Every number in it is finite and between minus
         * and plus one billion.
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
     * Several solids joined into one, filling the space any of them fills, with no faces left where
     * they meet.
     * @beta
     */
    export interface RecipeUnionNode {
        /**
         * Always `union`.
         */
        op: "union";
        /**
         * The indices of the solids, at least one.
         */
        of: number[];
    }
    /**
     * The space every one of several solids fills.
     * @beta
     */
    export interface RecipeIntersectionNode {
        /**
         * Always `intersection`.
         */
        op: "intersection";
        /**
         * The indices of the solids, at least two.
         */
        of: number[];
    }
    /**
     * A solid made by turning a polygon or circle node about an axis in the XY plane, such as a pipe
     * bend or a round column's capital. The profile must lie on one side of the axis.
     * @beta
     */
    export interface RecipeRevolveNode {
        /**
         * Always `revolve`.
         */
        op: "revolve";
        /**
         * The index of the polygon or circle node to turn.
         */
        profile: number;
        /**
         * A point on the axis, as `[x, y]`.
         */
        origin: Point2;
        /**
         * The axis direction, as `[x, y]`; not a zero vector.
         */
        direction: Vector2;
        /**
         * How far to turn, in radians, above zero and at most a whole turn. The turn follows the
         * right-hand rule about `direction`.
         */
        angle: number;
    }
    /**
     * A solid made by placing polygon or circle nodes one after another by frames and joining each to
     * the next by straight sides, closed at both ends: a profile swept along a path when one profile
     * is placed by many frames, or a taper from one profile to another.
     * @beta
     */
    export interface RecipeLoftNode {
        /**
         * Always `loft`.
         */
        op: "loft";
        /**
         * The indices of the polygon or circle nodes: one, placed by every frame, or one per frame.
         * Profiles that differ should have as many corners in each loop, so a mesh kernel can join
         * them corner to corner.
         */
        profiles: number[];
        /**
         * A range of `f64` holding sixteen numbers per frame, at least two frames: each a column-major
         * matrix with 0, 0, 0, 1 as its bottom row, placing a profile's XY plane.
         */
        frames: RecipeRange;
    }
    /**
     * Where a curve or surface of a brep node sits: an origin, its local Z axis and its local X
     * axis, as IFC's and STEP's axis placements give them. The X axis is made square to the Z axis
     * before use.
     * @beta
     */
    export interface RecipeBrepPlacement {
        /**
         * The local origin.
         */
        origin: Point3;
        /**
         * The local Z axis: the normal of a plane, the axis of a cylinder, cone, sphere, torus or
         * circle. Not a zero vector.
         */
        axis: Vector3;
        /**
         * The local X axis, where a circle's or a surface's parameters start. Not a zero vector, and
         * not along `axis`.
         */
        xDirection: Vector3;
    }
    /**
     * A straight line through `origin` along `direction`.
     * @beta
     */
    export interface RecipeBrepLine {
        /**
         * Always `line`.
         */
        kind: "line";
        /**
         * A point on the line.
         */
        origin: Point3;
        /**
         * The line's direction, not a zero vector.
         */
        direction: Vector3;
    }
    /**
     * A circle about its placement's axis, starting on its X axis.
     * @beta
     */
    export interface RecipeBrepCircle extends RecipeBrepPlacement {
        /**
         * Always `circle`.
         */
        kind: "circle";
        /**
         * The radius, above zero.
         */
        radius: number;
    }
    /**
     * An ellipse about its placement's axis, with one semi-axis along its X axis and the other
     * square to it; either may be the longer.
     * @beta
     */
    export interface RecipeBrepEllipse extends RecipeBrepPlacement {
        /**
         * Always `ellipse`.
         */
        kind: "ellipse";
        /**
         * The semi-axis along the placement's X axis, above zero.
         */
        xRadius: number;
        /**
         * The semi-axis square to it, above zero.
         */
        yRadius: number;
    }
    /**
     * A B-spline curve, rational when it has weights, with its knots and their multiplicities as
     * STEP and IFC write them: knots rising, and the multiplicities adding up to the number of
     * control points plus the degree plus one.
     * @beta
     */
    export interface RecipeBrepBSplineCurve {
        /**
         * Always `bspline`.
         */
        kind: "bspline";
        /**
         * The degree, from 1 to 25.
         */
        degree: number;
        /**
         * A range of `x, y, z` triples in `f64`: the control points, at least the degree plus one.
         */
        points: RecipeRange;
        /**
         * A range in `f64` with one weight above zero per control point; left out for a curve that
         * is not rational.
         */
        weights?: RecipeRange | undefined;
        /**
         * A range in `f64` holding the distinct knots, rising.
         */
        knots: RecipeRange;
        /**
         * How many times each knot repeats, one whole number above zero per knot.
         */
        multiplicities: number[];
    }
    /**
     * A curve an edge of a brep node lies on.
     * @beta
     */
    export type RecipeBrepCurve = RecipeBrepLine | RecipeBrepCircle | RecipeBrepEllipse | RecipeBrepBSplineCurve;
    /**
     * A plane through its placement's origin, square to its axis.
     * @beta
     */
    export interface RecipeBrepPlane extends RecipeBrepPlacement {
        /**
         * Always `plane`.
         */
        kind: "plane";
    }
    /**
     * A cylinder about its placement's axis.
     * @beta
     */
    export interface RecipeBrepCylinder extends RecipeBrepPlacement {
        /**
         * Always `cylinder`.
         */
        kind: "cylinder";
        /**
         * The radius, above zero.
         */
        radius: number;
    }
    /**
     * A cone about its placement's axis, widening along it.
     * @beta
     */
    export interface RecipeBrepCone extends RecipeBrepPlacement {
        /**
         * Always `cone`.
         */
        kind: "cone";
        /**
         * The radius in the plane through the origin square to the axis, zero or above.
         */
        radius: number;
        /**
         * The angle between the axis and the cone's side, in radians, above zero and below a
         * quarter turn.
         */
        semiAngle: number;
    }
    /**
     * A sphere about its placement's origin.
     * @beta
     */
    export interface RecipeBrepSphere extends RecipeBrepPlacement {
        /**
         * Always `sphere`.
         */
        kind: "sphere";
        /**
         * The radius, above zero.
         */
        radius: number;
    }
    /**
     * A torus about its placement's axis.
     * @beta
     */
    export interface RecipeBrepTorus extends RecipeBrepPlacement {
        /**
         * Always `torus`.
         */
        kind: "torus";
        /**
         * The distance from the axis to the centre of the tube, above zero.
         */
        majorRadius: number;
        /**
         * The radius of the tube, above zero.
         */
        minorRadius: number;
    }
    /**
     * A B-spline surface, rational when it has weights. Its control points form a net of
     * `uCount` rows of `vCount` points, row by row, as STEP's list of lists does.
     * @beta
     */
    export interface RecipeBrepBSplineSurface {
        /**
         * Always `bspline`.
         */
        kind: "bspline";
        /**
         * The degree along u, from 1 to 25.
         */
        uDegree: number;
        /**
         * The degree along v, from 1 to 25.
         */
        vDegree: number;
        /**
         * How many rows of control points there are along u.
         */
        uCount: number;
        /**
         * How many control points each row holds, along v.
         */
        vCount: number;
        /**
         * A range of `x, y, z` triples in `f64`: `uCount` times `vCount` control points.
         */
        points: RecipeRange;
        /**
         * A range in `f64` with one weight above zero per control point; left out for a surface
         * that is not rational.
         */
        weights?: RecipeRange | undefined;
        /**
         * A range in `f64` holding the distinct knots along u, rising.
         */
        uKnots: RecipeRange;
        /**
         * How many times each knot along u repeats; they add up to `uCount` plus `uDegree` plus one.
         */
        uMultiplicities: number[];
        /**
         * A range in `f64` holding the distinct knots along v, rising.
         */
        vKnots: RecipeRange;
        /**
         * How many times each knot along v repeats; they add up to `vCount` plus `vDegree` plus one.
         */
        vMultiplicities: number[];
    }
    /**
     * The surface a curve sweeps turning about an axis.
     * @beta
     */
    export interface RecipeBrepRevolution {
        /**
         * Always `revolution`.
         */
        kind: "revolution";
        /**
         * The index of the curve that turns, among the node's curves.
         */
        curve: number;
        /**
         * A point on the axis.
         */
        origin: Point3;
        /**
         * The axis direction, not a zero vector.
         */
        axis: Vector3;
    }
    /**
     * The surface a curve sweeps moving along a direction.
     * @beta
     */
    export interface RecipeBrepExtrusion {
        /**
         * Always `extrusion`.
         */
        kind: "extrusion";
        /**
         * The index of the curve that moves, among the node's curves.
         */
        curve: number;
        /**
         * The direction it moves along, not a zero vector.
         */
        direction: Vector3;
    }
    /**
     * A surface a face of a brep node lies on.
     * @beta
     */
    export type RecipeBrepSurface = RecipeBrepPlane | RecipeBrepCylinder | RecipeBrepCone | RecipeBrepSphere | RecipeBrepTorus | RecipeBrepBSplineSurface | RecipeBrepRevolution | RecipeBrepExtrusion;
    /**
     * An edge of a brep node: the part of a curve between two vertices. Faces that meet along an
     * edge name the same edge.
     * @beta
     */
    export interface RecipeBrepEdge {
        /**
         * The index of the curve, among the node's curves.
         */
        curve: number;
        /**
         * The index of the vertex the edge starts at.
         */
        start: number;
        /**
         * The index of the vertex the edge ends at; the same as `start` for a closed edge, such as a
         * whole circle.
         */
        end: number;
        /**
         * Whether the edge runs from `start` to `end` the way the curve runs; left out, it does.
         * A closed edge with no `parameters` takes the whole curve.
         */
        sameSense?: boolean | undefined;
        /**
         * The curve's parameters at the start and the end; left out, they are found from the
         * vertices.
         */
        parameters?: [number, number] | undefined;
    }
    /**
     * A loop bounding a face: edges in order, each run forward or backward, end to end.
     * @beta
     */
    export interface RecipeBrepBound {
        /**
         * Whether this is the face's outer boundary; a face has at most one.
         */
        outer: boolean;
        /**
         * The indices of the edges, in the order the loop runs.
         */
        edges: number[];
        /**
         * For each edge, whether the loop runs it from its start to its end.
         */
        forward: boolean[];
    }
    /**
     * A face of a brep node: the part of a surface its bounds enclose.
     * @beta
     */
    export interface RecipeBrepFace {
        /**
         * The index of the surface, among the node's surfaces.
         */
        surface: number;
        /**
         * Whether the face's outward side is the surface's normal side.
         */
        sameSense: boolean;
        /**
         * The loops bounding the face, at least one.
         */
        bounds: RecipeBrepBound[];
    }
    /**
     * A boundary representation given exactly, as STEP and IFC describe one: vertices, edges on
     * curves, and faces on surfaces bounded by loops of those edges. Faces meet on shared edges, so
     * a closed set of faces is a solid.
     *
     * A kernel that builds no exact surfaces builds `fallback` instead, a node describing the same
     * faces approximately, such as their triangles.
     * @beta
     */
    export interface RecipeBrepNode {
        /**
         * Always `brep`.
         */
        op: "brep";
        /**
         * A range of `x, y, z` triples in `f64`: the vertices.
         */
        vertices: RecipeRange;
        /**
         * The curves the edges lie on, and the curves surfaces of revolution and extrusion sweep.
         */
        curves: RecipeBrepCurve[];
        /**
         * The surfaces the faces lie on.
         */
        surfaces: RecipeBrepSurface[];
        /**
         * The edges.
         */
        edges: RecipeBrepEdge[];
        /**
         * The faces, at least one.
         */
        faces: RecipeBrepFace[];
        /**
         * Whether the faces close a volume, so the result is a solid rather than a shell.
         */
        closed: boolean;
        /**
         * The index of an earlier node to build where exact surfaces cannot be, or are not built.
         */
        fallback?: number | undefined;
    }
    /**
     * One step of a recipe. A node refers only to nodes before it, by their position in the list.
     * @beta
     */
    export type RecipeNode = RecipePolygonNode | RecipeCircleNode | RecipeExtrudeNode | RecipeHalfSpaceNode | RecipeDifferenceNode | RecipeTransformNode | RecipeVoidsNode | RecipeTrianglesNode | RecipeCompoundNode | RecipeUnionNode | RecipeIntersectionNode | RecipeRevolveNode | RecipeLoftNode | RecipeBrepNode;
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
        /**
         * The index of the group the result belongs to, such as the storey an element stands on;
         * left out for a result that belongs to none.
         */
        group?: number | undefined;
    }
    /**
     * A named group of a recipe's results, such as a storey or an assembly of parts, which may lie
     * in another group. An executor that builds a structure, such as an assembly document, nests its
     * results by their groups; one that only builds shapes ignores them.
     *
     * Experimental: the recipe format may still change before it is declared stable.
     * @beta
     */
    export interface RecipeGroup {
        /**
         * What the group is called, such as `Ground floor`.
         */
        name: string;
        /**
         * The index of the group this one lies in, which comes earlier in the list; left out for a
         * group at the top.
         */
        parent?: number | undefined;
        /**
         * Labels handed back with the group unchanged, such as a storey's `globalId`.
         */
        tag: Record<string, RecipeTagValue>;
    }
    /**
     * Solids described as data rather than built: a list of steps (polygons, extrusions, turns and
     * lofts, cuts and unions, transforms, meshes) and the results to build from them. Every number is already resolved, so
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
        /**
         * The groups the results belong to, each after the group it lies in; left out when the
         * results are not grouped.
         */
        groups?: RecipeGroup[] | undefined;
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
