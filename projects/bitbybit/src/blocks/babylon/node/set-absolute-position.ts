import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../resources';
import { createStandardContextIIFE } from '../../_shared';
import { getRequired, makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../../validations';

export function createNodeSetAbsolutePositionBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'base_geometry_node_set_absolute_position';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('Node')
                .setCheck('Node')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_node_set_absolute_position_input_node);
            this.appendValueInput('Position')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_node_set_absolute_position_input_position.toLowerCase());
            this.setOutput(false);
            this.setColour('#fff');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setTooltip(resources.block_babylon_node_set_absolute_position_description);
            this.setHelpUrl('');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            node: JavaScript.valueToCode(block, 'Node', JavaScript.ORDER_ATOMIC),
            position: JavaScript.valueToCode(block, 'Position', JavaScript.ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_node, resources.block_position
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        return createStandardContextIIFE(block, blockSelector, inputs, false,
            `
            inputs.node.setAbsolutePosition(
                new BitByBit.BABYLON.Vector3(inputs.position[0], inputs.position[1], inputs.position[2]),
            );
`
        );
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
    }, {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_position),
        ]
    }];
}
