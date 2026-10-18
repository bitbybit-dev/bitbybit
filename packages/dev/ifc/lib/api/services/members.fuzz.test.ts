import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { InputError, Recipes, type Base } from "@bitbybit-dev/base";
import { axesToMatrix } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/frame-axes";
import { cross3, dot3 } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/vectors";
import { IFCService } from "../ifc-service";
import { modelOf } from "./service-support";
import { absoluteFrame, objectPlacementOf } from "../../build/placement";
import type { Frame3 } from "../../build/build-types";
import type { IfcModel } from "../../model/model-types";
import { errorFrom, expressIdOf, groundFloor } from "../../__test__/build-setup";
import { extrusionOf } from "../../__test__/build-geometry";

const SEED = 4711;
const RUNS = 150;
const ifc = new IFCService();
const RECIPES = new Recipes();
const WIDTH = 100;
const DEPTH = 240;
const CUBIC_MILLIMETRES_PER_CUBIC_METRE = 1e9;
const FRAME_SLACK = 1e-15;
const AXES_WRITTEN_AS_THE_WORLD_AXES_WITHIN = 1e-12;
const RELATIVE_SLACK = 1e-12;
const TURN_SLACK = 1e-10;
const VERTICAL_COSINE = 1 - 1e-9;
const FULL_TURN_DEGREES = 360;
const LARGEST_TURNABLE_DEGREES = 5.72e307;
const SMALLEST_OVERFLOWING_DEGREES = 5.73e307;

type Verb = "members" | "beams";

