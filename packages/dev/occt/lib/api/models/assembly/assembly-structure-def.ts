import { AssemblyPartDef }  from "./assembly-part-def";
import { AssemblyNodeDef }  from "./assembly-node-def";

/**
 * Complete assembly structure definition.
 * Contains all parts and nodes that make up the assembly.
 */
export interface AssemblyStructureDef<T> {
    /** All part definitions (shapes that can be instanced) */
    parts: AssemblyPartDef<T>[];
    /** All nodes (assemblies and instances) */
    nodes: AssemblyNodeDef[];
}
