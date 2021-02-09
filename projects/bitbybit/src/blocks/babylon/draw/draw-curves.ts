import { ALIGN_RIGHT, Block, Blocks, FieldVariable, VARIABLE_CATEGORY_NAME } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../resources';
import { createStandardContextIIFE } from '../../_shared';
import {
    getRequired,
    getRequiredAndMin,
    getRequiredAndRange,
    makeRequiredValidationModelForInputs,
    HS,
    ValidationEntityInterface
} from '../../validations';

export function createDrawCurvesBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'babylon_draw_curves';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('Curves')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_curves)
                .appendField(new FieldVariable(resources.block_babylon_input_curves_variable), 'DrawnCurvesMesh')
                .appendField(resources.block_babylon_input_curves_2);
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
            this.setTooltip(resources.block_babylon_draw_curves_description);
        }
    };

    (JavaScript as any).babylon_draw_curves = (block: Block) => {

        const inputs = {
            curves: (JavaScript as any).valueToCode(block, 'Curves', (JavaScript as any).ORDER_ATOMIC),
            colour: (JavaScript as any).valueToCode(block, 'Colour', (JavaScript as any).ORDER_ATOMIC),
            opacity: (JavaScript as any).valueToCode(block, 'Opacity', (JavaScript as any).ORDER_ATOMIC),
            width: (JavaScript as any).valueToCode(block, 'Width', (JavaScript as any).ORDER_ATOMIC),
            updatable: (JavaScript as any).valueToCode(block, 'Updatable', (JavaScript as any).ORDER_ATOMIC),
            curvesMesh: undefined
        };

        // this is first set of validations to check that all inputs are non empty strings
        HS.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_curve, resources.block_colour, resources.block_opacity, resources.block_width, resources.block_updatable])
        );

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        return createStandardContextIIFE(block, blockSelector, inputs, false,
            `inputs.curvesMesh = ${(JavaScript as any).variableDB_.getName(block.getFieldValue('DrawnCurvesMesh'), VARIABLE_CATEGORY_NAME)};
            ${(JavaScript as any).variableDB_.getName(block.getFieldValue('DrawnCurvesMesh'), VARIABLE_CATEGORY_NAME)} = bitbybit.verb.curve.drawCurves(inputs);`
        );
    };
}


function makeRuntimeValidationModel(
    resources: ResourcesInterface,
    keys: string[]): ValidationEntityInterface[] {

    return [{
        entity: keys[0],
        validations: [
            getRequired(resources, resources.block_curves)
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
