import { describe, expect, it } from "vitest";
import type * as Inputs from "../../../../inputs";
import { InputError } from "../../../../kernel-calls";
import { Dxf } from "../../../io/dxf";
import { Svg } from "../../../io/svg";
import { clampedForm } from "../../curves/nurbs-forms";
import type { NurbsCurveForm } from "../../curves/nurbs-forms";
import { blockDxf, dxfOf, elapsedMs, entitiesDxf, lineDxf } from "../__test__/dxf-builders";
import { entitiesOf, readDxf } from "../__test__/dxf-reader";
import { DXF_MAX_NAME_LENGTH } from "../dxf/dxf.constants";
import { DxfText, encodedText } from "../dxf/dxf-text";
import { WorkBudget } from "../work-budget";

type Part = Inputs.IO.DrawingPartDto;
type Segment = Inputs.IO.DrawingPathDto["segments"][number];

const TIME_LIMIT_MS = 5000;
const CJK_FIRST = 0x4e00;

const svg = new Svg();
const dxf = new Dxf();

const partOf = (segments: readonly Segment[], extra: Partial<Part> = {}): Part => ({ layer: "cut", color: "#ff0000", paths: segments.map(segment => ({ segments: [segment] })), ...extra });

const refusalOf = (act: () => unknown): InputError | undefined => {
    try {
        act();
    } catch (error) {
        if (error instanceof InputError) {
            return error;
        }
        throw error;
    }
    return undefined;
};

const pathsOf = (text: string): string[] => [...text.matchAll(/<path d="([^"]*)"\/>/g)].map(match => match[1]!);

const verticesPerPolyline = (text: string): number[] => {
    const counts: number[] = [];
    for (const entity of entitiesOf(readDxf(text))) {
        if (entity.kind === "POLYLINE") {
            counts.push(0);
        } else if (entity.kind === "VERTEX") {
            counts[counts.length - 1]!++;
        }
    }
    return counts;
};

const edgeOnCircle = (x: number): Segment => ({ center: [x, 0, 0], radius: 1e7, normal: [1, 0, 0] });

const wideEllipse = (x: number): Segment => ({ center: [x, 0], majorAxis: [1e7, 0], ratio: 0.5 });

const ellipseDxf = (x: number): string[] => ["0", "ELLIPSE", "8", "0", "10", String(x), "20", "0", "30", "0", "11", "1e7", "21", "0", "31", "0", "40", "0.5", "41", "0", "42", String(2 * Math.PI)];

const zigzagSplineDxf = (count: number): string[] => [
    "0", "SPLINE", "8", "0", "70", "8", "71", "3", "72", String(count + 4), "73", String(count),
    ...Array.from({ length: count + 4 }, (_, at) => ["40", String(Math.min(Math.max(at - 3, 0), count - 3))]).flat(),
    ...Array.from({ length: count }, (_, at) => ["10", String(at), "20", String(at % 2 === 0 ? -1 : 1), "30", "0"]).flat(),
];

