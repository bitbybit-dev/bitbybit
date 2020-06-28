import { createRevolvedSurfaceBlock } from './revolved-surface';
import { createRevolvedSurfaceAngleBlock } from './revolved-surface-angle';
import { createRevolvedSurfaceAxisBlock } from './revolved-surface-axis';
import { createRevolvedSurfaceCenterBlock } from './revolved-surface-center';
import { createRevolvedSurfaceProfileBlock } from './revolved-surface-profile';

export function assembleRevolvedSurfaceBlocks() {
    createRevolvedSurfaceBlock();
    createRevolvedSurfaceAngleBlock();
    createRevolvedSurfaceProfileBlock();
    createRevolvedSurfaceCenterBlock();
    createRevolvedSurfaceAxisBlock();
}
