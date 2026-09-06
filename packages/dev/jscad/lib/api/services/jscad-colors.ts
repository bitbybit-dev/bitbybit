import * as Inputs from "../inputs/jscad-inputs";
import * as JSCAD from "@jscad/modeling";

/**
 * Contains functions for colorizing objects
 */
export class JSCADColors {

    constructor(private readonly jscad: typeof JSCAD) { }


    /**
     * Colorizes geometry of jscad. If geometry is in the array it will colorize all items and return them. If geometry is a single item it will return a single item.
     * Keep in mind that colorized geometry in jscad will always be drawn in that color even if you try to change it via draw options.
     * @param inputs contain geometry and hex color
     * @returns Colorized geometry of jsacd
     * @group colorize
     * @shortname colorize geometry
     * @drawable true
     */
    colorize(inputs: Inputs.JSCAD.ColorizeDto): Inputs.JSCAD.JSCADEntity | Inputs.JSCAD.JSCADEntity[] {
        const geometry = inputs.geometry;
        const color = inputs.color;
        return this.jscad.colors.colorize(this.jscad.colors.hexToRgb(color), geometry);
    }

}