describe("writing a large drawing: an edge-on circle, arc or ellipse is drawn in SVG as the segment its shadow is", () => {
    it("should write 16 edge-on circles of radius 1e7 as three line moves each, however fine the tolerance", () => {
        // Act
        const text = svg.svgCreate({ parts: [partOf(Array.from({ length: 16 }, (_, at) => edgeOnCircle(at)))], tolerance: 1e-9 });

        // Assert
        expect(pathsOf(text)).toEqual(Array.from({ length: 16 }, (_, at) => `M${at} -10000000 L${at} 10000000 L${at} -10000000 Z`));
    });

    it("should write an edge-on arc and an edge-on ellipse through the turning points of their shadows", () => {
        // Act
        const data = svg.pathData({
            path: { segments: [{ center: [0, 0, 0], radius: 2, startAngle: 0, endAngle: 270, normal: [1, 0, 0] }, { center: [5, 0, 0], majorAxis: [0, 4, 0], ratio: 0.5, normal: [1, 0, 0] }] },
            flipY: false,
            tolerance: 1e-12,
        });

        // Assert
        expect(data).toBe("M0 2 L0 -2 L0 0 M5 4 L5 -4 L5 4 Z");
    });

    it("should follow the shadow along X when a circle stands edge-on in a plane holding X", () => {
        // Act
        const data = svg.pathData({ path: { segments: [{ center: [1, 7, 0], radius: 3, normal: [0, 1, 0] }] }, flipY: false, tolerance: 1e-12 });

        // Assert
        expect(data).toBe("M-2 7 L4 7 L-2 7 Z");
    });

    it("should read 64 edge-on circles from a 3 KB DXF file and write them to SVG in under 100 characters each", () => {
        // Arrange
        const circles = Array.from({ length: 64 }, (_, at) => ["0", "CIRCLE", "8", "0", "10", String(at), "20", "0", "30", "0", "40", "1e7", "210", "1", "220", "0", "230", "0"]);
        const drawing = dxf.dxfRead({ dxf: entitiesDxf(...circles) });

        // Act
        const text = svg.svgCreate({ parts: drawing.parts, tolerance: 1e-9 });

        // Assert
        expect(pathsOf(text)).toHaveLength(64);
        expect(text.length).toBeLessThan(64 * 100 + 1000);
    });
});

describe("writing a large drawing: AC1009 samples curves no finer than a millionth of the drawing", () => {
    it("should write 16 ellipses of radius 1e7 at a curve tolerance of 1e-9 with at most 1,600 vertices each", () => {
        // Act
        const text = dxf.dxfCreate({ dxfPathsParts: [partOf(Array.from({ length: 16 }, (_, at) => wideEllipse(at)))], acadVersion: "AC1009", curveTolerance: 1e-9 });

        // Assert
        const counts = verticesPerPolyline(text);
        expect(counts).toHaveLength(16);
        expect(Math.max(...counts)).toBeLessThanOrEqual(1600);
    });

    it("should read 16 ellipses of radius 1e7 from a 1 KB DXF file and write them as AC1009 polylines of at most 1,600 vertices", () => {
        // Arrange
        const drawing = dxf.dxfRead({ dxf: entitiesDxf(...Array.from({ length: 16 }, (_, at) => ellipseDxf(at))) });

        // Act
        const text = dxf.dxfCreate({ dxfPathsParts: drawing.parts, acadVersion: "AC1009", curveTolerance: 1e-9 });

        // Assert
        const counts = verticesPerPolyline(text);
        expect(counts).toHaveLength(16);
        expect(Math.max(...counts)).toBeLessThanOrEqual(1600);
    });

    it("should write a cubic spline of 80 zigzag control points at a curve tolerance of 1e-300 as an AC1009 polyline under 1.5 MB, direct or read from a file", () => {
        // Arrange
        const points = Array.from({ length: 80 }, (_, at): Inputs.Base.Point2 => [at, at % 2 === 0 ? -1 : 1]);
        const read = dxf.dxfRead({ dxf: entitiesDxf(zigzagSplineDxf(80)) });

        // Act
        const direct = dxf.dxfCreate({ dxfPathsParts: [partOf([{ controlPoints: points, degree: 3 }])], acadVersion: "AC1009", curveTolerance: 1e-300 });
        const fromFile = dxf.dxfCreate({ dxfPathsParts: read.parts, acadVersion: "AC1009", curveTolerance: 1e-300 });

        // Assert
        expect(verticesPerPolyline(direct)).toHaveLength(1);
        expect([direct.length, fromFile.length].every(length => length < 1_500_000)).toBe(true);
    });

    it("should refuse, naming the parts, an AC1009 drawing whose sampled curves pass its work budget, direct or read from a file", () => {
        // Arrange
        const layer = "L".repeat(DXF_MAX_NAME_LENGTH);
        const ellipses = Array.from({ length: 5 }, (): Segment => ({ center: [0, 0], majorAxis: [1000, 0], ratio: 0.5 }));
        const text = entitiesDxf(...Array.from({ length: 5 }, () => ["0", "ELLIPSE", "8", layer, "10", "0", "20", "0", "30", "0", "11", "1000", "21", "0", "31", "0", "40", "0.5", "41", "0", "42", String(2 * Math.PI)]));

        // Act
        const direct = refusalOf(() => dxf.dxfCreate({ dxfPathsParts: [partOf(ellipses, { layer })], acadVersion: "AC1009" }));
        const fromFile = refusalOf(() => dxf.dxfCreate({ dxfPathsParts: dxf.dxfRead({ dxf: text }).parts, acadVersion: "AC1009" }));

        // Assert
        for (const refusal of [direct, fromFile]) {
            expect(refusal?.property).toBe("dxfPathsParts");
            expect(refusal?.message).toContain("is too large to write as DXF");
        }
    });
});

