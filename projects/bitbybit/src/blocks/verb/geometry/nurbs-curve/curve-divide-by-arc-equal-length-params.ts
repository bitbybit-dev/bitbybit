import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../../resources';
import { createStandardContextIIFE } from '../../../_shared';
import { getRequired, makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../../../validations';

export function createCurveDivideByEqualArcLengthParamsBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'verb_geometry_nurbs_curve_divide_by_equal_arc_length_params';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('Curve')
                .setCheck('NurbsCurve')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_geometry_nurbs_curve_divide_by_equal_arc_length_params_input_curve);
            this.appendValueInput('Subdivision')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_geometry_nurbs_curve_divide_by_equal_arc_length_params_input_subdivison_number.toLowerCase());
            this.setOutput(true, 'Array');
            this.setColour('#fff');
            this.setTooltip(resources.block_verb_geometry_nurbs_curve_divide_by_equal_arc_length_params_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            curve: JavaScript.valueToCode(block, 'Curve', JavaScript.ORDER_ATOMIC),
            subdivision: JavaScript.valueToCode(block, 'Subdivision', JavaScript.ORDER_ATOMIC),
        };
        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_curve, resources.block_subdivision
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `
const segments = inputs.curve.divideByEqualArcLength(inputs.subdivision);
return segments.map(s => s.u);
            `
        );
        return [code, JavaScript.ORDER_ATOMIC];
    };
}

function makeRuntimeValidationModel(
    resources: ResourcesInterface,
    keys: string[]
): ValidationEntityInterface[] {

    return [{
        entity: keys[0],
        validations: [
            getRequired(resources, resources.block_curve),
        ]
    }, {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_subdivision),
        ]
    }];
}
