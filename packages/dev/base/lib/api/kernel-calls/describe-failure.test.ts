import { describe, it, expect } from "vitest";
import { describeKernelFailure } from "./describe-failure";
import { InputError } from "./errors";

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

    it("should give binary inputs by their size only", () => {
        // Arrange
        const inputs = { bytes: new Uint8Array(1024), floats: new Float64Array(2), buffer: new ArrayBuffer(16) };

        // Act
        const failure = describeKernelFailure("OCCT", PATH, inputs, new Error("bad step"));

        // Assert
        expect(failure.message).toBe(`${FAILED}: bad step. Input values were: {bytes: [Uint8Array byteLength=1024], floats: [Float64Array byteLength=16], buffer: [ArrayBuffer byteLength=16]}.`);
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
