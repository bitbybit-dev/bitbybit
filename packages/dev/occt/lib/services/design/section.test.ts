import { describe, it, expect, beforeAll, vi } from "vitest";
import createBitbybitOcct from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import type { TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTService } from "../../occ-service";
import type * as Models from "../../api/models";
import type * as Inputs from "../../api/inputs";
import { InputError } from "@bitbybit-dev/base";

const PLATE_ID = "33333333-3333-4333-8333-333333333333";
const POST_ID = "44444444-4444-4444-8444-444444444444";
const ACROSS_X: Inputs.Base.Frame = { origin: [10, 0, 0], normal: [1, 0, 0], direction: [0, 1, 0] };
const MIRRORED_ABOUT_10: Inputs.Base.TransformMatrix = [-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 20, 0, 0, 1];
const CLOSE = 6;

const square = (id: string, width: number, depth: number, start: [number, number] = [0, 0]): Models.OCCT.DesignSketchFeature => ({
    id,
    type: "sketch",
    on: { plane: "XY" },
    start,
    pen: [{ type: "hLine", length: width }, { type: "vLine", length: depth }, { type: "hLine", length: -width }, { type: "close" }],
});

const plate: Models.OCCT.DesignPartDocument = {
    schemaVersion: 1,
    id: PLATE_ID,
    features: [square("base", 40, 20), { id: "plate", type: "extrude", profile: "base", distance: 10 }],
    parts: [{ id: "plate", body: "plate", appearance: { color: "#336699", faces: [{ faces: { of: "plate", role: "end", count: 1 }, color: "#ff0000" }] } }],
};

const post: Models.OCCT.DesignPartDocument = {
    schemaVersion: 1,
    id: POST_ID,
    features: [square("base", 4, 4, [-2, -2]), { id: "post", type: "extrude", profile: "base", distance: 6 }],
    parts: [{ id: "post", body: "post" }],
};

const onTop = (id: string, x: number, y: number, direction: Inputs.Base.Vector3 = [1, 0, 0]): Models.OCCT.DesignComponent => ({
    id,
    source: { document: POST_ID, part: "post" },
    at: { origin: [x, y, 10], normal: [0, 0, 1], direction },
});

const stand: Models.OCCT.DesignAssemblyDocument = {
    schemaVersion: 1,
    kind: "assembly",
    components: [
        { id: "plate", source: { document: PLATE_ID, part: "plate" } },
        onTop("front", 10, 5),
        onTop("back", 10, 15),
        onTop("turned", 11, 10, [0, 1, 0]),
        onTop("behind", 3, 10),
        onTop("ahead", 30, 10),
    ],
};

