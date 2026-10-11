import type { Base } from "@bitbybit-dev/base";
import { describe, expect, it } from "vitest";
import { modelOf } from "../api/services/service-support";
import { withContext } from "../__test__/geometry-fixtures";
import { CurveSampler } from "./curves";
import type { ParametricSurface } from "./geometry-types";
import { parametricSurface } from "./surfaces";

const PROJECT_ROWS = ["#90=IFCSIUNIT(*,.PLANEANGLEUNIT.,$,.RADIAN.);", "#91=IFCUNITASSIGNMENT((#90));", "#92=IFCPROJECT('0YvctVUKr0kugbFTf53O9L',$,'Project',$,$,$,$,(#3),#91);"];
const PLACEMENT_ROWS = ["#20=IFCCARTESIANPOINT((1.,2.,3.));", "#21=IFCDIRECTION((0.,0.,1.));", "#22=IFCDIRECTION((1.,0.,0.));", "#23=IFCAXIS2PLACEMENT3D(#20,#21,#22);"];

function surfaceOf(rows: readonly string[], surface: number, divided = false): ParametricSurface | undefined {
    const model = modelOf(withContext([...PROJECT_ROWS, ...PLACEMENT_ROWS, ...rows]));
    return parametricSurface(model, new CurveSampler(model), surface, divided);
}

function roundTrips(surface: ParametricSurface | undefined, samples: readonly Base.Point2[]): number {
    if (!surface) {
        throw new Error("no surface");
    }
    return Math.max(...samples.map(([u, v]) => {
        const point = surface.point(u, v);
        const [back, up] = surface.parameters(point, undefined);
        const again = surface.point(back, up);
        return Math.hypot(again[0] - point[0], again[1] - point[1], again[2] - point[2]);
    }));
}

const SAMPLES: readonly Base.Point2[] = [[0.1, 0.2], [1, 0.5], [2.5, -0.3], [-1, 0.8]];

describe("parametricSurface and the analytic surfaces", () => {
    it("should map points of a plane, cylinder, sphere and torus back to the parameters that give them", () => {
        // Arrange
        const rows = ["#30=IFCPLANE(#23);", "#31=IFCCYLINDRICALSURFACE(#23,2.);", "#33=IFCSPHERICALSURFACE(#23,2.);", "#34=IFCTOROIDALSURFACE(#23,3.,1.);"];

        // Act
        const misses = [30, 31, 33, 34].map((surface) => roundTrips(surfaceOf(rows, surface), SAMPLES));

        // Assert
        expect(misses.every((miss) => miss < 1e-9)).toBe(true);
    });

    it("should place each surface by its position and give its periods and poles", () => {
        // Arrange
        const rows = ["#31=IFCCYLINDRICALSURFACE(#23,2.);", "#33=IFCSPHERICALSURFACE(#23,2.);", "#34=IFCTOROIDALSURFACE(#23,3.,1.);", "#35=IFCPLANE(#23);"];

        // Act
        const [cylinder, sphere, torus, plane] = [31, 33, 34, 35].map((surface) => surfaceOf(rows, surface)!);

        // Assert
        expect(cylinder!.point(0, 1)).toEqual([3, 2, 4]);
        expect([cylinder!.periods, torus!.periods, plane!.periods]).toEqual([[2 * Math.PI, undefined], [2 * Math.PI, 2 * Math.PI], [undefined, undefined]]);
        expect([sphere!.pole(1, 1), sphere!.pole(1, -1), sphere!.pole(0, 1)]).toEqual([Math.PI / 2, -Math.PI / 2, undefined]);
        expect([torus!.pole(0, 1), cylinder!.pole(1, 1), plane!.pole(1, 1)]).toEqual([undefined, undefined, undefined]);
    });

    it("should give nothing for a surface it does not read, and the basis of a trimmed surface", () => {
        // Arrange
        const rows = ["#30=IFCPLANE(#23);", "#31=IFCRECTANGULARTRIMMEDSURFACE(#30,0.,0.,1.,1.,.T.,.T.);", "#32=IFCOFFSETCURVE2D($,1.,.F.);"];

        // Act
        const [trimmed, odd] = [surfaceOf(rows, 31), surfaceOf(rows, 32)];

        // Assert
        expect(trimmed?.point(1, 1)).toEqual([2, 3, 3]);
        expect(odd).toBeUndefined();
    });
});

