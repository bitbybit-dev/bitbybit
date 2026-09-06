import { BitbybitOcctModule } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { OCCTCompound } from "./compound";
import { OCCTVertex } from "./vertex";
import { OCCTEdge } from "./edge";
import { OCCTFace } from "./face";
import { OCCTShape } from "./shape";
import { OCCTShell } from "./shell";
import { OCCTSolid } from "./solid";
import { OCCTWire } from "./wire";

/**
 * Shape construction in OpenCascade, grouped by what you are building: vertices, edges, wires,
 * faces, shells, solids and compounds. The groups mirror the topological hierarchy, and a normal
 * modelling session climbs it - points become a wire, the wire becomes a face, the face is extruded
 * into a solid. Reach into the group for the kind you want rather than looking for one flat list.
 */
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
        occ: BitbybitOcctModule,
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
