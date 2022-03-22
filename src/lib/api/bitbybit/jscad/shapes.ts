
import { JSCADWorkerManager } from '../../../workers/jscad/jscad-worker-manager';
import * as Inputs from '../../inputs/inputs';

/**
 * Contains various functions for solid 3D shapes from JSCAD library https://github.com/jscad/OpenJSCAD.org
 * Thanks JSCAD community for developing this kernel
 */

export class JSCADShapes {

    constructor(
        private readonly jscadWorkerManager: JSCADWorkerManager,

    ) { }

    /**
     * Create a 3D cube shape
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/shapes/cube.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_shapes.JSCADShapes.html#cube
     * @param inputs Cube parameters
     * @returns Cube solid
     */
    async cube(inputs: Inputs.JSCAD.CubeDto): Promise<any> {
        return this.jscadWorkerManager.genericCallToWorkerPromise('shapes.cube', inputs);
    }

    /**
     * Create a 3D cubes on multiple center points
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/shapes/cubesOnCenterPoints.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_shapes.JSCADShapes.html#cubesOnCenterPoints
     * @param inputs Cube with multiple center points parameters
     * @returns List of cube solids
     */
    async cubesOnCenterPoints(inputs: Inputs.JSCAD.CubeCentersDto): Promise<any[]> {
        return this.jscadWorkerManager.genericCallToWorkerPromise('shapes.cubesOnCenterPoints', inputs);
    }

    /**
     * Create a 3D cuboid shape
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/shapes/cuboid.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_shapes.JSCADShapes.html#cuboid
     * @param inputs Cuboid parameters
     * @returns Cuboid solid
     */
    async cuboid(inputs: Inputs.JSCAD.CuboidDto): Promise<any> {
        return this.jscadWorkerManager.genericCallToWorkerPromise('shapes.cuboid', inputs);
    }

    /**
     * Create a 3D cuboids on multiple center points
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/shapes/cuboidsOnCenterPoints.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_shapes.JSCADShapes.html#cuboidsOnCenterPoints
     * @param inputs Cuboids with multiple center point parameters
     * @returns List of cuboid solids
     */
    async cuboidsOnCenterPoints(inputs: Inputs.JSCAD.CuboidCentersDto): Promise<any[]> {
        return this.jscadWorkerManager.genericCallToWorkerPromise('shapes.cuboidsOnCenterPoints', inputs);
    }

    /**
     * Create a 3D elliptic cylinder solid
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/shapes/cylinderElliptic.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_shapes.JSCADShapes.html#cylinderElliptic
     * @param inputs Elliptic cylinder parameters
     * @returns Elliptic cylinder solid
     */
    async cylinderElliptic(inputs: Inputs.JSCAD.CylidnerEllipticDto): Promise<any> {
        return this.jscadWorkerManager.genericCallToWorkerPromise('shapes.cylinderElliptic', inputs);
    }

    /**
     * Create a 3D elliptic cylinders on multiple center points
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/shapes/cylinderEllipticOnCenterPoints.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_shapes.JSCADShapes.html#cylinderEllipticOnCenterPoints
     * @param inputs Elliptic cylinders with multiple center point parameters
     * @returns List of elliptic cylinders solids
     */
    async cylinderEllipticOnCenterPoints(inputs: Inputs.JSCAD.CylidnerCentersEllipticDto): Promise<any[]> {
        return this.jscadWorkerManager.genericCallToWorkerPromise('shapes.cylinderEllipticOnCenterPoints', inputs);
    }

    /**
     * Create a 3D cylinder solid
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/shapes/cylinder.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_shapes.JSCADShapes.html#cylinder
     * @param inputs Cylinder parameters
     * @returns Cylinder solid
     */
     async cylinder(inputs: Inputs.JSCAD.CylidnerDto): Promise<any> {
        return this.jscadWorkerManager.genericCallToWorkerPromise('shapes.cylinder', inputs);
    }

    /**
     * Create a 3D cylinders on multiple center points
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/shapes/cylindersOnCenterPoints.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_shapes.JSCADShapes.html#cylindersOnCenterPoints
     * @param inputs Cylinders with multiple center point parameters
     * @returns List of cylinder solids
     */
     async cylindersOnCenterPoints(inputs: Inputs.JSCAD.CylidnerCentersDto): Promise<any[]> {
        return this.jscadWorkerManager.genericCallToWorkerPromise('shapes.cylindersOnCenterPoints', inputs);
    }

    /**
     * Create a 3D ellipsoid solid
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/shapes/ellipsoid.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_shapes.JSCADShapes.html#ellipsoid
     * @param inputs Ellipsoid parameters
     * @returns Ellipsoid solid
     */
     async ellipsoid(inputs: Inputs.JSCAD.EllipsoidDto): Promise<any> {
        return this.jscadWorkerManager.genericCallToWorkerPromise('shapes.ellipsoid', inputs);
    }