describe("parametricSurface and the swept and spline surfaces", () => {
    it("should turn a profile about its axis with the profile's length as the first parameter and the angle as the second", () => {
        // Arrange
        const rows = [
            "#30=IFCCARTESIANPOINT((0.,0.,0.));",
            "#31=IFCCARTESIANPOINT((2.,0.,0.));",
            "#32=IFCCARTESIANPOINT((2.,0.,4.));",
            "#33=IFCPOLYLINE((#30,#31,#32));",
            "#34=IFCARBITRARYOPENPROFILEDEF(.CURVE.,$,#33);",
            "#35=IFCAXIS1PLACEMENT(#30,#21);",
            "#36=IFCSURFACEOFREVOLUTION(#34,$,#35);",
        ];

        // Act
        const surface = surfaceOf(rows, 36)!;

        // Assert
        expect(surface.point(4, Math.PI / 2).map((value) => Math.round(value * 1e9) / 1e9)).toEqual([0, 2, 2]);
        expect(surface.periods).toEqual([undefined, 2 * Math.PI]);
        expect([surface.pole(0, -1), surface.pole(0, 1), surface.pole(1, 1)]).toEqual([0, undefined, undefined]);
        expect(roundTrips(surface, [[1, 0.3], [3, 2], [5, -1]])).toBeLessThan(1e-9);
    });

    it("should extrude a closed curve into a surface whose first parameter repeats with the curve's length", () => {
        // Arrange
        const rows = [
            "#30=IFCCARTESIANPOINT((0.,0.));",
            "#31=IFCAXIS2PLACEMENT2D(#30,$);",
            "#32=IFCCIRCLE(#31,1.);",
            "#33=IFCARBITRARYOPENPROFILEDEF(.CURVE.,$,#32);",
            "#34=IFCSURFACEOFLINEAREXTRUSION(#33,#23,#21,5.);",
        ];

        // Act
        const surface = surfaceOf(rows, 34)!;

        // Assert
        expect(surface.periods[0]).toBeCloseTo(2 * Math.PI, 2);
        expect(surface.point(0, 2)).toEqual([2, 2, 5]);
        expect(roundTrips(surface, [[1, 0.3], [3, 2], [5, -1]])).toBeLessThan(1e-9);
    });

    it("should evaluate a B-spline patch, close it where its flags say, find its poles and read a weight-multiplied net when asked", () => {
        // Arrange
        const rows = [
            "#30=IFCCARTESIANPOINT((0.,0.,0.));",
            "#31=IFCCARTESIANPOINT((0.,2.,0.));",
            "#32=IFCCARTESIANPOINT((2.,0.,0.));",
            "#33=IFCCARTESIANPOINT((2.,2.,2.));",
            "#34=IFCBSPLINESURFACEWITHKNOTS(1,1,((#30,#31),(#32,#33)),.UNSPECIFIED.,.F.,.T.,.F.,(2,2),(2,2),(0.,1.),(0.,1.),.UNSPECIFIED.);",
            "#35=IFCBSPLINESURFACEWITHKNOTS(1,1,((#30,#30),(#32,#33)),.UNSPECIFIED.,.F.,.F.,.F.,(2,2),(2,2),(0.,1.),(0.,1.),.UNSPECIFIED.);",
            "#36=IFCRATIONALBSPLINESURFACEWITHKNOTS(1,1,((#30,#31),(#32,#33)),.UNSPECIFIED.,.F.,.F.,.F.,(2,2),(2,2),(0.,1.),(0.,1.),.UNSPECIFIED.,((1.,1.),(1.,2.)));",
        ];

        // Act
        const [patch, pointed, weighted, divided] = [surfaceOf(rows, 34)!, surfaceOf(rows, 35)!, surfaceOf(rows, 36)!, surfaceOf(rows, 36, true)!];

        // Assert
        expect(patch.point(0.5, 0.5)).toEqual([1, 1, 0.5]);
        expect(patch.periods).toEqual([undefined, 1]);
        expect(roundTrips(patch, [[0.2, 0.3], [0.7, 0.9]])).toBeLessThan(1e-9);
        expect([pointed.pole(0, -1), pointed.pole(0, 1), pointed.pole(1, -1)]).toEqual([0, undefined, undefined]);
        expect(weighted.point(1, 1)).toEqual([2, 2, 2]);
        expect(divided.point(1, 1)).toEqual([1, 1, 1]);
    });
});

