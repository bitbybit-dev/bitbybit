import { describe, expect, it } from "vitest";
import * as Inputs from "../../inputs";
import { InputError } from "../../kernel-calls";
import { farthestApart, farthestOff, kindOf, pointsAlong, segmentsOfParts } from "../helpers/files/__test__/drawing-samples";
import type { SegmentDto } from "../helpers/files/__test__/drawing-samples";
import { Svg } from "./svg";

type Point3 = Inputs.Base.Point3;

const WRITTEN = 1e-6;
const svg = new Svg();

const readBack = (parts: Inputs.IO.DrawingPartDto[], unit?: Inputs.Base.unitOfLengthEnum): Inputs.IO.SvgDrawingDto =>
    svg.svgRead({ svg: svg.svgCreate(unit === undefined ? { parts } : { parts, unit }) });

const alone = (...segments: SegmentDto[]): Inputs.IO.DrawingPartDto[] => [{ layer: "cut", color: "#ff0000", paths: segments.map(segment => ({ segments: [segment] })) }];

const readSegments = (...segments: SegmentDto[]): SegmentDto[] => segmentsOfParts(readBack(alone(...segments)).parts);

const apart = (first: SegmentDto, second: SegmentDto): number => farthestApart(pointsAlong(first), pointsAlong(second));

const rounded = (values: readonly number[], places = 6): number[] => values.map(value => Math.round(value * 10 ** places) / 10 ** places + 0);

const tilted = (radius: number, angle: number): Inputs.Base.Point2 => [radius * Math.cos(angle), radius * Math.sin(angle)];

