import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesService } from '../../../../resources';
import { createStandardContextIIFE } from '../../../_shared';
import { makeRequiredValidationModelForInputs, BitByBitBlockHandlerService } from '../../../validations';
import { environment } from 'projects/bitbybit/src/environments/environment';
import { polylineConstants } from './polyline-constants';

export function createPolylineLengthBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'base_geometry_polyline_length';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('Polyline')
                .setCheck('Polyline')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_geometry_polyline_length);
            this.setOutput(true, 'Number');
            this.setColour('#fff');
            this.setTooltip(resources.block_base_geometry_polyline_length_description);
            this.setHelpUrl(environment.docsUrl + polylineConstants.helpUrl + '#' + 'length');
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {
            polyline: (JavaScript as any).valueToCode(block, 'Polyline', (JavaScript as any).ORDER_ATOMIC)
        };

        // this is first set of validations to check that all inputs are non empty strings
        BitByBitBlockHandlerService.validate(block, block.workspace, makeRequiredValidationModelForInputs(resources, inputs, [
            resources.block_polyline
        ]));

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `return bitbybit.polyline.length(inputs);`
        );
        return [code, (JavaScript as any).ORDER_ATOMIC];
    };
}
