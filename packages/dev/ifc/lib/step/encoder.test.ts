import { describe, expect, it } from "vitest";
import { errorThrownBy } from "../__test__/thrown";
import { schemaNamed } from "../schema/registry";
import { IfcEncoder } from "./encoder";
import { IfcValueError } from "./errors";
import type { IfcEntity, IfcValue } from "./step-types";
import { DERIVED, enumValue, ref, typed } from "./values";

const encoderOfIfc4 = (): IfcEncoder => new IfcEncoder(schemaNamed("IFC4"));
const encoded = (id: number, type: string, args: readonly IfcValue[]): string => encoderOfIfc4().encodeEntity({ id, type, args });
const valueErrorOf = (entity: IfcEntity): IfcValueError => errorThrownBy(IfcValueError, () => encoderOfIfc4().encodeEntity(entity));
const valueErrorOfValue = (spec: string, value: IfcValue): IfcValueError => errorThrownBy(IfcValueError, () => encoderOfIfc4().encodeValue(spec, value, "here"));

const SI_PREFIXES = "EXA, PETA, TERA, GIGA, MEGA, KILO, HECTO, DECA, DECI, CENTI, MILLI, MICRO, NANO, PICO, FEMTO, ATTO";
const nominalValueOf = (value: IfcValue): IfcEntity => ({ id: 3, type: "IfcPropertySingleValue", args: ["Reference", null, value, null] });

describe("IfcValueError", () => {
    it("should lead its message with the path and keep the path as a field", () => {
        // Act
        const error = new IfcValueError("#1 IfcWall.Name", "the attribute is required");

        // Assert
        expect(error).toBeInstanceOf(Error);
        expect(error.name).toBe("IfcValueError");
        expect(error.message).toBe("#1 IfcWall.Name: the attribute is required");
        expect(error.path).toBe("#1 IfcWall.Name");
    });
});

