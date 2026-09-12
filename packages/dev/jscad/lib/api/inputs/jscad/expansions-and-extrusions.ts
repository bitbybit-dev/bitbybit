// A fragment of the JSCAD inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../jscad-inputs.ts. Edit here, then regenerate.
import { Base } from "../base-inputs";
import { JSCADEntity, solidCornerTypeEnum } from "./entities-and-enums";

/**
 * Feeds `expansions.expand` and `expansions.offset`: the geometry, the signed distance to move its
 * boundary by and how the corners are shaped on the way.
 */
export class ExpansionDto {
    constructor(geometry?: JSCADEntity, delta?: number, corners?: solidCornerTypeEnum, segments?: number) {
        if (geometry !== undefined) { this.geometry = geometry; }
        if (delta !== undefined) { this.delta = delta; }
        if (corners !== undefined) { this.corners = corners; }
        if (segments !== undefined) { this.segments = segments; }
    }
    /**
     * The 2D shape, path or solid to grow; `offset` takes 2D shapes and paths only. It stays as it
     * is and a new entity comes back
     * @default undefined
     */
    geometry!: JSCADEntity;
    /**
     * How far the boundary moves, in model units: positive grows the geometry, negative shrinks it
     * (a solid accepts positive only)
     * @default 0.1
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    delta = 0.1;
    /**
     * How a convex corner is shaped: `edge` keeps it sharp, `chamfer` cuts it flat, `round` curves
     * it; a solid accepts `round` only
     * @default edge
     */
    corners: solidCornerTypeEnum = solidCornerTypeEnum.edge;
    /**
     * Number of straight pieces a `round` corner is made of over a full circle; more makes it
     * smoother
     * @default 24
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    segments = 24;
}
/**
 * The offset options, mirroring `ExpansionDto`: the geometry, the signed distance and the corner
 * shaping. `expansions.offset` reads `ExpansionDto`, so this class is here for symmetry.
 */
export class OffsetDto {
    constructor(geometry?: JSCADEntity, delta?: number, corners?: solidCornerTypeEnum, segments?: number) {
        if (geometry !== undefined) { this.geometry = geometry; }
        if (delta !== undefined) { this.delta = delta; }
        if (corners !== undefined) { this.corners = corners; }
        if (segments !== undefined) { this.segments = segments; }
    }
    /**
     * The 2D shape or path whose outline is moved; it stays as it is and a new entity comes back
     * @default undefined
     */
    geometry!: JSCADEntity;
    /**
     * How far the outline moves, in model units: positive outward, negative inward
     * @default 0.1
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    delta = 0.1;
    /**
     * How a convex corner is shaped: `edge` keeps it sharp, `chamfer` cuts it flat, `round` curves
     * it
     * @default edge
     */
    corners: solidCornerTypeEnum = solidCornerTypeEnum.edge;
    /**
     * Number of straight pieces a `round` corner is made of over a full circle; more makes it
     * smoother
     * @default 24
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    segments = 24;
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
    height = 1;
    /**
     * How far the top is turned relative to the bottom around Z, in degrees; 0 gives a straight
     * extrusion
     * @default 90
     * @minimum -Infinity
     * @maximum Infinity
     * @step 1
     */
    twistAngle = 90;
    /**
     * Number of slices the twist is built from, at least 1; more makes a smoother twist and a
     * heavier mesh
     * @default 15
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    twistSteps = 15;
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
 * Feeds `extrusions.extrudeRectangular`: the outline to build a wall along, the wall's height along
 * Z and its half thickness.
 */
export class ExtrudeRectangularDto {
    constructor(geometry?: JSCADEntity, height?: number, size?: number) {
        if (geometry !== undefined) { this.geometry = geometry; }
        if (height !== undefined) { this.height = height; }
        if (size !== undefined) { this.size = size; }
    }
    /**
     * The 2D shape or path whose outline the wall follows; the inside of a shape stays empty
     * @default undefined
     */
    geometry!: JSCADEntity;
    /**
     * How tall the wall is along Z, in model units, standing on the XY plane
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    height = 1;
    /**
     * How far the wall reaches to each side of the outline, in model units, so the wall is twice
     * this thick
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    size = 1;
}
/**
 * Feeds `extrusions.extrudeRectangularPoints`: the points of the line to build a wall along, the
 * wall's height along Z and its half thickness.
 */
export class ExtrudeRectangularPointsDto {
    constructor(points?: Base.Point3[], height?: number, size?: number) {
        if (points !== undefined) { this.points = points; }
        if (height !== undefined) { this.height = height; }
        if (size !== undefined) { this.size = size; }
    }
    /**
     * The corner points of the line the wall follows, in order; only X and Y are used
     * @default undefined
     */
    points!: Base.Point3[];
    /**
     * How tall the wall is along Z, in model units, standing on the XY plane
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    height = 1;
    /**
     * How far the wall reaches to each side of the line, in model units, so the wall is twice this
     * thick
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    size = 1;
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
    angle = 90;
    /**
     * Where the revolution starts, in degrees from the X axis
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 1
     */
    startAngle = 0;
    /**
     * Number of steps in a full turn; a partial angle uses proportionally fewer. Fewer than 3
     * throws an error
     * @default 24
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    segments = 24;
}
