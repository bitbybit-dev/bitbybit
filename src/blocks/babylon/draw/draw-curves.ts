import { Blocks, ALIGN_RIGHT } from 'blockly';
import * as JavaScript from 'blockly/javascript';

export function createDrawCurvesBlock() {

    const blockSelector = 'babylon_draw_curves';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('Curves')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField('Draw curves');
            this.appendValueInput('Colour')
                .setCheck('Colour')
                .setAlign(ALIGN_RIGHT)
                .appendField('in colour');
            this.appendValueInput('Opacity')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField('opacity');
            this.appendValueInput('Width')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField('and width');
            this.setColour('#fff');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setTooltip('Draws a coloured curves in space of selected width');
            this.setHelpUrl('');
        }
    };

    JavaScript.babylon_draw_curves = (block: any) => {
        const valueCurves = JavaScript.valueToCode(block, 'Curves', JavaScript.ORDER_ATOMIC);
        const valueColour = JavaScript.valueToCode(block, 'Colour', JavaScript.ORDER_ATOMIC);
        const valueOpacity = JavaScript.valueToCode(block, 'Opacity', JavaScript.ORDER_ATOMIC);
        const valueWidth = JavaScript.valueToCode(block, 'Width', JavaScript.ORDER_ATOMIC);

        const code = `
(() => {
    const lines = ${valueCurves};
    const width = ${valueWidth ? valueWidth : 3};
    const linesForRender = [];
    const col = BABYLON.Color3.FromHexString(${valueColour});
    const colors = [];
    lines.forEach(line => {
        let points = line.tessellate();
        linesForRender.push(points.map(pt => new BABYLON.Vector3(pt[0], pt[1], pt[2])));
        colors.push(points.map(pt => new BABYLON.Color4(col.r, col.g, col.b, ${valueOpacity})));
    });

    const linesMesh = BABYLON.MeshBuilder.CreateLineSystem("lines${Math.random()}", {lines: linesForRender, colors, useVertexAlpha: true}, scene);

    linesMesh.enableEdgesRendering();
    linesMesh.edgesWidth = width;
    linesMesh.edgesColor = new BABYLON.Color4(col.r, col.g, col.b, ${valueOpacity});
    linesMesh.opacity = ${valueOpacity ? valueOpacity : 1};
})();
        `;
        return code;
    };
}
