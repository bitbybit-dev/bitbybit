import { describe, expect, it } from "vitest";
import { igesLengthUnit, stepLengthUnit, stepOrIgesKindOf } from "./file-units";

const STEP_HEAD = "ISO-10303-21;\nHEADER;\nFILE_DESCRIPTION(('a part; with a semicolon'),'2;1');\nFILE_NAME('part.step','2026-10-26',(''),(''),'','','');\nENDSEC;\nDATA;\n";
const STEP_TAIL = "ENDSEC;\nEND-ISO-10303-21;\n";
const ANGLES = "#14=( NAMED_UNIT(*) PLANE_ANGLE_UNIT() SI_UNIT($,.RADIAN.) );\n#15=( NAMED_UNIT(*) SI_UNIT($,.STERADIAN.) SOLID_ANGLE_UNIT() );\n";
const contextOf = (id: number, length: number): string => `#${String(id)}=( GEOMETRIC_REPRESENTATION_CONTEXT(3) GLOBAL_UNIT_ASSIGNED_CONTEXT\n((#${String(length)},#14,#15)) REPRESENTATION_CONTEXT('Context #1','3D Context with UNIT and UNCERTAINTY') );\n`;
const siStep = (prefix: string): string => `${STEP_HEAD}#13=( LENGTH_UNIT() NAMED_UNIT(*) SI_UNIT(${prefix},.METRE.) );\n${ANGLES}${contextOf(17, 13)}${STEP_TAIL}`;
const INCH_STEP = `${STEP_HEAD}#10=( LENGTH_UNIT() NAMED_UNIT(*) SI_UNIT(.MILLI.,.METRE.) );\n#11=LENGTH_MEASURE_WITH_UNIT(LENGTH_MEASURE(25.4),#10);\n#12=DIMENSIONAL_EXPONENTS(1.,0.,0.,0.,0.,0.,0.);\n/* the model is in inches; */\n#13=( CONVERSION_BASED_UNIT('INCH',#11) LENGTH_UNIT() NAMED_UNIT(#12) );\n${ANGLES}${contextOf(17, 13)}${STEP_TAIL}`;

const igesOf = (fields: readonly string[], recordEnd = ";", parameter = ","): string => {
    const global = fields.join(parameter) + recordEnd;
    const records = Array.from({ length: Math.ceil(global.length / 72) }, (_, index) => global.slice(index * 72, (index + 1) * 72).padEnd(72) + "G" + String(index + 1).padStart(7));
    return ["Made by a test".padEnd(72) + "S      1", ...records, "".padEnd(72) + "T      1"].join("\n");
};
const globalWith = (flag: string, name: string): string[] => ["1H,", "1H;", "4HPART", "9Hpart.igs;", "8HBitbybit", "3H1.0", "32", "38", "6", "308", "15", "4HPART", "1.", flag, name, "1", "0.01", "15H20261026.120000", "1.E-06", "100.", "4HTest", "4HTest", "11", "0"];

describe("file units", () => {
    it("should tell a STEP file from an IGES one by its extension, compressed forms and any case included", () => {
        // Act
        const kinds = ["a.step", "a.STP", "a.stpz", "a.iges", "a.IGS", "a.igz", "a.stl", "a.txt"].map(stepOrIgesKindOf);

        // Assert
        expect(kinds).toEqual(["step", "step", "step", "iges", "iges", "iges", undefined, undefined]);
    });

    it("should read millimetres, centimetres and metres from STEP's SI length unit", () => {
        // Act
        const units = [".MILLI.", ".CENTI.", "$"].map(prefix => stepLengthUnit(siStep(prefix)));

        // Assert
        expect(units).toEqual(["mm", "cm", "m"]);
    });

    it("should read inches from a conversion based unit, past a comment and a semicolon inside a string", () => {
        // Act
        const unit = stepLengthUnit(INCH_STEP);

        // Assert
        expect(unit).toBe("in");
    });

    it("should give undefined for a unit outside the four, contexts that disagree and a file without a unit context", () => {
        // Arrange
        const kilometres = siStep(".KILO.");
        const feet = INCH_STEP.replace("'INCH'", "'FOOT'");
        const twoContexts = siStep(".MILLI.").replace(STEP_TAIL, `#20=( LENGTH_UNIT() NAMED_UNIT(*) SI_UNIT(.CENTI.,.METRE.) );\n${contextOf(21, 20)}${STEP_TAIL}`);
        const noContext = `${STEP_HEAD}#13=( LENGTH_UNIT() NAMED_UNIT(*) SI_UNIT(.MILLI.,.METRE.) );\n${STEP_TAIL}`;

        // Act
        const units = [kilometres, feet, twoContexts, noContext, ""].map(stepLengthUnit);

        // Assert
        expect(units).toEqual([undefined, undefined, undefined, undefined, undefined]);
    });

    it("should read the unit flag of an IGES global section, past a delimiter inside a Hollerith string", () => {
        // Act
        const units = [["1", "4HINCH"], ["2", "2HMM"], ["10", "2HCM"], ["6", "1HM"], ["3", "4HINCH"], ["3", "2HMM"]].map(([flag, name]) => igesLengthUnit(igesOf(globalWith(flag!, name!))));

        // Assert
        expect(units).toEqual(["in", "mm", "cm", "m", "in", "mm"]);
    });

    it("should read IGES with default and with its own delimiters, and records not split into lines", () => {
        // Arrange
        const defaults = igesOf(["", "", ...globalWith("2", "2HMM").slice(2)]);
        const own = igesOf(["1H/", "1H#", ...globalWith("1", "4HINCH").slice(2)], "#", "/");
        const oneLine = igesOf(globalWith("10", "2HCM")).replace(/\n/g, "");

        // Act
        const units = [defaults, own, oneLine].map(igesLengthUnit);

        // Assert
        expect(units).toEqual(["mm", "in", "cm"]);
    });

    it("should give undefined for feet, microns and a file with no global section", () => {
        // Act
        const units = [igesOf(globalWith("4", "2HFT")), igesOf(globalWith("9", "6HMICRON")), igesOf(globalWith("3", "2HFT")), "not an IGES file"].map(igesLengthUnit);

        // Assert
        expect(units).toEqual([undefined, undefined, undefined, undefined]);
    });
});
