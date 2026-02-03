import { AssemblyHierarchyNode } from "./assembly-hierarchy-node";

/**
 * Result from getAssemblyHierarchy.
 * Provides complete assembly tree traversal with comprehensive node information.
 */
export interface AssemblyHierarchyResult {
    /** Schema version (currently "2.0") */
    version: string;
    /** Total number of nodes in the hierarchy */
    totalNodes: number;
    /** All nodes in the assembly, in depth-first order */
    nodes: AssemblyHierarchyNode[];
}