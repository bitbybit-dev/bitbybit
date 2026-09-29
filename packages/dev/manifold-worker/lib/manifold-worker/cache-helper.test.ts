import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { CacheHelper, ObjectDefinition } from "./cache-helper";

function javaStringHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash = hash & hash;
    }
    return hash;
}

describe("CacheHelper unit tests", () => {
    let cacheHelper: CacheHelper;

    beforeEach(() => {
        cacheHelper = new CacheHelper();
    });

    describe("isManifoldObject", () => {
        it("should return false for undefined", () => {
            expect(cacheHelper.isManifoldObject(undefined)).toBe(false);
        });

        it("should return false for null", () => {
            expect(cacheHelper.isManifoldObject(null)).toBe(false);
        });

        it("should return false for primitive values", () => {
            expect(cacheHelper.isManifoldObject(123)).toBe(false);
            expect(cacheHelper.isManifoldObject("string")).toBe(false);
            expect(cacheHelper.isManifoldObject(true)).toBe(false);
        });

        it("should return false for plain objects", () => {
            expect(cacheHelper.isManifoldObject({})).toBe(false);
            expect(cacheHelper.isManifoldObject({ prop: "value" })).toBe(false);
        });

        it("should return false for empty arrays", () => {
            expect(cacheHelper.isManifoldObject([])).toBe(false);
        });

        it("should return true for Manifold objects with $$ property", () => {
            const mockManifoldObject = { $$: { ptr: 123 }, delete: vi.fn() };
            expect(cacheHelper.isManifoldObject(mockManifoldObject)).toBe(true);
        });

        it("should return true for arrays with Manifold objects", () => {
            const mockManifoldObject = { $$: { ptr: 123 }, delete: vi.fn() };
            expect(cacheHelper.isManifoldObject([mockManifoldObject])).toBe(true);
        });

        it("should return false for arrays with non-Manifold objects", () => {
            expect(cacheHelper.isManifoldObject([{}])).toBe(false);
            expect(cacheHelper.isManifoldObject([{ prop: "value" }])).toBe(false);
        });
    });

    describe("computeHash", () => {
        it("should compute consistent hash for same arguments", () => {
            const args1 = { functionName: "test", param1: 1, param2: "value" };
            const args2 = { functionName: "test", param1: 1, param2: "value" };
            
            const hash1 = cacheHelper.computeHash(args1);
            const hash2 = cacheHelper.computeHash(args2);
            
            expect(hash1).toBe(hash2);
        });

        it("should compute different hashes for different arguments", () => {
            const args1 = { functionName: "test", param1: 1 };
            const args2 = { functionName: "test", param1: 2 };
            
            const hash1 = cacheHelper.computeHash(args1);
            const hash2 = cacheHelper.computeHash(args2);
            
            expect(hash1).not.toBe(hash2);
        });

        it("should key a property named like a pointer as ordinary data", () => {
            const args1 = { functionName: "test", param1: 1, ptr: 12345 };
            const args2 = { functionName: "test", param1: 1, ptr: 67890 };

            const hash1 = cacheHelper.computeHash(args1);
            const hash2 = cacheHelper.computeHash(args2);

            expect(hash1).not.toBe(hash2);
        });

        it("should return raw string when raw parameter is true", () => {
            const args = { functionName: "test", param1: 1 };
            const result = cacheHelper.computeHash(args, true);
            
            expect(typeof result).toBe("string");
            expect(result).toContain("functionName");
            expect(result).toContain("test");
        });

        it("should return exactly the JSON of the arguments when raw is true", () => {
            const args = { functionName: "test", param1: 1 };
            expect(cacheHelper.computeHash(args, true)).toBe(JSON.stringify(args));
        });

        it("should be a pure function of the arguments", () => {
            expect(cacheHelper.computeHash({ functionName: "test", param1: 1 })).toBe(8436340963968630);
        });

        it("should produce non-negative safe integers", () => {
            const keys = [{}, { functionName: "test" }, { functionName: "test", nested: { deep: [1, 2, 3] } }]
                .map(args => cacheHelper.computeHash(args));
            keys.forEach(key => {
                expect(Number.isSafeInteger(key)).toBe(true);
                expect(key).toBeGreaterThanOrEqual(0);
            });
        });

        it("should separate arguments that collide under a 32-bit string hash", () => {
            const first = { functionName: "test", name: "Aa" };
            const second = { functionName: "test", name: "BB" };
            expect(javaStringHash(JSON.stringify(first))).toBe(javaStringHash(JSON.stringify(second)));
            expect(cacheHelper.computeHash(first)).not.toBe(cacheHelper.computeHash(second));
        });

        it("should compute hash for empty object", () => {
            const hash = cacheHelper.computeHash({});
            expect(typeof hash).toBe("number");
        });

        it("should compute hash for nested objects", () => {
            const args = {
                functionName: "test",
                nested: {
                    level1: {
                        level2: "value"
                    }
                }
            };
            const hash = cacheHelper.computeHash(args);
            expect(typeof hash).toBe("number");
        });
    });

    describe("stringToHash", () => {
        it("should hash the empty string to a stable safe integer", () => {
            const hash = cacheHelper.stringToHash("");
            expect(hash).toBe(cacheHelper.stringToHash(""));
            expect(Number.isSafeInteger(hash)).toBe(true);
        });

        it("should convert string to consistent hash", () => {
            const hash1 = cacheHelper.stringToHash("test");
            const hash2 = cacheHelper.stringToHash("test");
            expect(hash1).toBe(hash2);
        });

        it("should produce different hashes for different strings", () => {
            const hash1 = cacheHelper.stringToHash("test1");
            const hash2 = cacheHelper.stringToHash("test2");
            expect(hash1).not.toBe(hash2);
        });

        it("should return a number", () => {
            const hash = cacheHelper.stringToHash("test");
            expect(typeof hash).toBe("number");
        });
    });

    describe("addToCache and checkCache", () => {
        it("should add and retrieve manifold from cache", () => {
            const mockManifold = { $$: { ptr: 123 }, delete: vi.fn() };
            const hash = "test-hash-123";
            
            cacheHelper.addToCache(hash, mockManifold);
            
            const cached = cacheHelper.checkCache(hash);
            expect(cached).toBeDefined();
            expect(cached.hash).toBe(hash);
        });

        it("should return null for non-existent cache entry", () => {
            const cached = cacheHelper.checkCache("non-existent-hash");
            expect(cached).toBeNull();
        });

        it("should cache non-Manifold values", () => {
            const hash = "value-hash";
            const value = { data: "test", number: 42 };
            
            cacheHelper.addToCache(hash, value);
            const cached = cacheHelper.checkCache(hash);
            
            expect(cached).toEqual(value);
        });

        it("should return null for deleted Manifold object", () => {
            const mockManifold = { $$: { ptr: 123 }, delete: vi.fn() };
            const hash = "test-hash-deleted";
            
            cacheHelper.addToCache(hash, mockManifold);
            
            delete (mockManifold as Partial<typeof mockManifold>).$$;
            
            const cached = cacheHelper.checkCache(hash);
            expect(cached).toBeNull();
        });

        it("should handle array of Manifold objects in cache", () => {
            const manifold1 = { $$: { ptr: 123 }, delete: vi.fn() };
            const manifold2 = { $$: { ptr: 456 }, delete: vi.fn() };
            
            const manifolds = [manifold1, manifold2];
            const hash = "array-hash";
            
            cacheHelper.addToCache(hash, manifolds);
            const cached = cacheHelper.checkCache(hash);
            
            expect(cached).toBeDefined();
            expect(Array.isArray(cached)).toBe(true);
            expect(cached.length).toBe(2);
        });

        it("should return null if any manifold in array is deleted", () => {
            const manifold1 = { $$: { ptr: 123 }, delete: vi.fn() };
            const manifold2 = { $$: { ptr: 456 }, delete: vi.fn() };
            
            const manifolds = [manifold1, manifold2];
            const hash = "array-hash-deleted";
            
            cacheHelper.addToCache(hash, manifolds);
            
            delete (manifold1 as Partial<typeof manifold1>).$$;
            
            const cached = cacheHelper.checkCache(hash);
            expect(cached).toBeNull();
        });
    });

    describe("cacheOp", () => {
        it("should call cacheMiss function when cache is empty", () => {
            const args = { functionName: "test", param: 1 };
            const mockResult = { value: "result" };
            let cacheMissCalled = false;
            const cacheMiss = () => {
                cacheMissCalled = true;
                return mockResult;
            };
            
            const result = cacheHelper.cacheOp(args, cacheMiss);
            
            expect(cacheMissCalled).toBe(true);
            expect(result).toEqual(mockResult);
        });

        it("should serve the cached result again when the arguments mention pointers", () => {
            const args = { functionName: "test", inputs: { ptrCount: 3, label: "sculptress" } };
            let cacheMissCallCount = 0;
            const cacheMiss = () => {
                cacheMissCallCount++;
                return { value: "result" };
            };

            const first = cacheHelper.cacheOp(args, cacheMiss);
            const second = cacheHelper.cacheOp(args, cacheMiss);

            expect(cacheMissCallCount).toBe(1);
            expect(second).toEqual(first);
        });

        it("should return cached value without calling cacheMiss", () => {
            const args = { functionName: "test", param: 1 };
            const mockResult = { value: "result" };
            let cacheMissCallCount = 0;
            const cacheMiss = () => {
                cacheMissCallCount++;
                return mockResult;
            };
            
            cacheHelper.cacheOp(args, cacheMiss);
            expect(cacheMissCallCount).toBe(1);
            
            let cacheMiss2Called = false;
            const cacheMiss2 = () => {
                cacheMiss2Called = true;
                return mockResult;
            };
            const result2 = cacheHelper.cacheOp(args, cacheMiss2);
            expect(cacheMiss2Called).toBe(false);
            expect(result2).toEqual(mockResult);
        });

        it("should cache Manifold objects and return hash reference", () => {
            const manifold = { $$: { ptr: 123 }, delete: vi.fn() };
            const args = { functionName: "createManifold" };
            let cacheMissCallCount = 0;
            const cacheMiss = () => {
                cacheMissCallCount++;
                return manifold;
            };
            
            const result = cacheHelper.cacheOp(args, cacheMiss);
            
            expect(result).toBeDefined();
            expect(result.hash).toBeDefined();
            expect(cacheMissCallCount).toBe(1);
            
            let cacheMiss2Called = false;
            const cacheMiss2 = () => {
                cacheMiss2Called = true;
                return manifold;
            };
            const result2 = cacheHelper.cacheOp(args, cacheMiss2);
            expect(cacheMiss2Called).toBe(false);
            expect(result2.hash).toBe(result.hash);
        });

        it("should handle array of Manifold objects", () => {
            const manifold1 = { $$: { ptr: 123 }, delete: vi.fn() };
            const manifold2 = { $$: { ptr: 456 }, delete: vi.fn() };
            const manifolds = [manifold1, manifold2];
            
            const args = { functionName: "createManifolds" };
            const cacheMiss = () => manifolds;
            
            const result = cacheHelper.cacheOp(args, cacheMiss);
            
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBe(2);
            expect(result[0].hash).toBeDefined();
            expect(result[1].hash).toBeDefined();
        });

        it("should handle ObjectDefinition with compound and manifolds", () => {
            const compound = { $$: { ptr: 999 }, delete: vi.fn() };
            const manifold1 = { $$: { ptr: 123 }, delete: vi.fn() };
            const manifold2 = { $$: { ptr: 456 }, delete: vi.fn() };
            
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const objDef: ObjectDefinition<any, any> = {
                compound: compound,
                manifolds: [
                    { id: "1", manifold: manifold1 },
                    { id: "2", manifold: manifold2 }
                ],
                data: { some: "data" }
            };
            
            const args = { functionName: "createObject" };
            const cacheMiss = () => objDef;
            
            const result = cacheHelper.cacheOp(args, cacheMiss);
            
            expect(result).toBeDefined();
            expect(result.compound).toBeDefined();
            expect(result.manifolds.length).toBe(2);
            expect(result.data).toEqual({ some: "data" });
        });

        it("should recalculate when cached manifold is deleted", () => {
            const manifold1 = { $$: { ptr: 123 }, delete: vi.fn() };
            const args = { functionName: "createManifold" };
            let cacheMiss1CallCount = 0;
            const cacheMiss1 = () => {
                cacheMiss1CallCount++;
                return manifold1;
            };
            
            cacheHelper.cacheOp(args, cacheMiss1);
            expect(cacheMiss1CallCount).toBe(1);
            
            delete (manifold1 as Partial<typeof manifold1>).$$;
            
            const manifold2 = { $$: { ptr: 456 }, delete: vi.fn() };
            let cacheMiss2CallCount = 0;
            const cacheMiss2 = () => {
                cacheMiss2CallCount++;
                return manifold2;
            };
            
            const result2 = cacheHelper.cacheOp(args, cacheMiss2);
            expect(cacheMiss2CallCount).toBe(1);
            expect(result2).toBeDefined();
        });
    });

    describe("cleanCacheForHash", () => {
        it("should remove specific hash from cache", () => {
            const hash = "test-hash";
            const value = { data: "test" };
            
            cacheHelper.addToCache(hash, value);
            expect(cacheHelper.checkCache(hash)).toBeDefined();
            
            cacheHelper.cleanCacheForHash(hash);
            expect(cacheHelper.checkCache(hash)).toBeNull();
        });

        it("should clean Manifold object from cache", () => {
            const hash = "test-hash";
            const manifold = { $$: { ptr: 123 }, delete: vi.fn() };
            
            cacheHelper.addToCache(hash, manifold);
            expect(cacheHelper.checkCache(hash)).toBeDefined();
            
            cacheHelper.cleanCacheForHash(hash);
            expect(manifold.delete).toHaveBeenCalled();
            expect(cacheHelper.checkCache(hash)).toBeNull();
        });

        it("should not throw error when cleaning non-existent hash", () => {
            expect(() => {
                cacheHelper.cleanCacheForHash("non-existent-hash");
            }).not.toThrow();
        });
    });

    describe("cleanAllCache", () => {
        it("should clear all cache entries", () => {
            const hash1 = "hash1";
            const hash2 = "hash2";
            const value1 = { data: "test1" };
            const value2 = { data: "test2" };
            
            cacheHelper.addToCache(hash1, value1);
            cacheHelper.addToCache(hash2, value2);
            
            expect(cacheHelper.checkCache(hash1)).toBeDefined();
            expect(cacheHelper.checkCache(hash2)).toBeDefined();
            
            cacheHelper.cleanAllCache();
            
            expect(cacheHelper.checkCache(hash1)).toBeNull();
            expect(cacheHelper.checkCache(hash2)).toBeNull();
        });

        it("should clean up Manifold objects", () => {
            const manifold1 = { $$: { ptr: 123 }, delete: vi.fn() };
            const manifold2 = { $$: { ptr: 456 }, delete: vi.fn() };
            
            cacheHelper.addToCache("hash1", manifold1);
            cacheHelper.addToCache("hash2", manifold2);
            
            cacheHelper.cleanAllCache();
            
            expect(manifold1.delete).toHaveBeenCalled();
            expect(manifold2.delete).toHaveBeenCalled();
        });

        it("should handle mixed cache entries (Manifold and non-Manifold)", () => {
            const manifold = { $$: { ptr: 123 }, delete: vi.fn() };
            const plainObj = { data: "plain" };
            
            cacheHelper.addToCache("manifold-hash", manifold);
            cacheHelper.addToCache("plain-hash", plainObj);
            
            cacheHelper.cleanAllCache();
            
            expect(manifold.delete).toHaveBeenCalled();
            expect(cacheHelper.checkCache("manifold-hash")).toBeNull();
            expect(cacheHelper.checkCache("plain-hash")).toBeNull();
        });

        it("should handle arrays of Manifold objects", () => {
            const manifold1 = { $$: { ptr: 123 }, delete: vi.fn() };
            const manifold2 = { $$: { ptr: 456 }, delete: vi.fn() };
            const manifolds = [manifold1, manifold2];
            
            cacheHelper.addToCache("array-hash", manifolds);
            
            cacheHelper.cleanAllCache();
            
            expect(manifold1.delete).toHaveBeenCalled();
            expect(manifold2.delete).toHaveBeenCalled();
        });

        it("should clean all entries from argCache not just usedHashes", () => {
            const manifold = { $$: { ptr: 123 }, delete: vi.fn() };
            
            cacheHelper.cacheOp({ test: 1 }, () => manifold);
            
            cacheHelper.argCache["manual-hash"] = manifold;
            
            cacheHelper.cleanAllCache();
            
            expect(cacheHelper.checkCache("manual-hash")).toBeNull();
        });

        it("should reset used hashes", () => {
            const args = { test: 1 };
            cacheHelper.cacheOp(args, () => ({ value: "test" }));
            
            const hashBefore = cacheHelper.computeHash(args);
            expect(cacheHelper.usedHashes[hashBefore]).toBeDefined();
            
            cacheHelper.cleanAllCache();
            
            expect(Object.keys(cacheHelper.usedHashes).length).toBe(0);
        });
    });

    describe("integration tests", () => {
        it("should delete only the manifolds whose hashes are cleaned and keep serving the rest from the cache", () => {
            // Arrange
            const deleteKept = vi.fn();
            const deleteSecond = vi.fn();
            const deleteThird = vi.fn();
            const kept = { $$: { ptr: 123 }, delete: deleteKept };
            cacheHelper.cacheOp({ op: "create", id: 1 }, () => kept);
            const second = cacheHelper.cacheOp({ op: "create", id: 2 }, () => ({ $$: { ptr: 456 }, delete: deleteSecond }));
            const third = cacheHelper.cacheOp({ op: "create", id: 3 }, () => ({ $$: { ptr: 789 }, delete: deleteThird }));
            const recompute = vi.fn(() => ({ $$: { ptr: 999 }, delete: vi.fn() }));

            // Act
            cacheHelper.cleanCacheForHash(second.hash);
            cacheHelper.cleanCacheForHash(third.hash);
            const served = cacheHelper.cacheOp({ op: "create", id: 1 }, recompute);

            // Assert
            expect(deleteSecond).toHaveBeenCalledTimes(1);
            expect(deleteThird).toHaveBeenCalledTimes(1);
            expect(deleteKept).not.toHaveBeenCalled();
            expect(served).toBe(kept);
            expect(recompute).not.toHaveBeenCalled();
        });

        it("should record the key of every call and of every manifold of a list answer in usedHashes, and drop a key when its hash is cleaned", () => {
            // Arrange
            const singleArgs = { op: "single" };
            const splitArgs = { op: "split" };
            const single = cacheHelper.cacheOp(singleArgs, () => ({ $$: { ptr: 1 }, delete: vi.fn() }));
            const halves = cacheHelper.cacheOp(splitArgs, () => [{ $$: { ptr: 2 }, delete: vi.fn() }, { $$: { ptr: 3 }, delete: vi.fn() }]);
            const splitHash = cacheHelper.computeHash(splitArgs);

            // Act
            cacheHelper.cleanCacheForHash(halves[0].hash);

            // Assert
            expect(cacheHelper.usedHashes).toEqual({
                [single.hash]: single.hash,
                [splitHash]: splitHash,
                [halves[1].hash]: halves[1].hash,
            });
        });
    });

    describe("cleaning an entry that holds an array", () => {
        type Deletable = { $$: object; delete: () => void };

        const deletable = (name: string, deleted: string[]): Deletable => ({
            $$: {},
            delete: () => { deleted.push(name); },
        });

        it("should delete every kernel object the entry holds when the hash is cleaned", () => {
            // Arrange
            const deleted: string[] = [];
            cacheHelper.addToCache("array-hash", [deletable("first", deleted), deletable("second", deleted)]);

            // Act
            cacheHelper.cleanCacheForHash("array-hash");

            // Assert
            expect(deleted).toEqual(["first", "second"]);
        });

        it("should keep deleting the rest when one object has already gone", () => {
            // Arrange
            const deleted: string[] = [];
            const gone = { $$: {}, delete: () => { throw new Error("already deleted"); } };
            cacheHelper.addToCache("array-hash", [gone, deletable("second", deleted)]);

            // Act
            cacheHelper.cleanCacheForHash("array-hash");

            // Assert
            expect(deleted).toEqual(["second"]);
        });

        it("should forget the entry once it is cleaned", () => {
            // Arrange
            const deleted: string[] = [];
            cacheHelper.addToCache("array-hash", [deletable("first", deleted)]);

            // Act
            cacheHelper.cleanCacheForHash("array-hash");

            // Assert
            expect(cacheHelper.checkCache("array-hash")).toBeNull();
        });

        it("should delete every kernel object the entry holds when the whole cache is dropped", () => {
            // Arrange
            const deleted: string[] = [];
            cacheHelper.addToCache("array-hash", [deletable("first", deleted), deletable("second", deleted)]);

            // Act
            cacheHelper.cleanAllCache();

            // Assert
            expect(deleted).toEqual(["first", "second"]);
        });

        it("should keep deleting the rest when one object has already gone as the whole cache is dropped", () => {
            // Arrange
            const deleted: string[] = [];
            const gone = { $$: {}, delete: () => { throw new Error("already deleted"); } };
            cacheHelper.addToCache("array-hash", [gone, deletable("second", deleted)]);

            // Act
            cacheHelper.cleanAllCache();

            // Assert
            expect(deleted).toEqual(["second"]);
        });
    });

    describe("entries that are not live kernel shapes", () => {
        it("should skip an entry that holds nothing when the whole cache is dropped", () => {
            // Arrange
            cacheHelper.argCache["empty"] = null;

            // Act
            cacheHelper.cleanAllCache();

            // Assert
            expect(cacheHelper.argCache).toEqual({});
        });

        it.each([0, ""])("should hand back a cached %j on the second call as itself, without running it again", (falsy) => {
            // Arrange
            const args = { functionName: "measure.something", inputs: { hash: 7 } };
            let calls = 0;
            cacheHelper.cacheOp(args, () => { calls += 1; return falsy; });

            // Act
            const second = cacheHelper.cacheOp(args, () => { calls += 1; return falsy; });

            // Assert
            expect(second).toBe(falsy);
            expect(calls).toBe(1);
        });

        it("should keep a cached falsy result wrapped, so it cannot be mistaken for a missing entry", () => {
            // Arrange
            const args = { functionName: "evaluate.isEmpty", inputs: { hash: 8 } };

            // Act
            cacheHelper.cacheOp(args, () => 0);

            // Assert
            expect(cacheHelper.checkCache(cacheHelper.computeHash(args))).toEqual({ value: 0, hash: cacheHelper.computeHash(args) });
        });

        it("should hand back a cached false result on the second call instead of null", () => {
            // Arrange
            const args = { functionName: "evaluate.isEmpty", inputs: { hash: 7 } };
            let calls = 0;
            cacheHelper.cacheOp(args, () => { calls += 1; return false; });

            // Act
            const second = cacheHelper.cacheOp(args, () => { calls += 1; return false; });

            // Assert
            expect(second).toBe(false);
            expect(calls).toBe(1);
        });

        it("should hand back the same empty result on the second call rather than running it again", () => {
            // Arrange
            const args = { radius: 1 };
            let calls = 0;
            cacheHelper.cacheOp(args, () => { calls += 1; return null; });

            // Act
            const second = cacheHelper.cacheOp(args, () => { calls += 1; return null; });

            // Assert
            expect(second).toBeNull();
            expect(calls).toBe(1);
        });

        it("should cache a value that is not an object without stamping a hash onto it", () => {
            // Act
            const hash = cacheHelper.addToCache("primitive", 42);

            // Assert
            expect(hash).toBe("primitive");
            expect(cacheHelper.argCache["primitive"]).toBe(42);
        });
    });

    describe("arguments that mention pointers", () => {
        let reported: unknown[];

        beforeEach(() => {
            reported = [];
            vi.spyOn(console, "error").mockImplementation((message: unknown) => { reported.push(message); });
        });

        afterEach(() => {
            vi.restoreAllMocks();
        });

        it("should key a property whose name starts with ptr like any other and report nothing", () => {
            // Act
            const first = cacheHelper.computeHash({ functionName: "test", ptrCount: 3 });
            const second = cacheHelper.computeHash({ functionName: "test", ptrCount: 4 });

            // Assert
            expect(first).not.toBe(second);
            expect(reported).toEqual([]);
        });

        it("should keep text containing ptr intact in the raw form and report nothing", () => {
            // Arrange
            const args = { functionName: "test", name: "sculptress" };

            // Act
            const raw = cacheHelper.computeHash(args, true);

            // Assert
            expect(raw).toBe(JSON.stringify(args));
            expect(reported).toEqual([]);
        });
    });

    describe("an answer that is a list of manifolds", () => {
        const manifoldOf = (ptr: number): { $$: { ptr: number }; delete: () => void } => ({ $$: { ptr }, delete: vi.fn() });
        const args = { functionName: "manifold.operations.splitByPlane", inputs: { manifold: { hash: 1, type: "manifold-shape" }, normal: [0, 0, 1], originOffset: 0 } };

        it("should run the kernel once for two identical calls and answer both with the same manifolds under the same hashes", () => {
            // Arrange
            const halves = [manifoldOf(1), manifoldOf(2)];
            const split = vi.fn(() => halves);
            const first = cacheHelper.cacheOp(args, split);

            // Act
            const second = cacheHelper.cacheOp(args, split);

            // Assert
            expect(split).toHaveBeenCalledTimes(1);
            expect(second).toEqual(first);
            expect(second[0]).toBe(halves[0]);
            expect(second.map((half: { hash: number }) => half.hash)).toEqual(first.map((half: { hash: number }) => half.hash));
        });

        it("should compute the list again once one of its manifolds has been deleted, and delete the ones it replaces", () => {
            // Arrange
            const old = [manifoldOf(1), manifoldOf(2)];
            const first = cacheHelper.cacheOp(args, () => old);
            cacheHelper.cleanCacheForHash(first[0].hash);
            const fresh = [manifoldOf(3), manifoldOf(4)];
            const split = vi.fn(() => fresh);

            // Act
            const second = cacheHelper.cacheOp(args, split);

            // Assert
            expect(split).toHaveBeenCalledTimes(1);
            expect(second).toBe(fresh);
            expect(old[0]!.delete).toHaveBeenCalledTimes(1);
            expect(old[1]!.delete).toHaveBeenCalledTimes(1);
            expect(cacheHelper.checkCache(second[1].hash)).toBe(fresh[1]);
            expect(fresh[0]!.delete).not.toHaveBeenCalled();
        });

        it("should not delete a manifold the list computed again hands back", () => {
            // Arrange
            const kept = manifoldOf(2);
            const first = cacheHelper.cacheOp(args, () => [manifoldOf(1), kept]);
            cacheHelper.cleanCacheForHash(first[0].hash);

            // Act
            const second = cacheHelper.cacheOp(args, () => [kept, manifoldOf(3)]);

            // Assert
            expect(kept.delete).not.toHaveBeenCalled();
            expect(cacheHelper.checkCache(second[0].hash)).toBe(kept);
        });

        it("should compute the list again once one of its manifolds is no longer alive", () => {
            // Arrange
            const old = [manifoldOf(1), manifoldOf(2)];
            cacheHelper.cacheOp(args, () => old);
            delete (old[1] as { $$?: unknown }).$$;
            const split = vi.fn(() => [manifoldOf(3), manifoldOf(4)]);

            // Act
            cacheHelper.cacheOp(args, split);

            // Assert
            expect(split).toHaveBeenCalledTimes(1);
            expect(old[0]!.delete).toHaveBeenCalledTimes(1);
        });

        it("should key every manifold of the answer from the call's own key, without writing the arguments out again", () => {
            // Arrange
            const computeHash = vi.spyOn(cacheHelper, "computeHash");

            // Act
            const halves = cacheHelper.cacheOp(args, () => [manifoldOf(1), manifoldOf(2), manifoldOf(3)]);

            // Assert
            expect(computeHash).toHaveBeenCalledTimes(1);
            expect(new Set(halves.map((half: { hash: number }) => half.hash)).size).toBe(3);
        });

        it("should key the compound and every manifold of an object definition from the call's own key", () => {
            // Arrange
            const computeHash = vi.spyOn(cacheHelper, "computeHash");

            // Act
            const definition = cacheHelper.cacheOp(args, () => ({ compound: manifoldOf(9), data: { name: "parts" }, manifolds: [{ id: "a", manifold: manifoldOf(1) }, { id: "b", manifold: manifoldOf(2) }] }));

            // Assert
            expect(computeHash).toHaveBeenCalledTimes(1);
            expect(new Set([definition.compound.hash, ...definition.manifolds.map((entry: { manifold: { hash: number } }) => entry.manifold.hash)]).size).toBe(3);
        });
    });

    describe("binary data in the arguments", () => {
        const meshOf = (values: number[]): { numProp: number; vertProperties: Float32Array; triVerts: Uint32Array } => ({ numProp: 3, vertProperties: new Float32Array(values), triVerts: new Uint32Array([0, 1, 2]) });

        it("should key a mesh nested in the arguments by a digest of its arrays rather than by their values", () => {
            // Act
            const raw = cacheHelper.computeHash({ functionName: "manifold.shapes.manifoldFromMesh", inputs: { mesh: meshOf([1.5, 2.5, 3.5, 4, 5, 6, 7, 8, 9]) } }, true);

            // Assert
            expect(raw).toContain("__binaryDigest__");
            expect(raw).not.toContain("1.5");
        });

        it("should give identical meshes the same key and different meshes different keys", () => {
            // Act
            const first = cacheHelper.computeHash({ inputs: { mesh: meshOf([1, 2, 3, 4, 5, 6, 7, 8, 9]) } });
            const same = cacheHelper.computeHash({ inputs: { mesh: meshOf([1, 2, 3, 4, 5, 6, 7, 8, 9]) } });
            const other = cacheHelper.computeHash({ inputs: { mesh: meshOf([1, 2, 3, 4, 5, 6, 7, 8, 10]) } });

            // Assert
            expect(same).toBe(first);
            expect(other).not.toBe(first);
        });

        it("should digest only the bytes a view looks at", () => {
            // Arrange
            const buffer = new Float32Array([1, 2, 3, 4]).buffer;

            // Act
            const front = cacheHelper.computeHash({ values: new Float32Array(buffer, 0, 2) });
            const back = cacheHelper.computeHash({ values: new Float32Array(buffer, 8, 2) });

            // Assert
            expect(front).not.toBe(back);
        });

        it("should leave the arguments it was given as they were", () => {
            // Arrange
            const mesh = meshOf([1, 2, 3, 4, 5, 6, 7, 8, 9]);
            const inputs = { mesh, points: [[1, 2, 3]] };

            // Act
            cacheHelper.computeHash({ inputs });

            // Assert
            expect(inputs.mesh).toBe(mesh);
            expect(mesh.vertProperties).toBeInstanceOf(Float32Array);
        });

        it("should key a bare buffer by a digest of its bytes", () => {
            // Arrange
            const bytes = new Uint8Array([7, 8, 9]);

            // Act
            const raw = cacheHelper.computeHash({ inputs: { data: bytes.buffer } }, true);
            const same = cacheHelper.computeHash({ inputs: { data: new Uint8Array([7, 8, 9]).buffer } });
            const other = cacheHelper.computeHash({ inputs: { data: new Uint8Array([7, 8, 10]).buffer } });

            // Assert
            expect(raw).toBe(`{"inputs":{"data":{"__binaryDigest__":${cacheHelper.bytesToHash(bytes)},"byteLength":3}}}`);
            expect(same).toBe(cacheHelper.computeHash({ inputs: { data: bytes.buffer } }));
            expect(other).not.toBe(same);
        });

        it("should digest binary data held in a list and leave the list it was given as it was", () => {
            // Arrange
            const values = new Float32Array([1.5, 2.5]);
            const list: unknown[] = ["label", values];

            // Act
            const raw = cacheHelper.computeHash({ inputs: { list } }, true);

            // Assert
            expect(raw).toBe(`{"inputs":{"list":["label",{"__binaryDigest__":${cacheHelper.bytesToHash(new Uint8Array(values.buffer))},"byteLength":8}]}}`);
            expect(list[1]).toBe(values);
        });

        it("should still refuse arguments that refer to themselves", () => {
            // Arrange
            const looped: Record<string, unknown> = { mesh: meshOf([1, 2, 3]) };
            looped["self"] = looped;

            // Act
            const key = (): unknown => cacheHelper.computeHash({ inputs: looped });

            // Assert
            expect(key).toThrow(TypeError);
        });
    });
});
