import { beforeAll, describe, expect, it } from "vitest";
import fc from "fast-check";
import createBitbybitOcct from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { Engineering, InputError } from "@bitbybit-dev/base";
import type { PlanetarySet } from "@bitbybit-dev/base";
import { OCCTService } from "../../occ-service";
import type * as Models from "../../api/models";
import type * as Inputs from "../../api/inputs";

const GEAR_ID = "6a1f0c2e-3b4d-4e5f-8a6b-7c8d9e0f1a2b";
const RING_ID = "6a1f0c2e-3b4d-4e5f-8a6b-7c8d9e0f1a2c";
const CARRIER_ID = "6a1f0c2e-3b4d-4e5f-8a6b-7c8d9e0f1a2d";
const MODULE = 1;
const BACKLASH = 0.05;
const WIDTH = 2;
const CARRIER_GAP = 1;
const CARRIER_THICKNESS = 2;
const PRESSURE_ANGLE_RADIANS = 20 * Math.PI / 180;
const engineering = new Engineering().mechanical.gears;

const gearDocument: Models.OCCT.DesignPartDocument = {
    schemaVersion: 1,
    id: GEAR_ID,
    parameters: {
        module: { value: MODULE, unit: "mm", min: 0.1 },
        teeth: { value: 18, unit: "none", min: 3, step: 1 },
        width: { value: WIDTH, unit: "mm", min: 0.1 },
        backlash: { value: BACKLASH, unit: "mm", min: 0 },
        bore: { value: 3, unit: "mm", min: 0.1 },
    },
    features: [
        {
            id: "profile",
            type: "sketch",
            on: { plane: "XY" },
            loops: [
                { pen: [{ type: "gear", id: "teeth", centre: [0, 0], module: "module", teeth: "teeth", backlash: "backlash" }] },
                { pen: [{ type: "circle", id: "bore", centre: [0, 0], radius: "bore / 2" }] },
            ],
        },
        { id: "gear", type: "extrude", profile: "profile", distance: "width" },
    ],
    parts: [{ id: "gear", body: "gear", connectors: [{ id: "axis", on: { of: "gear", role: "start" } }] }],
};

const ringDocument: Models.OCCT.DesignPartDocument = {
    schemaVersion: 1,
    id: RING_ID,
    parameters: {
        module: { value: MODULE, unit: "mm", min: 0.1 },
        teeth: { value: 42, unit: "none", min: 3, step: 1 },
        width: { value: WIDTH, unit: "mm", min: 0.1 },
        backlash: { value: BACKLASH, unit: "mm", min: 0 },
        rim: { value: "module * (teeth / 2 + 4)", unit: "mm" },
    },
    features: [
        {
            id: "profile",
            type: "sketch",
            on: { plane: "XY" },
            loops: [
                { pen: [{ type: "circle", id: "rim", centre: [0, 0], radius: "rim" }] },
                { pen: [{ type: "gear", id: "teeth", internal: true, centre: [0, 0], module: "module", teeth: "teeth", backlash: "backlash" }] },
            ],
        },
        { id: "ring", type: "extrude", profile: "profile", distance: "width" },
    ],
    parts: [{ id: "ring", body: "ring", connectors: [{ id: "axis", on: { of: "ring", role: "start" } }] }],
};

const carrierDocument = (set: PlanetarySet): Models.OCCT.DesignPartDocument => ({
    schemaVersion: 1,
    id: CARRIER_ID,
    parameters: { thickness: CARRIER_THICKNESS, reach: set.centreDistance + 3 },
    features: [
        { id: "disc", type: "sketch", on: { plane: "XY" }, pen: [{ type: "circle", id: "edge", centre: [0, 0], radius: "reach" }] },
        { id: "carrier", type: "extrude", profile: "disc", distance: "thickness" },
    ],
    parts: [{
        id: "carrier",
        body: "carrier",
        connectors: [
            { id: "hub", on: { of: "carrier", role: "start" } },
            ...set.planetCentres.map((centre, index): Models.OCCT.DesignConnector => ({ id: `pin${index}`, on: { of: "carrier", role: "end" }, origin: [centre[0], centre[1], 0] })),
        ],
    }],
});

