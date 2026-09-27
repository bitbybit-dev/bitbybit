import { describe, it, expect } from "vitest";
import { InputError, KernelCallError, KernelOperationError } from "./errors";

describe("InputError", () => {
    it("should be an Error that names the property at fault", () => {
        // Act
        const error = new InputError("`width` must be at least 0", "width");

        // Assert
        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(InputError);
        expect(error.name).toBe("InputError");
        expect(error.message).toBe("`width` must be at least 0");
        expect(error.property).toBe("width");
    });

    it("should leave the property unset when no single input is at fault", () => {
        expect(new InputError("the lists differ in length").property).toBeUndefined();
    });
});

describe("KernelOperationError", () => {
    it("should be an Error that carries a stable code beside its message", () => {
        // Act
        const error = new KernelOperationError("occt.fillet.failed", "The fillet could not be built.");

        // Assert
        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(KernelOperationError);
        expect(error.name).toBe("KernelOperationError");
        expect(error.code).toBe("occt.fillet.failed");
        expect(error.message).toBe("The fillet could not be built.");
        expect(error.details).toBeUndefined();
    });

    it("should carry the values its message names", () => {
        // Act
        const error = new KernelOperationError("occt.fillet.failedOnEdges", "The fillet failed at edges 3 and 7.", { edges: [3, 7] });

        // Assert
        expect(error.details).toEqual({ edges: [3, 7] });
    });
});

describe("KernelCallError", () => {
    it("should carry the path, the kind and the worker's stack beside the message", () => {
        // Act
        const error = new KernelCallError("failed", "shapes.solid.createBox", "input", "at kernel");

        // Assert
        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(KernelCallError);
        expect(error.name).toBe("KernelCallError");
        expect(error.message).toBe("failed");
        expect(error.functionName).toBe("shapes.solid.createBox");
        expect(error.kind).toBe("input");
        expect(error.workerStack).toBe("at kernel");
    });

    it("should carry the code of a failure the kernel named", () => {
        // Act
        const error = new KernelCallError("failed", "fillets.filletEdges", "kernel", "at kernel", "occt.fillet.failed");

        // Assert
        expect(error.code).toBe("occt.fillet.failed");
        expect(error.workerStack).toBe("at kernel");
    });

    it("should carry the details of a failure the kernel named", () => {
        // Act
        const error = new KernelCallError("failed", "fillets.filletEdges", "kernel", "at kernel", "occt.fillet.failedOnEdges", { edges: [3] });

        // Assert
        expect(error.details).toEqual({ edges: [3] });
    });

    it("should leave the details unset when the kernel gave none", () => {
        expect(new KernelCallError("failed", "fillets.filletEdges", "kernel", "at kernel", "occt.fillet.failed").details).toBeUndefined();
    });

    it("should leave the code unset when the kernel named none", () => {
        expect(new KernelCallError("failed", "shapes.solid.createBox", "kernel", "at kernel").code).toBeUndefined();
    });

    it("should blame the kernel when no kind is given", () => {
        expect(new KernelCallError("failed", "shapes.solid.createBox").kind).toBe("kernel");
    });

    it("should leave the worker's stack unset when the worker reported none", () => {
        expect(new KernelCallError("failed", "shapes.solid.createBox", "kernel").workerStack).toBeUndefined();
    });

    it("should keep its own stack apart from the worker's", () => {
        // Act
        const error = new KernelCallError("failed", "shapes.solid.createBox", "kernel", "at worker");

        // Assert
        expect(error.stack).toContain("KernelCallError: failed");
        expect(error.stack).not.toContain("at worker");
    });
});
