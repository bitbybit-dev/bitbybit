import { OTHER_TOOL_FILE } from "./other-tool-file";

export const OWNER_ROWS = [
    "#900=IFCPERSON($,'Doe','Jane',$,$,$,$,$);",
    "#901=IFCORGANIZATION($,'Office',$,$,$);",
    "#902=IFCPERSONANDORGANIZATION(#900,#901,$);",
    "#903=IFCORGANIZATION($,'A tool maker',$,$,$);",
    "#904=IFCAPPLICATION(#903,'1.0','A modelling tool','AMT');",
    "#906=IFCOWNERHISTORY(#902,#904,$,.NOCHANGE.,$,$,$,1700000000);",
];

export function ownedFile(rows: readonly string[] = OWNER_ROWS): string {
    return OTHER_TOOL_FILE
        .replace("DATA;", `DATA;\r\n${rows.join("\r\n")}`)
        .replace(/^(#\d+=IFC[A-Z]+\('[0-9A-Za-z_$]{22}'),\$,/gm, "$1,#906,");
}
