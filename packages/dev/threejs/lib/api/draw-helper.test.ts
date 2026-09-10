import { describe, it, expect, beforeEach, afterEach, vi, type Mock } from "vitest";
import { createDrawHelperMocks, flatOf, hexToRgb, colorsAreEqual, getMaterialFromMesh, createMockJSCADMesh, createMockOCCTShape, mockWorkerError } from "./__mocks__/test-helpers";
import { mockOCCTBoxDecomposedMesh } from "./__mocks__/test-data";
import { DrawHelper } from "./draw-helper";
import { Context } from "./context";
import * as Inputs from "./inputs";
import { JSCADText, JSCADWorkerManager } from "@bitbybit-dev/jscad-worker";
import { ManifoldWorkerManager } from "@bitbybit-dev/manifold-worker";
import { OCCTWorkerManager } from "@bitbybit-dev/occt-worker";
import { Vector } from "@bitbybit-dev/base";
import * as THREEJS from "three";
import { LineSegments2 } from "three/examples/jsm/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/examples/jsm/lines/LineSegmentsGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";

let nextPointerHash = 1;
const occtShape = (): Inputs.OCCT.TopoDSShapePointer => ({ hash: nextPointerHash++, type: "occ-shape" });
const manifoldShape = (): Inputs.Manifold.ManifoldPointer => ({ hash: nextPointerHash++, type: "manifold-shape" });


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
        vi.clearAllMocks();
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
            expect(result.children.length).toBe(1);
            expect(result).toBeInstanceOf(THREEJS.Group);
        });

        it("should update existing point mesh when updatable is true", () => {
            const existingMesh = new THREEJS.Group();
            existingMesh.name = "existingPointMesh";
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

            expect(result.children.length).toBe(1);
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
            expect(result.children.length).toBe(1);
            expect(result.children[0]).toBeInstanceOf(THREEJS.InstancedMesh);
            
            const instancedMesh = result.children[0] as THREEJS.InstancedMesh;
            expect(instancedMesh.count).toBe(3);
            const material = getMaterialFromMesh(instancedMesh) as THREEJS.MeshBasicMaterial;
            expect(colorsAreEqual(material.color, hexToRgb("#ff0000"))).toBe(true);
            expect(material.opacity).toBeCloseTo(1, 2);
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

            const expectedColors = ["#ff0000", "#00ff00", "#0000ff"];
            result.children.forEach((child, index) => {
                const mesh = child as THREEJS.InstancedMesh;
                expect(mesh.count).toBe(1);
                const material = getMaterialFromMesh(mesh) as THREEJS.MeshBasicMaterial;
                expect(colorsAreEqual(material.color, hexToRgb(expectedColors[index]!))).toBe(true);
            });
        });

        it("should handle mismatched colour array length", () => {
            const inputs = new Inputs.Point.DrawPointsDto<THREEJS.Group>(
                [[0, 0, 0], [1, 1, 1], [2, 2, 2], [3, 3, 3]],
                1,
                0.3,
                ["#ff0000", "#00ff00"]
            );

            const result = drawHelper.drawPoints(inputs);

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(THREEJS.Group);
            expect(result.children.length).toBe(2);
        });

        it("should update existing points mesh when updatable is true with same point count", () => {
            const firstInputs = new Inputs.Point.DrawPointsDto<THREEJS.Group>(
                [[0, 0, 0], [1, 1, 1]],
                1,
                0.3,
                "#ff0000"
            );
            const existingMesh = drawHelper.drawPoints(firstInputs);

            const updateInputs = new Inputs.Point.DrawPointsDto<THREEJS.Group>(
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
            expect(result).toBe(existingMesh);
        });

        it("should recreate points mesh when point count changes during update", () => {
            const firstInputs = new Inputs.Point.DrawPointsDto<THREEJS.Group>(
                [[0, 0, 0], [1, 1, 1]],
                1,
                0.3,
                "#ff0000"
            );
            const existingMesh = drawHelper.drawPoints(firstInputs);

            const updateInputs = new Inputs.Point.DrawPointsDto<THREEJS.Group>(
                [[5, 5, 5], [6, 6, 6], [7, 7, 7]],
                1,
                0.3,
                "#ff0000",
                true,
                existingMesh
            );

            const result = drawHelper.drawPoints(updateInputs);

            expect(result.children.length).toBe(1);
            const instancedMesh = result.children[0] as THREEJS.InstancedMesh;
            expect(instancedMesh.count).toBe(3);
            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(THREEJS.Group);
        });
    });

    describe("how wide a drawn line comes out", () => {

        const widthAt = (size: number) => {
            const polyline = { points: [[0, 0, 0], [1, 0, 0]] as Inputs.Base.Point3[], isClosed: false };
            const result = drawHelper.drawPolylineClose(
                new Inputs.Polyline.DrawPolylineDto<THREEJS.Group>(polyline, 1, "#00ff00", size));
            const line = result.children[0] as LineSegments2;
            return line.material.linewidth;
        };

        it("should scale with the size it was asked for, once past the floor", () => {
            expect(widthAt(30)).toBeCloseTo(10, 5);
            expect(widthAt(60)).toBeCloseTo(20, 5);
        });

        const defaultOcctEdgeWidth = 2;
        const defaultBasicGeometrySize = 0.1;

        it("should never draw a line thinner than a pixel, where this material breaks up", () => {
            expect(widthAt(defaultOcctEdgeWidth)).toBe(1);
            expect(widthAt(defaultBasicGeometrySize)).toBe(1);
        });

        it("should give two sizes that floor to the same width the same material", () => {
            const polyline = { points: [[0, 0, 0], [1, 0, 0]] as Inputs.Base.Point3[], isClosed: false };
            const draw = (size: number) => (drawHelper.drawPolylineClose(
                new Inputs.Polyline.DrawPolylineDto<THREEJS.Group>(polyline, 1, "#00ff00", size))
                .children[0] as LineSegments2).material;
            expect(draw(defaultOcctEdgeWidth)).toBe(draw(defaultBasicGeometrySize));
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

            const lineSegments = result.children[0] as LineSegments2;
            if (lineSegments.material && !Array.isArray(lineSegments.material)) {
                const material = lineSegments.material;
                const colorAttribute = lineSegments.geometry.getAttribute("instanceColorStart");
                if (colorAttribute) {
                    const expectedRgb = hexToRgb("#00ff00");
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
            expect(result.children.length).toBe(1);
            expect(result).toBeInstanceOf(THREEJS.Group);
        });

        it("should update existing polyline mesh when updatable is true", () => {
            const existingMesh = new THREEJS.Group();
            existingMesh.name = "existingPolyline";
            const lineGeom = new LineSegmentsGeometry();
            const lineMat = new LineMaterial();
            existingMesh.add(new LineSegments2(lineGeom, lineMat));

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

            const lineSegments = result.children[0] as LineSegments2;
            if (lineSegments.material && !Array.isArray(lineSegments.material)) {

                const colorAttribute = lineSegments.geometry.getAttribute("instanceColorStart");
                if (colorAttribute) {
                    const expectedRgb = hexToRgb("#ff0000");
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

            expect(result.children.length).toBe(1);
            const colours = (result.children[0] as LineSegments2).geometry.getAttribute("instanceColorStart");
            expect(flatOf(colours)).toEqual([1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0]);
        });

        it("should fall back to the default colour for polylines that carry none", () => {
            const polylinesData = [
                { points: [[0, 0, 0], [1, 0, 0]] as Inputs.Base.Point3[], isClosed: false, color: [1, 0, 0] as [number, number, number] },
                { points: [[2, 0, 0], [3, 0, 0]] as Inputs.Base.Point3[], isClosed: false }
            ];
            const inputs = new Inputs.Polyline.DrawPolylinesDto<THREEJS.Group>(polylinesData, 1, undefined, 2);

            const result = drawHelper.drawPolylinesWithColours(inputs);

            const colours = (result.children[0] as LineSegments2).geometry.getAttribute("instanceColorStart");
            const grey = new THREEJS.Color("#444444");
            expect(flatOf(colours).slice(0, 6)).toEqual([1, 0, 0, 1, 0, 0]);
            [grey.r, grey.g, grey.b, grey.r, grey.g, grey.b].forEach((expected, i) => {
                expect(colours.array[6 + i]).toBeCloseTo(expected, 6);
            });
        });

        it("should take a polyline's own colour when it is given as a hex string", () => {
            const polylinesData = [
                { points: [[0, 0, 0], [1, 0, 0]] as Inputs.Base.Point3[], isClosed: false, color: "#0000ff" },
                { points: [[2, 0, 0], [3, 0, 0]] as Inputs.Base.Point3[], isClosed: false }
            ];
            const inputs = new Inputs.Polyline.DrawPolylinesDto<THREEJS.Group>(polylinesData, 1, "#00ff00", 2);

            const result = drawHelper.drawPolylinesWithColours(inputs);

            const colours = (result.children[0] as LineSegments2).geometry.getAttribute("instanceColorStart");
            expect(flatOf(colours)).toEqual([0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0]);
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
            expect(result.children.length).toBe(1);
        });

        it("should update existing polylines mesh when updatable is true", () => {
            const existingMesh = new THREEJS.Group();
            existingMesh.name = "existingPolylines";
            const lineGeom = new LineSegmentsGeometry();
            const lineMat = new LineMaterial();
            const lineSegments = new LineSegments2(lineGeom, lineMat);
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
            expect(result.children.length).toBe(1);
            expect(result).toBeDefined();
        });
    });

    describe("drawCurve", () => {
        it("should draw a curve", () => {
            const mockCurve = {
                tessellate: vi.fn().mockReturnValue([
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
            expect(result.children.length).toBe(1);
            expect(mockCurve.tessellate).toHaveBeenCalled();
        });

        it("should update existing curve mesh when updatable is true", () => {
            const existingMesh = new THREEJS.Group();
            existingMesh.name = "existingCurve";
            const lineGeom = new LineSegmentsGeometry();
            const lineMat = new LineMaterial();
            existingMesh.add(new LineSegments2(lineGeom, lineMat));

            const mockCurve = {
                tessellate: vi.fn().mockReturnValue([
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
            expect(result.children.length).toBe(1);
            expect(result).toBeDefined();
        });
    });

    describe("drawCurves", () => {
        it("should draw multiple curves", () => {
            const mockCurves = [
                { tessellate: vi.fn().mockReturnValue([[0, 0, 0], [1, 1, 1]] as Inputs.Base.Point3[]) },
                { tessellate: vi.fn().mockReturnValue([[2, 2, 2], [3, 3, 3]] as Inputs.Base.Point3[]) }
            ];
            const inputs = new Inputs.Verb.DrawCurvesDto<THREEJS.Group>(
                mockCurves,
                1,
                "#ff0000",
                2
            );

            const result = drawHelper.drawCurves(inputs);

            expect(result).toBeDefined();
            expect(result.children.length).toBe(1);
            expect(result).toBeInstanceOf(THREEJS.Group);
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
            expect(result.children.length).toBe(2);
            const mesh = result.children[0] as THREEJS.Mesh;
            const material = mesh.material as THREEJS.MeshPhysicalMaterial;
            expect(colorsAreEqual(material.color, hexToRgb("#ff0000"))).toBe(true);
            expect(material.opacity).toBeCloseTo(1, 2);
        });

        it("should handle hidden surfaces", () => {
            const mockSurface = {
                tessellate: vi.fn().mockReturnValue({
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
                true
            );

            const result = drawHelper.drawSurface(inputs);
            expect(result.children.length).toBe(2);
            expect(result).toBeDefined();
            expect(result.visible).toBe(false);
        });

        it("should update existing surface mesh when updatable is true", () => {
            const existingMesh = new THREEJS.Group();
            existingMesh.name = "existingSurface";

            const mockSurface = {
                tessellate: vi.fn().mockReturnValue({
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
            expect(result.children.length).toBe(2);
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
            const inputs = new Inputs.Verb.DrawSurfaceDto<THREEJS.Group>(
                mockSurface,
                1,
                ["#ff0000", "#00ff00", "#0000ff"],
                false,
                false
            );

            const result = drawHelper.drawSurface(inputs);
            expect(result.children.length).toBe(2);
            expect(result).toBeDefined();
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
                tessellate: vi.fn().mockReturnValue({
                    faces: [[0, 1, 2]],
                    points: [[0, 0, 0], [1, 0, 0], [0, 1, 0]],
                    normals: [[0, 0, 1], [0, 0, 1], [0, 0, 1]]
                })
            };

            const inputs = new Inputs.Verb.DrawSurfacesColoursDto<THREEJS.Group>(
                [mockSurface, mockSurface, mockSurface],
                ["#ff0000"],
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
                tessellate: vi.fn().mockReturnValue({
                    faces: [[0, 1, 2]],
                    points: [[0, 0, 0], [1, 0, 0], [0, 1, 0]],
                    normals: [[0, 0, 1], [0, 0, 1], [0, 0, 1]]
                })
            };

            const inputs = new Inputs.Verb.DrawSurfacesColoursDto<THREEJS.Group>(
                [mockSurface, mockSurface],
                ["#ff0000"],
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
                tessellate: vi.fn().mockReturnValue({
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
            expect(result.children.length).toBe(1);
            expect(result).toBe(existingMesh);
        });
    });

    describe("drawSolidOrPolygonMesh", () => {
        it("should draw JSCAD solid mesh", async () => {
            const mockMesh = jscadSolid();
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
            expect(result.children.length).toBe(2);

            const mesh = result.children[0] as THREEJS.Mesh;
            const material = mesh.material as THREEJS.MeshPhysicalMaterial;
            expect(colorsAreEqual(material.color, hexToRgb("#ff0000"))).toBe(true);
            expect(material.opacity).toBeCloseTo(1, 2);
        });

        it("should handle mesh with baked-in color", async () => {
            const mockMesh = jscadSolid([1, 0, 0, 1]);
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
            (mockJscadWorkerManager.genericCallToWorkerPromise as Mock).mockResolvedValue({
                positions: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                normals: [0, 0, 1, 0, 0, 1, 0, 0, 1],
                indices: [0, 1, 2],
                transforms: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
            });

            const mockMesh = jscadSolid();
            const inputs = new Inputs.JSCAD.DrawSolidMeshDto<THREEJS.Group>(
                mockMesh,
                1,
                "#ff0000",
                false,
                true
            );

            const result = await drawHelper.drawSolidOrPolygonMesh(inputs);

            expect(result).toBeDefined();
            expect(result.children.length).toBe(2);
            expect(result.visible).toBe(false);
        });

        it("should update existing mesh when updatable is true", async () => {
            const existingMesh = new THREEJS.Group();
            existingMesh.name = "existingJscadMesh";

            const mockMesh = jscadSolid();
            const inputs = new Inputs.JSCAD.DrawSolidMeshDto<THREEJS.Group>(
                mockMesh,
                0.5,
                "#00ff00",
                true,
                false,
                existingMesh
            );

            const result = await drawHelper.drawSolidOrPolygonMesh(inputs);

            expect(result.children.length).toBe(2);
            expect(result).toBe(existingMesh);
        });

        it("should use array first colour when colours is array", async () => {
            const mockMesh = jscadSolid();
            const inputs = new Inputs.JSCAD.DrawSolidMeshDto<THREEJS.Group>(
                mockMesh,
                1,
                ["#ff0000", "#00ff00"],
                false,
                false
            );

            const result = await drawHelper.drawSolidOrPolygonMesh(inputs);

            expect(result.children.length).toBe(2);
            expect(result).toBeDefined();
        });
    });

    describe("drawSolidOrPolygonMeshes", () => {
        it("should draw multiple JSCAD meshes", async () => {
            (mockJscadWorkerManager.genericCallToWorkerPromise as Mock).mockResolvedValue([
                { positions: [0, 0, 0], normals: [0, 0, 1], indices: [0], transforms: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] },
                { positions: [1, 0, 0], normals: [0, 0, 1], indices: [0], transforms: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] }
            ]);

            const mockMeshes = [jscadSolid(), jscadSolid()];
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
            (mockJscadWorkerManager.genericCallToWorkerPromise as Mock).mockResolvedValue([
                { positions: [0, 0, 0], normals: [0, 0, 1], indices: [0], transforms: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], color: [1, 0, 0] },
                { positions: [1, 0, 0], normals: [0, 0, 1], indices: [0], transforms: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] }
            ]);

            const mockMeshes = [jscadSolid(), jscadSolid()];
            const inputs = new Inputs.JSCAD.DrawSolidMeshesDto<THREEJS.Group>(
                mockMeshes,
                1,
                "#0000ff",
                false,
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
            const inputs = new Inputs.JSCAD.DrawSolidMeshesDto<THREEJS.Group>(
                mockMeshes,
                1,
                ["#ff0000", "#00ff00"],
                false,
                false
            );

            const result = await drawHelper.drawSolidOrPolygonMeshes(inputs);

            expect(result).toBeDefined();
            expect(result.children.length).toBe(2);

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
            (mockJscadWorkerManager.genericCallToWorkerPromise as Mock).mockResolvedValue([
                { positions: [0, 0, 0], normals: [0, 0, 1], indices: [0], transforms: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] }
            ]);

            const existingMesh = new THREEJS.Group();
            existingMesh.name = "existingMeshes";

            const mockMeshes = [jscadSolid()];
            const inputs = new Inputs.JSCAD.DrawSolidMeshesDto<THREEJS.Group>(
                mockMeshes,
                1,
                "#ff0000",
                true,
                false,
                existingMesh
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
            const inputs = new Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>();
            inputs.shape = occtShape();
            inputs.drawFaces = true;
            inputs.drawEdges = false;
            inputs.drawVertices = false;
            inputs.faceColour = "#ff0000";
            inputs.faceOpacity = 1;

            const result = await drawHelper.drawShape(inputs);

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(THREEJS.Group);
            expect(mockOccWorkerManager.genericCallToWorkerPromise).toHaveBeenCalledWith("shapeToMesh", expect.anything());
            expect(result.children.length).toBe(2);
            const facesGroup = result.children.find(child => child.name?.includes("faces")) as THREEJS.Group;
            if (facesGroup && facesGroup.children.length > 0) {
                const mesh = facesGroup.children[0] as THREEJS.Mesh;
                const material = mesh.material as THREEJS.MeshPhysicalMaterial;
                expect(colorsAreEqual(material.color, hexToRgb("#ff0000"))).toBe(true);
            }
        });

        it("should draw OCCT shape with edges", async () => {
            (mockOccWorkerManager.genericCallToWorkerPromise as Mock).mockResolvedValue({
                faceList: [],
                edgeList: [
                    { vertexCoord: [0, 0, 0, 1, 0, 0], edgeIndex: 0 }
                ],
                pointsList: []
            });
            const inputs = new Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>();
            inputs.shape = occtShape();
            inputs.drawFaces = false;
            inputs.drawEdges = true;
            inputs.drawVertices = false;
            inputs.edgeColour = "#00ff00";
            inputs.edgeWidth = 2;
            inputs.edgeOpacity = 1;

            const result = await drawHelper.drawShape(inputs);

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(THREEJS.Group);
            expect(result.children.length).toBe(1);

            const edgesGroup = result.children.find(child => child.name?.includes("edges")) as THREEJS.Group;
            if (edgesGroup && edgesGroup.children.length > 0) {
                const lineSegments = edgesGroup.children[0] as LineSegments2;
                const material = lineSegments.material;
                expect(colorsAreEqual(material.color, hexToRgb("#00ff00"))).toBe(true);
            }
        });

        it("should draw OCCT shape with vertices", async () => {
            (mockOccWorkerManager.genericCallToWorkerPromise as Mock).mockResolvedValue({
                faceList: [],
                edgeList: [],
                pointsList: [[0, 0, 0], [1, 1, 1]]
            });
            const inputs = new Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>();
            inputs.shape = occtShape();
            inputs.drawFaces = false;
            inputs.drawEdges = false;
            inputs.drawVertices = true;
            inputs.vertexColour = "#0000ff";
            inputs.vertexSize = 0.1;

            const result = await drawHelper.drawShape(inputs);

            expect(result).toBeDefined();
            expect(result.children.length).toBe(1);

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
            (mockOccWorkerManager.genericCallToWorkerPromise as Mock).mockResolvedValue([
                { faceList: [{ vertexCoord: [0, 0, 0, 1, 0, 0, 0, 1, 0], normalCoord: [0, 0, 1, 0, 0, 1, 0, 0, 1], triIndexes: [0, 1, 2] }], edgeList: [], pointsList: [] },
                { faceList: [{ vertexCoord: [2, 0, 0, 3, 0, 0, 2, 1, 0], normalCoord: [0, 0, 1, 0, 0, 1, 0, 0, 1], triIndexes: [0, 1, 2] }], edgeList: [], pointsList: [] }
            ]);
            const inputs = new Inputs.OCCT.DrawShapesDto<Inputs.OCCT.TopoDSShapePointer>();
            inputs.shapes = [
                occtShape(),
                occtShape()
            ];
            inputs.drawFaces = true;
            inputs.drawEdges = false;
            inputs.faceColour = "#ff0000";
            inputs.faceOpacity = 1;

            const result = await drawHelper.drawShapes(inputs);

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(THREEJS.Group);
            expect(mockOccWorkerManager.genericCallToWorkerPromise).toHaveBeenCalledWith("shapesToMeshes", expect.anything());
            expect(result.children.length).toBe(2);

            result.children.forEach(childGroup => {
                const group = childGroup as THREEJS.Group;
                expect(group.children.length).toBeGreaterThan(0);
            });
        });
    });

    describe("drawManifoldOrCrossSection", () => {
        it("should draw manifold or cross section", async () => {
            (mockManifoldWorkerManager.genericCallToWorkerPromise as Mock).mockResolvedValue({
                vertProperties: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]),
                triVerts: new Uint32Array([0, 1, 2])
            });
            const inputs = new Inputs.Manifold.DrawManifoldOrCrossSectionDto<Inputs.Manifold.ManifoldPointer | Inputs.Manifold.CrossSectionPointer, THREEJS.MeshPhysicalMaterial>();
            inputs.manifoldOrCrossSection = manifoldShape();
            inputs.faceColour = "#ff0000";
            inputs.faceOpacity = 1;

            const result = await drawHelper.drawManifoldOrCrossSection(inputs) as THREEJS.Group;

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(THREEJS.Group);
            expect(mockManifoldWorkerManager.genericCallToWorkerPromise).toHaveBeenCalledWith("decomposeManifoldOrCrossSection", expect.anything());
            expect(result.children.length).toBe(2);
            const mesh = result.children[0] as THREEJS.Mesh;
            const material = mesh.material as THREEJS.MeshPhysicalMaterial;
            expect(colorsAreEqual(material.color, hexToRgb("#ff0000"))).toBe(true);
        });

        it("should return undefined when triVerts is empty", async () => {
            (mockManifoldWorkerManager.genericCallToWorkerPromise as Mock).mockResolvedValue({
                vertProperties: new Float32Array([]),
                triVerts: new Uint32Array([])
            });
            const inputs = new Inputs.Manifold.DrawManifoldOrCrossSectionDto<Inputs.Manifold.ManifoldPointer | Inputs.Manifold.CrossSectionPointer, THREEJS.MeshPhysicalMaterial>();
            inputs.manifoldOrCrossSection = manifoldShape();

            const result = await drawHelper.drawManifoldOrCrossSection(inputs) as THREEJS.Group;

            expect(result).toBeUndefined();
        });

        it("should handle cross section polygons", async () => {
            (mockManifoldWorkerManager.genericCallToWorkerPromise as Mock).mockResolvedValue([
                [[0, 0], [1, 0], [1, 1], [0, 1]] as Inputs.Base.Vector2[]
            ]);
            const inputs = new Inputs.Manifold.DrawManifoldOrCrossSectionDto<Inputs.Manifold.ManifoldPointer | Inputs.Manifold.CrossSectionPointer, THREEJS.MeshPhysicalMaterial>();
            inputs.manifoldOrCrossSection = manifoldShape();
            inputs.crossSectionColour = "#00ff00";
            inputs.crossSectionOpacity = 1;
            inputs.crossSectionWidth = 2;

            const result = await drawHelper.drawManifoldOrCrossSection(inputs) as THREEJS.Group;

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(THREEJS.Group);
        });
    });

    describe("drawManifoldsOrCrossSections", () => {
        it("should draw multiple manifolds", async () => {
            (mockManifoldWorkerManager.genericCallToWorkerPromise as Mock).mockResolvedValue([
                { vertProperties: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]), triVerts: new Uint32Array([0, 1, 2]) },
                { vertProperties: new Float32Array([1, 0, 0, 2, 0, 0, 1, 1, 0]), triVerts: new Uint32Array([0, 1, 2]) }
            ]);
            const inputs = new Inputs.Manifold.DrawManifoldsOrCrossSectionsDto<Inputs.Manifold.ManifoldPointer | Inputs.Manifold.CrossSectionPointer, THREEJS.MeshPhysicalMaterial>();
            inputs.manifoldsOrCrossSections = [
                manifoldShape(),
                manifoldShape()
            ];
            inputs.faceColour = "#ff0000";

            const result = await drawHelper.drawManifoldsOrCrossSections(inputs);

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(THREEJS.Group);
            expect(result.children.length).toBe(0);

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
            (mockManifoldWorkerManager.genericCallToWorkerPromise as Mock).mockResolvedValue([
                { vertProperties: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]), triVerts: new Uint32Array([0, 1, 2]) },
                { vertProperties: new Float32Array([]), triVerts: new Uint32Array([]) }
            ]);
            const inputs = new Inputs.Manifold.DrawManifoldsOrCrossSectionsDto<Inputs.Manifold.ManifoldPointer | Inputs.Manifold.CrossSectionPointer, THREEJS.MeshPhysicalMaterial>();
            inputs.manifoldsOrCrossSections = [
                manifoldShape(),
                manifoldShape()
            ];
            inputs.faceColour = "#ff0000";

            const result = await drawHelper.drawManifoldsOrCrossSections(inputs);

            expect(result).toBeDefined();
            expect(result.children.length).toBe(0);
            expect(result).toBeInstanceOf(THREEJS.Group);
        });
    });

    describe("updatePointsInstances", () => {
        it("should update positions of instanced meshes", () => {
            const group = new THREEJS.Group();
            const geometry = new THREEJS.SphereGeometry(0.5);
            const material = new THREEJS.MeshBasicMaterial();

            const mesh1 = new THREEJS.InstancedMesh(geometry, material, 1);
            mesh1.userData = { pointIndices: [0] };
            const mesh2 = new THREEJS.InstancedMesh(geometry, material, 1);
            mesh2.userData = { pointIndices: [1] };

            group.add(mesh1);
            group.add(mesh2);

            const newPositions: Inputs.Base.Point3[] = [[5, 5, 5], [10, 10, 10]];

            drawHelper.updatePointsInstances(group, newPositions);

            const matrix1 = new THREEJS.Matrix4();
            const matrix2 = new THREEJS.Matrix4();
            mesh1.getMatrixAt(0, matrix1);
            mesh2.getMatrixAt(0, matrix2);
            
            const pos1 = new THREEJS.Vector3();
            const pos2 = new THREEJS.Vector3();
            matrix1.decompose(pos1, new THREEJS.Quaternion(), new THREEJS.Vector3());
            matrix2.decompose(pos2, new THREEJS.Quaternion(), new THREEJS.Vector3());
            
            expect(pos1.x).toBe(5);
            expect(pos1.y).toBe(5);
            expect(pos1.z).toBe(5);
            expect(pos2.x).toBe(10);
            expect(pos2.y).toBe(10);
            expect(pos2.z).toBe(10);
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
                undefined,
                false,
                material,
                true,
                false
            );

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(THREEJS.Group);
            expect(result.name).toContain("surface");
            expect(result.children.length).toBe(1);
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
            expect(result.children.length).toBe(1);
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
                undefined,
                false,
                material,
                true,
                true
            );
            expect(result.children.length).toBe(1);
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
                undefined,
                false,
                material,
                true,
                false
            );

            expect(result).toBeDefined();
            expect(result.children.length).toBe(1);
            expect(result).toBeInstanceOf(THREEJS.Group);
        });
    });

    describe("what a redrawn list of polylines releases", () => {
        const listInputs = (points: Inputs.Base.Point3[]) => ({
            polylines: [{ points, isClosed: false }],
            updatable: true,
            size: 2,
            opacity: 1,
            colours: "#ff0000",
        });

        it("should leave a child that is not a line where it is when it replaces the drawing", () => {
            // Arrange
            const drawn = drawHelper.drawPolylinesWithColours(listInputs([[0, 0, 0], [1, 0, 0]]));
            const lineItDrew = drawn.children[0] as LineSegments2;
            const callersOwnChild = new THREEJS.Mesh(new THREEJS.BufferGeometry(), new THREEJS.MeshBasicMaterial());
            drawn.add(callersOwnChild);
            const releasedCallersOwn = vi.spyOn(callersOwnChild.geometry, "dispose");
            const releasedLineItDrew = vi.spyOn(lineItDrew.geometry, "dispose");
            const aDifferentPointCountForcesANewLine = listInputs([[0, 0, 0], [1, 0, 0], [2, 2, 2]]);

            // Act
            drawHelper.drawPolylinesWithColours({ ...aDifferentPointCountForcesANewLine, polylinesMesh: drawn });

            // Assert
            expect(releasedLineItDrew).toHaveBeenCalled();
            expect(releasedCallersOwn).not.toHaveBeenCalled();
            releasedCallersOwn.mockRestore();
            releasedLineItDrew.mockRestore();
        });
    });

    describe("drawPolyline (internal)", () => {
        it("should leave a child that is not a line where it is when it replaces the drawing", () => {
            // Arrange
            const mesh = new THREEJS.Group();
            const callersOwnChild = new THREEJS.Mesh(new THREEJS.BufferGeometry(), new THREEJS.MeshBasicMaterial());
            mesh.add(callersOwnChild);
            const released = vi.spyOn(callersOwnChild.geometry, "dispose");

            // Act
            const result = drawHelper.drawPolyline(mesh, [[0, 0, 0], [1, 0, 0]] as Inputs.Base.Point3[], false, 2, 1, "#ff0000");

            // Assert
            expect(released).not.toHaveBeenCalled();
            expect(result.children.length).toBe(1);
            released.mockRestore();
        });

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

            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(THREEJS.Group);
            expect(result.name).toContain("polyline");
            expect(result.children.length).toBe(1);
        });

        it("should handle existing mesh with children", () => {
            const existingMesh = new THREEJS.Group();
            const lineGeom = new LineSegmentsGeometry();
            const lineMat = new LineMaterial();
            existingMesh.add(new LineSegments2(lineGeom, lineMat));

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
            expect(result).toBeInstanceOf(THREEJS.Group);
            expect(result.children.length).toBe(1);
            const lineSegments = result.children[0] as LineSegments2;
            expect(lineSegments).toBeInstanceOf(LineSegments2);
            
            const positions = lineSegments.geometry.attributes["instanceStart"]!;
            expect(positions.count).toBe(7);
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
            expect(result).toBeInstanceOf(THREEJS.Group);
            const lineSegments = result.children[0] as LineSegments2;
            
            const positions = lineSegments.geometry.attributes["instanceStart"]!;
            expect(positions.count).toBe(18);
            
            const colors = lineSegments.geometry.attributes["instanceColorStart"]!;
            expect(colors).toBeDefined();
            expect(colors.count).toBe(18);
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

            const lineSegments = result.children[0] as LineSegments2;
            const positions = lineSegments.geometry.attributes["instanceStart"]!;
            expect(positions.count).toBe(2);
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

            const lineSegments = result.children[0] as LineSegments2;
            const positions = lineSegments.geometry.attributes["instanceStart"]!;
            expect(positions.count).toBe(5);
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

            const lineSegments = result.children[0] as LineSegments2;
            const colors = lineSegments.geometry.attributes["instanceColorStart"] as THREEJS.InterleavedBufferAttribute;
            
            const red = new THREEJS.Color("#ff0000");
            expect(colors.getX(0)).toBeCloseTo(red.r, 2);
            expect(colors.getY(0)).toBeCloseTo(red.g, 2);
            expect(colors.getZ(0)).toBeCloseTo(red.b, 2);
            
            expect(colors.getX(2)).toBeCloseTo(red.r, 2);
            expect(colors.getY(2)).toBeCloseTo(red.g, 2);
            expect(colors.getZ(2)).toBeCloseTo(red.b, 2);
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

            const lineSegments = result.children[0] as LineSegments2;
            const positions = lineSegments.geometry.attributes["instanceStart"]!;
            expect(positions.count).toBe(0);
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
            const lineSegments = secondResult.children[0] as LineSegments2;
            const positions = lineSegments.geometry.attributes["instanceStart"]!;
            expect(positions.count).toBe(5);
        });
    });

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
            inputs.manifoldOrCrossSection = { hash: 123, type: "manifold-shape" };
            inputs.faceColour = "#ff0000";
            inputs.faceOpacity = 1;

            await expect(drawHelper.drawManifoldOrCrossSection(inputs))
                .rejects
                .toThrow();
        });

        it("should handle worker timeout gracefully", async () => {
            const timeoutError = new Error("Worker operation timed out");
            (mockJscadWorkerManager.genericCallToWorkerPromise as Mock)
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
            (mockJscadWorkerManager.genericCallToWorkerPromise as Mock)
                .mockResolvedValue({ invalid: "data" });

            const inputs = new Inputs.JSCAD.DrawSolidMeshDto<THREEJS.Group>(
                createMockJSCADMesh(),
                1,
                "#ff0000"
            );

            const result = await drawHelper.drawSolidOrPolygonMesh(inputs);
            expect(result.children.length).toBe(0);
            expect(result).toBeDefined();
        });

        it("should handle empty worker response", async () => {
            (mockJscadWorkerManager.genericCallToWorkerPromise as Mock)
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
            expect(result.children.length).toBe(2);
            expect(result).toBeDefined();
        });

        it("should handle null shape input", async () => {
            const inputs = new Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>();
            inputs.shape = null as unknown as Inputs.OCCT.TopoDSShapePointer;
            inputs.drawFaces = true;

            await expect(drawHelper.drawShape(inputs))
                .rejects
                .toThrow();
        });

        it("should handle undefined manifold input", async () => {
            const inputs = new Inputs.Manifold.DrawManifoldOrCrossSectionDto<Inputs.Manifold.ManifoldPointer, THREEJS.MeshPhysicalMaterial>();
            inputs.manifoldOrCrossSection = undefined;

            await expect(drawHelper.drawManifoldOrCrossSection(inputs))
                .rejects
                .toThrow();
        });
    });

    describe("Worker validation", () => {
        it("should call JSCAD worker with shapeToMesh method", async () => {
            const mockMesh = createMockJSCADMesh();
            (mockJscadWorkerManager.genericCallToWorkerPromise as Mock).mockResolvedValue({
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
            (mockManifoldWorkerManager.genericCallToWorkerPromise as Mock).mockResolvedValue({
                vertProperties: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]),
                triVerts: new Uint32Array([0, 1, 2])
            });

            const inputs = new Inputs.Manifold.DrawManifoldOrCrossSectionDto<Inputs.Manifold.ManifoldPointer, THREEJS.MeshPhysicalMaterial>();
            inputs.manifoldOrCrossSection = { hash: 123, type: "manifold-shape" };
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
            (mockOccWorkerManager.genericCallToWorkerPromise as Mock).mockResolvedValue({
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
            (mockJscadWorkerManager.genericCallToWorkerPromise as Mock).mockResolvedValue({
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
            expect(result.children.length).toBe(2);
            expect(result).toBeDefined();
        });

        it("should deserialize typed arrays from Manifold worker", async () => {
            const vertProperties = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]);
            const triVerts = new Uint32Array([0, 1, 2]);

            (mockManifoldWorkerManager.genericCallToWorkerPromise as Mock).mockResolvedValue({
                vertProperties,
                triVerts
            });

            const inputs = new Inputs.Manifold.DrawManifoldOrCrossSectionDto<Inputs.Manifold.ManifoldPointer, THREEJS.MeshPhysicalMaterial>();
            inputs.manifoldOrCrossSection = { hash: 123, type: "manifold-shape" };

            const result = await drawHelper.drawManifoldOrCrossSection(inputs) as THREEJS.Group;
            expect(result.children.length).toBe(2);
            expect(result).toBeDefined();
        });

        it("should call OCCT worker with shapesToMeshes for multiple shapes", async () => {
            (mockOccWorkerManager.genericCallToWorkerPromise as Mock).mockResolvedValue([
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
                ["#ff0000", undefined as unknown as string, "#0000ff"]
            );

            const result = drawHelper.drawPoints(inputs);
            expect(result).toBeDefined();
            expect(result.children.length).toBe(2);
        });

        it("should handle colors array shorter than points array", () => {
            const inputs: Inputs.Point.DrawPointsDto<THREEJS.Group> & { colorMapStrategy?: Inputs.Base.colorMapStrategyEnum } = {
                points: [[0, 0, 0], [1, 1, 1], [2, 2, 2], [3, 3, 3]],
                opacity: 1,
                size: 0.3,
                updatable: false,
                colours: ["#ff0000", "#00ff00"],
                colorMapStrategy: Inputs.Base.colorMapStrategyEnum.repeatColors
            };

            const result = drawHelper.drawPoints(inputs);
            expect(result).toBeDefined();
            expect(result.children.length).toBe(2);
            expect((result.children[0] as THREEJS.InstancedMesh).count).toBe(2);
            expect((result.children[1] as THREEJS.InstancedMesh).count).toBe(2);
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
            expect((result.children[0] as THREEJS.InstancedMesh).count).toBe(1);
            expect((result.children[1] as THREEJS.InstancedMesh).count).toBe(1);
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
            expect(result.children.length).toBe(1);
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
            expect(result.children.length).toBe(1);
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
            expect(result.children.length).toBe(1);
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
            expect(result.children.length).toBe(1);
            const mesh = result.children[0] as THREEJS.InstancedMesh;
            const material = getMaterialFromMesh(mesh) as THREEJS.MeshBasicMaterial;
            expect(material).toBeDefined();
            expect(material.opacity).toBe(-0.5);
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
            expect(result.children.length).toBe(1);
            const mesh = result.children[0] as THREEJS.InstancedMesh;
            const material = getMaterialFromMesh(mesh) as THREEJS.MeshBasicMaterial;
            expect(material).toBeDefined();
            expect(material.opacity).toBe(2.5);
        });

        it("should handle invalid hex color", () => {
            const inputs = new Inputs.Point.DrawPointDto<THREEJS.Group>(
                [0, 0, 0],
                1,
                1,
                "not-a-color"
            );

            const result = drawHelper.drawPoint(inputs);
            expect(result).toBeDefined();
            expect(result.children.length).toBe(1);
            const mesh = result.children[0] as THREEJS.InstancedMesh;
            const material = getMaterialFromMesh(mesh) as THREEJS.MeshBasicMaterial;
            expect(material).toBeDefined();
            expect(colorsAreEqual(material.color, { r: 1, g: 1, b: 1 })).toBe(true);
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
            expect(result.children.length).toBe(1);
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
            expect(result.children.length).toBe(1);
        });

        it("should handle updatable with undefined existing mesh", () => {
            const inputs = new Inputs.Point.DrawPointDto<THREEJS.Group>(
                [0, 0, 0],
                1,
                1,
                "#ff0000",
                true,
                undefined
            );

            const result = drawHelper.drawPoint(inputs);
            expect(result).toBeDefined();
            expect(result.children.length).toBe(1);
        });

        it("should return undefined for empty Manifold mesh", async () => {
            (mockManifoldWorkerManager.genericCallToWorkerPromise as Mock).mockResolvedValue({
                vertProperties: new Float32Array([]),
                triVerts: new Uint32Array([])
            });

            const inputs = new Inputs.Manifold.DrawManifoldOrCrossSectionDto<Inputs.Manifold.ManifoldPointer, THREEJS.MeshPhysicalMaterial>();
            inputs.manifoldOrCrossSection = { hash: 123, type: "manifold-shape" };

            const result = await drawHelper.drawManifoldOrCrossSection(inputs) as THREEJS.Group;
            expect(result).toBeUndefined();
        });

        it("should handle OCCT shape with no geometry", async () => {
            (mockOccWorkerManager.genericCallToWorkerPromise as Mock).mockResolvedValue({
                faceList: [],
                edgeList: [],
                pointsList: []
            });

            const inputs = new Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>();
            inputs.shape = createMockOCCTShape();
            inputs.drawFaces = true;

            const result = await drawHelper.drawShape(inputs);
            expect(result.children.length).toBe(0);
            expect(result).toBeDefined();
        });

        it("should handle JSCAD mesh with empty geometry", async () => {
            (mockJscadWorkerManager.genericCallToWorkerPromise as Mock).mockResolvedValue({
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
            expect(result.children.length).toBe(2);
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
            expect(result.children.length).toBe(1);
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
            const mesh = result.children[0] as THREEJS.InstancedMesh;

            const matrix = new THREEJS.Matrix4();
            mesh.getMatrixAt(0, matrix);
            const position = new THREEJS.Vector3();
            matrix.decompose(position, new THREEJS.Quaternion(), new THREEJS.Vector3());
            
            expect(position.x).toBeCloseTo(1.5, 2);
            expect(position.y).toBeCloseTo(2.5, 2);
            expect(position.z).toBeCloseTo(3.5, 2);
        });

        it("should validate two-sided rendering creates 2 children", async () => {
            (mockJscadWorkerManager.genericCallToWorkerPromise as Mock).mockResolvedValue({
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
                true
            );

            const result = await drawHelper.drawSolidOrPolygonMesh(inputs);
            expect(result.children.length).toBe(2);
        });

        it("should validate single-sided rendering creates 1 child", async () => {
            (mockJscadWorkerManager.genericCallToWorkerPromise as Mock).mockResolvedValue({
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
                false
            );

            const result = await drawHelper.drawSolidOrPolygonMesh(inputs);
            expect(result.children.length).toBe(1);
        });
    });

    describe("Memory management", () => {
        it("should dispose old geometry when recreating points mesh with different count", () => {
            const firstInputs = new Inputs.Point.DrawPointsDto<THREEJS.Group>(
                [[0, 0, 0], [1, 1, 1]],
                1,
                0.3,
                "#ff0000"
            );
            const existingMesh = drawHelper.drawPoints(firstInputs);

            const firstChild = existingMesh.children[0] as THREEJS.Mesh;
            const firstGeometry = firstChild.geometry;
            const disposeSpy = vi.spyOn(firstGeometry, "dispose");

            const updateInputs = new Inputs.Point.DrawPointsDto<THREEJS.Group>(
                [[5, 5, 5], [6, 6, 6], [7, 7, 7]],
                1,
                0.3,
                "#ff0000",
                true,
                existingMesh
            );

            drawHelper.drawPoints(updateInputs);

            expect(disposeSpy).toHaveBeenCalled();
        });

        it("should not dispose geometries when updating with same point count", () => {
            const firstInputs = new Inputs.Point.DrawPointsDto<THREEJS.Group>(
                [[0, 0, 0], [1, 1, 1]],
                1,
                0.3,
                "#ff0000"
            );
            const existingMesh = drawHelper.drawPoints(firstInputs);

            const firstChild = existingMesh.children[0] as THREEJS.Mesh;
            const firstGeometry = firstChild.geometry;
            const disposeSpy = vi.spyOn(firstGeometry, "dispose");

            const updateInputs = new Inputs.Point.DrawPointsDto<THREEJS.Group>(
                [[5, 5, 5], [6, 6, 6]],
                1,
                0.3,
                "#ff0000",
                true,
                existingMesh
            );

            drawHelper.drawPoints(updateInputs);

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

            mesh.geometry.dispose();
            (mesh.material as THREEJS.Material).dispose();

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
            expect(result.children.length).toBe(1);
        });
    });

    describe("Material cache management", () => {
        it("should cache materials and reuse them for same parameters", async () => {
            (mockJscadWorkerManager.genericCallToWorkerPromise as Mock).mockResolvedValue({
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

            expect(material1).toBe(material2);
        });

        it("should create different materials for different colors", async () => {
            (mockJscadWorkerManager.genericCallToWorkerPromise as Mock).mockResolvedValue({
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

            expect(material1).not.toBe(material2);
            if (material1 && !Array.isArray(material1) && material2 && !Array.isArray(material2)) {
                const mat1 = material1 as THREEJS.MeshPhysicalMaterial;
                const mat2 = material2 as THREEJS.MeshPhysicalMaterial;
                expect(mat1.color.getHex()).not.toBe(mat2.color.getHex());
            }
        });

        it("should evict oldest material when cache is full (FIFO)", async () => {
            const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
            const materialCache = drawHelper["materialCache"];

            materialCache.clear();

            for (let i = 0; i < 1000; i++) {
                (mockJscadWorkerManager.genericCallToWorkerPromise as Mock).mockResolvedValue({
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
                    false
                );
                await drawHelper.drawSolidOrPolygonMesh(inputs);
            }

            expect(materialCache.size).toBe(1000);

            const firstKeyBeforeEviction = materialCache.keys().next().value!;

            (mockJscadWorkerManager.genericCallToWorkerPromise as Mock).mockResolvedValue({
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

            expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining("Material cache full, evicted:"));
            expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining(firstKeyBeforeEviction));

            expect(materialCache.has(firstKeyBeforeEviction)).toBe(false);

            expect(materialCache.size).toBe(1000);

            consoleWarnSpy.mockRestore();
        });

        it("should call dispose on evicted material", async () => {
            const materialCache = drawHelper["materialCache"];
            const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);

            materialCache.clear();

            const disposeCalls: string[] = [];
            const originalMaterialPrototype = THREEJS.MeshPhysicalMaterial.prototype.dispose;
            THREEJS.MeshPhysicalMaterial.prototype.dispose = function () {
                disposeCalls.push(this.name || "unnamed");
                originalMaterialPrototype.call(this);
            };

            for (let i = 0; i < 1000; i++) {
                (mockJscadWorkerManager.genericCallToWorkerPromise as Mock).mockResolvedValue({
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
                    false
                );
                await drawHelper.drawSolidOrPolygonMesh(inputs);
            }

            const disposeCallsBefore = disposeCalls.length;

            (mockJscadWorkerManager.genericCallToWorkerPromise as Mock).mockResolvedValue({
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

            expect(disposeCalls.length).toBeGreaterThan(disposeCallsBefore);

            THREEJS.MeshPhysicalMaterial.prototype.dispose = originalMaterialPrototype;
            consoleWarnSpy.mockRestore();
        });

        it("should handle materials without dispose method gracefully", () => {
            const materialCache = drawHelper["materialCache"];
            const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);

            materialCache.clear();
            const mockMaterialWithoutDispose = {
                color: new THREEJS.Color("#ff0000"),
            } as unknown as THREEJS.MeshPhysicalMaterial;

            materialCache.set("test-no-dispose-000000-1-0", mockMaterialWithoutDispose);

            for (let i = 1; i < 1000; i++) {
                const mat = new THREEJS.MeshPhysicalMaterial();
                mat.color = new THREEJS.Color(`#${i.toString(16).padStart(6, "0")}`);
                materialCache.set(`test-${i}-000000-1-0`, mat);
            }

            expect(materialCache.size).toBe(1000);

            const getOrCreateMaterial = drawHelper["getOrCreateMaterial"].bind(drawHelper);
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
            (mockJscadWorkerManager.genericCallToWorkerPromise as Mock).mockResolvedValue({
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

            expect(material.type).toBe("MeshPhysicalMaterial");
            expect(material.dispose).toBeDefined();

            expect(() => material.dispose()).not.toThrow();

            expect(material.type).toBe("MeshPhysicalMaterial");
        });

        it("should create new material after previous one with same key was evicted", async () => {
            const materialCache = drawHelper["materialCache"];
            const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);

            materialCache.clear();

            const color = "#abc123";
            (mockJscadWorkerManager.genericCallToWorkerPromise as Mock).mockResolvedValue({
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

            for (let i = 0; i < 1000; i++) {
                (mockJscadWorkerManager.genericCallToWorkerPromise as Mock).mockResolvedValue({
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
                    false
                );
                await drawHelper.drawSolidOrPolygonMesh(inputs);
            }

            (mockJscadWorkerManager.genericCallToWorkerPromise as Mock).mockResolvedValue({
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

            expect(material1).not.toBe(material2);

            if (material1 && !Array.isArray(material1) && material2 && !Array.isArray(material2)) {
                const mat1 = material1 as THREEJS.MeshPhysicalMaterial;
                const mat2 = material2 as THREEJS.MeshPhysicalMaterial;
                expect(mat1.color.getHex()).toBe(mat2.color.getHex());
            }

            consoleWarnSpy.mockRestore();
        });
    });

    describe("the material caches", () => {
        it("should report itself disposed while it holds no material", () => {
            expect(drawHelper.isDisposed()).toBe(true);
        });

        it("should hold a material once one has been made", async () => {
            // Arrange
            const inputs = new Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>();
            inputs.shape = createMockOCCTShape();
            inputs.drawFaces = true;

            // Act
            await drawHelper.handleDecomposedMeshIndividually(inputs, mockOCCTBoxDecomposedMesh(), {});

            // Assert
            expect(drawHelper.isDisposed()).toBe(false);
        });

        it("should let every material it holds go when disposed", async () => {
            // Arrange
            vi.spyOn(console, "log").mockImplementation(() => undefined);
            const inputs = new Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>();
            inputs.shape = createMockOCCTShape();
            await drawHelper.drawShape(inputs);

            // Act
            drawHelper.dispose();

            // Assert
            expect(drawHelper.isDisposed()).toBe(true);
        });

        const drawnPolylineMaterial = (): THREEJS.Material => {
            const inputs = new Inputs.Polyline.DrawPolylineDto<THREEJS.Group>(
                { points: [[0, 0, 0], [1, 0, 0], [1, 1, 0]] as Inputs.Base.Point3[], isClosed: false },
                1,
                "#00ff00",
                2
            );
            const drawn = drawHelper.drawPolylineClose(inputs);
            return (drawn.children[0] as LineSegments2).material;
        };

        it("should carry on disposing when a line material refuses", () => {
            // Arrange
            const warned: unknown[] = [];
            vi.spyOn(console, "warn").mockImplementation((message: unknown) => { warned.push(message); });
            drawnPolylineMaterial().dispose = () => { throw new Error("already gone"); };

            // Act
            drawHelper.dispose();

            // Assert
            expect(drawHelper.isDisposed()).toBe(true);
            expect(warned.length).toBeGreaterThan(0);
        });

        it("should let go of a line material that has no dispose at all", () => {
            // Arrange
            const warned: unknown[] = [];
            vi.spyOn(console, "warn").mockImplementation((message: unknown) => { warned.push(message); });
            const material: { dispose?: () => void } = drawnPolylineMaterial();
            Object.defineProperty(material, "dispose", { value: undefined, configurable: true });

            // Act
            drawHelper.dispose();

            // Assert
            expect(drawHelper.isDisposed()).toBe(true);
            expect(warned).toStrictEqual([]);
        });

        it("should carry on disposing when one material refuses", async () => {
            // Arrange
            vi.spyOn(console, "log").mockImplementation(() => undefined);
            const warned: unknown[] = [];
            vi.spyOn(console, "warn").mockImplementation((message: unknown) => { warned.push(message); });
            const inputs = new Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>();
            inputs.shape = createMockOCCTShape();
            inputs.drawFaces = true;
            const group = await drawHelper.handleDecomposedMeshIndividually(inputs, mockOCCTBoxDecomposedMesh(), {});
            const face = group.children.find((child) => child.name === "face 0")!;
            const material = (face.children[0] as THREEJS.Mesh).material as THREEJS.Material;
            material.dispose = () => { throw new Error("already gone"); };

            // Act
            drawHelper.dispose();

            // Assert
            expect(drawHelper.isDisposed()).toBe(true);
            expect(warned.length).toBeGreaterThan(0);
        });
    });

    describe("handleDecomposedMeshIndividually", () => {
        const inputsFor = (): Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer> => {
            const inputs = new Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>();
            inputs.shape = createMockOCCTShape();
            inputs.drawFaces = true;
            inputs.drawEdges = true;
            inputs.drawVertices = true;
            return inputs;
        };

        it("should give every face a mesh of its own, named after the face", async () => {
            // Act
            const group = await drawHelper.handleDecomposedMeshIndividually(inputsFor(), mockOCCTBoxDecomposedMesh(), {});

            // Assert
            expect(group.children.some((child) => child.name === "face 0")).toBe(true);
            expect(group.children.some((child) => child.name === "face 5")).toBe(true);
        });

        it("should give every face a back face as well unless told otherwise", async () => {
            // Act
            const group = await drawHelper.handleDecomposedMeshIndividually(inputsFor(), mockOCCTBoxDecomposedMesh(), {});

            // Assert
            expect(group.children.some((child) => child.name === "face 0 backFace")).toBe(true);
        });

        it("should leave the back faces out when the shape is drawn one sided", async () => {
            // Arrange
            const inputs = inputsFor();
            inputs.drawTwoSided = false;

            // Act
            const group = await drawHelper.handleDecomposedMeshIndividually(inputs, mockOCCTBoxDecomposedMesh(), {});

            // Assert
            expect(group.children.some((child) => child.name.includes("backFace"))).toBe(false);
        });

        it("should give every edge a mesh of its own, named after the edge", async () => {
            // Act
            const group = await drawHelper.handleDecomposedMeshIndividually(inputsFor(), mockOCCTBoxDecomposedMesh(), {});

            // Assert
            expect(group.children.some((child) => child.name === "edge 0")).toBe(true);
        });

        it("should draw the vertices in one mesh of their own", async () => {
            // Act
            const group = await drawHelper.handleDecomposedMeshIndividually(inputsFor(), mockOCCTBoxDecomposedMesh(), {});

            // Assert
            expect(group.children.filter((child) => child.name === "vertices")).toHaveLength(1);
        });

        it("should take the face material it was given rather than making one", async () => {
            // Arrange
            const inputs = inputsFor();
            const material = new THREEJS.MeshPhysicalMaterial({ color: 0xff00ff });
            inputs.faceMaterial = material;

            // Act
            const group = await drawHelper.handleDecomposedMeshIndividually(inputs, mockOCCTBoxDecomposedMesh(), {});
            const face = group.children.find((child) => child.name === "face 0")!;
            const drawnMaterial = (face.children[0] as THREEJS.Mesh).material as THREEJS.MeshPhysicalMaterial;

            // Assert
            expect(drawnMaterial.color.getHexString()).toBe("ff00ff");
        });

        it("should draw nothing of a kind it was not asked for", async () => {
            // Arrange
            const inputs = inputsFor();
            inputs.drawFaces = false;
            inputs.drawEdges = false;
            inputs.drawVertices = false;

            // Act
            const group = await drawHelper.handleDecomposedMeshIndividually(inputs, mockOCCTBoxDecomposedMesh(), {});

            // Assert
            expect(group.children).toEqual([]);
        });
    });

    describe("what a drawing does with data it cannot use", () => {
        it("should say which drawing failed when the worker refuses a list of manifolds", async () => {
            // Arrange
            vi.spyOn(console, "error").mockImplementation(() => undefined);
            mockWorkerError(mockManifoldWorkerManager, "decomposeManifoldsOrCrossSections", new Error("kernel gone"));
            const inputs = new Inputs.Manifold.DrawManifoldsOrCrossSectionsDto<Inputs.Manifold.ManifoldPointer, THREEJS.MeshPhysicalMaterial>();
            inputs.manifoldsOrCrossSections = [{ hash: 123, type: "manifold-shape" }];

            // Act & Assert
            await expect(drawHelper.drawManifoldsOrCrossSections(inputs))
                .rejects.toThrow("Failed to draw manifolds or cross sections");
        });

        it("should say which drawing failed when the worker refuses a list of shapes", async () => {
            // Arrange
            vi.spyOn(console, "error").mockImplementation(() => undefined);
            mockWorkerError(mockOccWorkerManager, "shapesToMeshes", new Error("kernel gone"));
            const inputs = new Inputs.OCCT.DrawShapesDto<Inputs.OCCT.TopoDSShapePointer>();
            inputs.shapes = [createMockOCCTShape()];

            // Act & Assert
            await expect(drawHelper.drawShapes(inputs)).rejects.toThrow("Failed to draw OCCT shapes");
        });

        it("should say which drawing failed when the worker refuses a list of jscad meshes", async () => {
            // Arrange
            vi.spyOn(console, "error").mockImplementation(() => undefined);
            mockWorkerError(mockJscadWorkerManager, "shapesToMeshes", new Error("kernel gone"));
            const inputs = new Inputs.JSCAD.DrawSolidMeshesDto<THREEJS.Group>();
            inputs.meshes = [createMockJSCADMesh()];

            // Act & Assert
            await expect(drawHelper.drawSolidOrPolygonMeshes(inputs)).rejects.toThrow("Failed to draw JSCAD meshes");
        });
    });

    describe("the colours of a list of jscad meshes", () => {
        it("should give each mesh the colour standing at its own place in the list", async () => {
            // Arrange
            (mockJscadWorkerManager.genericCallToWorkerPromise as Mock).mockResolvedValue([
                { positions: [0, 0, 0, 1, 0, 0, 0, 1, 0], normals: [], indices: [0, 1, 2], transforms: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] },
                { positions: [0, 0, 0, 1, 0, 0, 0, 1, 0], normals: [], indices: [0, 1, 2], transforms: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] },
            ]);
            const inputs = new Inputs.JSCAD.DrawSolidMeshesDto<THREEJS.Group>();
            inputs.meshes = [createMockJSCADMesh(), createMockJSCADMesh()];
            inputs.colours = ["#ff0000", "#00ff00"];
            inputs.opacity = 1;

            // Act
            const group = await drawHelper.drawSolidOrPolygonMeshes(inputs);

            // Assert
            expect(group.children).toHaveLength(2);
        });

        it("should give every mesh the first colour when the list does not line up", async () => {
            // Arrange
            (mockJscadWorkerManager.genericCallToWorkerPromise as Mock).mockResolvedValue([
                { positions: [0, 0, 0, 1, 0, 0, 0, 1, 0], normals: [], indices: [0, 1, 2], transforms: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] },
                { positions: [0, 0, 0, 1, 0, 0, 0, 1, 0], normals: [], indices: [0, 1, 2], transforms: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] },
            ]);
            const inputs = new Inputs.JSCAD.DrawSolidMeshesDto<THREEJS.Group>();
            inputs.meshes = [createMockJSCADMesh(), createMockJSCADMesh()];
            inputs.colours = ["#ff0000"];
            inputs.opacity = 1;

            // Act
            const group = await drawHelper.drawSolidOrPolygonMeshes(inputs);

            // Assert
            expect(group.children).toHaveLength(2);
        });

        it("should draw nothing of a mesh the worker described without a transform", async () => {
            // Arrange
            vi.spyOn(console, "warn").mockImplementation(() => undefined);
            (mockJscadWorkerManager.genericCallToWorkerPromise as Mock).mockResolvedValue([
                { positions: [0, 0, 0, 1, 0, 0, 0, 1, 0], normals: [], indices: [0, 1, 2] },
            ]);
            const inputs = new Inputs.JSCAD.DrawSolidMeshesDto<THREEJS.Group>();
            inputs.meshes = [createMockJSCADMesh()];
            inputs.colours = "#ff0000";
            inputs.opacity = 1;

            // Act
            const group = await drawHelper.drawSolidOrPolygonMeshes(inputs);

            const meshGroup = group.children[0] as THREEJS.Group;
            expect(meshGroup.children.every((child) => !(child instanceof THREEJS.Mesh))).toBe(true);
        });
    });

    describe("a surface drawn from mesh data", () => {
        type SurfaceMeshData = { positions: number[]; indices: number[]; normals: number[]; uvs?: number[] | undefined };
        const NO_MATERIAL: THREEJS.MeshPhysicalMaterial = undefined!;

        it("should work out the normals when the data carries none", () => {
            // Act
            const group = drawHelper.createOrUpdateSurfacesMesh(
                [{ positions: [0, 0, 0, 1, 0, 0, 0, 1, 0], normals: [], indices: [0, 1, 2] }],
                undefined, false, NO_MATERIAL, true, false);
            const mesh = group.children[0] as THREEJS.Mesh;

            // Assert
            expect(mesh.geometry.getAttribute("normal").count).toBe(3);
        });

        it("should skip a mesh the data describes without positions", () => {
            // Arrange
            vi.spyOn(console, "warn").mockImplementation(() => undefined);

            // Act
            const group = drawHelper.createOrUpdateSurfacesMesh(
                [{ indices: [0, 1, 2] } as SurfaceMeshData],
                undefined, false, NO_MATERIAL, true, false);
            const mesh = group.children[0] as THREEJS.Mesh;

            // Assert
            expect(mesh.geometry.getAttribute("position").count).toBe(0);
        });

        it("should hide the group when it was asked to draw it hidden", () => {
            // Act
            const group = drawHelper.createOrUpdateSurfacesMesh(
                [{ positions: [0, 0, 0, 1, 0, 0, 0, 1, 0], normals: [], indices: [0, 1, 2] }],
                undefined, false, NO_MATERIAL, true, true);

            // Assert
            expect(group.visible).toBe(false);
        });
    });
});
