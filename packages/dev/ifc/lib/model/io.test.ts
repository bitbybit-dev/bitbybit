import { describe, expect, it } from "vitest";
import { BLANK_HEADER, BLANK_HEADER_LINES, NAMED_HEADER, PLACED_WALL_IDS, PLACED_WALL_ROWS, WALL_GLOBAL_ID, emptyIfc4Model, ifcFile, placedWallModel, stepFile } from "../__test__/model-fixtures";
import { errorThrownBy } from "../__test__/thrown";
import { StepSyntaxError } from "../step/errors";
import type { IfcEntity } from "../step/step-types";
import { enumValue, ref } from "../step/values";
import { IdMap } from "./id-map";
import { ModelSnapshot } from "./snapshot";
import { IfcSource } from "./source";
import { emptyModel, readModel, writeModel, writeModelBytes } from "./io";
import { IfcTransaction } from "./transaction";

const SEED = "test-seed";
const SCHEMA_LINE = "FILE_SCHEMA(('IFC4'));";

const ODDLY_SPACED_ROWS: readonly string[] = [
    "#1= IFCCARTESIANPOINT ( (0.,0.,0.) ) ;",
    "#2 =IFCDIRECTION((0.0E0, 0., 1.0));",
    "#3=IFCAXIS2PLACEMENT3D(#1,\n    #2,$);",
    "#4=IfcLocalPlacement($,#3);",
    `#5 = IFCWALL ( '${WALL_GLOBAL_ID}', $, 'Wall', $, $, #4, $, $, .STANDARD. ) ;`,
];

function withSchemaLine(line: string): string {
    return ifcFile(PLACED_WALL_ROWS).replace(SCHEMA_LINE, line);
}

function entitiesOf(model: ModelSnapshot): IfcEntity[] {
    return model.ids().map((id) => model.entity(id));
}

describe("readModel", () => {
    it("should read the header", () => {
        // Act
        const model = readModel(ifcFile(PLACED_WALL_ROWS));

        // Assert
        expect(model.header).toEqual(NAMED_HEADER);
    });

    it("should follow the schema the file names", () => {
        // Act
        const model = readModel(ifcFile(PLACED_WALL_ROWS));

        // Assert
        expect(model.schema.name).toBe("IFC4");
        expect(model.source).toBeInstanceOf(IfcSource);
        expect(model.ids()).toEqual(PLACED_WALL_IDS);
    });

    it("should read the schema's name in any case", () => {
        // Act
        const model = readModel(withSchemaLine("FILE_SCHEMA(('ifc4'));"));

        // Assert
        expect(model.schema.name).toBe("IFC4");
    });

    it("should read the same model from bytes as from text", () => {
        // Arrange
        const text = ifcFile(PLACED_WALL_ROWS);

        // Act
        const fromBytes = readModel(new TextEncoder().encode(text));

        // Assert
        expect(entitiesOf(fromBytes)).toEqual(entitiesOf(readModel(text)));
    });

    it("should continue ids after the highest id in the file", () => {
        // Act
        const model = readModel(ifcFile(PLACED_WALL_ROWS));

        // Assert
        expect(model.nextId).toBe(31);
    });

    it("should refuse a file whose FILE_SCHEMA names no schema, at its FILE_SCHEMA", () => {
        // Arrange
        const text = withSchemaLine("FILE_SCHEMA(());");

        // Act
        const error = errorThrownBy(StepSyntaxError, () => readModel(text));

        // Assert
        expect([error.message, error.offset]).toEqual([`The file names no schema in FILE_SCHEMA at byte ${text.indexOf("FILE_SCHEMA(())")}`, text.indexOf("FILE_SCHEMA(())")]);
    });

    it("should refuse a file without FILE_SCHEMA at the end of its header, where it is missing", () => {
        // Arrange
        const text = withSchemaLine("");

        // Act
        const error = errorThrownBy(StepSyntaxError, () => readModel(text));

        // Assert
        expect([error.message, error.offset]).toEqual([`The file names no schema in FILE_SCHEMA at byte ${text.indexOf("ENDSEC")}`, text.indexOf("ENDSEC")]);
    });

    it("should refuse a schema it does not support, at its FILE_SCHEMA", () => {
        // Arrange
        const text = withSchemaLine("FILE_SCHEMA(('IFC4X3_ADD2'));");

        // Act
        const error = errorThrownBy(StepSyntaxError, () => readModel(text));

        // Assert
        expect([error.message, error.offset]).toEqual([
            `The file's schema IFC4X3_ADD2 is not supported; supported: IFC4, and IFC2X3 read through IFC4 at byte ${text.indexOf("FILE_SCHEMA(('IFC4X3_ADD2'))")}`,
            text.indexOf("FILE_SCHEMA(('IFC4X3_ADD2'))"),
        ]);
    });

    it("should name the schema without the spaces a file puts around it, so a spaced IFC4 file stays editable", () => {
        // Act
        const model = readModel(withSchemaLine("FILE_SCHEMA((' IFC4 '));"));

        // Assert
        expect([model.schemaName, model.editable]).toEqual(["IFC4", true]);
    });

    it("should read an IFC2X3 file through IFC4, naming its own schema, able to show and query it but not to change it", () => {
        // Arrange
        const text = withSchemaLine("FILE_SCHEMA(('IFC2X3'));");

        // Act
        const model = readModel(text);

        // Assert
        expect([model.schemaName, model.schema.name, model.editable]).toEqual(["IFC2X3", "IFC4", false]);
        expect(model.entity(20).type).toBe("IfcWall");
        expect(writeModelBytes(model, model.header)).toEqual(new TextEncoder().encode(text));
        expect(() => new IfcTransaction(model)).toThrow("This IFC2X3 file is read through the IFC4 schema, so it can be shown and queried but not changed");
    });

    it("should take an IFC4 file whose schema is written in another case as editable", () => {
        // Act
        const model = readModel(withSchemaLine("FILE_SCHEMA(('Ifc4'));"));

        // Assert
        expect([model.schemaName, model.editable]).toEqual(["IFC4", true]);
    });

    it("should refuse a text that is not a STEP file at its first byte", () => {
        // Act
        const error = errorThrownBy(StepSyntaxError, () => readModel("not an IFC file"));

        // Assert
        expect(error.offset).toBe(0);
    });
});

