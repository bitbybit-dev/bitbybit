/* eslint-disable @typescript-eslint/no-namespace */
import { Base } from "./base-inputs";

/**
 * Parameters for frames: the origin, normal and direction a frame is built from, the frames, points
 * and vectors converted between a frame and the world, and the counts and spacings of frame
 * patterns. A frame is a point with three axes at right angles, and it places things.
 */
export namespace Frame {

    /**
     * One of a frame's own axes: `x` runs along its `direction`, `z` along its `normal` and `y`
     * across both. Used by `frame.rotate`.
     */
    export enum frameAxisEnum {
        x = "x",
        y = "y",
        z = "z",
    }

    /**
     * Where `frame.create` puts a frame, where its Z axis points and roughly where its X axis
     * points; the X axis is turned square to the normal.
     */
    export class CreateFrameDto {
        constructor(origin?: Base.Point3, normal?: Base.Vector3, direction?: Base.Vector3) {
            if (origin !== undefined) { this.origin = origin; }
            if (normal !== undefined) { this.normal = normal; }
            if (direction !== undefined) { this.direction = direction; }
        }
        /**
         * Where the frame sits.
         * @default [0, 0, 0]
         */
        origin?: Base.Point3 | undefined = [0, 0, 0];
        /**
         * Where the Z axis points; any length but zero.
         * @default [0, 0, 1]
         */
        normal?: Base.Vector3 | undefined = [0, 0, 1];
        /**
         * Roughly where the X axis points. It is turned square to `normal`, so it only must not run
         * along it.
         * @default [1, 0, 0]
         */
        direction?: Base.Vector3 | undefined = [1, 0, 0];
    }

    /**
     * Where `frame.xy`, `frame.yz` and `frame.zx` put the frame they build; each of them fixes
     * the axes itself.
     */
    export class OriginDto {
        constructor(origin?: Base.Point3) {
            if (origin !== undefined) { this.origin = origin; }
        }
        /**
         * Where the frame sits.
         * @default [0, 0, 0]
         */
        origin?: Base.Point3 | undefined = [0, 0, 0];
    }

    /**
     * The three points `frame.fromThreePoints` builds a frame from: its origin, a point its X axis
     * runs toward and a point on the side its Y axis points to.
     */
    export class ThreePointsDto {
        constructor(origin?: Base.Point3, xPoint?: Base.Point3, planePoint?: Base.Point3) {
            if (origin !== undefined) { this.origin = origin; }
            if (xPoint !== undefined) { this.xPoint = xPoint; }
            if (planePoint !== undefined) { this.planePoint = planePoint; }
        }
        /**
         * Where the frame sits.
         * @default [0, 0, 0]
         */
        origin?: Base.Point3 | undefined = [0, 0, 0];
        /**
         * A point the X axis runs toward from `origin`.
         * @default [1, 0, 0]
         */
        xPoint?: Base.Point3 | undefined = [1, 0, 0];
        /**
         * A third point in the plane, on the side the Y axis points to; it must not lie on the line
         * through the other two.
         * @default [0, 1, 0]
         */
        planePoint?: Base.Point3 | undefined = [0, 1, 0];
    }

    /**
     * A point and a normal for `frame.fromPointAndNormal`, which picks the X axis by a fixed rule,
     * so the same normal always gives the same frame.
     */
    export class PointAndNormalDto {
        constructor(origin?: Base.Point3, normal?: Base.Vector3) {
            if (origin !== undefined) { this.origin = origin; }
            if (normal !== undefined) { this.normal = normal; }
        }
        /**
         * Where the frame sits.
         * @default [0, 0, 0]
         */
        origin?: Base.Point3 | undefined = [0, 0, 0];
        /**
         * Where the Z axis points; any length but zero.
         * @default [0, 0, 1]
         */
        normal?: Base.Vector3 | undefined = [0, 0, 1];
    }

    /**
     * The points `frame.bestFit` fits a plane through: at least three, not all on one line.
     */
    export class BestFitDto {
        constructor(points?: Base.Point3[]) {
            if (points !== undefined) { this.points = points; }
        }
        /**
         * The points to fit. Their order decides which way the normal points; where it turns
         * neither way, as in a bow-tie, the normal's largest component is positive.
         * @default undefined
         */
        points!: Base.Point3[];
    }

    /**
     * One frame, for the methods that read a frame or turn it over: `frame.origin`, `frame.normal`,
     * `frame.direction`, `frame.yDirection`, `frame.flip` and `frame.toMatrix`.
     */
    export class FrameDto {
        constructor(frame?: Base.Frame) {
            if (frame !== undefined) { this.frame = frame; }
        }
        /**
         * The frame to read or change.
         * @default undefined
         */
        frame!: Base.Frame;
    }

