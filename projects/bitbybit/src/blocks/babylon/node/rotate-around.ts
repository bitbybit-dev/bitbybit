import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../resources';
import { createStandardContextIIFE } from '../../_shared';
import { getRequired, makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../../validations';
import { environment } from 'projects/bitbybit/src/environments/environment';
import { nodeConstants } from './node-constants';

export function createNodeRotateAroundBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'base_geometry_node_rotate_around';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('Node')
                .setCheck('Node')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_node_rotate_around_input_node);
            this.appendValueInput('Position')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_node_rotate_around_position.toLowerCase());
            this.appendValueInput('Axis')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_node_rotate_around_input_axis.toLowerCase());
            this.appendValueInput('Angle')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_node_rotate_around_input_amount.toLowerCase());
            this.setOutput(false);
            this.setColour('#fff');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setTooltip(resources.block_babylon_node_rotate_around_description);
            this.setHelpUrl(environment.docsUrl + nodeConstants.helpUrl + '#' + 'rotatearoundaxiswithposition');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            node: (JavaScript as any).valueToCode(block, 'Node', (JavaScript as any).ORDER_ATOMIC),
            position: (JavaScript as any).valueToCode(block, 'Position', (JavaScript as any).ORDER_ATOMIC),
            axis: (JavaScript as any).valueToCode(block, 'Axis', (JavaScript as any).ORDER_ATOMIC),
            angle: (JavaScript as any).valueToCode(block, 'Angle', (JavaScript as any).ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_node, resources.block_position, resources.block_axis, resources.block_angle
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        return createStandardContextIIFE(block, blockSelector, inputs, false,
            `bitbybit.node.rotateAroundAxisWithPosition(inputs);`
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
    }, {
        entity: keys[2],
        validations: [
            getRequired(resources, resources.block_axis),
        ]
    }, {
        entity: keys[3],
        validations: [
            getRequired(resources, resources.block_angle),
        ]
    }];
}
