import type { Base } from "@bitbybit-dev/base";
import { describe, expect, it } from "vitest";
import { modelOf } from "../api/services/service-support";
import type { IfcModel } from "../model/model-types";
import { withContext } from "../__test__/geometry-fixtures";
import { CurveSampler } from "./curves";
import { UnsupportedGeometryError } from "./errors";

const UNIT_CIRCLE_ROWS = [
    "#20=IFCCARTESIANPOINT((0.,0.));",
    "#21=IFCAXIS2PLACEMENT2D(#20,$);",
    "#22=IFCCIRCLE(#21,1.);",
];

const DEGREE_UNIT_ROWS = [
    "#40=IFCSIUNIT(*,.PLANEANGLEUNIT.,$,.RADIAN.);",
    "#41=IFCDIMENSIONALEXPONENTS(0,0,0,0,0,0,0);",
    "#42=IFCMEASUREWITHUNIT(IFCPLANEANGLEMEASURE(0.0174532925199433),#40);",
    "#43=IFCCONVERSIONBASEDUNIT(#41,.PLANEANGLEUNIT.,'DEGREE',#42);",
    "#44=IFCUNITASSIGNMENT((#43));",
    "#45=IFCPROJECT('0YvctVUKr0kugbFTf53O9L',$,'Project',$,$,$,$,(#3),#44);",
];

function outlineOf(model: IfcModel, curve: number): Base.Point2[] {
    return new CurveSampler(modelOf(model)).outline(curve);
}

function radii(points: readonly Base.Point2[], center: Base.Point2 = [0, 0]): number[] {
    return points.map(([x, y]) => Math.hypot(x - center[0], y - center[1]));
}

function near(point: readonly number[]): unknown[] {
    return point.map((value) => expect.closeTo(value, 9));
}

