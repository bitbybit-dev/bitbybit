import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createDrawCurveBlock() {

    Blocks['functions_draw_curve'] = {
        init: function () {
            this.appendValueInput("Curve")
                .setCheck("NurbsCurve")
                .setAlign(ALIGN_RIGHT)
                .appendField("Draw curve");
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
            this.setTooltip("Draws a coloured curve in space of selected width");
            this.setHelpUrl("");
        }
    };

    JavaScript['functions_draw_curve'] = function (block) {
        var value_curve = JavaScript.valueToCode(block, 'Curve', JavaScript.ORDER_ATOMIC);
        var value_colour = JavaScript.valueToCode(block, 'Colour', JavaScript.ORDER_ATOMIC);
        var value_opacity = JavaScript.valueToCode(block, 'Opacity', JavaScript.ORDER_ATOMIC);
        var value_width = JavaScript.valueToCode(block, 'Width', JavaScript.ORDER_ATOMIC);

        var code = `
(() => {
    var width = ${value_width ? value_width : 3};
    var curve = ${value_curve};

    var points = curve.tessellate();

    var colors = [];
    var pointsToRender = [];
    points.forEach(pt => {
        colors.push( new BABYLON.Color4(1, 1, 1, 0)); 
        pointsToRender.push(new BABYLON.Vector3(pt[0], pt[1], pt[2]));
    });

    var lines = BABYLON.MeshBuilder.CreateLines("lines${Math.random()}", {points: pointsToRender, colors, useVertexAlpha: true}, scene);
    
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