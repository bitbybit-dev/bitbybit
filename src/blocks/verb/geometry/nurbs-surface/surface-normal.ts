import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createSurfaceNormalBlock() {

    Blocks['verb_geometry_nurbs_surface_normal'] = {
        init: function () {
            this.appendValueInput("Surface")
                .setCheck("NurbsSurface")
                .setAlign(ALIGN_RIGHT)
                .appendField("Normal on the surface");
            this.appendValueInput("U")
                .setCheck("Number")
                .setAlign(ALIGN_RIGHT)
                .appendField("at u");
            this.appendValueInput("V")
                .setCheck("Number")
                .setAlign(ALIGN_RIGHT)
                .appendField("and at v");
            this.setOutput(true, "Array");
            this.setColour("#fff");
            this.setTooltip("Get the normal on the surface at uv coordinate.");
        }
    };

    JavaScript['verb_geometry_nurbs_surface_normal'] = function (block) {
        var value_surface = JavaScript.valueToCode(block, 'Surface', JavaScript.ORDER_ATOMIC);
        var value_u = JavaScript.valueToCode(block, 'U', JavaScript.ORDER_ATOMIC);
        var value_v = JavaScript.valueToCode(block, 'V', JavaScript.ORDER_ATOMIC);

        var code = `
(() => ${value_surface}.normal(${value_u}, ${value_v}))()
`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}