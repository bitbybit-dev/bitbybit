import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import * as pc from "playcanvas";
import { GeometryHelper, MathBitByBit, Vector } from "@bitbybit-dev/base";
import type { JSCADText } from "@bitbybit-dev/jscad-worker";
import { createMockWorkerManagers, type MockWorkerManagers } from "./__mocks__/test-helpers";
import { Context } from "./context";
import { DrawHelper } from "./draw-helper";
import type * as Inputs from "./inputs";

const REDRAWS = 50;
const FLOATS_PER_MATRIX = 16;
const TRANSLATION_AT = 12;

describe("PlayCanvas drawing redrawn again and again", () => {
    let app: pc.AppBase;
    let device: pc.NullGraphicsDevice;
    let context: Context;
    let workers: MockWorkerManagers;
    let drawHelper: DrawHelper;

    const labelText: Partial<JSCADText> = { createVectorText: vi.fn().mockResolvedValue([[[0, 0], [1, 0]]]) };

    beforeEach(() => {
        const canvas = document.createElement("canvas");
        device = new pc.NullGraphicsDevice(canvas);
        app = new pc.AppBase(canvas);
        const appOptions = new pc.AppOptions();
        appOptions.graphicsDevice = device;
        appOptions.componentSystems = [pc.RenderComponentSystem];
        app.init(appOptions);
        context = new Context();
        context.app = app;
        context.scene = app.root;
        workers = createMockWorkerManagers();
        drawHelper = new DrawHelper(context, labelText as JSCADText, new Vector(new MathBitByBit(), new GeometryHelper()), workers.mockJscadWorkerManager, workers.mockManifoldWorkerManager, workers.mockOccWorkerManager);
    });

    afterEach(() => {
        vi.restoreAllMocks();
        app.destroy();
    });

    const pointsOf = (count: number): Inputs.Base.Point3[] => Array.from({ length: count }, (_, at) => [at, at % 2, 0]);
    const sceneCounts = (): number[] => {
        let nodes = 0;
        app.root.forEach(() => {
            nodes++;
        });
        return [nodes, device.buffers.size];
    };

    const instancesDrawn = (points: pc.Entity): number => (points.children as pc.Entity[]).reduce((sum, child) => sum + child.render!.meshInstances[0]!.instancingCount, 0);
    const translationsDrawn = (points: pc.Entity): number[][] => (points.children as pc.Entity[]).flatMap(child => {
        const meshInstance = child.render!.meshInstances[0]!;
        const matrices = new Float32Array(meshInstance.instancingData!.vertexBuffer!.storage);
        return Array.from({ length: meshInstance.instancingCount }, (_, instance) => {
            const translation = instance * FLOATS_PER_MATRIX + TRANSLATION_AT;
            return Array.from(matrices.subarray(translation, translation + 3));
        });
    });

    const materialsDrawn = (points: pc.Entity): pc.StandardMaterial[] => (points.children as pc.Entity[]).map(child => child.render!.meshInstances[0]!.material as pc.StandardMaterial);
    const coloursDrawn = (points: pc.Entity): string[] => materialsDrawn(points).map(material => material.diffuse.toString(false));
    const opacitiesDrawn = (points: pc.Entity): number[] => materialsDrawn(points).map(material => material.opacity);
    const radiiDrawn = (points: pc.Entity): number[] => (points.children as pc.Entity[]).map(child => child.render!.meshInstances[0]!.mesh.aabb.halfExtents.x);

    const segmentsOf = (points: Inputs.Base.Point3[]): number[] => points.slice(1).flatMap((end, at) => [...points[at]!, ...end]);
    const linePositionsDrawn = (polyline: pc.Entity): number[] => {
        const positions: number[] = [];
        (polyline.children[0] as pc.Entity).render!.meshInstances[0]!.mesh.getPositions(positions);
        return positions;
    };

    const triangleWithItsVertices = (): Inputs.OCCT.DecomposedMeshDto => ({
        faceList: [{
            faceIndex: 0,
            vertexCoord: [0, 0, 0, 1, 0, 0, 0, 1, 0],
            vertexCoordVec: [[0, 0, 0], [1, 0, 0], [0, 1, 0]],
            normalCoord: [0, 0, 1, 0, 0, 1, 0, 0, 1],
            triIndexes: [0, 1, 2],
            numberOfTriangles: 1,
            centerPoint: [0.3, 0.3, 0],
            centerNormal: [0, 0, 1],
            uvs: [0, 0, 1, 0, 0, 1],
        }],
        edgeList: [],
        pointsList: [[0, 0, 0], [1, 0, 0], [0, 1, 0]],
    });

    it("should hold as many nodes and buffers after redrawing points whose count changes as after drawing them once", () => {
        // Arrange
        let drawn = drawHelper.drawPoints({ points: pointsOf(3), updatable: true, colours: "#ff0000" });
        const once = sceneCounts();

        // Act
        for (let redraw = 0; redraw < REDRAWS; redraw++) {
            drawn = drawHelper.drawPoints({ points: pointsOf(4 + redraw % 3), pointsMesh: drawn, updatable: true, colours: "#ff0000" });
        }

        // Assert
        expect(sceneCounts()).toEqual(once);
    });

    it("should hold as many nodes and buffers after redrawing polylines whose point count changes as after drawing them once", () => {
        // Arrange
        let drawn = drawHelper.drawPolylinesWithColours({ polylines: [{ points: pointsOf(3) }], updatable: true, colours: "#ff0000" });
        const once = sceneCounts();

        // Act
        for (let redraw = 0; redraw < REDRAWS; redraw++) {
            drawn = drawHelper.drawPolylinesWithColours({ polylines: [{ points: pointsOf(4 + redraw % 3) }], polylinesMesh: drawn, updatable: true, colours: "#ff0000" });
        }

        // Assert
        expect(sceneCounts()).toEqual(once);
    });

    it("should free every GPU buffer of points in several colours when they are destroyed", () => {
        // Arrange
        const buffersBefore = device.buffers.size;
        const drawn = drawHelper.drawPoints({ points: pointsOf(3), updatable: false, colours: ["#ff0000", "#00ff00", "#0000ff"] });

        // Act
        drawn.destroy();

        // Assert
        expect(device.buffers.size).toBe(buffersBefore);
    });

    it("should free every GPU buffer of a point when it is destroyed", () => {
        // Arrange
        const buffersBefore = device.buffers.size;
        const drawn = drawHelper.drawPoint({ point: [1, 2, 3], colours: "#ff0000" });

        // Act
        drawn.destroy();

        // Assert
        expect(device.buffers.size).toBe(buffersBefore);
    });

    it.each(["handleDecomposedMesh", "handleDecomposedMeshIndividually"] as const)("should free every GPU buffer of a shape whose vertices %s drew when the shape is destroyed", async (method) => {
        // Arrange
        const buffersBefore = device.buffers.size;
        const drawn = await drawHelper[method]({ drawVertices: true, vertexColour: "#ff00ff" }, triangleWithItsVertices(), {});

        // Act
        drawn.destroy();

        // Assert
        expect(device.buffers.size).toBe(buffersBefore);
    });

    it("should draw as many point instances as points after a redraw that drops points of the same colour", () => {
        // Arrange
        const drawn = drawHelper.drawPoints({ points: pointsOf(3), updatable: true, colours: "#ff0000" });

        // Act
        const redrawn = drawHelper.drawPoints({ points: pointsOf(1), pointsMesh: drawn, updatable: true, colours: "#ff0000" });

        // Assert
        expect(instancesDrawn(redrawn)).toBe(1);
    });

    it("should move the points in place when a redraw keeps the count of points of the same colour", () => {
        // Arrange
        const drawn = drawHelper.drawPoints({ points: pointsOf(3), updatable: true, colours: "#ff0000" });
        const moved: Inputs.Base.Point3[] = [[0, 5, 0], [1, 6, 0], [2, 7, 0]];

        // Act
        const redrawn = drawHelper.drawPoints({ points: moved, pointsMesh: drawn, updatable: true, colours: "#ff0000" });

        // Assert
        expect(redrawn.name).toBe(drawn.name);
        expect(translationsDrawn(redrawn)).toEqual(moved);
    });

    it("should draw the new colour after an updatable redraw of as many points in another colour", () => {
        // Arrange
        const drawn = drawHelper.drawPoints({ points: pointsOf(3), updatable: true, colours: "#ff0000" });

        // Act
        const redrawn = drawHelper.drawPoints({ points: pointsOf(3), pointsMesh: drawn, updatable: true, colours: "#0000ff" });

        // Assert
        expect(coloursDrawn(redrawn)).toEqual(["#0000ff"]);
    });

    it("should draw the new colours after an updatable redraw of as many points coloured one by one", () => {
        // Arrange
        const drawn = drawHelper.drawPoints({ points: pointsOf(3), updatable: true, colours: ["#ff0000", "#00ff00", "#0000ff"] });

        // Act
        const redrawn = drawHelper.drawPoints({ points: pointsOf(3), pointsMesh: drawn, updatable: true, colours: ["#ffffff", "#ffffff", "#000000"] });

        // Assert
        expect(coloursDrawn(redrawn)).toEqual(["#ffffff", "#000000"]);
        expect(instancesDrawn(redrawn)).toBe(3);
    });

    it("should draw the new opacity after an updatable redraw of as many points", () => {
        // Arrange
        const drawn = drawHelper.drawPoints({ points: pointsOf(3), updatable: true, colours: "#ff0000", opacity: 1 });

        // Act
        const redrawn = drawHelper.drawPoints({ points: pointsOf(3), pointsMesh: drawn, updatable: true, colours: "#ff0000", opacity: 0.5 });

        // Assert
        expect(opacitiesDrawn(redrawn)).toEqual([0.5]);
    });

    it("should draw the new size after an updatable redraw of as many points", () => {
        // Arrange
        const drawn = drawHelper.drawPoints({ points: pointsOf(3), updatable: true, colours: "#ff0000", size: 0.1 });

        // Act
        const redrawn = drawHelper.drawPoints({ points: pointsOf(3), pointsMesh: drawn, updatable: true, colours: "#ff0000", size: 2 });

        // Assert
        expect(radiiDrawn(redrawn)).toEqual([1]);
    });

    it("should hold as many nodes and buffers after redrawing as many points in colours that change as after drawing them once", () => {
        // Arrange
        let drawn = drawHelper.drawPoints({ points: pointsOf(3), updatable: true, colours: "#ff0000" });
        const once = sceneCounts();

        // Act
        for (let redraw = 0; redraw < REDRAWS; redraw++) {
            drawn = drawHelper.drawPoints({ points: pointsOf(3), pointsMesh: drawn, updatable: true, colours: redraw % 2 === 0 ? "#0000ff" : "#ff0000" });
        }

        // Assert
        expect(sceneCounts()).toEqual(once);
    });

    it("should draw the new colour after an updatable redraw of a point in another colour", () => {
        // Arrange
        const drawn = drawHelper.drawPoint({ point: [1, 2, 3], updatable: true, colours: "#ff0000" });

        // Act
        const redrawn = drawHelper.drawPoint({ point: [1, 2, 3], pointMesh: drawn, updatable: true, colours: "#0000ff" });

        // Assert
        expect(coloursDrawn(redrawn)).toEqual(["#0000ff"]);
    });

    it("should move a point in place when an updatable redraw keeps its colour", () => {
        // Arrange
        const drawn = drawHelper.drawPoint({ point: [1, 2, 3], updatable: true, colours: "#ff0000" });

        // Act
        const redrawn = drawHelper.drawPoint({ point: [4, 5, 6], pointMesh: drawn, updatable: true, colours: "#ff0000" });

        // Assert
        expect(redrawn.name).toBe(drawn.name);
        expect(translationsDrawn(redrawn)).toEqual([[4, 5, 6]]);
    });

    it("should hold as many nodes and buffers after redrawing a point in colours that change as after drawing it once", () => {
        // Arrange
        let drawn = drawHelper.drawPoint({ point: [1, 2, 3], updatable: true, colours: "#ff0000" });
        const once = sceneCounts();

        // Act
        for (let redraw = 0; redraw < REDRAWS; redraw++) {
            drawn = drawHelper.drawPoint({ point: [1, 2, 3], pointMesh: drawn, updatable: true, colours: redraw % 2 === 0 ? "#0000ff" : "#ff0000" });
        }

        // Assert
        expect(sceneCounts()).toEqual(once);
    });

    it("should move a polyline's points in place when an updatable redraw keeps its point count", () => {
        // Arrange
        const drawn = drawHelper.drawPolylineClose({ polyline: { points: pointsOf(3) }, updatable: true, colours: "#ff0000" });
        const line = drawn.children[0];
        const moved: Inputs.Base.Point3[] = [[0, 5, 0], [1, 6, 0], [2, 7, 0]];

        // Act
        const redrawn = drawHelper.drawPolylineClose({ polyline: { points: moved }, polylineMesh: drawn, updatable: true, colours: "#ff0000" });

        // Assert
        expect(redrawn).toBe(drawn);
        expect(redrawn.children).toEqual([line]);
        expect(linePositionsDrawn(redrawn)).toEqual(segmentsOf(moved));
    });

    it("should show the new points after an updatable redraw of a polyline that changes its point count", () => {
        // Arrange
        const drawn = drawHelper.drawPolylineClose({ polyline: { points: pointsOf(3) }, updatable: true, colours: "#ff0000" });

        // Act
        const redrawn = drawHelper.drawPolylineClose({ polyline: { points: pointsOf(5) }, polylineMesh: drawn, updatable: true, colours: "#ff0000" });

        // Assert
        expect(redrawn).toBe(drawn);
        expect(redrawn.children).toHaveLength(1);
        expect(linePositionsDrawn(redrawn)).toEqual(segmentsOf(pointsOf(5)));
    });

    it("should hold as many nodes and buffers after redrawing a polyline whose point count changes as after drawing it once", () => {
        // Arrange
        let drawn = drawHelper.drawPolylineClose({ polyline: { points: pointsOf(3) }, updatable: true, colours: "#ff0000" });
        const once = sceneCounts();

        // Act
        for (let redraw = 0; redraw < REDRAWS; redraw++) {
            drawn = drawHelper.drawPolylineClose({ polyline: { points: pointsOf(4 + redraw % 3) }, polylineMesh: drawn, updatable: true, colours: "#ff0000" });
        }

        // Assert
        expect(sceneCounts()).toEqual(once);
    });

    it("should hold as many nodes and buffers after redrawing a polyline of the same point count as after drawing it once", () => {
        // Arrange
        let drawn = drawHelper.drawPolylineClose({ polyline: { points: pointsOf(3) }, updatable: true, colours: "#ff0000" });
        const once = sceneCounts();

        // Act
        for (let redraw = 0; redraw < REDRAWS; redraw++) {
            drawn = drawHelper.drawPolylineClose({ polyline: { points: pointsOf(3).map(([x, y, z]) => [x, y + redraw, z]) }, polylineMesh: drawn, updatable: true, colours: "#ff0000" });
        }

        // Assert
        expect(sceneCounts()).toEqual(once);
    });
});
