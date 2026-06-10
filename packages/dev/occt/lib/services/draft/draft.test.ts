import createBitbybitOcct, { BitbybitOcctModule, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTFace, OCCTSolid } from "../shapes";
import { OCCTDraft } from "./draft";

describe("OCCT draft unit tests", () => {
    let occt: BitbybitOcctModule;
    let occHelper: OccHelper;
    let draft: OCCTDraft;
    let solid: OCCTSolid;
    let face: OCCTFace;

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
    });

    it("should taper a side face of a box by a draft angle and change its volume", () => {
        if (!hasDraft()) { return; }
        const b = box();
        const faces = face.getFaces({ shape: b });
        const volumeBefore = solid.getSolidVolume({ shape: b });
        const sideFace = faces.find(f => {
            const n = occHelper.facesService.faceNormalOnUV({ shape: f, paramU: 0.5, paramV: 0.5 });
            return Math.abs(n[0]) > 0.9;
        }) ?? faces[0];
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
});
