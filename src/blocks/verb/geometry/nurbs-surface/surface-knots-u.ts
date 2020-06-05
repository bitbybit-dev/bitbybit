import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createSurfaceKnotsUBlock() {

    Blocks['verb_geometry_nurbs_surface_knots_u'] = {
        init: function () {
            this.appendValueInput("Surface")
                .setCheck("NurbsSurface")
                .setAlign(ALIGN_RIGHT)
                .appendField("U knots of the surface");
            this.setOutput(true, "Array");
            this.setColour("#fff");
            this.setTooltip("Get the u knots of the surface.");
        }
    };

    JavaScript['verb_geometry_nurbs_surface_knots_u'] = function (block) {
        let value_surface = JavaScript.valueToCode(block, 'Surface', JavaScript.ORDER_ATOMIC);

        let code = `
(() => ${value_surface}.knotsU())()
`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}