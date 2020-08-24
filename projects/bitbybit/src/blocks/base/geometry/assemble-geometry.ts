import { assembleLineBlocks } from './line/assemble-line';
import { assemblePointBlocks } from './point/assemble-point';
import { assemblePolylineBlocks } from './polyline/assemble-polyline';
import { assembleTagBlocks } from './tag/assemble-tag';

export function assembleGeometryBlocks() {
    assemblePointBlocks();
    assemblePolylineBlocks();
    assembleLineBlocks();
    assembleTagBlocks();
}
