import { Base } from "../../inputs/base-inputs";

export class VectorCharData {
    constructor(width?: number, height?: number, paths?: Base.Point3[][]) {
        if (width !== undefined) { this.width = width; }
        if (height !== undefined) { this.height = height; }
        if (paths !== undefined) { this.paths = paths; }
    }
    /**
     * The width of the char
     * @default undefined
     */
    width?: number;
    /**
     * The height of the char
     * @default undefined
     */
    height?: number;
    /**
     * The segments of the char
     * @default undefined
     */
    paths?: Base.Point3[][];
}