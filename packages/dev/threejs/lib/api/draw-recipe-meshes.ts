import * as THREEJS from "three";
import { srgbToLinear } from "@bitbybit-dev/base";
import { recipeDrawElementAt, recipeDrawPlanOf, recipeDrawRangeColors, recipeDrawRangeIndices } from "@bitbybit-dev/core";
import type { RecipeDrawBatch, RecipeDrawInstances, RecipeDrawMesh, RecipeDrawPart } from "@bitbybit-dev/core";
import type * as Inputs from "./inputs";
import type * as Resolved from "./resolved-inputs";
import type { RecipeDrawerHost, RecipeDrawState } from "./draw-recipe-meshes-types";

const POSITION_SIZE = 3;
const MATRIX_SIZE = 16;
const RGBA_SIZE = 4;
const TRIANGLE_CORNERS = 3;
const ALPHA_AT = 3;

function colourOf(hex: string, opacity: number): Inputs.Base.ColorRGBA {
    const colour = new THREEJS.Color().setStyle(hex, THREEJS.SRGBColorSpace).getRGB(new THREEJS.Color(), THREEJS.SRGBColorSpace);
    return { r: colour.r, g: colour.g, b: colour.b, a: opacity };
}

function linearColour(rgba: ArrayLike<number>): THREEJS.Color {
    return new THREEJS.Color().setRGB(rgba[0]!, rgba[1]!, rgba[2]!, THREEJS.LinearSRGBColorSpace);
}

export class RecipeMeshesDrawer {
    private readonly states = new WeakMap<THREEJS.Group, RecipeDrawState>();

    constructor(private readonly host: RecipeDrawerHost) {
    }

    draw(entity: Inputs.Manifold.RecipeMeshesDto, options: Resolved.Draw.DrawRecipeMeshesOptions): THREEJS.Group {
        const plan = recipeDrawPlanOf(entity, {
            elementKey: options.elementKey,
            instancing: options.instancing,
            minInstances: options.minInstances,
            maxBatchVertices: options.maxBatchVertices,
            defaultColor: colourOf(options.defaultColour, options.defaultOpacity),
        });
        const root = new THREEJS.Group();
        root.name = this.host.entityId("recipeMeshes");
        const batches = plan.batches.map((batch, index) => this.batchMesh(root, batch, index, this.host.material(batch.transparent, 1, true, options.metallic, options.roughness)));
        const instances = plan.instances.map((group, index) => this.instancesMesh(root, group, plan.meshes[group.mesh]!, index,
            this.host.material(group.transparent, group.colors[ALPHA_AT]!, false, options.metallic, options.roughness)));
        this.states.set(root, { plan, batches, instances, elementOf: new Map(plan.elements.map((element, index) => [element.key, index])) });
        this.host.scene().add(root);
        return root;
    }

    setVisible(drawn: THREEJS.Group, keys: readonly string[], visible: boolean): void {
        const state = this.stateOf(drawn);
        const groups = new Set<number>();
        this.partsOf(state, keys).forEach((part) => {
            if (part.batch !== undefined) {
                const batch = state.plan.batches[part.batch]!;
                const range = batch.ranges[part.range!]!;
                const index = state.batches[part.batch]!.geometry.getIndex()!;
                const start = range.firstTriangle * TRIANGLE_CORNERS;
                (index.array as Uint32Array).set(recipeDrawRangeIndices(batch, range, visible), start);
                index.addUpdateRange(start, range.triangles * TRIANGLE_CORNERS);
                index.needsUpdate = true;
            } else {
                const group = state.plan.instances[part.instances!]!;
                const placed = new THREEJS.Matrix4().fromArray(group.matrices, part.instance! * MATRIX_SIZE);
                const matrix = visible ? placed : new THREEJS.Matrix4().makeScale(0, 0, 0).setPosition(new THREEJS.Vector3().setFromMatrixPosition(placed));
                state.instances[part.instances!]!.setMatrixAt(part.instance!, matrix);
                groups.add(part.instances!);
            }
        });
        groups.forEach((group) => {
            state.instances[group]!.instanceMatrix.needsUpdate = true;
        });
    }

