import { createModulusBlock } from './modulus';
import { createRemapNumberBlock } from './remap-number';
import { createRoundToDecimalsBlock } from './round-to-decimals';

export function assembleMathBlocks() {
    createRemapNumberBlock();
    createRoundToDecimalsBlock();
    createModulusBlock();
}
