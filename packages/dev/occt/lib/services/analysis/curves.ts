import { BitbybitOcctModule, TopoDS_Edge, TopoDS_Face, TopoDS_Shape, TopoDS_Wire } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { InputError, resolveDto } from "@bitbybit-dev/base";
import { OccHelper } from "../../occ-helper";
import * as Inputs from "../../api/inputs";
import * as Models from "../../api/models";
import * as Resolved from "../../api/resolved-inputs";
import { checkedDirection, checkedNumber, checkedNumberList, checkedPoints, checkedShape, checkedWhole } from "../base/input-checks";
import { pointsFromCoordinates } from "../base/kernel-arrays";
import { RADIANS_PER_DEGREE, edgeNumbering } from "../base/curve-analysis";
import { uvFractions } from "../base/surface-analysis";

/** How the curve of an edge reads, one kind per value of the kernel's curve types. */
const curveKindOf = (occ: BitbybitOcctModule, value: number): Inputs.OCCT.curveTypeEnum => {
    const kinds: [number, Inputs.OCCT.curveTypeEnum][] = [
        [occ.GeomAbs_CurveType.Line.value, Inputs.OCCT.curveTypeEnum.line],
        [occ.GeomAbs_CurveType.Circle.value, Inputs.OCCT.curveTypeEnum.circle],
        [occ.GeomAbs_CurveType.Ellipse.value, Inputs.OCCT.curveTypeEnum.ellipse],
        [occ.GeomAbs_CurveType.Hyperbola.value, Inputs.OCCT.curveTypeEnum.hyperbola],
        [occ.GeomAbs_CurveType.Parabola.value, Inputs.OCCT.curveTypeEnum.parabola],
        [occ.GeomAbs_CurveType.BezierCurve.value, Inputs.OCCT.curveTypeEnum.bezier],
        [occ.GeomAbs_CurveType.BSplineCurve.value, Inputs.OCCT.curveTypeEnum.bspline],
        [occ.GeomAbs_CurveType.OffsetCurve.value, Inputs.OCCT.curveTypeEnum.offset],
    ];
    return kinds.find(([kernelValue]) => kernelValue === value)?.[1] ?? Inputs.OCCT.curveTypeEnum.other;
};

/** The curvatures of a curve at fractions or at lengths, as the kernel reads them, with its fields named as the models name them. */
const curvaturesOf = (occ: BitbybitOcctModule, curve: TopoDS_Shape, values: number[], isLength: boolean): Models.OCCT.CurveCurvature[] =>
    occ.CurvaturesOnCurve(curve, values, isLength).map(result => ({
        point: result.point,
        tangent: result.tangent,
        normal: result.normal,
        binormal: result.binormal,
        curvature: result.curvature,
        radius: result.radius,
        center: result.centre,
        torsion: result.torsion,
        isStraight: result.isStraight,
    }));

/**
 * Questions asked of edges and wires, answered with points and numbers rather than new shapes: the
 * closest point with its parameter and length along the curve, curvature and its comb, kinks where
 * the tangent turns, extremes along a direction, and intersections with other curves and with faces.
 * Parameters are fractions from 0 at the start to 1 at the end, where each edge of a wire takes an
 * equal share, as `shapes.wire.pointOnWireAtParam` takes them. Edges are numbered as
 * `shapes.edge.getEdgesAlongWire` lists them, and angles are in degrees.
 */
