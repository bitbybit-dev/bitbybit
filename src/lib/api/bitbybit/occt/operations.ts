
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
     * @param inputs Loft wires
     * @returns Resulting loft shape
     */
    loft(inputs: Inputs.OCCT.LoftDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.OCCT.TopoDSShapePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise('operations.loft', inputs);
    }

    /**
     * Lofts wires into a shell by using many advanced options
     * <div>
     *  <img src="../assets/images/blockly-images/occt/operations/loftAdvanced.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_operations.OCCTOperations.html#loftAdvanced
     * @param inputs Advanced loft parameters
     * @returns Resulting loft shell
     */
    loftAdvanced(inputs: Inputs.OCCT.LoftAdvancedDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.OCCT.TopoDSShapePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise('operations.loftAdvanced', inputs);
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
    offset(inputs: Inputs.OCCT.OffsetDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer> {
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
    extrude(inputs: Inputs.OCCT.ExtrudeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise('operations.extrude', inputs);
    }

    /**
     * Extrudes the shapes along direction
     * <div>
     *  <img src="../assets/images/blockly-images/occt/operations/extrudeShapes.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_operations.OCCTOperations.html#extrudeShapes
     * @param inputs Shapes to extrude and direction parameter with tolerance
     * @returns Resulting extruded shapes
     */
    extrudeShapes(inputs: Inputs.OCCT.ExtrudeShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise('operations.extrudeShapes', inputs);
    }

    /**
     * Splits the face with edges
     * <div>
     *  <img src="../assets/images/blockly-images/occt/operations/splitShapeWithShapes.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_operations.OCCTOperations.html#splitShapeWithShapes
     * @param inputs Face to split and edges to split with
     * @returns Resulting split shape
     */
    splitShapeWithShapes(inputs: Inputs.OCCT.SplitDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise('operations.splitShapeWithShapes', inputs);
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
    revolve(inputs: Inputs.OCCT.RevolveDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise('operations.revolve', inputs);
    }

    /**
     * Rotated extrude that is perofrmed on the shape
     * <div>
     *  <img src="../assets/images/blockly-images/occt/operations/rotatedExtrude.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_operations.OCCTOperations.html#rotatedExtrude
     * @param inputs Rotated extrusion inputs
     * @returns OpenCascade shape
     */
    rotatedExtrude(inputs: Inputs.OCCT.RotationExtrudeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer> {
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
    pipe(inputs: Inputs.OCCT.ShapeShapesDto<Inputs.OCCT.TopoDSWirePointer, Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer> {
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
    makeThickSolidSimple(inputs: Inputs.OCCT.ThisckSolidSimpleDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer> {
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
    makeThickSolidByJoin(inputs: Inputs.OCCT.ThickSolidByJoinDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise('operations.makeThickSolidByJoin', inputs);
    }
}
