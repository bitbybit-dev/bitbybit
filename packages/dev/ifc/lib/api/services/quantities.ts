import { computeQuantities, quantitiesOf } from "../../build/quantities";
import type { IfcModel } from "../../model/model-types";
import type * as Inputs from "../inputs";
import { editModel, lengthTolerance, modelOf, resolveId } from "./service-support";

/**
 * Quantities: the base quantity sets IFC defines, such as `Qto_WallBaseQuantities` with a wall's
 * length, side areas and volumes net of its openings, measured from the elements' own geometry, so
 * other tools schedule and price them.
 * @beta
 */
export class IFCQuantities {

    /**
     * Measures elements and writes their base quantity sets, replacing any set of the same name: walls,
     * slabs, columns, beams, members, doors, windows, wall openings, spaces and roofs. A wall's volume
     * and side area follow its clippings and lose its openings. Measure again after changing elements.
     * @param inputs - The model and, optionally, the elements to measure
     * @returns A new model with the quantity sets
     * @group quantities
     * @shortname compute quantities
     * @drawable false
     * @example
     * ```typescript
     * model = await bitbybit.ifc.quantities.compute({ model });
     * ```
     */
    compute(inputs: Inputs.IFC.ComputeQuantitiesDto<IfcModel>): IfcModel {
        const model = modelOf(inputs.model);
        if (inputs.elements !== undefined && !Array.isArray(inputs.elements)) {
            throw new TypeError("Expected the elements as a list");
        }
        const elements = inputs.elements?.map((element) => resolveId(model, element, "IfcProduct", "element"));
        return editModel(model, (tx, writer) => {
            computeQuantities(tx, writer, model, elements, lengthTolerance(model));
        });
    }

    /**
     * Reads the quantity sets of an element, with each quantity's value by name.
     * @param inputs - The model and the element
     * @returns The element's quantity sets
     * @group quantities
     * @shortname get quantities
     * @drawable false
     * @example
     * ```typescript
     * const sets = await bitbybit.ifc.quantities.get({ model, element: "south" });
     * ```
     */
    get(inputs: Inputs.IFC.ElementDto<IfcModel>): Inputs.IFC.QuantitySetInfoDto[] {
        const model = modelOf(inputs.model);
        return quantitiesOf(model, resolveId(model, inputs.element, "IfcObjectDefinition", "object"));
    }
}
