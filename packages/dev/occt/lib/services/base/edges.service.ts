import {
    Geom2d_Curve, Geom_Surface, OpenCascadeInstance,
    TopoDS_Edge, TopoDS_Shape, TopoDS_Wire, gp_Circ2d
} from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../../api/inputs/inputs";
import { Base } from "../../api/inputs/inputs";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ConverterService } from "./converter.service";
import { EntitiesService } from "./entities.service";
import { OCCReferencedReturns } from "../../occ-referenced-returns";
import { ShapeGettersService } from "./shape-getters";
import { IteratorService } from "./iterator.service";
import { EnumService } from "./enum.service";
import { GeomService } from "./geom.service";
import { TransformsService } from "./transforms.service";

export class EdgesService {

    constructor(
        private readonly occ: OpenCascadeInstance,
        private readonly occRefReturns: OCCReferencedReturns,
        private readonly shapeGettersService: ShapeGettersService,
        private readonly entitiesService: EntitiesService,
        private readonly iteratorService: IteratorService,
        private readonly converterService: ConverterService,
        private readonly enumService: EnumService,
        private readonly geomService: GeomService,
        private readonly transformsService: TransformsService,
        private readonly vecHelper: VectorHelperService
    ) { }

    getCornerPointsOfEdgesForShape(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Inputs.Base.Point3[] {
        const edges = this.shapeGettersService.getEdges(inputs);
        let points: Inputs.Base.Point3[] = [];
        edges.forEach((edge) => {
            const param1 = { current: 0 };
            const param2 = { current: 0 };
            const crvHandle = this.occRefReturns.BRep_Tool_Curve_2(edge, param1, param2);

            try {
                const crv = crvHandle.get();
                if (crv) {
                    const pt1 = crv.Value(param1.current);
                    const pt2 = crv.Value(param2.current);
                    const pt1g: Inputs.Base.Point3 = [pt1.X(), pt1.Y(), pt1.Z()];
                    const pt2g: Inputs.Base.Point3 = [pt2.X(), pt2.Y(), pt2.Z()];
                    pt1.delete();
                    pt2.delete();
                    points.push(pt1g);
                    points.push(pt2g);
                }
            } catch (ex) {
                console.log(ex);
            }
        });
        if (points.length > 0) {
            points = this.vecHelper.removeAllDuplicateVectors(points) as Inputs.Base.Point3[];
        }
        return points;
    }

    getCircularEdgesAlongWire(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): TopoDS_Edge[] {
        return this.getEdgesAlongWire(inputs).filter(edge => this.isEdgeCircular({ shape: edge }));
    }

    getLinearEdgesAlongWire(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): TopoDS_Edge[] {
        return this.getEdgesAlongWire(inputs).filter(edge => this.isEdgeLinear({ shape: edge }));
    }

    getEdgesAlongWire(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): TopoDS_Edge[] {
        if (inputs.shape && this.enumService.getShapeTypeEnum(inputs.shape) === Inputs.OCCT.shapeTypeEnum.edge) {
            return [inputs.shape];
        }
        if (!inputs.shape || inputs.shape.IsNull()) {
            throw (new Error("Shape is not provided or is of incorrect type"));
        }
        const edges: TopoDS_Edge[] = [];
        const wireWithFixedEdges = this.fixEdgeOrientationsAlongWire(inputs);
        this.iteratorService.forEachEdgeAlongWire(wireWithFixedEdges, (i, edge) => {
            edges.push(edge);
        });
        return edges;
    }

    fixEdgeOrientationsAlongWire(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): TopoDS_Wire {
        const edges = [];
        this.iteratorService.forEachEdgeAlongWire(inputs.shape, (i, edge) => {
            edges.push(edge);
        });
        // rebuilding wire from edges along wire fixes edge directions
        return this.converterService.combineEdgesAndWiresIntoAWire({ shapes: edges });
    }

    arcThroughThreePoints(inputs: Inputs.OCCT.ArcEdgeThreePointsDto) {
        const gpPnt1 = this.entitiesService.gpPnt(inputs.start);
        const gpPnt2 = this.entitiesService.gpPnt(inputs.middle);
        const gpPnt3 = this.entitiesService.gpPnt(inputs.end);
        const segment = new this.occ.GC_MakeArcOfCircle_4(gpPnt1, gpPnt2, gpPnt3);
        const hcurve = new this.occ.Handle_Geom_Curve_2(segment.Value().get());
        const makeEdge = new this.occ.BRepBuilderAPI_MakeEdge_24(hcurve);
        const shape = makeEdge.Edge();
        gpPnt1.delete();
        gpPnt2.delete();
        gpPnt3.delete();
        segment.delete();
        hcurve.delete();
        makeEdge.delete();
        return shape;
    }

    arcThroughTwoPointsAndTangent(inputs: Inputs.OCCT.ArcEdgeTwoPointsTangentDto) {
        const gpPnt1 = this.entitiesService.gpPnt(inputs.start);
        const gpVec = this.entitiesService.gpVec(inputs.tangentVec);
        const gpPnt2 = this.entitiesService.gpPnt(inputs.end);
        const segment = new this.occ.GC_MakeArcOfCircle_5(gpPnt1, gpVec, gpPnt2);
        const hcurve = new this.occ.Handle_Geom_Curve_2(segment.Value().get());
        const makeEdge = new this.occ.BRepBuilderAPI_MakeEdge_24(hcurve);
        const shape = makeEdge.Edge();
        gpPnt1.delete();
        gpVec.delete();
        gpPnt2.delete();
        segment.delete();
        hcurve.delete();
        makeEdge.delete();
        return shape;
    }

    arcFromCircleAndTwoAngles(inputs: Inputs.OCCT.ArcEdgeCircleTwoAnglesDto<TopoDS_Edge>) {
        const circle = this.getGpCircleFromEdge({ shape: inputs.circle });
        const radAlpha1 = this.vecHelper.degToRad(inputs.alphaAngle1);
        const radAlpha2 = this.vecHelper.degToRad(inputs.alphaAngle2);
        const arc = new this.occ.GC_MakeArcOfCircle_1(circle, radAlpha1, radAlpha2, inputs.sense);
        const hcurve = new this.occ.Handle_Geom_Curve_2(arc.Value().get());
        const makeEdge = new this.occ.BRepBuilderAPI_MakeEdge_24(hcurve);
        const shape = makeEdge.Edge();
        circle.delete();
        arc.delete();
        hcurve.delete();
        makeEdge.delete();
        return shape;
    }

    arcFromCirclePointAndAngle(inputs: Inputs.OCCT.ArcEdgeCirclePointAngleDto<TopoDS_Edge>) {
        const circle = this.getGpCircleFromEdge({ shape: inputs.circle });
        const radAlpha = this.vecHelper.degToRad(inputs.alphaAngle);
        const point = this.entitiesService.gpPnt(inputs.point);
        const arc = new this.occ.GC_MakeArcOfCircle_2(circle, point, radAlpha, inputs.sense);
        const hcurve = new this.occ.Handle_Geom_Curve_2(arc.Value().get());
        const makeEdge = new this.occ.BRepBuilderAPI_MakeEdge_24(hcurve);
        const shape = makeEdge.Edge();
        circle.delete();
        arc.delete();
        point.delete();
        hcurve.delete();
        makeEdge.delete();
        return shape;
    }

    lineEdge(inputs: Inputs.OCCT.LineDto) {
        const gpPnt1 = this.entitiesService.gpPnt(inputs.start);
        const gpPnt2 = this.entitiesService.gpPnt(inputs.end);
        const segment = new this.occ.GC_MakeSegment_1(gpPnt1, gpPnt2);
        const segVal = segment.Value();
        const seg = segVal.get();
        const hcurve = new this.occ.Handle_Geom_Curve_2(seg);
        const edgeMaker = new this.occ.BRepBuilderAPI_MakeEdge_24(hcurve);
        const edge = edgeMaker.Edge();
        edgeMaker.delete();
        hcurve.delete();
        gpPnt1.delete();
        gpPnt2.delete();
        segVal.delete();
        seg.delete();
        return edge;
    }

    getEdgeLength(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>) {
        const makeWire = new this.occ.BRepBuilderAPI_MakeWire_2(inputs.shape);
        const wire = makeWire.Wire();
        const curve = new this.occ.BRepAdaptor_CompCurve_2(wire, false);
        const length = this.geomService.curveLength({ shape: curve });
        curve.delete();
        wire.delete();
        makeWire.delete();
        return length;
    }

    getEdgeLengthsOfShape(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>): number[] {
        const edgesOnShape = this.shapeGettersService.getEdges({ shape: inputs.shape });
        return edgesOnShape.map(edge => {
            return this.getEdgeLength({ shape: edge });
        });
    }

    getEdgesLengths(inputs: Inputs.OCCT.ShapesDto<TopoDS_Edge>): number[] {
        if (inputs.shapes === undefined) {
            throw (Error(("Shapes are not defined")));
        }
        return inputs.shapes.map(edge => this.getEdgeLength({ shape: edge }));
    }

    getEdgesCentersOfMass(inputs: Inputs.OCCT.ShapesDto<TopoDS_Edge>): Base.Point3[] {
        if (inputs.shapes === undefined) {
            throw (Error(("Shapes are not defined")));
        }
        return inputs.shapes.map(edge => this.geomService.getLinearCenterOfMass({ shape: edge }));
    }

    edgesToPoints(inputs: Inputs.OCCT.EdgesToPointsDto<TopoDS_Shape>): Inputs.Base.Point3[][] {
        const shapeType = this.enumService.getShapeTypeEnum(inputs.shape);
        let edges = [];
        if (shapeType === Inputs.OCCT.shapeTypeEnum.edge) {
            edges = [inputs.shape];
        } else if (shapeType === Inputs.OCCT.shapeTypeEnum.wire) {
            edges = this.getEdgesAlongWire({ shape: inputs.shape });
        } else {
            edges = this.shapeGettersService.getEdges({ shape: inputs.shape });
        }
        // Reuse edgeToPoints for each edge to ensure consistent direction handling
        const allEdgePoints: Base.Point3[][] = edges.map(edge => {
            return this.edgeToPoints({ ...inputs, shape: edge });
        });
        return allEdgePoints;
    }

    startPointOnEdge(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>): Base.Point3 {
        const edge = inputs.shape;
        const wire = this.converterService.combineEdgesAndWiresIntoAWire({ shapes: [edge] });
        const curve = new this.occ.BRepAdaptor_CompCurve_2(wire, false);
        const pt = this.geomService.pointOnCurveAtParam({ shape: curve, param: 0 });
        curve.delete();
        return pt;
    }

    endPointOnEdge(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>): Base.Point3 {
        const edge = inputs.shape;
        const wire = this.converterService.combineEdgesAndWiresIntoAWire({ shapes: [edge] });
        const curve = new this.occ.BRepAdaptor_CompCurve_2(wire, false);
        const pt = this.geomService.pointOnCurveAtParam({ shape: curve, param: 1 });
        curve.delete();
        return pt;
    }

    edgeToPoints(inputs: Inputs.OCCT.EdgesToPointsDto<TopoDS_Edge>): Inputs.Base.Point3[] {
        const edgePoints: Base.Point3[] = [];
        const aLocation = new this.occ.TopLoc_Location_1();
        const adaptorCurve = new this.occ.BRepAdaptor_Curve_2(inputs.shape);
        const tangDef = new this.occ.GCPnts_TangentialDeflection_2(
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
        
        // Ensure tessellation matches edge direction
        // The tessellation might be in reverse order relative to the edge's start->end direction
        if (edgePoints.length > 1) {
            const edgeStart = this.startPointOnEdge({ shape: inputs.shape });
            const tessStart = edgePoints[0];
            const tessEnd = edgePoints[edgePoints.length - 1];
            
            // Check if first tessellation point is closer to edge start or end
            const distStartToStart = this.vecHelper.distanceBetweenPoints(tessStart, edgeStart);
            const distEndToStart = this.vecHelper.distanceBetweenPoints(tessEnd, edgeStart);
            
            // If the last tessellation point is closer to the edge start, the array is reversed
            if (distEndToStart < distStartToStart) {
                edgePoints.reverse();
            }
        }
        
        return edgePoints;
    }

    makeEdgeFromGeom2dCurveAndSurfaceBounded(inputs: Inputs.OCCT.CurveAndSurfaceDto<Geom2d_Curve, Geom_Surface>, umin: number, umax: number): TopoDS_Edge {
        const curve2d = new this.occ.Handle_Geom2d_Curve_2(inputs.curve as Geom2d_Curve);
        const surface = new this.occ.Handle_Geom_Surface_2(inputs.surface as Geom_Surface);
        const res = new this.occ.BRepBuilderAPI_MakeEdge_31(curve2d, surface, umin, umax);
        const resShape = res.Shape();
        const r = this.converterService.getActualTypeOfShape(resShape);
        resShape.delete();
        res.delete();
        return r;
    }

    makeEdgeFromGeom2dCurveAndSurface(inputs: Inputs.OCCT.CurveAndSurfaceDto<Geom2d_Curve, Geom_Surface>): TopoDS_Edge {
        const curve2d = new this.occ.Handle_Geom2d_Curve_2(inputs.curve as Geom2d_Curve);
        const surface = new this.occ.Handle_Geom_Surface_2(inputs.surface as Geom_Surface);
        const res = new this.occ.BRepBuilderAPI_MakeEdge_30(curve2d, surface);
        const resShape = res.Shape();
        const r = this.converterService.getActualTypeOfShape(resShape);
        resShape.delete();
        res.delete();
        return r;
    }

    constraintTanLinesFromTwoPtsToCircle(inputs: Inputs.OCCT.ConstraintTanLinesFromTwoPtsToCircleDto<TopoDS_Edge>): TopoDS_Shape[] {
        const cirDir = this.getCircularEdgePlaneDirection({ shape: inputs.circle });
        const cirPos = this.getCircularEdgeCenterPoint({ shape: inputs.circle });

        const alignOpt = new Inputs.OCCT.AlignDto<TopoDS_Shape>();
        alignOpt.fromDirection = cirDir;
        alignOpt.toDirection = [0, 0, 1];
        alignOpt.fromOrigin = cirPos;
        alignOpt.toOrigin = [0, 0, 0];
        alignOpt.shape = inputs.circle;
        const circleAligned = this.transformsService.align(alignOpt);
        const ptVertex1 = this.entitiesService.makeVertex(inputs.point1);
        alignOpt.shape = ptVertex1;
        const ptVertex1Aligned = this.transformsService.align(alignOpt);
        ptVertex1.delete();
        const pt1Aligned = this.converterService.vertexToPoint({ shape: ptVertex1Aligned });
        ptVertex1Aligned.delete();
        const pt2d1 = this.entitiesService.gpPnt2d([pt1Aligned[0], pt1Aligned[1]]);

        const ptVertex2 = this.entitiesService.makeVertex(inputs.point2);
        alignOpt.shape = ptVertex2;
        const ptVertex2Aligned = this.transformsService.align(alignOpt);
        ptVertex2.delete();
        const pt2Aligned = this.converterService.vertexToPoint({ shape: ptVertex2Aligned });
        ptVertex2Aligned.delete();
        const pt2d2 = this.entitiesService.gpPnt2d([pt2Aligned[0], pt2Aligned[1]]);

        const circle = this.getGpCircle2dFromEdge({ shape: circleAligned });
        circleAligned.delete();
        const qCircle = new this.occ.GccEnt_QualifiedCirc(circle, this.enumService.getGccEntPositionFromEnum(Inputs.OCCT.gccEntPositionEnum.unqualified));
        circle.delete();

        const lin1 = new this.occ.GccAna_Lin2d2Tan_2(qCircle, pt2d1, inputs.tolerance);
        const lin2 = new this.occ.GccAna_Lin2d2Tan_2(qCircle, pt2d2, inputs.tolerance);

        qCircle.delete();
        const solutions1 = [];

        for (let i = 1; i <= lin1.NbSolutions(); i++) {
            const sol = lin1.ThisSolution(i);
            const location = sol.Location();
            const edgeLine = this.lineEdge({ start: [location.X(), location.Y(), 0], end: pt1Aligned });
            alignOpt.fromDirection = [0, 0, 1];
            alignOpt.toDirection = cirDir;
            alignOpt.fromOrigin = [0, 0, 0];
            alignOpt.toOrigin = cirPos;
            alignOpt.shape = edgeLine;
            const aligned = this.transformsService.align(alignOpt);
            solutions1.push(aligned);
            sol.delete();
            location.delete();
            edgeLine.delete();
        }
        lin1.delete();

        const solutions2 = [];

        for (let i = 1; i <= lin2.NbSolutions(); i++) {
            const sol = lin2.ThisSolution(i);
            const location = sol.Location();
            const edgeLine = this.lineEdge({ start: [location.X(), location.Y(), 0], end: pt2Aligned });
            alignOpt.fromDirection = [0, 0, 1];
            alignOpt.toDirection = cirDir;
            alignOpt.fromOrigin = [0, 0, 0];
            alignOpt.toOrigin = cirPos;
            alignOpt.shape = edgeLine;
            const aligned = this.transformsService.align(alignOpt);
            solutions2.push(aligned);
            sol.delete();
            location.delete();
            edgeLine.delete();
        }
        lin2.delete();

        let resultingSol = [];
        if (inputs.positionResult === Inputs.OCCT.positionResultEnum.all) {
            resultingSol = [...solutions1, ...solutions2];
        } else if (inputs.positionResult === Inputs.OCCT.positionResultEnum.keepSide1) {
            resultingSol = [solutions1[1], solutions2[0]];
        } else if (inputs.positionResult === Inputs.OCCT.positionResultEnum.keepSide2) {
            resultingSol = [solutions1[0], solutions2[1]];
        } else {
            resultingSol = [...solutions1, ...solutions2];
        }

        if (resultingSol.length === 2 && inputs.circleRemainder !== Inputs.OCCT.circleInclusionEnum.none) {
            let startPoint;
            let endPoint;
            if (inputs.positionResult === Inputs.OCCT.positionResultEnum.keepSide2) {
                if (inputs.circleRemainder === Inputs.OCCT.circleInclusionEnum.keepSide1) {
                    startPoint = this.startPointOnEdge({ shape: resultingSol[1] });
                    endPoint = this.startPointOnEdge({ shape: resultingSol[0] });
                } else if (inputs.circleRemainder === Inputs.OCCT.circleInclusionEnum.keepSide2) {
                    startPoint = this.startPointOnEdge({ shape: resultingSol[0] });
                    endPoint = this.startPointOnEdge({ shape: resultingSol[1] });
                }
            } else if (inputs.positionResult === Inputs.OCCT.positionResultEnum.keepSide1) {
                if (inputs.circleRemainder === Inputs.OCCT.circleInclusionEnum.keepSide1) {
                    startPoint = this.startPointOnEdge({ shape: resultingSol[0] });
                    endPoint = this.startPointOnEdge({ shape: resultingSol[1] });
                } else if (inputs.circleRemainder === Inputs.OCCT.circleInclusionEnum.keepSide2) {
                    startPoint = this.startPointOnEdge({ shape: resultingSol[1] });
                    endPoint = this.startPointOnEdge({ shape: resultingSol[0] });
                }
            }

            const edge = this.arcFromCircleAndTwoPoints({ circle: inputs.circle, start: startPoint, end: endPoint, sense: true });
            resultingSol.splice(1, 0, edge);
        }

        return resultingSol;
    }

    constraintTanLinesFromPtToCircle(inputs: Inputs.OCCT.ConstraintTanLinesFromPtToCircleDto<TopoDS_Edge>): TopoDS_Shape[] {
        const cirDir = this.getCircularEdgePlaneDirection({ shape: inputs.circle });
        const cirPos = this.getCircularEdgeCenterPoint({ shape: inputs.circle });

        const alignOpt = new Inputs.OCCT.AlignDto<TopoDS_Shape>();
        alignOpt.fromDirection = cirDir;
        alignOpt.toDirection = [0, 0, 1];
        alignOpt.fromOrigin = cirPos;
        alignOpt.toOrigin = [0, 0, 0];
        alignOpt.shape = inputs.circle;
        const circleAligned = this.transformsService.align(alignOpt);
        const ptVertex = this.entitiesService.makeVertex(inputs.point);
        alignOpt.shape = ptVertex;
        const ptVertexAligned = this.transformsService.align(alignOpt);
        ptVertex.delete();
        const ptAligned = this.converterService.vertexToPoint({ shape: ptVertexAligned });
        ptVertexAligned.delete();
        const pt2d = this.entitiesService.gpPnt2d([ptAligned[0], ptAligned[1]]);
        const circle = this.getGpCircle2dFromEdge({ shape: circleAligned });
        circleAligned.delete();
        const qCircle = new this.occ.GccEnt_QualifiedCirc(circle, this.enumService.getGccEntPositionFromEnum(Inputs.OCCT.gccEntPositionEnum.unqualified));
        circle.delete();
        const lin = new this.occ.GccAna_Lin2d2Tan_2(qCircle, pt2d, inputs.tolerance);
        qCircle.delete();
        const solutions = [];
        for (let i = 1; i <= lin.NbSolutions(); i++) {
            const sol = lin.ThisSolution(i);
            const location = sol.Location();
            const edgeLine = this.lineEdge({ start: [location.X(), location.Y(), 0], end: ptAligned });
            alignOpt.fromDirection = [0, 0, 1];
            alignOpt.toDirection = cirDir;
            alignOpt.fromOrigin = [0, 0, 0];
            alignOpt.toOrigin = cirPos;
            alignOpt.shape = edgeLine;
            const aligned = this.transformsService.align(alignOpt);
            solutions.push(aligned);
            sol.delete();
            location.delete();
            edgeLine.delete();
        }
        lin.delete();

        let resultingSol = [];
        if (inputs.positionResult === Inputs.OCCT.positionResultEnum.all) {
            resultingSol = [...solutions];
        } else if (inputs.positionResult === Inputs.OCCT.positionResultEnum.keepSide1) {
            resultingSol = [solutions[0]];
        } else if (inputs.positionResult === Inputs.OCCT.positionResultEnum.keepSide2) {
            resultingSol = [solutions[1]];
        } else {
            resultingSol = [...solutions];
        }

        if (resultingSol.length === 2 && inputs.circleRemainder !== Inputs.OCCT.circleInclusionEnum.none) {
            let startPoint;
            let endPoint;
            if (inputs.circleRemainder === Inputs.OCCT.circleInclusionEnum.keepSide1) {
                startPoint = this.startPointOnEdge({ shape: resultingSol[1] });
                endPoint = this.startPointOnEdge({ shape: resultingSol[0] });
            } else if (inputs.circleRemainder === Inputs.OCCT.circleInclusionEnum.keepSide2) {
                startPoint = this.startPointOnEdge({ shape: resultingSol[0] });
                endPoint = this.startPointOnEdge({ shape: resultingSol[1] });
            }
            const edge = this.arcFromCircleAndTwoPoints({ circle: inputs.circle, start: startPoint, end: endPoint, sense: true });
            resultingSol.splice(1, 0, edge);
        }

        return resultingSol;
    }

    constraintTanLinesOnTwoCircles(inputs: Inputs.OCCT.ConstraintTanLinesOnTwoCirclesDto<TopoDS_Edge>): TopoDS_Shape[] {
        const cirDir = this.getCircularEdgePlaneDirection({ shape: inputs.circle1 });
        const cirPos = this.getCircularEdgeCenterPoint({ shape: inputs.circle1 });

        const alignOpt = new Inputs.OCCT.AlignDto<TopoDS_Shape>();
        alignOpt.fromDirection = cirDir;
        alignOpt.toDirection = [0, 0, 1];
        alignOpt.fromOrigin = cirPos;
        alignOpt.toOrigin = [0, 0, 0];
        alignOpt.shape = inputs.circle1;
        const circle1Aligned = this.transformsService.align(alignOpt);
        alignOpt.shape = inputs.circle2;
        const circle2Aligned = this.transformsService.align(alignOpt);

        const circle1 = this.getGpCircle2dFromEdge({ shape: circle1Aligned });
        const circle2 = this.getGpCircle2dFromEdge({ shape: circle2Aligned });

        circle1Aligned.delete();
        circle2Aligned.delete();

        const qCircle1 = new this.occ.GccEnt_QualifiedCirc(circle1, this.enumService.getGccEntPositionFromEnum(Inputs.OCCT.gccEntPositionEnum.unqualified));
        const qCircle2 = new this.occ.GccEnt_QualifiedCirc(circle2, this.enumService.getGccEntPositionFromEnum(Inputs.OCCT.gccEntPositionEnum.unqualified));

        circle1.delete();
        circle2.delete();

        const lin1 = new this.occ.GccAna_Lin2d2Tan_3(qCircle1, qCircle2, inputs.tolerance);
        const lin2 = new this.occ.GccAna_Lin2d2Tan_3(qCircle2, qCircle1, inputs.tolerance);

        qCircle1.delete();
        qCircle2.delete();

        const lin1Sols = [];
        for (let i = 1; i <= lin1.NbSolutions(); i++) {
            const sol = lin1.ThisSolution(i);
            lin1Sols.push(sol);
        }
        lin1.delete();

        const lin2Sols = [];
        for (let i = 1; i <= lin2.NbSolutions(); i++) {
            const sol = lin2.ThisSolution(i);
            lin2Sols.push(sol);
        }
        lin2.delete();

        let adjustLin2Sol;
        if (lin2Sols.length === 4) {
            adjustLin2Sol = [lin2Sols[2], lin2Sols[1], lin2Sols[0], lin2Sols[3]];
        } else if (lin2Sols.length === 2) {
            adjustLin2Sol = [lin2Sols[1], lin2Sols[0]];
        }
        const solutions = [];
        for (let i = 0; i < lin1Sols.length; i++) {
            const sol1 = lin1Sols[i];
            const sol2 = adjustLin2Sol[i];
            const locationStart = sol1.Location();
            const startPoint = [locationStart.X(), locationStart.Y(), 0] as Inputs.Base.Point3;
            const locationEnd = sol2.Location();
            const endPoint = [locationEnd.X(), locationEnd.Y(), 0] as Inputs.Base.Point3;
            const edgeLine = this.lineEdge({ start: startPoint, end: endPoint });
            alignOpt.fromDirection = [0, 0, 1];
            alignOpt.toDirection = cirDir;
            alignOpt.fromOrigin = [0, 0, 0];
            alignOpt.toOrigin = cirPos;
            alignOpt.shape = edgeLine;
            const aligned = this.transformsService.align(alignOpt);
            solutions.push(aligned);
            edgeLine.delete();
            sol1.delete();
            sol2.delete();
            locationStart.delete();
            locationEnd.delete();
        }

        let resultingSol = [];

        if (inputs.positionResult === Inputs.OCCT.positionResultEnum.all) {
            resultingSol = [...solutions];
        } else if (inputs.positionResult === Inputs.OCCT.positionResultEnum.keepSide1 && solutions.length === 4) {
            resultingSol = [solutions[1], solutions[3]];
        } else if (inputs.positionResult === Inputs.OCCT.positionResultEnum.keepSide2 && solutions.length === 4) {
            resultingSol = [solutions[0], solutions[2]];
        } else if (inputs.positionResult === Inputs.OCCT.positionResultEnum.keepSide1 && solutions.length === 2) {
            resultingSol = [];
        } else if (inputs.positionResult === Inputs.OCCT.positionResultEnum.keepSide2 && solutions.length === 2) {
            resultingSol = [solutions[0], solutions[1]];
        } else {
            resultingSol = [...solutions];
        }

        if (resultingSol.length === 2 && inputs.circleRemainders !== Inputs.OCCT.twoCircleInclusionEnum.none) {
            let startPoint1;
            let startPoint2;
            let endPoint1;
            let endPoint2;
            if (inputs.circleRemainders === Inputs.OCCT.twoCircleInclusionEnum.outside) {
                if (inputs.positionResult === Inputs.OCCT.positionResultEnum.keepSide2 || inputs.positionResult === Inputs.OCCT.positionResultEnum.all) {
                    startPoint1 = this.startPointOnEdge({ shape: resultingSol[1] });
                    startPoint2 = this.startPointOnEdge({ shape: resultingSol[0] });
                } else if (inputs.positionResult === Inputs.OCCT.positionResultEnum.keepSide1) {
                    startPoint1 = this.startPointOnEdge({ shape: resultingSol[0] });
                    startPoint2 = this.startPointOnEdge({ shape: resultingSol[1] });
                }
                endPoint1 = this.endPointOnEdge({ shape: resultingSol[0] });
                endPoint2 = this.endPointOnEdge({ shape: resultingSol[1] });
            } else if (inputs.circleRemainders === Inputs.OCCT.twoCircleInclusionEnum.inside) {
                if (inputs.positionResult === Inputs.OCCT.positionResultEnum.keepSide2 || inputs.positionResult === Inputs.OCCT.positionResultEnum.all) {
                    startPoint1 = this.startPointOnEdge({ shape: resultingSol[0] });
                    startPoint2 = this.startPointOnEdge({ shape: resultingSol[1] });
                } else if (inputs.positionResult === Inputs.OCCT.positionResultEnum.keepSide1) {
                    startPoint1 = this.startPointOnEdge({ shape: resultingSol[1] });
                    startPoint2 = this.startPointOnEdge({ shape: resultingSol[0] });
                }
                endPoint1 = this.endPointOnEdge({ shape: resultingSol[1] });
                endPoint2 = this.endPointOnEdge({ shape: resultingSol[0] });
            } else if (inputs.circleRemainders === Inputs.OCCT.twoCircleInclusionEnum.insideOutside) {

                if (inputs.positionResult === Inputs.OCCT.positionResultEnum.keepSide2 || inputs.positionResult === Inputs.OCCT.positionResultEnum.all) {
                    startPoint1 = this.startPointOnEdge({ shape: resultingSol[0] });
                    startPoint2 = this.startPointOnEdge({ shape: resultingSol[1] });
                } else if (inputs.positionResult === Inputs.OCCT.positionResultEnum.keepSide1) {
                    startPoint1 = this.startPointOnEdge({ shape: resultingSol[1] });
                    startPoint2 = this.startPointOnEdge({ shape: resultingSol[0] });
                }
                endPoint1 = this.endPointOnEdge({ shape: resultingSol[0] });
                endPoint2 = this.endPointOnEdge({ shape: resultingSol[1] });
            } else if (inputs.circleRemainders === Inputs.OCCT.twoCircleInclusionEnum.outsideInside) {

                if (inputs.positionResult === Inputs.OCCT.positionResultEnum.keepSide2 || inputs.positionResult === Inputs.OCCT.positionResultEnum.all) {
                    startPoint1 = this.startPointOnEdge({ shape: resultingSol[1] });
                    startPoint2 = this.startPointOnEdge({ shape: resultingSol[0] });
                } else if (inputs.positionResult === Inputs.OCCT.positionResultEnum.keepSide1) {
                    startPoint1 = this.startPointOnEdge({ shape: resultingSol[0] });
                    startPoint2 = this.startPointOnEdge({ shape: resultingSol[1] });
                }
                endPoint1 = this.endPointOnEdge({ shape: resultingSol[1] });
                endPoint2 = this.endPointOnEdge({ shape: resultingSol[0] });
            }

            const edge1 = this.arcFromCircleAndTwoPoints({ circle: inputs.circle1, start: startPoint1, end: startPoint2, sense: true });
            const edge2 = this.arcFromCircleAndTwoPoints({ circle: inputs.circle2, start: endPoint1, end: endPoint2, sense: true });

            resultingSol.unshift(edge1);
            resultingSol.push(edge2);
        }

        return resultingSol;
    }

    constraintTanCirclesOnCircleAndPnt(inputs: Inputs.OCCT.ConstraintTanCirclesOnCircleAndPntDto<TopoDS_Edge>): TopoDS_Shape[] {
        const cirDir = this.getCircularEdgePlaneDirection({ shape: inputs.circle });
        const cirPos = this.getCircularEdgeCenterPoint({ shape: inputs.circle });

        const { alignOpt, circle1Aligned: circleAligned } = this.alignCircle(cirDir, cirPos, inputs.circle);

        const ptVertex = this.entitiesService.makeVertex(inputs.point);
        alignOpt.shape = ptVertex;
        const ptVertexAligned = this.transformsService.align(alignOpt);
        ptVertex.delete();
        const ptAligned = this.converterService.vertexToPoint({ shape: ptVertexAligned });
        ptVertexAligned.delete();
        const pt2d = this.entitiesService.gpPnt2d([ptAligned[0], ptAligned[1]]);

        const circle = this.getGpCircle2dFromEdge({ shape: circleAligned });

        circleAligned.delete();

        const qCircle = new this.occ.GccEnt_QualifiedCirc(circle, this.enumService.getGccEntPositionFromEnum(Inputs.OCCT.gccEntPositionEnum.unqualified));

        circle.delete();

        const lin1 = new this.occ.GccAna_Circ2d2TanRad_3(qCircle, pt2d, inputs.radius, inputs.tolerance);

        qCircle.delete();

        const lin1Sols: gp_Circ2d[] = [];
        for (let i = 1; i <= lin1.NbSolutions(); i++) {
            const sol = lin1.ThisSolution(i);
            lin1Sols.push(sol);
        }
        lin1.delete();

        const solutions = [];
        for (let i = 0; i < lin1Sols.length; i++) {
            const sol = lin1Sols[i];
            const res = this.reconstructCircleAndAlignBack(lin1Sols, sol, alignOpt, cirDir, cirPos);
            solutions.push(res);
        }

        return solutions;
    }

    private alignCircle(cirDir: Base.Vector3, cirPos: Base.Point3, circle: TopoDS_Edge) {
        const alignOpt = new Inputs.OCCT.AlignDto<TopoDS_Shape>();
        alignOpt.fromDirection = cirDir;
        alignOpt.toDirection = [0, 0, 1];
        alignOpt.fromOrigin = cirPos;
        alignOpt.toOrigin = [0, 0, 0];
        alignOpt.shape = circle;
        const circle1Aligned = this.transformsService.align(alignOpt);
        return { alignOpt, circle1Aligned };
    }

    constraintTanCirclesOnTwoCircles(inputs: Inputs.OCCT.ConstraintTanCirclesOnTwoCirclesDto<TopoDS_Edge>): TopoDS_Shape[] {
        const cirDir = this.getCircularEdgePlaneDirection({ shape: inputs.circle1 });
        const cirPos = this.getCircularEdgeCenterPoint({ shape: inputs.circle1 });

        const { alignOpt, circle1Aligned } = this.alignCircle(cirDir, cirPos, inputs.circle1);
        alignOpt.shape = inputs.circle2;
        const circle2Aligned = this.transformsService.align(alignOpt);

        const circle1 = this.getGpCircle2dFromEdge({ shape: circle1Aligned });
        const circle2 = this.getGpCircle2dFromEdge({ shape: circle2Aligned });

        circle1Aligned.delete();
        circle2Aligned.delete();

        const qCircle1 = new this.occ.GccEnt_QualifiedCirc(circle1, this.enumService.getGccEntPositionFromEnum(Inputs.OCCT.gccEntPositionEnum.unqualified));
        const qCircle2 = new this.occ.GccEnt_QualifiedCirc(circle2, this.enumService.getGccEntPositionFromEnum(Inputs.OCCT.gccEntPositionEnum.unqualified));

        circle1.delete();
        circle2.delete();

        const lin1 = new this.occ.GccAna_Circ2d2TanRad_1(qCircle1, qCircle2, inputs.radius, inputs.tolerance);

        qCircle1.delete();
        qCircle2.delete();

        const lin1Sols: gp_Circ2d[] = [];
        for (let i = 1; i <= lin1.NbSolutions(); i++) {
            const sol = lin1.ThisSolution(i);
            lin1Sols.push(sol);
        }
        lin1.delete();

        const solutions = [];
        for (let i = 0; i < lin1Sols.length; i++) {
            const sol = lin1Sols[i];
            const res = this.reconstructCircleAndAlignBack(lin1Sols, sol, alignOpt, cirDir, cirPos);
            solutions.push(res);
        }

        return solutions;
    }

    divideEdgeByParamsToPoints(inputs: Inputs.OCCT.DivideDto<TopoDS_Edge>): Inputs.Base.Point3[] {
        const edge = inputs.shape;
        const wire = this.converterService.combineEdgesAndWiresIntoAWire({ shapes: [edge] });
        const curve = new this.occ.BRepAdaptor_CompCurve_2(wire, false);
        const points = this.geomService.divideCurveToNrSegments({ ...inputs, shape: curve }, curve.FirstParameter(), curve.LastParameter());
        curve.delete();
        wire.delete();
        return points;
    }

    divideEdgeByEqualDistanceToPoints(inputs: Inputs.OCCT.DivideDto<TopoDS_Edge>): Base.Point3[] {
        const edge = inputs.shape;
        const wire = this.converterService.combineEdgesAndWiresIntoAWire({ shapes: [edge] });
        const curve = new this.occ.BRepAdaptor_CompCurve_2(wire, false);
        const points = this.geomService.divideCurveByEqualLengthDistance({ ...inputs, shape: curve });
        curve.delete();
        wire.delete();
        return points;
    }

    pointOnEdgeAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<TopoDS_Edge>): Base.Point3 {
        const edge = inputs.shape;
        const { uMin, uMax } = this.getEdgeBounds(edge);
        const curve = this.converterService.getGeomCurveFromEdge(edge, uMin, uMax);
        const gpPnt = this.entitiesService.gpPnt([0, 0, 0]);
        const param = this.vecHelper.remap(inputs.param, 0, 1, uMin, uMax);
        if (curve) {
            curve.D0(param, gpPnt);
            const pt: Base.Point3 = [gpPnt.X(), gpPnt.Y(), gpPnt.Z()];
            gpPnt.delete();
            return pt;
        } else {
            return undefined;
        }
    }

    private reconstructCircleAndAlignBack(lin1Sols: gp_Circ2d[], sol: gp_Circ2d, alignOpt: Inputs.OCCT.AlignDto<TopoDS_Shape>, dir: Base.Vector3, pos: Base.Point3) {
        const locationStart = sol.Location();
        const startPoint = [locationStart.X(), locationStart.Y(), 0] as Inputs.Base.Point3;
        const circle = this.entitiesService.createCircle(sol.Radius(), startPoint, [0, 0, 1], Inputs.OCCT.typeSpecificityEnum.edge) as TopoDS_Edge;
        alignOpt.fromDirection = [0, 0, 1];
        alignOpt.toDirection = dir;
        alignOpt.fromOrigin = [0, 0, 0];
        alignOpt.toOrigin = pos;
        alignOpt.shape = circle;
        const aligned = this.transformsService.align(alignOpt);
        circle.delete();
        sol.delete();
        locationStart.delete();
        return aligned;
    }

    arcFromCircleAndTwoPoints(inputs: Inputs.OCCT.ArcEdgeCircleTwoPointsDto<TopoDS_Edge>) {
        const circle = this.getGpCircleFromEdge({ shape: inputs.circle });
        const gpPnt1 = this.entitiesService.gpPnt(inputs.start);
        const gpPnt2 = this.entitiesService.gpPnt(inputs.end);
        const arc = new this.occ.GC_MakeArcOfCircle_3(circle, gpPnt1, gpPnt2, inputs.sense);
        const hcurve = new this.occ.Handle_Geom_Curve_2(arc.Value().get());
        const makeEdge = new this.occ.BRepBuilderAPI_MakeEdge_24(hcurve);
        const shape = makeEdge.Edge();
        circle.delete();
        gpPnt1.delete();
        gpPnt2.delete();
        arc.delete();
        hcurve.delete();
        makeEdge.delete();
        return shape;
    }


    getCircularEdgePlaneDirection(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>): Inputs.Base.Vector3 {
        const circle = this.getGpCircleFromEdge(inputs);
        const axis = circle.Position();
        const dir = axis.Direction();
        const result = [dir.X(), dir.Y(), dir.Z()] as Inputs.Base.Vector3;
        dir.delete();
        axis.delete();
        circle.delete();
        return result;
    }

    getCircularEdgeCenterPoint(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>): Inputs.Base.Point3 {
        const circle = this.getGpCircleFromEdge(inputs);
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

    private getGpCircleFromEdge(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>) {
        const curve = new this.occ.BRepAdaptor_Curve_2(inputs.shape);
        try {
            const circle = curve.Circle();
            curve.delete();
            return circle;
        } catch (ex) {
            curve.delete();
            throw new Error("Edge is not a circular edge.");
        }
    }

    getGpCircle2dFromEdge(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>) {
        const curve = new this.occ.BRepAdaptor_Curve_2(inputs.shape);
        try {
            const circle = curve.Circle();
            const ax = circle.Position();
            const location = circle.Location();
            const ax2d = this.entitiesService.gpAx2d([location.X(), location.Y()], [1, 0]);
            const radius = circle.Radius();
            const circle2d = new this.occ.gp_Circ2d_2(ax2d, radius, true);
            curve.delete();
            circle.delete();
            ax.delete();
            location.delete();
            ax2d.delete();
            return circle2d;
        } catch (ex) {
            curve.delete();
            throw new Error("Edge is not a circular edge.");
        }
    }


    tangentOnEdgeAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<TopoDS_Edge>): Base.Vector3 {
        const edge = inputs.shape;
        const { uMin, uMax } = this.getEdgeBounds(edge);
        const curve = this.converterService.getGeomCurveFromEdge(edge, uMin, uMax);
        const param = this.vecHelper.remap(inputs.param, 0, 1, uMin, uMax);
        const vec = curve.DN(param, 1);
        const vector: Base.Vector3 = [vec.X(), vec.Y(), vec.Z()];
        vec.delete();
        return vector;
    }

    pointOnEdgeAtLength(inputs: Inputs.OCCT.DataOnGeometryAtLengthDto<TopoDS_Edge>): Base.Point3 {
        const edge = inputs.shape;
        const wire = this.converterService.combineEdgesAndWiresIntoAWire({ shapes: [edge] });
        const curve = new this.occ.BRepAdaptor_CompCurve_2(wire, false);
        const res = this.geomService.pointOnCurveAtLength({ ...inputs, shape: curve });
        curve.delete();
        wire.delete();
        return res;
    }

    tangentOnEdgeAtLength(inputs: Inputs.OCCT.DataOnGeometryAtLengthDto<TopoDS_Edge>): Base.Point3 {
        const edge = inputs.shape;
        const wire = this.converterService.combineEdgesAndWiresIntoAWire({ shapes: [edge] });
        const curve = new this.occ.BRepAdaptor_CompCurve_2(wire, false);
        const res = this.geomService.tangentOnCurveAtLength({ ...inputs, shape: curve });
        wire.delete();
        curve.delete();
        return res;
    }

    getEdgeBounds(edge: TopoDS_Edge): { uMin: number, uMax: number } {
        const p1 = { current: 0 };
        const p2 = { current: 0 };
        this.occRefReturns.BRep_Tool_Range_1(edge, p1, p2);
        return { uMin: p1.current, uMax: p2.current };
    }


    isEdgeCircular(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>) {
        const curve = new this.occ.BRepAdaptor_Curve_2(inputs.shape);
        try {
            curve.Circle();
            curve.delete();
            return true;
        } catch (ex) {
            return false;
        }
    }

    isEdgeLinear(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>) {
        const curve = new this.occ.BRepAdaptor_Curve_2(inputs.shape);
        try {
            curve.Line();
            curve.delete();
            return true;
        } catch (ex) {
            return false;
        }
    }





}
