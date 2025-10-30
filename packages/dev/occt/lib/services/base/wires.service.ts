import {
    GeomAbs_Shape, Geom_Surface, OpenCascadeInstance,
    TopoDS_Compound, TopoDS_Edge, TopoDS_Shape, TopoDS_Wire, gp_Pnt, gp_Pnt_3
} from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../../api/inputs/inputs";
import { Base } from "../../api/inputs/inputs";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCReferencedReturns } from "../../occ-referenced-returns";
import { EdgesService } from "./edges.service";
import { ShapeGettersService } from "./shape-getters";
import { EntitiesService } from "./entities.service";
import { GeomService } from "./geom.service";
import { TransformsService } from "./transforms.service";
import { ConverterService } from "./converter.service";
import { EnumService } from "./enum.service";
import { TextWiresDataDto, ObjectDefinition } from "../../api/models/bucket";
import { OperationsService } from "./operations.service";
import { FilletsService } from "./fillets.service";
import { BaseBitByBit } from "../../base";
import { VectorHelperService } from "../../api/vector-helper.service";
export class WiresService {

    constructor(
        private readonly occ: OpenCascadeInstance,
        private readonly occRefReturns: OCCReferencedReturns,
        private readonly base: BaseBitByBit,
        private readonly shapesHelperService: ShapesHelperService,
        private readonly shapeGettersService: ShapeGettersService,
        private readonly transformsService: TransformsService,
        private readonly enumService: EnumService,
        private readonly entitiesService: EntitiesService,
        private readonly converterService: ConverterService,
        private readonly geomService: GeomService,
        private readonly edgesService: EdgesService,
        private readonly vecHelper: VectorHelperService,
        public filletsService: FilletsService,
        public operationsService: OperationsService,
    ) { }

    getWireLength(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): number {
        const curve = new this.occ.BRepAdaptor_CompCurve_2(inputs.shape, false);
        const length = this.geomService.curveLength({ shape: curve });
        curve.delete();
        return length;
    }

    getWiresLengths(inputs: Inputs.OCCT.ShapesDto<TopoDS_Wire>): number[] {
        if (inputs.shapes === undefined) {
            throw (Error(("Shapes are not defined")));
        }
        return inputs.shapes.map(wire => this.getWireLength({ shape: wire }));
    }

    createRectangleWire(inputs: Inputs.OCCT.RectangleDto): TopoDS_Wire {
        const cw = inputs.width / 2;
        const cl = inputs.length / 2;
        const pt1: Base.Point3 = [cw, 0, cl];
        const pt2: Base.Point3 = [-cw, 0, cl];
        const pt3: Base.Point3 = [-cw, 0, -cl];
        const pt4: Base.Point3 = [cw, 0, -cl];
        const points = [pt1, pt2, pt3, pt4].reverse();
        const wire = this.createPolygonWire({ points });
        const alignedWire = this.transformsService.alignAndTranslate({ shape: wire, direction: inputs.direction, center: inputs.center });
        wire.delete();
        return alignedWire;
    }


    createSquareWire(inputs: Inputs.OCCT.SquareDto): TopoDS_Wire {
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
        const result = this.converterService.getActualTypeOfShape(reversed);
        reversed.delete();
        return result;
    }

    reversedWireFromReversedEdges(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): TopoDS_Wire {
        const wire: TopoDS_Wire = inputs.shape;
        const edges = this.edgesService.getEdgesAlongWire({ shape: wire });
        const reversedEdges = edges.map(e => {
            return this.converterService.getActualTypeOfShape(e.Reversed());
        });
        const reversed = this.converterService.combineEdgesAndWiresIntoAWire({ shapes: reversedEdges.reverse() });
        const result = this.converterService.getActualTypeOfShape(reversed);
        reversed.delete();
        reversedEdges.forEach(e => e.delete());
        return result;
    }

