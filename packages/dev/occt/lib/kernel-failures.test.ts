import { describe, it, expect, beforeAll, afterEach } from "vitest";
import { KernelOperationError } from "@bitbybit-dev/base";
import createBitbybitOcct, { BitbybitOcctModule, TopoDS_Edge, TopoDS_Face, TopoDS_Shape, TopoDS_Wire } from "../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "./occ-helper";
import { VectorHelperService } from "./api/vector-helper.service";
import { ShapesHelperService } from "./api/shapes-helper.service";
import { OCCTService } from "./occ-service";
import { OCCT_FAILURES, OcctFailureCode, occtFailure } from "./kernel-failures";

type Builder =
    | "BRepFilletAPI_MakeFillet"
    | "BRepFilletAPI_MakeChamfer"
    | "BRepFilletAPI_MakeFillet2d"
    | "BRepOffsetAPI_MakeOffset"
    | "BRepOffsetAPI_MakeOffsetShape"
    | "BRepOffsetAPI_MakeThickSolid"
    | "BRepOffsetAPI_ThruSections"
    | "BRepPrimAPI_MakeRevol"
    | "BRepOffsetAPI_MakePipeShell"
    | "BRepOffsetAPI_MakePipe";

function failureOf(run: () => unknown): unknown {
    try {
        run();
    } catch (thrown) {
        return thrown;
    }
    return undefined;
}

function named(code: OcctFailureCode): { name: string; code: string; message: string } {
    return { name: "KernelOperationError", code, message: OCCT_FAILURES[code] };
}

describe("OCCT_FAILURES", () => {
    it("names every failure under occt, as the area and what went wrong", () => {
        // Act
        const codes = Object.keys(OCCT_FAILURES);

        // Assert
        expect(codes.length).toBeGreaterThan(0);
        codes.forEach(code => expect(code).toMatch(/^occt\.[a-z][A-Za-z]*\.[a-z][A-Za-z]*$/));
    });

    it("says every failure in whole sentences, with plain dashes", () => {
        // Act
        const messages = Object.values(OCCT_FAILURES);

        // Assert
        messages.forEach(message => {
            expect(message).toMatch(/^The [a-z]/);
            expect(message).toMatch(/\.$/);
            expect(message).not.toMatch(/[\u2013\u2014]/);
        });
    });

    it("makes the error for a failure from its code and message", () => {
        // Act
        const error = occtFailure("occt.loft.failed");

        // Assert
        expect(error).toBeInstanceOf(KernelOperationError);
        expect(error).toMatchObject(named("occt.loft.failed"));
    });
});

