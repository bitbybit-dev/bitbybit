import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../../../resources';
import { createStandardContextIIFE } from '../../../_shared';
import {
    getOfLength,
    getRequired,
    makeRequiredValidationModelForInputs,
    BitByBitBlockHandlerService,
    ValidationEntityInterface
} from '../../../validations';

export function createTextTagBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'base_geometry_text_tag';

    Blocks[blockSelector] = {
        init() {
            this.appendValueInput('Text')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_geometry_text_tag_input_text);
            this.appendValueInput('Position')
                .setCheck('Array')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_geometry_text_tag_input_position.toLowerCase());
            this.appendValueInput('Colour')
                .setCheck('Colour')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_geometry_text_tag_input_color.toLowerCase());
            this.appendValueInput('Size')
                .setCheck('Number')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_geometry_text_tag_input_size.toLowerCase());
            this.appendValueInput('AdaptDepth')
                .setCheck('Boolean')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_geometry_text_tag_input_adapt_depth.toLowerCase());
            this.setOutput(true, 'TextTag');
            this.setColour('#fff');
            this.setTooltip(resources.block_base_geometry_text_tag_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            text: (JavaScript as any).valueToCode(block, 'Text', (JavaScript as any).ORDER_ATOMIC),
            position: (JavaScript as any).valueToCode(block, 'Position', (JavaScript as any).ORDER_ATOMIC),
            colour: (JavaScript as any).valueToCode(block, 'Colour', (JavaScript as any).ORDER_ATOMIC),
            size: (JavaScript as any).valueToCode(block, 'Size', (JavaScript as any).ORDER_ATOMIC),
            adaptDepth: (JavaScript as any).valueToCode(block, 'AdaptDepth', (JavaScript as any).ORDER_ATOMIC),
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_position, resources.block_colour, resources.block_size, resources.block_adapt_depth
        ]));

        // this creates validation model to be used at runtime to evaluate real values of inputs
        const runtimeValidationModel = makeRuntimeValidationModel(resources, Object.keys(inputs));
        (block as any).validationModel = runtimeValidationModel;

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `return bitbybit.tag.create(inputs);`);
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
            getRequired(resources, resources.block_text),
        ]
    },
    {
        entity: keys[1],
        validations: [
            getRequired(resources, resources.block_point),
            getOfLength(resources, resources.block_point, 3)
        ]
    },
    {
        entity: keys[2],
        validations: [
            getRequired(resources, resources.block_colour),
        ]
    },
    {
        entity: keys[3],
        validations: [
            getRequired(resources, resources.block_size),
        ]
    },
    {
        entity: keys[4],
        validations: [
            getRequired(resources, resources.block_adapt_depth),
        ]
    }];
}
