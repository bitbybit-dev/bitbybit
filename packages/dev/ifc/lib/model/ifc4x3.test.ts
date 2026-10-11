import { describe, expect, it } from "vitest";
import { BLANK_HEADER_LINES, stepFile } from "../__test__/model-fixtures";
import { IFCService } from "../api/ifc-service";

const ROAD_ROWS = [
    "#1=IFCPROJECT('0$9GJWJuaHqveC0mNeB3C1',$,'Road project',$,$,$,$,(#2),#20);",
    "#2=IFCGEOMETRICREPRESENTATIONCONTEXT($,'Model',3,1.E-05,#3,$);",
    "#3=IFCAXIS2PLACEMENT3D(#4,$,$);",
    "#4=IFCCARTESIANPOINT((0.,0.,0.));",
    "#20=IFCUNITASSIGNMENT((#21));",
    "#21=IFCSIUNIT(*,.LENGTHUNIT.,$,.METRE.);",
    "#30=IFCROAD('1hqIFTRjfV6AWq_bMtnZwI',$,'Main road',$,$,#31,$,$,.ELEMENT.,.NOTDEFINED.);",
    "#31=IFCLOCALPLACEMENT($,#3);",
    "#40=IFCRELAGGREGATES('2hqIFTRjfV6AWq_bMtnZwI',$,$,$,#1,(#30));",
    "#50=IFCCOURSE('3hqIFTRjfV6AWq_bMtnZwI',$,'Wearing course',$,$,#31,#60,$,.ARMOUR.);",
    "#60=IFCPRODUCTDEFINITIONSHAPE($,$,(#61));",
    "#61=IFCSHAPEREPRESENTATION(#2,'Body','SweptSolid',(#62));",
    "#62=IFCEXTRUDEDAREASOLID(#63,$,#65,0.2);",
    "#63=IFCRECTANGLEPROFILEDEF(.AREA.,$,$,10.,3.);",
    "#65=IFCDIRECTION((0.,0.,1.));",
    "#70=IFCRELCONTAINEDINSPATIALSTRUCTURE('4hqIFTRjfV6AWq_bMtnZwI',$,$,$,(#50),#30);",
];

function roadFile(schema: string): string {
    return stepFile(BLANK_HEADER_LINES.map((line) => line.replace("FILE_SCHEMA(('IFC4'))", `FILE_SCHEMA(('${schema}'))`)), ROAD_ROWS);
}

describe("an IFC4X3 model", () => {
    it("should read the entities IFC 4.3 added, count and build them, and write the file back as it was", () => {
        // Arrange
        const ifc = new IFCService();
        const text = roadFile("IFC4X3_ADD2");

        // Act
        const model = ifc.model.read({ data: text });
        const summary = ifc.model.summary({ model });
        const { roots } = ifc.geometry.recipe({ model });

        // Assert
        expect([summary.schema, summary.editable, summary.elementCounts]).toEqual(["IFC4X3_ADD2", false, { IfcCourse: 1 }]);
        expect(ifc.model.elements({ model, type: "IfcElement" })).toEqual([{ globalId: "3hqIFTRjfV6AWq_bMtnZwI", type: "IfcCourse", name: "Wearing course", storey: "1hqIFTRjfV6AWq_bMtnZwI" }]);
        expect(roots.map((root) => root.tag["type"])).toEqual(["IfcCourse"]);
        const written = ifc.model.write({ model });
        expect(written.slice(written.indexOf("DATA;"))).toBe(text.slice(text.indexOf("DATA;")));
    });

    it("should be shown and queried but not changed, since changes are made to IFC4 models", () => {
        // Arrange
        const ifc = new IFCService();
        const model = ifc.model.read({ data: roadFile("IFC4X3_ADD2") });

        // Act & Assert
        expect(() => ifc.model.setAttribute({ model, element: "3hqIFTRjfV6AWq_bMtnZwI", attribute: "Name", value: "Binder course" })).toThrow("This IFC4X3_ADD2 model can be shown and queried but not changed; changes are made to IFC4 models");
        expect(() => ifc.model.upgradeToIfc4({ model })).toThrow("Only an IFC2X3 model is upgraded to IFC4, and this one is IFC4X3_ADD2");
    });

    it("should read a file naming the bare IFC4X3 through the IFC4X3 ADD2 table", () => {
        // Arrange
        const ifc = new IFCService();

        // Act
        const summary = ifc.model.summary({ model: ifc.model.read({ data: roadFile("IFC4X3") }) });

        // Assert
        expect([summary.schema, summary.editable, summary.elementCounts]).toEqual(["IFC4X3", false, { IfcCourse: 1 }]);
    });
});
