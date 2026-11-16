import { describe, expect, it } from "vitest";
import * as Inputs from "../../../../inputs";
import { kindOf, segmentsOfParts } from "../__test__/drawing-samples";
import { readSvgDrawing } from "./svg-reading";

const NS = "xmlns=\"http://www.w3.org/2000/svg\" xmlns:inkscape=\"http://www.inkscape.org/namespaces/inkscape\"";
const svgOf = (body: string, attributes = ""): string => `<svg ${NS}${attributes}>${body}</svg>`;
const read = (body: string, includeInvisible = false): Inputs.IO.SvgDrawingDto => readSvgDrawing(svgOf(body), { unit: undefined, includeInvisible });
const layer = (label: string, body: string): string => `<g inkscape:groupmode="layer" inkscape:label="${label}">${body}</g>`;
const styleOf = (drawing: Inputs.IO.SvgDrawingDto): string[] => drawing.parts.map(part => `${part.layer} ${part.color} ${part.lineType} ${part.paths.length}`);

describe("svgRead layers", () => {
    it("should put each element on the Inkscape layer around it, and the rest on the default layer", () => {
        // Act
        const drawing = read(`${layer("Cut", "<path d=\"M0 0 L10 0\" stroke=\"#ff0000\"/>")}${layer("Engrave", "<path d=\"M0 5 L10 5\" stroke=\"#ff0000\"/>")}<path d="M0 9 L10 9" stroke="#ff0000"/>`);

        // Assert
        expect(styleOf(drawing)).toEqual(["Cut #ff0000 continuous 1", "Engrave #ff0000 continuous 1", "0 #ff0000 continuous 1"]);
    });

    it("should take the nearest layer of nested layers, and a layer's id when it has no label", () => {
        // Act
        const drawing = read("<g inkscape:groupmode=\"layer\" id=\"outer\"><g inkscape:groupmode=\"layer\" inkscape:label=\"inner\"><path d=\"M0 0 L1 0\"/></g><path d=\"M0 1 L1 1\"/></g>");

        // Assert
        expect(drawing.parts.map(part => part.layer)).toEqual(["inner", "outer"]);
    });

    it("should read the layer attributes by their namespace, whatever prefix the file binds to it", () => {
        // Act
        const drawing = readSvgDrawing(
            "<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:ink=\"http://www.inkscape.org/namespaces/inkscape\" xmlns:inkscape=\"urn:other\">"
            + "<g ink:groupmode=\"layer\" ink:label=\"Bound\"><path d=\"M0 0 L1 0\"/></g><g inkscape:groupmode=\"layer\" inkscape:label=\"Other\"><path d=\"M0 1 L1 1\"/></g></svg>",
            { unit: undefined, includeInvisible: false });

        // Assert
        expect(drawing.parts.map(part => part.layer)).toEqual(["Bound", "0"]);
    });

    it("should put a <use> copy on the layer of the <use>, not of what it copies", () => {
        // Act
        const drawing = read(`${layer("Parts", "<path id=\"bolt\" d=\"M0 0 L1 0\"/>")}${layer("Copies", "<use href=\"#bolt\" x=\"5\"/>")}`);

        // Assert
        expect(drawing.parts.map(part => part.layer)).toEqual(["Parts", "Copies"]);
        expect(drawing.parts[1]!.paths[0]!.segments).toEqual([{ start: [5, 0, 0], end: [6, 0, 0] }]);
    });

    it("should replace characters a layer name may not hold, cut names past 255 characters, and say so once each", () => {
        // Act
        const drawing = read(`${layer("cut: outer/inner", "<path d=\"M0 0 L1 0\"/>")}${layer("x".repeat(300), "<path d=\"M0 1 L1 1\"/>")}${layer("   ", "<path d=\"M0 2 L1 2\"/>")}`);

        // Assert
        expect(drawing.parts.map(part => part.layer)).toEqual(["cut_ outer_inner", "x".repeat(255), "0"]);
        expect(drawing.warnings).toEqual([
            "1 layer name holds characters a layer name may not (< > / \\ \" : ; ? * | = ` or a control character); each was replaced by _.",
            "1 layer name was longer than 255 characters, the most a layer name holds, and was cut to its first 255.",
        ]);
    });

    it("should cut a long layer name before a character the cut would split in two", () => {
        // Arrange
        const labelWithAnEmojiAcrossTheCut = `${"x".repeat(254)}😀y`;

        // Act
        const drawing = read(layer(labelWithAnEmojiAcrossTheCut, "<path d=\"M0 0 L1 0\"/>"));

        // Assert
        expect(drawing.parts.map(part => part.layer)).toEqual(["x".repeat(254)]);
        expect(drawing.warnings).toEqual(["1 layer name was longer than 255 characters, the most a layer name holds, and was cut to its first 255."]);
    });
});

