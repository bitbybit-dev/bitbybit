import { describe, it, expect, beforeEach, afterEach, vi, type Mock } from "vitest";
import * as pc from "playcanvas";
import { Tag } from "@bitbybit-dev/core";
import type * as Models from "@bitbybit-dev/core/lib/api/models";
import { GeometryHelper, MathBitByBit, Vector, resolveDto } from "@bitbybit-dev/base";
import { JSCADText, JSCADWorkerManager } from "@bitbybit-dev/jscad-worker";
import { ManifoldWorkerManager } from "@bitbybit-dev/manifold-worker";
import { OCCTWorkerManager } from "@bitbybit-dev/occt-worker";
import { Context } from "../context";
import { DrawHelper } from "../draw-helper";
import * as Inputs from "../inputs";
import * as Resolved from "../resolved-inputs";
import { Draw } from "./draw";

type Build = Models.OCCT.DesignBuildResult<Inputs.OCCT.TopoDSShapePointer>;

const CORNERS: Inputs.Base.Point3[] = [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0], [0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]];
const QUADS = [[0, 3, 2, 1], [4, 5, 6, 7], [0, 1, 5, 4], [2, 3, 7, 6], [1, 2, 6, 5], [0, 4, 7, 3]];
const NORMALS = [[0, 0, -1], [0, 0, 1], [0, -1, 0], [0, 1, 0], [1, 0, 0], [-1, 0, 0]];
const EDGES = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];

const boxMesh = (): Inputs.OCCT.DecomposedMeshDto => {
    const faces = QUADS.map((quad, faceIndex) => {
        const face = new Inputs.OCCT.DecomposedFaceDto();
        face.faceIndex = faceIndex;
        face.vertexCoord = quad.flatMap(corner => CORNERS[corner]!);
        face.normalCoord = quad.flatMap(() => NORMALS[faceIndex]!);
        face.triIndexes = [0, 1, 2, 0, 2, 3];
        face.numberOfTriangles = 2;
        return face;
    });
    const edges = EDGES.map(([from, to], edgeIndex) => {
        const edge = new Inputs.OCCT.DecomposedEdgeDto();
        edge.edgeIndex = edgeIndex;
        edge.vertexCoord = [CORNERS[from!]!, CORNERS[to!]!];
        edge.middlePoint = [0, 0, 0];
        return edge;
    });
    const mesh = new Inputs.OCCT.DecomposedMeshDto(faces, edges);
    mesh.pointsList = [];
    return mesh;
};

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

const meshInstancesOf = (root: pc.Entity): pc.MeshInstance[] => {
    const found: pc.MeshInstance[] = [];
    root.forEach(node => {
        if (node instanceof pc.Entity && node.render) {
            found.push(...node.render.meshInstances);
        }
    });
    return found;
};
const surfacesOf = (root: pc.Entity): pc.MeshInstance[] => meshInstancesOf(root).filter(instance => instance.mesh.primitive[0]!.type === pc.PRIMITIVE_TRIANGLES);
const linesOf = (root: pc.Entity): pc.MeshInstance[] => meshInstancesOf(root).filter(instance => instance.mesh.primitive[0]!.type === pc.PRIMITIVE_LINES);
const diffuseOf = (instance: pc.MeshInstance): string => (instance.material as pc.StandardMaterial).diffuse.toString(false);
const lineColours = (line: pc.MeshInstance, vertices: readonly number[]): string[] => {
    const colours: number[] = [];
    line.mesh.getColors(colours);
    return vertices.map(vertex => `#${colours.slice(vertex * 4, vertex * 4 + 3).map(channel => Math.round(channel).toString(16).padStart(2, "0")).join("")}`);
};
const instanceMatrices = (instance: pc.MeshInstance): number[][] => {
    const buffer = instance.instancingData!.vertexBuffer!;
    const locked = buffer.lock();
    const data = ArrayBuffer.isView(locked) ? new Float32Array(locked.buffer, locked.byteOffset, locked.byteLength / Float32Array.BYTES_PER_ELEMENT) : new Float32Array(locked);
    buffer.unlock();
    return Array.from({ length: instance.instancingCount }, (_, index) => Array.from(data.slice(index * 16, index * 16 + 16)));
};
const partEntitiesOf = (root: pc.Entity): (pc.Entity & { designPart?: { part: string; paths: string[] } })[] => root.children.filter((child): child is pc.Entity => child instanceof pc.Entity);

