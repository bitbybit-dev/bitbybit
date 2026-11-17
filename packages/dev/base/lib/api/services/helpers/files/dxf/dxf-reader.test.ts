import { describe, expect, it } from "vitest";
import * as Inputs from "../../../../inputs";
import type * as Resolved from "../../../../resolved-inputs";
import { resolveDto } from "../../../../kernel-calls";
import { DxfGenerator } from "./dxf-generator";
import { readDxfDrawing } from "./dxf-reader";
import { Dxf } from "../../../io/dxf";
import { Svg } from "../../../io/svg";
import type { ReadFitSpline, ReadSpline } from "./dxf-reader-types";

type Segment = Inputs.IO.DrawingPathDto["segments"][number];
type Point3 = Inputs.Base.Point3;

const read = (text: string, includeHidden = false): Inputs.IO.DxfDrawingDto => new Dxf().dxfRead({ dxf: text, includeHiddenLayers: includeHidden });

const write = (parts: Inputs.IO.DrawingPartDto[], options: Partial<Inputs.IO.DxfModelDto> = {}): string =>
    new DxfGenerator().generateDxf(resolveDto(Inputs.IO.DxfModelDto, { dxfPathsParts: parts, ...options }) as Resolved.IO.DxfModelDto);

const dxf = (sections: string[][]): string => [...sections.flatMap(([name, ...body]) => ["0", "SECTION", "2", name!, ...body, "0", "ENDSEC"]), "0", "EOF"].join("\n");

const entities = (...body: string[][]): string => dxf([["ENTITIES", ...body.flat()]]);

const segmentsOf = (drawing: Inputs.IO.DxfDrawingDto): Segment[] => drawing.parts.flatMap(part => part.paths.flatMap(path => path.segments));

const close = (actual: readonly number[], expected: readonly number[], digits = 9): void => {
    expect(actual).toHaveLength(expected.length);
    actual.forEach((value, at) => expect(value).toBeCloseTo(expected[at]!, digits));
};

const lineDxf = (x1: number, y1: number, x2: number, y2: number, extra: string[] = []): string[] =>
    ["0", "LINE", "8", "0", ...extra, "10", String(x1), "20", String(y1), "30", "0", "11", String(x2), "21", String(y2), "31", "0"];

const TEXT_DXF = ["0", "TEXT", "8", "0", "1", "note"];

const blockDxf = (name: string, ...body: string[][]): string[] =>
    ["0", "BLOCK", "8", "0", "2", name, "70", "0", "10", "0", "20", "0", "30", "0", ...body.flat(), "0", "ENDBLK"];

const insertDxf = (name: string, columns = 1, rows = 1): string[] =>
    ["0", "INSERT", "8", "0", "2", name, "10", "0", "20", "0", "30", "0", "70", String(columns), "71", String(rows), "44", "1", "45", "1"];

const longPolylineDxf = (vertices: number): string[] =>
    ["0", "LWPOLYLINE", "8", "0", "90", String(vertices), "70", "0", ...Array.from({ length: vertices }, (_, at) => ["10", String(at), "20", String(at % 2)]).flat()];

const longOldPolylineDxf = (vertices: number): string[] =>
    ["0", "POLYLINE", "8", "0", "66", "1", "70", "0", ...Array.from({ length: vertices }, (_, at) => ["0", "VERTEX", "8", "0", "10", String(at), "20", String(at % 2)]).flat(), "0", "SEQEND"];

const fanOutDxf = (levels: number, width: number): string => {
    const level = (at: number): string[] => blockDxf(`LEVEL${at + 1}`, ...Array.from({ length: width }, () => insertDxf(`LEVEL${at}`)));
    return dxf([
        ["BLOCKS", ...blockDxf("LEVEL0", TEXT_DXF), ...Array.from({ length: levels }, (_, at) => level(at)).flat()],
        ["ENTITIES", ...Array.from({ length: width }, () => insertDxf(`LEVEL${levels}`)).flat()],
    ]);
};

const leftOutWarning = (count: number, text: string): string => count === 1
    ? `1 block insert was left out: with the inserts read before it, it places more entities, points and copies than the 500000 a file of ${text.length} characters may expand to.`
    : `${count} block inserts were left out: with the inserts read before them, they place more entities, points and copies than the 500000 a file of ${text.length} characters may expand to.`;

const ellipsePointOf = (ellipse: Inputs.IO.DrawingEllipseSegmentDto, parameter: number): Point3 => {
    const major = ellipse.majorAxis as Point3;
    const normal: Point3 = ellipse.normal ?? [0, 0, 1];
    const across: Point3 = [normal[1] * major[2] - normal[2] * major[1], normal[2] * major[0] - normal[0] * major[2], normal[0] * major[1] - normal[1] * major[0]];
    const scale = ellipse.ratio * Math.hypot(...major) / Math.hypot(...across);
    const center = ellipse.center as Point3;
    return [0, 1, 2].map(axis => center[axis]! + major[axis]! * Math.cos(parameter) + across[axis]! * scale * Math.sin(parameter)) as Point3;
};