describe("IfcEncoder.encodeEntity", () => {
    it("should write a cartesian point with its reals ending in a dot", () => {
        // Act
        const text = encoded(1, "IfcCartesianPoint", [[0, 1.5, -2]]);

        // Assert
        expect(text).toBe("#1=IFCCARTESIANPOINT((0.,1.5,-2.));");
    });

    it("should write the upper case entity name whatever case the type is given in", () => {
        // Act
        const text = encoded(1, "ifccartesianpoint", [[1, 2]]);

        // Assert
        expect(text).toBe("#1=IFCCARTESIANPOINT((1.,2.));");
    });

    it("should write * for a derived attribute and dots around enumeration values", () => {
        // Act
        const text = encoded(2, "IfcSIUnit", [null, enumValue("LENGTHUNIT"), enumValue("MILLI"), enumValue("METRE")]);

        // Assert
        expect(text).toBe("#2=IFCSIUNIT(*,.LENGTHUNIT.,.MILLI.,.METRE.);");
    });

    it("should take the derived marker for a derived attribute", () => {
        // Act
        const text = encoded(2, "IfcSIUnit", [DERIVED, enumValue("LENGTHUNIT"), null, enumValue("METRE")]);

        // Assert
        expect(text).toBe("#2=IFCSIUNIT(*,.LENGTHUNIT.,$,.METRE.);");
    });

    it("should take an enumeration value given as a plain text in any case", () => {
        // Act
        const text = encoded(2, "IfcSIUnit", [null, "lengthunit", "Milli", "METRE"]);

        // Assert
        expect(text).toBe("#2=IFCSIUNIT(*,.LENGTHUNIT.,.MILLI.,.METRE.);");
    });

    it("should write a sub context with * for the four attributes it derives", () => {
        // Act
        const text = encoded(5, "IfcGeometricRepresentationSubContext", ["Body", "Model", null, null, null, null, ref(4), null, "MODEL_VIEW", null]);

        // Assert
        expect(text).toBe("#5=IFCGEOMETRICREPRESENTATIONSUBCONTEXT('Body','Model',*,*,*,*,#4,$,.MODEL_VIEW.,$);");
    });

    it("should write a typed select value with its upper case type name", () => {
        // Act
        const text = encoderOfIfc4().encodeEntity(nominalValueOf(typed("IfcLabel", "x")));

        // Assert
        expect(text).toBe("#3=IFCPROPERTYSINGLEVALUE('Reference',$,IFCLABEL('x'),$);");
    });

    it("should find a member of a nested select however its type name is spelled", () => {
        // Act
        const text = encoderOfIfc4().encodeEntity(nominalValueOf(typed("ifclengthmeasure", 2.5)));

        // Assert
        expect(text).toBe("#3=IFCPROPERTYSINGLEVALUE('Reference',$,IFCLENGTHMEASURE(2.5),$);");
    });

    it("should write typed booleans, logicals, integers and numbers inside a select", () => {
        // Arrange
        const values = [
            typed("IfcBoolean", true),
            typed("IfcLogical", enumValue("U")),
            typed("IfcPositiveInteger", 3),
            typed("IfcCountMeasure", 4),
            typed("IfcCountMeasure", 4.5),
            typed("IfcComplexNumber", [1.5, -2]),
        ];

        // Act
        const texts = values.map((value) => encoderOfIfc4().encodeValue("IfcValue", value, "#3"));

        // Assert
        expect(texts).toEqual(["IFCBOOLEAN(.T.)", "IFCLOGICAL(.U.)", "IFCPOSITIVEINTEGER(3)", "IFCCOUNTMEASURE(4)", "IFCCOUNTMEASURE(4.5)", "IFCCOMPLEXNUMBER((1.5,-2.))"]);
    });

    it("should write a list of typed select values", () => {
        // Act
        const text = encoded(9, "IfcPropertyEnumeratedValue", ["Finish", null, [typed("IfcLabel", "Matt"), typed("IfcLabel", "Gloss")], null]);

        // Assert
        expect(text).toBe("#9=IFCPROPERTYENUMERATEDVALUE('Finish',$,(IFCLABEL('Matt'),IFCLABEL('Gloss')),$);");
    });

    it("should write references for selects of entities", () => {
        // Act
        const text = encoded(6, "IfcRelAssociatesMaterial", ["0YvctVUKr0kugbFTf53O9L", null, null, null, [ref(3), ref(4)], ref(5)]);

        // Assert
        expect(text).toBe("#6=IFCRELASSOCIATESMATERIAL('0YvctVUKr0kugbFTf53O9L',$,$,$,(#3,#4),#5);");
    });

    it("should take both a reference and a typed value for a select that mixes entities and types", () => {
        // Arrange
        const valueAt = (value: IfcValue): string => encoderOfIfc4().encodeValue("IfcAppliedValueSelect", value, "#7");

        // Act
        const texts = [valueAt(ref(4)), valueAt(typed("IfcMonetaryMeasure", 12.5))];

        // Assert
        expect(texts).toEqual(["#4", "IFCMONETARYMEASURE(12.5)"]);
    });

    it("should write the segments of an indexed poly curve as typed index lists", () => {
        // Act
        const text = encoded(7, "IfcIndexedPolyCurve", [ref(6), [typed("IfcLineIndex", [1, 2, 3, 1])], false]);

        // Assert
        expect(text).toBe("#7=IFCINDEXEDPOLYCURVE(#6,(IFCLINEINDEX((1,2,3,1))),.F.);");
    });

    it("should write arc and line segments side by side", () => {
        // Act
        const text = encoded(7, "IfcIndexedPolyCurve", [ref(6), [typed("IfcArcIndex", [1, 2, 3]), typed("IfcLineIndex", [3, 4])], true]);

        // Assert
        expect(text).toBe("#7=IFCINDEXEDPOLYCURVE(#6,(IFCARCINDEX((1,2,3)),IFCLINEINDEX((3,4))),.T.);");
    });

    it("should write a LOGICAL as .T., .F. or .U.", () => {
        // Arrange
        const selfIntersect = [true, false, enumValue("U"), enumValue("u")];

        // Act
        const texts = selfIntersect.map((value) => encoded(5, "IfcCompositeCurve", [[ref(1), ref(2)], value]));

        // Assert
        expect(texts).toEqual([
            "#5=IFCCOMPOSITECURVE((#1,#2),.T.);",
            "#5=IFCCOMPOSITECURVE((#1,#2),.F.);",
            "#5=IFCCOMPOSITECURVE((#1,#2),.U.);",
            "#5=IFCCOMPOSITECURVE((#1,#2),.U.);",
        ]);
    });

    it("should write a whole NUMBER as an integer and a fraction as a real", () => {
        // Act
        const texts = [encoded(8, "IfcQuantityCount", ["Count", null, null, 3, null]), encoded(8, "IfcQuantityCount", ["Count", null, null, 2.5, "n/2"])];

        // Assert
        expect(texts).toEqual(["#8=IFCQUANTITYCOUNT('Count',$,$,3,$);", "#8=IFCQUANTITYCOUNT('Count',$,$,2.5,'n/2');"]);
    });

    it("should write integers without a decimal point", () => {
        // Act
        const text = encoded(9, "IfcDimensionalExponents", [1, 0, -2, 0, 0, 0, 0]);

        // Assert
        expect(text).toBe("#9=IFCDIMENSIONALEXPONENTS(1,0,-2,0,0,0,0);");
    });

    it("should write a list of lists", () => {
        // Act
        const text = encoded(4, "IfcCartesianPointList3D", [[[0, 0, 0], [1, 0.5, 0]]]);

        // Assert
        expect(text).toBe("#4=IFCCARTESIANPOINTLIST3D(((0.,0.,0.),(1.,0.5,0.)));");
    });

    it("should escape the texts it writes", () => {
        // Act
        const text = encoded(3, "IfcPropertySingleValue", ["it's", "café", null, null]);

        // Assert
        expect(text).toBe("#3=IFCPROPERTYSINGLEVALUE('it''s','caf\\X2\\00E9\\X0\\',$,$);");
    });

    it("should write booleans and a binary value in upper case between quotes", () => {
        // Act
        const text = encoded(1, "IfcBlobTexture", [true, false, null, null, null, "PNG", { binary: "0ff" }]);

        // Assert
        expect(text).toBe("#1=IFCBLOBTEXTURE(.T.,.F.,$,$,$,'PNG',\"0FF\");");
    });

    it("should refuse an entity the schema does not have", () => {
        // Act & Assert
        expect(() => encoded(1, "IfcNothing", [])).toThrow("IFC4 has no entity named IfcNothing");
    });
});

