import { describe, it, expect, beforeEach } from "vitest";
import { BaseBitByBit } from "./base-bitbybit";
import * as Inputs from "../inputs";

const { leftHanded, rightHanded } = Inputs.Base.coordinateSystemEnum;

type Point = Inputs.Base.Point3;

describe("text and grids laid on the ground, and the coordinate system", () => {
    let base: BaseBitByBit;

    beforeEach(() => {
        base = new BaseBitByBit();
    });

    const pointsOf = (text: string, centerOnOrigin = false): Point[] => base.textService
        .vectorText({ text, height: 10, lineSpacing: 2, letterSpacing: 0, centerOnOrigin })
        .flatMap(line => line.chars.flatMap(char => char.paths.flat()));

    const seenFromAbove = (points: Point[], system: Inputs.Base.coordinateSystemEnum | undefined): number[][] =>
        points.map(([x, , z]) => [x, system === rightHanded ? 0 - z : z]);

    it("should lay text as it always has while no coordinate system is set", () => {
        // Act
        const points = pointsOf("F");

        // Assert
        expect(points.every(([, y]) => y === 0)).toBe(true);
        expect(Math.min(...points.map(([, , z]) => z))).toBeCloseTo(0, 9);
        expect(Math.max(...points.map(([, , z]) => z))).toBeGreaterThan(0);
    });

    it("should lay text in a left-handed system as it always has", () => {
        // Arrange
        const before = pointsOf("Fj\nq");
        base.settings = { coordinateSystem: leftHanded };

        // Act
        const points = pointsOf("Fj\nq");

        // Assert
        expect(points).toEqual(before);
    });

    it("should lay text in a right-handed system with its up along -Z", () => {
        // Arrange
        const before = pointsOf("Fj\nq");
        base.settings = { coordinateSystem: rightHanded };

        // Act
        const points = pointsOf("Fj\nq");

        // Assert
        expect(points).toEqual(before.map(([x, y, z]) => [x, y, -z + 0]));
    });

    it.each([
        ["left-handed", leftHanded],
        ["right-handed", rightHanded],
    ])("should read the same from above in a %s system as it always did on a left-handed screen", (_name, system) => {
        // Arrange
        const picture = seenFromAbove(pointsOf("Fj\nq"), undefined);
        base.settings = { coordinateSystem: system };

        // Act
        const seen = seenFromAbove(pointsOf("Fj\nq"), system);

        // Assert
        expect(seen).toEqual(picture.map(([x, up]) => [x, up! + 0]));
    });

    it("should still centre the text on the origin in a right-handed system", () => {
        // Arrange
        base.settings = { coordinateSystem: rightHanded };

        // Act
        const points = pointsOf("Fj\nq", true);

        // Assert
        const bounds = base.point.boundingBoxOfPoints({ points }) as Required<Inputs.Base.BoundingBox>;
        bounds.center.forEach(value => expect(value).toBeCloseTo(0, 9));
    });

    it.each([
        ["as it always has with no coordinate system", undefined, 1],
        ["as it always has in a left-handed system", leftHanded, 1],
        ["with its rows along -Z in a right-handed system", rightHanded, -1],
    ])("should lay a hex grid on the ground %s", (_name, system, turn) => {
        // Arrange
        const flat = base.point.hexGrid({ radiusHexagon: 1, nrHexagonsX: 3, nrHexagonsY: 2, orientOnCenter: false, pointsOnGround: false });
        base.settings = system === undefined ? {} : { coordinateSystem: system };

        // Act
        const grounded = base.point.hexGrid({ radiusHexagon: 1, nrHexagonsX: 3, nrHexagonsY: 2, orientOnCenter: false, pointsOnGround: true });

        // Assert
        expect(grounded).toEqual(flat.map(([x, y]) => [x, 0, y * turn + 0]));
    });

    it.each([
        ["as it always has in a left-handed system", leftHanded, 1],
        ["with its rows along -Z in a right-handed system", rightHanded, -1],
    ])("should lay a fitted hex grid on the ground %s", (_name, system, turn) => {
        // Arrange
        const fitted = { width: 10, height: 6, nrHexagonsInWidth: 4, nrHexagonsInHeight: 3, centerGrid: false };
        const flat = base.point.hexGridScaledToFit({ ...fitted, pointsOnGround: false });
        base.settings = { coordinateSystem: system };

        // Act
        const grounded = base.point.hexGridScaledToFit({ ...fitted, pointsOnGround: true });

        // Assert
        expect(grounded.centers).toEqual(flat.centers.map(([x, y]) => [x, 0, y * turn + 0]));
        expect(grounded.hexagons).toEqual(flat.hexagons.map(hexagon => hexagon.map(([x, y]) => [x, 0, y * turn + 0])));
    });

    it("should follow a change of the settings made after the service was built", () => {
        // Arrange
        base.settings = { coordinateSystem: rightHanded };
        const turned = pointsOf("F");

        // Act
        base.settings = {};
        const back = pointsOf("F");

        // Assert
        expect(back).toEqual(turned.map(([x, y, z]) => [x, y, -z + 0]));
    });
});
