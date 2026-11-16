import { describe, expect, it } from "vitest";
import * as Inputs from "../../inputs";
import { nurbsCurvePoint } from "../helpers/curves/nurbs";
import { Svg } from "./svg";
import { parseSvgPathData, svgSubpathPoints } from "../helpers/files/svg/svg-path-data";

type Planar = Inputs.Base.Point2;
type Point3 = Inputs.Base.Point3;
type Segments = Inputs.IO.DrawingPathDto["segments"];

const SAMPLES_PER_CURVE = 64;

const svg = new Svg();

const dataOf = (segments: Segments, flipY = false, tolerance = 0.01): string => svg.pathData({ path: { segments }, flipY, tolerance });

const allPoints = (data: string): Planar[] => parseSvgPathData(data).flatMap(subpath => svgSubpathPoints(subpath, SAMPLES_PER_CURVE, 0));

const nearestTo = (point: Planar, curve: (t: number) => Planar, steps = 400): number => {
    const distanceAt = (t: number): number => {
        const on = curve(Math.min(1, Math.max(0, t)));
        return Math.hypot(point[0] - on[0], point[1] - on[1]);
    };
    let best = 0;
    for (let step = 1; step <= steps; step++) {
        if (distanceAt(step / steps) < distanceAt(best / steps)) {
            best = step;
        }
    }
    let low = (best - 1) / steps;
    let high = (best + 1) / steps;
    for (let round = 0; round < 80; round++) {
        const left = low + (high - low) / 3;
        const right = high - (high - low) / 3;
        if (distanceAt(left) < distanceAt(right)) {
            high = right;
        } else {
            low = left;
        }
    }
    return distanceAt((low + high) / 2);
};

const cross = (a: Point3, b: Point3): Point3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit = (a: Point3): Point3 => {
    const length = Math.hypot(...a);
    return [a[0] / length, a[1] / length, a[2] / length];
};

