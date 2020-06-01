import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createCoreUVGetUBlock() {

    Blocks['verb_core_uv_get_u'] = {
        init: function () {
            this.appendValueInput("UV")
                .setCheck("UV")
                .setAlign(ALIGN_RIGHT)
                .appendField("Get u from UV");
            this.setOutput(true, "Number");
            this.setColour("#fff");
            this.setTooltip("Gets u param of the UV object.");
            this.setHelpUrl("");
        }
    };

    JavaScript['verb_core_uv_get_u'] = function (block) {
        var value_uv = JavaScript.valueToCode(block, 'UV', JavaScript.ORDER_ATOMIC);
        
        var code = `${value_uv}.u`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}