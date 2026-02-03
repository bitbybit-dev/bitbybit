import createBitbybitOcct, { BitbybitOcctModule, Handle_TDocStd_Document, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTAssembly } from "./assembly";
import { OCCTSolid } from "../shapes";

describe("OCCTAssembly unit tests", () => {
    let occt: BitbybitOcctModule;
    let occHelper: OccHelper;
    let assembly: OCCTAssembly;
    let solid: OCCTSolid;

    beforeAll(async () => {
        occt = await createBitbybitOcct();
        const vec = new VectorHelperService();
        const s = new ShapesHelperService();
        occHelper = new OccHelper(vec, s, occt);
        assembly = new OCCTAssembly(occt, occHelper);
        solid = new OCCTSolid(occt, occHelper);
    });

    describe("initialization", () => {
        it("should have manager and query services initialized", () => {
            expect(assembly.manager).toBeDefined();
            expect(assembly.query).toBeDefined();
        });

        it("should have manager as instance of OCCTAssemblyManager", () => {
            expect(assembly.manager).toBeDefined();
            expect(assembly.manager.createPart).toBeDefined();
            expect(assembly.manager.buildAssemblyDocument).toBeDefined();
        });

        it("should have query as instance of OCCTAssemblyQuery", () => {
            expect(assembly.query).toBeDefined();
            expect(assembly.query.getDocumentParts).toBeDefined();
            expect(assembly.query.getAssemblyHierarchy).toBeDefined();
        });
    });

    describe("complete assembly workflow", () => {
        let document: Handle_TDocStd_Document;
        let box: TopoDS_Shape;
        let cylinder: TopoDS_Shape;

        beforeEach(() => {
            box = solid.createBox({ width: 10, height: 10, length: 10, center: [0, 0, 0] });
            cylinder = solid.createCylinder({ radius: 5, height: 20, direction: [0, 1, 0], center: [0, 0, 0] });
        });

        afterEach(() => {
            if (document && !document.IsNull()) {
                document.delete();
            }
            if (box) {
                box.delete();
            }
            if (cylinder) {
                cylinder.delete();
            }
        });

        it("should create a simple assembly with one part and one instance", () => {
            // Arrange
            const part = assembly.manager.createPart({
                id: "box-part",
                shape: box,
                name: "Box Part",
                colorRgba: { r: 1, g: 0, b: 0, a: 1 }
            });
            const instance = assembly.manager.createInstanceNode({
                id: "box-instance-1",
                partId: "box-part",
                name: "Box Instance",
                translation: [0, 0, 0]
            });
            const structure = assembly.manager.combineStructure({
                parts: [part],
                nodes: [instance],
                clearDocument: false
            });

            // Act
            document = assembly.manager.buildAssemblyDocument({ structure });

            // Assert
            expect(document).toBeDefined();
            expect(document.IsNull()).toBe(false);

            const parts = assembly.query.getDocumentParts({ document });
            expect(parts.length).toBeGreaterThanOrEqual(1);
            expect(parts.some(p => p.name === "Box Part")).toBe(true);
        });

        it("should create an assembly with multiple instances of the same part", () => {
            // Arrange
            const part = assembly.manager.createPart({
                id: "box-part",
                shape: box,
                name: "Shared Box",
                colorRgba: { r: 0, g: 1, b: 0, a: 1 }
            });
            const instance1 = assembly.manager.createInstanceNode({
                id: "instance-1",
                partId: "box-part",
                name: "Box at Origin",
                translation: [0, 0, 0]
            });
            const instance2 = assembly.manager.createInstanceNode({
                id: "instance-2",
                partId: "box-part",
                name: "Box Translated",
                translation: [20, 0, 0]
            });
            const instance3 = assembly.manager.createInstanceNode({
                id: "instance-3",
                partId: "box-part",
                name: "Box High",
                translation: [0, 20, 0]
            });
            const structure = assembly.manager.combineStructure({
                parts: [part],
                nodes: [instance1, instance2, instance3],
                clearDocument: false
            });

            // Act
            document = assembly.manager.buildAssemblyDocument({ structure });

            // Assert
            expect(document.IsNull()).toBe(false);
            const hierarchy = assembly.query.getAssemblyHierarchy({ document });
            expect(hierarchy.totalNodes).toBeGreaterThanOrEqual(3);
        });

        it("should create an assembly with nested subassemblies", () => {
            // Arrange
            const boxPart = assembly.manager.createPart({
                id: "box-part",
                shape: box,
                name: "Box"
            });
            const cylinderPart = assembly.manager.createPart({
                id: "cylinder-part",
                shape: cylinder,
                name: "Cylinder"
            });
            const subAssembly = assembly.manager.createAssemblyNode({
                id: "sub-assembly",
                name: "Sub Assembly"
            });
            const boxInstance = assembly.manager.createInstanceNode({
                id: "box-in-sub",
                partId: "box-part",
                name: "Box in Sub",
                parentId: "sub-assembly",
                translation: [0, 0, 0]
            });
            const cylinderInstance = assembly.manager.createInstanceNode({
                id: "cylinder-in-sub",
                partId: "cylinder-part",
                name: "Cylinder in Sub",
                parentId: "sub-assembly",
                translation: [15, 0, 0]
            });
            const structure = assembly.manager.combineStructure({
                parts: [boxPart, cylinderPart],
                nodes: [subAssembly, boxInstance, cylinderInstance],
                clearDocument: false
            });

            // Act
            document = assembly.manager.buildAssemblyDocument({ structure });

            // Assert
            expect(document.IsNull()).toBe(false);
            const hierarchy = assembly.query.getAssemblyHierarchy({ document });
            expect(hierarchy.nodes.some(n => n.name === "Sub Assembly")).toBe(true);
        });

        it("should create an assembly and export to STEP format", () => {
            // Arrange
            const part = assembly.manager.createPart({
                id: "box-part",
                shape: box,
                name: "Export Test Box"
            });
            const instance = assembly.manager.createInstanceNode({
                id: "instance",
                partId: "box-part",
                name: "Instance"
            });
            const structure = assembly.manager.combineStructure({
                parts: [part],
                nodes: [instance],
                clearDocument: false
            });

            // Act
            document = assembly.manager.buildAssemblyDocument({ structure });
            const stepData = assembly.manager.exportDocumentToStep({
                document,
                fileName: "test.step",
                author: "Test Author",
                organization: "Test Org",
                compress: false,
                tryDownload: false
            });

            // Assert
            expect(stepData).toBeDefined();
            expect(stepData.length).toBeGreaterThan(0);
            const stepText = new TextDecoder().decode(stepData);
            expect(stepText).toContain("ISO-10303-21");
        });

        it("should create an assembly and export to glTF format", () => {
            // Arrange
            const part = assembly.manager.createPart({
                id: "box-part",
                shape: box,
                name: "glTF Test Box"
            });
            const instance = assembly.manager.createInstanceNode({
                id: "instance",
                partId: "box-part",
                name: "Instance"
            });
            const structure = assembly.manager.combineStructure({
                parts: [part],
                nodes: [instance],
                clearDocument: false
            });

            // Act
            document = assembly.manager.buildAssemblyDocument({ structure });
            const gltfData = assembly.manager.exportDocumentToGltf({
                document,
                meshDeflection: 0.1,
                meshAngle: 0.5,
                mergeFaces: false,
                forceUVExport: false,
                fileName: "test.glb",
                tryDownload: false
            });

            // Assert
            expect(gltfData).toBeDefined();
            expect(gltfData.length).toBeGreaterThan(0);
            // GLB files start with 'glTF' magic bytes
            const magic = new TextDecoder().decode(gltfData.slice(0, 4));
            expect(magic).toBe("glTF");
        });

        it("should query document parts after building assembly", () => {
            // Arrange
            const boxPart = assembly.manager.createPart({
                id: "box",
                shape: box,
                name: "QueryTestBox"
            });
            const cylPart = assembly.manager.createPart({
                id: "cyl",
                shape: cylinder,
                name: "QueryTestCylinder"
            });
            const structure = assembly.manager.combineStructure({
                parts: [boxPart, cylPart],
                nodes: [
                    assembly.manager.createInstanceNode({ id: "i1", partId: "box", name: "BoxInstance" }),
                    assembly.manager.createInstanceNode({ id: "i2", partId: "cyl", name: "CylInstance" })
                ],
                clearDocument: false
            });

            // Act
            document = assembly.manager.buildAssemblyDocument({ structure });
            const parts = assembly.query.getDocumentParts({ document });

            // Assert
            expect(parts.length).toBeGreaterThanOrEqual(2);
            const partNames = parts.map(p => p.name);
            expect(partNames).toContain("QueryTestBox");
            expect(partNames).toContain("QueryTestCylinder");
        });

        it("should get assembly hierarchy with correct structure", () => {
            // Arrange
            const part = assembly.manager.createPart({
                id: "part",
                shape: box,
                name: "HierarchyPart"
            });
            const rootAssembly = assembly.manager.createAssemblyNode({
                id: "root",
                name: "RootAssembly"
            });
            const instance = assembly.manager.createInstanceNode({
                id: "inst",
                partId: "part",
                name: "PartInstance",
                parentId: "root"
            });
            const structure = assembly.manager.combineStructure({
                parts: [part],
                nodes: [rootAssembly, instance],
                clearDocument: false
            });

            // Act
            document = assembly.manager.buildAssemblyDocument({ structure });
            const hierarchy = assembly.query.getAssemblyHierarchy({ document });

            // Assert
            expect(hierarchy.version).toBe("2.0");
            expect(hierarchy.totalNodes).toBeGreaterThan(0);
            expect(hierarchy.nodes.length).toBe(hierarchy.totalNodes);
        });
    });
});