describe("SVG path data", () => {
    it("should write straight segments exactly, joined into one stroke that closes where it returns to its start", () => {
        // Act
        const data = dataOf([
            { start: [0, 0], end: [10, 0] },
            { points: [[10, 0], [10, 5], [0, 5]] },
            { start: [0, 0], end: [0, 5] },
        ]);

        // Assert
        expect(data).toBe("M0 0 L10 0 L10 5 L0 5 L0 0 Z");
    });

    it("should draw bulged polylines as exact arcs: a slot with round ends", () => {
        // Act
        const data = dataOf([{ points: [[0, 0], [30, 0], [30, 10], [0, 10]], closed: true, bulges: [0, 1, 0, 1] }]);

        // Assert
        const onSlot = (point: Planar): number => Math.min(
            point[1] >= -1e-9 && point[0] >= 0 && point[0] <= 30 ? Math.min(Math.abs(point[1]), Math.abs(point[1] - 10)) : Infinity,
            Math.abs(Math.hypot(point[0] - 30, point[1] - 5) - 5) + (point[0] >= 30 - 1e-9 ? 0 : Infinity),
            Math.abs(Math.hypot(point[0], point[1] - 5) - 5) + (point[0] <= 1e-9 ? 0 : Infinity),
        );
        const points = allPoints(data);
        expect(data).toMatch(/^M0 0 L30 0 A5 5 0 0 1 30 10 L0 10 A5 5 0 0 1 0 0 Z$/);
        expect(Math.max(...points.map(onSlot))).toBeLessThan(1e-9);
        expect(Math.max(...points.map(point => point[0]))).toBeCloseTo(35, 9);
        expect(Math.min(...points.map(point => point[0]))).toBeCloseTo(-5, 9);
    });

    it("should mirror every point and turn every arc the other way when Y is flipped", () => {
        // Arrange
        const segments: Segments = [{ center: [3, 4], radius: 2, startAngle: 10, endAngle: 250 }, { center: [1, 1], majorAxis: [3, 1], ratio: 0.5, startParameter: 0.2, endParameter: 4 }];

        // Act
        const up = allPoints(dataOf(segments, false));
        const down = allPoints(dataOf(segments, true));

        // Assert
        expect(down).toHaveLength(up.length);
        down.forEach((point, at) => {
            expect(point[0]).toBeCloseTo(up[at]![0], 9);
            expect(point[1]).toBeCloseTo(-up[at]![1], 9);
        });
    });

    it("should draw circles, arcs and ellipses exactly, also tilted out of the plane, as the ellipses their shadows are", () => {
        // Arrange
        const normal: Point3 = [1, 1, 1];
        const z = unit(normal);
        const x = unit(cross([0, 0, 1], z));
        const y = cross(z, x);
        const tiltedCircle = (t: number): Planar => {
            const angle = 2 * Math.PI * t;
            return [2 + 3 * (Math.cos(angle) * x[0] + Math.sin(angle) * y[0]), -1 + 3 * (Math.cos(angle) * x[1] + Math.sin(angle) * y[1])];
        };

        // Act
        const circle = allPoints(dataOf([{ center: [5, 5], radius: 4 }]));
        const arc = allPoints(dataOf([{ center: [0, 0], radius: 1, startAngle: 0, endAngle: 90 }]));
        const ellipse = allPoints(dataOf([{ center: [0, 0], majorAxis: [Math.cos(0.5) * 6, Math.sin(0.5) * 6], ratio: 0.5 }]));
        const tilted = allPoints(dataOf([{ center: [2, -1, 4], radius: 3, normal }]));

        // Assert
        expect(Math.max(...circle.map(point => Math.abs(Math.hypot(point[0] - 5, point[1] - 5) - 4)))).toBeLessThan(1e-9);
        expect(arc[0]).toEqual([1, 0]);
        expect(arc[arc.length - 1]![0]).toBeCloseTo(0, 12);
        expect(arc[arc.length - 1]![1]).toBeCloseTo(1, 12);
        expect(arc.every(point => point[0] >= -1e-9 && point[1] >= -1e-9)).toBe(true);
        expect(Math.max(...ellipse.map(point => {
            const along = point[0] * Math.cos(0.5) + point[1] * Math.sin(0.5);
            const across = -point[0] * Math.sin(0.5) + point[1] * Math.cos(0.5);
            return Math.abs((along / 6) ** 2 + (across / 3) ** 2 - 1);
        }))).toBeLessThan(2e-6);
        expect(Math.max(...tilted.map(point => nearestTo(point, tiltedCircle)))).toBeLessThan(2e-6);
        expect(Math.max(...tilted.map(point => Math.hypot(point[0] - 2, point[1] + 1)))).toBeCloseTo(3, 4);
    });

    it("should run an arc about a normal pointing down the other way round, the short way between its ends", () => {
        // Act
        const points = allPoints(dataOf([{ center: [0, 0], radius: 1, startAngle: 0, endAngle: 90, normal: [0, 0, -1] }]));

        // Assert
        expect(points[0]![0]).toBeCloseTo(-1, 12);
        expect(points.at(-1)![1]).toBeCloseTo(1, 12);
        expect(points.every(point => point[0] <= 1e-9 && point[1] >= -1e-9 && Math.abs(Math.hypot(point[0], point[1]) - 1) < 1e-6)).toBe(true);
    });

    it("should start and end a tilted ellipse arc exactly where its shadow's ends are, its axes slanted in the shadow", () => {
        // Arrange
        const normal: Point3 = [0, -1, 1];
        const major: Point3 = [1, 1, 1];
        const minor = unit(cross(unit(normal), major)).map(value => value * 0.5 * Math.hypot(...major)) as Point3;
        const shadowAt = (parameter: number): Planar => [0, 1].map(axis => 2 + Math.cos(parameter) * major[axis]! + Math.sin(parameter) * minor[axis]!) as Planar;

        // Act
        const points = allPoints(dataOf([{ center: [2, 2, 2], majorAxis: major, ratio: 0.5, startParameter: 0.3, endParameter: 2, normal }]));

        // Assert
        [0, 1].forEach(axis => {
            expect(points[0]![axis]).toBeCloseTo(shadowAt(0.3)[axis]!, 5);
            expect(points.at(-1)![axis]).toBeCloseTo(shadowAt(2)[axis]!, 5);
        });
        expect(Math.max(...points.map(point => nearestTo(point, t => shadowAt(0.3 + 1.7 * t))))).toBeLessThan(2e-6);
    });

    it("should start and end a tilted arc exactly where its shadow's ends are", () => {
        // Arrange
        const normal: Point3 = [1, 1, 1];
        const z = unit(normal);
        const x = unit(cross([0, 0, 1], z));
        const y = cross(z, x);
        const shadowAt = (degrees: number): Planar => {
            const angle = (degrees * Math.PI) / 180;
            return [3 * (Math.cos(angle) * x[0] + Math.sin(angle) * y[0]), 3 * (Math.cos(angle) * x[1] + Math.sin(angle) * y[1])];
        };

        // Act
        const points = allPoints(dataOf([{ center: [0, 0, 0], radius: 3, startAngle: 20, endAngle: 140, normal }]));

        // Assert
        [0, 1].forEach(axis => {
            expect(points[0]![axis]).toBeCloseTo(shadowAt(20)[axis]!, 5);
            expect(points.at(-1)![axis]).toBeCloseTo(shadowAt(140)[axis]!, 5);
        });
    });

    it("should draw a bulge of more than half a turn as the large arc, the part of its circle below the chord", () => {
        // Act
        const points = allPoints(dataOf([{ points: [[0, 0], [2, 0]], bulges: [2, 0] }]));

        // Assert
        expect(Math.max(...points.map(point => Math.abs(Math.hypot(point[0] - 1, point[1] + 0.75) - 1.25)))).toBeLessThan(1e-9);
        expect(Math.min(...points.map(point => point[1]))).toBeLessThan(-1.99);
    });

    it("should write a polyline of 300,000 points as one move and a line to each further point", () => {
        // Arrange
        const points: Inputs.Base.Point2[] = Array.from({ length: 300_000 }, (_, at) => [at, at % 2]);

        // Act
        const data = dataOf([{ points }]);

        // Assert
        expect(data.startsWith("M0 0 L1 1 L2 0")).toBe(true);
        expect(data.split("L")).toHaveLength(300_000);
    });

    it("should turn a cubic round with its control points swapped, so the curve is the same", () => {
        // Arrange
        const curve: Point3[] = [[20, 5, 0], [12, 9, 0], [14, -4, 0], [10, 0, 0]];
        const cubicAt = (t: number): Planar => {
            const b = [(1 - t) ** 3, 3 * t * (1 - t) ** 2, 3 * t * t * (1 - t), t ** 3];
            return [0, 1].map(axis => curve.reduce((sum, point, at) => sum + b[at]! * point[axis]!, 0)) as Planar;
        };

        // Act
        const data = dataOf([{ start: [0, 0], end: [10, 0] }, { controlPoints: curve, degree: 3 }]);

        // Assert
        expect(data).toBe("M0 0 L10 0 C14 -4 12 9 20 5");
        expect(Math.max(...allPoints(data).slice(1).map(point => nearestTo(point, cubicAt)))).toBeLessThan(1e-6);
    });

    it("should draw splines of degree 1 to 3 as their own lines, quadratics and cubics", () => {
        // Act
        const linear = dataOf([{ controlPoints: [[0, 0], [1, 2], [3, 1]], degree: 1 }]);
        const quadratic = dataOf([{ controlPoints: [[0, 0], [1, 2], [3, 1]], degree: 2 }]);
        const cubic = dataOf([{ controlPoints: [[0, 0], [1, 2], [3, 2], [4, 0]], degree: 3 }]);
        const twoPieces = dataOf([{ controlPoints: [[0, 0], [1, 2], [3, 2], [4, 0], [6, 1]], degree: 3, knots: [0, 0, 0, 0, 1, 2, 2, 2, 2] }]);

        // Assert
        expect(linear).toBe("M0 0 L1 2 L3 1");
        expect(quadratic).toBe("M0 0 Q1 2 3 1");
        expect(cubic).toBe("M0 0 C1 2 3 2 4 0");
        expect(twoPieces.match(/C/g)).toHaveLength(2);
        const points: Point3[] = [[0, 0, 0], [1, 2, 0], [3, 2, 0], [4, 0, 0], [6, 1, 0]];
        const curve = (t: number): Planar => {
            const point = nurbsCurvePoint(3, points, undefined, [0, 0, 0, 0, 1, 2, 2, 2, 2], 2 * t);
            return [point[0], point[1]];
        };
        expect(Math.max(...allPoints(twoPieces).map(point => nearestTo(point, curve)))).toBeLessThan(1e-3);
    });

    it("should draw rational and higher degree splines as cubics within the tolerance", () => {
        // Arrange
        const quarter: Point3[] = [[10, 0, 0], [10, 10, 0], [0, 10, 0]];
        const wiggle: Point3[] = [[0, 0, 0], [2, 5, 0], [4, -5, 0], [6, 5, 0], [8, -5, 0], [10, 0, 0]];
        const wiggleCurve = (t: number): Planar => {
            const point = nurbsCurvePoint(5, wiggle, undefined, [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1], t);
            return [point[0], point[1]];
        };

        // Act
        const circle = dataOf([{ controlPoints: quarter, degree: 2, weights: [1, Math.SQRT1_2, 1] }], false, 1e-4);
        const coarse = dataOf([{ controlPoints: wiggle, degree: 5 }], false, 0.1);
        const fine = dataOf([{ controlPoints: wiggle, degree: 5 }], false, 0.001);

        // Assert
        expect(circle).toMatch(/^M10 0( C[^C]+)+$/);
        expect(Math.max(...allPoints(circle).map(point => Math.abs(Math.hypot(...point) - 10)))).toBeLessThan(1e-4);
        expect(Math.max(...allPoints(coarse).map(point => nearestTo(point, wiggleCurve)))).toBeLessThan(0.1);
        expect(Math.max(...allPoints(fine).map(point => nearestTo(point, wiggleCurve)))).toBeLessThan(0.002);
        expect(fine.match(/C/g)!.length).toBeGreaterThan(coarse.match(/C/g)!.length);
    });

    it("should turn a segment round when it ends where the stroke is, and start a new stroke where it does not meet", () => {
        // Act
        const data = dataOf([
            { start: [0, 0], end: [10, 0] },
            { controlPoints: [[20, 5], [15, 5], [10, 0]], degree: 2 },
            { center: [30, 0], radius: 1, startAngle: 0, endAngle: 90 },
        ]);

        // Assert
        expect(data).toBe("M0 0 L10 0 Q15 5 20 5 M31 0 A1 1 0 0 1 30 1");
    });

    it("should turn an arc round, against its own direction, when it ends where the stroke is", () => {
        // Act
        const alone = dataOf([{ center: [30, 0], radius: 1, startAngle: 0, endAngle: 180 }]);
        const joined = dataOf([{ start: [0, 0], end: [29, 0] }, { center: [30, 0], radius: 1, startAngle: 0, endAngle: 180 }]);

        // Assert
        expect(alone).toBe("M31 0 A1 1 0 0 1 30 1 A1 1 0 0 1 29 0");
        expect(joined).toBe("M0 0 L29 0 A1 1 0 0 0 30 1 A1 1 0 0 0 31 0");
    });

    it("should draw a circle seen edge-on as the straight line its shadow is", () => {
        // Act
        const data = dataOf([{ center: [0, 0, 0], radius: 2, normal: [1, 0, 0] }]);

        // Assert
        expect(data).not.toContain("A");
        const points = allPoints(data);
        expect(points.every(point => point[0] === 0 && Math.abs(point[1]) <= 2)).toBe(true);
        expect(Math.max(...points.map(point => point[1]))).toBe(2);
        expect(Math.min(...points.map(point => point[1]))).toBe(-2);
    });

    it("should write a number of 1e21 or more in exponent notation with its exponent whole", () => {
        // Act
        const data = dataOf([{ start: [0, 0.5], end: [1e30, -1.5e40] }]);

        // Assert
        expect(data).toBe("M0 0.5 L1e+30 -1.5e+40");
    });

    it("should refuse a path it cannot read and a tolerance that is not above 0", () => {
        // Act
        const missing = (): string => svg.pathData({ path: { segments: [{ start: [0, 0] } as Inputs.IO.DrawingLineSegmentDto] } });
        const noTolerance = (): string => svg.pathData({ path: { segments: [] }, tolerance: 0 });

        // Assert
        expect(missing).toThrow("path.segments[0]");
        expect(noTolerance).toThrow("tolerance");
    });
});

