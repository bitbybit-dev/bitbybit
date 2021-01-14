import { Block, Blocks, FieldDropdown } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { environment } from '../../environments/environment';
import { ResourcesService } from '../../resources';
import { createStandardContextIIFE } from '../_shared';

export function createTextAlignTypeBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'csg_text_align_type';

    Blocks[blockSelector] = {
        init(): void {
            this.appendDummyInput('TextAlign')
                .appendField(new FieldDropdown([
                    [resources.block_csg_text_align_type_input_left.toLowerCase(), '\'left\''],
                    [resources.block_csg_text_align_type_input_center.toLowerCase(), '\'center\''],
                    [resources.block_csg_text_align_type_input_right.toLowerCase(), '\'right\''],
                ]), 'TextAlignType');
            this.setOutput(true, 'String');
            this.setColour('#fff');
            this.setTooltip(resources.block_csg_expansions_expand_path_description);
            this.setHelpUrl(environment.docsUrl + '/enums/_api_inputs_solid_inputs_.solid.solidtextalignenum.html');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            textAlignType: block.getFieldValue('TextAlignType'),
        };

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `return inputs.textAlignType;`
        );
        return [code, (JavaScript as any).ORDER_ATOMIC];
    };
}
