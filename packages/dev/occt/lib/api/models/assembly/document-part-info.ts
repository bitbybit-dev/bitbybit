
/**
 * Part info returned from getDocumentParts.
 */
export interface DocumentPartInfo {
    /** Label entry string (e.g., "0:1:1:1") */
    label: string;
    /** Part/assembly name */
    name: string;
    /** Type: "part", "assembly", or "instance" */
    type: string;
}
