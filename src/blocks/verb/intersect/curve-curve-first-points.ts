import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../resources';
import { createStandardContextIIFE } from '../../_shared';
import { getRequired, makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../../validations';

export function createIntersectCurveCurveFirstPointsBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'verb_geometry_intersect_curve_curve_first_points';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('Intersections')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.verb_geometry_intersect_curve_curve_first_points_input_intersections);
            this.setOutput(true, 'Array');
            this.setColour('#fff');
            this.setTooltip(resources.verb_geometry_intersect_curve_curve_first_points_description);
            this.setHelpUrl('');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            intersections: JavaScript.valueToCode(block, 'Intersections', JavaScript.ORDER_ATOMIC)
        };

        // this is first set of validations to check that all inputs are non empty strings

        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_intersections
        ]));
        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `return inputs.intersections.filter(s => s.u0 >= 0 && s.u0 <= 1).map(i => i.point0);`);
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
            getRequired(resources, resources.block_intersections),
        ]
    }];
}
