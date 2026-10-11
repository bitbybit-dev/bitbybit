import { describe, it, expect, beforeAll } from "vitest";
import type { TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTService } from "../../occ-service";
import type * as Models from "../../api/models";
import * as Inputs from "../../api/inputs";
import { InputError } from "@bitbybit-dev/base";

type Document = Models.OCCT.DesignPartDocument;

const named = (id: string): Models.OCCT.DesignSketchFeature => ({
    id,
    type: "sketch",
    on: { plane: "XY" },
    pen: [
        { type: "hLine", id: "south", length: "width" },
        { type: "vLine", id: "east", length: 20 },
        { type: "hLine", id: "north", length: "-width" },
        { type: "close", id: "west" },
    ],
});

const anonymous = (id: string): Models.OCCT.DesignSketchFeature => ({
    id,
    type: "sketch",
    on: { plane: "XY" },
    pen: [{ type: "hLine", length: "width" }, { type: "vLine", length: 20 }, { type: "hLine", length: "-width" }, { type: "close" }],
});

const plate = (sketch: Models.OCCT.DesignSketchFeature, ...extra: Models.OCCT.DesignFeature[]): Document => ({
    schemaVersion: 1,
    parameters: { width: 40, height: 10 },
    features: [sketch, { id: "plate", type: "extrude", profile: sketch.id, distance: "height" }, ...extra],
});