describe("svgRead colors", () => {
    it("should read the stroke color, else the fill, else black, in every CSS form the cascade resolves", () => {
        // Act
        const drawing = read([
            "<path d=\"M0 0 L1 0\" stroke=\"rgb(255, 128, 0)\" fill=\"blue\"/>",
            "<path d=\"M0 1 L1 1\" stroke=\"none\" fill=\"Teal\"/>",
            "<path d=\"M0 2 L1 2\" fill=\"none\"/>",
            "<path d=\"M0 3 L1 3\" style=\"stroke: #abc\"/>",
            "<g color=\"#00ff00\"><path d=\"M0 4 L1 4\" stroke=\"currentColor\"/></g>",
            "<path d=\"M0 5 L1 5\" stroke=\"transparent\" fill=\"rgb(100%, 0%, 0%)\"/>",
        ].join(""));

        // Assert
        expect(drawing.parts.map(part => part.color)).toEqual(["#ff8000", "#008080", "#000000", "#aabbcc", "#00ff00", "#ff0000"]);
        expect(drawing.warnings).toEqual([]);
    });

    it("should read a paint it cannot name as black and count it in one warning", () => {
        // Act
        const drawing = read("<path d=\"M0 0 L1 0\" stroke=\"url(#gradient)\"/><path d=\"M0 1 L1 1\" fill=\"hsl(0, 100%, 50%)\"/>");

        // Assert
        expect(styleOf(drawing)).toEqual(["0 #000000 continuous 2"]);
        expect(drawing.warnings).toEqual(["2 elements are painted with a gradient, a pattern or a color other than a hex, rgb() or named color; they were read as black."]);
    });
});

describe("svgRead line types", () => {
    it("should read each dash pattern as the line type it draws at any scale, and no pattern as continuous", () => {
        // Act
        const drawing = read([
            "<path d=\"M0 0 L100 0\" stroke-dasharray=\"16 3 3 3\"/>",
            "<path d=\"M0 1 L100 1\" stroke-dasharray=\"0, 4\"/>",
            "<path d=\"M0 2 L100 2\" stroke-dasharray=\"none\"/>",
            "<path d=\"M0 3 L100 3\" stroke-dasharray=\"4 -2\"/>",
        ].join(""));

        // Assert
        expect(drawing.parts.map(part => part.lineType)).toEqual([Inputs.IO.lineTypeEnum.center, Inputs.IO.lineTypeEnum.dotted, Inputs.IO.lineTypeEnum.continuous]);
        expect(drawing.parts[2]!.paths).toHaveLength(2);
    });

    it("should tell dashed from hidden by how large the dashes are against the drawing", () => {
        // Act
        const drawing = read("<path d=\"M0 0 L200 0\" stroke-dasharray=\"4 2\"/><path d=\"M0 9 L200 9\" stroke-dasharray=\"2 1\"/>");

        // Assert
        expect(drawing.parts.map(part => part.lineType)).toEqual([Inputs.IO.lineTypeEnum.dashed, Inputs.IO.lineTypeEnum.hidden]);
    });

    it("should read a pattern that dashed and hidden both draw as dashed when the drawing reaches too far to measure", () => {
        // Act
        const drawing = read("<path d=\"M0 0 L1e100 0\" stroke-dasharray=\"2 1\"/>");

        // Assert
        expect(drawing.parts.map(part => part.lineType)).toEqual([Inputs.IO.lineTypeEnum.dashed]);
        expect(drawing.warnings).toEqual([]);
    });

    it("should read a pattern no line type draws as dashed and count it in one warning", () => {
        // Act
        const drawing = read("<path d=\"M0 0 L1 0\" stroke-dasharray=\"5 1\"/><path d=\"M0 1 L1 1\" stroke-dasharray=\"1 2 3\"/>");

        // Assert
        expect(styleOf(drawing)).toEqual(["0 #000000 dashed 2"]);
        expect(drawing.warnings).toEqual(["2 elements are dashed in a pattern no line type draws; they were read as dashed."]);
    });
});

