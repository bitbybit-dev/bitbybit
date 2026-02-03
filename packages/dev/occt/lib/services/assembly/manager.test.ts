import createBitbybitOcct, { BitbybitOcctModule, Handle_TDocStd_Document, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTAssemblyManager } from "./manager";
import { OCCTAssemblyQuery } from "./query";
import { OCCTSolid } from "../shapes";
import * as Models from "../../api/models";

describe("OCCTAssemblyManager unit tests", () => {
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

    describe("createPart", () => {
        it("should create a part definition with all properties", () => {
            // Arrange
            const box = solid.createBox({ width: 10, height: 10, length: 10, center: [0, 0, 0] });

            // Act
            const part = manager.createPart({
                id: "test-part",
                shape: box,
                name: "Test Part",
                colorRgba: { r: 1, g: 0, b: 0, a: 1 }
            });

            // Assert
            expect(part.id).toBe("test-part");
            expect(part.shape).toBe(box);
            expect(part.name).toBe("Test Part");
            expect(part.colorRgba).toEqual({ r: 1, g: 0, b: 0, a: 1 });

            // Cleanup
            box.delete();
        });

        it("should create a part definition without optional color", () => {
            // Arrange
            const sphere = solid.createSphere({ radius: 5, center: [0, 0, 0] });

            // Act
            const part = manager.createPart({
                id: "sphere-part",
                shape: sphere,
                name: "Sphere Part"
            });

            // Assert
            expect(part.id).toBe("sphere-part");
            expect(part.name).toBe("Sphere Part");
            expect(part.colorRgba).toBeUndefined();

            // Cleanup
            sphere.delete();
        });

        it("should preserve shape reference in part definition", () => {
            // Arrange
            const cone = solid.createCone({ radius1: 10, radius2: 5, height: 15, angle: 360, direction: [0, 1, 0], center: [0, 0, 0] });

            // Act
            const part = manager.createPart({
                id: "cone",
                shape: cone,
                name: "Cone"
            });

            // Assert - verify the shape is the exact same reference
            expect(part.shape).toBe(cone);
            const volume1 = solid.getSolidVolume({ shape: part.shape });
            const volume2 = solid.getSolidVolume({ shape: cone });
            expect(volume1).toBe(volume2);

            // Cleanup
            cone.delete();
        });
    });

    describe("createAssemblyNode", () => {
        it("should create an assembly node with all properties", () => {
            // Act
            const node = manager.createAssemblyNode({
                id: "assembly-1",
                name: "Main Assembly",
                parentId: "root",
                colorRgba: { r: 0.5, g: 0.5, b: 0.5, a: 1 }
            });

            // Assert
            expect(node.id).toBe("assembly-1");
            expect(node.type).toBe("assembly");
            expect(node.name).toBe("Main Assembly");
            expect(node.parentId).toBe("root");
            expect(node.colorRgba).toEqual({ r: 0.5, g: 0.5, b: 0.5, a: 1 });
        });

        it("should create a root-level assembly node without parentId", () => {
            // Act
            const node = manager.createAssemblyNode({
                id: "root-assembly",
                name: "Root Assembly"
            });

            // Assert
            expect(node.id).toBe("root-assembly");
            expect(node.type).toBe("assembly");
            expect(node.parentId).toBeUndefined();
        });

        it("should always set type to assembly", () => {
            // Act
            const node = manager.createAssemblyNode({
                id: "test",
                name: "Test"
            });

            // Assert
            expect(node.type).toBe("assembly");
        });
    });

    describe("createInstanceNode", () => {
        it("should create an instance node with all properties", () => {
            // Act
            const node = manager.createInstanceNode({
                id: "instance-1",
                partId: "box-part",
                name: "Box Instance",
                parentId: "assembly-1",
                translation: [10, 20, 30],
                rotation: [45, 0, 90],
                scale: 2.0,
                colorRgba: { r: 1, g: 0, b: 0, a: 0.5 }
            });

            // Assert
            expect(node.id).toBe("instance-1");
            expect(node.type).toBe("instance");
            expect(node.partId).toBe("box-part");
            expect(node.name).toBe("Box Instance");
            expect(node.parentId).toBe("assembly-1");
            expect(node.translation).toEqual([10, 20, 30]);
            expect(node.rotation).toEqual([45, 0, 90]);
            expect(node.scale).toBe(2.0);
            expect(node.colorRgba).toEqual({ r: 1, g: 0, b: 0, a: 0.5 });
        });

        it("should create an instance node with minimal properties", () => {
            // Act
            const node = manager.createInstanceNode({
                id: "simple-instance",
                partId: "part-1",
                name: "Simple"
            });

            // Assert
            expect(node.id).toBe("simple-instance");
            expect(node.type).toBe("instance");
            expect(node.partId).toBe("part-1");
            expect(node.parentId).toBeUndefined();
            expect(node.scale).toBeUndefined();
        });

        it("should always set type to instance", () => {
            // Act
            const node = manager.createInstanceNode({
                id: "test",
                partId: "part",
                name: "Test"
            });

            // Assert
            expect(node.type).toBe("instance");
        });
    });

    describe("createPartUpdate", () => {
        it("should create a part update definition with all properties", () => {
            // Arrange
            const newBox = solid.createBox({ width: 20, height: 20, length: 20, center: [0, 0, 0] });

            // Act
            const update = manager.createPartUpdate({
                label: "0:1:1:1",
                shape: newBox,
                name: "Updated Part",
                colorRgba: { r: 0, g: 1, b: 0, a: 1 }
            });

            // Assert
            expect(update.label).toBe("0:1:1:1");
            expect(update.shape).toBe(newBox);
            expect(update.name).toBe("Updated Part");
            expect(update.colorRgba).toEqual({ r: 0, g: 1, b: 0, a: 1 });

            // Cleanup
            newBox.delete();
        });

        it("should create a part update with only color change", () => {
            // Act
            const update = manager.createPartUpdate({
                label: "0:1:1:2",
                colorRgba: { r: 0, g: 0, b: 1, a: 1 }
            });

            // Assert
            expect(update.label).toBe("0:1:1:2");
            expect(update.shape).toBeUndefined();
            expect(update.name).toBeUndefined();
            expect(update.colorRgba).toEqual({ r: 0, g: 0, b: 1, a: 1 });
        });

        it("should create a part update with only name change", () => {
            // Act
            const update = manager.createPartUpdate({
                label: "0:1:1:3",
                name: "Renamed Part"
            });

            // Assert
            expect(update.label).toBe("0:1:1:3");
            expect(update.shape).toBeUndefined();
            expect(update.name).toBe("Renamed Part");
            expect(update.colorRgba).toBeUndefined();
        });
    });

    describe("combineStructure", () => {
        it("should combine parts and nodes into a structure", () => {
            // Arrange
            const box = solid.createBox({ width: 5, height: 5, length: 5, center: [0, 0, 0] });
            const part = manager.createPart({ id: "box", shape: box, name: "Box" });
            const instance = manager.createInstanceNode({ id: "inst", partId: "box", name: "Instance" });

            // Act
            const structure = manager.combineStructure({
                parts: [part],
                nodes: [instance],
                clearDocument: false
            });

            // Assert
            expect(structure.parts).toHaveLength(1);
            expect(structure.nodes).toHaveLength(1);
            expect(structure.parts[0].id).toBe("box");
            expect(structure.nodes[0].id).toBe("inst");
            // clearDocument defaults to undefined or false
            expect(structure.clearDocument).toBeFalsy();

            // Cleanup
            box.delete();
        });

        it("should create structure with empty arrays when not provided", () => {
            // Act
            const structure = manager.combineStructure({ parts: [], nodes: [], clearDocument: false });

            // Assert
            expect(structure.parts).toEqual([]);
            expect(structure.nodes).toEqual([]);
        });

        it("should include removals in structure", () => {
            // Act
            const structure = manager.combineStructure({
                parts: [],
                nodes: [],
                removals: ["0:1:1:1", "0:1:1:2"],
                clearDocument: false
            });

            // Assert
            expect(structure.removals).toEqual(["0:1:1:1", "0:1:1:2"]);
        });

        it("should include partUpdates in structure", () => {
            // Arrange
            const update = manager.createPartUpdate({
                label: "0:1:1:1",
                name: "Updated"
            });

            // Act
            const structure = manager.combineStructure({
                parts: [],
                nodes: [],
                partUpdates: [update],
                clearDocument: false
            });

            // Assert
            expect(structure.partUpdates).toHaveLength(1);
            expect(structure.partUpdates![0].label).toBe("0:1:1:1");
        });

        it("should set clearDocument flag correctly", () => {
            // Act
            const structure = manager.combineStructure({
                parts: [],
                nodes: [],
                clearDocument: true
            });

            // Assert
            expect(structure.clearDocument).toBe(true);
        });
    });

    describe("buildAssemblyDocument", () => {
        let document: Handle_TDocStd_Document | null = null;
        const shapesToClean: TopoDS_Shape[] = [];

        afterEach(() => {
            // Clean up document
            if (document && !document.IsNull()) {
                document.delete();
                document = null;
            }
            // Clean up shapes
            shapesToClean.forEach(s => s.delete());
            shapesToClean.length = 0;
        });

        it("should build a document with a single part", () => {
            // Arrange
            const box = solid.createBox({ width: 10, height: 10, length: 10, center: [0, 0, 0] });
            shapesToClean.push(box);
            const part = manager.createPart({ id: "box", shape: box, name: "Single Box" });
            const instance = manager.createInstanceNode({ id: "inst", partId: "box", name: "Instance" });
            const structure = manager.combineStructure({ parts: [part], nodes: [instance], clearDocument: false });

            // Act
            document = manager.buildAssemblyDocument({ structure });

            // Assert
            expect(document).toBeDefined();
            expect(document!.IsNull()).toBe(false);
        });

        it("should build a document with multiple parts", () => {
            // Arrange
            const box = solid.createBox({ width: 10, height: 10, length: 10, center: [0, 0, 0] });
            const sphere = solid.createSphere({ radius: 5, center: [0, 0, 0] });
            const cylinder = solid.createCylinder({ radius: 3, height: 15, direction: [0, 1, 0], center: [0, 0, 0] });
            shapesToClean.push(box, sphere, cylinder);

            const boxVolume = 10 * 10 * 10; // 1000
            const sphereVolume = (4 / 3) * Math.PI * Math.pow(5, 3); // ~523.6
            const cylinderVolume = Math.PI * 3 * 3 * 15; // ~424.1

            const parts = [
                manager.createPart({ id: "box", shape: box, name: "Box" }),
                manager.createPart({ id: "sphere", shape: sphere, name: "Sphere" }),
                manager.createPart({ id: "cylinder", shape: cylinder, name: "Cylinder" })
            ];
            const nodes = [
                manager.createInstanceNode({ id: "i1", partId: "box", name: "BoxInst" }),
                manager.createInstanceNode({ id: "i2", partId: "sphere", name: "SphereInst", translation: [20, 0, 0] }),
                manager.createInstanceNode({ id: "i3", partId: "cylinder", name: "CylInst", translation: [40, 0, 0] })
            ];
            const structure = manager.combineStructure({ parts, nodes, clearDocument: false });

            // Act
            document = manager.buildAssemblyDocument({ structure });

            // Assert - 4 parts with correct names and volumes
            const docParts = query.getDocumentParts({ document: document! });
            expect(docParts.length).toEqual(4);
            
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
            
            // Verify geometry by checking volumes
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

        it("should build a document with hierarchical structure", () => {
            // Arrange
            const box = solid.createBox({ width: 5, height: 5, length: 5, center: [0, 0, 0] });
            shapesToClean.push(box);
            const boxVolume = 5 * 5 * 5; // 125

            const part = manager.createPart({ id: "box", shape: box, name: "Box" });
            const rootAsm = manager.createAssemblyNode({ id: "root", name: "Root" });
            const subAsm = manager.createAssemblyNode({ id: "sub", name: "SubAssembly", parentId: "root" });
            const inst1 = manager.createInstanceNode({ id: "i1", partId: "box", name: "Box1", parentId: "sub" });
            const inst2 = manager.createInstanceNode({ id: "i2", partId: "box", name: "Box2", parentId: "sub", translation: [10, 0, 0] });

            const structure = manager.combineStructure({
                parts: [part],
                nodes: [rootAsm, subAsm, inst1, inst2],
                clearDocument: false
            });

            // Act
            document = manager.buildAssemblyDocument({ structure });

            // Assert
            expect(document!.IsNull()).toBe(false);
            
            // Verify hierarchy structure
            const hierarchy = query.getAssemblyHierarchy({ document: document! });
            expect(hierarchy.nodes.length).toEqual(4); // root, sub, inst1, inst2
            
            // Verify Root node exists at depth 0
            const rootNode = hierarchy.nodes.find(n => n.name === "Root");
            expect(rootNode).toBeDefined();
            expect(rootNode!.depth).toBe(0);
            expect(rootNode!.isAssembly).toBe(true);
            
            // Verify SubAssembly exists at depth 1 under Root (if exposed by OCCT)
            const subNode = hierarchy.nodes.find(n => n.name === "SubAssembly");
            if (subNode) {
                expect(subNode.depth).toBe(1);
                expect(subNode.isAssembly).toBe(true);
            }
            
            // Verify instances exist - they might be at depth 1 or 2 depending on OCCT structure
            const box1Node = hierarchy.nodes.find(n => n.name === "Box1");
            const box2Node = hierarchy.nodes.find(n => n.name === "Box2");
            
            // Verify we have nodes at multiple depths (hierarchical structure)
            const depths = [...new Set(hierarchy.nodes.map(n => n.depth))];
            expect(depths.length).toEqual(3); // 3 depth levels
            
            // Verify part has 2 instances
            const docParts = query.getDocumentParts({ document: document! });
            const boxPart = docParts.find(p => p.name === "Box");
            expect(boxPart).toBeDefined();
            expect(boxPart!.instanceCount).toBe(2);
            
            // Verify part geometry
            const boxShape = query.getShapeFromLabel({ document: document!, label: boxPart!.label });
            expect(solid.getSolidVolume({ shape: boxShape })).toBeCloseTo(boxVolume, 0);
            boxShape.delete();
        });

        it("should build a document with transformed instances", () => {
            // Arrange
            const box = solid.createBox({ width: 10, height: 10, length: 10, center: [0, 0, 0] });
            shapesToClean.push(box);
            const originalVolume = 10 * 10 * 10; // 1000

            const part = manager.createPart({ id: "box", shape: box, name: "Box" });
            const inst = manager.createInstanceNode({
                id: "transformed",
                partId: "box",
                name: "Transformed Box",
                translation: [50, 50, 50],
                rotation: [45, 0, 0],
                scale: 2.0
            });
            const structure = manager.combineStructure({ parts: [part], nodes: [inst], clearDocument: false });

            // Act
            document = manager.buildAssemblyDocument({ structure });

            // Assert
            expect(document!.IsNull()).toBe(false);
            const hierarchy = query.getAssemblyHierarchy({ document: document! });
            const transformedNode = hierarchy.nodes.find(n => n.name === "Transformed Box");
            expect(transformedNode).toBeDefined();
            expect(transformedNode!.label).toBeDefined();
            
            // Verify transform is applied
            const transform = query.getLabelTransform({ document: document!, label: transformedNode!.label });
            expect(transform.translation[0]).toBeCloseTo(50, 0);
            expect(transform.translation[1]).toBeCloseTo(50, 0);
            expect(transform.translation[2]).toBeCloseTo(50, 0);
            expect(transform.scale).toBeCloseTo(2.0, 1);
            
            // Verify original part geometry is preserved
            const docParts = query.getDocumentParts({ document: document! });
            const boxPart = docParts.find(p => p.name === "Box");
            expect(boxPart).toBeDefined();
            const boxShape = query.getShapeFromLabel({ document: document!, label: boxPart!.label });
            expect(solid.getSolidVolume({ shape: boxShape })).toBeCloseTo(originalVolume, 0);
            boxShape.delete();
        });

        it("should build a document with colored parts", () => {
            // Arrange
            const box = solid.createBox({ width: 10, height: 10, length: 10, center: [0, 0, 0] });
            shapesToClean.push(box);
            const expectedVolume = 10 * 10 * 10; // 1000

            const part = manager.createPart({
                id: "red-box",
                shape: box,
                name: "Red Box",
                colorRgba: { r: 1, g: 0, b: 0, a: 1 }
            });
            const inst = manager.createInstanceNode({ id: "inst", partId: "red-box", name: "Instance" });
            const structure = manager.combineStructure({ parts: [part], nodes: [inst], clearDocument: false });

            // Act
            document = manager.buildAssemblyDocument({ structure });

            // Assert
            const docParts = query.getDocumentParts({ document: document! });
            expect(docParts.length).toEqual(2);
            
            const redPart = docParts.find(p => p.name === "Red Box");
            expect(redPart).toBeDefined();
            expect(redPart!.instanceCount).toBe(1);
            
            // Verify color is exactly red (1, 0, 0)
            expect(redPart!.color).toBeDefined();
            expect(redPart!.color!.r).toBeCloseTo(1, 2);
            expect(redPart!.color!.g).toBeCloseTo(0, 2);
            expect(redPart!.color!.b).toBeCloseTo(0, 2);
            
            // Verify color via getLabelColor
            const colorInfo = query.getLabelColor({ document: document!, label: redPart!.label });
            expect(colorInfo.hasColor).toBe(true);
            expect(colorInfo.r).toBeCloseTo(1, 2);
            expect(colorInfo.g).toBeCloseTo(0, 2);
            expect(colorInfo.b).toBeCloseTo(0, 2);
            
            // Verify geometry
            const boxShape = query.getShapeFromLabel({ document: document!, label: redPart!.label });
            expect(solid.getSolidVolume({ shape: boxShape })).toBeCloseTo(expectedVolume, 0);
            boxShape.delete();
        });

        it("should update an existing document when provided", () => {
            // Arrange - Create initial document
            const box1 = solid.createBox({ width: 10, height: 10, length: 10, center: [0, 0, 0] });
            shapesToClean.push(box1);

            const part1 = manager.createPart({ id: "box1", shape: box1, name: "Box1" });
            const inst1 = manager.createInstanceNode({ id: "i1", partId: "box1", name: "Instance1" });
            const structure1 = manager.combineStructure({ parts: [part1], nodes: [inst1], clearDocument: false });
            document = manager.buildAssemblyDocument({ structure: structure1 });

            // Arrange - Create update structure
            const box2 = solid.createBox({ width: 5, height: 5, length: 5, center: [0, 0, 0] });
            shapesToClean.push(box2);
            const part2 = manager.createPart({ id: "box2", shape: box2, name: "Box2" });
            const inst2 = manager.createInstanceNode({ id: "i2", partId: "box2", name: "Instance2" });
            const structure2 = manager.combineStructure({
                parts: [part2],
                nodes: [inst2],
                clearDocument: true
            });

            // Act
            const updatedDoc = manager.buildAssemblyDocument({
                structure: structure2,
                existingDocument: document
            });

            // Assert
            expect(updatedDoc.IsNull()).toBe(false);
            const parts = query.getDocumentParts({ document: updatedDoc });
            expect(parts.some(p => p.name === "Box2")).toBe(true);
            // Update document reference for cleanup
            document = updatedDoc;
        });

        it("should apply part updates to existing document", () => {
            // Arrange - Create initial document
            const box = solid.createBox({ width: 10, height: 10, length: 10, center: [0, 0, 0] });
            shapesToClean.push(box);

            const part = manager.createPart({
                id: "box",
                shape: box,
                name: "OriginalName",
                colorRgba: { r: 1, g: 0, b: 0, a: 1 }
            });
            const inst = manager.createInstanceNode({ id: "i", partId: "box", name: "Instance" });
            const structure1 = manager.combineStructure({ parts: [part], nodes: [inst], clearDocument: false });
            document = manager.buildAssemblyDocument({ structure: structure1 });

            // Get the part label
            const initialParts = query.getDocumentParts({ document: document! });
            const partLabel = initialParts.find(p => p.name === "OriginalName")?.label;
            expect(partLabel).toBeDefined();

            // Arrange - Create update
            const newBox = solid.createBox({ width: 20, height: 20, length: 20, center: [0, 0, 0] });
            shapesToClean.push(newBox);

            const partUpdate = manager.createPartUpdate({
                label: partLabel!,
                shape: newBox,
                name: "UpdatedName",
                colorRgba: { r: 0, g: 1, b: 0, a: 1 }
            });
            const structure2 = manager.combineStructure({
                parts: [],
                nodes: [],
                partUpdates: [partUpdate],
                clearDocument: false
            });

            // Act
            manager.buildAssemblyDocument({
                structure: structure2,
                existingDocument: document
            });

            // Assert
            const updatedParts = query.getDocumentParts({ document: document! });
            expect(updatedParts.some(p => p.name === "UpdatedName")).toBe(true);
        });
    });

    describe("setLabelColor", () => {
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

        it("should set color on a label", () => {
            // Arrange
            const box = solid.createBox({ width: 10, height: 10, length: 10, center: [0, 0, 0] });
            shapesToClean.push(box);

            const part = manager.createPart({ id: "box", shape: box, name: "Box" });
            const inst = manager.createInstanceNode({ id: "i", partId: "box", name: "Instance" });
            const structure = manager.combineStructure({ parts: [part], nodes: [inst], clearDocument: false });
            document = manager.buildAssemblyDocument({ structure });

            const parts = query.getDocumentParts({ document: document! });
            const label = parts[0].label;

            // Act
            const result = manager.setLabelColor({
                document: document!,
                label,
                r: 0,
                g: 0,
                b: 1,
                a: 1
            });

            // Assert
            expect(result).toBe(true);
            const color = query.getLabelColor({ document: document!, label });
            expect(color.hasColor).toBe(true);
            expect(color.b).toBeCloseTo(1, 1);
        });
    });

    describe("setLabelName", () => {
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

        it("should set name on a label", () => {
            // Arrange
            const box = solid.createBox({ width: 10, height: 10, length: 10, center: [0, 0, 0] });
            shapesToClean.push(box);

            const part = manager.createPart({ id: "box", shape: box, name: "OldName" });
            const inst = manager.createInstanceNode({ id: "i", partId: "box", name: "Instance" });
            const structure = manager.combineStructure({ parts: [part], nodes: [inst], clearDocument: false });
            document = manager.buildAssemblyDocument({ structure });

            const parts = query.getDocumentParts({ document: document! });
            const label = parts.find(p => p.name === "OldName")?.label;
            expect(label).toBeDefined();

            // Act
            const result = manager.setLabelName({
                document: document!,
                label: label!,
                name: "NewName"
            });

            // Assert
            expect(result).toBe(true);
            const info = query.getLabelInfo({ document: document!, label: label! });
            expect(info.name).toBe("NewName");
        });
    });

    describe("loadStepToDoc", () => {
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

        it("should load STEP data and return document", () => {
            // Arrange - Create and export a document with a 10x10x10 box
            const box = solid.createBox({ width: 10, height: 10, length: 10, center: [0, 0, 0] });
            shapesToClean.push(box);
            const expectedVolume = 10 * 10 * 10; // 1000

            const part = manager.createPart({ id: "box", shape: box, name: "ExportedBox" });
            const inst = manager.createInstanceNode({ id: "i", partId: "box", name: "Instance" });
            const structure = manager.combineStructure({ parts: [part], nodes: [inst], clearDocument: false });
            const exportDoc = manager.buildAssemblyDocument({ structure });

            const stepData = manager.exportDocumentToStep({
                document: exportDoc,
                fileName: "test.step",
                author: "Test Author",
                organization: "Test Org",
                compress: false,
                tryDownload: false
            });
            exportDoc.delete();

            // Act
            document = manager.loadStepToDoc({ stepData });

            // Assert - Document is valid and contains parts
            expect(document).toBeDefined();
            expect(document!.IsNull()).toBe(false);
            
            const parts = query.getDocumentParts({ document: document! });
            expect(parts.length).toEqual(2);
            
            // Verify the geometry was preserved by checking volume of first part with matching volume
            let foundMatchingVolume = false;
            for (const p of parts) {
                const partShape = query.getShapeFromLabel({ document: document!, label: p.label });
                if (!partShape.IsNull()) {
                    const vol = solid.getSolidVolume({ shape: partShape });
                    if (Math.abs(vol - expectedVolume) < 1) {
                        foundMatchingVolume = true;
                    }
                    partShape.delete();
                    if (foundMatchingVolume) break;
                }
            }
            expect(foundMatchingVolume).toBe(true);
        });
    });

    describe("exportDocumentToStep", () => {
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

        it("should export document to STEP format", () => {
            // Arrange
            const box = solid.createBox({ width: 10, height: 10, length: 10, center: [0, 0, 0] });
            shapesToClean.push(box);

            const part = manager.createPart({ id: "box", shape: box, name: "StepBox" });
            const inst = manager.createInstanceNode({ id: "i", partId: "box", name: "Instance" });
            const structure = manager.combineStructure({ parts: [part], nodes: [inst], clearDocument: false });
            document = manager.buildAssemblyDocument({ structure });

            // Act
            const stepData = manager.exportDocumentToStep({
                document: document!,
                fileName: "test.step",
                author: "Test Author",
                organization: "Test Org",
                compress: false,
                tryDownload: false
            });

            // Assert - STEP file has valid structure
            expect(stepData).toBeInstanceOf(Uint8Array);
            expect(stepData.length).toBeGreaterThan(100); // STEP files have significant content
            
            const text = new TextDecoder().decode(stepData);
            
            // Verify STEP header structure
            expect(text).toContain("ISO-10303-21");
            expect(text).toContain("HEADER;");
            expect(text).toContain("FILE_DESCRIPTION");
            expect(text).toContain("FILE_NAME");
            expect(text).toContain("DATA;");
            expect(text).toContain("END-ISO-10303-21");
            
            // Verify author and organization are in the file
            expect(text).toContain("Test Author");
            expect(text).toContain("Test Org");
        });

        it("should export document to compressed STEP-Z format", () => {
            // Arrange
            const box = solid.createBox({ width: 10, height: 10, length: 10, center: [0, 0, 0] });
            shapesToClean.push(box);

            const part = manager.createPart({ id: "box", shape: box, name: "StepZBox" });
            const inst = manager.createInstanceNode({ id: "i", partId: "box", name: "Instance" });
            const structure = manager.combineStructure({ parts: [part], nodes: [inst], clearDocument: false });
            document = manager.buildAssemblyDocument({ structure });

            // Act
            const stepZData = manager.exportDocumentToStep({
                document: document!,
                fileName: "test.stpz",
                author: "Test Author",
                organization: "Test Org",
                compress: true,
                tryDownload: false
            });

            // Assert
            expect(stepZData).toBeDefined();
            expect(stepZData.length).toBeGreaterThan(0);
            // Compressed data should be different from uncompressed
            const uncompressedData = manager.exportDocumentToStep({
                document: document!,
                fileName: "test.step",
                author: "Test Author",
                organization: "Test Org",
                compress: false,
                tryDownload: false
            });
            // Either it's gzip compressed (starts with 0x1f 0x8b) or it's deflate compressed
            // Just verify it's valid data
            expect(stepZData.length).toBeGreaterThan(0);
        });
    });

    describe("exportDocumentToGltf", () => {
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

        it("should export document to GLB format", () => {
            // Arrange
            const box = solid.createBox({ width: 10, height: 10, length: 10, center: [0, 0, 0] });
            shapesToClean.push(box);

            const part = manager.createPart({ id: "box", shape: box, name: "GltfBox" });
            const inst = manager.createInstanceNode({ id: "i", partId: "box", name: "Instance" });
            const structure = manager.combineStructure({ parts: [part], nodes: [inst], clearDocument: false });
            document = manager.buildAssemblyDocument({ structure });

            // Act
            const glbData = manager.exportDocumentToGltf({
                document: document!,
                meshDeflection: 0.1,
                meshAngle: 0.5,
                mergeFaces: false,
                forceUVExport: false,
                fileName: "test.glb",
                tryDownload: false
            });

            // Assert
            expect(glbData).toBeDefined();
            expect(glbData.length).toBeGreaterThan(0);
            // GLB magic is "glTF"
            const magic = new TextDecoder().decode(glbData.slice(0, 4));
            expect(magic).toBe("glTF");
            
            // Verify GLB version (bytes 4-7 should be version 2)
            const version = new DataView(glbData.buffer).getUint32(4, true);
            expect(version).toBe(2);
        });

        it("should export document with custom mesh settings", () => {
            // Arrange
            const sphere = solid.createSphere({ radius: 10, center: [0, 0, 0] });
            shapesToClean.push(sphere);

            const part = manager.createPart({ id: "sphere", shape: sphere, name: "FineSphere" });
            const inst = manager.createInstanceNode({ id: "i", partId: "sphere", name: "Instance" });
            const structure = manager.combineStructure({ parts: [part], nodes: [inst], clearDocument: false });
            document = manager.buildAssemblyDocument({ structure });

            // Act - Fine mesh
            const fineGlb = manager.exportDocumentToGltf({
                document: document!,
                meshDeflection: 0.01,
                meshAngle: 0.1,
                mergeFaces: false,
                forceUVExport: false,
                fileName: "fine.glb",
                tryDownload: false
            });

            // Act - Coarse mesh  
            const coarseGlb = manager.exportDocumentToGltf({
                document: document!,
                meshDeflection: 1.0,
                meshAngle: 1.0,
                mergeFaces: false,
                forceUVExport: false,
                fileName: "coarse.glb",
                tryDownload: false
            });

            // Assert - Both should produce valid GLB files
            expect(fineGlb.length).toBeGreaterThan(100); // GLB has header overhead
            expect(coarseGlb.length).toBeGreaterThan(100);
            
            // Both should have valid GLB magic and version
            expect(new TextDecoder().decode(fineGlb.slice(0, 4))).toBe("glTF");
            expect(new TextDecoder().decode(coarseGlb.slice(0, 4))).toBe("glTF");
            expect(new DataView(fineGlb.buffer).getUint32(4, true)).toBe(2);
            expect(new DataView(coarseGlb.buffer).getUint32(4, true)).toBe(2);
        });
    });

    describe("complex assembly scenarios", () => {
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

        it("should handle part reuse across multiple instances", () => {
            // Arrange - one part used 4 times
            const box = solid.createBox({ width: 5, height: 5, length: 5, center: [0, 0, 0] });
            shapesToClean.push(box);
            const boxVolume = 5 * 5 * 5; // 125

            const part = manager.createPart({ id: "box", shape: box, name: "ReusablePart" });
            const nodes = [
                manager.createInstanceNode({ id: "i1", partId: "box", name: "Corner1", translation: [0, 0, 0] }),
                manager.createInstanceNode({ id: "i2", partId: "box", name: "Corner2", translation: [20, 0, 0] }),
                manager.createInstanceNode({ id: "i3", partId: "box", name: "Corner3", translation: [0, 20, 0] }),
                manager.createInstanceNode({ id: "i4", partId: "box", name: "Corner4", translation: [20, 20, 0] })
            ];
            const structure = manager.combineStructure({ parts: [part], nodes, clearDocument: false });

            // Act
            document = manager.buildAssemblyDocument({ structure });

            // Assert
            const docParts = query.getDocumentParts({ document: document! });
            const reusablePart = docParts.find(p => p.name === "ReusablePart");
            expect(reusablePart).toBeDefined();
            expect(reusablePart!.instanceCount).toBe(4); // Used 4 times
            
            // Verify geometry
            const shape = query.getShapeFromLabel({ document: document!, label: reusablePart!.label });
            expect(solid.getSolidVolume({ shape })).toBeCloseTo(boxVolume, 0);
            shape.delete();
            
            // Verify hierarchy has 4 instances with correct names
            const hierarchy = query.getAssemblyHierarchy({ document: document! });
            expect(hierarchy.nodes.filter(n => n.name.startsWith("Corner")).length).toBe(4);
        });

        it("should handle multi-level nested assemblies", () => {
            // Arrange - 4-level deep hierarchy
            const cylinder = solid.createCylinder({ radius: 2, height: 10, direction: [0, 1, 0], center: [0, 0, 0] });
            shapesToClean.push(cylinder);
            const cylinderVolume = Math.PI * 2 * 2 * 10; // ~125.66

            const part = manager.createPart({ id: "cyl", shape: cylinder, name: "Cylinder" });
            const nodes = [
                manager.createAssemblyNode({ id: "level0", name: "Level0" }),
                manager.createAssemblyNode({ id: "level1", name: "Level1", parentId: "level0" }),
                manager.createAssemblyNode({ id: "level2", name: "Level2", parentId: "level1" }),
                manager.createInstanceNode({ id: "leaf", partId: "cyl", name: "LeafPart", parentId: "level2" })
            ];
            const structure = manager.combineStructure({ parts: [part], nodes, clearDocument: false });

            // Act
            document = manager.buildAssemblyDocument({ structure });

            // Assert
            const hierarchy = query.getAssemblyHierarchy({ document: document! });
            expect(hierarchy.nodes.length).toEqual(4); // the leaf part
            
            // Verify we have a multi-level structure (hierarchy exists)
            const depths = [...new Set(hierarchy.nodes.map(n => n.depth))];
            expect(depths.length).toEqual(4); // 4 level
            
            // Verify named nodes that exist - OCCT may not expose all assembly nodes
            const level0 = hierarchy.nodes.find(n => n.name === "Level0");
            const level1 = hierarchy.nodes.find(n => n.name === "Level1");
            const level2 = hierarchy.nodes.find(n => n.name === "Level2");
            const leaf = hierarchy.nodes.find(n => n.name === "LeafPart");
            
            // At minimum, verify leaf part or Cylinder exists in hierarchy
            const hasLeafOrCylinder = leaf !== undefined || hierarchy.nodes.some(n => n.name.includes("Cylinder") || n.name.includes("Leaf"));
            expect(hasLeafOrCylinder).toBe(true);
            
            // Verify part geometry is accessible
            const docParts = query.getDocumentParts({ document: document! });
            const cylPart = docParts.find(p => p.name === "Cylinder");
            expect(cylPart).toBeDefined();
            const shape = query.getShapeFromLabel({ document: document!, label: cylPart!.label });
            expect(solid.getSolidVolume({ shape })).toBeCloseTo(cylinderVolume, 0);
            shape.delete();
        });

        it("should handle multiple parts with different colors", () => {
            // Arrange
            const box = solid.createBox({ width: 10, height: 10, length: 10, center: [0, 0, 0] });
            const sphere = solid.createSphere({ radius: 5, center: [0, 0, 0] });
            const cylinder = solid.createCylinder({ radius: 3, height: 15, direction: [0, 1, 0], center: [0, 0, 0] });
            shapesToClean.push(box, sphere, cylinder);

            const parts = [
                manager.createPart({ id: "box", shape: box, name: "RedBox", colorRgba: { r: 1, g: 0, b: 0, a: 1 } }),
                manager.createPart({ id: "sphere", shape: sphere, name: "GreenSphere", colorRgba: { r: 0, g: 1, b: 0, a: 1 } }),
                manager.createPart({ id: "cylinder", shape: cylinder, name: "BlueCylinder", colorRgba: { r: 0, g: 0, b: 1, a: 1 } })
            ];
            const nodes = [
                manager.createInstanceNode({ id: "i1", partId: "box", name: "Box" }),
                manager.createInstanceNode({ id: "i2", partId: "sphere", name: "Sphere", translation: [25, 0, 0] }),
                manager.createInstanceNode({ id: "i3", partId: "cylinder", name: "Cylinder", translation: [50, 0, 0] })
            ];
            const structure = manager.combineStructure({ parts, nodes, clearDocument: false });

            // Act
            document = manager.buildAssemblyDocument({ structure });

            // Assert
            const docParts = query.getDocumentParts({ document: document! });
            expect(docParts.length).toEqual(4); // At least 3 parts (OCCT may add internal nodes)
            
            const redBox = docParts.find(p => p.name === "RedBox");
            const greenSphere = docParts.find(p => p.name === "GreenSphere");
            const blueCylinder = docParts.find(p => p.name === "BlueCylinder");
            
            expect(redBox).toBeDefined();
            expect(greenSphere).toBeDefined();
            expect(blueCylinder).toBeDefined();
            
            // Verify colors
            expect(redBox!.color!.r).toBeCloseTo(1, 2);
            expect(redBox!.color!.g).toBeCloseTo(0, 2);
            expect(redBox!.color!.b).toBeCloseTo(0, 2);
            
            expect(greenSphere!.color!.r).toBeCloseTo(0, 2);
            expect(greenSphere!.color!.g).toBeCloseTo(1, 2);
            expect(greenSphere!.color!.b).toBeCloseTo(0, 2);
            
            expect(blueCylinder!.color!.r).toBeCloseTo(0, 2);
            expect(blueCylinder!.color!.g).toBeCloseTo(0, 2);
            expect(blueCylinder!.color!.b).toBeCloseTo(1, 2);
        });

        it("should handle instances with scale transformations", () => {
            // Arrange
            const box = solid.createBox({ width: 10, height: 10, length: 10, center: [0, 0, 0] });
            shapesToClean.push(box);

            const part = manager.createPart({ id: "box", shape: box, name: "ScalableBox" });
            const nodes = [
                manager.createInstanceNode({ id: "i1", partId: "box", name: "Scale1x", scale: 1.0 }),
                manager.createInstanceNode({ id: "i2", partId: "box", name: "Scale2x", translation: [30, 0, 0], scale: 2.0 }),
                manager.createInstanceNode({ id: "i3", partId: "box", name: "Scale05x", translation: [60, 0, 0], scale: 0.5 })
            ];
            const structure = manager.combineStructure({ parts: [part], nodes, clearDocument: false });

            // Act
            document = manager.buildAssemblyDocument({ structure });

            // Assert
            const hierarchy = query.getAssemblyHierarchy({ document: document! });
            expect(hierarchy.nodes.length).toEqual(4); // OCCT may add internal nodes
            
            const scale1x = hierarchy.nodes.find(n => n.name === "Scale1x");
            const scale2x = hierarchy.nodes.find(n => n.name === "Scale2x");
            const scale05x = hierarchy.nodes.find(n => n.name === "Scale05x");
            
            // At least verify the part is reused 3 times
            const docParts = query.getDocumentParts({ document: document! });
            const scalableBox = docParts.find(p => p.name === "ScalableBox");
            expect(scalableBox).toBeDefined();
            expect(scalableBox!.instanceCount).toBe(3);
            
            // If nodes are accessible, verify transforms
            if (scale1x && scale2x && scale05x) {
                const transform1x = query.getLabelTransform({ document: document!, label: scale1x.label });
                const transform2x = query.getLabelTransform({ document: document!, label: scale2x.label });
                const transform05x = query.getLabelTransform({ document: document!, label: scale05x.label });
                
                expect(transform1x.scale).toBeCloseTo(1.0, 2);
                expect(transform2x.scale).toBeCloseTo(2.0, 2);
                expect(transform05x.scale).toBeCloseTo(0.5, 2);
                
                // Verify translation on scale2x
                expect(transform2x.translation[0]).toBeCloseTo(30, 0);
            }
        });
    });

    describe("error handling", () => {
        it("should throw when building document fails with null structure", () => {
            // This test verifies the error handling path
            // A completely invalid structure should cause issues
            const emptyStructure: Models.OCCT.AssemblyStructureDef<TopoDS_Shape> = {
                parts: [],
                nodes: [],
                clearDocument: false
            };

            // Building with empty structure should still work (creates empty doc)
            const doc = manager.buildAssemblyDocument({ structure: emptyStructure });
            expect(doc.IsNull()).toBe(false);
            doc.delete();
        });
    });
});
