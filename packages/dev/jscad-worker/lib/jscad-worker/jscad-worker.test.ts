import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { InputIssueReport } from "@bitbybit-dev/base";
import { InputError, KernelOperationError, setInputIssueSink } from "@bitbybit-dev/base";
import type { DataInput } from "./jscad-worker";
import { initializationComplete, onMessageInput } from "./jscad-worker";

type Deletable = { delete: () => void };
type Answer = { uid?: string; result?: unknown; error?: string; errorKind?: string; code?: string; details?: unknown; stack?: string };

const { FakeCacheHelper, latest, failure } = vi.hoisted(() => {
    class FakeCacheHelper {
        usedHashes: Record<string, string | number> = {};
        entries = new Map<string | number, unknown>();
        stored = new Map<string, unknown>();
        cleanAllCacheCalls = 0;

        checkCache(hash: string | number): unknown {
            return this.entries.has(hash) ? this.entries.get(hash) : null;
        }

        ops: unknown[] = [];

        cacheOp(action: unknown, cacheMiss: () => unknown): unknown {
            this.ops.push(structuredClone(action));
            const key = JSON.stringify(action);
            if (this.stored.has(key)) {
                return this.stored.get(key);
            }
            const result = cacheMiss();
            this.stored.set(key, result);
            return result;
        }

        cleanAllCache(): void {
            this.cleanAllCacheCalls += 1;
        }
    }
    const latest = { cache: new FakeCacheHelper() };
    const failure: { value: unknown } = { value: undefined };
    return { FakeCacheHelper, latest, failure };
});

vi.mock("./cache-helper", () => ({
    CacheHelper: class extends FakeCacheHelper {
        constructor() {
            super();
            latest.cache = this;
        }
    },
}));

vi.mock("@bitbybit-dev/jscad", () => {
    class Jscad {
        constructor(public readonly kernel: unknown) { }
        shapes = {
            cube: (inputs: unknown) => ({ made: "cube", from: inputs }),
            sphere: (inputs: unknown) => ({ made: "sphere", from: inputs }),
            fail: (): unknown => { throw failure.value; },
        };
        measure = {
            unit: 10,
            scaled(this: { unit: number }, inputs: { size: number }): number {
                return this.unit * inputs.size;
            },
        };
        toPolygonPoints = (inputs: unknown) => ({ made: "points", from: inputs });
        boom = (): unknown => { throw failure.value; };
    }
    class SphereDto {
        radius = 1;
        segments = 32;
    }
    const constraints = { radius: { kind: "number" }, segments: { kind: "number", required: true } };
    const rules = new Map([[SphereDto, [{ reads: ["radius"], check: (inputs: { radius: number }) => (inputs.radius > 100 ? { property: "radius", code: "custom", message: "must be at most 100" } : undefined) }]]]);
    return {
        Jscad,
        jscadDtoRegistry: { "shapes.sphere": { dto: SphereDto, constraints }, "shapes.fail": { dto: SphereDto, constraints } },
        jscadDtoRules: rules,
    };
});

const cacheOf = () => latest.cache;

const A_KERNEL = { primitives: {} };
const CACHED_HASH = "cached";
const MISSING_HASH = "missing";
const REFERENCE = { type: "jscad-geometry", hash: CACHED_HASH };
const CACHED_GEOMETRY = { geometry: "from-cache" };

