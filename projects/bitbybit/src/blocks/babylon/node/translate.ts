import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../resources';
import { createStandardContextIIFE } from '../../_shared';
import { getRequired, makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../../validations';

export function createNodeTranslateBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'base_geometry_node_translate';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('Node')
                .setCheck('Node')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_node_translate_input_node);
            this.appendValueInput('Direction')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_node_translate_input_direction.toLowerCase());
            this.appendValueInput('Distance')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_node_translate_input_distance.toLowerCase());
            this.setOutput(false);
            this.setColour('#fff');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setTooltip(resources.block_babylon_node_translate_description);
            this.setHelpUrl('');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            node: (JavaScript as any).valueToCode(block, 'Node', (JavaScript as any).ORDER_ATOMIC),
            direction: (JavaScript as any).valueToCode(block, 'Direction', (JavaScript as any).ORDER_ATOMIC),
            distance: (JavaScript as any).valueToCode(block, 'Distance', (JavaScript as any).ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_node, resources.block_position, resources.block_axis, resources.block_angle
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        return createStandardContextIIFE(block, blockSelector, inputs, false,
            `
            inputs.node.translate(
                new BitByBit.BABYLON.Vector3(inputs.direction[0], inputs.direction[1], inputs.direction[2]),
                inputs.distance,
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
            getRequired(resources, resources.block_direction),
        ]
    }, {
        entity: keys[2],
        validations: [
            getRequired(resources, resources.block_distance),
        ]
    }];
}
