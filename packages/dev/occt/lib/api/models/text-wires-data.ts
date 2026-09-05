import { Base } from "../inputs";
import { TextWiresCharShapePart } from "./text-wires-char-shape-part";

/**
 * The wire outlines of a whole text run, character by character, along with the layout that
 * positions them. The intermediate stage between a string and 3D text geometry, exposed so you can
 * intervene - offsetting the outlines, or using them flat rather than extruded.
 */
export class TextWiresDataDto<T> {
    type = "text";
    name = "text";
    compound?: T | undefined;
    characters?: TextWiresCharShapePart<T>[] | undefined;
    width: number;
    height: number;
    center: Base.Point3;
}
