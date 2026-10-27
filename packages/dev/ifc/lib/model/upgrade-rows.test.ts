import { describe, expect, it } from "vitest";
import { NAMED_HEADER_LINES, PLACED_WALL_ROWS, stepFile } from "../__test__/model-fixtures";
import { isGlobalId } from "./guid";
import { enumValue, ref } from "../step/values";
import { readModel, writeModel } from "./io";
import { IfcTransaction } from "./transaction";
import { upgradeToIfc4 } from "./upgrade";

const IFC2X3_HEADER_LINES = NAMED_HEADER_LINES.map((line) => line.replace("FILE_SCHEMA(('IFC4'));", "FILE_SCHEMA(('IFC2X3'));"));

const DATED_ROWS = [
    "#50=IFCCALENDARDATE(7,3,2024);",
    "#51=IFCCLASSIFICATION('Uniclass','2015',#50,'Uniclass 2015');",
    "#52=IFCLIBRARYINFORMATION('Library','1',$,#50,$);",
    "#53=IFCCOORDINATEDUNIVERSALTIMEOFFSET(2,30,.BEHIND.);",
    "#54=IFCLOCALTIME(9,5,7.25,#53,$);",
    "#55=IFCDATEANDTIME(#50,#54);",
    "#56=IFCLIBRARYINFORMATION('Library 2','1',$,#55,$);",
];

function oldFile(rows: readonly string[]): ReturnType<typeof readModel> {
    return readModel(stepFile(IFC2X3_HEADER_LINES, [...PLACED_WALL_ROWS, ...rows]));
}

