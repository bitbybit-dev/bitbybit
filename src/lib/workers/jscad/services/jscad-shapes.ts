import { Angle } from '@babylonjs/core';
import * as Inputs from '../../../api/inputs/inputs';

/**
 * Contains various functions for solid 3D shapes from JSCAD library https://github.com/jscad/OpenJSCAD.org
 * Thanks JSCAD community for developing this kernel
 */
export class JSCADShapes {

    jscad: any;

    constructor(
        jscad: any,
    ) { 
        this.jscad = jscad;
    }

    cube(inputs: Inputs.JSCAD.CubeDto): any {
        return this.jscad.primitives.cube({
            center: [inputs.center[0], inputs.center[1], inputs.center[2]],
            size: inputs.size
        });
    }

    cubesOnCenterPoints(inputs: Inputs.JSCAD.CubeCentersDto): any[] {
        return inputs.centers.map(center => {
            return this.cube({ center, size: inputs.size });
        });
    }

    cuboid(inputs: Inputs.JSCAD.CuboidDto): any {
        return this.jscad.primitives.cuboid(
            {
                center: [inputs.center[0], inputs.center[1], inputs.center[2]],
                size: [inputs.width, inputs.height, inputs.length]
            }
        );
    }

    cuboidsOnCenterPoints(inputs: Inputs.JSCAD.CuboidCentersDto): any[] {
        return inputs.centers.map(center => {
            return this.cuboid({
                center,
                width: inputs.width,
                length: inputs.length,
                height: inputs.height
            });
        });
    }

    cylinderElliptic(inputs: Inputs.JSCAD.CylidnerEllipticDto): any {
        return this.jscad.primitives.cylinderElliptic({
            center: [inputs.center[0], inputs.center[1], inputs.center[2]],
            height: inputs.height,
            startRadius: [inputs.startRadius[0], inputs.startRadius[1]],
            endRadius: [inputs.endRadius[0], inputs.endRadius[1]],
            segments: inputs.segments,
        });
    }

    cylinderEllipticOnCenterPoints(inputs: Inputs.JSCAD.CylidnerCentersEllipticDto): any[] {
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

    cylinder(inputs: Inputs.JSCAD.CylidnerDto): any {
        return this.jscad.primitives.cylinder({
            center: [inputs.center[0], inputs.center[1], inputs.center[2]],
            height: inputs.height,
            radius: inputs.radius,
            segments: inputs.segments,
        });
    }

    cylindersOnCenterPoints(inputs: Inputs.JSCAD.CylidnerCentersDto): any[] {
        return inputs.centers.map(center => {
            return this.cylinder({
                center,
                height: inputs.height,
                radius: inputs.radius,
                segments: inputs.segments
            });
        });
    }

    ellipsoid(inputs: Inputs.JSCAD.EllipsoidDto): any {
        return this.jscad.primitives.ellipsoid({
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

    ellipsoidsOnCenterPoints(inputs: Inputs.JSCAD.EllipsoidCentersDto): any[] {
        return inputs.centers.map(center => {
            return this.ellipsoid({
                center,
                radius: inputs.radius,
                segments: inputs.segments
            });
        });
    }

    geodesicSphere(inputs: Inputs.JSCAD.GeodesicSphereDto): any {
        let sphere = this.jscad.primitives.geodesicSphere({ radius: inputs.radius, frequency: inputs.frequency });
        sphere = this.jscad.transforms.translate([inputs.center[0], inputs.center[1], inputs.center[2]], sphere);
        return sphere;
    }

    geodesicSpheresOnCenterPoints(inputs: Inputs.JSCAD.GeodesicSphereCentersDto): any[] {
        return inputs.centers.map(center => {
            return this.geodesicSphere({
                center,
                radius: inputs.radius,
                frequency: inputs.frequency
            });
        });
    }

    roundedCuboid(inputs: Inputs.JSCAD.RoundedCuboidDto): any {
        return this.jscad.primitives.roundedCuboid({
            center: [inputs.center[0], inputs.center[1], inputs.center[2]],
            size: [inputs.width, inputs.height, inputs.length],
            roundRadius: inputs.roundRadius,
            segments: inputs.segments,
        });
    }

    roundedCuboidsOnCenterPoints(inputs: Inputs.JSCAD.RoundedCuboidCentersDto): any[] {
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

    roundedCylinder(inputs: Inputs.JSCAD.RoundedCylidnerDto): any {
        return this.jscad.primitives.roundedCylinder({
            center: [inputs.center[0], inputs.center[1], inputs.center[2]],
            height: inputs.height,
            radius: inputs.radius,
            roundRadius: inputs.roundRadius,
            segments: inputs.segments,
        });
    }

    roundedCylindersOnCenterPoints(inputs: Inputs.JSCAD.RoundedCylidnerCentersDto): any[] {
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

    sphere(inputs: Inputs.JSCAD.SphereDto): any {
        return this.jscad.primitives.sphere(
            {
                center: [inputs.center[0], inputs.center[1], inputs.center[2]],
                radius: inputs.radius,
                segments: inputs.segments
            }
        );
    }

    spheresOnCenterPoints(inputs: Inputs.JSCAD.SphereCentersDto): any[] {
        return inputs.centers.map(center => {
            return this.sphere({
                center,
                radius: inputs.radius,
                segments: inputs.segments,
            });
        });
    }

    torus(inputs: Inputs.JSCAD.TorusDto): any {
        return this.jscad.primitives.torus({
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
