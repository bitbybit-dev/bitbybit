
import { createNodeFromRotationBlock } from './node-from-rotation';
import { createNodeWorldBlock } from './node-world';
import { createNodeGetRootBlock } from './get-root';
import { createNodeGetRotationQuaternionBlock } from './get-rotation-quaternion';
import { createNodeGetRotationBlock } from './get-rotation';

export function assembleNodeBlocks() {
    createNodeFromRotationBlock();
    createNodeWorldBlock();
    createNodeGetRootBlock();
    createNodeGetRotationQuaternionBlock();
    createNodeGetRotationBlock();
}
