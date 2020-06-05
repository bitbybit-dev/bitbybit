import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createPointBlock() {

    Blocks['base_geometry_point'] = {
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
       this.setTooltip("Creates a point in space");
       this.setHelpUrl("https://doc.babylonjs.com/api/classes/babylon.vector3");
        }
      };

    JavaScript['base_geometry_point'] = function(block) {
        let value_x = JavaScript.valueToCode(block, 'X', JavaScript.ORDER_ATOMIC);
        let value_y = JavaScript.valueToCode(block, 'Y', JavaScript.ORDER_ATOMIC);
        let value_z = JavaScript.valueToCode(block, 'Z', JavaScript.ORDER_ATOMIC);
        
        let code = `[${value_x ? value_x : 0}, ${value_y ? value_y : 0}, ${value_z ? value_z : 0}]`;
        return [code, JavaScript.ORDER_ATOMIC];
      };
}