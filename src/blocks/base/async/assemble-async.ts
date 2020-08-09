import { createCatchBlock } from './catch';
import { createClearIntervalBlock } from './clear-interval';
import { createClearTimeoutBlock } from './clear-timeout';
import { createExecuteAtIntervalBlock } from './execute-at-interval';
import { createExecuteAtIntervalWithHandlerBlock } from './execute-at-interval-with-handler';
import { createExecuteLaterBlock } from './execute-later';
import { createThenBlock } from './then';
import { createThenChainBlock } from './then-chain';

export function assembleAsyncBlocks() {
    createThenBlock();
    createThenChainBlock();
    createCatchBlock();
    createExecuteLaterBlock();
    createExecuteAtIntervalBlock();
    createExecuteAtIntervalWithHandlerBlock();
    createClearIntervalBlock();
    createClearTimeoutBlock();
}
