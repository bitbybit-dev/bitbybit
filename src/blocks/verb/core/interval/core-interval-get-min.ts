import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createCoreIntervalGetMinBlock() {

    Blocks['verb_core_interval_get_min'] = {
        init: function () {
            this.appendValueInput("Interval")
                .setCheck("Interval")
                .setAlign(ALIGN_RIGHT)
                .appendField("Minimum bound of the interval");
            this.setOutput(true, "Number");
            this.setColour("#fff");
            this.setTooltip("Gets minimum bound of the interval.");
            this.setHelpUrl("");
        }
    };

    JavaScript['verb_core_interval_get_min'] = function (block) {
        var value_interval = JavaScript.valueToCode(block, 'Interval', JavaScript.ORDER_ATOMIC);
        
        var code = `${value_interval}.min`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}