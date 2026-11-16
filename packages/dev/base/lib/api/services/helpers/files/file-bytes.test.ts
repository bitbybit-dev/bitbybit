import { describe, expect, it } from "vitest";
import { bytesOfData } from "./file-bytes";

describe("bytesOfData", () => {
    it("should give text as its UTF-8 bytes", () => {
        // Act
        const bytes = bytesOfData("Aé€");

        // Assert
        expect(bytes).toEqual(new Uint8Array([0x41, 0xc3, 0xa9, 0xe2, 0x82, 0xac]));
    });

    it("should give bytes back as the same array", () => {
        // Arrange
        const given = new Uint8Array([1, 2, 3]);

        // Act
        const bytes = bytesOfData(given);

        // Assert
        expect(bytes).toBe(given);
    });

    it("should read an ArrayBuffer as the bytes it holds", () => {
        // Arrange
        const buffer = new Uint8Array([4, 5, 6]).buffer;

        // Act
        const bytes = bytesOfData(buffer);

        // Assert
        expect(bytes).toEqual(new Uint8Array([4, 5, 6]));
    });

    it("should read a view of another kind as only the bytes it spans", () => {
        // Arrange
        const buffer = new Uint8Array([9, 1, 2, 3, 4, 9]).buffer;

        // Act
        const bytes = [bytesOfData(new DataView(buffer, 1, 4)), bytesOfData(new Uint16Array(buffer, 2, 1))];

        // Assert
        expect(bytes).toEqual([new Uint8Array([1, 2, 3, 4]), new Uint8Array([2, 3])]);
    });

    it("should give nothing for what is neither text nor bytes", () => {
        // Act
        const bytes = [42, null, undefined, {}, [1, 2]].map(bytesOfData);

        // Assert
        expect(bytes).toEqual([undefined, undefined, undefined, undefined, undefined]);
    });
});
