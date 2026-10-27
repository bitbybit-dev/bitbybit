import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { Recipes, type Base } from "@bitbybit-dev/base";
import { WORLD_AXES, pointToWorld } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/frame-axes";
import { cross3, dot3 } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/vectors";
import { IFCService } from "../ifc-service";
import * as Inputs from "../inputs";
import { modelOf } from "./service-support";
import { absoluteFrame, movePlacement, objectPlacementOf } from "../../build/placement";
import type { Frame3 } from "../../build/build-types";
import type { IfcModel } from "../../model/model-types";
import { errorFrom, groundFloor, writingInto } from "../../__test__/build-setup";
import { onlyOf, outerCurveOf, sweptAreaOf } from "../../__test__/build-geometry";

const SEED = 1453;
const RUNS = 120;
const ifc = new IFCService();
const RECIPES = new Recipes();
const DEGREES = Math.PI / 180;
const SQUARE_MILLIMETRES_PER_SQUARE_METRE = 1e6;
const CUBIC_MILLIMETRES_PER_CUBIC_METRE = 1e9;
const AREA_SLACK = 1e-9;
const HEIGHT_SLACK = 1e-9;
const FRAME_SLACK = 1e-15;
const MAX_PITCH_DEGREES = 89;
const EAVES = 2800;
const THICKNESS = 200;
const SURVEY_EASTING = 5.5e8;
const SURVEY_NORTHING = 6.07e9;
const SLAB_OUTLINE: Base.Point2[] = [[0, 0], [5000, 0], [5000, 4000], [0, 4000]];
const HOLES_TOUCHING_EACH_SIDE: Readonly<Record<string, Base.Point2[]>> = {
    left: [[0, 1000], [1000, 1000], [1000, 2000], [0, 2000]],
    bottom: [[1000, 0], [2000, 0], [2000, 1000], [1000, 1000]],
    right: [[4000, 1000], [5000, 1000], [5000, 2000], [4000, 2000]],
    top: [[1000, 3000], [2000, 3000], [2000, 4000], [1000, 4000]],
};
const SLOPED = [Inputs.IFC.roofKindEnum.monoPitch, Inputs.IFC.roofKindEnum.gable, Inputs.IFC.roofKindEnum.hip];

function gap(a: readonly number[], b: readonly number[]): number {
    return Math.hypot(...a.map((value, index) => value - b[index]!));
}

function turnedAbout(point: Base.Point2, angle: number, origin: Base.Point2): Base.Point2 {
    return [origin[0] + point[0] * Math.cos(angle) - point[1] * Math.sin(angle), origin[1] + point[0] * Math.sin(angle) + point[1] * Math.cos(angle)];
}

function rectangle(x: number, y: number, width: number, depth: number): Base.Point2[] {
    return [[x, y], [x + width, y], [x + width, y + depth], [x, y + depth]];
}

function quantitiesOf(model: IfcModel, id: string): Record<string, number> {
    const measured = ifc.quantities.compute({ model, elements: [id] });
    return ifc.quantities.get({ model: measured, element: id })[0]!.quantities;
}

function isOrthonormalRightHanded(frame: Frame3): boolean {
    const lengths = [frame.x, frame.y, frame.z].map((axis) => Math.abs(dot3(axis, axis) - 1));
    const squares = [dot3(frame.x, frame.y), dot3(frame.y, frame.z), dot3(frame.z, frame.x)].map(Math.abs);
    return [...lengths, ...squares, gap(cross3(frame.x, frame.y), frame.z)].every((error) => error <= FRAME_SLACK);
}

function outcomeOf(make: () => unknown): string {
    try {
        make();
        return "accepted";
    } catch (error) {
        return error instanceof Error ? `refused: ${error.message}` : "refused";
    }
}

function siteAtSurveyCoordinates(): IfcModel {
    const { model } = groundFloor("survey-site");
    const { tx, writer } = writingInto(model);
    movePlacement(tx, writer, objectPlacementOf(tx, onlyOf(modelOf(model), "IfcSite")), { ...WORLD_AXES, origin: [SURVEY_EASTING, SURVEY_NORTHING, 0] });
    return tx.commit();
}

