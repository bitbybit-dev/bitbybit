
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

export function createDrawNodeBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'babylon_draw_node';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('Node')
                .setCheck('Node')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_draw_node);
            this.appendValueInput('ColorX')
                .setCheck('Colour')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_draw_node_color_x.toLowerCase());
            this.appendValueInput('ColorY')
                .setCheck('Colour')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_draw_node_color_y.toLowerCase());
            this.appendValueInput('ColorZ')
                .setCheck('Colour')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_draw_node_color_z.toLowerCase());
            this.appendValueInput('Size')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_babylon_input_size.toLowerCase());
            this.setColour('#fff');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setTooltip(resources.block_babylon_input_draw_node_description);
            this.setHelpUrl('');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {

        const inputs = {
            node: (JavaScript as any).valueToCode(block, 'Node', (JavaScript as any).ORDER_ATOMIC),
            colorX: (JavaScript as any).valueToCode(block, 'ColorX', (JavaScript as any).ORDER_ATOMIC),
            colorY: (JavaScript as any).valueToCode(block, 'ColorY', (JavaScript as any).ORDER_ATOMIC),
            colorZ: (JavaScript as any).valueToCode(block, 'ColorZ', (JavaScript as any).ORDER_ATOMIC),
            size: (JavaScript as any).valueToCode(block, 'Size', (JavaScript as any).ORDER_ATOMIC),
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
            const CoTAxis = BitByBit.BitByBitBlocklyHelperService.localAxes(inputs.size, BitByBit.scene, inputs.colorX, inputs.colorY, inputs.colorZ);
            CoTAxis.parent = inputs.node;
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
