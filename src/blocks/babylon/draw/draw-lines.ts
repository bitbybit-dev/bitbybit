import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createDrawLinesBlock() {

    Blocks['babylon_draw_lines'] = {
        init: function () {
            this.appendValueInput("Lines")
                .setCheck("Array")
                .setAlign(ALIGN_RIGHT)
                .appendField("Draw lines");
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

    JavaScript['babylon_draw_lines'] = function (block) {
        let value_lines = JavaScript.valueToCode(block, 'Lines', JavaScript.ORDER_ATOMIC);
        let value_colour = JavaScript.valueToCode(block, 'Colour', JavaScript.ORDER_ATOMIC);
        let value_opacity = JavaScript.valueToCode(block, 'Opacity', JavaScript.ORDER_ATOMIC);
        let value_width = JavaScript.valueToCode(block, 'Width', JavaScript.ORDER_ATOMIC);

        let code = `
(() => {
    let lines = ${value_lines};
    let width = ${value_width ? value_width : 3};
    let linesForRender = [];
    let colors = [];
    lines.forEach(line => {
        linesForRender.push([new BABYLON.Vector3(line.start[0], line.start[1], line.start[2]), new BABYLON.Vector3(line.end[0], line.end[1], line.end[2])]);
        let col = BABYLON.Color3.FromHexString(${value_colour});
        colors.push([
            new BABYLON.Color4(col.r, col.g, col.b, ${value_opacity}),
            new BABYLON.Color4(col.r, col.g, col.b, ${value_opacity})
        ]);
    });

    let linesMesh = BABYLON.MeshBuilder.CreateLineSystem("lines${Math.random()}", {lines: linesForRender, colors, useVertexAlpha: true}, scene);

    linesMesh.enableEdgesRendering();
    linesMesh.edgesWidth = width;
    let col = BABYLON.Color3.FromHexString(${value_colour});
    linesMesh.edgesColor = new BABYLON.Color4(col.r, col.g, col.b, ${value_opacity});
    linesMesh.opacity = ${value_opacity ? value_opacity : 1};
})();
`;
        return code;
    };
}