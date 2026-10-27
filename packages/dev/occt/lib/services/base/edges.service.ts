import type { GccAna_Circ2d2TanRad, GccAna_Lin2d2Tan, GccEnt_QualifiedCirc, Geom2d_Curve, Geom_Surface, BitbybitOcctModule, Handle_Geom2d_Curve, Handle_Geom_Curve, TopoDS_Edge, TopoDS_Shape, TopoDS_Wire, gp_Circ, gp_Circ2d } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../../api/inputs";
import type { Base } from "../../api/inputs";
import type { BaseBitByBit } from "@bitbybit-dev/base";
import { InputError } from "@bitbybit-dev/base";
import type { ConverterService } from "./converter.service";
import type { EntitiesService } from "./entities.service";
import type { ShapeGettersService } from "./shape-getters";
import type { EnumService } from "./enum.service";
import type { GeomService } from "./geom.service";
import type { TransformsService } from "./transforms.service";
import type * as Resolved from "../../api/resolved-inputs";
import { checkedDirection, checkedPoints, checkedShape, checkedShapes } from "./input-checks";
import { kernelObjects, madeFromEach, release, released, releasedOnError } from "./release";
import { readKernelException } from "../../kernel-exception";
import { withKernelErrorsRead, withKernelRefusals } from "./kernel-refusals";
import { distance3 } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/vectors";

const SAME_POINT_TOLERANCE = 1e-7;
const FEWEST_POINTS_OF_A_CLOSED_SPLINE = 3;
const NOT_A_CIRCLE = /^(?:std::bad_variant_access|Standard_NoSuchObject)\b/;

