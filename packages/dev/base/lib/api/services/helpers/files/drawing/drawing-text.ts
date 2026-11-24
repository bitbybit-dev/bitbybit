import type * as Inputs from "../../../../inputs";
import { simplex } from "../../../../models/simplex";
import { add2, rotated2 } from "../../geometry/vectors";
import { strokeFontInk, strokeGlyph, strokeTextStrokes } from "../../text/stroke-font";
import type { DrawingText } from "./drawing-types";
import { ANCHOR_SHARES } from "./drawing.constants";

type Point3 = Inputs.Base.Point3;

const placed = (text: DrawingText, along: number, up: number): Point3 => {
    const at = add2([text.position[0], text.position[1]], rotated2([along - text.width * ANCHOR_SHARES[text.anchor], up], text.rotation));
    return [at[0], at[1], text.position[2]];
};

export const textInked = (text: DrawingText): boolean => {
    for (let unit = 0; unit < text.value.length; unit += 1) {
        if (strokeGlyph(simplex, text.value.charCodeAt(unit)).strokes.some(stroke => stroke.length > 0)) {
            return true;
        }
    }
    return false;
};

export const textStartOf = (text: DrawingText): Point3 => placed(text, 0, 0);

export const textEndOf = (text: DrawingText): Point3 => placed(text, text.width, 0);

export const textCornersOf = (text: DrawingText): Point3[] => {
    const ink = strokeFontInk(simplex);
    const low = ink.lowest * text.height;
    const high = ink.highest * text.height;
    return [placed(text, 0, low), placed(text, text.width, low), placed(text, text.width, high), placed(text, 0, high)];
};

export const textStrokesOf = (text: DrawingText): Point3[][] =>
    strokeTextStrokes(simplex, text.value).map(stroke => stroke.map(point => placed(text, point[0] * text.height * text.widthFactor, point[1] * text.height)));
