import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createDrawPointBlock() {

    Blocks['babylon_draw_point'] = {
        init: function () {
            this.appendValueInput("Point")
                .setCheck("Vector3")
                .setAlign(ALIGN_RIGHT)
                .appendField("Draw point at");
            this.appendValueInput("Colour")
                .setCheck("Colour")
                .setAlign(ALIGN_RIGHT)
                .appendField("in colour");
            this.appendValueInput("Opacity")
                .setCheck("Number")
                .setAlign(ALIGN_RIGHT)
                .appendField("opacity");
            this.appendValueInput("Size")
                .setCheck("Number")
                .setAlign(ALIGN_RIGHT)
                .appendField("and size");
            this.setColour("#fff");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setTooltip("Draws a coloured point in space of selected size");
            this.setHelpUrl("");
        }
    };

    JavaScript['babylon_draw_point'] = function (block) {
        var value_point = JavaScript.valueToCode(block, 'Point', JavaScript.ORDER_ATOMIC);
        var value_colour = JavaScript.valueToCode(block, 'Colour', JavaScript.ORDER_ATOMIC);
        var value_size = JavaScript.valueToCode(block, 'Size', JavaScript.ORDER_ATOMIC);
        var value_opacity = JavaScript.valueToCode(block, 'Opacity', JavaScript.ORDER_ATOMIC);

        var code = `
var drawPoint = () => {
    var vectorPoint = ${value_point};
    var colour = BABYLON.Color3.FromHexString(${value_colour});
    var size = ${value_size ? value_size : 3};

    var customMesh = new BABYLON.Mesh("custom${Math.random()}", scene);

    var positions = [];
    var colors = [];

    var pointsCount = 1;
    positions = vectorPoint;
    colors.push(colour.r, colour.g, colour.b, 1);
    
    var vertexData = new BABYLON.VertexData();

    vertexData.positions = positions;
    vertexData.colors = colors;

    vertexData.applyToMesh(customMesh);
    
    var mat = new BABYLON.StandardMaterial("mat${Math.random()}", scene);
    mat.emissiveColor = new BABYLON.Color3(1, 1, 1);
    mat.disableLighting = true;
    mat.pointsCloud = true;
    mat.pointSize = size;
    mat.alpha = ${value_opacity ? value_opacity : 1};
    customMesh.material = mat;
}
drawPoint();
        `;
        return code;
    };
}