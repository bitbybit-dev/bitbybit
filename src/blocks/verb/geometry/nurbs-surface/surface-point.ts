import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createSurfacePointBlock() {

    Blocks['verb_geometry_nurbs_surface_point'] = {
        init: function () {
            this.appendValueInput("Surface")
                .setCheck("NurbsSurface")
                .setAlign(ALIGN_RIGHT)
                .appendField("Point on the surface");
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
            this.setTooltip("Get the point on the surface at uv coordinate.");
        }
    };

    JavaScript['verb_geometry_nurbs_surface_point'] = function (block) {
        let value_surface = JavaScript.valueToCode(block, 'Surface', JavaScript.ORDER_ATOMIC);
        let value_u = JavaScript.valueToCode(block, 'U', JavaScript.ORDER_ATOMIC);
        let value_v = JavaScript.valueToCode(block, 'V', JavaScript.ORDER_ATOMIC);

        let code = `
(() => ${value_surface}.point(${value_u}, ${value_v}))()
`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}