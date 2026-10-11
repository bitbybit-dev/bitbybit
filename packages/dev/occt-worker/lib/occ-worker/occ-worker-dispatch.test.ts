import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { InputIssueReport } from "@bitbybit-dev/base";
import { InputError, setInputIssueSink } from "@bitbybit-dev/base";
import type { BitbybitOcctModule } from "@bitbybit-dev/occt/bitbybit-dev-occt/bitbybit-dev-occt";
import type { CacheHelper } from "./cache-helper";
import type { DataInput } from "./occ-worker";
import { initializationComplete, onMessageInput } from "./occ-worker";
import { NON_CACHEABLE_FUNCTIONS } from "./constants";

const { failure, kernelCalls } = vi.hoisted(() => {
    const failure: { value: unknown } = { value: undefined };
    const kernelCalls: { path: string; inputs: unknown }[] = [];
    return { failure, kernelCalls };
});

vi.mock("@bitbybit-dev/occt", () => {
    class VectorHelperService { }
    class ShapesHelperService { }
    class OccHelper { }
    const call = (path: string) => (inputs: unknown): unknown => {
        kernelCalls.push({ path, inputs });
        return { made: path };
    };
    class OCCTService {
        plugins: { dependencies: Record<string, unknown> } | undefined;
        shapes = {
            solid: {
                createBox: call("shapes.solid.createBox"),
                fail: (): unknown => { throw failure.value; },
            },
        };
        measure = {
            unit: 10,
            scaled(this: { unit: number }, inputs: { size: number }): number {
                return this.unit * inputs.size;
            },
        };
        echo = call("echo");
        boom = (): unknown => { throw failure.value; };
        assemble = (): unknown => ({
            compound: { $$: {}, ShapeType: (): number => 0, IsNull: (): boolean => false },
            data: { name: "assembly" },
            shapes: [{ id: "part-1", shape: { $$: {}, ShapeType: (): number => 7, IsNull: (): boolean => false } }],
        });
        falsy = (): number => {
            kernelCalls.push({ path: "falsy", inputs: undefined });
            return 0;
        };
        pieces = (): unknown[] => {
            kernelCalls.push({ path: "pieces", inputs: undefined });
            return [1, 2].map(() => ({ $$: {}, ShapeType: (): number => 7, IsNull: (): boolean => false, delete: (): void => undefined }));
        };
    }
    class BoxDto {
        width = 1;
        length = 2;
        height = 3;
    }
    const constraints = { width: { kind: "number" }, length: { kind: "number", required: true }, height: { kind: "number" } };
    const rules = new Map([[BoxDto, [{ reads: ["width"], check: (inputs: { width: number }) => (inputs.width > 100 ? { property: "width", code: "custom", message: "must be at most 100" } : undefined) }]]]);
    return {
        VectorHelperService,
        ShapesHelperService,
        OccHelper,
        OCCTService,
        occtDtoRegistry: { "shapes.solid.createBox": { dto: BoxDto, constraints }, "shapes.solid.fail": { dto: BoxDto, constraints } },
        occtDtoRules: rules,
        readKernelException: (_kernel: unknown, thrown: unknown): unknown => thrown,
    };
});

type Answer = { uid?: string; result?: unknown; error?: string; errorKind?: string; stack?: string };

const A_MODULE: BitbybitOcctModule = {} as BitbybitOcctModule;
const SHAPE_HASH = 4242;
const SHAPE_REFERENCE = { type: "occ-shape", hash: SHAPE_HASH };
const BOX_DEFAULTS = { width: 1, length: 2, height: 3 };

