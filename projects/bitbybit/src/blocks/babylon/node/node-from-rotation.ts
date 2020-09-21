import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../resources';
import { createStandardContextIIFE } from '../../_shared';
import { getRequired, makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../../validations';

export function createNodeFromRotationBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'base_geometry_node_from_rotation';

    Blocks[blockSelector] = {
        init() {
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
            origin: JavaScript.valueToCode(block, 'Origin', JavaScript.ORDER_ATOMIC),
            rotation: JavaScript.valueToCode(block, 'Rotation', JavaScript.ORDER_ATOMIC),
            parent: JavaScript.valueToCode(block, 'Parent', JavaScript.ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_position, resources.block_rotation
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `
            const transformNode = new BitByBit.BABYLON.TransformNode("node${Math.random()}");
            if(inputs.parent){
                transformNode.parent = inputs.parent;
            }
            transformNode.position = new BitByBit.BABYLON.Vector3(inputs.origin[0], inputs.origin[1], inputs.origin[2]);
            transformNode.rotation = new BitByBit.BABYLON.Vector3(
                BitByBit.BABYLON.Angle.FromDegrees(inputs.rotation[0]).radians(),
                BitByBit.BABYLON.Angle.FromDegrees(inputs.rotation[1]).radians(),
                BitByBit.BABYLON.Angle.FromDegrees(inputs.rotation[2]).radians()
            );
            return transformNode;
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
            getRequired(resources, resources.block_position),
        ]
    }, {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_rotation),
        ]
    }];
}
