import { createSphericalSurfaceCenterBlock } from './spherical-surfac-center';
import { createSphericalSurfaceRadiusBlock } from './spherical-surfac-radius';
import { createSphericalSurfaceBlock } from './spherical-surface';

export function assembleSphericalSurfaceBlocks() {
    createSphericalSurfaceBlock();
    createSphericalSurfaceCenterBlock();
    createSphericalSurfaceRadiusBlock();
}
