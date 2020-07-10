import { assembleAsyncBlocks } from './async/assemble-async';
import { assembleGeometryBlocks } from './geometry/assemble-geometry';
import { assembleIOBlocks } from './io/assemble-io';
import { assembleListBlocks } from './lists/assemble-lists';
import { assembleMathBlocks } from './math/assemble-math';

export function assembleBaseBlocks() {
    assembleGeometryBlocks();
    assembleListBlocks();
    assembleMathBlocks();
    assembleIOBlocks();
    assembleAsyncBlocks();
}
