import { createDrawShapeBlock } from './draw-shape';
import { createBoxBlock } from './shapes-create-box';

export function assembleOCCBlocks(): void {
    createBoxBlock();
    createDrawShapeBlock();
}