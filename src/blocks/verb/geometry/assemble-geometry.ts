import { assembleCurveBlocks } from './nurbs-curve/assemble-curve';
import { assembleSurfaceBlocks } from './nurbs-surface/assemble-surface';

export function assembleGeometryBlocks() {
    assembleCurveBlocks();
    assembleSurfaceBlocks();
}