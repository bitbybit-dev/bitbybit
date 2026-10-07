import { resolveDto } from "@bitbybit-dev/base";
import type { PropertySpec } from "../../build/build-types";
import { addPropertySet, propertySetsOf, removePropertySet, removePropertyValues, setPropertyValues } from "../../build/properties";
import type { IfcModel } from "../../model/model-types";
import * as Inputs from "../inputs";
import type * as Resolved from "../resolved-inputs";
import { editModel, modelOf, resolveId } from "./service-support";

function propertySpecs(properties: unknown): PropertySpec[] {
    if (!Array.isArray(properties)) {
        throw new TypeError("Expected the properties as a list");
    }
    return properties.map((property: Inputs.IFC.PropertyDto) => {
        const full = resolveDto(Inputs.IFC.PropertyDto, property) as Resolved.IFC.PropertyDto;
        if (typeof full.value !== "string" && typeof full.value !== "boolean" && !(typeof full.value === "number" && Number.isFinite(full.value))) {
            throw new TypeError(`The property '${full.name}' needs a text, a finite number, or true or false`);
        }
        return { name: full.name, value: full.value, type: full.type };
    });
}

/**
 * Properties: named sets of values attached to elements and types, such as `Pset_WallCommon` with
 * `IsExternal` and `FireRating`, which other tools list, filter and schedule by.
 * @beta
 */
export class IFCProperties {

    /**
     * Attaches a property set to one or more objects: walls, doors, types or any object with a
     * GlobalId.
     *
     * Each value is written as its `type`, or as a label, an integer, a real or a boolean by the
     * kind of value. One set is shared by every object it is attached to.
     * @param inputs - The model, the objects, the set's name and its properties
     * @returns A new model with the property set
     * @group properties
     * @shortname add property set
     * @drawable false
     * @example
     * ```typescript
     * model = await bitbybit.ifc.properties.addSet({
     *     model,
     *     elements: ["south", "east"],
     *     name: "Pset_WallCommon",
     *     properties: [{ name: "IsExternal", value: true }, { name: "FireRating", value: "REI 60" }],
     * });
     * ```
     */
    addSet(inputs: Inputs.IFC.AddPropertySetDto<IfcModel>): IfcModel {
        const resolved = resolveDto(Inputs.IFC.AddPropertySetDto, inputs) as Resolved.IFC.AddPropertySetDto<IfcModel>;
        const model = modelOf(resolved.model);
        if (!Array.isArray(resolved.elements) || !resolved.elements.length) {
            throw new TypeError("A property set is attached to a list of at least one object");
        }
        const objects = resolved.elements.map((element) => resolveId(model, element, "IfcObjectDefinition", "object"));
        const properties = propertySpecs(resolved.properties);
        return editModel(model, (tx, writer) => {
            addPropertySet(tx, writer, objects, resolved.name, properties);
        });
    }

    /**
     * Reads the property sets attached to an object, with each single value by name.
     *
     * Values of other kinds of property, such as lists and tables, are left out.
     * @param inputs - The model and the object
     * @returns The object's property sets
     * @group properties
     * @shortname get property sets
     * @drawable false
     * @example
     * ```typescript
     * const sets = await bitbybit.ifc.properties.getSets({ model, element: "south" });
     * ```
     */
    getSets(inputs: Inputs.IFC.ElementDto<IfcModel>): Inputs.IFC.PropertySetInfoDto[] {
        const model = modelOf(inputs.model);
        return propertySetsOf(model, resolveId(model, inputs.element, "IfcObjectDefinition", "object"));
    }

    /**
     * Sets property values of one object, in its property set of the given name, and makes the set
     * when the object has none. A set the object shares with other objects is copied first, so only
     * this object's values change.
     * @param inputs - The model, the object, the set's name and the properties
     * @returns A new model with the values set
     * @group properties
     * @shortname set property values
     * @drawable false
     * @example
     * ```typescript
     * model = await bitbybit.ifc.properties.setValues({ model, element: "south", name: "Pset_WallCommon", properties: [{ name: "FireRating", value: "REI 90" }] });
     * ```
     */
    setValues(inputs: Inputs.IFC.SetPropertyValuesDto<IfcModel>): IfcModel {
        const resolved = resolveDto(Inputs.IFC.SetPropertyValuesDto, inputs) as Resolved.IFC.SetPropertyValuesDto<IfcModel>;
        const model = modelOf(resolved.model);
        const object = resolveId(model, resolved.element, "IfcObjectDefinition", "object");
        const properties = propertySpecs(resolved.properties);
        return editModel(model, (tx, writer) => {
            setPropertyValues(tx, writer, object, resolved.name, properties);
        });
    }

    /**
     * Takes properties out of one object's property set; the set goes when none are left. A set the
     * object shares with other objects is copied first, so the others keep their values.
     * @param inputs - The model, the object, the set's name and the names of the properties
     * @returns A new model without the properties
     * @group properties
     * @shortname remove property values
     * @drawable false
     * @example
     * ```typescript
     * model = await bitbybit.ifc.properties.removeValues({ model, element: "south", name: "Pset_WallCommon", names: ["FireRating"] });
     * ```
     */
    removeValues(inputs: Inputs.IFC.RemovePropertyValuesDto<IfcModel>): IfcModel {
        const resolved = resolveDto(Inputs.IFC.RemovePropertyValuesDto, inputs) as Resolved.IFC.RemovePropertyValuesDto<IfcModel>;
        const model = modelOf(resolved.model);
        if (!Array.isArray(resolved.names) || !resolved.names.length || !resolved.names.every((name) => typeof name === "string")) {
            throw new TypeError("Expected the names of the properties as a list of at least one text");
        }
        const object = resolveId(model, resolved.element, "IfcObjectDefinition", "object");
        return editModel(model, (tx, writer) => {
            removePropertyValues(tx, writer, object, resolved.name, resolved.names);
        });
    }

    /**
     * Takes a property set away from one object. Other objects that share the set keep it.
     * @param inputs - The model, the object and the set's name
     * @returns A new model without the set on the object
     * @group properties
     * @shortname remove property set
     * @drawable false
     * @example
     * ```typescript
     * model = await bitbybit.ifc.properties.removeSet({ model, element: "south", name: "Pset_WallCommon" });
     * ```
     */
    removeSet(inputs: Inputs.IFC.RemovePropertySetDto<IfcModel>): IfcModel {
        const resolved = resolveDto(Inputs.IFC.RemovePropertySetDto, inputs) as Resolved.IFC.RemovePropertySetDto<IfcModel>;
        const model = modelOf(resolved.model);
        const object = resolveId(model, resolved.element, "IfcObjectDefinition", "object");
        return editModel(model, (tx, writer) => {
            removePropertySet(tx, writer, object, resolved.name);
        });
    }
}
