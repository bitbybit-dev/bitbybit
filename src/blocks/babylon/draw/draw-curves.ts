import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createDrawCurvesBlock() {

    Blocks['babylon_draw_curves'] = {
        init: function () {
            this.appendValueInput("Curves")
                .setCheck("Array")
                .setAlign(ALIGN_RIGHT)
                .appendField("Draw curves");
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
            this.setTooltip("Draws a coloured curves in space of selected width");
            this.setHelpUrl("");
        }
    };

    JavaScript['babylon_draw_curves'] = function (block) {
        var value_curves = JavaScript.valueToCode(block, 'Curves', JavaScript.ORDER_ATOMIC);
        var value_colour = JavaScript.valueToCode(block, 'Colour', JavaScript.ORDER_ATOMIC);
        var value_opacity = JavaScript.valueToCode(block, 'Opacity', JavaScript.ORDER_ATOMIC);
        var value_width = JavaScript.valueToCode(block, 'Width', JavaScript.ORDER_ATOMIC);

        var code = `
(() => {
    var lines = ${value_curves};
    var width = ${value_width ? value_width : 3};
    var linesForRender = [];
    var col = BABYLON.Color3.FromHexString(${value_colour});
    
    var colors = [];
    lines.forEach(line => {
        var points = line.tessellate();
        linesForRender.push(points.map(pt => new BABYLON.Vector3(pt[0], pt[1], pt[2])));
        colors.push(points.map(pt => new BABYLON.Color4(col.r, col.g, col.b, ${value_opacity})));
    });

    var lines = BABYLON.MeshBuilder.CreateLineSystem("lines${Math.random()}", {lines: linesForRender, colors, useVertexAlpha: true}, scene);
    
    lines.enableEdgesRendering();	
    lines.edgesWidth = width;
    lines.edgesColor = new BABYLON.Color4(col.r, col.g, col.b, ${value_opacity});
    lines.opacity = ${value_opacity ? value_opacity : 1};
})();
        `;
        return code;
    };
}