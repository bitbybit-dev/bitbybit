import type { Geom_Surface, BitbybitOcctModule, TopoDS_Compound, TopoDS_Edge, TopoDS_Shape, TopoDS_Wire } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../../api/inputs";
import type { Base } from "../../api/inputs";
import type { ShapesHelperService } from "../../api/shapes-helper.service";
import type { EdgesService } from "./edges.service";
import type { ShapeGettersService } from "./shape-getters";
import type { EntitiesService } from "./entities.service";
import type { GeomService } from "./geom.service";
import type { TransformsService } from "./transforms.service";
import type { ConverterService } from "./converter.service";
import type { EnumService } from "./enum.service";
import { TextWiresDataDto, ObjectDefinition } from "../../api/models/bucket";
import type { OperationsService } from "./operations.service";
import type { BaseBitByBit } from "@bitbybit-dev/base";
import type * as Resolved from "../../api/resolved-inputs";
import { InputError } from "@bitbybit-dev/base";
import { occtFailure } from "../../kernel-failures";
import { resolveDto } from "@bitbybit-dev/base";
import { checkedDirection, checkedPoints, checkedShapes, checkedWithin, withCurveAlongWire } from "./input-checks";
import { kernelObjects, release, released, releasedOnError } from "./release";
import { length3, subtract3 } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/vectors";
import { readKernelException } from "../../kernel-exception";
import { withKernelErrorsRead } from "./kernel-refusals";

const SAME_POINT_TOLERANCE = 1e-5;

