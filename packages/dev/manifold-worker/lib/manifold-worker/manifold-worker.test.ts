import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { DataInput, initializationComplete, onMessageInput } from "./manifold-worker";

// The worker's own message loop, with the cache and the kernel standing in for the real ones. Both
// are mocked here so that every path the loop can take is reachable: the reserved commands it answers
// itself, the three dotted-path depths, a hash that is in the cache and one that is not, and the
// three shapes a kernel answer can arrive in. The suite beside this one runs the same loop against
// the real kernel wrapper.

// The cache the worker builds for itself, replaced by one this suite can set up and read back. It is
// declared before the mock so that the mock factory, which is hoisted above the imports, can reach
// it: whatever the worker constructs lands in `latest`.
const { FakeCacheHelper, latest, kernelCalls } = vi.hoisted(() => {
    class FakeCacheHelper {
        usedHashes: Record<string, string | number> = {};
        entries = new Map<string | number, unknown>();
        added: [string | number, unknown][] = [];
        cleanedHashes: (string | number)[] = [];
        cleanAllCacheCalls = 0;

        checkCache(hash: string | number): unknown {
            return this.entries.has(hash) ? this.entries.get(hash) : null;
        }

        cacheOp(_action: unknown, cacheMiss: () => unknown): unknown {
            return cacheMiss();
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
    return { FakeCacheHelper, latest, kernelCalls };
});

vi.mock("./cache-helper", () => ({
    CacheHelper: class extends FakeCacheHelper {
        constructor() {
            super();
            latest.cache = this;
        }
    },
}));

// The kernel wrapper, answering with whatever the test set up for the path that was called. A kernel
// built without plugin support is one the worker has to tolerate, so whether this one carries any is
// something a test can decide before it constructs one.
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
            shapes: { cube: call("manifold.shapes.cube") },
            booleans: { subtract: call("manifold.booleans.subtract") },
        };
        decomposeManifoldOrCrossSection = call("decomposeManifoldOrCrossSection");
        decomposeManifoldsOrCrossSections = call("decomposeManifoldsOrCrossSections");
        toPolygonPoints = call("toPolygonPoints");
    }
    return { ManifoldService };
});

const cacheOf = () => latest.cache;
const A_KERNEL = { Manifold: {} };
const CACHED_HASH = "cached";
const MISSING_HASH = "missing";

describe("the worker message loop", () => {
    let messages: unknown[];
    let posted: unknown[];

    const run = (action: { functionName?: string; inputs?: unknown }, uid = "uid-1"): void => {
        onMessageInput({ action, uid } as DataInput, (message: unknown) => messages.push(message));
    };

    const answer = (): { uid?: string; result?: unknown; error?: string } =>
        messages[1] as { uid?: string; result?: unknown; error?: string };

    beforeEach(() => {
        messages = [];
        posted = [];
        kernelCalls.length = 0;
        answers.clear();
        kernel.hasPlugins = true;
        kernel.dependencies = {};
        vi.stubGlobal("postMessage", (message: unknown) => posted.push(message));
        initializationComplete(A_KERNEL, undefined, true);
        cacheOf().entries.set(CACHED_HASH, { hash: CACHED_HASH, kernel: "shape" });
    });

    afterEach(() => {
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
            expect(answer().error).toContain("While executing function - manifold.shapes.nothingLikeThis");
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
    });
});