    createChristmasTreeWire(inputs: Inputs.OCCT.ChristmasTreeDto) {
        const frameInner = this.createLineWire({
            start: [inputs.innerDist, 0, 0],
            end: [0, inputs.height, 0],
        });

        const frameOuter = this.createLineWire({
            start: [inputs.outerDist, 0, 0],
            end: [0, inputs.height, 0],
        });

        const pointsOnInner = this.divideWireByEqualDistanceToPoints({
            shape: frameInner,
            nrOfDivisions: inputs.nrSkirts,
            removeEndPoint: false,
            removeStartPoint: false,
        });

        const pointsOnOuter = this.divideWireByEqualDistanceToPoints({
            shape: frameOuter,
            nrOfDivisions: inputs.nrSkirts,
            removeEndPoint: false,
            removeStartPoint: false,
        });
        const halfShapeTreePts: Base.Point3[] = [];
        if (inputs.trunkWidth > 0 && inputs.trunkHeight > 0) {
            halfShapeTreePts.push([0, -inputs.trunkHeight, 0]);
            halfShapeTreePts.push([inputs.trunkWidth / 2, -inputs.trunkHeight, 0]);
            halfShapeTreePts.push([inputs.trunkWidth / 2, 0, 0]);
        } else {
            halfShapeTreePts.push([0, 0, 0]);
        }

        pointsOnInner.forEach((pt, index) => {
            const ptOnOuter = pointsOnOuter[index];
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

        let result;
        if (inputs.trunkHeight > 0 && inputs.trunkWidth > 0) {
            const offsetToTrunkHeight = halfShapeTreePts.map(pt => [pt[0], pt[1] + inputs.trunkHeight, pt[2]] as Base.Point3);
            result = this.createPolylineWire({ points: offsetToTrunkHeight });
        } else {
            result = this.createPolylineWire({ points: halfShapeTreePts });
        }

        const rotated = this.transformsService.rotate({ shape: result, angle: inputs.rotation, axis: [0, 1, 0] });
        const aligned = this.transformsService.alignAndTranslate({ shape: rotated, direction: inputs.direction, center: inputs.origin });

        return aligned;
    }

    createStarWire(inputs: Inputs.OCCT.StarDto) {
        const lines = this.shapesHelperService.starLines(inputs.innerRadius, inputs.outerRadius, inputs.numRays, inputs.half, inputs.offsetOuterEdges);
        const edges: TopoDS_Edge[] = [];
        lines.forEach(line => {
            edges.push(this.edgesService.lineEdge(line));
        });
        const wire = this.converterService.combineEdgesAndWiresIntoAWire({ shapes: edges });
        const alignedWire = this.transformsService.alignAndTranslate({ shape: wire, direction: inputs.direction, center: inputs.center });
        wire.delete();
        return alignedWire;
    }

    createParallelogramWire(inputs: Inputs.OCCT.ParallelogramDto) {
        const lines = this.shapesHelperService.parallelogram(inputs.width, inputs.height, inputs.angle, inputs.aroundCenter);
        const edges: TopoDS_Edge[] = [];
        lines.forEach(line => {
            edges.push(this.edgesService.lineEdge(line));
        });
        const wire = this.converterService.combineEdgesAndWiresIntoAWire({ shapes: edges });
        const aligned = this.transformsService.alignAndTranslate({ shape: wire, direction: inputs.direction, center: inputs.center });
        wire.delete();
        return aligned;
    }

    createHeartWire(inputs: Inputs.OCCT.Heart2DDto) {
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

    createNGonWire(inputs: Inputs.OCCT.NGonWireDto) {
        const lines = this.shapesHelperService.ngon(inputs.nrCorners, inputs.radius, [0, 0]);
        const edges: TopoDS_Edge[] = [];
        lines.forEach(line => {
            edges.push(this.edgesService.lineEdge(line));
        });
        const wire = this.converterService.combineEdgesAndWiresIntoAWire({ shapes: edges });
        const aligned = this.transformsService.alignAndTranslate({ shape: wire, direction: inputs.direction, center: inputs.center });
        wire.delete();
        return aligned;
    }

    createLPolygonWire(inputs: Inputs.OCCT.LPolygonDto) {
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
        const wire = this.createPolygonWire({
            points
        });

        const rotated = this.transformsService.rotate({ shape: wire, angle: inputs.rotation, axis: [0, 1, 0] });
        const aligned = this.transformsService.alignAndTranslate({ shape: rotated, direction: inputs.direction, center: inputs.center });
        wire.delete();
        rotated.delete();
        return aligned;
    }

    createPolygonWire(inputs: Inputs.OCCT.PolygonDto) {
        const gpPoints: gp_Pnt_3[] = [];
        for (let ind = 0; ind < inputs.points.length; ind++) {
            gpPoints.push(this.entitiesService.gpPnt(inputs.points[ind]));
        }

        const wireMaker = new this.occ.BRepBuilderAPI_MakeWire_1();
        for (let ind = 0; ind < inputs.points.length - 1; ind++) {
            const pt1 = gpPoints[ind];
            const pt2 = gpPoints[ind + 1];
            const innerWire = this.makeWireBetweenTwoPoints(pt1, pt2);
            wireMaker.Add_2(innerWire);
        }

        const pt1 = gpPoints[inputs.points.length - 1];
        const pt2 = gpPoints[0];
        const innerWire2 = this.makeWireBetweenTwoPoints(pt1, pt2);
        wireMaker.Add_2(innerWire2);
        const wire = wireMaker.Wire();
        wireMaker.delete();
        return wire;
    }

    createPolylineWire(inputs: Inputs.OCCT.PolylineDto) {
        const gpPoints: gp_Pnt_3[] = [];
        for (let ind = 0; ind < inputs.points.length; ind++) {
            gpPoints.push(this.entitiesService.gpPnt(inputs.points[ind]));
        }

        const wireMaker = new this.occ.BRepBuilderAPI_MakeWire_1();
        for (let ind = 0; ind < inputs.points.length - 1; ind++) {
            const pt1 = gpPoints[ind];
            const pt2 = gpPoints[ind + 1];
            const innerWire = this.makeWireBetweenTwoPoints(pt1, pt2);
            wireMaker.Add_2(innerWire);
        }

        const wire = wireMaker.Wire();
        wireMaker.delete();
        return wire;
    }

    createLineWire(inputs: Inputs.OCCT.LineDto) {
        const gpPoints: gp_Pnt_3[] = [];
        gpPoints.push(this.entitiesService.gpPnt(inputs.start));
        gpPoints.push(this.entitiesService.gpPnt(inputs.end));

        const wireMaker = new this.occ.BRepBuilderAPI_MakeWire_1();
        for (let ind = 0; ind < gpPoints.length - 1; ind++) {
            const pt1 = gpPoints[ind];
            const pt2 = gpPoints[ind + 1];
            const innerWire = this.makeWireBetweenTwoPoints(pt1, pt2);
            wireMaker.Add_2(innerWire);
        }

        const wire = wireMaker.Wire();
        wireMaker.delete();
        return wire;
    }

    createLineWireWithExtensions(inputs: Inputs.OCCT.LineWithExtensionsDto): TopoDS_Wire {
        const direction = this.base.vector.normalized({ vector: this.base.vector.sub({ first: inputs.end, second: inputs.start }) });
        const scaledVecStart = this.base.vector.mul({ vector: direction, scalar: -inputs.extensionStart });
        const scaledVecEnd = this.base.vector.mul({ vector: direction, scalar: inputs.extensionEnd });
        const start = this.base.vector.add({ first: inputs.start, second: scaledVecStart }) as Base.Point3;
        const end = this.base.vector.add({ first: inputs.end, second: scaledVecEnd }) as Base.Point3;
        return this.createLineWire({ start, end });
    }

    private makeWireBetweenTwoPoints(pt1: gp_Pnt, pt2: gp_Pnt) {
        const seg = new this.occ.GC_MakeSegment_1(pt1, pt2);
        const segVal = seg.Value();
        const segment = segVal.get();
        const edgeMaker = new this.occ.BRepBuilderAPI_MakeEdge_24(
            new this.occ.Handle_Geom_Curve_2(segment)
        );
        const edge = edgeMaker.Edge();
        const wireMaker = new this.occ.BRepBuilderAPI_MakeWire_2(edge);
        const innerWire = wireMaker.Wire();

        edgeMaker.delete();
        seg.delete();
        segVal.delete();
        segment.delete();
        edge.delete();
        wireMaker.delete();
        return innerWire;
    }



    divideWireByParamsToPoints(inputs: Inputs.OCCT.DivideDto<TopoDS_Wire>): Inputs.Base.Point3[] {
        const wire = inputs.shape;
        const curve = new this.occ.BRepAdaptor_CompCurve_2(wire, false);
        const points = this.geomService.divideCurveToNrSegments({ ...inputs, shape: curve }, curve.FirstParameter(), curve.LastParameter());
        curve.delete();
        return points;
    }

    divideWireByEqualDistanceToPoints(inputs: Inputs.OCCT.DivideDto<TopoDS_Wire>): Base.Point3[] {
        const wire = inputs.shape;
        const curve = new this.occ.BRepAdaptor_CompCurve_2(wire, false);
        const points = this.geomService.divideCurveByEqualLengthDistance({ ...inputs, shape: curve });
        curve.delete();
        return points;
    }

    pointOnWireAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<TopoDS_Wire>): Base.Point3 {
        const wire = inputs.shape;
        const curve = new this.occ.BRepAdaptor_CompCurve_2(wire, false);
        const pt = this.geomService.pointOnCurveAtParam({ ...inputs, shape: curve });
        curve.delete();
        return pt;
    }

    tangentOnWireAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<TopoDS_Wire>): Base.Point3 {
        const wire = inputs.shape;
        const curve = new this.occ.BRepAdaptor_CompCurve_2(wire, false);
        const tangent = this.geomService.tangentOnCurveAtParam({ ...inputs, shape: curve });
        curve.delete();
        return tangent;
    }

    pointOnWireAtLength(inputs: Inputs.OCCT.DataOnGeometryAtLengthDto<TopoDS_Wire>): Base.Point3 {
        const wire = inputs.shape;
        const curve = new this.occ.BRepAdaptor_CompCurve_2(wire, false);
        const res = this.geomService.pointOnCurveAtLength({ ...inputs, shape: curve });
        curve.delete();
        return res;
    }

    pointsOnWireAtLengths(inputs: Inputs.OCCT.DataOnGeometryAtLengthsDto<TopoDS_Wire>): Base.Point3[] {
        const wire = inputs.shape;
        const curve = new this.occ.BRepAdaptor_CompCurve_2(wire, false);
        const res = this.geomService.pointsOnCurveAtLengths({ ...inputs, shape: curve });
        curve.delete();
        return res;
    }

    pointsOnWireAtEqualLength(inputs: Inputs.OCCT.PointsOnWireAtEqualLengthDto<TopoDS_Wire>): Base.Point3[] {
        const wire = inputs.shape;
        const curve = new this.occ.BRepAdaptor_CompCurve_2(wire, false);
        const wireLength = this.getWireLength({ shape: wire });
        const nrOfLengths = wireLength / inputs.length;
        const lengths = [];
        let total = 0;
        for (let i = 0; i < nrOfLengths; i++) {
            lengths.push(inputs.length * i);
            total += inputs.length;
        }
        if (!inputs.includeFirst) {
            lengths.shift();
        }
        if (inputs.tryNext) {
            lengths.push(total + inputs.length);
        }
        const res = this.geomService.pointsOnCurveAtLengths({ lengths, shape: curve });
        if (inputs.includeLast) {
            res.push(this.endPointOnWire({ shape: wire }));
        }
        curve.delete();
        return res;
    }

    pointsOnWireAtPatternOfLengths(inputs: Inputs.OCCT.PointsOnWireAtPatternOfLengthsDto<TopoDS_Wire>): Base.Point3[] {
        const wire = inputs.shape;
        const curve = new this.occ.BRepAdaptor_CompCurve_2(wire, false);
        const wireLength = this.getWireLength({ shape: wire });
        const lengths = [];
        let total = 0;
        let lastIndex = 0;
        let reachedGoal = false;
        while (!reachedGoal) {
            for (let i = 0; i < inputs.lengths.length; i++) {
                const length = inputs.lengths[i];
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
                lengths.push(total + inputs.lengths[lastIndex + 1]);
            } else {
                lengths.push(total + inputs.lengths[0]);
            }
        }
        const res = this.geomService.pointsOnCurveAtLengths({ lengths, shape: curve });
        if (inputs.includeLast) {
            res.push(this.endPointOnWire({ shape: wire }));
        }
        curve.delete();
        return res;
    }

    tangentOnWireAtLength(inputs: Inputs.OCCT.DataOnGeometryAtLengthDto<TopoDS_Wire>): Base.Point3 {
        const wire = inputs.shape;
        const curve = new this.occ.BRepAdaptor_CompCurve_2(wire, false);
        const res = this.geomService.tangentOnCurveAtLength({ ...inputs, shape: curve });
        curve.delete();
        return res;
    }

    interpolatePoints(inputs: Inputs.OCCT.InterpolationDto) {

        const ptList = new this.occ.TColgp_Array1OfPnt_2(1, inputs.points.length);
        const gpPnts: gp_Pnt_3[] = [];
        for (let pIndex = 1; pIndex <= inputs.points.length; pIndex++) {
            const gpPnt = this.entitiesService.gpPnt(inputs.points[pIndex - 1]);
            gpPnts.push(gpPnt);
            ptList.SetValue(pIndex, gpPnt);
        }
        const geomBSplineHandle = this.occ.BitByBitDev.BitInterpolate(ptList, inputs.periodic, inputs.tolerance);
        if (!geomBSplineHandle.IsNull()) {
            const geomBSpline = geomBSplineHandle.get();
            const geomCrvHandle = new this.occ.Handle_Geom_Curve_2(geomBSpline);
            const edgeMaker = new this.occ.BRepBuilderAPI_MakeEdge_24(geomCrvHandle);
            const edge = edgeMaker.Edge();
            const wireMaker = new this.occ.BRepBuilderAPI_MakeWire_2(edge);
            const wire = wireMaker.Wire();

            geomBSplineHandle.Nullify();
            geomBSplineHandle.delete();
            geomCrvHandle.Nullify();
            geomCrvHandle.delete();
            edgeMaker.delete();
            edge.delete();
            wireMaker.delete();
            gpPnts.forEach(p => p.delete());
            ptList.delete();
            return wire;
        } else {
            gpPnts.forEach(p => p.delete());
            ptList.delete();
            return undefined;
        }

    }

    isWireClosed(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): boolean {
        const tolerance = 1.0e-7;
        const startPointOnWire = this.startPointOnWire({ shape: inputs.shape });
        const endPointOnWire = this.endPointOnWire({ shape: inputs.shape });

        // This is needed to make follow up algorithm to work properly on open wires
        const wireIsClosed = this.base.vector.vectorsTheSame({ vec1: endPointOnWire, vec2: startPointOnWire, tolerance });
        return wireIsClosed;
    }

    splitOnPoints(inputs: Inputs.OCCT.SplitWireOnPointsDto<TopoDS_Wire>): TopoDS_Wire[] {
        const wire = inputs.shape;
        const splitPoints = inputs.points;

        // 1. Get the list of edges from the wire
        const edges = this.shapeGettersService.getEdges({ shape: wire });
        if (edges.length === 0) return [];

        // 2. Collect split locations as {edgeIndex, parameter}
        const splitLocations: { edgeIndex: number; parameter: number }[] = [];

        // Add the wire's start point
        const firstEdge = edges[0];
        let first = { current: 0 };
        let last = { current: 0 };
        this.occRefReturns.BRep_Tool_Curve_2(firstEdge, first, last);
        splitLocations.push({ edgeIndex: 0, parameter: first.current });

        // Project each split point onto the wire
        splitPoints.forEach((pt) => {
            let minDist = Infinity;
            let bestEdgeIndex = -1;
            let bestParam = 0;

            edges.forEach((edge, index) => {
                const first = { current: 0 };
                const last = { current: 0 };
                const curve = this.occRefReturns.BRep_Tool_Curve_2(edge, first, last);
                const firstVal = first.current;
                const lastVal = last.current;

                const gpPnt = this.entitiesService.gpPnt(pt);
                const projector = new this.occ.GeomAPI_ProjectPointOnCurve_2(gpPnt, curve);
                if (projector.NbPoints() > 0) {
                    const param = projector.LowerDistanceParameter();
                    // Clamp the parameter to the edge's range
                    const clampedParam = Math.max(firstVal, Math.min(lastVal, param));
                    const dist = projector.Distance(1); // Use the first projection point
                    if (dist < minDist) {
                        minDist = dist;
                        bestEdgeIndex = index;
                        bestParam = clampedParam;
                    }
                }
            });

            if (bestEdgeIndex >= 0) {
                splitLocations.push({ edgeIndex: bestEdgeIndex, parameter: bestParam });
            }
        });

        // Add the wire's end point
        const lastEdge = edges[edges.length - 1];
        first = { current: 0 };
        last = { current: 0 };
        this.occRefReturns.BRep_Tool_Curve_2(lastEdge, first, last);
        splitLocations.push({ edgeIndex: edges.length - 1, parameter: last.current });

        // 3. Remove duplicates and sort split locations by edgeIndex, then parameter
        const uniqueLocations = splitLocations.filter((loc, index, self) =>
            index === self.findIndex((t) => t.edgeIndex === loc.edgeIndex && t.parameter === loc.parameter)
        );
        uniqueLocations.sort((a, b) => {
            if (a.edgeIndex !== b.edgeIndex) return a.edgeIndex - b.edgeIndex;
            return a.parameter - b.parameter;
        });

        // 4. Create new wires between consecutive split locations
        const newWires: TopoDS_Wire[] = [];
        for (let i = 0; i < uniqueLocations.length - 1; i++) {
            const startLoc = uniqueLocations[i];
            const endLoc = uniqueLocations[i + 1];
            const wireBuilder = new this.occ.BRepBuilderAPI_MakeWire_1();

            if (startLoc.edgeIndex === endLoc.edgeIndex) {
                // Same edge: create a single trimmed edge
                const edge = edges[startLoc.edgeIndex];
                const first = { current: 0 };
                const last = { current: 0 };
                const curve = this.occRefReturns.BRep_Tool_Curve_2(edge, first, last);

                // Avoid zero-length segments
                if (startLoc.parameter === endLoc.parameter) continue;

                const trimmedCurve = new this.occ.Geom_TrimmedCurve(
                    curve,
                    startLoc.parameter,
                    endLoc.parameter,
                    true,
                    true
                );
                const handleTrimmedCurve = new this.occ.Handle_Geom_Curve_2(trimmedCurve);
                const newEdge = new this.occ.BRepBuilderAPI_MakeEdge_24(handleTrimmedCurve).Edge();
                wireBuilder.Add_1(newEdge);
            } else {
                // Spans multiple edges
                // Trim the start edge
                const startEdge = edges[startLoc.edgeIndex];
                const startFirst = { current: 0 };
                const startLast = { current: 0 };
                const startCurve = this.occRefReturns.BRep_Tool_Curve_2(startEdge, startFirst, startLast);
                const startLastVal = startLast.current;

                if (startLoc.parameter < startLastVal) {
                    const trimmedStartCurve = new this.occ.Geom_TrimmedCurve(
                        startCurve,
                        startLoc.parameter,
                        startLastVal,
                        true,
                        true
                    );
                    const handleTrimmedStartCurve = new this.occ.Handle_Geom_Curve_2(trimmedStartCurve);
                    const newStartEdge = new this.occ.BRepBuilderAPI_MakeEdge_24(handleTrimmedStartCurve).Edge();
                    wireBuilder.Add_1(newStartEdge);
                }

                // Add full edges in between
                for (let j = startLoc.edgeIndex + 1; j < endLoc.edgeIndex; j++) {
                    wireBuilder.Add_1(edges[j]);
                }

                // Trim the end edge
                const endEdge = edges[endLoc.edgeIndex];
                const endFirst = { current: 0 };
                const endLast = { current: 0 };
                const endCurve = this.occRefReturns.BRep_Tool_Curve_2(endEdge, endFirst, endLast);
                const endFirstVal = endFirst.current;

                if (endLoc.parameter > endFirstVal) {
                    const trimmedEndCurve = new this.occ.Geom_TrimmedCurve(
                        endCurve,
                        endFirstVal,
                        endLoc.parameter,
                        true,
                        true
                    );
                    const handleTrimmedEndCurve = new this.occ.Handle_Geom_Curve_2(trimmedEndCurve);
                    const newEndEdge = new this.occ.BRepBuilderAPI_MakeEdge_24(handleTrimmedEndCurve).Edge();
                    wireBuilder.Add_1(newEndEdge);
                }
            }

            if (wireBuilder.IsDone()) {
                const newWire = wireBuilder.Wire();
                newWires.push(newWire);
            }
        }

        return newWires;
    }

    createLines(inputs: Inputs.OCCT.LinesDto): TopoDS_Wire[] | TopoDS_Compound {
        const wires = inputs.lines.map(p => this.createLineWire(p)).filter(s => s !== undefined);
        return this.converterService.makeCompoundIfNeeded(wires, inputs.returnCompound);
    }

    createWireFromTwoCirclesTan(inputs: Inputs.OCCT.WireFromTwoCirclesTanDto<TopoDS_Wire>) {
        const circleEdge1 = this.shapeGettersService.getEdges({ shape: inputs.circle1 });
        const circleEdge2 = this.shapeGettersService.getEdges({ shape: inputs.circle2 });
        if (circleEdge1.length === 1 && circleEdge2.length === 1) {
            const circularEdge1 = circleEdge1[0];
            const circularEdge2 = circleEdge2[0];
            const result = this.edgesService.constraintTanLinesOnTwoCircles({
                circle1: circularEdge1,
                circle2: circularEdge2,
                positionResult: inputs.keepLines === Inputs.OCCT.twoSidesStrictEnum.outside ? Inputs.OCCT.positionResultEnum.keepSide2 : Inputs.OCCT.positionResultEnum.keepSide1,
                circleRemainders: this.enumService.convertFourSidesStrictEnumToTwoCircleInclusionEnum(inputs.circleRemainders),
                tolerance: inputs.tolerance,
            });
            const wire = this.converterService.combineEdgesAndWiresIntoAWire({ shapes: result });
            result.forEach(e => e.delete());
            circularEdge1.delete();
            circularEdge2.delete();
            return wire;
        } else {
            throw new Error("Could not find the edges of the provided circle wires.");
        }
    }


    createZigZagBetweenTwoWires(inputs: Inputs.OCCT.ZigZagBetweenTwoWiresDto<TopoDS_Wire>) {
        const wire1 = inputs.wire1;
        const wire2 = inputs.wire2;

        let points1 = [];
        let points2 = [];

        if (inputs.zigZagsPerEdge) {
            const edges1 = this.edgesService.getEdgesAlongWire({ shape: wire1 });
            const edges2 = this.edgesService.getEdgesAlongWire({ shape: wire2 });
            if (inputs.divideByEqualDistance) {
                points1 = edges1.map(e => this.edgesService.divideEdgeByEqualDistanceToPoints({ shape: e, nrOfDivisions: inputs.nrZigZags * 2, removeEndPoint: false, removeStartPoint: false }));
                points2 = edges2.map(e => this.edgesService.divideEdgeByEqualDistanceToPoints({ shape: e, nrOfDivisions: inputs.nrZigZags * 2, removeEndPoint: false, removeStartPoint: false }));
            } else {
                points1 = edges1.map(e => this.edgesService.divideEdgeByParamsToPoints({ shape: e, nrOfDivisions: inputs.nrZigZags * 2, removeEndPoint: false, removeStartPoint: false }));
                points2 = edges2.map(e => this.edgesService.divideEdgeByParamsToPoints({ shape: e, nrOfDivisions: inputs.nrZigZags * 2, removeEndPoint: false, removeStartPoint: false }));
            }
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
            const pts2 = points2[index];

            const ptsInZigZagOrder = [];
            for (let i = 0; i < pts1.length; i++) {
                if (i % 2 === 0) {
                    if (inputs.inverse) {
                        ptsInZigZagOrder.push(pts2[i]);
                    } else {
                        ptsInZigZagOrder.push(pts1[i]);
                    }
                } else {
                    if (inputs.inverse) {
                        ptsInZigZagOrder.push(pts1[i]);
                    } else {
                        ptsInZigZagOrder.push(pts2[i]);
                    }
                }
            }
            return this.createPolylineWire({ points: ptsInZigZagOrder });
        });
        return this.converterService.combineEdgesAndWiresIntoAWire({ shapes: wires });
    }

