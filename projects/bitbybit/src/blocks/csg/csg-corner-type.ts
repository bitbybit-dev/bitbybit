import { Block, Blocks, FieldDropdown } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { environment } from '../../environments/environment';
import { ResourcesService } from '../../resources';
import { createStandardContextIIFE } from '../_shared';
import { solidConstants } from './solid-constants';

export function createCornerTypeBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'csg_corner_type';

    Blocks[blockSelector] = {
        init(): void {
            this.appendDummyInput('Corners')
                .appendField(new FieldDropdown([
                    [resources.block_jscad_corner_type_input_edge, '\'edge\''],
                    [resources.block_jscad_corner_type_input_round, '\'round\''],
                    [resources.block_jscad_corner_type_input_chamfer, '\'chamfer\''],
                ]), 'CornerType');
            this.setOutput(true, 'String');
            this.setColour('#fff');
            this.setTooltip(resources.block_jscad_expansions_expand_path_description);
            this.setHelpUrl(environment.docsUrl + '/enums/_api_inputs_solid_Inputs.JSCAD.solidcornertypeenum.html');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            cornerType: block.getFieldValue('CornerType'),
        };

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `return inputs.cornerType;`
        );
        return [code, (JavaScript as any).ORDER_ATOMIC];
    };
}
