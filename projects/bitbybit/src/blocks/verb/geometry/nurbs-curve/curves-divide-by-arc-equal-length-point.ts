import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../../resources';
import { createStandardContextIIFE } from '../../../_shared';
import { getRequired, makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../../../validations';
import { environment } from 'projects/bitbybit/src/environments/environment';
import { curveConstants } from './curve-constants';

export function createCurvesDivideByEqualArcLengthPointsBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'verb_geometry_nurbs_curves_divide_by_equal_arc_length_points';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('Curves')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_geometry_nurbs_curves_divide_by_equal_arc_length_points_input_curves);
            this.appendValueInput('Subdivision')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(
                    resources.block_verb_geometry_nurbs_curves_divide_by_equal_arc_length_points_input_subdivison_number.toLowerCase()
                );
            this.setOutput(true, 'Array');
            this.setColour('#fff');
            this.setTooltip(resources.block_verb_geometry_nurbs_curves_divide_by_equal_arc_length_points_description);
            this.setHelpUrl(environment.docsUrl + curveConstants.helpUrl + '#' + 'dividecurvesbyequalarclengthtopoints');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            curves: (JavaScript as any).valueToCode(block, 'Curves', (JavaScript as any).ORDER_ATOMIC),
            subdivision: (JavaScript as any).valueToCode(block, 'Subdivision', (JavaScript as any).ORDER_ATOMIC),
        };
        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_curves, resources.block_subdivision
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `return bitbybit.curve.divideCurvesByEqualArcLengthToPoints(inputs);`
        );
        return [code, (JavaScript as any).ORDER_ATOMIC];
    };
}

function makeRuntimeValidationModel(
    resources: ResourcesInterface,
    keys: string[]
): ValidationEntityInterface[] {

    return [{
        entity: keys[0],
        validations: [
            getRequired(resources, resources.block_curves),
        ]
    }, {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_subdivision),
        ]
    }];
}
