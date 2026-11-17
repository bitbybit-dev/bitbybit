import { describe, expect, it } from "vitest";
import * as Inputs from "../../inputs";
import { InputError } from "../../kernel-calls";
import { dxfOf, layerTableDxf, lineDxf } from "../helpers/files/__test__/dxf-builders";
import { farthestApart, pointsAlong, segmentsOfParts } from "../helpers/files/__test__/drawing-samples";
import type { SegmentDto } from "../helpers/files/__test__/drawing-samples";
import { IoBitByBit } from "./io";
import { Dxf } from "./dxf";
import { Svg } from "./svg";

const WRITTEN = 1e-6;
const drawing = new IoBitByBit().drawing;
const dxf = new Dxf();
const svg = new Svg();

const PARTS: Inputs.IO.DrawingPartDto[] = [
    { layer: "outline", color: "#ff0000", paths: [{ segments: [{ start: [0, 0], end: [80, 0] }] }, { segments: [{ center: [40, 30], radius: 12 }] }] },
    { layer: "outline", color: "#0000ff", lineType: Inputs.IO.lineTypeEnum.hidden, paths: [{ segments: [{ center: [10, 50], radius: 8, startAngle: 20, endAngle: 250 }] }] },
    { layer: "slots", color: "#00ff00", lineType: Inputs.IO.lineTypeEnum.center, paths: [{ segments: [{ center: [60, 50], majorAxis: [10, 6], ratio: 0.5, startParameter: 1, endParameter: 4 }] }] },
    { layer: "curves", color: "#000000", paths: [{ segments: [{ controlPoints: [[0, 60], [10, 70], [20, 55], [30, 65]], degree: 3 }] }] },
];

const styleOf = (parts: readonly Inputs.IO.DrawingPartDto[]): string[] => parts.map(part => `${part.layer} ${part.color} ${part.lineType ?? Inputs.IO.lineTypeEnum.continuous} ${part.paths.length}`);

const sameGeometry = (read: readonly SegmentDto[], written: readonly SegmentDto[]): number =>
    Math.max(...read.map((segment, at) => farthestApart(pointsAlong(segment), pointsAlong(written[at]!))));

describe("io.drawing.svgToDxf", () => {
    it("should write the drawing an SVG file holds as the DXF that reads back as the same drawing", () => {
        // Arrange
        const file = svg.svgCreate({ parts: PARTS });

        // Act
        const converted = drawing.svgToDxf({ svg: file });

        // Assert
        const read = dxf.dxfRead({ dxf: converted.dxf });
        expect(converted.warnings).toEqual([]);
        expect(styleOf(read.parts)).toEqual(styleOf(PARTS));
        expect(sameGeometry(segmentsOfParts(read.parts), segmentsOfParts(PARTS))).toBeLessThan(WRITTEN);
        expect(read.unit).toBeUndefined();
    });

    it("should read the SVG at true size in the unit given and state that unit in the DXF", () => {
        // Arrange
        const file = svg.svgCreate({ parts: PARTS, unit: Inputs.Base.unitOfLengthEnum.inch });

        // Act
        const converted = drawing.svgToDxf({ svg: file, unit: Inputs.Base.unitOfLengthEnum.inch, colorFormat: "truecolor" });

        // Assert
        const read = dxf.dxfRead({ dxf: converted.dxf });
        expect(read.unit).toBe(Inputs.Base.unitOfLengthEnum.inch);
        expect(styleOf(read.parts)).toEqual(styleOf(PARTS));
        expect(converted.dxf).toContain("\n420\n");
    });

    it("should write splines and ellipses as polylines for R12, and hand on what the reading left out", () => {
        // Arrange
        const file = svg.svgCreate({ parts: PARTS }).replace("</svg>", "<text>note</text></svg>");

        // Act
        const converted = drawing.svgToDxf({ svg: file, acadVersion: "AC1009", curveTolerance: 0.001 });

        // Assert
        expect(converted.warnings).toEqual(["<text> is not supported and contributes no geometry. Convert text to paths before exporting."]);
        expect(converted.dxf).not.toContain("SPLINE");
        expect(dxf.dxfRead({ dxf: converted.dxf }).version).toBe("AC1009");
    });

    it("should leave out hidden elements unless asked to write them", () => {
        // Arrange
        const file = "<svg xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M0 0 L1 0\"/><path d=\"M0 1 L1 1\" display=\"none\"/></svg>";

        // Act
        const shown = drawing.svgToDxf({ svg: file });
        const all = drawing.svgToDxf({ svg: file, includeInvisible: true });

        // Assert
        expect(segmentsOfParts(dxf.dxfRead({ dxf: shown.dxf }).parts)).toHaveLength(1);
        expect(segmentsOfParts(dxf.dxfRead({ dxf: all.dxf }).parts)).toHaveLength(2);
        expect(shown.warnings).toEqual(["1 hidden element was left out: set includeInvisible to read it."]);
    });

    it("should refuse a unit with R12, which has no place for one", () => {
        // Act & Assert
        expect(() => drawing.svgToDxf({ svg: svg.svgCreate({ parts: PARTS }), unit: Inputs.Base.unitOfLengthEnum.millimetre, acadVersion: "AC1009" })).toThrow(InputError);
    });
});

