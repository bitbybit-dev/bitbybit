import { Base } from "../../inputs";

/**
 * Definition for updating an existing part in a document.
 * Allows changing the shape, name, and/or color of a part identified by its label.
 */
export interface AssemblyPartUpdateDef<T> {
    /** 
     * Label of the existing part to update.
     * This should be a label string like "0:1:1:1" obtained from document queries.
     */
    label: string;
    /** 
     * New shape to replace the existing shape.
     * If undefined, the shape is not changed.
     */
    shape?: T;
    /** 
     * New name for the part.
     * If undefined, the name is not changed.
     */
    name?: string;
    /** 
     * New color for the part.
     * If undefined, the color is not changed.
     */
    colorRgba?: Base.ColorRGBA;
}
