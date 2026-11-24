import * as Inputs from "../../inputs";
import { DxfGenerator } from "../helpers/files/dxf/dxf-generator";
import type * as Resolved from "../../resolved-inputs";
import { resolveDto } from "../../kernel-calls";
import { readDxfDrawing } from "../helpers/files/dxf/dxf-reader";
import { dxfTextOf } from "../helpers/files/dxf/dxf-file-text";
import { drawingDtoOf } from "../helpers/files/dxf/dxf-reader-dtos";

/**
 * Writes a drawing as a DXF file and reads a DXF file back into one. The drawing itself is built with
 * `io.drawing`; the builders here are its former DXF-named copies.
 */
export class Dxf {

    private readonly dxfGenerator = new DxfGenerator();

    /**
     * Makes a straight segment for a drawing, under its former DXF name.
     * @param inputs - The line segment definition
     * @returns The line segment
     * @group dxf
     * @shortname line segment
     * @drawable false
     * @deprecated Use `io.drawing.lineSegment`, the same builder under the drawing's own name; this one is
     * removed in the next major version.
     */
    lineSegment(inputs: Inputs.IO.DxfLineSegmentDto): Inputs.IO.DxfLineSegmentDto {
        return inputs;
    }

    /**
     * Makes a circular arc for a drawing, under its former DXF name.
     * @param inputs - The arc segment definition
     * @returns The arc segment
     * @group dxf
     * @shortname arc segment
     * @drawable false
     * @deprecated Use `io.drawing.arcSegment`, the same builder under the drawing's own name; this one is
     * removed in the next major version.
     */
    arcSegment(inputs: Inputs.IO.DxfArcSegmentDto): Inputs.IO.DxfArcSegmentDto {
        return inputs;
    }

    /**
     * Makes a whole circle for a drawing, under its former DXF name.
     * @param inputs - The circle segment definition
     * @returns The circle segment
     * @group dxf
     * @shortname circle segment
     * @drawable false
     * @deprecated Use `io.drawing.circleSegment`, the same builder under the drawing's own name; this one is
     * removed in the next major version.
     */
    circleSegment(inputs: Inputs.IO.DxfCircleSegmentDto): Inputs.IO.DxfCircleSegmentDto {
        return inputs;
    }

    /**
     * Makes connected straight segments for a drawing, under its former DXF name.
     * @param inputs - The polyline segment definition
     * @returns The polyline segment
     * @group dxf
     * @shortname polyline segment
     * @drawable false
     * @deprecated Use `io.drawing.polylineSegment`, the same builder under the drawing's own name; this one is
     * removed in the next major version.
     */
    polylineSegment(inputs: Inputs.IO.DxfPolylineSegmentDto): Inputs.IO.DxfPolylineSegmentDto {
        const resolved = resolveDto(Inputs.IO.DxfPolylineSegmentDto, inputs) as Resolved.IO.DxfPolylineSegmentDto;
        return resolved;
    }

    /**
     * Makes a B-spline or NURBS curve for a drawing, under its former DXF name.
     * @param inputs - The spline segment definition
     * @returns The spline segment
     * @group dxf
     * @shortname spline segment
     * @drawable false
     * @deprecated Use `io.drawing.splineSegment`, the same builder under the drawing's own name; this one is
     * removed in the next major version.
     */
    splineSegment(inputs: Inputs.IO.DxfSplineSegmentDto): Inputs.IO.DxfSplineSegmentDto {
        const resolved = resolveDto(Inputs.IO.DxfSplineSegmentDto, inputs) as Resolved.IO.DxfSplineSegmentDto;
        return resolved;
    }

    /**
     * Makes an ellipse or an arc of one for a drawing, under its former DXF name.
     * @param inputs - The ellipse segment definition
     * @returns The ellipse segment
     * @group dxf
     * @shortname ellipse segment
     * @drawable false
     * @deprecated Use `io.drawing.ellipseSegment`, the same builder under the drawing's own name; this one is
     * removed in the next major version.
     */
    ellipseSegment(inputs: Inputs.IO.DxfEllipseSegmentDto): Inputs.IO.DxfEllipseSegmentDto {
        const resolved = resolveDto(Inputs.IO.DxfEllipseSegmentDto, inputs) as Resolved.IO.DxfEllipseSegmentDto;
        return resolved;
    }

