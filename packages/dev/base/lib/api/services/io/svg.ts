import * as Inputs from "../../inputs";
import type * as Resolved from "../../resolved-inputs";
import { InputError, resolveDto } from "../../kernel-calls";
import { checkedUnitOfLength } from "../helpers/geometry/lengths";
import { drawingPartsOf, drawingPathOf, positiveNumber } from "../helpers/files/drawing/drawing-model";
import { readSvgDrawing } from "../helpers/files/svg/svg-reading";
import { pathDataOf, svgDocumentOf } from "../helpers/files/svg/svg-writer";

const marginOf = (value: number | undefined): number | undefined => {
    if (value === undefined) {
        return undefined;
    }
    if (!Number.isFinite(value) || value < 0) {
        throw new InputError("`margin` must be a finite number of 0 or more.", "margin");
    }
    return value;
};

/**
 * Writes SVG drawings from the same path parts DXF files are made of: lines, arcs, circles, bulged
 * polylines, splines and ellipses, kept exact wherever SVG can draw them, with texts drawn as the
 * strokes of their letters and hatches filled with patterns. Reads SVG files back into those parts,
 * by layer, color and line type.
 */
export class Svg {

    /**
     * Writes an SVG file from path parts, each layer an Inkscape layer.
     *
     * Arcs, circles, ellipses and bulges stay exact arcs, unweighted splines up to degree 3 exact
     * Beziers, others cubics within `tolerance`. Texts become letter strokes, hatches patterned
     * regions. Y points up, Z is dropped and `unit` gives the true size. A drawing too large to
     * write throws.
     * @param inputs - The path parts with their texts, hatches and line weights, the unit, the line width, the border, the dash scale and the curve tolerance
     * @returns The SVG file as text
     * @group svg
     * @shortname svg create
     * @drawable false
     * @example
     * ```typescript
     * const square = bitbybit.io.drawing.polylineSegment({ points: [[0, 0], [40, 0], [40, 30], [0, 30]], closed: true });
     * const hole = bitbybit.io.drawing.circleSegment({ center: [20, 15], radius: 6 });
     * const part = bitbybit.io.drawing.part({ layer: "cut", color: "#ff0000", paths: [{ segments: [square] }, { segments: [hole] }] });
     * const svg = bitbybit.io.svg.svgCreate({ parts: [part], unit: Bit.Inputs.Base.unitOfLengthEnum.millimetre });
     * ```
     */
    svgCreate(inputs: Inputs.IO.SvgModelDto): string {
        const resolved = resolveDto(Inputs.IO.SvgModelDto, inputs) as Resolved.IO.SvgModelDto;
        const tolerance = positiveNumber(resolved.tolerance, "tolerance");
        const unit = resolved.unit === undefined ? undefined : checkedUnitOfLength(resolved.unit, "unit");
        return svgDocumentOf(drawingPartsOf(resolved.parts, "parts"), {
            unit,
            strokeWidth: resolved.strokeWidth === undefined ? undefined : positiveNumber(resolved.strokeWidth, "strokeWidth"),
            margin: marginOf(resolved.margin),
            lineTypeScale: resolved.lineTypeScale === undefined ? undefined : positiveNumber(resolved.lineTypeScale, "lineTypeScale"),
            tolerance,
            property: "parts",
        });
    }

    /**
     * Writes one drawing path as SVG path data, the text of a `path` element's `d` attribute.
     *
     * Segments that meet are drawn as one stroke, reversed where a segment ends where the stroke is,
     * and a stroke that returns to its start is closed. Curves stay exact as in `svgCreate`, or with
     * `cubicsOnly` become cubic Beziers within `tolerance`.
     * @param inputs - The path, whether Y is negated, the curve tolerance and whether only cubics are written
     * @returns SVG path data
     * @group svg
     * @shortname path data
     * @drawable false
     * @example
     * ```typescript
     * const slot = bitbybit.io.drawing.polylineSegment({ points: [[0, 0], [30, 0], [30, 10], [0, 10]], closed: true, bulges: [0, 1, 0, 1] });
     * const data = bitbybit.io.svg.pathData({ path: { segments: [slot] }, flipY: false });
     * ```
     */
    pathData(inputs: Inputs.IO.SvgPathDataDto): string {
        const resolved = resolveDto(Inputs.IO.SvgPathDataDto, inputs) as Resolved.IO.SvgPathDataDto;
        const tolerance = positiveNumber(resolved.tolerance, "tolerance");
        return pathDataOf(drawingPathOf(resolved.path, "path"), { flipY: resolved.flipY, cubicsOnly: resolved.cubicsOnly, tolerance, property: "path" });
    }

    /**
     * Reads an SVG file into path parts by layer, color and line type.
     *
     * Lines, arcs and Bezier curves are read exactly, transforms applied, Y up. Inkscape
     * layers are layers, each stroke color (else fill) a color, each dash pattern a line type. Text
     * and images are left out, named in `warnings`; `svgCreate`'s texts and hatches return as paths.
     * @param inputs - The SVG text, the unit to read it in and whether hidden elements are read
     * @returns The drawing's parts, unit, view box and warnings
     * @group svg
     * @shortname svg read
     * @drawable false
     * @example
     * ```typescript
     * const drawing = bitbybit.io.svg.svgRead({ svg: svgText, unit: Bit.Inputs.Base.unitOfLengthEnum.millimetre });
     * const dxf = bitbybit.io.dxf.dxfCreate({ dxfPathsParts: drawing.parts, unit: drawing.unit });
     * ```
     */
    svgRead(inputs: Inputs.IO.SvgReadDto): Inputs.IO.SvgDrawingDto {
        const resolved = resolveDto(Inputs.IO.SvgReadDto, inputs) as Resolved.IO.SvgReadDto;
        if (typeof resolved.svg !== "string") {
            throw new InputError(`\`svg\` must be the text of an SVG file; it is ${typeof resolved.svg}.`, "svg");
        }
        if (resolved.unit !== undefined) {
            checkedUnitOfLength(resolved.unit, "unit");
        }
        return readSvgDrawing(resolved.svg, { unit: resolved.unit, includeInvisible: resolved.includeInvisible === true });
    }

}
