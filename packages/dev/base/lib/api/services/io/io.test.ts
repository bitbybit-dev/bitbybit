import { describe, it, expect, beforeEach } from "vitest";
import { IoBitByBit } from "./io";
import * as Inputs from "../../inputs";

describe("IO unit tests", () => {

    let io: IoBitByBit;

    beforeEach(() => {
        io = new IoBitByBit();
    });

    describe("Drawing segment builders", () => {
        
        it("should return line segment unchanged", () => {
            const segment = new Inputs.IO.DrawingLineSegmentDto([0, 0], [10, 10]);
            const result = io.drawing.lineSegment(segment);
            
            expect(result).toBe(segment);
            expect(result.start).toEqual([0, 0]);
            expect(result.end).toEqual([10, 10]);
        });

        it("should return arc segment unchanged", () => {
            const segment = new Inputs.IO.DrawingArcSegmentDto([50, 50], 25, 0, 90);
            const result = io.drawing.arcSegment(segment);
            
            expect(result).toBe(segment);
            expect(result.center).toEqual([50, 50]);
            expect(result.radius).toBe(25);
            expect(result.startAngle).toBe(0);
            expect(result.endAngle).toBe(90);
        });

        it("should return circle segment unchanged", () => {
            const segment = new Inputs.IO.DrawingCircleSegmentDto([100, 100], 50);
            const result = io.drawing.circleSegment(segment);
            
            expect(result).toBe(segment);
            expect(result.center).toEqual([100, 100]);
            expect(result.radius).toBe(50);
        });

        it("should return the polyline segment with the values it was given", () => {
            const points: Inputs.Base.Point2[] = [[0, 0], [10, 0], [10, 10]];
            const segment = new Inputs.IO.DrawingPolylineSegmentDto(points, false);
            const result = io.drawing.polylineSegment(segment);
            
            expect(result).toEqual(segment);
            expect(result.points).toEqual(points);
            expect(result.closed).toBe(false);
        });

        it("should return the spline segment with the values it was given", () => {
            const controlPoints: Inputs.Base.Point2[] = [[0, 0], [5, 10], [10, 0]];
            const segment = new Inputs.IO.DrawingSplineSegmentDto(controlPoints, 3, false);
            const result = io.drawing.splineSegment(segment);
            
            expect(result).toEqual(segment);
            expect(result.controlPoints).toEqual(controlPoints);
            expect(result.degree).toBe(3);
            expect(result.closed).toBe(false);
        });

        it("should return the ellipse segment with its parameters, a whole ellipse when none are given", () => {
            // Act
            const result = io.drawing.ellipseSegment({ center: [1, 2], majorAxis: [4, 0], ratio: 0.5 });

            // Assert
            expect(result).toEqual({ center: [1, 2], majorAxis: [4, 0], ratio: 0.5, startParameter: 0, endParameter: 2 * Math.PI });
        });
    });

    describe("Drawing path and part builders", () => {
        
        it("should return path unchanged", () => {
            const lineSegment = new Inputs.IO.DrawingLineSegmentDto([0, 0], [10, 10]);
            const path = new Inputs.IO.DrawingPathDto([lineSegment]);
            const result = io.drawing.path(path);
            
            expect(result).toBe(path);
            expect(result.segments).toHaveLength(1);
        });

        it("should return the part with the values it was given", () => {
            const lineSegment = new Inputs.IO.DrawingLineSegmentDto([0, 0], [10, 10]);
            const path = new Inputs.IO.DrawingPathDto([lineSegment]);
            const part = new Inputs.IO.DrawingPartDto("TestLayer", "#FF0000", [path]);
            const result = io.drawing.part(part);
            
            expect(result).toEqual(part);
            expect(result.layer).toBe("TestLayer");
            expect(result.color).toBe("#FF0000");
            expect(result.paths).toHaveLength(1);
        });
    });

    describe("The former DXF-named builders", () => {

        it("should hand back from each what the io.drawing builder of the same name hands back", () => {
            // Arrange
            const line = { start: [0, 0] as Inputs.Base.Point2, end: [10, 5] as Inputs.Base.Point2 };
            const path = { segments: [line] };

            // Act
            const former = [
                io.dxf.lineSegment(line),
                io.dxf.arcSegment({ center: [0, 0], radius: 5, startAngle: 0, endAngle: 90 }),
                io.dxf.circleSegment({ center: [0, 0], radius: 5 }),
                io.dxf.polylineSegment({ points: [[0, 0], [5, 0], [5, 5]] }),
                io.dxf.splineSegment({ controlPoints: [[0, 0], [5, 5], [10, 0], [15, 5]] }),
                io.dxf.ellipseSegment({ center: [0, 0], majorAxis: [4, 0], ratio: 0.5 }),
                io.dxf.path(path),
                io.dxf.pathsPart({ paths: [path] }),
            ];

            // Assert
            expect(former).toEqual([
                io.drawing.lineSegment(line),
                io.drawing.arcSegment({ center: [0, 0], radius: 5, startAngle: 0, endAngle: 90 }),
                io.drawing.circleSegment({ center: [0, 0], radius: 5 }),
                io.drawing.polylineSegment({ points: [[0, 0], [5, 0], [5, 5]] }),
                io.drawing.splineSegment({ controlPoints: [[0, 0], [5, 5], [10, 0], [15, 5]] }),
                io.drawing.ellipseSegment({ center: [0, 0], majorAxis: [4, 0], ratio: 0.5 }),
                io.drawing.path(path),
                io.drawing.part({ paths: [path] }),
            ]);
        });
    });

    describe("Writing files", () => {

        it("should write DXF through the dxf service with its defaults: AutoCAD 2000, index colors", () => {
            // Arrange
            const part = io.drawing.part({ layer: "cut", color: "#ff0000", paths: [{ segments: [io.drawing.lineSegment({ start: [0, 0], end: [10, 5] })] }] });

            // Act
            const dxf = io.dxf.dxfCreate({ dxfPathsParts: [part] });

            // Assert
            expect(dxf).toContain("$ACADVER\n1\nAC1015\n");
            expect(dxf).toContain("0\nLINE\n");
            expect(dxf).toContain("\n62\n1\n");
            expect(dxf.endsWith("0\nEOF\n")).toBe(true);
        });

        it("should write SVG through the svg service from the same parts, and one path's data", () => {
            // Arrange
            const part = io.drawing.part({ layer: "cut", color: "#ff0000", paths: [{ segments: [io.drawing.circleSegment({ center: [0, 0], radius: 5 })] }] });

            // Act
            const svg = io.svg.svgCreate({ parts: [part], unit: Inputs.Base.unitOfLengthEnum.millimetre, margin: 0 });
            const data = io.svg.pathData({ path: { segments: [io.drawing.lineSegment({ start: [0, 0], end: [3, 4] })] } });

            // Assert
            expect(svg).toContain("width=\"10mm\" height=\"10mm\" viewBox=\"-5 -5 10 10\"");
            expect(svg).toContain("<g stroke=\"#ff0000\">");
            expect(data).toBe("M0 0 L3 -4");
        });
    });
});
