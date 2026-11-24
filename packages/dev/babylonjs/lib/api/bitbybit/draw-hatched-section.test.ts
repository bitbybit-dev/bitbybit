import { describe, it, expect, beforeEach, afterEach, vi, type Mock } from "vitest";
import * as BABYLON from "@babylonjs/core";
import { Tag } from "@bitbybit-dev/core";
import type * as Models from "@bitbybit-dev/core/lib/api/models";
import { GeometryHelper, MathBitByBit, Vector } from "@bitbybit-dev/base";
import { JSCADText, JSCADWorkerManager } from "@bitbybit-dev/jscad-worker";
import { ManifoldWorkerManager } from "@bitbybit-dev/manifold-worker";
import { OCCTWorkerManager } from "@bitbybit-dev/occt-worker";
import { Context } from "../context";
import { DrawHelper } from "../draw-helper";
import * as Inputs from "../inputs";
import { BabylonNode } from "./babylon/node";
import { Draw } from "./draw";

type Section = Models.OCCT.HatchedSection<Inputs.OCCT.TopoDSShapePointer>;

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

const named = (drawn: BABYLON.Node, part: string): BABYLON.Mesh[] => drawn.getChildMeshes(false).filter((child): child is BABYLON.Mesh => child.name.includes(`-${part}-`));
const greasedOf = (drawn: BABYLON.Node): BABYLON.GreasedLineMesh[] => drawn.getChildMeshes(true).filter((child): child is BABYLON.GreasedLineMesh => child instanceof BABYLON.GreasedLineMesh);
const heightsOf = (mesh: BABYLON.Mesh): number[] => [...new Set(Array.from(mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind)!).filter((_, at) => at % 3 === 2).map(value => Math.round(value * 1e9) / 1e9))];

