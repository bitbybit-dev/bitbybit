import { describe, it, expect, beforeAll, beforeEach, afterEach } from "vitest";
import fc from "fast-check";
import type { BitbybitOcctModule, TopoDS_Shape } from "@bitbybit-dev/occt/bitbybit-dev-occt/bitbybit-dev-occt";
import initOpenCascade from "@bitbybit-dev/occt/bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "@bitbybit-dev/occt/lib/api/inputs";
import { meshBuffersOf } from "./mesh-transfer";
import type { CacheHelper } from "./cache-helper";
import { initializationComplete, onMessageInput } from "./occ-worker";

const SEED = 20261018;

type ViewKind = "vertexCoord" | "normalCoord" | "uvs" | "triIndexes" | "analysisValues";

interface Posted {
    data: Answer;
    options: { transfer?: ArrayBuffer[] } | undefined;
}

interface Answer {
    uid?: string;
    result?: unknown;
    error?: string;
    errorKind?: string;
    code?: string;
}

interface Reference {
    hash: number;
    type: string;
}

interface ViewPlan {
    buffer: number;
    start: number;
    length: number;
}

interface FacePlan {
    vertexCoord: ViewPlan;
    normalCoord: ViewPlan;
    uvs: ViewPlan;
    triIndexes: ViewPlan;
    analysisValues: ViewPlan | undefined;
}

interface BufferPlan {
    elements: number;
    shared: boolean;
}

const VIEW_KINDS: readonly ViewKind[] = ["vertexCoord", "normalCoord", "uvs", "triIndexes", "analysisValues"];

describe("meshBuffersOf, the buffers a drawn mesh hands over", () => {
    const views = (pool: number): fc.Arbitrary<ViewPlan> => fc.record({ buffer: fc.integer({ min: 0, max: pool - 1 }), start: fc.integer({ min: 0, max: 4 }), length: fc.integer({ min: 0, max: 4 }) });
    const plans = fc.array(fc.record({ elements: fc.constant(8), shared: fc.boolean() }), { minLength: 1, maxLength: 5 }).chain(buffers => fc.record({
        buffers: fc.constant(buffers),
        meshes: fc.array(fc.array(fc.record({
            vertexCoord: views(buffers.length),
            normalCoord: views(buffers.length),
            uvs: views(buffers.length),
            triIndexes: views(buffers.length),
            analysisValues: fc.option(views(buffers.length), { nil: undefined }),
        }), { maxLength: 6 }), { maxLength: 3 }),
    }));
    const built = (buffers: BufferPlan[], meshes: FacePlan[][]): { pool: (ArrayBuffer | SharedArrayBuffer)[]; meshes: Inputs.OCCT.DecomposedMeshBuffersDto[] } => {
        const pool = buffers.map(plan => plan.shared ? new SharedArrayBuffer(4 * plan.elements) : new ArrayBuffer(4 * plan.elements));
        const floats = (view: ViewPlan): Float32Array => new Float32Array(pool[view.buffer]!, 4 * view.start, view.length);
        const faceOf = (face: FacePlan): Inputs.OCCT.DecomposedFaceBuffersDto => ({
            faceIndex: 0,
            numberOfTriangles: 0,
            centerPoint: null,
            centerNormal: null,
            vertexCoord: floats(face.vertexCoord),
            normalCoord: floats(face.normalCoord),
            uvs: floats(face.uvs),
            triIndexes: new Uint32Array(pool[face.triIndexes.buffer]!, 4 * face.triIndexes.start, face.triIndexes.length),
            ...(face.analysisValues === undefined ? {} : { analysisValues: floats(face.analysisValues) }),
        });
        return { pool, meshes: meshes.map(faces => ({ faceList: faces.map(faceOf), edgeList: [], pointsList: [] })) };
    };

    it("should list every unshared buffer the faces view, each once, the analysis values' included, and none other", () => {
        fc.assert(fc.property(plans, ({ buffers, meshes }) => {
            // Arrange
            const { meshes: drawn } = built(buffers, meshes);
            const viewed = new Set(drawn.flatMap(mesh => mesh.faceList.flatMap(face => VIEW_KINDS.map(kind => face[kind]?.buffer))).filter((buffer): buffer is ArrayBuffer => buffer instanceof ArrayBuffer));

            // Act
            const handed = meshBuffersOf(drawn);

            // Assert
            expect(handed).toHaveLength(new Set(handed).size);
            expect(new Set(handed)).toEqual(viewed);
        }), { seed: SEED, numRuns: 200 });
    });

    it("should name only buffers a structured clone can take, leaving each emptied on this side and the shared ones whole", () => {
        fc.assert(fc.property(plans, ({ buffers, meshes }) => {
            // Arrange
            const { pool, meshes: drawn } = built(buffers, meshes);

            // Act
            const handed = meshBuffersOf(drawn);
            const received = structuredClone(drawn, { transfer: handed });

            // Assert
            expect(received).toHaveLength(drawn.length);
            expect(handed.map(buffer => buffer.byteLength)).toEqual(handed.map(() => 0));
            expect(pool.filter(buffer => buffer instanceof SharedArrayBuffer).map(buffer => buffer.byteLength)).toEqual(buffers.filter(plan => plan.shared).map(plan => 4 * plan.elements));
        }), { seed: SEED, numRuns: 200 });
    });

    it("should hand over nothing for meshes without faces", () => {
        expect(meshBuffersOf([{ faceList: [], edgeList: [], pointsList: [[0, 0, 0]] }, { faceList: [], edgeList: [], pointsList: [] }])).toEqual([]);
    });
});

