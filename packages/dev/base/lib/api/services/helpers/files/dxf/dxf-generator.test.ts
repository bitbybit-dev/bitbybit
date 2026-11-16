import { describe, expect, it } from "vitest";
import * as Inputs from "../../../../inputs";
import type * as Resolved from "../../../../resolved-inputs";
import { resolveDto } from "../../../../kernel-calls";
import { DxfGenerator } from "./dxf-generator";
import { entitiesOf, headerVariable, numberOf, readDxf, recordsOf, tablesOf, valueOf, valuesOf } from "../__test__/dxf-reader";
import type { DxfFile, DxfRecord } from "../__test__/dxf-reader";
import { problemsOfR12, problemsOfR2000 } from "../__test__/dxf-structure";

type Part = Inputs.IO.DrawingPartDto;

const write = (parts: Part[], options: Partial<Inputs.IO.DxfModelDto> = {}): string =>
    new DxfGenerator().generateDxf(resolveDto(Inputs.IO.DxfModelDto, { dxfPathsParts: parts, ...options }) as Resolved.IO.DxfModelDto);

const part = (segments: Inputs.IO.DrawingPathDto["segments"], extra: Partial<Part> = {}): Part => ({ layer: "cut", color: "#ff0000", paths: [{ segments }], ...extra });

const square: Inputs.IO.DrawingPolylineSegmentDto = { points: [[0, 0], [40, 0], [40, 30], [0, 30]], closed: true };

const tableRecords = (file: DxfFile, name: string): readonly DxfRecord[] => tablesOf(file).find(table => table.name === name)!.records;

const allSegments: Inputs.IO.DrawingPathDto["segments"] = [
    { start: [0, 0], end: [10, 5, 2] },
    { center: [5, 5], radius: 3, startAngle: 30, endAngle: 300 },
    { center: [5, 5, 1], radius: 2, normal: [1, 1, 1] },
    { points: [[0, 0], [10, 0], [10, 10]], bulges: [0.5, 0, 0] },
    { points: [[0, 0, 0], [10, 0, 2], [10, 10, 4]] },
    { controlPoints: [[0, 0], [5, 10], [10, 0], [15, 10]], degree: 3, weights: [1, 2, 1, 1] },
    { center: [0, 0], majorAxis: [8, 0], ratio: 0.5, startParameter: 1, endParameter: 5 },
];

const everyKind = [part(allSegments), part([square], { layer: "marks", color: "#0000ff", lineType: Inputs.IO.lineTypeEnum.dashed })];

describe("DXF files AutoCAD 2000 reads", () => {
    it("should write every section, table, record, handle and owner AutoCAD 2000 requires, and nothing it does not", () => {
        // Act
        const text = write(everyKind, { acadVersion: "AC1015", colorFormat: "truecolor", unit: Inputs.Base.unitOfLengthEnum.millimetre });

        // Assert
        expect(problemsOfR2000(text)).toEqual([]);
    });

    it("should write each kind of segment as the AutoCAD 2000 entity that holds it exactly", () => {
        // Act
        const kinds = entitiesOf(readDxf(write(everyKind))).map(entity => entity.kind);

        // Assert
        expect(kinds).toEqual(["LINE", "ARC", "CIRCLE", "LWPOLYLINE", "POLYLINE", "VERTEX", "VERTEX", "VERTEX", "SEQEND", "SPLINE", "ELLIPSE", "LWPOLYLINE"]);
    });

    it("should write AutoCAD 2000 when no version is asked for", () => {
        // Act
        const file = readDxf(write([]));

        // Assert
        expect(headerVariable(file, "$ACADVER")[0]?.value).toBe("AC1015");
    });

    it("should write an empty drawing as a valid AutoCAD 2000 file with no entities", () => {
        // Act
        const text = write([]);

        // Assert
        expect([problemsOfR2000(text), entitiesOf(readDxf(text))]).toEqual([[], []]);
    });
});

