import { ORIGIN, transforms, type Occt, type Transform } from "./kernel";
import { materialSpec, rgba } from "./materials";
import { partOf, type DroneModel, type InstanceNode, type Part } from "./model";

export type Document = Awaited<ReturnType<Occt["assembly"]["manager"]["buildAssemblyDocument"]>>;

export interface BuiltDocument {
    document: Document;
    sources: Document[];
}

export interface BomRow {
    name: string;
    count: number;
}

export interface Bom {
    rows: BomRow[];
    parts: number;
    instances: number;
}

export const Z_UP: Transform = transforms.rotationCenterX({ center: ORIGIN, angle: 90 });

type Manager = Occt["assembly"]["manager"];
type PartDef = Awaited<ReturnType<Manager["createPart"]>>;
type NodeDef = Awaited<ReturnType<Manager["createInstanceNode"]>>;

async function partDefs(manager: Manager, model: DroneModel, ids: Set<string>): Promise<PartDef[]> {
    const defs: PartDef[] = [];
    for (const part of model.parts) {
        if (!ids.has(part.id)) continue;
        defs.push(await manager.createPart({ id: part.id, shape: part.shape, name: part.name, colorRgba: rgba(materialSpec(part.material, model.params.finish).colour) }));
    }
    return defs;
}

async function instanceDef(manager: Manager, model: DroneModel, node: InstanceNode): Promise<NodeDef> {
    if (node.material) {
        const colorRgba = rgba(materialSpec(node.material, model.params.finish).colour);
        return manager.createInstanceNode({ id: node.id, partId: node.partId, name: node.name, parentId: node.parentId, matrix: node.placement, colorRgba });
    }
    return manager.createInstanceNode({ id: node.id, partId: node.partId, name: node.name, parentId: node.parentId, matrix: node.placement });
}

export async function buildDocument(occt: Occt, model: DroneModel, frame?: Transform): Promise<BuiltDocument> {
    const manager = occt.assembly.manager;
    const definitions = model.nodes.filter((node) => node.kind === "definition");
    const sources: Document[] = [];
    const imported = [];
    for (const [index, definition] of definitions.entries()) {
        const children = model.nodes.filter((node): node is InstanceNode => node.kind === "instance" && node.parentId === definition.id);
        const parts = await partDefs(manager, model, new Set(children.map((child) => child.partId)));
        const nodes = [await manager.createAssemblyNode({ id: definition.id, name: definition.name })];
        for (const child of children) nodes.push(await instanceDef(manager, model, child));
        sources.push(await manager.buildAssemblyDocument({ structure: await manager.combineStructure({ parts, nodes, clearDocument: false }) }));
        imported.push(await manager.createImportedPart({ id: definition.id, sourceDocumentIndex: index, name: definition.name }));
    }
    const definitionIds = new Set(definitions.map((definition) => definition.id));
    const topLevel = model.nodes.filter((node): node is InstanceNode => node.kind === "instance" && !definitionIds.has(node.parentId));
    const parts = await partDefs(manager, model, new Set(topLevel.map((node) => node.partId)));
    const nodes = [await manager.createAssemblyNode({ id: "drone", name: "Drone" })];
    for (const node of model.nodes) {
        if (node.kind === "module") {
            const matrix = frame ? [...node.placement, ...frame] : node.placement;
            nodes.push(await manager.createAssemblyNode({ id: node.id, name: node.name, parentId: node.parentId ?? "drone", matrix }));
        } else if (node.kind === "reference") {
            nodes.push(await manager.createInstanceNode({ id: node.id, partId: node.definitionId, name: node.name, parentId: node.parentId, matrix: node.placement }));
        } else if (node.kind === "instance" && !definitionIds.has(node.parentId)) {
            nodes.push(await instanceDef(manager, model, node));
        }
    }
    const structure = await manager.combineStructure({ parts, nodes, loadedParts: imported, clearDocument: false });
    const document = await manager.buildAssemblyDocument({ structure, sourceDocuments: sources });
    return { document, sources };
}

export async function billOfMaterials(occt: Occt, document: Document): Promise<Bom> {
    const tree = await occt.assembly.query.getAssemblyHierarchy({ document });
    const counts = new Map<string, number>();
    for (const node of tree.nodes) {
        if (node.nodeType !== "instance-part") continue;
        const name = node.definitionName ?? node.name;
        counts.set(name, (counts.get(name) ?? 0) + 1);
    }
    const rows = [...counts.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
    return { rows, parts: rows.length, instances: rows.reduce((sum, row) => sum + row.count, 0) };
}

export function expectedPlacements(model: DroneModel): { instances: number; solidsOf: (solids: (part: Part) => number) => number } {
    const references = new Map<string, number>();
    for (const node of model.nodes) if (node.kind === "reference") references.set(node.definitionId, (references.get(node.definitionId) ?? 0) + 1);
    const definitionIds = new Set(model.nodes.filter((node) => node.kind === "definition").map((node) => node.id));
    const placed = model.nodes.filter((node): node is InstanceNode => node.kind === "instance").map((node) => ({ node, times: definitionIds.has(node.parentId) ? references.get(node.parentId) ?? 0 : 1 }));
    return {
        instances: placed.reduce((sum, entry) => sum + entry.times, 0),
        solidsOf: (solids) => placed.reduce((sum, entry) => sum + entry.times * solids(partOf(model.parts, entry.node.partId)), 0),
    };
}
