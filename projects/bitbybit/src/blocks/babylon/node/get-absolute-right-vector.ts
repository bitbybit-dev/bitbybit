import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../resources';
import { createStandardContextIIFE } from '../../_shared';
import { getRequired, makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../../validations';

export function createNodeGetAbsoluteRightVectorBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'base_geometry_node_get_absolute_right_vector';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('Node')
                .setCheck('Node')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_node_get_absolute_right_vector_input_node);
            this.setOutput(true, 'Node');
            this.setColour('#fff');
            this.setTooltip(resources.block_babylon_node_get_absolute_right_vector_description);
            this.setHelpUrl('');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            node: (JavaScript as any).valueToCode(block, 'Node', (JavaScript as any).ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_node
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `
            const dir = inputs.node.right;
            return [dir.x, dir.y, dir.z];
`
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
            getRequired(resources, resources.block_node),
        ]
    }];
}
