import { createDrawShapeBlock } from './draw-shape';
import { createBoxBlock } from './shapes-create-box';
import { createConeBlock } from './shapes-create-cone';
import { createSphereBlock } from './shapes-create-sphere';

export function assembleOCCBlocks(): void {
    createBoxBlock();
    createDrawShapeBlock();
    createSphereBlock();
    createConeBlock();
}