import { describe, it, expect, beforeEach, vi } from "vitest";
import { DataInput, initializationComplete, onMessageInput } from "./jscad-worker";

// The same message loop as jscad-worker.test.ts, but over the real kernel wrapper and the real cache
// rather than stand-ins: what is asserted here is that a call arrives at a kernel method and comes
// back hashed, and that two identical calls are answered from the cache rather than run twice.

type Answer = { uid: string; result?: { hash?: string | number }; error?: string };
type Message = "busy" | Answer;

const SQUARE: [number, number][] = [[0, 0], [1, 0], [1, 1], [0, 1]];

// The kernel the wrapper is built over. Only the members these calls reach are here, and each hands
// back something the cache will treat as a kernel object. A fresh one per test, because the worker
// holds the kernel and its cache in module state that would otherwise carry between tests.
const createKernel = () => ({
    primitives: {
        circle: vi.fn(() => ({ delete: vi.fn() })),
        cube: vi.fn(() => ({ delete: vi.fn() })),
        polygon: vi.fn(() => ({ delete: vi.fn() })),
    },
    booleans: { union: vi.fn(() => ({ delete: vi.fn() })) },
    expansions: { expand: vi.fn(() => ({ delete: vi.fn() })) },
});

describe("the worker message loop over the real kernel", () => {
    const collect = (action: DataInput["action"], uid = "uid-1"): Message[] => {
        const messages: Message[] = [];
        onMessageInput({ action, uid }, (message: unknown) => { messages.push(message as Message); });
        return messages;
    };

    const answerTo = (action: DataInput["action"], uid = "uid-1"): Answer => collect(action, uid)[1] as Answer;

    beforeEach(() => {
        initializationComplete(createKernel(), undefined, true);
    });

    describe("initializationComplete", () => {
        it("should take a kernel with no plugins", () => {
            expect(() => initializationComplete(createKernel(), undefined, true)).not.toThrow();
        });

        it("should take a kernel with plugins", () => {
            // Arrange
            const plugins = { dependencies: { testDep: "testValue" } };

            // Act & Assert
            expect(() => initializationComplete(createKernel(), plugins, true)).not.toThrow();
        });
    });

    describe("answering a call", () => {
        it("should say it is busy first and answer second", () => {
            // Act
            const messages = collect({ functionName: "polygon.createFromPoints", inputs: { points: SQUARE } });

            // Assert
            expect(messages).toHaveLength(2);
            expect(messages[0]).toBe("busy");
        });

        it("should answer under the uid the call arrived with", () => {
            // Act
            const answer = answerTo({ functionName: "polygon.createFromPoints", inputs: { points: SQUARE } }, "uid-7");

            // Assert
            expect(answer.uid).toBe("uid-7");
        });

        it("should answer a two part path with a hashed geometry", () => {
            // Act
            const answer = answerTo({ functionName: "polygon.circle", inputs: { radius: 5, center: [0, 0], segments: 32 } });

            // Assert
            expect(answer.error).toBeUndefined();
            expect(typeof answer.result?.hash).toBe("number");
        });
    });

    describe("resolving hashed geometry against the cache", () => {
        it("should fail the call when the hash is not in the cache", () => {
            // Act
            const answer = answerTo({
                functionName: "booleans.union",
                inputs: { geometries: [{ hash: 999999, type: "jscad-geometry" }] },
            });

            // Assert
            expect(answer.error).toContain("Geometry with hash 999999 not found in cache");
        });

        it("should run the call when the hash is one the cache holds", () => {
            // Arrange
            const hash = answerTo({ functionName: "polygon.createFromPoints", inputs: { points: SQUARE } }).result?.hash;

            // Act
            const answer = answerTo({
                functionName: "expansions.expand",
                inputs: { geometry: { hash, type: "jscad-geometry" }, delta: 0.1, corners: "round", segments: 16 },
            }, "uid-2");

            // Assert
            expect(answer.error).toBeUndefined();
            expect(typeof answer.result?.hash).toBe("number");
        });
    });

    describe("the run markers", () => {
        it("should answer cleanAllCache with an empty result", () => {
            // Act
            const answer = answerTo({ functionName: "cleanAllCache", inputs: {} });

            // Assert
            expect(answer.result).toEqual({});
        });

        it("should answer startedTheRun with an empty result", () => {
            // Act
            const answer = answerTo({ functionName: "startedTheRun", inputs: {} });

            // Assert
            expect(answer.result).toEqual({});
        });
    });

    describe("when the call names no kernel method", () => {
        it("should answer with the failure rather than throw", () => {
            // Act
            const answer = answerTo({ functionName: "nonExistentFunction", inputs: { test: "data" } });

            // Assert
            expect(answer.error).toContain("JSCAD computation failed when executing function - nonExistentFunction");
        });
    });

    describe("caching", () => {
        it("should answer two identical calls with the same hash", () => {
            // Arrange
            const inputs = { points: SQUARE };

            // Act
            const first = answerTo({ functionName: "polygon.createFromPoints", inputs }, "uid-1");
            const second = answerTo({ functionName: "polygon.createFromPoints", inputs }, "uid-2");

            // Assert
            expect(second.result?.hash).toBe(first.result?.hash);
        });

        it("should answer calls that differ with different hashes", () => {
            // Act
            const first = answerTo({ functionName: "polygon.circle", inputs: { radius: 5, center: [0, 0], segments: 32 } }, "uid-1");
            const second = answerTo({ functionName: "polygon.circle", inputs: { radius: 10, center: [0, 0], segments: 32 } }, "uid-2");

            // Assert
            expect(second.result?.hash).not.toBe(first.result?.hash);
        });
    });
});
