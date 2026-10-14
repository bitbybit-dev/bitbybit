import { describe, it, expect, beforeAll, vi } from "vitest";
import type { BitbybitOcctModule, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { InputError } from "@bitbybit-dev/base";
import { OccHelper } from "../../occ-helper";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTService } from "../../occ-service";
import * as Inputs from "../../api/inputs";
import type * as Models from "../../api/models";
import { sha256 } from "./digest";
import { documentsFromStep } from "./from-step";

vi.mock("./digest", async importOriginal => {
    const original = await importOriginal<typeof import("./digest")>();
    return { ...original, sha256: vi.fn(original.sha256) };
});

const RED = { r: 1, g: 0, b: 0, a: 1 };
const GREEN = { r: 0, g: 1, b: 0, a: 1 };
const BLUE = { r: 0, g: 0, b: 1, a: 1 };
const GREY = { r: 0x80 / 255, g: 0x80 / 255, b: 0x80 / 255, a: 1 };
const TURNED: Inputs.Base.TransformMatrix = [0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1, 0, 20, 0, 0, 1];
const MIRRORED: Inputs.Base.TransformMatrix = [-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 60, 0, 0, 1];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-8[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const NEW_ENTITY = 900001;

const entityOf = (step: string, pattern: RegExp): RegExpExecArray => {
    const found = pattern.exec(step);
    expect(found, String(pattern)).not.toBeNull();
    return found!;
};

const withEntities = (step: string, entities: string[]): string => {
    const end = step.lastIndexOf("ENDSEC;");
    return `${step.slice(0, end)}${entities.join("\n")}\n${step.slice(end)}`;
};

const placedAgain = (step: string, name: string, origin: [number, number, number]): string => {
    const [, occurrence, parent, child] = entityOf(step, new RegExp(`#(\\d+) = NEXT_ASSEMBLY_USAGE_OCCURRENCE\\('[^']*','${name}','[^']*',#(\\d+),#(\\d+),\\$\\);`));
    const [, shapeOfPlacement] = entityOf(step, new RegExp(`#(\\d+) = PRODUCT_DEFINITION_SHAPE\\('Placement','Placement of an item',#${occurrence}\\s*\\);`));
    const [, relation] = entityOf(step, new RegExp(`#\\d+ = CONTEXT_DEPENDENT_SHAPE_REPRESENTATION\\(#(\\d+),#${shapeOfPlacement}\\);`));
    const [, childShape, parentShape, transformation] = entityOf(step, new RegExp(`#${relation} = \\( REPRESENTATION_RELATIONSHIP\\('','',#(\\d+),#(\\d+)\\)\\s*REPRESENTATION_RELATIONSHIP_WITH_TRANSFORMATION\\(#(\\d+)\\)`));
    const [, axis] = entityOf(step, new RegExp(`#${transformation} = ITEM_DEFINED_TRANSFORMATION\\('','',#(\\d+),#\\d+\\);`));
    const id = (offset: number): string => `#${NEW_ENTITY + offset}`;
    const listed = step.replace(new RegExp(`(#${parentShape} = SHAPE_REPRESENTATION\\('',\\()([^)]*)\\)`), `$1$2,${id(3)})`);
    return withEntities(listed, [
        `${id(0)} = CARTESIAN_POINT('',(${origin.map(value => value.toFixed(1)).join(",")}));`,
        `${id(1)} = DIRECTION('',(0.,0.,1.));`,
        `${id(2)} = DIRECTION('',(1.,0.,0.));`,
        `${id(3)} = AXIS2_PLACEMENT_3D('',${id(0)},${id(1)},${id(2)});`,
        `${id(4)} = CONTEXT_DEPENDENT_SHAPE_REPRESENTATION(${id(5)},${id(7)});`,
        `${id(5)} = ( REPRESENTATION_RELATIONSHIP('','',#${childShape},#${parentShape}) REPRESENTATION_RELATIONSHIP_WITH_TRANSFORMATION(${id(6)}) SHAPE_REPRESENTATION_RELATIONSHIP() );`,
        `${id(6)} = ITEM_DEFINED_TRANSFORMATION('','',#${axis},${id(3)});`,
        `${id(7)} = PRODUCT_DEFINITION_SHAPE('Placement','Placement of an item',${id(8)});`,
        `${id(8)} = NEXT_ASSEMBLY_USAGE_OCCURRENCE('again','${name} again','',#${parent},#${child},$);`,
    ]);
};

const hidingTheStyledPlacement = (step: string): string => {
    const [, styled] = entityOf(step, /#(\d+) = (?:OVER_RIDING_)?STYLED_ITEM\(/);
    return withEntities(step, [`#${NEW_ENTITY} = INVISIBILITY((#${styled}));`]);
};

const asCurveStyle = (step: string): string => {
    const [assignment, style] = entityOf(step, /#\d+ = PRESENTATION_STYLE_ASSIGNMENT\(\(#(\d+)\)\);/);
    const [, colour] = entityOf(step, /#(\d+) = (?:COLOUR_RGB|DRAUGHTING_PRE_DEFINED_COLOUR)\(/);
    return withEntities(step.replace(assignment, assignment.replace(`#${style}`, `#${NEW_ENTITY}`)), [
        `#${NEW_ENTITY} = CURVE_STYLE('',#${NEW_ENTITY + 1},POSITIVE_LENGTH_MEASURE(0.1),#${colour});`,
        `#${NEW_ENTITY + 1} = DRAUGHTING_PRE_DEFINED_CURVE_FONT('continuous');`,
    ]);
};

describe("design documents from a STEP file", () => {
    let occt: OCCTService;
    let kernel: BitbybitOcctModule;

    beforeAll(async () => {
        kernel = await createBitbybitOcct();
        occt = new OCCTService(kernel, new OccHelper(new VectorHelperService(), new ShapesHelperService(), kernel));
    }, 120_000);

    const stepOf = (parts: Models.OCCT.AssemblyPartDef<TopoDS_Shape>[], nodes: Models.OCCT.AssemblyNodeDef[]): Uint8Array => {
        const structure = occt.assembly.manager.combineStructure({ parts, nodes, clearDocument: false });
        const document = occt.assembly.manager.buildAssemblyDocument({ structure });
        try {
            return occt.assembly.manager.exportDocumentToStep({ document, fileName: "fixture.step", author: "", organization: "", compress: false, tryDownload: false });
        } finally {
            document.delete();
        }
    };

    const machine = (): Uint8Array => {
        const shapes = [
            occt.shapes.solid.createBox({ width: 10, length: 4, height: 2, center: [5, 0, 0] }),
            occt.shapes.solid.createBox({ width: 2, length: 2, height: 8, center: [0, 0, 4] }),
        ];
        const manager = occt.assembly.manager;
        const step = stepOf(
            [
                manager.createPart({ id: "bracket", shape: shapes[0]!, name: "Bracket", colorRgba: RED }),
                { id: "pin", shape: shapes[1]!, name: "Pin", colorRgba: GREY, faceColors: [{ indexes: [0], colorRgba: BLUE }] },
            ],
            [
                manager.createAssemblyNode({ id: "root", name: "Machine" }),
                manager.createAssemblyNode({ id: "frame", name: "Frame", parentId: "root" }),
                manager.createInstanceNode({ id: "left", partId: "bracket", name: "Left bracket", parentId: "frame" }),
                manager.createInstanceNode({ id: "right", partId: "bracket", name: "Right bracket", parentId: "frame", matrix: TURNED }),
                manager.createInstanceNode({ id: "pin", partId: "pin", name: "Pin", parentId: "root", translation: [40, 0, 0] }),
                manager.createInstanceNode({ id: "marked", partId: "bracket", name: "Marked bracket", parentId: "root", translation: [0, 30, 0], colorRgba: GREEN }),
            ],
        );
        shapes.forEach(shape => shape.delete());
        return step;
    };

    const documentNamed = (imported: Models.OCCT.DesignFromStep, name: string): Models.OCCT.DesignDocument[] =>
        imported.documents.filter(document => document.meta?.name === name);

    const assemblyNamed = (imported: Models.OCCT.DesignFromStep, name: string): Models.OCCT.DesignAssemblyDocument => {
        const found = documentNamed(imported, name)[0];
        expect(found?.kind).toBe("assembly");
        return found as Models.OCCT.DesignAssemblyDocument;
    };

    const built = (imported: Models.OCCT.DesignFromStep): Models.OCCT.DesignBuildResult<TopoDS_Shape> => {
        const root = imported.documents.find(document => document.id === imported.root)!;
        const assets = Object.fromEntries(imported.assets.map(asset => [asset.id, asset.data]));
        return occt.design.build({ document: root, documents: imported.documents, assets });
    };

    const release = (result: Models.OCCT.DesignBuildResult<TopoDS_Shape>): void => result.parts.forEach(part => part.shape.delete());

    it("should make an assembly document per assembly and a part document per part, placing a part twice through one document", () => {
        // Arrange
        const step = machine();

        // Act
        const imported = occt.design.fromStep({ step, name: "machine.step" });

        // Assert
        const root = imported.documents[0] as Models.OCCT.DesignAssemblyDocument;
        expect(imported.root).toBe(root.id);
        expect(root.meta?.name).toBe("Machine");
        expect(root.components.map(component => component.name)).toEqual(["Frame", "Pin", "Marked bracket"]);
        const frame = assemblyNamed(imported, "Frame");
        expect(root.components[0]?.source).toEqual({ document: frame.id });
        expect(frame.components.map(component => [component.id, component.name])).toEqual([["Left_bracket", "Left bracket"], ["Right_bracket", "Right bracket"]]);
        expect(new Set(frame.components.map(component => component.source.document)).size).toBe(1);
        expect(frame.components[0]?.at).toBeUndefined();
        expect(frame.components[1]?.at).toEqual({ origin: [20, 0, 0], normal: [0, 0, 1], direction: [0, 1, 0] });
        expect(imported.report).toEqual({ parts: 3, assemblies: 2, components: 5, notes: [] });
        imported.documents.forEach(document => expect(document.id).toMatch(UUID));
        expect(occt.design.validate({ document: root, documents: imported.documents })).toEqual([]);
    });

    it("should write one shapes file every part imports by its child, with its digest and a name built from the file's", () => {
        // Arrange
        const step = machine();

        // Act
        const imported = occt.design.fromStep({ step, name: "C:\\work\\Machine (rev 2).step", folder: "assets/" });

        // Assert
        expect(imported.assets).toHaveLength(1);
        const shapes = imported.assets[0]!;
        expect(shapes.sha256).toBe(sha256(shapes.data));
        expect(shapes.id).toBe(`step_${shapes.sha256.slice(0, 16)}`);
        expect(shapes.uri).toBe(`assets/Machine (rev 2)-${shapes.sha256.slice(0, 8)}.brep`);
        expect(shapes.mediaType).toBe("model/vnd.occt.brep");
        const parts = imported.documents.filter((document): document is Models.OCCT.DesignPartDocument => document.kind !== "assembly");
        expect(parts.map(part => part.features[0])).toEqual([
            { id: "shape", type: "import", asset: shapes.id, format: "brep-binary", child: 0 },
            { id: "shape", type: "import", asset: shapes.id, format: "brep-binary", child: 1 },
            { id: "shape", type: "import", asset: shapes.id, format: "brep-binary", child: 0 },
        ]);
        parts.forEach(part => expect(part.assets).toEqual([{ id: shapes.id, uri: shapes.uri, sha256: shapes.sha256, mediaType: shapes.mediaType }]));
        const compound = occt.io.loadBrepBinary({ brepData: shapes.data });
        expect(occt.shapes.compound.getShapesOfCompound({ shape: compound }).map(shape => occt.shapes.shape.getShapeType({ shape }))).toEqual(["solid", "solid"]);
        compound.delete();
    });

    it("should keep each part's colour, a face coloured apart from its part, and a placement's own colour as a part of its own", () => {
        // Arrange
        const step = machine();

        // Act
        const imported = occt.design.fromStep({ step });

        // Assert
        const looks = imported.documents
            .filter((document): document is Models.OCCT.DesignPartDocument => document.kind !== "assembly")
            .map(document => [document.meta?.name, document.parts?.[0]?.appearance]);
        expect(looks).toEqual([
            ["Bracket", { color: "#ff0000" }],
            ["Pin", { color: "#808080", faces: [{ faces: { of: "shape", role: "face", from: "0" }, color: "#0000ff" }] }],
            ["Bracket", { color: "#00ff00" }],
        ]);
        const result = built(imported);
        const pin = result.parts.find(part => part.name === "Pin")!;
        expect(pin.appearance?.faces).toEqual([{ indexes: [0], color: "#0000ff" }]);
        release(result);
    });

    it("should build every part where the file places it", () => {
        // Arrange
        const imported = occt.design.fromStep({ step: machine() });

        // Act
        const result = built(imported);

        // Assert
        const world = Object.fromEntries((result.components ?? []).filter(component => component.part !== undefined).map(component => [component.path, component.world]));
        expect(Object.keys(world).sort()).toEqual(["Frame/Left_bracket", "Frame/Right_bracket", "Marked_bracket", "Pin"]);
        TURNED.forEach((value, index) => expect(world["Frame/Right_bracket"]![index]).toBeCloseTo(value, 9));
        expect(world["Pin"]!.slice(12, 15)).toEqual([40, 0, 0]);
        expect(world["Marked_bracket"]!.slice(12, 15)).toEqual([0, 30, 0]);
        expect(result.parts.every(part => part.volume !== undefined && part.volume > 0)).toBe(true);
        release(result);
    });

    it("should give the same file and seed the same ids, and another seed others", () => {
        // Arrange
        const step = machine();

        // Act
        const first = occt.design.fromStep({ step });
        const again = occt.design.fromStep({ step: step.slice().buffer });
        const copy = occt.design.fromStep({ step, seed: "copy" });

        // Assert
        expect(again.documents.map(document => document.id)).toEqual(first.documents.map(document => document.id));
        expect(copy.documents.map(document => document.id).filter(id => first.documents.some(document => document.id === id))).toEqual([]);
    });

    it("should make a file holding one part a part document alone", () => {
        // Arrange
        const box = occt.shapes.solid.createBox({ width: 4, length: 4, height: 4, center: [0, 0, 0] });
        const step = stepOf([occt.assembly.manager.createPart({ id: "cube", shape: box, name: "Cube" })], []);
        box.delete();

        // Act
        const imported = occt.design.fromStep({ step: new TextDecoder().decode(step) });

        // Assert
        expect(imported.documents).toHaveLength(1);
        expect(imported.documents[0]).toMatchObject({ id: imported.root, kind: "part", up: "z", units: { length: "mm" }, meta: { name: "Cube" } });
        expect(imported.report).toEqual({ parts: 1, assemblies: 0, components: 0, notes: [] });
        const result = built(imported);
        expect(result.parts[0]?.volume).toBeCloseTo(64, 6);
        release(result);
    });

    it("should name a part the file leaves unnamed after the file, not after the translator that wrote it", () => {
        // Arrange
        const box = occt.shapes.solid.createBox({ width: 4, length: 4, height: 4, center: [0, 0, 0] });
        const step = occt.io.saveShapeSTEP({ shape: box, fileName: "unnamed.step", adjustYtoZ: false, tryDownload: false });
        box.delete();

        // Act
        const imported = occt.design.fromStep({ step, name: "Bracket v2.stp" });

        // Assert
        expect(step).toContain("Open CASCADE STEP translator");
        expect(imported.documents.map(document => document.meta?.name)).toEqual(["Bracket v2"]);
        expect((imported.documents[0] as Models.OCCT.DesignPartDocument).parts?.[0]?.name).toBe("Bracket v2");
    });

    it("should place shapes the file holds side by side in an assembly named after the file", () => {
        // Arrange
        const shapes = [
            occt.shapes.solid.createBox({ width: 2, length: 2, height: 2, center: [0, 0, 0] }),
            occt.shapes.solid.createBox({ width: 3, length: 3, height: 3, center: [10, 0, 0] }),
        ];
        const step = stepOf([{ id: "small", shape: shapes[0]!, name: "Small" }, { id: "large", shape: shapes[1]!, name: "Large" }], []);
        shapes.forEach(shape => shape.delete());

        // Act
        const imported = occt.design.fromStep({ step, name: "pair.step" });

        // Assert
        const root = imported.documents[0] as Models.OCCT.DesignAssemblyDocument;
        expect([root.kind, root.meta?.name, root.components.map(component => component.name)]).toEqual(["assembly", "pair", ["Small", "Large"]]);
        const result = built(imported);
        expect(result.parts.reduce((sum, part) => sum + (part.volume ?? 0), 0)).toBeCloseTo(8 + 27, 6);
        release(result);
    });

    it("should keep a part of edges alone with its colour on its edges, and leave out one with no edges, saying so", () => {
        // Arrange
        const frame = occt.shapes.wire.createPolygonWire({ points: [[0, 0, 0], [10, 0, 0], [10, 10, 0], [0, 10, 0]] });
        const point = occt.shapes.vertex.vertexFromXYZ({ x: 1, y: 2, z: 3 });
        const manager = occt.assembly.manager;
        const step = stepOf(
            [
                { id: "frame", shape: frame, name: "Wire frame", colorRgba: BLUE },
                { id: "point", shape: point, name: "Marker" },
            ],
            [
                manager.createAssemblyNode({ id: "root", name: "Sketches" }),
                manager.createInstanceNode({ id: "frame", partId: "frame", name: "Frame", parentId: "root" }),
                manager.createInstanceNode({ id: "point", partId: "point", name: "Point", parentId: "root" }),
            ],
        );
        [frame, point].forEach(shape => shape.delete());

        // Act
        const imported = occt.design.fromStep({ step });

        // Assert
        const parts = imported.documents.filter((document): document is Models.OCCT.DesignPartDocument => document.kind !== "assembly");
        expect(parts.map(part => part.parts?.[0]?.appearance)).toEqual([{ color: "#0000ff", edgeColor: "#0000ff" }]);
        expect(imported.report.notes).toEqual(["A part holds no shape and was left out."]);
        const result = built(imported);
        expect(result.report.every(entry => entry.status === "ok")).toBe(true);
        release(result);
    });

    it("should place a sub-assembly as its own document, and flatten one placed mirrored into parts of their own", () => {
        // Arrange
        const shape = occt.shapes.solid.createBox({ width: 10, length: 4, height: 2, center: [5, 0, 0] });
        const manager = occt.assembly.manager;
        const step = stepOf(
            [{ id: "bracket", shape, name: "Bracket", colorRgba: RED }],
            [
                manager.createAssemblyNode({ id: "root", name: "Row" }),
                manager.createAssemblyNode({ id: "pair", name: "Pair", parentId: "root" }),
                manager.createInstanceNode({ id: "a", partId: "bracket", name: "A", parentId: "pair" }),
                manager.createInstanceNode({ id: "b", partId: "bracket", name: "B", parentId: "pair", translation: [0, 10, 0] }),
                { ...manager.createAssemblyNode({ id: "mirrored", name: "Mirrored pair", parentId: "root" }), matrix: MIRRORED },
                manager.createInstanceNode({ id: "c", partId: "bracket", name: "C", parentId: "mirrored" }),
                manager.createInstanceNode({ id: "d", partId: "bracket", name: "D", parentId: "mirrored", translation: [10, 0, 0] }),
                manager.createInstanceNode({ id: "e", partId: "bracket", name: "E", parentId: "mirrored", matrix: [-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 20, 0, 1] }),
            ],
        );
        shape.delete();

        // Act
        const imported = occt.design.fromStep({ step });

        // Assert
        const root = imported.documents[0] as Models.OCCT.DesignAssemblyDocument;
        expect(root.components.map(component => component.name)).toEqual(["Pair", "Mirrored pair C", "Mirrored pair D", "Mirrored pair E"]);
        expect(root.components[3]?.at).toEqual({ origin: [60, 20, 0], normal: [0, 0, 1], direction: [1, 0, 0] });
        expect(root.components[3]?.source).toEqual((imported.documents.find(document => document.meta?.name === "Pair") as Models.OCCT.DesignAssemblyDocument).components[0]?.source);
        expect(imported.report.notes).toEqual(["2 placements that mirror or scale their parts were built into parts of their own, since a frame only moves and turns."]);
        const result = built(imported);
        const placed = (result.components ?? []).filter(component => component.part !== undefined).map(component => component.world.slice(12, 14).map(value => Math.round(value)));
        expect(placed).toEqual([[0, 0], [0, 10], [0, 0], [0, 0], [60, 20]]);
        const spans = result.parts.map(part => [occt.operations.boundingBoxMinOfShape({ shape: part.shape })[0], occt.operations.boundingBoxMaxOfShape({ shape: part.shape })[0]]);
        [[0, 10], [50, 60], [40, 50]].forEach((span, index) => span.forEach((value, end) => expect(spans[index]![end]).toBeCloseTo(value, 5)));
        release(result);
    });

    it("should turn a design's own STEP back into documents, its part placed four times staying one document", () => {
        // Arrange
        const bracketId = "44444444-4444-4444-8444-444444444444";
        const pairId = "55555555-5555-4555-8555-555555555555";
        const bracket: Models.OCCT.DesignPartDocument = {
            schemaVersion: 1, id: bracketId, meta: { name: "Bracket" },
            features: [
                { id: "base", type: "sketch", on: { plane: "XY" }, pen: [{ type: "hLine", length: 10 }, { type: "vLine", length: 4 }, { type: "hLine", length: -10 }, { type: "close" }] },
                { id: "plate", type: "extrude", profile: "base", distance: 2 },
            ],
            parts: [{ id: "bracket", name: "Bracket", body: "plate", appearance: { color: "#336699" } }],
        };
        const pair: Models.OCCT.DesignAssemblyDocument = {
            schemaVersion: 1, kind: "assembly", id: pairId, meta: { name: "Pair" },
            components: [
                { id: "a", source: { document: bracketId, part: "bracket" } },
                { id: "b", source: { document: bracketId, part: "bracket" }, at: { origin: [0, 10, 0], normal: [0, 0, 1], direction: [1, 0, 0] } },
            ],
        };
        const row: Models.OCCT.DesignAssemblyDocument = {
            schemaVersion: 1, kind: "assembly", meta: { name: "Row" },
            components: [
                { id: "first", source: { document: pairId } },
                { id: "second", source: { document: pairId }, at: { origin: [30, 0, 0], normal: [0, 0, 1], direction: [0, 1, 0] } },
            ],
        };
        const design = occt.design.build({ document: row, documents: [bracket, pair] });
        const structureDocument = occt.assembly.manager.buildAssemblyDocument({ structure: design.structure! });
        const step = occt.assembly.manager.exportDocumentToStep({ document: structureDocument, fileName: "row.step", author: "", organization: "", compress: false, tryDownload: false });
        structureDocument.delete();
        design.parts.forEach(part => part.shape.delete());

        // Act
        const imported = occt.design.fromStep({ step });

        // Assert
        expect(imported.report).toMatchObject({ parts: 1, assemblies: 3, components: 6 });
        const root = imported.documents[0] as Models.OCCT.DesignAssemblyDocument;
        expect(root.components[1]?.at).toEqual({ origin: [30, 0, 0], normal: [0, 0, 1], direction: [0, 1, 0] });
        const result = built(imported);
        expect((result.components ?? []).filter(component => component.part !== undefined)).toHaveLength(4);
        expect(result.parts[0]?.appearance?.color).toBe("#336699");
        release(result);
    });

    it("should colour a part its faces' commonest colour when the part has none of its own", () => {
        // Arrange
        const box = occt.shapes.solid.createBox({ width: 4, length: 4, height: 4, center: [0, 0, 0] });
        const manager = occt.assembly.manager;
        const step = stepOf(
            [{ id: "box", shape: box, name: "Box", faceColors: [{ indexes: [0, 1, 2, 3, 4], colorRgba: GREEN }, { indexes: [5], colorRgba: { ...BLUE, a: 0.5 } }] }],
            [manager.createAssemblyNode({ id: "root", name: "Crate" }), manager.createInstanceNode({ id: "box", partId: "box", name: "Box", parentId: "root" })],
        );
        box.delete();

        // Act
        const imported = occt.design.fromStep({ step });

        // Assert
        const part = imported.documents.find((document): document is Models.OCCT.DesignPartDocument => document.kind !== "assembly")!;
        expect(part.parts?.[0]?.appearance).toEqual({ color: "#00ff00", faces: [{ faces: { of: "shape", role: "face", from: "5" }, color: "#0000ff", opacity: 0.5 }] });
    });

    it("should leave out an assembly that places nothing, and refuse a file whose only shape holds nothing", () => {
        // Arrange
        const box = occt.shapes.solid.createBox({ width: 4, length: 4, height: 4, center: [0, 0, 0] });
        const point = occt.shapes.vertex.vertexFromXYZ({ x: 0, y: 0, z: 0 });
        const manager = occt.assembly.manager;
        const step = stepOf(
            [{ id: "box", shape: box, name: "Box" }, { id: "point", shape: point, name: "Point" }],
            [
                manager.createAssemblyNode({ id: "root", name: "Kit" }),
                manager.createInstanceNode({ id: "box", partId: "box", name: "Box", parentId: "root" }),
                manager.createAssemblyNode({ id: "markers", name: "Markers", parentId: "root" }),
                manager.createInstanceNode({ id: "point", partId: "point", name: "Point", parentId: "markers" }),
                manager.createInstanceNode({ id: "mirroredPoint", partId: "point", name: "Mirrored point", parentId: "root", matrix: MIRRORED }),
            ],
        );
        const pointOnly = occt.io.saveShapeSTEP({ shape: point, fileName: "point.step", adjustYtoZ: false, tryDownload: false });
        [box, point].forEach(shape => shape.delete());

        // Act
        const imported = occt.design.fromStep({ step });
        const nothing = (): unknown => occt.design.fromStep({ step: pointOnly });
        const empty = (): unknown => occt.design.fromStep({ step: new Uint8Array(0) });

        // Assert
        expect(imported.report.notes).toEqual(["2 parts hold no shape and were left out.", "An assembly places nothing and was left out: \"Markers\"."]);
        expect((imported.documents[0] as Models.OCCT.DesignAssemblyDocument).components.map(component => component.name)).toEqual(["Box"]);
        expect(nothing).toThrow("The STEP file holds no shape to make a design document of.");
        expect(empty).toThrow("The STEP file is empty.");
    });

    it("should keep a sub-assembly the file places twice as one document with its own components", () => {
        // Arrange
        const shape = occt.shapes.solid.createBox({ width: 2, length: 2, height: 2, center: [0, 0, 0] });
        const manager = occt.assembly.manager;
        const step = new TextDecoder().decode(stepOf(
            [{ id: "cube", shape, name: "Cube" }],
            [
                manager.createAssemblyNode({ id: "root", name: "Row" }),
                manager.createAssemblyNode({ id: "pair", name: "Pair", parentId: "root" }),
                manager.createInstanceNode({ id: "a", partId: "cube", name: "A", parentId: "pair" }),
                manager.createInstanceNode({ id: "b", partId: "cube", name: "B", parentId: "pair", translation: [0, 5, 0] }),
            ],
        ));
        shape.delete();

        // Act
        const imported = occt.design.fromStep({ step: placedAgain(step, "Pair", [50, 0, 0]) });

        // Assert
        expect(imported.report).toMatchObject({ parts: 1, assemblies: 2, components: 4 });
        const root = imported.documents[0] as Models.OCCT.DesignAssemblyDocument;
        const pair = imported.documents.find(document => document.meta?.name === "Pair") as Models.OCCT.DesignAssemblyDocument;
        expect(root.components.map(component => [component.name, component.source.document, component.at?.origin])).toEqual([["Pair", pair.id, undefined], ["Pair again", pair.id, [50, 0, 0]]]);
        expect(pair.components.map(component => component.name)).toEqual(["A", "B"]);
        const result = built(imported);
        expect((result.components ?? []).filter(component => component.part !== undefined).map(component => component.world.slice(12, 14))).toEqual([[0, 0], [0, 5], [50, 0], [50, 5]]);
        release(result);
    });

    it("should suppress a placement the file hides, and say so", () => {
        // Arrange
        const shape = occt.shapes.solid.createBox({ width: 2, length: 2, height: 2, center: [0, 0, 0] });
        const manager = occt.assembly.manager;
        const step = new TextDecoder().decode(stepOf(
            [{ id: "cube", shape, name: "Cube" }],
            [
                manager.createAssemblyNode({ id: "root", name: "Shelf" }),
                manager.createInstanceNode({ id: "shown", partId: "cube", name: "Shown", parentId: "root" }),
                manager.createInstanceNode({ id: "hidden", partId: "cube", name: "Hidden", parentId: "root", translation: [5, 0, 0], colorRgba: GREEN }),
            ],
        ));
        shape.delete();

        // Act
        const imported = occt.design.fromStep({ step: hidingTheStyledPlacement(step) });

        // Assert
        const root = imported.documents[0] as Models.OCCT.DesignAssemblyDocument;
        expect(root.components.map(component => [component.name, component.suppressed])).toEqual([["Shown", undefined], ["Hidden", true]]);
        expect(imported.report.notes).toEqual(["A hidden placement is suppressed."]);
    });

    it("should bake a placement that scales its part, and give the colour of a part or a placement its opacity", () => {
        // Arrange
        const shapes = [
            occt.shapes.solid.createBox({ width: 2, length: 2, height: 2, center: [0, 0, 0] }),
            occt.shapes.solid.createBox({ width: 1, length: 1, height: 1, center: [0, 0, 0] }),
        ];
        const manager = occt.assembly.manager;
        const step = stepOf(
            [{ id: "glass", shape: shapes[0]!, name: "Glass", colorRgba: { ...BLUE, a: 0.3 } }, { id: "cube", shape: shapes[1]!, name: "Cube" }],
            [
                manager.createAssemblyNode({ id: "root", name: "Display" }),
                manager.createInstanceNode({ id: "glass", partId: "glass", name: "Glass", parentId: "root" }),
                manager.createInstanceNode({ id: "tinted", partId: "cube", name: "Tinted", parentId: "root", translation: [5, 0, 0], colorRgba: { ...RED, a: 0.4 } }),
                manager.createInstanceNode({ id: "large", partId: "cube", name: "Large", parentId: "root", translation: [10, 0, 0], scale: 2 }),
            ],
        );
        shapes.forEach(shape => shape.delete());

        // Act
        const imported = occt.design.fromStep({ step });

        // Assert
        const looks = imported.documents.filter((document): document is Models.OCCT.DesignPartDocument => document.kind !== "assembly").map(document => document.parts?.[0]?.appearance);
        expect(looks).toEqual([{ color: "#0000ff", opacity: 0.3 }, { color: "#ff0000", opacity: 0.4 }, undefined]);
        expect(imported.report.notes).toEqual(["A placement that mirrors or scales its part was built into a part of its own, since a frame only moves and turns."]);
        const result = built(imported);
        expect(result.parts.map(part => part.volume)).toEqual([expect.closeTo(8, 6), expect.closeTo(1, 6), expect.closeTo(8, 6)]);
        release(result);
    });

    it("should colour a part by its faces only where one colour holds most of them", () => {
        // Arrange
        const boxes = [0, 1].map(() => occt.shapes.solid.createBox({ width: 4, length: 4, height: 4, center: [0, 0, 0] }));
        const manager = occt.assembly.manager;
        const step = stepOf(
            [
                { id: "most", shape: boxes[0]!, name: "Mostly green", faceColors: [{ indexes: [0], colorRgba: BLUE }, { indexes: [1], colorRgba: GREEN }, { indexes: [2], colorRgba: GREEN }, { indexes: [3], colorRgba: GREEN }, { indexes: [4], colorRgba: GREEN }, { indexes: [5], colorRgba: { ...GREEN, a: 0.25 } }] },
                { id: "one", shape: boxes[1]!, name: "One blue face", faceColors: [{ indexes: [0], colorRgba: BLUE }] },
            ],
            [
                manager.createAssemblyNode({ id: "root", name: "Crates" }),
                manager.createInstanceNode({ id: "most", partId: "most", name: "Most", parentId: "root" }),
                manager.createInstanceNode({ id: "one", partId: "one", name: "One", parentId: "root", translation: [10, 0, 0] }),
            ],
        );
        boxes.forEach(box => box.delete());

        // Act
        const imported = occt.design.fromStep({ step });

        // Assert
        const looks = imported.documents.filter((document): document is Models.OCCT.DesignPartDocument => document.kind !== "assembly").map(document => document.parts?.[0]?.appearance);
        expect(looks).toEqual([
            { color: "#00ff00", faces: [{ faces: { of: "shape", role: "face", from: "0" }, color: "#0000ff" }, { faces: { of: "shape", role: "face", from: "5" }, color: "#00ff00", opacity: 0.25 }] },
            { faces: [{ faces: { of: "shape", role: "face", from: "0" }, color: "#0000ff" }] },
        ]);
    });

    it("should give a part of edges the colour its file draws its curves in, and keep its edges coloured when a placement recolours it", () => {
        // Arrange
        const frame = occt.shapes.wire.createPolygonWire({ points: [[0, 0, 0], [10, 0, 0], [10, 10, 0], [0, 10, 0]] });
        const box = occt.shapes.solid.createBox({ width: 2, length: 2, height: 2, center: [20, 0, 0] });
        const manager = occt.assembly.manager;
        const curves = new TextDecoder().decode(stepOf([{ id: "frame", shape: frame, name: "Frame", colorRgba: BLUE }], []));
        const sideBySide = stepOf([{ id: "frame", shape: frame, name: "Frame", colorRgba: BLUE }, { id: "box", shape: box, name: "Box" }], []);
        const recoloured = stepOf([{ id: "frame", shape: frame, name: "Frame", colorRgba: BLUE }], [
            manager.createAssemblyNode({ id: "root", name: "Sketches" }),
            manager.createInstanceNode({ id: "red", partId: "frame", name: "Red frame", parentId: "root", colorRgba: RED }),
        ]);
        [frame, box].forEach(shape => shape.delete());
        const appearanceOf = (imported: Models.OCCT.DesignFromStep): (Models.OCCT.DesignAppearance | undefined)[] =>
            imported.documents.filter((document): document is Models.OCCT.DesignPartDocument => document.kind !== "assembly").map(document => document.parts?.[0]?.appearance);

        // Act
        const fromCurves = occt.design.fromStep({ step: asCurveStyle(curves) });
        const fromSideBySide = occt.design.fromStep({ step: sideBySide });
        const fromRecoloured = occt.design.fromStep({ step: recoloured });

        // Assert
        expect(asCurveStyle(curves)).toContain("CURVE_STYLE");
        expect(appearanceOf(fromCurves)).toEqual([{ color: "#0000ff", edgeColor: "#0000ff" }]);
        expect(appearanceOf(fromSideBySide)).toEqual([{ color: "#0000ff", edgeColor: "#0000ff" }, undefined]);
        expect(appearanceOf(fromRecoloured)).toEqual([{ color: "#ff0000", edgeColor: "#ff0000" }]);
    });

    it("should name components by their placements, numbering repeats, and round frames to ten decimals", () => {
        // Arrange
        const shape = occt.shapes.solid.createBox({ width: 2, length: 2, height: 2, center: [0, 0, 0] });
        const manager = occt.assembly.manager;
        const names = ["Bolt", "Bolt", "Part.1", "Part 1", "\u00d1", "\u00d6", "2nd"];
        const step = stepOf(
            [{ id: "cube", shape, name: "Cube" }],
            [
                manager.createAssemblyNode({ id: "root", name: "Bin" }),
                ...names.map((name, index) => manager.createInstanceNode({ id: `n${index}`, partId: "cube", name, parentId: "root", translation: [index * 5, 0, 0] })),
                manager.createInstanceNode({ id: "turned", partId: "cube", name: "Turned", parentId: "root", rotation: [0, 0, 30] }),
            ],
        );
        shape.delete();

        // Act
        const imported = occt.design.fromStep({ step });

        // Assert
        const root = imported.documents[0] as Models.OCCT.DesignAssemblyDocument;
        expect(root.components.map(component => component.id)).toEqual(["Bolt", "Bolt_2", "Part_1", "Part_1_2", "component", "component_2", "c_2nd", "Turned"]);
        expect(root.components[7]?.at).toEqual({ origin: [0, 0, 0], normal: [0, 0, 1], direction: [0.8660254038, 0.5, 0] });
        expect(occt.design.validate({ document: root, documents: imported.documents })).toEqual([]);
    });

    it("should give two different files different ids, refuse a file that is not STEP, and one that places more than a design builds", () => {
        // Arrange
        const box = occt.shapes.solid.createBox({ width: 3, length: 3, height: 3, center: [0, 0, 0] });
        const other = stepOf([occt.assembly.manager.createPart({ id: "cube", shape: box, name: "Cube" })], []);
        box.delete();
        const step = machine();

        // Act
        const first = occt.design.fromStep({ step });
        const second = occt.design.fromStep({ step: other });
        const notStep = (): unknown => occt.design.fromStep({ step: "This is not a STEP file." });
        const tooMany = (): unknown => documentsFromStep(step, { name: "machine.step", seed: "", folder: "", maxOccurrences: 4 }, { occt, occ: kernel });
        const fits = documentsFromStep(step, { name: "machine.step", seed: "", folder: "assets", maxOccurrences: 5 }, { occt, occ: kernel });

        // Assert
        expect(second.documents.map(document => document.id).filter(id => first.documents.some(document => document.id === id))).toEqual([]);
        expect(notStep).toThrow(InputError);
        expect(notStep).toThrow(/^The file could not be read as STEP/);
        expect(tooMany).toThrow("The STEP file places more than 4 parts, more than a design builds; split it into smaller files.");
        expect(fits.assets[0]?.uri).toMatch(/^assets\/machine-[0-9a-f]{8}\.brep$/);
    });

    it("should refuse what is not a STEP file", () => {
        // Act
        const empty = (): unknown => occt.design.fromStep({ step: "" });
        const notStep = (): unknown => occt.design.fromStep(Object.assign(new Inputs.OCCT.DesignFromStepDto(), { step: 42 }));

        // Assert
        expect(empty).toThrow(InputError);
        expect(notStep).toThrow(InputError);
    });

    it("should report a placement that mirrors its part, built into a part of its own", () => {
        // Arrange
        const shape = occt.shapes.solid.createBox({ width: 10, length: 4, height: 2, center: [5, 0, 0] });
        const manager = occt.assembly.manager;
        const step = stepOf(
            [manager.createPart({ id: "bracket", shape, name: "Bracket" })],
            [
                manager.createAssemblyNode({ id: "root", name: "Pair" }),
                manager.createInstanceNode({ id: "plain", partId: "bracket", name: "Plain", parentId: "root" }),
                manager.createInstanceNode({ id: "mirrored", partId: "bracket", name: "Mirrored", parentId: "root", matrix: MIRRORED }),
            ],
        );
        shape.delete();

        // Act
        const imported = occt.design.fromStep({ step });

        // Assert
        const result = built(imported);
        const placed = (result.components ?? []).filter(component => component.part !== undefined).map(component => component.path);
        expect(placed).toEqual(["Plain", "Mirrored"]);
        expect(imported.report.notes).toEqual(["A placement that mirrors or scales its part was built into a part of its own, since a frame only moves and turns."]);
        const root = imported.documents[0] as Models.OCCT.DesignAssemblyDocument;
        expect(root.components.map(component => component.at)).toEqual([undefined, undefined]);
        const spans = result.parts.map(part => [occt.operations.boundingBoxMinOfShape({ shape: part.shape })[0], occt.operations.boundingBoxMaxOfShape({ shape: part.shape })[0]]);
        [[0, 10], [50, 60]].forEach((span, index) => span.forEach((value, end) => expect(spans[index]![end]).toBeCloseTo(value, 5)));
        release(result);
    });
});

describe("an import that takes a child of a compound", () => {
    let occt: OCCTService;
    let file: Uint8Array;
    let digest: string;

    beforeAll(async () => {
        const kernel = await createBitbybitOcct();
        occt = new OCCTService(kernel, new OccHelper(new VectorHelperService(), new ShapesHelperService(), kernel));
        const shapes = [
            occt.shapes.solid.createBox({ width: 1, length: 1, height: 1, center: [0, 0, 0] }),
            occt.shapes.solid.createBox({ width: 2, length: 2, height: 2, center: [0, 0, 0] }),
        ];
        const compound = occt.shapes.compound.makeCompound({ shapes });
        file = occt.io.saveShapeBrepBinary({ shape: compound, withTriangulation: false });
        digest = sha256(file);
        [compound, ...shapes].forEach(shape => shape.delete());
    }, 120_000);

    const compoundOf = (sizes: number[]): Uint8Array => {
        const shapes = sizes.map(size => occt.shapes.solid.createBox({ width: size, length: size, height: size, center: [0, 0, 0] }));
        const compound = occt.shapes.compound.makeCompound({ shapes });
        const bytes = occt.io.saveShapeBrepBinary({ shape: compound, withTriangulation: false });
        [compound, ...shapes].forEach(shape => shape.delete());
        return bytes;
    };

    const taking = (id: string, asset: string, data: Uint8Array, child: number): Models.OCCT.DesignPartDocument => ({
        schemaVersion: 1, id,
        assets: [{ id: asset, uri: `${asset}.brep`, sha256: sha256(data) }],
        features: [{ id: "shape", type: "import", asset, format: "brep-binary", child }],
        parts: [{ id: "part", body: "shape" }],
    });

    const placing = (documents: Models.OCCT.DesignPartDocument[]): Models.OCCT.DesignAssemblyDocument => ({
        schemaVersion: 1, kind: "assembly",
        components: documents.map((document, index) => ({ id: `c${index}`, source: { document: document.id!, part: "part" } })),
    });

    const volumes = (result: Models.OCCT.DesignBuildResult<TopoDS_Shape>): (number | undefined)[] => {
        const found = result.parts.map(part => part.volume);
        result.parts.forEach(part => part.shape.delete());
        return found;
    };

    const documentTaking = (child: number): Models.OCCT.DesignPartDocument => ({
        schemaVersion: 1,
        assets: [{ id: "pair", uri: "pair.brep", sha256: digest }],
        features: [{ id: "shape", type: "import", asset: "pair", format: "brep-binary", child }],
    });

    it("should take the shape at its position", () => {
        // Act
        const first = occt.design.build({ document: documentTaking(0), assets: { pair: file } });
        const second = occt.design.build({ document: documentTaking(1), assets: { pair: file } });

        // Assert
        expect(first.parts[0]?.volume).toBeCloseTo(1, 9);
        expect(second.parts[0]?.volume).toBeCloseTo(8, 9);
        [...first.parts, ...second.parts].forEach(part => part.shape.delete());
    });

    it("should refuse a position the file holds no shape at, and one that is not a whole number from 0", () => {
        // Act
        const beyond = occt.design.build({ document: documentTaking(2), assets: { pair: file } });
        const issues = occt.design.validate({ document: documentTaking(-1) });

        // Assert
        expect(beyond.report[0]).toMatchObject({ status: "failed", messages: [expect.stringContaining("no shape at position 2")] });
        expect(issues).toEqual([{ path: "/features/0/child", message: "a child is the position of a shape in the file's compound, a whole number from 0" }]);
    });

    it("should hash a file once a build yet still refuse a document that records another digest for it", () => {
        // Arrange
        const first: Models.OCCT.DesignPartDocument = { ...documentTaking(0), id: "11111111-1111-4111-8111-111111111111", parts: [{ id: "small", body: "shape" }] };
        const second: Models.OCCT.DesignPartDocument = { ...documentTaking(1), id: "22222222-2222-4222-8222-222222222222", parts: [{ id: "large", body: "shape" }] };
        const wrong: Models.OCCT.DesignPartDocument = { ...second, id: "33333333-3333-4333-8333-333333333333", assets: [{ id: "pair", uri: "pair.brep", sha256: "0".repeat(64) }] };
        const pair = (documents: Models.OCCT.DesignPartDocument[]): Models.OCCT.DesignAssemblyDocument => ({
            schemaVersion: 1, kind: "assembly",
            components: documents.map((document, index) => ({ id: `c${index}`, source: { document: document.id!, part: document.parts![0]!.id } })),
        });

        // Act
        const built = occt.design.build({ document: pair([first, second]), documents: [first, second], assets: { pair: file } });
        const refused = occt.design.build({ document: pair([first, wrong]), documents: [first, wrong], assets: { pair: file } });

        // Assert
        expect(built.parts.map(part => part.volume)).toEqual([expect.closeTo(1, 9), expect.closeTo(8, 9)]);
        expect(refused.report.filter(entry => entry.status === "failed").map(entry => entry.messages.join(" "))).toEqual([expect.stringContaining(`not the ${"0".repeat(64)} the document records`)]);
        [...built.parts, ...refused.parts].forEach(part => part.shape.delete());
    });

    it("should read new data given under the same asset id in a later build", () => {
        // Arrange
        const small = compoundOf([3, 4]);
        const large = compoundOf([5, 6]);
        const id = "66666666-6666-4666-8666-666666666666";

        // Act
        const first = [small, large].map(data => volumes(occt.design.build({ document: taking(id, "file", data, 0), assets: { file: data } }))[0]);
        const second = [small, large].map(data => volumes(occt.design.build({ document: taking(id, "file", data, 1), assets: { file: data } }))[0]);

        // Assert
        expect(first).toEqual([expect.closeTo(27, 6), expect.closeTo(125, 6)]);
        expect(second).toEqual([expect.closeTo(64, 6), expect.closeTo(216, 6)]);
    });

    it("should keep two files apart in one build", () => {
        // Arrange
        const first = compoundOf([7]);
        const second = compoundOf([8]);
        const documents = [taking("77777777-7777-4777-8777-777777777771", "first", first, 0), taking("77777777-7777-4777-8777-777777777772", "second", second, 0)];

        // Act
        const result = occt.design.build({ document: placing(documents), documents, assets: { first, second } });

        // Assert
        expect(result.report.every(entry => entry.status === "ok")).toBe(true);
        expect(volumes(result)).toEqual([expect.closeTo(343, 6), expect.closeTo(512, 6)]);
    });

    it("should read and hash a file once in a build however many documents take a child of it", () => {
        // Arrange
        const data = compoundOf([9, 10]);
        const documents = [0, 1].map(child => taking(`88888888-8888-4888-8888-88888888888${child}`, "pair", data, child));
        const reads = vi.spyOn(occt.io, "loadBrepBinary");
        vi.mocked(sha256).mockClear();

        // Act
        const result = occt.design.build({ document: placing(documents), documents, assets: { pair: data } });

        // Assert
        expect(volumes(result)).toEqual([expect.closeTo(729, 6), expect.closeTo(1000, 6)]);
        expect(reads.mock.calls.filter(([inputs]) => inputs.brepData === data)).toHaveLength(1);
        expect(vi.mocked(sha256).mock.calls.filter(([bytes]) => bytes === data)).toHaveLength(1);
        reads.mockRestore();
    });

    it("should refuse a child of a file that holds one shape, and a child that is not a whole number", () => {
        // Arrange
        const box = occt.shapes.solid.createBox({ width: 2, length: 2, height: 2, center: [0, 0, 0] });
        const single = occt.io.saveShapeBrepBinary({ shape: box, withTriangulation: false });
        box.delete();

        // Act
        const refused = occt.design.build({ document: taking("99999999-9999-4999-8999-999999999999", "single", single, 0), assets: { single } });
        const issues = occt.design.validate({ document: { ...documentTaking(0), features: [{ id: "shape", type: "import", asset: "pair", format: "brep-binary", child: 1.5 }] } });

        // Assert
        expect(refused.report[0]).toMatchObject({ status: "failed", messages: [expect.stringContaining("holds one shape, not a compound of shapes to take a child of")] });
        expect(issues).toEqual([{ path: "/features/0/child", message: "a child is the position of a shape in the file's compound, a whole number from 0" }]);
    });

    it("should write the child into TypeScript", () => {
        // Act
        const code = occt.design.toTypeScript({ document: documentTaking(1), assets: { pair: file } });

        // Assert
        expect(code).toContain("(await occt.shapes.compound.getShapesOfCompound({ shape: await occt.io.loadBrepBinary({ brepData: assets[\"pair\"] as Uint8Array }) }))[1]!;");
    });
});
