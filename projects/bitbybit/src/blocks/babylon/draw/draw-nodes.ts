
import { ALIGN_RIGHT, Block, Blocks, FieldVariable, VARIABLE_CATEGORY_NAME } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../resources';
import { createStandardContextIIFE } from '../../_shared';
import {
    getRequired,
    makeRequiredValidationModelForInputs,
    BitByBitBlockHandlerService,
    ValidationEntityInterface
} from '../../validations';

export function createDrawNodesBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'babylon_draw_nodes';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('Nodes')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_draw_nodes);
            this.appendValueInput('ColorX')
                .setCheck('Colour')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_draw_nodes_color_x.toLowerCase());
            this.appendValueInput('ColorY')
                .setCheck('Colour')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_draw_nodes_color_y.toLowerCase());
            this.appendValueInput('ColorZ')
                .setCheck('Colour')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_draw_nodes_color_z.toLowerCase());
            this.appendValueInput('Size')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_size.toLowerCase());
            this.setColour('#fff');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setTooltip(resources.block_babylon_input_draw_nodes_description);
            this.setHelpUrl('');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {

        const inputs = {
            nodes: JavaScript.valueToCode(block, 'Nodes', JavaScript.ORDER_ATOMIC),
            colorX: JavaScript.valueToCode(block, 'ColorX', JavaScript.ORDER_ATOMIC),
            colorY: JavaScript.valueToCode(block, 'ColorY', JavaScript.ORDER_ATOMIC),
            colorZ: JavaScript.valueToCode(block, 'ColorZ', JavaScript.ORDER_ATOMIC),
            size: JavaScript.valueToCode(block, 'Size', JavaScript.ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_node, resources.block_colour, resources.block_colour, resources.block_colour,
            resources.block_size
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        return createStandardContextIIFE(block, blockSelector, inputs, false,
            `
            inputs.nodes.forEach(node => {
                const CoTAxis = BitByBit.BitByBitBlocklyHelperService.localAxes(inputs.size, BitByBit.scene, inputs.colorX, inputs.colorY, inputs.colorZ);
                CoTAxis.parent = node;
            });
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
            getRequired(resources, resources.block_node)
        ]
    },{
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_colour)
        ]
    },{
        entity: keys[2],
        validations: [
            getRequired(resources, resources.block_colour)
        ]
    },{
        entity: keys[3],
        validations: [
            getRequired(resources, resources.block_colour)
        ]
    },{
        entity: keys[4],
        validations: [
            getRequired(resources, resources.block_size)
        ]
    }];
}
