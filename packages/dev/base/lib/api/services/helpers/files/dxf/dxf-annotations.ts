import * as Inputs from "../../../../inputs";
import { InputError } from "../../../../kernel-calls";
import { angleWithinTurn } from "../../curves/conic-arcs";
import { scale2 } from "../../geometry/vectors";
import { hatchFamiliesOf } from "../drawing/drawing-hatch";
import { drawingLoopsOf } from "../drawing/drawing-loops";
import { textEndOf, textInked, textStartOf } from "../drawing/drawing-text";
import type { DrawingHatch, DrawingText } from "../drawing/drawing-types";
import { FULL_TURN_DEGREES } from "../drawing/drawing.constants";
import { isModern, openEntity } from "./dxf-entities";
import type { DxfEntityContext, DxfEntityStyle } from "./dxf-entities";
import { encodedText } from "./dxf-text";
import {
    DXF_CHARACTER_CODE_START, DXF_CODED_BACKSLASH, DXF_EXTRUSION_CODES, DXF_FIT_JUSTIFICATION, DXF_HATCH_NAMES, DXF_HATCH_NATIVE_ANGLE, DXF_HATCH_NATIVE_SPACING, DXF_OTHER_POINT_CODES,
    DXF_POINT_CODES, DXF_POLYLINE_BOUNDARY, DXF_TEXT_STYLE,
} from "./dxf.constants";

export const dxfTextValue = (value: string): string =>
    encodedText(value.replace(DXF_CHARACTER_CODE_START, DXF_CODED_BACKSLASH).replace(/\^/g, "^ ").replace(/%%/g, "%%%%%%"));

export const writeText = (context: DxfEntityContext, text: DrawingText, style: DxfEntityStyle): void => {
    if (!textInked(text)) {
        return;
    }
    openEntity(context, "TEXT", { ...style, lineType: undefined });
    const out = context.text;
    if (isModern(context)) {
        out.pair("100", "AcDbText");
    }
    out.point(DXF_POINT_CODES, textStartOf(text));
    out.real("40", text.height);
    out.pair("1", dxfTextValue(text.value));
    if (text.rotationDegrees !== 0) {
        out.real("50", angleWithinTurn(text.rotationDegrees, FULL_TURN_DEGREES));
    }
    if (text.widthFactor !== 1) {
        out.real("41", text.widthFactor);
    }
    out.pair("7", DXF_TEXT_STYLE);
    out.pair("72", DXF_FIT_JUSTIFICATION);
    out.point(DXF_OTHER_POINT_CODES, textEndOf(text));
    if (isModern(context)) {
        out.pair("100", "AcDbText");
        out.pair("73", "0");
    }
};

export const writeHatch = (context: DxfEntityContext, hatch: DrawingHatch, style: DxfEntityStyle, property: string): void => {
    if (!isModern(context)) {
        throw new InputError(`\`${property}\` holds a hatch, which an AC1009 (R12) file has no entity for: write AC1015.`, property);
    }
    const out = context.text;
    const loops = drawingLoopsOf(hatch.boundaries, context.curveTolerance, out.budget);
    out.refuseWhenSpent();
    if (loops.length === 0) {
        return;
    }
    const solid = hatch.pattern === Inputs.IO.hatchPatternEnum.solid;
    openEntity(context, "HATCH", { ...style, lineType: undefined });
    out.pair("100", "AcDbHatch");
    out.point(DXF_POINT_CODES, [0, 0, 0]);
    out.point(DXF_EXTRUSION_CODES, [0, 0, 1]);
    out.pair("2", DXF_HATCH_NAMES[hatch.pattern]!);
    out.pair("70", solid ? "1" : "0");
    out.pair("71", "0");
    out.pair("91", String(loops.length));
    for (const loop of loops) {
        const bulged = loop.bulges.some(bulge => bulge !== 0);
        out.pair("92", DXF_POLYLINE_BOUNDARY);
        out.pair("72", bulged ? "1" : "0");
        out.pair("73", "1");
        out.pair("93", String(loop.points.length));
        loop.points.forEach((point, at) => {
            out.real("10", point[0]);
            out.real("20", point[1]);
            if (bulged) {
                out.real("42", loop.bulges[at] ?? 0);
            }
        });
        out.pair("97", "0");
    }
    out.pair("75", "0");
    out.pair("76", "1");
    if (!solid) {
        const families = hatchFamiliesOf(hatch);
        out.real("52", angleWithinTurn(hatch.angle - DXF_HATCH_NATIVE_ANGLE, FULL_TURN_DEGREES));
        out.real("41", hatch.spacing / DXF_HATCH_NATIVE_SPACING[context.measurement][hatch.pattern]!);
        out.pair("77", "0");
        out.pair("78", String(families.length));
        for (const family of families) {
            const base = scale2(family.across, family.phase);
            const offset = scale2(family.across, hatch.spacing);
            out.real("53", angleWithinTurn(family.angle, FULL_TURN_DEGREES));
            out.real("43", base[0]);
            out.real("44", base[1]);
            out.real("45", offset[0]);
            out.real("46", offset[1]);
            out.pair("79", "0");
        }
    }
    out.pair("98", "1");
    out.real("10", loops[0]!.points[0]![0]);
    out.real("20", loops[0]!.points[0]![1]);
};
