import { describe, expect, it } from "vitest";
import * as Inputs from "../../inputs";
import { blockDxf, dxfOf, entitiesDxf } from "../helpers/files/__test__/dxf-builders";
import { IoBitByBit } from "./io";

const io = new IoBitByBit();

const MADE_BY_EZDXF = "0\nTEXT\n8\nnotes\n10\n10.0\n20\n20.0\n30\n0.0\n40\n5.0\n1\nLEFT %%c20%%d\n11\n10.0\n21\n20.0\n31\n0.0\n0\nTEXT\n8\n0\n10\n50.0\n20\n20.0\n30\n0.0\n40\n4.0\n1\nMID\n50\n30.0\n72\n1\n11\n50.0\n21\n20.0\n31\n0.0\n0\nTEXT\n8\n0\n10\n90.0\n20\n20.0\n30\n0.0\n40\n4.0\n1\nEND\n72\n2\n11\n90.0\n21\n20.0\n31\n0.0\n0\nTEXT\n8\n0\n10\n0.0\n20\n40.0\n30\n0.0\n40\n5.0\n1\nFIT\n72\n5\n11\n30.0\n21\n40.0\n31\n0.0\n0\nTEXT\n8\n0\n10\n0.0\n20\n60.0\n30\n0.0\n40\n5.0\n1\nALIGNED\n72\n3\n11\n0.0\n21\n100.0\n31\n0.0\n0\nMTEXT\n8\n0\n10\n0.0\n20\n0.0\n30\n0.0\n40\n3.0\n71\n1\n1\nmulti\\Pline\n0\nHATCH\n8\ncut\n62\n7\n10\n0.0\n20\n0.0\n30\n0.0\n210\n0.0\n220\n0.0\n230\n1.0\n2\nANSI31\n70\n0\n71\n0\n91\n2\n92\n3\n72\n1\n73\n1\n93\n4\n10\n0.0\n20\n0.0\n42\n0.0\n10\n40.0\n20\n0.0\n42\n1.0\n10\n40.0\n20\n30.0\n42\n0.0\n10\n0.0\n20\n30.0\n42\n0.0\n97\n0\n92\n1\n93\n3\n72\n1\n10\n100.0\n20\n50.0\n11\n110.0\n21\n50.0\n72\n2\n10\n100.0\n20\n50.0\n40\n10\n50\n270.0\n51\n360.0\n73\n0\n72\n1\n10\n100.0\n20\n60.0\n11\n100.0\n21\n50.0\n97\n0\n75\n1\n76\n1\n52\n30.0\n41\n2.0\n77\n0\n78\n1\n53\n75.0\n43\n0.0\n44\n0.0\n45\n-6.133628997\n46\n1.6435009364\n79\n0\n98\n0\n0\nHATCH\n8\n0\n62\n5\n10\n0.0\n20\n0.0\n30\n0.0\n210\n0.0\n220\n0.0\n230\n1.0\n2\nSOLID\n70\n1\n71\n0\n91\n1\n92\n1\n93\n1\n72\n3\n10\n20.0\n20\n60.0\n11\n15.0\n21\n0.0\n40\n0.4\n50\n180.0\n51\n360.0\n73\n0\n97\n0\n75\n0\n76\n1\n98\n0\n0\nHATCH\n8\n0\n62\n7\n10\n0.0\n20\n0.0\n30\n0.0\n210\n0.0\n220\n0.0\n230\n1.0\n2\nANSI37\n70\n0\n71\n0\n91\n1\n92\n1\n93\n2\n72\n4\n94\n2\n73\n0\n74\n0\n95\n6\n96\n3\n40\n0.0\n40\n0.0\n40\n0.0\n40\n1.0\n40\n1.0\n40\n1.0\n10\n0.0\n20\n80.0\n10\n10.0\n20\n95.0\n10\n20.0\n20\n80.0\n72\n1\n10\n20.0\n20\n80.0\n11\n0.0\n21\n80.0\n97\n0\n75\n1\n76\n1\n52\n0.0\n41\n1.0\n77\n0\n78\n2\n53\n45.0\n43\n0.0\n44\n0.0\n45\n-2.2450640303\n46\n2.2450640303\n79\n0\n53\n135.0\n43\n0.0\n44\n0.0\n45\n-2.2450640303\n46\n-2.2450640303\n79\n0\n98\n0".split("\n");

