import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fc from "fast-check";
import * as pc from "playcanvas";
import type { KeptDesignMesh } from "@bitbybit-dev/core";
import type * as Models from "@bitbybit-dev/core/lib/api/models";
import { GeometryHelper, MathBitByBit, Vector, resolveDto } from "@bitbybit-dev/base";
import { computeVertexNormals } from "@bitbybit-dev/base/lib/api/services/helpers/mesh/mesh-normals";
import type { JSCADText } from "@bitbybit-dev/jscad-worker";
import { createMockWorkerManagers, type MockWorkerManagers } from "./__mocks__/test-helpers";
import { meshBuffersOf } from "./__mocks__/mesh-buffers";
import { Context } from "./context";
import { DrawHelper } from "./draw-helper";
import * as Inputs from "./inputs";
import type * as Resolved from "./resolved-inputs";

type Build = Models.OCCT.DesignBuildResult<Inputs.OCCT.TopoDSShapePointer>;

type DesignPartEntity = pc.Entity & { designPart?: { part: string; paths: string[] } };

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

const SEED = 20261024;
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

const buildOf = (poses: PartPoses): Build => ({
    parts: poses.worlds.map((_, at) => partOf(`part-${at}`, at)),
    report: [],
    issues: [],
    parameters: {},
    units: { length: "mm", angle: "deg" },
    up: "y",
    components: poses.worlds.flatMap((worlds, at) => worlds.map((world, index): Models.OCCT.DesignBuiltComponent => ({ path: `part-${at}/${index}`, name: `${at}-${index}`, part: `part-${at}`, matrix: world, world, properties: {} }))),
});

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

