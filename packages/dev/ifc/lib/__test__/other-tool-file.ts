export const WALL_A = "1WallAlongXGlobalId001";
export const WALL_B = "1WallAlongYGlobalId002";
export const STOREY_ROW = "#24=IFCBUILDINGSTOREY('0StoreyGlobalId0000003',$,'Level 1',$,$,#25,$,$,.ELEMENT.,0.);";

export const OTHER_TOOL_FILE = [
    "ISO-10303-21;",
    "HEADER;",
    "FILE_DESCRIPTION(('ViewDefinition [ReferenceView_V1.2]'),'2;1');",
    "FILE_NAME('exported.ifc','2026-10-07T09:00:00',('Architect'),('Office'),'An exporter','A modelling tool','');",
    "FILE_SCHEMA(('IFC4'));",
    "ENDSEC;",
    "DATA;",
    "#1=IFCPROJECT('0ProjectGlobalId000001',$,'Project',$,$,$,$,(#11),#5);",
    "#2=IFCSIUNIT(*,.LENGTHUNIT.,$,.METRE.);",
    "#3=IFCSIUNIT(*,.AREAUNIT.,$,.SQUARE_METRE.);",
    "#4=IFCSIUNIT(*,.PLANEANGLEUNIT.,$,.RADIAN.);",
    "#5=IFCUNITASSIGNMENT((#2,#3,#4));",
    "#10=IFCCARTESIANPOINT((0.,0.,0.));",
    "#12=IFCAXIS2PLACEMENT3D(#10,$,$);",
    "#11=IFCGEOMETRICREPRESENTATIONCONTEXT($,'Model',3,1.E-05,#12,$);",
    "#13=IFCGEOMETRICREPRESENTATIONSUBCONTEXT('Axis','Model',*,*,*,*,#11,$,.GRAPH_VIEW.,$);",
    "#14=IFCGEOMETRICREPRESENTATIONSUBCONTEXT('Body','Model',*,*,*,*,#11,$,.MODEL_VIEW.,$);",
    "#20=IFCSITE('0SiteGlobalId000000001',$,'Site',$,$,#21,$,$,.ELEMENT.,$,$,$,$,$);",
    "#21=IFCLOCALPLACEMENT($,#12);",
    "#22=IFCBUILDING('0BuildingGlobalId00002',$,'Building',$,$,#23,$,$,.ELEMENT.,$,$,$);",
    "#23=IFCLOCALPLACEMENT(#21,#12);",
    STOREY_ROW,
    "#25=IFCLOCALPLACEMENT(#23,#12);",
    "#26=IFCRELAGGREGATES('0Aggregates00000000001',$,$,$,#1,(#20));",
    "#27=IFCRELAGGREGATES('0Aggregates00000000002',$,$,$,#20,(#22));",
    "#28=IFCRELAGGREGATES('0Aggregates00000000003',$,$,$,#22,(#24));",
    "/* a wall along X, 6 m long and 0.3 m thick, its layers to the right of its axis */",
    "#30=IFCCARTESIANPOINT((0.,0.));",
    "#31=IFCCARTESIANPOINT((6.,0.));",
    "#32=IFCPOLYLINE((#30,#31));",
    "#33=IFCSHAPEREPRESENTATION(#13,'Axis','Curve2D',(#32));",
    "#35=IFCCARTESIANPOINT((3.,-0.15));",
    "#34=IFCAXIS2PLACEMENT2D(#35,$);",
    "#36=IFCRECTANGLEPROFILEDEF(.AREA.,$,#34,6.,0.3);",
    "#37=IFCDIRECTION((0.,0.,1.));",
    "#38=IFCEXTRUDEDAREASOLID(#36,#12,#37,3.);",
    "#39=IFCSHAPEREPRESENTATION(#14,'Body','SweptSolid',(#38));",
    "#40=IFCPRODUCTDEFINITIONSHAPE($,$,(#33,#39));",
    "#41=IFCLOCALPLACEMENT(#25,#12);",
    `#42=IFCWALLSTANDARDCASE('${WALL_A}',$,'Wall A',$,$,#41,#40,$,.STANDARD.);`,
    "#43=IFCMATERIALLAYER($,0.3,$,$,$,$,$);",
    "#44=IFCMATERIALLAYERSET((#43),'Wall 300',$);",
    "#45=IFCMATERIALLAYERSETUSAGE(#44,.AXIS2.,.NEGATIVE.,0.,$);",
    "#46=IFCRELASSOCIATESMATERIAL('0Associates00000000001',$,$,$,(#42,#56),#45);",
    "/* a wall along Y from the first wall's end, 4 m long */",
    "#47=IFCCARTESIANPOINT((4.,0.));",
    "#48=IFCPOLYLINE((#30,#47));",
    "#49=IFCSHAPEREPRESENTATION(#13,'Axis','Curve2D',(#48));",
    "#51=IFCCARTESIANPOINT((2.,-0.15));",
    "#50=IFCAXIS2PLACEMENT2D(#51,$);",
    "#52=IFCRECTANGLEPROFILEDEF(.AREA.,$,#50,4.,0.3);",
    "#53=IFCEXTRUDEDAREASOLID(#52,#12,#37,3.);",
    "#54=IFCSHAPEREPRESENTATION(#14,'Body','SweptSolid',(#53));",
    "#55=IFCPRODUCTDEFINITIONSHAPE($,$,(#49,#54));",
    `#56=IFCWALLSTANDARDCASE('${WALL_B}',$,'Wall B',$,$,#57,#55,$,.STANDARD.);`,
    "#58=IFCCARTESIANPOINT((6.,0.,0.));",
    "#59=IFCDIRECTION((0.,1.,0.));",
    "#60=IFCAXIS2PLACEMENT3D(#58,#37,#59);",
    "#57=IFCLOCALPLACEMENT(#25,#60);",
    "#61=IFCRELCONTAINEDINSPATIALSTRUCTURE('0Contains0000000000001',$,$,$,(#42,#56),#24);",
    "ENDSEC;",
    "END-ISO-10303-21;",
    "",
].join("\r\n");