describe("IfcEncoder.normalizeArguments", () => {
    it("should hand back each attribute as the model keeps it", () => {
        // Act
        const values = encoderOfIfc4().normalizeArguments("IfcSIUnit", [null, "AREAUNIT", null, "SQUARE_METRE"], "#2");

        // Assert
        expect(values).toEqual([DERIVED, { enum: "AREAUNIT" }, null, { enum: "SQUARE_METRE" }]);
    });
});

describe("IfcEncoder.encodeValue", () => {
    it("should unwrap a typed value of the very defined type it is asked for", () => {
        // Act
        const text = encoderOfIfc4().encodeValue("IfcLabel", typed("ifclabel", "x"), "here");

        // Assert
        expect(text).toBe("'x'");
    });

    it("should follow a defined type through the types it names", () => {
        // Act
        const text = encoderOfIfc4().encodeValue("IfcPositiveLengthMeasure", 2, "here");

        // Assert
        expect(text).toBe("2.");
    });

    it("should write a defined type whose underlying type is a list", () => {
        // Act
        const text = encoderOfIfc4().encodeValue("IfcCompoundPlaneAngleMeasure", [51, 30, 0], "here");

        // Assert
        expect(text).toBe("(51,30,0)");
    });

    it("should write a reference for an entity type", () => {
        // Act
        const text = encoderOfIfc4().encodeValue("IfcDirection", ref(9), "here");

        // Assert
        expect(text).toBe("#9");
    });

    it("should write an aggregate given as a spec", () => {
        // Act
        const text = encoderOfIfc4().encodeValue(["SET", 1, null, "IfcLabel"], ["a", "b"], "here");

        // Assert
        expect(text).toBe("('a','b')");
    });
});

