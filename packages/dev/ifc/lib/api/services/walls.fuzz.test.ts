import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { InputError, Recipes, type Base } from "@bitbybit-dev/base";
import { WORLD_AXES, pointToWorld } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/frame-axes";
import { IFCService } from "../ifc-service";
import * as Inputs from "../inputs";
import { modelOf } from "./service-support";
import { absoluteFrame, movePlacement, objectPlacementOf } from "../../build/placement";
import type { IfcModel } from "../../model/model-types";
import { errorFrom, expressIdOf, groundFloor, writingInto } from "../../__test__/build-setup";
import { onlyOf, outerCurveOf, sweptAreaOf } from "../../__test__/build-geometry";

const SEED = 1987;
const RUNS = 120;
const JOIN_RUNS = 100;
const ifc = new IFCService();
const RECIPES = new Recipes();
const TIME_STAMP = "2026-10-18T12:00:00";
const SQUARE_MILLIMETRES_PER_SQUARE_METRE = 1e6;
const CUBIC_MILLIMETRES_PER_CUBIC_METRE = 1e9;
const RELATIVE_SLACK = 1e-12;
const AXIS_SLACK = 1e-15;
const AXES_WRITTEN_AS_THE_WORLD_AXES_WITHIN = 1e-12;
const CORNER_SLACK = 1e-6;
const FOOTPRINT_SLACK = 1e-9;
const DEGREES = Math.PI / 180;
const SURVEY_EASTING = 5.5e8;
const SURVEY_NORTHING = 6.07e9;
const RECIPE_REACH = 1e9;
const TOO_SHORT = "too short for the walls it meets";
const ALIGNMENTS = [Inputs.IFC.wallAlignmentEnum.left, Inputs.IFC.wallAlignmentEnum.center, Inputs.IFC.wallAlignmentEnum.right];

const nearCoordinate = fc.double({ min: -1e7, max: 1e7, noNaN: true });
const surveyCoordinate = fc.double({ min: 1e9, max: 1e10, noNaN: true });
const anyCoordinate = fc.oneof(nearCoordinate, surveyCoordinate);
const heading = fc.double({ min: -720, max: 720, noNaN: true });
const anyLength = fc.oneof(fc.double({ min: 2e-3, max: 1, noNaN: true }), fc.double({ min: 1, max: 1e6, noNaN: true }), fc.double({ min: 1e6, max: 1e8, noNaN: true }));
const ordinaryLength = fc.double({ min: 1, max: 1e6, noNaN: true });
const thickness = fc.double({ min: 1, max: 2000, noNaN: true });
const height = fc.double({ min: 1, max: 1e5, noNaN: true });
const alignment = fc.constantFrom(...ALIGNMENTS);

interface WallInputs {
    readonly start: Base.Point2;
    readonly end: Base.Point2;
    readonly thickness: number;
    readonly height: number;
    readonly alignment: Inputs.IFC.wallAlignmentEnum;
}

const wallInputs = (coordinate: fc.Arbitrary<number>, length: fc.Arbitrary<number>): fc.Arbitrary<WallInputs> =>
    fc.record({ x: coordinate, y: coordinate, heading, length, thickness, height, alignment }).map((drawn) => ({
        start: [drawn.x, drawn.y] as Base.Point2,
        end: [drawn.x + drawn.length * Math.cos(drawn.heading * DEGREES), drawn.y + drawn.length * Math.sin(drawn.heading * DEGREES)] as Base.Point2,
        thickness: drawn.thickness,
        height: drawn.height,
        alignment: drawn.alignment,
    }));

function gap(a: readonly number[], b: readonly number[]): number {
    return Math.hypot(...a.map((value, index) => value - b[index]!));
}

function runOf(wall: WallInputs): number {
    return Math.hypot(wall.end[0] - wall.start[0], wall.end[1] - wall.start[1]);
}

function withWall(model: IfcModel, id: string, wall: WallInputs): IfcModel {
    return ifc.walls.add({ model, storey: "ground", id, ...wall });
}

function quantitiesOf(model: IfcModel, id: string): Record<string, number> {
    const measured = ifc.quantities.compute({ model, elements: [id] });
    return ifc.quantities.get({ model: measured, element: id })[0]!.quantities;
}

