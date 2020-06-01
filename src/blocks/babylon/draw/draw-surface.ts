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

    var meshDataConverted = {
        positions: [],
        indices: [],
        normals: [],    
    }
    
    var countIndices = 0;
    meshData.faces.forEach((faceIndices) => {
        faceIndices.forEach((x) => {
            var vn = meshData.normals[x];
            meshDataConverted.normals.push( vn[0], vn[1], vn[2] );

            var pt = meshData.points[x];
            meshDataConverted.positions.push( pt[0], pt[1], pt[2] );

            meshDataConverted.indices.push(countIndices);
            countIndices++;
        });
    });

    var customMeshForSurface = new BABYLON.Mesh("custom${Math.random()}", scene);

    var vertexData = new BABYLON.VertexData();

    vertexData.positions = meshDataConverted.positions;
    vertexData.indices = meshDataConverted.indices;
    vertexData.normals = meshDataConverted.normals;

    vertexData.applyToMesh(customMeshForSurface);
    customMeshForSurface.material = new BABYLON.StandardMaterial();
    customMeshForSurface.material.alpha = ${value_opacity};
    customMeshForSurface.material.diffuseColor = BABYLON.Color3.FromHexString(${value_colour});
    customMeshForSurface.material.specularColor = new BABYLON.Color3(1, 1, 1);
    customMeshForSurface.material.ambientColor = new BABYLON.Color3(1, 1, 1);
    customMeshForSurface.material.backFaceCulling = false;
    customMeshForSurface.isPickable = false;
})();
        `;
        return code;
    };
}