export class OCCTAnalysisCurves {

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly och: OccHelper,
    ) { }

    /**
     * Finds the point of an edge or a wire nearest each given point, with where it lies along the
     * curve.
     *
     * Each result carries the point, its parameter as a fraction of the curve, its length from the
     * start, its distance from the given point and the edge it lies on; at a corner that is the
     * edge starting there.
     * @param inputs - The edge or wire and the points to measure from
     * @returns One closest point per given point, in the same order
     * @group points
     * @shortname closest points
     * @drawable false
     * @example
     * ```typescript
     * const nearest = await bitbybit.occt.analysis.curves.closestPoints({ shape: wire, points: [[12, 0, 5], [3, 0, -2]] });
     * const cut = await bitbybit.occt.shapes.wire.splitWireAtParams({ shape: wire, params: nearest.map(result => result.param) });
     * ```
     */
    closestPoints(inputs: Inputs.OCCT.ClosestPointsOnShapeFromPointsDto<TopoDS_Wire | TopoDS_Edge>): Models.OCCT.CurveClosestPoint[] {
        const resolved = resolveDto(Inputs.OCCT.ClosestPointsOnShapeFromPointsDto, inputs) as Resolved.OCCT.ClosestPointsOnShapeFromPointsDto<TopoDS_Wire | TopoDS_Edge>;
        const curve = checkedShape(resolved.shape);
        const points = checkedPoints(resolved.points, "points");
        const found = this.occ.ClosestPointsOnCurve(curve, points.flat());
        const edgeIndexOf = edgeNumbering(this.occ, curve);
        return found.map(result => ({
            point: result.point,
            param: result.parameter,
            length: result.length,
            distance: result.distance,
            edgeIndex: edgeIndexOf(result.edge),
        }));
    }

    /**
     * Reads how an edge or a wire bends at places given as fractions from 0 at its start to 1 at its
     * end.
     *
     * Each result holds the point, tangent, normal, binormal, curvature, radius, center and torsion;
     * a straight stretch reads `isStraight` with an `Infinity` radius. At a corner of a wire the edge
     * starting there is read.
     * @param inputs - The edge or wire and the fractions along it
     * @returns One curvature per fraction, in the same order
     * @group curvature
     * @shortname curvatures at params
     * @drawable false
     * @example
     * ```typescript
     * const [start, middle] = await bitbybit.occt.analysis.curves.curvaturesAtParams({ shape: spline, params: [0, 0.5] });
     * const bendRadius = middle.radius;
     * ```
     */
    curvaturesAtParams(inputs: Inputs.OCCT.DataOnGeometryAtParamsDto<TopoDS_Wire | TopoDS_Edge>): Models.OCCT.CurveCurvature[] {
        const resolved = resolveDto(Inputs.OCCT.DataOnGeometryAtParamsDto, inputs) as Resolved.OCCT.DataOnGeometryAtParamsDto<TopoDS_Wire | TopoDS_Edge>;
        const curve = checkedShape(resolved.shape);
        return curvaturesOf(this.occ, curve, checkedNumberList(resolved.params, "params", { atLeast: 0, atMost: 1 }), false);
    }

    /**
     * Reads how an edge or a wire bends at places given as lengths along it from its start, in model
     * units.
     *
     * Each result is what `curvaturesAtParams` gives: the point, the tangent, normal and binormal,
     * the curvature with its radius and center, and the torsion. At a corner of a wire the edge
     * starting there is read.
     * @param inputs - The edge or wire and the lengths along it
     * @returns One curvature per length, in the same order
     * @group curvature
     * @shortname curvatures at lengths
     * @drawable false
     * @example
     * ```typescript
     * const curvatures = await bitbybit.occt.analysis.curves.curvaturesAtLengths({ shape: spline, lengths: [0, 2.5, 5] });
     * const tightest = Math.max(...curvatures.map(result => result.curvature));
     * ```
     */
    curvaturesAtLengths(inputs: Inputs.OCCT.DataOnGeometryAtLengthsDto<TopoDS_Wire | TopoDS_Edge>): Models.OCCT.CurveCurvature[] {
        const resolved = resolveDto(Inputs.OCCT.DataOnGeometryAtLengthsDto, inputs) as Resolved.OCCT.DataOnGeometryAtLengthsDto<TopoDS_Wire | TopoDS_Edge>;
        const curve = checkedShape(resolved.shape);
        return curvaturesOf(this.occ, curve, checkedNumberList(resolved.lengths, "lengths", { atLeast: 0 }), true);
    }

    /**
     * Draws a curvature comb along an edge or a wire: teeth standing on the curve, as long as the
     * curvature there, pointing away from its center.
     *
     * The first polyline runs through the tips, showing how the curvature changes; then comes one
     * two-point polyline per tooth, from the curve to its tip. The teeth are spaced evenly by length.
     * @param inputs - The edge or wire, the number of teeth and their scale
     * @returns The polyline through the tips, then one polyline per tooth
     * @group curvature
     * @shortname curvature comb
     * @drawable true
     * @example
     * ```typescript
     * const comb = await bitbybit.occt.analysis.curves.curvatureComb({ shape: spline, samples: 80, scale: 0 });
     * const outline = comb[0];
     * ```
     */
    curvatureComb(inputs: Inputs.OCCT.CurvatureCombDto<TopoDS_Wire | TopoDS_Edge>): Inputs.Base.Polyline3[] {
        const resolved = resolveDto(Inputs.OCCT.CurvatureCombDto, inputs) as Resolved.OCCT.CurvatureCombDto<TopoDS_Wire | TopoDS_Edge>;
        const curve = checkedShape(resolved.shape);
        const samples = checkedWhole(resolved.samples, "samples", 2);
        const scale = checkedNumber(resolved.scale, "scale", 0);
        const comb = this.occ.CurvatureComb(curve, samples, scale);
        const bases = pointsFromCoordinates(comb.bases);
        const tips = pointsFromCoordinates(comb.tips);
        return [{ points: tips }, ...bases.map((base, index) => ({ points: [base, tips[index]!] }))];
    }

    /**
     * Finds the corners of an edge or a wire where the tangent turns by more than an angle, such as
     * the corners of a polyline.
     *
     * Each kink comes with the edge ending there and the turn in degrees, in walking order; a closed
     * wire's closing corner, at its start, comes first.
     * @param inputs - The edge or wire and the angle in degrees
     * @returns The kinks, in order along the curve
     * @group shape
     * @shortname kinks
     * @drawable false
     * @example
     * ```typescript
     * const corners = await bitbybit.occt.analysis.curves.kinks({ shape: outline, angle: 10 });
     * const cornerPoints = corners.map(kink => kink.point);
     * ```
     */
    kinks(inputs: Inputs.OCCT.CurveKinksDto<TopoDS_Wire | TopoDS_Edge>): Models.OCCT.CurveKink[] {
        const resolved = resolveDto(Inputs.OCCT.CurveKinksDto, inputs) as Resolved.OCCT.CurveKinksDto<TopoDS_Wire | TopoDS_Edge>;
        const curve = checkedShape(resolved.shape);
        const angle = checkedNumber(resolved.angle, "angle", 0, 180);
        const found = this.occ.KinksOfCurve(curve, angle * RADIANS_PER_DEGREE);
        const edgeIndexOf = edgeNumbering(this.occ, curve);
        return found.map(kink => ({ point: kink.point, edgeIndex: edgeIndexOf(kink.edge), angle: kink.angle / RADIANS_PER_DEGREE }));
    }

    /**
     * Finds the highest and lowest points of an edge or a wire along a direction, such as the crests
     * of a wave.
     *
     * They come in order along the curve, marked as maxima or minima, and as global when nothing lies
     * higher, or lower; ties are all global. An open curve's ends count; a level stretch is reported
     * at its start.
     * @param inputs - The edge or wire and the direction that is up
     * @returns The highest and lowest points, in order along the curve
     * @group shape
     * @shortname extremes along
     * @drawable false
     * @example
     * ```typescript
     * const extremes = await bitbybit.occt.analysis.curves.extremesAlong({ shape: wave, direction: [0, 1, 0] });
     * const crests = extremes.filter(extreme => extreme.isMaximum);
     * ```
     */
    extremesAlong(inputs: Inputs.OCCT.CurveExtremesAlongDto<TopoDS_Wire | TopoDS_Edge>): Models.OCCT.CurveExtreme[] {
        const resolved = resolveDto(Inputs.OCCT.CurveExtremesAlongDto, inputs) as Resolved.OCCT.CurveExtremesAlongDto<TopoDS_Wire | TopoDS_Edge>;
        const curve = checkedShape(resolved.shape);
        const direction = checkedDirection(resolved.direction, "direction");
        return this.occ.ExtremesAlongCurve(curve, direction).map(extreme => ({
            point: extreme.point,
            param: extreme.parameter,
            length: extreme.length,
            height: extreme.height,
            isMaximum: extreme.isMaximum,
            isGlobal: extreme.isGlobal,
        }));
    }

    /**
     * Finds where two edges or wires cross or touch, with the parameter and the edge of each point on
     * both curves.
     *
     * The points come in order along the first curve. Where the curves run together, the two ends of
     * the shared stretch come back marked `isOverlap`; curves that do not meet give an empty list.
     * @param inputs - The two edges or wires and the tolerance
     * @returns The points where they meet, in order along the first curve
     * @group intersections
     * @shortname intersect curves
     * @drawable false
     * @example
     * ```typescript
     * const crossings = await bitbybit.occt.analysis.curves.intersectCurves({ shapeA: path, shapeB: border, tolerance: 1e-7 });
     * const pieces = await bitbybit.occt.shapes.wire.splitWireAtParams({ shape: path, params: crossings.map(crossing => crossing.paramA) });
     * ```
     */
    intersectCurves(inputs: Inputs.OCCT.IntersectCurvesDto<TopoDS_Wire | TopoDS_Edge>): Models.OCCT.CurveIntersection[] {
        const resolved = resolveDto(Inputs.OCCT.IntersectCurvesDto, inputs) as Resolved.OCCT.IntersectCurvesDto<TopoDS_Wire | TopoDS_Edge>;
        const curveA = checkedShape(resolved.shapeA, "shapeA");
        const curveB = checkedShape(resolved.shapeB, "shapeB");
        const tolerance = checkedNumber(resolved.tolerance, "tolerance", 0);
        const found = this.occ.IntersectCurves(curveA, curveB, tolerance);
        const edgeIndexOfA = edgeNumbering(this.occ, curveA);
        const edgeIndexOfB = edgeNumbering(this.occ, curveB);
        return found.map(crossing => ({
            point: crossing.point,
            paramA: crossing.parameterA,
            paramB: crossing.parameterB,
            edgeIndexA: edgeIndexOfA(crossing.edgeA),
            edgeIndexB: edgeIndexOfB(crossing.edgeB),
            isOverlap: crossing.isOverlap,
        }));
    }

    /**
     * Finds where an edge or a wire passes through a face or lies on it, within the face's edges.
     *
     * The points come in order along the curve, with `u` and `v` as the fractions that
     * `shapes.face.pointOnUV` takes. A stretch lying on the face gives its two ends, marked
     * `isOverlap`.
     * @param inputs - The edge or wire, the face and the tolerance
     * @returns The points where the curve meets the face, in order along the curve
     * @group intersections
     * @shortname intersect curve with face
     * @drawable false
     * @example
     * ```typescript
     * const hits = await bitbybit.occt.analysis.curves.intersectCurveWithFace({ shape: path, face, tolerance: 1e-7 });
     * const normals = await Promise.all(hits.map(hit => bitbybit.occt.shapes.face.normalOnUV({ shape: face, paramU: hit.u, paramV: hit.v })));
     * ```
     */
    intersectCurveWithFace(inputs: Inputs.OCCT.IntersectCurveWithFaceDto<TopoDS_Wire | TopoDS_Edge, TopoDS_Face>): Models.OCCT.CurveFaceIntersection[] {
        const resolved = resolveDto(Inputs.OCCT.IntersectCurveWithFaceDto, inputs) as Resolved.OCCT.IntersectCurveWithFaceDto<TopoDS_Wire | TopoDS_Edge, TopoDS_Face>;
        const curve = checkedShape(resolved.shape);
        checkedShape(resolved.face, "face");
        const tolerance = checkedNumber(resolved.tolerance, "tolerance", 0);
        const found = this.occ.IntersectCurveWithFace(curve, resolved.face, tolerance);
        if (found.length === 0) {
            return [];
        }
        const edgeIndexOf = edgeNumbering(this.occ, curve);
        const fractionsOf = uvFractions(this.occ, resolved.face, this.och.facesService.getUVBounds(resolved.face));
        return found.map(hit => {
            const [u, v] = fractionsOf(hit.u, hit.v);
            return { point: hit.point, param: hit.parameter, edgeIndex: edgeIndexOf(hit.edge), u, v, isOverlap: hit.isOverlap };
        });
    }

    /**
     * Tells what kind of curve an edge runs along: a line, a circle, an ellipse, a hyperbola, a
     * parabola, a Bezier curve, a B-spline, an offset curve or another kind.
     *
     * The kinds are the ones `select.edges.ofType` chooses edges by.
     * @param inputs - The edge
     * @returns The kind of curve the edge runs along
     * @group shape
     * @shortname curve type
     * @drawable false
     * @example
     * ```typescript
     * const kind = await bitbybit.occt.analysis.curves.curveType({ shape: edge });
     * const isRound = kind === Bit.Inputs.OCCT.curveTypeEnum.circle;
     * ```
     */
    curveType(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>): Inputs.OCCT.curveTypeEnum {
        const resolved = resolveDto(Inputs.OCCT.ShapeDto, inputs) as Resolved.OCCT.ShapeDto<TopoDS_Edge>;
        const shape = checkedShape(resolved.shape);
        if (shape.ShapeType() !== this.occ.TopAbs_ShapeEnum.EDGE) {
            throw new InputError("`shape` is not an edge; the edges of a wire or another shape come from `shapes.edge.getEdges`.", "shape");
        }
        const adaptor = new this.occ.BRepAdaptor_Curve(resolved.shape);
        try {
            return curveKindOf(this.occ, adaptor.GetType().value);
        } finally {
            adaptor.delete();
        }
    }
}
