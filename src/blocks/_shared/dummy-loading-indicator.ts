import { Block, ALIGN_LEFT, FieldImage, FieldLabel } from 'blockly';

export function createDummyAsyncLoadingIndicator(context: Block) {
    context.appendDummyInput('Status')
                .setAlign(ALIGN_LEFT)
                .appendField(new FieldImage(
                    'assets/blocks/loader-eclipse.svg',
                    25,
                    30,
                    ''),
                    'LoadingIndicator'
                )
                .appendField(new FieldLabel('Computing...', 'statusClass'))
                .setVisible(false);
    return context;
}