export class WiresService {

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly base: BaseBitByBit,
        private readonly shapesHelperService: ShapesHelperService,
        private readonly shapeGettersService: ShapeGettersService,
        private readonly transformsService: TransformsService,
        private readonly enumService: EnumService,
        private readonly entitiesService: EntitiesService,
        private readonly converterService: ConverterService,
        private readonly geomService: GeomService,
        private readonly edgesService: EdgesService,
        private readonly operations: () => OperationsService,
    ) { }

    /** The operations service, resolved on use because it and this one refer to each other. */
    get operationsService(): OperationsService {
        return this.operations();
    }

    getWireLength(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): number {
        return this.geomService.lengthsAndCentres([inputs.shape])[0]!.mass;
    }

    getWiresLengths(inputs: Inputs.OCCT.ShapesDto<TopoDS_Wire>): number[] {
        checkedShapes(inputs.shapes);
        if (inputs.shapes === undefined) {
            throw (Error(("Shapes are not defined")));
        }
        return this.geomService.lengthsAndCentres(inputs.shapes).map(properties => properties.mass);
    }

    createRectangleWire(inputs: Resolved.OCCT.RectangleDto): TopoDS_Wire {
        const cw = inputs.width / 2;
        const cl = inputs.length / 2;
        const pt1: Base.Point3 = [cw, 0, cl];
        const pt2: Base.Point3 = [-cw, 0, cl];
        const pt3: Base.Point3 = [-cw, 0, -cl];
        const pt4: Base.Point3 = [cw, 0, -cl];
        const points = [pt1, pt2, pt3, pt4].reverse();
        return this.createPolygonWire({ points: this.transformsService.placePoints(points, 0, inputs.direction, inputs.center) });
    }


    createSquareWire(inputs: Resolved.OCCT.SquareDto): TopoDS_Wire {
        return this.createRectangleWire({
            width: inputs.size,
            length: inputs.size,
            center: inputs.center,
            direction: inputs.direction
        });
    }

    reversedWire(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): TopoDS_Wire {
        const wire: TopoDS_Wire = inputs.shape;
        const reversed = wire.Reversed();
        const result = this.converterService.castAndRelease(reversed);
        return result;
    }

    reversedWireFromReversedEdges(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): TopoDS_Wire {
        const wire: TopoDS_Wire = inputs.shape;
        const edges = this.edgesService.getEdgesAlongWire({ shape: wire });
        const reversedEdges: TopoDS_Shape[] = [];
        try {
            edges.forEach(e => reversedEdges.push(this.converterService.castAndRelease(e.Reversed())));
            return this.converterService.castAndRelease(this.converterService.combineEdgesAndWiresIntoAWire({ shapes: [...reversedEdges].reverse() }));
        } finally {
            [...edges.filter(e => e !== wire), ...reversedEdges].forEach(e => e.delete());
        }
    }

    createChristmasTreeWire(inputs: Resolved.OCCT.ChristmasTreeDto) {
        const pointsAlong = (end: number): Base.Point3[] => {
            const frame = this.createLineWire({ start: [end, 0, 0], end: [0, inputs.height, 0] });
            return released([frame], () => this.divideWireByEqualDistanceToPoints({
                shape: frame,
                nrOfDivisions: inputs.nrSkirts,
                removeEndPoint: false,
                removeStartPoint: false,
            }));
        };
        const pointsOnInner = pointsAlong(inputs.innerDist);
        const pointsOnOuter = pointsAlong(inputs.outerDist);
        const halfShapeTreePts: Base.Point3[] = [];
        if (inputs.trunkWidth > 0 && inputs.trunkHeight > 0) {
            halfShapeTreePts.push([0, -inputs.trunkHeight, 0]);
            halfShapeTreePts.push([inputs.trunkWidth / 2, -inputs.trunkHeight, 0]);
            halfShapeTreePts.push([inputs.trunkWidth / 2, 0, 0]);
        } else {
            halfShapeTreePts.push([0, 0, 0]);
        }

        pointsOnInner.forEach((pt, index) => {
            const ptOnOuter = pointsOnOuter[index]!;
            if (index === 0) {
                halfShapeTreePts.push(ptOnOuter);
            } else if (index !== 0 && index < pointsOnOuter.length - 1) {
                halfShapeTreePts.push([pt[0], ptOnOuter[1] + ((inputs.height / inputs.nrSkirts) * 0.1), pt[2]]);
                halfShapeTreePts.push(ptOnOuter);
            } else {
                halfShapeTreePts.push(pt);
            }
        });

        if (!inputs.half) {
            const secondHalf = halfShapeTreePts.map(pt => [-pt[0], pt[1], pt[2]] as Base.Point3);
            secondHalf.pop();
            halfShapeTreePts.push(...secondHalf.reverse());
        }

        const outline = inputs.trunkHeight > 0 && inputs.trunkWidth > 0
            ? halfShapeTreePts.map(pt => [pt[0], pt[1] + inputs.trunkHeight, pt[2]] as Base.Point3)
            : halfShapeTreePts;
        return this.createPolylineWire({ points: this.transformsService.placePoints(outline, inputs.rotation, inputs.direction, inputs.origin) });
    }

    createStarWire(inputs: Resolved.OCCT.StarDto) {
        const lines = this.shapesHelperService.starLines(inputs.innerRadius, inputs.outerRadius, inputs.numRays, inputs.half, inputs.offsetOuterEdges);
        return this.wireAlongLines(lines, !inputs.half, inputs.direction, inputs.center, "star");
    }

    createParallelogramWire(inputs: Resolved.OCCT.ParallelogramDto) {
        const lines = this.shapesHelperService.parallelogram(inputs.width, inputs.height, inputs.angle, inputs.aroundCenter);
        return this.wireAlongLines(lines, true, inputs.direction, inputs.center, "parallelogram");
    }

    createHeartWire(inputs: Resolved.OCCT.Heart2DDto) {
        const sizeOfBox = inputs.sizeApprox;
        const halfSize = sizeOfBox / 2;

        const points1: Inputs.Base.Point3[] = [
            [0, 0, halfSize * 0.7],
            [halfSize / 6, 0, halfSize * 0.9],
            [halfSize / 2, 0, halfSize],
            [halfSize * 0.75, 0, halfSize * 0.9],
            [halfSize, 0, halfSize / 4],
            [halfSize / 2, 0, -halfSize / 2],
            [0, 0, -halfSize],
        ];

        const points2: Inputs.Base.Point3[] = points1.map(p => [-p[0], p[1], p[2]]);

        const tolerance = 0.00001;
        const wireFirstHalf = this.interpolatePoints({
            points: points1, periodic: false, tolerance
        });

        const wireSecondHalf = this.interpolatePoints({
            points: points2.reverse(), periodic: false, tolerance
        });

        const wire = this.converterService.combineEdgesAndWiresIntoAWire({ shapes: [wireFirstHalf, wireSecondHalf] });
        const rotated = this.transformsService.rotate({ shape: wire, angle: inputs.rotation, axis: [0, 1, 0] });
        const aligned = this.transformsService.alignAndTranslate({ shape: rotated, direction: inputs.direction, center: inputs.center });
        wire.delete();
        rotated.delete();
        wireFirstHalf.delete();
        wireSecondHalf.delete();
        return aligned;
    }

    createNGonWire(inputs: Resolved.OCCT.NGonWireDto) {
        const lines = this.shapesHelperService.ngon(inputs.nrCorners, inputs.radius, [0, 0]);
        return this.wireAlongLines(lines, true, inputs.direction, inputs.center, "polygon");
    }

    createLPolygonWire(inputs: Resolved.OCCT.LPolygonDto) {
        let points: Base.Point3[];
        switch (inputs.align) {
        case Inputs.OCCT.directionEnum.outside:
            points = this.shapesHelperService.polygonL(inputs.widthFirst, inputs.lengthFirst, inputs.widthSecond, inputs.lengthSecond);
            break;
        case Inputs.OCCT.directionEnum.inside:
            points = this.shapesHelperService.polygonLInverted(inputs.widthFirst, inputs.lengthFirst, inputs.widthSecond, inputs.lengthSecond);
            break;
        case Inputs.OCCT.directionEnum.middle:
            points = this.shapesHelperService.polygonLMiddle(inputs.widthFirst, inputs.lengthFirst, inputs.widthSecond, inputs.lengthSecond);
            break;
        default:
            points = this.shapesHelperService.polygonL(inputs.widthFirst, inputs.lengthFirst, inputs.widthSecond, inputs.lengthSecond);
        }
        return this.createPolygonWire({ points: this.transformsService.placePoints(points, inputs.rotation, inputs.direction, inputs.center) });
    }

    createIBeamProfileWire(inputs: Resolved.OCCT.IBeamProfileDto) {
        const points = this.shapesHelperService.beamIProfile(
            inputs.width,
            inputs.height,
            inputs.webThickness,
            inputs.flangeThickness,
            inputs.alignment
        );
        return this.createPolygonWire({ points: this.transformsService.placePoints(points, inputs.rotation, inputs.direction, inputs.center) });
    }

    createHBeamProfileWire(inputs: Resolved.OCCT.HBeamProfileDto) {
        const points = this.shapesHelperService.beamHProfile(
            inputs.width,
            inputs.height,
            inputs.webThickness,
            inputs.flangeThickness,
            inputs.alignment
        );
        return this.createPolygonWire({ points: this.transformsService.placePoints(points, inputs.rotation, inputs.direction, inputs.center) });
    }

    createTBeamProfileWire(inputs: Resolved.OCCT.TBeamProfileDto) {
        const points = this.shapesHelperService.beamTProfile(
            inputs.width,
            inputs.height,
            inputs.webThickness,
            inputs.flangeThickness,
            inputs.alignment
        );
        return this.createPolygonWire({ points: this.transformsService.placePoints(points, inputs.rotation, inputs.direction, inputs.center) });
    }

    createUBeamProfileWire(inputs: Resolved.OCCT.UBeamProfileDto) {
        const points = this.shapesHelperService.beamUProfile(
            inputs.width,
            inputs.height,
            inputs.webThickness,
            inputs.flangeThickness,
            inputs.flangeWidth,
            inputs.alignment
        );
        return this.createPolygonWire({ points: this.transformsService.placePoints(points, inputs.rotation, inputs.direction, inputs.center) });
    }

    createPolygonWire(inputs: Inputs.OCCT.PolygonDto): TopoDS_Wire {
        return this.wireThrough(inputs.points, true, "polygon");
    }

    createPolylineWire(inputs: Inputs.OCCT.PolylineDto): TopoDS_Wire {
        return this.wireThrough(inputs.points, false, "polyline");
    }

    createLineWire(inputs: Inputs.OCCT.LineDto): TopoDS_Wire {
        const resolved = resolveDto(Inputs.OCCT.LineDto, inputs) as Resolved.OCCT.LineDto;
        if (this.samePoint(resolved.start, resolved.end)) {
            throw new InputError("`start` and `end` are the same point, so there is no line between them.", "end");
        }
        return this.wireThrough([resolved.start, resolved.end], false, "line");
    }

    createLineWireWithExtensions(inputs: Resolved.OCCT.LineWithExtensionsDto): TopoDS_Wire {
        const direction = this.base.vector.normalized({ vector: this.base.vector.sub({ first: inputs.end, second: inputs.start }) });
        if (!direction) {
            throw new Error("Line start and end points must differ");
        }
        const scaledVecStart = this.base.vector.mul({ vector: direction, scalar: -inputs.extensionStart });
        const scaledVecEnd = this.base.vector.mul({ vector: direction, scalar: inputs.extensionEnd });
        const start = this.base.vector.add({ first: inputs.start, second: scaledVecStart }) as Base.Point3;
        const end = this.base.vector.add({ first: inputs.end, second: scaledVecEnd }) as Base.Point3;
        return this.createLineWire({ start, end });
    }

    private wireAlongLines(lines: Base.Line3[], closed: boolean, direction: Base.Vector3, center: Base.Point3, kind: string): TopoDS_Wire {
        const points = lines.map(line => line.start);
        const last = lines[lines.length - 1];
        if (!closed && last) {
            points.push(last.end);
        }
        return this.wireThrough(this.transformsService.placePoints(points, 0, direction, center), closed, kind);
    }

    private samePoint(first: Inputs.Base.Point3, second: Inputs.Base.Point3): boolean {
        return length3(subtract3(first, second)) <= 1e-7;
    }

    private checkedControlPoints(points: unknown, controlPoints: number): void {
        checkedPoints(points, "points");
        if (controlPoints < 2) {
            throw new InputError(`A Bezier curve needs at least two points, and \`points\` has ${controlPoints}.`, "points");
        }
    }

    private wireThrough(points: Inputs.Base.Point3[], closed: boolean, kind: string): TopoDS_Wire {
        if (points.length < 2) {
            throw new InputError(`A ${kind} needs at least two points, and \`points\` has ${points.length}.`, "points");
        }
        const repeated = points.findIndex((point, index) => index > 0 && this.samePoint(points[index - 1]!, point));
        if (repeated > 0) {
            throw new InputError(`Points ${repeated - 1} and ${repeated} of \`points\` are the same point, which would make an edge of length 0.`, "points");
        }
        if (closed && this.samePoint(points[points.length - 1]!, points[0]!)) {
            throw new InputError("The last point of `points` repeats the first, and a polygon closes itself, so the closing edge would have length 0.", "points");
        }
        const maker = new this.occ.BRepBuilderAPI_MakePolygon();
        points.forEach(point => {
            const gpPoint = this.entitiesService.gpPnt(point);
            maker.Add(gpPoint);
            gpPoint.delete();
        });
        if (closed) {
            maker.Close();
        }
        const wire = maker.Wire();
        maker.delete();
        return wire;
    }



    divideWireByParamsToPoints(inputs: Resolved.OCCT.DivideDto<TopoDS_Wire>): Inputs.Base.Point3[] {
        return this.geomService.pointsAtNormalizedParameters(inputs.shape, this.geomService.divisions(inputs, 1));
    }

    divideWireByEqualDistanceToPoints(inputs: Resolved.OCCT.DivideDto<TopoDS_Wire>): Base.Point3[] {
        const lengths = this.geomService.divisions(inputs, this.getWireLength({ shape: inputs.shape }));
        return this.geomService.pointsAtLengths(inputs.shape, lengths);
    }

    pointOnWireAtParam(inputs: Resolved.OCCT.DataOnGeometryAtParamDto<TopoDS_Wire>): Base.Point3 {
        return this.geomService.pointsAtNormalizedParameters(inputs.shape, [inputs.param])[0]!;
    }

    tangentOnWireAtParam(inputs: Resolved.OCCT.DataOnGeometryAtParamDto<TopoDS_Wire>): Base.Vector3 {
        return withCurveAlongWire(this.occ, "shape", () => {
            const curve = new this.occ.BRepAdaptor_CompCurve(inputs.shape, false);
            return released([curve], () => this.geomService.tangentOnCurveAtParam({ ...inputs, shape: curve }));
        });
    }

    pointOnWireAtLength(inputs: Resolved.OCCT.DataOnGeometryAtLengthDto<TopoDS_Wire>): Base.Point3 {
        return this.geomService.pointsAtLengths(inputs.shape, [inputs.length])[0]!;
    }

    pointsOnWireAtLengths(inputs: Inputs.OCCT.DataOnGeometryAtLengthsDto<TopoDS_Wire>): Base.Point3[] {
        return this.geomService.pointsAtLengths(inputs.shape, inputs.lengths);
    }

    pointsOnWireAtEqualLength(inputs: Resolved.OCCT.PointsOnWireAtEqualLengthDto<TopoDS_Wire>): Base.Point3[] {
        if (!(inputs.length > 0)) {
            throw new InputError(`\`length\` must be more than 0, or the points never move along the wire, and is ${inputs.length}.`, "length");
        }
        const wire = inputs.shape;
        const fitting = Math.ceil(this.getWireLength({ shape: wire }) / inputs.length);
        const lengths: number[] = [];
        for (let i = 0; i < fitting; i++) {
            lengths.push(inputs.length * i);
        }
        if (!inputs.includeFirst) {
            lengths.shift();
        }
        if (inputs.tryNext) {
            lengths.push(inputs.length * fitting);
        }
        const res = this.geomService.pointsAtLengths(wire, lengths);
        if (inputs.includeLast) {
            res.push(this.endPointOnWire({ shape: wire }));
        }
        return res;
    }

    pointsOnWireAtPatternOfLengths(inputs: Resolved.OCCT.PointsOnWireAtPatternOfLengthsDto<TopoDS_Wire>): Base.Point3[] {
        if (inputs.lengths.reduce((sum, length) => sum + length, 0) <= 0) {
            throw new Error("Lengths must add up to more than 0, or the points never move along the wire.");
        }
        const wire = inputs.shape;
        const wireLength = this.getWireLength({ shape: wire });
        const lengths = [];
        let total = 0;
        let lastIndex = 0;
        let reachedGoal = false;
        while (!reachedGoal) {
            for (let i = 0; i < inputs.lengths.length; i++) {
                const length = inputs.lengths[i]!;
                if (total + length <= wireLength) {
                    lengths.push(total + length);
                    total += length;
                    lastIndex = i;
                } else {
                    reachedGoal = true;
                    break;
                }
            }
        }
        if (inputs.includeFirst) {
            lengths.unshift(0);
        }
        if (inputs.tryNext) {
            if (lastIndex + 1 < inputs.lengths.length) {
                lengths.push(total + inputs.lengths[lastIndex + 1]!);
            } else {
                lengths.push(total + inputs.lengths[0]!);
            }
        }
        const res = this.geomService.pointsAtLengths(wire, lengths);
        if (inputs.includeLast) {
            res.push(this.endPointOnWire({ shape: wire }));
        }
        return res;
    }

    tangentOnWireAtLength(inputs: Resolved.OCCT.DataOnGeometryAtLengthDto<TopoDS_Wire>): Base.Vector3 {
        return withCurveAlongWire(this.occ, "shape", () => {
            const curve = new this.occ.BRepAdaptor_CompCurve(inputs.shape, false);
            return released([curve], () => this.geomService.tangentOnCurveAtLengthCompCurve({ ...inputs, shape: curve }));
        });
    }

    private parametrizationToInt(p?: Inputs.OCCT.bSplineParametrizationEnum): number {
        switch (p) {
            case Inputs.OCCT.bSplineParametrizationEnum.uniform: return 0;
            case Inputs.OCCT.bSplineParametrizationEnum.centripetal: return 2;
            default: return 1;
        }
    }

    private buildInterpolatedWire(inputs: Resolved.OCCT.InterpolationDto, periodicOverride?: boolean, parametrizationOverride?: Inputs.OCCT.bSplineParametrizationEnum): TopoDS_Wire | undefined {
        const periodic = periodicOverride ?? inputs.periodic;
        const coords = new this.occ.VectorDouble();
        for (const pt of inputs.points) { coords.push_back(pt[0]); coords.push_back(pt[1]); coords.push_back(pt[2]); }

        const tangents = new this.occ.VectorDouble();
        const flags = new this.occ.VectorInt();
        const enforced = (tangent: Inputs.Base.Vector3 | undefined): tangent is Inputs.Base.Vector3 =>
            tangent !== undefined && length3(tangent) > inputs.tolerance;
        if (inputs.tangents && inputs.tangents.length === inputs.points.length) {
            for (const t of inputs.tangents) {
                const used = enforced(t);
                tangents.push_back(used ? t[0] : 0); tangents.push_back(used ? t[1] : 0); tangents.push_back(used ? t[2] : 0);
                flags.push_back(used ? 1 : 0);
            }
        } else if (!periodic && enforced(inputs.startTangent) && enforced(inputs.endTangent)) {
            const s = inputs.startTangent; const e = inputs.endTangent;
            tangents.push_back(s[0]); tangents.push_back(s[1]); tangents.push_back(s[2]);
            tangents.push_back(e[0]); tangents.push_back(e[1]); tangents.push_back(e[2]);
        }

        let edge: TopoDS_Edge | undefined;
        try {
            edge = withKernelErrorsRead(this.occ, () => this.occ.MakeInterpolatedBSplineEdge(
                coords, periodic, this.parametrizationToInt(parametrizationOverride ?? inputs.parametrization),
                inputs.tolerance, tangents, flags
            ));
        } finally {
            coords.delete(); tangents.delete(); flags.delete();
        }

        if (!edge || edge.IsNull()) { edge?.delete(); return undefined; }
        const wireMaker = new this.occ.BRepBuilderAPI_MakeWire(edge);
        const wire = wireMaker.Wire();
        edge.delete();
        wireMaker.delete();
        return wire;
    }

    interpolatePoints(inputs: Inputs.OCCT.InterpolationDto): TopoDS_Wire {
        const resolved = resolveDto(Inputs.OCCT.InterpolationDto, inputs) as Resolved.OCCT.InterpolationDto;
        const points = checkedPoints(resolved.points, "points");
        if (points.length < 2) {
            throw new InputError(`An interpolated curve needs at least two points, and \`points\` has ${points.length}.`, "points");
        }
        const wire = this.buildInterpolatedWire(resolved);
        if (!wire) {
            throw new Error("Failed to interpolate the points");
        }
        return wire;
    }

    /**
     * Interpolate points with an achiral, symmetric, periodic (closed) curve: the kernel solves the
     * tangents of the C2 periodic spline through the points, so symmetric inputs (triangle,
     * square, ...) produce a mirror-symmetric curve that is C2 everywhere, the seam included.
     * @param inputs Points to interpolate and tolerance
     * @returns Symmetric periodic BSpline wire
     */
    interpolatePointsSymmetric(inputs: Resolved.OCCT.InterpolateSymmetricDto): TopoDS_Wire {
        const coords = new this.occ.VectorDouble();
        for (const pt of inputs.points) {
            coords.push_back(pt[0]);
            coords.push_back(pt[1]);
            coords.push_back(pt[2]);
        }

        let edge: TopoDS_Edge | undefined;
        try {
            edge = withKernelErrorsRead(this.occ, () => this.occ.MakeSymmetricInterpolatedBSplineEdge(coords, inputs.tolerance));
        } finally {
            coords.delete();
        }

        if (!edge || edge.IsNull()) { edge?.delete(); throw new Error("Failed to interpolate the points symmetrically"); }
        const wireMaker = new this.occ.BRepBuilderAPI_MakeWire(edge);
        const wire = wireMaker.Wire();
        edge.delete();
        wireMaker.delete();
        return wire;
    }

    isWireClosed(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): boolean {
        const tolerance = 1.0e-7;
        const startPointOnWire = this.startPointOnWire({ shape: inputs.shape });
        const endPointOnWire = this.endPointOnWire({ shape: inputs.shape });

        const wireIsClosed = this.base.vector.vectorsTheSame({ vec1: endPointOnWire, vec2: startPointOnWire, tolerance });
        return wireIsClosed;
    }

    splitOnPoints(inputs: Inputs.OCCT.SplitWireOnPointsDto<TopoDS_Wire>): TopoDS_Wire[] {
        const wire = inputs.shape;
        const splitPoints = this.base.vector.removeAllDuplicateVectors({ vectors: inputs.points, tolerance: 1e-7 });
        const { own, releaseAll } = kernelObjects();
        const newWires: TopoDS_Wire[] = [];
        try {
            const edges = this.edgesService.getEdgesAlongWire({ shape: wire });
            edges.filter(edge => edge !== wire).forEach(own);
            if (edges.length === 0) {
                return [];
            }

            const splitLocations: { edgeIndex: number; parameter: number }[] = [];

            const firstEdge = edges[0]!;
            splitLocations.push({ edgeIndex: 0, parameter: this.edgeParameterRange(firstEdge).first });

            splitPoints.forEach((pt) => {
                let minDist = Infinity;
                let bestEdgeIndex = -1;
                let bestParam = 0;

                edges.forEach((edge, index) => {
                    const { first: firstVal, last: lastVal } = this.edgeParameterRange(edge);

                    const gpPnt = this.entitiesService.gpPnt(pt as Base.Point3);
                    try {
                        const result = this.occ.ProjectPointOnCurve(gpPnt, edge);
                        released([result], () => {
                            const projectedPt = result.Point;
                            released([projectedPt], () => {
                                const clampedParam = Math.max(firstVal, Math.min(lastVal, result.param));
                                const dist = length3(subtract3([projectedPt.X(), projectedPt.Y(), projectedPt.Z()], [gpPnt.X(), gpPnt.Y(), gpPnt.Z()]));
                                if (dist < minDist) {
                                    minDist = dist;
                                    bestEdgeIndex = index;
                                    bestParam = clampedParam;
                                }
                            });
                        });
                    } catch (error) {
                        readKernelException(this.occ, error);
                        return;
                    } finally {
                        gpPnt.delete();
                    }
                });

                if (bestEdgeIndex >= 0) {
                    splitLocations.push({ edgeIndex: bestEdgeIndex, parameter: this.snappedToEdgeEnds(edges[bestEdgeIndex]!, bestParam, pt as Base.Point3) });
                }
            });

            const lastEdge = edges[edges.length - 1]!;
            splitLocations.push({ edgeIndex: edges.length - 1, parameter: this.edgeParameterRange(lastEdge).last });

            const uniqueLocations = splitLocations.filter((loc, index, self) =>
                index === self.findIndex((t) => t.edgeIndex === loc.edgeIndex && t.parameter === loc.parameter)
            );
            uniqueLocations.sort((a, b) => {
                if (a.edgeIndex !== b.edgeIndex) {
                    return a.edgeIndex - b.edgeIndex;
                }
                return a.parameter - b.parameter;
            });

            for (let i = 0; i < uniqueLocations.length - 1; i++) {
                const startLoc = uniqueLocations[i]!;
                const endLoc = uniqueLocations[i + 1]!;
                const wireBuilder = own(new this.occ.BRepBuilderAPI_MakeWire());

                if (startLoc.edgeIndex === endLoc.edgeIndex) {
                    const edge = edges[startLoc.edgeIndex]!;

                    if (startLoc.parameter === endLoc.parameter) {
                        continue;
                    }

                    const newEdge = own(this.occ.TrimEdgeToParams(edge, startLoc.parameter, endLoc.parameter));
                    if (!newEdge.IsNull()) {
                        wireBuilder.AddEdge(newEdge);
                    }
                } else {
                    const startEdge = edges[startLoc.edgeIndex]!;
                    const startLastVal = this.edgeParameterRange(startEdge).last;

                    if (startLoc.parameter < startLastVal) {
                        const newStartEdge = own(this.occ.TrimEdgeToParams(startEdge, startLoc.parameter, startLastVal));
                        if (!newStartEdge.IsNull()) {
                            wireBuilder.AddEdge(newStartEdge);
                        }
                    }

                    for (let j = startLoc.edgeIndex + 1; j < endLoc.edgeIndex; j++) {
                        wireBuilder.AddEdge(edges[j]!);
                    }

                    const endEdge = edges[endLoc.edgeIndex]!;
                    const endFirstVal = this.edgeParameterRange(endEdge).first;

                    if (endLoc.parameter > endFirstVal) {
                        const newEndEdge = own(this.occ.TrimEdgeToParams(endEdge, endFirstVal, endLoc.parameter));
                        if (!newEndEdge.IsNull()) {
                            wireBuilder.AddEdge(newEndEdge);
                        }
                    }
                }

                if (wireBuilder.IsDone()) {
                    newWires.push(wireBuilder.Wire());
                }
            }

            return newWires;
        } catch (error) {
            newWires.forEach(release);
            throw error;
        } finally {
            releaseAll();
        }
    }

    createWireFromTwoCirclesTan(inputs: Resolved.OCCT.WireFromTwoCirclesTanDto<TopoDS_Wire>) {
        const circleEdge1 = this.shapeGettersService.getEdges({ shape: inputs.circle1 });
        const circleEdge2 = this.shapeGettersService.getEdges({ shape: inputs.circle2 });
        const walked = [...circleEdge1, ...circleEdge2].filter(edge => edge !== inputs.circle1 && edge !== inputs.circle2);
        return released(walked, () => {
            if (circleEdge1.length !== 1 || circleEdge2.length !== 1) {
                throw new Error("Could not find the edges of the provided circle wires.");
            }
            const result = this.edgesService.constraintTanLinesOnTwoCircles({
                circle1: circleEdge1[0]!,
                circle2: circleEdge2[0]!,
                positionResult: inputs.keepLines === Inputs.OCCT.twoSidesStrictEnum.outside ? Inputs.OCCT.positionResultEnum.keepSide2 : Inputs.OCCT.positionResultEnum.keepSide1,
                circleRemainders: this.enumService.convertFourSidesStrictEnumToTwoCircleInclusionEnum(inputs.circleRemainders),
                tolerance: inputs.tolerance,
            });
            if (result.length === 0) {
                throw this.nestedCircles(circleEdge1[0]!, circleEdge2[0]!);
            }
            return released(result, () => this.converterService.combineEdgesAndWiresIntoAWire({ shapes: result }));
        });
    }

    private nestedCircles(circle1: TopoDS_Edge, circle2: TopoDS_Edge): InputError {
        const [inner, outer] = this.edgesService.getCircularEdgeRadius({ shape: circle2 }) < this.edgesService.getCircularEdgeRadius({ shape: circle1 }) ? ["circle2", "circle1"] : ["circle1", "circle2"];
        return new InputError(`\`${inner}\` lies inside \`${outer}\`, so no line is tangent to both and there is no wire to make.`, inner);
    }


    createZigZagBetweenTwoWires(inputs: Resolved.OCCT.ZigZagBetweenTwoWiresDto<TopoDS_Wire>) {
        const wire1 = inputs.wire1;
        const wire2 = inputs.wire2;

        let points1: Base.Point3[][];
        let points2: Base.Point3[][];

        if (inputs.zigZagsPerEdge) {
            const pointsOnEdgesOf = (wire: TopoDS_Wire): Base.Point3[][] => {
                const edges = this.edgesService.getEdgesAlongWire({ shape: wire });
                return released(edges.filter(edge => edge !== wire), () => edges.map(e => inputs.divideByEqualDistance
                    ? this.edgesService.divideEdgeByEqualDistanceToPoints({ shape: e, nrOfDivisions: inputs.nrZigZags * 2, removeEndPoint: false, removeStartPoint: false })
                    : this.edgesService.divideEdgeByParamsToPoints({ shape: e, nrOfDivisions: inputs.nrZigZags * 2, removeEndPoint: false, removeStartPoint: false })));
            };
            points1 = pointsOnEdgesOf(wire1);
            points2 = pointsOnEdgesOf(wire2);
        } else {
            if (inputs.divideByEqualDistance) {
                points1 = [this.divideWireByEqualDistanceToPoints({ shape: wire1, nrOfDivisions: inputs.nrZigZags * 2, removeEndPoint: false, removeStartPoint: false })];
                points2 = [this.divideWireByEqualDistanceToPoints({ shape: wire2, nrOfDivisions: inputs.nrZigZags * 2, removeEndPoint: false, removeStartPoint: false })];
            } else {
                points1 = [this.divideWireByParamsToPoints({ shape: wire1, nrOfDivisions: inputs.nrZigZags * 2, removeEndPoint: false, removeStartPoint: false })];
                points2 = [this.divideWireByParamsToPoints({ shape: wire2, nrOfDivisions: inputs.nrZigZags * 2, removeEndPoint: false, removeStartPoint: false })];
            }
        }
        const wires = points1.map((pts1, index) => {
            const pts2 = points2[index]!;

            const ptsInZigZagOrder = [];
            for (let i = 0; i < pts1.length; i++) {
                if (i % 2 === 0) {
                    if (inputs.inverse) {
                        ptsInZigZagOrder.push(pts2[i]!);
                    } else {
                        ptsInZigZagOrder.push(pts1[i]!);
                    }
                } else {
                    if (inputs.inverse) {
                        ptsInZigZagOrder.push(pts1[i]!);
                    } else {
                        ptsInZigZagOrder.push(pts2[i]!);
                    }
                }
            }
            return this.createPolylineWire({ points: ptsInZigZagOrder });
        });
        return released(wires, () => this.converterService.combineEdgesAndWiresIntoAWire({ shapes: wires }));
    }

    createWiresBetweenStartEndPointsOfWiresAndEdges(inputs: Resolved.OCCT.WiresBetweenStartEndPointsOfWiresAndEdgesDto<TopoDS_Wire | TopoDS_Edge>): TopoDS_Wire[] {
        checkedShapes(inputs.shapes);
        if (!inputs.shapes || inputs.shapes.length < 2) {
            throw new Error("You must provide at least two wires or edges to connect their start and end points.");
        }
        const startPoints: Base.Point3[] = [];
        const endPoints: Base.Point3[] = [];
        inputs.shapes.forEach((shape) => {
            if (this.enumService.getShapeTypeEnum(shape) === Inputs.OCCT.shapeTypeEnum.edge) {
                startPoints.push(this.edgesService.startPointOnEdge({ shape: shape }));
                endPoints.push(this.edgesService.endPointOnEdge({ shape: shape }));
            } else {
                startPoints.push(this.startPointOnWire({ shape: shape }));
                endPoints.push(this.endPointOnWire({ shape: shape }));
            }
        });
        this.refuseShapesMeeting(startPoints, inputs.closed, "start at the same point", "their start points");
        this.refuseShapesMeeting(endPoints, inputs.closed, "end at the same point", "their end points");
        const startWire = this.createWireFromPointsByType(startPoints, inputs.wireType, inputs.closed, inputs.tolerance);
        const endWire = releasedOnError([startWire], () => this.createWireFromPointsByType(endPoints, inputs.wireType, inputs.closed, inputs.tolerance));
        return [startWire, endWire];
    }

    createWiresBetweenSubdividedPointsOfWiresAndEdges(inputs: Resolved.OCCT.WiresBetweenSubdividedPointsOfWiresAndEdgesDto<TopoDS_Wire | TopoDS_Edge>): TopoDS_Wire[] {
        checkedShapes(inputs.shapes);
        if (!inputs.shapes || inputs.shapes.length < 2) {
            throw new Error("You must provide at least two wires or edges to connect their subdivided points.");
        }
        const nrOfDivisions = inputs.nrOfDivisions;
        const divideByEqualDistance = inputs.divideByEqualDistance;
        const pointsPerShape = inputs.shapes.map((shape) => this.subdivideWireOrEdgeToPoints(shape, nrOfDivisions, divideByEqualDistance));
        const nrOfPoints = pointsPerShape[0]!.length;
        const pointsAtDivisions = Array.from({ length: nrOfPoints }, (_, division) => pointsPerShape.map((points) => points[division]!));
        pointsAtDivisions.forEach((points, division) => this.refuseShapesMeeting(points, inputs.closed, `share their point at division ${division} of ${nrOfPoints - 1}`, "those points"));
        const wires: TopoDS_Wire[] = [];
        return releasedOnError(wires, () => {
            pointsAtDivisions.forEach(points => wires.push(this.createWireFromPointsByType(points, inputs.wireType, inputs.closed, inputs.tolerance)));
            return wires;
        });
    }

    private refuseShapesMeeting(points: Base.Point3[], closed: boolean, meeting: string, through: string): void {
        const repeated = points.findIndex((point, index) => index > 0 && this.samePoint(points[index - 1]!, point));
        if (repeated > 0) {
            throw new InputError(`\`shapes\` at positions ${repeated - 1} and ${repeated} ${meeting}, so the wire through ${through} would join a point to itself.`, "shapes");
        }
        const last = points.length - 1;
        if (closed && this.samePoint(points[last]!, points[0]!)) {
            throw new InputError(`\`shapes\` at positions ${last} and 0 ${meeting}, and \`closed\` joins them, so the wire through ${through} would join a point to itself.`, "shapes");
        }
    }

    private subdivideWireOrEdgeToPoints(shape: TopoDS_Wire | TopoDS_Edge, nrOfDivisions: number, divideByEqualDistance: boolean): Base.Point3[] {
        const isEdge = this.enumService.getShapeTypeEnum(shape) === Inputs.OCCT.shapeTypeEnum.edge;
        if (isEdge) {
            return divideByEqualDistance
                ? this.edgesService.divideEdgeByEqualDistanceToPoints({ shape: shape, nrOfDivisions, removeStartPoint: false, removeEndPoint: false })
                : this.edgesService.divideEdgeByParamsToPoints({ shape: shape, nrOfDivisions, removeStartPoint: false, removeEndPoint: false });
        }
        return divideByEqualDistance
            ? this.divideWireByEqualDistanceToPoints({ shape: shape, nrOfDivisions, removeStartPoint: false, removeEndPoint: false })
            : this.divideWireByParamsToPoints({ shape: shape, nrOfDivisions, removeStartPoint: false, removeEndPoint: false });
    }

    private createWireFromPointsByType(points: Base.Point3[], wireType?: Inputs.OCCT.wireFromPointsTypeEnum, closed?: boolean, tolerance?: number): TopoDS_Wire {
        const isClosed = closed ?? false;
        if (wireType === Inputs.OCCT.wireFromPointsTypeEnum.interpolated) {
            return this.interpolatePoints({ points, periodic: isClosed, tolerance: tolerance ?? 1e-7 });
        }
        return isClosed ? this.createPolygonWire({ points }) : this.createPolylineWire({ points });
    }

    getWireCenterOfMass(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): Base.Point3 {
        return this.geomService.getLinearCenterOfMass(inputs);
    }

    hexagonsInGrid(inputs: Resolved.OCCT.HexagonsInGridDto): TopoDS_Wire[] {
        const hex = this.base.point.hexGridScaledToFit({ ...inputs, centerGrid: true, pointsOnGround: true });

        let currentScalePatternWidthIndex = 0;
        let currentScalePatternHeightIndex = 0;
        let currentInclusionPatternIndex = 0;
        let currentFilletPatternIndex = 0;

        const nrHexagonsInHeight = inputs.nrHexagonsInHeight;
        const nrHexagonsInWidth = inputs.nrHexagonsInWidth;
        const counts: number[] = [];
        const corners: number[] = [];
        const placements: number[] = [];

        for (let i = 0; i < nrHexagonsInHeight; i++) {
            for (let j = 0; j < nrHexagonsInWidth; j++) {

                let scaleFromPatternWidth = 1;
                if (inputs.scalePatternWidth && inputs.scalePatternWidth.length > 0) {
                    scaleFromPatternWidth = inputs.scalePatternWidth[currentScalePatternWidthIndex] ?? 1;
                    currentScalePatternWidthIndex++;
                    if (currentScalePatternWidthIndex >= inputs.scalePatternWidth.length) {
                        currentScalePatternWidthIndex = 0;
                    }
                }

                let scaleFromPatternHeight = 1;
                if (inputs.scalePatternHeight && inputs.scalePatternHeight.length > 0) {
                    scaleFromPatternHeight = inputs.scalePatternHeight[currentScalePatternHeightIndex] ?? 1;
                    currentScalePatternHeightIndex++;
                    if (currentScalePatternHeightIndex >= inputs.scalePatternHeight.length) {
                        currentScalePatternHeightIndex = 0;
                    }
                }
                let include = true;
                if (inputs.inclusionPattern && inputs.inclusionPattern.length > 0) {
                    include = inputs.inclusionPattern[currentInclusionPatternIndex] ?? true;
                    currentInclusionPatternIndex++;
                    if (currentInclusionPatternIndex >= inputs.inclusionPattern.length) {
                        currentInclusionPatternIndex = 0;
                    }
                }

                let fillet = 0;
                if (inputs.filletPattern && inputs.filletPattern.length > 0) {
                    fillet = inputs.filletPattern[currentFilletPatternIndex] ?? 0;
                    currentFilletPatternIndex++;
                    if (currentFilletPatternIndex >= inputs.filletPattern.length) {
                        currentFilletPatternIndex = 0;
                    }
                }

                if (include && scaleFromPatternWidth > 0 && scaleFromPatternHeight > 0) {
                    const hexagon = hex.hexagons[i * nrHexagonsInWidth + j]!;
                    const center = hex.centers[i * nrHexagonsInWidth + j]!;
                    counts.push(hexagon.length);
                    corners.push(...hexagon.flatMap(point => [point[0] - center[0], point[2] - center[2]]));
                    placements.push(Math.max((hex.maxFilletRadius ?? 0) * fillet, 0), scaleFromPatternWidth, scaleFromPatternHeight, center[0], center[2]);
                }
            }
        }
        const origin = this.entitiesService.gpPnt([0, 0, 0]);
        const normal = this.entitiesService.gpDir([0, -1, 0]);
        const xDirection = this.entitiesService.gpDir([1, 0, 0]);
        const wires = this.occ.OutlinesOnPlane(origin, normal, xDirection, counts, corners, placements);
        origin.delete();
        normal.delete();
        xDirection.delete();
        if (wires === null) {
            throw occtFailure("occt.fillet.failed");
        }
        return wires;
    }

    createWireFromEdge(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>): TopoDS_Wire {
        const makeWire = new this.occ.BRepBuilderAPI_MakeWire(inputs.shape);
        const wire = makeWire.Wire();
        makeWire.delete();
        return wire;
    }

    createBSpline(inputs: Resolved.OCCT.BSplineDto): TopoDS_Wire {
        const points = checkedPoints(inputs.points, "points");
        if (points.length < 2) {
            throw new InputError(`A spline needs at least two points, and \`points\` has ${points.length}.`, "points");
        }
        const coords = new this.occ.VectorDouble();
        try {
            [...points, ...(inputs.closed ? [points[0]!] : [])].forEach(pt => {
                coords.push_back(pt[0]);
                coords.push_back(pt[1]);
                coords.push_back(pt[2]);
            });
            const edge = withKernelErrorsRead(this.occ, () => this.occ.MakeApproxBSplineEdge(coords, 3, 8, 1.0e-3));
            try {
                const wireMaker = new this.occ.BRepBuilderAPI_MakeWire(edge);
                try {
                    return wireMaker.Wire();
                } finally {
                    wireMaker.delete();
                }
            } finally {
                edge.delete();
            }
        } finally {
            coords.delete();
        }
    }

    createBezier(inputs: Resolved.OCCT.BezierDto): TopoDS_Wire {
        const periodic = inputs.periodic === true;
        const totalControlPoints = inputs.points.length + (inputs.closed && !periodic ? 1 : 0);
        this.checkedControlPoints(inputs.points, totalControlPoints);
        const useBoundedDegree = inputs.degree !== undefined || totalControlPoints - 1 > 25;

        const coords = new this.occ.VectorDouble();
        for (const pt of inputs.points) {
            coords.push_back(pt[0]);
            coords.push_back(pt[1]);
            coords.push_back(pt[2]);
        }
        if (inputs.closed && !periodic) {
            coords.push_back(inputs.points[0]![0]);
            coords.push_back(inputs.points[0]![1]);
            coords.push_back(inputs.points[0]![2]);
        }

        let wire: TopoDS_Wire | undefined;
        if (periodic) {
            const degree = inputs.degree ?? Math.min(3, inputs.points.length - 1);
            const edge = this.occ.MakeBSplineEdgeFromPolesPeriodic(coords, degree);
            if (!edge.IsNull()) {
                const wireMaker = new this.occ.BRepBuilderAPI_MakeWire(edge);
                wire = wireMaker.Wire();
                wireMaker.delete();
            }
            edge.delete();
        } else if (useBoundedDegree) {
            const degree = inputs.degree ?? Math.min(25, totalControlPoints - 1);
            const edge = this.occ.MakeBSplineEdgeFromPoles(coords, degree);
            if (!edge.IsNull()) {
                const wireMaker = new this.occ.BRepBuilderAPI_MakeWire(edge);
                wire = wireMaker.Wire();
                wireMaker.delete();
            }
            edge.delete();
        } else {
            wire = this.occ.MakeBezierWire(coords);
        }

        coords.delete();
        if (!wire || wire.IsNull()) {
            wire?.delete();
            throw new Error("Failed to create the Bezier wire");
        }
        return wire;
    }

    createBezierWeights(inputs: Resolved.OCCT.BezierWeightsDto): TopoDS_Wire {
        const periodic = inputs.periodic === true;
        if (periodic) {
            if (inputs.points.length !== inputs.weights.length) {
                throw new Error("Number of points and weights must be the same when bezier is periodic.");
            }
        } else if (!inputs.closed && inputs.points.length !== inputs.weights.length) {
            throw new Error("Number of points and weights must be the same when bezier is not closed.");
        } else if (!periodic && inputs.closed && inputs.points.length !== inputs.weights.length - 1) {
            throw new Error("Number of points must be one less than number of weights when bezier is closed.");
        }
        this.checkedControlPoints(inputs.points, inputs.points.length + (inputs.closed && !periodic ? 1 : 0));

        const coords = new this.occ.VectorDouble();
        for (const pt of inputs.points) {
            coords.push_back(pt[0]);
            coords.push_back(pt[1]);
            coords.push_back(pt[2]);
        }
        if (inputs.closed && !periodic) {
            coords.push_back(inputs.points[0]![0]);
            coords.push_back(inputs.points[0]![1]);
            coords.push_back(inputs.points[0]![2]);
        }

        const weights = new this.occ.VectorDouble();
        for (const w of inputs.weights) {
            weights.push_back(w);
        }

        let wire: TopoDS_Wire | undefined;
        if (periodic) {
            const degree = inputs.degree ?? Math.min(3, inputs.points.length - 1);
            const edge = this.occ.MakeWeightedBSplineEdgeFromPolesPeriodic(coords, weights, degree);
            if (!edge.IsNull()) {
                const wireMaker = new this.occ.BRepBuilderAPI_MakeWire(edge);
                wire = wireMaker.Wire();
                wireMaker.delete();
            }
            edge.delete();
        } else {
            wire = this.occ.MakeWeightedBezierWire(coords, weights);
        }
        coords.delete();
        weights.delete();
        if (!wire || wire.IsNull()) {
            wire?.delete();
            throw new Error("Failed to create the Bezier wire");
        }
        return wire;
    }

    addEdgesAndWiresToWire(inputs: Inputs.OCCT.ShapeShapesDto<TopoDS_Wire, TopoDS_Wire | TopoDS_Edge>): TopoDS_Wire {
        checkedShapes(inputs.shapes);
        const makeWire = new this.occ.BRepBuilderAPI_MakeWire();
        return released([makeWire], () => {
            makeWire.AddWire(inputs.shape);
            inputs.shapes.forEach((shape) => {
                if (shape.ShapeType() === this.occ.TopAbs_ShapeEnum.EDGE) {
                    makeWire.AddEdge(shape);
                } else if (shape.ShapeType() === this.occ.TopAbs_ShapeEnum.WIRE) {
                    makeWire.AddWire(shape);
                }
            });
            if (!makeWire.IsDone()) {
                throw new InputError("Wire could not be constructed. Check if edges and wires do not have disconnected elements.", "shapes");
            }
            return makeWire.Wire();
        });
    }

    startPointOnWire(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): Base.Point3 {
        return this.geomService.pointsAtNormalizedParameters(inputs.shape, [0])[0]!;
    }

    midPointOnWire(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): Base.Point3 {
        return this.geomService.pointsAtNormalizedParameters(inputs.shape, [0.5])[0]!;
    }

    endPointOnWire(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): Base.Point3 {
        return this.geomService.pointsAtNormalizedParameters(inputs.shape, [1])[0]!;
    }

    textWires(inputs: Resolved.OCCT.TextWiresDto): TopoDS_Wire[] {
        const lines = this.base.textService.vectorText(inputs);
        const wires: TopoDS_Wire[] = [];
        return releasedOnError(wires, () => {
            lines.forEach((line) => {
                line.chars.forEach((char) => {
                    char.paths.forEach(polyline => {
                        wires.push(this.strokeWire(polyline, inputs.height));
                    });
                });
            });
            return wires;
        });
    }

    private strokeWire(points: Base.Point3[], height: number): TopoDS_Wire {
        try {
            return this.createPolylineWire({ points });
        } catch (error) {
            if (error instanceof InputError && error.property === "points") {
                throw new InputError(`\`height\` is ${height}, too small to tell the points of the letters apart.`, "height");
            }
            throw error;
        }
    }

    textWiresWithData(inputs: Inputs.OCCT.TextWiresDto): ObjectDefinition<TextWiresDataDto<string>, TopoDS_Shape> {
        const resolved = resolveDto(Inputs.OCCT.TextWiresDto, inputs) as Resolved.OCCT.TextWiresDto;
        const lines = this.base.textService.vectorText(resolved);
        const wires: TopoDS_Wire[] = [];
        const compounds: TopoDS_Compound[] = [];
        return releasedOnError(compounds, () => released(wires, () => {
            const characterCompounds: { id: string, shape: TopoDS_Compound }[] = [];

            lines.forEach((line) => {
                line.chars.forEach((char, index) => {
                    const characterWires: TopoDS_Wire[] = [];
                    char.paths.forEach(polyline => {
                        const wire = this.strokeWire(polyline, resolved.height);
                        wires.push(wire);
                        characterWires.push(wire);
                    });
                    const characterCompound = this.converterService.makeCompound({ shapes: characterWires });
                    compounds.push(characterCompound);
                    characterCompounds.push({ id: `char-${index}`, shape: characterCompound });
                });
            });

            const compound = this.converterService.makeCompound({ shapes: wires });
            compounds.push(compound);
            const dataRes = new TextWiresDataDto<string>();

            const box = this.operationsService.boundingBoxOfShape({ shape: compound });
            dataRes.width = box.size[0];
            dataRes.height = box.size[2];
            dataRes.center = box.center;
            dataRes.compound = "text-compound";
            dataRes.characters = characterCompounds.map(c => ({ id: c.id, shapes: { compound: c.id } }));

            const res = new ObjectDefinition<TextWiresDataDto<string>, TopoDS_Compound>();
            res.data = dataRes;
            res.compound = compound;
            res.shapes = [{ id: "text-compound", shape: compound }, ...characterCompounds];

            return res;
        }));
    }

    private snappedToEdgeEnds(edge: TopoDS_Edge, parameter: number, point: Base.Point3): number {
        const { first, last } = this.edgeParameterRange(edge);
        const end = [first, last].find(candidate => {
            const evaluated = this.occ.EvaluateEdgeCurve(edge, candidate);
            const onCurve = evaluated.Point;
            const near = this.samePoint([onCurve.X(), onCurve.Y(), onCurve.Z()], point);
            onCurve.delete();
            evaluated.delete();
            return near;
        });
        return end ?? parameter;
    }

    private edgeParameterRange(edge: TopoDS_Edge): { first: number, last: number } {
        const result = this.occ.BRep_Tool_GetEdgeParameters(edge);
        return result.IsValid ? { first: result.First, last: result.Last } : { first: 0, last: 0 };
    }

    placeWire(wire: TopoDS_Wire, surface: Geom_Surface): TopoDS_Wire {
        const edges = this.shapeGettersService.getEdges({ shape: wire });
        const newEdges: TopoDS_Edge[] = [];
        return released(edges.filter(edge => edge !== wire), () => released(newEdges, () => {
            edges.forEach(edge => {
                const placed = this.edgePlacedOnSurface(edge, surface);
                if (placed !== undefined) {
                    newEdges.push(placed);
                }
            });
            return this.converterService.combineEdgesAndWiresIntoAWire({ shapes: newEdges });
        }));
    }

    private edgePlacedOnSurface(edge: TopoDS_Edge, surface: Geom_Surface): TopoDS_Edge | undefined {
        const { first, last } = this.edgeParameterRange(edge);
        const { own, releaseAll } = kernelObjects();
        try {
            const curve = own(this.occ.GetEdgeCurve(edge));
            if (curve.IsNull()) {
                return undefined;
            }
            const plane = own(this.entitiesService.gpPln([0, 0, 0], [0, 1, 0]));
            const flat = own(this.occ.GeomAPI_To2d(curve, plane));
            return this.edgesService.makeEdgeFromGeom2dCurveAndSurfaceBounded({ curve: flat, surface }, first, last);
        } finally {
            releaseAll();
        }
    }

    wiresToPoints(inputs: Resolved.OCCT.WiresToPointsDto<TopoDS_Shape>): Inputs.Base.Point3[][] {
        const wires = this.shapeGettersService.getWires({ shape: inputs.shape });
        return released(wires, () => wires.map(w => {
            const edgePoints = this.edgesService.edgesToPoints({ ...inputs, shape: w });
            return this.base.point.removeConsecutiveDuplicates({ points: edgePoints.flat(), checkFirstAndLast: false, tolerance: SAME_POINT_TOLERANCE });
        }));
    }

    createHelixWire(inputs: Resolved.OCCT.HelixWireDto): TopoDS_Wire {
        const radius = checkedWithin(inputs.radius, "radius", { above: 0 });
        const pitch = checkedWithin(inputs.pitch, "pitch", { above: 0 });
        const height = checkedWithin(inputs.height, "height", { above: 0 });
        const ax = this.entitiesService.gpAx3_4(inputs.center, checkedDirection(inputs.direction, "direction"));
        try {
            return this.occ.MakeHelixWire(ax, radius, pitch, height, inputs.clockwise, inputs.tolerance);
        } finally {
            ax.delete();
        }
    }

    createHelixWireByTurns(inputs: Resolved.OCCT.HelixWireByTurnsDto): TopoDS_Wire {
        const radius = checkedWithin(inputs.radius, "radius", { above: 0 });
        const pitch = checkedWithin(inputs.pitch, "pitch", { above: 0 });
        const numTurns = checkedWithin(inputs.numTurns, "numTurns", { above: 0 });
        const ax = this.entitiesService.gpAx3_4(inputs.center, checkedDirection(inputs.direction, "direction"));
        try {
            return this.occ.MakeHelixWireByTurns(ax, radius, pitch, numTurns, inputs.clockwise, inputs.tolerance);
        } finally {
            ax.delete();
        }
    }

    createTaperedHelixWire(inputs: Resolved.OCCT.TaperedHelixWireDto): TopoDS_Wire {
        const startRadius = checkedWithin(inputs.startRadius, "startRadius", { above: 0 });
        const endRadius = checkedWithin(inputs.endRadius, "endRadius", { above: 0 });
        const pitch = checkedWithin(inputs.pitch, "pitch", { above: 0 });
        const height = checkedWithin(inputs.height, "height", { above: 0 });
        const ax = this.entitiesService.gpAx3_4(inputs.center, checkedDirection(inputs.direction, "direction"));
        try {
            return this.occ.MakeTaperedHelixWire(ax, startRadius, endRadius, pitch, height, inputs.clockwise, inputs.tolerance);
        } finally {
            ax.delete();
        }
    }

    createFlatSpiralWire(inputs: Resolved.OCCT.FlatSpiralWireDto): TopoDS_Wire {
        const startRadius = checkedWithin(inputs.startRadius, "startRadius", { atLeast: 0 });
        const endRadius = checkedWithin(inputs.endRadius, "endRadius", { above: 0 });
        const numTurns = checkedWithin(inputs.numTurns, "numTurns", { above: 0 });
        const ax = this.entitiesService.gpAx3_4(inputs.center, checkedDirection(inputs.direction, "direction"));
        try {
            return this.occ.MakeFlatSpiralWire(ax, startRadius, endRadius, numTurns, inputs.clockwise, inputs.tolerance);
        } finally {
            ax.delete();
        }
    }
}
