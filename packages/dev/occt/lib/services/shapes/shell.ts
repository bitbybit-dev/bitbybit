import { BitbybitOcctModule, TopoDS_Face, TopoDS_Shell } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import * as Inputs from "../../api/inputs";

export class OCCTShell {

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly och: OccHelper
    ) {
    }

    sewFaces(inputs: Inputs.OCCT.SewDto<TopoDS_Face>): TopoDS_Shell {
        return this.och.shellsService.sewFaces(inputs);
    }

    isClosed(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shell>): boolean {
        return this.occ.BRep_Tool_IsClosed(inputs.shape);
    }

    getShellSurfaceArea(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shell>): number {
        return this.och.shellsService.getShellSurfaceArea(inputs);
    }
}
