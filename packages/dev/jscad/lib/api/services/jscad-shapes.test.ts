import { describe, it, expect, beforeAll } from "vitest";
import type * as Modeling from "@jscad/modeling";
import { getJscad } from "../__test__/kernel";
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
// A polyhedral sphere is inscribed in the true one, so it is a little smaller than 4/3 pi r^3.
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
            // Height is the Y span and length the Z span: these primitives are built to stand on
            // the ground plane, so depth runs along Z.
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
            const coarseSphere = jscad.shapes.geodesicSphere(coarse);
            const fineSphere = jscad.shapes.geodesicSphere(fine);

            // Assert
            expect(fineSphere.polygons.length).toBeGreaterThan(coarseSphere.polygons.length);
            expect(coarseSphere.polygons.length).toBeGreaterThan(CUBE_FACES);
            // Both are polyhedra inscribed in the sphere, so neither can be wider than the
            // diameter - and the finer one is the closer of the two.
            expect(spanOf(coarseSphere)).toBeLessThan(diameter);
            expect(spanOf(fineSphere)).toBeLessThanOrEqual(diameter);
            expect(spanOf(fineSphere)).toBeGreaterThan(spanOf(coarseSphere));
        });
    });
});