describe("the worker drawing real shapes", () => {
    let occt: BitbybitOcctModule;
    let cacheHelper: CacheHelper;
    let calls: number;

    beforeAll(async () => {
        occt = await initOpenCascade();
    });

    beforeEach(() => {
        cacheHelper = initializationComplete(occt, undefined, true);
        calls = 0;
    });

    afterEach(() => {
        cacheHelper.cleanAllCache();
        occt.SetMeshRetention(0);
    });

    const posted = (functionName: string, inputs: Record<string, unknown>, host: (post: Posted) => void = (): void => undefined): Posted[] => {
        const posts: Posted[] = [];
        calls++;
        onMessageInput({ action: { functionName, inputs }, uid: `call-${calls}` }, (data: unknown, options?: { transfer?: ArrayBuffer[] }) => {
            const post: Posted = { data: data as Answer, options };
            posts.push(post);
            host(post);
        });
        return posts;
    };
    const answerOf = (functionName: string, inputs: Record<string, unknown>): Answer => posted(functionName, inputs)[1]!.data;
    const made = (functionName: string, inputs: Record<string, unknown>): Reference => {
        const answer = answerOf(functionName, inputs);
        expect(answer.error).toBeUndefined();
        return answer.result as Reference;
    };

    type Recipe = "box" | "rounded box" | "drilled plate" | "cylinder" | "ball" | "repeated boxes";
    const shapeOf = (recipe: Recipe, size: number): Reference => {
        switch (recipe) {
            case "box":
                return made("shapes.solid.createBox", { width: size, length: 2 * size, height: 3 * size, center: [0, 0, 0] });
            case "rounded box":
                return made("fillets.filletEdges", { shape: shapeOf("box", size), radius: size / 4 });
            case "drilled plate":
                return made("booleans.difference", { shape: shapeOf("box", size), shapes: [made("shapes.solid.createCylinder", { radius: size / 4, height: 10 * size, center: [0, -5 * size, 0], direction: [0, 1, 0] })], keepEdges: false });
            case "cylinder":
                return made("shapes.solid.createCylinder", { radius: size, height: size, center: [size, 0, 0], direction: [0, 0, 1] });
            case "ball":
                return made("shapes.solid.createSphere", { radius: size, center: [0, size, 0] });
            default:
                return made("shapes.compound.makeCompound", { shapes: [shapeOf("box", size), made("transforms.translate", { shape: shapeOf("box", size), translation: [5 * size, 0, 0] })] });
        }
    };
    const recipes = fc.constantFrom<Recipe>("box", "rounded box", "drilled plate", "cylinder", "ball", "repeated boxes");
    const drawingOptions = fc.record({
        precision: fc.constantFrom(0.05, 0.2),
        computeMetadata: fc.boolean(),
        adjustYtoZ: fc.boolean(),
        isoCurvesU: fc.integer({ min: 0, max: 2 }),
        isoCurvesV: fc.integer({ min: 0, max: 2 }),
        surfaceAnalysis: fc.constantFrom(Inputs.OCCT.surfaceAnalysisEnum.none, Inputs.OCCT.surfaceAnalysisEnum.mean, Inputs.OCCT.surfaceAnalysisEnum.draftAngle),
    });
    const numbersOf = (meshes: Inputs.OCCT.DecomposedMeshBuffersDto[]): number[][][] => meshes.map(mesh => mesh.faceList.flatMap(face => VIEW_KINDS.map(kind => Array.from(face[kind] ?? []))));
    const viewedBuffers = (meshes: Inputs.OCCT.DecomposedMeshBuffersDto[]): Set<ArrayBufferLike> => new Set(meshes.flatMap(mesh => mesh.faceList.flatMap(face => VIEW_KINDS.map(kind => face[kind]?.buffer))).filter((buffer): buffer is ArrayBufferLike => buffer !== undefined));
    const crossed = (message: unknown, transfer: ArrayBuffer[]): Promise<unknown> => new Promise(resolve => {
        const channel = new MessageChannel();
        channel.port2.onmessage = (event: MessageEvent): void => {
            channel.port1.close();
            channel.port2.close();
            resolve(event.data);
        };
        channel.port1.postMessage(message, transfer);
    });

    describe("handing the buffers of shapesToMeshBuffers over", () => {
        it("should hand over every buffer the answer views, each once, and cross a real channel with them whole, leaving the worker's empty", async () => {
            await fc.assert(fc.asyncProperty(fc.array(fc.tuple(recipes, fc.double({ min: 0.5, max: 20, noNaN: true })), { minLength: 1, maxLength: 3 }), drawingOptions, async (wanted, options) => {
                // Arrange
                const shapes = wanted.map(([recipe, size]) => shapeOf(recipe, size));
                const [, answer] = posted("shapesToMeshBuffers", { shapes, ...options });
                const meshes = answer!.data.result as Inputs.OCCT.DecomposedMeshBuffersDto[];
                const sent = numbersOf(meshes);
                const transfer = answer!.options!.transfer!;

                // Act
                const received = await crossed(answer!.data, transfer) as Answer;

                // Assert
                expect(transfer).toHaveLength(new Set(transfer).size);
                expect(new Set(transfer)).toEqual(viewedBuffers(meshes));
                expect(numbersOf(received.result as Inputs.OCCT.DecomposedMeshBuffersDto[])).toEqual(sent);
                expect(transfer.map(buffer => buffer.byteLength)).toEqual(transfer.map(() => 0));
            }), { seed: SEED, numRuns: 10 });
        });

        it("should draw a shape whose buffers were handed over again in full, since nothing kept them", async () => {
            // Arrange
            const shape = shapeOf("rounded box", 2);
            const [, first] = posted("shapeToMeshBuffers", { shape, precision: 0.05 });
            const before = numbersOf([first!.data.result as Inputs.OCCT.DecomposedMeshBuffersDto]);
            await crossed(first!.data, first!.options!.transfer!);

            // Act
            const again = answerOf("shapeToMeshBuffers", { shape, precision: 0.05 });

            // Assert
            expect(numbersOf([again.result as Inputs.OCCT.DecomposedMeshBuffersDto])).toEqual(before);
        });
    });

    describe("the mesh retention budget through the worker's commands", () => {
        it("should keep no more triangles than the budget, draw kept shapes with the numbers it drew them with, and keep the budget when the cache is cleaned", () => {
            fc.assert(fc.property(fc.constantFrom(0, 500, 5000, 1_000_000), fc.array(fc.tuple(recipes, fc.double({ min: 0.5, max: 20, noNaN: true })), { minLength: 1, maxLength: 4 }), drawingOptions, (budget, wanted, options) => {
                // Arrange
                const shapes = wanted.map(([recipe, size]) => shapeOf(recipe, size));
                const unkept = shapes.map(shape => numbersOf([answerOf("shapeToMeshBuffers", { shape, ...options }).result as Inputs.OCCT.DecomposedMeshBuffersDto]));

                // Act
                const set = answerOf("setMeshRetention", { triangles: budget });
                const drawn = shapes.map(shape => numbersOf([answerOf("shapeToMeshBuffers", { shape, ...options }).result as Inputs.OCCT.DecomposedMeshBuffersDto]));
                const kept = occt.KeptMeshTriangles();
                const redrawn = shapes.map(shape => numbersOf([answerOf("shapeToMeshBuffers", { shape, ...options }).result as Inputs.OCCT.DecomposedMeshBuffersDto]));
                posted("cleanAllCache", {});

                // Assert
                expect(set.result).toMatchObject({ budget });
                expect(kept).toBeLessThanOrEqual(budget);
                expect(drawn).toEqual(unkept);
                expect(redrawn).toEqual(unkept);
                expect([occt.MeshRetentionBudget(), occt.KeptMeshTriangles(), occt.KeptMeshFaces()]).toEqual([budget, 0, 0]);
            }), { seed: SEED, numRuns: 10 });
        });
    });

    describe("what a failed call is answered with, through the real kernel", () => {
        it("should answer a refused input as an input error naming the call and the property", () => {
            // Arrange
            const face = made("shapes.face.createSquareFace", { size: 2, center: [0, 0, 0], direction: [0, 1, 0] });

            // Act
            const answer = answerOf("operations.extrude", { shape: face, direction: [0, 0, 0] });

            // Assert
            expect(answer).toMatchObject({ errorKind: "input", error: expect.stringMatching(/^operations\.extrude: `direction` is \[0, 0, 0\]/) });
        });

        it("should answer a failure the kernel named as a kernel error with its code", () => {
            // Arrange
            const upright = made("shapes.face.createSquareFace", { size: 5, center: [0, 0, 0], direction: [1, 0, 0] });

            // Act
            const answer = answerOf("operations.rotatedExtrude", { shape: upright, height: 5, angle: 90, makeSolid: true });

            // Assert
            expect(answer).toMatchObject({ errorKind: "kernel", code: "occt.pipe.failed" });
        });

        it("should answer a C++ exception by what the kernel says it was, and answer it alike when it is asked again", () => {
            // Arrange
            const box = shapeOf("box", 1);
            const side = made("shapes.face.getFace", { shape: box, index: 0 });
            const draft = { shape: box, faces: [side], direction: [0, 0, 0], angle: 5, neutralPlaneOrigin: [0, 0, 0], neutralPlaneDirection: [0, 0, 1], flag: true };

            // Act
            const first = answerOf("draft.draftAngle", draft);
            const second = answerOf("draft.draftAngle", draft);

            // Assert
            expect(first).toMatchObject({ errorKind: "kernel", error: expect.stringContaining("Standard_DomainError: gp_Dir: the vector has no length") });
            expect(second.error).toBe(first.error);
        });

        it("should answer a call stopped while it ran as cancelled and let go of the shape it had made", () => {
            // Arrange
            const words = Reflect.get(occt, "bitbybitControl") as Int32Array;
            const original: unknown = Reflect.get(occt, "MakeBoxFromPntAndDims");
            const makeBox = (original as (...args: unknown[]) => TopoDS_Shape).bind(occt);
            const boxes: TopoDS_Shape[] = [];
            Reflect.set(occt, "MakeBoxFromPntAndDims", (...args: unknown[]): TopoDS_Shape => {
                const box = makeBox(...args);
                boxes.push(box);
                Atomics.store(words, 0, 1);
                return box;
            });

            // Act
            let answer: Answer;
            try {
                answer = answerOf("shapes.solid.createBox", { width: 1, length: 2, height: 3, center: [0, 0, 0] });
            } finally {
                Reflect.set(occt, "MakeBoxFromPntAndDims", original);
                Atomics.store(words, 0, 0);
            }

            // Assert
            expect(answer.errorKind).toBe("cancelled");
            expect(boxes.map(box => box.isDeleted())).toEqual([true]);
        });
    });
});
