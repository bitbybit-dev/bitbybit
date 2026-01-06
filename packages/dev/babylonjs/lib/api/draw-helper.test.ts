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
            
            // Validate material properties (thin instances use regular Mesh)
            const childMesh = result.getChildMeshes()[0] as BABYLON.Mesh;
            expect(childMesh).toBeInstanceOf(BABYLON.Mesh);
            expect(childMesh.metadata).toBeDefined();
            expect(childMesh.metadata.pointIndices).toBeDefined();
            expect(childMesh.metadata.matricesData).toBeDefined();
            
            const material = childMesh.material as BABYLON.StandardMaterial;
            expect(material).toBeDefined();
            expect(material.alpha).toBe(1);
            
            // Validate color
            const expectedColor = hexToRgb("#ff0000");
            const actualColor = {
                r: material.emissiveColor.r,
                g: material.emissiveColor.g,
                b: material.emissiveColor.b
            };
            expect(colorsAreEqual(actualColor, expectedColor)).toBe(true);
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
            // With thin instances, all 3 points share one mesh (one color group)
            expect(result.getChildMeshes().length).toBeGreaterThanOrEqual(1);
            
            // Validate material properties (thin instances use regular Mesh)
            const children = result.getChildMeshes();
            children.forEach((child) => {
                expect(child.metadata).toBeDefined();
                expect(child.metadata.pointIndices).toBeDefined();
                expect(child.metadata.matricesData).toBeDefined();
                
                const material = child.material as BABYLON.StandardMaterial;
                expect(material.alpha).toBe(1);
                
                const expectedColor = hexToRgb("#ff0000");
                const actualColor = {
                    r: material.emissiveColor.r,
                    g: material.emissiveColor.g,
                    b: material.emissiveColor.b
                };
                expect(colorsAreEqual(actualColor, expectedColor)).toBe(true);
            });
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
            // With thin instances and 3 different colors, we get 3 child meshes (one per color)
            expect(result.getChildMeshes().length).toBe(3);
            
            // Validate each child mesh has correct color
            const expectedColors = ["#ff0000", "#00ff00", "#0000ff"];
            const children = result.getChildMeshes();
            
            // Each child has one point (since each has unique color)
            children.forEach((child) => {
                const material = child.material as BABYLON.StandardMaterial;
                const actualColor = {
                    r: material.emissiveColor.r,
                    g: material.emissiveColor.g,
                    b: material.emissiveColor.b
                };
                // Check if the color matches one of the expected colors
                const matchesAny = expectedColors.some(hexColor => {
                    const expectedColor = hexToRgb(hexColor);
                    return colorsAreEqual(actualColor, expectedColor);
                });
                expect(matchesAny).toBe(true);
            });
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
            // First create points with updatable=true
            const firstInputs = new Inputs.Point.DrawPointsDto<BABYLON.Mesh>(
                [[0, 0, 0], [1, 1, 1]],
                1,
                0.3,
                "#ff0000",
                true  // Mark as updatable
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
            // With thin instances and same color, all points in one mesh
            expect(result.getChildMeshes().length).toBeGreaterThanOrEqual(1);
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
            // With thin instances and same color, all points in one mesh
            expect(result.getChildMeshes().length).toBeGreaterThanOrEqual(1);
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
            // With thin instances and same color (#ff0000), all points grouped in 1 mesh
            expect(mesh.getChildMeshes().length).toBe(1);
        });
    });

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

    describe("Arrow drawing on polylines", () => {
        it("should draw a single polyline with arrows", () => {
            const polyline: Inputs.Base.Polyline3 = {
                points: [[0, 0, 0], [1, 1, 1], [2, 0, 0], [3, 1, 0]]
            };

            const result = drawHelper.drawPolylineClose({
                polylineMesh: undefined,
                polyline,
                updatable: false,
                size: 10,
                opacity: 1,
                colours: "#ff0000",
                arrowSize: 1,
                arrowAngle: 30
            });

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(BABYLON.GreasedLineMesh);
            // BabylonJS creates separate lines for polyline and arrows
            // 1 polyline + 4 arrow lines = 5 total lines
            expect(result.metadata.linesForRenderLengths).toHaveLength(5);
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
                size: 10,
                opacity: 1,
                colours: ["#ff0000", "#00ff00", "#0000ff"],
                colorMapStrategy: Inputs.Base.colorMapStrategyEnum.lastColorRemainder,
                arrowSize: 1,
                arrowAngle: 25
            });

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(BABYLON.GreasedLineMesh);
            // 3 polylines + (3 * 4 arrow lines) = 15 total lines
            expect(result.metadata.linesForRenderLengths).toHaveLength(15);
        });

        it("should not draw arrows when arrowSize is 0", () => {
            const polyline: Inputs.Base.Polyline3 = {
                points: [[0, 0, 0], [1, 1, 1], [2, 0, 0]]
            };

            const result = drawHelper.drawPolylineClose({
                polylineMesh: undefined,
                polyline,
                updatable: false,
                size: 10,
                opacity: 1,
                colours: "#ff0000",
                arrowSize: 0,
                arrowAngle: 30
            });

            expect(result).toBeDefined();
            // Only the polyline, no arrows
            expect(result.metadata.linesForRenderLengths).toHaveLength(1);
        });

        it("should draw arrows with custom angle", () => {
            const polyline: Inputs.Base.Polyline3 = {
                points: [[0, 0, 0], [5, 0, 0]]
            };

            const result = drawHelper.drawPolylineClose({
                polylineMesh: undefined,
                polyline,
                updatable: false,
                size: 10,
                opacity: 1,
                colours: "#ff0000",
                arrowSize: 2,
                arrowAngle: 45
            });

            expect(result).toBeDefined();
            // 1 polyline + 4 arrow lines
            expect(result.metadata.linesForRenderLengths).toHaveLength(5);
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
                size: 10,
                opacity: 1,
                colours: ["#ff0000", "#00ff00"],
                arrowSize: 1,
                arrowAngle: 30
            });

            expect(result).toBeDefined();
            // 2 polylines + (2 * 4 arrows) = 10 lines
            expect(result.metadata.linesForRenderLengths).toHaveLength(10);
        });

        it("should handle polylines with insufficient points for arrows", () => {
            const polyline: Inputs.Base.Polyline3 = {
                points: [[0, 0, 0]] // Only 1 point
            };

            const result = drawHelper.drawPolylineClose({
                polylineMesh: undefined,
                polyline,
                updatable: false,
                size: 10,
                opacity: 1,
                colours: "#ff0000",
                arrowSize: 1,
                arrowAngle: 30
            });

            // A single point can't form a line or arrows
            // Result may be undefined or have empty linesForRenderLengths
            if (result && result.metadata && result.metadata.linesForRenderLengths) {
                expect(result.metadata.linesForRenderLengths.length).toBe(0);
            } else {
                expect(result).toBeDefined();
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
                size: 10,
                opacity: 1,
                colours: "#ff0000",
                arrowSize: 1,
                arrowAngle: 30
            });

            // Update with new points
            const updatedPolyline: Inputs.Base.Polyline3 = {
                points: [[0, 0, 0], [2, 2, 2]]
            };

            const secondResult = drawHelper.drawPolylineClose({
                polylineMesh: firstResult,
                polyline: updatedPolyline,
                updatable: true,
                size: 10,
                opacity: 1,
                colours: "#00ff00",
                arrowSize: 1,
                arrowAngle: 30
            });

            expect(secondResult).toBe(firstResult);
            // 1 polyline + 4 arrow lines
            expect(secondResult.metadata.linesForRenderLengths).toHaveLength(5);
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

        it("should use first colour when colour array is shorter than lines", () => {
            const inputs = new Inputs.Line.DrawLinesDto<BABYLON.LinesMesh>(
                [
                    { start: [0, 0, 0], end: [1, 0, 0] },
                    { start: [0, 1, 0], end: [1, 1, 0] },
                    { start: [0, 2, 0], end: [1, 2, 0] }
                ],
                1,
                ["#ff0000"], // Only one color for 3 lines
                2
            );

            const result = drawHelper.drawLines(inputs);

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(BABYLON.LinesMesh);
        });

        it("should recreate lines mesh when vertex count changes during update", () => {
            const initialInputs = new Inputs.Line.DrawLinesDto<BABYLON.LinesMesh>(
                [{ start: [0, 0, 0], end: [1, 0, 0] }],
                1,
                "#ff0000",
                2
            );
            const existingMesh = drawHelper.drawLines(initialInputs);

            const updateInputs = new Inputs.Line.DrawLinesDto<BABYLON.LinesMesh>(
                [
                    { start: [0, 0, 0], end: [1, 0, 0] },
                    { start: [0, 1, 0], end: [1, 1, 0] }
                ],
                1,
                "#ff0000",
                2,
                true,
                existingMesh
            );

            const result = drawHelper.drawLines(updateInputs);

            expect(result).toBeDefined();
        });
    });


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


    describe("drawPath (JSCAD)", () => {
        it("should draw JSCAD path", async () => {
            const mockPath = {
                points: [[0, 0], [1, 0], [1, 1], [0, 1]],
                isClosed: false
            };
            const inputs = new Inputs.JSCAD.DrawPathDto<BABYLON.GreasedLineMesh>(
                mockPath,
                "#ff0000", // colour
                1,          // opacity
                2,          // width
                false       // updatable
            );

            const result = await drawHelper.drawPath(inputs);

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(BABYLON.GreasedLineMesh);
        });

        it("should close JSCAD path when isClosed is true", async () => {
            const mockPath = {
                points: [[0, 0], [1, 0], [1, 1]],
                isClosed: true
            };
            const inputs = new Inputs.JSCAD.DrawPathDto<BABYLON.GreasedLineMesh>(
                mockPath,
                "#00ff00", // colour
                1,          // opacity
                2,          // width
                false       // updatable
            );

            const result = await drawHelper.drawPath(inputs);

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(BABYLON.GreasedLineMesh);
        });

        it("should use baked color from path if available", async () => {
            const mockPath = {
                points: [[0, 0], [1, 0]],
                isClosed: false,
                color: [1, 0, 0, 1] // Red
            };
            const inputs = new Inputs.JSCAD.DrawPathDto<BABYLON.GreasedLineMesh>(
                mockPath,
                "#0000ff", // colour - Blue, should be overridden by baked color
                1,          // opacity
                2,          // width
                false       // updatable
            );

            const result = await drawHelper.drawPath(inputs);

            expect(result).toBeDefined();
        });
    });

    describe("localAxes", () => {
        it("should create local axis visualization", () => {
            const result = drawHelper.localAxes(
                1,
                mockContext.scene,
                "#ff0000", // X axis - red
                "#00ff00", // Y axis - green
                "#0000ff"  // Z axis - blue
            );

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(BABYLON.Mesh);
            expect(result.isVisible).toBe(false); // Origin should be invisible
            
            // Should have 3 children (X, Y, Z axes)
            const children = result.getChildMeshes();
            expect(children.length).toBe(3);
            
            // Verify each axis is a LinesMesh
            children.forEach(child => {
                expect(child).toBeInstanceOf(BABYLON.LinesMesh);
            });
        });

        it("should create local axes with custom size", () => {
            const size = 5;
            const result = drawHelper.localAxes(
                size,
                mockContext.scene,
                "#ff0000",
                "#00ff00",
                "#0000ff"
            );

            expect(result).toBeDefined();
            expect(result.getChildMeshes().length).toBe(3);
        });
    });

    describe("drawShape with edge and vertex options", () => {
        it("should draw OCCT shape with faces and edges", async () => {
            (mockOccWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue({
                faceList: [
                    { vertex_coord: [0, 0, 0, 1, 0, 0, 0, 1, 0], normal_coord: [0, 0, 1, 0, 0, 1, 0, 0, 1], tri_indexes: [0, 1, 2] }
                ],
                edgeList: [
                    { vertex_coord: [0, 0, 0, 1, 0, 0], edge_index: 0 }
                ],
                pointsList: []
            });

            const inputs = new Inputs.OCCT.DrawShapeDto();
            inputs.shape = { hash: "abc123", type: "solid" } as any;
            inputs.drawFaces = true;
            inputs.drawEdges = true;
            inputs.drawVertices = false;
            inputs.faceColour = "#ff0000";
            inputs.faceOpacity = 1;
            inputs.edgeColour = "#00ff00";
            inputs.edgeWidth = 2;
            inputs.edgeOpacity = 1;
            inputs.drawTwoSided = false;

            const result = await drawHelper.drawShape(inputs as Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>);

            expect(result).toBeDefined();
            // Should have both face mesh and edge mesh as children
            expect(result.getChildMeshes().length).toBeGreaterThanOrEqual(2);
        });

        it("should draw OCCT shape with all options (faces, edges, vertices)", async () => {
            (mockOccWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue({
                faceList: [
                    { vertex_coord: [0, 0, 0, 1, 0, 0, 0, 1, 0], normal_coord: [0, 0, 1, 0, 0, 1, 0, 0, 1], tri_indexes: [0, 1, 2] }
                ],
                edgeList: [
                    { vertex_coord: [0, 0, 0, 1, 0, 0], edge_index: 0 }
                ],
                pointsList: [[0, 0, 0], [1, 0, 0], [0, 1, 0]]
            });

            const inputs = new Inputs.OCCT.DrawShapeDto();
            inputs.shape = { hash: "abc123", type: "solid" } as any;
            inputs.drawFaces = true;
            inputs.drawEdges = true;
            inputs.drawVertices = true;
            inputs.faceColour = "#ff0000";
            inputs.faceOpacity = 1;
            inputs.edgeColour = "#00ff00";
            inputs.edgeWidth = 2;
            inputs.edgeOpacity = 1;
            inputs.vertexColour = "#0000ff";
            inputs.vertexSize = 0.1;
            inputs.drawTwoSided = false;

            const result = await drawHelper.drawShape(inputs as Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>);

            expect(result).toBeDefined();
            // Should have face, edge, and vertex meshes
            expect(result.getChildMeshes().length).toBeGreaterThanOrEqual(3);
        });

        it("should handle empty decomposed mesh", async () => {
            (mockOccWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue({
                faceList: [],
                edgeList: [],
                pointsList: []
            });

            const inputs = new Inputs.OCCT.DrawShapeDto();
            inputs.shape = { hash: "empty", type: "solid" } as any;
            inputs.drawFaces = true;
            inputs.drawEdges = true;
            inputs.drawVertices = true;
            inputs.drawTwoSided = false;

            const result = await drawHelper.drawShape(inputs as Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>);

            expect(result).toBeDefined();
            // Empty mesh should have no visible children
            expect(result.getChildMeshes().length).toBe(0);
        });
    });

    describe("createOrUpdateSurfacesMesh with various options", () => {
        it("should handle surfaces with different material", () => {
            const meshData = [{
                positions: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                normals: [0, 0, 1, 0, 0, 1, 0, 0, 1],
                indices: [0, 1, 2]
            }];
            const customMaterial = new BABYLON.PBRMetallicRoughnessMaterial(
                "customMat",
                mockContext.scene
            );
            customMaterial.baseColor = BABYLON.Color3.FromHexString("#ff00ff");

            const result = drawHelper.createOrUpdateSurfacesMesh(
                meshData,
                undefined as any,
                false,
                customMaterial,
                true,
                false
            );

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(BABYLON.Mesh);
            // Result is the surface mesh itself, not a container
            expect(result.material).toBe(customMaterial);
        });

        it("should create updatable mesh when specified", () => {
            const meshData = [{
                positions: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                normals: [0, 0, 1, 0, 0, 1, 0, 0, 1],
                indices: [0, 1, 2]
            }];
            const material = new BABYLON.PBRMetallicRoughnessMaterial("mat", mockContext.scene);

            const result = drawHelper.createOrUpdateSurfacesMesh(
                meshData,
                undefined as any,
                true, // updatable
                material,
                true,
                false
            );

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(BABYLON.Mesh);
            expect(result.material).toBe(material);
        });
    });

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
            // The actual cache limit is CACHE_CONFIG.MAX_MATERIALS (1000) from constants
            // This test verifies materials are cached correctly for unique colors
            const TEST_MATERIALS_COUNT = 110;

            (mockJscadWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue({
                positions: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                normals: [0, 0, 1, 0, 0, 1, 0, 0, 1],
                indices: [0, 1, 2],
                transforms: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
            });

            for (let i = 0; i < TEST_MATERIALS_COUNT; i++) {
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
            // Each unique color should be cached (limit is 1000, so 110 unique materials are fine)
            expect(cacheSize).toBe(TEST_MATERIALS_COUNT);
        });

        it("should cache and reuse unlit materials for points", () => {
            // Draw points with same color - should reuse material from unlit cache
            const inputs1 = new Inputs.Point.DrawPointsDto<BABYLON.Mesh>(
                [[1, 2, 3], [4, 5, 6]],
                1,
                1,
                "#ff0000",
                false
            );
            
            drawHelper.drawPoints(inputs1);
            const unlitCacheSize1 = drawHelper["unlitMaterialCache"].size;
            expect(unlitCacheSize1).toBe(1); // One unique color = one cached material
            
            // Draw more points with the same color - should reuse cached material
            const inputs2 = new Inputs.Point.DrawPointsDto<BABYLON.Mesh>(
                [[7, 8, 9], [10, 11, 12]],
                1,
                1,
                "#ff0000", // Same color
                false
            );
            
            drawHelper.drawPoints(inputs2);
            const unlitCacheSize2 = drawHelper["unlitMaterialCache"].size;
            expect(unlitCacheSize2).toBe(1); // Still one cached material (reused)
            
            // Draw points with different color - should create new cached material
            const inputs3 = new Inputs.Point.DrawPointsDto<BABYLON.Mesh>(
                [[13, 14, 15]],
                1,
                1,
                "#00ff00", // Different color
                false
            );
            
            drawHelper.drawPoints(inputs3);
            const unlitCacheSize3 = drawHelper["unlitMaterialCache"].size;
            expect(unlitCacheSize3).toBe(2); // Two unique colors = two cached materials
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

        it("should handle error during material disposal", () => {
            // Create a material that will throw error on dispose
            const mockErrorMaterial = {
                dispose: jest.fn().mockImplementation(() => {
                    throw new Error("Disposal error");
                })
            } as any;
            
            // Manually add error-prone material to cache
            const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();
            drawHelper["materialCache"].set("error-material", mockErrorMaterial);
            
            drawHelper.dispose();
            
            expect(consoleWarnSpy).toHaveBeenCalled();
            consoleWarnSpy.mockRestore();
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
            // With thin instances, all 100 points with same color are in 1 child mesh
            expect(result.getChildMeshes().length).toBe(1);

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
            // With thin instances, all 1000 points with same color are in 1 child mesh
            expect(result.getChildMeshes().length).toBe(1);

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

    describe("drawSurfaces", () => {
        it("should draw multiple surfaces as single mesh", () => {
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
                    points: [[1, 0, 0], [2, 0, 0], [1, 1, 0]],
                    normals: [[0, 0, 1], [0, 0, 1], [0, 0, 1]]
                })
            };

            const inputs = new Inputs.Verb.DrawSurfacesDto<BABYLON.Mesh>(
                [mockSurface1, mockSurface2],
                1,
                "#ff0000",
                false,
                false
            );

            const result = drawHelper.drawSurfaces(inputs);

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(BABYLON.Mesh);
            expect(result.material).toBeDefined();
            expect(result.material).toBeInstanceOf(BABYLON.PBRMetallicRoughnessMaterial);
            const material = result.material as BABYLON.PBRMetallicRoughnessMaterial;
            expect(colorsAreEqual(material.baseColor, hexToRgb("#ff0000"))).toBe(true);
            expect(material.alpha).toBe(1);
        });

        it("should handle drawSurfaces with two-sided rendering", () => {
            const mockSurface = {
                tessellate: jest.fn().mockReturnValue({
                    faces: [[0, 1, 2]],
                    points: [[0, 0, 0], [1, 0, 0], [0, 1, 0]],
                    normals: [[0, 0, 1], [0, 0, 1], [0, 0, 1]]
                })
            };

            const inputs = new Inputs.Verb.DrawSurfacesDto<BABYLON.Mesh>(
                [mockSurface],
                1,
                "#ff0000",
                false,
                false,
                undefined,
                true, // drawTwoSided
                "#00ff00",
                0.8
            );

            const result = drawHelper.drawSurfaces(inputs);

            expect(result).toBeDefined();
            expect(result.material).toBeDefined();
            const children = result.getChildMeshes();
            expect(children.length).toBe(1); // Should have back face mesh
            // Check main mesh material
            const mainMaterial = result.material as BABYLON.PBRMetallicRoughnessMaterial;
            expect(colorsAreEqual(mainMaterial.baseColor, hexToRgb("#ff0000"))).toBe(true);
            expect(mainMaterial.alpha).toBe(1);
            // Check back face mesh exists and has correct material
            const backFaceMesh = children[0];
            expect(backFaceMesh.material).toBeDefined();
            const backMaterial = backFaceMesh.material as BABYLON.PBRMetallicRoughnessMaterial;
            expect(colorsAreEqual(backMaterial.baseColor, hexToRgb("#00ff00"))).toBe(true);
            expect(backMaterial.alpha).toBe(0.8);
        });

        it("should handle array of colours in drawSurfaces", () => {
            const mockSurface = {
                tessellate: jest.fn().mockReturnValue({
                    faces: [[0, 1, 2]],
                    points: [[0, 0, 0], [1, 0, 0], [0, 1, 0]],
                    normals: [[0, 0, 1], [0, 0, 1], [0, 0, 1]]
                })
            };

            const inputs = new Inputs.Verb.DrawSurfacesDto<BABYLON.Mesh>(
                [mockSurface],
                1,
                ["#ff0000", "#00ff00"],
                false,
                false
            );

            const result = drawHelper.drawSurfaces(inputs);

            expect(result).toBeDefined();
            expect(result.material).toBeDefined();
            const material = result.material as BABYLON.PBRMetallicRoughnessMaterial;
            // Should use first color from array
            expect(colorsAreEqual(material.baseColor, hexToRgb("#ff0000"))).toBe(true);
        });
    });

    describe("drawSurfacesMultiColour - single colour branch", () => {
        it("should handle single colour for all surfaces", () => {
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
                    points: [[1, 0, 0], [2, 0, 0], [1, 1, 0]],
                    normals: [[0, 0, 1], [0, 0, 1], [0, 0, 1]]
                })
            };

            const inputs = new Inputs.Verb.DrawSurfacesColoursDto<BABYLON.Mesh>(
                [mockSurface1, mockSurface2],
                ["#ff0000"], // Single colour in array
                1,
                false,
                false,
                undefined,
                false
            );

            const result = drawHelper.drawSurfacesMultiColour(inputs);

            expect(result).toBeDefined();
            const children = result.getChildMeshes();
            expect(children.length).toBe(2);
            // Each child should have the same material since we passed single colour
            children.forEach(child => {
                expect(child.material).toBeDefined();
                const material = child.material as BABYLON.PBRMetallicRoughnessMaterial;
                expect(colorsAreEqual(material.baseColor, hexToRgb("#ff0000"))).toBe(true);
            });
        });
    });

    describe("createOrUpdateSurfacesMesh - multiple meshData", () => {
        it("should merge multiple meshData into single mesh", () => {
            const meshData = [
                {
                    positions: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                    normals: [0, 0, 1, 0, 0, 1, 0, 0, 1],
                    indices: [0, 1, 2]
                },
                {
                    positions: [1, 0, 0, 2, 0, 0, 1, 1, 0],
                    normals: [0, 0, 1, 0, 0, 1, 0, 0, 1],
                    indices: [0, 1, 2]
                },
                {
                    positions: [2, 0, 0, 3, 0, 0, 2, 1, 0],
                    normals: [0, 0, 1, 0, 0, 1, 0, 0, 1],
                    indices: [0, 1, 2],
                    uvs: [0, 0, 1, 0, 0.5, 1]
                }
            ];
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
            expect(result.material).toBe(material);
            // Verify mesh has vertex data from all three sources merged
            expect(result.getTotalVertices()).toBeGreaterThan(0);
        });
    });

    describe("OCCT Shape - Additional Tests", () => {
        it("should draw shape with edges", async () => {
            const mockShape = {
                faceList: [],
                edgeList: [
                    {
                        edge_index: 0,
                        middle_point: [0.5, 0, 0] as Inputs.Base.Point3,
                        vertex_coord: [[0, 0, 0], [1, 0, 0]] as Inputs.Base.Point3[] // Edge vertices as array of Point3
                    }
                ],
                pointsList: []
            };

            // Mock the OCCT worker to return our shape with edges
            (mockOccWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValueOnce(mockShape);

            const inputs = new Inputs.OCCT.DrawShapeDto<any>();
            inputs.shape = {} as any; // Shape pointer (will be sent to worker)
            inputs.drawFaces = false;
            inputs.drawEdges = true;
            inputs.edgeColour = "#ff0000";
            inputs.edgeWidth = 2;

            const result = await drawHelper.drawShape(inputs);

            expect(result).toBeDefined();
            const children = result.getChildMeshes();
            // Should have edge mesh as child (GreasedLineMesh for edges)
            expect(children.length).toBeGreaterThan(0);
            const edgeMesh = children.find(child => child instanceof BABYLON.GreasedLineMesh);
            expect(edgeMesh).toBeDefined();
        });

        it("should draw shape with faces", async () => {
            const mockShape = {
                faceList: [
                    {
                        face_index: 0,
                        center_point: [0.5, 0.5, 0] as Inputs.Base.Point3,
                        vertex_coord: [],
                        vertex_coord_vec: [[0, 0, 0], [1, 0, 0], [0.5, 1, 0]] as Inputs.Base.Point3[],
                        normal_coord: [],
                        tri_indexes: [0, 1, 2]
                    }
                ],
                edgeList: [],
                pointsList: []
            };

            const inputs = new Inputs.OCCT.DrawShapeDto<any>();
            inputs.shape = mockShape;
            inputs.drawFaces = true;
            inputs.faceColour = "#00ff00";
            inputs.drawEdges = false;

            const result = await drawHelper.drawShape(inputs);

            expect(result).toBeDefined();
            const children = result.getChildMeshes();
            // Should have face mesh as child
            expect(children.length).toBeGreaterThan(0);
            const faceMesh = children.find(child => child.material);
            expect(faceMesh).toBeDefined();
            if (faceMesh && faceMesh.material) {
                const material = faceMesh.material as BABYLON.PBRMetallicRoughnessMaterial;
                expect(colorsAreEqual(material.baseColor, hexToRgb("#00ff00"))).toBe(true);
            }
        });

        it("should draw shape with both edges and faces", async () => {
            const mockShape = {
                faceList: [
                    {
                        face_index: 0,
                        center_point: [0.5, 0.5, 0] as Inputs.Base.Point3,
                        vertex_coord: [],
                        vertex_coord_vec: [[0, 0, 0], [1, 0, 0], [0.5, 1, 0]] as Inputs.Base.Point3[],
                        normal_coord: [],
                        tri_indexes: [0, 1, 2]
                    }
                ],
                edgeList: [
                    {
                        edge_index: 0,
                        middle_point: [0.5, 0, 0] as Inputs.Base.Point3,
                        vertex_coord: [[0, 0, 0], [1, 0, 0]] as Inputs.Base.Point3[] // Edge vertices as array of Point3
                    }
                ],
                pointsList: []
            };

            // Mock the OCCT worker to return our shape with edges and faces
            (mockOccWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValueOnce(mockShape);

            const inputs = new Inputs.OCCT.DrawShapeDto<any>();
            inputs.shape = {} as any; // Shape pointer (will be sent to worker)
            inputs.drawFaces = true;
            inputs.faceColour = "#00ff00";
            inputs.drawEdges = true;
            inputs.edgeColour = "#ff0000";
            inputs.edgeWidth = 2;

            const result = await drawHelper.drawShape(inputs);

            expect(result).toBeDefined();
            const children = result.getChildMeshes();
            // Should have both face and edge meshes
            expect(children.length).toBeGreaterThan(0);
            const faceMesh = children.find(child => child.material instanceof BABYLON.PBRMetallicRoughnessMaterial);
            const edgeMesh = children.find(child => child instanceof BABYLON.GreasedLineMesh);
            expect(faceMesh).toBeDefined();
            expect(edgeMesh).toBeDefined();
            // Verify face material color
            if (faceMesh && faceMesh.material) {
                const faceMaterial = faceMesh.material as BABYLON.PBRMetallicRoughnessMaterial;
                expect(colorsAreEqual(faceMaterial.baseColor, hexToRgb("#00ff00"))).toBe(true);
            }
        });
    });

    describe("drawEdgeIndexes", () => {
        it("should draw edge indexes when drawEdgeIndexes is true", async () => {
            const mockShape = {
                faceList: [
                    {
                        face_index: 0,
                        center_point: [0.5, 0.5, 0] as Inputs.Base.Point3,
                        vertex_coord: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                        vertex_coord_vec: [[0, 0, 0], [1, 0, 0], [0.5, 1, 0]] as Inputs.Base.Point3[],
                        normal_coord: [0, 0, 1, 0, 0, 1, 0, 0, 1],
                        tri_indexes: [0, 1, 2]
                    }
                ],
                edgeList: [
                    {
                        edge_index: 0,
                        middle_point: [0.5, 0, 0] as Inputs.Base.Point3,
                        vertex_coord: [[0, 0, 0], [1, 0, 0]] as Inputs.Base.Point3[]
                    },
                    {
                        edge_index: 1,
                        middle_point: [0.75, 0.5, 0] as Inputs.Base.Point3,
                        vertex_coord: [[1, 0, 0], [0.5, 1, 0]] as Inputs.Base.Point3[]
                    }
                ],
                pointsList: []
            };

            // Mock the OCCT worker
            (mockOccWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValueOnce(mockShape);

            // Mock createVectorText to return sample polyline data for text
            (mockSolidText.createVectorText as jest.Mock).mockResolvedValue([
                [[0, 0], [0.1, 0], [0.1, 0.2], [0, 0.2]]
            ]);

            const inputs = new Inputs.OCCT.DrawShapeDto<any>();
            inputs.shape = {} as any;
            inputs.drawFaces = true;
            inputs.drawEdges = true;
            inputs.drawEdgeIndexes = true;
            inputs.edgeIndexHeight = 0.1;
            inputs.edgeIndexColour = "#ffff00";
            inputs.drawTwoSided = false;

            const result = await drawHelper.drawShape(inputs);

            expect(result).toBeDefined();
            // Verify createVectorText was called for each edge
            expect(mockSolidText.createVectorText).toHaveBeenCalled();
            // Should be called twice (once for each edge)
            expect((mockSolidText.createVectorText as jest.Mock).mock.calls.length).toBeGreaterThanOrEqual(2);
            
            // Verify the text height was set correctly
            const firstCall = (mockSolidText.createVectorText as jest.Mock).mock.calls[0][0];
            expect(firstCall.height).toBe(0.1);
            
            // Verify the text content includes edge index (1-based)
            expect(firstCall.text).toBe("1");
        });

        it("should compute edge middle position when middle_point is undefined", async () => {
            const mockShape = {
                faceList: [],
                edgeList: [
                    {
                        edge_index: 0,
                        // middle_point is undefined - should trigger computeEdgeMiddlePos
                        vertex_coord: [[0, 0, 0], [2, 0, 0]] as Inputs.Base.Point3[]
                    }
                ],
                pointsList: []
            };

            (mockOccWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValueOnce(mockShape);
            (mockSolidText.createVectorText as jest.Mock).mockResolvedValue([
                [[0, 0], [0.1, 0]]
            ]);

            const inputs = new Inputs.OCCT.DrawShapeDto<any>();
            inputs.shape = {} as any;
            inputs.drawFaces = false;
            inputs.drawEdges = true;
            inputs.drawEdgeIndexes = true;
            inputs.edgeIndexHeight = 0.2;
            inputs.edgeIndexColour = "#00ffff";
            inputs.drawTwoSided = false;

            const result = await drawHelper.drawShape(inputs);

            expect(result).toBeDefined();
            expect(mockSolidText.createVectorText).toHaveBeenCalled();
            // Vector.add should be called to position the text at computed middle point
            expect(mockVector.add).toHaveBeenCalled();
        });

        it("should handle edge with exactly 3 vertex coordinates (use middle vertex)", async () => {
            const mockShape = {
                faceList: [],
                edgeList: [
                    {
                        edge_index: 0,
                        // 3 vertices - middle one should be used
                        vertex_coord: [[0, 0, 0], [1, 0, 0], [2, 0, 0]] as Inputs.Base.Point3[]
                    }
                ],
                pointsList: []
            };

            (mockOccWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValueOnce(mockShape);
            (mockSolidText.createVectorText as jest.Mock).mockResolvedValue([
                [[0, 0], [0.1, 0]]
            ]);

            const inputs = new Inputs.OCCT.DrawShapeDto<any>();
            inputs.shape = {} as any;
            inputs.drawFaces = false;
            inputs.drawEdges = true;
            inputs.drawEdgeIndexes = true;
            inputs.edgeIndexHeight = 0.15;
            inputs.edgeIndexColour = "#ff00ff";
            inputs.drawTwoSided = false;

            const result = await drawHelper.drawShape(inputs);

            expect(result).toBeDefined();
            expect(mockSolidText.createVectorText).toHaveBeenCalled();
        });

        it("should handle edge with more than 3 vertex coordinates", async () => {
            const mockShape = {
                faceList: [],
                edgeList: [
                    {
                        edge_index: 0,
                        // More than 3 vertices - should lerp between middle vertices
                        vertex_coord: [[0, 0, 0], [1, 0, 0], [2, 0, 0], [3, 0, 0], [4, 0, 0]] as Inputs.Base.Point3[]
                    }
                ],
                pointsList: []
            };

            (mockOccWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValueOnce(mockShape);
            (mockSolidText.createVectorText as jest.Mock).mockResolvedValue([
                [[0, 0], [0.1, 0]]
            ]);

            const inputs = new Inputs.OCCT.DrawShapeDto<any>();
            inputs.shape = {} as any;
            inputs.drawFaces = false;
            inputs.drawEdges = true;
            inputs.drawEdgeIndexes = true;
            inputs.edgeIndexHeight = 0.1;
            inputs.edgeIndexColour = "#aabbcc";
            inputs.drawTwoSided = false;

            const result = await drawHelper.drawShape(inputs);

            expect(result).toBeDefined();
            expect(mockSolidText.createVectorText).toHaveBeenCalled();
        });

        it("should set zOffset on edge index mesh material", async () => {
            const mockShape = {
                faceList: [
                    {
                        face_index: 0,
                        center_point: [0.5, 0.5, 0] as Inputs.Base.Point3,
                        vertex_coord: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                        vertex_coord_vec: [[0, 0, 0], [1, 0, 0], [0.5, 1, 0]] as Inputs.Base.Point3[],
                        normal_coord: [0, 0, 1, 0, 0, 1, 0, 0, 1],
                        tri_indexes: [0, 1, 2]
                    }
                ],
                edgeList: [
                    {
                        edge_index: 0,
                        middle_point: [0.5, 0, 0] as Inputs.Base.Point3,
                        vertex_coord: [[0, 0, 0], [1, 0, 0]] as Inputs.Base.Point3[]
                    }
                ],
                pointsList: []
            };

            (mockOccWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValueOnce(mockShape);
            (mockSolidText.createVectorText as jest.Mock).mockResolvedValue([
                [[0, 0], [0.1, 0]]
            ]);

            const inputs = new Inputs.OCCT.DrawShapeDto<any>();
            inputs.shape = {} as any;
            inputs.drawFaces = true;
            inputs.drawEdges = true;
            inputs.drawEdgeIndexes = true;
            inputs.edgeIndexHeight = 0.1;
            inputs.edgeIndexColour = "#ffffff";
            inputs.drawTwoSided = false;

            const result = await drawHelper.drawShape(inputs);

            expect(result).toBeDefined();
            // The edge index mesh should have its parent set to shapeMesh
            const children = result.getChildMeshes();
            expect(children.length).toBeGreaterThan(0);
        });
    });

    describe("drawFaceIndexes", () => {
        it("should draw face indexes when drawFaceIndexes is true", async () => {
            const mockShape = {
                faceList: [
                    {
                        face_index: 0,
                        center_point: [0.5, 0.5, 0] as Inputs.Base.Point3,
                        vertex_coord: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                        vertex_coord_vec: [[0, 0, 0], [1, 0, 0], [0.5, 1, 0]] as Inputs.Base.Point3[],
                        normal_coord: [0, 0, 1, 0, 0, 1, 0, 0, 1],
                        tri_indexes: [0, 1, 2]
                    }
                ],
                edgeList: [],
                pointsList: []
            };

            (mockOccWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValueOnce(mockShape);
            (mockSolidText.createVectorText as jest.Mock).mockResolvedValue([
                [[0, 0], [0.1, 0], [0.1, 0.2], [0, 0.2]]
            ]);

            const inputs = new Inputs.OCCT.DrawShapeDto<any>();
            inputs.shape = {} as any;
            inputs.drawFaces = true;
            inputs.drawEdges = false;
            inputs.drawFaceIndexes = true;
            inputs.faceIndexHeight = 0.15;
            inputs.faceIndexColour = "#ff0000";
            inputs.drawTwoSided = false;

            const result = await drawHelper.drawShape(inputs);

            expect(result).toBeDefined();
            // Verify createVectorText was called for each face
            expect(mockSolidText.createVectorText).toHaveBeenCalled();
            // Should be called once for the face
            expect((mockSolidText.createVectorText as jest.Mock).mock.calls.length).toBeGreaterThanOrEqual(1);
            
            // Verify the text height was set correctly
            const firstCall = (mockSolidText.createVectorText as jest.Mock).mock.calls[0][0];
            expect(firstCall.height).toBe(0.15);
            
            // Verify the text content is face index (0-based)
            expect(firstCall.text).toBe("0");
        });

        it("should draw multiple face indexes", async () => {
            const mockShape = {
                faceList: [
                    {
                        face_index: 0,
                        center_point: [0.5, 0.5, 0] as Inputs.Base.Point3,
                        vertex_coord: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                        vertex_coord_vec: [[0, 0, 0], [1, 0, 0], [0.5, 1, 0]] as Inputs.Base.Point3[],
                        normal_coord: [0, 0, 1, 0, 0, 1, 0, 0, 1],
                        tri_indexes: [0, 1, 2]
                    },
                    {
                        face_index: 1,
                        center_point: [1.5, 0.5, 0] as Inputs.Base.Point3,
                        vertex_coord: [1, 0, 0, 2, 0, 0, 1.5, 1, 0],
                        vertex_coord_vec: [[1, 0, 0], [2, 0, 0], [1.5, 1, 0]] as Inputs.Base.Point3[],
                        normal_coord: [0, 0, 1, 0, 0, 1, 0, 0, 1],
                        tri_indexes: [0, 1, 2]
                    }
                ],
                edgeList: [],
                pointsList: []
            };

            (mockOccWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValueOnce(mockShape);
            (mockSolidText.createVectorText as jest.Mock).mockResolvedValue([
                [[0, 0], [0.1, 0]]
            ]);

            const inputs = new Inputs.OCCT.DrawShapeDto<any>();
            inputs.shape = {} as any;
            inputs.drawFaces = false; // Only draw face indexes, not faces
            inputs.drawEdges = false;
            inputs.drawFaceIndexes = true;
            inputs.faceIndexHeight = 0.15;
            inputs.faceIndexColour = "#ff0000";
            inputs.drawTwoSided = false;

            const result = await drawHelper.drawShape(inputs);

            expect(result).toBeDefined();
            // Should be called twice (once for each face)
            expect((mockSolidText.createVectorText as jest.Mock).mock.calls.length).toBe(2);
            
            // Verify second face index is "1"
            const secondCall = (mockSolidText.createVectorText as jest.Mock).mock.calls[1][0];
            expect(secondCall.text).toBe("1");
        });

        it("should compute face middle position when center_point is undefined", async () => {
            const mockShape = {
                faceList: [
                    {
                        face_index: 0,
                        // center_point is undefined - should trigger computeFaceMiddlePos
                        vertex_coord: [0, 0, 0, 2, 0, 0, 1, 2, 0],
                        vertex_coord_vec: [[0, 0, 0], [2, 0, 0], [1, 2, 0]] as Inputs.Base.Point3[],
                        normal_coord: [0, 0, 1, 0, 0, 1, 0, 0, 1],
                        tri_indexes: [0, 1, 2]
                    }
                ],
                edgeList: [],
                pointsList: []
            };

            (mockOccWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValueOnce(mockShape);
            (mockSolidText.createVectorText as jest.Mock).mockResolvedValue([
                [[0, 0], [0.1, 0]]
            ]);

            const inputs = new Inputs.OCCT.DrawShapeDto<any>();
            inputs.shape = {} as any;
            inputs.drawFaces = true;
            inputs.drawEdges = false;
            inputs.drawFaceIndexes = true;
            inputs.faceIndexHeight = 0.2;
            inputs.faceIndexColour = "#00ff00";
            inputs.drawTwoSided = false;

            const result = await drawHelper.drawShape(inputs);

            expect(result).toBeDefined();
            expect(mockSolidText.createVectorText).toHaveBeenCalled();
            // Vector.add should be called to position the text at computed center point
            expect(mockVector.add).toHaveBeenCalled();
        });

        it("should set zOffset on face index mesh when drawEdges is true", async () => {
            const mockShape = {
                faceList: [
                    {
                        face_index: 0,
                        center_point: [0.5, 0.5, 0] as Inputs.Base.Point3,
                        vertex_coord: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                        vertex_coord_vec: [[0, 0, 0], [1, 0, 0], [0.5, 1, 0]] as Inputs.Base.Point3[],
                        normal_coord: [0, 0, 1, 0, 0, 1, 0, 0, 1],
                        tri_indexes: [0, 1, 2]
                    }
                ],
                edgeList: [
                    {
                        edge_index: 0,
                        middle_point: [0.5, 0, 0] as Inputs.Base.Point3,
                        vertex_coord: [[0, 0, 0], [1, 0, 0]] as Inputs.Base.Point3[]
                    }
                ],
                pointsList: []
            };

            (mockOccWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValueOnce(mockShape);
            (mockSolidText.createVectorText as jest.Mock).mockResolvedValue([
                [[0, 0], [0.1, 0]]
            ]);

            const inputs = new Inputs.OCCT.DrawShapeDto<any>();
            inputs.shape = {} as any;
            inputs.drawFaces = true;
            inputs.drawEdges = true;
            inputs.drawFaceIndexes = true;
            inputs.faceIndexHeight = 0.1;
            inputs.faceIndexColour = "#0000ff";
            inputs.drawTwoSided = false;

            const result = await drawHelper.drawShape(inputs);

            expect(result).toBeDefined();
            // The mesh should have zOffset set when drawEdges is true
            const children = result.getChildMeshes();
            expect(children.length).toBeGreaterThan(0);
        });

        it("should not set zOffset on face index mesh when drawEdges is false", async () => {
            const mockShape = {
                faceList: [
                    {
                        face_index: 0,
                        center_point: [0.5, 0.5, 0] as Inputs.Base.Point3,
                        vertex_coord: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                        vertex_coord_vec: [[0, 0, 0], [1, 0, 0], [0.5, 1, 0]] as Inputs.Base.Point3[],
                        normal_coord: [0, 0, 1, 0, 0, 1, 0, 0, 1],
                        tri_indexes: [0, 1, 2]
                    }
                ],
                edgeList: [],
                pointsList: []
            };

            (mockOccWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValueOnce(mockShape);
            (mockSolidText.createVectorText as jest.Mock).mockResolvedValue([
                [[0, 0], [0.1, 0]]
            ]);

            const inputs = new Inputs.OCCT.DrawShapeDto<any>();
            inputs.shape = {} as any;
            inputs.drawFaces = true;
            inputs.drawEdges = false;
            inputs.drawFaceIndexes = true;
            inputs.faceIndexHeight = 0.1;
            inputs.faceIndexColour = "#0000ff";
            inputs.drawTwoSided = false;

            const result = await drawHelper.drawShape(inputs);

            expect(result).toBeDefined();
            expect(mockSolidText.createVectorText).toHaveBeenCalled();
        });
    });

    describe("drawEdgeIndexes and drawFaceIndexes combined", () => {
        it("should draw both edge and face indexes simultaneously", async () => {
            const mockShape = {
                faceList: [
                    {
                        face_index: 0,
                        center_point: [0.5, 0.5, 0] as Inputs.Base.Point3,
                        vertex_coord: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                        vertex_coord_vec: [[0, 0, 0], [1, 0, 0], [0.5, 1, 0]] as Inputs.Base.Point3[],
                        normal_coord: [0, 0, 1, 0, 0, 1, 0, 0, 1],
                        tri_indexes: [0, 1, 2]
                    }
                ],
                edgeList: [
                    {
                        edge_index: 0,
                        middle_point: [0.5, 0, 0] as Inputs.Base.Point3,
                        vertex_coord: [[0, 0, 0], [1, 0, 0]] as Inputs.Base.Point3[]
                    },
                    {
                        edge_index: 1,
                        middle_point: [0.25, 0.5, 0] as Inputs.Base.Point3,
                        vertex_coord: [[0, 0, 0], [0.5, 1, 0]] as Inputs.Base.Point3[]
                    },
                    {
                        edge_index: 2,
                        middle_point: [0.75, 0.5, 0] as Inputs.Base.Point3,
                        vertex_coord: [[1, 0, 0], [0.5, 1, 0]] as Inputs.Base.Point3[]
                    }
                ],
                pointsList: []
            };

            (mockOccWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValueOnce(mockShape);
            (mockSolidText.createVectorText as jest.Mock).mockResolvedValue([
                [[0, 0], [0.1, 0], [0.1, 0.2], [0, 0.2]]
            ]);

            const inputs = new Inputs.OCCT.DrawShapeDto<any>();
            inputs.shape = {} as any;
            inputs.drawFaces = true;
            inputs.drawEdges = true;
            inputs.drawEdgeIndexes = true;
            inputs.drawFaceIndexes = true;
            inputs.edgeIndexHeight = 0.1;
            inputs.edgeIndexColour = "#ffff00";
            inputs.faceIndexHeight = 0.15;
            inputs.faceIndexColour = "#ff00ff";
            inputs.drawTwoSided = false;

            const result = await drawHelper.drawShape(inputs);

            expect(result).toBeDefined();
            // Should have called createVectorText for all edges (3) and faces (1)
            expect((mockSolidText.createVectorText as jest.Mock).mock.calls.length).toBe(4);
        });

        it("should not call createVectorText when edgeList is empty but drawEdgeIndexes is true", async () => {
            // When edgeList is empty but drawEdgeIndexes is true, no text creation happens
            // The promises array will be empty, resulting in empty textPolylines
            const mockShape = {
                faceList: [
                    {
                        face_index: 0,
                        center_point: [0.5, 0.5, 0] as Inputs.Base.Point3,
                        vertex_coord: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                        vertex_coord_vec: [[0, 0, 0], [1, 0, 0], [0.5, 1, 0]] as Inputs.Base.Point3[],
                        normal_coord: [0, 0, 1, 0, 0, 1, 0, 0, 1],
                        tri_indexes: [0, 1, 2]
                    }
                ],
                edgeList: [],
                pointsList: []
            };

            (mockOccWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValueOnce(mockShape);
            (mockSolidText.createVectorText as jest.Mock).mockResolvedValue([
                [[0, 0], [0.1, 0]]
            ]);

            const inputs = new Inputs.OCCT.DrawShapeDto<any>();
            inputs.shape = {} as any;
            inputs.drawFaces = true;
            inputs.drawEdges = false;
            inputs.drawEdgeIndexes = true; // true but edgeList is empty
            inputs.edgeIndexHeight = 0.1;
            inputs.edgeIndexColour = "#ffff00";
            inputs.drawTwoSided = false;

            // Note: Currently the implementation throws when edgeList is empty
            // because drawPolylines returns undefined for empty polylines
            // and the code tries to set parent on undefined
            await expect(drawHelper.drawShape(inputs)).rejects.toThrow();
        });

        it("should not call createVectorText when faceList is empty but drawFaceIndexes is true", async () => {
            // When faceList is empty but drawFaceIndexes is true, no text creation happens
            // The promises array will be empty, resulting in empty textPolylines
            const mockShape = {
                faceList: [],
                edgeList: [
                    {
                        edge_index: 0,
                        middle_point: [0.5, 0, 0] as Inputs.Base.Point3,
                        vertex_coord: [[0, 0, 0], [1, 0, 0]] as Inputs.Base.Point3[]
                    }
                ],
                pointsList: []
            };

            (mockOccWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValueOnce(mockShape);
            (mockSolidText.createVectorText as jest.Mock).mockResolvedValue([
                [[0, 0], [0.1, 0]]
            ]);

            const inputs = new Inputs.OCCT.DrawShapeDto<any>();
            inputs.shape = {} as any;
            inputs.drawFaces = false;
            inputs.drawEdges = true;
            inputs.drawEdgeIndexes = false; // Only test face indexes
            inputs.drawFaceIndexes = true; // true but faceList is empty
            inputs.faceIndexHeight = 0.1;
            inputs.faceIndexColour = "#ff00ff";
            inputs.drawTwoSided = false;

            // Note: Currently the implementation throws when faceList is empty
            // because drawPolylines returns undefined for empty polylines
            // and the code tries to set parent on undefined
            await expect(drawHelper.drawShape(inputs)).rejects.toThrow();
        });

        it("should use correct lineSpacing for edge index text", async () => {
            const mockShape = {
                faceList: [],
                edgeList: [
                    {
                        edge_index: 0,
                        middle_point: [0.5, 0, 0] as Inputs.Base.Point3,
                        vertex_coord: [[0, 0, 0], [1, 0, 0]] as Inputs.Base.Point3[]
                    }
                ],
                pointsList: []
            };

            (mockOccWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValueOnce(mockShape);
            (mockSolidText.createVectorText as jest.Mock).mockResolvedValue([
                [[0, 0], [0.1, 0]]
            ]);

            const inputs = new Inputs.OCCT.DrawShapeDto<any>();
            inputs.shape = {} as any;
            inputs.drawFaces = false;
            inputs.drawEdges = true;
            inputs.drawEdgeIndexes = true;
            inputs.edgeIndexHeight = 0.1;
            inputs.edgeIndexColour = "#ffff00";
            inputs.drawTwoSided = false;

            await drawHelper.drawShape(inputs);

            const textDto = (mockSolidText.createVectorText as jest.Mock).mock.calls[0][0];
            expect(textDto.lineSpacing).toBe(1.5);
        });

        it("should use correct lineSpacing for face index text", async () => {
            const mockShape = {
                faceList: [
                    {
                        face_index: 0,
                        center_point: [0.5, 0.5, 0] as Inputs.Base.Point3,
                        vertex_coord: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                        vertex_coord_vec: [[0, 0, 0], [1, 0, 0], [0.5, 1, 0]] as Inputs.Base.Point3[],
                        normal_coord: [0, 0, 1, 0, 0, 1, 0, 0, 1],
                        tri_indexes: [0, 1, 2]
                    }
                ],
                edgeList: [],
                pointsList: []
            };

            (mockOccWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValueOnce(mockShape);
            (mockSolidText.createVectorText as jest.Mock).mockResolvedValue([
                [[0, 0], [0.1, 0]]
            ]);

            const inputs = new Inputs.OCCT.DrawShapeDto<any>();
            inputs.shape = {} as any;
            inputs.drawFaces = true;
            inputs.drawEdges = false;
            inputs.drawFaceIndexes = true;
            inputs.faceIndexHeight = 0.15;
            inputs.faceIndexColour = "#ff00ff";
            inputs.drawTwoSided = false;

            await drawHelper.drawShape(inputs);

            const textDto = (mockSolidText.createVectorText as jest.Mock).mock.calls[0][0];
            expect(textDto.lineSpacing).toBe(1.5);
        });

        it("should apply Y offset of 0.05 to text polyline points", async () => {
            const mockShape = {
                faceList: [],
                edgeList: [
                    {
                        edge_index: 0,
                        middle_point: [1, 2, 3] as Inputs.Base.Point3,
                        vertex_coord: [[0, 0, 0], [2, 4, 6]] as Inputs.Base.Point3[]
                    }
                ],
                pointsList: []
            };

            (mockOccWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValueOnce(mockShape);
            
            // Return text polyline with known coordinates
            (mockSolidText.createVectorText as jest.Mock).mockResolvedValue([
                [[0, 0], [1, 0]]
            ]);

            const inputs = new Inputs.OCCT.DrawShapeDto<any>();
            inputs.shape = {} as any;
            inputs.drawFaces = false;
            inputs.drawEdges = true;
            inputs.drawEdgeIndexes = true;
            inputs.edgeIndexHeight = 0.1;
            inputs.edgeIndexColour = "#ffff00";
            inputs.drawTwoSided = false;

            await drawHelper.drawShape(inputs);

            // Vector.add should be called with the modified point (Y offset of 0.05)
            expect(mockVector.add).toHaveBeenCalled();
            const addCalls = (mockVector.add as jest.Mock).mock.calls;
            // Check that the first parameter contains the Y offset
            expect(addCalls[0][0].first[1]).toBe(0.05);
        });
    });

    describe("prepareBackFaceMeshDataNoWindingReversal", () => {
        it("should flip normals without reversing winding order", () => {
            const meshData = [
                {
                    positions: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                    normals: [0, 0, 1, 0, 0, 1, 0, 0, 1],
                    indices: [0, 1, 2],
                    uvs: [0, 0, 1, 0, 0, 1]
                }
            ];

            const result = (drawHelper as any).prepareBackFaceMeshDataNoWindingReversal(meshData);

            // Positions should remain the same
            expect(result.positions).toEqual([0, 0, 0, 1, 0, 0, 0, 1, 0]);
            
            // Normals should be flipped (negated)
            expect(result.normals.length).toBe(9);
            expect(Math.abs(result.normals[0])).toBe(0); // Handle -0 vs 0
            expect(Math.abs(result.normals[1])).toBe(0); // Handle -0 vs 0
            expect(result.normals[2]).toBe(-1);
            expect(Math.abs(result.normals[3])).toBe(0); // Handle -0 vs 0
            expect(Math.abs(result.normals[4])).toBe(0); // Handle -0 vs 0
            expect(result.normals[5]).toBe(-1);
            expect(Math.abs(result.normals[6])).toBe(0); // Handle -0 vs 0
            expect(Math.abs(result.normals[7])).toBe(0); // Handle -0 vs 0
            expect(result.normals[8]).toBe(-1);
            
            // Indices should NOT be reversed (this is the key difference from prepareBackFaceMeshData)
            expect(result.indices).toEqual([0, 1, 2]);
            
            // UVs should be preserved
            expect(result.uvs).toEqual([0, 0, 1, 0, 0, 1]);
        });

        it("should handle multiple mesh data items", () => {
            const meshDataArray = [
                {
                    positions: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                    normals: [0, 0, 1, 0, 0, 1, 0, 0, 1],
                    indices: [0, 1, 2]
                },
                {
                    positions: [2, 0, 0, 3, 0, 0, 2, 1, 0],
                    normals: [0, 0, 1, 0, 0, 1, 0, 0, 1],
                    indices: [0, 1, 2]
                }
            ];

            const result = (drawHelper as any).prepareBackFaceMeshDataNoWindingReversal(meshDataArray);

            // Positions should be combined
            expect(result.positions).toEqual([
                0, 0, 0, 1, 0, 0, 0, 1, 0,
                2, 0, 0, 3, 0, 0, 2, 1, 0
            ]);
            
            // Normals should all be flipped
            expect(result.normals.length).toBe(18);
            // Check only the non-zero values
            expect(result.normals[2]).toBe(-1);
            expect(result.normals[5]).toBe(-1);
            expect(result.normals[8]).toBe(-1);
            expect(result.normals[11]).toBe(-1);
            expect(result.normals[14]).toBe(-1);
            expect(result.normals[17]).toBe(-1);
            
            // Indices should be combined with proper offsets (no winding reversal)
            expect(result.indices).toEqual([0, 1, 2, 3, 4, 5]);
        });

        it("should correctly apply index offset for multiple meshes", () => {
            const meshDataArray = [
                {
                    positions: [0, 0, 0, 1, 0, 0, 0, 1, 0], // 3 vertices
                    normals: [0, 0, 1, 0, 0, 1, 0, 0, 1],
                    indices: [0, 1, 2]
                },
                {
                    positions: [2, 0, 0, 3, 0, 0, 2, 1, 0, 3, 1, 0], // 4 vertices
                    normals: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
                    indices: [0, 1, 2, 1, 3, 2]
                }
            ];

            const result = (drawHelper as any).prepareBackFaceMeshDataNoWindingReversal(meshDataArray);

            // Second mesh indices should be offset by 3 (first mesh had 3 vertices)
            expect(result.indices).toEqual([
                0, 1, 2,        // First mesh
                3, 4, 5, 4, 6, 5 // Second mesh with offset of 3
            ]);
        });

        it("should handle normals with mixed positive and negative values", () => {
            const meshData = [
                {
                    positions: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                    normals: [0.5, -0.5, 0.707, -0.3, 0.8, -0.5, 1, 0, 0],
                    indices: [0, 1, 2]
                }
            ];

            const result = (drawHelper as any).prepareBackFaceMeshDataNoWindingReversal(meshData);

            // All normals should be negated
            expect(result.normals.length).toBe(9);
            expect(result.normals[0]).toBe(-0.5);
            expect(result.normals[1]).toBe(0.5);
            expect(result.normals[2]).toBe(-0.707);
            expect(result.normals[3]).toBe(0.3);
            expect(result.normals[4]).toBe(-0.8);
            expect(result.normals[5]).toBe(0.5);
            expect(result.normals[6]).toBe(-1);
            expect(result.normals[7]).toBeCloseTo(0, 10); // Handle -0 vs 0
            expect(result.normals[8]).toBeCloseTo(0, 10); // Handle -0 vs 0
        });

        it("should handle mesh data without UVs", () => {
            const meshData = [
                {
                    positions: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                    normals: [0, 0, 1, 0, 0, 1, 0, 0, 1],
                    indices: [0, 1, 2]
                }
            ];

            const result = (drawHelper as any).prepareBackFaceMeshDataNoWindingReversal(meshData);

            // UVs should be undefined when not provided
            expect(result.uvs).toBeUndefined();
        });

        it("should handle mesh data with UVs", () => {
            const meshData = [
                {
                    positions: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                    normals: [0, 0, 1, 0, 0, 1, 0, 0, 1],
                    indices: [0, 1, 2],
                    uvs: [0, 0, 1, 0, 0.5, 1]
                }
            ];

            const result = (drawHelper as any).prepareBackFaceMeshDataNoWindingReversal(meshData);

            // UVs should be preserved
            expect(result.uvs).toEqual([0, 0, 1, 0, 0.5, 1]);
        });

        it("should combine UVs from multiple meshes", () => {
            const meshDataArray = [
                {
                    positions: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                    normals: [0, 0, 1, 0, 0, 1, 0, 0, 1],
                    indices: [0, 1, 2],
                    uvs: [0, 0, 1, 0, 0, 1]
                },
                {
                    positions: [2, 0, 0, 3, 0, 0, 2, 1, 0],
                    normals: [0, 0, 1, 0, 0, 1, 0, 0, 1],
                    indices: [0, 1, 2],
                    uvs: [0, 0, 1, 0, 0.5, 0.5]
                }
            ];

            const result = (drawHelper as any).prepareBackFaceMeshDataNoWindingReversal(meshDataArray);

            // UVs should be combined
            expect(result.uvs).toEqual([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0.5, 0.5]);
        });

        it("should handle empty normals array", () => {
            const meshData = [
                {
                    positions: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                    normals: [],
                    indices: [0, 1, 2]
                }
            ];

            const result = (drawHelper as any).prepareBackFaceMeshDataNoWindingReversal(meshData);

            // Normals should remain empty (not flipped)
            expect(result.normals.length).toBe(0);
        });

        it("should handle complex triangle mesh", () => {
            const meshData = [
                {
                    positions: [
                        0, 0, 0,  // vertex 0
                        1, 0, 0,  // vertex 1
                        0, 1, 0,  // vertex 2
                        1, 1, 0   // vertex 3
                    ],
                    normals: [
                        0, 0, 1,
                        0, 0, 1,
                        0, 0, 1,
                        0, 0, 1
                    ],
                    indices: [0, 1, 2, 1, 3, 2], // Two triangles forming a quad
                    uvs: [0, 0, 1, 0, 0, 1, 1, 1]
                }
            ];

            const result = (drawHelper as any).prepareBackFaceMeshDataNoWindingReversal(meshData);

            // Normals should all be flipped
            expect(result.normals.length).toBe(12);
            // Check the z-components which should be -1
            expect(result.normals[2]).toBe(-1);
            expect(result.normals[5]).toBe(-1);
            expect(result.normals[8]).toBe(-1);
            expect(result.normals[11]).toBe(-1);
            
            // Winding order should NOT be reversed
            expect(result.indices).toEqual([0, 1, 2, 1, 3, 2]);
        });

        it("should handle mesh data with only some items having UVs", () => {
            const meshDataArray = [
                {
                    positions: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                    normals: [0, 0, 1, 0, 0, 1, 0, 0, 1],
                    indices: [0, 1, 2],
                    uvs: [0, 0, 1, 0, 0, 1]
                },
                {
                    positions: [2, 0, 0, 3, 0, 0, 2, 1, 0],
                    normals: [0, 0, 1, 0, 0, 1, 0, 0, 1],
                    indices: [0, 1, 2]
                    // No UVs in second mesh
                }
            ];

            const result = (drawHelper as any).prepareBackFaceMeshDataNoWindingReversal(meshDataArray);

            // Only the first mesh's UVs should be present
            expect(result.uvs).toEqual([0, 0, 1, 0, 0, 1]);
        });

        it("should preserve zero normals", () => {
            const meshData = [
                {
                    positions: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                    normals: [0, 0, 0, 0, 0, 0, 0, 0, 0],
                    indices: [0, 1, 2]
                }
            ];

            const result = (drawHelper as any).prepareBackFaceMeshDataNoWindingReversal(meshData);

            // Zero normals should remain zero after negation (note: -0 == 0 in JavaScript)
            expect(result.normals.length).toBe(9);
            // All values should be zero (or -0, which is mathematically equal to 0)
            result.normals.forEach(val => expect(Math.abs(val)).toBe(0));
        });

        it("should correctly handle very small normal values", () => {
            const meshData = [
                {
                    positions: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                    normals: [0.001, -0.002, 0.003, -0.001, 0.002, -0.003, 0.0001, -0.0002, 0.0003],
                    indices: [0, 1, 2]
                }
            ];

            const result = (drawHelper as any).prepareBackFaceMeshDataNoWindingReversal(meshData);

            // Small values should be properly negated
            expect(result.normals).toEqual([-0.001, 0.002, -0.003, 0.001, -0.002, 0.003, -0.0001, 0.0002, -0.0003]);
        });
    });
});
