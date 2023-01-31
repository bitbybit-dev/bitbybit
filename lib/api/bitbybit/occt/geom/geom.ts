
import { OCCTCurves } from './curves';
import { OCCTSurfaces } from './surfaces';
import { OCCTWorkerManager } from '../../../../workers/occ/occ-worker-manager';

export class OCCTGeom {

    public readonly curves: OCCTCurves;
    public readonly surfaces: OCCTSurfaces;

    constructor(
        occWorkerManager: OCCTWorkerManager
    ) {
        this.curves = new OCCTCurves(occWorkerManager);
        this.surfaces = new OCCTSurfaces(occWorkerManager);
    }

}
