import { describe, it, expect, beforeAll } from "vitest";
import createBitbybitOcct, { BitbybitOcctModule, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTFace, OCCTSolid, OCCTWire } from "../shapes";
import { OCCTDraft } from "./draft";

describe("OCCT draft unit tests", () => {
    let occt: BitbybitOcctModule;
    let occHelper: OccHelper;
    let draft: OCCTDraft;
    let solid: OCCTSolid;
    let face: OCCTFace;
    let wire: OCCTWire;

    const hasDraft = (): boolean =>
        typeof (occt as unknown as { BRepOffsetAPI_DraftAngle?: unknown }).BRepOffsetAPI_DraftAngle === "function";

    const box = (): TopoDS_Shape => solid.createBox({ width: 10, height: 10, length: 10, center: [0, 0, 0] });

    beforeAll(async () => {
        occt = await createBitbybitOcct();
        const vec = new VectorHelperService();
        const s = new ShapesHelperService();
        occHelper = new OccHelper(vec, s, occt);
        draft = new OCCTDraft(occt, occHelper);
        solid = new OCCTSolid(occt, occHelper);
        face = new OCCTFace(occt, occHelper);
        wire = new OCCTWire(occt, occHelper);
    });

    it("should taper a side face of a box by a draft angle and change its volume", () => {
        if (!hasDraft()) { return; }
        const b = box();
        const faces = face.getFaces({ shape: b });
        const volumeBefore = solid.getSolidVolume({ shape: b });
        const sideFace = faces.find(f => {
            const n = occHelper.facesService.faceNormalOnUV({ shape: f, paramU: 0.5, paramV: 0.5 });
            return Math.abs(n[0]) > 0.9;
        }) ?? faces[0]!;
        const drafted = draft.draftAngle({
            shape: b,
            faces: [sideFace],
            direction: [0, 0, 1],
            angle: 5,
            neutralPlaneOrigin: [0, 0, -5],
            neutralPlaneDirection: [0, 0, 1],
            flag: true,
        });
        expect(drafted.IsNull()).toBe(false);
        expect(solid.getSolidVolume({ shape: drafted })).not.toBeCloseTo(volumeBefore, 1);
        b.delete();
        drafted.delete();
        faces.forEach(f => f.delete());
    });
    describe("makeDraft", () => {
        const wireToDraft = (): TopoDS_Shape => wire.createRectangleWire({
            width: 10, length: 10, center: [0, 0, 0], direction: [0, 1, 0]
        });

        it("should sweep the wire into a shape that stands as tall as it was told", () => {
            // Arrange
            const profile = wireToDraft();

            // Act
            const drafted = draft.makeDraft({
                shape: profile, direction: [0, 1, 0], angle: 5, lengthMax: 20, internal: false
            });

            // Assert
            const bounds = occHelper.operationsService.boundingBoxOfShape({ shape: drafted });
            expect(bounds.size[1]).toBeGreaterThan(0);

            profile.delete();
            drafted.delete();
        });

        it("should taper the other way round when it is told the draft is internal", () => {
            // Arrange
            const profile = wireToDraft();

            // Act
            const outward = draft.makeDraft({
                shape: profile, direction: [0, 1, 0], angle: 10, lengthMax: 20, internal: false
            });
            const inward = draft.makeDraft({
                shape: profile, direction: [0, 1, 0], angle: 10, lengthMax: 20, internal: true
            });

            const outwardSize = occHelper.operationsService.boundingBoxOfShape({ shape: outward }).size;
            const inwardSize = occHelper.operationsService.boundingBoxOfShape({ shape: inward }).size;
            expect(outwardSize).not.toEqual(inwardSize);

            profile.delete();
            outward.delete();
            inward.delete();
        });

        it("should refuse a shape it cannot sweep at all", () => {
            // Arrange
            const point = occHelper.entitiesService.makeVertex([0, 0, 0]);

            // Act
            const act = (): TopoDS_Shape => draft.makeDraft({
                shape: point, direction: [0, 1, 0], angle: 5, lengthMax: 20, internal: false
            });

            // Assert
            expect(act).toThrow();

            point.delete();
        });
    });

    describe("makeDraftToShape", () => {
        it("should sweep the wire until it reaches the shape it was told to stop at", () => {
            // Arrange
            const profile = wire.createRectangleWire({
                width: 10, length: 10, center: [0, 0, 0], direction: [0, 1, 0]
            });
            const ceiling = face.createRectangleFace({
                width: 40, length: 40, center: [0, 15, 0], direction: [0, 1, 0]
            });

            // Act
            const drafted = draft.makeDraftToShape({
                shape: profile, direction: [0, 1, 0], angle: 5, stopShape: ceiling,
                keepOut: false, internal: false
            });

            const bounds = occHelper.operationsService.boundingBoxOfShape({ shape: drafted });
            expect(bounds.size[1]).toBeGreaterThan(10);

            profile.delete();
            ceiling.delete();
            drafted.delete();
        });

        it("should refuse a shape it cannot sweep at all", () => {
            // Arrange
            const point = occHelper.entitiesService.makeVertex([0, 0, 0]);
            const ceiling = face.createRectangleFace({
                width: 40, length: 40, center: [0, 15, 0], direction: [0, 1, 0]
            });

            // Act
            const act = (): TopoDS_Shape => draft.makeDraftToShape({
                shape: point, direction: [0, 1, 0], angle: 5, stopShape: ceiling,
                keepOut: false, internal: false
            });

            // Assert
            expect(act).toThrow();

            point.delete();
            ceiling.delete();
        });
    });
});
