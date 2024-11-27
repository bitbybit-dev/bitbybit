
import { Inputs } from "@bitbybit-dev/occt";
import { OCCTWorkerManager } from "../../../occ-worker/occ-worker-manager";

export class OCCTSurfaces {

    constructor(
        private readonly occWorkerManager: OCCTWorkerManager,
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
    cylindricalSurface(inputs: Inputs.OCCT.GeomCylindricalSurfaceDto): Promise<Inputs.OCCT.GeomSurfacePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("geom.surfaces.cylindricalSurface", inputs);
    }

    /**
     * Creates a surface from the face
     * @param inputs Face shape
     * @returns OpenCascade geom surface
     * @group surfaces
     * @shortname from face
     * @drawable false
     */
    surfaceFromFace(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.OCCT.GeomSurfacePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("geom.surfaces.surfaceFromFace", inputs);
    }

}