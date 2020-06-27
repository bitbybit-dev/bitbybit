import { createShapesArcBlock } from './arc';
import { createShapesCircleBlock } from './circle';
import { createCircleCenterBlock } from './circle-center';
import { createCircleMaxAngleBlock } from './circle-max-angle';
import { createCircleMinAngleBlock } from './circle-min-angle';
import { createCircleRadiusBlock } from './circle-radius';
import { createCircleXAxisBlock } from './circle-x-axis';
import { createCircleYAxisBlock } from './circle-y-axis';

export function assembleShapesBlocks() {
    createShapesCircleBlock();
    createShapesArcBlock();
    createCircleCenterBlock();
    createCircleRadiusBlock();
    createCircleXAxisBlock();
    createCircleYAxisBlock();
    createCircleMaxAngleBlock();
    createCircleMinAngleBlock();
}
