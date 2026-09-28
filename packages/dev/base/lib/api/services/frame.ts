import * as Inputs from "../inputs";
import { InputError, resolveDto } from "../kernel-calls";
import * as Resolved from "../resolved-inputs";
import { GeometryHelper } from "./geometry-helper";
import { MathBitByBit } from "./math";
import { Vector } from "./vector";
import { FrameAxes, isFrameShaped, isTriple, PARALLEL_SINE, squareFrame, unitOf } from "./helpers/frame-axes";
import { composed, symmetricEigen } from "./helpers/matrices";

type Vec3 = Inputs.Base.Vector3;
type Axes = FrameAxes;

const WORLD: Axes = { origin: [0, 0, 0], x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] };

/** The largest absolute coordinate in a list of vectors, by a loop, so a long list cannot overflow the call stack. */
const reachOf = (vectors: readonly Vec3[]): number => {
    let reach = 0;
    for (const vector of vectors) {
        reach = Math.max(reach, Math.abs(vector[0]), Math.abs(vector[1]), Math.abs(vector[2]));
    }
    return reach;
};

/**
 * Frames: a frame is a point with three axes at right angles, written as its `origin`, its `normal`
 * (the Z axis) and its `direction` (the X axis), the Y axis following from those two. Frames place
 * things: a shape lands on one, points convert between one and the world, and frame patterns lay
 * out copies. Every method returns new values and never changes its inputs.
 */
export class Frame {

    constructor(private readonly vector: Vector, private readonly math: MathBitByBit, private readonly geometryHelper: GeometryHelper) { }

    /**
     * Builds a frame from where it sits, where its Z axis points and roughly where its X axis
     * points.
     *
     * `direction` is turned square to `normal` and both are scaled to length 1, so they only have
     * to be roughly right. A `normal` of zero length or a `direction` along it throws.
     * @param inputs - The origin, the normal and the rough X direction
     * @returns A new frame
     * @group create
     * @shortname frame
     * @drawable true
     * @example
     * ```typescript
     * const tilted = bitbybit.frame.create({ origin: [0, 5, 0], normal: [0, 1, 1], direction: [1, 0, 0] });
     * ```
     */
    create(inputs: Inputs.Frame.CreateFrameDto): Inputs.Base.Frame {
        const resolved = resolveDto(Inputs.Frame.CreateFrameDto, inputs) as Resolved.Frame.CreateFrameDto;
        const origin = this.pointOf(resolved.origin, "origin");
        const normal = this.vectorOf(resolved.normal, "normal");
        const direction = this.vectorOf(resolved.direction, "direction");
        return this.frameOf(this.squared(origin, normal, direction, {
            normal: "`normal` has no length, so it gives the Z axis no direction.",
            direction: "`direction` runs along `normal` or has no length, so it does not fix the X axis.",
        }));
    }

    /**
     * Gives the world frame: its origin at zero, its X, Y and Z axes along the world's.
     *
     * Placing something on the world frame leaves it where it is, and it is the frame the other
     * methods use when one is left out.
     * @returns The world frame
     * @group create
     * @shortname world
     * @drawable true
     * @example
     * ```typescript
     * const world = bitbybit.frame.world();
     * const raised = bitbybit.frame.offset({ frame: world, distance: 5 });
     * ```
     */
    world(): Inputs.Base.Frame {
        return this.frameOf(WORLD);
    }

    /**
     * Builds a frame lying in the XY plane: its X axis along the world X, its Y axis along the
     * world Y and its normal along the world Z.
     * @param inputs - Where the frame sits
     * @returns A new frame
     * @group create
     * @shortname xy
     * @drawable true
     * @example
     * ```typescript
     * const floor = bitbybit.frame.xy({ origin: [0, 0, 2] });
     * ```
     */
    xy(inputs: Inputs.Frame.OriginDto): Inputs.Base.Frame {
        const resolved = resolveDto(Inputs.Frame.OriginDto, inputs) as Resolved.Frame.OriginDto;
        return this.frameOf({ ...WORLD, origin: this.pointOf(resolved.origin, "origin") });
    }

    /**
     * Builds a frame lying in the YZ plane: its X axis along the world Y, its Y axis along the
     * world Z and its normal along the world X.
     * @param inputs - Where the frame sits
     * @returns A new frame
     * @group create
     * @shortname yz
     * @drawable true
     * @example
     * ```typescript
     * const side = bitbybit.frame.yz({ origin: [3, 0, 0] });
     * ```
     */
    yz(inputs: Inputs.Frame.OriginDto): Inputs.Base.Frame {
        const resolved = resolveDto(Inputs.Frame.OriginDto, inputs) as Resolved.Frame.OriginDto;
        return this.frameOf({ origin: this.pointOf(resolved.origin, "origin"), x: [0, 1, 0], y: [0, 0, 1], z: [1, 0, 0] });
    }

    /**
     * Builds a frame lying in the ZX plane, the ground when Y points up: its X axis along the world
     * Z, its Y axis along the world X and its normal along the world Y.
     * @param inputs - Where the frame sits
     * @returns A new frame
     * @group create
     * @shortname zx
     * @drawable true
     * @example
     * ```typescript
     * const ground = bitbybit.frame.zx({ origin: [0, 0, 0] });
     * ```
     */
    zx(inputs: Inputs.Frame.OriginDto): Inputs.Base.Frame {
        const resolved = resolveDto(Inputs.Frame.OriginDto, inputs) as Resolved.Frame.OriginDto;
        return this.frameOf({ origin: this.pointOf(resolved.origin, "origin"), x: [0, 0, 1], y: [1, 0, 0], z: [0, 1, 0] });
    }

