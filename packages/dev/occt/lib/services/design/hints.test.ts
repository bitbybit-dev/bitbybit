import { describe, it, expect, beforeAll } from "vitest";
import type { TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTService } from "../../occ-service";
import * as Inputs from "../../api/inputs";
import type * as Models from "../../api/models";
import { InputError } from "@bitbybit-dev/base";
import { BaseBitByBit } from "../../base";
import { REBIND_MARGIN, REBIND_SCORE, candidatesOf, hintedDocument, rebindOf, recordHint, referenceHintOf } from "./hints";

type Document = Models.OCCT.DesignPartDocument;

const square = (id: string, x: number, size = 10): Models.OCCT.DesignSketchFeature => ({
    id,
    type: "sketch",
    on: { plane: "XY" },
    start: [x, 0],
    pen: [{ type: "hLine", id: "s", length: size }, { type: "vLine", id: "e", length: size }, { type: "hLine", id: "n", length: -size }, { type: "close", id: "w" }],
});

const A_TOP: Models.OCCT.DesignFaceReference = { of: "a", role: "end", count: 1 };

const DENT_FACE = "/features/6/on/face";

const mergedTops = (): Document => ({
    schemaVersion: 1,
    parameters: { merged: false },
    features: [
        square("aSketch", 0),
        { id: "a", type: "extrude", profile: "aSketch", distance: 5 },
        square("bSketch", 10),
        { id: "b", type: "extrude", profile: "bSketch", distance: 5 },
        { id: "joined", type: "boolean", operation: "union", body: "a", tools: ["b"] },
        { id: "unified", type: "operation", operation: "occt.shapes.shape.unifySameDomain", params: { shape: { body: "a" }, unifyEdges: true, unifyFaces: true, concatBSplines: true }, body: "a", suppressed: "!merged" },
        { id: "dent", type: "sketch", on: { face: A_TOP, origin: [5, 5, 0], direction: [1, 0, 0] }, start: [-1, -1], pen: [{ type: "hLine", length: 2 }, { type: "vLine", length: 2 }, { type: "hLine", length: -2 }, { type: "close" }] },
        { id: "dip", type: "pocket", profile: "dent", body: "a", distance: 1 },
    ],
});

const hint = (centre: [number, number, number]): Models.OCCT.DesignReferenceHint => ({
    v: 1,
    box: { min: [0, 0, 0], max: [1, 1, 1] },
    faces: [{ type: "plane", area: 0.1, centre, normal: [0, 0, 1], neighbours: [] }],
});

