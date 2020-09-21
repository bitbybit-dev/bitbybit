import { createPolygonBlock } from './polygon';
import { createExtrudeLinearBlock } from './extrude-linear';

export function assembleCsgBlocks() {
    createPolygonBlock();
    createExtrudeLinearBlock();
}
