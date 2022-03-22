import { OpenCascadeInstance } from 'opencascade.js';
import { OccHelper } from '../../occ-helper';
import { OCCTCompound } from './compound';
import { OCCTEdge } from './edge';
import { OCCTFace } from './face';
import { OCCTSolid } from './solid';
import { OCCTWire } from './wire';

export class OCCTShapes {
    public readonly edge: OCCTEdge;
    public readonly wire: OCCTWire;
    public readonly face: OCCTFace;
    public readonly solid: OCCTSolid;
    public readonly compound: OCCTCompound;
    
    constructor(
        occ: OpenCascadeInstance,
        och: OccHelper
    ) {
        this.edge = new OCCTEdge(occ, och);
        this.wire = new OCCTWire(occ, och);
        this.face = new OCCTFace(occ, och);
        this.solid = new OCCTSolid(occ, och);
        this.compound = new OCCTCompound(occ, och);
    }

}
