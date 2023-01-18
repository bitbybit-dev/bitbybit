
import { OCCTIntersections } from './intersections';
import { OCCTWorkerManager } from '../../../../workers/occ/occ-worker-manager';

export class OCCTAdvanced {

    public readonly intersections: OCCTIntersections;

    constructor(
        occWorkerManager: OCCTWorkerManager
    ) {
        this.intersections = new OCCTIntersections(occWorkerManager);
    }

}
