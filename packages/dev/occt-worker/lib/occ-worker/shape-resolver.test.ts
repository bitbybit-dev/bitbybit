import { ShapeResolver, ResultSerializer, FunctionPathResolver } from "./shape-resolver";
import { SHAPE_TYPE_IDENTIFIER, isShapeReference, createShapeReference } from "./constants";
import { CacheHelper } from "./cache-helper";

// Helper to create a mock function that tracks calls
function createMockFn<T = unknown>(): { fn: (...args: unknown[]) => T; calls: unknown[][]; returnValue: T | undefined; mockReturnValue: (val: T) => void; mockImplementation: (impl: (...args: unknown[]) => T) => void } {
    let returnValue: T | undefined;
    let implementation: ((...args: unknown[]) => T) | undefined;
    const calls: unknown[][] = [];
    
    const fn = (...args: unknown[]): T => {
        calls.push(args);
        if (implementation) {
            return implementation(...args);
        }
        return returnValue as T;
    };
    
    return {
        fn,
        calls,
        returnValue,
        mockReturnValue: (val: T) => { returnValue = val; },
        mockImplementation: (impl: (...args: unknown[]) => T) => { implementation = impl; }
    };
}

describe("Shape Resolver Unit Tests", () => {
    describe("isShapeReference", () => {
        it("should return true for valid shape reference", () => {
            expect(isShapeReference({ type: SHAPE_TYPE_IDENTIFIER, hash: 123 })).toBe(true);
            expect(isShapeReference({ type: SHAPE_TYPE_IDENTIFIER, hash: "abc123" })).toBe(true);
        });

        it("should return false for non-shape objects", () => {
            expect(isShapeReference(null)).toBe(false);
            expect(isShapeReference(undefined)).toBe(false);
            expect(isShapeReference(123)).toBe(false);
            expect(isShapeReference("string")).toBe(false);
            expect(isShapeReference({ type: "other", hash: 123 })).toBe(false);
            expect(isShapeReference({ type: SHAPE_TYPE_IDENTIFIER })).toBe(false);
            expect(isShapeReference({ hash: 123 })).toBe(false);
        });
    });

    describe("createShapeReference", () => {
        it("should create valid shape reference with numeric hash", () => {
            const ref = createShapeReference(123);
            expect(ref).toEqual({ type: SHAPE_TYPE_IDENTIFIER, hash: 123 });
        });

        it("should create valid shape reference with string hash", () => {
            const ref = createShapeReference("hash-abc");
            expect(ref).toEqual({ type: SHAPE_TYPE_IDENTIFIER, hash: "hash-abc" });
        });
    });

    describe("ShapeResolver.resolveShapeReferences", () => {
        const mockShape = { $$: {}, someProperty: "value" };
        let mockCheckCache: ReturnType<typeof createMockFn>;
        let mockCacheHelper: Partial<CacheHelper>;
        let shapeResolver: ShapeResolver;

        beforeEach(() => {
            mockCheckCache = createMockFn();
            mockCheckCache.mockImplementation((hash: unknown) => {
                if (hash === 123 || hash === 456 || hash === 789) {
                    return { ...mockShape, hash };
                }
                return null;
            });
            
            mockCacheHelper = {
                checkCache: mockCheckCache.fn as CacheHelper["checkCache"],
            };
            
            shapeResolver = new ShapeResolver(mockCacheHelper as CacheHelper);
        });

        it("should pass through null and undefined", () => {
            expect(shapeResolver.resolveShapeReferences(null)).toBeNull();
            expect(shapeResolver.resolveShapeReferences(undefined)).toBeUndefined();
        });

        it("should pass through primitives unchanged", () => {
            expect(shapeResolver.resolveShapeReferences(123)).toBe(123);
            expect(shapeResolver.resolveShapeReferences("string")).toBe("string");
            expect(shapeResolver.resolveShapeReferences(true)).toBe(true);
        });

        it("should resolve a single shape reference at top level", () => {
            const input = { type: SHAPE_TYPE_IDENTIFIER, hash: 123 };
            const result = shapeResolver.resolveShapeReferences(input);
            
            expect(mockCheckCache.calls.length).toBeGreaterThan(0);
            expect(mockCheckCache.calls[0][0]).toBe(123);
            expect(result).toEqual({ ...mockShape, hash: 123 });
        });

        it("should resolve shape references in object properties", () => {
            const input = {
                shape: { type: SHAPE_TYPE_IDENTIFIER, hash: 123 },
                offset: 5
            };
            const result = shapeResolver.resolveShapeReferences(input);
            
            expect(result).toEqual({
                shape: { ...mockShape, hash: 123 },
                offset: 5
            });
        });

        it("should resolve shape references in arrays", () => {
            const input = [
                { type: SHAPE_TYPE_IDENTIFIER, hash: 123 },
                { type: SHAPE_TYPE_IDENTIFIER, hash: 456 }
            ];
            const result = shapeResolver.resolveShapeReferences(input);
            
            expect(result).toEqual([
                { ...mockShape, hash: 123 },
                { ...mockShape, hash: 456 }
            ]);
        });

        it("should resolve deeply nested shape references", () => {
            const input = {
                config: {
                    inner: {
                        deep: {
                            shape: { type: SHAPE_TYPE_IDENTIFIER, hash: 123 }
                        }
                    }
                }
            };
            const result = shapeResolver.resolveShapeReferences(input);
            
            expect(result).toEqual({
                config: {
                    inner: {
                        deep: {
                            shape: { ...mockShape, hash: 123 }
                        }
                    }
                }
            });
        });

        it("should resolve nested arrays of shape references", () => {
            const input = {
                groups: [
                    [
                        { type: SHAPE_TYPE_IDENTIFIER, hash: 123 },
                        { type: SHAPE_TYPE_IDENTIFIER, hash: 456 }
                    ],
                    [
                        { type: SHAPE_TYPE_IDENTIFIER, hash: 789 }
                    ]
                ]
            };
            const result = shapeResolver.resolveShapeReferences(input);
            
            expect(result).toEqual({
                groups: [
                    [
                        { ...mockShape, hash: 123 },
                        { ...mockShape, hash: 456 }
                    ],
                    [
                        { ...mockShape, hash: 789 }
                    ]
                ]
            });
        });

        it("should resolve mixed structures with shapes and non-shapes", () => {
            const input = {
                name: "test",
                count: 5,
                enabled: true,
                shape: { type: SHAPE_TYPE_IDENTIFIER, hash: 123 },
                nested: {
                    value: 10,
                    shapes: [
                        { type: SHAPE_TYPE_IDENTIFIER, hash: 456 }
                    ]
                }
            };
            const result = shapeResolver.resolveShapeReferences(input);
            
            expect(result).toEqual({
                name: "test",
                count: 5,
                enabled: true,
                shape: { ...mockShape, hash: 123 },
                nested: {
                    value: 10,
                    shapes: [
                        { ...mockShape, hash: 456 }
                    ]
                }
            });
        });

        it("should throw error when shape hash is not in cache", () => {
            const input = { type: SHAPE_TYPE_IDENTIFIER, hash: 999 };
            
            expect(() => shapeResolver.resolveShapeReferences(input)).toThrow(
                "Shape with hash 999 not found in cache"
            );
        });

        it("should preserve empty arrays", () => {
            const input = { shapes: [] };
            const result = shapeResolver.resolveShapeReferences(input);
            expect(result).toEqual({ shapes: [] });
        });

        it("should preserve empty objects", () => {
            const input = { config: {} };
            const result = shapeResolver.resolveShapeReferences(input);
            expect(result).toEqual({ config: {} });
        });
    });
});