export class EdgesService {

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly shapeGettersService: ShapeGettersService,
        private readonly entitiesService: EntitiesService,
        private readonly converterService: ConverterService,
        private readonly enumService: EnumService,
        private readonly geomService: GeomService,
        private readonly transformsService: TransformsService,
        private readonly base: BaseBitByBit
    ) { }

    getCornerPointsOfEdgesForShape(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Inputs.Base.Point3[] {
        const edges = this.shapeGettersService.getEdges(inputs);
        let points: Inputs.Base.Point3[] = [];
        edges.forEach((edge) => {
            const crvHandle = this.occ.GetEdgeCurve(edge);
            try {
                if (crvHandle && !crvHandle.IsNull()) {
                    const edgeParams = this.occ.BRep_Tool_GetEdgeParameters(edge);
                    if (edgeParams.IsValid) {
                        const pt1g = this.pointOnCurve(crvHandle, edgeParams.First);
                        const pt2g = this.pointOnCurve(crvHandle, edgeParams.Last);
                        points.push(pt1g);
                        points.push(pt2g);
                    }
                }
            } catch (ex) {
                console.log(readKernelException(this.occ, ex));
            } finally {
                crvHandle?.delete();
                if (edge !== inputs.shape) {
                    edge.delete();
                }
            }
        });
        if (points.length > 0) {
            points = this.base.vector.removeAllDuplicateVectors({ vectors: points }) as Inputs.Base.Point3[];
        }
        return points;
    }

    private pointOnCurve(curve: Handle_Geom_Curve, param: number): Inputs.Base.Point3 {
        const point = curve.Value(param);
        return released([point], () => [point.X(), point.Y(), point.Z()]);
    }

    getCircularEdgesAlongWire(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): TopoDS_Edge[] {
        return this.edgesAlongWireThat(inputs, edge => this.isEdgeCircular({ shape: edge }));
    }

    getLinearEdgesAlongWire(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): TopoDS_Edge[] {
        return this.edgesAlongWireThat(inputs, edge => this.isEdgeLinear({ shape: edge }));
    }

    private edgesAlongWireThat(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>, keep: (edge: TopoDS_Edge) => boolean): TopoDS_Edge[] {
        const edges = this.getEdgesAlongWire(inputs);
        const made = edges.filter(edge => edge !== inputs.shape);
        const kept = releasedOnError(made, () => edges.filter(keep));
        made.filter(edge => !kept.includes(edge)).forEach(edge => edge.delete());
        return kept;
    }

    getEdgesAlongWire(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): TopoDS_Edge[] {
        checkedShape(inputs.shape);
        if (this.enumService.getShapeTypeEnum(inputs.shape) === Inputs.OCCT.shapeTypeEnum.edge) {
            return [inputs.shape];
        }
        const edges = this.occ.EdgesAlongWire(inputs.shape);
        if (edges.length === 0) {
            throw new Error("Wire could not be constructed");
        }
        return edges;
    }

    fixEdgeOrientationsAlongWire(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): TopoDS_Wire {
        const edges = this.occ.EdgesAlongWire(inputs.shape);
        try {
            return this.converterService.combineEdgesAndWiresIntoAWire({ shapes: edges });
        } finally {
            edges.forEach(edge => edge.delete());
        }
    }

    arcThroughThreePoints(inputs: Resolved.OCCT.ArcEdgeThreePointsDto): TopoDS_Edge {
        const points = madeFromEach([inputs.start, inputs.middle, inputs.end], point => this.entitiesService.gpPnt(point));
        const arc = released(points, () => withKernelErrorsRead(this.occ, () => this.occ.MakeArcThrough3Points(points[0]!, points[1]!, points[2]!)));
        if (arc.IsNull()) {
            arc.delete();
            throw new InputError("`start`, `middle` and `end` lie on one line, or two of them are the same point, so no arc passes through all three.", "middle");
        }
        return arc;
    }

    arcThroughTwoPointsAndTangent(inputs: Resolved.OCCT.ArcEdgeTwoPointsTangentDto): TopoDS_Edge {
        const tangent = checkedDirection(inputs.tangentVec, "tangentVec");
        if (distance3(inputs.start, inputs.end) <= SAME_POINT_TOLERANCE) {
            throw new InputError("`start` and `end` are the same point, so there is no arc between them.", "end");
        }
        const gpPnt1 = this.entitiesService.gpPnt(inputs.start);
        const gpVec = this.entitiesService.gpVec(tangent);
        const gpPnt2 = this.entitiesService.gpPnt(inputs.end);
        const arc = released([gpPnt1, gpVec, gpPnt2], () => withKernelErrorsRead(this.occ, () => this.occ.MakeArcWithTangent(gpPnt1, gpVec, gpPnt2)));
        if (arc.IsNull() || !Number.isFinite(releasedOnError([arc], () => this.geomService.lengthsAndCentres([arc])[0]!.mass))) {
            arc.delete();
            throw new InputError("`tangentVec` runs along the line from `start` to `end`, so no arc leaves `start` that way and reaches `end`.", "tangentVec");
        }
        return arc;
    }

    arcFromCircleAndTwoAngles(inputs: Resolved.OCCT.ArcEdgeCircleTwoAnglesDto<TopoDS_Edge>) {
        const circle = this.getGpCircleFromEdge({ shape: inputs.circle }, "circle");
        const radAlpha1 = this.base.math.degToRad({ number: inputs.alphaAngle1 });
        const radAlpha2 = this.base.math.degToRad({ number: inputs.alphaAngle2 });
        return released([circle], () => withKernelErrorsRead(this.occ, () => this.occ.MakeArcOnCircleByAngles(circle, radAlpha1, radAlpha2, inputs.sense)));
    }

    arcFromCirclePointAndAngle(inputs: Resolved.OCCT.ArcEdgeCirclePointAngleDto<TopoDS_Edge>): TopoDS_Edge {
        const circle = this.getGpCircleFromEdge({ shape: inputs.circle }, "circle");
        const radAlpha = this.base.math.degToRad({ number: inputs.alphaAngle });
        const point = releasedOnError([circle], () => this.entitiesService.gpPnt(inputs.point));
        return released([circle, point], () => withKernelErrorsRead(this.occ, () => this.occ.MakeArcOnCircleByAngle(circle, point, radAlpha, inputs.sense)));
    }

    lineEdge(inputs: Resolved.OCCT.LineDto) {
        const gpPnt1 = this.entitiesService.gpPnt(inputs.start);
        const gpPnt2 = this.entitiesService.gpPnt(inputs.end);
        try {
            return withKernelErrorsRead(this.occ, () => this.occ.MakeLineEdgeBetweenPoints(gpPnt1, gpPnt2));
        } finally {
            gpPnt1.delete();
            gpPnt2.delete();
        }
    }

    getEdgeLength(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>) {
        return this.occ.GetEdgeLength(inputs.shape);
    }

    getEdgeLengthsOfShape(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): number[] {
        const edgesOnShape = this.shapeGettersService.getEdges({ shape: inputs.shape });
        const lengths = this.geomService.lengthsAndCentres(edgesOnShape).map(properties => properties.mass);
        if (edgesOnShape[0] !== inputs.shape) {
            edgesOnShape.forEach(edge => edge.delete());
        }
        return lengths;
    }

    getEdgesLengths(inputs: Inputs.OCCT.ShapesDto<TopoDS_Edge>): number[] {
        checkedShapes(inputs.shapes);
        if (inputs.shapes === undefined) {
            throw (Error(("Shapes are not defined")));
        }
        return this.geomService.lengthsAndCentres(inputs.shapes).map(properties => properties.mass);
    }

    getEdgesCentersOfMass(inputs: Inputs.OCCT.ShapesDto<TopoDS_Edge>): Base.Point3[] {
        checkedShapes(inputs.shapes);
        if (inputs.shapes === undefined) {
            throw (Error(("Shapes are not defined")));
        }
        return this.geomService.lengthsAndCentres(inputs.shapes).map(properties => properties.centre);
    }

    edgesToPoints(inputs: Resolved.OCCT.EdgesToPointsDto<TopoDS_Shape>): Inputs.Base.Point3[][] {
        const shapeType = this.enumService.getShapeTypeEnum(inputs.shape);
        let edges: TopoDS_Shape[];
        if (shapeType === Inputs.OCCT.shapeTypeEnum.edge) {
            edges = [inputs.shape];
        } else if (shapeType === Inputs.OCCT.shapeTypeEnum.wire) {
            edges = this.getEdgesAlongWire({ shape: inputs.shape });
        } else {
            edges = this.shapeGettersService.getEdges({ shape: inputs.shape });
        }
        try {
            return edges.map(edge => this.edgeToPoints({ ...inputs, shape: edge }));
        } finally {
            edges.filter(edge => edge !== inputs.shape).forEach(edge => edge.delete());
        }
    }

    startPointOnEdge(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>): Base.Point3 {
        return this.pointOnEdgeAt(inputs.shape, 0);
    }

    endPointOnEdge(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>): Base.Point3 {
        return this.pointOnEdgeAt(inputs.shape, 1);
    }

    private pointOnEdgeAt(shape: TopoDS_Edge, param: number): Base.Point3 {
        if (shape.ShapeType() !== this.occ.TopAbs_ShapeEnum.EDGE) {
            return this.pointAlong(shape, param);
        }
        const edge = this.occ.CastToEdge(shape);
        return released([edge], () => this.occ.BRep_Tool_Degenerated(edge) ? this.pointOfDegenerateEdge(edge) : this.pointAlong(edge, param));
    }

    private pointAlong(shape: TopoDS_Edge | TopoDS_Wire, param: number): Base.Point3 {
        const wire = this.converterService.combineEdgesAndWiresIntoAWire({ shapes: [shape] });
        return released([wire], () => {
            const curve = new this.occ.BRepAdaptor_CompCurve(wire, false);
            return released([curve], () => this.geomService.pointOnCurveAtParam({ shape: curve, param }));
        });
    }

    private isDegenerateEdge(shape: TopoDS_Shape): boolean {
        if (shape.ShapeType() !== this.occ.TopAbs_ShapeEnum.EDGE) {
            return false;
        }
        const edge = this.occ.CastToEdge(shape);
        return released([edge], () => this.occ.BRep_Tool_Degenerated(edge));
    }

    private pointOfDegenerateEdge(edge: TopoDS_Edge): Base.Point3 {
        const vertices = this.shapeGettersService.getVertices({ shape: edge });
        return released(vertices, () => this.converterService.vertexToPoint({ shape: vertices[0]! }));
    }

    edgeToPoints(inputs: Resolved.OCCT.EdgesToPointsDto<TopoDS_Edge>): Inputs.Base.Point3[] {
        const edgePoints: Base.Point3[] = [];
        const aLocation = new this.occ.TopLoc_Location();
        const adaptorCurve = new this.occ.BRepAdaptor_Curve(inputs.shape);
        const tangDef = new this.occ.GCPnts_TangentialDeflection(
            adaptorCurve,
            inputs.angularDeflection,
            inputs.curvatureDeflection,
            inputs.minimumOfPoints,
            inputs.uTolerance,
            inputs.minimumLength
        );
        const nrPoints = tangDef.NbPoints();
        const tangDefValues = [];
        for (let j = 0; j < nrPoints; j++) {
            const tangDefVal = tangDef.Value(j + 1);
            edgePoints.push([
                tangDefVal.X(),
                tangDefVal.Y(),
                tangDefVal.Z()
            ] as Base.Point3);
            tangDefValues.push(tangDefVal);
        }
        tangDefValues.forEach(v => v.delete());
        aLocation.delete();
        adaptorCurve.delete();
        tangDef.delete();
        
        if (edgePoints.length > 1) {
            const edgeStart = this.startPointOnEdge({ shape: inputs.shape });
            const tessStart = edgePoints[0]!;
            const tessEnd = edgePoints[edgePoints.length - 1]!;
            
            const distStartToStart = this.base.point.distance({ startPoint: tessStart, endPoint: edgeStart });
            const distEndToStart = this.base.point.distance({ startPoint: tessEnd, endPoint: edgeStart });
            
            if (distEndToStart < distStartToStart) {
                edgePoints.reverse();
            }
        }
        
        return edgePoints;
    }

    makeEdgeFromGeom2dCurveAndSurfaceBounded(inputs: Inputs.OCCT.CurveAndSurfaceDto<Geom2d_Curve, Geom_Surface>, umin: number, umax: number): TopoDS_Edge {
        return this.occ.MakeEdgeFromGeom2dCurveAndSurfaceBounded(inputs.curve as Handle_Geom2d_Curve, inputs.surface, umin, umax);
    }

    makeEdgeFromGeom2dCurveAndSurface(inputs: Inputs.OCCT.CurveAndSurfaceDto<Geom2d_Curve, Geom_Surface>): TopoDS_Edge {
        return this.occ.MakeEdgeFromGeom2dCurveAndSurface(inputs.curve as Handle_Geom2d_Curve, inputs.surface);
    }

    constraintTanLinesFromTwoPtsToCircle(inputs: Resolved.OCCT.ConstraintTanLinesFromTwoPtsToCircleDto<TopoDS_Edge>): TopoDS_Shape[] {
        const cirDir = this.getCircularEdgePlaneDirection({ shape: inputs.circle }, "circle");
        const cirPos = this.getCircularEdgeCenterPoint({ shape: inputs.circle }, "circle");
        const { own, releaseAll } = kernelObjects();
        const made: TopoDS_Shape[] = [];
        try {
            const circleInPlane = own(this.intoCirclePlane(inputs.circle, cirDir, cirPos));
            const pt1Aligned = this.pointInCirclePlane(inputs.point1, cirDir, cirPos);
            const pt2Aligned = this.pointInCirclePlane(inputs.point2, cirDir, cirPos);
            const qCircle = own(this.qualifiedCircle(circleInPlane, "circle"));
            const solutions1 = this.tangentLinesFrom(qCircle, pt1Aligned, inputs.tolerance, cirDir, cirPos);
            made.push(...solutions1);
            const solutions2 = this.tangentLinesFrom(qCircle, pt2Aligned, inputs.tolerance, cirDir, cirPos);
            made.push(...solutions2);

            let resultingSol: TopoDS_Shape[];
            if (inputs.positionResult === Inputs.OCCT.positionResultEnum.keepSide1) {
                resultingSol = [this.tangentOnSide(solutions1, 1, "point1"), this.tangentOnSide(solutions2, 0, "point2")];
            } else if (inputs.positionResult === Inputs.OCCT.positionResultEnum.keepSide2) {
                resultingSol = [this.tangentOnSide(solutions1, 0, "point1"), this.tangentOnSide(solutions2, 1, "point2")];
            } else {
                resultingSol = [...solutions1, ...solutions2];
            }
            made.filter(solution => !resultingSol.includes(solution)).forEach(release);

            if (resultingSol.length === 2 && inputs.circleRemainder !== Inputs.OCCT.circleInclusionEnum.none) {
                let startPoint: Base.Point3 | undefined;
                let endPoint: Base.Point3 | undefined;
                if (inputs.positionResult === Inputs.OCCT.positionResultEnum.keepSide2) {
                    if (inputs.circleRemainder === Inputs.OCCT.circleInclusionEnum.keepSide1) {
                        startPoint = this.startPointOnEdge({ shape: resultingSol[1]! });
                        endPoint = this.startPointOnEdge({ shape: resultingSol[0]! });
                    } else if (inputs.circleRemainder === Inputs.OCCT.circleInclusionEnum.keepSide2) {
                        startPoint = this.startPointOnEdge({ shape: resultingSol[0]! });
                        endPoint = this.startPointOnEdge({ shape: resultingSol[1]! });
                    }
                } else if (inputs.positionResult === Inputs.OCCT.positionResultEnum.keepSide1) {
                    if (inputs.circleRemainder === Inputs.OCCT.circleInclusionEnum.keepSide1) {
                        startPoint = this.startPointOnEdge({ shape: resultingSol[0]! });
                        endPoint = this.startPointOnEdge({ shape: resultingSol[1]! });
                    } else if (inputs.circleRemainder === Inputs.OCCT.circleInclusionEnum.keepSide2) {
                        startPoint = this.startPointOnEdge({ shape: resultingSol[1]! });
                        endPoint = this.startPointOnEdge({ shape: resultingSol[0]! });
                    }
                }

                if (!startPoint || !endPoint) {
                    throw this.unresolvedRemainder(solutions1.length === 0 ? "point1" : solutions2.length === 0 ? "point2" : undefined);
                }
                const edge = this.arcFromCircleAndTwoPoints({ circle: inputs.circle, start: startPoint, end: endPoint, sense: true });
                resultingSol.splice(1, 0, edge);
            }

            return resultingSol;
        } catch (error) {
            made.forEach(release);
            throw readKernelException(this.occ, error);
        } finally {
            releaseAll();
        }
    }

    private unresolvedRemainder(inside: string | undefined): Error {
        return inside === undefined
            ? new Error("Circle remainder could not be resolved for the given position result")
            : new InputError(`\`${inside}\` lies inside the circle, so no tangent line from it exists to end the arc \`circleRemainder\` keeps.`, inside);
    }

    constraintTanLinesFromPtToCircle(inputs: Resolved.OCCT.ConstraintTanLinesFromPtToCircleDto<TopoDS_Edge>): TopoDS_Shape[] {
        const cirDir = this.getCircularEdgePlaneDirection({ shape: inputs.circle }, "circle");
        const cirPos = this.getCircularEdgeCenterPoint({ shape: inputs.circle }, "circle");
        const { own, releaseAll } = kernelObjects();
        const made: TopoDS_Shape[] = [];
        try {
            const circleInPlane = own(this.intoCirclePlane(inputs.circle, cirDir, cirPos));
            const ptAligned = this.pointInCirclePlane(inputs.point, cirDir, cirPos);
            const qCircle = own(this.qualifiedCircle(circleInPlane, "circle"));
            const solutions = this.tangentLinesFrom(qCircle, ptAligned, inputs.tolerance, cirDir, cirPos);
            made.push(...solutions);

            let resultingSol: TopoDS_Shape[];
            if (inputs.positionResult === Inputs.OCCT.positionResultEnum.keepSide1) {
                resultingSol = [this.tangentOnSide(solutions, 0, "point")];
            } else if (inputs.positionResult === Inputs.OCCT.positionResultEnum.keepSide2) {
                resultingSol = [this.tangentOnSide(solutions, 1, "point")];
            } else {
                resultingSol = [...solutions];
            }
            made.filter(solution => !resultingSol.includes(solution)).forEach(release);

            if (resultingSol.length === 2 && inputs.circleRemainder !== Inputs.OCCT.circleInclusionEnum.none) {
                let startPoint: Base.Point3 | undefined;
                let endPoint: Base.Point3 | undefined;
                if (inputs.circleRemainder === Inputs.OCCT.circleInclusionEnum.keepSide1) {
                    startPoint = this.startPointOnEdge({ shape: resultingSol[1]! });
                    endPoint = this.startPointOnEdge({ shape: resultingSol[0]! });
                } else if (inputs.circleRemainder === Inputs.OCCT.circleInclusionEnum.keepSide2) {
                    startPoint = this.startPointOnEdge({ shape: resultingSol[0]! });
                    endPoint = this.startPointOnEdge({ shape: resultingSol[1]! });
                }
                if (!startPoint || !endPoint) {
                    throw new Error("Circle remainder could not be resolved for the given position result");
                }
                const edge = this.arcFromCircleAndTwoPoints({ circle: inputs.circle, start: startPoint, end: endPoint, sense: true });
                resultingSol.splice(1, 0, edge);
            }

            return resultingSol;
        } catch (error) {
            made.forEach(release);
            throw readKernelException(this.occ, error);
        } finally {
            releaseAll();
        }
    }

    private intoCirclePlane(shape: TopoDS_Shape, cirDir: Base.Vector3, cirPos: Base.Point3): TopoDS_Shape {
        return this.transformsService.align({ shape, fromOrigin: cirPos, fromDirection: cirDir, toOrigin: [0, 0, 0], toDirection: [0, 0, 1] });
    }

    private outOfCirclePlane(shape: TopoDS_Shape, cirDir: Base.Vector3, cirPos: Base.Point3): TopoDS_Shape {
        return this.transformsService.align({ shape, fromOrigin: [0, 0, 0], fromDirection: [0, 0, 1], toOrigin: cirPos, toDirection: cirDir });
    }

    private pointInCirclePlane(point: Base.Point3, cirDir: Base.Vector3, cirPos: Base.Point3): Base.Point3 {
        const vertex = this.entitiesService.makeVertex(point);
        const aligned = released([vertex], () => this.intoCirclePlane(vertex, cirDir, cirPos));
        return released([aligned], () => this.converterService.vertexToPoint({ shape: aligned }));
    }

    private qualifiedCircle(circleInPlane: TopoDS_Shape, property: string): GccEnt_QualifiedCirc {
        const circle = this.getGpCircle2dFromEdge({ shape: circleInPlane }, property);
        return released([circle], () => new this.occ.GccEnt_QualifiedCirc(circle, this.enumService.getGccEntPositionFromEnum(Inputs.OCCT.gccEntPositionEnum.unqualified)));
    }

    private tangentLinesFrom(qCircle: GccEnt_QualifiedCirc, ptAligned: Base.Point3, tolerance: number, cirDir: Base.Vector3, cirPos: Base.Point3): TopoDS_Shape[] {
        const { own, releaseAll } = kernelObjects();
        const solutions: TopoDS_Shape[] = [];
        try {
            const pt2d = own(this.entitiesService.gpPnt2d([ptAligned[0], ptAligned[1]]));
            const lin = own(this.occ.GccAna_Lin2d2Tan_fromQualifiedCircAndPoint(qCircle, pt2d, tolerance));
            for (let i = 1; i <= lin.NbSolutions(); i++) {
                const sol = own(lin.ThisSolution(i));
                const location = own(sol.Location());
                const edgeLine = own(this.lineEdge({ start: [location.X(), location.Y(), 0], end: ptAligned }));
                solutions.push(this.outOfCirclePlane(edgeLine, cirDir, cirPos));
            }
            return solutions;
        } catch (error) {
            solutions.forEach(release);
            throw error;
        } finally {
            releaseAll();
        }
    }

    private tangentOnSide(solutions: readonly TopoDS_Shape[], index: number, property: string): TopoDS_Shape {
        const solution = solutions[index];
        if (solution === undefined) {
            throw new InputError(`\`${property}\` lies inside the circle, so no tangent line from it exists on the side \`positionResult\` keeps.`, property);
        }
        return solution;
    }

    constraintTanLinesOnTwoCircles(inputs: Resolved.OCCT.ConstraintTanLinesOnTwoCirclesDto<TopoDS_Edge>): TopoDS_Shape[] {
        const cirDir = this.getCircularEdgePlaneDirection({ shape: inputs.circle1 }, "circle1");
        const cirPos = this.getCircularEdgeCenterPoint({ shape: inputs.circle1 }, "circle1");
        const { own, releaseAll } = kernelObjects();
        const made: TopoDS_Shape[] = [];
        try {
            const qCircle1 = own(this.qualifiedCircle(own(this.intoCirclePlane(inputs.circle1, cirDir, cirPos)), "circle1"));
            const qCircle2 = own(this.qualifiedCircle(own(this.intoCirclePlane(inputs.circle2, cirDir, cirPos)), "circle2"));
            const startPoints = this.tangentLinePoints(own(this.occ.GccAna_Lin2d2Tan_fromTwoQualifiedCirc(qCircle1, qCircle2, inputs.tolerance)));
            const endPoints = this.pairedTangentLinePoints(this.tangentLinePoints(own(this.occ.GccAna_Lin2d2Tan_fromTwoQualifiedCirc(qCircle2, qCircle1, inputs.tolerance))));
            startPoints.forEach((startPoint, index) => {
                const endPoint = endPoints[index]!;
                if (distance3(startPoint, endPoint) <= SAME_POINT_TOLERANCE) {
                    throw new InputError("`circle2` touches `circle1` from inside, so the lines tangent to both have no length.", "circle2");
                }
                const edgeLine = own(this.lineEdge({ start: startPoint, end: endPoint }));
                made.push(this.outOfCirclePlane(edgeLine, cirDir, cirPos));
            });
            return this.tangentLinesWithRemainders(inputs, [...made], made);
        } catch (error) {
            made.forEach(release);
            throw readKernelException(this.occ, error);
        } finally {
            releaseAll();
        }
    }

    private tangentLinePoints(lines: GccAna_Lin2d2Tan): Base.Point3[] {
        const { own, releaseAll } = kernelObjects();
        try {
            return Array.from({ length: lines.NbSolutions() }, (_, index): Base.Point3 => {
                const location = own(own(lines.ThisSolution(index + 1)).Location());
                return [location.X(), location.Y(), 0];
            });
        } finally {
            releaseAll();
        }
    }

    private pairedTangentLinePoints(points: Base.Point3[]): Base.Point3[] {
        if (points.length === 4) {
            return [points[2]!, points[1]!, points[0]!, points[3]!];
        }
        if (points.length === 2) {
            return [points[1]!, points[0]!];
        }
        return [];
    }

    private tangentLinesWithRemainders(inputs: Resolved.OCCT.ConstraintTanLinesOnTwoCirclesDto<TopoDS_Edge>, solutions: TopoDS_Shape[], made: TopoDS_Shape[]): TopoDS_Shape[] {
        let resultingSol: TopoDS_Shape[];

        if (inputs.positionResult === Inputs.OCCT.positionResultEnum.all) {
            resultingSol = [...solutions];
        } else if (inputs.positionResult === Inputs.OCCT.positionResultEnum.keepSide1 && solutions.length === 4) {
            resultingSol = [solutions[1]!, solutions[3]!];
        } else if (inputs.positionResult === Inputs.OCCT.positionResultEnum.keepSide2 && solutions.length === 4) {
            resultingSol = [solutions[0]!, solutions[2]!];
        } else if (inputs.positionResult === Inputs.OCCT.positionResultEnum.keepSide1 && solutions.length === 2) {
            resultingSol = [];
        } else if (inputs.positionResult === Inputs.OCCT.positionResultEnum.keepSide2 && solutions.length === 2) {
            resultingSol = [solutions[0]!, solutions[1]!];
        } else {
            resultingSol = [...solutions];
        }
        solutions.filter(solution => !resultingSol.includes(solution)).forEach(release);

        if (resultingSol.length === 2 && inputs.circleRemainders !== Inputs.OCCT.twoCircleInclusionEnum.none) {
            let startPoint1: Base.Point3 | undefined;
            let startPoint2: Base.Point3 | undefined;
            let endPoint1: Base.Point3 | undefined;
            let endPoint2: Base.Point3 | undefined;
            if (inputs.circleRemainders === Inputs.OCCT.twoCircleInclusionEnum.outside) {
                if (inputs.positionResult === Inputs.OCCT.positionResultEnum.keepSide2 || inputs.positionResult === Inputs.OCCT.positionResultEnum.all) {
                    startPoint1 = this.startPointOnEdge({ shape: resultingSol[1]! });
                    startPoint2 = this.startPointOnEdge({ shape: resultingSol[0]! });
                } else if (inputs.positionResult === Inputs.OCCT.positionResultEnum.keepSide1) {
                    startPoint1 = this.startPointOnEdge({ shape: resultingSol[0]! });
                    startPoint2 = this.startPointOnEdge({ shape: resultingSol[1]! });
                }
                endPoint1 = this.endPointOnEdge({ shape: resultingSol[0]! });
                endPoint2 = this.endPointOnEdge({ shape: resultingSol[1]! });
            } else if (inputs.circleRemainders === Inputs.OCCT.twoCircleInclusionEnum.inside) {
                if (inputs.positionResult === Inputs.OCCT.positionResultEnum.keepSide2 || inputs.positionResult === Inputs.OCCT.positionResultEnum.all) {
                    startPoint1 = this.startPointOnEdge({ shape: resultingSol[0]! });
                    startPoint2 = this.startPointOnEdge({ shape: resultingSol[1]! });
                } else if (inputs.positionResult === Inputs.OCCT.positionResultEnum.keepSide1) {
                    startPoint1 = this.startPointOnEdge({ shape: resultingSol[1]! });
                    startPoint2 = this.startPointOnEdge({ shape: resultingSol[0]! });
                }
                endPoint1 = this.endPointOnEdge({ shape: resultingSol[1]! });
                endPoint2 = this.endPointOnEdge({ shape: resultingSol[0]! });
            } else if (inputs.circleRemainders === Inputs.OCCT.twoCircleInclusionEnum.insideOutside) {

                if (inputs.positionResult === Inputs.OCCT.positionResultEnum.keepSide2 || inputs.positionResult === Inputs.OCCT.positionResultEnum.all) {
                    startPoint1 = this.startPointOnEdge({ shape: resultingSol[0]! });
                    startPoint2 = this.startPointOnEdge({ shape: resultingSol[1]! });
                } else if (inputs.positionResult === Inputs.OCCT.positionResultEnum.keepSide1) {
                    startPoint1 = this.startPointOnEdge({ shape: resultingSol[1]! });
                    startPoint2 = this.startPointOnEdge({ shape: resultingSol[0]! });
                }
                endPoint1 = this.endPointOnEdge({ shape: resultingSol[0]! });
                endPoint2 = this.endPointOnEdge({ shape: resultingSol[1]! });
            } else if (inputs.circleRemainders === Inputs.OCCT.twoCircleInclusionEnum.outsideInside) {

                if (inputs.positionResult === Inputs.OCCT.positionResultEnum.keepSide2 || inputs.positionResult === Inputs.OCCT.positionResultEnum.all) {
                    startPoint1 = this.startPointOnEdge({ shape: resultingSol[1]! });
                    startPoint2 = this.startPointOnEdge({ shape: resultingSol[0]! });
                } else if (inputs.positionResult === Inputs.OCCT.positionResultEnum.keepSide1) {
                    startPoint1 = this.startPointOnEdge({ shape: resultingSol[0]! });
                    startPoint2 = this.startPointOnEdge({ shape: resultingSol[1]! });
                }
                endPoint1 = this.endPointOnEdge({ shape: resultingSol[1]! });
                endPoint2 = this.endPointOnEdge({ shape: resultingSol[0]! });
            }

            if (!startPoint1 || !startPoint2 || !endPoint1 || !endPoint2) {
                throw new Error("Circle remainders could not be resolved for the given position result");
            }
            const edge1 = this.arcFromCircleAndTwoPoints({ circle: inputs.circle1, start: startPoint1, end: startPoint2, sense: true });
            made.push(edge1);
            const edge2 = this.arcFromCircleAndTwoPoints({ circle: inputs.circle2, start: endPoint1, end: endPoint2, sense: true });
            made.push(edge2);

            resultingSol.unshift(edge1);
            resultingSol.push(edge2);
        }

        return resultingSol;
    }

    constraintTanCirclesOnCircleAndPnt(inputs: Resolved.OCCT.ConstraintTanCirclesOnCircleAndPntDto<TopoDS_Edge>): TopoDS_Shape[] {
        const cirDir = this.getCircularEdgePlaneDirection({ shape: inputs.circle }, "circle");
        const cirPos = this.getCircularEdgeCenterPoint({ shape: inputs.circle }, "circle");
        const { own, releaseAll } = kernelObjects();
        try {
            const circleAligned = own(this.intoCirclePlane(inputs.circle, cirDir, cirPos));
            const ptAligned = this.pointInCirclePlane(inputs.point, cirDir, cirPos);
            const pt2d = own(this.entitiesService.gpPnt2d([ptAligned[0], ptAligned[1]]));
            const qCircle = own(this.qualifiedCircle(circleAligned, "circle"));
            const tangentCircles = own(this.occ.GccAna_Circ2d2TanRad_fromQualifiedCircAndPoint(qCircle, pt2d, inputs.radius, inputs.tolerance));
            return this.tangentCirclesOutOfPlane(tangentCircles, cirDir, cirPos);
        } catch (error) {
            throw readKernelException(this.occ, error);
        } finally {
            releaseAll();
        }
    }

    constraintTanCirclesOnTwoCircles(inputs: Resolved.OCCT.ConstraintTanCirclesOnTwoCirclesDto<TopoDS_Edge>): TopoDS_Shape[] {
        const cirDir = this.getCircularEdgePlaneDirection({ shape: inputs.circle1 }, "circle1");
        const cirPos = this.getCircularEdgeCenterPoint({ shape: inputs.circle1 }, "circle1");
        const { own, releaseAll } = kernelObjects();
        try {
            const circle1Aligned = own(this.intoCirclePlane(inputs.circle1, cirDir, cirPos));
            const circle2Aligned = own(this.intoCirclePlane(inputs.circle2, cirDir, cirPos));
            const qCircle1 = own(this.qualifiedCircle(circle1Aligned, "circle1"));
            const qCircle2 = own(this.qualifiedCircle(circle2Aligned, "circle2"));
            const tangentCircles = own(this.occ.GccAna_Circ2d2TanRad_fromTwoQualifiedCirc(qCircle1, qCircle2, inputs.radius, inputs.tolerance));
            return this.tangentCirclesOutOfPlane(tangentCircles, cirDir, cirPos);
        } catch (error) {
            throw readKernelException(this.occ, error);
        } finally {
            releaseAll();
        }
    }

    private tangentCirclesOutOfPlane(circles: GccAna_Circ2d2TanRad, cirDir: Base.Vector3, cirPos: Base.Point3): TopoDS_Shape[] {
        const { own, releaseAll } = kernelObjects();
        const solutions: TopoDS_Shape[] = [];
        try {
            for (let i = 1; i <= circles.NbSolutions(); i++) {
                const sol = own(circles.ThisSolution(i));
                const location = own(sol.Location());
                const circle = own(this.entitiesService.createCircle(sol.Radius(), [location.X(), location.Y(), 0], [0, 0, 1], Inputs.OCCT.typeSpecificityEnum.edge));
                solutions.push(this.outOfCirclePlane(circle, cirDir, cirPos));
            }
            return solutions;
        } catch (error) {
            solutions.forEach(release);
            throw error;
        } finally {
            releaseAll();
        }
    }

    divideEdgeByParamsToPoints(inputs: Resolved.OCCT.DivideDto<TopoDS_Edge>): Inputs.Base.Point3[] {
        return this.geomService.pointsAtNormalizedParameters(inputs.shape, this.geomService.divisions(inputs, 1));
    }

    divideEdgeByEqualDistanceToPoints(inputs: Resolved.OCCT.DivideDto<TopoDS_Edge>): Base.Point3[] {
        const length = this.geomService.lengthsAndCentres([inputs.shape])[0]!.mass;
        return this.geomService.pointsAtLengths(inputs.shape, this.geomService.divisions(inputs, length));
    }

    pointOnEdgeAtParam(inputs: Resolved.OCCT.DataOnGeometryAtParamDto<TopoDS_Edge>): Base.Point3 {
        const edge = inputs.shape;
        if (this.isDegenerateEdge(edge)) {
            return this.pointOfDegenerateEdge(edge);
        }
        const { uMin, uMax } = this.getEdgeBounds(edge);
        const param = this.base.math.remap({ number: inputs.param, fromLow: 0, fromHigh: 1, toLow: uMin, toHigh: uMax });
        const result = this.occ.EvaluateEdgeCurve(edge, param);
        if (!result.IsValid) {
            result.delete();
            throw new Error("Point on edge could not be evaluated");
        }
        const point = result.Point;
        const pt: Base.Point3 = [point.X(), point.Y(), point.Z()];
        point.delete();
        result.delete();
        return pt;
    }

    arcFromCircleAndTwoPoints(inputs: Resolved.OCCT.ArcEdgeCircleTwoPointsDto<TopoDS_Edge>) {
        const circle = this.getGpCircleFromEdge({ shape: inputs.circle }, "circle");
        const gpPnt1 = this.entitiesService.gpPnt(inputs.start);
        const gpPnt2 = this.entitiesService.gpPnt(inputs.end);
        try {
            return withKernelErrorsRead(this.occ, () => this.occ.MakeArcOnCircle(circle, gpPnt1, gpPnt2, inputs.sense));
        } finally {
            circle.delete();
            gpPnt1.delete();
            gpPnt2.delete();
        }
    }


    getCircularEdgePlaneDirection(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>, property = "shape"): Inputs.Base.Vector3 {
        const circle = this.getGpCircleFromEdge(inputs, property);
        const axis = circle.Position();
        const dir = axis.Direction();
        const result = [dir.X(), dir.Y(), dir.Z()] as Inputs.Base.Vector3;
        dir.delete();
        axis.delete();
        circle.delete();
        return result;
    }

    getCircularEdgeCenterPoint(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>, property = "shape"): Inputs.Base.Point3 {
        const circle = this.getGpCircleFromEdge(inputs, property);
        const location = circle.Location();
        const result = [location.X(), location.Y(), location.Z()] as Inputs.Base.Point3;
        location.delete();
        circle.delete();
        return result;
    }

    getCircularEdgeRadius(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>): number {
        const circle = this.getGpCircleFromEdge(inputs);
        const radius = circle.Radius();
        circle.delete();
        return radius;
    }

    private getGpCircleFromEdge(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>, property = "shape"): gp_Circ {
        return withKernelRefusals(this.occ, () => {
            const curve = new this.occ.BRepAdaptor_Curve(inputs.shape);
            return released([curve], () => curve.Circle());
        }, message => NOT_A_CIRCLE.test(message) ? new InputError("Edge is not a circular edge.", property) : undefined);
    }

    getGpCircle2dFromEdge(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>, property = "shape"): gp_Circ2d {
        const { own, releaseAll } = kernelObjects();
        try {
            const circle = own(this.getGpCircleFromEdge(inputs, property));
            const location = own(circle.Location());
            const ax2d = own(this.entitiesService.gpAx2d([location.X(), location.Y()], [1, 0]));
            return new this.occ.gp_Circ2d(ax2d, circle.Radius());
        } finally {
            releaseAll();
        }
    }


    tangentOnEdgeAtParam(inputs: Resolved.OCCT.DataOnGeometryAtParamDto<TopoDS_Edge>): Base.Vector3 {
        const edge = inputs.shape;
        const result = this.occ.GetDerivativesOnEdgeAtParam(edge, inputs.param);
        if (result && result.isValid) {
            return [result.d1x, result.d1y, result.d1z];
        }
        throw new Error("Could not get tangent on edge at param");
    }

    pointOnEdgeAtLength(inputs: Resolved.OCCT.DataOnGeometryAtLengthDto<TopoDS_Edge>): Base.Point3 {
        return this.geomService.pointsAtLengths(inputs.shape, [inputs.length])[0]!;
    }

    tangentOnEdgeAtLength(inputs: Resolved.OCCT.DataOnGeometryAtLengthDto<TopoDS_Edge>): Base.Point3 {
        const { own, releaseAll } = kernelObjects();
        try {
            return withKernelErrorsRead(this.occ, () => {
                const edge = own(this.occ.CastToEdge(inputs.shape));
                if (this.occ.BRep_Tool_Degenerated(edge)) {
                    throw new InputError("`shape` is a degenerate edge, a point with no curve such as the pole of a ball, so there is no length to measure along it.", "shape");
                }
                const wire = own(this.converterService.combineEdgesAndWiresIntoAWire({ shapes: [edge] }));
                const curve = own(new this.occ.BRepAdaptor_CompCurve(wire, false));
                return this.geomService.tangentOnCurveAtLengthCompCurve({ ...inputs, shape: curve });
            });
        } finally {
            releaseAll();
        }
    }

    getEdgeBounds(edge: TopoDS_Edge): { uMin: number, uMax: number } {
        const result = this.occ.BRep_Tool_GetEdgeParameters(edge);
        if (result.IsValid) {
            return { uMin: result.First, uMax: result.Last };
        }
        return { uMin: 0, uMax: 0 };
    }


    isEdgeCircular(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>) {
        return this.occ.IsEdgeCircular(inputs.shape);
    }

    isEdgeLinear(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>) {
        return this.occ.IsEdgeLinear(inputs.shape);
    }

    /**
     * Create symmetric periodic (closed) BSpline edge through points
     * Uses chord-based tangent constraints to ensure the curve is symmetrical
     * (e.g., 4 points of a square will produce a perfectly symmetric curve like Rhino)
     * @param inputs Points to interpolate
     * @returns Symmetric periodic BSpline edge
     */
    createSymmetricPeriodicBSplineEdge(inputs: Resolved.OCCT.InterpolationDto): TopoDS_Edge {
        const points = checkedPoints(inputs.points, "points");
        if (points.length < FEWEST_POINTS_OF_A_CLOSED_SPLINE) {
            throw new InputError(`A closed spline through points needs at least three of them, and \`points\` has ${points.length}.`, "points");
        }
        const coords = new this.occ.VectorDouble();
        const edge = released([coords], () => {
            inputs.points.forEach(pt => {
                coords.push_back(pt[0]);
                coords.push_back(pt[1]);
                coords.push_back(pt[2]);
            });
            return withKernelErrorsRead(this.occ, () => this.occ.MakeSymmetricPeriodicBSplineEdge(coords));
        });
        if (edge.IsNull()) {
            edge.delete();
            throw new Error("Failed to create the symmetric periodic BSpline edge");
        }
        return edge;
    }

}
