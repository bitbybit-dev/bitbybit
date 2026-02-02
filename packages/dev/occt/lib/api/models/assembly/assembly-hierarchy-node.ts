import { Base } from "../../inputs";

/**
 * Sub-shape counts for compounds and assemblies.
 */
export interface SubShapeCounts {
    /** Number of solid shapes */
    solids: number;
    /** Number of shell shapes */
    shells: number;
    /** Number of face shapes */
    faces: number;
    /** Number of wire shapes */
    wires: number;
    /** Number of edge shapes */
    edges: number;
}

/**
 * Node in the assembly hierarchy.
 * Provides comprehensive information about each element in the assembly tree.
 */
export interface AssemblyHierarchyNode {
    /** Unique node ID (same as label entry) */
    id: string;
    /** Parent node ID (if not root) */
    parentId?: string;
    /** Depth in hierarchy (0 = root) */
    depth: number;
    /** Label entry string (e.g., "0:1:1:1") */
    label: string;
    /** Node name */
    name: string;
    
    // Core type flags (matching original interface)
    /** Whether this label IS an assembly container (not just references one) */
    isAssembly: boolean;
    /** Whether this is an instance (reference to a part/assembly) */
    isInstance: boolean;
    /** Definition ID (for instances - the label of the referenced part/assembly) */
    definitionId?: string;
    
    // For instances: what type does this instance reference?
    /** True if this instance references an assembly (only present for instances) */
    refersToAssembly?: boolean;
    /** True if this instance references a part (only present for instances) */
    refersToPart?: boolean;
    
    // Extended type information
    /** 
     * Detailed node type:
     * - "assembly": An assembly container
     * - "instance-part": An instance referencing a part
     * - "instance-assembly": An instance referencing an assembly
     * - "instance": An instance (type unknown)
     * - "part": An original part definition (not an instance)
     * - "subshape": A sub-shape of another shape
     * - "compound": A compound shape
     * - "unknown": Unknown type
     */
    nodeType: string;
    /** 
     * Whether this IS an original part definition (not an instance).
     * An instance is never a part - use refersToPart to check what an instance references.
     */
    isPart: boolean;
    /** Whether this is a sub-shape of another shape */
    isSubShape: boolean;
    /** Whether this is a free (root-level) shape */
    isFreeShape: boolean;
    /** Whether this is a compound shape */
    isCompound: boolean;
    
    // Geometry information
    /** Whether this node has associated geometry */
    hasGeometry: boolean;
    /** Shape type if has geometry: "solid", "compound", "shell", "face", "wire", "edge", "vertex", "shape", "none" */
    shapeType?: string;
    /** Sub-shape counts (for compounds and assemblies) */
    subShapeCounts?: SubShapeCounts;
    
    // Display properties
    /** Whether node is visible */
    visible: boolean;
    /** Color if set (RGBA, values 0-1) */
    colorRgba?: Base.ColorRGBA;
    /** Local transform (4x4 matrix, column-major) */
    transform?: Base.TransformMatrix;
}
