import initOpenCascade, { OpenCascadeInstance } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { EnumService } from "./enum.service";
import * as Inputs from "../../api/inputs/inputs";

describe("OCCT booleans unit tests", () => {
    let occt: OpenCascadeInstance;
    let enumService: EnumService;

    beforeAll(async () => {
        occt = await initOpenCascade();
        enumService = new EnumService(occt);
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
});

