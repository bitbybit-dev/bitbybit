import { AssemblyPartDef }  from "./assembly-part-def";
import { AssemblyNodeDef }  from "./assembly-node-def";
import { AssemblyPartUpdateDef } from "./assembly-part-update-def";
import { AssemblyLoadedPartDef } from "./assembly-loaded-part-def";

/**
 * Complete assembly structure definition.
 * Contains all parts and nodes that make up the assembly.
 * 
 * When updating an existing document:
 * - `removals` specifies labels to remove (parts, instances, or subassemblies)
 * - `partUpdates` specifies updates to existing parts (shape, name, color)
 * - `parts` and `nodes` specify new elements to add
 * 
 * Processing order:
 * 1. Removals are applied first
 * 2. Part updates are applied second
 * 3. New parts and nodes are added last
 */
export interface AssemblyStructureDef<T> {
    /** All part definitions (shapes that can be instanced) */
    parts: AssemblyPartDef<T>[];
    /** All nodes (assemblies and instances) */
    nodes: AssemblyNodeDef[];
    /** 
     * Labels to remove from existing document.
     * Can be part labels, instance labels, or assembly labels.
     * Ignored when creating a new document.
     */
    removals?: string[];
    /**
     * Updates to apply to existing parts in the document.
     * Each update can change the shape, name, and/or color of a part.
     * Ignored when creating a new document.
     */
    partUpdates?: AssemblyPartUpdateDef<T>[];
    /**
     * Parts imported from other documents (typically STEP-loaded).
     * Each entry copies a label tree from a source document into this document,
     * preserving sub-assembly hierarchy, names and colors. The copied root then
     * behaves as a regular part: instance nodes can reference it by `partId` and
     * place it multiple times with different transforms.
     */
    loadedParts?: AssemblyLoadedPartDef[];
    /**
     * Whether to clear the existing document before adding new content.
     * Only relevant when an existingDocument is provided.
     * 
     * - `true`: Clear all existing shapes, then add new parts/nodes (full rebuild)
     * - `false`: Keep existing shapes, apply removals/updates, add new parts/nodes (incremental)
     * 
     * @default false
     */
    clearDocument: boolean;
}
