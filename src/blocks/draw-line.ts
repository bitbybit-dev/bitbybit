import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createDrawLineBlock() {

    Blocks['functions_draw_line'] = {
        init: function () {
            this.appendValueInput("Line")
                .setCheck("Line")
                .setAlign(ALIGN_RIGHT)
                .appendField("Draw line");
            this.appendValueInput("Colour")
                .setCheck("Colour")
                .setAlign(ALIGN_RIGHT)
                .appendField("in colour");
            this.appendValueInput("Opacity")
                .setCheck("Number")
                .setAlign(ALIGN_RIGHT)
                .appendField("opacity");
            this.appendValueInput("Width")
                .setCheck("Number")
                .setAlign(ALIGN_RIGHT)
                .appendField("and width");
            this.setColour("#fff");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setTooltip("Draws a coloured line in space of selected width");
            this.setHelpUrl("");
        }
    };

    JavaScript['functions_draw_line'] = function (block) {
        var value_line = JavaScript.valueToCode(block, 'Line', JavaScript.ORDER_ATOMIC);
        var value_colour = JavaScript.valueToCode(block, 'Colour', JavaScript.ORDER_ATOMIC);
        var value_opacity = JavaScript.valueToCode(block, 'Opacity', JavaScript.ORDER_ATOMIC);
        var value_width = JavaScript.valueToCode(block, 'Width', JavaScript.ORDER_ATOMIC);

        var code = `
var drawLine = () => {
    var line = ${value_line};
    var width = ${value_width ? value_width : 3};

    var points = [new BABYLON.Vector3(line.start[0],line.start[1],line.start[2]), new BABYLON.Vector3(line.end[0],line.end[1],line.end[2])];
    var lines = BABYLON.MeshBuilder.CreateLines("lines${Math.random()}", {points}, scene);
    lines.enableEdgesRendering();	
	lines.edgesWidth = width;
    var edgeColor = BABYLON.Color3.FromHexString(${value_colour});
    lines.edgesColor = new BABYLON.Color4(edgeColor.r, edgeColor.g, edgeColor.b, ${value_opacity});
}
drawLine();
        `;
        return code;
    };
}