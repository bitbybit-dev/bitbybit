import type { IfcTransaction } from "../model/transaction";
import { enumValue, isList, isReference, ref } from "../step/values";
import type { LayerSpec, ModelReader, SurfaceColour } from "./build-types";
import { MATERIAL_ASSOCIATION } from "./constants";
import { bodyContext } from "./contexts";
import type { EntityWriter } from "./entity-writer";
import { appendToRelationship, relate, relatingOf } from "./relationships";

const MATERIAL = { type: "IfcMaterial", name: "Name", what: "material" } as const;
const LAYER_SET = { type: "IfcMaterialLayerSet", name: "LayerSetName", what: "layer set" } as const;

function findNamed(reader: ModelReader, type: string, nameAttribute: string, name: string): number | undefined {
    return reader.byType(type).find((entity) => reader.attribute(entity.id, nameAttribute) === name)?.id;
}

export function findMaterial(reader: ModelReader, name: string): number | undefined {
    return findNamed(reader, MATERIAL.type, MATERIAL.name, name);
}

export function findLayerSet(reader: ModelReader, name: string): number | undefined {
    return findNamed(reader, LAYER_SET.type, LAYER_SET.name, name);
}

export function requireMaterial(reader: ModelReader, name: string): number {
    const material = findMaterial(reader, name);
    if (material === undefined) {
        throw new Error(`The model has no ${MATERIAL.what} named '${name}'`);
    }
    return material;
}

export function requireLayerSet(reader: ModelReader, name: string): number {
    const layerSet = findLayerSet(reader, name);
    if (layerSet === undefined) {
        throw new Error(`The model has no ${LAYER_SET.what} named '${name}'`);
    }
    return layerSet;
}

function surfaceStyle(writer: EntityWriter, name: string, colour: SurfaceColour): number {
    const rgb = writer.create("IfcColourRgb", { Red: colour.red, Green: colour.green, Blue: colour.blue });
    const shading = writer.create("IfcSurfaceStyleShading", { SurfaceColour: ref(rgb), Transparency: colour.transparency > 0 ? colour.transparency : null });
    return writer.create("IfcSurfaceStyle", { Name: name, Side: enumValue("BOTH"), Styles: [ref(shading)] });
}

export function createMaterial(tx: IfcTransaction, writer: EntityWriter, name: string, category: string | undefined, colour: SurfaceColour | undefined): number {
    if (findMaterial(tx, name) !== undefined) {
        throw new Error(`The model already has a material named '${name}'`);
    }
    const material = writer.create("IfcMaterial", { Name: name, Category: category ?? null });
    if (colour) {
        const styled = writer.create("IfcStyledItem", { Styles: [ref(surfaceStyle(writer, name, colour))], Name: name });
        const representation = writer.create("IfcStyledRepresentation", {
            ContextOfItems: ref(bodyContext(tx, writer)),
            RepresentationIdentifier: "Style",
            RepresentationType: "Material",
            Items: [ref(styled)],
        });
        writer.create("IfcMaterialDefinitionRepresentation", { Representations: [ref(representation)], RepresentedMaterial: ref(material) });
    }
    return material;
}

export function createLayerSet(tx: IfcTransaction, writer: EntityWriter, name: string, layers: readonly LayerSpec[]): number {
    if (!layers.length) {
        throw new Error("A layer set needs at least one layer");
    }
    if (findLayerSet(tx, name) !== undefined) {
        throw new Error(`The model already has a layer set named '${name}'`);
    }
    const layerIds = layers.map((layer) => {
        if (!(layer.thickness >= 0) || !Number.isFinite(layer.thickness)) {
            throw new Error(`A layer's thickness must be zero or more, got ${layer.thickness}`);
        }
        return writer.create("IfcMaterialLayer", {
            Material: layer.material === undefined ? null : ref(requireMaterial(tx, layer.material)),
            LayerThickness: layer.thickness,
            Name: layer.name ?? null,
        });
    });
    return writer.create("IfcMaterialLayerSet", { MaterialLayers: layerIds.map(ref), LayerSetName: name });
}

export function layerSetThickness(reader: ModelReader, layerSet: number): number {
    const layers = reader.attribute(layerSet, "MaterialLayers");
    let total = 0;
    for (const layer of isList(layers) ? layers : []) {
        if (isReference(layer)) {
            const thickness = reader.attribute(layer.ref, "LayerThickness");
            total += typeof thickness === "number" ? thickness : 0;
        }
    }
    return total;
}

function isPlainLayerSet(reader: ModelReader, layerSet: number, thickness: number): boolean {
    const layers = reader.attribute(layerSet, "MaterialLayers");
    const only = isList(layers) && layers.length === 1 ? layers[0] : undefined;
    return isReference(only) && reader.attribute(only.ref, "Material") === null && layerSetThickness(reader, layerSet) === thickness;
}

export function layerSetFor(tx: IfcTransaction, writer: EntityWriter, named: string | undefined, thickness: number, kind: string): number {
    if (named !== undefined) {
        return requireLayerSet(tx, named);
    }
    if (!(thickness > 0) || !Number.isFinite(thickness)) {
        throw new RangeError(`A ${kind.toLowerCase()}'s thickness must be more than zero, got ${thickness}`);
    }
    let name = `${kind} ${thickness}`;
    for (let copy = 2; ; copy++) {
        const existing = findLayerSet(tx, name);
        if (existing === undefined) {
            break;
        }
        if (isPlainLayerSet(tx, existing, thickness)) {
            return existing;
        }
        name = `${kind} ${thickness} (${copy})`;
    }
    const layer = writer.create("IfcMaterialLayer", { LayerThickness: thickness });
    return writer.create("IfcMaterialLayerSet", { MaterialLayers: [ref(layer)], LayerSetName: name });
}

export function associateMaterial(tx: IfcTransaction, writer: EntityWriter, objects: readonly number[], material: number): void {
    appendToRelationship(tx, writer, MATERIAL_ASSOCIATION, material, objects);
}

export function associateNewMaterial(tx: IfcTransaction, writer: EntityWriter, objects: readonly number[], material: number): void {
    relate(tx, writer, MATERIAL_ASSOCIATION, material, objects);
}

export function materialOf(reader: ModelReader, object: number): number | undefined {
    return relatingOf(reader, MATERIAL_ASSOCIATION, object);
}

export function layerSetUsage(writer: EntityWriter, layerSet: number, direction: "AXIS2" | "AXIS3", sense: "POSITIVE" | "NEGATIVE", offset: number): number {
    return writer.create("IfcMaterialLayerSetUsage", {
        ForLayerSet: ref(layerSet),
        LayerSetDirection: enumValue(direction),
        DirectionSense: enumValue(sense),
        OffsetFromReferenceLine: offset,
    });
}
