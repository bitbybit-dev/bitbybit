import * as Inputs from "../inputs/jscad-inputs";
import type { MathBitByBit } from "@bitbybit-dev/base";
import { resolveDto } from "@bitbybit-dev/base";
import type * as JSCAD from "@jscad/modeling";
import type * as Resolved from "../resolved-inputs";

/**
 * Building JSCAD solids: cubes, cuboids, spheres, ellipsoids, cylinders, a torus and a solid from
 * raw polygon points, each with a variant that places one copy on every point of a list. The kernel
 * keeps Z as its own axis, so a cylinder stands along Z and a torus lies flat in the XY plane;
 * every solid is a closed mesh of polygons and `segments` says how many flat facets approximate a
 * round surface.
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
     * Builds a cube of edge length `size` centered on `center`, with its faces parallel to the
     * axes.
     * @param inputs - The center and the edge length
     * @returns The cube solid
     * @group primitives
     * @shortname cube
     * @drawable true
     * @example
     * ```typescript
     * const cube = await bitbybit.jscad.shapes.cube({ center: [0, 0, 0], size: 10 });
     * ```
     */
    cube(inputs: Inputs.JSCAD.CubeDto): Inputs.JSCAD.JSCADEntity {
        const resolved = resolveDto(Inputs.JSCAD.CubeDto, inputs) as Resolved.JSCAD.CubeDto;
        return this.jscad.primitives.cube({
            center: [resolved.center[0], resolved.center[1], resolved.center[2]],
            size: resolved.size
        });
    }

    /**
     * Builds one cube of edge length `size` on every point of `centers`, in the same order.
     * @param inputs - The center points and the edge length
     * @returns One cube per center point
     * @group primitives on centers
     * @shortname cubes
     * @drawable true
     * @example
     * ```typescript
     * const cubes = await bitbybit.jscad.shapes.cubesOnCenterPoints({ centers: [[0, 0, 0], [20, 0, 0], [40, 0, 0]], size: 10 });
     * ```
     */
    cubesOnCenterPoints(inputs: Inputs.JSCAD.CubeCentersDto): Inputs.JSCAD.JSCADEntity[] {
        const resolved = resolveDto(Inputs.JSCAD.CubeCentersDto, inputs) as Resolved.JSCAD.CubeCentersDto;
        return resolved.centers.map(center => {
            return this.cube({ center, size: resolved.size });
        });
    }

    /**
     * Builds a box centered on `center` with `width` along X, `height` along Y and `length` along
     * Z, its faces parallel to the axes.
     * @param inputs - The center and the three side lengths
     * @returns The box solid
     * @group primitives
     * @shortname cuboid
     * @drawable true
     * @example
     * ```typescript
     * const box = await bitbybit.jscad.shapes.cuboid({ center: [0, 0, 0], width: 10, height: 5, length: 20 });
     * ```
     */
    cuboid(inputs: Inputs.JSCAD.CuboidDto): Inputs.JSCAD.JSCADEntity {
        const resolved = resolveDto(Inputs.JSCAD.CuboidDto, inputs) as Resolved.JSCAD.CuboidDto;
        return this.jscad.primitives.cuboid(
            {
                center: [resolved.center[0], resolved.center[1], resolved.center[2]],
                size: [resolved.width, resolved.height, resolved.length]
            }
        );
    }

    /**
     * Builds one box of the given `width`, `height` and `length` on every point of `centers`, in
     * the same order.
     * @param inputs - The center points and the three side lengths
     * @returns One box per center point
     * @group primitives on centers
     * @shortname cuboids
     * @drawable true
     * @example
     * ```typescript
     * const boxes = await bitbybit.jscad.shapes.cuboidsOnCenterPoints({ centers: [[0, 0, 0], [20, 0, 0]], width: 10, height: 5, length: 20 });
     * ```
     */
    cuboidsOnCenterPoints(inputs: Inputs.JSCAD.CuboidCentersDto): Inputs.JSCAD.JSCADEntity[] {
        const resolved = resolveDto(Inputs.JSCAD.CuboidCentersDto, inputs) as Resolved.JSCAD.CuboidCentersDto;
        return resolved.centers.map(center => {
            return this.cuboid({
                center,
                width: resolved.width,
                length: resolved.length,
                height: resolved.height
            });
        });
    }

    /**
     * Builds a cylinder with an elliptical cross-section whose radii can differ at the two ends,
     * standing along Z and centered on `center`.
     *
     * `startRadius` is the X and Y radius at the bottom end and `endRadius` at the top, so unequal
     * pairs make a tapered or cone-like solid; `height` is split evenly above and below `center`.
     * @param inputs - The center, the height, the two radius pairs and the segment count
     * @returns The elliptic cylinder solid
     * @group primitives
     * @shortname cylinder elliptic
     * @drawable true
     * @example
     * ```typescript
     * const cone = await bitbybit.jscad.shapes.cylinderElliptic({ center: [0, 0, 0], height: 10, startRadius: [4, 2], endRadius: [1, 0.5], segments: 32 });
     * ```
     */
    cylinderElliptic(inputs: Inputs.JSCAD.CylidnerEllipticDto): Inputs.JSCAD.JSCADEntity {
        const resolved = resolveDto(Inputs.JSCAD.CylidnerEllipticDto, inputs) as Resolved.JSCAD.CylidnerEllipticDto;
        return this.jscad.primitives.cylinderElliptic({
            center: [resolved.center[0], resolved.center[1], resolved.center[2]],
            height: resolved.height,
            startRadius: [resolved.startRadius[0], resolved.startRadius[1]],
            endRadius: [resolved.endRadius[0], resolved.endRadius[1]],
            segments: resolved.segments,
        });
    }

    /**
     * Builds one elliptic cylinder with the given radii and height on every point of `centers`, in
     * the same order, as `cylinderElliptic` does for one.
     * @param inputs - The center points, the height, the two radius pairs and the segment count
     * @returns One elliptic cylinder per center point
     * @group primitives on centers
     * @shortname cylinder elliptic
     * @drawable true
     * @example
     * ```typescript
     * const cones = await bitbybit.jscad.shapes.cylinderEllipticOnCenterPoints({ centers: [[0, 0, 0], [20, 0, 0]], height: 10, startRadius: [4, 2], endRadius: [1, 0.5], segments: 32 });
     * ```
     */
    cylinderEllipticOnCenterPoints(inputs: Inputs.JSCAD.CylidnerCentersEllipticDto): Inputs.JSCAD.JSCADEntity[] {
        const resolved = resolveDto(Inputs.JSCAD.CylidnerCentersEllipticDto, inputs) as Resolved.JSCAD.CylidnerCentersEllipticDto;
        return resolved.centers.map(center => {
            return this.cylinderElliptic({
                center,
                height: resolved.height,
                startRadius: resolved.startRadius,
                endRadius: resolved.endRadius,
                segments: resolved.segments
            });
        });
    }

    /**
     * Builds a round cylinder of the given `radius` standing along Z, with `height` split evenly
     * above and below `center`.
     *
     * `segments` is the number of flat sides around it; more makes it rounder.
     * @param inputs - The center, the height, the radius and the segment count
     * @returns The cylinder solid
     * @group primitives
     * @shortname cylinder
     * @drawable true
     * @example
     * ```typescript
     * const cylinder = await bitbybit.jscad.shapes.cylinder({ center: [0, 0, 0], height: 10, radius: 3, segments: 32 });
     * ```
     */
    cylinder(inputs: Inputs.JSCAD.CylidnerDto): Inputs.JSCAD.JSCADEntity {
        const resolved = resolveDto(Inputs.JSCAD.CylidnerDto, inputs) as Resolved.JSCAD.CylidnerDto;
        return this.jscad.primitives.cylinder({
            center: [resolved.center[0], resolved.center[1], resolved.center[2]],
            height: resolved.height,
            radius: resolved.radius,
            segments: resolved.segments,
        });
    }

    /**
     * Builds one cylinder of the given `radius` and `height` on every point of `centers`, in the
     * same order, as `cylinder` does for one.
     * @param inputs - The center points, the height, the radius and the segment count
     * @returns One cylinder per center point
     * @group primitives on centers
     * @shortname cylinder
     * @drawable true
     * @example
     * ```typescript
     * const posts = await bitbybit.jscad.shapes.cylindersOnCenterPoints({ centers: [[0, 0, 0], [20, 0, 0], [40, 0, 0]], height: 10, radius: 1, segments: 16 });
     * ```
     */
    cylindersOnCenterPoints(inputs: Inputs.JSCAD.CylidnerCentersDto): Inputs.JSCAD.JSCADEntity[] {
        const resolved = resolveDto(Inputs.JSCAD.CylidnerCentersDto, inputs) as Resolved.JSCAD.CylidnerCentersDto;
        return resolved.centers.map(center => {
            return this.cylinder({
                center,
                height: resolved.height,
                radius: resolved.radius,
                segments: resolved.segments
            });
        });
    }

    /**
     * Builds an ellipsoid, a sphere stretched separately along X, Y and Z, centered on `center`.
     *
     * `radius` holds the three half-sizes in `[x, y, z]` order; equal values make a sphere.
     * @param inputs - The center, the three radii and the segment count
     * @returns The ellipsoid solid
     * @group primitives
     * @shortname ellipsoid
     * @drawable true
     * @example
     * ```typescript
     * const egg = await bitbybit.jscad.shapes.ellipsoid({ center: [0, 0, 0], radius: [5, 3, 8], segments: 32 });
     * ```
     */
    ellipsoid(inputs: Inputs.JSCAD.EllipsoidDto): Inputs.JSCAD.JSCADEntity {
        const resolved = resolveDto(Inputs.JSCAD.EllipsoidDto, inputs) as Resolved.JSCAD.EllipsoidDto;
        return this.jscad.primitives.ellipsoid({
            center: [resolved.center[0], resolved.center[1], resolved.center[2]],
            radius: [resolved.radius[0], resolved.radius[1], resolved.radius[2]],
            segments: resolved.segments,
            axes: [
                [-1, 0, 0],
                [0, -1, 0],
                [0, 0, -1],
            ] as any,
        });
    }

    /**
     * Builds one ellipsoid with the given radii on every point of `centers`, in the same order, as
     * `ellipsoid` does for one.
     * @param inputs - The center points, the three radii and the segment count
     * @returns One ellipsoid per center point
     * @group primitives on centers
     * @shortname ellipsoid
     * @drawable true
     * @example
     * ```typescript
     * const eggs = await bitbybit.jscad.shapes.ellipsoidsOnCenterPoints({ centers: [[0, 0, 0], [20, 0, 0]], radius: [5, 3, 8], segments: 32 });
     * ```
     */
    ellipsoidsOnCenterPoints(inputs: Inputs.JSCAD.EllipsoidCentersDto): Inputs.JSCAD.JSCADEntity[] {
        const resolved = resolveDto(Inputs.JSCAD.EllipsoidCentersDto, inputs) as Resolved.JSCAD.EllipsoidCentersDto;
        return resolved.centers.map(center => {
            return this.ellipsoid({
                center,
                radius: resolved.radius,
                segments: resolved.segments
            });
        });
    }

    /**
     * Builds a sphere from evenly sized triangles, the way a geodesic dome is built, centered on
     * `center`.
     *
     * `frequency` is how finely the twenty starting faces are subdivided; it is used in whole
     * multiples of 6 and must be at least 6, and higher values give a rounder sphere.
     * @param inputs - The center, the radius and the subdivision frequency
     * @returns The geodesic sphere solid
     * @group primitives
     * @shortname geodesic sphere
     * @drawable true
     * @example
     * ```typescript
     * const dome = await bitbybit.jscad.shapes.geodesicSphere({ center: [0, 0, 0], radius: 5, frequency: 12 });
     * ```
     */
    geodesicSphere(inputs: Inputs.JSCAD.GeodesicSphereDto): Inputs.JSCAD.JSCADEntity {
        const resolved = resolveDto(Inputs.JSCAD.GeodesicSphereDto, inputs) as Resolved.JSCAD.GeodesicSphereDto;
        let sphere = this.jscad.primitives.geodesicSphere({ radius: resolved.radius, frequency: resolved.frequency });
        sphere = this.jscad.transforms.translate([resolved.center[0], resolved.center[1], resolved.center[2]], sphere);
        return sphere;
    }

    /**
     * Builds one geodesic sphere of the given `radius` on every point of `centers`, in the same
     * order, as `geodesicSphere` does for one.
     * @param inputs - The center points, the radius and the subdivision frequency
     * @returns One geodesic sphere per center point
     * @group primitives on centers
     * @shortname geodesic sphere
     * @drawable true
     * @example
     * ```typescript
     * const domes = await bitbybit.jscad.shapes.geodesicSpheresOnCenterPoints({ centers: [[0, 0, 0], [20, 0, 0]], radius: 5, frequency: 12 });
     * ```
     */
    geodesicSpheresOnCenterPoints(inputs: Inputs.JSCAD.GeodesicSphereCentersDto): Inputs.JSCAD.JSCADEntity[] {
        const resolved = resolveDto(Inputs.JSCAD.GeodesicSphereCentersDto, inputs) as Resolved.JSCAD.GeodesicSphereCentersDto;
        return resolved.centers.map(center => {
            return this.geodesicSphere({
                center,
                radius: resolved.radius,
                frequency: resolved.frequency
            });
        });
    }

    /**
     * Builds a box with all its edges and corners rounded by `roundRadius`, centered on `center`
     * with `width` along X, `height` along Y and `length` along Z.
     *
     * `roundRadius` must be less than half of the smallest side or an error is thrown; `segments`
     * sets how smoothly the rounding is faceted.
     * @param inputs - The center, the three side lengths, the rounding radius and the segment count
     * @returns The rounded box solid
     * @group primitives
     * @shortname rounded cuboid
     * @drawable true
     * @example
     * ```typescript
     * const soft = await bitbybit.jscad.shapes.roundedCuboid({ center: [0, 0, 0], width: 10, height: 5, length: 20, roundRadius: 1, segments: 16 });
     * ```
     */
    roundedCuboid(inputs: Inputs.JSCAD.RoundedCuboidDto): Inputs.JSCAD.JSCADEntity {
        const resolved = resolveDto(Inputs.JSCAD.RoundedCuboidDto, inputs) as Resolved.JSCAD.RoundedCuboidDto;
        return this.jscad.primitives.roundedCuboid({
            center: [resolved.center[0], resolved.center[1], resolved.center[2]],
            size: [resolved.width, resolved.height, resolved.length],
            roundRadius: resolved.roundRadius,
            segments: resolved.segments,
        });
    }

    /**
     * Builds one rounded box with the given sides and rounding on every point of `centers`, in the
     * same order, as `roundedCuboid` does for one.
     * @param inputs - The center points, the three side lengths, the rounding radius and the segment count
     * @returns One rounded box per center point
     * @group primitives on centers
     * @shortname rounded cuboid
     * @drawable true
     * @example
     * ```typescript
     * const softBoxes = await bitbybit.jscad.shapes.roundedCuboidsOnCenterPoints({ centers: [[0, 0, 0], [20, 0, 0]], width: 10, height: 5, length: 20, roundRadius: 1, segments: 16 });
     * ```
     */
    roundedCuboidsOnCenterPoints(inputs: Inputs.JSCAD.RoundedCuboidCentersDto): Inputs.JSCAD.JSCADEntity[] {
        const resolved = resolveDto(Inputs.JSCAD.RoundedCuboidCentersDto, inputs) as Resolved.JSCAD.RoundedCuboidCentersDto;
        return resolved.centers.map(center => {
            return this.roundedCuboid({
                center,
                width: resolved.width,
                height: resolved.height,
                length: resolved.length,
                roundRadius: resolved.roundRadius,
                segments: resolved.segments
            });
        });
    }

    /**
     * Builds a cylinder standing along Z whose two rims are rounded by `roundRadius`, with `height`
     * split evenly above and below `center`.
     *
     * `height` must be more than twice `roundRadius` or an error is thrown.
     * @param inputs - The center, the rounding radius, the height, the radius and the segment count
     * @returns The rounded cylinder solid
     * @group primitives
     * @shortname rounded cylinder
     * @drawable true
     * @example
     * ```typescript
     * const pill = await bitbybit.jscad.shapes.roundedCylinder({ center: [0, 0, 0], roundRadius: 1, height: 10, radius: 3, segments: 32 });
     * ```
     */
    roundedCylinder(inputs: Inputs.JSCAD.RoundedCylidnerDto): Inputs.JSCAD.JSCADEntity {
        const resolved = resolveDto(Inputs.JSCAD.RoundedCylidnerDto, inputs) as Resolved.JSCAD.RoundedCylidnerDto;
        return this.jscad.primitives.roundedCylinder({
            center: [resolved.center[0], resolved.center[1], resolved.center[2]],
            height: resolved.height,
            radius: resolved.radius,
            roundRadius: resolved.roundRadius,
            segments: resolved.segments,
        });
    }

    /**
     * Builds one rounded cylinder with the given size and rounding on every point of `centers`, in
     * the same order, as `roundedCylinder` does for one.
     * @param inputs - The center points, the rounding radius, the height, the radius and the segment count
     * @returns One rounded cylinder per center point
     * @group primitives on centers
     * @shortname rounded cylinder
     * @drawable true
     * @example
     * ```typescript
     * const pills = await bitbybit.jscad.shapes.roundedCylindersOnCenterPoints({ centers: [[0, 0, 0], [20, 0, 0]], roundRadius: 1, height: 10, radius: 3, segments: 32 });
     * ```
     */
    roundedCylindersOnCenterPoints(inputs: Inputs.JSCAD.RoundedCylidnerCentersDto): Inputs.JSCAD.JSCADEntity[] {
        const resolved = resolveDto(Inputs.JSCAD.RoundedCylidnerCentersDto, inputs) as Resolved.JSCAD.RoundedCylidnerCentersDto;
        return resolved.centers.map(center => {
            return this.roundedCylinder({
                center,
                radius: resolved.radius,
                roundRadius: resolved.roundRadius,
                segments: resolved.segments,
                height: resolved.height,
            });
        });
    }

    /**
     * Builds a sphere of the given `radius` centered on `center`; `segments` is the number of
     * facets around it, so more makes it rounder.
     * @param inputs - The center, the radius and the segment count
     * @returns The sphere solid
     * @group primitives
     * @shortname sphere
     * @drawable true
     * @example
     * ```typescript
     * const ball = await bitbybit.jscad.shapes.sphere({ center: [0, 0, 0], radius: 5, segments: 32 });
     * ```
     */
    sphere(inputs: Inputs.JSCAD.SphereDto): Inputs.JSCAD.JSCADEntity {
        const resolved = resolveDto(Inputs.JSCAD.SphereDto, inputs) as Resolved.JSCAD.SphereDto;
        return this.jscad.primitives.sphere(
            {
                center: [resolved.center[0], resolved.center[1], resolved.center[2]],
                radius: resolved.radius,
                segments: resolved.segments
            }
        );
    }

    /**
     * Builds one sphere of the given `radius` on every point of `centers`, in the same order, as
     * `sphere` does for one.
     * @param inputs - The center points, the radius and the segment count
     * @returns One sphere per center point
     * @group primitives on centers
     * @shortname sphere
     * @drawable true
     * @example
     * ```typescript
     * const balls = await bitbybit.jscad.shapes.spheresOnCenterPoints({ centers: [[0, 0, 0], [20, 0, 0], [40, 0, 0]], radius: 5, segments: 32 });
     * ```
     */
    spheresOnCenterPoints(inputs: Inputs.JSCAD.SphereCentersDto): Inputs.JSCAD.JSCADEntity[] {
        const resolved = resolveDto(Inputs.JSCAD.SphereCentersDto, inputs) as Resolved.JSCAD.SphereCentersDto;
        return resolved.centers.map(center => {
            return this.sphere({
                center,
                radius: resolved.radius,
                segments: resolved.segments,
            });
        });
    }

    /**
     * Builds a torus, a ring with a round cross-section, lying flat in the XY plane around `center`
     * with Z through its hole.
     *
     * `outerRadius` is the distance from the center to the middle of the tube and `innerRadius` the
     * tube's own radius, which must be smaller. Rotations and `startAngle` are in degrees; an
     * `outerRotation` below 360 leaves the ring open.
     * @param inputs - The center, the two radii, the two segment counts, the two rotations and the start angle
     * @returns The torus solid
     * @group primitives
     * @shortname torus
     * @drawable true
     * @example
     * ```typescript
     * const ring = await bitbybit.jscad.shapes.torus({ center: [0, 0, 0], innerRadius: 1, outerRadius: 5, innerSegments: 16, outerSegments: 48, innerRotation: 0, outerRotation: 360, startAngle: 0 });
     * ```
     */
    torus(inputs: Inputs.JSCAD.TorusDto): Inputs.JSCAD.JSCADEntity {
        const resolved = resolveDto(Inputs.JSCAD.TorusDto, inputs) as Resolved.JSCAD.TorusDto;
        const torus = this.jscad.primitives.torus({
            innerRadius: resolved.innerRadius,
            outerRadius: resolved.outerRadius,
            innerSegments: resolved.innerSegments,
            outerSegments: resolved.outerSegments,
            innerRotation: this.math.degToRad({ number: resolved.innerRotation }),
            outerRotation: this.math.degToRad({ number: resolved.outerRotation }),
            startAngle: this.math.degToRad({ number: resolved.startAngle }),
        });
        return this.jscad.transforms.translate([resolved.center[0], resolved.center[1], resolved.center[2]], torus);
    }

    /**
     * Builds a solid from its faces, each given as a list of points that go around the face.
     *
     * List the points of every face clockwise as seen from outside the solid; the faces must close
     * the solid for booleans to work on it. Each list is read in reverse order and the input is not
     * changed.
     * @param inputs - The faces as lists of points
     * @returns The solid
     * @group shapes
     * @shortname from polygon points
     * @drawable true
     * @example
     * ```typescript
     * const tetrahedron = await bitbybit.jscad.shapes.fromPolygonPoints({ polygonPoints: [
     *     [[0, 0, 0], [10, 0, 0], [0, 10, 0]],
     *     [[0, 0, 0], [0, 10, 0], [0, 0, 10]],
     *     [[0, 0, 0], [0, 0, 10], [10, 0, 0]],
     *     [[10, 0, 0], [0, 0, 10], [0, 10, 0]],
     * ] });
     * ```
     */
    fromPolygonPoints(inputs: Inputs.JSCAD.FromPolygonPoints): Inputs.JSCAD.JSCADEntity {
        const pts = inputs.polygonPoints.map(vertices => [...vertices].reverse());
        return this.jscad.geometries.geom3.fromPoints(pts);
    }
}