describe("emptyModel", () => {
    it("should make a model without entities whose ids start at one", () => {
        // Act
        const model = emptyModel("IFC4", BLANK_HEADER);

        // Assert
        expect(model.schema.name).toBe("IFC4");
        expect(model.header).toBe(BLANK_HEADER);
        expect(model.size).toBe(0);
        expect(model.nextId).toBe(1);
        expect(model.source).toBeUndefined();
        expect(model.overlay.size).toBe(0);
    });

    it("should refuse a schema it does not support", () => {
        // Act & Assert
        expect(() => emptyModel("IFC2X3", BLANK_HEADER)).toThrow("The IFC schema IFC2X3 is not supported; supported: IFC4");
        expect(() => emptyModel("IFC4X3", BLANK_HEADER)).toThrow("The IFC schema IFC4X3 is not supported; supported: IFC4");
    });
});

describe("writeModel", () => {
    it("should write the header, an empty DATA section and the end of the file for an empty model", () => {
        // Act
        const text = writeModel(emptyIfc4Model());

        // Assert
        expect(text).toBe([
            "ISO-10303-21;",
            "HEADER;",
            "FILE_DESCRIPTION((''),'2;1');",
            "FILE_NAME('','',(''),(''),'','','');",
            "FILE_SCHEMA(('IFC4'));",
            "ENDSEC;",
            "DATA;",
            "ENDSEC;",
            "END-ISO-10303-21;",
            "",
        ].join("\n"));
    });

    it("should give back an unchanged file exactly when its header is written the way the library writes one", () => {
        // Arrange
        const text = ifcFile(PLACED_WALL_ROWS);

        // Act
        const written = writeModel(readModel(text));

        // Assert
        expect(written).toBe(text);
    });

    it("should copy every unchanged row exactly, whatever its spacing", () => {
        // Arrange
        const text = ifcFile(ODDLY_SPACED_ROWS);

        // Act
        const written = writeModel(readModel(text));

        // Assert
        expect(written).toBe(text);
    });

    it("should copy untouched rows and the line ends between them exactly as the file writes them", () => {
        // Arrange
        const text = ifcFile(ODDLY_SPACED_ROWS).replace(/\n/g, "\r\n");

        // Act
        const written = writeModel(readModel(text));

        // Assert
        expect(written).toBe(text);
    });

    it("should copy a row whose type the schema does not know without decoding it", () => {
        // Arrange
        const rows = [...PLACED_WALL_ROWS, "#7=IFCNOTATHING ( (1.) );"];
        const text = ifcFile(rows);

        // Act
        const written = writeModel(readModel(text));

        // Assert
        expect(written).toBe(text);
    });

    it("should copy a row holding UTF-8 text unchanged", () => {
        // Arrange
        const rows = ["#1=IFCMATERIAL('Béton armé',$,$);"];

        // Act
        const written = writeModel(readModel(new TextEncoder().encode(ifcFile(rows))));

        // Assert
        expect(written).toBe(ifcFile(rows));
    });

    it("should write the header it is given in place of the model's own", () => {
        // Act
        const written = writeModel(placedWallModel(), BLANK_HEADER);

        // Assert
        expect(written).toBe(stepFile(BLANK_HEADER_LINES, PLACED_WALL_ROWS));
    });

    it("should re-encode a changed entity in its place and copy the others", () => {
        // Arrange
        const tx = new IfcTransaction(readModel(ifcFile(ODDLY_SPACED_ROWS)), SEED);
        tx.update(5, { Name: "Renamed" });

        // Act
        const written = writeModel(tx.commit());

        // Assert
        expect(written).toBe(ifcFile([...ODDLY_SPACED_ROWS.slice(0, 4), `#5=IFCWALL('${WALL_GLOBAL_ID}',$,'Renamed',$,$,#4,$,$,.STANDARD.);`]));
    });

    it("should leave out a deleted entity", () => {
        // Arrange
        const tx = new IfcTransaction(placedWallModel(), SEED);
        tx.delete(30);
        tx.delete(6);

        // Act
        const written = writeModel(tx.commit());

        // Assert
        expect(written).toBe(ifcFile(PLACED_WALL_ROWS.filter((row) => !row.startsWith("#30=") && !row.startsWith("#6="))));
    });

    it("should append created entities after the file's rows", () => {
        // Arrange
        const tx = new IfcTransaction(placedWallModel(), SEED);
        tx.create("IfcCartesianPoint", { Coordinates: [1.5, -2, 0] });
        tx.create("IfcDirection", { DirectionRatios: [1, 0, 0] });

        // Act
        const written = writeModel(tx.commit());

        // Assert
        expect(written).toBe(ifcFile([...PLACED_WALL_ROWS, "#31=IFCCARTESIANPOINT((1.5,-2.,0.));", "#32=IFCDIRECTION((1.,0.,0.));"]));
    });

    it("should write created entities in id order whatever order the changes hold them in", () => {
        // Arrange
        const base = emptyIfc4Model();
        const second: IfcEntity = { id: 2, type: "IfcDirection", args: [[1, 0, 0]] };
        const first: IfcEntity = { id: 1, type: "IfcCartesianPoint", args: [[0, 0, 0]] };
        const model = new ModelSnapshot({ ...base.parts, overlay: IdMap.empty<IfcEntity | null>().withChanges([[2, second], [1, first]]), nextId: 3 });

        // Act
        const written = writeModel(model);

        // Assert
        expect(written).toBe(stepFile(BLANK_HEADER_LINES, ["#1=IFCCARTESIANPOINT((0.,0.,0.));", "#2=IFCDIRECTION((1.,0.,0.));"]));
    });

    it("should write a derived attribute as a star and an enumeration between dots", () => {
        // Arrange
        const tx = new IfcTransaction(emptyIfc4Model(), SEED);
        const origin = tx.create("IfcCartesianPoint", { Coordinates: [0, 0, 0] });
        const axes = tx.create("IfcAxis2Placement3D", { Location: ref(origin) });
        const context = tx.create("IfcGeometricRepresentationContext", { ContextType: "Model", CoordinateSpaceDimension: 3, Precision: 1e-5, WorldCoordinateSystem: ref(axes) });
        tx.create("IfcGeometricRepresentationSubContext", { ContextIdentifier: "Body", ContextType: "Model", ParentContext: ref(context), TargetView: "MODEL_VIEW" });

        // Act
        const written = writeModel(tx.commit());

        // Assert
        expect(written).toBe(stepFile(BLANK_HEADER_LINES, [
            "#1=IFCCARTESIANPOINT((0.,0.,0.));",
            "#2=IFCAXIS2PLACEMENT3D(#1,$,$);",
            "#3=IFCGEOMETRICREPRESENTATIONCONTEXT($,'Model',3,0.00001,#2,$);",
            "#4=IFCGEOMETRICREPRESENTATIONSUBCONTEXT('Body','Model',*,*,*,*,#3,$,.MODEL_VIEW.,$);",
        ]));
    });

    it("should read back what it writes", () => {
        // Arrange
        const tx = new IfcTransaction(placedWallModel(), SEED);
        const created = tx.create("IfcWall", { GlobalId: tx.globalId("wall-2"), Name: "It's a wall", ObjectPlacement: ref(10), PredefinedType: enumValue("PARTITIONING") });
        tx.update(6, { Coordinates: [0.1, 1e-9, -3.25] });
        const committed = tx.commit();

        // Act
        const back = readModel(writeModel(committed));

        // Assert
        expect(back.ids()).toEqual([...PLACED_WALL_IDS, created]);
        expect(entitiesOf(back)).toEqual(entitiesOf(committed));
    });
});

