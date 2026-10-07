import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { SCHEMAS, checkReferences, emit, noticeOf, readSchema, typeSpecOf } from "./gen-ifc-schema.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const NOTICE = "(*\nCopyright by:\nbuildingSMART International Limited, 1996-2020\n*)\n";

const flatAttributes = (schema, name) => {
    const entity = schema.entities[name];
    return [...(entity.p ? flatAttributes(schema, entity.p) : []), ...entity.a.map(([attribute]) => attribute)];
};

describe("typeSpecOf", () => {
    it("should read nested aggregates with their bounds, an open upper bound as null", () => {
        // Act
        const spec = typeSpecOf("LIST [2:?] OF LIST [2:3] OF UNIQUE IfcLengthMeasure");

        // Assert
        assert.deepEqual(spec, ["LIST", 2, null, ["LIST", 2, 3, "IfcLengthMeasure"]]);
    });

    it("should read a sized or fixed string as STRING", () => {
        // Act
        const specs = ["STRING(22) FIXED", "STRING", "BINARY(32)"].map(typeSpecOf);

        // Assert
        assert.deepEqual(specs, ["STRING", "STRING", "BINARY"]);
    });

    it("should refuse a type it cannot read rather than guess", () => {
        // Act & Assert
        assert.throws(() => typeSpecOf("GENERIC : Item"), /cannot read/);
    });
});

describe("readSchema", () => {
    const fixture = `${NOTICE}SCHEMA TINY;
TYPE TinyLabel = STRING;
END_TYPE;
TYPE TinyKind = ENUMERATION OF
  (A,
   B);
END_TYPE;
TYPE TinySelect = SELECT
  (TinyLabel, TinyThing);
END_TYPE;
ENTITY TinyRoot
 ABSTRACT SUPERTYPE OF (ONEOF (TinyThing));
  Name : OPTIONAL TinyLabel;
  Size : REAL;
END_ENTITY;
ENTITY TinyThing
 SUBTYPE OF (TinyRoot);
  Kind : TinyKind;
  Points : LIST [1:?] OF REAL;
 DERIVE
  SELF\\TinyRoot.Size : REAL := 1.0;
 INVERSE
  UsedBy : SET [0:?] OF TinyThing FOR Kind;
 WHERE
  WR1 : EXISTS(Kind);
END_ENTITY;
END_SCHEMA;`;

    it("should read types, entities, optional attributes, derived redeclarations and inverses", () => {
        // Act
        const schema = readSchema(fixture);

        // Assert
        assert.equal(schema.name, "TINY");
        assert.deepEqual(schema.types, { TinyLabel: { t: "STRING" }, TinyKind: { e: ["A", "B"] }, TinySelect: { s: ["TinyLabel", "TinyThing"] } });
        assert.deepEqual(schema.entities.TinyRoot, { p: null, a: [["Name", "TinyLabel", 1], ["Size", "REAL"]], abs: 1 });
        assert.deepEqual(schema.entities.TinyThing, {
            p: "TinyRoot",
            a: [["Kind", "TinyKind"], ["Points", ["LIST", 1, null, "REAL"]]],
            d: ["Size"],
            i: [["UsedBy", ["SET", 0, null, "TinyThing"], "Kind"]],
        });
    });

    it("should fail on a name the schema does not define", () => {
        // Arrange
        const broken = fixture.replace("Kind : TinyKind;", "Kind : TinyMissing;");

        // Act & Assert
        assert.throws(() => readSchema(broken), /TinyThing\.Kind names TinyMissing/);
    });

    it("should refuse an explicit redeclaration of an inherited attribute rather than drop it", () => {
        // Arrange
        const redeclared = fixture.replace("  Kind : TinyKind;\n", "  Kind : TinyKind;\n  SELF\\TinyRoot.Name : TinyLabel;\n");

        // Act & Assert
        assert.throws(() => readSchema(redeclared), /TinyThing: redeclares an inherited attribute in its explicit section/);
    });

    it("should report a derived attribute that no supertype declares", () => {
        // Act
        const problems = checkReferences({ types: {}, entities: { A: { p: null, a: [] }, B: { p: "A", a: [], d: ["Missing"] } } });

        // Assert
        assert.deepEqual(problems, ["B derives Missing, which none of its supertypes declares"]);
    });
});

describe("the IFC4 ADD2 TC1 table", () => {
    const target = SCHEMAS[0];
    const text = readFileSync(path.join(ROOT, target.source), "latin1");
    const schema = readSchema(text);

    it("should hold buildingSMART's counts: 776 entities and 397 types, 207 of them enumerations and 60 selects", () => {
        // Act
        const types = Object.values(schema.types);

        // Assert
        assert.equal(Object.keys(schema.entities).length, 776);
        assert.equal(types.length, 397);
        assert.equal(types.filter((t) => t.e).length, 207);
        assert.equal(types.filter((t) => t.s).length, 60);
    });

    it("should flatten IfcWall's attributes in the order a file writes them", () => {
        // Act
        const attributes = flatAttributes(schema, "IfcWall");

        // Assert
        assert.deepEqual(attributes, ["GlobalId", "OwnerHistory", "Name", "Description", "ObjectType", "ObjectPlacement", "Representation", "Tag", "PredefinedType"]);
    });

    it("should mark the four attributes a sub-context derives from its parent", () => {
        // Act
        const derived = schema.entities.IfcGeometricRepresentationSubContext.d;

        // Assert
        assert.deepEqual(derived, ["WorldCoordinateSystem", "CoordinateSpaceDimension", "TrueNorth", "Precision"]);
    });

    it("should match the committed table", () => {
        // Act
        const output = emit(schema, noticeOf(text), target);

        // Assert
        assert.equal(output, readFileSync(path.join(ROOT, target.out), "utf8"));
    });
});

describe("noticeOf", () => {
    it("should refuse a schema file without buildingSMART's notice, which the table must carry", () => {
        // Act & Assert
        assert.throws(() => noticeOf("SCHEMA X; END_SCHEMA;"), /copyright notice/);
    });
});
