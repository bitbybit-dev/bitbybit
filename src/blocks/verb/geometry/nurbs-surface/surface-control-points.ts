import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createSurfaceControlPointsBlock() {

    Blocks['verb_geometry_nurbs_surface_control_points'] = {
        init: function () {
            this.appendValueInput("Surface")
                .setCheck("NurbsSurface")
                .setAlign(ALIGN_RIGHT)
                .appendField("Control points of the surface");
            this.setOutput(true, "Array");
            this.setColour("#fff");
            this.setTooltip("Get the two dimensional array of control points for surface.");
        }
    };

    JavaScript['verb_geometry_nurbs_surface_control_points'] = function (block) {
        var value_surface = JavaScript.valueToCode(block, 'Surface', JavaScript.ORDER_ATOMIC);

        var code = `
(() => ${value_surface}.controlPoints())()
`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}