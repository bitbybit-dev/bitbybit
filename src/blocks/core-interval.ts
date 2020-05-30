import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createCoreIntervalBlock() {

    Blocks['core_interval'] = {
        init: function () {
            this.appendValueInput("Min")
                .setCheck("Number")
                .setAlign(ALIGN_RIGHT)
                .appendField("Interval with min");
            this.appendValueInput("Max")
                .setCheck("Number")
                .setAlign(ALIGN_RIGHT)
                .appendField("and max");
            this.setOutput(true, "Interval");
            this.setColour("#fff");
            this.setTooltip("Constructs an interval object of min and max values.");
            this.setHelpUrl("");
        }
    };

    JavaScript['core_interval'] = function (block) {
        var value_min = JavaScript.valueToCode(block, 'Min', JavaScript.ORDER_ATOMIC);
        var value_max = JavaScript.valueToCode(block, 'Max', JavaScript.ORDER_ATOMIC);
        
        var code = `{min: ${value_min}, max: ${value_max}}`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}