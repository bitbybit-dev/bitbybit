import initOpenCascade, { OpenCascadeInstance } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { EnumService } from "./enum.service";
import * as Inputs from "../../api/inputs/inputs";

describe("OCCT enum service unit tests", () => {
    let occt: OpenCascadeInstance;
    let enumService: EnumService;
    let occHelper: OccHelper;

    beforeAll(async () => {
        occt = await initOpenCascade();
        enumService = new EnumService(occt);
        const vec = new VectorHelperService();
        const s = new ShapesHelperService();
        occHelper = new OccHelper(vec, s, occt);
    });

    it("should get gcc position unqualified", async () => {
        const res = enumService.getGccEntPositionFromEnum(Inputs.OCCT.gccEntPositionEnum.unqualified);
        expect(res).toEqual(occt.GccEnt_Position.GccEnt_unqualified);
    });

    it("should get gcc position enclosed", async () => {
        const res = enumService.getGccEntPositionFromEnum(Inputs.OCCT.gccEntPositionEnum.enclosed);
        expect(res).toEqual(occt.GccEnt_Position.GccEnt_enclosed);
    });

    it("should get gcc position enclosing", async () => {
        const res = enumService.getGccEntPositionFromEnum(Inputs.OCCT.gccEntPositionEnum.enclosing);
        expect(res).toEqual(occt.GccEnt_Position.GccEnt_enclosing);
    });

    it("should get gcc position outside", async () => {
        const res = enumService.getGccEntPositionFromEnum(Inputs.OCCT.gccEntPositionEnum.outside);
        expect(res).toEqual(occt.GccEnt_Position.GccEnt_outside);
    });

    it("should get gcc position noqualifier", async () => {
        const res = enumService.getGccEntPositionFromEnum(Inputs.OCCT.gccEntPositionEnum.noqualifier);
        expect(res).toEqual(occt.GccEnt_Position.GccEnt_noqualifier);
    });

    it("should get gcc position noqualifier if unrecognized value is forcefully passed", async () => {
        const res = enumService.getGccEntPositionFromEnum("whatever" as any);
        expect(res).toEqual(occt.GccEnt_Position.GccEnt_noqualifier);
    });

    it("should get top abs state enum as unknown if unrecognized value is forcefully passed", async () => {
        const res = enumService.getTopAbsStateEnum("whatever" as any);
        expect(res).toEqual(Inputs.OCCT.topAbsStateEnum.unknown);
    });

    it("should convert four sides strict enum to two circle inclusion enum and return none if unrecognized value is forcefully passed", async () => {
        const res = enumService.convertFourSidesStrictEnumToTwoCircleInclusionEnum("whatever" as any);
        expect(res).toEqual(Inputs.OCCT.twoCircleInclusionEnum.none);
    });

    describe("getShapeTypeEnum", () => {
        it("should return vertex for a vertex shape", () => {
            const vertex = occHelper.entitiesService.makeVertex([1, 2, 3]);
            const res = enumService.getShapeTypeEnum(vertex);
            expect(res).toEqual(Inputs.OCCT.shapeTypeEnum.vertex);
            vertex.delete();
        });

        it("should return edge for an edge shape", () => {
            const edge = occHelper.edgesService.lineEdge({ start: [0, 0, 0], end: [1, 0, 0] });
            const res = enumService.getShapeTypeEnum(edge);
            expect(res).toEqual(Inputs.OCCT.shapeTypeEnum.edge);
            edge.delete();
        });

        it("should return wire for a wire shape", () => {
            const wire = occHelper.wiresService.createPolygonWire({ points: [[0, 0, 0], [1, 0, 0], [1, 1, 0]] });
            const res = enumService.getShapeTypeEnum(wire);
            expect(res).toEqual(Inputs.OCCT.shapeTypeEnum.wire);
            wire.delete();
        });

        it("should return face for a face shape", () => {
            const face = occHelper.facesService.createSquareFace({ size: 1, center: [0, 0, 0], direction: [0, 1, 0] });
            const res = enumService.getShapeTypeEnum(face);
            expect(res).toEqual(Inputs.OCCT.shapeTypeEnum.face);
            face.delete();
        });

        it("should return shell for a shell shape", () => {
            // Create a shell by sewing two faces together
            const face1 = occHelper.facesService.createSquareFace({ size: 1, center: [0, 0, 0], direction: [0, 0, 1] });
            const face2 = occHelper.facesService.createSquareFace({ size: 1, center: [0, 0.5, 0.5], direction: [0, 1, 0] });
            const shell = occHelper.shellsService.sewFaces({ shapes: [face1, face2], tolerance: 1e-7 });
            const res = enumService.getShapeTypeEnum(shell);
            expect(res).toEqual(Inputs.OCCT.shapeTypeEnum.shell);
            face1.delete();
            face2.delete();
            shell.delete();
        });

        it("should return solid for a solid shape", () => {
            const box = occHelper.solidsService.createBox({ width: 1, height: 1, length: 1, center: [0, 0, 0] });
            const res = enumService.getShapeTypeEnum(box);
            expect(res).toEqual(Inputs.OCCT.shapeTypeEnum.solid);
            box.delete();
        });

        it("should return compound for a compound shape", () => {
            const box1 = occHelper.solidsService.createBox({ width: 1, height: 1, length: 1, center: [0, 0, 0] });
            const box2 = occHelper.solidsService.createBox({ width: 1, height: 1, length: 1, center: [5, 0, 0] });
            const compound = occHelper.converterService.makeCompound({ shapes: [box1, box2] });
            const res = enumService.getShapeTypeEnum(compound);
            expect(res).toEqual(Inputs.OCCT.shapeTypeEnum.compound);
            box1.delete();
            box2.delete();
            compound.delete();
        });
    });

    describe("getGeomFillTrihedronEnumOCCTValue", () => {
        it("should return GeomFill_IsConstantNormal for isConstantNormal", () => {
            const res = enumService.getGeomFillTrihedronEnumOCCTValue(Inputs.OCCT.geomFillTrihedronEnum.isConstantNormal);
            expect(res).toEqual(occt.GeomFill_Trihedron.GeomFill_IsConstantNormal);
        });

        it("should return GeomFill_IsCorrectedFrenet for isCorrectedFrenet", () => {
            const res = enumService.getGeomFillTrihedronEnumOCCTValue(Inputs.OCCT.geomFillTrihedronEnum.isCorrectedFrenet);
            expect(res).toEqual(occt.GeomFill_Trihedron.GeomFill_IsCorrectedFrenet);
        });

        it("should return GeomFill_IsDarboux for isDarboux", () => {
            const res = enumService.getGeomFillTrihedronEnumOCCTValue(Inputs.OCCT.geomFillTrihedronEnum.isDarboux);
            expect(res).toEqual(occt.GeomFill_Trihedron.GeomFill_IsDarboux);
        });

        it("should return GeomFill_IsDiscreteTrihedron for isDiscreteTrihedron", () => {
            const res = enumService.getGeomFillTrihedronEnumOCCTValue(Inputs.OCCT.geomFillTrihedronEnum.isDiscreteTrihedron);
            expect(res).toEqual(occt.GeomFill_Trihedron.GeomFill_IsDiscreteTrihedron);
        });

        it("should return GeomFill_IsFixed for isFixed", () => {
            const res = enumService.getGeomFillTrihedronEnumOCCTValue(Inputs.OCCT.geomFillTrihedronEnum.isFixed);
            expect(res).toEqual(occt.GeomFill_Trihedron.GeomFill_IsFixed);
        });

        it("should return GeomFill_IsFrenet for isFrenet", () => {
            const res = enumService.getGeomFillTrihedronEnumOCCTValue(Inputs.OCCT.geomFillTrihedronEnum.isFrenet);
            expect(res).toEqual(occt.GeomFill_Trihedron.GeomFill_IsFrenet);
        });

        it("should return GeomFill_IsGuideAC for isGuideAC", () => {
            const res = enumService.getGeomFillTrihedronEnumOCCTValue(Inputs.OCCT.geomFillTrihedronEnum.isGuideAC);
            expect(res).toEqual(occt.GeomFill_Trihedron.GeomFill_IsGuideAC);
        });

        it("should return GeomFill_IsGuideACWithContact for isGuideACWithContact", () => {
            const res = enumService.getGeomFillTrihedronEnumOCCTValue(Inputs.OCCT.geomFillTrihedronEnum.isGuideACWithContact);
            expect(res).toEqual(occt.GeomFill_Trihedron.GeomFill_IsGuideACWithContact);
        });

        it("should return GeomFill_IsGuidePlan for isGuidePlan", () => {
            const res = enumService.getGeomFillTrihedronEnumOCCTValue(Inputs.OCCT.geomFillTrihedronEnum.isGuidePlan);
            expect(res).toEqual(occt.GeomFill_Trihedron.GeomFill_IsGuidePlan);
        });

        it("should return GeomFill_IsGuidePlanWithContact for isGuidePlanWithContact", () => {
            const res = enumService.getGeomFillTrihedronEnumOCCTValue(Inputs.OCCT.geomFillTrihedronEnum.isGuidePlanWithContact);
            expect(res).toEqual(occt.GeomFill_Trihedron.GeomFill_IsGuidePlanWithContact);
        });

        it("should return GeomFill_IsConstantNormal as default for unrecognized value", () => {
            const res = enumService.getGeomFillTrihedronEnumOCCTValue("whatever" as any);
            expect(res).toEqual(occt.GeomFill_Trihedron.GeomFill_IsConstantNormal);
        });
    });
});

