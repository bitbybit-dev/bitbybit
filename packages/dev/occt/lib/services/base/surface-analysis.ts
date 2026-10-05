import { InputError } from "@bitbybit-dev/base";
import { isTriple } from "@bitbybit-dev/base/lib/api/services/helpers/frame-axes";
import type { BitbybitOcctModule, TopoDS_Face, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../../api/inputs";
import type * as Models from "../../api/models";

/** The factor that turns the kernel's radians into the degrees the public API speaks. */
export const DEGREES_PER_RADIAN = 180 / Math.PI;

/** What the kernel's measurements name a sub-shape by, as the public kind of shape. */
export function supportType(name: string): Inputs.OCCT.shapeTypeEnum {
    switch (name) {
        case "vertex":
            return Inputs.OCCT.shapeTypeEnum.vertex;
        case "edge":
            return Inputs.OCCT.shapeTypeEnum.edge;
        case "face":
            return Inputs.OCCT.shapeTypeEnum.face;
        default:
            return Inputs.OCCT.shapeTypeEnum.unknown;
    }
}

/** A list of (u, v) pairs, each two finite numbers. */
export function checkedUVPairs(value: unknown, property: string): [number, number][] {
    if (!Array.isArray(value)) {
        throw new InputError(`\`${property}\` is not a list of U and V pairs.`, property);
    }
    const faulty = value.findIndex(pair => !(Array.isArray(pair) && pair.length === 2 && pair.every(item => typeof item === "number" && Number.isFinite(item))));
    if (faulty !== -1) {
        throw new InputError(`\`${property}\` holds something other than a U and V pair at position ${faulty}; each is two finite numbers.`, property);
    }
    return value as [number, number][];
}

/**
 * Rows of points for a grid: at least two rows of at least two points each, every row as long as
 * the first, every point three finite numbers.
 */
export function checkedPointGrid(value: unknown, property: string): Inputs.Base.Point3[][] {
    if (!Array.isArray(value) || !value.every(row => Array.isArray(row))) {
        throw new InputError(`\`${property}\` is not a list of rows of points.`, property);
    }
    const rows = value as unknown[][];
    if (rows.length < 2 || rows[0]!.length < 2) {
        throw new InputError(`\`${property}\` needs at least two rows of at least two points; it has ${rows.length} rows, the first of ${rows[0]?.length ?? 0} points.`, property);
    }
    const uneven = rows.findIndex(row => row.length !== rows[0]!.length);
    if (uneven !== -1) {
        throw new InputError(`\`${property}\` holds rows of different lengths: row ${uneven} has ${rows[uneven]!.length} points and row 0 has ${rows[0]!.length}.`, property);
    }
    rows.forEach((row, rowIndex) => {
        const faulty = row.findIndex(point => !isTriple(point));
        if (faulty !== -1) {
            throw new InputError(`\`${property}\` holds something other than a point in row ${rowIndex} at position ${faulty}; each is three finite numbers.`, property);
        }
    });
    return rows as Inputs.Base.Point3[][];
}

/** A face's UV bounds, the range of its surface's own u and v that it covers. */
export interface UVBounds {
    uMin: number;
    uMax: number;
    vMin: number;
    vMax: number;
}

/**
 * The face's own (u, v) as fractions of its UV bounds, the ones `shapes.face.pointOnUV` reads its
 * fractions against. On a periodic surface a value a whole number of periods outside the face's
 * range is brought into it first.
 */
export function uvFractions(occ: BitbybitOcctModule, face: TopoDS_Face, bounds: UVBounds): (u: number, v: number) => [number, number] {
    const handle = occ.BRep_Tool_Surface(face);
    const surface = handle.get();
    const uPeriod = surface !== null && surface.IsUPeriodic() ? surface.UPeriod() : 0;
    const vPeriod = surface !== null && surface.IsVPeriodic() ? surface.VPeriod() : 0;
    handle.delete();
    const fraction = (value: number, min: number, max: number, period: number): number => {
        let inRange = value;
        if (period > 0) {
            const slack = 1e-9 * Math.max(1, period);
            if (inRange < min - slack) {
                inRange += Math.ceil((min - slack - inRange) / period) * period;
            }
            if (inRange > max + slack) {
                inRange -= Math.ceil((inRange - max - slack) / period) * period;
            }
        }
        return max > min ? (inRange - min) / (max - min) : 0;
    };
    return (u, v) => [fraction(u, bounds.uMin, bounds.uMax, uPeriod), fraction(v, bounds.vMin, bounds.vMax, vPeriod)];
}

/**
 * A face's own (u, v) as fractions of its UV bounds, as `uvFractions` gives them. The face is read
 * through a copy typed as a face, so a face held as a general shape reads too.
 */
export function uvFractionsOn(occ: BitbybitOcctModule, face: TopoDS_Shape): (u: number, v: number) => [number, number] {
    const typed = occ.CastToFace(face);
    try {
        const bounds = occ.GetFaceUVBounds(typed);
        return uvFractions(occ, typed, { uMin: bounds.UMin, uMax: bounds.UMax, vMin: bounds.VMin, vMax: bounds.VMax });
    } finally {
        typed.delete();
    }
}

/**
 * Where a measurement found a point on a sub-shape of `shape`, as fractions: on a face its raw (u,
 * v) over the face's UV bounds, on an edge its raw parameter over the edge's range from its start to
 * its end as the edge runs, and 0, 0 on a vertex or on no sub-shape. Faces and edges are counted as
 * `shapes.face.getFaces` and `shapes.edge.getEdges` count them.
 */
export function fractionsOnSupport(occ: BitbybitOcctModule, shape: TopoDS_Shape, support: string, index: number, u: number, v: number): [number, number] {
    if (index < 0) {
        return [0, 0];
    }
    if (support === "face") {
        const face = occ.FaceAt(shape, false, index);
        const fractions = uvFractionsOn(occ, face)(u, v);
        face.delete();
        return fractions;
    }
    if (support === "edge") {
        const edge = occ.EdgeAt(shape, true, index);
        const range = occ.BRep_Tool_GetEdgeParameters(edge);
        const reversed = edge.Orientation() === occ.TopAbs_Orientation.REVERSED;
        edge.delete();
        return [(reversed ? range.Last - u : u - range.First) / (range.Last - range.First), 0];
    }
    return [0, 0];
}

/** A clash as the kernel reports it, copied into the public model. */
export function clashOf(found: { indexA: number; indexB: number; distance: number; volume: number; pointA: Inputs.Base.Point3; pointB: Inputs.Base.Point3 }): Models.OCCT.Clash {
    return { indexA: found.indexA, indexB: found.indexB, distance: found.distance, volume: found.volume, pointA: found.pointA, pointB: found.pointB };
}
