import { ALIGN_RIGHT, Block, Blocks, FieldImage } from 'blockly';
import * as JavaScript from 'blockly/javascript';
import { ResourcesService } from '../../../resources';
import { createStandardContextIIFE } from '../../_shared';
import { createDummyPromiseIndicator } from '../../_shared/dummy-promise-indicator';

export function createImportTextFileBlock() {

    const resources = ResourcesService.getResources();
    const blockSelector = 'base_io_import_text_file';

    Blocks[blockSelector] = {
        init() {
            this.appendDummyInput('TextFileInput')
                .setAlign(ALIGN_RIGHT)
                .appendField(createDummyPromiseIndicator(),
                    'LoadingIndicator'
                )
                .appendField(resources.block_base_io_import_text_file_input_text_file);
            this.setOutput(true, 'Promise');
            this.setColour('#fff');
            this.setTooltip(resources.block_base_io_import_text_file_description);
        }
    };

    JavaScript[blockSelector] = (block: Block) => {
        const inputs = {};

        const code = createStandardContextIIFE(block, blockSelector, inputs, true,
            `
            return BitByBit.BitByBitBlocklyHelperService.getFile();
`
        );
        return [code, (JavaScript as any).ORDER_ATOMIC];
    };
}
