import type { Base } from "@bitbybit-dev/base";
import { knotDomain, nurbsCurvePoint } from "@bitbybit-dev/base/lib/api/services/helpers/curves/nurbs";
import { WORLD_AXES, pointToWorld, vectorToWorld, type FrameAxes } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/frame-axes";
import { cross3, length3, subtract3 } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/vectors";
import { axisPlacementFrame, directionOf, pointOf } from "../build/placement";
import type { ModelSnapshot } from "../model/snapshot";
import type { IfcValue } from "../step/step-types";
import { isList, isReference } from "../step/values";
import { faceBounds } from "./advanced";
import type { CurveSampler } from "./curves";
import { dividedByWeights } from "./edges";
import { UnsupportedGeometryError } from "./errors";
import type { BrepEdgeEnds, BSplineCurve } from "./geometry-types";
import type { RecipeBuilder } from "./recipe-builder";
import { referencesIn } from "./references";
import { parametricSurface } from "./surfaces";
import { WEIGHTED_POINTS_RATIO } from "./edges.constants";
import { POINT_SIZE } from "./exact-brep.constants";

const CURVE_ON_SURFACE: ReadonlySet<string> = new Set(["IfcSurfaceCurve", "IfcIntersectionCurve", "IfcSeamCurve"]);
const SPLINE_CURVES: ReadonlySet<string> = new Set(["IfcBSplineCurveWithKnots", "IfcRationalBSplineCurveWithKnots"]);
const SPLINE_SURFACES: ReadonlySet<string> = new Set(["IfcBSplineSurfaceWithKnots", "IfcRationalBSplineSurfaceWithKnots"]);
const BREPS_WITH_VOIDS: ReadonlySet<string> = new Set(["IfcAdvancedBrepWithVoids"]);
const OUTER_BOUND = "IfcFaceOuterBound";
const FACE_SURFACE = "IfcFaceSurface";
const TRIMMED_CURVE = "IfcTrimmedCurve";
const EDGE_LOOP = "IfcEdgeLoop";
const EDGE_CURVE = "IfcEdgeCurve";
const Z_AXIS: Base.Vector3 = [0, 0, 1];
const X_AXIS: Base.Vector3 = [1, 0, 0];

function finiteList(value: IfcValue): value is number[] {
    return isList(value) && value.every((item) => typeof item === "number" && Number.isFinite(item));
}

function distinctKnots(knots: readonly number[], multiplicities: readonly number[]): [number[], number[]] {
    const distinct: number[] = [];
    const counts: number[] = [];
    knots.forEach((knot, at) => {
        if (distinct.length && distinct[distinct.length - 1] === knot) {
            counts[counts.length - 1]! += multiplicities[at]!;
        } else {
            distinct.push(knot);
            counts.push(multiplicities[at]!);
        }
    });
    return [distinct, counts];
}

class BrepDescription {
    private readonly numbers: number[] = [];
    private readonly ranges: Base.RecipeRange[] = [];
    private readonly vertexCoordinates: number[] = [];
    private readonly vertexOf = new Map<number, number>();
    private readonly curveOf = new Map<string, number>();
    private readonly surfaceOf = new Map<string, number>();
    private readonly edgeOf = new Map<number, number>();
    private readonly curves: Base.RecipeBrepCurve[] = [];
    private readonly surfaces: Base.RecipeBrepSurface[] = [];
    private readonly edges: Base.RecipeBrepEdge[] = [];
    private readonly faces: Base.RecipeBrepFace[] = [];
    private readonly solids: Base.RecipeBrepSolid[] = [];
    private readonly dividedSurfaces = new Map<number, boolean>();

    constructor(private readonly model: ModelSnapshot, private readonly sampler: CurveSampler) { }

    of(items: readonly number[], builder: RecipeBuilder): Omit<Base.RecipeBrepNode, "fallback"> {
        for (const item of items) {
            this.item(item);
        }
        const vertexCount = this.vertexCoordinates.length;
        const [start] = builder.numbers(this.vertexCoordinates.concat(this.numbers));
        for (const range of this.ranges) {
            range[0] += start + vertexCount;
        }
        return { op: "brep", vertices: [start, vertexCount], curves: this.curves, surfaces: this.surfaces, edges: this.edges, faces: this.faces, closed: true, solids: this.solids };
    }