describe("the worker message loop", () => {
    let answers: unknown[];
    let posted: unknown[];

    const run = (action: { functionName?: string; inputs?: unknown }, uid = "uid-1"): void => {
        onMessageInput({ action, uid } as DataInput, (message: unknown) => answers.push(message));
    };

    const answer = (): Answer => answers[1] as Answer;

    const answerTo = (action: { functionName?: string; inputs?: unknown }, uid = "uid-1"): Answer => {
        const messages: unknown[] = [];
        onMessageInput({ action, uid } as DataInput, (message: unknown) => messages.push(message));
        return messages[1] as Answer;
    };

    beforeEach(() => {
        answers = [];
        posted = [];
        failure.value = new Error("the kernel refused");
        vi.stubGlobal("postMessage", (message: unknown) => posted.push(message));
        setInputIssueSink(() => undefined);
        initializationComplete(A_KERNEL, undefined, true);
        cacheOf().entries.set(CACHED_HASH, CACHED_GEOMETRY);
    });

    afterEach(() => {
        setInputIssueSink();
        vi.unstubAllGlobals();
    });

    describe("initializationComplete", () => {
        it("should hold a call that arrives before the kernel and answer it once the kernel is given", async () => {
            // Arrange
            vi.resetModules();
            const fresh = await import("./jscad-worker");
            const posted: unknown[] = [];
            fresh.onMessageInput({ action: { functionName: "shapes.cube", inputs: { size: 1 } }, uid: "early" }, (message: unknown) => posted.push(message));
            const beforeTheKernel = [...posted];

            // Act
            fresh.initializationComplete(A_KERNEL, undefined, true);

            // Assert
            expect(beforeTheKernel).toEqual([]);
            expect(posted).toEqual(["busy", { uid: "early", result: { made: "cube", from: { size: 1 } } }]);
        });

        it("should announce itself to the host that started it", () => {
            // Act
            initializationComplete(A_KERNEL);

            // Assert
            expect(posted).toEqual(["jscad-initialised"]);
        });

        it("should stay silent when the host asked it not to announce", () => {
            // Act
            initializationComplete(A_KERNEL, undefined, true);

            // Assert
            expect(posted).toEqual([]);
        });

        it("should build a fresh cache for the kernel it was given", () => {
            // Arrange
            const before = cacheOf();

            // Act
            initializationComplete(A_KERNEL, undefined, true);

            // Assert
            expect(cacheOf()).not.toBe(before);
        });
    });

    describe("answering a call", () => {
        it("should say it is busy before it answers", () => {
            // Act
            run({ functionName: "shapes.cube", inputs: {} });

            // Assert
            expect(answers[0]).toBe("busy");
        });

        it("should answer under the uid the call arrived with", () => {
            // Act
            run({ functionName: "shapes.cube", inputs: {} }, "uid-7");

            // Assert
            expect(answer().uid).toBe("uid-7");
        });

        it("should call the kernel method a two part path names", () => {
            // Act
            run({ functionName: "shapes.cube", inputs: { size: 1 } });

            // Assert
            expect(answer().result).toEqual({ made: "cube", from: { size: 1 } });
        });

        it("should call the kernel method a one part path names", () => {
            // Act
            run({ functionName: "toPolygonPoints", inputs: { mesh: "a" } });

            // Assert
            expect(answer().result).toEqual({ made: "points", from: { mesh: "a" } });
        });

        it("should call the kernel method with the object that holds it as this", () => {
            // Act
            run({ functionName: "measure.scaled", inputs: { size: 3 } });

            // Assert
            expect(answer()).toEqual({ uid: "uid-1", result: 30 });
        });

        it("should answer a call the cache holds without looking up the geometry it refers to", () => {
            // Arrange
            const first = answerTo({ functionName: "shapes.cube", inputs: { geometry: REFERENCE } }, "uid-1");
            cacheOf().entries.delete(CACHED_HASH);

            // Act
            const second = answerTo({ functionName: "shapes.cube", inputs: { geometry: REFERENCE } }, "uid-2");

            // Assert
            expect(second).toEqual({ uid: "uid-2", result: first.result });
        });

        it("should run a call whose issues reach a sink that throws", () => {
            // Arrange
            const refusing = vi.fn((): void => {
                throw new Error("the sink refused");
            });
            setInputIssueSink(refusing);

            // Act
            const answered = answerTo({ functionName: "shapes.sphere", inputs: { radius: "big" } });

            // Assert
            expect(refusing).toHaveBeenCalledTimes(1);
            expect(answered).toEqual({ uid: "uid-1", result: { made: "sphere", from: { radius: "big", segments: 32 } } });
        });

        it("should answer a call the cache already holds with what it holds, without running the kernel again", () => {
            // Arrange
            const first = answerTo({ functionName: "shapes.sphere", inputs: { radius: 2 } }, "uid-1");

            // Act
            const second = answerTo({ functionName: "shapes.sphere", inputs: { radius: 2 } }, "uid-2");

            // Assert
            expect(second.result).toBe(first.result);
        });
    });

    describe("the paths a call may name", () => {
        it("should refuse a path that reaches for the constructor", () => {
            // Act
            run({ functionName: "constructor", inputs: {} });

            // Assert
            expect(answer()).toEqual({
                uid: "uid-1",
                result: undefined,
                error: "JSCAD computation failed while executing function 'constructor': Cannot resolve \"constructor\": \"constructor\" is not a segment an operation path may contain.",
                errorKind: "kernel",
                stack: expect.stringContaining("is not a segment an operation path may contain"),
            });
        });

        it("should refuse a path that walks through an object's prototype", () => {
            // Act
            run({ functionName: "shapes.__proto__.hasOwnProperty", inputs: { size: 1 } });

            // Assert
            expect(answer().error).toBe("JSCAD computation failed while executing function 'shapes.__proto__.hasOwnProperty': Cannot resolve \"shapes.__proto__.hasOwnProperty\": \"__proto__\" is not a segment an operation path may contain. Input values were: {size: 1}.");
        });

        it("should refuse a path with an empty segment", () => {
            // Act
            run({ functionName: "shapes..cube", inputs: {} });

            // Assert
            expect(answer().error).toBe("JSCAD computation failed while executing function 'shapes..cube': Cannot resolve \"shapes..cube\": \"\" is not a segment an operation path may contain.");
        });

        it("should refuse a path that walks into a method as though it held others", () => {
            // Act
            run({ functionName: "shapes.cube.call", inputs: {} });

            // Assert
            expect(answer().error).toBe("JSCAD computation failed while executing function 'shapes.cube.call': Cannot resolve \"shapes.cube.call\": \"shapes.cube\" is not an object.");
        });

        it("should refuse a path whose last segment is not a method", () => {
            // Act
            run({ functionName: "measure.unit", inputs: {} });

            // Assert
            expect(answer().error).toBe("JSCAD computation failed while executing function 'measure.unit': \"measure.unit\" is not a function.");
        });
    });

    describe("what a call is given that the operation would reject", () => {
        let reports: InputIssueReport[];

        beforeEach(() => {
            reports = [];
            setInputIssueSink((report) => reports.push(report));
        });

        afterEach(() => {
            setInputIssueSink();
        });

        it("should report a property of the wrong kind, a rule that fails and a name the operation does not know, and still run", () => {
            // Act
            run({ functionName: "shapes.sphere", inputs: { radius: 200, segments: "many", segmnets: 4 } });

            // Assert
            expect(reports).toEqual([
                { kernel: "JSCAD", path: "shapes.sphere", issue: { property: "segments", code: "type", message: "must be a number" } },
                { kernel: "JSCAD", path: "shapes.sphere", issue: { property: "radius", code: "custom", message: "must be at most 100" } },
                { kernel: "JSCAD", path: "shapes.sphere", issue: { property: "segmnets", code: "unknown-property", message: "is not an input of this operation and is ignored" } },
            ]);
            expect(answer().result).toEqual({ made: "sphere", from: { radius: 200, segments: "many", segmnets: 4 } });
        });

        it("should report nothing for inputs the operation accepts", () => {
            // Act
            run({ functionName: "shapes.sphere", inputs: { radius: 2 } });

            // Assert
            expect(reports).toEqual([]);
        });

        it("should check the inputs with the defaults laid under them, so a required property the DTO defaults is not missing", () => {
            // Act
            run({ functionName: "shapes.sphere", inputs: {} });

            // Assert
            expect(reports).toEqual([]);
        });

        it("should report a name the operation does not know even when the call passed it as undefined", () => {
            // Act
            run({ functionName: "shapes.sphere", inputs: { radius: 2, segmnets: undefined } });

            // Assert
            expect(reports).toEqual([
                { kernel: "JSCAD", path: "shapes.sphere", issue: { property: "segmnets", code: "unknown-property", message: "is not an input of this operation and is ignored" } },
            ]);
        });

        it("should not check again a call the cache already holds", () => {
            // Arrange
            run({ functionName: "shapes.sphere", inputs: { radius: 200 } }, "uid-1");
            const afterTheHit: InputIssueReport[] = [];
            setInputIssueSink((report) => afterTheHit.push(report));

            // Act
            run({ functionName: "shapes.sphere", inputs: { radius: 200 } }, "uid-2");

            // Assert
            expect(reports).toEqual([{ kernel: "JSCAD", path: "shapes.sphere", issue: { property: "radius", code: "custom", message: "must be at most 100" } }]);
            expect(afterTheHit).toEqual([]);
        });

        it("should check a call that misses the cache even when an earlier one was reported", () => {
            // Arrange
            run({ functionName: "shapes.sphere", inputs: { radius: 200 } }, "uid-1");
            const afterTheMiss: InputIssueReport[] = [];
            setInputIssueSink((report) => afterTheMiss.push(report));

            // Act
            run({ functionName: "shapes.sphere", inputs: { radius: 300 } }, "uid-2");

            // Assert
            expect(afterTheMiss).toEqual([{ kernel: "JSCAD", path: "shapes.sphere", issue: { property: "radius", code: "custom", message: "must be at most 100" } }]);
        });

        it("should report nothing for an operation the registry does not list", () => {
            // Act
            run({ functionName: "shapes.cube", inputs: { anything: "goes" } });

            // Assert
            expect(reports).toEqual([]);
        });
    });

    describe("the defaults of the DTO an operation takes", () => {
        it("should give a property the call left out its default", () => {
            // Act
            run({ functionName: "shapes.sphere", inputs: { radius: 3 } });

            // Assert
            expect(answer().result).toEqual({ made: "sphere", from: { radius: 3, segments: 32 } });
        });

        it("should give a property the call passed as undefined its default", () => {
            // Act
            run({ functionName: "shapes.sphere", inputs: { radius: undefined } });

            // Assert
            expect(answer().result).toEqual({ made: "sphere", from: { radius: 1, segments: 32 } });
        });

        it("should cache a call that leaves defaults out under the same inputs as one that spells them", () => {
            // Act
            run({ functionName: "shapes.sphere", inputs: {} }, "uid-1");
            run({ functionName: "shapes.sphere", inputs: { segments: 32, radius: 1 } }, "uid-2");

            // Assert
            expect(JSON.stringify(cacheOf().ops[0])).toBe(JSON.stringify(cacheOf().ops[1]));
        });

        it("should cache a call under its inputs with every default spelled out", () => {
            // Act
            run({ functionName: "shapes.sphere", inputs: { radius: 3 } });

            // Assert
            expect(JSON.stringify(cacheOf().ops[0])).toBe(JSON.stringify({ functionName: "shapes.sphere", inputs: { radius: 3, segments: 32 } }));
        });

        it("should cache a call that passes a property as undefined under the fully spelled inputs", () => {
            // Act
            run({ functionName: "shapes.sphere", inputs: { radius: undefined, segments: 32 } });

            // Assert
            expect(JSON.stringify(cacheOf().ops[0])).toBe(JSON.stringify({ functionName: "shapes.sphere", inputs: { radius: 1, segments: 32 } }));
        });

        it("should answer a call that leaves defaults out from the entry of the fully spelled call", () => {
            // Arrange
            const spelled = answerTo({ functionName: "shapes.sphere", inputs: { radius: 1, segments: 32 } }, "uid-1");

            // Act
            const partial = answerTo({ functionName: "shapes.sphere", inputs: { segments: undefined } }, "uid-2");

            // Assert
            expect(partial.result).toBe(spelled.result);
        });

        it("should pass the inputs of an operation the registry does not list through as they are", () => {
            // Act
            run({ functionName: "shapes.cube", inputs: { size: 2 } });

            // Assert
            expect(answer().result).toEqual({ made: "cube", from: { size: 2 } });
        });
    });

    describe("resolving hashed geometry against the cache", () => {
        it("should replace a hashed input with the geometry the cache holds", () => {
            // Act
            run({ functionName: "shapes.cube", inputs: { geometry: REFERENCE } });

            // Assert
            expect(answer().result).toEqual({ made: "cube", from: { geometry: CACHED_GEOMETRY } });
        });

        it("should replace a hashed input nested inside an object", () => {
            // Act
            run({ functionName: "shapes.cube", inputs: { options: { target: REFERENCE } } });

            // Assert
            expect(answer().result).toEqual({ made: "cube", from: { options: { target: CACHED_GEOMETRY } } });
        });

        it("should replace a hashed input nested in a list inside an object inside a list", () => {
            // Act
            run({ functionName: "shapes.cube", inputs: { groups: [{ items: [5, REFERENCE] }] } });

            // Assert
            expect(answer().result).toEqual({ made: "cube", from: { groups: [{ items: [5, CACHED_GEOMETRY] }] } });
        });

        it("should replace a hashed input that is not the first item of its list", () => {
            // Act
            run({ functionName: "shapes.cube", inputs: { items: [5, REFERENCE] } });

            // Assert
            expect(answer().result).toEqual({ made: "cube", from: { items: [5, CACHED_GEOMETRY] } });
        });

        it("should hand a geometry on without walking into it", () => {
            // Arrange
            const solid = { polygons: [REFERENCE] };

            // Act
            run({ functionName: "shapes.cube", inputs: { solid } });

            // Assert
            expect(answer().result).toEqual({ made: "cube", from: { solid } });
        });

        it("should leave the posted inputs as they were and cache the call under them", () => {
            // Arrange
            const inputs = { geometry: { type: "jscad-geometry", hash: CACHED_HASH } };

            // Act
            run({ functionName: "shapes.cube", inputs });

            // Assert
            expect(inputs).toEqual({ geometry: { type: "jscad-geometry", hash: CACHED_HASH } });
            expect(cacheOf().ops[0]).toEqual({ functionName: "shapes.cube", inputs: { geometry: { type: "jscad-geometry", hash: CACHED_HASH } } });
        });

        it("should leave a reference nested deep in the posted inputs as it was", () => {
            // Arrange
            const inputs = { groups: [{ items: [5, { type: "jscad-geometry", hash: CACHED_HASH }] }] };

            // Act
            run({ functionName: "shapes.cube", inputs });

            // Assert
            expect(inputs).toEqual({ groups: [{ items: [5, { type: "jscad-geometry", hash: CACHED_HASH }] }] });
        });

        it("should cache a call to a listed operation under its references and defaults, not the geometry they stand for", () => {
            // Act
            run({ functionName: "shapes.sphere", inputs: { center: REFERENCE } });

            // Assert
            expect(JSON.stringify(cacheOf().ops[0])).toBe(JSON.stringify({ functionName: "shapes.sphere", inputs: { radius: 1, segments: 32, center: REFERENCE } }));
            expect(answer().result).toEqual({ made: "sphere", from: { radius: 1, segments: 32, center: CACHED_GEOMETRY } });
        });

        it("should fail the call when the hashed input is no longer cached", () => {
            // Act
            run({ functionName: "shapes.cube", inputs: { geometry: { type: "jscad-geometry", hash: MISSING_HASH } } });

            // Assert
            expect(answer().error).toContain(`Geometry with hash ${MISSING_HASH} not found in cache`);
        });

        it("should replace every hashed geometry in a list", () => {
            // Act
            run({
                functionName: "shapes.cube",
                inputs: { geometries: [REFERENCE, REFERENCE] },
            });

            // Assert
            expect(answer().result).toEqual({
                made: "cube",
                from: { geometries: [CACHED_GEOMETRY, CACHED_GEOMETRY] },
            });
        });

        it("should fail the call when one geometry in a list is no longer cached", () => {
            // Act
            run({
                functionName: "shapes.cube",
                inputs: { geometries: [REFERENCE, { type: "jscad-geometry", hash: MISSING_HASH }] },
            });

            // Assert
            expect(answer().error).toContain(`Geometry with hash ${MISSING_HASH} not found in cache`);
        });

        it("should replace every hashed geometry in a list of lists", () => {
            // Act
            run({
                functionName: "shapes.cube",
                inputs: { geometries: [[REFERENCE], [REFERENCE]] },
            });

            // Assert
            expect(answer().result).toEqual({
                made: "cube",
                from: { geometries: [[CACHED_GEOMETRY], [CACHED_GEOMETRY]] },
            });
        });

        it("should fail the call when one geometry in a list of lists is no longer cached", () => {
            // Act
            run({
                functionName: "shapes.cube",
                inputs: { geometries: [[{ type: "jscad-geometry", hash: MISSING_HASH }]] },
            });

            // Assert
            expect(answer().error).toContain(`Geometry with hash ${MISSING_HASH} not found in cache`);
        });

        it("should leave a list that holds no geometry alone", () => {
            // Act
            run({ functionName: "shapes.cube", inputs: { sizes: [1, 2, 3] } });

            // Assert
            expect(answer().result).toEqual({ made: "cube", from: { sizes: [1, 2, 3] } });
        });

        it("should leave an empty list alone", () => {
            // Act
            run({ functionName: "shapes.cube", inputs: { sizes: [] } });

            // Assert
            expect(answer().result).toEqual({ made: "cube", from: { sizes: [] } });
        });
    });

    describe("startedTheRun", () => {
        it("should answer with an empty result", () => {
            // Act
            run({ functionName: "startedTheRun", inputs: {} });

            // Assert
            expect(answer().result).toEqual({});
        });

        it("should keep the cache while it is a manageable size", () => {
            // Act
            run({ functionName: "startedTheRun", inputs: {} });

            // Assert
            expect(cacheOf().cleanAllCacheCalls).toBe(0);
        });

        it("should keep the cache when it holds exactly as many hashes as the threshold", () => {
            // Arrange
            cacheOf().usedHashes = Object.fromEntries(Array.from({ length: 10000 }, (_, index) => [index, index]));

            // Act
            run({ functionName: "startedTheRun", inputs: {} });

            // Assert
            expect(cacheOf().cleanAllCacheCalls).toBe(0);
        });

        it("should drop the whole cache once it has outgrown the run", () => {
            // Arrange
            cacheOf().usedHashes = Object.fromEntries(Array.from({ length: 10001 }, (_, index) => [index, index]));

            // Act
            run({ functionName: "startedTheRun", inputs: {} });

            // Assert
            expect(cacheOf().cleanAllCacheCalls).toBe(1);
        });
    });

    describe("cleanAllCache", () => {
        it("should drop the cache and answer with an empty result", () => {
            // Act
            run({ functionName: "cleanAllCache", inputs: {} });

            // Assert
            expect(cacheOf().cleanAllCacheCalls).toBe(1);
            expect(answer().result).toEqual({});
        });
    });

    describe("when the call fails", () => {
        it("should name the function that failed", () => {
            // Act
            run({ functionName: "shapes.nothingLikeThis", inputs: { size: 1 } });

            // Assert
            expect(answer().error).toContain("JSCAD computation failed while executing function 'shapes.nothingLikeThis'");
        });

        it("should repeat the inputs it was given", () => {
            // Act
            run({ functionName: "shapes.nothingLikeThis", inputs: { size: 1 } });

            // Assert
            expect(answer().error).toContain("Input values were: {size: 1}");
        });

        it("should answer without a result", () => {
            // Act
            run({ functionName: "shapes.nothingLikeThis", inputs: { size: 1 } });

            // Assert
            expect(answer().result).toBeUndefined();
        });

        it("should still answer when the call named no function", () => {
            // Act
            run({ inputs: { size: 1 } });

            // Assert
            expect(answer().error).toContain("JSCAD computation failed: ");
        });

        it("should still answer when there are no inputs to repeat", () => {
            // Act
            run({ functionName: "shapes.nothingLikeThis", inputs: undefined });

            // Assert
            expect(answer().error).toContain("JSCAD computation failed while executing function 'shapes.nothingLikeThis'");
        });

        it("should describe a kernel failure with the inputs as the call posted them, not with the defaults laid under them", () => {
            // Act
            run({ functionName: "shapes.fail", inputs: { radius: 2 } });

            // Assert
            expect(answer().error).toBe("JSCAD computation failed while executing function 'shapes.fail': the kernel refused. Input values were: {radius: 2}.");
            expect(answer().errorKind).toBe("kernel");
        });

        it("should send the stack apart from the message", () => {
            // Arrange
            const refused = new Error("the kernel refused");
            failure.value = refused;

            // Act
            run({ functionName: "boom", inputs: {} });

            // Assert
            expect(answer()).toEqual({
                uid: "uid-1",
                result: undefined,
                error: "JSCAD computation failed while executing function 'boom': the kernel refused.",
                errorKind: "kernel",
                stack: refused.stack,
            });
        });

        it("should send the code of a failure the kernel named beside its message", () => {
            // Arrange
            const refused = new KernelOperationError("jscad.boolean.failed", "The union could not be computed.", { shapes: [1] });
            failure.value = refused;

            // Act
            run({ functionName: "boom", inputs: {} });

            // Assert
            expect(answer()).toEqual({
                uid: "uid-1",
                result: undefined,
                error: "JSCAD computation failed while executing function 'boom': The union could not be computed.",
                errorKind: "kernel",
                code: "jscad.boolean.failed",
                details: { shapes: [1] },
                stack: refused.stack,
            });
        });

        it("should describe an input error by the path and its own message, as a failure of the inputs", () => {
            // Arrange
            const refused = new InputError("radius must be positive", "radius");
            failure.value = refused;

            // Act
            run({ functionName: "boom", inputs: { radius: -1 } });

            // Assert
            expect(answer()).toEqual({
                uid: "uid-1",
                result: undefined,
                error: "boom: radius must be positive",
                errorKind: "input",
                stack: refused.stack,
            });
        });

        it("should describe bytes and buffers by their size rather than write them out", () => {
            // Act
            run({ functionName: "boom", inputs: { data: new Uint8Array([7, 8, 9]), buffer: new ArrayBuffer(4) } });

            // Assert
            expect(answer().error).toBe("JSCAD computation failed while executing function 'boom': the kernel refused. Input values were: {data: [Uint8Array length=3], buffer: [ArrayBuffer byteLength=4]}.");
        });

        it("should describe a thrown value that has no text form and that JSON cannot write", () => {
            // Arrange
            const bare: Record<string, unknown> = Object.create(null);
            bare["self"] = bare;
            failure.value = bare;

            // Act
            run({ functionName: "boom", inputs: {} });

            // Assert
            expect(answer().error).toBe("JSCAD computation failed while executing function 'boom': [object Object].");
        });

        it("should still answer, naming the call, when the failure cannot be sent back", () => {
            // Arrange
            const sent: unknown[] = [];
            const post = (message: unknown): void => {
                if (typeof message === "object" && message !== null && "stack" in message) {
                    throw new Error("the channel refused");
                }
                sent.push(message);
            };

            // Act
            onMessageInput({ action: { functionName: "boom", inputs: {} }, uid: "uid-9" }, post);

            // Assert
            expect(sent).toEqual(["busy", { uid: "uid-9", result: undefined, error: "JSCAD 'boom' failed, and the failure could not be reported.", errorKind: "kernel" }]);
        });

        it("should say only that the computation failed when the call names no function", () => {
            // Arrange
            const sent: unknown[] = [];
            const post = (message: unknown): void => {
                if (typeof message === "object" && message !== null && "stack" in message) {
                    throw new Error("the channel refused");
                }
                sent.push(message);
            };

            // Act
            onMessageInput({ action: { functionName: "", inputs: {} }, uid: "uid-9" }, post);

            // Assert
            expect(sent).toEqual(["busy", { uid: "uid-9", result: undefined, error: "JSCAD computation failed, and the failure could not be reported.", errorKind: "kernel" }]);
        });

        it("should answer a failure that threw no Error by what it threw", () => {
            // Arrange
            failure.value = "Standard_ConstructionError";

            // Act
            run({ functionName: "boom", inputs: {} });

            // Assert
            expect(answer()).toEqual({
                uid: "uid-1",
                result: undefined,
                error: "JSCAD computation failed while executing function 'boom': Standard_ConstructionError.",
                errorKind: "kernel",
                stack: undefined,
            });
        });
    });

    describe("kernel objects the cache holds", () => {
        it("should hand the cached object on rather than a copy of it", () => {
            // Arrange
            const cached: Deletable = { delete: () => undefined };
            cacheOf().entries.set("kernel-object", cached);

            // Act
            run({ functionName: "shapes.cube", inputs: { geometry: { type: "jscad-geometry", hash: "kernel-object" } } });

            // Assert
            expect((answer().result as { from: { geometry: unknown } }).from.geometry).toBe(cached);
        });
    });
});
