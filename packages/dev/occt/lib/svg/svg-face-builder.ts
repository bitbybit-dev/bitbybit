/**
 * Turns the closed outline wires of one filled SVG element into face(s).
 *
 * SVG fill is region-based, not "largest wire = outer, rest = holes": an element's
 * path can contain several disjoint filled regions, holes, and even solids nested
 * inside holes (depth > 1). Which regions are solid is decided by a fill-rule
 * (`nonzero` / `evenodd`), and SVG does NOT constrain the winding direction of the
 * subpaths - so we cannot trust the source orientation.
 *
 * This builder therefore classifies the wires by containment (nesting depth) and
 * builds one face per solid region, adding that region's immediate non-solid
 * children as holes with explicitly forced opposite winding (outer CCW, holes CW),
 * which is what OCCT needs to cut a hole. It runs entirely on the planar (XY, z
 * constant) wires that come back from the path builder, before any 3D placement.
 */

import { BitbybitOcctModule, TopoDS_Face, TopoDS_Shape, TopoDS_Wire } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../occ-helper";
import * as Inputs from "../api/inputs";

/** Concrete rule resolved from the public strategy (auto is resolved per element earlier). */
export type SvgFaceRule = "nonzero" | "evenOdd" | "perSubpath";

export interface FacedElement {
    shape: TopoDS_Shape;
    isFace: boolean;
}

const SAMPLES_PER_WIRE = 64;
const CLASSIFY_TOLERANCE = 1e-6;

