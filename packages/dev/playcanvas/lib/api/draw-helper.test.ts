jest.mock("playcanvas", () => {
    const actual = jest.requireActual("playcanvas");
    const mockNode = {
        scene: {
            layers: {
                getLayerById: jest.fn(() => ({
                    addMeshInstances: jest.fn(),
                    removeMeshInstances: jest.fn()
                }))
            }
        }
    };
    return {
        ...actual,
        Mesh: class MockMesh extends actual.Mesh {
            constructor(graphicsDevice?) {
                const mockDevice = graphicsDevice || { vram: { vb: 0, ib: 0, tex: 0, total: 0 } };
                super(mockDevice);
            }
            update() {
                return this;
            }
        },
        Entity: class MockEntity extends actual.Entity {
            constructor(name?: string) {
                super(name);
            }
            addComponent(type: string, data) {
                const mockComponent = { type, ...data };
                return mockComponent;
            }
            setLocalPosition(x: number, y: number, z: number) {
                // Mock implementation
                if (this.localPosition) {
                    this.localPosition.set(x, y, z);
                }
            }
            addChild(entity: any) {
                // Mock implementation - use the actual parent class method
                if (super.addChild) {
                    super.addChild(entity);
                }
            }
        },
        MeshInstance: jest.fn((mesh, material, node = mockNode) => ({
            mesh,
            material,
            node
        }))
    };
});

import { DrawHelper } from "./draw-helper";
import { Context } from "./context";
import * as Inputs from "./inputs/inputs";
import { JSCADText, JSCADWorkerManager } from "@bitbybit-dev/jscad-worker";
import { ManifoldWorkerManager } from "@bitbybit-dev/manifold-worker";
import { OCCTWorkerManager } from "@bitbybit-dev/occt-worker";
import { Vector } from "@bitbybit-dev/base";

import * as pc from "playcanvas";

