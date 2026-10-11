import { describe, expect, it } from "vitest";
import { modelOf } from "../api/services/service-support";
import { TIME_STAMP } from "../__test__/build-setup";
import { IFCService } from "../api/ifc-service";
import * as Inputs from "../api/inputs";
import { emptyModel } from "../model/io";
import type { ModelSnapshot } from "../model/snapshot";
import { BODY_CONTEXT, findContext } from "./contexts";
import { millimetresPerUnit, precisionFor, projectOf, radiansPerUnit, siPerUnit } from "./project";
import { errorFrom } from "../__test__/build-setup";

const LENGTH_UNIT_LINE = /#(\d+)=IFCSIUNIT\(\*,\.LENGTHUNIT\.,\$,\.METRE\.\);/;
const AREA_UNIT_LINE = /#(\d+)=IFCSIUNIT\(\*,\.AREAUNIT\.,\$,\.SQUARE_METRE\.\);/;
const VOLUME_UNIT_LINE = /#(\d+)=IFCSIUNIT\(\*,\.VOLUMEUNIT\.,\$,\.CUBIC_METRE\.\);/;
const PLANE_ANGLE_UNIT_LINE = /#(\d+)=IFCSIUNIT\(\*,\.PLANEANGLEUNIT\.,\$,\.RADIAN\.\);/;
const UNIT_LIST = /(IFCUNITASSIGNMENT\(\()([^)]*)(\)\);)/;
const PROJECT_UNITS = /(#\d+=IFCPROJECT\(.*),#\d+\);/;

function metreFile(): string {
    const ifc = new IFCService();
    return ifc.model.write({ model: ifc.model.create({ seed: "units", lengthUnit: Inputs.IFC.lengthUnitEnum.metre }), timeStamp: TIME_STAMP });
}

function withLengthUnit(text: string, entities: (id: string) => string): string {
    if (!LENGTH_UNIT_LINE.test(text)) {
        throw new Error("The file has no SI length unit in metres");
    }
    return text.replace(LENGTH_UNIT_LINE, (_line, id: string) => entities(id));
}

function conversionBasedUnit(name: string, factor: number, basePrefix: string): (id: string) => string {
    return (id) => [
        `#${id}=IFCCONVERSIONBASEDUNIT(#9001,.LENGTHUNIT.,'${name}',#9002);`,
        "#9001=IFCDIMENSIONALEXPONENTS(1,0,0,0,0,0,0);",
        `#9002=IFCMEASUREWITHUNIT(IFCLENGTHMEASURE(${factor}),#9003);`,
        `#9003=IFCSIUNIT(*,.LENGTHUNIT.,${basePrefix},.METRE.);`,
    ].join("\n");
}

function withUnitLine(text: string, line: RegExp, entities: (id: string) => string): string {
    if (!line.test(text)) {
        throw new Error(`The file has no unit matching ${String(line)}`);
    }
    return text.replace(line, (_line, id: string) => entities(id));
}

function withMoneyAt(text: string, end: "first" | "last"): string {
    if (!UNIT_LIST.test(text)) {
        throw new Error("The file has no unit assignment");
    }
    return text.replace(UNIT_LIST, (_line, open: string, list: string, close: string) => `${open}${end === "first" ? `#9020,${list}` : `${list},#9020`}${close}\n#9020=IFCMONETARYUNIT('EUR');`);
}

function readUnits(text: string): ModelSnapshot {
    return modelOf(new IFCService().model.read({ data: text }));
}

describe("precisionFor", () => {
    it.each([
        [Inputs.IFC.lengthUnitEnum.millimetre, 0.01],
        [Inputs.IFC.lengthUnitEnum.centimetre, 0.001],
        [Inputs.IFC.lengthUnitEnum.metre, 0.00001],
    ] as const)("should give a hundredth of a millimetre in %s", (unit, precision) => {
        // Act
        const value = precisionFor(unit);

        // Assert
        expect(value).toBeCloseTo(precision, 12);
    });

    it("should write that precision into the model's contexts", () => {
        // Arrange
        const ifc = new IFCService();

        // Act
        const model = ifc.model.create({ lengthUnit: Inputs.IFC.lengthUnitEnum.centimetre });

        // Assert
        const precisions = model.byType("IfcGeometricRepresentationContext", false).map((context) => model.attribute(context.id, "Precision"));
        expect(precisions.map((value) => (typeof value === "number" ? Math.round(value * 1e9) / 1e9 : value))).toEqual([0.001, 0.001]);
    });
});

describe("millimetresPerUnit", () => {
    it("should read a length unit converted from metres, such as the foot", () => {
        // Arrange
        const ifc = new IFCService();
        const text = withLengthUnit(metreFile(), conversionBasedUnit("FOOT", 0.3048, "$"));

        // Act
        const model = ifc.model.read({ data: text });

        // Assert
        expect(millimetresPerUnit(modelOf(model))).toBeCloseTo(304.8, 9);
    });

    it("should read a length unit converted from millimetres, such as the inch", () => {
        // Arrange
        const ifc = new IFCService();
        const text = withLengthUnit(metreFile(), conversionBasedUnit("INCH", 25.4, ".MILLI."));

        // Act
        const model = ifc.model.read({ data: text });

        // Assert
        expect(millimetresPerUnit(modelOf(model))).toBeCloseTo(25.4, 9);
    });

    it("should read an inch defined through the foot, which is defined through the metre", () => {
        // Arrange
        const text = withLengthUnit(metreFile(), (id) => [
            `#${id}=IFCCONVERSIONBASEDUNIT(#9001,.LENGTHUNIT.,'INCH',#9002);`,
            "#9001=IFCDIMENSIONALEXPONENTS(1,0,0,0,0,0,0);",
            `#9002=IFCMEASUREWITHUNIT(IFCLENGTHMEASURE(${1 / 12}),#9004);`,
            "#9004=IFCCONVERSIONBASEDUNIT(#9001,.LENGTHUNIT.,'FOOT',#9005);",
            "#9005=IFCMEASUREWITHUNIT(IFCLENGTHMEASURE(0.3048),#9003);",
            "#9003=IFCSIUNIT(*,.LENGTHUNIT.,$,.METRE.);",
        ].join("\n"));

        // Act
        const millimetres = millimetresPerUnit(readUnits(text));

        // Assert
        expect(millimetres).toBeCloseTo(25.4, 9);
    });

    it("should refuse a unit converted through itself", () => {
        // Arrange
        const text = withLengthUnit(metreFile(), (id) => [
            `#${id}=IFCCONVERSIONBASEDUNIT(#9001,.LENGTHUNIT.,'LOOP',#9002);`,
            "#9001=IFCDIMENSIONALEXPONENTS(1,0,0,0,0,0,0);",
            `#9002=IFCMEASUREWITHUNIT(IFCLENGTHMEASURE(2.),#${id});`,
        ].join("\n"));
        const model = readUnits(text);

        // Act
        const error = errorFrom(() => millimetresPerUnit(model));

        // Assert
        expect(error.message).toMatch(/^The unit #\d+ is converted through more than 8 other units, or through itself$/);
    });

    it.each(["first", "last"] as const)("should pass over a monetary unit listed %s, which is no named unit", (end) => {
        // Arrange
        const text = withMoneyAt(withLengthUnit(metreFile(), (id) => `#${id}=IFCSIUNIT(*,.LENGTHUNIT.,.MILLI.,.METRE.);`), end);

        // Act
        const millimetres = millimetresPerUnit(readUnits(text));

        // Assert
        expect(millimetres).toBe(1);
    });

    it("should read a unit assignment without a length unit as in metres", () => {
        // Arrange
        const ifc = new IFCService();
        const text = withLengthUnit(metreFile(), (id) => `#${id}=IFCSIUNIT(*,.TIMEUNIT.,$,.SECOND.);`);

        // Act
        const model = ifc.model.read({ data: text });

        // Assert
        expect(millimetresPerUnit(modelOf(model))).toBe(1000);
    });

    it("should read a project without any units as in metres too", () => {
        // Arrange
        const ifc = new IFCService();
        const text = metreFile().replace(PROJECT_UNITS, "$1,$);");

        // Act
        const model = ifc.model.read({ data: text });

        // Assert
        expect(model.attribute(projectOf(modelOf(model)), "UnitsInContext")).toBe(null);
        expect(millimetresPerUnit(modelOf(model))).toBe(1000);
    });
});

describe("projectOf and findContext", () => {
    it("should refuse a model without a project", () => {
        // Arrange
        const ifc = new IFCService();
        const model = emptyModel("IFC4", ifc.model.create({}).header);

        // Act & Assert
        expect(() => projectOf(model)).toThrow("The model has no IfcProject");
    });

    it("should find each sub-context by its type, identifier and view", () => {
        // Arrange
        const ifc = new IFCService();
        const model = ifc.model.create({});

        // Act
        const body = findContext(modelOf(model), BODY_CONTEXT)!;
        const footprint = findContext(modelOf(model), { contextType: "Plan", identifier: "FootPrint", view: "PLAN_VIEW" })!;

        // Assert
        expect(model.attribute(body, "ContextIdentifier")).toBe("Body");
        expect(model.attribute(footprint, "ContextIdentifier")).toBe("FootPrint");
        expect(body).not.toBe(footprint);
    });

    it("should fall back to a sub-context of the same identifier under another parent, and find nothing for an identifier the model lacks", () => {
        // Arrange
        const ifc = new IFCService();
        const model = ifc.model.create({});

        // Act
        const axis = findContext(modelOf(model), { contextType: "Model", identifier: "Axis", view: "GRAPH_VIEW" });
        const missing = findContext(modelOf(model), { contextType: "Model", identifier: "Profile", view: "MODEL_VIEW" });

        // Assert
        expect(axis !== undefined && model.attribute(axis, "ContextIdentifier")).toBe("Axis");
        expect(missing).toBeUndefined();
    });
});

describe("siPerUnit", () => {
    it("should read an area unit converted from square metres, such as the square foot", () => {
        // Arrange
        const text = withUnitLine(metreFile(), AREA_UNIT_LINE, (id) => [
            `#${id}=IFCCONVERSIONBASEDUNIT(#9011,.AREAUNIT.,'SQUARE FOOT',#9012);`,
            "#9011=IFCDIMENSIONALEXPONENTS(2,0,0,0,0,0,0);",
            "#9012=IFCMEASUREWITHUNIT(IFCAREAMEASURE(0.09290304),#9013);",
            "#9013=IFCSIUNIT(*,.AREAUNIT.,$,.SQUARE_METRE.);",
        ].join("\n"));

        // Act
        const squareMetres = siPerUnit(readUnits(text), "AREAUNIT");

        // Assert
        expect(squareMetres).toBeCloseTo(0.09290304, 15);
    });

    it("should raise a prefix to the unit's power, so a cubic decimetre is a thousandth of a cubic metre", () => {
        // Arrange
        const text = withUnitLine(metreFile(), VOLUME_UNIT_LINE, (id) => `#${id}=IFCSIUNIT(*,.VOLUMEUNIT.,.DECI.,.CUBIC_METRE.);`);

        // Act
        const cubicMetres = siPerUnit(readUnits(text), "VOLUMEUNIT");

        // Assert
        expect(cubicMetres).toBeCloseTo(0.001, 15);
    });

    it("should take a plane angle unit's prefix once, so a milliradian is a thousandth of a radian", () => {
        // Arrange
        const text = withUnitLine(metreFile(), PLANE_ANGLE_UNIT_LINE, (id) => `#${id}=IFCSIUNIT(*,.PLANEANGLEUNIT.,.MILLI.,.RADIAN.);`);

        // Act
        const radians = radiansPerUnit(readUnits(text));

        // Assert
        expect(radians).toBeCloseTo(0.001, 15);
    });

    it("should read a unit type the file does not assign as the SI unit", () => {
        // Arrange
        const text = withUnitLine(metreFile(), VOLUME_UNIT_LINE, (id) => `#${id}=IFCSIUNIT(*,.MASSUNIT.,.KILO.,.GRAM.);`);

        // Act
        const cubicMetres = siPerUnit(readUnits(text), "VOLUMEUNIT");

        // Assert
        expect(cubicMetres).toBe(1);
    });
});
