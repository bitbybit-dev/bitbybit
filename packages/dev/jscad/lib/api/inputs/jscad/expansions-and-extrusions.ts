// A fragment of the JSCAD inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../jscad-inputs.ts. Edit here, then regenerate.
import { Base } from "../base-inputs";
import { JSCADEntity, solidCornerTypeEnum } from "./entities-and-enums";

/**
 * Feeds `expansions.offset`: the 2D shape or path, the signed distance to build its outline at and
 * how the corners are shaped, kept sharp unless `corners` says otherwise.
 */
export class ExpansionDto {
    constructor(geometry?: JSCADEntity, delta?: number, corners?: solidCornerTypeEnum, segments?: number) {
        if (geometry !== undefined) { this.geometry = geometry; }
        if (delta !== undefined) { this.delta = delta; }
        if (corners !== undefined) { this.corners = corners; }
        if (segments !== undefined) { this.segments = segments; }
    }
    /**
     * The 2D shape or path to outline; it stays as it is and a new entity comes back
     * @default undefined
     */
    geometry!: JSCADEntity;
    /**
     * How far the boundary moves, in model units: positive grows the geometry, negative shrinks it
     * @default 0.1
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    delta?: number | undefined = 0.1;
    /**
     * How a convex corner is shaped: `edge` keeps it sharp, `chamfer` cuts it flat, `round` curves
     * it with `segments` pieces
     * @default edge
     */
    corners?: solidCornerTypeEnum | undefined = solidCornerTypeEnum.edge;
    /**
     * Number of straight pieces a `round` corner is made of over a full circle; more makes it
     * smoother
     * @default 24
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    segments?: number | undefined = 24;
}
/**
 * Feeds `expansions.expand`: the geometry, the signed distance to move its boundary by and how the
 * corners are shaped, rounded unless `corners` says otherwise.
 */
export class ExpandDto {
    constructor(geometry?: JSCADEntity, delta?: number, corners?: solidCornerTypeEnum, segments?: number) {
        if (geometry !== undefined) { this.geometry = geometry; }
        if (delta !== undefined) { this.delta = delta; }
        if (corners !== undefined) { this.corners = corners; }
        if (segments !== undefined) { this.segments = segments; }
    }
    /**
     * The 2D shape, path or solid to grow; it stays as it is and a new entity comes back
     * @default undefined
     */
    geometry!: JSCADEntity;
    /**
     * How far the boundary moves, in model units: positive grows the geometry, negative shrinks it;
     * a solid or a path accepts a positive value only
     * @default 0.1
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    delta?: number | undefined = 0.1;
    /**
     * How a convex corner is shaped: `round` curves it with `segments` pieces, `chamfer` cuts it
     * flat, `edge` keeps it sharp; a solid accepts `round` only
     * @default round
     */
    corners?: solidCornerTypeEnum | undefined = solidCornerTypeEnum.round;
    /**
     * Number of straight pieces a `round` corner is made of over a full circle; more makes it
     * smoother, and a solid needs at least 4
     * @default 24
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    segments?: number | undefined = 24;
}
/**
 * Feeds `extrusions.extrudeLinear`: the flat shape, how far it rises along Z and the optional twist
 * applied on the way up.
 */
export class ExtrudeLinearDto {
    constructor(geometry?: JSCADEntity, height?: number, twistAngle?: number, twistSteps?: number) {
        if (geometry !== undefined) { this.geometry = geometry; }
        if (height !== undefined) { this.height = height; }
        if (twistAngle !== undefined) { this.twistAngle = twistAngle; }
        if (twistSteps !== undefined) { this.twistSteps = twistSteps; }
    }
    /**
     * The flat 2D shape in the XY plane to raise into a solid; a closed path also works, an open
     * one throws an error
     * @default undefined
     */
    geometry!: JSCADEntity;
    /**
     * How far the shape rises along Z, in model units; negative extrudes downward
     * @default 1
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    height?: number | undefined = 1;
    /**
     * How far the top is turned relative to the bottom around Z, in degrees; 0 gives a straight
     * extrusion
     * @default 90
     * @minimum -Infinity
     * @maximum Infinity
     * @step 1
     */
    twistAngle?: number | undefined = 90;
    /**
     * Number of slices the twist is built from, at least 1; more makes a smoother twist and a
     * heavier mesh
     * @default 15
     * @minimum 1
     * @maximum Infinity
     * @step 1
     */
    twistSteps?: number | undefined = 15;
}

/**
 * Feeds `hulls.hull` and `hulls.hullChain` with the entities to wrap, all of one kind: solids, 2D
 * shapes or paths. For `hullChain` the order is the order they connect in.
 */
export class HullDto {
    constructor(meshes?: JSCADEntity[]) {
        if (meshes !== undefined) { this.meshes = meshes; }
    }
    /**
     * The solids, 2D shapes or paths to wrap, all of one kind; for a chain, in the order they
     * connect
     * @default undefined
     */
    meshes!: JSCADEntity[];
}
/**
 * Feeds `hulls.isConvex` with the one solid to examine.
 */
export class SolidDto {
    constructor(mesh?: JSCADEntity) {
        if (mesh !== undefined) { this.mesh = mesh; }
    }
    /**
     * The solid to examine; a 2D shape or a path is refused
     * @default undefined
     */
    mesh!: JSCADEntity;
}
/**
 * The wall a rectangular extrusion builds, shared by `ExtrudeRectangularDto` and
 * `ExtrudeRectangularPointsDto`: how thick and how tall.
 */
export abstract class ExtrudeRectangularSharedDto {
    /**
     * How tall the wall is along Z, in model units, standing on the XY plane
     * @default 1
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.1
     */
    height?: number | undefined = 1;
    /**
     * How far the wall reaches to each side of the path, in model units, so the wall is twice this
     * thick
     * @default 1
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.1
     */
    size?: number | undefined = 1;
}
/**
 * Feeds `extrusions.extrudeRectangular`: the outline to build a wall along, the wall's height along
 * Z and its half thickness.
 */
export class ExtrudeRectangularDto extends ExtrudeRectangularSharedDto {
    constructor(geometry?: JSCADEntity, height?: number, size?: number) {
        super();
        if (geometry !== undefined) { this.geometry = geometry; }
        if (height !== undefined) { this.height = height; }
        if (size !== undefined) { this.size = size; }
    }
    /**
     * The 2D shape or path whose outline the wall follows; the inside of a shape stays empty
     * @default undefined
     */
    geometry!: JSCADEntity;
}
/**
 * Feeds `extrusions.extrudeRectangularPoints`: the points of the line to build a wall along, the
 * wall's height along Z and its half thickness.
 */
export class ExtrudeRectangularPointsDto extends ExtrudeRectangularSharedDto {
    constructor(points?: Base.Point3[], height?: number, size?: number) {
        super();
        if (points !== undefined) { this.points = points; }
        if (height !== undefined) { this.height = height; }
        if (size !== undefined) { this.size = size; }
    }
    /**
     * The corner points of the line the wall follows, in order; only X and Y are used
     * @default undefined
     */
    points!: Base.Point3[];
}
/**
 * Feeds `extrusions.extrudeRotate`: the flat profile to spin around the Z axis, how far and from
 * where to spin it, and how finely the round result is faceted.
 */
export class ExtrudeRotateDto {
    constructor(polygon?: JSCADEntity, angle?: number, startAngle?: number, segments?: number) {
        if (polygon !== undefined) { this.polygon = polygon; }
        if (angle !== undefined) { this.angle = angle; }
        if (startAngle !== undefined) { this.startAngle = startAngle; }
        if (segments !== undefined) { this.segments = segments; }
    }
    /**
     * The flat 2D shape in the XY plane to revolve around the Z axis; its X coordinates are the
     * distances from the axis, which clips it where it crosses
     * @default undefined
     */
    polygon!: JSCADEntity;
    /**
     * How far to revolve, in degrees: 360 makes a full ring, the default 90 a quarter
     * @default 90
     * @minimum -Infinity
     * @maximum Infinity
     * @step 1
     */
    angle?: number | undefined = 90;
    /**
     * Where the revolution starts, in degrees from the X axis
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 1
     */
    startAngle?: number | undefined = 0;
    /**
     * Number of steps in a full turn; a partial angle uses proportionally fewer. Fewer than 3
     * throws an error
     * @default 24
     * @minimum 3
     * @maximum Infinity
     * @step 1
     */
    segments?: number | undefined = 24;
}