const coordinate = fc.double({ min: -1e6, max: 1e6, noNaN: true });
const start = fc.tuple(coordinate, coordinate, coordinate);
const sideways = (reach: number) => fc.double({ min: -reach, max: reach, noNaN: true });
const run = fc.oneof(
    fc.tuple(fc.double({ min: -1, max: 1, noNaN: true }), fc.double({ min: -1, max: 1, noNaN: true }), fc.double({ min: -1, max: 1, noNaN: true })),
    fc.tuple(sideways(1e-6), sideways(1e-6), fc.constantFrom(1, -1)),
    fc.tuple(sideways(1e-12), sideways(1e-12), fc.constantFrom(1, -1)),
    fc.constantFrom<Base.Vector3>([0, 0, 1], [0, 0, -1], [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [1, 1, 1]),
).filter((direction) => Math.hypot(...direction) > 1e-3 || Math.abs(direction[2]) === 1);
const length = fc.double({ min: 1, max: 1e5, noNaN: true });
const rotation = fc.oneof(fc.constantFrom(0, 90, 180, 270, 360, -90, -180, 720, 45), fc.double({ min: -1e4, max: 1e4, noNaN: true }));
const verb = fc.constantFrom<Verb>("members", "beams");

function endOf(from: Base.Point3, direction: Base.Vector3, distance: number): Base.Point3 {
    const size = Math.hypot(...direction);
    return [from[0] + direction[0] / size * distance, from[1] + direction[1] / size * distance, from[2] + direction[2] / size * distance];
}

function unit(vector: Base.Vector3): Base.Vector3 {
    const size = Math.hypot(...vector);
    return [vector[0] / size, vector[1] / size, vector[2] / size];
}

function gap(a: readonly number[], b: readonly number[]): number {
    return Math.hypot(...a.map((value, index) => value - b[index]!));
}

function isOrthonormalRightHanded(frame: Frame3): boolean {
    const lengths = [frame.x, frame.y, frame.z].map((axis) => Math.abs(dot3(axis, axis) - 1));
    const squares = [dot3(frame.x, frame.y), dot3(frame.y, frame.z), dot3(frame.z, frame.x)].map(Math.abs);
    return [...lengths, ...squares, gap(cross3(frame.x, frame.y), frame.z)].every((error) => error <= FRAME_SLACK);
}

function added(kind: Verb, model: IfcModel, from: Base.Point3, to: Base.Point3, turn: number): IfcModel {
    const inputs = { model, storey: "ground", id: "member", start: from, end: to, rotation: turn, width: WIDTH, depth: DEPTH };
    return kind === "members" ? ifc.members.add(inputs) : ifc.beams.add(inputs);
}

function frameOf(model: IfcModel, id: string): Frame3 {
    const snapshot = modelOf(model);
    return absoluteFrame(snapshot, objectPlacementOf(snapshot, expressIdOf(model, id)));
}

function grossVolume(model: IfcModel, id: string): number {
    const measured = ifc.quantities.compute({ model, elements: [id] });
    return ifc.quantities.get({ model: measured, element: id })[0]!.quantities["GrossVolume"]!;
}

describe("members and beams between any two points", () => {
    const { model: floor } = groundFloor("members-fuzz");

    it("should place a member at its start, Z along its run to within the snap to the world axes, in a right-handed orthonormal frame, vertical and nearly vertical runs included", () => {
        // Arrange
        const property = fc.property(verb, start, run, length, rotation, (kind, from, direction, distance, turn) => {
            const to = endOf(from, direction, distance);
            const frame = frameOf(added(kind, floor, from, to, turn), "member");
            const scale = Math.max(1, ...from.map(Math.abs));
            return isOrthonormalRightHanded(frame)
                && gap(frame.origin, from) <= FRAME_SLACK * scale
                && gap(frame.z, unit([to[0] - from[0], to[1] - from[1], to[2] - from[2]])) <= AXES_WRITTEN_AS_THE_WORLD_AXES_WITHIN;
        });

        // Act & Assert
        fc.assert(property, { seed: SEED, numRuns: RUNS });
    });

    it("should extrude a member as deep as its start and end are apart", () => {
        // Arrange
        const property = fc.property(verb, start, run, length, rotation, (kind, from, direction, distance, turn) => {
            const to = endOf(from, direction, distance);
            const model = added(kind, floor, from, to, turn);
            const depth = extrusionOf(model, expressIdOf(model, "member")).depth;
            const expected = Math.hypot(to[0] - from[0], to[1] - from[1], to[2] - from[2]);
            return typeof depth === "number" && Math.abs(depth - expected) <= RELATIVE_SLACK * expected;
        });

        // Act & Assert
        fc.assert(property, { seed: SEED, numRuns: RUNS });
    });

    it("should measure a member's volume as its section times its length", () => {
        // Arrange
        const property = fc.property(verb, start, run, length, rotation, (kind, from, direction, distance, turn) => {
            const to = endOf(from, direction, distance);
            const expected = WIDTH * DEPTH * Math.hypot(to[0] - from[0], to[1] - from[1], to[2] - from[2]) / CUBIC_MILLIMETRES_PER_CUBIC_METRE;
            return Math.abs(grossVolume(added(kind, floor, from, to, turn), "member") - expected) <= RELATIVE_SLACK * expected;
        });

        // Act & Assert
        fc.assert(property, { seed: SEED, numRuns: RUNS });
    });

    it("should turn a member by the same frame whether the rotation has whole turns added to it or not", () => {
        // Arrange
        const turns = fc.integer({ min: -1000, max: 1000 });
        const property = fc.property(verb, start, run, length, rotation, turns, (kind, from, direction, distance, turn, whole) => {
            const to = endOf(from, direction, distance);
            const once = frameOf(added(kind, floor, from, to, turn), "member");
            const wound = frameOf(added(kind, floor, from, to, turn + whole * FULL_TURN_DEGREES), "member");
            return gap(once.x, wound.x) <= TURN_SLACK && gap(once.y, wound.y) <= TURN_SLACK;
        });

        // Act & Assert
        fc.assert(property, { seed: SEED, numRuns: RUNS });
    });

    it("should stand a section with its Y up and its X level on a member that is not vertical and not turned", () => {
        // Arrange
        const leaning = run.filter((direction) => Math.abs(unit(direction)[2]) < VERTICAL_COSINE);
        const property = fc.property(verb, start, leaning, length, (kind, from, direction, distance) => {
            const frame = frameOf(added(kind, floor, from, endOf(from, direction, distance), 0), "member");
            return Math.abs(frame.x[2]) <= FRAME_SLACK && frame.y[2] > 0;
        });

        // Act & Assert
        fc.assert(property, { seed: SEED, numRuns: RUNS });
    });

    it("should describe every member as a valid recipe placed by the member's own frame", () => {
        // Arrange
        const property = fc.property(verb, start, run, length, rotation, (kind, from, direction, distance, turn) => {
            const model = added(kind, floor, from, endOf(from, direction, distance), turn);
            const recipe = ifc.geometry.recipe({ model });
            const placed = axesToMatrix(frameOf(model, "member"));
            return RECIPES.check({ recipe }).length === 0 && recipe.roots.length === 1 && gap(recipe.roots[0]!.matrix, placed) <= FRAME_SLACK * Math.max(1, ...from.map(Math.abs));
        });

        // Act & Assert
        fc.assert(property, { seed: SEED, numRuns: RUNS });
    });
});

describe("rotations at the edge of what can be turned by", () => {
    const { model: floor } = groundFloor("rotation-fuzz");
    const overflowing = fc.tuple(fc.double({ min: SMALLEST_OVERFLOWING_DEGREES, max: Number.MAX_VALUE, noNaN: true }), fc.boolean()).map(([size, negative]) => (negative ? -size : size));
    const turnable = fc.tuple(fc.double({ min: 1e300, max: LARGEST_TURNABLE_DEGREES, noNaN: true }), fc.boolean()).map(([size, negative]) => (negative ? -size : size));

    it("should refuse every rotation whose radians overflow with an InputError naming the rotation, for members, beams and columns alike", () => {
        // Arrange
        const property = fc.property(fc.constantFrom("members", "beams", "columns"), overflowing, (kind, turn) => {
            const refusal = errorFrom(() => (kind === "columns"
                ? ifc.columns.add({ model: floor, storey: "ground", rotation: turn })
                : added(kind === "members" ? "members" : "beams", floor, [0, 0, 0], [1000, 0, 0], turn)));
            return refusal instanceof InputError && refusal.property === "rotation";
        });

        // Act & Assert
        fc.assert(property, { seed: SEED, numRuns: RUNS });
    });

    it("should turn by every rotation whose radians are finite, however large, into a right-handed orthonormal frame", () => {
        // Arrange
        const property = fc.property(verb, turnable, (kind, turn) => isOrthonormalRightHanded(frameOf(added(kind, floor, [0, 0, 0], [1000, 0, 0], turn), "member")));

        // Act & Assert
        fc.assert(property, { seed: SEED, numRuns: RUNS });
    });
});

describe("columns standing anywhere, turned any way", () => {
    const { model: floor } = groundFloor("columns-fuzz");

    it("should stand a column upright on its position and base offset, its X turned by the rotation about the vertical", () => {
        // Arrange
        const property = fc.property(coordinate, coordinate, fc.double({ min: -1e4, max: 1e4, noNaN: true }), fc.double({ min: 1, max: 1e5, noNaN: true }), rotation, (x, y, baseOffset, height, turn) => {
            const model = ifc.columns.add({ model: floor, storey: "ground", id: "column", position: [x, y], baseOffset, height, rotation: turn, width: WIDTH, depth: DEPTH });
            const frame = frameOf(model, "column");
            const angle = turn * Math.PI / 180;
            return isOrthonormalRightHanded(frame)
                && gap(frame.origin, [x, y, baseOffset]) <= FRAME_SLACK * Math.max(1, Math.abs(x), Math.abs(y), Math.abs(baseOffset))
                && gap(frame.z, [0, 0, 1]) === 0
                && gap(frame.x, [Math.cos(angle), Math.sin(angle), 0]) <= TURN_SLACK;
        });

        // Act & Assert
        fc.assert(property, { seed: SEED, numRuns: RUNS });
    });

    it("should turn a column a quarter turn so that its X lies along the plan's Y but for rounding", () => {
        // Act
        const frame = frameOf(ifc.columns.add({ model: floor, storey: "ground", id: "column", rotation: 90 }), "column");

        // Assert
        expect(gap(frame.x, [0, 1, 0])).toBeLessThanOrEqual(FRAME_SLACK);
        expect(gap(frame.y, [-1, 0, 0])).toBeLessThanOrEqual(FRAME_SLACK);
    });
});
