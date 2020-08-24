import { assembleCoreBlocks } from './core/assemble-core';
import { assembleGeometryBlocks } from './geometry/assemble-geometry';
import { assembleIntersectBlocks } from './intersect/assemble-intersect';

export function assembleVerbBlocks() {
    assembleCoreBlocks();
    assembleGeometryBlocks();
    assembleIntersectBlocks();
}
