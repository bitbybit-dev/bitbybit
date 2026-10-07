import type { IfcModel } from "../model/model-types";
import { readModel } from "../model/io";

const HEADER = [
    "ISO-10303-21;",
    "HEADER;",
    "FILE_DESCRIPTION((''),'2;1');",
    "FILE_NAME('','',(''),(''),'','','');",
    "FILE_SCHEMA(('IFC4'));",
    "ENDSEC;",
    "DATA;",
];

export const CONTEXT_ROWS = [
    "#1=IFCCARTESIANPOINT((0.,0.,0.));",
    "#2=IFCAXIS2PLACEMENT3D(#1,$,$);",
    "#3=IFCGEOMETRICREPRESENTATIONCONTEXT($,'Model',3,0.001,#2,$);",
    "#4=IFCGEOMETRICREPRESENTATIONSUBCONTEXT('Body','Model',*,*,*,*,#3,$,.MODEL_VIEW.,$);",
    "#5=IFCLOCALPLACEMENT($,#2);",
];

export function modelOfRows(rows: readonly string[]): IfcModel {
    return readModel([...HEADER, ...rows, "ENDSEC;", "END-ISO-10303-21;", ""].join("\n"));
}

export function withContext(rows: readonly string[]): IfcModel {
    return modelOfRows([...CONTEXT_ROWS, ...rows]);
}

export function productRows(id: number, globalId: string, items: string, placement = "#5", type = "IFCBUILDINGELEMENTPROXY"): string[] {
    return [
        `#${id}=IFCSHAPEREPRESENTATION(#4,'Body','SweptSolid',(${items}));`,
        `#${id + 1}=IFCPRODUCTDEFINITIONSHAPE($,$,(#${id}));`,
        `#${id + 2}=${type}('${globalId}',$,'${globalId}',$,$,${placement},#${id + 1},$,$);`,
    ];
}
