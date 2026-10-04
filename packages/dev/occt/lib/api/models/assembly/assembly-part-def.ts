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
    colorRgba?: Base.ColorRGBA | undefined;
    /**
     * Optional color for the edges of the part. Exports write it on the part when the part has a
     * color, and on each edge otherwise, so no reader takes it for the color of the faces.
     */
    edgeColorRgba?: Base.ColorRGBA | undefined;
    /**
     * Optional metalness of the part, from 0 to 1. With `roughness` and `emissiveRgb` it gives the
     * part a PBR material that glTF exports read; it needs `colorRgba`, and what it leaves out keeps
     * glTF's default.
     */
    metallic?: number | undefined;
    /** Optional roughness of the part, from 0 to 1, for its PBR material */
    roughness?: number | undefined;
    /** Optional light the part gives off, each channel from 0 to 1, as glTF's emissive factor */
    emissiveRgb?: Base.ColorRGB | undefined;
    /** Optional colors of some faces, by the indexes `shapes.face.getFaces` gives; a later entry wins */
    faceColors?: AssemblySubShapeColor[] | undefined;
    /** Optional colors of some edges, by the indexes `shapes.edge.getEdges` gives; a later entry wins */
    edgeColors?: AssemblySubShapeColor[] | undefined;
    /** Optional properties of the part, such as its part number, which the STEP export writes as user-defined properties of its product */
    properties?: Record<string, string | number | boolean> | undefined;
}

/**
 * The color of some faces or edges of an assembly part, by their indexes.
 */
export interface AssemblySubShapeColor {
    /** The indexes of the faces or edges, from 0 */
    indexes: number[];
    /** Their color */
    colorRgba: Base.ColorRGBA;
    /** Optional metalness of these faces, from 0 to 1; read for faces only, as are `roughness` and `emissiveRgb` */
    metallic?: number | undefined;
    /** Optional roughness of these faces, from 0 to 1 */
    roughness?: number | undefined;
    /** Optional light these faces give off, each channel from 0 to 1 */
    emissiveRgb?: Base.ColorRGB | undefined;
}
