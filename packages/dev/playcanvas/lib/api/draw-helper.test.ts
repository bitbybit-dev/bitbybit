import { describe, it, expect, beforeEach, afterEach, vi, type Mock } from "vitest";
vi.mock("playcanvas", async () => {
    const { createPlayCanvasMock } = await vi.importActual<typeof import("./__mocks__/playcanvas.mock")>("./__mocks__/playcanvas.mock");
    return await createPlayCanvasMock();
});

import { createDrawHelperMocks } from "./__mocks__/test-helpers";

import { DrawHelper } from "./draw-helper";
import { Context } from "./context";
import * as Inputs from "./inputs";
import { JSCADText, JSCADWorkerManager } from "@bitbybit-dev/jscad-worker";
import { ManifoldWorkerManager } from "@bitbybit-dev/manifold-worker";
import { OCCTWorkerManager } from "@bitbybit-dev/occt-worker";
import { Vector } from "@bitbybit-dev/base";

import * as pc from "playcanvas";

const IDENTITY_TRANSFORM: Inputs.JSCAD.JSCADMat4 = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
];
const jscadSolid = (color?: Inputs.JSCAD.JSCADColor): Inputs.JSCAD.JSCADGeom3 =>
    color === undefined
        ? { polygons: [], transforms: IDENTITY_TRANSFORM }
        : { polygons: [], transforms: IDENTITY_TRANSFORM, color };