interface HoledSlab {
    readonly width: number;
    readonly depth: number;
    readonly angle: number;
    readonly origin: Base.Point2;
    readonly hole: { x: number; y: number; width: number; depth: number };
    readonly thickness: number;
}

const holedSlab: fc.Arbitrary<HoledSlab> = fc.record({
    width: fc.double({ min: 100, max: 50000, noNaN: true }),
    depth: fc.double({ min: 100, max: 50000, noNaN: true }),
    angle: fc.double({ min: -Math.PI, max: Math.PI, noNaN: true }),
    origin: fc.tuple(fc.double({ min: -1e5, max: 1e5, noNaN: true }), fc.double({ min: -1e5, max: 1e5, noNaN: true })),
    shares: fc.tuple(fc.double({ min: 0.01, max: 0.97, noNaN: true }), fc.double({ min: 0.01, max: 0.97, noNaN: true }), fc.double({ min: 0.01, max: 1, noNaN: true }), fc.double({ min: 0.01, max: 1, noNaN: true })),
    thickness: fc.double({ min: 1, max: 1000, noNaN: true }),
}).map(({ width, depth, angle, origin, shares, thickness }) => {
    const [fx, fy, fw, fd] = shares;
    const x = width * fx;
    const y = depth * fy;
    return { width, depth, angle, origin, thickness, hole: { x, y, width: (width * 0.99 - x) * fw, depth: (depth * 0.99 - y) * fd } };
});

function placed(slab: HoledSlab, points: readonly Base.Point2[]): Base.Point2[] {
    return points.map((point) => turnedAbout(point, slab.angle, slab.origin));
}

describe("slabs with holes and openings, turned and placed anywhere near the origin", () => {
    const { model: floor } = groundFloor("slabs-fuzz");

    it("should measure a slab with a hole as its outline less its hole, gross and net alike", () => {
        // Arrange
        const property = fc.property(holedSlab, (slab) => {
            const model = ifc.slabs.add({ model: floor, storey: "ground", id: "slab", outline: placed(slab, rectangle(0, 0, slab.width, slab.depth)), holes: [placed(slab, rectangle(slab.hole.x, slab.hole.y, slab.hole.width, slab.hole.depth))], thickness: slab.thickness });
            const measured = quantitiesOf(model, "slab");
            const area = (slab.width * slab.depth - slab.hole.width * slab.hole.depth) / SQUARE_MILLIMETRES_PER_SQUARE_METRE;
            const scale = slab.width * slab.depth / SQUARE_MILLIMETRES_PER_SQUARE_METRE;
            return Math.abs(measured["GrossArea"]! - area) <= AREA_SLACK * scale
                && Math.abs(measured["NetArea"]! - area) <= AREA_SLACK * scale
                && Math.abs(measured["GrossVolume"]! - area * slab.thickness / 1000) <= AREA_SLACK * scale * slab.thickness / 1000
                && RECIPES.check({ recipe: ifc.geometry.recipe({ model }) }).length === 0;
        });

        // Act & Assert
        fc.assert(property, { seed: SEED, numRuns: RUNS });
    });

    it("should measure a slab with an opening cut through it as its whole outline gross and its outline less the opening net", () => {
        // Arrange
        const property = fc.property(holedSlab, (slab) => {
            const solid = ifc.slabs.add({ model: floor, storey: "ground", id: "slab", outline: placed(slab, rectangle(0, 0, slab.width, slab.depth)), thickness: slab.thickness });
            const model = ifc.openings.addInSlab({ model: solid, slab: "slab", outline: placed(slab, rectangle(slab.hole.x, slab.hole.y, slab.hole.width, slab.hole.depth)) });
            const measured = quantitiesOf(model, "slab");
            const whole = slab.width * slab.depth / SQUARE_MILLIMETRES_PER_SQUARE_METRE;
            const net = whole - slab.hole.width * slab.hole.depth / SQUARE_MILLIMETRES_PER_SQUARE_METRE;
            return Math.abs(measured["GrossArea"]! - whole) <= AREA_SLACK * whole && Math.abs(measured["NetArea"]! - net) <= AREA_SLACK * whole;
        });

        // Act & Assert
        fc.assert(property, { seed: SEED, numRuns: RUNS });
    });

    it("should cut an opening that reaches the slab's edge, as the opening's outline may lie on that edge, at any turn of the slab", () => {
        // Arrange
        const property = fc.property(holedSlab, fc.constantFrom("left", "bottom", "right", "top"), (slab, side) => {
            const { x, y, width, depth } = slab.hole;
            const reaching: Record<string, Base.Point2[]> = {
                left: rectangle(0, y, width + x, depth),
                bottom: rectangle(x, 0, width, depth + y),
                right: rectangle(x, y, slab.width - x, depth),
                top: rectangle(x, y, width, slab.depth - y),
            };
            const solid = ifc.slabs.add({ model: floor, storey: "ground", id: "slab", outline: placed(slab, rectangle(0, 0, slab.width, slab.depth)), thickness: slab.thickness });
            return outcomeOf(() => ifc.openings.addInSlab({ model: solid, slab: "slab", outline: placed(slab, reaching[side]!) })) === "accepted";
        });

        // Act & Assert
        fc.assert(property, { seed: SEED, numRuns: RUNS });
    });

    it("should treat a hole that touches the slab's outline the same whichever side of the outline it touches", () => {
        // Act
        const outcomes = Object.values(HOLES_TOUCHING_EACH_SIDE).map((hole) => outcomeOf(() => ifc.slabs.add({ model: floor, storey: "ground", outline: SLAB_OUTLINE, holes: [hole] })).split(":")[0]);

        // Assert
        expect(new Set(outcomes).size).toBe(1);
    });

    it("should treat a hole that touches the terrain's outline the same whichever side of the outline it touches", () => {
        // Act
        const outcomes = Object.values(HOLES_TOUCHING_EACH_SIDE).map((hole) => outcomeOf(() => ifc.site.addTerrain({ model: floor, outline: SLAB_OUTLINE, holes: [hole] })).split(":")[0]);

        // Assert
        expect(new Set(outcomes).size).toBe(1);
    });
});

