import { BitbybitOcctModule, TopoDS_Face } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import * as Inputs from "../../api/inputs";

export class OCCTSurfaces {

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly och: OccHelper
    ) {
    }

    cylindricalSurface(inputs: Inputs.OCCT.GeomCylindricalSurfaceDto) {
        const ax = this.och.entitiesService.gpAx3_4(inputs.center, inputs.direction);
        const res = new this.occ.Geom_CylindricalSurface(ax, inputs.radius);
        ax.delete();
        return res;
    }

    surfaceFromFace(inputs: Inputs.OCCT.ShapeDto<TopoDS_Face>) {
        return this.och.surfaceFromFace(inputs);
    }

}
