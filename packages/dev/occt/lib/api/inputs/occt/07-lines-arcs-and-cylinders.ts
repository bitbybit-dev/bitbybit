// A fragment of the OCCT inputs namespace: scripts/gen-occ-inputs.mjs assembles every file in this
// directory, in file-name order, into ../occ-inputs.ts. Edit here, then regenerate.
import { Base } from "@bitbybit-dev/base";

export class LineDto {
    constructor(start?: Base.Point3, end?: Base.Point3) {
        if (start !== undefined) { this.start = start; }
        if (end !== undefined) { this.end = end; }
    }
    /**
     * Start of the line
     * @default [0, 0, 0]
     */
    start: Base.Point3 = [0, 0, 0];
    /**
     * End of the line
     * @default [0, 1, 0]
     */
    end: Base.Point3 = [0, 1, 0];
}

export class LineWithExtensionsDto {
    constructor(start?: Base.Point3, end?: Base.Point3, extensionStart?: number, extensionEnd?: number) {
        if (start !== undefined) { this.start = start; }
        if (end !== undefined) { this.end = end; }
        if (extensionStart !== undefined) { this.extensionStart = extensionStart; }
        if (extensionEnd !== undefined) { this.extensionEnd = extensionEnd; }
    }
    /**
     * Start of the line
     * @default [0, 0, 0]
     */
    start: Base.Point3 = [0, 0, 0];
    /**
     * End of the line
     * @default [0, 1, 0]
     */
    end: Base.Point3 = [0, 1, 0];
    /**
     * Extension of the line on the start
     * @default 0.1
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    extensionStart = 0.1;
    /**
     * Extension of the line on the end
     * @default 0.1
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    extensionEnd = 0.1;
}
export class LinesDto {
    constructor(lines?: LineDto[], returnCompound?: boolean) {
        if (lines !== undefined) { this.lines = lines; }
        if (returnCompound !== undefined) { this.returnCompound = returnCompound; }
    }
    /**
     * Lines
     * @default undefined
     */
    lines!: LineDto[];
    /**
     * Indicates whether the shapes should be returned as a compound
     */
    returnCompound = false;
}
export class ArcEdgeTwoPointsTangentDto {
    constructor(start?: Base.Point3, tangentVec?: Base.Vector3, end?: Base.Point3) {
        if (start !== undefined) { this.start = start; }
        if (tangentVec !== undefined) { this.tangentVec = tangentVec; }
        if (end !== undefined) { this.end = end; }
    }
    /**
     * Start of the arc
     * @default [0, 0, 0]
     */
    start: Base.Point3 = [0, 0, 0];
    /**
    * Tangent vector on first point of the edge
    * @default [0, 1, 0]
    */
    tangentVec: Base.Vector3 = [0, 1, 0];
    /**
     * End of the arc
     * @default [0, 0, 1]
     */
    end: Base.Point3 = [0, 0, 1];
}
export class ArcEdgeCircleTwoPointsDto<T> {
    constructor(circle?: T, start?: Base.Point3, end?: Base.Point3, sense?: boolean) {
        if (circle !== undefined) { this.circle = circle; }
        if (start !== undefined) { this.start = start; }
        if (end !== undefined) { this.end = end; }
        if (sense !== undefined) { this.sense = sense; }
    }
    /**
     * Circular edge
     * @default undefined
     */
    circle!: T;
    /**
     * Start of the arc on the circle
     * @default [0, 0, 0]
     */
    start: Base.Point3 = [0, 0, 0];
    /**
     * End of the arc on the circle
     * @default [0, 0, 1]
     */
    end: Base.Point3 = [0, 0, 1];
    /**
     * If true will sense the direction
     * @default true
     */
    sense = true;
}
export class ArcEdgeCircleTwoAnglesDto<T> {
    constructor(circle?: T, alphaAngle1?: number, alphaAngle2?: number, sense?: boolean) {
        if (circle !== undefined) { this.circle = circle; }
        if (alphaAngle1 !== undefined) { this.alphaAngle1 = alphaAngle1; }
        if (alphaAngle2 !== undefined) { this.alphaAngle2 = alphaAngle2; }
        if (sense !== undefined) { this.sense = sense; }
    }
    /**
     * Circular edge
     * @default undefined
     */
    circle!: T;
    /**
     * First angle
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 1
     */
    alphaAngle1 = 0;
    /**
     * End angle
     * @default 90
     * @minimum -Infinity
     * @maximum Infinity
     * @step 1
     */
    alphaAngle2 = 90;
    /**
     * If true will sense the direction
     * @default true
     */
    sense = true;
}
export class ArcEdgeCirclePointAngleDto<T> {
    constructor(circle?: T, alphaAngle?: number, _alphaAngle2?: number, sense?: boolean) {
        if (circle !== undefined) { this.circle = circle; }
        if (alphaAngle !== undefined) { this.alphaAngle = alphaAngle; }
        if (sense !== undefined) { this.sense = sense; }
    }
    /**
     * Circular edge
     * @default undefined
     */
    circle!: T;
    /**
     * Point on the circle from where to start the arc
     * @default undefined
     */
    point!: Base.Point3;
    /**
     * Angle from point
     * @default 90
     * @minimum -Infinity
     * @maximum Infinity
     * @step 1
     */
    alphaAngle = 90;
    /**
     * If true will sense the direction
     * @default true
     */
    sense = true;
}
export class ArcEdgeThreePointsDto {
    constructor(start?: Base.Point3, middle?: Base.Point3, end?: Base.Point3) {
        if (start !== undefined) { this.start = start; }
        if (middle !== undefined) { this.middle = middle; }
        if (end !== undefined) { this.end = end; }
    }
    /**
     * Start of the arc
     * @default [0, 0, 0]
     */
    start: Base.Point3 = [0, 0, 0];
    /**
    * Middle of the arc
    * @default [0, 1, 0]
    */
    middle: Base.Point3 = [0, 1, 0];
    /**
     * End of the arc
     * @default [0, 0, 1]
     */
    end: Base.Point3 = [0, 0, 1];
}
export class CylinderDto {
    constructor(radius?: number, height?: number, center?: Base.Point3, direction?: Base.Vector3, angle?: number, originOnCenter?: boolean) {
        if (radius !== undefined) { this.radius = radius; }
        if (height !== undefined) { this.height = height; }
        if (center !== undefined) { this.center = center; }
        if (direction !== undefined) { this.direction = direction; }
        if (angle !== undefined) { this.angle = angle; }
        if (originOnCenter !== undefined) { this.originOnCenter = originOnCenter; }
    }
    /**
     * Radius of the cylinder
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    radius = 1;
    /**
     * Height of the cylinder
     * @default 2
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    height = 2;
    /**
     * Center of the cylinder
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * Direction for the cylinder
     * @default [0, 1, 0]
     */
    direction?: Base.Vector3 | undefined = [0, 1, 0];
    /**
     * Angle of the cylinder pie
     * @default 360
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    angle?: number | undefined = 360;
    /**
     * Force origin to be on the center of cylinder
     * @default false
     */
    originOnCenter?: boolean | undefined = false;
}
export class CylindersOnLinesDto {
    constructor(radius?: number, lines?: Base.Line3[]) {
        if (radius !== undefined) { this.radius = radius; }
        if (lines !== undefined) { this.lines = lines; }
    }
    /**
     * Radius of the cylinder
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    radius: number = 1;
    /**
     * Lines between which to span cylinders
     * @default undefined
     */
    lines!: Base.Line3[];
}
