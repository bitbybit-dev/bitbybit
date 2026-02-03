import { OCCTWorkerManager } from "../../../occ-worker/occ-worker-manager";
import { OCCTAssemblyManager } from "./manager";
import { OCCTAssemblyQuery } from "./query";

/**
 * High-level OCCT Assembly service for creating and managing assembly documents.
 * 
 * This class provides access to:
 * 
 * **manager** - Document building and modification:
 * - Part and structure definition helpers for visual programming
 * - Document building from structure definitions
 * - Document modification (set color, set name)
 * - Document export (STEP, glTF)
 * - Document lifecycle management (delete)
 * 
 * **query** - Document querying:
 * - Query document parts, shapes, colors, transforms, hierarchy
 * - Get shapes from labels
 * 
 * All operations use document handles directly. Documents stay in worker memory
 * until explicitly deleted with deleteDocument().
 * 
 * Note: IO operations for shape conversion (convertStepToGltf, parseStepToJson, 
 * exportToStep) are in the io service.
 * 
 * @example
 * ```typescript
 * // Create parts and structure
 * const box = await occt.shapes.solid.createBox({ width: 10, length: 10, height: 10 });
 * const part = await occt.assembly.manager.createPart({ id: "box", shape: box, name: "Box" });
 * const node = await occt.assembly.manager.createAssemblyNode({ id: "root", name: "Root" });
 * const inst = await occt.assembly.manager.createInstanceNode({ id: "inst1", partId: "box", name: "Box 1" });
 * const structure = await occt.assembly.manager.combineStructure({ parts: [part], nodes: [node, inst] });
 * 
 * // Build document
 * const document = await occt.assembly.manager.buildAssemblyDocument({ structure });
 * 
 * // Query document
 * const parts = await occt.assembly.query.getDocumentParts({ document });
 * 
 * // Export to glTF
 * const glbData = await occt.assembly.manager.exportDocumentToGltf({ document });
 * 
 * // Clean up
 * await occt.assembly.manager.deleteDocument({ document });
 * ```
 */
export class OCCTAssembly {
    public readonly manager: OCCTAssemblyManager;
    public readonly query: OCCTAssemblyQuery;

    constructor(
        occWorkerManager: OCCTWorkerManager
    ) {
        this.manager = new OCCTAssemblyManager(occWorkerManager);
        this.query = new OCCTAssemblyQuery(occWorkerManager);
    }

}