describe("drawing shapes with their appearance and design builds in PlayCanvas", () => {
    let app: pc.AppBase;
    let draw: Draw;
    let drawHelper: DrawHelper;
    let workerCall: Mock;

    beforeEach(() => {
        const canvas = document.createElement("canvas");
        const device = new pc.NullGraphicsDevice(canvas);
        app = new pc.AppBase(canvas);
        const appOptions = new pc.AppOptions();
        appOptions.graphicsDevice = device;
        appOptions.componentSystems = [pc.RenderComponentSystem];
        app.init(appOptions);
        const context = new Context();
        context.app = app;
        context.scene = app.root;
        const jscadWorkerManager = new JSCADWorkerManager();
        const occtWorkerManager = new OCCTWorkerManager();
        drawHelper = new DrawHelper(context, new JSCADText(jscadWorkerManager), new Vector(new MathBitByBit(), new GeometryHelper()), jscadWorkerManager, new ManifoldWorkerManager(), occtWorkerManager);
        draw = new Draw(drawHelper, context, new Tag(context));
        workerCall = vi.fn((_method: string, inputs: { shapes: unknown[] }) => Promise.resolve(inputs.shapes.map(() => boxMesh())));
        occtWorkerManager.genericCallToWorkerPromise = workerCall;
    });

    afterEach(() => {
        app.destroy();
    });

    describe("a shape with its appearance", () => {
        it("should draw one entity with a mesh instance and a material per look", async () => {
            // Arrange
            const options = { ...new Inputs.Draw.DrawOcctShapeOptions(), drawTwoSided: false, drawEdges: false };

            // Act
            const drawn = await draw.drawAnyAsync({ entity: { shape: shapeA, appearance: boxAppearance }, options });

            // Assert
            const surfaces = surfacesOf(drawn);
            expect(surfaces.map(diffuseOf)).toEqual(["#ffffff", "#000000"]);
            expect(surfaces.map(surface => surface.mesh.primitive[0]!.count)).toEqual([24, 12]);
            expect(surfaces.map(surface => [(surface.material as pc.StandardMaterial).useMetalness, (surface.material as pc.StandardMaterial).metalness])).toEqual([[true, 0], [true, 1]]);
            expect((surfaces[0]!.material as pc.StandardMaterial).gloss).toBeCloseTo(0.6);
            expect(drawn.parent).toBe(app.root);
        });

        it("should record where the triangles of each face sit in each look's mesh", async () => {
            // Arrange
            const options = { ...new Inputs.Draw.DrawOcctShapeOptions(), drawTwoSided: false, drawEdges: false };

            // Act
            const drawn = await draw.drawAnyAsync({ entity: { shape: shapeA, appearance: boxAppearance }, options });

            // Assert
            const looked = drawn.children[0] as pc.Entity & { faceRanges?: unknown };
            expect(looked.faceRanges).toEqual([
                [{ face: 2, start: 0, count: 6 }, { face: 3, start: 6, count: 6 }, { face: 4, start: 12, count: 6 }, { face: 5, start: 18, count: 6 }],
                [{ face: 0, start: 0, count: 6 }, { face: 1, start: 6, count: 6 }],
            ]);
        });

        it("should make a look glow in its emissive color at its strength", async () => {
            // Arrange
            const options = { ...new Inputs.Draw.DrawOcctShapeOptions(), drawTwoSided: false, drawEdges: false };

            // Act
            const drawn = await draw.drawAnyAsync({ entity: { shape: shapeA, appearance: { color: "#ffffff", emissive: "#3cf2ff", emissiveStrength: 2.6, faces: [] } }, options });

            // Assert
            const material = surfacesOf(drawn)[0]!.material as pc.StandardMaterial;
            expect([material.emissive.toString(false), material.emissiveIntensity]).toEqual(["#3cf2ff", 2.6]);
        });

        it("should keep the plain faces' finish for a look without its own and make a see-through look blend", async () => {
            // Arrange
            const options = { ...new Inputs.Draw.DrawOcctShapeOptions(), faceOpacity: 0.5, drawTwoSided: false, drawEdges: false };

            // Act
            const drawn = await draw.drawAnyAsync({ entity: { shape: shapeA, appearance: { color: "#ffffff", opacity: 0.5, faces: [] } }, options });

            // Assert
            const material = surfacesOf(drawn)[0]!.material as pc.StandardMaterial;
            expect([material.useMetalness, material.gloss, material.opacity, material.blendType, material.depthWrite]).toEqual([false, 0.2, 0.25, pc.BLEND_NORMAL, false]);
        });

        it("should draw the edges once, as one line, each in its color, and the back faces when asked", async () => {
            // Arrange
            const options = { ...new Inputs.Draw.DrawOcctShapeOptions(), drawTwoSided: true };
            const appearance = { color: "#ffffff", edgeColor: "#333333", faces: [], edges: [{ indexes: [2, 5], color: "#ff0000" }] };

            // Act
            const drawn = await draw.drawAnyAsync({ entity: { shape: shapeA, appearance }, options });

            // Assert
            const lines = linesOf(drawn);
            expect(lines).toHaveLength(1);
            expect(lineColours(lines[0]!, [0, 4, 10, 22])).toEqual(["#333333", "#ff0000", "#ff0000", "#333333"]);
            expect(surfacesOf(drawn)).toHaveLength(2);
        });

        it("should mark the line colors as gamma colors, as the hex colors they come from are", async () => {
            // Arrange
            const options = { ...new Inputs.Draw.DrawOcctShapeOptions(), drawFaces: false };

            // Act
            const drawn = await draw.drawAnyAsync({ entity: { shape: shapeA }, options });

            // Assert
            const material = linesOf(drawn)[0]!.material as pc.StandardMaterial;
            expect([Reflect.get(material, "vertexColorGamma"), material.emissiveVertexColor, material.useLighting]).toEqual([true, true, false]);
        });

        it("should give edges no appearance colors the shape's color moved by the edge contrast", async () => {
            // Arrange
            const options = { ...new Inputs.Draw.DrawOcctShapeOptions(), drawFaces: false, edgeColour: "#00ff00", edgeContrast: 0.4 };

            // Act
            const drawn = await draw.drawAnyAsync({ entity: { shape: shapeA, appearance: { color: "#ffffff", faces: [] } }, options });

            // Assert
            expect(lineColours(linesOf(drawn)[0]!, [0, 23])).toEqual(["#999999", "#999999"]);
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
        it("should color the faces of each group in one entity", async () => {
            // Arrange
            const mesh = { ...boxMesh(), colorGroups: { "#00ff00ff": [0, 1], "#0000ff80": [2] } };
            const options = resolveDto(Inputs.Draw.DrawOcctShapeOptions, { faceColour: "#ff0000", drawEdges: false, drawTwoSided: false }) as Resolved.Draw.DrawOcctShapeOptions;

            // Act
            const drawn = await drawHelper.handleDecomposedMesh(options, mesh, options);

            // Assert
            const surfaces = surfacesOf(drawn);
            expect(surfaces.map(diffuseOf)).toEqual(["#ff0000", "#00ff00", "#0000ff"]);
            expect((surfaces[2]!.material as pc.StandardMaterial).opacity).toBeCloseTo(128 / 255);
            expect(surfaces.map(surface => surface.mesh.primitive[0]!.count)).toEqual([18, 12, 6]);
        });
    });

    describe("a design build", () => {
        const options = { ...new Inputs.Draw.DrawOcctShapeOptions(), faceColour: "#ff0000", precision: 0.1 };

        it("should mesh each part once and draw an entity per part, a hardware instance per placement", async () => {
            // Act
            const drawn = await draw.drawAnyAsync({ entity: buildOf([0, 10], [20]), options });

            // Assert
            expect(workerCall).toHaveBeenCalledTimes(1);
            expect(workerCall.mock.calls[0]![1].shapes).toEqual([shapeA, shapeB]);
            const [box, pin] = partEntitiesOf(drawn);
            expect(box!.designPart).toEqual({ part: "box-1", paths: ["box0", "box1"] });
            expect(surfacesOf(box!).map(diffuseOf)).toEqual(["#ffffff", "#000000"]);
            expect(surfacesOf(pin!).map(diffuseOf)).toEqual(["#ff0000"]);
            expect(meshInstancesOf(box!).map(instance => instance.instancingCount)).toEqual([2, 2, 2]);
            expect(meshInstancesOf(pin!).map(instance => instance.instancingCount)).toEqual([1, 1]);
            expect(instanceMatrices(surfacesOf(box!)[0]!)[1]).toEqual(at(10));
            expect(instanceMatrices(linesOf(pin!)[0]!)[0]).toEqual(at(20));
            expect(surfacesOf(box!)[0]!.instancingData!.vertexBuffer).toBe(linesOf(box!)[0]!.instancingData!.vertexBuffer);
        });

        it("should only move the instances when redrawn with the same parts at the same paths", async () => {
            // Arrange
            const drawn = await draw.drawAnyAsync({ entity: buildOf([0, 10], [20]), options });
            const parts = partEntitiesOf(drawn);

            // Act
            const redrawn = await draw.drawAnyAsync({ entity: buildOf([5, 15], [25]), options, group: drawn });

            // Assert
            expect(redrawn).toBe(drawn);
            expect(workerCall).toHaveBeenCalledTimes(1);
            expect(partEntitiesOf(redrawn)).toEqual(parts);
            expect(instanceMatrices(surfacesOf(parts[0]!)[0]!)[1]).toEqual(at(15));
            expect(instanceMatrices(linesOf(parts[1]!)[0]!)[0]).toEqual(at(25));
        });

        it("should keep and place again what it drew for the parts that stay, and mesh and draw only a new part", async () => {
            // Arrange
            const drawn = await draw.drawAnyAsync({ entity: buildOf([0], [20]), options });
            const [box, pin] = partEntitiesOf(drawn);
            const lookMaterial = surfacesOf(box!)[0]!.material;
            const pinBuffer = surfacesOf(pin!)[0]!.instancingData!.vertexBuffer;

            // Act
            const redrawn = await draw.drawAnyAsync({ entity: buildOf([0, 10], [20], { id: "nut-3", shape: shapeC }), options, group: drawn });

            // Assert
            expect(redrawn).toBe(drawn);
            expect(workerCall).toHaveBeenCalledTimes(2);
            expect(workerCall.mock.calls[1]![1].shapes).toEqual([shapeC]);
            const after = partEntitiesOf(redrawn);
            expect([after[0] === box, after[1] === pin]).toEqual([true, true]);
            expect(after.map(part => part.designPart!.part)).toEqual(["box-1", "pin-2", "nut-3"]);
            expect(box!.designPart).toEqual({ part: "box-1", paths: ["box0", "box1"] });
            expect(meshInstancesOf(box!).map(instance => instance.instancingCount)).toEqual([2, 2, 2]);
            expect(instanceMatrices(surfacesOf(box!)[0]!)[1]).toEqual(at(10));
            expect(surfacesOf(box!)[0]!.instancingData!.vertexBuffer).toBe(linesOf(box!)[0]!.instancingData!.vertexBuffer);
            expect(surfacesOf(pin!)[0]!.instancingData!.vertexBuffer).toBe(pinBuffer);
            expect(surfacesOf(box!)[0]!.material).toBe(lookMaterial);
        });

        it("should destroy what it drew for a part that is no longer placed", async () => {
            // Arrange
            const drawn = await draw.drawAnyAsync({ entity: buildOf([0], [20]), options });
            const [box, pin] = partEntitiesOf(drawn);

            // Act
            await draw.drawAnyAsync({ entity: buildOf([0], []), options, group: drawn });

            // Assert
            expect(partEntitiesOf(drawn)).toHaveLength(1);
            expect(partEntitiesOf(drawn)[0]).toBe(box);
            expect(pin!.parent).toBeNull();
        });

        it("should mesh and draw again only a part whose shape changed under the same id", async () => {
            // Arrange
            const drawn = await draw.drawAnyAsync({ entity: buildOf([0], [20]), options });
            const [box, pin] = partEntitiesOf(drawn);
            const edited = buildOf([0], [20]);
            edited.parts[1] = partOf("pin-2", shapeC, undefined, "pin-2-edited");

            // Act
            const redrawn = await draw.drawAnyAsync({ entity: edited, options, group: drawn });

            // Assert
            expect(redrawn).toBe(drawn);
            expect(workerCall).toHaveBeenCalledTimes(2);
            expect(workerCall.mock.calls[1]![1].shapes).toEqual([shapeC]);
            const after = partEntitiesOf(redrawn);
            expect([after.includes(box!), after.includes(pin!), pin!.parent]).toEqual([true, false, null]);
            expect(after.map(part => part.designPart!.part)).toEqual(["box-1", "pin-2"]);
        });

        it("should draw again a part whose appearance changed without meshing it again, and every part when the options change", async () => {
            // Arrange
            const drawn = await draw.drawAnyAsync({ entity: buildOf([0], [20]), options });
            const [box, pin] = partEntitiesOf(drawn);
            const restyled = buildOf([0], [20]);
            restyled.parts[1] = partOf("pin-2", shapeB, { color: "#00ff00", faces: [] });

            // Act
            await draw.drawAnyAsync({ entity: restyled, options, group: drawn });
            const afterLook = partEntitiesOf(drawn);
            const restyledColours = surfacesOf(afterLook[1]!).map(diffuseOf);
            await draw.drawAnyAsync({ entity: restyled, options: { ...options, faceColour: "#0000ff" }, group: drawn });

            // Assert
            expect([afterLook.includes(box!), afterLook.includes(pin!)]).toEqual([true, false]);
            expect(restyledColours).toEqual(["#00ff00"]);
            expect(partEntitiesOf(drawn).some(part => afterLook.includes(part))).toBe(false);
            expect(workerCall).toHaveBeenCalledTimes(1);
        });

        it("should mesh a part once for every build it draws, a preview beside the model say, until the meshing changes", async () => {
            // Arrange
            const first = await draw.drawAnyAsync({ entity: buildOf([0], [20]), options });

            // Act
            const second = await draw.drawAnyAsync({ entity: buildOf([0, 10], [20]), options });
            await draw.drawAnyAsync({ entity: buildOf([0], [20]), options: { ...options, precision: 0.5 } });

            // Assert
            expect(second).not.toBe(first);
            expect(workerCall).toHaveBeenCalledTimes(2);
            expect(workerCall.mock.calls[1]![1].shapes).toEqual([shapeA, shapeB]);
        });

        it("should mesh and draw every part again when the precision changes", async () => {
            // Arrange
            const drawn = await draw.drawAnyAsync({ entity: buildOf([0], [20]), options });
            const before = partEntitiesOf(drawn);

            // Act
            await draw.drawAnyAsync({ entity: buildOf([0], [20]), options: { ...options, precision: 0.5 }, group: drawn });

            // Assert
            expect(workerCall).toHaveBeenCalledTimes(2);
            expect(workerCall.mock.calls[1]![1].shapes).toEqual([shapeA, shapeB]);
            expect(partEntitiesOf(drawn).some(part => before.includes(part))).toBe(false);
        });

        it("should color the edges of each part as its appearance says, and draw them again when the edge contrast changes", async () => {
            // Arrange
            const build = buildOf([0, 10], [20]);
            build.parts[0] = partOf("box-1", shapeA, { ...boxAppearance, edgeColor: "#333333", edges: [{ indexes: [0], color: "#0000ff" }] });
            const drawn = await draw.drawAnyAsync({ entity: build, options: { ...options, edgeColour: "#00ff00" } });
            const [boxLine, pinLine] = linesOf(drawn);
            const coloured = [lineColours(boxLine!, [0, 2]), lineColours(pinLine!, [0])];

            // Act
            await draw.drawAnyAsync({ entity: build, options: { ...options, edgeColour: "#00ff00", edgeContrast: 0.5 }, group: drawn });

            // Assert
            expect(coloured).toEqual([["#0000ff", "#333333"], ["#00ff00"]]);
            expect(workerCall).toHaveBeenCalledTimes(1);
            expect(linesOf(drawn)).not.toContain(boxLine);
            expect(lineColours(linesOf(drawn)[1]!, [0])).toEqual(["#ff8080"]);
        });

        it("should place each part of a build without components once, at the origin", async () => {
            // Arrange
            const partDocument: Build = { parts: [partOf("box-1", shapeA, boxAppearance)], report: [], issues: [], parameters: {}, units: { length: "mm", angle: "deg" }, up: "y" };

            // Act
            const drawn = await draw.drawAnyAsync({ entity: partDocument, options });

            // Assert
            const surface = surfacesOf(drawn)[0]!;
            expect(surface.instancingCount).toBe(1);
            expect(instanceMatrices(surface)[0]).toEqual(at(0));
        });

        it("should draw no faces and no edges when the options turn them off", async () => {
            // Act
            const drawn = await draw.drawAnyAsync({ entity: buildOf([0], [20]), options: { ...options, drawFaces: false, drawEdges: false } });

            // Assert
            expect(meshInstancesOf(drawn)).toHaveLength(0);
        });
    });
});
