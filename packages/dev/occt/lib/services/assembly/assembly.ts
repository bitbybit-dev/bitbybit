import { BitbybitOcctModule } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { OCCTAssemblyManager } from "./manager";
import { OCCTAssemblyQuery } from "./query";

/**
 * Assemblies as OpenCascade documents: a document holds parts, the sub-assemblies that group them
 * and the instances that place them, with names, colors and placements, the way a STEP assembly
 * does. `manager` builds documents step by step from parts and nodes, loads STEP files into them,
 * changes labels and exports to STEP and glTF; `query` reads parts, shapes, colors, placements and
 * the hierarchy back out. Every label in a document is addressed by its label id string. A document
 * stays in memory until it is deleted.
 * @example
 * ```typescript
 * const box = await bitbybit.occt.shapes.solid.createBox({ width: 10, length: 10, height: 10, center: [0, 0, 0] });
 * const part = await bitbybit.occt.assembly.manager.createPart({ id: "box", shape: box, name: "Box" });
 * const root = await bitbybit.occt.assembly.manager.createAssemblyNode({ id: "root", name: "Root" });
 * const instance = await bitbybit.occt.assembly.manager.createInstanceNode({ id: "box1", partId: "box", name: "Box 1", parentId: "root" });
 * const structure = await bitbybit.occt.assembly.manager.combineStructure({ parts: [part], nodes: [root, instance], clearDocument: false });
 * const doc = await bitbybit.occt.assembly.manager.buildAssemblyDocument({ structure });
 * const parts = await bitbybit.occt.assembly.query.getDocumentParts({ document: doc });
 * const glb = await bitbybit.occt.assembly.manager.exportDocumentToGltf({ document: doc, meshDeflection: 0.1, meshAngle: 0.5, internalVerticesMode: false, controlSurfaceDeflection: false, mergeFaces: false, forceUVExport: false, fileName: "assembly.glb", tryDownload: false });
 * await bitbybit.occt.assembly.manager.deleteDocument({ document: doc });
 * ```
 */
export class OCCTAssembly {
    public readonly manager: OCCTAssemblyManager;
    public readonly query: OCCTAssemblyQuery;

    constructor(
        occ: BitbybitOcctModule,
        och: OccHelper
    ) {
        this.manager = new OCCTAssemblyManager(occ, och);
        this.query = new OCCTAssemblyQuery(occ, och);
    }

}
