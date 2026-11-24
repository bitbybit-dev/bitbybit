import { describe, it, expect, beforeAll } from "vitest";
import type { BitbybitOcctModule, Handle_TDocStd_Document, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { InputError } from "@bitbybit-dev/base";
import { OccHelper } from "../../occ-helper";
import { OCCTAssemblyManager } from "./manager";
import { OCCTAssemblyQuery } from "./query";
import { OCCTSolid } from "../shapes";
import { OCCTIO } from "../io";
import * as Inputs from "../../api/inputs";
import type * as Models from "../../api/models";

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

    const stepWithPresentations = (): string => {
        const step = stepWithPmi();
        const ids = idsOf(step);
        const thickness = /(#\d+) = DIMENSIONAL_SIZE\(#\d+,'thickness'\);/.exec(step)![1]!;
        const flatness = /(#\d+) = FLATNESS_TOLERANCE\(/.exec(step)![1]!;
        return withEntities(step, id => [
            `${id(0)} = COORDINATES_LIST('',4,((0.,0.,35.),(10.,0.,35.),(10.,5.,35.),(12.,5.,35.)));`,
            `${id(1)} = TESSELLATED_CURVE_SET('',${id(0)},((1,2,3,4)));`,
            `${id(2)} = COORDINATES_LIST('',8,((1.,1.,35.),(5.,1.,35.),(5.,5.,35.),(1.,5.,35.),(2.,2.,35.),(4.,2.,35.),(4.,4.,35.),(2.,4.,35.)));`,
            `${id(3)} = COMPLEX_TRIANGULATED_SURFACE_SET('',${id(2)},8,(),(),(),((1,2,6),(1,6,5),(2,3,7),(2,7,6),(3,4,8),(3,8,7),(4,1,5),(4,5,8)));`,
            `${id(4)} = TESSELLATED_GEOMETRIC_SET('',(${id(1)},${id(3)}));`,
            `${id(5)} = TESSELLATED_ANNOTATION_OCCURRENCE('thickness note',(${id(6)}),${id(4)});`,
            `${id(6)} = PRESENTATION_STYLE_ASSIGNMENT((${id(7)}));`,
            `${id(7)} = CURVE_STYLE('',${id(8)},POSITIVE_LENGTH_MEASURE(0.1),${id(9)});`,
            `${id(8)} = DRAUGHTING_PRE_DEFINED_CURVE_FONT('continuous');`,
            `${id(9)} = COLOUR_RGB('',0.,0.,0.);`,
            `${id(10)} = DRAUGHTING_MODEL('',(${id(5)}),${ids.context});`,
            `${id(11)} = DRAUGHTING_MODEL_ITEM_ASSOCIATION('PMI representation to presentation link','',${thickness},${id(10)},${id(5)});`,
            `${id(12)} = DIRECTION('',(0.,0.,1.));`,
            `${id(13)} = DIRECTION('',(1.,0.,0.));`,
            `${id(14)} = CARTESIAN_POINT('',(0.,0.,35.));`,
            `${id(15)} = AXIS2_PLACEMENT_3D('',${id(14)},${id(12)},${id(13)});`,
            `${id(16)} = PLANE('',${id(15)});`,
            `${id(17)} = ANNOTATION_PLANE('',(${id(6)}),${id(16)},(${id(5)}));`,
            `${id(18)} = CARTESIAN_POINT('',(0.,30.,0.));`,
            `${id(19)} = CARTESIAN_POINT('',(10.,30.,0.));`,
            `${id(20)} = POLYLINE('',(${id(18)},${id(19)}));`,
            `${id(21)} = GEOMETRIC_CURVE_SET('',(${id(20)}));`,
            `${id(22)} = ANNOTATION_CURVE_OCCURRENCE('flatness frame',(${id(6)}),${id(21)});`,
            `${id(23)} = DRAUGHTING_MODEL('',(${id(22)}),${ids.context});`,
            `${id(24)} = DRAUGHTING_MODEL_ITEM_ASSOCIATION('PMI representation to presentation link','',${flatness},${id(23)},${id(22)});`,
            `${id(25)} = CARTESIAN_POINT('',(5.,10.,100.));`,
            `${id(26)} = DIRECTION('',(0.,0.,-1.));`,
            `${id(27)} = DIRECTION('',(1.,0.,0.));`,
            `${id(28)} = AXIS2_PLACEMENT_3D('',${id(25)},${id(26)},${id(27)});`,
            `${id(29)} = PLANAR_BOX('',80.,60.,${id(28)});`,
            `${id(30)} = VIEW_VOLUME(.PARALLEL.,${id(25)},0.,0.,.F.,0.,.F.,.F.,${id(29)});`,
            `${id(31)} = CAMERA_MODEL_D3('FRONT',${id(28)},${id(30)});`,
            `${id(32)} = DRAUGHTING_MODEL('FRONT',(${id(22)},${id(31)}),${ids.context});`,
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
        occHelper = new OccHelper(occt);
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

        it("should name every shape also as the part and the face index getFace gives, the form addDocumentPmi takes, and each datum and frame by letter", () => {
            // Arrange
            const document = manager.loadStepToDoc({ stepData: stepWithPmi() });
            const part = query.getDocumentParts({ document }).find(entry => entry.type === "part")!.label;
            const face = (index: number): Inputs.OCCT.PmiShapeDto => ({ part, kind: Inputs.OCCT.pmiShapeKindEnum.face, index });

            // Act
            const pmi = query.getDocumentPmi({ document });

            // Assert
            expect(pmi.dimensions.map(dimension => [dimension.shapeRefs, dimension.otherShapeRefs])).toEqual([[[face(0)], []], [[face(4)], [face(5)]]]);
            expect(pmi.tolerances.map(tolerance => [tolerance.shapeRefs, tolerance.datumLetters, tolerance.diameterZone, tolerance.material])).toEqual([
                [[face(1)], [], false, Inputs.OCCT.pmiMaterialConditionEnum.none],
                [[face(3)], ["A"], false, Inputs.OCCT.pmiMaterialConditionEnum.none],
            ]);
            expect(pmi.datums.map(datum => [datum.letter, datum.shapeRefs])).toEqual([["A", [face(2)]]]);
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

    describe("getDocumentAnnotations", () => {
        it("should list the annotations by the labels getDocumentPmi gives them, dimensions first, then tolerances, then datums", () => {
            // Arrange
            const document = manager.loadStepToDoc({ stepData: stepWithPmi() });
            const pmi = query.getDocumentPmi({ document });

            // Act
            const annotations = query.getDocumentAnnotations({ document }).annotations;

            // Assert
            expect(annotations.map(annotation => [annotation.label, annotation.kind])).toEqual([
                ...pmi.dimensions.map(dimension => [dimension.label, "dimension"]),
                ...pmi.tolerances.map(tolerance => [tolerance.label, "tolerance"]),
                ...pmi.datums.map(datum => [datum.label, "datum"]),
            ]);
            document.delete();
        });

        it("should read each annotation's type and value, a datum's letter as its type", () => {
            // Arrange
            const document = manager.loadStepToDoc({ stepData: stepWithPmi() });

            // Act
            const annotations = query.getDocumentAnnotations({ document }).annotations;

            // Assert
            expect(annotations.map(annotation => annotation.type)).toEqual(["Size_Thickness", "Location_LinearDistance", "Flatness", "Parallelism", "A"]);
            annotations.map(annotation => annotation.value).forEach((value, at) => expect(value).toBeCloseTo([20, 10, 0.02, 0.03, 0][at]!, 12));
            document.delete();
        });

        it("should count the shapes each annotation refers to, both sides of a distance", () => {
            // Arrange
            const document = manager.loadStepToDoc({ stepData: stepWithPmi() });

            // Act
            const annotations = query.getDocumentAnnotations({ document }).annotations;

            // Assert
            expect(annotations.map(annotation => annotation.attached)).toEqual([1, 2, 1, 1, 1]);
            document.delete();
        });

        it("should give the annotations of a file of one part to its one product, placed once where it stands", () => {
            // Arrange
            const document = manager.loadStepToDoc({ stepData: stepWithPmi() });

            // Act
            const annotations = query.getDocumentAnnotations({ document }).annotations;

            // Assert
            expect(annotations.map(annotation => [annotation.product, annotation.instance])).toEqual(annotations.map(() => [0, 0]));
            document.delete();
        });

        it("should give annotations without lines or letters for a file that carries no presentation", () => {
            // Arrange
            const document = manager.loadStepToDoc({ stepData: stepWithPmi() });

            // Act
            const annotations = query.getDocumentAnnotations({ document, deflection: 0.01 }).annotations;

            // Assert
            expect(annotations.every(annotation => annotation.lines.length === 0 && annotation.fills.length === 0 && annotation.facing === undefined)).toBe(true);
            document.delete();
        });

        it("should read a tessellated presentation's lines as one polyline and its letters as the loops their triangles rim, in its plane", () => {
            // Arrange
            const document = manager.loadStepToDoc({ stepData: stepWithPresentations() });

            // Act
            const [thickness] = query.getDocumentAnnotations({ document }).annotations;

            // Assert
            expect(thickness!.name).toBe("thickness note");
            expect(thickness!.lines).toEqual([[[0, 0, 35], [10, 0, 35], [10, 5, 35], [12, 5, 35]]]);
            expect(thickness!.fills.map(loop => loop.length)).toEqual([4, 4]);
            expect(thickness!.fills.flat().every(([, , z]) => z === 35)).toBe(true);
            expect(thickness!.facing).toEqual([0, 0, 1]);
            expect(thickness!.plane!.origin).toEqual([0, 0, 35]);
            expect(thickness!.plane!.normal).toEqual([0, 0, 1]);
            expect(thickness!.plane!.direction.map(value => value + 0)).toEqual([1, 0, 0]);
            expect(thickness!.textPoint).toEqual([0, 0, 35]);
            document.delete();
        });

        it("should give letter loops that base fills under the even-odd rule to exactly the ring the file's triangles cover", () => {
            // Arrange
            const document = manager.loadStepToDoc({ stepData: stepWithPresentations() });
            const [thickness] = query.getDocumentAnnotations({ document }).annotations;

            // Act
            const filled = occHelper.base.mesh.triangulateLoops({ loops: thickness!.fills });

            // Assert
            const area = filled.reduce((sum, [a, b, c]) => sum + ((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])) / 2, 0);
            expect(Math.abs(area)).toBeCloseTo(16 - 4, 12);
            document.delete();
        });

        it("should read a curve presentation as a polyline with the point its text is attached at", () => {
            // Arrange
            const document = manager.loadStepToDoc({ stepData: stepWithPresentations() });

            // Act
            const flatness = query.getDocumentAnnotations({ document }).annotations.find(annotation => annotation.type === "Flatness");

            // Assert
            expect(flatness).toMatchObject({ name: "flatness frame", lines: [[[0, 30, 0], [10, 30, 0]]], fills: [], textPoint: [5, 30, 0] });
            expect(flatness!.facing).toBeUndefined();
            document.delete();
        });

        it("should read a saved view with where it looks from and the labels of the annotations it shows", () => {
            // Arrange
            const document = manager.loadStepToDoc({ stepData: stepWithPresentations() });
            const flatness = query.getDocumentPmi({ document }).tolerances[0]!;

            // Act
            const views = query.getDocumentAnnotations({ document }).views;

            // Assert
            expect(views).toHaveLength(1);
            expect(views[0]).toMatchObject({ name: "FRONT", isParallel: true, eye: [5, 10, 100], direction: [0, 0, -1], up: [0, -1, 0], width: 80, height: 60, annotations: [flatness.label] });
            expect(views[0]!.label).not.toBe("");
            document.delete();
        });

        it("should give no annotations, no views and nothing left out for a document without any", () => {
            // Arrange
            const document = manager.loadStepToDoc({ stepData: stepOfBrick() });

            // Act
            const read = query.getDocumentAnnotations({ document });

            // Assert
            expect(read).toEqual({ annotations: [], views: [], leftOut: { annotations: 0, views: 0 } });
            document.delete();
        });

        it("should turn the annotations and the saved view Y-up with adjustZtoY, swapping Y and Z without conventions and turning a quarter in a right-handed system", () => {
            // Arrange
            const document = manager.loadStepToDoc({ stepData: stepWithPresentations() });
            const read = (system: Inputs.Base.coordinateSystemEnum | undefined, upAxis = Inputs.Base.upAxisConversionEnum.zUpToYUp): Models.OCCT.DocumentAnnotations => {
                occHelper.base.settings = system === undefined ? {} : { coordinateSystem: system };
                try {
                    return query.getDocumentAnnotations({ document, upAxis });
                } finally {
                    occHelper.base.settings = {};
                }
            };
            const clean = (values: number[]): number[] => values.map(value => value + 0);

            // Act
            const swapped = read(undefined);
            const turned = read(Inputs.Base.coordinateSystemEnum.rightHanded);
            const toZUp = read(Inputs.Base.coordinateSystemEnum.rightHanded, Inputs.Base.upAxisConversionEnum.yUpToZUp);
            const asWritten = query.getDocumentAnnotations({ document });

            // Assert
            expect(swapped.annotations[0]!.lines).toEqual([[[0, 35, 0], [10, 35, 0], [10, 35, 5], [12, 35, 5]]]);
            expect(clean(swapped.annotations[0]!.facing!)).toEqual([0, 1, 0]);
            expect(swapped.views[0]).toMatchObject({ eye: [5, 100, 10], direction: [0, -1, 0], up: [0, 0, -1], annotations: asWritten.views[0]!.annotations });
            expect(turned.annotations[0]!.lines[0]!.map(clean)).toEqual([[0, 35, 0], [10, 35, 0], [10, 35, -5], [12, 35, -5]]);
            expect(clean(turned.views[0]!.eye)).toEqual([5, 100, -10]);
            expect(clean(turned.views[0]!.up)).toEqual([0, 0, 1]);
            expect(toZUp.annotations[0]!.lines[0]!.map(clean)).toEqual([[0, -35, 0], [10, -35, 0], [10, -35, 5], [12, -35, 5]]);
            expect(asWritten.annotations[0]!.lines).toEqual([[[0, 0, 35], [10, 0, 35], [10, 5, 35], [12, 5, 35]]]);
            document.delete();
        });

        it("should refuse a document that is missing", () => {
            // Act
            const act = (): unknown => query.getDocumentAnnotations({ document: MISSING as Handle_TDocStd_Document });

            // Assert
            expect(act).toThrow(new InputError("`document` is missing or empty, as a load or a build that failed can leave it.", "document"));
        });
    });
});
