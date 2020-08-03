import { assembleAsyncBlocks } from './async/assemble-async';
import { assembleDateBlocks } from './date/assemble-date';
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
    assembleDateBlocks();
}
