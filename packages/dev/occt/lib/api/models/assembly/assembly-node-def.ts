import { Base } from "../../inputs";
/**
 * Node definition for assembly structure.
 * Can be either an assembly (container) or an instance (reference to a part).
 */
export interface AssemblyNodeDef {
    /** Unique identifier for this node */
    id: string;
    /** Node type: 'assembly' for containers, 'instance' for part references */
    type: "assembly" | "instance";
    /** Display name for this node */
    name: string;
    /** Parent node ID (undefined = root level) */
    parentId?: string;
    /** Part ID to instance (required for type='instance') */
    partId?: string;
    /** Translation as [x, y, z] */
    translation?: Base.Point3;
    /** Rotation as [rx, ry, rz] Euler angles in degrees (applied Rx * Ry * Rz) */
    rotation?: Base.Vector3;
    /** Uniform scale factor (1.0 = no scale) */
    scale?: number;
    /**
     * Optional placement matrix (column-major, 16 numbers) or an ordered list of
     * matrices applied first-to-last. When set, it fully defines the node's placement
     * and takes precedence over translation/rotation/scale.
     */
    matrix?: Base.TransformMatrix | Base.TransformMatrixes;
    /** Optional color override for this instance */
    colorRgba?: Base.ColorRGBA;
}