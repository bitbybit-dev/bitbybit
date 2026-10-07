import { describe, expect, it } from "vitest";
import { modelOf } from "../api/services/service-support";
import { withContext } from "../__test__/geometry-fixtures";
import type { IfcModel } from "../model/model-types";
import { CurveSampler } from "./curves";
import type { ProfileRegion } from "./geometry-types";
import { profileRegion } from "./profiles";

function regionOf(model: IfcModel, profile: number): ProfileRegion {
    const snapshot = modelOf(model);
    return profileRegion(snapshot, profile, new CurveSampler(snapshot));
}

describe("profileRegion", () => {
    it("should wind an arbitrary outline counterclockwise and its holes clockwise", () => {
        // Arrange
        const model = withContext([
            "#10=IFCCARTESIANPOINTLIST2D(((0.,0.),(0.,10.),(10.,10.),(10.,0.)));",
            "#11=IFCINDEXEDPOLYCURVE(#10,$,.F.);",
            "#12=IFCCARTESIANPOINTLIST2D(((2.,2.),(4.,2.),(4.,4.),(2.,4.)));",
            "#13=IFCINDEXEDPOLYCURVE(#12,$,.F.);",
            "#14=IFCARBITRARYPROFILEDEFWITHVOIDS(.AREA.,$,#11,(#13));",
        ]);

        // Act
        const region = regionOf(model, 14);

        // Assert
        expect(region).toEqual({ kind: "polygon", outer: [[10, 0], [10, 10], [0, 10], [0, 0]], holes: [[[2, 4], [4, 4], [4, 2], [2, 2]]] });
    });

    it("should place a rectangle by its position, turned and moved", () => {
        // Arrange
        const model = withContext([
            "#10=IFCCARTESIANPOINT((10.,20.));",
            "#11=IFCDIRECTION((0.,1.));",
            "#12=IFCAXIS2PLACEMENT2D(#10,#11);",
            "#13=IFCRECTANGLEPROFILEDEF(.AREA.,$,#12,4.,2.);",
        ]);

        // Act
        const region = regionOf(model, 13);

        // Assert
        expect(region).toEqual({ kind: "polygon", outer: [[11, 18], [11, 22], [9, 22], [9, 18]], holes: [] });
    });

    it("should describe a circle by its placed centre and radius", () => {
        // Arrange
        const model = withContext([
            "#10=IFCCARTESIANPOINT((5.,-5.));",
            "#11=IFCAXIS2PLACEMENT2D(#10,$);",
            "#12=IFCCIRCLEPROFILEDEF(.AREA.,$,#11,2.5);",
        ]);

        // Act
        const region = regionOf(model, 12);

        // Assert
        expect(region).toEqual({ kind: "circle", center: [5, -5], radius: 2.5 });
    });

    it("should outline an I section with twelve corners", () => {
        // Arrange
        const model = withContext(["#10=IFCISHAPEPROFILEDEF(.AREA.,$,$,100.,200.,10.,20.,$,$,$);"]);

        // Act
        const region = regionOf(model, 10);

        // Assert
        expect(region).toEqual({
            kind: "polygon",
            holes: [],
            outer: [[-50, -100], [50, -100], [50, -80], [5, -80], [5, 80], [50, 80], [50, 100], [-50, 100], [-50, 80], [-5, 80], [-5, -80], [-50, -80]],
        });
    });

    it("should refuse a profile type it does not read, an outline without a curve and a missing size", () => {
        // Arrange
        const model = withContext([
            "#10=IFCLSHAPEPROFILEDEF(.AREA.,$,$,100.,100.,10.,$,$,$,$);",
            "#11=IFCARBITRARYCLOSEDPROFILEDEF(.AREA.,$,$);",
            "#12=IFCRECTANGLEPROFILEDEF(.AREA.,$,$,$,2.);",
        ]);

        // Act & Assert
        expect(() => regionOf(model, 10)).toThrow("An IfcLShapeProfileDef profile is not supported yet");
        expect(() => regionOf(model, 11)).toThrow("#11 has no outer curve");
        expect(() => regionOf(model, 12)).toThrow("#12 has no finite XDim");
    });
});
