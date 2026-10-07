import { describe, expect, it } from "vitest";
import { NAMED_HEADER_LINES, PLACED_WALL_ROWS, placedWallModel, stepFile } from "../__test__/model-fixtures";
import { enumValue, ref } from "../step/values";
import { readModel, writeModel } from "./io";
import { IfcTransaction } from "./transaction";
import { upgradeToIfc4 } from "./upgrade";

const IFC2X3_HEADER_LINES = NAMED_HEADER_LINES.map((line) => line.replace("FILE_SCHEMA(('IFC4'));", "FILE_SCHEMA(('IFC2X3'));"));

const OLD_ROWS = [
    ...PLACED_WALL_ROWS.filter((row) => !row.startsWith("#20=")),
    "#20=IFCWALL('018qLdYQlDxm4ZHMU9gytl',$,'Wall',$,$,#10,$,$);",
    "#40=IFCFURNITURETYPE('2kGl5XY8n0EOhbX8oN7z6v',$,'Desk',$,$,$,$,$,$,$);",
    "#41=IFCPROPERTYSINGLEVALUE('Colour',$,$,$);",
    "#42=IFCPROPERTYSET('1cYLzQ3Bf2Eg$HqLQe7r$z',$,'Pset_Desk',$,(#41,#41));",
    "#43=IFCPERSON($,'Doe','Jane',$,$,$,$,$);",
    "#44=IFCACTOR('3Gm4c1F$X7rRYpYqG7yBlY',$,'Occupant',$,$,#43);",
    "#45=IFCRELOCCUPIESSPACES('0wJ7GtFJr5FfGQ4G2Y$rUu',$,$,$,(#20),$,#44,$);",
];

function oldFile(rows: readonly string[] = OLD_ROWS): string {
    return stepFile(IFC2X3_HEADER_LINES, rows);
}

describe("upgradeToIfc4", () => {
    it("should turn an IFC2X3 model into an editable IFC4 one, changing only the rows IFC4 reads differently", () => {
        // Arrange
        const old = readModel(oldFile());

        // Act
        const model = upgradeToIfc4(old);

        // Assert
        expect([model.schemaName, model.editable, old.editable]).toEqual(["IFC4", true, false]);
        expect(model.overlay.size).toBe(4);
        expect(model.entity(20).args).toHaveLength(9);
        expect(model.attribute(20, "PredefinedType")).toBeNull();
        expect(model.attribute(40, "AssemblyPlace")).toEqual(enumValue("NOTDEFINED"));
        expect(model.attribute(42, "HasProperties")).toEqual([ref(41)]);
        expect(model.entity(45).type).toBe("IfcRelAssignsToActor");
        expect(model.attribute(45, "RelatingActor")).toEqual(ref(44));
        expect(() => new IfcTransaction(model)).not.toThrow();
    });

    it("should write the rows it left alone as the file had them, under an IFC4 header", () => {
        // Arrange
        const model = upgradeToIfc4(readModel(oldFile()));

        // Act
        const text = writeModel(model, model.header);

        // Assert
        expect(text).toContain("FILE_SCHEMA(('IFC4'));");
        expect(text).toContain("#43=IFCPERSON($,'Doe','Jane',$,$,$,$,$);");
        expect(text).toContain("#20=IFCWALL('018qLdYQlDxm4ZHMU9gytl',$,'Wall',$,$,#10,$,$,$);");
        expect(text).toContain("#45=IFCRELASSIGNSTOACTOR(");
        expect(readModel(text).editable).toBe(true);
    });

    it("should keep a SET's distinct plain values, drop its repeats, and leave a row whose SET repeats nothing as the file had it", () => {
        // Arrange
        const old = readModel(oldFile([...OLD_ROWS, "#47=IFCRECURRENCEPATTERN(.WEEKLY.,$,(1,3,3,5),$,$,$,$,$);", "#48=IFCRECURRENCEPATTERN(.WEEKLY.,$,(2,4),$,$,$,$,$);"]));

        // Act
        const model = upgradeToIfc4(old);

        // Assert
        expect(model.attribute(47, "WeekdayComponent")).toEqual([1, 3, 5]);
        expect(model.attribute(48, "WeekdayComponent")).toEqual([2, 4]);
        expect(model.overlay.size).toBe(5);
    });

    it("should mark a value IFC4 derives as derived, and clear a derived mark where IFC4 takes an optional value", () => {
        // Arrange
        const old = readModel(oldFile([...OLD_ROWS, "#55=IFCSIUNIT($,.LENGTHUNIT.,$,.METRE.);", "#56=IFCPERSON($,'Roe',*,$,$,$,$,$);"]));

        // Act
        const model = upgradeToIfc4(old);

        // Assert
        expect(writeModel(model, model.header)).toContain("#55=IFCSIUNIT(*,.LENGTHUNIT.,$,.METRE.);");
        expect(model.attribute(56, "GivenName")).toBeNull();
    });

    it("should stop at a required enumeration the file leaves out when IFC4 gives it no NOTDEFINED", () => {
        // Arrange
        const model = readModel(oldFile([...OLD_ROWS, "#57=IFCSIUNIT(*,$,$,.METRE.);"]));

        // Act & Assert
        expect(() => upgradeToIfc4(model)).toThrow("#57 IfcSIUnit.UnitType is required by IFC4 and the file leaves it out, so the file cannot be upgraded");
    });

    it("should give an IFC4 model back as it is", () => {
        // Arrange
        const model = placedWallModel();

        // Act
        const upgraded = upgradeToIfc4(model);

        // Assert
        expect(upgraded).toBe(model);
    });

    it("should stop at an entity IFC4 has no counterpart for, and at a required value that is not an enumeration", () => {
        // Arrange
        const unknown = readModel(oldFile([...OLD_ROWS, "#50=IFCELECTRICALBASEPROPERTIES('3Gm4c1F$X7rRYpYqG7yBlZ',$,'E',$,$,$,$,$,$,$);"]));
        const missing = readModel(oldFile([...OLD_ROWS, "#51=IFCDIRECTION($);"]));

        // Act & Assert
        expect(() => upgradeToIfc4(unknown)).toThrow("#50 is an IFCELECTRICALBASEPROPERTIES, which IFC4 has no counterpart for, so the file cannot be upgraded");
        expect(() => upgradeToIfc4(missing)).toThrow("#51 IfcDirection.DirectionRatios is required by IFC4 and the file leaves it out, so the file cannot be upgraded");
    });

    it("should stop at a row with more values than IFC4 gives its entity", () => {
        // Arrange
        const model = readModel(oldFile([...OLD_ROWS, "#52=IFCDIRECTION((0.,0.,1.),$);"]));

        // Act & Assert
        expect(() => upgradeToIfc4(model)).toThrow("#52 gives 2 values where IFC4's IfcDirection takes 1, so the file cannot be upgraded");
    });
});
