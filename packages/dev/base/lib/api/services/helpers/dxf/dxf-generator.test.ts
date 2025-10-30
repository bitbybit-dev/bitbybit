import { DxfGenerator } from "./dxf-generator";
import * as Inputs from "../../../inputs";

describe("DxfGenerator unit tests", () => {

    let generator: DxfGenerator;

    beforeEach(() => {
        generator = new DxfGenerator();
    });

    describe("Line Segments", () => {
        
        it("should generate a LINE entity", () => {
            const lineSegment = new Inputs.IO.DxfLineSegmentDto([0, 0], [10, 10]);
            const path = new Inputs.IO.DxfPathDto([lineSegment]);
            const part = new Inputs.IO.DxfPathsPartDto("Layer1", "#FF0000", [path]);
            const model = new Inputs.IO.DxfModelDto([part]);

            const result = generator.generateDxf(model);

            expect(result).toContain("0\nLINE");
            expect(result).toContain("8\nLayer1");
            expect(result).toContain("10\n0\n20\n0"); // Start point
            expect(result).toContain("11\n10\n21\n10"); // End point
        });

        it("should generate multiple LINE entities in a single path", () => {
            const line1 = new Inputs.IO.DxfLineSegmentDto([0, 0], [5, 5]);
            const line2 = new Inputs.IO.DxfLineSegmentDto([5, 5], [10, 0]);
            const path = new Inputs.IO.DxfPathDto([line1, line2]);
            const part = new Inputs.IO.DxfPathsPartDto("0", "#000000", [path]);
            const model = new Inputs.IO.DxfModelDto([part]);

            const result = generator.generateDxf(model);

            const lineMatches = result.match(/0\nLINE/g);
            expect(lineMatches).toHaveLength(2);
        });
    });

    describe("Circle Segments", () => {
        
        it("should generate a CIRCLE entity", () => {
            const circleSegment = new Inputs.IO.DxfCircleSegmentDto([50, 50], 25);
            const path = new Inputs.IO.DxfPathDto([circleSegment]);
            const part = new Inputs.IO.DxfPathsPartDto("Circles", "1", [path]);
            const model = new Inputs.IO.DxfModelDto([part]);

            const result = generator.generateDxf(model);

            expect(result).toContain("0\nCIRCLE");
            expect(result).toContain("8\nCircles");
            expect(result).toContain("10\n50\n20\n50"); // Center point
            expect(result).toContain("40\n25"); // Radius
        });

        it("should generate multiple circles", () => {
            const circle1 = new Inputs.IO.DxfCircleSegmentDto([10, 10], 5);
            const circle2 = new Inputs.IO.DxfCircleSegmentDto([30, 30], 10);
            const circle3 = new Inputs.IO.DxfCircleSegmentDto([50, 10], 7.5);
            const path = new Inputs.IO.DxfPathDto([circle1, circle2, circle3]);
            const part = new Inputs.IO.DxfPathsPartDto("0", "#000000", [path]);
            const model = new Inputs.IO.DxfModelDto([part]);

            const result = generator.generateDxf(model);

            const circleMatches = result.match(/0\nCIRCLE/g);
            expect(circleMatches).toHaveLength(3);
            expect(result).toContain("40\n5");
            expect(result).toContain("40\n10");
            expect(result).toContain("40\n7.5");
        });
    });

    describe("Arc Segments", () => {
        
        it("should generate an ARC entity", () => {
            const arcSegment = new Inputs.IO.DxfArcSegmentDto([100, 100], 50, 0, 90);
            const path = new Inputs.IO.DxfPathDto([arcSegment]);
            const part = new Inputs.IO.DxfPathsPartDto("Arcs", "2", [path]);
            const model = new Inputs.IO.DxfModelDto([part]);

            const result = generator.generateDxf(model);

            expect(result).toContain("0\nARC");
            expect(result).toContain("8\nArcs");
            expect(result).toContain("10\n100\n20\n100"); // Center point
            expect(result).toContain("40\n50"); // Radius
            expect(result).toContain("50\n0"); // Start angle
            expect(result).toContain("51\n90"); // End angle
        });

        it("should generate arc with 180 degree sweep", () => {
            const arcSegment = new Inputs.IO.DxfArcSegmentDto([0, 0], 10, 45, 225);
            const path = new Inputs.IO.DxfPathDto([arcSegment]);
            const part = new Inputs.IO.DxfPathsPartDto("0", "#000000", [path]);
            const model = new Inputs.IO.DxfModelDto([part]);

            const result = generator.generateDxf(model);

            expect(result).toContain("50\n45");
            expect(result).toContain("51\n225");
        });

        it("should generate multiple arcs", () => {
            const arc1 = new Inputs.IO.DxfArcSegmentDto([0, 0], 10, 0, 90);
            const arc2 = new Inputs.IO.DxfArcSegmentDto([20, 0], 10, 90, 180);
            const path = new Inputs.IO.DxfPathDto([arc1, arc2]);
            const part = new Inputs.IO.DxfPathsPartDto("0", "#000000", [path]);
            const model = new Inputs.IO.DxfModelDto([part]);

            const result = generator.generateDxf(model);

            const arcMatches = result.match(/0\nARC/g);
            expect(arcMatches).toHaveLength(2);
        });
    });

    describe("Polyline Segments", () => {
        
        it("should generate a closed LWPOLYLINE entity", () => {
            const points: Inputs.Base.Point2[] = [[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]];
            const polylineSegment = new Inputs.IO.DxfPolylineSegmentDto(points, true);
            const path = new Inputs.IO.DxfPathDto([polylineSegment]);
            const part = new Inputs.IO.DxfPathsPartDto("Polylines", "3", [path]);
            const model = new Inputs.IO.DxfModelDto([part]);

            const result = generator.generateDxf(model);

            expect(result).toContain("0\nLWPOLYLINE");
            expect(result).toContain("8\nPolylines");
            expect(result).toContain("90\n5"); // Number of vertices
            expect(result).toContain("70\n1"); // Closed flag
        });

        it("should generate an open polyline", () => {
            const points: Inputs.Base.Point2[] = [[0, 0], [5, 5], [10, 0]];
            const polylineSegment = new Inputs.IO.DxfPolylineSegmentDto(points, false);
            const path = new Inputs.IO.DxfPathDto([polylineSegment]);
            const part = new Inputs.IO.DxfPathsPartDto("0", "#000000", [path]);
            const model = new Inputs.IO.DxfModelDto([part]);

            const result = generator.generateDxf(model);

            expect(result).toContain("90\n3");
            expect(result).toContain("70\n0"); // Open flag
        });

        it("should auto-detect closed polyline", () => {
            const points: Inputs.Base.Point2[] = [[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]];
            const polylineSegment = new Inputs.IO.DxfPolylineSegmentDto(points, false);
            const path = new Inputs.IO.DxfPathDto([polylineSegment]);
            const part = new Inputs.IO.DxfPathsPartDto("0", "#000000", [path]);
            const model = new Inputs.IO.DxfModelDto([part]);

            const result = generator.generateDxf(model);

            expect(result).toContain("70\n1"); // Should detect as closed
        });
    });

    describe("Spline Segments", () => {
        
        it("should generate a SPLINE entity", () => {
            const controlPoints: Inputs.Base.Point2[] = [[0, 0], [5, 10], [10, 10], [15, 0]];
            const splineSegment = new Inputs.IO.DxfSplineSegmentDto(controlPoints, 3, false);
            const path = new Inputs.IO.DxfPathDto([splineSegment]);
            const part = new Inputs.IO.DxfPathsPartDto("Splines", "4", [path]);
            const model = new Inputs.IO.DxfModelDto([part]);

            const result = generator.generateDxf(model);

            expect(result).toContain("0\nSPLINE");
            expect(result).toContain("8\nSplines");
            expect(result).toContain("71\n3"); // Degree
            expect(result).toContain("73\n4"); // Number of control points
        });

        it("should generate closed spline", () => {
            const controlPoints: Inputs.Base.Point2[] = [[0, 0], [5, 5], [10, 0], [5, -5]];
            const splineSegment = new Inputs.IO.DxfSplineSegmentDto(controlPoints, 3, true);
            const path = new Inputs.IO.DxfPathDto([splineSegment]);
            const part = new Inputs.IO.DxfPathsPartDto("0", "#000000", [path]);
            const model = new Inputs.IO.DxfModelDto([part]);

            const result = generator.generateDxf(model);

            expect(result).toContain("70\n1"); // Closed flag
        });

        it("should generate spline with degree 2", () => {
            const controlPoints: Inputs.Base.Point2[] = [[0, 0], [5, 10], [10, 0]];
            const splineSegment = new Inputs.IO.DxfSplineSegmentDto(controlPoints, 2, false);
            const path = new Inputs.IO.DxfPathDto([splineSegment]);
            const part = new Inputs.IO.DxfPathsPartDto("0", "#000000", [path]);
            const model = new Inputs.IO.DxfModelDto([part]);

            const result = generator.generateDxf(model);

            expect(result).toContain("71\n2"); // Degree 2
        });

        it("should use default degree if not specified", () => {
            const controlPoints: Inputs.Base.Point2[] = [[0, 0], [5, 5], [10, 0]];
            const splineSegment = new Inputs.IO.DxfSplineSegmentDto(controlPoints);
            const path = new Inputs.IO.DxfPathDto([splineSegment]);
            const part = new Inputs.IO.DxfPathsPartDto("0", "#000000", [path]);
            const model = new Inputs.IO.DxfModelDto([part]);

            const result = generator.generateDxf(model);

            expect(result).toContain("71\n3"); // Default degree 3
        });
    });

    describe("Mixed Segment Types in Paths", () => {
        
        it("should generate a path with line and arc segments (like a wire)", () => {
            const line = new Inputs.IO.DxfLineSegmentDto([0, 0], [10, 0]);
            const arc = new Inputs.IO.DxfArcSegmentDto([10, 5], 5, -90, 90);
            const line2 = new Inputs.IO.DxfLineSegmentDto([10, 10], [0, 10]);
            const path = new Inputs.IO.DxfPathDto([line, arc, line2]);
            const part = new Inputs.IO.DxfPathsPartDto("MixedPath", "5", [path]);
            const model = new Inputs.IO.DxfModelDto([part]);

            const result = generator.generateDxf(model);

            expect(result).toContain("0\nLINE");
            expect(result).toContain("0\nARC");
            const lineMatches = result.match(/0\nLINE/g);
            expect(lineMatches).toHaveLength(2);
            const arcMatches = result.match(/0\nARC/g);
            expect(arcMatches).toHaveLength(1);
        });

        it("should generate a complex path with all segment types", () => {
            const line = new Inputs.IO.DxfLineSegmentDto([0, 0], [10, 0]);
            const arc = new Inputs.IO.DxfArcSegmentDto([15, 0], 5, 180, 270);
            const circle = new Inputs.IO.DxfCircleSegmentDto([25, 5], 3);
            const polyline = new Inputs.IO.DxfPolylineSegmentDto([[30, 0], [35, 5], [40, 0]], false);
            const spline = new Inputs.IO.DxfSplineSegmentDto([[45, 0], [50, 10], [55, 0]], 3, false);
            
            const path = new Inputs.IO.DxfPathDto([line, arc, circle, polyline, spline]);
            const part = new Inputs.IO.DxfPathsPartDto("ComplexPath", "7", [path]);
            const model = new Inputs.IO.DxfModelDto([part]);

            const result = generator.generateDxf(model);

            expect(result).toContain("0\nLINE");
            expect(result).toContain("0\nARC");
            expect(result).toContain("0\nCIRCLE");
            expect(result).toContain("0\nLWPOLYLINE");
            expect(result).toContain("0\nSPLINE");
        });

        it("should generate multiple lines and arcs forming a connected wire", () => {
            // Create a rounded rectangle using lines and arcs
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

            const result = generator.generateDxf(model);

            const lineMatches = result.match(/0\nLINE/g);
            const arcMatches = result.match(/0\nARC/g);
            expect(lineMatches).toHaveLength(4);
            expect(arcMatches).toHaveLength(4);
        });
    });

    describe("Multiple Paths and Layers", () => {
        
        it("should generate multiple paths in different parts", () => {
            const path1 = new Inputs.IO.DxfPathDto([
                new Inputs.IO.DxfLineSegmentDto([0, 0], [10, 10])
            ]);
            const path2 = new Inputs.IO.DxfPathDto([
                new Inputs.IO.DxfCircleSegmentDto([20, 20], 5)
            ]);
            
            const part1 = new Inputs.IO.DxfPathsPartDto("Layer1", "1", [path1]);
            const part2 = new Inputs.IO.DxfPathsPartDto("Layer2", "2", [path2]);
            const model = new Inputs.IO.DxfModelDto([part1, part2]);

            const result = generator.generateDxf(model);

            expect(result).toContain("2\nLayer1");
            expect(result).toContain("2\nLayer2");
            expect(result).toContain("8\nLayer1");
            expect(result).toContain("8\nLayer2");
        });

        it("should handle multiple paths in a single part", () => {
            const path1 = new Inputs.IO.DxfPathDto([
                new Inputs.IO.DxfLineSegmentDto([0, 0], [10, 0])
            ]);
            const path2 = new Inputs.IO.DxfPathDto([
                new Inputs.IO.DxfLineSegmentDto([0, 10], [10, 10])
            ]);
            const path3 = new Inputs.IO.DxfPathDto([
                new Inputs.IO.DxfCircleSegmentDto([5, 5], 2)
            ]);
            
            const part = new Inputs.IO.DxfPathsPartDto("MultiPath", "3", [path1, path2, path3]);
            const model = new Inputs.IO.DxfModelDto([part]);

            const result = generator.generateDxf(model);

            const layerMatches = result.match(/8\nMultiPath/g);
            expect(layerMatches?.length).toBeGreaterThanOrEqual(3);
        });
    });

    describe("DXF Structure and Format", () => {
        
        it("should generate valid DXF structure with all sections", () => {
            const line = new Inputs.IO.DxfLineSegmentDto([0, 0], [10, 10]);
            const path = new Inputs.IO.DxfPathDto([line]);
            const part = new Inputs.IO.DxfPathsPartDto("0", "#000000", [path]);
            const model = new Inputs.IO.DxfModelDto([part]);

            const result = generator.generateDxf(model);

            expect(result).toContain("0\nSECTION\n2\nHEADER");
            expect(result).toContain("$ACADVER\n1\nAC1015");
            expect(result).toContain("$LASTSAVEDBY\n1\nbitbybit.dev");
            expect(result).toContain("0\nSECTION\n2\nTABLES");
            expect(result).toContain("0\nSECTION\n2\nENTITIES");
            expect(result).toContain("0\nEOF");
        });

        it("should generate unique entity handles", () => {
            const segments = [
                new Inputs.IO.DxfLineSegmentDto([0, 0], [10, 10]),
                new Inputs.IO.DxfCircleSegmentDto([20, 20], 5),
                new Inputs.IO.DxfArcSegmentDto([30, 30], 5, 0, 90)
            ];
            const path = new Inputs.IO.DxfPathDto(segments);
            const part = new Inputs.IO.DxfPathsPartDto("Test", "1", [path]);
            const model = new Inputs.IO.DxfModelDto([part]);

            const result = generator.generateDxf(model);

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

        it("should handle empty model", () => {
            const model = new Inputs.IO.DxfModelDto([]);

            const result = generator.generateDxf(model);

            expect(result).toContain("0\nSECTION\n2\nHEADER");
            expect(result).toContain("0\nSECTION\n2\nTABLES");
            expect(result).toContain("0\nSECTION\n2\nENTITIES");
            expect(result).toContain("0\nEOF");
            expect(result).toContain("2\n0"); // Default layer
        });
    });

    describe("Color Handling", () => {
        
        it("should apply color to entities", () => {
            const line = new Inputs.IO.DxfLineSegmentDto([0, 0], [10, 10]);
            const path = new Inputs.IO.DxfPathDto([line]);
            const part = new Inputs.IO.DxfPathsPartDto("ColorLayer", "5", [path]);
            const model = new Inputs.IO.DxfModelDto([part]);

            const result = generator.generateDxf(model);

            expect(result).toContain("62\n5");
        });

        it("should convert hex color to true color format", () => {
            const circle = new Inputs.IO.DxfCircleSegmentDto([10, 10], 5);
            const path = new Inputs.IO.DxfPathDto([circle]);
            const part = new Inputs.IO.DxfPathsPartDto("HexColor", "#FF0000", [path]);
            const model = new Inputs.IO.DxfModelDto([part]);

            const result = generator.generateDxf(model);

            // Should use true color format: 62 = 256 (by entity), 420 = RGB decimal value
            expect(result).toContain("62\n256");
            expect(result).toContain("420\n16711680"); // #FF0000 = 16711680 in decimal
        });
    });
});
