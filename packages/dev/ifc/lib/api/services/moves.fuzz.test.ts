import fc from "fast-check";
import { describe, it } from "vitest";
import type { Base } from "@bitbybit-dev/base";
import { cross3, dot3 } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/vectors";
import { IFCService } from "../ifc-service";
import { modelOf } from "./service-support";
import { absoluteFrame, objectPlacementOf } from "../../build/placement";
import type { Frame3 } from "../../build/build-types";
import type { IfcModel } from "../../model/model-types";
import { expressIdOf, groundFloor } from "../../__test__/build-setup";

const SEED = 815;
const RUNS = 120;
const ifc = new IFCService();
const TIME_STAMP = "2026-10-18T12:00:00";
const DEGREES = Math.PI / 180;
const FULL_TURN_DEGREES = 360;
const AXIS_SLACK = 1e-12;
const TURN_SLACK = 1e-10;
const PLACE_SLACK = 1e-12;
const FRAME_SLACK = 1e-15;
const VOLUME_SLACK = 1e-9;

const shift = fc.tuple(fc.double({ min: -1e5, max: 1e5, noNaN: true }), fc.double({ min: -1e5, max: 1e5, noNaN: true }), fc.double({ min: -1e3, max: 1e3, noNaN: true }));
const turn = fc.oneof(fc.double({ min: -720, max: 720, noNaN: true }), fc.constantFrom(0, 90, 180, 270, 360, -360, 45));
const element = fc.constantFrom("column", "beam");
const place = fc.tuple(fc.double({ min: -1e5, max: 1e5, noNaN: true }), fc.double({ min: -1e5, max: 1e5, noNaN: true }));

function gap(a: readonly number[], b: readonly number[]): number {
    return Math.hypot(...a.map((value, index) => value - b[index]!));
}

function frameOf(model: IfcModel, id: string): Frame3 {
    const snapshot = modelOf(model);
    return absoluteFrame(snapshot, objectPlacementOf(snapshot, expressIdOf(model, id)));
}

function sameFrame(a: Frame3, b: Frame3, scale: number, slack = AXIS_SLACK): boolean {
    return gap(a.origin, b.origin) <= PLACE_SLACK * scale && gap(a.x, b.x) <= slack && gap(a.y, b.y) <= slack && gap(a.z, b.z) <= slack;
}

function isOrthonormalRightHanded(frame: Frame3): boolean {
    const lengths = [frame.x, frame.y, frame.z].map((axis) => Math.abs(dot3(axis, axis) - 1));
    const squares = [dot3(frame.x, frame.y), dot3(frame.y, frame.z), dot3(frame.z, frame.x)].map(Math.abs);
    return [...lengths, ...squares, gap(cross3(frame.x, frame.y), frame.z)].every((error) => error <= FRAME_SLACK);
}

function turnedInPlan(vector: Base.Point2, degrees: number): Base.Point2 {
    const angle = degrees * DEGREES;
    return [vector[0] * Math.cos(angle) - vector[1] * Math.sin(angle), vector[0] * Math.sin(angle) + vector[1] * Math.cos(angle)];
}

function netVolume(model: IfcModel, id: string): number {
    const measured = ifc.quantities.compute({ model, elements: [id] });
    return ifc.quantities.get({ model: measured, element: id })[0]!.quantities["NetVolume"]!;
}

