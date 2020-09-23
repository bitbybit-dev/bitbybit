
import { createNodeFromRotationBlock } from './node-from-rotation';
import { createNodeWorldBlock } from './node-world';
import { createNodeGetRootBlock } from './get-root';
import { createNodeGetRotationQuaternionBlock } from './get-rotation-quaternion';
import { createNodeGetRotationBlock } from './get-rotation';
import { createNodeGetAbsolutePositionBlock } from './get-absolute-position';
import { createNodeGetPositionExpressedInLocalSpaceBlock } from './get-position-expressed-in-local-space';
import { createNodeGetAbsoluteRotationQuaternionBlock } from './get-absolute-rotation-quaternion';
import { createNodeGetAbsoluteUpVectorBlock } from './get-absolute-up-vector';
import { createNodeGetAbsoluteRightVectorBlock } from './get-absolute-right-vector';
import { createNodeGetAbsoluteForwardVectorBlock } from './get-absolute-forward-vector';
import { createNodeRotateBlock } from './rotate';
import { createNodeRotateAroundBlock } from './rotate-around';
import { createNodeSetAbsolutePositionBlock } from './set-absolute-position';
import { createNodeSetDirectionBlock } from './set-direction';
import { createNodeSetParentBlock } from './set-parent';
import { createNodeTranslateBlock } from './translate';
import { createNodeGetParentBlock } from './get-parent';
import { createNodeGetChildrenBlock } from './get-children';

export function assembleNodeBlocks(): void {
    createNodeFromRotationBlock();
    createNodeWorldBlock();
    createNodeGetRootBlock();
    createNodeGetRotationQuaternionBlock();
    createNodeGetRotationBlock();
    createNodeGetAbsolutePositionBlock();
    createNodeGetAbsoluteRotationQuaternionBlock();
    createNodeGetAbsoluteUpVectorBlock();
    createNodeGetPositionExpressedInLocalSpaceBlock();
    createNodeGetAbsoluteRightVectorBlock();
    createNodeGetAbsoluteForwardVectorBlock();
    createNodeGetParentBlock();
    createNodeRotateBlock();
    createNodeRotateAroundBlock();
    createNodeSetAbsolutePositionBlock();
    createNodeSetDirectionBlock();
    createNodeSetParentBlock();
    createNodeTranslateBlock();
    createNodeGetChildrenBlock();
}
