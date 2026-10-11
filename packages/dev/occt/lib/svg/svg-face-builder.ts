import type { BitbybitOcctModule, TopoDS_Face, TopoDS_Shape, TopoDS_Wire } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import type { OccHelper } from "../occ-helper";
import type * as Inputs from "../api/inputs";
import { deleteQuietly } from "./path-builder";

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
            const centroids = samples.map((pts, i) => this.centroidXY(pts, areas[i]!));
            const sign = areas.map((a) => (a >= 0 ? 1 : -1));
            const ccw = wires.map((w, i) => (sign[i]! < 0 ? track(this.och.wiresService.reversedWire({ shape: w })) : w));
            const classFaces = ccw.map((w) => track(this.och.facesService.createFaceFromWire({ shape: w, planar: true })));

            const faces = rule === "perSubpath"
                ? this.buildPerSubpath(ccw)
                : this.buildNested(ccw, centroids, areas, sign, classFaces, rule);

            if (faces.length === 0) {
                warnings.push("Could not build SVG faces for an element; returning its outline wires.");
                return { shape: this.och.converterService.makeCompound({ shapes: wires }), isFace: false };
            }
            if (faces.length === 1) { return { shape: faces[0]!, isFace: true }; }

            const compound = this.och.converterService.makeCompound({ shapes: faces });
            faces.forEach((f) => deleteQuietly(f));
            return { shape: compound, isFace: true };
        } catch (e) {
            warnings.push(`SVG face building failed for an element (${(e as Error)?.message ?? e}); returning its outline wires.`);
            return { shape: this.och.converterService.makeCompound({ shapes: wires }), isFace: false };
        } finally {
            created.forEach((s) => deleteQuietly(s));
        }
    }

    private buildPerSubpath(ccw: TopoDS_Wire[]): TopoDS_Face[] {
        const faces: TopoDS_Face[] = [];
        for (const w of ccw) {
            faces.push(...this.faceOrNone(() => this.och.facesService.createFaceFromWire({ shape: w, planar: true })));
        }
        return faces;
    }

    private faceOrNone(build: () => TopoDS_Face): TopoDS_Face[] {
        try {
            return [build()];
        } catch {
            return [];
        }
    }

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
                if (j !== i && Math.abs(areas[j]!) > Math.abs(areas[i]!) && this.isInside(classFaces[j]!, centroids[i]!)) {
                    enclosing.push(j);
                }
            }
            ancestors.push(enclosing);
        }
        const depth = ancestors.map((a) => a.length);
        const parent = ancestors.map((a) => a.reduce((best, j) => (best === -1 || depth[j]! > depth[best]! ? j : best), -1));

        const filled = (i: number): boolean => {
            if (rule === "evenOdd") { return depth[i]! % 2 === 0; }
            const winding = sign[i]! + ancestors[i]!.reduce((sum, j) => sum + sign[j]!, 0);
            return winding !== 0;
        };

        const faces: TopoDS_Face[] = [];
        for (let i = 0; i < n; i++) {
            if (!filled(i)) { continue; }
            if (parent[i] !== -1 && filled(parent[i]!)) { continue; }
            const holeWires: TopoDS_Wire[] = [];
            const createdHoles: TopoDS_Wire[] = [];
            for (let j = 0; j < n; j++) {
                if (parent[j] === i && !filled(j)) {
                    const holeCw = this.och.wiresService.reversedWire({ shape: ccw[j]! });
                    createdHoles.push(holeCw);
                    holeWires.push(holeCw);
                }
            }
            faces.push(...this.faceOrNone(() => holeWires.length > 0
                ? this.och.facesService.createFaceFromWires({ shapes: [ccw[i]!, ...holeWires], planar: true })
                : this.och.facesService.createFaceFromWire({ shape: ccw[i]!, planar: true })));
            createdHoles.forEach((w) => deleteQuietly(w));
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

    private signedAreaXY(pts: Inputs.Base.Point3[]): number {
        let area = 0;
        for (let i = 0; i < pts.length; i++) {
            const a = pts[i]!;
            const b = pts[(i + 1) % pts.length]!;
            area += a[0] * b[1] - b[0] * a[1];
        }
        return area / 2;
    }

    private centroidXY(pts: Inputs.Base.Point3[], area: number): Inputs.Base.Point3 {
        const z = pts.length > 0 ? pts[0]![2] : 0;
        if (Math.abs(area) < 1e-12 || pts.length === 0) {
            const mean = pts.reduce((acc, p) => [acc[0]! + p[0], acc[1]! + p[1]], [0, 0]);
            const k = Math.max(pts.length, 1);
            return [mean[0]! / k, mean[1]! / k, z];
        }
        let cx = 0;
        let cy = 0;
        for (let i = 0; i < pts.length; i++) {
            const a = pts[i]!;
            const b = pts[(i + 1) % pts.length]!;
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