describe("IfcEncoder value errors", () => {
    it("should refuse to leave a required attribute unset", () => {
        // Act
        const error = valueErrorOf({ id: 2, type: "IfcSIUnit", args: [null, "LENGTHUNIT", null, null] });

        // Assert
        expect(error.path).toBe("#2 IfcSIUnit.Name");
        expect(error.message).toBe("#2 IfcSIUnit.Name: the attribute is required");
    });

    it("should refuse the wrong number of arguments", () => {
        // Act
        const error = valueErrorOf({ id: 1, type: "IfcCartesianPoint", args: [[0, 0, 0], null] });

        // Assert
        expect(error.path).toBe("#1");
        expect(error.message).toBe("#1: IfcCartesianPoint has 1 attributes, got 2 values");
    });

    it("should refuse to write an abstract entity", () => {
        // Act
        const error = valueErrorOf({ id: 1, type: "IfcProduct", args: [] });

        // Assert
        expect(error.path).toBe("#1");
        expect(error.message).toBe("#1: IfcProduct is abstract and cannot be written");
    });

    it("should refuse a value for a derived attribute", () => {
        // Act
        const error = valueErrorOf({ id: 2, type: "IfcSIUnit", args: [ref(9), "LENGTHUNIT", null, "METRE"] });

        // Assert
        expect(error.path).toBe("#2 IfcSIUnit.Dimensions");
        expect(error.message).toBe("#2 IfcSIUnit.Dimensions: the attribute is derived and takes no value");
    });

    it("should refuse an enumeration value the enumeration does not list", () => {
        // Act
        const error = valueErrorOf({ id: 2, type: "IfcSIUnit", args: [null, "LENGTHUNIT", "KILOMILLI", "METRE"] });

        // Assert
        expect(error.path).toBe("#2 IfcSIUnit.Prefix");
        expect(error.message).toBe(`#2 IfcSIUnit.Prefix: expected one of ${SI_PREFIXES} for IfcSIPrefix, got a text`);
    });

    it("should name what it got instead of an enumeration value", () => {
        // Act
        const messages = [3, ref(3), enumValue("KILOMETRE")].map((name) => valueErrorOf({ id: 2, type: "IfcSIUnit", args: [null, "LENGTHUNIT", null, name] }).message);

        // Assert
        expect(messages.map((message) => message.slice(message.lastIndexOf(", got ")))).toEqual([
            ", got number 3",
            ", got a reference to #3",
            ", got the enumeration value KILOMETRE",
        ]);
    });

    it("should refuse an aggregate below its lower bound", () => {
        // Act
        const error = valueErrorOf({ id: 1, type: "IfcCartesianPoint", args: [[]] });

        // Assert
        expect(error.path).toBe("#1 IfcCartesianPoint.Coordinates");
        expect(error.message).toBe("#1 IfcCartesianPoint.Coordinates: a LIST of 1 to 3 values, got 0");
    });

    it("should refuse an aggregate above its upper bound", () => {
        // Act
        const error = valueErrorOf({ id: 1, type: "IfcCartesianPoint", args: [[0, 0, 0, 0]] });

        // Assert
        expect(error.message).toBe("#1 IfcCartesianPoint.Coordinates: a LIST of 1 to 3 values, got 4");
    });

    it("should say an unbounded aggregate takes any number of values", () => {
        // Act
        const error = valueErrorOf({ id: 6, type: "IfcRelAssociatesMaterial", args: ["0YvctVUKr0kugbFTf53O9L", null, null, null, [], ref(5)] });

        // Assert
        expect(error.message).toBe("#6 IfcRelAssociatesMaterial.RelatedObjects: a SET of 1 to any number of values, got 0");
    });

    it("should check the bounds of a list inside a list at the inner list's path", () => {
        // Act
        const error = valueErrorOf({ id: 4, type: "IfcCartesianPointList3D", args: [[[0, 0, 0], [0, 0]]] });

        // Assert
        expect(error.path).toBe("#4 IfcCartesianPointList3D.CoordList[1]");
        expect(error.message).toBe("#4 IfcCartesianPointList3D.CoordList[1]: a LIST of 3 to 3 values, got 2");
    });

    it("should refuse an ARRAY [1:2] with one value, since an array holds a value at every index", () => {
        // Act
        const error = valueErrorOf(nominalValueOf(typed("IfcComplexNumber", [1.5])));

        // Assert
        expect(error.path).toBe("#3 IfcPropertySingleValue.NominalValue");
    });

    it("should refuse a fraction where an integer belongs", () => {
        // Act
        const error = valueErrorOf({ id: 9, type: "IfcDimensionalExponents", args: [0.5, 0, 0, 0, 0, 0, 0] });

        // Assert
        expect(error.path).toBe("#9 IfcDimensionalExponents.LengthExponent");
        expect(error.message).toBe("#9 IfcDimensionalExponents.LengthExponent: expected a whole number, got number 0.5");
    });

    it("should refuse an integer beyond the safe range", () => {
        // Act
        const error = valueErrorOfValue("INTEGER", 2 ** 60);

        // Assert
        expect(error.message).toBe("here: expected a whole number, got number 1152921504606847000");
    });

    it("should refuse a fraction for a typed integer inside a select", () => {
        // Act
        const error = valueErrorOf(nominalValueOf(typed("IfcPositiveInteger", 1.5)));

        // Assert
        expect(error.message).toBe("#3 IfcPropertySingleValue.NominalValue: expected a whole number, got number 1.5");
    });

    it("should refuse a text where a real belongs, at the path of the list item", () => {
        // Act
        const error = valueErrorOf({ id: 1, type: "IfcCartesianPoint", args: [["1", 2]] });

        // Assert
        expect(error.path).toBe("#1 IfcCartesianPoint.Coordinates[0]");
        expect(error.message).toBe("#1 IfcCartesianPoint.Coordinates[0]: expected a finite real number, got a text");
    });

    it("should report a real that is not finite as a value error at its path", () => {
        // Act
        const error = valueErrorOf({ id: 1, type: "IfcCartesianPoint", args: [[0, Number.NaN]] });

        // Assert
        expect(error.path).toBe("#1 IfcCartesianPoint.Coordinates[1]");
    });

    it("should refuse a text where a number belongs", () => {
        // Act
        const error = valueErrorOf({ id: 8, type: "IfcQuantityCount", args: ["Count", null, null, "3", null] });

        // Assert
        expect(error.message).toBe("#8 IfcQuantityCount.CountValue: expected a finite number, got a text");
    });

    it("should refuse a number where a text belongs", () => {
        // Act
        const error = valueErrorOf({ id: 3, type: "IfcPropertySingleValue", args: [5, null, null, null] });

        // Assert
        expect(error.message).toBe("#3 IfcPropertySingleValue.Name: expected a text, got number 5");
    });

    it("should refuse the unknown logical value where a boolean belongs", () => {
        // Act
        const error = valueErrorOf({ id: 7, type: "IfcIndexedPolyCurve", args: [ref(6), null, enumValue("U")] });

        // Assert
        expect(error.message).toBe("#7 IfcIndexedPolyCurve.SelfIntersect: expected true or false, got the enumeration value U");
    });

    it("should refuse a text and an unlisted enumeration value where a logical belongs", () => {
        // Act
        const messages = ["U", enumValue("X")].map((value) => valueErrorOf({ id: 5, type: "IfcCompositeCurve", args: [[ref(1)], value] }).message);

        // Assert
        expect(messages).toEqual([
            "#5 IfcCompositeCurve.SelfIntersect: expected true, false or unknown, got a text",
            "#5 IfcCompositeCurve.SelfIntersect: expected true, false or unknown, got the enumeration value X",
        ]);
    });

    it("should refuse a reference where the select takes only typed values", () => {
        // Act
        const error = valueErrorOf(nominalValueOf(ref(5)));

        // Assert
        expect(error.path).toBe("#3 IfcPropertySingleValue.NominalValue");
        expect(error.message).toBe("#3 IfcPropertySingleValue.NominalValue: IfcValue takes typed values, not references");
    });

    it("should refuse a plain value where a select needs a typed one", () => {
        // Act
        const error = valueErrorOf(nominalValueOf("x"));

        // Assert
        expect(error.message).toBe("#3 IfcPropertySingleValue.NominalValue: IfcValue needs a typed value or a reference, got a text");
    });

    it("should refuse a typed value of a type the select does not accept", () => {
        // Act
        const error = valueErrorOf(nominalValueOf(typed("IfcGloballyUniqueId", "x")));

        // Assert
        expect(error.message).toBe("#3 IfcPropertySingleValue.NominalValue: IfcGloballyUniqueId is not one of the types IfcValue accepts");
    });

    it("should refuse a typed value of a type the schema does not have", () => {
        // Act
        const error = valueErrorOf(nominalValueOf(typed("IfcNoSuchMeasure", 1)));

        // Assert
        expect(error.message).toBe("#3 IfcPropertySingleValue.NominalValue: IfcNoSuchMeasure is not one of the types IfcValue accepts");
    });

    it("should refuse a typed value for a select that holds only entities", () => {
        // Act
        const error = valueErrorOf({ id: 6, type: "IfcRelAssociatesMaterial", args: ["0YvctVUKr0kugbFTf53O9L", null, null, null, [ref(3)], typed("IfcLabel", "x")] });

        // Assert
        expect(error.message).toBe("#6 IfcRelAssociatesMaterial.RelatingMaterial: IfcLabel is not one of the types IfcMaterialSelect accepts");
    });

    it("should refuse a typed value of another defined type", () => {
        // Act
        const error = valueErrorOfValue("IfcLabel", typed("IfcText", "x"));

        // Assert
        expect(error.message).toBe("here: expected IfcLabel, got a typed IfcText");
    });

    it("should refuse a type the schema does not have", () => {
        // Act
        const error = valueErrorOfValue("IfcNoSuchType", "x");

        // Assert
        expect(error.path).toBe("here");
        expect(error.message).toBe("here: the schema has no type IfcNoSuchType");
    });

    it("should refuse a plain value where a reference to an entity belongs", () => {
        // Act
        const error = valueErrorOf({ id: 7, type: "IfcIndexedPolyCurve", args: ["x", null, null] });

        // Assert
        expect(error.message).toBe("#7 IfcIndexedPolyCurve.Points: expected a reference to an IfcCartesianPointList, got a text");
    });

    it("should refuse a single value where a list belongs", () => {
        // Act
        const error = valueErrorOf({ id: 1, type: "IfcCartesianPoint", args: [5] });

        // Assert
        expect(error.message).toBe("#1 IfcCartesianPoint.Coordinates: expected a list, got number 5");
    });

    it("should refuse an unset value inside a list", () => {
        // Act
        const error = valueErrorOf({ id: 1, type: "IfcCartesianPoint", args: [[0, null]] });

        // Assert
        expect(error.message).toBe("#1 IfcCartesianPoint.Coordinates[1]: expected a value, got nothing");
    });

    it("should refuse the derived marker where a value belongs", () => {
        // Act
        const error = valueErrorOfValue("IfcLabel", DERIVED);

        // Assert
        expect(error.path).toBe("here");
        expect(error.message).toMatch(/^here: expected a value, got /);
    });

    it("should refuse a text where a binary value belongs", () => {
        // Act
        const error = valueErrorOfValue("IfcBinary", "0FF");

        // Assert
        expect(error.message).toBe("here: expected a binary value, got a text");
    });

    it("should refuse a binary value that does not start with a digit from 0 to 3", () => {
        // Act
        const messages = [{ binary: "4F" }, { binary: "0G" }, { binary: "" }].map((value) => valueErrorOfValue("IfcBinary", value).message);

        // Assert
        expect(messages).toEqual([
            "here: a binary value is a digit from 0 to 3 followed by hexadecimal digits",
            "here: a binary value is a digit from 0 to 3 followed by hexadecimal digits",
            "here: a binary value is a digit from 0 to 3 followed by hexadecimal digits",
        ]);
    });
});