describe("io.drawing.dxfToSvg", () => {
    it("should write the drawing a DXF file holds as the SVG that reads back as the same drawing", () => {
        // Arrange
        const file = dxf.dxfCreate({ dxfPathsParts: PARTS });

        // Act
        const converted = drawing.dxfToSvg({ dxf: file });

        // Assert
        const read = svg.svgRead({ svg: converted.svg });
        expect(converted.warnings).toEqual([]);
        expect(styleOf(read.parts)).toEqual(styleOf(PARTS));
        expect(sameGeometry(segmentsOfParts(read.parts), segmentsOfParts(PARTS))).toBeLessThan(WRITTEN);
    });

    it("should give the SVG the true size of the unit the DXF states", () => {
        // Arrange
        const file = dxf.dxfCreate({ dxfPathsParts: PARTS, unit: Inputs.Base.unitOfLengthEnum.millimetre });

        // Act
        const converted = drawing.dxfToSvg({ dxf: file, margin: 0, strokeWidth: 0.5 });

        // Assert
        expect(converted.svg).toMatch(/<svg [^>]* width="[\d.]+mm" height="[\d.]+mm" viewBox=/);
        expect(converted.svg).toContain("stroke-width=\"0.5\"");
    });

    it("should leave out splines given only by fit points with the reading's warning, and hidden layers unless asked", () => {
        // Arrange
        const fitSpline = ["0", "SPLINE", "8", "0", "70", "8", "71", "3", "74", "3", "11", "0", "21", "0", "31", "0", "11", "5", "21", "5", "31", "0", "11", "10", "21", "0", "31", "0"];
        const file = dxfOf([layerTableDxf(["2", "off", "62", "-1", "6", "CONTINUOUS"]), ["ENTITIES", ...fitSpline, ...lineDxf(0, 0, 10, 0), ...lineDxf(0, 5, 10, 5, "off")]]);

        // Act
        const shown = drawing.dxfToSvg({ dxf: file });
        const all = drawing.dxfToSvg({ dxf: file, includeHiddenLayers: true });

        // Assert
        expect(shown.warnings).toEqual([
            "1 entity on a layer switched off or frozen was left out: set includeHiddenLayers to read it.",
            "1 spline is given only by fit points, which need a kernel to interpolate; they were left out here, and occt.io.loadDxf reads them.",
        ]);
        expect(segmentsOfParts(svg.svgRead({ svg: shown.svg }).parts)).toHaveLength(1);
        expect(segmentsOfParts(svg.svgRead({ svg: all.svg }).parts)).toHaveLength(2);
    });

    it("should refuse a stroke width that is not above 0", () => {
        // Act & Assert
        expect(() => drawing.dxfToSvg({ dxf: dxf.dxfCreate({ dxfPathsParts: PARTS }), strokeWidth: 0 })).toThrow(new InputError("`strokeWidth` must be above 0; it is 0.", "strokeWidth"));
    });
});