describe("writeModelBytes", () => {
    function edited(): ModelSnapshot {
        const tx = new IfcTransaction(readModel(ifcFile(ODDLY_SPACED_ROWS)), SEED);
        tx.update(5, { Name: "Renamed" });
        tx.create("IfcCartesianPoint", { Coordinates: [1.5, -2, 0] });
        return tx.commit();
    }

    function withDeletions(): ModelSnapshot {
        const tx = new IfcTransaction(placedWallModel(), SEED);
        tx.delete(30);
        tx.delete(6);
        return tx.commit();
    }

    function sectioned(): ModelSnapshot {
        return readModel(ifcFile(PLACED_WALL_ROWS).replace("#20=", "#99=IFCDIRECTION((0.,1.,0.));\nENDSEC;\nDATA;\n#20="));
    }

    it.each([
        ["an empty model", emptyIfc4Model],
        ["a file read and left as it was", (): ModelSnapshot => readModel(ifcFile(ODDLY_SPACED_ROWS))],
        ["a file with an entity changed and one added", edited],
        ["a model with entities deleted", withDeletions],
        ["a file of two DATA sections", sectioned],
        ["a model made in memory", placedWallModel],
    ] as const)("should write %s as the bytes of the text writeModel writes", (_kind, build) => {
        // Arrange
        const model = build();

        // Act
        const bytes = writeModelBytes(model);

        // Assert
        expect(bytes).toEqual(new TextEncoder().encode(writeModel(model)));
    });

    it("should copy bytes that are not UTF-8 exactly as the file holds them", () => {
        // Arrange
        const text = ifcFile(["#1=IFCMATERIAL('Wand Au_en',$,$);"]);
        const bytes = new TextEncoder().encode(text);
        bytes[text.indexOf("Au_") + "Au".length] = 0xdf;

        // Act
        const written = writeModelBytes(readModel(bytes));

        // Assert
        expect(written).toEqual(bytes);
    });

    it("should write new text in chunks without changing a byte of it", () => {
        // Arrange
        const model = edited();

        // Act
        const bytes = writeModelBytes(model, model.header, 10);

        // Assert
        expect(bytes).toEqual(writeModelBytes(model));
    });
});

