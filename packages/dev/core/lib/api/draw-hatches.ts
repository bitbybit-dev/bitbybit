import { InputError } from "@bitbybit-dev/base";
import { clippedHatchLinesOf, hatchOutlinesOf } from "@bitbybit-dev/base/lib/api/services/helpers/files/drawing/drawing-hatch";
import { drawingHatchOf } from "@bitbybit-dev/base/lib/api/services/helpers/files/drawing/drawing-model";
import { pointToWorld, squareFrame } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/frame-axes";
import type { FrameAxes } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/frame-axes";
import { filledLoopTriangles } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/loop-fill";
import * as Inputs from "./inputs";
import type * as Models from "./models";
import type { HatchesDrawing } from "./draw-hatches-types";

const EVEN_ODD = "evenOdd";
const LIFT_SHARE = 1e-3;
const LINES_LIFTED = 2;
const POINT_SIZE = 3;

interface GrowingTriangles {
    positions: number[];
    indices: number[];
}

const axesOf = (frame: Inputs.Base.Frame): FrameAxes => {
    const axes = squareFrame(frame.origin, frame.normal, frame.direction);
    if (typeof axes === "string") {
        throw new InputError(`\`frame\` is not a frame: its \`${axes}\` ${axes === "normal" ? "has no length" : "runs along its normal or has no length"}.`, "frame");
    }
    return axes;
};

const sizeOf = (outlines: readonly (readonly Inputs.Base.Point2[])[]): number => {
    let left = Infinity;
    let right = -Infinity;
    let bottom = Infinity;
    let top = -Infinity;
    for (const outline of outlines) {
        for (const [x, y] of outline) {
            left = Math.min(left, x);
            right = Math.max(right, x);
            bottom = Math.min(bottom, y);
            top = Math.max(top, y);
        }
    }
    return Number.isFinite(left) ? Math.max(right - left, top - bottom) : 0;
};

const filledInto = (into: GrowingTriangles, outlines: readonly Inputs.Base.Point3[][]): void => {
    const offset = into.positions.length / POINT_SIZE;
    const corners: number[] = [];
    let next = 0;
    const loops = outlines.map(outline => outline.map(() => next++));
    for (const outline of outlines) {
        for (const [x, y, z] of outline) {
            corners.push(x, y, z);
        }
    }
    const triangles = filledLoopTriangles(corners, loops, EVEN_ODD);
    if (triangles.length === 0) {
        return;
    }
    for (const coordinate of corners) {
        into.positions.push(coordinate);
    }
    for (const corner of triangles) {
        into.indices.push(offset + corner);
    }
};

/**
 * What a renderer draws of hatched regions lying in a frame's plane: each region filled, its
 * outlines, and its pattern lines clipped to it, all in 3D. The hatches are read in the frame's
 * coordinates, its direction along X and the normal crossed with the direction along Y, as
 * `occt.operations.hatchedSectionByFrame` gives them. The fills are lifted a thousandth of the
 * regions' size along the normal and the lines and outlines twice that, so they show over a cut face
 * lying in the plane and the lines over their fill.
 * @param hatches - The hatches, each with its boundaries in the frame's coordinates
 * @param frame - The frame whose plane the hatches lie in
 * @param tolerance - How far an outline may stray from a curved boundary, in model units
 * @returns The fills, the pattern lines and the outlines
 * @throws InputError when a hatch is not one or the frame is not a frame
 * @beta
 */
export function hatchesDrawingOf(hatches: readonly Inputs.IO.DrawingHatchDto[], frame: Inputs.Base.Frame, tolerance: number): HatchesDrawing {
    const axes = axesOf(frame);
    const checked = hatches.map((hatch, at) => drawingHatchOf(hatch, `hatches[${at}]`));
    const outlines = checked.map(hatch => hatchOutlinesOf(hatch, tolerance));
    const lift = sizeOf(outlines.flat()) * LIFT_SHARE;
    const placed = (point: Inputs.Base.Point2, height: number): Inputs.Base.Point3 => pointToWorld(axes, [point[0], point[1], height]);
    const faces: GrowingTriangles = { positions: [], indices: [] };
    const ink: GrowingTriangles = { positions: [], indices: [] };
    const lines: Inputs.Base.Point3[][] = [];
    const drawnOutlines: Inputs.Base.Point3[][] = [];
    checked.forEach((hatch, at) => {
        const loops = outlines[at]!;
        if (loops.length === 0) {
            return;
        }
        filledInto(hatch.pattern === Inputs.IO.hatchPatternEnum.solid ? ink : faces, loops.map(loop => loop.map(point => placed(point, lift))));
        for (const loop of loops) {
            drawnOutlines.push([...loop, loop[0]!].map(point => placed(point, LINES_LIFTED * lift)));
        }
        for (const [start, end] of clippedHatchLinesOf(hatch, tolerance, `hatches[${at}].spacing`)) {
            lines.push([placed(start, LINES_LIFTED * lift), placed(end, LINES_LIFTED * lift)]);
        }
    });
    return { faces, ink, lines, outlines: drawnOutlines };
}

/**
 * What a renderer draws of `occt.operations.hatchedSectionByFrame`'s result: every cut face's hatch,
 * as `hatchesDrawingOf` lays it out in the section's frame.
 * @param section - The hatched section
 * @param tolerance - How far an outline may stray from a curved cut edge, in model units
 * @returns The fills, the pattern lines and the outlines
 * @beta
 */
export function hatchedSectionDrawingOf<T>(section: Models.OCCT.HatchedSection<T>, tolerance: number): HatchesDrawing {
    return hatchesDrawingOf(section.shapes.flatMap(cut => cut.caps.map(cap => cap.hatch)), section.frame, tolerance);
}
