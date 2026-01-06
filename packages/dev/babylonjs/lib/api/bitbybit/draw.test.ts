/* eslint-disable @typescript-eslint/no-explicit-any */
jest.mock("@babylonjs/core", () => {
    const { createBabylonJSMock } = jest.requireActual("../__mocks__/babylonjs.mock");
    return createBabylonJSMock();
});

jest.mock("@babylonjs/materials");

import * as BABYLON from "@babylonjs/core";
import { GridMaterial } from "@babylonjs/materials";
import { Draw } from "./draw";
import { DrawHelper } from "../draw-helper";
import { BabylonNode } from "./babylon/node";
import { Tag } from "@bitbybit-dev/core";
import { Context } from "../context";
import * as Inputs from "../inputs";
import { MockScene, MockMesh } from "../__mocks__/babylonjs.mock";

// Type definitions for Draw private methods (for type-safe testing)
type DrawPrivateMethods = {
    // Detector methods
    detectLine: (entity: unknown) => boolean;
    detectPoint: (entity: unknown) => boolean;
    detectPolyline: (entity: unknown) => boolean;
    detectNode: (entity: unknown) => boolean;
    detectVerbCurve: (entity: unknown) => boolean;
    detectVerbSurface: (entity: unknown) => boolean;
    detectPolylines: (entity: unknown) => boolean;
    detectLines: (entity: unknown) => boolean;
    detectPoints: (entity: unknown) => boolean;
    detectNodes: (entity: unknown) => boolean;
    detectVerbCurves: (entity: unknown) => boolean;
    detectVerbSurfaces: (entity: unknown) => boolean;
    detectTag: (entity: unknown) => boolean;
    detectTags: (entity: unknown) => boolean;
    detectJscadMesh: (entity: unknown) => boolean;
    detectOcctShape: (entity: unknown) => boolean;
    detectOcctShapes: (entity: unknown) => boolean;
    detectJscadMeshes: (entity: unknown) => boolean;
    detectManifoldShape: (entity: unknown) => boolean;
    detectManifoldShapes: (entity: unknown) => boolean;
    // Handler methods
    
    handleLine: (inputs: any) => BABYLON.Mesh | undefined;
    
    handlePoint: (inputs: any) => BABYLON.Mesh | undefined;
    
    handlePolyline: (inputs: any) => BABYLON.Mesh | undefined;
    
    handleNode: (inputs: any) => any;
    
    handleVerbCurve: (inputs: any) => BABYLON.Mesh | undefined;
    
    handleVerbSurface: (inputs: any) => BABYLON.Mesh | undefined;
    
    handlePolylines: (inputs: any) => BABYLON.Mesh | undefined;
    
    handleLines: (inputs: any) => BABYLON.Mesh | undefined;
    
    handlePoints: (inputs: any) => BABYLON.Mesh | undefined;
    
    handleNodes: (inputs: any) => any;
    
    handleVerbCurves: (inputs: any) => BABYLON.Mesh | undefined;
    
    handleVerbSurfaces: (inputs: any) => BABYLON.Mesh | undefined;
    
    handleTag: (inputs: any) => BABYLON.Mesh | undefined;
    
    handleTags: (inputs: any) => BABYLON.Mesh | undefined;
    
    handleJscadMesh: (inputs: any) => Promise<BABYLON.Mesh | undefined>;
    
    handleJscadMeshes: (inputs: any) => Promise<BABYLON.Mesh | undefined>;
    
    handleOcctShape: (inputs: any) => Promise<BABYLON.Mesh | undefined>;
    
    handleOcctShapes: (inputs: any) => Promise<BABYLON.Mesh | undefined>;
    
    handleManifoldShape: (inputs: any) => Promise<BABYLON.Mesh | undefined>;
    
    handleManifoldShapes: (inputs: any) => Promise<BABYLON.Mesh | undefined>;
    
    updateAny: (inputs: any) => BABYLON.Mesh | undefined;
    
    applyGlobalSettingsAndMetadataAndShadowCasting: (type: any, options: any, mesh?: BABYLON.Mesh) => void;
};

type DetectorName = "Line" | "Point" | "Polyline" | "Node" | "VerbCurve" 
    | "VerbSurface" | "Polylines" | "Lines" | "Points" | "Nodes" 
    | "VerbCurves" | "VerbSurfaces" | "Tag" | "Tags" | "JscadMesh" 
    | "OcctShape" | "OcctShapes" | "JscadMeshes" | "ManifoldShape" 
    | "ManifoldShapes";

type SpyManager = {
    spies: Map<string, jest.SpyInstance>;
    setupDetectors: (activeDetectors?: DetectorName | DetectorName[]) => void;
    setupHandler: <T = unknown>(handler: string, returnValue: T) => jest.SpyInstance<T>;
    getDetectorSpy: (detector: DetectorName) => jest.SpyInstance | undefined;
    getHandlerSpy: (handler: string) => jest.SpyInstance | undefined;
    reset: () => void;
};

