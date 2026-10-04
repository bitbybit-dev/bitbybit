import { describe, it, expect, beforeAll } from "vitest";
import createBitbybitOcct, { TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTService } from "../../occ-service";
import * as Models from "../../api/models";
import { InputError } from "@bitbybit-dev/base";
import { sha256 } from "./digest";

type Document = Models.OCCT.DesignPartDocument;

const CODE = "return occt.shapes.solid.createBox(inputs);";
const OTHER_CODE = "return occt.shapes.solid.createCube(inputs);";
const digest = (code: string): string => sha256(new TextEncoder().encode(code));

const lugDocument = (code = CODE, size = 10): Document => ({
    schemaVersion: 1,
    parameters: { size },
    assets: [{ id: "lugScript", uri: "lug.js", sha256: digest(code) }],
    features: [
        { id: "base", type: "sketch", on: { plane: "XY" }, pen: [{ type: "hLine", id: "s", length: 20 }, { type: "vLine", length: 20 }, { type: "hLine", length: -20 }, { type: "close" }] },
        { id: "plate", type: "extrude", profile: "base", distance: 4 },
        {
            id: "lug", type: "script", script: "lugScript",
            params: { size: { expr: "size * 2" }, plate: { body: "plate" }, top: { faces: { of: "plate", role: "end", count: 1 } }, rim: { edges: { between: [{ of: "plate", role: "end" }, { of: "plate", role: "side" }], count: 4 } }, label: "a", list: [{ body: "plate" }, { expr: "size" }, 3] },
        },
        { id: "round", type: "fillet", body: "lug", radius: 1, edges: { between: [{ of: "lug", role: "top" }, { of: "lug", role: "face" }], count: 4 } },
    ],
});