function worldFootprint(model: IfcModel, id: string): Base.Point2[] {
    const snapshot = modelOf(model);
    const wall = expressIdOf(model, id);
    const frame = absoluteFrame(snapshot, objectPlacementOf(snapshot, wall));
    return outerCurveOf(snapshot, sweptAreaOf(snapshot, wall)).map((point) => {
        const placed = pointToWorld(frame, [point[0]!, point[1]!, 0]);
        return [placed[0], placed[1]];
    });
}

function signedArea(points: readonly Base.Point2[]): number {
    const [ox, oy] = points[0]!;
    return points.reduce((sum, point, index) => {
        const next = points[(index + 1) % points.length]!;
        return sum + ((point[0] - ox) * (next[1] - oy) - (next[0] - ox) * (point[1] - oy));
    }, 0) / 2;
}

function distanceToSegment(point: Base.Point2, from: Base.Point2, to: Base.Point2): number {
    const along: Base.Vector2 = [to[0] - from[0], to[1] - from[1]];
    const share = Math.min(1, Math.max(0, ((point[0] - from[0]) * along[0] + (point[1] - from[1]) * along[1]) / (along[0] ** 2 + along[1] ** 2)));
    return Math.hypot(point[0] - from[0] - share * along[0], point[1] - from[1] - share * along[1]);
}

function sharesPoint(point: Base.Point2, others: readonly Base.Point2[], scale: number): boolean {
    return others.some((other) => gap(point, other) <= CORNER_SLACK * scale);
}

function siteAtSurveyCoordinates(): IfcModel {
    const { model } = groundFloor("survey-site");
    const { tx, writer } = writingInto(model);
    movePlacement(tx, writer, objectPlacementOf(tx, onlyOf(modelOf(model), "IfcSite")), { ...WORLD_AXES, origin: [SURVEY_EASTING, SURVEY_NORTHING, 0] });
    return tx.commit();
}

