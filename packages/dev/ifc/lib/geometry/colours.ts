import { materialOf } from "../build/materials";
import type { ModelSnapshot } from "../model/snapshot";
import type { IfcValue } from "../step/step-types";
import { isList, isReference } from "../step/values";

const OPAQUE = 1;
const MATERIAL_REPRESENTATION = "IfcMaterialDefinitionRepresentation";
const SURFACE_STYLE = "IfcSurfaceStyle";
const STYLE_ASSIGNMENT = "IfcPresentationStyleAssignment";
const STYLED_ITEM = "IfcStyledItem";

function materialsIn(model: ModelSnapshot, definition: number): number[] {
    const type = model.entity(definition).type;
    if (type === "IfcMaterial") {
        return [definition];
    }
    if (type === "IfcMaterialLayerSetUsage") {
        const set = model.attribute(definition, "ForLayerSet");
        return isReference(set) ? materialsIn(model, set.ref) : [];
    }
    if (type === "IfcMaterialLayerSet") {
        const layers = model.attribute(definition, "MaterialLayers");
        return (isList(layers) ? layers : []).filter(isReference).flatMap((layer) => {
            const material = model.attribute(layer.ref, "Material");
            return isReference(material) ? [material.ref] : [];
        });
    }
    return [];
}

function shadingColour(model: ModelSnapshot, style: number): number[] | undefined {
    const styles = model.attribute(style, "Styles");
    for (const element of isList(styles) ? styles : []) {
        if (!isReference(element) || !model.schema.isSubtypeOf(model.entity(element.ref).type, "IfcSurfaceStyleShading")) {
            continue;
        }
        const colour = model.attribute(element.ref, "SurfaceColour");
        if (!isReference(colour)) {
            continue;
        }
        const channels = ["Red", "Green", "Blue"].map((name) => model.attribute(colour.ref, name));
        const transparency = model.attribute(element.ref, "Transparency");
        if (channels.every((channel): channel is number => typeof channel === "number")) {
            return [...channels, OPAQUE - (typeof transparency === "number" ? transparency : 0)];
        }
    }
    return undefined;
}

function stylesColour(model: ModelSnapshot, styles: IfcValue, insideAssignment = false): number[] | undefined {
    for (const style of (isList(styles) ? styles : []).filter(isReference)) {
        const type = model.typeOf(style.ref);
        const colour = type === SURFACE_STYLE
            ? shadingColour(model, style.ref)
            : type === STYLE_ASSIGNMENT && !insideAssignment ? stylesColour(model, model.attribute(style.ref, "Styles"), true) : undefined;
        if (colour) {
            return colour;
        }
    }
    return undefined;
}

function representedColour(model: ModelSnapshot, definition: number): number[] | undefined {
    const representations = model.attribute(definition, "Representations");
    for (const representation of (isList(representations) ? representations : []).filter(isReference)) {
        const items = model.attribute(representation.ref, "Items");
        for (const item of (isList(items) ? items : []).filter(isReference)) {
            const colour = stylesColour(model, model.attribute(item.ref, "Styles"));
            if (colour) {
                return colour;
            }
        }
    }
    return undefined;
}

function colourOfMaterial(model: ModelSnapshot, material: number): number[] | undefined {
    for (const user of model.referencesTo(material)) {
        const represented = model.entity(user).type === MATERIAL_REPRESENTATION ? model.attribute(user, "RepresentedMaterial") : null;
        const colour = isReference(represented) && represented.ref === material ? representedColour(model, user) : undefined;
        if (colour) {
            return colour;
        }
    }
    return undefined;
}

export function colourOf(model: ModelSnapshot, colours: Map<number, number[] | undefined>, product: number): number[] | undefined {
    const definition = materialOf(model, product);
    if (definition === undefined) {
        return undefined;
    }
    for (const material of materialsIn(model, definition)) {
        if (!colours.has(material)) {
            colours.set(material, colourOfMaterial(model, material));
        }
        const colour = colours.get(material);
        if (colour) {
            return colour;
        }
    }
    return undefined;
}

export function itemColour(model: ModelSnapshot, colours: Map<number, number[] | undefined>, item: number): number[] | undefined {
    if (colours.has(item)) {
        return colours.get(item);
    }
    let colour: number[] | undefined;
    for (const user of model.referencesTo(item)) {
        const styled = model.typeOf(user) === STYLED_ITEM ? model.attribute(user, "Item") : null;
        colour = isReference(styled) && styled.ref === item ? stylesColour(model, model.attribute(user, "Styles")) : undefined;
        if (colour) {
            break;
        }
    }
    colours.set(item, colour);
    return colour;
}
