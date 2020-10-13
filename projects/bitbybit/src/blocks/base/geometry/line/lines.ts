import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../../resources';
import { createStandardContextIIFE } from '../../../_shared';
import {
    getRequired,
    makeRequiredValidationModelForInputs,
    BitByBitBlockHandlerService,
    ValidationEntityInterface
} from '../../../validations';

export function createLinesBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'base_geometry_lines';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('StartPoints')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_geometry_lines_input_start_points);
            this.appendValueInput('EndPoints')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_geometry_lines_input_end_points.toLowerCase());
            this.setOutput(true, 'Array');
            this.setColour('#fff');
            this.setTooltip(resources.block_babylon_draw_lines_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            startPoints: JavaScript.valueToCode(block, 'StartPoints', JavaScript.ORDER_ATOMIC),
            endPoints: JavaScript.valueToCode(block, 'EndPoints', JavaScript.ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_points, resources.block_number_points
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
`
        return inputs.startPoints
            .map((s, index) => ({start: s, end: inputs.endPoints[index]}))
            .filter(line => BitByBit.verb.core.Vec.dist(line.start, line.end) !== 0);
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
            getRequired(resources, resources.block_point),
        ]
    },
    {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_number_points),
        ]
    }];
}
