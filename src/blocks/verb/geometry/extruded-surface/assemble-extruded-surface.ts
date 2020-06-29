import { createExtrudedSurfaceBlock } from './extruded-surface';
import { createExtrudedSurfaceDirectionBlocks } from './extruded-surface-direction';
import { createExtrudedSurfaceProfileBlocks } from './extruded-surface-profile';

export function assembleExtrudedSurfaceBlocks() {
    createExtrudedSurfaceBlock();
    createExtrudedSurfaceDirectionBlocks();
    createExtrudedSurfaceProfileBlocks();
}
