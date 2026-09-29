// A fragment of the OCCT inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../occ-inputs.ts. Edit here, then regenerate.
import { Base } from "@bitbybit-dev/base";
import { featureExtentEnum } from "./enums";

/**
 * Two shapes and a joining tolerance for `operations.sectionWires`, which gives the curves where the
 * shapes meet, joined end to end into wires.
 */
export class SectionWiresDto<T> {
    constructor(shapeA?: T, shapeB?: T, tolerance?: number) {
        if (shapeA !== undefined) { this.shapeA = shapeA; }
        if (shapeB !== undefined) { this.shapeB = shapeB; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
    }
    /**
     * One of the two shapes, such as a solid to cut through.
     * @default undefined
     */
    shapeA!: T;
    /**
     * The shape it meets, such as a face or a solid passing through `shapeA`.
     * @default undefined
     */
    shapeB!: T;
    /**
     * How close the ends of two section edges must lie to be joined into one wire, in model units.
     * @default 1e-7
     * @minimum 0
     * @maximum Infinity
     * @step 0.00001
     */
    tolerance?: number | undefined = 1e-7;
}
/**
 * A shape, the frames whose planes slice it and what each slice keeps for
 * `operations.sliceByFrames`, which gives one slice per frame.
 */
export class SliceByFramesDto<T> {
    constructor(shape?: T, frames?: Base.Frame[], makeFaces?: boolean, tolerance?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (frames !== undefined) { this.frames = frames; }
        if (makeFaces !== undefined) { this.makeFaces = makeFaces; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
    }
    /**
     * The shape to slice: faces come from its solids, wires from its solids, shells and faces.
     * @default undefined
     */
    shape!: T;
    /**
     * One plane per frame, through the frame's origin and square to its normal; the frame's
     * direction does not matter.
     * @default undefined
     */
    frames!: Base.Frame[];
    /**
     * When true, each slice holds the faces where its plane passes through the solids, holes
     * included; when false, it holds the section wires.
     * @default true
     */
    makeFaces?: boolean | undefined = true;
    /**
     * How close the ends of two section edges must lie to be joined into one wire, in model units.
     * @default 1e-7
     * @minimum 0
     * @maximum Infinity
     * @step 0.00001
     */
    tolerance?: number | undefined = 1e-7;
}
/**
 * A shape and the frame whose plane splits it for `operations.splitByFrame`, which returns what lies
 * in front of the plane and what lies behind it.
 */
export class SplitByFrameDto<T> {
    constructor(shape?: T, frame?: Base.Frame) {
        if (shape !== undefined) { this.shape = shape; }
        if (frame !== undefined) { this.frame = frame; }
    }
    /**
     * The shape to split: its solids become the pieces, or its faces when it has no solids, or its
     * edges when it has neither.
     * @default undefined
     */
    shape!: T;
    /**
     * The plane to split along, through the frame's origin; `front` holds what lies on the side its
     * normal points to.
     * @default undefined
     */
    frame!: Base.Frame;
}
/**
 * A face and the edges or wires that cut it for `operations.splitFaceByWires`, which returns the
 * pieces of the face.
 */
export class SplitFaceByWiresDto<T, U> {
    constructor(shape?: T, wires?: U[]) {
        if (shape !== undefined) { this.shape = shape; }
        if (wires !== undefined) { this.wires = wires; }
    }
    /**
     * The face to cut.
     * @default undefined
     */
    shape!: T;
    /**
     * The edges or wires to cut along, lying on the face; a closed loop cuts out the region it
     * encloses.
     * @default undefined
     */
    wires!: U[];
}
/**
 * A shape, a view frame and drawing options for `operations.hiddenLines`, which draws the edges seen
 * from the frame and the edges hidden behind faces, flat on the XZ plane.
 */
export class HiddenLinesDto<T> {
    constructor(shape?: T, frame?: Base.Frame, exact?: boolean, smoothEdges?: boolean, hiddenEdges?: boolean, focus?: number, precision?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (frame !== undefined) { this.frame = frame; }
        if (exact !== undefined) { this.exact = exact; }
        if (smoothEdges !== undefined) { this.smoothEdges = smoothEdges; }
        if (hiddenEdges !== undefined) { this.hiddenEdges = hiddenEdges; }
        if (focus !== undefined) { this.focus = focus; }
        if (precision !== undefined) { this.precision = precision; }
    }
    /**
     * The shape to draw.
     * @default undefined
     */
    shape!: T;
    /**
     * The view: the eye sits on the side the normal points to and looks back along it, and the
     * drawing's x runs along the direction from the frame's origin.
     * @default undefined
     */
    frame!: Base.Frame;
    /**
     * When true, the drawing is made from the exact geometry; when false, from a mesh, which is
     * faster and draws parallel views only.
     * @default true
     */
    exact?: boolean | undefined = true;
    /**
     * When true, the edges where faces meet without a crease, such as the borders of a fillet, are
     * drawn too.
     * @default false
     */
    smoothEdges?: boolean | undefined = false;
    /**
     * When true, the edges that faces cover are collected in `hidden`; when false, `hidden` stays
     * empty.
     * @default true
     */
    hiddenEdges?: boolean | undefined = true;
    /**
     * How far the eye sits from the frame's origin along its normal for a perspective, in model
     * units; 0 draws a parallel view. A perspective needs `exact`.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    focus?: number | undefined = 0;
    /**
     * The meshing tolerance in model units when `exact` is false; a smaller value follows curved
     * faces more closely.
     * @default 0.01
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.001
     */
    precision?: number | undefined = 0.01;
}
/**
 * A shape, the frames to drill at and the size of the holes for `features.holes`;
 * `features.counterboredHoles` and `features.countersunkHoles` add a shaped mouth to each hole.
 */
export class HolesDto<T> {
    constructor(shape?: T, frames?: Base.Frame[], diameter?: number, depth?: number, tipAngle?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (frames !== undefined) { this.frames = frames; }
        if (diameter !== undefined) { this.diameter = diameter; }
        if (depth !== undefined) { this.depth = depth; }
        if (tipAngle !== undefined) { this.tipAngle = tipAngle; }
    }
    /**
     * The shape to drill into.
     * @default undefined
     */
    shape!: T;
    /**
     * One hole per frame: the origin is where the hole enters and the normal points out of the
     * material, so the hole runs against it.
     * @default undefined
     */
    frames!: Base.Frame[];
    /**
     * The diameter of each hole, in model units.
     * @default 1
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.1
     */
    diameter?: number | undefined = 1;
    /**
     * How deep each hole goes from its entry, in model units, not counting a drill point; 0 drills
     * through the whole shape.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    depth?: number | undefined = 0;
    /**
     * The full angle of the drill point at the bottom of a hole, in degrees: 0 leaves a flat
     * bottom, and 118 is the point of a twist drill.
     * @default 0
     * @minimum 0
     * @maximum 180
     * @exclusiveMaximum true
     * @step 1
     */
    tipAngle?: number | undefined = 0;
}
/**
 * The holes of `features.holes` with a wider, flat-bottomed counterbore at each mouth that sinks a
 * screw head below the surface, for `features.counterboredHoles`.
 */
export class CounterboredHolesDto<T> extends HolesDto<T> {
    constructor(shape?: T, frames?: Base.Frame[], diameter?: number, depth?: number, tipAngle?: number, counterboreDiameter?: number, counterboreDepth?: number) {
        super(shape, frames, diameter, depth, tipAngle);
        if (counterboreDiameter !== undefined) { this.counterboreDiameter = counterboreDiameter; }
        if (counterboreDepth !== undefined) { this.counterboreDepth = counterboreDepth; }
    }
    /**
     * The diameter of the counterbore, in model units; it must be wider than `diameter`.
     * @default 2
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.1
     */
    counterboreDiameter?: number | undefined = 2;
    /**
     * How deep the counterbore goes from the hole's entry, in model units; it must stay shallower
     * than a hole of a given `depth`.
     * @default 0.5
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.1
     */
    counterboreDepth?: number | undefined = 0.5;
}
/**
 * The holes of `features.holes` with a cone-shaped countersink at each mouth that sinks a flat screw
 * head flush with the surface, for `features.countersunkHoles`.
 */
export class CountersunkHolesDto<T> extends HolesDto<T> {
    constructor(shape?: T, frames?: Base.Frame[], diameter?: number, depth?: number, tipAngle?: number, countersinkDiameter?: number, countersinkAngle?: number) {
        super(shape, frames, diameter, depth, tipAngle);
        if (countersinkDiameter !== undefined) { this.countersinkDiameter = countersinkDiameter; }
        if (countersinkAngle !== undefined) { this.countersinkAngle = countersinkAngle; }
    }
    /**
     * The diameter of the countersink where it meets the surface, in model units; it must be wider
     * than `diameter`.
     * @default 2
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.1
     */
    countersinkDiameter?: number | undefined = 2;
    /**
     * The full angle of the countersink cone, in degrees, such as 90 or 82 for common flat head
     * screws.
     * @default 90
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum 180
     * @exclusiveMaximum true
     * @step 1
     */
    countersinkAngle?: number | undefined = 90;
}
/**
 * A solid and the faces to remove from it for `features.removeFaces`, which closes the gap by
 * extending the faces around them.
 */
export class RemoveFacesDto<T> {
    constructor(shape?: T, indexes?: number[]) {
        if (shape !== undefined) { this.shape = shape; }
        if (indexes !== undefined) { this.indexes = indexes; }
    }
    /**
     * The shape to remove faces from; it must hold solids only.
     * @default undefined
     */
    shape!: T;
    /**
     * The faces to remove, counted from 0 as `shapes.face.getFaces` lists them.
     * @default undefined
     */
    indexes!: number[];
}
/**
 * A shape, the faces to move and how far for `features.pushPullFaces`, which moves each face along
 * its outward normal and stretches the faces around it to follow.
 */
export class PushPullFacesDto<T> {
    constructor(shape?: T, indexes?: number[], distance?: number, distances?: number[]) {
        if (shape !== undefined) { this.shape = shape; }
        if (indexes !== undefined) { this.indexes = indexes; }
        if (distance !== undefined) { this.distance = distance; }
        if (distances !== undefined) { this.distances = distances; }
    }
    /**
     * The shape whose faces move.
     * @default undefined
     */
    shape!: T;
    /**
     * The faces to move, counted from 0 as `shapes.face.getFaces` lists them, each at most once.
     * @default undefined
     */
    indexes!: number[];
    /**
     * How far every chosen face moves along its outward normal, in model units; a negative
     * distance moves it inward.
     * @default 1
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    distance?: number | undefined = 1;
    /**
     * One distance per entry of `indexes`, in the same order, used instead of `distance`; left out,
     * every chosen face moves by `distance`.
     * @default undefined
     * @optional true
     */
    distances?: number[] | undefined;
}
/**
 * A base shape, a profile face sketched on one of its faces and how far to sweep it for
 * `features.boss`, which adds material, and `features.pocket`, which removes it.
 */
export class PrismFeatureDto<T, U> {
    constructor(shape?: T, profile?: U, sketchFaceIndex?: number, direction?: Base.Vector3, extent?: featureExtentEnum, length?: number, untilFaceIndex?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (profile !== undefined) { this.profile = profile; }
        if (sketchFaceIndex !== undefined) { this.sketchFaceIndex = sketchFaceIndex; }
        if (direction !== undefined) { this.direction = direction; }
        if (extent !== undefined) { this.extent = extent; }
        if (length !== undefined) { this.length = length; }
        if (untilFaceIndex !== undefined) { this.untilFaceIndex = untilFaceIndex; }
    }
    /**
     * The base shape the feature is built on.
     * @default undefined
     */
    shape!: T;
    /**
     * The face to sweep; it must lie on the face of the base that `sketchFaceIndex` names.
     * @default undefined
     */
    profile!: U;
    /**
     * The face of the base the profile lies on, counted from 0 as `shapes.face.getFaces` lists them.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    sketchFaceIndex?: number | undefined = 0;
    /**
     * The direction the profile travels in: away from the base for a boss, into it for a pocket.
     * @default [0, 1, 0]
     */
    direction?: Base.Vector3 | undefined = [0, 1, 0];
    /**
     * Where the feature stops: after `length`, at the face `untilFaceIndex` names, or once it has
     * passed through the whole base.
     * @default length
     */
    extent?: featureExtentEnum | undefined = featureExtentEnum.length;
    /**
     * How far the profile travels when `extent` is `length`, in model units.
     * @default 1
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.1
     */
    length?: number | undefined = 1;
    /**
     * The face the feature stops at when `extent` is `untilFace`: one the profile meets on its way,
     * such as the underside of an overhang or a void's ceiling.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    untilFaceIndex?: number | undefined = 0;
}
/**
 * A base shape, a profile face sketched on one of its faces, a draft angle and how far to sweep the
 * profile for `features.taperedBoss` and `features.taperedPocket`, whose sides lean by the angle.
 */
export class TaperedPrismFeatureDto<T, U> {
    constructor(shape?: T, profile?: U, sketchFaceIndex?: number, angle?: number, extent?: featureExtentEnum, length?: number, untilFaceIndex?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (profile !== undefined) { this.profile = profile; }
        if (sketchFaceIndex !== undefined) { this.sketchFaceIndex = sketchFaceIndex; }
        if (angle !== undefined) { this.angle = angle; }
        if (extent !== undefined) { this.extent = extent; }
        if (length !== undefined) { this.length = length; }
        if (untilFaceIndex !== undefined) { this.untilFaceIndex = untilFaceIndex; }
    }
    /**
     * The base shape the feature is built on.
     * @default undefined
     */
    shape!: T;
    /**
     * The face to sweep; it must lie on the face of the base that `sketchFaceIndex` names.
     * @default undefined
     */
    profile!: U;
    /**
     * The face of the base the profile lies on, counted from 0 as `shapes.face.getFaces` lists them.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    sketchFaceIndex?: number | undefined = 0;
    /**
     * How far the sides lean from straight, in degrees: a positive angle narrows the feature as it
     * goes away from the sketch face, a negative one widens it.
     * @default 5
     * @minimum -90
     * @exclusiveMinimum true
     * @maximum 90
     * @exclusiveMaximum true
     * @step 1
     */
    angle?: number | undefined = 5;
    /**
     * Where the feature stops: after `length`, at the face `untilFaceIndex` names, or once it has
     * passed through the whole base.
     * @default length
     */
    extent?: featureExtentEnum | undefined = featureExtentEnum.length;
    /**
     * How far the feature runs from the sketch face when `extent` is `length`, in model units.
     * @default 1
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.1
     */
    length?: number | undefined = 1;
    /**
     * The face the feature stops at when `extent` is `untilFace`: one the profile meets on its way,
     * such as the underside of an overhang or a void's ceiling.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    untilFaceIndex?: number | undefined = 0;
}
/**
 * A base shape, a profile face sketched on one of its faces and an axis for
 * `features.revolvedBoss` and `features.revolvedPocket`, which turn the profile about the axis to
 * add or remove a ring.
 */
export class RevolvedFeatureDto<T, U> {
    constructor(shape?: T, profile?: U, sketchFaceIndex?: number, axisOrigin?: Base.Point3, axisDirection?: Base.Vector3, angle?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (profile !== undefined) { this.profile = profile; }
        if (sketchFaceIndex !== undefined) { this.sketchFaceIndex = sketchFaceIndex; }
        if (axisOrigin !== undefined) { this.axisOrigin = axisOrigin; }
        if (axisDirection !== undefined) { this.axisDirection = axisDirection; }
        if (angle !== undefined) { this.angle = angle; }
    }
    /**
     * The base shape the feature is built on.
     * @default undefined
     */
    shape!: T;
    /**
     * The face to turn, lying in a plane through the axis; it must lie on the face of the base that
     * `sketchFaceIndex` names.
     * @default undefined
     */
    profile!: U;
    /**
     * The face of the base the profile lies on, counted from 0 as `shapes.face.getFaces` lists them.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    sketchFaceIndex?: number | undefined = 0;
    /**
     * A point on the axis the profile turns about.
     * @default [0, 0, 0]
     */
    axisOrigin?: Base.Point3 | undefined = [0, 0, 0];
    /**
     * The direction of the axis the profile turns about.
     * @default [0, 1, 0]
     */
    axisDirection?: Base.Vector3 | undefined = [0, 1, 0];
    /**
     * How far the profile turns, in degrees, following the right-hand rule about the axis; 360
     * makes a whole ring.
     * @default 360
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum 360
     * @step 1
     */
    angle?: number | undefined = 360;
}
/**
 * A base shape, a wire and the plane it lies in for `features.rib`, which fills the region the wire
 * closes off against the base, and `features.groove`, which cuts a region away.
 */
export class RibFeatureDto<T, U> {
    constructor(shape?: T, wire?: U, frame?: Base.Frame, thickness?: number, otherSideThickness?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (wire !== undefined) { this.wire = wire; }
        if (frame !== undefined) { this.frame = frame; }
        if (thickness !== undefined) { this.thickness = thickness; }
        if (otherSideThickness !== undefined) { this.otherSideThickness = otherSideThickness; }
    }
    /**
     * The base shape the feature is built on.
     * @default undefined
     */
    shape!: T;
    /**
     * The wire outlining the rib or groove in the plane of `frame`; the feature lies on its left as
     * it runs, seen from the side the normal points to.
     * @default undefined
     */
    wire!: U;
    /**
     * The plane the wire lies in, through the frame's origin and square to its normal; the frame's
     * direction does not matter.
     * @default undefined
     */
    frame!: Base.Frame;
    /**
     * How thick the feature is on the side of the plane the frame's normal points to, in model
     * units.
     * @default 0.5
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    thickness?: number | undefined = 0.5;
    /**
     * How thick the feature is on the other side of the plane, in model units; it and `thickness`
     * are not both 0.
     * @default 0.5
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    otherSideThickness?: number | undefined = 0.5;
}
/**
 * A flat spine and a profile for `operations.sweepEvolved`, which sweeps the profile along the spine
 * keeping its place beside it, the way a moulding follows a wall.
 */
export class SweepEvolvedDto<T, U> {
    constructor(spine?: T, profile?: U, makeSolid?: boolean) {
        if (spine !== undefined) { this.spine = spine; }
        if (profile !== undefined) { this.profile = profile; }
        if (makeSolid !== undefined) { this.makeSolid = makeSolid; }
    }
    /**
     * The path: a wire or a face lying in one plane; a face is swept along its boundary.
     * @default undefined
     */
    spine!: T;
    /**
     * The edge or wire to sweep, drawn about the origin: x along the spine, y to the left of travel
     * and z up from the spine's plane.
     * @default undefined
     */
    profile!: U;
    /**
     * When true, the sweep is closed into a solid where it can be: a closed profile gives a solid
     * wall, and a wall round a closed spine is capped.
     * @default true
     */
    makeSolid?: boolean | undefined = true;
}
/**
 * A spine, a profile and a scale at places along the spine for `operations.pipeWithScaling`, which
 * sweeps the profile along the spine while scaling it.
 */
export class PipeWithScalingDto<T, U> {
    constructor(spine?: T, profile?: U, params?: number[], scales?: number[], makeSolid?: boolean) {
        if (spine !== undefined) { this.spine = spine; }
        if (profile !== undefined) { this.profile = profile; }
        if (params !== undefined) { this.params = params; }
        if (scales !== undefined) { this.scales = scales; }
        if (makeSolid !== undefined) { this.makeSolid = makeSolid; }
    }
    /**
     * The path to sweep along, an edge or a wire.
     * @default undefined
     */
    spine!: T;
    /**
     * The edge or wire to sweep, placed across the start of the spine.
     * @default undefined
     */
    profile!: U;
    /**
     * Places along the spine as fractions of it, rising from 0 at its start to 1 at its end; the
     * first is 0 and the last is 1.
     * @default [0, 1]
     */
    params?: number[] | undefined = [0, 1];
    /**
     * The scale of the profile at each place in `params`, in the same order, each above 0; 1 keeps
     * the profile's size.
     * @default [1, 0.5]
     */
    scales?: number[] | undefined = [1, 0.5];
    /**
     * When true, the ends are capped into a solid, which needs a closed profile; when false, the
     * result is an open shell.
     * @default true
     */
    makeSolid?: boolean | undefined = true;
}
