import { describe, it, expect, beforeEach, vi, type Mock } from "vitest";
import { BatchedMesh, Color, Group, InstancedBufferAttribute, Matrix4, Mesh, MeshPhysicalMaterial, Raycaster, Scene, type Intersection, type WebGLRenderer } from "three";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { LineSegments2 } from "three/examples/jsm/lines/LineSegments2.js";
import { Tag } from "@bitbybit-dev/core";
import type * as Models from "@bitbybit-dev/core/lib/api/models";
import { GeometryHelper, MathBitByBit, Vector, resolveDto } from "@bitbybit-dev/base";
import { JSCADText, JSCADWorkerManager } from "@bitbybit-dev/jscad-worker";
import { ManifoldWorkerManager } from "@bitbybit-dev/manifold-worker";
import { OCCTWorkerManager } from "@bitbybit-dev/occt-worker/lib";
import { mockOCCTBoxDecomposedMesh } from "../__mocks__/test-data";
import { partialMock } from "../__mocks__/test-helpers";
import { Context } from "../context";
import { DrawHelper } from "../draw-helper";
import * as Inputs from "../inputs";
import * as Resolved from "../resolved-inputs";
import { Draw } from "./draw";

type Build = Models.OCCT.DesignBuildResult<Inputs.OCCT.TopoDSShapePointer>;

const shapeA: Inputs.OCCT.TopoDSShapePointer = { hash: 101, type: "occ-shape" };
const shapeB: Inputs.OCCT.TopoDSShapePointer = { hash: 102, type: "occ-shape" };
const shapeC: Inputs.OCCT.TopoDSShapePointer = { hash: 103, type: "occ-shape" };

const at = (x: number): Inputs.Base.TransformMatrix => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, 0, 0, 1];

const boxAppearance: Models.OCCT.DesignBuiltAppearance = { color: "#ffffff", metallic: 0, roughness: 0.4, faces: [{ indexes: [0, 1], color: "#000000", metallic: 1 }] };

const partOf = (id: string, shape: Inputs.OCCT.TopoDSShapePointer, appearance?: Models.OCCT.DesignBuiltAppearance, shapeHash = `${id}-shape`): Models.OCCT.DesignBuiltPart<Inputs.OCCT.TopoDSShapePointer> => ({
    id,
    itemKey: `${id}-item`,
    buildKey: `${id}-build`,
    name: id,
    body: id,
    shape,
    shapeHash,
    faceNames: [],
    properties: {},
    connectors: [],
    parameters: {},
    ...(appearance ? { appearance } : {}),
});

const componentOf = (path: string, part: string, x: number): Models.OCCT.DesignBuiltComponent => ({ path, name: path, part, matrix: at(x), world: at(x), properties: {} });

const buildOf = (boxes: number[], pins: number[], extra?: { id: string; shape: Inputs.OCCT.TopoDSShapePointer }): Build => ({
    parts: [
        partOf("box-1", shapeA, boxAppearance),
        partOf("pin-2", shapeB),
        ...(extra ? [partOf(extra.id, extra.shape)] : []),
    ],
    report: [],
    issues: [],
    parameters: {},
    units: { length: "mm", angle: "deg" },
    up: "y",
    components: [
        ...boxes.map((x, index) => componentOf(`box${index}`, "box-1", x)),
        ...pins.map((x, index) => componentOf(`pin${index}`, "pin-2", x)),
        ...(extra ? [componentOf("extra", extra.id, 50)] : []),
    ],
});

const batchesOf = (group: Group): BatchedMesh[] => group.children.filter((child): child is BatchedMesh => child instanceof BatchedMesh);
const linesOf = (group: Group): LineSegments2[] => group.children.filter((child): child is LineSegments2 => child instanceof LineSegments2);
const colorOf = (batch: BatchedMesh): string => (batch.material as MeshPhysicalMaterial).color.getHexString();
const matrixAt = (batch: BatchedMesh, id: number): number[] => batch.getMatrixAt(id, new Matrix4()).toArray();
const segmentColor = (line: LineSegments2, segment: number): string => {
    const colors = line.geometry.getAttribute("instanceColorStart");
    return new Color(colors.getX(segment), colors.getY(segment), colors.getZ(segment)).getHexString();
};
const segmentColors = (line: LineSegments2, segments: readonly number[]): string[] => segments.map(segment => segmentColor(line, segment));

