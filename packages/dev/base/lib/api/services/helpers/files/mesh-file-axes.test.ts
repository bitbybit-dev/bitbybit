import { describe, expect, it } from "vitest";
import { Base } from "../../../inputs/base-inputs";
import { linearDeterminant, movedCoordinate } from "../geometry/matrices";
import { meshMatrixInFile, meshMatrixInModel } from "./mesh-file-axes";
import { stlOfTriangles, stlWithAxes } from "./stl";
import { stlAxesInFile, stlAxesInModel } from "./stl-axes";

const { leftHanded, rightHanded } = Base.coordinateSystemEnum;

const IDENTITY: Base.TransformMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const POINT: Base.Point3 = [1, 2, 3];
const CASES: [string, Base.coordinateSystemEnum, boolean][] = [
    ["a left-handed model, z up", leftHanded, true],
    ["a right-handed model, z up", rightHanded, true],
    ["a left-handed model, y up", leftHanded, false],
    ["a right-handed model, y up", rightHanded, false],
];

const moved = (matrix: Base.TransformMatrix | undefined, [x, y, z]: Base.Point3): number[] => [0, 1, 2].map(axis => movedCoordinate(matrix ?? IDENTITY, x, y, z, axis) + 0);
const firstCornerOf = (bytes: Uint8Array): number[] => {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    return [0, 1, 2].map(axis => view.getFloat32(96 + axis * 4, true) + 0);
};
const oneTriangleFrom = (corner: Base.Point3): Uint8Array => stlOfTriangles([[...corner, 4, 5, 6, 7, 8, 10]]);

describe("the matrix that takes a mesh into a file's axes", () => {
    it.each([
        ["a left-handed model, z up", leftHanded, true, [1, 3, 2]],
        ["a right-handed model, z up", rightHanded, true, [1, -3, 2]],
        ["a left-handed model, y up", leftHanded, false, [-1, 2, 3]],
        ["a right-handed model, y up", rightHanded, false, [1, 2, 3]],
    ] as [string, Base.coordinateSystemEnum, boolean, number[]][])("should take a point of %s where the table says", (_name, system, zUp, expected) => {
        // Act
        const inFile = moved(meshMatrixInFile(system, zUp), POINT);

        // Assert
        expect(inFile).toEqual(expected);
    });

    it.each(CASES)("should take a point of %s where the STL axes take it, out and back in", (_name, system, zUp) => {
        // Act
        const out = moved(meshMatrixInFile(system, zUp), POINT);
        const backIn = moved(meshMatrixInModel(system, zUp), POINT);

        // Assert
        expect(out).toEqual(firstCornerOf(stlWithAxes(oneTriangleFrom(POINT), stlAxesInFile(system, zUp))));
        expect(backIn).toEqual(firstCornerOf(stlWithAxes(oneTriangleFrom(POINT), stlAxesInModel(system, zUp))));
    });

    it.each(CASES)("should bring a point of %s back to where it was", (_name, system, zUp) => {
        // Act
        const [x, y, z] = moved(meshMatrixInFile(system, zUp), POINT);
        const back = moved(meshMatrixInModel(system, zUp), [x!, y!, z!]);

        // Assert
        expect(back).toEqual(POINT);
    });

    it.each(CASES)("should mirror %s exactly when the STL axes say they mirror", (_name, system, zUp) => {
        // Act
        const mirrors = linearDeterminant(meshMatrixInFile(system, zUp) ?? IDENTITY) < 0;

        // Assert
        expect(mirrors).toBe(stlAxesInFile(system, zUp).mirrors);
    });
});
