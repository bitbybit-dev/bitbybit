import * as THREE from "three";
import type { BitByBitBase, Inputs } from "@bitbybit-dev/threejs";
import { ROOF } from "../house/house-plan";
import type { HouseModel, Layer } from "../house/house-types";
import type { DrawnHouse, ElementInfo, Look } from "./scene-types";

const SHARP_ANGLE = 40;
const FALLBACK_COLOUR = "#d6d3cc";
const MATTE: Look = { roughness: 0.88, metalness: 0 };
const FOLIAGE: Look = { roughness: 0.95, metalness: 0, faceted: true };
const GLASS: Look = { roughness: 0.04, metalness: 0, glass: true };
const GLASS_ENVIRONMENT = 1.8;
const LOOKS: Record<string, Look> = {
    "#3b342e": { roughness: 0.86, metalness: 0 },
    "#161514": { roughness: 0.7, metalness: 0 },
    "#b2865a": { roughness: 0.55, metalness: 0 },
    "#5c4433": { roughness: 0.5, metalness: 0 },
    "#8b6b52": { roughness: 0.7, metalness: 0 },
    "#2b2f33": { roughness: 0.32, metalness: 0.55 },
    "#2f3236": { roughness: 0.42, metalness: 0.6 },
    "#b4b8bc": { roughness: 0.24, metalness: 0.9 },
    "#1c2530": { roughness: 0.12, metalness: 0.35 },
    "#9fb184": { roughness: 1, metalness: 0 },
    "#9db277": FOLIAGE,
    "#6f8f58": FOLIAGE,
    "#50684b": FOLIAGE,
};
const LAYERS_BY_NAME: Record<string, Layer> = { [ROOF.name]: "roof", "Carport roof": "garden" };

function hexOf(rgba: readonly number[]): string {
    return `#${rgba.slice(0, 3).map((channel) => Math.round(channel * 255).toString(16).padStart(2, "0")).join("")}`;
}

function lookOf(rgba: readonly number[] | undefined): Look {
    if (!rgba) {
        return MATTE;
    }
    return (rgba[3] ?? 1) < 1 ? GLASS : LOOKS[hexOf(rgba)] ?? MATTE;
}

function styled(material: THREE.Material, look: Look): THREE.Material {
    if (!look.glass && !look.faceted) {
        return material;
    }
    const own = material.clone() as THREE.MeshPhysicalMaterial;
    if (look.glass) {
        own.envMapIntensity = GLASS_ENVIRONMENT;
        own.side = THREE.DoubleSide;
    }
    own.flatShading = look.faceted ?? false;
    return own;
}

export async function drawHouse(bitbybit: BitByBitBase, house: HouseModel): Promise<DrawnHouse> {
    const recipe = await bitbybit.ifc.geometry.recipe({ model: house.model });
    const built = await bitbybit.manifold.recipes.meshes({ recipe, adjustZtoY: true, emptyWhenFailed: true, minSharpAngle: SHARP_ANGLE });
    const elements = new Map<string, ElementInfo>();
    const rootsByLook = new Map<Look, Set<number>>();
    built.placements.forEach((placement, root) => {
        if (placement.mesh < 0) {
            return;
        }
        const tag = placement.tag;
        const globalId = String(tag["globalId"]);
        if (!elements.has(globalId)) {
            elements.set(globalId, {
                globalId,
                type: String(tag["type"]),
                name: String(tag["name"] ?? ""),
                layer: house.layers.get(globalId) ?? LAYERS_BY_NAME[String(tag["name"])] ?? "ground",
            });
        }
        const look = lookOf(Array.isArray(tag["rgba"]) ? tag["rgba"] : undefined);
        rootsByLook.set(look, (rootsByLook.get(look) ?? new Set()).add(root));
    });
    const groups: THREE.Group[] = [];
    for (const [look, roots] of rootsByLook) {
        const entity: Inputs.Manifold.RecipeMeshesDto = {
            meshes: built.meshes,
            placements: built.placements.map((placement, root) => roots.has(root) ? placement : { mesh: -1, matrix: placement.matrix, tag: placement.tag, group: placement.group }),
        };
        const options = bitbybit.draw.optionsRecipeMeshes({ defaultColour: FALLBACK_COLOUR, metallic: look.metalness, roughness: look.roughness });
        const group = await bitbybit.draw.drawAnyAsync({ entity, options });
        group.traverse((part) => {
            if (part instanceof THREE.Mesh) {
                part.material = styled(part.material as THREE.Material, look);
                part.castShadow = !look.glass;
            }
        });
        groups.push(group);
    }
    return { groups, elements };
}