describe("walls at any angle, of any length, anywhere on a storey", () => {
    const { model: floor } = groundFloor("walls-fuzz");

    it("should read a wall's axis, thickness, height and alignment back as they were given, to within the snap of its direction to the world axes", () => {
        // Arrange
        const property = fc.property(wallInputs(anyCoordinate, anyLength), (wall) => {
            const read = ifc.walls.parameters({ model: withWall(floor, "wall", wall), wall: "wall" });
            const scale = Math.max(1, ...wall.start.map(Math.abs), runOf(wall));
            return gap(read.start, wall.start) <= AXIS_SLACK * scale
                && gap(read.end, wall.end) <= 4 * AXIS_SLACK * scale + AXES_WRITTEN_AS_THE_WORLD_AXES_WITHIN * runOf(wall)
                && Math.abs(read.thickness - wall.thickness) <= AXIS_SLACK * wall.thickness
                && read.height === wall.height
                && read.alignment === wall.alignment;
        });

        // Act & Assert
        fc.assert(property, { seed: SEED, numRuns: RUNS });
    });

    it("should read the same parameters back from the file it writes, and write that file again byte for byte", () => {
        // Arrange
        const property = fc.property(wallInputs(anyCoordinate, anyLength), (wall) => {
            const model = withWall(floor, "wall", wall);
            const text = ifc.model.write({ model, timeStamp: TIME_STAMP });
            const read = ifc.model.read({ data: text });
            return JSON.stringify(ifc.walls.parameters({ model: read, wall: "wall" })) === JSON.stringify(ifc.walls.parameters({ model, wall: "wall" }))
                && ifc.model.write({ model: read, timeStamp: TIME_STAMP }) === text;
        });

        // Act & Assert
        fc.assert(property, { seed: SEED, numRuns: RUNS });
    });

    it("should place a wall upright at its start with X along its axis to within the snap to the world axes, the same file for the same calls and no GlobalId twice", () => {
        // Arrange
        const property = fc.property(wallInputs(anyCoordinate, anyLength), (wall) => {
            const model = withWall(floor, "wall", wall);
            const snapshot = modelOf(model);
            const frame = absoluteFrame(snapshot, objectPlacementOf(snapshot, expressIdOf(model, "wall")));
            const along: Base.Vector2 = [(wall.end[0] - wall.start[0]) / runOf(wall), (wall.end[1] - wall.start[1]) / runOf(wall)];
            const globalIds = model.byType("IfcRoot").map((entity) => model.attribute(entity.id, "GlobalId"));
            return gap(frame.z, [0, 0, 1]) === 0
                && gap(frame.x, [along[0], along[1], 0]) <= AXES_WRITTEN_AS_THE_WORLD_AXES_WITHIN
                && new Set(globalIds).size === globalIds.length
                && ifc.model.write({ model: withWall(floor, "wall", wall), timeStamp: TIME_STAMP }) === ifc.model.write({ model, timeStamp: TIME_STAMP });
        });

        // Act & Assert
        fc.assert(property, { seed: SEED, numRuns: RUNS });
    });

    it("should describe every wall whose footprint a recipe's coordinates reach as a valid recipe", () => {
        // Arrange
        const property = fc.property(wallInputs(anyCoordinate, anyLength), (wall) => RECIPES.check({ recipe: ifc.geometry.recipe({ model: withWall(floor, "wall", wall) }) }).length === 0);

        // Act & Assert
        fc.assert(property, { seed: SEED, numRuns: RUNS });
    });

    it("should measure a wall's gross volume and footprint as its length times its thickness, times its height, wherever it stands", () => {
        // Arrange
        const property = fc.property(wallInputs(anyCoordinate, ordinaryLength), (wall) => {
            const measured = quantitiesOf(withWall(floor, "wall", wall), "wall");
            const footprint = runOf(wall) * wall.thickness / SQUARE_MILLIMETRES_PER_SQUARE_METRE;
            const volume = runOf(wall) * wall.thickness * wall.height / CUBIC_MILLIMETRES_PER_CUBIC_METRE;
            return Math.abs(measured["GrossFootprintArea"]! - footprint) <= RELATIVE_SLACK * footprint
                && Math.abs(measured["GrossVolume"]! - volume) <= RELATIVE_SLACK * volume;
        });

        // Act & Assert
        fc.assert(property, { seed: SEED, numRuns: RUNS });
    });

    it("should measure a 5 m wall drawn at survey coordinates in millimetres as 3 cubic metres, as it measures one at the origin", () => {
        // Arrange
        const surveyed = withWall(floor, "wall", { start: [SURVEY_EASTING, SURVEY_NORTHING], end: [SURVEY_EASTING + 5000, SURVEY_NORTHING], thickness: 200, height: 3000, alignment: Inputs.IFC.wallAlignmentEnum.right });

        // Act
        const measured = quantitiesOf(surveyed, "wall");

        // Assert
        expect(measured["GrossVolume"]).toBeCloseTo(3, 9);
        expect(measured["GrossFootprintArea"]).toBeCloseTo(1, 9);
    });

    it("should measure a wall on a storey whose site another tool placed at survey coordinates as it measures one at the origin", () => {
        // Arrange
        const surveyed = withWall(siteAtSurveyCoordinates(), "wall", { start: [0, 0], end: [5000, 0], thickness: 200, height: 3000, alignment: Inputs.IFC.wallAlignmentEnum.right });

        // Act
        const measured = quantitiesOf(surveyed, "wall");

        // Assert
        expect(measured["GrossVolume"]).toBeCloseTo(3, 9);
        expect(measured["NetVolume"]).toBeCloseTo(3, 9);
        expect(measured["GrossFootprintArea"]).toBeCloseTo(1, 9);
    });

    it("should refuse a wall longer than a recipe's coordinates reach with an InputError naming its length, as added and as edited", () => {
        // Arrange
        const beyondReach: WallInputs = { start: [0, 0], end: [2 * RECIPE_REACH, 0], thickness: 200, height: 3000, alignment: Inputs.IFC.wallAlignmentEnum.right };
        const walled = withWall(floor, "wall", { ...beyondReach, end: [5000, 0] });

        // Act
        const refusals = [errorFrom(() => withWall(floor, "wall", beyondReach)), errorFrom(() => ifc.walls.edit({ model: walled, wall: "wall", end: beyondReach.end }))];

        // Assert
        refusals.forEach((refusal) => {
            expect(refusal).toBeInstanceOf(InputError);
            expect(refusal).toEqual(expect.objectContaining({ property: "end", message: expect.stringContaining("wall's length must be at most 1000000000") }));
        });
    });

    it("should describe a wall as long as a recipe's coordinates reach as a valid recipe", () => {
        // Arrange
        const atReach = withWall(floor, "wall", { start: [0, 0], end: [RECIPE_REACH - 1000, 0], thickness: 200, height: 3000, alignment: Inputs.IFC.wallAlignmentEnum.right });

        // Act
        const issues = RECIPES.check({ recipe: ifc.geometry.recipe({ model: atReach }) });

        // Assert
        expect(issues).toEqual([]);
    });
});

