import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { InputError, InputIssueReport, setInputIssueSink } from "@bitbybit-dev/base";
import { DataInput, initializationComplete, onMessageInput } from "./manifold-worker";

const { FakeCacheHelper, latest, kernelCalls, failure } = vi.hoisted(() => {
    class FakeCacheHelper {
        usedHashes: Record<string, string | number> = {};
        entries = new Map<string | number, unknown>();
        added: [string | number, unknown][] = [];
        cleanedHashes: (string | number)[] = [];
        cleanAllCacheCalls = 0;
        stored = new Map<string, unknown>();

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

        cleanCacheForHash(hash: string | number): void {
            this.cleanedHashes.push(hash);
        }

        cleanAllCache(): void {
            this.cleanAllCacheCalls += 1;
        }

        computeHash(): string {
            return "computed-hash";
        }

        addToCache(hash: string | number, value: unknown): void {
            this.added.push([hash, value]);
        }

        isManifoldObject(value: unknown): boolean {
            return Array.isArray(value)
                ? value.length > 0 && typeof value[0] === "object" && (value[0] as { hash?: unknown }).hash !== undefined
                : typeof value === "object" && value !== null && (value as { hash?: unknown }).hash !== undefined;
        }
    }
    const latest = { cache: new FakeCacheHelper() };
    const kernelCalls: { path: string; inputs: unknown }[] = [];
    const failure: { value: unknown } = { value: undefined };
    return { FakeCacheHelper, latest, kernelCalls, failure };
});

vi.mock("./cache-helper", () => ({
    CacheHelper: class extends FakeCacheHelper {
        constructor() {
            super();
            latest.cache = this;
        }
    },
}));

const { answers, kernel } = vi.hoisted(() => {
    const kernel: { hasPlugins: boolean; dependencies: Record<string, string> } = { hasPlugins: true, dependencies: {} };
    return { answers: new Map<string, unknown>(), kernel };
});

vi.mock("@bitbybit-dev/manifold", () => {
    const call = (path: string) => (inputs: unknown) => {
        kernelCalls.push({ path, inputs });
        return answers.has(path) ? answers.get(path) : { hash: `${path}-result` };
    };
    class ManifoldService {
        plugins = kernel.hasPlugins ? { dependencies: kernel.dependencies } : undefined;
        manifold = {
            manifoldToMesh: call("manifold.manifoldToMesh"),
            shapes: { cube: call("manifold.shapes.cube"), sphere: call("manifold.shapes.sphere"), fail: (): unknown => { throw failure.value; } },
            booleans: { subtract: call("manifold.booleans.subtract") },
        };
        measure = {
            unit: 10,
            scaled(this: { unit: number }, inputs: { size: number }): number {
                return this.unit * inputs.size;
            },
        };
        boom = (): unknown => { throw failure.value; };
        decomposeManifoldOrCrossSection = call("decomposeManifoldOrCrossSection");
        decomposeManifoldsOrCrossSections = call("decomposeManifoldsOrCrossSections");
        toPolygonPoints = call("toPolygonPoints");
    }
    class SphereDto {
        radius = 1;
        circularSegments = 32;
    }
    const constraints = { radius: { kind: "number" }, circularSegments: { kind: "number", required: true } };
    return { ManifoldService, manifoldDtoRegistry: { "manifold.shapes.sphere": { dto: SphereDto, constraints }, "manifold.shapes.fail": { dto: SphereDto, constraints } } };
});

const cacheOf = () => latest.cache;
const A_KERNEL = { Manifold: {} };
const CACHED_HASH = "cached";
const MISSING_HASH = "missing";
const REFERENCE = { type: "manifold-shape", hash: CACHED_HASH };
const CACHED_SHAPE = { hash: CACHED_HASH, kernel: "shape" };

type Answer = { uid?: string; result?: unknown; error?: string; errorKind?: string; stack?: string };

