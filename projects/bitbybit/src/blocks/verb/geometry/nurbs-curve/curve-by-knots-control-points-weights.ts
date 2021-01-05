import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../../resources';
import { createStandardContextIIFE } from '../../../_shared';
import { getRequired, makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../../../validations';
import { environment } from 'projects/bitbybit/src/environments/environment';
import { curveConstants } from './curve-constants';

export function createCurveByKnotsControlPointsWeightsBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'verb_geometry_nurbs_curve_by_knots_control_points_weights';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('Knots')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_geometry_nurbs_curve_by_knots_control_points_weights_input_knots);
            this.appendValueInput('Points')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_geometry_nurbs_curve_by_knots_control_points_weights_input_control_points.toLowerCase());
            this.appendValueInput('Weights')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_geometry_nurbs_curve_by_knots_control_points_weights_input_weights.toLowerCase());
            this.appendValueInput('Degree')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_geometry_nurbs_curve_by_knots_control_points_weights_input_degree.toLowerCase());
            this.setOutput(true, 'NurbsCurve');
            this.setColour('#fff');
            this.setTooltip(resources.block_verb_geometry_nurbs_curve_by_knots_control_points_weights_description);
            this.setHelpUrl(environment.docsUrl + curveConstants.helpUrl + '#' + 'createcurvebyknotscontrolpointsweights');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            knots: (JavaScript as any).valueToCode(block, 'Knots', (JavaScript as any).ORDER_ATOMIC),
            points: (JavaScript as any).valueToCode(block, 'Points', (JavaScript as any).ORDER_ATOMIC),
            weights: (JavaScript as any).valueToCode(block, 'Weights', (JavaScript as any).ORDER_ATOMIC),
            degree: (JavaScript as any).valueToCode(block, 'Degree', (JavaScript as any).ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_knots, resources.block_points, resources.block_weights, resources.block_degree
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `return bitbybit.curve.createCurveByKnotsControlPointsWeights(inputs);`
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
            getRequired(resources, resources.block_knots),
        ]
    }, {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_points),
        ]
    }, {
        entity: keys[2],
        validations: [
            getRequired(resources, resources.block_weights),
        ]
    }, {
        entity: keys[3],
        validations: [
            getRequired(resources, resources.block_degree),
        ]
    }];
}
