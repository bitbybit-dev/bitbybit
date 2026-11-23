import { describe, it, expect, beforeAll } from "vitest";
import type { BitbybitOcctModule, TopoDS_Edge, TopoDS_Shape } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import { nurbsCurvePoint } from "@bitbybit-dev/base/lib/api/services/helpers/curves/nurbs";
import { OccHelper } from "../occ-helper";
import { OCCTService } from "../occ-service";
import { OCCTWire } from "./shapes";
import { OCCTIO } from "./io";
import { exactTracing } from "./base/drawing.service";
import { numbersOfFrames } from "./base/frames";
import { viewOntoDrawingPlane } from "./base/file-axes";
import { checkedView, viewParts } from "./base/view-drawings";
import type * as Inputs from "../api/inputs";

type Point3 = Inputs.Base.Point3;
type DrawingPath = Inputs.IO.DrawingPathDto;

const distanceToPolyline = (point: Point3, polyline: Point3[]): number => {
    let nearest = Infinity;
    for (let at = 0; at + 1 < polyline.length; at++) {
        const start = polyline[at]!;
        const end = polyline[at + 1]!;
        const along = [end[0] - start[0], end[1] - start[1], end[2] - start[2]];
        const reach = along[0]! ** 2 + along[1]! ** 2 + along[2]! ** 2;
        const share = reach === 0 ? 0 : Math.min(1, Math.max(0, ((point[0] - start[0]) * along[0]! + (point[1] - start[1]) * along[1]! + (point[2] - start[2]) * along[2]!) / reach));
        nearest = Math.min(nearest, Math.hypot(point[0] - start[0] - share * along[0]!, point[1] - start[1] - share * along[1]!, point[2] - start[2] - share * along[2]!));
    }
    return nearest;
};

const splinePoints = (spline: Inputs.IO.DrawingSplineSegmentDto, count: number): Point3[] => {
    const points = spline.controlPoints.map((point): Point3 => [point[0], point[1], 0]);
    const knots = spline.knots!;
    const degree = spline.degree!;
    const first = knots[degree]!;
    const last = knots[points.length]!;
    return Array.from({ length: count + 1 }, (_, at) => nurbsCurvePoint(degree, points, spline.weights, knots, first + ((last - first) * at) / count));
};

const FULL_TURN = 2 * Math.PI;

type DrawingEllipse = Inputs.IO.DrawingEllipseSegmentDto;

const sweepOf = (ellipse: DrawingEllipse): number => {
    const start = ellipse.startParameter!;
    const end = ellipse.endParameter!;
    return end >= start ? end - start : end + FULL_TURN - start;
};

const ellipseArcPoints = (ellipse: DrawingEllipse, count: number): Point3[] => {
    const [cx, cy] = ellipse.center;
    const [mx, my] = ellipse.majorAxis;
    return Array.from({ length: count + 1 }, (_, at): Point3 => {
        const t = ellipse.startParameter! + (sweepOf(ellipse) * at) / count;
        return [cx + Math.cos(t) * mx - Math.sin(t) * ellipse.ratio * my, cy + Math.cos(t) * my + Math.sin(t) * ellipse.ratio * mx, 0];
    });
};

const crossesParameterZero = (ellipse: DrawingEllipse): boolean =>
    Math.floor(ellipse.startParameter! / FULL_TURN) !== Math.floor((ellipse.startParameter! + sweepOf(ellipse)) / FULL_TURN);

const ellipsesIn = (paths: DrawingPath[]): DrawingEllipse[] =>
    paths.flatMap(path => path.segments).filter((segment): segment is DrawingEllipse => "ratio" in segment);

const tracedPolylines = (paths: DrawingPath[]): Point3[][] => paths.flatMap(path => path.segments.map(segment => {
    const polyline = segment as Inputs.IO.DrawingPolylineSegmentDto;
    const points = polyline.points.map((point): Point3 => [point[0], point[1], 0]);
    return polyline.closed ? [...points, points[0]!] : points;
}));

const farthestFromPolylines = (points: Point3[], polylines: Point3[][]): number =>
    Math.max(...points.map(point => Math.min(...polylines.map(polyline => distanceToPolyline(point, polyline)))));

