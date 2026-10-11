import { resolveDto } from "@bitbybit-dev/base";
import { createAssembly } from "../../build/assemblies";
import type { IfcModel } from "../../model/model-types";
import * as Inputs from "../inputs";
import type * as Resolved from "../resolved-inputs";
import { editModel, modelOf, oneOf, resolveId } from "./service-support";

/**
 * Assemblies: elements made of other elements, such as a facade's cladding boards or a truss's
 * members, which other tools list as one element with its parts and the STEP export of a model
 * nests as one assembly.
 * @beta
 */
export class IFCAssemblies {

    /**
     * Makes elements the parts of a new assembly standing in their storey in their place. The parts
     * keep their geometry and placement and stand in the model through it; removing the assembly
     * removes them.
     *
     * They must share one storey, or other part of the structure, and belong to no other assembly;
     * openings cannot be parts.
     * @param inputs - The model, the parts, and the assembly's id, name and kind
     * @returns A new model with the assembly
     * @group create
     * @shortname add assembly
     * @drawable false
     * @example
     * ```typescript
     * model = await bitbybit.ifc.assemblies.add({ model, parts: ["board-1", "board-2", "board-3"], id: "south-cladding", name: "South cladding", predefinedType: Bit.Inputs.IFC.elementAssemblyPredefinedTypeEnum.userDefined, objectType: "Cladding" });
     * ```
     */
    add(inputs: Inputs.IFC.AddAssemblyDto<IfcModel>): IfcModel {
        const resolved = resolveDto(Inputs.IFC.AddAssemblyDto, inputs) as Resolved.IFC.AddAssemblyDto<IfcModel>;
        const model = modelOf(resolved.model);
        if (!Array.isArray(resolved.parts) || resolved.parts.length === 0) {
            throw new TypeError("Expected the parts as a list of at least one element's GlobalId or id");
        }
        const parts = resolved.parts.map((part) => resolveId(model, part, "IfcElement", "part"));
        if (new Set(parts).size !== parts.length) {
            throw new Error("The parts name one element more than once");
        }
        const predefinedType = oneOf(resolved.predefinedType, Inputs.IFC.elementAssemblyPredefinedTypeEnum, "predefined type");
        const objectType = resolved.objectType?.trim() || undefined;
        if (predefinedType === Inputs.IFC.elementAssemblyPredefinedTypeEnum.userDefined && objectType === undefined) {
            throw new Error("A userDefined assembly needs an objectType that says what kind it is, such as Cladding");
        }
        return editModel(model, (tx, writer) => {
            createAssembly(tx, writer, { parts, id: resolved.id, name: resolved.name, predefinedType, objectType });
        });
    }
}
