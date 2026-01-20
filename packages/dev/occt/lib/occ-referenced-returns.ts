import { BitbybitOcctModule, TopoDS_Edge, TopoDS_Face, Handle_Geom_Curve, EdgeCurveResult } from "../bitbybit-dev-occt/bitbybit-dev-occt";

// TODO - refactor so that this layer would not be needed anymore
// This module provides compatibility between the old opencascade.js API patterns
// and the new BitbybitOcct helper function patterns.

// The old opencascade.js API used reference parameters for output values,
// while the new API uses helper functions that return result structures.

export interface ReferencedReturn<T> {
    current: T;
}

export class OCCReferencedReturns {

    constructor(
        public readonly occ: BitbybitOcctModule) {
    }

    /**
     * Get edge parameter bounds using the new BRep_Tool_GetEdgeParameters helper.
     * This replaces the old BRep_Tool.Range_1 pattern.
     */
    BRep_Tool_Range_1(edge: TopoDS_Edge, p1: ReferencedReturn<number>, p2: ReferencedReturn<number>): void {
        const result: EdgeCurveResult = this.occ.BRep_Tool_GetEdgeParameters(edge);
        if (result.IsValid) {
            p1.current = result.First;
            p2.current = result.Last;
        }
    }

    /**
     * Get edge curve using the new GetEdgeCurve helper.
     * This replaces the old BRep_Tool.Curve_2 pattern.
     */
    BRep_Tool_Curve_2(edge: TopoDS_Edge, p1: ReferencedReturn<number>, p2: ReferencedReturn<number>): Handle_Geom_Curve | null {
        const result: EdgeCurveResult = this.occ.BRep_Tool_GetEdgeParameters(edge);
        if (result.IsValid) {
            p1.current = result.First;
            p2.current = result.Last;
            // Use the GetEdgeCurve helper to get the actual curve
            return this.occ.GetEdgeCurve(edge);
        }
        return null;
    }

    /**
     * Get face UV bounds using the new GetFaceUVBounds helper.
     * This replaces the old BRepTools.UVBounds_1 pattern.
     */
    BRepTools_UVBounds_1(face: TopoDS_Face, uMin: ReferencedReturn<number>, uMax: ReferencedReturn<number>, vMin: ReferencedReturn<number>, vMax: ReferencedReturn<number>): void {
        const result = this.occ.GetFaceUVBounds(face);
        if (result.IsValid) {
            uMin.current = result.UMin;
            uMax.current = result.UMax;
            vMin.current = result.VMin;
            vMax.current = result.VMax;
        }
    }

}

