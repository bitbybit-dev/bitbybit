import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createSurfaceClosestParamBlock() {

    Blocks['verb_geometry_nurbs_surface_closest_param'] = {
        init: function () {
            this.appendValueInput("Surface")
                .setCheck("NurbsSurface")
                .setAlign(ALIGN_RIGHT)
                .appendField("Closest parameter on the surface");
            this.appendValueInput("Point")
                .setCheck("Array")
                .setAlign(ALIGN_RIGHT)
                .appendField("from point");
            this.setOutput(true, "UV");
            this.setColour("#fff");
            this.setTooltip("Get the closest UV type parameter on the surface from arbitrary point in space.");
        }
    };

    JavaScript['verb_geometry_nurbs_surface_closest_param'] = function (block) {
        let value_surface = JavaScript.valueToCode(block, 'Surface', JavaScript.ORDER_ATOMIC);
        let value_point = JavaScript.valueToCode(block, 'Point', JavaScript.ORDER_ATOMIC);

        let code = `
(() => ${value_surface}.closestParam(${value_point}))()
`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}