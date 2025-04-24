
import { VectorCharData } from "./vector-char-data";

export class VectorTextData {
    constructor(width?: number, height?: number, chars?: VectorCharData[]) {
        if (width !== undefined) { this.width = width; }
        if (height !== undefined) { this.height = height; }
        if (chars !== undefined) { this.chars = chars; }
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
    chars?: VectorCharData[];
}