describe("DXF files R12 reads", () => {
    it("should write only the sections, codes and entities R12 defines", () => {
        // Act
        const text = write([part(allSegments)], { acadVersion: "AC1009" });

        // Assert
        expect(problemsOfR12(text)).toEqual([]);
    });

    it("should write an empty drawing as a valid R12 file", () => {
        // Act
        const text = write([], { acadVersion: "AC1009" });

        // Assert
        expect(problemsOfR12(text)).toEqual([]);
    });

    it("should write splines and ellipses as polylines, and every polyline as vertices closed by SEQEND", () => {
        // Act
        const kinds = entitiesOf(readDxf(write([part(allSegments)], { acadVersion: "AC1009" }))).map(entity => entity.kind).filter(kind => kind !== "VERTEX");

        // Assert
        expect(kinds).toEqual(["LINE", "ARC", "CIRCLE", "POLYLINE", "SEQEND", "POLYLINE", "SEQEND", "POLYLINE", "SEQEND", "POLYLINE", "SEQEND"]);
    });
});

describe("DXF extents and units", () => {
    it("should bound a spline's extents with the whole curve, however coarse the tolerance", () => {
        // Arrange
        const controlPoints: Inputs.Base.Point3[] = [[0, 0, 0], [3, 10, 0], [5, 8, 0], [10, 0, 0]];
        const highest = Math.max(...Array.from({ length: 10_001 }, (_, step) => step / 10_000).map(t => 30 * t * (1 - t) ** 2 + 24 * t * t * (1 - t)));

        // Act
        const extremeY = Number(headerVariable(readDxf(write([part([{ controlPoints, degree: 3 }])], { curveTolerance: 0.5 })), "$EXTMAX")[1]?.value);

        // Assert
        expect([extremeY >= highest, extremeY <= highest + 0.5]).toEqual([true, true]);
    });

    it("should state the drawing's extents, Z included", () => {
        // Act
        const file = readDxf(write([part([{ start: [-5, 2, 1], end: [20, 7, -3] }])]));

        // Assert
        expect([headerVariable(file, "$EXTMIN").map(pair => Number(pair.value)), headerVariable(file, "$EXTMAX").map(pair => Number(pair.value))]).toEqual([[-5, 2, -3], [20, 7, 1]]);
    });

    it("should state the unit and its measurement system in AutoCAD 2000", () => {
        // Act
        const file = readDxf(write([], { unit: Inputs.Base.unitOfLengthEnum.inch }));

        // Assert
        expect([headerVariable(file, "$INSUNITS")[0]?.value, headerVariable(file, "$MEASUREMENT")[0]?.value]).toEqual(["1", "0"]);
    });

    it("should refuse a unit for R12, which has no place for one", () => {
        // Act
        const writing = (): string => write([], { acadVersion: "AC1009", unit: Inputs.Base.unitOfLengthEnum.millimetre });

        // Assert
        expect(writing).toThrow("an AC1009 (R12) file has no place for a drawing's unit");
    });

    it("should bound an arc whose start angle is many turns round, the same angle again its end, as the whole circle it is", () => {
        // Act
        const file = readDxf(write([part([{ center: [0, 0], radius: 5, startAngle: 1e20, endAngle: 1e20 }])]));

        // Assert
        expect([entitiesOf(file)[0]!.kind, headerVariable(file, "$EXTMIN").map(pair => Number(pair.value)), headerVariable(file, "$EXTMAX").map(pair => Number(pair.value))])
            .toEqual(["CIRCLE", [-5, -5, 0], [5, 5, 0]]);
    });
});

