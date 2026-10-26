import { beforeAll, describe, expect, it } from "vitest";
import { runInNewContext } from "node:vm";
import * as ts from "typescript";
import type { BitbybitOcctModule, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OCCTService } from "../../occ-service";
import { BaseBitByBit } from "@bitbybit-dev/base";
import * as Inputs from "../../api/inputs";
import type * as Models from "../../api/models";
import { handlesIn } from "../../../../__test__/embind-ledger";
import { releaseDesignCaches } from "../../release-design-caches";

type Part = Models.OCCT.DesignPartDocument;
type Feature = Models.OCCT.DesignFeature;
type Built = Models.OCCT.DesignBuildResult<TopoDS_Shape>;

interface Machined {
    readonly built: Built;
    readonly part: Models.OCCT.DesignBuiltPart<TopoDS_Shape> | undefined;
    readonly volume: number;
    readonly faces: Models.OCCT.ShapeSignatures["faces"];
}

const shaft = (diameter: number | string, ...machining: Feature[]): Part => ({
    schemaVersion: 1,
    parameters: { diameter },
    features: [
        { id: "base", type: "sketch", on: { plane: "XY" }, pen: [{ type: "circle", id: "rim", centre: [0, 0], radius: "diameter / 2" }] },
        { id: "shaft", type: "extrude", profile: "base", distance: 40 },
        ...machining,
    ],
});

const hub = (bore: number, ...machining: Feature[]): Part => ({
    schemaVersion: 1,
    features: [
        {
            id: "base", type: "sketch", on: { plane: "XY" },
            loops: [
                { start: [-20, -20], pen: [{ type: "hLine", length: 40 }, { type: "vLine", length: 40 }, { type: "hLine", length: -40 }, { type: "close" }] },
                { pen: [{ type: "circle", id: "bore", centre: [0, 0], radius: bore / 2 }] },
            ],
        },
        { id: "hub", type: "extrude", profile: "base", distance: 20 },
        ...machining,
    ],
});

const SHAFT_SIDE: Models.OCCT.DesignFaceReference = { of: "shaft", role: "side" };
const WARM_UP_CALLS = 5;
const CALLS = 40;
const MOST_BYTES_PER_CALL = 16;
const BOX_PADDING = 1e-4;
const BORE_WALL: Models.OCCT.DesignFaceReference = { of: "hub", role: "side", from: "base.bore" };

