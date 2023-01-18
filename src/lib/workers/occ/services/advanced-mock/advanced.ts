import { OpenCascadeInstance } from 'opencascade.js';
import { OccHelper } from '../../occ-helper';
import { OCCTIntersections } from './intersections';

export class OCCTAdvanced {
    public readonly intersections: OCCTIntersections;

    constructor(
        occ: OpenCascadeInstance,
        och: OccHelper
    ) {
        this.intersections = new OCCTIntersections(occ, och);
    }

}
