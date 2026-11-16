import { describe, expect, it } from "vitest";
import { Base } from "../../../inputs/base-inputs";
import { movedCoordinate } from "../geometry/matrices";
import { meshMatrixInModel } from "./mesh-file-axes";
import { pointOnGround } from "./ground-axes";

const { leftHanded, rightHanded } = Base.coordinateSystemEnum;

const SYSTEMS: [string, Base.coordinateSystemEnum | undefined][] = [["no coordinate system", undefined], ["a left-handed system", leftHanded], ["a right-handed system", rightHanded]];
const DRAWING_POINTS: [number, number][] = [[3, 5], [-2, 7.5], [0, -4], [1e6, -1e-6]];

describe("pointOnGround", () => {
    it.each([
        ["no coordinate system", undefined, [3, 0, 5]],
        ["a left-handed system", leftHanded, [3, 0, 5]],
        ["a right-handed system", rightHanded, [3, 0, -5]],
    ] as [string, Base.coordinateSystemEnum | undefined, number[]][])("should lay a drawing's y where the table says in %s", (_name, system, expected) => {
        // Act
        const onGround = pointOnGround(3, 5, system);

        // Assert
        expect(onGround).toEqual(expected);
    });

    it.each(SYSTEMS)("should lay a drawing where a file with Z up lays its flat XY plane when read in %s", (_name, system) => {
        // Arrange
        const readIn = meshMatrixInModel(system ?? leftHanded, true);

        // Act
        const onGround = DRAWING_POINTS.map(([x, y]) => pointOnGround(x, y, system).map(value => value + 0));

        // Assert
        expect(onGround).toEqual(DRAWING_POINTS.map(([x, y]) => [0, 1, 2].map(axis => movedCoordinate(readIn, x, y, 0, axis) + 0)));
    });
});