describe("OCCT io drawing paths with exact curves", () => {
    let occt: BitbybitOcctModule;
    let occHelper: OccHelper;
    let service: OCCTService;
    let io: OCCTIO;
    let wire: OCCTWire;

    beforeAll(async () => {
        occt = await createBitbybitOcct();
        occHelper = new OccHelper(occt);
        service = new OCCTService(occt, occHelper);
        wire = new OCCTWire(occt, occHelper);
        io = new OCCTIO(occt, occHelper);
    });

    const flat = (points: Point3[]): Point3[] => points.map((point): Point3 => [point[0], point[2], 0]);

    it("should keep an interpolated curve as one spline, every point of which lies on the wire seen from above", () => {
        // Arrange
        const curve = wire.interpolatePoints({ points: [[0, 0, 0], [5, 0, 5], [10, 0, 2], [15, 0, 8]], periodic: false, tolerance: 1e-7 });
        const truth = flat(wire.divideWireByEqualDistanceToPoints({ shape: curve, nrOfDivisions: 20000, removeStartPoint: false, removeEndPoint: false }));

        // Act
        const paths = io.shapeToDxfPaths({ shape: curve });

        // Assert
        expect(paths).toHaveLength(1);
        expect(paths[0]!.segments).toHaveLength(1);
        const spline = paths[0]!.segments[0] as Inputs.IO.DrawingSplineSegmentDto;
        expect(spline.degree).toBe(3);
        expect(spline.weights).toBeUndefined();
        const written = splinePoints(spline, 300);
        expect(Math.max(...written.map(point => distanceToPolyline(point, truth)))).toBeLessThan(1e-6);
        expect(written[0]).toEqual([0, 0, 0]);
        written[written.length - 1]!.forEach((value, axis) => expect(value).toBeCloseTo([15, 8, 0][axis]!, 9));
    });

    it("should keep an ellipse lying on the ground as an ellipse, and trace it as points when asked", () => {
        // Arrange
        const ellipse = wire.createEllipseWire({ center: [1, 0, 2], direction: [0, 1, 0], radiusMinor: 2, radiusMajor: 5 });

        // Act
        const exact = io.shapeToDxfPaths({ shape: ellipse });
        const traced = io.shapeToDxfPaths({ shape: ellipse, exactCurves: false });

        // Assert
        const segment = exact[0]!.segments[0] as Inputs.IO.DrawingEllipseSegmentDto;
        expect(segment.center).toEqual([1, 2]);
        expect(Math.hypot(...segment.majorAxis)).toBeCloseTo(5, 12);
        expect(segment.ratio).toBeCloseTo(0.4, 12);
        expect(segment.endParameter! - segment.startParameter!).toBeCloseTo(2 * Math.PI, 12);
        expect((traced[0]!.segments[0] as Inputs.IO.DrawingPolylineSegmentDto).points.length).toBeGreaterThan(8);
    });

    it("should draw a tilted circle as the rational spline its shadow is, not as a circle", () => {
        // Arrange
        const tilt = Math.PI / 4;
        const circle = wire.createCircleWire({ radius: 4, center: [0, 3, 0], direction: [0, Math.cos(tilt), Math.sin(tilt)] });

        // Act
        const paths = io.shapeToDxfPaths({ shape: circle });

        // Assert
        const spline = paths[0]!.segments[0] as Inputs.IO.DrawingSplineSegmentDto;
        expect(spline.weights).toBeDefined();
        for (const point of splinePoints(spline, 200)) {
            const across = point[0] / 4;
            const along = point[1] / (4 * Math.cos(tilt));
            expect(across * across + along * along).toBeCloseTo(1, 9);
        }
    });

    it("should write a part with a round hole, an elliptic slot and a spline edge into DXF and SVG with every curve kept", () => {
        // Arrange
        const outline = wire.createRectangleWire({ width: 60, length: 40, center: [0, 0, 0], direction: [0, 1, 0] });
        const hole = wire.createCircleWire({ radius: 3, center: [-15, 0, 5], direction: [0, 1, 0] });
        const slot = wire.createEllipseWire({ center: [10, 0, 0], direction: [0, 1, 0], radiusMinor: 3, radiusMajor: 8 });
        const wave = wire.interpolatePoints({ points: [[-20, 0, -12], [-5, 0, -8], [10, 0, -14], [20, 0, -10]], periodic: false, tolerance: 1e-7 });
        const shapes: TopoDS_Shape[] = [outline, hole, slot, wave];
        const paths = shapes.flatMap(shape => io.shapeToDxfPaths({ shape }));
        const part = io.dxfPathsWithLayer({ paths, layer: "cut", color: "#ff0000" });

        // Act
        const dxf = io.dxfCreate({ pathsParts: [part], tryDownload: false });
        const r12 = io.dxfCreate({ pathsParts: [part], tryDownload: false, acadVersion: "AC1009" as Inputs.OCCT.dxfAcadVersionEnum });
        const svg = io.svgCreate({ layers: [io.svgLayer({ shapes, layer: "cut", color: "#ff0000" })], tryDownload: false });

        // Assert
        expect(dxf).toContain("$ACADVER\n1\nAC1015\n");
        expect(dxf.match(/\n0\n(LWPOLYLINE|CIRCLE|ELLIPSE|SPLINE)\n/g)).toEqual(["\n0\nLWPOLYLINE\n", "\n0\nCIRCLE\n", "\n0\nELLIPSE\n", "\n0\nSPLINE\n"]);
        expect(r12).not.toMatch(/\n0\n(LWPOLYLINE|ELLIPSE|SPLINE)\n/);
        expect(svg.match(/<path d="[^"]*"\/>/g)).toHaveLength(4);
        expect(svg).toMatch(/<path d="M[^"]* A3 3 [^"]*"\/>/);
        expect(svg).toMatch(/<path d="M[^"]* A8 3 [^"]*"\/>/);
        expect(svg).toMatch(/<path d="M[^"]* C[^"]*"\/>/);
    });

    const ARC_FROM = 5.5;
    const ARC_TO = 7;
    const ARC_SAMPLES = 64;
    const OBLIQUE_VIEW: Inputs.Base.Frame = { origin: [0, 0, 0], normal: [0, 1, 1], direction: [1, 0, 0] };
    const VIEW_PRECISION = 0.001;

    const ellipseArcAcrossZero = (direction: Point3, reversed: boolean): TopoDS_Edge => {
        const ellipse = service.shapes.edge.createEllipseEdge({ center: [1, 0, 2], direction, radiusMinor: 2, radiusMajor: 5 });
        const arc = occt.TrimEdgeToParams(ellipse, ARC_FROM, ARC_TO);
        ellipse.delete();
        if (!reversed) {
            return arc;
        }
        const turned = service.shapes.edge.reversedEdge({ shape: arc });
        arc.delete();
        return turned;
    };

    const cutCylinder = (): TopoDS_Shape => {
        const cylinder = service.shapes.solid.createCylinder({ radius: 5, height: 8, center: [0, 0, 0], direction: [0, 1, 0] });
        const back = service.shapes.solid.createBox({ width: 20, length: 10, height: 20, center: [0, 4, -7.5] });
        const cut = service.booleans.difference({ shape: cylinder, shapes: [back], keepEdges: false });
        cylinder.delete();
        back.delete();
        return cut;
    };

    const viewPolylines = (shape: TopoDS_Shape): Point3[][][] => {
        const lines = occt.HiddenLines(shape, numbersOfFrames([OBLIQUE_VIEW]), true, false, true, false, 0, VIEW_PRECISION);
        try {
            return [lines.hidden, lines.visible].map(drawing => {
                occt.BRepLib_BuildCurves3d(drawing);
                const upright = viewOntoDrawingPlane(occHelper, drawing);
                try {
                    return tracedPolylines(occHelper.drawingService.pathsOfShape({ shape: upright, ...exactTracing(VIEW_PRECISION), exactCurves: false }));
                } finally {
                    upright.delete();
                }
            });
        } finally {
            lines.visible.delete();
            lines.hidden.delete();
        }
    };

    it.each([
        { frame: "up", direction: [0, 1, 0] as Point3, reversed: false },
        { frame: "up", direction: [0, 1, 0] as Point3, reversed: true },
        { frame: "down", direction: [0, -1, 0] as Point3, reversed: false },
        { frame: "down", direction: [0, -1, 0] as Point3, reversed: true },
    ])("should trace an elliptic arc across parameter 0 on a frame facing $frame along its edge, reversed $reversed", ({ direction, reversed }) => {
        // Arrange
        const arc = ellipseArcAcrossZero(direction, reversed);
        const truth = flat(service.shapes.edge.divideEdgeByEqualDistanceToPoints({ shape: arc, nrOfDivisions: 2000, removeStartPoint: false, removeEndPoint: false }));

        // Act
        const paths = io.shapeToDxfPaths({ shape: arc });

        // Assert
        const traced = paths[0]!.segments[0] as DrawingEllipse;
        expect(crossesParameterZero(traced)).toBe(true);
        expect(sweepOf(traced)).toBeCloseTo(ARC_TO - ARC_FROM, 9);
        expect(farthestFromPolylines(ellipseArcPoints(traced, ARC_SAMPLES), [truth])).toBeLessThan(1e-6);
        arc.delete();
    });

    it("should trace the partial ellipses an oblique view of a cut cylinder sees and hides along the edges it draws", () => {
        // Arrange
        const cut = cutCylinder();
        const [hiddenTruth, visibleTruth] = viewPolylines(cut);

        // Act
        const [hidden, visible] = viewParts(occt, occHelper, checkedView(cut, OBLIQUE_VIEW, VIEW_PRECISION, undefined), true);

        // Assert
        const arcs = [ellipsesIn(hidden!.paths), ellipsesIn(visible!.paths)];
        expect(arcs.map(list => list.length > 0 && list.every(arc => sweepOf(arc) < Math.PI + 1e-9))).toEqual([true, true]);
        expect(farthestFromPolylines(arcs[0]!.flatMap(arc => ellipseArcPoints(arc, ARC_SAMPLES)), hiddenTruth!)).toBeLessThan(2 * VIEW_PRECISION);
        expect(farthestFromPolylines(arcs[1]!.flatMap(arc => ellipseArcPoints(arc, ARC_SAMPLES)), visibleTruth!)).toBeLessThan(2 * VIEW_PRECISION);
        cut.delete();
    });
});
