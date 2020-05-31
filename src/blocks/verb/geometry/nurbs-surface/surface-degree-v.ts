import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createSurfaceDegreeVBlock() {

    Blocks['verb_geometry_nurbs_surface_degree_v'] = {
        init: function () {
            this.appendValueInput("Surface")
                .setCheck("NurbsSurface")
                .setAlign(ALIGN_RIGHT)
                .appendField("V degree of the surface");
            this.setOutput(true, "Number");
            this.setColour("#fff");
            this.setTooltip("Get the v degree of the surface.");
        }
    };

    JavaScript['verb_geometry_nurbs_surface_degree_v'] = function (block) {
        var value_surface = JavaScript.valueToCode(block, 'Surface', JavaScript.ORDER_ATOMIC);

        var code = `
(() => ${value_surface}.degreeV())()
`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}