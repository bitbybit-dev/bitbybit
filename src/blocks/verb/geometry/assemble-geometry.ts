import { assembleCurveBlocks } from './nurbs-curve/assemble-curve';
import { assembleSurfaceBlocks } from './nurbs-surface/assemble-surface';
import { assembleShapesBlocks } from './shapes/assemble-shapes';

export function assembleGeometryBlocks() {
    assembleCurveBlocks();
    assembleSurfaceBlocks();
    assembleShapesBlocks();
}