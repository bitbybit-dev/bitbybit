import { Inputs } from "@bitbybit-dev/occt";
import { Models } from "@bitbybit-dev/occt";
import { OCCTWorkerManager } from "../../../occ-worker/occ-worker-manager";

/**
 * OCCT Assembly Query for querying assembly document data.
 * 
 * This class provides methods for:
 * - Querying document parts and assemblies
 * - Getting shapes from labels
 * - Retrieving label colors and transforms
 * - Getting detailed label info
 * - Retrieving full assembly hierarchy
 * 
 * All methods use document handles directly. The document stays
 * in worker memory until explicitly deleted with deleteDocument().
 */
export class OCCTAssemblyQuery {

    constructor(
        private readonly occWorkerManager: OCCTWorkerManager,
    ) {
    }

    /**
     * Get all parts and assemblies in the document.
     * 
     * @param inputs - Document to query
     * @returns Array of part/assembly info objects
     * @group query
     * @shortname get parts
     * @drawable false
     * 
     * @example
     * ```typescript
     * const parts = await occt.assembly.query.getDocumentParts({ document });
     * for (const part of parts) {
     *     console.log(`${part.name}: ${part.type} at label ${part.label}`);
     * }
     * ```
     */
    async getDocumentParts(inputs: Inputs.OCCT.DocumentQueryDto<Inputs.OCCT.TDocStdDocumentPointer>): Promise<Models.OCCT.DocumentPartInfo[]> {
        return this.occWorkerManager.genericCallToWorkerPromise("assembly.query.getDocumentParts", inputs);
    }

    /**
     * Get a shape from a label in an assembly document.
     * 
     * @param inputs - Document and label to query
     * @returns The shape at the given label
     * @group query
     * @shortname get shape from label
     * @drawable true
     * 
     * @example
     * ```typescript
     * const shape = await occt.assembly.query.getShapeFromLabel({ 
     *     document, 
     *     label: "0:1:1:1" 
     * });
     * const mesh = await occt.shapes.face.getFaceMeshes({ shape });
     * ```
     */
    async getShapeFromLabel(inputs: Inputs.OCCT.DocumentLabelQueryDto<Inputs.OCCT.TDocStdDocumentPointer>): Promise<Inputs.OCCT.TopoDSShapePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("assembly.query.getShapeFromLabel", inputs);
    }

    /**
     * Get the color of a label.
     * 
     * @param inputs - Document and label to query
     * @returns Color info including hasColor, r, g, b, a
     * @group query
     * @shortname get label color
     * @drawable false
     * 
     * @example
     * ```typescript
     * const colorInfo = await occt.assembly.query.getLabelColor({ 
     *     document, 
     *     label: "0:1:1:1" 
     * });
     * if (colorInfo.hasColor) {
     *     console.log(`Color: rgb(${colorInfo.r}, ${colorInfo.g}, ${colorInfo.b})`);
     * }
     * ```
     */
    async getLabelColor(inputs: Inputs.OCCT.DocumentLabelQueryDto<Inputs.OCCT.TDocStdDocumentPointer>): Promise<Models.OCCT.LabelColorInfo> {
        return this.occWorkerManager.genericCallToWorkerPromise("assembly.query.getLabelColor", inputs);
    }

    /**
     * Get the transformation of an instance label.
     * 
     * @param inputs - Document and label to query
     * @returns Transform info including matrix, translation, quaternion, scale
     * @group query
     * @shortname get label transform
     * @drawable false
     * 
     * @example
     * ```typescript
     * const transform = await occt.assembly.query.getLabelTransform({ 
     *     document, 
     *     label: "0:1:1:1" 
     * });
     * console.log("Translation:", transform.translation);
     * console.log("Rotation (quaternion):", transform.quaternion);
     * ```
     */
    async getLabelTransform(inputs: Inputs.OCCT.DocumentLabelQueryDto<Inputs.OCCT.TDocStdDocumentPointer>): Promise<Models.OCCT.LabelTransformInfo> {
        return this.occWorkerManager.genericCallToWorkerPromise("assembly.query.getLabelTransform", inputs);
    }

    /**
     * Get detailed info about a label.
     * 
     * @param inputs - Document and label to query
     * @returns Detailed label info including type, flags, children
     * @group query
     * @shortname get label info
     * @drawable false
     * 
     * @example
     * ```typescript
     * const info = await occt.assembly.query.getLabelInfo({ 
     *     document, 
     *     label: "0:1:1:1" 
     * });
     * console.log(`Type: ${info.type}, Is assembly: ${info.isAssembly}`);
     * ```
     */
    async getLabelInfo(inputs: Inputs.OCCT.DocumentLabelQueryDto<Inputs.OCCT.TDocStdDocumentPointer>): Promise<Models.OCCT.LabelInfo> {
        return this.occWorkerManager.genericCallToWorkerPromise("assembly.query.getLabelInfo", inputs);
    }

    /**
     * Get full assembly hierarchy as structured data.
     * 
     * @param inputs - Document to query
     * @returns Assembly hierarchy with all nodes
     * @group query
     * @shortname get hierarchy
     * @drawable false
     * 
     * @example
     * ```typescript
     * const hierarchy = await occt.assembly.query.getAssemblyHierarchy({ 
     *     document 
     * });
     * console.log("Root nodes:", hierarchy.roots);
     * ```
     */
    async getAssemblyHierarchy(inputs: Inputs.OCCT.DocumentQueryDto<Inputs.OCCT.TDocStdDocumentPointer>): Promise<Models.OCCT.AssemblyHierarchyResult> {
        return this.occWorkerManager.genericCallToWorkerPromise("assembly.query.getAssemblyHierarchy", inputs);
    }

}