    getWireCenterOfMass(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): Base.Point3 {
        return this.geomService.getLinearCenterOfMass(inputs);
    }

    hexagonsInGrid(inputs: Inputs.OCCT.HexagonsInGridDto): TopoDS_Wire[] {
        const hex = this.base.point.hexGridScaledToFit({ ...inputs, centerGrid: true, pointsOnGround: true });
        const wires = hex.hexagons.map(hex => {
            return this.createPolygonWire({ points: hex });
        });

        let currentScalePatternWidthIndex = 0;
        let currentScalePatternHeightIndex = 0;
        let currentInclusionPatternIndex = 0;
        let currentFilletPatternIndex = 0;

        const res = [];

        for (let i = 0; i < inputs.nrHexagonsInHeight; i++) {
            for (let j = 0; j < inputs.nrHexagonsInWidth; j++) {

                let scaleFromPatternWidth = 1;
                if (inputs.scalePatternWidth && inputs.scalePatternWidth.length > 0) {
                    scaleFromPatternWidth = inputs.scalePatternWidth[currentScalePatternWidthIndex];
                    currentScalePatternWidthIndex++;
                    if (currentScalePatternWidthIndex >= inputs.scalePatternWidth.length) {
                        currentScalePatternWidthIndex = 0;
                    }
                }

                let scaleFromPatternHeight = 1;
                if (inputs.scalePatternHeight && inputs.scalePatternHeight.length > 0) {
                    scaleFromPatternHeight = inputs.scalePatternHeight[currentScalePatternHeightIndex];
                    currentScalePatternHeightIndex++;
                    if (currentScalePatternHeightIndex >= inputs.scalePatternHeight.length) {
                        currentScalePatternHeightIndex = 0;
                    }
                }
                let include = true;
                if (inputs.inclusionPattern && inputs.inclusionPattern.length > 0) {
                    include = inputs.inclusionPattern[currentInclusionPatternIndex];
                    currentInclusionPatternIndex++;
                    if (currentInclusionPatternIndex >= inputs.inclusionPattern.length) {
                        currentInclusionPatternIndex = 0;
                    }
                }

                let fillet = 0;
                if (inputs.filletPattern && inputs.filletPattern.length > 0) {
                    fillet = inputs.filletPattern[currentFilletPatternIndex];
                    currentFilletPatternIndex++;
                    if (currentFilletPatternIndex >= inputs.filletPattern.length) {
                        currentFilletPatternIndex = 0;
                    }
                }

                if (include) {
                    fillet = hex.maxFilletRadius * fillet;

                    const hexagon = wires[i * inputs.nrHexagonsInWidth + j];
                    const hexagonCenter = hex.centers[i * inputs.nrHexagonsInWidth + j];

                    if (fillet > 0) {
                        const filletRectangle = this.filletsService.fillet2d({
                            shape: hexagon,
                            radius: fillet,
                        });

                        const scaleVec2 = [scaleFromPatternWidth, 1, scaleFromPatternHeight] as Base.Vector3;
                        let hexScaled = filletRectangle;
                        if (scaleFromPatternWidth !== 1 || scaleFromPatternHeight !== 1) {
                            hexScaled = this.transformsService.scale3d({
                                shape: filletRectangle,
                                center: hexagonCenter,
                                scale: scaleVec2,
                            });
                        }

                        res.push(hexScaled);
                    } else {
                        const scaleVec2 = [scaleFromPatternWidth, 1, scaleFromPatternHeight] as Base.Vector3;
                        let hexScaled = hexagon;
                        if (scaleFromPatternWidth !== 1 || scaleFromPatternHeight !== 1) {
                            hexScaled = this.transformsService.scale3d({
                                shape: hexagon,
                                center: hexagonCenter,
                                scale: scaleVec2,
                            });
                        }

                        res.push(hexScaled);
                    }
                }
            }
        }
        return res;
    }

