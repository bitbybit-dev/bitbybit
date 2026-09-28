import * as Inputs from "../inputs";
import { InputError, resolveDto } from "../kernel-calls";
import * as Resolved from "../resolved-inputs";
import { GeometryHelper } from "./geometry-helper";
import { FrameAxes, isFrameShaped, isTriple, PARALLEL_SINE, squareFrame, unitOf } from "./helpers/frame-axes";

type Vec3 = Inputs.Base.Vector3;
type Axes = FrameAxes;

const WORLD: Axes = { origin: [0, 0, 0], x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] };

const dot = (a: Vec3, b: Vec3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const scaled = (a: Vec3, s: number): Vec3 => [a[0] * s, a[1] * s, a[2] * s];
const added = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const subtracted = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const lengthOf = (a: Vec3): number => Math.hypot(a[0], a[1], a[2]);
const negated = (a: Vec3): Vec3 => [-a[0], -a[1], -a[2]];
const radians = (degrees: number): number => degrees * Math.PI / 180;

/** The vector `u` along `x`, `v` along `y` and `w` along `z` of the axes, from their origin. */
const along = (axes: Axes, u: number, v: number, w: number): Vec3 => [
    u * axes.x[0] + v * axes.y[0] + w * axes.z[0],
    u * axes.x[1] + v * axes.y[1] + w * axes.z[1],
    u * axes.x[2] + v * axes.y[2] + w * axes.z[2],
];

/** The same vector read against the axes: its components along `x`, `y` and `z`. */
const against = (axes: Axes, vector: Vec3): Vec3 => [dot(vector, axes.x), dot(vector, axes.y), dot(vector, axes.z)];

/**
 * Flips a unit vector whose largest component is negative, so a sign the data leaves open is decided
 * the same way every time. Components within 1e-12 of each other count as equal and the first of
 * them decides, so rounding cannot tip the choice; OCCT's frames break the tie the same way.
 */
const withLargestPositive = (vector: Vec3): Vec3 => {
    let largest = 0;
    for (let i = 1; i < 3; i++) {
        if (Math.abs(vector[i]!) > Math.abs(vector[largest]!) + 1e-12) {
            largest = i;
        }
    }
    return vector[largest]! < 0 ? negated(vector) : vector;
};

/** The largest absolute coordinate in a list of vectors, by a loop, so a long list cannot overflow the call stack. */
const reachOf = (vectors: readonly Vec3[]): number => {
    let reach = 0;
    for (const vector of vectors) {
        reach = Math.max(reach, Math.abs(vector[0]), Math.abs(vector[1]), Math.abs(vector[2]));
    }
    return reach;
};

/** The product of two column-major 4 x 4 matrices: `first` applied, then `second`. */
const followedBy = (first: readonly number[], second: readonly number[]): number[] =>
    Array.from({ length: 16 }, (_, index) => {
        const column = Math.floor(index / 4);
        const row = index % 4;
        return second[row]! * first[column * 4]! + second[4 + row]! * first[column * 4 + 1]!
            + second[8 + row]! * first[column * 4 + 2]! + second[12 + row]! * first[column * 4 + 3]!;
    });

/**
 * The eigenvalues of a symmetric 3 x 3 matrix, largest first, each with its unit eigenvector, by
 * cyclic Jacobi rotations; the vectors come out at right angles to each other.
 */
const symmetricEigen = (matrix: number[][]): { value: number, vector: Vec3 }[] => {
    let a = matrix.map(row => [...row]);
    let v = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
    const multiply = (p: number[][], q: number[][]): number[][] =>
        p.map((row, i) => q[0]!.map((_, j) => row.reduce((total, _unused, k) => total + p[i]![k]! * q[k]![j]!, 0)));
    const transpose = (p: number[][]): number[][] => p[0]!.map((_, j) => p.map(row => row[j]!));
    const size = a.flat().reduce((total, entry) => total + entry * entry, 0);
    for (let sweep = 0; sweep < 64; sweep++) {
        const off = a[0]![1]! ** 2 + a[0]![2]! ** 2 + a[1]![2]! ** 2;
        if (off <= 1e-30 * size) {
            break;
        }
        for (const [p, q] of [[0, 1], [0, 2], [1, 2]] as const) {
            const apq = a[p]![q]!;
            if (apq === 0) {
                continue;
            }
            const theta = (a[q]![q]! - a[p]![p]!) / (2 * apq);
            const t = (theta >= 0 ? 1 : -1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1));
            const c = 1 / Math.sqrt(t * t + 1);
            const s = t * c;
            const rotation = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
            rotation[p]![p] = c;
            rotation[q]![q] = c;
            rotation[p]![q] = s;
            rotation[q]![p] = -s;
            a = multiply(transpose(rotation), multiply(a, rotation));
            v = multiply(v, rotation);
        }
    }
    return [0, 1, 2]
        .map(k => ({ value: a[k]![k]!, vector: [v[0]![k]!, v[1]![k]!, v[2]![k]!] as Vec3 }))
        .sort((first, second) => second.value - first.value);
};

