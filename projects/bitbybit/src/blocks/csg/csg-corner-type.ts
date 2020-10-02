import { ALIGN_RIGHT, Block, Blocks, FieldDropdown } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../resources';
import { createStandardContextIIFE } from '../_shared';
import { getRequired, makeRequiredValidationModelForInputs, BitByBitBlockHandlerService, ValidationEntityInterface } from '../validations';

export function createCornerTypeBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'csg_corner_type';

    Blocks[blockSelector] = {
        init(): void {
            this.appendDummyInput('Corners')
                .appendField(new FieldDropdown([
                    [resources.block_csg_expansions_expand_path_input_corner_type_edge, '\'edge\''],
                    [resources.block_csg_expansions_expand_path_input_corner_type_round, '\'round\''],
                    [resources.block_csg_expansions_expand_path_input_corner_type_chamfer, '\'chamfer\''],
                ]), 'CornerType');
            this.setOutput(true, 'String');
            this.setColour('#fff');
            this.setTooltip(resources.block_csg_expansions_expand_path_description);
            this.setHelpUrl('');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            cornerType: block.getFieldValue('CornerType'),
        };

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `
            return inputs.cornerType;
`
        );
        return [code, JavaScript.ORDER_ATOMIC];
    };
}
