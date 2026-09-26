import { describe, it, expect, beforeAll, vi, afterEach } from "vitest";
import createBitbybitOcct, { BitbybitOcctModule } from "../bitbybit-dev-occt/bitbybit-dev-occt";
import { readKernelException } from "./kernel-exception";

describe("readKernelException", () => {
    let occt: BitbybitOcctModule;

    beforeAll(async () => {
        occt = await createBitbybitOcct();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    function failEdge(): unknown {
        const point = new occt.gp_Pnt(1, 2, 3);
        const maker = new occt.BRepBuilderAPI_MakeEdge(point, point);
        try {
            return maker.Edge();
        } catch (error) {
            return error;
        } finally {
            maker.delete();
            point.delete();
        }
    }

    it("names the C++ exception a kernel call threw by its type and message", () => {
        // Arrange
        const thrown = failEdge();

        // Act
        const read = readKernelException(occt, thrown);

        // Assert
        expect(typeof thrown).toBe("number");
        expect(read).toBeInstanceOf(Error);
        expect((read as Error).message).toBe("StdFail_NotDone: BRep_API: command not done");
    });

    it("frees the exception once it has read it", () => {
        // Arrange
        const release = vi.spyOn(occt, "decrementExceptionRefcount");
        const thrown = failEdge();

        // Act
        readKernelException(occt, thrown);

        // Assert
        expect(release).toHaveBeenCalledWith(thrown);
    });

    it("names an exception without a message by its type alone", () => {
        // Arrange
        const kernel = { getExceptionMessage: (): [string, undefined] => ["Standard_NullObject", undefined], decrementExceptionRefcount: vi.fn() };

        // Act
        const read = readKernelException(kernel, 70632);

        // Assert
        expect((read as Error).message).toBe("Standard_NullObject");
    });

    it("reads a native wasm exception the same way", () => {
        // Arrange
        const Tag = Reflect.get(WebAssembly, "Tag") as new (type: { parameters: string[] }) => object;
        const NativeException = Reflect.get(WebAssembly, "Exception") as new (tag: object, payload: number[]) => object;
        const exception = new NativeException(new Tag({ parameters: ["i32"] }), [1]);
        const kernel = { getExceptionMessage: vi.fn((): [string, string] => ["StdFail_NotDone", "BRep_API: command not done"]), decrementExceptionRefcount: vi.fn() };

        // Act
        const read = readKernelException(kernel, exception);

        // Assert
        expect((read as Error).message).toBe("StdFail_NotDone: BRep_API: command not done");
        expect(kernel.decrementExceptionRefcount).toHaveBeenCalledWith(exception);
    });

    it.each([
        ["an Error", new Error("the inputs were wrong")],
        ["a string", "Standard_ConstructionError"],
        ["an object", { code: 7 }],
    ])("returns %s unchanged, without asking the kernel", (_name, thrown) => {
        // Arrange
        const kernel = { getExceptionMessage: vi.fn(), decrementExceptionRefcount: vi.fn() };

        // Act
        const read = readKernelException(kernel, thrown);

        // Assert
        expect(read).toBe(thrown);
        expect(kernel.getExceptionMessage).not.toHaveBeenCalled();
        expect(kernel.decrementExceptionRefcount).not.toHaveBeenCalled();
    });

    it("returns the number unchanged from a kernel built without the helpers", () => {
        // Arrange
        const kernel = {};

        // Act
        const read = readKernelException(kernel, 70632);

        // Assert
        expect(read).toBe(70632);
    });

    it("returns the number unchanged, and still frees it, when the kernel cannot read it", () => {
        // Arrange
        const kernel = { getExceptionMessage: (): [string, string] => { throw new Error("unreadable"); }, decrementExceptionRefcount: vi.fn() };

        // Act
        const read = readKernelException(kernel, 70632);

        // Assert
        expect(read).toBe(70632);
        expect(kernel.decrementExceptionRefcount).toHaveBeenCalledWith(70632);
    });
});
