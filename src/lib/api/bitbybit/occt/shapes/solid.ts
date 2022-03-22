
import * as Inputs from '../../../inputs/inputs';
import { OCCTWorkerManager } from '../../../../workers/occ/occ-worker-manager';
import { Angle } from '@babylonjs/core';


export class OCCTSolid {

    constructor(
        private readonly occWorkerManager: OCCTWorkerManager,
    ) {
    }

    /**
     * Creates OpenCascade Box
     * <div>
     *  <img src="../assets/images/blockly-images/occt/shapes/solid/createBox.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_solid.OCCTSolid.html#createBox
     * @param inputs Box size and center
     * @returns OpenCascade Box
     */
    createBox(inputs: Inputs.OCCT.BoxDto): Promise<any> {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.solid.createBox', inputs);
    }

    /**
     * Creates OpenCascade Cylinder
     * <div>
     *  <img src="../assets/images/blockly-images/occt/shapes/solid/createCylinder.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_solid.OCCTSolid.html#createCylinder
     * @param inputs Cylinder parameters
     * @returns OpenCascade Cylinder
     */
    createCylinder(inputs: Inputs.OCCT.CylinderDto): Promise<any> {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.solid.createCylinder', inputs);
    }

    /**
     * Creates OpenCascade Cylinders on simple bit by bit lines represented by two points
     * <div>
     *  <img src="../assets/images/blockly-images/occt/shapes/solid/createCylindersOnLines.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_solid.OCCTSolid.html#createCylindersOnLines
     * @param inputs Cylinder parameters
     * @returns OpenCascade Cylinder
     */
    createCylindersOnLines(inputs: Inputs.OCCT.CylindersOnLinesDto): Promise<any[]> {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.solid.createCylindersOnLines', inputs);
    }

    /**
     * Creates OpenCascade Sphere
     * <div>
     *  <img src="../assets/images/blockly-images/occt/shapes/solid/createSphere.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_solid.OCCTSolid.html#createSphere
     * @param inputs Sphere radius and center
     * @returns OpenCascade Sphere
     */
    createSphere(inputs: Inputs.OCCT.SphereDto): Promise<any> {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.solid.createSphere', inputs);
    }

    /**
     * Creates OpenCascade Cone
     * <div>
     *  <img src="../assets/images/blockly-images/occt/shapes/solid/createCone.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_solid.OCCTSolid.html#createCone
     * @param inputs Cone parameters
     * @returns OpenCascade cone shape
     */
    createCone(inputs: Inputs.OCCT.ConeDto): Promise<any> {
        inputs.angle = Angle.FromDegrees(inputs.angle).radians()
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.solid.createCone', inputs);
    }

    // basicDifferenceTest(inputs: any): Promise<any> {
    //     return this.occWorkerManager.genericCallToWorkerPromise('basicDifferenceTest', inputs);
    // }
}