describe("reading DXF", () => {
    const shapes: Inputs.IO.DrawingPathDto["segments"] = [
        { start: [0, 0], end: [10, 5, 2] },
        { center: [5, 5], radius: 3, startAngle: 30, endAngle: 300 },
        { center: [1, 2, 3], radius: 2, normal: [0, 0, -1] },
        { points: [[0, 0], [10, 0], [10, 10]], bulges: [0.5, 0, 0], closed: true },
        { points: [[0, 0, 0], [10, 0, 2], [10, 10, 4]] },
        { controlPoints: [[0, 0], [5, 10], [10, 0], [15, 10]], degree: 3, weights: [1, 2, 1, 1] },
        { center: [0, 0], majorAxis: [8, 0], ratio: 0.5, startParameter: 1, endParameter: 5 },
    ];
    const parts: Inputs.IO.DrawingPartDto[] = [
        { layer: "cut", color: "#ff0000", paths: [{ segments: shapes }] },
        { layer: "marks", color: "#0000ff", lineType: Inputs.IO.lineTypeEnum.dashed, paths: [{ segments: [{ start: [1, 1], end: [2, 2] }] }] },
    ];

    it("should read back what AutoCAD 2000 output holds: every segment exact, by layer, colour and line type, with its unit", () => {
        // Act
        const drawing = read(write(parts, { unit: Inputs.Base.unitOfLengthEnum.millimetre }));

        // Assert
        expect(drawing.version).toBe("AC1015");
        expect(drawing.unit).toBe("mm");
        expect(drawing.warnings).toEqual([]);
        expect(drawing.parts.map(part => [part.layer, part.color, part.lineType, part.paths.length])).toEqual([["cut", "#ff0000", "continuous", 7], ["marks", "#0000ff", "dashed", 1]]);
        const [line, arc, circle, slot, spatial, spline, ellipse] = segmentsOf(drawing) as [
            Inputs.IO.DrawingLineSegmentDto, Inputs.IO.DrawingArcSegmentDto, Inputs.IO.DrawingCircleSegmentDto, Inputs.IO.DrawingPolylineSegmentDto,
            Inputs.IO.DrawingPolylineSegmentDto, Inputs.IO.DrawingSplineSegmentDto, Inputs.IO.DrawingEllipseSegmentDto,
        ];
        expect(line).toEqual({ start: [0, 0, 0], end: [10, 5, 2] });
        close([...arc.center, arc.radius, arc.startAngle, arc.endAngle], [5, 5, 0, 3, 30, 300]);
        close([...circle.center, circle.radius, ...circle.normal!], [1, 2, 3, 2, 0, 0, -1]);
        expect(slot).toEqual({ points: [[0, 0, 0], [10, 0, 0], [10, 10, 0]], bulges: [0.5, 0, 0], closed: true });
        expect(spatial.points).toEqual([[0, 0, 0], [10, 0, 2], [10, 10, 4]]);
        expect(spline).toEqual({ controlPoints: [[0, 0, 0], [5, 10, 0], [10, 0, 0], [15, 10, 0]], degree: 3, knots: [0, 0, 0, 0, 1, 1, 1, 1], weights: [1, 2, 1, 1] });
        close([...ellipse.majorAxis, ellipse.ratio, ellipse.startParameter!, ellipse.endParameter!], [8, 0, 0, 0.5, 1, 5]);
        expect(ellipse.normal).toBeUndefined();
    });

    it.each(["AC1015", "AC1009"] as const)("should read back a continuous part as continuous though an earlier part gave its layer dashes, in %s", acadVersion => {
        // Arrange
        const shared: Inputs.IO.DrawingPartDto[] = [
            { layer: "cut", color: "#ff0000", lineType: Inputs.IO.lineTypeEnum.hidden, paths: [{ segments: [{ start: [0, 0], end: [1, 0] }] }] },
            { layer: "cut", color: "#00ff00", lineType: Inputs.IO.lineTypeEnum.continuous, paths: [{ segments: [{ start: [0, 1], end: [1, 1] }, { points: [[0, 0, 0], [1, 1, 1]] }] }] },
        ];

        // Act
        const drawing = read(write(shared, { acadVersion }));

        // Assert
        expect(drawing.parts.map(part => [part.layer, part.color, part.lineType, part.paths.length])).toEqual([["cut", "#ff0000", "hidden", 1], ["cut", "#00ff00", "continuous", 2]]);
    });

    it("should read back what the writer fills in where a part leaves it out: layer 0, a cubic spline and a last bulge of 0", () => {
        // Act
        const drawing = read(write([{ layer: " ", color: "#ff0000", paths: [{ segments: [
            { points: [[0, 0], [1, 0], [1, 1]], bulges: [0.5, 0] },
            { controlPoints: [[0, 0], [1, 1], [2, 0], [3, 1]] },
        ] }] }]));

        // Assert
        expect(drawing.parts.map(part => part.layer)).toEqual(["0"]);
        const [polyline, spline] = segmentsOf(drawing) as [Inputs.IO.DrawingPolylineSegmentDto, Inputs.IO.DrawingSplineSegmentDto];
        expect(polyline.bulges).toEqual([0.5, 0, 0]);
        expect([spline.degree, spline.knots]).toEqual([3, [0, 0, 0, 0, 1, 1, 1, 1]]);
    });

    it("should read R12 output, splines and ellipses back as the polylines R12 holds", () => {
        // Act
        const drawing = read(write(parts, { acadVersion: "AC1009" }));

        // Assert
        expect(drawing.version).toBe("AC1009");
        const kindOf = (segment: Segment): string => {
            if ("points" in segment) {
                return "polyline";
            }
            if ("startAngle" in segment) {
                return "arc";
            }
            return "radius" in segment ? "circle" : "line";
        };
        const kinds = segmentsOf(drawing).map(kindOf);
        expect(kinds).toEqual(["line", "arc", "circle", "polyline", "polyline", "polyline", "polyline", "line"]);
    });

    it("should read a bare R12 file of entities only, with nothing but its geometry", () => {
        // Act
        const drawing = read(`\uFEFF${entities(lineDxf(0, 0, 3, 4, ["62", "7"])).replace(/\n/g, "\r\n")}\r\n\r\n`);

        // Assert
        expect(drawing).toEqual({ parts: [{ layer: "0", color: "#000000", lineType: "continuous", paths: [{ segments: [{ start: [0, 0, 0], end: [3, 4, 0] }] }] }], unit: undefined, version: "", warnings: [] });
    });

    it("should read entities drawn with a downward extrusion, as mirrored CAD programs write them, where they really lie", () => {
        // Act
        const drawing = read(entities(
            ["0", "LWPOLYLINE", "8", "0", "90", "2", "70", "0", "210", "0", "220", "0", "230", "-1", "10", "0", "20", "0", "42", "1", "10", "4", "20", "0"],
            ["0", "ARC", "8", "0", "10", "5", "20", "0", "30", "0", "40", "1", "50", "0", "51", "90", "210", "0", "220", "0", "230", "-1"],
        ));

        // Assert
        const [polyline, arc] = segmentsOf(drawing) as [Inputs.IO.DrawingPolylineSegmentDto, Inputs.IO.DrawingArcSegmentDto];
        expect(polyline.points).toEqual([[0, 0, 0], [-4, 0, 0]]);
        expect(polyline.bulges).toEqual([-1, 0]);
        close([...arc.center], [-5, 0, 0]);
        close([arc.startAngle, arc.endAngle], [0, 90]);
        close([...arc.normal!], [0, 0, -1]);
    });

    it("should place a block insert's contents by its position, rotation and scale, and its array copies", () => {
        // Arrange
        const blocks = ["BLOCKS", "0", "BLOCK", "8", "0", "2", "PLATE", "70", "0", "10", "1", "20", "0", "30", "0", ...lineDxf(1, 0, 3, 0), "0", "ENDBLK"];

        // Act
        const turned = read(dxf([blocks, ["ENTITIES", "0", "INSERT", "8", "parts", "2", "PLATE", "10", "10", "20", "5", "30", "0", "41", "2", "42", "2", "43", "2", "50", "90"]]));
        const copies = read(dxf([blocks, ["ENTITIES", "0", "INSERT", "8", "0", "2", "PLATE", "10", "0", "20", "0", "30", "0", "70", "3", "71", "2", "44", "10", "45", "20"]]));
        const mirrored = read(dxf([blocks, ["ENTITIES", "0", "INSERT", "8", "0", "2", "PLATE", "10", "10", "20", "0", "30", "0", "210", "0", "220", "0", "230", "-1"]]));

        // Assert
        const [line] = segmentsOf(turned) as [Inputs.IO.DrawingLineSegmentDto];
        close([...line.start], [10, 5, 0]);
        close([...line.end], [10, 9, 0]);
        expect(turned.parts[0]!.layer).toBe("parts");
        expect((segmentsOf(copies) as Inputs.IO.DrawingLineSegmentDto[]).map(segment => segment.start)).toEqual([[0, 0, 0], [10, 0, 0], [20, 0, 0], [0, 20, 0], [10, 20, 0], [20, 20, 0]]);
        const [flipped] = segmentsOf(mirrored) as [Inputs.IO.DrawingLineSegmentDto];
        close([...flipped.start, ...flipped.end], [-10, 0, 0, -12, 0, 0]);
    });

    it("should turn a circle scaled unevenly into its ellipse and keep a mirrored polyline's arcs turning the right way", () => {
        // Arrange
        const blocks = ["BLOCKS",
            "0", "BLOCK", "8", "0", "2", "RING", "70", "0", "10", "0", "20", "0", "30", "0",
            "0", "CIRCLE", "8", "0", "10", "0", "20", "0", "30", "0", "40", "1",
            "0", "ENDBLK",
            "0", "BLOCK", "8", "0", "2", "BUMP", "70", "0", "10", "0", "20", "0", "30", "0",
            "0", "LWPOLYLINE", "8", "0", "90", "2", "70", "0", "10", "0", "20", "0", "42", "1", "10", "2", "20", "0",
            "0", "ENDBLK"];

        // Act
        const drawing = read(dxf([blocks, ["ENTITIES",
            "0", "INSERT", "8", "0", "2", "RING", "10", "0", "20", "0", "30", "0", "41", "3", "42", "1",
            "0", "INSERT", "8", "0", "2", "BUMP", "10", "0", "20", "0", "30", "0", "41", "-1", "42", "1"]]));

        // Assert
        const [ellipse, bump] = segmentsOf(drawing) as [Inputs.IO.DrawingEllipseSegmentDto, Inputs.IO.DrawingPolylineSegmentDto];
        close([...ellipse.majorAxis, ellipse.ratio], [3, 0, 0, 1 / 3]);
        expect(ellipse.endParameter! - ellipse.startParameter!).toBeCloseTo(2 * Math.PI, 12);
        expect(bump.points).toEqual([[0, 0, 0], [-2, 0, 0]]);
        expect(bump.bulges).toEqual([-1, 0]);
    });

    it("should turn an arc and a bulge with the insert that turns them, and make ellipses of both under an uneven scale", () => {
        // Arrange
        const blocks = ["BLOCKS", "0", "BLOCK", "8", "0", "2", "BENDS", "70", "0", "10", "0", "20", "0", "30", "0",
            "0", "ARC", "8", "0", "10", "0", "20", "0", "30", "0", "40", "1", "50", "0", "51", "90",
            "0", "LWPOLYLINE", "8", "0", "90", "4", "70", "0", "10", "0", "20", "0", "42", "1", "10", "2", "20", "0", "10", "2", "20", "1", "42", "-1", "10", "2", "20", "3",
            "0", "ENDBLK"];

        // Act
        const drawing = read(dxf([blocks, ["ENTITIES",
            "0", "INSERT", "8", "0", "2", "BENDS", "10", "0", "20", "0", "30", "0", "50", "90",
            "0", "INSERT", "8", "0", "2", "BENDS", "10", "0", "20", "0", "30", "0", "41", "2", "42", "1"]]));

        // Assert
        const [arc, bends, stretchedArc, bump, straight, dip] = segmentsOf(drawing) as [Inputs.IO.DrawingArcSegmentDto, Inputs.IO.DrawingPolylineSegmentDto, Inputs.IO.DrawingEllipseSegmentDto,
            Inputs.IO.DrawingEllipseSegmentDto, Inputs.IO.DrawingLineSegmentDto, Inputs.IO.DrawingEllipseSegmentDto];
        close([...arc.center, arc.radius, arc.startAngle, arc.endAngle], [0, 0, 0, 1, 90, 180]);
        close(bends.points.flat(), [0, 0, 0, 0, 2, 0, -1, 2, 0, -3, 2, 0]);
        expect(bends.bulges).toEqual([1, 0, -1, 0]);
        close([...stretchedArc.majorAxis, stretchedArc.ratio, stretchedArc.startParameter!, stretchedArc.endParameter!], [2, 0, 0, 0.5, 0, Math.PI / 2]);
        close([...bump.center, ...bump.majorAxis, bump.ratio, bump.startParameter!, bump.endParameter!], [2, 0, 0, 2, 0, 0, 0.5, Math.PI, 2 * Math.PI]);
        close([...straight.start, ...straight.end], [4, 0, 0, 4, 1, 0]);
        close([...dip.center, ...dip.majorAxis, dip.ratio, dip.startParameter!, dip.endParameter!, ...dip.normal!], [4, 2, 0, 2, 0, 0, 0.5, Math.PI / 2, 3 * Math.PI / 2, 0, 0, -1]);
    });

    it("should carry splines through an insert, control points and fit points with their end tangents", () => {
        // Arrange
        const blocks = ["BLOCKS", "0", "BLOCK", "8", "0", "2", "CURVES", "70", "0", "10", "0", "20", "0", "30", "0",
            "0", "SPLINE", "8", "0", "70", "8", "71", "1", "72", "4", "73", "2", "40", "0", "40", "0", "40", "1", "40", "1", "10", "1", "20", "0", "30", "0", "10", "2", "20", "0", "30", "0",
            "0", "SPLINE", "8", "0", "70", "8", "71", "3", "74", "3", "12", "1", "22", "0", "32", "0", "13", "1", "23", "0", "33", "0",
            "11", "0", "21", "0", "31", "0", "11", "1", "21", "1", "31", "0", "11", "2", "21", "0", "31", "0",
            "0", "ENDBLK"];

        // Act
        const reading = readDxfDrawing(dxf([blocks, ["ENTITIES", "0", "INSERT", "8", "0", "2", "CURVES", "10", "10", "20", "0", "30", "0", "50", "90"]]), false);

        // Assert
        const [[spline], [fit]] = reading.entities.map(entity => entity.segments) as [[ReadSpline], [ReadFitSpline]];
        close(spline.curve.points.flat(), [10, 1, 0, 10, 2, 0]);
        close(fit.points.flat(), [10, 0, 0, 9, 1, 0, 10, 2, 0]);
        close([...fit.startTangent!, ...fit.endTangent!], [0, 1, 0, 0, 1, 0]);
    });

    it("should draw nothing of a block inserted at a scale of 0, keeping what else the file holds", () => {
        // Arrange
        const blocks = ["BLOCKS", "0", "BLOCK", "8", "0", "2", "RING", "70", "0", "10", "0", "20", "0", "30", "0", "0", "CIRCLE", "8", "0", "10", "0", "20", "0", "30", "0", "40", "1", "0", "ENDBLK"];
        const kept = ["0", "LINE", "8", "kept", "10", "0", "20", "0", "30", "0", "11", "1", "21", "0", "31", "0"];

        // Act
        const drawing = read(dxf([blocks, ["ENTITIES", "0", "INSERT", "8", "0", "2", "RING", "10", "0", "20", "0", "30", "0", "41", "0", "42", "0", "43", "0", ...kept]]));

        // Assert
        expect(drawing.parts).toEqual([{ layer: "kept", color: "#000000", lineType: "continuous", paths: [{ segments: [{ start: [0, 0, 0], end: [1, 0, 0] }] }] }]);
    });

    it("should say which entities it could not draw and why, apart from the kinds it does not draw, and read odd colours and line types", () => {
        // Arrange
        const blocks = ["BLOCKS", "0", "BLOCK", "8", "0", "2", "XREFD", "70", "4", "10", "0", "20", "0", "30", "0", "0", "ENDBLK"];

        // Act
        const drawing = read(dxf([blocks, ["ENTITIES",
            "0", "ELLIPSE", "8", "0", "10", "0", "20", "0", "30", "0", "11", "0", "21", "0", "31", "0", "40", "0.5",
            "0", "LWPOLYLINE", "8", "0", "90", "1", "70", "0", "10", "0", "20", "0",
            "0", "SPLINE", "8", "0", "70", "8", "71", "3",
            "0", "INSERT", "8", "0", "2", "XREFD", "10", "0", "20", "0", "30", "0",
            ...lineDxf(0, 0, 1, 0, ["6", "DOT2", "420", "16711935"]),
            ...lineDxf(0, 0, 1, 0, ["62", "300"])]]));

        // Assert
        expect(drawing.warnings).toEqual([
            "1 ELLIPSE entity could not be drawn: its major axis has no length or runs along its extrusion.",
            "1 LWPOLYLINE entity could not be drawn: it has fewer than two points.",
            "1 SPLINE entity could not be drawn: it holds neither control points with knots to match nor two fit points.",
            "The block \"XREFD\" is an external reference to another file; it was left out.",
        ]);
        expect(drawing.parts.map(part => [part.color, part.lineType])).toEqual([["#ff00ff", "dotted"], ["#000000", "continuous"]]);
    });

    it("should lift a light polyline to its elevation and leave out the frame of a spline-fit polyline", () => {
        // Act
        const drawing = read(entities(
            ["0", "LWPOLYLINE", "8", "0", "90", "2", "70", "0", "38", "3", "10", "0", "20", "0", "10", "5", "20", "0"],
            ["0", "POLYLINE", "8", "0", "66", "1", "70", "4",
                ...[[0, 0, 16], [1, 1, 8], [2, 0, 8], [3, 3, 16]].flatMap(([x, y, flags]) => ["0", "VERTEX", "8", "0", "10", String(x), "20", String(y), "70", String(flags)]), "0", "SEQEND"],
        ));

        // Assert
        expect(segmentsOf(drawing)).toEqual([
            { points: [[0, 0, 3], [5, 0, 3]], bulges: [0, 0], closed: false },
            { points: [[1, 1, 0], [2, 0, 0]], bulges: [0, 0], closed: false },
        ]);
    });

    it("should keep a spline given by fit points whole for a kernel, closed, or open with its end tangents", () => {
        // Arrange
        const fits = ["11", "0", "21", "0", "31", "0", "11", "4", "21", "0", "31", "0", "11", "4", "21", "4", "31", "0"];

        // Act
        const reading = readDxfDrawing(entities(
            ["0", "SPLINE", "8", "0", "70", "9", "71", "3", "74", "3", ...fits],
            ["0", "SPLINE", "8", "0", "70", "8", "71", "3", "74", "3", "12", "1", "22", "0", "32", "0", "13", "0", "23", "1", "33", "0", ...fits],
        ), false);

        // Assert
        const points: Point3[] = [[0, 0, 0], [4, 0, 0], [4, 4, 0]];
        expect(reading.entities.map(entity => entity.segments)).toEqual([
            [{ kind: "fit", points, startTangent: undefined, endTangent: undefined, closed: true }],
            [{ kind: "fit", points, startTangent: [1, 0, 0], endTangent: [0, 1, 0], closed: false }],
        ]);
    });

    it("should give block contents on layer 0 the insert's layer, and BYBLOCK colours and line types the insert's, through nested inserts", () => {
        // Arrange
        const blocks = ["BLOCKS",
            "0", "BLOCK", "8", "0", "2", "INNER", "70", "0", "10", "0", "20", "0", "30", "0", ...lineDxf(0, 0, 1, 0, ["62", "0", "6", "BYBLOCK"]), "0", "ENDBLK",
            "0", "BLOCK", "8", "0", "2", "OUTER", "70", "0", "10", "0", "20", "0", "30", "0",
            "0", "INSERT", "8", "0", "62", "0", "6", "BYBLOCK", "2", "INNER", "10", "5", "20", "0", "30", "0",
            "0", "ENDBLK"];

        // Act
        const drawing = read(dxf([blocks, ["ENTITIES", "0", "INSERT", "8", "kept", "62", "3", "6", "DASHED", "2", "OUTER", "10", "0", "20", "5", "30", "0"]]));

        // Assert
        expect(drawing.parts).toEqual([{ layer: "kept", color: "#00ff00", lineType: "dashed", paths: [{ segments: [{ start: [5, 5, 0], end: [6, 5, 0] }] }] }]);
    });

    it("should take colours and line types from the layer table, leave out frozen and switched-off layers unless asked, and decode names", () => {
        // Arrange
        const tables = ["TABLES", "0", "TABLE", "2", "LAYER",
            "0", "LAYER", "2", "red", "70", "0", "62", "1", "6", "DASHED",
            "0", "LAYER", "2", "frozen", "70", "1", "62", "2", "6", "CONTINUOUS",
            "0", "LAYER", "2", "off", "70", "0", "62", "-3", "6", "CONTINUOUS",
            "0", "LAYER", "2", "Pj\\U+016Bvis", "70", "0", "62", "7", "420", "16744448", "6", "HIDDEN2",
            "0", "ENDTAB"];
        const lineOn = (layer: string, extra: string[] = []): string[] => ["0", "LINE", "8", layer, ...extra, "10", "0", "20", "0", "30", "0", "11", "1", "21", "0", "31", "0"];
        const body = ["ENTITIES", ...lineOn("red"), ...lineOn("frozen"), ...lineOn("off"), ...lineOn("Pj\\U+016Bvis"), ...lineOn("red", ["6", "CENTER", "62", "5"])];

        // Act
        const visible = read(dxf([tables, body]));
        const all = read(dxf([tables, body]), true);

        // Assert
        expect(visible.parts.map(part => [part.layer, part.color, part.lineType])).toEqual([["red", "#ff0000", "dashed"], ["Pjūvis", "#ff8000", "hidden"], ["red", "#0000ff", "center"]]);
        expect(all.parts.map(part => part.layer)).toEqual(["red", "frozen", "off", "Pjūvis", "red"]);
    });

    it("should count what it leaves out on switched-off and frozen layers, naming the input that reads them, and count nothing when asked to read them", () => {
        // Arrange
        const tables = ["TABLES", "0", "TABLE", "2", "LAYER",
            "0", "LAYER", "2", "frozen", "70", "1", "62", "2",
            "0", "LAYER", "2", "off", "70", "0", "62", "-3",
            "0", "ENDTAB"];
        const oneHidden = dxf([tables, ["ENTITIES", ...lineDxf(0, 0, 1, 0), "0", "LINE", "8", "off", "10", "0", "20", "0", "30", "0", "11", "1", "21", "0", "31", "0"]]);
        const threeHidden = dxf([tables, ["ENTITIES", ...["frozen", "off", "frozen"].flatMap(layer => ["0", "CIRCLE", "8", layer, "10", "0", "20", "0", "30", "0", "40", "1"])]]);

        // Act
        const warnings = [read(oneHidden).warnings, read(threeHidden).warnings, read(threeHidden, true).warnings];

        // Assert
        expect(warnings).toEqual([
            ["1 entity on a layer switched off or frozen was left out: set includeHiddenLayers to read it."],
            ["3 entities on layers switched off or frozen were left out: set includeHiddenLayers to read them."],
            [],
        ]);
    });

    it("should read splines by their control points, knots and weights, and leave splines of fit points only to a kernel, saying so", () => {
        // Act
        const drawing = read(entities(
            ["0", "SPLINE", "8", "0", "70", "12", "71", "2", "72", "6", "73", "3", "40", "0", "40", "0", "40", "0", "40", "1", "40", "1", "40", "1",
                "10", "10", "20", "0", "30", "0", "41", "1", "10", "10", "20", "10", "30", "0", "41", "0.7071067811865476", "10", "0", "20", "10", "30", "0", "41", "1"],
            ["0", "SPLINE", "8", "0", "70", "8", "71", "3", "74", "3", "11", "0", "21", "0", "31", "0", "11", "1", "21", "1", "31", "0", "11", "2", "21", "0", "31", "0"],
        ));

        // Assert
        expect(segmentsOf(drawing)).toEqual([{ controlPoints: [[10, 0, 0], [10, 10, 0], [0, 10, 0]], degree: 2, knots: [0, 0, 0, 1, 1, 1], weights: [1, 0.7071067811865476, 1] }]);
        expect(drawing.warnings).toEqual(["1 spline is given only by fit points, which need a kernel to interpolate; they were left out here, and occt.io.loadDxf reads them."]);
    });

    it("should read old POLYLINE entities, 2D with bulges and 3D, and count meshes, text and paper space it leaves out", () => {
        // Act
        const drawing = read(entities(
            ["0", "POLYLINE", "8", "0", "66", "1", "10", "0", "20", "0", "30", "2", "70", "1",
                "0", "VERTEX", "8", "0", "10", "0", "20", "0", "42", "1", "0", "VERTEX", "8", "0", "10", "4", "20", "0", "0", "SEQEND"],
            ["0", "POLYLINE", "8", "0", "66", "1", "70", "8", "0", "VERTEX", "8", "0", "10", "0", "20", "0", "30", "0", "70", "32",
                "0", "VERTEX", "8", "0", "10", "1", "20", "1", "30", "1", "70", "32", "0", "SEQEND"],
            ["0", "POLYLINE", "8", "0", "66", "1", "70", "64", "0", "VERTEX", "8", "0", "10", "0", "20", "0", "30", "0", "0", "SEQEND"],
            ["0", "TEXT", "8", "0", "1", "hello"], ["0", "TEXT", "8", "0", "1", "again"], ["0", "MTEXT", "8", "0", "1", "notes"],
            lineDxf(0, 0, 9, 9, ["67", "1"]),
        ));

        // Assert
        expect(segmentsOf(drawing)).toEqual([
            { points: [[0, 0, 2], [4, 0, 2]], bulges: [1, 0], closed: true },
            { points: [[0, 0, 0], [1, 1, 1]], bulges: [0, 0], closed: false },
        ]);
        expect(drawing.warnings).toEqual([
            "1 POLYLINE mesh entity was left out: only lines, arcs, circles, ellipses, polylines, splines and block inserts are drawn.",
            "2 TEXT entities were left out: only lines, arcs, circles, ellipses, polylines, splines and block inserts are drawn.",
            "1 MTEXT entity was left out: only lines, arcs, circles, ellipses, polylines, splines and block inserts are drawn.",
            "1 entity in paper space was left out: only model space is drawn.",
        ]);
    });

    it("should count every entity it leaves out of paper space, whatever its kind", () => {
        // Act
        const drawing = read(entities(lineDxf(0, 0, 1, 1, ["67", "1"]), lineDxf(0, 0, 2, 2, ["67", "1"]), [...TEXT_DXF, "67", "1"], lineDxf(0, 0, 3, 3, ["67", "0"])));

        // Assert
        expect([segmentsOf(drawing), drawing.warnings]).toEqual([[{ start: [0, 0, 0], end: [3, 3, 0] }], ["3 entities in paper space were left out: only model space is drawn."]]);
    });

    it("should state the unit when it is one it knows, and say so when the file uses another", () => {
        // Act
        const inches = read(dxf([["HEADER", "9", "$INSUNITS", "70", "1"], ["ENTITIES", ...lineDxf(0, 0, 1, 1)]]));
        const feet = read(dxf([["HEADER", "9", "$INSUNITS", "70", "2"], ["ENTITIES", ...lineDxf(0, 0, 1, 1)]]));

        // Assert
        expect(inches.unit).toBe("in");
        expect(feet.unit).toBeUndefined();
        expect(feet.warnings).toEqual(["The file states its unit as feet, which is not one of mm, cm, m or in; it is read as drawn, with no unit."]);
    });

    it("should refuse a unit code that is not a number rather than read it as a name JavaScript objects carry", () => {
        // Act
        const reading = (): unknown => read(dxf([["HEADER", "9", "$INSUNITS", "70", "constructor"], ["ENTITIES", ...lineDxf(0, 0, 1, 1)]]));

        // Assert
        expect(reading).toThrow("`dxf` is damaged: line 8 should hold a number for group code 70 and holds \"constructor\".");
    });

    it("should read a unit code it does not know as no unit, with nothing to say", () => {
        // Act
        const drawing = read(dxf([["HEADER", "9", "$INSUNITS", "70", "99"], ["ENTITIES", ...lineDxf(0, 0, 1, 1)]]));

        // Assert
        expect([drawing.unit, drawing.warnings]).toEqual([undefined, []]);
    });

    it.each(["Größe", "Ørken", "Fläche", "Maße 😀"])("should read back the layer name %s as it was written", name => {
        // Arrange
        const text = write([{ layer: name, color: "#ff0000", paths: [{ segments: [{ start: [0, 0], end: [1, 0] }] }] }]);

        // Act
        const drawing = read(text);

        // Assert
        expect(drawing.parts.map(part => part.layer)).toEqual([name]);
    });

    it("should find a block whose name is escaped the same in its definition and its insert", () => {
        // Arrange
        const blocks = ["BLOCKS", ...blockDxf("Ma\\U+00DFe", lineDxf(0, 0, 1, 0))];

        // Act
        const drawing = read(dxf([blocks, ["ENTITIES", ...insertDxf("Ma\\U+00DFe")]]));

        // Assert
        expect([segmentsOf(drawing).length, drawing.warnings]).toEqual([1, []]);
    });

    it("should refuse what is not a readable DXF, saying where, and note a block it cannot find", () => {
        // Act
        const notText: unknown = 5;
        const refusals = [
            "AutoCAD Binary DXF\r\n\u001a\u0000",
            "0\nSECTION\n2\nENTITIES\nx\nLINE",
            entities(["0", "LINE", "8", "0", "10", "one", "20", "0"]),
            entities(["0", "LINE", "8", "0", "10", "", "20", "0"]),
            entities(["0", "SPLINE", "8", "0", "10", "x", "20", "0"]),
            notText as string,
            dxf([["HEADER", "9", "$INSUNITS", "70", "4"]]),
        ].map(text => {
            try {
                read(text);
                return "";
            } catch (error) {
                return (error as Error).message;
            }
        });
        const missing = read(entities(["0", "INSERT", "8", "0", "2", "GHOST", "10", "0", "20", "0", "30", "0"]));

        // Assert
        expect(refusals).toEqual([
            "`dxf` is a binary DXF file; save it as ASCII DXF, which every CAD program can write.",
            "`dxf` is damaged: line 5 should hold a group code, a whole number, and holds \"x\".",
            "`dxf` is damaged: line 10 should hold a number for group code 10 and holds \"one\".",
            "`dxf` is damaged: line 10 should hold a number for group code 10 and holds \"\".",
            "`dxf` is damaged: line 10 should hold a number for group code 10 and holds \"x\".",
            "`dxf` must be the text of a DXF file or its bytes; it is number.",
            "`dxf` has no ENTITIES section, so it is not a DXF drawing.",
        ]);
        expect(missing.warnings).toEqual(["A block insert names the block \"GHOST\", which the file does not define; it was left out."]);
    });

    it("should stop a block that inserts itself at sixteen levels, saying so", () => {
        // Arrange
        const selfInsert = ["BLOCKS", ...blockDxf("LOOP", lineDxf(0, 0, 1, 0), insertDxf("LOOP"))];

        // Act
        const looped = read(dxf([selfInsert, ["ENTITIES", ...insertDxf("LOOP")]]));

        // Assert
        expect(segmentsOf(looped)).toHaveLength(16);
        expect(looped.warnings).toEqual(["Block inserts nested deeper than 16 were left out."]);
    });

    it("should leave out a block insert arrayed beyond what a file of its size may expand to, saying so", () => {
        // Arrange
        const text = dxf([["BLOCKS", ...blockDxf("DOT", lineDxf(0, 0, 1, 0))], ["ENTITIES", ...insertDxf("DOT", 3000, 3000)]]);

        // Act
        const drawing = read(text);

        // Assert
        expect([segmentsOf(drawing), drawing.warnings]).toEqual([[], [leftOutWarning(1, text)]]);
    });

    it.each([
        ["light", longPolylineDxf(1000)],
        ["old", longOldPolylineDxf(1000)],
    ])("should leave out, before expanding it, a long %s polyline arrayed into more points than a file of its size may expand to, though it makes few copies", (_kind, polyline) => {
        // Arrange
        const text = dxf([["BLOCKS", ...blockDxf("TRACK", polyline)], ["ENTITIES", ...insertDxf("TRACK", 50, 60)]]);

        // Act
        const drawing = read(text);

        // Assert
        expect([segmentsOf(drawing), drawing.warnings]).toEqual([[], [leftOutWarning(1, text)]]);
    });

    it("should leave out, before expanding them, blocks that each insert the next ten times down to one that draws nothing", () => {
        // Arrange
        const text = fanOutDxf(9, 10);

        // Act
        const drawing = read(text);

        // Assert
        expect(drawing.warnings).toEqual([leftOutWarning(10, text)]);
    });

    it("should leave out, before expanding them, arrays nested in arrays each under the limit alone", () => {
        // Arrange
        const blocks = ["BLOCKS", ...blockDxf("INNER", TEXT_DXF), ...blockDxf("OUTER", insertDxf("INNER", 2236, 2236))];
        const text = dxf([blocks, ["ENTITIES", ...insertDxf("OUTER", 2236, 2236)]]);

        // Act
        const drawing = read(text);

        // Assert
        expect(drawing.warnings).toEqual([leftOutWarning(1, text)]);
    });

    it("should leave out, before expanding it, a block that inserts itself three times at every level", () => {
        // Arrange
        const blocks = ["BLOCKS", ...blockDxf("LOOP", TEXT_DXF, insertDxf("LOOP"), insertDxf("LOOP"), insertDxf("LOOP"))];
        const text = dxf([blocks, ["ENTITIES", ...insertDxf("LOOP")]]);

        // Act
        const drawing = read(text);

        // Assert
        expect(drawing.warnings).toEqual([leftOutWarning(1, text)]);
    });

    it("should read nested arrays whose copies stay within the limit, every copy placed", () => {
        // Arrange
        const blocks = ["BLOCKS", ...blockDxf("DOT", lineDxf(0, 0, 1, 0)), ...blockDxf("ROW", ["0", "INSERT", "8", "0", "2", "DOT", "10", "0", "20", "0", "30", "0", "70", "3", "44", "10"])];

        // Act
        const drawing = read(dxf([blocks, ["ENTITIES", "0", "INSERT", "8", "0", "2", "ROW", "10", "0", "20", "0", "30", "0", "71", "2", "45", "5"]]));

        // Assert
        expect((segmentsOf(drawing) as Inputs.IO.DrawingLineSegmentDto[]).map(segment => segment.start)).toEqual([[0, 0, 0], [10, 0, 0], [20, 0, 0], [0, 5, 0], [10, 5, 0], [20, 5, 0]]);
    });

    it("should read the same drawing every time", () => {
        // Act
        const text = write(parts);

        // Assert
        expect(read(text)).toEqual(read(text));
        expect(segmentsOf(read(text)).length).toBe(8);
    });
});

