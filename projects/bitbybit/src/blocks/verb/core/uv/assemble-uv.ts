import { createCoreUVBlock } from './core-uv';
import { createCoreUVGetUBlock } from './core-uv-get-u';
import { createCoreUVGetVBlock } from './core-uv-get-v';

export function assembleUVBlocks() {
    createCoreUVBlock();
    createCoreUVGetUBlock();
    createCoreUVGetVBlock();
}