import type { Base } from "@bitbybit-dev/base";
import { describe, expect, it } from "vitest";
import { modelOf } from "../api/services/service-support";
import { withContext } from "../__test__/geometry-fixtures";
import { CurveSampler } from "./curves";
import { EdgeSampler } from "./edges";

const PROJECT_ROWS = ["#90=IFCSIUNIT(*,.PLANEANGLEUNIT.,$,.RADIAN.);", "#91=IFCUNITASSIGNMENT((#90));", "#92=IFCPROJECT('0YvctVUKr0kugbFTf53O9L',$,'Project',$,$,$,$,(#3),#91);"];
const VERTEX_ROWS = [
    "#10=IFCCARTESIANPOINT((0.,0.,0.));",
    "#11=IFCCARTESIANPOINT((4.,0.,0.));",
    "#12=IFCCARTESIANPOINT((4.,4.,0.));",
    "#13=IFCVERTEXPOINT(#10);",
    "#14=IFCVERTEXPOINT(#11);",
    "#15=IFCVERTEXPOINT(#12);",
];
const SPLINE_ROW = "#20=IFCBSPLINECURVEWITHKNOTS(2,(#10,#11,#12),.UNSPECIFIED.,.F.,.F.,(3,3),(0.,1.),.UNSPECIFIED.);";

function loopOf(rows: readonly string[], loop: number): Base.Point3[] {
    const model = modelOf(withContext([...PROJECT_ROWS, ...VERTEX_ROWS, ...rows]));
    return new EdgeSampler(model, new CurveSampler(model)).loop(loop);
}

function near(point: readonly number[]): unknown[] {
    return point.map((value) => expect.closeTo(value, 9));
}

