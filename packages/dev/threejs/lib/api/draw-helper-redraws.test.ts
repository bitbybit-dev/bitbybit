import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import * as THREEJS from "three";
import { GeometryHelper, MathBitByBit, Vector } from "@bitbybit-dev/base";
import type { JSCADText } from "@bitbybit-dev/jscad-worker";
import { createMockWorkerManagers, partialMock, type MockWorkerManagers } from "./__mocks__/test-helpers";
import { Context } from "./context";
import { DrawHelper } from "./draw-helper";
import type * as Inputs from "./inputs";

const REDRAWS = 50;

describe("three.js drawing redrawn again and again", () => {
    let scene: THREEJS.Scene;
    let context: Context;
    let workers: MockWorkerManagers;
    let drawHelper: DrawHelper;

    beforeEach(() => {
        scene = new THREEJS.Scene();
        context = new Context();
        context.scene = scene;
        workers = createMockWorkerManagers();
        drawHelper = new DrawHelper(context, partialMock<JSCADText>({ createVectorText: vi.fn().mockResolvedValue([[[0, 0], [1, 0]]]) }), new Vector(new MathBitByBit(), new GeometryHelper()), workers.mockJscadWorkerManager, workers.mockManifoldWorkerManager, workers.mockOccWorkerManager);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    const pointsOf = (count: number): Inputs.Base.Point3[] => Array.from({ length: count }, (_, at) => [at, 0, 0]);
    const objectsInScene = (): number => {
        let count = 0;
        scene.traverse(() => {
            count++;
        });
        return count;
    };
    const materialsIn = (root: THREEJS.Object3D): THREEJS.Material[] => {
        const found = new Set<THREEJS.Material>();
        root.traverse(node => {
            if (node instanceof THREEJS.Mesh) {
                (Array.isArray(node.material) ? node.material : [node.material]).forEach(material => found.add(material));
            }
        });
        return [...found];
    };

    const pointMaterialsOf = (points: THREEJS.Group): THREEJS.MeshBasicMaterial[] => (points.children as THREEJS.InstancedMesh<THREEJS.BufferGeometry, THREEJS.MeshBasicMaterial>[]).map(child => child.material);
    const pointColoursOf = (points: THREEJS.Group): string[] => pointMaterialsOf(points).map(material => `#${material.color.getHexString()}`);
    const heightsOf = (points: THREEJS.InstancedMesh): number[] => Array.from({ length: points.count }, (_, at) => {
        const matrix = new THREEJS.Matrix4();
        points.getMatrixAt(at, matrix);
        return new THREEJS.Vector3().setFromMatrixPosition(matrix).y;
    });

    it("should hold as many objects in the scene after redrawing points whose count changes as after drawing them once", () => {
        // Arrange
        let drawn = drawHelper.drawPoints({ points: pointsOf(3), updatable: true, colours: "#ff0000" });
        const once = objectsInScene();

        // Act
        for (let redraw = 0; redraw < REDRAWS; redraw++) {
            drawn = drawHelper.drawPoints({ points: pointsOf(4 + redraw % 3), pointsMesh: drawn, updatable: true, colours: "#ff0000" });
        }

        // Assert
        expect(objectsInScene()).toBe(once);
    });

    it("should hold as many objects in the scene after redrawing polylines whose point count changes as after drawing them once", () => {
        // Arrange
        let drawn = drawHelper.drawPolylinesWithColours({ polylines: [{ points: pointsOf(3) }], updatable: true, colours: "#ff0000" });
        const once = objectsInScene();

        // Act
        for (let redraw = 0; redraw < REDRAWS; redraw++) {
            drawn = drawHelper.drawPolylinesWithColours({ polylines: [{ points: pointsOf(4 + redraw % 3) }], polylinesMesh: drawn, updatable: true, colours: "#ff0000" });
        }

        // Assert
        expect(objectsInScene()).toBe(once);
    });

    it("should leave the shared point material usable when it redraws points whose count changes", () => {
        // Arrange
        const first = drawHelper.drawPoints({ points: pointsOf(3), updatable: true, colours: "#ff0000" });
        const disposed = vi.fn();
        materialsIn(first).forEach(material => material.addEventListener("dispose", disposed));

        // Act
        const redrawn = drawHelper.drawPoints({ points: pointsOf(5), pointsMesh: first, updatable: true, colours: "#ff0000" });

        // Assert
        expect(disposed).not.toHaveBeenCalled();
        expect(materialsIn(redrawn)).toEqual(materialsIn(first));
    });

    it("should free the sphere geometry and the instance buffers of every colour of points it replaces when their count changes", () => {
        // Arrange
        const twoColours = ["#ff0000", "#00ff00"];
        const first = drawHelper.drawPoints({ points: pointsOf(3), updatable: true, colours: twoColours });
        const replaced = first.children as THREEJS.InstancedMesh[];
        const geometryFreed = vi.fn();
        const instancesFreed = vi.fn();
        replaced.forEach(points => {
            points.geometry.addEventListener("dispose", geometryFreed);
            points.addEventListener("dispose", instancesFreed);
        });

        // Act
        drawHelper.drawPoints({ points: pointsOf(5), pointsMesh: first, updatable: true, colours: twoColours });

        // Assert
        expect(replaced).toHaveLength(twoColours.length);
        expect(geometryFreed).toHaveBeenCalledTimes(twoColours.length);
        expect(instancesFreed).toHaveBeenCalledTimes(twoColours.length);
    });

    it("should draw the new colour after an updatable redraw of as many points in another colour", () => {
        // Arrange
        const drawn = drawHelper.drawPoints({ points: pointsOf(3), updatable: true, colours: "#ff0000" });

        // Act
        const redrawn = drawHelper.drawPoints({ points: pointsOf(3), pointsMesh: drawn, updatable: true, colours: "#0000ff" });

        // Assert
        expect(pointColoursOf(redrawn)).toEqual(["#0000ff"]);
    });

    it("should draw the new colours after an updatable redraw of as many points coloured one by one", () => {
        // Arrange
        const drawn = drawHelper.drawPoints({ points: pointsOf(3), updatable: true, colours: ["#ff0000", "#00ff00", "#0000ff"] });

        // Act
        const redrawn = drawHelper.drawPoints({ points: pointsOf(3), pointsMesh: drawn, updatable: true, colours: ["#ffffff", "#ffffff", "#000000"] });

        // Assert
        expect(pointColoursOf(redrawn)).toEqual(["#ffffff", "#000000"]);
        expect((redrawn.children as THREEJS.InstancedMesh[]).map(points => points.count)).toEqual([2, 1]);
    });

    it("should draw the new opacity after an updatable redraw of as many points", () => {
        // Arrange
        const drawn = drawHelper.drawPoints({ points: pointsOf(3), updatable: true, colours: "#ff0000", opacity: 1 });

        // Act
        const redrawn = drawHelper.drawPoints({ points: pointsOf(3), pointsMesh: drawn, updatable: true, colours: "#ff0000", opacity: 0.5 });

        // Assert
        expect(pointMaterialsOf(redrawn).map(material => material.opacity)).toEqual([0.5]);
    });

    it("should draw the new size after an updatable redraw of as many points", () => {
        // Arrange
        const drawn = drawHelper.drawPoints({ points: pointsOf(3), updatable: true, colours: "#ff0000", size: 0.1 });

        // Act
        const redrawn = drawHelper.drawPoints({ points: pointsOf(3), pointsMesh: drawn, updatable: true, colours: "#ff0000", size: 2 });

        // Assert
        expect((redrawn.children as THREEJS.InstancedMesh<THREEJS.SphereGeometry>[]).map(points => points.geometry.parameters.radius)).toEqual([1]);
    });

    it("should move the points in place when an updatable redraw keeps their count and their look", () => {
        // Arrange
        const drawn = drawHelper.drawPoints({ points: pointsOf(3), updatable: true, colours: "#ff0000" });

        // Act
        const redrawn = drawHelper.drawPoints({ points: [[0, 5, 0], [1, 6, 0], [2, 7, 0]], pointsMesh: drawn, updatable: true, colours: "#ff0000" });

        // Assert
        expect(redrawn).toBe(drawn);
        expect(heightsOf(redrawn.children[0] as THREEJS.InstancedMesh)).toEqual([5, 6, 7]);
    });

    it("should hold as many objects in the scene after redrawing as many points in colours that change as after drawing them once", () => {
        // Arrange
        let drawn = drawHelper.drawPoints({ points: pointsOf(3), updatable: true, colours: "#ff0000" });
        const once = objectsInScene();

        // Act
        for (let redraw = 0; redraw < REDRAWS; redraw++) {
            drawn = drawHelper.drawPoints({ points: pointsOf(3), pointsMesh: drawn, updatable: true, colours: redraw % 2 === 0 ? "#0000ff" : "#ff0000" });
        }

        // Assert
        expect(objectsInScene()).toBe(once);
    });

    it("should draw the new colour after an updatable redraw of a point in another colour", () => {
        // Arrange
        const drawn = drawHelper.drawPoint({ point: [1, 2, 3], updatable: true, colours: "#ff0000" });

        // Act
        const redrawn = drawHelper.drawPoint({ point: [1, 2, 3], pointMesh: drawn, updatable: true, colours: "#0000ff" });

        // Assert
        expect(pointColoursOf(redrawn)).toEqual(["#0000ff"]);
    });

    it("should hold as many objects in the scene after redrawing a point in colours that change as after drawing it once", () => {
        // Arrange
        let drawn = drawHelper.drawPoint({ point: [1, 2, 3], updatable: true, colours: "#ff0000" });
        const once = objectsInScene();

        // Act
        for (let redraw = 0; redraw < REDRAWS; redraw++) {
            drawn = drawHelper.drawPoint({ point: [1, 2, 3], pointMesh: drawn, updatable: true, colours: redraw % 2 === 0 ? "#0000ff" : "#ff0000" });
        }

        // Assert
        expect(objectsInScene()).toBe(once);
    });

    it("should free the sphere geometry and the instance buffer of a point it replaces when its colour changes", () => {
        // Arrange
        const drawn = drawHelper.drawPoint({ point: [1, 2, 3], updatable: true, colours: "#ff0000" });
        const replaced = drawn.children[0] as THREEJS.InstancedMesh;
        const geometryFreed = vi.fn();
        const instancesFreed = vi.fn();
        replaced.geometry.addEventListener("dispose", geometryFreed);
        replaced.addEventListener("dispose", instancesFreed);

        // Act
        drawHelper.drawPoint({ point: [1, 2, 3], pointMesh: drawn, updatable: true, colours: "#0000ff" });

        // Assert
        expect(geometryFreed).toHaveBeenCalledTimes(1);
        expect(instancesFreed).toHaveBeenCalledTimes(1);
    });
});
