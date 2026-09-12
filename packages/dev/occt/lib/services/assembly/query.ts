import { BitbybitOcctModule, Handle_TDocStd_Document, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import * as Inputs from "../../api/inputs";
import * as Models from "../../api/models";

/**
 * Reading an assembly document: the parts and sub-assemblies it holds, the shape behind a label, a
 * label's color, placement and details, and the whole hierarchy as a tree. Labels are the ids the
 * document gives every part, instance and assembly, such as `0:1:1:1`; `getDocumentParts` and
 * `getAssemblyHierarchy` list them, the other methods take one. The document itself is not changed
 * by any query.
 */
export class OCCTAssemblyQuery {

    constructor(
        private readonly occ: BitbybitOcctModule,
        _och: OccHelper
    ) { }

    /**
     * Lists every part and sub-assembly in a document with its label, name, type, color and how
     * many times it is placed.
     *
     * The labels are what the other query methods and the label setters take.
     * @param inputs - The document
     * @returns One entry per part or assembly
     * @group query
     * @shortname get parts
     * @drawable false
     * @example
     * ```typescript
     * const parts = await bitbybit.occt.assembly.query.getDocumentParts({ document: doc });
     * parts.forEach(part => console.log(part.name, part.type, part.label));
     * ```
     */
    getDocumentParts(inputs: Inputs.OCCT.DocumentQueryDto<Handle_TDocStd_Document>): Models.OCCT.DocumentPartInfo[] {
        const jsonString = this.occ.GetDocumentPartsFromDoc(inputs.document);
        return JSON.parse(jsonString) as Models.OCCT.DocumentPartInfo[];
    }

    /**
     * Reads the shape stored under a label of a document, for instance to draw one part or run an
     * operation on it.
     * @param inputs - The document and the label
     * @returns The shape at that label
     * @group query
     * @shortname get shape from label
     * @drawable true
     * @example
     * ```typescript
     * const shape = await bitbybit.occt.assembly.query.getShapeFromLabel({ document: doc, label: "0:1:1:1" });
     * ```
     */
    getShapeFromLabel(inputs: Inputs.OCCT.DocumentLabelQueryDto<Handle_TDocStd_Document>): TopoDS_Shape {
        return this.occ.GetShapeFromDocLabel(inputs.document, inputs.label);
    }

    /**
     * Reads the color assigned to a label of a document, as red, green, blue and alpha from 0 to 1,
     * together with a flag saying whether the label has a color at all.
     * @param inputs - The document and the label
     * @returns The color with its `hasColor` flag
     * @group query
     * @shortname get label color
     * @drawable false
     * @example
     * ```typescript
     * const color = await bitbybit.occt.assembly.query.getLabelColor({ document: doc, label: "0:1:1:1" });
     * if (color.hasColor) console.log(color.r, color.g, color.b);
     * ```
     */
    getLabelColor(inputs: Inputs.OCCT.DocumentLabelQueryDto<Handle_TDocStd_Document>): Models.OCCT.LabelColorInfo {
        const jsonString = this.occ.GetDocLabelColor(inputs.document, inputs.label);
        return JSON.parse(jsonString) as Models.OCCT.LabelColorInfo;
    }

    /**
     * Reads the placement of an instance label in a document as a column-major matrix plus its
     * translation, rotation quaternion and uniform scale.
     *
     * A part label, as opposed to an instance, carries no placement of its own.
     * @param inputs - The document and the label
     * @returns The matrix, the translation, the quaternion and the scale
     * @group query
     * @shortname get label transform
     * @drawable false
     * @example
     * ```typescript
     * const placement = await bitbybit.occt.assembly.query.getLabelTransform({ document: doc, label: "0:1:1:1" });
     * console.log(placement.translation);
     * ```
     */
    getLabelTransform(inputs: Inputs.OCCT.DocumentLabelQueryDto<Handle_TDocStd_Document>): Models.OCCT.LabelTransformInfo {
        const jsonString = this.occ.GetDocLabelTransform(inputs.document, inputs.label);
        return JSON.parse(jsonString) as Models.OCCT.LabelTransformInfo;
    }

    /**
     * Describes one label of a document: its name, its type and whether it is a simple shape, an
     * assembly, a reference to another label or a component of one.
     * @param inputs - The document and the label
     * @returns The label's name, type and flags
     * @group query
     * @shortname get label info
     * @drawable false
     * @example
     * ```typescript
     * const info = await bitbybit.occt.assembly.query.getLabelInfo({ document: doc, label: "0:1:1:1" });
     * console.log(info.name, info.isAssembly);
     * ```
     */
    getLabelInfo(inputs: Inputs.OCCT.DocumentLabelQueryDto<Handle_TDocStd_Document>): Models.OCCT.LabelInfo {
        const jsonString = this.occ.GetDocLabelInfo(inputs.document, inputs.label);
        return JSON.parse(jsonString) as Models.OCCT.LabelInfo;
    }

    /**
     * Reads the whole assembly tree of a document as a flat list of nodes with their parents, so it
     * can be walked or shown as a tree.
     *
     * Each node carries its label, name, type and placement; the list is in depth-first order, so
     * children follow their parent.
     * @param inputs - The document
     * @returns The nodes of the tree with their count and the format version
     * @group query
     * @shortname get hierarchy
     * @drawable false
     * @example
     * ```typescript
     * const tree = await bitbybit.occt.assembly.query.getAssemblyHierarchy({ document: doc });
     * console.log(tree.totalNodes, tree.nodes.map(n => n.name));
     * ```
     */
    getAssemblyHierarchy(inputs: Inputs.OCCT.DocumentQueryDto<Handle_TDocStd_Document>): Models.OCCT.AssemblyHierarchyResult {
        const jsonString = this.occ.GetDocAssemblyHierarchy(inputs.document);
        return JSON.parse(jsonString) as Models.OCCT.AssemblyHierarchyResult;
    }

}
