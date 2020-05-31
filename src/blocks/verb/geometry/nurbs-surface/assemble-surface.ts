import { createSurfaceByCornersBlock } from './surface-by-corners';
import { createSurfaceByKnotsControlPointsWeightsBlock } from './surface-by-knots-control-points-weights';
import { createSurfaceByLoftingCurvesBlock } from './surface-by-lofting-curves';
import { createSurfaceDegreeUBlock } from './surface-degree-u';
import { createSurfaceDegreeVBlock } from './surface-degree-v';
import { createSurfaceKnotsUBlock } from './surface-knots-u';
import { createSurfaceKnotsVBlock } from './surface-knots-v';
import { createSurfaceControlPointsBlock } from './surface-control-points';
import { createSurfaceWeightsBlock } from './surface-weights';
import { createSurfaceCloneBlock } from './surface-clone';

export function assembleSurfaceBlocks() {
    createSurfaceByCornersBlock();
    createSurfaceByKnotsControlPointsWeightsBlock();
    createSurfaceByLoftingCurvesBlock();
    createSurfaceDegreeUBlock();
    createSurfaceDegreeVBlock();
    createSurfaceKnotsUBlock();
    createSurfaceKnotsVBlock();
    createSurfaceControlPointsBlock();
    createSurfaceWeightsBlock();
    createSurfaceCloneBlock();
}