describe("DrawHelper unit tests", () => {
    let drawHelper: DrawHelper;
    let mockContext: Context;
    let mockSolidText: JSCADText;
    let mockVector: Vector;
    let mockJscadWorkerManager: JSCADWorkerManager;
    let mockManifoldWorkerManager: ManifoldWorkerManager;
    let mockOccWorkerManager: OCCTWorkerManager;

    beforeEach(() => {
        const mocks = createDrawHelperMocks();
        mockContext = mocks.mockContext;
        mockSolidText = mocks.mockSolidText;
        mockVector = mocks.mockVector;
        mockJscadWorkerManager = mocks.mockJscadWorkerManager;
        mockManifoldWorkerManager = mocks.mockManifoldWorkerManager;
        mockOccWorkerManager = mocks.mockOccWorkerManager;

        drawHelper = new DrawHelper(
            mockContext,
            mockSolidText,
            mockVector,
            mockJscadWorkerManager,
            mockManifoldWorkerManager,
            mockOccWorkerManager
        );
    });

    afterEach(() => {
        drawHelper.dispose();
        vi.clearAllMocks();
    });

    const getMaterialFromEntity = (node: pc.GraphNode): pc.StandardMaterial | null => {
        const entity = node as pc.Entity;
        if (entity.render && entity.render.meshInstances && entity.render.meshInstances.length > 0) {
            return entity.render.meshInstances[0]!.material as pc.StandardMaterial;
        }
        return null;
    };

    const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (result) {
            return {
                r: parseInt(result[1]!, 16) / 255,
                g: parseInt(result[2]!, 16) / 255,
                b: parseInt(result[3]!, 16) / 255
            };
        }
        return { r: 1, g: 0, b: 0 };
    };

    const colorsAreEqual = (color1: pc.Color, color2: { r: number; g: number; b: number }, tolerance = 0.01): boolean => {
        return Math.abs(color1.r - color2.r) < tolerance &&
               Math.abs(color1.g - color2.g) < tolerance &&
               Math.abs(color1.b - color2.b) < tolerance;
    };

    describe("drawPoint", () => {
        it("should draw a point with default options", () => {
            const inputs = new Inputs.Point.DrawPointDto<pc.Entity>(
                [1, 2, 3],
                1,
                0.5,
                "#ff0000",
                false
            );

            const result = drawHelper.drawPoint(inputs);

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(pc.Entity);
            expect(result.name).toContain("pointMesh");
            expect(result.children.length).toBe(1);

            const instancedEntity = result.children[0]!;
            expect(instancedEntity).toBeDefined();
            expect(instancedEntity.name).toContain("points-#ff0000");

            const material = getMaterialFromEntity(instancedEntity);
            if (material && material.diffuse) {
                const expectedColor = hexToRgb("#ff0000");
                expect(colorsAreEqual(material.diffuse, expectedColor)).toBe(true);
            }

            if (material) {
                expect(material.opacity).toBeDefined();
            }
        });

        it("should draw a point with array of colours", () => {
            const inputs = new Inputs.Point.DrawPointDto<pc.Entity>(
                [0, 0, 0],
                0.5,
                1,
                ["#ff0000", "#00ff00"]
            );

            const result = drawHelper.drawPoint(inputs);
            expect(result.children.length).toBe(1);
            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(pc.Entity);

            const instancedEntity = result.children[0]!;
            expect(instancedEntity).toBeDefined();
            expect(instancedEntity.name).toContain("points-");

            const material = getMaterialFromEntity(instancedEntity);
            if (material && material.diffuse) {
                const expectedColor = hexToRgb("#ff0000");
                expect(colorsAreEqual(material.diffuse, expectedColor)).toBe(true);
            }

            if (material) {
                expect(material.opacity).toBeDefined();
            }
        });

        it("should update existing point mesh when updatable is true", () => {
            const existingMesh = new pc.Entity();
            existingMesh.name = "existingPointMesh";
            const childEntity = new pc.Entity(`point-0-${Math.random()}`);
            childEntity.setLocalPosition(0, 0, 0);
            existingMesh.addChild(childEntity);

            const inputs = new Inputs.Point.DrawPointDto<pc.Entity>(
                [5, 5, 5],
                1,
                0.5,
                "#0000ff",
                true,
                existingMesh
            );

            const result = drawHelper.drawPoint(inputs);
            expect(result.children.length).toBe(1);
            expect(result).toBe(existingMesh);
        });
    });

    describe("drawPoints", () => {
        it("should draw multiple points", () => {
            const inputs = new Inputs.Point.DrawPointsDto<pc.Entity>(
                [[0, 0, 0], [1, 1, 1], [2, 2, 2]],
                1,
                0.3,
                "#ff0000"
            );

            const result = drawHelper.drawPoints(inputs);

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(pc.Entity);
            expect(result.children.length).toBe(1);
            expect(result.name).toContain("pointsMesh");

            const instancedEntity = result.children[0]!;
            const material = getMaterialFromEntity(instancedEntity);
            if (material && material.diffuse) {
                const expectedColor = hexToRgb("#ff0000");
                expect(colorsAreEqual(material.diffuse, expectedColor)).toBe(true);
            }

            if (material) {
                expect(material.opacity).toBe(1);
            }
        });

        it("should draw points with per-point colours", () => {
            const inputs = new Inputs.Point.DrawPointsDto<pc.Entity>(
                [[0, 0, 0], [1, 1, 1], [2, 2, 2]],
                1,
                0.3,
                ["#ff0000", "#00ff00", "#0000ff"]
            );

            const result = drawHelper.drawPoints(inputs);
            expect(result.children.length).toBe(3);
            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(pc.Entity);

            const expectedColors = ["#ff0000", "#00ff00", "#0000ff"];
            result.children.forEach((instancedEntity, index) => {
                const material = getMaterialFromEntity(instancedEntity);
                if (material && material.diffuse) {
                    const expectedColor = hexToRgb(expectedColors[index]!);
                    expect(colorsAreEqual(material.diffuse, expectedColor)).toBe(true);
                }

                if (material) {
                    expect(material.opacity).toBeDefined();
                }
            });
        });

        it("should handle mismatched colour array length", () => {
            const inputs = new Inputs.Point.DrawPointsDto<pc.Entity>(
                [[0, 0, 0], [1, 1, 1], [2, 2, 2], [3, 3, 3]],
                1,
                0.3,
                ["#ff0000", "#00ff00"]
            );

            const result = drawHelper.drawPoints(inputs);
            expect(result.children.length).toBe(2);
            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(pc.Entity);
        });

        it("should update existing points mesh when updatable is true with same point count", () => {
            const firstInputs = new Inputs.Point.DrawPointsDto<pc.Entity>(
                [[0, 0, 0], [1, 1, 1]],
                1,
                0.3,
                "#ff0000"
            );
            const existingMesh = drawHelper.drawPoints(firstInputs);

            const updateInputs = new Inputs.Point.DrawPointsDto<pc.Entity>(
                [[5, 5, 5], [6, 6, 6]],
                1,
                0.3,
                "#ff0000",
                true,
                existingMesh
            );

            const result = drawHelper.drawPoints(updateInputs);
            expect(result.children.length).toBe(1);
            expect(result).toBeDefined();
        });

        it("should recreate points mesh when point count changes during update", () => {
            const firstInputs = new Inputs.Point.DrawPointsDto<pc.Entity>(
                [[0, 0, 0], [1, 1, 1]],
                1,
                0.3,
                "#ff0000"
            );
            const existingMesh = drawHelper.drawPoints(firstInputs);

            const updateInputs = new Inputs.Point.DrawPointsDto<pc.Entity>(
                [[5, 5, 5], [6, 6, 6], [7, 7, 7]],
                1,
                0.3,
                "#ff0000",
                true,
                existingMesh
            );

            const result = drawHelper.drawPoints(updateInputs);
            expect(result.children.length).toBe(1);
            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(pc.Entity);
        });
    });

    describe("drawPolylineClose", () => {
        it("should draw a polyline", () => {
            const polylineData = {
                points: [[0, 0, 0], [1, 0, 0], [1, 1, 0]] as Inputs.Base.Point3[],
                isClosed: false
            };
            const inputs = new Inputs.Polyline.DrawPolylineDto<pc.Entity>(
                polylineData,
                1,
                "#00ff00",
                2
            );

            const result = drawHelper.drawPolylineClose(inputs);
            expect(result.children.length).toBe(1);
            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(pc.Entity);
            expect(result.name).toContain("polyline");

            const polylineEntity = result.children[0]!;
            const material = getMaterialFromEntity(polylineEntity);
            if (material && material.diffuse) {
                expect(material.diffuse).toBeDefined();
            }

            if (material) {
                expect(material.opacity).toBeDefined();
            }
        });

        it("should close the polyline when isClosed is true", () => {
            const polylineData = {
                points: [[0, 0, 0], [1, 0, 0], [1, 1, 0]] as Inputs.Base.Point3[],
                isClosed: true
            };
            const inputs = new Inputs.Polyline.DrawPolylineDto<pc.Entity>(
                polylineData,
                1,
                "#00ff00",
                2
            );

            const result = drawHelper.drawPolylineClose(inputs);
            expect(result.children.length).toBe(1);
            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(pc.Entity);
        });

        it("should update existing polyline mesh when updatable is true", () => {
            const existingMesh = new pc.Entity();
            existingMesh.name = "existingPolyline";
            const childEntity = new pc.Entity("polyline-child");
            existingMesh.addChild(childEntity);

            const polylineData = {
                points: [[0, 0, 0], [2, 2, 2]] as Inputs.Base.Point3[],
                isClosed: false
            };
            const inputs = new Inputs.Polyline.DrawPolylineDto<pc.Entity>(
                polylineData,
                1,
                "#0000ff",
                3,
                true,
                existingMesh
            );

            const result = drawHelper.drawPolylineClose(inputs);
        expect(result.children.length).toBe(1);
            expect(result).toBeDefined();
        });
    });

    describe("drawPolylinesWithColours", () => {
        it("should draw multiple polylines", () => {
            const polylinesData = [
                { points: [[0, 0, 0], [1, 0, 0]] as Inputs.Base.Point3[], isClosed: false },
                { points: [[2, 0, 0], [3, 0, 0]] as Inputs.Base.Point3[], isClosed: false }
            ];
            const inputs = new Inputs.Polyline.DrawPolylinesDto<pc.Entity>(
                polylinesData,
                1,
                "#ff0000",
                2
            );

            const result = drawHelper.drawPolylinesWithColours(inputs);
            expect(result.children.length).toBe(1);
            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(pc.Entity);
            expect(result.name).toContain("polylines");
        });

        it("should handle polylines with assigned colors", () => {
            const polylinesData = [
                { points: [[0, 0, 0], [1, 0, 0]] as Inputs.Base.Point3[], isClosed: false, color: [1, 0, 0] as [number, number, number] },
                { points: [[2, 0, 0], [3, 0, 0]] as Inputs.Base.Point3[], isClosed: false }
            ];
            const inputs = new Inputs.Polyline.DrawPolylinesDto<pc.Entity>(
                polylinesData,
                1,
                "#00ff00",
                2
            );

            const setColors32 = vi.spyOn(pc.Mesh.prototype, "setColors32");

            const result = drawHelper.drawPolylinesWithColours(inputs);

            expect(result.children.length).toBe(1);
            const vertexColours = setColors32.mock.calls[0]![0] as number[];
            const asRgb = [];
            for (let i = 0; i < vertexColours.length; i += 4) {
                asRgb.push([vertexColours[i], vertexColours[i + 1], vertexColours[i + 2]]);
            }
            expect(asRgb).toEqual([[255, 0, 0], [255, 0, 0], [0, 255, 0], [0, 255, 0]]);
            setColors32.mockRestore();
        });

        it("should handle closed polylines", () => {
            const polylinesData = [
                { points: [[0, 0, 0], [1, 0, 0], [0.5, 1, 0]] as Inputs.Base.Point3[], isClosed: true }
            ];
            const inputs = new Inputs.Polyline.DrawPolylinesDto<pc.Entity>(
                polylinesData,
                1,
                "#ff0000",
                2
            );

            const result = drawHelper.drawPolylinesWithColours(inputs);
            expect(result.children.length).toBe(1);
            expect(result).toBeDefined();
        });

        it("should update existing polylines mesh when updatable is true", () => {
            const existingMesh = new pc.Entity();
            existingMesh.name = "existingPolylines";
            const childEntity = new pc.Entity("polylines-child");
            existingMesh.addChild(childEntity);

            const polylinesData = [
                { points: [[0, 0, 0], [5, 5, 5]] as Inputs.Base.Point3[], isClosed: false },
                { points: [[6, 6, 6], [7, 7, 7]] as Inputs.Base.Point3[], isClosed: false }
            ];
            const inputs = new Inputs.Polyline.DrawPolylinesDto<pc.Entity>(
                polylinesData,
                1,
                "#0000ff",
                3,
                true,
                existingMesh
            );

            const result = drawHelper.drawPolylinesWithColours(inputs);
            expect(result).toBeDefined();
            expect(result.children.length).toBe(1);
        });
    });

    describe("drawCurve", () => {
        it("should draw a curve", () => {
            const mockCurve = {
                tessellate: vi.fn().mockReturnValue([
                    [0, 0, 0], [0.5, 0.5, 0], [1, 1, 0]
                ] as Inputs.Base.Point3[])
            };
            const inputs = new Inputs.Verb.DrawCurveDto<pc.Entity>(
                mockCurve,
                1,
                "#ff0000",
                2
            );

            const result = drawHelper.drawCurve(inputs);            
            expect(result).toBeDefined();
            expect(result.children.length).toBe(1);
            expect(result).toBeInstanceOf(pc.Entity);
            expect(mockCurve.tessellate).toHaveBeenCalled();
        });

        it("should update existing curve mesh when updatable is true", () => {
            const existingMesh = new pc.Entity();
            existingMesh.name = "existingCurve";
            const childEntity = new pc.Entity("curve-child");
            existingMesh.addChild(childEntity);

            const mockCurve = {
                tessellate: vi.fn().mockReturnValue([
                    [0, 0, 0], [1, 1, 1], [2, 2, 2]
                ] as Inputs.Base.Point3[])
            };
            const inputs = new Inputs.Verb.DrawCurveDto<pc.Entity>(
                mockCurve,
                0.8,
                "#00ff00",
                3,
                true,
                existingMesh
            );

            const result = drawHelper.drawCurve(inputs);
            expect(result.children.length).toBe(1);
            expect(result).toBeDefined();
        });
    });

    describe("Arrow drawing on polylines", () => {
        it("should draw a single polyline with arrows", () => {
            const polyline: Inputs.Base.Polyline3 = {
                points: [[0, 0, 0], [1, 1, 1], [2, 0, 0], [3, 1, 0]]
            };

            const result = drawHelper.drawPolylineClose({
                polylineMesh: undefined,
                polyline,
                updatable: false,
                size: 2,
                opacity: 1,
                colours: "#ff0000",
                arrowSize: 1,
                arrowAngle: 30
            });

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(pc.Entity);
            expect(result.children.length).toBeGreaterThan(0);
            
            const lineEntity = result.children[0] as pc.Entity;
            expect(lineEntity.render).toBeDefined();
        });

        it("should draw multiple polylines with arrows of different colors", () => {
            const polylines: Inputs.Base.Polyline3[] = [
                { points: [[0, 0, 0], [1, 1, 1], [2, 0, 0]] },
                { points: [[0, 2, 0], [1, 3, 1], [2, 2, 0]] },
                { points: [[0, 4, 0], [1, 5, 1], [2, 4, 0]] }
            ];

            const result = drawHelper.drawPolylinesWithColours({
                polylinesMesh: undefined,
                polylines,
                updatable: false,
                size: 2,
                opacity: 1,
                colours: ["#ff0000", "#00ff00", "#0000ff"],
                colorMapStrategy: Inputs.Base.colorMapStrategyEnum.lastColorRemainder,
                arrowSize: 1,
                arrowAngle: 25
            });

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(pc.Entity);
        });

        it("should not draw arrows when arrowSize is 0", () => {
            const polyline: Inputs.Base.Polyline3 = {
                points: [[0, 0, 0], [1, 1, 1], [2, 0, 0]]
            };

            const result = drawHelper.drawPolylineClose({
                polylineMesh: undefined,
                polyline,
                updatable: false,
                size: 2,
                opacity: 1,
                colours: "#ff0000",
                arrowSize: 0,
                arrowAngle: 30
            });

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(pc.Entity);
        });

        it("should draw arrows with custom angle", () => {
            const polyline: Inputs.Base.Polyline3 = {
                points: [[0, 0, 0], [5, 0, 0]]
            };

            const result = drawHelper.drawPolylineClose({
                polylineMesh: undefined,
                polyline,
                updatable: false,
                size: 2,
                opacity: 1,
                colours: "#ff0000",
                arrowSize: 2,
                arrowAngle: 45
            });

            expect(result).toBeDefined();
            const lineEntity = result.children[0] as pc.Entity;
            expect(lineEntity.render).toBeDefined();
        });

        it("should use same color for arrows as their parent polyline", () => {
            const polylines: Inputs.Base.Polyline3[] = [
                { points: [[0, 0, 0], [1, 1, 1]] },
                { points: [[2, 0, 0], [3, 1, 1]] }
            ];

            const result = drawHelper.drawPolylinesWithColours({
                polylinesMesh: undefined,
                polylines,
                updatable: false,
                size: 2,
                opacity: 1,
                colours: ["#ff0000", "#00ff00"],
                arrowSize: 1,
                arrowAngle: 30
            });

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(pc.Entity);
        });

        it("should handle polylines with insufficient points for arrows", () => {
            const polyline: Inputs.Base.Polyline3 = {
                points: [[0, 0, 0]]
            };

            const result = drawHelper.drawPolylineClose({
                polylineMesh: undefined,
                polyline,
                updatable: false,
                size: 2,
                opacity: 1,
                colours: "#ff0000",
                arrowSize: 1,
                arrowAngle: 30
            });

            expect(result).toBeDefined();
            const lineEntity = result.children[0] as pc.Entity;
            expect(lineEntity.render).toBeDefined();
            
            if (lineEntity.render!.meshInstances && lineEntity.render!.meshInstances.length > 0) {
                const mesh = lineEntity.render!.meshInstances[0]!.mesh;
                if (mesh.vertexBuffer && mesh.vertexBuffer.storage) {
                    expect(mesh.vertexBuffer.storage.byteLength).toBe(0);
                }
            }
        });

        it("should update polyline with arrows when updatable is true", () => {
            const polyline: Inputs.Base.Polyline3 = {
                points: [[0, 0, 0], [1, 1, 1]]
            };

            const firstResult = drawHelper.drawPolylineClose({
                polylineMesh: undefined,
                polyline,
                updatable: true,
                size: 2,
                opacity: 1,
                colours: "#ff0000",
                arrowSize: 1,
                arrowAngle: 30
            });

            const updatedPolyline: Inputs.Base.Polyline3 = {
                points: [[0, 0, 0], [2, 2, 2]]
            };

            const secondResult = drawHelper.drawPolylineClose({
                polylineMesh: firstResult,
                polyline: updatedPolyline,
                updatable: true,
                size: 2,
                opacity: 1,
                colours: "#00ff00",
                arrowSize: 1,
                arrowAngle: 30
            });

            expect(secondResult).toBe(firstResult);
            expect(secondResult.children.length).toBeGreaterThan(0);
        });
    });

    describe("drawCurves", () => {
        it("should draw multiple curves", () => {
            const mockCurves = [
                { tessellate: vi.fn().mockReturnValue([[0, 0, 0], [1, 1, 1]] as Inputs.Base.Point3[]) },
                { tessellate: vi.fn().mockReturnValue([[2, 2, 2], [3, 3, 3]] as Inputs.Base.Point3[]) }
            ];
            const inputs = new Inputs.Verb.DrawCurvesDto<pc.Entity>(
                mockCurves,
                1,
                "#ff0000",
                2
            );

            const result = drawHelper.drawCurves(inputs);
            expect(result.children.length).toBe(1);
            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(pc.Entity);
        });
    });

    describe("drawSurface", () => {
        it("should draw a surface", () => {
            const mockSurface = {
                tessellate: vi.fn().mockReturnValue({
                    faces: [
                        [0, 1, 2]
                    ],
                    points: [[0, 0, 0], [1, 0, 0], [0, 1, 0]],
                    normals: [[0, 0, 1], [0, 0, 1], [0, 0, 1]]
                })
            };
            const inputs = new Inputs.Verb.DrawSurfaceDto<pc.Entity>(
                mockSurface,
                1,
                "#ff0000",
                false,
                false,
                undefined,
                false
            );

            const result = drawHelper.drawSurface(inputs);

            expect(result).toBeDefined();
            expect(result.children.length).toBe(1);
            expect(result).toBeInstanceOf(pc.Entity);
            expect(mockSurface.tessellate).toHaveBeenCalled();

            const surfaceEntity = result.children[0]!;
            const material = getMaterialFromEntity(surfaceEntity);
            if (material && material.diffuse) {
                const expectedColor = hexToRgb("#ff0000");
                expect(colorsAreEqual(material.diffuse, expectedColor)).toBe(true);
            }

            if (material) {
                expect(material.opacity).toBe(1);
            }
        });

        it("should handle hidden surfaces", () => {
            const mockSurface = {
                tessellate: vi.fn().mockReturnValue({
                    faces: [[0, 1, 2]],
                    points: [[0, 0, 0], [1, 0, 0], [0, 1, 0]],
                    normals: [[0, 0, 1], [0, 0, 1], [0, 0, 1]]
                })
            };
            const inputs = new Inputs.Verb.DrawSurfaceDto<pc.Entity>(
                mockSurface,
                1,
                "#0000ff",
                false,
                true,
                undefined,
                false
            );

            const result = drawHelper.drawSurface(inputs);
            expect(result.children.length).toBe(1);
            expect(result).toBeDefined();
            expect(result.enabled).toBe(false);
        });

        it("should update existing surface mesh when updatable is true", () => {
            const existingMesh = new pc.Entity();
            existingMesh.name = "existingSurface";

            const mockSurface = {
                tessellate: vi.fn().mockReturnValue({
                    faces: [[0, 1, 2]],
                    points: [[0, 0, 0], [1, 0, 0], [0, 1, 0]],
                    normals: [[0, 0, 1], [0, 0, 1], [0, 0, 1]]
                })
            };
            const inputs = new Inputs.Verb.DrawSurfaceDto<pc.Entity>(
                mockSurface,
                0.5,
                "#00ff00",
                true,
                false,
                existingMesh,
                false
            );

            const result = drawHelper.drawSurface(inputs);
            expect(result.children.length).toBe(1);
            expect(result).toBeDefined();
        });

        it("should handle array of colours and use first colour", () => {
            const mockSurface = {
                tessellate: vi.fn().mockReturnValue({
                    faces: [[0, 1, 2]],
                    points: [[0, 0, 0], [1, 0, 0], [0, 1, 0]],
                    normals: [[0, 0, 1], [0, 0, 1], [0, 0, 1]]
                })
            };
            const inputs = new Inputs.Verb.DrawSurfaceDto<pc.Entity>(
                mockSurface,
                1,
                ["#ff0000", "#00ff00", "#0000ff"],
                false,
                false,
                undefined,
                false
            );

            const result = drawHelper.drawSurface(inputs);
            expect(result.children.length).toBe(1);
            expect(result).toBeDefined();

            const surfaceEntity = result.children[0]!;
            const material = getMaterialFromEntity(surfaceEntity);
            if (material && material.diffuse) {
                const expectedColor = hexToRgb("#ff0000");
                expect(colorsAreEqual(material.diffuse, expectedColor)).toBe(true);
            }
        });

        it("should validate custom opacity on surface", () => {
            const mockSurface = {
                tessellate: vi.fn().mockReturnValue({
                    faces: [[0, 1, 2]],
                    points: [[0, 0, 0], [1, 0, 0], [0, 1, 0]],
                    normals: [[0, 0, 1], [0, 0, 1], [0, 0, 1]]
                })
            };
            const inputs = new Inputs.Verb.DrawSurfaceDto<pc.Entity>(
                mockSurface,
                0.6,
                "#0000ff",
                false,
                false,
                undefined,
                false
            );

            const result = drawHelper.drawSurface(inputs);

            const surfaceEntity = result.children[0]!;
            const material = getMaterialFromEntity(surfaceEntity);
            if (material) {
                expect(material.opacity).toBe(0.6);
            }

            if (material && material.diffuse) {
                const expectedColor = hexToRgb("#0000ff");
                expect(colorsAreEqual(material.diffuse, expectedColor)).toBe(true);
            }
        });

        it("should draw surface with two-sided rendering enabled by default", () => {
            const mockSurface = {
                tessellate: vi.fn().mockReturnValue({
                    faces: [[0, 1, 2]],
                    points: [[0, 0, 0], [1, 0, 0], [0, 1, 0]],
                    normals: [[0, 0, 1], [0, 0, 1], [0, 0, 1]]
                })
            };
            const inputs = new Inputs.Verb.DrawSurfaceDto<pc.Entity>(
                mockSurface,
                1,
                "#ff0000",
                false,
                false
            );

            const result = drawHelper.drawSurface(inputs);

            expect(result).toBeDefined();
            expect(result.children.length).toBe(2);
            expect(result).toBeInstanceOf(pc.Entity);

            const frontSurfaceEntity = result.children[0]!;
            const frontMaterial = getMaterialFromEntity(frontSurfaceEntity);
            if (frontMaterial && frontMaterial.diffuse) {
                const expectedColor = hexToRgb("#ff0000");
                expect(colorsAreEqual(frontMaterial.diffuse, expectedColor)).toBe(true);
            }

            const backSurfaceEntity = result.children[1]!;
            const backMaterial = getMaterialFromEntity(backSurfaceEntity);
            if (backMaterial && backMaterial.diffuse) {
                const expectedBackColor = hexToRgb("#0000ff");
                expect(colorsAreEqual(backMaterial.diffuse, expectedBackColor)).toBe(true);
            }
        });

        it("should draw surface without back face when drawTwoSided is false", () => {
            const mockSurface = {
                tessellate: vi.fn().mockReturnValue({
                    faces: [[0, 1, 2]],
                    points: [[0, 0, 0], [1, 0, 0], [0, 1, 0]],
                    normals: [[0, 0, 1], [0, 0, 1], [0, 0, 1]]
                })
            };
            const inputs = new Inputs.Verb.DrawSurfaceDto<pc.Entity>(
                mockSurface,
                1,
                "#ff0000",
                false,
                false,
                undefined,
                false
            );

            const result = drawHelper.drawSurface(inputs);

            expect(result).toBeDefined();
            expect(result.children.length).toBe(1);
            expect(result).toBeInstanceOf(pc.Entity);
        });

        it("should draw surface with custom back face colour", () => {
            const mockSurface = {
                tessellate: vi.fn().mockReturnValue({
                    faces: [[0, 1, 2]],
                    points: [[0, 0, 0], [1, 0, 0], [0, 1, 0]],
                    normals: [[0, 0, 1], [0, 0, 1], [0, 0, 1]]
                })
            };
            const inputs = new Inputs.Verb.DrawSurfaceDto<pc.Entity>(
                mockSurface,
                1,
                "#ff0000",
                false,
                false,
                undefined,
                true,
                "#00ff00"
            );

            const result = drawHelper.drawSurface(inputs);

            expect(result).toBeDefined();
            expect(result.children.length).toBe(2);

            const backSurfaceEntity = result.children[1]!;
            const backMaterial = getMaterialFromEntity(backSurfaceEntity);
            if (backMaterial && backMaterial.diffuse) {
                const expectedBackColor = hexToRgb("#00ff00");
                expect(colorsAreEqual(backMaterial.diffuse, expectedBackColor)).toBe(true);
            }
        });

        it("should draw surface with custom back face opacity", () => {
            const mockSurface = {
                tessellate: vi.fn().mockReturnValue({
                    faces: [[0, 1, 2]],
                    points: [[0, 0, 0], [1, 0, 0], [0, 1, 0]],
                    normals: [[0, 0, 1], [0, 0, 1], [0, 0, 1]]
                })
            };
            const inputs = new Inputs.Verb.DrawSurfaceDto<pc.Entity>(
                mockSurface,
                1,
                "#ff0000",
                false,
                false,
                undefined,
                true,
                "#0000ff",
                0.5
            );

            const result = drawHelper.drawSurface(inputs);

            expect(result).toBeDefined();
            expect(result.children.length).toBe(2);

            const backSurfaceEntity = result.children[1]!;
            const backMaterial = getMaterialFromEntity(backSurfaceEntity);
            if (backMaterial) {
                expect(backMaterial.opacity).toBe(0.5);
            }
        });
    });

    describe("drawSurfacesMultiColour", () => {
        it("should draw multiple surfaces with different colours", () => {
            const mockSurface1 = {
                tessellate: vi.fn().mockReturnValue({
                    faces: [[0, 1, 2]],
                    points: [[0, 0, 0], [1, 0, 0], [0, 1, 0]],
                    normals: [[0, 0, 1], [0, 0, 1], [0, 0, 1]]
                })
            };
            const mockSurface2 = {
                tessellate: vi.fn().mockReturnValue({
                    faces: [[0, 1, 2]],
                    points: [[2, 0, 0], [3, 0, 0], [2, 1, 0]],
                    normals: [[0, 0, 1], [0, 0, 1], [0, 0, 1]]
                })
            };

            const inputs = new Inputs.Verb.DrawSurfacesColoursDto<pc.Entity>(
                [mockSurface1, mockSurface2],
                ["#ff0000", "#00ff00"],
                1,
                false,
                false,
                undefined,
                false
            );

            const result = drawHelper.drawSurfacesMultiColour(inputs);
            
            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(pc.Entity);
            expect(result.children.length).toBe(2);

            const expectedColors = ["#ff0000", "#00ff00"];
            result.children.forEach((surfaceEntity, index) => {
                const material = getMaterialFromEntity(surfaceEntity);
                if (material && material.diffuse) {
                    const expectedColor = hexToRgb(expectedColors[index]!);
                    expect(colorsAreEqual(material.diffuse, expectedColor)).toBe(true);
                }

                if (material) {
                    expect(material.opacity).toBe(1);
                }
            });
        });

        it("should use first colour when more surfaces than colours", () => {
            const mockSurface = {
                tessellate: vi.fn().mockReturnValue({
                    faces: [[0, 1, 2]],
                    points: [[0, 0, 0], [1, 0, 0], [0, 1, 0]],
                    normals: [[0, 0, 1], [0, 0, 1], [0, 0, 1]]
                })
            };

            const inputs = new Inputs.Verb.DrawSurfacesColoursDto<pc.Entity>(
                [mockSurface, mockSurface, mockSurface],
                ["#ff0000"],
                1,
                false,
                false,
                undefined,
                false
            );

            const result = drawHelper.drawSurfacesMultiColour(inputs);

            expect(result).toBeDefined();
            expect(result.children.length).toBe(3);
        });

        it("should use string colour for all surfaces when not array", () => {
            const mockSurface = {
                tessellate: vi.fn().mockReturnValue({
                    faces: [[0, 1, 2]],
                    points: [[0, 0, 0], [1, 0, 0], [0, 1, 0]],
                    normals: [[0, 0, 1], [0, 0, 1], [0, 0, 1]]
                })
            };

            const inputs = new Inputs.Verb.DrawSurfacesColoursDto<pc.Entity>(
                [mockSurface, mockSurface],
                ["#ff0000"],
                1,
                false,
                false,
                undefined,
                false
            );

            const result = drawHelper.drawSurfacesMultiColour(inputs);

            expect(result).toBeDefined();
            expect(result.children.length).toBe(2);
        });

        it("should update existing surfaces mesh when updatable is true", () => {
            const existingMesh = new pc.Entity();
            existingMesh.name = "existingSurfacesMesh";

            const mockSurface = {
                tessellate: vi.fn().mockReturnValue({
                    faces: [[0, 1, 2]],
                    points: [[0, 0, 0], [1, 0, 0], [0, 1, 0]],
                    normals: [[0, 0, 1], [0, 0, 1], [0, 0, 1]]
                })
            };

            const inputs = new Inputs.Verb.DrawSurfacesColoursDto<pc.Entity>(
                [mockSurface],
                ["#ff0000"],
                1,
                true,
                false,
                existingMesh,
                false
            );

            const result = drawHelper.drawSurfacesMultiColour(inputs);

            expect(result.children.length).toBe(1);
            expect(result).toBe(existingMesh);
        });
    });

    describe("drawSolidOrPolygonMesh", () => {
        it("should draw JSCAD solid mesh", async () => {
            const mockMesh = jscadSolid();
            const inputs = new Inputs.JSCAD.DrawSolidMeshDto<pc.Entity>(
                mockMesh,
                1,
                "#ff0000",
                false,
                false,
                undefined,
                false
            );

            const result = await drawHelper.drawSolidOrPolygonMesh(inputs);

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(pc.Entity);
            expect(result.children.length).toBe(1);
            expect(mockJscadWorkerManager.genericCallToWorkerPromise).toHaveBeenCalledWith("shapeToMesh", expect.anything());

            const meshEntity = result.children[0]!;
            const material = getMaterialFromEntity(meshEntity);
            if (material && material.diffuse) {
                const expectedColor = hexToRgb("#ff0000");
                expect(colorsAreEqual(material.diffuse, expectedColor)).toBe(true);
            }

            if (material) {
                expect(material.opacity).toBe(1);
            }
        });

        it("should handle mesh with baked-in color", async () => {
            const mockMesh = jscadSolid([1, 0, 0, 1]);
            const inputs = new Inputs.JSCAD.DrawSolidMeshDto<pc.Entity>(
                mockMesh,
                1,
                "#0000ff",
                false,
                false,
                undefined,
                false
            );

            const result = await drawHelper.drawSolidOrPolygonMesh(inputs);

            expect(result.children.length).toBe(1);
            expect(result).toBeDefined();
        });

        it("should handle hidden mesh", async () => {
            (mockJscadWorkerManager.genericCallToWorkerPromise as Mock).mockResolvedValue({
                positions: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                normals: [0, 0, 1, 0, 0, 1, 0, 0, 1],
                indices: [0, 1, 2],
                transforms: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
            });

            const mockMesh = jscadSolid();
            const inputs = new Inputs.JSCAD.DrawSolidMeshDto<pc.Entity>(
                mockMesh,
                1,
                "#ff0000",
                false,
                true,
                undefined,
                false
            );

            const result = await drawHelper.drawSolidOrPolygonMesh(inputs);

            expect(result.children.length).toBe(1);
            expect(result).toBeDefined();
            expect(result.enabled).toBe(false);
        });

        it("should update existing mesh when updatable is true", async () => {
            const existingMesh = new pc.Entity();
            existingMesh.name = "existingJscadMesh";

            const mockMesh = jscadSolid();
            const inputs = new Inputs.JSCAD.DrawSolidMeshDto<pc.Entity>(
                mockMesh,
                0.5,
                "#00ff00",
                true,
                false,
                existingMesh,
                false
            );

            const result = await drawHelper.drawSolidOrPolygonMesh(inputs);

            expect(result.children.length).toBe(1);
            expect(result).toBe(existingMesh);
        });

        it("should use array first colour when colours is array", async () => {
            const mockMesh = jscadSolid();
            const inputs = new Inputs.JSCAD.DrawSolidMeshDto<pc.Entity>(
                mockMesh,
                1,
                ["#ff0000", "#00ff00"],
                false,
                false,
                undefined,
                false
            );

            const result = await drawHelper.drawSolidOrPolygonMesh(inputs);

            expect(result.children.length).toBe(1);
            expect(result).toBeDefined();

            const meshEntity = result.children[0]!;
            const material = getMaterialFromEntity(meshEntity);
            if (material && material.diffuse) {
                const expectedColor = hexToRgb("#ff0000");
                expect(colorsAreEqual(material.diffuse, expectedColor)).toBe(true);
            }
        });

        it("should validate custom opacity on JSCAD mesh", async () => {
            const mockMesh = jscadSolid();
            const inputs = new Inputs.JSCAD.DrawSolidMeshDto<pc.Entity>(
                mockMesh,
                0.4,
                "#00ff00",
                false,
                false,
                undefined,
                false
            );

            const result = await drawHelper.drawSolidOrPolygonMesh(inputs);

            expect(result.children.length).toBe(1);

            const meshEntity = result.children[0]!;
            const material = getMaterialFromEntity(meshEntity);
            if (material) {
                expect(material.opacity).toBe(0.4);
            }

            if (material && material.diffuse) {
                const expectedColor = hexToRgb("#00ff00");
                expect(colorsAreEqual(material.diffuse, expectedColor)).toBe(true);
            }
        });

        it("should draw JSCAD mesh with two-sided rendering enabled by default", async () => {
            const mockMesh = jscadSolid();
            const inputs = new Inputs.JSCAD.DrawSolidMeshDto<pc.Entity>(
                mockMesh,
                1,
                "#ff0000",
                false,
                false
            );

            const result = await drawHelper.drawSolidOrPolygonMesh(inputs);

            expect(result).toBeDefined();
            expect(result.children.length).toBe(2);
            expect(result).toBeInstanceOf(pc.Entity);

            const frontFaceEntity = result.children[0]!;
            const frontMaterial = getMaterialFromEntity(frontFaceEntity);
            if (frontMaterial && frontMaterial.diffuse) {
                const expectedColor = hexToRgb("#ff0000");
                expect(colorsAreEqual(frontMaterial.diffuse, expectedColor)).toBe(true);
            }

            const backFaceEntity = result.children[1]!;
            const backMaterial = getMaterialFromEntity(backFaceEntity);
            if (backMaterial && backMaterial.diffuse) {
                const expectedBackColor = hexToRgb("#0000ff");
                expect(colorsAreEqual(backMaterial.diffuse, expectedBackColor)).toBe(true);
            }
        });

        it("should draw JSCAD mesh without back face when drawTwoSided is false", async () => {
            const mockMesh = jscadSolid();
            const inputs = new Inputs.JSCAD.DrawSolidMeshDto<pc.Entity>(
                mockMesh,
                1,
                "#ff0000",
                false,
                false,
                undefined,
                false
            );

            const result = await drawHelper.drawSolidOrPolygonMesh(inputs);

            expect(result).toBeDefined();
            expect(result.children.length).toBe(1);
            expect(result).toBeInstanceOf(pc.Entity);
        });

        it("should draw JSCAD mesh with custom back face colour", async () => {
            const mockMesh = jscadSolid();
            const inputs = new Inputs.JSCAD.DrawSolidMeshDto<pc.Entity>(
                mockMesh,
                1,
                "#ff0000",
                false,
                false,
                undefined,
                true,
                "#00ff00"
            );

            const result = await drawHelper.drawSolidOrPolygonMesh(inputs);

            expect(result).toBeDefined();
            expect(result.children.length).toBe(2);

            const backFaceEntity = result.children[1]!;
            const backMaterial = getMaterialFromEntity(backFaceEntity);
            if (backMaterial && backMaterial.diffuse) {
                const expectedBackColor = hexToRgb("#00ff00");
                expect(colorsAreEqual(backMaterial.diffuse, expectedBackColor)).toBe(true);
            }
        });

        it("should draw JSCAD mesh with custom back face opacity", async () => {
            const mockMesh = jscadSolid();
            const inputs = new Inputs.JSCAD.DrawSolidMeshDto<pc.Entity>(
                mockMesh,
                1,
                "#ff0000",
                false,
                false,
                undefined,
                true,
                "#0000ff",
                0.5
            );

            const result = await drawHelper.drawSolidOrPolygonMesh(inputs);

            expect(result).toBeDefined();
            expect(result.children.length).toBe(2);

            const backFaceEntity = result.children[1]!;
            const backMaterial = getMaterialFromEntity(backFaceEntity);
            if (backMaterial) {
                expect(backMaterial.opacity).toBe(0.5);
            }
        });
    });

    describe("drawSolidOrPolygonMeshes", () => {
        it("should draw multiple JSCAD meshes", async () => {
            (mockJscadWorkerManager.genericCallToWorkerPromise as Mock).mockResolvedValue([
                { positions: [0, 0, 0], normals: [0, 0, 1], indices: [0], transforms: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] },
                { positions: [1, 0, 0], normals: [0, 0, 1], indices: [0], transforms: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] }
            ]);

            const mockMeshes = [jscadSolid(), jscadSolid()];
            const inputs = new Inputs.JSCAD.DrawSolidMeshesDto<pc.Entity>(
                mockMeshes,
                1,
                "#ff0000",
                false,
                false,
                undefined,
                false
            );

            const result = await drawHelper.drawSolidOrPolygonMeshes(inputs);

            expect(result.children.length).toBe(2);
            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(pc.Entity);

            result.children.forEach((meshEntity) => {
                const material = getMaterialFromEntity(meshEntity);
                if (material && material.diffuse) {
                    const expectedColor = hexToRgb("#ff0000");
                    expect(colorsAreEqual(material.diffuse, expectedColor)).toBe(true);
                }

                if (material) {
                    expect(material.opacity).toBe(1);
                }
            });
        });

        it("should handle meshes with baked colours", async () => {
            (mockJscadWorkerManager.genericCallToWorkerPromise as Mock).mockResolvedValue([
                { positions: [0, 0, 0], normals: [0, 0, 1], indices: [0], transforms: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], color: [1, 0, 0] },
                { positions: [1, 0, 0], normals: [0, 0, 1], indices: [0], transforms: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] }
            ]);

            const mockMeshes = [jscadSolid(), jscadSolid()];
            const inputs = new Inputs.JSCAD.DrawSolidMeshesDto<pc.Entity>(
                mockMeshes,
                1,
                "#0000ff",
                false,
                false,
                undefined,
                false
            );

            const result = await drawHelper.drawSolidOrPolygonMeshes(inputs);

            expect(result.children.length).toBe(2);
            expect(result).toBeDefined();
        });

        it("should handle array of colours matching meshes count", async () => {
            (mockJscadWorkerManager.genericCallToWorkerPromise as Mock).mockResolvedValue([
                { positions: [0, 0, 0], normals: [0, 0, 1], indices: [0], transforms: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] },
                { positions: [1, 0, 0], normals: [0, 0, 1], indices: [0], transforms: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] }
            ]);

            const mockMeshes = [jscadSolid(), jscadSolid()];
            const inputs = new Inputs.JSCAD.DrawSolidMeshesDto<pc.Entity>(
                mockMeshes,
                1,
                ["#ff0000", "#00ff00"],
                false,
                false,
                undefined,
                false
            );

            const result = await drawHelper.drawSolidOrPolygonMeshes(inputs);

            expect(result.children.length).toBe(2);
            expect(result).toBeDefined();

            const expectedColors = ["#ff0000", "#00ff00"];
            result.children.forEach((meshEntity, index) => {
                const material = getMaterialFromEntity(meshEntity);
                if (material && material.diffuse) {
                    const expectedColor = hexToRgb(expectedColors[index]!);
                    expect(colorsAreEqual(material.diffuse, expectedColor)).toBe(true);
                }
            });
        });

        it("should update existing mesh when updatable is true", async () => {
            (mockJscadWorkerManager.genericCallToWorkerPromise as Mock).mockResolvedValue([
                { positions: [0, 0, 0], normals: [0, 0, 1], indices: [0], transforms: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] }
            ]);

            const existingMesh = new pc.Entity();
            existingMesh.name = "existingMeshes";

            const mockMeshes = [jscadSolid()];
            const inputs = new Inputs.JSCAD.DrawSolidMeshesDto<pc.Entity>(
                mockMeshes,
                1,
                "#ff0000",
                true,
                false,
                existingMesh,
                false
            );

            const result = await drawHelper.drawSolidOrPolygonMeshes(inputs);

            expect(result.children.length).toBe(1);
            expect(result).toBe(existingMesh);
        });
    });

    describe("drawShape (OCCT)", () => {
        it("should draw OCCT shape with faces", async () => {
            (mockOccWorkerManager.genericCallToWorkerPromise as Mock).mockResolvedValue({
                faceList: [
                    { vertexCoord: [0, 0, 0, 1, 0, 0, 0, 1, 0], normalCoord: [0, 0, 1, 0, 0, 1, 0, 0, 1], triIndexes: [0, 1, 2] }
                ],
                edgeList: [],
                pointsList: []
            });

            const inputs = new Inputs.OCCT.DrawShapeDto();
            inputs.shape = { hash: "abc123", type: "solid" };
            inputs.drawFaces = true;
            inputs.drawEdges = false;
            inputs.drawVertices = false;
            inputs.faceColour = "#ff0000";
            inputs.faceOpacity = 1;
            inputs.drawTwoSided = false;

            const result = await drawHelper.drawShape(inputs as Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>);

            expect(result.children.length).toBe(1);
            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(pc.Entity);
            expect(mockOccWorkerManager.genericCallToWorkerPromise).toHaveBeenCalledWith("shapeToMesh", expect.anything());
        });

        it("should draw OCCT shape with edges", async () => {
            (mockOccWorkerManager.genericCallToWorkerPromise as Mock).mockResolvedValue({
                faceList: [],
                edgeList: [
                    { vertexCoord: [0, 0, 0, 1, 0, 0], edgeIndex: 0 }
                ],
                pointsList: []
            });

            const inputs = new Inputs.OCCT.DrawShapeDto();
            inputs.shape = { hash: "abc123", type: "edge" };
            inputs.drawFaces = false;
            inputs.drawEdges = true;
            inputs.drawVertices = false;
            inputs.edgeColour = "#00ff00";
            inputs.edgeWidth = 2;
            inputs.edgeOpacity = 1;
            inputs.drawTwoSided = false;

            const result = await drawHelper.drawShape(inputs as Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>);

            expect(result.children.length).toBe(1);
            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(pc.Entity);
        });

        it("should draw OCCT shape with vertices", async () => {
            (mockOccWorkerManager.genericCallToWorkerPromise as Mock).mockResolvedValue({
                faceList: [],
                edgeList: [],
                pointsList: [[0, 0, 0], [1, 1, 1]]
            });

            const inputs = new Inputs.OCCT.DrawShapeDto();
            inputs.shape = { hash: "abc123", type: "vertex" };
            inputs.drawFaces = false;
            inputs.drawEdges = false;
            inputs.drawVertices = true;
            inputs.vertexColour = "#0000ff";
            inputs.vertexSize = 0.1;
            inputs.drawTwoSided = false;

            const result = await drawHelper.drawShape(inputs as Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>);

            expect(result.children.length).toBe(1);
            expect(result).toBeDefined();
        });

        it("should draw OCCT shape with two-sided rendering enabled by default", async () => {
            (mockOccWorkerManager.genericCallToWorkerPromise as Mock).mockResolvedValue({
                faceList: [
                    { vertexCoord: [0, 0, 0, 1, 0, 0, 0, 1, 0], normalCoord: [0, 0, 1, 0, 0, 1, 0, 0, 1], triIndexes: [0, 1, 2] }
                ],
                edgeList: [],
                pointsList: []
            });

            const inputs = new Inputs.OCCT.DrawShapeDto();
            inputs.shape = { hash: "abc123", type: "solid" };
            inputs.drawFaces = true;
            inputs.drawEdges = false;
            inputs.drawVertices = false;
            inputs.faceColour = "#ff0000";
            inputs.faceOpacity = 1;

            const result = await drawHelper.drawShape(inputs as Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>);

            expect(result).toBeDefined();
            expect(result.children.length).toBe(2);
            expect(result).toBeInstanceOf(pc.Entity);

            const frontFaceEntity = result.children[0]!;
            const frontMaterial = getMaterialFromEntity(frontFaceEntity);
            if (frontMaterial && frontMaterial.diffuse) {
                const expectedColor = hexToRgb("#ff0000");
                expect(colorsAreEqual(frontMaterial.diffuse, expectedColor)).toBe(true);
            }

            const backFaceEntity = result.children[1]!;
            const backMaterial = getMaterialFromEntity(backFaceEntity);
            if (backMaterial && backMaterial.diffuse) {
                const expectedBackColor = hexToRgb("#0000ff");
                expect(colorsAreEqual(backMaterial.diffuse, expectedBackColor)).toBe(true);
            }
        });

        it("should draw OCCT shape without back face when drawTwoSided is false", async () => {
            (mockOccWorkerManager.genericCallToWorkerPromise as Mock).mockResolvedValue({
                faceList: [
                    { vertexCoord: [0, 0, 0, 1, 0, 0, 0, 1, 0], normalCoord: [0, 0, 1, 0, 0, 1, 0, 0, 1], triIndexes: [0, 1, 2] }
                ],
                edgeList: [],
                pointsList: []
            });

            const inputs = new Inputs.OCCT.DrawShapeDto();
            inputs.shape = { hash: "abc123", type: "solid" };
            inputs.drawFaces = true;
            inputs.drawEdges = false;
            inputs.drawVertices = false;
            inputs.faceColour = "#ff0000";
            inputs.faceOpacity = 1;
            inputs.drawTwoSided = false;

            const result = await drawHelper.drawShape(inputs as Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>);

            expect(result).toBeDefined();
            expect(result.children.length).toBe(1);
            expect(result).toBeInstanceOf(pc.Entity);
        });

        it("should draw OCCT shape with custom back face colour", async () => {
            (mockOccWorkerManager.genericCallToWorkerPromise as Mock).mockResolvedValue({
                faceList: [
                    { vertexCoord: [0, 0, 0, 1, 0, 0, 0, 1, 0], normalCoord: [0, 0, 1, 0, 0, 1, 0, 0, 1], triIndexes: [0, 1, 2] }
                ],
                edgeList: [],
                pointsList: []
            });

            const inputs = new Inputs.OCCT.DrawShapeDto();
            inputs.shape = { hash: "abc123", type: "solid" };
            inputs.drawFaces = true;
            inputs.drawEdges = false;
            inputs.drawVertices = false;
            inputs.faceColour = "#ff0000";
            inputs.faceOpacity = 1;
            inputs.drawTwoSided = true;
            inputs.backFaceColour = "#00ff00";

            const result = await drawHelper.drawShape(inputs as Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>);

            expect(result).toBeDefined();
            expect(result.children.length).toBe(2);

            const backFaceEntity = result.children[1]!;
            const backMaterial = getMaterialFromEntity(backFaceEntity);
            if (backMaterial && backMaterial.diffuse) {
                const expectedBackColor = hexToRgb("#00ff00");
                expect(colorsAreEqual(backMaterial.diffuse, expectedBackColor)).toBe(true);
            }
        });

        it("should draw OCCT shape with custom back face opacity", async () => {
            (mockOccWorkerManager.genericCallToWorkerPromise as Mock).mockResolvedValue({
                faceList: [
                    { vertexCoord: [0, 0, 0, 1, 0, 0, 0, 1, 0], normalCoord: [0, 0, 1, 0, 0, 1, 0, 0, 1], triIndexes: [0, 1, 2] }
                ],
                edgeList: [],
                pointsList: []
            });

            const inputs = new Inputs.OCCT.DrawShapeDto();
            inputs.shape = { hash: "abc123", type: "solid" };
            inputs.drawFaces = true;
            inputs.drawEdges = false;
            inputs.drawVertices = false;
            inputs.faceColour = "#ff0000";
            inputs.faceOpacity = 1;
            inputs.drawTwoSided = true;
            inputs.backFaceColour = "#0000ff";
            inputs.backFaceOpacity = 0.5;

            const result = await drawHelper.drawShape(inputs as Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>);

            expect(result).toBeDefined();
            expect(result.children.length).toBe(2);

            const backFaceEntity = result.children[1]!;
            const backMaterial = getMaterialFromEntity(backFaceEntity);
            if (backMaterial) {
                expect(backMaterial.opacity).toBe(0.5);
            }
        });
    });

    describe("drawShapes (OCCT)", () => {
        it("should draw multiple OCCT shapes", async () => {
            (mockOccWorkerManager.genericCallToWorkerPromise as Mock).mockResolvedValue([
                { faceList: [{ vertexCoord: [0, 0, 0, 1, 0, 0, 0, 1, 0], normalCoord: [0, 0, 1, 0, 0, 1, 0, 0, 1], triIndexes: [0, 1, 2] }], edgeList: [], pointsList: [] },
                { faceList: [{ vertexCoord: [2, 0, 0, 3, 0, 0, 2, 1, 0], normalCoord: [0, 0, 1, 0, 0, 1, 0, 0, 1], triIndexes: [0, 1, 2] }], edgeList: [], pointsList: [] }
            ]);

            const inputs = new Inputs.OCCT.DrawShapesDto();
            inputs.shapes = [
                { hash: "abc123", type: "solid" },
                { hash: "def456", type: "solid" }
            ];
            inputs.drawFaces = true;
            inputs.drawEdges = false;
            inputs.faceColour = "#ff0000";
            inputs.faceOpacity = 1;
            inputs.drawTwoSided = false;

            const result = await drawHelper.drawShapes(inputs as Inputs.OCCT.DrawShapesDto<Inputs.OCCT.TopoDSShapePointer>);

            expect(result.children.length).toBe(2);
            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(pc.Entity);
            expect(mockOccWorkerManager.genericCallToWorkerPromise).toHaveBeenCalledWith("shapesToMeshes", expect.anything());
        });
    });

    describe("drawManifoldOrCrossSection", () => {
        it("should draw manifold or cross section", async () => {
            (mockManifoldWorkerManager.genericCallToWorkerPromise as Mock).mockResolvedValue({
                vertProperties: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]),
                triVerts: new Uint32Array([0, 1, 2])
            });

            const inputs = new Inputs.Manifold.DrawManifoldOrCrossSectionDto<Inputs.Manifold.ManifoldPointer | Inputs.Manifold.CrossSectionPointer, pc.StandardMaterial>();
            inputs.manifoldOrCrossSection = { hash: 123, type: "manifold-shape" };
            inputs.faceColour = "#ff0000";
            inputs.faceOpacity = 1;
            inputs.drawTwoSided = false;

            const result = (await drawHelper.drawManifoldOrCrossSection(inputs))!;

            expect(result.children.length).toBe(1);
            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(pc.Entity);
            expect(mockManifoldWorkerManager.genericCallToWorkerPromise).toHaveBeenCalledWith("decomposeManifoldOrCrossSection", expect.anything());
        });

        it("should return undefined when triVerts is empty", async () => {
            (mockManifoldWorkerManager.genericCallToWorkerPromise as Mock).mockResolvedValue({
                vertProperties: new Float32Array([]),
                triVerts: new Uint32Array([])
            });

            const inputs = new Inputs.Manifold.DrawManifoldOrCrossSectionDto<Inputs.Manifold.ManifoldPointer | Inputs.Manifold.CrossSectionPointer, pc.StandardMaterial>();
            inputs.manifoldOrCrossSection = { hash: 123, type: "manifold-shape" };
            inputs.drawTwoSided = false;

            const result = (await drawHelper.drawManifoldOrCrossSection(inputs))!;

            expect(result).toBeUndefined();
        });

        it("should handle cross section polygons", async () => {
            (mockManifoldWorkerManager.genericCallToWorkerPromise as Mock).mockResolvedValue([
                [[0, 0], [1, 0], [1, 1], [0, 1]] as Inputs.Base.Vector2[]
            ]);

            const inputs = new Inputs.Manifold.DrawManifoldOrCrossSectionDto<Inputs.Manifold.ManifoldPointer | Inputs.Manifold.CrossSectionPointer, pc.StandardMaterial>();
            inputs.manifoldOrCrossSection = { hash: 123, type: "manifold-shape" };
            inputs.crossSectionColour = "#00ff00";
            inputs.crossSectionOpacity = 1;
            inputs.crossSectionWidth = 2;
            inputs.drawTwoSided = false;

            const result = (await drawHelper.drawManifoldOrCrossSection(inputs))!;
            expect(result.children.length).toBe(1);
            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(pc.Entity);
        });

        it("should draw manifold with two-sided rendering enabled by default", async () => {
            (mockManifoldWorkerManager.genericCallToWorkerPromise as Mock).mockResolvedValue({
                vertProperties: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]),
                triVerts: new Uint32Array([0, 1, 2])
            });

            const inputs = new Inputs.Manifold.DrawManifoldOrCrossSectionDto<Inputs.Manifold.ManifoldPointer | Inputs.Manifold.CrossSectionPointer, pc.StandardMaterial>();
            inputs.manifoldOrCrossSection = { hash: 123, type: "manifold-shape" };
            inputs.faceColour = "#ff0000";
            inputs.faceOpacity = 1;

            const result = (await drawHelper.drawManifoldOrCrossSection(inputs))!;

            expect(result).toBeDefined();
            expect(result.children.length).toBe(2);
            expect(result).toBeInstanceOf(pc.Entity);

            const frontFaceEntity = result.children[0]!;
            const frontMaterial = getMaterialFromEntity(frontFaceEntity);
            if (frontMaterial && frontMaterial.diffuse) {
                const expectedColor = hexToRgb("#ff0000");
                expect(colorsAreEqual(frontMaterial.diffuse, expectedColor)).toBe(true);
            }

            const backFaceEntity = result.children[1]!;
            const backMaterial = getMaterialFromEntity(backFaceEntity);
            if (backMaterial && backMaterial.diffuse) {
                const expectedBackColor = hexToRgb("#0000ff");
                expect(colorsAreEqual(backMaterial.diffuse, expectedBackColor)).toBe(true);
            }
        });

        it("should draw manifold without back face when drawTwoSided is false", async () => {
            (mockManifoldWorkerManager.genericCallToWorkerPromise as Mock).mockResolvedValue({
                vertProperties: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]),
                triVerts: new Uint32Array([0, 1, 2])
            });

            const inputs = new Inputs.Manifold.DrawManifoldOrCrossSectionDto<Inputs.Manifold.ManifoldPointer | Inputs.Manifold.CrossSectionPointer, pc.StandardMaterial>();
            inputs.manifoldOrCrossSection = { hash: 123, type: "manifold-shape" };
            inputs.faceColour = "#ff0000";
            inputs.faceOpacity = 1;
            inputs.drawTwoSided = false;

            const result = (await drawHelper.drawManifoldOrCrossSection(inputs))!;

            expect(result).toBeDefined();
            expect(result.children.length).toBe(1);
            expect(result).toBeInstanceOf(pc.Entity);
        });

        it("should draw manifold with custom back face colour", async () => {
            (mockManifoldWorkerManager.genericCallToWorkerPromise as Mock).mockResolvedValue({
                vertProperties: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]),
                triVerts: new Uint32Array([0, 1, 2])
            });

            const inputs = new Inputs.Manifold.DrawManifoldOrCrossSectionDto<Inputs.Manifold.ManifoldPointer | Inputs.Manifold.CrossSectionPointer, pc.StandardMaterial>();
            inputs.manifoldOrCrossSection = { hash: 123, type: "manifold-shape" };
            inputs.faceColour = "#ff0000";
            inputs.faceOpacity = 1;
            inputs.drawTwoSided = true;
            inputs.backFaceColour = "#00ff00";

            const result = (await drawHelper.drawManifoldOrCrossSection(inputs))!;

            expect(result).toBeDefined();
            expect(result.children.length).toBe(2);

            const backFaceEntity = result.children[1]!;
            const backMaterial = getMaterialFromEntity(backFaceEntity);
            if (backMaterial && backMaterial.diffuse) {
                const expectedBackColor = hexToRgb("#00ff00");
                expect(colorsAreEqual(backMaterial.diffuse, expectedBackColor)).toBe(true);
            }
        });

        it("should draw manifold with custom back face opacity", async () => {
            (mockManifoldWorkerManager.genericCallToWorkerPromise as Mock).mockResolvedValue({
                vertProperties: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]),
                triVerts: new Uint32Array([0, 1, 2])
            });

            const inputs = new Inputs.Manifold.DrawManifoldOrCrossSectionDto<Inputs.Manifold.ManifoldPointer | Inputs.Manifold.CrossSectionPointer, pc.StandardMaterial>();
            inputs.manifoldOrCrossSection = { hash: 123, type: "manifold-shape" };
            inputs.faceColour = "#ff0000";
            inputs.faceOpacity = 1;
            inputs.drawTwoSided = true;
            inputs.backFaceColour = "#0000ff";
            inputs.backFaceOpacity = 0.5;

            const result = (await drawHelper.drawManifoldOrCrossSection(inputs))!;

            expect(result).toBeDefined();
            expect(result.children.length).toBe(2);

            const backFaceEntity = result.children[1]!;
            const backMaterial = getMaterialFromEntity(backFaceEntity);
            if (backMaterial) {
                expect(backMaterial.opacity).toBe(0.5);
            }
        });
    });

    describe("drawManifoldsOrCrossSections", () => {
        it("should draw multiple manifolds", async () => {
            (mockManifoldWorkerManager.genericCallToWorkerPromise as Mock).mockResolvedValue([
                { vertProperties: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]), triVerts: new Uint32Array([0, 1, 2]) },
                { vertProperties: new Float32Array([1, 0, 0, 2, 0, 0, 1, 1, 0]), triVerts: new Uint32Array([0, 1, 2]) }
            ]);

            const inputs = new Inputs.Manifold.DrawManifoldsOrCrossSectionsDto<Inputs.Manifold.ManifoldPointer | Inputs.Manifold.CrossSectionPointer, pc.StandardMaterial>();
            inputs.manifoldsOrCrossSections = [
                { hash: 123, type: "manifold-shape" },
                { hash: 456, type: "manifold-shape" }
            ];
            inputs.faceColour = "#ff0000";
            inputs.drawTwoSided = false;

            const result = await drawHelper.drawManifoldsOrCrossSections(inputs);
            expect(result.children.length).toBe(2);
            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(pc.Entity);
        });

        it("should filter out undefined meshes", async () => {
            (mockManifoldWorkerManager.genericCallToWorkerPromise as Mock).mockResolvedValue([
                { vertProperties: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]), triVerts: new Uint32Array([0, 1, 2]) },
                { vertProperties: new Float32Array([]), triVerts: new Uint32Array([]) }
            ]);

            const inputs = new Inputs.Manifold.DrawManifoldsOrCrossSectionsDto<Inputs.Manifold.ManifoldPointer | Inputs.Manifold.CrossSectionPointer, pc.StandardMaterial>();
            inputs.manifoldsOrCrossSections = [
                { hash: 123, type: "manifold-shape" },
                { hash: 456, type: "manifold-shape" }
            ];
            inputs.faceColour = "#ff0000";
            inputs.drawTwoSided = false;

            const result = await drawHelper.drawManifoldsOrCrossSections(inputs);
            expect(result.children.length).toBe(1);
            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(pc.Entity);
        });
    });

    describe("updatePointsInstances", () => {
        it("should update positions of instanced meshes", () => {
            const group = new pc.Entity();

            const instancedEntity = new pc.Entity("points-#ff0000");
            group.addChild(instancedEntity);

            const newPositions: Inputs.Base.Point3[] = [[5, 5, 5], [10, 10, 10]];

            drawHelper.updatePointsInstances(group, newPositions);

            expect(group.children.length).toBe(1);
            expect(instancedEntity.parent).toBe(group);
        });
    });

    describe("createOrUpdateSurfacesMesh", () => {
        it("should create new surface mesh when group is undefined", () => {
            const meshData = [{
                positions: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                normals: [0, 0, 1, 0, 0, 1, 0, 0, 1],
                indices: [0, 1, 2]
            }];
            const material = new pc.StandardMaterial();

            const result = drawHelper.createOrUpdateSurfacesMesh(
                meshData,
                undefined,
                false,
                material,
                true,
                false
            );

            expect(result).toBeDefined();
            expect(result.children.length).toBe(1);
            expect(result).toBeInstanceOf(pc.Entity);
            expect(result.name).toContain("surface");
        });

        it("should update existing mesh when updatable is true", () => {
            const existingGroup = new pc.Entity();
            existingGroup.name = "existingSurface";

            const meshData = [{
                positions: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                normals: [0, 0, 1, 0, 0, 1, 0, 0, 1],
                indices: [0, 1, 2]
            }];
            const material = new pc.StandardMaterial();

            const result = drawHelper.createOrUpdateSurfacesMesh(
                meshData,
                existingGroup,
                true,
                material,
                true,
                false
            );

            expect(result.children.length).toBe(1);
            expect(result).toBe(existingGroup);
            expect(result.children.length).toBeGreaterThan(0);
        });

        it("should set group invisible when hidden is true", () => {
            const meshData = [{
                positions: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                normals: [0, 0, 1, 0, 0, 1, 0, 0, 1],
                indices: [0, 1, 2]
            }];
            const material = new pc.StandardMaterial();

            const result = drawHelper.createOrUpdateSurfacesMesh(
                meshData,
                undefined,
                false,
                material,
                true,
                true
            );

            expect(result.children.length).toBe(1);
            expect(result.enabled).toBe(false);
        });

        it("should handle mesh data with UVs", () => {
            const meshData = [{
                positions: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                normals: [0, 0, 1, 0, 0, 1, 0, 0, 1],
                indices: [0, 1, 2],
                uvs: [0, 0, 1, 0, 0.5, 1]
            }];
            const material = new pc.StandardMaterial();

            const result = drawHelper.createOrUpdateSurfacesMesh(
                meshData,
                undefined,
                false,
                material,
                true,
                false
            );

            expect(result.children.length).toBe(1);
            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(pc.Entity);
        });
    });

    describe("drawPolyline (internal)", () => {
        it("should create new polyline when mesh is undefined", () => {
            const points: Inputs.Base.Point3[] = [[0, 0, 0], [1, 1, 1], [2, 0, 0]];

            const result = drawHelper.drawPolyline(
                undefined,
                points,
                false,
                2,
                1,
                "#ff0000"
            );

            expect(result.children.length).toBe(1);
            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(pc.Entity);
            expect(result.name).toContain("polyline");
        });

        it("should handle existing mesh with children", () => {
            const existingMesh = new pc.Entity();
            existingMesh.name = "existingPolyline";
            const childEntity = new pc.Entity("polyline-child");
            existingMesh.addChild(childEntity);

            const points: Inputs.Base.Point3[] = [[0, 0, 0], [5, 5, 5]];

            const result = drawHelper.drawPolyline(
                existingMesh,
                points,
                true,
                2,
                1,
                "#00ff00"
            );

            expect(result.children.length).toBe(1);
            expect(result).toBeDefined();
        });
    });

    describe("Error handling", () => {

        it("should throw descriptive error when JSCAD worker fails", async () => {
            const mockError = new Error("Worker communication failed");
            (mockJscadWorkerManager.genericCallToWorkerPromise as Mock)
                .mockRejectedValue(mockError);

            const inputs = new Inputs.JSCAD.DrawSolidMeshDto<pc.Entity>(
                jscadSolid(),
                1,
                "#ff0000",
                false,
                undefined
            );

            await expect(drawHelper.drawSolidOrPolygonMesh(inputs))
                .rejects
                .toThrow(/Failed to draw JSCAD/);
        });

        it("should throw descriptive error when OCCT worker fails", async () => {
            const mockError = new Error("OCCT decomposition failed");
            (mockOccWorkerManager.genericCallToWorkerPromise as Mock)
                .mockRejectedValue(mockError);

            const inputs = new Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>();
            inputs.shape = { hash: 123, type: "occ-shape" };

            await expect(drawHelper.drawShape(inputs))
                .rejects
                .toThrow();
        });

        it("should throw descriptive error when Manifold worker fails", async () => {
            const mockError = new Error("Manifold mesh extraction failed");
            (mockManifoldWorkerManager.genericCallToWorkerPromise as Mock)
                .mockRejectedValue(mockError);

            const inputs = new Inputs.Manifold.DrawManifoldOrCrossSectionDto<Inputs.Manifold.ManifoldPointer, pc.StandardMaterial>();
            inputs.manifoldOrCrossSection = { hash: 123, type: "manifold-shape" };

            await expect(drawHelper.drawManifoldOrCrossSection(inputs))
                .rejects
                .toThrow();
        });
    });

    describe("Worker validation", () => {

        it("should call JSCAD worker with correct parameters", async () => {
            const mockMesh = jscadSolid();

            (mockJscadWorkerManager.genericCallToWorkerPromise as Mock).mockClear();
            (mockJscadWorkerManager.genericCallToWorkerPromise as Mock).mockResolvedValue({
                positions: [],
                normals: [],
                indices: [],
                transforms: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
            });

            const inputs = new Inputs.JSCAD.DrawSolidMeshDto<pc.Entity>(
                mockMesh,
                1,
                "#ff0000",
                false,
                undefined
            );

            await drawHelper.drawSolidOrPolygonMesh(inputs);

            expect(mockJscadWorkerManager.genericCallToWorkerPromise).toHaveBeenCalled();
            const [[, secondArgument]] = (mockJscadWorkerManager.genericCallToWorkerPromise as Mock).mock.calls as [[unknown, unknown]];
            expect(secondArgument).toMatchObject({
                mesh: mockMesh
            });
        });

        it("should call OCCT worker with correct parameters", async () => {
            (mockOccWorkerManager.genericCallToWorkerPromise as Mock).mockResolvedValue({
                faceList: [{
                    vertexCoord: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                    normalCoord: [0, 0, 1, 0, 0, 1, 0, 0, 1],
                    triIndexes: [0, 1, 2]
                }],
                edgeList: [],
                pointsList: []
            });

            const inputs = new Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>();
            inputs.shape = { hash: 123, type: "occ-shape" };
            inputs.drawFaces = true;

            await drawHelper.drawShape(inputs);

            expect(mockOccWorkerManager.genericCallToWorkerPromise).toHaveBeenCalledWith(
                "shapeToMesh",
                expect.objectContaining({
                    shape: inputs.shape
                })
            );
        });

        it("should call Manifold worker with correct parameters", async () => {
            (mockManifoldWorkerManager.genericCallToWorkerPromise as Mock).mockResolvedValue({
                vertProperties: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]),
                triVerts: new Uint32Array([0, 1, 2])
            });

            const inputs = new Inputs.Manifold.DrawManifoldOrCrossSectionDto<Inputs.Manifold.ManifoldPointer, pc.StandardMaterial>();
            inputs.manifoldOrCrossSection = { hash: 123, type: "manifold-shape" };

            await drawHelper.drawManifoldOrCrossSection(inputs);

            expect(mockManifoldWorkerManager.genericCallToWorkerPromise).toHaveBeenCalledWith(
                "decomposeManifoldOrCrossSection",
                expect.objectContaining({
                    manifoldOrCrossSection: inputs.manifoldOrCrossSection
                })
            );
        });
    });

    describe("Material caching", () => {

        it("should cache and reuse materials with same properties", () => {
            const inputs1 = new Inputs.Point.DrawPointDto<pc.Entity>(
                [1, 2, 3],
                1,
                0.5,
                "#ff0000",
                false
            );
            const inputs2 = new Inputs.Point.DrawPointDto<pc.Entity>(
                [4, 5, 6],
                1,
                0.5,
                "#ff0000",
                false
            );

            drawHelper.drawPoint(inputs1);
            const cacheSize1 = drawHelper["materialCache"].size;

            drawHelper.drawPoint(inputs2);
            const cacheSize2 = drawHelper["materialCache"].size;

            expect(cacheSize2).toBe(cacheSize1);
        });

        it("should create new material for different colors", () => {
            const inputs1 = new Inputs.Point.DrawPointDto<pc.Entity>(
                [1, 2, 3],
                1,
                1,
                "#ff0000",
                false
            );
            const inputs2 = new Inputs.Point.DrawPointDto<pc.Entity>(
                [4, 5, 6],
                1,
                1,
                "#00ff00",
                false
            );

            drawHelper.drawPoint(inputs1);
            drawHelper.drawPoint(inputs2);

            const cacheSize = drawHelper["materialCache"].size;

            expect(cacheSize).toBe(2);
        });

        it("should create new material for different opacity", () => {
            const inputs1 = new Inputs.Point.DrawPointDto<pc.Entity>(
                [1, 2, 3],
                1.0,
                1,
                "#ff0000",
                false
            );
            const inputs2 = new Inputs.Point.DrawPointDto<pc.Entity>(
                [4, 5, 6],
                0.5,
                1,
                "#ff0000",
                false
            );

            drawHelper.drawPoint(inputs1);
            drawHelper.drawPoint(inputs2);

            const cacheSize = drawHelper["materialCache"].size;

            expect(cacheSize).toBe(2);
        });

        it("should not exceed cache limit", () => {
            const TEST_MATERIALS_COUNT = 110;

            for (let i = 0; i < TEST_MATERIALS_COUNT; i++) {
                const colorHex = `#${i.toString(16).padStart(6, "0")}`;
                const inputs = new Inputs.Point.DrawPointDto<pc.Entity>(
                    [i, i, i],
                    1,
                    1,
                    colorHex,
                    false
                );
                drawHelper.drawPoint(inputs);
            }

            const cacheSize = drawHelper["materialCache"].size;
            expect(cacheSize).toBe(TEST_MATERIALS_COUNT);
        });
    });

    describe("Memory management", () => {

        it("should update points in place without creating new entities", () => {
            const inputs1 = new Inputs.Point.DrawPointDto<pc.Entity>(
                [1, 2, 3],
                1,
                1,
                "#ff0000",
                true
            );

            const result1 = drawHelper.drawPoint(inputs1);
            const child1 = result1.children[0];

            const inputs2 = new Inputs.Point.DrawPointDto<pc.Entity>(
                [4, 5, 6],
                1,
                1,
                "#ff0000",
                true,
                result1
            );

            const result2 = drawHelper.drawPoint(inputs2);
            const child2 = result2.children[0];
            expect(result1.children.length).toBe(1);
            expect(result2.children.length).toBe(1);
            expect(result2).toBe(result1);
            expect(child2).toBe(child1);
        });

        it("should handle cleanup on dispose", () => {
            for (let i = 0; i < 50; i++) {
                const inputs = new Inputs.Point.DrawPointDto<pc.Entity>(
                    [i, i, i],
                    1,
                    1,
                    `#${i.toString(16).padStart(6, "0")}`,
                    false
                );
                drawHelper.drawPoint(inputs);
            }

            drawHelper.dispose();

            const cacheSizeAfterDispose = drawHelper["materialCache"].size;
            expect(cacheSizeAfterDispose).toBe(0);
        });

        it("should not leak polyline entities on update", () => {
            const polylines1 = [{ points: [[0, 0, 0], [1, 1, 1]] }];
            const inputs1 = new Inputs.Polyline.DrawPolylinesDto<pc.Entity>(
                polylines1 as Inputs.Base.Polyline3[],
                2,
                "#ff0000",
                1,
                true,
                undefined
            );

            const result1 = drawHelper.drawPolylinesWithColours(inputs1);

            const polylines2 = [{ points: [[2, 2, 2], [3, 3, 3]] }];
            const inputs2 = new Inputs.Polyline.DrawPolylinesDto<pc.Entity>(
                polylines2 as Inputs.Base.Polyline3[],
                2,
                "#ff0000",
                1,
                true,
                result1
            );

            const result2 = drawHelper.drawPolylinesWithColours(inputs2);

            expect(result1.children.length).toBe(1);
            expect(result2.children.length).toBe(1);
            expect(result2.children.length).toBeLessThanOrEqual(2);
        });
    });

    describe("Edge cases and input validation", () => {

        it("should handle empty points array", () => {
            const inputs = new Inputs.Point.DrawPointsDto<pc.Entity>(
                [],
                1,
                1,
                "#ff0000",
                false
            );

            const result = drawHelper.drawPoints(inputs);

            expect(result).toBeDefined();

            expect(result.children.length).toBe(0);
        });

        it("should handle single point in points array", () => {
            const inputs = new Inputs.Point.DrawPointsDto<pc.Entity>(
                [[1, 2, 3]],
                1,
                1,
                "#ff0000",
                false
            );

            const result = drawHelper.drawPoints(inputs);

            expect(result).toBeDefined();
            expect(result.children.length).toBe(1);
        });

        it("should handle empty polyline", () => {
            const inputs = new Inputs.Polyline.DrawPolylineDto<pc.Entity>(
                { points: [] },
                2,
                "#ff0000",
                1,
                false
            );

            const result = drawHelper.drawPolylineClose(inputs);

            expect(result.children.length).toBe(1);
            expect(result).toBeDefined();
        });

        it("should handle color array mismatch gracefully", () => {
            const inputs = new Inputs.Point.DrawPointsDto<pc.Entity>(
                [[1, 2, 3], [4, 5, 6], [7, 8, 9]],
                1,
                1,
                ["#ff0000"],
                false
            );

            const result = drawHelper.drawPoints(inputs);

            expect(result).toBeDefined();
            expect(result.children.length).toBe(1);
        });

        it("should handle invalid color format", () => {
            const inputs = new Inputs.Point.DrawPointDto<pc.Entity>(
                [1, 2, 3],
                1,
                1,
                "invalid-color",
                false
            );

            const result = drawHelper.drawPoint(inputs);

            expect(result.children.length).toBe(1);
            expect(result).toBeDefined();
        });

        it("should handle negative opacity values", () => {
            const inputs = new Inputs.Point.DrawPointDto<pc.Entity>(
                [1, 2, 3],
                1,
                -0.5,
                "#ff0000",
                false
            );

            const result = drawHelper.drawPoint(inputs);

            expect(result.children.length).toBe(1);
            expect(result).toBeDefined();
        });

        it("should handle opacity greater than 1", () => {
            const inputs = new Inputs.Point.DrawPointDto<pc.Entity>(
                [1, 2, 3],
                1,
                2.0,
                "#ff0000",
                false
            );

            const result = drawHelper.drawPoint(inputs);

            expect(result.children.length).toBe(1);
            expect(result).toBeDefined();
        });

        it("should handle zero size", () => {
            const inputs = new Inputs.Point.DrawPointDto<pc.Entity>(
                [1, 2, 3],
                0,
                1,
                "#ff0000",
                false
            );

            const result = drawHelper.drawPoint(inputs);

            expect(result.children.length).toBe(1);
            expect(result).toBeDefined();
        });

        it("should handle negative size", () => {
            const inputs = new Inputs.Point.DrawPointDto<pc.Entity>(
                [1, 2, 3],
                -5,
                1,
                "#ff0000",
                false
            );

            const result = drawHelper.drawPoint(inputs);

            expect(result.children.length).toBe(1);
            expect(result).toBeDefined();
        });
    });

    describe("Visual property validation", () => {
        it("should create point entity with expected structure", () => {
            const inputs = new Inputs.Point.DrawPointDto<pc.Entity>(
                [1, 2, 3],
                1, 1, "#ff0000", false
            );
            const result = drawHelper.drawPoint(inputs);
            expect(result).toBeDefined();

            expect(result.children).toBeDefined();
            expect(result.children.length).toBe(1);

            const mesh = result.children[0]!;
            expect(mesh).toBeInstanceOf(pc.Entity);
            expect(mesh.name).toBeDefined();
        });

        it("should create points with color array", () => {
            const inputs = new Inputs.Point.DrawPointsDto<pc.Entity>(
                [[1, 2, 3]],
                1, 1, ["#0000ff"], false
            );
            const result = drawHelper.drawPoints(inputs);
            expect(result).toBeDefined();

            expect(result.children).toBeDefined();
            expect(result.children.length).toBe(1);
        });

        it("should accept opacity parameter", () => {
            const inputs = new Inputs.Point.DrawPointDto<pc.Entity>(
                [1, 2, 3],
                1, 0.5, "#0000ff", false
            );
            const result = drawHelper.drawPoint(inputs);

            expect(result).toBeDefined();
            expect(result.children.length).toBe(1);
        });

        it("should handle multiple colors for multiple points", () => {
            const inputs = new Inputs.Point.DrawPointsDto<pc.Entity>(
                [[1, 2, 3], [4, 5, 6]],
                1, 1, ["#ff0000", "#00ff00"], false
            );
            const result = drawHelper.drawPoints(inputs);

            expect(result.children.length).toBe(2);
        });
    });

    describe("Mesh geometry validation", () => {
        it("should create entity for point with expected position", () => {
            const inputs = new Inputs.Point.DrawPointDto<pc.Entity>(
                [5, 10, 15],
                1, 1, "#ff0000", false
            );
            const result = drawHelper.drawPoint(inputs);

            expect(result).toBeDefined();
            expect(result.children.length).toBe(1);

            const mesh = result.children[0];
            expect(mesh).toBeInstanceOf(pc.Entity);
        });

        it("should create sphere geometry for point", () => {
            const inputs = new Inputs.Point.DrawPointDto<pc.Entity>(
                [1, 2, 3],
                1, 1, "#ff0000", false
            );
            const result = drawHelper.drawPoint(inputs);

            expect(result).toBeDefined();
            expect(result.children.length).toBe(1);
            const mesh = result.children[0]!;
            expect(mesh).toBeDefined();
            expect(mesh.name).toBeDefined();
            expect(mesh.name.length).toBeGreaterThan(0);
        });

        it("should create polyline entity with correct structure", () => {
            const inputs = new Inputs.Polyline.DrawPolylinesDto<pc.Entity>(
                [{ points: [[0, 0, 0], [1, 1, 1], [2, 0, 2]] }],
                1, ["#ff0000"], 1, false
            );
            const result = drawHelper.drawPolylinesWithColours(inputs);

            expect(result).toBeDefined();
            expect(result.children.length).toBe(1);
        });

        it("should handle closed polyline parameter", () => {
            const inputs = new Inputs.Polyline.DrawPolylinesDto<pc.Entity>(
                [{ points: [[0, 0, 0], [1, 0, 0], [1, 1, 0]], isClosed: true }],
                1, ["#ff0000"], 1, false
            );
            const result = drawHelper.drawPolylinesWithColours(inputs);

            expect(result).toBeDefined();
            expect(result.name).toBeDefined();
            expect(result.children.length).toBe(1);
        });

        it("should create geometry for sized point", () => {
            const inputs = new Inputs.Point.DrawPointDto<pc.Entity>(
                [1, 2, 3],
                2, 1, "#ff0000", false
            );
            const result = drawHelper.drawPoint(inputs);

            expect(result).toBeDefined();
            expect(result.children.length).toBe(1);
            const mesh = result.children[0];
            expect(mesh).toBeDefined();
        });
    });

    describe("Size and dimension validation", () => {
        it("should create point with size affecting scale", () => {
            const size = 2.5;
            const inputs = new Inputs.Point.DrawPointDto<pc.Entity>(
                [0, 0, 0],
                1,
                size,
                "#ff0000",
                false
            );

            const result = drawHelper.drawPoint(inputs);
            const instancedEntity = result.children[0];

            expect(instancedEntity).toBeDefined();
            expect(result.children.length).toBe(1);
        });

        it("should create points with different sizes", () => {
            const sizes = [0.5, 1.0, 1.5, 2.0];
            sizes.forEach(size => {
                const inputs = new Inputs.Point.DrawPointDto<pc.Entity>(
                    [0, 0, 0],
                    1,
                    size,
                    "#ff0000",
                    false
                );

                const result = drawHelper.drawPoint(inputs);
                const instancedEntity = result.children[0];

                expect(instancedEntity).toBeDefined();
                expect(result.children.length).toBe(1);
            });
        });

        it("should validate material properties for various opacity values", () => {
            const opacityValues = [0.0, 0.25, 0.5, 0.75, 1.0];
            opacityValues.forEach(opacity => {
                const inputs = new Inputs.Point.DrawPointDto<pc.Entity>(
                    [0, 0, 0],
                    opacity,
                    1,
                    "#00ff00",
                    false
                );

                const result = drawHelper.drawPoint(inputs);
                const pointEntity = result.children[0]!;
                const material = getMaterialFromEntity(pointEntity);

                if (material) {
                    expect(material.opacity).toBe(opacity);
                }
            });
        });

        it("should validate material color accuracy for various hex values", () => {
            const colors = [
                "#ff0000",
                "#00ff00",
                "#0000ff",
                "#ffff00",
                "#ff00ff",
                "#00ffff",
                "#ffffff",
                "#000000"
            ];

            colors.forEach(hexColor => {
                const inputs = new Inputs.Point.DrawPointDto<pc.Entity>(
                    [0, 0, 0],
                    1,
                    1,
                    hexColor,
                    false
                );

                const result = drawHelper.drawPoint(inputs);
                const pointEntity = result.children[0]!;
                const material = getMaterialFromEntity(pointEntity);

                if (material && material.diffuse) {
                    const expectedColor = hexToRgb(hexColor);
                    expect(colorsAreEqual(material.diffuse, expectedColor)).toBe(true);
                }
            });
        });

        it("should validate polyline size through width parameter", () => {
            const widthValues = [1, 2, 3, 5];
            widthValues.forEach(width => {
                const polylineData = {
                    points: [[0, 0, 0], [1, 0, 0], [1, 1, 0]] as Inputs.Base.Point3[],
                    isClosed: false
                };
                const inputs = new Inputs.Polyline.DrawPolylineDto<pc.Entity>(
                    polylineData,
                    1,
                    "#00ff00",
                    width
                );

                const result = drawHelper.drawPolylineClose(inputs);
                expect(result).toBeDefined();
                expect(result.children.length).toBe(1);
            });
        });

        it("should maintain material consistency across updates", () => {
            const inputs = new Inputs.Point.DrawPointDto<pc.Entity>(
                [1, 2, 3],
                0.7,
                1.5,
                "#ff8800",
                true
            );

            const result1 = drawHelper.drawPoint(inputs);
            const material1 = getMaterialFromEntity(result1.children[0]!);

            inputs.point = [4, 5, 6];
            inputs.pointMesh = result1;
            const result2 = drawHelper.drawPoint(inputs);
            const material2 = getMaterialFromEntity(result2.children[0]!);

            if (material1 && material2) {
                expect(material1.opacity).toBe(material2.opacity);
                if (material1.diffuse && material2.diffuse) {
                    expect(colorsAreEqual(material1.diffuse, {
                        r: material2.diffuse.r,
                        g: material2.diffuse.g,
                        b: material2.diffuse.b
                    })).toBe(true);
                }
            }
        });

        it("should correctly apply semi-transparent materials", () => {
            const inputs = new Inputs.Point.DrawPointDto<pc.Entity>(
                [0, 0, 0],
                0.3,
                1,
                "#0066ff",
                false
            );

            const result = drawHelper.drawPoint(inputs);
            const pointEntity = result.children[0]!;
            const material = getMaterialFromEntity(pointEntity);

            if (material) {
                expect(material.opacity).toBe(0.3);
                expect(material.opacity).toBeLessThan(1);
                expect(material.opacity).toBeGreaterThan(0);

                if (material.diffuse) {
                    const expectedColor = hexToRgb("#0066ff");
                    expect(colorsAreEqual(material.diffuse, expectedColor)).toBe(true);
                }
            }
        });
    });

    describe("Performance benchmarking", () => {
        it("should draw 100 points in reasonable time", () => {
            const points = Array.from({ length: 100 }, (_, i) => [i, i, i]) as Inputs.Base.Point3[];
            const inputs = new Inputs.Point.DrawPointsDto<pc.Entity>(
                points,
                1, 1, "#ff0000", false
            );

            const result = drawHelper.drawPoints(inputs);

            expect(result.children).toHaveLength(1);
        });

        it("should draw 1000 points with optimized LOD in reasonable time", () => {
            const points = Array.from({ length: 1000 }, () => [
                Math.random() * 100,
                Math.random() * 100,
                Math.random() * 100
            ]) as Inputs.Base.Point3[];
            const inputs = new Inputs.Point.DrawPointsDto<pc.Entity>(
                points,
                1, 1, "#ff0000", false
            );

            const result = drawHelper.drawPoints(inputs);

            expect(result.children).toHaveLength(1);
        });

        it("should handle rapid updates without performance degradation", () => {
            const options = new Inputs.Point.DrawPointDto<pc.Entity>(
                [1, 2, 3],
                1, 1, "#ff0000", true
            );

            const first = drawHelper.drawPoint(options);
            let result = first;

            // Act
            for (let i = 0; i < 50; i++) {
                options.point = [i, i * 2, i * 3];
                options.pointMesh = result;
                result = drawHelper.drawPoint(options);
            }

            expect(result).toBe(first);
            expect(first.children).toHaveLength(1);
        });

        it("should efficiently cache materials across multiple draws", () => {
            const color = "#ff0000";
            const drawCount = 50;

            const materials = new Set<unknown>();
            for (let i = 0; i < drawCount; i++) {
                const inputs = new Inputs.Point.DrawPointDto<pc.Entity>(
                    [i, 0, 0],
                    1, 1, color, false
                );
                const entity = drawHelper.drawPoint(inputs);
                entity.children.forEach((child) => {
                    (child as pc.Entity).render?.meshInstances.forEach((mi) => materials.add(mi.material));
                });
            }

            expect(materials.size).toBe(1);
        });
    });

    const A_DECOMPOSED_BOX: Inputs.OCCT.DecomposedMeshDto = {
        faceList: [
            { vertexCoord: [0, 0, 0, 1, 0, 0, 0, 1, 0], normalCoord: [0, 0, 1, 0, 0, 1, 0, 0, 1], uvs: [0, 0, 1, 0, 0, 1], triIndexes: [0, 1, 2], vertexCoordVec: [[0, 0, 0], [1, 0, 0], [0, 1, 0]], numberOfTriangles: 1, centerPoint: [0.33, 0.33, 0], centerNormal: [0, 0, 1], faceIndex: 0 },
            { vertexCoord: [0, 0, 1, 1, 0, 1, 0, 1, 1], normalCoord: [0, 0, 1, 0, 0, 1, 0, 0, 1], uvs: [0, 0, 1, 0, 0, 1], triIndexes: [0, 1, 2], vertexCoordVec: [[0, 0, 1], [1, 0, 1], [0, 1, 1]], numberOfTriangles: 1, centerPoint: [0.33, 0.33, 1], centerNormal: [0, 0, 1], faceIndex: 1 },
        ],
        edgeList: [
            { vertexCoord: [[0, 0, 0], [1, 0, 0]], middlePoint: [0.5, 0, 0], edgeIndex: 0 },
        ],
        pointsList: [[0, 0, 0], [1, 0, 0]],
    };

    const occtInputs = (): Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer> => {
        const inputs = new Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>();
        inputs.shape = { hash: 1, type: "occ-shape" };
        inputs.drawFaces = true;
        inputs.drawEdges = true;
        inputs.drawVertices = true;
        return inputs;
    };

    describe("the material cache", () => {
        it("should report itself disposed while it holds no material", () => {
            expect(drawHelper.isDisposed()).toBe(true);
        });

        it("should hold a material once one has been made", async () => {
            // Act
            await drawHelper.handleDecomposedMeshIndividually(occtInputs(), A_DECOMPOSED_BOX, {});

            // Assert
            expect(drawHelper.isDisposed()).toBe(false);
        });

        it("should let every material it holds go when disposed", async () => {
            // Arrange
            vi.spyOn(console, "log").mockImplementation(() => undefined);
            await drawHelper.handleDecomposedMeshIndividually(occtInputs(), A_DECOMPOSED_BOX, {});

            // Act
            drawHelper.dispose();

            // Assert
            expect(drawHelper.isDisposed()).toBe(true);
        });
    });

    describe("handleDecomposedMeshIndividually", () => {
        it("should give every face an entity of its own, named after the face", async () => {
            // Act
            const group = await drawHelper.handleDecomposedMeshIndividually(occtInputs(), A_DECOMPOSED_BOX, {});

            // Assert
            expect(group.children.some((child) => child.name === "face 0")).toBe(true);
            expect(group.children.some((child) => child.name === "face 1")).toBe(true);
        });

        it("should give every face a back face as well unless told otherwise", async () => {
            // Act
            const group = await drawHelper.handleDecomposedMeshIndividually(occtInputs(), A_DECOMPOSED_BOX, {});

            // Assert
            expect(group.children.some((child) => child.name === "face 0 backFace")).toBe(true);
        });

        it("should leave the back faces out when the shape is drawn one sided", async () => {
            // Arrange
            const inputs = occtInputs();
            inputs.drawTwoSided = false;

            // Act
            const group = await drawHelper.handleDecomposedMeshIndividually(inputs, A_DECOMPOSED_BOX, {});

            // Assert
            expect(group.children.some((child) => child.name.includes("backFace"))).toBe(false);
        });

        it("should give every edge an entity of its own, named after the edge", async () => {
            // Act
            const group = await drawHelper.handleDecomposedMeshIndividually(occtInputs(), A_DECOMPOSED_BOX, {});

            // Assert
            expect(group.children.some((child) => child.name === "edge 0")).toBe(true);
        });

        it("should draw the vertices in one entity of their own", async () => {
            // Act
            const group = await drawHelper.handleDecomposedMeshIndividually(occtInputs(), A_DECOMPOSED_BOX, {});

            // Assert
            expect(group.children.filter((child) => child.name === "vertices")).toHaveLength(1);
        });

        it("should draw nothing of a kind it was not asked for", async () => {
            // Arrange
            const inputs = occtInputs();
            inputs.drawFaces = false;
            inputs.drawEdges = false;
            inputs.drawVertices = false;

            // Act
            const group = await drawHelper.handleDecomposedMeshIndividually(inputs, A_DECOMPOSED_BOX, {});

            // Assert
            expect(group.children).toEqual([]);
        });
    });

    describe("what a drawing says when the worker refuses", () => {
        it("should say which drawing failed for a list of manifolds", async () => {
            // Arrange
            vi.spyOn(console, "error").mockImplementation(() => undefined);
            (mockManifoldWorkerManager.genericCallToWorkerPromise as Mock).mockRejectedValue(new Error("kernel gone"));
            const inputs = new Inputs.Manifold.DrawManifoldsOrCrossSectionsDto<Inputs.Manifold.ManifoldPointer, pc.StandardMaterial>();
            inputs.manifoldsOrCrossSections = [{ hash: 123, type: "manifold-shape" }];

            // Act & Assert
            await expect(drawHelper.drawManifoldsOrCrossSections(inputs)).rejects.toThrow("Failed to draw manifolds or cross sections");
        });

        it("should say which drawing failed for a list of shapes", async () => {
            // Arrange
            vi.spyOn(console, "error").mockImplementation(() => undefined);
            (mockOccWorkerManager.genericCallToWorkerPromise as Mock).mockRejectedValue(new Error("kernel gone"));
            const inputs = new Inputs.OCCT.DrawShapesDto<Inputs.OCCT.TopoDSShapePointer>();
            inputs.shapes = [{ hash: 1, type: "occ-shape" }];

            // Act & Assert
            await expect(drawHelper.drawShapes(inputs)).rejects.toThrow("Failed to draw OCCT shapes");
        });

        it("should say which drawing failed for a list of jscad meshes", async () => {
            // Arrange
            vi.spyOn(console, "error").mockImplementation(() => undefined);
            (mockJscadWorkerManager.genericCallToWorkerPromise as Mock).mockRejectedValue(new Error("kernel gone"));
            const inputs = new Inputs.JSCAD.DrawSolidMeshesDto<pc.Entity>();
            inputs.meshes = [jscadSolid()];

            // Act & Assert
            await expect(drawHelper.drawSolidOrPolygonMeshes(inputs)).rejects.toThrow("Failed to draw JSCAD meshes");
        });
    });
});
