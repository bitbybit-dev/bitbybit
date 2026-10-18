import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { GeometryHelper, MathBitByBit, Vector } from "@bitbybit-dev/base";
import { DrawHelperCore, type SurfaceAnalysisMesh } from "./draw-helper-core";

class SharedDrawing extends DrawHelperCore {
    paint(mesh: SurfaceAnalysisMesh, fallback: string, components: 3 | 4): number[][] | undefined {
        return this.surfaceAnalysisColors(mesh, fallback, undefined, undefined, components);
    }
}

const SEED = 20261021;

const drawing = (): SharedDrawing => new SharedDrawing(new Vector(new MathBitByBit(), new GeometryHelper()));

const exactCoordinate = fc.integer({ min: -512, max: 512 }).map(value => value / 8);
const analysisValue = fc.oneof(
    { weight: 8, arbitrary: fc.integer({ min: -64, max: 64 }).map(value => value / 4) },
    { weight: 1, arbitrary: fc.constantFrom(NaN, Infinity, -Infinity) },
);

const analysedFace = fc.integer({ min: 0, max: 6 }).chain(vertexCount => fc.record({
    vertexCoord: fc.array(exactCoordinate, { minLength: vertexCount * 3, maxLength: vertexCount * 3 }),
    analysisValues: fc.option(fc.array(analysisValue, { minLength: vertexCount, maxLength: vertexCount }), { nil: undefined }),
}));

const asFloat32 = (face: { vertexCoord: number[]; analysisValues: number[] | undefined }): { vertexCoord: Float32Array; analysisValues?: Float32Array } => {
    const shared = new Float32Array(face.vertexCoord.length + 3).fill(-7);
    shared.set(face.vertexCoord, 3);
    const values = face.analysisValues === undefined ? {} : { analysisValues: Float32Array.from(face.analysisValues) };
    return { vertexCoord: shared.subarray(3), ...values };
};

describe("what the three renderers share for a face, over generated faces", () => {
    it("should put a face's middle at the average of its whole points, for lists and for views into a shared buffer alike", () => {
        // Act & Assert
        fc.assert(fc.property(fc.array(exactCoordinate, { minLength: 3, maxLength: 30 }), coordinates => {
            const whole = Math.floor(coordinates.length / 3);
            const expected = [0, 1, 2].map(axis => Array.from({ length: whole }, (_, point) => coordinates[point * 3 + axis]!).reduce((sum, value) => sum + value, 0) / whole);
            const shared = new Float32Array(coordinates.length + 4).fill(99);
            shared.set(coordinates, 4);
            expect(drawing().computeFaceMiddleOfCoordinates(coordinates)).toEqual(expected);
            expect(drawing().computeFaceMiddleOfCoordinates(shared.subarray(4))).toEqual(expected);
        }), { seed: SEED, numRuns: 300 });
    });

    it("should color the faces of a surface analysis given as typed views exactly as it colors the same values as lists, one color in range per vertex", () => {
        // Act & Assert
        fc.assert(fc.property(fc.array(analysedFace, { maxLength: 5 }), fc.constantFrom<3 | 4>(3, 4), (faces, components) => {
            const fromLists = drawing().paint({ faceList: faces }, "#336699", components);
            const fromViews = drawing().paint({ faceList: faces.map(asFloat32) }, "#336699", components);
            expect(fromViews).toEqual(fromLists);
            if (fromLists !== undefined) {
                expect(fromLists.map(colors => colors.length)).toEqual(faces.map(face => face.vertexCoord.length / 3 * components));
                expect(fromLists.flat().every(channel => channel >= 0 && channel <= 1)).toBe(true);
            }
        }), { seed: SEED + 1, numRuns: 300 });
    });

    it("should place a face's label at its middle point, else at the average of its points, and give a face with neither no place at all", () => {
        // Act & Assert
        fc.assert(fc.property(fc.option(fc.tuple(exactCoordinate, exactCoordinate, exactCoordinate), { nil: null }), fc.array(exactCoordinate, { maxLength: 12 }), (centerPoint, coordinates) => {
            const placed = drawing().faceLabelPositionOf({ centerPoint, vertexCoord: Float32Array.from(coordinates) });
            const expected = centerPoint ?? (coordinates.length < 3 ? undefined : drawing().computeFaceMiddleOfCoordinates(coordinates));
            expect(placed).toEqual(expected);
            expect(placed === undefined || placed.every(value => Number.isFinite(value))).toBe(true);
        }), { seed: SEED + 2, numRuns: 300 });
    });

    it("should give a face whose mesh holds neither a middle point nor points no label position", () => {
        // Act
        const placed = [drawing().faceLabelPositionOf({ centerPoint: null, vertexCoord: [] }), drawing().faceLabelPositionOf({ vertexCoord: new Float32Array(0) })];

        // Assert
        expect(placed).toEqual([undefined, undefined]);
    });
});
