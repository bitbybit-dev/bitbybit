import { describe, expect, it } from "vitest";
import { ifcFile } from "../__test__/model-fixtures";
import { IFCService } from "../api/ifc-service";
import { decimalDegrees } from "./georeference";

const PROJECT_ROWS = [
    "#1=IFCPROJECT('0$9GJWJuaHqveC0mNeB3C1',$,'Project',$,$,$,$,(#2,#9),$);",
    "#2=IFCGEOMETRICREPRESENTATIONCONTEXT($,'Model',3,1.E-05,#3,$);",
    "#3=IFCAXIS2PLACEMENT3D(#4,$,$);",
    "#4=IFCCARTESIANPOINT((0.,0.,0.));",
    "#9=IFCGEOMETRICREPRESENTATIONCONTEXT($,'Plan',2,1.E-05,#3,$);",
];

describe("IFCModels.georeference", () => {
    it("should read the model context's map conversion with its CRS, and the site's latitude, longitude and elevation", () => {
        // Arrange
        const ifc = new IFCService();
        const model = ifc.model.read({
            data: ifcFile([
                ...PROJECT_ROWS,
                "#5=IFCPROJECTEDCRS('EPSG:3301','Estonian Coordinate System of 1997',$,$,$,$,$);",
                "#6=IFCPROJECTEDCRS('EPSG:4326',$,$,$,$,$,$);",
                "#7=IFCMAPCONVERSION(#9,#6,1.,2.,3.,$,$,$);",
                "#8=IFCMAPCONVERSION(#2,#5,538477.5,6591597.25,12.5,0.8,0.6,0.999);",
                "#10=IFCSITE('1hqIFTRjfV6AWq_bMtnZwI',$,'Site',$,$,$,$,$,.ELEMENT.,(59,26,12,500000),(24,44,30),35.5,$,$);",
            ]),
        });

        // Act
        const georeference = ifc.model.georeference({ model });

        // Assert
        expect(georeference).toEqual({
            mapped: true,
            crs: "EPSG:3301",
            eastings: 538477.5,
            northings: 6591597.25,
            orthogonalHeight: 12.5,
            xAxisAbscissa: 0.8,
            xAxisOrdinate: 0.6,
            scale: 0.999,
            located: true,
            latitude: 59 + 26 / 60 + 12.5 / 3600,
            longitude: 24 + 44 / 60 + 30 / 3600,
            elevation: 35.5,
        });
    });

    it("should give the defaults, unmapped and unlocated, for a model without a map conversion or a site position", () => {
        // Arrange
        const ifc = new IFCService();
        const model = ifc.model.read({ data: ifcFile([...PROJECT_ROWS, "#10=IFCSITE('1hqIFTRjfV6AWq_bMtnZwI',$,'Site',$,$,$,$,$,.ELEMENT.,(59,26,12),$,$,$,$);"]) });

        // Act
        const georeference = ifc.model.georeference({ model });

        // Assert
        expect(georeference).toEqual({ mapped: false, crs: "", eastings: 0, northings: 0, orthogonalHeight: 0, xAxisAbscissa: 1, xAxisOrdinate: 0, scale: 1, located: false, latitude: 0, longitude: 0, elevation: 0 });
    });

    it("should take a map conversion's optional values as their defaults, and the first conversion when none is the model context's", () => {
        // Arrange
        const ifc = new IFCService();
        const model = ifc.model.read({ data: ifcFile([...PROJECT_ROWS, "#6=IFCPROJECTEDCRS('EPSG:4326',$,$,$,$,$,$);", "#7=IFCMAPCONVERSION(#9,#6,1.,2.,3.,$,$,$);"]) });

        // Act
        const georeference = ifc.model.georeference({ model });

        // Assert
        expect(georeference).toMatchObject({ mapped: true, crs: "EPSG:4326", eastings: 1, northings: 2, orthogonalHeight: 3, xAxisAbscissa: 1, xAxisOrdinate: 0, scale: 1 });
    });
});

describe("decimalDegrees", () => {
    it("should add a compound angle's degrees, minutes, seconds and millionths, all negative to the south and west", () => {
        // Act
        const south = decimalDegrees([-33, -52, -4, -200000]);

        // Assert
        expect(south).toBeCloseTo(-(33 + 52 / 60 + 4.2 / 3600), 12);
    });

    it("should read nothing from a value that is not a list of at least three numbers", () => {
        // Assert
        expect([decimalDegrees(null), decimalDegrees([59, 26]), decimalDegrees([59, 26, "x"])]).toEqual([undefined, undefined, undefined]);
    });
});