interface GearboxDrive {
    sun: string;
    planet: (index: number) => string;
}

const ringHeld: GearboxDrive = {
    sun: "carrier * (1 + ringTeeth / sunTeeth)",
    planet: index => `planetRotation${index} - carrier * ringTeeth / planetTeeth`,
};

const gearbox = (set: PlanetarySet, sunTeeth: number, planetTeeth: number, drive: GearboxDrive = ringHeld): Models.OCCT.DesignAssemblyDocument => {
    const ground = (z: number): Models.OCCT.DesignFrame => ({ origin: [0, 0, z], normal: [0, 0, 1], direction: [1, 0, 0] });
    return {
        schemaVersion: 1,
        kind: "assembly",
        parameters: {
            carrier: { value: 0, unit: "deg" },
            sunTeeth: { value: sunTeeth, unit: "none" },
            planetTeeth: { value: planetTeeth, unit: "none" },
            ringTeeth: { value: set.ringTeeth, unit: "none" },
            ringRotation: { value: set.ringRotation, unit: "deg" },
            ...Object.fromEntries(set.planetRotations.map((rotation, index) => [`planetRotation${index}`, { value: rotation, unit: "deg" as const }])),
        },
        components: [
            { id: "sun", source: { document: GEAR_ID, part: "gear", parameters: { teeth: "sunTeeth" } } },
            { id: "ring", source: { document: RING_ID, part: "ring", parameters: { teeth: "ringTeeth" } } },
            { id: "carrier", source: { document: CARRIER_ID, part: "carrier" } },
            ...set.planetCentres.map((_, index): Models.OCCT.DesignComponent => ({ id: `planet${index}`, source: { document: GEAR_ID, part: "gear", parameters: { teeth: "planetTeeth" } } })),
        ],
        joints: [
            { id: "sunShaft", type: "revolute", component: "sun", connector: "axis", to: { frame: ground(0) }, angle: drive.sun },
            { id: "ringHousing", type: "fastened", component: "ring", connector: "axis", to: { frame: ground(0) }, angle: "ringRotation" },
            { id: "carrierShaft", type: "revolute", component: "carrier", connector: "hub", to: { frame: ground(-(CARRIER_GAP + CARRIER_THICKNESS)) }, angle: "carrier" },
            ...set.planetCentres.map((_, index): Models.OCCT.DesignJoint => ({
                id: `planetPin${index}`, type: "revolute", component: `planet${index}`, connector: "axis",
                to: { component: "carrier", connector: `pin${index}` }, angle: drive.planet(index), offset: CARRIER_GAP,
            })),
        ],
    };
};


type Point2 = [number, number];

const placed = (outline: Inputs.Base.Point3[], world: Inputs.Base.TransformMatrix): Point2[] => outline.map(([x, y, z]): Point2 => [
    world[0] * x + world[4] * y + world[8] * z + world[12],
    world[1] * x + world[5] * y + world[9] * z + world[13],
]);

const cross = (o: Point2, a: Point2, b: Point2): number => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);

const crosses = (a: Point2, b: Point2, c: Point2, d: Point2): boolean => cross(a, b, c) * cross(a, b, d) < 0 && cross(c, d, a) * cross(c, d, b) < 0;

const toSegment = (point: Point2, from: Point2, to: Point2): number => {
    const along = [to[0] - from[0], to[1] - from[1]];
    const lengthSquared = along[0]! * along[0]! + along[1]! * along[1]!;
    const share = lengthSquared === 0 ? 0 : Math.min(1, Math.max(0, ((point[0] - from[0]) * along[0]! + (point[1] - from[1]) * along[1]!) / lengthSquared));
    return Math.hypot(point[0] - from[0] - share * along[0]!, point[1] - from[1] - share * along[1]!);
};

const segmentsNear = (outline: Point2[], centre: Point2, reach: number): [Point2, Point2][] => outline.slice(0, -1).flatMap((point, index): [Point2, Point2][] => {
    const next = outline[index + 1]!;
    return Math.hypot(point[0] - centre[0], point[1] - centre[1]) <= reach || Math.hypot(next[0] - centre[0], next[1] - centre[1]) <= reach ? [[point, next]] : [];
});