describe("slabs and terrain drawn at survey coordinates in millimetres", () => {
    const { model: floor } = groundFloor("survey-slabs");
    const surveyed = rectangle(SURVEY_EASTING, SURVEY_NORTHING, 5000, 4000);

    it("should describe a slab drawn at survey coordinates as a valid recipe, as it describes a wall drawn there", () => {
        // Arrange
        const model = ifc.slabs.add({ model: floor, storey: "ground", id: "slab", outline: surveyed, thickness: THICKNESS });

        // Act
        const issues = RECIPES.check({ recipe: ifc.geometry.recipe({ model }) });

        // Assert
        expect(issues).toEqual([]);
    });

    it("should describe terrain drawn at survey coordinates as a valid recipe", () => {
        // Arrange
        const model = ifc.site.addTerrain({ model: floor, id: "terrain", outline: surveyed });

        // Act
        const issues = RECIPES.check({ recipe: ifc.geometry.recipe({ model }) });

        // Assert
        expect(issues).toEqual([]);
    });

    it("should write a space drawn at survey coordinates with a profile no larger than the space, and list and measure it as 20 square metres", () => {
        // Arrange
        const model = ifc.spaces.add({ model: floor, storey: "ground", id: "space", outline: surveyed, height: 2600 });
        const snapshot = modelOf(model);

        // Act
        const profile = outerCurveOf(snapshot, sweptAreaOf(snapshot, snapshot.byType("IfcSpace")[0]!.id));

        // Assert
        expect(Math.max(...profile.flat().map(Math.abs))).toBeLessThanOrEqual(5000);
        expect(quantitiesOf(model, "space")["GrossFloorArea"]).toBeCloseTo(20, 9);
        expect(ifc.spaces.list({ model })[0]!.area).toBeCloseTo(20 * SQUARE_MILLIMETRES_PER_SQUARE_METRE, 3);
    });

    it("should measure a 5 m by 4 m slab drawn at survey coordinates as 20 square metres", () => {
        // Arrange
        const model = ifc.slabs.add({ model: floor, storey: "ground", id: "slab", outline: surveyed, thickness: THICKNESS });

        // Act
        const measured = quantitiesOf(model, "slab");

        // Assert
        expect(measured["GrossArea"]).toBeCloseTo(20, 9);
    });
});