describe("writing a file back as the tool that wrote it laid it out", () => {
    const OWN_LAYOUT = [
        "ISO-10303-21;",
        "HEADER;",
        "FILE_DESCRIPTION(('ViewDefinition [CoordinationView_V2.0]'), '2;1');",
        "FILE_NAME('exported.ifc', '2024-01-16T10:28:20+02:00', (''), (''), 'A writer', 'An exporter', '');",
        "FILE_SCHEMA(('IFC4'));",
        "ENDSEC;",
        "",
        "DATA;",
        ...PLACED_WALL_ROWS,
        "ENDSEC;",
        "",
        "END-ISO-10303-21;",
        "",
    ].join("\r\n");

    it("should write back an untouched file byte for byte, its header's spacing, line breaks and blank lines included", () => {
        // Arrange
        const bytes = new TextEncoder().encode(OWN_LAYOUT);

        // Act
        const written = [writeModelBytes(readModel(bytes)), new TextEncoder().encode(writeModel(readModel(bytes)))];

        // Assert
        expect(written).toEqual([bytes, bytes]);
    });

    it("should write a new header, the rows it changes and the rows it adds with the file's own line breaks", () => {
        // Arrange
        const tx = new IfcTransaction(readModel(OWN_LAYOUT), SEED);
        tx.update(20, { Name: "Renamed" });
        tx.create("IfcCartesianPoint", { Coordinates: [1, 2, 3] });
        const model = tx.commit();

        // Act
        const written = writeModel(model, { ...model.header, timeStamp: "2026-10-07T12:00:00" });

        // Assert
        expect(written.replace(/\r\n/g, "")).not.toContain("\n");
        expect(written).toContain("'Renamed'");
        expect(written).toContain("2026-10-07T12:00:00");
        expect(written.endsWith("\r\n#31=IFCCARTESIANPOINT((1.,2.,3.));\r\nENDSEC;\r\n\r\nEND-ISO-10303-21;\r\n")).toBe(true);
    });

    it("should keep everything before the first row as the file wrote it while the header stays the same", () => {
        // Arrange
        const tx = new IfcTransaction(readModel(OWN_LAYOUT), SEED);
        tx.update(5, { Coordinates: [1, 1, 1] });

        // Act
        const written = writeModel(tx.commit());

        // Assert
        expect(written.startsWith(OWN_LAYOUT.slice(0, OWN_LAYOUT.indexOf("#"))) && written.includes("\r\n#5=IFCCARTESIANPOINT((1.,1.,1.));\r\n")).toBe(true);
    });

    it("should lay out the rows created in a file that held none as it lays out a new file", () => {
        // Arrange
        const tx = new IfcTransaction(readModel(ifcFile([])), SEED);
        tx.create("IfcCartesianPoint", { Coordinates: [0, 0, 0] });

        // Act
        const written = writeModel(tx.commit());

        // Assert
        expect(written).toBe(ifcFile(["#1=IFCCARTESIANPOINT((0.,0.,0.));"]));
    });
});