const gapBetween = (first: [Point2, Point2][], second: [Point2, Point2][]): number => {
    let gap = Number.POSITIVE_INFINITY;
    for (const [a, b] of first) {
        for (const [c, d] of second) {
            if (crosses(a, b, c, d)) {
                return 0;
            }
            gap = Math.min(gap, toSegment(a, c, d), toSegment(b, c, d), toSegment(c, a, b), toSegment(d, a, b));
        }
    }
    return gap;
};

const CLEAN_SET = { sunTeeth: 15, planetTeeth: 21, planets: 3 } as const;
const INTERFERING_SET = { sunTeeth: 18, planetTeeth: 12, planets: 3 } as const;
const NOT_ASSEMBLABLE_SET = { sunTeeth: 19, planetTeeth: 12, planets: 3 } as const;
const NOT_CLEAR_SET = { sunTeeth: 12, planetTeeth: 12, planets: 6 } as const;
const TOO_SMALL_SET = { sunTeeth: 10, planetTeeth: 10, planets: 3 } as const;
const FLANK_GAP = BACKLASH * Math.cos(PRESSURE_ANGLE_RADIANS);
const FLANK_GAP_TOLERANCE = 0.02 * FLANK_GAP;
const WORKING_DEPTH = 2 * MODULE;
const REVOLUTION_STEPS = [0, 47.3, 113.9, 181.7, 262.4, 360];
const SEED = 20261018;

type SetSpec = { readonly sunTeeth: number; readonly planetTeeth: number; readonly planets: number };

interface MeshingGaps {
    sun: number[];
    ring: number[];
    neighbours: number[];
}

const layOut = (spec: SetSpec): PlanetarySet => engineering.planetarySet({ module: MODULE, ...spec });

const carrierTurnPerRingTooth = (set: PlanetarySet): number => 360 / set.ringTeeth;

