import { Base } from "../../inputs";

/**
 * Part definition for assembly structure.
 * Represents a shape that can be instanced multiple times.
 */
export interface AssemblyPartDef<T> {
    /** Unique identifier for referencing this part */
    id: string;
    /** The shape for this part */
    shape: T;
    /** Display name for the part */
    name: string;
    /** Optional color for the part */
    colorRgba?: Base.ColorRGBA;
}
