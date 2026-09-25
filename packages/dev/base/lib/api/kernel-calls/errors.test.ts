import { describe, it, expect } from "vitest";
import { InputError, KernelCallError } from "./errors";

describe("InputError", () => {
    it("should be an Error that names the property at fault", () => {
        // Act
        const error = new InputError("`width` must be at least 0", "width");

        // Assert
        expect(error).toBeInstanceOf(Error);
        expect(error.name).toBe("InputError");
        expect(error.property).toBe("width");
    });

    it("should leave the property unset when no single input is at fault", () => {
        expect(new InputError("the lists differ in length").property).toBeUndefined();
    });
});

describe("KernelCallError", () => {
    it("should carry the path, the kind and the worker's stack beside the message", () => {
        // Act
        const error = new KernelCallError("failed", "shapes.solid.createBox", "input", "at kernel");

        // Assert
        expect(error).toBeInstanceOf(Error);
        expect(error.name).toBe("KernelCallError");
        expect(error.message).toBe("failed");
        expect(error.functionName).toBe("shapes.solid.createBox");
        expect(error.kind).toBe("input");
        expect(error.workerStack).toBe("at kernel");
    });

    it("should blame the kernel when no kind is given", () => {
        expect(new KernelCallError("failed", "shapes.solid.createBox").kind).toBe("kernel");
    });
});
