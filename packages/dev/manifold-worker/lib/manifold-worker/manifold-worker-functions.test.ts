import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { InputIssueReport, setInputIssueSink } from "@bitbybit-dev/base";
import { DataInput, initializationComplete, onMessageInput } from "./manifold-worker";

type Pointer = { hash: string | number; type: string };
type Answer = { uid: string; result?: Pointer | number; error?: string };
type Message = "busy" | Answer;

const A_CUBE = { size: 1, center: false };

const createShape = (): Record<string, unknown> => ({
    $$: Math.floor(Math.random() * 10000) + 1,
    delete: vi.fn(),
    translate: vi.fn(() => createShape()),
    scale: vi.fn(() => createShape()),
    rotate: vi.fn(() => createShape()),
    volume: vi.fn(() => 0),
    getMesh: vi.fn(() => ({ vertProperties: new Float32Array([]), triVerts: new Uint32Array([]), numProp: 3 })),
});

const hashOf = (answer: Answer): string | number | undefined => (typeof answer.result === "object" ? answer.result.hash : undefined);

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

    let kernel: ReturnType<typeof createKernel>;
    let reports: InputIssueReport[];

    beforeEach(() => {
        reports = [];
        setInputIssueSink((report) => reports.push(report));
        kernel = createKernel();
        initializationComplete(kernel, undefined, true);
    });

    afterEach(() => {
        setInputIssueSink();
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
            expect(answer.result).toEqual({ hash: expect.any(Number), type: "manifold-shape" });
        });

        it("should answer another three part path with a pointer of its own", () => {
            // Act
            const answer = answerTo({ functionName: "manifold.shapes.sphere", inputs: { radius: 5 } });

            // Assert
            expect(answer.error).toBeUndefined();
            expect(answer.result).toEqual({ hash: expect.any(Number), type: "manifold-shape" });
        });
    });

    describe("resolving hashed shapes against the cache", () => {
        it("should fail the call when the hash is not in the cache", () => {
            // Act
            const answer = answerTo({
                functionName: "manifold.transforms.translate",
                inputs: { manifold: { hash: 999999, type: "manifold-shape" }, vector: [1, 0, 0] },
            });

            // Assert
            expect(answer.error).toContain("Manifold with hash 999999 not found in cache");
        });

        it("should run the call when the hash is one the cache holds", () => {
            // Arrange
            const hash = hashOf(answerTo({ functionName: "manifold.shapes.cube", inputs: A_CUBE }));

            // Act
            const answer = answerTo({
                functionName: "manifold.transforms.translate",
                inputs: { manifold: { hash, type: "manifold-shape" }, vector: [1, 0, 0] },
            }, "uid-2");

            // Assert
            expect(answer.error).toBeUndefined();
            expect(answer.result).toEqual({ hash: expect.any(Number), type: "manifold-shape" });
        });
    });

    describe("decomposeManifoldOrCrossSection", () => {
        it("should answer with the mesh of a shape the cache holds", () => {
            // Arrange
            const hash = hashOf(answerTo({ functionName: "manifold.shapes.cube", inputs: A_CUBE }));

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
            expect(hashOf(second)).toBe(hashOf(first));
        });

        it("should answer calls that differ with different hashes", () => {
            // Act
            const first = answerTo({ functionName: "manifold.shapes.cube", inputs: A_CUBE }, "uid-1");
            const second = answerTo({ functionName: "manifold.shapes.cube", inputs: { size: 2, center: false } }, "uid-2");

            // Assert
            expect(hashOf(second)).not.toBe(hashOf(first));
        });

        it("should run the kernel once for a call that leaves the defaults out and one that spells them", () => {
            // Arrange
            const cube = kernel.Manifold.cube;
            const spelled = answerTo({ functionName: "manifold.shapes.cube", inputs: { center: true, size: 1 } }, "uid-1");

            // Act
            const partial = answerTo({ functionName: "manifold.shapes.cube", inputs: {} }, "uid-2");

            // Assert
            expect(hashOf(partial)).toBe(hashOf(spelled));
            expect(cube).toHaveBeenCalledTimes(1);
        });

        it("should run the kernel once for a call that passes a property as undefined and one that spells the default", () => {
            // Arrange
            const cube = kernel.Manifold.cube;
            const spelled = answerTo({ functionName: "manifold.shapes.cube", inputs: { center: true, size: 3 } }, "uid-1");

            // Act
            const passedUndefined = answerTo({ functionName: "manifold.shapes.cube", inputs: { center: undefined, size: 3 } }, "uid-2");

            // Assert
            expect(hashOf(passedUndefined)).toBe(hashOf(spelled));
            expect(cube).toHaveBeenCalledTimes(1);
        });

        it("should answer a cached 0 as 0 rather than as nothing", () => {
            // Arrange
            const hash = hashOf(answerTo({ functionName: "manifold.shapes.cube", inputs: A_CUBE }, "uid-1"));
            const shape = kernel.Manifold.cube.mock.results[0]?.value as { volume: () => number };
            const volume = shape.volume;
            answerTo({ functionName: "manifold.evaluate.volume", inputs: { manifold: { hash, type: "manifold-shape" } } }, "uid-2");

            // Act
            const second = answerTo({ functionName: "manifold.evaluate.volume", inputs: { manifold: { hash, type: "manifold-shape" } } }, "uid-3");

            // Assert
            expect(second).toEqual({ uid: "uid-3", result: 0 });
            expect(volume).toHaveBeenCalledTimes(1);
        });
    });

    describe("what the kernel's own registry finds in a call", () => {
        it("should report a number below its minimum, and still build the shape", () => {
            // Arrange
            const sphere = kernel.Manifold.sphere;

            // Act
            const answer = answerTo({ functionName: "manifold.shapes.sphere", inputs: { radius: -1 } });

            // Assert
            expect(reports).toEqual([{
                kernel: "Manifold",
                path: "manifold.shapes.sphere",
                issue: { property: "radius", code: "minimum", params: { limit: 0, exclusive: false, actual: -1 }, message: "must be at least 0" },
            }]);
            expect(answer.error).toBeUndefined();
            expect(sphere).toHaveBeenCalledTimes(1);
        });

        it("should report a property the operation does not know", () => {
            // Arrange
            const hash = hashOf(answerTo({ functionName: "manifold.shapes.cube", inputs: A_CUBE }, "uid-1"));

            // Act
            answerTo({ functionName: "manifold.transforms.translate", inputs: { manifold: { hash, type: "manifold-shape" }, vector: [1, 0, 0], offset: [1, 0, 0] } }, "uid-2");

            // Assert
            expect(reports).toEqual([{
                kernel: "Manifold",
                path: "manifold.transforms.translate",
                issue: { property: "offset", code: "unknown-property", message: "is not an input of this operation and is ignored" },
            }]);
        });

        it("should not report again a call the cache already holds", () => {
            // Arrange
            answerTo({ functionName: "manifold.shapes.sphere", inputs: { radius: -1 } }, "uid-1");
            const afterTheHit: InputIssueReport[] = [];
            setInputIssueSink((report) => afterTheHit.push(report));

            // Act
            answerTo({ functionName: "manifold.shapes.sphere", inputs: { radius: -1 } }, "uid-2");

            // Assert
            expect(afterTheHit).toEqual([]);
        });
    });
});
