// A fragment of the JSCAD inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../jscad-inputs.ts. Edit here, then regenerate.
import { Base } from "../base-inputs";
import { JSCADEntity, solidCornerTypeEnum } from "./entities-and-enums";

export class ExpansionDto {
    constructor(geometry?: JSCADEntity, delta?: number, corners?: solidCornerTypeEnum, segments?: number) {
        if (geometry !== undefined) { this.geometry = geometry; }
        if (delta !== undefined) { this.delta = delta; }
        if (corners !== undefined) { this.corners = corners; }
        if (segments !== undefined) { this.segments = segments; }
    }
    /**
     * Can contain various Jscad entities from Solid category
     * @default undefined
     */
    geometry: JSCADEntity;
    /**
     * Delta (+/-) of expansion
     * @default 0.1
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    delta = 0.1;
    /**
     * Type of corner to create during of expansion; edge, chamfer, round
     * @default edge
     */
    corners: solidCornerTypeEnum = solidCornerTypeEnum.edge;
    /**
     * Integer number of segments when creating round corners         
     * @default 24
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    segments = 24;
}
export class OffsetDto {
    constructor(geometry?: JSCADEntity, delta?: number, corners?: solidCornerTypeEnum, segments?: number) {
        if (geometry !== undefined) { this.geometry = geometry; }
        if (delta !== undefined) { this.delta = delta; }
        if (corners !== undefined) { this.corners = corners; }
        if (segments !== undefined) { this.segments = segments; }
    }
    /**
     * Can contain various Jscad entities from Solid category
     * @default undefined
     */
    geometry: JSCADEntity;
    /**
     * Delta (+/-) of offset
     * @default 0.1
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    delta = 0.1;
    /**
     * Type of corner to create during the offset; edge, chamfer, round.
     * @default edge
     */
    corners: solidCornerTypeEnum = solidCornerTypeEnum.edge;
    /**
     * Integer number of segments when creating round corners
     * @default 24
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    segments = 24;
}
export class ExtrudeLinearDto {
    constructor(geometry?: JSCADEntity, height?: number, twistAngle?: number, twistSteps?: number) {
        if (geometry !== undefined) { this.geometry = geometry; }
        if (height !== undefined) { this.height = height; }
        if (twistAngle !== undefined) { this.twistAngle = twistAngle; }
        if (twistSteps !== undefined) { this.twistSteps = twistSteps; }
    }
    /**
     * Geometry to extrude
     * @default undefined
     */
    geometry: JSCADEntity;
    /**
     * Height of linear extrude
     * @default 1
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    height = 1;
    /**
     * Twist angle in degrees
     * @default 90
     * @minimum -Infinity
     * @maximum Infinity
     * @step 1
     */
    twistAngle = 90;
    /**
     * Number of twist steps
     * @default 15
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    twistSteps = 15;
}

export class HullDto {
    constructor(meshes?: JSCADEntity[]) {
        if (meshes !== undefined) { this.meshes = meshes; }
    }
    /**
     * Geometries to use in hull
     * @default undefined
     */
    meshes!: JSCADEntity[];
}
export class ExtrudeRectangularDto {
    constructor(geometry?: JSCADEntity, height?: number, size?: number) {
        if (geometry !== undefined) { this.geometry = geometry; }
        if (height !== undefined) { this.height = height; }
        if (size !== undefined) { this.size = size; }
    }
    /**
     * Geometry to extrude
     * @default undefined
     */
    geometry: JSCADEntity;
    /**
     * Height of linear extrude
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    height = 1;
    /**
     * Size of the rectangle
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    size = 1;
}
export class ExtrudeRectangularPointsDto {
    constructor(points?: Base.Point3[], height?: number, size?: number) {
        if (points !== undefined) { this.points = points; }
        if (height !== undefined) { this.height = height; }
        if (size !== undefined) { this.size = size; }
    }
    /**
     * Points for a path
     * @default undefined
     */
    points!: Base.Point3[];
    /**
     * Height of linear extrude
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    height = 1;
    /**
     * Size of the rectangle
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    size = 1;
}
export class ExtrudeRotateDto {
    constructor(polygon?: JSCADEntity, angle?: number, startAngle?: number, segments?: number) {
        if (polygon !== undefined) { this.polygon = polygon; }
        if (angle !== undefined) { this.angle = angle; }
        if (startAngle !== undefined) { this.startAngle = startAngle; }
        if (segments !== undefined) { this.segments = segments; }
    }
    /**
     * Polygon to extrude
     * @default undefined
     */
    polygon: JSCADEntity;
    /**
     * Angle in degrees
     * @default 90
     * @minimum -Infinity
     * @maximum Infinity
     * @step 1
     */
    angle = 90;
    /**
     * Start angle in degrees
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 1
     */
    startAngle = 0;
    /**
     * Number of segments
     * @default 24
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    segments = 24;
}
