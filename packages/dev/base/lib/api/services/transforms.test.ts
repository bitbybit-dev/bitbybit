import { GeometryHelper } from "./geometry-helper";
import { MathBitByBit } from "./math";
import { Transforms } from "./transforms";
import { Vector } from "./vector";
import * as Inputs from "../inputs";
import { UnitTestHelper } from "../unit-test-helper";

describe("Transforms unit tests", () => {

    const uh = new UnitTestHelper();

    let geometryHelper: GeometryHelper;
    let math: MathBitByBit;
    let vector: Vector;
    let transforms: Transforms;

    beforeAll(() => {
        geometryHelper = new GeometryHelper();
        math = new MathBitByBit();
        vector = new Vector(math, geometryHelper);
        transforms = new Transforms(vector, math);
    });

    describe("Transforms Class Unit Tests (Integration)", () => {

        const centerPoint: Inputs.Base.Point3 = [10, 20, 30];

        const identityMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] as Inputs.Base.TransformMatrix;
        const translationMatrix = (x, y, z) => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1] as Inputs.Base.TransformMatrix;
        const scalingMatrix = (x, y, z) => [x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1] as Inputs.Base.TransformMatrix;
        const rotationXMatrix = (angleRad) => {
            const c = Math.cos(angleRad);
            const s = Math.sin(angleRad);
            return [1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1] as Inputs.Base.TransformMatrix;
        };
        const rotationYMatrix = (angleRad) => {
            const c = Math.cos(angleRad);
            const s = Math.sin(angleRad);
            return [c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1] as Inputs.Base.TransformMatrix;
        };
        const rotationZMatrix = (angleRad) => {
            const c = Math.cos(angleRad);
            const s = Math.sin(angleRad);
            return [c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] as Inputs.Base.TransformMatrix;
        };

        describe("identity", () => {
            it("should return the identity matrix", () => {
                const result = transforms.identity();
                uh.expectMatrixCloseTo(result, identityMatrix);
            });
        });

        describe("translationXYZ", () => {
            it("should create a single translation matrix", () => {
                const translationVec: Inputs.Base.Vector3 = [5, -10, 15];
                const result = transforms.translationXYZ({ translation: translationVec });
                expect(result).toBeInstanceOf(Array);
                expect(result).toHaveLength(1);
                uh.expectMatrixCloseTo(result[0], translationMatrix(5, -10, 15));
            });
        });

        describe("translationsXYZ", () => {
            it("should create multiple translation matrices", () => {
                const translations: Inputs.Base.Vector3[] = [[1, 2, 3], [4, 5, 6]];
                const result = transforms.translationsXYZ({ translations });
                expect(result).toBeInstanceOf(Array);
                expect(result).toHaveLength(2);
                expect(result[0]).toBeInstanceOf(Array);
                expect(result[0]).toHaveLength(1);
                expect(result[1]).toBeInstanceOf(Array);
                expect(result[1]).toHaveLength(1);
                uh.expectMatrixCloseTo(result[0][0], translationMatrix(1, 2, 3));
                uh.expectMatrixCloseTo(result[1][0], translationMatrix(4, 5, 6));
            });

            it("should return an empty array for empty input", () => {
                const result = transforms.translationsXYZ({ translations: [] });
                expect(result).toEqual([]);
            });
        });

        describe("scaleXYZ", () => {
            it("should create a single scaling matrix", () => {
                const scaleVec: Inputs.Base.Vector3 = [2, 0.5, -1];
                const result = transforms.scaleXYZ({ scaleXyz: scaleVec });
                expect(result).toHaveLength(1);
                uh.expectMatrixCloseTo(result[0], scalingMatrix(2, 0.5, -1));
            });
        });

        describe("uniformScale", () => {
            it("should create a single uniform scaling matrix", () => {
                const scaleFactor = 3.5;
                const result = transforms.uniformScale({ scale: scaleFactor });
                expect(result).toHaveLength(1);
                uh.expectMatrixCloseTo(result[0], scalingMatrix(3.5, 3.5, 3.5));
            });
        });

        describe("scaleCenterXYZ", () => {
            it("should create translate-scale-translate matrices", () => {
                const scaleVec: Inputs.Base.Vector3 = [2, 3, 4];
                const result = transforms.scaleCenterXYZ({ center: centerPoint, scaleXyz: scaleVec });

                expect(result).toHaveLength(3);
                const expected: Inputs.Base.TransformMatrixes = [
                    translationMatrix(-centerPoint[0], -centerPoint[1], -centerPoint[2]),
                    scalingMatrix(scaleVec[0], scaleVec[1], scaleVec[2]),
                    translationMatrix(centerPoint[0], centerPoint[1], centerPoint[2]),
                ];
                uh.expectMatrixesCloseTo(result, expected);
            });
        });

        describe("uniformScaleFromCenter", () => {
            it("should create translate-uniform_scale-translate matrices", () => {
                const scaleFactor = 5;
                const result = transforms.uniformScaleFromCenter({ center: centerPoint, scale: scaleFactor });

                expect(result).toHaveLength(3);
                const expected: Inputs.Base.TransformMatrixes = [
                    translationMatrix(-centerPoint[0], -centerPoint[1], -centerPoint[2]),
                    scalingMatrix(scaleFactor, scaleFactor, scaleFactor),
                    translationMatrix(centerPoint[0], centerPoint[1], centerPoint[2]),
                ];
                uh.expectMatrixesCloseTo(result, expected);
            });
        });

        describe("rotationCenterX", () => {
            it("should create translate-rotateX-translate matrices", () => {
                const angleDeg = 90;
                const angleRad = math.degToRad({ number: angleDeg });
                const result = transforms.rotationCenterX({ center: centerPoint, angle: angleDeg });

                expect(result).toHaveLength(3);
                const expected: Inputs.Base.TransformMatrixes = [
                    translationMatrix(-centerPoint[0], -centerPoint[1], -centerPoint[2]),
                    rotationXMatrix(angleRad),
                    translationMatrix(centerPoint[0], centerPoint[1], centerPoint[2]),
                ];
                uh.expectMatrixesCloseTo(result, expected);
            });
        });

        describe("rotationCenterY", () => {
            it("should create translate-rotateY-translate matrices", () => {
                const angleDeg = -45;
                const angleRad = math.degToRad({ number: angleDeg });
                const result = transforms.rotationCenterY({ center: centerPoint, angle: angleDeg });

                expect(result).toHaveLength(3);
                const expected: Inputs.Base.TransformMatrixes = [
                    translationMatrix(-centerPoint[0], -centerPoint[1], -centerPoint[2]),
                    rotationYMatrix(angleRad),
                    translationMatrix(centerPoint[0], centerPoint[1], centerPoint[2]),
                ];
                uh.expectMatrixesCloseTo(result, expected);
            });
        });

        describe("rotationCenterZ", () => {
            it("should create translate-rotateZ-translate matrices", () => {
                const angleDeg = 180;
                const angleRad = math.degToRad({ number: angleDeg });
                const result = transforms.rotationCenterZ({ center: centerPoint, angle: angleDeg });

                expect(result).toHaveLength(3);
                const expected: Inputs.Base.TransformMatrixes = [
                    translationMatrix(-centerPoint[0], -centerPoint[1], -centerPoint[2]),
                    rotationZMatrix(angleRad),
                    translationMatrix(centerPoint[0], centerPoint[1], centerPoint[2]),
                ];
                uh.expectMatrixesCloseTo(result, expected);
            });
        });

        describe("rotationCenterAxis", () => {
            it("should create translate-rotateAxis-translate matrices", () => {
                const angleDeg = 90;
                const angleRad = math.degToRad({ number: angleDeg });
                const axis: Inputs.Base.Vector3 = [0, 1, 0];

                const result = transforms.rotationCenterAxis({ center: centerPoint, axis: axis, angle: angleDeg });
                expect(result).toHaveLength(3);

                const expectedMiddleMatrix = rotationYMatrix(angleRad);

                const expected: Inputs.Base.TransformMatrixes = [
                    translationMatrix(-centerPoint[0], -centerPoint[1], -centerPoint[2]),
                    expectedMiddleMatrix,
                    translationMatrix(centerPoint[0], centerPoint[1], centerPoint[2]),
                ];
                uh.expectMatrixesCloseTo(result, expected);
            });

            it("should handle non-unit axis vector by normalizing it", () => {
                const angleDeg = 180;
                const angleRad = math.degToRad({ number: angleDeg });
                const nonUnitAxis: Inputs.Base.Vector3 = [2, 0, 0];

                const result = transforms.rotationCenterAxis({ center: centerPoint, axis: nonUnitAxis, angle: angleDeg });
                expect(result).toHaveLength(3);

                const expectedMiddleMatrix = rotationXMatrix(angleRad);

                const expected: Inputs.Base.TransformMatrixes = [
                    translationMatrix(-centerPoint[0], -centerPoint[1], -centerPoint[2]),
                    expectedMiddleMatrix,
                    translationMatrix(centerPoint[0], centerPoint[1], centerPoint[2]),
                ];
                uh.expectMatrixesCloseTo(result, expected);
            });

        });

        describe("rotationCenterYawPitchRoll", () => {
            it("should create translate-rotateYPR-translate matrices for pure Yaw (Y rot)", () => {
                const yaw = 90, pitch = 0, roll = 0;
                const result = transforms.rotationCenterYawPitchRoll({ center: centerPoint, yaw, pitch, roll });
                expect(result).toHaveLength(3);
                expect(result).toEqual([
                    [
                        1, 0, 0, 0, 0, 1,
                        0, 0, 0, 0, 1, 0,
                        -10, -20, -30, 1
                    ],
                    [
                        2.220446049250313e-16,
                        0,
                        -1,
                        0,
                        0,
                        1,
                        0,
                        0,
                        1,
                        0,
                        2.220446049250313e-16,
                        0,
                        0,
                        0,
                        0,
                        1
                    ],
                    [
                        1, 0, 0, 0, 0, 1,
                        0, 0, 0, 0, 1, 0,
                        10, 20, 30, 1
                    ]
                ]);
            });

            // Add tests for pure Pitch (X rot) and pure Roll (Z rot) if desired
            it("should create translate-rotateYPR-translate matrices for pure Pitch (X rot)", () => {
                const yaw = 0, pitch = 90, roll = 0;
                const angleRadX = math.degToRad({ number: pitch }); // Pitch corresponds to X

                const result = transforms.rotationCenterYawPitchRoll({ center: centerPoint, yaw, pitch, roll });
                expect(result).toHaveLength(3);

                const expectedMiddleMatrix = rotationXMatrix(angleRadX);

                const expected: Inputs.Base.TransformMatrixes = [
                    translationMatrix(-centerPoint[0], -centerPoint[1], -centerPoint[2]),
                    expectedMiddleMatrix,
                    translationMatrix(centerPoint[0], centerPoint[1], centerPoint[2]),
                ];
                uh.expectMatrixesCloseTo(result, expected);
            });

            it("should create translate-rotateYPR-translate matrices for pure Roll (Z rot)", () => {
                const yaw = 0, pitch = 0, roll = 90;
                const angleRadZ = math.degToRad({ number: roll }); // Roll corresponds to Z

                const result = transforms.rotationCenterYawPitchRoll({ center: centerPoint, yaw, pitch, roll });
                expect(result).toHaveLength(3);

                const expectedMiddleMatrix = rotationZMatrix(angleRadZ);

                const expected: Inputs.Base.TransformMatrixes = [
                    translationMatrix(-centerPoint[0], -centerPoint[1], -centerPoint[2]),
                    expectedMiddleMatrix,
                    translationMatrix(centerPoint[0], centerPoint[1], centerPoint[2]),
                ];
                uh.expectMatrixesCloseTo(result, expected);
            });


            it("should handle combined rotations", () => {
                const yaw = 45, pitch = 30, roll = 60;
                const result = transforms.rotationCenterYawPitchRoll({ center: centerPoint, yaw, pitch, roll });
                expect(result).toHaveLength(3);
                uh.expectMatrixCloseTo(result[0], translationMatrix(-centerPoint[0], -centerPoint[1], -centerPoint[2]));
                uh.expectMatrixCloseTo(result[2], translationMatrix(centerPoint[0], centerPoint[1], centerPoint[2]));
                expect(result[1]).not.toEqual(identityMatrix);
            });
        });


    });

});