import type { BitbybitOcctModule, TopoDS_Edge, TopoDS_Face, TopoDS_Shape, TopoDS_Wire } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import type { OccHelper } from "../../occ-helper";
import * as Inputs from "../../api/inputs";
import { resolveDto } from "@bitbybit-dev/base";
import type * as Resolved from "../../api/resolved-inputs";
import type * as Models from "../../api/models";
import { historiesFromKernel } from "../base/history";
import { numbersOfFrames } from "../base/frames";
import { checkedChoice, checkedDirection, checkedFrame, checkedFrames, checkedIndexes, checkedNumber, checkedNumberList, checkedPoint, checkedShape, checkedWhole, checkedWithin } from "../base/input-checks";

const RADIANS_PER_DEGREE = Math.PI / 180;

const EXTENTS: readonly Inputs.OCCT.featureExtentEnum[] = [
    Inputs.OCCT.featureExtentEnum.length,
    Inputs.OCCT.featureExtentEnum.untilFace,
    Inputs.OCCT.featureExtentEnum.throughAll,
];

type KernelExtent = [length: number, untilFace: number, throughAll: boolean];

type DrillArguments = [shape: TopoDS_Shape, frames: number[], diameter: number, depth: number,
    counterboreDiameter: number, counterboreDepth: number, countersinkDiameter: number, countersinkAngle: number, tipAngle: number];

type PrismArguments = [shape: TopoDS_Shape, profile: TopoDS_Shape, sketchFace: number, direction: Inputs.Base.Vector3,
    length: number, untilFace: number, throughAll: boolean];

/**
 * Local modelling features on solids: holes drilled at frames, bosses and pockets from a profile
 * sketched on a face, tapered and revolved ones, ribs and grooves from a wire, and faces removed or
 * pushed and pulled. Each method returns a new shape and leaves the one it was given as it is; faces
 * are counted from 0 as `shapes.face.getFaces` and the face selectors count them. Sweeps that need no
 * base, such as `operations.sweepEvolved`, live in `operations`.
 */