describe("what PlayCanvas draws, pushed to the edges of real-world use", () => {
    let app: pc.AppBase;
    let context: Context;
    let workers: MockWorkerManagers;
    let drawHelper: DrawHelper;

    const labelText: Partial<JSCADText> = { createVectorText: vi.fn().mockResolvedValue([[[0, 0], [1, 0]]]) };
    const newHelper = (): DrawHelper => new DrawHelper(context, labelText as JSCADText, new Vector(new MathBitByBit(), new GeometryHelper()), workers.mockJscadWorkerManager, workers.mockManifoldWorkerManager, workers.mockOccWorkerManager);

    beforeEach(() => {
        const canvas = document.createElement("canvas");
        const device = new pc.NullGraphicsDevice(canvas);
        app = new pc.AppBase(canvas);
        const appOptions = new pc.AppOptions();
        appOptions.graphicsDevice = device;
        appOptions.componentSystems = [pc.RenderComponentSystem];
        app.init(appOptions);
        context = new Context();
        context.app = app;
        context.scene = app.root;
        workers = createMockWorkerManagers();
        drawHelper = newHelper();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        app.destroy();
    });

    const renderedIn = (root: pc.GraphNode): { name: string; instance: pc.MeshInstance }[] => {
        const found: { name: string; instance: pc.MeshInstance }[] = [];
        root.forEach(node => {
            if (node instanceof pc.Entity && node.render) {
                node.render.meshInstances.forEach(instance => found.push({ name: node.name, instance }));
            }
        });
        return found;
    };
    const trianglesIn = (root: pc.GraphNode): { name: string; instance: pc.MeshInstance }[] => renderedIn(root).filter(each => each.instance.mesh!.primitive[0]!.type === pc.PRIMITIVE_TRIANGLES);
    const backsOf = (root: pc.GraphNode): pc.Mesh[] => trianglesIn(root).filter(each => each.name.includes("backFace")).map(each => each.instance.mesh!);
    const frontsOf = (root: pc.GraphNode): pc.Mesh[] => trianglesIn(root).filter(each => !each.name.includes("backFace")).map(each => each.instance.mesh!);
    const linesIn = (root: pc.GraphNode): pc.Mesh[] => renderedIn(root).filter(each => each.instance.mesh!.primitive[0]!.type === pc.PRIMITIVE_LINES).map(each => each.instance.mesh!);
    const streamOf = (read: (values: number[]) => unknown): number[] | null => {
        const values: number[] = [];
        read(values);
        return values.length === 0 ? null : plain(values);
    };
    const numbersOf = (mesh: pc.Mesh): DrawnNumbers => ({
        positions: streamOf(values => mesh.getPositions(values)) ?? [],
        normals: streamOf(values => mesh.getNormals(values)) ?? [],
        indices: streamOf(values => mesh.getIndices(values)) ?? [],
        uvs: streamOf(values => mesh.getUvs(0, values)),
        colors: streamOf(values => mesh.getColors(values)),
    });
    const lineColoursOf = (mesh: pc.Mesh): string[] => {
        const colours = streamOf(values => mesh.getColors(values)) ?? [];
        return Array.from({ length: colours.length / 4 }, (_, vertex) => colours.slice(vertex * 4, vertex * 4 + 3).map(channel => Math.round(channel).toString(16).padStart(2, "0")).join(""));
    };
    const instanceMatrices = (instance: pc.MeshInstance): number[][] => {
        const buffer = instance.instancingData!.vertexBuffer!;
        const locked = buffer.lock();
        const data = ArrayBuffer.isView(locked) ? new Float32Array(locked.buffer, locked.byteOffset, locked.byteLength / Float32Array.BYTES_PER_ELEMENT) : new Float32Array(locked);
        buffer.unlock();
        return Array.from({ length: instance.instancingCount }, (_, index) => Array.from(data.slice(index * 16, index * 16 + 16)));
    };
    const partEntitiesOf = (root: pc.Entity): DesignPartEntity[] => root.children.filter((child): child is DesignPartEntity => child instanceof pc.Entity);
    const partInstancesOf = (root: pc.Entity): number[][][] => partEntitiesOf(root).map(part => {
        const each = renderedIn(part).map(rendered => instanceMatrices(rendered.instance));
        return each.every(matrices => JSON.stringify(matrices) === JSON.stringify(each[0])) ? each[0]! : [];
    });
    const worldPositionsOf = (root: pc.Entity): number[] => {
        const rendered = trianglesIn(root).find(each => !each.name.includes("backFace"))!;
        const node = root.findByName(rendered.name)!;
        const world = node.getWorldTransform();
        return pointsOf(numbersOf(rendered.instance.mesh!).positions).flatMap(point => {
            const moved = world.transformPoint(new pc.Vec3(...point));
            return [moved.x, moved.y, moved.z].map(value => Math.round(value * 1e6) / 1e6 + 0);
        });
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
                expect(linesIn(buffers).map(line => numbersOf(line).positions)).toEqual(linesIn(lists).map(line => numbersOf(line).positions));
                expect(linesIn(lists).map(line => numbersOf(line).positions)).toEqual(isoCurves.length > 0 ? [segmentsOf(isoCurves)] : []);
                lists.destroy();
                buffers.destroy();
            }), { seed: SEED, numRuns: 150 });
        });

        it("should draw the front as the worker winds it and the back wound the other way once, with the normals turned round", async () => {
            // Act & Assert
            await fc.assert(fc.asyncProperty(meshSpecOf, async specs => {
                const options = occtOptions();
                const drawn = await drawHelper.handleDecomposedMesh(options, meshBuffersOf(listsOf(specs)), {});
                const { colors: _frontColors, ...front } = numbersOf(frontsOf(drawn)[0]!);
                const { colors: backColors, ...back } = numbersOf(backsOf(drawn)[0]!);
                expect(front).toEqual({ ...joinedOf(specs, false, 1), positions: singles(joinedOf(specs, false, 1).positions) });
                expect(back).toEqual({ ...joinedOf(specs, true, -1), positions: singles(joinedOf(specs, true, -1).positions) });
                expect(backColors).toBeNull();
                drawn.destroy();
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
            expect([front.vertexBuffer.numVertices, back.vertexBuffer.numVertices]).toEqual([pointCount, pointCount]);
            expect(numbersOf(front).indices.slice(-3)).toEqual([pointCount - 3, pointCount - 2, pointCount - 1]);
            expect(numbersOf(back).indices.slice(-3)).toEqual([pointCount - 3, pointCount - 1, pointCount - 2]);
            expect(numbersOf(back).normals.slice(-3)).toEqual([0, 0, -1]);
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
            expect(trianglesIn(drawn)).toHaveLength(2);
            expect(frontsOf(drawn)[0]!.vertexBuffer.numVertices).toBe(faceCount * 4);
            expect(numbersOf(frontsOf(drawn)[0]!).indices.slice(-6)).toEqual([0, 1, 2, 0, 2, 3].map(index => index + (faceCount - 1) * 4));
            expect(elapsed).toBeLessThan(HUGE_TIME_BUDGET_MS);
        }, HUGE_TEST_TIMEOUT_MS);
    });

    describe("a JSCAD solid redrawn in place", () => {
        const triangle = { positions: [0, 0, 0, 1, 0, 0, 0, 1, 0], normals: [], indices: [0, 1, 2], transforms: MOVE_5 };
        const quad = { positions: [0, 0, 0, 2, 0, 0, 2, 2, 0, 0, 2, 0], normals: [], indices: [0, 1, 2, 0, 2, 3], transforms: MOVE_5 };
        const drawJscad = (sent: typeof triangle, previous?: pc.Entity): Promise<pc.Entity> => {
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
            expect(worldPositionsOf(last)).toEqual([5, 0, 0, 6, 0, 0, 5, 1, 0]);
            expect(backsOf(last)).toHaveLength(1);
        });

        it("should free the meshes it replaces when it redraws a solid in place", async () => {
            // Arrange
            const first = await drawJscad(triangle);
            const freed = vi.fn();
            [frontsOf(first)[0]!, backsOf(first)[0]!].forEach(mesh => vi.spyOn(mesh, "destroy").mockImplementation(freed));

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
            expect(worldPositionsOf(drawn)).toEqual([5, 0, 0, 4, 0, 0, 5, 1, 0]);
        });
    });

    describe("a surface redrawn in place", () => {
        it("should hand back a surface that is still in the scene, holding the new numbers", () => {
            // Arrange
            const material = new pc.StandardMaterial();
            const first = drawHelper.createOrUpdateSurfacesMesh([{ positions: [0, 0, 0, 1, 0, 0, 0, 1, 0], normals: [0, 0, 1, 0, 0, 1, 0, 0, 1], indices: [0, 1, 2] }], undefined, true, material, true, false);

            // Act
            const redrawn = drawHelper.createOrUpdateSurfacesMesh([{ positions: [0, 0, 0, 3, 0, 0, 0, 3, 0], normals: [0, 0, 1, 0, 0, 1, 0, 0, 1], indices: [0, 1, 2] }], first, true, material, true, false);

            // Assert
            expect(redrawn.parent).toBe(app.root);
            expect(trianglesIn(redrawn)).toHaveLength(1);
            expect(numbersOf(frontsOf(redrawn)[0]!).positions).toEqual([0, 0, 0, 3, 0, 0, 0, 3, 0]);
        });

        it("should refuse a part whose positions do not come in threes rather than draw a triangle that points at vertex 0", () => {
            // Arrange
            const material = new pc.StandardMaterial();
            const tenPositions = { positions: [0, 0, 0, 1, 0, 0, 0, 1, 0, 5], normals: [], indices: [0, 1, 2] };

            // Act
            const before = app.root.children.length;
            const draw = (): pc.Entity => drawHelper.createOrUpdateSurfacesMesh([tenPositions], undefined, false, material, true, false);

            // Assert
            expect(draw).toThrow("Mesh part 0 holds 10 position values and 3 indexes; both must be whole points and triangles, three values each.");
            expect(app.root.children.length).toBe(before);
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
                const parts = partEntitiesOf(drawn);
                expect(partInstancesOf(drawn)).toEqual(first.worlds);
                expect(parts.map(part => part.designPart?.paths)).toEqual(first.worlds.map((worlds, at) => worlds.map((_, index) => `part-${at}/${index}`)));
                await drawer.drawDesignBuild(buildOf(second), options, drawn);
                expect(partInstancesOf(drawn)).toEqual(second.worlds);
                await drawer.drawDesignBuild(buildOf(first), options, drawn);
                expect(partInstancesOf(drawn)).toEqual(first.worlds);
                expect(partEntitiesOf(drawn).every((part, at) => part === parts[at])).toBe(true);
                expect(workers.occtWorkerCall).toHaveBeenCalledTimes(1);
                drawn.destroy();
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
                expect(frontsOf(redrawn).map(numbersOf)).toEqual(frontsOf(original).map(numbersOf));
                expect(partInstancesOf(redrawn)).toEqual(first.worlds);
                original.destroy();
                redrawn.destroy();
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
            expect(trianglesIn(drawn)).toHaveLength(2);
        });
    });

    describe("the edges of a shape in its appearance", () => {
        const colour = fc.constantFrom("#ff0000", "#00FF00", "#0000ff", "#336699", "#abcdef");
        const edgeEntries = fc.array(fc.record({ indexes: fc.array(fc.nat(5), { maxLength: 4 }), color: fc.option(colour, { nil: undefined }) }), { maxLength: 4 });

        it("should color each edge, both ends of every segment of it, by the last entry listing it, else the edge color, else the options' edge color", async () => {
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
                    return new Array<string>((count - 1) * 2).fill(edgeColour.slice(1));
                });
                expect(lineColoursOf(linesIn(drawn)[0]!)).toEqual(expected);
                drawn.destroy();
            }), { seed: SEED + 5, numRuns: 100 });
        });
    });

    describe("the index of a face whose mesh holds no middle point", () => {
        const labelOptions = (): Resolved.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer> => occtOptions({ drawFaces: false, drawFaceIndexes: true });

        it("should place the label at the middle of the face's points, for buffers without centres", async () => {
            // Arrange
            const face = { ...square(0, 2), vertexCoord: [0, 0, 0, 3, 0, 0, 0, 3, 0, 3, 3, 0] };

            // Act
            const drawn = await drawHelper.handleDecomposedMesh(labelOptions(), meshBuffersOf({ faceList: [face], edgeList: [], pointsList: [] }, { withoutCenters: true }), {});

            // Assert
            expect(linesIn(drawn).map(line => numbersOf(line).positions)).toEqual([singles([1.5, 1.55, 0, 2.5, 1.55, 0])]);
        });

        it("should place no label at a point that is not a number for a face with neither a middle point nor points", async () => {
            // Arrange
            const empty = { ...square(0, 2), vertexCoord: [], vertexCoordVec: [], normalCoord: [], triIndexes: [], numberOfTriangles: 0 };

            // Act
            const drawn = await drawHelper.handleDecomposedMesh(labelOptions(), meshBuffersOf({ faceList: [square(1, 2), empty], edgeList: [], pointsList: [] }, { withoutCenters: true }), {});

            // Assert
            expect(linesIn(drawn).flatMap(line => numbersOf(line).positions).some(value => Number.isNaN(value))).toBe(false);
        });
    });

    describe("a Manifold cross-section", () => {
        it("should draw its outline inside the entity it hands back, so removing the entity removes the outline", async () => {
            // Arrange
            workers.manifoldWorkerCall.mockResolvedValue([[[0, 0], [1, 0], [1, 1]]]);

            // Act
            const drawn = await drawHelper.drawManifoldOrCrossSection({ manifoldOrCrossSection: { hash: 1, type: "manifold-shape" } });

            // Assert
            expect(linesIn(drawn!)).toHaveLength(1);
            expect(app.root.children.length === 1 && app.root.children[0] === drawn).toBe(true);
        });
    });
});