    /**
     * Builds a frame from three points: where it sits, a point its X axis runs toward and a point
     * on the side its Y axis points to.
     *
     * The normal follows by the right-hand rule. `xPoint` at `origin`, or three points on one line,
     * throws.
     * @param inputs - The origin, a point along the X axis and a point in the plane
     * @returns A new frame
     * @group create
     * @shortname from three points
     * @drawable true
     * @example
     * ```typescript
     * const frame = bitbybit.frame.fromThreePoints({ origin: [0, 0, 0], xPoint: [4, 0, 0], planePoint: [0, 0, -3] });
     * ```
     */
    fromThreePoints(inputs: Inputs.Frame.ThreePointsDto): Inputs.Base.Frame {
        const resolved = resolveDto(Inputs.Frame.ThreePointsDto, inputs) as Resolved.Frame.ThreePointsDto;
        const origin = this.pointOf(resolved.origin, "origin");
        const toX = unitOf(this.vector.sub({ first: this.pointOf(resolved.xPoint, "xPoint"), second: origin }) as Vec3);
        if (toX === undefined) {
            throw new InputError("`xPoint` is at `origin`, so it gives the X axis no direction.", "xPoint");
        }
        const toPlane = unitOf(this.vector.sub({ first: this.pointOf(resolved.planePoint, "planePoint"), second: origin }) as Vec3);
        const normal = toPlane === undefined ? undefined : this.vector.cross({ first: toX, second: toPlane }) as Vec3;
        if (normal === undefined || !(this.vector.length({ vector: normal }) > PARALLEL_SINE)) {
            throw new InputError("`planePoint` lies on the line through `origin` and `xPoint`, or within a billionth of a radian of it, so the three points do not fix a plane.", "planePoint");
        }
        return this.frameOf(this.squared(origin, normal, toX, { normal: "The three points do not fix a plane.", direction: "The three points do not fix a plane.", property: "planePoint" }));
    }

    /**
     * Builds a frame from a point and a normal, choosing its X axis by a fixed rule.
     *
     * The same normal always gives the same X axis: square to the normal and to the world axis the
     * normal leans on least. A normal of zero length throws.
     * @param inputs - The origin and the normal
     * @returns A new frame
     * @group create
     * @shortname from point and normal
     * @drawable true
     * @example
     * ```typescript
     * const onSlope = bitbybit.frame.fromPointAndNormal({ origin: [2, 1, 0], normal: [0, 1, 1] });
     * ```
     */
    fromPointAndNormal(inputs: Inputs.Frame.PointAndNormalDto): Inputs.Base.Frame {
        const resolved = resolveDto(Inputs.Frame.PointAndNormalDto, inputs) as Resolved.Frame.PointAndNormalDto;
        const origin = this.pointOf(resolved.origin, "origin");
        const normal = this.vectorOf(resolved.normal, "normal");
        const [a, b, c] = normal;
        const [aAbs, bAbs, cAbs] = [Math.abs(a), Math.abs(b), Math.abs(c)];
        let direction: Vec3;
        if (bAbs <= aAbs && bAbs <= cAbs) {
            direction = aAbs > cAbs ? [-c, 0, a] : [c, 0, -a];
        } else if (aAbs <= bAbs && aAbs <= cAbs) {
            direction = bAbs > cAbs ? [0, -c, b] : [0, c, -b];
        } else {
            direction = aAbs > bAbs ? [-b, a, 0] : [b, -a, 0];
        }
        return this.frameOf(this.squared(origin, normal, direction, {
            normal: "`normal` has no length, so it gives the Z axis no direction.",
            direction: "`normal` does not fix a frame.",
            property: "normal",
        }));
    }

    /**
     * Fits a frame to points that lie on or near one plane.
     *
     * It sits at their average. The normal follows their order by the right-hand rule, and X runs
     * along their widest spread, toward the first point; with no widest spread, as around a square,
     * X points at the first point. Fewer than three points, or nearly collinear ones, throw.
     * @param inputs - The points to fit
     * @returns A new frame in the plane that fits the points best
     * @group create
     * @shortname best fit
     * @drawable true
     * @example
     * ```typescript
     * const frame = bitbybit.frame.bestFit({ points: [[0, 0, 0], [4, 0.1, 0], [4, 3, 0.1], [0, 3, 0]] });
     * ```
     */
    bestFit(inputs: Inputs.Frame.BestFitDto): Inputs.Base.Frame {
        const points = this.pointsOf(inputs.points, "points");
        if (points.length < 3) {
            throw new InputError("`points` holds fewer than three points, so no plane fits them.", "points");
        }
        const center = points.reduce<Vec3>((total, point) => this.vector.add({ first: total, second: this.vector.mul({ vector: point, scalar: 1 / points.length }) }) as Vec3, [0, 0, 0]);
        const reach = reachOf(points.map(point => this.vector.sub({ first: point, second: center }) as Vec3));
        if (!(reach > 0 && reach < Infinity)) {
            throw new InputError("`points` all lie at one point, so no plane fits them.", "points");
        }
        const offsets = points.map(point => this.vector.mul({ vector: this.vector.sub({ first: point, second: center }), scalar: 1 / reach }) as Vec3);
        const covariance = [0, 1, 2].map(i => [0, 1, 2].map(j => offsets.reduce((total, offset) => total + offset[i]! * offset[j]!, 0)));
        const [widest, middle, flattest] = symmetricEigen(covariance);
        if (!(middle!.value > 1e-12 * widest!.value)) {
            throw new InputError("`points` lie on one line, or so near one that their spread across it is under a millionth of their spread along it, so no plane fits them reliably.", "points");
        }
        const spread = offsets.reduce((total, offset) => total + this.vector.dot({ first: offset, second: offset }), 0);
        const turning = offsets.reduce<Vec3>((total, offset, i) => this.vector.add({ first: total, second: this.vector.cross({ first: offset, second: offsets[(i + 1) % offsets.length]! }) }) as Vec3, [0, 0, 0]);
        const turn = this.vector.dot({ first: turning, second: flattest!.vector });
        const normal = Math.abs(turn) > 1e-9 * spread ? (turn < 0 ? this.vector.neg({ vector: flattest!.vector }) as Vec3 : flattest!.vector) : this.withLargestPositive(flattest!.vector);
        const direction = widest!.value - middle!.value > 1e-6 * widest!.value
            ? this.alongWidest(widest!.vector, offsets[0]!, spread)
            : this.towardFirstPoint(offsets, normal, spread) ?? widest!.vector;
        return this.frameOf(this.squared(center, normal, direction, { normal: "`points` do not fix a plane.", direction: "`points` do not fix a plane.", property: "points" }));
    }

    /**
     * Reads where a frame sits: the point its three axes start from.
     * @param inputs - The frame to read
     * @returns The origin
     * @group read
     * @shortname origin
     * @drawable true
     */
    origin(inputs: Inputs.Frame.FrameDto): Inputs.Base.Point3 {
        return [...this.axesOf(inputs.frame, "frame").origin];
    }

