import { describe, it, expect, beforeAll } from "vitest";
import type * as Modeling from "@jscad/modeling";
import { expectSolid, getJscad } from "../__test__/kernel";
import type { Jscad } from "../jscad-service";
import * as Inputs from "../inputs";

const CUBE_SIDE = 2;
const CUBE_VOLUME = 8;
const CUBE_SURFACE_AREA = 24;
const CUBE_FACES = 6;

const CUBOID_WIDTH = 2;
const CUBOID_LENGTH = 4;
const CUBOID_HEIGHT = 6;
const CUBOID_VOLUME = 48;

const SPHERE_RADIUS = 1;
const SPHERE_SEGMENTS = 64;
const SPHERE_VOLUME_TOLERANCE = 0.05;

const CYLINDER_RADIUS = 2;
const CYLINDER_HEIGHT = 5;
const CYLINDER_TOLERANCE = 0.2;

const TORUS_INNER_RADIUS = 1;
const TORUS_OUTER_RADIUS = 4;
const GEODESIC_FREQUENCY = 6;

const CENTRES: Inputs.Base.Point3[] = [[0, 0, 0], [10, 0, 0], [20, 0, 0]];
const ORIGIN: Inputs.Base.Point3 = [0, 0, 0];

describe("JSCADShapes", () => {
    let jscad: Jscad;
    let kernel: typeof Modeling;

    beforeAll(async () => {
        ({ jscad, kernel } = await getJscad());
    });

    describe("cube", () => {
        it("should build a cube of the given side, centred on its centre point", () => {
            // Arrange
            const inputs = new Inputs.JSCAD.CubeDto(ORIGIN, CUBE_SIDE);

            // Act
            const cube = jscad.shapes.cube(inputs);

            // Assert
            expect(kernel.measurements.measureVolume(cube)).toBeCloseTo(CUBE_VOLUME, 6);
            expect(kernel.measurements.measureArea(cube)).toBeCloseTo(CUBE_SURFACE_AREA, 6);
            expect(kernel.measurements.measureCenter(cube)).toEqual(ORIGIN);
        });

        it("should place a cube at a centre away from the origin", () => {
            // Arrange
            const centre: Inputs.Base.Point3 = [5, -3, 2];
            const inputs = new Inputs.JSCAD.CubeDto(centre, CUBE_SIDE);

            // Act
            const cube = jscad.shapes.cube(inputs);

            // Assert
            expect(kernel.measurements.measureCenter(cube)).toEqual(centre);
            expect(kernel.measurements.measureVolume(cube)).toBeCloseTo(CUBE_VOLUME, 6);
        });
    });

    describe("cubesOnCenterPoints", () => {
        it("should build one cube per centre point", () => {
            // Arrange
            const inputs = new Inputs.JSCAD.CubeCentersDto(CENTRES, CUBE_SIDE);

            // Act
            const cubes = jscad.shapes.cubesOnCenterPoints(inputs);

            // Assert
            expect(cubes).toHaveLength(CENTRES.length);
            for (const [index, cube] of cubes.entries()) {
                expect(kernel.measurements.measureCenter(cube)).toEqual(CENTRES[index]);
                expect(kernel.measurements.measureVolume(cube)).toBeCloseTo(CUBE_VOLUME, 6);
            }
        });
    });

    describe("cuboid", () => {
        it("should build a box whose volume is the product of its three sides", () => {
            // Arrange
            const inputs = new Inputs.JSCAD.CuboidDto(ORIGIN, CUBOID_WIDTH, CUBOID_LENGTH, CUBOID_HEIGHT);

            // Act
            const cuboid = jscad.shapes.cuboid(inputs);

            // Assert
            expect(kernel.measurements.measureVolume(cuboid)).toBeCloseTo(CUBOID_VOLUME, 6);
            const [min, max] = kernel.measurements.measureBoundingBox(cuboid);
            expect(max[0] - min[0]).toBeCloseTo(CUBOID_WIDTH, 6);
            expect(max[1] - min[1]).toBeCloseTo(CUBOID_HEIGHT, 6);
            expect(max[2] - min[2]).toBeCloseTo(CUBOID_LENGTH, 6);
        });
    });

    describe("sphere", () => {
        it("should build a sphere close to the analytic volume of its radius", () => {
            // Arrange
            const inputs = new Inputs.JSCAD.SphereDto(ORIGIN, SPHERE_RADIUS, SPHERE_SEGMENTS);
            const analyticVolume = (4 / 3) * Math.PI * SPHERE_RADIUS ** 3;

            // Act
            const sphere = jscad.shapes.sphere(inputs);

            // Assert
            const volume = kernel.measurements.measureVolume(sphere);
            expect(volume).toBeLessThan(analyticVolume);
            expect(analyticVolume - volume).toBeLessThan(SPHERE_VOLUME_TOLERANCE);
        });
    });

    describe("cylinder", () => {
        it("should build a cylinder close to the analytic volume of its radius and height", () => {
            // Arrange
            const inputs = new Inputs.JSCAD.CylidnerDto(ORIGIN, CYLINDER_HEIGHT, CYLINDER_RADIUS, SPHERE_SEGMENTS);
            const analyticVolume = Math.PI * CYLINDER_RADIUS ** 2 * CYLINDER_HEIGHT;

            // Act
            const cylinder = jscad.shapes.cylinder(inputs);

            // Assert
            const volume = kernel.measurements.measureVolume(cylinder);
            expect(analyticVolume - volume).toBeLessThan(CYLINDER_TOLERANCE);
            const [min, max] = kernel.measurements.measureBoundingBox(cylinder);
            expect(max[2] - min[2]).toBeCloseTo(CYLINDER_HEIGHT, 6);
        });
    });

    describe("torus", () => {
        it("should span twice the outer radius plus the inner one in the plane", () => {
            // Arrange
            const inputs = new Inputs.JSCAD.TorusDto(ORIGIN, TORUS_INNER_RADIUS, TORUS_OUTER_RADIUS);

            // Act
            const torus = jscad.shapes.torus(inputs);

            // Assert
            const [min, max] = kernel.measurements.measureBoundingBox(torus);
            const span = 2 * (TORUS_OUTER_RADIUS + TORUS_INNER_RADIUS);
            expect(max[0] - min[0]).toBeCloseTo(span, 1);
            expect(max[2] - min[2]).toBeCloseTo(2 * TORUS_INNER_RADIUS, 1);
        });
    });

    describe("geodesicSphere", () => {
        it("should approach the true sphere as its frequency rises", () => {
            // Arrange
            const coarse = new Inputs.JSCAD.GeodesicSphereDto(ORIGIN, SPHERE_RADIUS, GEODESIC_FREQUENCY);
            const fine = new Inputs.JSCAD.GeodesicSphereDto(ORIGIN, SPHERE_RADIUS, GEODESIC_FREQUENCY * 2);
            const diameter = 2 * SPHERE_RADIUS;
            const spanOf = (shape: Inputs.JSCAD.JSCADEntity): number => {
                const [min, max] = kernel.measurements.measureBoundingBox(shape);
                return max[0] - min[0];
            };

            // Act
            const coarseSphere = expectSolid(jscad.shapes.geodesicSphere(coarse));
            const fineSphere = expectSolid(jscad.shapes.geodesicSphere(fine));

            // Assert
            expect(fineSphere.polygons.length).toBeGreaterThan(coarseSphere.polygons.length);
            expect(coarseSphere.polygons.length).toBeGreaterThan(CUBE_FACES);
            expect(spanOf(coarseSphere)).toBeLessThan(diameter);
            expect(spanOf(fineSphere)).toBeLessThanOrEqual(diameter);
            expect(spanOf(fineSphere)).toBeGreaterThan(spanOf(coarseSphere));
        });
    });

    describe("the remaining primitives", () => {
        it("should build an elliptic cylinder wider in one direction than the other", () => {
            // Act
            const shape = expectSolid(jscad.shapes.cylinderElliptic(
                new Inputs.JSCAD.CylidnerEllipticDto([0, 0, 0], CYLINDER_HEIGHT, [4, 2], [4, 2], 32)));
            const [min, max] = kernel.measurements.measureBoundingBox(shape);

            expect(max[0] - min[0]).toBeCloseTo(8, 1);
            expect(max[1] - min[1]).toBeCloseTo(4, 1);
            expect(max[2] - min[2]).toBeCloseTo(CYLINDER_HEIGHT, 5);
        });

        it("should build an ellipsoid wider in one direction than the other", () => {
            // Act
            const shape = expectSolid(jscad.shapes.ellipsoid(new Inputs.JSCAD.EllipsoidDto([0, 0, 0], [4, 2, 2], 32)));
            const [min, max] = kernel.measurements.measureBoundingBox(shape);

            // Assert
            expect(max[0] - min[0]).toBeGreaterThan(max[1] - min[1]);
        });

        it("should build a rounded cuboid that stays within the box it was given", () => {
            // Act
            const shape = expectSolid(jscad.shapes.roundedCuboid(
                new Inputs.JSCAD.RoundedCuboidDto([0, 0, 0], 0.5, CUBOID_WIDTH, CUBOID_LENGTH, CUBOID_HEIGHT, 8)));
            const [min, max] = kernel.measurements.measureBoundingBox(shape);

            // Assert
            expect(max[0] - min[0]).toBeCloseTo(CUBOID_WIDTH, 5);
            expect(kernel.measurements.measureVolume(shape)).toBeLessThan(CUBOID_VOLUME);
        });

        it("should build a rounded cylinder of less volume than the square edged one", () => {
            // Act
            const rounded = expectSolid(jscad.shapes.roundedCylinder(
                new Inputs.JSCAD.RoundedCylidnerDto([0, 0, 0], 0.5, CYLINDER_HEIGHT, CYLINDER_RADIUS, 32)));
            const square = expectSolid(jscad.shapes.cylinder(
                new Inputs.JSCAD.CylidnerDto([0, 0, 0], CYLINDER_HEIGHT, CYLINDER_RADIUS, 32)));

            // Assert
            expect(kernel.measurements.measureVolume(rounded)).toBeLessThan(kernel.measurements.measureVolume(square));
        });

        it("should build a solid from the polygon points it was given", () => {
            const points: Inputs.Base.Point3[][] = [
                [[0, 0, 0], [1, 0, 0], [0, 1, 0]],
                [[0, 0, 0], [0, 1, 0], [0, 0, 1]],
                [[0, 0, 0], [0, 0, 1], [1, 0, 0]],
                [[1, 0, 0], [0, 0, 1], [0, 1, 0]],
            ];

            // Act
            const shape = expectSolid(jscad.shapes.fromPolygonPoints(new Inputs.JSCAD.FromPolygonPoints(points)));

            // Assert
            expect(shape.polygons).toHaveLength(4);
        });
    });

    describe("the primitives placed on centre points", () => {
        it("should build one cuboid per centre", () => {
            // Act
            const shapes = jscad.shapes.cuboidsOnCenterPoints(
                new Inputs.JSCAD.CuboidCentersDto(CENTRES, CUBOID_WIDTH, CUBOID_LENGTH, CUBOID_HEIGHT));

            // Assert
            expect(shapes).toHaveLength(CENTRES.length);
            expect(kernel.measurements.measureVolume(expectSolid(shapes[0]!))).toBeCloseTo(CUBOID_VOLUME, 5);
        });

        it("should build one elliptic cylinder per centre", () => {
            // Act
            const shapes = jscad.shapes.cylinderEllipticOnCenterPoints(
                new Inputs.JSCAD.CylidnerCentersEllipticDto(CENTRES, CYLINDER_HEIGHT, [4, 2], [4, 2], 32));

            // Assert
            expect(shapes).toHaveLength(CENTRES.length);
        });

        it("should build one cylinder per centre", () => {
            // Act
            const shapes = jscad.shapes.cylindersOnCenterPoints(
                new Inputs.JSCAD.CylidnerCentersDto(CENTRES, CYLINDER_HEIGHT, CYLINDER_RADIUS, 32));

            // Assert
            expect(shapes).toHaveLength(CENTRES.length);
        });

        it("should build one ellipsoid per centre", () => {
            // Act
            const shapes = jscad.shapes.ellipsoidsOnCenterPoints(
                new Inputs.JSCAD.EllipsoidCentersDto(CENTRES, [4, 2, 2], 32));

            // Assert
            expect(shapes).toHaveLength(CENTRES.length);
        });

        it("should build one geodesic sphere per centre", () => {
            // Act
            const shapes = jscad.shapes.geodesicSpheresOnCenterPoints(
                new Inputs.JSCAD.GeodesicSphereCentersDto(CENTRES, SPHERE_RADIUS, GEODESIC_FREQUENCY));

            // Assert
            expect(shapes).toHaveLength(CENTRES.length);
        });

        it("should build one rounded cuboid per centre", () => {
            // Act
            const shapes = jscad.shapes.roundedCuboidsOnCenterPoints(
                new Inputs.JSCAD.RoundedCuboidCentersDto(CENTRES, 0.5, CUBOID_WIDTH, CUBOID_LENGTH, CUBOID_HEIGHT, 8));

            // Assert
            expect(shapes).toHaveLength(CENTRES.length);
        });

        it("should build one rounded cylinder per centre", () => {
            // Act
            const shapes = jscad.shapes.roundedCylindersOnCenterPoints(
                new Inputs.JSCAD.RoundedCylidnerCentersDto(CENTRES, 0.5, CYLINDER_HEIGHT, CYLINDER_RADIUS, 32));

            // Assert
            expect(shapes).toHaveLength(CENTRES.length);
        });

        it("should build one sphere per centre", () => {
            // Act
            const shapes = jscad.shapes.spheresOnCenterPoints(
                new Inputs.JSCAD.SphereCentersDto(CENTRES, SPHERE_RADIUS, SPHERE_SEGMENTS));

            // Assert
            expect(shapes).toHaveLength(CENTRES.length);
        });

        it("should place each shape at the centre it was given", () => {
            // Act
            const shapes = jscad.shapes.spheresOnCenterPoints(
                new Inputs.JSCAD.SphereCentersDto(CENTRES, SPHERE_RADIUS, SPHERE_SEGMENTS));
            const centres = shapes.map((shape) => {
                const [min, max] = kernel.measurements.measureBoundingBox(shape);
                return (min[0] + max[0]) / 2;
            });

            // Assert
            expect(centres.map((x) => Math.round(x))).toEqual(CENTRES.map((centre) => centre[0]));
        });
    });
});
