import { describe, it, expect, beforeEach, afterEach, vi, type Mock } from "vitest";
import { createDrawHelperMocks, flatOf } from "./__mocks__/test-helpers";
import { DrawHelper } from "./draw-helper";
import * as Inputs from "./inputs";
import * as THREEJS from "three";
import { LineSegments2 } from "three/examples/jsm/lines/LineSegments2.js";

type Point3 = Inputs.Base.Point3;

const BLUE = [0, 0, 1];
const CYAN = [0, 1, 1];
const GREEN = [0, 1, 0];
const YELLOW = [1, 1, 0];
const RED = [1, 0, 0];
const GREY = [0.215861, 0.215861, 0.215861];

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

    const meshes = (drawn: THREEJS.Object3D): THREEJS.Mesh[] => {
        const found: THREEJS.Mesh[] = [];
        drawn.traverse(child => {
            if (child instanceof THREEJS.Mesh && !(child instanceof LineSegments2)) {
                found.push(child);
            }
        });
        return found;
    };
    const frontFaces = (drawn: THREEJS.Object3D): THREEJS.Mesh[] => meshes(drawn).filter(mesh => !mesh.name.includes("backFace"));
    const lines = (drawn: THREEJS.Object3D): LineSegments2[] => drawn.children.filter((child): child is LineSegments2 => child instanceof LineSegments2);
    const materialOf = (mesh: THREEJS.Mesh): THREEJS.MeshPhysicalMaterial => {
        expect(mesh.material).toBeInstanceOf(THREEJS.MeshPhysicalMaterial);
        return mesh.material as THREEJS.MeshPhysicalMaterial;
    };
    const rounded = (values: number[]): number[] => values.map(value => Number(value.toFixed(6)));

    const vertexColors = (mesh: THREEJS.Mesh): Map<string, number[]> => {
        const positions = flatOf(mesh.geometry.getAttribute("position"));
        const colors = flatOf(mesh.geometry.getAttribute("color"));
        const byPosition = new Map<string, number[]>();
        for (let vertex = 0; vertex < positions.length / 3; vertex++) {
            byPosition.set(positions.slice(3 * vertex, 3 * vertex + 3).join(","), rounded(colors.slice(3 * vertex, 3 * vertex + 3)));
        }
        return byPosition;
    };

    const draw = (mesh: Inputs.OCCT.DecomposedMeshDto, options: Partial<Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>>): Promise<THREEJS.Group> =>
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
            const faceMaterial = new THREEJS.MeshPhysicalMaterial();

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
        it("should draw the iso curves as one line at the edge width, in their own color", async () => {
            // Act
            const drawn = await draw(meshOf([], ISO_CURVES), { drawIsoCurves: true, edgeWidth: 6, isoCurvesColour: "#00ff00" });

            // Assert
            const [line] = lines(drawn);
            expect(lines(drawn)).toHaveLength(1);
            expect(line!.name).toContain("isoCurves");
            expect(flatOf(line!.geometry.getAttribute("instanceStart"))).toEqual([0, 0, 0, 1, 0, 0, 0, 1, 0, 0.5, 1, 0, 0.5, 1, 0, 1, 1, 0]);
            expect(flatOf(line!.geometry.getAttribute("instanceColorStart"))).toEqual([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0]);
            expect(line!.material.linewidth).toBe(2);
        });

        it("should leave the iso curves out when they are not drawn, whatever the mesh carries", async () => {
            // Act
            const drawn = await draw(meshOf([], ISO_CURVES), { drawIsoCurves: false });

            // Assert
            expect(lines(drawn)).toHaveLength(0);
        });

        it("should push the faces behind the iso curves as it does behind edges", async () => {
            // Act
            const withCurves = await draw(meshOf([triangle(0)], ISO_CURVES), { drawIsoCurves: true, faceColour: "#00ff00" });
            const without = await draw(meshOf([triangle(0)], ISO_CURVES), { drawIsoCurves: false, faceColour: "#00ff00" });

            // Assert
            expect(materialOf(frontFaces(withCurves)[0]!).polygonOffsetFactor).toBe(2);
            expect(materialOf(frontFaces(without)[0]!).polygonOffsetFactor).toBe(0);
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
            expect([...vertexColors(frontFaces(drawn)[0]!).values()]).toEqual([BLUE, GREY, RED, GREY, GREY, GREY]);
        });

        it("should draw the analyzed faces with a white material reading vertex colors, instead of the face color or material", async () => {
            // Arrange
            const faceMaterial = new THREEJS.MeshPhysicalMaterial();

            // Act
            const analyzed = await drawHelper.handleDecomposedMesh({ drawEdges: false, drawTwoSided: false, faceColour: "#ff0000", faceMaterial }, meshOf([triangle(0, [1, 2, 3])]), {});
            const plain = await drawHelper.handleDecomposedMesh({ drawEdges: false, drawTwoSided: false, faceColour: "#ff0000" }, meshOf([triangle(0)]), {});

            // Assert
            const analyzedMaterial = materialOf(frontFaces(analyzed)[0]!);
            expect(analyzedMaterial).not.toBe(faceMaterial);
            expect([analyzedMaterial.vertexColors, analyzedMaterial.color.getHexString()]).toEqual([true, "ffffff"]);
            expect([materialOf(frontFaces(plain)[0]!).vertexColors, materialOf(frontFaces(plain)[0]!).color.getHexString()]).toEqual([false, "ff0000"]);
            expect(frontFaces(plain)[0]!.geometry.getAttribute("color")).toBeUndefined();
        });

        it("should leave the back faces in the back face color", async () => {
            // Act
            const drawn = await drawHelper.handleDecomposedMesh({ drawEdges: false, drawTwoSided: true }, meshOf([triangle(0, [1, 2, 3])]), {});

            // Assert
            const back = meshes(drawn).filter(mesh => mesh.name.includes("backFace"));
            expect(back).toHaveLength(1);
            expect(back[0]!.geometry.getAttribute("color")).toBeUndefined();
        });

        it("should color the faces of every shape of a list over one range", async () => {
            // Arrange
            occtWorkerCall.mockResolvedValue([meshOf([triangle(0, [0, 0, 0])]), meshOf([triangle(1, [10, 10, 10])])]);

            // Act
            const drawn = await drawHelper.drawShapes({ shapes: [occtShape(1), occtShape(2)], drawEdges: false, drawTwoSided: false, surfaceAnalysis: Inputs.OCCT.surfaceAnalysisEnum.gaussian });

            // Assert
            expect(drawn.children.map(shape => [...vertexColors(frontFaces(shape)[0]!).values()])).toEqual([[BLUE, BLUE, BLUE], [RED, RED, RED]]);
        });
    });

    describe("drawing each face on its own", () => {
        it("should color each face through the ramp and draw the iso curves as one line", async () => {
            // Act
            const drawn = await drawHelper.handleDecomposedMeshIndividually({ drawEdges: false, drawTwoSided: false, drawIsoCurves: true }, meshOf([triangle(0, [0, 1, 2]), triangle(1, [2, 3, 4])], ISO_CURVES), {});

            // Assert
            const faces = frontFaces(drawn);
            expect(faces.map(face => [...vertexColors(face).values()])).toEqual([[BLUE, CYAN, GREEN], [GREEN, YELLOW, RED]]);
            expect(lines(drawn).map(line => line.name)).toEqual(["iso curves"]);
            expect(materialOf(faces[0]!).polygonOffsetFactor).toBe(2);
        });
    });
});
