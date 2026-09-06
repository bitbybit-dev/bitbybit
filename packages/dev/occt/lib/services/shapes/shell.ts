import { BitbybitOcctModule, TopoDS_Face, TopoDS_Shell } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import * as Inputs from "../../api/inputs";
import * as Models from "../../api/models";

export class OCCTShell {

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly och: OccHelper
    ) {
    }

    /**
     * Returns debug info about the shell: face/edge counts, total surface area and per-face surface
     * debug info (type, U/V degree, poles/knots, bounds, area, ...).
     * @param inputs shell
     * @returns Shell debug info
     * @group debug
     * @shortname shell debug info
     * @drawable false
     */
    debugInfo(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shell>): Models.OCCT.ShellDebugInfo {
        if (!inputs.shape || inputs.shape.IsNull()) {
            return { valid: false, nbFaces: 0, nbEdges: 0, area: 0, faces: [] };
        }
        const faces = this.och.shapeGettersService.getFaces({ shape: inputs.shape });
        const faceInfos = faces.map((f) => JSON.parse(this.occ.FaceDebugInfoJson(f)) as Models.OCCT.FaceDebugInfo);
        const edges = this.och.shapeGettersService.getEdges({ shape: inputs.shape });
        const area = faceInfos.reduce((sum, f) => sum + (f.area ?? 0), 0);
        return { valid: true, nbFaces: faces.length, nbEdges: edges.length, area, faces: faceInfos };
    }

    /**
     * Creates a shell from faces
     * @param inputs OpenCascade shell and faces
     * @returns OpenCascade shell
     * @group create
     * @shortname sew
     * @drawable true
     */
    sewFaces(inputs: Inputs.OCCT.SewDto<TopoDS_Face>): TopoDS_Shell {
        return this.och.shellsService.sewFaces(inputs);
    }

    isClosed(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shell>): boolean {
        return this.occ.BRep_Tool_IsClosed(inputs.shape);
    }

    /**
     * Get shell surface area
     * @param inputs shell shape
     * @returns Surface area
     * @group get
     * @shortname area
     * @drawable false
     */
    getShellSurfaceArea(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shell>): number {
        return this.och.shellsService.getShellSurfaceArea(inputs);
    }
}
