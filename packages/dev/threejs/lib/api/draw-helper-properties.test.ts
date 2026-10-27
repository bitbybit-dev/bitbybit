import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fc from "fast-check";
import * as THREEJS from "three";
import { LineSegments2 } from "three/examples/jsm/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/examples/jsm/lines/LineSegmentsGeometry.js";
import type { KeptDesignMesh } from "@bitbybit-dev/core";
import type * as Models from "@bitbybit-dev/core/lib/api/models";
import { GeometryHelper, MathBitByBit, Vector, resolveDto } from "@bitbybit-dev/base";
import { computeVertexNormals } from "@bitbybit-dev/base/lib/api/services/helpers/mesh/mesh-normals";
import type { JSCADText } from "@bitbybit-dev/jscad-worker";
import { createMockWorkerManagers, flatOf, partialMock, type MockWorkerManagers } from "./__mocks__/test-helpers";
import { meshBuffersOf } from "./__mocks__/mesh-buffers";
import { Context } from "./context";
import { DrawHelper } from "./draw-helper";
import * as Inputs from "./inputs";
import type * as Resolved from "./resolved-inputs";

type Build = Models.OCCT.DesignBuildResult<Inputs.OCCT.TopoDSShapePointer>;

interface FaceSpec {
    vertexCount: number;
    positions: number[];
    normals: number[] | undefined;
    triangles: number[];
    uvs: number[] | undefined;
    analysis: number[] | undefined;
}

interface DrawnNumbers {
    positions: number[];
    normals: number[];
    indices: number[];
    uvs: number[] | null;
    colors: number[] | null;
}

interface PartPoses {
    worlds: Inputs.Base.TransformMatrix[][];
}

const SEED = 20261023;
const HUGE_TIME_BUDGET_MS = 8000;
const HUGE_TEST_TIMEOUT_MS = 60_000;
const IDENTITY: Inputs.Base.TransformMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const MOVE_5: Inputs.Base.TransformMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 5, 0, 0, 1];
const MIRROR_X_THEN_MOVE_5: Inputs.JSCAD.JSCADMat4 = [-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 5, 0, 0, 1];

const exactCoordinate = fc.integer({ min: -256, max: 256 }).map(value => value / 8);
const analysisValue = fc.oneof({ weight: 6, arbitrary: exactCoordinate }, { weight: 1, arbitrary: fc.constantFrom(NaN, Infinity, -Infinity) });

const faceSpecOf = (analysed: boolean): fc.Arbitrary<FaceSpec> => fc.integer({ min: 3, max: 7 }).chain(vertexCount => fc.record({
    vertexCount: fc.constant(vertexCount),
    positions: fc.array(exactCoordinate, { minLength: vertexCount * 3, maxLength: vertexCount * 3 }),
    normals: fc.option(fc.array(exactCoordinate, { minLength: vertexCount * 3, maxLength: vertexCount * 3 }), { nil: undefined, freq: 4 }),
    triangles: fc.array(fc.tuple(fc.nat(vertexCount - 1), fc.nat(vertexCount - 1), fc.nat(vertexCount - 1)), { minLength: 1, maxLength: 4 }).map(triangles => triangles.flat()),
    uvs: fc.option(fc.array(exactCoordinate, { minLength: vertexCount * 2, maxLength: vertexCount * 2 }), { nil: undefined }),
    analysis: analysed ? fc.option(fc.array(analysisValue, { minLength: vertexCount, maxLength: vertexCount }), { nil: undefined }) : fc.constant(undefined),
}));

const meshSpecOf = fc.boolean().chain(analysed => fc.array(faceSpecOf(analysed), { minLength: 1, maxLength: 5 }));

const pointsOf = (flat: readonly number[]): Inputs.Base.Point3[] => Array.from({ length: flat.length / 3 }, (_, at): Inputs.Base.Point3 => [flat[at * 3]!, flat[at * 3 + 1]!, flat[at * 3 + 2]!]);

const listsOf = (specs: readonly FaceSpec[], isoCurveList?: Inputs.Base.Point3[][]): Inputs.OCCT.DecomposedMeshDto => ({
    faceList: specs.map((spec, faceIndex) => ({
        faceIndex,
        vertexCoord: spec.positions,
        vertexCoordVec: pointsOf(spec.positions),
        normalCoord: spec.normals ?? [],
        triIndexes: spec.triangles,
        numberOfTriangles: spec.triangles.length / 3,
        centerPoint: [faceIndex, 0, 0],
        centerNormal: [0, 0, 1],
        uvs: spec.uvs ?? [],
        ...(spec.analysis === undefined ? {} : { analysisValues: spec.analysis }),
    })),
    edgeList: [],
    pointsList: [],
    ...(isoCurveList === undefined ? {} : { isoCurveList }),
});