    /**
     * Create a 3D ellipsoids on multiple center points
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/shapes/ellipsoidsOnCenterPoints.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_shapes.JSCADShapes.html#ellipsoidsOnCenterPoints
     * @param inputs Ellipsoid parameters with multiple center points
     * @returns List of ellipsoid solids
     */
     async ellipsoidsOnCenterPoints(inputs: Inputs.JSCAD.EllipsoidCentersDto): Promise<any[]> {
        return this.jscadWorkerManager.genericCallToWorkerPromise('shapes.ellipsoidsOnCenterPoints', inputs);
    }

    /**
     * Create a 3D geodesic sphere solid
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/shapes/geodesicSphere.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_shapes.JSCADShapes.html#geodesicSphere
     * @param inputs Geodesic sphere parameters
     * @returns Geodesic sphere solid
     */
     async geodesicSphere(inputs: Inputs.JSCAD.GeodesicSphereDto): Promise<any> {
        return this.jscadWorkerManager.genericCallToWorkerPromise('shapes.geodesicSphere', inputs);
    }

    /**
     * Create a 3D geodesic spheres on multiple center points
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/shapes/geodesicSpheresOnCenterPoints.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_shapes.JSCADShapes.html#geodesicSpheresOnCenterPoints
     * @param inputs Geodesic sphere parameters with multiple center points
     * @returns List of geodesic spheres
     */
     async geodesicSpheresOnCenterPoints(inputs: Inputs.JSCAD.GeodesicSphereCentersDto): Promise<any[]> {
        return this.jscadWorkerManager.genericCallToWorkerPromise('shapes.geodesicSpheresOnCenterPoints', inputs);
    }

    /**
     * Create a 3D rounded cuboid solid
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/shapes/roundedCuboid.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_shapes.JSCADShapes.html#roundedCuboid
     * @param inputs Rounded cuboid parameters
     * @returns Rounded cuboid solid
     */
    async roundedCuboid(inputs: Inputs.JSCAD.RoundedCuboidDto): Promise<any> {
        return this.jscadWorkerManager.genericCallToWorkerPromise('shapes.roundedCuboid', inputs);

    }

    /**
     * Create a 3D rounded cuboids on multiple center points
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/shapes/roundedCuboidsOnCenterPoints.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_shapes.JSCADShapes.html#roundedCuboidsOnCenterPoints
     * @param inputs Rounded cuboids parameters with multiple center points
     * @returns List of rounded cuboids
     */
    async roundedCuboidsOnCenterPoints(inputs: Inputs.JSCAD.RoundedCuboidCentersDto): Promise<any[]> {
        return this.jscadWorkerManager.genericCallToWorkerPromise('shapes.roundedCuboidsOnCenterPoints', inputs);
    }

    /**
     * Create a 3D rounded cylinder solid
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/shapes/roundedCylinder.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_shapes.JSCADShapes.html#roundedCylinder
     * @param inputs Rounded cylinder parameters
     * @returns Rounded cylinder solid
     */
    async roundedCylinder(inputs: Inputs.JSCAD.RoundedCylidnerDto): Promise<any> {
        return this.jscadWorkerManager.genericCallToWorkerPromise('shapes.roundedCylinder', inputs);
    }

    /**
     * Create a 3D rounded cylinders on multiple center points
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/shapes/roundedCylindersOnCenterPoints.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_shapes.JSCADShapes.html#roundedCylindersOnCenterPoints
     * @param inputs Rounded cylinders parameters with multiple center points
     * @returns List of rounded cylinders
     */
    async roundedCylindersOnCenterPoints(inputs: Inputs.JSCAD.RoundedCylidnerCentersDto): Promise<any[]> {
        return this.jscadWorkerManager.genericCallToWorkerPromise('shapes.roundedCylindersOnCenterPoints', inputs);
    }

    /**
     * Create a 3D sphere solid
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/shapes/sphere.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_shapes.JSCADShapes.html#sphere
     * @param inputs Sphere parameters
     * @returns Sphere solid
     */
    async sphere(inputs: Inputs.JSCAD.SphereDto): Promise<any>{
        return this.jscadWorkerManager.genericCallToWorkerPromise('shapes.sphere', inputs);
    }

    /**
     * Create a 3D sphere on multiple center points
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/shapes/spheresOnCenterPoints.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_shapes.JSCADShapes.html#spheresOnCenterPoints
     * @param inputs Sphere parameters with multiple center points
     * @returns List of spheres
     */
    async spheresOnCenterPoints(inputs: Inputs.JSCAD.SphereCentersDto): Promise<any[]> {
        return this.jscadWorkerManager.genericCallToWorkerPromise('shapes.spheresOnCenterPoints', inputs);
    }

    /**
     * Create a 3D torus solid
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/shapes/torus.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_shapes.JSCADShapes.html#torus
     * @param inputs Torus parameters
     * @returns Torus solid
     */
    async torus(inputs: Inputs.JSCAD.TorusDto): Promise<any> {
        return this.jscadWorkerManager.genericCallToWorkerPromise('shapes.torus', inputs);
    }
}