describe("SVG documents", () => {
    const outline: Inputs.IO.DrawingPolylineSegmentDto = { points: [[0, 0], [100, 0], [100, 50], [0, 50]], closed: true };

    it("should size the drawing by its unit and frame it with a border, Y pointing up", () => {
        // Act
        const text = svg.svgCreate({ parts: [{ layer: "cut", color: "#ff0000", paths: [{ segments: [outline] }] }], unit: Inputs.Base.unitOfLengthEnum.centimetre, margin: 5 });
        const metres = svg.svgCreate({ parts: [{ paths: [{ segments: [outline] }] }], unit: Inputs.Base.unitOfLengthEnum.metre, margin: 0 });
        const bare = svg.svgCreate({ parts: [{ paths: [{ segments: [outline] }] }] });

        // Assert
        expect(text).toContain("width=\"110cm\" height=\"60cm\" viewBox=\"-5 -55 110 60\"");
        expect(text).toContain("<path d=\"M0 0 L100 0 L100 -50 L0 -50 L0 0 Z\"/>");
        expect(metres).toContain("width=\"10000cm\" height=\"5000cm\" viewBox=\"0 -50 100 50\"");
        expect(bare).not.toContain(" width=");
        expect(bare).toContain("viewBox=\"-2.5 -52.5 105 55\"");
        expect(bare).toContain("stroke-width=\"0.2\"");
        expect(text.startsWith("<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>\n<svg xmlns=\"http://www.w3.org/2000/svg\"")).toBe(true);
    });

    it("should group parts into layers Inkscape reads, each part with its color and dashes, names escaped and ids unique", () => {
        // Arrange
        const parts: Inputs.IO.DrawingPartDto[] = [
            { layer: "a b", color: "#00ff00", paths: [{ segments: [outline] }] },
            { layer: "a-b", color: "#0000ff", paths: [{ segments: [outline] }], lineType: Inputs.IO.lineTypeEnum.hidden },
            { layer: "a b", color: "#ff0000", paths: [{ segments: [outline] }, { segments: [] }] },
            { layer: "R&D 'one'", color: "#123", paths: [] },
        ];

        // Act
        const text = svg.svgCreate({ parts: parts, strokeWidth: 0.3 });

        // Assert
        const groups = text.match(/<g [^>]*>/g)!;
        expect(groups).toEqual([
            "<g id=\"layer-a-b\" inkscape:groupmode=\"layer\" inkscape:label=\"a b\" fill=\"none\" stroke-width=\"0.3\" stroke-linecap=\"round\" stroke-linejoin=\"round\">",
            "<g stroke=\"#00ff00\">",
            "<g stroke=\"#ff0000\">",
            "<g id=\"layer-a-b-2\" inkscape:groupmode=\"layer\" inkscape:label=\"a-b\" fill=\"none\" stroke-width=\"0.3\" stroke-linecap=\"round\" stroke-linejoin=\"round\">",
            "<g stroke=\"#0000ff\" stroke-dasharray=\"1 0.5\">",
            "<g id=\"layer-R-D-one-\" inkscape:groupmode=\"layer\" inkscape:label=\"R&amp;D 'one'\" fill=\"none\" stroke-width=\"0.3\" stroke-linecap=\"round\" stroke-linejoin=\"round\">",
            "<g stroke=\"#112233\">",
        ]);
        expect(text.match(/<path /g)).toHaveLength(3);
    });

    it("should put parts on layers whose names differ only in case into one layer, named as first written", () => {
        // Arrange
        const parts: Inputs.IO.DrawingPartDto[] = [
            { layer: "Cut", color: "#ff0000", paths: [{ segments: [outline] }] },
            { layer: "cut", color: "#0000ff", paths: [{ segments: [outline] }] },
        ];

        // Act
        const text = svg.svgCreate({ parts, strokeWidth: 0.3 });

        // Assert
        expect(text.match(/<g [^>]*>/g)).toEqual([
            "<g id=\"layer-Cut\" inkscape:groupmode=\"layer\" inkscape:label=\"Cut\" fill=\"none\" stroke-width=\"0.3\" stroke-linecap=\"round\" stroke-linejoin=\"round\">",
            "<g stroke=\"#ff0000\">",
            "<g stroke=\"#0000ff\">",
        ]);
    });

    it("should give a drawing with no width and no border a view as wide as its line, centred on it", () => {
        // Act
        const text = svg.svgCreate({ parts: [{ paths: [{ segments: [{ start: [0, 0], end: [0, 10] }] }] }], margin: 0, unit: Inputs.Base.unitOfLengthEnum.millimetre });

        // Assert
        expect(text).toContain("width=\"0.02mm\" height=\"10mm\" viewBox=\"-0.01 -10 0.02 10\"");
    });

    it("should give a view no narrower than the smallest number it writes, however thin the line", () => {
        // Act
        const text = svg.svgCreate({ parts: [{ paths: [{ segments: [{ start: [0, 0], end: [10, 0] }] }] }], margin: 0, strokeWidth: 1e-12 });

        // Assert
        expect(text).toContain("viewBox=\"0 0 10 0.000001\"");
    });

    it("should never write a line width as 0, however small the drawing or the width asked for", () => {
        // Act
        const tiny = svg.svgCreate({ parts: [{ paths: [{ segments: [{ start: [0, 0], end: [1e-4, 0] }] }] }] });
        const thin = svg.svgCreate({ parts: [{ paths: [{ segments: [{ start: [0, 0], end: [10, 0] }] }] }], strokeWidth: 1e-12 });

        // Assert
        expect(tiny).toContain("stroke-width=\"0.000001\"");
        expect(thin).toContain("stroke-width=\"0.000001\"");
    });

    it("should write a spline of 20,000 control points with its knots in well under a few seconds", () => {
        // Arrange
        const count = 20_000;
        const controlPoints: Inputs.Base.Point2[] = Array.from({ length: count }, (_, at) => [at, Math.sin(at)]);
        const knots = Array.from({ length: count + 4 }, (_, at) => Math.min(Math.max(at - 3, 0), count - 3));
        const started = performance.now();

        // Act
        const text = svg.svgCreate({ parts: [{ paths: [{ segments: [{ controlPoints, degree: 3, knots }] }] }] });

        // Assert
        expect(performance.now() - started).toBeLessThan(3000);
        expect(text.match(/C/g)).toHaveLength(count - 3);
    });

    it("should write a drawing with nothing in it as a small empty page", () => {
        // Act
        const text = svg.svgCreate({ parts: [] });

        // Assert
        expect(text).toContain("viewBox=\"-0.025 -0.025 0.05 0.05\"");
        expect(text).not.toContain("<path");
    });

    it("should refuse a line width or a border it cannot draw", () => {
        // Act
        const width = (): string => svg.svgCreate({ parts: [], strokeWidth: -1 });
        const border = (): string => svg.svgCreate({ parts: [], margin: Number.NaN });
        const unit = (): string => svg.svgCreate({ parts: [], unit: "yd" as Inputs.Base.unitOfLengthEnum });

        // Assert
        expect(width).toThrow("strokeWidth");
        expect(border).toThrow("margin");
        expect(unit).toThrow("unit");
    });
});