describe("DXF layers and line types", () => {
    it("should give each layer the first color and line type it was used with, and keep layer 0", () => {
        // Arrange
        const parts = [
            part([square], { layer: "cut", color: "#00ff00" }),
            part([square], { layer: "cut", color: "#ff0000", lineType: Inputs.IO.lineTypeEnum.hidden }),
            part([square], { layer: "0", color: "#0000ff", lineType: Inputs.IO.lineTypeEnum.center }),
        ];

        // Act
        const layers = tableRecords(readDxf(write(parts)), "LAYER");

        // Assert
        expect(layers.map(layer => [valueOf(layer, 2), valueOf(layer, 62), valueOf(layer, 6)])).toEqual([["0", "5", "CENTER"], ["cut", "3", "CONTINUOUS"]]);
    });

    it("should write each entity with its own part's color and line type", () => {
        // Arrange
        const parts = [
            part([square], { layer: "cut", color: "#00ff00" }),
            part([square], { layer: "cut", color: "#ff0000", lineType: Inputs.IO.lineTypeEnum.hidden }),
        ];

        // Act
        const entities = entitiesOf(readDxf(write(parts)));

        // Assert
        expect(entities.map(entity => [valueOf(entity, 8), valueOf(entity, 62), valueOf(entity, 6)])).toEqual([["cut", "3", undefined], ["cut", "1", "HIDDEN"]]);
    });

    it("should write CONTINUOUS on a continuous part whose layer an earlier part made hidden, and no line type on the vertices of a polyline", () => {
        // Arrange
        const parts = [
            part([{ start: [0, 0], end: [1, 0] }], { layer: "cut", color: "#ff0000", lineType: Inputs.IO.lineTypeEnum.hidden }),
            part([square], { layer: "cut", color: "#00ff00" }),
        ];

        // Act
        const entities = entitiesOf(readDxf(write(parts, { acadVersion: "AC1009" })));

        // Assert
        expect(entities.map(entity => [entity.kind, valueOf(entity, 6)])).toEqual([
            ["LINE", "HIDDEN"], ["POLYLINE", "CONTINUOUS"], ["VERTEX", undefined], ["VERTEX", undefined], ["VERTEX", undefined], ["VERTEX", undefined], ["SEQEND", undefined],
        ]);
    });

    it("should write one layer for names that differ only in case, as DXF names do not, spelled as first used", () => {
        // Arrange
        const parts = [part([square], { layer: "Cut" }), part([square], { layer: "cut", color: "#0000ff" })];

        // Act
        const layers = tableRecords(readDxf(write(parts)), "LAYER");

        // Assert
        expect(layers.map(layer => [valueOf(layer, 2), valueOf(layer, 62)])).toEqual([["0", "7"], ["Cut", "1"]]);
    });

    it("should define each dashed line type once, after the three every file holds", () => {
        // Act
        const lineTypes = tableRecords(readDxf(write([part([square], { lineType: Inputs.IO.lineTypeEnum.dashed }), part([square], { lineType: Inputs.IO.lineTypeEnum.dotted })])), "LTYPE");

        // Assert
        expect(lineTypes.map(record => valueOf(record, 2))).toEqual(["ByBlock", "ByLayer", "CONTINUOUS", "DASHED", "DOT"]);
    });

    it("should scale dashes to a two-hundredth of the drawing's larger side in plan, as SVG does, however deep it is", () => {
        // Arrange
        const deep = part([{ start: [0, 0], end: [400, 0] }, { start: [0, 0, 0], end: [0, 0, 1000] }], { lineType: Inputs.IO.lineTypeEnum.dashed });

        // Act
        const dashed = tableRecords(readDxf(write([deep])), "LTYPE").find(record => valueOf(record, 2) === "DASHED")!;

        // Assert
        expect([valuesOf(dashed, 49).map(Number), numberOf(dashed, 40)]).toEqual([[8, -4], 12]);
    });
});

describe("DXF colors and names", () => {
    it("should write the exact color beside the index color in AutoCAD 2000 on request", () => {
        // Act
        const entity = entitiesOf(readDxf(write([part([square], { color: "#F80" })], { colorFormat: "truecolor" })))[0]!;

        // Assert
        expect([valueOf(entity, 62), valueOf(entity, 420)]).toEqual(["30", String(0xff8800)]);
    });

    it("should write only the index color in R12, which has no exact one", () => {
        // Act
        const entity = entitiesOf(readDxf(write([part([square], { color: "#F80" })], { colorFormat: "truecolor", acadVersion: "AC1009" })))[0]!;

        // Assert
        expect([valueOf(entity, 62), valueOf(entity, 420)]).toEqual(["30", undefined]);
    });

    it("should write a layer name outside ASCII as escapes", () => {
        // Act
        const entity = entitiesOf(readDxf(write([part([square], { layer: "Pjūvis Ø" })])))[0]!;

        // Assert
        expect(valueOf(entity, 8)).toBe("Pj\\U+016Bvis \\U+00D8");
    });

    it("should keep every pair a code and a value, so a reader never loses its place", () => {
        // Act
        const file = readDxf(write([part(allSegments)]));

        // Assert
        expect([recordsOf(file.pairs).at(-1)?.kind, file.pairs.every(pair => !pair.value.includes("\n"))]).toEqual(["EOF", true]);
    });
});

