import { describe, expect, it } from "vitest";
import type * as Inputs from "../../../inputs";
import { movedPoint } from "./matrices";
import { degreesOfQuaternion, quaternionAbout, quaternionMatrix, quaternionOfAxes, quaternionOfDegrees, quaternionProduct, quaternionTurned, unitQuaternion } from "./quaternions";

type Quaternion = Inputs.Base.Quaternion;
type Vec3 = Inputs.Base.Vector3;

const HALF_ROOT = Math.SQRT1_2;
const close = (received: readonly number[], expected: readonly number[], digits = 12): void => {
    expect(received).toHaveLength(expected.length);
    received.forEach((value, at) => expect(value).toBeCloseTo(expected[at]!, digits));
};
const sameTurn = (received: Quaternion, expected: Quaternion): void => {
    const sign = received.reduce((sum, value, at) => sum + value * expected[at]!, 0) < 0 ? -1 : 1;
    close(received.map(value => value * sign), expected);
};
const axesOf = (unit: Quaternion): { x: Vec3; y: Vec3; z: Vec3 } =>
    ({ x: quaternionTurned(unit, [1, 0, 0]), y: quaternionTurned(unit, [0, 1, 0]), z: quaternionTurned(unit, [0, 0, 1]) });

describe("quaternions", () => {
    it("should build a quarter turn about Z that takes X to Y", () => {
        // Act
        const quarter = quaternionAbout([0, 0, 1], 90);

        // Assert
        close(quarter, [0, 0, HALF_ROOT, HALF_ROOT]);
        close(quaternionTurned(quarter, [1, 0, 0]), [0, 1, 0]);
        close(quaternionTurned(quarter, [0, 0, 5]), [0, 0, 5]);
    });

    it("should turn by the right-hand quaternion first, so X then Z takes Y up to Z", () => {
        // Arrange
        const aboutX = quaternionAbout([1, 0, 0], 90);
        const aboutZ = quaternionAbout([0, 0, 1], 90);

        // Act
        const both = quaternionProduct(aboutZ, aboutX);

        // Assert
        close(quaternionTurned(both, [0, 1, 0]), [0, 0, 1]);
        close(quaternionTurned(both, [1, 0, 0]), [0, 1, 0]);
    });

    it.each<[number, number, number]>([
        [0, 0, 0], [30, 0, 0], [0, 45, 0], [0, 0, -120], [10, 20, 30], [-170, 60, 95], [45, -80, 10],
    ])("should read the angles %j back from the quaternion they build", (x, y, z) => {
        // Act
        const angles = degreesOfQuaternion(quaternionOfDegrees([x, y, z]));

        // Assert
        close(angles, [x, y, z], 9);
    });

    it("should give the whole turn to Z when Y is a quarter turn, where X and Z turn about one line", () => {
        // Arrange
        const up = quaternionOfDegrees([30, 90, 40]);
        const down = quaternionOfDegrees([30, -90, 40]);

        // Act
        const upAngles = degreesOfQuaternion(up);
        const downAngles = degreesOfQuaternion(down);

        // Assert
        expect(upAngles[0]).toBe(0);
        expect(upAngles[1]).toBe(90);
        expect(downAngles[0]).toBe(0);
        expect(downAngles[1]).toBe(-90);
        close(quaternionTurned(quaternionOfDegrees(upAngles), [1, 2, 3]), quaternionTurned(up, [1, 2, 3]), 9);
        close(quaternionTurned(quaternionOfDegrees(downAngles), [1, 2, 3]), quaternionTurned(down, [1, 2, 3]), 9);
    });

    it("should read angles a thousandth of a degree from the gimbal back as given, not snapped to it", () => {
        // Arrange
        const angles: Vec3 = [30, 89.999, 40];

        // Act
        const read = degreesOfQuaternion(quaternionOfDegrees(angles));

        // Assert
        close(read, angles, 6);
    });

    it.each<[string, Quaternion]>([
        ["a small turn", quaternionOfDegrees([10, 20, 30])],
        ["a half turn about X", quaternionAbout([1, 0, 0], 180)],
        ["a half turn about Y", quaternionAbout([0, 1, 0], 180)],
        ["a half turn about Z", quaternionAbout([0, 0, 1], 180)],
        ["a large turn", quaternionOfDegrees([-170, 60, 95])],
    ])("should rebuild %s from the axes it turns the world axes onto", (_name, turn) => {
        // Act
        const rebuilt = quaternionOfAxes(axesOf(turn));

        // Assert
        sameTurn(rebuilt, turn);
    });

    it("should write a matrix that moves points as the quaternion turns them", () => {
        // Arrange
        const turn = quaternionOfDegrees([-170, 60, 95]);
        const point: Vec3 = [1.5, -2, 0.25];

        // Act
        const moved = movedPoint(quaternionMatrix(turn), point);

        // Assert
        close(moved, quaternionTurned(turn, point));
    });

    it("should scale a quaternion to length 1 and give nothing for one of no length or not finite", () => {
        // Act
        const scaled = unitQuaternion([0, 0, 2, 2]);
        const nothing = [unitQuaternion([0, 0, 0, 0]), unitQuaternion([Number.NaN, 0, 0, 1]), unitQuaternion([Number.POSITIVE_INFINITY, 0, 0, 1])];

        // Assert
        close(scaled!, [0, 0, HALF_ROOT, HALF_ROOT]);
        expect(nothing).toEqual([undefined, undefined, undefined]);
    });
});