describe("svgRead geometry", () => {
    it("should turn Y up and keep lines exact through nested transforms", () => {
        // Act
        const drawing = read("<g transform=\"translate(10 20)\"><g transform=\"scale(2)\"><line x1=\"1\" y1=\"2\" x2=\"3\" y2=\"4\"/></g></g>");

        // Assert
        expect(segmentsOfParts(drawing.parts)).toEqual([{ start: [12, -24, 0], end: [16, -28, 0] }]);
    });

    it("should read every basic shape as the segments it draws, closed shapes closed", () => {
        // Act
        const drawing = read([
            "<rect x=\"0\" y=\"0\" width=\"10\" height=\"5\"/>",
            "<rect x=\"0\" y=\"0\" width=\"10\" height=\"5\" rx=\"1\"/>",
            "<circle cx=\"3\" cy=\"4\" r=\"2\"/>",
            "<ellipse cx=\"0\" cy=\"0\" rx=\"4\" ry=\"8\"/>",
            "<polygon points=\"0 0 4 0 4 3\"/>",
            "<polyline points=\"0 0 4 0 4 3\"/>",
        ].join(""));

        // Assert
        expect(drawing.parts[0]!.paths.map(path => path.segments.map(kindOf).join(" "))).toEqual([
            "line line line line",
            "line arc line arc line arc line arc",
            "circle",
            "ellipse",
            "line line line",
            "line line",
        ]);
        expect(drawing.parts[0]!.paths[2]!.segments).toEqual([{ center: [3, -4, 0], radius: 2 }]);
    });

    it("should read a whole ellipse on its principal axes, the major the longer", () => {
        // Act
        const drawing = read("<ellipse cx=\"0\" cy=\"0\" rx=\"4\" ry=\"8\"/>");

        // Assert
        const ellipse = segmentsOfParts(drawing.parts)[0] as Inputs.IO.DrawingEllipseSegmentDto;
        expect(Math.abs(ellipse.majorAxis[1])).toBeCloseTo(8, 12);
        expect(ellipse.majorAxis[0]).toBeCloseTo(0, 12);
        expect(ellipse.ratio).toBeCloseTo(0.5, 12);
        expect([ellipse.startParameter, ellipse.endParameter]).toEqual([0, 2 * Math.PI]);
    });

    it("should read an arc drawn clockwise on the page as the counterclockwise arc over the same points", () => {
        // Act
        const drawing = read("<path d=\"M10 0 A10 10 0 0 1 0 10\"/>");

        // Assert
        const arc = segmentsOfParts(drawing.parts)[0] as Inputs.IO.DrawingArcSegmentDto;
        expect(arc.center).toEqual([0, 0, 0]);
        expect(arc.radius).toBeCloseTo(10, 12);
        expect(arc.startAngle).toBeCloseTo(270, 9);
        expect(arc.endAngle).toBeCloseTo(0, 9);
    });

    it("should read an arc drawn counterclockwise on the page, the large one, over the points it draws", () => {
        // Act
        const drawing = read("<path d=\"M10 0 A10 10 0 1 0 0 10\"/>");

        // Assert
        const arc = segmentsOfParts(drawing.parts)[0] as Inputs.IO.DrawingArcSegmentDto;
        expect(arc.center[0]).toBeCloseTo(0, 12);
        expect(arc.center[1]).toBeCloseTo(0, 12);
        expect(arc.startAngle).toBeCloseTo(0, 9);
        expect(arc.endAngle).toBeCloseTo(270, 9);
    });

    it("should join arcs of one circle into one arc, and arcs that close it into a circle", () => {
        // Act
        const drawing = read("<path d=\"M10 0 A10 10 0 0 0 0 -10 A10 10 0 0 0 -10 0\"/><path d=\"M10 0 A10 10 0 0 1 -10 0 A10 10 0 0 1 10 0 Z\"/>");

        // Assert
        expect(drawing.parts[0]!.paths.map(path => path.segments.map(kindOf).join(" "))).toEqual(["arc", "circle"]);
        const arc = drawing.parts[0]!.paths[0]!.segments[0] as Inputs.IO.DrawingArcSegmentDto;
        expect([arc.startAngle, arc.endAngle].map(angle => Math.round(angle * 1e9) / 1e9)).toEqual([0, 180]);
    });

    it("should read arcs of an ellipse that run on past a whole turn as the whole ellipse, and arcs after a whole circle as a new arc", () => {
        // Act
        const drawing = read([
            "<path d=\"M20 0 A20 10 0 0 1 -10 8.660254 A20 10 0 0 1 -10 -8.660254 A20 10 0 0 1 15.320889 6.427876\"/>",
            "<path d=\"M10 0 A10 10 0 0 0 -10 0 A10 10 0 0 0 10 0 A10 10 0 0 0 0 -10\"/>",
        ].join(""));

        // Assert
        expect(drawing.parts[0]!.paths.map(path => path.segments.map(kindOf).join(" "))).toEqual(["ellipse", "circle arc"]);
        const ellipse = drawing.parts[0]!.paths[0]!.segments[0] as Inputs.IO.DrawingEllipseSegmentDto;
        expect([ellipse.startParameter, ellipse.endParameter]).toEqual([0, 2 * Math.PI]);
    });

    it("should join two halves of one ellipse into the whole ellipse when the second is written turned half a turn", () => {
        // Act
        const turned = read("<path d=\"M20 0 A20 10 0 0 1 -20 0 A20 10 180 0 1 20 0\"/>");
        const unturned = read("<path d=\"M20 0 A20 10 0 0 1 -20 0 A20 10 0 0 1 20 0\"/>");

        // Assert
        expect(segmentsOfParts(turned.parts).map(kindOf)).toEqual(["ellipse"]);
        expect(segmentsOfParts(turned.parts)).toEqual(segmentsOfParts(unturned.parts));
    });

    it("should read an arc that turns too little to draw as the line between its ends", () => {
        // Act
        const drawing = read("<path d=\"M0 5 A1000000 1000000 0 0 1 0.000001 5\"/>");

        // Assert
        expect(segmentsOfParts(drawing.parts)).toEqual([{ start: [0, -5, 0], end: [0.000001, -5, 0] }]);
    });

    it("should read quadratic and cubic Beziers as exact splines of degree 2 and 3", () => {
        // Act
        const drawing = read("<path d=\"M0 0 Q5 10 10 0 C12 -4 16 4 20 0\"/>");

        // Assert
        expect(segmentsOfParts(drawing.parts)).toEqual([
            { controlPoints: [[0, 0, 0], [5, -10, 0], [10, 0, 0]], degree: 2, knots: [0, 0, 0, 1, 1, 1] },
            { controlPoints: [[10, 0, 0], [12, 4, 0], [16, -4, 0], [20, 0, 0]], degree: 3, knots: [0, 0, 0, 0, 1, 1, 1, 1] },
        ]);
    });

    it("should close a closed subpath with its closing line only where its end is not its start", () => {
        // Act
        const drawing = read("<path d=\"M0 0 L10 0 L10 10 Z M20 0 L30 0 L20 0 Z\"/>");

        // Assert
        expect(drawing.parts[0]!.paths.map(path => path.segments.length)).toEqual([3, 2]);
        expect(drawing.parts[0]!.paths[0]!.segments[2]).toEqual({ start: [10, -10, 0], end: [0, 0, 0] });
    });

    it("should leave out arcs a transform flattens to no width and say so", () => {
        // Act
        const drawing = read("<g transform=\"scale(1 0)\"><circle r=\"5\"/></g><path d=\"M0 0 L1 0\"/>");

        // Assert
        expect(segmentsOfParts(drawing.parts)).toEqual([{ start: [0, 0, 0], end: [1, 0, 0] }]);
        expect(drawing.warnings).toEqual(["1 arc was left out: a transform flattens it to no width."]);
    });

    it("should add nothing for an element that draws nothing", () => {
        // Act
        const drawing = read("<path d=\"M5 5\"/><path d=\"M5 5 L5 5\"/>");

        // Assert
        expect(drawing.parts).toEqual([]);
    });
});

