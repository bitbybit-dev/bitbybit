
import * as Inputs from '../../../inputs/inputs';
import { OCCTWorkerManager } from '../../../../workers/occ/occ-worker-manager';


export class OCCTSurfaces {

    constructor(
        private readonly occWorkerManager: OCCTWorkerManager,
    ) {
    }

    /**
     * Creates an infinite cylindrical surface that can not be drawn. Be sure to use this geometry only for constructive purposes of modeling, but not for representation.
     * <div>
     *  <img src="../assets/images/blockly-images/occt/geom/surfaces/cylindricalSurface.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_geom_surfaces.OCCTSurfaces.html#cylindricalSurface
     * @param inputs Cylinder parameters
     * @returns OpenCascade cylindrical surface
     */
    cylindricalSurface(inputs: Inputs.OCCT.GeomCylindricalSurfaceDto): Promise<Inputs.OCCT.GeomSurfacePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise('geom.surfaces.cylindricalSurface', inputs);
    }

    /**
     * Creates a surface from the face
     * <div>
     *  <img src="../assets/images/blockly-images/occt/geom/surfaces/surfaceFromFace.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_geom_surfaces.OCCTSurfaces.html#surfaceFromFace
     * @param inputs Face shape
     * @returns OpenCascade geom surface
     */
    surfaceFromFace(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.OCCT.GeomSurfacePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise('geom.surfaces.surfaceFromFace', inputs);
    }

}