describe("design hints", () => {
    let occt: OCCTService;

    beforeAll(async () => {
        const kernel = await createBitbybitOcct();
        occt = new OCCTService(kernel, new OccHelper(new VectorHelperService(), new ShapesHelperService(), kernel));
    }, 120_000);

    const statusOf = (result: Models.OCCT.DesignBuildResult<unknown>, id: string): Models.OCCT.DesignFeatureReport => result.report.find(entry => entry.id === id)!;

    describe("recording and writing", () => {
        it("should keep a hint recorded twice alike, and none for a path that resolved to different faces", () => {
            // Arrange
            const hints = new Map<string, Models.OCCT.DesignReferenceHint | null>();

            // Act
            recordHint(hints, "/same", hint([0, 0, 1]));
            recordHint(hints, "/same", hint([0, 0, 1]));
            recordHint(hints, "/split", hint([0, 0, 1]));
            recordHint(hints, "/split", hint([1, 0, 1]));
            recordHint(hints, "/split", hint([0, 0, 1]));

            // Assert
            expect(hints.get("/same")).toEqual(hint([0, 0, 1]));
            expect(hints.get("/split")).toBeNull();
        });

        it("should write each hint onto the face reference at its pointer, unescaping the pointer and leaving the document given untouched", () => {
            // Arrange
            const document = { features: [{ on: { face: { of: "a" } } }], parts: [{ "a/b": { of: "b" }, "c~d": { of: "c" }, plain: { value: 1 } }] };
            const hints = new Map<string, Models.OCCT.DesignReferenceHint | null>([
                ["/features/0/on/face", hint([0, 0, 1])],
                ["/parts/0/a~1b", hint([1, 0, 1])],
                ["/parts/0/c~0d", null],
                ["/parts/0/plain", hint([0, 1, 1])],
                ["/parts/9/missing", hint([0, 1, 1])],
            ]);

            // Act
            const written = hintedDocument(document, hints);

            // Assert
            expect(written).toEqual({ features: [{ on: { face: { of: "a", hint: hint([0, 0, 1]) } } }], parts: [{ "a/b": { of: "b", hint: hint([1, 0, 1]) }, "c~d": { of: "c" }, plain: { value: 1 } }] });
            expect(document.features[0]!.on.face).toEqual({ of: "a" });
        });
    });

    describe("recording and scoring a face", () => {
        const AXES = ["x", "y", "z"];
        const nameOfNormal = (normal: readonly number[]): string => {
            const axis = normal.findIndex(component => Math.abs(component) > 0.5);
            return `${normal[axis]! > 0 ? "+" : "-"}${AXES[axis]}`;
        };
        const offsetCube = (): { shape: TopoDS_Shape; names: string[][]; plusX: number } => {
            const shape = occt.shapes.solid.createBox({ width: 2, length: 2, height: 2, center: [10, 20, 30], originOnCenter: true });
            const names = occt.analysis.signatures({ shape }).faces.map(face => [nameOfNormal(face.normal)]);
            return { shape, names, plusX: names.findIndex(name => name[0] === "+x") };
        };

        it("should record a face's surface, its share of the area, its centre within the body's box, its normal and its neighbours", () => {
            // Arrange
            const { shape, names, plusX } = offsetCube();

            // Act
            const recorded = referenceHintOf([plusX], shape, names, { occt, base: new BaseBitByBit() });

            // Assert
            expect(recorded).toEqual({
                v: 1,
                box: { min: [9, 19, 29], max: [11, 21, 31] },
                faces: [{ type: "plane", area: 0.166667, centre: [1, 0.5, 0.5], normal: [1, 0, 0], neighbours: ["+y", "+z", "-y", "-z"] }],
            });
        });

        it("should score a face by how near it lies to the hint's centre in both the body's proportions and its size, and by how alike its normal, area and neighbours are", () => {
            // Arrange
            const { shape, names, plusX } = offsetCube();
            const leaning: Models.OCCT.DesignReferenceHint = {
                v: 1,
                box: { min: [9, 19, 29], max: [11, 21, 31] },
                faces: [{ type: "plane", area: 0.166667, centre: [1.1, 1.1, 0.5], normal: [0, 1, 0], neighbours: ["+y", "+z", "-y", "-z"] }],
            };

            // Act
            const scores = candidatesOf(leaning, shape, names, { occt, base: new BaseBitByBit() });

            // Assert
            expect(scores.find(candidate => candidate.face === plusX)).toEqual({ face: plusX, score: 0.35831 });
        });
    });

    describe("choosing faces to rebind", () => {
        it("should take the best faces when each scores enough and beats the best face left out by the margin", () => {
            // Arrange
            const candidates = [{ face: 7, score: 0.95 }, { face: 2, score: 0.9 }, { face: 4, score: 0.9 - REBIND_MARGIN - 0.01 }];

            // Act
            const one = rebindOf(candidates.slice(0, 1), 1);
            const two = rebindOf(candidates, 2);

            // Assert
            expect(one).toEqual({ faces: [7], score: 0.95 });
            expect(two).toEqual({ faces: [2, 7], score: 0.9 });
        });

        it("should take nothing when a face it needs scores too little, ties with the next, or is missing", () => {
            // Arrange
            const tied = [{ face: 1, score: 0.9 }, { face: 2, score: 0.85 }];
            const weak = [{ face: 1, score: REBIND_SCORE - 0.01 }];

            // Act
            const results = [rebindOf(tied, 1), rebindOf(weak, 1), rebindOf(tied, 3), rebindOf(tied, 0)];

            // Assert
            expect(results).toEqual([undefined, undefined, undefined, undefined]);
        });
    });

    describe("writing hints", () => {
        it("should write a hint on every face reference a build resolves, which the version leaves out and the document check accepts", () => {
            // Arrange
            const document = mergedTops();

            // Act
            const hinted = occt.design.withHints({ document });

            // Assert
            const on = hinted.features[6]!.type === "sketch" ? hinted.features[6].on : undefined;
            const written = on !== undefined && "face" in on ? on.face.hint : undefined;
            expect(written?.box).toEqual({ min: [0, 0, 0], max: [20, 10, 5] });
            expect(written?.faces).toEqual([{
                type: "plane",
                area: 0.285714,
                centre: [0.5, 0.5, 1],
                normal: [0, 0, 1],
                neighbours: ["a:side", "a:side:aSketch.n", "a:side:aSketch.s", "a:side:aSketch.w", "b:side", "b:side:bSketch.e", "b:side:bSketch.n", "b:side:bSketch.s"],
            }]);
            expect(occt.design.versionOf({ document: hinted })).toBe(occt.design.versionOf({ document }));
            expect(occt.design.validate({ document: hinted })).toEqual([]);
        });

        it("should write hints into part documents only", () => {
            // Arrange
            const id = "77777777-7777-4777-8777-777777777777";
            const part: Document = { ...mergedTops(), id, parts: [{ id: "a", body: "a" }] };
            const assembly: Models.OCCT.DesignAssemblyDocument = { schemaVersion: 1, kind: "assembly", components: [{ id: "one", source: { document: id, part: "a" } }] };

            // Act
            const write = (): unknown => occt.design.withHints({ document: assembly, documents: [part] });

            // Assert
            expect(occt.design.validate({ document: assembly, documents: [part] })).toEqual([]);
            expect(write).toThrow(new InputError("Hints are written into part documents: write them into each document the assembly places.", "document"));
        });

        it("should refuse a hint that is not one", () => {
            // Arrange
            const good = hint([0.5, 0.5, 1]);
            const withHint = (value: unknown): Document => {
                const document = mergedTops();
                return { ...document, features: document.features.map((feature, index) => index === 6 && feature.type === "sketch" ? { ...feature, on: { face: { ...A_TOP, hint: value as Models.OCCT.DesignReferenceHint }, origin: [5, 5, 0], direction: [1, 0, 0] } } : feature) };
            };
            const paths = (value: unknown): string[] => occt.design.validate({ document: withHint(value) }).map(issue => issue.path);

            // Act
            const results = [
                paths({ ...good, v: 2 }),
                paths({ ...good, faces: [] }),
                paths({ ...good, box: { min: [0, 0, 2], max: [1, 1, 1] } }),
                paths({ ...good, faces: [{ ...good.faces[0]!, area: 1.5 }] }),
                paths({ ...good, faces: [{ ...good.faces[0]!, normal: [0, 0] }] }),
                paths({ ...good, extra: true }),
            ];

            // Assert
            expect(results).toEqual([
                [`${DENT_FACE}/hint/v`],
                [`${DENT_FACE}/hint/faces`],
                [`${DENT_FACE}/hint/box`],
                [`${DENT_FACE}/hint/faces/0`],
                [`${DENT_FACE}/hint/faces/0`],
                [`${DENT_FACE}/hint/extra`],
            ]);
        });
    });

    describe("rebinding lost references", () => {
        it("should fail a reference whose faces a merge without history lost, and offer the face most like its hint as a clear repair", () => {
            // Arrange
            const document = occt.design.withHints({ document: mergedTops() });

            // Act
            const result = occt.design.build({ document, parameters: { merged: true } });

            // Assert
            const dent = statusOf(result, "dent");
            expect(dent.status).toBe("failed");
            expect(dent.repairs).toEqual([{ path: DENT_FACE, faces: [expect.any(Number)], score: 1, clear: true }]);
            expect(statusOf(result, "dip").status).toBe("skipped");
        });

        it("should take the face most like the hint in a build that rebinds, report it in every feature that reads the reference, and report it again when the build is reused", () => {
            // Arrange
            const document = occt.design.withHints({ document: mergedTops() });

            // Act
            const first = occt.design.build({ document, parameters: { merged: true }, rebind: Inputs.OCCT.designRebindEnum.report });
            const again = occt.design.build({ document, parameters: { merged: true }, rebind: Inputs.OCCT.designRebindEnum.report });

            // Assert
            const repaired = occt.design.build({ document, parameters: { merged: true } });
            const dent = statusOf(first, "dent");
            expect(dent.status).toBe("rebound");
            expect(dent.messages).toEqual([`${DENT_FACE}: its faces were lost, and it took faces ${repaired.report[6]!.repairs![0]!.faces[0]}, the most like its hint (score 1)`]);
            expect(dent.repairs).toEqual([{ path: DENT_FACE, faces: repaired.report[6]!.repairs![0]!.faces, score: 1, clear: true }]);
            expect(statusOf(first, "dip").messages).toEqual([`/features/7/profile: its faces were lost, and it took faces ${repaired.report[6]!.repairs![0]!.faces[0]}, the most like its hint (score 1)`]);
            expect(occt.shapes.solid.getSolidVolume({ shape: first.parts[0]!.shape })).toBeCloseTo(20 * 10 * 5 - 4, 6);
            expect([statusOf(again, "dent").status, statusOf(again, "dent").cached, statusOf(again, "dent").messages]).toEqual(["rebound", true, dent.messages]);
        });

        it("should rebind nothing without a hint, or where the faces most like it tie", () => {
            // Arrange
            const plain = mergedTops();
            const hinted = occt.design.withHints({ document: plain });
            const split: Document = {
                ...hinted,
                features: [
                    ...hinted.features.slice(0, 5),
                    { id: "slotSketch", type: "sketch", on: { plane: "XY", offset: -1 }, start: [9, -1], pen: [{ type: "hLine", length: 2 }, { type: "vLine", length: 12 }, { type: "hLine", length: -2 }, { type: "close" }] },
                    { id: "slot", type: "extrude", profile: "slotSketch", distance: 7, body: "a", join: "cut" },
                    ...hinted.features.slice(6),
                ],
            };

            // Act
            const unhinted = occt.design.build({ document: plain, parameters: { merged: true }, rebind: Inputs.OCCT.designRebindEnum.report });
            const tied = occt.design.build({ document: split, rebind: Inputs.OCCT.designRebindEnum.report });

            // Assert
            expect([statusOf(unhinted, "dent").status, statusOf(unhinted, "dent").repairs]).toEqual(["failed", undefined]);
            expect(statusOf(tied, "dent").status).toBe("failed");
            expect(statusOf(tied, "dent").repairs).toEqual([{ path: "/features/7/on/face", faces: [expect.any(Number)], score: expect.any(Number), clear: false }]);
        });
    });

    describe("rebinding a part's references", () => {
        it("should say in the build's issues what became of a part's lost reference with a hint", () => {
            // Arrange
            const path = "/parts/0/appearance/faces/0/faces";
            const blocks = mergedTops();
            const document = occt.design.withHints({ document: { ...blocks, features: blocks.features.slice(0, 6), parts: [{ id: "a", body: "a", appearance: { faces: [{ faces: A_TOP, color: "#ff0000" }] } }] } });

            // Act
            const failing = occt.design.build({ document, parameters: { merged: true } });
            const rebinding = occt.design.build({ document, parameters: { merged: true }, rebind: Inputs.OCCT.designRebindEnum.report });

            // Assert
            const taken = rebinding.parts[0]!.appearance!.faces.map(entry => entry.indexes);
            const top = occt.analysis.signatures({ shape: rebinding.parts[0]!.shape }).faces[taken[0]![0]!]!;
            expect(rebinding.issues).toEqual([{ path, message: `its faces were lost, and it took faces ${taken[0]!.join(", ")}, the most like its hint (score 1)` }]);
            expect(failing.issues.filter(issue => issue.path === path).map(issue => issue.message)).toContain(`faces ${taken[0]!.join(", ")} are the most like its hint (score 1); a build with rebind "report" takes them`);
            expect(taken).toHaveLength(1);
            expect([top.normal[2], top.centre[2]]).toEqual([1, 5]);
            expect(top.area).toBeCloseTo(200, 9);
        });
    });

    describe("operations that keep faces", () => {
        it("should keep every face's names through a turn, so a reference by name finds the turned face", () => {
            // Arrange
            const document: Document = {
                schemaVersion: 1,
                features: [
                    square("base", 0, 10),
                    { id: "block", type: "extrude", profile: "base", distance: 4 },
                    { id: "turned", type: "operation", operation: "occt.transforms.rotate", params: { shape: { body: "block" }, axis: [0, 0, 1], angle: 90 }, body: "block" },
                    { id: "mark", type: "sketch", on: { face: { of: "block", role: "side", from: "base.e", count: 1 }, origin: [0, 0, 0], direction: [0, 0, 1] }, pen: [{ type: "circle", centre: [0, 0], radius: 1 }] },
                ],
            };

            // Act
            const result = occt.design.build({ document });

            // Assert
            const body = result.parts[0]!;
            const east = body.faceNames.findIndex(names => names.includes("block:side:base.e"));
            const signature = occt.analysis.signatures({ shape: body.shape }).faces[east]!;
            expect(result.report.map(entry => entry.status)).toEqual(["ok", "ok", "ok", "ok"]);
            expect(signature.normal.map(value => Math.round(value * 1e6) / 1e6 + 0)).toEqual([0, 1, 0]);
            expect(signature.centre.map(value => Math.round(value * 1e6) / 1e6 + 0)).toEqual([-5, 10, 2]);
        });
    });
});
