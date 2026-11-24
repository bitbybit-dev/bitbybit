import { describe, it, expect, beforeEach, vi, type Mock } from "vitest";
import { Color, DoubleSide, Group, MeshBasicMaterial, Scene, type Mesh, type Object3D } from "three";
import { LineSegments2 } from "three/examples/jsm/lines/LineSegments2.js";
import { Tag } from "@bitbybit-dev/core";
import type * as Models from "@bitbybit-dev/core/lib/api/models";
import { GeometryHelper, MathBitByBit, Vector } from "@bitbybit-dev/base";
import { JSCADText, JSCADWorkerManager } from "@bitbybit-dev/jscad-worker";
import { ManifoldWorkerManager } from "@bitbybit-dev/manifold-worker";
import { OCCTWorkerManager } from "@bitbybit-dev/occt-worker/lib";
import { Context } from "../context";
import { DrawHelper } from "../draw-helper";
import * as Inputs from "../inputs";
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

const named = (root: Object3D, part: string): Mesh[] => {
    const found: Mesh[] = [];
    root.traverse(child => { if (child.name.includes(`-${part}-`)) { found.push(child as Mesh); } });
    return found;
};
const linesOf = (root: Object3D): LineSegments2[] => root.children.filter((child): child is LineSegments2 => child instanceof LineSegments2);
const segmentsOf = (line: LineSegments2): number => line.geometry.attributes["instanceStart"]!.count;
const colourOf = (line: LineSegments2): number[] => Array.from((line.geometry.attributes["instanceColorStart"]!.array as Float32Array).slice(0, 3)).map(value => Math.round(value * 1e4) / 1e4);
const rgbOf = (hex: string): number[] => {
    const colour = new Color(hex);
    return [colour.r, colour.g, colour.b].map(value => Math.round(value * 1e4) / 1e4);
};
const heightsOf = (mesh: Mesh): number[] => [...new Set(Array.from(mesh.geometry.attributes["position"]!.array as Float32Array).filter((_, at) => at % 3 === 2).map(value => Math.round(value * 1e6) / 1e6))];

describe("drawing a hatched section in three.js", () => {
    let scene: Scene;
    let draw: Draw;
    let workerCall: Mock;

    beforeEach(() => {
        const context = new Context();
        scene = new Scene();
        context.scene = scene;
        const jscadWorkerManager = new JSCADWorkerManager();
        const occtWorkerManager = new OCCTWorkerManager();
        const drawHelper = new DrawHelper(context, new JSCADText(jscadWorkerManager), new Vector(new MathBitByBit(), new GeometryHelper()), jscadWorkerManager, new ManifoldWorkerManager(), occtWorkerManager);
        draw = new Draw(drawHelper, context, new Tag(context));
        workerCall = vi.fn();
        occtWorkerManager.genericCallToWorkerPromise = workerCall;
    });

    it("should fill the cut faces in the face color, unlit and two-sided, and draw the hatch lines and the outlines in their colors, without the worker", async () => {
        // Arrange
        const options = { ...new Inputs.Draw.DrawHatchedSectionOptions(), faceColour: "#3366ff", edges: { edgeColour: "#112233" }, hatchColour: "#ff8800", hatchWidth: 6 };

        // Act
        const drawn = await draw.drawAnyAsync({ entity: section(), options });

        // Assert
        expect(drawn).toBeInstanceOf(Group);
        expect(drawn.parent).toBe(scene);
        const [faces] = named(drawn, "sectionFaces");
        const material = faces!.material as MeshBasicMaterial;
        expect(material).toBeInstanceOf(MeshBasicMaterial);
        expect(material.side).toBe(DoubleSide);
        expect(material.color.getHexString()).toBe("3366ff");
        const [lines, outlines] = linesOf(drawn);
        expect(colourOf(lines!)).toEqual(rgbOf("#ff8800"));
        expect(lines!.material.linewidth).toBeCloseTo(2, 12);
        expect(segmentsOf(lines!)).toBeGreaterThan(10);
        expect(colourOf(outlines!)).toEqual(rgbOf("#112233"));
        expect(named(drawn, "sectionInk")).toEqual([]);
        expect(drawn.userData["type"]).toBe(Inputs.Draw.drawingTypes.occtHatchedSection);
        expect(workerCall).not.toHaveBeenCalled();
    });

    it("should give the section its own defaults when drawn with the options of a plain shape, which it does not read", async () => {
        // Arrange
        const options = draw.optionsOcctShape({ edgeColour: "#112233" });

        // Act
        const drawn = await draw.drawAnyAsync({ entity: section(), options });

        // Assert
        const [lines, outlines] = linesOf(drawn);
        expect(colourOf(lines!)).toEqual(rgbOf("#000000"));
        expect(colourOf(outlines!)).toEqual(rgbOf("#000000"));
    });

    it("should draw with the options optionsHatchedSection builds, every one it is not given at its default", async () => {
        // Arrange
        const options = draw.optionsHatchedSection({ hatchColour: "#ff8800", drawEdges: false });

        // Act
        const drawn = await draw.drawAnyAsync({ entity: section(), options });

        // Assert
        expect(options.hatchWidth).toBe(1);
        expect(options.faceColour).toBe("#ffffff");
        const lines = linesOf(drawn);
        expect(lines).toHaveLength(1);
        expect(colourOf(lines[0]!)).toEqual(rgbOf("#ff8800"));
    });

    it("should lift the fill a thousandth of the section's size over the frame's plane", async () => {
        // Act
        const drawn = await draw.drawAnyAsync({ entity: section() });

        // Assert
        expect(heightsOf(named(drawn, "sectionFaces")[0]!)).toEqual([3.01]);
    });

    it("should leave out the outlines without edges, keeping the fill and the hatch lines", async () => {
        // Arrange
        const options = { ...new Inputs.Draw.DrawHatchedSectionOptions(), drawEdges: false };

        // Act
        const drawn = await draw.drawAnyAsync({ entity: section(), options });

        // Assert
        expect(named(drawn, "sectionFaces")).toHaveLength(1);
        expect(linesOf(drawn)).toHaveLength(1);
    });

    it("should fill a solid hatch in the hatch color with no pattern lines", async () => {
        // Arrange
        const options = { ...new Inputs.Draw.DrawHatchedSectionOptions(), hatchColour: "#00aa00", drawEdges: false };

        // Act
        const drawn = await draw.drawAnyAsync({ entity: section(Inputs.IO.hatchPatternEnum.solid), options });

        // Assert
        const [ink] = named(drawn, "sectionInk");
        expect((ink!.material as MeshBasicMaterial).color.getHexString()).toBe("00aa00");
        expect(named(drawn, "sectionFaces")).toEqual([]);
        expect(linesOf(drawn)).toEqual([]);
    });

    it("should cast no shadow", async () => {
        // Act
        const drawn = await draw.drawAnyAsync({ entity: section() });

        // Assert
        const casting: Object3D[] = [];
        drawn.traverse(child => { if (child.castShadow) { casting.push(child); } });
        expect(casting).toEqual([]);
    });
});
