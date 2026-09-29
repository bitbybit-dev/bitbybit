import { describe, it, expect, beforeEach, afterEach, vi, type Mock } from "vitest";
vi.mock("@babylonjs/core", async () => {
    const { createBabylonJSMock } = await vi.importActual<typeof import("./__mocks__/babylonjs.mock")>("./__mocks__/babylonjs.mock");
    return createBabylonJSMock();
});

import { createDrawHelperMocks } from "./__mocks__/test-helpers";
import { MockGreasedLineMesh, MockMesh, MockPBRMetallicRoughnessMaterial, instanceOf } from "./__mocks__/babylonjs.mock";
import { DrawHelper } from "./draw-helper";
import * as Inputs from "./inputs";
import * as BABYLON from "@babylonjs/core";

type Point3 = Inputs.Base.Point3;

const BLUE = [0, 0, 1, 1];
const CYAN = [0, 1, 1, 1];
const GREEN = [0, 1, 0, 1];
const YELLOW = [1, 1, 0, 1];
const RED = [1, 0, 0, 1];
const GREY = [0.2158605, 0.2158605, 0.2158605, 1];

const triangle = (faceIndex: number, analysisValues?: number[]): Inputs.OCCT.DecomposedFaceDto => {
    const x = faceIndex * 10;
    const face: Inputs.OCCT.DecomposedFaceDto = {
        faceIndex,
        vertexCoord: [x, 0, 0, x + 1, 0, 0, x, 1, 0],
        vertexCoordVec: [[x, 0, 0], [x + 1, 0, 0], [x, 1, 0]],
        normalCoord: [0, 0, 1, 0, 0, 1, 0, 0, 1],
        triIndexes: [0, 1, 2],
        numberOfTriangles: 1,
        centerPoint: [x + 0.3, 0.3, 0],
        centerNormal: [0, 0, 1],
        uvs: [0, 0, 1, 0, 0, 1],
    };
    return analysisValues === undefined ? face : { ...face, analysisValues };
};

const meshOf = (faceList: Inputs.OCCT.DecomposedFaceDto[], isoCurveList?: Point3[][]): Inputs.OCCT.DecomposedMeshDto => {
    const mesh: Inputs.OCCT.DecomposedMeshDto = { faceList, edgeList: [], pointsList: [] };
    return isoCurveList === undefined ? mesh : { ...mesh, isoCurveList };
};

const ISO_CURVES: Point3[][] = [[[0, 0, 0], [1, 0, 0]], [[0, 1, 0], [0.5, 1, 0], [1, 1, 0]]];

const occtShape = (hash: number): Inputs.OCCT.TopoDSShapePointer => ({ hash, type: "occ-shape" });

