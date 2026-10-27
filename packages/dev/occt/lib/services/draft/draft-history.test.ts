import { describe, it, expect, beforeAll } from "vitest";
import type { BitbybitOcctModule, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OCCTService } from "../../occ-service";
import { readKernelException } from "../../kernel-exception";
import type * as Inputs from "../../api/inputs";

describe("OCCT drafts with history", () => {
    let occt: OCCTService;
    let kernel: BitbybitOcctModule;

    beforeAll(async () => {
        kernel = await createBitbybitOcct();
        occt = new OCCTService(kernel);
    }, 120_000);

    const kernelMessage = (action: () => unknown): string => {
        try {
            action();
        } catch (error) {
            const read = readKernelException(kernel, error);
            return read instanceof Error ? read.message : String(read);
        }
        return "nothing thrown";
    };

    const faceCount = (shape: TopoDS_Shape): number => occt.shapes.face.getFaces({ shape }).length;
    const normalOf = (shape: TopoDS_Shape, index: number): Inputs.Base.Vector3 =>
        occt.shapes.face.normalOnUV({ shape: occt.shapes.face.getFace({ shape, index }), paramU: 0.5, paramV: 0.5 });
    const volumeOf = (shape: TopoDS_Shape): number => occt.shapes.solid.getSolidVolume({ shape });
    const square = (): TopoDS_Shape => occt.shapes.wire.createRectangleWire({ width: 10, length: 10, center: [0, 0, 0], direction: [0, 1, 0] });

    it("should tilt a box's side by the draft angle and name every face's successor", () => {
        // Arrange
        const box = occt.shapes.solid.createBox({ width: 10, height: 10, length: 10, center: [0, 0, 0] });
        const faces = occt.shapes.face.getFaces({ shape: box });
        const side = faces.findIndex((_, index) => normalOf(box, index)[0] > 0.9);
        const inputs = { shape: box, faces: [faces[side]!], direction: [0, 0, 1] as Inputs.Base.Vector3, angle: 5, neutralPlaneOrigin: [0, 0, -5] as Inputs.Base.Point3, neutralPlaneDirection: [0, 0, 1] as Inputs.Base.Vector3, flag: true };

        // Act
        const { shape, history } = occt.draft.draftAngleWithHistory(inputs);

        // Assert
        expect(volumeOf(shape)).toBeCloseTo(volumeOf(occt.draft.draftAngle(inputs)), 9);
        expect(history.faces.every(each => each.length === 1)).toBe(true);
        expect(new Set(history.faces.flat()).size).toBe(6);
        const tilted = normalOf(shape, history.faces[side]![0]!);
        expect(Math.acos(tilted[0]) * 180 / Math.PI).toBeCloseTo(5, 6);
    });

    it("should name the wall each edge of a drafted outline sweeps", () => {
        // Arrange
        const outline = square();

        // Act
        const { shape, history } = occt.draft.makeDraftWithHistory({ shape: outline, direction: [0, 1, 0], angle: 5, lengthMax: 20, internal: false });

        // Assert
        expect(history.facesFromEdges).toHaveLength(4);
        expect(history.facesFromEdges.every(each => each.length === 1)).toBe(true);
        expect(new Set(history.facesFromEdges.flat()).size).toBe(4);
        expect(faceCount(shape)).toBe(4);
    });

    it("should name the walls a draft makes up to a stop shape, and refuse what it cannot sweep", () => {
        // Arrange
        const outline = square();
        const ceiling = occt.shapes.face.createRectangleFace({ width: 40, length: 40, center: [0, 15, 0], direction: [0, 1, 0] });
        const point = occt.shapes.vertex.vertexFromXYZ({ x: 0, y: 0, z: 0 });

        // Act
        const { history } = occt.draft.makeDraftToShapeWithHistory({ shape: outline, direction: [0, 1, 0], angle: 5, stopShape: ceiling, keepOut: false, internal: false });
        const refused = kernelMessage(() => occt.draft.makeDraftWithHistory({ shape: point, direction: [0, 1, 0], angle: 5, lengthMax: 20, internal: false }));

        // Assert
        expect(new Set(history.facesFromEdges.flat()).size).toBe(4);
        expect(refused).toBe("Standard_ConstructionError: BRepFill_Draft");
    });
});
