import { OpenCascadeInstance, TopoDS_Shape } from 'opencascade.js';
import { OccHelper } from '../../occ-helper';
import * as Inputs from '../../../../api/inputs/inputs';

export class OCCTSurfaces {

    constructor(
        private readonly occ: OpenCascadeInstance,
        private readonly och: OccHelper
    ) {
    }

    cylindricalSurface(inputs: Inputs.OCCT.GeomCylindricalSurfaceDto) {
        const ax = this.och.gpAx3(inputs.center, inputs.direction);
        return new this.occ.Geom_CylindricalSurface_1(ax, inputs.radius);
    }

    surfaceFromFace(inputs: Inputs.OCCT.ShapeDto) {
        const face = inputs.shape as TopoDS_Shape;
        const surface = this.occ.BRep_Tool.Surface_2(face);
        return surface.get();
    }

}