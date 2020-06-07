import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../resources';
import { createStandardContextIIFE } from '../../_shared';
import {
    getRequired,
    getRequiredAndMin,
    getRequiredAndRange,
    BlockValidationService,
    ValidationEntityInterface
} from '../../validations';

export function createDrawCurveBlock() {

    const resources = ResourcesService.getResourcesForSelectedLanguage();
    const blockSelector = 'babylon_draw_curve';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('Curve')
                .setCheck('NurbsCurve')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_curve);
            this.appendValueInput('Colour')
                .setCheck('Colour')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_color);
            this.appendValueInput('Opacity')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_opacity);
            this.appendValueInput('Width')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_width);
            this.setColour('#fff');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setTooltip(resources.block_babylon_draw_curve_description);
            this.setHelpUrl('');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const valueCurve = JavaScript.valueToCode(block, 'Curve', JavaScript.ORDER_ATOMIC);
        const valueColour = JavaScript.valueToCode(block, 'Colour', JavaScript.ORDER_ATOMIC);
        const valueOpacity = JavaScript.valueToCode(block, 'Opacity', JavaScript.ORDER_ATOMIC);
        const valueWidth = JavaScript.valueToCode(block, 'Width', JavaScript.ORDER_ATOMIC);

        BlockValidationService.validate(
            block,
            block.workspace,
            makeValidationModel(resources, valueCurve, valueColour, valueOpacity, valueWidth)
        );

        return createStandardContextIIFE(block, blockSelector,
`
        const points = ${valueCurve}.tessellate();

        const colors = [];
        const pointsToRender = [];
        points.forEach(pt => {
            colors.push(new BABYLON.Color4(1, 1, 1, 0));
            pointsToRender.push(new BABYLON.Vector3(pt[0], pt[1], pt[2]));
        });

        const curves = BABYLON.MeshBuilder.CreateLines("lines${Math.random()}", {points: pointsToRender, colors, useVertexAlpha: true}, scene);

        curves.enableEdgesRendering();
        curves.edgesWidth = ${valueWidth};
        const col = BABYLON.Color3.FromHexString(${valueColour});
        curves.edgesColor = new BABYLON.Color4(col.r, col.g, col.b, ${valueOpacity});
        curves.opacity = ${valueOpacity};
`);
    };
}

function makeValidationModel(
    resources: ResourcesInterface,
    valueCurve: any,
    valueColour: any,
    valueOpacity: any,
    valueWidth: any): ValidationEntityInterface[] {

    return [{
        entity: valueCurve,
        validations: [
            getRequired(resources, resources.block_curve)
        ]
    },
    {
        entity: valueColour,
        validations: [
            getRequired(resources, resources.block_color)
        ]
    },
    {
        entity: valueOpacity,
        validations: [
            ...getRequiredAndRange(resources, resources.block_opacity, 0, 1)
        ]
    },
    {
        entity: valueWidth,
        validations: [
            ...getRequiredAndMin(resources, resources.block_width, 0)
        ]
    }];
}
