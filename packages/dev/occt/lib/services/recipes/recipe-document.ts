import type { Base } from "@bitbybit-dev/base";
import { recipeSourceOf } from "@bitbybit-dev/base";
import { followedBy, isRigidMatrix } from "@bitbybit-dev/base/lib/api/services/helpers/matrices";
import type * as Models from "../../api/models";
import type { PlannedInstance, PlannedPart, RecipeDocumentPlan } from "./recipe-types";
import { IDENTITY_MATRIX, RGBA_SIZE, RGB_SIZE, STEP_UNITS, UNIT_TOLERANCE } from "./recipes.constants";

const TOP_ID = "recipe";

function isIdentity(matrix: readonly number[]): boolean {
    return matrix.every((value, index) => value === IDENTITY_MATRIX[index]);
}

function nameOf(tag: Record<string, Base.RecipeTagValue>, root: number): string {
    for (const key of ["name", "type"]) {
        const value = tag[key];
        if (typeof value === "string" && value.trim() !== "") {
            return value;
        }
    }
    return `Root ${root}`;
}

function colourOf(tag: Record<string, Base.RecipeTagValue>): Base.ColorRGBA | undefined {
    const rgba = tag["rgba"];
    if (!Array.isArray(rgba) || (rgba.length !== RGB_SIZE && rgba.length !== RGBA_SIZE) || !rgba.every(Number.isFinite)) {
        return undefined;
    }
    return { r: rgba[0]!, g: rgba[1]!, b: rgba[2]!, a: rgba[RGB_SIZE] ?? 1 };
}

function sameColour(colours: readonly (Base.ColorRGBA | undefined)[]): Base.ColorRGBA | undefined {
    const [first] = colours;
    return first !== undefined && colours.every((colour) => colour !== undefined && colour.r === first.r && colour.g === first.g && colour.b === first.b && colour.a === first.a)
        ? first
        : undefined;
}

function propertiesOf(tag: Record<string, Base.RecipeTagValue>): Record<string, string | number | boolean> {
    const properties: Record<string, string | number | boolean> = {};
    for (const [key, value] of Object.entries(tag)) {
        if (typeof value === "string" || typeof value === "boolean" || (typeof value === "number" && Number.isFinite(value))) {
            properties[key] = value;
        }
    }
    return properties;
}

function groupsOf(recipe: Base.Recipe, groupBy: string, isBuilt: (root: number) => boolean): number[][] {
    const groups = new Map<string, number[]>();
    recipe.roots.forEach((root, index) => {
        if (!isBuilt(index)) {
            return;
        }
        const value = root.tag[groupBy];
        const key = typeof value === "string" && value !== "" || typeof value === "number" && Number.isFinite(value) ? `${typeof value}:${value}` : `root:${index}`;
        groups.set(key, [...groups.get(key) ?? [], index]);
    });
    return [...groups.values()];
}

function groupNodesOf(recipe: Base.Recipe, products: readonly number[][]): Models.OCCT.AssemblyNodeDef[] {
    const groups = recipe.groups ?? [];
    const used = new Set<number>();
    for (const roots of products) {
        for (let group = recipe.roots[roots[0]!]!.group; group !== undefined && !used.has(group); group = groups[group]!.parent) {
            used.add(group);
        }
    }
    return groups.flatMap((group, index): Models.OCCT.AssemblyNodeDef[] => used.has(index)
        ? [{
            id: groupIdOf(index), type: "assembly", name: group.name.trim() === "" ? `Group ${index + 1}` : group.name,
            parentId: group.parent === undefined ? TOP_ID : groupIdOf(group.parent), properties: propertiesOf(group.tag),
        }]
        : []);
}

function groupIdOf(group: number): string {
    return `group-${group}`;
}

export function documentPlan(recipe: Base.Recipe): RecipeDocumentPlan {
    const unit = STEP_UNITS.find(([millimetres]) => Math.abs(millimetres - recipe.millimetresPerUnit) <= millimetres * UNIT_TOLERANCE);
    const scale = recipe.millimetresPerUnit;
    const toMillimetres: Base.TransformMatrix = [scale, 0, 0, 0, 0, scale, 0, 0, 0, 0, scale, 0, 0, 0, 0, 1];
    const parts: PlannedPart[] = [];
    const partOfNode = new Map<number, number>();
    const instances = recipe.roots.map((root, index): PlannedInstance => {
        const { node, matrix } = recipeSourceOf(recipe, root.node, unit ? root.matrix : followedBy(root.matrix, toMillimetres));
        if (!isRigidMatrix(matrix)) {
            return { part: parts.push({ root: { node, matrix, tag: {} }, roots: [index] }) - 1, matrix: IDENTITY_MATRIX };
        }
        let part = partOfNode.get(node);
        if (part === undefined) {
            part = parts.push({ root: { node, matrix: IDENTITY_MATRIX, tag: {} }, roots: [] }) - 1;
            partOfNode.set(node, part);
        }
        parts[part]!.roots.push(index);
        return { part, matrix };
    });
    return { parts, instances, lengthUnit: unit ? unit[1] : "mm" };
}

export function documentStructure<T>(recipe: Base.Recipe, plan: RecipeDocumentPlan, shapes: readonly (T | null)[], name: string, groupBy: string): Models.OCCT.AssemblyStructureDef<T> {
    const isBuilt = (root: number): boolean => shapes[plan.instances[root]!.part] !== null;
    const partColours = plan.parts.map((part) => sameColour(part.roots.map((root) => colourOf(recipe.roots[root]!.tag))));
    const parts: Models.OCCT.AssemblyPartDef<T>[] = [];
    plan.parts.forEach((part, index) => {
        const shape = shapes[index];
        if (shape === null || shape === undefined) {
            return;
        }
        const names = new Set(part.roots.map((root) => nameOf(recipe.roots[root]!.tag, root)));
        const type = recipe.roots[part.roots[0]!]!.tag["type"];
        const partName = names.size === 1 ? [...names][0]! : `${typeof type === "string" && type !== "" ? type : "Part"} ${index + 1}`;
        const colour = partColours[index];
        parts.push({ id: `part-${index}`, shape, name: partName, ...(colour ? { colorRgba: colour } : {}) });
    });
    const products = groupsOf(recipe, groupBy, isBuilt);
    const nodes: Models.OCCT.AssemblyNodeDef[] = [{ id: TOP_ID, type: "assembly", name }, ...groupNodesOf(recipe, products)];
    products.forEach((roots, group) => {
        const first = recipe.roots[roots[0]!]!;
        const productName = nameOf(first.tag, roots[0]!);
        const product = `product-${group}`;
        const parentId = first.group === undefined ? TOP_ID : groupIdOf(first.group);
        nodes.push({ id: product, type: "assembly", name: productName, parentId, properties: propertiesOf(first.tag) });
        roots.forEach((root, piece) => {
            const instance = plan.instances[root]!;
            const colour = partColours[instance.part] ? undefined : colourOf(recipe.roots[root]!.tag);
            nodes.push({
                id: `root-${root}`, type: "instance", name: roots.length === 1 ? productName : `${productName} ${piece + 1}`,
                parentId: product, partId: `part-${instance.part}`,
                ...(isIdentity(instance.matrix) ? {} : { matrix: instance.matrix }),
                ...(colour ? { colorRgba: colour } : {}),
            });
        });
    });
    return { parts, nodes, clearDocument: false, lengthUnit: plan.lengthUnit };
}
