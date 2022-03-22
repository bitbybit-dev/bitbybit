
import * as Inputs from '../../inputs/inputs';
import { OCCTWorkerManager } from '../../../workers/occ/occ-worker-manager';


export class OCCTOperations {

    constructor(
        private readonly occWorkerManager: OCCTWorkerManager,
    ) {
    }

    /**
     * Lofts wires into a shell
     * <div>
     *  <img src="../assets/images/blockly-images/occt/operations/loft.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_operations.OCCTOperations.html#loft
     * @param inputs Circle parameters
     * @returns Resulting loft shell
     */
    loft(inputs: Inputs.OCCT.LoftDto): Promise<any> {
        return this.occWorkerManager.genericCallToWorkerPromise('operations.loft', inputs);
    }

    /**
     * Offset for various shapes
     * <div>
     *  <img src="../assets/images/blockly-images/occt/operations/offset.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_operations.OCCTOperations.html#offset
     * @param inputs Shape to offset and distance with tolerance
     * @returns Resulting offset shape
     */
    offset(inputs: Inputs.OCCT.OffsetDto): Promise<any> {
        return this.occWorkerManager.genericCallToWorkerPromise('operations.offset', inputs);
    }

    /**
     * Extrudes the face along direction
     * <div>
     *  <img src="../assets/images/blockly-images/occt/operations/extrude.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_operations.OCCTOperations.html#extrude
     * @param inputs Shape to extrude and direction parameter with tolerance
     * @returns Resulting extruded shape
     */
    extrude(inputs: Inputs.OCCT.ExtrudeDto): Promise<any> {
        return this.occWorkerManager.genericCallToWorkerPromise('operations.extrude', inputs);
    }

    /**
     * Revolves the shape around the given direction
     * <div>
     *  <img src="../assets/images/blockly-images/occt/operations/revolve.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_operations.OCCTOperations.html#revolve
     * @param inputs Revolve parameters
     * @returns Resulting revolved shape
     */
    revolve(inputs: Inputs.OCCT.RevolveDto): Promise<any> {
        return this.occWorkerManager.genericCallToWorkerPromise('operations.revolve', inputs);
    }

    /**
     * Rotated extrude that is perofrmed on the wire shape
     * <div>
     *  <img src="../assets/images/blockly-images/occt/operations/rotatedExtrude.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_operations.OCCTOperations.html#rotatedExtrude
     * @param inputs Rotated extrusion inputs
     * @returns OpenCascade shape
     */
    rotatedExtrude(inputs: Inputs.OCCT.RotationExtrudeDto): Promise<any> {
        return this.occWorkerManager.genericCallToWorkerPromise('operations.rotatedExtrude', inputs);
    }

    /**
     * Pipe shapes along the wire
     * <div>
     *  <img src="../assets/images/blockly-images/occt/operations/pipe.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_operations.OCCTOperations.html#pipe
     * @param inputs Path wire and shapes along the path
     * @returns OpenCascade shape
     */
    pipe(inputs: Inputs.OCCT.ShapeShapesDto): Promise<any> {
        return this.occWorkerManager.genericCallToWorkerPromise('operations.pipe', inputs);
    }

    /**
     * Thickens the shape into a solid by an offset distance
     * <div>
     *  <img src="../assets/images/blockly-images/occt/operations/makeThickSolidSimple.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_operations.OCCTOperations.html#makeThickSolidSimple
     * @param inputs OpenCascade shape
     * @returns OpenCascade solid shape
     */
    makeThickSolidSimple(inputs: Inputs.OCCT.ThisckSolidSimpleDto): Promise<any> {
        return this.occWorkerManager.genericCallToWorkerPromise('operations.makeThickSolidSimple', inputs);
    }

    /**
     * Thickens the shape into a solid by joining
     * <div>
     *  <img src="../assets/images/blockly-images/occt/operations/makeThickSolidByJoin.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_operations.OCCTOperations.html#makeThickSolidByJoin
     * @param inputs OpenCascade shape and options for thickening
     * @returns OpenCascade solid shape
     */
    makeThickSolidByJoin(inputs: Inputs.OCCT.ThickSolidByJoinDto): Promise<any> {
        return this.occWorkerManager.genericCallToWorkerPromise('operations.makeThickSolidByJoin', inputs);
    }
}