describe("sections of a design build", () => {
    let occt: OCCTService;

    beforeAll(async () => {
        const kernel = await createBitbybitOcct();
        occt = new OCCTService(kernel, new OccHelper(new VectorHelperService(), new ShapesHelperService(), kernel));
    }, 120_000);

    const placedBox = (shape: TopoDS_Shape, world?: Inputs.Base.TransformMatrix): Inputs.OCCT.BoundingBoxPropsDto => {
        const placed = world === undefined ? shape : occt.transforms.transformByMatrix({ shape, transformation: world });
        const box = occt.operations.boundingBoxOfShape({ shape: placed });
        if (placed !== shape) {
            placed.delete();
        }
        return box;
    };

    const freed = (section: Models.OCCT.DesignSection<TopoDS_Shape>): void => {
        section.parts.forEach(part => { part.shape.delete(); });
    };

    it("should cap a part document where the plane passes through it, in the part's colour without its face colours", () => {
        // Arrange
        const built = occt.design.build({ document: plate });

        // Act
        const section = occt.design.section({ build: built, frame: ACROSS_X });

        // Assert
        const [cap] = section.parts;
        expect(section.parts.map(part => [part.kind, part.from])).toEqual([["cap", "plate"]]);
        expect(section.components).toBeUndefined();
        expect(cap?.area).toBeCloseTo(200, CLOSE);
        expect(cap?.appearance).toEqual({ color: "#336699", faces: [] });
        expect(placedBox(cap!.shape).min[0]).toBeCloseTo(10, CLOSE);
        expect(placedBox(cap!.shape).max[0]).toBeCloseTo(10, CLOSE);
        freed(section);
    });

    it("should share one cap between the placements that meet a part the same way, and place every cap where the plane is", () => {
        // Arrange
        const built = occt.design.build({ document: stand, documents: [plate, post] });

        // Act
        const section = occt.design.section({ build: built, frame: ACROSS_X });

        // Assert
        const placed = (path: string): Models.OCCT.DesignSectionComponent[] => section.components!.filter(component => component.path === path);
        const capOf = (path: string): Models.OCCT.DesignSectionPart<TopoDS_Shape> => section.parts.find(part => part.id === placed(path)[0]?.part)!;
        expect(section.parts.map(part => part.kind)).toEqual(["cap", "cap", "cap"]);
        expect(capOf("front")).toBe(capOf("back"));
        expect(capOf("turned")).not.toBe(capOf("front"));
        expect([capOf("plate").area, capOf("front").area, capOf("turned").area].map(area => Number(area?.toFixed(CLOSE)))).toEqual([200, 24, 24]);
        expect([placed("behind"), placed("ahead")]).toEqual([[], []]);
        expect(section.components!.map(component => placedBox(capOf(component.path).shape, component.world).min[0])).toEqual(section.components!.map(() => expect.closeTo(10, CLOSE)));
        freed(section);
    });

    it("should give, when asked to cut, the pieces behind the plane and the parts wholly behind it, those keeping their own hash", () => {
        // Arrange
        const built = occt.design.build({ document: stand, documents: [plate, post] });
        const postPart = built.parts.find(part => part.name === "post")!;

        // Act
        const section = occt.design.section({ build: built, frame: ACROSS_X, cut: true });

        // Assert
        const kept = section.parts.filter(part => part.kind !== "cap");
        expect(kept.map(part => [part.kind, Number(part.volume?.toFixed(CLOSE))])).toEqual([["piece", 2000], ["piece", 48], ["piece", 24], ["whole", 96]]);
        expect(kept.find(part => part.kind === "whole")?.shapeHash).toBe(postPart.shapeHash);
        expect(section.components!.filter(component => component.part === kept[3]?.id).map(component => component.path)).toEqual(["behind"]);
        expect(section.components!.some(component => component.path === "ahead")).toBe(false);
        freed(section);
    });

    it("should keep the side the world plane keeps through a mirrored placement", () => {
        // Arrange
        const built = occt.design.build({ document: plate });
        const mirrored = { parts: built.parts, components: [{ path: "mirror", part: "plate", world: MIRRORED_ABOUT_10 }] };

        // Act
        const section = occt.design.section({ build: mirrored, frame: ACROSS_X, cut: true });

        // Assert
        const piece = section.parts.find(part => part.kind === "piece")!;
        expect(piece.volume).toBeCloseTo(6000, CLOSE);
        expect(placedBox(piece.shape, MIRRORED_ABOUT_10).max[0]).toBeCloseTo(10, CLOSE);
        freed(section);
    });

    it("should make nothing again for the same cut, giving the same parts and hashes after the first were freed", () => {
        // Arrange
        const built = occt.design.build({ document: stand, documents: [plate, post] });
        const first = occt.design.section({ build: built, frame: ACROSS_X, cut: true });
        const firstParts = first.parts.map(part => [part.id, part.shapeHash, part.area ?? part.volume]);
        freed(first);
        const slice = vi.spyOn(occt.operations, "sliceByFrames");
        const split = vi.spyOn(occt.operations, "splitByFrame");

        // Act
        const second = occt.design.section({ build: built, frame: ACROSS_X, cut: true });

        // Assert
        expect(second.parts.map(part => [part.id, part.shapeHash, part.area ?? part.volume])).toEqual(firstParts);
        expect(slice).not.toHaveBeenCalled();
        expect(split).not.toHaveBeenCalled();
        freed(second);
        slice.mockRestore();
        split.mockRestore();
    });

    it("should give nothing for a plane that misses every part, and a cap with nothing behind it for the part it just enters", () => {
        // Arrange
        const built = occt.design.build({ document: plate });

        // Act
        const beyond = occt.design.section({ build: built, frame: { ...ACROSS_X, origin: [-5, 0, 0] }, cut: true });
        const before = occt.design.section({ build: built, frame: { ...ACROSS_X, origin: [45, 0, 0] }, cut: true });

        // Assert
        expect(beyond.parts).toEqual([]);
        expect(before.parts.map(part => [part.kind, Number(part.volume?.toFixed(CLOSE))])).toEqual([["whole", 8000]]);
        freed(before);
    });

    it("should cap only solids, cutting a part that mixes a solid with a sheet through its solid and a sheet alone into its half", () => {
        // Arrange
        const sheet = occt.shapes.face.createRectangleFace({ width: 40, length: 20, center: [20, 0, 10], direction: [0, 1, 0] });
        const box = occt.shapes.solid.createBox({ width: 4, length: 4, height: 4, center: [10, 0, 0] });
        const mixed = occt.shapes.compound.makeCompound({ shapes: [sheet, box] });
        const parts = [{ id: "sheet", shape: sheet, shapeHash: "sheet" }, { id: "mixed", shape: mixed, shapeHash: "mixed" }];

        // Act
        const section = occt.design.section({ build: { parts }, frame: ACROSS_X, cut: true });

        // Assert
        expect(section.parts.map(part => [part.from, part.kind, part.area ?? part.volume])).toEqual([
            ["sheet", "piece", undefined],
            ["mixed", "cap", expect.closeTo(16, CLOSE)],
            ["mixed", "piece", expect.closeTo(32, CLOSE)],
        ]);
        expect(occt.shapes.face.getFaceArea({ shape: occt.shapes.face.getFaces({ shape: section.parts[0]!.shape })[0]! })).toBeCloseTo(200, CLOSE);
        freed(section);
    });

    it("should refuse a frame without a normal, a part without its shape hash and a component placing a part the build lacks", () => {
        // Arrange
        const built = occt.design.build({ document: plate });
        const [part] = built.parts;

        // Act
        const attempts = [
            () => occt.design.section({ build: built, frame: { ...ACROSS_X, normal: [0, 0, 0] } }),
            () => occt.design.section({ build: { parts: [{ id: "plate", shape: part!.shape, shapeHash: "" }] }, frame: ACROSS_X }),
            () => occt.design.section({ build: { parts: built.parts, components: [{ path: "lost", part: "nothing", world: MIRRORED_ABOUT_10 }] }, frame: ACROSS_X }),
        ].map(attempt => { try { attempt(); return undefined; } catch (error) { return error; } });

        // Assert
        expect(attempts.every(error => error instanceof InputError)).toBe(true);
        expect(attempts.map(error => (error as InputError).message)).toEqual([
            "`frame` is not a frame: its `normal` has no length.",
            "`build.parts` at position 0 needs an `id`, a `shape` and the `shapeHash` the build gave it.",
            "`build.components` at position 0 places the part \"nothing\", which `build.parts` lacks.",
        ]);
    });
});
