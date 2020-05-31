import { createPointBlock } from './point';
import { createPointDistanceBlock } from './point-distance';
import { createPointGetXBlock } from './point-get-x';
import { createPointGetYBlock } from './point-get-y';
import { createPointGetZBlock } from './point-get-z';

export function assemblePointBlocks() {
    createPointBlock();
    createPointDistanceBlock();
    createPointGetXBlock();
    createPointGetYBlock();
    createPointGetZBlock();
}