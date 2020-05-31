import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createCoreVectorDomainBlock() {

    Blocks['verb_core_vector_domain'] = {
        init: function () {
            this.appendValueInput("Vector")
                .setCheck("Vector3")
                .setAlign(ALIGN_RIGHT)
                .appendField("Domain of the vector");
            this.setOutput(true, "Number");
            this.setColour("#fff");
            this.setTooltip("Measures a domain of the vector.");
            this.setHelpUrl("");
        }
    };

    JavaScript['verb_core_vector_domain'] = function (block) {
        var value_vector = JavaScript.valueToCode(block, 'Vector', JavaScript.ORDER_ATOMIC);
        
        var code = `(() => verb.core.Vec.domain(${value_vector}))()`;
        return [code, JavaScript.ORDER_ATOMIC];
    };
}