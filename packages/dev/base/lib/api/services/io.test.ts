import { IoBitByBit } from "./io";
import * as Inputs from "../inputs";

describe("IO unit tests", () => {

    let io: IoBitByBit;

    beforeEach(() => {
        io = new IoBitByBit();
    });

    describe("DXF Segment Helpers", () => {
        
        it("should return line segment unchanged", () => {
            const segment = new Inputs.IO.DxfLineSegmentDto([0, 0], [10, 10]);
            const result = io.dxf.lineSegment(segment);
            
            expect(result).toBe(segment);
            expect(result.start).toEqual([0, 0]);
            expect(result.end).toEqual([10, 10]);
        });

        it("should return arc segment unchanged", () => {
            const segment = new Inputs.IO.DxfArcSegmentDto([50, 50], 25, 0, 90);
            const result = io.dxf.arcSegment(segment);
            
            expect(result).toBe(segment);
            expect(result.center).toEqual([50, 50]);
            expect(result.radius).toBe(25);
            expect(result.startAngle).toBe(0);
            expect(result.endAngle).toBe(90);
        });

        it("should return circle segment unchanged", () => {
            const segment = new Inputs.IO.DxfCircleSegmentDto([100, 100], 50);
            const result = io.dxf.circleSegment(segment);
            
            expect(result).toBe(segment);
            expect(result.center).toEqual([100, 100]);
            expect(result.radius).toBe(50);
        });

        it("should return polyline segment unchanged", () => {
            const points: Inputs.Base.Point2[] = [[0, 0], [10, 0], [10, 10]];
            const segment = new Inputs.IO.DxfPolylineSegmentDto(points, false);
            const result = io.dxf.polylineSegment(segment);
            
            expect(result).toBe(segment);
            expect(result.points).toEqual(points);
            expect(result.closed).toBe(false);
        });

        it("should return spline segment unchanged", () => {
            const controlPoints: Inputs.Base.Point2[] = [[0, 0], [5, 10], [10, 0]];
            const segment = new Inputs.IO.DxfSplineSegmentDto(controlPoints, 3, false);
            const result = io.dxf.splineSegment(segment);
            
            expect(result).toBe(segment);
            expect(result.controlPoints).toEqual(controlPoints);
            expect(result.degree).toBe(3);
            expect(result.closed).toBe(false);
        });
    });

    describe("DXF Path and Part Helpers", () => {
        
        it("should return path unchanged", () => {
            const lineSegment = new Inputs.IO.DxfLineSegmentDto([0, 0], [10, 10]);
            const path = new Inputs.IO.DxfPathDto([lineSegment]);
            const result = io.dxf.path(path);
            
            expect(result).toBe(path);
            expect(result.segments).toHaveLength(1);
        });

        it("should return paths part unchanged", () => {
            const lineSegment = new Inputs.IO.DxfLineSegmentDto([0, 0], [10, 10]);
            const path = new Inputs.IO.DxfPathDto([lineSegment]);
            const part = new Inputs.IO.DxfPathsPartDto("TestLayer", "#FF0000", [path]);
            const result = io.dxf.pathsPart(part);
            
            expect(result).toBe(part);
            expect(result.layer).toBe("TestLayer");
            expect(result.color).toBe("#FF0000");
            expect(result.paths).toHaveLength(1);
        });
    });

    describe("DxfCreate - Basic Entities", () => {
        
        it("should generate a basic DXF with single line in AC1009 format by default", () => {
            const lineSegment = new Inputs.IO.DxfLineSegmentDto([0, 0], [10, 10]);
            const path = new Inputs.IO.DxfPathDto([lineSegment]);
            const part = new Inputs.IO.DxfPathsPartDto("0", "#000000", [path]);
            const model = new Inputs.IO.DxfModelDto([part]);

            const result = io.dxf.dxfCreate(model);

            expect(typeof result).toBe("string");
            expect(result.length).toBeGreaterThan(0);
            expect(result).toContain("0\nSECTION\n2\nHEADER");
            expect(result).toContain("$ACADVER\n1\nAC1009");
            expect(result).toContain("$DWGCODEPAGE\n3\nascii");
            expect(result).toContain("0\nSECTION\n2\nTABLES");
            expect(result).toContain("0\nSECTION\n2\nBLOCKS");
            expect(result).toContain("0\nSECTION\n2\nENTITIES");
            expect(result).toContain("0\nLINE");
            expect(result).toContain("0\nEOF");
            expect(result).toContain("10\n0.000000\n20\n0.000000");
            expect(result).toContain("11\n10.000000\n21\n10.000000");
        });

        it("should generate DXF with AC1015 format when specified", () => {
            const lineSegment = new Inputs.IO.DxfLineSegmentDto([0, 0], [10, 10]);
            const path = new Inputs.IO.DxfPathDto([lineSegment]);
            const part = new Inputs.IO.DxfPathsPartDto("0", "#000000", [path]);
            const model = new Inputs.IO.DxfModelDto([part], "aci", "AC1015");

            const result = io.dxf.dxfCreate(model);

            expect(result).toContain("$ACADVER\n1\nAC1015");
            expect(result).toContain("$LASTSAVEDBY\n1\nbitbybit.dev");
            expect(result).toContain("$DWGCODEPAGE\n3\nANSI_1252");
            expect(result).toContain("100\nAcDbEntity");
            expect(result).toContain("100\nAcDbLine");
        });

        it("should generate DXF with circle", () => {
            const circleSegment = new Inputs.IO.DxfCircleSegmentDto([50, 50], 25);
            const path = new Inputs.IO.DxfPathDto([circleSegment]);
            const part = new Inputs.IO.DxfPathsPartDto("Circles", "1", [path]);
            const model = new Inputs.IO.DxfModelDto([part]);

            const result = io.dxf.dxfCreate(model);

            expect(result).toContain("0\nCIRCLE");
            expect(result).toContain("8\nCircles");
            expect(result).toContain("10\n50.000000\n20\n50.000000");
            expect(result).toContain("40\n25.000000");
        });

        it("should generate DXF with arc", () => {
            const arcSegment = new Inputs.IO.DxfArcSegmentDto([100, 100], 50, 0, 90);
            const path = new Inputs.IO.DxfPathDto([arcSegment]);
            const part = new Inputs.IO.DxfPathsPartDto("Arcs", "2", [path]);
            const model = new Inputs.IO.DxfModelDto([part]);

            const result = io.dxf.dxfCreate(model);

            expect(result).toContain("0\nARC");
            expect(result).toContain("8\nArcs");
            expect(result).toContain("10\n100.000000\n20\n100.000000");
            expect(result).toContain("40\n50.000000");
            expect(result).toContain("50\n0.000000");
            expect(result).toContain("51\n90.000000");
        });

        it("should generate DXF with closed polyline", () => {
            const points: Inputs.Base.Point2[] = [[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]];
            const polylineSegment = new Inputs.IO.DxfPolylineSegmentDto(points, true);
            const path = new Inputs.IO.DxfPathDto([polylineSegment]);
            const part = new Inputs.IO.DxfPathsPartDto("Polylines", "3", [path]);
            const model = new Inputs.IO.DxfModelDto([part]);

            const result = io.dxf.dxfCreate(model);

            expect(result).toContain("0\nLWPOLYLINE");
            expect(result).toContain("8\nPolylines");
            expect(result).toContain("90\n5");
            expect(result).toContain("70\n1");
        });

        it("should generate DXF with open polyline", () => {
            const points: Inputs.Base.Point2[] = [[0, 0], [5, 5], [10, 0]];
            const polylineSegment = new Inputs.IO.DxfPolylineSegmentDto(points, false);
            const path = new Inputs.IO.DxfPathDto([polylineSegment]);
            const part = new Inputs.IO.DxfPathsPartDto("0", "#000000", [path]);
            const model = new Inputs.IO.DxfModelDto([part]);

            const result = io.dxf.dxfCreate(model);

            expect(result).toContain("90\n3");
            expect(result).toContain("70\n0");
        });

        it("should generate DXF with spline", () => {
            const controlPoints: Inputs.Base.Point2[] = [[0, 0], [5, 10], [10, 10], [15, 0]];
            const splineSegment = new Inputs.IO.DxfSplineSegmentDto(controlPoints, 3, false);
            const path = new Inputs.IO.DxfPathDto([splineSegment]);
            const part = new Inputs.IO.DxfPathsPartDto("Splines", "4", [path]);
            const model = new Inputs.IO.DxfModelDto([part]);

            const result = io.dxf.dxfCreate(model);

            expect(result).toContain("0\nSPLINE");
            expect(result).toContain("8\nSplines");
            expect(result).toContain("71\n3");
            expect(result).toContain("73\n4");
        });
    });

    describe("DxfCreate - Mixed Segment Types", () => {
        
        it("should generate DXF with mixed segment types in a path", () => {
            const line = new Inputs.IO.DxfLineSegmentDto([0, 0], [10, 0]);
            const arc = new Inputs.IO.DxfArcSegmentDto([10, 5], 5, -90, 90);
            const circle = new Inputs.IO.DxfCircleSegmentDto([20, 5], 3);
            
            const path = new Inputs.IO.DxfPathDto([line, arc, circle]);
            const part = new Inputs.IO.DxfPathsPartDto("MixedPath", "1", [path]);
            const model = new Inputs.IO.DxfModelDto([part]);

            const result = io.dxf.dxfCreate(model);

            expect(result).toContain("0\nLINE");
            expect(result).toContain("0\nARC");
            expect(result).toContain("0\nCIRCLE");
        });

        it("should generate a wire-like path with connected lines and arcs", () => {
            const bottomLine = new Inputs.IO.DxfLineSegmentDto([5, 0], [15, 0]);
            const bottomRightArc = new Inputs.IO.DxfArcSegmentDto([15, 5], 5, -90, 0);
            const rightLine = new Inputs.IO.DxfLineSegmentDto([20, 5], [20, 15]);
            const topRightArc = new Inputs.IO.DxfArcSegmentDto([15, 15], 5, 0, 90);
            const topLine = new Inputs.IO.DxfLineSegmentDto([15, 20], [5, 20]);
            const topLeftArc = new Inputs.IO.DxfArcSegmentDto([5, 15], 5, 90, 180);
            const leftLine = new Inputs.IO.DxfLineSegmentDto([0, 15], [0, 5]);
            const bottomLeftArc = new Inputs.IO.DxfArcSegmentDto([5, 5], 5, 180, 270);
            
            const path = new Inputs.IO.DxfPathDto([
                bottomLine, bottomRightArc, rightLine, topRightArc,
                topLine, topLeftArc, leftLine, bottomLeftArc
            ]);
            const part = new Inputs.IO.DxfPathsPartDto("RoundedRect", "1", [path]);
            const model = new Inputs.IO.DxfModelDto([part]);

            const result = io.dxf.dxfCreate(model);

            const lineMatches = result.match(/0\nLINE/g);
            const arcMatches = result.match(/0\nARC/g);
            expect(lineMatches).toHaveLength(4);
            expect(arcMatches).toHaveLength(4);
        });

        it("should generate path with all segment types", () => {
            const line = new Inputs.IO.DxfLineSegmentDto([0, 0], [10, 0]);
            const arc = new Inputs.IO.DxfArcSegmentDto([15, 0], 5, 180, 270);
            const circle = new Inputs.IO.DxfCircleSegmentDto([25, 5], 3);
            const polyline = new Inputs.IO.DxfPolylineSegmentDto([[30, 0], [35, 5], [40, 0]], false);
            const spline = new Inputs.IO.DxfSplineSegmentDto([[45, 0], [50, 10], [55, 0]], 3, false);
            
            const path = new Inputs.IO.DxfPathDto([line, arc, circle, polyline, spline]);
            const part = new Inputs.IO.DxfPathsPartDto("ComplexPath", "7", [path]);
            const model = new Inputs.IO.DxfModelDto([part]);

            const result = io.dxf.dxfCreate(model);

            expect(result).toContain("0\nLINE");
            expect(result).toContain("0\nARC");
            expect(result).toContain("0\nCIRCLE");
            expect(result).toContain("0\nLWPOLYLINE");
            expect(result).toContain("0\nSPLINE");
        });
    });

    describe("DxfCreate - Multiple Layers and Paths", () => {
        
        it("should generate DXF with multiple layers", () => {
            const line1 = new Inputs.IO.DxfLineSegmentDto([0, 0], [5, 5]);
            const line2 = new Inputs.IO.DxfLineSegmentDto([10, 10], [15, 15]);
            
            const path1 = new Inputs.IO.DxfPathDto([line1]);
            const path2 = new Inputs.IO.DxfPathDto([line2]);
            
            const part1 = new Inputs.IO.DxfPathsPartDto("Layer1", "#FF0000", [path1]);
            const part2 = new Inputs.IO.DxfPathsPartDto("Layer2", "#00FF00", [path2]);
            
            const model = new Inputs.IO.DxfModelDto([part1, part2]);

            const result = io.dxf.dxfCreate(model);

            expect(result).toContain("2\nLayer1");
            expect(result).toContain("2\nLayer2");
            
            const lineMatches = result.match(/0\nLINE/g);
            expect(lineMatches).toHaveLength(2);

            expect(result).toContain("8\nLayer1");
            expect(result).toContain("8\nLayer2");
        });

        it("should handle multiple paths in single part", () => {
            const line1 = new Inputs.IO.DxfLineSegmentDto([0, 0], [5, 0]);
            const line2 = new Inputs.IO.DxfLineSegmentDto([0, 5], [5, 5]);
            const line3 = new Inputs.IO.DxfLineSegmentDto([0, 10], [5, 10]);
            
            const path1 = new Inputs.IO.DxfPathDto([line1]);
            const path2 = new Inputs.IO.DxfPathDto([line2]);
            const path3 = new Inputs.IO.DxfPathDto([line3]);
            
            const part = new Inputs.IO.DxfPathsPartDto("MultiPath", "#000000", [path1, path2, path3]);
            const model = new Inputs.IO.DxfModelDto([part]);

            const result = io.dxf.dxfCreate(model);

            const lineMatches = result.match(/0\nLINE/g);
            expect(lineMatches).toHaveLength(3);

            const layerMatches = result.match(/8\nMultiPath/g);
            expect(layerMatches).toHaveLength(3);
        });

        it("should handle multiple paths in different parts", () => {
            const path1 = new Inputs.IO.DxfPathDto([
                new Inputs.IO.DxfLineSegmentDto([0, 0], [10, 10])
            ]);
            const path2 = new Inputs.IO.DxfPathDto([
                new Inputs.IO.DxfCircleSegmentDto([20, 20], 5)
            ]);
            
            const part1 = new Inputs.IO.DxfPathsPartDto("Layer1", "1", [path1]);
            const part2 = new Inputs.IO.DxfPathsPartDto("Layer2", "2", [path2]);
            const model = new Inputs.IO.DxfModelDto([part1, part2]);

            const result = io.dxf.dxfCreate(model);

            expect(result).toContain("2\nLayer1");
            expect(result).toContain("2\nLayer2");
            expect(result).toContain("8\nLayer1");
            expect(result).toContain("8\nLayer2");
        });
    });

    describe("DxfCreate - Edge Cases", () => {
        
        it("should handle empty model", () => {
            const model = new Inputs.IO.DxfModelDto([]);

            const result = io.dxf.dxfCreate(model);

            expect(result).toContain("0\nSECTION\n2\nHEADER");
            expect(result).toContain("0\nSECTION\n2\nTABLES");
            expect(result).toContain("0\nSECTION\n2\nENTITIES");
            expect(result).toContain("0\nEOF");
            expect(result).toContain("2\n0");
            expect(result).not.toContain("LINE");
            expect(result).not.toContain("ARC");
            expect(result).not.toContain("CIRCLE");
        });

        it("should generate unique entity handles", () => {
            const line = new Inputs.IO.DxfLineSegmentDto([0, 0], [10, 10]);
            const circle = new Inputs.IO.DxfCircleSegmentDto([20, 20], 5);
            
            const path1 = new Inputs.IO.DxfPathDto([line]);
            const path2 = new Inputs.IO.DxfPathDto([circle]);
            
            const part1 = new Inputs.IO.DxfPathsPartDto("Layer1", "#000000", [path1]);
            const part2 = new Inputs.IO.DxfPathsPartDto("Layer2", "#000000", [path2]);
            
            const model = new Inputs.IO.DxfModelDto([part1, part2]);

            const result = io.dxf.dxfCreate(model);

            // Extract only entity handles from ENTITIES section
            const entitiesSection = result.split("SECTION\n2\nENTITIES")[1]?.split("ENDSEC")[0];
            expect(entitiesSection).toBeDefined();
            
            const handleMatches = entitiesSection?.match(/5\n[A-F0-9]+/g);
            expect(handleMatches).toBeDefined();
            if (handleMatches) {
                const handles = handleMatches.map(match => match.replace("5\n", ""));
                const uniqueHandles = new Set(handles);
                expect(uniqueHandles.size).toBe(handles.length);
            }
        });

        it("should handle color values correctly", () => {
            const line = new Inputs.IO.DxfLineSegmentDto([0, 0], [10, 10]);
            const path = new Inputs.IO.DxfPathDto([line]);
            const part = new Inputs.IO.DxfPathsPartDto("ColorLayer", "5", [path]);
            const model = new Inputs.IO.DxfModelDto([part]);

            const result = io.dxf.dxfCreate(model);

            expect(result).toContain("62\n5");
        });

        it("should convert hex color #FF0000 to true color format when specified", () => {
            const circle = new Inputs.IO.DxfCircleSegmentDto([10, 10], 5);
            const path = new Inputs.IO.DxfPathDto([circle]);
            const part = new Inputs.IO.DxfPathsPartDto("HexColor", "#FF0000", [path]);
            const model = new Inputs.IO.DxfModelDto([part], "truecolor");

            const result = io.dxf.dxfCreate(model);

            // Should use true color format: 62 = 256 (by entity), 420 = RGB decimal value
            expect(result).toContain("62\n256");
            expect(result).toContain("420\n16711680"); // #FF0000 = 16711680 in decimal
        });

        it("should convert hex color #FF0000 to true color format in line when specified", () => {
            const line = new Inputs.IO.DxfLineSegmentDto([0, 0], [10, 10]);
            const path = new Inputs.IO.DxfPathDto([line]);
            const part = new Inputs.IO.DxfPathsPartDto("LayerHex", "#FF0000", [path]);
            const model = new Inputs.IO.DxfModelDto([part], "truecolor");

            const result = io.dxf.dxfCreate(model);
            // Should convert #FF0000 to true color format
            expect(result).toContain("62\n256");
            expect(result).toContain("420\n16711680");
        });

        it("should convert hex color #FF0000 to ACI color format", () => {
            const line = new Inputs.IO.DxfLineSegmentDto([0, 0], [10, 10]);
            const path = new Inputs.IO.DxfPathDto([line]);
            const part = new Inputs.IO.DxfPathsPartDto("LayerHex", "#FF0000", [path]);
            const model = new Inputs.IO.DxfModelDto([part]);

            const result = io.dxf.dxfCreate(model);
            // Should convert #FF0000 to nearest ACI color (1 = red)
            expect(result).toContain("62\n1");
        });

        it("should convert hex color #0000FF to ACI color format", () => {
            const line = new Inputs.IO.DxfLineSegmentDto([0, 0], [10, 10]);
            const path = new Inputs.IO.DxfPathDto([line]);
            const part = new Inputs.IO.DxfPathsPartDto("LayerHex", "#0000FF", [path]);
            const model = new Inputs.IO.DxfModelDto([part]);

            const result = io.dxf.dxfCreate(model);
            // Should convert #0000FF to nearest ACI color (5 = blue)
            expect(result).toContain("62\n5");
        });
        it("should handle invalid color by using default ACI 7", () => {
            const line = new Inputs.IO.DxfLineSegmentDto([0, 0], [10, 10]);
            const path = new Inputs.IO.DxfPathDto([line]);
            const part = new Inputs.IO.DxfPathsPartDto("LayerInvalid", "notacolor", [path]);
            const model = new Inputs.IO.DxfModelDto([part]);

            const result = io.dxf.dxfCreate(model);
            // Should handle invalid color gracefully (defaults to ACI 7 - white/black)
            expect(result).toContain("62\n7");
        });        it("should auto-detect closed polyline from matching points", () => {
            const points: Inputs.Base.Point2[] = [[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]];
            const polylineSegment = new Inputs.IO.DxfPolylineSegmentDto(points, false);
            const path = new Inputs.IO.DxfPathDto([polylineSegment]);
            const part = new Inputs.IO.DxfPathsPartDto("0", "#000000", [path]);
            const model = new Inputs.IO.DxfModelDto([part]);

            const result = io.dxf.dxfCreate(model);

            expect(result).toContain("70\n1");
        });

        it("should handle minimum polyline with 2 points", () => {
            const points: Inputs.Base.Point2[] = [[0, 0], [1, 1]];
            const polylineSegment = new Inputs.IO.DxfPolylineSegmentDto(points, false);
            const path = new Inputs.IO.DxfPathDto([polylineSegment]);
            const part = new Inputs.IO.DxfPathsPartDto("MinPoly", "#000000", [path]);
            const model = new Inputs.IO.DxfModelDto([part]);

            const result = io.dxf.dxfCreate(model);

            expect(result).toContain("90\n2");
            expect(result).toContain("70\n0");
        });

        it("should handle decimal coordinates", () => {
            const line = new Inputs.IO.DxfLineSegmentDto([1.5, 2.7], [3.14159, 2.71828]);
            const path = new Inputs.IO.DxfPathDto([line]);
            const part = new Inputs.IO.DxfPathsPartDto("Decimals", "#000000", [path]);
            const model = new Inputs.IO.DxfModelDto([part]);

            const result = io.dxf.dxfCreate(model);

            expect(result).toContain("10\n1.500000\n20\n2.700000");
            expect(result).toContain("11\n3.141590\n21\n2.718280");
        });

        it("should handle negative coordinates", () => {
            const line = new Inputs.IO.DxfLineSegmentDto([-10, -5], [10, 5]);
            const path = new Inputs.IO.DxfPathDto([line]);
            const part = new Inputs.IO.DxfPathsPartDto("Negative", "#000000", [path]);
            const model = new Inputs.IO.DxfModelDto([part]);

            const result = io.dxf.dxfCreate(model);

            expect(result).toContain("10\n-10.000000\n20\n-5.000000");
            expect(result).toContain("11\n10.000000\n21\n5.000000");
        });
    });

    describe("DxfCreate - Spline Features", () => {
        
        it("should generate closed spline", () => {
            const controlPoints: Inputs.Base.Point2[] = [[0, 0], [5, 5], [10, 0], [5, -5]];
            const splineSegment = new Inputs.IO.DxfSplineSegmentDto(controlPoints, 3, true);
            const path = new Inputs.IO.DxfPathDto([splineSegment]);
            const part = new Inputs.IO.DxfPathsPartDto("0", "#000000", [path]);
            const model = new Inputs.IO.DxfModelDto([part]);

            const result = io.dxf.dxfCreate(model);

            expect(result).toContain("70\n9"); // 9 = closed (1) + planar (8)
        });

        it("should generate spline with degree 2", () => {
            const controlPoints: Inputs.Base.Point2[] = [[0, 0], [5, 10], [10, 0]];
            const splineSegment = new Inputs.IO.DxfSplineSegmentDto(controlPoints, 2, false);
            const path = new Inputs.IO.DxfPathDto([splineSegment]);
            const part = new Inputs.IO.DxfPathsPartDto("0", "#000000", [path]);
            const model = new Inputs.IO.DxfModelDto([part]);

            const result = io.dxf.dxfCreate(model);

            expect(result).toContain("71\n2");
        });

        it("should use default degree if not specified", () => {
            const controlPoints: Inputs.Base.Point2[] = [[0, 0], [5, 5], [10, 0]];
            const splineSegment = new Inputs.IO.DxfSplineSegmentDto(controlPoints);
            const path = new Inputs.IO.DxfPathDto([splineSegment]);
            const part = new Inputs.IO.DxfPathsPartDto("0", "#000000", [path]);
            const model = new Inputs.IO.DxfModelDto([part]);

            const result = io.dxf.dxfCreate(model);

            expect(result).toContain("71\n3");
        });
    });

    describe("DxfCreate - DXF Structure Validation", () => {
        
        it("should produce valid DXF structure with all sections", () => {
            const line = new Inputs.IO.DxfLineSegmentDto([0, 0], [100, 100]);
            const path = new Inputs.IO.DxfPathDto([line]);
            const part = new Inputs.IO.DxfPathsPartDto("WALLS", "1", [path]);
            const model = new Inputs.IO.DxfModelDto([part]);

            const result = io.dxf.dxfCreate(model);

            const sections = [
                "0\nSECTION\n2\nHEADER",
                "0\nSECTION\n2\nTABLES",
                "0\nSECTION\n2\nBLOCKS",
                "0\nSECTION\n2\nENTITIES",
                "0\nEOF"
            ];

            sections.forEach(section => {
                expect(result).toContain(section);
            });

            // AC1009 format (default) does not include $LASTSAVEDBY
            expect(result).toContain("0\nTABLE\n2\nLTYPE"); // Line type table
            expect(result).toContain("0\nTABLE\n2\nLAYER");
            expect(result).toContain("0\nTABLE\n2\nSTYLE"); // Text style table
            expect(result).toContain("0\nTABLE\n2\nVPORT"); // AC1009 includes VPORT
            expect(result).toContain("2\nWALLS");
            expect(result).toContain("0\nLINE");
            expect(result).toContain("8\nWALLS");
            expect(result).toContain("62\n1");
        });

        it("should produce AC1015 structure with $LASTSAVEDBY when specified", () => {
            const lineSegment = new Inputs.IO.DxfLineSegmentDto([0, 0], [100, 100]);
            const path = new Inputs.IO.DxfPathDto([lineSegment]);
            const part = new Inputs.IO.DxfPathsPartDto("WALLS", "#FF0000", [path]);
            const model = new Inputs.IO.DxfModelDto([part], "aci", "AC1015");

            const result = io.dxf.dxfCreate(model);

            expect(result).toContain("$ACADVER\n1\nAC1015");
            expect(result).toContain("$LASTSAVEDBY\n1\nbitbybit.dev");
            // AC1015 should not have VPORT table
            expect(result).not.toContain("0\nTABLE\n2\nVPORT");
        });
    });
});
