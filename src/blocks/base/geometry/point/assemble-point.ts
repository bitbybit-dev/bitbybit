import { createPointBlock } from './point';
import { createPointDistanceBlock } from './point-distance';
import { createPointTransformBlock } from './point-transform';
import { createPointXBlock } from './point-x';
import { createPointYBlock } from './point-y';
import { createPointZBlock } from './point-z';
import { createPointsTransformBlock } from './points-transform';

export function assemblePointBlocks() {
    createPointBlock();
    createPointDistanceBlock();
    createPointXBlock();
    createPointYBlock();
    createPointZBlock();
    createPointTransformBlock();
    createPointsTransformBlock();
}