const square: Inputs.IO.DrawingPolylineSegmentDto = { points: [[0, 0], [40, 0], [40, 30], [0, 30]], closed: true };
const hole: Inputs.IO.DrawingCircleSegmentDto = { center: [20, 15], radius: 6 };

const textsOf = (drawing: Inputs.IO.DxfDrawingDto): Inputs.IO.DrawingTextDto[] => drawing.parts.flatMap(part => part.texts ?? []);

const hatchesOf = (drawing: Inputs.IO.DxfDrawingDto): Inputs.IO.DrawingHatchDto[] => drawing.parts.flatMap(part => part.hatches ?? []);

const farthest = (read: Inputs.Base.Point3[][], written: Inputs.Base.Point3[][]): number =>
    Math.max(...read.flatMap((stroke, at) => stroke.map((point, index) => Math.hypot(point[0] - written[at]![index]![0], point[1] - written[at]![index]![1]))));

const textDxf = (...pairs: string[]): string[] => ["0", "TEXT", "8", "0", ...pairs];

describe("texts and hatches read from a DXF drawing", () => {

    it("should read back the texts it wrote as the same strokes, whatever their anchor, angle and width, with every letter and sign kept", () => {
        // Arrange
        const texts: Inputs.IO.DrawingTextDto[] = [
            { text: "SECTION A-A", position: [20, -20], height: 3.5, anchor: "middle" },
            { text: "Ąžuolas Čiurlionytė Ø 20° ^ 5%% 10% %%c", position: [0, 70], height: 5 },
            { text: "TURNED", position: [85, 0], height: 3.5, rotation: 90, anchor: "end" },
            { text: "NARROW TEXT IN A CELL", position: [0, 80], height: 3.5, widthFactor: 0.6, rotation: -30 },
        ];

        // Act
        const read = io.dxf.dxfRead({ dxf: io.dxf.dxfCreate({ dxfPathsParts: [{ layer: "text", color: "#ff0000", paths: [], texts }] }) });
        const back = textsOf(read);

        // Assert
        expect(read.warnings).toEqual([]);
        expect(read.parts.map(part => [part.layer, part.color, part.paths.length])).toEqual([["text", "#ff0000", 0]]);
        expect(back.map(text => text.text)).toEqual(texts.map(text => text.text));
        expect(back.map(text => text.anchor)).toEqual(["start", "start", "start", "start"]);
        back.forEach((text, at) => {
            expect(farthest(io.drawing.textStrokes(text), io.drawing.textStrokes(texts[at]!))).toBeLessThan(1e-9);
            expect(io.drawing.textSize(text).width).toBeCloseTo(io.drawing.textSize(texts[at]!).width, 9);
        });
    });

    it("should read back the hatches it wrote: the pattern, the angle and spacing of its lines, a boundary with its hole", () => {
        // Arrange
        const boundaries = [{ segments: [square] }, { segments: [hole] }];
        const hatches: Inputs.IO.DrawingHatchDto[] = [
            { boundaries },
            { boundaries, pattern: Inputs.IO.hatchPatternEnum.ansi32, angle: 30, spacing: 4 },
            { boundaries, pattern: Inputs.IO.hatchPatternEnum.ansi37, angle: 120, spacing: 2 },
            { boundaries, pattern: Inputs.IO.hatchPatternEnum.solid },
        ];

        // Act
        const read = io.dxf.dxfRead({ dxf: io.dxf.dxfCreate({ dxfPathsParts: [{ layer: "cut", paths: [], hatches }] }) });
        const back = hatchesOf(read);

        // Assert
        expect(read.warnings).toEqual([]);
        expect(back.map(hatch => hatch.pattern)).toEqual(["ansi31", "ansi32", "ansi37", "solid"]);
        expect(back.slice(0, 3).map(hatch => [Math.round(hatch.angle! * 1e9) / 1e9, Math.round(hatch.spacing! * 1e9) / 1e9])).toEqual([[45, 3], [30, 4], [120, 2]]);
        expect(back[0]!.boundaries).toEqual([
            { segments: [{ points: [[0, 0, 0], [40, 0, 0], [40, 30, 0], [0, 30, 0]], bulges: [0, 0, 0, 0], closed: true }] },
            { segments: [{ points: [[26, 15, 0], [14, 15, 0]], bulges: [expect.closeTo(1, 12), expect.closeTo(1, 12)], closed: true }] },
        ]);
    });

    it("should keep texts and hatches through a conversion from DXF to SVG", () => {
        // Arrange
        const dxf = io.dxf.dxfCreate({ dxfPathsParts: [{ paths: [{ segments: [square] }], hatches: [{ boundaries: [{ segments: [square] }] }], texts: [{ text: "I", position: [10, 20], height: 21 }] }] });

        // Act
        const converted = io.drawing.dxfToSvg({ dxf });

        // Assert
        expect(converted.warnings).toEqual([]);
        const id = /<pattern id="(hatch-[0-9a-f]{8})"/.exec(converted.svg)?.[1];
        expect(id).toBeDefined();
        expect(converted.svg).toContain(`fill="url(#${id})" fill-rule="evenodd"`);
        expect(converted.svg).toContain("<path d=\"M14 -41 L14 -20\"/>");
    });

    it("should read the texts ezdxf writes by their alignment: left, centred and right at their point, fitted and aligned between two", () => {
        // Act
        const read = io.dxf.dxfRead({ dxf: entitiesDxf(MADE_BY_EZDXF) });
        const texts = textsOf(read);
        const rounded = texts.map(text => [text.text, text.position.map(value => Math.round(value * 1e6) / 1e6 + 0), text.anchor, Math.round(text.height! * 1e6) / 1e6, Math.round(text.rotation! * 1e6) / 1e6, Math.round(text.widthFactor! * 1e6) / 1e6]);

        // Assert
        expect(rounded).toEqual([
            ["LEFT \u230020\u00B0", [10, 20, 0], "start", 5, 0, 1],
            ["MID", [50, 20, 0], "middle", 4, 30, 1],
            ["END", [90, 20, 0], "end", 4, 0, 1],
            ["FIT", [0, 40, 0], "start", 5, 0, 3],
            ["ALIGNED", [0, 60, 0], "start", 6.666667, 90, 1],
        ]);
        expect(read.warnings).toEqual(["1 MTEXT entity was left out: only lines, arcs, circles, ellipses, polylines, splines, texts, hatches and block inserts are drawn."]);
        expect(io.drawing.textSize(texts[3]!).width).toBeCloseTo(30, 9);
        expect(io.drawing.textSize(texts[4]!).width).toBeCloseTo(40, 9);
    });

    it("should read the hatches ezdxf writes: polyline and edge boundaries, an arc and an ellipse drawn clockwise, a spline, and the pattern by its lines", () => {
        // Act
        const read = io.dxf.dxfRead({ dxf: entitiesDxf(MADE_BY_EZDXF) });
        const found = (pattern: string): Inputs.IO.DrawingHatchDto | undefined => hatchesOf(read).find(hatch => String(hatch.pattern) === pattern);
        const [lined, solid, crossed] = [found("ansi31"), found("solid"), found("ansi37")];
        const quarter = lined!.boundaries[1]!.segments[1] as Inputs.IO.DrawingArcSegmentDto;
        const half = solid!.boundaries[0]!.segments[0] as Inputs.IO.DrawingEllipseSegmentDto;
        const curve = crossed!.boundaries[0]!.segments[0] as Inputs.IO.DrawingSplineSegmentDto;

        // Assert
        expect(read.parts.find(part => part.layer === "cut")?.hatches).toHaveLength(1);
        expect([lined!.pattern, Math.round(lined!.angle! * 1e6) / 1e6, Math.round(lined!.spacing! * 1e6) / 1e6]).toEqual(["ansi31", 75, 6.35]);
        expect(lined!.boundaries[0]).toEqual({ segments: [{ points: [[0, 0, 0], [40, 0, 0], [40, 30, 0], [0, 30, 0]], bulges: [0, 1, 0, 0], closed: true }] });
        expect(lined!.boundaries[1]!.segments[0]).toEqual({ start: [100, 50, 0], end: [110, 50, 0] });
        expect([quarter.center, quarter.radius, Math.round(quarter.startAngle), Math.round(quarter.endAngle)]).toEqual([[100, 50, 0], 10, 0, 90]);
        expect(solid!.pattern).toBe("solid");
        expect([half.center, half.majorAxis, half.ratio]).toEqual([[20, 60, 0], [15, 0, 0], 0.4]);
        expect([half.startParameter, half.endParameter]).toEqual([0, expect.closeTo(Math.PI, 12)]);
        expect([crossed!.pattern, Math.round(crossed!.angle! * 1e6) / 1e6, Math.round(crossed!.spacing! * 1e6) / 1e6]).toEqual(["ansi37", 45, 3.175]);
        expect(curve).toEqual({ controlPoints: [[0, 80, 0], [10, 95, 0], [20, 80, 0]], degree: 2, knots: [0, 0, 0, 1, 1, 1] });
        expect(crossed!.boundaries[0]!.segments[1]).toEqual({ start: [20, 80, 0], end: [0, 80, 0] });
    });

    it("should place a text and a hatch of a block where each insert turns and scales them, and leave them out of an unevenly scaled one", () => {
        // Arrange
        const block = blockDxf("LABEL", textDxf("10", "10", "20", "0", "40", "2", "1", "I"), ["0", "HATCH", "8", "0", "2", "ANSI31", "70", "0", "91", "1", "92", "3", "72", "0", "73", "1", "93", "3", "10", "0", "20", "0", "10", "4", "20", "0", "10", "4", "20", "4", "97", "0", "78", "1", "53", "0", "43", "0", "44", "0", "45", "0", "46", "1", "79", "0"]);
        const placed = ["0", "INSERT", "8", "0", "2", "LABEL", "10", "100", "20", "50", "41", "2", "42", "2", "43", "2", "50", "90"];
        const uneven = ["0", "INSERT", "8", "0", "2", "LABEL", "10", "0", "20", "0", "41", "2", "42", "1", "43", "1"];

        // Act
        const read = io.dxf.dxfRead({ dxf: dxfOf([["BLOCKS", ...block], ["ENTITIES", ...placed, ...uneven]]) });
        const [text] = textsOf(read);
        const [hatch] = hatchesOf(read);
        const corners = (hatch!.boundaries[0]!.segments[0] as Inputs.IO.DrawingPolylineSegmentDto).points.map(point => point.map(value => Math.round(value * 1e9) / 1e9 + 0));

        // Assert
        expect(textsOf(read)).toHaveLength(1);
        expect([text!.position.map(value => Math.round(value * 1e9) / 1e9 + 0), text!.height, text!.rotation]).toEqual([[100, 70, 0], 4, 90]);
        expect(corners).toEqual([[100, 50, 0], [100, 58, 0], [92, 58, 0]]);
        expect([hatch!.angle, hatch!.spacing]).toEqual([90, 2]);
        expect(read.warnings).toEqual([
            "1 TEXT entity could not be drawn: it sits in a mirrored or unevenly scaled block insert.",
            "1 HATCH entity could not be drawn: it sits in a mirrored or unevenly scaled block insert.",
        ]);
    });

    it("should read an associative hatch whose boundary names its source objects by handles holding letters", () => {
        // Arrange
        const associative = ["0", "HATCH", "8", "0", "2", "SOLID", "70", "1", "71", "1", "91", "1", "92", "3", "72", "0", "73", "1", "93", "3", "10", "0", "20", "0", "10", "4", "20", "0", "10", "4", "20", "4", "97", "2", "330", "2F", "330", "A0B1", "75", "0", "76", "1", "98", "0"];

        // Act
        const read = io.dxf.dxfRead({ dxf: entitiesDxf(["0", "LINE", "8", "0", "10", "0", "20", "0", "11", "1", "21", "1"], associative) });

        // Assert
        expect(read.warnings).toEqual([]);
        expect(hatchesOf(read).map(hatch => hatch.pattern)).toEqual(["solid"]);
        expect(read.parts[0]!.paths).toHaveLength(1);
    });

    it("should say a hatch whose spline edge has a degree above 25 could not be drawn, and still convert the rest of the file", () => {
        // Arrange
        const degree = 26;
        const knots = Array.from({ length: 2 * (degree + 1) }, (_, at) => ["40", at <= degree ? "0" : "1"]).flat();
        const points = Array.from({ length: degree + 1 }, (_, at) => ["10", String(at), "20", String(at % 2)]).flat();
        const spline = ["72", "4", "94", String(degree), "73", "0", "74", "0", "95", String(2 * (degree + 1)), "96", String(degree + 1), ...knots, ...points];
        const closing = ["72", "1", "10", String(degree), "20", "0", "11", "0", "21", "0"];
        const hatch = ["0", "HATCH", "8", "0", "2", "SOLID", "70", "1", "91", "1", "92", "1", "93", "2", ...spline, ...closing, "97", "0", "75", "0", "76", "1"];
        const dxf = entitiesDxf(["0", "LINE", "8", "0", "10", "0", "20", "0", "11", "1", "21", "1"], hatch);

        // Act
        const read = io.dxf.dxfRead({ dxf });
        const converted = (): Inputs.IO.DxfToSvgResultDto => io.drawing.dxfToSvg({ dxf });

        // Assert
        expect(hatchesOf(read)).toEqual([]);
        expect(read.warnings).toEqual(["1 HATCH entity could not be drawn: its boundary holds a spline of a degree above 25, the highest a kernel curve takes."]);
        expect(converted).not.toThrow();
    });

    it("should place a text by its vertical alignment: middle, top and bottom moved onto the baseline the font draws from, along the text's own up", () => {
        // Arrange
        const dxf = entitiesDxf(
            textDxf("10", "0", "20", "0", "40", "10", "1", "MID", "72", "4", "11", "0", "21", "0"),
            textDxf("10", "-99", "20", "-99", "40", "10", "1", "TOP", "72", "1", "73", "3", "11", "0", "21", "0"),
            textDxf("10", "-99", "20", "-99", "40", "21", "1", "LOW", "72", "2", "73", "1", "11", "0", "21", "0"),
            textDxf("10", "-99", "20", "-99", "40", "10", "1", "SIDE", "50", "90", "72", "0", "73", "2", "11", "5", "21", "5"),
            textDxf("10", "3", "20", "4", "40", "10", "1", "BASE", "72", "0", "73", "0"),
        );

        // Act
        const texts = textsOf(io.dxf.dxfRead({ dxf }));

        // Assert
        expect(texts.map(text => [text.text, text.position.map(value => Math.round(value * 1e9) / 1e9 + 0), text.anchor])).toEqual([
            ["MID", [0, -5, 0], "middle"],
            ["TOP", [0, -10, 0], "middle"],
            ["LOW", [0, 7, 0], "end"],
            ["SIDE", [10, 5, 0], "start"],
            ["BASE", [3, 4, 0], "start"],
        ]);
    });

    it("should keep an aligned text's width factor and fit its height to the span with it", () => {
        // Arrange
        const aligned = (...extra: string[]): string[] => textDxf("10", "0", "20", "0", "40", "5", "1", "ALIGNED", ...extra, "72", "3", "11", "40", "21", "0");

        // Act
        const [plain, narrow] = textsOf(io.dxf.dxfRead({ dxf: entitiesDxf(aligned(), aligned("41", "0.5")) }));

        // Assert
        expect(narrow!.widthFactor).toBe(0.5);
        expect(narrow!.height).toBeCloseTo(plain!.height! * 2, 9);
        expect(io.drawing.textSize(narrow!).width).toBeCloseTo(40, 9);
    });

    it("should say when an arc of a hatch boundary could not be drawn", () => {
        // Arrange
        const edges = [
            "72", "1", "10", "0", "20", "0", "11", "10", "21", "0",
            "72", "2", "10", "10", "20", "10", "40", "0", "50", "0", "51", "90", "73", "1",
            "72", "1", "10", "10", "20", "10", "11", "0", "21", "0",
        ];

        // Act
        const read = io.dxf.dxfRead({ dxf: entitiesDxf(["0", "HATCH", "8", "0", "2", "SOLID", "70", "1", "91", "1", "92", "1", "93", "3", ...edges, "97", "0"]) });

        // Assert
        expect(hatchesOf(read)[0]!.boundaries[0]!.segments).toHaveLength(2);
        expect(read.warnings).toEqual(["1 arc could not be drawn: a radius, a plane or a sweep is missing."]);
    });

    it("should read a hatch named after what every JavaScript object carries as single lines, as any name it does not know", () => {
        // Arrange
        const loop = ["91", "1", "92", "3", "72", "0", "73", "1", "93", "3", "10", "0", "20", "0", "10", "4", "20", "0", "10", "4", "20", "4", "97", "0"];

        // Act
        const read = io.dxf.dxfRead({ dxf: entitiesDxf(["0", "HATCH", "8", "0", "2", "constructor", "70", "0", ...loop], ["0", "HATCH", "8", "0", "2", "toString", "70", "0", ...loop]) });

        // Assert
        expect(hatchesOf(read).map(hatch => [hatch.pattern, hatch.angle, hatch.spacing])).toEqual([["ansi31", 45, 3.175], ["ansi31", 45, 3.175]]);
        expect(read.warnings).toEqual(["2 hatches have a pattern other than single, paired or crossed lines; they are read as single lines."]);
    });

    it("should say why a text or a hatch could not be drawn, and leave an empty text out without a word", () => {
        // Arrange
        const dxf = entitiesDxf(
            textDxf("10", "0", "20", "0", "1", "NO HEIGHT"),
            textDxf("10", "0", "20", "0", "40", "2", "1", "TILTED", "210", "0", "220", "1", "230", "0"),
            textDxf("10", "0", "20", "0", "40", "2", "1", "A".repeat(2001)),
            textDxf("10", "0", "20", "0", "40", "2", "1", "  "),
            ["0", "HATCH", "8", "0", "2", "SOLID", "70", "1"],
            ["0", "HATCH", "8", "0", "2", "SOLID", "70", "1", "91", "1", "92", "3", "72", "0", "73", "1", "93", "4", "10", "0", "20", "0"],
            ["0", "HATCH", "8", "0", "2", "SOLID", "70", "1", "91", "1", "92", "1", "93", "1", "72", "9", "97", "0"],
        );

        // Act
        const read = io.dxf.dxfRead({ dxf });

        // Assert
        expect(read.parts).toEqual([]);
        expect(read.warnings).toEqual([
            "1 TEXT entity could not be drawn: it has no height.",
            "1 TEXT entity could not be drawn: it is drawn out of the drawing's plane.",
            "1 TEXT entity could not be drawn: its text is longer than 2000 characters.",
            "1 HATCH entity could not be drawn: it has no boundary.",
            "2 HATCH entities could not be drawn: its boundary is cut short or is not one this reads.",
        ]);
    });

    it("should read a pattern known only by name against acad.pat when the file measures in imperial units, by its $MEASUREMENT or else its unit, and against acadiso.pat otherwise", () => {
        // Arrange
        const loop = ["91", "1", "92", "3", "72", "0", "73", "1", "93", "3", "10", "0", "20", "0", "10", "4", "20", "0", "10", "4", "20", "4", "97", "0"];
        const named = (name: string): string[] => ["0", "HATCH", "8", "0", "2", name, "70", "0", ...loop, "52", "0", "41", "2"];
        const spacingsIn = (...header: string[]): number[] =>
            hatchesOf(io.dxf.dxfRead({ dxf: dxfOf([["HEADER", ...header], ["ENTITIES", ...named("ANSI31"), ...named("ANSI32"), ...named("ANSI37")]]) })).map(hatch => hatch.spacing!);
        const measurement = (value: string): string[] => ["9", "$MEASUREMENT", "70", value];
        const unit = (code: string): string[] => ["9", "$INSUNITS", "70", code];
        const imperial = [0.25, 0.75, 0.25];
        const metric = [6.35, 19.05, 6.35];

        // Act
        const read = {
            imperial: spacingsIn(...measurement("0")),
            imperialOverMillimetres: spacingsIn(...unit("4"), ...measurement("0")),
            metricOverInches: spacingsIn(...unit("1"), ...measurement("1")),
            inches: spacingsIn(...unit("1")),
            feet: spacingsIn(...unit("2")),
            millimetres: spacingsIn(...unit("4")),
            unitless: spacingsIn(...unit("0")),
            unstated: spacingsIn(),
        };

        // Assert
        expect(read).toEqual({ imperial, imperialOverMillimetres: imperial, metricOverInches: metric, inches: imperial, feet: imperial, millimetres: metric, unitless: metric, unstated: metric });
    });

    it("should read back the patterns of an inch drawing it wrote from their names and scales alone, as a program that rebuilds a pattern from its name does", () => {
        // Arrange
        const boundaries = [{ segments: [square] }];
        const hatches: Inputs.IO.DrawingHatchDto[] = [
            { boundaries, angle: 30, spacing: 0.1 },
            { boundaries, pattern: Inputs.IO.hatchPatternEnum.ansi32, angle: 45, spacing: 0.3 },
            { boundaries, pattern: Inputs.IO.hatchPatternEnum.ansi37, angle: 120, spacing: 0.2 },
        ];
        const written = io.dxf.dxfCreate({ dxfPathsParts: [{ layer: "cut", paths: [], hatches }], unit: Inputs.Base.unitOfLengthEnum.inch });
        const pairs = written.split("\n");
        const kept: string[] = [];
        let hatch = false;
        let definition = false;
        for (let at = 0; at + 1 < pairs.length; at += 2) {
            const [code, value] = [pairs[at]!, pairs[at + 1]!];
            hatch = code === "0" ? value === "HATCH" : hatch;
            definition = hatch && (code === "78" || (definition && code !== "98"));
            kept.push(...(definition ? [] : [code, value]));
        }

        // Act
        const back = hatchesOf(io.dxf.dxfRead({ dxf: kept.join("\n") }));

        // Assert
        expect(kept.length).toBeLessThan(pairs.length - 1);
        expect(back.map(read => [read.pattern, Math.round(read.angle! * 1e9) / 1e9, Math.round(read.spacing! * 1e9) / 1e9])).toEqual([["ansi31", 30, 0.1], ["ansi32", 45, 0.3], ["ansi37", 120, 0.2]]);
    });

    it("should read a text's signs and a pattern it knows only by name, and say when a pattern of another kind became single lines", () => {
        // Arrange
        const loop = ["91", "1", "92", "3", "72", "0", "73", "1", "93", "3", "10", "0", "20", "0", "10", "4", "20", "0", "10", "4", "20", "4", "97", "0"];
        const line = (angle: string): string[] => ["53", angle, "43", "0", "44", "0", "45", "0", "46", "1", "79", "0"];
        const dxf = entitiesDxf(
            textDxf("10", "0", "20", "0", "40", "2", "1", "%%p0.1 %%u50%%% ^ x^J %%065"),
            ["0", "HATCH", "8", "0", "2", "ANSI32", "70", "0", ...loop, "52", "15", "41", "2"],
            ["0", "HATCH", "8", "0", "2", "BRICK", "70", "0", ...loop, "78", "3", ...line("0"), ...line("0"), ...line("60")],
        );

        // Act
        const read = io.dxf.dxfRead({ dxf });
        const [named, bricks] = hatchesOf(read);

        // Assert
        expect(textsOf(read)[0]!.text).toBe("\u00B10.1 50% ^x A");
        expect([named!.pattern, named!.angle, named!.spacing]).toEqual(["ansi32", 60, 19.05]);
        expect([bricks!.pattern, bricks!.angle, bricks!.spacing]).toEqual(["ansi31", 0, 1]);
        expect(read.warnings).toEqual(["1 hatch has a pattern other than single, paired or crossed lines; it is read as single lines."]);
    });
});
