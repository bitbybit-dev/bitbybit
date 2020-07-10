import { createCatchBlock } from './catch';
import { createThenBlock } from './then';
import { createThenChainBlock } from './then-chain';

export function assembleAsyncBlocks() {
    createThenBlock();
    createThenChainBlock();
    createCatchBlock();
}
