import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createCoreUVBlock() {

    Blocks['verb_core_uv'] = {
        init: function () {
            this.appendValueInput("U")
                .setCheck("Number")
                .setAlign(ALIGN_RIGHT)
                .appendField("UV parameter with u");
            this.appendValueInput("V")
                .setCheck("Number")
                .setAlign(ALIGN_RIGHT)
                .appendField("and v");
            this.setOutput(true, "UV");
            this.setColour("#fff");
            this.setTooltip("Constructs uv parameter object with u and v values.");
            this.setHelpUrl("");
        }
    };

    JavaScript['verb_core_uv'] = function (block) {
        let value_u = JavaScript.valueToCode(block, 'U', JavaScript.ORDER_ATOMIC);
        let value_v = JavaScript.valueToCode(block, 'V', JavaScript.ORDER_ATOMIC);
        
        let code = `{u: ${value_u}, v: ${value_v}}`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}