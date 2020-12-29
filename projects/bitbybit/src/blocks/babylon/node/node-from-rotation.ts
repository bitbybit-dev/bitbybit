import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../resources';
import { createStandardContextIIFE } from '../../_shared';
import { getRequired, makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../../validations';

export function createNodeFromRotationBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'base_geometry_node_from_rotation';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('Origin')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_node_from_rotation_input_origin);
            this.appendValueInput('Rotation')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_node_from_rotation_input_rotation.toLowerCase());
            this.appendValueInput('Parent')
                .setCheck('Node')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_node_from_rotation_input_parent.toLowerCase());
            this.setOutput(true, 'Node');
            this.setColour('#fff');
            this.setTooltip(resources.block_babylon_node_from_rotation_description);
            this.setHelpUrl('');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            origin: (JavaScript as any).valueToCode(block, 'Origin', (JavaScript as any).ORDER_ATOMIC),
            rotation: (JavaScript as any).valueToCode(block, 'Rotation', (JavaScript as any).ORDER_ATOMIC),
            parent: (JavaScript as any).valueToCode(block, 'Parent', (JavaScript as any).ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_position, resources.block_rotation
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `return bitbybit.node.createNodeFromRotation(inputs);`
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
            getRequired(resources, resources.block_position),
        ]
    }, {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_rotation),
        ]
    }];
}
