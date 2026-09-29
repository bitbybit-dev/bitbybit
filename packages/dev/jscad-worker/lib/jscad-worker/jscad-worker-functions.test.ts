import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { InputIssueReport, setInputIssueSink } from "@bitbybit-dev/base";
import { DataInput, initializationComplete, onMessageInput } from "./jscad-worker";

type Answer = { uid: string; result?: { hash?: string | number } | boolean; error?: string };
type Message = "busy" | Answer;

const SQUARE: [number, number][] = [[0, 0], [1, 0], [1, 1], [0, 1]];
const A_SOLID = { polygons: [], transforms: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] };

const createKernel = () => ({
    primitives: {
        circle: vi.fn(() => ({ delete: vi.fn() })),
        cube: vi.fn(() => ({ delete: vi.fn() })),
        polygon: vi.fn(() => ({ delete: vi.fn() })),
        roundedCuboid: vi.fn(() => ({ delete: vi.fn() })),
    },
    booleans: { union: vi.fn(() => ({ delete: vi.fn() })) },
    expansions: { expand: vi.fn(() => ({ delete: vi.fn() })) },
    geometries: { geom3: { isConvex: vi.fn(() => false) } },
});

const hashOf = (answer: Answer): string | number | undefined => (typeof answer.result === "object" ? answer.result.hash : undefined);

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
            expect(typeof hashOf(answer)).toBe("number");
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
            const hash = hashOf(answerTo({ functionName: "polygon.createFromPoints", inputs: { points: SQUARE } }));

            // Act
            const answer = answerTo({
                functionName: "expansions.expand",
                inputs: { geometry: { hash, type: "jscad-geometry" }, delta: 0.1, corners: "round", segments: 16 },
            }, "uid-2");

            // Assert
            expect(answer.error).toBeUndefined();
            expect(typeof hashOf(answer)).toBe("number");
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
            expect(answer.error).toContain("JSCAD computation failed while executing function 'nonExistentFunction'");
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
            expect(hashOf(second)).toBe(hashOf(first));
        });

        it("should answer calls that differ with different hashes", () => {
            // Act
            const first = answerTo({ functionName: "polygon.circle", inputs: { radius: 5, center: [0, 0], segments: 32 } }, "uid-1");
            const second = answerTo({ functionName: "polygon.circle", inputs: { radius: 10, center: [0, 0], segments: 32 } }, "uid-2");

            // Assert
            expect(hashOf(second)).not.toBe(hashOf(first));
        });

        it("should run the kernel once for a call that leaves the defaults out and one that spells them", () => {
            // Arrange
            const circle = kernel.primitives.circle;
            const spelled = answerTo({ functionName: "polygon.circle", inputs: { center: [0, 0], radius: 1, segments: 24 } }, "uid-1");

            // Act
            const partial = answerTo({ functionName: "polygon.circle", inputs: {} }, "uid-2");

            // Assert
            expect(hashOf(partial)).toBe(hashOf(spelled));
            expect(circle).toHaveBeenCalledTimes(1);
        });

        it("should run the kernel once for a call that passes a property as undefined and one that leaves it out", () => {
            // Arrange
            const circle = kernel.primitives.circle;
            const leftOut = answerTo({ functionName: "polygon.circle", inputs: { radius: 2 } }, "uid-1");

            // Act
            const passedUndefined = answerTo({ functionName: "polygon.circle", inputs: { radius: 2, segments: undefined } }, "uid-2");

            // Assert
            expect(hashOf(passedUndefined)).toBe(hashOf(leftOut));
            expect(circle).toHaveBeenCalledTimes(1);
        });

        it("should answer a cached false as false rather than as nothing", () => {
            // Arrange
            const isConvex = kernel.geometries.geom3.isConvex;
            answerTo({ functionName: "hulls.isConvex", inputs: { mesh: A_SOLID } }, "uid-1");

            // Act
            const second = answerTo({ functionName: "hulls.isConvex", inputs: { mesh: A_SOLID } }, "uid-2");

            // Assert
            expect(second).toEqual({ uid: "uid-2", result: false });
            expect(isConvex).toHaveBeenCalledTimes(1);
        });
    });

    describe("what the kernel's own registry and rules find in a call", () => {
        it("should report a rounding that does not fit its box, and still build it", () => {
            // Arrange
            const roundedCuboid = kernel.primitives.roundedCuboid;

            // Act
            const answer = answerTo({ functionName: "shapes.roundedCuboid", inputs: { width: 2, length: 3, height: 4, roundRadius: 1 } });

            // Assert
            expect(reports).toEqual([{
                kernel: "JSCAD",
                path: "shapes.roundedCuboid",
                issue: { property: "roundRadius", code: "less-than", params: { limit: 1 }, message: "must be less than half of the smallest side" },
            }]);
            expect(answer.error).toBeUndefined();
            expect(roundedCuboid).toHaveBeenCalledTimes(1);
        });

        it("should report a rounding checked against the defaults the call left out", () => {
            // Act
            answerTo({ functionName: "shapes.roundedCuboid", inputs: { roundRadius: 0.5 } });

            // Assert
            expect(reports).toEqual([{
                kernel: "JSCAD",
                path: "shapes.roundedCuboid",
                issue: { property: "roundRadius", code: "less-than", params: { limit: 0.5 }, message: "must be less than half of the smallest side" },
            }]);
        });

        it("should not report again a call the cache already holds", () => {
            // Arrange
            const inputs = { width: 2, length: 3, height: 4, roundRadius: 1 };
            answerTo({ functionName: "shapes.roundedCuboid", inputs }, "uid-1");
            const afterTheHit: InputIssueReport[] = [];
            setInputIssueSink((report) => afterTheHit.push(report));

            // Act
            answerTo({ functionName: "shapes.roundedCuboid", inputs }, "uid-2");

            // Assert
            expect(afterTheHit).toEqual([]);
        });

        it("should report a property the operation does not know", () => {
            // Act
            answerTo({ functionName: "polygon.circle", inputs: { radius: 2, radious: 3 } });

            // Assert
            expect(reports).toEqual([{
                kernel: "JSCAD",
                path: "polygon.circle",
                issue: { property: "radious", code: "unknown-property", message: "is not an input of this operation and is ignored" },
            }]);
        });
    });
});
