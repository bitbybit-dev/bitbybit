import type { Base } from "@bitbybit-dev/base";
import { Inputs as BaseInputs } from "@bitbybit-dev/base";
import { followedBy } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/matrices";
import { meshMatrixInModel } from "@bitbybit-dev/base/lib/api/services/helpers/files/mesh-file-axes";
import { describe, expect, it } from "vitest";
import { rootPlacingOf } from "./recipe-placing";

const { leftHanded, rightHanded } = BaseInputs.Base.coordinateSystemEnum;

const PLACEMENTS: Base.TransformMatrix[] = [
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [0, 0, -1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 3, -5, 7, 1],
    [0.6, 0.8, 0, 0, -0.8, 0.6, 0, 0, 0, 0, 1, 0, -2.5, 4, 11, 1],
];

const SETTINGS: [string, BaseInputs.Base.coordinateSystemEnum | undefined, boolean][] = [
    ["no coordinate system, Z up", undefined, true],
    ["no coordinate system, as it is", undefined, false],
    ["a left-handed system, Z up", leftHanded, true],
    ["a left-handed system, as it is", leftHanded, false],
    ["a right-handed system, Z up", rightHanded, true],
    ["a right-handed system, as it is", rightHanded, false],
];

const withoutSignedZeros = (matrix: readonly number[]): number[] => matrix.map(value => value + 0);

describe("where a recipe's roots are placed in a Manifold build", () => {
    it.each(SETTINGS)("should place each root by the base table's file row read in, for %s", (_name, system, adjustZtoY) => {
        // Arrange
        const tableTurn = meshMatrixInModel(system ?? rightHanded, adjustZtoY);
        const place = rootPlacingOf(system, adjustZtoY);

        // Act
        const placed = PLACEMENTS.map(matrix => withoutSignedZeros(place(matrix)));

        // Assert
        expect(placed).toEqual(PLACEMENTS.map(matrix => withoutSignedZeros(tableTurn === undefined ? matrix : followedBy(matrix, tableTurn))));
    });
});