const plain = (values: ArrayLike<number> | null | undefined): number[] | null => values === null || values === undefined ? null : Array.from(values, value => value + 0);

const singles = (values: readonly number[]): number[] => values.map(value => Math.fround(value) + 0);

const joinedOf = (specs: readonly FaceSpec[], reverseWinding: boolean, normalSign: number): Omit<DrawnNumbers, "colors"> => {
    const positions: number[] = [];
    const normals: number[] = [];
    const indices: number[] = [];
    const uvs: number[] = [];
    for (const spec of specs) {
        const offset = positions.length / 3;
        positions.push(...spec.positions);
        normals.push(...(spec.normals ?? computeVertexNormals(spec.positions, spec.triangles)).map(value => Math.fround(normalSign * value) + 0));
        for (let at = 0; at < spec.triangles.length; at += 3) {
            const [a, b, c] = [spec.triangles[at]!, spec.triangles[at + 1]!, spec.triangles[at + 2]!];
            indices.push(...(reverseWinding ? [a, c, b] : [a, b, c]).map(index => index + offset));
        }
        uvs.push(...(spec.uvs ?? new Array<number>(spec.vertexCount * 2).fill(0)));
    }
    return { positions, normals, indices, uvs: specs.some(spec => spec.uvs !== undefined) ? uvs : null };
};

const segmentsOf = (polylines: readonly (readonly (readonly number[])[])[]): number[] => singles(polylines.flatMap(points => points.slice(1).flatMap((point, at) => [...points[at]!, ...point])));

const translation = fc.tuple(fc.integer({ min: -50, max: 50 }), fc.integer({ min: -50, max: 50 }), fc.integer({ min: -50, max: 50 })).map(([x, y, z]): Inputs.Base.TransformMatrix => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]);

const posesOf = fc.array(fc.integer({ min: 1, max: 120 }), { minLength: 1, maxLength: 3 }).chain(counts => fc.record({
    first: fc.tuple(...counts.map(count => fc.array(translation, { minLength: count, maxLength: count }))),
    second: fc.tuple(...counts.map(count => fc.array(translation, { minLength: count, maxLength: count }))),
})).map(({ first, second }): { first: PartPoses; second: PartPoses } => ({ first: { worlds: first }, second: { worlds: second } }));

const square = (faceIndex: number, size: number): Inputs.OCCT.DecomposedFaceDto => ({
    faceIndex,
    vertexCoord: [0, 0, faceIndex, size, 0, faceIndex, size, size, faceIndex, 0, size, faceIndex],
    vertexCoordVec: [[0, 0, faceIndex], [size, 0, faceIndex], [size, size, faceIndex], [0, size, faceIndex]],
    normalCoord: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
    triIndexes: [0, 1, 2, 0, 2, 3],
    numberOfTriangles: 2,
    centerPoint: [size / 2, size / 2, faceIndex],
    centerNormal: [0, 0, 1],
    uvs: [],
});

const partMeshOf = (faces: number, size: number): Inputs.OCCT.DecomposedMeshDto => ({
    faceList: Array.from({ length: faces }, (_, faceIndex) => square(faceIndex, size)),
    edgeList: [{ edgeIndex: 0, vertexCoord: [[0, 0, 0], [size, 0, 0]], middlePoint: [size / 2, 0, 0] }, { edgeIndex: 1, vertexCoord: [[size, 0, 0], [size, size, 0]], middlePoint: [size, size / 2, 0] }],
    pointsList: [],
});

const partOf = (id: string, hash: number, shapeHash = `${id}-shape`): Models.OCCT.DesignBuiltPart<Inputs.OCCT.TopoDSShapePointer> => ({
    id,
    itemKey: `${id}-item`,
    buildKey: `${id}-build`,
    name: id,
    body: id,
    shape: { hash, type: "occ-shape" },
    shapeHash,
    faceNames: [],
    properties: {},
    connectors: [],
    parameters: {},
});

const pathOf = (part: number, index: number): string => `part-${part}/${index}`;

const buildOf = (poses: PartPoses): Build => ({
    parts: poses.worlds.map((_, at) => partOf(`part-${at}`, at)),
    report: [],
    issues: [],
    parameters: {},
    units: { length: "mm", angle: "deg" },
    up: "y",
    components: poses.worlds.flatMap((worlds, at) => worlds.map((world, index): Models.OCCT.DesignBuiltComponent => ({ path: pathOf(at, index), name: `${at}-${index}`, part: `part-${at}`, matrix: world, world, properties: {} }))),
});

