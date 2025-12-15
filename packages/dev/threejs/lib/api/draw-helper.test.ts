import { DrawHelper } from "./draw-helper";
import { Context } from "./context";
import * as Inputs from "./inputs/inputs";
import { JSCADText, JSCADWorkerManager } from "@bitbybit-dev/jscad-worker";
import { ManifoldWorkerManager } from "@bitbybit-dev/manifold-worker";
import { OCCTWorkerManager } from "@bitbybit-dev/occt-worker";
import { Vector } from "@bitbybit-dev/base";
import * as THREEJS from "three";

describe("DrawHelper unit tests", () => {
    let drawHelper: DrawHelper;
    let mockContext: Context;
    let mockSolidText: JSCADText;
    let mockVector: Vector;
    let mockJscadWorkerManager: JSCADWorkerManager;
    let mockManifoldWorkerManager: ManifoldWorkerManager;
    let mockOccWorkerManager: OCCTWorkerManager;
    let mockScene: THREEJS.Scene;

    beforeEach(() => {
        mockScene = new THREEJS.Scene();
        mockContext = {
            scene: mockScene
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
            const inputs = new Inputs.Point.DrawPointDto<THREEJS.Group>(
                [1, 2, 3],
                1,
                0.5,
                "#ff0000",
                false
            );

            const result = drawHelper.drawPoint(inputs);

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(THREEJS.Group);
            expect(result.name).toContain("pointMesh");
        });

        it("should draw a point with array of colours", () => {
            const inputs = new Inputs.Point.DrawPointDto<THREEJS.Group>(
                [0, 0, 0],
                0.5,
                1,
                ["#ff0000", "#00ff00"]
            );

            const result = drawHelper.drawPoint(inputs);

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(THREEJS.Group);
        });

        it("should update existing point mesh when updatable is true", () => {
            const existingMesh = new THREEJS.Group();
            existingMesh.name = "existingPointMesh";
            // Add a child InstancedMesh to simulate existing point
            const geometry = new THREEJS.SphereGeometry(0.5);
            const material = new THREEJS.MeshBasicMaterial();
            const instancedMesh = new THREEJS.InstancedMesh(geometry, material, 1);
            instancedMesh.userData = { index: 0 };
            existingMesh.add(instancedMesh);

            const inputs = new Inputs.Point.DrawPointDto<THREEJS.Group>(
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
            const inputs = new Inputs.Point.DrawPointsDto<THREEJS.Group>(
                [[0, 0, 0], [1, 1, 1], [2, 2, 2]],
                1,
                0.3,
                "#ff0000"
            );

            const result = drawHelper.drawPoints(inputs);

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(THREEJS.Group);
            expect(result.name).toContain("pointsMesh");
        });

        it("should draw points with per-point colours", () => {
            const inputs = new Inputs.Point.DrawPointsDto<THREEJS.Group>(
                [[0, 0, 0], [1, 1, 1], [2, 2, 2]],
                1,
                0.3,
                ["#ff0000", "#00ff00", "#0000ff"]
            );

            const result = drawHelper.drawPoints(inputs);

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(THREEJS.Group);
        });

        it("should handle mismatched colour array length", () => {
            const inputs = new Inputs.Point.DrawPointsDto<THREEJS.Group>(
                [[0, 0, 0], [1, 1, 1], [2, 2, 2], [3, 3, 3]],
                1,
                0.3,
                ["#ff0000", "#00ff00"] // Only 2 colours for 4 points
            );

            const result = drawHelper.drawPoints(inputs);

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(THREEJS.Group);
        });

        it("should update existing points mesh when updatable is true with same point count", () => {
            // First create a mesh
            const firstInputs = new Inputs.Point.DrawPointsDto<THREEJS.Group>(
                [[0, 0, 0], [1, 1, 1]],
                1,
                0.3,
                "#ff0000"
            );
            const existingMesh = drawHelper.drawPoints(firstInputs);

            // Now update with new positions
            const updateInputs = new Inputs.Point.DrawPointsDto<THREEJS.Group>(
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
            const firstInputs = new Inputs.Point.DrawPointsDto<THREEJS.Group>(
                [[0, 0, 0], [1, 1, 1]],
                1,
                0.3,
                "#ff0000"
            );
            const existingMesh = drawHelper.drawPoints(firstInputs);

            // Now update with different point count
            const updateInputs = new Inputs.Point.DrawPointsDto<THREEJS.Group>(
                [[5, 5, 5], [6, 6, 6], [7, 7, 7]],
                1,
                0.3,
                "#ff0000",
                true,
                existingMesh
            );

            const result = drawHelper.drawPoints(updateInputs);

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(THREEJS.Group);
        });
    });

    describe("drawPolylineClose", () => {
        it("should draw a polyline", () => {
            const polylineData = {
                points: [[0, 0, 0], [1, 0, 0], [1, 1, 0]] as Inputs.Base.Point3[],
                isClosed: false
            };
            const inputs = new Inputs.Polyline.DrawPolylineDto<THREEJS.Group>(
                polylineData,
                1,
                "#00ff00",
                2
            );

            const result = drawHelper.drawPolylineClose(inputs);

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(THREEJS.Group);
            expect(result.name).toContain("polyline");
        });

        it("should close the polyline when isClosed is true", () => {
            const polylineData = {
                points: [[0, 0, 0], [1, 0, 0], [1, 1, 0]] as Inputs.Base.Point3[],
                isClosed: true
            };
            const inputs = new Inputs.Polyline.DrawPolylineDto<THREEJS.Group>(
                polylineData,
                1,
                "#00ff00",
                2
            );

            const result = drawHelper.drawPolylineClose(inputs);

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(THREEJS.Group);
        });

        it("should update existing polyline mesh when updatable is true", () => {
            const existingMesh = new THREEJS.Group();
            existingMesh.name = "existingPolyline";
            const lineGeom = new THREEJS.BufferGeometry();
            const lineMat = new THREEJS.LineBasicMaterial();
            existingMesh.add(new THREEJS.LineSegments(lineGeom, lineMat));

            const polylineData = {
                points: [[0, 0, 0], [2, 2, 2]] as Inputs.Base.Point3[],
                isClosed: false
            };
            const inputs = new Inputs.Polyline.DrawPolylineDto<THREEJS.Group>(
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
            const inputs = new Inputs.Polyline.DrawPolylinesDto<THREEJS.Group>(
                polylinesData,
                1,
                "#ff0000",
                2
            );

            const result = drawHelper.drawPolylinesWithColours(inputs);

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(THREEJS.Group);
            expect(result.name).toContain("polylines");
        });

        it("should handle polylines with assigned colors", () => {
            const polylinesData = [
                { points: [[0, 0, 0], [1, 0, 0]] as Inputs.Base.Point3[], isClosed: false, color: [1, 0, 0] as [number, number, number] },
                { points: [[2, 0, 0], [3, 0, 0]] as Inputs.Base.Point3[], isClosed: false }
            ];
            const inputs = new Inputs.Polyline.DrawPolylinesDto<THREEJS.Group>(
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
            const inputs = new Inputs.Polyline.DrawPolylinesDto<THREEJS.Group>(
                polylinesData,
                1,
                "#ff0000",
                2
            );

            const result = drawHelper.drawPolylinesWithColours(inputs);

            expect(result).toBeDefined();
        });

        it("should update existing polylines mesh when updatable is true", () => {
            const existingMesh = new THREEJS.Group();
            existingMesh.name = "existingPolylines";
            const lineGeom = new THREEJS.BufferGeometry();
            const lineMat = new THREEJS.LineBasicMaterial();
            const lineSegments = new THREEJS.LineSegments(lineGeom, lineMat);
            lineSegments.userData = { linesForRenderLengths: "2,2" };
            existingMesh.add(lineSegments);

            const polylinesData = [
                { points: [[0, 0, 0], [5, 5, 5]] as Inputs.Base.Point3[], isClosed: false },
                { points: [[6, 6, 6], [7, 7, 7]] as Inputs.Base.Point3[], isClosed: false }
            ];
            const inputs = new Inputs.Polyline.DrawPolylinesDto<THREEJS.Group>(
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
            const inputs = new Inputs.Verb.DrawCurveDto<THREEJS.Group>(
                mockCurve,
                1,
                "#ff0000",
                2
            );

            const result = drawHelper.drawCurve(inputs);

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(THREEJS.Group);
            expect(mockCurve.tessellate).toHaveBeenCalled();
        });

        it("should update existing curve mesh when updatable is true", () => {
            const existingMesh = new THREEJS.Group();
            existingMesh.name = "existingCurve";
            const lineGeom = new THREEJS.BufferGeometry();
            const lineMat = new THREEJS.LineBasicMaterial();
            existingMesh.add(new THREEJS.LineSegments(lineGeom, lineMat));

            const mockCurve = {
                tessellate: jest.fn().mockReturnValue([
                    [0, 0, 0], [1, 1, 1], [2, 2, 2]
                ] as Inputs.Base.Point3[])
            };
            const inputs = new Inputs.Verb.DrawCurveDto<THREEJS.Group>(
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
            const inputs = new Inputs.Verb.DrawCurvesDto<THREEJS.Group>(
                mockCurves,
                1,
                "#ff0000",
                2
            );

            const result = drawHelper.drawCurves(inputs);

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(THREEJS.Group);
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
            const inputs = new Inputs.Verb.DrawSurfaceDto<THREEJS.Group>(
                mockSurface,
                1,
                "#ff0000",
                false,
                false
            );

            const result = drawHelper.drawSurface(inputs);

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(THREEJS.Group);
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
            const inputs = new Inputs.Verb.DrawSurfaceDto<THREEJS.Group>(
                mockSurface,
                1,
                "#0000ff",
                false,
                true // hidden
            );

            const result = drawHelper.drawSurface(inputs);

            expect(result).toBeDefined();
            expect(result.visible).toBe(false);
        });

        it("should update existing surface mesh when updatable is true", () => {
            const existingMesh = new THREEJS.Group();
            existingMesh.name = "existingSurface";

            const mockSurface = {
                tessellate: jest.fn().mockReturnValue({
                    faces: [[0, 1, 2]],
                    points: [[0, 0, 0], [1, 0, 0], [0, 1, 0]],
                    normals: [[0, 0, 1], [0, 0, 1], [0, 0, 1]]
                })
            };
            const inputs = new Inputs.Verb.DrawSurfaceDto<THREEJS.Group>(
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
            const inputs = new Inputs.Verb.DrawSurfaceDto<THREEJS.Group>(
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

            const inputs = new Inputs.Verb.DrawSurfacesColoursDto<THREEJS.Group>(
                [mockSurface1, mockSurface2],
                ["#ff0000", "#00ff00"],
                1,
                false,
                false
            );

            const result = drawHelper.drawSurfacesMultiColour(inputs);

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(THREEJS.Group);
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

            const inputs = new Inputs.Verb.DrawSurfacesColoursDto<THREEJS.Group>(
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

            const inputs = new Inputs.Verb.DrawSurfacesColoursDto<THREEJS.Group>(
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
            const existingMesh = new THREEJS.Group();
            existingMesh.name = "existingSurfacesMesh";

            const mockSurface = {
                tessellate: jest.fn().mockReturnValue({
                    faces: [[0, 1, 2]],
                    points: [[0, 0, 0], [1, 0, 0], [0, 1, 0]],
                    normals: [[0, 0, 1], [0, 0, 1], [0, 0, 1]]
                })
            };

            const inputs = new Inputs.Verb.DrawSurfacesColoursDto<THREEJS.Group>(
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
            const inputs = new Inputs.JSCAD.DrawSolidMeshDto<THREEJS.Group>(
                mockMesh,
                1,
                "#ff0000",
                false,
                false
            );

            const result = await drawHelper.drawSolidOrPolygonMesh(inputs);

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(THREEJS.Group);
            expect(mockJscadWorkerManager.genericCallToWorkerPromise).toHaveBeenCalledWith("shapeToMesh", expect.anything());
        });

        it("should handle mesh with baked-in color", async () => {
            const mockMesh = { type: "solid", color: [1, 0, 0, 1] };
            const inputs = new Inputs.JSCAD.DrawSolidMeshDto<THREEJS.Group>(
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
            const inputs = new Inputs.JSCAD.DrawSolidMeshDto<THREEJS.Group>(
                mockMesh,
                1,
                "#ff0000",
                false,
                true // hidden
            );

            const result = await drawHelper.drawSolidOrPolygonMesh(inputs);

            expect(result).toBeDefined();
            expect(result.visible).toBe(false);
        });

        it("should update existing mesh when updatable is true", async () => {
            const existingMesh = new THREEJS.Group();
            existingMesh.name = "existingJscadMesh";

            const mockMesh = { type: "solid" };
            const inputs = new Inputs.JSCAD.DrawSolidMeshDto<THREEJS.Group>(
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
            const inputs = new Inputs.JSCAD.DrawSolidMeshDto<THREEJS.Group>(
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
            const inputs = new Inputs.JSCAD.DrawSolidMeshesDto<THREEJS.Group>(
                mockMeshes,
                1,
                "#ff0000",
                false,
                false
            );

            const result = await drawHelper.drawSolidOrPolygonMeshes(inputs);

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(THREEJS.Group);
        });

        it("should handle meshes with baked colours", async () => {
            (mockJscadWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue([
                { positions: [0, 0, 0], normals: [0, 0, 1], indices: [0], transforms: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], color: [1, 0, 0] },
                { positions: [1, 0, 0], normals: [0, 0, 1], indices: [0], transforms: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] }
            ]);

            const mockMeshes = [{ type: "solid" }, { type: "solid" }];
            const inputs = new Inputs.JSCAD.DrawSolidMeshesDto<THREEJS.Group>(
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
            const inputs = new Inputs.JSCAD.DrawSolidMeshesDto<THREEJS.Group>(
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

            const existingMesh = new THREEJS.Group();
            existingMesh.name = "existingMeshes";

            const mockMeshes = [{ type: "solid" }];
            const inputs = new Inputs.JSCAD.DrawSolidMeshesDto<THREEJS.Group>(
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

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const inputs = new Inputs.OCCT.DrawShapeDto() as any;
            inputs.shape = { hash: "abc123", type: "solid" };
            inputs.drawFaces = true;
            inputs.drawEdges = false;
            inputs.drawVertices = false;
            inputs.faceColour = "#ff0000";
            inputs.faceOpacity = 1;

            const result = await drawHelper.drawShape(inputs as Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>);

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(THREEJS.Group);
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

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const inputs = new Inputs.OCCT.DrawShapeDto() as any;
            inputs.shape = { hash: "abc123", type: "edge" };
            inputs.drawFaces = false;
            inputs.drawEdges = true;
            inputs.drawVertices = false;
            inputs.edgeColour = "#00ff00";
            inputs.edgeWidth = 2;
            inputs.edgeOpacity = 1;

            const result = await drawHelper.drawShape(inputs as Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>);

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(THREEJS.Group);
        });

        it("should draw OCCT shape with vertices", async () => {
            (mockOccWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue({
                faceList: [],
                edgeList: [],
                pointsList: [[0, 0, 0], [1, 1, 1]]
            });

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const inputs = new Inputs.OCCT.DrawShapeDto() as any;
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

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const inputs = new Inputs.OCCT.DrawShapesDto() as any;
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
            expect(result).toBeInstanceOf(THREEJS.Group);
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

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const inputs = new Inputs.Manifold.DrawManifoldOrCrossSectionDto() as any;
            inputs.manifoldOrCrossSection = { hash: "mf123", type: "manifold" };
            inputs.faceColour = "#ff0000";
            inputs.faceOpacity = 1;

            const result = await drawHelper.drawManifoldOrCrossSection(inputs);

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(THREEJS.Group);
            expect(mockManifoldWorkerManager.genericCallToWorkerPromise).toHaveBeenCalledWith("decomposeManifoldOrCrossSection", expect.anything());
        });

        it("should return undefined when triVerts is empty", async () => {
            (mockManifoldWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue({
                vertProperties: new Float32Array([]),
                triVerts: new Uint32Array([])
            });

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const inputs = new Inputs.Manifold.DrawManifoldOrCrossSectionDto() as any;
            inputs.manifoldOrCrossSection = { hash: "mf123", type: "manifold" };

            const result = await drawHelper.drawManifoldOrCrossSection(inputs);

            expect(result).toBeUndefined();
        });

        it("should handle cross section polygons", async () => {
            // When decomposed mesh is 2D polygons instead of 3D mesh
            (mockManifoldWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue([
                [[0, 0], [1, 0], [1, 1], [0, 1]] as Inputs.Base.Vector2[]
            ]);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const inputs = new Inputs.Manifold.DrawManifoldOrCrossSectionDto() as any;
            inputs.manifoldOrCrossSection = { hash: "cs123", type: "crossSection" };
            inputs.crossSectionColour = "#00ff00";
            inputs.crossSectionOpacity = 1;
            inputs.crossSectionWidth = 2;

            const result = await drawHelper.drawManifoldOrCrossSection(inputs);

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(THREEJS.Group);
        });
    });

    describe("drawManifoldsOrCrossSections", () => {
        it("should draw multiple manifolds", async () => {
            (mockManifoldWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue([
                { vertProperties: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]), triVerts: new Uint32Array([0, 1, 2]) },
                { vertProperties: new Float32Array([1, 0, 0, 2, 0, 0, 1, 1, 0]), triVerts: new Uint32Array([0, 1, 2]) }
            ]);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const inputs = new Inputs.Manifold.DrawManifoldsOrCrossSectionsDto() as any;
            inputs.manifoldsOrCrossSections = [
                { hash: "mf123", type: "manifold" },
                { hash: "mf456", type: "manifold" }
            ];
            inputs.faceColour = "#ff0000";

            const result = await drawHelper.drawManifoldsOrCrossSections(inputs);

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(THREEJS.Group);
        });

        it("should filter out undefined meshes", async () => {
            (mockManifoldWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue([
                { vertProperties: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]), triVerts: new Uint32Array([0, 1, 2]) },
                { vertProperties: new Float32Array([]), triVerts: new Uint32Array([]) } // This will be filtered out
            ]);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const inputs = new Inputs.Manifold.DrawManifoldsOrCrossSectionsDto() as any;
            inputs.manifoldsOrCrossSections = [
                { hash: "mf123", type: "manifold" },
                { hash: "mf456", type: "manifold" }
            ];
            inputs.faceColour = "#ff0000";

            const result = await drawHelper.drawManifoldsOrCrossSections(inputs);

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(THREEJS.Group);
        });
    });

    describe("updatePointsInstances", () => {
        it("should update positions of instanced meshes", () => {
            const group = new THREEJS.Group();
            const geometry = new THREEJS.SphereGeometry(0.5);
            const material = new THREEJS.MeshBasicMaterial();
            
            const mesh1 = new THREEJS.InstancedMesh(geometry, material, 1);
            mesh1.userData = { index: 0 };
            const mesh2 = new THREEJS.InstancedMesh(geometry, material, 1);
            mesh2.userData = { index: 1 };
            
            group.add(mesh1);
            group.add(mesh2);

            const newPositions: Inputs.Base.Point3[] = [[5, 5, 5], [10, 10, 10]];
            
            drawHelper.updatePointsInstances(group, newPositions);

            expect(mesh1.position.x).toBe(5);
            expect(mesh1.position.y).toBe(5);
            expect(mesh1.position.z).toBe(5);
            expect(mesh2.position.x).toBe(10);
            expect(mesh2.position.y).toBe(10);
            expect(mesh2.position.z).toBe(10);
        });
    });

    describe("createOrUpdateSurfacesMesh", () => {
        it("should create new surface mesh when group is undefined", () => {
            const meshData = [{
                positions: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                normals: [0, 0, 1, 0, 0, 1, 0, 0, 1],
                indices: [0, 1, 2]
            }];
            const material = new THREEJS.MeshPhysicalMaterial({ color: "#ff0000" });

            const result = drawHelper.createOrUpdateSurfacesMesh(
                meshData,
                undefined as unknown as THREEJS.Group,
                false,
                material,
                true,
                false
            );

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(THREEJS.Group);
            expect(result.name).toContain("surface");
        });

        it("should update existing mesh when updatable is true", () => {
            const existingGroup = new THREEJS.Group();
            existingGroup.name = "existingSurface";
            
            const meshData = [{
                positions: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                normals: [0, 0, 1, 0, 0, 1, 0, 0, 1],
                indices: [0, 1, 2]
            }];
            const material = new THREEJS.MeshPhysicalMaterial({ color: "#00ff00" });

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
            const material = new THREEJS.MeshPhysicalMaterial({ color: "#ff0000" });

            const result = drawHelper.createOrUpdateSurfacesMesh(
                meshData,
                undefined as unknown as THREEJS.Group,
                false,
                material,
                true,
                true // hidden
            );

            expect(result.visible).toBe(false);
        });

        it("should handle mesh data with UVs", () => {
            const meshData = [{
                positions: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                normals: [0, 0, 1, 0, 0, 1, 0, 0, 1],
                indices: [0, 1, 2],
                uvs: [0, 0, 1, 0, 0.5, 1]
            }];
            const material = new THREEJS.MeshPhysicalMaterial({ color: "#ff0000" });

            const result = drawHelper.createOrUpdateSurfacesMesh(
                meshData,
                undefined as unknown as THREEJS.Group,
                false,
                material,
                true,
                false
            );

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(THREEJS.Group);
        });
    });

    describe("drawPolyline (internal)", () => {
        it("should create new polyline when mesh is undefined", () => {
            const points: Inputs.Base.Point3[] = [[0, 0, 0], [1, 1, 1], [2, 0, 0]];

            const result = drawHelper.drawPolyline(
                undefined as unknown as THREEJS.Group,
                points,
                false,
                2,
                1,
                "#ff0000"
            );

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(THREEJS.Group);
            expect(result.name).toContain("polyline");
        });

        it("should handle existing mesh with children", () => {
            const existingMesh = new THREEJS.Group();
            const lineGeom = new THREEJS.BufferGeometry();
            const lineMat = new THREEJS.LineBasicMaterial();
            existingMesh.add(new THREEJS.LineSegments(lineGeom, lineMat));

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
});