    private item(item: number): void {
        const type = this.model.typeOf(item) ?? "";
        const outer = this.model.attribute(item, "Outer");
        if (!isReference(outer)) {
            throw new UnsupportedGeometryError(`#${item} has no outer shell`);
        }
        const voids = BREPS_WITH_VOIDS.has(type) ? this.model.attribute(item, "Voids") : null;
        const shells = [outer, ...(isList(voids) ? voids : []).filter(isReference)].map((shell) => referencesIn(this.model, shell.ref, "CfsFaces").map((face) => this.faces.push(this.face(face)) - 1));
        const [outerFaces, ...voidFaces] = shells;
        this.solids.push(voidFaces.length ? { outer: outerFaces!, voids: voidFaces } : { outer: outerFaces! });
    }

    private range(values: readonly number[]): Base.RecipeRange {
        const range: Base.RecipeRange = [this.numbers.length, values.length];
        for (const value of values) {
            this.numbers.push(value);
        }
        this.ranges.push(range);
        return range;
    }

    private face(face: number): Base.RecipeBrepFace {
        const surface = this.model.schema.isSubtypeOf(this.model.typeOf(face) ?? "", FACE_SURFACE) ? this.model.attribute(face, "FaceSurface") : null;
        if (!isReference(surface)) {
            throw new UnsupportedGeometryError(`#${face} is not a face on a surface`);
        }
        const bounds = faceBounds(this.model, face).map((bound) => this.bound(bound));
        return { surface: this.surface(surface.ref, bounds), sameSense: this.model.attribute(face, "SameSense") !== false, bounds };
    }

    private bound(bound: number): Base.RecipeBrepBound {
        const loop = this.model.attribute(bound, "Bound");
        if (!isReference(loop) || this.model.typeOf(loop.ref) !== EDGE_LOOP) {
            throw new UnsupportedGeometryError(`#${bound} is not bounded by a loop of edges`);
        }
        const edges: number[] = [];
        const forward: boolean[] = [];
        for (const oriented of referencesIn(this.model, loop.ref, "EdgeList")) {
            const element = this.model.attribute(oriented, "EdgeElement");
            if (!isReference(element) || this.model.typeOf(element.ref) !== EDGE_CURVE) {
                throw new UnsupportedGeometryError(`#${oriented} is not an edge on a curve`);
            }
            edges.push(this.edge(element.ref));
            forward.push(this.model.attribute(oriented, "Orientation") !== false);
        }
        const outer = this.model.schema.isSubtypeOf(this.model.typeOf(bound) ?? "", OUTER_BOUND);
        if (this.model.attribute(bound, "Orientation") === false) {
            return { outer, edges: edges.reverse(), forward: forward.reverse().map((value) => !value) };
        }
        return { outer, edges, forward };
    }

    private vertex(value: IfcValue, edge: number): number {
        if (!isReference(value)) {
            throw new UnsupportedGeometryError(`#${edge} has a vertex missing`);
        }
        const known = this.vertexOf.get(value.ref);
        if (known !== undefined) {
            return known;
        }
        const point = this.model.attribute(value.ref, "VertexGeometry");
        if (!isReference(point)) {
            throw new UnsupportedGeometryError(`#${edge} has a vertex without a point`);
        }
        const index = this.vertexCoordinates.length / POINT_SIZE;
        this.vertexCoordinates.push(...pointOf(this.model, point));
        this.vertexOf.set(value.ref, index);
        return index;
    }

    private vertexPoint(index: number): Base.Point3 {
        const at = index * POINT_SIZE;
        return [this.vertexCoordinates[at]!, this.vertexCoordinates[at + 1]!, this.vertexCoordinates[at + 2]!];
    }

