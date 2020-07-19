import { createCatchBlock } from './catch';
import { createExecuteLaterBlock } from './execute-later';
import { createThenBlock } from './then';
import { createThenChainBlock } from './then-chain';

export function assembleAsyncBlocks() {
    createThenBlock();
    createThenChainBlock();
    createCatchBlock();
    createExecuteLaterBlock();
}