describe("reading DXF geometry that leaves the XY plane", () => {
    it("should turn a bulged light polyline standing upright into arcs in its own plane", () => {
        // Act
        const drawing = read(entities(["0", "LWPOLYLINE", "8", "0", "90", "2", "70", "0", "210", "1", "220", "0", "230", "0", "10", "0", "20", "0", "42", "1", "10", "2", "20", "0"]));

        // Assert
        const [arc] = segmentsOf(drawing) as [Inputs.IO.DrawingArcSegmentDto];
        close([...arc.center, arc.radius, arc.startAngle, arc.endAngle, ...arc.normal!], [0, 1, 0, 1, 180, 360, 1, 0, 0]);
    });

    it("should read a circle in a tilted plane where its object coordinates place it, with its normal and radius", () => {
        // Act
        const drawing = read(entities(["0", "CIRCLE", "8", "0", "10", "0", "20", "0", "30", "5", "40", "2", "210", "0", "220", "-1", "230", "1"]));

        // Assert
        const [circle] = segmentsOf(drawing) as [Inputs.IO.DrawingCircleSegmentDto];
        close([...circle.center, circle.radius, ...circle.normal!], [0, -5 * Math.SQRT1_2, 5 * Math.SQRT1_2, 2, 0, -Math.SQRT1_2, Math.SQRT1_2]);
    });

    it("should place a block inserted with a tilted extrusion in the plane the extrusion gives, its insertion point in that plane's coordinates", () => {
        // Arrange
        const blocks = ["BLOCKS", ...blockDxf("RING", ["0", "CIRCLE", "8", "0", "10", "0", "20", "0", "30", "0", "40", "2"])];

        // Act
        const drawing = read(dxf([blocks, ["ENTITIES", "0", "INSERT", "8", "0", "2", "RING", "10", "0", "20", "0", "30", "5", "210", "0", "220", "-1", "230", "1"]]));

        // Assert
        const [circle] = segmentsOf(drawing) as [Inputs.IO.DrawingCircleSegmentDto];
        close([...circle.center, circle.radius, ...circle.normal!], [0, -5 * Math.SQRT1_2, 5 * Math.SQRT1_2, 2, 0, -Math.SQRT1_2, Math.SQRT1_2]);
    });
});

