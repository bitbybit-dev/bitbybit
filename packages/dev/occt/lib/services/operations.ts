import {
    BitbybitOcctModule, TopoDS_Compound, TopoDS_Edge, TopoDS_Shape, TopoDS_Wire, TopoDS_Face
} from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../occ-helper";
import * as Inputs from "../api/inputs";

/**
 * The modeling operations that turn OpenCascade wires and faces into surfaces and solids and
 * measure shapes: lofting through sections, extruding and revolving, sweeping profiles along paths,
 * offsetting, thickening shells into solids, slicing and splitting, plus bounding boxes, bounding
 * spheres and closest-point queries. Distances are in model units and angles in degrees; every
 * operation returns a new shape. Booleans live in `booleans`, rounding in `fillets`.
 */
export class OCCTOperations {

    constructor(
        _occ: BitbybitOcctModule,
        private readonly och: OccHelper
    ) {
    }

    /**
     * Builds a surface through a series of wires, like skin stretched over ribs: each wire is one
     * section and the surface passes through them in list order.
     *
     * Edges are accepted as single-edge wires. With `makeSolid` true and closed sections the result
     * is capped into a solid; otherwise it is a shell. Sections match up best with equal edge
     * counts.
     * @param inputs - The section wires or edges, in order, and whether to make a solid
     * @returns The lofted shell or solid
     * @group lofts
     * @shortname loft
     * @drawable true
     * @example
     * ```typescript
     * const bottom = await bitbybit.occt.shapes.wire.createCircleWire({ radius: 5, center: [0, 0, 0], direction: [0, 1, 0] });
     * const upper = await bitbybit.occt.shapes.wire.createSquareWire({ size: 6, center: [0, 10, 0], direction: [0, 1, 0] });
     * const vase = await bitbybit.occt.operations.loft({ shapes: [bottom, upper], makeSolid: true });
     * ```
     */
    loft(inputs: Inputs.OCCT.LoftDto<TopoDS_Wire | TopoDS_Edge>): TopoDS_Shape {
        return this.och.operationsService.loft(inputs);
    }

    /**
     * Builds a surface through a series of wires like `loft`, with control over how the skin is
     * fitted.
     *
     * `straight` makes ruled patches between sections instead of a smooth blend; `closed` loops the
     * surface from the last section back to the first, and `periodic` makes that loop smooth by
     * resampling the sections. `startVertex` and `endVertex` close the ends to points.
     * @param inputs - The section wires or edges, whether to make a solid, the closing and smoothing options and optional end points
     * @returns The lofted shell or solid
     * @group lofts
     * @shortname loft adv.
     * @drawable true
     * @example
     * ```typescript
     * const cone = await bitbybit.occt.operations.loftAdvanced({
     *     shapes: [circleBottom, circleMiddle],
     *     makeSolid: true,
     *     closed: false,
     *     periodic: false,
     *     straight: false,
     *     nrPeriodicSections: 10,
     *     useSmoothing: false,
     *     maxUDegree: 3,
     *     tolerance: 1e-7,
     *     parType: Bit.Inputs.OCCT.approxParametrizationTypeEnum.approxCentripetal,
     *     endVertex: [0, 20, 0],
     * });
     * ```
     */
    loftAdvanced(inputs: Inputs.OCCT.LoftAdvancedDto<TopoDS_Wire | TopoDS_Edge>): TopoDS_Shape {
        return this.och.operationsService.loftAdvanced(inputs);
    }

    /**
     * Finds the pair of points, one on each shape, that are closest to each other.
     *
     * The distance between them is the gap between the shapes; it is 0 when they touch or overlap.
     * Throws an error when no pair can be found.
     * @param inputs - The two shapes
     * @returns The point on the first shape and the point on the second
     * @group closest pts
     * @shortname two shapes
     * @drawable true
     * @example
     * ```typescript
     * const [onBox, onSphere] = await bitbybit.occt.operations.closestPointsBetweenTwoShapes({ shape1: box, shape2: sphere });
     * ```
     */
    closestPointsBetweenTwoShapes(inputs: Inputs.OCCT.ClosestPointsBetweenTwoShapesDto<TopoDS_Shape>): [Inputs.Base.Point3, Inputs.Base.Point3] {
        return this.och.operationsService.closestPointsBetweenTwoShapes(inputs.shape1, inputs.shape2);
    }

