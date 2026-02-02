import { Base } from "../../inputs";

/**
 * Part/assembly definition info returned from getDocumentParts.
 * This returns the original definitions (prototypes), not instances.
 */
export interface DocumentPartInfo {
    /** Label entry string (e.g., "0:1:1:2") */
    label: string;
    /** Part/assembly name */
    name: string;
    /** Type: "part", "assembly", "sub-assembly", "compound", or "unknown" */
    type: string;
    /** Whether this is a free (root-level) shape */
    isFree: boolean;
    /** Color if set */
    color?: Base.ColorRGBA;
    /** Number of instances that reference this part/assembly */
    instanceCount: number;
}
