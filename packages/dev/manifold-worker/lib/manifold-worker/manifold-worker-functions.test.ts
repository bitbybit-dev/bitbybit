/* eslint-disable @typescript-eslint/no-explicit-any */
import { initializationComplete, onMessageInput } from "./manifold-worker";

describe("Manifold Worker Functions Tests", () => {
    let mockManifold: any;

    beforeAll(() => {
        // Create a mock manifold object that returns valid shapes with $$ property
        // and has methods like translate, scale, etc. that return new manifolds
        const createMockManifold = (): any => {
            const mock = {
                $$: Math.floor(Math.random() * 10000) + 1,
                delete: jest.fn(),
                translate: jest.fn(() => createMockManifold()),
                scale: jest.fn(() => createMockManifold()),
                rotate: jest.fn(() => createMockManifold()),
                getMesh: jest.fn(() => ({ vertProperties: new Float32Array([]), triVerts: new Uint32Array([]), numProp: 3 })),
                hash: undefined as any // Will be set by cache
            };
            return mock;
        };
        
        // Mock the WASM ManifoldToplevel structure that ManifoldService constructor expects
        // ManifoldService(wasm) creates internal service classes (Manifold, CrossSection, Mesh)
        // which call WASM methods like wasm.Manifold.cube()
        mockManifold = {
            Manifold: {
                cube: jest.fn(() => createMockManifold()),
                sphere: jest.fn(() => createMockManifold())
            }
        };
        
        // Initialize once for all tests - this creates new ManifoldService(mockManifold)
        initializationComplete(mockManifold, undefined, true);
    });

    afterEach(() => {
        // Clean cache after each test
        const cleanInput = {
            action: {
                functionName: "cleanAllCache",
                inputs: {}
            },
            uid: "clean"
        };
        const messages: any[] = [];
        onMessageInput(cleanInput, (data: any) => messages.push(data));
    });

    describe("initializationComplete", () => {
        it("should initialize manifold worker", () => {
            expect(() => initializationComplete(mockManifold, undefined, true)).not.toThrow();
        });

        it("should initialize with plugins", () => {
            const plugins = { dependencies: { testDep: "testValue" } };
            expect(() => initializationComplete(mockManifold, plugins, true)).not.toThrow();
        });
    });

    describe("onMessageInput - basic operations", () => {
        it("should post busy message then result", () => {
            const messages: any[] = [];
            onMessageInput({
                action: {
                    functionName: "manifold.shapes.cube",
                    inputs: { size: [1, 1, 1], center: false }
                },
                uid: "test-uid"
            }, (data: any) => messages.push(data));
            
            expect(messages).toHaveLength(2);
            expect(messages[0]).toBe("busy");
            expect(messages[1].uid).toBe("test-uid");
            // Check if there's an error first
            if (messages[1].error) {
                console.error("Error in test:", messages[1].error);
            }
            expect(messages[1].error).toBeUndefined();
            expect(messages[1].result).toBeDefined();
        });

        it("should handle 3-level function paths", () => {
            const messages: any[] = [];
            onMessageInput({
                action: {
                    functionName: "manifold.shapes.cube",
                    inputs: { size: 1 }
                },
                uid: "uid-1"
            }, (data: any) => messages.push(data));
            
            expect(messages[1].error).toBeUndefined();
            expect(messages[1].result).toBeDefined();
            expect(messages[1].result.hash).toBeDefined();
            expect(messages[1].result.type).toBe("manifold-shape");
        });

        it("should handle 2-level function paths", () => {
            const messages: any[] = [];
            onMessageInput({
                action: {
                    functionName: "manifold.shapes.sphere",
                    inputs: { radius: 5 }
                },
                uid: "uid-2"
            }, (data: any) => messages.push(data));
            
            expect(messages[1].error).toBeUndefined();
            expect(messages[1].result).toBeDefined();
            expect(messages[1].result.hash).toBeDefined();
            expect(messages[1].result.type).toBe("manifold-shape");
        });
    });

    describe("onMessageInput - cache validation", () => {
        it("should throw error when manifold not found in cache", () => {
            const messages: any[] = [];
            onMessageInput({
                action: {
                    functionName: "manifold.transforms.translate",
                    inputs: {
                        manifold: { hash: 999999, type: "manifold-shape" },
                        offset: [1, 0, 0]
                    }
                },
                uid: "test-uid"
            }, (data: any) => messages.push(data));
            
            expect(messages[1].error).toBeDefined();
            expect(messages[1].error).toContain("not found in cache");
        });

        it("should use cached manifold", () => {
            // Create manifold
            const messages1: any[] = [];
            onMessageInput({
                action: {
                    functionName: "manifold.shapes.cube",
                    inputs: { size: [1, 1, 1], center: false }
                },
                uid: "uid-1"
            }, (data: any) => messages1.push(data));

            expect(messages1[1].error).toBeUndefined();
            expect(messages1[1].result).toBeDefined();
            const hash = messages1[1].result.hash;

            // Use cached manifold
            const messages2: any[] = [];
            onMessageInput({
                action: {
                    functionName: "manifold.transforms.translate",
                    inputs: {
                        manifold: { hash, type: "manifold-shape" },
                        offset: [1, 0, 0]
                    }
                },
                uid: "uid-2"
            }, (data: any) => messages2.push(data));

            expect(messages2[1].error).toBeUndefined();
            expect(messages2[1].result).toBeDefined();
        });
    });

    describe("onMessageInput - special functions", () => {
        it("should handle decomposeManifoldOrCrossSection", () => {
            const messages1: any[] = [];
            onMessageInput({
                action: {
                    functionName: "manifold.shapes.cube",
                    inputs: { size: [1, 1, 1], center: false }
                },
                uid: "uid-1"
            }, (data: any) => messages1.push(data));

            expect(messages1[1].error).toBeUndefined();
            expect(messages1[1].result).toBeDefined();
            const hash = messages1[1].result.hash;

            const messages2: any[] = [];
            onMessageInput({
                action: {
                    functionName: "decomposeManifoldOrCrossSection",
                    inputs: {
                        manifoldOrCrossSection: { hash, type: "manifold-shape" }
                    }
                },
                uid: "uid-2"
            }, (data: any) => messages2.push(data));

            expect(messages2[1].error).toBeUndefined();
            expect(messages2[1].result).toBeDefined();
        });

        it("should handle cleanAllCache", () => {
            const messages: any[] = [];
            onMessageInput({
                action: {
                    functionName: "cleanAllCache",
                    inputs: {}
                },
                uid: "uid-1"
            }, (data: any) => messages.push(data));

            expect(messages[1].result).toEqual({});
        });

        it("should handle startedTheRun", () => {
            const messages: any[] = [];
            onMessageInput({
                action: {
                    functionName: "startedTheRun",
                    inputs: {}
                },
                uid: "uid-1"
            }, (data: any) => messages.push(data));

            expect(messages[1].result).toEqual({});
        });
    });

    describe("onMessageInput - error handling", () => {
        it("should provide detailed error messages", () => {
            const messages: any[] = [];
            onMessageInput({
                action: {
                    functionName: "nonExistentFunction",
                    inputs: { test: "data" }
                },
                uid: "test-uid"
            }, (data: any) => messages.push(data));

            expect(messages[1].error).toBeDefined();
            expect(messages[1].error).toContain("Manifold computation failed");
        });
    });

    describe("onMessageInput - caching behavior", () => {
        it("should cache operation results", () => {
            const inputs = { size: [1, 1, 1], center: false };
            
            const messages1: any[] = [];
            onMessageInput({
                action: { functionName: "manifold.shapes.cube", inputs },
                uid: "uid-1"
            }, (data: any) => messages1.push(data));

            const messages2: any[] = [];
            onMessageInput({
                action: { functionName: "manifold.shapes.cube", inputs },
                uid: "uid-2"
            }, (data: any) => messages2.push(data));

            expect(messages1[1].error).toBeUndefined();
            expect(messages2[1].error).toBeUndefined();
            expect(messages1[1].result).toBeDefined();
            expect(messages2[1].result).toBeDefined();
            expect(messages1[1].result.hash).toBe(messages2[1].result.hash);
        });

        it("should return different hashes for different inputs", () => {
            const messages1: any[] = [];
            onMessageInput({
                action: {
                    functionName: "manifold.shapes.cube",
                    inputs: { size: [1, 1, 1], center: false }
                },
                uid: "uid-1"
            }, (data: any) => messages1.push(data));

            const messages2: any[] = [];
            onMessageInput({
                action: {
                    functionName: "manifold.shapes.cube",
                    inputs: { size: [2, 2, 2], center: false }
                },
                uid: "uid-2"
            }, (data: any) => messages2.push(data));

            expect(messages1[1].error).toBeUndefined();
            expect(messages2[1].error).toBeUndefined();
            expect(messages1[1].result).toBeDefined();
            expect(messages2[1].result).toBeDefined();
            expect(messages1[1].result.hash).not.toBe(messages2[1].result.hash);
        });
    });
});
