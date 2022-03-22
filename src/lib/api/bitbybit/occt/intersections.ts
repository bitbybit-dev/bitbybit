
import * as Inputs from '../../inputs/inputs';
import { OCCTWorkerManager } from '../../../workers/occ/occ-worker-manager';


export class OCCTIntersections {

    constructor(
        private readonly occWorkerManager: OCCTWorkerManager,
    ) {
    }

    /**
     * Computes the intersection curves between the two surfaces S1 and S2. Parameter Tol defines the precision of curves computation. For most cases the value 1.0e-7 is recommended to use. Warning Use the function IsDone to verify that the intersections are successfully computed.
     * <div>
     *  <img src="../assets/images/blockly-images/occt/booleans/intersectSurfaceSurface.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_intersections.OCCTIntersections.html#intersectSurfaceSurface
     * @param inputs Two surface shapes to intersect
     * @returns OpenCascade intersection curves
     */
    // intersectSurfaceSurface(inputs: Inputs.OCCT.ShapesDto): Promise<any> {
    //     return this.occWorkerManager.genericCallToWorkerPromise('intersectSurfaceSurface', inputs);
    // }

}
