import { createEllipseBlock } from './ellipse';
import { createEllipseArcBlock } from './ellipse-arc';
import { createEllipseCenterBlock } from './ellipse-center';
import { createEllipseMaxAngleBlock } from './ellipse-max-angle';
import { createEllipseMinAngleBlock } from './ellipse-min-angle';
import { createEllipseXAxisBlock } from './ellipse-x-axis';
import { createEllipseYAxisBlock } from './ellipse-y-axis';

export function assembleEllipseBlocks() {
    createEllipseBlock();
    createEllipseArcBlock();
    createEllipseCenterBlock();
    createEllipseXAxisBlock();
    createEllipseYAxisBlock();
    createEllipseMaxAngleBlock();
    createEllipseMinAngleBlock();
}
