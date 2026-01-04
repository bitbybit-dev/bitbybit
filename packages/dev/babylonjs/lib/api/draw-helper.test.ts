jest.mock("@babylonjs/core", () => {
    const { createBabylonJSMock } = jest.requireActual("./__mocks__/babylonjs.mock");
    return createBabylonJSMock();
});

import { createDrawHelperMocks } from "./__mocks__/test-helpers";
import { DrawHelper } from "./draw-helper";
import { Context } from "./context";
import * as Inputs from "./inputs";
import { JSCADText, JSCADWorkerManager } from "@bitbybit-dev/jscad-worker";
import { ManifoldWorkerManager } from "@bitbybit-dev/manifold-worker";
import { OCCTWorkerManager } from "@bitbybit-dev/occt-worker";
import { Vector } from "@bitbybit-dev/base";
import * as BABYLON from "@babylonjs/core";

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
        jest.clearAllMocks();
    });

    // Helper function to convert hex color to RGB values (0-1 range)
    const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (result) {
            return {
                r: parseInt(result[1], 16) / 255,
                g: parseInt(result[2], 16) / 255,
                b: parseInt(result[3], 16) / 255
            };
        }
        return { r: 1, g: 0, b: 0 }; // Default to red if parsing fails
    };

    // Helper function to check if two colors are approximately equal (within tolerance)
    const colorsAreEqual = (
        color1: { r: number; g: number; b: number },
        color2: { r: number; g: number; b: number },
        tolerance = 0.01
    ): boolean => {
        return Math.abs(color1.r - color2.r) < tolerance &&
               Math.abs(color1.g - color2.g) < tolerance &&
               Math.abs(color1.b - color2.b) < tolerance;
    };

    // ==================== Phase 2: Point Drawing Tests ====================

    describe("drawPoint", () => {
        it("should draw a point with default options", () => {
            const inputs = new Inputs.Point.DrawPointDto<BABYLON.Mesh>(
                [1, 2, 3],
                1,
                0.5,
                "#ff0000",
                false
            );

            const result = drawHelper.drawPoint(inputs);

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(BABYLON.Mesh);
            expect(result.name).toContain("pointMesh");
            expect(result.getChildMeshes().length).toBe(1);
        });

        it("should draw a point with array of colours", () => {
            const inputs = new Inputs.Point.DrawPointDto<BABYLON.Mesh>(
                [0, 0, 0],
                0.5,
                1,
                ["#ff0000", "#00ff00"]
            );

            const result = drawHelper.drawPoint(inputs);
            
            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(BABYLON.Mesh);
            expect(result.getChildMeshes().length).toBe(1);
        });

        it("should update existing point mesh when updatable is true", () => {
            // First create a point
            const initialInputs = new Inputs.Point.DrawPointDto<BABYLON.Mesh>(
                [0, 0, 0],
                1,
                0.5,
                "#ff0000",
                true
            );
            const existingMesh = drawHelper.drawPoint(initialInputs);

            // Now update with new position
            const updateInputs = new Inputs.Point.DrawPointDto<BABYLON.Mesh>(
                [5, 5, 5],
                1,
                0.5,
                "#0000ff",
                true,
                existingMesh
            );

            const result = drawHelper.drawPoint(updateInputs);
            
            expect(result).toBe(existingMesh);
            expect(result.getChildMeshes().length).toBe(1);
        });
    });

    describe("drawPoints", () => {
        it("should draw multiple points", () => {
            const inputs = new Inputs.Point.DrawPointsDto<BABYLON.Mesh>(
                [[0, 0, 0], [1, 1, 1], [2, 2, 2]],
                1,
                0.3,
                "#ff0000"
            );

            const result = drawHelper.drawPoints(inputs);

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(BABYLON.Mesh);
            expect(result.name).toContain("pointsMesh");
            expect(result.getChildMeshes().length).toBe(3);
        });

        it("should draw points with per-point colours", () => {
            const inputs = new Inputs.Point.DrawPointsDto<BABYLON.Mesh>(
                [[0, 0, 0], [1, 1, 1], [2, 2, 2]],
                1,
                0.3,
                ["#ff0000", "#00ff00", "#0000ff"]
            );

            const result = drawHelper.drawPoints(inputs);
            
            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(BABYLON.Mesh);
            expect(result.getChildMeshes().length).toBe(3);
        });

        it("should handle mismatched colour array length", () => {
            const inputs = new Inputs.Point.DrawPointsDto<BABYLON.Mesh>(
                [[0, 0, 0], [1, 1, 1], [2, 2, 2], [3, 3, 3]],
                1,
                0.3,
                ["#ff0000", "#00ff00"] // Only 2 colours for 4 points
            );

            const result = drawHelper.drawPoints(inputs);
            
            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(BABYLON.Mesh);
            // Implementation groups by color and creates instances per color group
            // With 2 colors, we get 4 instances (2 per color since colors cycle through points)
            expect(result.getChildMeshes().length).toBeGreaterThanOrEqual(2);
        });

        it("should update existing points mesh when updatable is true with same point count", () => {
            // First create points
            const firstInputs = new Inputs.Point.DrawPointsDto<BABYLON.Mesh>(
                [[0, 0, 0], [1, 1, 1]],
                1,
                0.3,
                "#ff0000"
            );
            const existingMesh = drawHelper.drawPoints(firstInputs);

            // Now update with new positions
            const updateInputs = new Inputs.Point.DrawPointsDto<BABYLON.Mesh>(
                [[5, 5, 5], [6, 6, 6]],
                1,
                0.3,
                "#ff0000",
                true,
                existingMesh
            );

            const result = drawHelper.drawPoints(updateInputs);
            
            expect(result).toBe(existingMesh);
            expect(result.getChildMeshes().length).toBe(2);
        });

        it("should recreate points mesh when point count changes during update", () => {
            // First create points
            const firstInputs = new Inputs.Point.DrawPointsDto<BABYLON.Mesh>(
                [[0, 0, 0], [1, 1, 1]],
                1,
                0.3,
                "#ff0000"
            );
            const existingMesh = drawHelper.drawPoints(firstInputs);

            // Now update with different point count
            const updateInputs = new Inputs.Point.DrawPointsDto<BABYLON.Mesh>(
                [[5, 5, 5], [6, 6, 6], [7, 7, 7]],
                1,
                0.3,
                "#ff0000",
                true,
                existingMesh
            );

            const result = drawHelper.drawPoints(updateInputs);
            
            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(BABYLON.Mesh);
            expect(result.getChildMeshes().length).toBe(3);
        });
    });

    describe("updatePointsInstances", () => {
        it("should update positions of instanced meshes", () => {
            // First create points to get a mesh with instances
            const inputs = new Inputs.Point.DrawPointsDto<BABYLON.Mesh>(
                [[0, 0, 0], [1, 1, 1]],
                1,
                0.3,
                "#ff0000"
            );
            const mesh = drawHelper.drawPoints(inputs);

            // Update positions
            const newPositions: Inputs.Base.Point3[] = [[5, 5, 5], [10, 10, 10]];
            drawHelper.updatePointsInstances(mesh, newPositions);

            // Verify the mesh is still valid
            expect(mesh).toBeDefined();
            expect(mesh.getChildMeshes().length).toBe(2);
        });
    });

    // ==================== Phase 3: Polyline & Curve Tests ====================

    describe("drawPolylineClose", () => {
        it("should draw a polyline", () => {
            const polylineData = {
                points: [[0, 0, 0], [1, 0, 0], [1, 1, 0]] as Inputs.Base.Point3[],
                isClosed: false
            };
            const inputs = new Inputs.Polyline.DrawPolylineDto<BABYLON.GreasedLineMesh>(
                polylineData,
                1,
                "#00ff00",
                2
            );

            const result = drawHelper.drawPolylineClose(inputs);

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(BABYLON.GreasedLineMesh);
        });

        it("should close the polyline when isClosed is true", () => {
            const polylineData = {
                points: [[0, 0, 0], [1, 0, 0], [1, 1, 0]] as Inputs.Base.Point3[],
                isClosed: true
            };
            const inputs = new Inputs.Polyline.DrawPolylineDto<BABYLON.GreasedLineMesh>(
                polylineData,
                1,
                "#00ff00",
                2
            );

            const result = drawHelper.drawPolylineClose(inputs);

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(BABYLON.GreasedLineMesh);
        });

        it("should update existing polyline mesh when updatable is true", () => {
            // First create a polyline
            const initialData = {
                points: [[0, 0, 0], [1, 1, 1]] as Inputs.Base.Point3[],
                isClosed: false
            };
            const initialInputs = new Inputs.Polyline.DrawPolylineDto<BABYLON.GreasedLineMesh>(
                initialData,
                1,
                "#ff0000",
                2
            );
            const existingMesh = drawHelper.drawPolylineClose(initialInputs);

            // Update the polyline
            const updateData = {
                points: [[0, 0, 0], [2, 2, 2]] as Inputs.Base.Point3[],
                isClosed: false
            };
            const updateInputs = new Inputs.Polyline.DrawPolylineDto<BABYLON.GreasedLineMesh>(
                updateData,
                1,
                "#0000ff",
                3,
                true,
                existingMesh
            );

            const result = drawHelper.drawPolylineClose(updateInputs);

            expect(result).toBeDefined();
        });
    });

    describe("drawPolylinesWithColours", () => {
        it("should draw multiple polylines", () => {
            const polylinesData = [
                { points: [[0, 0, 0], [1, 0, 0]] as Inputs.Base.Point3[], isClosed: false },
                { points: [[2, 0, 0], [3, 0, 0]] as Inputs.Base.Point3[], isClosed: false }
            ];
            const inputs = new Inputs.Polyline.DrawPolylinesDto<BABYLON.GreasedLineMesh>(
                polylinesData,
                1,
                "#ff0000",
                2
            );

            const result = drawHelper.drawPolylinesWithColours(inputs);

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(BABYLON.GreasedLineMesh);
        });

        it("should handle polylines with assigned colors", () => {
            const polylinesData = [
                { points: [[0, 0, 0], [1, 0, 0]] as Inputs.Base.Point3[], isClosed: false, color: [1, 0, 0] as [number, number, number] },
                { points: [[2, 0, 0], [3, 0, 0]] as Inputs.Base.Point3[], isClosed: false }
            ];
            const inputs = new Inputs.Polyline.DrawPolylinesDto<BABYLON.GreasedLineMesh>(
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
            const inputs = new Inputs.Polyline.DrawPolylinesDto<BABYLON.GreasedLineMesh>(
                polylinesData,
                1,
                "#ff0000",
                2
            );

            const result = drawHelper.drawPolylinesWithColours(inputs);

            expect(result).toBeDefined();
        });

        it("should update existing polylines mesh when updatable is true", () => {
            // First create polylines
            const initialData = [
                { points: [[0, 0, 0], [1, 1, 1]] as Inputs.Base.Point3[], isClosed: false }
            ];
            const initialInputs = new Inputs.Polyline.DrawPolylinesDto<BABYLON.GreasedLineMesh>(
                initialData,
                1,
                "#ff0000",
                2
            );
            const existingMesh = drawHelper.drawPolylinesWithColours(initialInputs);

            // Update polylines
            const updateData = [
                { points: [[0, 0, 0], [5, 5, 5]] as Inputs.Base.Point3[], isClosed: false },
                { points: [[6, 6, 6], [7, 7, 7]] as Inputs.Base.Point3[], isClosed: false }
            ];
            const updateInputs = new Inputs.Polyline.DrawPolylinesDto<BABYLON.GreasedLineMesh>(
                updateData,
                1,
                "#0000ff",
                3,
                true,
                existingMesh
            );

            const result = drawHelper.drawPolylinesWithColours(updateInputs);

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
            const inputs = new Inputs.Verb.DrawCurveDto<BABYLON.GreasedLineMesh>(
                mockCurve,
                1,
                "#ff0000",
                2
            );

            const result = drawHelper.drawCurve(inputs);

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(BABYLON.GreasedLineMesh);
            expect(mockCurve.tessellate).toHaveBeenCalled();
        });

        it("should update existing curve mesh when updatable is true", () => {
            const mockCurve = {
                tessellate: jest.fn().mockReturnValue([
                    [0, 0, 0], [1, 1, 1], [2, 2, 2]
                ] as Inputs.Base.Point3[])
            };
            const initialInputs = new Inputs.Verb.DrawCurveDto<BABYLON.GreasedLineMesh>(
                mockCurve,
                1,
                "#ff0000",
                2
            );
            const existingMesh = drawHelper.drawCurve(initialInputs);

            const updateInputs = new Inputs.Verb.DrawCurveDto<BABYLON.GreasedLineMesh>(
                mockCurve,
                0.8,
                "#00ff00",
                3,
                true,
                existingMesh
            );

            const result = drawHelper.drawCurve(updateInputs);

            expect(result).toBeDefined();
        });
    });

    describe("drawCurves", () => {
        it("should draw multiple curves", () => {
            const mockCurves = [
                { tessellate: jest.fn().mockReturnValue([[0, 0, 0], [1, 1, 1]] as Inputs.Base.Point3[]) },
                { tessellate: jest.fn().mockReturnValue([[2, 2, 2], [3, 3, 3]] as Inputs.Base.Point3[]) }
            ];
            const inputs = new Inputs.Verb.DrawCurvesDto<BABYLON.GreasedLineMesh>(
                mockCurves,
                1,
                "#ff0000",
                2
            );

            const result = drawHelper.drawCurves(inputs);

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(BABYLON.GreasedLineMesh);
        });
    });

    describe("drawLines", () => {
        it("should draw lines", () => {
            const inputs = new Inputs.Line.DrawLinesDto<BABYLON.LinesMesh>(
                [
                    { start: [0, 0, 0], end: [1, 0, 0] },
                    { start: [0, 1, 0], end: [1, 1, 0] }
                ],
                1,
                "#ff0000",
                2
            );

            const result = drawHelper.drawLines(inputs);

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(BABYLON.LinesMesh);
        });

        it("should handle array of colours for lines", () => {
            const inputs = new Inputs.Line.DrawLinesDto<BABYLON.LinesMesh>(
                [
                    { start: [0, 0, 0], end: [1, 0, 0] },
                    { start: [0, 1, 0], end: [1, 1, 0] }
                ],
                1,
                ["#ff0000", "#00ff00"],
                2
            );

            const result = drawHelper.drawLines(inputs);

            expect(result).toBeDefined();
        });

        it("should update existing lines mesh when updatable is true", () => {
            const initialInputs = new Inputs.Line.DrawLinesDto<BABYLON.LinesMesh>(
                [{ start: [0, 0, 0], end: [1, 0, 0] }],
                1,
                "#ff0000",
                2
            );
            const existingMesh = drawHelper.drawLines(initialInputs);

            const updateInputs = new Inputs.Line.DrawLinesDto<BABYLON.LinesMesh>(
                [{ start: [0, 0, 0], end: [2, 2, 2] }],
                1,
                "#0000ff",
                3,
                true,
                existingMesh
            );

            const result = drawHelper.drawLines(updateInputs);

            expect(result).toBeDefined();
        });
    });

    // ==================== Phase 4: Surface Tests ====================

    describe("drawSurface", () => {
        it("should draw a surface", () => {
            const mockSurface = {
                tessellate: jest.fn().mockReturnValue({
                    faces: [[0, 1, 2]],
                    points: [[0, 0, 0], [1, 0, 0], [0, 1, 0]],
                    normals: [[0, 0, 1], [0, 0, 1], [0, 0, 1]]
                })
            };
            const inputs = new Inputs.Verb.DrawSurfaceDto<BABYLON.Mesh>(
                mockSurface,
                1,
                "#ff0000",
                false,
                false,
                undefined,
                false // drawTwoSided disabled for this test
            );

            const result = drawHelper.drawSurface(inputs);

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(BABYLON.Mesh);
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
            const inputs = new Inputs.Verb.DrawSurfaceDto<BABYLON.Mesh>(
                mockSurface,
                1,
                "#0000ff",
                false,
                true, // hidden
                undefined,
                false // drawTwoSided disabled for this test
            );

            const result = drawHelper.drawSurface(inputs);

            expect(result).toBeDefined();
            expect(result.isVisible).toBe(false);
        });

        it("should update existing surface mesh when updatable is true", () => {
            const mockSurface = {
                tessellate: jest.fn().mockReturnValue({
                    faces: [[0, 1, 2]],
                    points: [[0, 0, 0], [1, 0, 0], [0, 1, 0]],
                    normals: [[0, 0, 1], [0, 0, 1], [0, 0, 1]]
                })
            };
            const initialInputs = new Inputs.Verb.DrawSurfaceDto<BABYLON.Mesh>(
                mockSurface,
                1,
                "#ff0000",
                false,
                false,
                undefined,
                false
            );
            const existingMesh = drawHelper.drawSurface(initialInputs);

            const updateInputs = new Inputs.Verb.DrawSurfaceDto<BABYLON.Mesh>(
                mockSurface,
                0.5,
                "#00ff00",
                true,
                false,
                existingMesh,
                false
            );

            const result = drawHelper.drawSurface(updateInputs);

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
            const inputs = new Inputs.Verb.DrawSurfaceDto<BABYLON.Mesh>(
                mockSurface,
                1,
                ["#ff0000", "#00ff00", "#0000ff"],
                false,
                false,
                undefined,
                false
            );

            const result = drawHelper.drawSurface(inputs);

            expect(result).toBeDefined();
        });

        it("should draw surface with two-sided rendering enabled by default", () => {
            const mockSurface = {
                tessellate: jest.fn().mockReturnValue({
                    faces: [[0, 1, 2]],
                    points: [[0, 0, 0], [1, 0, 0], [0, 1, 0]],
                    normals: [[0, 0, 1], [0, 0, 1], [0, 0, 1]]
                })
            };
            const inputs = new Inputs.Verb.DrawSurfaceDto<BABYLON.Mesh>(
                mockSurface,
                1,
                "#ff0000",
                false,
                false
                // drawTwoSided defaults to true
            );

            const result = drawHelper.drawSurface(inputs);

            expect(result).toBeDefined();
            // With two-sided rendering, there should be a back face child
            expect(result.getChildMeshes().length).toBe(1);
        });

        it("should draw surface without back face when drawTwoSided is false", () => {
            const mockSurface = {
                tessellate: jest.fn().mockReturnValue({
                    faces: [[0, 1, 2]],
                    points: [[0, 0, 0], [1, 0, 0], [0, 1, 0]],
                    normals: [[0, 0, 1], [0, 0, 1], [0, 0, 1]]
                })
            };
            const inputs = new Inputs.Verb.DrawSurfaceDto<BABYLON.Mesh>(
                mockSurface,
                1,
                "#ff0000",
                false,
                false,
                undefined,
                false // drawTwoSided = false
            );

            const result = drawHelper.drawSurface(inputs);

            expect(result).toBeDefined();
            // Without two-sided rendering, there should be no back face child
            expect(result.getChildMeshes().length).toBe(0);
        });

        it("should draw surface with custom back face colour", () => {
            const mockSurface = {
                tessellate: jest.fn().mockReturnValue({
                    faces: [[0, 1, 2]],
                    points: [[0, 0, 0], [1, 0, 0], [0, 1, 0]],
                    normals: [[0, 0, 1], [0, 0, 1], [0, 0, 1]]
                })
            };
            const inputs = new Inputs.Verb.DrawSurfaceDto<BABYLON.Mesh>(
                mockSurface,
                1,
                "#ff0000",
                false,
                false,
                undefined,
                true, // drawTwoSided = true
                "#00ff00" // custom backFaceColour
            );

            const result = drawHelper.drawSurface(inputs);

            expect(result).toBeDefined();
            expect(result.getChildMeshes().length).toBe(1);
        });

        it("should draw surface with custom back face opacity", () => {
            const mockSurface = {
                tessellate: jest.fn().mockReturnValue({
                    faces: [[0, 1, 2]],
                    points: [[0, 0, 0], [1, 0, 0], [0, 1, 0]],
                    normals: [[0, 0, 1], [0, 0, 1], [0, 0, 1]]
                })
            };
            const inputs = new Inputs.Verb.DrawSurfaceDto<BABYLON.Mesh>(
                mockSurface,
                1,
                "#ff0000",
                false,
                false,
                undefined,
                true, // drawTwoSided = true
                "#0000ff", // backFaceColour
                0.5 // backFaceOpacity
            );

            const result = drawHelper.drawSurface(inputs);

            expect(result).toBeDefined();
            expect(result.getChildMeshes().length).toBe(1);
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

            const inputs = new Inputs.Verb.DrawSurfacesColoursDto<BABYLON.Mesh>(
                [mockSurface1, mockSurface2],
                ["#ff0000", "#00ff00"],
                1,
                false,
                false,
                undefined,
                false // drawTwoSided disabled for this test
            );

            const result = drawHelper.drawSurfacesMultiColour(inputs);

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(BABYLON.Mesh);
            expect(result.getChildMeshes().length).toBe(2);
        });

        it("should use first colour when more surfaces than colours", () => {
            const mockSurface = {
                tessellate: jest.fn().mockReturnValue({
                    faces: [[0, 1, 2]],
                    points: [[0, 0, 0], [1, 0, 0], [0, 1, 0]],
                    normals: [[0, 0, 1], [0, 0, 1], [0, 0, 1]]
                })
            };

            const inputs = new Inputs.Verb.DrawSurfacesColoursDto<BABYLON.Mesh>(
                [mockSurface, mockSurface, mockSurface],
                ["#ff0000"], // Only one colour for 3 surfaces
                1,
                false,
                false,
                undefined,
                false
            );

            const result = drawHelper.drawSurfacesMultiColour(inputs);

            expect(result).toBeDefined();
            expect(result.getChildMeshes().length).toBe(3);
        });

        it("should update existing surfaces mesh when updatable is true", () => {
            const mockSurface = {
                tessellate: jest.fn().mockReturnValue({
                    faces: [[0, 1, 2]],
                    points: [[0, 0, 0], [1, 0, 0], [0, 1, 0]],
                    normals: [[0, 0, 1], [0, 0, 1], [0, 0, 1]]
                })
            };

            const initialInputs = new Inputs.Verb.DrawSurfacesColoursDto<BABYLON.Mesh>(
                [mockSurface],
                ["#ff0000"],
                1,
                false,
                false,
                undefined,
                false
            );
            const existingMesh = drawHelper.drawSurfacesMultiColour(initialInputs);

            const updateInputs = new Inputs.Verb.DrawSurfacesColoursDto<BABYLON.Mesh>(
                [mockSurface],
                ["#00ff00"],
                1,
                true,
                false,
                existingMesh,
                false
            );

            const result = drawHelper.drawSurfacesMultiColour(updateInputs);

            expect(result).toBeDefined();
        });
    });

    describe("createOrUpdateSurfacesMesh", () => {
        it("should create new surface mesh when mesh is undefined", () => {
            const meshData = [{
                positions: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                normals: [0, 0, 1, 0, 0, 1, 0, 0, 1],
                indices: [0, 1, 2]
            }];
            const material = new BABYLON.PBRMetallicRoughnessMaterial("testMaterial");

            const result = drawHelper.createOrUpdateSurfacesMesh(
                meshData,
                undefined as unknown as BABYLON.Mesh,
                false,
                material,
                true,
                false
            );

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(BABYLON.Mesh);
            expect(result.name).toContain("surface");
        });

        it("should update existing mesh when updatable is true", () => {
            const meshData = [{
                positions: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                normals: [0, 0, 1, 0, 0, 1, 0, 0, 1],
                indices: [0, 1, 2]
            }];
            const material = new BABYLON.PBRMetallicRoughnessMaterial("testMaterial");

            // Create initial mesh
            const existingMesh = drawHelper.createOrUpdateSurfacesMesh(
                [...meshData],
                undefined as unknown as BABYLON.Mesh,
                true,
                material,
                true,
                false
            );

            // Update the mesh
            const result = drawHelper.createOrUpdateSurfacesMesh(
                meshData,
                existingMesh,
                true,
                material,
                true,
                false
            );

            expect(result).toBeDefined();
        });

        it("should set mesh invisible when hidden is true", () => {
            const meshData = [{
                positions: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                normals: [0, 0, 1, 0, 0, 1, 0, 0, 1],
                indices: [0, 1, 2]
            }];
            const material = new BABYLON.PBRMetallicRoughnessMaterial("testMaterial");

            const result = drawHelper.createOrUpdateSurfacesMesh(
                meshData,
                undefined as unknown as BABYLON.Mesh,
                false,
                material,
                true,
                true // hidden
            );

            expect(result).toBeDefined();
            expect(result.isVisible).toBe(false);
        });

        it("should handle mesh data with UVs", () => {
            const meshData = [{
                positions: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                normals: [0, 0, 1, 0, 0, 1, 0, 0, 1],
                indices: [0, 1, 2],
                uvs: [0, 0, 1, 0, 0.5, 1]
            }];
            const material = new BABYLON.PBRMetallicRoughnessMaterial("testMaterial");

            const result = drawHelper.createOrUpdateSurfacesMesh(
                meshData,
                undefined as unknown as BABYLON.Mesh,
                false,
                material,
                true,
                false
            );

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(BABYLON.Mesh);
        });
    });

    // ==================== Phase 5: JSCAD Mesh Tests ====================

    describe("drawSolidOrPolygonMesh", () => {
        it("should draw JSCAD solid mesh", async () => {
            const mockMesh = { type: "solid" };
            const inputs = new Inputs.JSCAD.DrawSolidMeshDto<BABYLON.Mesh>(
                mockMesh,
                1,
                "#ff0000",
                false,
                false,
                undefined,
                false // drawTwoSided disabled for this test
            );

            const result = await drawHelper.drawSolidOrPolygonMesh(inputs);

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(BABYLON.Mesh);
            expect(mockJscadWorkerManager.genericCallToWorkerPromise).toHaveBeenCalledWith("shapeToMesh", expect.anything());
        });

        it("should handle mesh with baked-in color", async () => {
            const mockMesh = { type: "solid", color: [1, 0, 0, 1] };
            const inputs = new Inputs.JSCAD.DrawSolidMeshDto<BABYLON.Mesh>(
                mockMesh,
                1,
                "#0000ff",
                false,
                false,
                undefined,
                false
            );

            const result = await drawHelper.drawSolidOrPolygonMesh(inputs);

            expect(result).toBeDefined();
        });

        it("should handle hidden mesh", async () => {
            const mockMesh = { type: "solid" };
            const inputs = new Inputs.JSCAD.DrawSolidMeshDto<BABYLON.Mesh>(
                mockMesh,
                1,
                "#ff0000",
                false,
                true, // hidden
                undefined,
                false
            );

            const result = await drawHelper.drawSolidOrPolygonMesh(inputs);

            expect(result).toBeDefined();
            expect(result.isVisible).toBe(false);
        });

        it("should update existing mesh when updatable is true", async () => {
            const mockMesh = { type: "solid" };
            const initialInputs = new Inputs.JSCAD.DrawSolidMeshDto<BABYLON.Mesh>(
                mockMesh,
                1,
                "#ff0000",
                false,
                false,
                undefined,
                false
            );
            const existingMesh = await drawHelper.drawSolidOrPolygonMesh(initialInputs);

            const updateInputs = new Inputs.JSCAD.DrawSolidMeshDto<BABYLON.Mesh>(
                mockMesh,
                0.5,
                "#00ff00",
                true,
                false,
                existingMesh,
                false
            );

            const result = await drawHelper.drawSolidOrPolygonMesh(updateInputs);

            expect(result).toBe(existingMesh);
        });

        it("should use array first colour when colours is array", async () => {
            const mockMesh = { type: "solid" };
            const inputs = new Inputs.JSCAD.DrawSolidMeshDto<BABYLON.Mesh>(
                mockMesh,
                1,
                ["#ff0000", "#00ff00"],
                false,
                false,
                undefined,
                false
            );

            const result = await drawHelper.drawSolidOrPolygonMesh(inputs);

            expect(result).toBeDefined();
        });

        it("should draw JSCAD mesh with two-sided rendering enabled by default", async () => {
            const mockMesh = { type: "solid" };
            const inputs = new Inputs.JSCAD.DrawSolidMeshDto<BABYLON.Mesh>(
                mockMesh,
                1,
                "#ff0000",
                false,
                false
                // drawTwoSided defaults to true
            );

            const result = await drawHelper.drawSolidOrPolygonMesh(inputs);

            expect(result).toBeDefined();
            // With two-sided rendering, there should be a back face child
            expect(result.getChildMeshes().length).toBe(1);
        });

        it("should draw JSCAD mesh without back face when drawTwoSided is false", async () => {
            const mockMesh = { type: "solid" };
            const inputs = new Inputs.JSCAD.DrawSolidMeshDto<BABYLON.Mesh>(
                mockMesh,
                1,
                "#ff0000",
                false,
                false,
                undefined,
                false // drawTwoSided = false
            );

            const result = await drawHelper.drawSolidOrPolygonMesh(inputs);

            expect(result).toBeDefined();
            // Without two-sided rendering, no back face child
            expect(result.getChildMeshes().length).toBe(0);
        });

        it("should draw JSCAD mesh with custom back face colour", async () => {
            const mockMesh = { type: "solid" };
            const inputs = new Inputs.JSCAD.DrawSolidMeshDto<BABYLON.Mesh>(
                mockMesh,
                1,
                "#ff0000",
                false,
                false,
                undefined,
                true, // drawTwoSided = true
                "#00ff00" // custom backFaceColour
            );

            const result = await drawHelper.drawSolidOrPolygonMesh(inputs);

            expect(result).toBeDefined();
            expect(result.getChildMeshes().length).toBe(1);
        });

        it("should draw JSCAD mesh with custom back face opacity", async () => {
            const mockMesh = { type: "solid" };
            const inputs = new Inputs.JSCAD.DrawSolidMeshDto<BABYLON.Mesh>(
                mockMesh,
                1,
                "#ff0000",
                false,
                false,
                undefined,
                true, // drawTwoSided = true
                "#0000ff", // backFaceColour
                0.5 // backFaceOpacity
            );

            const result = await drawHelper.drawSolidOrPolygonMesh(inputs);

            expect(result).toBeDefined();
            expect(result.getChildMeshes().length).toBe(1);
        });
    });

    describe("drawSolidOrPolygonMeshes", () => {
        it("should draw multiple JSCAD meshes", async () => {
            (mockJscadWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue([
                { positions: [0, 0, 0, 1, 0, 0, 0, 1, 0], normals: [0, 0, 1, 0, 0, 1, 0, 0, 1], indices: [0, 1, 2], transforms: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] },
                { positions: [1, 0, 0, 2, 0, 0, 1, 1, 0], normals: [0, 0, 1, 0, 0, 1, 0, 0, 1], indices: [0, 1, 2], transforms: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] }
            ]);

            const mockMeshes = [{ type: "solid" }, { type: "solid" }];
            const inputs = new Inputs.JSCAD.DrawSolidMeshesDto<BABYLON.Mesh>(
                mockMeshes,
                1,
                "#ff0000",
                false,
                false,
                undefined,
                false // drawTwoSided disabled for this test
            );

            const result = await drawHelper.drawSolidOrPolygonMeshes(inputs);

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(BABYLON.Mesh);
            expect(result.getChildMeshes().length).toBe(2);
        });

        it("should handle meshes with baked colours", async () => {
            (mockJscadWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue([
                { positions: [0, 0, 0, 1, 0, 0, 0, 1, 0], normals: [0, 0, 1, 0, 0, 1, 0, 0, 1], indices: [0, 1, 2], transforms: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], color: [1, 0, 0] },
                { positions: [1, 0, 0, 2, 0, 0, 1, 1, 0], normals: [0, 0, 1, 0, 0, 1, 0, 0, 1], indices: [0, 1, 2], transforms: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] }
            ]);

            const mockMeshes = [{ type: "solid" }, { type: "solid" }];
            const inputs = new Inputs.JSCAD.DrawSolidMeshesDto<BABYLON.Mesh>(
                mockMeshes,
                1,
                "#0000ff",
                false,
                false,
                undefined,
                false
            );

            const result = await drawHelper.drawSolidOrPolygonMeshes(inputs);

            expect(result).toBeDefined();
            expect(result.getChildMeshes().length).toBe(2);
        });

        it("should handle array of colours matching meshes count", async () => {
            (mockJscadWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue([
                { positions: [0, 0, 0, 1, 0, 0, 0, 1, 0], normals: [0, 0, 1, 0, 0, 1, 0, 0, 1], indices: [0, 1, 2], transforms: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] },
                { positions: [1, 0, 0, 2, 0, 0, 1, 1, 0], normals: [0, 0, 1, 0, 0, 1, 0, 0, 1], indices: [0, 1, 2], transforms: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] }
            ]);

            const mockMeshes = [{ type: "solid" }, { type: "solid" }];
            const inputs = new Inputs.JSCAD.DrawSolidMeshesDto<BABYLON.Mesh>(
                mockMeshes,
                1,
                ["#ff0000", "#00ff00"], // Matching colours
                false,
                false,
                undefined,
                false
            );

            const result = await drawHelper.drawSolidOrPolygonMeshes(inputs);

            expect(result).toBeDefined();
            expect(result.getChildMeshes().length).toBe(2);
        });

        it("should update existing mesh when updatable is true", async () => {
            (mockJscadWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue([
                { positions: [0, 0, 0, 1, 0, 0, 0, 1, 0], normals: [0, 0, 1, 0, 0, 1, 0, 0, 1], indices: [0, 1, 2], transforms: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] }
            ]);

            const mockMeshes = [{ type: "solid" }];
            const initialInputs = new Inputs.JSCAD.DrawSolidMeshesDto<BABYLON.Mesh>(
                mockMeshes,
                1,
                "#ff0000",
                false,
                false,
                undefined,
                false
            );
            const existingMesh = await drawHelper.drawSolidOrPolygonMeshes(initialInputs);

            const updateInputs = new Inputs.JSCAD.DrawSolidMeshesDto<BABYLON.Mesh>(
                mockMeshes,
                1,
                "#ff0000",
                true,
                false,
                existingMesh,
                false
            );

            const result = await drawHelper.drawSolidOrPolygonMeshes(updateInputs);

            expect(result).toBe(existingMesh);
        });
    });

    // ===== PHASE 6: OCCT Shape Tests =====

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
            inputs.shape = { hash: "abc123", type: "solid" } as any;
            inputs.drawFaces = true;
            inputs.drawEdges = false;
            inputs.drawVertices = false;
            inputs.faceColour = "#ff0000";
            inputs.faceOpacity = 1;
            inputs.drawTwoSided = false;

            const result = await drawHelper.drawShape(inputs as Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>);

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(BABYLON.Mesh);
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
            inputs.shape = { hash: "abc123", type: "edge" } as any;
            inputs.drawFaces = false;
            inputs.drawEdges = true;
            inputs.drawVertices = false;
            inputs.edgeColour = "#00ff00";
            inputs.edgeWidth = 2;
            inputs.edgeOpacity = 1;
            inputs.drawTwoSided = false;

            const result = await drawHelper.drawShape(inputs as Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>);

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(BABYLON.Mesh);
        });

        it("should draw OCCT shape with vertices", async () => {
            (mockOccWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue({
                faceList: [],
                edgeList: [],
                pointsList: [[0, 0, 0], [1, 1, 1]]
            });

            const inputs = new Inputs.OCCT.DrawShapeDto();
            inputs.shape = { hash: "abc123", type: "vertex" } as any;
            inputs.drawFaces = false;
            inputs.drawEdges = false;
            inputs.drawVertices = true;
            inputs.vertexColour = "#0000ff";
            inputs.vertexSize = 0.1;
            inputs.drawTwoSided = false;

            const result = await drawHelper.drawShape(inputs as Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>);

            expect(result).toBeDefined();
            // Should have child meshes for points
            expect(result.getChildMeshes().length).toBeGreaterThan(0);
        });

        it("should draw OCCT shape with two-sided rendering enabled by default", async () => {
            (mockOccWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue({
                faceList: [
                    { vertex_coord: [0, 0, 0, 1, 0, 0, 0, 1, 0], normal_coord: [0, 0, 1, 0, 0, 1, 0, 0, 1], tri_indexes: [0, 1, 2] }
                ],
                edgeList: [],
                pointsList: []
            });

            const inputs = new Inputs.OCCT.DrawShapeDto();
            inputs.shape = { hash: "abc123", type: "solid" } as any;
            inputs.drawFaces = true;
            inputs.drawEdges = false;
            inputs.drawVertices = false;
            inputs.faceColour = "#ff0000";
            inputs.faceOpacity = 1;
            // drawTwoSided defaults to true

            const result = await drawHelper.drawShape(inputs as Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>);

            expect(result).toBeDefined();
            // With two-sided rendering, there should be 2 children: front and back face
            expect(result.getChildMeshes().length).toBe(2);
            expect(result).toBeInstanceOf(BABYLON.Mesh);
        });

        it("should draw OCCT shape without back face when drawTwoSided is false", async () => {
            (mockOccWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue({
                faceList: [
                    { vertex_coord: [0, 0, 0, 1, 0, 0, 0, 1, 0], normal_coord: [0, 0, 1, 0, 0, 1, 0, 0, 1], tri_indexes: [0, 1, 2] }
                ],
                edgeList: [],
                pointsList: []
            });

            const inputs = new Inputs.OCCT.DrawShapeDto();
            inputs.shape = { hash: "abc123", type: "solid" } as any;
            inputs.drawFaces = true;
            inputs.drawEdges = false;
            inputs.drawVertices = false;
            inputs.faceColour = "#ff0000";
            inputs.faceOpacity = 1;
            inputs.drawTwoSided = false;

            const result = await drawHelper.drawShape(inputs as Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>);

            expect(result).toBeDefined();
            // With two-sided rendering disabled, there should be only 1 child
            expect(result.getChildMeshes().length).toBe(1);
            expect(result).toBeInstanceOf(BABYLON.Mesh);
        });

        it("should draw OCCT shape with custom back face colour", async () => {
            (mockOccWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue({
                faceList: [
                    { vertex_coord: [0, 0, 0, 1, 0, 0, 0, 1, 0], normal_coord: [0, 0, 1, 0, 0, 1, 0, 0, 1], tri_indexes: [0, 1, 2] }
                ],
                edgeList: [],
                pointsList: []
            });

            const inputs = new Inputs.OCCT.DrawShapeDto();
            inputs.shape = { hash: "abc123", type: "solid" } as any;
            inputs.drawFaces = true;
            inputs.drawEdges = false;
            inputs.drawVertices = false;
            inputs.faceColour = "#ff0000";
            inputs.faceOpacity = 1;
            inputs.drawTwoSided = true;
            inputs.backFaceColour = "#00ff00";

            const result = await drawHelper.drawShape(inputs as Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>);

            expect(result).toBeDefined();
            expect(result.getChildMeshes().length).toBe(2);
        });

        it("should draw OCCT shape with custom back face opacity", async () => {
            (mockOccWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue({
                faceList: [
                    { vertex_coord: [0, 0, 0, 1, 0, 0, 0, 1, 0], normal_coord: [0, 0, 1, 0, 0, 1, 0, 0, 1], tri_indexes: [0, 1, 2] }
                ],
                edgeList: [],
                pointsList: []
            });

            const inputs = new Inputs.OCCT.DrawShapeDto();
            inputs.shape = { hash: "abc123", type: "solid" } as any;
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
            expect(result.getChildMeshes().length).toBe(2);
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
            ] as any[];
            inputs.drawFaces = true;
            inputs.drawEdges = false;
            inputs.faceColour = "#ff0000";
            inputs.faceOpacity = 1;
            inputs.drawTwoSided = false;

            const result = await drawHelper.drawShapes(inputs as Inputs.OCCT.DrawShapesDto<Inputs.OCCT.TopoDSShapePointer>);

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(BABYLON.Mesh);
            expect(mockOccWorkerManager.genericCallToWorkerPromise).toHaveBeenCalledWith("shapesToMeshes", expect.anything());
            // Each shape becomes a child (2 shapes), and each child has 1 mesh child (no two-sided)
            // So result has 2 direct children, each with 1 grandchild
            expect(result.getChildMeshes().length).toBeGreaterThanOrEqual(2);
        });
    });

    // ===== PHASE 7: Manifold Tests =====

    describe("drawManifoldOrCrossSection", () => {
        it("should draw manifold or cross section", async () => {
            (mockManifoldWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue({
                vertProperties: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]),
                triVerts: new Uint32Array([0, 1, 2]),
                numProp: 3
            });

            const inputs = new Inputs.Manifold.DrawManifoldOrCrossSectionDto<Inputs.Manifold.ManifoldPointer | Inputs.Manifold.CrossSectionPointer, BABYLON.PBRMetallicRoughnessMaterial>();
            inputs.manifoldOrCrossSection = { hash: 123, type: "manifold" } as any;
            inputs.faceColour = "#ff0000";
            inputs.faceOpacity = 1;
            inputs.drawTwoSided = false;

            const result = await drawHelper.drawManifoldOrCrossSection(inputs);

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(BABYLON.Mesh);
            expect(mockManifoldWorkerManager.genericCallToWorkerPromise).toHaveBeenCalledWith("decomposeManifoldOrCrossSection", expect.anything());
        });

        it("should return undefined when triVerts is empty", async () => {
            (mockManifoldWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue({
                vertProperties: new Float32Array([]),
                triVerts: new Uint32Array([]),
                numProp: 3
            });

            const inputs = new Inputs.Manifold.DrawManifoldOrCrossSectionDto<Inputs.Manifold.ManifoldPointer | Inputs.Manifold.CrossSectionPointer, BABYLON.PBRMetallicRoughnessMaterial>();
            inputs.manifoldOrCrossSection = { hash: 123, type: "manifold" } as any;
            inputs.drawTwoSided = false;

            const result = await drawHelper.drawManifoldOrCrossSection(inputs);

            expect(result).toBeUndefined();
        });

        it("should handle cross section polygons", async () => {
            (mockManifoldWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue([
                [[0, 0], [1, 0], [1, 1], [0, 1]] as Inputs.Base.Vector2[]
            ]);

            const inputs = new Inputs.Manifold.DrawManifoldOrCrossSectionDto<Inputs.Manifold.ManifoldPointer | Inputs.Manifold.CrossSectionPointer, BABYLON.PBRMetallicRoughnessMaterial>();
            inputs.manifoldOrCrossSection = { hash: 123, type: "crossSection" } as any;
            inputs.crossSectionColour = "#00ff00";
            inputs.crossSectionOpacity = 1;
            inputs.crossSectionWidth = 2;
            inputs.drawTwoSided = false;

            const result = await drawHelper.drawManifoldOrCrossSection(inputs);

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(BABYLON.Mesh);
        });

        it("should draw manifold with two-sided rendering enabled by default", async () => {
            (mockManifoldWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue({
                vertProperties: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]),
                triVerts: new Uint32Array([0, 1, 2]),
                numProp: 3
            });

            const inputs = new Inputs.Manifold.DrawManifoldOrCrossSectionDto<Inputs.Manifold.ManifoldPointer | Inputs.Manifold.CrossSectionPointer, BABYLON.PBRMetallicRoughnessMaterial>();
            inputs.manifoldOrCrossSection = { hash: 123, type: "manifold" } as any;
            inputs.faceColour = "#ff0000";
            inputs.faceOpacity = 1;
            // drawTwoSided defaults to true

            const result = await drawHelper.drawManifoldOrCrossSection(inputs);

            expect(result).toBeDefined();
            // With two-sided rendering, there should be child meshes for back face
            expect(result.getChildMeshes().length).toBeGreaterThan(0);
            expect(result).toBeInstanceOf(BABYLON.Mesh);
        });

        it("should draw manifold without back face when drawTwoSided is false", async () => {
            (mockManifoldWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue({
                vertProperties: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]),
                triVerts: new Uint32Array([0, 1, 2]),
                numProp: 3
            });

            const inputs = new Inputs.Manifold.DrawManifoldOrCrossSectionDto<Inputs.Manifold.ManifoldPointer | Inputs.Manifold.CrossSectionPointer, BABYLON.PBRMetallicRoughnessMaterial>();
            inputs.manifoldOrCrossSection = { hash: 123, type: "manifold" } as any;
            inputs.faceColour = "#ff0000";
            inputs.faceOpacity = 1;
            inputs.drawTwoSided = false;

            const result = await drawHelper.drawManifoldOrCrossSection(inputs);

            expect(result).toBeDefined();
            // With two-sided rendering disabled, there should be no child meshes
            expect(result.getChildMeshes().length).toBe(0);
            expect(result).toBeInstanceOf(BABYLON.Mesh);
        });

        it("should draw manifold with custom back face colour", async () => {
            (mockManifoldWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue({
                vertProperties: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]),
                triVerts: new Uint32Array([0, 1, 2]),
                numProp: 3
            });

            const inputs = new Inputs.Manifold.DrawManifoldOrCrossSectionDto<Inputs.Manifold.ManifoldPointer | Inputs.Manifold.CrossSectionPointer, BABYLON.PBRMetallicRoughnessMaterial>();
            inputs.manifoldOrCrossSection = { hash: 123, type: "manifold" } as any;
            inputs.faceColour = "#ff0000";
            inputs.faceOpacity = 1;
            inputs.drawTwoSided = true;
            inputs.backFaceColour = "#00ff00";

            const result = await drawHelper.drawManifoldOrCrossSection(inputs);

            expect(result).toBeDefined();
            expect(result.getChildMeshes().length).toBeGreaterThan(0);
        });

        it("should draw manifold with custom back face opacity", async () => {
            (mockManifoldWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue({
                vertProperties: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]),
                triVerts: new Uint32Array([0, 1, 2]),
                numProp: 3
            });

            const inputs = new Inputs.Manifold.DrawManifoldOrCrossSectionDto<Inputs.Manifold.ManifoldPointer | Inputs.Manifold.CrossSectionPointer, BABYLON.PBRMetallicRoughnessMaterial>();
            inputs.manifoldOrCrossSection = { hash: 123, type: "manifold" } as any;
            inputs.faceColour = "#ff0000";
            inputs.faceOpacity = 1;
            inputs.drawTwoSided = true;
            inputs.backFaceColour = "#0000ff";
            inputs.backFaceOpacity = 0.5;

            const result = await drawHelper.drawManifoldOrCrossSection(inputs);

            expect(result).toBeDefined();
            expect(result.getChildMeshes().length).toBeGreaterThan(0);
        });
    });

    describe("drawManifoldsOrCrossSections", () => {
        it("should draw multiple manifolds", async () => {
            (mockManifoldWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue([
                { vertProperties: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]), triVerts: new Uint32Array([0, 1, 2]), numProp: 3 },
                { vertProperties: new Float32Array([1, 0, 0, 2, 0, 0, 1, 1, 0]), triVerts: new Uint32Array([0, 1, 2]), numProp: 3 }
            ]);

            const inputs = new Inputs.Manifold.DrawManifoldsOrCrossSectionsDto<Inputs.Manifold.ManifoldPointer | Inputs.Manifold.CrossSectionPointer, BABYLON.PBRMetallicRoughnessMaterial>();
            inputs.manifoldsOrCrossSections = [
                { hash: 123, type: "manifold" },
                { hash: 456, type: "manifold" }
            ] as any[];
            inputs.faceColour = "#ff0000";
            inputs.drawTwoSided = false;

            const result = await drawHelper.drawManifoldsOrCrossSections(inputs);

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(BABYLON.Mesh);
            // Each manifold becomes a child
            expect(result.getChildMeshes().length).toBe(2);
        });

        it("should filter out undefined meshes", async () => {
            (mockManifoldWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue([
                { vertProperties: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]), triVerts: new Uint32Array([0, 1, 2]), numProp: 3 },
                { vertProperties: new Float32Array([]), triVerts: new Uint32Array([]), numProp: 3 } // This will be filtered out
            ]);

            const inputs = new Inputs.Manifold.DrawManifoldsOrCrossSectionsDto<Inputs.Manifold.ManifoldPointer | Inputs.Manifold.CrossSectionPointer, BABYLON.PBRMetallicRoughnessMaterial>();
            inputs.manifoldsOrCrossSections = [
                { hash: 123, type: "manifold" },
                { hash: 456, type: "manifold" }
            ] as any[];
            inputs.faceColour = "#ff0000";
            inputs.drawTwoSided = false;

            const result = await drawHelper.drawManifoldsOrCrossSections(inputs);

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(BABYLON.Mesh);
            // Only one valid manifold should be a child
            expect(result.getChildMeshes().length).toBe(1);
        });
    });

    // ===== PHASE 8: Infrastructure and Edge Case Tests =====

    describe("Worker validation", () => {
        it("should call JSCAD worker with correct parameters", async () => {
            const mockMesh = { type: "solid", polygons: [] };

            (mockJscadWorkerManager.genericCallToWorkerPromise as jest.Mock).mockClear();
            (mockJscadWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue({
                positions: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                normals: [0, 0, 1, 0, 0, 1, 0, 0, 1],
                indices: [0, 1, 2],
                transforms: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
            });

            const inputs = new Inputs.JSCAD.DrawSolidMeshDto<BABYLON.Mesh>(
                mockMesh,
                1,
                "#ff0000",
                false,
                false,
                undefined,
                false
            );

            await drawHelper.drawSolidOrPolygonMesh(inputs);

            expect(mockJscadWorkerManager.genericCallToWorkerPromise).toHaveBeenCalled();
            const callArgs = (mockJscadWorkerManager.genericCallToWorkerPromise as jest.Mock).mock.calls[0];
            expect(callArgs[1]).toMatchObject({
                mesh: mockMesh
            });
        });

        it("should call OCCT worker with correct parameters", async () => {
            (mockOccWorkerManager.genericCallToWorkerPromise as jest.Mock).mockClear();
            (mockOccWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue({
                faceList: [{
                    vertex_coord: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                    normal_coord: [0, 0, 1, 0, 0, 1, 0, 0, 1],
                    tri_indexes: [0, 1, 2]
                }],
                edgeList: [],
                pointsList: []
            });

            const inputs = new Inputs.OCCT.DrawShapeDto();
            inputs.shape = { hash: "abc123", type: "solid" } as any;
            inputs.drawFaces = true;
            inputs.drawTwoSided = false;

            await drawHelper.drawShape(inputs as Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>);

            expect(mockOccWorkerManager.genericCallToWorkerPromise).toHaveBeenCalledWith(
                "shapeToMesh",
                expect.objectContaining({
                    shape: inputs.shape
                })
            );
        });

        it("should call Manifold worker with correct parameters", async () => {
            (mockManifoldWorkerManager.genericCallToWorkerPromise as jest.Mock).mockClear();
            (mockManifoldWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue({
                vertProperties: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]),
                triVerts: new Uint32Array([0, 1, 2]),
                numProp: 3
            });

            const inputs = new Inputs.Manifold.DrawManifoldOrCrossSectionDto<Inputs.Manifold.ManifoldPointer, BABYLON.PBRMetallicRoughnessMaterial>();
            inputs.manifoldOrCrossSection = { hash: 123, type: "manifold" } as any;
            inputs.drawTwoSided = false;

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
        it("should cache and reuse materials with same properties", async () => {
            // Use JSCAD meshes which go through the material cache
            (mockJscadWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue({
                positions: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                normals: [0, 0, 1, 0, 0, 1, 0, 0, 1],
                indices: [0, 1, 2],
                transforms: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
            });

            const inputs1 = new Inputs.JSCAD.DrawSolidMeshDto<BABYLON.Mesh>(
                { type: "solid" },
                1,
                "#ff0000",
                false,
                false,
                undefined,
                false
            );
            const inputs2 = new Inputs.JSCAD.DrawSolidMeshDto<BABYLON.Mesh>(
                { type: "solid" },
                1,
                "#ff0000", // Same color
                false,
                false,
                undefined,
                false
            );

            await drawHelper.drawSolidOrPolygonMesh(inputs1);
            const cacheSize1 = drawHelper["materialCache"].size;

            await drawHelper.drawSolidOrPolygonMesh(inputs2);
            const cacheSize2 = drawHelper["materialCache"].size;

            // Same material should be reused
            expect(cacheSize2).toBe(cacheSize1);
        });

        it("should create new material for different colors", async () => {
            (mockJscadWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue({
                positions: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                normals: [0, 0, 1, 0, 0, 1, 0, 0, 1],
                indices: [0, 1, 2],
                transforms: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
            });

            const inputs1 = new Inputs.JSCAD.DrawSolidMeshDto<BABYLON.Mesh>(
                { type: "solid" },
                1,
                "#ff0000",
                false,
                false,
                undefined,
                false
            );
            const inputs2 = new Inputs.JSCAD.DrawSolidMeshDto<BABYLON.Mesh>(
                { type: "solid" },
                1,
                "#00ff00", // Different color
                false,
                false,
                undefined,
                false
            );

            await drawHelper.drawSolidOrPolygonMesh(inputs1);
            await drawHelper.drawSolidOrPolygonMesh(inputs2);

            const cacheSize = drawHelper["materialCache"].size;
            expect(cacheSize).toBe(2);
        });

        it("should create new material for different opacity", async () => {
            (mockJscadWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue({
                positions: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                normals: [0, 0, 1, 0, 0, 1, 0, 0, 1],
                indices: [0, 1, 2],
                transforms: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
            });

            const inputs1 = new Inputs.JSCAD.DrawSolidMeshDto<BABYLON.Mesh>(
                { type: "solid" },
                1.0,
                "#ff0000",
                false,
                false,
                undefined,
                false
            );
            const inputs2 = new Inputs.JSCAD.DrawSolidMeshDto<BABYLON.Mesh>(
                { type: "solid" },
                0.5, // Different opacity
                "#ff0000",
                false,
                false,
                undefined,
                false
            );

            await drawHelper.drawSolidOrPolygonMesh(inputs1);
            await drawHelper.drawSolidOrPolygonMesh(inputs2);

            const cacheSize = drawHelper["materialCache"].size;
            expect(cacheSize).toBe(2);
        });

        it("should not exceed cache limit", async () => {
            const CACHE_LIMIT = 100;

            (mockJscadWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue({
                positions: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                normals: [0, 0, 1, 0, 0, 1, 0, 0, 1],
                indices: [0, 1, 2],
                transforms: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
            });

            for (let i = 0; i < CACHE_LIMIT + 10; i++) {
                const colorHex = `#${i.toString(16).padStart(6, "0")}`;
                const inputs = new Inputs.JSCAD.DrawSolidMeshDto<BABYLON.Mesh>(
                    { type: "solid" },
                    1,
                    colorHex,
                    false,
                    false,
                    undefined,
                    false
                );
                await drawHelper.drawSolidOrPolygonMesh(inputs);
            }

            const cacheSize = drawHelper["materialCache"].size;
            expect(cacheSize).toBeLessThanOrEqual(CACHE_LIMIT);
        });
    });

    describe("Memory management", () => {
        it("should update points in place without creating new meshes", () => {
            const inputs1 = new Inputs.Point.DrawPointDto<BABYLON.Mesh>(
                [1, 2, 3],
                1,
                1,
                "#ff0000",
                true
            );

            const result1 = drawHelper.drawPoint(inputs1);
            const childCount1 = result1.getChildMeshes().length;

            const inputs2 = new Inputs.Point.DrawPointDto<BABYLON.Mesh>(
                [4, 5, 6],
                1,
                1,
                "#ff0000",
                true,
                result1
            );

            const result2 = drawHelper.drawPoint(inputs2);
            const childCount2 = result2.getChildMeshes().length;

            expect(result2).toBe(result1);
            expect(childCount2).toBe(childCount1);
        });

        it("should handle cleanup on dispose", () => {
            // Create meshes to populate cache
            for (let i = 0; i < 50; i++) {
                const inputs = new Inputs.Point.DrawPointDto<BABYLON.Mesh>(
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

        it("should not leak polyline meshes on update", () => {
            const polylines1 = [{ points: [[0, 0, 0], [1, 1, 1]] as Inputs.Base.Point3[] }];
            const inputs1 = new Inputs.Polyline.DrawPolylinesDto<BABYLON.GreasedLineMesh>(
                polylines1 as Inputs.Base.Polyline3[],
                2,
                ["#ff0000"],
                1,
                true,
                undefined
            );

            const result1 = drawHelper.drawPolylinesWithColours(inputs1);

            const polylines2 = [{ points: [[2, 2, 2], [3, 3, 3]] as Inputs.Base.Point3[] }];
            const inputs2 = new Inputs.Polyline.DrawPolylinesDto<BABYLON.GreasedLineMesh>(
                polylines2 as Inputs.Base.Polyline3[],
                2,
                ["#ff0000"],
                1,
                true,
                result1
            );

            const result2 = drawHelper.drawPolylinesWithColours(inputs2);

            expect(result2).toBeDefined();
        });
    });

    describe("Edge cases and input validation", () => {
        it("should handle empty points array", () => {
            const inputs = new Inputs.Point.DrawPointsDto<BABYLON.Mesh>(
                [],
                1,
                1,
                "#ff0000",
                false
            );

            const result = drawHelper.drawPoints(inputs);

            expect(result).toBeDefined();
            expect(result.getChildMeshes().length).toBe(0);
        });

        it("should handle single point in points array", () => {
            const inputs = new Inputs.Point.DrawPointsDto<BABYLON.Mesh>(
                [[1, 2, 3]],
                1,
                1,
                "#ff0000",
                false
            );

            const result = drawHelper.drawPoints(inputs);

            expect(result).toBeDefined();
            expect(result.getChildMeshes().length).toBeGreaterThan(0);
        });

        it("should handle empty polyline", () => {
            const inputs = new Inputs.Polyline.DrawPolylineDto<BABYLON.GreasedLineMesh>(
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
            const inputs = new Inputs.Point.DrawPointsDto<BABYLON.Mesh>(
                [[1, 2, 3], [4, 5, 6], [7, 8, 9]],
                1,
                1,
                ["#ff0000"],
                false
            );

            const result = drawHelper.drawPoints(inputs);

            expect(result).toBeDefined();
            expect(result.getChildMeshes().length).toBeGreaterThan(0);
        });

        it("should handle negative opacity values", () => {
            const inputs = new Inputs.Point.DrawPointDto<BABYLON.Mesh>(
                [1, 2, 3],
                -0.5,
                1,
                "#ff0000",
                false
            );

            const result = drawHelper.drawPoint(inputs);

            expect(result).toBeDefined();
        });

        it("should handle opacity greater than 1", () => {
            const inputs = new Inputs.Point.DrawPointDto<BABYLON.Mesh>(
                [1, 2, 3],
                2.0,
                1,
                "#ff0000",
                false
            );

            const result = drawHelper.drawPoint(inputs);

            expect(result).toBeDefined();
        });

        it("should handle zero size", () => {
            const inputs = new Inputs.Point.DrawPointDto<BABYLON.Mesh>(
                [1, 2, 3],
                1,
                0,
                "#ff0000",
                false
            );

            const result = drawHelper.drawPoint(inputs);

            expect(result).toBeDefined();
        });

        it("should handle negative size", () => {
            const inputs = new Inputs.Point.DrawPointDto<BABYLON.Mesh>(
                [1, 2, 3],
                1,
                -5,
                "#ff0000",
                false
            );

            const result = drawHelper.drawPoint(inputs);

            expect(result).toBeDefined();
        });
    });

    describe("Visual property validation", () => {
        it("should create point mesh with expected structure", () => {
            const inputs = new Inputs.Point.DrawPointDto<BABYLON.Mesh>(
                [1, 2, 3],
                1,
                1,
                "#ff0000",
                false
            );
            const result = drawHelper.drawPoint(inputs);

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(BABYLON.Mesh);
            expect(result.getChildMeshes().length).toBeGreaterThan(0);
        });

        it("should create points with color array", () => {
            const inputs = new Inputs.Point.DrawPointsDto<BABYLON.Mesh>(
                [[1, 2, 3]],
                1,
                1,
                ["#0000ff"],
                false
            );
            const result = drawHelper.drawPoints(inputs);

            expect(result).toBeDefined();
            expect(result.getChildMeshes().length).toBeGreaterThan(0);
        });

        it("should accept opacity parameter", () => {
            const inputs = new Inputs.Point.DrawPointDto<BABYLON.Mesh>(
                [1, 2, 3],
                0.5,
                1,
                "#0000ff",
                false
            );
            const result = drawHelper.drawPoint(inputs);

            expect(result).toBeDefined();
        });

        it("should handle multiple colors for multiple points", () => {
            const inputs = new Inputs.Point.DrawPointsDto<BABYLON.Mesh>(
                [[1, 2, 3], [4, 5, 6]],
                1,
                1,
                ["#ff0000", "#00ff00"],
                false
            );
            const result = drawHelper.drawPoints(inputs);

            expect(result.getChildMeshes().length).toBeGreaterThanOrEqual(2);
        });
    });

    describe("Performance benchmarking", () => {
        it("should draw 100 points in reasonable time", () => {
            const points = Array.from({ length: 100 }, (_, i) => [i, i, i]) as Inputs.Base.Point3[];
            const inputs = new Inputs.Point.DrawPointsDto<BABYLON.Mesh>(
                points,
                1,
                1,
                "#ff0000",
                false
            );

            const startTime = performance.now();
            const result = drawHelper.drawPoints(inputs);
            const endTime = performance.now();

            expect(result).toBeDefined();
            expect(result.getChildMeshes().length).toBe(100);

            const executionTime = endTime - startTime;
            expect(executionTime).toBeLessThan(500);
        });

        it("should draw 1000 points with optimized LOD in reasonable time", () => {
            const points = Array.from({ length: 1000 }, (_, i) => [
                Math.random() * 100,
                Math.random() * 100,
                Math.random() * 100
            ]) as Inputs.Base.Point3[];
            const inputs = new Inputs.Point.DrawPointsDto<BABYLON.Mesh>(
                points,
                1,
                1,
                "#ff0000",
                false
            );

            const startTime = performance.now();
            const result = drawHelper.drawPoints(inputs);
            const endTime = performance.now();

            expect(result).toBeDefined();
            expect(result.getChildMeshes().length).toBe(1000);

            const executionTime = endTime - startTime;
            expect(executionTime).toBeLessThan(2000);
        });

        it("should handle rapid updates without performance degradation", () => {
            const options = new Inputs.Point.DrawPointDto<BABYLON.Mesh>(
                [1, 2, 3],
                1,
                1,
                "#ff0000",
                true
            );

            let result = drawHelper.drawPoint(options);
            const times: number[] = [];

            for (let i = 0; i < 50; i++) {
                const startTime = performance.now();
                options.point = [i, i * 2, i * 3];
                options.pointMesh = result;
                result = drawHelper.drawPoint(options);
                const endTime = performance.now();
                times.push(endTime - startTime);
            }

            const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
            const lastFiveAvg = times.slice(-5).reduce((a, b) => a + b, 0) / 5;

            expect(lastFiveAvg).toBeLessThan(avgTime * 2);
        });

        it("should efficiently cache materials across multiple draws", () => {
            const color = "#ff0000";
            const drawCount = 50;

            const startTime = performance.now();
            for (let i = 0; i < drawCount; i++) {
                const inputs = new Inputs.Point.DrawPointDto<BABYLON.Mesh>(
                    [i, 0, 0],
                    1,
                    1,
                    color,
                    false
                );
                drawHelper.drawPoint(inputs);
            }
            const endTime = performance.now();

            const executionTime = endTime - startTime;
            expect(executionTime).toBeLessThan(200);
        });
    });
});