    /**
     * Reads where a frame's Z axis points, as a vector of length 1.
     * @param inputs - The frame to read
     * @returns The normal
     * @group read
     * @shortname normal
     * @drawable false
     */
    normal(inputs: Inputs.Frame.FrameDto): Inputs.Base.Vector3 {
        return [...this.axesOf(inputs.frame, "frame").z];
    }

    /**
     * Reads where a frame's X axis points, as a vector of length 1 square to the normal.
     * @param inputs - The frame to read
     * @returns The X direction
     * @group read
     * @shortname direction
     * @drawable false
     */
    direction(inputs: Inputs.Frame.FrameDto): Inputs.Base.Vector3 {
        return [...this.axesOf(inputs.frame, "frame").x];
    }

    /**
     * Reads where a frame's Y axis points: the normal crossed with the direction, as a vector of
     * length 1.
     * @param inputs - The frame to read
     * @returns The Y direction
     * @group read
     * @shortname y direction
     * @drawable false
     */
    yDirection(inputs: Inputs.Frame.FrameDto): Inputs.Base.Vector3 {
        return [...this.axesOf(inputs.frame, "frame").y];
    }

    /**
     * Moves a frame by a vector in world coordinates, keeping the directions of its axes.
     * @param inputs - The frame and the vector to move it by
     * @returns A new frame
     * @group change
     * @shortname translate
     * @drawable true
     * @example
     * ```typescript
     * const moved = bitbybit.frame.translate({ frame: bitbybit.frame.world(), translation: [2, 0, 1] });
     * ```
     */
    translate(inputs: Inputs.Frame.TranslateDto): Inputs.Base.Frame {
        const resolved = resolveDto(Inputs.Frame.TranslateDto, inputs) as Resolved.Frame.TranslateDto;
        const axes = this.axesOf(resolved.frame, "frame");
        return this.translated(axes, this.vectorOf(resolved.translation, "translation"));
    }

    /**
     * Moves frames by one vector in world coordinates, as `translate` moves one; their axes keep
     * their directions.
     * @param inputs - The frames and the vector to move them by
     * @returns New frames, in the same order
     * @group change
     * @shortname translate frames
     * @drawable true
     * @example
     * ```typescript
     * const floor = bitbybit.frame.grid({ countX: 3, countY: 3, spacingX: 2, spacingY: 2, centered: true });
     * const ceiling = bitbybit.frame.translateFrames({ frames: floor, translation: [0, 0, 3] });
     * ```
     */
    translateFrames(inputs: Inputs.Frame.TranslateFramesDto): Inputs.Base.Frame[] {
        const resolved = resolveDto(Inputs.Frame.TranslateFramesDto, inputs) as Resolved.Frame.TranslateFramesDto;
        const frames = this.axesOfEach(resolved.frames, "frames");
        const translation = this.vectorOf(resolved.translation, "translation");
        return frames.map(axes => this.translated(axes, translation));
    }

    /**
     * Moves a frame along its own normal, keeping the directions of its axes.
     *
     * A negative distance moves it against the normal.
     * @param inputs - The frame and the distance in model units
     * @returns A new frame
     * @group change
     * @shortname offset
     * @drawable true
     * @example
     * ```typescript
     * const lid = bitbybit.frame.offset({ frame: bitbybit.frame.zx({ origin: [0, 0, 0] }), distance: 10 });
     * ```
     */
    offset(inputs: Inputs.Frame.OffsetDto): Inputs.Base.Frame {
        const resolved = resolveDto(Inputs.Frame.OffsetDto, inputs) as Resolved.Frame.OffsetDto;
        const axes = this.axesOf(resolved.frame, "frame");
        return this.offsetBy(axes, this.numberOf(resolved.distance, "distance"));
    }

    /**
     * Moves each frame along its own normal by the same distance, as `offset` moves one; their
     * axes keep their directions.
     *
     * Frames facing different ways move different ways: a negative distance moves each against its
     * own normal.
     * @param inputs - The frames and the distance in model units
     * @returns New frames, in the same order
     * @group change
     * @shortname offset frames
     * @drawable true
     * @example
     * ```typescript
     * const ring = bitbybit.frame.polar({ count: 8, radius: 5, angle: 360, startAngle: 0, rotate: true });
     * const raised = bitbybit.frame.offsetFrames({ frames: ring, distance: 2 });
     * ```
     */
    offsetFrames(inputs: Inputs.Frame.OffsetFramesDto): Inputs.Base.Frame[] {
        const resolved = resolveDto(Inputs.Frame.OffsetFramesDto, inputs) as Resolved.Frame.OffsetFramesDto;
        const frames = this.axesOfEach(resolved.frames, "frames");
        const distance = this.numberOf(resolved.distance, "distance");
        return frames.map(axes => this.offsetBy(axes, distance));
    }

    /**
     * Turns a frame about one of its own axes, through its origin.
     *
     * The angle is in degrees; positive is counter-clockwise when that axis points toward you.
     * @param inputs - The frame, the axis to turn about and the angle
     * @returns A new frame
     * @group change
     * @shortname rotate
     * @drawable true
     * @example
     * ```typescript
     * const tilted = bitbybit.frame.rotate({ frame: bitbybit.frame.world(), axis: Bit.Inputs.Frame.frameAxisEnum.x, angle: 30 });
     * ```
     */
    rotate(inputs: Inputs.Frame.RotateDto): Inputs.Base.Frame {
        const resolved = resolveDto(Inputs.Frame.RotateDto, inputs) as Resolved.Frame.RotateDto;
        const axes = this.axesOf(resolved.frame, "frame");
        return this.turned(axes, this.axisOf(resolved.axis), this.math.degToRad({ number: this.numberOf(resolved.angle, "angle") }));
    }

