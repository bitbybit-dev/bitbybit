import { describe, it, expect, beforeAll, afterEach } from "vitest";
import fc from "fast-check";
import type { BitbybitOcctModule, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { OCCTService } from "../../occ-service";
import * as Inputs from "../../api/inputs";

const SEED = 20261018;

type Recipe = "box" | "rounded box" | "drilled box" | "cylinder" | "ball" | "cone" | "ring" | "repeated and mirrored" | "face with a hole" | "outline" | "circle edge" | "point" | "nothing" | "mesh only";

interface Drawing {
    recipe: Recipe;
    scale: number;
    precision: number;
    relativeDeflection: boolean;
    angularDeflection: number;
    computeMetadata: boolean;
    adjustYtoZ: boolean;
    isoCurvesU: number;
    isoCurvesV: number;
    surfaceAnalysis: Inputs.OCCT.surfaceAnalysisEnum;
    draftDirection: Inputs.Base.Vector3;
}

const SOLIDS: readonly Recipe[] = ["box", "rounded box", "drilled box", "cylinder", "ball", "cone", "ring", "repeated and mirrored"];

describe("MeshingService buffers against the lists, over real shapes", () => {
    let kernel: BitbybitOcctModule;
    let occt: OCCTService;
    let helper: OccHelper;

    beforeAll(async () => {
        kernel = await createBitbybitOcct();
        helper = new OccHelper(kernel);
        occt = new OCCTService(kernel, helper);
    }, 120_000);

    afterEach(() => {
        kernel.SetMeshRetention(0);
    });

    const shapeOf = (recipe: Recipe, scale: number): TopoDS_Shape => {
        const box = (): TopoDS_Shape => occt.shapes.solid.createBox({ width: 2 * scale, length: 3 * scale, height: 1.5 * scale, center: [scale, 0, -scale] });
        switch (recipe) {
            case "box":
                return box();
            case "rounded box":
                return occt.fillets.filletEdges({ shape: box(), radius: 0.3 * scale });
            case "drilled box":
                return occt.booleans.difference({ shape: box(), shapes: [occt.shapes.solid.createCylinder({ radius: 0.4 * scale, height: 4 * scale, center: [scale, -2 * scale, -scale], direction: [0, 1, 0] })], keepEdges: false });
            case "cylinder":
                return occt.shapes.solid.createCylinder({ radius: scale, height: 2 * scale, center: [0, 0, 0], direction: [1, 1, 0] });
            case "ball":
                return occt.shapes.solid.createSphere({ radius: scale, center: [0, scale, 0] });
            case "cone":
                return occt.shapes.solid.createCone({ radius1: scale, radius2: 0.25 * scale, height: 2 * scale, angle: 360, center: [0, 0, 0], direction: [0, 0, 1] });
            case "ring":
                return occt.shapes.solid.createTorus({ majorRadius: 2 * scale, minorRadius: 0.5 * scale, center: [0, 0, 0], direction: [0, 1, 0] });
            case "repeated and mirrored": {
                const part = occt.fillets.filletEdges({ shape: box(), radius: 0.2 * scale, indexes: [0, 1] });
                const moved = occt.transforms.translate({ shape: part, translation: [5 * scale, 0, 0] });
                const mirrored = occt.transforms.mirrorAlongNormal({ shape: part, origin: [0, 0, 0], normal: [1, 0, 0] });
                return occt.shapes.compound.makeCompound({ shapes: [part, moved, mirrored] });
            }
            case "face with a hole":
                return occt.shapes.face.createFaceFromWires({ shapes: [occt.shapes.wire.createSquareWire({ size: 4 * scale, center: [0, 0, 0], direction: [0, 1, 0] }), occt.shapes.wire.createCircleWire({ radius: scale, center: [0, 0, 0], direction: [0, -1, 0] })], planar: true });
            case "outline":
                return occt.shapes.wire.createRectangleWire({ width: 2 * scale, length: scale, center: [0, 0, 0], direction: [0, 1, 0] });
            case "circle edge":
                return occt.shapes.edge.createCircleEdge({ radius: scale, center: [0, 0, 0], direction: [0, 0, 1] });
            case "point":
                return occt.shapes.vertex.vertexFromXYZ({ x: scale, y: 2 * scale, z: 3 * scale });
            case "nothing":
                return occt.shapes.compound.makeCompound({ shapes: [] });
            default:
                return occt.io.loadStl({ stlData: occt.io.saveShapeStl({ shape: box(), fileName: "box.stl", precision: 0.1 * scale, adjustYtoZ: false, tryDownload: false, binary: false }), asFaces: false, adjustZtoY: false });
        }
    };

    const drawings: fc.Arbitrary<Drawing> = fc.record({
        recipe: fc.constantFrom<Recipe>("box", "rounded box", "drilled box", "cylinder", "ball", "cone", "ring", "repeated and mirrored", "face with a hole", "outline", "circle edge", "point", "nothing", "mesh only"),
        scale: fc.constantFrom(0.001, 0.1, 1, 25, 1000),
        precision: fc.constantFrom(0.005, 0.02, 0.1),
        relativeDeflection: fc.constant(true),
        angularDeflection: fc.constantFrom(0.2, 0.5, 1),
        computeMetadata: fc.boolean(),
        adjustYtoZ: fc.boolean(),
        isoCurvesU: fc.integer({ min: 0, max: 3 }),
        isoCurvesV: fc.integer({ min: 0, max: 3 }),
        surfaceAnalysis: fc.constantFrom(...Object.values(Inputs.OCCT.surfaceAnalysisEnum)),
        draftDirection: fc.constantFrom<Inputs.Base.Vector3>([0, 1, 0], [0, 0, 1], [1, 1, 0]),
    });

    const meshOptionsOf = (drawing: Drawing, shape: TopoDS_Shape): Inputs.OCCT.ShapeToMeshDto<TopoDS_Shape> => {
        const { recipe: _recipe, scale: _scale, ...options } = drawing;
        return { shape, ...options };
    };

    const listsAsBuffers = (lists: Inputs.OCCT.DecomposedMeshDto): unknown => ({
        ...lists,
        faceList: lists.faceList.map(({ vertexCoordVec: _points, vertexCoord, normalCoord, uvs, triIndexes, analysisValues, ...facts }) => ({
            ...facts,
            vertexCoord: vertexCoord.map(Math.fround),
            normalCoord: normalCoord.map(Math.fround),
            uvs: uvs.map(Math.fround),
            triIndexes,
            ...(analysisValues === undefined ? {} : { analysisValues: analysisValues.map(Math.fround) }),
        })),
    });
    const buffersAsLists = (buffers: Inputs.OCCT.DecomposedMeshBuffersDto): unknown => ({
        ...buffers,
        faceList: buffers.faceList.map(({ vertexCoord, normalCoord, uvs, triIndexes, analysisValues, ...facts }) => ({
            ...facts,
            vertexCoord: Array.from(vertexCoord),
            normalCoord: Array.from(normalCoord),
            uvs: Array.from(uvs),
            triIndexes: Array.from(triIndexes),
            ...(analysisValues === undefined ? {} : { analysisValues: Array.from(analysisValues) }),
        })),
    });

    type ViewKind = "vertexCoord" | "normalCoord" | "uvs" | "triIndexes" | "analysisValues";
    const VIEW_KINDS: readonly ViewKind[] = ["vertexCoord", "normalCoord", "uvs", "triIndexes", "analysisValues"];
    const layoutFaults = (mesh: Inputs.OCCT.DecomposedMeshBuffersDto): string[] => VIEW_KINDS.flatMap(kind => {
        const views = mesh.faceList.map(face => face[kind]).filter((view): view is Float32Array | Uint32Array => view !== undefined);
        const buffers = new Set(views.map(view => view.buffer));
        const faults: string[] = [];
        if (buffers.size > 1) {
            faults.push(`${kind} views ${buffers.size} buffers`);
        }
        let offset = 0;
        views.forEach((view, face) => {
            if (view.byteLength > 0 && view.byteOffset !== offset) {
                faults.push(`${kind} of face ${face} starts at byte ${view.byteOffset}, not ${offset}`);
            }
            offset += view.byteLength;
        });
        const [buffer] = buffers;
        if (buffer !== undefined && buffer.byteLength !== offset) {
            faults.push(`${kind} buffer holds ${buffer.byteLength} bytes for ${offset} viewed`);
        }
        if (buffer !== undefined && !(buffer instanceof ArrayBuffer)) {
            faults.push(`${kind} is not an ArrayBuffer of its own`);
        }
        return faults;
    });
    const meshVolume = (mesh: Inputs.OCCT.DecomposedMeshDto): number => mesh.faceList.reduce((sum, face) => {
        const at = (index: number): Inputs.Base.Point3 => [face.vertexCoord[3 * index]!, face.vertexCoord[3 * index + 1]!, face.vertexCoord[3 * index + 2]!];
        let volume = 0;
        for (let t = 0; t < face.triIndexes.length; t += 3) {
            const [a, b, c] = [at(face.triIndexes[t]!), at(face.triIndexes[t + 1]!), at(face.triIndexes[t + 2]!)];
            volume += (a[0] * (b[1] * c[2] - b[2] * c[1]) - a[1] * (b[0] * c[2] - b[2] * c[0]) + a[2] * (b[0] * c[1] - b[1] * c[0])) / 6;
        }
        return sum + volume;
    }, 0);
    const brepVolume = (shape: TopoDS_Shape): number => occt.shapes.solid.getSolids({ shape }).reduce((sum, solid) => sum + occt.shapes.solid.getSolidVolume({ shape: solid }), 0);

    describe("the drawing layout", () => {
        it("should give, as single-precision views, exactly the numbers and facts the lists give, for every kind of shape and every option", () => {
            fc.assert(fc.property(drawings, (drawing) => {
                // Arrange
                const shape = shapeOf(drawing.recipe, drawing.scale);
                const options = meshOptionsOf(drawing, shape);

                // Act
                const lists = occt.shapeToMesh(options);
                const buffers = helper.meshingService.shapeToMeshBuffers(options);

                // Assert
                expect(buffersAsLists(buffers)).toEqual(listsAsBuffers(lists));
            }), { seed: SEED, numRuns: 40 });
        });

        it("should lay each kind of number out once, in face order, every face a view into one buffer of its own", () => {
            fc.assert(fc.property(drawings, (drawing) => {
                // Arrange
                const shape = shapeOf(drawing.recipe, drawing.scale);

                // Act
                const buffers = helper.meshingService.shapeToMeshBuffers(meshOptionsOf(drawing, shape));

                // Assert
                const kinds = VIEW_KINDS.flatMap(kind => [...new Set(buffers.faceList.map(face => face[kind]?.buffer).filter(buffer => buffer !== undefined))]);
                expect(layoutFaults(buffers)).toEqual([]);
                expect(new Set(kinds).size).toBe(kinds.length);
                expect(buffers.faceList.filter(face => face.triIndexes.some(index => index >= face.vertexCoord.length / 3))).toEqual([]);
                expect(buffers.faceList.filter(face => face.analysisValues !== undefined && face.analysisValues.length !== face.vertexCoord.length / 3)).toEqual([]);
                expect(buffers.faceList.every(face => (face.analysisValues !== undefined) === (drawing.surfaceAnalysis !== Inputs.OCCT.surfaceAnalysisEnum.none))).toBe(true);
            }), { seed: SEED, numRuns: 40 });
        });

        it("should mesh a solid into triangles that enclose the volume the solid holds, wound outwards, turned to Z up or not", () => {
            fc.assert(fc.property(drawings.filter(drawing => SOLIDS.includes(drawing.recipe)), (drawing) => {
                // Arrange
                const shape = shapeOf(drawing.recipe, drawing.scale);
                const fine = { ...meshOptionsOf(drawing, shape), precision: 0.002, relativeDeflection: true };

                // Act
                const lists = occt.shapeToMesh(fine);

                // Assert
                expect(meshVolume(lists) / brepVolume(shape)).toBeCloseTo(1, 1);
            }), { seed: SEED, numRuns: 25 });
        });
    });

    describe("drawing the same shape again", () => {
        it("should draw a shape again, its mesh kept, with the very numbers it drew the first time", () => {
            fc.assert(fc.property(drawings, (drawing) => {
                // Arrange
                const shape = shapeOf(drawing.recipe, drawing.scale);
                const options = meshOptionsOf(drawing, shape);
                const fresh = helper.meshingService.shapeToMeshBuffers(options);
                kernel.SetMeshRetention(1_000_000);

                // Act
                const first = helper.meshingService.shapeToMeshBuffers(options);
                const again = helper.meshingService.shapeToMeshBuffers(options);

                // Assert
                expect(buffersAsLists(first)).toEqual(buffersAsLists(fresh));
                expect(buffersAsLists(again)).toEqual(buffersAsLists(fresh));
            }), { seed: SEED, numRuns: 25 });
        });

        it("should draw a kept shape afresh when it is asked for another precision, another angle or another frame", () => {
            fc.assert(fc.property(drawings.filter(drawing => SOLIDS.includes(drawing.recipe)), fc.constantFrom("precision", "angularDeflection", "adjustYtoZ", "computeMetadata"), (drawing, changed) => {
                // Arrange
                const shape = shapeOf(drawing.recipe, drawing.scale);
                const options = meshOptionsOf(drawing, shape);
                const other = { ...options, [changed]: changed === "precision" ? drawing.precision / 4 : changed === "angularDeflection" ? drawing.angularDeflection / 4 : !options[changed] };
                const expected = helper.meshingService.shapeToMeshBuffers(other);
                kernel.SetMeshRetention(1_000_000);
                helper.meshingService.shapeToMeshBuffers(options);

                // Act
                const redrawn = helper.meshingService.shapeToMeshBuffers(other);

                // Assert
                expect(buffersAsLists(redrawn)).toEqual(buffersAsLists(expected));
            }), { seed: SEED, numRuns: 20 });
        });

        it("should draw a copy moved off a kept shape where the copy stands", () => {
            fc.assert(fc.property(drawings.filter(drawing => SOLIDS.includes(drawing.recipe)), fc.tuple(fc.double({ min: -50, max: 50, noNaN: true }), fc.double({ min: -50, max: 50, noNaN: true }), fc.double({ min: -50, max: 50, noNaN: true })), (drawing, translation) => {
                // Arrange
                const shape = shapeOf(drawing.recipe, drawing.scale);
                const moved = occt.transforms.translate({ shape, translation });
                const options = { ...meshOptionsOf(drawing, shape), adjustYtoZ: false };
                const expected = occt.shapeToMesh({ ...options, shape: moved });
                kernel.SetMeshRetention(1_000_000);
                occt.shapeToMesh(options);

                // Act
                const redrawn = occt.shapeToMesh({ ...options, shape: moved });

                // Assert
                expect(redrawn.faceList.map(face => face.vertexCoord)).toEqual(expected.faceList.map(face => face.vertexCoord.map(value => expect.closeTo(value, 9))));
            }), { seed: SEED, numRuns: 15 });
        });
    });

    describe("what the properties found", () => {
        it("should split a surface analysis into its faces at their own nodes, not each face from the first node", () => {
            // Arrange
            const shape = occt.booleans.union({ shapes: [occt.shapes.solid.createSphere({ radius: 1, center: [0, 0, 0] }), occt.shapes.solid.createCylinder({ radius: 0.5, height: 3, center: [0, 0, 0], direction: [0, 1, 0] })], keepEdges: false });
            const options = { shape, precision: 0.05, surfaceAnalysis: Inputs.OCCT.surfaceAnalysisEnum.mean };

            // Act
            const lists = occt.shapeToMesh(options);
            const buffers = helper.meshingService.shapeToMeshBuffers(options);

            // Assert
            expect(buffers.faceList.map(face => Array.from(face.analysisValues!))).toEqual(lists.faceList.map(face => face.analysisValues!.map(Math.fround)));
        });
    });
});
