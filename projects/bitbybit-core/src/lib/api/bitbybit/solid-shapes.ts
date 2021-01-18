import { Injectable } from '@angular/core';
import { Angle } from '@babylonjs/core';
import { Context } from '../context';
import { GeometryHelper } from '../geometry-helper';
import * as Inputs from '../inputs/inputs';

/**
 * Contains various functions for solid 3D shapes from JSCAD library http://openjscad.org
 * Thanks JSCAD community for developing this kernel
 */
@Injectable()
export class SolidShapes {

    constructor(
        private readonly context: Context,
        private readonly geometryHelper: GeometryHelper,

    ) { }

    /**
     * Create a 3D cube shape
     * <div>
     *  <img src="../assets/images/blockly-images/solid/shapes/cube.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_shapes_.solidshapes.html#cube
     * @param inputs Cube parameters
     * @returns Cube solid
     */
    cube(inputs: Inputs.Solid.CubeDto): any {
        return this.context.jscad.primitives.cube({
            center: [inputs.center[0], inputs.center[1], inputs.center[2]],
            size: inputs.size
        });
    }

    /**
     * Create a 3D cubes on multiple center points
     * <div>
     *  <img src="../assets/images/blockly-images/solid/shapes/cubesOnCenterPoints.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_shapes_.solidshapes.html#cubesoncenterpoints
     * @param inputs Cube with multiple center points parameters
     * @returns List of cube solids
     */
    cubesOnCenterPoints(inputs: Inputs.Solid.CubeCentersDto): any[] {
        return inputs.centers.map(center => {
            return this.cube({ center, size: inputs.size });
        });
    }

    /**
     * Create a 3D cuboid shape
     * <div>
     *  <img src="../assets/images/blockly-images/solid/shapes/cuboid.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_shapes_.solidshapes.html#cuboid
     * @param inputs Cuboid parameters
     * @returns Cuboid solid
     */
    cuboid(inputs: Inputs.Solid.CuboidDto): any {
        return this.context.jscad.primitives.cuboid(
            {
                center: [inputs.center[0], inputs.center[1], inputs.center[2]],
                size: [inputs.width, inputs.height, inputs.length]
            }
        );
    }

    /**
     * Create a 3D cuboids on multiple center points
     * <div>
     *  <img src="../assets/images/blockly-images/solid/shapes/cuboidsOnCenterPoints.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_shapes_.solidshapes.html#cuboidsoncenterpoints
     * @param inputs Cuboids with multiple center point parameters
     * @returns List of cuboid solids
     */
    cuboidsOnCenterPoints(inputs: Inputs.Solid.CuboidCentersDto): any[] {
        return inputs.centers.map(center => {
            return this.cuboid({
                center,
                width: inputs.width,
                length: inputs.length,
                height: inputs.height
            });
        });
    }

    /**
     * Create a 3D elliptic cylinder solid
     * <div>
     *  <img src="../assets/images/blockly-images/solid/shapes/cylinderElliptic.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_shapes_.solidshapes.html#cylinderelliptic
     * @param inputs Elliptic cylinder parameters
     * @returns Elliptic cylinder solid
     */
    cylinderElliptic(inputs: Inputs.Solid.CylidnerEllipticDto): any {
        return this.context.jscad.primitives.cylinderElliptic({
            center: [inputs.center[0], inputs.center[1], inputs.center[2]],
            height: inputs.height,
            startRadius: [inputs.startRadius[0], inputs.startRadius[1]],
            endRadius: [inputs.endRadius[0], inputs.endRadius[1]],
            segments: inputs.segments,
        });
    }

    /**
     * Create a 3D elliptic cylinders on multiple center points
     * <div>
     *  <img src="../assets/images/blockly-images/solid/shapes/cylinderEllipticOnCenterPoints.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_shapes_.solidshapes.html#cylinderellipticoncenterpoints
     * @param inputs Elliptic cylinders with multiple center point parameters
     * @returns List of elliptic cylinders solids
     */
    cylinderEllipticOnCenterPoints(inputs: Inputs.Solid.CylidnerCentersEllipticDto): any[] {
        return inputs.centers.map(center => {
            return this.cylinderElliptic({
                center,
                height: inputs.height,
                startRadius: inputs.startRadius,
                endRadius: inputs.endRadius,
                segments: inputs.segments
            });
        });
    }

