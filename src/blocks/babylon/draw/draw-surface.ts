import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createDrawSurfaceBlock() {

    Blocks['babylon_draw_surface'] = {
        init: function () {
            this.appendValueInput("Surface")
                .setCheck("NurbsSurface")
                .setAlign(ALIGN_RIGHT)
                .appendField("Draw surface");
            this.appendValueInput("Colour")
                .setCheck("Colour")
                .setAlign(ALIGN_RIGHT)
                .appendField("in colour");
            this.appendValueInput("Opacity")
                .setCheck("Number")
                .setAlign(ALIGN_RIGHT)
                .appendField("opacity");
            this.setColour("#fff");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setTooltip("Draws a coloured surface.");
            this.setHelpUrl("");
        }
    };

    JavaScript['babylon_draw_surface'] = function (block) {
        var value_surface = JavaScript.valueToCode(block, 'Surface', JavaScript.ORDER_ATOMIC);
        var value_colour = JavaScript.valueToCode(block, 'Colour', JavaScript.ORDER_ATOMIC);
        var value_opacity = JavaScript.valueToCode(block, 'Opacity', JavaScript.ORDER_ATOMIC);

        var code = `
(() => {
    var meshData =  ${value_surface}.tessellate();
    console.log(meshData);
    var positions = [];
    var indices = [];
    var normals = [];
    var uvs = [];

    var count = 0;

    meshData.faces.map(function(faceIndices){
        faceIndices.map(function(x){
            var vn = meshData.normals[x];
            normals.push( vn[0], vn[1], vn[2] );

            var pt = meshData.points[x];
            positions.push( pt[0], pt[1], pt[2] );

            indices.push(count);
            count++;
        });
    });

    var customMesh = new BABYLON.Mesh("custom${Math.random()}", scene);

    var vertexData = new BABYLON.VertexData();

    vertexData.positions = positions;
    vertexData.indices = indices;    
    vertexData.normals = normals;

    vertexData.applyToMesh(customMesh);
    customMesh.material = new BABYLON.StandardMaterial();
    customMesh.material.diffuseColor = BABYLON.Color3.FromHexString(${value_colour});
    customMesh.material.backFaceCulling = false;
    customMesh.isPickable = false;
   
})();
        `;
        return code;
    };
}