    createWireFromEdge(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>): TopoDS_Wire {
        const makeWire = new this.occ.BRepBuilderAPI_MakeWire_2(inputs.shape);
        const wire = makeWire.Wire();
        makeWire.delete();
        return wire;
    }

    createBSpline(inputs: Inputs.OCCT.BSplineDto): TopoDS_Wire {
        const ptList = new this.occ.TColgp_Array1OfPnt_2(1, inputs.points.length + (inputs.closed ? 1 : 0));
        const gpPnts: gp_Pnt_3[] = [];
        for (let pIndex = 1; pIndex <= inputs.points.length; pIndex++) {
            const gpPnt = this.entitiesService.gpPnt(inputs.points[pIndex - 1]);
            gpPnts.push(gpPnt);
            ptList.SetValue(pIndex, gpPnt);
        }
        if (inputs.closed) { ptList.SetValue(inputs.points.length + 1, ptList.Value(1)); }

        const ptsToBspline = new this.occ.GeomAPI_PointsToBSpline_2(ptList, 3, 8,
            (this.occ.GeomAbs_Shape.GeomAbs_C2 as GeomAbs_Shape), 1.0e-3);

        const bsplineHandle = ptsToBspline.Curve();
        const bspline = bsplineHandle.get();
        const bsplineCrv = new this.occ.Handle_Geom_Curve_2(bspline);
        const edgeMaker = new this.occ.BRepBuilderAPI_MakeEdge_24(bsplineCrv);
        const edge = edgeMaker.Edge();
        const wireMaker = new this.occ.BRepBuilderAPI_MakeWire_2(edge);
        const wire = wireMaker.Wire();

        gpPnts.forEach(p => p.delete());
        ptList.delete();
        ptsToBspline.delete();
        bsplineHandle.Nullify();
        bsplineHandle.delete();
        bsplineCrv.Nullify();
        bsplineCrv.delete();
        edgeMaker.delete();
        edge.delete();
        wireMaker.delete();

        return wire;
    }

