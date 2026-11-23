import { describe, it, expect, beforeAll } from "vitest";
import type { BitbybitOcctModule, TopoDS_Shape } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OCCTService } from "../occ-service";
import * as Inputs from "../api/inputs";
import type * as Models from "../api/models";
import { BaseBitByBit, InputError } from "@bitbybit-dev/base";
import { ledgerRun, namesOf } from "../../../__test__/embind-ledger";

type Point3 = Inputs.Base.Point3;

const MISSING: unknown = undefined;
type Section = Models.OCCT.HatchedSection<TopoDS_Shape>;
type Cap = Models.OCCT.HatchedSectionCap<TopoDS_Shape>;

describe("OCCT hatched sections", () => {
    let occt: OCCTService;
    let kernel: BitbybitOcctModule;

    beforeAll(async () => {
        kernel = await createBitbybitOcct();
        occt = new OCCTService(kernel);
    }, 120_000);

    const level = (y: number): Inputs.Base.Frame => ({ origin: [0, y, 0], normal: [0, 1, 0], direction: [1, 0, 0] });
    const cube = (center: Point3 = [0, 5, 0], size = 10): TopoDS_Shape => occt.shapes.solid.createBox({ width: size, length: size, height: size, center });
    const holedCube = (): TopoDS_Shape => occt.booleans.difference({
        shape: cube(),
        shapes: [occt.shapes.solid.createCylinder({ radius: 3, height: 20, center: [0, -5, 0], direction: [0, 1, 0] })],
        keepEdges: false,
    });
    const forked = (): TopoDS_Shape => occt.booleans.difference({
        shape: cube(),
        shapes: [occt.shapes.solid.createBox({ width: 4, length: 20, height: 8, center: [0, 7, 0] })],
        keepEdges: false,
    });
    const edgesOf = (shape: TopoDS_Shape): TopoDS_Shape[] => occt.shapes.edge.getEdges({ shape });
    const ends = (edge: TopoDS_Shape): [Point3, Point3] => [occt.shapes.edge.startPointOnEdge({ shape: edge }), occt.shapes.edge.endPointOnEdge({ shape: edge })];
    const lengthOf = (shape: TopoDS_Shape): number => edgesOf(shape).reduce((sum, edge) => sum + occt.shapes.edge.getEdgeLength({ shape: edge }), 0);
    const areaOf = (face: TopoDS_Shape): number => occt.shapes.face.getFaceArea({ shape: face });
    const perimeterOf = (face: TopoDS_Shape): number => lengthOf(face);
    const along = (point: Point3, origin: Point3, axis: Point3): number => (point[0] - origin[0]) * axis[0] + (point[1] - origin[1]) * axis[1] + (point[2] - origin[2]) * axis[2];
    const unit = (vector: Point3): Point3 => {
        const size = Math.hypot(vector[0], vector[1], vector[2]);
        return [vector[0] / size, vector[1] / size, vector[2] / size];
    };
    const cross = (a: Point3, b: Point3): Point3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const middleOf = ([start, end]: [Point3, Point3]): Point3 => [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2, (start[2] + end[2]) / 2];
    const pointsOfPaths = (paths: Inputs.IO.DrawingPathDto[]): Inputs.Base.Point2[] => paths.flatMap(path => path.segments.flatMap(segment => {
        if ("start" in segment) {
            return [segment.start as Inputs.Base.Point2, segment.end as Inputs.Base.Point2];
        }
        if ("points" in segment) {
            return segment.points as Inputs.Base.Point2[];
        }
        if ("radius" in segment && "center" in segment) {
            const center = segment.center as Inputs.Base.Point2;
            return [[center[0] - segment.radius, center[1] - segment.radius], [center[0] + segment.radius, center[1] + segment.radius]] as Inputs.Base.Point2[];
        }
        return [];
    }));
    const boundsOf = (points: Inputs.Base.Point2[]): number[] => [
        Math.min(...points.map(point => point[0])), Math.min(...points.map(point => point[1])),
        Math.max(...points.map(point => point[0])), Math.max(...points.map(point => point[1])),
    ];
    const thrownBy = (action: () => unknown): InputError => {
        try {
            action();
        } catch (error) {
            expect(error).toBeInstanceOf(InputError);
            return error as InputError;
        }
        throw new Error("expected an InputError, but nothing was thrown");
    };
    const capsOf = (section: Section): Cap[] => section.shapes.flatMap(cut => cut.caps);
    const expectAreaOracle = (cap: Cap, spacing: number, tolerance: number): void => {
        const area = areaOf(cap.face);
        const perimeter = perimeterOf(cap.face);
        expect(Math.abs(lengthOf(cap.lines) * spacing - area)).toBeLessThanOrEqual(spacing * perimeter + perimeter * tolerance);
    };

    it("should hatch the cut face of a box with a bore, its lines in the plane, inside the face and summing to its area", () => {
        // Arrange
        const spacing = 0.25;

        // Act
        const section = occt.operations.hatchedSectionByFrame({ shapes: [holedCube()], frame: level(5), spacing, angle: 45 });
        const cap = section.shapes[0]!.caps[0]!;
        const segments = edgesOf(cap.lines).map(ends);
        const middles = segments.map(middleOf);
        const distances = occt.operations.distancesToShapeFromPoints({ shape: cap.face, points: middles });

        // Assert
        expect(section.shapes).toHaveLength(1);
        expect(section.shapes[0]!.caps).toHaveLength(1);
        expect(section.shapes[0]!.angle).toBe(45);
        expect(areaOf(cap.face)).toBeCloseTo(100 - Math.PI * 9, 6);
        expectAreaOracle(cap, spacing, 0.01);
        expect(Math.abs(lengthOf(cap.lines) * spacing - areaOf(cap.face))).toBeLessThan(0.5);
        segments.flat().forEach(point => expect(point[1]).toBeCloseTo(5, 9));
        distances.forEach(distance => expect(distance).toBeLessThan(1e-6));
        expect(middles.every(point => Math.hypot(point[0], point[2]) > 3 - 0.01)).toBe(true);
        segments.forEach(([start, end]) => expect(Math.abs(end[0] - start[0])).toBeCloseTo(Math.abs(end[2] - start[2]), 6));
    });

    it("should give the cut face's boundaries in the frame's coordinates, the bore an exact circle, with the pattern, angle and spacing", () => {
        // Act
        const section = occt.operations.hatchedSectionByFrame({ shapes: [holedCube()], frame: level(5), spacing: 2, pattern: Inputs.IO.hatchPatternEnum.ansi37, angle: 30 });
        const hatch = section.shapes[0]!.caps[0]!.hatch;
        const circles = hatch.boundaries.flatMap(path => path.segments).filter((segment): segment is Inputs.IO.DrawingCircleSegmentDto => "radius" in segment && !("startAngle" in segment));

        // Assert
        expect(hatch.pattern).toBe(Inputs.IO.hatchPatternEnum.ansi37);
        expect(hatch.angle).toBe(30);
        expect(hatch.spacing).toBe(2);
        expect(hatch.boundaries).toHaveLength(2);
        expect(circles).toHaveLength(1);
        expect(circles[0]!.radius).toBeCloseTo(3, 9);
        expect(circles[0]!.center[0]).toBeCloseTo(0, 9);
        expect(circles[0]!.center[1]).toBeCloseTo(0, 9);
        boundsOf(pointsOfPaths(hatch.boundaries)).forEach((bound, at) => expect(bound).toBeCloseTo([-5, -5, 5, 5][at]!, 9));
    });

    it("should give a part that the plane cuts in two places two cut faces, hatched at the same angle", () => {
        // Arrange
        const spacing = 0.2;

        // Act
        const section = occt.operations.hatchedSectionByFrame({ shapes: [forked()], frame: level(6), spacing, angle: 45 });
        const caps = section.shapes[0]!.caps;
        const xs = caps.map(cap => occt.operations.boundingBoxCenterOfShape({ shape: cap.face })[0]).sort((a, b) => a - b);

        // Assert
        expect(caps).toHaveLength(2);
        expect(caps.map(cap => cap.hatch.angle)).toEqual([45, 45]);
        expect(xs[0]).toBeCloseTo(-3.5, 6);
        expect(xs[1]).toBeCloseTo(3.5, 6);
        caps.forEach(cap => expectAreaOracle(cap, spacing, 0.01));
        caps.forEach(cap => expect(areaOf(cap.face)).toBeCloseTo(30, 6));
    });

    it("should hatch a cut along a slanted frame in the plane, at the angle from the frame's direction, and give the boundaries in its coordinates", () => {
        // Arrange
        const frame: Inputs.Base.Frame = { origin: [0.5, 4, -0.5], normal: [1, 1, 1], direction: [1, -1, 0] };
        const normal = unit(frame.normal);
        const direction = unit(frame.direction);
        const spacing = 0.2;

        // Act
        const section = occt.operations.hatchedSectionByFrame({ shapes: [holedCube()], frame, spacing, angle: 0 });
        const cap = section.shapes[0]!.caps[0]!;
        const segments = edgesOf(cap.lines).map(ends);
        const corners = occt.shapes.vertex.getVerticesAsPoints({ shape: cap.face });
        const yAxis = unit(cross(normal, direction));
        const local = corners.map(point => [along(point, frame.origin, direction), along(point, frame.origin, yAxis)] as Inputs.Base.Point2);
        const drawn = boundsOf(pointsOfPaths(cap.hatch.boundaries.filter(path => path.segments.every(segment => !("radius" in segment)))));

        // Assert
        section.frame.normal.forEach((value, at) => expect(value).toBeCloseTo(normal[at]!, 12));
        section.frame.direction.forEach((value, at) => expect(value).toBeCloseTo(direction[at]!, 12));
        expect(segments.length).toBeGreaterThan(10);
        segments.flat().forEach(point => expect(along(point, frame.origin, normal)).toBeCloseTo(0, 9));
        segments.forEach(([start, end]) => expect(Math.abs(along(end, start, direction))).toBeCloseTo(Math.hypot(end[0] - start[0], end[1] - start[1], end[2] - start[2]), 6));
        expectAreaOracle(cap, spacing, 0.01);
        boundsOf(local).forEach((bound, at) => expect(drawn[at]).toBeCloseTo(bound, 6));
    });

    it("should hatch neighbouring parts at different angles keyed to each part, a far one at the first angle and a missed one with no caps", () => {
        // Arrange
        const left = cube([-5, 5, 0]);
        const right = cube([5, 5, 0]);
        const above = cube([-7, 5, 10]);
        const far = cube([40, 5, 0]);
        const missed = cube([0, 50, 0]);

        // Act
        const section = occt.operations.hatchedSectionByFrame({ shapes: [left, right, above, far, missed], frame: level(5), spacing: 1, angle: 45 });
        const same = occt.operations.hatchedSectionByFrame({ shapes: [left, right], frame: level(5), spacing: 1, angle: 45, neighbourAngles: false });
        const reordered = occt.operations.hatchedSectionByFrame({ shapes: [far, right, left], frame: level(5), spacing: 1, angle: 45 });

        // Assert
        expect(section.shapes.map(cut => cut.angle)).toEqual([45, 135, 135, 45, 45]);
        expect(section.shapes.map(cut => cut.caps.length)).toEqual([1, 1, 1, 1, 0]);
        section.shapes.forEach(cut => cut.caps.forEach(cap => expect(cap.hatch.angle).toBe(cut.angle)));
        expect(same.shapes.map(cut => cut.angle)).toEqual([45, 45]);
        expect(reordered.shapes.map(cut => cut.angle)).toEqual([45, 45, 135]);
    });

    it("should take a third angle for a part that touches two parts already hatched across each other", () => {
        // Arrange
        const shapes = [cube([-5, 5, 0]), cube([5, 5, 0]), cube([0, 5, 10])];

        // Act
        const section = occt.operations.hatchedSectionByFrame({ shapes, frame: level(5), spacing: 1, angle: 45 });

        // Assert
        expect(section.shapes.map(cut => cut.angle)).toEqual([45, 135, 75]);
    });

    it("should line the hatch up with hiddenLines drawn from the same frame, so both write to one drawing", () => {
        // Arrange
        const frame: Inputs.Base.Frame = { origin: [1, 5, 2], normal: [0, 1, 0], direction: [0, 0, 1] };
        const kept = occt.operations.cutByFrames({ shapes: [holedCube()], frames: [frame] })[0]!;

        // Act
        const section = occt.operations.hatchedSectionByFrame({ shapes: [holedCube()], frame, spacing: 1 });
        const view = occt.operations.hiddenLines({ shape: kept, frame, exact: true, smoothEdges: false, hiddenEdges: false, focus: 0, precision: 0.01, tidy: false });
        const drawn = occt.io.shapeToDxfPaths({ shape: view.visible });
        const hatch = section.shapes[0]!.caps[0]!.hatch;

        // Assert
        boundsOf(pointsOfPaths(drawn)).forEach((bound, at) => expect(boundsOf(pointsOfPaths(hatch.boundaries))[at]).toBeCloseTo(bound, 6));
        expect(boundsOf(pointsOfPaths(hatch.boundaries))).toEqual([expect.closeTo(-7, 6), expect.closeTo(-6, 6), expect.closeTo(3, 6), expect.closeTo(4, 6)]);
    });

    it("should write the hatches as DXF and SVG through a drawing part", () => {
        // Arrange
        const section = occt.operations.hatchedSectionByFrame({ shapes: [forked(), holedCube()], frame: level(6), spacing: 1, neighbourAngles: false });
        const hatches = capsOf(section).map(cap => cap.hatch);
        const part: Inputs.IO.DrawingPartDto = { layer: "hatch", paths: hatches.flatMap(hatch => hatch.boundaries), hatches };

        // Act
        const dxf = occt.io.dxfCreate({ pathsParts: [part] });
        const svg = new BaseBitByBit().io.svg.svgCreate({ parts: [part] });

        // Assert
        expect(hatches).toHaveLength(3);
        expect(dxf.match(/\nHATCH\r?\n/g)).toHaveLength(3);
        expect(svg.match(/fill-rule="evenodd"/g)).toHaveLength(3);
    });

    it("should give a solid pattern no lines and leave nothing alive beside its answer", () => {
        // Arrange
        const shapes = [holedCube(), cube([20, 5, 0])];

        // Act
        const run = ledgerRun(() => occt.operations.hatchedSectionByFrame({ shapes, frame: level(5), pattern: Inputs.IO.hatchPatternEnum.solid }));

        // Assert
        expect(namesOf(run.leaked)).toEqual([]);
        expect(run.thrown).toBeUndefined();
        capsOf(run.result!).forEach(cap => expect(edgesOf(cap.lines)).toHaveLength(0));
    });

    it("should leave nothing alive when a hatch is refused part way through", () => {
        // Arrange
        const shapes = [holedCube(), cube([20, 5, 0], 1000)];

        // Act
        const run = ledgerRun(() => occt.operations.hatchedSectionByFrame({ shapes, frame: level(5), spacing: 0.001 }));

        // Assert
        expect(namesOf(run.leaked)).toEqual([]);
        expect(run.thrown).toStrictEqual(new InputError("`spacing` is 0.001 for a region that would take more than 200000 lines: widen the spacing.", "spacing"));
    });

    it("should refuse a frame whose direction runs along its normal, a spacing not above 0, an unknown pattern and a missing shape", () => {
        // Arrange
        const shapes = [cube()];

        // Act
        const along = thrownBy(() => occt.operations.hatchedSectionByFrame({ shapes, frame: { origin: [0, 0, 0], normal: [0, 1, 0], direction: [0, 2, 0] } }));
        const flat = thrownBy(() => occt.operations.hatchedSectionByFrame({ shapes, frame: level(5), spacing: 0 }));
        const pattern = thrownBy(() => occt.operations.hatchedSectionByFrame({ shapes, frame: level(5), pattern: "brick" as Inputs.IO.hatchPatternEnum }));
        const curve = thrownBy(() => occt.operations.hatchedSectionByFrame({ shapes, frame: level(5), curveTolerance: 0 }));
        const missing = thrownBy(() => occt.operations.hatchedSectionByFrame({ shapes: [MISSING as TopoDS_Shape], frame: level(5) }));

        // Assert
        expect(along.property).toBe("frame");
        expect(flat.message).toBe("`spacing` must be a finite number above 0; it is 0.");
        expect(pattern.message).toBe("`pattern` is brick, which is none of solid, ansi31, ansi32, ansi37.");
        expect(curve.property).toBe("curveTolerance");
        expect(missing.property).toBe("shapes");
    });
});
