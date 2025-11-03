import { CacheHelper, ObjectDefinition } from "./cache-helper";

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
            const mockManifoldObject = { $$: { ptr: 123 }, delete: jest.fn() };
            expect(cacheHelper.isManifoldObject(mockManifoldObject)).toBe(true);
        });

        it("should return true for arrays with Manifold objects", () => {
            const mockManifoldObject = { $$: { ptr: 123 }, delete: jest.fn() };
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

        it("should filter out ptr properties from hash computation", () => {
            const args1 = { functionName: "test", param1: 1, ptr: 12345 };
            const args2 = { functionName: "test", param1: 1, ptr: 67890 };
            
            const hash1 = cacheHelper.computeHash(args1);
            const hash2 = cacheHelper.computeHash(args2);
            
            expect(hash1).toBe(hash2);
        });

        it("should return raw string when raw parameter is true", () => {
            const args = { functionName: "test", param1: 1 };
            const result = cacheHelper.computeHash(args, true);
            
            expect(typeof result).toBe("string");
            expect(result).toContain("functionName");
            expect(result).toContain("test");
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
        it("should convert empty string to hash", () => {
            const hash = cacheHelper.stringToHash("");
            expect(hash).toBe(0);
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
            const mockManifold = { $$: { ptr: 123 }, delete: jest.fn() };
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
            const mockManifold = { $$: { ptr: 123 }, delete: jest.fn() };
            const hash = "test-hash-deleted";
            
            cacheHelper.addToCache(hash, mockManifold);
            
            // Simulate deletion by removing $$ property
            delete mockManifold.$$;
            
            // Should return null because manifold is deleted
            const cached = cacheHelper.checkCache(hash);
            expect(cached).toBeNull();
        });

        it("should handle array of Manifold objects in cache", () => {
            const manifold1 = { $$: { ptr: 123 }, delete: jest.fn() };
            const manifold2 = { $$: { ptr: 456 }, delete: jest.fn() };
            
            const manifolds = [manifold1, manifold2];
            const hash = "array-hash";
            
            cacheHelper.addToCache(hash, manifolds);
            const cached = cacheHelper.checkCache(hash);
            
            expect(cached).toBeDefined();
            expect(Array.isArray(cached)).toBe(true);
            expect(cached.length).toBe(2);
        });

        it("should return null if any manifold in array is deleted", () => {
            const manifold1 = { $$: { ptr: 123 }, delete: jest.fn() };
            const manifold2 = { $$: { ptr: 456 }, delete: jest.fn() };
            
            const manifolds = [manifold1, manifold2];
            const hash = "array-hash-deleted";
            
            cacheHelper.addToCache(hash, manifolds);
            
            // Simulate deletion of one manifold
            delete manifold1.$$;
            
            // Should return null because one manifold is deleted
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

        it("should return cached value without calling cacheMiss", () => {
            const args = { functionName: "test", param: 1 };
            const mockResult = { value: "result" };
            let cacheMissCallCount = 0;
            const cacheMiss = () => {
                cacheMissCallCount++;
                return mockResult;
            };
            
            // First call - should call cacheMiss
            cacheHelper.cacheOp(args, cacheMiss);
            expect(cacheMissCallCount).toBe(1);
            
            // Second call - should use cache
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
            const manifold = { $$: { ptr: 123 }, delete: jest.fn() };
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
            
            // Second call should use cache
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
            const manifold1 = { $$: { ptr: 123 }, delete: jest.fn() };
            const manifold2 = { $$: { ptr: 456 }, delete: jest.fn() };
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
            const compound = { $$: { ptr: 999 }, delete: jest.fn() };
            const manifold1 = { $$: { ptr: 123 }, delete: jest.fn() };
            const manifold2 = { $$: { ptr: 456 }, delete: jest.fn() };
            
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
            const manifold1 = { $$: { ptr: 123 }, delete: jest.fn() };
            const args = { functionName: "createManifold" };
            let cacheMiss1CallCount = 0;
            const cacheMiss1 = () => {
                cacheMiss1CallCount++;
                return manifold1;
            };
            
            // First call - creates and caches
            cacheHelper.cacheOp(args, cacheMiss1);
            expect(cacheMiss1CallCount).toBe(1);
            
            // Simulate deletion
            delete manifold1.$$;
            
            // Second call - should detect deleted manifold and call cacheMiss again
            const manifold2 = { $$: { ptr: 456 }, delete: jest.fn() };
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
            const manifold = { $$: { ptr: 123 }, delete: jest.fn() };
            
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
            const manifold1 = { $$: { ptr: 123 }, delete: jest.fn() };
            const manifold2 = { $$: { ptr: 456 }, delete: jest.fn() };
            
            cacheHelper.addToCache("hash1", manifold1);
            cacheHelper.addToCache("hash2", manifold2);
            
            cacheHelper.cleanAllCache();
            
            expect(manifold1.delete).toHaveBeenCalled();
            expect(manifold2.delete).toHaveBeenCalled();
        });

        it("should handle mixed cache entries (Manifold and non-Manifold)", () => {
            const manifold = { $$: { ptr: 123 }, delete: jest.fn() };
            const plainObj = { data: "plain" };
            
            cacheHelper.addToCache("manifold-hash", manifold);
            cacheHelper.addToCache("plain-hash", plainObj);
            
            cacheHelper.cleanAllCache();
            
            expect(manifold.delete).toHaveBeenCalled();
            expect(cacheHelper.checkCache("manifold-hash")).toBeNull();
            expect(cacheHelper.checkCache("plain-hash")).toBeNull();
        });

        it("should handle arrays of Manifold objects", () => {
            const manifold1 = { $$: { ptr: 123 }, delete: jest.fn() };
            const manifold2 = { $$: { ptr: 456 }, delete: jest.fn() };
            const manifolds = [manifold1, manifold2];
            
            cacheHelper.addToCache("array-hash", manifolds);
            
            cacheHelper.cleanAllCache();
            
            expect(manifold1.delete).toHaveBeenCalled();
            expect(manifold2.delete).toHaveBeenCalled();
        });

        it("should clean all entries from argCache not just usedHashes", () => {
            const manifold = { $$: { ptr: 123 }, delete: jest.fn() };
            
            // Add to cache through cacheOp
            cacheHelper.cacheOp({ test: 1 }, () => manifold);
            
            // Manually add another entry that's not in usedHashes
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

    describe("cleanUpCache", () => {
        it("should remove unused cache entries from previous run", () => {
            const args1 = { test: 1 };
            const args2 = { test: 2 };
            const value = { data: "test" };
            
            // First run - cache both
            cacheHelper.cacheOp(args1, () => value);
            cacheHelper.cacheOp(args2, () => value);
            
            const hash1 = cacheHelper.computeHash(args1);
            const hash2 = cacheHelper.computeHash(args2);
            
            // Mark this as previous run
            cacheHelper.cleanUpCache();
            
            // Second run - only use first argument
            cacheHelper.usedHashes = {};
            cacheHelper.cacheOp(args1, () => value);
            
            // Clean up should remove unused hash2
            cacheHelper.cleanUpCache();
            
            expect(cacheHelper.checkCache(hash1)).toBeDefined();
            expect(cacheHelper.checkCache(hash2)).toBeNull();
        });

        it("should clean up Manifold objects that are no longer used", () => {
            const manifold1 = { $$: { ptr: 123 }, delete: jest.fn() };
            const manifold2 = { $$: { ptr: 456 }, delete: jest.fn() };
            
            const args1 = { test: 1 };
            const args2 = { test: 2 };
            
            // First run - cache both
            cacheHelper.cacheOp(args1, () => manifold1);
            cacheHelper.cacheOp(args2, () => manifold2);
            
            // Mark this as previous run
            cacheHelper.cleanUpCache();
            
            // Second run - only use first argument
            cacheHelper.usedHashes = {};
            cacheHelper.cacheOp(args1, () => manifold1);
            
            // Clean up should delete manifold2
            cacheHelper.cleanUpCache();
            
            expect(manifold1.delete).not.toHaveBeenCalled(); // manifold1 still in use
            expect(manifold2.delete).toHaveBeenCalled();  // manifold2 was cleaned
        });

        it("should handle arrays of Manifold objects during cleanup", () => {
            const manifold1 = { $$: { ptr: 123 }, delete: jest.fn() };
            const manifold2 = { $$: { ptr: 456 }, delete: jest.fn() };
            const manifolds = [manifold1, manifold2];
            
            const args = { test: 1 };
            
            // First run - cache array
            cacheHelper.cacheOp(args, () => manifolds);
            
            // Mark this as previous run
            cacheHelper.cleanUpCache();
            
            // Second run - don't use this cache
            cacheHelper.usedHashes = {};
            
            // Clean up should delete both manifolds
            cacheHelper.cleanUpCache();
            
            expect(manifold1.delete).toHaveBeenCalled();
            expect(manifold2.delete).toHaveBeenCalled();
        });

        it("should not remove cache entries that are still in use", () => {
            const args = { test: 1 };
            const value = { data: "test" };
            
            // First run
            cacheHelper.cacheOp(args, () => value);
            cacheHelper.cleanUpCache();
            
            // Second run - still using same args
            cacheHelper.cacheOp(args, () => value);
            cacheHelper.cleanUpCache();
            
            const hash = cacheHelper.computeHash(args);
            expect(cacheHelper.checkCache(hash)).toBeDefined();
        });

        it("should handle empty previous run gracefully", () => {
            const args = { test: 1 };
            const value = { data: "test" };
            
            // Clean up with no previous run
            expect(() => {
                cacheHelper.cleanUpCache();
            }).not.toThrow();
            
            // Add some cache and clean up
            cacheHelper.cacheOp(args, () => value);
            expect(() => {
                cacheHelper.cleanUpCache();
            }).not.toThrow();
        });

        it("should update hashesFromPreviousRun correctly", () => {
            const args1 = { test: 1 };
            const args2 = { test: 2 };
            const value = { data: "test" };
            
            cacheHelper.cacheOp(args1, () => value);
            cacheHelper.cacheOp(args2, () => value);
            
            const hash1 = cacheHelper.computeHash(args1);
            const hash2 = cacheHelper.computeHash(args2);
            
            cacheHelper.cleanUpCache();
            
            expect(cacheHelper.hashesFromPreviousRun[hash1]).toBeDefined();
            expect(cacheHelper.hashesFromPreviousRun[hash2]).toBeDefined();
        });

        it("should handle already deleted manifolds gracefully", () => {
            const manifold = { 
                $$: { ptr: 123 }, 
                delete: jest.fn(() => { throw new Error("Already deleted"); }) 
            };
            const args = { test: 1 };
            
            // First run - cache manifold
            cacheHelper.cacheOp(args, () => manifold);
            
            // Mark this as previous run
            cacheHelper.cleanUpCache();
            
            // Second run - don't use this cache
            cacheHelper.usedHashes = {};
            
            // Clean up should handle the error gracefully
            expect(() => {
                cacheHelper.cleanUpCache();
            }).not.toThrow();
        });
    });

    describe("remove", () => {
        it("should remove object from array by hash", () => {
            const obj1 = { hash: "hash1", data: "test1" };
            const obj2 = { hash: "hash2", data: "test2" };
            const obj3 = { hash: "hash3", data: "test3" };
            const array = [obj1, obj2, obj3];
            
            const result = cacheHelper.remove(array, obj2);
            
            expect(result.length).toBe(2);
            expect(result).toContain(obj1);
            expect(result).toContain(obj3);
            expect(result).not.toContain(obj2);
        });

        it("should remove object from array by ptr when hash is different", () => {
            const obj1 = { hash: "hash1", ptr: 100, data: "test1" };
            const obj2 = { hash: "hash2", ptr: 200, data: "test2" };
            const obj3 = { hash: "hash3", ptr: 300, data: "test3" };
            const array = [obj1, obj2, obj3];
            
            // Try to remove with same ptr but different hash
            // The remove logic uses OR: keep if (hash !== hash OR ptr !== ptr)
            // So removal only happens when BOTH hash AND ptr match
            const objToRemove = { hash: "different", ptr: 200 };
            const result = cacheHelper.remove(array, objToRemove);
            
            // Since hash is different, obj2 should NOT be removed
            expect(result.length).toBe(3);
            expect(result).toContain(obj1);
            expect(result).toContain(obj2);
            expect(result).toContain(obj3);
        });

        it("should return original array if object not found", () => {
            const obj1 = { hash: "hash1", data: "test1" };
            const obj2 = { hash: "hash2", data: "test2" };
            const array = [obj1, obj2];
            
            const objToRemove = { hash: "hash3", data: "test3" };
            const result = cacheHelper.remove(array, objToRemove);
            
            expect(result.length).toBe(2);
            expect(result).toEqual(array);
        });

        it("should return empty array when all elements are removed", () => {
            const obj = { hash: "hash1", data: "test" };
            const array = [obj];
            
            const result = cacheHelper.remove(array, obj);
            
            expect(result.length).toBe(0);
        });
    });

    describe("integration tests", () => {
        it("should handle complex caching scenario with multiple manifolds", () => {
            const manifold1 = { $$: { ptr: 123 }, delete: jest.fn() };
            const manifold2 = { $$: { ptr: 456 }, delete: jest.fn() };
            const manifold3 = { $$: { ptr: 789 }, delete: jest.fn() };
            
            // Cache multiple manifolds with different args
            const result1 = cacheHelper.cacheOp({ op: "create", id: 1 }, () => manifold1);
            const result2 = cacheHelper.cacheOp({ op: "create", id: 2 }, () => manifold2);
            const result3 = cacheHelper.cacheOp({ op: "create", id: 3 }, () => manifold3);
            
            expect(result1.hash).toBeDefined();
            expect(result2.hash).toBeDefined();
            expect(result3.hash).toBeDefined();
            expect(result1.hash).not.toBe(result2.hash);
            
            // Retrieve from cache
            const cached1 = cacheHelper.cacheOp({ op: "create", id: 1 }, () => manifold1);
            expect(cached1.hash).toBe(result1.hash);
            
            // Clean up cache
            cacheHelper.cleanUpCache();
            cacheHelper.usedHashes = {};
            cacheHelper.cacheOp({ op: "create", id: 1 }, () => manifold1); // Only use manifold1
            cacheHelper.cleanUpCache();
            
            // manifold2 and manifold3 should be cleaned
            const hash2 = cacheHelper.computeHash({ op: "create", id: 2 });
            const hash3 = cacheHelper.computeHash({ op: "create", id: 3 });
            expect(cacheHelper.checkCache(hash2)).toBeNull();
            expect(cacheHelper.checkCache(hash3)).toBeNull();
        });

        it("should properly track used hashes across operations", () => {
            const manifold = { $$: { ptr: 123 }, delete: jest.fn() };
            const args = { op: "test" };
            
            cacheHelper.cacheOp(args, () => manifold);
            
            const hash = cacheHelper.computeHash(args);
            expect(cacheHelper.usedHashes[hash]).toBeDefined();
            expect(cacheHelper.hashesFromPreviousRun[hash]).toBeDefined();
        });
    });
});
