import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { InputIssueReport, KernelOperationError, setInputIssueSink } from "@bitbybit-dev/base";
import { DataInput, initializationComplete, onMessageInput } from "./occ-worker";
import { BitbybitOcctModule } from "@bitbybit-dev/occt/bitbybit-dev-occt/bitbybit-dev-occt";

const { thrown } = vi.hoisted(() => {
    const thrown: { value: unknown } = { value: undefined };
    return { thrown };
});

vi.mock("@bitbybit-dev/occt", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@bitbybit-dev/occt")>();
    class VectorHelperService { }
    class ShapesHelperService { }
    class OccHelper { }
    class OCCTService {
        plugins: { dependencies: Record<string, unknown> } | undefined;
        boom = (): unknown => { throw thrown.value; };
        echo = (inputs: unknown): unknown => inputs;
        measure = (inputs: unknown): unknown => inputs;
    }
    class MeasureDto {
        size = 1;
    }
    const occtDtoRegistry = { measure: { dto: MeasureDto, constraints: { size: { kind: "number" } } } };
    return { VectorHelperService, ShapesHelperService, OccHelper, OCCTService, occtDtoRegistry, occtDtoRules: new Map(), readKernelException: actual.readKernelException };
});

const A_MODULE: BitbybitOcctModule = {} as BitbybitOcctModule;

