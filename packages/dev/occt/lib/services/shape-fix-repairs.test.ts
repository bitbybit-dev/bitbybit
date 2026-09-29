import { describe, it, expect, beforeAll } from "vitest";
import createBitbybitOcct, { BitbybitOcctModule, TopoDS_Face, TopoDS_Shape, TopoDS_Shell, TopoDS_Solid } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import { InputError } from "@bitbybit-dev/base";
import { OccHelper } from "../occ-helper";
import { VectorHelperService } from "../api/vector-helper.service";
import { ShapesHelperService } from "../api/shapes-helper.service";
import { readKernelException } from "../kernel-exception";
import { OCCTShapeFix } from "./shape-fix";
import * as Inputs from "../api/inputs";

const MISSING: unknown = undefined;
const BOX_VOLUME = 1000;

describe("OCCT shape fix repairs of shells and solids and sewing with a report", () => {
    let occt: BitbybitOcctModule;
    let occHelper: OccHelper;
    let shapeFix: OCCTShapeFix;

    const box = (): TopoDS_Shape => occHelper.entitiesService.bRepPrimAPIMakeBox(10, 10, 10, [5, 5, 5]);

    const shellOf = (faces: TopoDS_Shape[]): TopoDS_Shell => {
        const builder = new occt.BRep_Builder();
        const shell = builder.MakeShell();
        faces.forEach(face => builder.Add(shell, face));
        builder.delete();
        return shell;
    };

    const solidOf = (shells: TopoDS_Shell[]): TopoDS_Solid => {
        const builder = new occt.BRep_Builder();
        const solid = builder.MakeSolid();
        shells.forEach(shell => builder.Add(solid, shell));
        builder.delete();
        return solid;
    };

    const boxShellWithFaceTurned = (turned: number): TopoDS_Shell =>
        shellOf(occt.FacesOf(box(), false).map((face, index) => index === turned ? face.Reversed() : face));

    const looseFacesOfBox = (): TopoDS_Shape[] => occt.FacesOf(box(), false).map(face => occt.BRepBuilderAPI_Copy_Shape(face, true));

    const squareFace = (points: Inputs.Base.Point3[]): TopoDS_Face =>
        occHelper.facesService.createFaceFromWire({ shape: occHelper.wiresService.createPolygonWire({ points }), planar: true });

    const volumeOf = (shape: TopoDS_Shape): number => occHelper.solidsService.getSolidVolume({ shape });

    const typeOf = (shape: TopoDS_Shape): Inputs.OCCT.shapeTypeEnum => occHelper.enumService.getShapeTypeEnum(shape);

    const totalLength = (shape: TopoDS_Shape): number => occHelper.edgesService.getEdgeLengthsOfShape({ shape }).reduce((sum, length) => sum + length, 0);

    const kernelMessageOf = (act: () => unknown): string => {
        try {
            act();
        } catch (thrown) {
            const read = readKernelException(occt, thrown);
            return read instanceof Error ? read.message : String(read);
        }
        return "no exception";
    };

    beforeAll(async () => {
        occt = await createBitbybitOcct();
        occHelper = new OccHelper(new VectorHelperService(), new ShapesHelperService(), occt);
        shapeFix = new OCCTShapeFix(occt, occHelper);
    });

    describe("fixShell", () => {
        it("should turn a face that runs against its shell, leaving a valid shell of the same six faces", () => {
            // Arrange
            const shell = boxShellWithFaceTurned(2);

            // Act
            const fixed = shapeFix.fixShell({ shape: shell });

            // Assert
            expect(typeOf(fixed)).toBe(Inputs.OCCT.shapeTypeEnum.shell);
            expect(occt.ShapeIsValid(fixed)).toBe(true);
            expect(occt.FacesOf(fixed, false)).toHaveLength(6);
            expect(occt.ShapeIsValid(solidOf([shell]))).toBe(false);
            expect(Math.abs(volumeOf(solidOf([occHelper.converterService.getActualTypeOfShape(fixed)])))).toBeCloseTo(BOX_VOLUME, 9);
        });

        it("should leave the faces of the shell it was given turned as they were", () => {
            // Arrange
            const shell = boxShellWithFaceTurned(2);
            const turnsBefore = occt.FacesOf(shell, false).map(face => face.Orientation());

            // Act
            shapeFix.fixShell({ shape: shell });

            // Assert
            expect(occt.FacesOf(shell, false).map(face => face.Orientation())).toEqual(turnsBefore);
        });

        it("should refuse a shape that is not a shell, as the kernel names it", () => {
            // Act
            const message = kernelMessageOf(() => shapeFix.fixShell({ shape: box() }));

            // Assert
            expect(message).toBe("Standard_DomainError: FixShell: the shape is not a shell");
        });

        it("should refuse a shape that is missing", () => {
            // Act
            const act = (): unknown => shapeFix.fixShell({ shape: MISSING as TopoDS_Shell });

            // Assert
            expect(act).toThrow(new InputError("`shape` is missing or empty, as an operation that failed can leave it.", "shape"));
        });
    });

    describe("fixSolid", () => {
        it("should make the solid a closed shell encloses", () => {
            // Arrange
            const shell = occt.ShellsOf(box(), false)[0]!;

            // Act
            const solid = shapeFix.fixSolid({ shape: shell });

            // Assert
            expect(typeOf(solid)).toBe(Inputs.OCCT.shapeTypeEnum.solid);
            expect(volumeOf(solid)).toBeCloseTo(BOX_VOLUME, 9);
        });

        it("should turn an inside-out solid so its volume is positive again", () => {
            // Arrange
            const insideOut = box().Reversed();

            // Act
            const solid = shapeFix.fixSolid({ shape: insideOut });

            // Assert
            expect(volumeOf(insideOut)).toBeCloseTo(-BOX_VOLUME, 9);
            expect(volumeOf(solid)).toBeCloseTo(BOX_VOLUME, 9);
        });

        it("should give back the fixed shell of a solid whose only shell encloses nothing", () => {
            // Arrange
            const open = solidOf([shellOf(occt.FacesOf(box(), false).slice(0, 5))]);

            // Act
            const result = shapeFix.fixSolid({ shape: open });

            // Assert
            expect(typeOf(result)).toBe(Inputs.OCCT.shapeTypeEnum.shell);
            expect(occt.FacesOf(result, false)).toHaveLength(5);
        });

        it("should refuse a face, as the kernel names it", () => {
            // Act
            const message = kernelMessageOf(() => shapeFix.fixSolid({ shape: occt.FacesOf(box(), false)[0]! }));

            // Assert
            expect(message).toBe("Standard_DomainError: FixSolid: the shape is not a solid or a shell");
        });
    });

    describe("orientClosedSolid", () => {
        it("should turn an inside-out solid so its material is inside, leaving the one it was given inside out", () => {
            // Arrange
            const insideOut = occHelper.converterService.getActualTypeOfShape(box().Reversed());

            // Act
            const oriented = shapeFix.orientClosedSolid({ shape: insideOut });

            // Assert
            expect(volumeOf(oriented)).toBeCloseTo(BOX_VOLUME, 9);
            expect(volumeOf(insideOut)).toBeCloseTo(-BOX_VOLUME, 9);
        });

        it("should keep a solid that is already the right way out", () => {
            // Act
            const oriented = shapeFix.orientClosedSolid({ shape: box() });

            // Assert
            expect(volumeOf(oriented)).toBeCloseTo(BOX_VOLUME, 9);
        });

        it.each([
            ["a solid whose shell is open", (): TopoDS_Shape => solidOf([shellOf(occt.FacesOf(box(), false).slice(0, 5))]), "Standard_DomainError: OrientClosedSolid: the solid is open"],
            ["a solid without a shell", (): TopoDS_Shape => solidOf([]), "Standard_DomainError: OrientClosedSolid: the solid has no shell"],
            ["a shell", (): TopoDS_Shape => occt.ShellsOf(box(), false)[0]!, "Standard_DomainError: OrientClosedSolid: the shape is not a solid"],
        ])("should refuse %s, as the kernel names it", (_name, make, expected) => {
            // Act
            const message = kernelMessageOf(() => shapeFix.orientClosedSolid({ shape: make() }));

            // Assert
            expect(message).toBe(expected);
        });
    });

    describe("sewWithReport", () => {
        it("should sew the six loose faces of a box into a closed shell, every edge sewn and none free", () => {
            // Arrange
            const faces = looseFacesOfBox();

            // Act
            const sewn = shapeFix.sewWithReport({ shapes: faces, tolerance: 1e-7, nonManifold: false });

            // Assert
            expect(typeOf(sewn.shape)).toBe(Inputs.OCCT.shapeTypeEnum.shell);
            expect([sewn.freeEdgeCount, sewn.contiguousEdgeCount, sewn.multipleEdgeCount, sewn.degeneratedCount]).toEqual([0, 12, 0, 0]);
            expect(occt.EdgesOf(sewn.freeEdges, true)).toHaveLength(0);
            expect(volumeOf(shapeFix.fixSolid({ shape: sewn.shape }))).toBeCloseTo(BOX_VOLUME, 9);
        });

        it("should hand back the rim of the opening as free edges when a face of the box is left out", () => {
            // Arrange
            const faces = looseFacesOfBox().slice(0, 5);

            // Act
            const sewn = shapeFix.sewWithReport({ shapes: faces });

            // Assert
            expect([sewn.freeEdgeCount, sewn.contiguousEdgeCount]).toEqual([4, 8]);
            expect(totalLength(sewn.freeEdges)).toBeCloseTo(40, 9);
        });

        it("should share one edge among three squares when an edge may join more than two faces", () => {
            // Arrange
            const squares = [
                squareFace([[0, 0, 0], [10, 0, 0], [10, 0, 10], [0, 0, 10]]),
                squareFace([[0, 0, 0], [0, 10, 0], [0, 10, 10], [0, 0, 10]]),
                squareFace([[0, 0, 0], [-10, 0, 0], [-10, 0, 10], [0, 0, 10]]),
            ];

            // Act
            const sewn = shapeFix.sewWithReport({ shapes: squares, tolerance: 1e-7, nonManifold: true });

            // Assert
            expect(sewn.multipleEdgeCount).toBe(1);
            expect(sewn.freeEdgeCount).toBe(9);
            expect(totalLength(sewn.freeEdges)).toBeCloseTo(90, 9);
        });

        it("should count the two poles of a sphere as degenerate", () => {
            // Arrange
            const sphereFace = occt.FacesOf(occHelper.entitiesService.bRepPrimAPIMakeSphere([0, 0, 0], [0, 1, 0], 5), false)[0]!;

            // Act
            const sewn = shapeFix.sewWithReport({ shapes: [sphereFace], tolerance: 1e-7, nonManifold: false });

            // Assert
            expect(sewn.degeneratedCount).toBe(2);
        });

        it("should refuse an empty list, which leaves nothing to sew", () => {
            // Act
            const act = (): unknown => shapeFix.sewWithReport({ shapes: [] });

            // Assert
            expect(act).toThrow(new InputError("`shapes` is empty: there is nothing to sew.", "shapes"));
        });

        it("should refuse a tolerance of 0", () => {
            // Act
            const act = (): unknown => shapeFix.sewWithReport({ shapes: looseFacesOfBox(), tolerance: 0 });

            // Assert
            expect(act).toThrow(new InputError("`tolerance` must be above 0; it is 0.", "tolerance"));
        });

        it("should refuse a negative tolerance", () => {
            // Act
            const act = (): unknown => shapeFix.sewWithReport({ shapes: looseFacesOfBox(), tolerance: -1 });

            // Assert
            expect(act).toThrow(new InputError("`tolerance` must be a finite number 0 or more; it is -1.", "tolerance"));
        });

        it("should refuse a list that holds a missing shape, naming its position", () => {
            // Act
            const act = (): unknown => shapeFix.sewWithReport({ shapes: [box(), MISSING as TopoDS_Shape] });

            // Assert
            expect(act).toThrow(new InputError("`shapes` holds a missing or empty shape at position 1, as an operation that failed can leave it.", "shapes"));
        });
    });
});