    setColour(drawn: THREEJS.Group, keys: readonly string[], colour: string | undefined, opacity: number): void {
        const state = this.stateOf(drawn);
        const shown = colour === undefined ? undefined : colourOf(colour, opacity);
        const groups = new Set<number>();
        this.partsOf(state, keys).forEach((part) => {
            if (part.batch !== undefined) {
                const batch = state.plan.batches[part.batch]!;
                const range = batch.ranges[part.range!]!;
                const colors = state.batches[part.batch]!.geometry.getAttribute("color") as THREEJS.BufferAttribute;
                const start = range.firstVertex * RGBA_SIZE;
                (colors.array as Float32Array).set(shown ? recipeDrawRangeColors(range, shown) : batch.colors.subarray(start, start + range.vertices * RGBA_SIZE), start);
                colors.addUpdateRange(start, range.vertices * RGBA_SIZE);
                colors.needsUpdate = true;
            } else {
                const group = state.plan.instances[part.instances!]!;
                const own = group.colors.subarray(part.instance! * RGBA_SIZE, (part.instance! + 1) * RGBA_SIZE);
                state.instances[part.instances!]!.setColorAt(part.instance!, shown ? linearColour([srgbToLinear(shown.r), srgbToLinear(shown.g), srgbToLinear(shown.b)]) : linearColour(own));
                groups.add(part.instances!);
            }
        });
        groups.forEach((group) => {
            state.instances[group]!.instanceColor!.needsUpdate = true;
        });
    }

    elementOfPick(drawn: THREEJS.Group, object: THREEJS.Object3D, triangle: number | undefined, instance: number | undefined): string | undefined {
        const state = this.stateOf(drawn);
        const batch = state.batches.indexOf(object as THREEJS.Mesh);
        if (batch >= 0) {
            const element = triangle === undefined ? undefined : recipeDrawElementAt(state.plan.batches[batch]!, triangle);
            return element === undefined ? undefined : state.plan.elements[element]!.key;
        }
        const group = state.instances.indexOf(object as THREEJS.InstancedMesh);
        const element = group < 0 || instance === undefined ? undefined : state.plan.instances[group]!.elements[instance];
        return element === undefined ? undefined : state.plan.elements[element]!.key;
    }

    private stateOf(drawn: THREEJS.Group): RecipeDrawState {
        const state = this.states.get(drawn);
        if (state === undefined) {
            throw new Error("The group was not drawn from recipe meshes by this renderer, so it holds no elements");
        }
        return state;
    }

    private partsOf(state: RecipeDrawState, keys: readonly string[]): RecipeDrawPart[] {
        return keys.flatMap((key) => {
            const element = state.elementOf.get(key);
            return element === undefined ? [] : state.plan.elements[element]!.parts;
        });
    }

    private batchMesh(root: THREEJS.Group, batch: RecipeDrawBatch, index: number, material: THREEJS.Material): THREEJS.Mesh {
        const geometry = new THREEJS.BufferGeometry();
        geometry.setAttribute("position", new THREEJS.BufferAttribute(batch.positions, POSITION_SIZE));
        geometry.setAttribute("normal", new THREEJS.BufferAttribute(batch.normals, POSITION_SIZE));
        geometry.setAttribute("color", new THREEJS.BufferAttribute(batch.colors.slice(), RGBA_SIZE).setUsage(THREEJS.DynamicDrawUsage));
        geometry.setIndex(new THREEJS.BufferAttribute(batch.indices.slice(), 1).setUsage(THREEJS.DynamicDrawUsage));
        const mesh = new THREEJS.Mesh(geometry, material);
        mesh.name = this.host.entityId("recipeBatch");
        mesh.position.set(...batch.origin);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.userData = { recipeBatch: index };
        root.add(mesh);
        return mesh;
    }

    private instancesMesh(root: THREEJS.Group, group: RecipeDrawInstances, data: RecipeDrawMesh, index: number, material: THREEJS.Material): THREEJS.InstancedMesh {
        const geometry = new THREEJS.BufferGeometry();
        geometry.setAttribute("position", new THREEJS.BufferAttribute(data.positions, POSITION_SIZE));
        geometry.setAttribute("normal", new THREEJS.BufferAttribute(data.normals, POSITION_SIZE));
        geometry.setIndex(new THREEJS.BufferAttribute(data.indices, 1));
        const count = group.elements.length;
        const mesh = new THREEJS.InstancedMesh(geometry, material, count);
        const matrix = new THREEJS.Matrix4();
        for (let instance = 0; instance < count; instance++) {
            mesh.setMatrixAt(instance, matrix.fromArray(group.matrices, instance * MATRIX_SIZE));
            mesh.setColorAt(instance, linearColour(group.colors.subarray(instance * RGBA_SIZE, (instance + 1) * RGBA_SIZE)));
        }
        mesh.instanceMatrix.setUsage(THREEJS.DynamicDrawUsage);
        mesh.name = this.host.entityId("recipeInstances");
        mesh.position.set(...group.origin);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.userData = { recipeInstances: index };
        root.add(mesh);
        return mesh;
    }
}
