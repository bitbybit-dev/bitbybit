import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
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
            
            delete (obj as Partial<typeof obj>).delete;
            
            const cached = cacheHelper.checkCache(hash);
            expect(cached).toBeNull();
        });

        it("should return null if any object in array becomes invalid", () => {
            const obj1 = { delete: () => {}, data: "test1" };
            const obj2 = { delete: () => {}, data: "test2" };
            
            const objects = [obj1, obj2];
            const hash = "array-hash-deleted";
            
            cacheHelper.addToCache(hash, objects);
            
            delete (obj1 as Partial<typeof obj1>).delete;
            
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
            
            cacheHelper.cacheOp(args, cacheMiss1);
            expect(cacheMiss1CallCount).toBe(1);
            
            delete (obj1 as Partial<typeof obj1>).delete;
            
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
            
            cacheHelper.cacheOp({ test: 1 }, () => obj);
            
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
            
            cacheHelper.cacheOp(args1, () => value);
            cacheHelper.cacheOp(args2, () => value);
            
            const hash1 = cacheHelper.computeHash(args1);
            const hash2 = cacheHelper.computeHash(args2);
            
            cacheHelper.cleanUpCache();
            
            cacheHelper.usedHashes = {};
            cacheHelper.cacheOp(args1, () => value);
            
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
            
            cacheHelper.cacheOp(args1, () => obj1);
            cacheHelper.cacheOp(args2, () => obj2);
            
            cacheHelper.cleanUpCache();
            
            cacheHelper.usedHashes = {};
            cacheHelper.cacheOp(args1, () => obj1);
            
            cacheHelper.cleanUpCache();
            
            expect(delete1Called).toBe(false);
            expect(delete2Called).toBe(true);
        });

        it("should handle arrays of JSCAD objects during cleanup", () => {
            let delete1Called = false;
            let delete2Called = false;
            const obj1 = { delete: () => { delete1Called = true; }, data: "test1" };
            const obj2 = { delete: () => { delete2Called = true; }, data: "test2" };
            const objects = [obj1, obj2];
            
            const args = { test: 1 };
            
            cacheHelper.cacheOp(args, () => objects);
            
            const hash0 = cacheHelper.computeHash({ ...args, index: 0 });
            const hash1 = cacheHelper.computeHash({ ...args, index: 1 });
            expect(cacheHelper.checkCache(hash0)).toBeDefined();
            expect(cacheHelper.checkCache(hash1)).toBeDefined();
            
            cacheHelper.cleanUpCache();
            
            cacheHelper.usedHashes = {};
            
            cacheHelper.cleanUpCache();
            
            expect(delete1Called).toBe(true);
            expect(delete2Called).toBe(true);
        });

        it("should not remove cache entries that are still in use", () => {
            const args = { test: 1 };
            const value = { data: "test" };
            
            cacheHelper.cacheOp(args, () => value);
            cacheHelper.cleanUpCache();
            
            cacheHelper.cacheOp(args, () => value);
            cacheHelper.cleanUpCache();
            
            const hash = cacheHelper.computeHash(args);
            expect(cacheHelper.checkCache(hash)).toBeDefined();
        });

        it("should handle empty previous run gracefully", () => {
            const args = { test: 1 };
            const value = { data: "test" };
            
            expect(() => {
                cacheHelper.cleanUpCache();
            }).not.toThrow();
            
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
            
            cacheHelper.cacheOp(args, () => obj);
            
            cacheHelper.cleanUpCache();
            
            cacheHelper.usedHashes = {};
            
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
            
            const objToRemove = { hash: "different", ptr: 200 };
            const result = cacheHelper.remove(array, objToRemove);
            
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
            
            const result1 = cacheHelper.cacheOp({ op: "create", id: 1 }, () => obj1);
            const result2 = cacheHelper.cacheOp({ op: "create", id: 2 }, () => obj2);
            const result3 = cacheHelper.cacheOp({ op: "create", id: 3 }, () => obj3);
            
            expect(result1.hash).toBeDefined();
            expect(result2.hash).toBeDefined();
            expect(result3.hash).toBeDefined();
            expect(result1.hash).not.toBe(result2.hash);
            
            const cached1 = cacheHelper.cacheOp({ op: "create", id: 1 }, () => obj1);
            expect(cached1.hash).toBe(result1.hash);
            
            cacheHelper.cleanUpCache();
            cacheHelper.usedHashes = {};
            cacheHelper.cacheOp({ op: "create", id: 1 }, () => obj1);
            cacheHelper.cleanUpCache();
            
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

    describe("cleaning an entry that holds an array", () => {
        type Deletable = { delete: () => void; data: string };

        const deletable = (data: string, deleted: string[]): Deletable => ({
            data,
            delete: () => { deleted.push(data); },
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

        it("should keep deleting the rest when one object refuses", () => {
            // Arrange
            const deleted: string[] = [];
            const refusing = { data: "refusing", delete: () => { throw new Error("already gone"); } };
            cacheHelper.addToCache("array-hash", [refusing, deletable("second", deleted)]);

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

        it("should delete every kernel object the entry holds when the run no longer uses it", () => {
            // Arrange
            const deleted: string[] = [];
            cacheHelper.addToCache("array-hash", [deletable("first", deleted), deletable("second", deleted)]);
            cacheHelper.usedHashes = { "array-hash": "array-hash" };
            cacheHelper.cleanUpCache();
            cacheHelper.usedHashes = {};

            // Act
            cacheHelper.cleanUpCache();

            // Assert
            expect(deleted).toEqual(["first", "second"]);
        });

        it("should keep deleting the rest of an unused entry when one object refuses", () => {
            // Arrange
            const deleted: string[] = [];
            const refusing = { data: "refusing", delete: () => { throw new Error("already gone"); } };
            cacheHelper.addToCache("array-hash", [refusing, deletable("second", deleted)]);
            cacheHelper.usedHashes = { "array-hash": "array-hash" };
            cacheHelper.cleanUpCache();
            cacheHelper.usedHashes = {};

            // Act
            cacheHelper.cleanUpCache();

            // Assert
            expect(deleted).toEqual(["second"]);
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
    });

    describe("computeHash and stray pointers", () => {
        let reported: unknown[];

        beforeEach(() => {
            reported = [];
            vi.spyOn(console, "error").mockImplementation((message: unknown) => { reported.push(message); });
        });

        afterEach(() => {
            vi.restoreAllMocks();
        });

        it("should say so when a pointer survives the strip", () => {
            // Act
            cacheHelper.computeHash({ ptrCount: 3 });

            // Assert
            expect(reported).toEqual(["YOU DONE MESSED UP YOUR REGEX."]);
        });

        it("should stay quiet for arguments carrying a pointer the strip catches", () => {
            // Act
            cacheHelper.computeHash({ ptr: 140, radius: 3 });

            // Assert
            expect(reported).toEqual([]);
        });
    });

    describe("entries that are not live kernel objects", () => {
        it("should skip an entry that holds nothing when the whole cache is dropped", () => {
            // Arrange
            cacheHelper.argCache["empty"] = null;

            // Act
            cacheHelper.cleanAllCache();

            // Assert
            expect(cacheHelper.argCache).toEqual({});
        });

        it("should leave an object whose delete has been taken away alone", () => {
            // Arrange
            cacheHelper.addToCache("no-delete", { delete: null, data: "kept" });

            // Act
            cacheHelper.cleanAllCache();

            // Assert
            expect(cacheHelper.argCache).toEqual({});
        });

        it("should leave an object whose delete has been taken away alone when its hash is cleaned", () => {
            // Arrange
            cacheHelper.addToCache("no-delete", { delete: null, data: "kept" });

            // Act
            cacheHelper.cleanCacheForHash("no-delete");

            // Assert
            expect(cacheHelper.checkCache("no-delete")).toBeNull();
        });

        it("should leave an object whose delete has been taken away alone when the run stops using it", () => {
            // Arrange
            cacheHelper.addToCache("no-delete", { delete: null, data: "kept" });
            cacheHelper.usedHashes = { "no-delete": "no-delete" };
            cacheHelper.cleanUpCache();
            cacheHelper.usedHashes = {};

            // Act
            cacheHelper.cleanUpCache();

            // Assert
            expect(cacheHelper.argCache).toEqual({});
        });

        it("should delete only the members of a list that are kernel objects", () => {
            // Arrange
            const deleted: string[] = [];
            cacheHelper.addToCache("mixed", [{ delete: () => { deleted.push("first"); } }, { data: "plain" }]);

            // Act
            cacheHelper.cleanAllCache();

            // Assert
            expect(deleted).toEqual(["first"]);
        });

        it("should delete only the kernel objects of a list when its hash is cleaned", () => {
            // Arrange
            const deleted: string[] = [];
            cacheHelper.addToCache("mixed", [{ delete: () => { deleted.push("first"); } }, { data: "plain" }]);

            // Act
            cacheHelper.cleanCacheForHash("mixed");

            // Assert
            expect(deleted).toEqual(["first"]);
        });

        it("should delete only the kernel objects of a list the run stopped using", () => {
            // Arrange
            const deleted: string[] = [];
            cacheHelper.addToCache("mixed", [{ delete: () => { deleted.push("first"); } }, { data: "plain" }]);
            cacheHelper.usedHashes = { mixed: "mixed" };
            cacheHelper.cleanUpCache();
            cacheHelper.usedHashes = {};

            // Act
            cacheHelper.cleanUpCache();

            // Assert
            expect(deleted).toEqual(["first"]);
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
});
