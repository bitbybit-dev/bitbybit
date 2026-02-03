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
 * All methods use document handles directly (no global document storage).
 */
export class OCCTAssemblyQuery {

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly och: OccHelper
    ) { }

    /**
     * Get all parts and assemblies in a document.
     * 
     * @param inputs - Document handle
     * @returns Array of part/assembly info objects
     */
    getDocumentParts(inputs: Inputs.OCCT.DocumentQueryDto<Handle_TDocStd_Document>): Models.OCCT.DocumentPartInfo[] {
        const jsonString = this.occ.GetDocumentPartsFromDoc(inputs.document);
        return JSON.parse(jsonString) as Models.OCCT.DocumentPartInfo[];
    }

    /**
     * Get a shape from a label in a document.
     * 
     * @param inputs - Document handle and label
     * @returns The shape at the given label
     */
    getShapeFromLabel(inputs: Inputs.OCCT.DocumentLabelQueryDto<Handle_TDocStd_Document>): TopoDS_Shape {
        return this.occ.GetShapeFromDocLabel(inputs.document, inputs.label);
    }

    /**
     * Get the color of a label in a document.
     * 
     * @param inputs - Document handle and label
     * @returns Color info including hasColor, r, g, b, a
     */
    getLabelColor(inputs: Inputs.OCCT.DocumentLabelQueryDto<Handle_TDocStd_Document>): Models.OCCT.LabelColorInfo {
        const jsonString = this.occ.GetDocLabelColor(inputs.document, inputs.label);
        return JSON.parse(jsonString) as Models.OCCT.LabelColorInfo;
    }

    /**
     * Get the transformation of an instance label.
     * 
     * @param inputs - Document handle and label
     * @returns Transform info including matrix, translation, quaternion, scale
     */
    getLabelTransform(inputs: Inputs.OCCT.DocumentLabelQueryDto<Handle_TDocStd_Document>): Models.OCCT.LabelTransformInfo {
        const jsonString = this.occ.GetDocLabelTransform(inputs.document, inputs.label);
        return JSON.parse(jsonString) as Models.OCCT.LabelTransformInfo;
    }

    /**
     * Get detailed info about a label.
     * 
     * @param inputs - Document handle and label
     * @returns Detailed label info including type, flags, children
     */
    getLabelInfo(inputs: Inputs.OCCT.DocumentLabelQueryDto<Handle_TDocStd_Document>): Models.OCCT.LabelInfo {
        const jsonString = this.occ.GetDocLabelInfo(inputs.document, inputs.label);
        return JSON.parse(jsonString) as Models.OCCT.LabelInfo;
    }

    /**
     * Get full assembly hierarchy as structured data.
     * 
     * @param inputs - Document handle
     * @returns Assembly hierarchy with all nodes
     */
    getAssemblyHierarchy(inputs: Inputs.OCCT.DocumentQueryDto<Handle_TDocStd_Document>): Models.OCCT.AssemblyHierarchyResult {
        const jsonString = this.occ.GetDocAssemblyHierarchy(inputs.document);
        return JSON.parse(jsonString) as Models.OCCT.AssemblyHierarchyResult;
    }

}
