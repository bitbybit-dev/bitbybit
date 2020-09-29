import { createPrimitive2dPolygonBlock } from './primitive-2d-polygon';
import { createExtrudeLinearBlock } from './extrude-linear';
import { createPrimitive2dRectangleBlock } from './primitive-2d-rectangle';
import { createCsgTransformBlock } from './csg-transform';
import { createPrimitiveSphereBlock } from './primitive-sphere';
import { createPrimitiveCubeBlock } from './primitive-cube';
import { createBooleanSubtractBlock } from './boolean-subtract';
import { createBooleanUnionBlock } from './boolean-union';
import { createBooleanIntersectBlock } from './boolean-intersect';
import { createCsgColourBlock } from './csg-colour';
import { createPrimitiveCuboidBlock } from './primitive-cuboid';
import { createBooleanIntersectObjectsBlock } from './boolean-intersect-objects';
import { createBooleanUnionObjectsBlock } from './boolean-union-objects';
import { createBooleanSubtractObjectsBlock } from './boolean-subtract-objects';

export function assembleCsgBlocks(): void {
    createPrimitive2dPolygonBlock();
    createPrimitive2dRectangleBlock();
    createExtrudeLinearBlock();
    createPrimitiveSphereBlock();
    createPrimitiveCubeBlock();
    createBooleanSubtractBlock();
    createBooleanSubtractObjectsBlock();
    createBooleanUnionBlock();
    createBooleanUnionObjectsBlock();
    createBooleanIntersectBlock();
    createBooleanIntersectObjectsBlock();
    createCsgTransformBlock();
    createCsgColourBlock();
    createPrimitiveCuboidBlock();
}
