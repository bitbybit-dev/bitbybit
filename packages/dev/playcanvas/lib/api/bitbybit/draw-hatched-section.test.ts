import { describe, it, expect, beforeEach, afterEach, vi, type Mock } from "vitest";
import * as pc from "playcanvas";
import { Tag } from "@bitbybit-dev/core";
import type * as Models from "@bitbybit-dev/core/lib/api/models";
import { GeometryHelper, MathBitByBit, Vector } from "@bitbybit-dev/base";
import { JSCADText, JSCADWorkerManager } from "@bitbybit-dev/jscad-worker";
import { ManifoldWorkerManager } from "@bitbybit-dev/manifold-worker";
import { OCCTWorkerManager } from "@bitbybit-dev/occt-worker";
import { Context } from "../context";
import { DrawHelper } from "../draw-helper";
import * as Inputs from "../inputs";
import { Draw } from "./draw";

type Section = Models.OCCT.HatchedSection<Inputs.OCCT.TopoDSShapePointer>;
type MetaEntity = pc.Entity & { bitbybitMeta?: Inputs.Draw.BitByBitMeta };

const plate = (pattern: Inputs.IO.hatchPatternEnum = Inputs.IO.hatchPatternEnum.ansi31): Inputs.IO.DrawingHatchDto => ({
    boundaries: [
        { segments: [{ points: [[0, 0], [10, 0], [10, 10], [0, 10]], closed: true }] },
        { segments: [{ center: [5, 5], radius: 2 }] },
    ],
    pattern,
    angle: 45,
    spacing: 1,
});

const section = (pattern?: Inputs.IO.hatchPatternEnum): Section => ({
    frame: { origin: [0, 0, 3], normal: [0, 0, 1], direction: [1, 0, 0] },
    shapes: [{ angle: 45, caps: [{ face: { hash: 1, type: "occ-shape" }, lines: { hash: 2, type: "occ-shape" }, hatch: plate(pattern) }] }],
});

const named = (root: pc.GraphNode, part: string): pc.Entity[] => root.find(node => node.name.includes(`-${part}-`)) as pc.Entity[];
const linesOf = (root: pc.GraphNode): pc.Entity[] => named(root, "lines");
const meshOf = (entity: pc.Entity): pc.Mesh => entity.render!.meshInstances[0]!.mesh!;
const heightsOf = (entity: pc.Entity): number[] => {
    const positions: number[] = [];
    meshOf(entity).getPositions(positions);
    return [...new Set(positions.filter((_, at) => at % 3 === 2).map(value => Math.round(value * 1e6) / 1e6))];
};
const firstColourOf = (entity: pc.Entity): number[] => {
    const colours: number[] = [];
    meshOf(entity).getColors(colours);
    return colours.slice(0, 3);
};