    /**
     * Create a 3D cylinder solid
     * <div>
     *  <img src="../assets/images/blockly-images/solid/shapes/cylinder.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_shapes_.solidshapes.html#cylinder
     * @param inputs Cylinder parameters
     * @returns Cylinder solid
     */
    cylinder(inputs: Inputs.Solid.CylidnerDto): any {
        return this.context.jscad.primitives.cylinder({
            center: [inputs.center[0], inputs.center[1], inputs.center[2]],
            height: inputs.height,
            radius: inputs.radius,
            segments: inputs.segments,
        });
    }

    /**
     * Create a 3D cylinders on multiple center points
     * <div>
     *  <img src="../assets/images/blockly-images/solid/shapes/cylindersOnCenterPoints.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_shapes_.solidshapes.html#cylinderoncenterpoints
     * @param inputs Cylinders with multiple center point parameters
     * @returns List of cylinder solids
     */
    cylindersOnCenterPoints(inputs: Inputs.Solid.CylidnerCentersDto): any[] {
        return inputs.centers.map(center => {
            return this.cylinder({
                center,
                height: inputs.height,
                radius: inputs.radius,
                segments: inputs.segments
            });
        });
    }

    /**
     * Create a 3D ellipsoid solid
     * <div>
     *  <img src="../assets/images/blockly-images/solid/shapes/ellipsoid.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_shapes_.solidshapes.html#ellipsoid
     * @param inputs Ellipsoid parameters
     * @returns Ellipsoid solid
     */
    ellipsoid(inputs: Inputs.Solid.EllipsoidDto): any {
        return this.context.jscad.primitives.ellipsoid({
            center: [inputs.center[0], inputs.center[1], inputs.center[2]],
            radius: [inputs.radius[0], inputs.radius[1], inputs.radius[2]],
            segments: inputs.segments,
            axes: [
                [-1, 0, 0],
                [0, -1, 0],
                [0, 0, -1],
            ],
        });
    }

    /**
     * Create a 3D ellipsoids on multiple center points
     * <div>
     *  <img src="../assets/images/blockly-images/solid/shapes/ellipsoidsOnCenterPoints.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_shapes_.solidshapes.html#ellipsoidsoncenterpoints
     * @param inputs Ellipsoid parameters with multiple center points
     * @returns List of ellipsoid solids
     */
    ellipsoidsOnCenterPoints(inputs: Inputs.Solid.EllipsoidCentersDto): any[] {
        return inputs.centers.map(center => {
            return this.ellipsoid({
                center,
                radius: inputs.radius,
                segments: inputs.segments
            });
        });
    }

    /**
     * Create a 3D geodesic sphere solid
     * <div>
     *  <img src="../assets/images/blockly-images/solid/shapes/geodesicSphere.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_shapes_.solidshapes.html#geodesicsphere
     * @param inputs Geodesic sphere parameters
     * @returns Geodesic sphere solid
     */
    geodesicSphere(inputs: Inputs.Solid.GeodesicSphereDto): any {
        let sphere = this.context.jscad.primitives.geodesicSphere({ radius: inputs.radius, frequency: inputs.frequency });
        sphere = this.context.jscad.transforms.translate([inputs.center[0], inputs.center[1], inputs.center[2]], sphere);
        return sphere;
    }

    /**
     * Create a 3D geodesic spheres on multiple center points
     * <div>
     *  <img src="../assets/images/blockly-images/solid/shapes/geodesicSpheresOnCenterPoints.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_shapes_.solidshapes.html#geodesicspheresoncenterpoints
     * @param inputs Geodesic sphere parameters with multiple center points
     * @returns List of geodesic spheres
     */
    geodesicSpheresOnCenterPoints(inputs: Inputs.Solid.GeodesicSphereCentersDto): any[] {
        return inputs.centers.map(center => {
            return this.geodesicSphere({
                center,
                radius: inputs.radius,
                frequency: inputs.frequency
            });
        });
    }

    /**
     * Create a 3D rounded cuboid solid
     * <div>
     *  <img src="../assets/images/blockly-images/solid/shapes/roundedCuboid.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_shapes_.solidshapes.html#roundedcuboid
     * @param inputs Rounded cuboid parameters
     * @returns Rounded cuboid solid
     */
    roundedCuboid(inputs: Inputs.Solid.RoundedCuboidDto): any {
        return this.context.jscad.primitives.roundedCuboid({
            center: [inputs.center[0], inputs.center[1], inputs.center[2]],
            size: [inputs.width, inputs.height, inputs.length],
            roundRadius: inputs.roundRadius,
            segments: inputs.segments,
        });
    }

