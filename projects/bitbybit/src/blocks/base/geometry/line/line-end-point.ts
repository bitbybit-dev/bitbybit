import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesService } from '../../../../resources';
import { createStandardContextIIFE } from '../../../_shared';
import { makeRequiredValidationModelForInputs, BitByBitBlockHandlerService } from '../../../validations';
import { environment } from 'projects/bitbybit/src/environments/environment';
import { lineConstants } from './line-constants';

export function createLineEndPointBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'base_geometry_line_end_point';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('Line')
                .setCheck('Line')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_geometry_line_end_point);
            this.setOutput(true, 'Array');
            this.setColour('#fff');
            this.setTooltip(resources.block_base_geometry_line_end_point_description);
            this.setHelpUrl(environment.docsUrl + lineConstants.helpUrl + '#' + 'getendpoint');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            line: (JavaScript as any).valueToCode(block, 'Line', (JavaScript as any).ORDER_ATOMIC)
        };

        // this is first set of validations to check that all inputs are non empty strings

        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_line
        ]));

        const code = createStandardContextIIFE(block, blockSelector, inputs, true, `return bitbybit.line.getEndPoint(inputs);`);
        return [code, (JavaScript as any).ORDER_ATOMIC];
    };
}
