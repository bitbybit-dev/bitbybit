import { describe, it, expect, beforeAll } from "vitest";
import type { BitbybitOcctModule, TopoDS_Edge, TopoDS_Face, TopoDS_Shape, TopoDS_Wire } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../occ-helper";
import { OCCTService } from "../occ-service";
import * as Inputs from "../api/inputs";
import { HistoryOracles, nameOf, outcomeOf, refusalParity } from "../__test__/history-oracles";
import type { Outcome } from "../__test__/history-oracles";
import { namesOf, openWindow } from "../../../__test__/embind-ledger";

const NAMED_REFUSALS = ["InputError", "KernelOperationError"];

describe("OCCT operations on the inputs real models give them", () => {
    let kernel: BitbybitOcctModule;
    let occt: OCCTService;
    let oracles: HistoryOracles;

    beforeAll(async () => {
        kernel = await createBitbybitOcct();
        occt = new OCCTService(kernel, new OccHelper(kernel));
        oracles = new HistoryOracles(occt);
    }, 120_000);

    const box = (size = 10, center: Inputs.Base.Point3 = [0, 0, 0]): TopoDS_Shape => occt.shapes.solid.createBox({ width: size, length: size, height: size, center });
    const circle = (radius: number, height: number): TopoDS_Wire => occt.shapes.wire.createCircleWire({ radius, center: [0, height, 0], direction: [0, 1, 0] });
    const square = (size: number, height: number): TopoDS_Wire => occt.shapes.wire.createSquareWire({ size, center: [0, height, 0], direction: [0, 1, 0] });
    const leftAliveBy = <T>(act: () => T): { outcome: Outcome<T>; alive: string[] } => {
        const opened = openWindow();
        try {
            return { outcome: outcomeOf(act), alive: namesOf(opened.made().filter(handle => !handle.isDeleted())) };
        } finally {
            opened.close();
        }
    };
    const validOrRefused = (outcome: Outcome<TopoDS_Shape>): string => outcome.value === undefined
        ? `refused with ${nameOf(outcome.thrown)}`
        : `${occt.shapeFix.isValid({ shape: outcome.value }) ? "valid" : "not valid"}, holding ${oracles.volume(outcome.value)}`;

    describe("booleans of shapes that touch, coincide or barely meet", () => {
        it("should fuse two boxes that share a face into one box of both volumes with six faces", () => {
            // Act
            const fused = occt.booleans.union({ shapes: [box(), box(10, [10, 0, 0])], keepEdges: false });

            // Assert
            expect([occt.shapes.solid.getSolids({ shape: fused }).length, oracles.counts(fused).faces, oracles.volume(fused)]).toEqual([1, 6, expect.closeTo(2000, 9)]);
        });

        it.each([
            ["an edge", [10, 10, 0]],
            ["a corner", [10, 10, 10]],
        ] as [string, Inputs.Base.Point3][])("should keep two boxes that touch only at %s as two solids", (_where, center) => {
            // Act
            const fused = occt.booleans.union({ shapes: [box(), box(10, center)], keepEdges: false });

            // Assert
            expect([occt.shapes.solid.getSolids({ shape: fused }).length, oracles.volume(fused)]).toEqual([2, expect.closeTo(2000, 9)]);
        });

        it("should leave nothing of a box cut by itself, and half of it cut by a box sharing three of its faces", () => {
            // Act
            const nothing = occt.booleans.difference({ shape: box(), shapes: [box()], keepEdges: false });
            const half = occt.booleans.difference({ shape: box(), shapes: [occt.shapes.solid.createBox({ width: 5, length: 10, height: 10, center: [2.5, 0, 0] })], keepEdges: false });

            // Assert
            expect([occt.shapes.solid.getSolids({ shape: nothing }).length, oracles.counts(nothing).faces]).toEqual([0, 0]);
            expect([occt.shapes.solid.getSolids({ shape: half }).length, oracles.counts(half).faces, oracles.volume(half)]).toEqual([1, 6, expect.closeTo(500, 9)]);
        });

        it("should refuse to fuse a solid with a face as shapes of different dimensions", () => {
            // Act
            const act = (): TopoDS_Shape => occt.booleans.union({ shapes: [box(), occt.shapes.face.createSquareFace({ size: 4, center: [0, 8, 0], direction: [0, 1, 0] })], keepEdges: false });

            // Assert
            expect(act).toThrow(expect.objectContaining({ name: "KernelOperationError", code: "occt.boolean.mixedDimensions" }));
        });
    });

    describe("fillets and chamfers that just fit, or just do not", () => {
        it("should round both ends of a rod with a radius as big as the rod's into a capsule", () => {
            // Arrange
            const rod = occt.shapes.solid.createCylinder({ radius: 2, height: 10, center: [0, 0, 0], direction: [0, 1, 0] });

            // Act
            const capsule = occt.fillets.filletEdges({ shape: rod, radius: 2 });

            // Assert
            expect(occt.shapeFix.isValid({ shape: capsule })).toBe(true);
            expect(oracles.volume(capsule)).toBeCloseTo(Math.PI * 4 * 6 + 4 / 3 * Math.PI * 8, 6);
        });

        it("should round the rims of a hole drilled through a box", () => {
            // Arrange
            const drilled = occt.booleans.difference({ shape: box(), shapes: [occt.shapes.solid.createCylinder({ radius: 2, height: 20, center: [0, -10, 0], direction: [0, 1, 0] })], keepEdges: false });
            const rims = occt.shapes.edge.getEdges({ shape: drilled }).flatMap((edge, index) => occt.shapes.edge.isEdgeCircular({ shape: edge }) ? [index] : []);

            // Act
            const rounded = occt.fillets.filletEdges({ shape: drilled, radius: 0.5, indexes: rims });

            // Assert
            expect(rims).toHaveLength(2);
            expect(occt.shapeFix.isValid({ shape: rounded })).toBe(true);
            expect(oracles.counts(rounded).faces).toBe(9);
        });

        it("should refuse a radius of 0 and below before the kernel runs, naming the radius", () => {
            // Act
            const zero = outcomeOf(() => occt.fillets.filletEdges({ shape: box(), radius: 0 }));
            const below = outcomeOf(() => occt.fillets.filletEdges({ shape: box(), radius: -1 }));

            // Assert
            expect([zero.thrown, below.thrown]).toEqual([
                expect.objectContaining({ name: "InputError", property: "radius", message: "`radius` is 0, but a radius is a finite number above 0." }),
                expect.objectContaining({ name: "InputError", property: "radius", message: "`radius` is -1, but a radius is a finite number above 0." }),
            ]);
        });

        it("should refuse a bevel at an edge the box does not have, as a fillet there is refused", () => {
            // Act
            const filleted = outcomeOf(() => occt.fillets.filletEdges({ shape: box(), radius: 1, indexes: [12] }));
            const chamfered = outcomeOf(() => occt.fillets.chamferEdges({ shape: box(), distance: 1, indexes: [12] }));

            // Assert
            expect(filleted.thrown).toBeInstanceOf(Error);
            expect(chamfered.thrown).toBeInstanceOf(Error);
        });

        it("should refuse to round the edges of a lone face with a named failure rather than the kernel's own error", () => {
            // Act
            const rounded = outcomeOf(() => occt.fillets.filletEdges({ shape: occt.shapes.face.createSquareFace({ size: 4, center: [0, 0, 0], direction: [0, 1, 0] }), radius: 0.1 }));

            // Assert
            expect(NAMED_REFUSALS).toContain(nameOf(rounded.thrown));
        });

        it("should refuse two edges a fillet that does not fit them with a fillet failure, not an input error on a property it has not got", () => {
            // Arrange
            const edge1 = occt.shapes.edge.line({ start: [0, 0, 0], end: [4, 0, 0] });
            const edge2 = occt.shapes.edge.line({ start: [4, 0, 0], end: [4, 0, 4] });

            // Act
            const act = (): TopoDS_Wire => occt.fillets.filletTwoEdgesInPlaneIntoAWire({ edge1, edge2, planeOrigin: [0, 0, 0], planeDirection: [0, 1, 0], radius: 50, solution: -1 });

            // Assert
            expect(act).toThrow(expect.objectContaining({ name: "KernelOperationError", code: "occt.fillet.failed" }));
        });
    });

    describe("fillets of open channels, of spiked outlines and of edges taken from what a body was built from", () => {
        const rim = (keepLines: Inputs.OCCT.twoSidesStrictEnum, circleRemainders: Inputs.OCCT.fourSidesStrictEnum): TopoDS_Wire => occt.shapes.wire.createWireFromTwoCirclesTan({
            circle1: circle(4.6, 0),
            circle2: occt.shapes.wire.createCircleWire({ radius: 2.9, center: [19.5, 0, 0], direction: [0, 1, 0] }),
            keepLines,
            circleRemainders,
            tolerance: 1e-7,
        });
        const channel = (): TopoDS_Shape => {
            const strip = occt.shapes.face.createFaceFromWire({ shape: occt.shapes.wire.createPolygonWire({ points: [[0, 0, 0], [1, 0, 0], [1, 7.986355, 6.01815], [0, 7.986355, 6.01815]] }), planar: true });
            const lipOutline = occt.shapes.wire.createPolylineWire({ points: [[1, 7.986355, 6.01815], [1, 7.386355, 6.01815], [1, -0.6, 0], [1, 0, 0]] });
            const lip = occt.shapes.face.createFaceFromWire({
                shape: occt.shapes.wire.combineEdgesAndWiresIntoAWire({ shapes: [
                    occt.fillets.fillet2d({ shape: lipOutline, radius: 0.12 }),
                    occt.shapes.wire.createLineWire({ start: [1, 0, 0], end: [1, 7.986355, 6.01815] }),
                ] }),
                planar: true,
            });
            return occt.shapes.shell.sewFaces({ shapes: [strip, lip], tolerance: 1e-7 });
        };

        it.each([
            ["filletEdges", (shape: TopoDS_Shape): TopoDS_Shape => occt.fillets.filletEdges({ shape, radius: 0.225 })],
            ["filletEdges by indexes", (shape: TopoDS_Shape): TopoDS_Shape => occt.fillets.filletEdges({ shape, radiusList: occt.shapes.edge.getEdges({ shape }).map(() => 0.225), indexes: occt.shapes.edge.getEdges({ shape }).map((_edge, index) => index) })],
            ["filletEdgesList", (shape: TopoDS_Shape): TopoDS_Shape => occt.fillets.filletEdgesList({ shape, edges: occt.shapes.edge.getEdges({ shape }), radiusList: occt.shapes.edge.getEdges({ shape }).map(() => 0.225) })],
            ["filletEdgesListOneRadius", (shape: TopoDS_Shape): TopoDS_Shape => occt.fillets.filletEdgesListOneRadius({ shape, edges: occt.shapes.edge.getEdges({ shape }), radius: 0.225 })],
            ["filletEdgeVariableRadius", (shape: TopoDS_Shape): TopoDS_Shape => occt.fillets.filletEdgeVariableRadius({ shape, edge: occt.shapes.edge.getEdges({ shape })[1]!, radiusList: [0.2, 0.25], paramsU: [0, 1] })],
            ["filletEdgesSameVariableRadius", (shape: TopoDS_Shape): TopoDS_Shape => occt.fillets.filletEdgesSameVariableRadius({ shape, edges: occt.shapes.edge.getEdges({ shape }), radiusList: [0.2, 0.25], paramsU: [0, 1] })],
            ["filletEdgesVariableRadius", (shape: TopoDS_Shape): TopoDS_Shape => occt.fillets.filletEdgesVariableRadius({ shape, edges: occt.shapes.edge.getEdges({ shape }), radiusLists: occt.shapes.edge.getEdges({ shape }).map(() => [0.2, 0.25]), paramsULists: occt.shapes.edge.getEdges({ shape }).map(() => [0, 1]) })],
            ["filletCornerByPoint", (shape: TopoDS_Shape): TopoDS_Shape => occt.corners.filletCornerByPoint({ shape, points: [[1, 0, 0]], radius: 0.225, taperFactor: 1, snapTolerance: 0 })],
        ] as [string, (shape: TopoDS_Shape) => TopoDS_Shape][])("should round with %s the edges of an open channel rising at 37 degrees, though the fillet's end sags below its free bottom edge, by less than the smallest radius", (_call, round) => {
            // Arrange
            const open = channel();

            // Act
            const rounded = round(open);

            // Assert
            const sag = kernel.TightBoundingBox(open).ZMin - kernel.TightBoundingBox(rounded).ZMin;
            expect(occt.shapeFix.isValid({ shape: rounded })).toBe(true);
            expect(oracles.counts(rounded).faces).toBeGreaterThan(2);
            expect(sag).toBeGreaterThan(1e-3);
            expect(sag).toBeLessThan(0.2);
        });

        it("should round the open channel's edges inside a compound that also holds a solid, as it rounds them on the channel alone", () => {
            // Arrange
            const open = channel();
            const both = occt.shapes.compound.makeCompound({ shapes: [open, box(2, [0, 3, 3])] });

            // Act
            const rounded = occt.fillets.filletEdgesListOneRadius({ shape: both, edges: occt.shapes.edge.getEdges({ shape: open }), radius: 0.225 });

            // Assert
            expect(occt.shapeFix.isValid({ shape: rounded })).toBe(true);
        });

        it("should judge a chamfer by the distances it was given for the edges it cut, leaving aside an unused entry that is not a number", () => {
            // Act
            const chamfered = occt.fillets.chamferEdges({ shape: channel(), indexes: [1], distanceList: [0.1, Number.NaN] });

            // Assert
            expect(occt.shapeFix.isValid({ shape: chamfered })).toBe(true);
        });

        it("should not widen what a fillet may reach by an unused radius at the end of its list, refusing an open box rounded past half its side", () => {
            // Arrange
            const openBox = occt.shapes.shell.sewFaces({ shapes: occt.shapes.face.getFaces({ shape: box() }).slice(1), tolerance: 1e-7 });
            const indexes = occt.shapes.edge.getEdges({ shape: openBox }).map((_edge, index) => index);

            // Act
            const rounded = outcomeOf(() => occt.fillets.filletEdges({ shape: openBox, indexes, radiusList: [...indexes.map(() => 5.5), 1e9] }));

            // Assert
            expect(rounded.thrown).toEqual(expect.objectContaining({ name: "KernelOperationError", code: "occt.fillet.beyondShape" }));
        });

        it.each([
            ["filletEdgesListOneRadius", (shape: TopoDS_Shape, edge: TopoDS_Edge): unknown => occt.fillets.filletEdgesListOneRadius({ shape, edges: [edge], radius: 1 })],
            ["chamferEdgeTwoDistances", (shape: TopoDS_Shape, edge: TopoDS_Edge, face: TopoDS_Face): unknown => occt.fillets.chamferEdgeTwoDistances({ shape, edge, face, distance1: 1, distance2: 2 })],
        ] as [string, (shape: TopoDS_Shape, edge: TopoDS_Edge, face: TopoDS_Face) => unknown][])("should refuse in %s an empty shape as an input error naming the shape, not its edges", (_method, act) => {
            // Arrange
            const solid = box();
            const empty = new kernel.TopoDS_Shape();

            // Act
            const refused = outcomeOf(() => act(empty, occt.shapes.edge.getEdges({ shape: solid })[0]!, occt.shapes.face.getFaces({ shape: solid })[0]!));

            // Assert
            expect(refused.thrown).toMatchObject({ name: "InputError", property: "shape" });
        });

        it("should refuse the 2D fillet of an outline whose lines meet its arcs at sharp corners, which OCCT rounds on their outer side, and the same rounding of the wire's corners", () => {
            // Arrange
            const spiked = occt.operations.offset({ shape: rim(Inputs.OCCT.twoSidesStrictEnum.outside, Inputs.OCCT.fourSidesStrictEnum.inside), distance: -0.5, tolerance: 0.1 });

            // Act
            const flat = outcomeOf(() => occt.fillets.fillet2d({ shape: spiked, radius: 0.3 }));
            const corners = outcomeOf(() => occt.fillets.fillet3DWire({ shape: spiked, radius: 0.3, direction: [0, 1, 0] }));

            // Assert
            expect([flat.thrown, corners.thrown]).toEqual([
                expect.objectContaining({ name: "KernelOperationError", code: "occt.fillet.beyondShape" }),
                expect.objectContaining({ name: "KernelOperationError", code: "occt.fillet.beyondShape" }),
            ]);
        });

        it("should refuse the edges of the wire a body was extruded from, naming the first, and round the body's own edges in their place", () => {
            // Arrange
            const belt = rim(Inputs.OCCT.twoSidesStrictEnum.outside, Inputs.OCCT.fourSidesStrictEnum.outside);
            const outer = occt.operations.offset({ shape: belt, distance: 2, tolerance: 0.1 });
            const ring = occt.shapes.face.createFaceFromWires({ shapes: [outer, occt.shapes.wire.reversedWire({ shape: belt })], planar: true });
            const body = occt.operations.extrude({ shape: ring, direction: [0, 3, 0] });
            const wireEdges = occt.shapes.edge.getEdges({ shape: outer });
            const bodyEdges = occt.shapes.edge.getEdges({ shape: body });
            const midpointOf = (edge: TopoDS_Edge): Inputs.Base.Point3 => occt.shapes.edge.pointOnEdgeAtParam({ shape: edge, param: 0.5 });
            const twins = wireEdges.flatMap(edge => bodyEdges.filter(candidate => midpointOf(candidate).every((value, axis) => Math.abs(value - midpointOf(edge)[axis]!) < 1e-6)));

            // Act
            const fromWire = outcomeOf(() => occt.fillets.filletEdgesListOneRadius({ shape: body, edges: wireEdges, radius: 0.4 }));
            const fromBody = occt.fillets.filletEdgesListOneRadius({ shape: body, edges: twins, radius: 0.4 });

            // Assert
            expect(fromWire.thrown).toEqual(expect.objectContaining({
                name: "InputError",
                property: "edges",
                message: "`edges` holds an edge at position 0 that is not an edge of `shape`: take the edges from `shape` itself, since an operation that builds a shape from a wire or a face, such as an extrusion, may give it edges of its own.",
            }));
            expect([twins.length, occt.shapeFix.isValid({ shape: fromBody })]).toEqual([4, true]);
        });

        it("should round an edge of the shape given turned the other way round, as the same edge", () => {
            // Arrange
            const shape = box();
            const edge = occt.shapes.edge.getEdges({ shape })[0]!;

            // Act
            const rounded = occt.fillets.filletEdgesListOneRadius({ shape, edges: [occt.shapes.edge.reversedEdge({ shape: edge })], radius: 1 });

            // Assert
            expect(occt.shapeFix.isValid({ shape: rounded })).toBe(true);
        });

        it.each([
            ["filletEdgesListOneRadius", "edges", (shape: TopoDS_Shape, edge: TopoDS_Edge): unknown => occt.fillets.filletEdgesListOneRadius({ shape, edges: [edge], radius: 1 })],
            ["filletEdgesList", "edges", (shape: TopoDS_Shape, edge: TopoDS_Edge): unknown => occt.fillets.filletEdgesList({ shape, edges: [edge], radiusList: [1] })],
            ["filletEdgeVariableRadius", "edge", (shape: TopoDS_Shape, edge: TopoDS_Edge): unknown => occt.fillets.filletEdgeVariableRadius({ shape, edge, radiusList: [1, 2], paramsU: [0, 1] })],
            ["filletEdgesSameVariableRadius", "edges", (shape: TopoDS_Shape, edge: TopoDS_Edge): unknown => occt.fillets.filletEdgesSameVariableRadius({ shape, edges: [edge], radiusList: [1, 2], paramsU: [0, 1] })],
            ["filletEdgesVariableRadius", "edges", (shape: TopoDS_Shape, edge: TopoDS_Edge): unknown => occt.fillets.filletEdgesVariableRadius({ shape, edges: [edge], radiusLists: [[1, 2]], paramsULists: [[0, 1]] })],
            ["chamferEdgesList", "edges", (shape: TopoDS_Shape, edge: TopoDS_Edge): unknown => occt.fillets.chamferEdgesList({ shape, edges: [edge], distanceList: [1] })],
            ["chamferEdgeTwoDistances", "edge", (shape: TopoDS_Shape, edge: TopoDS_Edge, face: TopoDS_Face): unknown => occt.fillets.chamferEdgeTwoDistances({ shape, edge, face, distance1: 1, distance2: 2 })],
            ["chamferEdgesTwoDistances", "edges", (shape: TopoDS_Shape, edge: TopoDS_Edge, face: TopoDS_Face): unknown => occt.fillets.chamferEdgesTwoDistances({ shape, edges: [edge], faces: [face], distance1: 1, distance2: 2 })],
            ["chamferEdgesTwoDistancesLists", "edges", (shape: TopoDS_Shape, edge: TopoDS_Edge, face: TopoDS_Face): unknown => occt.fillets.chamferEdgesTwoDistancesLists({ shape, edges: [edge], faces: [face], distances1: [1], distances2: [2] })],
            ["chamferEdgeDistAngle", "edge", (shape: TopoDS_Shape, edge: TopoDS_Edge, face: TopoDS_Face): unknown => occt.fillets.chamferEdgeDistAngle({ shape, edge, face, distance: 1, angle: 30 })],
            ["chamferEdgesDistsAngles", "edges", (shape: TopoDS_Shape, edge: TopoDS_Edge, face: TopoDS_Face): unknown => occt.fillets.chamferEdgesDistsAngles({ shape, edges: [edge], faces: [face], distances: [1], angles: [30] })],
            ["chamferEdgesDistAngle", "edges", (shape: TopoDS_Shape, edge: TopoDS_Edge, face: TopoDS_Face): unknown => occt.fillets.chamferEdgesDistAngle({ shape, edges: [edge], faces: [face], distance: 1, angle: 30 })],
        ] as [string, string, (shape: TopoDS_Shape, edge: TopoDS_Edge, face: TopoDS_Face) => unknown][])("should refuse in %s an edge of another shape as an input error naming %s", (_method, property, act) => {
            // Arrange
            const shape = box();
            const ownFace = occt.shapes.face.getFaces({ shape })[0]!;
            const elsewhere = occt.shapes.edge.getEdges({ shape: box() })[0]!;

            // Act
            const refused = outcomeOf(() => act(shape, elsewhere, ownFace));

            // Assert
            expect(refused.thrown).toMatchObject({ name: "InputError", property });
        });

        it.each([
            ["chamferEdgeTwoDistances", "face", (shape: TopoDS_Shape, edge: TopoDS_Edge, face: TopoDS_Face): unknown => occt.fillets.chamferEdgeTwoDistances({ shape, edge, face, distance1: 1, distance2: 2 })],
            ["chamferEdgesTwoDistances", "faces", (shape: TopoDS_Shape, edge: TopoDS_Edge, face: TopoDS_Face): unknown => occt.fillets.chamferEdgesTwoDistances({ shape, edges: [edge], faces: [face], distance1: 1, distance2: 2 })],
            ["chamferEdgesTwoDistancesLists", "faces", (shape: TopoDS_Shape, edge: TopoDS_Edge, face: TopoDS_Face): unknown => occt.fillets.chamferEdgesTwoDistancesLists({ shape, edges: [edge], faces: [face], distances1: [1], distances2: [2] })],
            ["chamferEdgeDistAngle", "face", (shape: TopoDS_Shape, edge: TopoDS_Edge, face: TopoDS_Face): unknown => occt.fillets.chamferEdgeDistAngle({ shape, edge, face, distance: 1, angle: 30 })],
            ["chamferEdgesDistsAngles", "faces", (shape: TopoDS_Shape, edge: TopoDS_Edge, face: TopoDS_Face): unknown => occt.fillets.chamferEdgesDistsAngles({ shape, edges: [edge], faces: [face], distances: [1], angles: [30] })],
            ["chamferEdgesDistAngle", "faces", (shape: TopoDS_Shape, edge: TopoDS_Edge, face: TopoDS_Face): unknown => occt.fillets.chamferEdgesDistAngle({ shape, edges: [edge], faces: [face], distance: 1, angle: 30 })],
        ] as [string, string, (shape: TopoDS_Shape, edge: TopoDS_Edge, face: TopoDS_Face) => unknown][])("should refuse in %s a face of another shape as an input error naming %s", (_method, property, act) => {
            // Arrange
            const shape = box();
            const ownEdge = occt.shapes.edge.getEdges({ shape })[0]!;
            const elsewhere = occt.shapes.face.getFaces({ shape: box() })[0]!;

            // Act
            const refused = outcomeOf(() => act(shape, ownEdge, elsewhere));

            // Assert
            expect(refused.thrown).toMatchObject({ name: "InputError", property, message: expect.stringContaining("not a face of `shape`") });
        });
    });

    describe("offsets and thick solids at their limits", () => {
        it("should name the failure of an offset by the defaults of a small box rather than pass on the kernel's own error", () => {
            // Act
            const act = (): TopoDS_Shape => occt.operations.offset({ shape: box(4), distance: 0.2, tolerance: 0.1 });

            // Assert
            expect(act).toThrow(expect.objectContaining({ name: "KernelOperationError", code: "occt.offset.failed" }));
        });

        it("should refuse an inward offset of a box by half its side and more", () => {
            // Act
            const half = outcomeOf(() => occt.operations.offset({ shape: box(), distance: -5, tolerance: 1e-7 }));
            const more = outcomeOf(() => occt.operations.offsetWithHistory({ shape: box(), distance: -6, tolerance: 1e-7 }));

            // Assert
            expect([half.thrown, more.thrown]).toEqual([
                expect.objectContaining({ code: "occt.offset.failed" }),
                expect.objectContaining({ code: "occt.offset.failed" }),
            ]);
        });

        it("should hand back the faces OCCT offsets a rounded box inwards to, past its rounds, for the caller to judge, since the kernel finds them valid", () => {
            // Arrange
            const rounded = occt.fillets.filletEdges({ shape: box(), radius: 1 });

            // Act
            const offset = occt.operations.offset({ shape: rounded, distance: -2, tolerance: 1e-7 });

            // Assert
            expect([occt.shapeFix.isValid({ shape: offset }), occt.shapes.solid.getSolids({ shape: offset }).length, occt.shapes.face.getFaces({ shape: offset }).length]).toEqual([true, 0, 6]);
        });

        it("should hollow a rod opened at its top into walls of the thickness asked for", () => {
            // Arrange
            const rod = occt.shapes.solid.createCylinder({ radius: 2, height: 5, center: [0, 0, 0], direction: [0, 1, 0] });
            const top = occt.shapes.face.getFaces({ shape: rod }).find(face => Math.abs(occt.shapes.face.getFaceCenterOfMass({ shape: face })[1] - 5) < 1e-9)!;

            // Act
            const cup = occt.operations.makeThickSolidByJoin({ shape: rod, shapes: [top], offset: -0.3 });

            // Assert
            expect(occt.shapeFix.isValid({ shape: cup })).toBe(true);
            expect(oracles.volume(cup)).toBeCloseTo(Math.PI * 4 * 5 - Math.PI * 1.7 * 1.7 * 4.7, 6);
        });

        it("should hand back the solid OCCT hollows a box by half its side into, for the caller to judge, its volume being one a solid can have", () => {
            // Arrange
            const shape = box();

            // Act
            const hollowed = outcomeOf(() => occt.operations.makeThickSolidByJoin({ shape, shapes: [occt.shapes.face.getFace({ shape, index: 0 })], offset: -5 }));

            // Assert
            expect(validOrRefused(hollowed)).toMatch(/^not valid, holding 833\.3/);
        });

        it("should refuse an offset and a loft whose solid OCCT leaves without a volume a solid can have, and a fillet whose solid leaves the box it rounds", () => {
            // Arrange
            const ring = circle(2, 0);

            // Act
            const results = [
                outcomeOf(() => occt.operations.offset({ shape: occt.shapes.solid.createBox({ width: 20, length: 12, height: 8, center: [0, 0, 0] }), distance: -4, tolerance: 1e-6 })),
                outcomeOf(() => occt.fillets.filletEdges({ shape: box(), radius: 5.5 })),
                outcomeOf(() => occt.operations.loft({ shapes: [ring, ring], makeSolid: true })),
            ];

            // Assert
            expect(results.map(result => result.thrown)).toEqual([
                expect.objectContaining({ code: "occt.offset.failed" }),
                expect.objectContaining({ code: "occt.fillet.beyondShape" }),
                expect.objectContaining({ code: "occt.loft.failed" }),
            ]);
        });
    });

    describe("lofts", () => {
        it("should loft a circle into a square as a valid solid between the volumes of their prisms", () => {
            // Act
            const lofted = occt.operations.loft({ shapes: [circle(2, 0), square(3, 5)], makeSolid: true });

            // Assert
            expect(occt.shapeFix.isValid({ shape: lofted })).toBe(true);
            expect(oracles.volume(lofted)).toBeGreaterThan(9 * 5);
            expect(oracles.volume(lofted)).toBeLessThan(4 * Math.PI * 5);
        });

        it("should follow a loft from a circle into a square as the plain loft builds it, rather than throw from the kernel", () => {
            // Arrange
            const shapes = [circle(2, 0), square(3, 5)];

            // Act
            const plain = outcomeOf(() => occt.operations.loft({ shapes, makeSolid: true }));
            const twin = outcomeOf(() => occt.operations.loftWithHistory({ shapes, makeSolid: true }));

            // Assert
            expect(refusalParity(plain, twin)).toEqual([]);
        });

        it("should follow a closed ruled loft through three rings as the plain loft builds it", () => {
            // Arrange
            const rings = [0, 1, 2].map(at => {
                const angle = at * 2.1;
                return occt.shapes.wire.createCircleWire({ radius: 1, center: [5 * Math.cos(angle), 0, 5 * Math.sin(angle)], direction: [-Math.sin(angle), 0, Math.cos(angle)] });
            });
            const inputs = { ...new Inputs.OCCT.LoftAdvancedDto<TopoDS_Wire>(), shapes: rings, closed: true, straight: true, makeSolid: true };

            // Act
            const plain = outcomeOf(() => occt.operations.loftAdvanced(inputs));
            const twin = outcomeOf(() => occt.operations.loftAdvancedWithHistory(inputs));

            // Assert
            expect(occt.shapeFix.isValid({ shape: plain.value! })).toBe(true);
            expect(refusalParity(plain, twin)).toEqual([]);
        });

        it("should refuse, or hand back a valid solid, when it lofts a wire to itself", () => {
            // Arrange
            const ring = circle(2, 0);

            // Act
            const lofted = outcomeOf(() => occt.operations.loft({ shapes: [ring, ring], makeSolid: true }));

            // Assert
            expect(validOrRefused(lofted)).toMatch(/^(refused with (InputError|KernelOperationError)|valid,)/);
        });

        it("should refuse, or hand back a valid shape, when it is asked for a solid lofted between two open lines", () => {
            // Arrange
            const shapes = [occt.shapes.wire.createLineWire({ start: [0, 0, 0], end: [1, 0, 0] }), occt.shapes.wire.createLineWire({ start: [0, 1, 0], end: [1, 1, 0] })];

            // Act
            const lofted = outcomeOf(() => occt.operations.loft({ shapes, makeSolid: true }));

            // Assert
            expect(lofted.value === undefined ? nameOf(lofted.thrown) : String(occt.shapeFix.isValid({ shape: lofted.value }))).toMatch(/^(InputError|KernelOperationError|true)$/);
        });

        it.each([
            ["face", (): TopoDS_Shape => occt.shapes.face.createSquareFace({ size: 3, center: [0, 5, 0], direction: [0, 1, 0] })],
            ["solid", (): TopoDS_Shape => box(3, [0, 5, 0])],
            ["vertex", (): TopoDS_Shape => occt.shapes.vertex.vertexFromXYZ({ x: 0, y: 5, z: 0 })],
            ["compound", (): TopoDS_Shape => occt.shapes.compound.makeCompound({ shapes: [circle(1.5, 5)] })],
        ] as [string, () => TopoDS_Shape][])("should refuse a %s among the sections of every loft as an input error at its position, and leave alive no kernel object it made", (kind, section) => {
            // Arrange
            const shapes = [circle(2, 0), section(), circle(1, 10)];
            const advanced = { ...new Inputs.OCCT.LoftAdvancedDto<TopoDS_Wire>(), shapes, makeSolid: true };
            const refusal = { name: "InputError", property: "shapes", message: `\`shapes\` holds a ${kind} at position 1, and a loft runs only through wires and edges.` };

            // Act
            const lofts = [
                leftAliveBy(() => occt.operations.loft({ shapes, makeSolid: true })),
                leftAliveBy(() => occt.operations.loftWithHistory({ shapes, makeSolid: true })),
                leftAliveBy(() => occt.operations.loftAdvanced(advanced)),
                leftAliveBy(() => occt.operations.loftAdvanced({ ...advanced, closed: true, periodic: true })),
                leftAliveBy(() => occt.operations.loftAdvancedWithHistory(advanced)),
            ];

            // Assert
            expect(lofts.map(loft => [loft.outcome.thrown, loft.alive])).toEqual(lofts.map(() => [expect.objectContaining(refusal), []]));
        });

        it("should loft through a wire it is handed as a plain shape as it lofts through the wire", () => {
            // Arrange
            const plainShape = kernel.BRepBuilderAPI_Copy_Shape(circle(1, 5), false);

            // Act
            const lofted = occt.operations.loft({ shapes: [circle(2, 0), plainShape], makeSolid: true });

            // Assert
            expect(oracles.volume(lofted)).toBeCloseTo(oracles.volume(occt.operations.loft({ shapes: [circle(2, 0), circle(1, 5)], makeSolid: true })), 9);
        });

        it("should close a loft through one ring into a cone at a start point", () => {
            // Act
            const cone = occt.operations.loftAdvanced({ ...new Inputs.OCCT.LoftAdvancedDto<TopoDS_Wire>(), shapes: [circle(2, 0)], startVertex: [0, -5, 0], makeSolid: true });

            // Assert
            expect(occt.shapeFix.isValid({ shape: cone })).toBe(true);
            expect(oracles.volume(cone)).toBeCloseTo(Math.PI * 4 * 5 / 3, 6);
        });
    });

    describe("sweeps, revolutions and features", () => {
        it("should sweep a ring along a circle into a torus of the volume 2 pi^2 R r^2", () => {
            // Act
            const ring = occt.operations.pipeWireCylindrical({ shape: circle(5, 0), radius: 1 });

            // Assert
            expect(occt.shapeFix.isValid({ shape: ring })).toBe(true);
            expect(oracles.volume(ring)).toBeCloseTo(2 * Math.PI * Math.PI * 5, 6);
        });

        it("should sweep a circle edge along a line as it sweeps the wire of that edge", () => {
            // Arrange
            const spine = occt.shapes.wire.createLineWire({ start: [3, 0, 0], end: [3, 10, 0] });
            const ring = occt.shapes.edge.createCircleEdge({ radius: 1, center: [3, 0, 0], direction: [0, 1, 0] });

            // Act
            const throughEdge = outcomeOf(() => occt.operations.pipe({ shape: spine, shapes: [ring] }));
            const throughWire = occt.operations.pipe({ shape: spine, shapes: [occt.shapes.wire.createWireFromEdge({ shape: ring })] });

            // Assert
            expect(throughEdge.thrown).toBeUndefined();
            expect(oracles.volume(throughEdge.value!)).toBeCloseTo(oracles.volume(throughWire), 9);
        });

        it("should twist an edge up as it twists the wire of that edge, or refuse it as an input error", () => {
            // Arrange
            const edge = occt.shapes.edge.line({ start: [2, 0, 0], end: [3, 1, 0] });

            // Act
            const twisted = outcomeOf(() => occt.operations.rotatedExtrude({ shape: edge, height: 5, angle: 45, makeSolid: false }));

            // Assert
            expect(twisted.value !== undefined || nameOf(twisted.thrown) === "InputError").toBe(true);
        });

        it("should refuse a tube along a circle tighter than its radius as too tight", () => {
            // Act
            const act = (): TopoDS_Shape => occt.operations.pipeWireCylindrical({ shape: circle(1, 0), radius: 1.5 });

            // Assert
            expect(act).toThrow(expect.objectContaining({ name: "KernelOperationError", code: "occt.pipe.tooTight" }));
        });

        it("should revolve a profile that touches the axis into a solid of the volume Pappus gives, by a whole turn or part of one", () => {
            // Arrange
            const profile = occt.shapes.face.createPolygonFace({ points: [[0, 0, 0], [2, 0, 0], [2, 4, 0], [0, 4, 0]] });

            // Act
            const volumes = [360, 180, 90].map(angle => oracles.volume(occt.operations.revolve({ shape: profile, angle, direction: [0, 1, 0], copy: false })));

            // Assert
            expect(volumes).toEqual([16 * Math.PI, 8 * Math.PI, 4 * Math.PI].map(volume => expect.closeTo(volume, 9)));
        });

        it("should name the failure of revolving an edge that lies on the axis rather than pass on the kernel's own error", () => {
            // Act
            const act = (): TopoDS_Shape => occt.operations.revolve({ shape: occt.shapes.edge.line({ start: [0, 0, 0], end: [0, 4, 0] }), angle: 360, direction: [0, 1, 0], copy: false });

            // Assert
            expect(act).toThrow(expect.objectContaining({ name: "KernelOperationError", code: "occt.revolve.failed" }));
        });

        it.each([90, 360])("should name the failure of revolving an empty shape by %s degrees, and leave alive no kernel object it made", angle => {
            // Arrange
            const empty = new kernel.TopoDS_Shape();

            // Act
            const revolved = leftAliveBy(() => occt.operations.revolve({ shape: empty, angle, direction: [0, 1, 0], copy: false }));

            // Assert
            expect(revolved.outcome.thrown).toEqual(expect.objectContaining({ name: "KernelOperationError", code: "occt.revolve.failed" }));
            expect(revolved.alive).toEqual([]);
        });

        it("should throw the kernel's exception read into an error when it extrudes an empty shape, and leave alive no kernel object it made", () => {
            // Arrange
            const empty = new kernel.TopoDS_Shape();

            // Act
            const extruded = leftAliveBy(() => occt.operations.extrude({ shape: empty, direction: [0, 0, 1] }));

            // Assert
            expect(extruded.outcome.thrown).toStrictEqual(new Error("Standard_NullObject"));
            expect(extruded.alive).toEqual([]);
        });

        it("should extrude a face with a hole into a solid with the hole through it", () => {
            // Arrange
            const holed = occt.shapes.face.createFaceFromWires({ shapes: [square(4, 0), occt.shapes.wire.createCircleWire({ radius: 1, center: [0, 0, 0], direction: [0, -1, 0] })], planar: true });

            // Act
            const plate = occt.operations.extrude({ shape: holed, direction: [0, 2, 0] });

            // Assert
            expect(oracles.volume(plate)).toBeCloseTo((16 - Math.PI) * 2, 9);
            expect(oracles.counts(plate).faces).toBe(7);
        });

        it("should refuse to drill no holes as an input error on the frames", () => {
            // Act
            const act = (): TopoDS_Shape => occt.features.holes({ shape: box(), frames: [], diameter: 1, depth: 0, tipAngle: 0 });

            // Assert
            expect(act).toThrow(expect.objectContaining({ name: "InputError", property: "frames" }));
        });

        it("should refuse a hole of diameter 0 as an input error on the diameter", () => {
            // Act
            const act = (): TopoDS_Shape => occt.features.holes({ shape: box(), frames: [{ origin: [0, 5, 0], normal: [0, 1, 0], direction: [1, 0, 0] }], diameter: 0, depth: 0, tipAngle: 0 });

            // Assert
            expect(act).toThrow(expect.objectContaining({ name: "InputError", property: "diameter" }));
        });

        it("should name a draft too steep to build as a kernel failure", () => {
            // Arrange
            const shape = box();

            // Act
            const drafted = outcomeOf(() => occt.draft.draftAngle({ shape, faces: [occt.shapes.face.getFace({ shape, index: 0 })], direction: [0, 1, 0], angle: 89, neutralPlaneOrigin: [0, 0, 0], neutralPlaneDirection: [0, 1, 0], flag: true }));

            // Assert
            expect(nameOf(drafted.thrown)).toBe("KernelOperationError");
        });
    });

    describe("calls over several shapes, one of which is refused", () => {
        it("should refuse to extrude a list holding a solid after a face, and leave alive no prism of the face before it", () => {
            // Arrange
            const shapes = [occt.shapes.face.createSquareFace({ size: 2, center: [0, 0, 0], direction: [0, 1, 0] }), box(2)];

            // Act
            const extruded = leftAliveBy(() => occt.operations.extrudeShapes({ shapes, direction: [0, 1, 0] }));

            // Assert
            expect(extruded.outcome.thrown).toEqual(expect.objectContaining({ name: "InputError", property: "shape" }));
            expect(extruded.alive).toEqual([]);
        });

        it("should refuse tubes along a list whose second path bends tighter than the radius, and leave alive no tube along the first", () => {
            // Arrange
            const shapes = [occt.shapes.wire.createPolylineWire({ points: [[0, 0, 0], [10, 0, 0], [10, 10, 0]] }), circle(1, 0)];

            // Act
            const piped = leftAliveBy(() => occt.operations.pipeWiresCylindrical({ shapes, radius: 2 }));

            // Assert
            expect(piped.outcome.thrown).toEqual(expect.objectContaining({ name: "KernelOperationError", code: "occt.pipe.tooTight" }));
            expect(piped.alive).toEqual([]);
        });
    });

    describe("drafts OCCT would read past its own arrays for", () => {
        it.each([
            ["a hair under 15", 14.999999999999998],
            ["15.48", 15.483455446219233],
            ["3.79", 3.792747107243504],
        ])("should refuse a square outline of side %s drafted up by 10 at 5 degrees as a named draft failure, and leave the kernel drafting", async (_side, size) => {
            // Arrange
            const kernel = await createBitbybitOcct();
            const own = new OCCTService(kernel, new OccHelper(kernel));
            const draftOf = (side: number): TopoDS_Shape => own.draft.makeDraft({ shape: own.shapes.wire.createSquareWire({ size: side, center: [0, 0, 0], direction: [0, 1, 0] }), direction: [0, 1, 0], angle: 5, lengthMax: 10, internal: false });

            // Act
            const drafted = outcomeOf(() => draftOf(size));
            const after = draftOf(15);

            // Assert
            expect(drafted.thrown).toEqual(expect.objectContaining({ name: "KernelOperationError", code: "occt.draft.failed" }));
            expect(own.shapes.face.getFaces({ shape: after })).toHaveLength(4);
        });
    });

    describe("what the inputs a user can get wrong are refused with", () => {
        it.each([
            ["a cylinder along a direction with no length", (): unknown => occt.shapes.solid.createCylinder({ radius: 1, height: 2, center: [0, 0, 0], direction: [0, 0, 0] }), "direction"],
            ["a spline through one point", (): unknown => occt.shapes.wire.createBSpline({ points: [[0, 0, 0]], closed: false }), "points"],
            ["a box turned about an axis with no length", (): unknown => occt.transforms.rotate({ shape: box(), axis: [0, 0, 0], angle: 30 }), "axis"],
        ] as [string, () => unknown, string][])("should refuse %s as an input error naming the property", (_what, act, property) => {
            // Act
            const refused = outcomeOf(act);

            // Assert
            expect(refused.thrown).toMatchObject({ name: "InputError", property });
        });

        it.each([
            ["a slice step too small for the shape", (): unknown => occt.operations.slice({ shape: box(), step: 1e-6, direction: [0, 1, 0] }), "step"],
            ["an extrusion along no direction", (): unknown => occt.operations.extrude({ shape: occt.shapes.face.createSquareFace({ size: 2, center: [0, 0, 0], direction: [0, 1, 0] }), direction: [0, 0, 0] }), "direction"],
            ["a split that cuts nothing off, with history", (): unknown => occt.operations.splitShapeWithShapesWithHistory({ shape: box(), shapes: [occt.shapes.face.createSquareFace({ size: 20, center: [0, 5, 0], direction: [0, 1, 0] })], localFuzzyTolerance: 1e-7, nonDestructive: false }), "shapes"],
        ] as [string, () => unknown, string][])("should refuse %s as an input error naming the property, as it does today", (_what, act, property) => {
            // Act
            const refused = outcomeOf(act);

            // Assert
            expect(refused.thrown).toMatchObject({ name: "InputError", property });
        });
    });
});
