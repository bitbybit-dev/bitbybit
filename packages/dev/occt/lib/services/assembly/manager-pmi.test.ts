import { describe, it, expect, beforeAll } from "vitest";
import type { BitbybitOcctModule, Handle_TDocStd_Document, TopoDS_Face, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { InputError } from "@bitbybit-dev/base";
import { OccHelper } from "../../occ-helper";
import { readKernelException } from "../../kernel-exception";
import { OCCTAssemblyManager } from "./manager";
import { OCCTAssemblyQuery } from "./query";
import * as Inputs from "../../api/inputs";
import type * as Models from "../../api/models";
import { PMI_BLOCK_FACE_CENTRES, PMI_BLOCK_TOP_FRONT_EDGE_MIDDLE, pmiBlock, pmiOfBlock } from "../../__test__/pmi-block";
import type { PmiBlock, PmiBlockFace } from "../../__test__/pmi-block-types";

type Point3 = Inputs.Base.Point3;

const MISSING: unknown = undefined;
const DIMENSION = Inputs.OCCT.pmiDimensionTypeEnum;
const TOLERANCE = Inputs.OCCT.pmiToleranceTypeEnum;
const KIND = Inputs.OCCT.pmiShapeKindEnum;
const PLACES = 5;
const FLATNESS: string = TOLERANCE.flatness;
const CURVE_LENGTH: string = DIMENSION.curveLength;

const roundedKey = (point: Point3): string => point.map(value => (Math.round(value * 10 ** PLACES) / 10 ** PLACES + 0).toFixed(PLACES)).join(",");
const segmentsOf = (lines: readonly (readonly Point3[])[]): string[] => lines
    .flatMap(line => line.slice(1).map((point, at) => [roundedKey(line[at]!), roundedKey(point)].sort().join(" ")))
    .sort();
const cornersOf = (fills: readonly (readonly Point3[])[]): string[][] => fills.map(fill => fill.map(roundedKey).sort()).sort();
const MATERIAL = Inputs.OCCT.pmiMaterialConditionEnum;
const TOLERANCES_AS_WRITTEN = [
    [TOLERANCE.flatness, 0.05, false, MATERIAL.none], [TOLERANCE.perpendicularity, 0.02, true, MATERIAL.none], [TOLERANCE.position, 0.1, true, MATERIAL.maximum],
    [TOLERANCE.parallelism, 0.03, false, MATERIAL.none], [TOLERANCE.profileOfSurface, 0.2, false, MATERIAL.none], [TOLERANCE.circularity, 0.01, false, MATERIAL.none],
    [TOLERANCE.cylindricity, 0.01, false, MATERIAL.none],
];
const near = (a: readonly number[], b: readonly number[]): boolean => a.every((value, at) => Math.abs(value - b[at]!) < 1e-6);
const ONE_DATUM_PER_LETTER = "a letter names one datum in a document, since its STEP file holds one datum per letter for all its parts";

describe("OCCT assembly manager adding product manufacturing information and writing it to STEP", () => {
    let occt: BitbybitOcctModule;
    let occHelper: OccHelper;
    let manager: OCCTAssemblyManager;
    let query: OCCTAssemblyQuery;

    const withBlock = (use: (block: PmiBlock) => void): void => {
        const block = pmiBlock(occt, occHelper);
        try {
            use(block);
        } finally {
            block.shape.delete();
            block.document.delete();
        }
    };

    const shapeAt = (document: Handle_TDocStd_Document, label: string): TopoDS_Shape => query.getShapeFromLabel({ document, label });

    const sameShape = (document: Handle_TDocStd_Document, label: string, expected: TopoDS_Shape): boolean => {
        const shape = shapeAt(document, label);
        try {
            return shape.IsSame(expected);
        } finally {
            shape.delete();
        }
    };

    const faceOf = (block: PmiBlock, name: PmiBlockFace): TopoDS_Face => occHelper.shapeGettersService.getFace({ shape: block.shape, index: block.faces[name] });

    const centreAt = (document: Handle_TDocStd_Document, label: string): Point3 => {
        const shape = shapeAt(document, label);
        try {
            return occHelper.facesService.getFaceCenterOfMass({ shape });
        } finally {
            shape.delete();
        }
    };

    const faceNamed = (document: Handle_TDocStd_Document, label: string): PmiBlockFace | undefined => {
        const centre = centreAt(document, label);
        return (Object.keys(PMI_BLOCK_FACE_CENTRES) as PmiBlockFace[]).find(name => near(centre, PMI_BLOCK_FACE_CENTRES[name]));
    };

    const lettersOf = (pmi: Models.OCCT.DocumentPmi, labels: readonly string[]): string[] => labels.map(label => pmi.datums.find(datum => datum.label === label)!.name);

    const stepOf = (block: PmiBlock): Uint8Array => {
        manager.addDocumentPmi({ document: block.document, ...pmiOfBlock(block) });
        return manager.exportDocumentToStep({ document: block.document });
    };

    const refusalOf = (act: () => unknown): InputError => {
        try {
            act();
        } catch (error) {
            if (error instanceof InputError) {
                return error;
            }
            throw error;
        }
        throw new Error("nothing was refused");
    };

    beforeAll(async () => {
        occt = await createBitbybitOcct();
        occHelper = new OccHelper(occt);
        manager = new OCCTAssemblyManager(occt, occHelper);
        query = new OCCTAssemblyQuery(occt, occHelper);
    });

    describe("createPmiShape, createPmiDimension, createPmiDatum and createPmiTolerance", () => {
        it("should describe each item with the defaults filled in and the values given kept, writing nothing", () => {
            // Act
            const shape = manager.createPmiShape({ part: "0:1:1:1" });
            const dimension = manager.createPmiDimension({ value: 12, shapeRefs: [shape], otherShapeRefs: [{ part: "0:1:1:1", index: 3 }] });
            const datum = manager.createPmiDatum({ shapeRefs: [shape] });
            const tolerance = manager.createPmiTolerance({ value: 0.1, shapeRefs: [shape], type: TOLERANCE.position, datumLetters: ["A"] });

            // Assert
            expect(shape).toEqual({ part: "0:1:1:1", kind: KIND.face, index: 0 });
            expect(dimension).toMatchObject({ type: DIMENSION.linearDistance, value: 12, offset: 10, textHeight: 3.5, decimalPlaces: 2, otherShapeRefs: [{ part: "0:1:1:1", index: 3 }] });
            expect(datum).toMatchObject({ letter: "A", shapeRefs: [shape] });
            expect(tolerance).toMatchObject({ type: TOLERANCE.position, value: 0.1, datumLetters: ["A"], diameterZone: false, material: Inputs.OCCT.pmiMaterialConditionEnum.none });
        });
    });

    describe("addDocumentPmi", () => {
        it("should answer the document it was given, changed in place, which getDocumentPmi lists the items of in the order given, under a label each", () => {
            withBlock(block => {
                // Act
                const answered = manager.addDocumentPmi({ document: block.document, ...pmiOfBlock(block) });

                // Assert
                const pmi = query.getDocumentPmi({ document: block.document });
                expect(answered).toBe(block.document);
                expect(pmi.dimensions.map(dimension => dimension.value)).toEqual([15, 10, 18, 6, 90, 60, 5]);
                expect(pmi.datums.map(datum => datum.name)).toEqual(["A", "B", "C"]);
                expect(new Set([...pmi.dimensions, ...pmi.datums, ...pmi.tolerances].map(item => item.label)).size).toBe(pmi.dimensions.length + pmi.datums.length + pmi.tolerances.length);
            });
        });

        it("should write each dimension's type, value and tolerance, and each tolerance's type, value, zone and material condition", () => {
            withBlock(block => {
                // Act
                manager.addDocumentPmi({ document: block.document, ...pmiOfBlock(block) });

                // Assert
                const pmi = query.getDocumentPmi({ document: block.document });
                expect(pmi.dimensions.map(dimension => [dimension.type, dimension.value, dimension.upperTolerance, dimension.lowerTolerance])).toEqual([
                    [DIMENSION.linearDistance, 15, 0.1, 0.1], [DIMENSION.diameter, 10, 0.05, 0], [DIMENSION.diameter, 18, undefined, undefined],
                    [DIMENSION.linearDistance, 6, undefined, undefined], [DIMENSION.angle, 90, undefined, undefined], [DIMENSION.curveLength, 60, undefined, undefined],
                    [DIMENSION.radius, 5, undefined, undefined],
                ]);
                expect(pmi.tolerances.map(tolerance => [tolerance.type, tolerance.value, tolerance.diameterZone, tolerance.material])).toEqual(TOLERANCES_AS_WRITTEN);
            });
        });

        it("should refer each item to the very face getFace gives at its index, and a curve length to the edge getEdge gives", () => {
            withBlock(block => {
                // Arrange
                const top = faceOf(block, "top");
                const bottom = faceOf(block, "bottom");
                const bore = faceOf(block, "bore");
                const edge = occHelper.shapeGettersService.getEdge({ shape: block.shape, index: block.topFrontEdge });

                // Act
                manager.addDocumentPmi({ document: block.document, ...pmiOfBlock(block) });

                // Assert
                const pmi = query.getDocumentPmi({ document: block.document });
                const [thickness, diameter, , , , length] = pmi.dimensions;
                expect(sameShape(block.document, thickness!.shapes[0]!, top)).toBe(true);
                expect(sameShape(block.document, thickness!.otherShapes[0]!, bottom)).toBe(true);
                expect(sameShape(block.document, diameter!.shapes[0]!, bore)).toBe(true);
                expect(sameShape(block.document, length!.shapes[0]!, edge)).toBe(true);
                expect(pmi.tolerances.map(tolerance => faceNamed(block.document, tolerance.shapes[0]!))).toEqual(["top", "bore", "bore", "top", "right", "counterbore", "bore"]);
                [top, bottom, bore, edge].forEach(shape => shape.delete());
            });
        });

        it("should give each tolerance its datum reference frame by letter, primary first", () => {
            withBlock(block => {
                // Act
                manager.addDocumentPmi({ document: block.document, ...pmiOfBlock(block) });

                // Assert
                const pmi = query.getDocumentPmi({ document: block.document });
                expect(pmi.tolerances.map(tolerance => lettersOf(pmi, tolerance.datums))).toEqual([[], ["A"], ["A", "B", "C"], ["A"], ["B"], [], []]);
            });
        });

        it("should take a vertex by its index in getVertices, however often the walk meets it, and the whole part by the part's own label", () => {
            withBlock(block => {
                // Arrange
                const vertices = occHelper.shapeGettersService.getVertices({ shape: block.shape });
                const corner = vertices[block.cornerVertices[0]!]!;
                const dimensions = block.cornerVertices.map((index): Inputs.OCCT.PmiDimensionDto => ({
                    type: DIMENSION.linearDistance, value: 60, shapeRefs: [{ part: block.part, kind: KIND.vertex, index }], otherShapeRefs: [{ part: block.part, kind: KIND.part }],
                }));

                // Act
                manager.addDocumentPmi({ document: block.document, dimensions });

                // Assert
                const pmi = query.getDocumentPmi({ document: block.document });
                expect(block.cornerVertices.length).toBeGreaterThan(1);
                expect(pmi.dimensions.map(dimension => sameShape(block.document, dimension.shapes[0]!, corner))).toEqual(block.cornerVertices.map(() => true));
                expect(new Set(pmi.dimensions.map(dimension => dimension.shapes[0])).size).toBe(1);
                expect(pmi.dimensions.map(dimension => dimension.otherShapes)).toEqual(block.cornerVertices.map(() => [block.part]));
                vertices.forEach(vertex => vertex.delete());
            });
        });

        it("should draw a dimension's picture as io.drawing.dimensionPicture draws it, lifted into the plane its normal faces, the plane standing at the text point", () => {
            withBlock(block => {
                // Arrange
                const picture = occHelper.base.io.drawing.dimensionPicture({ start: [0, 0], end: [15, 0], direction: [1, 0], offset: -8, value: 15, upperTolerance: 0.1, lowerTolerance: 0.1 });
                const lifted = (point: Inputs.Base.Point2): Point3 => [point[1], 0, 15 - point[0]];

                // Act
                manager.addDocumentPmi({ document: block.document, ...pmiOfBlock(block) });

                // Assert
                const [thickness] = query.getDocumentAnnotations({ document: block.document }).annotations;
                expect(thickness!.name).toBe("thickness");
                expect(segmentsOf(thickness!.lines)).toEqual(segmentsOf([...picture.lines, ...picture.textStrokes].map(line => line.map(lifted))));
                expect(cornersOf(thickness!.fills)).toEqual(cornersOf(picture.fills.map(fill => fill.map(lifted))));
                expect(near(thickness!.textPoint!, lifted(picture.textPoint))).toBe(true);
                expect(near(thickness!.plane!.origin, thickness!.textPoint!) && near(thickness!.plane!.normal, [0, -1, 0]) && near(thickness!.plane!.direction, [0, 0, -1])).toBe(true);
            });
        });

        it("should write a presentation drawn by the caller as it is given, under its name", () => {
            withBlock(block => {
                // Act
                manager.addDocumentPmi({ document: block.document, ...pmiOfBlock(block) });

                // Assert
                const flatness = query.getDocumentAnnotations({ document: block.document }).annotations.find(annotation => annotation.type === FLATNESS)!;
                expect(flatness).toMatchObject({ name: "flatness frame", plane: { origin: [65, 5, 15], normal: [0, 0, 1], direction: [1, 0, 0] }, textPoint: [70, 7, 15] });
                expect(segmentsOf(flatness.lines)).toEqual(segmentsOf([[[65, 5, 15], [85, 5, 15], [85, 9, 15], [65, 9, 15], [65, 5, 15]], [[64, 7, 15], [58, 10, 15]]]));
                expect(cornersOf(flatness.fills)).toEqual(cornersOf([[[66, 6, 15], [68, 6, 15], [68, 8, 15]]]));
            });
        });

        it("should write a dimension without start, end or presentation with no picture, its name left out", () => {
            withBlock(block => {
                // Act
                manager.addDocumentPmi({ document: block.document, dimensions: [{ type: DIMENSION.diameter, value: 10, name: "bare", shapeRefs: [{ part: block.part, index: block.faces.bore }] }] });

                // Assert
                const [bare] = query.getDocumentAnnotations({ document: block.document }).annotations;
                expect(bare).toMatchObject({ type: DIMENSION.diameter, value: 10, name: "", lines: [], fills: [] });
                expect(bare!.plane).toBeUndefined();
            });
        });

        it("should add nothing when the kernel refuses an item, naming the item in an InputError", () => {
            withBlock(block => {
                // Act
                const refusal = refusalOf(() => manager.addDocumentPmi({
                    document: block.document,
                    dimensions: [{ type: DIMENSION.diameter, value: 10, shapeRefs: [{ part: block.part, index: block.faces.bore }] }],
                    datums: [{ letter: "A", shapeRefs: [{ part: block.part, index: block.faces.bottom }] }],
                }));

                // Assert
                expect(refusal.property).toBe("datums[0]");
                expect(refusal.message).toBe("`datums[0]` was refused: no tolerance refers to datum A.");
                expect(query.getDocumentPmi({ document: block.document })).toEqual({ dimensions: [], tolerances: [], datums: [] });
            });
        });

        it("should refuse a datum letter given twice, on the same shapes too, naming the second and saying why", () => {
            withBlock(block => {
                // Arrange
                const bottom: Inputs.OCCT.PmiDatumDto = { letter: "A", shapeRefs: [{ part: block.part, index: block.faces.bottom }] };

                // Act
                const refusal = refusalOf(() => manager.addDocumentPmi({
                    document: block.document,
                    datums: [bottom, { ...bottom }],
                    tolerances: [{ type: TOLERANCE.perpendicularity, value: 0.02, shapeRefs: [{ part: block.part, index: block.faces.bore }], datumLetters: ["A"] }],
                }));

                // Assert
                expect([refusal.property, refusal.message]).toEqual(["datums[1].letter", `\`datums[1].letter\` gives A again, after \`datums[0]\`; ${ONE_DATUM_PER_LETTER}.`]);
                expect(query.getDocumentPmi({ document: block.document })).toEqual({ dimensions: [], tolerances: [], datums: [] });
            });
        });

        it("should pass on the kernel's refusal of a label that is no part", () => {
            withBlock(block => {
                // Act
                const noPart = refusalOf(() => manager.addDocumentPmi({ document: block.document, dimensions: [{ type: DIMENSION.radius, value: 5, shapeRefs: [{ part: "0:1:1:99", kind: KIND.edge }] }] }));

                // Assert
                expect(noPart.property).toBe("dimensions[0].shapeRefs[0]");
                expect(noPart.message).toContain("0:1:1:99");
            });
        });

        it("should write an angle's plus and minus tolerance in degrees, as the document and its STEP file read back", () => {
            withBlock(block => {
                // Arrange
                const angle: Inputs.OCCT.PmiDimensionDto = { type: DIMENSION.angle, value: 90, upperTolerance: 1, lowerTolerance: 0.5, shapeRefs: [{ part: block.part, index: block.faces.front }], otherShapeRefs: [{ part: block.part, index: block.faces.left }] };

                // Act
                manager.addDocumentPmi({ document: block.document, dimensions: [angle] });
                const read = manager.loadStepToDoc({ stepData: manager.exportDocumentToStep({ document: block.document }) });

                // Assert
                const tolerancesOf = (document: Handle_TDocStd_Document): unknown => query.getDocumentPmi({ document }).dimensions.map(dimension => [dimension.type, dimension.value, dimension.upperTolerance, dimension.lowerTolerance]);
                expect(tolerancesOf(block.document)).toEqual([[DIMENSION.angle, 90, 1, 0.5]]);
                expect(tolerancesOf(read)).toEqual([[DIMENSION.angle, expect.closeTo(90, 9), expect.closeTo(1, 9), expect.closeTo(0.5, 9)]]);
                read.delete();
            });
        });

        it("should refuse, before the kernel runs, a face beyond the part's last, a picture with one end, a picture with no direction in its plane and items that are not what they should be", () => {
            withBlock(block => {
                // Arrange
                const face = (index: number): Inputs.OCCT.PmiShapeDto => ({ part: block.part, index });
                const vertices = occHelper.shapeGettersService.getVertices({ shape: block.shape });
                const explored = vertices.length;
                vertices.forEach(vertex => vertex.delete());
                const add = (dimension: Partial<Inputs.OCCT.PmiDimensionDto>) => (): unknown => manager.addDocumentPmi({ document: block.document, dimensions: [{ type: DIMENSION.diameter, value: 10, shapeRefs: [face(block.faces.bore)], ...dimension }] });

                // Act
                const refusals = [
                    add({ shapeRefs: [face(9)] }),
                    add({ shapeRefs: [{ part: block.part, kind: KIND.vertex, index: 1000 }] }),
                    add({ start: [30, 20, 0] }),
                    add({ start: [30, 20, 0], end: [30, 20, 5], normal: [0, 0, 1] }),
                    add({ start: [30, 20, 0], end: [35, 20, 0], normal: [0, 0, 0] }),
                    add({ type: DIMENSION.angle, value: 0, otherShapeRefs: [face(0)], start: [0, 0, 15], end: [12, 0, 15] }),
                    add({ shapeRefs: [] }),
                    add({ value: Number.NaN }),
                    add({ type: "Size_Thickness" as Inputs.OCCT.pmiDimensionTypeEnum }),
                    (): unknown => manager.addDocumentPmi({ document: block.document, tolerances: [{ type: TOLERANCE.flatness, value: 0.1, shapeRefs: [face(0)], material: "free" as Inputs.OCCT.pmiMaterialConditionEnum }] }),
                ].map(refusalOf);

                // Assert
                expect(refusals.map(refusal => [refusal.property, refusal.message])).toEqual([
                    ["dimensions[0].shapeRefs[0].index", `\`dimensions[0].shapeRefs[0].index\` is 9, but part ${block.part} has 9 faces.`],
                    ["dimensions[0].shapeRefs[0].index", `\`dimensions[0].shapeRefs[0].index\` is 1000, but part ${block.part} has ${explored} vertices.`],
                    ["dimensions[0].end", "`dimensions[0].end` must be given with `start` to draw the dimension."],
                    ["dimensions[0].end", "`dimensions[0].end` lies on `start` or straight along `normal` from it, so it gives the dimension no direction in its plane."],
                    ["dimensions[0].normal", "`dimensions[0].normal` has no length, so the dimension has no plane to be drawn in."],
                    ["dimensions[0].value", "`dimensions[0].value` is 0; an angle is drawn between 0 and 360 degrees, both left out."],
                    ["dimensions[0].shapeRefs", "`dimensions[0].shapeRefs` must be a list of one or more shapes."],
                    ["dimensions[0].value", "`dimensions[0].value` must be a finite number."],
                    ["dimensions[0].type", "`dimensions[0].type` must be one of Location_LinearDistance, Location_Angular, Size_Diameter, Size_Radius, Size_CurveLength."],
                    ["tolerances[0].material", "`tolerances[0].material` must be one of none, maximum, least."],
                ]);
                expect(query.getDocumentPmi({ document: block.document }).dimensions).toEqual([]);
            });
        });

        it("should refuse a caller's presentation, a list, an item, a shape kind or an index that is not what it should be, naming where", () => {
            withBlock(block => {
                // Arrange
                const top: Inputs.OCCT.PmiShapeDto = { part: block.part, index: block.faces.top };
                const plane: Inputs.Base.Frame = { origin: [0, 0, 20], normal: [0, 0, 1], direction: [1, 0, 0] };
                const flat = (presentation: unknown) => (): unknown => manager.addDocumentPmi({ document: block.document, dimensions: [{ type: DIMENSION.radius, value: 5, shapeRefs: [top], presentation: presentation as Inputs.OCCT.PmiPresentationDto }] });
                const notAList: unknown = "all of them";
                const notAnItem: unknown = 7;
                const notAPoint: unknown = [1, 2];

                // Act
                const refusals = [
                    flat({ plane: "flat", lines: [[[0, 0, 20], [1, 0, 20]]] }),
                    flat({ plane, lines: notAList }),
                    flat({ plane, lines: [[[0, 0, 20], notAPoint]] }),
                    flat({ plane: { ...plane, normal: undefined }, lines: [[[0, 0, 20], [1, 0, 20]]] }),
                    (): unknown => manager.addDocumentPmi({ document: block.document, dimensions: notAList as Inputs.OCCT.PmiDimensionDto[] }),
                    (): unknown => manager.addDocumentPmi({ document: block.document, datums: [notAnItem as Inputs.OCCT.PmiDatumDto] }),
                    (): unknown => manager.addDocumentPmi({ document: block.document, tolerances: [{ value: 0.1, shapeRefs: [{ part: block.part, kind: "solid" as Inputs.OCCT.pmiShapeKindEnum }] }] }),
                    (): unknown => manager.addDocumentPmi({ document: block.document, tolerances: [{ value: 0.1, shapeRefs: [{ part: block.part, index: -1 }] }] }),
                    (): unknown => manager.addDocumentPmi({ document: block.document, tolerances: [{ value: 0.1, shapeRefs: [{ part: "" }] }] }),
                    (): unknown => manager.addDocumentPmi({ document: block.document, dimensions: [{ value: 6, shapeRefs: [top], otherShapeRefs: [top], start: [40, 20, 15], end: [37, 20, 9], direction: [0, 0, 1], normal: [0, 0, 1] }] }),
                ].map(refusalOf);

                // Assert
                expect(refusals.map(refusal => [refusal.property, refusal.message])).toEqual([
                    ["dimensions[0].presentation.plane", "`dimensions[0].presentation.plane` must be an object."],
                    ["dimensions[0].presentation.lines", "`dimensions[0].presentation.lines` must be a list of polylines."],
                    ["dimensions[0].presentation.lines[0][1]", "`dimensions[0].presentation.lines[0][1]` must be three finite numbers."],
                    ["dimensions[0].presentation.plane.normal", "`dimensions[0].presentation.plane.normal` must be three finite numbers."],
                    ["dimensions", "`dimensions` must be a list."],
                    ["datums[0]", "`datums[0]` must be an object."],
                    ["tolerances[0].shapeRefs[0].kind", "`tolerances[0].shapeRefs[0].kind` must be one of part, face, edge, vertex."],
                    ["tolerances[0].shapeRefs[0].index", "`tolerances[0].shapeRefs[0].index` must be a whole number from 0; it is -1."],
                    ["tolerances[0].shapeRefs[0].part", "`tolerances[0].shapeRefs[0].part` must be the label of a part, such as 0:1:1:1."],
                    ["dimensions[0].direction", "`dimensions[0].direction` runs along `normal` or has no length, so it gives the dimension no direction in its plane."],
                ]);
            });
        });

        it("should leave a face of a label it cannot read to the kernel, which refuses it by name, and write a datum's own presentation", () => {
            withBlock(block => {
                // Arrange
                const presentation: Inputs.OCCT.PmiPresentationDto = { plane: { origin: [-10, 20, 0], normal: [0, 0, -1], direction: [1, 0, 0] }, lines: [[[-10, 18, 0], [-10, 22, 0]]] };

                // Act
                const refusal = refusalOf(() => manager.addDocumentPmi({ document: block.document, dimensions: [{ type: DIMENSION.radius, value: 5, shapeRefs: [{ part: "0:1:1:99", index: 2 }] }] }));
                manager.addDocumentPmi({
                    document: block.document,
                    dimensions: [{ type: DIMENSION.diameter, value: 10, shapeRefs: [{ part: block.part, index: block.faces.bore }] }],
                    datums: [{ letter: "A", shapeRefs: [{ part: block.part, index: block.faces.bottom }], name: "datum A", presentation }],
                    tolerances: [{ type: TOLERANCE.perpendicularity, value: 0.02, shapeRefs: [{ part: block.part, index: block.faces.bore }], datumLetters: ["A"] }],
                });

                // Assert
                expect(refusal.property).toBe("dimensions[0].shapeRefs[0]");
                expect(refusal.message).toContain("0:1:1:99");
                const datum = query.getDocumentAnnotations({ document: block.document }).annotations.find(annotation => annotation.kind === "datum")!;
                expect(datum).toMatchObject({ type: "A", name: "datum A", lines: [[[-10, 18, 0], [-10, 22, 0]]], plane: { origin: [-10, 20, 0], normal: [0, 0, -1], direction: [1, 0, 0] } });
                expect(datum.textPoint).toBeUndefined();
            });
        });

        it("should refuse to colour or rename a label under the document's PMI, which no part, instance or assembly is, though its label info reads as a part", () => {
            withBlock(block => {
                // Arrange
                const presentation: Inputs.OCCT.PmiPresentationDto = { plane: { origin: [-10, 20, 0], normal: [0, 0, -1], direction: [1, 0, 0] }, lines: [[[-10, 18, 0], [-10, 22, 0]]] };
                manager.addDocumentPmi({
                    document: block.document,
                    datums: [{ letter: "A", shapeRefs: [{ part: block.part, index: block.faces.bottom }], presentation }],
                    tolerances: [{ type: TOLERANCE.perpendicularity, value: 0.02, shapeRefs: [{ part: block.part, index: block.faces.bore }], datumLetters: ["A"] }],
                });
                const underPmi = ["0:1:4:1", ...Array.from({ length: 30 }, (_, at) => `0:1:4:1:${at + 1}`)];
                const readAsShapes = underPmi.filter(label => ["part", "assembly", "instance"].includes((query.getLabelInfo({ document: block.document, label }) as { type?: string }).type ?? ""));

                // Act
                const refusals = readAsShapes.flatMap(label => [
                    refusalOf(() => manager.setDocLabelColor({ document: block.document, label, r: 0, g: 0, b: 1, a: 1 })),
                    refusalOf(() => manager.setDocLabelNames({ document: block.document, labels: [label], names: ["Moved"] })),
                ]).map(refusal => `${refusal.property ?? ""}: ${refusal.message}`);

                // Assert
                expect(readAsShapes.length).toBeGreaterThan(0);
                expect(refusals).toStrictEqual(readAsShapes.flatMap(label => [
                    `label: \`label\` is "${label}", which names no part, instance or assembly of the document.`,
                    `labels[0]: \`labels[0]\` is "${label}", which names no part, instance or assembly of the document.`,
                ]));
            });
        });

        it("should refuse a document that is missing", () => {
            // Act
            const act = (): unknown => manager.addDocumentPmi({ document: MISSING as Handle_TDocStd_Document, dimensions: [] });

            // Assert
            expect(act).toThrow(new InputError("`document` is missing or empty, as a load or a build that failed can leave it.", "document"));
        });
    });

    describe("datum letters across a document", () => {
        const faceRef = (block: PmiBlock, name: PmiBlockFace): Inputs.OCCT.PmiShapeDto => ({ part: block.part, index: block.faces[name] });
        const datumA = (block: PmiBlock, name: PmiBlockFace): Inputs.OCCT.PmiDatumDto => ({ letter: "A", shapeRefs: [faceRef(block, name)] });
        const referring = (block: PmiBlock, type: Inputs.OCCT.pmiToleranceTypeEnum, name: PmiBlockFace, letters: string[]): Inputs.OCCT.PmiToleranceDto => ({ type, value: 0.02, shapeRefs: [faceRef(block, name)], datumLetters: letters });
        const firstCall = (block: PmiBlock): void => {
            manager.addDocumentPmi({ document: block.document, datums: [datumA(block, "bottom")], tolerances: [referring(block, TOLERANCE.perpendicularity, "bore", ["A"])] });
        };

        const withTwoParts = (use: (document: Handle_TDocStd_Document, parts: readonly string[]) => void): void => {
            const first = occHelper.solidsService.createBox({ width: 10, height: 10, length: 10, center: [0, 0, 0], originOnCenter: true });
            const second = occHelper.solidsService.createBox({ width: 20, height: 10, length: 10, center: [30, 0, 0], originOnCenter: true });
            const document = manager.buildAssemblyDocument({ structure: manager.combineStructure({ parts: [manager.createPart({ id: "first", shape: first, name: "First" }), manager.createPart({ id: "second", shape: second, name: "Second" })], nodes: [], clearDocument: false }) });
            try {
                use(document, query.getDocumentParts({ document }).filter(part => part.type === "part").map(part => part.label));
            } finally {
                [first, second, document].forEach(made => made.delete());
            }
        };

        it("should keep a datum given again on its own shapes in a later call one datum, which the tolerances of both calls and the STEP file refer to", () => {
            withBlock(block => {
                // Arrange
                firstCall(block);

                // Act
                manager.addDocumentPmi({ document: block.document, datums: [datumA(block, "bottom")], tolerances: [referring(block, TOLERANCE.parallelism, "top", ["A"])] });
                const read = manager.loadStepToDoc({ stepData: manager.exportDocumentToStep({ document: block.document }) });

                // Assert
                [block.document, read].forEach(document => {
                    const pmi = query.getDocumentPmi({ document });
                    expect(pmi.datums.map(datum => [datum.letter, faceNamed(document, datum.shapes[0]!)])).toEqual([["A", "bottom"]]);
                    expect(pmi.tolerances.map(tolerance => [faceNamed(document, tolerance.shapes[0]!), tolerance.datums])).toEqual([["bore", [pmi.datums[0]!.label]], ["top", [pmi.datums[0]!.label]]]);
                });
                read.delete();
            });
        });

        it("should keep a datum given again with one of its shapes repeated one datum, which both calls' tolerances refer to", () => {
            withBlock(block => {
                // Arrange
                firstCall(block);

                // Act
                manager.addDocumentPmi({ document: block.document, datums: [{ letter: "A", shapeRefs: [faceRef(block, "bottom"), faceRef(block, "bottom")] }], tolerances: [referring(block, TOLERANCE.parallelism, "top", ["A"])] });

                // Assert
                const pmi = query.getDocumentPmi({ document: block.document });
                expect(pmi.datums.map(datum => [datum.letter, datum.shapes.map(shape => faceNamed(block.document, shape))])).toEqual([["A", ["bottom"]]]);
                expect(pmi.tolerances.map(tolerance => tolerance.datums)).toEqual([[pmi.datums[0]!.label], [pmi.datums[0]!.label]]);
            });
        });

        it("should keep a datum the document holds with a shape repeated, as a STEP file can give it, one datum when it is given again on that shape, and take back the datums it reads as they are read", () => {
            withBlock(block => {
                // Arrange
                const bottom = { part: block.part, face: block.faces.bottom };
                const bore = { part: block.part, face: block.faces.bore };
                occt.AddDocumentPmiJson(block.document, JSON.stringify({ dimensions: [], datums: [{ letter: "A", shapes: [bottom, bottom] }], tolerances: [{ type: "Perpendicularity", value: 0.02, shapes: [bore], datums: ["A"] }] }));
                const held = query.getDocumentPmi({ document: block.document });

                // Act
                manager.addDocumentPmi({ document: block.document, datums: [datumA(block, "bottom")], tolerances: [referring(block, TOLERANCE.parallelism, "top", ["A"])] });
                const given = query.getDocumentPmi({ document: block.document });
                manager.addDocumentPmi({ document: block.document, datums: given.datums.map(datum => ({ letter: datum.letter, shapeRefs: datum.shapeRefs })), tolerances: [referring(block, TOLERANCE.perpendicularity, "bore", ["A"])] });

                // Assert
                const pmi = query.getDocumentPmi({ document: block.document });
                expect(held.datums.map(datum => datum.label)).toEqual(pmi.datums.map(datum => datum.label));
                expect(pmi.datums.map(datum => datum.letter)).toEqual(["A"]);
                expect(pmi.tolerances.map(tolerance => tolerance.datums)).toEqual([[pmi.datums[0]!.label], [pmi.datums[0]!.label], [pmi.datums[0]!.label]]);
            });
        });

        it("should refuse a letter the document already gives on other shapes, naming the letter and that datum, and add nothing", () => {
            withBlock(block => {
                // Arrange
                firstCall(block);
                const before = query.getDocumentPmi({ document: block.document });

                // Act
                const refusal = refusalOf(() => manager.addDocumentPmi({
                    document: block.document,
                    datums: [{ letter: "B", shapeRefs: [faceRef(block, "front")] }, datumA(block, "left")],
                    tolerances: [referring(block, TOLERANCE.position, "bore", ["B", "A"])],
                }));

                // Assert
                expect([refusal.property, refusal.message]).toEqual([
                    "datums[1].letter",
                    `\`datums[1].letter\` gives A, which the document already gives datum ${before.datums[0]!.label} on face ${block.faces.bottom} of part ${block.part}; ${ONE_DATUM_PER_LETTER}. Give A on those shapes to refer to that datum, or another letter.`,
                ]);
                expect(query.getDocumentPmi({ document: block.document })).toEqual(before);
            });
        });

        it("should refuse a tolerance naming a datum the document gives but the call does not, saying to give it again on its shapes", () => {
            withBlock(block => {
                // Arrange
                firstCall(block);
                const before = query.getDocumentPmi({ document: block.document });

                // Act
                const refusal = refusalOf(() => manager.addDocumentPmi({ document: block.document, tolerances: [referring(block, TOLERANCE.parallelism, "top", ["A"])] }));

                // Assert
                expect([refusal.property, refusal.message]).toEqual([
                    "tolerances[0].datumLetters[0]",
                    `\`tolerances[0].datumLetters[0]\` names datum A, which the document gives (${before.datums[0]!.label} on face ${block.faces.bottom} of part ${block.part}) but this call does not; a tolerance is linked only to a datum given in the same call, so give A in \`datums\` again on those shapes, which keeps it one datum.`,
                ]);
                expect(query.getDocumentPmi({ document: block.document })).toEqual(before);
            });
        });

        it("should refuse a tolerance naming a datum that neither the call nor the document gives, naming the letter's place in its frame", () => {
            withBlock(block => {
                // Act
                const refusal = refusalOf(() => manager.addDocumentPmi({
                    document: block.document,
                    datums: [datumA(block, "bottom")],
                    tolerances: [referring(block, TOLERANCE.position, "bore", ["A", "Z"])],
                }));

                // Assert
                expect([refusal.property, refusal.message]).toEqual(["tolerances[0].datumLetters[1]", "`tolerances[0].datumLetters[1]` names datum Z, which neither `datums` nor the document gives."]);
            });
        });

        it("should refuse one letter on two parts, in one call or in two, saying why", () => {
            withTwoParts((document, [first, second]) => {
                // Arrange
                const on = (part: string, index: number): Inputs.OCCT.PmiShapeDto[] => [{ part, kind: KIND.face, index }];
                const datum = (part: string): Inputs.OCCT.PmiDatumDto => ({ letter: "A", shapeRefs: on(part, 4) });
                const tolerance = (part: string): Inputs.OCCT.PmiToleranceDto => ({ type: TOLERANCE.perpendicularity, value: 0.05, shapeRefs: on(part, 1), datumLetters: ["A"] });

                // Act
                const together = refusalOf(() => manager.addDocumentPmi({ document, datums: [datum(first!), datum(second!)], tolerances: [tolerance(first!), tolerance(second!)] }));
                manager.addDocumentPmi({ document, datums: [datum(first!)], tolerances: [tolerance(first!)] });
                const held = query.getDocumentPmi({ document });
                const apart = refusalOf(() => manager.addDocumentPmi({ document, datums: [datum(second!)], tolerances: [tolerance(second!)] }));

                // Assert
                expect([together.property, together.message]).toEqual(["datums[1].letter", `\`datums[1].letter\` gives A again, after \`datums[0]\`; ${ONE_DATUM_PER_LETTER}.`]);
                expect([apart.property, apart.message]).toEqual([
                    "datums[0].letter",
                    `\`datums[0].letter\` gives A, which the document already gives datum ${held.datums[0]!.label} on face 4 of part ${first!}; ${ONE_DATUM_PER_LETTER}. Give A on those shapes to refer to that datum, or another letter.`,
                ]);
                expect(query.getDocumentPmi({ document })).toEqual(held);
            });
        });

        it("should have the kernel itself refuse a datum A on a second part's shapes once the document gives A on the first, since a STEP file holds one datum per letter for all its parts, and keep the document as it was", () => {
            withTwoParts((document, [first, second]) => {
                // Arrange
                const written = (part: string): string => JSON.stringify({ dimensions: [], datums: [{ letter: "A", shapes: [{ part, face: 4 }] }], tolerances: [{ type: TOLERANCE.perpendicularity, value: 0.05, shapes: [{ part, face: 1 }], datums: ["A"] }] });
                occt.AddDocumentPmiJson(document, written(first!));
                const before = query.getDocumentPmi({ document });

                // Act
                let refusal: unknown;
                try {
                    occt.AddDocumentPmiJson(document, written(second!));
                } catch (thrown) {
                    refusal = readKernelException(occt, thrown);
                }

                // Assert
                expect(refusal).toBeInstanceOf(Error);
                expect((refusal as Error).message).toContain(ONE_DATUM_PER_LETTER);
                expect(query.getDocumentPmi({ document })).toEqual(before);
            });
        });
    });

    describe("removeDocumentPmi", () => {
        const stepTextOf = (document: Handle_TDocStd_Document): string => new TextDecoder().decode(manager.exportDocumentToStep({ document }))
            .replace(/FILE_NAME\([^;]*;/, "FILE_NAME(...);")
            .replace(/STEP translator ([\d.]+) \d+/g, "STEP translator $1 n");

        it("should remove every dimension, datum and tolerance, answering the document it was given, and leave the STEP file of a document never given PMI", () => {
            withBlock(block => {
                withBlock(untouched => {
                    // Arrange
                    manager.addDocumentPmi({ document: block.document, ...pmiOfBlock(block) });
                    const added = query.getDocumentPmi({ document: block.document });

                    // Act
                    const answered = manager.removeDocumentPmi({ document: block.document });

                    // Assert
                    expect(answered).toBe(block.document);
                    expect([added.dimensions.length, added.datums.length, added.tolerances.length]).toEqual([7, 3, TOLERANCES_AS_WRITTEN.length]);
                    expect(query.getDocumentPmi({ document: block.document })).toEqual({ dimensions: [], tolerances: [], datums: [] });
                    expect(query.getDocumentAnnotations({ document: block.document }).annotations).toEqual([]);
                    expect(stepTextOf(block.document)).toBe(stepTextOf(untouched.document));
                });
            });
        });

        it("should remove nothing from a document without PMI, answering the document and leaving its STEP file as it was", () => {
            withBlock(block => {
                // Arrange
                const before = stepTextOf(block.document);

                // Act
                const answered = manager.removeDocumentPmi({ document: block.document });

                // Assert
                expect(answered).toBe(block.document);
                expect(stepTextOf(block.document)).toBe(before);
            });
        });

        it("should give, when the PMI is removed and added again, the PMI under the same labels and the STEP file of a document given it once, as a script run again on the same document does", () => {
            withBlock(block => {
                withBlock(fresh => {
                    // Arrange
                    const pmi = pmiOfBlock(block);
                    manager.addDocumentPmi({ document: block.document, ...pmi });

                    // Act
                    manager.removeDocumentPmi({ document: block.document });
                    manager.addDocumentPmi({ document: block.document, ...pmi });

                    // Assert
                    manager.addDocumentPmi({ document: fresh.document, ...pmiOfBlock(fresh) });
                    expect(query.getDocumentPmi({ document: block.document })).toEqual(query.getDocumentPmi({ document: fresh.document }));
                    expect(stepTextOf(block.document)).toBe(stepTextOf(fresh.document));
                });
            });
        });

        it("should refuse a document that is missing", () => {
            // Act
            const act = (): unknown => manager.removeDocumentPmi({ document: MISSING as Handle_TDocStd_Document });

            // Assert
            expect(act).toThrow(new InputError("`document` is missing or empty, as a load or a build that failed can leave it.", "document"));
        });
    });

    describe("reading PMI back in the form addDocumentPmi takes", () => {
        it("should give each item's shapes as the part and the index they were written with, a datum's letter, a frame's letters, the zone and the material condition", () => {
            withBlock(block => {
                // Arrange
                const written = pmiOfBlock(block);

                // Act
                manager.addDocumentPmi({ document: block.document, ...written });

                // Assert
                const pmi = query.getDocumentPmi({ document: block.document });
                expect(pmi.dimensions.map(dimension => [dimension.shapeRefs, dimension.otherShapeRefs])).toEqual(written.dimensions.map(dimension => [dimension.shapeRefs, dimension.otherShapeRefs ?? []]));
                expect(pmi.tolerances.map(tolerance => [tolerance.shapeRefs, tolerance.datumLetters])).toEqual(written.tolerances.map(tolerance => [tolerance.shapeRefs, tolerance.datumLetters ?? []]));
                expect(pmi.datums.map(datum => [datum.letter, datum.shapeRefs])).toEqual(written.datums.map(datum => [datum.letter, datum.shapeRefs]));
            });
        });

        it("should name a vertex by its first place in getVertices, every place of it written reading back the same, and the whole part as the part", () => {
            withBlock(block => {
                // Arrange
                const dimensions = block.cornerVertices.map((index): Inputs.OCCT.PmiDimensionDto => ({
                    type: DIMENSION.linearDistance, value: 60, shapeRefs: [{ part: block.part, kind: KIND.vertex, index }], otherShapeRefs: [{ part: block.part, kind: KIND.part }],
                }));

                // Act
                manager.addDocumentPmi({ document: block.document, dimensions });

                // Assert
                const read = query.getDocumentPmi({ document: block.document }).dimensions;
                expect(read.map(dimension => dimension.shapeRefs)).toEqual(block.cornerVertices.map(() => [{ part: block.part, kind: KIND.vertex, index: block.cornerVertices[0] }]));
                expect(read.map(dimension => dimension.otherShapeRefs)).toEqual(block.cornerVertices.map(() => [{ part: block.part, kind: KIND.part, index: 0 }]));
            });
        });

        it("should write what it read from a STEP file into a fresh document of the same part with only the types cast and the pictures joined, and read the same PMI back", () => {
            withBlock(block => {
                // Arrange
                const source = manager.loadStepToDoc({ stepData: stepOf(block) });
                const first = query.getDocumentPmi({ document: source });
                const firstShown = query.getDocumentAnnotations({ document: source }).annotations;
                const shown = new Map(firstShown.map(annotation => [annotation.label, annotation]));
                const part = first.dimensions[0]!.shapeRefs[0]!.part;
                const shape = query.getShapeFromLabel({ document: source, label: part });
                const fresh = manager.buildAssemblyDocument({ structure: manager.combineStructure({ parts: [manager.createPart({ id: "copy", shape, name: "Copy" })], nodes: [], clearDocument: false }) });

                // Act
                manager.addDocumentPmi({
                    document: fresh,
                    dimensions: first.dimensions.map(dimension => ({ ...dimension, type: dimension.type as Inputs.OCCT.pmiDimensionTypeEnum, presentation: shown.get(dimension.label) })),
                    datums: first.datums.map(datum => ({ ...datum, presentation: shown.get(datum.label) })),
                    tolerances: first.tolerances.map(tolerance => ({ ...tolerance, type: tolerance.type as Inputs.OCCT.pmiToleranceTypeEnum, presentation: shown.get(tolerance.label) })),
                });
                const copy = manager.loadStepToDoc({ stepData: manager.exportDocumentToStep({ document: fresh }) });

                // Assert
                const semantics = (pmi: Models.OCCT.DocumentPmi): unknown => ({
                    dimensions: pmi.dimensions.map(dimension => [dimension.type, dimension.name, dimension.value, dimension.upperTolerance, dimension.lowerTolerance, dimension.shapeRefs, dimension.otherShapeRefs]),
                    tolerances: pmi.tolerances.map(tolerance => [tolerance.type, tolerance.value, tolerance.shapeRefs, tolerance.datumLetters, tolerance.diameterZone, tolerance.material]),
                    datums: pmi.datums.map(datum => [datum.letter, datum.shapeRefs]),
                });
                const pictures = (document: Handle_TDocStd_Document): unknown => query.getDocumentAnnotations({ document }).annotations
                    .map(annotation => [annotation.kind, annotation.type, annotation.name, annotation.plane === undefined ? [] : [annotation.plane.normal, annotation.plane.direction].map(roundedKey), annotation.textPoint === undefined ? "" : roundedKey(annotation.textPoint), segmentsOf(annotation.lines), cornersOf(annotation.fills)]);
                expect(semantics(query.getDocumentPmi({ document: copy }))).toEqual(semantics(first));
                expect(pictures(copy)).toEqual(pictures(source));
                expect(firstShown.filter(annotation => annotation.lines.length > 0)).toHaveLength(8);
                [shape, fresh, copy, source].forEach(made => made.delete());
            });
        });
    });

    describe("exportDocumentToStep with PMI", () => {
        it("should write STEP AP242 whose PMI reads back with every type, value, tolerance, zone and material condition", () => {
            withBlock(block => {
                // Arrange
                const step = stepOf(block);
                const text = new TextDecoder().decode(step);

                // Act
                const read = manager.loadStepToDoc({ stepData: step });

                // Assert
                const pmi = query.getDocumentPmi({ document: read });
                expect(text).toContain("AP242_MANAGED_MODEL_BASED_3D_ENGINEERING_MIM_LF");
                expect(text).toContain("DRAUGHTING_CALLOUT");
                expect(pmi.dimensions.map(dimension => [dimension.type, dimension.upperTolerance, dimension.lowerTolerance])).toEqual([
                    [DIMENSION.linearDistance, 0.1, 0.1], [DIMENSION.diameter, 0.05, 0], [DIMENSION.diameter, undefined, undefined], [DIMENSION.linearDistance, undefined, undefined],
                    [DIMENSION.angle, undefined, undefined], [DIMENSION.curveLength, undefined, undefined], [DIMENSION.radius, undefined, undefined],
                ]);
                pmi.dimensions.forEach((dimension, at) => expect(dimension.value).toBeCloseTo([15, 10, 18, 6, 90, 60, 5][at]!, 9));
                expect(pmi.tolerances.map(tolerance => [tolerance.type, tolerance.value, tolerance.diameterZone, tolerance.material])).toEqual(TOLERANCES_AS_WRITTEN);
                read.delete();
            });
        });

        it("should write each item on the faces and the edge it names and each tolerance's datums in their order, as the file reads back", () => {
            withBlock(block => {
                // Arrange
                const step = stepOf(block);

                // Act
                const read = manager.loadStepToDoc({ stepData: step });

                // Assert
                const pmi = query.getDocumentPmi({ document: read });
                const onFaces = pmi.dimensions.filter(dimension => dimension.type !== CURVE_LENGTH);
                expect(onFaces.map(dimension => [...dimension.shapes, ...dimension.otherShapes].map(label => faceNamed(read, label)))).toEqual([
                    ["top", "bottom"], ["bore"], ["counterbore"], ["top", "floor"], ["front", "left"], ["bore"],
                ]);
                const shape = shapeAt(read, pmi.dimensions[5]!.shapes[0]!);
                const edge = occt.CastToEdge(shape);
                expect(near(occHelper.edgesService.pointOnEdgeAtParam({ shape: edge, param: 0.5 }), PMI_BLOCK_TOP_FRONT_EDGE_MIDDLE)).toBe(true);
                shape.delete();
                expect(pmi.tolerances.map(tolerance => faceNamed(read, tolerance.shapes[0]!))).toEqual(["top", "bore", "bore", "top", "right", "counterbore", "bore"]);
                expect(pmi.tolerances.map(tolerance => lettersOf(pmi, tolerance.datums))).toEqual([[], ["A"], ["A", "B", "C"], ["A"], ["B"], [], []]);
                expect(pmi.datums.map(datum => `${datum.name} ${faceNamed(read, datum.shapes[0]!)!}`)).toEqual(["A bottom", "B left", "C front"]);
                edge.delete();
                read.delete();
            });
        });

        it("should write each picture so it reads back in its plane, with its text point, lines and filled arrowheads as they were in the document", () => {
            withBlock(block => {
                // Arrange
                const step = stepOf(block);
                const written = query.getDocumentAnnotations({ document: block.document }).annotations.filter(annotation => annotation.lines.length > 0);

                // Act
                const read = manager.loadStepToDoc({ stepData: step });

                // Assert
                const back = query.getDocumentAnnotations({ document: read }).annotations.filter(annotation => annotation.lines.length > 0);
                expect(back.map(annotation => annotation.name)).toEqual(["thickness", "bore", "counterbore", "depth", "corner", "edge length", "bore radius", "flatness frame"]);
                back.forEach((annotation, at) => {
                    const before = written[at]!;
                    expect(near(annotation.plane!.normal, before.plane!.normal) && near(annotation.plane!.direction, before.plane!.direction)).toBe(true);
                    expect(near(annotation.textPoint!, before.textPoint!) && near(annotation.plane!.origin, before.textPoint!)).toBe(true);
                    expect(segmentsOf(annotation.lines)).toEqual(segmentsOf(before.lines));
                    expect(cornersOf(annotation.fills)).toEqual(cornersOf(before.fills));
                    expect(near(annotation.facing!, before.plane!.normal)).toBe(true);
                });
                read.delete();
            });
        });

        it("should write PMI holding no dimension, a flatness alone reading back on its face", () => {
            withBlock(block => {
                // Arrange
                manager.addDocumentPmi({ document: block.document, tolerances: [{ type: TOLERANCE.flatness, value: 0.05, shapeRefs: [{ part: block.part, index: block.faces.top }] }] });

                // Act
                const read = manager.loadStepToDoc({ stepData: manager.exportDocumentToStep({ document: block.document }) });

                // Assert
                const pmi = query.getDocumentPmi({ document: read });
                expect(pmi.dimensions).toEqual([]);
                expect(pmi.tolerances.map(tolerance => [tolerance.type, tolerance.value, faceNamed(read, tolerance.shapes[0]!)])).toEqual([[TOLERANCE.flatness, expect.closeTo(0.05, 12), "top"]]);
                read.delete();
            });
        });

        it("should write the PMI of two parts, each dimension reading back on its own part", () => {
            // Arrange
            const first = occHelper.solidsService.createBox({ width: 10, height: 10, length: 10, center: [0, 0, 0], originOnCenter: true });
            const second = occHelper.solidsService.createBox({ width: 20, height: 10, length: 10, center: [30, 0, 0], originOnCenter: true });
            const structure = manager.combineStructure({ parts: [manager.createPart({ id: "first", shape: first, name: "First" }), manager.createPart({ id: "second", shape: second, name: "Second" })], nodes: [], clearDocument: false });
            const document = manager.buildAssemblyDocument({ structure });
            const parts = query.getDocumentParts({ document }).filter(part => part.type === "part");
            const lengthOf = new Map([["First", 10], ["Second", 20]]);
            manager.addDocumentPmi({ document, dimensions: parts.map((part): Inputs.OCCT.PmiDimensionDto => ({ type: DIMENSION.curveLength, value: lengthOf.get(part.name)!, shapeRefs: [{ part: part.label, kind: KIND.edge, index: 0 }] })) });

            // Act
            const read = manager.loadStepToDoc({ stepData: manager.exportDocumentToStep({ document, compress: true }) });

            // Assert
            const nameOf = new Map(query.getDocumentParts({ document: read }).map(part => [part.label, part.name]));
            const dimensions = query.getDocumentPmi({ document: read }).dimensions;
            expect(dimensions.map(dimension => [nameOf.get(dimension.shapeRefs[0]!.part), dimension.value, dimension.shapeRefs[0]!.kind])).toEqual([
                ["First", expect.closeTo(10, 9), KIND.edge], ["Second", expect.closeTo(20, 9), KIND.edge],
            ]);
            [first, second, document, read].forEach(made => made.delete());
        });

        it("should write a document without PMI as it always did, with no annotation in it", () => {
            withBlock(block => {
                // Act
                const text = new TextDecoder().decode(manager.exportDocumentToStep({ document: block.document }));

                // Assert
                expect(text).not.toContain("DRAUGHTING_CALLOUT");
                expect(text).not.toContain("AP242");
            });
        });
    });
});
