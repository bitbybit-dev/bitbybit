
/**
 * Color info returned from getLabelColor.
 */
export interface LabelColorInfo {
    /** Whether color is set on this label */
    hasColor: boolean;
    /** Red component (0-1) */
    r: number;
    /** Green component (0-1) */
    g: number;
    /** Blue component (0-1) */
    b: number;
    /** Alpha component (0-1) */
    a: number;
}