    /**
     * Makes a path joined from segments for a drawing, under its former DXF name.
     * @param inputs - The path definition
     * @returns The path
     * @group dxf
     * @shortname path
     * @drawable false
     * @deprecated Use `io.drawing.path`, the same builder under the drawing's own name; this one is
     * removed in the next major version.
     */
    path(inputs: Inputs.IO.DxfPathDto): Inputs.IO.DxfPathDto {
        return inputs;
    }

    /**
     * Makes a part of a drawing on one layer for a drawing, under its former DXF name.
     * @param inputs - The paths part definition
     * @returns The paths part
     * @group dxf
     * @shortname paths part
     * @drawable false
     * @deprecated Use `io.drawing.part`, the same builder under the drawing's own name; this one is
     * removed in the next major version.
     */
    pathsPart(inputs: Inputs.IO.DxfPathsPartDto): Inputs.IO.DxfPathsPartDto {
        const resolved = resolveDto(Inputs.IO.DxfPathsPartDto, inputs) as Resolved.IO.DxfPathsPartDto;
        return resolved;
    }

    /**
     * Writes a DXF file from path parts, each on its layer with its color and line type.
     *
     * `AC1015` keeps every curve exact. `AC1009` (R12) writes splines and ellipses as polylines
     * within `curveTolerance`, never finer than a millionth of the drawing. Points off one Z make a
     * 3D polyline; a drawing too large to write throws.
     * @param inputs DXF model definition
     * @returns DXF file content as string
     * @group dxf
     * @shortname dxf create
     * @drawable false
     * @example
     * ```typescript
     * const outline = bitbybit.io.drawing.polylineSegment({ points: [[0, 0], [40, 0], [40, 30], [0, 30]], closed: true });
     * const hole = bitbybit.io.drawing.circleSegment({ center: [20, 15], radius: 6 });
     * const part = bitbybit.io.drawing.part({ layer: "cut", color: "#ff0000", paths: [{ segments: [outline] }, { segments: [hole] }] });
     * const dxf = bitbybit.io.dxf.dxfCreate({ dxfPathsParts: [part], unit: Bit.Inputs.Base.unitOfLengthEnum.millimetre });
     * ```
     */
    dxfCreate(inputs: Inputs.IO.DxfModelDto): string {
        const resolved = resolveDto(Inputs.IO.DxfModelDto, inputs) as Resolved.IO.DxfModelDto;
        return this.dxfGenerator.generateDxf(resolved);
    }

    /**
     * Reads a DXF file into path parts by layer, color and line type, the model `dxfCreate` writes.
     *
     * Lines, arcs, circles, ellipses, polylines and splines are read exactly, block inserts
     * expanded, with single-line texts and hatches. Multi-line text and dimensions are named in
     * `warnings`; `occt.io.loadDxf` reads splines given only by fit points.
     * @param inputs - The DXF file, as text or bytes, and whether hidden layers are read
     * @returns The drawing's parts, unit, version and warnings
     * @group dxf
     * @shortname dxf read
     * @drawable false
     * @example
     * ```typescript
     * const drawing = bitbybit.io.dxf.dxfRead({ dxf: dxfText });
     * const svg = bitbybit.io.svg.svgCreate({ parts: drawing.parts, unit: drawing.unit });
     * ```
     */
    dxfRead(inputs: Inputs.IO.DxfReadDto): Inputs.IO.DxfDrawingDto {
        const resolved = resolveDto(Inputs.IO.DxfReadDto, inputs) as Resolved.IO.DxfReadDto;
        return drawingDtoOf(readDxfDrawing(dxfTextOf(resolved.dxf, "dxf"), resolved.includeHiddenLayers, true));
    }

}