const worldsByPath = (poses: PartPoses): Map<string, number[]> => new Map(poses.worlds.flatMap((worlds, at) => worlds.map((world, index): [string, number[]] => [pathOf(at, index), world])));

const separateTrianglesBuffers = (pointCount: number): Inputs.OCCT.DecomposedMeshBuffersDto => {
    const lead = 3;
    const positions = new Float32Array(pointCount * 3 + lead).fill(-7);
    const normals = new Float32Array(pointCount * 3 + lead).fill(-7);
    const triangles = new Uint32Array(pointCount + lead).fill(7);
    for (let triangle = 0; triangle * 3 < pointCount; triangle++) {
        const x = triangle % 1000;
        const y = Math.floor(triangle / 1000);
        positions.set([x, y, 0, x + 1, y, 0, x, y + 1, 0], lead + triangle * 9);
        normals.set([0, 0, 1, 0, 0, 1, 0, 0, 1], lead + triangle * 9);
        triangles.set([triangle * 3, triangle * 3 + 1, triangle * 3 + 2], lead + triangle * 3);
    }
    return {
        faceList: [{
            faceIndex: 0,
            vertexCoord: positions.subarray(lead),
            normalCoord: normals.subarray(lead),
            triIndexes: triangles.subarray(lead),
            numberOfTriangles: pointCount / 3,
            uvs: new Float32Array(0),
            centerPoint: null,
            centerNormal: null,
        }],
        edgeList: [],
        pointsList: [],
    };
};

const occtOptions = (extra: Partial<Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>> = {}): Resolved.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer> =>
    resolveDto(Inputs.OCCT.DrawShapeDto, { faceColour: "#ff0000", drawEdges: false, drawTwoSided: true, ...extra }) as Resolved.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>;

