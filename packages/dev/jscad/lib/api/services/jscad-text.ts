import { Base } from "@bitbybit-dev/base";
import * as Inputs from "../inputs/jscad-inputs";
import * as JSCAD from "@jscad/modeling";

/**
 * Writing text with JSCAD's built-in stroke font. `createVectorText` gives the pen strokes of the
 * text as lists of 2D points in the XY plane; `cylindricalText` and `sphericalText` turn every
 * stroke into a solid by chaining hulled cylinders or spheres along it, centered on the origin. The
 * text `height` is the height of a capital letter in model units.
 */
export class JSCADText {

    constructor(private readonly jscad: typeof JSCAD) { }

    /**
     * Writes text as solids: every pen stroke becomes a chain of cylinders standing along Z, hulled
     * together into one smooth solid, so a letter like A gives several solids.
     *
     * The strokes lie in the XY plane, centered on the origin, and the cylinders are
     * `extrusionHeight` long with half above and half below the plane.
     * @param inputs - The text, the cylinder height and radius, the segment count and the font options
     * @returns One solid per pen stroke
     * @group text
     * @shortname cylindrical
     * @drawable true
     * @example
     * ```typescript
     * const letters = await bitbybit.jscad.text.cylindricalText({ text: "Hello", extrusionHeight: 2, extrusionSize: 0.5, segments: 16, xOffset: 0, yOffset: 0, height: 10, lineSpacing: 1.4, letterSpacing: 1, align: Bit.Inputs.JSCAD.jscadTextAlignEnum.center, extrudeOffset: 0 });
     * ```
     */
    cylindricalText(inputs: Inputs.JSCAD.CylinderTextDto): Inputs.JSCAD.JSCADEntity[] {
        const text = this.createVectorText(inputs);
        this.adjustTextToBeOnCenter(text);
        return text.map(txt => {
            const cylinders = txt.map(center => {
                return this.jscad.primitives.cylinder({
                    center: [center[0], center[1], 0],
                    height: inputs.extrusionHeight,
                    radius: inputs.extrusionSize,
                    segments: inputs.segments,
                });
            });
            return this.jscad.hulls.hullChain(...cylinders);
        });
    }

    /**
     * Writes text as solids: every pen stroke becomes a chain of spheres hulled together into one
     * rounded solid, so a letter like A gives several solids.
     *
     * The strokes lie in the XY plane, centered on the origin, and the spheres of `radius` sit on
     * that plane.
     * @param inputs - The text, the sphere radius, the segment count and the font options
     * @returns One solid per pen stroke
     * @group text
     * @shortname spherical
     * @drawable true
     * @example
     * ```typescript
     * const letters = await bitbybit.jscad.text.sphericalText({ text: "Hello", radius: 0.5, segments: 16, xOffset: 0, yOffset: 0, height: 10, lineSpacing: 1.4, letterSpacing: 1, align: Bit.Inputs.JSCAD.jscadTextAlignEnum.center, extrudeOffset: 0 });
     * ```
     */
    sphericalText(inputs: Inputs.JSCAD.SphereTextDto): Inputs.JSCAD.JSCADEntity[] {
        const text = this.createVectorText(inputs);
        this.adjustTextToBeOnCenter(text);
        return text.map(txt => {
            const spheres = txt.map(center => {
                return this.jscad.primitives.sphere({
                    center: [center[0], center[1], 0],
                    radius: inputs.radius,
                    segments: inputs.segments,
                });
            });
            return this.jscad.hulls.hullChain(...spheres);
        });
    }

    private adjustTextToBeOnCenter(text: any[]): void {
        let maxX = 0;
        text.forEach(txt => {
            txt.forEach((center: Base.Point3) => {
                if (center[0] > maxX) {
                    maxX = center[0];
                }
            });
        });
        const compensate = maxX / 2;
        text.forEach(txt => {
            txt.forEach((center: Base.Point3) => {
                let z = center[0];
                z = z - compensate;
                center[0] = z;
            });
        });
    }

    /**
     * Writes text as pen strokes: each stroke is a list of 2D points in the XY plane, and a letter
     * may take several.
     *
     * The text starts at `xOffset`, `yOffset` and is not centered; `height` is the height of a
     * capital letter, `lineSpacing` and `letterSpacing` scale the gaps and `align` places the lines
     * of a multi-line text.
     * @param inputs - The text and the font options
     * @returns The strokes as lists of 2D points
     * @group text
     * @shortname vector
     * @drawable false
     * @example
     * ```typescript
     * const strokes = await bitbybit.jscad.text.createVectorText({ text: "Hi", segments: 16, xOffset: 0, yOffset: 0, height: 10, lineSpacing: 1.4, letterSpacing: 1, align: Bit.Inputs.JSCAD.jscadTextAlignEnum.center, extrudeOffset: 0 });
     * ```
     */
    createVectorText(inputs: Inputs.JSCAD.TextDto): Base.Point2[][] {
        return this.jscad.text.vectorText({
            input: inputs.text,
            xOffset: inputs.xOffset,
            yOffset: inputs.yOffset,
            height: inputs.height,
            lineSpacing: inputs.lineSpacing,
            letterSpacing: inputs.letterSpacing,
            align: inputs.align,
            extrudeOffset: inputs.extrudeOffset,
        });
    }
}
