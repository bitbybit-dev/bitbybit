import { assembleGeometryBlocks } from './geometry/assemble-geometry';
import { assembleListBlocks } from './lists/assemble-lists';
import { assembleMathBlocks } from './math/assemble-math';

export function assembleBaseBlocks() {
    assembleGeometryBlocks();
    assembleListBlocks();
    assembleMathBlocks();
}
