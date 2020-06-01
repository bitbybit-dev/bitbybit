import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createSurfaceClosestPointBlock() {

    Blocks['verb_geometry_nurbs_surface_closest_point'] = {
        init: function () {
            this.appendValueInput("Surface")
                .setCheck("NurbsSurface")
                .setAlign(ALIGN_RIGHT)
                .appendField("Closest point on the surface");
            this.appendValueInput("Point")
                .setCheck("Array")
                .setAlign(ALIGN_RIGHT)
                .appendField("from point");
            this.setOutput(true, "Array");
            this.setColour("#fff");
            this.setTooltip("Get the closest point on the surface from arbitrary point in space.");
        }
    };

    JavaScript['verb_geometry_nurbs_surface_closest_point'] = function (block) {
        var value_surface = JavaScript.valueToCode(block, 'Surface', JavaScript.ORDER_ATOMIC);
        var value_point = JavaScript.valueToCode(block, 'Point', JavaScript.ORDER_ATOMIC);

        var code = `
(() => ${value_surface}.closestPoint(${value_point}))()
`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}