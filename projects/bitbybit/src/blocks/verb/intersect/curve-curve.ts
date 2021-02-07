import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../resources';
import { createStandardContextIIFE } from '../../_shared';
import { getRequired, makeRequiredValidationModelForInputs, HS, ValidationEntityInterface } from '../../validations';
import { environment } from 'projects/bitbybit/src/environments/environment';
import { intersectConstants } from './intersect-constants';

export function createIntersectCurveCurveBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'verb_geometry_intersect_curve_curve';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('FirstCurve')
                .setCheck('NurbsCurve')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_geometry_intersect_curve_curve_input_first_curve);
            this.appendValueInput('SecondCurve')
                .setCheck('NurbsCurve')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_geometry_intersect_curve_curve_input_second_curve.toLowerCase());
            this.setOutput(true, 'Array');
            this.setColour('#fff');
            this.setTooltip(resources.block_verb_geometry_intersect_curve_curve_description);
            this.setHelpUrl(environment.docsUrl + intersectConstants.helpUrl + '#' + 'curves');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            firstCurve: (JavaScript as any).valueToCode(block, 'FirstCurve', (JavaScript as any).ORDER_ATOMIC),
            secondCurve: (JavaScript as any).valueToCode(block, 'SecondCurve', (JavaScript as any).ORDER_ATOMIC),
        };
        // this is first set of validations to check that all inputs are non empty strings
        HS.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_curve, resources.block_curve, resources.block_tolerance
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `return bitbybit.verb.intersect.curves(inputs);`
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
            getRequired(resources, resources.block_curve),
        ]
    }, {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_curve),
        ]
    }];
}
