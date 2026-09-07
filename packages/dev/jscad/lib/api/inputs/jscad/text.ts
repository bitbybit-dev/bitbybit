// A fragment of the JSCAD inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../jscad-inputs.ts. Edit here, then regenerate.
import { Base } from "../base-inputs";
import { jscadTextAlignEnum } from "./entities-and-enums";

export class TextDto {
    constructor(text?: string, segments?: number, xOffset?: number, yOffset?: number, height?: number, lineSpacing?: number, letterSpacing?: number, align?: jscadTextAlignEnum, extrudeOffset?: number) {
        if (text !== undefined) { this.text = text; }
        if (segments !== undefined) { this.segments = segments; }
        if (xOffset !== undefined) { this.xOffset = xOffset; }
        if (yOffset !== undefined) { this.yOffset = yOffset; }
        if (height !== undefined) { this.height = height; }
        if (lineSpacing !== undefined) { this.lineSpacing = lineSpacing; }
        if (letterSpacing !== undefined) { this.letterSpacing = letterSpacing; }
        if (align !== undefined) { this.align = align; }
        if (extrudeOffset !== undefined) { this.extrudeOffset = extrudeOffset; }
    }
    /**
     * Text to write
     * @default Hello World
     */
    text = "Hello World";
    /**
     * Number of segments
     * @default 24
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    segments = 24;
    /**
     * X offset of the text
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    xOffset = 0;
    /**
     * Y offset of the text
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    yOffset = 0;
    /**
     * Height of the text
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    height = 1;
    /**
     * Space between lines
     * @default 1.4
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    lineSpacing = 1.4;
    /**
     * Space between letters
     * @default 1
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    letterSpacing = 1;
    /**
     * Align between left, center, right
     * @default center
     */
    align = jscadTextAlignEnum.center;
    /**
     * Offset the extrusion
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    extrudeOffset = 0;
}
export class CylinderTextDto {
    constructor(text?: string, extrusionHeight?: number, extrusionSize?: number, segments?: number, xOffset?: number, yOffset?: number, height?: number, lineSpacing?: number, letterSpacing?: number, align?: jscadTextAlignEnum, extrudeOffset?: number) {
        if (text !== undefined) { this.text = text; }
        if (extrusionHeight !== undefined) { this.extrusionHeight = extrusionHeight; }
        if (extrusionSize !== undefined) { this.extrusionSize = extrusionSize; }
        if (segments !== undefined) { this.segments = segments; }
        if (xOffset !== undefined) { this.xOffset = xOffset; }
        if (yOffset !== undefined) { this.yOffset = yOffset; }
        if (height !== undefined) { this.height = height; }
        if (lineSpacing !== undefined) { this.lineSpacing = lineSpacing; }
        if (letterSpacing !== undefined) { this.letterSpacing = letterSpacing; }
        if (align !== undefined) { this.align = align; }
        if (extrudeOffset !== undefined) { this.extrudeOffset = extrudeOffset; }
    }
    /**
     * Text to write
     * @default Hello World
     */
    text = "Hello World";
    /**
     * Height of the cylinder
     * @default 0.5
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    extrusionHeight = 0.5;
    /**
     * Radius of the cylinder
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    extrusionSize = 0.1;
    /**
     * Segment subdivision for cylinder
     * @default 24
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    segments = 24;
    /**
     * X offset of the text
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    xOffset = 0;
    /**
     * Y offset of the text
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1 
     */
    yOffset = 0;
    /**
     * Height of the text
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    height = 1;
    /**
     * Space between lines
     * @default 1.4
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    lineSpacing = 1.4;
    /**
     * Space between letters
     * @default 1
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    letterSpacing = 1;
    /**
     * Align between left, center, right
     * @default center
     */
    align = jscadTextAlignEnum.center;
    /**
     * Offset the extrusion
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    extrudeOffset = 0;
}
export class SphereTextDto {
    constructor(text?: string, radius?: number, segments?: number, xOffset?: number, yOffset?: number, height?: number, lineSpacing?: number, letterSpacing?: number, align?: jscadTextAlignEnum, extrudeOffset?: number) {
        if (text !== undefined) { this.text = text; }
        if (radius !== undefined) { this.radius = radius; }
        if (segments !== undefined) { this.segments = segments; }
        if (xOffset !== undefined) { this.xOffset = xOffset; }
        if (yOffset !== undefined) { this.yOffset = yOffset; }
        if (height !== undefined) { this.height = height; }
        if (lineSpacing !== undefined) { this.lineSpacing = lineSpacing; }
        if (letterSpacing !== undefined) { this.letterSpacing = letterSpacing; }
        if (align !== undefined) { this.align = align; }
        if (extrudeOffset !== undefined) { this.extrudeOffset = extrudeOffset; }
    }
    /**
     * Text to write
     * @default Hello World
     */
    text = "Hello World";
    /**
     * Radius of the spheres
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    radius = 0.1;
    /**
     * Segment subdivision for sphere
     * @default 24
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    segments = 24;
    /**
     * X offset of the text
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    xOffset = 0;
    /**
     * Y offset of the text
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    yOffset = 0;
    /**
     * Height of the text
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    height = 1;
    /**
     * Space between lines
     * @default 1.4
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    lineSpacing = 1.4;
    /**
     * Space between letters
     * @default 1
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    letterSpacing = 1;
    /**
     * Align between left, center, right
     * @default center
     */
    align = jscadTextAlignEnum.center;
    /**
     * Offset the extrusion
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    extrudeOffset = 0;
}
export class FromPolygonPoints {
    constructor(polygonPoints?: Base.Point3[][]) {
        if (polygonPoints !== undefined) { this.polygonPoints = polygonPoints; }
    }
    /**
     * Points describing polygons
     */
    polygonPoints!: Base.Point3[][];
}