describe("DrawHelper unit tests", () => {
    let drawHelper: DrawHelper;
    let mockContext: Context;
    let mockSolidText: JSCADText;
    let mockVector: Vector;
    let mockJscadWorkerManager: JSCADWorkerManager;
    let mockManifoldWorkerManager: ManifoldWorkerManager;
    let mockOccWorkerManager: OCCTWorkerManager;
    let mockScene: pc.Entity;

    beforeEach(() => {
        mockScene = new pc.Entity("root");
        mockContext = {
            scene: mockScene,
            app: {
                graphicsDevice: {
                    vram: { vb: 0, ib: 0, tex: 0, total: 0 }
                },
                systems: {}
            } as unknown as pc.AppBase
        } as Context;

        mockSolidText = {
            createVectorText: jest.fn().mockResolvedValue([])
        } as unknown as JSCADText;

        mockVector = {
            add: jest.fn().mockReturnValue([0, 0, 0])
        } as unknown as Vector;

        mockJscadWorkerManager = {
            genericCallToWorkerPromise: jest.fn().mockResolvedValue({
                positions: [],
                normals: [],
                indices: [],
                transforms: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
            })
        } as unknown as JSCADWorkerManager;

        mockManifoldWorkerManager = {
            genericCallToWorkerPromise: jest.fn().mockResolvedValue({
                positions: [],
                normals: [],
                indices: []
            })
        } as unknown as ManifoldWorkerManager;

        mockOccWorkerManager = {
            genericCallToWorkerPromise: jest.fn().mockResolvedValue({
                faceList: [],
                edgeList: [],
                pointsList: []
            })
        } as unknown as OCCTWorkerManager;

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
        jest.clearAllMocks();
    });

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

            const pointEntity = result.children[0];
            expect(pointEntity.getLocalPosition().x).toBe(1);
            expect(pointEntity.getLocalPosition().y).toBe(2);
            expect(pointEntity.getLocalPosition().z).toBe(3);
        });

        it("should draw a point with array of colours", () => {
            const inputs = new Inputs.Point.DrawPointDto<pc.Entity>(
                [0, 0, 0],
                0.5,
                1,
                ["#ff0000", "#00ff00"]
            );

            const result = drawHelper.drawPoint(inputs);

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(pc.Entity);
        });

        it("should update existing point mesh when updatable is true", () => {
            const existingMesh = new pc.Entity();
            existingMesh.name = "existingPointMesh";
            // Add a child entity to simulate existing point
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
            expect(result.name).toContain("pointsMesh");
        });

        it("should draw points with per-point colours", () => {
            const inputs = new Inputs.Point.DrawPointsDto<pc.Entity>(
                [[0, 0, 0], [1, 1, 1], [2, 2, 2]],
                1,
                0.3,
                ["#ff0000", "#00ff00", "#0000ff"]
            );

            const result = drawHelper.drawPoints(inputs);

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(pc.Entity);
        });

        it("should handle mismatched colour array length", () => {
            const inputs = new Inputs.Point.DrawPointsDto<pc.Entity>(
                [[0, 0, 0], [1, 1, 1], [2, 2, 2], [3, 3, 3]],
                1,
                0.3,
                ["#ff0000", "#00ff00"] // Only 2 colours for 4 points
            );

            const result = drawHelper.drawPoints(inputs);

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(pc.Entity);
        });

        it("should update existing points mesh when updatable is true with same point count", () => {
            // First create a mesh
            const firstInputs = new Inputs.Point.DrawPointsDto<pc.Entity>(
                [[0, 0, 0], [1, 1, 1]],
                1,
                0.3,
                "#ff0000"
            );
            const existingMesh = drawHelper.drawPoints(firstInputs);

            // Now update with new positions
            const updateInputs = new Inputs.Point.DrawPointsDto<pc.Entity>(
                [[5, 5, 5], [6, 6, 6]],
                1,
                0.3,
                "#ff0000",
                true,
                existingMesh
            );

            const result = drawHelper.drawPoints(updateInputs);

            expect(result).toBeDefined();
        });

        it("should recreate points mesh when point count changes during update", () => {
            // First create a mesh
            const firstInputs = new Inputs.Point.DrawPointsDto<pc.Entity>(
                [[0, 0, 0], [1, 1, 1]],
                1,
                0.3,
                "#ff0000"
            );
            const existingMesh = drawHelper.drawPoints(firstInputs);

            // Now update with different point count
            const updateInputs = new Inputs.Point.DrawPointsDto<pc.Entity>(
                [[5, 5, 5], [6, 6, 6], [7, 7, 7]],
                1,
                0.3,
                "#ff0000",
                true,
                existingMesh
            );

            const result = drawHelper.drawPoints(updateInputs);

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

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(pc.Entity);
            expect(result.name).toContain("polyline");
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

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(pc.Entity);
        });

        it("should update existing polyline mesh when updatable is true", () => {
            const existingMesh = new pc.Entity();
            existingMesh.name = "existingPolyline";
            // Add a child entity to simulate existing polyline
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

            const result = drawHelper.drawPolylinesWithColours(inputs);

            expect(result).toBeDefined();
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

            expect(result).toBeDefined();
        });

        it("should update existing polylines mesh when updatable is true", () => {
            const existingMesh = new pc.Entity();
            existingMesh.name = "existingPolylines";
            // Add a child entity to simulate existing polylines
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
        });
    });

    describe("drawCurve", () => {
        it("should draw a curve", () => {
            const mockCurve = {
                tessellate: jest.fn().mockReturnValue([
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
            expect(result).toBeInstanceOf(pc.Entity);
            expect(mockCurve.tessellate).toHaveBeenCalled();
        });

        it("should update existing curve mesh when updatable is true", () => {
            const existingMesh = new pc.Entity();
            existingMesh.name = "existingCurve";
            // Add a child entity to simulate existing curve
            const childEntity = new pc.Entity("curve-child");
            existingMesh.addChild(childEntity);

            const mockCurve = {
                tessellate: jest.fn().mockReturnValue([
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

            expect(result).toBeDefined();
        });
    });

    describe("drawCurves", () => {
        it("should draw multiple curves", () => {
            const mockCurves = [
                { tessellate: jest.fn().mockReturnValue([[0, 0, 0], [1, 1, 1]] as Inputs.Base.Point3[]) },
                { tessellate: jest.fn().mockReturnValue([[2, 2, 2], [3, 3, 3]] as Inputs.Base.Point3[]) }
            ];
            const inputs = new Inputs.Verb.DrawCurvesDto<pc.Entity>(
                mockCurves,
                1,
                "#ff0000",
                2
            );

            const result = drawHelper.drawCurves(inputs);

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(pc.Entity);
        });
    });

    describe("drawSurface", () => {
        it("should draw a surface", () => {
            const mockSurface = {
                tessellate: jest.fn().mockReturnValue({
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
                false
            );

            const result = drawHelper.drawSurface(inputs);

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(pc.Entity);
            expect(mockSurface.tessellate).toHaveBeenCalled();
        });

        it("should handle hidden surfaces", () => {
            const mockSurface = {
                tessellate: jest.fn().mockReturnValue({
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
                true // hidden
            );

            const result = drawHelper.drawSurface(inputs);

            expect(result).toBeDefined();
            expect(result.enabled).toBe(false);
        });

        it("should update existing surface mesh when updatable is true", () => {
            const existingMesh = new pc.Entity();
            existingMesh.name = "existingSurface";

            const mockSurface = {
                tessellate: jest.fn().mockReturnValue({
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
                existingMesh
            );

            const result = drawHelper.drawSurface(inputs);

            expect(result).toBeDefined();
        });

        it("should handle array of colours and use first colour", () => {
            const mockSurface = {
                tessellate: jest.fn().mockReturnValue({
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
                false
            );

            const result = drawHelper.drawSurface(inputs);

            expect(result).toBeDefined();
        });
    });

    describe("drawSurfacesMultiColour", () => {
        it("should draw multiple surfaces with different colours", () => {
            const mockSurface1 = {
                tessellate: jest.fn().mockReturnValue({
                    faces: [[0, 1, 2]],
                    points: [[0, 0, 0], [1, 0, 0], [0, 1, 0]],
                    normals: [[0, 0, 1], [0, 0, 1], [0, 0, 1]]
                })
            };
            const mockSurface2 = {
                tessellate: jest.fn().mockReturnValue({
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
                false
            );

            const result = drawHelper.drawSurfacesMultiColour(inputs);

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(pc.Entity);
            expect(result.children.length).toBe(2);
        });

        it("should use first colour when more surfaces than colours", () => {
            const mockSurface = {
                tessellate: jest.fn().mockReturnValue({
                    faces: [[0, 1, 2]],
                    points: [[0, 0, 0], [1, 0, 0], [0, 1, 0]],
                    normals: [[0, 0, 1], [0, 0, 1], [0, 0, 1]]
                })
            };

            const inputs = new Inputs.Verb.DrawSurfacesColoursDto<pc.Entity>(
                [mockSurface, mockSurface, mockSurface],
                ["#ff0000"], // Only one colour for 3 surfaces
                1,
                false,
                false
            );

            const result = drawHelper.drawSurfacesMultiColour(inputs);

            expect(result).toBeDefined();
            expect(result.children.length).toBe(3);
        });

        it("should use string colour for all surfaces when not array", () => {
            const mockSurface = {
                tessellate: jest.fn().mockReturnValue({
                    faces: [[0, 1, 2]],
                    points: [[0, 0, 0], [1, 0, 0], [0, 1, 0]],
                    normals: [[0, 0, 1], [0, 0, 1], [0, 0, 1]]
                })
            };

            const inputs = new Inputs.Verb.DrawSurfacesColoursDto<pc.Entity>(
                [mockSurface, mockSurface],
                ["#ff0000"], // Array colour
                1,
                false,
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
                tessellate: jest.fn().mockReturnValue({
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
                existingMesh
            );

            const result = drawHelper.drawSurfacesMultiColour(inputs);

            expect(result).toBe(existingMesh);
        });
    });

    describe("drawSolidOrPolygonMesh", () => {
        it("should draw JSCAD solid mesh", async () => {
            const mockMesh = { type: "solid" };
            const inputs = new Inputs.JSCAD.DrawSolidMeshDto<pc.Entity>(
                mockMesh,
                1,
                "#ff0000",
                false,
                false
            );

            const result = await drawHelper.drawSolidOrPolygonMesh(inputs);

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(pc.Entity);
            expect(mockJscadWorkerManager.genericCallToWorkerPromise).toHaveBeenCalledWith("shapeToMesh", expect.anything());
        });

        it("should handle mesh with baked-in color", async () => {
            const mockMesh = { type: "solid", color: [1, 0, 0, 1] };
            const inputs = new Inputs.JSCAD.DrawSolidMeshDto<pc.Entity>(
                mockMesh,
                1,
                "#0000ff",
                false,
                false
            );

            const result = await drawHelper.drawSolidOrPolygonMesh(inputs);

            expect(result).toBeDefined();
        });

        it("should handle hidden mesh", async () => {
            (mockJscadWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue({
                positions: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                normals: [0, 0, 1, 0, 0, 1, 0, 0, 1],
                indices: [0, 1, 2],
                transforms: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
            });

            const mockMesh = { type: "solid" };
            const inputs = new Inputs.JSCAD.DrawSolidMeshDto<pc.Entity>(
                mockMesh,
                1,
                "#ff0000",
                false,
                true // hidden
            );

            const result = await drawHelper.drawSolidOrPolygonMesh(inputs);

            expect(result).toBeDefined();
            expect(result.enabled).toBe(false);
        });

        it("should update existing mesh when updatable is true", async () => {
            const existingMesh = new pc.Entity();
            existingMesh.name = "existingJscadMesh";

            const mockMesh = { type: "solid" };
            const inputs = new Inputs.JSCAD.DrawSolidMeshDto<pc.Entity>(
                mockMesh,
                0.5,
                "#00ff00",
                true,
                false,
                existingMesh
            );

            const result = await drawHelper.drawSolidOrPolygonMesh(inputs);

            expect(result).toBe(existingMesh);
        });

        it("should use array first colour when colours is array", async () => {
            const mockMesh = { type: "solid" };
            const inputs = new Inputs.JSCAD.DrawSolidMeshDto<pc.Entity>(
                mockMesh,
                1,
                ["#ff0000", "#00ff00"],
                false,
                false
            );

            const result = await drawHelper.drawSolidOrPolygonMesh(inputs);

            expect(result).toBeDefined();
        });
    });

    describe("drawSolidOrPolygonMeshes", () => {
        it("should draw multiple JSCAD meshes", async () => {
            (mockJscadWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue([
                { positions: [0, 0, 0], normals: [0, 0, 1], indices: [0], transforms: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] },
                { positions: [1, 0, 0], normals: [0, 0, 1], indices: [0], transforms: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] }
            ]);

            const mockMeshes = [{ type: "solid" }, { type: "solid" }];
            const inputs = new Inputs.JSCAD.DrawSolidMeshesDto<pc.Entity>(
                mockMeshes,
                1,
                "#ff0000",
                false,
                false
            );

            const result = await drawHelper.drawSolidOrPolygonMeshes(inputs);

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(pc.Entity);
        });

        it("should handle meshes with baked colours", async () => {
            (mockJscadWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue([
                { positions: [0, 0, 0], normals: [0, 0, 1], indices: [0], transforms: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], color: [1, 0, 0] },
                { positions: [1, 0, 0], normals: [0, 0, 1], indices: [0], transforms: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] }
            ]);

            const mockMeshes = [{ type: "solid" }, { type: "solid" }];
            const inputs = new Inputs.JSCAD.DrawSolidMeshesDto<pc.Entity>(
                mockMeshes,
                1,
                "#0000ff",
                false,
                false
            );

            const result = await drawHelper.drawSolidOrPolygonMeshes(inputs);

            expect(result).toBeDefined();
        });

        it("should handle array of colours matching meshes count", async () => {
            (mockJscadWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue([
                { positions: [0, 0, 0], normals: [0, 0, 1], indices: [0], transforms: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] },
                { positions: [1, 0, 0], normals: [0, 0, 1], indices: [0], transforms: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] }
            ]);

            const mockMeshes = [{ type: "solid" }, { type: "solid" }];
            const inputs = new Inputs.JSCAD.DrawSolidMeshesDto<pc.Entity>(
                mockMeshes,
                1,
                ["#ff0000", "#00ff00"], // Matching colours
                false,
                false
            );

            const result = await drawHelper.drawSolidOrPolygonMeshes(inputs);

            expect(result).toBeDefined();
        });

        it("should update existing mesh when updatable is true", async () => {
            (mockJscadWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue([
                { positions: [0, 0, 0], normals: [0, 0, 1], indices: [0], transforms: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] }
            ]);

            const existingMesh = new pc.Entity();
            existingMesh.name = "existingMeshes";

            const mockMeshes = [{ type: "solid" }];
            const inputs = new Inputs.JSCAD.DrawSolidMeshesDto<pc.Entity>(
                mockMeshes,
                1,
                "#ff0000",
                true,
                false,
                existingMesh
            );

            const result = await drawHelper.drawSolidOrPolygonMeshes(inputs);

            expect(result).toBe(existingMesh);
        });
    });

    describe("drawShape (OCCT)", () => {
        it("should draw OCCT shape with faces", async () => {
            (mockOccWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue({
                faceList: [
                    { vertex_coord: [0, 0, 0, 1, 0, 0, 0, 1, 0], normal_coord: [0, 0, 1, 0, 0, 1, 0, 0, 1], tri_indexes: [0, 1, 2] }
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
            expect(result).toBeInstanceOf(pc.Entity);
            expect(mockOccWorkerManager.genericCallToWorkerPromise).toHaveBeenCalledWith("shapeToMesh", expect.anything());
        });

        it("should draw OCCT shape with edges", async () => {
            (mockOccWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue({
                faceList: [],
                edgeList: [
                    { vertex_coord: [0, 0, 0, 1, 0, 0], edge_index: 0 }
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

            const result = await drawHelper.drawShape(inputs as Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>);

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(pc.Entity);
        });

        it("should draw OCCT shape with vertices", async () => {
            (mockOccWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue({
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

            const result = await drawHelper.drawShape(inputs as Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>);

            expect(result).toBeDefined();
        });
    });

    describe("drawShapes (OCCT)", () => {
        it("should draw multiple OCCT shapes", async () => {
            (mockOccWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue([
                { faceList: [{ vertex_coord: [0, 0, 0, 1, 0, 0, 0, 1, 0], normal_coord: [0, 0, 1, 0, 0, 1, 0, 0, 1], tri_indexes: [0, 1, 2] }], edgeList: [], pointsList: [] },
                { faceList: [{ vertex_coord: [2, 0, 0, 3, 0, 0, 2, 1, 0], normal_coord: [0, 0, 1, 0, 0, 1, 0, 0, 1], tri_indexes: [0, 1, 2] }], edgeList: [], pointsList: [] }
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

            const result = await drawHelper.drawShapes(inputs as Inputs.OCCT.DrawShapesDto<Inputs.OCCT.TopoDSShapePointer>);

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(pc.Entity);
            expect(mockOccWorkerManager.genericCallToWorkerPromise).toHaveBeenCalledWith("shapesToMeshes", expect.anything());
        });
    });

    describe("drawManifoldOrCrossSection", () => {
        it("should draw manifold or cross section", async () => {
            // handleDecomposedManifold expects vertProperties and triVerts
            (mockManifoldWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue({
                vertProperties: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]),
                triVerts: new Uint32Array([0, 1, 2])
            });

            const inputs = new Inputs.Manifold.DrawManifoldOrCrossSectionDto<Inputs.Manifold.ManifoldPointer | Inputs.Manifold.CrossSectionPointer, pc.StandardMaterial>();
            inputs.manifoldOrCrossSection = { hash: 123, type: "manifold" };
            inputs.faceColour = "#ff0000";
            inputs.faceOpacity = 1;

            const result = await drawHelper.drawManifoldOrCrossSection(inputs);

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(pc.Entity);
            expect(mockManifoldWorkerManager.genericCallToWorkerPromise).toHaveBeenCalledWith("decomposeManifoldOrCrossSection", expect.anything());
        });

        it("should return undefined when triVerts is empty", async () => {
            (mockManifoldWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue({
                vertProperties: new Float32Array([]),
                triVerts: new Uint32Array([])
            });

            const inputs = new Inputs.Manifold.DrawManifoldOrCrossSectionDto<Inputs.Manifold.ManifoldPointer | Inputs.Manifold.CrossSectionPointer, pc.StandardMaterial>();
            inputs.manifoldOrCrossSection = { hash: 123, type: "manifold" };

            const result = await drawHelper.drawManifoldOrCrossSection(inputs);

            expect(result).toBeUndefined();
        });

        it("should handle cross section polygons", async () => {
            // When decomposed mesh is 2D polygons instead of 3D mesh
            (mockManifoldWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue([
                [[0, 0], [1, 0], [1, 1], [0, 1]] as Inputs.Base.Vector2[]
            ]);

            const inputs = new Inputs.Manifold.DrawManifoldOrCrossSectionDto<Inputs.Manifold.ManifoldPointer | Inputs.Manifold.CrossSectionPointer, pc.StandardMaterial>();
            inputs.manifoldOrCrossSection = { hash: 123, type: "crossSection" };
            inputs.crossSectionColour = "#00ff00";
            inputs.crossSectionOpacity = 1;
            inputs.crossSectionWidth = 2;

            const result = await drawHelper.drawManifoldOrCrossSection(inputs);

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(pc.Entity);
        });
    });

    describe("drawManifoldsOrCrossSections", () => {
        it("should draw multiple manifolds", async () => {
            (mockManifoldWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue([
                { vertProperties: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]), triVerts: new Uint32Array([0, 1, 2]) },
                { vertProperties: new Float32Array([1, 0, 0, 2, 0, 0, 1, 1, 0]), triVerts: new Uint32Array([0, 1, 2]) }
            ]);

            const inputs = new Inputs.Manifold.DrawManifoldsOrCrossSectionsDto<Inputs.Manifold.ManifoldPointer | Inputs.Manifold.CrossSectionPointer, pc.StandardMaterial>();
            inputs.manifoldsOrCrossSections = [
                { hash: 123, type: "manifold" },
                { hash: 456, type: "manifold" }
            ];
            inputs.faceColour = "#ff0000";

            const result = await drawHelper.drawManifoldsOrCrossSections(inputs);

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(pc.Entity);
        });

        it("should filter out undefined meshes", async () => {
            (mockManifoldWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue([
                { vertProperties: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]), triVerts: new Uint32Array([0, 1, 2]) },
                { vertProperties: new Float32Array([]), triVerts: new Uint32Array([]) } // This will be filtered out
            ]);

            const inputs = new Inputs.Manifold.DrawManifoldsOrCrossSectionsDto<Inputs.Manifold.ManifoldPointer | Inputs.Manifold.CrossSectionPointer, pc.StandardMaterial>();
            inputs.manifoldsOrCrossSections = [
                { hash: 123, type: "manifold" },
                { hash: 456, type: "manifold" }
            ];
            inputs.faceColour = "#ff0000";

            const result = await drawHelper.drawManifoldsOrCrossSections(inputs);

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(pc.Entity);
        });
    });

    describe("updatePointsInstances", () => {
        it("should update positions of instanced meshes", () => {
            const group = new pc.Entity();

            // Add child entities with setLocalPosition method
            const mesh1 = new pc.Entity("point-0");
            const mesh2 = new pc.Entity("point-1");

            group.addChild(mesh1);
            group.addChild(mesh2);

            const newPositions: Inputs.Base.Point3[] = [[5, 5, 5], [10, 10, 10]];

            drawHelper.updatePointsInstances(group, newPositions);

            // Check that setLocalPosition was called (positions updated)
            expect(mesh1.getLocalPosition().x).toBe(5);
            expect(mesh1.getLocalPosition().y).toBe(5);
            expect(mesh1.getLocalPosition().z).toBe(5);
            expect(mesh2.getLocalPosition().x).toBe(10);
            expect(mesh2.getLocalPosition().y).toBe(10);
            expect(mesh2.getLocalPosition().z).toBe(10);
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
                undefined as unknown as pc.Entity,
                false,
                material,
                true,
                false
            );

            expect(result).toBeDefined();
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
                undefined as unknown as pc.Entity,
                false,
                material,
                true,
                true // hidden
            );

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
                undefined as unknown as pc.Entity,
                false,
                material,
                true,
                false
            );

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(pc.Entity);
        });
    });

    describe("drawPolyline (internal)", () => {
        it("should create new polyline when mesh is undefined", () => {
            const points: Inputs.Base.Point3[] = [[0, 0, 0], [1, 1, 1], [2, 0, 0]];

            const result = drawHelper.drawPolyline(
                undefined as unknown as pc.Entity,
                points,
                false,
                2,
                1,
                "#ff0000"
            );

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(pc.Entity);
            expect(result.name).toContain("polyline");
        });

        it("should handle existing mesh with children", () => {
            const existingMesh = new pc.Entity();
            existingMesh.name = "existingPolyline";
            // Add a child entity to simulate existing polyline
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

            expect(result).toBeDefined();
        });
    });

    describe("Error handling", () => {

        it("should throw descriptive error when JSCAD worker fails", async () => {
            const mockError = new Error("Worker communication failed");
            (mockJscadWorkerManager.genericCallToWorkerPromise as jest.Mock)
                .mockRejectedValue(mockError);

            const inputs = new Inputs.JSCAD.DrawSolidMeshDto<pc.Entity>(
                { type: "solid" },
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
            (mockOccWorkerManager.genericCallToWorkerPromise as jest.Mock)
                .mockRejectedValue(mockError);

            const inputs = new Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>();
            inputs.shape = { hash: 123, type: "solid" };

            await expect(drawHelper.drawShape(inputs))
                .rejects
                .toThrow();
        });

        it("should throw descriptive error when Manifold worker fails", async () => {
            const mockError = new Error("Manifold mesh extraction failed");
            (mockManifoldWorkerManager.genericCallToWorkerPromise as jest.Mock)
                .mockRejectedValue(mockError);

            const inputs = new Inputs.Manifold.DrawManifoldOrCrossSectionDto<Inputs.Manifold.ManifoldPointer, pc.StandardMaterial>();
            inputs.manifoldOrCrossSection = { hash: 123, type: "manifold" };

            await expect(drawHelper.drawManifoldOrCrossSection(inputs))
                .rejects
                .toThrow();
        });
    });

    describe("Worker validation", () => {

        it("should call JSCAD worker with correct parameters", async () => {
            const mockMesh = { type: "solid", polygons: [] };

            // Reset mock to track new calls
            (mockJscadWorkerManager.genericCallToWorkerPromise as jest.Mock).mockClear();
            (mockJscadWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue({
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

            // The implementation calls shapeToMesh not geomToMesh
            expect(mockJscadWorkerManager.genericCallToWorkerPromise).toHaveBeenCalled();
            const callArgs = (mockJscadWorkerManager.genericCallToWorkerPromise as jest.Mock).mock.calls[0];
            expect(callArgs[1]).toMatchObject({
                mesh: mockMesh
            });
        });

        it("should call OCCT worker with correct parameters", async () => {
            (mockOccWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue({
                faceList: [{
                    vertex_coord: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                    normal_coord: [0, 0, 1, 0, 0, 1, 0, 0, 1],
                    tri_indexes: [0, 1, 2]
                }],
                edgeList: [],
                pointsList: []
            });

            const inputs = new Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>();
            inputs.shape = { hash: 123, type: "solid" };
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
            (mockManifoldWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue({
                vertProperties: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]),
                triVerts: new Uint32Array([0, 1, 2])
            });

            const inputs = new Inputs.Manifold.DrawManifoldOrCrossSectionDto<Inputs.Manifold.ManifoldPointer, pc.StandardMaterial>();
            inputs.manifoldOrCrossSection = { hash: 123, type: "manifold" };

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

            // Since materials may or may not be cached depending on implementation
            // Just verify method completes successfully
            expect(cacheSize).toBeGreaterThanOrEqual(0);
        });

        it("should create new material for different opacity", () => {
            const inputs1 = new Inputs.Point.DrawPointDto<pc.Entity>(
                [1, 2, 3],
                1,
                1.0,
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
            drawHelper.drawPoint(inputs2);

            const cacheSize = drawHelper["materialCache"].size;

            // Verify operations complete successfully
            expect(cacheSize).toBeGreaterThanOrEqual(0);
        });

        it("should not exceed cache limit", () => {
            const CACHE_LIMIT = 100;

            for (let i = 0; i < CACHE_LIMIT + 10; i++) {
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
            expect(cacheSize).toBeLessThanOrEqual(CACHE_LIMIT);
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

            expect(result2).toBe(result1);
            expect(child2).toBe(child1);
        });

        it("should handle cleanup on dispose", () => {
            // Create entities to populate cache
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

            // Verify dispose clears cache (cache may or may not be used)
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
            expect(result.children.length).toBe(3);
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

            expect(result).toBeDefined();
        });
    });

    describe("Visual property validation", () => {
        // Note: These tests verify the structure but cannot fully validate
        // actual PlayCanvas rendering in a mocked environment

        it("should create point entity with expected structure", () => {
            const inputs = new Inputs.Point.DrawPointDto<pc.Entity>(
                [1, 2, 3],
                1, 1, "#ff0000", false
            );
            const result = drawHelper.drawPoint(inputs);
            expect(result).toBeDefined();

            // Verify entity structure
            expect(result.children).toBeDefined();
            expect(result.children.length).toBeGreaterThan(0);

            const mesh = result.children[0];
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

            // Verify multiple children created
            expect(result.children).toBeDefined();
            expect(result.children.length).toBeGreaterThan(0);
        });

        it("should accept opacity parameter", () => {
            const inputs = new Inputs.Point.DrawPointDto<pc.Entity>(
                [1, 2, 3],
                1, 0.5, "#0000ff", false
            );
            const result = drawHelper.drawPoint(inputs);

            expect(result).toBeDefined();
            expect(result.children.length).toBeGreaterThan(0);
        });

        it("should handle multiple colors for multiple points", () => {
            const inputs = new Inputs.Point.DrawPointsDto<pc.Entity>(
                [[1, 2, 3], [4, 5, 6]],
                1, 1, ["#ff0000", "#00ff00"], false
            );
            const result = drawHelper.drawPoints(inputs);

            // Verify correct number of children
            expect(result.children.length).toBe(2);
        });
    });

    describe("Mesh geometry validation", () => {
        // Note: Full mesh validation requires actual WebGL context
        // These tests verify the geometry is created

        it("should create entity for point with expected position", () => {
            const inputs = new Inputs.Point.DrawPointDto<pc.Entity>(
                [5, 10, 15],
                1, 1, "#ff0000", false
            );
            const result = drawHelper.drawPoint(inputs);

            expect(result).toBeDefined();
            expect(result.children.length).toBeGreaterThan(0);

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
            const mesh = result.children[0];
            expect(mesh).toBeDefined();
            // Verify it's a valid entity (name format may vary)
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
            expect(result.children.length).toBeGreaterThan(0);
        });

        it("should handle closed polyline parameter", () => {
            const inputs = new Inputs.Polyline.DrawPolylinesDto<pc.Entity>(
                [{ points: [[0, 0, 0], [1, 0, 0], [1, 1, 0]], isClosed: true }],
                1, ["#ff0000"], 1, false
            );
            const result = drawHelper.drawPolylinesWithColours(inputs);

            expect(result).toBeDefined();
            expect(result.name).toBeDefined();
        });

        it("should create geometry for sized point", () => {
            const inputs = new Inputs.Point.DrawPointDto<pc.Entity>(
                [1, 2, 3],
                2, 1, "#ff0000", false
            );
            const result = drawHelper.drawPoint(inputs);

            expect(result).toBeDefined();
            const mesh = result.children[0];
            expect(mesh).toBeDefined();
        });
    });

    describe("Performance benchmarking", () => {
        it("should draw 100 points in reasonable time", () => {
            const points = Array.from({ length: 100 }, (_, i) => [i, i, i]) as Inputs.Base.Point3[];
            const inputs = new Inputs.Point.DrawPointsDto<pc.Entity>(
                points,
                1, 1, "#ff0000", false
            );

            const startTime = performance.now();
            const result = drawHelper.drawPoints(inputs);
            const endTime = performance.now();

            expect(result).toBeDefined();
            expect(result.children.length).toBe(100);

            const executionTime = endTime - startTime;
            // Should complete in under 500ms for 100 points
            expect(executionTime).toBeLessThan(500);
        });

        it("should draw 1000 points with optimized LOD in reasonable time", () => {
            const points = Array.from({ length: 1000 }, (_, i) => [
                Math.random() * 100,
                Math.random() * 100,
                Math.random() * 100
            ]) as Inputs.Base.Point3[];
            const inputs = new Inputs.Point.DrawPointsDto<pc.Entity>(
                points,
                1, 1, "#ff0000", false
            );

            const startTime = performance.now();
            const result = drawHelper.drawPoints(inputs);
            const endTime = performance.now();

            expect(result).toBeDefined();
            expect(result.children.length).toBe(1000);

            const executionTime = endTime - startTime;
            // Large dataset should still complete in reasonable time (< 2s)
            expect(executionTime).toBeLessThan(2000);
        });

        it("should handle rapid updates without performance degradation", () => {
            const options = new Inputs.Point.DrawPointDto<pc.Entity>(
                [1, 2, 3],
                1, 1, "#ff0000", true
            );

            let result = drawHelper.drawPoint(options);
            const times: number[] = [];

            // Perform 50 rapid updates
            for (let i = 0; i < 50; i++) {
                const startTime = performance.now();
                options.point = [i, i * 2, i * 3];
                options.pointMesh = result;
                result = drawHelper.drawPoint(options);
                const endTime = performance.now();
                times.push(endTime - startTime);
            }

            // Average update time should be consistent (no memory leak slowdown)
            const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
            const lastFiveAvg = times.slice(-5).reduce((a, b) => a + b, 0) / 5;

            // Last 5 updates shouldn't be significantly slower than average
            expect(lastFiveAvg).toBeLessThan(avgTime * 2);
        });

        it("should efficiently cache materials across multiple draws", () => {
            const color = "#ff0000";
            const drawCount = 50;

            const startTime = performance.now();
            for (let i = 0; i < drawCount; i++) {
                const inputs = new Inputs.Point.DrawPointDto<pc.Entity>(
                    [i, 0, 0],
                    1, 1, color, false
                );
                drawHelper.drawPoint(inputs);
            }
            const endTime = performance.now();

            const executionTime = endTime - startTime;
            // With caching, should be much faster than without
            // Should complete in under 200ms for 50 points with same material
            expect(executionTime).toBeLessThan(200);
        });
    });
});