describe("Draw unit tests", () => {
    let draw: Draw;
    let drawPrivate: DrawPrivateMethods; // Type-safe access to private methods for testing
    let mockDrawHelper: DrawHelper;
    let mockNode: BabylonNode;
    let mockTag: Tag;
    let mockContext: Context;
    let mockScene: BABYLON.Scene;
    let spyManager: SpyManager;

    // Mock factory functions
    function createMockMesh(name: string, withChildren = false): BABYLON.Mesh {
        
        const mesh = new MockMesh(name, mockScene as any) as unknown as BABYLON.Mesh;
        mesh.getChildMeshes = jest.fn().mockReturnValue(withChildren ? [mesh] : []);
        return mesh;
    }

    function createMockMeshWithMetadata(
        name: string,
        type: string,
        
        options: Record<string, any> = {}
    ): BABYLON.Mesh {
        const mesh = createMockMesh(name);
        mesh.metadata = { type, options };
        return mesh;
    }

    beforeEach(() => {
        mockScene = new MockScene() as unknown as BABYLON.Scene;
        mockScene.metadata = { shadowGenerators: [] };
        
        mockDrawHelper = {
            drawPoints: jest.fn(),
            drawPoint: jest.fn(),
            drawLines: jest.fn(),
            drawPolylines: jest.fn(),
            drawPolylineClose: jest.fn(),
            drawPolylinesWithColours: jest.fn(),
            drawCurves: jest.fn(),
            drawCurve: jest.fn(),
            drawSurfacesMultiColour: jest.fn(),
            drawSurface: jest.fn(),
            drawVerbSurface: jest.fn(),
            drawVerbCurve: jest.fn(),
            drawJSCADMesh: jest.fn(),
            drawJSCADMeshes: jest.fn(),
            drawSolidOrPolygonMesh: jest.fn(),
            drawSolidOrPolygonMeshes: jest.fn(),
            drawManifoldMesh: jest.fn(),
            drawManifoldMeshes: jest.fn(),
            drawManifoldOrCrossSection: jest.fn(),
            drawManifoldsOrCrossSections: jest.fn(),
            drawOcctShapesAsync: jest.fn(),
            drawOcctShapeAsync: jest.fn(),
            drawShape: jest.fn(),
            drawShapes: jest.fn(),
            dispose: jest.fn(),
            
        } as any;

        mockNode = {
            drawNodesWithLabels: jest.fn(),
            drawNodes: jest.fn(),
            drawNode: jest.fn(),
            
        } as any;

        mockTag = {
            drawTag: jest.fn(),
            drawTags: jest.fn(),
            
        } as any;

        mockContext = {
            scene: mockScene,
            engine: {} as BABYLON.Engine,
            
        } as any;

        draw = new Draw(mockDrawHelper, mockNode, mockTag, mockContext);
        drawPrivate = draw as unknown as DrawPrivateMethods; // Type-safe cast for testing private methods

        // Initialize SpyManager
        spyManager = {
            spies: new Map(),

            setupDetectors(activeDetectors?: DetectorName | DetectorName[]) {
                const detectors: DetectorName[] = [
                    "Line", "Point", "Polyline", "Node", "VerbCurve", "VerbSurface",
                    "Polylines", "Lines", "Points", "Nodes", "VerbCurves",
                    "VerbSurfaces", "Tag", "Tags", "JscadMesh", "OcctShape",
                    "OcctShapes", "JscadMeshes", "ManifoldShape", "ManifoldShapes"
                ];

                const activeSet = new Set(
                    Array.isArray(activeDetectors) ? activeDetectors : 
                    activeDetectors ? [activeDetectors] : []
                );

                detectors.forEach(detector => {
                    const spy = jest.spyOn(drawPrivate, `detect${detector}` as keyof DrawPrivateMethods)
                        .mockReturnValue(activeSet.has(detector));
                    this.spies.set(`detect${detector}`, spy);
                });
            },

            setupHandler<T = unknown>(handler: string, returnValue: T): jest.SpyInstance<T> {
                const spy = jest.spyOn(drawPrivate, handler as keyof DrawPrivateMethods).mockReturnValue(returnValue);
                this.spies.set(handler, spy);
                return spy;
            },

            getDetectorSpy(detector: DetectorName) {
                return this.spies.get(`detect${detector}`);
            },

            getHandlerSpy(handler: string) {
                return this.spies.get(handler);
            },

            reset() {
                this.spies.forEach(spy => spy.mockRestore());
                this.spies.clear();
            }
        };
    });

    afterEach(() => {
        spyManager.reset();
    });

    describe("Constructor initialization", () => {
        it("should create a Draw instance", () => {
            expect(draw).toBeDefined();
            expect(draw).toBeInstanceOf(Draw);
        });

        it("should initialize with drawHelper", () => {
            expect(draw.drawHelper).toBe(mockDrawHelper);
        });

        it("should initialize with node service", () => {
            expect(draw.node).toBe(mockNode);
        });

        it("should initialize with tag service", () => {
            expect(draw.tag).toBe(mockTag);
        });

        it("should initialize with context", () => {
            expect(draw.context).toBe(mockContext);
        });
    });

    describe("drawAnyAsync", () => {
        it("should resolve undefined for undefined entity", async () => {
            const result = await draw.drawAnyAsync({ entity: undefined });
            expect(result).toBeUndefined();
        });

        it("should resolve undefined for empty array", async () => {
            const result = await draw.drawAnyAsync({ entity: [] });
            expect(result).toBeUndefined();
        });

        it("should handle sync entities by calling drawAny", async () => {
            const mockPoint = [1, 2, 3];
            const mockMesh = createMockMesh("test");
            
            spyManager.setupDetectors();
            jest.spyOn(draw, "drawAny").mockReturnValue(mockMesh);
            
            const result = await draw.drawAnyAsync({ entity: mockPoint as any });
            
            expect(draw.drawAny).toHaveBeenCalled();
            expect(result).toBe(mockMesh);
        });

        it("should handle JSCAD mesh", async () => {
            const mockJscadMesh = { type: "jscad" };
            const mockMesh = createMockMesh("jscad");
            
            spyManager.setupDetectors("JscadMesh");
            spyManager.setupHandler("handleJscadMesh", Promise.resolve(mockMesh));

            
            const result = await draw.drawAnyAsync({ entity: mockJscadMesh as any });
            
            expect(spyManager.getHandlerSpy("handleJscadMesh")).toHaveBeenCalled();
            expect(result).toBe(mockMesh);
        });

        it("should handle OCCT shape", async () => {
            const mockOcctShape = { type: "occt" };
            const mockMesh = createMockMesh("occt");
            
            spyManager.setupDetectors("OcctShape");
            spyManager.setupHandler("handleOcctShape", Promise.resolve(mockMesh));

            
            const result = await draw.drawAnyAsync({ entity: mockOcctShape as any });
            
            expect(spyManager.getHandlerSpy("handleOcctShape")).toHaveBeenCalled();
            expect(result).toBe(mockMesh);
        });

        it("should handle OCCT shapes array", async () => {
            const mockOcctShapes = [{ type: "occt1" }, { type: "occt2" }];
            const mockMesh = createMockMesh("occt-shapes");
            
            spyManager.setupDetectors("OcctShapes");
            spyManager.setupHandler("handleOcctShapes", Promise.resolve(mockMesh));

            
            const result = await draw.drawAnyAsync({ entity: mockOcctShapes as any });
            
            expect(spyManager.getHandlerSpy("handleOcctShapes")).toHaveBeenCalled();
            expect(result).toBe(mockMesh);
        });

        it("should handle JSCAD meshes array", async () => {
            const mockJscadMeshes = [{ vertices: [] }, { vertices: [] }];
            const mockMesh = createMockMesh("jscad-meshes");
            
            spyManager.setupDetectors("JscadMeshes");
            spyManager.setupHandler("handleJscadMeshes", Promise.resolve(mockMesh));

            
            const result = await draw.drawAnyAsync({ entity: mockJscadMeshes as any });
            
            expect(spyManager.getHandlerSpy("handleJscadMeshes")).toHaveBeenCalled();
            expect(result).toBe(mockMesh);
        });

        it("should handle Manifold shape", async () => {
            const mockManifoldShape = { type: "manifold" };
            const mockMesh = createMockMesh("manifold");
            
            spyManager.setupDetectors("ManifoldShape");
            spyManager.setupHandler("handleManifoldShape", Promise.resolve(mockMesh));

            
            const result = await draw.drawAnyAsync({ entity: mockManifoldShape as any });
            
            expect(spyManager.getHandlerSpy("handleManifoldShape")).toHaveBeenCalled();
            expect(result).toBe(mockMesh);
        });

        it("should handle Manifold shapes array", async () => {
            const mockManifoldShapes = [{ type: "manifold1" }, { type: "manifold2" }];
            const mockMesh = createMockMesh("manifold-shapes");
            
            spyManager.setupDetectors("ManifoldShapes");
            spyManager.setupHandler("handleManifoldShapes", Promise.resolve(mockMesh));

            
            const result = await draw.drawAnyAsync({ entity: mockManifoldShapes as any });
            
            expect(spyManager.getHandlerSpy("handleManifoldShapes")).toHaveBeenCalled();
            expect(result).toBe(mockMesh);
        });
    });

    describe("drawAnyAsyncNoReturn", () => {
        it("should call drawAnyAsync without returning value", async () => {
            jest.spyOn(draw, "drawAnyAsync").mockResolvedValue(undefined);
            
            const result = await draw.drawAnyAsyncNoReturn({ entity: [1, 2, 3] });
            
            expect(draw.drawAnyAsync).toHaveBeenCalled();
            expect(result).toBeUndefined();
        });
    });

    describe("drawAny", () => {
        it("should handle point entity", () => {
            const mockPoint = [1, 2, 3];
            const mockMesh = createMockMesh("point");
            mockDrawHelper.drawPoints = jest.fn().mockReturnValue(mockMesh);
            
            spyManager.setupHandler("handlePoint", mockMesh);
            
            
            const result = draw.drawAny({ entity: mockPoint as any });
            
            expect(result).toBe(mockMesh);
        });

        it("should handle line entity", () => {
            const mockLine = { start: [0, 0, 0], end: [1, 1, 1] };
            const mockMesh = createMockMesh("line");
            
            spyManager.setupHandler("handleLine", mockMesh);
            
            
            const result = draw.drawAny({ entity: mockLine as any });
            
            expect(result).toBe(mockMesh);
        });

        it("should handle BabylonMesh entity", () => {
            const mockBabylonMesh = createMockMeshWithMetadata("existing", "point");
            
            spyManager.setupHandler("updateAny", mockBabylonMesh);
            
            
            const result = draw.drawAny({ entity: mockBabylonMesh as any, babylonMesh: mockBabylonMesh });
            
            expect(spyManager.getHandlerSpy("updateAny")).toHaveBeenCalled();
            expect(result).toBe(mockBabylonMesh);
        });

        it("should detect and handle line entity", () => {
            const mockLine = { start: [0, 0, 0], end: [1, 1, 1] };
            const mockMesh = createMockMesh("line");
            mockDrawHelper.drawPolylinesWithColours = jest.fn().mockReturnValue(mockMesh);
            
            spyManager.setupDetectors("Line");
            spyManager.setupHandler("handleLine", mockMesh);
            
            
            const result = draw.drawAny({ entity: mockLine as any });
            
            expect(spyManager.getDetectorSpy("Line")).toHaveBeenCalledWith(mockLine);
            expect(spyManager.getHandlerSpy("handleLine")).toHaveBeenCalled();
            expect(result).toBe(mockMesh);
        });

        it("should detect and handle point entity", () => {
            const mockPoint = [1, 2, 3];
            const mockMesh = createMockMesh("point");
            mockDrawHelper.drawPoint = jest.fn().mockReturnValue(mockMesh);
            
            spyManager.setupDetectors("Point");
            spyManager.setupHandler("handlePoint", mockMesh);
            
            
            const result = draw.drawAny({ entity: mockPoint as any });
            
            expect(spyManager.getDetectorSpy("Point")).toHaveBeenCalledWith(mockPoint);
            expect(spyManager.getHandlerSpy("handlePoint")).toHaveBeenCalled();
            expect(result).toBe(mockMesh);
        });

        it("should detect and handle polyline entity", () => {
            const mockPolyline = { points: [[0, 0, 0], [1, 1, 1], [2, 2, 2]] };
            const mockMesh = createMockMesh("polyline");
            mockDrawHelper.drawPolylineClose = jest.fn().mockReturnValue(mockMesh);
            
            spyManager.setupDetectors("Polyline");
            spyManager.setupHandler("handlePolyline", mockMesh);
            
            
            const result = draw.drawAny({ entity: mockPolyline as any });
            
            expect(spyManager.getDetectorSpy("Polyline")).toHaveBeenCalledWith(mockPolyline);
            expect(spyManager.getHandlerSpy("handlePolyline")).toHaveBeenCalled();
            expect(result).toBe(mockMesh);
        });

        it("should detect and handle node entity", () => {
            const mockNode = [1, 2, 3];
            
            spyManager.setupDetectors("Node");
            spyManager.setupHandler("handleNode", mockNode);
            
            
            const result = draw.drawAny({ entity: mockNode as any });
            
            expect(spyManager.getDetectorSpy("Node")).toHaveBeenCalledWith(mockNode);
            expect(spyManager.getHandlerSpy("handleNode")).toHaveBeenCalled();
            expect(result).toBe(mockNode);
        });

        it("should detect and handle verbCurve entity", () => {
            const mockVerbCurve = { degree: 3, controlPoints: [] };
            const mockMesh = createMockMesh("verbCurve");
            mockDrawHelper.drawCurve = jest.fn().mockReturnValue(mockMesh);
            
            spyManager.setupDetectors("VerbCurve");
            spyManager.setupHandler("handleVerbCurve", mockMesh);
            
            
            const result = draw.drawAny({ entity: mockVerbCurve as any });
            
            expect(spyManager.getDetectorSpy("VerbCurve")).toHaveBeenCalledWith(mockVerbCurve);
            expect(spyManager.getHandlerSpy("handleVerbCurve")).toHaveBeenCalled();
            expect(result).toBe(mockMesh);
        });

        it("should detect and handle verbSurface entity", () => {
            const mockVerbSurface = { degreeU: 3, degreeV: 3, controlPoints: [] };
            const mockMesh = createMockMesh("verbSurface");
            mockDrawHelper.drawSurface = jest.fn().mockReturnValue(mockMesh);
            
            spyManager.setupDetectors("VerbSurface");
            spyManager.setupHandler("handleVerbSurface", mockMesh);
            
            
            const result = draw.drawAny({ entity: mockVerbSurface as any });
            
            expect(spyManager.getDetectorSpy("VerbSurface")).toHaveBeenCalledWith(mockVerbSurface);
            expect(spyManager.getHandlerSpy("handleVerbSurface")).toHaveBeenCalled();
            expect(result).toBe(mockMesh);
        });

        it("should detect and handle polylines array", () => {
            const mockPolylines = [
                { points: [[0, 0, 0], [1, 1, 1]] },
                { points: [[2, 2, 2], [3, 3, 3]] }
            ];
            const mockMesh = createMockMesh("polylines");
            mockDrawHelper.drawPolylinesWithColours = jest.fn().mockReturnValue(mockMesh);
            
            spyManager.setupDetectors("Polylines");
            spyManager.setupHandler("handlePolylines", mockMesh);
            
            
            const result = draw.drawAny({ entity: mockPolylines as any });
            
            expect(spyManager.getDetectorSpy("Polylines")).toHaveBeenCalledWith(mockPolylines);
            expect(spyManager.getHandlerSpy("handlePolylines")).toHaveBeenCalled();
            expect(result).toBe(mockMesh);
        });

        it("should detect and handle lines array", () => {
            const mockLines = [
                { start: [0, 0, 0], end: [1, 1, 1] },
                { start: [2, 2, 2], end: [3, 3, 3] }
            ];
            const mockMesh = createMockMesh("lines");
            mockDrawHelper.drawPolylinesWithColours = jest.fn().mockReturnValue(mockMesh);
            
            spyManager.setupDetectors("Lines");
            spyManager.setupHandler("handleLines", mockMesh);
            
            
            const result = draw.drawAny({ entity: mockLines as any });
            
            expect(spyManager.getDetectorSpy("Lines")).toHaveBeenCalledWith(mockLines);
            expect(spyManager.getHandlerSpy("handleLines")).toHaveBeenCalled();
            expect(result).toBe(mockMesh);
        });

        it("should detect and handle points array", () => {
            const mockPoints = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
            const mockMesh = createMockMesh("points");
            mockDrawHelper.drawPoints = jest.fn().mockReturnValue(mockMesh);
            
            spyManager.setupDetectors("Points");
            spyManager.setupHandler("handlePoints", mockMesh);
            
            
            const result = draw.drawAny({ entity: mockPoints as any });
            
            expect(spyManager.getDetectorSpy("Points")).toHaveBeenCalledWith(mockPoints);
            expect(spyManager.getHandlerSpy("handlePoints")).toHaveBeenCalled();
            expect(result).toBe(mockMesh);
        });

        it("should detect and handle nodes array", () => {
            const mockNodes = [[1, 2, 3], [4, 5, 6]];
            
            spyManager.setupDetectors("Nodes");
            spyManager.setupHandler("handleNodes", mockNodes);
            
            
            const result = draw.drawAny({ entity: mockNodes as any });
            
            expect(spyManager.getDetectorSpy("Nodes")).toHaveBeenCalledWith(mockNodes);
            expect(spyManager.getHandlerSpy("handleNodes")).toHaveBeenCalled();
            expect(result).toBe(mockNodes);
        });

        it("should detect and handle verbCurves array", () => {
            const mockVerbCurves = [
                { degree: 3, controlPoints: [] },
                { degree: 2, controlPoints: [] }
            ];
            const mockMesh = createMockMesh("verbCurves");
            mockDrawHelper.drawCurves = jest.fn().mockReturnValue(mockMesh);
            
            spyManager.setupDetectors("VerbCurves");
            spyManager.setupHandler("handleVerbCurves", mockMesh);
            
            
            const result = draw.drawAny({ entity: mockVerbCurves as any });
            
            expect(spyManager.getDetectorSpy("VerbCurves")).toHaveBeenCalledWith(mockVerbCurves);
            expect(spyManager.getHandlerSpy("handleVerbCurves")).toHaveBeenCalled();
            expect(result).toBe(mockMesh);
        });

        it("should detect and handle verbSurfaces array", () => {
            const mockVerbSurfaces = [
                { degreeU: 3, degreeV: 3, controlPoints: [] },
                { degreeU: 2, degreeV: 2, controlPoints: [] }
            ];
            const mockMesh = createMockMesh("verbSurfaces");
            mockDrawHelper.drawSurfacesMultiColour = jest.fn().mockReturnValue(mockMesh);
            
            spyManager.setupDetectors("VerbSurfaces");
            spyManager.setupHandler("handleVerbSurfaces", mockMesh);
            
            
            const result = draw.drawAny({ entity: mockVerbSurfaces as any });
            
            expect(spyManager.getDetectorSpy("VerbSurfaces")).toHaveBeenCalledWith(mockVerbSurfaces);
            expect(spyManager.getHandlerSpy("handleVerbSurfaces")).toHaveBeenCalled();
            expect(result).toBe(mockMesh);
        });

        it("should detect and handle tag entity", () => {
            const mockTag = { tag: "single" };
            const mockMesh = createMockMeshWithMetadata("tag", "tag");
            draw.tag.drawTag = jest.fn().mockReturnValue(mockMesh);
            
            spyManager.setupDetectors("Tag");
            spyManager.setupHandler("handleTag", mockMesh);
            
            
            const result = draw.drawAny({ entity: mockTag as any });
            
            expect(spyManager.getDetectorSpy("Tag")).toHaveBeenCalledWith(mockTag);
            expect(spyManager.getHandlerSpy("handleTag")).toHaveBeenCalled();
            expect(result).toBe(mockMesh);
        });

        it("should detect and handle tags array", () => {
            const mockTags = [{ tag: "test1" }, { tag: "test2" }];
            const mockMesh = createMockMesh("tags");
            mockTag.drawTags = jest.fn().mockReturnValue(mockMesh);
            
            spyManager.setupDetectors("Tags");
            spyManager.setupHandler("handleTags", mockMesh);
            
            
            const result = draw.drawAny({ entity: mockTags as any });
            
            expect(spyManager.getDetectorSpy("Tags")).toHaveBeenCalledWith(mockTags);
            expect(spyManager.getHandlerSpy("handleTags")).toHaveBeenCalled();
            expect(result).toBe(mockMesh);
        });

        it("should call updateAny when babylonMesh is provided", () => {
            
            const mockMesh = createMockMeshWithMetadata("existing", Inputs.Draw.drawingTypes.point as any);
            
            spyManager.setupHandler("updateAny", mockMesh);
            
            
            const result = draw.drawAny({ entity: [1, 2, 3] as any, babylonMesh: mockMesh });
            
            expect(spyManager.getHandlerSpy("updateAny")).toHaveBeenCalledWith({ entity: [1, 2, 3], babylonMesh: mockMesh });
            expect(result).toBe(mockMesh);
        });

        it("should call updateAny when entity is BabylonMesh instance", () => {
            const mockBabylonMesh = new BABYLON.Mesh("babylon", mockScene);
            mockBabylonMesh.metadata = { type: Inputs.Draw.drawingTypes.point, options: {} };
            
            spyManager.setupHandler("updateAny", mockBabylonMesh);
            
            
            const result = draw.drawAny({ entity: mockBabylonMesh as any });
            
            expect(spyManager.getHandlerSpy("updateAny")).toHaveBeenCalled();
            expect(result).toBe(mockBabylonMesh);
        });

        it("should return undefined when no entity type is detected", () => {
            const unknownEntity = { unknown: "type" };
            
            spyManager.setupDetectors();
            
            
            const result = draw.drawAny({ entity: unknownEntity as any });
            
            expect(result).toBeUndefined();
        });
    });

    describe("drawAnyNoReturn", () => {
        it("should call drawAny without returning value", () => {
            jest.spyOn(draw, "drawAny").mockReturnValue(undefined);
            
            const result = draw.drawAnyNoReturn({ entity: [1, 2, 3] });
            
            expect(draw.drawAny).toHaveBeenCalled();
            expect(result).toBeUndefined();
        });
    });

    describe("drawGridMesh", () => {
        it("should create grid mesh with default parameters", () => {
            const mockGridMaterial = {
                majorUnitFrequency: 0,
                minorUnitVisibility: 0,
                gridRatio: 0,
                backFaceCulling: false,
                mainColor: new BABYLON.Color3(1, 1, 1),
                lineColor: new BABYLON.Color3(0, 0, 0),
                opacity: 1,
            };
            (GridMaterial as unknown as jest.Mock).mockImplementation(() => mockGridMaterial);

            const mockGroundMesh = createMockMesh("ground");
            BABYLON.MeshBuilder.CreateGround = jest.fn().mockReturnValue(mockGroundMesh);

            const inputs: Inputs.Draw.SceneDrawGridMeshDto = {
                width: 100,
                height: 100,
                majorUnitFrequency: 10,
                minorUnitVisibility: 0.5,
                gridRatio: 1,
                backFaceCulling: false,
                mainColor: "#FFFFFF",
                secondaryColor: "#000000",
                opacity: 1,
                subdivisions: 10,
            };

            const result = draw.drawGridMesh(inputs);
            
            expect(result).toBeDefined();
            expect(BABYLON.MeshBuilder.CreateGround).toHaveBeenCalled();
        });

        it("should handle errors gracefully", () => {
            (GridMaterial as unknown as jest.Mock).mockImplementation(() => {
                throw new Error("Grid material error");
            });

            const consoleSpy = jest.spyOn(console, "log").mockImplementation();
            
            // Mock CreateGround to still return a mesh in error case
            const errorMesh = createMockMesh("error-ground");
            BABYLON.MeshBuilder.CreateGround = jest.fn().mockReturnValue(errorMesh);
            
            const inputs: Inputs.Draw.SceneDrawGridMeshDto = {
                width: 100,
                height: 100,
                majorUnitFrequency: 10,
                minorUnitVisibility: 0.5,
                gridRatio: 1,
                backFaceCulling: false,
                mainColor: "#FFFFFF",
                secondaryColor: "#000000",
                opacity: 1,
                subdivisions: 10,
            };

            const result = draw.drawGridMesh(inputs);
            
            expect(result).toBeDefined();
            expect(consoleSpy).toHaveBeenCalled();
            
            consoleSpy.mockRestore();
        });

        it("should set grid material properties correctly", () => {
            const mockGridMaterial = {
                majorUnitFrequency: 0,
                minorUnitVisibility: 0,
                gridRatio: 0,
                backFaceCulling: false,
                mainColor: new BABYLON.Color3(1, 1, 1),
                lineColor: new BABYLON.Color3(0, 0, 0),
                opacity: 1,
            };
            (GridMaterial as unknown as jest.Mock).mockImplementation(() => mockGridMaterial);

            const mockGroundMesh = createMockMesh("ground");
            BABYLON.MeshBuilder.CreateGround = jest.fn().mockReturnValue(mockGroundMesh);

            const inputs: Inputs.Draw.SceneDrawGridMeshDto = {
                width: 50,
                height: 75,
                majorUnitFrequency: 5,
                minorUnitVisibility: 0.8,
                gridRatio: 2,
                backFaceCulling: true,
                mainColor: "#FF0000",
                secondaryColor: "#00FF00",
                opacity: 0.7,
                subdivisions: 20,
            };

            draw.drawGridMesh(inputs);
            
            expect(mockGridMaterial.majorUnitFrequency).toBe(5);
            expect(mockGridMaterial.minorUnitVisibility).toBe(0.8);
            expect(mockGridMaterial.gridRatio).toBe(2);
            expect(mockGridMaterial.backFaceCulling).toBe(true);
            expect(mockGridMaterial.opacity).toBe(0.7);
        });
    });

    describe("drawGridMeshNoReturn", () => {
        it("should call drawGridMesh without returning value", () => {
            const mockMesh = createMockMesh("grid");
            jest.spyOn(draw, "drawGridMesh").mockReturnValue(mockMesh);
            
            const inputs: Inputs.Draw.SceneDrawGridMeshDto = {
                width: 100,
                height: 100,
                majorUnitFrequency: 10,
                minorUnitVisibility: 0.5,
                gridRatio: 1,
                backFaceCulling: false,
                mainColor: "#FFFFFF",
                secondaryColor: "#000000",
                opacity: 1,
                subdivisions: 10,
            };
            
            const result = draw.drawGridMeshNoReturn(inputs);
            
            expect(draw.drawGridMesh).toHaveBeenCalled();
            expect(result).toBeUndefined();
        });
    });

    describe("Options methods", () => {
        it("optionsSimple should return input options", () => {
            const options = new Inputs.Draw.DrawBasicGeometryOptions();
            options.size = 5;
            options.colours = "#FF0000";
            
            const result = draw.optionsSimple(options);
            
            expect(result).toBe(options);
            expect(result.size).toBe(5);
            expect(result.colours).toBe("#FF0000");
        });

        it("optionsOcctShape should return input options", () => {
            const options = new Inputs.Draw.DrawOcctShapeOptions();
            
            const result = draw.optionsOcctShape(options);
            
            expect(result).toBe(options);
        });

        it("optionsOcctShapeSimple should return input options", () => {
            const options = new Inputs.Draw.DrawOcctShapeSimpleOptions();
            
            const result = draw.optionsOcctShapeSimple(options);
            
            expect(result).toBe(options);
        });

        it("optionsOcctShapeMaterial should return input options", () => {
            const options = new Inputs.Draw.DrawOcctShapeMaterialOptions();
            
            const result = draw.optionsOcctShapeMaterial(options);
            
            expect(result).toBe(options);
        });

        it("optionsManifoldShapeMaterial should return input options", () => {
            const options = new Inputs.Draw.DrawManifoldOrCrossSectionOptions();
            
            const result = draw.optionsManifoldShapeMaterial(options);
            
            expect(result).toBe(options);
        });

        it("optionsBabylonNode should return input options", () => {
            const options: Inputs.Draw.DrawNodeOptions = {
                colorX: "#FF0000",
                colorY: "#00FF00",
                colorZ: "#0000FF",
                size: 3,
            };
            
            const result = draw.optionsBabylonNode(options);
            
            expect(result).toBe(options);
            expect(result.colorX).toBe("#FF0000");
            expect(result.size).toBe(3);
        });
    });

    describe("Private handle methods", () => {
        it("handleTags should call tag.drawTags", () => {
            const mockTags = [{ tag: "test1" }, { tag: "test2" }];
            const mockMesh = createMockMesh("tags");
            mockTag.drawTags = jest.fn().mockReturnValue(mockMesh);
            
            const result = drawPrivate.handleTags({ entity: mockTags });
            
            expect(mockTag.drawTags).toHaveBeenCalled();
            expect(result).toBeDefined();
            expect(result.metadata.type).toBe(Inputs.Draw.drawingTypes.tags);
        });

        it("handleTags should use provided options when options are passed", () => {
            const mockTags = [{ tag: "test1" }, { tag: "test2" }];
            const customOptions = { updatable: true, size: 22 };
            const mockMesh = createMockMesh("tags");
            mockTag.drawTags = jest.fn().mockReturnValue(mockMesh);
            
            const result = drawPrivate.handleTags({ entity: mockTags, options: customOptions });
            
            expect(mockTag.drawTags).toHaveBeenCalledWith(expect.objectContaining({
                updatable: true,
                size: 22
            }));
            expect(result).toBeDefined();
            expect(result.metadata.type).toBe(Inputs.Draw.drawingTypes.tags);
        });

        it("handleTags should use provided options when options are passed", () => {
            const mockTags = [{ tag: "test1" }, { tag: "test2" }];
            const customOptions = { updatable: true, size: 22 };
            const mockMesh = createMockMesh("tags");
            mockTag.drawTags = jest.fn().mockReturnValue(mockMesh);
            
            const result = drawPrivate.handleTags({ entity: mockTags, options: customOptions });
            
            expect(mockTag.drawTags).toHaveBeenCalledWith(expect.objectContaining({
                updatable: true,
                size: 22
            }));
            expect(result).toBeDefined();
            expect(result.metadata.type).toBe(Inputs.Draw.drawingTypes.tags);
        });

        it("handleTag should call tag.drawTag", () => {
            const mockTag = { tag: "single" };
            const mockMesh = createMockMesh("tag");
            mockMesh.metadata = { options: {} };
            draw.tag.drawTag = jest.fn().mockReturnValue(mockMesh);
            
            const result = drawPrivate.handleTag({ entity: mockTag });
            
            expect(draw.tag.drawTag).toHaveBeenCalled();
            expect(result).toBeDefined();
            expect(result.metadata.type).toBe(Inputs.Draw.drawingTypes.tag);
        });

        it("handleVerbSurfaces should call drawHelper.drawSurfacesMultiColour", () => {
            const mockSurfaces = [{ surface: "test" }];
            const mockMesh = createMockMesh("surfaces");
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawSurfacesMultiColour = jest.fn().mockReturnValue(mockMesh);
            
            const result = drawPrivate.handleVerbSurfaces({ entity: mockSurfaces });
            
            expect(mockDrawHelper.drawSurfacesMultiColour).toHaveBeenCalled();
            expect(result).toBeDefined();
        });

        it("handleVerbCurves should call drawHelper.drawCurves", () => {
            const mockCurves = [{ curve: "test" }];
            const mockMesh = createMockMesh("curves");
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawCurves = jest.fn().mockReturnValue(mockMesh);
            
            const result = drawPrivate.handleVerbCurves({ entity: mockCurves });
            
            expect(mockDrawHelper.drawCurves).toHaveBeenCalled();
            expect(result).toBeDefined();
        });

        it("handleNodes should call node.drawNodes", () => {
            const mockNodes = [[1, 2, 3], [4, 5, 6]];
            mockNode.drawNodes = jest.fn();
            
            // Mock the applyGlobalSettingsAndMetadataAndShadowCasting to avoid getChildMeshes call
            
            jest.spyOn(draw as any, "applyGlobalSettingsAndMetadataAndShadowCasting").mockImplementation(() => undefined);
            
            const result = drawPrivate.handleNodes({ entity: mockNodes });
            
            expect(mockNode.drawNodes).toHaveBeenCalled();
            expect(result).toBe(mockNodes);
        });

        it("handlePoints should call drawHelper.drawPoints", () => {
            const mockPoints = [[1, 2, 3], [4, 5, 6]];
            const mockMesh = createMockMesh("points");
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawPoints = jest.fn().mockReturnValue(mockMesh);
            
            const result = drawPrivate.handlePoints({ entity: mockPoints });
            
            expect(mockDrawHelper.drawPoints).toHaveBeenCalled();
            expect(result).toBeDefined();
        });

        it("handleLines should call drawHelper.drawPolylinesWithColours", () => {
            const mockLines = [
                { start: [0, 0, 0], end: [1, 1, 1] },
                { start: [1, 1, 1], end: [2, 2, 2] }
            ];
            const mockMesh = createMockMesh("lines");
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawPolylinesWithColours = jest.fn().mockReturnValue(mockMesh);
            
            const result = drawPrivate.handleLines({ entity: mockLines });
            
            expect(mockDrawHelper.drawPolylinesWithColours).toHaveBeenCalled();
            expect(result).toBeDefined();
        });

        it("handleLines should handle Segment3 format (arrays of points)", () => {
            const mockLinesAsSegments = [
                [[0, 0, 0], [1, 1, 1]],
                [[2, 2, 2], [3, 3, 3]]
            ] as Inputs.Base.Segment3[];
            const mockMesh = createMockMesh("lines");
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawPolylinesWithColours = jest.fn().mockReturnValue(mockMesh);
            
            const result = drawPrivate.handleLines({ entity: mockLinesAsSegments });
            
            expect(mockDrawHelper.drawPolylinesWithColours).toHaveBeenCalledWith(expect.objectContaining({
                polylines: expect.arrayContaining([
                    expect.objectContaining({ points: [[0, 0, 0], [1, 1, 1]] }),
                    expect.objectContaining({ points: [[2, 2, 2], [3, 3, 3]] })
                ])
            }));
            expect(result).toBeDefined();
        });

        it("handlePolylines should call drawHelper.drawPolylinesWithColours", () => {
            const mockPolylines = [
                { points: [[0, 0, 0], [1, 1, 1], [2, 2, 2]] }
            ];
            const mockMesh = createMockMesh("polylines");
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawPolylinesWithColours = jest.fn().mockReturnValue(mockMesh);
            
            const result = drawPrivate.handlePolylines({ entity: mockPolylines });
            
            expect(mockDrawHelper.drawPolylinesWithColours).toHaveBeenCalled();
            expect(result).toBeDefined();
        });
    });

    describe("Entity type detection and handling", () => {
        it("should handle multiple points", () => {
            const mockPoints = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
            const mockMesh = createMockMesh("points");
            mockDrawHelper.drawPoints = jest.fn().mockReturnValue(mockMesh);
            
            
            jest.spyOn(draw as any, "handlePoints").mockReturnValue(mockMesh);
            
            
            draw.drawAny({ entity: mockPoints as any });
            
            expect(drawPrivate.handlePoints).toHaveBeenCalledWith({ entity: mockPoints });
        });

        it("should handle multiple lines", () => {
            const mockLines = [
                { start: [0, 0, 0], end: [1, 1, 1] },
                { start: [2, 2, 2], end: [3, 3, 3] }
            ];
            const mockMesh = createMockMesh("lines");
            mockDrawHelper.drawLines = jest.fn().mockReturnValue(mockMesh);
            
            
            jest.spyOn(draw as any, "handleLines").mockReturnValue(mockMesh);
            
            
            draw.drawAny({ entity: mockLines as any });
            
            expect(drawPrivate.handleLines).toHaveBeenCalledWith({ entity: mockLines });
        });

        it("should handle single point with options", () => {
            const mockPoint = [1, 2, 3];
            const options = new Inputs.Draw.DrawBasicGeometryOptions();
            options.size = 10;
            options.colours = "#00FF00";
            
            const mockMesh = createMockMesh("point");
            mockDrawHelper.drawPoints = jest.fn().mockReturnValue(mockMesh);
            
            
            jest.spyOn(draw as any, "handlePoint").mockReturnValue(mockMesh);
            
            
            draw.drawAny({ entity: mockPoint as any, options });
            
            expect(drawPrivate.handlePoint).toHaveBeenCalled();
        });

        it("should handle polyline with options", () => {
            const mockPolyline = { points: [[0, 0, 0], [1, 1, 1], [2, 2, 2]] };
            const options = new Inputs.Draw.DrawBasicGeometryOptions();
            options.size = 3;
            
            const mockMesh = createMockMesh("polyline");
            mockDrawHelper.drawPolylines = jest.fn().mockReturnValue(mockMesh);
            
            
            jest.spyOn(draw as any, "handlePolyline").mockReturnValue(mockMesh);
            
            
            draw.drawAny({ entity: mockPolyline as any, options });
            
            expect(drawPrivate.handlePolyline).toHaveBeenCalled();
        });
    });

    describe("Update scenarios", () => {
        it("should update existing mesh with new point data", () => {
            const mockMesh = createMockMesh("existing");
            mockMesh.metadata = { type: Inputs.Draw.drawingTypes.point, options: {} };
            
            const newPoint = [5, 6, 7];
            const updatedMesh = createMockMesh("updated");
            
            
            jest.spyOn(draw as any, "handlePoint").mockReturnValue(updatedMesh);
            
            const result = drawPrivate.updateAny({ entity: newPoint, babylonMesh: mockMesh });
            
            expect(result).toBeDefined();
        });

        it("should update existing mesh with new line data", () => {
            const mockMesh = createMockMesh("existing");
            mockMesh.metadata = { type: Inputs.Draw.drawingTypes.line, options: {} };
            
            const newLine = { start: [0, 0, 0], end: [10, 10, 10] };
            const updatedMesh = createMockMesh("updated");
            
            
            jest.spyOn(draw as any, "handleLine").mockReturnValue(updatedMesh);
            
            const result = drawPrivate.updateAny({ entity: newLine, babylonMesh: mockMesh });
            
            expect(result).toBeDefined();
        });

        it("should preserve options when updating mesh", () => {
            const mockMesh = createMockMesh("existing");
            const existingOptions = { size: 5, colours: "#FF0000" };
            mockMesh.metadata = { type: Inputs.Draw.drawingTypes.points, options: existingOptions };
            
            const newPoints = [[1, 2, 3], [4, 5, 6]];
            const updatedMesh = createMockMesh("updated");
            
            mockDrawHelper.drawPoints = jest.fn().mockReturnValue(updatedMesh);
            
            jest.spyOn(draw as any, "handlePoints").mockReturnValue(updatedMesh);
            
            drawPrivate.updateAny({ entity: newPoints, babylonMesh: mockMesh });
            
            expect(drawPrivate.handlePoints).toHaveBeenCalled();
        });
    });

    describe("Multiple instances", () => {
        it("should create independent Draw instances", () => {
            const draw2 = new Draw(mockDrawHelper, mockNode, mockTag, mockContext);
            
            expect(draw).not.toBe(draw2);
            expect(draw.context).toBe(draw2.context);
        });

        it("should handle different entities independently", () => {
            const draw2 = new Draw(mockDrawHelper, mockNode, mockTag, mockContext);
            
            const mockMesh1 = createMockMesh("mesh1");
            const mockMesh2 = createMockMesh("mesh2");
            
            jest.spyOn(draw, "drawAny").mockReturnValue(mockMesh1);
            jest.spyOn(draw2, "drawAny").mockReturnValue(mockMesh2);
            
            const result1 = draw.drawAny({ entity: [1, 2, 3] });
            const result2 = draw2.drawAny({ entity: [4, 5, 6] });
            
            expect(result1).not.toBe(result2);
        });
    });

    describe("Integration with services", () => {
        it("should integrate with DrawHelper service", () => {
            expect(draw.drawHelper).toBeDefined();
            expect(typeof draw.drawHelper).toBe("object");
        });

        it("should integrate with Node service", () => {
            expect(draw.node).toBeDefined();
            expect(typeof draw.node).toBe("object");
        });

        it("should integrate with Tag service", () => {
            expect(draw.tag).toBeDefined();
            expect(typeof draw.tag).toBe("object");
        });

        it("should integrate with Context", () => {
            expect(draw.context).toBeDefined();
            expect(draw.context.scene).toBe(mockScene);
        });
    });

    describe("updateAny method", () => {
        it("should update point type mesh", () => {
            const mockMesh = createMockMesh("existing");
            mockMesh.metadata = { type: Inputs.Draw.drawingTypes.point, options: {} };
            
            const updatedMesh = createMockMesh("updated");
            
            jest.spyOn(draw as any, "handlePoint").mockReturnValue(updatedMesh);
            
            const result = drawPrivate.updateAny({ entity: [1, 2, 3], babylonMesh: mockMesh });
            
            expect(drawPrivate.handlePoint).toHaveBeenCalled();
            expect(result).toBe(updatedMesh);
        });

        it("should update points type mesh", () => {
            const mockMesh = createMockMesh("existing");
            mockMesh.metadata = { type: Inputs.Draw.drawingTypes.points, options: {} };
            
            const updatedMesh = createMockMesh("updated");
            
            jest.spyOn(draw as any, "handlePoints").mockReturnValue(updatedMesh);
            
            const result = drawPrivate.updateAny({ entity: [[1, 2, 3]], babylonMesh: mockMesh });
            
            expect(drawPrivate.handlePoints).toHaveBeenCalled();
            expect(result).toBe(updatedMesh);
        });

        it("should update line type mesh", () => {
            const mockMesh = createMockMesh("existing");
            mockMesh.metadata = { type: Inputs.Draw.drawingTypes.line, options: {} };
            
            const updatedMesh = createMockMesh("updated");
            
            jest.spyOn(draw as any, "handleLine").mockReturnValue(updatedMesh);
            
            const result = drawPrivate.updateAny({ entity: { start: [0, 0, 0], end: [1, 1, 1] }, babylonMesh: mockMesh });
            
            expect(drawPrivate.handleLine).toHaveBeenCalled();
            expect(result).toBe(updatedMesh);
        });

        it("should update lines type mesh", () => {
            const mockMesh = createMockMesh("existing");
            mockMesh.metadata = { type: Inputs.Draw.drawingTypes.lines, options: {} };
            
            const updatedMesh = createMockMesh("updated");
            
            jest.spyOn(draw as any, "handleLines").mockReturnValue(updatedMesh);
            
            const result = drawPrivate.updateAny({ entity: [], babylonMesh: mockMesh });
            
            expect(drawPrivate.handleLines).toHaveBeenCalled();
            expect(result).toBe(updatedMesh);
        });

        it("should update polyline type mesh", () => {
            const mockMesh = createMockMesh("existing");
            mockMesh.metadata = { type: Inputs.Draw.drawingTypes.polyline, options: {} };
            
            const updatedMesh = createMockMesh("updated");
            
            jest.spyOn(draw as any, "handlePolyline").mockReturnValue(updatedMesh);
            
            const result = drawPrivate.updateAny({ entity: { points: [] }, babylonMesh: mockMesh });
            
            expect(drawPrivate.handlePolyline).toHaveBeenCalled();
            expect(result).toBe(updatedMesh);
        });

        it("should update polylines type mesh", () => {
            const mockMesh = createMockMesh("existing");
            mockMesh.metadata = { type: Inputs.Draw.drawingTypes.polylines, options: {} };
            
            const updatedMesh = createMockMesh("updated");
            
            jest.spyOn(draw as any, "handlePolylines").mockReturnValue(updatedMesh);
            
            const result = drawPrivate.updateAny({ entity: [], babylonMesh: mockMesh });
            
            expect(drawPrivate.handlePolylines).toHaveBeenCalled();
            expect(result).toBe(updatedMesh);
        });

        it("should update verbCurve type mesh", () => {
            const mockMesh = createMockMesh("existing");
            mockMesh.metadata = { type: Inputs.Draw.drawingTypes.verbCurve, options: {} };
            
            const updatedMesh = createMockMesh("updated");
            
            jest.spyOn(draw as any, "handleVerbCurve").mockReturnValue(updatedMesh);
            
            const result = drawPrivate.updateAny({ entity: {}, babylonMesh: mockMesh });
            
            expect(drawPrivate.handleVerbCurve).toHaveBeenCalled();
            expect(result).toBe(updatedMesh);
        });

        it("should update verbCurves type mesh", () => {
            const mockMesh = createMockMesh("existing");
            mockMesh.metadata = { type: Inputs.Draw.drawingTypes.verbCurves, options: {} };
            
            const updatedMesh = createMockMesh("updated");
            
            jest.spyOn(draw as any, "handleVerbCurves").mockReturnValue(updatedMesh);
            
            const result = drawPrivate.updateAny({ entity: [], babylonMesh: mockMesh });
            
            expect(drawPrivate.handleVerbCurves).toHaveBeenCalled();
            expect(result).toBe(updatedMesh);
        });

        it("should update verbSurface type mesh", () => {
            const mockMesh = createMockMesh("existing");
            mockMesh.metadata = { type: Inputs.Draw.drawingTypes.verbSurface, options: {} };
            
            const updatedMesh = createMockMesh("updated");
            
            jest.spyOn(draw as any, "handleVerbSurface").mockReturnValue(updatedMesh);
            
            const result = drawPrivate.updateAny({ entity: {}, babylonMesh: mockMesh });
            
            expect(drawPrivate.handleVerbSurface).toHaveBeenCalled();
            expect(result).toBe(updatedMesh);
        });

        it("should update verbSurfaces type mesh", () => {
            const mockMesh = createMockMesh("existing");
            mockMesh.metadata = { type: Inputs.Draw.drawingTypes.verbSurfaces, options: {} };
            
            const updatedMesh = createMockMesh("updated");
            
            jest.spyOn(draw as any, "handleVerbSurfaces").mockReturnValue(updatedMesh);
            
            const result = drawPrivate.updateAny({ entity: [], babylonMesh: mockMesh });
            
            expect(drawPrivate.handleVerbSurfaces).toHaveBeenCalled();
            expect(result).toBe(updatedMesh);
        });

        it("should update tag type mesh", () => {
            const mockMesh = createMockMesh("existing");
            mockMesh.metadata = { type: Inputs.Draw.drawingTypes.tag, options: {} };
            
            const updatedMesh = createMockMesh("updated");
            
            jest.spyOn(draw as any, "handleTag").mockReturnValue(updatedMesh);
            
            const result = drawPrivate.updateAny({ entity: {}, babylonMesh: mockMesh });
            
            expect(drawPrivate.handleTag).toHaveBeenCalled();
            expect(result).toBe(updatedMesh);
        });

        it("should update tags type mesh", () => {
            const mockMesh = createMockMesh("existing");
            mockMesh.metadata = { type: Inputs.Draw.drawingTypes.tags, options: {} };
            
            const updatedMesh = createMockMesh("updated");
            
            jest.spyOn(draw as any, "handleTags").mockReturnValue(updatedMesh);
            
            const result = drawPrivate.updateAny({ entity: [], babylonMesh: mockMesh });
            
            expect(drawPrivate.handleTags).toHaveBeenCalled();
            expect(result).toBe(updatedMesh);
        });

        it("should update node type mesh", () => {
            const mockMesh = createMockMesh("existing");
            mockMesh.metadata = { type: Inputs.Draw.drawingTypes.node, options: {} };
            
            
            jest.spyOn(draw as any, "handleNode").mockReturnValue([1, 2, 3]);
            
            const result = drawPrivate.updateAny({ entity: [1, 2, 3], babylonMesh: mockMesh });
            
            expect(drawPrivate.handleNode).toHaveBeenCalled();
            expect(result).toEqual([1, 2, 3]);
        });

        it("should update nodes type mesh", () => {
            const mockMesh = createMockMesh("existing");
            mockMesh.metadata = { type: Inputs.Draw.drawingTypes.nodes, options: {} };
            
            
            jest.spyOn(draw as any, "handleNodes").mockReturnValue([[1, 2, 3]]);
            
            const result = drawPrivate.updateAny({ entity: [[1, 2, 3]], babylonMesh: mockMesh });
            
            expect(drawPrivate.handleNodes).toHaveBeenCalled();
            expect(result).toEqual([[1, 2, 3]]);
        });

        it("should return undefined for unknown type", () => {
            const mockMesh = createMockMesh("existing");
            
            mockMesh.metadata = { type: "unknown" as any, options: {} };
            
            const result = drawPrivate.updateAny({ entity: {}, babylonMesh: mockMesh });
            
            expect(result).toBeUndefined();
        });

        it("should return undefined if mesh has no metadata", () => {
            const mockMesh = createMockMesh("existing");
            
            const result = drawPrivate.updateAny({ entity: {}, babylonMesh: mockMesh });
            
            expect(result).toBeUndefined();
        });
    });

    describe("Single entity handle methods", () => {
        it("handlePoint should call drawHelper.drawPoint", () => {
            const mockPoint = [1, 2, 3];
            const mockMesh = createMockMesh("point");
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawPoint = jest.fn().mockReturnValue(mockMesh);
            
            const result = drawPrivate.handlePoint({ entity: mockPoint });
            
            expect(mockDrawHelper.drawPoint).toHaveBeenCalledWith(expect.objectContaining({
                point: mockPoint
            }));
            expect(result).toBeDefined();
        });

        it("handlePoint should use existing options from babylonMesh metadata", () => {
            const mockPoint = [1, 2, 3];
            const mockMesh = createMockMesh("point");
            mockMesh.metadata = { options: { size: 10, colours: "#FF0000" } };
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            
            mockDrawHelper.drawPoint = jest.fn().mockReturnValue(mockMesh);
            
            drawPrivate.handlePoint({ entity: mockPoint, babylonMesh: mockMesh });
            
            expect(mockDrawHelper.drawPoint).toHaveBeenCalledWith(expect.objectContaining({
                size: 10,
                colours: "#FF0000"
            }));
        });

        it("handleLine should call drawHelper.drawPolylinesWithColours with line object", () => {
            const mockLine = { start: [0, 0, 0], end: [1, 1, 1] };
            const mockMesh = createMockMesh("line");
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawPolylinesWithColours = jest.fn().mockReturnValue(mockMesh);
            
            const result = drawPrivate.handleLine({ entity: mockLine });
            
            expect(mockDrawHelper.drawPolylinesWithColours).toHaveBeenCalledWith(expect.objectContaining({
                polylines: [{ points: [[0, 0, 0], [1, 1, 1]] }]
            }));
            expect(result).toBeDefined();
        });

        it("handleLine should handle segment array format", () => {
            const mockLine = [[0, 0, 0], [1, 1, 1]];
            const mockMesh = createMockMesh("line");
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawPolylinesWithColours = jest.fn().mockReturnValue(mockMesh);
            
            const result = drawPrivate.handleLine({ entity: mockLine });
            
            expect(mockDrawHelper.drawPolylinesWithColours).toHaveBeenCalledWith(expect.objectContaining({
                polylines: [{ points: [[0, 0, 0], [1, 1, 1]] }]
            }));
            expect(result).toBeDefined();
        });

        it("handlePolyline should call drawHelper.drawPolylineClose", () => {
            const mockPolyline = { points: [[0, 0, 0], [1, 1, 1], [2, 2, 2]] };
            const mockMesh = createMockMesh("polyline");
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawPolylineClose = jest.fn().mockReturnValue(mockMesh);
            
            const result = drawPrivate.handlePolyline({ entity: mockPolyline });
            
            expect(mockDrawHelper.drawPolylineClose).toHaveBeenCalledWith(expect.objectContaining({
                polyline: mockPolyline
            }));
            expect(result).toBeDefined();
        });

        it("handleVerbSurface should call drawHelper.drawSurface", () => {
            const mockSurface = { surface: "test" };
            const mockMesh = createMockMesh("surface");
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawSurface = jest.fn().mockReturnValue(mockMesh);
            
            const result = drawPrivate.handleVerbSurface({ entity: mockSurface });
            
            expect(mockDrawHelper.drawSurface).toHaveBeenCalledWith(expect.objectContaining({
                surface: mockSurface
            }));
            expect(result).toBeDefined();
        });

        it("handleVerbCurve should call drawHelper.drawCurve", () => {
            const mockCurve = { curve: "test" };
            const mockMesh = createMockMesh("curve");
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawCurve = jest.fn().mockReturnValue(mockMesh);
            
            const result = drawPrivate.handleVerbCurve({ entity: mockCurve });
            
            expect(mockDrawHelper.drawCurve).toHaveBeenCalledWith(expect.objectContaining({
                curve: mockCurve
            }));
            expect(result).toBeDefined();
        });

        it("handleNode should call node.drawNode", () => {
            const mockNode = [1, 2, 3];
            draw.node.drawNode = jest.fn();
            
            
            jest.spyOn(draw as any, "applyGlobalSettingsAndMetadataAndShadowCasting").mockImplementation(() => undefined);
            
            const result = drawPrivate.handleNode({ entity: mockNode });
            
            expect(draw.node.drawNode).toHaveBeenCalledWith(expect.objectContaining({
                node: mockNode
            }));
            expect(result).toBe(mockNode);
        });
    });

    describe("Async handle methods", () => {
        it("handleJscadMesh should call drawHelper.drawSolidOrPolygonMesh", async () => {
            const mockJscadMesh = { type: "jscad" };
            const mockMesh = createMockMesh("jscad");
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawSolidOrPolygonMesh = jest.fn().mockResolvedValue(mockMesh);
            
            const result = await drawPrivate.handleJscadMesh({ entity: mockJscadMesh });
            
            expect(mockDrawHelper.drawSolidOrPolygonMesh).toHaveBeenCalledWith(expect.objectContaining({
                mesh: mockJscadMesh
            }));
            expect(result).toBeDefined();
        });

        it("handleJscadMeshes should call drawHelper.drawSolidOrPolygonMeshes", async () => {
            const mockJscadMeshes = [{ type: "jscad1" }, { type: "jscad2" }];
            const mockMesh = createMockMesh("jscad-meshes");
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawSolidOrPolygonMeshes = jest.fn().mockResolvedValue(mockMesh);
            
            const result = await drawPrivate.handleJscadMeshes({ entity: mockJscadMeshes });
            
            expect(mockDrawHelper.drawSolidOrPolygonMeshes).toHaveBeenCalledWith(expect.objectContaining({
                meshes: mockJscadMeshes
            }));
            expect(result).toBeDefined();
        });

        it("handleOcctShape should call drawHelper.drawShape", async () => {
            const mockOcctShape = { type: "occt" };
            const mockMesh = createMockMesh("occt");
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawShape = jest.fn().mockResolvedValue(mockMesh);
            
            const result = await drawPrivate.handleOcctShape({ entity: mockOcctShape });
            
            expect(mockDrawHelper.drawShape).toHaveBeenCalledWith(expect.objectContaining({
                shape: mockOcctShape
            }));
            expect(result).toBeDefined();
        });

        it("handleOcctShapes should call drawHelper.drawShapes", async () => {
            const mockOcctShapes = [{ type: "occt1" }, { type: "occt2" }];
            const mockMesh = createMockMesh("occt-shapes");
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawShapes = jest.fn().mockResolvedValue(mockMesh);
            
            const result = await drawPrivate.handleOcctShapes({ entity: mockOcctShapes });
            
            expect(mockDrawHelper.drawShapes).toHaveBeenCalledWith(expect.objectContaining({
                shapes: mockOcctShapes
            }));
            expect(result).toBeDefined();
        });

        it("handleManifoldShape should call drawHelper.drawManifoldOrCrossSection", async () => {
            const mockManifoldShape = { type: "manifold" };
            const mockMesh = createMockMesh("manifold");
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawManifoldOrCrossSection = jest.fn().mockResolvedValue(mockMesh);
            
            const result = await drawPrivate.handleManifoldShape({ entity: mockManifoldShape });
            
            expect(mockDrawHelper.drawManifoldOrCrossSection).toHaveBeenCalledWith(expect.objectContaining({
                manifoldOrCrossSection: mockManifoldShape
            }));
            expect(result).toBeDefined();
        });

        it("handleManifoldShapes should call drawHelper.drawManifoldsOrCrossSections", async () => {
            const mockManifoldShapes = [{ type: "manifold1" }, { type: "manifold2" }];
            const mockMesh = createMockMesh("manifold-shapes");
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawManifoldsOrCrossSections = jest.fn().mockResolvedValue(mockMesh);
            
            const result = await drawPrivate.handleManifoldShapes({ entity: mockManifoldShapes });
            
            expect(mockDrawHelper.drawManifoldsOrCrossSections).toHaveBeenCalledWith(expect.objectContaining({
                manifoldsOrCrossSections: mockManifoldShapes
            }));
            expect(result).toBeDefined();
        });

        it("handleJscadMesh should use options from babylonMesh metadata", async () => {
            const mockJscadMesh = { type: "jscad" };
            const mockMesh = createMockMesh("jscad");
            mockMesh.metadata = { options: { size: 5 } };
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawSolidOrPolygonMesh = jest.fn().mockResolvedValue(mockMesh);
            
            await drawPrivate.handleJscadMesh({ entity: mockJscadMesh, babylonMesh: mockMesh });
            
            expect(mockDrawHelper.drawSolidOrPolygonMesh).toHaveBeenCalledWith(expect.objectContaining({
                size: 5
            }));
        });

        it("handleOcctShape should use options from babylonMesh metadata", async () => {
            const mockOcctShape = { type: "occt" };
            const mockMesh = createMockMesh("occt");
            mockMesh.metadata = { options: { drawEdges: true } };
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawShape = jest.fn().mockResolvedValue(mockMesh);
            
            await drawPrivate.handleOcctShape({ entity: mockOcctShape, babylonMesh: mockMesh });
            
            expect(mockDrawHelper.drawShape).toHaveBeenCalledWith(expect.objectContaining({
                drawEdges: true
            }));
        });
    });

    describe("applyGlobalSettingsAndMetadataAndShadowCasting", () => {
        it("should set mesh as not pickable", () => {
            const mockMesh = createMockMesh("test");
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            
            drawPrivate.applyGlobalSettingsAndMetadataAndShadowCasting(
                Inputs.Draw.drawingTypes.point,
                {},
                mockMesh
            );
            
            expect(mockMesh.isPickable).toBe(false);
        });

        it("should set child meshes as not pickable", () => {
            const mockMesh = createMockMesh("test");
            const childMesh1 = createMockMesh("child1");
            const childMesh2 = createMockMesh("child2");
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([childMesh1, childMesh2]);
            
            drawPrivate.applyGlobalSettingsAndMetadataAndShadowCasting(
                Inputs.Draw.drawingTypes.point,
                {},
                mockMesh
            );
            
            expect(childMesh1.isPickable).toBe(false);
            expect(childMesh2.isPickable).toBe(false);
        });

        it("should set metadata on mesh", () => {
            const mockMesh = createMockMesh("test");
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            const options = { size: 5 };
            
            drawPrivate.applyGlobalSettingsAndMetadataAndShadowCasting(
                Inputs.Draw.drawingTypes.point,
                options,
                mockMesh
            );
            
            expect(mockMesh.metadata).toBeDefined();
            expect(mockMesh.metadata.type).toBe(Inputs.Draw.drawingTypes.point);
            expect(mockMesh.metadata.options).toBe(options);
        });

        it("should preserve existing metadata", () => {
            const mockMesh = createMockMesh("test");
            mockMesh.metadata = { existingProp: "value" };
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            
            drawPrivate.applyGlobalSettingsAndMetadataAndShadowCasting(
                Inputs.Draw.drawingTypes.point,
                {},
                mockMesh
            );
            
            expect(mockMesh.metadata.existingProp).toBe("value");
            expect(mockMesh.metadata.type).toBe(Inputs.Draw.drawingTypes.point);
        });

        it("should enable shadows by default", () => {
            const mockMesh = createMockMesh("test");
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            
            const mockShadowGenerator = {
                addShadowCaster: jest.fn()
            };
            mockScene.metadata.shadowGenerators = [mockShadowGenerator];
            
            drawPrivate.applyGlobalSettingsAndMetadataAndShadowCasting(
                Inputs.Draw.drawingTypes.point,
                {},
                mockMesh
            );
            
            expect(mockMesh.receiveShadows).toBe(true);
            expect(mockShadowGenerator.addShadowCaster).toHaveBeenCalledWith(mockMesh);
        });

        it("should disable shadows when metadata.shadows is false", () => {
            const mockMesh = createMockMesh("test");
            mockMesh.metadata = { shadows: false };
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            
            const mockShadowGenerator = {
                addShadowCaster: jest.fn()
            };
            mockScene.metadata.shadowGenerators = [mockShadowGenerator];
            
            drawPrivate.applyGlobalSettingsAndMetadataAndShadowCasting(
                Inputs.Draw.drawingTypes.point,
                {},
                mockMesh
            );
            
            expect(mockMesh.receiveShadows).toBeUndefined();
            expect(mockShadowGenerator.addShadowCaster).not.toHaveBeenCalled();
        });

        it("should handle child meshes with shadows", () => {
            const mockMesh = createMockMesh("test");
            const childMesh = createMockMesh("child");
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([childMesh]);
            
            const mockShadowGenerator = {
                addShadowCaster: jest.fn()
            };
            mockScene.metadata.shadowGenerators = [mockShadowGenerator];
            
            drawPrivate.applyGlobalSettingsAndMetadataAndShadowCasting(
                Inputs.Draw.drawingTypes.point,
                {},
                mockMesh
            );
            
            expect(childMesh.receiveShadows).toBe(true);
            expect(mockShadowGenerator.addShadowCaster).toHaveBeenCalledWith(childMesh);
        });

        it("should handle multiple shadow generators", () => {
            const mockMesh = createMockMesh("test");
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            
            const mockShadowGenerator1 = { addShadowCaster: jest.fn() };
            const mockShadowGenerator2 = { addShadowCaster: jest.fn() };
            mockScene.metadata.shadowGenerators = [mockShadowGenerator1, mockShadowGenerator2];
            
            drawPrivate.applyGlobalSettingsAndMetadataAndShadowCasting(
                Inputs.Draw.drawingTypes.point,
                {},
                mockMesh
            );
            
            expect(mockShadowGenerator1.addShadowCaster).toHaveBeenCalledWith(mockMesh);
            expect(mockShadowGenerator2.addShadowCaster).toHaveBeenCalledWith(mockMesh);
        });

        it("should not crash when result is undefined", () => {
            expect(() => {
                drawPrivate.applyGlobalSettingsAndMetadataAndShadowCasting(
                    Inputs.Draw.drawingTypes.point,
                    {},
                    undefined
                );
            }).not.toThrow();
        });

        it("should handle empty shadow generators array", () => {
            const mockMesh = createMockMesh("test");
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockScene.metadata.shadowGenerators = [];
            
            drawPrivate.applyGlobalSettingsAndMetadataAndShadowCasting(
                Inputs.Draw.drawingTypes.point,
                {},
                mockMesh
            );
            
            expect(mockMesh.receiveShadows).toBeUndefined();
        });
    });

    describe("Options preservation in handle methods", () => {
        it("handlePoints should use custom options when provided", () => {
            const mockPoints = [[1, 2, 3], [4, 5, 6]];
            const customOptions = { size: 15, colours: "#00FF00" };
            const mockMesh = createMockMesh("points");
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawPoints = jest.fn().mockReturnValue(mockMesh);
            
            drawPrivate.handlePoints({ entity: mockPoints, options: customOptions });
            
            expect(mockDrawHelper.drawPoints).toHaveBeenCalledWith(expect.objectContaining({
                size: 15,
                colours: "#00FF00"
            }));
        });

        it("handlePoints should use metadata options when babylonMesh provided and no options", () => {
            const mockPoints = [[1, 2, 3], [4, 5, 6]];
            const mockMesh = createMockMesh("points");
            mockMesh.metadata = { options: { size: 20, colours: "#FF00FF" } };
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawPoints = jest.fn().mockReturnValue(mockMesh);
            
            drawPrivate.handlePoints({ entity: mockPoints, babylonMesh: mockMesh });
            
            expect(mockDrawHelper.drawPoints).toHaveBeenCalledWith(expect.objectContaining({
                size: 20,
                colours: "#FF00FF"
            }));
        });

        it("handleLines should use default polyline options when no options provided", () => {
            const mockLines = [{ start: [0, 0, 0], end: [1, 1, 1] }];
            const mockMesh = createMockMesh("lines");
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawPolylinesWithColours = jest.fn().mockReturnValue(mockMesh);
            
            drawPrivate.handleLines({ entity: mockLines });
            
            expect(mockDrawHelper.drawPolylinesWithColours).toHaveBeenCalledWith(expect.objectContaining({
                size: 2,
                colours: "#ff00ff"
            }));
        });

        it("handleLines should use metadata options when babylonMesh provided and no options", () => {
            const mockLines = [{ start: [0, 0, 0], end: [1, 1, 1] }];
            const mockMesh = createMockMesh("lines");
            mockMesh.metadata = { options: { size: 7, colours: "#00FFFF" } };
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawPolylinesWithColours = jest.fn().mockReturnValue(mockMesh);
            
            drawPrivate.handleLines({ entity: mockLines, babylonMesh: mockMesh });
            
            expect(mockDrawHelper.drawPolylinesWithColours).toHaveBeenCalledWith(expect.objectContaining({
                size: 7,
                colours: "#00FFFF"
            }));
        });

        it("handleVerbCurves should use metadata options when babylonMesh provided", () => {
            const mockCurves = [{ curve: "test" }];
            const mockMesh = createMockMesh("curves");
            mockMesh.metadata = { options: { size: 8 } };
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawCurves = jest.fn().mockReturnValue(mockMesh);
            
            drawPrivate.handleVerbCurves({ entity: mockCurves, babylonMesh: mockMesh });
            
            expect(mockDrawHelper.drawCurves).toHaveBeenCalledWith(expect.objectContaining({
                size: 8
            }));
        });

        it("handleNode should use default node options", () => {
            const mockNodeData = [1, 2, 3];
            draw.node.drawNode = jest.fn();
            
            jest.spyOn(draw as any, "applyGlobalSettingsAndMetadataAndShadowCasting").mockImplementation(() => undefined);
            
            drawPrivate.handleNode({ entity: mockNodeData });
            
            expect(draw.node.drawNode).toHaveBeenCalledWith(expect.objectContaining({
                colorX: "#ff0000",
                colorY: "#00ff00",
                colorZ: "#0000ff",
                size: 2
            }));
        });

        it("handleNode should use metadata options when babylonMesh provided and no options", () => {
            const mockNodeData = [1, 2, 3];
            const mockMesh = createMockMesh("node");
            mockMesh.metadata = { options: { size: 25, colorX: "#AABBCC", colorY: "#DDEEFF" } };
            draw.node.drawNode = jest.fn();
            
            jest.spyOn(draw as any, "applyGlobalSettingsAndMetadataAndShadowCasting").mockImplementation(() => undefined);
            
            drawPrivate.handleNode({ entity: mockNodeData, babylonMesh: mockMesh });
            
            expect(draw.node.drawNode).toHaveBeenCalledWith(expect.objectContaining({
                size: 25,
                colorX: "#AABBCC",
                colorY: "#DDEEFF"
            }));
        });

        it("handlePolyline should use metadata options when babylonMesh provided", () => {
            const mockPolyline = { points: [[0, 0, 0], [1, 1, 1]] };
            const mockMesh = createMockMesh("polyline");
            mockMesh.metadata = { options: { size: 10, colours: "#123456" } };
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawPolylineClose = jest.fn().mockReturnValue(mockMesh);
            
            drawPrivate.handlePolyline({ entity: mockPolyline, babylonMesh: mockMesh });
            
            expect(mockDrawHelper.drawPolylineClose).toHaveBeenCalledWith(expect.objectContaining({
                size: 10,
                colours: "#123456"
            }));
        });

        it("handleLine should use metadata options when babylonMesh provided", () => {
            const mockLine = { start: [0, 0, 0], end: [1, 1, 1] };
            const mockMesh = createMockMesh("line");
            mockMesh.metadata = { options: { size: 5, colours: "#abcdef" } };
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawPolylinesWithColours = jest.fn().mockReturnValue(mockMesh);
            
            drawPrivate.handleLine({ entity: mockLine, babylonMesh: mockMesh });
            
            expect(mockDrawHelper.drawPolylinesWithColours).toHaveBeenCalledWith(expect.objectContaining({
                size: 5,
                colours: "#abcdef"
            }));
        });

        it("handlePoint should use metadata options when babylonMesh provided", () => {
            const mockPoint = [1, 2, 3];
            const mockMesh = createMockMesh("point");
            mockMesh.metadata = { options: { size: 12, colours: "#ffffff" } };
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawPoint = jest.fn().mockReturnValue(mockMesh);
            
            drawPrivate.handlePoint({ entity: mockPoint, babylonMesh: mockMesh });
            
            expect(mockDrawHelper.drawPoint).toHaveBeenCalledWith(expect.objectContaining({
                size: 12,
                colours: "#ffffff"
            }));
        });

        it("handlePolylines should use metadata options when babylonMesh provided", () => {
            const mockPolylines = [{ points: [[0, 0, 0], [1, 1, 1]] }, { points: [[2, 2, 2], [3, 3, 3]] }];
            const mockMesh = createMockMesh("polylines");
            mockMesh.metadata = { options: { size: 3, colours: "#aabbcc" } };
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawPolylinesWithColours = jest.fn().mockReturnValue(mockMesh);
            
            drawPrivate.handlePolylines({ entity: mockPolylines, babylonMesh: mockMesh });
            
            expect(mockDrawHelper.drawPolylinesWithColours).toHaveBeenCalledWith(expect.objectContaining({
                size: 3,
                colours: "#aabbcc"
            }));
        });

        it("handleVerbCurve should use metadata options when babylonMesh provided", () => {
            const mockCurve = { degree: 3, controlPoints: [] };
            const mockMesh = createMockMesh("curve");
            mockMesh.metadata = { options: { size: 6, colours: "#112233" } };
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawCurve = jest.fn().mockReturnValue(mockMesh);
            
            drawPrivate.handleVerbCurve({ entity: mockCurve, babylonMesh: mockMesh });
            
            expect(mockDrawHelper.drawCurve).toHaveBeenCalledWith(expect.objectContaining({
                size: 6,
                colours: "#112233"
            }));
        });

        it("handleVerbSurface should use metadata options when babylonMesh provided", () => {
            const mockSurface = { degreeU: 3, degreeV: 3, controlPoints: [] };
            const mockMesh = createMockMesh("surface");
            mockMesh.metadata = { options: { size: 7, colours: "#445566" } };
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawSurface = jest.fn().mockReturnValue(mockMesh);
            
            drawPrivate.handleVerbSurface({ entity: mockSurface, babylonMesh: mockMesh });
            
            expect(mockDrawHelper.drawSurface).toHaveBeenCalledWith(expect.objectContaining({
                size: 7,
                colours: "#445566"
            }));
        });

        it("handleVerbSurfaces should use metadata options when babylonMesh provided", () => {
            const mockSurfaces = [
                { degreeU: 3, degreeV: 3, controlPoints: [] },
                { degreeU: 2, degreeV: 2, controlPoints: [] }
            ];
            const mockMesh = createMockMesh("surfaces");
            mockMesh.metadata = { options: { size: 9, colours: "#778899" } };
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawSurfacesMultiColour = jest.fn().mockReturnValue(mockMesh);
            
            drawPrivate.handleVerbSurfaces({ entity: mockSurfaces, babylonMesh: mockMesh });
            
            expect(mockDrawHelper.drawSurfacesMultiColour).toHaveBeenCalledWith(expect.objectContaining({
                size: 9,
                colours: "#778899"
            }));
        });

        it("handleNodes should use metadata options when babylonMesh provided", () => {
            const mockNodes = [[1, 2, 3], [4, 5, 6]];
            const mockMesh = createMockMesh("nodes");
            mockMesh.metadata = { options: { size: 11, colorX: "#111111" } };
            draw.node.drawNodes = jest.fn();
            
            jest.spyOn(draw as any, "applyGlobalSettingsAndMetadataAndShadowCasting").mockImplementation(() => undefined);
            
            drawPrivate.handleNodes({ entity: mockNodes, babylonMesh: mockMesh });
            
            expect(draw.node.drawNodes).toHaveBeenCalledWith(expect.objectContaining({
                size: 11,
                colorX: "#111111"
            }));
        });

        it("handleTag should use metadata options when babylonMesh provided", () => {
            const mockTagEntity = { tag: "test" };
            const mockMesh = createMockMesh("tag");
            mockMesh.metadata = { options: { size: 14, colours: "#fedcba" } };
            draw.tag.drawTag = jest.fn().mockReturnValue(mockMesh);
            
            drawPrivate.handleTag({ entity: mockTagEntity, babylonMesh: mockMesh });
            
            expect(draw.tag.drawTag).toHaveBeenCalledWith(expect.objectContaining({
                size: 14,
                colours: "#fedcba"
            }));
        });

        it("handleJscadMesh should use metadata options when babylonMesh provided", async () => {
            const mockJscadMesh = { vertices: [] };
            const mockMesh = createMockMesh("jscad");
            mockMesh.metadata = { options: { size: 4, colours: "#abc123" } };
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawSolidOrPolygonMesh = jest.fn().mockResolvedValue(mockMesh);
            
            jest.spyOn(draw as any, "applyGlobalSettingsAndMetadataAndShadowCasting").mockImplementation(() => undefined);
            
            await drawPrivate.handleJscadMesh({ entity: mockJscadMesh, babylonMesh: mockMesh });
            
            expect(mockDrawHelper.drawSolidOrPolygonMesh).toHaveBeenCalledWith(expect.objectContaining({
                size: 4,
                colours: "#abc123"
            }));
        });

        it("handleJscadMeshes should use metadata options when babylonMesh provided", async () => {
            const mockJscadMeshes = [{ vertices: [] }, { vertices: [] }];
            const mockMesh = createMockMesh("jscads");
            mockMesh.metadata = { options: { size: 13, colours: "#def456" } };
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawSolidOrPolygonMeshes = jest.fn().mockResolvedValue(mockMesh);
            
            jest.spyOn(draw as any, "applyGlobalSettingsAndMetadataAndShadowCasting").mockImplementation(() => undefined);
            
            await drawPrivate.handleJscadMeshes({ entity: mockJscadMeshes, babylonMesh: mockMesh });
            
            expect(mockDrawHelper.drawSolidOrPolygonMeshes).toHaveBeenCalledWith(expect.objectContaining({
                size: 13,
                colours: "#def456"
            }));
        });

        it("handleOcctShape should use metadata options when babylonMesh provided", async () => {
            const mockOcctShape = { hash: "shape123" };
            const mockMesh = createMockMesh("occt");
            mockMesh.metadata = { options: { faceMaterial: "#123abc", edgeMaterial: "#456def" } };
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawShape = jest.fn().mockResolvedValue(mockMesh);
            
            jest.spyOn(draw as any, "applyGlobalSettingsAndMetadataAndShadowCasting").mockImplementation(() => undefined);
            
            await drawPrivate.handleOcctShape({ entity: mockOcctShape, babylonMesh: mockMesh });
            
            expect(mockDrawHelper.drawShape).toHaveBeenCalledWith(expect.objectContaining({
                faceMaterial: "#123abc",
                edgeMaterial: "#456def"
            }));
        });

        it("handleOcctShapes should use metadata options when babylonMesh provided", async () => {
            const mockOcctShapes = [{ hash: "shape1" }, { hash: "shape2" }];
            const mockMesh = createMockMesh("occts");
            mockMesh.metadata = { options: { faceMaterial: "#789ghi", edgeMaterial: "#012jkl" } };
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawShapes = jest.fn().mockResolvedValue(mockMesh);
            
            jest.spyOn(draw as any, "applyGlobalSettingsAndMetadataAndShadowCasting").mockImplementation(() => undefined);
            
            await drawPrivate.handleOcctShapes({ entity: mockOcctShapes, babylonMesh: mockMesh });
            
            expect(mockDrawHelper.drawShapes).toHaveBeenCalledWith(expect.objectContaining({
                faceMaterial: "#789ghi",
                edgeMaterial: "#012jkl"
            }));
        });

        it("handleManifoldShape should use metadata options when babylonMesh provided", async () => {
            const mockManifoldShape = { hash: "manifold123" };
            const mockMesh = createMockMesh("manifold");
            mockMesh.metadata = { options: { faceMaterial: "#aaa111", edgeMaterial: "#bbb222" } };
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawManifoldOrCrossSection = jest.fn().mockResolvedValue(mockMesh);
            
            jest.spyOn(draw as any, "applyGlobalSettingsAndMetadataAndShadowCasting").mockImplementation(() => undefined);
            
            await drawPrivate.handleManifoldShape({ entity: mockManifoldShape, babylonMesh: mockMesh });
            
            expect(mockDrawHelper.drawManifoldOrCrossSection).toHaveBeenCalledWith(expect.objectContaining({
                faceMaterial: "#aaa111",
                edgeMaterial: "#bbb222"
            }));
        });

        it("handleManifoldShapes should use metadata options when babylonMesh provided", async () => {
            const mockManifoldShapes = [{ hash: "manifold1" }, { hash: "manifold2" }];
            const mockMesh = createMockMesh("manifolds");
            mockMesh.metadata = { options: { faceMaterial: "#ccc333", edgeMaterial: "#ddd444" } };
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawManifoldsOrCrossSections = jest.fn().mockResolvedValue(mockMesh);
            
            jest.spyOn(draw as any, "applyGlobalSettingsAndMetadataAndShadowCasting").mockImplementation(() => undefined);
            
            await drawPrivate.handleManifoldShapes({ entity: mockManifoldShapes, babylonMesh: mockMesh });
            
            expect(mockDrawHelper.drawManifoldsOrCrossSections).toHaveBeenCalledWith(expect.objectContaining({
                faceMaterial: "#ccc333",
                edgeMaterial: "#ddd444"
            }));
        });
    });

    describe("Options passed directly to handle methods", () => {
        it("handleTag should use provided options when options are passed", () => {
            const mockTagEntity = { tag: "test" };
            const customOptions = { size: 99, colours: "#990099" };
            const mockMesh = createMockMesh("tag");
            mockMesh.metadata = { options: {} };
            draw.tag.drawTag = jest.fn().mockReturnValue(mockMesh);
            
            drawPrivate.handleTag({ entity: mockTagEntity, options: customOptions });
            
            expect(draw.tag.drawTag).toHaveBeenCalledWith(expect.objectContaining({
                size: 99,
                colours: "#990099"
            }));
        });

        it("handleVerbSurfaces should use provided options when options are passed", () => {
            const mockSurfaces = [{ degreeU: 3, degreeV: 3, controlPoints: [] }];
            const customOptions = { size: 50, colours: "#505050" };
            const mockMesh = createMockMesh("surfaces");
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawSurfacesMultiColour = jest.fn().mockReturnValue(mockMesh);
            
            drawPrivate.handleVerbSurfaces({ entity: mockSurfaces, options: customOptions });
            
            expect(mockDrawHelper.drawSurfacesMultiColour).toHaveBeenCalledWith(expect.objectContaining({
                size: 50,
                colours: "#505050"
            }));
        });

        it("handleVerbCurves should use provided options when options are passed", () => {
            const mockCurves = [{ degree: 3, controlPoints: [] }];
            const customOptions = { size: 45, colours: "#454545" };
            const mockMesh = createMockMesh("curves");
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawCurves = jest.fn().mockReturnValue(mockMesh);
            
            drawPrivate.handleVerbCurves({ entity: mockCurves, options: customOptions });
            
            expect(mockDrawHelper.drawCurves).toHaveBeenCalledWith(expect.objectContaining({
                size: 45,
                colours: "#454545"
            }));
        });

        it("handleNodes should use provided options when options are passed", () => {
            const mockNodes = [[1, 2, 3], [4, 5, 6]];
            const customOptions = { size: 30, colorX: "#303030", colorY: "#404040" };
            draw.node.drawNodes = jest.fn();
            
            jest.spyOn(draw as any, "applyGlobalSettingsAndMetadataAndShadowCasting").mockImplementation(() => undefined);
            
            drawPrivate.handleNodes({ entity: mockNodes, options: customOptions });
            
            expect(draw.node.drawNodes).toHaveBeenCalledWith(expect.objectContaining({
                size: 30,
                colorX: "#303030",
                colorY: "#404040"
            }));
        });

        it("handlePoints should use provided options when options are passed", () => {
            const mockPoints = [[1, 2, 3], [4, 5, 6]];
            const customOptions = { size: 25, colours: "#252525" };
            const mockMesh = createMockMesh("points");
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawPoints = jest.fn().mockReturnValue(mockMesh);
            
            drawPrivate.handlePoints({ entity: mockPoints, options: customOptions });
            
            expect(mockDrawHelper.drawPoints).toHaveBeenCalledWith(expect.objectContaining({
                size: 25,
                colours: "#252525"
            }));
        });

        it("handleLines should use provided options when options are passed", () => {
            const mockLines = [{ start: [0, 0, 0], end: [1, 1, 1] }];
            const customOptions = { size: 35, colours: "#353535" };
            const mockMesh = createMockMesh("lines");
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawPolylinesWithColours = jest.fn().mockReturnValue(mockMesh);
            
            drawPrivate.handleLines({ entity: mockLines, options: customOptions });
            
            expect(mockDrawHelper.drawPolylinesWithColours).toHaveBeenCalledWith(expect.objectContaining({
                size: 35,
                colours: "#353535"
            }));
        });

        it("handlePolylines should use provided options when options are passed", () => {
            const mockPolylines = [{ points: [[0, 0, 0], [1, 1, 1]] }];
            const customOptions = { size: 40, colours: "#404040" };
            const mockMesh = createMockMesh("polylines");
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawPolylinesWithColours = jest.fn().mockReturnValue(mockMesh);
            
            drawPrivate.handlePolylines({ entity: mockPolylines, options: customOptions });
            
            expect(mockDrawHelper.drawPolylinesWithColours).toHaveBeenCalledWith(expect.objectContaining({
                size: 40,
                colours: "#404040"
            }));
        });

        it("handleVerbSurface should use provided options when options are passed", () => {
            const mockSurface = { degreeU: 3, degreeV: 3, controlPoints: [] };
            const customOptions = { size: 55, colours: "#555555" };
            const mockMesh = createMockMesh("surface");
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawSurface = jest.fn().mockReturnValue(mockMesh);
            
            drawPrivate.handleVerbSurface({ entity: mockSurface, options: customOptions });
            
            expect(mockDrawHelper.drawSurface).toHaveBeenCalledWith(expect.objectContaining({
                size: 55,
                colours: "#555555"
            }));
        });

        it("handleVerbCurve should use provided options when options are passed", () => {
            const mockCurve = { degree: 3, controlPoints: [] };
            const customOptions = { size: 60, colours: "#606060" };
            const mockMesh = createMockMesh("curve");
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawCurve = jest.fn().mockReturnValue(mockMesh);
            
            drawPrivate.handleVerbCurve({ entity: mockCurve, options: customOptions });
            
            expect(mockDrawHelper.drawCurve).toHaveBeenCalledWith(expect.objectContaining({
                size: 60,
                colours: "#606060"
            }));
        });

        it("handleNode should use provided options when options are passed", () => {
            const mockNodeData = [1, 2, 3];
            const customOptions = { size: 65, colorX: "#656565", colorY: "#757575" };
            draw.node.drawNode = jest.fn();
            
            jest.spyOn(draw as any, "applyGlobalSettingsAndMetadataAndShadowCasting").mockImplementation(() => undefined);
            
            drawPrivate.handleNode({ entity: mockNodeData, options: customOptions });
            
            expect(draw.node.drawNode).toHaveBeenCalledWith(expect.objectContaining({
                size: 65,
                colorX: "#656565",
                colorY: "#757575"
            }));
        });

        it("handlePolyline should use provided options when options are passed", () => {
            const mockPolyline = { points: [[0, 0, 0], [1, 1, 1]] };
            const customOptions = { size: 70, colours: "#707070" };
            const mockMesh = createMockMesh("polyline");
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawPolylineClose = jest.fn().mockReturnValue(mockMesh);
            
            drawPrivate.handlePolyline({ entity: mockPolyline, options: customOptions });
            
            expect(mockDrawHelper.drawPolylineClose).toHaveBeenCalledWith(expect.objectContaining({
                size: 70,
                colours: "#707070"
            }));
        });

        it("handlePoint should use provided options when options are passed", () => {
            const mockPoint = [1, 2, 3];
            const customOptions = { size: 75, colours: "#757575" };
            const mockMesh = createMockMesh("point");
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawPoint = jest.fn().mockReturnValue(mockMesh);
            
            drawPrivate.handlePoint({ entity: mockPoint, options: customOptions });
            
            expect(mockDrawHelper.drawPoint).toHaveBeenCalledWith(expect.objectContaining({
                size: 75,
                colours: "#757575"
            }));
        });

        it("handleLine should use provided options when options are passed", () => {
            const mockLine = { start: [0, 0, 0], end: [1, 1, 1] };
            const customOptions = { size: 80, colours: "#808080" };
            const mockMesh = createMockMesh("line");
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawPolylinesWithColours = jest.fn().mockReturnValue(mockMesh);
            
            drawPrivate.handleLine({ entity: mockLine, options: customOptions });
            
            expect(mockDrawHelper.drawPolylinesWithColours).toHaveBeenCalledWith(expect.objectContaining({
                size: 80,
                colours: "#808080"
            }));
        });

        it("handleJscadMesh should use provided options when options are passed", async () => {
            const mockJscadMesh = { vertices: [] };
            const customOptions = { size: 85, colours: "#858585" };
            const mockMesh = createMockMesh("jscad");
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawSolidOrPolygonMesh = jest.fn().mockResolvedValue(mockMesh);
            jest.spyOn(draw as any, "applyGlobalSettingsAndMetadataAndShadowCasting").mockImplementation(() => undefined);
            
            await drawPrivate.handleJscadMesh({ entity: mockJscadMesh, options: customOptions });
            
            expect(mockDrawHelper.drawSolidOrPolygonMesh).toHaveBeenCalledWith(expect.objectContaining({
                size: 85,
                colours: "#858585"
            }));
        });

        it("handleJscadMeshes should use provided options when options are passed", async () => {
            const mockJscadMeshes = [{ vertices: [] }, { vertices: [] }];
            const customOptions = { size: 90, colours: "#909090" };
            const mockMesh = createMockMesh("jscads");
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawSolidOrPolygonMeshes = jest.fn().mockResolvedValue(mockMesh);
            
            jest.spyOn(draw as any, "applyGlobalSettingsAndMetadataAndShadowCasting").mockImplementation(() => undefined);
            
            await drawPrivate.handleJscadMeshes({ entity: mockJscadMeshes, options: customOptions });
            
            expect(mockDrawHelper.drawSolidOrPolygonMeshes).toHaveBeenCalledWith(expect.objectContaining({
                size: 90,
                colours: "#909090"
            }));
        });

        it("handleOcctShape should use provided options when options are passed", async () => {
            const mockOcctShape = { hash: "shape123" };
            const customOptions = { faceMaterial: "#aaa111", edgeMaterial: "#bbb222" };
            const mockMesh = createMockMesh("occt");
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawShape = jest.fn().mockResolvedValue(mockMesh);
            
            jest.spyOn(draw as any, "applyGlobalSettingsAndMetadataAndShadowCasting").mockImplementation(() => undefined);
            
            await drawPrivate.handleOcctShape({ entity: mockOcctShape, options: customOptions });
            
            expect(mockDrawHelper.drawShape).toHaveBeenCalledWith(expect.objectContaining({
                faceMaterial: "#aaa111",
                edgeMaterial: "#bbb222"
            }));
        });

        it("handleOcctShapes should use provided options when options are passed", async () => {
            const mockOcctShapes = [{ hash: "shape1" }, { hash: "shape2" }];
            const customOptions = { faceMaterial: "#ccc111", edgeMaterial: "#ddd222" };
            const mockMesh = createMockMesh("occts");
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawShapes = jest.fn().mockResolvedValue(mockMesh);
            
            jest.spyOn(draw as any, "applyGlobalSettingsAndMetadataAndShadowCasting").mockImplementation(() => undefined);
            
            await drawPrivate.handleOcctShapes({ entity: mockOcctShapes, options: customOptions });
            
            expect(mockDrawHelper.drawShapes).toHaveBeenCalledWith(expect.objectContaining({
                faceMaterial: "#ccc111",
                edgeMaterial: "#ddd222"
            }));
        });

        it("handleManifoldShape should use provided options when options are passed", async () => {
            const mockManifoldShape = { hash: "manifold123" };
            const customOptions = { faceMaterial: "#eee111", edgeMaterial: "#fff222" };
            const mockMesh = createMockMesh("manifold");
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawManifoldOrCrossSection = jest.fn().mockResolvedValue(mockMesh);
            
            jest.spyOn(draw as any, "applyGlobalSettingsAndMetadataAndShadowCasting").mockImplementation(() => undefined);
            
            await drawPrivate.handleManifoldShape({ entity: mockManifoldShape, options: customOptions });
            
            expect(mockDrawHelper.drawManifoldOrCrossSection).toHaveBeenCalledWith(expect.objectContaining({
                faceMaterial: "#eee111",
                edgeMaterial: "#fff222"
            }));
        });

        it("handleManifoldShapes should use provided options when options are passed", async () => {
            const mockManifoldShapes = [{ hash: "manifold1" }, { hash: "manifold2" }];
            const customOptions = { faceMaterial: "#111eee", edgeMaterial: "#222fff" };
            const mockMesh = createMockMesh("manifolds");
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawManifoldsOrCrossSections = jest.fn().mockResolvedValue(mockMesh);
            
            jest.spyOn(draw as any, "applyGlobalSettingsAndMetadataAndShadowCasting").mockImplementation(() => undefined);
            
            await drawPrivate.handleManifoldShapes({ entity: mockManifoldShapes, options: customOptions });
            
            expect(mockDrawHelper.drawManifoldsOrCrossSections).toHaveBeenCalledWith(expect.objectContaining({
                faceMaterial: "#111eee",
                edgeMaterial: "#222fff"
            }));
        });
    });

    describe("createTexture", () => {
        it("should create texture with default properties", () => {
            // Arrange
            const inputs = new Inputs.Draw.GenericTextureDto();
            inputs.url = "test.png";

            // Act
            const result = draw.createTexture(inputs);

            // Assert
            expect(result).toBeInstanceOf(BABYLON.Texture);
            expect(result.name).toBe(inputs.name);
            expect(result.uOffset).toBe(0);
            expect(result.vOffset).toBe(0);
            expect(result.uScale).toBe(1);
            expect(result.vScale).toBe(1);
            expect(result.uAng).toBe(0);
            expect(result.vAng).toBe(0);
            expect(result.wAng).toBe(0);
            expect(result.level).toBe(1);
        });

        it("should create texture with custom properties", () => {
            // Arrange
            const inputs = new Inputs.Draw.GenericTextureDto();
            inputs.url = "custom.jpg";
            inputs.name = "CustomTexture";
            inputs.uOffset = 0.5;
            inputs.vOffset = 0.25;
            inputs.uScale = 2;
            inputs.vScale = 3;
            inputs.wAng = 180;

            // Act
            const result = draw.createTexture(inputs);

            // Assert
            expect(result).toBeInstanceOf(BABYLON.Texture);
            expect(result.name).toBe("CustomTexture");
            expect(result.uOffset).toBe(0.5);
            expect(result.vOffset).toBe(0.25);
            expect(result.uScale).toBe(2);
            expect(result.vScale).toBe(3);
            expect(result.wAng).toBe(180);
        });
    });

    describe("createPBRMaterial", () => {
        it("should create PBR material with default properties", () => {
            // Arrange
            const inputs = new Inputs.Draw.GenericPBRMaterialDto();

            // Act
            const result = draw.createPBRMaterial(inputs);

            // Assert
            expect(result).toBeInstanceOf(BABYLON.PBRMetallicRoughnessMaterial);
            expect(result.name).toBe(inputs.name);
            expect(result.metallic).toBe(0.5);
            expect(result.roughness).toBe(0.5);
        });

        it("should create PBR material with custom properties", () => {
            // Arrange
            const inputs = new Inputs.Draw.GenericPBRMaterialDto();
            inputs.name = "CustomMaterial";
            inputs.baseColor = "#ff0000";
            inputs.metallic = 0.5;
            inputs.roughness = 0.3;
            inputs.alpha = 0.8;
            inputs.emissiveColor = "#00ff00";
            inputs.emissiveIntensity = 2;
            inputs.alphaCutoff = 0.5;
            inputs.doubleSided = true;
            inputs.unlit = true;

            // Act
            const result = draw.createPBRMaterial(inputs);

            // Assert
            expect(result).toBeInstanceOf(BABYLON.PBRMetallicRoughnessMaterial);
            expect(result.name).toBe("CustomMaterial");
            expect(result.metallic).toBe(0.5);
            expect(result.roughness).toBe(0.3);
            expect(result.alpha).toBe(0.8);
            expect(result.alphaCutOff).toBe(0.5);
            expect(result.doubleSided).toBe(true);
            expect(result.disableLighting).toBe(true);
        });

        it("should apply alpha modes correctly", () => {
            // Arrange & Act & Assert - opaque
            const opaqueInputs = new Inputs.Draw.GenericPBRMaterialDto();
            opaqueInputs.alphaMode = Inputs.Draw.alphaModeEnum.opaque;
            const opaqueMat = draw.createPBRMaterial(opaqueInputs);
            expect(opaqueMat.transparencyMode).toBe(BABYLON.PBRMaterial.PBRMATERIAL_OPAQUE);

            // Arrange & Act & Assert - mask
            const maskInputs = new Inputs.Draw.GenericPBRMaterialDto();
            maskInputs.alphaMode = Inputs.Draw.alphaModeEnum.mask;
            const maskMat = draw.createPBRMaterial(maskInputs);
            expect(maskMat.transparencyMode).toBe(BABYLON.PBRMaterial.PBRMATERIAL_ALPHATEST);

            // Arrange & Act & Assert - blend
            const blendInputs = new Inputs.Draw.GenericPBRMaterialDto();
            blendInputs.alphaMode = Inputs.Draw.alphaModeEnum.blend;
            const blendMat = draw.createPBRMaterial(blendInputs);
            expect(blendMat.transparencyMode).toBe(BABYLON.PBRMaterial.PBRMATERIAL_ALPHABLEND);
        });

        it("should apply textures when provided", () => {
            // Arrange
            const mockTexture = {} as BABYLON.BaseTexture;
            const inputs = new Inputs.Draw.GenericPBRMaterialDto();
            inputs.baseColorTexture = mockTexture;
            inputs.metallicRoughnessTexture = mockTexture;
            inputs.normalTexture = mockTexture;
            inputs.emissiveTexture = mockTexture;
            inputs.occlusionTexture = mockTexture;

            // Act
            const result = draw.createPBRMaterial(inputs);

            // Assert
            expect(result.baseTexture).toBe(mockTexture);
            expect(result.metallicRoughnessTexture).toBe(mockTexture);
            expect(result.normalTexture).toBe(mockTexture);
            expect(result.emissiveTexture).toBe(mockTexture);
            expect(result.occlusionTexture).toBe(mockTexture);
        });
    });

    describe("getSamplingMode", () => {
        it("should return NEAREST_SAMPLINGMODE for nearestSamplingMode", () => {
            // Arrange
            const mode = Inputs.Draw.samplingModeEnum.nearest;

            // Act
            const result = (draw as any).getSamplingMode(mode);

            // Assert
            expect(result).toBe(BABYLON.Texture.NEAREST_SAMPLINGMODE);
        });

        it("should return BILINEAR_SAMPLINGMODE for bilinearSamplingMode", () => {
            // Arrange
            const mode = Inputs.Draw.samplingModeEnum.bilinear;

            // Act
            const result = (draw as any).getSamplingMode(mode);

            // Assert
            expect(result).toBe(BABYLON.Texture.BILINEAR_SAMPLINGMODE);
        });

        it("should return TRILINEAR_SAMPLINGMODE for trilinearSamplingMode", () => {
            // Arrange
            const mode = Inputs.Draw.samplingModeEnum.trilinear;

            // Act
            const result = (draw as any).getSamplingMode(mode);

            // Assert
            expect(result).toBe(BABYLON.Texture.TRILINEAR_SAMPLINGMODE);
        });

    
    });

});
