import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createSurfaceCloneBlock() {

    Blocks['verb_geometry_nurbs_surface_clone'] = {
        init: function () {
            this.appendValueInput("Surface")
                .setCheck("NurbsSurface")
                .setAlign(ALIGN_RIGHT)
                .appendField("Clone the surface");
            this.setOutput(true, "NurbsSurface");
            this.setColour("#fff");
            this.setTooltip("Clones the surface.");
        }
    };

    JavaScript['verb_geometry_nurbs_surface_clone'] = function (block) {
        let value_surface = JavaScript.valueToCode(block, 'Surface', JavaScript.ORDER_ATOMIC);

        let code = `
(() => ${value_surface}.clone())()
`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}