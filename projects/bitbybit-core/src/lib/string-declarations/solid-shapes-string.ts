import { simplifyDeclaration } from './simplify-declaration';

export const solidShapesString = simplifyDeclaration(`
import { Context } from '../context';
import { GeometryHelper } from '../geometry-helper';
import * as Inputs from '../inputs/inputs';
/**
 * Contains various functions for solid 3D shapes from JSCAD library http://openjscad.org
 * Thanks JSCAD community for developing this kernel
 */
export declare class SolidShapes {
    private readonly context;
    private readonly geometryHelper;
    constructor(context: Context, geometryHelper: GeometryHelper);
    /**
     * Create a 3D cube shape
     * <div>
     *  <img src="../assets/images/blockly-images/solid/shapes/cube.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_shapes_.solidshapes.html#cube
     * @param inputs Cube parameters
     * @returns Cube solid
     */
    cube(inputs: Inputs.Solid.CubeDto): any;
    /**
     * Create a 3D cubes on multiple center points
     * <div>
     *  <img src="../assets/images/blockly-images/solid/shapes/cubesOnCenterPoints.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_shapes_.solidshapes.html#cubesoncenterpoints
     * @param inputs Cube with multiple center points parameters
     * @returns List of cube solids
     */
    cubesOnCenterPoints(inputs: Inputs.Solid.CubeCentersDto): any[];
    /**
     * Create a 3D cuboid shape
     * <div>
     *  <img src="../assets/images/blockly-images/solid/shapes/cuboid.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_shapes_.solidshapes.html#cuboid
     * @param inputs Cuboid parameters
     * @returns Cuboid solid
     */
    cuboid(inputs: Inputs.Solid.CuboidDto): any;
    /**
     * Create a 3D cuboids on multiple center points
     * <div>
     *  <img src="../assets/images/blockly-images/solid/shapes/cuboidsOnCenterPoints.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_shapes_.solidshapes.html#cuboidsoncenterpoints
     * @param inputs Cuboids with multiple center point parameters
     * @returns List of cuboid solids
     */
    cuboidsOnCenterPoints(inputs: Inputs.Solid.CuboidCentersDto): any[];
    /**
     * Create a 3D elliptic cylinder solid
     * <div>
     *  <img src="../assets/images/blockly-images/solid/shapes/cylinderElliptic.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_shapes_.solidshapes.html#cylinderelliptic
     * @param inputs Elliptic cylinder parameters
     * @returns Elliptic cylinder solid
     */
    cylinderElliptic(inputs: Inputs.Solid.CylidnerEllipticDto): any;
    /**
     * Create a 3D elliptic cylinders on multiple center points
     * <div>
     *  <img src="../assets/images/blockly-images/solid/shapes/cylinderEllipticOnCenterPoints.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_shapes_.solidshapes.html#cylinderellipticoncenterpoints
     * @param inputs Elliptic cylinders with multiple center point parameters
     * @returns List of elliptic cylinders solids
     */
    cylinderEllipticOnCenterPoints(inputs: Inputs.Solid.CylidnerCentersEllipticDto): any[];
    /**
     * Create a 3D cylinder solid
     * <div>
     *  <img src="../assets/images/blockly-images/solid/shapes/cylinder.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_shapes_.solidshapes.html#cylinder
     * @param inputs Cylinder parameters
     * @returns Cylinder solid
     */
    cylinder(inputs: Inputs.Solid.CylidnerDto): any;
    /**
     * Create a 3D cylinders on multiple center points
     * <div>
     *  <img src="../assets/images/blockly-images/solid/shapes/cylinderOnCenterPoints.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_shapes_.solidshapes.html#cylinderoncenterpoints
     * @param inputs Cylinders with multiple center point parameters
     * @returns List of cylinder solids
     */
    cylindersOnCenterPoints(inputs: Inputs.Solid.CylidnerCentersDto): any[];
    /**
     * Create a 3D ellipsoid solid
     * <div>
     *  <img src="../assets/images/blockly-images/solid/shapes/ellipsoid.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_shapes_.solidshapes.html#ellipsoid
     * @param inputs Ellipsoid parameters
     * @returns Ellipsoid solid
     */
    ellipsoid(inputs: Inputs.Solid.EllipsoidDto): any;
    /**
     * Create a 3D ellipsoids on multiple center points
     * <div>
     *  <img src="../assets/images/blockly-images/solid/shapes/ellipsoidsOnCenterPoints.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_shapes_.solidshapes.html#ellipsoidsoncenterpoints
     * @param inputs Ellipsoid parameters with multiple center points
     * @returns List of ellipsoid solids
     */
    ellipsoidsOnCenterPoints(inputs: Inputs.Solid.EllipsoidCentersDto): any[];
    /**
     * Create a 3D geodesic sphere solid
     * <div>
     *  <img src="../assets/images/blockly-images/solid/shapes/geodesicSphere.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_shapes_.solidshapes.html#geodesicsphere
     * @param inputs Geodesic sphere parameters
     * @returns Geodesic sphere solid
     */
    geodesicSphere(inputs: Inputs.Solid.GeodesicSphereDto): any;
    /**
     * Create a 3D geodesic spheres on multiple center points
     * <div>
     *  <img src="../assets/images/blockly-images/solid/shapes/geodesicSpheresOnCenterPoints.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_shapes_.solidshapes.html#geodesicspheresoncenterpoints
     * @param inputs Geodesic sphere parameters with multiple center points
     * @returns List of geodesic spheres
     */
    geodesicSpheresOnCenterPoints(inputs: Inputs.Solid.GeodesicSphereCentersDto): any[];
    /**
     * Create a 3D rounded cuboid solid
     * <div>
     *  <img src="../assets/images/blockly-images/solid/shapes/roundedCuboid.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_shapes_.solidshapes.html#roundedcuboid
     * @param inputs Rounded cuboid parameters
     * @returns Rounded cuboid solid
     */
    roundedCuboid(inputs: Inputs.Solid.RoundedCuboidDto): any;
    /**
     * Create a 3D rounded cuboids on multiple center points
     * <div>
     *  <img src="../assets/images/blockly-images/solid/shapes/roundedCuboidsOnCenterPoints.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_shapes_.solidshapes.html#roundedcuboidsoncenterpoints
     * @param inputs Rounded cuboids parameters with multiple center points
     * @returns List of rounded cuboids
     */
    roundedCuboidsOnCenterPoints(inputs: Inputs.Solid.RoundedCuboidCentersDto): any[];
    /**
     * Create a 3D rounded cylinder solid
     * <div>
     *  <img src="../assets/images/blockly-images/solid/shapes/roundedCylinder.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_shapes_.solidshapes.html#roundedcylinder
     * @param inputs Rounded cylinder parameters
     * @returns Rounded cylinder solid
     */
    roundedCylinder(inputs: Inputs.Solid.RoundedCylidnerDto): any;
    /**
     * Create a 3D rounded cylinders on multiple center points
     * <div>
     *  <img src="../assets/images/blockly-images/solid/shapes/roundedCylindersOnCenterPoints.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_shapes_.solidshapes.html#roundedcylindersoncenterpoints
     * @param inputs Rounded cylinders parameters with multiple center points
     * @returns List of rounded cylinders
     */
    roundedCylindersOnCenterPoints(inputs: Inputs.Solid.RoundedCylidnerCentersDto): any[];
    /**
     * Create a 3D sphere solid
     * <div>
     *  <img src="../assets/images/blockly-images/solid/shapes/sphere.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_shapes_.solidshapes.html#sphere
     * @param inputs Sphere parameters
     * @returns Sphere solid
     */
    sphere(inputs: Inputs.Solid.SphereDto): any;
    /**
     * Create a 3D sphere on multiple center points
     * <div>
     *  <img src="../assets/images/blockly-images/solid/shapes/spheresOnCenterPoints.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_shapes_.solidshapes.html#spheresoncenterpoints
     * @param inputs Sphere parameters with multiple center points
     * @returns List of spheres
     */
    spheresOnCenterPoints(inputs: Inputs.Solid.SphereCentersDto): any[];
    /**
     * Create a 3D torus solid
     * <div>
     *  <img src="../assets/images/blockly-images/solid/shapes/torus.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_shapes_.solidshapes.html#torus
     * @param inputs Torus parameters
     * @returns Torus solid
     */
    torus(inputs: Inputs.Solid.TorusDto): any;
}

`);
