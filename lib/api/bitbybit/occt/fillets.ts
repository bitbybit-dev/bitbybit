import * as Inputs from '../../inputs/inputs';
import { OCCTWorkerManager } from '../../../workers/occ/occ-worker-manager';


export class OCCTFillets {

    constructor(
        private readonly occWorkerManager: OCCTWorkerManager,
    ) {
    }
    /**
    * Fillets OpenCascade Shapes
    * <div>
    *  <img src="../assets/images/blockly-images/occt/shapes/edge/filletEdges.svg" alt="Blockly Image"/>
    * </div>
    * @link https://docs.bitbybit.dev/classes/bitbybit_occt_fillets.OCCTFillets.html#filletEdges
    * @param inputs Shape, radius and edge indexes to fillet
    * @returns OpenCascade shape with filleted edges
    */
    filletEdges(inputs: Inputs.OCCT.FilletDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise('fillets.filletEdges', inputs);
    }

    /**
     * Chamfer OpenCascade Shape edges
     * <div>
     *  <img src="../assets/images/blockly-images/occt/shapes/edge/chamferEdges.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_fillets.OCCTFillets.html#chamferEdges
     * @param inputs Shape, distance and edge indexes to chamfer
     * @returns OpenCascade shape with chamfered edges
     */
    chamferEdges(inputs: Inputs.OCCT.ChamferDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise('fillets.chamferEdges', inputs);
    }


    /**
     * Fillets 2d wires or faces
     * <div>
     *  <img src="../assets/images/blockly-images/occt/fillets/fillet2d.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_fillets.OCCTFillets.html#fillet2d
     * @param inputs Shape
     * @returns OpenCascade filleted shape result
     */
    fillet2d(inputs: Inputs.OCCT.FilletDto<Inputs.OCCT.TopoDSWirePointer | Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.OCCT.TopoDSWirePointer | Inputs.OCCT.TopoDSFacePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise('fillets.fillet2d', inputs);
    }

    /**
     * Fillets two planar edges into a wire by providing a radius, plane, edges and possible solution index if more than one result exists
     * <div>
     *  <img src="../assets/images/blockly-images/occt/fillets/filletTwoEdgesInPlaneIntoAWire.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_fillets.OCCTFillets.html#filletTwoEdgesInPlaneIntoAWire
     * @param inputs Definition for fillets
     * @returns OpenCascade wire shape if solution is found
     */
    filletTwoEdgesInPlaneIntoAWire(inputs: Inputs.OCCT.FilletTwoEdgesInPlaneDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.OCCT.TopoDSWirePointer> {
        inputs.shapes = [inputs.edge1, inputs.edge2];
        return this.occWorkerManager.genericCallToWorkerPromise('fillets.filletTwoEdgesInPlaneIntoAWire', inputs);

    }
}
