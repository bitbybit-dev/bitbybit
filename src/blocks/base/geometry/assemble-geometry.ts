import { assemblePointBlocks } from './point/assemble-point';
import { assemblePolylineBlocks } from './polyline/assemble-polyline';
import { assembleLineBlocks } from './line/assemble-line';

export function assembleGeometryBlocks() {
    assemblePointBlocks();
    assemblePolylineBlocks();
    assembleLineBlocks();
}