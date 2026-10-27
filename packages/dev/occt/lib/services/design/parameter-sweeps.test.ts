import { beforeAll, describe, expect, it } from "vitest";
import fc from "fast-check";
import { runInNewContext } from "node:vm";
import * as ts from "typescript";
import type { TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OCCTService } from "../../occ-service";
import * as Inputs from "../../api/inputs";
import type * as Models from "../../api/models";

type Document = Models.OCCT.DesignPartDocument;
type Built = Models.OCCT.DesignBuildResult<TopoDS_Shape>;
type Drawn = { shape: TopoDS_Shape; properties: Record<string, unknown> };

const SEED = 20261018;
const BOX = { width: 20, length: 12, height: 8 } as const;

const rectangle = (id: string, width: string | number, depth: string | number, on: Models.OCCT.DesignSketchPlacement = { plane: "XY" }): Models.OCCT.DesignSketchFeature => ({
    id,
    type: "sketch",
    on,
    start: [0, 0],
    pen: [
        { type: "hLine", id: "bottom", length: width },
        { type: "vLine", id: "right", length: depth },
        { type: "hLine", id: "top", length: typeof width === "number" ? -width : `-(${width})` },
        { type: "close", id: "left" },
    ],
});

const bracket: Document = {
    schemaVersion: 1,
    parameters: {
        width: { value: 40, min: 1 },
        depth: { value: 20, min: 1 },
        height: { value: 8, min: 0.5 },
        radius: { value: 3, min: 0 },
        hole: { value: 4, min: 0.1 },
    },
    features: [
        rectangle("base", "width", "depth"),
        { id: "plate", type: "extrude", profile: "base", distance: "height" },
        { id: "corners", type: "fillet", body: "plate", radius: "radius", edges: { between: [{ of: "plate", role: "side" }, { of: "plate", role: "side" }], count: 4 } },
        {
            id: "holes", type: "hole", body: "plate", on: { of: "plate", role: "end", count: 1 }, diameter: "hole",
            at: [{ id: "left", x: "width / 4", y: "depth / 2" }, { id: "right", x: "3 * width / 4", y: "depth / 2" }],
        },
    ],
};

const bracketVolume = (values: BracketValues): number => {
    const { width, depth, height, radius, hole } = values;
    return (width * depth - (4 - Math.PI) * radius * radius - 2 * Math.PI * hole * hole / 4) * height;
};

interface BracketValues {
    width: number;
    depth: number;
    height: number;
    radius: number;
    hole: number;
}

const bracketValues: fc.Arbitrary<BracketValues> = fc.record({
    width: fc.integer({ min: 160, max: 800 }).map(value => value / 10),
    depth: fc.integer({ min: 80, max: 400 }).map(value => value / 10),
    height: fc.integer({ min: 5, max: 200 }).map(value => value / 10),
    radiusShare: fc.integer({ min: 1, max: 95 }),
    holeShare: fc.integer({ min: 5, max: 60 }),
}).map(({ width, depth, height, radiusShare, holeShare }) => ({
    width, depth, height,
    radius: Math.min(width, depth) / 2 * radiusShare / 100,
    hole: Math.min(width / 4, depth / 2) * holeShare / 100,
}));

const boxDocument = (...extra: Models.OCCT.DesignFeature[]): Document => ({
    schemaVersion: 1,
    features: [
        { id: "block", type: "operation", operation: "occt.shapes.solid.createBox", params: { ...BOX, center: [0, 0, 0] } },
        ...extra,
    ],
});

