import { CacheHelper } from "./cache-helper";

describe("CacheHelper unit tests", () => {
    let cacheHelper: CacheHelper;

    beforeEach(() => {
        cacheHelper = new CacheHelper();
    });

    describe("isJSCADObject", () => {
        it("should return false for undefined", () => {
            expect(cacheHelper.isJSCADObject(undefined)).toBe(false);
        });

        it("should return false for null", () => {
            expect(cacheHelper.isJSCADObject(null)).toBe(false);
        });

        it("should return false for primitive values", () => {
            expect(cacheHelper.isJSCADObject(123)).toBe(false);
            expect(cacheHelper.isJSCADObject("string")).toBe(false);
            expect(cacheHelper.isJSCADObject(true)).toBe(false);
        });

        it("should return false for plain objects", () => {
            expect(cacheHelper.isJSCADObject({})).toBe(false);
            expect(cacheHelper.isJSCADObject({ prop: "value" })).toBe(false);
        });

        it("should return false for empty arrays", () => {
            expect(cacheHelper.isJSCADObject([])).toBe(false);
        });

        it("should return true for JSCAD objects with delete method", () => {
            const mockJSCADObject = { delete: () => {}, data: "test" };
            expect(cacheHelper.isJSCADObject(mockJSCADObject)).toBe(true);
        });

        it("should return true for arrays with JSCAD objects", () => {
            const mockJSCADObject = { delete: () => {}, data: "test" };
            expect(cacheHelper.isJSCADObject([mockJSCADObject])).toBe(true);
        });

        it("should return false for arrays with non-JSCAD objects", () => {
            expect(cacheHelper.isJSCADObject([{}])).toBe(false);
            expect(cacheHelper.isJSCADObject([{ prop: "value" }])).toBe(false);
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
        it("should add and retrieve object from cache", () => {
            const mockObject = { delete: () => {}, data: "test" };
            const hash = "test-hash-123";
            
            cacheHelper.addToCache(hash, mockObject);
            
            const cached = cacheHelper.checkCache(hash);
            expect(cached).toBeDefined();
            expect(cached.hash).toBe(hash);
        });

        it("should return null for non-existent cache entry", () => {
            const cached = cacheHelper.checkCache("non-existent-hash");
            expect(cached).toBeNull();
        });

        it("should cache non-JSCAD values", () => {
            const hash = "value-hash";
            const value = { data: "test", number: 42 };
            
            cacheHelper.addToCache(hash, value);
            const cached = cacheHelper.checkCache(hash);
            
            expect(cached).toEqual(value);
        });

        it("should handle array of JSCAD objects in cache", () => {
            const obj1 = { delete: () => {}, data: "test1" };
            const obj2 = { delete: () => {}, data: "test2" };
            
            const objects = [obj1, obj2];
            const hash = "array-hash";
            
            cacheHelper.addToCache(hash, objects);
            const cached = cacheHelper.checkCache(hash);
            
            expect(cached).toBeDefined();
            expect(Array.isArray(cached)).toBe(true);
            expect(cached.length).toBe(2);
        });

        it("should return null if object delete property becomes undefined", () => {
            const obj = { delete: () => {}, data: "test" };
            const hash = "test-hash-deleted";
            
            cacheHelper.addToCache(hash, obj);
            
            // Simulate deletion by removing delete property
            delete obj.delete;
            
            // Should return null because object is invalid
            const cached = cacheHelper.checkCache(hash);
            expect(cached).toBeNull();
        });

        it("should return null if any object in array becomes invalid", () => {
            const obj1 = { delete: () => {}, data: "test1" };
            const obj2 = { delete: () => {}, data: "test2" };
            
            const objects = [obj1, obj2];
            const hash = "array-hash-deleted";
            
            cacheHelper.addToCache(hash, objects);
            
            // Simulate deletion by removing delete property from one object
            delete obj1.delete;
            
            // Should return null because one object is invalid
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

        it("should cache JSCAD objects and return hash reference", () => {
            const obj = { delete: () => {}, data: "test" };
            const args = { functionName: "createObject" };
            let cacheMissCallCount = 0;
            const cacheMiss = () => {
                cacheMissCallCount++;
                return obj;
            };
            
            const result = cacheHelper.cacheOp(args, cacheMiss);
            
            expect(result).toBeDefined();
            expect(result.hash).toBeDefined();
            expect(cacheMissCallCount).toBe(1);
            
            // Second call should use cache
            let cacheMiss2Called = false;
            const cacheMiss2 = () => {
                cacheMiss2Called = true;
                return obj;
            };
            const result2 = cacheHelper.cacheOp(args, cacheMiss2);
            expect(cacheMiss2Called).toBe(false);
            expect(result2.hash).toBe(result.hash);
        });

        it("should handle array of JSCAD objects", () => {
            const obj1 = { delete: () => {}, data: "test1" };
            const obj2 = { delete: () => {}, data: "test2" };
            const objects = [obj1, obj2];
            
            const args = { functionName: "createObjects" };
            const cacheMiss = () => objects;
            
            const result = cacheHelper.cacheOp(args, cacheMiss);
            
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBe(2);
            expect(result[0].hash).toBeDefined();
            expect(result[1].hash).toBeDefined();
        });

        it("should recalculate when cached object becomes invalid", () => {
            const obj1 = { delete: () => {}, data: "test1" };
            const args = { functionName: "createObject" };
            let cacheMiss1CallCount = 0;
            const cacheMiss1 = () => {
                cacheMiss1CallCount++;
                return obj1;
            };
            
            // First call - creates and caches
            cacheHelper.cacheOp(args, cacheMiss1);
            expect(cacheMiss1CallCount).toBe(1);
            
            // Simulate deletion
            delete obj1.delete;
            
            // Second call - should detect invalid object and call cacheMiss again
            const obj2 = { delete: () => {}, data: "test2" };
            let cacheMiss2CallCount = 0;
            const cacheMiss2 = () => {
                cacheMiss2CallCount++;
                return obj2;
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

        it("should clean JSCAD object from cache", () => {
            const hash = "test-hash";
            let deleteCalled = false;
            const obj = { 
                delete: () => { deleteCalled = true; }, 
                data: "test" 
            };
            
            cacheHelper.addToCache(hash, obj);
            expect(cacheHelper.checkCache(hash)).toBeDefined();
            
            cacheHelper.cleanCacheForHash(hash);
            expect(deleteCalled).toBe(true);
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

        it("should clean up JSCAD objects", () => {
            let delete1Called = false;
            let delete2Called = false;
            const obj1 = { delete: () => { delete1Called = true; }, data: "test1" };
            const obj2 = { delete: () => { delete2Called = true; }, data: "test2" };
            
            cacheHelper.addToCache("hash1", obj1);
            cacheHelper.addToCache("hash2", obj2);
            
            cacheHelper.cleanAllCache();
            
            expect(delete1Called).toBe(true);
            expect(delete2Called).toBe(true);
        });

        it("should handle mixed cache entries (JSCAD and non-JSCAD)", () => {
            let deleteCalled = false;
            const jscadObj = { delete: () => { deleteCalled = true; }, data: "jscad" };
            const plainObj = { data: "plain" };
            
            cacheHelper.addToCache("jscad-hash", jscadObj);
            cacheHelper.addToCache("plain-hash", plainObj);
            
            cacheHelper.cleanAllCache();
            
            expect(deleteCalled).toBe(true);
            expect(cacheHelper.checkCache("jscad-hash")).toBeNull();
            expect(cacheHelper.checkCache("plain-hash")).toBeNull();
        });

        it("should handle arrays of JSCAD objects", () => {
            let delete1Called = false;
            let delete2Called = false;
            const obj1 = { delete: () => { delete1Called = true; }, data: "test1" };
            const obj2 = { delete: () => { delete2Called = true; }, data: "test2" };
            const objects = [obj1, obj2];
            
            cacheHelper.addToCache("array-hash", objects);
            
            cacheHelper.cleanAllCache();
            
            expect(delete1Called).toBe(true);
            expect(delete2Called).toBe(true);
        });

        it("should clean all entries from argCache not just usedHashes", () => {
            const obj = { delete: () => {}, data: "test" };
            
            // Add to cache through cacheOp
            cacheHelper.cacheOp({ test: 1 }, () => obj);
            
            // Manually add another entry that's not in usedHashes
            cacheHelper.argCache["manual-hash"] = obj;
            
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

        it("should clean up JSCAD objects that are no longer used", () => {
            let delete1Called = false;
            let delete2Called = false;
            const obj1 = { delete: () => { delete1Called = true; }, data: "test1" };
            const obj2 = { delete: () => { delete2Called = true; }, data: "test2" };
            
            const args1 = { test: 1 };
            const args2 = { test: 2 };
            
            // First run - cache both
            cacheHelper.cacheOp(args1, () => obj1);
            cacheHelper.cacheOp(args2, () => obj2);
            
            // Mark this as previous run
            cacheHelper.cleanUpCache();
            
            // Second run - only use first argument
            cacheHelper.usedHashes = {};
            cacheHelper.cacheOp(args1, () => obj1);
            
            // Clean up should delete obj2
            cacheHelper.cleanUpCache();
            
            expect(delete1Called).toBe(false); // obj1 still in use
            expect(delete2Called).toBe(true);  // obj2 was cleaned
        });

        it("should handle arrays of JSCAD objects during cleanup", () => {
            let delete1Called = false;
            let delete2Called = false;
            const obj1 = { delete: () => { delete1Called = true; }, data: "test1" };
            const obj2 = { delete: () => { delete2Called = true; }, data: "test2" };
            const objects = [obj1, obj2];
            
            const args = { test: 1 };
            
            // First run - cache array
            // When caching arrays, each element gets its own hash with index
            cacheHelper.cacheOp(args, () => objects);
            
            // Verify that individual elements were cached with index-based hashes
            const hash0 = cacheHelper.computeHash({ ...args, index: 0 });
            const hash1 = cacheHelper.computeHash({ ...args, index: 1 });
            expect(cacheHelper.checkCache(hash0)).toBeDefined();
            expect(cacheHelper.checkCache(hash1)).toBeDefined();
            
            // Mark this as previous run
            cacheHelper.cleanUpCache();
            
            // Second run - don't use this cache
            cacheHelper.usedHashes = {};
            
            // Clean up should delete both objects
            cacheHelper.cleanUpCache();
            
            expect(delete1Called).toBe(true);
            expect(delete2Called).toBe(true);
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

        it("should handle already deleted objects gracefully", () => {
            const obj = { delete: () => { throw new Error("Already deleted"); }, data: "test" };
            const args = { test: 1 };
            
            // First run - cache object
            cacheHelper.cacheOp(args, () => obj);
            
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
        it("should handle complex caching scenario with multiple objects", () => {
            const obj1 = { delete: () => {}, data: "obj1" };
            const obj2 = { delete: () => {}, data: "obj2" };
            const obj3 = { delete: () => {}, data: "obj3" };
            
            // Cache multiple objects with different args
            const result1 = cacheHelper.cacheOp({ op: "create", id: 1 }, () => obj1);
            const result2 = cacheHelper.cacheOp({ op: "create", id: 2 }, () => obj2);
            const result3 = cacheHelper.cacheOp({ op: "create", id: 3 }, () => obj3);
            
            expect(result1.hash).toBeDefined();
            expect(result2.hash).toBeDefined();
            expect(result3.hash).toBeDefined();
            expect(result1.hash).not.toBe(result2.hash);
            
            // Retrieve from cache
            const cached1 = cacheHelper.cacheOp({ op: "create", id: 1 }, () => obj1);
            expect(cached1.hash).toBe(result1.hash);
            
            // Clean up cache
            cacheHelper.cleanUpCache();
            cacheHelper.usedHashes = {};
            cacheHelper.cacheOp({ op: "create", id: 1 }, () => obj1); // Only use obj1
            cacheHelper.cleanUpCache();
            
            // obj2 and obj3 should be cleaned
            const hash2 = cacheHelper.computeHash({ op: "create", id: 2 });
            const hash3 = cacheHelper.computeHash({ op: "create", id: 3 });
            expect(cacheHelper.checkCache(hash2)).toBeNull();
            expect(cacheHelper.checkCache(hash3)).toBeNull();
        });

        it("should properly track used hashes across operations", () => {
            const obj = { delete: () => {}, data: "test" };
            const args = { op: "test" };
            
            cacheHelper.cacheOp(args, () => obj);
            
            const hash = cacheHelper.computeHash(args);
            expect(cacheHelper.usedHashes[hash]).toBeDefined();
            expect(cacheHelper.hashesFromPreviousRun[hash]).toBeDefined();
        });
    });
});