    private edge(edge: number): number {
        const known = this.edgeOf.get(edge);
        if (known !== undefined) {
            return known;
        }
        const start = this.vertex(this.model.attribute(edge, "EdgeStart"), edge);
        const end = this.vertex(this.model.attribute(edge, "EdgeEnd"), edge);
        const geometry = this.model.attribute(edge, "EdgeGeometry");
        if (!isReference(geometry)) {
            throw new UnsupportedGeometryError(`#${edge} has no curve`);
        }
        const curve = this.curve(geometry.ref, { start: this.vertexPoint(start), end: this.vertexPoint(end) }, WORLD_AXES, "");
        const sameSense = this.model.attribute(edge, "SameSense") !== false;
        const index = this.edges.push({ curve, start, end, ...(sameSense ? {} : { sameSense }) }) - 1;
        this.edgeOf.set(edge, index);
        return index;
    }

    private curve(curve: number, ends: BrepEdgeEnds | undefined, frame: FrameAxes, placedIn: string): number {
        const type = this.model.typeOf(curve) ?? "";
        if (CURVE_ON_SURFACE.has(type) || type === TRIMMED_CURVE) {
            const basis = this.model.attribute(curve, type === TRIMMED_CURVE ? "BasisCurve" : "Curve3D");
            if (!isReference(basis)) {
                throw new UnsupportedGeometryError(`#${curve} has no curve it lies on`);
            }
            return this.curve(basis.ref, ends, frame, placedIn);
        }
        const spline = SPLINE_CURVES.has(type) ? this.sampler.bspline(curve) : undefined;
        const divided = ends !== undefined && spline !== undefined && spline.weights !== undefined && this.meetsWhenDivided(spline, ends);
        const key = `${curve}${divided ? "/" : ""}${placedIn}`;
        const known = this.curveOf.get(key);
        if (known !== undefined) {
            return known;
        }
        const index = this.curves.push(this.curveDescription(curve, type, divided, frame)) - 1;
        this.curveOf.set(key, index);
        return index;
    }

    private meetsWhenDivided(spline: BSplineCurve, ends: BrepEdgeEnds): boolean {
        const reach = Math.max(1, length3(ends.start), length3(ends.end)) * WEIGHTED_POINTS_RATIO;
        const misses = (candidate: BSplineCurve): number => {
            const [from, to] = knotDomain(candidate.degree, candidate.knots);
            const [first, last] = [from, to].map((t) => nurbsCurvePoint(candidate.degree, candidate.points, candidate.weights, candidate.knots, t));
            return Math.min(length3(subtract3(first!, ends.start)) + length3(subtract3(last!, ends.end)), length3(subtract3(first!, ends.end)) + length3(subtract3(last!, ends.start)));
        };
        return misses(spline) > reach && misses(dividedByWeights(spline)) <= reach;
    }

    private curveDescription(curve: number, type: string, divided: boolean, frame: FrameAxes): Base.RecipeBrepCurve {
        switch (type) {
            case "IfcLine": {
                const vector = this.model.attribute(curve, "Dir");
                const orientation = isReference(vector) ? this.model.attribute(vector.ref, "Orientation") : null;
                return { kind: "line", origin: pointToWorld(frame, pointOf(this.model, this.model.attribute(curve, "Pnt"))), direction: vectorToWorld(frame, directionOf(this.model, orientation, X_AXIS)) };
            }
            case "IfcCircle":
            case "IfcEllipse": {
                const conic = this.sampler.conicFrame(curve);
                const origin = pointToWorld(frame, conic.origin);
                const x = vectorToWorld(frame, conic.x);
                const axis = cross3(x, vectorToWorld(frame, conic.y));
                return type === "IfcCircle"
                    ? { kind: "circle", origin, axis, xDirection: x, radius: conic.radii[0] }
                    : { kind: "ellipse", origin, axis, xDirection: x, xRadius: conic.radii[0], yRadius: conic.radii[1] };
            }
            case "IfcPolyline": {
                const points = referencesIn(this.model, curve, "Points").map((point) => pointToWorld(frame, pointOf(this.model, { ref: point })));
                if (points.length < 2) {
                    throw new UnsupportedGeometryError(`#${curve} has fewer than two points`);
                }
                const knots = points.map((_, at) => at);
                return { kind: "bspline", degree: 1, points: this.range(points.flat()), knots: this.range(knots), multiplicities: knots.map((_, at) => (at === 0 || at === knots.length - 1 ? 2 : 1)) };
            }
            default:
                if (SPLINE_CURVES.has(type)) {
                    return this.splineCurve(curve, divided, frame);
                }
                throw new UnsupportedGeometryError(`An edge on an ${type} is not described exactly yet`);
        }
    }

