import { describe, it, expect } from "vitest";
import { describeKernelFailure } from "./describe-failure";
import { InputError, KernelOperationError } from "./errors";

const PATH = "shapes.solid.createBox";
const FAILED = "OCCT computation failed while executing function 'shapes.solid.createBox'";

class InputErrorFromAnotherCopy extends Error {
    constructor(message: string) {
        super(message);
        this.name = "InputError";
    }
}

describe("describeKernelFailure", () => {
    it("should name the kernel, the path and the message of a kernel failure, then the inputs", () => {
        // Act
        const failure = describeKernelFailure("OCCT", PATH, { width: -1 }, new Error("BRep_API: command not done"));

        // Assert
        expect(failure.message).toBe("OCCT computation failed while executing function 'shapes.solid.createBox': BRep_API: command not done. Input values were: {width: -1}.");
        expect(failure.kind).toBe("kernel");
    });

    it("should give a named kernel failure's message without its type, and its code", () => {
        // Act
        const failure = describeKernelFailure("OCCT", "fillets.filletEdges", { radius: 6 }, new KernelOperationError("occt.fillet.failed", "The fillet could not be built."));

        // Assert
        expect(failure).toEqual({
            message: "OCCT computation failed while executing function 'fillets.filletEdges': The fillet could not be built. Input values were: {radius: 6}.",
            kind: "kernel",
            code: "occt.fillet.failed",
            stack: expect.any(String),
        });
    });

    it("should read a named kernel failure by its name, whichever copy of the class threw it", () => {
        // Arrange
        const error = Object.assign(new Error("The loft could not be built"), { name: "KernelOperationError", code: "occt.loft.failed" });

        // Act
        const failure = describeKernelFailure("OCCT", "", {}, error);

        // Assert
        expect(failure.message).toBe("OCCT computation failed: The loft could not be built.");
        expect(failure.code).toBe("occt.loft.failed");
    });

    it("should pass on the details of a named kernel failure", () => {
        // Arrange
        const error = new KernelOperationError("occt.fillet.failedOnEdges", "The fillet failed at edges 3 and 7.", { edges: [3, 7], radius: 20, shape: "solid", partial: false, names: ["a", "b"] });

        // Act
        const failure = describeKernelFailure("OCCT", "fillets.filletEdges", {}, error);

        // Assert
        expect(failure.code).toBe("occt.fillet.failedOnEdges");
        expect(failure.details).toEqual({ edges: [3, 7], radius: 20, shape: "solid", partial: false, names: ["a", "b"] });
    });

    it.each([
        ["a nested record", { edges: { first: 3 } }],
        ["a list of mixed kinds", { edges: [3, "seven"] }],
        ["a function", { edges: (): number => 3 }],
        ["a list", [3, 7]],
        ["null", null],
    ])("should drop details that are %s, which cannot cross to another thread or fill a template", (_what, details) => {
        // Arrange
        const error = Object.assign(new Error("The fillet failed."), { name: "KernelOperationError", code: "occt.fillet.failed", details });

        // Act
        const failure = describeKernelFailure("OCCT", "fillets.filletEdges", {}, error);

        // Assert
        expect(failure.code).toBe("occt.fillet.failed");
        expect(failure.details).toBeUndefined();
    });

    it("should give no details for an error that carries details but no code", () => {
        // Arrange
        const error = Object.assign(new Error("failed"), { name: "KernelOperationError", details: { edges: [3] } });

        // Act
        const failure = describeKernelFailure("OCCT", PATH, {}, error);

        // Assert
        expect(failure.details).toBeUndefined();
    });

    it("should give no code for an error that only looks named", () => {
        // Arrange
        const numbered = Object.assign(new Error("not found"), { name: "KernelOperationError", code: 404 });
        const system = Object.assign(new Error("no such file"), { code: "ENOENT" });

        // Act
        const fromNumbered = describeKernelFailure("OCCT", PATH, {}, numbered);
        const fromSystem = describeKernelFailure("OCCT", PATH, {}, system);

        // Assert
        expect(fromNumbered.code).toBeUndefined();
        expect(fromNumbered.message).toBe(`${FAILED}: KernelOperationError: not found.`);
        expect(fromSystem.code).toBeUndefined();
    });

    it("should not end a message that already ends a sentence with a second full stop", () => {
        // Act
        const stated = describeKernelFailure("OCCT", PATH, {}, new Error("Could not build the draft."));
        const asked = describeKernelFailure("OCCT", PATH, {}, new Error("Is the wire closed?"));

        // Assert
        expect(stated.message).toBe(`${FAILED}: Could not build the draft.`);
        expect(asked.message).toBe(`${FAILED}: Is the wire closed?`);
    });

    it("should not end a crash whose message already ends a sentence with a second full stop", () => {
        // Arrange
        const trap = new Error("The stack overflowed.");
        trap.name = "RuntimeError";

        // Act
        const failure = describeKernelFailure("OCCT", PATH, {}, trap);

        // Assert
        expect(failure.message).toBe("OCCT crashed while executing function 'shapes.solid.createBox': RuntimeError: The stack overflowed.");
    });

    it("should keep the stack out of the message and report it apart", () => {
        // Arrange
        const error = new Error("kernel failed");

        // Act
        const failure = describeKernelFailure("OCCT", PATH, {}, error);

        // Assert
        expect(failure.message).not.toContain("    at ");
        expect(failure.stack).toBe(error.stack);
    });

    it("should prefix a named error type other than Error", () => {
        // Act
        const failure = describeKernelFailure("JSCAD", PATH, {}, new TypeError("x is undefined"));

        // Assert
        expect(failure.message).toBe("JSCAD computation failed while executing function 'shapes.solid.createBox': TypeError: x is undefined.");
    });

    it("should read a WebAssembly trap as a crash of the kernel, with the inputs", () => {
        // Arrange
        const RuntimeError = Reflect.get(WebAssembly, "RuntimeError") as new (message: string) => Error;

        // Act
        const failure = describeKernelFailure("OCCT", PATH, { width: 2 }, new RuntimeError("memory access out of bounds"));

        // Assert
        expect(failure.message).toBe("OCCT crashed while executing function 'shapes.solid.createBox': RuntimeError: memory access out of bounds. Input values were: {width: 2}.");
        expect(failure.kind).toBe("crash");
    });

    it("should read a trap from another realm by its name, and leave out a path it was not given", () => {
        // Arrange
        const trap = new Error("unreachable");
        trap.name = "RuntimeError";

        // Act
        const failure = describeKernelFailure("Manifold", "", {}, trap);

        // Assert
        expect(failure).toEqual({ message: "Manifold crashed: RuntimeError: unreachable.", kind: "crash", stack: trap.stack });
    });

    it("should pass on the code and details a caller tagged a trap with, and no details that are not plain values", () => {
        // Arrange
        const RuntimeError = Reflect.get(WebAssembly, "RuntimeError") as new (message: string) => Error;
        const tagged = new RuntimeError("null function");
        Reflect.set(tagged, "code", "occt.design.crashed");
        Reflect.set(tagged, "details", { feature: "fillet1", path: "/features/2" });
        const odd = new RuntimeError("null function");
        Reflect.set(odd, "code", "occt.design.crashed");
        Reflect.set(odd, "details", { feature: { id: "fillet1" } });

        // Act
        const failure = describeKernelFailure("OCCT", "design.build", {}, tagged);
        const oddFailure = describeKernelFailure("OCCT", "design.build", {}, odd);

        // Assert
        expect([failure.kind, failure.code, failure.details]).toEqual(["crash", "occt.design.crashed", { feature: "fillet1", path: "/features/2" }]);
        expect(failure.message).toBe("OCCT crashed while executing function 'design.build': RuntimeError: null function.");
        expect([oddFailure.code, oddFailure.details]).toEqual(["occt.design.crashed", undefined]);
    });

    it("should read an input error as the path and its own message, with no input dump", () => {
        // Act
        const failure = describeKernelFailure("OCCT", PATH, { width: -1 }, new InputError("`width` must be at least 0, got -1", "width"));

        // Assert
        expect(failure).toEqual({ message: "shapes.solid.createBox: `width` must be at least 0, got -1", kind: "input", stack: expect.any(String) });
    });

    it("should read an error named InputError as an input error, whichever copy of the class threw it", () => {
        // Arrange
        const error = new InputErrorFromAnotherCopy("`width` must be at least 0");

        // Act
        const failure = describeKernelFailure("OCCT", PATH, { width: -1 }, error);

        // Assert
        expect(failure).toEqual({ message: "shapes.solid.createBox: `width` must be at least 0", kind: "input", stack: error.stack });
    });

    it("should take a thrown string as the message", () => {
        // Act
        const failure = describeKernelFailure("Manifold", PATH, {}, "manifold is empty");

        // Assert
        expect(failure.message).toBe("Manifold computation failed while executing function 'shapes.solid.createBox': manifold is empty.");
        expect(failure.stack).toBeUndefined();
    });

    it("should write a thrown object as its JSON", () => {
        // Act
        const failure = describeKernelFailure("OCCT", PATH, {}, { code: 3 });

        // Assert
        expect(failure).toEqual({ message: `${FAILED}: {"code":3}.`, kind: "kernel", stack: undefined });
    });

    it("should say undefined when the call threw undefined", () => {
        // Act
        const failure = describeKernelFailure("OCCT", PATH, {}, undefined);

        // Assert
        expect(failure.message).toBe("OCCT computation failed while executing function 'shapes.solid.createBox': undefined.");
    });

    it("should write a thrown value JSON has no text for in its text form", () => {
        // Act
        const failure = describeKernelFailure("OCCT", PATH, {}, Symbol("boom"));

        // Assert
        expect(failure.message).toBe(`${FAILED}: Symbol(boom).`);
    });

    it("should fall back to the text form of a thrown object that JSON cannot write", () => {
        // Arrange
        const circular: Record<string, unknown> = {};
        circular["self"] = circular;

        // Act
        const failure = describeKernelFailure("OCCT", PATH, {}, circular);

        // Assert
        expect(failure.message).toBe(`${FAILED}: [object Object].`);
    });

    it("should leave the function out when the call named none", () => {
        // Act
        const kernelFailure = describeKernelFailure("OCCT", "", {}, new Error("failed"));
        const inputFailure = describeKernelFailure("OCCT", "", {}, new InputError("`width` must be positive", "width"));

        // Assert
        expect(kernelFailure.message).toBe("OCCT computation failed: failed.");
        expect(inputFailure.message).toBe("`width` must be positive");
    });

    it("should give binary inputs by their kind and size only", () => {
        // Arrange
        const inputs = { bytes: new Uint8Array(1024), floats: new Float64Array(2), buffer: new ArrayBuffer(16), view: new DataView(new ArrayBuffer(8)) };

        // Act
        const failure = describeKernelFailure("OCCT", PATH, inputs, new Error("bad step"));

        // Assert
        expect(failure.message).toBe(`${FAILED}: bad step. Input values were: {bytes: [Uint8Array length=1024], floats: [Float64Array length=2], buffer: [ArrayBuffer byteLength=16], view: [DataView byteLength=8]}.`);
    });

    it("should give binary data nested at any depth by its kind and size only", () => {
        // Arrange
        const inputs = { mesh: { numProp: 3, vertProperties: new Float32Array(3000), triVerts: new Uint32Array(3) }, meshes: [{ data: new ArrayBuffer(4) }] };

        // Act
        const failure = describeKernelFailure("Manifold", PATH, inputs, new Error("not manifold"));

        // Assert
        expect(failure.message).toBe("Manifold computation failed while executing function 'shapes.solid.createBox': not manifold. Input values were: {mesh: {\"numProp\":3,\"vertProperties\":\"[Float32Array length=3000]\",\"triVerts\":\"[Uint32Array length=3]\"}, meshes: [{\"data\":\"[ArrayBuffer byteLength=4]\"}]}.");
    });

    it("should give binary data inside a thrown object by its kind and size only", () => {
        // Act
        const failure = describeKernelFailure("OCCT", PATH, {}, { reason: "bad mesh", mesh: new Float32Array(3000) });

        // Assert
        expect(failure.message).toBe(`${FAILED}: {"reason":"bad mesh","mesh":"[Float32Array length=3000]"}.`);
    });

    it("should read a long list only as far as the cut", () => {
        // Arrange
        let read = 0;
        const item = { toJSON: (): number => { read += 1; return 1; } };
        const inputs = { points: Array.from({ length: 10000 }, () => item) };

        // Act
        const failure = describeKernelFailure("OCCT", PATH, inputs, new Error("failed"));

        // Assert
        expect(failure.message).toBe(`${FAILED}: failed. Input values were: {points: [${Array.from({ length: 100 }, () => "1").join(",")}…(truncated)}.`);
        expect(read).toBeLessThanOrEqual(201);
    });

    it("should stop reading nested lists once the cut is reached", () => {
        // Arrange
        let read = 0;
        const item = { toJSON: (): number => { read += 1; return 1; } };
        const row = Array.from({ length: 150 }, () => item);
        const inputs = { grid: Array.from({ length: 150 }, () => row) };

        // Act
        const failure = describeKernelFailure("OCCT", PATH, inputs, new Error("failed"));

        // Assert
        expect(failure.message).toContain("grid: [[1,1,1");
        expect(failure.message).toContain("…(truncated)");
        expect(read).toBeLessThan(400);
    });

    it("should cut a long thrown object at 1000 characters", () => {
        // Act
        const failure = describeKernelFailure("OCCT", PATH, {}, { text: "a".repeat(5000) });

        // Assert
        expect(failure.message).toBe(`${FAILED}: {"text":"${"a".repeat(991)}…(truncated).`);
    });

    it("should describe a thrown object that has no text form and that JSON cannot write", () => {
        // Arrange
        const bare: Record<string, unknown> = Object.create(null);
        bare["self"] = bare;

        // Act
        const failure = describeKernelFailure("JSCAD", PATH, {}, bare);

        // Assert
        expect(failure.message).toBe("JSCAD computation failed while executing function 'shapes.solid.createBox': [object Object].");
    });

    it("should still describe a failure whose error cannot even be inspected, and not throw", () => {
        // Arrange
        const hostile = new Proxy({}, { getPrototypeOf: (): object => { throw new Error("no prototype for you"); } });

        // Act
        const failure = describeKernelFailure("Manifold", PATH, {}, hostile);

        // Assert
        expect(failure).toEqual({ message: "Manifold computation failed while executing function 'shapes.solid.createBox', and the failure could not be described.", kind: "kernel", stack: undefined });
    });

    it("should cut a long input at 200 characters", () => {
        // Arrange
        const inputs = { text: "a".repeat(500) };

        // Act
        const failure = describeKernelFailure("OCCT", PATH, inputs, new Error("too long"));

        // Assert
        expect(failure.message).toContain(`text: "${"a".repeat(199)}…(truncated)`);
    });

    it("should write an input of exactly 200 characters whole", () => {
        // Arrange
        const exactlyTwoHundredAsJson = "a".repeat(198);

        // Act
        const failure = describeKernelFailure("OCCT", PATH, { text: exactlyTwoHundredAsJson }, new Error("failed"));

        // Assert
        expect(failure.message).toBe(`${FAILED}: failed. Input values were: {text: "${exactlyTwoHundredAsJson}"}.`);
    });

    it("should cut an input of 201 characters after its first 200", () => {
        // Arrange
        const twoHundredAndOneAsJson = "a".repeat(199);

        // Act
        const failure = describeKernelFailure("OCCT", PATH, { text: twoHundredAndOneAsJson }, new Error("failed"));

        // Assert
        expect(failure.message).toBe(`${FAILED}: failed. Input values were: {text: "${twoHundredAndOneAsJson}…(truncated)}.`);
    });

    it("should mark an input JSON cannot write, and one it writes as nothing", () => {
        // Arrange
        const circular: Record<string, unknown> = {};
        circular["self"] = circular;

        // Act
        const failure = describeKernelFailure("OCCT", PATH, { circular, missing: undefined }, new Error("failed"));

        // Assert
        expect(failure.message).toBe(`${FAILED}: failed. Input values were: {circular: [unserializable], missing: undefined}.`);
    });

    it("should add no input list when the inputs are not an object or are empty", () => {
        // Act
        const noInputs = describeKernelFailure("OCCT", PATH, undefined, new Error("failed"));
        const empty = describeKernelFailure("OCCT", PATH, {}, new Error("failed"));

        // Assert
        expect(noInputs.message).not.toContain("Input values were");
        expect(empty.message).not.toContain("Input values were");
    });

    it.each([
        ["null", null],
        ["a typed array", new Uint8Array([1, 2, 3])],
        ["a bare buffer", new ArrayBuffer(8)],
        ["a number", 5],
    ])("should add no input list when the inputs are %s", (_what, inputs) => {
        // Act
        const failure = describeKernelFailure("OCCT", PATH, inputs, new Error("failed"));

        // Assert
        expect(failure.message).toBe(`${FAILED}: failed.`);
    });
});
