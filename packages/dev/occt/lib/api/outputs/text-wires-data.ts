import { Base } from "../inputs";
import { TextWiresCharShapePart } from "./text-wires-char-shape-part";

export class TextWiresDataDto<T> {
    type = "text";
    name = "text";
    compound?: T;
    characters?: TextWiresCharShapePart<T>[];
    width: number;
    height: number;
    center: Base.Point3;
}