    private splineCurve(curve: number, divided: boolean, frame: FrameAxes): Base.RecipeBrepCurve {
        const raw = this.sampler.bspline(curve);
        const spline = divided ? dividedByWeights(raw) : raw;
        const knots = this.model.attribute(curve, "Knots");
        const multiplicities = this.model.attribute(curve, "KnotMultiplicities");
        if (!finiteList(knots) || !finiteList(multiplicities)) {
            throw new UnsupportedGeometryError(`#${curve} has no knots`);
        }
        const [distinct, counts] = distinctKnots(knots, multiplicities);
        return {
            kind: "bspline",
            degree: spline.degree,
            points: this.range(spline.points.flatMap((point) => pointToWorld(frame, point))),
            ...(spline.weights ? { weights: this.range(spline.weights) } : {}),
            knots: this.range(distinct),
            multiplicities: counts,
        };
    }

    private surface(surface: number, bounds: readonly Base.RecipeBrepBound[]): number {
        const type = this.model.typeOf(surface) ?? "";
        const divided = type === "IfcRationalBSplineSurfaceWithKnots" && this.dividedSurface(surface, bounds);
        const key = `${surface}${divided ? "/" : ""}`;
        const known = this.surfaceOf.get(key);
        if (known !== undefined) {
            return known;
        }
        const index = this.surfaces.push(this.surfaceDescription(surface, type, divided)) - 1;
        this.surfaceOf.set(key, index);
        return index;
    }

    private dividedSurface(surface: number, bounds: readonly Base.RecipeBrepBound[]): boolean {
        const known = this.dividedSurfaces.get(surface);
        if (known !== undefined) {
            return known;
        }
        const probes = bounds.flatMap((bound) => bound.edges.map((edge) => this.vertexPoint(this.edges[edge]!.start)));
        const missOf = (divided: boolean): number => {
            const parametric = parametricSurface(this.model, this.sampler, surface, divided);
            return parametric ? Math.max(...probes.map((point) => {
                const [u, v] = parametric.parameters(point, undefined);
                return length3(subtract3(parametric.point(u, v), point));
            })) : Infinity;
        };
        const asWritten = missOf(false);
        const divided = asWritten > Math.max(1, ...probes.map(length3)) * WEIGHTED_POINTS_RATIO && missOf(true) < asWritten;
        this.dividedSurfaces.set(surface, divided);
        return divided;
    }

    private placement(surface: number): Base.RecipeBrepPlacement {
        const position = this.model.attribute(surface, "Position");
        if (!isReference(position)) {
            return { origin: [0, 0, 0], axis: Z_AXIS, xDirection: X_AXIS };
        }
        const frame = axisPlacementFrame(this.model, position.ref);
        return { origin: frame.origin, axis: frame.z, xDirection: frame.x };
    }

    private positive(id: number, name: string): number {
        const value = this.model.attribute(id, name);
        if (typeof value !== "number" || !Number.isFinite(value) || !(value > 0)) {
            throw new UnsupportedGeometryError(`#${id} has no ${name} above zero`);
        }
        return value;
    }

