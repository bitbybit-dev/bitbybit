import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../../resources';
import { createStandardContextIIFE } from '../../../_shared';
import {
    getOfLength,
    getRequired,
    makeRequiredValidationModelForInputs,
    BlockValidationService,
    ValidationEntityInterface
} from '../../../validations';

export function createLineBlock() {

    const resources = ResourcesService.getResourcesForSelectedLanguage();
    const blockSelector = 'base_geometry_line';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('StartPoint')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_geometry_input_line_start_point);
            this.appendValueInput('EndPoint')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_geometry_input_line_end_point);
            this.setOutput(true, 'Line');
            this.setColour('#fff');
            this.setTooltip(resources.block_base_geometry_line_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            startPoint: JavaScript.valueToCode(block, 'StartPoint', JavaScript.ORDER_ATOMIC),
            endPoint: JavaScript.valueToCode(block, 'EndPoint', JavaScript.ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BlockValidationService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_point, resources.block_point
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
`
        return {
            start: inputs.startPoint,
            end: inputs.endPoint
        };
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
            getOfLength(resources, resources.block_point, 3)
        ]
    },
    {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_point),
            getOfLength(resources, resources.block_point, 3)
        ]
    }];
}
