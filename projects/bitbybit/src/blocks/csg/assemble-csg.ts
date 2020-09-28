import { createPolygonBlock } from './polygon';
import { createExtrudeLinearBlock } from './extrude-linear';
import { createRectangleBlock } from './rectangle';
import { creatCsgTransformBlock } from './csg-transform';
import { createPrimitiveSphereBlock } from './primitive-sphere';
import { createPrimitiveCubeBlock } from './primitive-cube';
import { createBooleanSubtractBlock } from './boolean-subtract';
import { createBooleanUnionBlock } from './boolean-union';
import { createBooleanIntersectBlock } from './boolean-intersect';

export function assembleCsgBlocks(): void {
    createPolygonBlock();
    createExtrudeLinearBlock();
    createRectangleBlock();
    creatCsgTransformBlock();
    createPrimitiveSphereBlock();
    createPrimitiveCubeBlock();
    createBooleanSubtractBlock();
    createBooleanUnionBlock();
    createBooleanIntersectBlock();
}
