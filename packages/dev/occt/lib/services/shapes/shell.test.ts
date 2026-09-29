import { describe, it, expect, beforeAll } from "vitest";
import createBitbybitOcct, { BitbybitOcctModule } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import * as Inputs from "../../api/inputs";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTFace } from "./face";
import { OCCTShell } from "./shell";

describe("OCCT shell unit tests", () => {
    let occt: BitbybitOcctModule;
    let face: OCCTFace;
    let shell: OCCTShell;
    let occHelper: OccHelper;

    beforeAll(async () => {
        occt = await createBitbybitOcct();
        const vec = new VectorHelperService();
        const s = new ShapesHelperService();
        occHelper = new OccHelper(vec, s, occt);
        face = new OCCTFace(occt, occHelper);
        shell = new OCCTShell(occt, occHelper);
    });

    describe("what sewing gives back", () => {
        const square = (x: number): ReturnType<OCCTFace["createSquareFace"]> => face.createSquareFace({ size: 1, center: [x, 0, 0], direction: [0, 1, 0] });
        const typeOf = (shape: Parameters<OCCTShell["getShellSurfaceArea"]>[0]["shape"]): Inputs.OCCT.shapeTypeEnum => occHelper.enumService.getShapeTypeEnum(shape);

        it("should refuse an empty list of faces, naming it", () => {
            // Act
            let refusal: unknown;
            try {
                shell.sewFaces({ shapes: [], tolerance: 1e-7 });
            } catch (failure) {
                refusal = failure;
            }

            // Assert
            expect(refusal).toMatchObject({ name: "InputError", property: "shapes", message: "`shapes` is empty, and sewing needs at least one face." });
        });

        it("should give back a lone face as that face, faces that meet nowhere as a compound, and faces that partly meet as a compound of what joined", () => {
            // Act
            const lone = shell.sewFaces({ shapes: [square(0)], tolerance: 1e-7 });
            const apart = shell.sewFaces({ shapes: [square(0), square(5)], tolerance: 1e-7 });
            const partly = shell.sewFaces({ shapes: [square(0), square(1), square(5)], tolerance: 1e-7 });

            // Assert
            expect([typeOf(lone), typeOf(apart), typeOf(partly)]).toEqual([Inputs.OCCT.shapeTypeEnum.face, Inputs.OCCT.shapeTypeEnum.compound, Inputs.OCCT.shapeTypeEnum.compound]);
            expect(occHelper.shapeGettersService.getShapesOfCompound({ shape: partly }).map(typeOf).sort()).toEqual([Inputs.OCCT.shapeTypeEnum.face, Inputs.OCCT.shapeTypeEnum.shell].sort());
        });
    });

    it("should create a shell from two faces", () => {
        const f1 = face.createSquareFace({ size: 1, center: [0, 0, 0], direction: [0, 1, 0] });
        const f2 = face.createSquareFace({ size: 1, center: [0, 0, 1], direction: [0, 1, 0] });
        const s = shell.sewFaces({ shapes: [f1, f2], tolerance: 1e-7 });
        const area = shell.getShellSurfaceArea({ shape: s });
        expect(occHelper.enumService.getShapeTypeEnum(s)).toBe(Inputs.OCCT.shapeTypeEnum.shell);
        expect(area).toBe(2);
        f1.delete();
        f2.delete();
        s.delete();
    });

    it("should check if the shell is closed", () => {
        const f1 = face.createSquareFace({ size: 1, center: [0, 0, 0], direction: [0, 1, 0] });
        const f2 = face.createSquareFace({ size: 1, center: [0, 0, 1], direction: [0, 1, 0] });
        const s = shell.sewFaces({ shapes: [f1, f2], tolerance: 1e-7 });
        expect(shell.isClosed({ shape: s })).toBe(false);
        f1.delete();
        f2.delete();
        s.delete();
    });

    it("should create a compound shape rather than shell from two faces if tolerance is not picking the edge to form a unified shell", () => {
        const f1 = face.createSquareFace({ size: 1, center: [0, 0, 0], direction: [0, 1, 0] });
        const f2 = face.createSquareFace({ size: 1, center: [0, 0, 1.6], direction: [0, 1, 0] });
        const s = shell.sewFaces({ shapes: [f1, f2], tolerance: 1e-7 });
        const area = shell.getShellSurfaceArea({ shape: s });
        expect(occHelper.enumService.getShapeTypeEnum(s)).toBe(Inputs.OCCT.shapeTypeEnum.compound);
        expect(area).toBe(2);
        f1.delete();
        f2.delete();
        s.delete();
    });

    it("should create a compound shape rather than shell from two faces if tolerance is just a bit off", () => {
        const f1 = face.createSquareFace({ size: 1, center: [0, 0, 0], direction: [0, 1, 0] });
        const f2 = face.createSquareFace({ size: 1, center: [0, 0, 1 + 1e-7], direction: [0, 1, 0] });
        const s = shell.sewFaces({ shapes: [f1, f2], tolerance: 1e-7 });
        const area = shell.getShellSurfaceArea({ shape: s });
        expect(occHelper.enumService.getShapeTypeEnum(s)).toBe(Inputs.OCCT.shapeTypeEnum.compound);
        expect(area).toBe(2);
        f1.delete();
        f2.delete();
        s.delete();
    });

    it("should check if the shell is closed", () => {
        const f1 = face.createSquareFace({ size: 1, center: [0, 0, 0], direction: [0, 1, 0] });
        const f2 = face.createSquareFace({ size: 1, center: [0, 0, 1], direction: [0, 1, 0] });
        const s = shell.sewFaces({ shapes: [f1, f2], tolerance: 1e-7 });
        expect(shell.isClosed({ shape: s })).toBe(false);
        f1.delete();
        f2.delete();
        s.delete();
    });

    it("should recreate a closed shell if sewing all edges of the box", () => {
        const box = occHelper.entitiesService.bRepPrimAPIMakeBox(2, 2, 2, [0, 0, 0]);
        const faces = face.getFaces({shape: box});
        const s = shell.sewFaces({ shapes: faces, tolerance: 1e-7 });
        expect(shell.isClosed({ shape: s })).toBe(true);
        box.delete();
        s.delete();
        faces.forEach(f => f.delete());
    });

});
