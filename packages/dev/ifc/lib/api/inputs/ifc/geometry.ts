/**
 * A model and the elements to describe for `geometry.recipe` and `geometry.unsupported`.
 */
export class GeometryDto<T> {
    constructor(model?: T, elements?: string[]) {
        if (model !== undefined) { this.model = model; }
        if (elements !== undefined) { this.elements = elements; }
    }
    /**
     * The model whose elements are described.
     * @default undefined
     */
    model!: T;
    /**
     * The elements to describe, each by GlobalId or by the id it was added with. Leave it out for
     * every element with a body.
     * @default undefined
     * @optional true
     */
    elements?: string[] | undefined;
}
/**
 * An element `geometry.recipe` had to leave out, as `geometry.unsupported` lists it.
 */
export class GeometryProblemDto {
    /**
     * The GlobalId of the element left out.
     * @default ""
     */
    globalId = "";
    /**
     * Its IFC type, such as `IfcWall`.
     * @default ""
     */
    type = "";
    /**
     * What could not be described, in a sentence.
     * @default ""
     */
    message = "";
}
