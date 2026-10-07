import { describe, expect, it } from "vitest";
import { indexStep } from "./file-index";
import type { IfcFileHeader, StepHeaderEntity } from "./step-types";
import { encodeHeader, headerFromEntities } from "./header";

const COMPLETE_ENTITIES: readonly StepHeaderEntity[] = [
    { offset: 0, text: "", type: "FILE_DESCRIPTION", args: [["ViewDefinition [ReferenceView_V1.2]", "Comment"], "2;1"] },
    { offset: 0, text: "", type: "FILE_NAME", args: ["wall.ifc", "2026-10-06T12:00:00", ["Ada"], ["Bit By Bit Developers"], "bitbybit 1.4.1", "Example CAD", "Grace"] },
    { offset: 0, text: "", type: "FILE_SCHEMA", args: [["IFC4"]] },
];

const COMPLETE_HEADER: IfcFileHeader = {
    description: ["ViewDefinition [ReferenceView_V1.2]", "Comment"],
    implementationLevel: "2;1",
    name: "wall.ifc",
    timeStamp: "2026-10-06T12:00:00",
    author: ["Ada"],
    organization: ["Bit By Bit Developers"],
    preprocessorVersion: "bitbybit 1.4.1",
    originatingSystem: "Example CAD",
    authorization: "Grace",
    schemaIdentifiers: ["IFC4"],
};

const EMPTY_HEADER: IfcFileHeader = {
    description: [],
    implementationLevel: "2;1",
    name: "",
    timeStamp: "",
    author: [],
    organization: [],
    preprocessorVersion: "",
    originatingSystem: "",
    authorization: "",
    schemaIdentifiers: [],
};

describe("headerFromEntities", () => {
    it("should read every field of a complete header", () => {
        // Act
        const header = headerFromEntities(COMPLETE_ENTITIES);

        // Assert
        expect(header).toEqual(COMPLETE_HEADER);
    });

    it("should read the entities in any order", () => {
        // Act
        const header = headerFromEntities([...COMPLETE_ENTITIES].reverse());

        // Assert
        expect(header).toEqual(COMPLETE_HEADER);
    });

    it("should fall back to empty texts, empty lists and the level 2;1 when the header has no entities", () => {
        // Act
        const header = headerFromEntities([]);

        // Assert
        expect(header).toEqual(EMPTY_HEADER);
    });

    it("should fill in only what the entities that are present hold", () => {
        // Act
        const header = headerFromEntities([{ offset: 0, text: "", type: "FILE_SCHEMA", args: [["IFC4X3_ADD2"]] }]);

        // Assert
        expect(header).toEqual({ ...EMPTY_HEADER, schemaIdentifiers: ["IFC4X3_ADD2"] });
    });

    it("should read unset values as empty texts and empty lists", () => {
        // Arrange
        const unset: StepHeaderEntity[] = [
            { offset: 0, text: "", type: "FILE_DESCRIPTION", args: [null, null] },
            { offset: 0, text: "", type: "FILE_NAME", args: [null, null, null, null, null, null, null] },
        ];

        // Act
        const header = headerFromEntities(unset);

        // Assert
        expect(header).toEqual(EMPTY_HEADER);
    });

    it("should fall back to the level 2;1 when the file gives an empty one", () => {
        // Act
        const header = headerFromEntities([{ offset: 0, text: "", type: "FILE_DESCRIPTION", args: [["ViewDefinition [CoordinationView]"], ""] }]);

        // Assert
        expect(header.implementationLevel).toBe("2;1");
    });

    it("should keep an implementation level the file gives", () => {
        // Act
        const header = headerFromEntities([{ offset: 0, text: "", type: "FILE_DESCRIPTION", args: [[], "2;2"] }]);

        // Assert
        expect(header.implementationLevel).toBe("2;2");
    });

    it("should keep only the texts of a list that holds other values too", () => {
        // Act
        const header = headerFromEntities([{ offset: 0, text: "", type: "FILE_NAME", args: ["a.ifc", "", ["Ada", null, 5, { ref: 1 }, "Grace"], [], "", "", ""] }]);

        // Assert
        expect(header.author).toEqual(["Ada", "Grace"]);
    });

    it("should read a text where a list belongs as an empty list, and a list where a text belongs as an empty text", () => {
        // Act
        const header = headerFromEntities([{ offset: 0, text: "", type: "FILE_NAME", args: [["a.ifc"], "", "Ada", [], "", "", ""] }]);

        // Assert
        expect([header.name, header.author]).toEqual(["", []]);
    });

    it("should ignore header entities it does not know", () => {
        // Act
        const header = headerFromEntities([{ offset: 0, text: "", type: "FILE_POPULATION", args: ["IFC4", "x", ["y"]] }, ...COMPLETE_ENTITIES]);

        // Assert
        expect(header).toEqual(COMPLETE_HEADER);
    });
});

describe("encodeHeader", () => {
    it("should write the header section line by line", () => {
        // Act
        const text = encodeHeader(COMPLETE_HEADER);

        // Assert
        expect(text).toBe([
            "ISO-10303-21;",
            "HEADER;",
            "FILE_DESCRIPTION(('ViewDefinition [ReferenceView_V1.2]','Comment'),'2;1');",
            "FILE_NAME('wall.ifc','2026-10-06T12:00:00',('Ada'),('Bit By Bit Developers'),'bitbybit 1.4.1','Example CAD','Grace');",
            "FILE_SCHEMA(('IFC4'));",
            "ENDSEC;",
        ].join("\n"));
    });

    it("should write an empty list as a list of one empty text", () => {
        // Act
        const text = encodeHeader(EMPTY_HEADER);

        // Assert
        expect(text).toBe([
            "ISO-10303-21;",
            "HEADER;",
            "FILE_DESCRIPTION((''),'2;1');",
            "FILE_NAME('','',(''),(''),'','','');",
            "FILE_SCHEMA((''));",
            "ENDSEC;",
        ].join("\n"));
    });

    it("should escape the texts it writes", () => {
        // Act
        const text = encodeHeader({ ...COMPLETE_HEADER, name: "O'Brien's wall.ifc", organization: ["Bürger"] });

        // Assert
        expect(text).toContain("FILE_NAME('O''Brien''s wall.ifc','2026-10-06T12:00:00',('Ada'),('B\\X2\\00FC\\X0\\rger'),");
    });

    it("should read back through indexStep and headerFromEntities as the header it wrote", () => {
        // Arrange
        const header: IfcFileHeader = { ...COMPLETE_HEADER, name: "O'Brien's wall.ifc", organization: ["Bürger", "Ünïcödé 😀"] };
        const file = `${encodeHeader(header)}\nDATA;\nENDSEC;\nEND-ISO-10303-21;\n`;

        // Act
        const back = headerFromEntities(indexStep(new TextEncoder().encode(file)).header);

        // Assert
        expect(back).toEqual(header);
    });
});