    /**
     * Turns each frame about one of its own axes, through its own origin, as `rotate` turns one.
     *
     * The angle is in degrees; positive is counter-clockwise when that axis points toward you.
     * @param inputs - The frames, the axis to turn each about and the angle
     * @returns New frames, in the same order
     * @group change
     * @shortname rotate frames
     * @drawable true
     * @example
     * ```typescript
     * const row = bitbybit.frame.grid({ countX: 4, countY: 1, spacingX: 2, spacingY: 2, centered: true });
     * const tilted = bitbybit.frame.rotateFrames({ frames: row, axis: Bit.Inputs.Frame.frameAxisEnum.x, angle: 30 });
     * ```
     */
    rotateFrames(inputs: Inputs.Frame.RotateFramesDto): Inputs.Base.Frame[] {
        const resolved = resolveDto(Inputs.Frame.RotateFramesDto, inputs) as Resolved.Frame.RotateFramesDto;
        const frames = this.axesOfEach(resolved.frames, "frames");
        const axis = this.axisOf(resolved.axis);
        const angle = this.math.degToRad({ number: this.numberOf(resolved.angle, "angle") });
        return frames.map(axes => this.turned(axes, axis, angle));
    }

    /**
     * Turns a frame over: its normal points the other way and its Y axis with it, its origin and X
     * axis stay.
     * @param inputs - The frame to turn over
     * @returns A new frame
     * @group change
     * @shortname flip
     * @drawable true
     * @example
     * ```typescript
     * const underside = bitbybit.frame.flip({ frame: bitbybit.frame.zx({ origin: [0, 0, 0] }) });
     * ```
     */
    flip(inputs: Inputs.Frame.FrameDto): Inputs.Base.Frame {
        return this.flipped(this.axesOf(inputs.frame, "frame"));
    }

    /**
     * Turns each frame over, as `flip` turns one: its normal and Y axis point the other way, its
     * origin and X axis stay.
     * @param inputs - The frames to turn over
     * @returns New frames, in the same order
     * @group change
     * @shortname flip frames
     * @drawable true
     * @example
     * ```typescript
     * const tops = bitbybit.frame.grid({ countX: 2, countY: 2, spacingX: 3, spacingY: 3, centered: true });
     * const bottoms = bitbybit.frame.flipFrames({ frames: tops });
     * ```
     */
    flipFrames(inputs: Inputs.Frame.FramesDto): Inputs.Base.Frame[] {
        return this.axesOfEach(inputs.frames, "frames").map(axes => this.flipped(axes));
    }

    /**
     * Places a frame given in another frame's coordinates into the world: a frame within a frame.
     *
     * `child` is read as if `parent` were the world, so a `child` at the origin sits on `parent`
     * and one lifted along Z rises along the parent's normal.
     * @param inputs - The parent frame and the child frame given in its coordinates
     * @returns The child frame in world coordinates
     * @group frame in frame
     * @shortname frame to world
     * @drawable true
     * @example
     * ```typescript
     * const table = bitbybit.frame.zx({ origin: [0, 1, 0] });
     * const onTable = bitbybit.frame.frameToWorld({ parent: table, child: bitbybit.frame.xy({ origin: [0.5, 0.2, 0] }) });
     * ```
     */
    frameToWorld(inputs: Inputs.Frame.ChildFrameDto): Inputs.Base.Frame {
        const parent = this.axesOf(inputs.parent, "parent");
        return this.childToWorld(parent, this.axesOf(inputs.child, "child"));
    }

    /**
     * Places frames given in one parent frame's coordinates into the world, as `frameToWorld`
     * places one: every child sits on `parent` as it would sit on the world.
     * @param inputs - The parent frame and the frames given in its coordinates
     * @returns The frames in world coordinates, in the same order
     * @group frame in frame
     * @shortname frames to world
     * @drawable true
     * @example
     * ```typescript
     * const table = bitbybit.frame.zx({ origin: [0, 1, 0] });
     * const spots = bitbybit.frame.grid({ countX: 3, countY: 2, spacingX: 0.4, spacingY: 0.4, centered: true });
     * const onTable = bitbybit.frame.framesToWorld({ parent: table, children: spots });
     * ```
     */
    framesToWorld(inputs: Inputs.Frame.ChildFramesDto): Inputs.Base.Frame[] {
        const parent = this.axesOf(inputs.parent, "parent");
        return this.axesOfEach(inputs.children, "children").map(child => this.childToWorld(parent, child));
    }

    /**
     * Describes a frame given in world coordinates in another frame's coordinates, the reverse of
     * `frameToWorld`.
     *
     * The result is where `child` sits and how it turns as seen from `parent`, as if `parent` were
     * the world.
     * @param inputs - The parent frame and the child frame in world coordinates
     * @returns The child frame in the parent's coordinates
     * @group frame in frame
     * @shortname frame to local
     * @drawable true
     * @example
     * ```typescript
     * const table = bitbybit.frame.zx({ origin: [0, 1, 0] });
     * const seenFromTable = bitbybit.frame.frameToLocal({ parent: table, child: bitbybit.frame.world() });
     * ```
     */
    frameToLocal(inputs: Inputs.Frame.ChildFrameDto): Inputs.Base.Frame {
        const parent = this.axesOf(inputs.parent, "parent");
        return this.childToLocal(parent, this.axesOf(inputs.child, "child"));
    }

    /**
     * Describes frames given in world coordinates in one parent frame's coordinates, the reverse
     * of `framesToWorld`, as `frameToLocal` describes one.
     * @param inputs - The parent frame and the frames in world coordinates
     * @returns The frames in the parent's coordinates, in the same order
     * @group frame in frame
     * @shortname frames to local
     * @drawable true
     * @example
     * ```typescript
     * const table = bitbybit.frame.zx({ origin: [0, 1, 0] });
     * const seen = bitbybit.frame.framesToLocal({ parent: table, children: [bitbybit.frame.world(), bitbybit.frame.yz({ origin: [2, 0, 0] })] });
     * ```
     */
    framesToLocal(inputs: Inputs.Frame.ChildFramesDto): Inputs.Base.Frame[] {
        const parent = this.axesOf(inputs.parent, "parent");
        return this.axesOfEach(inputs.children, "children").map(child => this.childToLocal(parent, child));
    }

    /**
     * Converts a point given in a frame's coordinates into world coordinates.
     *
     * `[1, 2, 3]` becomes the point 1 along the frame's X axis, 2 along its Y axis and 3 along its
     * normal, from its origin.
     * @param inputs - The frame and the point in its coordinates
     * @returns The point in world coordinates
     * @group coordinates
     * @shortname point to world
     * @drawable true
     * @example
     * ```typescript
     * const corner = bitbybit.frame.pointToWorld({ frame: bitbybit.frame.zx({ origin: [0, 2, 0] }), point: [1, 1, 0] });
     * ```
     */
    pointToWorld(inputs: Inputs.Frame.FramePointDto): Inputs.Base.Point3 {
        const axes = this.axesOf(inputs.frame, "frame");
        return this.vector.add({ first: axes.origin, second: this.along(axes, ...this.pointOf(inputs.point, "point")) }) as Vec3;
    }