    createBezier(inputs: Inputs.OCCT.BezierDto) {
        const ptList = new this.occ.TColgp_Array1OfPnt_2(1, inputs.points.length + (inputs.closed ? 1 : 0));
        for (let pIndex = 1; pIndex <= inputs.points.length; pIndex++) {
            ptList.SetValue(pIndex, this.entitiesService.gpPnt(inputs.points[pIndex - 1]));
        }
        if (inputs.closed) { ptList.SetValue(inputs.points.length + 1, ptList.Value(1)); }
        const geomBezierCurveHandle = new this.occ.Geom_BezierCurve_1(ptList);
        const geomCurve = new this.occ.Handle_Geom_Curve_2(geomBezierCurveHandle);
        const edgeMaker = new this.occ.BRepBuilderAPI_MakeEdge_24(geomCurve);
        const edge = edgeMaker.Edge();
        const makeWire = new this.occ.BRepBuilderAPI_MakeWire_2(edge);
        const result = makeWire.Wire();
        makeWire.delete();
        edgeMaker.delete();
        edge.delete();
        geomCurve.delete();
        ptList.delete();
        return result;
    }

    createBezierWeights(inputs: Inputs.OCCT.BezierWeightsDto) {
        if (!inputs.closed && inputs.points.length !== inputs.weights.length) {
            throw new Error("Number of points and weights must be the same when bezier is not clsoed.");
        } else if (inputs.closed && inputs.points.length !== inputs.weights.length - 1) {
            throw new Error("Number of points must be one less than number of weights when bezier is clsoed.");
        }

        const ptList = new this.occ.TColgp_Array1OfPnt_2(1, inputs.points.length + (inputs.closed ? 1 : 0));
        for (let pIndex = 1; pIndex <= inputs.points.length; pIndex++) {
            ptList.SetValue(pIndex, this.entitiesService.gpPnt(inputs.points[pIndex - 1]));
        }
        if (inputs.closed) { ptList.SetValue(inputs.points.length + 1, ptList.Value(1)); }
        const arrayOfReal = new this.occ.TColStd_Array1OfReal_2(1, inputs.weights.length);
        for (let i = 1; i <= inputs.weights.length; i++) {
            arrayOfReal.SetValue(i, inputs.weights[i - 1]);
        }
        const geomBezierCurveHandle = new this.occ.Geom_BezierCurve_2(ptList, arrayOfReal);
        const geomCurve = new this.occ.Handle_Geom_Curve_2(geomBezierCurveHandle);
        const edgeMaker = new this.occ.BRepBuilderAPI_MakeEdge_24(geomCurve);
        const edge = edgeMaker.Edge();
        const makeWire = new this.occ.BRepBuilderAPI_MakeWire_2(edge);
        const result = makeWire.Wire();
        makeWire.delete();
        edgeMaker.delete();
        edge.delete();
        geomCurve.delete();
        ptList.delete();
        arrayOfReal.delete();
        return result;
    }