describe("reading DXF conics onto their principal axes", () => {
    const ring = ["BLOCKS", ...blockDxf("RING", ["0", "CIRCLE", "8", "0", "10", "0", "20", "0", "30", "0", "40", "5"])];
    const stretchedInY = dxf([ring, ["ENTITIES", "0", "INSERT", "8", "0", "2", "RING", "10", "0", "20", "0", "30", "0", "41", "1", "42", "2"]]);
    const tallEllipse = entities(["0", "ELLIPSE", "8", "0", "10", "0", "20", "0", "30", "0", "11", "4", "21", "0", "31", "0", "40", "2", "41", "0", "42", String(Math.PI / 2)]);

    it("should read a circle in a block stretched more in Y than in X as an ellipse whose major axis is the longer", () => {
        // Act
        const drawing = read(stretchedInY);

        // Assert
        const [ellipse] = segmentsOf(drawing) as [Inputs.IO.DrawingEllipseSegmentDto];
        close([...ellipse.majorAxis, ellipse.ratio], [0, 10, 0, 0.5]);
    });

    it("should read an ellipse whose ratio is above 1 with its axes swapped, the same points at its ends", () => {
        // Act
        const drawing = read(tallEllipse);

        // Assert
        const [ellipse] = segmentsOf(drawing) as [Inputs.IO.DrawingEllipseSegmentDto];
        close([...ellipse.majorAxis, ellipse.ratio], [0, 8, 0, 0.5]);
        close([...ellipsePointOf(ellipse, ellipse.startParameter!), ...ellipsePointOf(ellipse, ellipse.endParameter!)], [4, 0, 0, 0, 8, 0]);
    });

    it("should hand both on to svgCreate and dxfCreate, which take them", () => {
        // Arrange
        const parts = [...read(stretchedInY).parts, ...read(tallEllipse).parts];

        // Act
        const written = (): unknown => [new Svg().svgCreate({ parts }), new Dxf().dxfCreate({ dxfPathsParts: parts })];

        // Assert
        expect(written).not.toThrow();
    });
});

describe("reading DXF angles beyond a turn", () => {
    const absurd = entities(["0", "ARC", "8", "0", "10", "0", "20", "0", "30", "0", "40", "5", "50", "1e20", "51", "90"]);

    it("should read an arc whose start angle is many turns round as the same arc within the first turn", () => {
        // Act
        const drawing = read(absurd);

        // Assert
        const [arc] = segmentsOf(drawing) as [Inputs.IO.DrawingArcSegmentDto];
        close([arc.startAngle, arc.endAngle], [280, 450]);
    });

    it("should hand such an arc on to svgCreate, which bounds and draws it", () => {
        // Arrange
        const parts = read(absurd).parts;

        // Act
        const svg = new Svg().svgCreate({ parts, margin: 0 });

        // Assert
        expect(svg).toContain(`viewBox="0 -5 5 ${(5 + 5 * Math.sin((80 * Math.PI) / 180)).toFixed(6)}"`);
    });
});
