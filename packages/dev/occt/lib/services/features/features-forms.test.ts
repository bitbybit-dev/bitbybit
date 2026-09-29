import { describe, it, expect, beforeAll } from "vitest";
import createBitbybitOcct, { BitbybitOcctModule, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTService } from "../../occ-service";
import { readKernelException } from "../../kernel-exception";
import * as Inputs from "../../api/inputs";
import { InputError } from "@bitbybit-dev/base";

describe("OCCT form features", () => {
    let occt: OCCTService;
    let kernel: BitbybitOcctModule;

    beforeAll(async () => {
        kernel = await createBitbybitOcct();
        occt = new OCCTService(kernel, new OccHelper(new VectorHelperService(), new ShapesHelperService(), kernel));
    }, 120_000);

    const extent = Inputs.OCCT.featureExtentEnum;
    const box = (corner: Inputs.Base.Point3, opposite: Inputs.Base.Point3): TopoDS_Shape => occt.shapes.solid.createBoxFromCorner({
        corner,
        width: opposite[0] - corner[0],
        height: opposite[1] - corner[1],
        length: opposite[2] - corner[2],
    });
    const cube = (): TopoDS_Shape => box([-5, 0, -5], [5, 10, 5]);
    const profile = (): TopoDS_Shape => occt.shapes.face.createSquareFace({ size: 2, center: [0, 10, 0], direction: [0, 1, 0] });
    const topOf = (shape: TopoDS_Shape): number => occt.select.faces.onPlane({ shape, origin: [0, 10, 0], normal: [0, 1, 0] })[0]!;
    const bottomOf = (shape: TopoDS_Shape): number => occt.select.faces.onPlane({ shape, origin: [0, 0, 0], normal: [0, 1, 0] })[0]!;
    const volumeOf = (shape: TopoDS_Shape): number => occt.shapes.solid.getSolids({ shape }).reduce((sum, solid) => sum + occt.shapes.solid.getSolidVolume({ shape: solid }), 0);
    const frustum = (height: number, bottom: number, top: number): number => height / 3 * (bottom * bottom + top * top + bottom * top);
    const tan = (degrees: number): number => Math.tan(degrees * Math.PI / 180);
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

    describe("boss and pocket", () => {
        it("should add a boss, cut a pocket to a length, through all and down to a face", () => {
            // Arrange
            const base = cube();
            const top = topOf(base);

            // Act
            const bossed = occt.features.boss({ shape: base, profile: profile(), sketchFaceIndex: top, direction: [0, 1, 0], extent: extent.length, length: 3, untilFaceIndex: 0 });
            const pocketed = occt.features.pocket({ shape: base, profile: profile(), sketchFaceIndex: top, direction: [0, -1, 0], length: 3 });
            const through = occt.features.pocket({ shape: base, profile: profile(), sketchFaceIndex: top, direction: [0, -1, 0], extent: extent.throughAll });
            const toBottom = occt.features.pocket({ shape: base, profile: profile(), sketchFaceIndex: top, direction: [0, -1, 0], extent: extent.untilFace, untilFaceIndex: bottomOf(base) });

            // Assert
            expect(occt.shapes.shape.getShapeType({ shape: bossed })).toBe(Inputs.OCCT.shapeTypeEnum.solid);
            expect(volumeOf(bossed)).toBeCloseTo(1012, 6);
            expect(occt.operations.boundingBoxOfShape({ shape: bossed }).max[1]).toBeCloseTo(13, 6);
            expect(volumeOf(pocketed)).toBeCloseTo(988, 6);
            expect(volumeOf(through)).toBeCloseTo(960, 6);
            expect(volumeOf(toBottom)).toBeCloseTo(960, 6);
            expect(occt.shapeFix.isValid({ shape: pocketed })).toBe(true);
        });

        it("should grow a boss 1 up along y by default", () => {
            // Arrange
            const base = cube();

            // Act
            const bossed = occt.features.boss({ shape: base, profile: profile(), sketchFaceIndex: topOf(base) });

            // Assert
            expect(volumeOf(bossed)).toBeCloseTo(1004, 6);
        });

        it("should stop a pocket at the ceiling of a void and a boss at the underside of an overhang", () => {
            // Arrange
            const hollow = occt.booleans.difference({ shape: cube(), shapes: [box([-3, 2, -3], [3, 5, 3])], keepEdges: false });
            const ceiling = occt.select.faces.onPlane({ shape: hollow, origin: [0, 5, 0], normal: [0, 1, 0] })[0]!;
            const shelf = occt.booleans.union({ shapes: [cube(), box([-5, 14, -5], [5, 15, 5]), box([4, 10, -5], [5, 14, 5])], keepEdges: false });
            const underside = occt.select.faces.onPlane({ shape: shelf, origin: [0, 14, 0], normal: [0, 1, 0] })[0]!;

            // Act
            const toVoid = occt.features.pocket({ shape: hollow, profile: profile(), sketchFaceIndex: topOf(hollow), direction: [0, -1, 0], extent: extent.untilFace, untilFaceIndex: ceiling });
            const throughVoid = occt.features.pocket({ shape: hollow, profile: profile(), sketchFaceIndex: topOf(hollow), direction: [0, -1, 0], extent: extent.throughAll });
            const toOverhang = occt.features.boss({ shape: shelf, profile: profile(), sketchFaceIndex: topOf(shelf), direction: [0, 1, 0], extent: extent.untilFace, untilFaceIndex: underside });
            const throughOverhang = occt.features.boss({ shape: shelf, profile: profile(), sketchFaceIndex: topOf(shelf), direction: [0, 1, 0], extent: extent.throughAll });

            // Assert
            expect(volumeOf(hollow)).toBeCloseTo(892, 6);
            expect(volumeOf(toVoid)).toBeCloseTo(892 - 20, 6);
            expect(volumeOf(throughVoid)).toBeCloseTo(892 - 28, 6);
            expect(volumeOf(toOverhang)).toBeCloseTo(volumeOf(shelf) + 16, 6);
            expect(volumeOf(throughOverhang)).toBeCloseTo(volumeOf(shelf) + 16, 6);
        });

        it("should refuse a sketch face that is not an index, an extent it does not know, a length of 0 and a direction of no length", () => {
            // Arrange
            const base = cube();

            // Act
            const sketch = thrownBy(() => occt.features.boss({ shape: base, profile: profile(), sketchFaceIndex: 1.5 }));
            const unknown = thrownBy(() => occt.features.boss({ shape: base, profile: profile(), sketchFaceIndex: 0, extent: loose("sideways") }));
            const length = thrownBy(() => occt.features.pocket({ shape: base, profile: profile(), sketchFaceIndex: 0, length: 0 }));
            const until = thrownBy(() => occt.features.pocket({ shape: base, profile: profile(), sketchFaceIndex: 0, extent: extent.untilFace, untilFaceIndex: -1 }));
            const direction = thrownBy(() => occt.features.pocket({ shape: base, profile: profile(), sketchFaceIndex: 0, direction: [0, 0, 0] }));

            // Assert
            expect(sketch.message).toBe("`sketchFaceIndex` must be a whole number 0 or more; it is 1.5.");
            expect(unknown.message).toBe("`extent` is sideways, which is none of length, untilFace, throughAll.");
            expect(length.message).toBe("`length` must be a finite number above 0; it is 0.");
            expect(until.message).toBe("`untilFaceIndex` must be a whole number 0 or more; it is -1.");
            expect(direction.message).toBe("`direction` is [0, 0, 0], which points nowhere.");
        });

        it("should pass on the kernel's refusal of a profile that is not a face, a face the base lacks and a boss with nothing to run through", () => {
            // Arrange
            const base = cube();
            const top = topOf(base);

            // Act
            const notFace = kernelMessage(() => occt.features.pocket({ shape: base, profile: loose(cube()), sketchFaceIndex: top, direction: [0, -1, 0] }));
            const noFace = kernelMessage(() => occt.features.boss({ shape: base, profile: profile(), sketchFaceIndex: 6 }));
            const nothingAhead = kernelMessage(() => occt.features.boss({ shape: base, profile: profile(), sketchFaceIndex: top, extent: extent.throughAll }));

            // Assert
            expect(notFace).toBe("Standard_DomainError: FeaturePocket: the profile is not a face");
            expect(noFace).toBe("Standard_DomainError: FeatureBoss: the base has no face 6");
            expect(nothingAhead).toBe("Standard_DomainError: FeatureBoss: OCCT could not build the feature (No parts of tool kept)");
        });
    });

    describe("taperedBoss and taperedPocket", () => {
        it("should narrow a boss and a pocket by a positive angle in degrees, and widen a boss with rounded corners by a negative one", () => {
            // Arrange
            const base = cube();
            const top = topOf(base);
            const narrowed = 2 - 6 * tan(10);

            // Act
            const boss = occt.features.taperedBoss({ shape: base, profile: profile(), sketchFaceIndex: top, angle: 10, extent: extent.length, length: 3, untilFaceIndex: 0 });
            const pocket = occt.features.taperedPocket({ shape: base, profile: profile(), sketchFaceIndex: top, angle: 10, length: 3 });
            const straight = occt.features.taperedPocket({ shape: base, profile: profile(), sketchFaceIndex: top, angle: 0, length: 3 });
            const widened = occt.features.taperedBoss({ shape: base, profile: profile(), sketchFaceIndex: top, angle: -10, length: 3 });

            // Assert
            const spread = tan(10);
            expect(volumeOf(boss)).toBeCloseTo(1000 + frustum(3, 2, narrowed), 6);
            expect(volumeOf(pocket)).toBeCloseTo(1000 - frustum(3, 2, narrowed), 6);
            expect(volumeOf(straight)).toBeCloseTo(988, 6);
            expect(volumeOf(widened)).toBeCloseTo(1000 + 12 + 36 * spread + 9 * Math.PI * spread * spread, 6);
        });

        it("should cut a tapered pocket through all of the base, and taper by 5 degrees over a length of 1 by default", () => {
            // Arrange
            const base = cube();
            const top = topOf(base);

            // Act
            const through = occt.features.taperedPocket({ shape: base, profile: profile(), sketchFaceIndex: top, angle: 5, extent: extent.throughAll });
            const byDefault = occt.features.taperedBoss({ shape: base, profile: profile(), sketchFaceIndex: top });

            // Assert
            expect(volumeOf(through)).toBeCloseTo(1000 - frustum(10, 2, 2 - 20 * tan(5)), 2);
            expect(volumeOf(byDefault)).toBeCloseTo(1000 + frustum(1, 2, 2 - 2 * tan(5)), 6);
        });

        it("should refuse an angle of 90 degrees and pass on the kernel's refusal of a tapered pocket stopped at the far side of the base", () => {
            // Arrange
            const base = cube();
            const top = topOf(base);

            // Act
            const steep = thrownBy(() => occt.features.taperedBoss({ shape: base, profile: profile(), sketchFaceIndex: top, angle: 90 }));
            const farSide = kernelMessage(() => occt.features.taperedPocket({ shape: base, profile: profile(), sketchFaceIndex: top, angle: 5, extent: extent.untilFace, untilFaceIndex: bottomOf(base) }));

            // Assert
            expect(steep.message).toBe("`angle` must be a finite number above -90 and below 90; it is 90.");
            expect(farSide).toBe("Standard_DomainError: FeatureTaperedPrism: OCCT failed (NCollection_DataMap::Find)");
        });
    });

    describe("revolvedBoss and revolvedPocket", () => {
        const shaft = (): TopoDS_Shape => occt.shapes.solid.createCylinder({ radius: 5, height: 10, center: [0, 0, 0], direction: [0, 1, 0] });
        const sideOf = (shape: TopoDS_Shape): number => occt.select.faces.ofType({ shape, type: Inputs.OCCT.surfaceTypeEnum.cylinder })[0]!;
        const section = (from: number, to: number): TopoDS_Shape => occt.shapes.face.createRectangleFace({ width: 2, length: to - from, center: [(from + to) / 2, 5, 0], direction: [0, 0, 1] });

        it("should add a whole ring round a shaft, and half of one on the side the right-hand rule turns to", () => {
            // Arrange
            const base = shaft();

            // Act
            const ringed = occt.features.revolvedBoss({ shape: base, profile: section(5, 6), sketchFaceIndex: sideOf(base), axisOrigin: [0, 0, 0], axisDirection: [0, 1, 0], angle: 360 });
            const half = occt.features.revolvedBoss({ shape: base, profile: section(5, 6), sketchFaceIndex: sideOf(base), angle: 180 });

            // Assert
            const added = occt.booleans.difference({ shape: half, shapes: [base], keepEdges: false });
            expect(volumeOf(ringed)).toBeCloseTo(250 * Math.PI + 22 * Math.PI, 6);
            expect(volumeOf(half)).toBeCloseTo(250 * Math.PI + 11 * Math.PI, 6);
            expect(occt.shapes.solid.getSolidCenterOfMass({ shape: occt.shapes.solid.getSolids({ shape: added })[0]! })[2]).toBeLessThan(-1);
        });

        it("should cut a groove round a shaft, all the way by default", () => {
            // Arrange
            const base = shaft();

            // Act
            const grooved = occt.features.revolvedPocket({ shape: base, profile: section(4, 5), sketchFaceIndex: sideOf(base) });
            const half = occt.features.revolvedPocket({ shape: base, profile: section(4, 5), sketchFaceIndex: sideOf(base), angle: 180 });

            // Assert
            expect(volumeOf(grooved)).toBeCloseTo(250 * Math.PI - 18 * Math.PI, 6);
            expect(volumeOf(half)).toBeCloseTo(250 * Math.PI - 9 * Math.PI, 6);
            expect(occt.shapeFix.isValid({ shape: grooved })).toBe(true);
        });

        it("should refuse an angle of 0 or past a whole turn and an axis of no length", () => {
            // Arrange
            const base = shaft();

            // Act
            const none = thrownBy(() => occt.features.revolvedBoss({ shape: base, profile: section(5, 6), sketchFaceIndex: 0, angle: 0 }));
            const past = thrownBy(() => occt.features.revolvedPocket({ shape: base, profile: section(4, 5), sketchFaceIndex: 0, angle: 361 }));
            const axis = thrownBy(() => occt.features.revolvedBoss({ shape: base, profile: section(5, 6), sketchFaceIndex: 0, axisDirection: [0, 0, 0] }));

            // Assert
            expect(none.message).toBe("`angle` must be a finite number above 0 and at most 360; it is 0.");
            expect(past.message).toBe("`angle` must be a finite number above 0 and at most 360; it is 361.");
            expect(axis.message).toBe("`axisDirection` is [0, 0, 0], which points nowhere.");
        });
    });

    describe("rib and groove", () => {
        const plane: Inputs.Base.Frame = { origin: [0, 5, 0], normal: [0, 1, 0], direction: [1, 0, 0] };
        const bracket = (): TopoDS_Shape => occt.booleans.union({ shapes: [box([0, 0, 0], [20, 10, 2]), box([0, 0, 0], [2, 10, 20])], keepEdges: false });
        const diagonal: Inputs.Base.Point3[] = [[2, 5, 12], [12, 5, 2]];

        it("should fill the inside corner of an L with a rib as thick as both sides together, from a wire or an edge", () => {
            // Arrange
            const base = bracket();

            // Act
            const ribbed = occt.features.rib({ shape: base, wire: occt.shapes.wire.createPolylineWire({ points: diagonal }), frame: plane, thickness: 0.5, otherSideThickness: 0.5 });
            const fromEdge = occt.features.rib({ shape: base, wire: occt.shapes.edge.line({ start: diagonal[0], end: diagonal[1] }), frame: plane });

            // Assert
            expect(volumeOf(ribbed)).toBeCloseTo(volumeOf(base) + 50, 6);
            expect(volumeOf(fromEdge)).toBeCloseTo(volumeOf(base) + 50, 6);
        });

        it("should lay the thickness on the side the frame's normal points to", () => {
            // Arrange
            const base = bracket();

            // Act
            const ribbed = occt.features.rib({ shape: base, wire: occt.shapes.wire.createPolylineWire({ points: diagonal }), frame: plane, thickness: 1, otherSideThickness: 0 });

            // Assert
            const rib = occt.booleans.difference({ shape: ribbed, shapes: [base], keepEdges: false });
            const extent = occt.operations.boundingBoxOfShape({ shape: rib });
            expect(volumeOf(rib)).toBeCloseTo(50, 6);
            expect([extent.min[1], extent.max[1]]).toEqual([5, 6].map(y => expect.closeTo(y, 5)));
        });

        it("should cut away the section of a block outside the bend of a groove's wire", () => {
            // Arrange
            const block = box([0, 0, 0], [20, 10, 10]);
            const bent = occt.shapes.wire.createPolylineWire({ points: [[10, 5, 12], [10, 5, 5], [22, 5, 5]] });

            // Act
            const grooved = occt.features.groove({ shape: block, wire: bent, frame: plane, thickness: 0.5, otherSideThickness: 0.5 });

            // Assert
            expect(volumeOf(grooved)).toBeCloseTo(2000 - (200 - 50), 6);
            expect(occt.shapeFix.isValid({ shape: grooved })).toBe(true);
        });

        it("should refuse a negative thickness and pass on the kernel's refusal of no thickness at all and of a profile that is not a wire", () => {
            // Arrange
            const base = bracket();
            const wire = occt.shapes.wire.createPolylineWire({ points: diagonal });

            // Act
            const negative = thrownBy(() => occt.features.rib({ shape: base, wire, frame: plane, thickness: -1 }));
            const flat = kernelMessage(() => occt.features.groove({ shape: base, wire, frame: plane, thickness: 0, otherSideThickness: 0 }));
            const notWire = kernelMessage(() => occt.features.rib({ shape: base, wire: loose(profile()), frame: plane }));

            // Assert
            expect(negative.message).toBe("`thickness` must be a finite number 0 or more; it is -1.");
            expect(flat).toBe("Standard_DomainError: FeatureGroove: the thickness has no length on either side");
            expect(notWire).toBe("Standard_DomainError: FeatureRib: the profile is not a wire");
        });
    });
});