interface Corner {
    readonly heading: number;
    readonly interior: number;
    readonly side: number;
    readonly first: number;
    readonly second: number;
    readonly firstThickness: number;
    readonly secondThickness: number;
    readonly firstAlignment: Inputs.IFC.wallAlignmentEnum;
    readonly secondAlignment: Inputs.IFC.wallAlignmentEnum;
}

const JOINT: Base.Point2 = [1000, 2000];

const corner = (interior: fc.Arbitrary<number>, length: fc.Arbitrary<number>): fc.Arbitrary<Corner> => fc.record({
    heading: fc.double({ min: -180, max: 180, noNaN: true }),
    interior,
    side: fc.constantFrom(1, -1),
    first: length,
    second: length,
    firstThickness: fc.double({ min: 50, max: 500, noNaN: true }),
    secondThickness: fc.double({ min: 50, max: 500, noNaN: true }),
    firstAlignment: alignment,
    secondAlignment: alignment,
});

function cornerWalls(floor: IfcModel, drawn: Corner): IfcModel {
    const towards = drawn.heading * DEGREES;
    const away = towards + drawn.side * (180 - drawn.interior) * DEGREES;
    const start: Base.Point2 = [JOINT[0] - drawn.first * Math.cos(towards), JOINT[1] - drawn.first * Math.sin(towards)];
    const end: Base.Point2 = [JOINT[0] + drawn.second * Math.cos(away), JOINT[1] + drawn.second * Math.sin(away)];
    const first = withWall(floor, "a", { start, end: JOINT, thickness: drawn.firstThickness, height: 3000, alignment: drawn.firstAlignment });
    return withWall(first, "b", { start: JOINT, end, thickness: drawn.secondThickness, height: 3000, alignment: drawn.secondAlignment });
}

function squareFootprint(model: IfcModel, id: string): Base.Point2[] {
    const read = ifc.walls.parameters({ model, wall: id });
    const length = gap(read.end, read.start);
    const along: Base.Vector2 = [(read.end[0] - read.start[0]) / length, (read.end[1] - read.start[1]) / length];
    const at = (distance: number, across: number): Base.Point2 => [read.start[0] + along[0] * distance - along[1] * across, read.start[1] + along[1] * distance + along[0] * across];
    return [at(0, read.offset), at(length, read.offset), at(length, read.offset + read.thickness), at(0, read.offset + read.thickness)];
}

function mitreIsShared(model: IfcModel): boolean {
    const first = worldFootprint(model, "a");
    const second = worldFootprint(model, "b");
    return [first[1]!, first[2]!].every((point) => sharesPoint(point, [second[0]!, second[3]!], 1));
}

function cornerOutcome(walls: IfcModel): string {
    let joined: IfcModel;
    try {
        joined = ifc.walls.connect({ model: walls, wall: "a", other: "b" });
    } catch (error) {
        return error instanceof Error && error.message.includes(TOO_SHORT) ? "refused as too short" : `refused: ${String(error)}`;
    }
    return mitreIsShared(joined) && signedArea(worldFootprint(joined, "a")) > 0 && signedArea(worldFootprint(joined, "b")) > 0 ? "mitred" : "joined without a shared mitre";
}

function staysNearItsAxis(model: IfcModel, id: string, reach: number): boolean {
    const read = ifc.walls.parameters({ model, wall: id });
    return worldFootprint(model, id).every((point) => distanceToSegment(point, read.start, read.end) <= reach);
}