describe("OCCT design: a planetary gearbox laid out by planetarySet and turned on its joints", () => {
    let occt: OCCTService;

    beforeAll(async () => {
        const kernel = await createBitbybitOcct();
        occt = new OCCTService(kernel);
    }, 120_000);

    const documentsOf = (set: PlanetarySet): Models.OCCT.DesignPartDocument[] => [gearDocument, ringDocument, carrierDocument(set)];

    const clashesAt = (spec: SetSpec, carrier: number, suppressed: readonly string[] = []): Models.OCCT.DesignClash[] => {
        const set = layOut(spec);
        const document = gearbox(set, spec.sunTeeth, spec.planetTeeth);
        return occt.design.clashes({
            document: { ...document, components: document.components.map(component => suppressed.includes(component.id) ? { ...component, suppressed: true } : component) },
            documents: documentsOf(set),
            parameters: { carrier },
        });
    };

    const builtAt = (spec: SetSpec, parameters: Record<string, number>, drive?: GearboxDrive): Models.OCCT.DesignBuildResult<{ delete: () => void }> => {
        const set = layOut(spec);
        return occt.design.build({ document: gearbox(set, spec.sunTeeth, spec.planetTeeth, drive), documents: documentsOf(set), parameters });
    };

    const meshingGaps = (spec: SetSpec, parameters: Record<string, number>, drive?: GearboxDrive): MeshingGaps => {
        const set = layOut(spec);
        const build = builtAt(spec, parameters, drive);
        build.parts.forEach(part => part.shape.delete());
        const worldOf = (path: string): Inputs.Base.TransformMatrix => build.components!.find(component => component.path === path)!.world;
        const centreOf = (path: string): Point2 => [worldOf(path)[12], worldOf(path)[13]];
        const spur = (teeth: number): Inputs.Base.Point3[] => engineering.spurGearOutline({ module: MODULE, teeth, backlash: BACKLASH });
        const sunReach = MODULE * (spec.sunTeeth / 2 + 2);
        const planetReach = MODULE * (spec.planetTeeth / 2 + 2);
        const sun = placed(spur(spec.sunTeeth), worldOf("sun"));
        const ring = placed(engineering.ringGearOutline({ module: MODULE, teeth: set.ringTeeth, backlash: BACKLASH }), worldOf("ring"));
        const paths = set.planetCentres.map((_, index) => `planet${index}`);
        const planets = paths.map(path => placed(spur(spec.planetTeeth), worldOf(path)));
        const nextOf = (index: number): number => (index + 1) % planets.length;
        return {
            sun: planets.map((planet, index) => gapBetween(segmentsNear(sun, centreOf(paths[index]!), planetReach), segmentsNear(planet, [0, 0], sunReach))),
            ring: planets.map((planet, index) => gapBetween(segmentsNear(ring, centreOf(paths[index]!), planetReach), segmentsNear(planet, centreOf(paths[index]!), planetReach))),
            neighbours: planets.map((planet, index) => gapBetween(segmentsNear(planet, centreOf(paths[nextOf(index)]!), planetReach), segmentsNear(planets[nextOf(index)]!, centreOf(paths[index]!), planetReach))),
        };
    };

    const withinFlankGap = (gap: number): boolean => Math.abs(gap - FLANK_GAP) <= FLANK_GAP_TOLERANCE;

    describe("a clean set: a 15-tooth sun, three 21-tooth planets and the 57-tooth ring", () => {
        it("should be laid out as meshing, clear of each other and free of interference, the sun turning 1 + 57 / 15 times for a turn of the carrier", () => {
            // Act
            const set = layOut(CLEAN_SET);

            // Assert
            expect([set.ringTeeth, set.centreDistance, set.assemblable, set.planetsClear, set.interferes]).toEqual([57, 18, true, true, false]);
            expect(set.ratio).toBe(1 + 57 / 15);
        });

        it("should turn the carrier through a whole revolution with the ring held and no two gears clashing at any step", () => {
            // Act
            const clashes = REVOLUTION_STEPS.map(carrier => clashesAt(CLEAN_SET, carrier));

            // Assert
            expect(clashes).toEqual(REVOLUTION_STEPS.map(() => []));
        });

        it("should keep every planet in mesh with the sun and the ring wherever the carrier stands, each pair of flanks the backlash apart", () => {
            // Act & Assert
            fc.assert(fc.property(fc.double({ min: 0, max: 360, noNaN: true }), carrier => {
                const gaps = meshingGaps(CLEAN_SET, { carrier });
                expect([...gaps.sun, ...gaps.ring].filter(gap => !withinFlankGap(gap))).toEqual([]);
            }), { seed: SEED, numRuns: 8 });
        });

        it("should place every planet the set's centre distance from the sun, its tips reaching the working depth of two modules past the sun's tip circle", () => {
            // Arrange
            const set = layOut(CLEAN_SET);
            const sunTip = MODULE * (CLEAN_SET.sunTeeth / 2 + 1);
            const planetTip = MODULE * (CLEAN_SET.planetTeeth / 2 + 1);

            // Act
            const build = builtAt(CLEAN_SET, { carrier: 47.3 });
            build.parts.forEach(part => part.shape.delete());

            // Assert
            const distances = set.planetCentres.map((_, index) => {
                const world = build.components!.find(component => component.path === `planet${index}`)!.world;
                return Math.hypot(world[12], world[13]);
            });
            expect(distances.map(distance => Math.abs(distance - set.centreDistance) < 1e-9)).toEqual([true, true, true]);
            expect(sunTip + planetTip - set.centreDistance).toBeCloseTo(WORKING_DEPTH, 12);
        });

        it("should turn the sun by the set's ratio for every degree of the carrier and count one sun, one ring, one carrier and three planets", () => {
            // Arrange
            const set = layOut(CLEAN_SET);

            // Act
            const build = builtAt(CLEAN_SET, { carrier: 47.3 });
            build.parts.forEach(part => part.shape.delete());

            // Assert
            const angleOf = (path: string): number => build.joints!.find(joint => joint.path === path)!.angle;
            expect(angleOf("sunShaft") / angleOf("carrierShaft")).toBeCloseTo(set.ratio, 12);
            expect(build.bom!.map(line => line.quantity).sort()).toEqual([1, 1, 1, 3]);
        });

        it("should run out of mesh at once when the sun turns at the ratio of a held carrier, ring over sun, instead", () => {
            // Arrange
            const heldCarrierRatio: GearboxDrive = { ...ringHeld, sun: "carrier * ringTeeth / sunTeeth" };

            // Act
            const gaps = meshingGaps(CLEAN_SET, { carrier: 3 }, heldCarrierRatio);

            // Assert
            expect(gaps.sun).toEqual([0, 0, 0]);
        });
    });

    describe("sets planetarySet warns about", () => {
        it("should not let the ring mesh with every planet of a set it calls not assemblable, at its own ring rotation or any other", () => {
            // Arrange
            const set = layOut(NOT_ASSEMBLABLE_SET);

            // Act
            const own = meshingGaps(NOT_ASSEMBLABLE_SET, { carrier: 0 });

            // Assert
            expect(set.assemblable).toBe(false);
            expect([withinFlankGap(own.ring[0]!), own.ring[1], own.ring[2]]).toEqual([true, 0, 0]);
            fc.assert(fc.property(fc.double({ min: 0, max: 360 / set.ringTeeth, noNaN: true }), ringRotation => {
                expect(meshingGaps(NOT_ASSEMBLABLE_SET, { carrier: 0, ringRotation }).ring).toContain(0);
            }), { seed: SEED, numRuns: 5 });
        });

        it("should run neighbouring planets of a set it calls not clear into each other, their outlines crossing and their solids sharing volume", () => {
            // Arrange
            const set = layOut(NOT_CLEAR_SET);
            const others = ["planet2", "planet3", "planet4", "planet5"];

            // Act
            const gaps = meshingGaps(NOT_CLEAR_SET, { carrier: 0 });
            const clashes = clashesAt(NOT_CLEAR_SET, 0, others);

            // Assert
            expect(set.planetsClear).toBe(false);
            expect(gaps.neighbours).toEqual([0, 0, 0, 0, 0, 0]);
            expect(clashes.map(clash => [clash.components, clash.volume > 0])).toEqual([[["planet0", "planet1"], true]]);
        });

        it("should bring the ring's tips into a planet's roots past the backlash when it says the set interferes, and never when it says it does not", () => {
            // Arrange
            const interfering = layOut(INTERFERING_SET);
            const clean = layOut(CLEAN_SET);
            const halfCycle = (set: PlanetarySet): number[] => Array.from({ length: 7 }, (_, step) => carrierTurnPerRingTooth(set) / 2 * step / 6);

            // Act
            const closestOf = (spec: SetSpec, set: PlanetarySet): number => Math.min(...halfCycle(set).flatMap(carrier => meshingGaps(spec, { carrier }).ring));

            // Assert
            expect([interfering.interferes, clean.interferes]).toEqual([true, false]);
            expect(closestOf(INTERFERING_SET, interfering)).toBeLessThan(FLANK_GAP / 2);
            expect(withinFlankGap(closestOf(CLEAN_SET, clean))).toBe(true);
        });

        it("should refuse a set whose ring would be too small for its teeth to start outside the base circle, as the ring's own part document does at its teeth", () => {
            // Act
            const refusal = ((): unknown => {
                try {
                    return layOut(TOO_SMALL_SET);
                } catch (error) {
                    return error;
                }
            })();
            const ring = occt.design.build({ document: ringDocument, parameters: { teeth: TOO_SMALL_SET.sunTeeth + 2 * TOO_SMALL_SET.planetTeeth } });

            // Assert
            expect(refusal).toBeInstanceOf(InputError);
            expect((refusal as InputError).property).toBe("planetTeeth");
            expect(ring.parts).toEqual([]);
            expect(ring.report.map(entry => [entry.id, entry.status])).toEqual([["profile", "failed"], ["ring", "skipped"]]);
            expect(ring.report[0]!.messages).toEqual(["/features/0/loops/1/pen/0/teeth: The tips of the teeth reach inside the base circle, where no involute runs: give the ring more `teeth` or a smaller `addendum`."]);
        });
    });
});
