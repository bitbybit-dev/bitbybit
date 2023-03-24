import * as Inputs from '../../../api/inputs/inputs';

/**
 * Contains various functions for solid 3D texts from JSCAD library https://github.com/jscad/OpenJSCAD.org
 * Thanks JSCAD community for developing this kernel
 */
export class JSCADText {

    constructor(private readonly jscad: any) { }

    cylindricalText(inputs: Inputs.JSCAD.CylinderTextDto): any {
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

    sphericalText(inputs: Inputs.JSCAD.SphereTextDto): any {
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
            txt.forEach(center => {
                if (center[0] > maxX) {
                    maxX = center[0];
                }
            });
        });
        const compensate = maxX / 2;
        text.forEach(txt => {
            txt.forEach(center => {
                let z = center[0];
                z = z - compensate;
                center[0] = z;
            });
        });
    }

    createVectorText(inputs: Inputs.JSCAD.TextDto): number[][] {
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
