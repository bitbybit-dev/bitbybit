import { assembleLineBlocks } from './line/assemble-line';
import { assemblePointBlocks } from './point/assemble-point';
import { assemblePolylineBlocks } from './polyline/assemble-polyline';

export function assembleGeometryBlocks() {
    assemblePointBlocks();
    assemblePolylineBlocks();
    assembleLineBlocks();
}