    /**
     * Converts a point given in world coordinates into a frame's coordinates, the reverse of
     * `pointToWorld`.
     *
     * The third coordinate of the result is the point's signed distance from the frame's plane.
     * @param inputs - The frame and the point in world coordinates
     * @returns The point in the frame's coordinates
     * @group coordinates
     * @shortname point to local
     * @drawable true
     * @example
     * ```typescript
     * const local = bitbybit.frame.pointToLocal({ frame: bitbybit.frame.zx({ origin: [0, 2, 0] }), point: [1, 5, 1] });
     * ```
     */
    pointToLocal(inputs: Inputs.Frame.FramePointDto): Inputs.Base.Point3 {
        const axes = this.axesOf(inputs.frame, "frame");
        return this.against(axes, this.vector.sub({ first: this.pointOf(inputs.point, "point"), second: axes.origin }) as Vec3);
    }

    /**
     * Converts points given in a frame's coordinates into world coordinates, as `pointToWorld` does
     * for one.
     * @param inputs - The frame and the points in its coordinates
     * @returns The points in world coordinates, in the same order
     * @group coordinates
     * @shortname points to world
     * @drawable true
     * @example
     * ```typescript
     * const square = bitbybit.frame.pointsToWorld({ frame: bitbybit.frame.yz({ origin: [3, 0, 0] }), points: [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0]] });
     * ```
     */
    pointsToWorld(inputs: Inputs.Frame.FramePointsDto): Inputs.Base.Point3[] {
        const axes = this.axesOf(inputs.frame, "frame");
        return this.pointsOf(inputs.points, "points").map(point => this.vector.add({ first: axes.origin, second: this.along(axes, ...point) }) as Vec3);
    }

    /**
     * Converts points given in world coordinates into a frame's coordinates, as `pointToLocal` does
     * for one.
     * @param inputs - The frame and the points in world coordinates
     * @returns The points in the frame's coordinates, in the same order
     * @group coordinates
     * @shortname points to local
     * @drawable true
     * @example
     * ```typescript
     * const flat = bitbybit.frame.pointsToLocal({ frame: bitbybit.frame.yz({ origin: [3, 0, 0] }), points: [[3, 0, 0], [3, 1, 0], [3, 1, 1]] });
     * ```
     */
    pointsToLocal(inputs: Inputs.Frame.FramePointsDto): Inputs.Base.Point3[] {
        const axes = this.axesOf(inputs.frame, "frame");
        return this.pointsOf(inputs.points, "points").map(point => this.against(axes, this.vector.sub({ first: point, second: axes.origin }) as Vec3));
    }

    /**
     * Turns a vector given along a frame's axes into one along the world axes; the frame's origin
     * plays no part.
     * @param inputs - The frame and the vector along its axes
     * @returns The vector along the world axes
     * @group coordinates
     * @shortname vector to world
     * @drawable false
     * @example
     * ```typescript
     * const up = bitbybit.frame.vectorToWorld({ frame: bitbybit.frame.zx({ origin: [0, 0, 0] }), vector: [0, 0, 1] });
     * ```
     */
    vectorToWorld(inputs: Inputs.Frame.FrameVectorDto): Inputs.Base.Vector3 {
        return this.along(this.axesOf(inputs.frame, "frame"), ...this.vectorOf(inputs.vector, "vector"));
    }

    /**
     * Turns a vector given along the world axes into one along a frame's axes, the reverse of
     * `vectorToWorld`.
     * @param inputs - The frame and the vector along the world axes
     * @returns The vector along the frame's axes
     * @group coordinates
     * @shortname vector to local
     * @drawable false
     * @example
     * ```typescript
     * const local = bitbybit.frame.vectorToLocal({ frame: bitbybit.frame.zx({ origin: [0, 0, 0] }), vector: [0, 1, 0] });
     * ```
     */
    vectorToLocal(inputs: Inputs.Frame.FrameVectorDto): Inputs.Base.Vector3 {
        return this.against(this.axesOf(inputs.frame, "frame"), this.vectorOf(inputs.vector, "vector"));
    }

    /**
     * Gives the transformation that moves anything from the world frame onto a frame.
     *
     * It takes the world origin to the frame's origin and the world axes to the frame's axes, and
     * comes as a list holding one matrix, the form every transformation input takes.
     * @param inputs - The frame
     * @returns The transformation onto the frame
     * @group matrices
     * @shortname to matrix
     * @drawable false
     * @example
     * ```typescript
     * const onFrame = bitbybit.frame.toMatrix({ frame: bitbybit.frame.zx({ origin: [0, 2, 0] }) });
     * const moved = bitbybit.point.transformPoints({ points: [[1, 0, 0]], transformation: onFrame });
     * ```
     */
    toMatrix(inputs: Inputs.Frame.FrameDto): Inputs.Base.TransformMatrixes {
        return [this.matrixBetween(WORLD, this.axesOf(inputs.frame, "frame"))];
    }

