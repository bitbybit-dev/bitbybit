import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createSurfaceDegreeUBlock() {

    Blocks['verb_geometry_nurbs_surface_degree_u'] = {
        init: function () {
            this.appendValueInput("Surface")
                .setCheck("NurbsSurface")
                .setAlign(ALIGN_RIGHT)
                .appendField("U degree of the surface");
            this.setOutput(true, "Number");
            this.setColour("#fff");
            this.setTooltip("Get the u degree of the surface.");
        }
    };

    JavaScript['verb_geometry_nurbs_surface_degree_u'] = function (block) {
        let value_surface = JavaScript.valueToCode(block, 'Surface', JavaScript.ORDER_ATOMIC);

        let code = `
(() => ${value_surface}.degreeU())()
`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}