import { OpenCascadeInstance } from '../../../../../bitbybit-dev-occt/bitbybit-dev-occt';
import { OccHelper } from '../../occ-helper';
import { OCCTCurves } from './curves';
import { OCCTSurfaces } from './surfaces';

export class OCCTGeom {
    
    public readonly curves: OCCTCurves;
    public readonly surfaces: OCCTSurfaces;

    constructor(
        occ: OpenCascadeInstance,
        och: OccHelper
    ) {
        this.curves = new OCCTCurves(occ, och);
        this.surfaces = new OCCTSurfaces(occ, och);
    }

}
