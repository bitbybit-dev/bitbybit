
import { OCCTCompound } from './compound';
import { OCCTEdge } from './edge';
import { OCCTFace } from './face';
import { OCCTSolid } from './solid';
import { OCCTWire } from './wire';
import { OCCTWorkerManager } from '../../../../workers/occ/occ-worker-manager';

export class OCCTShapes {
    public readonly edge: OCCTEdge;
    public readonly wire: OCCTWire;
    public readonly face: OCCTFace;
    public readonly solid: OCCTSolid;
    public readonly compound: OCCTCompound;
    constructor(
        occWorkerManager: OCCTWorkerManager
    ) {
        this.edge = new OCCTEdge(occWorkerManager);
        this.wire = new OCCTWire(occWorkerManager);
        this.face = new OCCTFace(occWorkerManager);
        this.solid = new OCCTSolid(occWorkerManager);
        this.compound = new OCCTCompound(occWorkerManager);
    }

}
