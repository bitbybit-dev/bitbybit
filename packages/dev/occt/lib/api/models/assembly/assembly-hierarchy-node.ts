import { Base } from "../../inputs";

/**
 * Node in the assembly hierarchy.
 */
export interface AssemblyHierarchyNode {
    /** Unique node ID (path-like) */
    id: string;
    /** Parent node ID (if not root) */
    parentId?: string;
    /** Depth in hierarchy (0 = root) */
    depth: number;
    /** Label entry string */
    label: string;
    /** Node name */
    name: string;
    /** Whether this is an assembly container */
    isAssembly: boolean;
    /** Whether this is an instance */
    isInstance: boolean;
    /** Definition ID (for instances - identifies shared geometry) */
    definitionId?: string;
    /** Whether node is visible */
    visible: boolean;
    /** Color if set */
    colorRgba?: Base.ColorRGBA;
    /** Local transform (4x4 matrix, column-major) */
    transform?: Base.TransformMatrix;
}
