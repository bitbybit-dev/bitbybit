import { describe, it, expect } from "vitest";
import type { KernelObject } from "./kernel-object-types";
import { kernelObjectsIn, releaseMadeObjects } from "./kernel-objects";

interface FakeKernelObject extends KernelObject {
    readonly name: string;
    deletes: number;
}

function kernelObject(name: string, options: { deleted?: boolean; deleteThrows?: boolean } = {}): FakeKernelObject {
    let deleted = options.deleted ?? false;
    const object: FakeKernelObject = {
        $$: { ptr: name },
        name,
        deletes: 0,
        delete(): void {
            if (options.deleteThrows) {
                throw new Error("BindingError: Object already scheduled for deletion");
            }
            deleted = true;
            object.deletes++;
        },
        isDeleted: (): boolean => deleted,
    };
    return object;
}

describe("the kernel objects a cancelled call made", () => {
    it("should find every kernel object nested in lists and records, once each", () => {
        // Arrange
        const shape = kernelObject("shape");
        const edge = kernelObject("edge");
        const result = { shapes: [shape, { edge }], again: shape };

        // Act
        const found = kernelObjectsIn(result);

        // Assert
        expect([...found].map(object => (object as FakeKernelObject).name)).toEqual(["shape", "edge"]);
    });

    it("should not walk into typed arrays, array buffers or values that are not objects", () => {
        // Arrange
        const result = [new Float32Array(3), new ArrayBuffer(8), 4, "text", null, undefined];

        // Act
        const found = kernelObjectsIn(result);

        // Assert
        expect(found.size).toBe(0);
    });

    it("should come back from a result that refers to itself", () => {
        // Arrange
        const shape = kernelObject("shape");
        const result: Record<string, unknown> = { shape };
        result["self"] = result;

        // Act
        const found = kernelObjectsIn(result);

        // Assert
        expect([...found]).toEqual([shape]);
    });

    it("should delete what the call made and keep what it was given, even when the result hands an input back", () => {
        // Arrange
        const input = kernelObject("input");
        const made = kernelObject("made");

        // Act
        releaseMadeObjects([input, made], { shape: input });

        // Assert
        expect([input.deletes, made.deletes]).toEqual([0, 1]);
    });

    it("should leave an object that is already deleted alone", () => {
        // Arrange
        const released = kernelObject("released", { deleted: true });

        // Act
        releaseMadeObjects([released], {});

        // Assert
        expect(released.deletes).toBe(0);
    });

    it("should go on deleting the rest when one object refuses to be deleted", () => {
        // Arrange
        const refusing = kernelObject("refusing", { deleteThrows: true });
        const made = kernelObject("made");

        // Act
        const act = (): void => releaseMadeObjects([refusing, made], {});

        // Assert
        expect(act).not.toThrow();
        expect(made.deletes).toBe(1);
    });
});
