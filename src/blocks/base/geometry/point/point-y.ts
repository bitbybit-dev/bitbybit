import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createPointYBlock() {

    Blocks['base_geometry_point_y'] = {
        init: function () {
            this.appendValueInput("Point")
                .setCheck("Vector3")
                .setAlign(ALIGN_RIGHT)
                .appendField("Y coordinate of the point");
            this.setOutput(true, "Number");
            this.setColour("#fff");
            this.setTooltip("Gets Y coordinate of the point.");
            this.setHelpUrl("");
        }
    };

    JavaScript['base_geometry_point_y'] = function (block) {
        var value_point = JavaScript.valueToCode(block, 'Point', JavaScript.ORDER_ATOMIC);
        
        var code = `${value_point}[1]`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}