import { BitbybitOcctModule } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { OCCTAnalysisCurves } from "./curves";
import { OCCTAnalysisSurfaces } from "./surfaces";
import { OCCTAnalysisMeasure } from "./measure";
import { OCCTAnalysisClashes } from "./clashes";

/**
 * Questions asked of OpenCascade shapes, answered with points, numbers and index lists rather than
 * new shapes. `curves` reads edges and wires, `surfaces` reads faces, `measure` measures boxes,
 * distances, angles and radii, and `clashes` finds shapes and faces that overlap or come too close.
 * The shapes themselves are left as they are.
 */
export class OCCTAnalysis {
    public readonly curves: OCCTAnalysisCurves;
    public readonly surfaces: OCCTAnalysisSurfaces;
    public readonly measure: OCCTAnalysisMeasure;
    public readonly clashes: OCCTAnalysisClashes;

    constructor(
        occ: BitbybitOcctModule,
        och: OccHelper,
    ) {
        this.curves = new OCCTAnalysisCurves(occ, och);
        this.surfaces = new OCCTAnalysisSurfaces(occ, och);
        this.measure = new OCCTAnalysisMeasure(occ, och);
        this.clashes = new OCCTAnalysisClashes(occ, och);
    }
}
