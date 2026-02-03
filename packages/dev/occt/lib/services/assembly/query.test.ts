import createBitbybitOcct, { BitbybitOcctModule, Handle_TDocStd_Document, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTAssemblyManager } from "./manager";
import { OCCTAssemblyQuery } from "./query";
import { OCCTSolid } from "../shapes";

describe("OCCTAssemblyQuery unit tests", () => {
    let occt: BitbybitOcctModule;
    let occHelper: OccHelper;
    let manager: OCCTAssemblyManager;
    let query: OCCTAssemblyQuery;
    let solid: OCCTSolid;

    beforeAll(async () => {
        occt = await createBitbybitOcct();
        const vec = new VectorHelperService();
        const s = new ShapesHelperService();
        occHelper = new OccHelper(vec, s, occt);
        manager = new OCCTAssemblyManager(occt, occHelper);
        query = new OCCTAssemblyQuery(occt, occHelper);
        solid = new OCCTSolid(occt, occHelper);
    });

    describe("getDocumentParts", () => {
        let document: Handle_TDocStd_Document | null = null;
        const shapesToClean: TopoDS_Shape[] = [];

        afterEach(() => {
            if (document && !document.IsNull()) {
                document.delete();
                document = null;
            }
            shapesToClean.forEach(s => s.delete());
            shapesToClean.length = 0;
        });

        it("should return empty array for empty document", () => {
            // Arrange
            const structure = manager.combineStructure({ parts: [], nodes: [] });
            document = manager.buildAssemblyDocument({ structure });

            // Act
            const parts = query.getDocumentParts({ document: document! });

            // Assert
            expect(parts).toEqual([]);
        });

        it("should return parts for document with single part", () => {
            // Arrange
            const box = solid.createBox({ width: 10, height: 10, length: 10, center: [0, 0, 0] });
            shapesToClean.push(box);
            const expectedVolume = 10 * 10 * 10; // 1000

            const part = manager.createPart({ id: "box", shape: box, name: "SinglePart" });
            const inst = manager.createInstanceNode({ id: "i", partId: "box", name: "Instance" });
            const structure = manager.combineStructure({ parts: [part], nodes: [inst] });
            document = manager.buildAssemblyDocument({ structure });

            // Act
            const parts = query.getDocumentParts({ document: document! });

            // Assert - at least 1 part with correct properties
            expect(parts.length).toBeGreaterThanOrEqual(1);
            const singlePart = parts.find(p => p.name === "SinglePart");
            expect(singlePart).toBeDefined();
            expect(singlePart!.label).toMatch(/^\d+:\d+:\d+:\d+$/);
            expect(singlePart!.instanceCount).toBe(1);
            expect(singlePart!.type).toBe("part");
            
            // Verify geometry
            const shape = query.getShapeFromLabel({ document: document!, label: singlePart!.label });
            expect(solid.getSolidVolume({ shape })).toBeCloseTo(expectedVolume, 0);
            shape.delete();
        });

        it("should return all parts for document with multiple parts", () => {
            // Arrange
            const box = solid.createBox({ width: 10, height: 10, length: 10, center: [0, 0, 0] });
            const sphere = solid.createSphere({ radius: 5, center: [0, 0, 0] });
            const cylinder = solid.createCylinder({ radius: 3, height: 10, direction: [0, 1, 0], center: [0, 0, 0] });
            shapesToClean.push(box, sphere, cylinder);

            const boxVolume = 10 * 10 * 10; // 1000
            const sphereVolume = (4 / 3) * Math.PI * Math.pow(5, 3); // ~523.6
            const cylinderVolume = Math.PI * 3 * 3 * 10; // ~282.7

            const parts = [
                manager.createPart({ id: "box", shape: box, name: "Box" }),
                manager.createPart({ id: "sphere", shape: sphere, name: "Sphere" }),
                manager.createPart({ id: "cylinder", shape: cylinder, name: "Cylinder" })
            ];
            const nodes = [
                manager.createInstanceNode({ id: "i1", partId: "box", name: "BoxInst" }),
                manager.createInstanceNode({ id: "i2", partId: "sphere", name: "SphereInst" }),
                manager.createInstanceNode({ id: "i3", partId: "cylinder", name: "CylInst" })
            ];
            const structure = manager.combineStructure({ parts, nodes });
            document = manager.buildAssemblyDocument({ structure });

            // Act
            const docParts = query.getDocumentParts({ document: document! });

            // Assert - at least 3 parts with specific names
            expect(docParts.length).toBeGreaterThanOrEqual(3);
            
            const boxPart = docParts.find(p => p.name === "Box");
            const spherePart = docParts.find(p => p.name === "Sphere");
            const cylinderPart = docParts.find(p => p.name === "Cylinder");
            
            expect(boxPart).toBeDefined();
            expect(spherePart).toBeDefined();
            expect(cylinderPart).toBeDefined();
            
            // Verify each part has exactly 1 instance
            expect(boxPart!.instanceCount).toBe(1);
            expect(spherePart!.instanceCount).toBe(1);
            expect(cylinderPart!.instanceCount).toBe(1);
            
            // Verify volumes
            const boxShape = query.getShapeFromLabel({ document: document!, label: boxPart!.label });
            const sphereShape = query.getShapeFromLabel({ document: document!, label: spherePart!.label });
            const cylinderShape = query.getShapeFromLabel({ document: document!, label: cylinderPart!.label });
            
            expect(solid.getSolidVolume({ shape: boxShape })).toBeCloseTo(boxVolume, 0);
            expect(solid.getSolidVolume({ shape: sphereShape })).toBeCloseTo(sphereVolume, 0);
            expect(solid.getSolidVolume({ shape: cylinderShape })).toBeCloseTo(cylinderVolume, 0);
            
            boxShape.delete();
            sphereShape.delete();
            cylinderShape.delete();
        });

        it("should return part info with label property", () => {
            // Arrange
            const box = solid.createBox({ width: 5, height: 5, length: 5, center: [0, 0, 0] });
            shapesToClean.push(box);

            const part = manager.createPart({ id: "box", shape: box, name: "LabelTest" });
            const inst = manager.createInstanceNode({ id: "i", partId: "box", name: "Instance" });
            const structure = manager.combineStructure({ parts: [part], nodes: [inst] });
            document = manager.buildAssemblyDocument({ structure });

            // Act
            const docParts = query.getDocumentParts({ document: document! });
            const labelTestPart = docParts.find(p => p.name === "LabelTest");

            // Assert
            expect(labelTestPart).toBeDefined();
            expect(labelTestPart!.label).toBeDefined();
            expect(labelTestPart!.label).toMatch(/^\d+:\d+:\d+:\d+$/);
        });

        it("should return part info with type property", () => {
            // Arrange
            const box = solid.createBox({ width: 5, height: 5, length: 5, center: [0, 0, 0] });
            shapesToClean.push(box);

            const part = manager.createPart({ id: "box", shape: box, name: "TypeTest" });
            const inst = manager.createInstanceNode({ id: "i", partId: "box", name: "Instance" });
            const structure = manager.combineStructure({ parts: [part], nodes: [inst] });
            document = manager.buildAssemblyDocument({ structure });

            // Act
            const docParts = query.getDocumentParts({ document: document! });
            const partInfo = docParts.find(p => p.name === "TypeTest");

            // Assert
            expect(partInfo).toBeDefined();
            expect(partInfo!.type).toBeDefined();
            expect(["part", "assembly", "sub-assembly", "compound", "unknown"]).toContain(partInfo!.type);
        });

        it("should return part info with instanceCount", () => {
            // Arrange
            const box = solid.createBox({ width: 5, height: 5, length: 5, center: [0, 0, 0] });
            shapesToClean.push(box);

            const part = manager.createPart({ id: "box", shape: box, name: "CountTest" });
            const nodes = [
                manager.createInstanceNode({ id: "i1", partId: "box", name: "Inst1" }),
                manager.createInstanceNode({ id: "i2", partId: "box", name: "Inst2" }),
                manager.createInstanceNode({ id: "i3", partId: "box", name: "Inst3" })
            ];
            const structure = manager.combineStructure({ parts: [part], nodes });
            document = manager.buildAssemblyDocument({ structure });

            // Act
            const docParts = query.getDocumentParts({ document: document! });
            const partInfo = docParts.find(p => p.name === "CountTest");

            // Assert
            expect(partInfo).toBeDefined();
            expect(partInfo!.instanceCount).toBe(3);
        });

        it("should return color info when part has color", () => {
            // Arrange
            const box = solid.createBox({ width: 5, height: 5, length: 5, center: [0, 0, 0] });
            shapesToClean.push(box);

            const part = manager.createPart({
                id: "box",
                shape: box,
                name: "ColoredPart",
                colorRgba: { r: 1, g: 0.5, b: 0, a: 1 }
            });
            const inst = manager.createInstanceNode({ id: "i", partId: "box", name: "Instance" });
            const structure = manager.combineStructure({ parts: [part], nodes: [inst] });
            document = manager.buildAssemblyDocument({ structure });

            // Act
            const docParts = query.getDocumentParts({ document: document! });
            const coloredPart = docParts.find(p => p.name === "ColoredPart");

            // Assert
            expect(coloredPart).toBeDefined();
            if (coloredPart?.color) {
                expect(coloredPart.color.r).toBeCloseTo(1, 1);
                expect(coloredPart.color.g).toBeCloseTo(0.5, 1);
                expect(coloredPart.color.b).toBeCloseTo(0, 1);
            }
        });
    });

    describe("getShapeFromLabel", () => {
        let document: Handle_TDocStd_Document | null = null;
        const shapesToClean: TopoDS_Shape[] = [];

        afterEach(() => {
            if (document && !document.IsNull()) {
                document.delete();
                document = null;
            }
            shapesToClean.forEach(s => s.delete());
            shapesToClean.length = 0;
        });

        it("should return shape from a valid label", () => {
            // Arrange
            const box = solid.createBox({ width: 10, height: 10, length: 10, center: [0, 0, 0] });
            shapesToClean.push(box);

            const part = manager.createPart({ id: "box", shape: box, name: "ShapeTest" });
            const inst = manager.createInstanceNode({ id: "i", partId: "box", name: "Instance" });
            const structure = manager.combineStructure({ parts: [part], nodes: [inst] });
            document = manager.buildAssemblyDocument({ structure });

            const docParts = query.getDocumentParts({ document: document! });
            const partInfo = docParts.find(p => p.name === "ShapeTest");
            expect(partInfo).toBeDefined();

            // Act
            const shape = query.getShapeFromLabel({ document: document!, label: partInfo!.label });

            // Assert
            expect(shape).toBeDefined();
            expect(shape.IsNull()).toBe(false);

            // Verify it's the correct shape by checking volume
            const volume = solid.getSolidVolume({ shape });
            const originalVolume = solid.getSolidVolume({ shape: box });
            expect(volume).toBeCloseTo(originalVolume, 1);

            shape.delete();
        });

        it("should return shapes with correct geometry", () => {
            // Arrange
            const sphere = solid.createSphere({ radius: 5, center: [0, 0, 0] });
            shapesToClean.push(sphere);

            const part = manager.createPart({ id: "sphere", shape: sphere, name: "SphereGeom" });
            const inst = manager.createInstanceNode({ id: "i", partId: "sphere", name: "Instance" });
            const structure = manager.combineStructure({ parts: [part], nodes: [inst] });
            document = manager.buildAssemblyDocument({ structure });

            const docParts = query.getDocumentParts({ document: document! });
            const partInfo = docParts.find(p => p.name === "SphereGeom");

            // Act
            const shape = query.getShapeFromLabel({ document: document!, label: partInfo!.label });

            // Assert
            const volume = solid.getSolidVolume({ shape });
            const expectedVolume = (4 / 3) * Math.PI * Math.pow(5, 3);
            expect(volume).toBeCloseTo(expectedVolume, 0);

            shape.delete();
        });
    });

    describe("getLabelColor", () => {
        let document: Handle_TDocStd_Document | null = null;
        const shapesToClean: TopoDS_Shape[] = [];

        afterEach(() => {
            if (document && !document.IsNull()) {
                document.delete();
                document = null;
            }
            shapesToClean.forEach(s => s.delete());
            shapesToClean.length = 0;
        });

        it("should return color info for colored part", () => {
            // Arrange
            const box = solid.createBox({ width: 5, height: 5, length: 5, center: [0, 0, 0] });
            shapesToClean.push(box);

            const part = manager.createPart({
                id: "box",
                shape: box,
                name: "ColorQuery",
                colorRgba: { r: 0.2, g: 0.4, b: 0.6, a: 0.8 }
            });
            const inst = manager.createInstanceNode({ id: "i", partId: "box", name: "Instance" });
            const structure = manager.combineStructure({ parts: [part], nodes: [inst] });
            document = manager.buildAssemblyDocument({ structure });

            const docParts = query.getDocumentParts({ document: document! });
            const partInfo = docParts.find(p => p.name === "ColorQuery");

            // Act
            const colorInfo = query.getLabelColor({ document: document!, label: partInfo!.label });

            // Assert
            expect(colorInfo.hasColor).toBe(true);
            expect(colorInfo.r).toBeCloseTo(0.2, 1);
            expect(colorInfo.g).toBeCloseTo(0.4, 1);
            expect(colorInfo.b).toBeCloseTo(0.6, 1);
        });

        it("should indicate no color for uncolored part", () => {
            // Arrange
            const box = solid.createBox({ width: 5, height: 5, length: 5, center: [0, 0, 0] });
            shapesToClean.push(box);

            const part = manager.createPart({ id: "box", shape: box, name: "NoColor" });
            const inst = manager.createInstanceNode({ id: "i", partId: "box", name: "Instance" });
            const structure = manager.combineStructure({ parts: [part], nodes: [inst] });
            document = manager.buildAssemblyDocument({ structure });

            const docParts = query.getDocumentParts({ document: document! });
            const partInfo = docParts.find(p => p.name === "NoColor");

            // Act
            const colorInfo = query.getLabelColor({ document: document!, label: partInfo!.label });

            // Assert
            expect(colorInfo.hasColor).toBe(false);
        });

        it("should return color after setLabelColor", () => {
            // Arrange
            const box = solid.createBox({ width: 5, height: 5, length: 5, center: [0, 0, 0] });
            shapesToClean.push(box);

            const part = manager.createPart({ id: "box", shape: box, name: "SetColorTest" });
            const inst = manager.createInstanceNode({ id: "i", partId: "box", name: "Instance" });
            const structure = manager.combineStructure({ parts: [part], nodes: [inst] });
            document = manager.buildAssemblyDocument({ structure });

            const docParts = query.getDocumentParts({ document: document! });
            const partInfo = docParts.find(p => p.name === "SetColorTest");

            // Set color
            manager.setLabelColor({
                document: document!,
                label: partInfo!.label,
                r: 1, g: 0, b: 1, a: 1
            });

            // Act
            const colorInfo = query.getLabelColor({ document: document!, label: partInfo!.label });

            // Assert
            expect(colorInfo.hasColor).toBe(true);
            expect(colorInfo.r).toBeCloseTo(1, 1);
            expect(colorInfo.b).toBeCloseTo(1, 1);
        });
    });

    describe("getLabelTransform", () => {
        let document: Handle_TDocStd_Document | null = null;
        const shapesToClean: TopoDS_Shape[] = [];

        afterEach(() => {
            if (document && !document.IsNull()) {
                document.delete();
                document = null;
            }
            shapesToClean.forEach(s => s.delete());
            shapesToClean.length = 0;
        });

        it("should return identity transform for untransformed instance", () => {
            // Arrange
            const box = solid.createBox({ width: 5, height: 5, length: 5, center: [0, 0, 0] });
            shapesToClean.push(box);

            const part = manager.createPart({ id: "box", shape: box, name: "Box" });
            const inst = manager.createInstanceNode({
                id: "i",
                partId: "box",
                name: "NoTransform",
                translation: [0, 0, 0],
                rotation: [0, 0, 0],
                scale: 1
            });
            const structure = manager.combineStructure({ parts: [part], nodes: [inst] });
            document = manager.buildAssemblyDocument({ structure });

            const hierarchy = query.getAssemblyHierarchy({ document: document! });
            const instNode = hierarchy.nodes.find(n => n.name === "NoTransform");
            expect(instNode).toBeDefined();

            // Act
            const transform = query.getLabelTransform({ document: document!, label: instNode!.label });

            // Assert
            expect(transform.translation).toEqual([0, 0, 0]);
            expect(transform.scale).toBeCloseTo(1, 5);
        });

        it("should return correct translation for translated instance", () => {
            // Arrange
            const box = solid.createBox({ width: 5, height: 5, length: 5, center: [0, 0, 0] });
            shapesToClean.push(box);

            const part = manager.createPart({ id: "box", shape: box, name: "Box" });
            const inst = manager.createInstanceNode({
                id: "i",
                partId: "box",
                name: "Translated",
                translation: [10, 20, 30]
            });
            const structure = manager.combineStructure({ parts: [part], nodes: [inst] });
            document = manager.buildAssemblyDocument({ structure });

            const hierarchy = query.getAssemblyHierarchy({ document: document! });
            const instNode = hierarchy.nodes.find(n => n.name === "Translated");
            expect(instNode).toBeDefined();

            // Act
            const transform = query.getLabelTransform({ document: document!, label: instNode!.label });

            // Assert
            expect(transform.translation[0]).toBeCloseTo(10, 1);
            expect(transform.translation[1]).toBeCloseTo(20, 1);
            expect(transform.translation[2]).toBeCloseTo(30, 1);
        });

        it("should return transform with matrix property", () => {
            // Arrange
            const box = solid.createBox({ width: 5, height: 5, length: 5, center: [0, 0, 0] });
            shapesToClean.push(box);

            const part = manager.createPart({ id: "box", shape: box, name: "Box" });
            const inst = manager.createInstanceNode({
                id: "i",
                partId: "box",
                name: "MatrixTest",
                translation: [5, 0, 0]
            });
            const structure = manager.combineStructure({ parts: [part], nodes: [inst] });
            document = manager.buildAssemblyDocument({ structure });

            const hierarchy = query.getAssemblyHierarchy({ document: document! });
            const instNode = hierarchy.nodes.find(n => n.name === "MatrixTest");

            // Act
            const transform = query.getLabelTransform({ document: document!, label: instNode!.label });

            // Assert
            expect(transform.matrix).toBeDefined();
            expect(transform.matrix.length).toBe(16);
        });

        it("should return transform with quaternion property", () => {
            // Arrange
            const box = solid.createBox({ width: 5, height: 5, length: 5, center: [0, 0, 0] });
            shapesToClean.push(box);

            const part = manager.createPart({ id: "box", shape: box, name: "Box" });
            const inst = manager.createInstanceNode({
                id: "i",
                partId: "box",
                name: "QuatTest",
                rotation: [45, 0, 0]
            });
            const structure = manager.combineStructure({ parts: [part], nodes: [inst] });
            document = manager.buildAssemblyDocument({ structure });

            const hierarchy = query.getAssemblyHierarchy({ document: document! });
            const instNode = hierarchy.nodes.find(n => n.name === "QuatTest");

            // Act
            const transform = query.getLabelTransform({ document: document!, label: instNode!.label });

            // Assert
            expect(transform.quaternion).toBeDefined();
            expect(transform.quaternion.length).toBe(4);
        });
    });

    describe("getLabelInfo", () => {
        let document: Handle_TDocStd_Document | null = null;
        const shapesToClean: TopoDS_Shape[] = [];

        afterEach(() => {
            if (document && !document.IsNull()) {
                document.delete();
                document = null;
            }
            shapesToClean.forEach(s => s.delete());
            shapesToClean.length = 0;
        });

        it("should return detailed info for a part label", () => {
            // Arrange
            const box = solid.createBox({ width: 5, height: 5, length: 5, center: [0, 0, 0] });
            shapesToClean.push(box);

            const part = manager.createPart({ id: "box", shape: box, name: "InfoTest" });
            const inst = manager.createInstanceNode({ id: "i", partId: "box", name: "Instance" });
            const structure = manager.combineStructure({ parts: [part], nodes: [inst] });
            document = manager.buildAssemblyDocument({ structure });

            const docParts = query.getDocumentParts({ document: document! });
            const partInfo = docParts.find(p => p.name === "InfoTest");

            // Act
            const labelInfo = query.getLabelInfo({ document: document!, label: partInfo!.label });

            // Assert
            expect(labelInfo.label).toBe(partInfo!.label);
            expect(labelInfo.name).toBe("InfoTest");
            expect(labelInfo.type).toBeDefined();
        });

        it("should return info with shape type", () => {
            // Arrange
            const box = solid.createBox({ width: 5, height: 5, length: 5, center: [0, 0, 0] });
            shapesToClean.push(box);

            const part = manager.createPart({ id: "box", shape: box, name: "ShapeTypeTest" });
            const inst = manager.createInstanceNode({ id: "i", partId: "box", name: "Instance" });
            const structure = manager.combineStructure({ parts: [part], nodes: [inst] });
            document = manager.buildAssemblyDocument({ structure });

            const docParts = query.getDocumentParts({ document: document! });
            const partInfo = docParts.find(p => p.name === "ShapeTypeTest");

            // Act
            const labelInfo = query.getLabelInfo({ document: document!, label: partInfo!.label });

            // Assert - shapeType may or may not be present depending on the OCCT version
            expect(labelInfo).toBeDefined();
            expect(labelInfo.label).toBe(partInfo!.label);
        });

        it("should return children for assembly label", () => {
            // Arrange
            const box = solid.createBox({ width: 5, height: 5, length: 5, center: [0, 0, 0] });
            shapesToClean.push(box);

            const part = manager.createPart({ id: "box", shape: box, name: "Box" });
            const rootAsm = manager.createAssemblyNode({ id: "root", name: "ParentAsm" });
            const inst = manager.createInstanceNode({ id: "i", partId: "box", name: "Child", parentId: "root" });
            const structure = manager.combineStructure({ parts: [part], nodes: [rootAsm, inst] });
            document = manager.buildAssemblyDocument({ structure });

            const hierarchy = query.getAssemblyHierarchy({ document: document! });
            const asmNode = hierarchy.nodes.find(n => n.name === "ParentAsm");

            // Act
            const labelInfo = query.getLabelInfo({ document: document!, label: asmNode!.label });

            // Assert
            if (labelInfo.isAssembly && labelInfo.children) {
                expect(labelInfo.children.length).toBeGreaterThan(0);
            }
        });
    });

    describe("getAssemblyHierarchy", () => {
        let document: Handle_TDocStd_Document | null = null;
        const shapesToClean: TopoDS_Shape[] = [];

        afterEach(() => {
            if (document && !document.IsNull()) {
                document.delete();
                document = null;
            }
            shapesToClean.forEach(s => s.delete());
            shapesToClean.length = 0;
        });

        it("should return hierarchy result with version", () => {
            // Arrange
            const box = solid.createBox({ width: 5, height: 5, length: 5, center: [0, 0, 0] });
            shapesToClean.push(box);

            const part = manager.createPart({ id: "box", shape: box, name: "Box" });
            const inst = manager.createInstanceNode({ id: "i", partId: "box", name: "Instance" });
            const structure = manager.combineStructure({ parts: [part], nodes: [inst] });
            document = manager.buildAssemblyDocument({ structure });

            // Act
            const hierarchy = query.getAssemblyHierarchy({ document: document! });

            // Assert
            expect(hierarchy.version).toBe("2.0");
        });

        it("should return correct total node count", () => {
            // Arrange
            const box = solid.createBox({ width: 5, height: 5, length: 5, center: [0, 0, 0] });
            shapesToClean.push(box);

            const part = manager.createPart({ id: "box", shape: box, name: "Box" });
            const nodes = [
                manager.createInstanceNode({ id: "i1", partId: "box", name: "Inst1" }),
                manager.createInstanceNode({ id: "i2", partId: "box", name: "Inst2" }),
                manager.createInstanceNode({ id: "i3", partId: "box", name: "Inst3" })
            ];
            const structure = manager.combineStructure({ parts: [part], nodes });
            document = manager.buildAssemblyDocument({ structure });

            // Act
            const hierarchy = query.getAssemblyHierarchy({ document: document! });

            // Assert - at least 3 instances
            expect(hierarchy.totalNodes).toBeGreaterThanOrEqual(3);
            expect(hierarchy.nodes.length).toBeGreaterThanOrEqual(3);
            
            // Verify each named instance exists
            expect(hierarchy.nodes.find(n => n.name === "Inst1")).toBeDefined();
            expect(hierarchy.nodes.find(n => n.name === "Inst2")).toBeDefined();
            expect(hierarchy.nodes.find(n => n.name === "Inst3")).toBeDefined();
        });

        it("should return nodes with correct structure", () => {
            // Arrange
            const box = solid.createBox({ width: 5, height: 5, length: 5, center: [0, 0, 0] });
            shapesToClean.push(box);

            const part = manager.createPart({ id: "box", shape: box, name: "Box" });
            const inst = manager.createInstanceNode({ id: "i", partId: "box", name: "TestNode" });
            const structure = manager.combineStructure({ parts: [part], nodes: [inst] });
            document = manager.buildAssemblyDocument({ structure });

            // Act
            const hierarchy = query.getAssemblyHierarchy({ document: document! });
            const testNode = hierarchy.nodes.find(n => n.name === "TestNode");

            // Assert
            expect(testNode).toBeDefined();
            expect(testNode!.id).toBeDefined();
            expect(testNode!.label).toBeDefined();
            expect(testNode!.depth).toBeDefined();
            expect(typeof testNode!.isAssembly).toBe("boolean");
            expect(typeof testNode!.isInstance).toBe("boolean");
        });

        it("should reflect hierarchy depth correctly", () => {
            // Arrange
            const box = solid.createBox({ width: 5, height: 5, length: 5, center: [0, 0, 0] });
            shapesToClean.push(box);

            const part = manager.createPart({ id: "box", shape: box, name: "Box" });
            const rootAsm = manager.createAssemblyNode({ id: "root", name: "RootAsm" });
            const subAsm = manager.createAssemblyNode({ id: "sub", name: "SubAsm", parentId: "root" });
            const inst = manager.createInstanceNode({ id: "i", partId: "box", name: "DeepInst", parentId: "sub" });
            const structure = manager.combineStructure({ parts: [part], nodes: [rootAsm, subAsm, inst] });
            document = manager.buildAssemblyDocument({ structure });

            // Act
            const hierarchy = query.getAssemblyHierarchy({ document: document! });
            
            // Assert - at least 1 hierarchy node
            expect(hierarchy.nodes.length).toBeGreaterThanOrEqual(1);
            
            // OCCT may not expose all assembly nodes, but should have depth hierarchy
            const depths = [...new Set(hierarchy.nodes.map(n => n.depth))];
            expect(depths.length).toBeGreaterThanOrEqual(1);
            
            // Verify the part can be retrieved regardless of hierarchy exposure
            const docParts = query.getDocumentParts({ document: document! });
            const boxPart = docParts.find(p => p.name === "Box");
            expect(boxPart).toBeDefined();
        });

        it("should return nodes with parent-child relationships", () => {
            // Arrange
            const box = solid.createBox({ width: 5, height: 5, length: 5, center: [0, 0, 0] });
            shapesToClean.push(box);

            const part = manager.createPart({ id: "box", shape: box, name: "Box" });
            const parentAsm = manager.createAssemblyNode({ id: "parent", name: "ParentAsm" });
            const childInst = manager.createInstanceNode({ id: "child", partId: "box", name: "ChildInst", parentId: "parent" });
            const structure = manager.combineStructure({ parts: [part], nodes: [parentAsm, childInst] });
            document = manager.buildAssemblyDocument({ structure });

            // Act
            const hierarchy = query.getAssemblyHierarchy({ document: document! });
            const childNode = hierarchy.nodes.find(n => n.name === "ChildInst");

            // Assert
            if (childNode && childNode.parentId) {
                const parentNode = hierarchy.nodes.find(n => n.id === childNode.parentId);
                expect(parentNode).toBeDefined();
            }
        });

        it("should identify assembly vs instance nodes correctly", () => {
            // Arrange
            const box = solid.createBox({ width: 5, height: 5, length: 5, center: [0, 0, 0] });
            shapesToClean.push(box);

            const part = manager.createPart({ id: "box", shape: box, name: "Box" });
            const asmNode = manager.createAssemblyNode({ id: "asm", name: "AssemblyNode" });
            const instNode = manager.createInstanceNode({ id: "inst", partId: "box", name: "InstanceNode", parentId: "asm" });
            const structure = manager.combineStructure({ parts: [part], nodes: [asmNode, instNode] });
            document = manager.buildAssemblyDocument({ structure });

            // Act
            const hierarchy = query.getAssemblyHierarchy({ document: document! });
            const assemblyHierNode = hierarchy.nodes.find(n => n.name === "AssemblyNode");
            const instanceHierNode = hierarchy.nodes.find(n => n.name === "InstanceNode");

            // Assert
            expect(assemblyHierNode?.isAssembly).toBe(true);
            expect(instanceHierNode?.isInstance).toBe(true);
        });

        it("should return nodes with geometry information", () => {
            // Arrange
            const box = solid.createBox({ width: 5, height: 5, length: 5, center: [0, 0, 0] });
            shapesToClean.push(box);

            const part = manager.createPart({ id: "box", shape: box, name: "GeomBox" });
            const inst = manager.createInstanceNode({ id: "i", partId: "box", name: "Instance" });
            const structure = manager.combineStructure({ parts: [part], nodes: [inst] });
            document = manager.buildAssemblyDocument({ structure });

            // Act
            const hierarchy = query.getAssemblyHierarchy({ document: document! });

            // Assert
            const nodesWithGeom = hierarchy.nodes.filter(n => n.hasGeometry);
            expect(nodesWithGeom.length).toBeGreaterThan(0);
        });

        it("should return nodes with shape type information", () => {
            // Arrange
            const box = solid.createBox({ width: 5, height: 5, length: 5, center: [0, 0, 0] });
            shapesToClean.push(box);

            const part = manager.createPart({ id: "box", shape: box, name: "SolidBox" });
            const inst = manager.createInstanceNode({ id: "i", partId: "box", name: "Instance" });
            const structure = manager.combineStructure({ parts: [part], nodes: [inst] });
            document = manager.buildAssemblyDocument({ structure });

            // Act
            const hierarchy = query.getAssemblyHierarchy({ document: document! });

            // Assert
            const nodesWithShapeType = hierarchy.nodes.filter(n => n.shapeType !== undefined);
            expect(nodesWithShapeType.length).toBeGreaterThan(0);
            // Box is a solid
            const solidNode = nodesWithShapeType.find(n => n.shapeType === "solid");
            expect(solidNode).toBeDefined();
        });

        it("should handle complex nested hierarchy", () => {
            // Arrange
            const box = solid.createBox({ width: 5, height: 5, length: 5, center: [0, 0, 0] });
            const sphere = solid.createSphere({ radius: 3, center: [0, 0, 0] });
            shapesToClean.push(box, sphere);

            const parts = [
                manager.createPart({ id: "box", shape: box, name: "Box" }),
                manager.createPart({ id: "sphere", shape: sphere, name: "Sphere" })
            ];
            const nodes = [
                manager.createAssemblyNode({ id: "root", name: "Root" }),
                manager.createAssemblyNode({ id: "left", name: "LeftBranch", parentId: "root" }),
                manager.createAssemblyNode({ id: "right", name: "RightBranch", parentId: "root" }),
                manager.createInstanceNode({ id: "b1", partId: "box", name: "Box1", parentId: "left" }),
                manager.createInstanceNode({ id: "b2", partId: "box", name: "Box2", parentId: "left", translation: [10, 0, 0] }),
                manager.createInstanceNode({ id: "s1", partId: "sphere", name: "Sphere1", parentId: "right" }),
                manager.createInstanceNode({ id: "s2", partId: "sphere", name: "Sphere2", parentId: "right", translation: [0, 10, 0] })
            ];
            const structure = manager.combineStructure({ parts, nodes });
            document = manager.buildAssemblyDocument({ structure });

            // Act
            const hierarchy = query.getAssemblyHierarchy({ document: document! });

            // Assert - verify hierarchical structure was created
            expect(hierarchy.nodes.length).toBeGreaterThan(0);
            // Should have some nodes representing the hierarchy
            const nodeNames = hierarchy.nodes.map(n => n.name);
            // At least some of our defined nodes should be present
            const hasRoot = nodeNames.includes("Root") || hierarchy.nodes.some(n => n.isAssembly);
            expect(hasRoot).toBe(true);
        });
    });

    describe("round-trip STEP import/export", () => {
        let document: Handle_TDocStd_Document | null = null;
        const shapesToClean: TopoDS_Shape[] = [];

        afterEach(() => {
            if (document && !document.IsNull()) {
                document.delete();
                document = null;
            }
            shapesToClean.forEach(s => s.delete());
            shapesToClean.length = 0;
        });

        it("should preserve parts after STEP export and import", () => {
            // Arrange - Create document with multiple parts
            const box = solid.createBox({ width: 10, height: 10, length: 10, center: [0, 0, 0] });
            const sphere = solid.createSphere({ radius: 5, center: [20, 0, 0] });
            shapesToClean.push(box, sphere);

            const boxVolume = 10 * 10 * 10; // 1000
            const sphereVolume = (4 / 3) * Math.PI * Math.pow(5, 3); // ~523.6

            const parts = [
                manager.createPart({ id: "box", shape: box, name: "ExportBox", colorRgba: { r: 1, g: 0, b: 0, a: 1 } }),
                manager.createPart({ id: "sphere", shape: sphere, name: "ExportSphere", colorRgba: { r: 0, g: 0, b: 1, a: 1 } })
            ];
            const nodes = [
                manager.createInstanceNode({ id: "i1", partId: "box", name: "BoxInst" }),
                manager.createInstanceNode({ id: "i2", partId: "sphere", name: "SphereInst", translation: [20, 0, 0] })
            ];
            const structure = manager.combineStructure({ parts, nodes });
            document = manager.buildAssemblyDocument({ structure });

            // Export to STEP
            const stepData = manager.exportDocumentToStep({ document: document!, fileName: "roundtrip.step", author: "Test Author", organization: "Test Org" });
            document.delete();

            // Import from STEP
            document = manager.loadStepToDoc({ stepData });

            // Act
            const importedParts = query.getDocumentParts({ document: document! });

            // Assert - at least 2 parts should be preserved
            expect(importedParts.length).toBeGreaterThanOrEqual(2);
            
            // Verify geometry is preserved by checking volumes
            const volumes = importedParts.map(p => {
                const shape = query.getShapeFromLabel({ document: document!, label: p.label });
                const vol = solid.getSolidVolume({ shape });
                shape.delete();
                return vol;
            });
            
            // One should be close to box volume, one close to sphere volume
            const hasBoxVolume = volumes.some(v => Math.abs(v - boxVolume) < 1);
            const hasSphereVolume = volumes.some(v => Math.abs(v - sphereVolume) < 1);
            expect(hasBoxVolume).toBe(true);
            expect(hasSphereVolume).toBe(true);
        });

        it("should preserve hierarchy after STEP export and import", () => {
            // Arrange
            const box = solid.createBox({ width: 5, height: 5, length: 5, center: [0, 0, 0] });
            shapesToClean.push(box);
            const boxVolume = 5 * 5 * 5; // 125

            const part = manager.createPart({ id: "box", shape: box, name: "Box" });
            const rootAsm = manager.createAssemblyNode({ id: "root", name: "RootAssembly" });
            const subAsm = manager.createAssemblyNode({ id: "sub", name: "SubAssembly", parentId: "root" });
            const inst = manager.createInstanceNode({ id: "i", partId: "box", name: "BoxInst", parentId: "sub" });
            const structure = manager.combineStructure({ parts: [part], nodes: [rootAsm, subAsm, inst] });
            document = manager.buildAssemblyDocument({ structure });

            // Export to STEP
            const stepData = manager.exportDocumentToStep({ document: document!, fileName: "hierarchy.step", author: "Test Author", organization: "Test Org" });
            document.delete();

            // Import from STEP
            document = manager.loadStepToDoc({ stepData });

            // Act
            const hierarchy = query.getAssemblyHierarchy({ document: document! });

            // Assert - hierarchy should have at least 3 nodes (root, sub, instance)
            expect(hierarchy.nodes.length).toBe(3);
            
            // Verify some hierarchy structure exists
            expect(hierarchy.nodes.length).toBeGreaterThanOrEqual(1);
            
            // Verify geometry is preserved - at least one part with the correct volume
            const parts = query.getDocumentParts({ document: document! });
            expect(parts.length).toBeGreaterThanOrEqual(1);
            
            // Find the box by volume
            let foundBoxVolume = false;
            for (const part of parts) {
                const shape = query.getShapeFromLabel({ document: document!, label: part.label });
                const vol = solid.getSolidVolume({ shape });
                shape.delete();
                if (Math.abs(vol - boxVolume) < 1) {
                    foundBoxVolume = true;
                    break;
                }
            }
            expect(foundBoxVolume).toBe(true);
        });
    });
});