describe("svgRead of svgCreate, segment by segment", () => {
    it("should read lines back exactly", () => {
        // Act
        const read = readSegments({ start: [0, 0], end: [40, 12.5] }, { start: [-3, 7, 0], end: [5, -9, 0] });

        // Assert
        expect(read).toEqual([{ start: [0, 0, 0], end: [40, 12.5, 0] }, { start: [-3, 7, 0], end: [5, -9, 0] }]);
    });

    it("should read an arc back as one arc, however many quarter turns it was written in", () => {
        // Act
        const [arc] = readSegments({ center: [10, 5], radius: 20, startAngle: 30, endAngle: 300 }) as Inputs.IO.DrawingArcSegmentDto[];

        // Assert
        expect(rounded([...arc!.center, arc!.radius])).toEqual([10, 5, 0, 20]);
        expect(rounded([arc!.startAngle, arc!.endAngle], 4)).toEqual([30, 300]);
    });

    it("should read an arc that ran clockwise back over the same points, as the arc that runs counterclockwise", () => {
        // Arrange
        const clockwise: Inputs.IO.DrawingArcSegmentDto = { center: [2, 3], radius: 8, startAngle: 300, endAngle: 10, normal: [0, 0, -1] };

        // Act
        const [arc] = readSegments(clockwise);

        // Assert
        expect(kindOf(arc!)).toBe("arc");
        expect(apart(arc!, clockwise)).toBeLessThan(WRITTEN);
        expect((arc as Inputs.IO.DrawingArcSegmentDto).normal).toBeUndefined();
    });

    it("should read a circle back as a circle", () => {
        // Act
        const read = readSegments({ center: [3, -4], radius: 7 });

        // Assert
        expect(read).toHaveLength(1);
        const circle = read[0] as Inputs.IO.DrawingCircleSegmentDto;
        expect(kindOf(circle)).toBe("circle");
        expect(rounded([...circle.center, circle.radius])).toEqual([3, -4, 0, 7]);
    });

    it("should read tilted ellipses back, whole and partial, over the same points", () => {
        // Arrange
        const partial: Inputs.IO.DrawingEllipseSegmentDto = { center: [5, 5], majorAxis: tilted(20, 0.4), ratio: 0.4, startParameter: 0.3, endParameter: 5.9 };
        const whole: Inputs.IO.DrawingEllipseSegmentDto = { center: [-5, 2], majorAxis: tilted(12, 2.5), ratio: 0.7 };

        // Act
        const read = readSegments(partial, whole);

        // Assert
        expect(read.map(kindOf)).toEqual(["ellipse", "ellipse"]);
        expect(apart(read[0]!, partial)).toBeLessThan(WRITTEN);
        expect(apart(read[1]!, whole)).toBeLessThan(WRITTEN);
        expect((read[0] as Inputs.IO.DrawingEllipseSegmentDto).ratio).toBeCloseTo(0.4, 6);
    });

    it("should read a polyline with bulges back as its lines and the arcs its bulges draw", () => {
        // Act
        const read = readSegments({ points: [[0, 0], [30, 0], [30, 10], [0, 10]], closed: true, bulges: [0, 1, 0, 1] });

        // Assert
        expect(read.map(kindOf)).toEqual(["line", "arc", "line", "arc"]);
        expect(read[0]).toEqual({ start: [0, 0, 0], end: [30, 0, 0] });
        expect(apart(read[1]!, { center: [30, 5], radius: 5, startAngle: 270, endAngle: 90 })).toBeLessThan(WRITTEN);
        expect(apart(read[3]!, { center: [0, 5], radius: 5, startAngle: 90, endAngle: 270 })).toBeLessThan(WRITTEN);
    });

    it.each([
        [2, [[0, 0], [10, 20], [20, -5], [30, 10], [40, 0]]],
        [3, [[0, 0], [10, 20], [20, -5], [30, 10], [40, 0], [50, 15], [60, 0]]],
    ])("should read a spline of degree %s back as its Bezier pieces, each exact", (degree, controlPoints) => {
        // Arrange
        const spline: SegmentDto = { controlPoints: controlPoints as Inputs.Base.Point2[], degree };
        const pieces = controlPoints.length - degree;

        // Act
        const read = readSegments(spline);

        // Assert
        expect(read).toHaveLength(pieces);
        expect(read.every(piece => (piece as Inputs.IO.DrawingSplineSegmentDto).degree === degree)).toBe(true);
        read.forEach((piece, at) => expect(farthestApart(pointsAlong(piece), pointsAlong(spline, at / pieces, (at + 1) / pieces))).toBeLessThan(WRITTEN));
    });

    it("should read rational and higher degree splines back as cubics within the writer's tolerance", () => {
        // Arrange
        const quarterCircle: SegmentDto = { controlPoints: [[10, 0], [10, 10], [0, 10]], degree: 2, weights: [1, Math.SQRT1_2, 1] };
        const quintic: SegmentDto = { controlPoints: [[0, 0], [5, 9], [10, -9], [15, 9], [20, -9], [25, 0]], degree: 5 };

        // Act
        const [rational, higher] = [quarterCircle, quintic].map(spline => readSegments(spline));

        // Assert
        expect([...rational!, ...higher!].every(piece => (piece as Inputs.IO.DrawingSplineSegmentDto).degree === 3)).toBe(true);
        const dense = (spline: SegmentDto): Point3[] => pointsAlong(spline, 0, 1, 4000);
        expect(farthestOff(rational!.flatMap(piece => pointsAlong(piece, 0, 1, 16)), dense(quarterCircle))).toBeLessThan(0.01);
        expect(farthestOff(higher!.flatMap(piece => pointsAlong(piece, 0, 1, 16)), dense(quintic))).toBeLessThan(0.01);
        expect(rounded([...pointsAlong(rational![0]!, 0, 0, 1)[0]!, ...pointsAlong(rational![rational!.length - 1]!, 1, 1, 1)[0]!])).toEqual([10, 0, 0, 0, 10, 0]);
    });
});