describe("the worker message loop", () => {
    let messages: unknown[];
    let posted: unknown[];

    const run = (action: { functionName?: string; inputs?: unknown }, uid = "uid-1"): void => {
        onMessageInput({ action, uid } as DataInput, (message: unknown) => messages.push(message));
    };

    const answer = (): Answer => messages[1] as Answer;

    beforeEach(() => {
        messages = [];
        posted = [];
        kernelCalls.length = 0;
        answers.clear();
        kernel.hasPlugins = true;
        kernel.dependencies = {};
        failure.value = new Error("the kernel refused");
        vi.stubGlobal("postMessage", (message: unknown) => posted.push(message));
        setInputIssueSink(() => undefined);
        initializationComplete(A_KERNEL, undefined, true);
        cacheOf().entries.set(CACHED_HASH, CACHED_SHAPE);
    });

    afterEach(() => {
        setInputIssueSink();
        vi.unstubAllGlobals();
    });

    describe("initializationComplete", () => {
        it("should announce itself to the host that started it", () => {
            // Act
            initializationComplete(A_KERNEL);

            // Assert
            expect(posted).toEqual(["manifold-initialised"]);
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
            run({ functionName: "manifold.shapes.cube", inputs: {} });

            // Assert
            expect(messages[0]).toBe("busy");
        });

        it("should answer under the uid the call arrived with", () => {
            // Act
            run({ functionName: "manifold.shapes.cube", inputs: {} }, "uid-7");

            // Assert
            expect(answer().uid).toBe("uid-7");
        });

        it("should call the kernel method a three part path names", () => {
            // Act
            run({ functionName: "manifold.shapes.cube", inputs: { size: 1 } });

            // Assert
            expect(kernelCalls).toEqual([{ path: "manifold.shapes.cube", inputs: { size: 1 } }]);
        });

        it("should call the kernel method a two part path names", () => {
            // Act
            run({ functionName: "manifold.manifoldToMesh", inputs: { size: 1 } });

            // Assert
            expect(kernelCalls).toEqual([{ path: "manifold.manifoldToMesh", inputs: { size: 1 } }]);
        });

        it("should call the kernel method a one part path names", () => {
            // Act
            run({ functionName: "toPolygonPoints", inputs: { size: 1 } });

            // Assert
            expect(kernelCalls).toEqual([{ path: "toPolygonPoints", inputs: { size: 1 } }]);
        });

        it("should call the kernel method with the object that holds it as this", () => {
            // Act
            run({ functionName: "measure.scaled", inputs: { size: 3 } });

            // Assert
            expect(answer()).toEqual({ uid: "uid-1", result: 30 });
        });

        it("should answer a call the cache already holds without running the kernel again", () => {
            // Arrange
            run({ functionName: "manifold.shapes.sphere", inputs: { radius: 2 } }, "uid-1");

            // Act
            run({ functionName: "manifold.shapes.sphere", inputs: { radius: 2 } }, "uid-2");

            // Assert
            expect(kernelCalls).toEqual([{ path: "manifold.shapes.sphere", inputs: { radius: 2, circularSegments: 32 } }]);
            expect(messages[3]).toEqual({ uid: "uid-2", result: { hash: "manifold.shapes.sphere-result", type: "manifold-shape" } });
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
                error: "Manifold computation failed while executing function 'constructor': Cannot resolve \"constructor\": \"constructor\" is not a segment an operation path may contain.",
                errorKind: "kernel",
                stack: expect.stringContaining("is not a segment an operation path may contain"),
            });
        });

        it("should refuse a path that walks through an object's prototype", () => {
            // Act
            run({ functionName: "manifold.__proto__.hasOwnProperty", inputs: {} });

            // Assert
            expect(answer().error).toBe("Manifold computation failed while executing function 'manifold.__proto__.hasOwnProperty': Cannot resolve \"manifold.__proto__.hasOwnProperty\": \"__proto__\" is not a segment an operation path may contain.");
        });

        it("should refuse a path with an empty segment", () => {
            // Act
            run({ functionName: "manifold..shapes.cube", inputs: {} });

            // Assert
            expect(answer().error).toBe("Manifold computation failed while executing function 'manifold..shapes.cube': Cannot resolve \"manifold..shapes.cube\": \"\" is not a segment an operation path may contain.");
        });

        it("should refuse a path that walks into a method as though it held others", () => {
            // Act
            run({ functionName: "manifold.shapes.cube.call", inputs: {} });

            // Assert
            expect(answer().error).toBe("Manifold computation failed while executing function 'manifold.shapes.cube.call': Cannot resolve \"manifold.shapes.cube.call\": \"manifold.shapes.cube\" is not an object.");
            expect(kernelCalls).toEqual([]);
        });

        it("should refuse a path whose last segment is not a method", () => {
            // Act
            run({ functionName: "measure.unit", inputs: {} });

            // Assert
            expect(answer().error).toBe("Manifold computation failed while executing function 'measure.unit': \"measure.unit\" is not a function.");
        });
    });

    describe("the shape of the answer", () => {
        it("should send back a kernel shape as its hash and type", () => {
            // Act
            run({ functionName: "manifold.shapes.cube", inputs: {} });

            // Assert
            expect(answer().result).toEqual({ hash: "manifold.shapes.cube-result", type: "manifold-shape" });
        });

        it("should send back a list of kernel shapes as their hashes and types", () => {
            // Arrange
            answers.set("manifold.shapes.cube", [{ hash: "one" }, { hash: "two" }]);

            // Act
            run({ functionName: "manifold.shapes.cube", inputs: {} });

            // Assert
            expect(answer().result).toEqual([
                { hash: "one", type: "manifold-shape" },
                { hash: "two", type: "manifold-shape" },
            ]);
        });

        it("should send back a plain value as it stands", () => {
            // Arrange
            answers.set("manifold.shapes.cube", 42);

            // Act
            run({ functionName: "manifold.shapes.cube", inputs: {} });

            // Assert
            expect(answer().result).toBe(42);
        });

        it("should replace the shapes inside a compound answer with their hashes", () => {
            // Arrange
            answers.set("manifold.shapes.cube", {
                compound: { hash: "compound-hash", kernel: "shape" },
                data: { name: "assembly" },
                manifolds: [{ id: "part-1", manifold: { hash: "part-hash", kernel: "shape" } }],
            });

            // Act
            run({ functionName: "manifold.shapes.cube", inputs: {} });

            // Assert
            expect(answer().result).toEqual({
                compound: { hash: "compound-hash", type: "manifold-shape" },
                data: { name: "assembly" },
                manifolds: [{ id: "part-1", manifold: { hash: "part-hash", type: "manifold-shape" } }],
            });
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

        it("should report a property of the wrong kind and a name the operation does not know, and still run", () => {
            // Act
            run({ functionName: "manifold.shapes.sphere", inputs: { radius: "big", radious: 2 } });

            // Assert
            expect(reports).toEqual([
                { kernel: "Manifold", path: "manifold.shapes.sphere", issue: { property: "radius", code: "type", message: "must be a number" } },
                { kernel: "Manifold", path: "manifold.shapes.sphere", issue: { property: "radious", code: "unknown-property", message: "is not an input of this operation and is ignored" } },
            ]);
            expect(kernelCalls).toEqual([{ path: "manifold.shapes.sphere", inputs: { radius: "big", circularSegments: 32, radious: 2 } }]);
        });

        it("should check the inputs with the defaults laid under them, so a required property the DTO defaults is not missing", () => {
            // Act
            run({ functionName: "manifold.shapes.sphere", inputs: {} });

            // Assert
            expect(reports).toEqual([]);
        });

        it("should report a name the operation does not know even when the call passed it as undefined", () => {
            // Act
            run({ functionName: "manifold.shapes.sphere", inputs: { radius: 2, radious: undefined } });

            // Assert
            expect(reports).toEqual([
                { kernel: "Manifold", path: "manifold.shapes.sphere", issue: { property: "radious", code: "unknown-property", message: "is not an input of this operation and is ignored" } },
            ]);
        });

        it("should not check again a call the cache already holds", () => {
            // Arrange
            run({ functionName: "manifold.shapes.sphere", inputs: { radius: "big" } }, "uid-1");
            const afterTheHit: InputIssueReport[] = [];
            setInputIssueSink((report) => afterTheHit.push(report));

            // Act
            run({ functionName: "manifold.shapes.sphere", inputs: { radius: "big" } }, "uid-2");

            // Assert
            expect(reports).toEqual([{ kernel: "Manifold", path: "manifold.shapes.sphere", issue: { property: "radius", code: "type", message: "must be a number" } }]);
            expect(afterTheHit).toEqual([]);
        });

        it("should check a call that misses the cache even when an earlier one was reported", () => {
            // Arrange
            run({ functionName: "manifold.shapes.sphere", inputs: { radius: "big" } }, "uid-1");
            const afterTheMiss: InputIssueReport[] = [];
            setInputIssueSink((report) => afterTheMiss.push(report));

            // Act
            run({ functionName: "manifold.shapes.sphere", inputs: { radius: "bigger" } }, "uid-2");

            // Assert
            expect(afterTheMiss).toEqual([{ kernel: "Manifold", path: "manifold.shapes.sphere", issue: { property: "radius", code: "type", message: "must be a number" } }]);
        });

        it("should report nothing for an operation the registry does not list", () => {
            // Act
            run({ functionName: "manifold.shapes.cube", inputs: { anything: "goes" } });

            // Assert
            expect(reports).toEqual([]);
        });
    });

    describe("the defaults of the DTO an operation takes", () => {
        it("should give a property the call left out its default", () => {
            // Act
            run({ functionName: "manifold.shapes.sphere", inputs: { radius: 3 } });

            // Assert
            expect(kernelCalls[0]?.inputs).toEqual({ radius: 3, circularSegments: 32 });
        });

        it("should give a property the call passed as undefined its default", () => {
            // Act
            run({ functionName: "manifold.shapes.sphere", inputs: { radius: undefined } });

            // Assert
            expect(kernelCalls[0]?.inputs).toEqual({ radius: 1, circularSegments: 32 });
        });

        it("should cache a call that leaves defaults out under the same inputs as one that spells them", () => {
            // Act
            run({ functionName: "manifold.shapes.sphere", inputs: {} }, "uid-1");
            run({ functionName: "manifold.shapes.sphere", inputs: { circularSegments: 32, radius: 1 } }, "uid-2");

            // Assert
            expect(JSON.stringify(cacheOf().ops[0])).toBe(JSON.stringify(cacheOf().ops[1]));
        });

        it("should pass the inputs of an operation the registry does not list through as they are", () => {
            // Act
            run({ functionName: "manifold.shapes.cube", inputs: { size: 2 } });

            // Assert
            expect(kernelCalls[0]?.inputs).toEqual({ size: 2 });
        });

        it("should cache a call under its inputs with every default spelled out", () => {
            // Act
            run({ functionName: "manifold.shapes.sphere", inputs: { radius: 3 } });

            // Assert
            expect(JSON.stringify(cacheOf().ops[0])).toBe(JSON.stringify({ functionName: "manifold.shapes.sphere", inputs: { radius: 3, circularSegments: 32 } }));
        });

        it("should cache a call that passes a property as undefined under the fully spelled inputs", () => {
            // Act
            run({ functionName: "manifold.shapes.sphere", inputs: { radius: undefined, circularSegments: 32 } });

            // Assert
            expect(JSON.stringify(cacheOf().ops[0])).toBe(JSON.stringify({ functionName: "manifold.shapes.sphere", inputs: { radius: 1, circularSegments: 32 } }));
        });

        it("should run the kernel once for a call that leaves defaults out and one that spells them", () => {
            // Arrange
            run({ functionName: "manifold.shapes.sphere", inputs: { radius: 1, circularSegments: 32 } }, "uid-1");

            // Act
            run({ functionName: "manifold.shapes.sphere", inputs: { circularSegments: undefined } }, "uid-2");

            // Assert
            expect(kernelCalls).toHaveLength(1);
        });
    });

    describe("resolving hashed shapes against the cache", () => {
        it("should replace a hashed input with the shape the cache holds", () => {
            // Act
            run({ functionName: "manifold.shapes.cube", inputs: { shape: { type: "manifold-shape", hash: CACHED_HASH } } });

            // Assert
            expect(kernelCalls[0]?.inputs).toEqual({ shape: { hash: CACHED_HASH, kernel: "shape" } });
        });

        it("should fail the call when the hashed input is no longer cached", () => {
            // Act
            run({ functionName: "manifold.shapes.cube", inputs: { shape: { type: "manifold-shape", hash: MISSING_HASH } } });

            // Assert
            expect(answer().error).toContain(`Manifold with hash ${MISSING_HASH} not found in cache`);
        });

        it("should replace every hashed shape in a list", () => {
            // Act
            run({
                functionName: "manifold.shapes.cube",
                inputs: { shapes: [{ type: "manifold-shape", hash: CACHED_HASH }, { type: "manifold-shape", hash: CACHED_HASH }] },
            });

            // Assert
            expect(kernelCalls[0]?.inputs).toEqual({
                shapes: [{ hash: CACHED_HASH, kernel: "shape" }, { hash: CACHED_HASH, kernel: "shape" }],
            });
        });

        it("should fail the call when one shape in a list is no longer cached", () => {
            // Act
            run({
                functionName: "manifold.shapes.cube",
                inputs: { shapes: [{ type: "manifold-shape", hash: MISSING_HASH }] },
            });

            // Assert
            expect(answer().error).toContain(`Manifold with hash ${MISSING_HASH} not found in cache`);
        });

        it("should replace every hashed shape in a list of lists", () => {
            // Act
            run({
                functionName: "manifold.shapes.cube",
                inputs: { shapes: [[{ type: "manifold-shape", hash: CACHED_HASH }]] },
            });

            // Assert
            expect(kernelCalls[0]?.inputs).toEqual({ shapes: [[{ hash: CACHED_HASH, kernel: "shape" }]] });
        });

        it("should replace a hashed shape nested inside an object", () => {
            // Act
            run({ functionName: "manifold.shapes.cube", inputs: { options: { target: { type: "manifold-shape", hash: CACHED_HASH } } } });

            // Assert
            expect(kernelCalls[0]?.inputs).toEqual({ options: { target: { hash: CACHED_HASH, kernel: "shape" } } });
        });

        it("should replace a hashed shape nested in a list inside an object inside a list", () => {
            // Act
            run({ functionName: "manifold.shapes.cube", inputs: { groups: [{ items: [5, REFERENCE] }] } });

            // Assert
            expect(kernelCalls[0]?.inputs).toEqual({ groups: [{ items: [5, CACHED_SHAPE] }] });
        });

        it("should replace a reference whose hash is a number", () => {
            // Arrange
            cacheOf().entries.set(42, { hash: 42, kernel: "numbered" });

            // Act
            run({ functionName: "manifold.shapes.cube", inputs: { shape: { type: "manifold-shape", hash: 42 } } });

            // Assert
            expect(kernelCalls[0]?.inputs).toEqual({ shape: { hash: 42, kernel: "numbered" } });
        });

        it("should leave a reference nested deep in the posted inputs as it was", () => {
            // Arrange
            const inputs = { groups: [{ items: [5, { type: "manifold-shape", hash: CACHED_HASH }] }] };

            // Act
            run({ functionName: "manifold.shapes.cube", inputs });

            // Assert
            expect(inputs).toEqual({ groups: [{ items: [5, { type: "manifold-shape", hash: CACHED_HASH }] }] });
        });

        it("should cache a call to a listed operation under its references and defaults, not the shapes they stand for", () => {
            // Act
            run({ functionName: "manifold.shapes.sphere", inputs: { around: REFERENCE } });

            // Assert
            expect(JSON.stringify(cacheOf().ops[0])).toBe(JSON.stringify({ functionName: "manifold.shapes.sphere", inputs: { radius: 1, circularSegments: 32, around: REFERENCE } }));
            expect(kernelCalls[0]?.inputs).toEqual({ radius: 1, circularSegments: 32, around: CACHED_SHAPE });
        });

        it("should replace a hashed shape that is not the first item of its list", () => {
            // Act
            run({ functionName: "manifold.shapes.cube", inputs: { items: [5, { type: "manifold-shape", hash: CACHED_HASH }] } });

            // Assert
            expect(kernelCalls[0]?.inputs).toEqual({ items: [5, { hash: CACHED_HASH, kernel: "shape" }] });
        });

        it("should leave the posted inputs as they were and cache the call under them", () => {
            // Arrange
            const inputs = { shape: { type: "manifold-shape", hash: CACHED_HASH } };

            // Act
            run({ functionName: "manifold.shapes.cube", inputs });

            // Assert
            expect(inputs).toEqual({ shape: { type: "manifold-shape", hash: CACHED_HASH } });
            expect(cacheOf().ops[0]).toEqual({ functionName: "manifold.shapes.cube", inputs: { shape: { type: "manifold-shape", hash: CACHED_HASH } } });
        });

        it("should fail the call when one shape in a list of lists is no longer cached", () => {
            // Act
            run({
                functionName: "manifold.shapes.cube",
                inputs: { shapes: [[{ type: "manifold-shape", hash: MISSING_HASH }]] },
            });

            // Assert
            expect(answer().error).toContain(`Manifold with hash ${MISSING_HASH} not found in cache`);
        });

        it("should leave a list that holds no shape alone", () => {
            // Act
            run({ functionName: "manifold.shapes.cube", inputs: { sizes: [1, 2, 3] } });

            // Assert
            expect(kernelCalls[0]?.inputs).toEqual({ sizes: [1, 2, 3] });
        });

        it("should leave an empty list alone", () => {
            // Act
            run({ functionName: "manifold.shapes.cube", inputs: { sizes: [] } });

            // Assert
            expect(kernelCalls[0]?.inputs).toEqual({ sizes: [] });
        });
    });

    describe("addManifoldPluginDependency", () => {
        it("should call no kernel method", () => {
            // Act
            run({ functionName: "addManifoldPluginDependency", inputs: { drawing: "a-plugin" } });

            // Assert
            expect(kernelCalls).toEqual([]);
        });

        it("should hand the dependency to the kernel's plugins", () => {
            // Act
            run({ functionName: "addManifoldPluginDependency", inputs: { drawing: "a-plugin" } });

            // Assert
            expect(kernel.dependencies).toEqual({ drawing: "a-plugin" });
        });

        it("should answer without a result", () => {
            // Act
            run({ functionName: "addManifoldPluginDependency", inputs: { drawing: "a-plugin" } });

            // Assert
            expect(answer().result).toBeUndefined();
        });

        it("should answer a kernel that takes no plugins rather than fail", () => {
            // Arrange
            kernel.hasPlugins = false;
            initializationComplete(A_KERNEL, undefined, true);

            // Act
            run({ functionName: "addManifoldPluginDependency", inputs: { drawing: "a-plugin" } });

            // Assert
            expect(answer().error).toBeUndefined();
            expect(kernel.dependencies).toEqual({});
        });
    });

    describe("manifoldToMesh", () => {
        it("should decompose the shape the cache holds", () => {
            // Arrange
            answers.set("decomposeManifoldOrCrossSection", { vertices: [] });

            // Act
            run({ functionName: "manifoldToMesh", inputs: { manifold: { hash: CACHED_HASH } } });

            // Assert
            expect(answer().result).toEqual({ vertices: [] });
        });

        it("should fail the call when the shape is no longer cached", () => {
            // Act
            run({ functionName: "manifoldToMesh", inputs: { manifold: { hash: MISSING_HASH } } });

            // Assert
            expect(answer().error).toContain(`Manifold with hash ${MISSING_HASH} not found in cache`);
        });
    });

    describe("manifoldToMeshPointer", () => {
        it("should answer with the hash it cached the mesh under", () => {
            // Act
            run({ functionName: "manifoldToMeshPointer", inputs: { manifold: { hash: CACHED_HASH } } });

            // Assert
            expect(answer().result).toEqual({ hash: "computed-hash", type: "manifold-shape" });
        });

        it("should keep the mesh in the cache under that hash", () => {
            // Act
            run({ functionName: "manifoldToMeshPointer", inputs: { manifold: { hash: CACHED_HASH } } });

            // Assert
            expect(cacheOf().added).toEqual([["computed-hash", { hash: "manifold.manifoldToMesh-result" }]]);
        });

        it("should fail the call when the shape is no longer cached", () => {
            // Act
            run({ functionName: "manifoldToMeshPointer", inputs: { manifold: { hash: MISSING_HASH } } });

            // Assert
            expect(answer().error).toContain(`Manifold with hash ${MISSING_HASH} not found in cache`);
        });
    });

    describe("manifoldsToMeshes", () => {
        it("should decompose every shape the cache holds", () => {
            // Arrange
            answers.set("decomposeManifoldsOrCrossSections", [{ vertices: [] }]);

            // Act
            run({ functionName: "manifoldsToMeshes", inputs: { manifolds: [{ hash: CACHED_HASH }] } });

            // Assert
            expect(answer().result).toEqual([{ vertices: [] }]);
        });

        it("should fail the call when one shape is no longer cached", () => {
            // Act
            run({ functionName: "manifoldsToMeshes", inputs: { manifolds: [{ hash: MISSING_HASH }] } });

            // Assert
            expect(answer().error).toContain(`Manifold with hash ${MISSING_HASH} not found in cache`);
        });

        it("should fail the call when it names no shapes at all", () => {
            // Act
            run({ functionName: "manifoldsToMeshes", inputs: { manifolds: [] } });

            // Assert
            expect(answer().error).toContain("No manifolds detected");
        });
    });

    describe("deleting shapes", () => {
        it("should drop the one shape it was asked to delete", () => {
            // Act
            run({ functionName: "deleteManifoldOrCrossSection", inputs: { manifoldOrCrossSection: { hash: CACHED_HASH } } });

            // Assert
            expect(cacheOf().cleanedHashes).toEqual([CACHED_HASH]);
            expect(answer().result).toEqual({});
        });

        it("should drop every shape it was asked to delete", () => {
            // Act
            run({ functionName: "deleteManifoldsOrCrossSections", inputs: { manifoldsOrCrossSections: [{ hash: "one" }, { hash: "two" }] } });

            // Assert
            expect(cacheOf().cleanedHashes).toEqual(["one", "two"]);
            expect(answer().result).toEqual({});
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
            run({ functionName: "manifold.shapes.nothingLikeThis", inputs: { size: 1 } });

            // Assert
            expect(answer().error).toContain("Manifold computation failed while executing function 'manifold.shapes.nothingLikeThis'");
        });

        it("should repeat the inputs it was given", () => {
            // Act
            run({ functionName: "manifold.shapes.nothingLikeThis", inputs: { size: 1 } });

            // Assert
            expect(answer().error).toContain("Input values were: {size: 1}");
        });

        it("should answer without a result", () => {
            // Act
            run({ functionName: "manifold.shapes.nothingLikeThis", inputs: { size: 1 } });

            // Assert
            expect(answer().result).toBeUndefined();
        });

        it("should still answer when the call named no function", () => {
            // Act
            run({ inputs: { size: 1 } });

            // Assert
            expect(answer().error).toContain("Manifold computation failed");
        });

        it("should still answer when there are no inputs to repeat", () => {
            // Act
            run({ functionName: "manifold.shapes.nothingLikeThis" });

            // Assert
            expect(answer().error).toContain("Manifold computation failed");
        });

        it("should describe a kernel failure with the inputs as the call posted them, not with the defaults laid under them", () => {
            // Act
            run({ functionName: "manifold.shapes.fail", inputs: { radius: 2 } });

            // Assert
            expect(answer().error).toBe("Manifold computation failed while executing function 'manifold.shapes.fail': the kernel refused. Input values were: {radius: 2}.");
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
                error: "Manifold computation failed while executing function 'boom': the kernel refused.",
                errorKind: "kernel",
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
            run({ functionName: "boom", inputs: { data: new Float32Array([7, 8, 9]), buffer: new ArrayBuffer(4) } });

            // Assert
            expect(answer().error).toBe("Manifold computation failed while executing function 'boom': the kernel refused. Input values were: {data: [Float32Array byteLength=12], buffer: [ArrayBuffer byteLength=4]}.");
        });

        it("should describe a failure of a reserved command the same way", () => {
            // Act
            run({ functionName: "manifoldToMesh", inputs: { manifold: { hash: MISSING_HASH } } });

            // Assert
            expect(answer()).toEqual({
                uid: "uid-1",
                result: undefined,
                error: `Manifold computation failed while executing function 'manifoldToMesh': Manifold with hash ${MISSING_HASH} not found in cache. The cache may have been cleaned. Please regenerate the manifold.. Input values were: {manifold: {"hash":"${MISSING_HASH}"}}.`,
                errorKind: "kernel",
                stack: expect.stringContaining("not found in cache"),
            });
        });
    });
});
