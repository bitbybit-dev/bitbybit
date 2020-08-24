import { createCoreIntervalBlock } from './core-interval';
import { createCoreIntervalGetMaxBlock } from './core-interval-get-max';
import { createCoreIntervalGetMinBlock } from './core-interval-get-min';

export function assembleIntervalBlocks() {
    createCoreIntervalBlock();
    createCoreIntervalGetMaxBlock();
    createCoreIntervalGetMinBlock();
}