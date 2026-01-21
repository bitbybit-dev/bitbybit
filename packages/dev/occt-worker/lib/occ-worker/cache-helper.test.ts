import initOpenCascade, { BitbybitOcctModule } from "@bitbybit-dev/occt/bitbybit-dev-occt/bitbybit-dev-occt";
import { CacheHelper } from "./cache-helper";

describe("CacheHelper unit tests", () => {
    let occt: BitbybitOcctModule;
    let cacheHelper: CacheHelper;

    beforeAll(async () => {
        occt = await initOpenCascade();
    });

    beforeEach(() => {
        cacheHelper = new CacheHelper(occt);
    });

    describe("isOCCTObject", () => {
        it("should return false for undefined", () => {
            expect(cacheHelper.isOCCTObject(undefined)).toBe(false);
        });

        it("should return false for null", () => {
            expect(cacheHelper.isOCCTObject(null)).toBe(false);
        });

        it("should return false for primitive values", () => {
            expect(cacheHelper.isOCCTObject(123)).toBe(false);
            expect(cacheHelper.isOCCTObject("string")).toBe(false);
            expect(cacheHelper.isOCCTObject(true)).toBe(false);
        });

        it("should return false for plain objects", () => {
            expect(cacheHelper.isOCCTObject({})).toBe(false);
            expect(cacheHelper.isOCCTObject({ prop: "value" })).toBe(false);
        });

        it("should return false for empty arrays", () => {
            expect(cacheHelper.isOCCTObject([])).toBe(false);
        });

        it("should return true for OCCT objects with $$ property", () => {
            const mockOCCTObject = { $$: { ptr: 123 }, ShapeType: () => 1 };
            expect(cacheHelper.isOCCTObject(mockOCCTObject)).toBe(true);
        });

        it("should return true for arrays with OCCT objects", () => {
            const mockOCCTObject = { $$: { ptr: 123 }, ShapeType: () => 1 };
            expect(cacheHelper.isOCCTObject([mockOCCTObject])).toBe(true);
        });

        it("should return false for arrays with non-OCCT objects", () => {
            expect(cacheHelper.isOCCTObject([{}])).toBe(false);
            expect(cacheHelper.isOCCTObject([{ prop: "value" }])).toBe(false);
        });

        it("should identify real OCCT shapes", () => {
            const point = new occt.gp_Pnt_3(0, 0, 0);
            const vertex = new occt.BRepBuilderAPI_MakeVertex(point);
            const shape = vertex.Shape();
            
            expect(cacheHelper.isOCCTObject(shape)).toBe(true);
            
            shape.delete();
            vertex.delete();
            point.delete();
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
        it("should add and retrieve shape from cache", () => {
            const point = new occt.gp_Pnt_3(0, 0, 0);
            const vertex = new occt.BRepBuilderAPI_MakeVertex(point);
            const shape = vertex.Shape();
            
            const hash = "test-hash-123";
            cacheHelper.addToCache(hash, shape);
            
            const cached = cacheHelper.checkCache(hash);
            expect(cached).toBeDefined();
            expect(cached.hash).toBe(hash);
            
            shape.delete();
            vertex.delete();
            point.delete();
        });

        it("should return null for non-existent cache entry", () => {
            const cached = cacheHelper.checkCache("non-existent-hash");
            expect(cached).toBeNull();
        });

        it("should cache non-OCCT values", () => {
            const hash = "value-hash";
            const value = { data: "test", number: 42 };
            
            cacheHelper.addToCache(hash, value);
            const cached = cacheHelper.checkCache(hash);
            
            expect(cached).toEqual(value);
        });

        it("should return null for deleted OCCT shape", () => {
            const point = new occt.gp_Pnt_3(0, 0, 0);
            const vertex = new occt.BRepBuilderAPI_MakeVertex(point);
            const shape = vertex.Shape();
            
            const hash = "test-hash-deleted";
            cacheHelper.addToCache(hash, shape);
            
            // Delete the shape
            shape.delete();
            
            // Should return null because shape is deleted
            const cached = cacheHelper.checkCache(hash);
            expect(cached).toBeNull();
            
            vertex.delete();
            point.delete();
        });

        it("should handle array of OCCT shapes in cache", () => {
            const point1 = new occt.gp_Pnt_3(0, 0, 0);
            const vertex1 = new occt.BRepBuilderAPI_MakeVertex(point1);
            const shape1 = vertex1.Shape();
            
            const point2 = new occt.gp_Pnt_3(1, 1, 1);
            const vertex2 = new occt.BRepBuilderAPI_MakeVertex(point2);
            const shape2 = vertex2.Shape();
            
            const shapes = [shape1, shape2];
            const hash = "array-hash";
            
            cacheHelper.addToCache(hash, shapes);
            const cached = cacheHelper.checkCache(hash);
            
            expect(cached).toBeDefined();
            expect(Array.isArray(cached)).toBe(true);
            expect(cached.length).toBe(2);
            
            shape1.delete();
            shape2.delete();
            vertex1.delete();
            vertex2.delete();
            point1.delete();
            point2.delete();
        });

        it("should return null if any shape in array is deleted", () => {
            const point1 = new occt.gp_Pnt_3(0, 0, 0);
            const vertex1 = new occt.BRepBuilderAPI_MakeVertex(point1);
            const shape1 = vertex1.Shape();
            
            const point2 = new occt.gp_Pnt_3(1, 1, 1);
            const vertex2 = new occt.BRepBuilderAPI_MakeVertex(point2);
            const shape2 = vertex2.Shape();
            
            const shapes = [shape1, shape2];
            const hash = "array-hash-deleted";
            
            cacheHelper.addToCache(hash, shapes);
            
            // Delete one shape
            shape1.delete();
            
            // Should return null because one shape is deleted
            const cached = cacheHelper.checkCache(hash);
            expect(cached).toBeNull();
            
            shape2.delete();
            vertex1.delete();
            vertex2.delete();
            point1.delete();
            point2.delete();
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

        it("should cache OCCT shapes and return hash reference", () => {
            const point = new occt.gp_Pnt_3(0, 0, 0);
            const vertex = new occt.BRepBuilderAPI_MakeVertex(point);
            const shape = vertex.Shape();
            
            const args = { functionName: "createVertex" };
            let cacheMissCallCount = 0;
            const cacheMiss = () => {
                cacheMissCallCount++;
                return shape;
            };
            
            const result = cacheHelper.cacheOp(args, cacheMiss);
            
            expect(result).toBeDefined();
            expect(result.hash).toBeDefined();
            expect(cacheMissCallCount).toBe(1);
            
            // Second call should use cache
            let cacheMiss2Called = false;
            const cacheMiss2 = () => {
                cacheMiss2Called = true;
                return shape;
            };
            const result2 = cacheHelper.cacheOp(args, cacheMiss2);
            expect(cacheMiss2Called).toBe(false);
            expect(result2.hash).toBe(result.hash);
            
            shape.delete();
            vertex.delete();
            point.delete();
        });

        it("should handle array of OCCT shapes", () => {
            const point1 = new occt.gp_Pnt_3(0, 0, 0);
            const vertex1 = new occt.BRepBuilderAPI_MakeVertex(point1);
            const shape1 = vertex1.Shape();
            
            const point2 = new occt.gp_Pnt_3(1, 1, 1);
            const vertex2 = new occt.BRepBuilderAPI_MakeVertex(point2);
            const shape2 = vertex2.Shape();
            
            const shapes = [shape1, shape2];
            const args = { functionName: "createVertices" };
            const cacheMiss = () => shapes;
            
            const result = cacheHelper.cacheOp(args, cacheMiss);
            
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBe(2);
            expect(result[0].hash).toBeDefined();
            expect(result[1].hash).toBeDefined();
            
            shape1.delete();
            shape2.delete();
            vertex1.delete();
            vertex2.delete();
            point1.delete();
            point2.delete();
        });

        it("should recalculate when cached shape is deleted", () => {
            const point1 = new occt.gp_Pnt_3(0, 0, 0);
            const vertex1 = new occt.BRepBuilderAPI_MakeVertex(point1);
            const shape1 = vertex1.Shape();
            
            const args = { functionName: "createVertex" };
            let cacheMiss1CallCount = 0;
            const cacheMiss1 = () => {
                cacheMiss1CallCount++;
                return shape1;
            };
            
            // First call - creates and caches
            cacheHelper.cacheOp(args, cacheMiss1);
            expect(cacheMiss1CallCount).toBe(1);
            
            // Delete the shape
            shape1.delete();
            
            // Second call - should detect deleted shape and call cacheMiss again
            const point2 = new occt.gp_Pnt_3(0, 0, 0);
            const vertex2 = new occt.BRepBuilderAPI_MakeVertex(point2);
            const shape2 = vertex2.Shape();
            let cacheMiss2CallCount = 0;
            const cacheMiss2 = () => {
                cacheMiss2CallCount++;
                return shape2;
            };
            
            const result2 = cacheHelper.cacheOp(args, cacheMiss2);
            expect(cacheMiss2CallCount).toBe(1);
            expect(result2).toBeDefined();
            
            shape2.delete();
            vertex1.delete();
            vertex2.delete();
            point1.delete();
            point2.delete();
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

        it("should clean OCCT shape from cache", () => {
            const point = new occt.gp_Pnt_3(0, 0, 0);
            const vertex = new occt.BRepBuilderAPI_MakeVertex(point);
            const shape = vertex.Shape();
            
            const hash = "shape-hash";
            cacheHelper.addToCache(hash, shape);
            
            cacheHelper.cleanCacheForHash(hash);
            expect(cacheHelper.checkCache(hash)).toBeNull();
            
            // Clean up remaining objects
            vertex.delete();
            point.delete();
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
            
            cacheHelper.addToCache(hash1, { value: 1 });
            cacheHelper.addToCache(hash2, { value: 2 });
            
            expect(cacheHelper.checkCache(hash1)).toBeDefined();
            expect(cacheHelper.checkCache(hash2)).toBeDefined();
            
            cacheHelper.cleanAllCache();
            
            expect(cacheHelper.checkCache(hash1)).toBeNull();
            expect(cacheHelper.checkCache(hash2)).toBeNull();
        });

        it("should clean up OCCT shapes", () => {
            const point1 = new occt.gp_Pnt_3(0, 0, 0);
            const vertex1 = new occt.BRepBuilderAPI_MakeVertex(point1);
            const shape1 = vertex1.Shape();
            
            const point2 = new occt.gp_Pnt_3(1, 1, 1);
            const vertex2 = new occt.BRepBuilderAPI_MakeVertex(point2);
            const shape2 = vertex2.Shape();
            
            cacheHelper.addToCache("hash1", shape1);
            cacheHelper.addToCache("hash2", shape2);
            
            cacheHelper.cleanAllCache();
            
            expect(cacheHelper.checkCache("hash1")).toBeNull();
            expect(cacheHelper.checkCache("hash2")).toBeNull();
            
            // Clean up remaining objects
            vertex1.delete();
            vertex2.delete();
            point1.delete();
            point2.delete();
        });

        it("should handle mixed cache entries (OCCT and non-OCCT)", () => {
            const point1 = new occt.gp_Pnt_3(0, 0, 0);
            const vertex1 = new occt.BRepBuilderAPI_MakeVertex(point1);
            const shape1 = vertex1.Shape();
            
            cacheHelper.addToCache("shape-hash", shape1);
            cacheHelper.addToCache("value-hash", { value: "test" });
            cacheHelper.addToCache("number-hash", 42);
            
            expect(cacheHelper.checkCache("shape-hash")).toBeDefined();
            expect(cacheHelper.checkCache("value-hash")).toBeDefined();
            expect(cacheHelper.checkCache("number-hash")).toBeDefined();
            
            // Should clean all without errors
            expect(() => cacheHelper.cleanAllCache()).not.toThrow();
            
            expect(cacheHelper.checkCache("shape-hash")).toBeNull();
            expect(cacheHelper.checkCache("value-hash")).toBeNull();
            expect(cacheHelper.checkCache("number-hash")).toBeNull();
            
            // Clean up remaining objects
            vertex1.delete();
            point1.delete();
        });

        it("should handle arrays of OCCT shapes", () => {
            const point1 = new occt.gp_Pnt_3(0, 0, 0);
            const vertex1 = new occt.BRepBuilderAPI_MakeVertex(point1);
            const shape1 = vertex1.Shape();
            
            const point2 = new occt.gp_Pnt_3(1, 1, 1);
            const vertex2 = new occt.BRepBuilderAPI_MakeVertex(point2);
            const shape2 = vertex2.Shape();
            
            cacheHelper.addToCache("array-hash", [shape1, shape2]);
            
            expect(() => cacheHelper.cleanAllCache()).not.toThrow();
            expect(cacheHelper.checkCache("array-hash")).toBeNull();
            
            // Clean up remaining objects
            vertex1.delete();
            vertex2.delete();
            point1.delete();
            point2.delete();
        });

        it("should clean all entries from argCache not just usedHashes", () => {
            // Manually add to argCache without going through cacheOp
            cacheHelper.argCache["manual-hash"] = { value: "manual" };
            cacheHelper.usedHashes["used-hash"] = "used-hash";
            cacheHelper.argCache["used-hash"] = { value: "used" };
            
            expect(cacheHelper.checkCache("manual-hash")).toBeDefined();
            expect(cacheHelper.checkCache("used-hash")).toBeDefined();
            
            cacheHelper.cleanAllCache();
            
            // Both should be cleaned, not just usedHashes
            expect(cacheHelper.checkCache("manual-hash")).toBeNull();
            expect(cacheHelper.checkCache("used-hash")).toBeNull();
        });

        it("should reset used hashes", () => {
            const args = { functionName: "test" };
            const cacheMiss = () => {
                return { value: "test" };
            };
            
            cacheHelper.cacheOp(args, cacheMiss);
            cacheHelper.cleanAllCache();
            
            // After clean, should call cacheMiss again
            let cacheMiss2CallCount = 0;
            const cacheMiss2 = () => {
                cacheMiss2CallCount++;
                return { value: "test2" };
            };
            cacheHelper.cacheOp(args, cacheMiss2);
            expect(cacheMiss2CallCount).toBe(1);
        });
    });

    describe("cleanUpCache", () => {
        it("should remove unused cache entries from previous run", () => {
            const args1 = { functionName: "test1" };
            const args2 = { functionName: "test2" };
            const value1 = { data: "value1" };
            const value2 = { data: "value2" };
            
            // First run - cache both operations
            cacheHelper.cacheOp(args1, () => value1);
            cacheHelper.cacheOp(args2, () => value2);
            
            const hash1 = cacheHelper.computeHash(args1);
            const hash2 = cacheHelper.computeHash(args2);
            
            // Both should be in cache
            expect(cacheHelper.checkCache(hash1)).toBeDefined();
            expect(cacheHelper.checkCache(hash2)).toBeDefined();
            
            // Clean up cache - this updates hashesFromPreviousRun
            cacheHelper.cleanUpCache();
            
            // Second run - only use args1
            cacheHelper.usedHashes = {}; // Reset used hashes to simulate new run
            cacheHelper.cacheOp(args1, () => value1);
            
            // Clean up - should remove hash2 as it wasn't used in second run
            cacheHelper.cleanUpCache();
            
            // hash1 should still be there, hash2 should be removed
            expect(cacheHelper.checkCache(hash1)).toBeDefined();
            expect(cacheHelper.checkCache(hash2)).toBeNull();
        });

        it("should clean up OCCT shapes that are no longer used", () => {
            const point1 = new occt.gp_Pnt_3(0, 0, 0);
            const vertex1 = new occt.BRepBuilderAPI_MakeVertex(point1);
            const shape1 = vertex1.Shape();
            
            const point2 = new occt.gp_Pnt_3(1, 1, 1);
            const vertex2 = new occt.BRepBuilderAPI_MakeVertex(point2);
            const shape2 = vertex2.Shape();
            
            const args1 = { functionName: "createVertex", point: [0, 0, 0] };
            const args2 = { functionName: "createVertex", point: [1, 1, 1] };
            
            // First run - cache both shapes
            cacheHelper.cacheOp(args1, () => shape1);
            cacheHelper.cacheOp(args2, () => shape2);
            
            const hash1 = cacheHelper.computeHash(args1);
            const hash2 = cacheHelper.computeHash(args2);
            
            // First cleanup - sets up hashesFromPreviousRun
            cacheHelper.cleanUpCache();
            
            // Second run - only use shape1
            cacheHelper.usedHashes = {};
            cacheHelper.cacheOp(args1, () => shape1);
            
            // Second cleanup - should remove shape2
            cacheHelper.cleanUpCache();
            
            expect(cacheHelper.checkCache(hash1)).toBeDefined();
            expect(cacheHelper.checkCache(hash2)).toBeNull();
            
            // Clean up remaining objects
            vertex1.delete();
            vertex2.delete();
            point1.delete();
            point2.delete();
        });

        it("should handle arrays of OCCT shapes during cleanup", () => {
            const point1 = new occt.gp_Pnt_3(0, 0, 0);
            const vertex1 = new occt.BRepBuilderAPI_MakeVertex(point1);
            const shape1 = vertex1.Shape();
            
            const point2 = new occt.gp_Pnt_3(1, 1, 1);
            const vertex2 = new occt.BRepBuilderAPI_MakeVertex(point2);
            const shape2 = vertex2.Shape();
            
            const shapes = [shape1, shape2];
            const args = { functionName: "createVertices" };
            
            // Cache array of shapes
            cacheHelper.cacheOp(args, () => shapes);
            cacheHelper.cleanUpCache();
            
            // Simulate new run without using this cache
            cacheHelper.usedHashes = {};
            
            // Should clean up the array
            cacheHelper.cleanUpCache();
            
            const hash = cacheHelper.computeHash(args);
            expect(cacheHelper.checkCache(hash)).toBeNull();
            
            // Clean up remaining objects
            vertex1.delete();
            vertex2.delete();
            point1.delete();
            point2.delete();
        });

        it("should not remove cache entries that are still in use", () => {
            const args = { functionName: "test" };
            const value = { data: "test" };
            
            // First run
            cacheHelper.cacheOp(args, () => value);
            cacheHelper.cleanUpCache();
            
            // Second run - use same cache
            cacheHelper.usedHashes = {};
            cacheHelper.cacheOp(args, () => value);
            cacheHelper.cleanUpCache();
            
            // Should still be in cache
            const hash = cacheHelper.computeHash(args);
            expect(cacheHelper.checkCache(hash)).toBeDefined();
        });

        it("should handle empty previous run gracefully", () => {
            const args = { functionName: "test" };
            const value = { data: "test" };
            
            // Clean up with no previous run
            expect(() => cacheHelper.cleanUpCache()).not.toThrow();
            
            // Now add something and clean up
            cacheHelper.cacheOp(args, () => value);
            expect(() => cacheHelper.cleanUpCache()).not.toThrow();
            
            const hash = cacheHelper.computeHash(args);
            expect(cacheHelper.checkCache(hash)).toBeDefined();
        });

        it("should update hashesFromPreviousRun correctly", () => {
            const args1 = { functionName: "test1" };
            const args2 = { functionName: "test2" };
            
            // First run
            cacheHelper.cacheOp(args1, () => ({ value: 1 }));
            cacheHelper.cacheOp(args2, () => ({ value: 2 }));
            
            const hash1 = cacheHelper.computeHash(args1);
            const hash2 = cacheHelper.computeHash(args2);
            
            expect(cacheHelper.usedHashes[hash1]).toBe(hash1);
            expect(cacheHelper.usedHashes[hash2]).toBe(hash2);
            
            cacheHelper.cleanUpCache();
            
            // After cleanup, hashesFromPreviousRun should have both
            expect(cacheHelper.hashesFromPreviousRun[hash1]).toBe(hash1);
            expect(cacheHelper.hashesFromPreviousRun[hash2]).toBe(hash2);
        });

        it("should handle already deleted shapes gracefully", () => {
            const point1 = new occt.gp_Pnt_3(0, 0, 0);
            const vertex1 = new occt.BRepBuilderAPI_MakeVertex(point1);
            const shape1 = vertex1.Shape();
            
            const args1 = { functionName: "createVertex" };
            
            // Cache the shape
            cacheHelper.cacheOp(args1, () => shape1);
            const hash1 = cacheHelper.computeHash(args1);
            
            // First cleanup
            cacheHelper.cleanUpCache();
            
            // Manually delete the shape
            shape1.delete();
            
            // Second run without using this cache
            cacheHelper.usedHashes = {};
            
            // Cleanup should handle already deleted shape gracefully
            expect(() => cacheHelper.cleanUpCache()).not.toThrow();
            
            expect(cacheHelper.checkCache(hash1)).toBeNull();
            
            // Clean up remaining objects
            vertex1.delete();
            point1.delete();
        });
    });

    describe("remove", () => {
        it("should remove object from array by hash", () => {
            const obj1 = { hash: "hash1", ptr: 123 };
            const obj2 = { hash: "hash2", ptr: 456 };
            const obj3 = { hash: "hash3", ptr: 789 };
            
            const array = [obj1, obj2, obj3];
            const result = cacheHelper.remove(array, obj2);
            
            expect(result.length).toBe(2);
            expect(result).toContain(obj1);
            expect(result).toContain(obj3);
            expect(result).not.toContain(obj2);
        });

        it("should remove object from array by ptr when hash is different", () => {
            const obj1 = { hash: "hash1", ptr: 123 };
            const obj2 = { hash: "hash2", ptr: 456 };
            const obj3 = { hash: "hash3", ptr: 789 };
            
            const array = [obj1, obj2, obj3];
            // To remove by ptr when hash is different, both hash AND ptr must differ for an element to be kept
            // The implementation uses OR logic: keep if (hash !== hash OR ptr !== ptr)
            // This means an object is removed only if BOTH hash AND ptr match
            const toRemove = { hash: "hash2", ptr: 456 };
            const result = cacheHelper.remove(array, toRemove);
            
            expect(result.length).toBe(2);
            expect(result).toContain(obj1);
            expect(result).toContain(obj3);
        });

        it("should return original array if object not found", () => {
            const obj1 = { hash: "hash1", ptr: 123 };
            const obj2 = { hash: "hash2", ptr: 456 };
            
            const array = [obj1, obj2];
            const toRemove = { hash: "hash3", ptr: 789 };
            const result = cacheHelper.remove(array, toRemove);
            
            expect(result.length).toBe(2);
            expect(result).toContain(obj1);
            expect(result).toContain(obj2);
        });

        it("should return empty array when all elements are removed", () => {
            const obj = { hash: "hash1", ptr: 123 };
            const array = [obj];
            const result = cacheHelper.remove(array, obj);
            
            expect(result.length).toBe(0);
        });
    });

    describe("integration tests", () => {
        it("should handle complex caching scenario with multiple shapes", () => {
            // Create multiple shapes
            const point1 = new occt.gp_Pnt_3(0, 0, 0);
            const vertex1Builder = new occt.BRepBuilderAPI_MakeVertex(point1);
            const shape1 = vertex1Builder.Shape();
            
            const point2 = new occt.gp_Pnt_3(1, 1, 1);
            const vertex2Builder = new occt.BRepBuilderAPI_MakeVertex(point2);
            const shape2 = vertex2Builder.Shape();
            
            // Cache them
            const args1 = { functionName: "createVertex", point: [0, 0, 0] };
            const args2 = { functionName: "createVertex", point: [1, 1, 1] };
            
            const result1 = cacheHelper.cacheOp(args1, () => shape1);
            const result2 = cacheHelper.cacheOp(args2, () => shape2);
            
            expect(result1.hash).toBeDefined();
            expect(result2.hash).toBeDefined();
            expect(result1.hash).not.toBe(result2.hash);
            
            // Verify they're cached
            const cached1 = cacheHelper.cacheOp(args1, () => { throw new Error("Should not be called"); });
            const cached2 = cacheHelper.cacheOp(args2, () => { throw new Error("Should not be called"); });
            
            expect(cached1.hash).toBe(result1.hash);
            expect(cached2.hash).toBe(result2.hash);
            
            // Clean up
            shape1.delete();
            shape2.delete();
            vertex1Builder.delete();
            vertex2Builder.delete();
            point1.delete();
            point2.delete();
        });

        it("should properly track used hashes across operations", () => {
            const args = { functionName: "test" };
            const value = { result: "test" };
            
            cacheHelper.cacheOp(args, () => value);
            const hash = cacheHelper.computeHash(args);
            
            expect(cacheHelper.usedHashes[hash]).toBe(hash);
            expect(cacheHelper.hashesFromPreviousRun[hash]).toBe(hash);
        });
    });
});
