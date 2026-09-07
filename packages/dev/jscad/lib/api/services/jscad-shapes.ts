import * as Inputs from "../inputs/jscad-inputs";
import { MathBitByBit } from "@bitbybit-dev/base";
import * as JSCAD from "@jscad/modeling";

/**
 * Contains various functions for solid 3D shapes from JSCAD library https://github.com/jscad/OpenJSCAD.org
 * Thanks JSCAD community for developing this kernel
 */
export class JSCADShapes {

    jscad: typeof JSCAD;

    constructor(
        jscad: typeof JSCAD,
        private readonly math: MathBitByBit
    ) {
        this.jscad = jscad;
    }

    /**
     * Create a 3D cube shape
     * @param inputs Cube parameters
     * @returns Cube solid
     * @group primitives
     * @shortname cube
     * @drawable true
     */
    cube(inputs: Inputs.JSCAD.CubeDto): Inputs.JSCAD.JSCADEntity {
        return this.jscad.primitives.cube({
            center: [inputs.center[0], inputs.center[1], inputs.center[2]],
            size: inputs.size
        });
    }

    /**
     * Create a 3D cubes on multiple center points
     * @param inputs Cube with multiple center points parameters
     * @returns List of cube solids
     * @group primitives on centers
     * @shortname cubes
     * @drawable true
     */
    cubesOnCenterPoints(inputs: Inputs.JSCAD.CubeCentersDto): Inputs.JSCAD.JSCADEntity[] {
        return inputs.centers.map(center => {
            return this.cube({ center, size: inputs.size });
        });
    }

    /**
     * Create a 3D cuboid shape
     * @param inputs Cuboid parameters
     * @returns Cuboid solid
     * @group primitives
     * @shortname cuboid
     * @drawable true
     */
    cuboid(inputs: Inputs.JSCAD.CuboidDto): Inputs.JSCAD.JSCADEntity {
        return this.jscad.primitives.cuboid(
            {
                center: [inputs.center[0], inputs.center[1], inputs.center[2]],
                size: [inputs.width, inputs.height, inputs.length]
            }
        );
    }

    /**
     * Create a 3D cuboids on multiple center points
     * @param inputs Cuboids with multiple center point parameters
     * @returns List of cuboid solids
     * @group primitives on centers
     * @shortname cuboids
     * @drawable true
     */
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

    /**
     * Create a 3D elliptic cylinder solid
     * @param inputs Elliptic cylinder parameters
     * @returns Elliptic cylinder solid
     * @group primitives
     * @shortname cylinder elliptic
     * @drawable true
     */
    cylinderElliptic(inputs: Inputs.JSCAD.CylidnerEllipticDto): Inputs.JSCAD.JSCADEntity {
        return this.jscad.primitives.cylinderElliptic({
            center: [inputs.center[0], inputs.center[1], inputs.center[2]],
            height: inputs.height,
            startRadius: [inputs.startRadius[0], inputs.startRadius[1]],
            endRadius: [inputs.endRadius[0], inputs.endRadius[1]],
            segments: inputs.segments,
        });
    }

    /**
     * Create a 3D elliptic cylinders on multiple center points
     * @param inputs Elliptic cylinders with multiple center point parameters
     * @returns List of elliptic cylinders solids
     * @group primitives on centers
     * @shortname cylinder elliptic
     * @drawable true
     */
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

    /**
     * Create a 3D cylinder solid
     * @param inputs Cylinder parameters
     * @returns Cylinder solid
     * @group primitives
     * @shortname cylinder
     * @drawable true
     */
    cylinder(inputs: Inputs.JSCAD.CylidnerDto): Inputs.JSCAD.JSCADEntity {
        return this.jscad.primitives.cylinder({
            center: [inputs.center[0], inputs.center[1], inputs.center[2]],
            height: inputs.height,
            radius: inputs.radius,
            segments: inputs.segments,
        });
    }

    /**
     * Create a 3D cylinders on multiple center points
     * @param inputs Cylinders with multiple center point parameters
     * @returns List of cylinder solids
     * @group primitives on centers
     * @shortname cylinder
     * @drawable true
     */
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

    /**
     * Create a 3D ellipsoid solid
     * @param inputs Ellipsoid parameters
     * @returns Ellipsoid solid
     * @group primitives
     * @shortname ellipsoid
     * @drawable true
     */
    ellipsoid(inputs: Inputs.JSCAD.EllipsoidDto): Inputs.JSCAD.JSCADEntity {
        return this.jscad.primitives.ellipsoid({
            center: [inputs.center[0], inputs.center[1], inputs.center[2]],
            radius: [inputs.radius[0], inputs.radius[1], inputs.radius[2]],
            segments: inputs.segments,
            axes: [
                [-1, 0, 0],
                [0, -1, 0],
                [0, 0, -1],
            ] as any,
        });
    }