describe("DXF files of any size", () => {
    it("should write one polyline of half a million vertices without overflowing the stack", () => {
        // Arrange
        const points: Inputs.Base.Point2[] = Array.from({ length: 500_000 }, (_, at) => [at, Math.sin(at)]);

        // Act
        const huge = readDxf(write([part([{ points }])]));

        // Assert
        expect(numberOf(entitiesOf(huge)[0]!, 90)).toBe(500_000);
    }, 60_000);

    it("should write half a million R12 vertices across many polylines without overflowing the stack", () => {
        // Arrange
        const many = Array.from({ length: 5000 }, (_, at): Inputs.IO.DrawingPolylineSegmentDto => ({ points: Array.from({ length: 100 }, (__, index): Inputs.Base.Point2 => [at * 100 + index, 0]) }));

        // Act
        const r12 = readDxf(write([part(many)], { acadVersion: "AC1009" }));

        // Assert
        expect(entitiesOf(r12).filter(entity => entity.kind === "VERTEX")).toHaveLength(500_000);
    }, 60_000);

    it("should write the same file every time for the same drawing", () => {
        // Act
        const first = write([part(allSegments)]);
        const second = write([part(allSegments)]);

        // Assert
        expect(second).toBe(first);
    });
});

describe("DXF inputs no CAD program could read", () => {
    const fourNumbers: number[] = [0, 0, 0, 0];
    const notASegment: object = { wobble: 1 };
    const aNumber: unknown = 5;
    const aWord: unknown = "one";
    const pathOfNothing: unknown = { layer: "a", color: "#000000", paths: [null] };
    const refusals: [string, Partial<Inputs.IO.DxfModelDto>, string][] = [
        ["a color that is not hex", { dxfPathsParts: [part([square], { color: "red" })] }, "dxfPathsParts[0].color"],
        ["a short hex color without its hash", { dxfPathsParts: [part([square], { color: "f80" })] }, "dxfPathsParts[0].color"],
        ["a layer with a slash", { dxfPathsParts: [part([square], { layer: "a/b" })] }, "dxfPathsParts[0].layer"],
        ["a layer with a line break", { dxfPathsParts: [part([square], { layer: "a\nb" })] }, "dxfPathsParts[0].layer"],
        ["a line type it does not know", { dxfPathsParts: [part([square], { lineType: "zigzag" as Inputs.IO.lineTypeEnum })] }, "dxfPathsParts[0].lineType"],
        ["a point that is not a number", { dxfPathsParts: [part([{ start: [0, Number.NaN], end: [1, 1] }])] }, "dxfPathsParts[0].paths[0].segments[0].start"],
        ["a point of four numbers", { dxfPathsParts: [part([{ start: fourNumbers as Inputs.Base.Point3, end: [1, 1] }])] }, "dxfPathsParts[0].paths[0].segments[0].start"],
        ["a radius of 0", { dxfPathsParts: [part([{ center: [0, 0], radius: 0 }])] }, "dxfPathsParts[0].paths[0].segments[0].radius"],
        ["an arc with no end angle", { dxfPathsParts: [part([{ center: [0, 0], radius: 1, startAngle: 90 }])] }, "dxfPathsParts[0].paths[0].segments[0].endAngle"],
        ["an arc with no start angle", { dxfPathsParts: [part([{ center: [0, 0], radius: 1, endAngle: 90 }])] }, "dxfPathsParts[0].paths[0].segments[0].startAngle"],
        ["a zero normal", { dxfPathsParts: [part([{ center: [0, 0], radius: 1, normal: [0, 0, 0] }])] }, "dxfPathsParts[0].paths[0].segments[0].normal"],
        ["a polyline of one point", { dxfPathsParts: [part([{ points: [[0, 0]] }])] }, "dxfPathsParts[0].paths[0].segments[0].points"],
        ["too few bulges", { dxfPathsParts: [part([{ points: [[0, 0], [1, 1], [2, 0]], bulges: [1] }])] }, "dxfPathsParts[0].paths[0].segments[0].bulges"],
        ["a bulge on a 3D polyline", { dxfPathsParts: [part([{ points: [[0, 0, 0], [1, 1, 1]], bulges: [0.5, 0] }])] }, "dxfPathsParts[0].paths[0].segments[0].bulges"],
        ["no more control points than the degree", { dxfPathsParts: [part([{ controlPoints: [[0, 0], [1, 1], [2, 0]], degree: 3 }])] }, "dxfPathsParts[0].paths[0].segments[0].controlPoints"],
        ["a degree that is not whole", { dxfPathsParts: [part([{ controlPoints: [[0, 0], [1, 1], [2, 0]], degree: 1.5 }])] }, "dxfPathsParts[0].paths[0].segments[0].degree"],
        ["a weight of 0", { dxfPathsParts: [part([{ controlPoints: [[0, 0], [1, 1], [2, 0]], degree: 2, weights: [1, 0, 1] }])] }, "dxfPathsParts[0].paths[0].segments[0].weights"],
        ["too few knots", { dxfPathsParts: [part([{ controlPoints: [[0, 0], [1, 1], [2, 0]], degree: 2, knots: [0, 0, 0, 1, 1] }])] }, "dxfPathsParts[0].paths[0].segments[0].knots"],
        ["decreasing knots", { dxfPathsParts: [part([{ controlPoints: [[0, 0], [1, 1], [2, 0]], degree: 2, knots: [0, 0, 1, 0, 1, 1] }])] }, "dxfPathsParts[0].paths[0].segments[0].knots"],
        ["knots of no length", { dxfPathsParts: [part([{ controlPoints: [[0, 0], [1, 1], [2, 0]], degree: 2, knots: [0, 0, 0, 0, 1, 1] }])] }, "dxfPathsParts[0].paths[0].segments[0].knots"],
        ["an inner knot repeated past the degree", { dxfPathsParts: [part([{ controlPoints: [[0, 0], [1, 1], [2, 0], [3, 1], [4, 0], [5, 1]], degree: 2, knots: [0, 0, 0, 1, 1, 1, 2, 2, 2] }])] }, "dxfPathsParts[0].paths[0].segments[0].knots"],
        ["a zero major axis", { dxfPathsParts: [part([{ center: [0, 0], majorAxis: [0, 0], ratio: 0.5 }])] }, "dxfPathsParts[0].paths[0].segments[0].majorAxis"],
        ["a ratio above 1", { dxfPathsParts: [part([{ center: [0, 0], majorAxis: [1, 0], ratio: 1.5 }])] }, "dxfPathsParts[0].paths[0].segments[0].ratio"],
        ["a major axis out of the ellipse's plane", { dxfPathsParts: [part([{ center: [0, 0], majorAxis: [1, 0, 1], ratio: 0.5 }])] }, "dxfPathsParts[0].paths[0].segments[0].majorAxis"],
        ["an object that is no segment", { dxfPathsParts: [part([notASegment as Inputs.IO.DrawingLineSegmentDto])] }, "dxfPathsParts[0].paths[0].segments[0]"],
        ["a number for a segment", { dxfPathsParts: [part([aNumber as Inputs.IO.DrawingLineSegmentDto])] }, "dxfPathsParts[0].paths[0].segments[0]"],
        ["a word for a radius", { dxfPathsParts: [part([{ center: [0, 0], radius: aWord as number }])] }, "dxfPathsParts[0].paths[0].segments[0].radius"],
        ["a word for bulges", { dxfPathsParts: [part([{ points: [[0, 0], [1, 1]], bulges: aWord as number[] }])] }, "dxfPathsParts[0].paths[0].segments[0].bulges"],
        ["a path of nothing", { dxfPathsParts: [pathOfNothing as Part] }, "dxfPathsParts[0].paths[0].segments"],
        ["a word for the parts", { dxfPathsParts: aWord as Part[] }, "dxfPathsParts"],
        ["a part with no paths", { dxfPathsParts: [{ layer: "a", color: "#000000" } as Part] }, "dxfPathsParts[0].paths"],
        ["a curve tolerance of 0", { curveTolerance: 0 }, "curveTolerance"],
        ["a version it does not write", { acadVersion: "AC1018" as "AC1015" }, "acadVersion"],
        ["a color format it does not know", { colorFormat: "rgb" as "aci" }, "colorFormat"],
        ["a unit it does not know", { unit: "km" as Inputs.Base.unitOfLengthEnum }, "unit"],
    ];

    it.each(refusals)("should refuse %s, naming the input at fault", (_name, options, property) => {
        // Act
        const writing = (): string => write(options.dxfPathsParts ?? [], options);

        // Assert
        expect(writing).toThrow(expect.objectContaining({ property }));
    });
});
