import { describe, it, expect, beforeAll } from "vitest";
import createBitbybitOcct, { BitbybitOcctModule, Handle_TDocStd_Document, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { InputError } from "@bitbybit-dev/base";
import { OccHelper } from "../../occ-helper";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTAssemblyManager } from "./manager";
import { OCCTAssemblyQuery } from "./query";
import { OCCTSolid } from "../shapes";
import { OCCTIO } from "../io";

const MISSING: unknown = undefined;

type StepIds = { productShape: string; representation: string; context: string; lengthUnit: string; faces: string[]; next: number };

describe("OCCT assembly query reading product manufacturing information", () => {
    let occt: BitbybitOcctModule;
    let occHelper: OccHelper;
    let manager: OCCTAssemblyManager;
    let query: OCCTAssemblyQuery;
    let solid: OCCTSolid;
    let io: OCCTIO;

    const stepOfBrick = (): string => io.saveShapeSTEP({
        shape: solid.createBox({ width: 10, height: 20, length: 30, center: [5, 10, 15] }),
        adjustYtoZ: false,
        tryDownload: false,
    });

    const idsOf = (step: string): StepIds => {
        const idOf = (entity: RegExp): string => {
            const found = new RegExp(`(#\\d+) = ${entity.source}`).exec(step);
            if (found === null) {
                throw new Error(`the STEP file has no ${entity.source}`);
            }
            return found[1]!;
        };
        const shell = /CLOSED_SHELL\('',\(([^)]*)\)\)/.exec(step)?.[1] ?? "";
        const numbers = [...step.matchAll(/^#(\d+) =/gm)].map(match => Number(match[1]));
        return {
            productShape: idOf(/PRODUCT_DEFINITION_SHAPE\(/),
            representation: idOf(/ADVANCED_BREP_SHAPE_REPRESENTATION\(/),
            context: idOf(/\( GEOMETRIC_REPRESENTATION_CONTEXT\(3\)/),
            lengthUnit: idOf(/\( LENGTH_UNIT\(\)/),
            faces: shell.split(",").map(face => face.trim()),
            next: Math.max(...numbers) + 1,
        };
    };

    const withEntities = (step: string, entities: (id: (n: number) => string) => string[]): string => {
        const next = idsOf(step).next;
        const lines = entities(n => `#${next + n}`);
        return step.replace("ENDSEC;\nEND-ISO-10303-21;", `${lines.join("\n")}\nENDSEC;\nEND-ISO-10303-21;`);
    };

    const measure = (ids: StepIds, value: string, role: string): string =>
        `( LENGTH_MEASURE_WITH_UNIT() MEASURE_REPRESENTATION_ITEM() MEASURE_WITH_UNIT(LENGTH_MEASURE(${value}),${ids.lengthUnit}) REPRESENTATION_ITEM('${role}') )`;

    const stepWithPmi = (): string => {
        const step = stepOfBrick();
        const ids = idsOf(step);
        const [first, second, third, fourth, fifth, sixth] = ids.faces;
        return withEntities(step, id => [
            `${id(0)} = SHAPE_ASPECT('','',${ids.productShape},.T.);`,
            `${id(1)} = GEOMETRIC_ITEM_SPECIFIC_USAGE('','',${id(0)},${ids.representation},(${first}));`,
            `${id(2)} = DIMENSIONAL_SIZE(${id(0)},'thickness');`,
            `${id(3)} = DIMENSIONAL_CHARACTERISTIC_REPRESENTATION(${id(2)},${id(4)});`,
            `${id(4)} = SHAPE_DIMENSION_REPRESENTATION('',(${id(5)}),${ids.context});`,
            `${id(5)} = ${measure(ids, "20.", "nominal value")};`,
            `${id(6)} = PLUS_MINUS_TOLERANCE(${id(7)},${id(2)});`,
            `${id(7)} = TOLERANCE_VALUE(${id(8)},${id(9)});`,
            `${id(8)} = ${measure(ids, "-0.05", "lower limit")};`,
            `${id(9)} = ${measure(ids, "0.1", "upper limit")};`,
            `${id(10)} = SHAPE_ASPECT('','',${ids.productShape},.T.);`,
            `${id(11)} = GEOMETRIC_ITEM_SPECIFIC_USAGE('','',${id(10)},${ids.representation},(${second}));`,
            `${id(12)} = FLATNESS_TOLERANCE('flat','',${id(13)},${id(10)});`,
            `${id(13)} = LENGTH_MEASURE_WITH_UNIT(LENGTH_MEASURE(0.02),${ids.lengthUnit});`,
            `${id(14)} = DATUM_FEATURE('','',${ids.productShape},.T.);`,
            `${id(15)} = GEOMETRIC_ITEM_SPECIFIC_USAGE('','',${id(14)},${ids.representation},(${third}));`,
            `${id(16)} = DATUM('','',${ids.productShape},.F.,'A');`,
            `${id(17)} = SHAPE_ASPECT_RELATIONSHIP('','',${id(14)},${id(16)});`,
            `${id(18)} = SHAPE_ASPECT('','',${ids.productShape},.T.);`,
            `${id(19)} = GEOMETRIC_ITEM_SPECIFIC_USAGE('','',${id(18)},${ids.representation},(${fourth}));`,
            `${id(20)} = PARALLELISM_TOLERANCE('par','',${id(21)},${id(18)},(${id(22)}));`,
            `${id(21)} = LENGTH_MEASURE_WITH_UNIT(LENGTH_MEASURE(0.03),${ids.lengthUnit});`,
            `${id(22)} = DATUM_SYSTEM('','',${ids.productShape},.F.,(${id(23)}));`,
            `${id(23)} = DATUM_REFERENCE_COMPARTMENT('','',${ids.productShape},.F.,${id(16)},$);`,
            `${id(24)} = SHAPE_ASPECT('','',${ids.productShape},.T.);`,
            `${id(25)} = GEOMETRIC_ITEM_SPECIFIC_USAGE('','',${id(24)},${ids.representation},(${fifth}));`,
            `${id(26)} = SHAPE_ASPECT('','',${ids.productShape},.T.);`,
            `${id(27)} = GEOMETRIC_ITEM_SPECIFIC_USAGE('','',${id(26)},${ids.representation},(${sixth}));`,
            `${id(28)} = DIMENSIONAL_LOCATION('linear distance','',${id(24)},${id(26)});`,
            `${id(29)} = DIMENSIONAL_CHARACTERISTIC_REPRESENTATION(${id(28)},${id(30)});`,
            `${id(30)} = SHAPE_DIMENSION_REPRESENTATION('',(${id(31)},${id(32)}),${ids.context});`,
            `${id(31)} = ${measure(ids, "9.9", "lower limit")};`,
            `${id(32)} = ${measure(ids, "10.1", "upper limit")};`,
        ]);
    };

    const stepWithAnEndlessRadius = (): string => {
        const step = stepOfBrick();
        const ids = idsOf(step);
        return withEntities(step, id => [
            `${id(0)} = SHAPE_ASPECT('','',${ids.productShape},.T.);`,
            `${id(1)} = GEOMETRIC_ITEM_SPECIFIC_USAGE('','',${id(0)},${ids.representation},(${ids.faces[0]}));`,
            `${id(2)} = DIMENSIONAL_SIZE(${id(0)},'radius');`,
            `${id(3)} = DIMENSIONAL_CHARACTERISTIC_REPRESENTATION(${id(2)},${id(4)});`,
            `${id(4)} = SHAPE_DIMENSION_REPRESENTATION('',(${id(5)}),${ids.context});`,
            `${id(5)} = ${measure(ids, "1.E+400", "nominal value")};`,
        ]);
    };

    const facesOfPart = (document: Handle_TDocStd_Document): TopoDS_Shape[] => {
        const part = query.getDocumentParts({ document }).find(entry => entry.type === "part")!;
        return occHelper.shapeGettersService.getFaces({ shape: query.getShapeFromLabel({ document, label: part.label }) });
    };

    const faceIndexOf = (document: Handle_TDocStd_Document, label: string): number => {
        const shape = query.getShapeFromLabel({ document, label });
        return facesOfPart(document).findIndex(face => face.IsSame(shape));
    };

    beforeAll(async () => {
        occt = await createBitbybitOcct();
        occHelper = new OccHelper(new VectorHelperService(), new ShapesHelperService(), occt);
        manager = new OCCTAssemblyManager(occt, occHelper);
        query = new OCCTAssemblyQuery(occt, occHelper);
        solid = new OCCTSolid(occt, occHelper);
        io = new OCCTIO(occt, occHelper);
    });

    describe("getDocumentPmi", () => {
        it("should read a size dimension with its tolerances off the face it measures", () => {
            // Arrange
            const document = manager.loadStepToDoc({ stepData: stepWithPmi() });

            // Act
            const pmi = query.getDocumentPmi({ document });

            // Assert
            const thickness = pmi.dimensions[0]!;
            expect(thickness).toMatchObject({ type: "Size_Thickness", name: "thickness", value: 20, upperTolerance: 0.1, lowerTolerance: 0.05, otherShapes: [] });
            expect(thickness.shapes.map(label => faceIndexOf(document, label))).toEqual([0]);
            expect("lowerBound" in thickness).toBe(false);
            document.delete();
        });

        it("should read a distance given as a range, its value the middle, from one face to another", () => {
            // Arrange
            const document = manager.loadStepToDoc({ stepData: stepWithPmi() });

            // Act
            const pmi = query.getDocumentPmi({ document });

            // Assert
            const distance = pmi.dimensions[1]!;
            expect(distance).toMatchObject({ type: "Location_LinearDistance", name: "linear distance", lowerBound: 9.9, upperBound: 10.1 });
            expect(distance.value).toBeCloseTo(10, 12);
            expect(distance.shapes.map(label => faceIndexOf(document, label))).toEqual([4]);
            expect(distance.otherShapes.map(label => faceIndexOf(document, label))).toEqual([5]);
            expect("upperTolerance" in distance).toBe(false);
            document.delete();
        });

        it("should read the tolerances off their faces, and a tolerance's datums by the labels the datums carry", () => {
            // Arrange
            const document = manager.loadStepToDoc({ stepData: stepWithPmi() });

            // Act
            const pmi = query.getDocumentPmi({ document });

            // Assert
            const [flatness, parallelism] = pmi.tolerances;
            const [datum] = pmi.datums;
            expect(flatness).toMatchObject({ type: "Flatness", name: "flat", value: 0.02, datums: [] });
            expect(parallelism).toMatchObject({ type: "Parallelism", name: "par", value: 0.03, datums: [datum!.label] });
            expect(datum!.name).toBe("A");
            expect([flatness!, parallelism!, datum!].map(entry => entry.shapes.map(label => faceIndexOf(document, label)))).toEqual([[1], [3], [2]]);
            document.delete();
        });

        it("should give every entry a label of its own", () => {
            // Arrange
            const document = manager.loadStepToDoc({ stepData: stepWithPmi() });

            // Act
            const pmi = query.getDocumentPmi({ document });

            // Assert
            const labels = [...pmi.dimensions, ...pmi.tolerances, ...pmi.datums].map(entry => entry.label);
            expect(new Set(labels).size).toBe(5);
            document.delete();
        });

        it("should read a value the document cannot hold as a finite number as NaN", () => {
            // Arrange
            const document = manager.loadStepToDoc({ stepData: stepWithAnEndlessRadius() });

            // Act
            const pmi = query.getDocumentPmi({ document });

            // Assert
            expect(pmi.dimensions.map(dimension => [dimension.type, dimension.value])).toEqual([["Size_Radius", NaN]]);
            document.delete();
        });

        it("should give three empty lists for a document without any", () => {
            // Arrange
            const document = manager.loadStepToDoc({ stepData: stepOfBrick() });

            // Act
            const pmi = query.getDocumentPmi({ document });

            // Assert
            expect(pmi).toEqual({ dimensions: [], tolerances: [], datums: [] });
            document.delete();
        });

        it("should refuse a document that is missing", () => {
            // Act
            const act = (): unknown => query.getDocumentPmi({ document: MISSING as Handle_TDocStd_Document });

            // Assert
            expect(act).toThrow(new InputError("`document` is missing or empty, as a load or a build that failed can leave it.", "document"));
        });
    });
});
