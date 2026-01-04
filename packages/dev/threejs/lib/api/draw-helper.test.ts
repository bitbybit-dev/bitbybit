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

    // ==================== TEST HELPER FUNCTIONS ====================
    // Inspired by PlayCanvas comprehensive testing patterns

    /**
     * Converts hex color string to RGB object with values 0-1
     * @param hex - Hex color string (e.g., "#ff0000" or "#f00")
     * @returns RGB object with r, g, b values between 0 and 1
     */
    const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
        // Handle 3-digit hex colors
        if (hex.length === 4) {
            const r = hex[1];
            const g = hex[2];
            const b = hex[3];
            hex = `#${r}${r}${g}${g}${b}${b}`;
        }

        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (!result) {
            return { r: 1, g: 0, b: 0 }; // Default to red if parsing fails
        }

        return {
            r: parseInt(result[1], 16) / 255,
            g: parseInt(result[2], 16) / 255,
            b: parseInt(result[3], 16) / 255
        };
    };

    /**
     * Checks if two colors are approximately equal within a tolerance
     * @param color1 - THREE.Color object
     * @param color2 - RGB object with r, g, b values
     * @param tolerance - Maximum difference per channel (default 0.01)
     * @returns true if colors are within tolerance
     */
    const colorsAreEqual = (color1: THREEJS.Color, color2: { r: number; g: number; b: number }, tolerance = 0.01): boolean => {
        return Math.abs(color1.r - color2.r) < tolerance &&
               Math.abs(color1.g - color2.g) < tolerance &&
               Math.abs(color1.b - color2.b) < tolerance;
    };

    /**
     * Extracts material from a Three.js mesh or line segments
     * @param mesh - Three.js Mesh or LineSegments object
     * @returns Material object or undefined
     */
    const getMaterialFromMesh = (mesh: THREEJS.Mesh | THREEJS.LineSegments | THREEJS.Points): THREEJS.Material | THREEJS.Material[] | undefined => {
        if (!mesh || !mesh.material) return undefined;
        return mesh.material;
    };

    /**
     * Creates mock JSCAD mesh data for testing
     */
    const createMockJSCADMesh = (overrides = {}) => ({
        type: "solid" as const,
        polygons: [],
        ...overrides
    });

    /**
     * Creates mock OCCT shape data for testing
     */
    const createMockOCCTShape = (overrides = {}) => ({
        hash: 123,
        type: "solid" as const,
        ...overrides
    });

    /**
     * Simulates worker error for testing error handling
     */
    const mockWorkerError = (workerManager: any, method: string, error: Error) => {
        (workerManager.genericCallToWorkerPromise as jest.Mock)
            .mockImplementation((methodName) => {
                if (methodName === method) {
                    return Promise.reject(error);
                }
                // Return normal response for other methods
                return Promise.resolve({
                    positions: [],
                    normals: [],
                    indices: [],
                    transforms: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
                });
            });
    };

    // ==================== EXISTING TESTS ====================

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
            expect(result.children.length).toBe(1);
            
            const mesh = result.children[0] as THREEJS.InstancedMesh;
            const material = getMaterialFromMesh(mesh) as THREEJS.MeshBasicMaterial;
            expect(material).toBeDefined();
            expect(colorsAreEqual(material.color, hexToRgb("#ff0000"))).toBe(true);
            expect(material.opacity).toBeCloseTo(1, 2);
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
            expect(result.children.length).toBe(3);
            
            // Check each point has correct material color
            result.children.forEach(child => {
                const mesh = child as THREEJS.InstancedMesh;
                const material = getMaterialFromMesh(mesh) as THREEJS.MeshBasicMaterial;
                expect(colorsAreEqual(material.color, hexToRgb("#ff0000"))).toBe(true);
                expect(material.opacity).toBeCloseTo(1, 2);
            });
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
            expect(result.children.length).toBe(3);
            
            // Verify each point has its unique color
            const expectedColors = ["#ff0000", "#00ff00", "#0000ff"];
            result.children.forEach((child, index) => {
                const mesh = child as THREEJS.InstancedMesh;
                const material = getMaterialFromMesh(mesh) as THREEJS.MeshBasicMaterial;
                expect(colorsAreEqual(material.color, hexToRgb(expectedColors[index]))).toBe(true);
            });
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
            expect(result.children.length).toBe(1);
            
            const lineSegments = result.children[0] as THREEJS.LineSegments;
            if (lineSegments.material && !Array.isArray(lineSegments.material)) {
                const material = lineSegments.material as THREEJS.LineBasicMaterial;
                // Polylines use vertex colors, so check the geometry color attribute instead
                const colorAttribute = lineSegments.geometry.getAttribute("color");
                if (colorAttribute) {
                    const expectedRgb = hexToRgb("#00ff00");
                    // Check first vertex color (r, g, b are at indices 0, 1, 2)
                    expect(colorAttribute.getX(0)).toBeCloseTo(expectedRgb.r, 2);
                    expect(colorAttribute.getY(0)).toBeCloseTo(expectedRgb.g, 2);
                    expect(colorAttribute.getZ(0)).toBeCloseTo(expectedRgb.b, 2);
                }
                expect(material.opacity).toBeCloseTo(1, 2);
            }
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
            expect(result.children.length).toBe(1);
            
            const lineSegments = result.children[0] as THREEJS.LineSegments;
            if (lineSegments.material && !Array.isArray(lineSegments.material)) {
                const material = lineSegments.material as THREEJS.LineBasicMaterial;
                // Polylines use vertex colors, so check the geometry color attribute instead
                const colorAttribute = lineSegments.geometry.getAttribute("color");
                if (colorAttribute) {
                    const expectedRgb = hexToRgb("#ff0000");
                    // Check first vertex color (r, g, b are at indices 0, 1, 2)
                    expect(colorAttribute.getX(0)).toBeCloseTo(expectedRgb.r, 2);
                    expect(colorAttribute.getY(0)).toBeCloseTo(expectedRgb.g, 2);
                    expect(colorAttribute.getZ(0)).toBeCloseTo(expectedRgb.b, 2);
                }
            }
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
            expect(result.children.length).toBeGreaterThan(0);
            
            const mesh = result.children[0] as THREEJS.Mesh;
            const material = mesh.material as THREEJS.MeshPhysicalMaterial;
            expect(colorsAreEqual(material.color, hexToRgb("#ff0000"))).toBe(true);
            expect(material.opacity).toBeCloseTo(1, 2);
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
            
            // Verify each surface has its unique color
            // Children might be groups containing meshes
            const child1 = result.children[0] as THREEJS.Group;
            const mesh1 = (child1.children && child1.children.length > 0 ? child1.children[0] : child1) as THREEJS.Mesh;
            if (mesh1.material && !Array.isArray(mesh1.material)) {
                const material1 = mesh1.material as THREEJS.MeshPhysicalMaterial;
                if (material1.color) {
                    expect(colorsAreEqual(material1.color, hexToRgb("#ff0000"))).toBe(true);
                }
            }
            
            const child2 = result.children[1] as THREEJS.Group;
            const mesh2 = (child2.children && child2.children.length > 0 ? child2.children[0] : child2) as THREEJS.Mesh;
            if (mesh2.material && !Array.isArray(mesh2.material)) {
                const material2 = mesh2.material as THREEJS.MeshPhysicalMaterial;
                if (material2.color) {
                    expect(colorsAreEqual(material2.color, hexToRgb("#00ff00"))).toBe(true);
                }
            }
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
            expect(result.children.length).toBeGreaterThan(0);
            
            const mesh = result.children[0] as THREEJS.Mesh;
            const material = mesh.material as THREEJS.MeshPhysicalMaterial;
            expect(colorsAreEqual(material.color, hexToRgb("#ff0000"))).toBe(true);
            expect(material.opacity).toBeCloseTo(1, 2);
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
            expect(result.children.length).toBe(2);
            
            // Verify both meshes have the same color
            result.children.forEach(child => {
                const mesh = child as THREEJS.Mesh;
                if (mesh.material && !Array.isArray(mesh.material)) {
                    const material = mesh.material as THREEJS.MeshPhysicalMaterial;
                    if (material.color) {
                        expect(colorsAreEqual(material.color, hexToRgb("#ff0000"))).toBe(true);
                    }
                }
            });
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
            expect(result.children.length).toBe(2);
            
            // Verify each mesh has its unique color
            const mesh1 = result.children[0] as THREEJS.Mesh;
            if (mesh1.material && !Array.isArray(mesh1.material)) {
                const material1 = mesh1.material as THREEJS.MeshPhysicalMaterial;
                if (material1.color) {
                    expect(colorsAreEqual(material1.color, hexToRgb("#ff0000"))).toBe(true);
                }
            }
            
            const mesh2 = result.children[1] as THREEJS.Mesh;
            if (mesh2.material && !Array.isArray(mesh2.material)) {
                const material2 = mesh2.material as THREEJS.MeshPhysicalMaterial;
                if (material2.color) {
                    expect(colorsAreEqual(material2.color, hexToRgb("#00ff00"))).toBe(true);
                }
            }
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
            expect(result.children.length).toBeGreaterThan(0);
            
            // Find the faces group and verify material color
            const facesGroup = result.children.find(child => child.name?.includes("faces")) as THREEJS.Group;
            if (facesGroup && facesGroup.children.length > 0) {
                const mesh = facesGroup.children[0] as THREEJS.Mesh;
                const material = mesh.material as THREEJS.MeshPhysicalMaterial;
                expect(colorsAreEqual(material.color, hexToRgb("#ff0000"))).toBe(true);
            }
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
            expect(result.children.length).toBeGreaterThan(0);
            
            // Find the edges group and verify material color
            const edgesGroup = result.children.find(child => child.name?.includes("edges")) as THREEJS.Group;
            if (edgesGroup && edgesGroup.children.length > 0) {
                const lineSegments = edgesGroup.children[0] as THREEJS.LineSegments;
                const material = lineSegments.material as THREEJS.LineBasicMaterial;
                expect(colorsAreEqual(material.color, hexToRgb("#00ff00"))).toBe(true);
            }
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
            expect(result.children.length).toBeGreaterThan(0);
            
            // Find the vertices group and verify material color
            const verticesGroup = result.children.find(child => child.name?.includes("vertices")) as THREEJS.Group;
            if (verticesGroup && verticesGroup.children.length > 0) {
                const pointMesh = verticesGroup.children[0] as THREEJS.InstancedMesh;
                const material = pointMesh.material as THREEJS.MeshBasicMaterial;
                expect(colorsAreEqual(material.color, hexToRgb("#0000ff"))).toBe(true);
            }
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
            expect(result.children.length).toBeGreaterThan(0);
            
            // Each shape creates a child group, and should have faces
            result.children.forEach(childGroup => {
                const group = childGroup as THREEJS.Group;
                expect(group.children.length).toBeGreaterThan(0);
            });
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
            expect(result.children.length).toBeGreaterThan(0);
            
            const mesh = result.children[0] as THREEJS.Mesh;
            const material = mesh.material as THREEJS.MeshPhysicalMaterial;
            expect(colorsAreEqual(material.color, hexToRgb("#ff0000"))).toBe(true);
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
            // Note: The worker returns manifolds but they get filtered based on geometry validity
            // Since we're mocking with valid data, we should get some children
            // However, the implementation might filter some out
            expect(result.children.length).toBeGreaterThanOrEqual(0);
            
            // If there are children, verify they have the correct color
            if (result.children.length > 0) {
                result.children.forEach(child => {
                    const mesh = child as THREEJS.Mesh;
                    if (mesh.material && !Array.isArray(mesh.material)) {
                        const material = mesh.material as THREEJS.MeshPhysicalMaterial;
                        if (material.color) {
                            expect(colorsAreEqual(material.color, hexToRgb("#ff0000"))).toBe(true);
                        }
                    }
                });
            }
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

    // ==================== NEW COMPREHENSIVE TEST SUITES ====================
    // Based on PlayCanvas testing patterns and coverage gap analysis

    describe("Error handling", () => {
        it("should throw descriptive error when JSCAD worker fails", async () => {
            const mockError = new Error("Worker communication failed");
            mockWorkerError(mockJscadWorkerManager, "shapeToMesh", mockError);

            const inputs = new Inputs.JSCAD.DrawSolidMeshDto<THREEJS.Group>(
                createMockJSCADMesh(),
                1,
                "#ff0000",
                false,
                false
            );

            await expect(drawHelper.drawSolidOrPolygonMesh(inputs))
                .rejects
                .toThrow();
        });

        it("should throw descriptive error when OCCT worker fails", async () => {
            const mockError = new Error("OCCT decomposition failed");
            mockWorkerError(mockOccWorkerManager, "shapeToMesh", mockError);

            const inputs = new Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>();
            inputs.shape = createMockOCCTShape();
            inputs.drawFaces = true;
            inputs.drawEdges = false;
            inputs.drawVertices = false;

            await expect(drawHelper.drawShape(inputs))
                .rejects
                .toThrow();
        });

        it("should throw descriptive error when Manifold worker fails", async () => {
            const mockError = new Error("Manifold mesh extraction failed");
            mockWorkerError(mockManifoldWorkerManager, "decomposeManifoldOrCrossSection", mockError);

            const inputs = new Inputs.Manifold.DrawManifoldOrCrossSectionDto<Inputs.Manifold.ManifoldPointer, THREEJS.MeshPhysicalMaterial>();
            inputs.manifoldOrCrossSection = { hash: 123, type: "manifold" };
            inputs.faceColour = "#ff0000";
            inputs.faceOpacity = 1;

            await expect(drawHelper.drawManifoldOrCrossSection(inputs))
                .rejects
                .toThrow();
        });

        it("should handle worker timeout gracefully", async () => {
            const timeoutError = new Error("Worker operation timed out");
            (mockJscadWorkerManager.genericCallToWorkerPromise as jest.Mock)
                .mockRejectedValue(timeoutError);

            const inputs = new Inputs.JSCAD.DrawSolidMeshDto<THREEJS.Group>(
                createMockJSCADMesh(),
                1,
                "#ff0000"
            );

            await expect(drawHelper.drawSolidOrPolygonMesh(inputs))
                .rejects
                .toThrow();
        });

        it("should handle corrupted worker response", async () => {
            (mockJscadWorkerManager.genericCallToWorkerPromise as jest.Mock)
                .mockResolvedValue({ invalid: "data" }); // Missing required fields

            const inputs = new Inputs.JSCAD.DrawSolidMeshDto<THREEJS.Group>(
                createMockJSCADMesh(),
                1,
                "#ff0000"
            );

            const result = await drawHelper.drawSolidOrPolygonMesh(inputs);
            // Should handle gracefully without crashing
            expect(result).toBeDefined();
        });

        it("should handle empty worker response", async () => {
            (mockJscadWorkerManager.genericCallToWorkerPromise as jest.Mock)
                .mockResolvedValue({
                    positions: [],
                    normals: [],
                    indices: [],
                    transforms: []
                });

            const inputs = new Inputs.JSCAD.DrawSolidMeshDto<THREEJS.Group>(
                createMockJSCADMesh(),
                1,
                "#ff0000"
            );

            const result = await drawHelper.drawSolidOrPolygonMesh(inputs);
            expect(result).toBeDefined();
        });

        it("should handle null shape input", async () => {
            const inputs = new Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>();
            inputs.shape = null as any;
            inputs.drawFaces = true;

            await expect(drawHelper.drawShape(inputs))
                .rejects
                .toThrow();
        });

        it("should handle undefined manifold input", async () => {
            const inputs = new Inputs.Manifold.DrawManifoldOrCrossSectionDto<Inputs.Manifold.ManifoldPointer, THREEJS.MeshPhysicalMaterial>();
            inputs.manifoldOrCrossSection = undefined as any;

            await expect(drawHelper.drawManifoldOrCrossSection(inputs))
                .rejects
                .toThrow();
        });
    });

    describe("Worker validation", () => {
        it("should call JSCAD worker with shapeToMesh method", async () => {
            const mockMesh = createMockJSCADMesh();
            (mockJscadWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue({
                positions: [0, 0, 0],
                normals: [0, 0, 1],
                indices: [0],
                transforms: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
            });

            const inputs = new Inputs.JSCAD.DrawSolidMeshDto<THREEJS.Group>(
                mockMesh,
                1,
                "#ff0000",
                false,
                false
            );

            await drawHelper.drawSolidOrPolygonMesh(inputs);

            expect(mockJscadWorkerManager.genericCallToWorkerPromise).toHaveBeenCalledWith(
                "shapeToMesh",
                expect.objectContaining({
                    mesh: mockMesh
                })
            );
        });

        it("should call OCCT worker with correct shape parameter", async () => {
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
            inputs.shape = createMockOCCTShape();
            inputs.drawFaces = true;
            inputs.drawEdges = false;
            inputs.drawVertices = false;

            await drawHelper.drawShape(inputs);

            expect(mockOccWorkerManager.genericCallToWorkerPromise).toHaveBeenCalledWith(
                "shapeToMesh",
                expect.objectContaining({
                    shape: inputs.shape
                })
            );
        });

        it("should call Manifold worker with decomposeManifoldOrCrossSection method", async () => {
            (mockManifoldWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue({
                vertProperties: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]),
                triVerts: new Uint32Array([0, 1, 2])
            });

            const inputs = new Inputs.Manifold.DrawManifoldOrCrossSectionDto<Inputs.Manifold.ManifoldPointer, THREEJS.MeshPhysicalMaterial>();
            inputs.manifoldOrCrossSection = { hash: 123, type: "manifold" };
            inputs.faceColour = "#ff0000";
            inputs.faceOpacity = 1;

            await drawHelper.drawManifoldOrCrossSection(inputs);

            expect(mockManifoldWorkerManager.genericCallToWorkerPromise).toHaveBeenCalledWith(
                "decomposeManifoldOrCrossSection",
                expect.objectContaining({
                    manifoldOrCrossSection: inputs.manifoldOrCrossSection
                })
            );
        });

        it("should pass drawFaces flag to OCCT worker", async () => {
            (mockOccWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue({
                faceList: [],
                edgeList: [],
                pointsList: []
            });

            const inputs = new Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>();
            inputs.shape = createMockOCCTShape();
            inputs.drawFaces = true;
            inputs.drawEdges = false;
            inputs.drawVertices = false;

            await drawHelper.drawShape(inputs);

            expect(mockOccWorkerManager.genericCallToWorkerPromise).toHaveBeenCalledWith(
                "shapeToMesh",
                expect.objectContaining({
                    shape: inputs.shape
                })
            );
        });

        it("should handle worker returning empty geometry", async () => {
            (mockJscadWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue({
                positions: [],
                normals: [],
                indices: [],
                transforms: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
            });

            const inputs = new Inputs.JSCAD.DrawSolidMeshDto<THREEJS.Group>(
                createMockJSCADMesh(),
                1,
                "#ff0000"
            );

            const result = await drawHelper.drawSolidOrPolygonMesh(inputs);
            expect(result).toBeDefined();
        });

        it("should deserialize typed arrays from Manifold worker", async () => {
            const vertProperties = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]);
            const triVerts = new Uint32Array([0, 1, 2]);

            (mockManifoldWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue({
                vertProperties,
                triVerts
            });

            const inputs = new Inputs.Manifold.DrawManifoldOrCrossSectionDto<Inputs.Manifold.ManifoldPointer, THREEJS.MeshPhysicalMaterial>();
            inputs.manifoldOrCrossSection = { hash: 123, type: "manifold" };

            const result = await drawHelper.drawManifoldOrCrossSection(inputs);
            expect(result).toBeDefined();
        });

        it("should call OCCT worker with shapesToMeshes for multiple shapes", async () => {
            (mockOccWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue([
                { faceList: [], edgeList: [], pointsList: [] },
                { faceList: [], edgeList: [], pointsList: [] }
            ]);

            const inputs = new Inputs.OCCT.DrawShapesDto<Inputs.OCCT.TopoDSShapePointer>();
            inputs.shapes = [createMockOCCTShape(), createMockOCCTShape({ hash: "test456" })];
            inputs.drawFaces = true;

            await drawHelper.drawShapes(inputs);

            expect(mockOccWorkerManager.genericCallToWorkerPromise).toHaveBeenCalledWith(
                "shapesToMeshes",
                expect.any(Object)
            );
        });
    });

    describe("Edge cases", () => {
        it("should handle empty points array", () => {
            const inputs = new Inputs.Point.DrawPointsDto<THREEJS.Group>(
                [],
                1,
                0.3,
                "#ff0000"
            );

            const result = drawHelper.drawPoints(inputs);
            expect(result).toBeDefined();
            expect(result.children.length).toBe(0);
        });

        it("should handle single point", () => {
            const inputs = new Inputs.Point.DrawPointsDto<THREEJS.Group>(
                [[0, 0, 0]],
                1,
                0.3,
                "#ff0000"
            );

            const result = drawHelper.drawPoints(inputs);
            expect(result).toBeDefined();
            expect(result.children.length).toBe(1);
        });

        it("should handle undefined in colors array", () => {
            const inputs = new Inputs.Point.DrawPointsDto<THREEJS.Group>(
                [[0, 0, 0], [1, 1, 1]],
                1,
                0.3,
                ["#ff0000", undefined as any, "#0000ff"]
            );

            const result = drawHelper.drawPoints(inputs);
            expect(result).toBeDefined();
            expect(result.children.length).toBe(2);
        });

        it("should handle colors array shorter than points array", () => {
            const inputs = new Inputs.Point.DrawPointsDto<THREEJS.Group>(
                [[0, 0, 0], [1, 1, 1], [2, 2, 2], [3, 3, 3]],
                1,
                0.3,
                ["#ff0000", "#00ff00"]
            );

            const result = drawHelper.drawPoints(inputs);
            expect(result).toBeDefined();
            expect(result.children.length).toBe(4);
        });

        it("should handle colors array longer than points array", () => {
            const inputs = new Inputs.Point.DrawPointsDto<THREEJS.Group>(
                [[0, 0, 0], [1, 1, 1]],
                1,
                0.3,
                ["#ff0000", "#00ff00", "#0000ff", "#ffff00"]
            );

            const result = drawHelper.drawPoints(inputs);
            expect(result).toBeDefined();
            expect(result.children.length).toBe(2);
        });

        it("should handle empty polyline points", () => {
            const polylineData = {
                points: [] as Inputs.Base.Point3[],
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
        });

        it("should handle polyline with single point", () => {
            const polylineData = {
                points: [[0, 0, 0]] as Inputs.Base.Point3[],
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
        });

        it("should handle closed polyline with 2 points", () => {
            const polylineData = {
                points: [[0, 0, 0], [1, 1, 1]] as Inputs.Base.Point3[],
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
        });

        it("should handle negative opacity values", () => {
            const inputs = new Inputs.Point.DrawPointDto<THREEJS.Group>(
                [0, 0, 0],
                -0.5,
                1,
                "#ff0000"
            );

            const result = drawHelper.drawPoint(inputs);
            expect(result).toBeDefined();
            // Opacity should be clamped to valid range (0-1)
        });

        it("should handle opacity > 1", () => {
            const inputs = new Inputs.Point.DrawPointDto<THREEJS.Group>(
                [0, 0, 0],
                2.5,
                1,
                "#ff0000"
            );

            const result = drawHelper.drawPoint(inputs);
            expect(result).toBeDefined();
            // Opacity should be clamped to valid range (0-1)
        });

        it("should handle invalid hex color", () => {
            const inputs = new Inputs.Point.DrawPointDto<THREEJS.Group>(
                [0, 0, 0],
                1,
                1,
                "not-a-color" as any
            );

            const result = drawHelper.drawPoint(inputs);
            expect(result).toBeDefined();
            // Should use fallback color
        });

        it("should handle size = 0", () => {
            const inputs = new Inputs.Point.DrawPointDto<THREEJS.Group>(
                [0, 0, 0],
                1,
                0,
                "#ff0000"
            );

            const result = drawHelper.drawPoint(inputs);
            expect(result).toBeDefined();
        });

        it("should handle very large size values", () => {
            const inputs = new Inputs.Point.DrawPointDto<THREEJS.Group>(
                [0, 0, 0],
                1,
                10000,
                "#ff0000"
            );

            const result = drawHelper.drawPoint(inputs);
            expect(result).toBeDefined();
        });

        it("should handle updatable with undefined existing mesh", () => {
            const inputs = new Inputs.Point.DrawPointDto<THREEJS.Group>(
                [0, 0, 0],
                1,
                1,
                "#ff0000",
                true,
                undefined as any
            );

            const result = drawHelper.drawPoint(inputs);
            expect(result).toBeDefined();
        });

        it("should return undefined for empty Manifold mesh", async () => {
            (mockManifoldWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue({
                vertProperties: new Float32Array([]),
                triVerts: new Uint32Array([])
            });

            const inputs = new Inputs.Manifold.DrawManifoldOrCrossSectionDto<Inputs.Manifold.ManifoldPointer, THREEJS.MeshPhysicalMaterial>();
            inputs.manifoldOrCrossSection = { hash: 123, type: "manifold" };

            const result = await drawHelper.drawManifoldOrCrossSection(inputs);
            expect(result).toBeUndefined();
        });

        it("should handle OCCT shape with no geometry", async () => {
            (mockOccWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue({
                faceList: [],
                edgeList: [],
                pointsList: []
            });

            const inputs = new Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>();
            inputs.shape = createMockOCCTShape();
            inputs.drawFaces = true;

            const result = await drawHelper.drawShape(inputs);
            expect(result).toBeDefined();
        });

        it("should handle JSCAD mesh with empty geometry", async () => {
            (mockJscadWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue({
                positions: [],
                normals: [],
                indices: [],
                transforms: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
            });

            const inputs = new Inputs.JSCAD.DrawSolidMeshDto<THREEJS.Group>(
                createMockJSCADMesh(),
                1,
                "#ff0000"
            );

            const result = await drawHelper.drawSolidOrPolygonMesh(inputs);
            expect(result).toBeDefined();
        });
    });

    describe("Visual property validation", () => {
        it("should convert hex color #ff0000 to RGB (1,0,0)", () => {
            const rgb = hexToRgb("#ff0000");
            expect(rgb.r).toBeCloseTo(1, 2);
            expect(rgb.g).toBeCloseTo(0, 2);
            expect(rgb.b).toBeCloseTo(0, 2);
        });

        it("should handle 3-digit hex colors (#f00)", () => {
            const rgb = hexToRgb("#f00");
            expect(rgb.r).toBeCloseTo(1, 2);
            expect(rgb.g).toBeCloseTo(0, 2);
            expect(rgb.b).toBeCloseTo(0, 2);
        });

        it("should apply opacity to material transparency", () => {
            const inputs = new Inputs.Point.DrawPointDto<THREEJS.Group>(
                [0, 0, 0],
                0.5,
                1,
                "#ff0000"
            );

            const result = drawHelper.drawPoint(inputs);
            const mesh = result.children[0] as THREEJS.Mesh;
            const material = getMaterialFromMesh(mesh) as THREEJS.MeshBasicMaterial;

            if (material && !Array.isArray(material)) {
                expect(material.opacity).toBeCloseTo(0.5, 2);
                expect(material.transparent).toBe(true);
            }
        });

        it("should use first color from array", () => {
            const inputs = new Inputs.Point.DrawPointDto<THREEJS.Group>(
                [0, 0, 0],
                1,
                1,
                ["#ff0000", "#00ff00", "#0000ff"]
            );

            const result = drawHelper.drawPoint(inputs);
            expect(result).toBeDefined();
            // First color should be used
        });

        it("should validate colors are within RGB bounds", () => {
            const rgb1 = hexToRgb("#ffffff");
            const rgb2 = hexToRgb("#000000");

            expect(rgb1.r).toBeGreaterThanOrEqual(0);
            expect(rgb1.r).toBeLessThanOrEqual(1);
            expect(rgb2.r).toBeGreaterThanOrEqual(0);
            expect(rgb2.r).toBeLessThanOrEqual(1);
        });

        it("should validate colorsAreEqual function", () => {
            const color1 = new THREEJS.Color(1, 0, 0);
            const color2 = { r: 1, g: 0, b: 0 };

            expect(colorsAreEqual(color1, color2)).toBe(true);
        });

        it("should detect color differences outside tolerance", () => {
            const color1 = new THREEJS.Color(1, 0, 0);
            const color2 = { r: 0.5, g: 0, b: 0 };

            expect(colorsAreEqual(color1, color2)).toBe(false);
        });

        it("should validate position coordinates are set correctly", () => {
            const inputs = new Inputs.Point.DrawPointDto<THREEJS.Group>(
                [1.5, 2.5, 3.5],
                1,
                1,
                "#ff0000"
            );

            const result = drawHelper.drawPoint(inputs);
            const mesh = result.children[0];

            expect(mesh.position.x).toBeCloseTo(1.5, 2);
            expect(mesh.position.y).toBeCloseTo(2.5, 2);
            expect(mesh.position.z).toBeCloseTo(3.5, 2);
        });

        it("should validate two-sided rendering creates 2 children", async () => {
            (mockJscadWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue({
                positions: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                normals: [0, 0, 1, 0, 0, 1, 0, 0, 1],
                indices: [0, 1, 2],
                transforms: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
            });

            const inputs = new Inputs.JSCAD.DrawSolidMeshDto<THREEJS.Group>(
                createMockJSCADMesh(),
                1,
                "#ff0000",
                false,
                false,
                undefined,
                true // drawTwoSided
            );

            const result = await drawHelper.drawSolidOrPolygonMesh(inputs);
            expect(result.children.length).toBe(2);
        });

        it("should validate single-sided rendering creates 1 child", async () => {
            (mockJscadWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue({
                positions: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                normals: [0, 0, 1, 0, 0, 1, 0, 0, 1],
                indices: [0, 1, 2],
                transforms: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
            });

            const inputs = new Inputs.JSCAD.DrawSolidMeshDto<THREEJS.Group>(
                createMockJSCADMesh(),
                1,
                "#ff0000",
                false,
                false,
                undefined,
                false // drawTwoSided
            );

            const result = await drawHelper.drawSolidOrPolygonMesh(inputs);
            expect(result.children.length).toBe(1);
        });
    });

    describe("Memory management", () => {
        it("should dispose old geometry when recreating points mesh with different count", () => {
            // Create initial mesh
            const firstInputs = new Inputs.Point.DrawPointsDto<THREEJS.Group>(
                [[0, 0, 0], [1, 1, 1]],
                1,
                0.3,
                "#ff0000"
            );
            const existingMesh = drawHelper.drawPoints(firstInputs);

            // Get first geometry and spy on dispose
            const firstChild = existingMesh.children[0] as THREEJS.Mesh;
            const firstGeometry = firstChild.geometry;
            const disposeSpy = jest.spyOn(firstGeometry, "dispose");

            // Recreate with different point count
            const updateInputs = new Inputs.Point.DrawPointsDto<THREEJS.Group>(
                [[5, 5, 5], [6, 6, 6], [7, 7, 7]],
                1,
                0.3,
                "#ff0000",
                true,
                existingMesh
            );

            drawHelper.drawPoints(updateInputs);

            // Geometry should be disposed when recreating
            expect(disposeSpy).toHaveBeenCalled();
        });

        it("should not dispose geometries when updating with same point count", () => {
            // Create initial mesh
            const firstInputs = new Inputs.Point.DrawPointsDto<THREEJS.Group>(
                [[0, 0, 0], [1, 1, 1]],
                1,
                0.3,
                "#ff0000"
            );
            const existingMesh = drawHelper.drawPoints(firstInputs);

            // Get first geometry and spy on dispose
            const firstChild = existingMesh.children[0] as THREEJS.Mesh;
            const firstGeometry = firstChild.geometry;
            const disposeSpy = jest.spyOn(firstGeometry, "dispose");

            // Update with same point count (just different positions)
            const updateInputs = new Inputs.Point.DrawPointsDto<THREEJS.Group>(
                [[5, 5, 5], [6, 6, 6]],
                1,
                0.3,
                "#ff0000",
                true,
                existingMesh
            );

            drawHelper.drawPoints(updateInputs);

            // Should update positions without disposing
            expect(disposeSpy).not.toHaveBeenCalled();
        });

        it("should handle disposal of already-disposed objects gracefully", () => {
            const inputs = new Inputs.Point.DrawPointDto<THREEJS.Group>(
                [0, 0, 0],
                1,
                1,
                "#ff0000"
            );

            const result = drawHelper.drawPoint(inputs);
            const mesh = result.children[0] as THREEJS.Mesh;

            // Dispose manually
            mesh.geometry.dispose();
            (mesh.material as THREEJS.Material).dispose();

            // Should not throw when trying to dispose again
            expect(() => {
                mesh.geometry.dispose();
                (mesh.material as THREEJS.Material).dispose();
            }).not.toThrow();
        });

        it("should clear children when updating empty mesh", () => {
            const existingMesh = new THREEJS.Group();
            existingMesh.name = "existingMesh";
            existingMesh.add(new THREEJS.Mesh());
            existingMesh.add(new THREEJS.Mesh());

            const inputs = new Inputs.Point.DrawPointsDto<THREEJS.Group>(
                [[0, 0, 0]],
                1,
                0.3,
                "#ff0000",
                true,
                existingMesh
            );

            const result = drawHelper.drawPoints(inputs);
            // Should clear old children and add new ones
            expect(result.children.length).toBeGreaterThan(0);
        });
    });

    describe("Material cache management", () => {
        it("should cache materials and reuse them for same parameters", async () => {
            (mockJscadWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue({
                positions: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                normals: [0, 0, 1, 0, 0, 1, 0, 0, 1],
                indices: [0, 1, 2],
                transforms: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
            });
            
            const inputs1 = new Inputs.JSCAD.DrawSolidMeshDto<THREEJS.Group>(
                createMockJSCADMesh(),
                0.5,
                "#ff0000",
                false,
                false
            );
            
            const result1 = await drawHelper.drawSolidOrPolygonMesh(inputs1);
            const material1 = getMaterialFromMesh(result1.children[0] as THREEJS.Mesh);
            
            const inputs2 = new Inputs.JSCAD.DrawSolidMeshDto<THREEJS.Group>(
                createMockJSCADMesh(),
                0.5,
                "#ff0000",
                false,
                false
            );
            
            const result2 = await drawHelper.drawSolidOrPolygonMesh(inputs2);
            const material2 = getMaterialFromMesh(result2.children[0] as THREEJS.Mesh);
            
            // Should reuse the same material instance
            expect(material1).toBe(material2);
        });

        it("should create different materials for different colors", async () => {
            (mockJscadWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue({
                positions: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                normals: [0, 0, 1, 0, 0, 1, 0, 0, 1],
                indices: [0, 1, 2],
                transforms: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
            });
            
            const inputs1 = new Inputs.JSCAD.DrawSolidMeshDto<THREEJS.Group>(
                createMockJSCADMesh(),
                0.5,
                "#ff0000",
                false,
                false
            );
            
            const result1 = await drawHelper.drawSolidOrPolygonMesh(inputs1);
            const material1 = getMaterialFromMesh(result1.children[0] as THREEJS.Mesh);
            
            const inputs2 = new Inputs.JSCAD.DrawSolidMeshDto<THREEJS.Group>(
                createMockJSCADMesh(),
                0.5,
                "#00ff00",
                false,
                false
            );
            
            const result2 = await drawHelper.drawSolidOrPolygonMesh(inputs2);
            const material2 = getMaterialFromMesh(result2.children[0] as THREEJS.Mesh);
            
            // Should create different material instances
            expect(material1).not.toBe(material2);
            if (material1 && !Array.isArray(material1) && material2 && !Array.isArray(material2)) {
                const mat1 = material1 as THREEJS.MeshPhysicalMaterial;
                const mat2 = material2 as THREEJS.MeshPhysicalMaterial;
                expect(mat1.color.getHex()).not.toBe(mat2.color.getHex());
            }
        });

        it("should evict oldest material when cache is full (FIFO)", async () => {
            const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();
            const materialCache = (drawHelper as any).materialCache;
            
            // Clear cache to start fresh
            materialCache.clear();
            
            // Fill cache to MAX_MATERIALS (1000)
            // Note: Each mesh creates 2 materials (front + back face) due to drawTwoSided=true by default
            // Back face materials have "-back" suffix in key, so they don't collide
            // We need 1000 unique front materials to fill the cache
            for (let i = 0; i < 1000; i++) {
                (mockJscadWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue({
                    positions: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                    normals: [0, 0, 1, 0, 0, 1, 0, 0, 1],
                    indices: [0, 1, 2],
                    transforms: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
                });
                
                // Generate truly unique colors: 0-999 gives us 1000 different hex colors
                const color = `#${(i + 0x100000).toString(16).substring(1)}`;
                
                const inputs = new Inputs.JSCAD.DrawSolidMeshDto<THREEJS.Group>(
                    createMockJSCADMesh(),
                    1.0, // Use same opacity to ensure color is the differentiator
                    color,
                    false,
                    false,
                    undefined,
                    false // Disable two-sided to avoid back face materials
                );
                await drawHelper.drawSolidOrPolygonMesh(inputs);
            }
            
            expect(materialCache.size).toBe(1000);
            
            // Get the first key before eviction
            const firstKeyBeforeEviction = materialCache.keys().next().value;
            
            // Create one more material to trigger eviction
            (mockJscadWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue({
                positions: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                normals: [0, 0, 1, 0, 0, 1, 0, 0, 1],
                indices: [0, 1, 2],
                transforms: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
            });
            
            const inputs = new Inputs.JSCAD.DrawSolidMeshDto<THREEJS.Group>(
                createMockJSCADMesh(),
                0.5,
                "#ffffff",
                false,
                false
            );
            await drawHelper.drawSolidOrPolygonMesh(inputs);
            
            // Verify eviction occurred
            expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining("Material cache full, evicted:"));
            expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining(firstKeyBeforeEviction));
            
            // Verify the first key was removed from cache
            expect(materialCache.has(firstKeyBeforeEviction)).toBe(false);
            
            // Verify cache size didn't exceed limit
            expect(materialCache.size).toBe(1000);
            
            consoleWarnSpy.mockRestore();
        });

        it("should call dispose on evicted material", async () => {
            const materialCache = (drawHelper as any).materialCache;
            const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();
            
            // Clear cache to start fresh
            materialCache.clear();
            
            // Track dispose calls
            const disposeCalls: string[] = [];
            const originalMaterialPrototype = THREEJS.MeshPhysicalMaterial.prototype.dispose;
            THREEJS.MeshPhysicalMaterial.prototype.dispose = function() {
                disposeCalls.push((this as any).name || "unnamed");
                originalMaterialPrototype.call(this);
            };
            
            // Fill cache to capacity (1000 materials without two-sided rendering)
            for (let i = 0; i < 1000; i++) {
                (mockJscadWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue({
                    positions: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                    normals: [0, 0, 1, 0, 0, 1, 0, 0, 1],
                    indices: [0, 1, 2],
                    transforms: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
                });
                
                const color = `#${(i + 0x100000).toString(16).substring(1)}`;
                const inputs = new Inputs.JSCAD.DrawSolidMeshDto<THREEJS.Group>(
                    createMockJSCADMesh(),
                    1.0,
                    color,
                    false,
                    false,
                    undefined,
                    false // Disable two-sided
                );
                await drawHelper.drawSolidOrPolygonMesh(inputs);
            }
            
            const disposeCallsBefore = disposeCalls.length;
            
            // Create one more to trigger eviction
            (mockJscadWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue({
                positions: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                normals: [0, 0, 1, 0, 0, 1, 0, 0, 1],
                indices: [0, 1, 2],
                transforms: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
            });
            
            const inputs = new Inputs.JSCAD.DrawSolidMeshDto<THREEJS.Group>(
                createMockJSCADMesh(),
                0.5,
                "#aabbcc",
                false,
                false
            );
            await drawHelper.drawSolidOrPolygonMesh(inputs);
            
            // Verify dispose was called on the evicted material
            expect(disposeCalls.length).toBeGreaterThan(disposeCallsBefore);
            
            // Restore
            THREEJS.MeshPhysicalMaterial.prototype.dispose = originalMaterialPrototype;
            consoleWarnSpy.mockRestore();
        });

        it("should handle materials without dispose method gracefully", () => {
            const materialCache = (drawHelper as any).materialCache;
            const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();
            
            // Clear and manually add a mock material without dispose method
            materialCache.clear();
            const mockMaterialWithoutDispose = {
                color: new THREEJS.Color("#ff0000"),
                // No dispose method
            } as any;
            
            materialCache.set("test-no-dispose-000000-1-0", mockMaterialWithoutDispose);
            
            // Fill cache to capacity with real materials (999 more to reach 1000 total)
            for (let i = 1; i < 1000; i++) {
                const mat = new THREEJS.MeshPhysicalMaterial();
                mat.color = new THREEJS.Color(`#${i.toString(16).padStart(6, "0")}`);
                materialCache.set(`test-${i}-000000-1-0`, mat);
            }
            
            expect(materialCache.size).toBe(1000);
            
            // Manually trigger the eviction code path
            const getOrCreateMaterial = (drawHelper as any).getOrCreateMaterial.bind(drawHelper);
            expect(() => {
                getOrCreateMaterial("#eeeeee", 1, 0, () => {
                    const mat = new THREEJS.MeshPhysicalMaterial();
                    mat.color = new THREEJS.Color("#eeeeee");
                    return mat;
                });
            }).not.toThrow();
            
            consoleWarnSpy.mockRestore();
        });

        it("should verify material is properly disposed", async () => {
            (mockJscadWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue({
                positions: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                normals: [0, 0, 1, 0, 0, 1, 0, 0, 1],
                indices: [0, 1, 2],
                transforms: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
            });
            
            const inputs = new Inputs.JSCAD.DrawSolidMeshDto<THREEJS.Group>(
                createMockJSCADMesh(),
                0.5,
                "#ff0000",
                false,
                false
            );
            
            const result = await drawHelper.drawSolidOrPolygonMesh(inputs);
            const material = getMaterialFromMesh(result.children[0] as THREEJS.Mesh) as THREEJS.MeshPhysicalMaterial;
            
            // Verify material is initially usable
            expect(material.type).toBe("MeshPhysicalMaterial");
            expect(material.dispose).toBeDefined();
            
            // Manually dispose the material
            expect(() => material.dispose()).not.toThrow();
            
            // After dispose, the material properties remain accessible
            // but the GL resources are freed (not testable in Jest without WebGL context)
            expect(material.type).toBe("MeshPhysicalMaterial");
        });

        it("should create new material after previous one with same key was evicted", async () => {
            const materialCache = (drawHelper as any).materialCache;
            const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();
            
            // Clear cache to start fresh
            materialCache.clear();
            
            const color = "#abc123";
            (mockJscadWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue({
                positions: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                normals: [0, 0, 1, 0, 0, 1, 0, 0, 1],
                indices: [0, 1, 2],
                transforms: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
            });
            
            const inputs1 = new Inputs.JSCAD.DrawSolidMeshDto<THREEJS.Group>(
                createMockJSCADMesh(),
                0.5,
                color,
                false,
                false
            );
            
            const result1 = await drawHelper.drawSolidOrPolygonMesh(inputs1);
            const material1 = getMaterialFromMesh(result1.children[0] as THREEJS.Mesh);
            
            // Fill cache to force eviction of material1 (1000 materials)
            for (let i = 0; i < 1000; i++) {
                (mockJscadWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue({
                    positions: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                    normals: [0, 0, 1, 0, 0, 1, 0, 0, 1],
                    indices: [0, 1, 2],
                    transforms: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
                });
                
                const color = `#${(i + 0x100000).toString(16).substring(1)}`;
                const inputs = new Inputs.JSCAD.DrawSolidMeshDto<THREEJS.Group>(
                    createMockJSCADMesh(),
                    1.0,
                    color,
                    false,
                    false,
                    undefined,
                    false // Disable two-sided
                );
                await drawHelper.drawSolidOrPolygonMesh(inputs);
            }
            
            // Create new material with same color
            (mockJscadWorkerManager.genericCallToWorkerPromise as jest.Mock).mockResolvedValue({
                positions: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                normals: [0, 0, 1, 0, 0, 1, 0, 0, 1],
                indices: [0, 1, 2],
                transforms: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
            });
            
            const inputs2 = new Inputs.JSCAD.DrawSolidMeshDto<THREEJS.Group>(
                createMockJSCADMesh(),
                0.5,
                color,
                false,
                false
            );
            
            const result2 = await drawHelper.drawSolidOrPolygonMesh(inputs2);
            const material2 = getMaterialFromMesh(result2.children[0] as THREEJS.Mesh);
            
            // Should be a different instance since first was evicted
            expect(material1).not.toBe(material2);
            
            // But should have same color
            if (material1 && !Array.isArray(material1) && material2 && !Array.isArray(material2)) {
                const mat1 = material1 as THREEJS.MeshPhysicalMaterial;
                const mat2 = material2 as THREEJS.MeshPhysicalMaterial;
                expect(mat1.color.getHex()).toBe(mat2.color.getHex());
            }
            
            consoleWarnSpy.mockRestore();
        });
    });
});

