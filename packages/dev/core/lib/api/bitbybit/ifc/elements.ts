import * as Inputs from "../../inputs";
import type * as Resolved from "../../resolved-inputs";
import { resolveDto } from "@bitbybit-dev/base";
import type { IFCWorkerManager } from "@bitbybit-dev/ifc-worker";
import { IFCElements } from "@bitbybit-dev/ifc-worker/lib/api/elements";
import type { OCCT } from "@bitbybit-dev/occt-worker";

/**
 * Elements of any kind with an exact or meshed body: everything `elements` offers in the IFC worker,
 * plus `addShape`, which describes an OpenCascade shape for IFC and adds it in one call. It needs both
 * the IFC and the OCCT workers.
 * @beta
 */
export class IFCWElements extends IFCElements {

    constructor(
        ifcWorkerManager: IFCWorkerManager,
        private readonly occt: OCCT,
    ) {
        super(ifcWorkerManager);
    }

    /**
     * Adds an element of any class whose body is an OpenCascade shape, standing on a storey.
     *
     * The shape is described with only the surfaces IFC's advanced faces take, its cones and swept
     * surfaces as B-splines and its cavities cut from it, and scaled from its unit to the model's.
     * @param inputs - The model, the storey, the shape and its unit, and the element's class, name, placement and material
     * @returns A new model with the element
     * @group create
     * @shortname add shape element
     * @drawable false
     * @example
     * ```typescript
     * const bracket = await bitbybit.occt.shapes.solid.createBox({ width: 400, length: 200, height: 300, center: [0, 0, 150] });
     * model = await bitbybit.ifc.elements.addShape({ model, storey: "ground", shape: bracket, type: "IfcFurniture", name: "Bracket" });
     * ```
     */
    async addShape(inputs: Inputs.IFC.AddShapeElementDto<Inputs.IFC.IfcModelPointer, Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.IFC.IfcModelPointer> {
        const resolved = resolveDto(Inputs.IFC.AddShapeElementDto, inputs) as Resolved.IFC.AddShapeElementDto<Inputs.IFC.IfcModelPointer, Inputs.OCCT.TopoDSShapePointer>;
        const body = await this.occt.recipes.describe({ shape: resolved.shape, millimetresPerUnit: resolved.millimetresPerUnit, ifcSurfaces: true });
        return this.add({
            model: resolved.model, storey: resolved.storey, body, id: resolved.id, name: resolved.name, type: resolved.type,
            predefinedType: resolved.predefinedType, objectType: resolved.objectType, position: resolved.position, rotation: resolved.rotation, material: resolved.material,
        });
    }
}
