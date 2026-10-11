import type { Base } from "@bitbybit-dev/base";
import { describe, expect, it } from "vitest";
import { signedArea2 } from "@bitbybit-dev/base/lib/api/services/helpers/polygons";
import { modelOf } from "../api/services/service-support";
import { CONTEXT_ROWS, withContext } from "../__test__/geometry-fixtures";
import { readModel } from "../model/io";
import type { IfcModel } from "../model/model-types";
import { CurveSampler } from "./curves";
import type { ProfileRegion } from "./geometry-types";
import { profileRegion } from "./profiles";

const quarter = (radius: number): number => radius * radius * (1 - 4 * Math.sin(Math.PI / 16));
const POLYGON_SEGMENTS = 32;
const inscribedEllipse = (a: number, b: number): number => (POLYGON_SEGMENTS / 2) * a * b * Math.sin((2 * Math.PI) / POLYGON_SEGMENTS);

function regionOf(model: IfcModel, profile: number): ProfileRegion {
    const snapshot = modelOf(model);
    return profileRegion(snapshot, profile, new CurveSampler(snapshot));
}

function areaOf(region: ProfileRegion): number {
    if (region.kind !== "polygon") {
        throw new Error(`a ${region.kind} region has no outline`);
    }
    return signedArea2(region.outer) + region.holes.reduce((total, hole) => total + signedArea2(hole), 0);
}

function outerOf(region: ProfileRegion): Base.Point2[] {
    if (region.kind !== "polygon") {
        throw new Error(`a ${region.kind} region has no outline`);
    }
    return region.outer;
}

function near(points: readonly Base.Point2[]): unknown[] {
    return points.map(([x, y]) => [expect.closeTo(x, 9), expect.closeTo(y, 9)]);
}

function ifc2x3(rows: readonly string[]): IfcModel {
    return readModel(["ISO-10303-21;", "HEADER;", "FILE_DESCRIPTION((''),'2;1');", "FILE_NAME('','',(''),(''),'','','');", "FILE_SCHEMA(('IFC2X3'));", "ENDSEC;", "DATA;", ...CONTEXT_ROWS, ...rows, "ENDSEC;", "END-ISO-10303-21;", ""].join("\n"));
}