describe("Result Serializer Unit Tests", () => {
    describe("serializeResult", () => {
        let mockIsOCCTObject: ReturnType<typeof createMockFn<boolean>>;
        let mockIsShape: ReturnType<typeof createMockFn<boolean>>;
        let mockIsEntityHandle: ReturnType<typeof createMockFn<boolean>>;
        let mockCacheHelper: Partial<CacheHelper>;
        let resultSerializer: ResultSerializer;

        beforeEach(() => {
            mockIsOCCTObject = createMockFn<boolean>();
            mockIsShape = createMockFn<boolean>();
            mockIsEntityHandle = createMockFn<boolean>();
            
            // Default: isShape checks for $$ property and ShapeType method
            mockIsShape.mockImplementation((obj: unknown) => {
                if (obj === null || obj === undefined || typeof obj !== "object") {
                    return false;
                }
                const o = obj as Record<string, unknown>;
                return "$$" in o && typeof o.ShapeType === "function";
            });
            
            // Default: isEntityHandle checks for $$ but NOT ShapeType
            mockIsEntityHandle.mockImplementation((obj: unknown) => {
                if (obj === null || obj === undefined || typeof obj !== "object") {
                    return false;
                }
                const o = obj as Record<string, unknown>;
                return "$$" in o && typeof o.ShapeType !== "function";
            });
            
            mockCacheHelper = {
                isOCCTObject: mockIsOCCTObject.fn as CacheHelper["isOCCTObject"],
                isShape: mockIsShape.fn as CacheHelper["isShape"],
                isEntityHandle: mockIsEntityHandle.fn as CacheHelper["isEntityHandle"],
            };
            resultSerializer = new ResultSerializer(mockCacheHelper as CacheHelper);
        });

        it("should pass through non-OCCT objects unchanged", () => {
            mockIsOCCTObject.mockReturnValue(false);
            
            expect(resultSerializer.serializeResult(123)).toBe(123);
            expect(resultSerializer.serializeResult("string")).toBe("string");
            expect(resultSerializer.serializeResult({ a: 1 })).toEqual({ a: 1 });
        });

        it("should serialize single OCCT object to shape reference", () => {
            mockIsOCCTObject.mockReturnValue(true);
            
            // Mock shape with ShapeType function to be detected as a shape (not entity)
            const shape = { $$: {}, hash: 12345, ShapeType: () => 0 };
            const result = resultSerializer.serializeResult(shape);
            
            expect(result).toEqual({ type: SHAPE_TYPE_IDENTIFIER, hash: 12345 });
        });

        it("should serialize array of OCCT objects to shape references", () => {
            mockIsOCCTObject.mockReturnValue(true);
            
            const shapes = [
                { $$: {}, hash: 123, ShapeType: () => 0 },
                { $$: {}, hash: 456, ShapeType: () => 0 }
            ];
            const result = resultSerializer.serializeResult(shapes);
            
            expect(result).toEqual([
                { type: SHAPE_TYPE_IDENTIFIER, hash: 123 },
                { type: SHAPE_TYPE_IDENTIFIER, hash: 456 }
            ]);
        });

        it("should serialize ObjectDefinition structure", () => {
            // Note: ObjectDefinition compound is handled specially via isObjectDefinition check,
            // so it doesn't need ShapeType. The individual shapes inside do need ShapeType.
            const objDef = {
                compound: { $$: {}, hash: 100, ShapeType: () => 0 },
                data: { someData: "value" },
                shapes: [
                    { id: "shape1", shape: { $$: {}, hash: 101, ShapeType: () => 0 } },
                    { id: "shape2", shape: { $$: {}, hash: 102, ShapeType: () => 0 } }
                ]
            };
            const result = resultSerializer.serializeResult(objDef);
            
            expect(result).toEqual({
                compound: { type: SHAPE_TYPE_IDENTIFIER, hash: 100 },
                data: { someData: "value" },
                shapes: [
                    { id: "shape1", shape: { type: SHAPE_TYPE_IDENTIFIER, hash: 101 } },
                    { id: "shape2", shape: { type: SHAPE_TYPE_IDENTIFIER, hash: 102 } }
                ]
            });
        });

        it("should recursively serialize OCCT objects nested in plain objects (AssemblyPartDef-like)", () => {
            // This tests the scenario where createPart returns { id, shape, name, colorRgba }
            // The shape property contains an OCCT object that needs to be serialized
            const assemblyPart = {
                id: "box",
                shape: { $$: {}, hash: 12345, ShapeType: () => 0 },
                name: "Box Part",
                colorRgba: { r: 1, g: 0, b: 0, a: 1 }
            };
            const result = resultSerializer.serializeResult(assemblyPart);
            
            expect(result).toEqual({
                id: "box",
                shape: { type: SHAPE_TYPE_IDENTIFIER, hash: 12345 },
                name: "Box Part",
                colorRgba: { r: 1, g: 0, b: 0, a: 1 }
            });
        });

        it("should recursively serialize deeply nested OCCT objects", () => {
            const deeplyNested = {
                level1: {
                    level2: {
                        level3: {
                            shape: { $$: {}, hash: 999, ShapeType: () => 0 }
                        }
                    }
                }
            };
            const result = resultSerializer.serializeResult(deeplyNested);
            
            expect(result).toEqual({
                level1: {
                    level2: {
                        level3: {
                            shape: { type: SHAPE_TYPE_IDENTIFIER, hash: 999 }
                        }
                    }
                }
            });
        });

        it("should recursively serialize arrays containing objects with OCCT shapes", () => {
            // This tests combineStructure scenario - parts array with shapes inside
            const parts = [
                { id: "part1", shape: { $$: {}, hash: 111, ShapeType: () => 0 }, name: "Part 1" },
                { id: "part2", shape: { $$: {}, hash: 222, ShapeType: () => 0 }, name: "Part 2" }
            ];
            const result = resultSerializer.serializeResult(parts);
            
            expect(result).toEqual([
                { id: "part1", shape: { type: SHAPE_TYPE_IDENTIFIER, hash: 111 }, name: "Part 1" },
                { id: "part2", shape: { type: SHAPE_TYPE_IDENTIFIER, hash: 222 }, name: "Part 2" }
            ]);
        });

        it("should handle AssemblyStructureDef with parts containing shapes", () => {
            const structure = {
                parts: [
                    { id: "box", shape: { $$: {}, hash: 123, ShapeType: () => 0 }, name: "Box" },
                    { id: "cyl", shape: { $$: {}, hash: 456, ShapeType: () => 0 }, name: "Cylinder" }
                ],
                nodes: [
                    { id: "root", type: "assembly", name: "Root" },
                    { id: "inst1", type: "instance", partId: "box", parentId: "root" }
                ]
            };
            const result = resultSerializer.serializeResult(structure);
            
            expect(result).toEqual({
                parts: [
                    { id: "box", shape: { type: SHAPE_TYPE_IDENTIFIER, hash: 123 }, name: "Box" },
                    { id: "cyl", shape: { type: SHAPE_TYPE_IDENTIFIER, hash: 456 }, name: "Cylinder" }
                ],
                nodes: [
                    { id: "root", type: "assembly", name: "Root" },
                    { id: "inst1", type: "instance", partId: "box", parentId: "root" }
                ]
            });
        });

        it("should preserve null and undefined values during recursive serialization", () => {
            mockIsOCCTObject.mockReturnValue(false);
            
            const input = {
                nullProp: null,
                undefinedProp: undefined,
                validProp: "value"
            };
            const result = resultSerializer.serializeResult(input);
            
            expect(result).toEqual({
                nullProp: null,
                undefinedProp: undefined,
                validProp: "value"
            });
        });

        it("should preserve Uint8Array (binary data) without converting to plain object", () => {
            mockIsOCCTObject.mockReturnValue(false);
            
            const binaryData = new Uint8Array([71, 76, 84, 70, 2, 0, 0, 0]); // glTF magic bytes
            const result = resultSerializer.serializeResult(binaryData);
            
            // Should return the same Uint8Array, not a plain object
            expect(result).toBeInstanceOf(Uint8Array);
            expect(result).toBe(binaryData);
            expect((result as Uint8Array).length).toBe(8);
        });

        it("should preserve other typed arrays (Float32Array, Int32Array)", () => {
            mockIsOCCTObject.mockReturnValue(false);
            
            const floatData = new Float32Array([1.0, 2.0, 3.0]);
            const intData = new Int32Array([1, 2, 3]);
            
            const floatResult = resultSerializer.serializeResult(floatData);
            const intResult = resultSerializer.serializeResult(intData);
            
            expect(floatResult).toBeInstanceOf(Float32Array);
            expect(floatResult).toBe(floatData);
            expect(intResult).toBeInstanceOf(Int32Array);
            expect(intResult).toBe(intData);
        });

        it("should preserve typed arrays nested in objects", () => {
            mockIsOCCTObject.mockReturnValue(false);
            
            const input = {
                data: new Uint8Array([1, 2, 3]),
                name: "test"
            };
            const result = resultSerializer.serializeResult(input) as { data: Uint8Array; name: string };
            
            expect(result.data).toBeInstanceOf(Uint8Array);
            expect(result.data).toBe(input.data);
            expect(result.name).toBe("test");
        });
    });
});