describe("DrawHelper iso curves and surface analysis", () => {
    let drawHelper: DrawHelper;
    let occtWorkerCall: Mock;

    beforeEach(() => {
        const mocks = createDrawHelperMocks();
        occtWorkerCall = mocks.occtWorkerCall;
        drawHelper = new DrawHelper(mocks.mockContext, mocks.mockSolidText, mocks.mockVector, mocks.mockJscadWorkerManager, mocks.mockManifoldWorkerManager, mocks.mockOccWorkerManager);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    const children = (drawn: BABYLON.Mesh): MockMesh[] => instanceOf(drawn, MockMesh).getChildMeshes();
    const greasedLines = (drawn: BABYLON.Mesh): MockGreasedLineMesh[] => children(drawn).filter((child): child is MockGreasedLineMesh => child instanceof MockGreasedLineMesh);
    const surfaces = (drawn: BABYLON.Mesh): MockMesh[] => children(drawn).filter(child => !(child instanceof MockGreasedLineMesh) && child._vertexData !== null);
    const frontFaces = (drawn: BABYLON.Mesh): MockMesh[] => surfaces(drawn).filter(child => !child.name.includes("backFace"));
    const materialOf = (mesh: MockMesh): MockPBRMetallicRoughnessMaterial => instanceOf(mesh.material, MockPBRMetallicRoughnessMaterial);
    const rounded = (values: number[]): number[] => values.map(value => Number(value.toFixed(7)));

    const vertexColors = (mesh: MockMesh): Map<string, number[]> => {
        const data = mesh._vertexData!;
        const colors = new Map<string, number[]>();
        for (let vertex = 0; vertex < data.positions.length / 3; vertex++) {
            colors.set(data.positions.slice(3 * vertex, 3 * vertex + 3).join(","), rounded(data.colors!.slice(4 * vertex, 4 * vertex + 4)));
        }
        return colors;
    };

    const draw = (mesh: Inputs.OCCT.DecomposedMeshDto, options: Partial<Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>>): Promise<BABYLON.Mesh> =>
        drawHelper.handleDecomposedMesh({ drawEdges: false, drawTwoSided: false, ...options }, mesh, {});

    describe("what reaches the worker", () => {
        it("should send the iso curve counts only when the iso curves are drawn", async () => {
            // Arrange
            const shape = occtShape(1);

            // Act
            await drawHelper.drawShape({ shape, isoCurvesU: 7, isoCurvesV: 3 });
            await drawHelper.drawShape({ shape, drawIsoCurves: true, isoCurvesU: 7 });

            // Assert
            expect(occtWorkerCall.mock.calls.map(([, inputs]) => [inputs.isoCurvesU, inputs.isoCurvesV])).toEqual([[0, 0], [7, 5]]);
        });

        it("should send a surface analysis with its pull only for faces that are drawn", async () => {
            // Arrange
            const shape = occtShape(1);
            const gaussian = Inputs.OCCT.surfaceAnalysisEnum.gaussian;

            // Act
            await drawHelper.drawShape({ shape, surfaceAnalysis: gaussian });
            await drawHelper.drawShape({ shape, surfaceAnalysis: gaussian, drawFaces: false });

            // Assert
            expect(occtWorkerCall.mock.calls.map(([, inputs]) => [inputs.surfaceAnalysis, inputs.draftDirection])).toEqual([
                [gaussian, [0, 1, 0]],
                [Inputs.OCCT.surfaceAnalysisEnum.none, [0, 1, 0]],
            ]);
        });

        it("should send the counts and the analysis for a list of shapes the same way, without the face material", async () => {
            // Arrange
            occtWorkerCall.mockResolvedValue([meshOf([triangle(0)])]);
            const faceMaterial = new BABYLON.PBRMetallicRoughnessMaterial("material");

            // Act
            await drawHelper.drawShapes({ shapes: [occtShape(1)], drawIsoCurves: true, isoCurvesV: 2, surfaceAnalysis: Inputs.OCCT.surfaceAnalysisEnum.mean, faceMaterial });

            // Assert
            const [name, inputs] = occtWorkerCall.mock.calls[0]!;
            expect(name).toBe("shapesToMeshes");
            expect([inputs.isoCurvesU, inputs.isoCurvesV, inputs.surfaceAnalysis]).toEqual([5, 2, Inputs.OCCT.surfaceAnalysisEnum.mean]);
            expect("faceMaterial" in inputs).toBe(false);
        });
    });

    describe("iso curves", () => {
        it("should draw the iso curves as one line at the edge width and opacity, in their own color", async () => {
            // Act
            const drawn = await draw(meshOf([], ISO_CURVES), { drawIsoCurves: true, edgeWidth: 3, edgeOpacity: 0.5, isoCurvesColour: "#336699" });

            // Assert
            const [line] = greasedLines(drawn);
            expect(greasedLines(drawn)).toHaveLength(1);
            expect(line!._points).toEqual([[0, 0, 0, 1, 0, 0], [0, 1, 0, 0.5, 1, 0, 1, 1, 0]]);
            expect(line!._materialOptions.width).toBe(0.03);
            expect(line!._materialOptions.color!.toHexString()).toBe("#336699");
            expect(line!.material!.alpha).toBe(0.5);
        });

        it("should leave the iso curves out when they are not drawn, whatever the mesh carries", async () => {
            // Act
            const drawn = await draw(meshOf([], ISO_CURVES), { drawIsoCurves: false });

            // Assert
            expect(greasedLines(drawn)).toHaveLength(0);
        });

        it("should push the faces behind the iso curves as it does behind edges", async () => {
            // Act
            const withCurves = await draw(meshOf([triangle(0)], ISO_CURVES), { drawIsoCurves: true, faceColour: "#00ff00" });
            const without = await draw(meshOf([triangle(0)], ISO_CURVES), { drawIsoCurves: false, faceColour: "#00ff00" });

            // Assert
            expect(materialOf(frontFaces(withCurves)[0]!).zOffset).toBe(2);
            expect(materialOf(frontFaces(without)[0]!).zOffset).toBe(0);
        });
    });

    describe("surface analysis", () => {
        it("should color each vertex through the ramp, from the lowest value found to the highest", async () => {
            // Act
            const drawn = await draw(meshOf([triangle(0, [0, 2, 4])]), {});

            // Assert
            expect([...vertexColors(frontFaces(drawn)[0]!).values()]).toEqual([BLUE, GREEN, RED]);
        });

        it("should color the faces over analysisMin and analysisMax where they are given", async () => {
            // Act
            const drawn = await draw(meshOf([triangle(0, [0, 5, 10])]), { analysisMin: 0, analysisMax: 20 });

            // Assert
            expect([...vertexColors(frontFaces(drawn)[0]!).values()]).toEqual([BLUE, CYAN, GREEN]);
        });

        it("should keep the face color, in linear light, for a vertex without a value and for a face without values", async () => {
            // Act
            const drawn = await draw(meshOf([triangle(0, [0, NaN, 4]), triangle(1)]), { faceColour: "#808080" });

            // Assert
            const colors = vertexColors(frontFaces(drawn)[0]!);
            expect([0, 1, 2].map(vertex => colors.get(triangle(0).vertexCoord.slice(3 * vertex, 3 * vertex + 3).join(",")))).toEqual([BLUE, GREY, RED]);
            expect([0, 1, 2].map(vertex => colors.get(triangle(1).vertexCoord.slice(3 * vertex, 3 * vertex + 3).join(",")))).toEqual([GREY, GREY, GREY]);
        });

        it("should draw the analyzed faces with a white material of their own instead of the face color or material", async () => {
            // Arrange
            const faceMaterial = new BABYLON.PBRMetallicRoughnessMaterial("given");

            // Act
            const analyzed = await drawHelper.handleDecomposedMesh({ drawEdges: false, drawTwoSided: false, faceColour: "#ff0000" }, meshOf([triangle(0, [1, 2, 3])]), { faceMaterial });
            const plain = await drawHelper.handleDecomposedMesh({ drawEdges: false, drawTwoSided: false, faceColour: "#ff0000" }, meshOf([triangle(0)]), {});

            // Assert
            expect(materialOf(frontFaces(analyzed)[0]!).baseColor.toHexString()).toBe("#ffffff");
            expect(materialOf(frontFaces(analyzed)[0]!)).not.toBe(faceMaterial);
            expect(materialOf(frontFaces(plain)[0]!).baseColor.toHexString()).toBe("#ff0000");
            expect(frontFaces(plain)[0]!._vertexData!.colors).toBeNull();
        });

        it("should leave the back faces in the back face color", async () => {
            // Act
            const drawn = await drawHelper.handleDecomposedMesh({ drawEdges: false, drawTwoSided: true, backFaceColour: "#0000ff" }, meshOf([triangle(0, [1, 2, 3])]), {});

            // Assert
            const back = surfaces(drawn).filter(child => child.name.includes("backFace"));
            expect(back).toHaveLength(1);
            expect(back[0]!._vertexData!.colors).toBeNull();
        });

        it("should color the faces of every shape of a list over one range", async () => {
            // Arrange
            occtWorkerCall.mockResolvedValue([meshOf([triangle(0, [0, 0, 0])]), meshOf([triangle(1, [10, 10, 10])])]);

            // Act
            const drawn = await drawHelper.drawShapes({ shapes: [occtShape(1), occtShape(2)], drawEdges: false, drawTwoSided: false, surfaceAnalysis: Inputs.OCCT.surfaceAnalysisEnum.gaussian });

            // Assert
            const faces = instanceOf(drawn, MockMesh).children.map(shape => frontFaces(instanceOf(shape, BABYLON.Mesh))[0]!);
            expect(faces.map(face => [...vertexColors(face).values()])).toEqual([[BLUE, BLUE, BLUE], [RED, RED, RED]]);
        });
    });

    describe("drawing each face on its own", () => {
        it("should color each face through the ramp and draw the iso curves as one line", async () => {
            // Act
            const drawn = await drawHelper.handleDecomposedMeshIndividually({ drawEdges: false, drawTwoSided: false, drawIsoCurves: true, isoCurvesColour: "#808080" }, meshOf([triangle(0, [0, 1, 2]), triangle(1, [2, 3, 4])], ISO_CURVES), {});

            // Assert
            const faces = frontFaces(drawn);
            expect(faces.map(face => face.name)).toEqual(["face 0", "face 1"]);
            expect(faces.map(face => [...vertexColors(face).values()])).toEqual([[BLUE, CYAN, GREEN], [GREEN, YELLOW, RED]]);
            expect(greasedLines(drawn).map(line => line.name)).toEqual(["iso curves"]);
            expect(materialOf(faces[0]!).zOffset).toBe(2);
        });
    });
});
