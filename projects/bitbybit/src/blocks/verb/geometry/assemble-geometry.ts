import { assembleBezierCurveBlocks } from './bezier-curve/assemble-bezier-curve';
import { assembleCircleBlocks } from './circle/assemble-circle';
import { assembleConicalSurfaceBlocks } from './conical-surface/assemble-conical-surface';
import { assembleCylindricalSurfaceBlocks } from './cylindrical-surface/assemble-cylindrical-surface';
import { assembleEllipseBlocks } from './ellipse/assemble-ellipse';
import { assembleExtrudedSurfaceBlocks } from './extruded-surface/assemble-extruded-surface';
import { assembleCurveBlocks } from './nurbs-curve/assemble-curve';
import { assembleSurfaceBlocks } from './nurbs-surface/assemble-surface';
import { assembleRevolvedSurfaceBlocks } from './revolved-surface/assemble-revolved-surface';
import { assembleSphericalSurfaceBlocks } from './spherical-surface/assemble-spherical-surface';
import { assembleSweptSurfaceBlocks } from './swept-surface/assemble-swept-surface';

export function assembleGeometryBlocks() {
    assembleBezierCurveBlocks();
    assembleCurveBlocks();
    assembleSurfaceBlocks();
    assembleEllipseBlocks();
    assembleCircleBlocks();
    assembleSphericalSurfaceBlocks();
    assembleConicalSurfaceBlocks();
    assembleExtrudedSurfaceBlocks();
    assembleCylindricalSurfaceBlocks();
    assembleRevolvedSurfaceBlocks();
    assembleSweptSurfaceBlocks();
}
