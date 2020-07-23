import { createDrawTextTagBlock } from './draw-text-tag';
import { createDrawTextTagsBlock } from './draw-text-tags';
import { createTextTagBlock } from './text-tag';

export function assembleTagBlocks() {
    createDrawTextTagsBlock();
    createDrawTextTagBlock();
    createTextTagBlock();
}
