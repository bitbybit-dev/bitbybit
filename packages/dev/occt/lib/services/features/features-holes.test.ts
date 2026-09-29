import { describe, it, expect, beforeAll } from "vitest";
import createBitbybitOcct, { BitbybitOcctModule, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTService } from "../../occ-service";
import { readKernelException } from "../../kernel-exception";
import * as Inputs from "../../api/inputs";
import { InputError } from "@bitbybit-dev/base";

describe("OCCT hole features", () => {
    let occt: OCCTService;
    let kernel: BitbybitOcctModule;

    beforeAll(async () => {
        kernel = await createBitbybitOcct();
        occt = new OCCTService(kernel, new OccHelper(new VectorHelperService(), new ShapesHelperService(), kernel));
    }, 120_000);

    const plate = (): TopoDS_Shape => occt.shapes.solid.createBoxFromCorner({ corner: [0, 0, 0], width: 20, height: 10, length: 20 });
    const onTop = (x: number, z: number): Inputs.Base.Frame => ({ origin: [x, 10, z], normal: [0, 1, 0], direction: [1, 0, 0] });
    const onSide: Inputs.Base.Frame = { origin: [0, 5, 10], normal: [-1, 0, 0], direction: [0, 1, 0] };
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
    const loose = <T>(value: unknown): T => value as T;

    describe("holes", () => {
        it("should drill a hole through the plate, and a blind one to its depth", () => {
            // Arrange
            const frames = [onTop(10, 10)];

            // Act
            const through = occt.features.holes({ shape: plate(), frames, diameter: 4, depth: 0, tipAngle: 0 });
            const blind = occt.features.holes({ shape: plate(), frames, diameter: 4, depth: 5, tipAngle: 0 });

            // Assert
            expect(occt.shapes.shape.getShapeType({ shape: through })).toBe(Inputs.OCCT.shapeTypeEnum.solid);
            expect(volumeOf(through)).toBeCloseTo(4000 - 40 * Math.PI, 6);
            expect(volumeOf(blind)).toBeCloseTo(4000 - 20 * Math.PI, 6);
            expect(occt.shapeFix.isValid({ shape: through })).toBe(true);
            expect(occt.shapeFix.isValid({ shape: blind })).toBe(true);
        });

        it("should leave the cone of a drill point below a blind hole, its angle in degrees", () => {
            // Arrange
            const tip = 2 / Math.tan(59 * Math.PI / 180);

            // Act
            const drilled = occt.features.holes({ shape: plate(), frames: [onTop(10, 10)], diameter: 4, depth: 5, tipAngle: 118 });

            // Assert
            expect(volumeOf(drilled)).toBeCloseTo(4000 - 20 * Math.PI - Math.PI * 4 * tip / 3, 6);
        });

        it("should drill one hole per frame in one cut, holes that cross included", () => {
            // Arrange
            const frames = [onTop(5, 5), onTop(15, 5), onTop(5, 15), onTop(15, 15), onSide];
            const steinmetz = 16 * 8 / 3;

            // Act
            const blind = occt.features.holes({ shape: plate(), frames, diameter: 4, depth: 5 });
            const crossed = occt.features.holes({ shape: plate(), frames: [onTop(10, 10), onSide], diameter: 4, depth: 0 });

            // Assert
            expect(volumeOf(blind)).toBeCloseTo(4000 - 5 * 20 * Math.PI, 6);
            expect(volumeOf(crossed)).toBeCloseTo(4000 - 40 * Math.PI - 80 * Math.PI + steinmetz, 6);
        });

        it("should drill a hole of diameter 1 through the shape with a flat bottom by default", () => {
            // Arrange
            const frames = [onTop(10, 10)];

            // Act
            const drilled = occt.features.holes({ shape: plate(), frames });

            // Assert
            expect(volumeOf(drilled)).toBeCloseTo(4000 - Math.PI * 0.25 * 10, 6);
        });

        it("should refuse a diameter of 0, a negative depth, a tip of 180 degrees and frames that are not a list", () => {
            // Arrange
            const frames = [onTop(10, 10)];

            // Act
            const diameter = thrownBy(() => occt.features.holes({ shape: plate(), frames, diameter: 0 }));
            const depth = thrownBy(() => occt.features.holes({ shape: plate(), frames, depth: -1 }));
            const tip = thrownBy(() => occt.features.holes({ shape: plate(), frames, tipAngle: 180 }));
            const notList = thrownBy(() => occt.features.holes({ shape: plate(), frames: loose(onTop(1, 1)) }));

            // Assert
            expect(diameter.message).toBe("`diameter` must be a finite number above 0; it is 0.");
            expect(depth.message).toBe("`depth` must be a finite number 0 or more; it is -1.");
            expect(tip.message).toBe("`tipAngle` must be a finite number at least 0 and below 180; it is 180.");
            expect(notList.message).toBe("`frames` is not a list of frames.");
        });

        it("should pass on the kernel's refusal of no frames", () => {
            // Arrange
            const shape = plate();

            // Act
            const none = kernelMessage(() => occt.features.holes({ shape, frames: [] }));

            // Assert
            expect(none).toBe("Standard_DomainError: DrillHoles: no frames were given");
        });
    });

    describe("counterboredHoles", () => {
        it("should sink a wider, flat-bottomed counterbore at the mouth of each hole", () => {
            // Arrange
            const frames = [onTop(10, 10)];

            // Act
            const drilled = occt.features.counterboredHoles({ shape: plate(), frames, diameter: 4, depth: 0, tipAngle: 0, counterboreDiameter: 8, counterboreDepth: 3 });
            const byDefault = occt.features.counterboredHoles({ shape: plate(), frames });

            // Assert
            expect(volumeOf(drilled)).toBeCloseTo(4000 - 48 * Math.PI - 28 * Math.PI, 6);
            expect(volumeOf(byDefault)).toBeCloseTo(4000 - Math.PI * 1 * 0.5 - Math.PI * 0.25 * 9.5, 6);
        });

        it("should refuse a counterbore of depth 0 and pass on the kernel's refusal of a narrow or a deep one", () => {
            // Arrange
            const frames = [onTop(10, 10)];

            // Act
            const flat = thrownBy(() => occt.features.counterboredHoles({ shape: plate(), frames, counterboreDepth: 0 }));
            const narrow = kernelMessage(() => occt.features.counterboredHoles({ shape: plate(), frames, diameter: 4, counterboreDiameter: 3 }));
            const deep = kernelMessage(() => occt.features.counterboredHoles({ shape: plate(), frames, diameter: 4, depth: 5, counterboreDiameter: 8, counterboreDepth: 5 }));

            // Assert
            expect(flat.message).toBe("`counterboreDepth` must be a finite number above 0; it is 0.");
            expect(narrow).toBe("Standard_DomainError: DrillHoles: a counterbore is wider than the hole and deeper than 0");
            expect(deep).toBe("Standard_DomainError: DrillHoles: the counterbore or countersink reaches as deep as the hole");
        });
    });

    describe("countersunkHoles", () => {
        it("should sink a cone at the mouth of each hole, its full angle in degrees", () => {
            // Arrange
            const frames = [onTop(10, 10)];

            // Act
            const drilled = occt.features.countersunkHoles({ shape: plate(), frames, diameter: 4, depth: 0, tipAngle: 0, countersinkDiameter: 8, countersinkAngle: 90 });
            const byDefault = occt.features.countersunkHoles({ shape: plate(), frames });

            // Assert
            expect(volumeOf(drilled)).toBeCloseTo(4000 - 56 * Math.PI / 3 - 32 * Math.PI, 6);
            expect(volumeOf(byDefault)).toBeCloseTo(4000 - 8 * Math.PI / 3, 6);
        });

        it("should refuse a countersink angle of 180 degrees and pass on the kernel's refusal of a narrow countersink", () => {
            // Arrange
            const frames = [onTop(10, 10)];

            // Act
            const open = thrownBy(() => occt.features.countersunkHoles({ shape: plate(), frames, countersinkAngle: 180 }));
            const narrow = kernelMessage(() => occt.features.countersunkHoles({ shape: plate(), frames, diameter: 4, countersinkDiameter: 3 }));

            // Assert
            expect(open.message).toBe("`countersinkAngle` must be a finite number above 0 and below 180; it is 180.");
            expect(narrow).toBe("Standard_DomainError: DrillHoles: a countersink is wider than the hole, its angle between 0 and pi");
        });
    });
});
