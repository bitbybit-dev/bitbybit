import { BitbybitOcctModule } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { OCCTCurves } from "./curves";
import { OCCTSurfaces } from "./surfaces";

/**
 * The geometric layer beneath the topology: the mathematical curves and surfaces themselves,
 * separate from the edges and faces that carry them. `curves` builds 2D curves for constructions in
 * UV space and evaluates them; `surfaces` builds infinite surfaces and extracts the surface a face
 * lies on. These objects cannot be drawn directly: wrap them into edges and faces with
 * `shapes.edge` and `shapes.face` first.
 */
export class OCCTGeom {
    
    public readonly curves: OCCTCurves;
    public readonly surfaces: OCCTSurfaces;

    constructor(
        occ: BitbybitOcctModule,
        och: OccHelper
    ) {
        this.curves = new OCCTCurves(occ, och);
        this.surfaces = new OCCTSurfaces(occ, och);
    }

}