    private surfaceDescription(surface: number, type: string, divided: boolean): Base.RecipeBrepSurface {
        switch (type) {
            case "IfcPlane":
                return { kind: "plane", ...this.placement(surface) };
            case "IfcCylindricalSurface":
                return { kind: "cylinder", ...this.placement(surface), radius: this.positive(surface, "Radius") };
            case "IfcSphericalSurface":
                return { kind: "sphere", ...this.placement(surface), radius: this.positive(surface, "Radius") };
            case "IfcToroidalSurface":
                return { kind: "torus", ...this.placement(surface), majorRadius: this.positive(surface, "MajorRadius"), minorRadius: this.positive(surface, "MinorRadius") };
            case "IfcSurfaceOfRevolution": {
                const axis = this.model.attribute(surface, "AxisPosition");
                if (!isReference(axis)) {
                    throw new UnsupportedGeometryError(`#${surface} has no axis`);
                }
                const frame = this.sweptFrame(surface);
                return {
                    kind: "revolution",
                    curve: this.sweptCurve(surface, frame),
                    origin: pointToWorld(frame, pointOf(this.model, this.model.attribute(axis.ref, "Location"))),
                    axis: vectorToWorld(frame, directionOf(this.model, this.model.attribute(axis.ref, "Axis"), Z_AXIS)),
                };
            }
            case "IfcSurfaceOfLinearExtrusion": {
                const frame = this.sweptFrame(surface);
                return { kind: "extrusion", curve: this.sweptCurve(surface, frame), direction: vectorToWorld(frame, directionOf(this.model, this.model.attribute(surface, "ExtrudedDirection"), Z_AXIS)) };
            }
            default:
                if (SPLINE_SURFACES.has(type)) {
                    return this.splineSurface(surface, divided);
                }
                throw new UnsupportedGeometryError(`A face on an ${type} is not described exactly yet`);
        }
    }

    private sweptFrame(surface: number): FrameAxes {
        const position = this.model.attribute(surface, "Position");
        return isReference(position) ? axisPlacementFrame(this.model, position.ref) : WORLD_AXES;
    }

    private sweptCurve(surface: number, frame: FrameAxes): number {
        const profile = this.model.attribute(surface, "SweptCurve");
        const curve = isReference(profile) ? this.model.attribute(profile.ref, "Curve") : null;
        if (!isReference(curve)) {
            throw new UnsupportedGeometryError(`#${surface} sweeps no curve`);
        }
        return this.curve(curve.ref, undefined, frame, `@${surface}`);
    }

    private splineSurface(surface: number, divided: boolean): Base.RecipeBrepSurface {
        const degree = (name: string): number => {
            const value = this.model.attribute(surface, name);
            if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 1) {
                throw new UnsupportedGeometryError(`#${surface} has no ${name}`);
            }
            return value;
        };
        const list = (name: string): number[] => {
            const value = this.model.attribute(surface, name);
            if (!finiteList(value)) {
                throw new UnsupportedGeometryError(`#${surface} has no ${name}`);
            }
            return value;
        };
        const controls = this.model.attribute(surface, "ControlPointsList");
        const net = (isList(controls) ? controls : []).map((row) => (isList(row) ? row : []).map((point) => pointOf(this.model, point)));
        const vCount = net[0]?.length ?? 0;
        if (net.length === 0 || net.some((row) => row.length !== vCount)) {
            throw new UnsupportedGeometryError(`#${surface} has a control net that is not rectangular`);
        }
        const weightRows = this.model.typeOf(surface) === "IfcRationalBSplineSurfaceWithKnots" ? this.model.attribute(surface, "WeightsData") : null;
        const weights = isList(weightRows) ? weightRows.flatMap((row) => (isList(row) ? row.map((value) => (typeof value === "number" ? value : 1)) : [])) : undefined;
        const points = net.flat().map((point, at) => (divided && weights ? point.map((coordinate) => coordinate / weights[at]!) : point));
        const [uKnots, uMultiplicities] = distinctKnots(list("UKnots"), list("UMultiplicities"));
        const [vKnots, vMultiplicities] = distinctKnots(list("VKnots"), list("VMultiplicities"));
        return {
            kind: "bspline",
            uDegree: degree("UDegree"),
            vDegree: degree("VDegree"),
            uCount: net.length,
            vCount,
            points: this.range(points.flat()),
            ...(weights ? { weights: this.range(weights) } : {}),
            uKnots: this.range(uKnots),
            uMultiplicities,
            vKnots: this.range(vKnots),
            vMultiplicities,
        };
    }
}

export class ExactBreps {
    constructor(private readonly model: ModelSnapshot, private readonly builder: RecipeBuilder, private readonly sampler: CurveSampler) { }

    describe(items: readonly number[]): Omit<Base.RecipeBrepNode, "fallback"> | undefined {
        try {
            return new BrepDescription(this.model, this.sampler).of(items, this.builder);
        } catch (thrown) {
            if (thrown instanceof UnsupportedGeometryError) {
                return undefined;
            }
            throw thrown;
        }
    }
}
