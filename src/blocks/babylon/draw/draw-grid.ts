import { Blocks, ALIGN_RIGHT } from "blockly";
import * as JavaScript from 'blockly/javascript';

export function createDrawGridBlock() {
    Blocks['babylon_draw_grid'] = {
        init: function () {
            this.appendValueInput("width")
                .setCheck("Number")
                .setAlign(ALIGN_RIGHT)
                .appendField("Draw grid of width");
            this.appendValueInput("height")
                .setCheck("Number")
                .setAlign(ALIGN_RIGHT)
                .appendField("height");
            this.appendValueInput("subdivisions")
                .setCheck("Number")
                .setAlign(ALIGN_RIGHT)
                .appendField("subdivisions");
            this.appendValueInput("major_unit_frequency")
                .setCheck("Number")
                .setAlign(ALIGN_RIGHT)
                .appendField("major unit frequency");
            this.appendValueInput("minor_unit_visibility")
                .setCheck("Number")
                .setAlign(ALIGN_RIGHT)
                .appendField("minor unit visibility");
            this.appendValueInput("grid_ratio")
                .setCheck("Number")
                .setAlign(ALIGN_RIGHT)
                .appendField("grid ratio");
            this.appendValueInput("opacity")
                .setCheck("Number")
                .setAlign(ALIGN_RIGHT)
                .appendField("opacity");
            this.appendValueInput("back_face_culling")
                .setCheck("Boolean")
                .setAlign(ALIGN_RIGHT)
                .appendField("back face culling");
            this.appendValueInput("main_color")
                .setCheck("Colour")
                .setAlign(ALIGN_RIGHT)
                .appendField("main color");
            this.appendValueInput("line_color")
                .setCheck("Colour")
                .setAlign(ALIGN_RIGHT)
                .appendField("line colour");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour("#fff");
            this.setTooltip("Activates the ground grid to help orientation when navigating 3D space.");
            this.setHelpUrl("https://doc.babylonjs.com/extensions/grid");
        }
    };

    JavaScript['babylon_draw_grid'] = function (block) {
        var value_width = JavaScript.valueToCode(block, 'width', JavaScript.ORDER_ATOMIC);
        var value_height = JavaScript.valueToCode(block, 'height', JavaScript.ORDER_ATOMIC);
        var value_subdivisions = JavaScript.valueToCode(block, 'subdivisions', JavaScript.ORDER_ATOMIC);
        var value_major_unit_frequency = JavaScript.valueToCode(block, 'major_unit_frequency', JavaScript.ORDER_ATOMIC);
        var value_minor_unit_visibility = JavaScript.valueToCode(block, 'minor_unit_visibility', JavaScript.ORDER_ATOMIC);
        var value_grid_ratio = JavaScript.valueToCode(block, 'grid_ratio', JavaScript.ORDER_ATOMIC);
        var value_opacity = JavaScript.valueToCode(block, 'opacity', JavaScript.ORDER_ATOMIC);
        var value_back_face_culling = JavaScript.valueToCode(block, 'back_face_culling', JavaScript.ORDER_ATOMIC);
        var value_main_color = JavaScript.valueToCode(block, 'main_color', JavaScript.ORDER_ATOMIC);
        var value_line_color = JavaScript.valueToCode(block, 'line_color', JavaScript.ORDER_ATOMIC);

        var code = `
let drawGrid = () => {
    let groundMaterial = new BABYLON.GridMaterial('groundMaterial${Math.random()}', scene);
    groundMaterial.majorUnitFrequency = ${value_major_unit_frequency};
    groundMaterial.minorUnitVisibility = ${value_minor_unit_visibility};
    groundMaterial.gridRatio = ${value_grid_ratio};
    groundMaterial.backFaceCulling = ${value_back_face_culling};
    groundMaterial.mainColor = BABYLON.Color3.FromHexString(${value_main_color});
    groundMaterial.lineColor = BABYLON.Color3.FromHexString(${value_line_color});
    groundMaterial.opacity = ${value_opacity};

    let ground = BABYLON.Mesh.CreateGround('ground${Math.random()}', ${value_width}, ${value_height}, ${value_subdivisions}, scene, false);
    ground.material = groundMaterial;
}
drawGrid();
        `;
        return code;
    };
}