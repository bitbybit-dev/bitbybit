import { describe, it, expect, beforeAll } from "vitest";
import type { BitbybitOcctModule, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OCCTService } from "../../occ-service";
import { readKernelException } from "../../kernel-exception";
import * as Inputs from "../../api/inputs";
import type * as Models from "../../api/models";

describe("OCCT form features with history", () => {
    let occt: OCCTService;
    let kernel: BitbybitOcctModule;

    beforeAll(async () => {
        kernel = await createBitbybitOcct();
        occt = new OCCTService(kernel);
    }, 120_000);

    const box = (corner: Inputs.Base.Point3, opposite: Inputs.Base.Point3): TopoDS_Shape => occt.shapes.solid.createBoxFromCorner({
        corner,
        width: opposite[0] - corner[0],
        height: opposite[1] - corner[1],
        length: opposite[2] - corner[2],
    });
    const cube = (): TopoDS_Shape => box([-5, 0, -5], [5, 10, 5]);
    const profile = (): TopoDS_Shape => occt.shapes.face.createSquareFace({ size: 2, center: [0, 10, 0], direction: [0, 1, 0] });
    const topOf = (shape: TopoDS_Shape): number => occt.select.faces.onPlane({ shape, origin: [0, 10, 0], normal: [0, 1, 0] })[0]!;
    const volumeOf = (shape: TopoDS_Shape): number => occt.shapes.solid.getSolids({ shape }).reduce((sum, solid) => sum + occt.shapes.solid.getSolidVolume({ shape: solid }), 0);
    const areaOf = (shape: TopoDS_Shape, face: number): number => occt.shapes.face.getFaceArea({ shape: occt.shapes.face.getFace({ shape, index: face }) });
    const centreOf = (shape: TopoDS_Shape, face: number): Inputs.Base.Point3 => occt.shapes.face.getFaceCenterOfMass({ shape: occt.shapes.face.getFace({ shape, index: face }) });
    const areasOf = (shape: TopoDS_Shape, faces: number[]): number[] => faces.map(face => areaOf(shape, face)).sort((a, b) => a - b);
    const faceCount = (shape: TopoDS_Shape): number => occt.shapes.face.getFaces({ shape }).length;
    const reached = (histories: Models.OCCT.ShapeHistory[]): number =>
        new Set(histories.flatMap(history => [
            ...history.faces.flat(), ...history.facesFromFaces.flat(), ...history.facesFromEdges.flat(),
            ...history.facesFromVertices.flat(), ...history.firstFaces, ...history.lastFaces,
        ])).size;
    const loose = <T>(value: unknown): T => value as T;
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

    describe("taperedBossWithHistory and taperedPocketWithHistory", () => {
        it("should name the leaning side each profile edge swept, the top and what the sketch face became", () => {
            // Arrange
            const base = cube();
            const top = topOf(base);
            const narrowed = 2 - 6 * tan(10);
            const slant = 3 / Math.cos(10 * Math.PI / 180);

            // Act
            const { shape, histories } = occt.features.taperedBossWithHistory({ shape: base, profile: profile(), sketchFaceIndex: top, angle: 10, length: 3 });

            // Assert
            expect(volumeOf(shape)).toBeCloseTo(volumeOf(occt.features.taperedBoss({ shape: base, profile: profile(), sketchFaceIndex: top, angle: 10, length: 3 })), 9);
            expect(histories).toHaveLength(2);
            const [baseHistory, profileHistory] = histories as [Models.OCCT.ShapeHistory, Models.OCCT.ShapeHistory];
            expect(areasOf(shape, baseHistory.faces[top]!)).toEqual([expect.closeTo(96, 6)]);
            const sides = profileHistory.facesFromEdges.flat();
            expect(new Set(sides).size).toBe(4);
            sides.forEach(side => expect(areaOf(shape, side)).toBeCloseTo((2 + narrowed) / 2 * slant, 6));
            expect(profileHistory.lastFaces).toHaveLength(1);
            expect(areaOf(shape, profileHistory.lastFaces[0]!)).toBeCloseTo(narrowed * narrowed, 6);
            expect(centreOf(shape, profileHistory.lastFaces[0]!)[1]).toBeCloseTo(13, 9);
            expect(reached(histories)).toBe(faceCount(shape));
        });

        it("should name a tapered pocket's four walls and its floor", () => {
            // Arrange
            const base = cube();
            const top = topOf(base);
            const narrowed = 2 - 6 * tan(10);

            // Act
            const { shape, histories } = occt.features.taperedPocketWithHistory({ shape: base, profile: profile(), sketchFaceIndex: top, angle: 10, length: 3 });

            // Assert
            expect(volumeOf(shape)).toBeCloseTo(volumeOf(occt.features.taperedPocket({ shape: base, profile: profile(), sketchFaceIndex: top, angle: 10, length: 3 })), 9);
            expect(new Set(histories[1]!.facesFromEdges.flat()).size).toBe(4);
            expect(histories[1]!.lastFaces).toHaveLength(1);
            expect(areaOf(shape, histories[1]!.lastFaces[0]!)).toBeCloseTo(narrowed * narrowed, 6);
            expect(centreOf(shape, histories[1]!.lastFaces[0]!)[1]).toBeCloseTo(7, 9);
        });
    });

    describe("revolvedBossWithHistory and revolvedPocketWithHistory", () => {
        const shaft = (): TopoDS_Shape => occt.shapes.solid.createCylinder({ radius: 5, height: 10, center: [0, 0, 0], direction: [0, 1, 0] });
        const sideOf = (shape: TopoDS_Shape): number => occt.select.faces.ofType({ shape, type: Inputs.OCCT.surfaceTypeEnum.cylinder })[0]!;
        const section = (from: number, to: number): TopoDS_Shape => occt.shapes.face.createRectangleFace({ width: 2, length: to - from, center: [(from + to) / 2, 5, 0], direction: [0, 0, 1] });

        it("should name the ring's outer wall and its two sides", () => {
            // Arrange
            const base = shaft();

            // Act
            const { shape, histories } = occt.features.revolvedBossWithHistory({ shape: base, profile: section(5, 6), sketchFaceIndex: sideOf(base), axisOrigin: [0, 0, 0], axisDirection: [0, 1, 0], angle: 360 });

            // Assert
            expect(volumeOf(shape)).toBeCloseTo(250 * Math.PI + 22 * Math.PI, 6);
            expect(areasOf(shape, histories[1]!.facesFromEdges.flat())).toEqual([11 * Math.PI, 11 * Math.PI, 24 * Math.PI].map(area => expect.closeTo(area, 6)));
            expect(reached(histories)).toBe(faceCount(shape));
        });

        it("should name a groove's floor and walls and split the shaft's side in two", () => {
            // Arrange
            const base = shaft();
            const side = sideOf(base);

            // Act
            const { shape, histories } = occt.features.revolvedPocketWithHistory({ shape: base, profile: section(4, 5), sketchFaceIndex: side });

            // Assert
            expect(volumeOf(shape)).toBeCloseTo(250 * Math.PI - 18 * Math.PI, 6);
            expect(areasOf(shape, histories[1]!.facesFromEdges.flat())).toEqual([9 * Math.PI, 9 * Math.PI, 16 * Math.PI].map(area => expect.closeTo(area, 6)));
            expect(areasOf(shape, histories[0]!.faces[side]!)).toEqual([40 * Math.PI, 40 * Math.PI].map(area => expect.closeTo(area, 6)));
        });
    });

    describe("ribWithHistory and grooveWithHistory", () => {
        const plane: Inputs.Base.Frame = { origin: [0, 5, 0], normal: [0, 1, 0], direction: [1, 0, 0] };
        const bracket = (): TopoDS_Shape => occt.booleans.union({ shapes: [box([0, 0, 0], [20, 10, 2]), box([0, 0, 0], [2, 10, 20])], keepEdges: false });
        const diagonal: Inputs.Base.Point3[] = [[2, 5, 12], [12, 5, 2]];

        it("should name the slanted top a wire or an edge makes and the rib's two flat sides", () => {
            // Arrange
            const base = bracket();

            // Act
            const fromWire = occt.features.ribWithHistory({ shape: base, wire: occt.shapes.wire.createPolylineWire({ points: diagonal }), frame: plane, thickness: 0.5, otherSideThickness: 0.5 });
            const fromEdge = occt.features.ribWithHistory({ shape: base, wire: occt.shapes.edge.line({ start: diagonal[0], end: diagonal[1] }), frame: plane, thickness: 0.5, otherSideThickness: 0.5 });

            // Assert
            [fromWire, fromEdge].forEach(({ shape, histories }) => {
                expect(volumeOf(shape)).toBeCloseTo(volumeOf(base) + 50, 6);
                expect(histories[1]!.facesFromEdges).toHaveLength(1);
                expect(areasOf(shape, histories[1]!.facesFromEdges[0]!)).toEqual([expect.closeTo(Math.sqrt(200), 6)]);
                expect(areasOf(shape, [...histories[1]!.firstFaces, ...histories[1]!.lastFaces])).toEqual([50, 50].map(area => expect.closeTo(area, 6)));
                expect(histories[0]!.faces.every(faces => faces.length > 0)).toBe(true);
            });
        });

        it("should name a wall for each edge of a groove's bent wire", () => {
            // Arrange
            const block = box([0, 0, 0], [20, 10, 10]);
            const wire = occt.shapes.wire.createPolylineWire({ points: [[5, 5, 10], [10, 5, 5], [15, 5, 10]] });

            // Act
            const { shape, histories } = occt.features.grooveWithHistory({ shape: block, wire, frame: plane, thickness: 0.5, otherSideThickness: 0.5 });

            // Assert
            expect(volumeOf(shape)).toBeCloseTo(volumeOf(occt.features.groove({ shape: block, wire, frame: plane, thickness: 0.5, otherSideThickness: 0.5 })), 9);
            expect(histories[1]!.facesFromEdges).toHaveLength(2);
            expect(areasOf(shape, histories[1]!.facesFromEdges.flat())).toEqual([Math.sqrt(50), Math.sqrt(50)].map(area => expect.closeTo(area, 6)));
        });

        it("should name the twin in the kernel's refusal", () => {
            // Arrange
            const base = bracket();
            const wire = occt.shapes.wire.createPolylineWire({ points: diagonal });

            // Act
            const flat = kernelMessage(() => occt.features.grooveWithHistory({ shape: base, wire, frame: plane, thickness: 0, otherSideThickness: 0 }));
            const notFace = kernelMessage(() => occt.features.taperedBossWithHistory({ shape: base, profile: loose<TopoDS_Shape>(wire), sketchFaceIndex: 0 }));

            // Assert
            expect(flat).toBe("Standard_DomainError: FeatureGrooveWithHistory: the thickness has no length on either side");
            expect(notFace).toMatch(/^Standard_DomainError: FeatureTaperedPrismWithHistory: /);
        });
    });
});
