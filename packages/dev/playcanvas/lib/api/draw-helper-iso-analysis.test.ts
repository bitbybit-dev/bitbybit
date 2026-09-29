import { describe, it, expect, beforeEach, afterEach, vi, type Mock, type MockInstance } from "vitest";
vi.mock("playcanvas", async () => {
    const { createPlayCanvasMock } = await vi.importActual<typeof import("./__mocks__/playcanvas.mock")>("./__mocks__/playcanvas.mock");
    return await createPlayCanvasMock();
});

import { createDrawHelperMocks } from "./__mocks__/test-helpers";
import { DrawHelper } from "./draw-helper";
import * as Inputs from "./inputs";
import * as pc from "playcanvas";

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
    let setColors: MockInstance<pc.Mesh["setColors"]>;
    let setColors32: MockInstance<pc.Mesh["setColors32"]>;
    let setPositions: MockInstance<pc.Mesh["setPositions"]>;

    beforeEach(() => {
        const mocks = createDrawHelperMocks();
        occtWorkerCall = mocks.occtWorkerCall;
        drawHelper = new DrawHelper(mocks.mockContext, mocks.mockSolidText, mocks.mockVector, mocks.mockJscadWorkerManager, mocks.mockManifoldWorkerManager, mocks.mockOccWorkerManager);
        setColors = vi.spyOn(pc.Mesh.prototype, "setColors");
        setColors32 = vi.spyOn(pc.Mesh.prototype, "setColors32");
        setPositions = vi.spyOn(pc.Mesh.prototype, "setPositions");
    });

    afterEach(() => {
        drawHelper.dispose();
        vi.restoreAllMocks();
        vi.clearAllMocks();
    });

    const rendered = (entity: pc.GraphNode): pc.Entity[] => {
        const found: pc.Entity[] = [];
        const walk = (node: pc.GraphNode): void => {
            const withRender = node as pc.Entity;
            if (withRender.render && withRender.render.meshInstances.length > 0) {
                found.push(withRender);
            }
            node.children.forEach(walk);
        };
        walk(entity);
        return found;
    };
    const meshOfEntity = (entity: pc.Entity): pc.Mesh => entity.render!.meshInstances[0]!.mesh;
    const materialOf = (entity: pc.Entity): pc.StandardMaterial => entity.render!.meshInstances[0]!.material as pc.StandardMaterial;
    const frontFaces = (drawn: pc.Entity): pc.Entity[] => rendered(drawn).filter(entity => entity.name.includes("surfaceChild") && !entity.name.includes("backFace"));
    const valuesFor = (spy: { mock: { calls: unknown[][]; contexts: unknown[] } }, mesh: pc.Mesh): number[] | undefined => {
        const call = spy.mock.contexts.indexOf(mesh);
        return call === -1 ? undefined : Array.from(spy.mock.calls[call]![0] as ArrayLike<number>);
    };
    const colorsOf = (entity: pc.Entity): number[][] | undefined => {
        const colors = valuesFor(setColors, meshOfEntity(entity));
        return colors === undefined ? undefined : Array.from({ length: colors.length / 4 }, (_, vertex) => colors.slice(4 * vertex, 4 * vertex + 4).map(value => Number(value.toFixed(7))));
    };

    const draw = (mesh: Inputs.OCCT.DecomposedMeshDto, options: Partial<Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>>): Promise<pc.Entity> =>
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
            const faceMaterial = new pc.StandardMaterial();

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
        it("should draw the iso curves as one line, segment by segment, in their own color", async () => {
            // Act
            const drawn = await draw(meshOf([], ISO_CURVES), { drawIsoCurves: true, isoCurvesColour: "#00ff00" });

            // Assert
            const [line] = rendered(drawn);
            expect(rendered(drawn)).toHaveLength(1);
            expect(line!.name).toContain("isoCurves");
            expect(valuesFor(setPositions, meshOfEntity(line!))).toEqual([0, 0, 0, 1, 0, 0, 0, 1, 0, 0.5, 1, 0, 0.5, 1, 0, 1, 1, 0]);
            expect(valuesFor(setColors32, meshOfEntity(line!))).toEqual(Array.from({ length: 6 }, () => [0, 255, 0, 255]).flat());
        });

        it("should leave the iso curves out when they are not drawn, whatever the mesh carries", async () => {
            // Act
            const drawn = await draw(meshOf([], ISO_CURVES), { drawIsoCurves: false });

            // Assert
            expect(rendered(drawn)).toHaveLength(0);
        });

        it("should push the faces behind the iso curves as it does behind edges", async () => {
            // Act
            const withCurves = await draw(meshOf([triangle(0)], ISO_CURVES), { drawIsoCurves: true, faceColour: "#00ff00" });
            const without = await draw(meshOf([triangle(0)], ISO_CURVES), { drawIsoCurves: false, faceColour: "#00ff00" });

            // Assert
            expect([materialOf(frontFaces(withCurves)[0]!).depthBias, materialOf(frontFaces(withCurves)[0]!).slopeDepthBias]).toEqual([2, 2]);
            expect([materialOf(frontFaces(without)[0]!).depthBias, materialOf(frontFaces(without)[0]!).slopeDepthBias]).toEqual([0, 0]);
        });
    });

    describe("surface analysis", () => {
        it("should color each vertex through the ramp, from the lowest value found to the highest", async () => {
            // Act
            const drawn = await draw(meshOf([triangle(0, [0, 2, 4])]), {});

            // Assert
            expect(colorsOf(frontFaces(drawn)[0]!)).toEqual([BLUE, GREEN, RED]);
        });

        it("should color the faces over analysisMin and analysisMax where they are given", async () => {
            // Act
            const drawn = await draw(meshOf([triangle(0, [0, 5, 10])]), { analysisMin: 0, analysisMax: 20 });

            // Assert
            expect(colorsOf(frontFaces(drawn)[0]!)).toEqual([BLUE, CYAN, GREEN]);
        });

        it("should keep the face color, in linear light, for a vertex without a value and for a face without values", async () => {
            // Act
            const drawn = await draw(meshOf([triangle(0, [0, NaN, 4]), triangle(1)]), { faceColour: "#808080" });

            // Assert
            expect(colorsOf(frontFaces(drawn)[0]!)).toEqual([BLUE, GREY, RED, GREY, GREY, GREY]);
        });

        it("should draw the analyzed faces with a white material reading vertex colors, instead of the face color or material", async () => {
            // Arrange
            const faceMaterial = new pc.StandardMaterial();

            // Act
            const analyzed = await drawHelper.handleDecomposedMesh({ drawEdges: false, drawTwoSided: false, faceColour: "#ff0000" }, meshOf([triangle(0, [1, 2, 3])]), { faceMaterial });
            const plain = await drawHelper.handleDecomposedMesh({ drawEdges: false, drawTwoSided: false, faceColour: "#ff0000" }, meshOf([triangle(0)]), {});

            // Assert
            const analyzedMaterial = materialOf(frontFaces(analyzed)[0]!);
            const plainMaterial = materialOf(frontFaces(plain)[0]!);
            expect(analyzedMaterial).not.toBe(faceMaterial);
            expect([analyzedMaterial.diffuseVertexColor, analyzedMaterial.diffuse.r, analyzedMaterial.diffuse.g, analyzedMaterial.diffuse.b]).toEqual([true, 1, 1, 1]);
            expect([plainMaterial.diffuseVertexColor, plainMaterial.diffuse.r, plainMaterial.diffuse.g, plainMaterial.diffuse.b]).toEqual([false, 1, 0, 0]);
            expect(colorsOf(frontFaces(plain)[0]!)).toBeUndefined();
        });

        it("should leave the back faces in the back face color", async () => {
            // Act
            const drawn = await drawHelper.handleDecomposedMesh({ drawEdges: false, drawTwoSided: true }, meshOf([triangle(0, [1, 2, 3])]), {});

            // Assert
            const back = rendered(drawn).filter(entity => entity.name.includes("backFace"));
            expect(back).toHaveLength(1);
            expect(colorsOf(back[0]!)).toBeUndefined();
        });

        it("should color the faces of every shape of a list over one range", async () => {
            // Arrange
            occtWorkerCall.mockResolvedValue([meshOf([triangle(0, [0, 0, 0])]), meshOf([triangle(1, [10, 10, 10])])]);

            // Act
            const drawn = await drawHelper.drawShapes({ shapes: [occtShape(1), occtShape(2)], drawEdges: false, drawTwoSided: false, surfaceAnalysis: Inputs.OCCT.surfaceAnalysisEnum.gaussian });

            // Assert
            expect(drawn.children.map(shape => colorsOf(frontFaces(shape as pc.Entity)[0]!))).toEqual([[BLUE, BLUE, BLUE], [RED, RED, RED]]);
        });
    });

    describe("drawing each face on its own", () => {
        it("should color each face through the ramp and draw the iso curves as one line", async () => {
            // Act
            const drawn = await drawHelper.handleDecomposedMeshIndividually({ drawEdges: false, drawTwoSided: false, drawIsoCurves: true }, meshOf([triangle(0, [0, 1, 2]), triangle(1, [2, 3, 4])], ISO_CURVES), {});

            // Assert
            const faces = frontFaces(drawn);
            expect(faces.map(colorsOf)).toEqual([[BLUE, CYAN, GREEN], [GREEN, YELLOW, RED]]);
            expect(drawn.children.map(child => child.name)).toEqual(["face 0", "face 1", "iso curves"]);
            expect(materialOf(faces[0]!).depthBias).toBe(2);
        });
    });
});