describe("drawing a hatched section in BabylonJS", () => {
    let engine: BABYLON.NullEngine;
    let scene: BABYLON.Scene;
    let draw: Draw;
    let workerCall: Mock;

    beforeEach(() => {
        engine = new BABYLON.NullEngine();
        scene = new BABYLON.Scene(engine);
        scene.metadata = { shadowGenerators: [] };
        const context = new Context();
        context.scene = scene;
        const jscadWorkerManager = new JSCADWorkerManager();
        const occtWorkerManager = new OCCTWorkerManager();
        const drawHelper = new DrawHelper(context, new JSCADText(jscadWorkerManager), new Vector(new MathBitByBit(), new GeometryHelper()), jscadWorkerManager, new ManifoldWorkerManager(), occtWorkerManager);
        draw = new Draw(drawHelper, new BabylonNode(context, drawHelper), new Tag(context), context);
        workerCall = vi.fn();
        occtWorkerManager.genericCallToWorkerPromise = workerCall;
    });

    afterEach(() => {
        scene.dispose();
        engine.dispose();
    });

    it("should fill the cut faces in the face color, unlit and two-sided, and draw the hatch lines and the outlines as greased lines in their colors, without the worker", async () => {
        // Arrange
        const options = { ...new Inputs.Draw.DrawHatchedSectionOptions(), faceColour: "#3366ff", edges: { edgeColour: "#112233" }, hatchColour: "#ff8800", hatchWidth: 3 };

        // Act
        const drawn = await draw.drawAnyAsync({ entity: section(), options });

        // Assert
        const [faces] = named(drawn, "sectionFaces");
        const material = faces!.material as BABYLON.StandardMaterial;
        expect(material.disableLighting).toBe(true);
        expect(material.backFaceCulling).toBe(false);
        expect(material.emissiveColor.toHexString().toLowerCase()).toBe("#3366ff");
        const [lines, outlines] = greasedOf(drawn);
        expect(lines!.greasedLineMaterial!.color!.toHexString().toLowerCase()).toBe("#ff8800");
        expect(lines!.greasedLineMaterial!.width).toBeCloseTo(0.03, 12);
        expect(lines!.metadata.linesForRenderLengths.length).toBeGreaterThan(10);
        expect(outlines!.greasedLineMaterial!.color!.toHexString().toLowerCase()).toBe("#112233");
        expect(outlines!.metadata.linesForRenderLengths).toHaveLength(2);
        expect(named(drawn, "sectionInk")).toEqual([]);
        expect(drawn.metadata.type).toBe(Inputs.Draw.drawingTypes.occtHatchedSection);
        expect(workerCall).not.toHaveBeenCalled();
    });

    it("should give the section its own defaults when drawn with the options of a plain shape, which it does not read", async () => {
        // Arrange
        const options = draw.optionsOcctShape({ edgeColour: "#112233" });

        // Act
        const drawn = await draw.drawAnyAsync({ entity: section(), options });

        // Assert
        const [lines, outlines] = greasedOf(drawn);
        expect(lines!.greasedLineMaterial!.color!.toHexString().toLowerCase()).toBe("#000000");
        expect(lines!.greasedLineMaterial!.width).toBeCloseTo(0.01, 12);
        expect(outlines!.greasedLineMaterial!.color!.toHexString().toLowerCase()).toBe("#000000");
    });

    it("should draw with the options optionsHatchedSection builds, every one it is not given at its default", async () => {
        // Arrange
        const options = draw.optionsHatchedSection({ hatchColour: "#ff8800", drawEdges: false });

        // Act
        const drawn = await draw.drawAnyAsync({ entity: section(), options });

        // Assert
        expect(options.hatchWidth).toBe(1);
        expect(options.faceColour).toBe("#ffffff");
        const lines = greasedOf(drawn);
        expect(lines).toHaveLength(1);
        expect(lines[0]!.greasedLineMaterial!.color!.toHexString().toLowerCase()).toBe("#ff8800");
    });

    it("should draw a section again over its mesh with the options it was drawn with, which it keeps as they were given", async () => {
        // Arrange
        const options = draw.optionsHatchedSection({ faceColour: "#3366ff", hatchColour: "#ff8800" });
        const first = await draw.drawAnyAsync({ entity: section(), options });

        // Act
        const again = await draw.drawAnyAsync({ entity: section(), babylonMesh: first });

        // Assert
        expect(first.metadata.options).toEqual(options);
        const [faces] = named(again, "sectionFaces");
        expect((faces!.material as BABYLON.StandardMaterial).emissiveColor.toHexString().toLowerCase()).toBe("#3366ff");
        expect(greasedOf(again)[0]!.greasedLineMaterial!.color!.toHexString().toLowerCase()).toBe("#ff8800");
    });

    it("should lift the fill a thousandth of the section's size over the frame's plane, the lines twice that", async () => {
        // Act
        const drawn = await draw.drawAnyAsync({ entity: section() });

        // Assert
        expect(heightsOf(named(drawn, "sectionFaces")[0]!)).toEqual([3.01]);
        const points = greasedOf(drawn)[0]!.metadata.linesForRenderLengths as number[];
        expect(points.length).toBeGreaterThan(0);
    });

    it("should leave out the outlines without edges, keeping the fill and the hatch lines", async () => {
        // Arrange
        const options = { ...new Inputs.Draw.DrawHatchedSectionOptions(), drawEdges: false };

        // Act
        const drawn = await draw.drawAnyAsync({ entity: section(), options });

        // Assert
        expect(named(drawn, "sectionFaces")).toHaveLength(1);
        expect(greasedOf(drawn)).toHaveLength(1);
    });

    it("should fill a solid hatch in the hatch color with no pattern lines", async () => {
        // Arrange
        const options = { ...new Inputs.Draw.DrawHatchedSectionOptions(), hatchColour: "#00aa00", drawEdges: false };

        // Act
        const drawn = await draw.drawAnyAsync({ entity: section(Inputs.IO.hatchPatternEnum.solid), options });

        // Assert
        const [ink] = named(drawn, "sectionInk");
        expect((ink!.material as BABYLON.StandardMaterial).emissiveColor.toHexString().toLowerCase()).toBe("#00aa00");
        expect(named(drawn, "sectionFaces")).toEqual([]);
        expect(greasedOf(drawn)).toEqual([]);
    });

    it("should cast no shadow and free its materials with it", async () => {
        // Arrange
        const light = new BABYLON.DirectionalLight("sun", new BABYLON.Vector3(0, -1, 0), scene);
        const shadows = new BABYLON.ShadowGenerator(256, light);
        scene.metadata.shadowGenerators.push(shadows);
        const before = scene.materials.length;

        // Act
        const drawn = await draw.drawAnyAsync({ entity: section() });
        const casters = shadows.getShadowMap()!.renderList!.length;
        drawn.dispose();

        // Assert
        expect(casters).toBe(0);
        expect(scene.materials.length).toBe(before);
    });
});
