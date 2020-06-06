import { Blocks, ALIGN_RIGHT, Block } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { createStandardContextIIFE } from '../../_shared/create-standard-context-iife';

export function createDrawPointBlock() {

    const blockSelector = 'babylon_draw_point';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('Point')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField('Draw point at');
            this.appendValueInput('Colour')
                .setCheck('Colour')
                .setAlign(ALIGN_RIGHT)
                .appendField('in colour');
            this.appendValueInput('Opacity')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField('opacity');
            this.appendValueInput('Size')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField('and size');
            this.setColour('#fff');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setTooltip('Draws a coloured point in space of selected size');
            this.setHelpUrl('');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const valuePoint = JavaScript.valueToCode(block, 'Point', JavaScript.ORDER_ATOMIC);
        const valueColour = JavaScript.valueToCode(block, 'Colour', JavaScript.ORDER_ATOMIC);
        const valueSize = JavaScript.valueToCode(block, 'Size', JavaScript.ORDER_ATOMIC);
        const valueOpacity = JavaScript.valueToCode(block, 'Opacity', JavaScript.ORDER_ATOMIC);
        block.inputList[0].setVisible(false);
        const code = createStandardContextIIFE(block, blockSelector,
`
    const vectorPoint = ${valuePoint};
    const colour = BABYLON.Color3.FromHexString(${valueColour});
    const size = ${valueSize};

    const customMesh = new BABYLON.Mesh("custom${Math.random()}", scene);

    const colors = [];
    const pointsCount = 1;
    const positions = vectorPoint;

    colors.push(colour.r, colour.g, colour.b, 1);

    const vertexData = new BABYLON.VertexData();

    vertexData.positions = positions;
    vertexData.colors = colors;

    vertexData.applyToMesh(customMesh);

    const mat = new BABYLON.StandardMaterial("mat${Math.random()}", scene);
    mat.emissiveColor = new BABYLON.Color3(1, 1, 1);
    mat.disableLighting = true;
    mat.pointsCloud = true;
    mat.pointSize = ${valueSize};
    mat.alpha = ${valueOpacity};
    customMesh.material = mat;
`
        );
        return code;
    };
}
