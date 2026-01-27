import { WorkerMessages, ReservedFunctions, NON_CACHEABLE_FUNCTIONS, CACHE_THRESHOLD, SHAPE_TYPE_IDENTIFIER } from "./constants";

describe("Constants Unit Tests", () => {
    describe("WorkerMessages", () => {
        it("should have correct INITIALIZED message", () => {
            expect(WorkerMessages.INITIALIZED).toBe("occ-initialised");
        });

        it("should have correct BUSY message", () => {
            expect(WorkerMessages.BUSY).toBe("busy");
        });
    });

    describe("ReservedFunctions", () => {
        it("should have all expected reserved function names", () => {
            expect(ReservedFunctions.SHAPE_TO_MESH).toBe("shapeToMesh");
            expect(ReservedFunctions.SHAPES_TO_MESHES).toBe("shapesToMeshes");
            expect(ReservedFunctions.DELETE_SHAPE).toBe("deleteShape");
            expect(ReservedFunctions.DELETE_SHAPES).toBe("deleteShapes");
            expect(ReservedFunctions.STARTED_THE_RUN).toBe("startedTheRun");
            expect(ReservedFunctions.CLEAN_ALL_CACHE).toBe("cleanAllCache");
            expect(ReservedFunctions.ADD_OC).toBe("addOc");
            expect(ReservedFunctions.SAVE_SHAPE_STEP).toBe("saveShapeSTEP");
        });
    });

    describe("NON_CACHEABLE_FUNCTIONS", () => {
        it("should be a Set containing all reserved functions", () => {
            expect(NON_CACHEABLE_FUNCTIONS).toBeInstanceOf(Set);
            expect(NON_CACHEABLE_FUNCTIONS.has(ReservedFunctions.SHAPE_TO_MESH)).toBe(true);
            expect(NON_CACHEABLE_FUNCTIONS.has(ReservedFunctions.SHAPES_TO_MESHES)).toBe(true);
            expect(NON_CACHEABLE_FUNCTIONS.has(ReservedFunctions.DELETE_SHAPE)).toBe(true);
            expect(NON_CACHEABLE_FUNCTIONS.has(ReservedFunctions.DELETE_SHAPES)).toBe(true);
            expect(NON_CACHEABLE_FUNCTIONS.has(ReservedFunctions.STARTED_THE_RUN)).toBe(true);
            expect(NON_CACHEABLE_FUNCTIONS.has(ReservedFunctions.CLEAN_ALL_CACHE)).toBe(true);
            expect(NON_CACHEABLE_FUNCTIONS.has(ReservedFunctions.ADD_OC)).toBe(true);
            expect(NON_CACHEABLE_FUNCTIONS.has(ReservedFunctions.SAVE_SHAPE_STEP)).toBe(true);
        });

        it("should return false for non-reserved functions", () => {
            expect(NON_CACHEABLE_FUNCTIONS.has("shapes.wire.createCircleWire")).toBe(false);
            expect(NON_CACHEABLE_FUNCTIONS.has("operations.loftAdvanced")).toBe(false);
        });
    });

    describe("CACHE_THRESHOLD", () => {
        it("should be a positive number", () => {
            expect(CACHE_THRESHOLD).toBeGreaterThan(0);
            expect(CACHE_THRESHOLD).toBe(10000);
        });
    });

    describe("SHAPE_TYPE_IDENTIFIER", () => {
        it("should be the correct string", () => {
            expect(SHAPE_TYPE_IDENTIFIER).toBe("occ-shape");
        });
    });
});

