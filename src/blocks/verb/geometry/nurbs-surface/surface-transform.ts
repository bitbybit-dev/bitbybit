import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createSurfaceTransformBlock() {

    Blocks['verb_geometry_nurbs_surface_transform'] = {
        init: function () {
            this.appendValueInput("Surface")
                .setCheck("NurbsSurface")
                .setAlign(ALIGN_RIGHT)
                .appendField("Transform the surface");
            this.appendValueInput("Matrix")
                .setCheck("Matrix")
                .setAlign(ALIGN_RIGHT)
                .appendField("with matrix");
            this.setOutput(true, "Array");
            this.setColour("#fff");
            this.setTooltip("Transforms the surface by transformation matrix (translation, rotation, scale...).");
            this.setHelpUrl("");
        }
    };

    JavaScript['verb_geometry_nurbs_surface_transform'] = function (block) {
        let value_surface = JavaScript.valueToCode(block, 'Surface', JavaScript.ORDER_ATOMIC);
        let value_matrix = JavaScript.valueToCode(block, 'Matrix', JavaScript.ORDER_ATOMIC);

        let code = `
(() => ${value_surface}.transform(${value_matrix}))()
`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}