import { assembleCoreBlocks } from './core/assemble-core';
import { assembleGeometryBlocks } from './geometry/assemble-geometry';

export function assembleVerbBlocks() {
    assembleCoreBlocks();
    assembleGeometryBlocks();
}