describe("what three.js draws, pushed to the edges of real-world use", () => {
    let scene: THREEJS.Scene;
    let context: Context;
    let workers: MockWorkerManagers;
    let drawHelper: DrawHelper;

    const newHelper = (): DrawHelper => new DrawHelper(context, partialMock<JSCADText>({ createVectorText: vi.fn().mockResolvedValue([[[0, 0], [1, 0]]]) }), new Vector(new MathBitByBit(), new GeometryHelper()), workers.mockJscadWorkerManager, workers.mockManifoldWorkerManager, workers.mockOccWorkerManager);

    beforeEach(() => {
        scene = new THREEJS.Scene();
        context = new Context();
        context.scene = scene;
        workers = createMockWorkerManagers();
        drawHelper = newHelper();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    const meshesIn = (root: THREEJS.Object3D): THREEJS.Mesh[] => {
        const found: THREEJS.Mesh[] = [];
        root.traverse(node => {
            if (node instanceof THREEJS.Mesh && !(node instanceof LineSegments2) && !(node instanceof THREEJS.BatchedMesh)) {
                found.push(node);
            }
        });
        return found;
    };
    const backsOf = (root: THREEJS.Object3D): THREEJS.Mesh[] => meshesIn(root).filter(mesh => mesh.name.includes("backFace"));
    const frontsOf = (root: THREEJS.Object3D): THREEJS.Mesh[] => meshesIn(root).filter(mesh => !mesh.name.includes("backFace"));
    const linesIn = (root: THREEJS.Object3D): LineSegments2[] => {
        const found: LineSegments2[] = [];
        root.traverse(node => {
            if (node instanceof LineSegments2) {
                found.push(node);
            }
        });
        return found;
    };
    const attributeOf = (geometry: THREEJS.BufferGeometry, name: string): number[] | null => geometry.hasAttribute(name) ? plain(geometry.getAttribute(name).array) : null;
    const numbersOf = (mesh: THREEJS.Mesh): DrawnNumbers => ({
        positions: attributeOf(mesh.geometry, "position")!,
        normals: attributeOf(mesh.geometry, "normal")!,
        indices: plain(mesh.geometry.getIndex()!.array)!,
        uvs: attributeOf(mesh.geometry, "uv"),
        colors: attributeOf(mesh.geometry, "color"),
    });
    const batchesOf = (group: THREEJS.Group): THREEJS.BatchedMesh[] => group.children.filter((child): child is THREEJS.BatchedMesh => child instanceof THREEJS.BatchedMesh);
    const designEdgesOf = (group: THREEJS.Group): LineSegments2[] => group.children.filter((child): child is LineSegments2 => child instanceof LineSegments2);
    const placedOf = (group: THREEJS.Group): Map<string, number[]> => {
        const placed = new Map<string, number[]>();
        for (const batch of batchesOf(group)) {
            (batch.userData["instancePaths"] as string[]).forEach((path, id) => placed.set(`${batch.name}:${path}`, batch.getMatrixAt(id, new THREEJS.Matrix4()).toArray()));
        }
        return placed;
    };
    const instancesMatch = (group: THREEJS.Group, poses: PartPoses): boolean => {
        const expected = worldsByPath(poses);
        return batchesOf(group).every(batch => (batch.userData["instancePaths"] as string[]).every((path, id) => JSON.stringify(batch.getMatrixAt(id, new THREEJS.Matrix4()).toArray()) === JSON.stringify(expected.get(path))));
    };
    const edgeMatricesMatch = (group: THREEJS.Group, poses: PartPoses): boolean => {
        const expected = worldsByPath(poses);
        return designEdgesOf(group).every(line => {
            const data = (line.material.uniforms["batchMatrices"]!.value as THREEJS.DataTexture).image.data as Float32Array;
            return (line.userData["paths"] as string[]).every((path, at) => JSON.stringify(Array.from(data.slice(at * 16, at * 16 + 16))) === JSON.stringify(expected.get(path)));
        });
    };
    const pickedFacesMatch = (group: THREEJS.Group): boolean => batchesOf(group).every(batch => {
        const index = batch.geometry.getIndex()!;
        const geometries = batch.userData["geometries"] as { part: string; indexStart: number; faceRanges: { face: number; start: number; count: number }[] }[];
        return geometries.every((geometry, geometryId) => {
            const vertexStart = batch.getGeometryRangeAt(geometryId)!.vertexStart;
            return geometry.faceRanges.every(range => {
                const picked = Array.from({ length: range.count }, (_, at) => index.getX(geometry.indexStart + range.start + at) - vertexStart);
                return JSON.stringify(picked) === JSON.stringify([0, 1, 2, 0, 2, 3].map(corner => corner + range.face * 4));
            });
        });
    });
    const worldPositionsOf = (mesh: THREEJS.Mesh): number[] => {
        mesh.updateWorldMatrix(true, false);
        return pointsOf(attributeOf(mesh.geometry, "position")!).flatMap(point => new THREEJS.Vector3(...point).applyMatrix4(mesh.matrixWorld).toArray().map(value => Math.round(value * 1e6) / 1e6 + 0));
    };

    describe("a kernel shape's faces, lists and buffers alike", () => {
        it("should draw the faces the worker hands over as buffers exactly as the same faces as lists, front and back, uvs, analysis colors and iso curves included", async () => {
            // Act & Assert
            await fc.assert(fc.asyncProperty(meshSpecOf, fc.array(fc.array(fc.tuple(exactCoordinate, exactCoordinate, exactCoordinate), { minLength: 2, maxLength: 4 }), { maxLength: 3 }), async (specs, isoCurves) => {
                const options = occtOptions({ drawIsoCurves: isoCurves.length > 0 });
                const lists = await drawHelper.handleDecomposedMesh(options, listsOf(specs, isoCurves), {});
                const buffers = await drawHelper.handleDecomposedMesh(options, meshBuffersOf(listsOf(specs, isoCurves)), {});
                expect(frontsOf(lists)).toHaveLength(1);
                expect(numbersOf(frontsOf(buffers)[0]!)).toEqual(numbersOf(frontsOf(lists)[0]!));
                expect(numbersOf(backsOf(buffers)[0]!)).toEqual(numbersOf(backsOf(lists)[0]!));
                expect(linesIn(buffers).map(line => flatOf(line.geometry.getAttribute("instanceStart")))).toEqual(linesIn(lists).map(line => flatOf(line.geometry.getAttribute("instanceStart"))));
                expect(linesIn(lists).map(line => plain(flatOf(line.geometry.getAttribute("instanceStart"))))).toEqual(isoCurves.length > 0 ? [segmentsOf(isoCurves)] : []);
                scene.remove(lists, buffers);
            }), { seed: SEED, numRuns: 150 });
        });

        it("should draw the front as the worker winds it and the back wound the other way once, with the normals turned round", async () => {
            // Act & Assert
            await fc.assert(fc.asyncProperty(meshSpecOf, async specs => {
                const options = occtOptions();
                const drawn = await drawHelper.handleDecomposedMesh(options, meshBuffersOf(listsOf(specs)), {});
                const { colors: _frontColors, ...front } = numbersOf(frontsOf(drawn)[0]!);
                const { colors: backColors, ...back } = numbersOf(backsOf(drawn)[0]!);
                expect(front).toEqual(joinedOf(specs, false, 1));
                expect(back).toEqual(joinedOf(specs, true, -1));
                expect(backColors).toBeNull();
                scene.remove(drawn);
            }), { seed: SEED + 1, numRuns: 150 });
        });
    });

    describe("huge kernel shapes", () => {
        it("should draw one face of two million points the worker hands over, front and back, without overflowing the stack and within the time budget", async () => {
            // Arrange
            const pointCount = 2_000_001;
            workers.occtWorkerCall.mockResolvedValue(separateTrianglesBuffers(pointCount));
            const started = performance.now();

            // Act
            const drawn = await drawHelper.drawShape({ shape: { hash: 1, type: "occ-shape" }, drawEdges: false, drawTwoSided: true });
            const elapsed = performance.now() - started;

            // Assert
            const [front, back] = [frontsOf(drawn)[0]!, backsOf(drawn)[0]!];
            expect([front.geometry.getAttribute("position").count, back.geometry.getAttribute("position").count]).toEqual([pointCount, pointCount]);
            expect(plain(front.geometry.getIndex()!.array.slice(-3))).toEqual([pointCount - 3, pointCount - 2, pointCount - 1]);
            expect(plain(back.geometry.getIndex()!.array.slice(-3))).toEqual([pointCount - 3, pointCount - 1, pointCount - 2]);
            expect(plain(back.geometry.getAttribute("normal").array.slice(-3))).toEqual([0, 0, -1]);
            expect(elapsed).toBeLessThan(HUGE_TIME_BUDGET_MS);
        }, HUGE_TEST_TIMEOUT_MS);

        it("should draw twenty thousand faces as one front mesh and one back mesh within the time budget", async () => {
            // Arrange
            const faceCount = 20_000;
            const lists: Inputs.OCCT.DecomposedMeshDto = { faceList: Array.from({ length: faceCount }, (_, faceIndex) => square(faceIndex, 1)), edgeList: [], pointsList: [] };
            workers.occtWorkerCall.mockResolvedValue(meshBuffersOf(lists, { withoutCenters: true }));
            const started = performance.now();

            // Act
            const drawn = await drawHelper.drawShape({ shape: { hash: 1, type: "occ-shape" }, drawEdges: false, drawTwoSided: true });
            const elapsed = performance.now() - started;

            // Assert
            expect(meshesIn(drawn)).toHaveLength(2);
            expect(frontsOf(drawn)[0]!.geometry.getAttribute("position").count).toBe(faceCount * 4);
            expect(plain(frontsOf(drawn)[0]!.geometry.getIndex()!.array.slice(-6))).toEqual([0, 1, 2, 0, 2, 3].map(index => index + (faceCount - 1) * 4));
            expect(elapsed).toBeLessThan(HUGE_TIME_BUDGET_MS);
        }, HUGE_TEST_TIMEOUT_MS);
    });

    describe("a JSCAD solid redrawn in place", () => {
        const triangle = { positions: [0, 0, 0, 1, 0, 0, 0, 1, 0], normals: [], indices: [0, 1, 2], transforms: MOVE_5 };
        const quad = { positions: [0, 0, 0, 2, 0, 0, 2, 2, 0, 0, 2, 0], normals: [], indices: [0, 1, 2, 0, 2, 3], transforms: MOVE_5 };
        const drawJscad = (sent: typeof triangle, previous?: THREEJS.Group): Promise<THREEJS.Group> => {
            workers.jscadWorkerCall.mockResolvedValueOnce(sent);
            return drawHelper.drawSolidOrPolygonMesh({ mesh: { polygons: [], transforms: MOVE_5 }, drawTwoSided: true, updatable: true, ...(previous ? { jscadMesh: previous } : {}) });
        };

        it("should keep the solid where its transform puts it however often it is redrawn, with buffers of other sizes and back again", async () => {
            // Arrange
            const first = await drawJscad(triangle);

            // Act
            await drawJscad(quad, first);
            const last = await drawJscad(triangle, first);

            // Assert
            expect(last).toBe(first);
            expect(last.position.toArray()).toEqual([5, 0, 0]);
            expect(worldPositionsOf(frontsOf(last)[0]!)).toEqual([5, 0, 0, 6, 0, 0, 5, 1, 0]);
            expect(backsOf(last)).toHaveLength(1);
        });

        it("should free the geometry it replaces when it redraws a solid in place", async () => {
            // Arrange
            const first = await drawJscad(triangle);
            const replaced = [frontsOf(first)[0]!.geometry, backsOf(first)[0]!.geometry];
            const freed = vi.fn();
            replaced.forEach(geometry => geometry.addEventListener("dispose", freed));

            // Act
            await drawJscad(quad, first);

            // Assert
            expect(freed).toHaveBeenCalledTimes(2);
        });

        it("should draw a mirrored solid where its transform puts it", async () => {
            // Arrange
            workers.jscadWorkerCall.mockResolvedValueOnce({ ...triangle, transforms: MIRROR_X_THEN_MOVE_5 });

            // Act
            const drawn = await drawHelper.drawSolidOrPolygonMesh({ mesh: { polygons: [], transforms: MIRROR_X_THEN_MOVE_5 }, drawTwoSided: false });

            // Assert
            expect(worldPositionsOf(frontsOf(drawn)[0]!)).toEqual([5, 0, 0, 4, 0, 0, 5, 1, 0]);
        });
    });

    describe("a surface redrawn in place", () => {
        it("should hand back a surface that is still in the scene, holding the new numbers", () => {
            // Arrange
            const material = new THREEJS.MeshPhysicalMaterial();
            const first = drawHelper.createOrUpdateSurfacesMesh([{ positions: [0, 0, 0, 1, 0, 0, 0, 1, 0], normals: [0, 0, 1, 0, 0, 1, 0, 0, 1], indices: [0, 1, 2] }], undefined, true, material, true, false);

            // Act
            const redrawn = drawHelper.createOrUpdateSurfacesMesh([{ positions: [0, 0, 0, 3, 0, 0, 0, 3, 0], normals: [0, 0, 1, 0, 0, 1, 0, 0, 1], indices: [0, 1, 2] }], first, true, material, true, false);

            // Assert
            expect(redrawn.parent).toBe(scene);
            expect(meshesIn(redrawn)).toHaveLength(1);
            expect(numbersOf(meshesIn(redrawn)[0]!).positions).toEqual([0, 0, 0, 3, 0, 0, 0, 3, 0]);
        });

        it("should refuse a part whose positions do not come in threes rather than draw a triangle that points at vertex 0", () => {
            // Arrange
            const material = new THREEJS.MeshPhysicalMaterial();
            const tenPositions = { positions: [0, 0, 0, 1, 0, 0, 0, 1, 0, 5], normals: [], indices: [0, 1, 2] };

            // Act
            const before = scene.children.length;
            const draw = (): THREEJS.Group => drawHelper.createOrUpdateSurfacesMesh([tenPositions], undefined, false, material, true, false);

            // Assert
            expect(draw).toThrow("Mesh part 0 holds 10 position values and 3 indexes; both must be whole points and triangles, three values each.");
            expect(scene.children.length).toBe(before);
        });
    });

    describe("a design build with many placements", () => {
        const options: Inputs.Draw.DrawOcctShapeOptions = { ...new Inputs.Draw.DrawOcctShapeOptions(), faceColour: "#ff0000", precision: 0.1 };

        beforeEach(() => {
            workers.occtWorkerCall.mockImplementation((_command: string, inputs: { shapes: unknown[] }) => Promise.resolve(inputs.shapes.map((_, at) => meshBuffersOf(partMeshOf(at + 1, at + 1)))));
        });

        it("should place every instance where its component is, move them all when posed again and move them back, meshing once", async () => {
            // Act & Assert
            await fc.assert(fc.asyncProperty(posesOf, async ({ first, second }) => {
                workers.occtWorkerCall.mockClear();
                const drawer = newHelper();
                const drawn = await drawer.drawDesignBuild(buildOf(first), options);
                const batches = batchesOf(drawn);
                expect([instancesMatch(drawn, first), edgeMatricesMatch(drawn, first)]).toEqual([true, true]);
                expect(placedOf(drawn).size).toBe(first.worlds.flat().length);
                expect(pickedFacesMatch(drawn)).toBe(true);
                await drawer.drawDesignBuild(buildOf(second), options, drawn);
                expect([instancesMatch(drawn, second), edgeMatricesMatch(drawn, second)]).toEqual([true, true]);
                await drawer.drawDesignBuild(buildOf(first), options, drawn);
                expect([instancesMatch(drawn, first), edgeMatricesMatch(drawn, first)]).toEqual([true, true]);
                expect(batchesOf(drawn).every((batch, at) => batch === batches[at])).toBe(true);
                expect(workers.occtWorkerCall).toHaveBeenCalledTimes(1);
                scene.remove(drawn);
            }), { seed: SEED + 3, numRuns: 60 });
        });

        it("should mesh the parts again when redrawn in place with another angular deflection, as it does for another precision", async () => {
            // Arrange
            const poses = { worlds: [[IDENTITY], [IDENTITY]] };
            const drawn = await drawHelper.drawDesignBuild(buildOf(poses), options);

            // Act
            await drawHelper.drawDesignBuild(buildOf(poses), { ...options, angularDeflection: 0.1 }, drawn);

            // Assert
            expect(workers.occtWorkerCall).toHaveBeenCalledTimes(2);
            expect(workers.occtWorkerCall.mock.calls[1]![1]).toEqual(expect.objectContaining({ angularDeflection: 0.1 }));
        });

        it("should hand out the meshes it keeps for options that differ only in their look, and mesh again for other meshing", async () => {
            // Arrange
            const build = buildOf({ worlds: [[IDENTITY], [IDENTITY]] });
            await drawHelper.drawDesignBuild(build, options);
            const hashes = build.parts.map(part => part.shapeHash);

            // Act
            const restyled = drawHelper.keptDesignMeshes(hashes, { ...options, faceColour: "#00ff00", edgeColour: "#0000ff", edgeContrast: 0.5, faceOpacity: 0.5 });
            const finer = drawHelper.keptDesignMeshes(hashes, { ...options, angularDeflection: 0.1 });

            // Assert
            expect(restyled.map(each => each.shapeHash)).toEqual(hashes);
            expect(finer).toEqual([]);
        });

        it("should draw a build from kept meshes handed back as a structured clone to a new drawer exactly as it drew them, without meshing", async () => {
            // Act & Assert
            await fc.assert(fc.asyncProperty(posesOf, async ({ first }) => {
                workers.occtWorkerCall.mockClear();
                const build = buildOf(first);
                const drawer = newHelper();
                const original = await drawer.drawDesignBuild(build, options);
                const kept: KeptDesignMesh<unknown>[] = structuredClone(drawer.keptDesignMeshes(build.parts.map(part => part.shapeHash), options));
                const fresh = newHelper();
                fresh.keepDesignMeshes(kept, options);
                const redrawn = await fresh.drawDesignBuild(build, options);
                expect(workers.occtWorkerCall).toHaveBeenCalledTimes(1);
                expect(batchesOf(redrawn).map(batch => [attributeOf(batch.geometry, "position"), attributeOf(batch.geometry, "normal"), plain(batch.geometry.getIndex()!.array)])).toEqual(batchesOf(original).map(batch => [attributeOf(batch.geometry, "position"), attributeOf(batch.geometry, "normal"), plain(batch.geometry.getIndex()!.array)]));
                expect(instancesMatch(redrawn, first)).toBe(true);
                scene.remove(original, redrawn);
            }), { seed: SEED + 4, numRuns: 40 });
        });

        it("should refuse a part whose new mesh cannot be drawn, naming the face, and leave the drawing it was to replace as it was", async () => {
            // Arrange
            const poses = { worlds: [[IDENTITY], [IDENTITY]] };
            const drawn = await drawHelper.drawDesignBuild(buildOf(poses), options);
            const before = [...drawn.children];
            const broken = partMeshOf(2, 1);
            broken.faceList[1]!.triIndexes = [0, 1];
            workers.occtWorkerCall.mockResolvedValueOnce([meshBuffersOf(broken)]);
            const edited = buildOf(poses);
            edited.parts[1] = partOf("part-1", 1, "part-1-edited");

            // Act
            const redrawing = drawHelper.drawDesignBuild(edited, options, drawn);

            // Assert
            await expect(redrawing).rejects.toThrow("Face 1 cannot be drawn: it holds 12 position values and 2 indexes; both must be whole points and triangles, three values each.");
            expect(drawn.children.length === before.length && drawn.children.every((child, at) => child === before[at])).toBe(true);
        });
    });

    describe("the edges of a shape in its appearance", () => {
        const colour = fc.constantFrom("#ff0000", "#00FF00", "#0000ff", "#336699", "#abcdef");
        const edgeEntries = fc.array(fc.record({ indexes: fc.array(fc.nat(5), { maxLength: 4 }), color: fc.option(colour, { nil: undefined }) }), { maxLength: 4 });

        it("should color each edge, every segment of it, by the last entry listing it, else the edge color, else the options' edge color", async () => {
            // Act & Assert
            await fc.assert(fc.asyncProperty(fc.array(fc.integer({ min: 2, max: 4 }), { minLength: 1, maxLength: 6 }), edgeEntries, fc.option(colour, { nil: undefined }), async (pointCounts, entries, edgeColor) => {
                const mesh: Inputs.OCCT.DecomposedMeshDto = {
                    faceList: [],
                    edgeList: pointCounts.map((count, edgeIndex) => ({ edgeIndex, vertexCoord: Array.from({ length: count }, (_, at): Inputs.Base.Point3 => [edgeIndex, at, 0]), middlePoint: [edgeIndex, 0, 0] })),
                    pointsList: [],
                };
                workers.occtWorkerCall.mockResolvedValueOnce([meshBuffersOf(mesh)]);
                const appearance: Models.OCCT.DesignBuiltAppearance = { faces: [], edges: entries.map(entry => entry.color === undefined ? { indexes: entry.indexes } : { indexes: entry.indexes, color: entry.color }), ...(edgeColor === undefined ? {} : { edgeColor }) };
                const drawn = await drawHelper.drawShapeWithAppearance({ shape: { hash: 1, type: "occ-shape" }, appearance }, { drawFaces: false, edgeColour: "#123456" });
                const base = (edgeColor ?? "#123456").toLowerCase();
                const expected = pointCounts.flatMap((count, edge) => {
                    const deciding = [...entries].reverse().find(entry => entry.indexes.includes(edge));
                    const edgeColour = deciding === undefined ? base : deciding.color?.toLowerCase() ?? base;
                    return new Array<string>(count - 1).fill(edgeColour.slice(1));
                });
                const colors = linesIn(drawn)[0]!.geometry.getAttribute("instanceColorStart");
                expect(Array.from({ length: colors.count }, (_, segment) => new THREEJS.Color(colors.getX(segment), colors.getY(segment), colors.getZ(segment)).getHexString())).toEqual(expected);
                scene.remove(drawn);
            }), { seed: SEED + 5, numRuns: 100 });
        });
    });

    describe("the index of a face whose mesh holds no middle point", () => {
        const labelOptions = (): Resolved.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer> => occtOptions({ drawFaces: false, drawFaceIndexes: true });

        it("should place the label at the middle of the face's points, for buffers without centres", async () => {
            // Arrange
            const setPositions = vi.spyOn(LineSegmentsGeometry.prototype, "setPositions");
            const face = { ...square(0, 2), vertexCoord: [0, 0, 0, 3, 0, 0, 0, 3, 0, 3, 3, 0] };

            // Act
            await drawHelper.handleDecomposedMesh(labelOptions(), meshBuffersOf({ faceList: [face], edgeList: [], pointsList: [] }, { withoutCenters: true }), {});

            // Assert
            expect(setPositions.mock.calls.map(call => plain(call[0] as ArrayLike<number>))).toEqual([[1.5, 1.55, 0, 2.5, 1.55, 0]]);
        });

        it("should place no label at a point that is not a number for a face with neither a middle point nor points", async () => {
            // Arrange
            const setPositions = vi.spyOn(LineSegmentsGeometry.prototype, "setPositions");
            const empty = { ...square(0, 2), vertexCoord: [], vertexCoordVec: [], normalCoord: [], triIndexes: [], numberOfTriangles: 0 };

            // Act
            await drawHelper.handleDecomposedMesh(labelOptions(), meshBuffersOf({ faceList: [square(1, 2), empty], edgeList: [], pointsList: [] }, { withoutCenters: true }), {});

            // Assert
            expect(setPositions.mock.calls.flatMap(call => plain(call[0] as ArrayLike<number>)!).some(value => Number.isNaN(value))).toBe(false);
        });

        it("should draw the face indexes as part of the shape's group, so they are rendered with it", async () => {
            // Act
            const drawn = await drawHelper.handleDecomposedMesh(labelOptions(), meshBuffersOf({ faceList: [square(0, 2)], edgeList: [], pointsList: [] }), {});

            // Assert
            expect(linesIn(drawn)).toHaveLength(1);
            expect(drawn.children).toContain(linesIn(drawn)[0]);
        });
    });

    describe("a Manifold cross-section", () => {
        it("should draw its outline inside the group it hands back, so removing the group removes the outline", async () => {
            // Arrange
            workers.manifoldWorkerCall.mockResolvedValue([[[0, 0], [1, 0], [1, 1]]]);

            // Act
            const drawn = await drawHelper.drawManifoldOrCrossSection({ manifoldOrCrossSection: { hash: 1, type: "manifold-shape" } });

            // Assert
            expect(linesIn(drawn!)).toHaveLength(1);
            expect(scene.children.length === 1 && scene.children[0] === drawn).toBe(true);
        });
    });
});
