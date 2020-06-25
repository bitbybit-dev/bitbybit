import { assembleCurveBlocks } from './nurbs-curve/assemble-curve';
import { assembleSurfaceBlocks } from './nurbs-surface/assemble-surface';
import { assembleShapesBlocks } from './shapes/assemble-shapes';
import { assembleSphericalSurfaceBlocks } from './spherical-surface/assemble-spherical-surface';

export function assembleGeometryBlocks() {
    assembleCurveBlocks();
    assembleSurfaceBlocks();
    assembleShapesBlocks();
    assembleSphericalSurfaceBlocks();
}