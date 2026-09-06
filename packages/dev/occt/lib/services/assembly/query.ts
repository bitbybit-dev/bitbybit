import { BitbybitOcctModule, Handle_TDocStd_Document, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import * as Inputs from "../../api/inputs";
import * as Models from "../../api/models";

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
        private readonly occ: BitbybitOcctModule,
        _och: OccHelper
    ) { }

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
    getDocumentParts(inputs: Inputs.OCCT.DocumentQueryDto<Handle_TDocStd_Document>): Models.OCCT.DocumentPartInfo[] {
        const jsonString = this.occ.GetDocumentPartsFromDoc(inputs.document);
        return JSON.parse(jsonString) as Models.OCCT.DocumentPartInfo[];
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
    getShapeFromLabel(inputs: Inputs.OCCT.DocumentLabelQueryDto<Handle_TDocStd_Document>): TopoDS_Shape {
        return this.occ.GetShapeFromDocLabel(inputs.document, inputs.label);
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
    getLabelColor(inputs: Inputs.OCCT.DocumentLabelQueryDto<Handle_TDocStd_Document>): Models.OCCT.LabelColorInfo {
        const jsonString = this.occ.GetDocLabelColor(inputs.document, inputs.label);
        return JSON.parse(jsonString) as Models.OCCT.LabelColorInfo;
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
    getLabelTransform(inputs: Inputs.OCCT.DocumentLabelQueryDto<Handle_TDocStd_Document>): Models.OCCT.LabelTransformInfo {
        const jsonString = this.occ.GetDocLabelTransform(inputs.document, inputs.label);
        return JSON.parse(jsonString) as Models.OCCT.LabelTransformInfo;
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
    getLabelInfo(inputs: Inputs.OCCT.DocumentLabelQueryDto<Handle_TDocStd_Document>): Models.OCCT.LabelInfo {
        const jsonString = this.occ.GetDocLabelInfo(inputs.document, inputs.label);
        return JSON.parse(jsonString) as Models.OCCT.LabelInfo;
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
    getAssemblyHierarchy(inputs: Inputs.OCCT.DocumentQueryDto<Handle_TDocStd_Document>): Models.OCCT.AssemblyHierarchyResult {
        const jsonString = this.occ.GetDocAssemblyHierarchy(inputs.document);
        return JSON.parse(jsonString) as Models.OCCT.AssemblyHierarchyResult;
    }

}
