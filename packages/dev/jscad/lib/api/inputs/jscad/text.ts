// A fragment of the JSCAD inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../jscad-inputs.ts. Edit here, then regenerate.
import { Base } from "../base-inputs";
import { jscadTextAlignEnum } from "./entities-and-enums";

/**
 * Feeds `text.createVectorText` with the text and the font options: where the text starts, how tall
 * a capital letter is, the spacing of lines and letters, the alignment of several lines and the
 * stroke compensation. `CylinderTextDto` and `SphereTextDto` reuse them.
 */
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
     * The characters to write; a newline starts a new line and a character outside plain ASCII
     * becomes a question mark
     * @default Hello World
     */
    text = "Hello World";
    /**
     * Number of straight pieces used for curved strokes; more makes letters rounder
     * @default 24
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    segments = 24;
    /**
     * Where the text starts along X, in model units
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    xOffset = 0;
    /**
     * Where the baseline of the first line sits along Y, in model units
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    yOffset = 0;
    /**
     * Height of a capital letter, in model units; the whole text scales with it
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    height = 1;
    /**
     * Step from one line down to the next as a multiple of the letter height; 1.4 leaves a 40
     * percent gap
     * @default 1.4
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    lineSpacing = 1.4;
    /**
     * Multiplies the step from one letter to the next; 1 is the font's own spacing and 2 spreads
     * letters twice as far apart
     * @default 1
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    letterSpacing = 1;
    /**
     * How the lines of a multi-line text line up: to the left, the center or the right
     * @default center
     */
    align = jscadTextAlignEnum.center;
    /**
     * Thickness the strokes will get later, in model units; the outlines are pulled in by half of
     * it so letters keep their size once thick
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    extrudeOffset = 0;
}
/**
 * Feeds `text.cylindricalText`: the text and font options of `TextDto` plus the size of the
 * cylinders every stroke is chained from.
 */
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
     * The characters to write; a newline starts a new line and a character outside plain ASCII
     * becomes a question mark
     * @default Hello World
     */
    text = "Hello World";
    /**
     * Length of the cylinders along Z, in model units; the strokes sit on the XY plane with half of
     * it on each side
     * @default 0.5
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    extrusionHeight = 0.5;
    /**
     * Radius of the cylinders, in model units, which is half the thickness of the strokes
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    extrusionSize = 0.1;
    /**
     * Number of flat sides around each cylinder and pieces in curved strokes; more makes the
     * letters rounder
     * @default 24
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    segments = 24;
    /**
     * Where the text starts along X before it is centered, in model units
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    xOffset = 0;
    /**
     * Where the baseline of the first line sits along Y, in model units
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    yOffset = 0;
    /**
     * Height of a capital letter, in model units; the whole text scales with it
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    height = 1;
    /**
     * Step from one line down to the next as a multiple of the letter height; 1.4 leaves a 40
     * percent gap
     * @default 1.4
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    lineSpacing = 1.4;
    /**
     * Multiplies the step from one letter to the next; 1 is the font's own spacing and 2 spreads
     * letters twice as far apart
     * @default 1
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    letterSpacing = 1;
    /**
     * How the lines of a multi-line text line up: to the left, the center or the right
     * @default center
     */
    align = jscadTextAlignEnum.center;
    /**
     * Pulls the strokes inward by half this amount, in model units, so thick strokes keep the
     * intended letter size
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    extrudeOffset = 0;
}
/**
 * Feeds `text.sphericalText`: the text and font options of `TextDto` plus the size of the spheres
 * every stroke is chained from.
 */
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
     * The characters to write; a newline starts a new line and a character outside plain ASCII
     * becomes a question mark
     * @default Hello World
     */
    text = "Hello World";
    /**
     * Radius of the spheres, in model units, which is half the thickness of the strokes
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    radius = 0.1;
    /**
     * Number of facets around each sphere and pieces in curved strokes; more makes the letters
     * rounder
     * @default 24
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    segments = 24;
    /**
     * Where the text starts along X before it is centered, in model units
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    xOffset = 0;
    /**
     * Where the baseline of the first line sits along Y, in model units
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    yOffset = 0;
    /**
     * Height of a capital letter, in model units; the whole text scales with it
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    height = 1;
    /**
     * Step from one line down to the next as a multiple of the letter height; 1.4 leaves a 40
     * percent gap
     * @default 1.4
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    lineSpacing = 1.4;
    /**
     * Multiplies the step from one letter to the next; 1 is the font's own spacing and 2 spreads
     * letters twice as far apart
     * @default 1
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    letterSpacing = 1;
    /**
     * How the lines of a multi-line text line up: to the left, the center or the right
     * @default center
     */
    align = jscadTextAlignEnum.center;
    /**
     * Pulls the strokes inward by half this amount, in model units, so thick strokes keep the
     * intended letter size
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    extrudeOffset = 0;
}
/**
 * Feeds `shapes.fromPolygonPoints` with the faces of a solid, each as the list of points around it,
 * listed clockwise as seen from outside.
 */
export class FromPolygonPoints {
    constructor(polygonPoints?: Base.Point3[][]) {
        if (polygonPoints !== undefined) { this.polygonPoints = polygonPoints; }
    }
    /**
     * One list of points per face, each going around the face clockwise as seen from outside; the
     * lists are reversed in place while the solid is built
     */
    polygonPoints!: Base.Point3[][];
}
