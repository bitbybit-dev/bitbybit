import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createCoreUVGetVBlock() {

    Blocks['verb_core_uv_get_v'] = {
        init: function () {
            this.appendValueInput("UV")
                .setCheck("UV")
                .setAlign(ALIGN_RIGHT)
                .appendField("Get v from UV");
            this.setOutput(true, "Number");
            this.setColour("#fff");
            this.setTooltip("Gets v param of the UV object.");
            this.setHelpUrl("");
        }
    };

    JavaScript['verb_core_uv_get_v'] = function (block) {
        var value_uv = JavaScript.valueToCode(block, 'UV', JavaScript.ORDER_ATOMIC);
        
        var code = `${value_uv}.v`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}