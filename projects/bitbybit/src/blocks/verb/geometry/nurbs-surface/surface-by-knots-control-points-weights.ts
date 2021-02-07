import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../../resources';
import { createStandardContextIIFE } from '../../../_shared';
import { getRequired, makeRequiredValidationModelForInputs, HS, ValidationEntityInterface } from '../../../validations';
import { environment } from 'projects/bitbybit/src/environments/environment';
import { surfaceConstants } from './surface-constants';

export function createSurfaceByKnotsControlPointsWeightsBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'verb_geometry_nurbs_surface_by_knots_control_points_weights';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('KnotsU')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_geometry_nurbs_surface_by_knots_control_points_weights_input_knots_u);
            this.appendValueInput('KnotsV')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_geometry_nurbs_surface_by_knots_control_points_weights_input_knots_v.toLowerCase());
            this.appendValueInput('Points')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_geometry_nurbs_surface_by_knots_control_points_weights_input_points.toLowerCase());
            this.appendValueInput('Weights')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_geometry_nurbs_surface_by_knots_control_points_weights_input_weights.toLowerCase());
            this.appendValueInput('DegreeU')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_geometry_nurbs_surface_by_knots_control_points_weights_input_degree_u.toLowerCase());
            this.appendValueInput('DegreeV')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_geometry_nurbs_surface_by_knots_control_points_weights_input_degree_v.toLowerCase());
            this.setOutput(true, 'NurbsSurface');
            this.setColour('#fff');
            this.setTooltip(resources.block_verb_geometry_nurbs_surface_by_knots_control_points_weights_description);
            this.setHelpUrl(environment.docsUrl + surfaceConstants.helpUrl + '#' + 'createsurfacebyknotscontrolpointsweights');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            knotsU: (JavaScript as any).valueToCode(block, 'KnotsU', (JavaScript as any).ORDER_ATOMIC),
            knotsV: (JavaScript as any).valueToCode(block, 'KnotsV', (JavaScript as any).ORDER_ATOMIC),
            points: (JavaScript as any).valueToCode(block, 'Points', (JavaScript as any).ORDER_ATOMIC),
            weights: (JavaScript as any).valueToCode(block, 'Weights', (JavaScript as any).ORDER_ATOMIC),
            degreeU: (JavaScript as any).valueToCode(block, 'DegreeU', (JavaScript as any).ORDER_ATOMIC),
            degreeV: (JavaScript as any).valueToCode(block, 'DegreeV', (JavaScript as any).ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        HS.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_knots_u, resources.block_knots_v, resources.block_points,
            resources.block_weights, resources.block_degree_u, resources.block_degree_v
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `return bitbybit.verb.surface.createSurfaceByKnotsControlPointsWeights(inputs);`);
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
            getRequired(resources, resources.block_knots_u),
        ]
    }, {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_knots_v),
        ]
    }, {
        entity: keys[2],
        validations: [
            getRequired(resources, resources.block_points),
        ]
    }, {
        entity: keys[3],
        validations: [
            getRequired(resources, resources.block_weights),
        ]
    }, {
        entity: keys[4],
        validations: [
            getRequired(resources, resources.block_degree_u),
        ]
    }, {
        entity: keys[5],
        validations: [
            getRequired(resources, resources.block_degree_v),
        ]
    }];
}