describe("the call shape every OCCT operation goes through", () => {
    let cacheHelper: CacheHelper;
    let reports: InputIssueReport[];

    const answerTo = (action: { functionName?: string; inputs?: Record<string, unknown> }, uid = "uid-1"): Answer => {
        const messages: unknown[] = [];
        onMessageInput({ action, uid } as DataInput, (message: unknown) => messages.push(message));
        return messages[1] as Answer;
    };

    beforeEach(() => {
        kernelCalls.length = 0;
        failure.value = new Error("the kernel refused");
        reports = [];
        setInputIssueSink((report) => reports.push(report));
        cacheHelper = initializationComplete(A_MODULE, undefined, true);
        cacheHelper.addToCache(SHAPE_HASH, { kernel: "shape" });
    });

    afterEach(() => {
        setInputIssueSink();
    });

    describe("a reserved name with no handler", () => {
        afterEach(() => {
            NON_CACHEABLE_FUNCTIONS.delete("shapes.solid.createBox");
        });

        it("should answer without running the kernel", () => {
            // Arrange
            NON_CACHEABLE_FUNCTIONS.add("shapes.solid.createBox");

            // Act
            const answer = answerTo({ functionName: "shapes.solid.createBox", inputs: {} });

            // Assert
            expect(kernelCalls).toEqual([]);
            expect(answer).toEqual({ uid: "uid-1", result: undefined });
        });
    });

    describe("the defaults of the DTO an operation takes", () => {
        it("should give a property the call left out its default", () => {
            // Act
            answerTo({ functionName: "shapes.solid.createBox", inputs: { width: 5 } });

            // Assert
            expect(kernelCalls).toEqual([{ path: "shapes.solid.createBox", inputs: { width: 5, length: 2, height: 3 } }]);
        });

        it("should give a property the call passed as undefined its default", () => {
            // Act
            answerTo({ functionName: "shapes.solid.createBox", inputs: { width: undefined } });

            // Assert
            expect(kernelCalls).toEqual([{ path: "shapes.solid.createBox", inputs: BOX_DEFAULTS }]);
        });

        it("should run the kernel once for a call that leaves defaults out and the fully spelled one", () => {
            // Arrange
            answerTo({ functionName: "shapes.solid.createBox", inputs: { width: 1, length: 2, height: 3 } }, "uid-1");

            // Act
            const partial = answerTo({ functionName: "shapes.solid.createBox", inputs: { width: 1 } }, "uid-2");

            // Assert
            expect(kernelCalls).toHaveLength(1);
            expect(partial).toEqual({ uid: "uid-2", result: { made: "shapes.solid.createBox" } });
        });

        it("should run the kernel once for a call that passes a property as undefined and one that leaves it out", () => {
            // Arrange
            answerTo({ functionName: "shapes.solid.createBox", inputs: {} }, "uid-1");

            // Act
            answerTo({ functionName: "shapes.solid.createBox", inputs: { height: undefined, width: 1 } }, "uid-2");

            // Assert
            expect(kernelCalls).toHaveLength(1);
        });

        it("should cache a call under its inputs with every default spelled out", () => {
            // Act
            answerTo({ functionName: "shapes.solid.createBox", inputs: { width: 5 } });

            // Assert
            expect(Object.values(cacheHelper.usedHashes)).toEqual([cacheHelper.computeHash({ functionName: "shapes.solid.createBox", inputs: { width: 5, length: 2, height: 3 } })]);
        });

        it("should give a defaulted property the call passed as null its default", () => {
            // Act
            answerTo({ functionName: "shapes.solid.createBox", inputs: { width: null, height: 7 } });

            // Assert
            expect(kernelCalls).toEqual([{ path: "shapes.solid.createBox", inputs: { width: 1, length: 2, height: 7 } }]);
        });

        it("should pass the inputs of an operation the registry does not list through as they are", () => {
            // Act
            answerTo({ functionName: "echo", inputs: { size: 2 } });

            // Assert
            expect(kernelCalls).toEqual([{ path: "echo", inputs: { size: 2 } }]);
        });
    });

    describe("resolving shape references against the cache", () => {
        it("should replace a reference nested in a list inside an object inside a list", () => {
            // Act
            answerTo({ functionName: "echo", inputs: { groups: [{ items: [5, SHAPE_REFERENCE] }] } });

            // Assert
            expect(kernelCalls).toEqual([{ path: "echo", inputs: { groups: [{ items: [5, { kernel: "shape", hash: SHAPE_HASH }] }] } }]);
        });

        it("should leave the posted inputs as they were", () => {
            // Arrange
            const inputs = { groups: [{ items: [5, { type: "occ-shape", hash: SHAPE_HASH }] }] };

            // Act
            answerTo({ functionName: "echo", inputs });

            // Assert
            expect(inputs).toEqual({ groups: [{ items: [5, { type: "occ-shape", hash: SHAPE_HASH }] }] });
        });

        it("should cache the call under its references and defaults, not the shapes they stand for", () => {
            // Act
            answerTo({ functionName: "shapes.solid.createBox", inputs: { shape: SHAPE_REFERENCE } });

            // Assert
            expect(Object.values(cacheHelper.usedHashes)).toEqual([cacheHelper.computeHash({ functionName: "shapes.solid.createBox", inputs: { ...BOX_DEFAULTS, shape: SHAPE_REFERENCE } })]);
            expect(kernelCalls).toEqual([{ path: "shapes.solid.createBox", inputs: { ...BOX_DEFAULTS, shape: { kernel: "shape", hash: SHAPE_HASH } } }]);
        });

        it("should answer a call the cache holds without looking up, or asking the kernel about, the shapes it refers to", () => {
            // Arrange
            const isNull = vi.fn((): boolean => false);
            cacheHelper.addToCache(SHAPE_HASH, { $$: {}, IsNull: isNull });
            answerTo({ functionName: "shapes.solid.createBox", inputs: { shape: SHAPE_REFERENCE } }, "uid-1");
            isNull.mockClear();

            // Act
            const answer = answerTo({ functionName: "shapes.solid.createBox", inputs: { shape: SHAPE_REFERENCE } }, "uid-2");

            // Assert
            expect(answer).toEqual({ uid: "uid-2", result: { made: "shapes.solid.createBox" } });
            expect(isNull).not.toHaveBeenCalled();
            expect(kernelCalls).toHaveLength(1);
        });

        it("should answer a call the cache holds even when a shape it referred to has since been deleted", () => {
            // Arrange
            answerTo({ functionName: "shapes.solid.createBox", inputs: { shape: SHAPE_REFERENCE } }, "uid-1");
            cacheHelper.cleanCacheForHash(String(SHAPE_HASH));

            // Act
            const answer = answerTo({ functionName: "shapes.solid.createBox", inputs: { shape: SHAPE_REFERENCE } }, "uid-2");

            // Assert
            expect(answer).toEqual({ uid: "uid-2", result: { made: "shapes.solid.createBox" } });
        });

        it("should fail the call when a reference is no longer cached", () => {
            // Act
            const answer = answerTo({ functionName: "echo", inputs: { shapes: [SHAPE_REFERENCE, { type: "occ-shape", hash: 1 }] } });

            // Assert
            expect(answer.error).toBe("OCCT computation failed while executing function 'echo': Shape with hash 1 not found in cache. The cache may have been cleaned. Please regenerate the object. Input values were: {shapes: [{\"type\":\"occ-shape\",\"hash\":4242},{\"type\":\"occ-shape\",\"hash\":1}]}.");
            expect(kernelCalls).toEqual([]);
        });
    });

    describe("what a call is given that the operation would reject", () => {
        it("should report a property of the wrong kind, a rule that fails and a name the operation does not know, and still run", () => {
            // Act
            answerTo({ functionName: "shapes.solid.createBox", inputs: { width: 200, height: "tall", widht: 4 } });

            // Assert
            expect(reports).toEqual([
                { kernel: "OCCT", path: "shapes.solid.createBox", issue: { property: "height", code: "type", message: "must be a number" } },
                { kernel: "OCCT", path: "shapes.solid.createBox", issue: { property: "width", code: "custom", message: "must be at most 100" } },
                { kernel: "OCCT", path: "shapes.solid.createBox", issue: { property: "widht", code: "unknown-property", message: "is not an input of this operation and is ignored" } },
            ]);
            expect(kernelCalls).toHaveLength(1);
        });

        it("should check the inputs with the defaults laid under them, so a required property the DTO defaults is not missing", () => {
            // Act
            answerTo({ functionName: "shapes.solid.createBox", inputs: {} });

            // Assert
            expect(reports).toEqual([]);
        });

        it("should report a name the operation does not know even when the call passed it as undefined", () => {
            // Act
            answerTo({ functionName: "shapes.solid.createBox", inputs: { widht: undefined } });

            // Assert
            expect(reports).toEqual([
                { kernel: "OCCT", path: "shapes.solid.createBox", issue: { property: "widht", code: "unknown-property", message: "is not an input of this operation and is ignored" } },
            ]);
        });

        it("should not check again a call the cache already holds", () => {
            // Arrange
            answerTo({ functionName: "shapes.solid.createBox", inputs: { width: 200 } }, "uid-1");
            const afterTheHit: InputIssueReport[] = [];
            setInputIssueSink((report) => afterTheHit.push(report));

            // Act
            answerTo({ functionName: "shapes.solid.createBox", inputs: { width: 200 } }, "uid-2");

            // Assert
            expect(reports).toEqual([{ kernel: "OCCT", path: "shapes.solid.createBox", issue: { property: "width", code: "custom", message: "must be at most 100" } }]);
            expect(afterTheHit).toEqual([]);
            expect(kernelCalls).toHaveLength(1);
        });

        it("should run a call whose issues reach a sink that throws", () => {
            // Arrange
            const refusing = vi.fn((): void => {
                throw new Error("the sink refused");
            });
            setInputIssueSink(refusing);

            // Act
            const answer = answerTo({ functionName: "shapes.solid.createBox", inputs: { width: 200 } });

            // Assert
            expect(refusing).toHaveBeenCalledTimes(1);
            expect(answer).toEqual({ uid: "uid-1", result: { made: "shapes.solid.createBox" } });
        });

        it("should check a call that misses the cache even when an earlier one was reported", () => {
            // Arrange
            answerTo({ functionName: "shapes.solid.createBox", inputs: { width: 200 } }, "uid-1");
            const afterTheMiss: InputIssueReport[] = [];
            setInputIssueSink((report) => afterTheMiss.push(report));

            // Act
            answerTo({ functionName: "shapes.solid.createBox", inputs: { width: 300 } }, "uid-2");

            // Assert
            expect(afterTheMiss).toEqual([{ kernel: "OCCT", path: "shapes.solid.createBox", issue: { property: "width", code: "custom", message: "must be at most 100" } }]);
        });
    });

    describe("the paths a call may name", () => {
        it("should call the kernel method with the object that holds it as this", () => {
            // Act
            const answer = answerTo({ functionName: "measure.scaled", inputs: { size: 3 } });

            // Assert
            expect(answer).toEqual({ uid: "uid-1", result: 30 });
        });

        it("should refuse a path that reaches for the constructor", () => {
            // Act
            const answer = answerTo({ functionName: "constructor", inputs: {} });

            // Assert
            expect(answer).toEqual({
                uid: "uid-1",
                result: undefined,
                error: "OCCT computation failed while executing function 'constructor': Cannot resolve \"constructor\": \"constructor\" is not a segment an operation path may contain.",
                errorKind: "kernel",
                stack: expect.stringContaining("is not a segment an operation path may contain"),
            });
        });

        it("should refuse a path that walks through an object's prototype", () => {
            // Act
            const answer = answerTo({ functionName: "shapes.__proto__.hasOwnProperty", inputs: {} });

            // Assert
            expect(answer.error).toBe("OCCT computation failed while executing function 'shapes.__proto__.hasOwnProperty': Cannot resolve \"shapes.__proto__.hasOwnProperty\": \"__proto__\" is not a segment an operation path may contain.");
        });

        it("should refuse a path with an empty segment", () => {
            // Act
            const answer = answerTo({ functionName: "shapes..solid.createBox", inputs: {} });

            // Assert
            expect(answer.error).toBe("OCCT computation failed while executing function 'shapes..solid.createBox': Cannot resolve \"shapes..solid.createBox\": \"\" is not a segment an operation path may contain.");
        });

        it("should refuse a path that walks into a method as though it held others", () => {
            // Act
            const answer = answerTo({ functionName: "shapes.solid.createBox.call", inputs: {} });

            // Assert
            expect(answer.error).toBe("OCCT computation failed while executing function 'shapes.solid.createBox.call': Cannot resolve \"shapes.solid.createBox.call\": \"shapes.solid.createBox\" is not an object.");
            expect(kernelCalls).toEqual([]);
        });
    });

    describe("the shape of the answer", () => {
        it("should send an object definition back with its compound and its shapes as references and its data as it was", () => {
            // Act
            const answer = answerTo({ functionName: "assemble", inputs: {} });

            // Assert
            expect(answer).toEqual({
                uid: "uid-1",
                result: {
                    compound: { type: "occ-shape", hash: cacheHelper.itemHash(cacheHelper.computeHash({ functionName: "assemble", inputs: {} }), "compound") },
                    data: { name: "assembly" },
                    shapes: [{ id: "part-1", shape: { type: "occ-shape", hash: cacheHelper.itemHash(cacheHelper.computeHash({ functionName: "assemble", inputs: {} }), 0) } }],
                },
            });
        });

        it("should answer a second identical call whose answer is a list of shapes from the cache, with the same references", () => {
            // Arrange
            const first = answerTo({ functionName: "pieces", inputs: {} }, "uid-1");

            // Act
            const second = answerTo({ functionName: "pieces", inputs: {} }, "uid-2");

            // Assert
            expect(kernelCalls).toHaveLength(1);
            expect(second.result).toEqual(first.result);
            expect(second.result).toHaveLength(2);
        });

        it("should answer a cached 0 as 0 without running the kernel again", () => {
            // Arrange
            answerTo({ functionName: "falsy", inputs: {} }, "uid-1");

            // Act
            const second = answerTo({ functionName: "falsy", inputs: {} }, "uid-2");

            // Assert
            expect(second).toEqual({ uid: "uid-2", result: 0 });
            expect(kernelCalls).toHaveLength(1);
        });
    });

    describe("when the call fails", () => {
        it("should describe a kernel failure with the inputs as the call posted them, not with the defaults laid under them", () => {
            // Act
            const answer = answerTo({ functionName: "shapes.solid.fail", inputs: { width: 5 } });

            // Assert
            expect(answer.error).toBe("OCCT computation failed while executing function 'shapes.solid.fail': the kernel refused. Input values were: {width: 5}.");
            expect(answer.errorKind).toBe("kernel");
        });

        it("should send the stack apart from the message", () => {
            // Arrange
            const refused = new Error("the kernel refused");
            failure.value = refused;

            // Act
            const answer = answerTo({ functionName: "boom", inputs: {} });

            // Assert
            expect(answer).toEqual({
                uid: "uid-1",
                result: undefined,
                error: "OCCT computation failed while executing function 'boom': the kernel refused.",
                errorKind: "kernel",
                stack: refused.stack,
            });
        });

        it("should describe an input error by the path and its own message, as a failure of the inputs", () => {
            // Arrange
            const refused = new InputError("width must be positive", "width");
            failure.value = refused;

            // Act
            const answer = answerTo({ functionName: "boom", inputs: { width: -1 } });

            // Assert
            expect(answer).toEqual({
                uid: "uid-1",
                result: undefined,
                error: "boom: width must be positive",
                errorKind: "input",
                stack: refused.stack,
            });
        });

        it("should describe bytes and buffers by their size rather than write them out", () => {
            // Act
            const answer = answerTo({ functionName: "boom", inputs: { stepData: new Uint8Array([7, 8, 9]), buffer: new ArrayBuffer(4) } });

            // Assert
            expect(answer.error).toBe("OCCT computation failed while executing function 'boom': the kernel refused. Input values were: {stepData: [Uint8Array length=3], buffer: [ArrayBuffer byteLength=4]}.");
        });
    });
});
