import { describe, expect, it } from "vitest";
import { stlOfTriangles, stlWithAxes } from "./stl";
import type { StlAxes } from "./stl-types";

const AS_IT_IS: StlAxes = { x: [0, false], y: [1, false], z: [2, false], mirrors: false };
const Y_AND_Z_SWAPPED: StlAxes = { x: [0, false], y: [2, false], z: [1, false], mirrors: true };
const TURNED_ABOUT_X: StlAxes = { x: [0, false], y: [2, true], z: [1, false], mirrors: false };

const FACET = [0, 0, 1, 1, 2, 3, 4, 5, 6, 7, 8, 9];

const text = (numbers: readonly (number | string)[]): Uint8Array => {
    const [nx, ny, nz, ax, ay, az, bx, by, bz, cx, cy, cz] = numbers;
    return new TextEncoder().encode(`solid part\nfacet normal ${nx} ${ny} ${nz}\n  outer loop\n    vertex ${ax} ${ay} ${az}\n    vertex ${bx} ${by} ${bz}\n    vertex ${cx} ${cy} ${cz}\n  endloop\nendfacet\nendsolid part\n`);
};

const binary = (numbers: readonly number[]): Uint8Array => {
    const bytes = new Uint8Array(84 + 50);
    const view = new DataView(bytes.buffer);
    view.setUint32(80, 1, true);
    numbers.forEach((value, at) => view.setFloat32(84 + at * 4, value, true));
    return bytes;
};

const withHeader = (bytes: Uint8Array, header: string): Uint8Array => {
    const headed = bytes.slice();
    headed.set(new TextEncoder().encode(header));
    return headed;
};

const withTail = (bytes: Uint8Array, tail: readonly number[]): Uint8Array => {
    const longer = new Uint8Array(bytes.length + tail.length);
    longer.set(bytes);
    longer.set(tail, bytes.length);
    return longer;
};

const numbersOfBinary = (bytes: Uint8Array): number[] => {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    return Array.from({ length: 12 }, (_value, at) => view.getFloat32(84 + at * 4, true) + 0);
};

const numbersOfText = (bytes: Uint8Array): string[] => [...new TextDecoder().decode(bytes).matchAll(/(?:normal|vertex)\s+(\S+)\s+(\S+)\s+(\S+)/g)].flatMap(match => [match[1]!, match[2]!, match[3]!]);

describe("stlOfTriangles", () => {
    const FLAT_ON_THE_GROUND = [0, 0, 0, 2, 0, 0, 0, 0, 3];
    const STANDING = [1, 1, 1, 1, 5, 1, 4, 1, 1];

    it("should write each triangle's corners in the order given, behind a normal of length one that their turn gives", () => {
        // Act
        const file = stlOfTriangles([FLAT_ON_THE_GROUND]);

        // Assert
        expect(numbersOfBinary(file)).toEqual([0, -1, 0, 0, 0, 0, 2, 0, 0, 0, 0, 3]);
    });

    it("should count the triangles of every part into one file", () => {
        // Act
        const file = stlOfTriangles([FLAT_ON_THE_GROUND, new Float32Array([...STANDING, ...FLAT_ON_THE_GROUND])]);

        // Assert
        const view = new DataView(file.buffer);
        expect([view.getUint32(80, true), file.length]).toEqual([3, 84 + 3 * 50]);
        expect(Array.from({ length: 12 }, (_value, at) => view.getFloat32(84 + 50 + at * 4, true) + 0)).toEqual([0, 0, -1, ...STANDING]);
    });

    it("should write a normal of zero for a triangle without an area and leave out corners that do not make a triangle", () => {
        // Act
        const file = stlOfTriangles([[1, 1, 1, 2, 2, 2, 3, 3, 3, 9, 9]]);

        // Assert
        expect(numbersOfBinary(file)).toEqual([0, 0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3]);
        expect(file.length).toBe(134);
    });

    it("should write an empty file for no parts", () => {
        // Act
        const file = stlOfTriangles([]);

        // Assert
        expect([file.length, new DataView(file.buffer).getUint32(80, true)]).toEqual([84, 0]);
    });
});