describe("parametricSurface and surfaces it cannot read", () => {
    it("should refuse a radius of nothing, a revolution without an axis or with its profile on it, a swept surface without a curve and a spline whose knots do not fit", () => {
        // Arrange
        const rows = [
            "#30=IFCCYLINDRICALSURFACE(#23,0.);",
            "#31=IFCCARTESIANPOINT((0.,0.,0.));",
            "#32=IFCCARTESIANPOINT((0.,0.,4.));",
            "#33=IFCPOLYLINE((#31,#32));",
            "#34=IFCARBITRARYOPENPROFILEDEF(.CURVE.,$,#33);",
            "#35=IFCAXIS1PLACEMENT(#31,#21);",
            "#36=IFCSURFACEOFREVOLUTION(#34,$,#35);",
            "#37=IFCSURFACEOFREVOLUTION(#34,$,$);",
            "#38=IFCSURFACEOFLINEAREXTRUSION($,$,#21,1.);",
            "#39=IFCBSPLINESURFACEWITHKNOTS(1,1,((#31,#32),(#31,#32)),.UNSPECIFIED.,.F.,.F.,.F.,(2,1),(2,2),(0.,1.),(0.,1.),.UNSPECIFIED.);",
            "#40=IFCBSPLINESURFACEWITHKNOTS(1,1,((#31,#32),(#31,#32)),.UNSPECIFIED.,.F.,.F.,.F.,(2,2),$,(0.,1.),(0.,1.),.UNSPECIFIED.);",
            "#41=IFCBSPLINESURFACEWITHKNOTS($,1,((#31,#32),(#31,#32)),.UNSPECIFIED.,.F.,.F.,.F.,(2,2),(2,2),(0.,1.),(0.,1.),.UNSPECIFIED.);",
            "#42=IFCBSPLINESURFACEWITHKNOTS(1,1,$,.UNSPECIFIED.,.F.,.F.,.F.,(2,2),(2,2),(0.,1.),(0.,1.),.UNSPECIFIED.);",
        ];

        // Act & Assert
        expect(() => surfaceOf(rows, 30)).toThrow("#30 has no Radius above zero");
        expect(() => surfaceOf(rows, 36)).toThrow("A surface of revolution has its whole profile on its axis");
        expect(() => surfaceOf(rows, 37)).toThrow("#37 has no axis");
        expect(() => surfaceOf(rows, 38)).toThrow("#38 sweeps no curve");
        expect(() => surfaceOf(rows, 39)).toThrow("#39 has knots that do not match its control points");
        expect(() => surfaceOf(rows, 40)).toThrow("#40 has no VMultiplicities");
        expect(() => surfaceOf(rows, 41)).toThrow("#41 is not a B-spline surface it can read");
        expect(() => surfaceOf(rows, 42)).toThrow("#42 is not a B-spline surface it can read");
    });

    it("should find a pole along the second parameter of a spline whose last column meets in a point, and give each pole its own parameter's end", () => {
        // Arrange
        const rows = [
            "#30=IFCCARTESIANPOINT((0.,0.,0.));",
            "#31=IFCCARTESIANPOINT((2.,0.,0.));",
            "#32=IFCCARTESIANPOINT((1.,2.,0.));",
            "#33=IFCBSPLINESURFACEWITHKNOTS(1,1,((#30,#32),(#31,#32)),.UNSPECIFIED.,.F.,.F.,.F.,(2,2),(2,2),(0.,1.),(0.,1.),.UNSPECIFIED.);",
            "#34=IFCBSPLINESURFACEWITHKNOTS(1,1,((#30,#32),(#31,#32)),.UNSPECIFIED.,.F.,.F.,.F.,(2,2),(2,2),(1.,2.),(0.,3.),.UNSPECIFIED.);",
            "#35=IFCBSPLINESURFACEWITHKNOTS(1,1,((#30,#30),(#31,#32)),.UNSPECIFIED.,.F.,.F.,.F.,(2,2),(2,2),(1.,2.),(0.,3.),.UNSPECIFIED.);",
        ];

        // Act
        const [surface, stretched, pointed] = [surfaceOf(rows, 33)!, surfaceOf(rows, 34)!, surfaceOf(rows, 35)!];

        // Assert
        expect([surface.pole(1, 1), surface.pole(1, -1)]).toEqual([1, undefined]);
        expect([stretched.pole(1, 1), pointed.pole(0, -1)]).toEqual([3, 1]);
    });
});
