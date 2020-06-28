import { assembleBezierCurveBlocks } from './bezier-curve/assemble-bezier-curve';
import { assembleCircleBlocks } from './circle/assemble-circle';
import { assembleConicalSurfaceBlocks } from './conical-surface/assemble-conical-surface';
import { assembleEllipseBlocks } from './ellipse/assemble-ellipse';
import { assembleCurveBlocks } from './nurbs-curve/assemble-curve';
import { assembleSurfaceBlocks } from './nurbs-surface/assemble-surface';
import { assembleSphericalSurfaceBlocks } from './spherical-surface/assemble-spherical-surface';

export function assembleGeometryBlocks() {
    assembleBezierCurveBlocks();
    assembleCurveBlocks();
    assembleSurfaceBlocks();
    assembleEllipseBlocks();
    assembleCircleBlocks();
    assembleSphericalSurfaceBlocks();
    assembleConicalSurfaceBlocks();
}