describe("stlWithAxes", () => {
    it.each([
        ["leave a facet as it is", AS_IT_IS, [0, 0, 1, 1, 2, 3, 4, 5, 6, 7, 8, 9]],
        ["swap y and z and turn the winding for a map that mirrors", Y_AND_Z_SWAPPED, [0, 1, 0, 1, 3, 2, 7, 9, 8, 4, 6, 5]],
        ["turn y into z and z into minus y, keeping the winding", TURNED_ABOUT_X, [0, -1, 0, 1, -3, 2, 4, -6, 5, 7, -9, 8]],
    ])("should %s in a binary file", (_name, axes, expected) => {
        // Act
        const mapped = stlWithAxes(binary(FACET), axes);

        // Assert
        expect(numbersOfBinary(mapped)).toEqual(expected);
    });

    it.each([
        ["leave a facet as it is", AS_IT_IS, ["0", "0", "1", "1", "2", "3", "4", "5", "6", "7", "8", "9"]],
        ["swap y and z and turn the winding for a map that mirrors", Y_AND_Z_SWAPPED, ["0", "1", "0", "1", "3", "2", "7", "9", "8", "4", "6", "5"]],
        ["turn y into z and z into minus y, keeping the winding", TURNED_ABOUT_X, ["0", "-1", "0", "1", "-3", "2", "4", "-6", "5", "7", "-9", "8"]],
    ])("should %s in a text file", (_name, axes, expected) => {
        // Act
        const mapped = stlWithAxes(text(FACET), axes);

        // Assert
        expect(numbersOfText(mapped)).toEqual(expected);
    });

    it("should keep the numbers of a text file as they were written, negating by the sign alone", () => {
        // Arrange
        const written = ["0.0", "-1.0e+0", "0", "1.50", "-2.25e-3", "+3", "4", "5", "6", "7", "8", "9"];

        // Act
        const mapped = stlWithAxes(text(written), TURNED_ABOUT_X);

        // Assert
        expect(numbersOfText(mapped)).toEqual(["0.0", "-0", "-1.0e+0", "1.50", "-3", "-2.25e-3", "4", "-6", "5", "7", "-9", "8"]);
    });

    it("should return a new array and leave the file it was given alone", () => {
        // Arrange
        const file = binary(FACET);

        // Act
        const mapped = stlWithAxes(file, Y_AND_Z_SWAPPED);

        // Assert
        expect(mapped).not.toBe(file);
        expect(numbersOfBinary(file)).toEqual(FACET);
    });

    it("should keep the header, the count and the attribute bytes of a binary file", () => {
        // Arrange
        const file = binary(FACET);
        file[0] = 66;
        file[132] = 7;

        // Act
        const mapped = stlWithAxes(file, TURNED_ABOUT_X);

        // Assert
        expect([mapped[0], new DataView(mapped.buffer).getUint32(80, true), mapped[132], mapped.length]).toEqual([66, 1, 7, 134]);
    });

    it.each([
        ["says nothing", ""],
        ["begins with solid, as some writers put there", "solid part"],
    ])("should map a binary file whose header %s and which runs on past its triangles, copying the bytes after them untouched", (_name, header) => {
        // Arrange
        const file = withTail(withHeader(binary(FACET), header), [0xff, 0xfe, 0x00, 0x80]);

        // Act
        const mapped = stlWithAxes(file, Y_AND_Z_SWAPPED);

        // Assert
        expect(numbersOfBinary(mapped)).toEqual([0, 1, 0, 1, 3, 2, 7, 9, 8, 4, 6, 5]);
        expect(Array.from(mapped.subarray(0, 84))).toEqual(Array.from(file.subarray(0, 84)));
        expect([mapped.length, ...mapped.subarray(134)]).toEqual([138, 0xff, 0xfe, 0x00, 0x80]);
    });

    it("should map only the triangles a binary file holds when its count names more, and leave its bytes as many as they were", () => {
        // Arrange
        const file = binary(FACET);
        new DataView(file.buffer).setUint32(80, 3, true);

        // Act
        const mapped = stlWithAxes(file, TURNED_ABOUT_X);

        // Assert
        expect(numbersOfBinary(mapped)).toEqual([0, -1, 0, 1, -3, 2, 4, -6, 5, 7, -9, 8]);
        expect(mapped.length).toBe(134);
    });

    it("should hand back the bytes of a binary file as they were for a map that leaves every axis alone", () => {
        // Arrange
        const file = withTail(binary(FACET), [0xc3, 0x28, 0xff]);

        // Act
        const mapped = stlWithAxes(file, AS_IT_IS);

        // Assert
        expect(Array.from(mapped)).toEqual(Array.from(file));
    });

    it("should leave a file too short to hold a binary count as it was when it is no text either", () => {
        // Arrange
        const file = new Uint8Array([0xff, 0x00, 0x80, 0x7f]);

        // Act
        const mapped = stlWithAxes(file, Y_AND_Z_SWAPPED);

        // Assert
        expect(Array.from(mapped)).toEqual([0xff, 0x00, 0x80, 0x7f]);
    });

    it("should map a text file whose name is not plain ASCII and keep the name as it was written", () => {
        // Arrange
        const file = new TextEncoder().encode(new TextDecoder().decode(text(FACET)).replace("solid part", "solid Würfel № 1"));

        // Act
        const mapped = stlWithAxes(file, Y_AND_Z_SWAPPED);

        // Assert
        expect(numbersOfText(mapped)).toEqual(["0", "1", "0", "1", "3", "2", "7", "9", "8", "4", "6", "5"]);
        expect(new TextDecoder().decode(mapped).startsWith("solid Würfel № 1\n")).toBe(true);
    });

    it.each([
        ["a byte order mark before solid", (plain: Uint8Array): Uint8Array => new Uint8Array([0xef, 0xbb, 0xbf, ...plain])],
        ["its first facet, without a solid line", (plain: Uint8Array): Uint8Array => plain.subarray(11)],
    ])("should map a text file that opens with %s", (_name, opened) => {
        // Arrange
        const file = opened(text(FACET));

        // Act
        const mapped = stlWithAxes(file, Y_AND_Z_SWAPPED);

        // Assert
        expect(numbersOfText(mapped)).toEqual(["0", "1", "0", "1", "3", "2", "7", "9", "8", "4", "6", "5"]);
        expect(Array.from(mapped.subarray(0, 3))).toEqual(Array.from(file.subarray(0, 3)));
    });

    it("should keep the bytes of a text file's name that are no UTF-8, as a name written in Latin-1 is", () => {
        // Arrange
        const plain = text(FACET);
        const file = new Uint8Array([...plain.subarray(0, 7), 0x57, 0xfc, 0x72, ...plain.subarray(10)]);

        // Act
        const mapped = stlWithAxes(file, Y_AND_Z_SWAPPED);

        // Assert
        expect(Array.from(mapped.subarray(0, 11))).toEqual([...new TextEncoder().encode("solid "), 0x70, 0x57, 0xfc, 0x72, 0x0a]);
        expect(numbersOfText(mapped)).toEqual(["0", "1", "0", "1", "3", "2", "7", "9", "8", "4", "6", "5"]);
    });
});
