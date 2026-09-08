import { describe, it, expect } from "vitest";
import * as BABYLON from "@babylonjs/core";
import { BabylonTransforms } from "./transforms";
import * as Inputs from "../../inputs";

const applyAll = (matrices: number[][], point: [number, number, number]): [number, number, number] => {
    const result = matrices.reduce(
        (current, flat) => BABYLON.Vector3.TransformCoordinates(current, BABYLON.Matrix.FromArray(flat)),
        new BABYLON.Vector3(...point));
    return [result.x, result.y, result.z];
};

const expectPoint = (actual: [number, number, number], expected: [number, number, number]): void => {
    expect(actual[0]).toBeCloseTo(expected[0], 6);
    expect(actual[1]).toBeCloseTo(expected[1], 6);
    expect(actual[2]).toBeCloseTo(expected[2], 6);
};

describe("BabylonTransforms", () => {
    const service = new BabylonTransforms();

    describe("rotationCenterAxis", () => {
        it("should turn a point about an axis through the centre it was given", () => {
            // Act
            const transform = service.rotationCenterAxis(
                new Inputs.BabylonTransforms.RotationCenterAxisDto(90, [0, 1, 0], [1, 0, 0]));

            // Assert
            expectPoint(applyAll(transform, [2, 0, 0]), [1, 0, -1]);
        });

        it("should leave the centre itself where it is", () => {
            // Act
            const transform = service.rotationCenterAxis(
                new Inputs.BabylonTransforms.RotationCenterAxisDto(45, [0, 1, 0], [3, 4, 5]));

            // Assert
            expectPoint(applyAll(transform, [3, 4, 5]), [3, 4, 5]);
        });
    });

    describe("rotationCenterX", () => {
        it("should turn a point about the x axis through the centre it was given", () => {
            // Act
            const transform = service.rotationCenterX(new Inputs.BabylonTransforms.RotationCenterDto(90, [0, 0, 0]));

            // Assert
            expectPoint(applyAll(transform, [0, 1, 0]), [0, 0, 1]);
        });
    });

    describe("rotationCenterY", () => {
        it("should turn a point about the y axis through the centre it was given", () => {
            // Act
            const transform = service.rotationCenterY(new Inputs.BabylonTransforms.RotationCenterDto(90, [0, 0, 0]));

            // Assert
            expectPoint(applyAll(transform, [1, 0, 0]), [0, 0, -1]);
        });
    });

    describe("rotationCenterZ", () => {
        it("should turn a point about the z axis through the centre it was given", () => {
            // Act
            const transform = service.rotationCenterZ(new Inputs.BabylonTransforms.RotationCenterDto(90, [0, 0, 0]));

            // Assert
            expectPoint(applyAll(transform, [1, 0, 0]), [0, 1, 0]);
        });
    });

    describe("rotationCenterYawPitchRoll", () => {
        it("should turn a point through the three angles it was given", () => {
            // Act
            const transform = service.rotationCenterYawPitchRoll(
                new Inputs.BabylonTransforms.RotationCenterYawPitchRollDto(90, 0, 0, [0, 0, 0]));

            // Assert
            expectPoint(applyAll(transform, [1, 0, 0]), [0, 0, -1]);
        });

        it("should leave a point where it is when every angle is zero", () => {
            // Act
            const transform = service.rotationCenterYawPitchRoll(
                new Inputs.BabylonTransforms.RotationCenterYawPitchRollDto(0, 0, 0, [1, 2, 3]));

            // Assert
            expectPoint(applyAll(transform, [4, 5, 6]), [4, 5, 6]);
        });
    });

    describe("scaleCenterXYZ", () => {
        it("should scale a point away from the centre it was given", () => {
            // Act
            const transform = service.scaleCenterXYZ(
                new Inputs.BabylonTransforms.ScaleCenterXYZDto([1, 1, 1], [2, 2, 2]));

            // Assert
            expectPoint(applyAll(transform, [2, 2, 2]), [3, 3, 3]);
        });
    });

    describe("scaleXYZ", () => {
        it("should scale a point away from the origin, one factor per axis", () => {
            // Act
            const transform = service.scaleXYZ(new Inputs.BabylonTransforms.ScaleXYZDto([2, 3, 4]));

            // Assert
            expect(transform).toHaveLength(1);
            expectPoint(applyAll(transform, [1, 1, 1]), [2, 3, 4]);
        });
    });

    describe("uniformScale", () => {
        it("should scale a point away from the origin by one factor", () => {
            // Act
            const transform = service.uniformScale(new Inputs.BabylonTransforms.UniformScaleDto(3));

            // Assert
            expectPoint(applyAll(transform, [1, 2, 3]), [3, 6, 9]);
        });
    });

    describe("uniformScaleFromCenter", () => {
        it("should scale a point away from the centre it was given", () => {
            // Act
            const transform = service.uniformScaleFromCenter(
                new Inputs.BabylonTransforms.UniformScaleFromCenterDto(2, [1, 1, 1]));

            // Assert
            expectPoint(applyAll(transform, [2, 1, 1]), [3, 1, 1]);
        });
    });

    describe("translationXYZ", () => {
        it("should move a point by the vector it was given", () => {
            // Act
            const transform = service.translationXYZ(new Inputs.BabylonTransforms.TranslationXYZDto([1, 2, 3]));

            // Assert
            expectPoint(applyAll(transform, [0, 0, 0]), [1, 2, 3]);
        });
    });

    describe("translationsXYZ", () => {
        it("should hand back one transformation per vector it was given", () => {
            // Act
            const transforms = service.translationsXYZ(
                new Inputs.BabylonTransforms.TranslationsXYZDto([[1, 0, 0], [0, 2, 0]]));

            // Assert
            expect(transforms).toHaveLength(2);
            expectPoint(applyAll(transforms[0]!, [0, 0, 0]), [1, 0, 0]);
            expectPoint(applyAll(transforms[1]!, [0, 0, 0]), [0, 2, 0]);
        });

        it("should hand back nothing when it was given no vectors", () => {
            // Act
            const transforms = service.translationsXYZ(new Inputs.BabylonTransforms.TranslationsXYZDto([]));

            // Assert
            expect(transforms).toEqual([]);
        });
    });
});
