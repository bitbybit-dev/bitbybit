import { Base } from "@bitbybit-dev/base";
import * as Inputs from "../inputs/jscad-inputs";
import * as JSCAD from "@jscad/modeling";

/**
 * Contains various functions for solid 3D texts from JSCAD library https://github.com/jscad/OpenJSCAD.org
 * Thanks JSCAD community for developing this kernel
 */
export class JSCADText {

    constructor(private readonly jscad: typeof JSCAD) { }

    /**
     * Creates a text that is based on chain hulling cylinders
     * @param inputs Cylindrical text parameters
     * @returns List of solids for text
     * @group text
     * @shortname cylindrical
     * @drawable true
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
     * Creates a text that is based on chain hulling spheres
     * @param inputs Spherical text parameters
     * @returns List of solids for text
     * @group text
     * @shortname spherical
     * @drawable true
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
     * Creates a vector text
     * @param inputs Vector text parameters
     * @returns List of polygons
     * @group text
     * @shortname vector
     * @drawable false
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
