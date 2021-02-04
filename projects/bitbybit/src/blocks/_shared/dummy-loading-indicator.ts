import { ALIGN_LEFT, ALIGN_RIGHT, Block, FieldImage, FieldLabel } from 'blockly';
import { ResourcesInterface } from '../../resources';
import { createDummyPromiseIndicator } from './dummy-promise-indicator';

export function createDummyAsyncLoadingIndicator(context: Block, resources: ResourcesInterface): Block {
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

export function createDummyAsyncLoadingIndicator2(context: Block, resources: ResourcesInterface): Block {
    context.appendDummyInput('AsyncAwait')
        .setAlign(ALIGN_LEFT)
        .appendField(new FieldImage(
            'assets/blocks/async.svg',
            45,
            20,
            ''),
            'LoadingIndicator'
        )
        .setVisible(true);
    context.appendDummyInput('Status')
        .setAlign(ALIGN_LEFT)
        .appendField(new FieldImage(
            'assets/blocks/loader-eclipse.svg',
            60,
            45,
            ''),
            'LoadingIndicator'
        )
        .setVisible(false);
    return context;
}