describe("profileRegion and the open sections", () => {
    it("should outline a C section with its lips turned in, its outer corners rounded by the inner radius and the wall", () => {
        // Arrange
        const model = withContext(["#10=IFCCSHAPEPROFILEDEF(.AREA.,$,$,200.,80.,6.,20.,$);", "#11=IFCCSHAPEPROFILEDEF(.AREA.,$,$,200.,80.,6.,20.,5.);"]);

        // Act
        const [plain, rounded] = [regionOf(model, 10), regionOf(model, 11)];

        // Assert
        expect(plain).toEqual({
            kind: "polygon",
            holes: [],
            outer: [[-40, -100], [40, -100], [40, -80], [34, -80], [34, -94], [-34, -94], [-34, 94], [34, 94], [34, 80], [40, 80], [40, 100], [-40, 100]],
        });
        expect(areaOf(rounded)).toBeCloseTo(2256 - 4 * quarter(11) + 4 * quarter(5), 6);
    });

    it("should outline a Z section with its lower flange to the right and its upper one to the left of the web", () => {
        // Arrange
        const model = withContext(["#10=IFCZSHAPEPROFILEDEF(.AREA.,$,$,200.,80.,8.,10.,$,$);", "#11=IFCZSHAPEPROFILEDEF(.AREA.,$,$,200.,80.,8.,10.,6.,3.);"]);

        // Act
        const [plain, rounded] = [regionOf(model, 10), regionOf(model, 11)];

        // Assert
        expect(plain).toEqual({ kind: "polygon", holes: [], outer: [[-4, -100], [80, -100], [80, -90], [4, -90], [4, 100], [-80, 100], [-80, 90], [-4, 90]] });
        expect(areaOf(rounded)).toBeCloseTo(3120 + 2 * quarter(6) - 2 * quarter(3), 6);
    });

    it("should outline an asymmetric I section with flanges of their own, the top one as thick as the bottom when left out", () => {
        // Arrange
        const model = withContext([
            "#10=IFCASYMMETRICISHAPEPROFILEDEF(.AREA.,$,$,150.,300.,8.,12.,$,100.,10.,$,$,$,$,$);",
            "#11=IFCASYMMETRICISHAPEPROFILEDEF(.AREA.,$,$,150.,300.,8.,12.,10.,100.,10.,8.,3.,$,2.,$);",
            "#12=IFCASYMMETRICISHAPEPROFILEDEF(.AREA.,$,$,150.,300.,8.,12.,$,100.,$,$,$,$,$,$);",
        ]);

        // Act
        const [plain, rounded, even] = [regionOf(model, 10), regionOf(model, 11), regionOf(model, 12)];

        // Assert
        expect(outerOf(plain)).toEqual([[-75, -150], [75, -150], [75, -138], [4, -138], [4, 140], [50, 140], [50, 150], [-50, 150], [-50, 140], [-4, 140], [-4, -138], [-75, -138]]);
        expect(areaOf(rounded)).toBeCloseTo(5024 + 2 * quarter(10) + 2 * quarter(8) - 2 * quarter(3) - 2 * quarter(2), 6);
        expect(areaOf(even)).toBeCloseTo(150 * 12 + 100 * 12 + 8 * 276, 6);
    });

    it("should read an IFC2X3 asymmetric I section without edge radii, where its centre of gravity takes their place", () => {
        // Arrange
        const model = ifc2x3(["#10=IFCASYMMETRICISHAPEPROFILEDEF(.AREA.,$,$,150.,300.,8.,12.,$,100.,10.,$,40.);"]);

        // Act
        const region = regionOf(model, 10);

        // Assert
        expect(areaOf(region)).toBeCloseTo(5024, 6);
    });

    it("should outline a trapezium by its top's offset, and an ellipse by its two semi-axes", () => {
        // Arrange
        const model = withContext(["#10=IFCTRAPEZIUMPROFILEDEF(.AREA.,$,$,100.,60.,200.,10.);", "#11=IFCELLIPSEPROFILEDEF(.AREA.,$,$,100.,50.);"]);

        // Act
        const [trapezium, ellipse] = [regionOf(model, 10), regionOf(model, 11)];

        // Assert
        expect(outerOf(trapezium)).toEqual([[-50, -100], [50, -100], [20, 100], [-40, 100]]);
        expect(outerOf(ellipse)).toHaveLength(POLYGON_SEGMENTS);
        expect(outerOf(ellipse)[0]).toEqual([100, 0]);
        expect(areaOf(ellipse)).toBeCloseTo(inscribedEllipse(100, 50), 6);
    });
});

