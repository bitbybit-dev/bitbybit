/**
 * The wires of a single character in a text run: the outlines that bound its filled regions,
 * ready to be turned into faces or extruded.
 */
export class TextWiresCharShapePart<T> {
    id?: string;
    shapes?: {
        compound?: T,
    };
}
