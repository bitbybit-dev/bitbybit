import type { TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import type * as Models from "../../api/models";
import { DesignProblem, pointer } from "./problems";
import { connectorFrame, contextOf } from "./helpers";
import { connectorMembers } from "./connectors";
import { resolveEdges, resolveFaces } from "./references";
import * as Inputs from "../../api/inputs";
import { release } from "./cache";
import type { BodyState, DesignRun } from "./state";
import { bodyKey } from "./state";
import { declaredValues, numberOf, parametersIn, propertyValue, textOf } from "./values";
import { buildKeyOf, itemKeyOf, versionOf } from "./identity";
import { DIMENSIONS } from "./constants";

const COLOR = /^#[0-9a-fA-F]{6}$/;

const METRES_PER_UNIT: Record<NonNullable<Models.OCCT.DesignUnits["length"]>, number> = { mm: 0.001, cm: 0.01, m: 1, in: 0.0254 };

type Look = Pick<Models.OCCT.DesignAppearance, "color" | "metallic" | "roughness" | "opacity" | "emissive" | "emissiveStrength" | "edgeColor">;
type BuiltLook = Pick<Models.OCCT.DesignBuiltAppearance, "color" | "metallic" | "roughness" | "opacity" | "emissive" | "emissiveStrength" | "edgeColor">;

function attempt<T>(issues: Models.OCCT.DesignIssue[], run: () => T): T | undefined {
    try {
        return run();
    } catch (error) {
        if (error instanceof DesignProblem) {
            issues.push({ path: error.path, message: error.message });
            return undefined;
        }
        throw error;
    }
}

function propertiesOf(properties: Models.OCCT.DesignProperties | undefined, path: string, run: DesignRun, issues: Models.OCCT.DesignIssue[]): Record<string, string | number | boolean> {
    return Object.fromEntries(Object.entries(properties ?? {}).flatMap(([name, value]) => {
        const evaluated = attempt(issues, () => propertyValue(value, run.parameters, pointer(path, name)));
        return evaluated === undefined ? [] : [[name, evaluated] as const];
    }));
}

function colourOf(value: Models.OCCT.DesignText, path: string, run: DesignRun): string {
    const colour = textOf(value, run.parameters, path);
    if (!COLOR.test(colour)) {
        throw new DesignProblem(path, `a colour is #rrggbb, not ${JSON.stringify(colour)}`);
    }
    return colour;
}

function lookOf(look: Look, path: string, run: DesignRun): BuiltLook {
    const built: BuiltLook = {};
    for (const key of ["color", "edgeColor", "emissive"] as const) {
        const value = look[key];
        if (value !== undefined) {
            built[key] = colourOf(value, pointer(path, key), run);
        }
    }
    for (const key of ["metallic", "roughness", "opacity"] as const) {
        const value = look[key];
        if (value !== undefined) {
            const number = numberOf(value, run.parameters, pointer(path, key));
            if (number < 0 || number > 1) {
                throw new DesignProblem(pointer(path, key), `${key} is from 0 to 1, not ${number}`);
            }
            built[key] = number;
        }
    }
    if (look.emissiveStrength !== undefined) {
        const strength = numberOf(look.emissiveStrength, run.parameters, pointer(path, "emissiveStrength"));
        if (strength < 0) {
            throw new DesignProblem(pointer(path, "emissiveStrength"), `emissiveStrength is from 0, not ${strength}`);
        }
        built.emissiveStrength = strength;
    }
    return built;
}

function materialIdOf(value: Models.OCCT.DesignText, materials: readonly Models.OCCT.DesignMaterial[], path: string, run: DesignRun): string {
    const id = textOf(value, run.parameters, path);
    if (!materials.some(material => material.id === id)) {
        throw new DesignProblem(path, `${JSON.stringify(id)} is not a material of this document`);
    }
    return id;
}

function materialOf(materials: Models.OCCT.DesignMaterial[], id: string, run: DesignRun, issues: Models.OCCT.DesignIssue[]): Models.OCCT.DesignBuiltMaterial | undefined {
    const index = materials.findIndex(material => material.id === id);
    const material = materials[index]!;
    const path = pointer("/materials", index);
    const density = material.density === undefined ? undefined : attempt(issues, () => {
        const value = numberOf(material.density, run.parameters, pointer(path, "density"));
        if (value <= 0) {
            throw new DesignProblem(pointer(path, "density"), `a density is above 0, not ${value}`);
        }
        return value;
    });
    if (material.density !== undefined && density === undefined) {
        return undefined;
    }
    return {
        id,
        ...(material.name === undefined ? {} : { name: material.name }),
        ...(material.standard === undefined ? {} : { standard: material.standard }),
        ...(density === undefined ? {} : { density }),
        properties: propertiesOf(material.properties, pointer(path, "properties"), run, issues),
    };
}

function appearanceOf(part: Models.OCCT.DesignPart, partPath: string, material: Models.OCCT.DesignMaterial | undefined, materialPath: string, body: BodyState, run: DesignRun, issues: Models.OCCT.DesignIssue[]): Models.OCCT.DesignBuiltAppearance | undefined {
    if (part.appearance === undefined && material?.appearance === undefined) {
        return undefined;
    }
    const fromMaterial = material?.appearance === undefined ? {} : attempt(issues, () => lookOf(material.appearance!, pointer(materialPath, "appearance"), run)) ?? {};
    const fromPart = part.appearance === undefined ? {} : attempt(issues, () => lookOf(part.appearance!, pointer(partPath, "appearance"), run)) ?? {};
    const context = contextOf(body, run);
    const faces = (part.appearance?.faces ?? []).flatMap((entry, index) => {
        const entryPath = pointer(partPath, "appearance", "faces", index);
        const resolved = attempt(issues, () => ({
            indexes: resolveFaces(entry.faces, context, pointer(entryPath, "faces")),
            ...lookOf(entry, entryPath, run),
        }));
        return resolved === undefined ? [] : [resolved];
    });
    const edgeEntries = part.appearance?.edges;
    const edges = (edgeEntries ?? []).flatMap((entry, index) => {
        const entryPath = pointer(partPath, "appearance", "edges", index);
        const resolved = attempt(issues, () => ({
            indexes: resolveEdges(entry.edges, context, pointer(entryPath, "edges")),
            ...(entry.color === undefined ? {} : { color: colourOf(entry.color, pointer(entryPath, "color"), run) }),
        }));
        return resolved === undefined ? [] : [resolved];
    });
    return { ...fromMaterial, ...fromPart, faces, ...(edgeEntries === undefined ? {} : { edges }) };
}

function declaredParts(document: Models.OCCT.DesignPartDocument, run: DesignRun): Models.OCCT.DesignPart[] {
    return document.parts ?? run.order.filter(name => run.bodies.has(name)).map(name => ({ id: name, body: name }));
}

/**
 * The parts of a built document: each part's body with its evaluated properties, material and
 * appearance, its volume and, when its material has a density, its mass in kilograms. A part whose
 * body failed or was suppressed is left out, and why is added to `issues`, as is any property,
 * material value, face look or edge colour that could not be evaluated.
 */
export function buildParts(document: Models.OCCT.DesignPartDocument, run: DesignRun, issues: Models.OCCT.DesignIssue[]): Models.OCCT.DesignBuiltPart<TopoDS_Shape>[] {
    const materials = document.materials ?? [];
    const builtMaterials = new Map<string, Models.OCCT.DesignBuiltMaterial | undefined>();
    const metres = METRES_PER_UNIT[document.units?.length ?? "mm"];
    const version = versionOf(document);
    const builtPart = (part: Models.OCCT.DesignPart, index: number): Models.OCCT.DesignBuiltPart<TopoDS_Shape> | undefined => {
        const path = pointer("/parts", index);
        const body = run.bodies.get(part.body);
        if (body === undefined) {
            const reason = run.failed.get(bodyKey(part.body)) === "suppressed" ? "was suppressed" : "failed";
            issues.push({ path: pointer(path, "body"), message: `the body "${part.body}" ${reason}, so the part was not built` });
            return undefined;
        }
        const materialId = part.material === undefined ? undefined : attempt(issues, () => materialIdOf(part.material!, materials, pointer(path, "material"), run));
        const materialIndex = materials.findIndex(material => material.id === materialId);
        if (materialId !== undefined && !builtMaterials.has(materialId)) {
            builtMaterials.set(materialId, materialOf(materials, materialId, run, issues));
        }
        const material = materialId === undefined ? undefined : builtMaterials.get(materialId);
        const appearance = appearanceOf(part, path, materials[materialIndex], pointer("/materials", materialIndex), body, run, issues);
        const volume = volumeOf(body.shape, run);
        if (volume === undefined && material?.density !== undefined) {
            issues.push({ path: pointer(path, "body"), message: `the body "${part.body}" is not a solid, so the part has no volume or mass` });
        }
        const connectors = (part.connectors ?? []).flatMap((declared, connectorIndex): Models.OCCT.DesignBuiltConnector[] => connectorMembers(declared, document).flatMap(member => {
            const frame = attempt(issues, () => connectorFrame(member.connector, body, pointer(path, "connectors", connectorIndex), run));
            return frame === undefined ? [] : [{ id: member.id, frame }];
        }));
        const properties = propertiesOf(part.properties, pointer(path, "properties"), run, issues);
        const reads = new Set([...body.reads, ...parametersIn({ material: part.material, appearance: part.appearance, properties: part.properties, connectors: part.connectors, materialEntry: materials[materialIndex] }, run.parameters)]);
        const values = declaredValues(reads, run.parameters, run.derived);
        const itemKey = itemKeyOf(document.id, part.id, values);
        return {
            id: part.id,
            itemKey,
            buildKey: buildKeyOf(itemKey, version),
            parameters: values,
            name: part.name ?? part.id,
            body: part.body,
            shape: body.shape.clone(),
            shapeHash: body.hash,
            faceNames: body.names.map(list => [...list]),
            properties,
            connectors,
            ...(volume === undefined ? {} : { volume }),
            ...(material === undefined ? {} : { material }),
            ...(appearance === undefined ? {} : { appearance }),
            ...(material?.density === undefined || volume === undefined ? {} : { mass: volume * metres ** DIMENSIONS * material.density }),
        };
    };
    const built: Models.OCCT.DesignBuiltPart<TopoDS_Shape>[] = [];
    try {
        declaredParts(document, run).forEach((part, index) => {
            const made = builtPart(part, index);
            if (made !== undefined) {
                built.push(made);
            }
        });
    } catch (error) {
        built.forEach(part => release(part.shape));
        throw error;
    }
    return built;
}

const volumes = new WeakMap<TopoDS_Shape, number | null>();

function volumeOf(shape: TopoDS_Shape, run: DesignRun): number | undefined {
    let volume = volumes.get(shape);
    if (volume === undefined) {
        volume = isSolid(shape, run) ? run.occt.shapes.solid.getSolidVolume({ shape }) : null;
        volumes.set(shape, volume);
    }
    return volume ?? undefined;
}

function isSolid(shape: TopoDS_Shape, run: DesignRun): boolean {
    const type = run.occt.shapes.shape.getShapeType({ shape });
    if (type === Inputs.OCCT.shapeTypeEnum.solid || type === Inputs.OCCT.shapeTypeEnum.compSolid) {
        return true;
    }
    if (type !== Inputs.OCCT.shapeTypeEnum.compound) {
        return false;
    }
    const solids = run.occt.shapes.solid.getSolids({ shape });
    const solid = solids.length > 0;
    solids.forEach(release);
    return solid;
}