function withRows(file: string, rows: readonly (readonly [string, string])[]): string {
    return rows.reduce((text, [row, replacement]) => {
        if (!text.includes(row)) {
            throw new Error(`The file has no row ${row}`);
        }
        return text.replace(row, replacement);
    }, file);
}

export const WALL_B_PLACED_APART_FROM_ITS_AXIS = withRows(OTHER_TOOL_FILE, [
    ["#47=IFCCARTESIANPOINT((4.,0.));", "#47=IFCCARTESIANPOINT((5.,0.));\r\n#62=IFCCARTESIANPOINT((1.,0.));"],
    ["#48=IFCPOLYLINE((#30,#47));", "#48=IFCPOLYLINE((#62,#47));"],
    ["#51=IFCCARTESIANPOINT((2.,-0.15));", "#51=IFCCARTESIANPOINT((3.,-0.15));"],
    ["#53=IFCEXTRUDEDAREASOLID(#52,#12,#37,3.);", "#63=IFCCARTESIANPOINT((0.,0.,0.5));\r\n#64=IFCAXIS2PLACEMENT3D(#63,$,$);\r\n#53=IFCEXTRUDEDAREASOLID(#52,#64,#37,3.);"],
    ["#58=IFCCARTESIANPOINT((6.,0.,0.));", "#58=IFCCARTESIANPOINT((6.,-1.,-0.5));"],
]);

export const WALL_B_AXIS_ALONG_ITS_PLACEMENT_Y = withRows(OTHER_TOOL_FILE, [
    ["#57=IFCLOCALPLACEMENT(#25,#60);", "#57=IFCLOCALPLACEMENT(#25,#12);"],
    ["#47=IFCCARTESIANPOINT((4.,0.));", "#47=IFCCARTESIANPOINT((6.,4.));"],
    ["#48=IFCPOLYLINE((#30,#47));", "#48=IFCPOLYLINE((#31,#47));"],
]);
