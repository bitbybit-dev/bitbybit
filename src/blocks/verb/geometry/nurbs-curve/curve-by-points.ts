import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../../resources';
import { createStandardContextIIFE } from '../../../_shared';
import { getRequired, getRequiredAndMin, makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../../../validations';

export function createCurveByPointsBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'verb_geometry_nurbs_curve_by_points';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('Points')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_geometry_nurbs_curve_by_points_inputs_points);
            this.appendValueInput('Degree')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_verb_geometry_nurbs_curve_by_points_inputs_degree.toLowerCase());
            this.setOutput(true, 'NurbsCurve');
            this.setColour('#fff');
            this.setTooltip(resources.block_verb_geometry_nurbs_curve_by_points_description);
            this.setHelpUrl('');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            points: JavaScript.valueToCode(block, 'Points', JavaScript.ORDER_ATOMIC),
            degree: JavaScript.valueToCode(block, 'Degree', JavaScript.ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_points, resources.block_degree
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `return verb.geom.NurbsCurve.byPoints( inputs.points, inputs.degree );`);
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
            getRequired(resources, resources.block_points),
        ]
    }, {
        entity: keys[1],
        validations: [
            ...getRequiredAndMin(resources, resources.block_degree, 0)
        ]
    }];
}