describe("writing a large drawing: a rational spline is refused where its weighted points would overflow", () => {
    const overweight = { controlPoints: [[0, 0], [1e60, 1], [2, 0]], degree: 2, weights: [1, 1e50, 1] } satisfies Segment;
    const overflowing = { controlPoints: [[0, 0], [1e300, 1e300], [2, 0]], degree: 2, weights: [1, 1e10, 1] } satisfies Segment;

    it("should refuse a weight that scales its control point past 1e100, in SVG and in both DXF versions", () => {
        // Act
        const refusals = [
            refusalOf(() => svg.svgCreate({ parts: [partOf([overweight])] })),
            refusalOf(() => dxf.dxfCreate({ dxfPathsParts: [partOf([overweight])] })),
            refusalOf(() => dxf.dxfCreate({ dxfPathsParts: [partOf([overweight])], acadVersion: "AC1009" })),
        ];

        // Assert
        expect(refusals.map(refusal => refusal?.property)).toEqual(["parts[0].paths[0].segments[0].weights", "dxfPathsParts[0].paths[0].segments[0].weights", "dxfPathsParts[0].paths[0].segments[0].weights"]);
        expect(refusals[0]?.message).toContain("`parts[0].paths[0].segments[0].weights[1]` scales its control point to 1e+100 or more");
    });

    it("should refuse a control point of 1e300 whose weighted blends overflow to NaN, in SVG and in both DXF versions", () => {
        // Act
        const refusals = [
            refusalOf(() => svg.svgCreate({ parts: [partOf([overflowing])] })),
            refusalOf(() => dxf.dxfCreate({ dxfPathsParts: [partOf([overflowing])] })),
            refusalOf(() => dxf.dxfCreate({ dxfPathsParts: [partOf([overflowing])], acadVersion: "AC1009" })),
        ];

        // Assert
        expect(refusals.map(refusal => refusal?.property)).toEqual(["parts[0].paths[0].segments[0].controlPoints[1]", "dxfPathsParts[0].paths[0].segments[0].controlPoints[1]", "dxfPathsParts[0].paths[0].segments[0].controlPoints[1]"]);
    });

    it("should refuse a weight below 1e-100, whose blends would underflow to nothing", () => {
        // Act
        const refusal = refusalOf(() => svg.svgCreate({ parts: [partOf([{ controlPoints: [[0, 0], [1, 1], [2, 0]], degree: 2, weights: [1e-200, 1e-200, 1e-200] }])] }));

        // Assert
        expect(refusal?.property).toBe("parts[0].paths[0].segments[0].weights");
    });

    it("should refuse an overweight rational spline read from a DXF file when it is written", () => {
        // Arrange
        const spline = ["0", "SPLINE", "8", "0", "70", "12", "71", "2", "72", "6", "73", "3", "40", "0", "40", "0", "40", "0", "40", "1", "40", "1", "40", "1",
            "10", "0", "20", "0", "30", "0", "41", "1", "10", "1e60", "20", "1", "30", "0", "41", "1e50", "10", "2", "20", "0", "30", "0", "41", "1"];
        const drawing = dxf.dxfRead({ dxf: entitiesDxf(spline) });

        // Act
        const refusal = refusalOf(() => svg.svgCreate({ parts: drawing.parts }));

        // Assert
        expect(refusal?.property).toBe("parts[0].paths[0].segments[0].weights");
    });
});