describe("design script features", () => {
    let occt: OCCTService;

    beforeAll(async () => {
        const kernel = await createBitbybitOcct();
        occt = new OCCTService(kernel, new OccHelper(new VectorHelperService(), new ShapesHelperService(), kernel));
    }, 120_000);

    const statuses = (result: Models.OCCT.DesignBuildResult<TopoDS_Shape>): string[][] => result.report.map(entry => [entry.id, entry.status]);

    const box = (): { shape: TopoDS_Shape; top: number } => {
        const shape = occt.shapes.solid.createBox({ width: 6, length: 6, height: 6, center: [0, 0, 3] });
        const top = occt.analysis.signatures({ shape }).faces.findIndex(face => face.normal[2] > 0.99);
        return { shape, top };
    };

    it("should stop at a script feature, listing what the caller runs it on, and skip what reads its body", () => {
        // Arrange
        const document = lugDocument();

        // Act
        const result = occt.design.build({ document, assets: { lugScript: CODE } });

        // Assert
        const pending = result.pending?.[0];
        expect(statuses(result)).toEqual([["base", "ok"], ["plate", "ok"], ["lug", "pending"], ["round", "skipped"]]);
        expect(result.report[3]!.messages).toEqual(["body \"lug\" waits for its outcome"]);
        expect([pending?.id, pending?.path, pending?.script, typeof pending?.hash]).toEqual(["lug", "/features/2", "lugScript", "string"]);
        const inputs = pending!.inputs as { size: number; plate: TopoDS_Shape; top: number[]; rim: number[]; label: string; list: [TopoDS_Shape, number, number] };
        expect([inputs.size, inputs.label, inputs.top.length, inputs.rim.length, inputs.list.slice(1)]).toEqual([20, "a", 1, 4, [10, 3]]);
        inputs.list[0].delete();
        expect(occt.shapes.solid.getSolidVolume({ shape: inputs.plate })).toBeCloseTo(20 * 20 * 4, 6);
        expect(result.parts.map(part => part.id)).toEqual(["plate"]);
        inputs.plate.delete();
    });

    it("should take the outcome the caller supplies, naming the faces by the roles the script gave them, and reuse it from then on", () => {
        // Arrange
        const document = lugDocument();
        const first = occt.design.build({ document, assets: { lugScript: CODE } });
        const hash = first.pending![0]!.hash;
        (first.pending![0]!.inputs["plate"] as TopoDS_Shape).delete();
        const { shape, top } = box();

        // Act
        const supplied = occt.design.build({ document, assets: { lugScript: CODE }, outcomes: [{ hash, shape, roles: { top: [top] } }] });
        shape.delete();
        const again = occt.design.build({ document, assets: { lugScript: CODE } });

        // Assert
        const lug = supplied.parts.find(part => part.id === "lug")!;
        expect(statuses(supplied)).toEqual([["base", "ok"], ["plate", "ok"], ["lug", "ok"], ["round", "ok"]]);
        expect(supplied.pending).toBeUndefined();
        expect(lug.faceNames.filter(names => names.includes("lug:top"))).toHaveLength(1);
        expect(lug.faceNames.every(names => names.some(name => name.startsWith("lug:") || name.startsWith("round:")))).toBe(true);
        expect(occt.shapes.solid.getSolidVolume({ shape: lug.shape })).toBeLessThan(216);
        expect(again.report.map(entry => entry.cached)).toEqual([true, true, true, true]);
        expect(again.pending).toBeUndefined();
    });

    it("should wait again when the script's code changes, under another hash", () => {
        // Arrange
        const first = occt.design.build({ document: lugDocument(CODE, 11), assets: { lugScript: CODE } });
        (first.pending![0]!.inputs["plate"] as TopoDS_Shape).delete();

        // Act
        const changed = occt.design.build({ document: lugDocument(OTHER_CODE, 11), assets: { lugScript: OTHER_CODE } });
        (changed.pending![0]!.inputs["plate"] as TopoDS_Shape).delete();

        // Assert
        expect(changed.pending![0]!.hash).not.toBe(first.pending![0]!.hash);
    });

    it("should fail the feature when its code differs from what the document pins, or its outcome names faces its shape has not", () => {
        // Arrange
        const document = lugDocument(CODE, 12);
        const first = occt.design.build({ document, assets: { lugScript: CODE } });
        const hash = first.pending![0]!.hash;
        (first.pending![0]!.inputs["plate"] as TopoDS_Shape).delete();
        const { shape } = box();

        // Act
        const tampered = occt.design.build({ document, assets: { lugScript: OTHER_CODE } });
        const outOfRange = occt.design.build({ document, assets: { lugScript: CODE }, outcomes: [{ hash, shape, roles: { top: [6] } }] });
        const miscounted = occt.design.build({ document, assets: { lugScript: CODE }, outcomes: [{ hash, shape, names: [["lug:face"]] }] });
        shape.delete();

        // Assert
        expect(tampered.report[2]!.messages[0]).toMatch(/^\/features\/2\/script: the code given for "lugScript" has the SHA-256 /);
        expect(outOfRange.report[2]!.messages).toEqual(["/features/2: its script gave the role \"top\" to face 6, but its shape has 6 faces"]);
        expect(miscounted.report[2]!.messages).toEqual(["/features/2: the outcome supplied for it names 1 faces, but its shape has 6"]);
    });

    it("should check a script feature's code is pinned and its params name what came before", () => {
        // Arrange
        const base = lugDocument();
        const unpinned: Document = { ...base, assets: [{ id: "lugScript", uri: "lug.js" }] };
        const unknownFace: Document = { ...base, features: base.features.map(feature => feature.type === "script" ? { ...feature, params: { top: [{ faces: { of: "nothing", role: "end" } }] } } : feature) };
        const notAnObject = structuredClone(base);
        Reflect.set(notAnObject.features[2]!, "params", [1]);

        // Act
        const paths = [unpinned, unknownFace, notAnObject].map(document => occt.design.validate({ document }).map(issue => issue.path));

        // Assert
        expect(paths).toEqual([["/features/2/script"], ["/features/2/params/top/0/faces/of"], ["/features/2/params"]]);
    });

    it("should not write a document with a script feature as TypeScript", () => {
        // Act
        const write = (): unknown => occt.design.toTypeScript({ document: lugDocument(), assets: { lugScript: CODE } });

        // Assert
        expect(write).toThrow(new InputError("/features/2: a script feature is not written as TypeScript: its code runs outside the kernel", "document"));
    });
});
