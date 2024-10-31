import { MathBitByBit } from "../../../api/bitbybit";
import * as Inputs from "../../../api/inputs/inputs";

/**
 * Contains various functions for solid 3D shapes from JSCAD library https://github.com/jscad/OpenJSCAD.org
 * Thanks JSCAD community for developing this kernel
 */
export class JSCADShapes {

    jscad: any;

    constructor(
        jscad: any,
        private readonly math: MathBitByBit
    ) {
        this.jscad = jscad;
    }

    cube(inputs: Inputs.JSCAD.CubeDto): Inputs.JSCAD.JSCADEntity {
        return this.jscad.primitives.cube({
            center: [inputs.center[0], inputs.center[1], inputs.center[2]],
            size: inputs.size
        });
    }

    cubesOnCenterPoints(inputs: Inputs.JSCAD.CubeCentersDto): Inputs.JSCAD.JSCADEntity[] {
        return inputs.centers.map(center => {
            return this.cube({ center, size: inputs.size });
        });
    }

    cuboid(inputs: Inputs.JSCAD.CuboidDto): Inputs.JSCAD.JSCADEntity {
        return this.jscad.primitives.cuboid(
            {
                center: [inputs.center[0], inputs.center[1], inputs.center[2]],
                size: [inputs.width, inputs.height, inputs.length]
            }
        );
    }

    cuboidsOnCenterPoints(inputs: Inputs.JSCAD.CuboidCentersDto): Inputs.JSCAD.JSCADEntity[] {
        return inputs.centers.map(center => {
            return this.cuboid({
                center,
                width: inputs.width,
                length: inputs.length,
                height: inputs.height
            });
        });
    }

    cylinderElliptic(inputs: Inputs.JSCAD.CylidnerEllipticDto): Inputs.JSCAD.JSCADEntity {
        return this.jscad.primitives.cylinderElliptic({
            center: [inputs.center[0], inputs.center[1], inputs.center[2]],
            height: inputs.height,
            startRadius: [inputs.startRadius[0], inputs.startRadius[1]],
            endRadius: [inputs.endRadius[0], inputs.endRadius[1]],
            segments: inputs.segments,
        });
    }

    cylinderEllipticOnCenterPoints(inputs: Inputs.JSCAD.CylidnerCentersEllipticDto): Inputs.JSCAD.JSCADEntity[] {
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

    cylinder(inputs: Inputs.JSCAD.CylidnerDto): Inputs.JSCAD.JSCADEntity {
        return this.jscad.primitives.cylinder({
            center: [inputs.center[0], inputs.center[1], inputs.center[2]],
            height: inputs.height,
            radius: inputs.radius,
            segments: inputs.segments,
        });
    }

    cylindersOnCenterPoints(inputs: Inputs.JSCAD.CylidnerCentersDto): Inputs.JSCAD.JSCADEntity[] {
        return inputs.centers.map(center => {
            return this.cylinder({
                center,
                height: inputs.height,
                radius: inputs.radius,
                segments: inputs.segments
            });
        });
    }

    ellipsoid(inputs: Inputs.JSCAD.EllipsoidDto): Inputs.JSCAD.JSCADEntity {
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

    ellipsoidsOnCenterPoints(inputs: Inputs.JSCAD.EllipsoidCentersDto): Inputs.JSCAD.JSCADEntity[] {
        return inputs.centers.map(center => {
            return this.ellipsoid({
                center,
                radius: inputs.radius,
                segments: inputs.segments
            });
        });
    }

    geodesicSphere(inputs: Inputs.JSCAD.GeodesicSphereDto): Inputs.JSCAD.JSCADEntity {
        let sphere = this.jscad.primitives.geodesicSphere({ radius: inputs.radius, frequency: inputs.frequency });
        sphere = this.jscad.transforms.translate([inputs.center[0], inputs.center[1], inputs.center[2]], sphere);
        return sphere;
    }

    geodesicSpheresOnCenterPoints(inputs: Inputs.JSCAD.GeodesicSphereCentersDto): Inputs.JSCAD.JSCADEntity[] {
        return inputs.centers.map(center => {
            return this.geodesicSphere({
                center,
                radius: inputs.radius,
                frequency: inputs.frequency
            });
        });
    }

    roundedCuboid(inputs: Inputs.JSCAD.RoundedCuboidDto): Inputs.JSCAD.JSCADEntity {
        return this.jscad.primitives.roundedCuboid({
            center: [inputs.center[0], inputs.center[1], inputs.center[2]],
            size: [inputs.width, inputs.height, inputs.length],
            roundRadius: inputs.roundRadius,
            segments: inputs.segments,
        });
    }

    roundedCuboidsOnCenterPoints(inputs: Inputs.JSCAD.RoundedCuboidCentersDto): Inputs.JSCAD.JSCADEntity[] {
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

    roundedCylinder(inputs: Inputs.JSCAD.RoundedCylidnerDto): Inputs.JSCAD.JSCADEntity {
        return this.jscad.primitives.roundedCylinder({
            center: [inputs.center[0], inputs.center[1], inputs.center[2]],
            height: inputs.height,
            radius: inputs.radius,
            roundRadius: inputs.roundRadius,
            segments: inputs.segments,
        });
    }

    roundedCylindersOnCenterPoints(inputs: Inputs.JSCAD.RoundedCylidnerCentersDto): Inputs.JSCAD.JSCADEntity[] {
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

    sphere(inputs: Inputs.JSCAD.SphereDto): Inputs.JSCAD.JSCADEntity {
        return this.jscad.primitives.sphere(
            {
                center: [inputs.center[0], inputs.center[1], inputs.center[2]],
                radius: inputs.radius,
                segments: inputs.segments
            }
        );
    }

    spheresOnCenterPoints(inputs: Inputs.JSCAD.SphereCentersDto): Inputs.JSCAD.JSCADEntity[] {
        return inputs.centers.map(center => {
            return this.sphere({
                center,
                radius: inputs.radius,
                segments: inputs.segments,
            });
        });
    }

    torus(inputs: Inputs.JSCAD.TorusDto): Inputs.JSCAD.JSCADEntity {
        return this.jscad.primitives.torus({
            center: [inputs.center[0], inputs.center[1], inputs.center[2]],
            innerRadius: inputs.innerRadius,
            outerRadius: inputs.outerRadius,
            innerSegments: inputs.innerSegments,
            outerSegments: inputs.outerSegments,
            innerRotation: this.math.degToRad({ number: inputs.innerRotation }),
            outerRotation: this.math.degToRad({ number: inputs.outerRotation }),
            startAngle: this.math.degToRad({ number: inputs.startAngle }),
        });
    }

    fromPolygonPoints(inputs: Inputs.JSCAD.FromPolygonPoints): Inputs.JSCAD.JSCADEntity {
        const pts = inputs.polygonPoints.map(vertices => vertices.reverse());
        return this.jscad.geometries.geom3.fromPoints(pts);
    }
}