describe("EdgeSampler", () => {
    it("should run a loop of oriented edges from vertex to vertex, an edge turned back when its orientation is false", () => {
        // Arrange
        const rows = [
            "#30=IFCPOLYLINE((#10,#11));",
            "#31=IFCEDGECURVE(#13,#14,#30,.T.);",
            "#32=IFCPOLYLINE((#11,#12));",
            "#33=IFCEDGECURVE(#14,#15,#32,.T.);",
            "#34=IFCEDGECURVE(#13,#15,$,.T.);",
            "#35=IFCORIENTEDEDGE(*,*,#31,.T.);",
            "#36=IFCORIENTEDEDGE(*,*,#33,.T.);",
            "#37=IFCORIENTEDEDGE(*,*,#34,.F.);",
            "#38=IFCEDGELOOP((#35,#36,#37));",
        ];

        // Act
        const points = loopOf(rows, 38);

        // Assert
        expect(points).toEqual([[0, 0, 0], [4, 0, 0], [4, 4, 0]]);
    });

    it("should follow a circle between its vertices in the edge's sense, the whole way round when they are one", () => {
        // Arrange
        const rows = [
            "#30=IFCAXIS2PLACEMENT3D(#10,$,$);",
            "#31=IFCCIRCLE(#30,4.);",
            "#32=IFCCARTESIANPOINT((0.,4.,0.));",
            "#33=IFCVERTEXPOINT(#32);",
            "#34=IFCEDGECURVE(#14,#33,#31,.T.);",
            "#35=IFCEDGECURVE(#14,#33,#31,.F.);",
            "#36=IFCEDGECURVE(#14,#14,#31,.T.);",
            "#37=IFCEDGELOOP((#38));",
            "#38=IFCORIENTEDEDGE(*,*,#34,.T.);",
            "#39=IFCEDGELOOP((#40));",
            "#40=IFCORIENTEDEDGE(*,*,#35,.T.);",
            "#41=IFCEDGELOOP((#42));",
            "#42=IFCORIENTEDEDGE(*,*,#36,.T.);",
        ];

        // Act
        const [quarter, longWay, whole] = [loopOf(rows, 37), loopOf(rows, 39), loopOf(rows, 41)];

        // Assert
        expect(quarter).toHaveLength(8);
        expect(quarter[1]).toEqual(near([4 * Math.cos(Math.PI / 16), 4 * Math.sin(Math.PI / 16), 0]));
        expect(longWay).toHaveLength(24);
        expect(longWay[1]![1]).toBeLessThan(0);
        expect(whole).toHaveLength(32);
    });

    it("should follow a B-spline between the parameters nearest its vertices, and the whole of one whose vertices meet", () => {
        // Arrange
        const rows = [
            SPLINE_ROW,
            "#21=IFCCARTESIANPOINT((2.,1.,0.));",
            "#22=IFCVERTEXPOINT(#21);",
            "#30=IFCEDGECURVE(#13,#15,#20,.T.);",
            "#31=IFCORIENTEDEDGE(*,*,#30,.T.);",
            "#32=IFCEDGELOOP((#31));",
            "#33=IFCBSPLINECURVEWITHKNOTS(2,(#10,#11,#12,#10),.UNSPECIFIED.,.T.,.F.,(3,1,3),(0.,0.5,1.),.UNSPECIFIED.);",
            "#34=IFCEDGECURVE(#13,#13,#33,.T.);",
            "#35=IFCORIENTEDEDGE(*,*,#34,.T.);",
            "#36=IFCEDGELOOP((#35));",
        ];

        // Act
        const [open, closed] = [loopOf(rows, 32), loopOf(rows, 36)];

        // Assert
        expect(open[0]).toEqual([0, 0, 0]);
        expect(open[open.length / 2]).toEqual(near([3, 1, 0]));
        expect(closed.length).toBeGreaterThan(8);
        expect(closed[0]).toEqual([0, 0, 0]);
    });

    it("should follow a curve on a surface through its curve in space, and a weight-multiplied spline divided when its vertices say so", () => {
        // Arrange
        const rows = [
            SPLINE_ROW,
            "#30=IFCSURFACECURVE(#20,(),.CURVE3D.);",
            "#31=IFCEDGECURVE(#13,#15,#30,.T.);",
            "#32=IFCORIENTEDEDGE(*,*,#31,.T.);",
            "#33=IFCEDGELOOP((#32));",
            "#40=IFCCARTESIANPOINT((8.,8.,0.));",
            "#41=IFCRATIONALBSPLINECURVEWITHKNOTS(2,(#10,#11,#40),.UNSPECIFIED.,.F.,.F.,(3,3),(0.,1.),.UNSPECIFIED.,(1.,1.,2.));",
            "#42=IFCEDGECURVE(#13,#15,#41,.T.);",
            "#43=IFCORIENTEDEDGE(*,*,#42,.T.);",
            "#44=IFCEDGELOOP((#43));",
        ];

        // Act
        const [onSurface, weighted] = [loopOf(rows, 33), loopOf(rows, 44)];
        const model = modelOf(withContext([...PROJECT_ROWS, ...VERTEX_ROWS, ...rows]));
        const curves = new CurveSampler(model);
        const asWritten = curves.splinePoints(curves.bspline(41), 1, 1)[0];

        // Assert
        expect(onSurface[onSurface.length / 2]).toEqual(near([3, 1, 0]));
        expect(asWritten).toEqual(near([8, 8, 0]));
        expect(weighted.every(([x, y]) => x <= 4 + 1e-9 && y <= 4 + 1e-9)).toBe(true);
    });

    it("should read a polygon loop as its points, and a rational spline whose ends meet its vertices as written", () => {
        // Arrange
        const rows = [
            "#30=IFCPOLYLOOP((#10,#11,#12));",
            "#31=IFCRATIONALBSPLINECURVEWITHKNOTS(2,(#10,#11,#12),.UNSPECIFIED.,.F.,.F.,(3,3),(0.,1.),.UNSPECIFIED.,(1.,2.,1.));",
            "#32=IFCEDGECURVE(#13,#15,#31,.T.);",
            "#33=IFCORIENTEDEDGE(*,*,#32,.T.);",
            "#34=IFCEDGELOOP((#33));",
        ];

        // Act
        const [polygon, rational] = [loopOf(rows, 30), loopOf(rows, 34)];

        // Assert
        expect(polygon).toEqual([[0, 0, 0], [4, 0, 0], [4, 4, 0]]);
        expect(rational[rational.length >> 1]![0]).toBeGreaterThan(3);
    });

    it("should refuse a loop of a kind it does not read, a vertex without a point, an oriented edge without an edge and a curve on a surface without a curve in space", () => {
        // Arrange
        const rows = [
            "#30=IFCVERTEXLOOP(#13);",
            "#31=IFCVERTEXPOINT($);",
            "#32=IFCEDGECURVE(#31,#13,$,.T.);",
            "#33=IFCORIENTEDEDGE(*,*,#32,.T.);",
            "#34=IFCEDGELOOP((#33));",
            "#35=IFCORIENTEDEDGE(*,*,$,.T.);",
            "#36=IFCEDGELOOP((#35));",
            "#37=IFCSURFACECURVE($,(),.CURVE3D.);",
            "#38=IFCEDGECURVE(#13,#14,#37,.T.);",
            "#39=IFCORIENTEDEDGE(*,*,#38,.T.);",
            "#40=IFCEDGELOOP((#39));",
        ];

        // Act & Assert
        expect(() => loopOf(rows, 30)).toThrow("A face bounded by an IfcVertexLoop is not supported yet");
        expect(() => loopOf(rows, 34)).toThrow("#32 has a vertex without a point");
        expect(() => loopOf(rows, 36)).toThrow("#35 has no edge");
        expect(() => loopOf(rows, 40)).toThrow("#37 has no curve in space");
    });
});
