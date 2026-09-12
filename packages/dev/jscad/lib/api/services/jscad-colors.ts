import * as Inputs from "../inputs/jscad-inputs";
import * as JSCAD from "@jscad/modeling";

/**
 * Giving JSCAD geometry a color of its own. A colored entity is always drawn in that color, ahead
 * of whatever color the drawing options ask for; the color survives transforms but a boolean result
 * starts uncolored again.
 */
export class JSCADColors {

    constructor(private readonly jscad: typeof JSCAD) { }


    /**
     * Gives a solid, a 2D shape or a path a fixed color from a hex string, returning a colored
     * copy; a list gives a list of colored copies in the same order.
     *
     * The color wins over the color of the drawing options, so leave the entity uncolored to
     * control it there.
     * @param inputs - The geometry, or a list of it, and the hex color
     * @returns The colored geometry, one or a list to match the input
     * @group colorize
     * @shortname colorize geometry
     * @drawable true
     * @example
     * ```typescript
     * const red = await bitbybit.jscad.colors.colorize({ geometry: cube, color: "#ff0000" });
     * ```
     */
    colorize(inputs: Inputs.JSCAD.ColorizeDto): Inputs.JSCAD.JSCADEntity | Inputs.JSCAD.JSCADEntity[] {
        const geometry = inputs.geometry;
        const color = inputs.color;
        return this.jscad.colors.colorize(this.jscad.colors.hexToRgb(color), geometry);
    }

}
