import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createCoreVectorSpanBlock() {

    Blocks['core_vector_span'] = {
        init: function () {
            this.appendValueInput("Min")
                .setCheck("Number")
                .setAlign(ALIGN_RIGHT)
                .appendField("Span between min");
            this.appendValueInput("Max")
                .setCheck("Number")
                .setAlign(ALIGN_RIGHT)
                .appendField("and max");
            this.appendValueInput("Step")
                .setCheck("Number")
                .setAlign(ALIGN_RIGHT)
                .appendField("at a step of");
            this.setOutput(true, "Array");
            this.setColour("#fff");
            this.setTooltip("Populates array of numbers between minimum and maximum provided bounds in step.");
            this.setHelpUrl("");
        }
    };

    JavaScript['core_vector_range'] = function (block) {
        var value_min = JavaScript.valueToCode(block, 'Min', JavaScript.ORDER_ATOMIC);
        var value_max = JavaScript.valueToCode(block, 'Max', JavaScript.ORDER_ATOMIC);
        var value_step = JavaScript.valueToCode(block, 'Step', JavaScript.ORDER_ATOMIC);

        var code = `(() => verb.core.Vec.span(${value_min}, ${value_max}, ${value_step}))()`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}