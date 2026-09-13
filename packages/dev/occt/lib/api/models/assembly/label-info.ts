
/**
 * Detailed label info.
 */
export interface LabelInfo {
    /** Label entry string */
    label: string;
    /** Name attribute */
    name: string;
    /** Type: "part", "assembly", "instance", or "unknown" */
    type: string;
    /** Whether it's a simple shape (not compound/assembly) */
    isSimpleShape: boolean;
    /** Whether it's an assembly */
    isAssembly: boolean;
    /** Whether it's a reference/instance */
    isReference: boolean;
    /** Whether it's a component in an assembly */
    isComponent: boolean;
    /** Whether it's a compound */
    isCompound: boolean;
    /** Whether it's a sub-shape of another shape */
    isSubShape: boolean;
    /** Whether it's a free shape (top-level) */
    isFreeShape: boolean;
    /** Reference label (for instances - the label of the placed part or assembly) */
    refLabel?: string | undefined;
    /** Name of the placed part or assembly (for instances, empty if it has none) */
    refName?: string | undefined;
    /** Child labels (for assemblies) */
    children?: string[] | undefined;
    /** Shape type (vertex, edge, wire, face, shell, solid, compound, etc.) */
    shapeType?: string | undefined;
}