describe("two walls joined at a corner at any angle", () => {
    const { model: floor } = groundFloor("joins-fuzz");
    const workable = corner(fc.double({ min: 30, max: 150, noNaN: true }), fc.double({ min: 3000, max: 20000, noNaN: true }));

    it("should mitre a corner between 30 and 150 degrees through two points both walls share, keeping both axes and areas", () => {
        // Arrange
        const property = fc.property(workable, (drawn) => {
            const joined = ifc.walls.connect({ model: cornerWalls(floor, drawn), wall: "a", other: "b" });
            const reach = Math.max(drawn.firstThickness, drawn.secondThickness) * (1 / Math.sin(drawn.interior * DEGREES / 2) + 1);
            return mitreIsShared(joined)
                && gap(ifc.walls.parameters({ model: joined, wall: "a" }).end, JOINT) <= CORNER_SLACK
                && signedArea(worldFootprint(joined, "a")) > 0
                && signedArea(worldFootprint(joined, "b")) > 0
                && staysNearItsAxis(joined, "a", reach)
                && staysNearItsAxis(joined, "b", reach)
                && RECIPES.check({ recipe: ifc.geometry.recipe({ model: joined }) }).length === 0;
        });

        // Act & Assert
        fc.assert(property, { seed: SEED, numRuns: JOIN_RUNS });
    });

    it("should square both ends again when the corner is taken apart", () => {
        // Arrange
        const property = fc.property(workable, (drawn) => {
            const parted = ifc.walls.disconnect({ model: ifc.walls.connect({ model: cornerWalls(floor, drawn), wall: "a", other: "b" }), wall: "a", other: "b" });
            return ["a", "b"].every((id) => worldFootprint(parted, id).every((point, index) => gap(point, squareFootprint(parted, id)[index]!) <= CORNER_SLACK));
        });

        // Act & Assert
        fc.assert(property, { seed: SEED, numRuns: JOIN_RUNS });
    });

    it("should join the walls of the file it writes again into the same footprints", () => {
        // Arrange
        const property = fc.property(workable, (drawn) => {
            const joined = ifc.walls.connect({ model: cornerWalls(floor, drawn), wall: "a", other: "b" });
            const read = ifc.model.read({ data: ifc.model.write({ model: joined, timeStamp: TIME_STAMP }) });
            const rejoined = ifc.walls.connect({ model: read, wall: "a", other: "b" });
            return ["a", "b"].every((id) => worldFootprint(rejoined, id).every((point, index) => gap(point, worldFootprint(joined, id)[index]!) <= FOOTPRINT_SLACK));
        });

        // Act & Assert
        fc.assert(property, { seed: SEED, numRuns: JOIN_RUNS });
    });

    it("should mitre a corner at any angle from 5 degrees to nearly straight, or refuse it as too short for the walls it meets, and nothing else", () => {
        // Arrange
        const anyCorner = corner(fc.double({ min: 5, max: 179.9, noNaN: true }), fc.double({ min: 300, max: 20000, noNaN: true }));
        const property = fc.property(anyCorner, (drawn) => ["mitred", "refused as too short"].includes(cornerOutcome(cornerWalls(floor, drawn))));

        // Act & Assert
        fc.assert(property, { seed: SEED, numRuns: JOIN_RUNS });
    });
});

describe("a wall ending against another wall's length", () => {
    const { model: floor } = groundFloor("tees-fuzz");
    const tee = fc.record({
        heading: fc.double({ min: -180, max: 180, noNaN: true }),
        angle: fc.double({ min: 30, max: 150, noNaN: true }),
        share: fc.double({ min: 0.2, max: 0.8, noNaN: true }),
        throughThickness: fc.double({ min: 50, max: 500, noNaN: true }),
        stemThickness: fc.double({ min: 50, max: 500, noNaN: true }),
        throughAlignment: alignment,
        stemAlignment: alignment,
        side: fc.constantFrom(1, -1),
    });

    it("should cut the stem's end on the face of the wall it meets, on the stem's side, and leave that wall as it was", () => {
        // Arrange
        const property = fc.property(tee, (drawn) => {
            const towards = drawn.heading * DEGREES;
            const through: WallInputs = { start: [0, 0], end: [10000 * Math.cos(towards), 10000 * Math.sin(towards)], thickness: drawn.throughThickness, height: 3000, alignment: drawn.throughAlignment };
            const meeting: Base.Point2 = [through.end[0] * drawn.share, through.end[1] * drawn.share];
            const away = towards + drawn.side * drawn.angle * DEGREES;
            const stem: WallInputs = { start: [meeting[0] + 4000 * Math.cos(away), meeting[1] + 4000 * Math.sin(away)], end: meeting, thickness: drawn.stemThickness, height: 3000, alignment: drawn.stemAlignment };
            const walls = withWall(withWall(floor, "through", through), "stem", stem);
            const joined = ifc.walls.connect({ model: walls, wall: "stem", other: "through" });
            const read = ifc.walls.parameters({ model: joined, wall: "through" });
            const left: Base.Vector2 = [-Math.sin(towards), Math.cos(towards)];
            const face = drawn.side > 0 ? read.offset + read.thickness : read.offset;
            const acrossOf = (point: Base.Point2): number => point[0] * left[0] + point[1] * left[1];
            const stemFootprint = worldFootprint(joined, "stem");
            return [stemFootprint[1]!, stemFootprint[2]!].every((point) => Math.abs(acrossOf(point) - face) <= CORNER_SLACK)
                && worldFootprint(joined, "through").every((point, index) => gap(point, worldFootprint(walls, "through")[index]!) === 0);
        });

        // Act & Assert
        fc.assert(property, { seed: SEED, numRuns: JOIN_RUNS });
    });
});