/**
 * Frames: a frame is a point with three axes at right angles, written as its `origin`, its `normal`
 * (the Z axis) and its `direction` (the X axis), the Y axis following from those two. Frames place
 * things: a shape lands on one, points convert between one and the world, and frame patterns lay
 * out copies. Every method returns new values and never changes its inputs.
 */
export class Frame {

    constructor(private readonly geometryHelper: GeometryHelper) { }

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
        const toX = unitOf(subtracted(this.pointOf(resolved.xPoint, "xPoint"), origin));
        if (toX === undefined) {
            throw new InputError("`xPoint` is at `origin`, so it gives the X axis no direction.", "xPoint");
        }
        const toPlane = unitOf(subtracted(this.pointOf(resolved.planePoint, "planePoint"), origin));
        const normal = toPlane === undefined ? undefined : cross(toX, toPlane);
        if (normal === undefined || !(lengthOf(normal) > PARALLEL_SINE)) {
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
        const center = points.reduce<Vec3>((total, point) => added(total, scaled(point, 1 / points.length)), [0, 0, 0]);
        const reach = reachOf(points.map(point => subtracted(point, center)));
        if (!(reach > 0 && reach < Infinity)) {
            throw new InputError("`points` all lie at one point, so no plane fits them.", "points");
        }
        const offsets = points.map(point => scaled(subtracted(point, center), 1 / reach));
        const covariance = [0, 1, 2].map(i => [0, 1, 2].map(j => offsets.reduce((total, offset) => total + offset[i]! * offset[j]!, 0)));
        const [widest, middle, flattest] = symmetricEigen(covariance);
        if (!(middle!.value > 1e-12 * widest!.value)) {
            throw new InputError("`points` lie on one line, or so near one that their spread across it is under a millionth of their spread along it, so no plane fits them reliably.", "points");
        }
        const spread = offsets.reduce((total, offset) => total + dot(offset, offset), 0);
        const turning = offsets.reduce<Vec3>((total, offset, i) => added(total, cross(offset, offsets[(i + 1) % offsets.length]!)), [0, 0, 0]);
        const turn = dot(turning, flattest!.vector);
        const normal = Math.abs(turn) > 1e-9 * spread ? (turn < 0 ? negated(flattest!.vector) : flattest!.vector) : withLargestPositive(flattest!.vector);
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
        return this.frameOf({ ...axes, origin: added(axes.origin, this.vectorOf(resolved.translation, "translation")) });
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
        return this.frameOf({ ...axes, origin: added(axes.origin, scaled(axes.z, this.numberOf(resolved.distance, "distance"))) });
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
        const angle = radians(this.numberOf(resolved.angle, "angle"));
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const turn = (first: Vec3, second: Vec3): [Vec3, Vec3] => [added(scaled(first, c), scaled(second, s)), added(scaled(first, -s), scaled(second, c))];
        switch (resolved.axis) {
            case Inputs.Frame.frameAxisEnum.x: {
                const [y, z] = turn(axes.y, axes.z);
                return this.frameOf({ origin: axes.origin, x: axes.x, y, z });
            }
            case Inputs.Frame.frameAxisEnum.y: {
                const [z, x] = turn(axes.z, axes.x);
                return this.frameOf({ origin: axes.origin, x, y: axes.y, z });
            }
            case Inputs.Frame.frameAxisEnum.z: {
                const [x, y] = turn(axes.x, axes.y);
                return this.frameOf({ origin: axes.origin, x, y, z: axes.z });
            }
            default:
                throw new InputError(`\`axis\` must be x, y or z; it is ${String(resolved.axis)}.`, "axis");
        }
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
        const axes = this.axesOf(inputs.frame, "frame");
        return this.frameOf({ origin: axes.origin, x: axes.x, y: negated(axes.y), z: negated(axes.z) });
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
        const child = this.axesOf(inputs.child, "child");
        return this.frameOf({
            origin: added(parent.origin, along(parent, ...child.origin)),
            x: along(parent, ...child.x),
            y: along(parent, ...child.y),
            z: along(parent, ...child.z),
        });
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
        const child = this.axesOf(inputs.child, "child");
        return this.frameOf({
            origin: against(parent, subtracted(child.origin, parent.origin)),
            x: against(parent, child.x),
            y: against(parent, child.y),
            z: against(parent, child.z),
        });
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
        return added(axes.origin, along(axes, ...this.pointOf(inputs.point, "point")));
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
        return against(axes, subtracted(this.pointOf(inputs.point, "point"), axes.origin));
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
        return this.pointsOf(inputs.points, "points").map(point => added(axes.origin, along(axes, ...point)));
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
        return this.pointsOf(inputs.points, "points").map(point => against(axes, subtracted(point, axes.origin)));
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
        return along(this.axesOf(inputs.frame, "frame"), ...this.vectorOf(inputs.vector, "vector"));
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
        return against(this.axesOf(inputs.frame, "frame"), this.vectorOf(inputs.vector, "vector"));
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
        const combined = flat.reduce<number[]>((total, matrix) => followedBy(total, matrix), [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
        const flattened = "`transformation` flattens the X or the Z axis, so no frame follows from it.";
        return this.frameOf(this.squared(
            [combined[12]!, combined[13]!, combined[14]!],
            [combined[8]!, combined[9]!, combined[10]!],
            [combined[0]!, combined[1]!, combined[2]!],
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
                frames.push(this.frameOf({ ...axes, origin: added(axes.origin, along(axes, column * spacingX - shiftX, row * spacingY - shiftY, 0)) }));
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
            const angle = radians(start + i * step);
            const outward = added(scaled(axes.x, Math.cos(angle)), scaled(axes.y, Math.sin(angle)));
            const origin = added(axes.origin, scaled(outward, radius));
            frames.push(this.frameOf(resolved.rotate
                ? { origin, x: outward, y: cross(axes.z, outward), z: axes.z }
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
                frames.push(this.frameOf({ ...axes, origin: added(axes.origin, along(axes, u - shiftU, row * rowSpacing - shiftV, 0)) }));
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
        const toFirst = dot(first, widest);
        if (!(Math.abs(toFirst) > 1e-9 * Math.sqrt(spread))) {
            return withLargestPositive(widest);
        }
        return toFirst < 0 ? negated(widest) : widest;
    }

    /**
     * Where the first point lies from the center, in the fitted plane, or the next point that does
     * not sit on the center: the X axis of points that spread evenly every way in their plane.
     * @ignore true
     */
    private towardFirstPoint(offsets: readonly Vec3[], normal: Vec3, spread: number): Vec3 | undefined {
        return offsets
            .map(offset => subtracted(offset, scaled(normal, dot(offset, normal))))
            .find(inPlane => lengthOf(inPlane) > 1e-9 * Math.sqrt(spread));
    }

    /**
     * The column-major matrix carrying the `from` axes onto the `to` axes.
     * @ignore true
     */
    private matrixBetween(from: Axes, to: Axes): Inputs.Base.TransformMatrix {
        const columns = [0, 1, 2].map(i => along(to, from.x[i]!, from.y[i]!, from.z[i]!));
        const origin = added(to.origin, along(to, ...negated(against(from, from.origin))));
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
    private axesOf(frame: unknown, property: string): Axes {
        if (!isFrameShaped(frame)) {
            throw new InputError(`\`${property}\` is not a frame: it needs \`origin\`, \`normal\` and \`direction\`, three finite numbers each.`, property);
        }
        return this.squared(frame.origin, frame.normal, frame.direction, {
            normal: `\`${property}\` is not a frame: its \`normal\` has no length.`,
            direction: `\`${property}\` is not a frame: its \`direction\` runs along its \`normal\` or has no length.`,
            property,
        });
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