    /**
     * A list of frames for `frame.flipFrames`, which turns every one of them over.
     */
    export class FramesDto {
        constructor(frames?: Base.Frame[]) {
            if (frames !== undefined) { this.frames = frames; }
        }
        /**
         * The frames to change, each on its own.
         * @default undefined
         */
        frames!: Base.Frame[];
    }

    /**
     * The vector `frame.translate` and `frame.translateFrames` move frames by; their axes keep
     * their directions.
     */
    export abstract class TranslateSharedDto {
        /**
         * How far to move each origin, in world coordinates and model units.
         * @default [0, 0, 0]
         */
        translation?: Base.Vector3 | undefined = [0, 0, 0];
    }

    /**
     * A frame and the vector `frame.translate` moves it by; its axes keep their directions.
     */
    export class TranslateDto extends TranslateSharedDto {
        constructor(frame?: Base.Frame, translation?: Base.Vector3) {
            super();
            if (frame !== undefined) { this.frame = frame; }
            if (translation !== undefined) { this.translation = translation; }
        }
        /**
         * The frame to move.
         * @default undefined
         */
        frame!: Base.Frame;
    }

    /**
     * Frames and the one vector `frame.translateFrames` moves them all by; their axes keep their
     * directions.
     */
    export class TranslateFramesDto extends TranslateSharedDto {
        constructor(frames?: Base.Frame[], translation?: Base.Vector3) {
            super();
            if (frames !== undefined) { this.frames = frames; }
            if (translation !== undefined) { this.translation = translation; }
        }
        /**
         * The frames to move.
         * @default undefined
         */
        frames!: Base.Frame[];
    }

    /**
     * The distance `frame.offset` and `frame.offsetFrames` move frames along their own normals;
     * their axes keep their directions.
     */
    export abstract class OffsetSharedDto {
        /**
         * How far to move each frame along its normal, in model units; a negative distance moves
         * against it.
         * @default 1
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        distance?: number | undefined = 1;
    }

    /**
     * A frame and the distance `frame.offset` moves it along its own normal; its axes keep their
     * directions.
     */
    export class OffsetDto extends OffsetSharedDto {
        constructor(frame?: Base.Frame, distance?: number) {
            super();
            if (frame !== undefined) { this.frame = frame; }
            if (distance !== undefined) { this.distance = distance; }
        }
        /**
         * The frame to move.
         * @default undefined
         */
        frame!: Base.Frame;
    }

    /**
     * Frames and the distance `frame.offsetFrames` moves each along its own normal; their axes keep
     * their directions.
     */
    export class OffsetFramesDto extends OffsetSharedDto {
        constructor(frames?: Base.Frame[], distance?: number) {
            super();
            if (frames !== undefined) { this.frames = frames; }
            if (distance !== undefined) { this.distance = distance; }
        }
        /**
         * The frames to move.
         * @default undefined
         */
        frames!: Base.Frame[];
    }

    /**
     * One of a frame's own axes and the angle `frame.rotate` and `frame.rotateFrames` turn frames
     * by about it, through each frame's origin.
     */
    export abstract class RotateSharedDto {
        /**
         * Which of each frame's own axes to turn about.
         * @default z
         */
        axis?: frameAxisEnum | undefined = frameAxisEnum.z;
        /**
         * How far to turn, in degrees; positive is counter-clockwise when the axis points toward
         * you.
         * @default 90
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        angle?: number | undefined = 90;
    }

    /**
     * A frame, one of its own axes and the angle `frame.rotate` turns it by about that axis,
     * through its origin.
     */
    export class RotateDto extends RotateSharedDto {
        constructor(frame?: Base.Frame, axis?: frameAxisEnum, angle?: number) {
            super();
            if (frame !== undefined) { this.frame = frame; }
            if (axis !== undefined) { this.axis = axis; }
            if (angle !== undefined) { this.angle = angle; }
        }
        /**
         * The frame to turn.
         * @default undefined
         */
        frame!: Base.Frame;
    }

    /**
     * Frames, one of their own axes and the angle `frame.rotateFrames` turns each by about that
     * axis, through its own origin.
     */
    export class RotateFramesDto extends RotateSharedDto {
        constructor(frames?: Base.Frame[], axis?: frameAxisEnum, angle?: number) {
            super();
            if (frames !== undefined) { this.frames = frames; }
            if (axis !== undefined) { this.axis = axis; }
            if (angle !== undefined) { this.angle = angle; }
        }
        /**
         * The frames to turn.
         * @default undefined
         */
        frames!: Base.Frame[];
    }

    /**
     * The parent frame whose coordinates `frame.frameToWorld`, `frame.frameToLocal`,
     * `frame.framesToWorld` and `frame.framesToLocal` read frames in.
     */
    export abstract class ChildFrameSharedDto {
        /**
         * The frame whose coordinates the frames are given in or converted to.
         * @default undefined
         */
        parent!: Base.Frame;
    }

