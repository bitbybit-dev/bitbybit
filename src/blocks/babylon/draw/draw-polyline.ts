import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createDrawPolylineBlock() {

    Blocks['babylon_draw_polyline'] = {
        init: function () {
            this.appendValueInput("Polyline")
                .setCheck("Polyline")
                .setAlign(ALIGN_RIGHT)
                .appendField("Draw polyline");
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

    JavaScript['babylon_draw_polyline'] = function (block) {
        var value_polyline = JavaScript.valueToCode(block, 'Polyline', JavaScript.ORDER_ATOMIC);
        var value_colour = JavaScript.valueToCode(block, 'Colour', JavaScript.ORDER_ATOMIC);
        var value_opacity = JavaScript.valueToCode(block, 'Opacity', JavaScript.ORDER_ATOMIC);
        var value_width = JavaScript.valueToCode(block, 'Width', JavaScript.ORDER_ATOMIC);

        var code = `
(() => {
    var width = ${value_width ? value_width : 3};
    var points = [];
    var polyline = ${value_polyline};
    
    var colors = [];
    polyline.points.forEach(pt => {
        points.push(new BABYLON.Vector3(pt[0], pt[1], pt[2]));
        colors.push( new BABYLON.Color4(1, 1, 1, 0)); 
    });

    var lines = BABYLON.MeshBuilder.CreateLines("lines${Math.random()}", {points, colors, useVertexAlpha: true}, scene);
    
    lines.enableEdgesRendering();	
    lines.edgesWidth = width;
    var col = BABYLON.Color3.FromHexString(${value_colour});
    lines.edgesColor = new BABYLON.Color4(col.r, col.g, col.b, ${value_opacity});
    lines.opacity = ${value_opacity ? value_opacity : 1};
    return lines;
})();
        `;
        return code;
    };
}