    /**
     * Create a 3D rounded cuboids on multiple center points
     * <div>
     *  <img src="../assets/images/blockly-images/solid/shapes/roundedCuboidsOnCenterPoints.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_shapes_.solidshapes.html#roundedcuboidsoncenterpoints
     * @param inputs Rounded cuboids parameters with multiple center points
     * @returns List of rounded cuboids
     */
    roundedCuboidsOnCenterPoints(inputs: Inputs.Solid.RoundedCuboidCentersDto): any[] {
        return inputs.centers.map(center => {
            return this.roundedCuboid({
                center,
                width: inputs.width,
                height: inputs.height,
                length: inputs.length,
                roundRadius: inputs.roundRadius,
                segments: inputs.segments
            });
        });
    }

    /**
     * Create a 3D rounded cylinder solid
     * <div>
     *  <img src="../assets/images/blockly-images/solid/shapes/roundedCylinder.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_shapes_.solidshapes.html#roundedcylinder
     * @param inputs Rounded cylinder parameters
     * @returns Rounded cylinder solid
     */
    roundedCylinder(inputs: Inputs.Solid.RoundedCylidnerDto): any {
        return this.context.jscad.primitives.roundedCylinder({
            center: [inputs.center[0], inputs.center[1], inputs.center[2]],
            height: inputs.height,
            radius: inputs.radius,
            roundRadius: inputs.roundRadius,
            segments: inputs.segments,
        });
    }

    /**
     * Create a 3D rounded cylinders on multiple center points
     * <div>
     *  <img src="../assets/images/blockly-images/solid/shapes/roundedCylindersOnCenterPoints.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_shapes_.solidshapes.html#roundedcylindersoncenterpoints
     * @param inputs Rounded cylinders parameters with multiple center points
     * @returns List of rounded cylinders
     */
    roundedCylindersOnCenterPoints(inputs: Inputs.Solid.RoundedCylidnerCentersDto): any[] {
        return inputs.centers.map(center => {
            return this.roundedCylinder({
                center,
                radius: inputs.radius,
                roundRadius: inputs.roundRadius,
                segments: inputs.segments,
                height: inputs.height,
            });
        });
    }

    /**
     * Create a 3D sphere solid
     * <div>
     *  <img src="../assets/images/blockly-images/solid/shapes/sphere.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_shapes_.solidshapes.html#sphere
     * @param inputs Sphere parameters
     * @returns Sphere solid
     */
    sphere(inputs: Inputs.Solid.SphereDto): any{
        return this.context.jscad.primitives.sphere(
            {
                center: [inputs.center[0], inputs.center[1], inputs.center[2]],
                radius: inputs.radius,
                segments: inputs.segments
            }
        );
    }

    /**
     * Create a 3D sphere on multiple center points
     * <div>
     *  <img src="../assets/images/blockly-images/solid/shapes/spheresOnCenterPoints.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_shapes_.solidshapes.html#spheresoncenterpoints
     * @param inputs Sphere parameters with multiple center points
     * @returns List of spheres
     */
    spheresOnCenterPoints(inputs: Inputs.Solid.SphereCentersDto): any[] {
        return inputs.centers.map(center => {
            return this.sphere({
                center,
                radius: inputs.radius,
                segments: inputs.segments,
            });
        });
    }

    /**
     * Create a 3D torus solid
     * <div>
     *  <img src="../assets/images/blockly-images/solid/shapes/torus.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_shapes_.solidshapes.html#torus
     * @param inputs Torus parameters
     * @returns Torus solid
     */
    torus(inputs: Inputs.Solid.TorusDto): any {
        return this.context.jscad.primitives.torus({
            center: [inputs.center[0], inputs.center[1], inputs.center[2]],
            innerRadius: inputs.innerRadius,
            outerRadius: inputs.outerRadius,
            innerSegments: inputs.innerSegments,
            outerSegments: inputs.outerSegments,
            innerRotation: Angle.FromDegrees(inputs.innerRotation).radians(),
            outerRotation: Angle.FromDegrees(inputs.outerRotation).radians(),
            startAngle: Angle.FromDegrees(inputs.startAngle).radians(),
        });
    }
}
