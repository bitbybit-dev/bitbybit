import { describe, expect, it } from "vitest";
import { Base } from "../../../inputs/base-inputs";
import { movedCoordinate } from "../geometry/matrices";
import { cross3, dot3, length3, scale3, subtract3 } from "../geometry/vectors";
import { meshMatrixInFile } from "./mesh-file-axes";

type Triple = Base.Vector3;
type AxisSystem = { readonly name: string; readonly take: (point: Triple) => Triple };
type Camera = { readonly eye: Triple; readonly target: Triple; readonly up: Triple };

const { leftHanded, rightHanded } = Base.coordinateSystemEnum;

const IDENTITY: Base.TransformMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const AXIS_NAMES = ["x", "y", "z"] as const;
const ORDERS: readonly Triple[] = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];
const SIGNS: readonly Triple[] = [[1, 1, 1], [1, 1, -1], [1, -1, 1], [1, -1, -1], [-1, 1, 1], [-1, 1, -1], [-1, -1, 1], [-1, -1, -1]];
const EVERY_AXIS_SYSTEM: readonly AxisSystem[] = ORDERS.flatMap(order => SIGNS.map((signs): AxisSystem => ({
    name: order.map((axis, at) => `${signs[at]! < 0 ? "-" : ""}${AXIS_NAMES[axis]!}`).join(", "),
    take: point => [signs[0] * point[order[0]]! + 0, signs[1] * point[order[1]]! + 0, signs[2] * point[order[2]]! + 0],
})));

const MARKER: readonly Triple[] = [[0, 0, 0], [1, 0, 0], [0, 2, 0], [0, 0, 3], [0.5, -1.5, 2.5]];
const CAMERAS: readonly Camera[] = [
    { eye: [10, 6, 8], target: [0, 1, 0], up: [0, 1, 0] },
    { eye: [-7, 3, 12], target: [1, 0, 2], up: [0, 1, 0] },
    { eye: [2, 14, -5], target: [0, 0, 0], up: [1, 0, 0] },
];
const MODEL_UP: Triple = [0, 1, 0];
const MODEL_RIGHT: Triple = [1, 0, 0];
const MODEL_DEPTH: Triple = [0, 0, 1];
const FILE_UP_WHEN_Z_IS_UP: Triple = [0, 0, 1];
const CLOSE = 1e-12;

const unit = (vector: Triple): Triple => scale3(vector, 1 / length3(vector));

const pictureOf = (points: readonly Triple[], camera: Camera, seenRightHanded: boolean): Triple[] => {
    const forward = unit(subtract3(camera.target, camera.eye));
    const right = unit(seenRightHanded ? cross3(forward, camera.up) : cross3(camera.up, forward));
    const above = seenRightHanded ? cross3(right, forward) : cross3(forward, right);
    return points.map((point): Triple => {
        const fromEye = subtract3(point, camera.eye);
        return [dot3(fromEye, right), dot3(fromEye, above), dot3(fromEye, forward)];
    });
};

const sameTriple = (a: Triple, b: Triple): boolean => a.every((value, at) => Math.abs(value - b[at]!) < CLOSE);

const showsWhatTheScreenShows = (system: AxisSystem, modelRightHanded: boolean): boolean => CAMERAS.every(camera => {
    const onScreen = pictureOf(MARKER, camera, modelRightHanded);
    const inAViewer = pictureOf(MARKER.map(system.take), { eye: system.take(camera.eye), target: system.take(camera.target), up: system.take(camera.up) }, true);
    return onScreen.every((seen, at) => sameTriple(seen, inAViewer[at]!));
});

const standsTheRightWayUp = (system: AxisSystem, zUp: boolean): boolean => sameTriple(system.take(MODEL_UP), zUp ? FILE_UP_WHEN_Z_IS_UP : MODEL_UP);

const keepsItsNamedAxis = (system: AxisSystem, zUp: boolean): boolean => zUp
    ? sameTriple(system.take(MODEL_RIGHT), MODEL_RIGHT)
    : sameTriple(system.take(MODEL_DEPTH), MODEL_DEPTH);

const takenByTheTable = (coordinateSystem: Base.coordinateSystemEnum, zUp: boolean, [x, y, z]: Triple): Triple => {
    const matrix = meshMatrixInFile(coordinateSystem, zUp) ?? IDENTITY;
    return [movedCoordinate(matrix, x, y, z, 0) + 0, movedCoordinate(matrix, x, y, z, 1) + 0, movedCoordinate(matrix, x, y, z, 2) + 0];
};

const CASES: [string, Base.coordinateSystemEnum, boolean, string][] = [
    ["a left-handed model into a file with z up", leftHanded, true, "x, z, y"],
    ["a right-handed model into a file with z up", rightHanded, true, "x, -z, y"],
    ["a left-handed model into a file with y up", leftHanded, false, "-x, y, z"],
    ["a right-handed model into a file with y up", rightHanded, false, "x, y, z"],
];

describe("the laws a file's axes answer to", () => {
    it("should tell every axis-aligned system apart, the rotations and the mirrors", () => {
        // Act
        const landings = new Set(EVERY_AXIS_SYSTEM.map(system => system.take([1, 2, 3]).join(" ")));

        // Assert
        expect([EVERY_AXIS_SYSTEM.length, landings.size]).toEqual([48, 48]);
    });

    it.each(CASES)("should leave one system that takes %s, the one the table holds", (_name, coordinateSystem, zUp, expected) => {
        // Arrange
        const modelRightHanded = coordinateSystem === rightHanded;

        // Act
        const lawful = EVERY_AXIS_SYSTEM.filter(system => showsWhatTheScreenShows(system, modelRightHanded) && standsTheRightWayUp(system, zUp) && keepsItsNamedAxis(system, zUp));

        // Assert
        expect(lawful.map(system => system.name)).toEqual([expected]);
        expect(MARKER.map(point => takenByTheTable(coordinateSystem, zUp, point))).toEqual(MARKER.map(lawful[0]!.take));
    });

    it.each(CASES)("should need all three laws to choose it for %s, none of them being implied by the others", (_name, coordinateSystem, zUp) => {
        // Arrange
        const modelRightHanded = coordinateSystem === rightHanded;
        const picture = (system: AxisSystem): boolean => showsWhatTheScreenShows(system, modelRightHanded);
        const upright = (system: AxisSystem): boolean => standsTheRightWayUp(system, zUp);
        const named = (system: AxisSystem): boolean => keepsItsNamedAxis(system, zUp);

        // Act
        const withoutThePicture = EVERY_AXIS_SYSTEM.filter(system => upright(system) && named(system)).length;
        const withoutUp = EVERY_AXIS_SYSTEM.filter(system => picture(system) && named(system)).length;
        const withoutTheNamedAxis = EVERY_AXIS_SYSTEM.filter(system => picture(system) && upright(system)).length;

        // Assert
        expect([withoutThePicture, withoutUp, withoutTheNamedAxis]).toEqual([2, 4, 4]);
    });

    it.each([
        ["a left-handed model", false, 24],
        ["a right-handed model", true, 24],
    ])("should show the screen's picture of %s in exactly the systems of one hand", (_name, modelRightHanded, count) => {
        // Act
        const faithful = EVERY_AXIS_SYSTEM.filter(system => showsWhatTheScreenShows(system, modelRightHanded));
        const hands = new Set(faithful.map(system => Math.sign(dot3(cross3(system.take(MODEL_RIGHT), system.take(MODEL_UP)), system.take(MODEL_DEPTH)))));

        // Assert
        expect([faithful.length, [...hands]]).toEqual([count, [modelRightHanded ? 1 : -1]]);
    });
});