describe("drawing shapes with their appearance and design builds", () => {
    let draw: Draw;
    let drawHelper: DrawHelper;
    let occtWorkerManager: OCCTWorkerManager;
    let workerCall: Mock;

    beforeEach(() => {
        const context = new Context();
        context.scene = new Scene();
        const jscadWorkerManager = new JSCADWorkerManager();
        occtWorkerManager = new OCCTWorkerManager();
        const vector = new Vector(new MathBitByBit(), new GeometryHelper());
        drawHelper = new DrawHelper(context, new JSCADText(jscadWorkerManager), vector, jscadWorkerManager, new ManifoldWorkerManager(), occtWorkerManager);
        draw = new Draw(drawHelper, context, new Tag(context));
        workerCall = vi.fn((_method: string, inputs: { shapes: unknown[] }) => Promise.resolve(inputs.shapes.map(() => mockOCCTBoxDecomposedMesh())));
        occtWorkerManager.genericCallToWorkerPromise = workerCall;
    });

    describe("a shape with its appearance", () => {
        it("should draw one mesh with a geometry group and a material per look", async () => {
            // Arrange
            const options = { ...new Inputs.Draw.DrawOcctShapeOptions(), drawTwoSided: false, drawEdges: false };

            // Act
            const drawn = await draw.drawAnyAsync({ entity: { shape: shapeA, appearance: boxAppearance }, options });

            // Assert
            const meshes = drawn.children.filter((child): child is Mesh => child instanceof Mesh);
            expect(meshes).toHaveLength(1);
            const mesh = meshes[0]!;
            const materials = mesh.material as MeshPhysicalMaterial[];
            expect(mesh.geometry.groups).toEqual([{ start: 0, count: 24, materialIndex: 0 }, { start: 24, count: 12, materialIndex: 1 }]);
            expect(materials.map(material => material.color.getHexString())).toEqual(["ffffff", "000000"]);
            expect(materials.map(material => material.metalness)).toEqual([0, 1]);
            expect(drawn.userData["type"]).toBe(Inputs.Draw.drawingTypes.occt);
        });

        it("should record where the triangles of each face sit in the index buffer", async () => {
            // Arrange
            const options = { ...new Inputs.Draw.DrawOcctShapeOptions(), drawTwoSided: false, drawEdges: false };

            // Act
            const drawn = await draw.drawAnyAsync({ entity: { shape: shapeA, appearance: boxAppearance }, options });

            // Assert
            const mesh = drawn.children[0] as Mesh;
            expect(mesh.userData["faceRanges"]).toEqual([
                { face: 2, start: 0, count: 6 }, { face: 3, start: 6, count: 6 }, { face: 4, start: 12, count: 6 },
                { face: 5, start: 18, count: 6 }, { face: 0, start: 24, count: 6 }, { face: 1, start: 30, count: 6 },
            ]);
        });

        it("should draw the edges once, as one line, and the back faces when asked", async () => {
            // Arrange
            const options = { ...new Inputs.Draw.DrawOcctShapeOptions(), drawTwoSided: true, drawEdges: true };

            // Act
            const drawn = await draw.drawAnyAsync({ entity: { shape: shapeA, appearance: boxAppearance }, options });

            // Assert
            expect(linesOf(drawn)).toHaveLength(1);
            expect(linesOf(drawn)[0]!.geometry.attributes["instanceStart"]!.count).toBe(12);
            expect(drawn.children.filter(child => child instanceof Group)).toHaveLength(1);
        });

        it("should color each edge as the appearance says and the rest in its edge color", async () => {
            // Arrange
            const options = { ...new Inputs.Draw.DrawOcctShapeOptions(), drawFaces: false };
            const appearance = { color: "#ffffff", edgeColor: "#333333", faces: [], edges: [{ indexes: [2, 5], color: "#ff0000" }] };

            // Act
            const drawn = await draw.drawAnyAsync({ entity: { shape: shapeA, appearance }, options });

            // Assert
            expect(segmentColors(linesOf(drawn)[0]!, [0, 2, 5, 11])).toEqual(["333333", "ff0000", "ff0000", "333333"]);
        });

        it("should give edges no appearance colors the shape's color moved by the edge contrast", async () => {
            // Arrange
            const options = { ...new Inputs.Draw.DrawOcctShapeOptions(), drawFaces: false, edgeColour: "#00ff00", edgeContrast: 0.4 };

            // Act
            const light = await draw.drawAnyAsync({ entity: { shape: shapeA, appearance: { color: "#ffffff", faces: [] } }, options });
            const optionsColor = await draw.drawAnyAsync({ entity: { shape: shapeA }, options: { ...options, faceColour: "#000000" } });

            // Assert
            expect(segmentColor(linesOf(light)[0]!, 0)).toBe("999999");
            expect(segmentColor(linesOf(optionsColor)[0]!, 0)).toBe("666666");
        });

        it("should give every face the face color of the options when there is no appearance", async () => {
            // Arrange
            const options = { ...new Inputs.Draw.DrawOcctShapeOptions(), faceColour: "#00ff00", drawTwoSided: false, drawEdges: false };

            // Act
            const drawn = await draw.drawAnyAsync({ entity: { shape: shapeA }, options });

            // Assert
            const materials = (drawn.children[0] as Mesh).material as MeshPhysicalMaterial[];
            expect(materials.map(material => material.color.getHexString())).toEqual(["00ff00"]);
        });

        it("should make a look glow in its emissive color at its strength", async () => {
            // Arrange
            const options = { ...new Inputs.Draw.DrawOcctShapeOptions(), drawTwoSided: false, drawEdges: false };
            const appearance = { color: "#ffffff", emissive: "#3cf2ff", emissiveStrength: 2.6, faces: [{ indexes: [0], emissive: "#ff0000", emissiveStrength: 1 }] };

            // Act
            const drawn = await draw.drawAnyAsync({ entity: { shape: shapeA, appearance }, options });

            // Assert
            const materials = (drawn.children[0] as Mesh).material as MeshPhysicalMaterial[];
            expect(materials.map(material => [material.emissive.getHexString(), material.emissiveIntensity])).toEqual([["3cf2ff", 2.6], ["ff0000", 1]]);
        });

        it("should multiply the opacity of each look by the face opacity", async () => {
            // Arrange
            const options = { ...new Inputs.Draw.DrawOcctShapeOptions(), faceOpacity: 0.5, drawTwoSided: false, drawEdges: false };
            const appearance = { color: "#ffffff", opacity: 0.5, faces: [] };

            // Act
            const drawn = await draw.drawAnyAsync({ entity: { shape: shapeA, appearance }, options });

            // Assert
            const [material] = (drawn.children[0] as Mesh).material as MeshPhysicalMaterial[];
            expect(material!.opacity).toBe(0.25);
            expect(material!.transparent).toBe(true);
            expect(material!.depthWrite).toBe(false);
        });

        it("should mesh a list of them in one call to the worker", async () => {
            // Arrange
            const options = { ...new Inputs.Draw.DrawOcctShapeOptions(), drawTwoSided: false };

            // Act
            const drawn = await draw.drawAnyAsync({ entity: [{ shape: shapeA, appearance: boxAppearance }, { shape: shapeB }], options });

            // Assert
            expect(drawn.children).toHaveLength(2);
            expect(workerCall).toHaveBeenCalledTimes(1);
            expect(workerCall.mock.calls[0]![0]).toBe("shapesToMeshes");
            expect(workerCall.mock.calls[0]![1].shapes).toEqual([shapeA, shapeB]);
            expect(drawn.userData["type"]).toBe(Inputs.Draw.drawingTypes.occtShapes);
        });

        it("should mesh at the angular and relative deflection the options give", async () => {
            // Arrange
            const options = { ...new Inputs.Draw.DrawOcctShapeOptions(), drawTwoSided: false, angularDeflection: 0.2, relativeDeflection: true };

            // Act
            await draw.drawAnyAsync({ entity: [{ shape: shapeA, appearance: boxAppearance }], options });

            // Assert
            expect(workerCall.mock.calls[0]![1]).toEqual(expect.objectContaining({ angularDeflection: 0.2, relativeDeflection: true }));
        });

        it("should refuse an answer from the worker that is not one mesh per shape", async () => {
            // Arrange
            workerCall.mockResolvedValueOnce([]);

            // Act
            const drawing = draw.drawAnyAsync({ entity: { shape: shapeA } });

            // Assert
            await expect(drawing).rejects.toThrow("did not return one mesh of faces and edges per shape");
        });
    });

    describe("the color groups of an assembly document", () => {
        it("should color the faces of each group in one mesh", async () => {
            // Arrange
            const mesh = { ...mockOCCTBoxDecomposedMesh(), colorGroups: { "#00ff00ff": [0, 1], "#0000ff80": [2] } };
            const options = resolveDto(Inputs.Draw.DrawOcctShapeOptions, { faceColour: "#ff0000", drawEdges: false }) as Resolved.Draw.DrawOcctShapeOptions;

            // Act
            const drawn = await drawHelper.handleDecomposedMesh(options, mesh, options);

            // Assert
            const surface = drawn.children[0] as Mesh;
            const materials = surface.material as MeshPhysicalMaterial[];
            expect(materials.map(material => material.color.getHexString())).toEqual(["ff0000", "00ff00", "0000ff"]);
            expect(materials[2]!.opacity).toBeCloseTo(128 / 255);
            expect(surface.geometry.groups.map(group => group.count)).toEqual([18, 12, 6]);
        });
    });

    describe("the edges of a shape drawn without an appearance", () => {
        it("should take the edge color of the options, or the face color moved by the edge contrast", async () => {
            // Arrange
            workerCall.mockResolvedValueOnce(mockOCCTBoxDecomposedMesh()).mockResolvedValueOnce(mockOCCTBoxDecomposedMesh());
            const options = { ...new Inputs.Draw.DrawOcctShapeOptions(), faceColour: "#ffffff", edgeColour: "#00ff00", drawFaces: false };

            // Act
            const plain = await draw.drawAnyAsync({ entity: shapeA, options });
            const contrasted = await draw.drawAnyAsync({ entity: shapeA, options: { ...options, edgeContrast: 0.4 } });

            // Assert
            expect(segmentColor(linesOf(plain)[0]!, 0)).toBe("00ff00");
            expect(segmentColor(linesOf(contrasted)[0]!, 0)).toBe("999999");
        });

        it("should give each edge drawn on its own the same contrasted color", async () => {
            // Arrange
            const options = resolveDto(Inputs.Draw.DrawOcctShapeOptions, { faceColour: "#000000", drawFaces: false, edgeContrast: 1 }) as Resolved.Draw.DrawOcctShapeOptions;

            // Act
            const drawn = await drawHelper.handleDecomposedMeshIndividually(options, mockOCCTBoxDecomposedMesh(), options);

            // Assert
            const lines = linesOf(drawn);
            expect(lines).toHaveLength(12);
            expect(lines.map(line => segmentColor(line, 0))).toEqual(Array.from({ length: 12 }, () => "ffffff"));
        });
    });

    describe("a design build", () => {
        const options = { ...new Inputs.Draw.DrawOcctShapeOptions(), faceColour: "#ff0000", precision: 0.1 };

        it("should mesh each part once and draw one batch per look with an instance per placement", async () => {
            // Act
            const drawn = await draw.drawAnyAsync({ entity: buildOf([0, 10], [20]), options });

            // Assert
            expect(workerCall).toHaveBeenCalledTimes(1);
            expect(workerCall.mock.calls[0]![1].shapes).toEqual([shapeA, shapeB]);
            const batches = batchesOf(drawn);
            expect(batches.map(colorOf)).toEqual(["ffffff", "000000", "ff0000"]);
            expect(batches.map(batch => batch.instanceCount)).toEqual([2, 2, 1]);
            expect(batches[0]!.userData["instancePaths"]).toEqual(["box0", "box1"]);
            expect(matrixAt(batches[0]!, 1)).toEqual(at(10));
            expect(drawn.userData["type"]).toBe(Inputs.Draw.drawingTypes.occtShapes);
        });

        it("should record per geometry its part and where the triangles of its faces sit", async () => {
            // Act
            const drawn = await draw.drawAnyAsync({ entity: buildOf([0], [20]), options });

            // Assert
            const black = batchesOf(drawn)[1]!;
            expect(black.userData["geometries"]).toEqual([{ part: "box-1", indexStart: 0, faceRanges: [{ face: 0, start: 0, count: 6 }, { face: 1, start: 6, count: 6 }] }]);
        });

        it("should only move the instances when redrawn with the same parts at the same paths", async () => {
            // Arrange
            const drawn = await draw.drawAnyAsync({ entity: buildOf([0, 10], [20]), options });
            const batches = batchesOf(drawn);

            // Act
            const redrawn = await draw.drawAnyAsync({ entity: buildOf([5, 15], [25]), options, group: drawn });

            // Assert
            expect(redrawn).toBe(drawn);
            expect(workerCall).toHaveBeenCalledTimes(1);
            expect(batchesOf(redrawn)).toEqual(batches);
            expect(matrixAt(batches[0]!, 1)).toEqual(at(15));
            expect(matrixAt(batches[2]!, 0)).toEqual(at(25));
        });

        it("should mesh only the parts it has not when the placements change, in the same group", async () => {
            // Arrange
            const drawn = await draw.drawAnyAsync({ entity: buildOf([0], [20]), options });

            // Act
            const redrawn = await draw.drawAnyAsync({ entity: buildOf([0], [20], { id: "nut-3", shape: shapeC }), options, group: drawn });

            // Assert
            expect(redrawn).toBe(drawn);
            expect(workerCall).toHaveBeenCalledTimes(2);
            expect(workerCall.mock.calls[1]![1].shapes).toEqual([shapeC]);
            expect(batchesOf(redrawn).map(batch => batch.instanceCount)).toEqual([1, 1, 2]);
        });

        it("should mesh a part again when its shape changed under the same id, and only that part", async () => {
            // Arrange
            const drawn = await draw.drawAnyAsync({ entity: buildOf([0], [20]), options });
            const edited = buildOf([0], [20]);
            edited.parts[1] = partOf("pin-2", shapeC, undefined, "pin-2-edited");

            // Act
            const redrawn = await draw.drawAnyAsync({ entity: edited, options, group: drawn });

            // Assert
            expect(redrawn).toBe(drawn);
            expect(workerCall).toHaveBeenCalledTimes(2);
            expect(workerCall.mock.calls[1]![1].shapes).toEqual([shapeC]);
        });

        it("should mesh every part again when the precision changes", async () => {
            // Arrange
            const drawn = await draw.drawAnyAsync({ entity: buildOf([0], [20]), options });

            // Act
            await draw.drawAnyAsync({ entity: buildOf([0], [20]), options: { ...options, precision: 0.5 }, group: drawn });

            // Assert
            expect(workerCall).toHaveBeenCalledTimes(2);
            expect(workerCall.mock.calls[1]![1].shapes).toEqual([shapeA, shapeB]);
        });

        it("should draw every edge of every placement in one line, each copy moved by its placement", async () => {
            // Act
            const drawn = await draw.drawAnyAsync({ entity: buildOf([0, 10], [20]), options });

            // Assert
            const lines = linesOf(drawn);
            expect(lines).toHaveLength(1);
            const line = lines[0]!;
            const batch = line.geometry.getAttribute("instanceBatch") as InstancedBufferAttribute;
            expect(batch.count).toBe(36);
            expect([batch.getX(0), batch.getX(12), batch.getX(24)]).toEqual([0, 1, 2]);
            expect(line.userData["paths"]).toEqual(["box0", "box1", "pin0"]);
            expect(line.userData["segmentStarts"]).toEqual([0, 12, 24]);
            const texture = line.material.uniforms["batchMatrices"]!.value as { image: { data: Float32Array } };
            expect(Array.from(texture.image.data.slice(16, 32))).toEqual(at(10));
            expect(line.frustumCulled).toBe(false);
        });

        it("should compile the edges with each segment moved by its matrix, keyed apart from plain lines and never picked", async () => {
            // Arrange
            const drawn = await draw.drawAnyAsync({ entity: buildOf([0], [20]), options });
            const line = linesOf(drawn)[0]!;
            const shader = { vertexShader: new LineMaterial().vertexShader, fragmentShader: "", uniforms: {} } as Parameters<LineMaterial["onBeforeCompile"]>[0];
            const intersects: Intersection[] = [];

            // Act
            line.material.onBeforeCompile(shader, partialMock<WebGLRenderer>({}));
            line.raycast(new Raycaster(), intersects);

            // Assert
            expect(shader.vertexShader).toContain("mat4 batchMatrix = batchMatrixOf( instanceBatch );");
            expect(line.material.customProgramCacheKey()).toBe("bitbybit-batched-line");
            expect(intersects).toEqual([]);
        });

        it("should move the edges with the instances when redrawn with new matrices", async () => {
            // Arrange
            const drawn = await draw.drawAnyAsync({ entity: buildOf([0, 10], [20]), options });

            // Act
            await draw.drawAnyAsync({ entity: buildOf([0, 30], [20]), options, group: drawn });

            // Assert
            const texture = linesOf(drawn)[0]!.material.uniforms["batchMatrices"]!.value as { image: { data: Float32Array } };
            expect(Array.from(texture.image.data.slice(16, 32))).toEqual(at(30));
        });

        it("should place each part of a build without components once, at the origin", async () => {
            // Arrange
            const partDocument: Build = { parts: [partOf("box-1", shapeA, boxAppearance)], report: [], issues: [], parameters: {}, units: { length: "mm", angle: "deg" }, up: "y" };

            // Act
            const drawn = await draw.drawAnyAsync({ entity: partDocument, options });

            // Assert
            const batches = batchesOf(drawn);
            expect(batches.map(batch => batch.instanceCount)).toEqual([1, 1]);
            expect(matrixAt(batches[0]!, 0)).toEqual(at(0));
        });

        it("should color the edges of each placement as its part's appearance says, in one line", async () => {
            // Arrange
            const build = buildOf([0, 10], [20]);
            build.parts[0] = partOf("box-1", shapeA, { ...boxAppearance, edgeColor: "#333333", edges: [{ indexes: [0], color: "#0000ff" }] });

            // Act
            const drawn = await draw.drawAnyAsync({ entity: build, options: { ...options, edgeColour: "#00ff00" } });

            // Assert
            const line = linesOf(drawn)[0]!;
            expect(segmentColors(line, [0, 1, 12, 13, 24, 35])).toEqual(["0000ff", "333333", "0000ff", "333333", "00ff00", "00ff00"]);
            expect(line.material.vertexColors).toBe(true);
            expect(line.material.color.getHexString()).toBe("ffffff");
        });

        it("should draw the edges again when the edge contrast changes, without meshing again", async () => {
            // Arrange
            const drawn = await draw.drawAnyAsync({ entity: buildOf([0], [20]), options });
            const before = linesOf(drawn)[0]!;

            // Act
            await draw.drawAnyAsync({ entity: buildOf([0], [20]), options: { ...options, edgeContrast: 0.5 }, group: drawn });

            // Assert
            const after = linesOf(drawn)[0]!;
            expect(after).not.toBe(before);
            expect(workerCall).toHaveBeenCalledTimes(1);
            expect(segmentColors(after, [0, 12])).toEqual(["808080", "ff8080"]);
        });

        it("should draw no faces and no edges when the options turn them off", async () => {
            // Act
            const drawn = await draw.drawAnyAsync({ entity: buildOf([0], [20]), options: { ...options, drawFaces: false, drawEdges: false } });

            // Assert
            expect(drawn.children).toHaveLength(0);
        });
    });
});
