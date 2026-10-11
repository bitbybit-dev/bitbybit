import type { IfcFileHeader } from "../step/step-types";
import { emptyModel, readModel } from "../model/io";
import type { ModelSnapshot } from "../model/snapshot";

export const PROJECT_GLOBAL_ID = "0$9GJWJuaHqveC0mNeB3C1";
export const WALL_GLOBAL_ID = "018qLdYQlDxm4ZHMU9gytl";

export const BLANK_HEADER: IfcFileHeader = {
    description: [""],
    implementationLevel: "2;1",
    name: "",
    timeStamp: "",
    author: [""],
    organization: [""],
    preprocessorVersion: "",
    originatingSystem: "",
    authorization: "",
    schemaIdentifiers: ["IFC4"],
};

export const BLANK_HEADER_LINES: readonly string[] = [
    "ISO-10303-21;",
    "HEADER;",
    "FILE_DESCRIPTION((''),'2;1');",
    "FILE_NAME('','',(''),(''),'','','');",
    "FILE_SCHEMA(('IFC4'));",
    "ENDSEC;",
];

export const NAMED_HEADER: IfcFileHeader = {
    description: ["ViewDefinition [ReferenceView_V1.2]"],
    implementationLevel: "2;1",
    name: "model.ifc",
    timeStamp: "2026-10-06T00:00:00",
    author: ["Author"],
    organization: ["Org"],
    preprocessorVersion: "pre",
    originatingSystem: "orig",
    authorization: "auth",
    schemaIdentifiers: ["IFC4"],
};

export const NAMED_HEADER_LINES: readonly string[] = [
    "ISO-10303-21;",
    "HEADER;",
    "FILE_DESCRIPTION(('ViewDefinition [ReferenceView_V1.2]'),'2;1');",
    "FILE_NAME('model.ifc','2026-10-06T00:00:00',('Author'),('Org'),'pre','orig','auth');",
    "FILE_SCHEMA(('IFC4'));",
    "ENDSEC;",
];

export const PLACED_WALL_ROWS: readonly string[] = [
    "#5=IFCCARTESIANPOINT((0.,0.,0.));",
    "#2=IFCDIRECTION((0.,0.,1.));",
    "#6=IFCCARTESIANPOINT((1.,0.,0.));",
    "#3=IFCAXIS2PLACEMENT3D(#5,#2,$);",
    "#10=IFCLOCALPLACEMENT($,#3);",
    `#1=IFCPROJECT('${PROJECT_GLOBAL_ID}',$,'Project',$,$,$,$,$,$);`,
    `#20=IFCWALL('${WALL_GLOBAL_ID}',$,'Wall',$,$,#10,$,$,.STANDARD.);`,
    "#30=IFCPOLYLINE((#5,#6,#5));",
];

export const PLACED_WALL_IDS: readonly number[] = [5, 2, 6, 3, 10, 1, 20, 30];

export function stepFile(headerLines: readonly string[], rows: readonly string[]): string {
    return [...headerLines, "DATA;", ...rows, "ENDSEC;", "END-ISO-10303-21;", ""].join("\n");
}

export function ifcFile(rows: readonly string[]): string {
    return stepFile(NAMED_HEADER_LINES, rows);
}

export function placedWallModel(): ModelSnapshot {
    return readModel(ifcFile(PLACED_WALL_ROWS));
}

export function emptyIfc4Model(): ModelSnapshot {
    return emptyModel("IFC4", BLANK_HEADER);
}
