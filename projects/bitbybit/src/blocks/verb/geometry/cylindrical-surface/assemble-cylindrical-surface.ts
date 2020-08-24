import { createCylindricalSurfaceBlock } from './cylindrical-surface';
import { createCylindricalSurfaceAxisBlock } from './cylindrical-surface-axis';
import { createCylindricalSurfaceBaseBlock } from './cylindrical-surface-base';
import { createCylindricalSurfaceHeightBlock } from './cylindrical-surface-height';
import { createCylindricalSurfaceRadiusBlock } from './cylindrical-surface-radius';
import { createCylindricalSurfaceXAxisBlock } from './cylindrical-surface-x-axis';

export function assembleCylindricalSurfaceBlocks() {
    createCylindricalSurfaceBlock();
    createCylindricalSurfaceBaseBlock();
    createCylindricalSurfaceAxisBlock();
    createCylindricalSurfaceXAxisBlock();
    createCylindricalSurfaceRadiusBlock();
    createCylindricalSurfaceHeightBlock();
}