const javascriptOf = (code: string): string => ts.transpileModule(code, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;

describe("OCCT design: real parts swept through their parameters", () => {
    let occt: OCCTService;

    beforeAll(async () => {
        occt = new OCCTService(await createBitbybitOcct());
    }, 120_000);

    const volumeOf = (shape: TopoDS_Shape): number => occt.shapes.solid.getSolidVolume({ shape });
    const named = (part: Models.OCCT.DesignBuiltPart<TopoDS_Shape>, name: string): number => part.faceNames.filter(names => names.includes(name)).length;
    const statusesOf = (built: Built): string[] => built.report.map(entry => `${entry.id}:${entry.status}`);
    const released = <T>(built: Built, read: (built: Built) => T): T => {
        try {
            return read(built);
        } finally {
            built.parts.forEach(part => part.shape.delete());
        }
    };
    const signatureOf = (built: Built): { hash: string; names: string[][]; volume: number } => released(built, result => ({ hash: result.parts[0]!.shapeHash, names: result.parts[0]!.faceNames, volume: volumeOf(result.parts[0]!.shape) }));

    const execute = async (code: string): Promise<Drawn[]> => {
        const program = javascriptOf(code).replace(/for \(const part of parts\) \{[\s\S]*?\}\n/, "");
        const bitbybit = { occt, draw: { drawAnyAsync: (): Promise<number> => Promise.resolve(0) } };
        return runInNewContext(`(async () => {\n${program}\nreturn parts;\n})()`, { bitbybit, Bit: { Inputs } }) as Promise<Drawn[]>;
    };

    describe("a plate with rounded corners and two holes", () => {
        it("should build every size in range into the volume its dimensions give, the rounds and each hole's wall found by name", () => {
            // Act & Assert
            fc.assert(fc.property(bracketValues, values => {
                released(occt.design.build({ document: bracket, parameters: { ...values } }), built => {
                    const part = built.parts[0]!;
                    expect(statusesOf(built)).toEqual(["base:ok", "plate:ok", "corners:ok", "holes:ok"]);
                    expect(volumeOf(part.shape)).toBeCloseTo(bracketVolume(values), 6);
                    expect([named(part, "corners:round"), named(part, "holes:wall:left"), named(part, "holes:wall:right"), named(part, "plate:end")]).toEqual([4, 1, 1, 1]);
                    expect(part.faceNames.filter(names => names.length === 0)).toEqual([]);
                });
            }), { seed: SEED, numRuns: 6 });
        });

        it("should give the same shape and names cold, from the cache, and after an edit is undone and redone", () => {
            // Arrange
            const first = { width: 44, depth: 22, height: 6, radius: 4, hole: 3 };
            const second = { width: 50, depth: 22, height: 6, radius: 2, hole: 5 };

            // Act
            const cold = signatureOf(occt.design.build({ document: bracket, parameters: first }));
            const cached = signatureOf(occt.design.build({ document: bracket, parameters: first }));
            const edited = signatureOf(occt.design.build({ document: bracket, parameters: second }));
            const undone = signatureOf(occt.design.build({ document: bracket, parameters: first }));
            const redone = signatureOf(occt.design.build({ document: bracket, parameters: second }));

            // Assert
            expect(cached).toEqual(cold);
            expect(undone).toEqual(cold);
            expect(redone).toEqual(edited);
            expect(edited.hash).not.toBe(cold.hash);
        });

        it("should write TypeScript that builds the very volume the build does, whatever the sizes", async () => {
            // Arrange
            const samples = fc.sample(bracketValues, { seed: SEED, numRuns: 3 });

            // Act
            const pairs = await Promise.all(samples.map(async values => {
                const code = occt.design.toTypeScript({ document: bracket, parameters: { ...values } });
                const parts = await execute(code);
                const built = signatureOf(occt.design.build({ document: bracket, parameters: { ...values } })).volume;
                return [volumeOf(parts[0]!.shape), built];
            }));

            // Assert
            expect(pairs.map(([program, built]) => program === built)).toEqual(samples.map(() => true));
        });

        it("should write TypeScript that builds the very shape the build does on a face turned to any angle, a sketch extruded along its normal", async () => {
            // Arrange
            const turned = (tilt: number): Document => ({
                schemaVersion: 1,
                parameters: { tilt },
                features: [
                    rectangle("base", 30, 20),
                    { id: "plate", type: "extrude", profile: "base", distance: 4 },
                    { id: "turn", type: "transform", body: "plate", rotate: ["tilt", "tilt / 3", 0] },
                    { id: "lug", type: "sketch", on: { face: { of: "plate", role: "end", count: 1 }, direction: [1, 0, 0] }, start: [5, 5], pen: [{ type: "hLine", length: 6 }, { type: "vLine", length: 4 }, { type: "hLine", length: -6 }, { type: "close" }] },
                    { id: "raised", type: "extrude", profile: "lug", distance: 3 },
                ],
            });
            const tilts = fc.sample(fc.integer({ min: 1, max: 89 }), { seed: SEED, numRuns: 3 });
            const cornersOf = (shape: TopoDS_Shape): number[] => {
                const box = occt.analysis.measure.tightBoundingBox({ shape });
                return [...box.min, ...box.max];
            };

            // Act
            const compared = await Promise.all(tilts.map(async tilt => {
                const parts = await execute(occt.design.toTypeScript({ document: turned(tilt) }));
                const built = occt.design.build({ document: turned(tilt) });
                return released(built, result => {
                    const program = parts.find(part => Math.abs(volumeOf(part.shape) - 72) < 1e-6)!;
                    const made = result.parts.find(part => part.body === "raised")!;
                    return cornersOf(program.shape).every((value, index) => Object.is(value, cornersOf(made.shape)[index]));
                });
            }));

            // Assert
            expect(compared).toEqual(tilts.map(() => true));
        });

        it("should refuse a fillet of exactly half the plate's depth, which would round it into a slot, and build one a billionth smaller into a valid solid", () => {
            // Arrange
            const slot = { width: 40, depth: 20, height: 5, radius: 10, hole: 4 };
            const hairSmaller = { ...slot, radius: 10 - 1e-9 };

            // Act
            const refused = occt.design.build({ document: bracket, parameters: slot });
            const rounded = occt.design.build({ document: bracket, parameters: hairSmaller });

            // Assert
            released(refused, result => expect(statusesOf(result)).toEqual(["base:ok", "plate:ok", "corners:failed", "holes:skipped"]));
            released(rounded, result => {
                expect(statusesOf(result)).toEqual(["base:ok", "plate:ok", "corners:ok", "holes:ok"]);
                expect(occt.shapeFix.isValid({ shape: result.parts[0]!.shape })).toBe(true);
                expect(volumeOf(result.parts[0]!.shape)).toBeCloseTo(bracketVolume(hairSmaller), 6);
            });
        });
    });

    describe("offsets of a box, every face keeping its name", () => {
        const offsetBy = (distance: number, joinType?: string): Document => boxDocument({
            id: "grown", type: "operation", operation: joinType === undefined ? "occt.operations.offset" : "occt.operations.offsetAdv",
            params: { shape: { body: "block" }, distance, tolerance: 1e-6, ...(joinType === undefined ? {} : { joinType, removeIntEdges: false }) }, body: "block",
        });
        const { width: a, length: b, height: c } = BOX;
        const steinerVolume = (distance: number): number => a * b * c + 2 * (a * b + b * c + c * a) * distance + Math.PI * (a + b + c) * distance ** 2 + 4 / 3 * Math.PI * distance ** 3;
        const sharpVolume = (distance: number): number => (a + 2 * distance) * (b + 2 * distance) * (c + 2 * distance);

        it("should grow a box outward with round joins into the volume Steiner's formula gives, its six faces keeping their names and its edges named as the offset's sides", () => {
            // Act & Assert
            fc.assert(fc.property(fc.integer({ min: 1, max: 60 }).map(value => value / 10), distance => {
                released(occt.design.build({ document: offsetBy(distance) }), built => {
                    const part = built.parts[0]!;
                    expect(volumeOf(part.shape)).toBeCloseTo(steinerVolume(distance), 4);
                    expect([named(part, "block:face"), named(part, "grown:side")]).toEqual([6, 12]);
                });
            }), { seed: SEED, numRuns: 5 });
        });

        it("should shrink a box inward into the smaller box, its six faces keeping their names, down to just short of its thinnest half", () => {
            // Act & Assert
            fc.assert(fc.property(fc.integer({ min: 1, max: 39 }).map(value => -value / 10), distance => {
                released(occt.design.build({ document: offsetBy(distance) }), built => {
                    const part = built.parts[0]!;
                    expect(volumeOf(part.shape)).toBeCloseTo(sharpVolume(distance), 4);
                    expect(named(part, "block:face")).toBe(6);
                    expect(part.faceNames).toHaveLength(6);
                });
            }), { seed: SEED, numRuns: 5 });
        });

        it("should grow a box with sharp joins into the larger box, keeping exactly its six faces and their names", () => {
            // Act & Assert
            fc.assert(fc.property(fc.integer({ min: 1, max: 60 }).map(value => value / 10), distance => {
                released(occt.design.build({ document: offsetBy(distance, "intersection") }), built => {
                    const part = built.parts[0]!;
                    expect(volumeOf(part.shape)).toBeCloseTo(sharpVolume(distance), 4);
                    expect(part.faceNames).toEqual(Array.from({ length: 6 }, () => ["block:face"]));
                });
            }), { seed: SEED, numRuns: 4 });
        });

        it("should fail an inward offset of half the box's thinnest side, which leaves no solid, rather than hand on a body of no volume", () => {
            // Act
            const built = occt.design.build({ document: offsetBy(-BOX.height / 2) });

            // Assert
            released(built, result => {
                expect(result.parts.map(part => [volumeOf(part.shape), occt.shapeFix.isValid({ shape: part.shape })])).toEqual([]);
                expect(result.report[1]!.status).toBe("failed");
            });
        });
    });

    describe("a box hollowed through its top", () => {
        const shelled = (thickness: number): Document => boxDocument({ id: "hollow", type: "shell", body: "block", thickness, open: { of: "block", role: "face", filter: { select: "facing", direction: [0, 0, 1] }, count: 1 } });

        it("should leave walls of the thickness asked, the open face its rim and the five inner walls named inner, for every thickness short of half its narrowest side", () => {
            // Act & Assert
            fc.assert(fc.property(fc.integer({ min: 1, max: 39 }).map(value => value / 10), thickness => {
                released(occt.design.build({ document: shelled(thickness) }), built => {
                    const part = built.parts[0]!;
                    const { width: alongX, height: alongY, length: alongZ } = BOX;
                    expect(volumeOf(part.shape)).toBeCloseTo(alongX * alongY * alongZ - (alongX - 2 * thickness) * (alongY - 2 * thickness) * (alongZ - thickness), 4);
                    expect([named(part, "hollow:rim"), named(part, "hollow:inner")]).toEqual([1, 5]);
                });
            }), { seed: SEED, numRuns: 5 });
        });
    });

    describe("patterns of two copies and more", () => {
        const pinned = (count: number): Document => ({
            schemaVersion: 1,
            features: [
                { id: "base", type: "sketch", on: { plane: "XY" }, pen: [{ type: "circle", id: "rim", centre: [0, 0], radius: 1 }] },
                { id: "pin", type: "extrude", profile: "base", distance: 4 },
                { id: "row", type: "linearPattern", body: "pin", direction: [1, 0, 0], spacing: 3, count },
            ],
        });

        it("should make as many separate pins as the count asks, each copy's side found by its index and the original's by none", () => {
            // Act & Assert
            fc.assert(fc.property(fc.integer({ min: 2, max: 12 }), count => {
                released(occt.design.build({ document: pinned(count) }), built => {
                    const part = built.parts[0]!;
                    expect(volumeOf(part.shape)).toBeCloseTo(count * Math.PI * 4, 6);
                    const sides = Array.from({ length: count - 1 }, (_, index) => named(part, `pin:side:base.rim@row#${index + 1}`));
                    expect([named(part, "pin:side:base.rim"), ...sides]).toEqual(Array.from({ length: count }, () => 1));
                });
            }), { seed: SEED, numRuns: 4 });
        });
    });
    describe("a filter that finds faces alike on a symmetric part", () => {
        const corner = (step: number): [string, string] => [`size * cos(${step * 60})`, `size * sin(${step * 60})`];
        const hexagonalPull: Document = {
            schemaVersion: 1,
            parameters: { size: 5 },
            features: [
                {
                    id: "hex", type: "sketch", on: { plane: "XY" }, start: corner(0),
                    pen: [...[1, 2, 3, 4, 5].map((step): Models.OCCT.DesignPenCommand => ({ type: "line", id: `side${step - 1}`, to: corner(step) })), { type: "close", id: "side5" }],
                },
                { id: "prism", type: "extrude", profile: "hex", distance: 6 },
                { id: "pull", type: "pushPull", body: "prism", face: { of: "prism", role: "side", filter: { select: "nearest", point: [0, 0, 3], count: 1 }, count: 1 }, distance: 1 },
            ],
        };

        it("should push the same side of a hexagonal prism whatever its size, the sides being as near its axis as each other", () => {
            // Act
            const pulled = [5, 6, 7, 8, 13].map(size => released(occt.design.build({ document: hexagonalPull, parameters: { size } }), built => built.parts[0]!.faceNames.find(names => names.includes("pull:end"))!.find(name => name.startsWith("prism:side:"))));

            // Assert
            expect(new Set(pulled).size).toBe(1);
        });
    });
    describe("pockets and bosses on a plate's face", () => {
        const sunkAndRaised = (pocket: number, boss: number): Document => ({
            schemaVersion: 1,
            parameters: { pocket, boss },
            features: [
                rectangle("base", 40, 20),
                { id: "plate", type: "extrude", profile: "base", distance: 10 },
                { id: "dent", type: "sketch", on: { face: { of: "plate", role: "end", count: 1 } }, start: [4, 4], pen: [{ type: "hLine", id: "south", length: 10 }, { type: "vLine", id: "east", length: 8 }, { type: "hLine", id: "north", length: -10 }, { type: "close", id: "west" }] },
                { id: "dip", type: "pocket", profile: "dent", body: "plate", distance: "pocket" },
                { id: "lug", type: "sketch", on: { face: { of: "plate", role: "end", count: 1 } }, start: [24, 6], pen: [{ type: "hLine", id: "south", length: 8 }, { type: "vLine", id: "east", length: 6 }, { type: "hLine", id: "north", length: -8 }, { type: "close", id: "west" }] },
                { id: "raise", type: "boss", profile: "lug", body: "plate", distance: "boss" },
            ],
        });

        it("should sink a pocket and raise a boss of any depth short of the plate's, the volume following both and every wall, floor and top found by name", () => {
            // Act & Assert
            fc.assert(fc.property(fc.integer({ min: 1, max: 99 }).map(value => value / 10), fc.integer({ min: 1, max: 200 }).map(value => value / 10), (pocket, boss) => {
                released(occt.design.build({ document: sunkAndRaised(pocket, boss) }), built => {
                    const part = built.parts[0]!;
                    expect(statusesOf(built)).toEqual(["base:ok", "plate:ok", "dent:ok", "dip:ok", "lug:ok", "raise:ok"]);
                    expect(volumeOf(part.shape)).toBeCloseTo(40 * 20 * 10 - 10 * 8 * pocket + 8 * 6 * boss, 6);
                    expect([named(part, "dip:end"), named(part, "raise:end"), ...["south", "east", "north", "west"].flatMap(side => [named(part, `dip:side:dent.${side}`), named(part, `raise:side:lug.${side}`)])]).toEqual(Array.from({ length: 10 }, () => 1));
                });
            }), { seed: SEED, numRuns: 6 });
        });
    });
    describe("a plate cut by many tools at once", () => {
        const CELL = 10;
        const PLATE = { width: 40, depth: 40, height: 10 } as const;
        interface Tool { column: number; row: number; size: number; lift: number }
        const cut = (tools: readonly Tool[]): Document => ({
            schemaVersion: 1,
            features: [
                rectangle("base", PLATE.width, PLATE.depth),
                { id: "plate", type: "extrude", profile: "base", distance: PLATE.height },
                ...tools.map(({ column, row, size, lift }, index): Models.OCCT.DesignFeature => ({
                    id: `tool${index}`, type: "operation", operation: "occt.shapes.solid.createBox",
                    params: { width: size, length: size, height: CELL, center: [(column + 0.5) * CELL, lift, (row + 0.5) * CELL], originOnCenter: true },
                })),
                { id: "cuts", type: "boolean", operation: "difference", body: "plate", tools: tools.map((_, index) => `tool${index}`) },
            ],
        });
        const overlap = (from: number, to: number, low: number, high: number): number => Math.max(0, Math.min(to, high) - Math.max(from, low));
        const removedBy = ({ column, row, size, lift }: Tool): number => {
            const half = size / 2;
            const x = (column + 0.5) * CELL;
            const z = (row + 0.5) * CELL;
            return overlap(x - half, x + half, 0, PLATE.width) * overlap(z - half, z + half, 0, PLATE.height) * overlap(lift - CELL / 2, lift + CELL / 2, 0, PLATE.depth);
        };
        const tools = fc.uniqueArray(fc.record({
            column: fc.integer({ min: -1, max: 4 }),
            row: fc.integer({ min: -1, max: 1 }),
            size: fc.constantFrom(2, 5, 9.5, 10),
            lift: fc.constantFrom(-4, 5, 20, 35, 44),
        }), { minLength: 1, maxLength: 9, selector: tool => `${tool.column},${tool.row},${tool.lift}` });

        it("should take exactly the tools' share of the plate away, whether they meet, touch or miss it, keeping the plate's names", () => {
            // Act & Assert
            fc.assert(fc.property(tools, chosen => {
                released(occt.design.build({ document: cut(chosen) }), built => {
                    const plate = built.parts.find(part => part.body === "plate")!;
                    const removed = chosen.reduce((sum, tool) => sum + removedBy(tool), 0);
                    expect(volumeOf(plate.shape)).toBeCloseTo(PLATE.width * PLATE.depth * PLATE.height - removed, 6);
                    expect(named(plate, "plate:end") + named(plate, "plate:start")).toBeGreaterThanOrEqual(1);
                    expect(plate.faceNames.filter(names => names.length === 0)).toEqual([]);
                });
            }), { seed: SEED, numRuns: 10 });
        });
    });

    describe("the fillet probe on a plate's corners", () => {
        it("should find a largest radius that builds a valid plate and a smallest failing one that does not", () => {
            // Arrange
            const values = { width: 30, depth: 12, height: 4, radius: 1, hole: 2 };

            // Act
            const probe = occt.design.probeFillet({ document: bracket, feature: "corners", parameters: values });
            const atLargest = occt.design.build({ document: bracket, parameters: { ...values, radius: probe.largest! } });
            const atFailing = occt.design.build({ document: bracket, parameters: { ...values, radius: probe.smallestFailing! } });

            // Assert
            expect(probe.builds).toBe(true);
            expect(probe.largest!).toBeLessThanOrEqual(6);
            expect(probe.smallestFailing! / probe.largest!).toBeLessThan(1.05);
            released(atLargest, result => {
                expect(statusesOf(result)).toEqual(["base:ok", "plate:ok", "corners:ok", "holes:ok"]);
                expect(occt.shapeFix.isValid({ shape: result.parts[0]!.shape })).toBe(true);
            });
            released(atFailing, result => expect(result.parts.every(part => !occt.shapeFix.isValid({ shape: part.shape })) || statusesOf(result).includes("corners:failed")).toBe(true));
        }, 60_000);
    });
});
