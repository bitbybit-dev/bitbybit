import * as Inputs from "../../../api/inputs/inputs";

/**
 * Contains various functions for colors from JSCAD library https://github.com/jscad/OpenJSCAD.org
 * Thanks JSCAD community for developing this kernel
 */
export class JSCADColors {

    constructor(private readonly jscad: any) { }


    colorize(inputs: Inputs.JSCAD.ColorizeDto): Inputs.JSCAD.JSCADEntity | Inputs.JSCAD.JSCADEntity[] {
        const geometry = inputs.geometry;
        const color = inputs.color;
        return this.jscad.colors.colorize(this.jscad.colors.hexToRgb(color), geometry);
    }

}