describe("svgRead of svgCreate, parts and units", () => {
    const LINE: SegmentDto = { start: [0, 0], end: [100, 0] };
    const parts: Inputs.IO.DrawingPartDto[] = [
        { layer: "cut", color: "#ff0000", paths: [{ segments: [LINE] }] },
        { layer: "engrave line", color: "#0000ff", lineType: Inputs.IO.lineTypeEnum.dashed, paths: [{ segments: [{ start: [0, 10], end: [100, 10] }] }] },
        { layer: "engrave line", color: "#00ff00", lineType: Inputs.IO.lineTypeEnum.hidden, paths: [{ segments: [{ start: [0, 20], end: [100, 20] }] }] },
        { layer: "center", color: "#123456", lineType: Inputs.IO.lineTypeEnum.center, paths: [{ segments: [{ center: [50, 50], radius: 30 }] }] },
        { layer: "center", color: "#123456", lineType: Inputs.IO.lineTypeEnum.dotted, paths: [{ segments: [{ start: [0, 90], end: [100, 90] }] }] },
    ];
    const styleOf = (drawing: Inputs.IO.SvgDrawingDto): string[] => drawing.parts.map(part => `${part.layer} ${part.color} ${part.lineType}`);

    it("should read every part back on its layer, in its color and line type", () => {
        // Act
        const drawing = readBack(parts);

        // Assert
        expect(styleOf(drawing)).toEqual(["cut #ff0000 continuous", "engrave line #0000ff dashed", "engrave line #00ff00 hidden", "center #123456 center", "center #123456 dotted"]);
        expect(drawing.warnings).toEqual([]);
    });

    it.each([0.02, 1, 5000])("should tell dashed from hidden in a drawing %s across", size => {
        // Arrange
        const scaled = parts.map(part => ({ ...part, paths: part.paths.map(path => ({ segments: path.segments.map(segment => "start" in segment
            ? { start: segment.start.map(value => value * size / 100) as Point3, end: segment.end.map(value => value * size / 100) as Point3 }
            : { center: (segment as Inputs.IO.DrawingCircleSegmentDto).center.map(value => value * size / 100) as Point3, radius: (segment as Inputs.IO.DrawingCircleSegmentDto).radius * size / 100 }) })) }));

        // Act
        const drawing = readBack(scaled);

        // Assert
        expect(drawing.parts.map(part => part.lineType)).toEqual(parts.map(part => part.lineType ?? Inputs.IO.lineTypeEnum.continuous));
    });

    it("should read a drawing written in a unit back in the file's user units exactly", () => {
        // Act
        const drawing = readBack(alone(LINE), Inputs.Base.unitOfLengthEnum.millimetre);

        // Assert
        expect(segmentsOfParts(drawing.parts)).toEqual([{ start: [0, 0, 0], end: [100, 0, 0] }]);
    });

    it.each([
        [Inputs.Base.unitOfLengthEnum.millimetre, Inputs.Base.unitOfLengthEnum.millimetre, 1],
        [Inputs.Base.unitOfLengthEnum.inch, Inputs.Base.unitOfLengthEnum.inch, 1],
        [Inputs.Base.unitOfLengthEnum.metre, Inputs.Base.unitOfLengthEnum.metre, 1],
        [Inputs.Base.unitOfLengthEnum.millimetre, Inputs.Base.unitOfLengthEnum.centimetre, 0.1],
    ])("should read a drawing written in %s at true size in %s, moved by the view box's corner", (written, readIn, scale) => {
        // Arrange
        const file = svg.svgCreate({ parts: alone(LINE, { center: [20, 30], radius: 5 }), unit: written });

        // Act
        const drawing = svg.svgRead({ svg: file, unit: readIn });

        // Assert
        const [minX, minY] = drawing.viewBox!;
        const moved = (point: readonly number[]): number[] => rounded([(point[0]! - minX!) * scale, (point[1]! + minY!) * scale, 0]);
        const [line, circle] = segmentsOfParts(drawing.parts) as [Inputs.IO.DrawingLineSegmentDto, Inputs.IO.DrawingCircleSegmentDto];
        expect(drawing.unit).toBe(readIn);
        expect(rounded([...line.start, ...line.end])).toEqual([...moved([0, 0]), ...moved([100, 0])]);
        expect(rounded([...circle.center, circle.radius])).toEqual([...moved([20, 30]), ...rounded([5 * scale])]);
    });
});

describe("svgRead inputs", () => {
    it("should refuse an svg that is not text and a unit it does not know, naming each", () => {
        // Arrange
        const notText: unknown = 42;
        const unknownUnit: unknown = "furlong";

        // Act & Assert
        expect(() => svg.svgRead({ svg: notText as string })).toThrow(new InputError("`svg` must be the text of an SVG file; it is number.", "svg"));
        expect(() => svg.svgRead({ svg: "<svg/>", unit: unknownUnit as Inputs.Base.unitOfLengthEnum })).toThrow(new InputError("`unit` is furlong, which is none of mm, cm, m, in.", "unit"));
    });

    it("should read nothing from a file with no svg root and say so", () => {
        // Act
        const drawing = svg.svgRead({ svg: "<html/>" });

        // Assert
        expect(drawing).toEqual({ parts: [], unit: undefined, viewBox: undefined, warnings: ["No <svg> root element found."] });
    });
});