describe("writeModel and the longest string", () => {
    it("should refuse a file longer than one string holds and name the verb that writes it as bytes", () => {
        // Arrange
        const model = placedWallModel();

        // Act
        const error = errorThrownBy(Error, () => writeModel(model, model.header, 100));

        // Assert
        expect(error.message).toMatch(/^The file is about \d+ bytes, more than one JavaScript string holds; write it with model.writeBytes$/);
    });
});

describe("readModel and writeModel with files from other tools", () => {
    it("should keep the characters of a file written in ISO 8859-1, untouched rows included", () => {
        // Arrange
        const text = ifcFile(["#1=IFCMATERIAL('Wand Au_en',$,$);"]);
        const bytes = new TextEncoder().encode(text);
        bytes[text.indexOf("Au_") + "Au".length] = 0xdf;

        // Act
        const model = readModel(bytes);
        const written = writeModel(model);

        // Assert
        expect(model.attribute(1, "Name")).toBe("Wand Außen");
        expect(written).toContain("#1=IFCMATERIAL('Wand Außen',$,$);");
    });

    it("should write back the header entities it does not read itself", () => {
        // Arrange
        const text = ifcFile(PLACED_WALL_ROWS).replace("FILE_SCHEMA(('IFC4'));", "FILE_SCHEMA(('IFC4'));\nFILE_POPULATION('IFC4','x',$);");

        // Act
        const written = writeModel(readModel(text));

        // Assert
        expect(written).toContain("FILE_SCHEMA(('IFC4'));\nFILE_POPULATION('IFC4','x',$);\nENDSEC;");
    });

    it("should write every DATA section's untouched rows and put a changed one in its place", () => {
        // Arrange
        const text = ifcFile(PLACED_WALL_ROWS).replace("#20=", "#99=IFCDIRECTION((0.,1.,0.));\nENDSEC;\nDATA;\n#20=");
        const tx = new IfcTransaction(readModel(text), SEED);
        tx.update(99, { DirectionRatios: [1, 0, 0] });

        // Act
        const back = readModel(writeModel(tx.commit()));

        // Assert
        expect(back.ids()).toEqual([5, 2, 6, 3, 10, 1, 99, 20, 30]);
        expect(back.attribute(99, "DirectionRatios")).toEqual([1, 0, 0]);
    });

    it("should name the defined type of a typed value as the schema spells it, however the file writes it", () => {
        // Arrange
        const model = readModel(ifcFile(["#1=IFCPROPERTYSINGLEVALUE('Fire',$,IFCLABEL('EI60'),$);"]));

        // Act
        const value = model.attribute(1, "NominalValue");

        // Assert
        expect(value).toEqual({ type: "IfcLabel", value: "EI60" });
    });

    it("should read a file given as an ArrayBuffer", () => {
        // Arrange
        const buffer = new TextEncoder().encode(ifcFile(PLACED_WALL_ROWS)).buffer;

        // Act
        const model = readModel(buffer);

        // Assert
        expect(model.size).toBe(PLACED_WALL_IDS.length);
    });
});