interface RoofDrawn {
    readonly width: number;
    readonly depth: number;
    readonly angle: number;
    readonly pitch: number;
    readonly overhang: number;
    readonly kind: Inputs.IFC.roofKindEnum;
}

const roofDrawn: fc.Arbitrary<RoofDrawn> = fc.record({
    width: fc.double({ min: 100, max: 50000, noNaN: true }),
    depth: fc.oneof(fc.double({ min: 100, max: 50000, noNaN: true }), fc.constant(-1)),
    angle: fc.double({ min: -Math.PI, max: Math.PI, noNaN: true }),
    pitch: fc.oneof(fc.double({ min: 1e-6, max: MAX_PITCH_DEGREES, noNaN: true }), fc.constantFrom(MAX_PITCH_DEGREES, 1e-6, 45)),
    overhang: fc.oneof(fc.constant(0), fc.double({ min: 0, max: 2000, noNaN: true })),
    kind: fc.constantFrom(...SLOPED, Inputs.IFC.roofKindEnum.flat),
}).map((drawn) => ({ ...drawn, depth: drawn.depth < 0 ? drawn.width : drawn.depth }));

const ROOF_CORNER: Base.Point2 = [1000, -2000];

function expectedUnderside(roof: RoofDrawn, along: number, across: number): number {
    if (roof.kind === Inputs.IFC.roofKindEnum.flat) {
        return EAVES;
    }
    const rise = Math.tan(roof.pitch * DEGREES);
    if (roof.kind === Inputs.IFC.roofKindEnum.monoPitch) {
        return EAVES + across * rise;
    }
    if (roof.kind === Inputs.IFC.roofKindEnum.gable) {
        return EAVES + Math.min(across, roof.depth - across) * rise;
    }
    return EAVES + Math.min(along, roof.width - along, across, roof.depth - across) * rise;
}

function partCornersInRoofPlan(model: IfcModel, roof: RoofDrawn): Base.Point3[] {
    const snapshot = modelOf(model);
    return snapshot.byType("IfcSlab").flatMap((part) => {
        const frame = absoluteFrame(snapshot, objectPlacementOf(snapshot, part.id));
        return outerCurveOf(snapshot, sweptAreaOf(snapshot, part.id)).map((point): Base.Point3 => {
            const world = pointToWorld(frame, [point[0]!, point[1]!, 0]);
            const [x, y] = [world[0] - ROOF_CORNER[0], world[1] - ROOF_CORNER[1]];
            return [x * Math.cos(roof.angle) + y * Math.sin(roof.angle), -x * Math.sin(roof.angle) + y * Math.cos(roof.angle), world[2]];
        });
    });
}

function roofOver(floor: IfcModel, roof: RoofDrawn): IfcModel {
    const outline = rectangle(0, 0, roof.width, roof.depth).map((point) => turnedAbout(point, roof.angle, ROOF_CORNER));
    return ifc.roofs.add({ model: floor, storey: "ground", id: "roof", outline, kind: roof.kind, pitch: roof.pitch, baseOffset: EAVES, overhang: roof.overhang, thickness: THICKNESS });
}