describe("openings anywhere along a wall, up to its very ends", () => {
    const { model: floor } = groundFloor("openings-fuzz");
    const placedOpening = fc.record({
        heading: fc.double({ min: -180, max: 180, noNaN: true }),
        length: fc.double({ min: 1000, max: 20000, noNaN: true }),
        widthShare: fc.double({ min: 0.01, max: 1, noNaN: true }),
        offsetShare: fc.oneof(fc.constantFrom(0, 1), fc.double({ min: 0, max: 1, noNaN: true })),
        sill: fc.double({ min: 0, max: 1500, noNaN: true }),
        height: fc.double({ min: 100, max: 1500, noNaN: true }),
    });
    const wallAlong = (drawn: { heading: number; length: number }): IfcModel => withWall(floor, "wall", {
        start: [0, 0],
        end: [drawn.length * Math.cos(drawn.heading * DEGREES), drawn.length * Math.sin(drawn.heading * DEGREES)],
        thickness: 200,
        height: 3000,
        alignment: Inputs.IFC.wallAlignmentEnum.center,
    });

    it("should cut an opening from the wall's start to its end, its net volume the wall's less the opening's", () => {
        // Arrange
        const property = fc.property(placedOpening, (drawn) => {
            const wall = wallAlong(drawn);
            const run = ifc.walls.parameters({ model: wall, wall: "wall" });
            const length = gap(run.end, run.start);
            const width = length * drawn.widthShare;
            const offset = (length - width) * drawn.offsetShare;
            const model = ifc.openings.add({ model: wall, wall: "wall", id: "opening", offset, width, sill: drawn.sill, height: drawn.height });
            const expected = (length * 3000 - width * drawn.height) * 200 / CUBIC_MILLIMETRES_PER_CUBIC_METRE;
            return Math.abs(quantitiesOf(model, "wall")["NetVolume"]! - expected) <= RELATIVE_SLACK * length * 3000 * 200 / CUBIC_MILLIMETRES_PER_CUBIC_METRE
                && RECIPES.check({ recipe: ifc.geometry.recipe({ model }) }).length === 0;
        });

        // Act & Assert
        fc.assert(property, { seed: SEED, numRuns: RUNS });
    });

    it("should refuse an opening that reaches past either end of the wall, saying it does not fit along it", () => {
        // Arrange
        const property = fc.property(placedOpening, fc.double({ min: 0.01, max: 1000, noNaN: true }), fc.boolean(), (drawn, overshoot, pastTheStart) => {
            const wall = wallAlong(drawn);
            const run = ifc.walls.parameters({ model: wall, wall: "wall" });
            const length = gap(run.end, run.start);
            const width = length * drawn.widthShare;
            const offset = pastTheStart ? -overshoot : length - width + overshoot;
            const refusal = errorFrom(() => ifc.openings.add({ model: wall, wall: "wall", offset, width, sill: drawn.sill, height: drawn.height }));
            return refusal.message.includes("does not fit along the wall");
        });

        // Act & Assert
        fc.assert(property, { seed: SEED, numRuns: RUNS });
    });
});