describe("what the worker says when a call fails", () => {
    let messages: unknown[];

    const run = (action: { functionName: string; inputs?: Record<string, unknown> }, post?: (message: unknown) => void): void => {
        const call: DataInput = { action: action as DataInput["action"], uid: "uid-1" };
        onMessageInput(call, post ?? ((message: unknown) => messages.push(message)));
    };

    const answer = (): { error?: string; result?: unknown; errorKind?: string; code?: string; stack?: string } => messages[1] as { error?: string; result?: unknown; errorKind?: string; code?: string; stack?: string };

    beforeEach(() => {
        messages = [];
        thrown.value = new Error("the kernel refused");
        initializationComplete(A_MODULE, undefined, true);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("the error the kernel threw", () => {
        it("should report an Error by its message and its stack apart from it", () => {
            // Act
            run({ functionName: "boom", inputs: {} });

            // Assert
            expect(answer().error).toContain("the kernel refused");
            expect(answer().error).not.toContain("\n");
            expect(answer().stack).toContain("the kernel refused");
            expect(answer().errorKind).toBe("kernel");
        });

        it("should report a failure the kernel named by its message alone, with its code", () => {
            // Arrange
            thrown.value = new KernelOperationError("occt.fillet.failed", "The fillet could not be built.");

            // Act
            run({ functionName: "boom", inputs: { radius: 6 } });

            // Assert
            expect(answer().error).toBe("OCCT computation failed while executing function 'boom': The fillet could not be built. Input values were: {radius: 6}.");
            expect(answer().errorKind).toBe("kernel");
            expect(answer().code).toBe("occt.fillet.failed");
        });

        it("should report no code for a failure the kernel did not name", () => {
            // Act
            run({ functionName: "boom", inputs: {} });

            // Assert
            expect(answer().code).toBeUndefined();
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

        it("should report a C++ exception by the type and message the kernel reads from it, and free it", () => {
            // Arrange
            const release = vi.fn();
            const kernel = { getExceptionMessage: vi.fn(() => ["StdFail_NotDone", "BRep_API: command not done"]), decrementExceptionRefcount: release };
            initializationComplete(kernel as Partial<BitbybitOcctModule> as BitbybitOcctModule, undefined, true);
            thrown.value = 70632;

            // Act
            run({ functionName: "boom", inputs: {} });

            // Assert
            expect(answer().error).toBe("OCCT computation failed while executing function 'boom': StdFail_NotDone: BRep_API: command not done.");
            expect(kernel.getExceptionMessage).toHaveBeenCalledWith(70632);
            expect(release).toHaveBeenCalledWith(70632);
        });

        it("should report a C++ exception without a message by its type", () => {
            // Arrange
            const kernel = { getExceptionMessage: (): [string, undefined] => ["Standard_NullObject", undefined], decrementExceptionRefcount: (): void => undefined };
            initializationComplete(kernel as Partial<BitbybitOcctModule> as BitbybitOcctModule, undefined, true);
            thrown.value = 70632;

            // Act
            run({ functionName: "boom", inputs: {} });

            // Assert
            expect(answer().error).toBe("OCCT computation failed while executing function 'boom': Standard_NullObject.");
        });

        it("should report a C++ exception from a kernel that cannot read it as the number it is", () => {
            // Arrange
            thrown.value = 70632;

            // Act
            run({ functionName: "boom", inputs: {} });

            // Assert
            expect(answer().error).toBe("OCCT computation failed while executing function 'boom': 70632.");
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

        it("should report a call that named no function at all", () => {
            // Act
            run({ inputs: {} } as { functionName: string; inputs: Record<string, unknown> });

            // Assert
            expect(answer().error).toContain("OCCT computation failed:");
        });

        it("should report a message that carried no action at all", () => {
            // Arrange
            const call = { uid: "uid-1" } as DataInput;

            // Act
            onMessageInput(call, (message: unknown) => messages.push(message));

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
        const refusingOnce = (sent: unknown[]): ((message: unknown) => void) => {
            let refusedOnce = false;
            return (message: unknown): void => {
                if (!refusedOnce && typeof message === "object" && message !== null && "error" in message) {
                    refusedOnce = true;
                    throw new Error("the channel is closed");
                }
                sent.push(message);
            };
        };

        it("should still answer, with a fixed message", () => {
            // Arrange
            const sent: unknown[] = [];

            // Act
            run({ functionName: "boom", inputs: {} }, refusingOnce(sent));

            // Assert
            expect(sent[1]).toEqual({ uid: "uid-1", result: undefined, error: "OCCT computation failed, and the failure could not be reported.", errorKind: "kernel" });
        });

        it("should still answer when what the kernel threw has no text form either", () => {
            // Arrange
            const bare: Record<string, unknown> = Object.create(null);
            bare["self"] = bare;
            thrown.value = bare;
            const sent: unknown[] = [];

            // Act
            run({ functionName: "boom", inputs: {} }, refusingOnce(sent));

            // Assert
            expect(sent[1]).toEqual({ uid: "uid-1", result: undefined, error: "OCCT computation failed, and the failure could not be reported.", errorKind: "kernel" });
        });

        it("should describe what the kernel threw when it has no text form and JSON cannot write it", () => {
            // Arrange
            const bare: Record<string, unknown> = Object.create(null);
            bare["self"] = bare;
            thrown.value = bare;

            // Act
            run({ functionName: "boom", inputs: {} });

            // Assert
            expect(answer().error).toBe("OCCT computation failed while executing function 'boom': [object Object].");
        });
    });

    describe("a kernel that crashes", () => {
        const RuntimeError = Reflect.get(WebAssembly, "RuntimeError") as new (message: string) => Error;
        const settle = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));
        const answers = (): { uid?: string; result?: unknown; error?: string; errorKind?: string }[] => messages.filter((message) => typeof message === "object") as { uid?: string; result?: unknown; error?: string; errorKind?: string }[];

        beforeEach(() => {
            thrown.value = new RuntimeError("memory access out of bounds");
        });

        it("should answer the call as a crash and refuse every later call when it has no way to restart", () => {
            // Act
            run({ functionName: "boom", inputs: {} });
            run({ functionName: "echo", inputs: { size: 1 } });

            // Assert
            expect(answers()[0]!.errorKind).toBe("crash");
            expect(answers()[0]!.error).toBe("OCCT crashed while executing function 'boom': RuntimeError: memory access out of bounds. Every shape made before it is gone; create a new worker to continue, or give initializationComplete a restart function.");
            expect(answers()[1]).toEqual({ uid: "uid-1", result: undefined, error: "OCCT cannot run 'echo': the kernel crashed earlier and was not restarted (memory access out of bounds).", errorKind: "crash" });
            expect(messages.filter((message) => message === "busy")).toHaveLength(1);
        });

        it("should still refuse, and answer, a later message that carries no call", () => {
            // Arrange
            const sent: unknown[] = [];
            run({ functionName: "boom", inputs: {} });

            // Act
            Reflect.apply(onMessageInput, undefined, [undefined, (message: unknown): number => sent.push(message)]);

            // Assert
            expect(sent).toEqual([{ uid: undefined, result: undefined, error: "OCCT cannot run '': the kernel crashed earlier and was not restarted (memory access out of bounds).", errorKind: "crash" }]);
        });

        it("should start a new kernel with the restart it was given, and run the calls made meanwhile on it", async () => {
            // Arrange
            const posted: unknown[] = [];
            vi.stubGlobal("postMessage", (message: unknown) => posted.push(message));
            const restart = vi.fn((): void => {
                initializationComplete(A_MODULE, undefined, false, restart);
            });
            initializationComplete(A_MODULE, undefined, true, restart);

            // Act
            run({ functionName: "boom", inputs: {} });
            run({ functionName: "echo", inputs: { size: 2 } });
            const answeredBeforeRestart = answers().length;
            await settle();

            // Assert
            expect(answers()[0]!.error).toBe("OCCT crashed while executing function 'boom': RuntimeError: memory access out of bounds. The kernel is restarting, and every shape made before it is gone.");
            expect(answeredBeforeRestart).toBe(1);
            expect(restart).toHaveBeenCalledTimes(1);
            expect(answers()[1]).toEqual({ uid: "uid-1", result: { size: 2 } });
            expect(posted).toEqual([]);
            vi.unstubAllGlobals();
        });

        it("should refuse later calls when the restart brought no new kernel", async () => {
            // Arrange
            initializationComplete(A_MODULE, undefined, true, () => undefined);

            // Act
            run({ functionName: "boom", inputs: {} });
            await settle();
            run({ functionName: "echo", inputs: {} });

            // Assert
            expect(answers()[1]!.error).toBe("OCCT cannot run 'echo': the kernel crashed earlier and was not restarted (memory access out of bounds).");
        });

        it("should refuse later calls when the restart failed", async () => {
            // Arrange
            initializationComplete(A_MODULE, undefined, true, () => Promise.reject(new Error("no memory for a new kernel")));

            // Act
            run({ functionName: "boom", inputs: {} });
            await settle();
            run({ functionName: "echo", inputs: {} });

            // Assert
            expect(answers()[1]!.errorKind).toBe("crash");
        });

        it("should run normally again once it is given a new kernel", () => {
            // Arrange
            run({ functionName: "boom", inputs: {} });

            // Act
            initializationComplete(A_MODULE, undefined, true);
            run({ functionName: "echo", inputs: { size: 3 } });

            // Assert
            expect(answers()[1]).toEqual({ uid: "uid-1", result: { size: 3 } });
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
    it("should report what a call is given that the operation would reject, and still run it", () => {
        // Arrange
        const reports: InputIssueReport[] = [];
        setInputIssueSink((report) => reports.push(report));

        // Act
        run({ functionName: "measure", inputs: { size: "big" } });

        // Assert
        expect(reports.map((report) => `${report.kernel} ${report.path} ${report.issue.property} ${report.issue.code}`)).toEqual(["OCCT measure size type"]);
        expect(answer().result).toEqual({ size: "big" });
        setInputIssueSink();
    });
});
