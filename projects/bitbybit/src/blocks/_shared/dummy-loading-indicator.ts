import { ALIGN_LEFT, Block, FieldImage, FieldLabel } from 'blockly';
import { ResourcesInterface } from '../../resources';

export function createDummyAsyncLoadingIndicator(context: Block, resources: ResourcesInterface) {
    context.appendDummyInput('Status')
                .setAlign(ALIGN_LEFT)
                .appendField(new FieldImage(
                    'assets/blocks/loader-eclipse.svg',
                    25,
                    30,
                    ''),
                    'LoadingIndicator'
                )
                .appendField(new FieldLabel(resources.block_computing, 'statusClass'))
                .setVisible(false);
    return context;
}
