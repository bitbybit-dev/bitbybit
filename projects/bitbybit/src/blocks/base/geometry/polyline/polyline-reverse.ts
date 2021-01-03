import { ALIGN_RIGHT, Block, Blocks } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesService } from '../../../../resources';
import { createStandardContextIIFE } from '../../../_shared';
import { makeRequiredValidationModelForInputs, BitByBitBlockHandlerService } from '../../../validations';

export function createPolylineReverseBlock(): void {

    const resources = ResourcesService.getResources();
    const blockSelector = 'base_geometry_polyline_reverse';

    Blocks[blockSelector] = {
        init(): void {
            this.appendValueInput('Polyline')
                .setCheck('Polyline')
                .setAlign(ALIGN_RIGHT)
                .appendField(resources.block_base_geometry_polyline_reverse);
            this.setOutput(true, 'Polyline');
            this.setColour('#fff');
            this.setTooltip(resources.block_base_geometry_polyline_reverse_description);
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
       `return bitbybit.polyline.reverse(inputs);`);
        return [code, (JavaScript as any).ORDER_ATOMIC];
    };
}
