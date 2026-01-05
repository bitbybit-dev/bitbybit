import * as BABYLON from "@babylonjs/core";
import { Draw } from "./draw";
import { DrawHelper } from "../draw-helper";
import { BabylonNode } from "./babylon/node";
import { Tag } from "@bitbybit-dev/core";
import { Context } from "../context";
import * as Inputs from "../inputs";
import { MockScene, MockMesh } from "../__mocks__/babylonjs.mock";

jest.mock("@babylonjs/core");
jest.mock("@babylonjs/materials");

describe("Draw unit tests", () => {
    let draw: Draw;
    let mockDrawHelper: DrawHelper;
    let mockNode: BabylonNode;
    let mockTag: Tag;
    let mockContext: Context;
    let mockScene: BABYLON.Scene;

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
            jest.spyOn(draw as any, "detectJscadMesh").mockReturnValue(false);
            jest.spyOn(draw as any, "detectOcctShape").mockReturnValue(false);
            jest.spyOn(draw as any, "detectOcctShapes").mockReturnValue(false);
            jest.spyOn(draw as any, "detectJscadMeshes").mockReturnValue(false);
            jest.spyOn(draw as any, "detectManifoldShape").mockReturnValue(false);
            jest.spyOn(draw as any, "detectManifoldShapes").mockReturnValue(false);
            jest.spyOn(draw, "drawAny").mockReturnValue(new MockMesh("test", mockScene) as any);

            const result = await draw.drawAnyAsync({ entity: mockPoint });
            
            expect(draw.drawAny).toHaveBeenCalled();
            expect(result).toBeDefined();
        });

        it("should handle JSCAD mesh", async () => {
            const mockJscadMesh = { type: "jscad" };
            jest.spyOn(draw as any, "detectJscadMesh").mockReturnValue(true);
            jest.spyOn(draw as any, "handleJscadMesh").mockResolvedValue(new MockMesh("jscad", mockScene));

            const result = await draw.drawAnyAsync({ entity: mockJscadMesh });
            
            expect((draw as any).handleJscadMesh).toHaveBeenCalled();
            expect(result).toBeDefined();
        });

        it("should handle OCCT shape", async () => {
            const mockOcctShape = { type: "occt" };
            jest.spyOn(draw as any, "detectJscadMesh").mockReturnValue(false);
            jest.spyOn(draw as any, "detectOcctShape").mockReturnValue(true);
            jest.spyOn(draw as any, "handleOcctShape").mockResolvedValue(new MockMesh("occt", mockScene));

            const result = await draw.drawAnyAsync({ entity: mockOcctShape });
            
            expect((draw as any).handleOcctShape).toHaveBeenCalled();
            expect(result).toBeDefined();
        });

        it("should handle OCCT shapes array", async () => {
            const mockOcctShapes = [{ type: "occt1" }, { type: "occt2" }];
            jest.spyOn(draw as any, "detectJscadMesh").mockReturnValue(false);
            jest.spyOn(draw as any, "detectOcctShape").mockReturnValue(false);
            jest.spyOn(draw as any, "detectOcctShapes").mockReturnValue(true);
            jest.spyOn(draw as any, "handleOcctShapes").mockResolvedValue(new MockMesh("occt-shapes", mockScene));

            const result = await draw.drawAnyAsync({ entity: mockOcctShapes });
            
            expect((draw as any).handleOcctShapes).toHaveBeenCalled();
            expect(result).toBeDefined();
        });

        it("should handle JSCAD meshes array", async () => {
            const mockJscadMeshes = [{ vertices: [] }, { vertices: [] }];
            jest.spyOn(draw as any, "detectJscadMesh").mockReturnValue(false);
            jest.spyOn(draw as any, "detectOcctShape").mockReturnValue(false);
            jest.spyOn(draw as any, "detectOcctShapes").mockReturnValue(false);
            jest.spyOn(draw as any, "detectJscadMeshes").mockReturnValue(true);
            jest.spyOn(draw as any, "handleJscadMeshes").mockResolvedValue(new MockMesh("jscad-meshes", mockScene));

            const result = await draw.drawAnyAsync({ entity: mockJscadMeshes });
            
            expect((draw as any).handleJscadMeshes).toHaveBeenCalled();
            expect(result).toBeDefined();
        });

        it("should handle Manifold shape", async () => {
            const mockManifoldShape = { type: "manifold" };
            jest.spyOn(draw as any, "detectJscadMesh").mockReturnValue(false);
            jest.spyOn(draw as any, "detectOcctShape").mockReturnValue(false);
            jest.spyOn(draw as any, "detectOcctShapes").mockReturnValue(false);
            jest.spyOn(draw as any, "detectJscadMeshes").mockReturnValue(false);
            jest.spyOn(draw as any, "detectManifoldShape").mockReturnValue(true);
            jest.spyOn(draw as any, "handleManifoldShape").mockResolvedValue(new MockMesh("manifold", mockScene));

            const result = await draw.drawAnyAsync({ entity: mockManifoldShape });
            
            expect((draw as any).handleManifoldShape).toHaveBeenCalled();
            expect(result).toBeDefined();
        });

        it("should handle Manifold shapes array", async () => {
            const mockManifoldShapes = [{ type: "manifold1" }, { type: "manifold2" }];
            jest.spyOn(draw as any, "detectJscadMesh").mockReturnValue(false);
            jest.spyOn(draw as any, "detectOcctShape").mockReturnValue(false);
            jest.spyOn(draw as any, "detectOcctShapes").mockReturnValue(false);
            jest.spyOn(draw as any, "detectJscadMeshes").mockReturnValue(false);
            jest.spyOn(draw as any, "detectManifoldShape").mockReturnValue(false);
            jest.spyOn(draw as any, "detectManifoldShapes").mockReturnValue(true);
            jest.spyOn(draw as any, "handleManifoldShapes").mockResolvedValue(new MockMesh("manifold-shapes", mockScene));

            const result = await draw.drawAnyAsync({ entity: mockManifoldShapes });
            
            expect((draw as any).handleManifoldShapes).toHaveBeenCalled();
            expect(result).toBeDefined();
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
            const mockMesh = new MockMesh("point", mockScene) as any;
            mockDrawHelper.drawPoints = jest.fn().mockReturnValue(mockMesh);
            
            jest.spyOn(draw as any, "handlePoint").mockReturnValue(mockMesh);
            
            const result = draw.drawAny({ entity: mockPoint });
            
            expect(result).toBeDefined();
        });

        it("should handle line entity", () => {
            const mockLine = { start: [0, 0, 0], end: [1, 1, 1] };
            const mockMesh = new MockMesh("line", mockScene) as any;
            
            jest.spyOn(draw as any, "handleLine").mockReturnValue(mockMesh);
            
            const result = draw.drawAny({ entity: mockLine });
            
            expect(result).toBeDefined();
        });

        it("should handle BabylonMesh entity", () => {
            const mockBabylonMesh = new MockMesh("existing", mockScene) as any;
            mockBabylonMesh.metadata = { type: "point", options: {} };
            
            jest.spyOn(draw as any, "updateAny").mockReturnValue(mockBabylonMesh);
            
            const result = draw.drawAny({ entity: mockBabylonMesh, babylonMesh: mockBabylonMesh });
            
            expect((draw as any).updateAny).toHaveBeenCalled();
            expect(result).toBe(mockBabylonMesh);
        });

        it("should detect and handle line entity", () => {
            const mockLine = { start: [0, 0, 0], end: [1, 1, 1] };
            const mockMesh = new MockMesh("line", mockScene) as any;
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawPolylinesWithColours = jest.fn().mockReturnValue(mockMesh);
            
            jest.spyOn(draw as any, "detectLine").mockReturnValue(true);
            jest.spyOn(draw as any, "detectPoint").mockReturnValue(false);
            jest.spyOn(draw as any, "handleLine").mockReturnValue(mockMesh);
            
            const result = draw.drawAny({ entity: mockLine });
            
            expect((draw as any).detectLine).toHaveBeenCalledWith(mockLine);
            expect((draw as any).handleLine).toHaveBeenCalled();
            expect(result).toBeDefined();
        });

        it("should detect and handle point entity", () => {
            const mockPoint = [1, 2, 3];
            const mockMesh = new MockMesh("point", mockScene) as any;
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawPoint = jest.fn().mockReturnValue(mockMesh);
            
            jest.spyOn(draw as any, "detectLine").mockReturnValue(false);
            jest.spyOn(draw as any, "detectPoint").mockReturnValue(true);
            jest.spyOn(draw as any, "handlePoint").mockReturnValue(mockMesh);
            
            const result = draw.drawAny({ entity: mockPoint });
            
            expect((draw as any).detectPoint).toHaveBeenCalledWith(mockPoint);
            expect((draw as any).handlePoint).toHaveBeenCalled();
            expect(result).toBeDefined();
        });

        it("should detect and handle polyline entity", () => {
            const mockPolyline = { points: [[0, 0, 0], [1, 1, 1], [2, 2, 2]] };
            const mockMesh = new MockMesh("polyline", mockScene) as any;
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawPolylineClose = jest.fn().mockReturnValue(mockMesh);
            
            jest.spyOn(draw as any, "detectLine").mockReturnValue(false);
            jest.spyOn(draw as any, "detectPoint").mockReturnValue(false);
            jest.spyOn(draw as any, "detectPolyline").mockReturnValue(true);
            jest.spyOn(draw as any, "handlePolyline").mockReturnValue(mockMesh);
            
            const result = draw.drawAny({ entity: mockPolyline });
            
            expect((draw as any).detectPolyline).toHaveBeenCalledWith(mockPolyline);
            expect((draw as any).handlePolyline).toHaveBeenCalled();
            expect(result).toBeDefined();
        });

        it("should detect and handle node entity", () => {
            const mockNode = [1, 2, 3];
            
            jest.spyOn(draw as any, "detectLine").mockReturnValue(false);
            jest.spyOn(draw as any, "detectPoint").mockReturnValue(false);
            jest.spyOn(draw as any, "detectPolyline").mockReturnValue(false);
            jest.spyOn(draw as any, "detectNode").mockReturnValue(true);
            jest.spyOn(draw as any, "handleNode").mockReturnValue(mockNode);
            
            const result = draw.drawAny({ entity: mockNode });
            
            expect((draw as any).detectNode).toHaveBeenCalledWith(mockNode);
            expect((draw as any).handleNode).toHaveBeenCalled();
            expect(result).toBe(mockNode);
        });

        it("should detect and handle verbCurve entity", () => {
            const mockVerbCurve = { degree: 3, controlPoints: [] };
            const mockMesh = new MockMesh("verbCurve", mockScene) as any;
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawCurve = jest.fn().mockReturnValue(mockMesh);
            
            jest.spyOn(draw as any, "detectLine").mockReturnValue(false);
            jest.spyOn(draw as any, "detectPoint").mockReturnValue(false);
            jest.spyOn(draw as any, "detectPolyline").mockReturnValue(false);
            jest.spyOn(draw as any, "detectNode").mockReturnValue(false);
            jest.spyOn(draw as any, "detectVerbCurve").mockReturnValue(true);
            jest.spyOn(draw as any, "handleVerbCurve").mockReturnValue(mockMesh);
            
            const result = draw.drawAny({ entity: mockVerbCurve });
            
            expect((draw as any).detectVerbCurve).toHaveBeenCalledWith(mockVerbCurve);
            expect((draw as any).handleVerbCurve).toHaveBeenCalled();
            expect(result).toBeDefined();
        });

        it("should detect and handle verbSurface entity", () => {
            const mockVerbSurface = { degreeU: 3, degreeV: 3, controlPoints: [] };
            const mockMesh = new MockMesh("verbSurface", mockScene) as any;
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawSurface = jest.fn().mockReturnValue(mockMesh);
            
            jest.spyOn(draw as any, "detectLine").mockReturnValue(false);
            jest.spyOn(draw as any, "detectPoint").mockReturnValue(false);
            jest.spyOn(draw as any, "detectPolyline").mockReturnValue(false);
            jest.spyOn(draw as any, "detectNode").mockReturnValue(false);
            jest.spyOn(draw as any, "detectVerbCurve").mockReturnValue(false);
            jest.spyOn(draw as any, "detectVerbSurface").mockReturnValue(true);
            jest.spyOn(draw as any, "handleVerbSurface").mockReturnValue(mockMesh);
            
            const result = draw.drawAny({ entity: mockVerbSurface });
            
            expect((draw as any).detectVerbSurface).toHaveBeenCalledWith(mockVerbSurface);
            expect((draw as any).handleVerbSurface).toHaveBeenCalled();
            expect(result).toBeDefined();
        });

        it("should detect and handle polylines array", () => {
            const mockPolylines = [
                { points: [[0, 0, 0], [1, 1, 1]] },
                { points: [[2, 2, 2], [3, 3, 3]] }
            ];
            const mockMesh = new MockMesh("polylines", mockScene) as any;
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawPolylinesWithColours = jest.fn().mockReturnValue(mockMesh);
            
            jest.spyOn(draw as any, "detectLine").mockReturnValue(false);
            jest.spyOn(draw as any, "detectPoint").mockReturnValue(false);
            jest.spyOn(draw as any, "detectPolyline").mockReturnValue(false);
            jest.spyOn(draw as any, "detectNode").mockReturnValue(false);
            jest.spyOn(draw as any, "detectVerbCurve").mockReturnValue(false);
            jest.spyOn(draw as any, "detectVerbSurface").mockReturnValue(false);
            jest.spyOn(draw as any, "detectPolylines").mockReturnValue(true);
            jest.spyOn(draw as any, "handlePolylines").mockReturnValue(mockMesh);
            
            const result = draw.drawAny({ entity: mockPolylines });
            
            expect((draw as any).detectPolylines).toHaveBeenCalledWith(mockPolylines);
            expect((draw as any).handlePolylines).toHaveBeenCalled();
            expect(result).toBeDefined();
        });

        it("should detect and handle lines array", () => {
            const mockLines = [
                { start: [0, 0, 0], end: [1, 1, 1] },
                { start: [2, 2, 2], end: [3, 3, 3] }
            ];
            const mockMesh = new MockMesh("lines", mockScene) as any;
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawPolylinesWithColours = jest.fn().mockReturnValue(mockMesh);
            
            jest.spyOn(draw as any, "detectLine").mockReturnValue(false);
            jest.spyOn(draw as any, "detectPoint").mockReturnValue(false);
            jest.spyOn(draw as any, "detectPolyline").mockReturnValue(false);
            jest.spyOn(draw as any, "detectNode").mockReturnValue(false);
            jest.spyOn(draw as any, "detectVerbCurve").mockReturnValue(false);
            jest.spyOn(draw as any, "detectVerbSurface").mockReturnValue(false);
            jest.spyOn(draw as any, "detectPolylines").mockReturnValue(false);
            jest.spyOn(draw as any, "detectLines").mockReturnValue(true);
            jest.spyOn(draw as any, "handleLines").mockReturnValue(mockMesh);
            
            const result = draw.drawAny({ entity: mockLines });
            
            expect((draw as any).detectLines).toHaveBeenCalledWith(mockLines);
            expect((draw as any).handleLines).toHaveBeenCalled();
            expect(result).toBeDefined();
        });

        it("should detect and handle points array", () => {
            const mockPoints = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
            const mockMesh = new MockMesh("points", mockScene) as any;
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawPoints = jest.fn().mockReturnValue(mockMesh);
            
            jest.spyOn(draw as any, "detectLine").mockReturnValue(false);
            jest.spyOn(draw as any, "detectPoint").mockReturnValue(false);
            jest.spyOn(draw as any, "detectPolyline").mockReturnValue(false);
            jest.spyOn(draw as any, "detectNode").mockReturnValue(false);
            jest.spyOn(draw as any, "detectVerbCurve").mockReturnValue(false);
            jest.spyOn(draw as any, "detectVerbSurface").mockReturnValue(false);
            jest.spyOn(draw as any, "detectPolylines").mockReturnValue(false);
            jest.spyOn(draw as any, "detectLines").mockReturnValue(false);
            jest.spyOn(draw as any, "detectPoints").mockReturnValue(true);
            jest.spyOn(draw as any, "handlePoints").mockReturnValue(mockMesh);
            
            const result = draw.drawAny({ entity: mockPoints });
            
            expect((draw as any).detectPoints).toHaveBeenCalledWith(mockPoints);
            expect((draw as any).handlePoints).toHaveBeenCalled();
            expect(result).toBeDefined();
        });

        it("should detect and handle nodes array", () => {
            const mockNodes = [[1, 2, 3], [4, 5, 6]];
            
            jest.spyOn(draw as any, "detectLine").mockReturnValue(false);
            jest.spyOn(draw as any, "detectPoint").mockReturnValue(false);
            jest.spyOn(draw as any, "detectPolyline").mockReturnValue(false);
            jest.spyOn(draw as any, "detectNode").mockReturnValue(false);
            jest.spyOn(draw as any, "detectVerbCurve").mockReturnValue(false);
            jest.spyOn(draw as any, "detectVerbSurface").mockReturnValue(false);
            jest.spyOn(draw as any, "detectPolylines").mockReturnValue(false);
            jest.spyOn(draw as any, "detectLines").mockReturnValue(false);
            jest.spyOn(draw as any, "detectPoints").mockReturnValue(false);
            jest.spyOn(draw as any, "detectNodes").mockReturnValue(true);
            jest.spyOn(draw as any, "handleNodes").mockReturnValue(mockNodes);
            
            const result = draw.drawAny({ entity: mockNodes });
            
            expect((draw as any).detectNodes).toHaveBeenCalledWith(mockNodes);
            expect((draw as any).handleNodes).toHaveBeenCalled();
            expect(result).toBe(mockNodes);
        });

        it("should detect and handle verbCurves array", () => {
            const mockVerbCurves = [
                { degree: 3, controlPoints: [] },
                { degree: 2, controlPoints: [] }
            ];
            const mockMesh = new MockMesh("verbCurves", mockScene) as any;
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawCurves = jest.fn().mockReturnValue(mockMesh);
            
            jest.spyOn(draw as any, "detectLine").mockReturnValue(false);
            jest.spyOn(draw as any, "detectPoint").mockReturnValue(false);
            jest.spyOn(draw as any, "detectPolyline").mockReturnValue(false);
            jest.spyOn(draw as any, "detectNode").mockReturnValue(false);
            jest.spyOn(draw as any, "detectVerbCurve").mockReturnValue(false);
            jest.spyOn(draw as any, "detectVerbSurface").mockReturnValue(false);
            jest.spyOn(draw as any, "detectPolylines").mockReturnValue(false);
            jest.spyOn(draw as any, "detectLines").mockReturnValue(false);
            jest.spyOn(draw as any, "detectPoints").mockReturnValue(false);
            jest.spyOn(draw as any, "detectNodes").mockReturnValue(false);
            jest.spyOn(draw as any, "detectVerbCurves").mockReturnValue(true);
            jest.spyOn(draw as any, "handleVerbCurves").mockReturnValue(mockMesh);
            
            const result = draw.drawAny({ entity: mockVerbCurves });
            
            expect((draw as any).detectVerbCurves).toHaveBeenCalledWith(mockVerbCurves);
            expect((draw as any).handleVerbCurves).toHaveBeenCalled();
            expect(result).toBeDefined();
        });

        it("should detect and handle verbSurfaces array", () => {
            const mockVerbSurfaces = [
                { degreeU: 3, degreeV: 3, controlPoints: [] },
                { degreeU: 2, degreeV: 2, controlPoints: [] }
            ];
            const mockMesh = new MockMesh("verbSurfaces", mockScene) as any;
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawSurfacesMultiColour = jest.fn().mockReturnValue(mockMesh);
            
            jest.spyOn(draw as any, "detectLine").mockReturnValue(false);
            jest.spyOn(draw as any, "detectPoint").mockReturnValue(false);
            jest.spyOn(draw as any, "detectPolyline").mockReturnValue(false);
            jest.spyOn(draw as any, "detectNode").mockReturnValue(false);
            jest.spyOn(draw as any, "detectVerbCurve").mockReturnValue(false);
            jest.spyOn(draw as any, "detectVerbSurface").mockReturnValue(false);
            jest.spyOn(draw as any, "detectPolylines").mockReturnValue(false);
            jest.spyOn(draw as any, "detectLines").mockReturnValue(false);
            jest.spyOn(draw as any, "detectPoints").mockReturnValue(false);
            jest.spyOn(draw as any, "detectNodes").mockReturnValue(false);
            jest.spyOn(draw as any, "detectVerbCurves").mockReturnValue(false);
            jest.spyOn(draw as any, "detectVerbSurfaces").mockReturnValue(true);
            jest.spyOn(draw as any, "handleVerbSurfaces").mockReturnValue(mockMesh);
            
            const result = draw.drawAny({ entity: mockVerbSurfaces });
            
            expect((draw as any).detectVerbSurfaces).toHaveBeenCalledWith(mockVerbSurfaces);
            expect((draw as any).handleVerbSurfaces).toHaveBeenCalled();
            expect(result).toBeDefined();
        });

        it("should detect and handle tag entity", () => {
            const mockTag = { tag: "single" };
            const mockMesh = new MockMesh("tag", mockScene) as any;
            mockMesh.metadata = { options: {} };
            draw.tag.drawTag = jest.fn().mockReturnValue(mockMesh);
            
            jest.spyOn(draw as any, "detectLine").mockReturnValue(false);
            jest.spyOn(draw as any, "detectPoint").mockReturnValue(false);
            jest.spyOn(draw as any, "detectPolyline").mockReturnValue(false);
            jest.spyOn(draw as any, "detectNode").mockReturnValue(false);
            jest.spyOn(draw as any, "detectVerbCurve").mockReturnValue(false);
            jest.spyOn(draw as any, "detectVerbSurface").mockReturnValue(false);
            jest.spyOn(draw as any, "detectPolylines").mockReturnValue(false);
            jest.spyOn(draw as any, "detectLines").mockReturnValue(false);
            jest.spyOn(draw as any, "detectPoints").mockReturnValue(false);
            jest.spyOn(draw as any, "detectNodes").mockReturnValue(false);
            jest.spyOn(draw as any, "detectVerbCurves").mockReturnValue(false);
            jest.spyOn(draw as any, "detectVerbSurfaces").mockReturnValue(false);
            jest.spyOn(draw as any, "detectTag").mockReturnValue(true);
            jest.spyOn(draw as any, "handleTag").mockReturnValue(mockMesh);
            
            const result = draw.drawAny({ entity: mockTag });
            
            expect((draw as any).detectTag).toHaveBeenCalledWith(mockTag);
            expect((draw as any).handleTag).toHaveBeenCalled();
            expect(result).toBeDefined();
        });

        it("should detect and handle tags array", () => {
            const mockTags = [{ tag: "test1" }, { tag: "test2" }];
            const mockMesh = new MockMesh("tags", mockScene) as any;
            mockTag.drawTags = jest.fn().mockReturnValue(mockMesh);
            
            jest.spyOn(draw as any, "detectLine").mockReturnValue(false);
            jest.spyOn(draw as any, "detectPoint").mockReturnValue(false);
            jest.spyOn(draw as any, "detectPolyline").mockReturnValue(false);
            jest.spyOn(draw as any, "detectNode").mockReturnValue(false);
            jest.spyOn(draw as any, "detectVerbCurve").mockReturnValue(false);
            jest.spyOn(draw as any, "detectVerbSurface").mockReturnValue(false);
            jest.spyOn(draw as any, "detectPolylines").mockReturnValue(false);
            jest.spyOn(draw as any, "detectLines").mockReturnValue(false);
            jest.spyOn(draw as any, "detectPoints").mockReturnValue(false);
            jest.spyOn(draw as any, "detectNodes").mockReturnValue(false);
            jest.spyOn(draw as any, "detectVerbCurves").mockReturnValue(false);
            jest.spyOn(draw as any, "detectVerbSurfaces").mockReturnValue(false);
            jest.spyOn(draw as any, "detectTag").mockReturnValue(false);
            jest.spyOn(draw as any, "detectTags").mockReturnValue(true);
            jest.spyOn(draw as any, "handleTags").mockReturnValue(mockMesh);
            
            const result = draw.drawAny({ entity: mockTags });
            
            expect((draw as any).detectTags).toHaveBeenCalledWith(mockTags);
            expect((draw as any).handleTags).toHaveBeenCalled();
            expect(result).toBeDefined();
        });

        it("should call updateAny when babylonMesh is provided", () => {
            const mockMesh = new MockMesh("existing", mockScene) as any;
            mockMesh.metadata = { type: Inputs.Draw.drawingTypes.point, options: {} };
            
            jest.spyOn(draw as any, "updateAny").mockReturnValue(mockMesh);
            
            const result = draw.drawAny({ entity: [1, 2, 3], babylonMesh: mockMesh });
            
            expect((draw as any).updateAny).toHaveBeenCalledWith({ entity: [1, 2, 3], babylonMesh: mockMesh });
            expect(result).toBe(mockMesh);
        });

        it("should call updateAny when entity is BabylonMesh instance", () => {
            const mockBabylonMesh = new BABYLON.Mesh("babylon", mockScene) as any;
            mockBabylonMesh.metadata = { type: Inputs.Draw.drawingTypes.point, options: {} };
            
            jest.spyOn(draw as any, "updateAny").mockReturnValue(mockBabylonMesh);
            
            const result = draw.drawAny({ entity: mockBabylonMesh });
            
            expect((draw as any).updateAny).toHaveBeenCalled();
            expect(result).toBe(mockBabylonMesh);
        });

        it("should return undefined when no entity type is detected", () => {
            const unknownEntity = { unknown: "type" };
            
            jest.spyOn(draw as any, "detectLine").mockReturnValue(false);
            jest.spyOn(draw as any, "detectPoint").mockReturnValue(false);
            jest.spyOn(draw as any, "detectPolyline").mockReturnValue(false);
            jest.spyOn(draw as any, "detectNode").mockReturnValue(false);
            jest.spyOn(draw as any, "detectVerbCurve").mockReturnValue(false);
            jest.spyOn(draw as any, "detectVerbSurface").mockReturnValue(false);
            jest.spyOn(draw as any, "detectPolylines").mockReturnValue(false);
            jest.spyOn(draw as any, "detectLines").mockReturnValue(false);
            jest.spyOn(draw as any, "detectPoints").mockReturnValue(false);
            jest.spyOn(draw as any, "detectNodes").mockReturnValue(false);
            jest.spyOn(draw as any, "detectVerbCurves").mockReturnValue(false);
            jest.spyOn(draw as any, "detectVerbSurfaces").mockReturnValue(false);
            jest.spyOn(draw as any, "detectTag").mockReturnValue(false);
            jest.spyOn(draw as any, "detectTags").mockReturnValue(false);
            
            const result = draw.drawAny({ entity: unknownEntity });
            
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
            const GridMaterial = require("@babylonjs/materials").GridMaterial;
            const mockGridMaterial = {
                majorUnitFrequency: 0,
                minorUnitVisibility: 0,
                gridRatio: 0,
                backFaceCulling: false,
                mainColor: new BABYLON.Color3(1, 1, 1),
                lineColor: new BABYLON.Color3(0, 0, 0),
                opacity: 1,
            };
            GridMaterial.mockImplementation(() => mockGridMaterial);

            const mockGroundMesh = new MockMesh("ground", mockScene) as any;
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
            const GridMaterial = require("@babylonjs/materials").GridMaterial;
            GridMaterial.mockImplementation(() => {
                throw new Error("Grid material error");
            });

            const consoleSpy = jest.spyOn(console, "log").mockImplementation();
            
            // Mock CreateGround to still return a mesh in error case
            const errorMesh = new MockMesh("error-ground", mockScene) as any;
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
            const GridMaterial = require("@babylonjs/materials").GridMaterial;
            const mockGridMaterial = {
                majorUnitFrequency: 0,
                minorUnitVisibility: 0,
                gridRatio: 0,
                backFaceCulling: false,
                mainColor: new BABYLON.Color3(1, 1, 1),
                lineColor: new BABYLON.Color3(0, 0, 0),
                opacity: 1,
            };
            GridMaterial.mockImplementation(() => mockGridMaterial);

            const mockGroundMesh = new MockMesh("ground", mockScene) as any;
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
            jest.spyOn(draw, "drawGridMesh").mockReturnValue(new MockMesh("grid", mockScene) as any);
            
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
            const mockMesh = new MockMesh("tags", mockScene) as any;
            mockTag.drawTags = jest.fn().mockReturnValue(mockMesh);
            
            const result = (draw as any).handleTags({ entity: mockTags });
            
            expect(mockTag.drawTags).toHaveBeenCalled();
            expect(result).toBeDefined();
            expect(result.metadata.type).toBe(Inputs.Draw.drawingTypes.tags);
        });

        it("handleTags should use provided options when options are passed", () => {
            const mockTags = [{ tag: "test1" }, { tag: "test2" }];
            const customOptions = { updatable: true, size: 22 };
            const mockMesh = new MockMesh("tags", mockScene) as any;
            mockTag.drawTags = jest.fn().mockReturnValue(mockMesh);
            
            const result = (draw as any).handleTags({ entity: mockTags, options: customOptions });
            
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
            const mockMesh = new MockMesh("tags", mockScene) as any;
            mockTag.drawTags = jest.fn().mockReturnValue(mockMesh);
            
            const result = (draw as any).handleTags({ entity: mockTags, options: customOptions });
            
            expect(mockTag.drawTags).toHaveBeenCalledWith(expect.objectContaining({
                updatable: true,
                size: 22
            }));
            expect(result).toBeDefined();
            expect(result.metadata.type).toBe(Inputs.Draw.drawingTypes.tags);
        });

        it("handleTag should call tag.drawTag", () => {
            const mockTag = { tag: "single" };
            const mockMesh = new MockMesh("tag", mockScene) as any;
            mockMesh.metadata = { options: {} };
            draw.tag.drawTag = jest.fn().mockReturnValue(mockMesh);
            
            const result = (draw as any).handleTag({ entity: mockTag });
            
            expect(draw.tag.drawTag).toHaveBeenCalled();
            expect(result).toBeDefined();
            expect(result.metadata.type).toBe(Inputs.Draw.drawingTypes.tag);
        });

        it("handleVerbSurfaces should call drawHelper.drawSurfacesMultiColour", () => {
            const mockSurfaces = [{ surface: "test" }];
            const mockMesh = new MockMesh("surfaces", mockScene) as any;
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawSurfacesMultiColour = jest.fn().mockReturnValue(mockMesh);
            
            const result = (draw as any).handleVerbSurfaces({ entity: mockSurfaces });
            
            expect(mockDrawHelper.drawSurfacesMultiColour).toHaveBeenCalled();
            expect(result).toBeDefined();
        });

        it("handleVerbCurves should call drawHelper.drawCurves", () => {
            const mockCurves = [{ curve: "test" }];
            const mockMesh = new MockMesh("curves", mockScene) as any;
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawCurves = jest.fn().mockReturnValue(mockMesh);
            
            const result = (draw as any).handleVerbCurves({ entity: mockCurves });
            
            expect(mockDrawHelper.drawCurves).toHaveBeenCalled();
            expect(result).toBeDefined();
        });

        it("handleNodes should call node.drawNodes", () => {
            const mockNodes = [[1, 2, 3], [4, 5, 6]];
            mockNode.drawNodes = jest.fn();
            
            // Mock the applyGlobalSettingsAndMetadataAndShadowCasting to avoid getChildMeshes call
            jest.spyOn(draw as any, "applyGlobalSettingsAndMetadataAndShadowCasting").mockImplementation(() => {});
            
            const result = (draw as any).handleNodes({ entity: mockNodes });
            
            expect(mockNode.drawNodes).toHaveBeenCalled();
            expect(result).toBe(mockNodes);
        });

        it("handlePoints should call drawHelper.drawPoints", () => {
            const mockPoints = [[1, 2, 3], [4, 5, 6]];
            const mockMesh = new MockMesh("points", mockScene) as any;
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawPoints = jest.fn().mockReturnValue(mockMesh);
            
            const result = (draw as any).handlePoints({ entity: mockPoints });
            
            expect(mockDrawHelper.drawPoints).toHaveBeenCalled();
            expect(result).toBeDefined();
        });

        it("handleLines should call drawHelper.drawPolylinesWithColours", () => {
            const mockLines = [
                { start: [0, 0, 0], end: [1, 1, 1] },
                { start: [1, 1, 1], end: [2, 2, 2] }
            ];
            const mockMesh = new MockMesh("lines", mockScene) as any;
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawPolylinesWithColours = jest.fn().mockReturnValue(mockMesh);
            
            const result = (draw as any).handleLines({ entity: mockLines });
            
            expect(mockDrawHelper.drawPolylinesWithColours).toHaveBeenCalled();
            expect(result).toBeDefined();
        });

        it("handleLines should handle Segment3 format (arrays of points)", () => {
            const mockLinesAsSegments = [
                [[0, 0, 0], [1, 1, 1]],
                [[2, 2, 2], [3, 3, 3]]
            ] as Inputs.Base.Segment3[];
            const mockMesh = new MockMesh("lines", mockScene) as any;
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawPolylinesWithColours = jest.fn().mockReturnValue(mockMesh);
            
            const result = (draw as any).handleLines({ entity: mockLinesAsSegments });
            
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
            const mockMesh = new MockMesh("polylines", mockScene) as any;
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawPolylinesWithColours = jest.fn().mockReturnValue(mockMesh);
            
            const result = (draw as any).handlePolylines({ entity: mockPolylines });
            
            expect(mockDrawHelper.drawPolylinesWithColours).toHaveBeenCalled();
            expect(result).toBeDefined();
        });
    });

    describe("Entity type detection and handling", () => {
        it("should handle multiple points", () => {
            const mockPoints = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
            const mockMesh = new MockMesh("points", mockScene) as any;
            mockDrawHelper.drawPoints = jest.fn().mockReturnValue(mockMesh);
            
            jest.spyOn(draw as any, "handlePoints").mockReturnValue(mockMesh);
            
            draw.drawAny({ entity: mockPoints });
            
            expect((draw as any).handlePoints).toHaveBeenCalledWith({ entity: mockPoints });
        });

        it("should handle multiple lines", () => {
            const mockLines = [
                { start: [0, 0, 0], end: [1, 1, 1] },
                { start: [2, 2, 2], end: [3, 3, 3] }
            ];
            const mockMesh = new MockMesh("lines", mockScene) as any;
            mockDrawHelper.drawLines = jest.fn().mockReturnValue(mockMesh);
            
            jest.spyOn(draw as any, "handleLines").mockReturnValue(mockMesh);
            
            draw.drawAny({ entity: mockLines });
            
            expect((draw as any).handleLines).toHaveBeenCalledWith({ entity: mockLines });
        });

        it("should handle single point with options", () => {
            const mockPoint = [1, 2, 3];
            const options = new Inputs.Draw.DrawBasicGeometryOptions();
            options.size = 10;
            options.colours = "#00FF00";
            
            const mockMesh = new MockMesh("point", mockScene) as any;
            mockDrawHelper.drawPoints = jest.fn().mockReturnValue(mockMesh);
            
            jest.spyOn(draw as any, "handlePoint").mockReturnValue(mockMesh);
            
            draw.drawAny({ entity: mockPoint, options });
            
            expect((draw as any).handlePoint).toHaveBeenCalled();
        });

        it("should handle polyline with options", () => {
            const mockPolyline = { points: [[0, 0, 0], [1, 1, 1], [2, 2, 2]] };
            const options = new Inputs.Draw.DrawBasicGeometryOptions();
            options.size = 3;
            
            const mockMesh = new MockMesh("polyline", mockScene) as any;
            mockDrawHelper.drawPolylines = jest.fn().mockReturnValue(mockMesh);
            
            jest.spyOn(draw as any, "handlePolyline").mockReturnValue(mockMesh);
            
            draw.drawAny({ entity: mockPolyline, options });
            
            expect((draw as any).handlePolyline).toHaveBeenCalled();
        });
    });

    describe("Update scenarios", () => {
        it("should update existing mesh with new point data", () => {
            const mockMesh = new MockMesh("existing", mockScene) as any;
            mockMesh.metadata = { type: Inputs.Draw.drawingTypes.point, options: {} };
            
            const newPoint = [5, 6, 7];
            const updatedMesh = new MockMesh("updated", mockScene) as any;
            
            jest.spyOn(draw as any, "handlePoint").mockReturnValue(updatedMesh);
            
            const result = (draw as any).updateAny({ entity: newPoint, babylonMesh: mockMesh });
            
            expect(result).toBeDefined();
        });

        it("should update existing mesh with new line data", () => {
            const mockMesh = new MockMesh("existing", mockScene) as any;
            mockMesh.metadata = { type: Inputs.Draw.drawingTypes.line, options: {} };
            
            const newLine = { start: [0, 0, 0], end: [10, 10, 10] };
            const updatedMesh = new MockMesh("updated", mockScene) as any;
            
            jest.spyOn(draw as any, "handleLine").mockReturnValue(updatedMesh);
            
            const result = (draw as any).updateAny({ entity: newLine, babylonMesh: mockMesh });
            
            expect(result).toBeDefined();
        });

        it("should preserve options when updating mesh", () => {
            const mockMesh = new MockMesh("existing", mockScene) as any;
            const existingOptions = { size: 5, colours: "#FF0000" };
            mockMesh.metadata = { type: Inputs.Draw.drawingTypes.points, options: existingOptions };
            
            const newPoints = [[1, 2, 3], [4, 5, 6]];
            const updatedMesh = new MockMesh("updated", mockScene) as any;
            
            mockDrawHelper.drawPoints = jest.fn().mockReturnValue(updatedMesh);
            jest.spyOn(draw as any, "handlePoints").mockReturnValue(updatedMesh);
            
            (draw as any).updateAny({ entity: newPoints, babylonMesh: mockMesh });
            
            expect((draw as any).handlePoints).toHaveBeenCalled();
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
            
            const mockMesh1 = new MockMesh("mesh1", mockScene) as any;
            const mockMesh2 = new MockMesh("mesh2", mockScene) as any;
            
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
            const mockMesh = new MockMesh("existing", mockScene) as any;
            mockMesh.metadata = { type: Inputs.Draw.drawingTypes.point, options: {} };
            
            const updatedMesh = new MockMesh("updated", mockScene) as any;
            jest.spyOn(draw as any, "handlePoint").mockReturnValue(updatedMesh);
            
            const result = (draw as any).updateAny({ entity: [1, 2, 3], babylonMesh: mockMesh });
            
            expect((draw as any).handlePoint).toHaveBeenCalled();
            expect(result).toBe(updatedMesh);
        });

        it("should update points type mesh", () => {
            const mockMesh = new MockMesh("existing", mockScene) as any;
            mockMesh.metadata = { type: Inputs.Draw.drawingTypes.points, options: {} };
            
            const updatedMesh = new MockMesh("updated", mockScene) as any;
            jest.spyOn(draw as any, "handlePoints").mockReturnValue(updatedMesh);
            
            const result = (draw as any).updateAny({ entity: [[1, 2, 3]], babylonMesh: mockMesh });
            
            expect((draw as any).handlePoints).toHaveBeenCalled();
            expect(result).toBe(updatedMesh);
        });

        it("should update line type mesh", () => {
            const mockMesh = new MockMesh("existing", mockScene) as any;
            mockMesh.metadata = { type: Inputs.Draw.drawingTypes.line, options: {} };
            
            const updatedMesh = new MockMesh("updated", mockScene) as any;
            jest.spyOn(draw as any, "handleLine").mockReturnValue(updatedMesh);
            
            const result = (draw as any).updateAny({ entity: { start: [0, 0, 0], end: [1, 1, 1] }, babylonMesh: mockMesh });
            
            expect((draw as any).handleLine).toHaveBeenCalled();
            expect(result).toBe(updatedMesh);
        });

        it("should update lines type mesh", () => {
            const mockMesh = new MockMesh("existing", mockScene) as any;
            mockMesh.metadata = { type: Inputs.Draw.drawingTypes.lines, options: {} };
            
            const updatedMesh = new MockMesh("updated", mockScene) as any;
            jest.spyOn(draw as any, "handleLines").mockReturnValue(updatedMesh);
            
            const result = (draw as any).updateAny({ entity: [], babylonMesh: mockMesh });
            
            expect((draw as any).handleLines).toHaveBeenCalled();
            expect(result).toBe(updatedMesh);
        });

        it("should update polyline type mesh", () => {
            const mockMesh = new MockMesh("existing", mockScene) as any;
            mockMesh.metadata = { type: Inputs.Draw.drawingTypes.polyline, options: {} };
            
            const updatedMesh = new MockMesh("updated", mockScene) as any;
            jest.spyOn(draw as any, "handlePolyline").mockReturnValue(updatedMesh);
            
            const result = (draw as any).updateAny({ entity: { points: [] }, babylonMesh: mockMesh });
            
            expect((draw as any).handlePolyline).toHaveBeenCalled();
            expect(result).toBe(updatedMesh);
        });

        it("should update polylines type mesh", () => {
            const mockMesh = new MockMesh("existing", mockScene) as any;
            mockMesh.metadata = { type: Inputs.Draw.drawingTypes.polylines, options: {} };
            
            const updatedMesh = new MockMesh("updated", mockScene) as any;
            jest.spyOn(draw as any, "handlePolylines").mockReturnValue(updatedMesh);
            
            const result = (draw as any).updateAny({ entity: [], babylonMesh: mockMesh });
            
            expect((draw as any).handlePolylines).toHaveBeenCalled();
            expect(result).toBe(updatedMesh);
        });

        it("should update verbCurve type mesh", () => {
            const mockMesh = new MockMesh("existing", mockScene) as any;
            mockMesh.metadata = { type: Inputs.Draw.drawingTypes.verbCurve, options: {} };
            
            const updatedMesh = new MockMesh("updated", mockScene) as any;
            jest.spyOn(draw as any, "handleVerbCurve").mockReturnValue(updatedMesh);
            
            const result = (draw as any).updateAny({ entity: {}, babylonMesh: mockMesh });
            
            expect((draw as any).handleVerbCurve).toHaveBeenCalled();
            expect(result).toBe(updatedMesh);
        });

        it("should update verbCurves type mesh", () => {
            const mockMesh = new MockMesh("existing", mockScene) as any;
            mockMesh.metadata = { type: Inputs.Draw.drawingTypes.verbCurves, options: {} };
            
            const updatedMesh = new MockMesh("updated", mockScene) as any;
            jest.spyOn(draw as any, "handleVerbCurves").mockReturnValue(updatedMesh);
            
            const result = (draw as any).updateAny({ entity: [], babylonMesh: mockMesh });
            
            expect((draw as any).handleVerbCurves).toHaveBeenCalled();
            expect(result).toBe(updatedMesh);
        });

        it("should update verbSurface type mesh", () => {
            const mockMesh = new MockMesh("existing", mockScene) as any;
            mockMesh.metadata = { type: Inputs.Draw.drawingTypes.verbSurface, options: {} };
            
            const updatedMesh = new MockMesh("updated", mockScene) as any;
            jest.spyOn(draw as any, "handleVerbSurface").mockReturnValue(updatedMesh);
            
            const result = (draw as any).updateAny({ entity: {}, babylonMesh: mockMesh });
            
            expect((draw as any).handleVerbSurface).toHaveBeenCalled();
            expect(result).toBe(updatedMesh);
        });

        it("should update verbSurfaces type mesh", () => {
            const mockMesh = new MockMesh("existing", mockScene) as any;
            mockMesh.metadata = { type: Inputs.Draw.drawingTypes.verbSurfaces, options: {} };
            
            const updatedMesh = new MockMesh("updated", mockScene) as any;
            jest.spyOn(draw as any, "handleVerbSurfaces").mockReturnValue(updatedMesh);
            
            const result = (draw as any).updateAny({ entity: [], babylonMesh: mockMesh });
            
            expect((draw as any).handleVerbSurfaces).toHaveBeenCalled();
            expect(result).toBe(updatedMesh);
        });

        it("should update tag type mesh", () => {
            const mockMesh = new MockMesh("existing", mockScene) as any;
            mockMesh.metadata = { type: Inputs.Draw.drawingTypes.tag, options: {} };
            
            const updatedMesh = new MockMesh("updated", mockScene) as any;
            jest.spyOn(draw as any, "handleTag").mockReturnValue(updatedMesh);
            
            const result = (draw as any).updateAny({ entity: {}, babylonMesh: mockMesh });
            
            expect((draw as any).handleTag).toHaveBeenCalled();
            expect(result).toBe(updatedMesh);
        });

        it("should update tags type mesh", () => {
            const mockMesh = new MockMesh("existing", mockScene) as any;
            mockMesh.metadata = { type: Inputs.Draw.drawingTypes.tags, options: {} };
            
            const updatedMesh = new MockMesh("updated", mockScene) as any;
            jest.spyOn(draw as any, "handleTags").mockReturnValue(updatedMesh);
            
            const result = (draw as any).updateAny({ entity: [], babylonMesh: mockMesh });
            
            expect((draw as any).handleTags).toHaveBeenCalled();
            expect(result).toBe(updatedMesh);
        });

        it("should update node type mesh", () => {
            const mockMesh = new MockMesh("existing", mockScene) as any;
            mockMesh.metadata = { type: Inputs.Draw.drawingTypes.node, options: {} };
            
            jest.spyOn(draw as any, "handleNode").mockReturnValue([1, 2, 3]);
            
            const result = (draw as any).updateAny({ entity: [1, 2, 3], babylonMesh: mockMesh });
            
            expect((draw as any).handleNode).toHaveBeenCalled();
            expect(result).toEqual([1, 2, 3]);
        });

        it("should update nodes type mesh", () => {
            const mockMesh = new MockMesh("existing", mockScene) as any;
            mockMesh.metadata = { type: Inputs.Draw.drawingTypes.nodes, options: {} };
            
            jest.spyOn(draw as any, "handleNodes").mockReturnValue([[1, 2, 3]]);
            
            const result = (draw as any).updateAny({ entity: [[1, 2, 3]], babylonMesh: mockMesh });
            
            expect((draw as any).handleNodes).toHaveBeenCalled();
            expect(result).toEqual([[1, 2, 3]]);
        });

        it("should return undefined for unknown type", () => {
            const mockMesh = new MockMesh("existing", mockScene) as any;
            mockMesh.metadata = { type: "unknown" as any, options: {} };
            
            const result = (draw as any).updateAny({ entity: {}, babylonMesh: mockMesh });
            
            expect(result).toBeUndefined();
        });

        it("should return undefined if mesh has no metadata", () => {
            const mockMesh = new MockMesh("existing", mockScene) as any;
            
            const result = (draw as any).updateAny({ entity: {}, babylonMesh: mockMesh });
            
            expect(result).toBeUndefined();
        });
    });

    describe("Single entity handle methods", () => {
        it("handlePoint should call drawHelper.drawPoint", () => {
            const mockPoint = [1, 2, 3];
            const mockMesh = new MockMesh("point", mockScene) as any;
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawPoint = jest.fn().mockReturnValue(mockMesh);
            
            const result = (draw as any).handlePoint({ entity: mockPoint });
            
            expect(mockDrawHelper.drawPoint).toHaveBeenCalledWith(expect.objectContaining({
                point: mockPoint
            }));
            expect(result).toBeDefined();
        });

        it("handlePoint should use existing options from babylonMesh metadata", () => {
            const mockPoint = [1, 2, 3];
            const mockMesh = new MockMesh("point", mockScene) as any;
            mockMesh.metadata = { options: { size: 10, colours: "#FF0000" } };
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            
            mockDrawHelper.drawPoint = jest.fn().mockReturnValue(mockMesh);
            
            (draw as any).handlePoint({ entity: mockPoint, babylonMesh: mockMesh });
            
            expect(mockDrawHelper.drawPoint).toHaveBeenCalledWith(expect.objectContaining({
                size: 10,
                colours: "#FF0000"
            }));
        });

        it("handleLine should call drawHelper.drawPolylinesWithColours with line object", () => {
            const mockLine = { start: [0, 0, 0], end: [1, 1, 1] };
            const mockMesh = new MockMesh("line", mockScene) as any;
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawPolylinesWithColours = jest.fn().mockReturnValue(mockMesh);
            
            const result = (draw as any).handleLine({ entity: mockLine });
            
            expect(mockDrawHelper.drawPolylinesWithColours).toHaveBeenCalledWith(expect.objectContaining({
                polylines: [{ points: [[0, 0, 0], [1, 1, 1]] }]
            }));
            expect(result).toBeDefined();
        });

        it("handleLine should handle segment array format", () => {
            const mockLine = [[0, 0, 0], [1, 1, 1]];
            const mockMesh = new MockMesh("line", mockScene) as any;
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawPolylinesWithColours = jest.fn().mockReturnValue(mockMesh);
            
            const result = (draw as any).handleLine({ entity: mockLine });
            
            expect(mockDrawHelper.drawPolylinesWithColours).toHaveBeenCalledWith(expect.objectContaining({
                polylines: [{ points: [[0, 0, 0], [1, 1, 1]] }]
            }));
            expect(result).toBeDefined();
        });

        it("handlePolyline should call drawHelper.drawPolylineClose", () => {
            const mockPolyline = { points: [[0, 0, 0], [1, 1, 1], [2, 2, 2]] };
            const mockMesh = new MockMesh("polyline", mockScene) as any;
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawPolylineClose = jest.fn().mockReturnValue(mockMesh);
            
            const result = (draw as any).handlePolyline({ entity: mockPolyline });
            
            expect(mockDrawHelper.drawPolylineClose).toHaveBeenCalledWith(expect.objectContaining({
                polyline: mockPolyline
            }));
            expect(result).toBeDefined();
        });

        it("handleVerbSurface should call drawHelper.drawSurface", () => {
            const mockSurface = { surface: "test" };
            const mockMesh = new MockMesh("surface", mockScene) as any;
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawSurface = jest.fn().mockReturnValue(mockMesh);
            
            const result = (draw as any).handleVerbSurface({ entity: mockSurface });
            
            expect(mockDrawHelper.drawSurface).toHaveBeenCalledWith(expect.objectContaining({
                surface: mockSurface
            }));
            expect(result).toBeDefined();
        });

        it("handleVerbCurve should call drawHelper.drawCurve", () => {
            const mockCurve = { curve: "test" };
            const mockMesh = new MockMesh("curve", mockScene) as any;
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawCurve = jest.fn().mockReturnValue(mockMesh);
            
            const result = (draw as any).handleVerbCurve({ entity: mockCurve });
            
            expect(mockDrawHelper.drawCurve).toHaveBeenCalledWith(expect.objectContaining({
                curve: mockCurve
            }));
            expect(result).toBeDefined();
        });

        it("handleNode should call node.drawNode", () => {
            const mockNode = [1, 2, 3];
            draw.node.drawNode = jest.fn();
            
            jest.spyOn(draw as any, "applyGlobalSettingsAndMetadataAndShadowCasting").mockImplementation(() => {});
            
            const result = (draw as any).handleNode({ entity: mockNode });
            
            expect(draw.node.drawNode).toHaveBeenCalledWith(expect.objectContaining({
                node: mockNode
            }));
            expect(result).toBe(mockNode);
        });
    });

    describe("Async handle methods", () => {
        it("handleJscadMesh should call drawHelper.drawSolidOrPolygonMesh", async () => {
            const mockJscadMesh = { type: "jscad" };
            const mockMesh = new MockMesh("jscad", mockScene) as any;
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawSolidOrPolygonMesh = jest.fn().mockResolvedValue(mockMesh);
            
            const result = await (draw as any).handleJscadMesh({ entity: mockJscadMesh });
            
            expect(mockDrawHelper.drawSolidOrPolygonMesh).toHaveBeenCalledWith(expect.objectContaining({
                mesh: mockJscadMesh
            }));
            expect(result).toBeDefined();
        });

        it("handleJscadMeshes should call drawHelper.drawSolidOrPolygonMeshes", async () => {
            const mockJscadMeshes = [{ type: "jscad1" }, { type: "jscad2" }];
            const mockMesh = new MockMesh("jscad-meshes", mockScene) as any;
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawSolidOrPolygonMeshes = jest.fn().mockResolvedValue(mockMesh);
            
            const result = await (draw as any).handleJscadMeshes({ entity: mockJscadMeshes });
            
            expect(mockDrawHelper.drawSolidOrPolygonMeshes).toHaveBeenCalledWith(expect.objectContaining({
                meshes: mockJscadMeshes
            }));
            expect(result).toBeDefined();
        });

        it("handleOcctShape should call drawHelper.drawShape", async () => {
            const mockOcctShape = { type: "occt" };
            const mockMesh = new MockMesh("occt", mockScene) as any;
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawShape = jest.fn().mockResolvedValue(mockMesh);
            
            const result = await (draw as any).handleOcctShape({ entity: mockOcctShape });
            
            expect(mockDrawHelper.drawShape).toHaveBeenCalledWith(expect.objectContaining({
                shape: mockOcctShape
            }));
            expect(result).toBeDefined();
        });

        it("handleOcctShapes should call drawHelper.drawShapes", async () => {
            const mockOcctShapes = [{ type: "occt1" }, { type: "occt2" }];
            const mockMesh = new MockMesh("occt-shapes", mockScene) as any;
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawShapes = jest.fn().mockResolvedValue(mockMesh);
            
            const result = await (draw as any).handleOcctShapes({ entity: mockOcctShapes });
            
            expect(mockDrawHelper.drawShapes).toHaveBeenCalledWith(expect.objectContaining({
                shapes: mockOcctShapes
            }));
            expect(result).toBeDefined();
        });

        it("handleManifoldShape should call drawHelper.drawManifoldOrCrossSection", async () => {
            const mockManifoldShape = { type: "manifold" };
            const mockMesh = new MockMesh("manifold", mockScene) as any;
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawManifoldOrCrossSection = jest.fn().mockResolvedValue(mockMesh);
            
            const result = await (draw as any).handleManifoldShape({ entity: mockManifoldShape });
            
            expect(mockDrawHelper.drawManifoldOrCrossSection).toHaveBeenCalledWith(expect.objectContaining({
                manifoldOrCrossSection: mockManifoldShape
            }));
            expect(result).toBeDefined();
        });

        it("handleManifoldShapes should call drawHelper.drawManifoldsOrCrossSections", async () => {
            const mockManifoldShapes = [{ type: "manifold1" }, { type: "manifold2" }];
            const mockMesh = new MockMesh("manifold-shapes", mockScene) as any;
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawManifoldsOrCrossSections = jest.fn().mockResolvedValue(mockMesh);
            
            const result = await (draw as any).handleManifoldShapes({ entity: mockManifoldShapes });
            
            expect(mockDrawHelper.drawManifoldsOrCrossSections).toHaveBeenCalledWith(expect.objectContaining({
                manifoldsOrCrossSections: mockManifoldShapes
            }));
            expect(result).toBeDefined();
        });

        it("handleJscadMesh should use options from babylonMesh metadata", async () => {
            const mockJscadMesh = { type: "jscad" };
            const mockMesh = new MockMesh("jscad", mockScene) as any;
            mockMesh.metadata = { options: { size: 5 } };
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawSolidOrPolygonMesh = jest.fn().mockResolvedValue(mockMesh);
            
            await (draw as any).handleJscadMesh({ entity: mockJscadMesh, babylonMesh: mockMesh });
            
            expect(mockDrawHelper.drawSolidOrPolygonMesh).toHaveBeenCalledWith(expect.objectContaining({
                size: 5
            }));
        });

        it("handleOcctShape should use options from babylonMesh metadata", async () => {
            const mockOcctShape = { type: "occt" };
            const mockMesh = new MockMesh("occt", mockScene) as any;
            mockMesh.metadata = { options: { drawEdges: true } };
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawShape = jest.fn().mockResolvedValue(mockMesh);
            
            await (draw as any).handleOcctShape({ entity: mockOcctShape, babylonMesh: mockMesh });
            
            expect(mockDrawHelper.drawShape).toHaveBeenCalledWith(expect.objectContaining({
                drawEdges: true
            }));
        });
    });

    describe("applyGlobalSettingsAndMetadataAndShadowCasting", () => {
        it("should set mesh as not pickable", () => {
            const mockMesh = new MockMesh("test", mockScene) as any;
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            
            (draw as any).applyGlobalSettingsAndMetadataAndShadowCasting(
                Inputs.Draw.drawingTypes.point,
                {},
                mockMesh
            );
            
            expect(mockMesh.isPickable).toBe(false);
        });

        it("should set child meshes as not pickable", () => {
            const mockMesh = new MockMesh("test", mockScene) as any;
            const childMesh1 = new MockMesh("child1", mockScene) as any;
            const childMesh2 = new MockMesh("child2", mockScene) as any;
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([childMesh1, childMesh2]);
            
            (draw as any).applyGlobalSettingsAndMetadataAndShadowCasting(
                Inputs.Draw.drawingTypes.point,
                {},
                mockMesh
            );
            
            expect(childMesh1.isPickable).toBe(false);
            expect(childMesh2.isPickable).toBe(false);
        });

        it("should set metadata on mesh", () => {
            const mockMesh = new MockMesh("test", mockScene) as any;
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            const options = { size: 5 };
            
            (draw as any).applyGlobalSettingsAndMetadataAndShadowCasting(
                Inputs.Draw.drawingTypes.point,
                options,
                mockMesh
            );
            
            expect(mockMesh.metadata).toBeDefined();
            expect(mockMesh.metadata.type).toBe(Inputs.Draw.drawingTypes.point);
            expect(mockMesh.metadata.options).toBe(options);
        });

        it("should preserve existing metadata", () => {
            const mockMesh = new MockMesh("test", mockScene) as any;
            mockMesh.metadata = { existingProp: "value" };
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            
            (draw as any).applyGlobalSettingsAndMetadataAndShadowCasting(
                Inputs.Draw.drawingTypes.point,
                {},
                mockMesh
            );
            
            expect(mockMesh.metadata.existingProp).toBe("value");
            expect(mockMesh.metadata.type).toBe(Inputs.Draw.drawingTypes.point);
        });

        it("should enable shadows by default", () => {
            const mockMesh = new MockMesh("test", mockScene) as any;
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            
            const mockShadowGenerator = {
                addShadowCaster: jest.fn()
            };
            mockScene.metadata.shadowGenerators = [mockShadowGenerator];
            
            (draw as any).applyGlobalSettingsAndMetadataAndShadowCasting(
                Inputs.Draw.drawingTypes.point,
                {},
                mockMesh
            );
            
            expect(mockMesh.receiveShadows).toBe(true);
            expect(mockShadowGenerator.addShadowCaster).toHaveBeenCalledWith(mockMesh);
        });

        it("should disable shadows when metadata.shadows is false", () => {
            const mockMesh = new MockMesh("test", mockScene) as any;
            mockMesh.metadata = { shadows: false };
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            
            const mockShadowGenerator = {
                addShadowCaster: jest.fn()
            };
            mockScene.metadata.shadowGenerators = [mockShadowGenerator];
            
            (draw as any).applyGlobalSettingsAndMetadataAndShadowCasting(
                Inputs.Draw.drawingTypes.point,
                {},
                mockMesh
            );
            
            expect(mockMesh.receiveShadows).toBeUndefined();
            expect(mockShadowGenerator.addShadowCaster).not.toHaveBeenCalled();
        });

        it("should handle child meshes with shadows", () => {
            const mockMesh = new MockMesh("test", mockScene) as any;
            const childMesh = new MockMesh("child", mockScene) as any;
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([childMesh]);
            
            const mockShadowGenerator = {
                addShadowCaster: jest.fn()
            };
            mockScene.metadata.shadowGenerators = [mockShadowGenerator];
            
            (draw as any).applyGlobalSettingsAndMetadataAndShadowCasting(
                Inputs.Draw.drawingTypes.point,
                {},
                mockMesh
            );
            
            expect(childMesh.receiveShadows).toBe(true);
            expect(mockShadowGenerator.addShadowCaster).toHaveBeenCalledWith(childMesh);
        });

        it("should handle multiple shadow generators", () => {
            const mockMesh = new MockMesh("test", mockScene) as any;
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            
            const mockShadowGenerator1 = { addShadowCaster: jest.fn() };
            const mockShadowGenerator2 = { addShadowCaster: jest.fn() };
            mockScene.metadata.shadowGenerators = [mockShadowGenerator1, mockShadowGenerator2];
            
            (draw as any).applyGlobalSettingsAndMetadataAndShadowCasting(
                Inputs.Draw.drawingTypes.point,
                {},
                mockMesh
            );
            
            expect(mockShadowGenerator1.addShadowCaster).toHaveBeenCalledWith(mockMesh);
            expect(mockShadowGenerator2.addShadowCaster).toHaveBeenCalledWith(mockMesh);
        });

        it("should not crash when result is undefined", () => {
            expect(() => {
                (draw as any).applyGlobalSettingsAndMetadataAndShadowCasting(
                    Inputs.Draw.drawingTypes.point,
                    {},
                    undefined
                );
            }).not.toThrow();
        });

        it("should handle empty shadow generators array", () => {
            const mockMesh = new MockMesh("test", mockScene) as any;
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockScene.metadata.shadowGenerators = [];
            
            (draw as any).applyGlobalSettingsAndMetadataAndShadowCasting(
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
            const mockMesh = new MockMesh("points", mockScene) as any;
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawPoints = jest.fn().mockReturnValue(mockMesh);
            
            (draw as any).handlePoints({ entity: mockPoints, options: customOptions });
            
            expect(mockDrawHelper.drawPoints).toHaveBeenCalledWith(expect.objectContaining({
                size: 15,
                colours: "#00FF00"
            }));
        });

        it("handlePoints should use metadata options when babylonMesh provided and no options", () => {
            const mockPoints = [[1, 2, 3], [4, 5, 6]];
            const mockMesh = new MockMesh("points", mockScene) as any;
            mockMesh.metadata = { options: { size: 20, colours: "#FF00FF" } };
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawPoints = jest.fn().mockReturnValue(mockMesh);
            
            (draw as any).handlePoints({ entity: mockPoints, babylonMesh: mockMesh });
            
            expect(mockDrawHelper.drawPoints).toHaveBeenCalledWith(expect.objectContaining({
                size: 20,
                colours: "#FF00FF"
            }));
        });

        it("handleLines should use default polyline options when no options provided", () => {
            const mockLines = [{ start: [0, 0, 0], end: [1, 1, 1] }];
            const mockMesh = new MockMesh("lines", mockScene) as any;
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawPolylinesWithColours = jest.fn().mockReturnValue(mockMesh);
            
            (draw as any).handleLines({ entity: mockLines });
            
            expect(mockDrawHelper.drawPolylinesWithColours).toHaveBeenCalledWith(expect.objectContaining({
                size: 2,
                colours: "#ff00ff"
            }));
        });

        it("handleLines should use metadata options when babylonMesh provided and no options", () => {
            const mockLines = [{ start: [0, 0, 0], end: [1, 1, 1] }];
            const mockMesh = new MockMesh("lines", mockScene) as any;
            mockMesh.metadata = { options: { size: 7, colours: "#00FFFF" } };
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawPolylinesWithColours = jest.fn().mockReturnValue(mockMesh);
            
            (draw as any).handleLines({ entity: mockLines, babylonMesh: mockMesh });
            
            expect(mockDrawHelper.drawPolylinesWithColours).toHaveBeenCalledWith(expect.objectContaining({
                size: 7,
                colours: "#00FFFF"
            }));
        });

        it("handleVerbCurves should use metadata options when babylonMesh provided", () => {
            const mockCurves = [{ curve: "test" }];
            const mockMesh = new MockMesh("curves", mockScene) as any;
            mockMesh.metadata = { options: { size: 8 } };
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawCurves = jest.fn().mockReturnValue(mockMesh);
            
            (draw as any).handleVerbCurves({ entity: mockCurves, babylonMesh: mockMesh });
            
            expect(mockDrawHelper.drawCurves).toHaveBeenCalledWith(expect.objectContaining({
                size: 8
            }));
        });

        it("handleNode should use default node options", () => {
            const mockNodeData = [1, 2, 3];
            draw.node.drawNode = jest.fn();
            jest.spyOn(draw as any, "applyGlobalSettingsAndMetadataAndShadowCasting").mockImplementation(() => {});
            
            (draw as any).handleNode({ entity: mockNodeData });
            
            expect(draw.node.drawNode).toHaveBeenCalledWith(expect.objectContaining({
                colorX: "#ff0000",
                colorY: "#00ff00",
                colorZ: "#0000ff",
                size: 2
            }));
        });

        it("handleNode should use metadata options when babylonMesh provided and no options", () => {
            const mockNodeData = [1, 2, 3];
            const mockMesh = new MockMesh("node", mockScene) as any;
            mockMesh.metadata = { options: { size: 25, colorX: "#AABBCC", colorY: "#DDEEFF" } };
            draw.node.drawNode = jest.fn();
            jest.spyOn(draw as any, "applyGlobalSettingsAndMetadataAndShadowCasting").mockImplementation(() => {});
            
            (draw as any).handleNode({ entity: mockNodeData, babylonMesh: mockMesh });
            
            expect(draw.node.drawNode).toHaveBeenCalledWith(expect.objectContaining({
                size: 25,
                colorX: "#AABBCC",
                colorY: "#DDEEFF"
            }));
        });

        it("handlePolyline should use metadata options when babylonMesh provided", () => {
            const mockPolyline = { points: [[0, 0, 0], [1, 1, 1]] };
            const mockMesh = new MockMesh("polyline", mockScene) as any;
            mockMesh.metadata = { options: { size: 10, colours: "#123456" } };
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawPolylineClose = jest.fn().mockReturnValue(mockMesh);
            
            (draw as any).handlePolyline({ entity: mockPolyline, babylonMesh: mockMesh });
            
            expect(mockDrawHelper.drawPolylineClose).toHaveBeenCalledWith(expect.objectContaining({
                size: 10,
                colours: "#123456"
            }));
        });

        it("handleLine should use metadata options when babylonMesh provided", () => {
            const mockLine = { start: [0, 0, 0], end: [1, 1, 1] };
            const mockMesh = new MockMesh("line", mockScene) as any;
            mockMesh.metadata = { options: { size: 5, colours: "#abcdef" } };
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawPolylinesWithColours = jest.fn().mockReturnValue(mockMesh);
            
            (draw as any).handleLine({ entity: mockLine, babylonMesh: mockMesh });
            
            expect(mockDrawHelper.drawPolylinesWithColours).toHaveBeenCalledWith(expect.objectContaining({
                size: 5,
                colours: "#abcdef"
            }));
        });

        it("handlePoint should use metadata options when babylonMesh provided", () => {
            const mockPoint = [1, 2, 3];
            const mockMesh = new MockMesh("point", mockScene) as any;
            mockMesh.metadata = { options: { size: 12, colours: "#ffffff" } };
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawPoint = jest.fn().mockReturnValue(mockMesh);
            
            (draw as any).handlePoint({ entity: mockPoint, babylonMesh: mockMesh });
            
            expect(mockDrawHelper.drawPoint).toHaveBeenCalledWith(expect.objectContaining({
                size: 12,
                colours: "#ffffff"
            }));
        });

        it("handlePolylines should use metadata options when babylonMesh provided", () => {
            const mockPolylines = [{ points: [[0, 0, 0], [1, 1, 1]] }, { points: [[2, 2, 2], [3, 3, 3]] }];
            const mockMesh = new MockMesh("polylines", mockScene) as any;
            mockMesh.metadata = { options: { size: 3, colours: "#aabbcc" } };
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawPolylinesWithColours = jest.fn().mockReturnValue(mockMesh);
            
            (draw as any).handlePolylines({ entity: mockPolylines, babylonMesh: mockMesh });
            
            expect(mockDrawHelper.drawPolylinesWithColours).toHaveBeenCalledWith(expect.objectContaining({
                size: 3,
                colours: "#aabbcc"
            }));
        });

        it("handleVerbCurve should use metadata options when babylonMesh provided", () => {
            const mockCurve = { degree: 3, controlPoints: [] };
            const mockMesh = new MockMesh("curve", mockScene) as any;
            mockMesh.metadata = { options: { size: 6, colours: "#112233" } };
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawCurve = jest.fn().mockReturnValue(mockMesh);
            
            (draw as any).handleVerbCurve({ entity: mockCurve, babylonMesh: mockMesh });
            
            expect(mockDrawHelper.drawCurve).toHaveBeenCalledWith(expect.objectContaining({
                size: 6,
                colours: "#112233"
            }));
        });

        it("handleVerbSurface should use metadata options when babylonMesh provided", () => {
            const mockSurface = { degreeU: 3, degreeV: 3, controlPoints: [] };
            const mockMesh = new MockMesh("surface", mockScene) as any;
            mockMesh.metadata = { options: { size: 7, colours: "#445566" } };
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawSurface = jest.fn().mockReturnValue(mockMesh);
            
            (draw as any).handleVerbSurface({ entity: mockSurface, babylonMesh: mockMesh });
            
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
            const mockMesh = new MockMesh("surfaces", mockScene) as any;
            mockMesh.metadata = { options: { size: 9, colours: "#778899" } };
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawSurfacesMultiColour = jest.fn().mockReturnValue(mockMesh);
            
            (draw as any).handleVerbSurfaces({ entity: mockSurfaces, babylonMesh: mockMesh });
            
            expect(mockDrawHelper.drawSurfacesMultiColour).toHaveBeenCalledWith(expect.objectContaining({
                size: 9,
                colours: "#778899"
            }));
        });

        it("handleNodes should use metadata options when babylonMesh provided", () => {
            const mockNodes = [[1, 2, 3], [4, 5, 6]];
            const mockMesh = new MockMesh("nodes", mockScene) as any;
            mockMesh.metadata = { options: { size: 11, colorX: "#111111" } };
            draw.node.drawNodes = jest.fn();
            jest.spyOn(draw as any, "applyGlobalSettingsAndMetadataAndShadowCasting").mockImplementation(() => {});
            
            (draw as any).handleNodes({ entity: mockNodes, babylonMesh: mockMesh });
            
            expect(draw.node.drawNodes).toHaveBeenCalledWith(expect.objectContaining({
                size: 11,
                colorX: "#111111"
            }));
        });

        it("handleTag should use metadata options when babylonMesh provided", () => {
            const mockTagEntity = { tag: "test" };
            const mockMesh = new MockMesh("tag", mockScene) as any;
            mockMesh.metadata = { options: { size: 14, colours: "#fedcba" } };
            draw.tag.drawTag = jest.fn().mockReturnValue(mockMesh);
            
            (draw as any).handleTag({ entity: mockTagEntity, babylonMesh: mockMesh });
            
            expect(draw.tag.drawTag).toHaveBeenCalledWith(expect.objectContaining({
                size: 14,
                colours: "#fedcba"
            }));
        });

        it("handleJscadMesh should use metadata options when babylonMesh provided", async () => {
            const mockJscadMesh = { vertices: [] };
            const mockMesh = new MockMesh("jscad", mockScene) as any;
            mockMesh.metadata = { options: { size: 4, colours: "#abc123" } };
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawSolidOrPolygonMesh = jest.fn().mockResolvedValue(mockMesh);
            jest.spyOn(draw as any, "applyGlobalSettingsAndMetadataAndShadowCasting").mockImplementation(() => {});
            
            await (draw as any).handleJscadMesh({ entity: mockJscadMesh, babylonMesh: mockMesh });
            
            expect(mockDrawHelper.drawSolidOrPolygonMesh).toHaveBeenCalledWith(expect.objectContaining({
                size: 4,
                colours: "#abc123"
            }));
        });

        it("handleJscadMeshes should use metadata options when babylonMesh provided", async () => {
            const mockJscadMeshes = [{ vertices: [] }, { vertices: [] }];
            const mockMesh = new MockMesh("jscads", mockScene) as any;
            mockMesh.metadata = { options: { size: 13, colours: "#def456" } };
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawSolidOrPolygonMeshes = jest.fn().mockResolvedValue(mockMesh);
            jest.spyOn(draw as any, "applyGlobalSettingsAndMetadataAndShadowCasting").mockImplementation(() => {});
            
            await (draw as any).handleJscadMeshes({ entity: mockJscadMeshes, babylonMesh: mockMesh });
            
            expect(mockDrawHelper.drawSolidOrPolygonMeshes).toHaveBeenCalledWith(expect.objectContaining({
                size: 13,
                colours: "#def456"
            }));
        });

        it("handleOcctShape should use metadata options when babylonMesh provided", async () => {
            const mockOcctShape = { hash: "shape123" };
            const mockMesh = new MockMesh("occt", mockScene) as any;
            mockMesh.metadata = { options: { faceMaterial: "#123abc", edgeMaterial: "#456def" } };
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawShape = jest.fn().mockResolvedValue(mockMesh);
            jest.spyOn(draw as any, "applyGlobalSettingsAndMetadataAndShadowCasting").mockImplementation(() => {});
            
            await (draw as any).handleOcctShape({ entity: mockOcctShape, babylonMesh: mockMesh });
            
            expect(mockDrawHelper.drawShape).toHaveBeenCalledWith(expect.objectContaining({
                faceMaterial: "#123abc",
                edgeMaterial: "#456def"
            }));
        });

        it("handleOcctShapes should use metadata options when babylonMesh provided", async () => {
            const mockOcctShapes = [{ hash: "shape1" }, { hash: "shape2" }];
            const mockMesh = new MockMesh("occts", mockScene) as any;
            mockMesh.metadata = { options: { faceMaterial: "#789ghi", edgeMaterial: "#012jkl" } };
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawShapes = jest.fn().mockResolvedValue(mockMesh);
            jest.spyOn(draw as any, "applyGlobalSettingsAndMetadataAndShadowCasting").mockImplementation(() => {});
            
            await (draw as any).handleOcctShapes({ entity: mockOcctShapes, babylonMesh: mockMesh });
            
            expect(mockDrawHelper.drawShapes).toHaveBeenCalledWith(expect.objectContaining({
                faceMaterial: "#789ghi",
                edgeMaterial: "#012jkl"
            }));
        });

        it("handleManifoldShape should use metadata options when babylonMesh provided", async () => {
            const mockManifoldShape = { hash: "manifold123" };
            const mockMesh = new MockMesh("manifold", mockScene) as any;
            mockMesh.metadata = { options: { faceMaterial: "#aaa111", edgeMaterial: "#bbb222" } };
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawManifoldOrCrossSection = jest.fn().mockResolvedValue(mockMesh);
            jest.spyOn(draw as any, "applyGlobalSettingsAndMetadataAndShadowCasting").mockImplementation(() => {});
            
            await (draw as any).handleManifoldShape({ entity: mockManifoldShape, babylonMesh: mockMesh });
            
            expect(mockDrawHelper.drawManifoldOrCrossSection).toHaveBeenCalledWith(expect.objectContaining({
                faceMaterial: "#aaa111",
                edgeMaterial: "#bbb222"
            }));
        });

        it("handleManifoldShapes should use metadata options when babylonMesh provided", async () => {
            const mockManifoldShapes = [{ hash: "manifold1" }, { hash: "manifold2" }];
            const mockMesh = new MockMesh("manifolds", mockScene) as any;
            mockMesh.metadata = { options: { faceMaterial: "#ccc333", edgeMaterial: "#ddd444" } };
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawManifoldsOrCrossSections = jest.fn().mockResolvedValue(mockMesh);
            jest.spyOn(draw as any, "applyGlobalSettingsAndMetadataAndShadowCasting").mockImplementation(() => {});
            
            await (draw as any).handleManifoldShapes({ entity: mockManifoldShapes, babylonMesh: mockMesh });
            
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
            const mockMesh = new MockMesh("tag", mockScene) as any;
            mockMesh.metadata = { options: {} };
            draw.tag.drawTag = jest.fn().mockReturnValue(mockMesh);
            
            (draw as any).handleTag({ entity: mockTagEntity, options: customOptions });
            
            expect(draw.tag.drawTag).toHaveBeenCalledWith(expect.objectContaining({
                size: 99,
                colours: "#990099"
            }));
        });

        it("handleVerbSurfaces should use provided options when options are passed", () => {
            const mockSurfaces = [{ degreeU: 3, degreeV: 3, controlPoints: [] }];
            const customOptions = { size: 50, colours: "#505050" };
            const mockMesh = new MockMesh("surfaces", mockScene) as any;
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawSurfacesMultiColour = jest.fn().mockReturnValue(mockMesh);
            
            (draw as any).handleVerbSurfaces({ entity: mockSurfaces, options: customOptions });
            
            expect(mockDrawHelper.drawSurfacesMultiColour).toHaveBeenCalledWith(expect.objectContaining({
                size: 50,
                colours: "#505050"
            }));
        });

        it("handleVerbCurves should use provided options when options are passed", () => {
            const mockCurves = [{ degree: 3, controlPoints: [] }];
            const customOptions = { size: 45, colours: "#454545" };
            const mockMesh = new MockMesh("curves", mockScene) as any;
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawCurves = jest.fn().mockReturnValue(mockMesh);
            
            (draw as any).handleVerbCurves({ entity: mockCurves, options: customOptions });
            
            expect(mockDrawHelper.drawCurves).toHaveBeenCalledWith(expect.objectContaining({
                size: 45,
                colours: "#454545"
            }));
        });

        it("handleNodes should use provided options when options are passed", () => {
            const mockNodes = [[1, 2, 3], [4, 5, 6]];
            const customOptions = { size: 30, colorX: "#303030", colorY: "#404040" };
            draw.node.drawNodes = jest.fn();
            jest.spyOn(draw as any, "applyGlobalSettingsAndMetadataAndShadowCasting").mockImplementation(() => {});
            
            (draw as any).handleNodes({ entity: mockNodes, options: customOptions });
            
            expect(draw.node.drawNodes).toHaveBeenCalledWith(expect.objectContaining({
                size: 30,
                colorX: "#303030",
                colorY: "#404040"
            }));
        });

        it("handlePoints should use provided options when options are passed", () => {
            const mockPoints = [[1, 2, 3], [4, 5, 6]];
            const customOptions = { size: 25, colours: "#252525" };
            const mockMesh = new MockMesh("points", mockScene) as any;
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawPoints = jest.fn().mockReturnValue(mockMesh);
            
            (draw as any).handlePoints({ entity: mockPoints, options: customOptions });
            
            expect(mockDrawHelper.drawPoints).toHaveBeenCalledWith(expect.objectContaining({
                size: 25,
                colours: "#252525"
            }));
        });

        it("handleLines should use provided options when options are passed", () => {
            const mockLines = [{ start: [0, 0, 0], end: [1, 1, 1] }];
            const customOptions = { size: 35, colours: "#353535" };
            const mockMesh = new MockMesh("lines", mockScene) as any;
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawPolylinesWithColours = jest.fn().mockReturnValue(mockMesh);
            
            (draw as any).handleLines({ entity: mockLines, options: customOptions });
            
            expect(mockDrawHelper.drawPolylinesWithColours).toHaveBeenCalledWith(expect.objectContaining({
                size: 35,
                colours: "#353535"
            }));
        });

        it("handlePolylines should use provided options when options are passed", () => {
            const mockPolylines = [{ points: [[0, 0, 0], [1, 1, 1]] }];
            const customOptions = { size: 40, colours: "#404040" };
            const mockMesh = new MockMesh("polylines", mockScene) as any;
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawPolylinesWithColours = jest.fn().mockReturnValue(mockMesh);
            
            (draw as any).handlePolylines({ entity: mockPolylines, options: customOptions });
            
            expect(mockDrawHelper.drawPolylinesWithColours).toHaveBeenCalledWith(expect.objectContaining({
                size: 40,
                colours: "#404040"
            }));
        });

        it("handleVerbSurface should use provided options when options are passed", () => {
            const mockSurface = { degreeU: 3, degreeV: 3, controlPoints: [] };
            const customOptions = { size: 55, colours: "#555555" };
            const mockMesh = new MockMesh("surface", mockScene) as any;
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawSurface = jest.fn().mockReturnValue(mockMesh);
            
            (draw as any).handleVerbSurface({ entity: mockSurface, options: customOptions });
            
            expect(mockDrawHelper.drawSurface).toHaveBeenCalledWith(expect.objectContaining({
                size: 55,
                colours: "#555555"
            }));
        });

        it("handleVerbCurve should use provided options when options are passed", () => {
            const mockCurve = { degree: 3, controlPoints: [] };
            const customOptions = { size: 60, colours: "#606060" };
            const mockMesh = new MockMesh("curve", mockScene) as any;
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawCurve = jest.fn().mockReturnValue(mockMesh);
            
            (draw as any).handleVerbCurve({ entity: mockCurve, options: customOptions });
            
            expect(mockDrawHelper.drawCurve).toHaveBeenCalledWith(expect.objectContaining({
                size: 60,
                colours: "#606060"
            }));
        });

        it("handleNode should use provided options when options are passed", () => {
            const mockNodeData = [1, 2, 3];
            const customOptions = { size: 65, colorX: "#656565", colorY: "#757575" };
            draw.node.drawNode = jest.fn();
            jest.spyOn(draw as any, "applyGlobalSettingsAndMetadataAndShadowCasting").mockImplementation(() => {});
            
            (draw as any).handleNode({ entity: mockNodeData, options: customOptions });
            
            expect(draw.node.drawNode).toHaveBeenCalledWith(expect.objectContaining({
                size: 65,
                colorX: "#656565",
                colorY: "#757575"
            }));
        });

        it("handlePolyline should use provided options when options are passed", () => {
            const mockPolyline = { points: [[0, 0, 0], [1, 1, 1]] };
            const customOptions = { size: 70, colours: "#707070" };
            const mockMesh = new MockMesh("polyline", mockScene) as any;
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawPolylineClose = jest.fn().mockReturnValue(mockMesh);
            
            (draw as any).handlePolyline({ entity: mockPolyline, options: customOptions });
            
            expect(mockDrawHelper.drawPolylineClose).toHaveBeenCalledWith(expect.objectContaining({
                size: 70,
                colours: "#707070"
            }));
        });

        it("handlePoint should use provided options when options are passed", () => {
            const mockPoint = [1, 2, 3];
            const customOptions = { size: 75, colours: "#757575" };
            const mockMesh = new MockMesh("point", mockScene) as any;
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawPoint = jest.fn().mockReturnValue(mockMesh);
            
            (draw as any).handlePoint({ entity: mockPoint, options: customOptions });
            
            expect(mockDrawHelper.drawPoint).toHaveBeenCalledWith(expect.objectContaining({
                size: 75,
                colours: "#757575"
            }));
        });

        it("handleLine should use provided options when options are passed", () => {
            const mockLine = { start: [0, 0, 0], end: [1, 1, 1] };
            const customOptions = { size: 80, colours: "#808080" };
            const mockMesh = new MockMesh("line", mockScene) as any;
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawPolylinesWithColours = jest.fn().mockReturnValue(mockMesh);
            
            (draw as any).handleLine({ entity: mockLine, options: customOptions });
            
            expect(mockDrawHelper.drawPolylinesWithColours).toHaveBeenCalledWith(expect.objectContaining({
                size: 80,
                colours: "#808080"
            }));
        });

        it("handleJscadMesh should use provided options when options are passed", async () => {
            const mockJscadMesh = { vertices: [] };
            const customOptions = { size: 85, colours: "#858585" };
            const mockMesh = new MockMesh("jscad", mockScene) as any;
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawSolidOrPolygonMesh = jest.fn().mockResolvedValue(mockMesh);
            jest.spyOn(draw as any, "applyGlobalSettingsAndMetadataAndShadowCasting").mockImplementation(() => {});
            
            await (draw as any).handleJscadMesh({ entity: mockJscadMesh, options: customOptions });
            
            expect(mockDrawHelper.drawSolidOrPolygonMesh).toHaveBeenCalledWith(expect.objectContaining({
                size: 85,
                colours: "#858585"
            }));
        });

        it("handleJscadMeshes should use provided options when options are passed", async () => {
            const mockJscadMeshes = [{ vertices: [] }, { vertices: [] }];
            const customOptions = { size: 90, colours: "#909090" };
            const mockMesh = new MockMesh("jscads", mockScene) as any;
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawSolidOrPolygonMeshes = jest.fn().mockResolvedValue(mockMesh);
            jest.spyOn(draw as any, "applyGlobalSettingsAndMetadataAndShadowCasting").mockImplementation(() => {});
            
            await (draw as any).handleJscadMeshes({ entity: mockJscadMeshes, options: customOptions });
            
            expect(mockDrawHelper.drawSolidOrPolygonMeshes).toHaveBeenCalledWith(expect.objectContaining({
                size: 90,
                colours: "#909090"
            }));
        });

        it("handleOcctShape should use provided options when options are passed", async () => {
            const mockOcctShape = { hash: "shape123" };
            const customOptions = { faceMaterial: "#aaa111", edgeMaterial: "#bbb222" };
            const mockMesh = new MockMesh("occt", mockScene) as any;
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawShape = jest.fn().mockResolvedValue(mockMesh);
            jest.spyOn(draw as any, "applyGlobalSettingsAndMetadataAndShadowCasting").mockImplementation(() => {});
            
            await (draw as any).handleOcctShape({ entity: mockOcctShape, options: customOptions });
            
            expect(mockDrawHelper.drawShape).toHaveBeenCalledWith(expect.objectContaining({
                faceMaterial: "#aaa111",
                edgeMaterial: "#bbb222"
            }));
        });

        it("handleOcctShapes should use provided options when options are passed", async () => {
            const mockOcctShapes = [{ hash: "shape1" }, { hash: "shape2" }];
            const customOptions = { faceMaterial: "#ccc111", edgeMaterial: "#ddd222" };
            const mockMesh = new MockMesh("occts", mockScene) as any;
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawShapes = jest.fn().mockResolvedValue(mockMesh);
            jest.spyOn(draw as any, "applyGlobalSettingsAndMetadataAndShadowCasting").mockImplementation(() => {});
            
            await (draw as any).handleOcctShapes({ entity: mockOcctShapes, options: customOptions });
            
            expect(mockDrawHelper.drawShapes).toHaveBeenCalledWith(expect.objectContaining({
                faceMaterial: "#ccc111",
                edgeMaterial: "#ddd222"
            }));
        });

        it("handleManifoldShape should use provided options when options are passed", async () => {
            const mockManifoldShape = { hash: "manifold123" };
            const customOptions = { faceMaterial: "#eee111", edgeMaterial: "#fff222" };
            const mockMesh = new MockMesh("manifold", mockScene) as any;
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawManifoldOrCrossSection = jest.fn().mockResolvedValue(mockMesh);
            jest.spyOn(draw as any, "applyGlobalSettingsAndMetadataAndShadowCasting").mockImplementation(() => {});
            
            await (draw as any).handleManifoldShape({ entity: mockManifoldShape, options: customOptions });
            
            expect(mockDrawHelper.drawManifoldOrCrossSection).toHaveBeenCalledWith(expect.objectContaining({
                faceMaterial: "#eee111",
                edgeMaterial: "#fff222"
            }));
        });

        it("handleManifoldShapes should use provided options when options are passed", async () => {
            const mockManifoldShapes = [{ hash: "manifold1" }, { hash: "manifold2" }];
            const customOptions = { faceMaterial: "#111eee", edgeMaterial: "#222fff" };
            const mockMesh = new MockMesh("manifolds", mockScene) as any;
            mockMesh.getChildMeshes = jest.fn().mockReturnValue([]);
            mockDrawHelper.drawManifoldsOrCrossSections = jest.fn().mockResolvedValue(mockMesh);
            jest.spyOn(draw as any, "applyGlobalSettingsAndMetadataAndShadowCasting").mockImplementation(() => {});
            
            await (draw as any).handleManifoldShapes({ entity: mockManifoldShapes, options: customOptions });
            
            expect(mockDrawHelper.drawManifoldsOrCrossSections).toHaveBeenCalledWith(expect.objectContaining({
                faceMaterial: "#111eee",
                edgeMaterial: "#222fff"
            }));
        });
    });
});