describe("drawing a hatched section in PlayCanvas", () => {
    let app: pc.AppBase;
    let draw: Draw;
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
        const drawHelper = new DrawHelper(context, new JSCADText(jscadWorkerManager), new Vector(new MathBitByBit(), new GeometryHelper()), jscadWorkerManager, new ManifoldWorkerManager(), occtWorkerManager);
        draw = new Draw(drawHelper, context, new Tag(context));
        workerCall = vi.fn();
        occtWorkerManager.genericCallToWorkerPromise = workerCall;
    });

    afterEach(() => {
        app.destroy();
    });

    it("should fill the cut faces in the face color, unlit and two-sided, and draw the hatch lines and the outlines in their colors, without the worker", async () => {
        // Arrange
        const options = { ...new Inputs.Draw.DrawHatchedSectionOptions(), faceColour: "#3366ff", edges: { edgeColour: "#112233" }, hatchColour: "#ff8800" };

        // Act
        const drawn = await draw.drawAnyAsync({ entity: section(), options }) as MetaEntity;

        // Assert
        expect(drawn.parent).toBe(app.root);
        const [faces] = named(drawn, "sectionFaces");
        const material = faces!.render!.meshInstances[0]!.material as pc.StandardMaterial;
        expect(material.useLighting).toBe(false);
        expect(material.cull).toBe(pc.CULLFACE_NONE);
        expect([material.emissive.r, material.emissive.g, material.emissive.b]).toEqual([0x33 / 255, 0x66 / 255, 1]);
        const [lines, outlines] = linesOf(drawn);
        expect(meshOf(lines!).vertexBuffer.numVertices).toBeGreaterThan(20);
        expect(firstColourOf(lines!)).toEqual([0xff, 0x88, 0x00]);
        expect(firstColourOf(outlines!)).toEqual([0x11, 0x22, 0x33]);
        expect(named(drawn, "sectionInk")).toEqual([]);
        expect(drawn.bitbybitMeta!.type).toBe(Inputs.Draw.drawingTypes.occtHatchedSection);
        expect(workerCall).not.toHaveBeenCalled();
    });

    it("should give the section its own defaults when drawn with the options of a plain shape, which it does not read", async () => {
        // Arrange
        const options = draw.optionsOcctShape({ edgeColour: "#112233" });

        // Act
        const drawn = await draw.drawAnyAsync({ entity: section(), options }) as pc.Entity;

        // Assert
        const [lines, outlines] = linesOf(drawn);
        expect(firstColourOf(lines!)).toEqual([0, 0, 0]);
        expect(firstColourOf(outlines!)).toEqual([0, 0, 0]);
    });

    it("should draw with the options optionsHatchedSection builds, every one it is not given at its default", async () => {
        // Arrange
        const options = draw.optionsHatchedSection({ hatchColour: "#ff8800", drawEdges: false });

        // Act
        const drawn = await draw.drawAnyAsync({ entity: section(), options }) as pc.Entity;

        // Assert
        expect(options.hatchWidth).toBe(1);
        expect(options.faceColour).toBe("#ffffff");
        const lines = linesOf(drawn);
        expect(lines).toHaveLength(1);
        expect(firstColourOf(lines[0]!)).toEqual([0xff, 0x88, 0x00]);
    });

    it("should lift the fill a thousandth of the section's size over the frame's plane, the lines twice that", async () => {
        // Act
        const drawn = await draw.drawAnyAsync({ entity: section() }) as pc.Entity;

        // Assert
        expect(heightsOf(named(drawn, "sectionFaces")[0]!)).toEqual([3.01]);
        expect(heightsOf(linesOf(drawn)[0]!)).toEqual([3.02]);
    });

    it("should leave out the outlines without edges, keeping the fill and the hatch lines", async () => {
        // Arrange
        const options = { ...new Inputs.Draw.DrawHatchedSectionOptions(), drawEdges: false };

        // Act
        const drawn = await draw.drawAnyAsync({ entity: section(), options }) as pc.Entity;

        // Assert
        expect(named(drawn, "sectionFaces")).toHaveLength(1);
        expect(linesOf(drawn)).toHaveLength(1);
    });

    it("should fill a solid hatch in the hatch color with no pattern lines", async () => {
        // Arrange
        const options = { ...new Inputs.Draw.DrawHatchedSectionOptions(), hatchColour: "#00aa00", drawEdges: false };

        // Act
        const drawn = await draw.drawAnyAsync({ entity: section(Inputs.IO.hatchPatternEnum.solid), options }) as pc.Entity;

        // Assert
        const [ink] = named(drawn, "sectionInk");
        const material = ink!.render!.meshInstances[0]!.material as pc.StandardMaterial;
        expect([material.emissive.r, material.emissive.g, material.emissive.b]).toEqual([0, 0xaa / 255, 0]);
        expect(named(drawn, "sectionFaces")).toEqual([]);
        expect(linesOf(drawn)).toEqual([]);
    });

    it("should cast no shadow from anything it draws", async () => {
        // Act
        const drawn = await draw.drawAnyAsync({ entity: section() }) as pc.Entity;

        // Assert
        const rendered = drawn.find(node => (node as pc.Entity).render !== undefined) as pc.Entity[];
        expect(rendered.length).toBe(3);
        rendered.forEach(entity => expect(entity.render!.castShadows).toBe(false));
    });
});
