import { createExtrudedSurfaceBlock } from './extruded-surface';
import { assembleExtrudedSurfaceDirectionBlocks } from './extruded-surface-direction';
import { assembleExtrudedSurfaceProfileBlocks } from './extruded-surface-profile';

export function assembleExtrudedSurfaceBlocks() {
    createExtrudedSurfaceBlock();
    assembleExtrudedSurfaceDirectionBlocks();
    assembleExtrudedSurfaceProfileBlocks();
}
