import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as BABYLON from "@babylonjs/core";
import { createMockJSCADText, createMockVector, createMockWorkerManagers, type MockWorkerManagers } from "./__mocks__/test-helpers";
import { meshBuffersOf, triangleFaceLists } from "./__mocks__/mesh-buffers";
import { Context } from "./context";
import { DrawHelper } from "./draw-helper";
import type * as Inputs from "./inputs";

const FRONT_NORMALS = [0, 0, 1, 0, 0, 1, 0, 0, 1];
const BACK_NORMALS = [0, 0, -1, 0, 0, -1, 0, 0, -1];

const oneTriangle = (): Inputs.OCCT.DecomposedMeshBuffersDto => meshBuffersOf({ faceList: [triangleFaceLists(0, true)], edgeList: [], pointsList: [] });

const plain = (values: ArrayLike<number> | null): number[] => Array.from(values ?? [], value => value + 0);

describe("how the faces and back faces BabylonJS draws are wound", () => {
    let engine: BABYLON.NullEngine;
    let scene: BABYLON.Scene;
    let drawHelper: DrawHelper;
    let workers: MockWorkerManagers;

    beforeEach(() => {
        engine = new BABYLON.NullEngine();
        scene = new BABYLON.Scene(engine);
        const context = new Context();
        context.scene = scene;
        workers = createMockWorkerManagers();
        drawHelper = new DrawHelper(context, createMockJSCADText(), createMockVector(), workers.mockJscadWorkerManager, workers.mockManifoldWorkerManager, workers.mockOccWorkerManager);
    });

    afterEach(() => {
        scene.dispose();
        engine.dispose();
    });

    const surfacesOf = (drawn: BABYLON.Node): BABYLON.Mesh[] => drawn.getChildMeshes(false).filter((child): child is BABYLON.Mesh => child instanceof BABYLON.Mesh && child.getTotalIndices() > 0);
    const backOf = (drawn: BABYLON.Node): BABYLON.Mesh => {
        const backs = surfacesOf(drawn).filter(mesh => mesh.name.includes("backFace"));
        expect(backs).toHaveLength(1);
        return backs[0]!;
    };
    const frontOf = (drawn: BABYLON.Node): BABYLON.Mesh => {
        const fronts = surfacesOf(drawn).filter(mesh => !mesh.name.includes("backFace"));
        expect(fronts).toHaveLength(1);
        return fronts[0]!;
    };
    const windingOf = (mesh: BABYLON.Mesh): { indices: number[]; normals: number[] } => ({ indices: plain(mesh.getIndices()), normals: plain(mesh.getVerticesData(BABYLON.VertexBuffer.NormalKind)) });

    describe("an OCCT shape", () => {
        it("should wind the front triangle the other way for the left-handed scene and keep its normals", async () => {
            // Arrange
            workers.occtWorkerCall.mockResolvedValue(oneTriangle());

            // Act
            const drawn = await drawHelper.drawShape({ shape: { hash: 1, type: "occ-shape" }, drawEdges: false, drawTwoSided: true });

            // Assert
            expect(windingOf(frontOf(drawn))).toEqual({ indices: [0, 2, 1], normals: FRONT_NORMALS });
        });

        it("should draw the back of the triangle wound the other way with its normals turned round", async () => {
            // Arrange
            workers.occtWorkerCall.mockResolvedValue(oneTriangle());

            // Act
            const drawn = await drawHelper.drawShape({ shape: { hash: 1, type: "occ-shape" }, drawEdges: false, drawTwoSided: true });

            // Assert
            expect(windingOf(backOf(drawn))).toEqual({ indices: [0, 2, 1], normals: BACK_NORMALS });
        });

        it("should wind a surface redrawn in place the other way once, not twice", () => {
            // Arrange
            const part = { positions: [0, 0, 0, 1, 0, 0, 0, 1, 0], normals: FRONT_NORMALS, indices: [0, 1, 2] };
            const material = new BABYLON.PBRMetallicRoughnessMaterial("surface", scene);
            const first = drawHelper.createOrUpdateSurfacesMesh([part], undefined, true, material, true, false);

            // Act
            const redrawn = drawHelper.createOrUpdateSurfacesMesh([part], first, true, material, true, false);

            // Assert
            expect(windingOf(redrawn)).toEqual({ indices: [0, 2, 1], normals: FRONT_NORMALS });
        });
    });

    describe("a JSCAD mesh", () => {
        const IDENTITY: Inputs.JSCAD.JSCADMat4 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
        const jscadTriangle = (): { positions: number[]; normals: number[]; indices: number[]; transforms: number[] } => ({ positions: [0, 0, 0, 1, 0, 0, 0, 1, 0], normals: [], indices: [0, 1, 2], transforms: IDENTITY });
        const drawJscad = (sent = jscadTriangle()): Promise<BABYLON.Mesh> => {
            workers.jscadWorkerCall.mockResolvedValue(sent);
            return drawHelper.drawSolidOrPolygonMesh({ mesh: { polygons: [], transforms: IDENTITY }, drawTwoSided: true });
        };

        it("should wind the front triangle the other way with the normals worked out from the JSCAD winding, in either scene", async () => {
            // Arrange
            scene.useRightHandedSystem = true;
            const rightHanded = await drawJscad();
            scene.useRightHandedSystem = false;

            // Act
            const leftHanded = await drawJscad();

            // Assert
            expect(windingOf(rightHanded)).toEqual({ indices: [0, 2, 1], normals: FRONT_NORMALS });
            expect(windingOf(leftHanded)).toEqual({ indices: [0, 2, 1], normals: FRONT_NORMALS });
        });

        it("should wind the back triangle the way the front is wound and turn its normals round in a right-handed scene, whose back material culls the other side", async () => {
            // Arrange
            scene.useRightHandedSystem = true;

            // Act
            const back = backOf(await drawJscad());

            // Assert
            expect(windingOf(back)).toEqual({ indices: [0, 2, 1], normals: BACK_NORMALS });
            expect(back.material!.sideOrientation).toBe(BABYLON.Material.CounterClockWiseSideOrientation);
        });

        it("should keep the JSCAD winding for the back triangle and turn its normals round in a left-handed scene, whose back material culls as the front does", async () => {
            // Arrange
            scene.useRightHandedSystem = false;

            // Act
            const back = backOf(await drawJscad());

            // Assert
            expect(windingOf(back)).toEqual({ indices: [0, 1, 2], normals: BACK_NORMALS });
            expect(back.material!.sideOrientation).toBeNull();
        });

        it("should leave the mesh the worker sent as it was", async () => {
            // Arrange
            const sent = jscadTriangle();

            // Act
            await drawJscad(sent);

            // Assert
            expect(sent).toEqual(jscadTriangle());
        });
    });

    describe("a Manifold mesh", () => {
        it("should wind the front triangle the other way and take the back from the triangles the worker sent, wound the other way once, with its normals turned round", () => {
            // Arrange
            const mesh: Inputs.Manifold.DecomposedManifoldMeshDto = {
                numProp: 6,
                vertProperties: new Float32Array([0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1]),
                triVerts: new Uint32Array([0, 1, 2]),
            };

            // Act
            const drawn = drawHelper.drawManifoldMesh(mesh, { drawTwoSided: true })!;

            // Assert
            expect(windingOf(drawn)).toEqual({ indices: [2, 1, 0], normals: FRONT_NORMALS });
            expect(windingOf(backOf(drawn))).toEqual({ indices: [0, 2, 1], normals: BACK_NORMALS });
        });
    });
});