describe("svgRead visibility, units and warnings", () => {
    it("should leave out hidden elements and say so, and read them when asked", () => {
        // Arrange
        const body = "<path d=\"M0 0 L1 0\" display=\"none\"/><g visibility=\"hidden\"><path d=\"M0 1 L1 1\"/></g><path d=\"M0 2 L1 2\"/>";

        // Act
        const shown = read(body);
        const all = read(body, true);

        // Assert
        expect(shown.parts[0]!.paths).toHaveLength(1);
        expect(shown.warnings).toEqual(["2 hidden elements were left out: set includeInvisible to read them."]);
        expect(all.parts[0]!.paths).toHaveLength(3);
        expect(all.warnings).toEqual([]);
    });

    it("should read root user units by default, and the true size in a unit with the page's corner at the origin", () => {
        // Arrange
        const svg = svgOf("<path d=\"M20 10 L200 100\"/>", " width=\"100mm\" height=\"50mm\" viewBox=\"0 0 200 100\"");

        // Act
        const userUnits = readSvgDrawing(svg, { unit: undefined, includeInvisible: false });
        const millimetres = readSvgDrawing(svg, { unit: Inputs.Base.unitOfLengthEnum.millimetre, includeInvisible: false });

        // Assert
        expect(segmentsOfParts(userUnits.parts)).toEqual([{ start: [20, -10, 0], end: [200, -100, 0] }]);
        expect(userUnits.unit).toBeUndefined();
        expect(millimetres.unit).toBe(Inputs.Base.unitOfLengthEnum.millimetre);
        const line = segmentsOfParts(millimetres.parts)[0] as Inputs.IO.DrawingLineSegmentDto;
        expect([...line.start, ...line.end].map(value => Math.round(value * 1e9) / 1e9)).toEqual([10, -5, 0, 100, -50, 0]);
        expect(millimetres.viewBox).toEqual([0, 0, 200, 100]);
    });

    it("should read a file with no svg root as no parts in the unit asked for, and say why", () => {
        // Act
        const drawing = readSvgDrawing("<html><body/></html>", { unit: Inputs.Base.unitOfLengthEnum.millimetre, includeInvisible: false });

        // Assert
        expect(drawing).toEqual({ parts: [], unit: Inputs.Base.unitOfLengthEnum.millimetre, viewBox: undefined, warnings: ["No <svg> root element found."] });
    });

    it("should put the scene's warnings before its own, and read a file with no layers onto the default layer", () => {
        // Act
        const drawing = read("<text>label</text><path d=\"M0 0 L1 0\" stroke=\"url(#g)\"/>");

        // Assert
        expect(drawing.warnings).toEqual([
            "<text> is not supported and contributes no geometry. Convert text to paths before exporting.",
            "1 element is painted with a gradient, a pattern or a color other than a hex, rgb() or named color; it was read as black.",
        ]);
        expect(drawing.parts.map(part => part.layer)).toEqual(["0"]);
    });
});