    /**
     * Two frames for `frame.frameToWorld` and `frame.frameToLocal`: the `child` to convert, and the
     * `parent` whose coordinates are used.
     */
    export class ChildFrameDto extends ChildFrameSharedDto {
        constructor(child?: Base.Frame, parent?: Base.Frame) {
            super();
            if (child !== undefined) { this.child = child; }
            if (parent !== undefined) { this.parent = parent; }
        }
        /**
         * The frame to convert: given in the coordinates of `parent` for `frameToWorld`, in world
         * coordinates for `frameToLocal`.
         * @default undefined
         */
        child!: Base.Frame;
    }

    /**
     * Frames and one parent frame for `frame.framesToWorld` and `frame.framesToLocal`, which convert
     * every frame between the parent's coordinates and world coordinates.
     */
    export class ChildFramesDto extends ChildFrameSharedDto {
        constructor(children?: Base.Frame[], parent?: Base.Frame) {
            super();
            if (children !== undefined) { this.children = children; }
            if (parent !== undefined) { this.parent = parent; }
        }
        /**
         * The frames to convert: given in the coordinates of `parent` for `framesToWorld`, in world
         * coordinates for `framesToLocal`.
         * @default undefined
         */
        children!: Base.Frame[];
    }

    /**
     * A frame and one point for `frame.pointToWorld` and `frame.pointToLocal`, which convert the
     * point between the frame's coordinates and world coordinates.
     */
    export class FramePointDto {
        constructor(frame?: Base.Frame, point?: Base.Point3) {
            if (frame !== undefined) { this.frame = frame; }
            if (point !== undefined) { this.point = point; }
        }
        /**
         * The frame whose coordinates the point is converted to or from.
         * @default undefined
         */
        frame!: Base.Frame;
        /**
         * The point to convert: in the frame's coordinates for `pointToWorld`, in world coordinates
         * for `pointToLocal`.
         * @default undefined
         */
        point!: Base.Point3;
    }

    /**
     * A frame and a list of points for `frame.pointsToWorld` and `frame.pointsToLocal`, which
     * convert every point between the frame's coordinates and world coordinates.
     */
    export class FramePointsDto {
        constructor(frame?: Base.Frame, points?: Base.Point3[]) {
            if (frame !== undefined) { this.frame = frame; }
            if (points !== undefined) { this.points = points; }
        }
        /**
         * The frame whose coordinates the points are converted to or from.
         * @default undefined
         */
        frame!: Base.Frame;
        /**
         * The points to convert: in the frame's coordinates for `pointsToWorld`, in world
         * coordinates for `pointsToLocal`.
         * @default undefined
         */
        points!: Base.Point3[];
    }

    /**
     * A frame and a vector for `frame.vectorToWorld` and `frame.vectorToLocal`, which turn the
     * vector between the frame's axes and the world axes without moving it.
     */
    export class FrameVectorDto {
        constructor(frame?: Base.Frame, vector?: Base.Vector3) {
            if (frame !== undefined) { this.frame = frame; }
            if (vector !== undefined) { this.vector = vector; }
        }
        /**
         * The frame whose axes the vector is converted to or from.
         * @default undefined
         */
        frame!: Base.Frame;
        /**
         * The vector to convert: along the frame's axes for `vectorToWorld`, along the world axes
         * for `vectorToLocal`.
         * @default undefined
         */
        vector!: Base.Vector3;
    }

    /**
     * The transformation `frame.fromMatrix` reads a frame from: where it moves the world origin and
     * where it turns the world X and Z axes.
     */
    export class TransformationDto {
        constructor(transformation?: Base.TransformMatrixes) {
            if (transformation !== undefined) { this.transformation = transformation; }
        }
        /**
         * A transformation matrix, or a list of them applied in order; scaling is dropped and a
         * perspective part is refused.
         * @default undefined
         */
        transformation!: Base.TransformMatrixes;
    }

    /**
     * Two frames for `frame.matrixFromTo`, whose transformation carries anything placed on `from`
     * onto `to`, turning it the same way.
     */
    export class FromToDto {
        constructor(to?: Base.Frame, from?: Base.Frame) {
            if (to !== undefined) { this.to = to; }
            if (from !== undefined) { this.from = from; }
        }
        /**
         * The frame to move onto.
         * @default undefined
         */
        to!: Base.Frame;
        /**
         * The frame to move from; left out, the world frame.
         * @default undefined
         * @optional true
         */
        from?: Base.Frame | undefined;
    }

