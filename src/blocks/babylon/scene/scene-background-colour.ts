import { Blocks } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createSceneBackgroundColourBlock() {
    Blocks['babylon_scene_background_colour'] = {
        init: function () {
            this.appendValueInput("colour")
                .setCheck("Colour")
                .appendField("Scene background colour");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour("#fff");
            this.setTooltip("Changes the default scene background colour.");
            this.setHelpUrl("https://doc.babylonjs.com/babylon101/environment");
        }
    };

    JavaScript['babylon_scene_background_colour'] = function (block) {
        let value_colour = JavaScript.valueToCode(block, 'colour', JavaScript.ORDER_ATOMIC);

        return `
scene.clearColor = BABYLON.Color3.FromHexString(${value_colour});
`;
    };
}