describe("Function Path Resolver Unit Tests", () => {
    let functionPathResolver: FunctionPathResolver;

    beforeEach(() => {
        functionPathResolver = new FunctionPathResolver();
    });

    describe("callFunction", () => {
        it("should call function at root level", () => {
            const calls: unknown[][] = [];
            const mockFn = (...args: unknown[]) => { calls.push(args); return "result"; };
            const root = { myFunction: mockFn };
            
            const result = functionPathResolver.callFunction(root, "myFunction", { arg: 1 });
            
            expect(calls[0]).toEqual([{ arg: 1 }]);
            expect(result).toBe("result");
        });

        it("should call function nested one level deep", () => {
            const calls: unknown[][] = [];
            const mockFn = (...args: unknown[]) => { calls.push(args); return "result"; };
            const root = {
                shapes: {
                    createBox: mockFn
                }
            };
            
            const result = functionPathResolver.callFunction(root, "shapes.createBox", { size: 5 });
            
            expect(calls[0]).toEqual([{ size: 5 }]);
            expect(result).toBe("result");
        });

        it("should call function nested two levels deep", () => {
            const calls: unknown[][] = [];
            const mockFn = (...args: unknown[]) => { calls.push(args); return "result"; };
            const root = {
                shapes: {
                    wire: {
                        createCircleWire: mockFn
                    }
                }
            };
            
            const result = functionPathResolver.callFunction(root, "shapes.wire.createCircleWire", { radius: 1 });
            
            expect(calls[0]).toEqual([{ radius: 1 }]);
            expect(result).toBe("result");
        });

        it("should call function nested three levels deep", () => {
            const calls: unknown[][] = [];
            const mockFn = (...args: unknown[]) => { calls.push(args); return "result"; };
            const root = {
                a: {
                    b: {
                        c: {
                            deepFunction: mockFn
                        }
                    }
                }
            };
            
            const result = functionPathResolver.callFunction(root, "a.b.c.deepFunction", { x: 1 });
            
            expect(calls[0]).toEqual([{ x: 1 }]);
            expect(result).toBe("result");
        });

        it("should throw error for invalid path", () => {
            const root = { shapes: null };
            
            expect(() => {
                functionPathResolver.callFunction(root, "shapes.wire.create", {});
            }).toThrow("Cannot resolve path \"shapes.wire.create\"");
        });

        it("should throw error when function does not exist", () => {
            const root = { shapes: { wire: {} } };
            
            expect(() => {
                functionPathResolver.callFunction(root, "shapes.wire.nonExistent", {});
            }).toThrow("\"shapes.wire.nonExistent\" is not a function");
        });

        it("should preserve this context when calling function", () => {
            const root = {
                shapes: {
                    value: 42,
                    getValue: function() { return this.value; }
                }
            };
            
            const result = functionPathResolver.callFunction(root, "shapes.getValue", {});
            
            expect(result).toBe(42);
        });
    });
});