describe("writing a large drawing: a spline's degree is at most 25", () => {
    const splineOfDegree = (degree: number): Segment => ({ controlPoints: Array.from({ length: 2 * degree }, (_, at) => [at, (at % 2) * 10]), degree });

    it("should refuse a spline of degree 26 in SVG and DXF, and write one of degree 25", () => {
        // Act
        const refusals = [refusalOf(() => svg.svgCreate({ parts: [partOf([splineOfDegree(26)])] })), refusalOf(() => dxf.dxfCreate({ dxfPathsParts: [partOf([splineOfDegree(26)])] }))];
        const written = svg.svgCreate({ parts: [partOf([splineOfDegree(25)])] });

        // Assert
        expect(refusals.map(refusal => refusal?.message)).toEqual([
            "`parts[0].paths[0].segments[0].degree` must be a whole number from 1 to 25; it is 26.",
            "`dxfPathsParts[0].paths[0].segments[0].degree` must be a whole number from 1 to 25; it is 26.",
        ]);
        expect(pathsOf(written)).toHaveLength(1);
    });

    it("should neither draw nor dwell on a spline of degree 800 read from a 36 KB DXF file", () => {
        // Arrange
        const degree = 800;
        const count = 2 * degree;
        const text = entitiesDxf(["0", "SPLINE", "8", "0", "70", "8", "71", String(degree),
            ...Array.from({ length: count + degree + 1 }, (_, at) => ["40", String(Math.min(Math.max(at - degree, 0), count - degree))]).flat(),
            ...Array.from({ length: count }, (_, at) => ["10", String(at), "20", String((at % 2) * 10)]).flat()]);

        // Act
        const written = ((): InputError | string => refusalOf(() => svg.svgCreate({ parts: dxf.dxfRead({ dxf: text }).parts })) ?? svg.svgCreate({ parts: dxf.dxfRead({ dxf: text }).parts }))();

        // Assert
        expect(written instanceof InputError || pathsOf(written).length === 0).toBe(true);
    });
});

