import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createDrawPointsBlock() {

    Blocks['functions_drawpoints'] = {
        init: function () {
            this.appendValueInput("Points")
                .setCheck("Array")
                .setAlign(ALIGN_RIGHT)
                .appendField("Draw points");
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
            this.setInputsInline(false);
            this.setColour("#fff");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setTooltip("");
            this.setHelpUrl("");
        }
    };

    JavaScript['functions_drawpoints'] = function (block) {
        var value_points = JavaScript.valueToCode(block, 'Points', JavaScript.ORDER_ATOMIC);
        var value_colour = JavaScript.valueToCode(block, 'Colour', JavaScript.ORDER_ATOMIC);
        var value_size = JavaScript.valueToCode(block, 'Size', JavaScript.ORDER_ATOMIC);
        var value_opacity = JavaScript.valueToCode(block, 'Opacity', JavaScript.ORDER_ATOMIC);

        var code = `
var drawPoints = () => {

    var vectorPoints = ${value_points};
    var colour = BABYLON.Color3.FromHexString(${value_colour});
    var size = ${value_size ? value_size : 3};

    var customMesh = new BABYLON.Mesh("custom${Math.random()}", scene);

    var positions = [];
    var colors = [];

    var pointsCount = vectorPoints.length;
    vectorPoints.forEach(p =>  {
        positions.push(...p);
        colors.push(colour.r, colour.g, colour.b, 1);
    });
    
    var vertexData = new BABYLON.VertexData();

    vertexData.positions = positions;
    vertexData.colors = colors;

    vertexData.applyToMesh(customMesh);
    
    var mat = new BABYLON.StandardMaterial("mat${Math.random()}", scene);
    mat.emissiveColor = new BABYLON.Color3(1, 1, 1);
    mat.disableLighting = true;
    mat.pointsCloud = true;
    mat.alpha = ${value_opacity ? value_opacity : 1};
    mat.pointSize = size;
    
    customMesh.material = mat;
}
drawPoints();
        `;
        return code;
    };
}
