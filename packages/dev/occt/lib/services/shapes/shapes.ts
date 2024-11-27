import { OpenCascadeInstance } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { OCCTCompound } from "./compound";
import { OCCTVertex } from "./vertex";
import { OCCTEdge } from "./edge";
import { OCCTFace } from "./face";
import { OCCTShape } from "./shape";
import { OCCTShell } from "./shell";
import { OCCTSolid } from "./solid";
import { OCCTWire } from "./wire";

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
        occ: OpenCascadeInstance,
        och: OccHelper,
    ) {
        this.vertex = new OCCTVertex(occ, och);
        this.edge = new OCCTEdge(occ, och);
        this.wire = new OCCTWire(occ, och);
        this.face = new OCCTFace(occ, och);
        this.shell = new OCCTShell(occ, och);
        this.solid = new OCCTSolid(occ, och);
        this.compound = new OCCTCompound(occ, och);
        this.shape = new OCCTShape(occ, och);
    }

}