    addEdgesAndWiresToWire(inputs: Inputs.OCCT.ShapeShapesDto<TopoDS_Wire, TopoDS_Wire | TopoDS_Edge>): TopoDS_Wire {
        const makeWire = new this.occ.BRepBuilderAPI_MakeWire_1();
        makeWire.Add_2(inputs.shape);
        inputs.shapes.forEach((shape) => {
            if (shape.ShapeType() === this.occ.TopAbs_ShapeEnum.TopAbs_EDGE) {
                makeWire.Add_1(shape);
            } else if (shape.ShapeType() === this.occ.TopAbs_ShapeEnum.TopAbs_WIRE) {
                makeWire.Add_2(shape);
            }
        });
        let result;
        if (makeWire.IsDone()) {
            result = makeWire.Wire();
        } else {
            throw new Error("Wire could not be constructed. Check if edges and wires do not have disconnected elements.");
        }
        makeWire.delete();
        return result;
    }

    startPointOnWire(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): Base.Point3 {
        const wire = inputs.shape;
        const curve = new this.occ.BRepAdaptor_CompCurve_2(wire, false);
        const res = this.geomService.startPointOnCurve({ shape: curve });
        return res;
    }

    midPointOnWire(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): Base.Point3 {
        const wire = inputs.shape;
        const curve = new this.occ.BRepAdaptor_CompCurve_2(wire, false);
        const res = this.geomService.pointOnCurveAtParam({ shape: curve, param: 0.5 });
        return res;
    }

