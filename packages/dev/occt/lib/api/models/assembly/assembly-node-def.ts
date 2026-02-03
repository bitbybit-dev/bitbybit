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
    /** Rotation as [rx, ry, rz] in degrees (Euler ZYX order) */
    rotation?: Base.Vector3;
    /** Uniform scale factor (1.0 = no scale) */
    scale?: number;
    /** Optional color override for this instance */
    colorRgba?: Base.ColorRGBA;
}