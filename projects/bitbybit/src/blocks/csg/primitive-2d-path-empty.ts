import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesInterface, ResourcesService } from '../../resources';
import { createStandardContextIIFE } from '../_shared';
import { getRequired, makeRequiredValidationModelForInputs, HS, ValidationEntityInterface } from '../validations';
import { environment } from '../../environments/environment';
import { solidConstants } from './solid-constants';

export function createPrimitive2dPathEmptyBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'csg_primitive_2d_path_empty';

    Blocks[blockSelector] = {
        init(): void {
            this.appendDummyInput('Path')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_jscad_primitive_2d_path_empty_input_path);
            this.setOutput(true, 'Path');
            this.setColour('#fff');
            this.setTooltip(resources.block_jscad_primitive_2d_path_empty_description);
            this.setHelpUrl(environment.docsUrl + solidConstants.solidPathHelpUrl + '#' + 'createempty');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
        };

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `return bitbybit.jscad.path.createEmpty();`

        );
        return [code, (JavaScript as any).ORDER_ATOMIC];
    };
}
