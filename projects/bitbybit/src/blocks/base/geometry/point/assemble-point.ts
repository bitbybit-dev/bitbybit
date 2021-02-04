import { createPointBlock } from './point';
import { createPointClosestFromPointsBlock } from './point-closest-from-points';
import { createPointClosestFromPointsDistanceBlock } from './point-closest-from-points-distance';
import { createPointClosestFromPointsIndexBlock } from './point-closest-from-points-index';
import { createPointDistanceBlock } from './point-distance';
import { createPointListBlock } from './point-list';
import { createPointTransformBlock } from './point-transform';
import { createPointXBlock } from './point-x';
import { createPointYBlock } from './point-y';
import { createPointZBlock } from './point-z';
import { createPointSpiralBlock } from './points-spiral';
import { createPointsTransformBlock } from './points-transform';
import { createPoint2dBlock } from './point-2d';
import { createPointHexGridBlock } from './points-hex-grid';

export function assemblePointBlocks(): void {
    createPointBlock();
    createPointDistanceBlock();
    createPointXBlock();
    createPointYBlock();
    createPointZBlock();
    createPointTransformBlock();
    createPointsTransformBlock();
    createPointSpiralBlock();
    createPointListBlock();
    createPointClosestFromPointsBlock();
    createPointClosestFromPointsDistanceBlock();
    createPointClosestFromPointsIndexBlock();
    createPoint2dBlock();
    createPointHexGridBlock();
}
