import { AssemblyHierarchyNode } from "./assembly-hierarchy-node";

/**
 * Result from getAssemblyHierarchy.
 */
export interface AssemblyHierarchyResult {
    /** Schema version */
    version: string;
    /** All nodes in the assembly */
    nodes: AssemblyHierarchyNode[];
}