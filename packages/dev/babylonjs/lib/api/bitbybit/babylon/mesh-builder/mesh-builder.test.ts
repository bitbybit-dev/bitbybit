import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as BABYLON from "@babylonjs/core";
import { createHeadlessScene, addShadowGenerator, HeadlessScene } from "../../../__test__/headless";
import { BabylonMeshBuilder } from "./mesh-builder";
import { BabylonMesh } from "../mesh";
import * as Inputs from "../../../inputs";

const SQUARE: Inputs.Base.Vector3[] = [[-2, 0, -2], [2, 0, -2], [2, 0, 2], [-2, 0, 2]];
const PATH: Inputs.Base.Vector3[] = [[0, 0, 0], [0, 5, 0]];
const PROFILE: Inputs.Base.Vector3[] = [[1, 0, 0], [1, 5, 0]];

describe("BabylonMeshBuilder", () => {
    let headless: HeadlessScene;
    let builder: BabylonMeshBuilder;

    const spanOf = (mesh: BABYLON.Mesh, axis: 0 | 1 | 2): number => {
        mesh.computeWorldMatrix(true);
        const box = mesh.getBoundingInfo().boundingBox;
        return box.maximumWorld.asArray()[axis] - box.minimumWorld.asArray()[axis];
    };

    beforeEach(() => {
        headless = createHeadlessScene();
        builder = new BabylonMeshBuilder(headless.context, new BabylonMesh(headless.context));
    });

    afterEach(() => {
        headless.dispose();
    });

    describe("createBox", () => {
        it("should build a box of the width, height and depth it was given", () => {
            // Act
            const mesh = builder.createBox(new Inputs.BabylonMeshBuilder.CreateBoxDto(2, 4, 6));

            // Assert
            expect(spanOf(mesh, 0)).toBeCloseTo(2, 5);
            expect(spanOf(mesh, 1)).toBeCloseTo(6, 5);
            expect(spanOf(mesh, 2)).toBeCloseTo(4, 5);
        });

        it("should build it two sided when asked to", () => {
            // Act
            const oneSided = builder.createBox(new Inputs.BabylonMeshBuilder.CreateBoxDto(2, 2, 2, Inputs.BabylonMesh.sideOrientationEnum.frontside));
            const twoSided = builder.createBox(new Inputs.BabylonMeshBuilder.CreateBoxDto(2, 2, 2, Inputs.BabylonMesh.sideOrientationEnum.doubleside));

            // Assert
            expect(twoSided.getTotalVertices()).toBeGreaterThan(oneSided.getTotalVertices());
        });
    });

    describe("createCube", () => {
        it("should build a cube of the size it was given", () => {
            // Act
            const mesh = builder.createCube(new Inputs.BabylonMeshBuilder.CreateCubeDto(3));

            // Assert
            expect(spanOf(mesh, 0)).toBeCloseTo(3, 5);
            expect(spanOf(mesh, 1)).toBeCloseTo(3, 5);
        });
    });

    describe("createSquarePlane", () => {
        it("should build a flat square of the size it was given", () => {
            // Act
            const mesh = builder.createSquarePlane(new Inputs.BabylonMeshBuilder.CreateSquarePlaneDto(4));

            // Assert
            expect(spanOf(mesh, 0)).toBeCloseTo(4, 5);
            expect(spanOf(mesh, 2)).toBeCloseTo(0, 5);
        });
    });

    describe("createRectanglePlane", () => {
        it("should build a flat rectangle of the width and height it was given", () => {
            // Act
            const mesh = builder.createRectanglePlane(new Inputs.BabylonMeshBuilder.CreateRectanglePlaneDto(6, 2));

            // Assert
            expect(spanOf(mesh, 0)).toBeCloseTo(6, 5);
            expect(spanOf(mesh, 1)).toBeCloseTo(2, 5);
        });
    });

    describe("createSphere", () => {
        it("should build a sphere of the diameter it was given", () => {
            // Act
            const mesh = builder.createSphere(new Inputs.BabylonMeshBuilder.CreateSphereDto(4, 32));

            // Assert
            expect(spanOf(mesh, 0)).toBeCloseTo(4, 1);
        });

        it("should build a finer sphere from more segments", () => {
            // Act
            const coarse = builder.createSphere(new Inputs.BabylonMeshBuilder.CreateSphereDto(4, 8));
            const fine = builder.createSphere(new Inputs.BabylonMeshBuilder.CreateSphereDto(4, 32));

            // Assert
            expect(fine.getTotalVertices()).toBeGreaterThan(coarse.getTotalVertices());
        });
    });

    describe("createIcoSphere", () => {
        it("should build a sphere of the radius it was given", () => {
            // Act
            const mesh = builder.createIcoSphere(new Inputs.BabylonMeshBuilder.CreateIcoSphereDto(2, 1, 1, 1, false, 4));

            expect(spanOf(mesh, 0)).toBeCloseTo(2, 0);
        });
    });

    describe("createDisc", () => {
        it("should build a flat disc of the radius it was given", () => {
            // Act
            const mesh = builder.createDisc(new Inputs.BabylonMeshBuilder.CreateDiscDto(3, 64));

            // Assert
            expect(spanOf(mesh, 0)).toBeCloseTo(6, 1);
            expect(spanOf(mesh, 2)).toBeCloseTo(0, 5);
        });
    });

    describe("createTorus", () => {
        it("should build a ring of the diameter it was given", () => {
            // Act
            const mesh = builder.createTorus(new Inputs.BabylonMeshBuilder.CreateTorusDto(6, 1, 32));

            expect(spanOf(mesh, 0)).toBeCloseTo(7, 0);
        });
    });

    describe("createTorusKnot", () => {
        it("should build a knot that has volume in every direction", () => {
            // Act
            const mesh = builder.createTorusKnot(new Inputs.BabylonMeshBuilder.CreateTorusKnotDto(2, 0.5, 64, 16, 2, 3));

            // Assert
            expect(spanOf(mesh, 0)).toBeGreaterThan(0);
            expect(spanOf(mesh, 2)).toBeGreaterThan(0);
        });
    });

    describe("createPolygon", () => {
        it("should build a flat face through the shape it was given", () => {
            // Act
            const mesh = builder.createPolygon(new Inputs.BabylonMeshBuilder.CreatePolygonDto(SQUARE));

            // Assert
            expect(spanOf(mesh, 0)).toBeCloseTo(4, 5);
            expect(spanOf(mesh, 2)).toBeCloseTo(4, 5);
        });

        it("should build a face with a hole in it when given one", () => {
            // Arrange
            const hole: Inputs.Base.Vector3[][] = [[[-1, 0, -1], [1, 0, -1], [1, 0, 1], [-1, 0, 1]]];

            // Act
            const solid = builder.createPolygon(new Inputs.BabylonMeshBuilder.CreatePolygonDto(SQUARE));
            const holed = builder.createPolygon(new Inputs.BabylonMeshBuilder.CreatePolygonDto(SQUARE, hole));

            // Assert
            expect(holed.getTotalVertices()).toBeGreaterThan(solid.getTotalVertices());
        });
    });

    describe("extrudePolygon", () => {
        it("should raise the shape to the depth it was given", () => {
            // Act
            const mesh = builder.extrudePolygon(new Inputs.BabylonMeshBuilder.ExtrudePolygonDto(SQUARE, [], 3));

            // Assert
            expect(spanOf(mesh, 1)).toBeCloseTo(3, 5);
        });
    });

    describe("createTube", () => {
        it("should follow the path it was given", () => {
            // Act
            const mesh = builder.createTube(new Inputs.BabylonMeshBuilder.CreateTubeDto(PATH, 1, 16));

            // Assert
            expect(spanOf(mesh, 1)).toBeCloseTo(5, 0);
        });
    });

    describe("createPolyhedron", () => {
        it("should build the solid the type names", () => {
            // Act
            const mesh = builder.createPolyhedron(new Inputs.BabylonMeshBuilder.CreatePolyhedronDto(2, 3));

            // Assert
            expect(mesh.getTotalVertices()).toBeGreaterThan(0);
        });
    });

    describe("createGeodesic", () => {
        it("should build a sphere of the size it was given", () => {
            // Act
            const mesh = builder.createGeodesic(new Inputs.BabylonMeshBuilder.CreateGeodesicDto(2, 1, 3));

            // Assert
            expect(spanOf(mesh, 0)).toBeGreaterThan(0);
        });
    });

    describe("createGoldberg", () => {
        it("should build a sphere of the size it was given", () => {
            // Act
            const mesh = builder.createGoldberg(new Inputs.BabylonMeshBuilder.CreateGoldbergDto(2, 1, 3));

            // Assert
            expect(spanOf(mesh, 0)).toBeGreaterThan(0);
        });
    });

    describe("createCapsule", () => {
        it("should build a capsule as tall as the height and radius it was given", () => {
            // Act
            const mesh = builder.createCapsule(new Inputs.BabylonMeshBuilder.CreateCapsuleDto([0, 1, 0], 2, 16, 4, 1));

            expect(spanOf(mesh, 1)).toBeCloseTo(4, 0);
        });
    });

    describe("createCylinder", () => {
        it("should build a cylinder of the height and diameters it was given", () => {
            // Act
            const mesh = builder.createCylinder(new Inputs.BabylonMeshBuilder.CreateCylinderDto(5, 2, 2, 32));

            // Assert
            expect(spanOf(mesh, 1)).toBeCloseTo(5, 5);
            expect(spanOf(mesh, 0)).toBeCloseTo(2, 0);
        });

        it("should build a cone when the top diameter is nothing", () => {
            // Act
            const mesh = builder.createCylinder(new Inputs.BabylonMeshBuilder.CreateCylinderDto(5, 0, 4, 32));

            // Assert
            expect(spanOf(mesh, 0)).toBeCloseTo(4, 0);
        });
    });

    describe("createExtrudedSahpe", () => {
        it("should sweep the shape along the path it was given", () => {
            // Act
            const mesh = builder.createExtrudedSahpe(new Inputs.BabylonMeshBuilder.CreateExtrudedShapeDto(SQUARE, PATH, 1, 0, 1));

            expect(spanOf(mesh, 1)).toBeCloseTo(9, 0);
        });
    });

    describe("createRibbon", () => {
        it("should build a surface across the paths it was given", () => {
            // Arrange
            const pathArray: Inputs.Base.Vector3[][] = [
                [[0, 0, 0], [4, 0, 0]],
                [[0, 0, 4], [4, 0, 4]],
            ];

            // Act
            const mesh = builder.createRibbon(new Inputs.BabylonMeshBuilder.CreateRibbonDto(pathArray));

            // Assert
            expect(spanOf(mesh, 0)).toBeCloseTo(4, 5);
            expect(spanOf(mesh, 2)).toBeCloseTo(4, 5);
        });
    });

    describe("createLathe", () => {
        it("should turn the profile into a solid of revolution", () => {
            // Act
            const mesh = builder.createLathe(new Inputs.BabylonMeshBuilder.CreateLatheDto(PROFILE, 1, 32));

            // Assert
            expect(spanOf(mesh, 0)).toBeGreaterThan(0);
            expect(spanOf(mesh, 1)).toBeCloseTo(5, 0);
        });
    });

    describe("createGround", () => {
        it("should build a flat ground of the width and height it was given", () => {
            // Act
            const mesh = builder.createGround(new Inputs.BabylonMeshBuilder.CreateGroundDto(10, 6, 2, 2));

            // Assert
            expect(spanOf(mesh, 0)).toBeCloseTo(10, 5);
            expect(spanOf(mesh, 2)).toBeCloseTo(6, 5);
            expect(spanOf(mesh, 1)).toBeCloseTo(0, 5);
        });
    });

    describe("shadows", () => {
        const BUILDERS: [string, (builder: BabylonMeshBuilder, enableShadows: boolean) => BABYLON.Mesh][] = [
            ["createBox", (b, s) => b.createBox(new Inputs.BabylonMeshBuilder.CreateBoxDto(1, 1, 1, undefined, s))],
            ["createCube", (b, s) => b.createCube(new Inputs.BabylonMeshBuilder.CreateCubeDto(1, undefined, s))],
            ["createSquarePlane", (b, s) => b.createSquarePlane(new Inputs.BabylonMeshBuilder.CreateSquarePlaneDto(1, undefined, s))],
            ["createRectanglePlane", (b, s) => b.createRectanglePlane(new Inputs.BabylonMeshBuilder.CreateRectanglePlaneDto(1, 1, undefined, s))],
            ["createSphere", (b, s) => b.createSphere(new Inputs.BabylonMeshBuilder.CreateSphereDto(1, 8, undefined, s))],
            ["createIcoSphere", (b, s) => b.createIcoSphere(new Inputs.BabylonMeshBuilder.CreateIcoSphereDto(1, 1, 1, 1, false, 2, undefined, s))],
            ["createDisc", (b, s) => b.createDisc(new Inputs.BabylonMeshBuilder.CreateDiscDto(1, 16, undefined, s))],
            ["createTorus", (b, s) => b.createTorus(new Inputs.BabylonMeshBuilder.CreateTorusDto(2, 0.5, 16, undefined, s))],
            ["createTorusKnot", (b, s) => b.createTorusKnot(new Inputs.BabylonMeshBuilder.CreateTorusKnotDto(1, 0.2, 32, 8, 2, 3, undefined, s))],
            ["createPolygon", (b, s) => b.createPolygon(new Inputs.BabylonMeshBuilder.CreatePolygonDto(SQUARE, [], 1, 2, undefined, false, s))],
            ["extrudePolygon", (b, s) => b.extrudePolygon(new Inputs.BabylonMeshBuilder.ExtrudePolygonDto(SQUARE, [], 1, undefined, false, s))],
            ["createTube", (b, s) => b.createTube(new Inputs.BabylonMeshBuilder.CreateTubeDto(PATH, 0.5, 8, 3, 1, undefined, s))],
            ["createPolyhedron", (b, s) => b.createPolyhedron(new Inputs.BabylonMeshBuilder.CreatePolyhedronDto(1, 0, undefined, undefined, undefined, undefined, false, undefined, s))],
            ["createGeodesic", (b, s) => b.createGeodesic(new Inputs.BabylonMeshBuilder.CreateGeodesicDto(1, 1, 1, undefined, undefined, undefined, false, 1, undefined, s))],
            ["createGoldberg", (b, s) => b.createGoldberg(new Inputs.BabylonMeshBuilder.CreateGoldbergDto(1, 1, 1, undefined, undefined, undefined, undefined, s))],
            ["createCapsule", (b, s) => b.createCapsule(new Inputs.BabylonMeshBuilder.CreateCapsuleDto([0, 1, 0], 2, 8, 2, 0.5, 1, 0.5, 0.5, 1, 1, undefined, s))],
            ["createCylinder", (b, s) => b.createCylinder(new Inputs.BabylonMeshBuilder.CreateCylinderDto(2, 1, 1, 16, 1, undefined, s))],
            ["createExtrudedSahpe", (b, s) => b.createExtrudedSahpe(new Inputs.BabylonMeshBuilder.CreateExtrudedShapeDto(SQUARE, PATH, 1, 0, 1, undefined, s))],
            ["createRibbon", (b, s) => b.createRibbon(new Inputs.BabylonMeshBuilder.CreateRibbonDto([[[0, 0, 0], [1, 0, 0]], [[0, 0, 1], [1, 0, 1]]], false, false, 0, false, undefined, s))],
            ["createLathe", (b, s) => b.createLathe(new Inputs.BabylonMeshBuilder.CreateLatheDto(PROFILE, 1, 16, 360, false, undefined, s))],
            ["createGround", (b, s) => b.createGround(new Inputs.BabylonMeshBuilder.CreateGroundDto(2, 2, 1, 1, undefined, s))],
        ];

        it.each(BUILDERS)("%s should join every shadow generator when asked to cast shadows", (_name, build) => {
            // Arrange
            const generator = addShadowGenerator(headless.scene);

            // Act
            const mesh = build(builder, true);

            // Assert
            expect(mesh.receiveShadows).toBe(true);
            expect(generator.getShadowMap()!.renderList).toContain(mesh);
        });

        it.each(BUILDERS)("%s should mark a mesh that asked for none so the drawing leaves it out", (_name, build) => {
            // Arrange
            addShadowGenerator(headless.scene);

            // Act
            const mesh = build(builder, false);

            // Assert
            expect(mesh.metadata).toEqual({ shadows: false });
            expect(mesh.receiveShadows).toBe(false);
        });
    });
});
