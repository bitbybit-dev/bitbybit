import { describe, it, expect, beforeAll } from "vitest";
import createBitbybitOcct, { TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTService } from "../../occ-service";
import * as Inputs from "../../api/inputs";
import * as Models from "../../api/models";
import { InputError, resolveDto } from "@bitbybit-dev/base";
import * as Resolved from "../../api/resolved-inputs";

describe("OCCT history twins", () => {
    let occt: OCCTService;
    let helper: OccHelper;

    beforeAll(async () => {
        const kernel = await createBitbybitOcct();
        helper = new OccHelper(new VectorHelperService(), new ShapesHelperService(), kernel);
        occt = new OCCTService(kernel, helper);
    }, 120_000);

    const faceCount = (shape: TopoDS_Shape): number => occt.shapes.face.getFaces({ shape }).length;
    const areaOf = (shape: TopoDS_Shape, face: number): number => occt.shapes.face.getFaceArea({ shape: occt.shapes.face.getFace({ shape, index: face }) });
    const centreOf = (shape: TopoDS_Shape, face: number): Inputs.Base.Point3 => occt.shapes.face.getFaceCenterOfMass({ shape: occt.shapes.face.getFace({ shape, index: face }) });
    const faceAt = (shape: TopoDS_Shape, point: Inputs.Base.Point3): number =>
        occt.shapes.face.getFaces({ shape }).findIndex(face => {
            const centre = occt.shapes.face.getFaceCenterOfMass({ shape: face });
            return Math.hypot(centre[0] - point[0], centre[1] - point[1], centre[2] - point[2]) < 1e-6;
        });
    const reached = (histories: Models.OCCT.ShapeHistory[]): number =>
        new Set(histories.flatMap(history => [
            ...history.faces.flat(), ...history.facesFromFaces.flat(), ...history.facesFromEdges.flat(),
            ...history.facesFromVertices.flat(), ...history.firstFaces, ...history.lastFaces,
        ])).size;
    const square = (half: number, height: number): TopoDS_Shape =>
        occt.shapes.wire.createSquareWire({ size: 2 * half, center: [0, height, 0], direction: [0, 1, 0] });
    const block = (): TopoDS_Shape => occt.shapes.solid.createBox({ width: 20, length: 20, height: 10, center: [0, 5, 0] });
    const thrownBy = (action: () => unknown): InputError => {
        try {
            action();
        } catch (error) {
            expect(error).toBeInstanceOf(InputError);
            return error as InputError;
        }
        throw new Error("expected an InputError, but nothing was thrown");
    };

    it("should number the history of an intersection in the compound it returns, where pieces share faces", () => {
        // Arrange
        const box = occt.shapes.solid.createBox({ width: 10, length: 10, height: 10, center: [5, 5, 5] });
        const left = occt.shapes.solid.createBox({ width: 6, length: 12, height: 12, center: [2, 5, 5] });
        const bottom = occt.shapes.solid.createBox({ width: 12, length: 12, height: 6, center: [5, 2, 5] });

        // Act
        const { shape, histories } = occt.booleans.intersectionWithHistory({ shapes: [box, left, bottom], keepEdges: true });

        // Assert
        expect(faceCount(shape)).toBe(faceCount(occt.booleans.intersection({ shapes: [box, left, bottom], keepEdges: true })));
        expect(histories).toHaveLength(3);
        const side = histories[0]!.faces[faceAt(box, [0, 5, 5])]!;
        expect(side).toHaveLength(2);
        expect(side.reduce((sum, face) => sum + areaOf(shape, face), 0)).toBeCloseTo(150, 6);
        expect(reached(histories)).toBe(faceCount(shape));
    });

    it("should map a shape an intersection misses to nothing and refuse fewer than two shapes", () => {
        // Arrange
        const box = occt.shapes.solid.createBox({ width: 10, length: 10, height: 10, center: [5, 5, 5] });
        const near = occt.shapes.solid.createSphere({ radius: 3, center: [10, 10, 10] });
        const far = occt.shapes.solid.createSphere({ radius: 3, center: [50, 50, 50] });

        // Act
        const { histories } = occt.booleans.intersectionWithHistory({ shapes: [box, near, far], keepEdges: false });
        const refusal = thrownBy(() => occt.booleans.intersectionWithHistory({ shapes: [box], keepEdges: false }));

        // Assert
        expect(histories[1]!.faces.flat().length).toBeGreaterThan(0);
        expect(histories[2]!.faces.flat()).toEqual([]);
        expect(refusal.property).toBe("shapes");
    });

    it("should name the sides of every section edge and the two caps of a loft", () => {
        // Arrange
        const sections = [square(5, 0), square(3, 5), square(4, 10)];

        // Act
        const { shape, histories } = occt.operations.loftWithHistory({ shapes: sections, makeSolid: true });

        // Assert
        expect(histories).toHaveLength(3);
        expect(histories[0]!.facesFromEdges.map(faces => faces.length)).toEqual([1, 1, 1, 1]);
        expect(histories[2]!.facesFromEdges).toEqual(histories[0]!.facesFromEdges);
        expect(histories[0]!.firstFaces.map(face => areaOf(shape, face))).toEqual([expect.closeTo(100, 6)]);
        expect(histories[2]!.lastFaces.map(face => areaOf(shape, face))).toEqual([expect.closeTo(64, 6)]);
        expect(histories[1]!.firstFaces).toEqual([]);
        expect(reached(histories)).toBe(faceCount(shape));
    });

    it("should report an advanced loft section by section and refuse a periodic one", () => {
        // Arrange
        const sections = [square(5, 0), square(4, 10)];
        const inputs = new Inputs.OCCT.LoftAdvancedDto<TopoDS_Shape>(sections, true, false, false, true);

        // Act
        const { shape, histories } = occt.operations.loftAdvancedWithHistory(inputs);
        const refusal = thrownBy(() => occt.operations.loftAdvancedWithHistory({ ...inputs, shapes: [square(5, 0), square(4, 5), square(3, 10)], closed: true, periodic: true }));

        // Assert
        expect(histories).toHaveLength(2);
        expect(new Set(histories[0]!.facesFromEdges.flat()).size).toBe(4);
        expect(reached(histories)).toBe(faceCount(shape));
        expect(refusal.property).toBe("periodic");
    });

    it("should name the side each profile edge sweeps along a pipe and its two ends", () => {
        // Arrange
        const spine = occt.shapes.wire.createLineWire({ start: [0, 0, 0], end: [0, 10, 0] });
        const profile = square(1, 0);

        // Act
        const { shape, histories } = occt.operations.pipeWithHistory({ shape: spine, shapes: [profile] });

        // Assert
        expect(histories).toHaveLength(1);
        expect(new Set(histories[0]!.facesFromEdges.flat()).size).toBe(4);
        histories[0]!.facesFromEdges.flat().forEach(face => expect(areaOf(shape, face)).toBeCloseTo(20, 6));
        expect(histories[0]!.firstFaces.map(face => centreOf(shape, face)[1])).toEqual([expect.closeTo(0, 6)]);
        expect(histories[0]!.lastFaces.map(face => centreOf(shape, face)[1])).toEqual([expect.closeTo(10, 6)]);
    });

    it("should name the offset copy and the walls of a thickened face", () => {
        // Arrange
        const face = occt.shapes.face.createSquareFace({ size: 10, center: [0, 0, 0], direction: [0, 1, 0] });

        // Act
        const { shape, history } = occt.operations.makeThickSolidSimpleWithHistory({ shape: face, offset: 2 });

        // Assert
        expect(history.faces[0]!.map(index => centreOf(shape, index)[1])).toEqual([expect.closeTo(0, 9)]);
        expect(history.facesFromFaces[0]!.map(index => Math.abs(centreOf(shape, index)[1]))).toEqual([expect.closeTo(2, 9)]);
        expect(history.facesFromEdges.map(faces => faces.length)).toEqual([1, 1, 1, 1]);
        history.facesFromEdges.flat().forEach(index => expect(areaOf(shape, index)).toBeCloseTo(20, 6));
        expect(reached([history])).toBe(6);
    });

    it("should name the inner walls and the rim of a hollowed box", () => {
        // Arrange
        const box = occt.shapes.solid.createBox({ width: 10, length: 10, height: 10, center: [5, 5, 5] });
        const top = faceAt(box, [5, 10, 5]);
        const removed = occt.shapes.face.getFace({ shape: box, index: top });

        // Act
        const { shape, history } = occt.operations.makeThickSolidByJoinWithHistory({
            shape: box, shapes: [removed], offset: -1, tolerance: 1e-3, intersection: false, selfIntersection: false,
            joinType: Inputs.OCCT.joinTypeEnum.arc, removeIntEdges: false,
        });

        // Assert
        expect(history.faces[top]!.map(index => areaOf(shape, index))).toEqual([expect.closeTo(36, 6)]);
        const floor = history.facesFromFaces[faceAt(box, [5, 0, 5])]!;
        expect(floor.map(index => centreOf(shape, index)[1])).toEqual([expect.closeTo(1, 9)]);
        expect(reached([history])).toBe(faceCount(shape));
    });

    it("should name the walls and the top of a boss, and of a pocket that stops at a face", () => {
        // Arrange
        const base = block();
        const top = faceAt(base, [0, 10, 0]);
        const bottom = faceAt(base, [0, 0, 0]);
        const profile = occt.shapes.face.createSquareFace({ size: 6, center: [0, 10, 0], direction: [0, 1, 0] });

        // Act
        const boss = occt.features.bossWithHistory({ shape: base, profile, sketchFaceIndex: top, direction: [0, 1, 0], length: 4 });
        const pocket = occt.features.pocketWithHistory({
            shape: base, profile, sketchFaceIndex: top, direction: [0, -1, 0], extent: Inputs.OCCT.featureExtentEnum.untilFace, untilFaceIndex: bottom,
        });

        // Assert
        expect(boss.histories[1]!.facesFromEdges.flat().map(face => areaOf(boss.shape, face))).toEqual(Array(4).fill(expect.closeTo(24, 6)));
        expect(boss.histories[1]!.lastFaces.map(face => centreOf(boss.shape, face)[1])).toEqual([expect.closeTo(14, 9)]);
        expect(reached(boss.histories)).toBe(faceCount(boss.shape));
        expect(pocket.histories[0]!.faces[top]!.map(face => areaOf(pocket.shape, face))).toEqual([expect.closeTo(364, 6)]);
        expect(pocket.histories[1]!.facesFromEdges.flat().map(face => areaOf(pocket.shape, face))).toEqual(Array(4).fill(expect.closeTo(60, 6)));
        expect(reached(pocket.histories)).toBe(faceCount(pocket.shape));
    });

    it("should give every hole its own history, in the order of the frames, for each kind of hole", () => {
        // Arrange
        const plate = occt.shapes.solid.createBox({ width: 20, length: 20, height: 5, center: [0, 2.5, 0] });
        const frames: Inputs.Base.Frame[] = [
            { origin: [-5, 5, 0], normal: [0, 1, 0], direction: [1, 0, 0] },
            { origin: [5, 5, 0], normal: [0, 1, 0], direction: [1, 0, 0] },
        ];

        // Act
        const plain = occt.features.holesWithHistory({ shape: plate, frames, diameter: 2, depth: 0, tipAngle: 0 });
        const counterbored = occt.features.counterboredHolesWithHistory({ shape: plate, frames, diameter: 2, depth: 0, tipAngle: 0, counterboreDiameter: 4, counterboreDepth: 1 });
        const countersunk = occt.features.countersunkHolesWithHistory({ shape: plate, frames, diameter: 2, depth: 0, tipAngle: 0, countersinkDiameter: 4, countersinkAngle: 90 });

        // Assert
        expect(plain.histories).toHaveLength(3);
        plain.histories.slice(1).forEach((hole, index) => {
            const made = hole.faces.flat();
            expect(made).toHaveLength(1);
            expect(areaOf(plain.shape, made[0]!)).toBeCloseTo(2 * Math.PI * 5, 6);
            expect(centreOf(plain.shape, made[0]!)[0]).toBeCloseTo(index === 0 ? -5 : 5, 6);
        });
        expect(counterbored.histories[1]!.faces.flat()).toHaveLength(3);
        expect(countersunk.histories[1]!.faces.flat()).toHaveLength(2);
        [plain, counterbored, countersunk].forEach(drilled => expect(reached(drilled.histories)).toBe(faceCount(drilled.shape)));
    });

    it("should describe every face and edge in the selectors' numbering", () => {
        // Arrange
        const box = occt.shapes.solid.createBox({ width: 10, length: 20, height: 30, center: [0, 0, 0] });
        const sphere = occt.shapes.solid.createSphere({ radius: 3, center: [0, 0, 0] });

        // Act
        const boxSignatures = occt.analysis.signatures({ shape: box });
        const sphereSignatures = occt.analysis.signatures({ shape: sphere });

        // Assert
        expect(boxSignatures.faces).toHaveLength(6);
        expect(boxSignatures.edges).toHaveLength(12);
        const [up] = occt.select.faces.facing({ shape: box, direction: [0, 1, 0], angle: 0 });
        expect(boxSignatures.faces[up!]!.normal[1]).toBeCloseTo(1, 12);
        expect(boxSignatures.faces[up!]!.area).toBeCloseTo(10 * 20, 9);
        expect(boxSignatures.faces.every(face => face.type === Inputs.OCCT.surfaceTypeEnum.plane)).toBe(true);
        expect(boxSignatures.edges.reduce((sum, edge) => sum + edge.length, 0)).toBeCloseTo(4 * (10 + 20 + 30), 9);
        expect(boxSignatures.edges.every(edge => edge.type === Inputs.OCCT.curveTypeEnum.line && !edge.isDegenerate)).toBe(true);
        expect(sphereSignatures.faces[0]!.type).toBe(Inputs.OCCT.surfaceTypeEnum.sphere);
        const poles = sphereSignatures.edges.filter(edge => edge.isDegenerate);
        expect(poles).toHaveLength(2);
        expect(poles.every(edge => edge.length === 0 && edge.tangent.every(value => value === 0))).toBe(true);
    });

    it("should merge seam edges as intersection does, whichever keepEdges says", () => {
        // Arrange
        const halves = [0, 10].map(x => occt.shapes.solid.createBox({ width: 10, length: 10, height: 10, center: [x + 5, 5, 5] }));
        const seamed = occt.booleans.union({ shapes: halves, keepEdges: true });
        const cover = occt.shapes.solid.createBox({ width: 30, length: 30, height: 30, center: [10, 5, 5] });

        // Act
        const kept = occt.booleans.intersectionWithHistory({ shapes: [seamed, cover], keepEdges: true });
        const merged = occt.booleans.intersectionWithHistory({ shapes: [seamed, cover], keepEdges: false });

        // Assert
        expect(faceCount(kept.shape)).toBe(faceCount(occt.booleans.intersection({ shapes: [seamed, cover], keepEdges: true })));
        expect(faceCount(merged.shape)).toBe(faceCount(occt.booleans.intersection({ shapes: [seamed, cover], keepEdges: false })));
        expect(faceCount(merged.shape)).toBeLessThan(faceCount(kept.shape));
        expect(reached(kept.histories)).toBe(faceCount(kept.shape));
        expect(reached(merged.histories)).toBe(faceCount(merged.shape));
    });

    it("should give each profile of a pipe its own history", () => {
        // Arrange
        const spine = occt.shapes.wire.createLineWire({ start: [0, 0, 0], end: [0, 10, 0] });
        const start = square(1, 0);
        const end = occt.transforms.rotate({ shape: square(2, 10), axis: [0, 1, 0], angle: 90 });

        // Act
        const { shape, histories } = occt.operations.pipeWithHistory({ shape: spine, shapes: [start, end] });

        // Assert
        expect(histories).toHaveLength(2);
        expect(histories[0]!.firstFaces.map(face => areaOf(shape, face))).toEqual([expect.closeTo(4, 6)]);
        expect(histories[1]!.lastFaces.map(face => areaOf(shape, face))).toEqual([expect.closeTo(16, 6)]);
        expect(histories[1]!.facesFromEdges[0]).not.toEqual(histories[0]!.facesFromEdges[0]);
        [start, end].forEach((profile, index) => {
            occt.analysis.signatures({ shape: profile }).edges.forEach(edge => {
                const sides = histories[index]!.facesFromEdges[edge.index]!;
                expect(sides).toHaveLength(1);
                const side = centreOf(shape, sides[0]!);
                const along = (side[0] * edge.midpoint[0] + side[2] * edge.midpoint[2]) / (Math.hypot(side[0], side[2]) * Math.hypot(edge.midpoint[0], edge.midpoint[2]));
                expect(along).toBeCloseTo(1, 6);
            });
        });
    });

    it("should report the section of a loft that ends at a point", () => {
        // Arrange
        const circle = occt.shapes.wire.createCircleWire({ radius: 3, center: [0, 0, 0], direction: [0, 1, 0] });
        const inputs = new Inputs.OCCT.LoftAdvancedDto<TopoDS_Shape>([circle], true, false, false, false);
        inputs.endVertex = [0, 5, 0];

        // Act
        const { shape, histories } = occt.operations.loftAdvancedWithHistory(inputs);

        // Assert
        expect(histories).toHaveLength(1);
        expect(histories[0]!.facesFromEdges.map(faces => faces.length)).toEqual([1]);
        expect(histories[0]!.firstFaces.map(face => areaOf(shape, face))).toEqual([expect.closeTo(9 * Math.PI, 6)]);
        expect(reached(histories)).toBe(faceCount(shape));
    });

    it("should report a loft through edges as it reports one through wires", () => {
        // Arrange
        const edges = [0, 4].map(height => occt.shapes.edge.createCircleEdge({ radius: 3 - height / 4, center: [0, height, 0], direction: [0, 1, 0] }));
        const wires = [0, 4].map(height => occt.shapes.wire.createCircleWire({ radius: 3 - height / 4, center: [0, height, 0], direction: [0, 1, 0] }));

        // Act
        const throughEdges = occt.operations.loftWithHistory({ shapes: edges, makeSolid: true });
        const throughWires = occt.operations.loftWithHistory({ shapes: wires, makeSolid: true });

        // Assert
        expect(throughEdges.histories.map(history => history.facesFromEdges)).toEqual(throughWires.histories.map(history => history.facesFromEdges));
        expect(throughEdges.histories[1]!.lastFaces.map(face => areaOf(throughEdges.shape, face))).toEqual([expect.closeTo(4 * Math.PI, 6)]);
    });

    it("should name the offset copy of a face thickened the other way", () => {
        // Arrange
        const face = occt.shapes.face.createSquareFace({ size: 10, center: [0, 0, 0], direction: [0, 1, 0] });

        // Act
        const up = occt.operations.makeThickSolidSimpleWithHistory({ shape: face, offset: 2 });
        const down = occt.operations.makeThickSolidSimpleWithHistory({ shape: face, offset: -2 });

        // Assert
        const offsetOf = (made: Models.OCCT.ShapeWithHistory<TopoDS_Shape>): number => centreOf(made.shape, made.history.facesFromFaces[0]![0]!)[1];
        expect(Math.abs(offsetOf(up))).toBeCloseTo(2, 9);
        expect(offsetOf(down)).toBeCloseTo(-offsetOf(up), 9);
        expect(reached([down.history])).toBe(6);
    });

    it("should refuse what the plain features refuse, before the kernel builds anything", () => {
        // Arrange
        const base = block();
        const profile = occt.shapes.face.createSquareFace({ size: 6, center: [0, 10, 0], direction: [0, 1, 0] });
        const pocket = { shape: base, profile, sketchFaceIndex: faceAt(base, [0, 10, 0]), direction: [0, -1, 0] as Inputs.Base.Vector3, length: 0 };
        const holes = { shape: base, frames: [{ origin: [0, 10, 0], normal: [0, 1, 0], direction: [1, 0, 0] }] as Inputs.Base.Frame[], diameter: -1, depth: 0, tipAngle: 0 };

        // Act
        const pocketRefusal = thrownBy(() => occt.features.pocketWithHistory(pocket));
        const holeRefusal = thrownBy(() => occt.features.holesWithHistory(holes));

        // Assert
        expect(pocketRefusal.message).toBe(thrownBy(() => occt.features.pocket(pocket)).message);
        expect(holeRefusal.message).toBe(thrownBy(() => occt.features.holes(holes)).message);
    });

    it("should release the maker and pass the error on when reading its history fails", () => {
        // Arrange
        const face = occt.shapes.face.createSquareFace({ size: 10, center: [0, 0, 0], direction: [0, 1, 0] });
        const box = occt.shapes.solid.createBox({ width: 10, length: 10, height: 10, center: [5, 5, 5] });
        const spine = occt.shapes.wire.createLineWire({ start: [0, 0, 0], end: [0, 10, 0] });
        const sections = [square(5, 0), square(4, 10)];
        const failure = new Error("history could not be read");
        const makers: { IsDone(): boolean }[] = [];
        const failing = (maker: { IsDone(): boolean }): void => {
            makers.push(maker);
            throw failure;
        };
        const service = helper.operationsService;

        // Act
        const thrown = [
            (): unknown => service.makeThickSolidSimple({ shape: face, offset: 2 }, failing),
            (): unknown => service.makeThickSolidByJoin({
                shape: box, shapes: [occt.shapes.face.getFace({ shape: box, index: 0 })], offset: -1, tolerance: 1e-3,
                intersection: false, selfIntersection: false, joinType: Inputs.OCCT.joinTypeEnum.arc, removeIntEdges: false,
            }, failing),
            (): unknown => service.pipe({ shape: spine, shapes: [square(1, 0)] }, failing),
            (): unknown => service.loft({ shapes: sections, makeSolid: true }, failing),
            (): unknown => service.loftAdvanced(resolveDto(Inputs.OCCT.LoftAdvancedDto, { shapes: sections, makeSolid: true }) as Resolved.OCCT.LoftAdvancedDto<TopoDS_Shape>, failing),
        ].map(action => {
            try {
                action();
            } catch (error) {
                return error;
            }
            return undefined;
        });

        // Assert
        expect(thrown).toEqual([failure, failure, failure, failure, failure]);
        expect(makers).toHaveLength(5);
        makers.forEach(maker => expect(() => maker.IsDone()).toThrow());
    });

    it("should read binary BREP back with every face at the index it had, with or without the mesh", () => {
        // Arrange
        const holed = occt.features.holes({ shape: block(), frames: [{ origin: [0, 10, 0], normal: [0, 1, 0], direction: [1, 0, 0] }], diameter: 4, depth: 0, tipAngle: 0 });

        // Act
        const withMesh = occt.io.loadBrepBinary({ brepData: occt.io.saveShapeBrepBinary({ shape: holed, withTriangulation: true }) });
        const withoutMesh = occt.io.loadBrepBinary({ brepData: new Uint8Array(occt.io.saveShapeBrepBinary({ shape: holed, withTriangulation: false })).buffer });
        const fromText = occt.io.loadBrep({ brepData: occt.io.saveShapeBrep({ shape: holed, withTriangulation: false }) });

        // Assert
        [withMesh, withoutMesh, fromText].forEach(read => {
            expect(faceCount(read)).toBe(faceCount(holed));
            occt.shapes.face.getFaces({ shape: holed }).forEach((_, index) => expect(areaOf(read, index)).toBeCloseTo(areaOf(holed, index), 9));
        });
    });

    it("should refuse bytes that are not whole binary BREP", () => {
        // Arrange
        const bytes = occt.io.saveShapeBrepBinary({ shape: block(), withTriangulation: false });

        // Act
        const notBrep = thrownBy(() => occt.io.loadBrepBinary({ brepData: new TextEncoder().encode("not a shape") }));
        const cut = thrownBy(() => occt.io.loadBrepBinary({ brepData: bytes.slice(0, bytes.length / 2) }));

        // Assert
        expect(notBrep.message).toBe("`brepData` is damaged: it has no binary BREP header.");
        expect(cut.message).toMatch(/^`brepData` is damaged: .+\.$/);
    });
});