export class SvgFaceBuilder {
    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly och: OccHelper
    ) { }

    /**
     * Build face(s) from one element's closed wires. Returns a single face, a compound of faces, or
     * (on failure) a compound of the original wires. Never deletes the input `wires`.
     */
    build(wires: TopoDS_Wire[], rule: SvgFaceRule, warnings: string[]): FacedElement {
        if (wires.length === 0) { return { shape: this.och.converterService.makeCompound({ shapes: [] }), isFace: false }; }

        const created: TopoDS_Shape[] = [];
        const track = <T extends TopoDS_Shape>(shape: T): T => { created.push(shape); return shape; };

        try {
            const samples = wires.map((w) => this.sample(w));
            const areas = samples.map((pts) => this.signedAreaXY(pts));
            const centroids = samples.map((pts, i) => this.centroidXY(pts, areas[i]));
            const sign = areas.map((a) => (a >= 0 ? 1 : -1));
            // CCW version of each wire (positive area) - used both for inside-tests and as face outers.
            const ccw = wires.map((w, i) => (sign[i] < 0 ? track(this.och.wiresService.reversedWire({ shape: w })) : w));
            const classFaces = ccw.map((w) => track(this.och.facesService.createFaceFromWire({ shape: w, planar: true })));

            const faces = rule === "perSubpath"
                ? this.buildPerSubpath(ccw)
                : this.buildNested(ccw, centroids, areas, sign, classFaces, rule);

            if (faces.length === 0) {
                warnings.push("Could not build SVG faces for an element; returning its outline wires.");
                return { shape: this.och.converterService.makeCompound({ shapes: wires }), isFace: false };
            }
            if (faces.length === 1) { return { shape: faces[0], isFace: true }; }

            const compound = this.och.converterService.makeCompound({ shapes: faces });
            faces.forEach((f) => { try { f.delete(); } catch { /* shared into compound */ } });
            return { shape: compound, isFace: true };
        } catch (e) {
            warnings.push(`SVG face building failed for an element (${(e as Error)?.message ?? e}); returning its outline wires.`);
            return { shape: this.och.converterService.makeCompound({ shapes: wires }), isFace: false };
        } finally {
            created.forEach((s) => { try { s.delete(); } catch { /* noop */ } });
        }
    }

    /** Each closed wire becomes its own independent face (no hole detection). */
    private buildPerSubpath(ccw: TopoDS_Wire[]): TopoDS_Face[] {
        const faces: TopoDS_Face[] = [];
        for (const w of ccw) {
            try { faces.push(this.och.facesService.createFaceFromWire({ shape: w, planar: true })); } catch { /* skip */ }
        }
        return faces;
    }

    /**
     * Containment-based reconstruction shared by nonzero and even-odd: classify each wire's nesting
     * depth, decide which regions are solid, and emit a face per solid region with its immediate
     * non-solid children as holes (forced to CW so OCCT subtracts them).
     */
    private buildNested(
        ccw: TopoDS_Wire[],
        centroids: Inputs.Base.Point3[],
        areas: number[],
        sign: number[],
        classFaces: TopoDS_Face[],
        rule: SvgFaceRule
    ): TopoDS_Face[] {
        const n = ccw.length;
        const ancestors: number[][] = [];
        for (let i = 0; i < n; i++) {
            const enclosing: number[] = [];
            for (let j = 0; j < n; j++) {
                // A wire can only be contained by a strictly larger one - the area guard also
                // disambiguates concentric wires whose centroids coincide.
                if (j !== i && Math.abs(areas[j]) > Math.abs(areas[i]) && this.isInside(classFaces[j], centroids[i])) {
                    enclosing.push(j);
                }
            }
            ancestors.push(enclosing);
        }
        const depth = ancestors.map((a) => a.length);
        const parent = ancestors.map((a) => a.reduce((best, j) => (best === -1 || depth[j] > depth[best] ? j : best), -1));

        const filled = (i: number): boolean => {
            if (rule === "evenOdd") { return depth[i] % 2 === 0; }
            const winding = sign[i] + ancestors[i].reduce((sum, j) => sum + sign[j], 0);
            return winding !== 0;
        };

        const faces: TopoDS_Face[] = [];
        for (let i = 0; i < n; i++) {
            if (!filled(i)) { continue; }
            if (parent[i] !== -1 && filled(parent[i])) { continue; } // interior of solid material, not a boundary
            const holeWires: TopoDS_Wire[] = [];
            const createdHoles: TopoDS_Wire[] = [];
            for (let j = 0; j < n; j++) {
                if (parent[j] === i && !filled(j)) {
                    const holeCw = this.och.wiresService.reversedWire({ shape: ccw[j] });
                    createdHoles.push(holeCw);
                    holeWires.push(holeCw);
                }
            }
            try {
                const face = holeWires.length > 0
                    ? this.och.facesService.createFaceFromWires({ shapes: [ccw[i], ...holeWires], planar: true })
                    : this.och.facesService.createFaceFromWire({ shape: ccw[i], planar: true });
                faces.push(face);
            } catch { /* skip this region */ }
            createdHoles.forEach((w) => { try { w.delete(); } catch { /* noop */ } });
        }
        return faces;
    }

    private sample(wire: TopoDS_Wire): Inputs.Base.Point3[] {
        return this.och.wiresService.divideWireByEqualDistanceToPoints({
            shape: wire,
            nrOfDivisions: SAMPLES_PER_WIRE,
            removeStartPoint: false,
            removeEndPoint: true,
        });
    }

    /** Shoelace signed area in the XY plane; sign encodes the wire's winding. */
    private signedAreaXY(pts: Inputs.Base.Point3[]): number {
        let area = 0;
        for (let i = 0; i < pts.length; i++) {
            const a = pts[i];
            const b = pts[(i + 1) % pts.length];
            area += a[0] * b[1] - b[0] * a[1];
        }
        return area / 2;
    }

    /** Polygon centroid in XY (strictly interior for simple loops); falls back to the mean. */
    private centroidXY(pts: Inputs.Base.Point3[], area: number): Inputs.Base.Point3 {
        const z = pts.length > 0 ? pts[0][2] : 0;
        if (Math.abs(area) < 1e-12 || pts.length === 0) {
            const mean = pts.reduce((acc, p) => [acc[0] + p[0], acc[1] + p[1]], [0, 0]);
            const k = Math.max(pts.length, 1);
            return [mean[0] / k, mean[1] / k, z];
        }
        let cx = 0;
        let cy = 0;
        for (let i = 0; i < pts.length; i++) {
            const a = pts[i];
            const b = pts[(i + 1) % pts.length];
            const cross = a[0] * b[1] - b[0] * a[1];
            cx += (a[0] + b[0]) * cross;
            cy += (a[1] + b[1]) * cross;
        }
        return [cx / (6 * area), cy / (6 * area), z];
    }

    private isInside(face: TopoDS_Face, point: Inputs.Base.Point3): boolean {
        const gpPnt = new this.occ.gp_Pnt(point[0], point[1], point[2]);
        try {
            const classifier = new this.occ.BRepClass_FaceClassifier(face, gpPnt, CLASSIFY_TOLERANCE);
            const inside = classifier.State().value === this.occ.TopAbs_State.IN.value;
            classifier.delete();
            return inside;
        } finally {
            gpPnt.delete();
        }
    }
}