export class OCCTFeatures {

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly och: OccHelper,
    ) { }

    /**
     * Drills plain holes into a shape, one at each frame: its origin is where the hole enters and its
     * normal points out of the material.
     *
     * `depth` 0 drills through the whole shape; `tipAngle` 0 leaves a flat bottom and 118 the point of
     * a twist drill, in degrees. Holes that meet are cut as one.
     * @param inputs - The shape, the frames and the size of the holes
     * @returns The drilled shape
     * @group holes
     * @shortname holes
     * @drawable true
     * @example
     * ```typescript
     * const plate = await bitbybit.occt.shapes.solid.createBox({ width: 20, length: 20, height: 5, center: [0, 2.5, 0] });
     * const drilled = await bitbybit.occt.features.holes({
     *     shape: plate,
     *     frames: [
     *         { origin: [5, 5, 5], normal: [0, 1, 0], direction: [1, 0, 0] },
     *         { origin: [-5, 5, -5], normal: [0, 1, 0], direction: [1, 0, 0] },
     *     ],
     *     diameter: 3,
     *     depth: 0,
     *     tipAngle: 0,
     * });
     * ```
     */
    holes(inputs: Inputs.OCCT.HolesDto<TopoDS_Shape>): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.HolesDto, inputs) as Resolved.OCCT.HolesDto<TopoDS_Shape>;
        return this.drilled(resolved, () => [0, 0, 0, 0]);
    }

    /**
     * Drills holes as `holes` does, and reports a history for the shape, then one per hole in the
     * order of `frames`.
     *
     * `histories[i + 1].faces.flat()` lists every face hole `i` left in the shape.
     * @param inputs - The shape, the frames and the size of the holes
     * @returns The drilled shape and one history for the shape, then one per hole
     * @group holes
     * @shortname holes with history
     * @drawable false
     * @example
     * ```typescript
     * const { shape, histories } = await bitbybit.occt.features.holesWithHistory({
     *     shape: plate,
     *     frames: [{ origin: [5, 5, 5], normal: [0, 1, 0], direction: [1, 0, 0] }],
     *     diameter: 3,
     *     depth: 0,
     *     tipAngle: 0,
     * });
     * const firstHoleFaces = histories[1].faces.flat();
     * ```
     */
    holesWithHistory(inputs: Inputs.OCCT.HolesDto<TopoDS_Shape>): Models.OCCT.ShapeWithHistories<TopoDS_Shape> {
        const resolved = resolveDto(Inputs.OCCT.HolesDto, inputs) as Resolved.OCCT.HolesDto<TopoDS_Shape>;
        return this.drilledWithHistory(resolved, () => [0, 0, 0, 0]);
    }

    /**
     * Drills holes as `holes` does, each with a wider, flat-bottomed counterbore at its mouth that
     * sinks a screw head below the surface.
     *
     * The counterbore must be wider than the hole and, in a hole of a given `depth`, shallower than
     * it; a hole that breaks either rule is refused.
     * @param inputs - The shape, the frames, the size of the holes and the size of the counterbores
     * @returns The drilled shape
     * @group holes
     * @shortname counterbored holes
     * @drawable true
     * @example
     * ```typescript
     * const drilled = await bitbybit.occt.features.counterboredHoles({
     *     shape: plate,
     *     frames: [{ origin: [0, 5, 0], normal: [0, 1, 0], direction: [1, 0, 0] }],
     *     diameter: 3.4,
     *     depth: 0,
     *     tipAngle: 0,
     *     counterboreDiameter: 6.5,
     *     counterboreDepth: 3.4,
     * });
     * ```
     */
    counterboredHoles(inputs: Inputs.OCCT.CounterboredHolesDto<TopoDS_Shape>): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.CounterboredHolesDto, inputs) as Resolved.OCCT.CounterboredHolesDto<TopoDS_Shape>;
        return this.drilled(resolved, () => [
            checkedWithin(resolved.counterboreDiameter, "counterboreDiameter", { above: 0 }),
            checkedWithin(resolved.counterboreDepth, "counterboreDepth", { above: 0 }),
            0,
            0,
        ]);
    }

    /**
     * Drills holes as `counterboredHoles` does, and reports a history for the shape, then one per hole in the
     * order of `frames`.
     *
     * `histories[i + 1].faces.flat()` lists every face hole `i` left in the shape.
     * @param inputs - The shape, the frames, the size of the holes and the size of the counterbores
     * @returns The drilled shape and one history for the shape, then one per hole
     * @group holes
     * @shortname counterbored holes with history
     * @drawable false
     * @example
     * ```typescript
     * const { shape, histories } = await bitbybit.occt.features.counterboredHolesWithHistory({
     *     shape: plate,
     *     frames: [{ origin: [5, 5, 5], normal: [0, 1, 0], direction: [1, 0, 0] }],
     *     diameter: 3.4,
     *     depth: 0,
     *     tipAngle: 0,
     *     counterboreDiameter: 6.5,
     *     counterboreDepth: 3.4,
     * });
     * const firstHoleFaces = histories[1].faces.flat();
     * ```
     */
    counterboredHolesWithHistory(inputs: Inputs.OCCT.CounterboredHolesDto<TopoDS_Shape>): Models.OCCT.ShapeWithHistories<TopoDS_Shape> {
        const resolved = resolveDto(Inputs.OCCT.CounterboredHolesDto, inputs) as Resolved.OCCT.CounterboredHolesDto<TopoDS_Shape>;
        return this.drilledWithHistory(resolved, () => [
            checkedWithin(resolved.counterboreDiameter, "counterboreDiameter", { above: 0 }),
            checkedWithin(resolved.counterboreDepth, "counterboreDepth", { above: 0 }),
            0,
            0,
        ]);
    }

    /**
     * Drills holes as `holes` does, each with a cone-shaped countersink at its mouth that sinks a
     * flat screw head flush with the surface.
     *
     * `countersinkAngle` is the cone's full angle in degrees. The countersink must be wider than the
     * hole and end above the bottom of a hole of a given `depth`.
     * @param inputs - The shape, the frames, the size of the holes and the size of the countersinks
     * @returns The drilled shape
     * @group holes
     * @shortname countersunk holes
     * @drawable true
     * @example
     * ```typescript
     * const drilled = await bitbybit.occt.features.countersunkHoles({
     *     shape: plate,
     *     frames: [{ origin: [0, 5, 0], normal: [0, 1, 0], direction: [1, 0, 0] }],
     *     diameter: 3.4,
     *     depth: 0,
     *     tipAngle: 0,
     *     countersinkDiameter: 6.5,
     *     countersinkAngle: 90,
     * });
     * ```
     */
    countersunkHoles(inputs: Inputs.OCCT.CountersunkHolesDto<TopoDS_Shape>): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.CountersunkHolesDto, inputs) as Resolved.OCCT.CountersunkHolesDto<TopoDS_Shape>;
        return this.drilled(resolved, () => [
            0,
            0,
            checkedWithin(resolved.countersinkDiameter, "countersinkDiameter", { above: 0 }),
            checkedWithin(resolved.countersinkAngle, "countersinkAngle", { above: 0, below: 180 }) * RADIANS_PER_DEGREE,
        ]);
    }

    /**
     * Drills holes as `countersunkHoles` does, and reports a history for the shape, then one per hole in the
     * order of `frames`.
     *
     * `histories[i + 1].faces.flat()` lists every face hole `i` left in the shape.
     * @param inputs - The shape, the frames, the size of the holes and the size of the countersinks
     * @returns The drilled shape and one history for the shape, then one per hole
     * @group holes
     * @shortname countersunk holes with history
     * @drawable false
     * @example
     * ```typescript
     * const { shape, histories } = await bitbybit.occt.features.countersunkHolesWithHistory({
     *     shape: plate,
     *     frames: [{ origin: [5, 5, 5], normal: [0, 1, 0], direction: [1, 0, 0] }],
     *     diameter: 3.4,
     *     depth: 0,
     *     tipAngle: 0,
     *     countersinkDiameter: 6.5,
     *     countersinkAngle: 90,
     * });
     * const firstHoleFaces = histories[1].faces.flat();
     * ```
     */
    countersunkHolesWithHistory(inputs: Inputs.OCCT.CountersunkHolesDto<TopoDS_Shape>): Models.OCCT.ShapeWithHistories<TopoDS_Shape> {
        const resolved = resolveDto(Inputs.OCCT.CountersunkHolesDto, inputs) as Resolved.OCCT.CountersunkHolesDto<TopoDS_Shape>;
        return this.drilledWithHistory(resolved, () => [
            0,
            0,
            checkedWithin(resolved.countersinkDiameter, "countersinkDiameter", { above: 0 }),
            checkedWithin(resolved.countersinkAngle, "countersinkAngle", { above: 0, below: 180 }) * RADIANS_PER_DEGREE,
        ]);
    }

    /**
     * Removes faces from a solid and closes the gap by extending the faces around them, as when a
     * hole or a rounded edge is deleted from a part.
     *
     * The shape must hold solids only; a gap its neighbours cannot close, such as the top of a box
     * leaves, is refused rather than left open.
     * @param inputs - The shape and the faces to remove
     * @returns The shape without the faces
     * @group faces
     * @shortname remove faces
     * @drawable true
     * @example
     * ```typescript
     * const walls = await bitbybit.occt.select.faces.ofType({ shape: drilled, type: Bit.Inputs.OCCT.surfaceTypeEnum.cylinder });
     * const filled = await bitbybit.occt.features.removeFaces({ shape: drilled, indexes: walls });
     * ```
     */
    removeFaces(inputs: Inputs.OCCT.RemoveFacesDto<TopoDS_Shape>): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.RemoveFacesDto, inputs) as Resolved.OCCT.RemoveFacesDto<TopoDS_Shape>;
        const shape = checkedShape(resolved.shape);
        const indexes = checkedIndexes(resolved.indexes, "indexes");
        return this.actual(this.occ.RemoveFaces(shape, indexes));
    }

    /**
     * Moves faces of a shape along their outward normals and stretches the faces around them to
     * follow, such as raising the top of a block.
     *
     * `distance` moves every chosen face, a negative one inward; `distances` gives one per index
     * instead. Each solid of a compound moves on its own and stays a solid.
     * @param inputs - The shape, the faces and how far to move them
     * @returns The shape with the faces moved
     * @group faces
     * @shortname push pull faces
     * @drawable true
     * @example
     * ```typescript
     * const top = await bitbybit.occt.select.faces.facing({ shape: block, direction: [0, 1, 0], angle: 0 });
     * const taller = await bitbybit.occt.features.pushPullFaces({ shape: block, indexes: top, distance: 2 });
     * ```
     */
    pushPullFaces(inputs: Inputs.OCCT.PushPullFacesDto<TopoDS_Shape>): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.PushPullFacesDto, inputs) as Resolved.OCCT.PushPullFacesDto<TopoDS_Shape>;
        const shape = checkedShape(resolved.shape);
        const indexes = checkedIndexes(resolved.indexes, "indexes");
        let distances: number[];
        if (resolved.distances === undefined) {
            const distance = checkedWithin(resolved.distance, "distance", {});
            distances = indexes.map(() => distance);
        } else {
            distances = checkedNumberList(resolved.distances, "distances");
        }
        return this.actual(this.occ.PushPullFaces(shape, indexes, distances));
    }

    /**
     * Grows a boss out of a base by sweeping a profile face that lies on one of its faces along
     * `direction`.
     *
     * `extent` stops it after `length`, at the face `untilFaceIndex` names, such as the underside of
     * an overhang, or through all of the base in its way, which needs base ahead of it.
     * @param inputs - The base, the profile, its sketch face, the direction and how far to go
     * @returns The base with the boss
     * @group forms
     * @shortname boss
     * @drawable true
     * @example
     * ```typescript
     * const block = await bitbybit.occt.shapes.solid.createBox({ width: 10, length: 10, height: 10, center: [0, 5, 0] });
     * const [top] = await bitbybit.occt.select.faces.facing({ shape: block, direction: [0, 1, 0], angle: 0 });
     * const profile = await bitbybit.occt.shapes.face.createSquareFace({ size: 2, center: [0, 10, 0], direction: [0, 1, 0] });
     * const bossed = await bitbybit.occt.features.boss({ shape: block, profile, sketchFaceIndex: top, direction: [0, 1, 0], length: 3 });
     * ```
     */
    boss(inputs: Inputs.OCCT.PrismFeatureDto<TopoDS_Shape, TopoDS_Face>): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.PrismFeatureDto, inputs) as Resolved.OCCT.PrismFeatureDto<TopoDS_Shape, TopoDS_Face>;
        return this.prism(resolved, true);
    }

    /**
     * Grows a boss as `boss` does, and reports two histories: the base's, then the profile's, whose
     * `facesFromEdges` holds the side each profile edge swept and `lastFaces` the far end.
     *
     * A face the kernel leaves unreported is found from where it lies, and left out when it could
     * belong to more than one input.
     * @param inputs - The base, the profile, its sketch face, the direction and how far to go
     * @returns The base with the boss, and the histories of the base and of the profile
     * @group forms
     * @shortname boss with history
     * @drawable false
     * @example
     * ```typescript
     * const { shape, histories } = await bitbybit.occt.features.bossWithHistory({ shape: block, profile, sketchFaceIndex: top, direction: [0, 1, 0], length: 3 });
     * const [baseHistory, profileHistory] = histories;
     * const bossTop = profileHistory.lastFaces;
     * ```
     */
    bossWithHistory(inputs: Inputs.OCCT.PrismFeatureDto<TopoDS_Shape, TopoDS_Face>): Models.OCCT.ShapeWithHistories<TopoDS_Shape> {
        const resolved = resolveDto(Inputs.OCCT.PrismFeatureDto, inputs) as Resolved.OCCT.PrismFeatureDto<TopoDS_Shape, TopoDS_Face>;
        return this.prismWithHistory(resolved, true);
    }

    /**
     * Cuts a pocket into a base by sweeping a profile face that lies on one of its faces along
     * `direction`, which points into the base.
     *
     * `extent` stops it after `length`, at the face `untilFaceIndex` names, such as the ceiling of a
     * void or the far side of the base, or through all of it.
     * @param inputs - The base, the profile, its sketch face, the direction and how far to go
     * @returns The base with the pocket
     * @group forms
     * @shortname pocket
     * @drawable true
     * @example
     * ```typescript
     * const [top] = await bitbybit.occt.select.faces.facing({ shape: block, direction: [0, 1, 0], angle: 0 });
     * const profile = await bitbybit.occt.shapes.face.createSquareFace({ size: 2, center: [0, 10, 0], direction: [0, 1, 0] });
     * const pocketed = await bitbybit.occt.features.pocket({ shape: block, profile, sketchFaceIndex: top, direction: [0, -1, 0], length: 3 });
     * ```
     */
    pocket(inputs: Inputs.OCCT.PrismFeatureDto<TopoDS_Shape, TopoDS_Face>): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.PrismFeatureDto, inputs) as Resolved.OCCT.PrismFeatureDto<TopoDS_Shape, TopoDS_Face>;
        return this.prism(resolved, false);
    }

    /**
     * Cuts a pocket as `pocket` does, and reports two histories: the base's, then the profile's,
     * whose `facesFromEdges` holds the wall each profile edge swept and `lastFaces` the floor.
     *
     * A face the kernel leaves unreported is found from where it lies, and left out when it could
     * belong to more than one input.
     * @param inputs - The base, the profile, its sketch face, the direction and how far to go
     * @returns The base with the pocket, and the histories of the base and of the profile
     * @group forms
     * @shortname pocket with history
     * @drawable false
     * @example
     * ```typescript
     * const { shape, histories } = await bitbybit.occt.features.pocketWithHistory({ shape: block, profile, sketchFaceIndex: top, direction: [0, -1, 0], length: 3 });
     * const floor = histories[1].lastFaces;
     * const walls = histories[1].facesFromEdges.flat();
     * ```
     */
    pocketWithHistory(inputs: Inputs.OCCT.PrismFeatureDto<TopoDS_Shape, TopoDS_Face>): Models.OCCT.ShapeWithHistories<TopoDS_Shape> {
        const resolved = resolveDto(Inputs.OCCT.PrismFeatureDto, inputs) as Resolved.OCCT.PrismFeatureDto<TopoDS_Shape, TopoDS_Face>;
        return this.prismWithHistory(resolved, false);
    }

    /**
     * Grows a boss out of a base as `boss` does, straight out of the sketch face, with its sides
     * leaning by `angle` degrees.
     *
     * A positive angle narrows the boss as it rises from the sketch face, a negative one widens it
     * and rounds its outer corners. `extent` works as for `boss`.
     * @param inputs - The base, the profile, its sketch face, the draft angle in degrees and how far to go
     * @returns The base with the tapered boss
     * @group forms
     * @shortname tapered boss
     * @drawable true
     * @example
     * ```typescript
     * const [top] = await bitbybit.occt.select.faces.facing({ shape: block, direction: [0, 1, 0], angle: 0 });
     * const profile = await bitbybit.occt.shapes.face.createSquareFace({ size: 2, center: [0, 10, 0], direction: [0, 1, 0] });
     * const bossed = await bitbybit.occt.features.taperedBoss({ shape: block, profile, sketchFaceIndex: top, angle: 10, length: 3 });
     * ```
     */
    taperedBoss(inputs: Inputs.OCCT.TaperedPrismFeatureDto<TopoDS_Shape, TopoDS_Face>): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.TaperedPrismFeatureDto, inputs) as Resolved.OCCT.TaperedPrismFeatureDto<TopoDS_Shape, TopoDS_Face>;
        return this.taperedPrism(resolved, true);
    }

    /**
     * Cuts a pocket into a base as `pocket` does, straight in from the sketch face, with its sides
     * leaning by `angle` degrees.
     *
     * A positive angle narrows the pocket as it deepens, a negative one widens it. The kernel cannot
     * stop a tapered pocket at the far side of the base; run it through all instead.
     * @param inputs - The base, the profile, its sketch face, the draft angle in degrees and how far to go
     * @returns The base with the tapered pocket
     * @group forms
     * @shortname tapered pocket
     * @drawable true
     * @example
     * ```typescript
     * const [top] = await bitbybit.occt.select.faces.facing({ shape: block, direction: [0, 1, 0], angle: 0 });
     * const profile = await bitbybit.occt.shapes.face.createSquareFace({ size: 2, center: [0, 10, 0], direction: [0, 1, 0] });
     * const pocketed = await bitbybit.occt.features.taperedPocket({ shape: block, profile, sketchFaceIndex: top, angle: 5, length: 3 });
     * ```
     */
    taperedPocket(inputs: Inputs.OCCT.TaperedPrismFeatureDto<TopoDS_Shape, TopoDS_Face>): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.TaperedPrismFeatureDto, inputs) as Resolved.OCCT.TaperedPrismFeatureDto<TopoDS_Shape, TopoDS_Face>;
        return this.taperedPrism(resolved, false);
    }

    /**
     * Adds a ring to a base by turning a profile face about an axis, such as a collar round a shaft:
     * the profile lies on a face of the base, in a plane through the axis.
     *
     * `angle` is in degrees and follows the right-hand rule about `axisDirection`; 360 makes a whole
     * ring.
     * @param inputs - The base, the profile, its sketch face, the axis and the angle in degrees
     * @returns The base with the ring
     * @group forms
     * @shortname revolved boss
     * @drawable true
     * @example
     * ```typescript
     * const shaft = await bitbybit.occt.shapes.solid.createCylinder({ radius: 5, height: 10, center: [0, 0, 0], direction: [0, 1, 0] });
     * const [side] = await bitbybit.occt.select.faces.ofType({ shape: shaft, type: Bit.Inputs.OCCT.surfaceTypeEnum.cylinder });
     * const profile = await bitbybit.occt.shapes.face.createRectangleFace({ width: 2, length: 1, center: [5.5, 5, 0], direction: [0, 0, 1] });
     * const collared = await bitbybit.occt.features.revolvedBoss({ shape: shaft, profile, sketchFaceIndex: side, axisOrigin: [0, 0, 0], axisDirection: [0, 1, 0], angle: 360 });
     * ```
     */
    revolvedBoss(inputs: Inputs.OCCT.RevolvedFeatureDto<TopoDS_Shape, TopoDS_Face>): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.RevolvedFeatureDto, inputs) as Resolved.OCCT.RevolvedFeatureDto<TopoDS_Shape, TopoDS_Face>;
        return this.revolved(resolved, true);
    }

    /**
     * Cuts a groove round a base by turning a profile face about an axis, such as the seat of a
     * circlip on a shaft: the profile lies on a face of the base, in a plane through the axis.
     *
     * `angle` is in degrees and follows the right-hand rule about `axisDirection`; 360 cuts all the
     * way round.
     * @param inputs - The base, the profile, its sketch face, the axis and the angle in degrees
     * @returns The base with the groove
     * @group forms
     * @shortname revolved pocket
     * @drawable true
     * @example
     * ```typescript
     * const [side] = await bitbybit.occt.select.faces.ofType({ shape: shaft, type: Bit.Inputs.OCCT.surfaceTypeEnum.cylinder });
     * const profile = await bitbybit.occt.shapes.face.createRectangleFace({ width: 2, length: 1, center: [4.5, 5, 0], direction: [0, 0, 1] });
     * const grooved = await bitbybit.occt.features.revolvedPocket({ shape: shaft, profile, sketchFaceIndex: side, axisOrigin: [0, 0, 0], axisDirection: [0, 1, 0], angle: 360 });
     * ```
     */
    revolvedPocket(inputs: Inputs.OCCT.RevolvedFeatureDto<TopoDS_Shape, TopoDS_Face>): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.RevolvedFeatureDto, inputs) as Resolved.OCCT.RevolvedFeatureDto<TopoDS_Shape, TopoDS_Face>;
        return this.revolved(resolved, false);
    }

    /**
     * Adds a rib to a base: the region between a wire and the base's faces, on the wire's left as it
     * runs seen from the side the frame's normal points to, filled and thickened across the plane.
     *
     * A wire across the inside corner of an L fills the corner; an edge is made into a wire first.
     * @param inputs - The base, the wire, the plane it lies in and the thickness on each side
     * @returns The base with the rib
     * @group forms
     * @shortname rib
     * @drawable true
     * @example
     * ```typescript
     * const wire = await bitbybit.occt.shapes.wire.createPolylineWire({ points: [[12, 2, 0], [2, 12, 0]] });
     * const ribbed = await bitbybit.occt.features.rib({
     *     shape: bracket,
     *     wire,
     *     frame: { origin: [0, 0, 0], normal: [0, 0, 1], direction: [1, 0, 0] },
     *     thickness: 0.5,
     *     otherSideThickness: 0.5,
     * });
     * ```
     */
    rib(inputs: Inputs.OCCT.RibFeatureDto<TopoDS_Shape, TopoDS_Wire | TopoDS_Edge>): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.RibFeatureDto, inputs) as Resolved.OCCT.RibFeatureDto<TopoDS_Shape, TopoDS_Wire | TopoDS_Edge>;
        return this.linearForm(resolved, true);
    }

    /**
     * Cuts a groove into a base: the part of the base's section on the left of a wire as it runs,
     * seen from the side the frame's normal points to, removed across the plane.
     *
     * A wire bent round a corner keeps the region inside the bend and cuts the rest; an edge is made
     * into a wire first.
     * @param inputs - The base, the wire, the plane it lies in and the thickness on each side
     * @returns The base with the groove
     * @group forms
     * @shortname groove
     * @drawable true
     * @example
     * ```typescript
     * const wire = await bitbybit.occt.shapes.wire.createPolylineWire({ points: [[10, 12, 0], [10, 5, 0], [22, 5, 0]] });
     * const grooved = await bitbybit.occt.features.groove({
     *     shape: block,
     *     wire,
     *     frame: { origin: [0, 0, 0], normal: [0, 0, -1], direction: [1, 0, 0] },
     *     thickness: 0.5,
     *     otherSideThickness: 0.5,
     * });
     * ```
     */
    groove(inputs: Inputs.OCCT.RibFeatureDto<TopoDS_Shape, TopoDS_Wire | TopoDS_Edge>): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.RibFeatureDto, inputs) as Resolved.OCCT.RibFeatureDto<TopoDS_Shape, TopoDS_Wire | TopoDS_Edge>;
        return this.linearForm(resolved, false);
    }

    private drilled(inputs: Resolved.OCCT.HolesDto<TopoDS_Shape>, mouth: () => [number, number, number, number]): TopoDS_Shape {
        return this.actual(this.occ.DrillHoles(...this.drillArguments(inputs, mouth)));
    }

    private drilledWithHistory(inputs: Resolved.OCCT.HolesDto<TopoDS_Shape>, mouth: () => [number, number, number, number]): Models.OCCT.ShapeWithHistories<TopoDS_Shape> {
        const made = this.occ.DrillHolesWithHistory(...this.drillArguments(inputs, mouth));
        return { shape: this.actual(made.shape), histories: historiesFromKernel(made.histories) };
    }

    private drillArguments(inputs: Resolved.OCCT.HolesDto<TopoDS_Shape>, mouth: () => [number, number, number, number]): DrillArguments {
        const shape = checkedShape(inputs.shape);
        const frames = checkedFrames(inputs.frames, "frames");
        const diameter = checkedWithin(inputs.diameter, "diameter", { above: 0 });
        const depth = checkedNumber(inputs.depth, "depth", 0);
        const tipAngle = checkedWithin(inputs.tipAngle, "tipAngle", { atLeast: 0, below: 180 });
        const [counterboreDiameter, counterboreDepth, countersinkDiameter, countersinkAngle] = mouth();
        return [shape, numbersOfFrames(frames), diameter, depth,
            counterboreDiameter, counterboreDepth, countersinkDiameter, countersinkAngle, tipAngle * RADIANS_PER_DEGREE];
    }

    private prism(inputs: Resolved.OCCT.PrismFeatureDto<TopoDS_Shape, TopoDS_Face>, isAdding: boolean): TopoDS_Shape {
        const args = this.prismArguments(inputs);
        return this.actual(isAdding ? this.occ.FeatureBoss(...args) : this.occ.FeaturePocket(...args));
    }

    private prismWithHistory(inputs: Resolved.OCCT.PrismFeatureDto<TopoDS_Shape, TopoDS_Face>, isAdding: boolean): Models.OCCT.ShapeWithHistories<TopoDS_Shape> {
        const args = this.prismArguments(inputs);
        const made = isAdding ? this.occ.FeatureBossWithHistory(...args) : this.occ.FeaturePocketWithHistory(...args);
        return { shape: this.actual(made.shape), histories: historiesFromKernel(made.histories) };
    }

    private prismArguments(inputs: Resolved.OCCT.PrismFeatureDto<TopoDS_Shape, TopoDS_Face>): PrismArguments {
        const shape = checkedShape(inputs.shape);
        const profile = checkedShape(inputs.profile, "profile");
        const sketchFace = checkedWhole(inputs.sketchFaceIndex, "sketchFaceIndex", 0);
        const direction = checkedDirection(inputs.direction, "direction");
        const [length, untilFace, throughAll] = this.extentOf(inputs);
        return [shape, profile, sketchFace, direction, length, untilFace, throughAll];
    }

    private taperedPrism(inputs: Resolved.OCCT.TaperedPrismFeatureDto<TopoDS_Shape, TopoDS_Face>, isAdding: boolean): TopoDS_Shape {
        const shape = checkedShape(inputs.shape);
        const profile = checkedShape(inputs.profile, "profile");
        const sketchFace = checkedWhole(inputs.sketchFaceIndex, "sketchFaceIndex", 0);
        const angle = checkedWithin(inputs.angle, "angle", { above: -90, below: 90 });
        const [length, untilFace, throughAll] = this.extentOf(inputs);
        return this.actual(this.occ.FeatureTaperedPrism(shape, profile, sketchFace, angle * RADIANS_PER_DEGREE, isAdding, length, untilFace, throughAll));
    }

    private revolved(inputs: Resolved.OCCT.RevolvedFeatureDto<TopoDS_Shape, TopoDS_Face>, isAdding: boolean): TopoDS_Shape {
        const shape = checkedShape(inputs.shape);
        const profile = checkedShape(inputs.profile, "profile");
        const sketchFace = checkedWhole(inputs.sketchFaceIndex, "sketchFaceIndex", 0);
        const axisOrigin = checkedPoint(inputs.axisOrigin, "axisOrigin");
        const axisDirection = checkedDirection(inputs.axisDirection, "axisDirection");
        const angle = checkedWithin(inputs.angle, "angle", { above: 0, atMost: 360 });
        return this.actual(this.occ.FeatureRevolved(shape, profile, sketchFace, axisOrigin, axisDirection, isAdding, angle * RADIANS_PER_DEGREE));
    }

    private linearForm(inputs: Resolved.OCCT.RibFeatureDto<TopoDS_Shape, TopoDS_Wire | TopoDS_Edge>, isAdding: boolean): TopoDS_Shape {
        const shape = checkedShape(inputs.shape);
        const outline = checkedShape(inputs.wire, "wire");
        const frame = checkedFrame(inputs.frame, "frame");
        const thickness = checkedNumber(inputs.thickness, "thickness", 0);
        const otherSideThickness = checkedNumber(inputs.otherSideThickness, "otherSideThickness", 0);
        const [x, y, z] = frame.normal;
        const length = Math.hypot(x, y, z);
        const along = (distance: number): Inputs.Base.Vector3 => [x * distance / length, y * distance / length, z * distance / length];
        const isEdge = outline.ShapeType() === this.occ.TopAbs_ShapeEnum.EDGE;
        const wire = isEdge ? this.och.entitiesService.bRepBuilderAPIMakeWire(outline) : outline;
        try {
            const plane = numbersOfFrames([frame]);
            const made = isAdding
                ? this.occ.FeatureRib(shape, wire, plane, along(thickness), along(-otherSideThickness))
                : this.occ.FeatureGroove(shape, wire, plane, along(thickness), along(-otherSideThickness));
            return this.actual(made);
        } finally {
            if (isEdge) {
                wire.delete();
            }
        }
    }

    private extentOf(inputs: { extent: unknown; length: unknown; untilFaceIndex: unknown }): KernelExtent {
        switch (checkedChoice(inputs.extent, EXTENTS, "extent")) {
            case Inputs.OCCT.featureExtentEnum.untilFace:
                return [0, checkedWhole(inputs.untilFaceIndex, "untilFaceIndex", 0), false];
            case Inputs.OCCT.featureExtentEnum.throughAll:
                return [0, -1, true];
            default:
                return [checkedWithin(inputs.length, "length", { above: 0 }), -1, false];
        }
    }

    private actual(made: TopoDS_Shape): TopoDS_Shape {
        const solid = this.loneSolidOf(made);
        const shape = this.och.converterService.getActualTypeOfShape(solid ?? made);
        solid?.delete();
        made.delete();
        return shape;
    }

    private loneSolidOf(made: TopoDS_Shape): TopoDS_Shape | undefined {
        let child: TopoDS_Shape | undefined;
        let parent = made;
        while (parent.ShapeType() === this.occ.TopAbs_ShapeEnum.COMPOUND) {
            const children = this.occ.ChildrenOf(parent);
            child?.delete();
            if (children.length !== 1) {
                children.forEach(each => each.delete());
                return undefined;
            }
            child = children[0]!;
            parent = child;
        }
        if (child !== undefined && child.ShapeType() === this.occ.TopAbs_ShapeEnum.SOLID) {
            return child;
        }
        child?.delete();
        return undefined;
    }
}
