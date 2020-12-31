import { ALIGN_RIGHT, Block, Blocks, FieldVariable, VARIABLE_CATEGORY_NAME } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../resources';
import { createStandardContextIIFE } from '../../_shared';
import {
    getOfLength,
    getRequired,
    getRequiredAndMin,
    getRequiredAndRange,
    makeRequiredValidationModelForInputs,
    BitByBitBlockHandlerService,
    ValidationEntityInterface
} from '../../validations';

export function createDrawPointBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'babylon_draw_point';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('Point')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_draw_point)
                .appendField(new FieldVariable(resources.block_babylon_input_draw_point_variable), 'DrawnPointMesh')
                .appendField(resources.block_babylon_input_draw_point_2);
            this.appendValueInput('Colour')
                .setCheck('Colour')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_colour.toLowerCase());
            this.appendValueInput('Opacity')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_opacity.toLowerCase());
            this.appendValueInput('Size')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_size.toLowerCase());
            this.appendValueInput('Updatable')
                .setCheck('Boolean')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_updatable.toLowerCase());
            this.setColour('#fff');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setTooltip(resources.block_babylon_draw_point_description);
            this.setHelpUrl('');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            point: (JavaScript as any).valueToCode(block, 'Point', (JavaScript as any).ORDER_ATOMIC),
            colour: (JavaScript as any).valueToCode(block, 'Colour', (JavaScript as any).ORDER_ATOMIC),
            opacity: (JavaScript as any).valueToCode(block, 'Opacity', (JavaScript as any).ORDER_ATOMIC),
            size: (JavaScript as any).valueToCode(block, 'Size', (JavaScript as any).ORDER_ATOMIC),
            updatable: (JavaScript as any).valueToCode(block, 'Updatable', (JavaScript as any).ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_point, resources.block_colour, resources.block_opacity, resources.block_size, resources.block_updatable
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        return createStandardContextIIFE(block, blockSelector, inputs, false,
            `inputs.pointMesh = ${(JavaScript as any).variableDB_.getName(block.getFieldValue('DrawnPointMesh'), VARIABLE_CATEGORY_NAME)};
            ${(JavaScript as any).variableDB_.getName(block.getFieldValue('DrawnPointMesh'), VARIABLE_CATEGORY_NAME)} = bitbybit.point.drawPoint(inputs);`
        );
    };
}

function makeRuntimeValidationModel(
    resources: ResourcesInterface,
    keys: string[]
): ValidationEntityInterface[] {

    return [{
        entity: keys[0],
        validations: [
            getRequired(resources, resources.block_point),
            getOfLength(resources, resources.block_point, 3)
        ]
    },
    {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_colour)
        ]
    },
    {
        entity: keys[2],
        validations: [
            ...getRequiredAndRange(resources, resources.block_opacity, 0, 1)
        ]
    },
    {
        entity: keys[3],
        validations: [
            ...getRequiredAndMin(resources, resources.block_size, 0)
        ]
    }];
}
