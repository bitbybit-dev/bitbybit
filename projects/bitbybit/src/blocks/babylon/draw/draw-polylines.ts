import { ALIGN_RIGHT, Block, Blocks, FieldVariable, VARIABLE_CATEGORY_NAME } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../resources';
import { createStandardContextIIFE } from '../../_shared';
import {
    getRequired,
    getRequiredAndMin,
    getRequiredAndRange,
    makeRequiredValidationModelForInputs,
    BitByBitBlockHandlerService,
    ValidationEntityInterface
} from '../../validations';

export function createDrawPolylinesBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'babylon_draw_polylines';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('Polylines')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_draw_polylines)
                .appendField(new FieldVariable(resources.block_babylon_input_draw_polylines_variable), 'DrawnPolylinesMesh')
                .appendField(resources.block_babylon_input_draw_polylines_2);
            this.appendValueInput('Colour')
                .setCheck('Colour')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_colour.toLowerCase());
            this.appendValueInput('Opacity')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_opacity.toLowerCase());
            this.appendValueInput('Width')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_width.toLowerCase());
            this.appendValueInput('Updatable')
                .setCheck('Boolean')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_updatable.toLowerCase());
            this.setColour('#fff');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setTooltip(resources.block_babylon_draw_polylines_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {

        const inputs = {
            polylines: (JavaScript as any).valueToCode(block, 'Polylines', (JavaScript as any).ORDER_ATOMIC),
            colour: (JavaScript as any).valueToCode(block, 'Colour', (JavaScript as any).ORDER_ATOMIC),
            opacity: (JavaScript as any).valueToCode(block, 'Opacity', (JavaScript as any).ORDER_ATOMIC),
            width: (JavaScript as any).valueToCode(block, 'Width', (JavaScript as any).ORDER_ATOMIC),
            updatable: (JavaScript as any).valueToCode(block, 'Updatable', (JavaScript as any).ORDER_ATOMIC),
            polylinesMesh: undefined,
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_polyline, resources.block_colour, resources.block_opacity, resources.block_width, resources.block_updatable
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        return createStandardContextIIFE(block, blockSelector, inputs, false,
            `
        inputs.polylinesMesh = ${(JavaScript as any).variableDB_.getName(block.getFieldValue('DrawnPolylinesMesh'), VARIABLE_CATEGORY_NAME)};
        ${(JavaScript as any).variableDB_.getName(block.getFieldValue('DrawnPolylinesMesh'), VARIABLE_CATEGORY_NAME)} = bitbybit.polyline.drawPolylines(inputs);`
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
            getRequired(resources, resources.block_polyline)
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
            ...getRequiredAndMin(resources, resources.block_width, 0)
        ]
    }];
}

