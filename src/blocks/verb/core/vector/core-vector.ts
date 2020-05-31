import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createCoreVector3Block() {

    Blocks['verb_core_vector'] = {
        init: function() {
          this.appendValueInput("X")
              .setCheck("Number")
              .setAlign(ALIGN_RIGHT)
              .appendField("x");
          this.appendValueInput("Y")
              .setCheck("Number")
              .setAlign(ALIGN_RIGHT)
              .appendField("y");
          this.appendValueInput("Z")
              .setCheck("Number")
              .setAlign(ALIGN_RIGHT)
              .appendField("z");
          this.setInputsInline(true);
          this.setOutput(true, "Array");
          this.setColour("#fff");
       this.setTooltip("Creates a 3 dimensional direction vector.");
       this.setHelpUrl("");
        }
      };

    JavaScript['verb_core_vector'] = function(block) {
        var value_x = JavaScript.valueToCode(block, 'X', JavaScript.ORDER_ATOMIC);
        var value_y = JavaScript.valueToCode(block, 'Y', JavaScript.ORDER_ATOMIC);
        var value_z = JavaScript.valueToCode(block, 'Z', JavaScript.ORDER_ATOMIC);
        
        var code = `[${value_x ? value_x : 0}, ${value_y ? value_y : 0}, ${value_z ? value_z : 0}]`;
        return [code, JavaScript.ORDER_ATOMIC];
      };
}