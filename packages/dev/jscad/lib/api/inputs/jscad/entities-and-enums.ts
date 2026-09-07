// A fragment of the JSCAD inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../jscad-inputs.ts. Edit here, then regenerate.
import { Base } from "../base-inputs";

/**
 * A JSCAD geometry object. Deliberately untyped because JSCAD returns several different internal
 * shapes - 2D geometry, 3D geometry and paths - that share no common interface. Treat it as an
 * opaque value to pass between JSCAD calls.
 */
export type JSCADEntity = any;

export class PolylinePropertiesDto {
    /**
     * Provide options without default values
     */
    constructor(points?: Base.Point3[], isClosed?: boolean) {
        if (points !== undefined) { this.points = points; }
        if (isClosed !== undefined) { this.isClosed = isClosed; }
    }
    /**
     * Points of the polyline
     */
    points!: Base.Point3[];
    /**
     * Can contain is closed information
     */
    isClosed?: boolean | undefined = false;
    /**
     * Can contain color information
     */
    color?: string | number[] | undefined;
}
/**
 * How the corners of an expanded or rounded solid are formed.
 */
export enum solidCornerTypeEnum {
    /**
     * Edges will meet at a corner
     */
    edge = "edge",
    /**
     * Edges will be rounded on the corner
     */
    round = "round",
    /**
     * Edges will be chamfered on the corner
     */
    chamfer = "chamfer",
}
/**
 * Horizontal alignment of JSCAD text against its anchor point.
 */
export enum jscadTextAlignEnum {
    /**
     * Aligns text to the left
     */
    left = "left",
    /**
     * Aligns text to the center
     */
    center = "center",
    /**
     * Aligns text to the right
     */
    right = "right",
}