    /**
     * Finds, for each point in a list, the closest point on a shape.
     *
     * A point already on the shape maps to itself. Useful for snapping points onto a surface.
     * @param inputs - The shape and the points
     * @returns One point on the shape per input point, in the same order
     * @group closest pts
     * @shortname on shape
     * @drawable true
     * @example
     * ```typescript
     * const snapped = await bitbybit.occt.operations.closestPointsOnShapeFromPoints({ shape: sphere, points: [[0, 20, 0], [20, 0, 0]] });
     * ```
     */
    closestPointsOnShapeFromPoints(inputs: Inputs.OCCT.ClosestPointsOnShapeFromPointsDto<TopoDS_Shape>): Inputs.Base.Point3[] {
        return this.och.operationsService.closestPointsOnShapeFromPoints(inputs);
    }

    /**
     * Finds the closest point on each of several shapes for each point in a list.
     *
     * The result is one flat list: all the points for the first shape, in point order, then all the
     * points for the second shape, and so on.
     * @param inputs - The shapes and the points
     * @returns The closest points, grouped shape by shape
     * @group closest pts
     * @shortname on shapes
     * @drawable true
     * @example
     * ```typescript
     * const snapped = await bitbybit.occt.operations.closestPointsOnShapesFromPoints({ shapes: [box, sphere], points: [[0, 20, 0], [20, 0, 0]] });
     * ```
     */
    closestPointsOnShapesFromPoints(inputs: Inputs.OCCT.ClosestPointsOnShapesFromPointsDto<TopoDS_Shape>): Inputs.Base.Point3[] {
        return this.och.operationsService.closestPointsOnShapesFromPoints(inputs);
    }

    /**
     * Measures how far each point in a list is from a shape, as the straight distance to the
     * closest point on it, in model units.
     *
     * The distance is to the shape's surface, so a point inside a solid still reports its distance
     * to the skin.
     * @param inputs - The shape and the points
     * @returns One distance per point, in the same order
     * @group measure
     * @shortname distances points to shape
     * @drawable false
     * @example
     * ```typescript
     * const distances = await bitbybit.occt.operations.distancesToShapeFromPoints({ shape: sphere, points: [[0, 20, 0], [20, 0, 0]] });
     * ```
     */
    distancesToShapeFromPoints(inputs: Inputs.OCCT.ClosestPointsOnShapeFromPointsDto<TopoDS_Shape>): number[] {
        return this.och.operationsService.distancesToShapeFromPoints(inputs);
    }

