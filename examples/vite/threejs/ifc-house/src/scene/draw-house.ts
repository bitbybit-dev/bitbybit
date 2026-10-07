import * as THREE from "three";
import { Inputs, type BitByBitBase } from "@bitbybit-dev/threejs";
import { ROOF } from "../house/house-plan";
import type { HouseModel, Layer } from "../house/house-types";
import type { DrawnElement, ElementInfo, Look } from "./scene-types";

const SHARP_ANGLE = 40;
const FALLBACK_COLOUR = "#d6d3cc";
const MATTE: Look = { roughness: 0.88, metalness: 0 };
const FOLIAGE: Look = { roughness: 0.95, metalness: 0, faceted: true };
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

class Materials {
    private readonly made = new Map<string, THREE.Material>();

    of(rgba: readonly number[] | undefined): THREE.Material {
        const colour = rgba ? hexOf(rgba) : FALLBACK_COLOUR;
        const alpha = rgba?.[3] ?? 1;
        const key = `${colour}/${alpha}`;
        let material = this.made.get(key);
        if (!material) {
            material = alpha < 1 ? this.glass(colour, alpha) : this.solid(colour, LOOKS[colour] ?? MATTE);
            this.made.set(key, material);
        }
        return material;
    }

    private solid(colour: string, look: Look): THREE.Material {
        return new THREE.MeshStandardMaterial({ color: colour, roughness: look.roughness, metalness: look.metalness, flatShading: look.faceted ?? false });
    }

    private glass(colour: string, alpha: number): THREE.Material {
        return new THREE.MeshPhysicalMaterial({
            color: colour, transparent: true, opacity: Math.max(0.18, alpha), roughness: 0.04, metalness: 0,
            envMapIntensity: 1.8, depthWrite: false, side: THREE.DoubleSide,
        });
    }
}

export async function drawHouse(bitbybit: BitByBitBase, house: HouseModel): Promise<DrawnElement[]> {
    const recipe = await bitbybit.ifc.geometry.recipe({ model: house.model });
    const solids = await bitbybit.manifold.recipes.build({ recipe, adjustZtoY: true, emptyWhenFailed: true });
    const meshes = await bitbybit.manifold.decomposeManifoldsOrCrossSections({ manifoldsOrCrossSections: solids, minSharpAngle: SHARP_ANGLE });
    const materials = new Materials();
    const drawn: DrawnElement[] = [];
    for (let index = 0; index < recipe.roots.length; index++) {
        const tag = recipe.roots[index].tag;
        const rgba = Array.isArray(tag.rgba) ? tag.rgba : undefined;
        const options = new Inputs.Draw.DrawManifoldOrCrossSectionOptions();
        options.faceMaterial = materials.of(rgba);
        options.drawTwoSided = false;
        options.minSharpAngle = SHARP_ANGLE;
        const object = await bitbybit.draw.drawAnyAsync({ entity: meshes[index] as Inputs.Manifold.DecomposedManifoldMeshDto, options });
        if (!object) {
            continue;
        }
        const info: ElementInfo = {
            globalId: String(tag.globalId),
            type: String(tag.type),
            name: String(tag.name ?? ""),
            layer: house.layers.get(String(tag.globalId)) ?? LAYERS_BY_NAME[String(tag.name)] ?? "ground",
        };
        const seeThrough = rgba !== undefined && rgba[3] < 1;
        object.traverse((part) => {
            part.userData = { ...part.userData, element: info };
            part.castShadow = !seeThrough;
            part.receiveShadow = true;
        });
        drawn.push({ info, object });
    }
    return drawn;
}
