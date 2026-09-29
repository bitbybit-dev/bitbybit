import { describe, it, expect, beforeAll } from "vitest";
import createBitbybitOcct, { TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTService } from "../../occ-service";
import * as Inputs from "../../api/inputs";
import { InputError, resolveDto } from "@bitbybit-dev/base";
import * as Resolved from "../../api/resolved-inputs";

describe("OCCT operations with history", () => {
    let occt: OCCTService;
    let helper: OccHelper;

    beforeAll(async () => {
        const kernel = await createBitbybitOcct();
        helper = new OccHelper(new VectorHelperService(), new ShapesHelperService(), kernel);
        occt = new OCCTService(kernel, helper);
    }, 120_000);

    const box = (): TopoDS_Shape => occt.shapes.solid.createBox({ width: 10, length: 10, height: 10, center: [0, 0, 0], originOnCenter: true });
    const faceCount = (shape: TopoDS_Shape): number => occt.shapes.face.getFaces({ shape }).length;
    const typeOf = (shape: TopoDS_Shape, face: number, type: Inputs.OCCT.surfaceTypeEnum): boolean =>
        occt.select.faces.ofType({ shape, type, indexes: [face] }).length === 1;
    const centresOf = (shape: TopoDS_Shape): Inputs.Base.Point3[] => occt.shapes.face.getFacesCentersOfMass({ shapes: occt.shapes.face.getFaces({ shape }) });
    const reached = (...histories: { faces: number[][], facesFromEdges: number[][], facesFromVertices: number[][], firstFaces: number[], lastFaces: number[] }[]): number =>
        new Set(histories.flatMap(history => [...history.faces.flat(), ...history.facesFromEdges.flat(), ...history.facesFromVertices.flat(), ...history.firstFaces, ...history.lastFaces])).size;
    const thrownBy = (action: () => unknown): InputError => {
        try {
            action();
        } catch (error) {
            expect(error).toBeInstanceOf(InputError);
            return error as InputError;
        }
        throw new Error("expected an InputError, but nothing was thrown");
    };

    it("should name the round a fillet puts along an edge and what each face became", () => {
        // Arrange
        const shape = box();

        // Act
        const { shape: rounded, history } = occt.fillets.filletEdgesWithHistory({ shape, radius: 2, indexes: [0] });

        // Assert
        expect(faceCount(rounded)).toBe(faceCount(occt.fillets.filletEdges({ shape, radius: 2, indexes: [0] })));
        expect(history.faces).toHaveLength(6);
        expect(history.edges).toHaveLength(12);
        expect(history.facesFromEdges[0]).toHaveLength(1);
        expect(typeOf(rounded, history.facesFromEdges[0]![0]!, Inputs.OCCT.surfaceTypeEnum.cylinder)).toBe(true);
        expect(history.edges[0]).toEqual([]);
        expect(new Set([...history.faces.flat(), ...history.facesFromEdges.flat()]).size).toBe(faceCount(rounded));
    });

    it("should name the bevel a chamfer puts along an edge", () => {
        // Arrange
        const shape = box();

        // Act
        const { shape: beveled, history } = occt.fillets.chamferEdgesWithHistory({ shape, distance: 1, indexes: [0] });

        // Assert
        expect(history.facesFromEdges[0]).toHaveLength(1);
        expect(typeOf(beveled, history.facesFromEdges[0]![0]!, Inputs.OCCT.surfaceTypeEnum.plane)).toBe(true);
        expect(faceCount(beveled)).toBe(7);
    });

    it("should name the caps and the sides an extrusion sweeps", () => {
        // Arrange
        const square = occt.shapes.face.createSquareFace({ size: 4, center: [0, 0, 0], direction: [0, 0, 1] });

        // Act
        const { shape: block, history } = occt.operations.extrudeWithHistory({ shape: square, direction: [0, 0, 5] });

        // Assert
        const centres = occt.shapes.face.getFacesCentersOfMass({ shapes: occt.shapes.face.getFaces({ shape: block }) });
        expect(history.firstFaces.map(face => centres[face]![2])).toEqual([expect.closeTo(0, 9)]);
        expect(history.lastFaces.map(face => centres[face]![2])).toEqual([expect.closeTo(5, 9)]);
        expect(history.facesFromEdges.map(faces => faces.length)).toEqual([1, 1, 1, 1]);
        expect(new Set(history.facesFromEdges.flat()).size).toBe(4);
    });

    it("should name the ends of a partial revolution", () => {
        // Arrange
        const square = occt.shapes.face.createSquareFace({ size: 2, center: [5, 0, 0], direction: [0, 1, 0] });

        // Act
        const { shape, history } = occt.operations.revolveWithHistory({ shape: square, angle: 90, direction: [0, 0, 1], copy: false });

        // Assert
        expect(history.firstFaces).toHaveLength(1);
        expect(history.lastFaces).toHaveLength(1);
        expect(history.firstFaces[0]).not.toBe(history.lastFaces[0]);
        expect(faceCount(shape)).toBe(6);
    });

    it("should follow a drill's side to the wall of its hole", () => {
        // Arrange
        const plate = box();
        const drill = occt.shapes.solid.createCylinder({ radius: 2, height: 20, center: [0, 0, -10], direction: [0, 0, 1] });
        const [side] = occt.select.faces.ofType({ shape: drill, type: Inputs.OCCT.surfaceTypeEnum.cylinder });

        // Act
        const { shape: holed, histories } = occt.booleans.differenceWithHistory({ shape: plate, shapes: [drill], keepEdges: false });

        // Assert
        expect(histories).toHaveLength(2);
        expect(histories[1]!.faces[side!]).toHaveLength(1);
        expect(typeOf(holed, histories[1]!.faces[side!]![0]!, Inputs.OCCT.surfaceTypeEnum.cylinder)).toBe(true);
        expect(faceCount(holed)).toBe(faceCount(occt.booleans.difference({ shape: plate, shapes: [drill], keepEdges: false })));
    });

    it("should give a union a history for each shape it fuses", () => {
        // Arrange
        const left = box();
        const right = occt.shapes.solid.createBox({ width: 10, length: 10, height: 10, center: [10, 0, 0], originOnCenter: true });

        // Act
        const { shape, histories } = occt.booleans.unionWithHistory({ shapes: [left, right], keepEdges: false });

        // Assert
        expect(histories).toHaveLength(2);
        expect(histories.every(history => history.faces.length === 6)).toBe(true);
        expect(faceCount(shape)).toBe(6);
    });

    it("should find the face a whole turn sweeps from every edge of the profile, its flat ends included", () => {
        // Arrange
        const square = occt.shapes.face.createSquareFace({ size: 2, center: [5, 0, 0], direction: [0, 1, 0] });
        const edgeCentres = occt.shapes.edge.getEdgesCentersOfMass({ shapes: occt.shapes.edge.getEdges({ shape: square }) });

        // Act
        const { shape: ring, history } = occt.operations.revolveWithHistory({ shape: square, angle: 360, direction: [0, 0, 1], copy: false });

        // Assert
        expect(history.facesFromEdges.map(faces => faces.length)).toEqual([1, 1, 1, 1]);
        history.facesFromEdges.forEach((faces, edge) => {
            const flat = Math.abs(edgeCentres[edge]![0] - 5) < 1e-9;
            expect(typeOf(ring, faces[0]!, flat ? Inputs.OCCT.surfaceTypeEnum.plane : Inputs.OCCT.surfaceTypeEnum.cylinder)).toBe(true);
        });
        expect(reached(history)).toBe(faceCount(ring));
    });

    it("should name the edge each corner of a profile sweeps", () => {
        // Arrange
        const square = occt.shapes.face.createSquareFace({ size: 4, center: [0, 0, 0], direction: [0, 0, 1] });

        // Act
        const { shape: block, history } = occt.operations.extrudeWithHistory({ shape: square, direction: [0, 0, 5] });

        // Assert
        const edges = occt.shapes.edge.getEdges({ shape: block });
        expect(history.edgesFromVertices.length).toBeGreaterThan(0);
        history.edgesFromVertices.forEach(made => {
            expect(made).toHaveLength(1);
            expect(occt.shapes.edge.getEdgeLength({ shape: edges[made[0]!]! })).toBeCloseTo(5, 9);
        });
        expect(history.facesFromVertices.flat()).toEqual([]);
    });

    it.each([
        { name: "a fillet", act: (shape: TopoDS_Shape) => occt.fillets.filletEdgesWithHistory({ shape, radius: 1, indexes: [2, 999] }) },
        { name: "a chamfer", act: (shape: TopoDS_Shape) => occt.fillets.chamferEdgesWithHistory({ shape, distance: 1, indexes: [999] }) },
    ])("should refuse an edge index past the shape's last for $name", ({ act }) => {
        // Act
        const error = thrownBy(() => act(box()));

        // Assert
        expect(error.property).toBe("indexes");
        expect(error.message).toBe("`indexes` holds 999, past the shape's last edge: its edges are numbered from 0 to 11.");
    });

    it("should give a chamfer of every edge a history reaching every face it made", () => {
        // Arrange
        const shape = box();

        // Act
        const { shape: beveled, history } = occt.fillets.chamferEdgesWithHistory({ shape, distance: 1 });

        // Assert
        expect(history.facesFromEdges.map(faces => faces.length)).toEqual(Array(12).fill(1));
        expect(reached(history)).toBe(faceCount(beveled));
    });

    it("should keep a loose face a cut shape holds, numbering its history over what it keeps", () => {
        // Arrange
        const loose = occt.shapes.face.createSquareFace({ size: 2, center: [20, 0, 0], direction: [0, 0, 1] });
        const holder = occt.shapes.compound.makeCompound({ shapes: [box(), loose] });
        const drill = occt.shapes.solid.createCylinder({ radius: 2, height: 20, center: [0, 0, -10], direction: [0, 0, 1] });

        // Act
        const { shape, histories } = occt.booleans.differenceWithHistory({ shape: holder, shapes: [drill], keepEdges: false });
        const plain = occt.booleans.difference({ shape: holder, shapes: [drill], keepEdges: false });

        // Assert
        const faces = faceCount(shape);
        expect(occt.shapes.solid.getSolids({ shape })).toHaveLength(1);
        expect(faces).toBe(faceCount(plain));
        expect(histories.flatMap(history => [...history.faces.flat(), ...history.facesFromEdges.flat()]).every(face => face < faces)).toBe(true);
        expect(centresOf(shape).some(centre => Math.abs(centre[0] - 20) < 1e-9)).toBe(true);
    });

    it("should lead the tops of two boxes fused side by side to the one top they became", () => {
        // Arrange
        const left = box();
        const right = occt.shapes.solid.createBox({ width: 10, length: 10, height: 10, center: [10, 0, 0], originOnCenter: true });
        const leftTop = occt.select.faces.extreme({ shape: left, direction: [0, 1, 0] });
        const rightTop = occt.select.faces.extreme({ shape: right, direction: [0, 1, 0] });

        // Act
        const { shape, histories } = occt.booleans.unionWithHistory({ shapes: [left, right], keepEdges: false });

        // Assert
        expect(histories[0]!.faces[leftTop[0]!]).toHaveLength(1);
        expect(histories[1]!.faces[rightTop[0]!]).toEqual(histories[0]!.faces[leftTop[0]!]);
        expect(occt.shapes.face.getFaceArea({ shape: occt.shapes.face.getFace({ shape, index: histories[0]!.faces[leftTop[0]!]![0]! }) })).toBeCloseTo(200, 6);
        expect(reached(...histories)).toBe(faceCount(shape));
    });

    it.each([
        { name: "an extrusion", plain: () => occt.operations.extrude({ shape: occt.shapes.face.createSquareFace({ size: 4, center: [0, 0, 0], direction: [0, 0, 1] }), direction: [0, 0, 5] }),
            withHistory: () => occt.operations.extrudeWithHistory({ shape: occt.shapes.face.createSquareFace({ size: 4, center: [0, 0, 0], direction: [0, 0, 1] }), direction: [0, 0, 5] }).shape },
        { name: "a revolution", plain: () => occt.operations.revolve({ shape: occt.shapes.face.createSquareFace({ size: 2, center: [5, 0, 0], direction: [0, 1, 0] }), angle: 360, direction: [0, 0, 1], copy: false }),
            withHistory: () => occt.operations.revolveWithHistory({ shape: occt.shapes.face.createSquareFace({ size: 2, center: [5, 0, 0], direction: [0, 1, 0] }), angle: 360, direction: [0, 0, 1], copy: false }).shape },
        { name: "a chamfer", plain: () => occt.fillets.chamferEdges({ shape: box(), distance: 1, indexes: [0, 5] }),
            withHistory: () => occt.fillets.chamferEdgesWithHistory({ shape: box(), distance: 1, indexes: [0, 5] }).shape },
        { name: "a union", plain: () => occt.booleans.union({ shapes: [box(), occt.shapes.solid.createSphere({ radius: 6, center: [5, 5, 5] })], keepEdges: false }),
            withHistory: () => occt.booleans.unionWithHistory({ shapes: [box(), occt.shapes.solid.createSphere({ radius: 6, center: [5, 5, 5] })], keepEdges: false }).shape },
        { name: "a difference", plain: () => occt.booleans.difference({ shape: box(), shapes: [occt.shapes.solid.createSphere({ radius: 6, center: [5, 5, 5] })], keepEdges: false }),
            withHistory: () => occt.booleans.differenceWithHistory({ shape: box(), shapes: [occt.shapes.solid.createSphere({ radius: 6, center: [5, 5, 5] })], keepEdges: false }).shape },
    ])("should number the faces of $name as the plain method numbers them", ({ plain, withHistory }) => {
        // Act
        const expected = centresOf(plain());
        const received = centresOf(withHistory());

        // Assert
        expect(received).toHaveLength(expected.length);
        received.forEach((centre, index) => expect(centre).toEqual(expected[index]!.map(value => expect.closeTo(value, 9))));
    });

    it.each([
        { name: "a fillet", act: (read: () => void) => helper.filletsService.filletEdges(resolveDto(Inputs.OCCT.FilletDto, { shape: box(), radius: 1, indexes: [0] }) as Resolved.OCCT.FilletDto<TopoDS_Shape>, read) },
        { name: "a chamfer", act: (read: () => void) => helper.filletsService.chamferEdges(resolveDto(Inputs.OCCT.ChamferDto, { shape: box(), distance: 1, indexes: [0] }) as Resolved.OCCT.ChamferDto<TopoDS_Shape>, read) },
        { name: "an extrusion", act: (read: () => void) => helper.operationsService.extrude(resolveDto(Inputs.OCCT.ExtrudeDto, { shape: occt.shapes.face.createSquareFace({ size: 2, center: [0, 0, 0], direction: [0, 0, 1] }), direction: [0, 0, 3] }) as Resolved.OCCT.ExtrudeDto<TopoDS_Shape>, read) },
        { name: "a partial revolution", act: (read: () => void) => helper.operationsService.revolve(resolveDto(Inputs.OCCT.RevolveDto, { shape: occt.shapes.face.createSquareFace({ size: 2, center: [5, 0, 0], direction: [0, 1, 0] }), angle: 90, direction: [0, 0, 1] }) as Resolved.OCCT.RevolveDto<TopoDS_Shape>, read) },
        { name: "a whole revolution", act: (read: () => void) => helper.operationsService.revolve(resolveDto(Inputs.OCCT.RevolveDto, { shape: occt.shapes.face.createSquareFace({ size: 2, center: [5, 0, 0], direction: [0, 1, 0] }), angle: 360, direction: [0, 0, 1] }) as Resolved.OCCT.RevolveDto<TopoDS_Shape>, read) },
    ])("should pass on a failure reading the history of $name", ({ act }) => {
        // Arrange
        const failure = new Error("the history could not be read");

        // Act
        let thrown: unknown;
        try {
            act(() => {
                throw failure;
            });
        } catch (error) {
            thrown = error;
        }

        // Assert
        expect(thrown).toBe(failure);
    });

    it("should refuse a union or a difference with nothing to combine", () => {
        // Act
        const union = thrownBy(() => occt.booleans.unionWithHistory({ shapes: [] }));
        const difference = thrownBy(() => occt.booleans.differenceWithHistory({ shape: box(), shapes: [] }));

        // Assert
        expect(union.property).toBe("shapes");
        expect(difference.property).toBe("shapes");
    });

    it("should keep refusing a plain fillet whose edges the shape does not have, as it always has", () => {
        // Act
        let thrown: unknown;
        try {
            occt.fillets.filletEdges({ shape: box(), radius: 1, indexes: [999] });
        } catch (error) {
            thrown = error;
        }

        // Assert
        expect((thrown as Error).message).toContain("Fillet Edges Not Found");
    });

    it("should follow the pieces of a compound a union opens to what they became", () => {
        // Arrange
        const left = box();
        const right = occt.shapes.solid.createBox({ width: 10, length: 10, height: 10, center: [5, 0, 0], originOnCenter: true });
        const pair = occt.shapes.compound.makeCompound({ shapes: [left, right] });

        // Act
        const { shape, histories } = occt.booleans.unionWithHistory({ shapes: [pair], keepEdges: false });

        // Assert
        expect(histories).toHaveLength(1);
        expect(histories[0]!.faces).toHaveLength(12);
        expect(occt.shapes.solid.getSolids({ shape })).toHaveLength(1);
        expect(reached(histories[0]!)).toBe(faceCount(shape));
        expect(histories[0]!.faces.flat().every(face => face < faceCount(shape))).toBe(true);
    });
});
