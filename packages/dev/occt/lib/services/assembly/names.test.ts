import { describe, it, expect, beforeAll, afterEach } from "vitest";
import createBitbybitOcct, { BitbybitOcctModule, Handle_TDocStd_Document, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTAssemblyManager } from "./manager";
import { OCCTAssemblyQuery } from "./query";
import { OCCTIO } from "../io";
import { OCCTSolid } from "../shapes";
import * as Inputs from "../../api/inputs";
import * as Models from "../../api/models";

describe("assembly names", () => {
    let occt: BitbybitOcctModule;
    let manager: OCCTAssemblyManager;
    let query: OCCTAssemblyQuery;
    let io: OCCTIO;
    let solid: OCCTSolid;
    const documents: Handle_TDocStd_Document[] = [];
    const shapes: TopoDS_Shape[] = [];

    beforeAll(async () => {
        occt = await createBitbybitOcct();
        const occHelper = new OccHelper(new VectorHelperService(), new ShapesHelperService(), occt);
        manager = new OCCTAssemblyManager(occt, occHelper);
        query = new OCCTAssemblyQuery(occt, occHelper);
        io = new OCCTIO(occt, occHelper);
        solid = new OCCTSolid(occt, occHelper);
    });

    afterEach(() => {
        documents.forEach(d => { if (!d.IsNull()) { d.delete(); } });
        documents.length = 0;
        shapes.forEach(s => s.delete());
        shapes.length = 0;
    });

    const keep = (document: Handle_TDocStd_Document): Handle_TDocStd_Document => {
        documents.push(document);
        return document;
    };

    const box = (): TopoDS_Shape => {
        const shape = solid.createBox({ width: 10, height: 10, length: 10, center: [0, 0, 0] });
        shapes.push(shape);
        return shape;
    };

    const bracket = (name = "Bracket"): Models.OCCT.AssemblyPartDef<TopoDS_Shape> => manager.createPart({ id: "bracket", shape: box(), name });

    const instance = (id: string, parentId?: string, name = "", x = 0): Models.OCCT.AssemblyNodeDef =>
        manager.createInstanceNode({ id, partId: "bracket", name, parentId, translation: [x, 0, 0] });

    const documentOf = (parts: Models.OCCT.AssemblyPartDef<TopoDS_Shape>[], nodes: Models.OCCT.AssemblyNodeDef[]): Handle_TDocStd_Document => {
        const structure = manager.combineStructure({ parts, nodes, clearDocument: false });
        return keep(manager.buildAssemblyDocument({ structure }));
    };

    const frameNodes = (names: { frame?: string; first?: string; second?: string; loose?: string } = {}): Models.OCCT.AssemblyNodeDef[] => [
        manager.createAssemblyNode({ id: "root", name: "Root" }),
        manager.createAssemblyNode({ id: "frame", name: "Frame", parentId: "root" }),
        instance("i1", "frame", names.first),
        instance("i2", "frame", names.second, 20),
        instance("i3", "root", names.loose, 40)
    ];

    const stepOf = (document: Handle_TDocStd_Document): Uint8Array =>
        manager.exportDocumentToStep({ document, fileName: "fixture.step", author: "", organization: "", compress: false, tryDownload: false });

    const stepText = (step: Uint8Array): string => new TextDecoder().decode(step);

    const unwrapped = (step: string): string => step.replace(/\n[ \t]+/g, "");

    const occurrences = (step: Uint8Array): string[] => unwrapped(stepText(step)).match(/NEXT_ASSEMBLY_USAGE_OCCURRENCE\([^;]*\)/g) ?? [];

    const withOccurrences = (step: Uint8Array, id: string, name: string): Uint8Array => {
        const rewritten = unwrapped(stepText(step))
            .replace(/NEXT_ASSEMBLY_USAGE_OCCURRENCE\('([^']*)','[^']*','[^']*',/g, `NEXT_ASSEMBLY_USAGE_OCCURRENCE('${id}$1','${name}',' ',`);
        expect(rewritten).toContain(`NEXT_ASSEMBLY_USAGE_OCCURRENCE('${id}`);
        return new TextEncoder().encode(rewritten);
    };

    const blankOccurrences = (step: Uint8Array): Uint8Array => withOccurrences(step, "NAUO", " ");

    const treeOf = (document: Handle_TDocStd_Document): string[] =>
        query.getAssemblyHierarchy({ document }).nodes.map(n => `${n.depth}:${n.nodeType}:${n.name}`);

    const gltfNodeNames = (glb: Uint8Array): string[] => {
        const view = new DataView(glb.buffer, glb.byteOffset, glb.byteLength);
        expect(String.fromCharCode(glb[0]!, glb[1]!, glb[2]!, glb[3]!)).toBe("glTF");
        const jsonLength = view.getUint32(12, true);
        const json = JSON.parse(new TextDecoder().decode(glb.subarray(20, 20 + jsonLength))) as { nodes?: { name?: string }[] };
        return (json.nodes ?? []).map(n => n.name ?? "");
    };

    const gltfOf = (document: Handle_TDocStd_Document): string[] =>
        gltfNodeNames(manager.exportDocumentToGltf(new Inputs.OCCT.ExportDocumentToGltfDto(document, 0.5, 0.5, false, false, "fixture.glb", false)));

    describe("reading STEP", () => {
        it("should name placements the file leaves unnamed after the part, numbered under one parent", () => {
            // Arrange
            const step = blankOccurrences(stepOf(documentOf([bracket()], frameNodes())));

            // Act
            const document = keep(manager.loadStepToDoc({ stepData: step }));

            // Assert
            expect(treeOf(document)).toEqual([
                "0:assembly:Root",
                "1:instance-assembly:Frame",
                "2:instance-part:Bracket (1)",
                "2:instance-part:Bracket (2)",
                "1:instance-part:Bracket"
            ]);
            const nodes = query.getAssemblyHierarchy({ document }).nodes;
            expect(nodes.filter(n => n.isInstance).map(n => n.definitionName)).toEqual(["Frame", "Bracket", "Bracket", "Bracket"]);
            expect(nodes.some(n => n.name.includes("NAUO"))).toBe(false);
        });

        it("should give sibling placements distinct names", () => {
            // Arrange
            const step = blankOccurrences(stepOf(documentOf([bracket()], frameNodes())));
            const document = keep(manager.loadStepToDoc({ stepData: step }));

            // Act
            const nodes = query.getAssemblyHierarchy({ document }).nodes;

            // Assert
            const byParent = new Map<string, string[]>();
            nodes.forEach(n => byParent.set(n.parentId ?? "", [...(byParent.get(n.parentId ?? "") ?? []), n.name]));
            byParent.forEach(names => expect(new Set(names).size).toBe(names.length));
        });

        it("should report the same name through getLabelInfo, with the definition beside it", () => {
            // Arrange
            const step = blankOccurrences(stepOf(documentOf([bracket()], frameNodes())));
            const document = keep(manager.loadStepToDoc({ stepData: step }));
            const first = query.getAssemblyHierarchy({ document }).nodes.find(n => n.name === "Bracket (1)");

            // Act
            const info = query.getLabelInfo({ document, label: first!.label });

            // Assert
            expect(info.type).toBe("instance");
            expect(info.name).toBe("Bracket (1)");
            expect(info.refLabel).toBe(first!.definitionId);
            expect(info.refName).toBe("Bracket");
            expect(info.isReference).toBe(true);
        });

        it("should keep the names a file gives, however long", () => {
            // Arrange
            const long = "Bracket assembly, left hand side, revision B";
            const step = stepOf(documentOf([bracket()], frameNodes({ first: long, second: "Right", loose: "Spare" })));

            // Act
            const document = keep(manager.loadStepToDoc({ stepData: step }));

            // Assert
            expect(treeOf(document)).toEqual([
                "0:assembly:Root",
                "1:instance-assembly:Frame",
                `2:instance-part:${long}`,
                "2:instance-part:Right",
                "1:instance-part:Spare"
            ]);
        });

        it("should keep an occurrence id that reads as a name", () => {
            // Arrange
            const step = withOccurrences(stepOf(documentOf([bracket()], frameNodes())), "Slot-", " ");

            // Act
            const document = keep(manager.loadStepToDoc({ stepData: step }));

            // Assert
            const instances = query.getAssemblyHierarchy({ document }).nodes.filter(n => n.isInstance);
            instances.forEach(n => expect(n.name.startsWith("Slot-")).toBe(true));
        });

        it("should replace the link auto-names an XCAF-written file carries", () => {
            // Arrange
            const step = withOccurrences(stepOf(documentOf([bracket()], frameNodes())), "", "=>[0:1:1:2]");

            // Act
            const document = keep(manager.loadStepToDoc({ stepData: step }));

            // Assert
            const names = query.getAssemblyHierarchy({ document }).nodes.map(n => n.name);
            expect(names.some(n => n.startsWith("=>["))).toBe(false);
            expect(names).toContain("Bracket (2)");
        });

        it("should give parseStepToJson the same names and the definition name", () => {
            // Arrange
            const step = blankOccurrences(stepOf(documentOf([bracket()], frameNodes())));

            // Act
            const parsed = io.parseStepToJson({ stepData: step });

            // Assert
            const instances = parsed.nodes.filter(n => n.isInstance);
            expect(instances.map(n => n.name)).toEqual(["Frame", "Bracket (1)", "Bracket (2)", "Bracket"]);
            expect(instances.map(n => n.definitionName)).toEqual(["Frame", "Bracket", "Bracket", "Bracket"]);
        });
    });

    describe("exporting what was read", () => {
        it("should write the placement names into STEP and glTF, whichever name format is asked for", () => {
            // Arrange
            const step = blankOccurrences(stepOf(documentOf([bracket()], frameNodes())));
            const document = keep(manager.loadStepToDoc({ stepData: step }));

            // Act
            const reExported = occurrences(stepOf(document));
            const gltf = gltfOf(document);
            const advanced = gltfNodeNames(io.convertStepToGltfAdvanced(new Inputs.OCCT.ConvertStepToGltfAdvancedDto(step)));
            const basic = gltfNodeNames(io.convertStepToGltf(new Inputs.OCCT.ConvertStepToGltfDto(step)));

            // Assert
            expect(reExported.filter(o => o.includes("'Bracket (1)'")).length).toBe(1);
            expect(reExported.some(o => o.includes("NAUO") || o.includes("=>["))).toBe(false);
            expect(gltf).toEqual(expect.arrayContaining(["Frame", "Bracket (1)", "Bracket (2)", "Bracket"]));
            expect(advanced.filter(n => n !== "")).toEqual(expect.arrayContaining(["Bracket (1)", "Bracket (2)"]));
            expect(advanced.every(n => n !== "")).toBe(true);
            expect(basic).toEqual(expect.arrayContaining(["Bracket (1)", "Bracket (2)"]));
        });
    });

    describe("building documents", () => {
        it("should name unnamed instance nodes after their part and export them so", () => {
            // Arrange
            const document = documentOf([bracket()], frameNodes());

            // Act
            const tree = treeOf(document);
            const exported = occurrences(stepOf(document));
            const gltf = gltfOf(document);

            // Assert
            expect(tree).toEqual([
                "0:assembly:Root",
                "1:instance-assembly:Frame",
                "2:instance-part:Bracket (1)",
                "2:instance-part:Bracket (2)",
                "1:instance-part:Bracket"
            ]);
            expect(exported.some(o => o.includes("'Frame'"))).toBe(true);
            expect(exported.some(o => o.includes("'Bracket (2)'"))).toBe(true);
            expect(exported.some(o => o.includes("=>["))).toBe(false);
            expect(gltf).toEqual(expect.arrayContaining(["Frame", "Bracket (1)", "Bracket (2)", "Bracket"]));
            expect(gltf.some(n => n.startsWith("=>["))).toBe(false);
        });

        it("should count a named sibling when numbering the unnamed ones", () => {
            // Arrange
            const document = documentOf([bracket()], frameNodes({ first: "Left bracket" }));

            // Act
            const names = query.getAssemblyHierarchy({ document }).nodes.filter(n => n.depth === 2).map(n => n.name);

            // Assert
            expect(names).toEqual(["Left bracket", "Bracket (2)"]);
        });

        it("should keep every part and instance whose name holds brackets, braces or quotes", () => {
            // Arrange
            const names = ["Bracket [rev B] {steel}", "Plate 1/2\" thick \\ rev \"B\"", "Angle}", "{Channel"];
            const parts = names.map((name, i) => manager.createPart({ id: `p${i}`, shape: box(), name }));
            const nodes = names.map((name, i) => manager.createInstanceNode({ id: `i${i}`, partId: `p${i}`, name: `${name} #1`, translation: [20 * i, 0, 0] }));

            // Act
            const document = documentOf(parts, nodes);

            // Assert
            const docParts = query.getDocumentParts({ document }).filter(p => p.type === "part");
            expect(docParts.map(p => p.name)).toEqual(names);
            const instances = query.getAssemblyHierarchy({ document }).nodes.filter(n => n.isInstance);
            expect(instances.map(n => n.name)).toEqual(names.map(n => `${n} #1`));
            expect(instances.map(n => n.definitionName)).toEqual(names);
            expect(query.getLabelInfo({ document, label: docParts[1]!.label }).name).toBe(names[1]);
        });

        it("should survive a STEP round trip with such names", () => {
            // Arrange
            const name = "Plate 1/2\" thick [rev B]";
            const document = documentOf([bracket(name)], [instance("i1", undefined, undefined, 0), instance("i2", undefined, undefined, 20)]);

            // Act
            const reloaded = keep(manager.loadStepToDoc({ stepData: stepOf(document) }));

            // Assert
            const instances = query.getAssemblyHierarchy({ document: reloaded }).nodes.filter(n => n.isInstance);
            expect(instances.map(n => n.name)).toEqual([`${name} (1)`, `${name} (2)`]);
        });

        it("should name the only placement of a part after the part alone", () => {
            // Arrange
            const document = documentOf([bracket()], [instance("i1")]);

            // Act
            const names = query.getAssemblyHierarchy({ document }).nodes.filter(n => n.isInstance).map(n => n.name);

            // Assert
            expect(names).toEqual(["Bracket"]);
        });
    });

    describe("copying loaded parts", () => {
        it("should carry the names of a loaded assembly into a new document and its exports", () => {
            // Arrange
            const loaded = keep(manager.loadStepToDoc({ stepData: blankOccurrences(stepOf(documentOf([bracket()], frameNodes()))) }));
            const imported = manager.createImportedPart({ id: "frameAsm", sourceDocumentIndex: 0 });
            const placements = [
                manager.createInstanceNode({ id: "a", partId: "frameAsm", name: "Assembly A" }),
                manager.createInstanceNode({ id: "b", partId: "frameAsm", name: "Assembly B", translation: [100, 0, 0] })
            ];
            const structure = manager.combineStructure({ parts: [], nodes: placements, loadedParts: [imported], clearDocument: false });

            // Act
            const document = keep(manager.buildAssemblyDocument({ structure, sourceDocuments: [loaded] }));

            // Assert
            const names = query.getAssemblyHierarchy({ document }).nodes.map(n => n.name);
            expect(names).toEqual(expect.arrayContaining(["Assembly A", "Assembly B", "Frame", "Bracket (1)", "Bracket (2)", "Bracket"]));
            expect(names.some(n => n.startsWith("=>[") || n.includes("NAUO"))).toBe(false);
            const gltf = gltfOf(document);
            expect(gltf.some(n => n.startsWith("=>[") || n.includes("NAUO"))).toBe(false);
            expect(gltf).toEqual(expect.arrayContaining(["Bracket (1)", "Bracket (2)"]));
            expect(occurrences(stepOf(document)).some(o => o.includes("=>["))).toBe(false);
        });
    });

    describe("renaming", () => {
        it("should carry a definition rename to the placements named after it", () => {
            // Arrange
            const document = documentOf([bracket()], frameNodes({ first: "Left bracket" }));
            const definition = query.getDocumentParts({ document }).find(p => p.name === "Bracket");

            // Act
            const renamed = manager.setLabelName({ document, label: definition!.label, name: "Holder" });

            // Assert
            expect(renamed).toBe(true);
            const instances = query.getAssemblyHierarchy({ document }).nodes.filter(n => n.refersToPart);
            expect(instances.map(n => n.name)).toEqual(["Left bracket", "Holder (2)", "Holder"]);
            expect(instances.map(n => n.definitionName)).toEqual(["Holder", "Holder", "Holder"]);
        });

        it("should carry a partUpdates rename of a sub-assembly to its placement", () => {
            // Arrange
            const document = documentOf([bracket()], frameNodes());
            const frame = query.getDocumentParts({ document }).find(p => p.name === "Frame");
            const update = manager.createPartUpdate({ label: frame!.label, name: "Frame v2" });
            const structure = manager.combineStructure({ parts: [], nodes: [], partUpdates: [update], clearDocument: false });

            // Act
            const updated = keep(manager.buildAssemblyDocument({ structure, existingDocument: document }));

            // Assert
            const placement = query.getAssemblyHierarchy({ document: updated }).nodes.find(n => n.refersToAssembly);
            expect(placement!.name).toBe("Frame v2");
            expect(placement!.definitionName).toBe("Frame v2");
            expect(occurrences(stepOf(updated)).some(o => o.includes("'Frame v2'"))).toBe(true);
        });
    });
});