describe("upgradeToIfc4 of what IFC4 writes differently", () => {
    it("should write IFC2X3's dates and times as IFC4's text and drop the rows that held them", () => {
        // Arrange
        const old = oldFile(DATED_ROWS);

        // Act
        const model = upgradeToIfc4(old);

        // Assert
        expect(model.attribute(51, "EditionDate")).toBe("2024-03-07");
        expect(model.attribute(52, "VersionDate")).toBe("2024-03-07T00:00:00");
        expect(model.attribute(56, "VersionDate")).toBe("2024-03-07T09:05:07.25-02:30");
        expect([50, 53, 54, 55].map((id) => model.has(id))).toEqual([false, false, false, false]);
        expect(writeModel(model, model.header)).not.toContain("IFCCALENDARDATE");
        expect(() => new IfcTransaction(model)).not.toThrow();
    });

    it("should refuse a date or time written where IFC4 takes no text, or a time where it takes a date", () => {
        // Arrange
        const listed = oldFile(["#50=IFCCALENDARDATE(7,3,2024);", "#57=IFCPROPERTYLISTVALUE('Dates',$,(#50),$);"]);
        const timeOnly = oldFile(["#54=IFCLOCALTIME(9,5,$,$,$);", "#51=IFCCLASSIFICATION('Uniclass','2015',#54,'Uniclass 2015');"]);

        // Act & Assert
        expect(() => upgradeToIfc4(listed)).toThrow("#57 refers to the IFC2X3 date or time #50 where IFC4 takes no text, so the file cannot be upgraded");
        expect(() => upgradeToIfc4(timeOnly)).toThrow("#51 EditionDate refers to the IFC2X3 date or time #54, which IFC4 has no place for there, so the file cannot be upgraded");
    });

    it("should give a virtual space boundary without an element a virtual element of its own, and refuse a physical one", () => {
        // Arrange
        const space = "#70=IFCSPACE('2SpaceGlobalId00000001',$,'Room',$,$,$,$,$,.ELEMENT.,.INTERNAL.,$);";
        const virtual = oldFile([space, "#71=IFCRELSPACEBOUNDARY('1BoundaryGlobalId00001',$,$,$,#70,$,$,.VIRTUAL.,.INTERNAL.);", "#72=IFCRELSPACEBOUNDARY('1BoundaryGlobalId00002',$,$,$,#70,$,$,.VIRTUAL.,.INTERNAL.);"]);
        const physical = oldFile([space, "#71=IFCRELSPACEBOUNDARY('1BoundaryGlobalId00001',$,$,$,#70,$,$,.PHYSICAL.,.INTERNAL.);"]);

        // Act
        const model = upgradeToIfc4(virtual);

        // Assert
        const elements = model.byType("IfcVirtualElement");
        expect(elements.map((element) => element.id)).toEqual([virtual.nextId, virtual.nextId + 1]);
        expect([model.attribute(71, "RelatedBuildingElement"), model.attribute(72, "RelatedBuildingElement")]).toEqual([ref(virtual.nextId), ref(virtual.nextId + 1)]);
        expect(elements.every((element) => typeof element.args[0] === "string" && isGlobalId(element.args[0]) && element.args[2] === "Virtual boundary")).toBe(true);
        expect(model.nextId).toBe(virtual.nextId + 2);
        expect(() => upgradeToIfc4(physical)).toThrow("#71 IfcRelSpaceBoundary.RelatedBuildingElement is required by IFC4 and the file leaves it out, so the file cannot be upgraded");
    });

    it("should write an enumeration value IFC4 renamed as user defined, naming it where the type is named, and keep a name the file gave", () => {
        // Arrange
        const old = oldFile(["#72=IFCTANKTYPE('3TankTypeGlobalId00001',$,'Tank',$,$,$,$,$,$,.SECTIONAL.);", "#73=IFCTANKTYPE('3TankTypeGlobalId00002',$,'Tank',$,$,$,$,$,'Panel tank',.PREFORMED.);", "#74=IFCTANKTYPE('3TankTypeGlobalId00003',$,'Tank',$,$,$,$,$,$,.EXPANSION.);"]);

        // Act
        const model = upgradeToIfc4(old);

        // Assert
        expect([model.attribute(72, "PredefinedType"), model.attribute(72, "ElementType")]).toEqual([enumValue("USERDEFINED"), "SECTIONAL"]);
        expect([model.attribute(73, "PredefinedType"), model.attribute(73, "ElementType")]).toEqual([enumValue("USERDEFINED"), "Panel tank"]);
        expect([model.attribute(74, "PredefinedType"), model.attribute(74, "ElementType")]).toEqual([enumValue("EXPANSION"), null]);
    });

    it("should write a currency as text, and drop the centres of gravity IFC4 no longer gives a profile", () => {
        // Arrange
        const old = oldFile(["#75=IFCMONETARYUNIT(.EUR.);", "#76=IFCLSHAPEPROFILEDEF(.AREA.,'L',$,100.,80.,8.,10.,5.,$,28.,20.);", "#77=IFCCSHAPEPROFILEDEF(.AREA.,'C',$,100.,50.,4.,15.,$,18.);"]);

        // Act
        const model = upgradeToIfc4(old);

        // Assert
        expect(model.attribute(75, "Currency")).toBe("EUR");
        expect(model.entity(76).args).toHaveLength(9);
        expect(model.attribute(76, "EdgeRadius")).toBe(5);
        expect(model.entity(77).args).toHaveLength(8);
        expect(model.attribute(77, "InternalFilletRadius")).toBeNull();
    });

    it("should drop the values IFC4 took off a control element and a transport element, keeping the transport element's kind", () => {
        // Arrange
        const old = oldFile(["#78=IFCDISTRIBUTIONCONTROLELEMENT('3ControlGlobalId000001',$,'Sensor',$,$,$,$,$,'S-1');", "#79=IFCTRANSPORTELEMENT('3TransportGlobalId0001',$,'Lift',$,$,$,$,$,.ELEVATOR.,630.,8.);"]);

        // Act
        const model = upgradeToIfc4(old);

        // Assert
        expect(model.entity(78).args).toHaveLength(8);
        expect(model.entity(79).args).toHaveLength(9);
        expect(model.attribute(79, "PredefinedType")).toEqual(enumValue("ELEVATOR"));
    });

    it("should leave out an empty list IFC4 wants at least one value in, and give a required list that may be empty the empty list", () => {
        // Arrange
        const old = oldFile(["#80=IFCPIPESEGMENTTYPE('3PipeTypeGlobalId00001',$,'Pipe',$,$,$,(),$,$,.RIGIDSEGMENT.);", "#81=IFCRELCONNECTSPATHELEMENTS('3PathGlobalId000000001',$,$,$,$,#20,#20,$,$,.ATSTART.,.ATEND.);"]);

        // Act
        const model = upgradeToIfc4(old);

        // Assert
        expect(model.attribute(80, "RepresentationMaps")).toBeNull();
        expect([model.attribute(81, "RelatingPriorities"), model.attribute(81, "RelatedPriorities")]).toEqual([[], []]);
    });

    it("should make a door style a door type and a window style a window type, keeping their operation, partitioning and precedence", () => {
        // Arrange
        const old = oldFile(["#82=IFCDOORSTYLE('3DoorStyleGlobalId0001',$,'Door 900',$,$,$,$,'D1',.SINGLE_SWING_LEFT.,.WOOD.,.T.,.F.);", "#83=IFCWINDOWSTYLE('3WindowStyleGlobalId01',$,'Window',$,$,$,$,$,.ALUMINIUM.,.DOUBLE_PANEL_VERTICAL.,.F.,.F.);"]);

        // Act
        const model = upgradeToIfc4(old);

        // Assert
        expect([model.entity(82).type, model.attribute(82, "Name"), model.attribute(82, "Tag"), model.attribute(82, "PredefinedType"), model.attribute(82, "OperationType"), model.attribute(82, "ParameterTakesPrecedence")]).toEqual(["IfcDoorType", "Door 900", "D1", enumValue("DOOR"), enumValue("SINGLE_SWING_LEFT"), true]);
        expect([model.entity(83).type, model.attribute(83, "PredefinedType"), model.attribute(83, "PartitioningType"), model.attribute(83, "ParameterTakesPrecedence")]).toEqual(["IfcWindowType", enumValue("WINDOW"), enumValue("DOUBLE_PANEL_VERTICAL"), false]);
    });

    it("should give a context a north of its own in the plan where the file points it in space, and none where it points straight up", () => {
        // Arrange
        const placement = ["#86=IFCCARTESIANPOINT((0.,0.,0.));", "#87=IFCAXIS2PLACEMENT3D(#86,$,$);"];
        const contexts = [
            "#84=IFCDIRECTION((-0.5,0.8,0.));", "#85=IFCGEOMETRICREPRESENTATIONCONTEXT($,'Model',3,1.E-05,#87,#84);",
            "#88=IFCDIRECTION((0.,0.,1.));", "#89=IFCGEOMETRICREPRESENTATIONCONTEXT($,'Model',3,1.E-05,#87,#88);",
            "#90=IFCDIRECTION((0.,1.));", "#91=IFCGEOMETRICREPRESENTATIONCONTEXT($,'Model',3,1.E-05,#87,#90);",
        ];
        const old = oldFile([...placement, ...contexts]);

        // Act
        const model = upgradeToIfc4(old);

        // Assert
        expect(model.attribute(85, "TrueNorth")).toEqual(ref(old.nextId));
        expect(model.attribute(old.nextId, "DirectionRatios")).toEqual([-0.5, 0.8]);
        expect(model.attribute(84, "DirectionRatios")).toEqual([-0.5, 0.8, 0]);
        expect(model.attribute(89, "TrueNorth")).toBeNull();
        expect([model.attribute(91, "TrueNorth"), model.overlay.has(91)]).toEqual([ref(90), false]);
    });

    it("should write a user defined type that names no type as not defined, and keep one that does", () => {
        // Arrange
        const old = oldFile(["#92=IFCCOLUMNTYPE('3ColumnTypeGlobalId001',$,'150x150',$,$,$,$,$,$,.USERDEFINED.);", "#93=IFCCOLUMNTYPE('3ColumnTypeGlobalId002',$,'Pier',$,$,$,$,$,'Pier',.USERDEFINED.);"]);

        // Act
        const model = upgradeToIfc4(old);

        // Assert
        expect([model.attribute(92, "PredefinedType"), model.attribute(93, "PredefinedType"), model.attribute(93, "ElementType")]).toEqual([enumValue("NOTDEFINED"), enumValue("USERDEFINED"), "Pier"]);
    });

    it("should make a faceted brep only surface models show a shell based surface model of its shells, and leave one a solid model shows", () => {
        // Arrange
        const shell = ["#100=IFCCARTESIANPOINT((0.,0.,0.));", "#101=IFCCARTESIANPOINT((1.,0.,0.));", "#102=IFCCARTESIANPOINT((0.,1.,0.));", "#103=IFCPOLYLOOP((#100,#101,#102));", "#104=IFCFACEOUTERBOUND(#103,.T.);", "#105=IFCFACE((#104));", "#106=IFCCLOSEDSHELL((#105));", "#107=IFCCLOSEDSHELL((#105));"];
        const context = ["#108=IFCAXIS2PLACEMENT3D(#100,$,$);", "#109=IFCGEOMETRICREPRESENTATIONCONTEXT($,'Model',3,1.E-05,#108,$);"];
        const items = [
            "#110=IFCFACETEDBREPWITHVOIDS(#106,(#107));", "#111=IFCSHAPEREPRESENTATION(#109,'Body','SurfaceModel',(#110));", "#112=IFCPRESENTATIONLAYERASSIGNMENT('Layer',$,(#110),$);",
            "#113=IFCFACETEDBREP(#106);", "#114=IFCSHAPEREPRESENTATION(#109,'Body','SurfaceModel',(#113));", "#115=IFCSHAPEREPRESENTATION(#109,'Body','Brep',(#113));",
        ];
        const old = oldFile([...shell, ...context, ...items]);

        // Act
        const model = upgradeToIfc4(old);

        // Assert
        expect([model.entity(110).type, model.attribute(110, "SbsmBoundary")]).toEqual(["IfcShellBasedSurfaceModel", [ref(106), ref(107)]]);
        expect([model.entity(113).type, model.overlay.has(113)]).toEqual(["IfcFacetedBrep", false]);
    });

    it("should leave a faceted brep a surface model shows as it is when a boolean uses it too", () => {
        // Arrange
        const shell = ["#100=IFCCARTESIANPOINT((0.,0.,0.));", "#101=IFCCARTESIANPOINT((1.,0.,0.));", "#102=IFCCARTESIANPOINT((0.,1.,0.));", "#103=IFCPOLYLOOP((#100,#101,#102));", "#104=IFCFACEOUTERBOUND(#103,.T.);", "#105=IFCFACE((#104));", "#106=IFCCLOSEDSHELL((#105));"];
        const context = ["#108=IFCAXIS2PLACEMENT3D(#100,$,$);", "#109=IFCGEOMETRICREPRESENTATIONCONTEXT($,'Model',3,1.E-05,#108,$);"];
        const items = ["#113=IFCFACETEDBREP(#106);", "#114=IFCSHAPEREPRESENTATION(#109,'Body','SurfaceModel',(#113));", "#116=IFCBOOLEANRESULT(.UNION.,#113,#113);", "#117=IFCSHAPEREPRESENTATION(#109,'Body','CSG',(#116));"];
        const old = oldFile([...shell, ...context, ...items]);

        // Act
        const model = upgradeToIfc4(old);

        // Assert
        expect([model.entity(113).type, model.overlay.has(113)]).toEqual(["IfcFacetedBrep", false]);
    });

    it("should stop at a profile with more values than IFC2X3 gave it too", () => {
        // Arrange
        const old = oldFile(["#76=IFCLSHAPEPROFILEDEF(.AREA.,'L',$,100.,80.,8.,10.,5.,$,28.,20.,1.);"]);

        // Act & Assert
        expect(() => upgradeToIfc4(old)).toThrow("#76 gives 12 values where IFC4's IfcLShapeProfileDef takes 9, so the file cannot be upgraded");
    });

    it("should date a change an owner history records by its creation when it gives no date of its own", () => {
        // Arrange
        const owner = ["#118=IFCPERSON($,'Doe',$,$,$,$,$,$);", "#119=IFCORGANIZATION($,'Office',$,$,$);", "#120=IFCPERSONANDORGANIZATION(#118,#119,$);", "#121=IFCAPPLICATION(#119,'1','App','App');"];
        const old = oldFile([...owner, "#116=IFCOWNERHISTORY(#120,#121,$,.ADDED.,$,$,$,1638365732);", "#117=IFCOWNERHISTORY(#120,#121,$,.NOCHANGE.,$,$,$,1638365732);", "#122=IFCOWNERHISTORY(#120,#121,$,.MODIFIED.,1700000000,$,$,1638365732);"]);

        // Act
        const model = upgradeToIfc4(old);

        // Assert
        expect([model.attribute(116, "LastModifiedDate"), model.attribute(117, "LastModifiedDate"), model.attribute(122, "LastModifiedDate")]).toEqual([1638365732, null, 1700000000]);
    });
});
