import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { DataInput, initializationComplete, onMessageInput } from "./occ-worker";
import { BitbybitOcctModule } from "@bitbybit-dev/occt/bitbybit-dev-occt/bitbybit-dev-occt";

// What the worker says when a call fails, over a kernel that fails on demand. A kernel throws more
// than Errors - a string from a rejected emscripten call, an object from a library - and the inputs
// it was given may be megabytes of bytes or may not survive being written out at all, so what reaches
// the caller has to be built without assuming any of that. The suites beside this one run the same
// handler over the real kernel, which cannot be made to fail in these particular ways.

const { thrown } = vi.hoisted(() => {
    // What the kernel throws for the case at hand. A kernel throws more than Errors, so this is
    // declared to hold anything.
    const thrown: { value: unknown } = { value: undefined };
    return { thrown };
});

// A transport failure that is not an Error - what a postMessage refusing to clone a value can look
// like once it has crossed a host boundary. It is declared as one so that it may be thrown at all;
// the case is about what the fallback report says when it turns out not to be one.
const TRANSPORT_FAILURE = { toString: () => "the channel is closed" } as Error;

vi.mock("@bitbybit-dev/occt", () => {
    class VectorHelperService { }
    class ShapesHelperService { }
    class OccHelper { }
    class OCCTService {
        plugins: { dependencies: Record<string, unknown> } | undefined;
        boom = (): unknown => { throw thrown.value; };
        echo = (inputs: unknown): unknown => inputs;
    }
    return { VectorHelperService, ShapesHelperService, OccHelper, OCCTService };
});

const A_MODULE: BitbybitOcctModule = {} as BitbybitOcctModule;

