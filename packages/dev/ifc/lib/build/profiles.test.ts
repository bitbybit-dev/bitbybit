import { describe, expect, it } from "vitest";
import { writingIntoNewModel } from "../__test__/build-setup";
import { refOf } from "../__test__/build-geometry";
import * as Inputs from "../api/inputs";
import type { ProfileSpec } from "./build-types";
import { checkProfile, writeProfile } from "./profiles";

const STEEL_I: ProfileSpec = { kind: Inputs.IFC.profileKindEnum.iShape, width: 150, depth: 300, webThickness: 7, flangeThickness: 11 };

describe("checkProfile", () => {
    it("should accept a rectangle, a circle and an I section of positive sizes", () => {
        // Act & Assert
        expect(() => checkProfile({ kind: Inputs.IFC.profileKindEnum.rectangle, width: 200, depth: 400 })).not.toThrow();
        expect(() => checkProfile({ kind: Inputs.IFC.profileKindEnum.circle, radius: 80 })).not.toThrow();
        expect(() => checkProfile(STEEL_I)).not.toThrow();
    });

    it.each<[ProfileSpec, string]>([
        [{ kind: Inputs.IFC.profileKindEnum.rectangle, width: 0, depth: 400 }, "width"],
        [{ kind: Inputs.IFC.profileKindEnum.rectangle, width: 200, depth: -1 }, "depth"],
        [{ kind: Inputs.IFC.profileKindEnum.circle, radius: Number.NaN }, "radius"],
        [{ ...STEEL_I, width: Infinity }, "width"],
        [{ ...STEEL_I, webThickness: 0 }, "web thickness"],
        [{ ...STEEL_I, flangeThickness: -11 }, "flange thickness"],
    ])("should refuse %j for its %s", (profile, what) => {
        // Act & Assert
        expect(() => checkProfile(profile)).toThrow(`The profile's ${what} must be more than zero`);
    });

    it("should refuse an I section whose web is no thinner than its flanges are wide", () => {
        // Act & Assert
        expect(() => checkProfile({ ...STEEL_I, webThickness: 150 })).toThrow("An I section's web must be thinner than its flanges are wide");
    });

    it("should refuse an I section whose flanges together are no thinner than its depth", () => {
        // Act & Assert
        expect(() => checkProfile({ ...STEEL_I, flangeThickness: 150 })).toThrow("An I section's two flanges must be thinner together than its depth");
    });
});

describe("writeProfile", () => {
    it("should centre each section on the profile's origin and name it when given a name", () => {
        // Arrange
        const { tx, writer } = writingIntoNewModel();

        // Act
        const profile = writeProfile(writer, STEEL_I, "IPE 300");

        // Assert
        const position = refOf(tx.attribute(profile, "Position"));
        expect(tx.entity(profile).type).toBe("IfcIShapeProfileDef");
        expect(tx.attribute(profile, "ProfileName")).toBe("IPE 300");
        expect(tx.attribute(refOf(tx.attribute(position, "Location")), "Coordinates")).toEqual([0, 0]);
        expect(tx.attribute(position, "RefDirection")).toBe(null);
    });

    it("should write nothing for a section it refuses", () => {
        // Arrange
        const { tx, writer } = writingIntoNewModel();
        const before = tx.byType("IfcProfileDef").length;

        // Act & Assert
        expect(() => writeProfile(writer, { kind: Inputs.IFC.profileKindEnum.circle, radius: 0 }, undefined)).toThrow("The profile's radius must be more than zero");
        expect(tx.byType("IfcProfileDef")).toHaveLength(before);
    });
});
