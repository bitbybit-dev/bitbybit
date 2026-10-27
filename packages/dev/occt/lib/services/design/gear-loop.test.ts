import { beforeAll, describe, expect, it } from "vitest";
import fc from "fast-check";
import type { TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OCCTService } from "../../occ-service";
import type * as Models from "../../api/models";

type Document = Models.OCCT.DesignPartDocument;

const geared = (gear: Partial<Models.OCCT.DesignGearCommand>, extra: Models.OCCT.DesignFeature[] = []): Document => ({
    schemaVersion: 1,
    parameters: { teeth: 20 },
    features: [
        { id: "profile", type: "sketch", on: { plane: "XY" }, loops: [{ pen: [{ type: "gear", id: "teeth", centre: [0, 0], module: 2, teeth: "teeth", ...gear }] }, { pen: [{ type: "circle", id: "bore", centre: [0, 0], radius: 4 }] }] },
        { id: "gear", type: "extrude", profile: "profile", distance: 6 },
        ...extra,
    ],
});

describe("OCCT design: gear loops in sketches", () => {
    let occt: OCCTService;

    beforeAll(async () => {
        const kernel = await createBitbybitOcct();
        occt = new OCCTService(kernel);
    }, 120_000);

    const facesNamed = (part: Models.OCCT.DesignBuiltPart<TopoDS_Shape>, name: string): number[] => part.faceNames.flatMap((names, index) => names.includes(name) ? [index] : []);
    const issuesOf = (document: Document): string[] => occt.design.validate({ document }).map(issue => `${issue.path}: ${issue.message}`);

    it("should draw a gear as a loop of its own, with the bore as a second loop, as parts.mechanical.gears.spurGearProfile draws it", () => {
        // Arrange
        const profile = occt.parts.mechanical.gears.spurGearProfile({ module: 2, teeth: 20, frame: { origin: [0, 0, 0], normal: [0, 0, 1], direction: [1, 0, 0] } });
        const expected = (occt.shapes.face.getFaceArea({ shape: profile }) - Math.PI * 16) * 6;

        // Act
        const gear = occt.design.build({ document: geared({}) }).parts[0]!;

        // Assert
        expect(occt.shapes.solid.getSolidVolume({ shape: gear.shape })).toBeCloseTo(expected, 4);
        expect(occt.shapeFix.isValid({ shape: gear.shape })).toBe(true);
    });

    it("should name the gear's faces by its id and their part, so references find the tips, the flanks and the roots", () => {
        // Act
        const gear = occt.design.build({ document: geared({}) }).parts[0]!;

        // Assert
        expect(facesNamed(gear, "gear:side:profile.teeth.tip")).toHaveLength(20);
        expect(facesNamed(gear, "gear:side:profile.teeth.flank").length).toBeGreaterThanOrEqual(80);
        expect(facesNamed(gear, "gear:side:profile.teeth.root")).toHaveLength(60);
        expect(facesNamed(gear, "gear:side:profile.bore")).toHaveLength(1);
    });

    it("should let a later feature round the edges between the tips and the end face by those names", () => {
        // Arrange
        const document = geared({}, [{
            id: "tipRound",
            type: "chamfer",
            body: "gear",
            distance: 0.2,
            edges: { between: [{ of: "gear", role: "end" }, { of: "gear", role: "side", from: "profile.teeth.tip" }], count: 20 },
        }]);

        // Act
        const result = occt.design.build({ document });

        // Assert
        expect(result.report.map(entry => entry.status)).toEqual(["ok", "ok", "ok"]);
    });

    it("should follow its numbers as expressions of the parameters, more teeth giving more tips", () => {
        // Act
        const gear = occt.design.build({ document: { ...geared({}), parameters: { teeth: 24 } } }).parts[0]!;

        // Assert
        expect(facesNamed(gear, "gear:side:profile.teeth.tip")).toHaveLength(24);
    });

    it("should draw the teeth of a ring gear inside a larger loop when internal, as parts.mechanical.gears.ringGearProfile draws the ring", () => {
        // Arrange
        const ring: Document = {
            schemaVersion: 1,
            features: [
                { id: "profile", type: "sketch", on: { plane: "XY" }, loops: [{ pen: [{ type: "circle", id: "rim", centre: [0, 0], radius: 67.5 }] }, { pen: [{ type: "gear", id: "teeth", internal: true, centre: [0, 0], module: 2, teeth: 60 }] }] },
                { id: "ring", type: "extrude", profile: "profile", distance: 6 },
            ],
        };
        const area = occt.shapes.face.getFaceArea({ shape: occt.parts.mechanical.gears.ringGearProfile({ module: 2, teeth: 60, rim: 5, frame: { origin: [0, 0, 0], normal: [0, 0, 1], direction: [1, 0, 0] } }) });

        // Act
        const built = occt.design.build({ document: ring }).parts[0]!;

        // Assert
        expect(occt.shapes.solid.getSolidVolume({ shape: built.shape })).toBeCloseTo(area * 6, 3);
        expect(facesNamed(built, "ring:side:profile.teeth.tip")).toHaveLength(60);
        expect(facesNamed(built, "ring:side:profile.rim")).toHaveLength(1);
    });

    it("should report a gear the kernel refuses at the number at fault", () => {
        // Act
        const issues = issuesOf(geared({ teeth: 2 }));
        const result = occt.design.build({ document: geared({ teeth: 2 }) });

        // Assert
        expect(issues).toEqual([]);
        expect(result.report[0]?.status).toBe("failed");
        expect(result.report[0]?.messages[0]).toContain("/features/0/loops/0/pen/0/teeth");
        expect(result.report[0]?.messages[0]).toContain("`teeth`");
    });

    it("should refuse a gear of more teeth than a gear is drawn with, at its teeth", () => {
        // Act
        const report = occt.design.build({ document: geared({ module: 1, teeth: 1001 }) }).report[0]!;

        // Assert
        expect(report.messages).toEqual(["/features/0/loops/0/pen/0/teeth: `teeth` is 1001, and a gear is drawn with at most 1000 teeth."]);
    });

    it("should refuse a gear beside other commands, a gear without its teeth, a part of a gear that does not exist, an internal that is not a flag, a shifted ring and an id a gear already took", () => {
        // Arrange
        const crowded: Document = { schemaVersion: 1, features: [{ id: "profile", type: "sketch", on: { plane: "XY" }, pen: [{ type: "gear", centre: [0, 0], module: 2, teeth: 20 }, { type: "hLine", length: 1 }] }] };
        const toothless: Document = { schemaVersion: 1, features: [{ id: "profile", type: "sketch", on: { plane: "XY" }, pen: [{ type: "gear", centre: [0, 0], module: 2 } as Models.OCCT.DesignGearCommand] }] };
        const crowned = geared({}, [{ id: "crown", type: "fillet", body: "gear", radius: 0.2, edges: { between: [{ of: "gear", role: "end" }, { of: "gear", role: "side", from: "profile.teeth.crown" }], count: 20 } }]);
        const halfInside = JSON.parse(JSON.stringify(geared({})).replace("\"type\":\"gear\"", "\"type\":\"gear\",\"internal\":\"yes\"")) as Document;
        const shiftedRing = geared({ internal: true, profileShift: 0.2 });
        const sameId = JSON.parse(JSON.stringify(geared({})).replace("\"id\":\"bore\"", "\"id\":\"teeth\"")) as Document;

        // Act
        const issues = [...issuesOf(crowded), ...issuesOf(toothless), ...issuesOf(crowned), ...issuesOf(halfInside), ...issuesOf(shiftedRing), ...issuesOf(sameId)];

        // Assert
        expect(issues).toEqual([
            "/features/0/pen/0: a gear is a loop by itself: give it a pen or a loop of its own",
            "/features/0/pen/0/teeth: a gear needs centre, module, teeth",
            "/features/2/edges/between/1/from: \"profile.teeth.crown\" is not \"<sketch>.<command id>\" of an earlier sketch, \"<sketch>.<gear id>.<tip, flank or root>\" or \"<sketch>.<rack id>.<tip, flank, root, back or side>\"",
            "/features/0/loops/0/pen/0/internal: internal is true for the teeth of a ring gear, or false",
            "/features/0/loops/0/pen/0/profileShift: a ring gear's teeth take no profileShift",
            "/features/0/loops/1/pen/0/id: command ids are distinct, start with a letter or _ and hold letters, digits, _ and -",
        ]);
    });

    describe("racks", () => {
        const racked = (rack: Partial<Models.OCCT.DesignRackCommand>): Document => ({
            schemaVersion: 1,
            parameters: { count: 6 },
            features: [
                { id: "profile", type: "sketch", on: { plane: "XY" }, pen: [{ type: "rack", id: "rack", start: [0, 0], module: 2, teeth: "count", height: 6, ...rack }] },
                { id: "bar", type: "extrude", profile: "profile", distance: 5 },
            ],
        });

        it("should draw a rack as parts.mechanical.gears.rackProfile draws it, naming its tips, flanks, roots, back and ends", () => {
            // Arrange
            const profile = occt.parts.mechanical.gears.rackProfile({ module: 2, teeth: 6, height: 6, frame: { origin: [0, 0, 0], normal: [0, 0, 1], direction: [1, 0, 0] } });
            const expected = occt.shapes.face.getFaceArea({ shape: profile }) * 5;

            // Act
            const rack = occt.design.build({ document: racked({}) }).parts[0]!;

            // Assert
            expect(occt.shapes.solid.getSolidVolume({ shape: rack.shape })).toBeCloseTo(expected, 4);
            expect(facesNamed(rack, "bar:side:profile.rack.tip")).toHaveLength(6);
            expect(facesNamed(rack, "bar:side:profile.rack.back")).toHaveLength(1);
            expect(facesNamed(rack, "bar:side:profile.rack.side")).toHaveLength(2);
        });

        it("should place a rack at its start and turn it by its angle", () => {
            // Act
            const rack = occt.design.build({ document: racked({ start: [10, 4], angle: 90 }) }).parts[0]!;
            const box = occt.analysis.measure.tightBoundingBox({ shape: rack.shape });

            // Assert
            expect(box.max[1] - box.min[1]).toBeCloseTo(6 * 2 * Math.PI, 6);
            expect(box.max[0]).toBeCloseTo(16, 6);
            expect(box.min[0]).toBeCloseTo(10 - 2, 6);
        });

        it("should refuse a rack of more teeth than a gear is drawn with, at its teeth", () => {
            // Act
            const report = occt.design.build({ document: racked({ module: 1, teeth: 1001, height: 5 }) }).report[0]!;

            // Assert
            expect(report.messages).toEqual(["/features/0/pen/0/teeth: `teeth` is 1001, and a gear is drawn with at most 1000 teeth."]);
        });

        it("should refuse a rack without its start and one beside other commands", () => {
            // Arrange
            const placeless: Document = { schemaVersion: 1, features: [{ id: "profile", type: "sketch", on: { plane: "XY" }, pen: [{ type: "rack", module: 2, teeth: 6 } as Models.OCCT.DesignRackCommand] }] };
            const crowded: Document = { schemaVersion: 1, features: [{ id: "profile", type: "sketch", on: { plane: "XY" }, pen: [{ type: "rack", start: [0, 0], module: 2, teeth: 6 }, { type: "hLine", length: 1 }] }] };

            // Act
            const issues = [...issuesOf(placeless), ...issuesOf(crowded)];

            // Assert
            expect(issues).toEqual([
                "/features/0/pen/0/start: a rack needs start, module, teeth",
                "/features/0/pen/0: a rack is a loop by itself: give it a pen or a loop of its own",
            ]);
        });
    });
    describe("at sizes far from the usual", () => {
        const SEED = 20261018;
        const modules = fc.constantFrom(0.001, 0.01, 0.05, 0.3, 1, 12, 100);
        const builtOnce = (document: Document): { statuses: string[]; valid: boolean; area: number; tips: number } => {
            const built = occt.design.build({ document });
            try {
                const part = built.parts[0];
                if (part === undefined) {
                    return { statuses: built.report.map(entry => `${entry.status} ${entry.messages.join(" ")}`), valid: false, area: 0, tips: 0 };
                }
                const box = occt.analysis.measure.tightBoundingBox({ shape: part.shape });
                const thickness = box.max[2] - box.min[2];
                return {
                    statuses: built.report.map(entry => entry.status),
                    valid: occt.shapeFix.isValid({ shape: part.shape }),
                    area: occt.shapes.solid.getSolidVolume({ shape: part.shape }) / thickness,
                    tips: part.faceNames.filter(names => names.some(name => name.endsWith(".tip"))).length,
                };
            } finally {
                built.parts.forEach(part => part.shape.delete());
            }
        };
        const extruded = (loops: Models.OCCT.DesignLoop[], thickness: number): Document => ({
            schemaVersion: 1,
            features: [{ id: "profile", type: "sketch", on: { plane: "XY" }, loops }, { id: "gear", type: "extrude", profile: "profile", distance: thickness }],
        });

        it("should draw a spur gear of any module from a thousandth to a hundred and any tooth count into a valid solid between its root and tip circles, a tip face per tooth", () => {
            // Act & Assert
            fc.assert(fc.property(modules, fc.integer({ min: 3, max: 60 }), fc.integer({ min: 145, max: 250 }), fc.integer({ min: -180, max: 180 }), (module, teeth, tenthsOfADegree, rotation) => {
                const pressureAngle = tenthsOfADegree / 10;
                const made = builtOnce(extruded([{ pen: [{ type: "gear", id: "teeth", centre: [0, 0], module, teeth, pressureAngle, rotation, backlash: module / 50 }] }], module));
                expect(made.statuses).toEqual(["ok", "ok"]);
                expect(made.valid).toBe(true);
                expect(made.tips).toBe(teeth);
                const pitchRadius = module * teeth / 2;
                expect(made.area).toBeGreaterThan(Math.PI * (pitchRadius - 1.25 * module) ** 2);
                expect(made.area).toBeLessThan(Math.PI * (pitchRadius + module) ** 2);
            }), { seed: SEED, numRuns: 10 });
        });

        it.each([[0.01, 24.7], [0.001, 20]])("should draw a three-tooth gear of module %f and pressure angle %f, its tip and root lands microns wide, as it draws the gear ten and a hundred times larger", (module, pressureAngle) => {
            // Arrange
            const gearOf = (size: number): Document => extruded([{ pen: [{ type: "gear", id: "teeth", centre: [0, 0], module: size, teeth: 3, pressureAngle, backlash: size / 50 }] }], size);

            const sizes = [module, 10 * module, 100 * module];
            const volumePerCube = (size: number): number => {
                const built = occt.design.build({ document: gearOf(size) });
                const volume = built.parts.length === 1 ? occt.shapes.solid.getSolidVolume({ shape: built.parts[0]!.shape }) : 0;
                built.parts.forEach(part => part.shape.delete());
                return volume / size ** 3;
            };

            // Act
            const made = sizes.map(size => builtOnce(gearOf(size)));
            const shares = sizes.map(volumePerCube);

            // Assert
            expect(made.map(each => [each.statuses, each.valid, each.tips])).toEqual(made.map(() => [["ok", "ok"], true, 3]));
            expect(shares.map(share => share / shares[2]!)).toEqual([expect.closeTo(1, 9), expect.closeTo(1, 9), 1]);
        });

        it("should draw a ring gear's teeth of any module into a valid ring between its rim and its tip and root circles", () => {
            // Act & Assert
            fc.assert(fc.property(modules, fc.integer({ min: 40, max: 90 }), (module, teeth) => {
                const rim = module * (teeth / 2 + 3);
                const made = builtOnce(extruded([
                    { pen: [{ type: "circle", id: "rim", centre: [0, 0], radius: rim }] },
                    { pen: [{ type: "gear", id: "teeth", internal: true, centre: [0, 0], module, teeth, backlash: module / 50 }] },
                ], module));
                expect(made.statuses).toEqual(["ok", "ok"]);
                expect(made.valid).toBe(true);
                expect(made.tips).toBe(teeth);
                const pitchRadius = module * teeth / 2;
                expect(made.area).toBeGreaterThan(Math.PI * (rim ** 2 - (pitchRadius + 1.25 * module) ** 2));
                expect(made.area).toBeLessThan(Math.PI * (rim ** 2 - (pitchRadius - module) ** 2));
            }), { seed: SEED, numRuns: 6 });
        });

        it("should draw a rack of any module into a valid bar a pitch long per tooth, its area between the back and the tips", () => {
            // Act & Assert
            fc.assert(fc.property(modules, fc.integer({ min: 1, max: 30 }), (module, teeth) => {
                const height = 4 * module;
                const made = builtOnce({
                    schemaVersion: 1,
                    features: [
                        { id: "profile", type: "sketch", on: { plane: "XY" }, pen: [{ type: "rack", id: "rack", start: [0, 0], module, teeth, height, backlash: module / 50 }] },
                        { id: "gear", type: "extrude", profile: "profile", distance: module },
                    ],
                });
                expect(made.statuses).toEqual(["ok", "ok"]);
                expect(made.valid).toBe(true);
                expect(made.tips).toBe(teeth);
                const length = teeth * Math.PI * module;
                expect(made.area).toBeGreaterThan(length * (height - 1.25 * module));
                expect(made.area).toBeLessThan(length * (height + module));
            }), { seed: SEED, numRuns: 6 });
        });
    });
});