describe("roofs over any rectangle, at any pitch up to the limit", () => {
    const { model: floor } = groundFloor("roofs-fuzz");

    it("should lay every corner of every part's underside on the plane the pitch and the eaves give, overhang included", () => {
        // Arrange
        const property = fc.property(roofDrawn, (roof) => partCornersInRoofPlan(roofOver(floor, roof), roof).every(([along, across, height]) => {
            const expected = expectedUnderside(roof, along, across);
            return Math.abs(height - expected) <= HEIGHT_SLACK * Math.max(1, Math.abs(expected));
        }));

        // Act & Assert
        fc.assert(property, { seed: SEED, numRuns: RUNS });
    });

    it("should place every part of a roof in a right-handed orthonormal frame and describe the roof as a valid recipe", () => {
        // Arrange
        const property = fc.property(roofDrawn, (roof) => {
            const model = roofOver(floor, roof);
            const snapshot = modelOf(model);
            return snapshot.byType("IfcSlab").every((part) => isOrthonormalRightHanded(absoluteFrame(snapshot, objectPlacementOf(snapshot, part.id))))
                && RECIPES.check({ recipe: ifc.geometry.recipe({ model }) }).length === 0;
        });

        // Act & Assert
        fc.assert(property, { seed: SEED, numRuns: RUNS });
    });

    it("should refuse a sloped roof whose pitch is not above zero and at most the limit, naming the pitch", () => {
        // Arrange
        const outOfRange = fc.oneof(fc.double({ min: MAX_PITCH_DEGREES + 1e-9, max: 1e300, noNaN: true }), fc.double({ min: -1e300, max: 0, noNaN: true }), fc.constant(Number.NaN));
        const property = fc.property(fc.constantFrom(...SLOPED), outOfRange, (kind, pitch) => {
            const refusal = errorFrom(() => ifc.roofs.add({ model: floor, storey: "ground", outline: SLAB_OUTLINE, kind, pitch }));
            return /pitch/.test(refusal.message);
        });

        // Act & Assert
        fc.assert(property, { seed: SEED, numRuns: RUNS });
    });
});

describe("a gable roof over walls drawn at survey coordinates in millimetres", () => {
    const { model: floor } = groundFloor("survey-roof");
    const ROOF_WIDTH = 10000;
    const ROOF_DEPTH = 8000;
    const PITCH = 30;
    const OVERHANG = 400;
    const rise = Math.tan(PITCH * DEGREES);
    const tall = EAVES + ROOF_DEPTH * rise / 2 + 500;
    const corners = rectangle(SURVEY_EASTING, SURVEY_NORTHING, ROOF_WIDTH, ROOF_DEPTH);
    const walls: Readonly<Record<string, [Base.Point2, Base.Point2]>> = {
        eaves: [corners[0]!, corners[1]!],
        east: [corners[1]!, corners[2]!],
        west: [corners[3]!, corners[0]!],
    };
    const walled = Object.entries(walls).reduce((model, [id, [start, end]]) => ifc.walls.add({ model, storey: "ground", id, start, end, thickness: THICKNESS, height: tall, alignment: Inputs.IFC.wallAlignmentEnum.right }), floor);
    const roofed = ifc.roofs.add({ model: walled, storey: "ground", id: "roof", outline: corners, kind: Inputs.IFC.roofKindEnum.gable, pitch: PITCH, baseOffset: EAVES, overhang: OVERHANG, thickness: THICKNESS });
    const clipped = Object.keys(walls).reduce((model, wall) => ifc.walls.clipByRoof({ model, wall, roof: "roof" }), roofed);
    const gableWallVolume = (EAVES * ROOF_DEPTH + ROOF_DEPTH ** 2 * rise / 4) * THICKNESS / CUBIC_MILLIMETRES_PER_CUBIC_METRE;
    const eavesWallVolume = ROOF_WIDTH * (EAVES * THICKNESS - rise * THICKNESS ** 2 / 2) / CUBIC_MILLIMETRES_PER_CUBIC_METRE;

    it("should describe the roof and its clipped walls as a valid recipe", () => {
        // Act
        const issues = RECIPES.check({ recipe: ifc.geometry.recipe({ model: clipped }) });

        // Assert
        expect(issues).toEqual([]);
    });

    it("should lay every corner of the roof's underside at the height the eaves and the pitch give", () => {
        // Arrange
        const snapshot = modelOf(clipped);

        // Act
        const heights = snapshot.byType("IfcSlab").flatMap((part) => {
            const frame = absoluteFrame(snapshot, objectPlacementOf(snapshot, part.id));
            return outerCurveOf(snapshot, sweptAreaOf(snapshot, part.id)).map((point) => {
                const world = pointToWorld(frame, [point[0]!, point[1]!, 0]);
                const across = world[1] - SURVEY_NORTHING;
                return world[2] - (EAVES + Math.min(across, ROOF_DEPTH - across) * rise);
            });
        });

        // Assert
        expect(heights).toHaveLength(8);
        heights.forEach((miss) => expect(Math.abs(miss)).toBeLessThanOrEqual(HEIGHT_SLACK * tall));
    });

    it("should measure each gable wall clipped under the roof as its eaves rectangle and the triangle up to the ridge", () => {
        // Act
        const volumes = ["east", "west"].map((wall) => quantitiesOf(clipped, wall)["GrossVolume"]);

        // Assert
        volumes.forEach((volume) => expect(volume).toBeCloseTo(gableWallVolume, 9));
    });

    it("should measure the eaves wall clipped under the roof's overhang as its length times the wedge under the slope", () => {
        // Act
        const volume = quantitiesOf(clipped, "eaves")["GrossVolume"];

        // Assert
        expect(volume).toBeCloseTo(eavesWallVolume, 9);
    });
});

