import { describe, it, expect, beforeAll } from "vitest";
import type { BitbybitOcctModule, TopoDS_Face, TopoDS_Shape, TopoDS_Shell, TopoDS_Solid, TopoDS_Wire } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import { InputError } from "@bitbybit-dev/base";
import { OccHelper } from "../occ-helper";
import { VectorHelperService } from "../api/vector-helper.service";
import { ShapesHelperService } from "../api/shapes-helper.service";
import { OCCTShapeFix } from "./shape-fix";
import { OCCTFillets } from "./fillets";
import * as Inputs from "../api/inputs";

const MISSING: unknown = undefined;

describe("OCCT shape fix validity report and free boundaries", () => {
    let occt: BitbybitOcctModule;
    let occHelper: OccHelper;
    let shapeFix: OCCTShapeFix;

    const box = (size = 10): TopoDS_Shape => occHelper.entitiesService.bRepPrimAPIMakeBox(size, size, size, [size / 2, size / 2, size / 2]);

    const shellOf = (faces: TopoDS_Shape[]): TopoDS_Shell => {
        const builder = new occt.BRep_Builder();
        const shell = builder.MakeShell();
        faces.forEach(face => builder.Add(shell, face));
        builder.delete();
        return shell;
    };

    const solidOf = (shell: TopoDS_Shell): TopoDS_Solid => {
        const builder = new occt.BRep_Builder();
        const solid = builder.MakeSolid();
        builder.Add(solid, shell);
        builder.delete();
        return solid;
    };

    const compoundOf = (shapes: TopoDS_Shape[]): TopoDS_Shape => occHelper.converterService.makeCompound({ shapes });

    const openBoxSolid = (): TopoDS_Solid => solidOf(shellOf(occt.FacesOf(box(), false).slice(0, 5)));

    const squareFace = (corner: Inputs.Base.Point3, size: number): TopoDS_Face => occHelper.facesService.createFaceFromWire({
        shape: occHelper.wiresService.createPolygonWire({
            points: [corner, [corner[0] + size, corner[1], corner[2]], [corner[0] + size, corner[1] + size, corner[2]], [corner[0], corner[1] + size, corner[2]]],
        }),
        planar: true,
    });

    const faceWithHoleRunningLikeItsOutline = (): TopoDS_Face => {
        const outline = squareFace([0, 0, 0], 10);
        const hole = occHelper.wiresService.createPolygonWire({ points: [[4, 4, 0], [6, 4, 0], [6, 6, 0], [4, 6, 0]] });
        const maker = new occt.BRepBuilderAPI_MakeFace(outline, hole);
        const face = maker.Face();
        maker.delete();
        return face;
    };

    const wireWithAGap = (): TopoDS_Wire => {
        const builder = new occt.BRep_Builder();
        const wire = builder.MakeWire();
        builder.Add(wire, occHelper.edgesService.lineEdge({ start: [0, 0, 0], end: [1, 0, 0] }));
        builder.Add(wire, occHelper.edgesService.lineEdge({ start: [5, 0, 0], end: [6, 0, 0] }));
        builder.delete();
        return wire;
    };

    const lengthsOf = (wires: TopoDS_Shape): number[] => occHelper.wiresService.getWiresLengths({ shapes: occHelper.shapeGettersService.getWires({ shape: wires }) });

    beforeAll(async () => {
        occt = await createBitbybitOcct();
        occHelper = new OccHelper(new VectorHelperService(), new ShapesHelperService(), occt);
        shapeFix = new OCCTShapeFix(occt, occHelper);
    });

    describe("isValid", () => {
        it("should tell a box and a fillet that fits it are well formed", () => {
            // Arrange
            const solid = box();

            // Act
            const boxIsValid = shapeFix.isValid({ shape: solid });
            const filletIsValid = shapeFix.isValid({ shape: new OCCTFillets(occt, occHelper).filletEdges({ shape: solid, radius: 1 }) });

            // Assert
            expect(boxIsValid).toBe(true);
            expect(filletIsValid).toBe(true);
        });

        it("should tell a fillet too large for the faces beside its edges is not, though the kernel built it", () => {
            // Arrange
            const rounded = new OCCTFillets(occt, occHelper).filletEdges({ shape: box(), radius: 6 });

            // Act
            const valid = shapeFix.isValid({ shape: rounded });

            // Assert
            expect(rounded.IsNull()).toBe(false);
            expect(valid).toBe(false);
        });

        it("should tell a face whose outline crosses itself is not", () => {
            // Arrange
            const bowTie = occHelper.wiresService.createPolygonWire({ points: [[0, 0, 0], [10, 0, 10], [10, 0, 0], [0, 0, 10]] });

            // Act
            const valid = shapeFix.isValid({ shape: occHelper.facesService.createFaceFromWire({ shape: bowTie, planar: true }) });

            // Assert
            expect(valid).toBe(false);
        });

        it("should tell a null shape is not", () => {
            // Arrange
            const cube = box(1);
            cube.Nullify();

            // Act
            const valid = shapeFix.isValid({ shape: cube });

            // Assert
            expect(valid).toBe(false);
        });
    });

    describe("validityReport", () => {
        it("should find nothing wrong with a box, whose tolerances are all the kernel's confusion distance", () => {
            // Arrange
            const cube = box();

            // Act
            const report = shapeFix.validityReport({ shape: cube });

            // Assert
            expect(report).toEqual({ isValid: true, faults: [], minTolerance: 1e-7, maxTolerance: 1e-7, averageTolerance: 1e-7 });
        });

        it("should name the shell of a solid that lacks a face as not closed", () => {
            // Arrange
            const solid = openBoxSolid();

            // Act
            const report = shapeFix.validityReport({ shape: solid });

            // Assert
            expect(report.isValid).toBe(false);
            expect(report.faults).toEqual([{ type: Inputs.OCCT.shapeTypeEnum.shell, index: 0, statuses: ["NotClosed"] }]);
        });

        it("should name a shell whose face is turned against the others, without the kernel's name prefix", () => {
            // Arrange
            const faces = occt.FacesOf(box(), false);
            const solid = solidOf(shellOf(faces.map((face, index) => index === 2 ? face.Reversed() : face)));

            // Act
            const report = shapeFix.validityReport({ shape: solid });

            // Assert
            expect(report.faults).toEqual([{ type: Inputs.OCCT.shapeTypeEnum.shell, index: 0, statuses: ["BadOrientationOfSubshape"] }]);
        });

        it("should number a faulty face as shapes.face.getFaces counts faces, every occurrence included", () => {
            // Arrange
            const holed = faceWithHoleRunningLikeItsOutline();
            const cube = box();
            const compound = compoundOf([cube, cube, holed]);
            const facesBefore = 12;

            // Act
            const report = shapeFix.validityReport({ shape: compound });

            // Assert
            expect(report.faults).toEqual([{ type: Inputs.OCCT.shapeTypeEnum.face, index: facesBefore, statuses: ["BadOrientationOfSubshape"] }]);
            expect(occHelper.shapeGettersService.getFaces({ shape: compound })[facesBefore]!.IsSame(holed)).toBe(true);
        });

        it("should number a faulty shell as the shells are counted, every occurrence included", () => {
            // Arrange
            const open = openBoxSolid();
            const cube = box();
            const compound = compoundOf([cube, cube, open]);

            // Act
            const report = shapeFix.validityReport({ shape: compound });

            // Assert
            expect(report.faults).toEqual([{ type: Inputs.OCCT.shapeTypeEnum.shell, index: 2, statuses: ["NotClosed"] }]);
            expect(occt.ShellsOf(compound, false)[2]!.IsSame(occt.ShellsOf(open, false)[0]!)).toBe(true);
        });

        it("should number a faulty wire as shapes.wire.getWires counts wires, every occurrence included", () => {
            // Arrange
            const gappy = wireWithAGap();
            const whole = occHelper.wiresService.createPolygonWire({ points: [[0, 0, 0], [1, 0, 0], [1, 1, 0]] });
            const compound = compoundOf([whole, whole, gappy]);

            // Act
            const report = shapeFix.validityReport({ shape: compound });

            // Assert
            expect(report.faults).toEqual([{ type: Inputs.OCCT.shapeTypeEnum.wire, index: 2, statuses: ["NotConnected"] }]);
            expect(occHelper.shapeGettersService.getWires({ shape: compound })[2]!.IsSame(gappy)).toBe(true);
        });

        it("should refuse a shape that is missing", () => {
            // Act
            const act = (): unknown => shapeFix.validityReport({ shape: MISSING as TopoDS_Shape });

            // Assert
            expect(act).toThrow(new InputError("`shape` is missing or empty, as an operation that failed can leave it.", "shape"));
        });
    });

    describe("freeBoundaries", () => {
        it("should find the rim of a box with a face left out as one closed wire around the opening", () => {
            // Arrange
            const openShell = shellOf(occt.FacesOf(box(), false).slice(0, 5));

            // Act
            const bounds = shapeFix.freeBoundaries({ shape: openShell, tolerance: 1e-7 });

            // Assert
            expect(lengthsOf(bounds.closed).map(length => Number(length.toFixed(9)))).toEqual([40]);
            expect(occHelper.shapeGettersService.getEdges({ shape: bounds.open })).toEqual([]);
        });

        it("should find no rim on a closed box", () => {
            // Arrange
            const cube = box();

            // Act
            const bounds = shapeFix.freeBoundaries({ shape: cube, tolerance: 1e-7 });

            // Assert
            expect(occHelper.shapeGettersService.getEdges({ shape: bounds.closed })).toEqual([]);
            expect(occHelper.shapeGettersService.getEdges({ shape: bounds.open })).toEqual([]);
        });

        it("should give a lone square face its outline, by the default tolerance", () => {
            // Arrange
            const square = squareFace([0, 0, 0], 10);

            // Act
            const bounds = shapeFix.freeBoundaries({ shape: square });

            // Assert
            expect(lengthsOf(bounds.closed).map(length => Number(length.toFixed(9)))).toEqual([40]);
        });

        it("should see two squares a thousandth apart as two rims, and as one rim around both at a coarser tolerance", () => {
            // Arrange
            const pair = compoundOf([squareFace([0, 0, 0], 10), squareFace([10.001, 0, 0], 10)]);

            // Act
            const fine = shapeFix.freeBoundaries({ shape: pair, tolerance: 1e-7 });
            const coarse = shapeFix.freeBoundaries({ shape: pair, tolerance: 0.01 });

            // Assert
            expect(lengthsOf(fine.closed)).toHaveLength(2);
            expect(lengthsOf(coarse.closed)).toHaveLength(1);
        });

        it("should refuse a negative tolerance", () => {
            // Act
            const act = (): unknown => shapeFix.freeBoundaries({ shape: box(), tolerance: -1 });

            // Assert
            expect(act).toThrow(new InputError("`tolerance` must be a finite number 0 or more; it is -1.", "tolerance"));
        });
    });
});
