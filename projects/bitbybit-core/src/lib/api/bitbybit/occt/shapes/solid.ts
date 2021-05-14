import { Injectable } from '@angular/core';
import * as Inputs from '../../../inputs/inputs';
import { OCCTWorkerManager } from '../../../../workers/occ/occ-worker-manager';

@Injectable()
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
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_solid.occtsolid.html#createbox
     * @param inputs Box size and center
     * @returns OpenCascade Box
     */
    createBox(inputs: Inputs.OCCT.BoxDto): Promise<any> {
        return this.occWorkerManager.genericCallToWorkerPromise('createBox', inputs);
    }

    /**
     * Creates OpenCascade Cylinder
     * <div>
     *  <img src="../assets/images/blockly-images/occt/shapes/solid/createCylinder.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_solid.occtsolid.html#createcylinder
     * @param inputs Cylinder parameters
     * @returns OpenCascade Cylinder
     */
    createCylinder(inputs: Inputs.OCCT.CylinderDto): Promise<any> {
        return this.occWorkerManager.genericCallToWorkerPromise('createCylinder', inputs);
    }

    /**
     * Creates OpenCascade Sphere
     * <div>
     *  <img src="../assets/images/blockly-images/occt/shapes/solid/createSphere.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_solid.occtsolid.html#createsphere
     * @param inputs Sphere radius and center
     * @returns OpenCascade Sphere
     */
    createSphere(inputs: Inputs.OCCT.SphereDto): Promise<any> {
        return this.occWorkerManager.genericCallToWorkerPromise('createSphere', inputs);
    }

    /**
     * Creates OpenCascade Cone
     * <div>
     *  <img src="../assets/images/blockly-images/occt/shapes/solid/createCone.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_solid.occtsolid.html#createcone
     * @param inputs Cone parameters
     * @returns OpenCascade cone shape
     */
    createCone(inputs: Inputs.OCCT.ConeDto): Promise<any> {
        return this.occWorkerManager.genericCallToWorkerPromise('createCone', inputs);
    }

    // basicDifferenceTest(inputs: any): Promise<any> {
    //     return this.occWorkerManager.genericCallToWorkerPromise('basicDifferenceTest', inputs);
    // }
}
