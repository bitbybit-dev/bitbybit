/* eslint-disable @typescript-eslint/no-explicit-any */
import { initializationComplete, onMessageInput } from "./jscad-worker";

describe("JSCAD Worker Functions Tests", () => {
    let mockJscad: any;

    beforeAll(() => {
        // Create a minimal mock of the JSCAD WASM library for testing
        // The Jscad service expects the raw JSCAD library with primitives, booleans, etc.
        mockJscad = {
            primitives: {
                circle: jest.fn(() => ({ delete: jest.fn() })),
                cube: jest.fn(() => ({ delete: jest.fn() })),
                polygon: jest.fn(() => ({ delete: jest.fn() }))
            },
            booleans: {
                union: jest.fn(() => ({ delete: jest.fn() }))
            },
            expansions: {
                expand: jest.fn(() => ({ delete: jest.fn() }))
            }
        };
        
        // Initialize once for all tests - creates new Jscad(mockJscad)
        initializationComplete(mockJscad, undefined, true);
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
        it("should initialize jscad worker", () => {
            expect(() => initializationComplete(mockJscad, undefined, true)).not.toThrow();
        });

        it("should initialize with plugins", () => {
            const plugins = { dependencies: { testDep: "testValue" } };
            expect(() => initializationComplete(mockJscad, plugins, true)).not.toThrow();
        });
    });

    describe("onMessageInput - basic operations", () => {
        it("should post busy message then result", () => {
            const messages: any[] = [];
            onMessageInput({
                action: {
                    functionName: "polygon.createFromPoints",
                    inputs: { points: [[0, 0], [1, 0], [1, 1], [0, 1]] }
                },
                uid: "test-uid"
            }, (data: any) => messages.push(data));
            
            expect(messages).toHaveLength(2);
            expect(messages[0]).toBe("busy");
            expect(messages[1].uid).toBe("test-uid");
            if (messages[1].error) {
                console.error("Error in test:", messages[1].error);
            }
            expect(messages[1].error).toBeUndefined();
            expect(messages[1].result).toBeDefined();
        });

        it("should handle 2-level function paths", () => {
            const messages: any[] = [];
            onMessageInput({
                action: {
                    functionName: "polygon.circle",
                    inputs: { radius: 5, center: [0, 0], segments: 32 }
                },
                uid: "uid-1"
            }, (data: any) => messages.push(data));
            
            expect(messages[1].result.hash).toBeDefined();
            // Note: JSCAD worker doesn't wrap result with type property like Manifold worker does
        });
    });

    describe("onMessageInput - cache validation", () => {
        it("should throw error when geometry not found in cache", () => {
            const messages: any[] = [];
            onMessageInput({
                action: {
                    functionName: "booleans.union",
                    inputs: {
                        geometries: [{ hash: 999999, type: "jscad-geometry" }]
                    }
                },
                uid: "test-uid"
            }, (data: any) => messages.push(data));
            
            expect(messages[1].error).toBeDefined();
            expect(messages[1].error).toContain("not found in cache");
        });

        it("should use cached geometry", () => {
            // Create geometry
            const messages1: any[] = [];
            onMessageInput({
                action: {
                    functionName: "polygon.createFromPoints",
                    inputs: { points: [[0, 0], [1, 0], [1, 1], [0, 1]] }
                },
                uid: "uid-1"
            }, (data: any) => messages1.push(data));

            const hash = messages1[1].result.hash;

            // Use cached geometry
            const messages2: any[] = [];
            onMessageInput({
                action: {
                    functionName: "expansions.expand",
                    inputs: {
                        geometry: { hash, type: "jscad-geometry" },
                        delta: 0.1,
                        corners: "round",
                        segments: 16
                    }
                },
                uid: "uid-2"
            }, (data: any) => messages2.push(data));

            expect(messages2[1].result).toBeDefined();
        });
    });

    describe("onMessageInput - special functions", () => {
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
            expect(messages[1].error).toContain("JSCAD computation failed");
        });
    });

    describe("onMessageInput - caching behavior", () => {
        it("should cache operation results", () => {
            const inputs = { points: [[0, 0], [1, 0], [1, 1], [0, 1]] };
            
            const messages1: any[] = [];
            onMessageInput({
                action: { functionName: "polygon.createFromPoints", inputs },
                uid: "uid-1"
            }, (data: any) => messages1.push(data));

            const messages2: any[] = [];
            onMessageInput({
                action: { functionName: "polygon.createFromPoints", inputs },
                uid: "uid-2"
            }, (data: any) => messages2.push(data));

            expect(messages1[1].result.hash).toBe(messages2[1].result.hash);
        });

        it("should return different hashes for different inputs", () => {
            const messages1: any[] = [];
            onMessageInput({
                action: {
                    functionName: "polygon.circle",
                    inputs: { radius: 5, center: [0, 0], segments: 32 }
                },
                uid: "uid-1"
            }, (data: any) => messages1.push(data));

            const messages2: any[] = [];
            onMessageInput({
                action: {
                    functionName: "polygon.circle",
                    inputs: { radius: 10, center: [0, 0], segments: 32 }
                },
                uid: "uid-2"
            }, (data: any) => messages2.push(data));

            expect(messages1[1].result.hash).not.toBe(messages2[1].result.hash);
        });
    });
});