    /**
     * Create a 3D ellipsoids on multiple center points
     * @param inputs Ellipsoid parameters with multiple center points
     * @returns List of ellipsoid solids
     * @group primitives on centers
     * @shortname ellipsoid
     * @drawable true
     */
    ellipsoidsOnCenterPoints(inputs: Inputs.JSCAD.EllipsoidCentersDto): Inputs.JSCAD.JSCADEntity[] {
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
     * @param inputs Geodesic sphere parameters
     * @returns Geodesic sphere solid
     * @group primitives
     * @shortname geodesic sphere
     * @drawable true
     */
    geodesicSphere(inputs: Inputs.JSCAD.GeodesicSphereDto): Inputs.JSCAD.JSCADEntity {
        let sphere = this.jscad.primitives.geodesicSphere({ radius: inputs.radius, frequency: inputs.frequency });
        sphere = this.jscad.transforms.translate([inputs.center[0], inputs.center[1], inputs.center[2]], sphere);
        return sphere;
    }

    /**
     * Create a 3D geodesic spheres on multiple center points
     * @param inputs Geodesic sphere parameters with multiple center points
     * @returns List of geodesic spheres
     * @group primitives on centers
     * @shortname geodesic sphere
     * @drawable true
     */
    geodesicSpheresOnCenterPoints(inputs: Inputs.JSCAD.GeodesicSphereCentersDto): Inputs.JSCAD.JSCADEntity[] {
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
     * @param inputs Rounded cuboid parameters
     * @returns Rounded cuboid solid
     * @group primitives
     * @shortname rounded cuboid
     * @drawable true
     */
    roundedCuboid(inputs: Inputs.JSCAD.RoundedCuboidDto): Inputs.JSCAD.JSCADEntity {
        return this.jscad.primitives.roundedCuboid({
            center: [inputs.center[0], inputs.center[1], inputs.center[2]],
            size: [inputs.width, inputs.height, inputs.length],
            roundRadius: inputs.roundRadius,
            segments: inputs.segments,
        });
    }

    /**
     * Create a 3D rounded cuboids on multiple center points
     * @param inputs Rounded cuboids parameters with multiple center points
     * @returns List of rounded cuboids
     * @group primitives on centers
     * @shortname rounded cuboid
     * @drawable true
     */
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

    /**
     * Create a 3D rounded cylinder solid
     * @param inputs Rounded cylinder parameters
     * @returns Rounded cylinder solid
     * @group primitives
     * @shortname rounded cylinder
     * @drawable true
     */
    roundedCylinder(inputs: Inputs.JSCAD.RoundedCylidnerDto): Inputs.JSCAD.JSCADEntity {
        return this.jscad.primitives.roundedCylinder({
            center: [inputs.center[0], inputs.center[1], inputs.center[2]],
            height: inputs.height,
            radius: inputs.radius,
            roundRadius: inputs.roundRadius,
            segments: inputs.segments,
        });
    }

    /**
     * Create a 3D rounded cylinders on multiple center points
     * @param inputs Rounded cylinders parameters with multiple center points
     * @returns List of rounded cylinders
     * @group primitives on centers
     * @shortname rounded cylinder
     * @drawable true
     */
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

    /**
     * Create a 3D sphere solid
     * @param inputs Sphere parameters
     * @returns Sphere solid
     * @group primitives
     * @shortname sphere
     * @drawable true
     */
    sphere(inputs: Inputs.JSCAD.SphereDto): Inputs.JSCAD.JSCADEntity {
        return this.jscad.primitives.sphere(
            {
                center: [inputs.center[0], inputs.center[1], inputs.center[2]],
                radius: inputs.radius,
                segments: inputs.segments
            }
        );
    }

    /**
     * Create a 3D sphere on multiple center points
     * @param inputs Sphere parameters with multiple center points
     * @returns List of spheres
     * @group primitives on centers
     * @shortname sphere
     * @drawable true
     */
    spheresOnCenterPoints(inputs: Inputs.JSCAD.SphereCentersDto): Inputs.JSCAD.JSCADEntity[] {
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
     * @param inputs Torus parameters
     * @returns Torus solid
     * @group primitives
     * @shortname torus
     * @drawable true
     */
    torus(inputs: Inputs.JSCAD.TorusDto): Inputs.JSCAD.JSCADEntity {
        return this.jscad.primitives.torus({
            innerRadius: inputs.innerRadius,
            outerRadius: inputs.outerRadius,
            innerSegments: inputs.innerSegments,
            outerSegments: inputs.outerSegments,
            innerRotation: this.math.degToRad({ number: inputs.innerRotation }),
            outerRotation: this.math.degToRad({ number: inputs.outerRotation }),
            startAngle: this.math.degToRad({ number: inputs.startAngle }),
        });
    }

    /**
     * Create a 3D shape from poylgon points that have to be nested arrays of points
     * @param inputs points
     * @returns shape
     * @group shapes
     * @shortname from polygon points
     * @drawable true
     */
    fromPolygonPoints(inputs: Inputs.JSCAD.FromPolygonPoints): Inputs.JSCAD.JSCADEntity {
        const pts = inputs.polygonPoints.map(vertices => vertices.reverse());
        return this.jscad.geometries.geom3.fromPoints(pts);
    }
}