    /**
     * Reads the frame a transformation puts the world frame on: where it moves the world origin
     * and where it turns the world X and Z axes.
     *
     * Scaling is dropped, a shear keeps the Z axis and squares X to it, and a mirror keeps X and Z
     * with the Y axis that follows from them. A perspective part throws.
     * @param inputs - The transformation
     * @returns A new frame
     * @group matrices
     * @shortname from matrix
     * @drawable true
     * @example
     * ```typescript
     * const turned = bitbybit.transforms.rotationCenterAxis({ center: [0, 0, 0], axis: [0, 1, 0], angle: 45 });
     * const frame = bitbybit.frame.fromMatrix({ transformation: turned });
     * ```
     */
    fromMatrix(inputs: Inputs.Frame.TransformationDto): Inputs.Base.Frame {
        const transformation = inputs.transformation as unknown;
        if (!Array.isArray(transformation) || transformation.length === 0) {
            throw new InputError("`transformation` is not a transformation: it needs a matrix of sixteen numbers, or a list of them.", "transformation");
        }
        const matrices = transformation.every(entry => typeof entry === "number")
            ? [transformation as Inputs.Base.TransformMatrix]
            : transformation as Inputs.Base.TransformMatrixes;
        const flat = this.geometryHelper.getFlatTransformations(matrices);
        if (!flat.every(matrix => Array.isArray(matrix) && matrix.length === 16 && matrix.every(n => typeof n === "number" && Number.isFinite(n)))) {
            throw new InputError("`transformation` is not a transformation: every matrix needs sixteen finite numbers.", "transformation");
        }
        const projective = flat.findIndex(matrix => Math.abs(matrix[3]) > 1e-9 || Math.abs(matrix[7]) > 1e-9 || Math.abs(matrix[11]) > 1e-9 || Math.abs(matrix[15] - 1) > 1e-9);
        if (projective !== -1) {
            throw new InputError(`\`transformation\` has a perspective part: the bottom row of matrix ${projective} is not 0, 0, 0, 1, so no frame follows from it.`, "transformation");
        }
        const combined = composed(flat);
        const flattened = "`transformation` flattens the X or the Z axis, so no frame follows from it.";
        return this.frameOf(this.squared(
            [combined[12], combined[13], combined[14]],
            [combined[8], combined[9], combined[10]],
            [combined[0], combined[1], combined[2]],
            { normal: flattened, direction: flattened, property: "transformation" }));
    }

    /**
     * Gives the transformation that carries anything placed on one frame onto another, turning it
     * the same way.
     *
     * Left out, `from` is the world frame, which makes this `toMatrix` of `to`. The result is a list
     * holding one matrix.
     * @param inputs - The frame to move onto and the frame to move from
     * @returns The transformation from `from` onto `to`
     * @group matrices
     * @shortname matrix from to
     * @drawable false
     * @example
     * ```typescript
     * const from = bitbybit.frame.xy({ origin: [0, 0, 0] });
     * const to = bitbybit.frame.zx({ origin: [0, 3, 0] });
     * const carry = bitbybit.frame.matrixFromTo({ to, from });
     * ```
     */
    matrixFromTo(inputs: Inputs.Frame.FromToDto): Inputs.Base.TransformMatrixes {
        const from = inputs.from === undefined ? WORLD : this.axesOf(inputs.from, "from");
        return [this.matrixBetween(from, this.axesOf(inputs.to, "to"))];
    }

    /**
     * Lays out a rectangular grid of frames in a frame's plane, each turned the same way as that
     * frame.
     *
     * The frames come row by row, along X first. Left out, `frame` is the world frame, so the grid
     * lies in the XY plane.
     * @param inputs - The frame to follow, the counts and spacings, and whether to center the grid
     * @returns The frames of the grid
     * @group patterns
     * @shortname grid
     * @drawable true
     * @example
     * ```typescript
     * const spots = bitbybit.frame.grid({ frame: bitbybit.frame.zx({ origin: [0, 0, 0] }), countX: 4, countY: 3, spacingX: 2, spacingY: 2, centered: true });
     * ```
     */
    grid(inputs: Inputs.Frame.GridDto): Inputs.Base.Frame[] {
        const resolved = resolveDto(Inputs.Frame.GridDto, inputs) as Resolved.Frame.GridDto;
        const axes = resolved.frame === undefined ? WORLD : this.axesOf(resolved.frame, "frame");
        const countX = this.countOf(resolved.countX, "countX");
        const countY = this.countOf(resolved.countY, "countY");
        const spacingX = this.numberOf(resolved.spacingX, "spacingX");
        const spacingY = this.numberOf(resolved.spacingY, "spacingY");
        const shiftX = resolved.centered ? (countX - 1) * spacingX / 2 : 0;
        const shiftY = resolved.centered ? (countY - 1) * spacingY / 2 : 0;
        const frames: Inputs.Base.Frame[] = [];
        for (let row = 0; row < countY; row++) {
            for (let column = 0; column < countX; column++) {
                frames.push(this.frameOf({ ...axes, origin: this.vector.add({ first: axes.origin, second: this.along(axes, column * spacingX - shiftX, row * spacingY - shiftY, 0) }) as Vec3 }));
            }
        }
        return frames;
    }

    /**
     * Lays out a ring of frames around a frame's normal, in its plane.
     *
     * Each is `frame` turned by its angle about the normal and moved out by `radius` along its
     * turned X axis. A full turn spaces them evenly, a smaller `angle` puts one at each end, and a
     * larger one throws. Left out, `frame` is the world frame.
     * @param inputs - The frame to turn around, the count, radius, angles and whether frames turn
     * @returns The frames of the ring, in the direction of the angle
     * @group patterns
     * @shortname polar
     * @drawable true
     * @example
     * ```typescript
     * const bolts = bitbybit.frame.polar({ frame: bitbybit.frame.zx({ origin: [0, 0, 0] }), count: 8, radius: 5, angle: 360, startAngle: 0, rotate: true });
     * ```
     */
    polar(inputs: Inputs.Frame.PolarDto): Inputs.Base.Frame[] {
        const resolved = resolveDto(Inputs.Frame.PolarDto, inputs) as Resolved.Frame.PolarDto;
        const axes = resolved.frame === undefined ? WORLD : this.axesOf(resolved.frame, "frame");
        const count = this.countOf(resolved.count, "count");
        const radius = this.numberOf(resolved.radius, "radius");
        if (radius < 0) {
            throw new InputError("`radius` is negative; a ring needs a radius of zero or more.", "radius");
        }
        const sweep = this.numberOf(resolved.angle, "angle");
        if (Math.abs(sweep) > 360) {
            throw new InputError(`\`angle\` is ${sweep}, beyond a full turn, where frames would land on each other; it must lie within -360 and 360.`, "angle");
        }
        const start = this.numberOf(resolved.startAngle, "startAngle");
        const step = Math.abs(sweep) === 360 ? sweep / count : count > 1 ? sweep / (count - 1) : 0;
        const frames: Inputs.Base.Frame[] = [];
        for (let i = 0; i < count; i++) {
            const angle = this.math.degToRad({ number: start + i * step });
            const outward = this.combined(axes.x, Math.cos(angle), axes.y, Math.sin(angle));
            const origin = this.vector.add({ first: axes.origin, second: this.vector.mul({ vector: outward, scalar: radius }) }) as Vec3;
            frames.push(this.frameOf(resolved.rotate
                ? { origin, x: outward, y: this.vector.cross({ first: axes.z, second: outward }) as Vec3, z: axes.z }
                : { ...axes, origin }));
        }
        return frames;
    }