describe("IfcEncoder sets and derived markers", () => {
    it("should refuse a SET that repeats a reference", () => {
        // Arrange
        const encoder = new IfcEncoder(schemaNamed("IFC4"));

        // Act & Assert
        expect(() => encoder.encodeValue(["SET", 1, null, "IfcProduct"], [{ ref: 3 }, { ref: 3 }], "#9 RelatedObjects")).toThrow("#9 RelatedObjects: a SET holds each value once, and this one repeats a value");
    });

    it("should name the derived marker when it stands where a value belongs", () => {
        // Arrange
        const encoder = new IfcEncoder(schemaNamed("IFC4"));

        // Act & Assert
        expect(() => encoder.encodeValue("IfcLabel", { derived: true }, "#9 Name")).toThrow("#9 Name: expected a value, got the derived marker");
    });
});

describe("IfcEncoder refusals of values that do not fit their attribute", () => {
    it("should say how many values an ARRAY holds", () => {
        // Act
        const error = valueErrorOf(nominalValueOf(typed("IfcComplexNumber", [1])));

        // Assert
        expect(error.message).toContain("an ARRAY [1:2] holds exactly 2 values, got 1");
    });

    it("should refuse a number that is not finite where a NUMBER is expected", () => {
        // Act
        const error = valueErrorOf(nominalValueOf(typed("IfcNumericMeasure", Number.POSITIVE_INFINITY)));

        // Assert
        expect(error.message).toContain("expected a finite number, got number Infinity");
    });

    it("should name a value of no kind it knows an unknown value", () => {
        // Arrange
        const strange: unknown = { kind: "strange" };

        // Act
        const error = valueErrorOfValue("IfcReal", strange as IfcValue);

        // Assert
        expect(error.message).toBe("here: expected a finite real number, got an unknown value");
    });

    it("should refuse a value given where an attribute is derived", () => {
        // Act
        const error = errorThrownBy(IfcValueError, () => encoderOfIfc4().normalizeArguments("IfcGeometricRepresentationSubContext", ["Body", "Model", 3, null, null, null, ref(1), null, enumValue("MODEL_VIEW"), null], "#9"));

        // Assert
        expect(error.message).toContain("the attribute is derived and takes no value");
    });

    it.each([
        [null, "expected a value, got nothing"],
        [DERIVED, "expected a value, got the derived marker"],
    ])("should refuse %j inside a list", (item, message) => {
        // Act
        const error = errorThrownBy(IfcValueError, () => encoderOfIfc4().normalizeArguments("IfcCartesianPoint", [[0, item]], "#1"));

        // Assert
        expect(error.message).toContain(message);
    });

    it("should refuse a value that is not a list where a list is expected", () => {
        // Act
        const error = errorThrownBy(IfcValueError, () => encoderOfIfc4().normalizeArguments("IfcCartesianPoint", [5], "#1"));

        // Assert
        expect(error.message).toContain("expected a list, got number 5");
    });
});
