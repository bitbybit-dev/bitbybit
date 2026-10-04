import {
    BitbybitOcctModule, TopoDS_Compound, TopoDS_Edge, TopoDS_Shape, TopoDS_Wire, TopoDS_Face
} from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../occ-helper";
import * as Inputs from "../api/inputs";
import { InputError, resolveDto } from "@bitbybit-dev/base";
import * as Resolved from "../api/resolved-inputs";
import * as Models from "../api/models";
import { numbersOfFrames } from "./base/frames";
import { historiesFromKernel, historyFromKernel } from "./base/history";
import { checkedFrame, checkedFrames, checkedNumber, checkedNumberList, checkedShape, checkedShapes, checkedWithin } from "./base/input-checks";

/**
 * The modeling operations that turn OpenCascade wires and faces into surfaces and solids and
 * measure shapes: lofting through sections, extruding and revolving, sweeping profiles along paths,
 * offsetting, thickening shells into solids, slicing, sectioning and splitting, and hidden-line
 * drawings, plus bounding boxes, bounding spheres and closest-point queries, which move to
 * `analysis.measure` in the next major version. Distances are in model units and angles in degrees;
 * every operation returns a new shape. Booleans live in `booleans`, rounding in `fillets` and local
 * features such as holes in `features`.
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
        const resolved = resolveDto(Inputs.OCCT.LoftDto, inputs) as Resolved.OCCT.LoftDto<TopoDS_Wire | TopoDS_Edge>;
        return this.och.operationsService.loft(resolved);
    }

    /**
     * Lofts as `loft` does, and reports one history per section: `facesFromEdges` holds the skin
     * along each section edge, the first section's `firstFaces` and the last's `lastFaces` the caps
     * of a solid.
     * @param inputs - The section wires or edges and whether to make a solid
     * @returns The lofted shell or solid and one history per section
     * @group lofts
     * @shortname loft with history
     * @drawable false
     * @example
     * ```typescript
     * const { shape, histories } = await bitbybit.occt.operations.loftWithHistory({ shapes: [bottom, upper], makeSolid: true });
     * const bottomCap = histories[0].firstFaces;
     * ```
     */
    loftWithHistory(inputs: Inputs.OCCT.LoftDto<TopoDS_Wire | TopoDS_Edge>): Models.OCCT.ShapeWithHistories<TopoDS_Shape> {
        const resolved = resolveDto(Inputs.OCCT.LoftDto, inputs) as Resolved.OCCT.LoftDto<TopoDS_Wire | TopoDS_Edge>;
        checkedShapes(resolved.shapes);
        let histories: Models.OCCT.ShapeHistory[] = [];
        const shape = this.och.operationsService.loft(resolved, (maker, result) => {
            histories = historiesFromKernel(this.och.occ.HistoryOfLoft(maker, resolved.shapes, result));
        });
        return { shape, histories };
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
        const resolved = resolveDto(Inputs.OCCT.LoftAdvancedDto, inputs) as Resolved.OCCT.LoftAdvancedDto<TopoDS_Wire | TopoDS_Edge>;
        return this.och.operationsService.loftAdvanced(resolved);
    }

    /**
     * Lofts as `loftAdvanced` does, and reports what each section in `shapes` became, as
     * `loftWithHistory` does: the sides along each section edge, and the caps at the start and end
     * of a solid.
     *
     * A `periodic` loft runs through curves resampled from the sections rather than the sections
     * themselves, so it has no history to report and is refused.
     * @param inputs - The section wires or edges, whether to make a solid, the closing and smoothing options and optional end points
     * @returns The lofted shell or solid and one history per section in `shapes`
     * @group lofts
     * @shortname loft adv. with history
     * @drawable false
     * @example
     * ```typescript
     * const { shape, histories } = await bitbybit.occt.operations.loftAdvancedWithHistory({
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
     * });
     * const side = histories[0].facesFromEdges[0];
     * ```
     */
    loftAdvancedWithHistory(inputs: Inputs.OCCT.LoftAdvancedDto<TopoDS_Wire | TopoDS_Edge>): Models.OCCT.ShapeWithHistories<TopoDS_Shape> {
        const resolved = resolveDto(Inputs.OCCT.LoftAdvancedDto, inputs) as Resolved.OCCT.LoftAdvancedDto<TopoDS_Wire | TopoDS_Edge>;
        if (resolved.periodic) {
            throw new InputError("A `periodic` loft runs through curves resampled from its sections, not through the sections, so it has no history; use `loftAdvanced`.", "periodic");
        }
        checkedShapes(resolved.shapes);
        let histories: Models.OCCT.ShapeHistory[] = [];
        const shape = this.och.operationsService.loftAdvanced(resolved, (maker, result) => {
            histories = historiesFromKernel(this.och.occ.HistoryOfLoft(maker, resolved.shapes, result));
        });
        return { shape, histories };
    }

    /**
     * Finds the pair of points, one on each shape, that are closest to each other.
     *
     * The distance between them is the gap between the shapes; it is 0 when they touch or overlap.
     * Throws an error when no pair can be found. `analysis.measure.extrema` gives every closest pair,
     * with the sub-shapes the points lie on.
     *
     * It moves to `analysis.measure` in the next major version, with the same inputs and result.
     * @param inputs - The two shapes
     * @returns The point on the first shape and the point on the second
     * @deprecated Moves to `analysis.measure.closestPointsBetweenTwoShapes` in the next major version; it works here until then.
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
     *
     * It moves to `analysis.measure` in the next major version, with the same inputs and result.
     * @param inputs - The shape and the points
     * @returns One point on the shape per input point, in the same order
     * @deprecated Moves to `analysis.measure.closestPointsOnShapeFromPoints` in the next major version; it works here until then.
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
     *
     * It moves to `analysis.measure` in the next major version, with the same inputs and result.
     * @param inputs - The shapes and the points
     * @returns The closest points, grouped shape by shape
     * @deprecated Moves to `analysis.measure.closestPointsOnShapesFromPoints` in the next major version; it works here until then.
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
     *
     * It moves to `analysis.measure` in the next major version, with the same inputs and result.
     * @param inputs - The shape and the points
     * @returns One distance per point, in the same order
     * @deprecated Moves to `analysis.measure.distancesToShapeFromPoints` in the next major version; it works here until then.
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
     * bounds the control geometry rather than the exact surface. `analysis.measure.tightBoundingBox`
     * follows the exact geometry.
     *
     * It moves to `analysis.measure` in the next major version, with the same inputs and result.
     * @param inputs - The shape
     * @returns The box as `min`, `max`, `center` and `size`
     * @deprecated Moves to `analysis.measure.boundingBoxOfShape` in the next major version; it works here until then.
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
     *
     * It moves to `analysis.measure` in the next major version, with the same inputs and result.
     * @param inputs - The shape
     * @returns The minimum corner
     * @deprecated Moves to `analysis.measure.boundingBoxMinOfShape` in the next major version; it works here until then.
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
     *
     * It moves to `analysis.measure` in the next major version, with the same inputs and result.
     * @param inputs - The shape
     * @returns The maximum corner
     * @deprecated Moves to `analysis.measure.boundingBoxMaxOfShape` in the next major version; it works here until then.
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
     *
     * It moves to `analysis.measure` in the next major version, with the same inputs and result.
     * @param inputs - The shape
     * @returns The center of the box
     * @deprecated Moves to `analysis.measure.boundingBoxCenterOfShape` in the next major version; it works here until then.
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
     *
     * It moves to `analysis.measure` in the next major version, with the same inputs and result.
     * @param inputs - The shape
     * @returns The width, height and length of the box
     * @deprecated Moves to `analysis.measure.boundingBoxSizeOfShape` in the next major version; it works here until then.
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
     *
     * It moves to `analysis.measure` in the next major version, with the same inputs and result.
     * @param inputs - The shape
     * @returns The box solid
     * @deprecated Moves to `analysis.measure.boundingBoxShapeOfShape` in the next major version; it works here until then.
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
     *
     * It moves to `analysis.measure` in the next major version, with the same inputs and result.
     * @param inputs - The shape
     * @returns The sphere as `center` and `radius`
     * @deprecated Moves to `analysis.measure.boundingSphereOfShape` in the next major version; it works here until then.
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
     *
     * It moves to `analysis.measure` in the next major version, with the same inputs and result.
     * @param inputs - The shape
     * @returns The center of the sphere
     * @deprecated Moves to `analysis.measure.boundingSphereCenterOfShape` in the next major version; it works here until then.
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
     *
     * It moves to `analysis.measure` in the next major version, with the same inputs and result.
     * @param inputs - The shape
     * @returns The radius
     * @deprecated Moves to `analysis.measure.boundingSphereRadiusOfShape` in the next major version; it works here until then.
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
     *
     * It moves to `analysis.measure` in the next major version, with the same inputs and result.
     * @param inputs - The shape
     * @returns The sphere solid
     * @deprecated Moves to `analysis.measure.boundingSphereShapeOfShape` in the next major version; it works here until then.
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
     * 10, 0]` extrudes 10 units up. A solid, or a vector of length 0, is refused.
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
        const resolved = resolveDto(Inputs.OCCT.ExtrudeDto, inputs) as Resolved.OCCT.ExtrudeDto<TopoDS_Shape>;
        return this.och.operationsService.extrude(resolved);
    }

    /**
     * Extrudes a shape as `extrude` does, and reports what each part of the profile became:
     * `history.firstFaces` and `lastFaces` are the caps of a face profile (a wire has none),
     * `history.facesFromEdges` the side swept from each profile edge and
     * `history.edgesFromVertices` the edge swept from each vertex.
     * @param inputs - The profile and the direction and length of the extrusion
     * @returns The extruded shape and its history
     * @group extrusions
     * @shortname extrude with history
     * @drawable false
     * @example
     * ```typescript
     * const { shape, history } = await bitbybit.occt.operations.extrudeWithHistory({ shape: squareFace, direction: [0, 0, 5] });
     * const top = history.lastFaces;
     * ```
     */
    extrudeWithHistory(inputs: Inputs.OCCT.ExtrudeDto<TopoDS_Shape>): Models.OCCT.ShapeWithHistory<TopoDS_Shape> {
        const resolved = resolveDto(Inputs.OCCT.ExtrudeDto, inputs) as Resolved.OCCT.ExtrudeDto<TopoDS_Shape>;
        checkedShape(resolved.shape);
        let history: Models.OCCT.ShapeHistory | undefined;
        const shape = this.och.operationsService.extrude(resolved, (maker, result) => {
            history = historyFromKernel(this.och.occ.HistoryOfPrism(maker, resolved.shape, result));
        });
        return { shape, history: history! };
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
        const resolved = resolveDto(Inputs.OCCT.ExtrudeShapesDto, inputs) as Resolved.OCCT.ExtrudeShapesDto<TopoDS_Shape>;
        return this.och.operationsService.extrudeShapes(resolved);
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
        const resolved = resolveDto(Inputs.OCCT.SplitDto, inputs) as Resolved.OCCT.SplitDto<TopoDS_Shape>;
        return this.och.operationsService.splitShapeWithShapes(resolved);
    }

    /**
     * Spins a shape around an axis through the origin to sweep out a surface or solid: a face gives
     * a solid, a wire a shell.
     *
     * `angle` is in degrees and may be negative to spin the other way; 360 or more either way makes
     * a full turn, and 0 throws. The profile must not cross the axis along `direction`.
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
        const resolved = resolveDto(Inputs.OCCT.RevolveDto, inputs) as Resolved.OCCT.RevolveDto<TopoDS_Shape>;
        return this.och.operationsService.revolve(resolved);
    }

    /**
     * Revolves a shape as `revolve` does, and reports what each part of the profile became:
     * `history.firstFaces` and `lastFaces` are the ends of a partial turn, `history.facesFromEdges`
     * the surface swept from each profile edge, a whole turn included.
     * @param inputs - The profile, the angle in degrees, the axis direction and the copy flag
     * @returns The revolved shape and its history
     * @group revolutions
     * @shortname revolve with history
     * @drawable false
     * @example
     * ```typescript
     * const { shape, history } = await bitbybit.occt.operations.revolveWithHistory({ shape: profile, angle: 90, direction: [0, 0, 1], copy: false });
     * ```
     */
    revolveWithHistory(inputs: Inputs.OCCT.RevolveDto<TopoDS_Shape>): Models.OCCT.ShapeWithHistory<TopoDS_Shape> {
        const resolved = resolveDto(Inputs.OCCT.RevolveDto, inputs) as Resolved.OCCT.RevolveDto<TopoDS_Shape>;
        checkedShape(resolved.shape);
        let history: Models.OCCT.ShapeHistory | undefined;
        const shape = this.och.operationsService.revolve(resolved, (maker, result) => {
            history = historyFromKernel(this.och.occ.HistoryOfRevol(maker, resolved.shape, result));
        });
        return { shape, history: history! };
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
        const resolved = resolveDto(Inputs.OCCT.RotationExtrudeDto, inputs) as Resolved.OCCT.RotationExtrudeDto<TopoDS_Shape>;
        return this.och.operationsService.rotatedExtrude(resolved);
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
     * Sweeps profiles along a path as `pipe` does, and reports what each profile became, one
     * history per profile in the order given: `facesFromEdges` holds the side each profile edge
     * swept, `firstFaces` and `lastFaces` the caps at the two ends of the path.
     * @param inputs - The path wire and the profiles to sweep along it
     * @returns The swept solid and one history per profile
     * @group pipeing
     * @shortname pipe with history
     * @drawable false
     * @example
     * ```typescript
     * const { shape, histories } = await bitbybit.occt.operations.pipeWithHistory({ shape: pathWire, shapes: [profileAtStart] });
     * const endCap = histories[0].lastFaces;
     * ```
     */
    pipeWithHistory(inputs: Inputs.OCCT.ShapeShapesDto<TopoDS_Wire, TopoDS_Shape>): Models.OCCT.ShapeWithHistories<TopoDS_Shape> {
        checkedShapes(inputs.shapes);
        let histories: Models.OCCT.ShapeHistory[] = [];
        const shape = this.och.operationsService.pipe(inputs, (maker, result) => {
            histories = inputs.shapes.map(profile => historyFromKernel(this.och.occ.HistoryOfPipeShell(maker, profile, result)));
        });
        return { shape, histories };
    }

    /**
     * Sweeps a regular polygon along a wire, giving a bar with `nrCorners` flat sides.
     *
     * The polygon of `radius` starts perpendicular to the wire. `makeSolid` gives a solid instead of
     * a shell, `trihedronEnum` sets how the profile turns, and `forceApproxC1` smooths the result.
     * An invalid bar is refused; on a nearly straight path, use the discrete trihedron.
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
        const resolved = resolveDto(Inputs.OCCT.PipePolygonWireNGonDto, inputs) as Resolved.OCCT.PipePolygonWireNGonDto<TopoDS_Wire>;
        return this.och.operationsService.pipePolylineWireNGon(resolved);
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
        const resolved = resolveDto(Inputs.OCCT.PipeWiresCylindricalDto, inputs) as Resolved.OCCT.PipeWiresCylindricalDto<TopoDS_Wire>;
        return this.och.operationsService.pipeWiresCylindrical(resolved);
    }

    /**
     * Sweeps a circle along a wire, giving a round tube of the given radius that follows the path.
     *
     * The circle starts perpendicular to the wire. `makeSolid` gives a solid instead of a shell,
     * `trihedronEnum` sets how the profile turns, and `forceApproxC1` smooths the result. An invalid
     * tube is refused; on a nearly straight path, use the discrete trihedron.
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
        const resolved = resolveDto(Inputs.OCCT.PipeWireCylindricalDto, inputs) as Resolved.OCCT.PipeWireCylindricalDto<TopoDS_Wire>;
        return this.och.operationsService.pipeWireCylindrical(resolved);
    }

    /**
     * Sweeps a profile along a flat spine, keeping its place beside it, as a moulding follows a wall.
     *
     * Draw the profile about the origin: x along the spine, y to the left of travel, inside a
     * counter-clockwise loop, and z up from the spine's plane. A spine out of plane is refused.
     * @param inputs - The flat spine, the profile and whether to make a solid
     * @returns The swept shell or solid
     * @group pipeing
     * @shortname sweep evolved
     * @drawable true
     * @example
     * ```typescript
     * const spine = await bitbybit.occt.shapes.wire.createSquareWire({ size: 10, center: [0, 0, 0], direction: [0, 1, 0] });
     * const profile = await bitbybit.occt.shapes.wire.createPolygonWire({ points: [[0, 0, 0], [0, 1, 0], [0, 1, 3], [0, 0, 3]] });
     * const wall = await bitbybit.occt.operations.sweepEvolved({ spine, profile, makeSolid: true });
     * ```
     */
    sweepEvolved(inputs: Inputs.OCCT.SweepEvolvedDto<TopoDS_Wire | TopoDS_Face, TopoDS_Wire | TopoDS_Edge>): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.SweepEvolvedDto, inputs) as Resolved.OCCT.SweepEvolvedDto<TopoDS_Wire | TopoDS_Face, TopoDS_Wire | TopoDS_Edge>;
        const spine = checkedShape(resolved.spine, "spine");
        const profile = checkedShape(resolved.profile, "profile");
        return this.actual(this.och.occ.SweepEvolved(spine, profile, resolved.makeSolid));
    }

    /**
     * Sweeps a profile along a spine while scaling it, such as a tube that widens toward one end.
     *
     * `params` are places along the spine from 0 to 1, each scaled by the entry of `scales` at the
     * same position; between them the scale changes smoothly. Place the profile across the start of
     * the spine; `makeSolid` needs it closed.
     * @param inputs - The spine, the profile, the places and their scales, and whether to make a solid
     * @returns The swept solid or shell
     * @group pipeing
     * @shortname pipe with scaling
     * @drawable true
     * @example
     * ```typescript
     * const spine = await bitbybit.occt.shapes.edge.line({ start: [0, 0, 0], end: [0, 10, 0] });
     * const profile = await bitbybit.occt.shapes.wire.createCircleWire({ radius: 1, center: [0, 0, 0], direction: [0, 1, 0] });
     * const horn = await bitbybit.occt.operations.pipeWithScaling({ spine, profile, params: [0, 1], scales: [1, 2], makeSolid: true });
     * ```
     */
    pipeWithScaling(inputs: Inputs.OCCT.PipeWithScalingDto<TopoDS_Wire | TopoDS_Edge, TopoDS_Wire | TopoDS_Edge>): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.PipeWithScalingDto, inputs) as Resolved.OCCT.PipeWithScalingDto<TopoDS_Wire | TopoDS_Edge, TopoDS_Wire | TopoDS_Edge>;
        const spine = checkedShape(resolved.spine, "spine");
        const profile = checkedShape(resolved.profile, "profile");
        const params = checkedNumberList(resolved.params, "params", { atLeast: 0, atMost: 1 });
        const scales = checkedNumberList(resolved.scales, "scales", { above: 0 });
        return this.actual(this.och.occ.PipeWithScaling(spine, profile, params, scales, resolved.makeSolid));
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
        const resolved = resolveDto(Inputs.OCCT.OffsetDto, inputs) as Resolved.OCCT.OffsetDto<TopoDS_Shape, TopoDS_Face>;
        return this.och.operationsService.offset(resolved);
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
        const resolved = resolveDto(Inputs.OCCT.OffsetAdvancedDto, inputs) as Resolved.OCCT.OffsetAdvancedDto<TopoDS_Shape, TopoDS_Face>;
        return this.och.operationsService.offsetAdv(resolved);
    }

    /**
     * Gives a face or shell a thickness, turning it into a solid slab or wall of the given
     * `offset`.
     *
     * A positive offset thickens along the surface normal, a negative one against it. Faces are
     * offset one by one, so walls meeting at a sharp edge leave a gap of up to 1.4 times `offset`,
     * bridged by tolerance.
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
        const resolved = resolveDto(Inputs.OCCT.ThisckSolidSimpleDto, inputs) as Resolved.OCCT.ThisckSolidSimpleDto<TopoDS_Shape>;
        return this.och.operationsService.makeThickSolidSimple(resolved);
    }

    /**
     * Thickens a shape as `makeThickSolidSimple` does, and reports what became of its faces and
     * edges: each face stays where it was (`faces`) and gains its offset copy (`facesFromFaces`),
     * and each free edge raises the wall between the two (`facesFromEdges`).
     * @param inputs - The shape to thicken and the thickness
     * @returns The thickened solid and its history
     * @group offsets
     * @shortname thicken with history
     * @drawable false
     * @example
     * ```typescript
     * const { shape, history } = await bitbybit.occt.operations.makeThickSolidSimpleWithHistory({ shape: plateFace, offset: 2 });
     * const top = history.facesFromFaces[0];
     * ```
     */
    makeThickSolidSimpleWithHistory(inputs: Inputs.OCCT.ThisckSolidSimpleDto<TopoDS_Shape>): Models.OCCT.ShapeWithHistory<TopoDS_Shape> {
        const resolved = resolveDto(Inputs.OCCT.ThisckSolidSimpleDto, inputs) as Resolved.OCCT.ThisckSolidSimpleDto<TopoDS_Shape>;
        checkedShape(resolved.shape);
        let history: Models.OCCT.ShapeHistory | undefined;
        const shape = this.och.operationsService.makeThickSolidSimple(resolved, (maker, result) => {
            history = historyFromKernel(this.och.occ.HistoryOfThickSolid(maker, resolved.shape, result));
        });
        return { shape, history: history! };
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
        const resolved = resolveDto(Inputs.OCCT.ThickSolidByJoinDto, inputs) as Resolved.OCCT.ThickSolidByJoinDto<TopoDS_Shape>;
        return this.och.operationsService.makeThickSolidByJoin(resolved);
    }

    /**
     * Hollows a solid as `makeThickSolidByJoin` does, and reports what became of its faces: each
     * kept face stays (`faces`) and gains the inner wall offset from it (`facesFromFaces`), and each
     * removed face becomes the rim left where it was.
     * @param inputs - The solid, the faces to remove, the wall thickness, the tolerance and the join options
     * @returns The hollowed solid and its history
     * @group offsets
     * @shortname joined thicken with history
     * @drawable false
     * @example
     * ```typescript
     * const { shape, history } = await bitbybit.occt.operations.makeThickSolidByJoinWithHistory({
     *     shape: box,
     *     shapes: [top],
     *     offset: -1,
     *     tolerance: 1e-3,
     *     intersection: false,
     *     selfIntersection: false,
     *     joinType: Bit.Inputs.OCCT.joinTypeEnum.arc,
     *     removeIntEdges: false,
     * });
     * const innerWalls = history.facesFromFaces.flat();
     * ```
     */
    makeThickSolidByJoinWithHistory(inputs: Inputs.OCCT.ThickSolidByJoinDto<TopoDS_Shape>): Models.OCCT.ShapeWithHistory<TopoDS_Shape> {
        const resolved = resolveDto(Inputs.OCCT.ThickSolidByJoinDto, inputs) as Resolved.OCCT.ThickSolidByJoinDto<TopoDS_Shape>;
        checkedShape(resolved.shape);
        let history: Models.OCCT.ShapeHistory | undefined;
        const shape = this.och.operationsService.makeThickSolidByJoin(resolved, (maker, result) => {
            history = historyFromKernel(this.och.occ.HistoryOfThickSolid(maker, resolved.shape, result));
        });
        return { shape, history: history! };
    }

    /**
     * Cuts a solid into parallel slices along a direction, like a loaf of bread, every `step` model
     * units from the bottom of the shape up.
     *
     * Each slice is the flat section where a cutting plane meets the solid, all in one compound. The
     * shape must contain solids, and a step giving more than 100000 slices is refused.
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
        const resolved = resolveDto(Inputs.OCCT.SliceDto, inputs) as Resolved.OCCT.SliceDto<TopoDS_Shape>;
        return this.och.operationsService.slice(resolved);
    }

    /**
     * Cuts a solid into parallel slices like `slice`, but with a repeating pattern of gaps between
     * them, such as 0.1, 0.5, 0.1, 0.5.
     *
     * The pattern repeats from the bottom of the shape up to its top. Steps must add up to more than
     * 0 and give at most 100000 slices.
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
        const resolved = resolveDto(Inputs.OCCT.SliceInStepPatternDto, inputs) as Resolved.OCCT.SliceInStepPatternDto<TopoDS_Shape>;
        return this.och.operationsService.sliceInStepPattern(resolved);
    }

    /**
     * Finds the curves where two shapes meet and joins them end to end into wires, such as the
     * outline a plane cuts from a solid.
     *
     * A loop comes back as a closed wire, branches or loose ends as open wires, and shapes that do
     * not meet give an empty list.
     * @param inputs - The two shapes and the joining tolerance
     * @returns The wires where the shapes meet
     * @group divisions
     * @shortname section wires
     * @drawable true
     * @example
     * ```typescript
     * const box = await bitbybit.occt.shapes.solid.createBox({ width: 10, length: 10, height: 10, center: [0, 5, 0] });
     * const plane = await bitbybit.occt.shapes.face.createSquareFace({ size: 20, center: [0, 3, 0], direction: [0, 1, 0] });
     * const outline = await bitbybit.occt.operations.sectionWires({ shapeA: box, shapeB: plane, tolerance: 1e-7 });
     * ```
     */
    sectionWires(inputs: Inputs.OCCT.SectionWiresDto<TopoDS_Shape>): TopoDS_Wire[] {
        const resolved = resolveDto(Inputs.OCCT.SectionWiresDto, inputs) as Resolved.OCCT.SectionWiresDto<TopoDS_Shape>;
        const shapeA = checkedShape(resolved.shapeA, "shapeA");
        const shapeB = checkedShape(resolved.shapeB, "shapeB");
        const tolerance = checkedNumber(resolved.tolerance, "tolerance", 0);
        return this.och.occ.SectionWires(shapeA, shapeB, tolerance);
    }

    /**
     * Slices a shape with the plane of each frame, which passes through the frame's origin square to
     * its normal.
     *
     * With `makeFaces` true a slice holds the faces where the plane passes through the solids, holes
     * included; with false, the section wires. A plane that misses the shape gives an empty compound.
     * @param inputs - The shape, the frames, whether to make faces and the joining tolerance
     * @returns One compound per frame, in the order of the frames
     * @group divisions
     * @shortname slice by frames
     * @drawable true
     * @example
     * ```typescript
     * const slices = await bitbybit.occt.operations.sliceByFrames({
     *     shape: vase,
     *     frames: [
     *         { origin: [0, 2, 0], normal: [0, 1, 0], direction: [1, 0, 0] },
     *         { origin: [0, 4, 0], normal: [0, 1, 0], direction: [1, 0, 0] },
     *     ],
     *     makeFaces: true,
     *     tolerance: 1e-7,
     * });
     * ```
     */
    sliceByFrames(inputs: Inputs.OCCT.SliceByFramesDto<TopoDS_Shape>): TopoDS_Compound[] {
        const resolved = resolveDto(Inputs.OCCT.SliceByFramesDto, inputs) as Resolved.OCCT.SliceByFramesDto<TopoDS_Shape>;
        const shape = checkedShape(resolved.shape);
        const frames = checkedFrames(resolved.frames, "frames");
        const tolerance = checkedNumber(resolved.tolerance, "tolerance", 0);
        return this.och.occ.SliceByFrames(shape, numbersOfFrames(frames), resolved.makeFaces, tolerance);
    }

    /**
     * Splits a shape in two with the plane of a frame: what lies on the side the frame's normal
     * points to comes back as `front`, the rest as `back`.
     *
     * The pieces are solids when the shape has any, else faces, else edges. A shape the plane misses
     * comes back whole on its side.
     * @param inputs - The shape and the frame whose plane splits it
     * @returns The pieces in front of the plane and behind it, each in a compound
     * @group divisions
     * @shortname split by frame
     * @drawable false
     * @example
     * ```typescript
     * const { front, back } = await bitbybit.occt.operations.splitByFrame({
     *     shape: box,
     *     frame: { origin: [2, 0, 0], normal: [1, 0, 0], direction: [0, 1, 0] },
     * });
     * ```
     */
    splitByFrame(inputs: Inputs.OCCT.SplitByFrameDto<TopoDS_Shape>): Models.OCCT.SplitByFrameResult<TopoDS_Compound> {
        const resolved = resolveDto(Inputs.OCCT.SplitByFrameDto, inputs) as Resolved.OCCT.SplitByFrameDto<TopoDS_Shape>;
        const shape = checkedShape(resolved.shape);
        const frame = checkedFrame(resolved.frame, "frame");
        const [front, back] = this.och.occ.SplitByFrame(shape, numbersOfFrames([frame]));
        return { front: front!, back: back! };
    }

    /**
     * Cuts a face into pieces along edges or wires lying on it, like scoring a sheet.
     *
     * A cutter cuts only where it lies on the face, and a closed loop inside it cuts out the region it
     * encloses. With no cutters the face comes back whole.
     * @param inputs - The face and the edges or wires to cut it along
     * @returns The pieces of the face
     * @group divisions
     * @shortname split face by wires
     * @drawable true
     * @example
     * ```typescript
     * const square = await bitbybit.occt.shapes.face.createSquareFace({ size: 10, center: [0, 0, 0], direction: [0, 1, 0] });
     * const line = await bitbybit.occt.shapes.edge.line({ start: [0, 0, -6], end: [0, 0, 6] });
     * const halves = await bitbybit.occt.operations.splitFaceByWires({ shape: square, wires: [line] });
     * ```
     */
    splitFaceByWires(inputs: Inputs.OCCT.SplitFaceByWiresDto<TopoDS_Face, TopoDS_Wire | TopoDS_Edge>): TopoDS_Face[] {
        const resolved = resolveDto(Inputs.OCCT.SplitFaceByWiresDto, inputs) as Resolved.OCCT.SplitFaceByWiresDto<TopoDS_Face, TopoDS_Wire | TopoDS_Edge>;
        const face = checkedShape(resolved.shape);
        const wires = checkedShapes(resolved.wires, "wires");
        return this.och.occ.SplitFaceByWires(face, wires);
    }

    /**
     * Offsets a wire that does not lie in one plane: every point moves by `offset` at right angles to
     * both the wire and `direction`, keeping its height along `direction`.
     *
     * Best on smooth wires; round sharp corners first with `fillets.fillet3DWire`, since at one the
     * offset edges do not meet and come back as a list of edges.
     * @param inputs - The wire, the offset distance and the direction to offset across
     * @returns The offset wire, or its edges in order when they do not meet
     * @group offsets
     * @shortname offset 3d wire
     * @drawable true
     * @example
     * ```typescript
     * const outer = await bitbybit.occt.operations.offset3DWire({ shape: smoothWire, offset: 1, direction: [0, 1, 0] });
     * ```
     */
    offset3DWire(inputs: Inputs.OCCT.Offset3DWireDto<TopoDS_Wire>): TopoDS_Wire | TopoDS_Edge[] {
        const resolved = resolveDto(Inputs.OCCT.Offset3DWireDto, inputs) as Resolved.OCCT.Offset3DWireDto<TopoDS_Wire>;
        return this.och.operationsService.offset3DWire(resolved);
    }

    /**
     * Draws a shape seen from a view frame as a technical drawing does, flat on the XZ plane: the
     * edges the eye sees and those that faces hide.
     *
     * The eye looks back along the frame's normal. Its origin lands on the world origin, its direction
     * on x and the normal crossed with the direction on z. Both compounds hold edges.
     * @param inputs - The shape, the view frame and the drawing options
     * @returns The visible and the hidden edges, each a compound on the XZ plane
     * @group views
     * @shortname hidden lines
     * @drawable false
     * @example
     * ```typescript
     * const { visible, hidden } = await bitbybit.occt.operations.hiddenLines({
     *     shape: part,
     *     frame: { origin: [0, 0, 0], normal: [1, 1, 1], direction: [1, 0, -1] },
     *     exact: true,
     *     smoothEdges: false,
     *     hiddenEdges: true,
     *     focus: 0,
     *     precision: 0.01,
     * });
     * ```
     */
    hiddenLines(inputs: Inputs.OCCT.HiddenLinesDto<TopoDS_Shape>): Models.OCCT.HiddenLinesResult<TopoDS_Compound> {
        const resolved = resolveDto(Inputs.OCCT.HiddenLinesDto, inputs) as Resolved.OCCT.HiddenLinesDto<TopoDS_Shape>;
        const shape = checkedShape(resolved.shape);
        const frame = checkedFrame(resolved.frame, "frame");
        const focus = checkedNumber(resolved.focus, "focus", 0);
        const precision = resolved.exact ? 0 : checkedWithin(resolved.precision, "precision", { above: 0 });
        const drawing = this.och.occ.HiddenLines(shape, numbersOfFrames([frame]), resolved.exact, resolved.smoothEdges, resolved.hiddenEdges, focus, precision);
        return { visible: this.ontoGround(drawing.visible), hidden: this.ontoGround(drawing.hidden) };
    }

    /**
     * The kernel's drawing on the XY plane turned onto the XZ plane, its y becoming z. Its edges
     * arrive as curves on the drawing plane only, so their 3D curves are built first, or turning
     * would lose them. The kernel's compound is released.
     */
    private ontoGround(drawing: TopoDS_Compound): TopoDS_Compound {
        this.och.occ.BRepLib_BuildCurves3d_Simple(drawing);
        const turned = this.och.transformsService.rotate({ shape: drawing, angle: 90, axis: [1, 0, 0] });
        drawing.delete();
        const compound = this.och.occ.CastToCompound(turned);
        turned.delete();
        return compound;
    }

    /** The kernel's result as the kind of shape it is; the kernel's handle is released. */
    private actual(made: TopoDS_Shape): TopoDS_Shape {
        const shape = this.och.converterService.getActualTypeOfShape(made);
        made.delete();
        return shape;
    }
}
