import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { DataInput, initializationComplete, onMessageInput } from "./jscad-worker";

type Deletable = { delete: () => void };

const { FakeCacheHelper, latest } = vi.hoisted(() => {
    class FakeCacheHelper {
        usedHashes: Record<string, string | number> = {};
        entries = new Map<string | number, unknown>();
        cleanAllCacheCalls = 0;

        checkCache(hash: string | number): unknown {
            return this.entries.has(hash) ? this.entries.get(hash) : null;
        }

        cacheOp(_action: unknown, cacheMiss: () => unknown): unknown {
            return cacheMiss();
        }

        cleanAllCache(): void {
            this.cleanAllCacheCalls += 1;
        }
    }
    const latest = { cache: new FakeCacheHelper() };
    return { FakeCacheHelper, latest };
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
        shapes = { cube: (inputs: unknown) => ({ made: "cube", from: inputs }) };
        toPolygonPoints = (inputs: unknown) => ({ made: "points", from: inputs });
    }
    return { Jscad };
});

const cacheOf = () => latest.cache;

const A_KERNEL = { primitives: {} };
const CACHED_HASH = "cached";
const MISSING_HASH = "missing";

describe("the worker message loop", () => {
    let answers: unknown[];
    let posted: unknown[];

    const run = (action: { functionName?: string; inputs?: unknown }, uid = "uid-1"): void => {
        onMessageInput({ action, uid } as DataInput, (message: unknown) => answers.push(message));
    };

    const answer = (): { uid?: string; result?: unknown; error?: string } =>
        answers[1] as { uid?: string; result?: unknown; error?: string };

    beforeEach(() => {
        answers = [];
        posted = [];
        vi.stubGlobal("postMessage", (message: unknown) => posted.push(message));
        initializationComplete(A_KERNEL, undefined, true);
        cacheOf().entries.set(CACHED_HASH, { geometry: "from-cache" });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    describe("initializationComplete", () => {
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
    });

    describe("resolving hashed geometry against the cache", () => {
        it("should replace a hashed input with the geometry the cache holds", () => {
            // Act
            run({ functionName: "shapes.cube", inputs: { geometry: { type: "jscad-geometry", hash: CACHED_HASH } } });

            // Assert
            expect(answer().result).toEqual({ made: "cube", from: { geometry: { geometry: "from-cache" } } });
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
                inputs: { geometries: [{ type: "jscad-geometry", hash: CACHED_HASH }, { type: "jscad-geometry", hash: CACHED_HASH }] },
            });

            // Assert
            expect(answer().result).toEqual({
                made: "cube",
                from: { geometries: [{ geometry: "from-cache" }, { geometry: "from-cache" }] },
            });
        });

        it("should fail the call when one geometry in a list is no longer cached", () => {
            // Act
            run({
                functionName: "shapes.cube",
                inputs: { geometries: [{ type: "jscad-geometry", hash: CACHED_HASH }, { type: "jscad-geometry", hash: MISSING_HASH }] },
            });

            // Assert
            expect(answer().error).toContain(`Geometry with hash ${MISSING_HASH} not found in cache`);
        });

        it("should replace every hashed geometry in a list of lists", () => {
            // Act
            run({
                functionName: "shapes.cube",
                inputs: { geometries: [[{ type: "jscad-geometry", hash: CACHED_HASH }], [{ type: "jscad-geometry", hash: CACHED_HASH }]] },
            });

            // Assert
            expect(answer().result).toEqual({
                made: "cube",
                from: { geometries: [[{ geometry: "from-cache" }], [{ geometry: "from-cache" }]] },
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
            expect(answer().error).toContain("failed when executing function - shapes.nothingLikeThis");
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
            expect(answer().error).toContain("failed when executing function undefined");
        });

        it("should still answer when there are no inputs to repeat", () => {
            // Act
            run({ functionName: "shapes.nothingLikeThis", inputs: undefined });

            // Assert
            expect(answer().error).toContain("failed when executing function - shapes.nothingLikeThis");
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
