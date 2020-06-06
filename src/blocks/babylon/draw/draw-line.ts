import { ALIGN_RIGHT, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface } from '../../../resources/resources.interface';
import { ResourcesService } from '../../../resources/resources.service';
import { createStandardContextIIFE } from '../../_shared/create-standard-context-iife';
import { ValidationEntityInterface } from '../../validations/validation-entity.interface';
import { getRequired, getRequiredAndMin, getRequiredAndRange } from '../../validations/validation-shorthands';
import { BlockValidationService } from '../../validations/validation.service';

export function createDrawLineBlock() {

    const resources = ResourcesService.getResourcesForSelectedLanguage();
    const blockSelector = 'babylon_draw_line';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('Line')
                .setCheck('Line')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_draw_line);
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
            this.setTooltip(resources.block_babylon_draw_line_description);
            this.setHelpUrl('');
        }
    };

    JavaScript[blockSelector] = (block) => {
        const valueLine = JavaScript.valueToCode(block, 'Line', JavaScript.ORDER_ATOMIC);
        const valueColour = JavaScript.valueToCode(block, 'Colour', JavaScript.ORDER_ATOMIC);
        const valueOpacity = JavaScript.valueToCode(block, 'Opacity', JavaScript.ORDER_ATOMIC);
        const valueWidth = JavaScript.valueToCode(block, 'Width', JavaScript.ORDER_ATOMIC);

        BlockValidationService.validate(
            block,
            block.workspace,
            makeValidationModel(resources, {
                valueLine,
                valueColour,
                valueOpacity,
                valueWidth,
            })
        );

        return createStandardContextIIFE(block, blockSelector,
`
    const line = ${valueLine};

    const points = [new BABYLON.Vector3(line.start[0],line.start[1],line.start[2]), new BABYLON.Vector3(line.end[0],line.end[1],line.end[2])];
    const lines = BABYLON.MeshBuilder.CreateLines("lines${Math.random()}", {points}, scene);
    lines.enableEdgesRendering();
	lines.edgesWidth = ${valueWidth};
    const edgeColor = BABYLON.Color3.FromHexString(${valueColour});
    lines.edgesColor = new BABYLON.Color4(edgeColor.r, edgeColor.g, edgeColor.b, ${valueOpacity});
 `
        );
    };
}

function makeValidationModel(
    resources: ResourcesInterface,
    values: {
        valueLine: any,
        valueColour: any,
        valueOpacity: any,
        valueWidth: any,
    }
): ValidationEntityInterface[] {

    return [{
        entity: values.valueLine,
        validations: [
            getRequired(resources, resources.block_line)
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

