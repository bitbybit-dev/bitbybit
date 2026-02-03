import { AssemblyNodeJson } from "./assembly-node-json";
/**
 * Result from native STEP assembly parsing.
 * Includes hierarchy and instance/definition tracking.
 */
export interface AssemblyJsonResult {
    /** Version string (1.1 = with hierarchy & instances) */
    version: string;
    /** Array of assembly nodes in depth-first traversal order */
    nodes: AssemblyNodeJson[];
    /** Error message (if parsing failed) */
    error?: string;
}