describe("writing a large drawing: layer names", () => {
    it("should give 32,000 layers whose names all make the same id each its own id, in well under the time limit", () => {
        // Arrange
        const parts = Array.from({ length: 32_000 }, (_, at): Part => ({ layer: `a${String.fromCharCode(CJK_FIRST + (at % 20_000))}${String.fromCharCode(CJK_FIRST + Math.floor(at / 20_000))}`, color: "#000000", paths: [] }));
        let text = "";

        // Act
        const elapsed = elapsedMs(() => {
            text = svg.svgCreate({ parts });
        });

        // Assert
        expect(elapsed).toBeLessThan(TIME_LIMIT_MS);
        const ids = [...text.matchAll(/<g id="([^"]*)"/g)].map(match => match[1]!);
        expect(new Set(ids).size).toBe(32_000);
    });

    it("should give a layer whose id and next suffix are taken the next suffix free", () => {
        // Arrange
        const parts = ["a--2", "a\u00e9", "a\u00e8", "a\u00ea"].map((layer): Part => ({ layer, color: "#000000", paths: [] }));

        // Act
        const text = svg.svgCreate({ parts });

        // Assert
        expect([...text.matchAll(/<g id="([^"]*)"/g)].map(match => match[1]!)).toEqual(["layer-a--2", "layer-a-", "layer-a--3", "layer-a--4"]);
    });

    it("should refuse a layer name of 256 characters in SVG and DXF, and write one of 255", () => {
        // Act
        const refusals = [
            refusalOf(() => svg.svgCreate({ parts: [partOf([{ start: [0, 0], end: [1, 1] }], { layer: "L".repeat(DXF_MAX_NAME_LENGTH + 1) })] })),
            refusalOf(() => dxf.dxfCreate({ dxfPathsParts: [partOf([{ start: [0, 0], end: [1, 1] }], { layer: "L".repeat(DXF_MAX_NAME_LENGTH + 1) })] })),
        ];
        const written = dxf.dxfCreate({ dxfPathsParts: [partOf([{ start: [0, 0], end: [1, 1] }], { layer: "L".repeat(DXF_MAX_NAME_LENGTH) })] });

        // Assert
        expect(refusals.map(refusal => refusal?.message)).toEqual([
            "`parts[0].layer` is 256 characters long; a layer name holds at most 255.",
            "`dxfPathsParts[0].layer` is 256 characters long; a layer name holds at most 255.",
        ]);
        expect(written).toContain(`\n8\n${"L".repeat(DXF_MAX_NAME_LENGTH)}\n`);
    });

    it("should read 1,000 lines inheriting a 100,000-character layer from a DXF file and write them on the 255 characters read, in under 2.5 MB", () => {
        // Arrange
        const name = String.fromCharCode(CJK_FIRST).repeat(100_000);
        const insert = ["0", "INSERT", "8", name, "2", "B", "10", "0", "20", "0", "30", "0"];
        const text = dxfOf([["BLOCKS", ...blockDxf("B", ...Array.from({ length: 1000 }, (_, at) => lineDxf(at, 0, at, 1)))], ["ENTITIES", ...insert]]);
        const drawing = dxf.dxfRead({ dxf: text });

        // Act
        const written = dxf.dxfCreate({ dxfPathsParts: drawing.parts });

        // Assert
        expect(written.length).toBeLessThan(2_500_000);
        expect(written).toContain(`\n8\n${encodedText(name.slice(0, DXF_MAX_NAME_LENGTH))}\n`);
    });
});

describe("writing a large drawing: numbers written in full", () => {
    it("should write 2,000 lines of the longest numbers in full, at most 330 characters a number", () => {
        // Arrange
        const lines = Array.from({ length: 2000 }, (_, at): Segment => ({ start: [5e-324, 9.9e99, -5e-324], end: [at, -9.9e99, 1e-300] }));

        // Act
        const text = dxf.dxfCreate({ dxfPathsParts: [partOf(lines)] });

        // Assert
        expect(text.length).toBeLessThan(2000 * (6 * 330 + 300) + 10_000);
        expect(text).toContain(`\n0.${"0".repeat(323)}5\n`);
    });

    it("should count every character of a number written in full against the budget", () => {
        // Arrange
        const text = new DxfText(0x20, { budget: new WorkBudget(300), property: "dxfPathsParts" });

        // Act
        const refusal = refusalOf(() => text.real("10", 5e-324));

        // Assert
        expect(refusal?.property).toBe("dxfPathsParts");
    });

    it("should refuse, rather than throw a RangeError, a DXF text too long for one string", () => {
        // Arrange
        const text = new DxfText(0x20);
        const piece = "x".repeat(2 ** 27);
        for (let copy = 0; copy < 5; copy++) {
            text.pair("1", piece);
        }

        // Act
        const refusal = refusalOf(() => text.joined());

        // Assert
        expect(refusal?.message).toContain("is too large to write as DXF");
    });
});

describe("clamping a spline's knots", () => {
    it("should clamp a curve of a million control points whose degree of 2,000 leaves both ends open, in well under the time limit", () => {
        // Arrange
        const count = 1_000_000;
        const degree = 2000;
        const open: NurbsCurveForm = {
            degree,
            points: Array.from({ length: count }, (_, at): Inputs.Base.Point3 => [at, Math.sin(at), 0]),
            weights: Array.from({ length: count }, () => 1),
            knots: Array.from({ length: count + degree + 1 }, (_, at) => at),
        };
        let clamped: NurbsCurveForm | undefined;

        // Act
        const elapsed = elapsedMs(() => {
            clamped = clampedForm(open);
        });

        // Assert
        expect(elapsed).toBeLessThan(TIME_LIMIT_MS);
        expect(clamped?.points).toHaveLength(count);
        expect(clamped?.knots.slice(0, degree + 2)).toEqual([...Array.from({ length: degree + 1 }, () => degree), degree + 1]);
    });
});