    /**
     * Lays out a honeycomb of frames in a frame's plane, one at each hexagon's center, turned as
     * that frame is.
     *
     * The hexagons have corners toward the frame's Y axis and flat sides toward X. Rows run along X,
     * every second shifted by half a hexagon, and frames come row by row. Left out, `frame` is the
     * world frame.
     * @param inputs - The frame to follow, the counts, the hexagon size and whether to center it
     * @returns The frames of the honeycomb
     * @group patterns
     * @shortname hex grid
     * @drawable true
     * @example
     * ```typescript
     * const cells = bitbybit.frame.hexGrid({ frame: bitbybit.frame.zx({ origin: [0, 0, 0] }), countX: 5, countY: 4, radius: 1, centered: true });
     * ```
     */
    hexGrid(inputs: Inputs.Frame.HexGridDto): Inputs.Base.Frame[] {
        const resolved = resolveDto(Inputs.Frame.HexGridDto, inputs) as Resolved.Frame.HexGridDto;
        const axes = resolved.frame === undefined ? WORLD : this.axesOf(resolved.frame, "frame");
        const countX = this.countOf(resolved.countX, "countX");
        const countY = this.countOf(resolved.countY, "countY");
        const radius = this.numberOf(resolved.radius, "radius");
        if (!(radius > 0)) {
            throw new InputError("`radius` must be more than zero for the hexagons to have a size.", "radius");
        }
        const columnSpacing = Math.sqrt(3) * radius;
        const rowSpacing = 1.5 * radius;
        const shiftU = resolved.centered ? ((countX - 1) * columnSpacing + (countY > 1 ? columnSpacing / 2 : 0)) / 2 : 0;
        const shiftV = resolved.centered ? (countY - 1) * rowSpacing / 2 : 0;
        const frames: Inputs.Base.Frame[] = [];
        for (let row = 0; row < countY; row++) {
            for (let column = 0; column < countX; column++) {
                const u = column * columnSpacing + (row % 2 === 1 ? columnSpacing / 2 : 0);
                frames.push(this.frameOf({ ...axes, origin: this.vector.add({ first: axes.origin, second: this.along(axes, u - shiftU, row * rowSpacing - shiftV, 0) }) as Vec3 }));
            }
        }
        return frames;
    }

    /**
     * The widest spread's axis, pointing toward the first point, or with its largest component
     * positive when the first point lies across it.
     * @ignore true
     */
    private alongWidest(widest: Vec3, first: Vec3, spread: number): Vec3 {
        const toFirst = this.vector.dot({ first, second: widest });
        if (!(Math.abs(toFirst) > 1e-9 * Math.sqrt(spread))) {
            return this.withLargestPositive(widest);
        }
        return toFirst < 0 ? this.vector.neg({ vector: widest }) as Vec3 : widest;
    }

    /**
     * Where the first point lies from the center, in the fitted plane, or the next point that does
     * not sit on the center: the X axis of points that spread evenly every way in their plane.
     * @ignore true
     */
    private towardFirstPoint(offsets: readonly Vec3[], normal: Vec3, spread: number): Vec3 | undefined {
        return offsets
            .map(offset => this.vector.sub({ first: offset, second: this.vector.mul({ vector: normal, scalar: this.vector.dot({ first: offset, second: normal }) }) }) as Vec3)
            .find(inPlane => this.vector.length({ vector: inPlane }) > 1e-9 * Math.sqrt(spread));
    }

    /**
     * @ignore true
     */
    private translated(axes: Axes, translation: Vec3): Inputs.Base.Frame {
        return this.frameOf({ ...axes, origin: this.vector.add({ first: axes.origin, second: translation }) as Vec3 });
    }

    /**
     * @ignore true
     */
    private offsetBy(axes: Axes, distance: number): Inputs.Base.Frame {
        return this.frameOf({ ...axes, origin: this.vector.add({ first: axes.origin, second: this.vector.mul({ vector: axes.z, scalar: distance }) }) as Vec3 });
    }

    /**
     * The axes turned about one of their own by `angle` radians, through their origin.
     * @ignore true
     */
    private turned(axes: Axes, axis: Inputs.Frame.frameAxisEnum, angle: number): Inputs.Base.Frame {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const turn = (first: Vec3, second: Vec3): [Vec3, Vec3] => [this.combined(first, c, second, s), this.combined(first, -s, second, c)];
        switch (axis) {
            case Inputs.Frame.frameAxisEnum.x: {
                const [y, z] = turn(axes.y, axes.z);
                return this.frameOf({ origin: axes.origin, x: axes.x, y, z });
            }
            case Inputs.Frame.frameAxisEnum.y: {
                const [z, x] = turn(axes.z, axes.x);
                return this.frameOf({ origin: axes.origin, x, y: axes.y, z });
            }
            default: {
                const [x, y] = turn(axes.x, axes.y);
                return this.frameOf({ origin: axes.origin, x, y, z: axes.z });
            }
        }
    }

    /**
     * @ignore true
     */
    private flipped(axes: Axes): Inputs.Base.Frame {
        return this.frameOf({ origin: axes.origin, x: axes.x, y: this.vector.neg({ vector: axes.y }) as Vec3, z: this.vector.neg({ vector: axes.z }) as Vec3 });
    }

    /**
     * @ignore true
     */
    private childToWorld(parent: Axes, child: Axes): Inputs.Base.Frame {
        return this.frameOf({
            origin: this.vector.add({ first: parent.origin, second: this.along(parent, ...child.origin) }) as Vec3,
            x: this.along(parent, ...child.x),
            y: this.along(parent, ...child.y),
            z: this.along(parent, ...child.z),
        });
    }

    /**
     * @ignore true
     */
    private childToLocal(parent: Axes, child: Axes): Inputs.Base.Frame {
        return this.frameOf({
            origin: this.against(parent, this.vector.sub({ first: child.origin, second: parent.origin }) as Vec3),
            x: this.against(parent, child.x),
            y: this.against(parent, child.y),
            z: this.against(parent, child.z),
        });
    }