    endPointOnWire(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): Base.Point3 {
        const wire = inputs.shape;
        const curve = new this.occ.BRepAdaptor_CompCurve_2(wire, false);
        const res = this.geomService.endPointOnCurve({ shape: curve });
        return res;
    }

    textWires(inputs: Inputs.OCCT.TextWiresDto): TopoDS_Wire[] {
        const lines = this.base.textService.vectorText(inputs);
        const wires: TopoDS_Wire[] = [];
        lines.forEach((line) => {
            line.chars.forEach((char) => {
                char.paths.forEach(polyline => {
                    const wire = this.createPolylineWire({ points: polyline });
                    if (wire) {
                        wires.push(wire);
                    }
                });
            });
        });
        return wires;
    }

    textWiresWithData(inputs: Inputs.OCCT.TextWiresDto): ObjectDefinition<TextWiresDataDto<string>, TopoDS_Shape> {
        const lines = this.base.textService.vectorText(inputs);
        const wires: TopoDS_Wire[] = [];

        const characterCompounds: { id: string, shape: TopoDS_Compound }[] = [];

        lines.forEach((line) => {
            line.chars.forEach((char, index) => {
                const characterWires = [];
                char.paths.forEach(polyline => {
                    const wire = this.createPolylineWire({ points: polyline });
                    if (wire) {
                        wires.push(wire);
                        characterWires.push(wire);
                    }
                });
                const characterCompound = this.converterService.makeCompound({ shapes: characterWires });
                characterCompounds.push({ id: `char-${index}`, shape: characterCompound });
            });
        });

        const compound = this.converterService.makeCompound({ shapes: wires });
        const dataRes = new TextWiresDataDto<string>();

        const box = this.operationsService.boundingBoxOfShape({ shape: compound });
        const width = box.max[0] - box.min[0];
        const height = box.max[1] - box.min[1];
        dataRes.width = width;
        dataRes.height = height;
        dataRes.compound = "text-compound";

        const res = new ObjectDefinition<TextWiresDataDto<string>, TopoDS_Compound>();
        res.data = dataRes;
        res.compound = compound;
        res.shapes = [{ id: "text-compound", shape: compound }, ...characterCompounds];

        return res;
    }