    /**
     * Computes the axis-aligned box that encloses a shape: its minimum and maximum corners, its
     * center and its size along X, Y and Z.
     *
     * On curved shapes the box can be a little larger than the shape itself, because the kernel
     * bounds the control geometry rather than the exact surface.
     * @param inputs - The shape
     * @returns The box as `min`, `max`, `center` and `size`
     * @group measure
     * @shortname bbox of shape
     * @drawable false
     * @example
     * ```typescript
     * const box = await bitbybit.occt.operations.boundingBoxOfShape({ shape });
     * console.log(box.size, box.center);
     * ```
     */
    boundingBoxOfShape(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Inputs.OCCT.BoundingBoxPropsDto {
        return this.och.operationsService.boundingBoxOfShape(inputs);
    }

    /**
     * Reads the minimum corner of a shape's axis-aligned bounding box, the point with the smallest
     * X, Y and Z.
     * @param inputs - The shape
     * @returns The minimum corner
     * @group measure
     * @shortname bbox min of shape
     * @drawable true
     * @example
     * ```typescript
     * const min = await bitbybit.occt.operations.boundingBoxMinOfShape({ shape });
     * ```
     */
    boundingBoxMinOfShape(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Inputs.Base.Point3 {
        const bbox = this.och.operationsService.boundingBoxOfShape(inputs);
        return bbox.min;
    }

    /**
     * Reads the maximum corner of a shape's axis-aligned bounding box, the point with the largest
     * X, Y and Z.
     * @param inputs - The shape
     * @returns The maximum corner
     * @group measure
     * @shortname bbox max of shape
     * @drawable true
     * @example
     * ```typescript
     * const max = await bitbybit.occt.operations.boundingBoxMaxOfShape({ shape });
     * ```
     */
    boundingBoxMaxOfShape(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Inputs.Base.Point3 {
        const bbox = this.och.operationsService.boundingBoxOfShape(inputs);
        return bbox.max;
    }

    /**
     * Reads the center of a shape's axis-aligned bounding box, halfway between its two corners.
     *
     * This is not the center of mass; `shapes.solid.getSolidCenterOfMass` and its siblings give
     * that.
     * @param inputs - The shape
     * @returns The center of the box
     * @group measure
     * @shortname bbox center of shape
     * @drawable true
     * @example
     * ```typescript
     * const center = await bitbybit.occt.operations.boundingBoxCenterOfShape({ shape });
     * ```
     */
    boundingBoxCenterOfShape(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Inputs.Base.Point3 {
        const bbox = this.och.operationsService.boundingBoxOfShape(inputs);
        return bbox.center;
    }

    /**
     * Reads the size of a shape's axis-aligned bounding box along X, Y and Z, in model units.
     * @param inputs - The shape
     * @returns The width, height and length of the box
     * @group measure
     * @shortname bbox size of shape
     * @drawable false
     * @example
     * ```typescript
     * const size = await bitbybit.occt.operations.boundingBoxSizeOfShape({ shape });
     * ```
     */
    boundingBoxSizeOfShape(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Inputs.Base.Vector3 {
        const bbox = this.och.operationsService.boundingBoxOfShape(inputs);
        return bbox.size;
    }

    /**
     * Builds the axis-aligned bounding box of a shape as a box solid, handy for drawing it or using
     * it in a boolean.
     * @param inputs - The shape
     * @returns The box solid
     * @group measure
     * @shortname bbox shape of shape
     * @drawable true
     * @example
     * ```typescript
     * const boxSolid = await bitbybit.occt.operations.boundingBoxShapeOfShape({ shape });
     * ```
     */
    boundingBoxShapeOfShape(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): TopoDS_Shape {
        return this.och.operationsService.boundingBoxShapeOfShape(inputs);
    }

    /**
     * Computes a sphere that encloses a shape: it is centered on the bounding box and reaches its
     * corners, so it always contains the shape but is not the smallest possible sphere.
     * @param inputs - The shape
     * @returns The sphere as `center` and `radius`
     * @group measure
     * @shortname bsphere of shape
     * @drawable false
     * @example
     * ```typescript
     * const sphere = await bitbybit.occt.operations.boundingSphereOfShape({ shape });
     * console.log(sphere.radius);
     * ```
     */
    boundingSphereOfShape(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Inputs.OCCT.BoundingSpherePropsDto {
        return this.och.operationsService.boundingSphereOfShape(inputs);
    }

    /**
     * Reads the center of a shape's bounding sphere, which is the center of its bounding box.
     * @param inputs - The shape
     * @returns The center of the sphere
     * @group measure
     * @shortname bsphere center of shape
     * @drawable false
     * @example
     * ```typescript
     * const center = await bitbybit.occt.operations.boundingSphereCenterOfShape({ shape });
     * ```
     */
    boundingSphereCenterOfShape(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Inputs.Base.Point3 {
        const sphere = this.och.operationsService.boundingSphereOfShape(inputs);
        return sphere.center;
    }

    /**
     * Reads the radius of a shape's bounding sphere, the distance from the bounding box center to
     * its corner, in model units.
     * @param inputs - The shape
     * @returns The radius
     * @group measure
     * @shortname bsphere radius of shape
     * @drawable false
     * @example
     * ```typescript
     * const radius = await bitbybit.occt.operations.boundingSphereRadiusOfShape({ shape });
     * ```
     */
    boundingSphereRadiusOfShape(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): number {
        const sphere = this.och.operationsService.boundingSphereOfShape(inputs);
        return sphere.radius;
    }

    /**
     * Builds the bounding sphere of a shape as a sphere solid.
     * @param inputs - The shape
     * @returns The sphere solid
     * @group measure
     * @shortname bsphere shape of shape
     * @drawable true
     * @example
     * ```typescript
     * const sphereSolid = await bitbybit.occt.operations.boundingSphereShapeOfShape({ shape });
     * ```
     */
    boundingSphereShapeOfShape(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): TopoDS_Shape {
        return this.och.operationsService.boundingSphereShapeOfShape(inputs);
    }

    /**
     * Sweeps a shape in a straight line along a vector, whose length is the distance: a face
     * becomes a solid, a wire a shell, an edge a face.
     *
     * The shape itself stays at the start of the extrusion; the vector is in model units, so `[0,
     * 10, 0]` extrudes 10 units up.
     * @param inputs - The shape and the direction vector, whose length is the distance
     * @returns The extruded shape
     * @group extrusions
     * @shortname extrude
     * @drawable true
     * @example
     * ```typescript
     * const disc = await bitbybit.occt.shapes.face.createCircleFace({ radius: 5, center: [0, 0, 0], direction: [0, 1, 0] });
     * const cylinder = await bitbybit.occt.operations.extrude({ shape: disc, direction: [0, 10, 0] });
     * ```
     */
    extrude(inputs: Inputs.OCCT.ExtrudeDto<TopoDS_Shape>): TopoDS_Shape {
        return this.och.operationsService.extrude(inputs);
    }

    /**
     * Sweeps several shapes along the same vector, as `extrude` does for one.
     * @param inputs - The shapes and the direction vector, whose length is the distance
     * @returns The extruded shapes, in the same order
     * @group extrusions
     * @shortname extrude shapes
     * @drawable true
     * @example
     * ```typescript
     * const walls = await bitbybit.occt.operations.extrudeShapes({ shapes: [faceA, faceB], direction: [0, 10, 0] });
     * ```
     */
    extrudeShapes(inputs: Inputs.OCCT.ExtrudeShapesDto<TopoDS_Shape>): TopoDS_Shape[] {
        return this.och.operationsService.extrudeShapes(inputs);
    }

    /**
     * Cuts a shape into pieces with other shapes, the way a knife splits a loaf, without removing
     * any material.
     *
     * With `nonDestructive` true, the default, the inputs are left untouched and the result holds
     * the pieces of every shape involved, the cutters included; with false only the pieces of
     * `shape` come back. `localFuzzyTolerance` lets geometry that nearly touches count as touching.
     * @param inputs - The shape to split, the shapes to split it with and the options
     * @returns The pieces
     * @group divisions
     * @shortname split
     * @drawable true
     * @example
     * ```typescript
     * const pieces = await bitbybit.occt.operations.splitShapeWithShapes({ shape: box, shapes: [cuttingPlane], localFuzzyTolerance: 1e-4, nonDestructive: false });
     * ```
     */
    splitShapeWithShapes(inputs: Inputs.OCCT.SplitDto<TopoDS_Shape>): TopoDS_Shape[] {
        return this.och.operationsService.splitShapeWithShapes(inputs);
    }

    /**
     * Spins a shape around an axis through the origin to sweep out a surface or solid: a face gives
     * a solid, a wire a shell.
     *
     * `angle` is in degrees; 360 or more gives a full turn. The axis runs along `direction`: a
     * profile beside the Y axis revolved about it gives a vase. The profile must not cross it.
     * @param inputs - The profile shape, the angle in degrees, the axis direction and whether to copy the geometry
     * @returns The revolved shape
     * @group revolutions
     * @shortname revolve
     * @drawable true
     * @example
     * ```typescript
     * const profile = await bitbybit.occt.shapes.wire.createPolylineWire({ points: [[2, 0, 0], [4, 0, 0], [3, 10, 0], [2, 12, 0]] });
     * const vase = await bitbybit.occt.operations.revolve({ shape: profile, angle: 360, direction: [0, 1, 0], copy: false });
     * ```
     */
    revolve(inputs: Inputs.OCCT.RevolveDto<TopoDS_Shape>): TopoDS_Shape {
        return this.och.operationsService.revolve(inputs);
    }

    /**
     * Extrudes a flat shape up along Y by `height` while twisting it by `angle` degrees about the Y
     * axis, like a twisted column.
     *
     * The shape should lie flat, as the profiles this package creates do. With `makeSolid` true,
     * the default, a face profile gives a closed solid; a wire gives a twisted shell.
     * @param inputs - The profile shape, the height, the twist angle in degrees and whether to make a solid
     * @returns The twisted extrusion
     * @group extrusions
     * @shortname rotated extrude
     * @drawable true
     * @example
     * ```typescript
     * const square = await bitbybit.occt.shapes.face.createSquareFace({ size: 5, center: [0, 0, 0], direction: [0, 1, 0] });
     * const twisted = await bitbybit.occt.operations.rotatedExtrude({ shape: square, height: 20, angle: 90, makeSolid: true });
     * ```
     */
    rotatedExtrude(inputs: Inputs.OCCT.RotationExtrudeDto<TopoDS_Shape>): TopoDS_Shape {
        return this.och.operationsService.rotatedExtrude(inputs);
    }

    /**
     * Sweeps one or more profile shapes along a path wire and closes the result into a solid.
     *
     * The profiles should be placed on the path; with several profiles the sweep blends from one to
     * the next along the way.
     * @param inputs - The path wire and the profile shapes placed on it
     * @returns The swept solid
     * @group pipeing
     * @shortname pipe
     * @drawable true
     * @example
     * ```typescript
     * const tube = await bitbybit.occt.operations.pipe({ shape: pathWire, shapes: [profileAtStart] });
     * ```
     */
    pipe(inputs: Inputs.OCCT.ShapeShapesDto<TopoDS_Wire, TopoDS_Shape>): TopoDS_Shape {
        return this.och.operationsService.pipe(inputs);
    }

    /**
     * Sweeps a regular polygon along a wire, giving a tube with `nrCorners` flat sides, for
     * instance a hexagonal bar along a path.
     *
     * The polygon of `radius` is placed at the start of the wire, perpendicular to it. `makeSolid`
     * gives a solid instead of a shell, `trihedronEnum` chooses how the profile turns along the
     * path, and `forceApproxC1` smooths the result.
     * @param inputs - The path wire, the polygon radius and corner count, and the sweep options
     * @returns The swept solid or shell
     * @group pipeing
     * @shortname pipe polyline ngon
     * @drawable true
     * @example
     * ```typescript
     * const bar = await bitbybit.occt.operations.pipePolylineWireNGon({
     *     shape: pathWire,
     *     radius: 0.5,
     *     nrCorners: 6,
     *     makeSolid: true,
     *     trihedronEnum: Bit.Inputs.OCCT.geomFillTrihedronEnum.isConstantNormal,
     *     forceApproxC1: false,
     * });
     * ```
     */
    pipePolylineWireNGon(inputs: Inputs.OCCT.PipePolygonWireNGonDto<TopoDS_Wire>): TopoDS_Shape {
        return this.och.operationsService.pipePolylineWireNGon(inputs);
    }

    /**
     * Sweeps a circle along each of several wires, as `pipeWireCylindrical` does for one, all with
     * the same radius and options.
     * @param inputs - The path wires, the radius and the sweep options
     * @returns One tube per wire, in the same order
     * @group pipeing
     * @shortname pipe wires cylindrical
     * @drawable true
     * @example
     * ```typescript
     * const tubes = await bitbybit.occt.operations.pipeWiresCylindrical({
     *     shapes: [pathA, pathB],
     *     radius: 0.5,
     *     makeSolid: true,
     *     trihedronEnum: Bit.Inputs.OCCT.geomFillTrihedronEnum.isConstantNormal,
     *     forceApproxC1: false,
     * });
     * ```
     */
    pipeWiresCylindrical(inputs: Inputs.OCCT.PipeWiresCylindricalDto<TopoDS_Wire>): TopoDS_Shape[] {
        return this.och.operationsService.pipeWiresCylindrical(inputs);
    }

    /**
     * Sweeps a circle along a wire, giving a round tube of the given radius that follows the path.
     *
     * The circle is placed at the start of the wire, perpendicular to it. `makeSolid` gives a solid
     * instead of a shell, `trihedronEnum` chooses how the profile turns as it follows the path, and
     * `forceApproxC1` smooths the result.
     * @param inputs - The path wire, the radius and the sweep options
     * @returns The tube as a solid or shell
     * @group pipeing
     * @shortname pipe wire cylindrical
     * @drawable true
     * @example
     * ```typescript
     * const tube = await bitbybit.occt.operations.pipeWireCylindrical({
     *     shape: pathWire,
     *     radius: 0.5,
     *     makeSolid: true,
     *     trihedronEnum: Bit.Inputs.OCCT.geomFillTrihedronEnum.isConstantNormal,
     *     forceApproxC1: false,
     * });
     * ```
     */
    pipeWireCylindrical(inputs: Inputs.OCCT.PipeWireCylindricalDto<TopoDS_Wire>): TopoDS_Shape {
        return this.och.operationsService.pipeWireCylindrical(inputs);
    }

    /**
     * Moves the boundary of a shape outward, or inward for a negative distance, by a fixed
     * distance: a wire grows into a parallel outline, a face or solid into a bigger one.
     *
     * A wire or edge is offset in its own plane, or on `face` when given; corners are rounded. A
     * distance of 0 returns the shape as it is.
     * @param inputs - The shape, an optional face to offset a wire on, the distance and the tolerance
     * @returns The offset shape
     * @group offsets
     * @shortname offset
     * @drawable true
     * @example
     * ```typescript
     * const bigger = await bitbybit.occt.operations.offset({ shape: box, distance: 1, tolerance: 0.1 });
     * ```
     */
    offset(inputs: Inputs.OCCT.OffsetDto<TopoDS_Shape, TopoDS_Face>): TopoDS_Shape {
        return this.och.operationsService.offset(inputs);
    }

    /**
     * Offsets a shape like `offset`, with a choice of how corners are joined: `arc` rounds them,
     * `intersection` extends the sides to a sharp corner, `tangent` keeps them tangent.
     *
     * `removeIntEdges` drops the internal edges the offset can leave behind on a solid.
     * @param inputs - The shape, an optional face to offset a wire on, the distance, the tolerance, the corner join type and whether to remove internal edges
     * @returns The offset shape
     * @group offsets
     * @shortname offset adv.
     * @drawable true
     * @example
     * ```typescript
     * const sharper = await bitbybit.occt.operations.offsetAdv({
     *     shape: rectangleWire,
     *     distance: 1,
     *     tolerance: 0.1,
     *     joinType: Bit.Inputs.OCCT.joinTypeEnum.intersection,
     *     removeIntEdges: false,
     * });
     * ```
     */
    offsetAdv(inputs: Inputs.OCCT.OffsetAdvancedDto<TopoDS_Shape, TopoDS_Face>): TopoDS_Shape {
        return this.och.operationsService.offsetAdv(inputs);
    }

    /**
     * Gives a face or shell a thickness, turning it into a solid slab or wall of the given
     * `offset`.
     *
     * A positive offset thickens toward the surface normal, a negative one the other way. Use it to
     * turn a lofted or swept skin into something printable.
     * @param inputs - The face or shell and the thickness
     * @returns The thick solid
     * @group offsets
     * @shortname thicken
     * @drawable true
     * @example
     * ```typescript
     * const wall = await bitbybit.occt.operations.makeThickSolidSimple({ shape: loftedShell, offset: 0.5 });
     * ```
     */
    makeThickSolidSimple(inputs: Inputs.OCCT.ThisckSolidSimpleDto<TopoDS_Shape>): TopoDS_Shape {
        return this.och.operationsService.makeThickSolidSimple(inputs);
    }

    /**
     * Hollows a solid into a shell of the given wall thickness by removing the listed faces and
     * offsetting the rest.
     *
     * Removing the top face of a box, for instance, gives an open cup. `offset` is the wall
     * thickness, negative to grow inward; `joinType` says how the offset walls meet at corners, the
     * other flags go to the kernel's thick-solid builder.
     * @param inputs - The solid, the faces to remove, the wall thickness, the tolerance and the join options
     * @returns The hollowed solid
     * @group offsets
     * @shortname joined thicken
     * @drawable true
     * @example
     * ```typescript
     * const box = await bitbybit.occt.shapes.solid.createBox({ width: 10, length: 10, height: 10, center: [0, 0, 0] });
     * const faces = await bitbybit.occt.shapes.face.getFaces({ shape: box });
     * const cup = await bitbybit.occt.operations.makeThickSolidByJoin({
     *     shape: box,
     *     shapes: [faces[0]],
     *     offset: -1,
     *     tolerance: 1e-3,
     *     intersection: false,
     *     selfIntersection: false,
     *     joinType: Bit.Inputs.OCCT.joinTypeEnum.arc,
     *     removeIntEdges: false,
     * });
     * ```
     */
    makeThickSolidByJoin(inputs: Inputs.OCCT.ThickSolidByJoinDto<TopoDS_Shape>): TopoDS_Shape {
        return this.och.operationsService.makeThickSolidByJoin(inputs);
    }

    /**
     * Cuts a solid into parallel slices along a direction, like a loaf of bread, every `step` model
     * units from the bottom of the shape up.
     *
     * Each slice is the flat section where a cutting plane meets the solid; they come back together
     * in one compound. The shape must be or contain solids, or an error is thrown.
     * @param inputs - The shape, the distance between slices and the slicing direction
     * @returns A compound of the section faces
     * @group divisions
     * @shortname slice
     * @drawable true
     * @example
     * ```typescript
     * const layers = await bitbybit.occt.operations.slice({ shape: sphere, step: 0.5, direction: [0, 1, 0] });
     * ```
     */
    slice(inputs: Inputs.OCCT.SliceDto<TopoDS_Shape>): TopoDS_Compound {
        return this.och.operationsService.slice(inputs);
    }

    /**
     * Cuts a solid into parallel slices like `slice`, but with a repeating pattern of gaps between
     * them, such as 0.1, 0.5, 0.1, 0.5.
     *
     * The pattern is applied from the bottom of the shape up and repeats until the top is reached.
     * @param inputs - The shape, the pattern of gaps and the slicing direction
     * @returns A compound of the section faces
     * @group divisions
     * @shortname slice in step pattern
     * @drawable true
     * @example
     * ```typescript
     * const layers = await bitbybit.occt.operations.sliceInStepPattern({ shape: sphere, steps: [0.1, 0.5], direction: [0, 1, 0] });
     * ```
     */
    sliceInStepPattern(inputs: Inputs.OCCT.SliceInStepPatternDto<TopoDS_Shape>): TopoDS_Compound {
        return this.och.operationsService.sliceInStepPattern(inputs);
    }

    /**
     * Offsets a wire that does not lie in one plane, by extruding it along `direction`, thickening
     * the result and reading the offset edge back off it.
     *
     * It works best on smooth wires; fillet sharp corners first with `fillets.fillet3DWire`. When
     * the offset edges cannot be joined into one wire they come back as a list of edges.
     * @param inputs - The wire, the offset distance and the direction to extrude along
     * @returns The offset wire, or the loose edges when they could not be joined
     * @group offsets
     * @shortname offset 3d wire
     * @drawable true
     * @example
     * ```typescript
     * const outer = await bitbybit.occt.operations.offset3DWire({ shape: smoothWire, offset: 1, direction: [0, 1, 0] });
     * ```
     */
    offset3DWire(inputs: Inputs.OCCT.Offset3DWireDto<TopoDS_Wire>): TopoDS_Wire | TopoDS_Edge[] {
        return this.och.operationsService.offset3DWire(inputs);
    }
}
