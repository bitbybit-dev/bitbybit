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

export function createDrawLinesBlock() {

    const resources = ResourcesService.getResourcesForSelectedLanguage();
    const blockSelector = 'babylon_draw_lines';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('Lines')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_draw_lines);
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
            this.setTooltip(resources.block_babylon_draw_lines_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const valueLines = JavaScript.valueToCode(block, 'Lines', JavaScript.ORDER_ATOMIC);
        const valueColour = JavaScript.valueToCode(block, 'Colour', JavaScript.ORDER_ATOMIC);
        const valueOpacity = JavaScript.valueToCode(block, 'Opacity', JavaScript.ORDER_ATOMIC);
        const valueWidth = JavaScript.valueToCode(block, 'Width', JavaScript.ORDER_ATOMIC);

        BlockValidationService.validate(
            block,
            block.workspace,
            makeValidationModel(resources, {
                valueLines,
                valueColour,
                valueOpacity,
                valueWidth,
            })
        );

        return createStandardContextIIFE(block, blockSelector,
`
        const lines = ${valueLines};

        const linesForRender = [];
        const colors = [];
        lines.forEach(line => {
            linesForRender.push([new BABYLON.Vector3(line.start[0], line.start[1], line.start[2]), new BABYLON.Vector3(line.end[0], line.end[1], line.end[2])]);
            const col = BABYLON.Color3.FromHexString(${valueColour});
            colors.push([
                new BABYLON.Color4(col.r, col.g, col.b, ${valueOpacity}),
                new BABYLON.Color4(col.r, col.g, col.b, ${valueOpacity})
            ]);
        });

        const linesMesh = BABYLON.MeshBuilder.CreateLineSystem("lines${Math.random()}", {lines: linesForRender, colors, useVertexAlpha: true}, scene);

        linesMesh.enableEdgesRendering();
        linesMesh.edgesWidth = ${valueWidth};
        const col = BABYLON.Color3.FromHexString(${valueColour});
        linesMesh.edgesColor = new BABYLON.Color4(col.r, col.g, col.b, ${valueOpacity});
        linesMesh.opacity = ${valueOpacity};
`);
    };
}


function makeValidationModel(
    resources: ResourcesInterface,
    values: {
        valueLines: any,
        valueColour: any,
        valueOpacity: any,
        valueWidth: any,
    }
): ValidationEntityInterface[] {

    return [{
        entity: values.valueLines,
        validations: [
            getRequired(resources, resources.block_lines)
        ]
    },
    {
        entity: values.valueColour,
        validations: [
            getRequired(resources, resources.block_color)
        ]
    },
    {
        entity: values.valueOpacity,
        validations: [
            ...getRequiredAndRange(resources, resources.block_opacity, 0, 1)
        ]
    },
    {
        entity: values.valueWidth,
        validations: [
            ...getRequiredAndMin(resources, resources.block_width, 0)
        ]
    }];
}

