import { BitbybitOcctModule, TopoDS_Face } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import * as Inputs from "../../api/inputs";

export class OCCTSurfaces {

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly och: OccHelper
    ) {
    }

    /**
     * Creates an infinite cylindrical surface that can not be drawn. Be sure to use this geometry only for constructive purposes of modeling, but not for representation.
     * @param inputs Cylinder parameters
     * @returns OpenCascade cylindrical surface
     * @group surfaces
     * @shortname cylindrical
     * @drawable false
     */
    cylindricalSurface(inputs: Inputs.OCCT.GeomCylindricalSurfaceDto) {
        const ax = this.och.entitiesService.gpAx3_4(inputs.center, inputs.direction);
        const res = new this.occ.Geom_CylindricalSurface(ax, inputs.radius);
        ax.delete();
        return res;
    }

    /**
     * Creates a surface from the face
     * @param inputs Face shape
     * @returns OpenCascade geom surface
     * @group surfaces
     * @shortname from face
     * @drawable false
     */
    surfaceFromFace(inputs: Inputs.OCCT.ShapeDto<TopoDS_Face>) {
        return this.och.surfaceFromFace(inputs);
    }

}