describe("naming picked faces and edges", () => {
    let occt: OCCTService;

    beforeAll(async () => {
        const kernel = await createBitbybitOcct();
        occt = new OCCTService(kernel, new OccHelper(new VectorHelperService(), new ShapesHelperService(), kernel));
    }, 120_000);

    const bodyOf = (document: Document): TopoDS_Shape => {
        const [part] = occt.design.build({ document }).parts;
        if (part === undefined) {
            throw new Error("the document built no part");
        }
        return part.shape;
    };
    const facing = (document: Document, direction: [number, number, number]): number[] => occt.select.faces.facing({ shape: bodyOf(document), direction, angle: 0 });
    const withoutHint = (face: Models.OCCT.DesignFaceReference): Models.OCCT.DesignFaceReference => {
        const plain = { ...face };
        Reflect.deleteProperty(plain, "hint");
        return plain;
    };
    const unhinted = (inputs: Inputs.OCCT.DesignReferenceForDto): Models.OCCT.DesignReferenceFound => {
        const found = occt.design.referenceFor(inputs);
        const reference = found.reference;
        if (reference === undefined) {
            return found;
        }
        return { ...found, reference: "between" in reference ? { ...reference, between: [withoutHint(reference.between[0]), withoutHint(reference.between[1])] } : withoutHint(reference) };
    };

    it("should hint the faces it names, and both sides of the edges it names, as a build writing hints would", () => {
        // Arrange
        const document = plate(named("base"));
        const top = facing(document, [0, 0, 1]);
        const rim = occt.select.edges.ofFaces({ shape: bodyOf(document), indexes: top });

        // Act
        const face = occt.design.referenceFor({ document, body: "plate", faces: top, nudge: false }).reference;
        const edges = occt.design.referenceFor({ document, body: "plate", edges: rim, nudge: false }).reference;
        const written = face === undefined || "between" in face ? undefined : occt.design.withHints({ document: { ...document, features: [...document.features, { id: "hollow", type: "shell", body: "plate", open: withoutHint(face), thickness: 1 }] } });

        // Assert
        const hollow = written?.features.find(feature => feature.id === "hollow");
        expect(face !== undefined && !("between" in face) ? [face.hint?.v, face.hint?.faces.length] : []).toEqual([1, 1]);
        expect(hollow !== undefined && hollow.type === "shell" && !Array.isArray(hollow.open) ? hollow.open.hint : undefined).toEqual(face !== undefined && !("between" in face) ? face.hint : "none");
        expect(edges !== undefined && "between" in edges ? edges.between.map(side => side.hint?.faces.length) : []).toEqual([1, 4]);
    });

    it("should name a face by the feature and role that made it, and hold it through every nudge", () => {
        // Arrange
        const document = plate(named("base"));
        const top = facing(document, [0, 0, 1]);

        // Act
        const found = unhinted({ document, body: "plate", faces: top });

        // Assert
        expect(found).toEqual({ reference: { of: "plate", role: "end", count: 1 }, nudged: ["height", "width"], lost: [] });
    });

    it("should name a side by the sketch command that drew it, or by a filter when the commands have no ids", () => {
        // Arrange
        const withIds = plate(named("base"));
        const withoutIds = plate(anonymous("base"));

        // Act
        const byCommand = unhinted({ document: withIds, body: "plate", faces: facing(withIds, [1, 0, 0]), nudge: false });
        const byFilter = unhinted({ document: withoutIds, body: "plate", faces: facing(withoutIds, [1, 0, 0]), nudge: false });

        // Assert
        expect(byCommand).toEqual({ reference: { of: "plate", role: "side", from: "base.east", count: 1 }, nudged: [], lost: [] });
        expect(byFilter).toEqual({ reference: { of: "plate", role: "side", filter: { select: "facing", direction: [1, 0, 0] }, count: 1 }, nudged: [], lost: [] });
    });

    it("should name edges by the two sets of faces they lie between", () => {
        // Arrange
        const document = plate(named("base"));
        const body = bodyOf(document);
        const top = facing(document, [0, 0, 1]);
        const rim = occt.select.edges.ofFaces({ shape: body, indexes: top });

        // Act
        const found = unhinted({ document, body: "plate", edges: rim });

        // Assert
        expect(found).toEqual({ reference: { between: [{ of: "plate", role: "end" }, { of: "plate", role: "side" }], count: 4 }, nudged: ["height", "width"], lost: [] });
    });

    it("should narrow edges between two sets of faces by a filter, and refuse edges no such pair holds exactly", () => {
        // Arrange
        const document = plate(anonymous("base"));
        const body = bodyOf(document);
        const topRim = occt.select.edges.ofFaces({ shape: body, indexes: facing(document, [0, 0, 1]) });
        const bottomRim = occt.select.edges.ofFaces({ shape: body, indexes: facing(document, [0, 0, -1]) });
        const east = occt.select.edges.extreme({ shape: body, indexes: topRim, direction: [1, 0, 0] });
        const west = occt.select.edges.extreme({ shape: body, indexes: bottomRim, direction: [-1, 0, 0] });

        // Act
        const filtered = unhinted({ document, body: "plate", edges: east, nudge: false });
        const apart = unhinted({ document, body: "plate", edges: [...east, ...west], nudge: false });

        // Assert
        expect(filtered.reference).toEqual({ between: [{ of: "plate", role: "end" }, { of: "plate", role: "side" }], filter: { select: "extreme", direction: [1, 0, 0] }, count: 1 });
        expect(apart).toEqual({ refused: "no two named sets of faces have exactly the 2 picked edges between them; pick edges along the same faces", nudged: [], lost: [] });
    });

    it("should name a face of one copy of a pattern by that copy", () => {
        // Arrange
        const document: Document = {
            schemaVersion: 1,
            features: [
                { id: "foot", type: "sketch", on: { plane: "XY" }, pen: [{ type: "hLine", length: 2 }, { type: "vLine", length: 2 }, { type: "hLine", length: -2 }, { type: "close" }] },
                { id: "post", type: "extrude", profile: "foot", distance: 5 },
                { id: "row", type: "linearPattern", body: "post", direction: [1, 0, 0], spacing: 10, count: 3 },
            ],
        };
        const tops = facing(document, [0, 0, 1]);
        const last = occt.select.faces.extreme({ shape: bodyOf(document), indexes: tops, direction: [1, 0, 0] });

        // Act
        const found = unhinted({ document, body: "post", faces: last, nudge: false });

        // Assert
        expect(found.reference).toEqual({ of: "post", role: "end", copy: { of: "row", index: 2 }, count: 1 });
    });

    it("should refuse picks the body does not have", () => {
        // Arrange
        const document = plate(named("base"));

        // Act
        const face = unhinted({ document, body: "plate", faces: [999], nudge: false });
        const edge = unhinted({ document, body: "plate", edges: [999], nudge: false });

        // Assert
        expect(face.refused).toBe("no name covers exactly the 1 picked face; pick faces one feature made");
        expect(edge.refused).toMatch(/^the faces along the picked edges could not be read: |^no two named sets of faces have exactly the 1 picked edge between them/);
    });

    it("should nudge a number at its upper bound down, and leave out numbers held at one value and values that are not numbers", () => {
        // Arrange
        const document: Document = {
            ...plate(named("base"), { id: "round", type: "fillet", body: "plate", radius: 1, suppressed: "!rounded || flat", edges: { between: [{ of: "plate", role: "end" }, { of: "plate", role: "side" }], count: 4 } }),
            parameters: { width: { value: 40, min: 40, max: 40 }, height: { value: 10, max: 10 }, rounded: true, flat: { value: 0, type: "boolean" } },
        };
        const bottom = facing(document, [0, 0, -1]);

        // Act
        const found = unhinted({ document, body: "plate", faces: bottom });

        // Assert
        expect(found).toEqual({ reference: { of: "plate", role: "start", count: 1 }, nudged: ["height"], lost: [] });
    });

    it("should list a number whose nudge takes the picked faces away as lost, and refuse picks no name covers", () => {
        // Arrange
        const rounded = plate(named("base"), { id: "round", type: "fillet", body: "plate", radius: 1, suppressed: "width > 40", edges: { between: [{ of: "plate", role: "end" }, { of: "plate", role: "side" }], count: 4 } });
        const rounds = occt.select.faces.ofType({ shape: bodyOf(rounded), type: Inputs.OCCT.surfaceTypeEnum.cylinder });
        const document = plate(named("base"));
        const top = facing(document, [0, 0, 1]);
        const bottom = facing(document, [0, 0, -1]);

        // Act
        const fragile = unhinted({ document: rounded, body: "plate", faces: rounds });
        const unnamed = unhinted({ document, body: "plate", faces: [...top, ...bottom], nudge: false });

        // Assert
        expect(fragile.reference).toEqual({ of: "round", role: "round", count: 4 });
        expect(fragile.lost).toEqual(["width"]);
        expect(fragile.nudged).toEqual(["height", "width"]);
        expect(unnamed).toEqual({ refused: "no name covers exactly the 2 picked faces; pick faces one feature made", nudged: [], lost: [] });
    });

    it("should list a number whose nudge turns the picked face away as lost, though the reference still finds one face", () => {
        // Arrange
        const document: Document = { ...plate(named("base"), { id: "turn", type: "transform", body: "plate", rotate: [0, "tilt", 0] }), parameters: { width: 40, height: 10, tilt: { value: 0, step: 30 } } };
        const top = facing(document, [0, 0, 1]);

        // Act
        const found = unhinted({ document, body: "plate", faces: top });

        // Assert
        expect(found).toEqual({ reference: { of: "plate", role: "end", count: 1 }, nudged: ["height", "tilt", "width"], lost: ["tilt"] });
    });

    it("should leave out a number whose nudge breaks the build, since it says nothing of the reference", () => {
        // Arrange
        const breaking: Document = {
            ...plate(named("base"), { id: "round", type: "fillet", body: "plate", radius: "1 + gap * 10", edges: { between: [{ of: "plate", role: "end" }, { of: "plate", role: "side" }], count: 4 } }),
            parameters: { width: 40, height: 10, gap: { value: 0, step: 5 } },
        };

        // Act
        const found = unhinted({ document: breaking, body: "plate", faces: facing(breaking, [0, 0, -1]) });

        // Assert
        expect(found).toEqual({ reference: { of: "plate", role: "start", count: 1 }, nudged: ["height", "width"], lost: [] });
    });

    it("should refuse an assembly, both kinds of picks or none, an index that is not one, and a body the document does not build", () => {
        // Arrange
        const document = plate(named("base"));
        const assembly: Models.OCCT.DesignAssemblyDocument = { schemaVersion: 1, kind: "assembly", components: [] };

        // Act
        const ofAssembly = (): unknown => unhinted({ document: assembly, body: "plate", faces: [0] });
        const both = (): unknown => unhinted({ document, body: "plate", faces: [0], edges: [0] });
        const neither = (): unknown => unhinted({ document, body: "plate" });
        const fractional = (): unknown => unhinted({ document, body: "plate", faces: [1.5] });
        const missing = (): unknown => unhinted({ document, body: "lid", faces: [0] });

        // Assert
        expect(ofAssembly).toThrow(InputError);
        expect(ofAssembly).toThrow("Faces and edges are named in part documents; an assembly document has no bodies.");
        expect(both).toThrow("Give the picked faces or the picked edges: one of the two, not both.");
        expect(neither).toThrow("Give the picked faces or the picked edges: one of the two, not both.");
        expect(fractional).toThrow("The picked faces are indexes, whole numbers from 0, and at least one; 1.5 is not one.");
        expect(missing).toThrow("\"lid\" is not a body this document builds");
    });
});
