import { describe, it, expect, beforeAll } from "vitest";
import { GeometryHelper } from "./geometry-helper";
import { MathBitByBit } from "./math";
import { Transforms } from "./transforms";
import { Vector } from "./vector";
import type * as Inputs from "../inputs";
import { UnitTestHelper } from "../unit-test-helper";
import { InputError } from "../kernel-calls";
import { movedPoint } from "./helpers/geometry/matrices";

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
        const translationMatrix = (x: number, y: number, z: number) => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1] as Inputs.Base.TransformMatrix;
        const scalingMatrix = (x: number, y: number, z: number) => [x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1] as Inputs.Base.TransformMatrix;
        const rotationXMatrix = (angleRad: number) => {
            const c = Math.cos(angleRad);
            const s = Math.sin(angleRad);
            return [1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1] as Inputs.Base.TransformMatrix;
        };
        const rotationYMatrix = (angleRad: number) => {
            const c = Math.cos(angleRad);
            const s = Math.sin(angleRad);
            return [c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1] as Inputs.Base.TransformMatrix;
        };
        const rotationZMatrix = (angleRad: number) => {
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
                uh.expectMatrixCloseTo(result[0]![0], translationMatrix(1, 2, 3));
                uh.expectMatrixCloseTo(result[1]![0], translationMatrix(4, 5, 6));
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

            it("should create translate-rotateYPR-translate matrices for pure Pitch (X rot)", () => {
                const yaw = 0, pitch = 90, roll = 0;
                const angleRadX = math.degToRad({ number: pitch });

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
                const angleRadZ = math.degToRad({ number: roll });

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


    describe("quaternions", () => {
        const HALF_ROOT = Math.SQRT1_2;
        const close = (received: readonly number[], expected: readonly number[]): void => {
            expect(received).toHaveLength(expected.length);
            received.forEach((value, at) => expect(value).toBeCloseTo(expected[at]!, 9));
        };

        it("should build a quarter turn about Z from an axis of any length", () => {
            // Act
            const quarter = transforms.quaternionFromAxisAngle({ axis: [0, 0, 3], angle: 90 });
            const fromDefaults = transforms.quaternionFromAxisAngle({});

            // Assert
            close(quarter, [0, 0, HALF_ROOT, HALF_ROOT]);
            close(fromDefaults, [0, 0, HALF_ROOT, HALF_ROOT]);
        });

        it.each<[number, number, number]>([[90, 0, 0], [0, 90, 0], [0, 0, 90], [10, 20, 30], [-170, 60, 95]])(
            "should turn points from the angles %j as rotationCenterX, Y and Z applied in order do", (x, y, z) => {
                // Arrange
                const steps: Inputs.Base.TransformMatrix[] = [
                    ...transforms.rotationCenterX({ center: [0, 0, 0], angle: x }),
                    ...transforms.rotationCenterY({ center: [0, 0, 0], angle: y }),
                    ...transforms.rotationCenterZ({ center: [0, 0, 0], angle: z }),
                ] as Inputs.Base.TransformMatrix[];
                const matrices = transforms.combine({ transformation: steps });
                const point: Inputs.Base.Point3 = [1.5, -2, 0.25];

                // Act
                const turned = transforms.quaternionRotateVector({ quaternion: transforms.quaternionFromEuler({ angles: [x, y, z] }), vector: point });

                // Assert
                close(turned, movedPoint(matrices[0]!, point));
            });

        it("should read back the angles it was built from, and take a quaternion of any length", () => {
            // Act
            const angles = transforms.quaternionToEuler({ quaternion: transforms.quaternionFromEuler({ angles: [10, 20, 30] }) });
            const scaled = transforms.quaternionToEuler({ quaternion: [0, 0, 5, 5] });

            // Assert
            close(angles, [10, 20, 30]);
            close(scaled, [0, 0, 90]);
        });

        it("should combine a turn about X and then one about Z, in that order", () => {
            // Arrange
            const aboutX = transforms.quaternionFromAxisAngle({ axis: [1, 0, 0], angle: 90 });
            const aboutZ = transforms.quaternionFromAxisAngle({ axis: [0, 0, 1], angle: 90 });

            // Act
            const both = transforms.quaternionCombine({ first: aboutX, second: aboutZ });

            // Assert
            close(transforms.quaternionRotateVector({ quaternion: both, vector: [0, 1, 0] }), [0, 0, 1]);
            close(transforms.quaternionRotateVector({ quaternion: both, vector: [1, 0, 0] }), [0, 1, 0]);
        });

        it("should turn the world axes onto a frame's, squaring a rough direction first", () => {
            // Act
            const turn = transforms.quaternionFromFrame({ frame: { origin: [4, 5, 6], normal: [0, 0, 2], direction: [0, 1, 0.3] } });

            // Assert
            close(turn, [0, 0, HALF_ROOT, HALF_ROOT]);
        });

        it("should write a matrix that point.transformPoints applies as the quaternion turns", () => {
            // Arrange
            const turn = transforms.quaternionFromEuler({ angles: [-170, 60, 95] });

            // Act
            const matrix = transforms.quaternionToMatrix({ quaternion: turn });

            // Assert
            close(movedPoint(matrix, [1, 2, 3]), transforms.quaternionRotateVector({ quaternion: turn, vector: [1, 2, 3] }));
        });

        it("should refuse an axis of no length, a quaternion that is not four numbers or is all 0, and a frame whose direction runs along its normal", () => {
            // Act & Assert
            expect(() => transforms.quaternionFromAxisAngle({ axis: [0, 0, 0], angle: 90 })).toThrow(InputError);
            expect(() => transforms.quaternionFromEuler({ angles: [0, Number.NaN, 0] })).toThrow(InputError);
            expect(() => transforms.quaternionToEuler({ quaternion: [0, 0, 0, 0] })).toThrow(InputError);
            const tooShort: number[] = [0, 0, 1];
            expect(() => transforms.quaternionToMatrix({ quaternion: tooShort as Inputs.Base.Quaternion })).toThrow(InputError);
            expect(() => transforms.quaternionCombine({ first: [0, 0, 0, 1], second: [0, 0, 0, 0] })).toThrow(InputError);
            const flat: number[] = [1, 2];
            expect(() => transforms.quaternionRotateVector({ quaternion: [0, 0, 0, 1], vector: flat as Inputs.Base.Vector3 })).toThrow(InputError);
            expect(() => transforms.quaternionFromFrame({ frame: { origin: [0, 0, 0], normal: [0, 0, 1], direction: [0, 0, 5] } })).toThrow(InputError);
        });
    });

    describe("a stretch along a direction that is not one", () => {
        it("should leave the points where they are", () => {
            const warned: unknown[] = [];
            const consoleWarn = console.warn;
            console.warn = (message: unknown) => { warned.push(message); };

            // Act
            const matrices = transforms.stretchDirFromCenter({ center: [0, 0, 0], direction: [0, 0, 0], scale: 2 });
            console.warn = consoleWarn;

            expect(matrices[1]).toEqual([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
            expect(warned).toHaveLength(1);
        });
    });
});