describe("what the worker says when a call fails", () => {
    let messages: unknown[];

    // A call as it arrives from the manager. Its inputs are optional here and not in the type the
    // worker declares, because what the worker reports for a call carrying none is under test.
    const run = (action: { functionName: string; inputs?: Record<string, unknown> }, post?: (message: unknown) => void): void => {
        const call: DataInput = { action: action as DataInput["action"], uid: "uid-1" };
        onMessageInput(call, post ?? ((message: unknown) => messages.push(message)));
    };

    const answer = (): { error?: string; result?: unknown } => messages[1] as { error?: string; result?: unknown };

    beforeEach(() => {
        messages = [];
        thrown.value = new Error("the kernel refused");
        initializationComplete(A_MODULE, undefined, true);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("the error the kernel threw", () => {
        it("should report an Error with its stack", () => {
            // Act
            run({ functionName: "boom", inputs: {} });

            // Assert
            expect(answer().error).toContain("the kernel refused");
        });

        it("should report an Error with no stack by its name and message", () => {
            // Arrange
            const error = new RangeError("radius out of range");
            error.stack = "";
            thrown.value = error;

            // Act
            run({ functionName: "boom", inputs: {} });

            // Assert
            expect(answer().error).toContain("RangeError: radius out of range");
        });

        it("should report a string the kernel threw as it stands", () => {
            // Arrange
            thrown.value = "Standard_ConstructionError";

            // Act
            run({ functionName: "boom", inputs: {} });

            // Assert
            expect(answer().error).toContain("Standard_ConstructionError");
        });

        it("should report anything else by writing it out", () => {
            // Arrange
            thrown.value = { code: 7 };

            // Act
            run({ functionName: "boom", inputs: {} });

            // Assert
            expect(answer().error).toContain("{\"code\":7}");
        });

        it("should report something that cannot be written out by its own description", () => {
            // Arrange
            const circular: Record<string, unknown> = {};
            circular["self"] = circular;
            thrown.value = circular;

            // Act
            run({ functionName: "boom", inputs: {} });

            // Assert
            expect(answer().error).toContain("[object Object]");
        });

        it("should name no function when the call named none", () => {
            // Act
            run({ functionName: "", inputs: { shape: { type: "occ-shape", hash: 999 } } });

            // Assert
            expect(answer().error).toContain("OCCT computation failed:");
        });

        it("should report a failure that carried no inputs at all", () => {
            // Act
            run({ functionName: "boom" });

            // Assert
            expect(answer().error).toContain("while executing function 'boom'");
        });

        it("should name the function that failed", () => {
            // Act
            run({ functionName: "boom", inputs: {} });

            // Assert
            expect(answer().error).toContain("while executing function 'boom'");
        });
    });

    describe("the inputs the failed call was given", () => {
        it("should describe bytes by their kind and length rather than their content", () => {
            // Act
            run({ functionName: "boom", inputs: { stepData: new Uint8Array([1, 2, 3]) } });

            // Assert
            expect(answer().error).toContain("stepData: [Uint8Array length=3]");
        });

        it("should describe a buffer by its length rather than its content", () => {
            // Act
            run({ functionName: "boom", inputs: { stepData: new ArrayBuffer(8) } });

            // Assert
            expect(answer().error).toContain("stepData: [ArrayBuffer byteLength=8]");
        });

        it("should write an ordinary input out", () => {
            // Act
            run({ functionName: "boom", inputs: { radius: 5 } });

            // Assert
            expect(answer().error).toContain("radius: 5");
        });

        it("should cut a long input short", () => {
            // Act
            run({ functionName: "boom", inputs: { points: "x".repeat(500) } });

            // Assert
            expect(answer().error).toContain("(truncated)");
        });

        it("should say so of an input that cannot be written out", () => {
            // Arrange
            const circular: Record<string, unknown> = {};
            circular["self"] = circular;

            // Act
            run({ functionName: "boom", inputs: { shape: circular } });

            // Assert
            expect(answer().error).toContain("shape: [unserializable]");
        });
    });

    describe("when the failure cannot be sent back either", () => {
        it("should fall back to the shortest report it can make", () => {
            // Arrange
            const sent: unknown[] = [];
            let refusedOnce = false;
            const post = (message: unknown): void => {
                if (!refusedOnce && typeof message === "object" && message !== null && "error" in message) {
                    refusedOnce = true;
                    throw new Error("the channel is closed");
                }
                sent.push(message);
            };

            // Act
            run({ functionName: "boom", inputs: {} }, post);

            // Assert
            expect(sent[1]).toMatchObject({
                uid: "uid-1",
                error: expect.stringContaining("additionally, error formatting failed: the channel is closed"),
            });
        });

        it("should describe both failures even when neither was an Error", () => {
            // Arrange
            thrown.value = "Standard_ConstructionError";
            const sent: unknown[] = [];
            let refusedOnce = false;
            const post = (message: unknown): void => {
                if (!refusedOnce && typeof message === "object" && message !== null && "error" in message) {
                    refusedOnce = true;
                    throw TRANSPORT_FAILURE;
                }
                sent.push(message);
            };

            // Act
            run({ functionName: "boom", inputs: {} }, post);

            // Assert
            expect(sent[1]).toMatchObject({
                error: "OCCT computation failed: Standard_ConstructionError (additionally, error formatting failed: the channel is closed)",
            });
        });
    });

    describe("dependencies added before the kernel could take them", () => {
        it("should hand them over once a kernel that takes plugins arrives", () => {
            // Arrange
            run({ functionName: "addOc", inputs: { drawing: "a-plugin" } });
            const plugins = { dependencies: {} as Record<string, unknown> };

            // Act
            initializationComplete(A_MODULE, plugins, true);

            // Assert
            expect(plugins.dependencies).toEqual({ drawing: "a-plugin" });
        });
    });

    describe("announcing itself", () => {
        it("should tell the host it is ready unless asked not to", () => {
            // Arrange
            const posted: unknown[] = [];
            vi.stubGlobal("postMessage", (message: unknown) => posted.push(message));

            // Act
            initializationComplete(A_MODULE, undefined);

            // Assert
            expect(posted).toEqual(["occ-initialised"]);
            vi.unstubAllGlobals();
        });
    });
});
