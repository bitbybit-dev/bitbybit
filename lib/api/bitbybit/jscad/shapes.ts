
import { JSCADWorkerManager } from "../../../workers/jscad/jscad-worker-manager";
import * as Inputs from "../../inputs/inputs";

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
     * @param inputs Cube parameters
     * @returns Cube solid
     * @group primitives
     * @shortname cube
     * @drawable true
     */
    async cube(inputs: Inputs.JSCAD.CubeDto): Promise<Inputs.JSCAD.JSCADEntity> {
        return this.jscadWorkerManager.genericCallToWorkerPromise("shapes.cube", inputs);
    }

    /**
     * Create a 3D cubes on multiple center points
     * @param inputs Cube with multiple center points parameters
     * @returns List of cube solids
     * @group primitives on centers
     * @shortname cubes
     * @drawable true
     */
    async cubesOnCenterPoints(inputs: Inputs.JSCAD.CubeCentersDto): Promise<Inputs.JSCAD.JSCADEntity[]> {
        return this.jscadWorkerManager.genericCallToWorkerPromise("shapes.cubesOnCenterPoints", inputs);
    }

    /**
     * Create a 3D cuboid shape
     * @param inputs Cuboid parameters
     * @returns Cuboid solid
     * @group primitives
     * @shortname cuboid
     * @drawable true
     */
    async cuboid(inputs: Inputs.JSCAD.CuboidDto): Promise<Inputs.JSCAD.JSCADEntity> {
        return this.jscadWorkerManager.genericCallToWorkerPromise("shapes.cuboid", inputs);
    }

    /**
     * Create a 3D cuboids on multiple center points
     * @param inputs Cuboids with multiple center point parameters
     * @returns List of cuboid solids
     * @group primitives on centers
     * @shortname cuboids
     * @drawable true
     */
    async cuboidsOnCenterPoints(inputs: Inputs.JSCAD.CuboidCentersDto): Promise<Inputs.JSCAD.JSCADEntity[]> {
        return this.jscadWorkerManager.genericCallToWorkerPromise("shapes.cuboidsOnCenterPoints", inputs);
    }

    /**
     * Create a 3D elliptic cylinder solid
     * @param inputs Elliptic cylinder parameters
     * @returns Elliptic cylinder solid
     * @group primitives
     * @shortname cylinder elliptic
     * @drawable true
     */
    async cylinderElliptic(inputs: Inputs.JSCAD.CylidnerEllipticDto): Promise<Inputs.JSCAD.JSCADEntity> {
        return this.jscadWorkerManager.genericCallToWorkerPromise("shapes.cylinderElliptic", inputs);
    }

    /**
     * Create a 3D elliptic cylinders on multiple center points
     * @param inputs Elliptic cylinders with multiple center point parameters
     * @returns List of elliptic cylinders solids
     * @group primitives on centers
     * @shortname cylinder elliptic
     * @drawable true
     */
    async cylinderEllipticOnCenterPoints(inputs: Inputs.JSCAD.CylidnerCentersEllipticDto): Promise<Inputs.JSCAD.JSCADEntity[]> {
        return this.jscadWorkerManager.genericCallToWorkerPromise("shapes.cylinderEllipticOnCenterPoints", inputs);
    }

    /**
     * Create a 3D cylinder solid
     * @param inputs Cylinder parameters
     * @returns Cylinder solid
     * @group primitives
     * @shortname cylinder
     * @drawable true
     */
     async cylinder(inputs: Inputs.JSCAD.CylidnerDto): Promise<Inputs.JSCAD.JSCADEntity> {
        return this.jscadWorkerManager.genericCallToWorkerPromise("shapes.cylinder", inputs);
    }

    /**
     * Create a 3D cylinders on multiple center points
     * @param inputs Cylinders with multiple center point parameters
     * @returns List of cylinder solids
     * @group primitives on centers
     * @shortname cylinder
     * @drawable true
     */
     async cylindersOnCenterPoints(inputs: Inputs.JSCAD.CylidnerCentersDto): Promise<Inputs.JSCAD.JSCADEntity[]> {
        return this.jscadWorkerManager.genericCallToWorkerPromise("shapes.cylindersOnCenterPoints", inputs);
    }

    /**
     * Create a 3D ellipsoid solid
     * @param inputs Ellipsoid parameters
     * @returns Ellipsoid solid
     * @group primitives
     * @shortname ellipsoid
     * @drawable true
     */
     async ellipsoid(inputs: Inputs.JSCAD.EllipsoidDto): Promise<Inputs.JSCAD.JSCADEntity> {
        return this.jscadWorkerManager.genericCallToWorkerPromise("shapes.ellipsoid", inputs);
    }

    /**
     * Create a 3D ellipsoids on multiple center points
     * @param inputs Ellipsoid parameters with multiple center points
     * @returns List of ellipsoid solids
     * @group primitives on centers
     * @shortname ellipsoid
     * @drawable true
     */
     async ellipsoidsOnCenterPoints(inputs: Inputs.JSCAD.EllipsoidCentersDto): Promise<Inputs.JSCAD.JSCADEntity[]> {
        return this.jscadWorkerManager.genericCallToWorkerPromise("shapes.ellipsoidsOnCenterPoints", inputs);
    }

    /**
     * Create a 3D geodesic sphere solid
     * @param inputs Geodesic sphere parameters
     * @returns Geodesic sphere solid
     * @group primitives
     * @shortname geodesic sphere
     * @drawable true
     */
     async geodesicSphere(inputs: Inputs.JSCAD.GeodesicSphereDto): Promise<Inputs.JSCAD.JSCADEntity> {
        return this.jscadWorkerManager.genericCallToWorkerPromise("shapes.geodesicSphere", inputs);
    }

    /**
     * Create a 3D geodesic spheres on multiple center points
     * @param inputs Geodesic sphere parameters with multiple center points
     * @returns List of geodesic spheres
     * @group primitives on centers
     * @shortname geodesic sphere
     * @drawable true
     */
     async geodesicSpheresOnCenterPoints(inputs: Inputs.JSCAD.GeodesicSphereCentersDto): Promise<Inputs.JSCAD.JSCADEntity[]> {
        return this.jscadWorkerManager.genericCallToWorkerPromise("shapes.geodesicSpheresOnCenterPoints", inputs);
    }

    /**
     * Create a 3D rounded cuboid solid
     * @param inputs Rounded cuboid parameters
     * @returns Rounded cuboid solid
     * @group primitives
     * @shortname rounded cuboid
     * @drawable true
     */
    async roundedCuboid(inputs: Inputs.JSCAD.RoundedCuboidDto): Promise<Inputs.JSCAD.JSCADEntity> {
        return this.jscadWorkerManager.genericCallToWorkerPromise("shapes.roundedCuboid", inputs);

    }

    /**
     * Create a 3D rounded cuboids on multiple center points
     * @param inputs Rounded cuboids parameters with multiple center points
     * @returns List of rounded cuboids
     * @group primitives on centers
     * @shortname rounded cuboid
     * @drawable true
     */
    async roundedCuboidsOnCenterPoints(inputs: Inputs.JSCAD.RoundedCuboidCentersDto): Promise<Inputs.JSCAD.JSCADEntity[]> {
        return this.jscadWorkerManager.genericCallToWorkerPromise("shapes.roundedCuboidsOnCenterPoints", inputs);
    }

    /**
     * Create a 3D rounded cylinder solid
     * @param inputs Rounded cylinder parameters
     * @returns Rounded cylinder solid
     * @group primitives
     * @shortname rounded cylinder
     * @drawable true
     */
    async roundedCylinder(inputs: Inputs.JSCAD.RoundedCylidnerDto): Promise<Inputs.JSCAD.JSCADEntity> {
        return this.jscadWorkerManager.genericCallToWorkerPromise("shapes.roundedCylinder", inputs);
    }

    /**
     * Create a 3D rounded cylinders on multiple center points
     * @param inputs Rounded cylinders parameters with multiple center points
     * @returns List of rounded cylinders
     * @group primitives on centers
     * @shortname rounded cylinder
     * @drawable true
     */
    async roundedCylindersOnCenterPoints(inputs: Inputs.JSCAD.RoundedCylidnerCentersDto): Promise<Inputs.JSCAD.JSCADEntity[]> {
        return this.jscadWorkerManager.genericCallToWorkerPromise("shapes.roundedCylindersOnCenterPoints", inputs);
    }

    /**
     * Create a 3D sphere solid
     * @param inputs Sphere parameters
     * @returns Sphere solid
     * @group primitives
     * @shortname sphere
     * @drawable true
     */
    async sphere(inputs: Inputs.JSCAD.SphereDto): Promise<Inputs.JSCAD.JSCADEntity>{
        return this.jscadWorkerManager.genericCallToWorkerPromise("shapes.sphere", inputs);
    }

    /**
     * Create a 3D sphere on multiple center points
     * @param inputs Sphere parameters with multiple center points
     * @returns List of spheres
     * @group primitives on centers
     * @shortname sphere
     * @drawable true
     */
    async spheresOnCenterPoints(inputs: Inputs.JSCAD.SphereCentersDto): Promise<Inputs.JSCAD.JSCADEntity[]> {
        return this.jscadWorkerManager.genericCallToWorkerPromise("shapes.spheresOnCenterPoints", inputs);
    }

    /**
     * Create a 3D torus solid
     * @param inputs Torus parameters
     * @returns Torus solid
     * @group primitives
     * @shortname torus
     * @drawable true
     */
    async torus(inputs: Inputs.JSCAD.TorusDto): Promise<Inputs.JSCAD.JSCADEntity> {
        return this.jscadWorkerManager.genericCallToWorkerPromise("shapes.torus", inputs);
    }
}
