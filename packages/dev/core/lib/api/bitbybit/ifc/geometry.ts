import * as Inputs from "../../inputs";
import type * as Resolved from "../../resolved-inputs";
import { resolveDto } from "@bitbybit-dev/base";
import type { IFCWorkerManager } from "@bitbybit-dev/ifc-worker";
import { IFCGeometry } from "@bitbybit-dev/ifc-worker/lib/api/geometry";
import type { OCCT } from "@bitbybit-dev/occt-worker";

/**
 * A model's geometry: everything `geometry` offers in the IFC worker, plus `toShapes`, `toDocument`
 * and `toStep`, which hand the model's recipe to OpenCascade, so circles stay circles and the
 * results measure, cut and export like any other shape. They need both the IFC and the OCCT workers.
 * @beta
 */
export class IFCWGeometry extends IFCGeometry {

    constructor(
        ifcWorkerManager: IFCWorkerManager,
        private readonly occt: OCCT,
    ) {
        super(ifcWorkerManager);
    }

    /**
     * Builds a model's elements as OpenCascade shapes, one per element in the order
     * `geometry.recipe` lists them, each placed where the model puts it, in the model's units.
     *
     * An element the kernel cannot build comes back as an empty compound unless `emptyWhenFailed`
     * is false; `geometry.unsupported` lists the elements the recipe leaves out.
     * @param inputs - The model, the elements, whether Z turns into Y, whether a failed element stops the build, and how meshes are built
     * @returns One shape per element
     * @group recipes
     * @shortname to shapes
     * @drawable true
     * @example
     * ```typescript
     * const shapes = await bitbybit.ifc.geometry.toShapes({ model });
     * await bitbybit.draw.drawAnyAsync({ entity: shapes });
     * ```
     */
    async toShapes(inputs: Inputs.IFC.GeometryToShapesDto<Inputs.IFC.IfcModelPointer>): Promise<Inputs.OCCT.TopoDSShapePointer[]> {
        const resolved = resolveDto(Inputs.IFC.GeometryToShapesDto, inputs) as Resolved.IFC.GeometryToShapesDto<Inputs.IFC.IfcModelPointer>;
        const recipe = await this.recipe({ model: resolved.model, elements: resolved.elements });
        return this.occt.recipes.build({
            recipe, adjustZtoY: resolved.adjustZtoY, emptyWhenFailed: resolved.emptyWhenFailed,
            facetedMeshes: resolved.facetedMeshes, maxTriangles: resolved.maxTriangles,
        });
    }

    /**
     * Builds a model's elements into an OpenCascade assembly document for STEP or glTF: a product
     * per element with its GlobalId and IFC type as properties, nested in its site, building and
     * storey, by IFC class unless `groupByClass` is false, one part per type placed many times.
     *
     * Millimetres unless STEP can state the model's unit; delete it with
     * `occt.assembly.manager.deleteDocument`.
     * @param inputs - The model, the elements, the top assembly's name, whether a failed element stops the build, how meshes are built, and whether storeys are grouped by class
     * @returns The document handle
     * @group recipes
     * @shortname to document
     * @drawable false
     * @example
     * ```typescript
     * const document = await bitbybit.ifc.geometry.toDocument({ model, name: "House" });
     * const gltf = await bitbybit.occt.assembly.manager.exportDocumentToGltf({ document, fileName: "house.glb" });
     * await bitbybit.occt.assembly.manager.deleteDocument({ document });
     * ```
     */
    async toDocument(inputs: Inputs.IFC.GeometryToDocumentDto<Inputs.IFC.IfcModelPointer>): Promise<Inputs.OCCT.TDocStdDocumentPointer> {
        const resolved = resolveDto(Inputs.IFC.GeometryToDocumentDto, inputs) as Resolved.IFC.GeometryToDocumentDto<Inputs.IFC.IfcModelPointer>;
        const recipe = await this.recipe({ model: resolved.model, elements: resolved.elements, groupByClass: resolved.groupByClass });
        return this.occt.recipes.buildDocument({
            recipe, name: resolved.name, emptyWhenFailed: resolved.emptyWhenFailed,
            facetedMeshes: resolved.facetedMeshes, maxTriangles: resolved.maxTriangles,
        });
    }

    /**
     * Writes a model's elements as a STEP file of OpenCascade shapes, as `toDocument` builds them,
     * and gives back its bytes.
     *
     * Elements stored as triangle meshes are written as tessellated geometry unless `facetedMeshes`
     * is set. A model of a million mesh triangles writes some 280 MB of STEP and needs the 64-bit
     * kernel, or the elements written in parts.
     * @param inputs - The model, the elements, the top assembly's name, the file name, whether a failed element stops the export, how meshes are built, compression, download and whether storeys are grouped by class
     * @returns The STEP file's bytes
     * @group recipes
     * @shortname to step
     * @drawable false
     * @example
     * ```typescript
     * const step = await bitbybit.ifc.geometry.toStep({ model, name: "House", fileName: "house.step", tryDownload: true });
     * console.log(step.length);
     * ```
     */
    async toStep(inputs: Inputs.IFC.GeometryToStepDto<Inputs.IFC.IfcModelPointer>): Promise<Uint8Array> {
        const resolved = resolveDto(Inputs.IFC.GeometryToStepDto, inputs) as Resolved.IFC.GeometryToStepDto<Inputs.IFC.IfcModelPointer>;
        const document = await this.toDocument({
            model: resolved.model, elements: resolved.elements, name: resolved.name, emptyWhenFailed: resolved.emptyWhenFailed,
            facetedMeshes: resolved.facetedMeshes, maxTriangles: resolved.maxTriangles, groupByClass: resolved.groupByClass,
        });
        try {
            return await this.occt.assembly.manager.exportDocumentToStep({
                document, fileName: resolved.fileName, compress: resolved.compress, tryDownload: resolved.tryDownload,
            });
        } finally {
            await this.occt.assembly.manager.deleteDocument({ document });
        }
    }
}