describe("OCCT design: machining a shaft or a bore", () => {
    let kernel: BitbybitOcctModule;
    let occt: OCCTService;

    beforeAll(async () => {
        kernel = await createBitbybitOcct();
        occt = new OCCTService(kernel);
    }, 120_000);

    const built = (document: Part): Machined => {
        const answer = occt.design.build({ document });
        try {
            const part = answer.parts.find(each => each.id === document.features[1]!.id) ?? answer.parts[0];
            if (part === undefined) {
                return { built: answer, part: undefined, volume: Number.NaN, faces: [] };
            }
            return { built: answer, part, volume: occt.shapes.solid.getSolidVolume({ shape: part.shape }), faces: occt.analysis.signatures({ shape: part.shape }).faces };
        } finally {
            handlesIn(answer).forEach(handle => { handle.delete(); });
        }
    };
    const named = (part: Models.OCCT.DesignBuiltPart<TopoDS_Shape> | undefined, name: string): number[] => (part?.faceNames ?? []).flatMap((names, index) => names.includes(name) ? [index] : []);
    const problemsOf = (answer: Built): string[] => answer.report.flatMap(entry => entry.status === "ok" ? [] : entry.messages);

    describe("keyways", () => {
        it("should mill a keyway into a shaft at `at` along its axis, facing world X, and name its faces while the shaft keeps its own", () => {
            // Arrange
            const plain = built(shaft(20));

            // Act
            const keyed = built(shaft(20, { id: "key", type: "keyway", body: "shaft", on: SHAFT_SIDE, at: 5, length: 20 }));

            // Assert
            const keyway = named(keyed.part, "key:keyway");
            expect(problemsOf(keyed.built)).toEqual([]);
            expect(keyed.volume).toBeLessThan(plain.volume);
            expect(keyway.length).toBeGreaterThan(2);
            expect(keyway.every(face => keyed.faces[face]!.centre[0] > 0 && keyed.faces[face]!.centre[2] > 5 - 1e-6 && keyed.faces[face]!.centre[2] < 25 + 1e-6)).toBe(true);
            expect([named(keyed.part, "shaft:start").length, named(keyed.part, "shaft:end").length, named(keyed.part, "shaft:side:base.rim").length]).toEqual([1, 1, 1]);
        });

        it("should start from the far end when flipped and turn to `angle` around the axis", () => {
            // Act
            const keyed = built(shaft(20, { id: "key", type: "keyway", body: "shaft", on: SHAFT_SIDE, at: 5, length: 20, flip: true, angle: 90 }));

            // Assert
            const centres = named(keyed.part, "key:keyway").map(face => keyed.faces[face]!.centre);
            expect(problemsOf(keyed.built)).toEqual([]);
            expect(centres.every(centre => centre[2] > 15 - 1e-6 && centre[2] < 35 + 1e-6)).toBe(true);
            expect(centres.every(centre => centre[1] > Math.abs(centre[0]))).toBe(true);
        });

        it("should cut a hub's keyway through the length of the bore it is given", () => {
            // Arrange
            const plain = built(hub(20));

            // Act
            const keyed = built(hub(20, { id: "key", type: "keyway", body: "hub", on: BORE_WALL, length: 20 }));

            // Assert
            expect(problemsOf(keyed.built)).toEqual([]);
            expect(keyed.volume).toBeLessThan(plain.volume);
            expect(named(keyed.part, "key:keyway").length).toBeGreaterThan(1);
        });
    });

    describe("cuts inside a hub", () => {
        it("should keep a hub's keyway and spline between `at` and `at` plus `length`, not through the bore's ends", () => {
            // Act
            const keyed = built(hub(20, { id: "key", type: "keyway", body: "hub", on: BORE_WALL, at: 5, length: 10 }));
            const splined = built(hub(22.5, { id: "teeth", type: "spline", body: "hub", on: BORE_WALL, at: 5, length: 10, module: 1.25 }));

            // Assert
            const wall = (made: ReturnType<typeof built>): Set<number> => new Set(named(made.part, "hub:side:base.bore"));
            const within = (made: ReturnType<typeof built>, name: string): boolean => named(made.part, name).filter(face => !wall(made).has(face)).every(face => made.faces[face]!.box.min[2] > 5 - BOX_PADDING && made.faces[face]!.box.max[2] < 15 + BOX_PADDING);
            expect([problemsOf(keyed.built), problemsOf(splined.built)]).toEqual([[], []]);
            expect([named(keyed.part, "key:keyway").length > 0, named(splined.part, "teeth:spline").length > 0]).toEqual([true, true]);
            expect([within(keyed, "key:keyway"), within(splined, "teeth:spline")]).toEqual([true, true]);
        });
    });

    describe("flats, grooves and knurls", () => {
        it("should take a flat `depth` deep off a shaft, square to world X turned by `angle`", () => {
            // Act
            const flat = built(shaft(20, { id: "flat", type: "flat", body: "shaft", on: SHAFT_SIDE, length: 10, depth: 1 }));

            // Assert
            const faces = named(flat.part, "flat:flat");
            expect(problemsOf(flat.built)).toEqual([]);
            expect(faces.some(face => flat.faces[face]!.type === Inputs.OCCT.surfaceTypeEnum.plane && Math.abs(flat.faces[face]!.centre[0] - 9) < 1e-6)).toBe(true);
        });

        it("should cut a retaining ring's groove into a shaft and into a bore, sized for each", () => {
            // Arrange
            const plainShaft = built(shaft(20));
            const plainHub = built(hub(20));

            // Act
            const shaftGroove = built(shaft(20, { id: "ring", type: "ringGroove", body: "shaft", on: SHAFT_SIDE, at: 30 }));
            const boreGroove = built(hub(20, { id: "ring", type: "ringGroove", body: "hub", on: BORE_WALL, at: 10 }));

            // Assert
            expect([problemsOf(shaftGroove.built), problemsOf(boreGroove.built)]).toEqual([[], []]);
            expect(shaftGroove.volume).toBeLessThan(plainShaft.volume);
            expect(boreGroove.volume).toBeLessThan(plainHub.volume);
            expect([named(shaftGroove.part, "ring:groove").length > 0, named(boreGroove.part, "ring:groove").length > 0]).toEqual([true, true]);
        });

        it("should knurl a shaft over `length` in the pattern asked for", () => {
            // Act
            const knurled = built(shaft(10, { id: "grip", type: "knurl", body: "shaft", on: SHAFT_SIDE, length: 6, pattern: "diamond" }));

            // Assert
            expect(problemsOf(knurled.built)).toEqual([]);
            expect(named(knurled.part, "grip:knurl").length).toBeGreaterThan(4);
        });

        it("should refuse a flat or a knurl on a bore, naming the face reference", () => {
            // Act
            const flat = built(hub(20, { id: "flat", type: "flat", body: "hub", on: BORE_WALL, length: 10, depth: 1 }));
            const knurl = built(hub(20, { id: "grip", type: "knurl", body: "hub", on: BORE_WALL, length: 10 }));

            // Assert
            expect(problemsOf(flat.built)).toEqual(["/features/2/on: a flat is made on a shaft, and this face is a bore's wall"]);
            expect(problemsOf(knurl.built)).toEqual(["/features/2/on: a knurl is made on a shaft, and this face is a bore's wall"]);
        });
    });

    describe("splines", () => {
        it("should cut the spline whose hub teeth end on the bore when no diameter is given", () => {
            // Arrange
            const plain = built(hub(22.5));

            // Act
            const splined = built(hub(22.5, { id: "teeth", type: "spline", body: "hub", on: BORE_WALL, length: 20, module: 1.25 }));

            // Assert
            expect(problemsOf(splined.built)).toEqual([]);
            expect(splined.volume).toBeLessThan(plain.volume);
            expect(named(splined.part, "teeth:spline").length).toBeGreaterThan(18);
        });

        it("should refuse a spline on a shaft, and one whose hub teeth end inside a wider bore", () => {
            // Act
            const onShaft = built(shaft(25, { id: "teeth", type: "spline", body: "shaft", on: SHAFT_SIDE, length: 10, module: 1.25 }));
            const wide = built(hub(24, { id: "teeth", type: "spline", body: "hub", on: BORE_WALL, length: 20, module: 1.25, diameter: 25 }));

            // Assert
            expect(problemsOf(onShaft.built)).toEqual(["/features/2/on: spline teeth are cut into a bore; a splined shaft is made whole by parts.mechanical.machining.din.splinedShaft"]);
            expect(problemsOf(wide.built)).toEqual(["/features/2/on: the bore is 24 across, wider than the 22.5 the hub's teeth end on, so they would be lost: drill the bore to 22.5"]);
        });
    });

    describe("threads", () => {
        it("should thread a shaft of a metric size and a bore drilled for its tap, finding the size from the diameter", () => {
            // Arrange
            const plainShaft = built(shaft(8));
            const plainHub = built(hub(6.8));

            // Act
            const outside = built(shaft(8, { id: "screw", type: "thread", body: "shaft", on: SHAFT_SIDE, length: 10 }));
            const inside = built(hub(6.8, { id: "tapped", type: "thread", body: "hub", on: BORE_WALL, length: 12 }));

            // Assert
            expect([problemsOf(outside.built), problemsOf(inside.built)]).toEqual([[], []]);
            expect(outside.volume).toBeLessThan(plainShaft.volume);
            expect(inside.volume).toBeLessThan(plainHub.volume);
            const threaded = named(outside.part, "screw:thread").map(face => outside.faces[face]!.centre[2]);
            expect(threaded.length).toBeGreaterThan(0);
            expect(threaded.every(z => z > -1e-6 && z < 10 + 1e-6)).toBe(true);
            expect(named(inside.part, "tapped:thread").length).toBeGreaterThan(0);
        });

        it("should refuse a shaft that is no metric size, naming the nearest, and take a size that is named", () => {
            // Act
            const odd = built(shaft(9, { id: "screw", type: "thread", body: "shaft", on: SHAFT_SIDE, length: 10 }));
            const unknown = built(shaft(9, { id: "screw", type: "thread", body: "shaft", on: SHAFT_SIDE, length: 10, size: "M9" }));

            // Assert
            expect(problemsOf(odd.built)).toEqual(["/features/2/on: a shaft 9 across is no ISO metric size; the nearest are M8, M10, M6: name a size, or size the shaft to one"]);
            expect(problemsOf(unknown.built)[0]).toMatch(/^\/features\/2\/size: "M9" is not an ISO metric size: M1\.6, /);
        });
    });

    describe("threads in drilled and tapped bores", () => {
        it("should refuse a bore at a size's nominal diameter, as a tapped hole is drawn, and thread it when the size it is drilled for is named", () => {
            // Act
            const nominal = built(hub(5, { id: "tapped", type: "thread", body: "hub", on: BORE_WALL, length: 12 }));
            const named6 = built(hub(5, { id: "tapped", type: "thread", body: "hub", on: BORE_WALL, length: 12, size: "M6" }));
            const tooWide = built(hub(8, { id: "tapped", type: "thread", body: "hub", on: BORE_WALL, length: 12, size: "M8" }));

            // Assert
            expect(problemsOf(nominal.built)).toEqual(["/features/2/on: a bore 5 across is M5's nominal diameter, the size a tapped hole is drawn at, which leaves a modelled thread nothing to cut: drill it to M5's tap drill, 4.2, or name the size the bore is drilled for"]);
            expect(problemsOf(named6.built)).toEqual([]);
            expect(problemsOf(tooWide.built)).toEqual(["/features/2/on: the bore is 8 across, wider than M8's tap drill, 6.8, so the thread would have little or nothing to cut: drill it to 6.8"]);
        });

        it("should find the size from the tap drill of a fine pitch when one is given", () => {
            // Act
            const fine = built(hub(9, { id: "tapped", type: "thread", body: "hub", on: BORE_WALL, length: 6, pitch: 1 }));

            // Assert
            expect(problemsOf(fine.built)).toEqual([]);
            expect(named(fine.part, "tapped:thread").length).toBeGreaterThan(0);
        });
    });

    describe("bores that end on curved faces", () => {
        it("should read a cross bore's axis from its surface, though both its ends are saddles, and groove it", () => {
            // Arrange
            const drum: Part = {
                schemaVersion: 1,
                features: [
                    { id: "base", type: "sketch", on: { plane: "XY" }, pen: [{ type: "circle", id: "rim", centre: [0, 0], radius: 20 }] },
                    { id: "drum", type: "extrude", profile: "base", distance: 40 },
                    { id: "crossProfile", type: "sketch", on: { frame: { origin: [-30, 0, 20], normal: [1, 0, 0], direction: [0, 1, 0] } }, pen: [{ type: "circle", id: "cross", centre: [0, 0], radius: 6 }] },
                    { id: "crossBore", type: "extrude", profile: "crossProfile", distance: 60, body: "drum", join: "cut" },
                    { id: "ring", type: "ringGroove", body: "drum", on: { of: "crossBore", role: "side" }, at: 4 },
                ],
            };

            // Act
            const grooved = built(drum);

            // Assert
            const grooves = named(grooved.part, "ring:groove").map(face => grooved.faces[face]!);
            expect(problemsOf(grooved.built)).toEqual([]);
            expect(grooves.length).toBeGreaterThan(0);
            expect(grooves.every(face => Math.abs(face.centre[1]) < 1e-6 && Math.abs(face.centre[2] - 20) < 1e-6)).toBe(true);
        });
    });

    describe("references and checks", () => {
        it("should refuse a face that is not a cylinder, and a reference that finds more than one", () => {
            // Act
            const flatFace = built(shaft(20, { id: "key", type: "keyway", body: "shaft", on: { of: "shaft", role: "end" }, length: 10 }));
            const twoBores = built(hub(20, { id: "ring", type: "ringGroove", body: "hub", on: BORE_WALL, at: 6 }, { id: "key", type: "keyway", body: "hub", on: { of: "hub", role: "side" }, length: 10 }));

            // Assert
            expect(problemsOf(flatFace.built)).toEqual(["/features/2/on: a cylindrical face is needed here, and this one is a plane"]);
            expect(problemsOf(twoBores.built)).toEqual([expect.stringMatching(/^\/features\/3\/on: the reference finds \d+ cylindrical faces, and one is machined/)]);
        });

        it("should point a tool's refusal at the feature's own fields", () => {
            // Act
            const thin = built(shaft(4, { id: "key", type: "keyway", body: "shaft", on: SHAFT_SIDE, length: 10 }));
            const deep = built(shaft(20, { id: "flat", type: "flat", body: "shaft", on: SHAFT_SIDE, length: 10, depth: 30 }));

            // Assert
            expect(problemsOf(thin.built)[0]).toMatch(/^\/features\/2\/on: /);
            expect(problemsOf(deep.built)[0]).toMatch(/^\/features\/2\/depth: /);
        });
    });

    describe("as TypeScript", () => {
        const execute = async (code: string): Promise<{ shape: TopoDS_Shape }[]> => {
            const program = ts.transpileModule(code, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText.replace(/for \(const part of parts\) \{[\s\S]*?\}\n/, "");
            return runInNewContext(`(async () => {\n${program}\nreturn parts;\n})()`, { bitbybit: { occt }, Bit: { Inputs } }) as Promise<{ shape: TopoDS_Shape }[]>;
        };

        it("should write each cut as the public machining call the build made, so the program builds the same volume", async () => {
            // Arrange
            const document: Part = {
                schemaVersion: 1,
                parameters: { diameter: 20 },
                features: [
                    { id: "stock", type: "sketch", on: { plane: "XY" }, pen: [] },
                    { id: "shaft", type: "operation", operation: "occt.shapes.solid.createCylinder", params: { radius: { expr: "diameter / 2" }, height: 40, center: [0, 0, 0], direction: [0, 0, 1] } },
                    { id: "key", type: "keyway", body: "shaft", on: { of: "shaft", role: "face" }, at: 5, length: "diameter" },
                    { id: "ring", type: "ringGroove", body: "shaft", on: { of: "shaft", role: "face" }, at: 32 },
                ],
            };
            const expected = built(document).volume;

            // Act
            const code = occt.design.toTypeScript({ document });
            const parts = await execute(code);

            // Assert
            expect(code).toContain("shaft = await occt.parts.mechanical.machining.din.keyway({ shape: shaft, diameter: 20, length: diameter, inHub: false, unit: Bit.Inputs.Base.unitOfLengthEnum.millimetre, frame: { origin: [0, 0, 5], normal: [0, 0, 1], direction: [1, 0, 0] } });");
            expect(code).toContain("kind: Bit.Inputs.Engineering.retainingRingKindEnum.shaft");
            expect(occt.shapes.solid.getSolidVolume({ shape: parts[0]!.shape })).toBeCloseTo(expected, 6);
            expect(named(built(document).part, "key:keyway").length).toBeGreaterThan(2);
            parts.forEach(part => { part.shape.delete(); });
        });
    });

    describe("ANSI standards in an inch document", () => {
        const inchShaft = (diameter: number, ...machining: Feature[]): Part => ({ ...shaft(diameter, ...machining), units: { length: "in" }, features: [shaft(diameter).features[0]!, { id: "shaft", type: "extrude", profile: "base", distance: 2 }, ...machining] });
        const inchHub = (bore: number, ...machining: Feature[]): Part => ({
            schemaVersion: 1,
            units: { length: "in" },
            features: [
                {
                    id: "base", type: "sketch", on: { plane: "XY" },
                    loops: [
                        { start: [-1, -1], pen: [{ type: "hLine", length: 2 }, { type: "vLine", length: 2 }, { type: "hLine", length: -2 }, { type: "close" }] },
                        { pen: [{ type: "circle", id: "bore", centre: [0, 0], radius: bore / 2 }] },
                    ],
                },
                { id: "hub", type: "extrude", profile: "base", distance: 1 },
                ...machining,
            ],
        });
        const ALONG_Z = { normal: [0, 0, 1] as Inputs.Base.Vector3, direction: [1, 0, 0] as Inputs.Base.Vector3 };
        const cutVolume = (cut: (shape: TopoDS_Shape) => TopoDS_Shape, radius: number): number => {
            const blank = occt.shapes.solid.createCylinder({ radius, height: 2, center: [0, 0, 0], direction: [0, 0, 1] });
            const made = cut(blank);
            try {
                return occt.shapes.solid.getSolidVolume({ shape: made });
            } finally {
                [blank, made].forEach(shape => { shape.delete(); });
            }
        };

        it("should mill an ANSI B17.1 keyseat, groove for an inch ring and knurl to ASME B94.6 just as the public machining calls do", () => {
            // Arrange
            const machining = occt.parts.mechanical.machining.ansi;
            const unit = Inputs.Base.unitOfLengthEnum.inch;

            // Act
            const keyed = built(inchShaft(1, { id: "key", type: "keyway", standard: "ansi", body: "shaft", on: SHAFT_SIDE, at: 0.25, length: 1 }));
            const grooved = built(inchShaft(0.75, { id: "ring", type: "ringGroove", standard: "ansi", body: "shaft", on: SHAFT_SIDE, at: 1.5 }));
            const knurled = built(inchShaft(0.5, { id: "grip", type: "knurl", standard: "ansi", body: "shaft", on: SHAFT_SIDE, length: 0.5, diametralPitch: 96 }));

            // Assert
            [keyed, grooved, knurled].forEach(each => expect(problemsOf(each.built)).toEqual([]));
            expect(keyed.volume).toBeCloseTo(cutVolume(shape => machining.keyway({ shape, diameter: 1, length: 1, unit, frame: { origin: [0, 0, 0.25], ...ALONG_Z } }), 0.5), 9);
            expect(grooved.volume).toBeCloseTo(cutVolume(shape => machining.ringGroove({ shape, diameter: 0.75, unit, frame: { origin: [0, 0, 1.5], ...ALONG_Z } }), 0.375), 9);
            expect(knurled.volume).toBeCloseTo(cutVolume(shape => machining.knurl({ shape, diameter: 0.5, length: 0.5, diametralPitch: 96, unit, frame: { origin: [0, 0, 0], ...ALONG_Z } }), 0.25), 9);
            expect([named(keyed.part, "key:keyway").length, named(grooved.part, "ring:groove").length, named(knurled.part, "grip:knurl").length].every(count => count > 0)).toBe(true);
        });

        it("should cut the ANSI spline whose hub teeth end on the bore, finding its teeth when they are left out", () => {
            // Arrange
            const bore = (24 - 1) / 16;

            // Act
            const found = built(inchHub(bore, { id: "teeth", type: "spline", standard: "ansi", body: "hub", on: BORE_WALL, length: 1, pitch: "16/32" }));
            const named24 = built(inchHub(bore, { id: "teeth", type: "spline", standard: "ansi", body: "hub", on: BORE_WALL, length: 1, pitch: "16/32", teeth: 24 }));

            // Assert
            expect(problemsOf(found.built)).toEqual([]);
            expect(found.volume).toBeCloseTo(named24.volume, 9);
            expect(found.volume).toBeLessThan(4 - Math.PI * bore * bore / 4);
            expect(named(found.part, "teeth:spline").length).toBeGreaterThan(0);
        });

        it("should thread a 1/4 shaft and a bore drilled for 1/4-20, finding the Unified size from the diameter", () => {
            // Arrange
            const drill = new BaseBitByBit().engineering.mechanical.threads.ansi.thread({ size: Inputs.Engineering.ansiThreadSizeEnum.in1_4 }).tapDrill;

            // Act
            const outside = built(inchShaft(0.25, { id: "screw", type: "thread", standard: "ansi", body: "shaft", on: SHAFT_SIDE, length: 0.5 }));
            const inside = built(inchHub(drill, { id: "nut", type: "thread", standard: "ansi", body: "hub", on: BORE_WALL, length: 0.5 }));

            // Assert
            expect(problemsOf(outside.built)).toEqual([]);
            expect(problemsOf(inside.built)).toEqual([]);
            expect(named(outside.part, "screw:thread").length).toBeGreaterThan(0);
            expect(named(inside.part, "nut:thread").length).toBeGreaterThan(0);
        }, 120_000);

        it("should refuse a metric property under the ANSI standard and an ANSI one under the metric", () => {
            // Act
            const problems = [
                inchShaft(0.5, { id: "grip", type: "knurl", standard: "ansi", body: "shaft", on: SHAFT_SIDE, length: 0.5, pitch: 1 }),
                inchHub(1, { id: "teeth", type: "spline", standard: "ansi", body: "hub", on: BORE_WALL, length: 1 }),
                inchShaft(0.25, { id: "screw", type: "thread", body: "shaft", on: SHAFT_SIDE, length: 0.5, series: "UNC" }),
                inchShaft(0.25, { id: "screw", type: "thread", standard: "ansi", body: "shaft", on: SHAFT_SIDE, length: 0.5, series: "UNF", threadsPerInch: 28 }),
            ].map(document => occt.design.validate({ document }).map(issue => `${issue.path}: ${issue.message}`)[0]);

            // Assert
            expect(problems).toEqual([
                "/features/2/pitch: an ANSI knurl is sized by its diametralPitch, not a pitch",
                "/features/2: an ANSI spline needs its pitch, one of 2.5/5, 3/6, 4/8, 5/10, 6/12, 8/16, 10/20, 12/24, 16/32, 20/40, 24/48, 32/64",
                "/features/2/series: a series names an ANSI thread's pitch; an ISO thread takes a pitch",
                "/features/2/threadsPerInch: give a thread's series or its threadsPerInch, not both",
            ]);
        });

        it("should write an ANSI thread as the public machining call the build made, with its enums named", async () => {
            // Arrange
            const document: Part = {
                schemaVersion: 1,
                units: { length: "in" },
                features: [
                    { id: "stock", type: "sketch", on: { plane: "XY" }, pen: [] },
                    { id: "shaft", type: "operation", operation: "occt.shapes.solid.createCylinder", params: { radius: 0.125, height: 2, center: [0, 0, 0], direction: [0, 0, 1] } },
                    { id: "screw", type: "thread", standard: "ansi", body: "shaft", on: { of: "shaft", role: "face" }, length: 0.5, series: "UNF" },
                ],
            };
            const expected = built(document).volume;

            // Act
            const code = occt.design.toTypeScript({ document });
            const program = ts.transpileModule(code, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText.replace(/for \(const part of parts\) \{[\s\S]*?\}\n/, "");
            const parts = await (runInNewContext(`(async () => {\n${program}\nreturn parts;\n})()`, { bitbybit: { occt }, Bit: { Inputs } }) as Promise<{ shape: TopoDS_Shape }[]>);

            // Assert
            expect(code).toContain("occt.parts.mechanical.machining.ansi.thread({ shape: shaft, size: Bit.Inputs.Engineering.ansiThreadSizeEnum.in1_4, series: Bit.Inputs.Engineering.ansiThreadSeriesEnum.unf,");
            expect(code).toContain("unit: Bit.Inputs.Base.unitOfLengthEnum.inch");
            expect(occt.shapes.solid.getSolidVolume({ shape: parts[0]!.shape })).toBeCloseTo(expected, 9);
            parts.forEach(part => { part.shape.delete(); });
        }, 120_000);
    });

    describe("the kernel heap", () => {
        const bytesPerBuild = (document: Part): number => {
            const once = (): void => {
                handlesIn(occt.design.build({ document })).forEach(handle => { handle.delete(); });
                releaseDesignCaches(occt);
            };
            for (let warm = 0; warm < WARM_UP_CALLS; warm++) {
                once();
            }
            const before = kernel.HeapBytesInUse();
            for (let call = 0; call < CALLS; call++) {
                once();
            }
            return (kernel.HeapBytesInUse() - before) / CALLS;
        };

        it("should come back to the heap it started from after machining a shaft and after refusing a spline, once each answer and the design caches are freed", () => {
            // Arrange
            const machined = shaft(20,
                { id: "key", type: "keyway", body: "shaft", on: SHAFT_SIDE, at: 5, length: 20 },
                { id: "flat", type: "flat", body: "shaft", on: SHAFT_SIDE, at: 28, length: 6, depth: 1, angle: 180 },
                { id: "ring", type: "ringGroove", body: "shaft", on: SHAFT_SIDE, at: 36 },
            );
            const refused = hub(24, { id: "teeth", type: "spline", body: "hub", on: BORE_WALL, length: 20, module: 1.25, diameter: 25 });

            // Act
            const grown = [bytesPerBuild(machined), bytesPerBuild(refused)];

            // Assert
            expect(grown.every(bytes => bytes <= MOST_BYTES_PER_CALL), `bytes a call: ${grown.join(", ")}`).toBe(true);
        });
    });
});