describe("CurveSampler", () => {
    it("should read a polyline's points and drop a closing point that repeats the first", () => {
        // Arrange
        const model = withContext([
            "#10=IFCCARTESIANPOINT((0.,0.));",
            "#11=IFCCARTESIANPOINT((4.,0.));",
            "#12=IFCCARTESIANPOINT((4.,3.));",
            "#13=IFCPOLYLINE((#10,#11,#12,#10));",
        ]);

        // Act
        const points = outlineOf(model, 13);

        // Assert
        expect(points).toEqual([[0, 0], [4, 0], [4, 3]]);
    });

    it("should read an indexed poly curve without segments in the order of its point list", () => {
        // Arrange
        const model = withContext([
            "#10=IFCCARTESIANPOINTLIST2D(((0.,0.),(2.,0.),(2.,2.),(0.,0.)));",
            "#11=IFCINDEXEDPOLYCURVE(#10,$,.F.);",
        ]);

        // Act
        const points = outlineOf(model, 11);

        // Assert
        expect(points).toEqual([[0, 0], [2, 0], [2, 2]]);
    });

    it("should chain line segments that share their end points into one outline", () => {
        // Arrange
        const model = withContext([
            "#10=IFCCARTESIANPOINTLIST2D(((0.,0.),(2.,0.),(2.,2.),(0.,2.)));",
            "#11=IFCINDEXEDPOLYCURVE(#10,(IFCLINEINDEX((1,2,3)),IFCLINEINDEX((3,4,1))),.F.);",
        ]);

        // Act
        const points = outlineOf(model, 11);

        // Assert
        expect(points).toEqual([[0, 0], [2, 0], [2, 2], [0, 2]]);
    });

    it("should divide an arc through three points into a point every eleven and a quarter degrees, keeping its ends exact", () => {
        // Arrange
        const model = withContext([
            "#10=IFCCARTESIANPOINTLIST2D(((1.,0.),(0.7071067811865476,0.7071067811865476),(0.,1.),(0.,0.)));",
            "#11=IFCINDEXEDPOLYCURVE(#10,(IFCARCINDEX((1,2,3)),IFCLINEINDEX((3,4,1))),.F.);",
        ]);

        // Act
        const points = outlineOf(model, 11);

        // Assert
        expect(points).toHaveLength(10);
        expect(points[0]).toEqual([1, 0]);
        expect(points[8]).toEqual([0, 1]);
        expect(points[9]).toEqual([0, 0]);
        expect(radii(points.slice(0, 9))).toEqual(Array.from({ length: 9 }, () => expect.closeTo(1, 12)));
        expect(points[4]).toEqual(near([Math.SQRT1_2, Math.SQRT1_2]));
    });

    it("should take an arc through three points that turns clockwise the short way round", () => {
        // Arrange
        const model = withContext([
            "#10=IFCCARTESIANPOINTLIST2D(((0.,1.),(0.7071067811865476,0.7071067811865476),(1.,0.)));",
            "#11=IFCINDEXEDPOLYCURVE(#10,(IFCARCINDEX((1,2,3))),.F.);",
        ]);

        // Act
        const points = outlineOf(model, 11);

        // Assert
        expect(points).toHaveLength(9);
        expect(points.every(([x, y]) => x >= -1e-12 && y >= -1e-12)).toBe(true);
    });

    it("should keep three points in a line as they are", () => {
        // Arrange
        const model = withContext([
            "#10=IFCCARTESIANPOINTLIST2D(((0.,0.),(1.,0.),(2.,0.),(1.,1.)));",
            "#11=IFCINDEXEDPOLYCURVE(#10,(IFCARCINDEX((1,2,3)),IFCLINEINDEX((3,4,1))),.F.);",
        ]);

        // Act
        const points = outlineOf(model, 11);

        // Assert
        expect(points).toEqual([[0, 0], [1, 0], [2, 0], [1, 1]]);
    });

    it("should join a trimmed circle and a polyline of a composite curve into one outline, the arc running counterclockwise between its trim points", () => {
        // Arrange
        const model = withContext([
            ...UNIT_CIRCLE_ROWS,
            "#23=IFCCARTESIANPOINT((0.,-1.));",
            "#24=IFCCARTESIANPOINT((0.,1.));",
            "#25=IFCTRIMMEDCURVE(#22,(#23),(#24),.T.,.CARTESIAN.);",
            "#26=IFCPOLYLINE((#24,#23));",
            "#27=IFCCOMPOSITECURVESEGMENT(.CONTINUOUS.,.T.,#25);",
            "#28=IFCCOMPOSITECURVESEGMENT(.CONTINUOUS.,.T.,#26);",
            "#29=IFCCOMPOSITECURVE((#27,#28),.F.);",
        ]);

        // Act
        const points = outlineOf(model, 29);

        // Assert
        expect(points).toHaveLength(17);
        expect(points[0]).toEqual([0, -1]);
        expect(points[8]).toEqual(near([1, 0]));
        expect(points[16]).toEqual([0, 1]);
    });

    it("should run a segment backwards when it does not share its curve's sense", () => {
        // Arrange
        const model = withContext([
            "#10=IFCCARTESIANPOINT((0.,0.));",
            "#11=IFCCARTESIANPOINT((2.,0.));",
            "#12=IFCCARTESIANPOINT((2.,2.));",
            "#13=IFCPOLYLINE((#10,#11));",
            "#14=IFCPOLYLINE((#10,#12,#11));",
            "#15=IFCCOMPOSITECURVESEGMENT(.CONTINUOUS.,.T.,#13);",
            "#16=IFCCOMPOSITECURVESEGMENT(.CONTINUOUS.,.F.,#14);",
            "#17=IFCCOMPOSITECURVE((#15,#16),.F.);",
        ]);

        // Act
        const points = outlineOf(model, 17);

        // Assert
        expect(points).toEqual([[0, 0], [2, 0], [2, 2]]);
    });

    it("should read trim parameters in the project's angle unit and run clockwise when the sense disagrees", () => {
        // Arrange
        const model = withContext([
            ...UNIT_CIRCLE_ROWS,
            ...DEGREE_UNIT_ROWS,
            "#25=IFCTRIMMEDCURVE(#22,(IFCPARAMETERVALUE(90.)),(IFCPARAMETERVALUE(0.)),.F.,.PARAMETER.);",
        ]);

        // Act
        const points = outlineOf(model, 25);

        // Assert
        expect(points).toHaveLength(9);
        expect(points[0]).toEqual(near([0, 1]));
        expect(points[4]).toEqual(near([Math.SQRT1_2, Math.SQRT1_2]));
        expect(points[8]).toEqual(near([1, 0]));
    });

    it("should prefer the trim parameter over the point when the curve says so, and the point otherwise", () => {
        // Arrange
        const model = withContext([
            ...UNIT_CIRCLE_ROWS,
            ...DEGREE_UNIT_ROWS,
            "#23=IFCCARTESIANPOINT((-1.,0.));",
            "#25=IFCTRIMMEDCURVE(#22,(IFCPARAMETERVALUE(0.)),(#23,IFCPARAMETERVALUE(90.)),.T.,.PARAMETER.);",
            "#26=IFCTRIMMEDCURVE(#22,(IFCPARAMETERVALUE(0.)),(#23,IFCPARAMETERVALUE(90.)),.T.,.CARTESIAN.);",
        ]);

        // Act
        const byParameter = outlineOf(model, 25);
        const byPoint = outlineOf(model, 26);

        // Assert
        expect(byParameter.at(-1)).toEqual(near([0, 1]));
        expect(byPoint.at(-1)).toEqual([-1, 0]);
        expect(byPoint).toHaveLength(17);
    });

    it("should take a whole turn when the trims meet, as a closed circle does", () => {
        // Arrange
        const model = withContext([
            ...UNIT_CIRCLE_ROWS,
            "#23=IFCCARTESIANPOINT((1.,0.));",
            "#25=IFCTRIMMEDCURVE(#22,(#23),(#23),.T.,.CARTESIAN.);",
        ]);

        // Act
        const points = outlineOf(model, 25);

        // Assert
        expect(points).toHaveLength(32);
        expect(radii(points)).toEqual(Array.from({ length: 32 }, () => expect.closeTo(1, 12)));
    });

    it("should outline a whole circle and a whole ellipse in their placements", () => {
        // Arrange
        const model = withContext([
            "#20=IFCCARTESIANPOINT((5.,5.));",
            "#21=IFCDIRECTION((0.,1.));",
            "#22=IFCAXIS2PLACEMENT2D(#20,#21);",
            "#23=IFCCIRCLE(#22,2.);",
            "#24=IFCELLIPSE(#22,4.,1.);",
        ]);

        // Act
        const circle = outlineOf(model, 23);
        const ellipse = outlineOf(model, 24);

        // Assert
        expect(radii(circle, [5, 5])).toEqual(Array.from({ length: 32 }, () => expect.closeTo(2, 12)));
        expect(ellipse).toHaveLength(32);
        expect(ellipse[0]).toEqual(near([5, 9]));
        expect(ellipse[8]).toEqual(near([4, 5]));
    });

    it("should trim a line by its parameters along its vector, and by points as given", () => {
        // Arrange
        const model = withContext([
            "#20=IFCCARTESIANPOINT((1.,1.));",
            "#21=IFCDIRECTION((3.,4.));",
            "#22=IFCVECTOR(#21,2.);",
            "#23=IFCLINE(#20,#22);",
            "#24=IFCTRIMMEDCURVE(#23,(IFCPARAMETERVALUE(0.)),(IFCPARAMETERVALUE(5.)),.T.,.PARAMETER.);",
            "#25=IFCCARTESIANPOINT((7.,9.));",
            "#26=IFCTRIMMEDCURVE(#23,(#20),(#25),.T.,.CARTESIAN.);",
        ]);

        // Act
        const byParameter = outlineOf(model, 24);
        const byPoint = outlineOf(model, 26);

        // Assert
        expect(byParameter).toEqual([[1, 1], near([7, 9])]);
        expect(byPoint).toEqual([[1, 1], [7, 9]]);
    });

    it("should refuse segments naming points the list lacks, arcs without three points, and curves it does not read", () => {
        // Arrange
        const model = withContext([
            "#10=IFCCARTESIANPOINTLIST2D(((0.,0.),(2.,0.),(2.,2.)));",
            "#11=IFCINDEXEDPOLYCURVE(#10,(IFCARCINDEX((1,2))),.F.);",
            "#12=IFCINDEXEDPOLYCURVE(#10,(IFCLINEINDEX((1,2,9))),.F.);",
            "#13=IFCOFFSETCURVE2D(#12,1.,.F.);",
            "#16=IFCINDEXEDPOLYCURVE($,$,.F.);",
            "#17=IFCINDEXEDPOLYCURVE(#10,(IFCLINEINDEX(('a','b'))),.F.);",
            "#18=IFCCOMPOSITECURVE((),.F.);",
            "#19=IFCTRIMMEDCURVE(#12,(IFCPARAMETERVALUE(0.)),(IFCPARAMETERVALUE(1.)),.T.,.PARAMETER.);",
        ]);

        // Act & Assert
        expect(() => outlineOf(model, 11)).toThrow("#11 has an arc through 2 points, not 3");
        expect(() => outlineOf(model, 12)).toThrow("#12 names point 9, which its list does not hold");
        expect(() => outlineOf(model, 13)).toThrow(UnsupportedGeometryError);
        expect(() => outlineOf(model, 16)).toThrow("#16 has no points");
        expect(() => outlineOf(model, 17)).toThrow("A curve segment is not a list of point indices");
        expect(() => outlineOf(model, 18)).toThrow("#18 has no segments");
        expect(() => outlineOf(model, 19)).toThrow("A trimmed IfcIndexedPolyCurve is not supported yet");
    });

    it("should refuse curves that lack what they are made of", () => {
        // Arrange
        const model = withContext([
            ...UNIT_CIRCLE_ROWS,
            "#23=IFCCARTESIANPOINT((1.,0.));",
            "#30=IFCCOMPOSITECURVE(('segment'),.F.);",
            "#31=IFCCOMPOSITECURVESEGMENT(.CONTINUOUS.,.T.,$);",
            "#32=IFCCOMPOSITECURVE((#31),.F.);",
            "#33=IFCTRIMMEDCURVE(#22,(),(#23),.T.,.CARTESIAN.);",
            "#34=IFCTRIMMEDCURVE($,(#23),(#23),.T.,.CARTESIAN.);",
            "#35=IFCLINE(#20,$);",
            "#36=IFCTRIMMEDCURVE(#35,(IFCPARAMETERVALUE(0.)),(IFCPARAMETERVALUE(1.)),.T.,.PARAMETER.);",
            "#37=IFCDIRECTION((0.,0.));",
            "#38=IFCVECTOR(#37,1.);",
            "#39=IFCLINE(#20,#38);",
            "#40=IFCTRIMMEDCURVE(#39,(IFCPARAMETERVALUE(0.)),(IFCPARAMETERVALUE(1.)),.T.,.PARAMETER.);",
            "#41=IFCCIRCLE($,1.);",
            "#42=IFCCIRCLE(#21,0.);",
        ]);

        // Act & Assert
        expect(() => outlineOf(model, 30)).toThrow("#30 has a segment that is not a reference");
        expect(() => outlineOf(model, 32)).toThrow("#31 has no parent curve");
        expect(() => outlineOf(model, 33)).toThrow("#33 has no Trim1 it can be trimmed at");
        expect(() => outlineOf(model, 34)).toThrow("#34 has no basis curve");
        expect(() => outlineOf(model, 36)).toThrow("#35 has no direction");
        expect(() => outlineOf(model, 40)).toThrow("#38 has no direction or no magnitude");
        expect(() => outlineOf(model, 41)).toThrow("#41 has no position");
        expect(() => outlineOf(model, 42)).toThrow("#42 has no radius above zero");
    });

    it("should refuse a composite curve that contains itself", () => {
        // Arrange
        const model = withContext([
            "#10=IFCCOMPOSITECURVESEGMENT(.CONTINUOUS.,.T.,#11);",
            "#11=IFCCOMPOSITECURVE((#10),.F.);",
        ]);

        // Act & Assert
        expect(() => outlineOf(model, 11)).toThrow("nests curves more than 64 deep, or through itself");
    });
});
