import { createConicalSurfaceBlock } from './conical-surface';
import { createConicalSurfaceAxisBlock } from './conical-surface-axis';
import { createConicalSurfaceBaseBlock } from './conical-surface-base';
import { createConicalSurfaceHeightBlock } from './conical-surface-height';
import { createConicalSurfaceRadiusBlock } from './conical-surface-radius';
import { createConicalSurfaceXAxisBlock } from './conical-surface-x-axis';

export function assembleConicalSurfaceBlocks() {
    createConicalSurfaceBlock();
    createConicalSurfaceBaseBlock();
    createConicalSurfaceAxisBlock();
    createConicalSurfaceXAxisBlock();
    createConicalSurfaceRadiusBlock();
    createConicalSurfaceHeightBlock();
}
