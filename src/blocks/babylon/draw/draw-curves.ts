import { ALIGN_RIGHT, Blocks } from 'blockly';
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

export function createDrawCurvesBlock() {

    const resources = ResourcesService.getResourcesForSelectedLanguage();
    const blockSelector = 'babylon_draw_curves';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('Curves')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_curves);
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
            this.setTooltip(resources.block_babylon_draw_curves_description);
        }
    };

    JavaScript.babylon_draw_curves = (block: any) => {
        const valueCurves = JavaScript.valueToCode(block, 'Curves', JavaScript.ORDER_ATOMIC);
        const valueColour = JavaScript.valueToCode(block, 'Colour', JavaScript.ORDER_ATOMIC);
        const valueOpacity = JavaScript.valueToCode(block, 'Opacity', JavaScript.ORDER_ATOMIC);
        const valueWidth = JavaScript.valueToCode(block, 'Width', JavaScript.ORDER_ATOMIC);

        BlockValidationService.validate(
            block,
            block.workspace,
            makeValidationModel(resources, valueCurves, valueColour, valueOpacity, valueWidth)
        );

        return createStandardContextIIFE(block, blockSelector,
`
        const curves = ${valueCurves};
        const curvesForRender = [];
        const col = BABYLON.Color3.FromHexString(${valueColour});
        const colors = [];
        curves.forEach(line => {
            let points = line.tessellate();
            curvesForRender.push(points.map(pt => new BABYLON.Vector3(pt[0], pt[1], pt[2])));
            colors.push(points.map(pt => new BABYLON.Color4(col.r, col.g, col.b, ${valueOpacity})));
        });

        const curvesMesh = BABYLON.MeshBuilder.CreateLineSystem("lines${Math.random()}", {lines: curvesForRender, colors, useVertexAlpha: true}, scene);

        curvesMesh.enableEdgesRendering();
        curvesMesh.edgesWidth = ${valueWidth};
        curvesMesh.edgesColor = new BABYLON.Color4(col.r, col.g, col.b, ${valueOpacity});
        curvesMesh.opacity = ${valueOpacity};
`);
    };
}

function makeValidationModel(
    resources: ResourcesInterface,
    valueCurves: any,
    valueColour: any,
    valueOpacity: any,
    valueWidth: any): ValidationEntityInterface[] {

    return [{
        entity: valueCurves,
        validations: [
            getRequired(resources, resources.block_curves)
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