describe("OCCT operations the kernel cannot complete", () => {
    let occt: BitbybitOcctModule;
    let s: OCCTService;
    const restores: (() => void)[] = [];

    beforeAll(async () => {
        occt = await createBitbybitOcct();
        s = new OCCTService(occt, new OccHelper(new VectorHelperService(), new ShapesHelperService(), occt));
    });

    afterEach(() => {
        while (restores.length) restores.pop()!();
    });

    function reportNotDone(name: Builder): void {
        const prototype = occt[name].prototype;
        const original = prototype.IsDone;
        prototype.IsDone = (): boolean => false;
        restores.push(() => {
            prototype.IsDone = original;
        });
    }

    function box(): TopoDS_Shape {
        return s.shapes.solid.createBox({ width: 10, length: 10, height: 10, center: [0, 0, 0], originOnCenter: true });
    }

    function edgeAndFace(shape: TopoDS_Shape): { edge: TopoDS_Edge; face: TopoDS_Face } {
        const face = s.shapes.face.getFaces({ shape })[0]!;
        return { edge: s.shapes.edge.getEdges({ shape: face })[0]!, face };
    }

    function square(): TopoDS_Wire {
        return s.shapes.wire.createSquareWire({ size: 10, center: [0, 0, 0], direction: [0, 1, 0] });
    }

    function squareFace(): TopoDS_Face {
        return s.shapes.face.createFaceFromWire({ shape: square(), planar: true });
    }

    function circle(y: number): TopoDS_Wire {
        return s.shapes.wire.createCircleWire({ radius: 5, center: [0, y, 0], direction: [0, 1, 0] });
    }

    function path(): TopoDS_Wire {
        return s.shapes.wire.createPolylineWire({ points: [[0, 0, 0], [0, 10, 0], [10, 10, 0]] });
    }

    describe("fillets and chamfers", () => {
        it.each([
            ["every edge of a 10 box at radius 5", (): unknown => s.fillets.filletEdges({ shape: box(), radius: 5 })],
            ["one edge of a 10 box at radius 20", (): unknown => s.fillets.filletEdges({ shape: box(), radius: 20, indexes: [1] })],
            ["the corners of a 10 square face at radius 20", (): unknown => s.fillets.fillet2d({ shape: squareFace(), radius: 20 })],
            ["the corners of a 10 square wire at radius 20", (): unknown => s.fillets.fillet2d({ shape: square(), radius: 20 })],
            ["the corners of a 10 square wire at radius 6", (): unknown => s.fillets.fillet2d({ shape: square(), radius: 6 })],
        ])("names the failure to fillet %s", (_what, run) => {
            // Act
            const failure = failureOf(run);

            // Assert
            expect(failure).toMatchObject(named("occt.fillet.failed"));
        });

        it.each([
            ["every edge of a 10 box at distance 6", (): unknown => s.fillets.chamferEdges({ shape: box(), distance: 6 })],
            ["one edge of a 10 box at distance 20", (): unknown => s.fillets.chamferEdges({ shape: box(), distance: 20, indexes: [1] })],
        ])("names the failure to chamfer %s", (_what, run) => {
            // Act
            const failure = failureOf(run);

            // Assert
            expect(failure).toMatchObject(named("occt.chamfer.failed"));
        });

        it.each([
            ["filletEdges on every edge", (): unknown => s.fillets.filletEdges({ shape: box(), radius: 1 })],
            ["filletEdges on chosen edges", (): unknown => s.fillets.filletEdges({ shape: box(), radius: 1, indexes: [1, 2] })],
            ["filletEdgesListOneRadius", (): unknown => {
                const shape = box();
                return s.fillets.filletEdgesListOneRadius({ shape, edges: [edgeAndFace(shape).edge], radius: 1 });
            }],
            ["filletEdgesList", (): unknown => {
                const shape = box();
                return s.fillets.filletEdgesList({ shape, edges: [edgeAndFace(shape).edge], radiusList: [1] });
            }],
            ["filletEdgeVariableRadius", (): unknown => {
                const shape = box();
                return s.fillets.filletEdgeVariableRadius({ shape, edge: edgeAndFace(shape).edge, radiusList: [1, 2], paramsU: [0, 1] });
            }],
            ["filletEdgesSameVariableRadius", (): unknown => {
                const shape = box();
                return s.fillets.filletEdgesSameVariableRadius({ shape, edges: [edgeAndFace(shape).edge], radiusList: [1, 2], paramsU: [0, 1] });
            }],
            ["filletEdgesVariableRadius", (): unknown => {
                const shape = box();
                return s.fillets.filletEdgesVariableRadius({ shape, edges: [edgeAndFace(shape).edge], radiusLists: [[1, 2]], paramsULists: [[0, 1]] });
            }],
        ])("names the failure when the kernel does not finish %s", (_what, run) => {
            // Arrange
            reportNotDone("BRepFilletAPI_MakeFillet");

            // Act
            const failure = failureOf(run);

            // Assert
            expect(failure).toMatchObject(named("occt.fillet.failed"));
        });

        it("names the failure when the kernel does not finish a fillet2d on a face", () => {
            // Arrange
            reportNotDone("BRepFilletAPI_MakeFillet2d");

            // Act
            const failure = failureOf(() => s.fillets.fillet2d({ shape: squareFace(), radius: 1 }));

            // Assert
            expect(failure).toMatchObject(named("occt.fillet.failed"));
        });

        it.each([
            ["chamferEdges on every edge", (): unknown => s.fillets.chamferEdges({ shape: box(), distance: 1 })],
            ["chamferEdges on chosen edges", (): unknown => s.fillets.chamferEdges({ shape: box(), distance: 1, indexes: [1, 2] })],
            ["chamferEdgesList", (): unknown => {
                const shape = box();
                return s.fillets.chamferEdgesList({ shape, edges: [edgeAndFace(shape).edge], distanceList: [1] });
            }],
            ["chamferEdgeTwoDistances", (): unknown => {
                const shape = box();
                const { edge, face } = edgeAndFace(shape);
                return s.fillets.chamferEdgeTwoDistances({ shape, edge, face, distance1: 1, distance2: 2 });
            }],
            ["chamferEdgesTwoDistances", (): unknown => {
                const shape = box();
                const { edge, face } = edgeAndFace(shape);
                return s.fillets.chamferEdgesTwoDistances({ shape, edges: [edge], faces: [face], distance1: 1, distance2: 2 });
            }],
            ["chamferEdgesTwoDistancesLists", (): unknown => {
                const shape = box();
                const { edge, face } = edgeAndFace(shape);
                return s.fillets.chamferEdgesTwoDistancesLists({ shape, edges: [edge], faces: [face], distances1: [1], distances2: [2] });
            }],
            ["chamferEdgeDistAngle", (): unknown => {
                const shape = box();
                const { edge, face } = edgeAndFace(shape);
                return s.fillets.chamferEdgeDistAngle({ shape, edge, face, distance: 1, angle: 30 });
            }],
            ["chamferEdgesDistAngle", (): unknown => {
                const shape = box();
                const { edge, face } = edgeAndFace(shape);
                return s.fillets.chamferEdgesDistAngle({ shape, edges: [edge], faces: [face], distance: 1, angle: 30 });
            }],
            ["chamferEdgesDistsAngles", (): unknown => {
                const shape = box();
                const { edge, face } = edgeAndFace(shape);
                return s.fillets.chamferEdgesDistsAngles({ shape, edges: [edge], faces: [face], distances: [1], angles: [30] });
            }],
        ])("names the failure when the kernel does not finish %s", (_what, run) => {
            // Arrange
            reportNotDone("BRepFilletAPI_MakeChamfer");

            // Act
            const failure = failureOf(run);

            // Assert
            expect(failure).toMatchObject(named("occt.chamfer.failed"));
        });

        it("names the failure when the kernel does not finish chamfer2dVertices", () => {
            // Arrange
            reportNotDone("BRepFilletAPI_MakeFillet2d");

            // Act
            const failure = failureOf(() => s.fillets.chamfer2dVertices({ shape: squareFace(), distance: 1, angle: 45 }));

            // Assert
            expect(failure).toMatchObject(named("occt.chamfer.failed"));
        });

        it("still fillets what the kernel can build", () => {
            // Act
            const filleted = s.fillets.filletEdges({ shape: box(), radius: 1 });

            // Assert
            expect(s.shapes.solid.getSolidVolume({ shape: filleted })).toBeLessThan(1000);
        });
    });

    describe("offsets and thick solids", () => {
        it.each([
            ["a 10 box by -6", -6],
            ["a 10 box by -5", -5],
        ])("names the failure to offset %s", (_what, distance) => {
            // Act
            const failure = failureOf(() => s.operations.offset({ shape: box(), distance, tolerance: 0.1 }));

            // Assert
            expect(failure).toMatchObject(named("occt.offset.failed"));
        });

        it("names the failure when the kernel does not finish the offset of a solid", () => {
            // Arrange
            reportNotDone("BRepOffsetAPI_MakeOffsetShape");

            // Act
            const failure = failureOf(() => s.operations.offset({ shape: box(), distance: 1, tolerance: 0.1 }));

            // Assert
            expect(failure).toMatchObject(named("occt.offset.failed"));
        });

        it("names the failure when the kernel does not finish the offset of a wire", () => {
            // Arrange
            reportNotDone("BRepOffsetAPI_MakeOffset");

            // Act
            const failure = failureOf(() => s.operations.offset({ shape: square(), distance: 1, tolerance: 0.1 }));

            // Assert
            expect(failure).toMatchObject(named("occt.offset.failed"));
        });

        it("still offsets what the kernel can build", () => {
            // Act
            const grown = s.operations.offset({ shape: box(), distance: 2, tolerance: 0.1 });

            // Assert
            expect(s.operations.boundingBoxSizeOfShape({ shape: grown })).toEqual([14, 14, 14].map(size => expect.closeTo(size, 3)));
        });

        it("names the failure to thicken a 10 box by -6", () => {
            // Act
            const failure = failureOf(() => s.operations.makeThickSolidSimple({ shape: box(), offset: -6 }));

            // Assert
            expect(failure).toMatchObject(named("occt.thickSolid.failed"));
        });

        it("names the failure to hollow a 10 box by -10 through one of its faces", () => {
            // Arrange
            const shape = box();

            // Act
            const failure = failureOf(() => s.operations.makeThickSolidByJoin({ shape, shapes: [edgeAndFace(shape).face], offset: -10 }));

            // Assert
            expect(failure).toMatchObject(named("occt.thickSolid.failed"));
        });

        it.each([
            ["makeThickSolidSimple", (): unknown => s.operations.makeThickSolidSimple({ shape: box(), offset: -1 })],
            ["makeThickSolidByJoin", (): unknown => {
                const shape = box();
                return s.operations.makeThickSolidByJoin({ shape, shapes: [edgeAndFace(shape).face], offset: -1 });
            }],
        ])("names the failure when the kernel does not finish %s", (_what, run) => {
            // Arrange
            reportNotDone("BRepOffsetAPI_MakeThickSolid");

            // Act
            const failure = failureOf(run);

            // Assert
            expect(failure).toMatchObject(named("occt.thickSolid.failed"));
        });
    });

    describe("lofts", () => {
        it.each([
            ["one section", 1],
            ["no section", 0],
        ])("refuses %s as an input error before the kernel runs", (_what, count) => {
            // Act
            const failure = failureOf(() => s.operations.loft({ shapes: [circle(0)].slice(0, count), makeSolid: true }));

            // Assert
            expect(failure).toMatchObject({ name: "InputError", property: "shapes", message: `A loft needs at least two sections, and got ${count}.` });
        });

        it("refuses an advanced loft through one section and no point as an input error", () => {
            // Act
            const failure = failureOf(() => s.operations.loftAdvanced({ shapes: [circle(0)], makeSolid: true }));

            // Assert
            expect(failure).toMatchObject({ name: "InputError", property: "shapes", message: "A loft needs at least two sections, counting a start or end point, and got 1." });
        });

        it.each([
            ["two", 2],
            ["one, with a start point", 1],
        ])("refuses a periodic loft through %s sections as an input error", (_what, count) => {
            // Act
            const failure = failureOf(() => s.operations.loftAdvanced({ shapes: [circle(0), circle(10)].slice(0, count), closed: true, periodic: true, startVertex: [0, 20, 0], makeSolid: true }));

            // Assert
            expect(failure).toMatchObject({ name: "InputError", property: "shapes", message: `A periodic loft runs a closed curve through its sections, which needs at least three, and got ${count}.` });
        });

        it("builds a periodic loft through three sections", () => {
            // Act
            const loft = s.operations.loftAdvanced({ shapes: [circle(0), circle(10), circle(20)], closed: true, periodic: true, makeSolid: true });

            // Assert
            expect(loft.IsNull()).toBe(false);
        });

        it("counts a start point as a section of an advanced loft", () => {
            // Act
            const cone = s.operations.loftAdvanced({ shapes: [circle(0)], makeSolid: true, startVertex: [0, 10, 0] });

            // Assert
            expect(s.operations.boundingBoxSizeOfShape({ shape: cone })).toEqual([10, 10, 10].map(size => expect.closeTo(size, 3)));
        });

        it("counts an end point as a section of an advanced loft", () => {
            // Act
            const cone = s.operations.loftAdvanced({ shapes: [circle(0)], makeSolid: true, endVertex: [0, 10, 0] });

            // Assert
            expect(s.operations.boundingBoxSizeOfShape({ shape: cone })).toEqual([10, 10, 10].map(size => expect.closeTo(size, 3)));
        });

        it.each([
            ["loft", (): unknown => s.operations.loft({ shapes: [circle(0), circle(10)], makeSolid: true })],
            ["loftAdvanced", (): unknown => s.operations.loftAdvanced({ shapes: [circle(0), circle(10)], makeSolid: true })],
        ])("names the failure when the kernel does not finish %s", (_what, run) => {
            // Arrange
            reportNotDone("BRepOffsetAPI_ThruSections");

            // Act
            const failure = failureOf(run);

            // Assert
            expect(failure).toMatchObject(named("occt.loft.failed"));
        });
    });

    describe("revolves", () => {
        it.each([
            ["a whole turn", 360],
            ["a quarter turn", 90],
        ])("names the failure to revolve a profile across the axis by %s", (_what, angle) => {
            // Arrange
            const across = s.shapes.face.createFaceFromWire({ shape: s.shapes.wire.createSquareWire({ size: 4, center: [0, 0, 0], direction: [0, 0, 1] }), planar: true });

            // Act
            const failure = failureOf(() => s.operations.revolve({ shape: across, angle, direction: [0, 1, 0], copy: false }));

            // Assert
            expect(failure).toMatchObject(named("occt.revolve.failed"));
        });

        it("still revolves a profile beside the axis", () => {
            // Arrange
            const beside = s.shapes.face.createFaceFromWire({ shape: s.shapes.wire.createSquareWire({ size: 4, center: [5, 0, 0], direction: [0, 0, 1] }), planar: true });

            // Act
            const ring = s.operations.revolve({ shape: beside, angle: 360, direction: [0, 1, 0], copy: false });

            // Assert
            expect(s.shapes.solid.getSolidVolume({ shape: ring })).toBeCloseTo(2 * Math.PI * 5 * 16, 3);
        });
    });

    describe("pipes", () => {
        it("names the failure when the kernel does not finish a pipe along a path", () => {
            // Arrange
            reportNotDone("BRepOffsetAPI_MakePipeShell");

            // Act
            const failure = failureOf(() => s.operations.pipe({ shape: path(), shapes: [s.shapes.wire.createCircleWire({ radius: 1, center: [0, 0, 0], direction: [0, 1, 0] })] }));

            // Assert
            expect(failure).toMatchObject(named("occt.pipe.failed"));
        });

        it.each([
            ["pipeWireCylindrical", (): unknown => s.operations.pipeWireCylindrical({ shape: path(), radius: 1, makeSolid: true })],
            ["pipePolylineWireNGon", (): unknown => s.operations.pipePolylineWireNGon({ shape: path(), radius: 1, nrCorners: 6, makeSolid: true })],
        ])("names the failure when the kernel does not finish %s", (_what, run) => {
            // Arrange
            reportNotDone("BRepOffsetAPI_MakePipe");

            // Act
            const failure = failureOf(run);

            // Assert
            expect(failure).toMatchObject(named("occt.pipe.failed"));
        });

        it("still sweeps a pipe the kernel can build", () => {
            // Act
            const tube = s.operations.pipeWireCylindrical({ shape: path(), radius: 1, makeSolid: true });

            // Assert
            expect(s.shapes.solid.getSolidVolume({ shape: tube })).toBeGreaterThan(0);
        });
    });
});
