import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as pc from "playcanvas";
import { GeometryHelper, MathBitByBit, Vector } from "@bitbybit-dev/base";
import { JSCADText } from "@bitbybit-dev/jscad-worker";
import { createMockWorkerManagers, type MockWorkerManagers } from "./__mocks__/test-helpers";
import { meshBuffersOf, triangleFaceLists } from "./__mocks__/mesh-buffers";
import { Context } from "./context";
import { DrawHelper } from "./draw-helper";
import type * as Inputs from "./inputs";

const FRONT_NORMALS = [0, 0, 1, 0, 0, 1, 0, 0, 1];
const BACK_NORMALS = [0, 0, -1, 0, 0, -1, 0, 0, -1];

const oneTriangle = (): Inputs.OCCT.DecomposedMeshBuffersDto => meshBuffersOf({ faceList: [triangleFaceLists(0, true)], edgeList: [], pointsList: [] });

describe("how the faces and back faces PlayCanvas draws are wound", () => {
    let app: pc.AppBase;
    let drawHelper: DrawHelper;
    let workers: MockWorkerManagers;

    beforeEach(() => {
        const canvas = document.createElement("canvas");
        const device = new pc.NullGraphicsDevice(canvas);
        app = new pc.AppBase(canvas);
        const appOptions = new pc.AppOptions();
        appOptions.graphicsDevice = device;
        appOptions.componentSystems = [pc.RenderComponentSystem];
        app.init(appOptions);
        const context = new Context();
        context.app = app;
        context.scene = app.root;
        workers = createMockWorkerManagers();
        drawHelper = new DrawHelper(context, new JSCADText(workers.mockJscadWorkerManager), new Vector(new MathBitByBit(), new GeometryHelper()), workers.mockJscadWorkerManager, workers.mockManifoldWorkerManager, workers.mockOccWorkerManager);
    });

    afterEach(() => {
        app.destroy();
    });

    const surfacesOf = (drawn: pc.GraphNode): { name: string; mesh: pc.Mesh }[] => {
        const found: { name: string; mesh: pc.Mesh }[] = [];
        const walk = (node: pc.GraphNode): void => {
            const entity = node as pc.Entity;
            (entity.render?.meshInstances ?? []).forEach(instance => found.push({ name: node.name, mesh: instance.mesh }));
            node.children.forEach(walk);
        };
        walk(drawn);
        return found;
    };
    const windingOf = (mesh: pc.Mesh): { indices: number[]; normals: number[] } => {
        const indices: number[] = [];
        const normals: number[] = [];
        mesh.getIndices(indices);
        mesh.getNormals(normals);
        return { indices, normals: normals.map(value => value + 0) };
    };
    const sidesOf = (drawn: pc.GraphNode): { front: pc.Mesh; back: pc.Mesh } => {
        const surfaces = surfacesOf(drawn);
        expect(surfaces).toHaveLength(2);
        return { front: surfaces.find(surface => !surface.name.includes("backFace"))!.mesh, back: surfaces.find(surface => surface.name.includes("backFace"))!.mesh };
    };

    it("should draw the front of an OCCT triangle as the worker winds it and its back wound the other way with the normals turned round", async () => {
        // Arrange
        workers.occtWorkerCall.mockResolvedValue(oneTriangle());

        // Act
        const drawn = await drawHelper.drawShape({ shape: { hash: 1, type: "occ-shape" }, drawEdges: false, drawTwoSided: true });

        // Assert
        const { front, back } = sidesOf(drawn);
        expect(windingOf(front)).toEqual({ indices: [0, 1, 2], normals: FRONT_NORMALS });
        expect(windingOf(back)).toEqual({ indices: [0, 2, 1], normals: BACK_NORMALS });
    });

    it("should draw the front of a Manifold triangle as the worker winds it and its back wound the other way with the normals turned round", () => {
        // Arrange
        const mesh: Inputs.Manifold.DecomposedManifoldMeshDto = {
            numProp: 6,
            vertProperties: new Float32Array([0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1]),
            triVerts: new Uint32Array([0, 1, 2]),
        };

        // Act
        const drawn = drawHelper.drawManifoldMesh(mesh, { drawTwoSided: true })!;

        // Assert
        const { front, back } = sidesOf(drawn);
        expect(windingOf(front)).toEqual({ indices: [0, 1, 2], normals: FRONT_NORMALS });
        expect(windingOf(back)).toEqual({ indices: [0, 2, 1], normals: BACK_NORMALS });
    });
});
