
import { OCCTCompound } from "./compound";
import { OCCTEdge } from "./edge";
import { OCCTFace } from "./face";
import { OCCTSolid } from "./solid";
import { OCCTWire } from "./wire";
import { OCCTWorkerManager } from "../../../occ-worker/occ-worker-manager";
import { OCCTShell } from "./shell";
import { OCCTShape } from "./shape";
import { OCCTVertex } from "./vertex";

export class OCCTShapes {
    public readonly vertex: OCCTVertex;
    public readonly edge: OCCTEdge;
    public readonly wire: OCCTWire;
    public readonly face: OCCTFace;
    public readonly shell: OCCTShell;
    public readonly solid: OCCTSolid;
    public readonly compound: OCCTCompound;
    public readonly shape: OCCTShape;

    constructor(
        occWorkerManager: OCCTWorkerManager
    ) {
        this.vertex = new OCCTVertex(occWorkerManager);
        this.edge = new OCCTEdge(occWorkerManager);
        this.wire = new OCCTWire(occWorkerManager);
        this.face = new OCCTFace(occWorkerManager);
        this.shell = new OCCTShell(occWorkerManager);
        this.solid = new OCCTSolid(occWorkerManager);
        this.compound = new OCCTCompound(occWorkerManager);
        this.shape = new OCCTShape(occWorkerManager);
    }

}
