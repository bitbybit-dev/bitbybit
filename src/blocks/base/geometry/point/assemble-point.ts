import { createPointBlock } from './point';
import { createPointDistanceBlock } from './point-distance';
import { createPointXBlock } from './point-x';
import { createPointYBlock } from './point-y';
import { createPointZBlock } from './point-z';

export function assemblePointBlocks() {
    createPointBlock();
    createPointDistanceBlock();
    createPointXBlock();
    createPointYBlock();
    createPointZBlock();
}
