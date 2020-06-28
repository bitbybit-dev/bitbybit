import { createSphericalSurfaceCenterBlock } from './spherical-surface-center';
import { createSphericalSurfaceRadiusBlock } from './spherical-surface-radius';
import { createSphericalSurfaceBlock } from './spherical-surface';

export function assembleSphericalSurfaceBlocks() {
    createSphericalSurfaceBlock();
    createSphericalSurfaceCenterBlock();
    createSphericalSurfaceRadiusBlock();
}
