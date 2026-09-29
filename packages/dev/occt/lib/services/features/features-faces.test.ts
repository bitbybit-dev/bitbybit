import { describe, it, expect, beforeAll } from "vitest";
import createBitbybitOcct, { BitbybitOcctModule, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTService } from "../../occ-service";
import { readKernelException } from "../../kernel-exception";
import * as Inputs from "../../api/inputs";
import { InputError } from "@bitbybit-dev/base";

describe("OCCT face features", () => {
    let occt: OCCTService;
    let kernel: BitbybitOcctModule;

    beforeAll(async () => {
        kernel = await createBitbybitOcct();
        occt = new OCCTService(kernel, new OccHelper(new VectorHelperService(), new ShapesHelperService(), kernel));
    }, 120_000);

    const cube = (center: Inputs.Base.Point3 = [0, 5, 0]): TopoDS_Shape => occt.shapes.solid.createBox({ width: 10, length: 10, height: 10, center });
    const holedCube = (): TopoDS_Shape => occt.booleans.difference({
        shape: cube(),
        shapes: [occt.shapes.solid.createCylinder({ radius: 2, height: 12, center: [0, -1, 0], direction: [0, 1, 0] })],
        keepEdges: false,
    });
    const facing = (shape: TopoDS_Shape, direction: Inputs.Base.Vector3): number[] => occt.select.faces.facing({ shape, direction, angle: 0 });
    const walls = (shape: TopoDS_Shape): number[] => occt.select.faces.ofType({ shape, type: Inputs.OCCT.surfaceTypeEnum.cylinder });
    const volumeOf = (shape: TopoDS_Shape): number => occt.shapes.solid.getSolids({ shape }).reduce((sum, solid) => sum + occt.shapes.solid.getSolidVolume({ shape: solid }), 0);
    const kernelMessage = (action: () => unknown): string => {
        try {
            action();
        } catch (error) {
            const read = readKernelException(kernel, error);
            return read instanceof Error ? read.message : String(read);
        }
        return "nothing thrown";
    };
    const thrownBy = (action: () => unknown): InputError => {
        try {
            action();
        } catch (error) {
            expect(error).toBeInstanceOf(InputError);
            return error as InputError;
        }
        throw new Error("expected an InputError, but nothing was thrown");
    };

    describe("removeFaces", () => {
        it("should fill a hole whose wall is removed and sharpen an edge whose round is removed", () => {
            // Arrange
            const holed = holedCube();
            const rounded = occt.fillets.filletEdges({ shape: cube(), radius: 2, indexes: [0] });

            // Act
            const filled = occt.features.removeFaces({ shape: holed, indexes: walls(holed) });
            const sharp = occt.features.removeFaces({ shape: rounded, indexes: walls(rounded) });

            // Assert
            expect(volumeOf(holed)).toBeCloseTo(1000 - 40 * Math.PI, 6);
            expect(volumeOf(filled)).toBeCloseTo(1000, 6);
            expect(occt.shapes.shape.getShapeType({ shape: filled })).toBe(Inputs.OCCT.shapeTypeEnum.solid);
            expect(volumeOf(rounded)).toBeLessThan(1000 - 1);
            expect(volumeOf(sharp)).toBeCloseTo(1000, 6);
            expect(occt.shapes.shape.isValid({ shape: filled })).toBe(true);
        });

        it("should pass on the kernel's refusal of a gap it cannot close, a face the shape lacks, no faces and a shape that is not solid", () => {
            // Arrange
            const box = cube();
            const shell = occt.shapes.shell.sewFaces({ shapes: occt.shapes.face.getFaces({ shape: holedCube() }), tolerance: 1e-7 });

            // Act
            const top = kernelMessage(() => occt.features.removeFaces({ shape: box, indexes: facing(box, [0, 1, 0]) }));
            const beyond = kernelMessage(() => occt.features.removeFaces({ shape: box, indexes: [6] }));
            const none = kernelMessage(() => occt.features.removeFaces({ shape: box, indexes: [] }));
            const notSolid = kernelMessage(() => occt.features.removeFaces({ shape: shell, indexes: walls(shell) }));

            // Assert
            expect(top).toBe("Standard_DomainError: RemoveFaces: OCCT could not remove the faces and close the gap they leave");
            expect(beyond).toBe("Standard_DomainError: RemoveFaces: the shape has no face 6");
            expect(none).toBe("Standard_DomainError: RemoveFaces: no faces were chosen");
            expect(notSolid).toBe("Standard_DomainError: RemoveFaces: the shape holds parts that are not solids");
        });

        it("should refuse an index that is not a whole number from 0", () => {
            // Arrange
            const box = cube();

            // Act
            const negative = thrownBy(() => occt.features.removeFaces({ shape: box, indexes: [-1] }));

            // Assert
            expect(negative.message).toBe("`indexes` holds -1, which is not an index: indexes are whole numbers from 0.");
        });
    });

    describe("pushPullFaces", () => {
        it("should move a face out along its normal, by 1 unless told otherwise, and faces in by their own distances", () => {
            // Arrange
            const box = cube();
            const [top] = facing(box, [0, 1, 0]);
            const [bottom] = facing(box, [0, -1, 0]);

            // Act
            const taller = occt.features.pushPullFaces({ shape: box, indexes: [top!], distance: 2 });
            const byDefault = occt.features.pushPullFaces({ shape: box, indexes: [top!] });
            const shorter = occt.features.pushPullFaces({ shape: box, indexes: [top!, bottom!], distances: [-1, -2] });

            // Assert
            const tallerBox = occt.operations.boundingBoxOfShape({ shape: taller });
            expect(volumeOf(taller)).toBeCloseTo(1200, 6);
            expect(tallerBox.max[1]).toBeCloseTo(12, 6);
            expect(volumeOf(byDefault)).toBeCloseTo(1100, 6);
            expect(volumeOf(shorter)).toBeCloseTo(700, 6);
            expect(occt.shapes.shape.isValid({ shape: shorter })).toBe(true);
        });

        it("should keep the solid of a boolean result and move the faces of every solid of a compound", () => {
            // Arrange
            const holed = holedCube();
            const pair = occt.shapes.compound.makeCompound({ shapes: [cube(), cube([20, 5, 0])] });

            // Act
            const raised = occt.features.pushPullFaces({ shape: holed, indexes: facing(holed, [0, 1, 0]), distance: 2 });
            const moved = occt.features.pushPullFaces({ shape: pair, indexes: facing(pair, [0, 1, 0]), distances: [1, 3] });

            // Assert
            expect(occt.shapes.solid.getSolids({ shape: raised })).toHaveLength(1);
            expect(volumeOf(raised)).toBeCloseTo(12 * (100 - 4 * Math.PI), 6);
            expect(occt.shapes.solid.getSolids({ shape: moved })).toHaveLength(2);
            expect(volumeOf(moved)).toBeCloseTo(1100 + 1300, 6);
        });

        it("should give the one solid of nested compounds back as that solid, and a moved loose face as a shell in its compound", () => {
            // Arrange
            const nested = occt.shapes.compound.makeCompound({ shapes: [occt.shapes.compound.makeCompound({ shapes: [cube()] })] });
            const face = occt.shapes.face.createSquareFace({ size: 10, center: [0, 10, 0], direction: [0, 1, 0] });
            const loose = occt.shapes.compound.makeCompound({ shapes: [face] });

            // Act
            const raised = occt.features.pushPullFaces({ shape: nested, indexes: facing(nested, [0, 1, 0]), distance: 2 });
            const lifted = occt.features.pushPullFaces({ shape: loose, indexes: [0], distance: 2 });

            // Assert
            const [shell] = occt.shapes.compound.getShapesOfCompound({ shape: lifted });
            expect(occt.shapes.shape.getShapeType({ shape: raised })).toBe(Inputs.OCCT.shapeTypeEnum.solid);
            expect(volumeOf(raised)).toBeCloseTo(1200, 6);
            expect(occt.shapes.shape.getShapeType({ shape: lifted })).toBe(Inputs.OCCT.shapeTypeEnum.compound);
            expect(occt.shapes.shape.getShapeType({ shape: shell! })).toBe(Inputs.OCCT.shapeTypeEnum.shell);
            expect(occt.operations.boundingBoxOfShape({ shape: lifted }).center[1]).toBeCloseTo(12, 6);
        });

        it("should refuse a distance that is not finite and distances that are not a list of finite numbers", () => {
            // Arrange
            const box = cube();
            const [top] = facing(box, [0, 1, 0]);

            // Act
            const distance = thrownBy(() => occt.features.pushPullFaces({ shape: box, indexes: [top!], distance: Number.NaN }));
            const distances = thrownBy(() => occt.features.pushPullFaces({ shape: box, indexes: [top!], distances: [Infinity] }));

            // Assert
            expect(distance.message).toBe("`distance` must be a finite number; it is NaN.");
            expect(distances.message).toBe("`distances` holds Infinity at position 0; each is a finite number.");
        });

        it("should pass on the kernel's refusal of a distance count that differs and a face chosen twice", () => {
            // Arrange
            const box = cube();

            // Act
            const mismatch = kernelMessage(() => occt.features.pushPullFaces({ shape: box, indexes: [0, 1], distances: [1] }));
            const twice = kernelMessage(() => occt.features.pushPullFaces({ shape: box, indexes: [2, 2], distance: 1 }));

            // Assert
            expect(mismatch).toBe("Standard_DomainError: PushPullFaces: give one distance per face");
            expect(twice).toBe("Standard_DomainError: PushPullFaces: face 2 is chosen twice");
        });
    });
});