    /**
     * The counts and spacings of the grid of frames `frame.grid` lays out in the plane of `frame`,
     * each turned the same way as `frame`.
     */
    export class GridDto {
        constructor(frame?: Base.Frame, countX?: number, countY?: number, spacingX?: number, spacingY?: number, centered?: boolean) {
            if (frame !== undefined) { this.frame = frame; }
            if (countX !== undefined) { this.countX = countX; }
            if (countY !== undefined) { this.countY = countY; }
            if (spacingX !== undefined) { this.spacingX = spacingX; }
            if (spacingY !== undefined) { this.spacingY = spacingY; }
            if (centered !== undefined) { this.centered = centered; }
        }
        /**
         * The frame whose plane and axes the grid follows; left out, the world frame.
         * @default undefined
         * @optional true
         */
        frame?: Base.Frame | undefined;
        /**
         * How many frames along the X axis.
         * @default 3
         * @minimum 1
         * @maximum Infinity
         * @step 1
         */
        countX?: number | undefined = 3;
        /**
         * How many frames along the Y axis.
         * @default 3
         * @minimum 1
         * @maximum Infinity
         * @step 1
         */
        countY?: number | undefined = 3;
        /**
         * The distance between neighbours along the X axis, in model units.
         * @default 2
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        spacingX?: number | undefined = 2;
        /**
         * The distance between neighbours along the Y axis, in model units.
         * @default 2
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        spacingY?: number | undefined = 2;
        /**
         * When true the grid is centered on the frame's origin; otherwise it starts there and runs
         * along the X and Y axes.
         * @default false
         */
        centered?: boolean | undefined = false;
    }

    /**
     * The count, radius and sweep of the ring of frames `frame.polar` lays out around the normal of
     * `frame`, in its plane.
     */
    export class PolarDto {
        constructor(frame?: Base.Frame, count?: number, radius?: number, angle?: number, startAngle?: number, rotate?: boolean) {
            if (frame !== undefined) { this.frame = frame; }
            if (count !== undefined) { this.count = count; }
            if (radius !== undefined) { this.radius = radius; }
            if (angle !== undefined) { this.angle = angle; }
            if (startAngle !== undefined) { this.startAngle = startAngle; }
            if (rotate !== undefined) { this.rotate = rotate; }
        }
        /**
         * The frame the ring turns around, about its normal; left out, the world frame.
         * @default undefined
         * @optional true
         */
        frame?: Base.Frame | undefined;
        /**
         * How many frames in the ring.
         * @default 6
         * @minimum 1
         * @maximum Infinity
         * @step 1
         */
        count?: number | undefined = 6;
        /**
         * The distance from the center to each frame, in model units; at 0 the frames only turn
         * in place.
         * @default 3
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius?: number | undefined = 3;
        /**
         * The angle the ring covers, in degrees, from -360 to 360. A full turn spaces the frames
         * evenly without repeating the first; a smaller angle puts one at each end.
         * @default 360
         * @minimum -360
         * @maximum 360
         * @step 1
         */
        angle?: number | undefined = 360;
        /**
         * The angle of the first frame, in degrees from the X axis toward the Y axis.
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 1
         */
        startAngle?: number | undefined = 0;
        /**
         * When true the frames rotate with the ring, as copies around a hub do; otherwise every frame
         * keeps the axes of `frame`.
         * @default true
         */
        rotate?: boolean | undefined = true;
    }

    /**
     * The counts and hexagon size of the honeycomb `frame.hexGrid` lays out in the plane of
     * `frame`: one frame at the center of each hexagon, turned the same way as `frame`.
     */
    export class HexGridDto {
        constructor(frame?: Base.Frame, countX?: number, countY?: number, radius?: number, centered?: boolean) {
            if (frame !== undefined) { this.frame = frame; }
            if (countX !== undefined) { this.countX = countX; }
            if (countY !== undefined) { this.countY = countY; }
            if (radius !== undefined) { this.radius = radius; }
            if (centered !== undefined) { this.centered = centered; }
        }
        /**
         * The frame whose plane and axes the honeycomb follows; left out, the world frame.
         * @default undefined
         * @optional true
         */
        frame?: Base.Frame | undefined;
        /**
         * How many hexagons in each row, along the X axis.
         * @default 3
         * @minimum 1
         * @maximum Infinity
         * @step 1
         */
        countX?: number | undefined = 3;
        /**
         * How many rows, along the Y axis; every second row is shifted by half a hexagon.
         * @default 3
         * @minimum 1
         * @maximum Infinity
         * @step 1
         */
        countY?: number | undefined = 3;
        /**
         * The distance from a hexagon's center to one of its corners, in model units; two corners
         * lie on the frame's Y axis.
         * @default 1
         * @minimum 0
         * @exclusiveMinimum true
         * @maximum Infinity
         * @step 0.1
         */
        radius?: number | undefined = 1;
        /**
         * When true the honeycomb is centered on the frame's origin; otherwise its first hexagon
         * sits there.
         * @default false
         */
        centered?: boolean | undefined = false;
    }
}
