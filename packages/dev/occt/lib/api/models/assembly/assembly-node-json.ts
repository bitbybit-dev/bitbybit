import { Base } from "../../inputs";

/**
 * Assembly node from native JSON parsing.
 * Contains id, name, assembly flag, visibility, optional color and transform.
 * Includes hierarchy information (parentId, depth) and instance/definition tracking.
 */
export interface AssemblyNodeJson {
    /** Unique path identifier (e.g., "/0:1:1:1/0:1:1:2") */
    id: string;
    /** Parent node ID for hierarchy reconstruction (undefined for root nodes) */
    parentId?: string;
    /** Depth in the assembly hierarchy (0 = root) */
    depth: number;
    /** Part/assembly name */
    name: string;
    /** True if this is an assembly (has children), false if leaf part */
    isAssembly: boolean;
    /** True if this node is an instance referencing a definition */
    isInstance: boolean;
    /** 
     * Definition ID that this instance refers to (only set if isInstance is true).
     * Multiple instances with the same definitionId share the same geometry.
     */
    definitionId?: string;
    /** Visibility flag */
    visible: boolean;
    /** Surface color (if set) */
    colorRgba?: Base.ColorRGBA;
    /** 4x4 transformation matrix in column-major order (if not identity) */
    transform?: Base.TransformMatrix;
}
