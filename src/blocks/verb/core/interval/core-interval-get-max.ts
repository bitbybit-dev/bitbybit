import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createCoreIntervalGetMaxBlock() {

    Blocks['verb_core_interval_get_max'] = {
        init: function () {
            this.appendValueInput("Interval")
                .setCheck("Interval")
                .setAlign(ALIGN_RIGHT)
                .appendField("Maximum bound of the interval");
            this.setOutput(true, "Number");
            this.setColour("#fff");
            this.setTooltip("Gets maximum bound of the interval.");
            this.setHelpUrl("");
        }
    };

    JavaScript['verb_core_interval_get_max'] = function (block) {
        let value_interval = JavaScript.valueToCode(block, 'Interval', JavaScript.ORDER_ATOMIC);
        
        let code = `${value_interval}.max`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}