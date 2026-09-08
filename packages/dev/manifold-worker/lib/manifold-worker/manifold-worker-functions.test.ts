import { describe, it, expect, beforeEach, vi } from "vitest";
import { DataInput, initializationComplete, onMessageInput } from "./manifold-worker";

type Pointer = { hash: string | number; type: string };
type Answer = { uid: string; result?: Pointer; error?: string };
type Message = "busy" | Answer;

const A_CUBE = { size: [1, 1, 1], center: false };

const createShape = (): Record<string, unknown> => ({
    $$: Math.floor(Math.random() * 10000) + 1,
    delete: vi.fn(),
    translate: vi.fn(() => createShape()),
    scale: vi.fn(() => createShape()),
    rotate: vi.fn(() => createShape()),
    getMesh: vi.fn(() => ({ vertProperties: new Float32Array([]), triVerts: new Uint32Array([]), numProp: 3 })),
});

const createKernel = () => ({
    Manifold: {
        cube: vi.fn(() => createShape()),
        sphere: vi.fn(() => createShape()),
    },
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
            const messages = collect({ functionName: "manifold.shapes.cube", inputs: A_CUBE });

            // Assert
            expect(messages).toHaveLength(2);
            expect(messages[0]).toBe("busy");
        });

        it("should answer under the uid the call arrived with", () => {
            // Act
            const answer = answerTo({ functionName: "manifold.shapes.cube", inputs: A_CUBE }, "uid-7");

            // Assert
            expect(answer.uid).toBe("uid-7");
        });

        it("should answer a three part path with a pointer to a cached shape", () => {
            // Act
            const answer = answerTo({ functionName: "manifold.shapes.cube", inputs: A_CUBE });

            // Assert
            expect(answer.error).toBeUndefined();
            expect(answer.result?.type).toBe("manifold-shape");
        });

        it("should answer another three part path with a pointer of its own", () => {
            // Act
            const answer = answerTo({ functionName: "manifold.shapes.sphere", inputs: { radius: 5 } });

            // Assert
            expect(answer.error).toBeUndefined();
            expect(answer.result?.type).toBe("manifold-shape");
        });
    });

    describe("resolving hashed shapes against the cache", () => {
        it("should fail the call when the hash is not in the cache", () => {
            // Act
            const answer = answerTo({
                functionName: "manifold.transforms.translate",
                inputs: { manifold: { hash: 999999, type: "manifold-shape" }, offset: [1, 0, 0] },
            });

            // Assert
            expect(answer.error).toContain("Manifold with hash 999999 not found in cache");
        });

        it("should run the call when the hash is one the cache holds", () => {
            // Arrange
            const hash = answerTo({ functionName: "manifold.shapes.cube", inputs: A_CUBE }).result?.hash;

            // Act
            const answer = answerTo({
                functionName: "manifold.transforms.translate",
                inputs: { manifold: { hash, type: "manifold-shape" }, offset: [1, 0, 0] },
            }, "uid-2");

            // Assert
            expect(answer.error).toBeUndefined();
            expect(answer.result?.type).toBe("manifold-shape");
        });
    });

    describe("decomposeManifoldOrCrossSection", () => {
        it("should answer with the mesh of a shape the cache holds", () => {
            // Arrange
            const hash = answerTo({ functionName: "manifold.shapes.cube", inputs: A_CUBE }).result?.hash;

            // Act
            const answer = answerTo({
                functionName: "decomposeManifoldOrCrossSection",
                inputs: { manifoldOrCrossSection: { hash, type: "manifold-shape" } },
            }, "uid-2");

            // Assert
            expect(answer.error).toBeUndefined();
            expect(answer.result).toBeInstanceOf(Object);
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
            expect(answer.error).toContain("Manifold computation failed");
        });
    });

    describe("caching", () => {
        it("should answer two identical calls with the same hash", () => {
            // Act
            const first = answerTo({ functionName: "manifold.shapes.cube", inputs: A_CUBE }, "uid-1");
            const second = answerTo({ functionName: "manifold.shapes.cube", inputs: A_CUBE }, "uid-2");

            // Assert
            expect(second.result?.hash).toBe(first.result?.hash);
        });

        it("should answer calls that differ with different hashes", () => {
            // Act
            const first = answerTo({ functionName: "manifold.shapes.cube", inputs: A_CUBE }, "uid-1");
            const second = answerTo({ functionName: "manifold.shapes.cube", inputs: { size: [2, 2, 2], center: false } }, "uid-2");

            // Assert
            expect(second.result?.hash).not.toBe(first.result?.hash);
        });
    });
});
