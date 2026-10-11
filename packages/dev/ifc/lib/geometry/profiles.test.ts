import { describe, expect, it } from "vitest";
import { modelOf } from "../api/services/service-support";
import { withContext } from "../__test__/geometry-fixtures";
import type { IfcModel } from "../model/model-types";
import { CurveSampler } from "./curves";
import type { ProfileRegion } from "./geometry-types";
import { profileRegion } from "./profiles";
import { signedArea2 } from "@bitbybit-dev/base/lib/api/services/helpers/polygons";

const DEGREE_PROJECT_ROWS = [
    "#40=IFCSIUNIT(*,.PLANEANGLEUNIT.,$,.RADIAN.);",
    "#41=IFCDIMENSIONALEXPONENTS(0,0,0,0,0,0,0);",
    "#42=IFCMEASUREWITHUNIT(IFCPLANEANGLEMEASURE(0.0174532925199433),#40);",
    "#43=IFCCONVERSIONBASEDUNIT(#41,.PLANEANGLEUNIT.,'DEGREE',#42);",
    "#44=IFCUNITASSIGNMENT((#43));",
    "#45=IFCPROJECT('0YvctVUKr0kugbFTf53O9L',$,'Project',$,$,$,$,(#3),#44);",
];
const DEGREE = 0.0174532925199433;
const quarter = (radius: number): number => radius * radius * (1 - 4 * Math.sin(Math.PI / 16));

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
        expect(region).toEqual({ kind: "circle", center: [5, -5], radius: 2.5, innerRadius: 0 });
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
            "#10=IFCCENTERLINEPROFILEDEF(.AREA.,$,#11,5.);",
            "#11=IFCARBITRARYCLOSEDPROFILEDEF(.AREA.,$,$);",
            "#12=IFCRECTANGLEPROFILEDEF(.AREA.,$,$,$,2.);",
        ]);

        // Act & Assert
        expect(() => regionOf(model, 10)).toThrow("An IfcCenterLineProfileDef profile is not supported yet");
        expect(() => regionOf(model, 11)).toThrow("#11 has no outer curve");
        expect(() => regionOf(model, 12)).toThrow("#12 has no finite XDim");
    });

    it("should round an I section's fillets and flange edges, taking a fillet's corner area in and an edge's out", () => {
        // Arrange
        const model = withContext(["#10=IFCISHAPEPROFILEDEF(.AREA.,$,$,100.,200.,10.,20.,8.,3.,$);"]);
        const plain = 2 * 100 * 20 + 160 * 10;

        // Act
        const region = regionOf(model, 10);

        // Assert
        expect(region.kind === "polygon" && signedArea2(region.outer)).toBeCloseTo(plain + 4 * quarter(8) - 4 * quarter(3), 6);
    });

    it("should slope an I section's flanges from their thickness at the flange tip, in the model's angle unit", () => {
        // Arrange
        const model = withContext([...DEGREE_PROJECT_ROWS, "#10=IFCISHAPEPROFILEDEF(.AREA.,$,$,100.,200.,10.,20.,$,$,5.);"]);

        // Act
        const region = regionOf(model, 10);

        // Assert
        const rise = 45 * Math.tan(5 * DEGREE);
        expect(region.kind === "polygon" && region.outer.slice(2, 4)).toEqual([[50, -80], [5, -80 + rise]]);
    });

    it("should outline an L section at its bounding box's centre, its width the depth when left out, with its fillet and edge radii", () => {
        // Arrange
        const model = withContext(["#10=IFCLSHAPEPROFILEDEF(.AREA.,$,$,100.,$,10.,$,$,$);", "#11=IFCLSHAPEPROFILEDEF(.AREA.,$,$,100.,60.,10.,6.,2.,$);"]);

        // Act
        const [square, rounded] = [regionOf(model, 10), regionOf(model, 11)];

        // Assert
        expect(square).toEqual({ kind: "polygon", outer: [[-50, -50], [50, -50], [50, -40], [-40, -40], [-40, 50], [-50, 50]], holes: [] });
        expect(rounded.kind === "polygon" && signedArea2(rounded.outer)).toBeCloseTo(100 * 10 + 50 * 10 + quarter(6) - 2 * quarter(2), 6);
    });

    it("should slope a U section's flanges about their thickness at the profile's centre line", () => {
        // Arrange
        const model = withContext([...DEGREE_PROJECT_ROWS, "#10=IFCUSHAPEPROFILEDEF(.AREA.,$,$,200.,80.,10.,12.,$,$,5.);"]);
        const slope = Math.tan(5 * DEGREE);

        // Act
        const region = regionOf(model, 10);

        // Assert
        const flanges = 2 * (12 * 70 - slope * (40 * 40 - 30 * 30) / 2);
        expect(region.kind === "polygon" && signedArea2(region.outer)).toBeCloseTo(200 * 10 + flanges, 6);
    });

    it("should outline a T section with its flange on top, rounded where its radii say", () => {
        // Arrange
        const model = withContext(["#10=IFCTSHAPEPROFILEDEF(.AREA.,$,$,100.,80.,10.,12.,$,$,$,$,$);", "#11=IFCTSHAPEPROFILEDEF(.AREA.,$,$,100.,80.,10.,12.,5.,2.,1.,$,$);"]);

        // Act
        const [plain, rounded] = [regionOf(model, 10), regionOf(model, 11)];

        // Assert
        expect(plain).toEqual({ kind: "polygon", holes: [], outer: [[5, -50], [5, 38], [40, 38], [40, 50], [-40, 50], [-40, 38], [-5, 38], [-5, -50]] });
        expect(rounded.kind === "polygon" && signedArea2(rounded.outer)).toBeCloseTo(80 * 12 + 88 * 10 + 2 * quarter(5) - 2 * quarter(2) - 2 * quarter(1), 6);
    });

    it("should outline hollow and rounded rectangles, and describe a hollow circle by its inner radius", () => {
        // Arrange
        const model = withContext([
            "#10=IFCRECTANGLEHOLLOWPROFILEDEF(.AREA.,$,$,100.,60.,5.,$,$);",
            "#11=IFCROUNDEDRECTANGLEPROFILEDEF(.AREA.,$,$,100.,60.,10.);",
            "#12=IFCCIRCLEHOLLOWPROFILEDEF(.AREA.,$,$,50.,5.);",
        ]);

        // Act
        const [hollow, roundedRectangle, tube] = [regionOf(model, 10), regionOf(model, 11), regionOf(model, 12)];

        // Assert
        expect(hollow).toEqual({ kind: "polygon", outer: [[-50, -30], [50, -30], [50, 30], [-50, 30]], holes: [[[-45, 25], [45, 25], [45, -25], [-45, -25]]] });
        expect(roundedRectangle.kind === "polygon" && signedArea2(roundedRectangle.outer)).toBeCloseTo(6000 - 4 * quarter(10), 6);
        expect(tube).toEqual({ kind: "circle", center: [0, 0], radius: 50, innerRadius: 45 });
    });

    it("should refuse the slopes of L and T sections and a hollow circle whose wall fills it", () => {
        // Arrange
        const model = withContext([
            "#10=IFCLSHAPEPROFILEDEF(.AREA.,$,$,100.,100.,10.,$,$,5.);",
            "#11=IFCTSHAPEPROFILEDEF(.AREA.,$,$,100.,80.,10.,12.,$,$,$,5.,$);",
            "#12=IFCCIRCLEHOLLOWPROFILEDEF(.AREA.,$,$,5.,5.);",
        ]);

        // Act & Assert
        expect(() => regionOf(model, 10)).toThrow("#10 has a LegSlope, which is not supported yet");
        expect(() => regionOf(model, 11)).toThrow("#11 has a WebSlope, which is not supported yet");
        expect(() => regionOf(model, 12)).toThrow("#12 has a wall as thick as its radius");
    });
});
