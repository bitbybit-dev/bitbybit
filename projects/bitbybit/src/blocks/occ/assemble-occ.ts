import { createDrawShapeBlock } from './draw-shape';
import { createExtrudeBlock } from './extrude';
import { createFacesCreateCircleBlock } from './faces-create-circle';
import { createOffsetBlock } from './offset';
import { createBoxBlock } from './shapes-create-box';
import { createConeBlock } from './shapes-create-cone';
import { createCylinderBlock } from './shapes-create-cylinder';
import { createSphereBlock } from './shapes-create-sphere';
import { createWiresCreateBezierBlock } from './wires-create-bezier';
import { createWiresCreateBSplineBlock } from './wires-create-bspline';
import { createWiresCreateCircleBlock } from './wires-create-circle';

export function assembleOCCBlocks(): void {
    createBoxBlock();
    createDrawShapeBlock();
    createSphereBlock();
    createConeBlock();
    createCylinderBlock();
    createWiresCreateBSplineBlock();
    createWiresCreateBezierBlock();
    createWiresCreateCircleBlock();
    createFacesCreateCircleBlock();
    createOffsetBlock();
    createExtrudeBlock();
}