    placeWire(wire: TopoDS_Wire, surface: Geom_Surface) {
        const edges = this.shapeGettersService.getEdges({ shape: wire });
        const newEdges: TopoDS_Edge[] = [];
        edges.forEach(e => {
            const umin = { current: 0 };
            const umax = { current: 0 };
            this.occRefReturns.BRep_Tool_Range_1(e, umin, umax);
            const crv = this.occRefReturns.BRep_Tool_Curve_2(e, umin, umax);
            if (!crv.IsNull()) {
                const plane = this.entitiesService.gpPln([0, 0, 0], [0, 1, 0]);
                const c2dHandle = this.occ.GeomAPI.To2d(crv, plane);
                const c2 = c2dHandle.get();
                const newEdgeOnSrf = this.edgesService.makeEdgeFromGeom2dCurveAndSurfaceBounded({ curve: c2, surface }, umin.current, umax.current);
                if (newEdgeOnSrf) {
                    newEdges.push(newEdgeOnSrf);
                }
                plane.delete();
                c2dHandle.delete();
            }
            crv.delete();
        });
        edges.forEach(e => e.delete());
        const res = this.converterService.combineEdgesAndWiresIntoAWire({ shapes: newEdges });
        newEdges.forEach(e => e.delete());
        return res;
    }

    wiresToPoints(inputs: Inputs.OCCT.WiresToPointsDto<TopoDS_Shape>): Inputs.Base.Point3[][] {
        const wires = this.shapeGettersService.getWires({ shape: inputs.shape });
        const allWirePoints = [];
        wires.forEach(w => {
            const edgePoints = this.edgesService.edgesToPoints({ ...inputs, shape: w });
            const flatPoints = edgePoints.flat();
            const dupsRemoved = this.vecHelper.removeConsecutiveDuplicates(flatPoints, false);
            allWirePoints.push(dupsRemoved);
        });
        return allWirePoints;
    }
}
