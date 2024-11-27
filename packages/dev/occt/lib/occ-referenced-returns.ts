import { OpenCascadeInstance, TopoDS_Edge, TopoDS_Face } from "../bitbybit-dev-occt/bitbybit-dev-occt";

// This is patching a disconnect between types of OpenCascade.js and their actual implementation

// Check these discussions on opencascade.js github:
// https://github.com/donalffons/opencascade.js/issues/21
// https://github.com/donalffons/opencascade.js/issues/55

// You can also check this occt documentation page
// https://dev.opencascade.org/doc/refman/html/class_b_rep___tool.html

// &First and &Last get values assigned in constructor itself instead of returning those normally as some single object. This is quite messed up and not "pure", but it's C++ and it can be done and OCCT team did that :)
// Curve (const TopoDS_Edge &E, Standard_Real &First, Standard_Real &Last)

// Opencascade.js on the other hand generates types automatically, but they did implement solution to pass ReferencedReturn kind objects to get the values out of these methods

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Ref = any;

export interface ReferencedReturn<T> {
    current: T;
}

export class OCCReferencedReturns {

    constructor(
        public readonly occ: OpenCascadeInstance) {
    }

    BRep_Tool_Range_1(edge: TopoDS_Edge, p1: ReferencedReturn<number>, p2: ReferencedReturn<number>) {
        return this.occ.BRep_Tool.Range_1(edge, p1 as Ref, p2 as Ref);
    }

    BRep_Tool_Curve_2(edge: TopoDS_Edge, p1: ReferencedReturn<number>, p2: ReferencedReturn<number>) {
        return this.occ.BRep_Tool.Curve_2(edge, p1 as Ref, p2 as Ref);
    }

    BRepTools_UVBounds_1(face: TopoDS_Face, uMin: ReferencedReturn<number>, uMax: ReferencedReturn<number>, vMin: ReferencedReturn<number>, vMax: ReferencedReturn<number>) {
        return this.occ.BRepTools.UVBounds_1(face, uMin as Ref, uMax as Ref, vMin as Ref, vMax as Ref);
    }

}