    /**
     * The vector `u` along `x`, `v` along `y` and `w` along `z` of the axes, from their origin.
     * @ignore true
     */
    private along(axes: Axes, u: number, v: number, w: number): Vec3 {
        return this.vector.add({ first: this.combined(axes.x, u, axes.y, v), second: this.vector.mul({ vector: axes.z, scalar: w }) }) as Vec3;
    }

    /**
     * The same vector read against the axes: its components along `x`, `y` and `z`.
     * @ignore true
     */
    private against(axes: Axes, vector: Vec3): Vec3 {
        return [this.vector.dot({ first: vector, second: axes.x }), this.vector.dot({ first: vector, second: axes.y }), this.vector.dot({ first: vector, second: axes.z })];
    }

    /**
     * `first` scaled by `a` plus `second` scaled by `b`.
     * @ignore true
     */
    private combined(first: Vec3, a: number, second: Vec3, b: number): Vec3 {
        return this.vector.add({ first: this.vector.mul({ vector: first, scalar: a }), second: this.vector.mul({ vector: second, scalar: b }) }) as Vec3;
    }

    /**
     * Flips a unit vector whose largest component is negative, so a sign the data leaves open is
     * decided the same way every time. Components within 1e-12 of each other count as equal and the
     * first of them decides, so rounding cannot tip the choice; OCCT's frames break the tie the
     * same way.
     * @ignore true
     */
    private withLargestPositive(vector: Vec3): Vec3 {
        let largest = 0;
        for (let i = 1; i < 3; i++) {
            if (Math.abs(vector[i]!) > Math.abs(vector[largest]!) + 1e-12) {
                largest = i;
            }
        }
        return vector[largest]! < 0 ? this.vector.neg({ vector }) as Vec3 : vector;
    }

    /**
     * The column-major matrix carrying the `from` axes onto the `to` axes.
     * @ignore true
     */
    private matrixBetween(from: Axes, to: Axes): Inputs.Base.TransformMatrix {
        const columns = [0, 1, 2].map(i => this.along(to, from.x[i]!, from.y[i]!, from.z[i]!));
        const origin = this.vector.add({ first: to.origin, second: this.along(to, ...this.vector.neg({ vector: this.against(from, from.origin) }) as Vec3) }) as Vec3;
        return [
            ...columns[0]!, 0,
            ...columns[1]!, 0,
            ...columns[2]!, 0,
            ...origin, 1,
        ] as Inputs.Base.TransformMatrix;
    }

    /**
     * The axes of a frame a caller handed in, squared, or an error naming the input at fault.
     * @ignore true
     */
    private axesOf(frame: unknown, property: string, subject = `\`${property}\``): Axes {
        if (!isFrameShaped(frame)) {
            throw new InputError(`${subject} is not a frame: it needs \`origin\`, \`normal\` and \`direction\`, three finite numbers each.`, property);
        }
        return this.squared(frame.origin, frame.normal, frame.direction, {
            normal: `${subject} is not a frame: its \`normal\` has no length.`,
            direction: `${subject} is not a frame: its \`direction\` runs along its \`normal\` or has no length.`,
            property,
        });
    }

    /**
     * The axes of every frame in a list a caller handed in, or an error naming the list and the
     * position at fault.
     * @ignore true
     */
    private axesOfEach(frames: unknown, property: string): Axes[] {
        if (!Array.isArray(frames)) {
            throw new InputError(`\`${property}\` is not a list of frames.`, property);
        }
        return frames.map((frame, index) => this.axesOf(frame, property, `\`${property}\` at position ${index}`));
    }

    /**
     * @ignore true
     */
    private axisOf(axis: unknown): Inputs.Frame.frameAxisEnum {
        if (axis !== Inputs.Frame.frameAxisEnum.x && axis !== Inputs.Frame.frameAxisEnum.y && axis !== Inputs.Frame.frameAxisEnum.z) {
            throw new InputError(`\`axis\` must be x, y or z; it is ${String(axis)}.`, "axis");
        }
        return axis;
    }

    /**
     * An origin with a unit normal and a unit X axis square to it, or an error with the message for
     * the part that cannot be squared, naming `property`, or that part when none is given.
     * @ignore true
     */
    private squared(origin: Vec3, normal: Vec3, direction: Vec3, faults: { normal: string, direction: string, property?: string }): Axes {
        const axes = squareFrame(origin, normal, direction);
        if (typeof axes === "string") {
            throw new InputError(faults[axes], faults.property ?? axes);
        }
        return axes;
    }

    /**
     * The frame the axes describe, as new arrays.
     * @ignore true
     */
    private frameOf(axes: Axes): Inputs.Base.Frame {
        return { origin: [...axes.origin], normal: [...axes.z], direction: [...axes.x] };
    }

    /**
     * @ignore true
     */
    private pointOf(value: unknown, property: string): Vec3 {
        if (!isTriple(value)) {
            throw new InputError(`\`${property}\` is not a point: it needs three finite numbers.`, property);
        }
        return [...value];
    }

    /**
     * @ignore true
     */
    private vectorOf(value: unknown, property: string): Vec3 {
        if (!isTriple(value)) {
            throw new InputError(`\`${property}\` is not a vector: it needs three finite numbers.`, property);
        }
        return [...value];
    }

    /**
     * @ignore true
     */
    private pointsOf(value: unknown, property: string): Vec3[] {
        if (!Array.isArray(value)) {
            throw new InputError(`\`${property}\` is not a list of points.`, property);
        }
        const faulty = value.findIndex(point => !isTriple(point));
        if (faulty !== -1) {
            throw new InputError(`\`${property}\` holds something other than a point at position ${faulty}; each point needs three finite numbers.`, property);
        }
        return value.map(point => [...point as Vec3]);
    }

    /**
     * @ignore true
     */
    private numberOf(value: unknown, property: string): number {
        if (typeof value !== "number" || !Number.isFinite(value)) {
            throw new InputError(`\`${property}\` is not a finite number.`, property);
        }
        return value;
    }

    /**
     * @ignore true
     */
    private countOf(value: unknown, property: string): number {
        if (typeof value !== "number" || !Number.isInteger(value) || value < 1) {
            throw new InputError(`\`${property}\` must be a whole number of at least 1.`, property);
        }
        return value;
    }
}
