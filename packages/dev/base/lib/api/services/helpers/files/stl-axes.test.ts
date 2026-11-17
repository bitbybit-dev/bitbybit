import { describe, expect, it } from "vitest";
import { Base } from "../../../inputs/base-inputs";
import { stlOfTriangles, stlWithAxes } from "./stl";
import { stlAxesInFile, stlAxesInModel } from "./stl-axes";

const { leftHanded, rightHanded } = Base.coordinateSystemEnum;

const CORNER = [1, 2, 3];
const ONE_TRIANGLE = [...CORNER, 4, 5, 6, 7, 8, 10];

const cornersOf = (bytes: Uint8Array): number[] => {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    return Array.from({ length: 9 }, (_value, at) => view.getFloat32(96 + at * 4, true) + 0);
};

describe("the axes of an STL file", () => {
    it.each([
        ["a left-handed model into a file with z up", leftHanded, true, [1, 3, 2, 7, 10, 8, 4, 6, 5]],
        ["a right-handed model into a file with z up", rightHanded, true, [1, -3, 2, 4, -6, 5, 7, -10, 8]],
        ["a left-handed model into a file with y up", leftHanded, false, [-1, 2, 3, -7, 8, 10, -4, 5, 6]],
        ["a right-handed model into a file with y up", rightHanded, false, [1, 2, 3, 4, 5, 6, 7, 8, 10]],
    ])("should take %s", (_name, system, zUp, expected) => {
        // Act
        const file = stlWithAxes(stlOfTriangles([ONE_TRIANGLE]), stlAxesInFile(system, zUp));

        // Assert
        expect(cornersOf(file)).toEqual(expected);
    });

    it.each([
        ["a left-handed model, z up", leftHanded, true],
        ["a right-handed model, z up", rightHanded, true],
        ["a left-handed model, y up", leftHanded, false],
        ["a right-handed model, y up", rightHanded, false],
    ])("should read back what it wrote for %s", (_name, system, zUp) => {
        // Arrange
        const model = stlOfTriangles([ONE_TRIANGLE]);

        // Act
        const back = stlWithAxes(stlWithAxes(model, stlAxesInFile(system, zUp)), stlAxesInModel(system, zUp));

        // Assert
        expect(Array.from(back)).toEqual(Array.from(model));
    });
});