describe("walls clipped under gable roofs", () => {
    const { model: floor } = groundFloor("clipping-fuzz");
    const gable = fc.record({
        width: fc.double({ min: 3000, max: 20000, noNaN: true }),
        depth: fc.double({ min: 3000, max: 20000, noNaN: true }),
        pitch: fc.double({ min: 5, max: 60, noNaN: true }),
        overhang: fc.double({ min: 0, max: 600, noNaN: true }),
        angle: fc.double({ min: -Math.PI, max: Math.PI, noNaN: true }),
    });
    const clippedGableWall = (model: IfcModel, drawn: { width: number; depth: number; pitch: number; overhang: number; angle: number }): IfcModel => {
        const corners = rectangle(0, 0, drawn.width, drawn.depth).map((point) => turnedAbout(point, drawn.angle, [0, 0]));
        const tall = EAVES + drawn.depth * Math.tan(drawn.pitch * DEGREES) + 500;
        const walled = ifc.walls.add({ model, storey: "ground", id: "gable", start: corners[1]!, end: corners[2]!, thickness: THICKNESS, height: tall, alignment: Inputs.IFC.wallAlignmentEnum.right });
        const roofed = ifc.roofs.add({ model: walled, storey: "ground", id: "roof", outline: corners, kind: Inputs.IFC.roofKindEnum.gable, pitch: drawn.pitch, baseOffset: EAVES, overhang: drawn.overhang, thickness: THICKNESS });
        return ifc.walls.clipByRoof({ model: roofed, wall: "gable", roof: "roof" });
    };
    const gableWallVolume = (drawn: { depth: number; pitch: number }): number => (EAVES * drawn.depth + drawn.depth ** 2 * Math.tan(drawn.pitch * DEGREES) / 4) * THICKNESS / CUBIC_MILLIMETRES_PER_CUBIC_METRE;

    it("should measure a gable wall clipped under the roof as its eaves rectangle and the triangle up to the ridge", () => {
        // Arrange
        const property = fc.property(gable, (drawn) => {
            const expected = gableWallVolume(drawn);
            return Math.abs(quantitiesOf(clippedGableWall(floor, drawn), "gable")["GrossVolume"]! - expected) <= AREA_SLACK * expected;
        });

        // Act & Assert
        fc.assert(property, { seed: SEED, numRuns: RUNS });
    });

    it("should measure a gable wall clipped under a roof on a site at survey coordinates as it measures one at the origin", () => {
        // Arrange
        const drawn = { width: 10000, depth: 8000, pitch: 30, overhang: 400, angle: 0 };

        // Act
        const measured = quantitiesOf(clippedGableWall(siteAtSurveyCoordinates(), drawn), "gable");

        // Assert
        expect(measured["GrossVolume"]).toBeCloseTo(gableWallVolume(drawn), 9);
    });
});
