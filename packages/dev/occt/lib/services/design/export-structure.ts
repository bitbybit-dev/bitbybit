import { linearToSrgb, srgbToLinear } from "@bitbybit-dev/base";
import type { TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import type * as Inputs from "../../api/inputs";
import type * as Models from "../../api/models";
import { stableJson } from "./cache";

type Part = Models.OCCT.DesignBuiltPart<TopoDS_Shape>;

/** The id of the structure node that stands for the document built, which the top-level parts or components sit under; no component path can be it. */
export const ROOT_NODE = "/";

const HEX_RADIX = 16;

const CHANNEL_MAX = 255;

const HEX_DIGITS_PER_CHANNEL = 2;

function rgbaOf(hex: string, opacity: number): Inputs.Base.ColorRGBA {
    const channel = (index: number): number => {
        const start = 1 + index * HEX_DIGITS_PER_CHANNEL;
        return parseInt(hex.slice(start, start + HEX_DIGITS_PER_CHANNEL), HEX_RADIX) / CHANNEL_MAX;
    };
    return { r: channel(0), g: channel(1), b: channel(2), a: opacity };
}

export function colourOf(part: Part): Inputs.Base.ColorRGBA | undefined {
    const hex = part.appearance?.color;
    return hex === undefined ? undefined : rgbaOf(hex, part.appearance?.opacity ?? 1);
}

type StructureLook = Omit<Models.OCCT.AssemblySubShapeColor, "indexes">;

type Finish = Pick<StructureLook, "metallic" | "roughness" | "emissiveRgb">;

function dimmed(channel: number, strength: number): number {
    if (strength === 1) {
        return channel;
    }
    return linearToSrgb(srgbToLinear(channel) * strength);
}

interface FinishSource {
    metallic?: number | undefined;
    roughness?: number | undefined;
    emissive?: string | undefined;
    emissiveStrength?: number | undefined;
}

function finishOf(look: FinishSource): Finish {
    const strength = Math.min(look.emissiveStrength ?? 1, 1);
    const glow = look.emissive === undefined ? undefined : rgbaOf(look.emissive, 1);
    return {
        ...(look.metallic === undefined ? {} : { metallic: look.metallic }),
        ...(look.roughness === undefined ? {} : { roughness: look.roughness }),
        ...(glow === undefined ? {} : { emissiveRgb: { r: dimmed(glow.r, strength), g: dimmed(glow.g, strength), b: dimmed(glow.b, strength) } }),
    };
}

function grouped(looks: ReadonlyMap<number, StructureLook>, inherited: StructureLook | undefined): Models.OCCT.AssemblySubShapeColor[] {
    const inheritedKey = inherited === undefined ? undefined : stableJson(inherited);
    const groups = new Map<string, Models.OCCT.AssemblySubShapeColor>();
    for (const [index, look] of looks) {
        const key = stableJson(look);
        if (key === inheritedKey) {
            continue;
        }
        const group = groups.get(key);
        if (group === undefined) {
            groups.set(key, { indexes: [index], ...look });
        } else {
            group.indexes.push(index);
        }
    }
    return [...groups.values()];
}

/**
 * How a part looks in STEP and glTF beyond its own colour: its finish (metallic, roughness, emission)
 * when it has a colour to carry it, and the looks of its faces and the colours of its edges. The last
 * entry listing a face or an edge decides it, as the renderers decide it; a face takes what its
 * entry leaves out from the part, and the faces and edges that only repeat the part's look are left
 * to inherit it.
 */
export function structureLookOf(part: Part): Pick<Models.OCCT.AssemblyPartDef<TopoDS_Shape>, "edgeColorRgba" | "faceColors" | "edgeColors" | "metallic" | "roughness" | "emissiveRgb"> {
    const appearance = part.appearance;
    if (appearance === undefined) {
        return {};
    }
    const partFinish = finishOf(appearance);
    const partColour = colourOf(part);
    const faces = new Map<number, StructureLook>();
    for (const entry of appearance.faces) {
        const hex = entry.color ?? appearance.color;
        const finish = finishOf({
            metallic: entry.metallic ?? appearance.metallic,
            roughness: entry.roughness ?? appearance.roughness,
            emissive: entry.emissive ?? appearance.emissive,
            emissiveStrength: entry.emissiveStrength ?? appearance.emissiveStrength,
        });
        for (const face of entry.indexes) {
            if (hex === undefined) {
                faces.delete(face);
            } else {
                faces.set(face, { colorRgba: rgbaOf(hex, entry.opacity ?? appearance.opacity ?? 1), ...finish });
            }
        }
    }
    const edges = new Map<number, StructureLook>();
    for (const entry of appearance.edges ?? []) {
        const hex = entry.color ?? appearance.edgeColor;
        for (const edge of entry.indexes) {
            if (hex === undefined) {
                edges.delete(edge);
            } else {
                edges.set(edge, { colorRgba: rgbaOf(hex, 1) });
            }
        }
    }
    const edgeColorRgba = appearance.edgeColor === undefined ? undefined : rgbaOf(appearance.edgeColor, 1);
    const faceColors = grouped(faces, partColour === undefined ? undefined : { colorRgba: partColour, ...partFinish });
    const edgeColors = grouped(edges, edgeColorRgba === undefined ? undefined : { colorRgba: edgeColorRgba });
    return {
        ...(partColour === undefined ? {} : partFinish),
        ...(edgeColorRgba === undefined ? {} : { edgeColorRgba }),
        ...(faceColors.length === 0 ? {} : { faceColors }),
        ...(edgeColors.length === 0 ? {} : { edgeColors }),
    };
}

type PropertyValues = Record<string, string | number | boolean>;

interface CarriedProperties {
    properties?: PropertyValues;
}

export function withProperties(values: PropertyValues | undefined): CarriedProperties {
    return values === undefined || Object.keys(values).length === 0 ? {} : { properties: values };
}

/** A built part as the assembly builders take it: a new handle on its shape, its name, its colours and finish, and its properties. */
export function structurePartOf(part: Part): Models.OCCT.AssemblyPartDef<TopoDS_Shape> {
    const colorRgba = colourOf(part);
    return { id: part.id, shape: part.shape.clone(), name: part.name, ...(colorRgba === undefined ? {} : { colorRgba }), ...structureLookOf(part), ...withProperties(part.properties) };
}

/**
 * The structure a part document's build exports by: one product named by the document, each part
 * placed once under it where it was built, so STEP and glTF keep the parts' names, colours and
 * properties, as an assembly's build does.
 */
export function partStructureOf(document: Models.OCCT.DesignPartDocument, parts: readonly Part[]): Models.OCCT.AssemblyStructureDef<TopoDS_Shape> {
    return {
        parts: parts.map(structurePartOf),
        nodes: [
            { id: ROOT_NODE, type: "assembly", name: document.meta?.name ?? "Part" },
            ...parts.map((part): Models.OCCT.AssemblyNodeDef => ({ id: part.id, type: "instance", name: part.name, parentId: ROOT_NODE, partId: part.id })),
        ],
        clearDocument: false,
        lengthUnit: document.units?.length ?? "mm",
    };
}