describe("Command Handlers Unit Tests", () => {
    // Import dynamically to avoid issues with module loading
    describe("getCommandHandler", () => {
        it("should return handler for reserved functions", async () => {
            const { getCommandHandler } = await import("./command-handlers");
            
            expect(getCommandHandler(ReservedFunctions.SHAPE_TO_MESH)).toBeDefined();
            expect(getCommandHandler(ReservedFunctions.SHAPES_TO_MESHES)).toBeDefined();
            expect(getCommandHandler(ReservedFunctions.DELETE_SHAPE)).toBeDefined();
            expect(getCommandHandler(ReservedFunctions.DELETE_SHAPES)).toBeDefined();
            expect(getCommandHandler(ReservedFunctions.STARTED_THE_RUN)).toBeDefined();
            expect(getCommandHandler(ReservedFunctions.CLEAN_ALL_CACHE)).toBeDefined();
            expect(getCommandHandler(ReservedFunctions.ADD_OC)).toBeDefined();
            expect(getCommandHandler(ReservedFunctions.SAVE_SHAPE_STEP)).toBeDefined();
        });

        it("should return undefined for non-reserved functions", async () => {
            const { getCommandHandler } = await import("./command-handlers");
            
            expect(getCommandHandler("shapes.wire.createCircleWire")).toBeUndefined();
            expect(getCommandHandler("operations.loftAdvanced")).toBeUndefined();
            expect(getCommandHandler("randomFunction")).toBeUndefined();
        });
    });

    describe("DELETE_SHAPE handler", () => {
        it("should call cleanCacheForHash with the shape hash", async () => {
            const { CommandHandlers } = await import("./command-handlers");
            
            const mockCleanCacheForHash = createTrackingFn();
            const mockContext = {
                cacheHelper: {
                    cleanCacheForHash: mockCleanCacheForHash.fn,
                },
            } as any;

            const result = CommandHandlers[ReservedFunctions.DELETE_SHAPE](
                { shape: { hash: 12345 } },
                mockContext
            );

            expect(result.handled).toBe(true);
            expect(result.result).toEqual({});
            expect(mockCleanCacheForHash.calls[0][0]).toBe(12345);
        });
    });

    describe("DELETE_SHAPES handler", () => {
        it("should call cleanCacheForHash for each shape", async () => {
            const { CommandHandlers } = await import("./command-handlers");
            
            const mockCleanCacheForHash = createTrackingFn();
            const mockContext = {
                cacheHelper: {
                    cleanCacheForHash: mockCleanCacheForHash.fn,
                },
            } as any;

            const result = CommandHandlers[ReservedFunctions.DELETE_SHAPES](
                { shapes: [{ hash: 111 }, { hash: 222 }, { hash: 333 }] },
                mockContext
            );

            expect(result.handled).toBe(true);
            expect(result.result).toEqual({});
            expect(mockCleanCacheForHash.calls.length).toBe(3);
            expect(mockCleanCacheForHash.calls[0][0]).toBe(111);
            expect(mockCleanCacheForHash.calls[1][0]).toBe(222);
            expect(mockCleanCacheForHash.calls[2][0]).toBe(333);
        });
    });

    describe("CLEAN_ALL_CACHE handler", () => {
        it("should call cleanAllCache", async () => {
            const { CommandHandlers } = await import("./command-handlers");
            
            const mockCleanAllCache = createTrackingFn();
            const mockContext = {
                cacheHelper: {
                    cleanAllCache: mockCleanAllCache.fn,
                },
            } as any;

            const result = CommandHandlers[ReservedFunctions.CLEAN_ALL_CACHE]({}, mockContext);

            expect(result.handled).toBe(true);
            expect(result.result).toEqual({});
            expect(mockCleanAllCache.calls.length).toBe(1);
        });
    });

    describe("STARTED_THE_RUN handler", () => {
        it("should not clean cache when below threshold", async () => {
            const { CommandHandlers } = await import("./command-handlers");
            
            const mockCleanAllCache = createTrackingFn();
            const mockContext = {
                cacheHelper: {
                    usedHashes: { a: 1, b: 2 }, // Only 2 items
                    cleanAllCache: mockCleanAllCache.fn,
                },
            } as any;

            const result = CommandHandlers[ReservedFunctions.STARTED_THE_RUN]({}, mockContext);

            expect(result.handled).toBe(true);
            expect(result.result).toEqual({});
            expect(mockCleanAllCache.calls.length).toBe(0);
        });

        it("should clean cache when above threshold", async () => {
            const { CommandHandlers } = await import("./command-handlers");
            
            const mockCleanAllCache = createTrackingFn();
            // Create an object with more than CACHE_THRESHOLD keys
            const usedHashes: Record<string, number> = {};
            for (let i = 0; i < CACHE_THRESHOLD + 1; i++) {
                usedHashes[`key${i}`] = i;
            }
            
            const mockContext = {
                cacheHelper: {
                    usedHashes,
                    cleanAllCache: mockCleanAllCache.fn,
                },
            } as any;

            const result = CommandHandlers[ReservedFunctions.STARTED_THE_RUN]({}, mockContext);

            expect(result.handled).toBe(true);
            expect(result.result).toEqual({});
            expect(mockCleanAllCache.calls.length).toBe(1);
        });
    });

    describe("ADD_OC handler", () => {
        it("should add dependencies to plugins when available", async () => {
            const { CommandHandlers } = await import("./command-handlers");
            
            const mockContext = {
                openCascade: {
                    plugins: {
                        dependencies: {} as Record<string, unknown>,
                    },
                },
                addPendingDependency: createTrackingFn().fn,
            } as any;

            const result = CommandHandlers[ReservedFunctions.ADD_OC](
                { dep1: "value1", dep2: "value2" },
                mockContext
            );

            expect(result.handled).toBe(true);
            expect(mockContext.openCascade.plugins.dependencies.dep1).toBe("value1");
            expect(mockContext.openCascade.plugins.dependencies.dep2).toBe("value2");
        });

        it("should use addPendingDependency when plugins not available", async () => {
            const { CommandHandlers } = await import("./command-handlers");
            
            const mockAddPending = createTrackingFn();
            const mockContext = {
                openCascade: null,
                addPendingDependency: mockAddPending.fn,
            } as any;

            const result = CommandHandlers[ReservedFunctions.ADD_OC](
                { dep1: "value1" },
                mockContext
            );

            expect(result.handled).toBe(true);
            expect(mockAddPending.calls[0]).toEqual(["dep1", "value1"]);
        });
    });

    describe("SHAPES_TO_MESHES handler", () => {
        it("should throw error when no shapes provided", async () => {
            const { CommandHandlers } = await import("./command-handlers");
            
            const mockContext = {} as any;

            expect(() => {
                CommandHandlers[ReservedFunctions.SHAPES_TO_MESHES]({ shapes: [] }, mockContext);
            }).toThrow("No shapes detected");

            expect(() => {
                CommandHandlers[ReservedFunctions.SHAPES_TO_MESHES]({}, mockContext);
            }).toThrow("No shapes detected");
        });
    });
});

// Helper function to create tracking functions (since we can't use jest.fn() in ESM)
function createTrackingFn<T = unknown>(): { fn: (...args: unknown[]) => T; calls: unknown[][] } {
    const calls: unknown[][] = [];
    const fn = (...args: unknown[]): T => {
        calls.push(args);
        return undefined as T;
    };
    return { fn, calls };
}