describe("model.move over columns and beams", () => {
    const { model: floor } = groundFloor("moves-fuzz");
    const standing = (kind: string, at: Base.Point2, rotation: number): IfcModel => (kind === "column"
        ? ifc.columns.add({ model: floor, storey: "ground", id: kind, position: at, rotation, height: 3000, width: 300, depth: 500 })
        : ifc.beams.add({ model: floor, storey: "ground", id: kind, start: [at[0], at[1], 2800], end: [at[0] + 4000, at[1] + 1500, 3100], rotation, width: 200, depth: 400 }));

    it("should move an element twice to where one move by both translations and both turns takes it", () => {
        // Arrange
        const property = fc.property(element, place, turn, shift, turn, shift, turn, (kind, at, rotation, first, firstTurn, second, secondTurn) => {
            const model = standing(kind, at, rotation);
            const twice = ifc.model.move({ model: ifc.model.move({ model, element: kind, translation: first, rotation: firstTurn }), element: kind, translation: second, rotation: secondTurn });
            const once = ifc.model.move({ model, element: kind, translation: [first[0] + second[0], first[1] + second[1], first[2] + second[2]], rotation: firstTurn + secondTurn });
            return isOrthonormalRightHanded(frameOf(twice, kind)) && sameFrame(frameOf(twice, kind), frameOf(once, kind), 1e5);
        });

        // Act & Assert
        fc.assert(property, { seed: SEED, numRuns: RUNS });
    });

    it("should bring an element back where it was when it is moved back by the opposite translation and turn", () => {
        // Arrange
        const property = fc.property(element, place, turn, shift, turn, (kind, at, rotation, translation, rotationBy) => {
            const model = standing(kind, at, rotation);
            const moved = ifc.model.move({ model, element: kind, translation, rotation: rotationBy });
            const back = ifc.model.move({ model: moved, element: kind, translation: [-translation[0], -translation[1], -translation[2]], rotation: -rotationBy });
            return sameFrame(frameOf(back, kind), frameOf(model, kind), 1e5);
        });

        // Act & Assert
        fc.assert(property, { seed: SEED, numRuns: RUNS });
    });

    it("should turn an element to the same frame whether whole turns are added to the rotation or not", () => {
        // Arrange
        const property = fc.property(element, place, turn, turn, fc.integer({ min: -1000, max: 1000 }), (kind, at, rotation, rotationBy, whole) => {
            const model = standing(kind, at, rotation);
            const once = ifc.model.move({ model, element: kind, rotation: rotationBy });
            const wound = ifc.model.move({ model, element: kind, rotation: rotationBy + whole * FULL_TURN_DEGREES });
            return sameFrame(frameOf(once, kind), frameOf(wound, kind), 1e5, TURN_SLACK);
        });

        // Act & Assert
        fc.assert(property, { seed: SEED, numRuns: RUNS });
    });

    it("should turn an element about the vertical through its own origin and move its origin by the translation", () => {
        // Arrange
        const property = fc.property(element, place, turn, shift, turn, (kind, at, rotation, translation, rotationBy) => {
            const model = standing(kind, at, rotation);
            const before = frameOf(model, kind);
            const after = frameOf(ifc.model.move({ model, element: kind, translation, rotation: rotationBy }), kind);
            const turnedAxis = (axis: Base.Vector3): Base.Vector3 => [...turnedInPlan([axis[0], axis[1]], rotationBy), axis[2]];
            return gap(after.origin, [before.origin[0] + translation[0], before.origin[1] + translation[1], before.origin[2] + translation[2]]) <= PLACE_SLACK * 1e5
                && gap(after.x, turnedAxis(before.x)) <= AXIS_SLACK
                && gap(after.z, turnedAxis(before.z)) <= AXIS_SLACK;
        });

        // Act & Assert
        fc.assert(property, { seed: SEED, numRuns: RUNS });
    });

    it("should leave the model it was given as it was, and every GlobalId as it was", () => {
        // Arrange
        const property = fc.property(element, place, turn, shift, turn, (kind, at, rotation, translation, rotationBy) => {
            const model = standing(kind, at, rotation);
            const before = ifc.model.write({ model, timeStamp: TIME_STAMP });
            const moved = ifc.model.move({ model, element: kind, translation, rotation: rotationBy });
            const globalIds = (of: IfcModel): unknown[] => of.byType("IfcRoot").map((entity) => of.attribute(entity.id, "GlobalId")).sort();
            return ifc.model.write({ model, timeStamp: TIME_STAMP }) === before && JSON.stringify(globalIds(moved)) === JSON.stringify(globalIds(model));
        });

        // Act & Assert
        fc.assert(property, { seed: SEED, numRuns: RUNS });
    });
});

describe("model.move over a wall with an opening and a window", () => {
    const { model: floor } = groundFloor("wall-moves-fuzz");
    const wall = fc.record({ heading: fc.double({ min: -180, max: 180, noNaN: true }), length: fc.double({ min: 3000, max: 20000, noNaN: true }), at: place });
    const furnished = (drawn: { heading: number; length: number; at: Base.Point2 }): IfcModel => {
        const end: Base.Point2 = [drawn.at[0] + drawn.length * Math.cos(drawn.heading * DEGREES), drawn.at[1] + drawn.length * Math.sin(drawn.heading * DEGREES)];
        const walled = ifc.walls.add({ model: floor, storey: "ground", id: "wall", start: drawn.at, end, thickness: 200, height: 3000 });
        const opened = ifc.openings.add({ model: walled, wall: "wall", id: "opening", offset: 500, width: 900, sill: 0, height: 2100 });
        const typed = ifc.windows.addType({ model: opened, id: "window-type", width: 1200, height: 1200 });
        return ifc.windows.add({ model: typed, wall: "wall", windowType: "window-type", id: "window", offset: 1800, sill: 900 });
    };

    it("should move a wall's axis by the translation and turn it about its start, carrying its opening and window along", () => {
        // Arrange
        const property = fc.property(wall, shift, turn, (drawn, translation, rotationBy) => {
            const model = furnished(drawn);
            const before = ifc.walls.parameters({ model, wall: "wall" });
            const moved = ifc.model.move({ model, element: "wall", translation: [translation[0], translation[1], 0], rotation: rotationBy });
            const after = ifc.walls.parameters({ model: moved, wall: "wall" });
            const run = turnedInPlan([before.end[0] - before.start[0], before.end[1] - before.start[1]], rotationBy);
            const start: Base.Point2 = [before.start[0] + translation[0], before.start[1] + translation[1]];
            const carried = (id: string): boolean => {
                const was = frameOf(model, id);
                const is = frameOf(moved, id);
                const offset = turnedInPlan([was.origin[0] - before.start[0], was.origin[1] - before.start[1]], rotationBy);
                return gap(is.origin, [start[0] + offset[0], start[1] + offset[1], was.origin[2]]) <= PLACE_SLACK * 1e5;
            };
            return gap(after.start, start) <= PLACE_SLACK * 1e5
                && gap(after.end, [start[0] + run[0], start[1] + run[1]]) <= PLACE_SLACK * 1e5
                && after.openings.length === before.openings.length
                && carried("opening")
                && carried("window");
        });

        // Act & Assert
        fc.assert(property, { seed: SEED, numRuns: RUNS });
    });

    it("should measure a moved wall's net volume, its opening and window cut out, as it measured it before the move", () => {
        // Arrange
        const property = fc.property(wall, shift, turn, (drawn, translation, rotationBy) => {
            const model = furnished(drawn);
            const moved = ifc.model.move({ model, element: "wall", translation: [translation[0], translation[1], 0], rotation: rotationBy });
            const before = netVolume(model, "wall");
            return Math.abs(netVolume(moved, "wall") - before) <= VOLUME_SLACK * before;
        });

        // Act & Assert
        fc.assert(property, { seed: SEED, numRuns: RUNS });
    });
});