describe("profileRegion and profiles made from others", () => {
    it("should move, turn and scale a derived profile's placed parent by its operator", () => {
        // Arrange
        const model = withContext([
            "#10=IFCCARTESIANPOINT((30.,10.));",
            "#11=IFCAXIS2PLACEMENT2D(#10,$);",
            "#12=IFCRECTANGLEPROFILEDEF(.AREA.,$,#11,100.,50.);",
            "#13=IFCDIRECTION((0.,1.));",
            "#14=IFCCARTESIANPOINT((100.,-50.));",
            "#15=IFCCARTESIANTRANSFORMATIONOPERATOR2D(#13,$,#14,2.);",
            "#16=IFCDERIVEDPROFILEDEF(.AREA.,$,#12,#15,$);",
        ]);

        // Act
        const region = regionOf(model, 16);

        // Assert
        expect(outerOf(region)).toEqual(near([[130, -90], [130, 110], [30, 110], [30, -90]]));
    });

    it("should keep a circle a circle under a uniform operator and outline it as an ellipse under a non-uniform one", () => {
        // Arrange
        const model = withContext([
            "#10=IFCCIRCLEHOLLOWPROFILEDEF(.AREA.,$,$,50.,10.);",
            "#11=IFCCARTESIANPOINT((5.,5.));",
            "#12=IFCCARTESIANTRANSFORMATIONOPERATOR2D($,$,#11,3.);",
            "#13=IFCDERIVEDPROFILEDEF(.AREA.,$,#10,#12,$);",
            "#14=IFCCARTESIANTRANSFORMATIONOPERATOR2DNONUNIFORM($,$,#11,2.,0.5);",
            "#15=IFCDERIVEDPROFILEDEF(.AREA.,$,#10,#14,$);",
        ]);

        // Act
        const [uniform, stretched] = [regionOf(model, 13), regionOf(model, 15)];

        // Assert
        expect(uniform).toEqual({ kind: "circle", center: [5, 5], radius: 150, innerRadius: 120 });
        expect(areaOf(stretched)).toBeCloseTo(inscribedEllipse(100, 25) - inscribedEllipse(80, 20), 6);
        expect(stretched.kind === "polygon" && stretched.holes).toHaveLength(1);
    });

    it("should mirror a profile about the y axis after its parent is placed, wound counterclockwise again", () => {
        // Arrange
        const model = withContext([
            "#10=IFCCARTESIANPOINT((40.,25.));",
            "#11=IFCAXIS2PLACEMENT2D(#10,$);",
            "#12=IFCRECTANGLEPROFILEDEF(.AREA.,$,#11,100.,50.);",
            "#13=IFCMIRROREDPROFILEDEF(.AREA.,$,#12,*,$);",
        ]);

        // Act
        const region = regionOf(model, 13);

        // Assert
        expect(outerOf(region)).toEqual(near([[10, 50], [-90, 50], [-90, 0], [10, 0]]));
        expect(areaOf(region)).toBeCloseTo(5000, 6);
    });

    it("should mirror each part of a composite parent", () => {
        // Arrange
        const model = withContext([
            "#10=IFCCARTESIANPOINT((20.,0.));",
            "#11=IFCAXIS2PLACEMENT2D(#10,$);",
            "#12=IFCCIRCLEPROFILEDEF(.AREA.,$,#11,5.);",
            "#13=IFCRECTANGLEPROFILEDEF(.AREA.,$,#11,4.,2.);",
            "#14=IFCCOMPOSITEPROFILEDEF(.AREA.,$,(#12,#13),$);",
            "#15=IFCMIRROREDPROFILEDEF(.AREA.,$,#14,*,$);",
        ]);

        // Act
        const region = regionOf(model, 15);

        // Assert
        expect(region.kind === "composite" && region.parts[0]).toEqual({ kind: "circle", center: [-20, 0], radius: 5, innerRadius: 0 });
        expect(region.kind === "composite" && region.parts[1] && outerOf(region.parts[1])).toEqual(near([[-18, 1], [-22, 1], [-22, -1], [-18, -1]]));
    });

    it("should combine a composite profile's parts, and refuse one without parts and a derived profile without an operator or a parent", () => {
        // Arrange
        const model = withContext([
            "#10=IFCRECTANGLEPROFILEDEF(.AREA.,$,$,2.,2.);",
            "#11=IFCCIRCLEPROFILEDEF(.AREA.,$,$,1.);",
            "#12=IFCCOMPOSITEPROFILEDEF(.AREA.,$,(#10,#11),$);",
            "#13=IFCCOMPOSITEPROFILEDEF(.AREA.,$,(),$);",
            "#14=IFCDERIVEDPROFILEDEF(.AREA.,$,#10,$,$);",
            "#15=IFCDERIVEDPROFILEDEF(.AREA.,$,$,$,$);",
        ]);

        // Act
        const composite = regionOf(model, 12);

        // Assert
        expect(composite).toEqual({ kind: "composite", parts: [regionOf(model, 10), { kind: "circle", center: [0, 0], radius: 1, innerRadius: 0 }] });
        expect(() => regionOf(model, 13)).toThrow("#13 combines no profiles");
        expect(() => regionOf(model, 14)).toThrow("#14 has no transformation operator");
        expect(() => regionOf(model, 15)).toThrow("#15 has no parent profile");
    });
});
