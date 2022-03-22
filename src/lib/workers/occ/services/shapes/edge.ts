import { ChFi3d_FilletShape, OpenCascadeInstance, TopAbs_ShapeEnum, TopoDS_Edge, TopoDS_Wire } from 'opencascade.js';
import { OccHelper, typeSpecificityEnum } from '../../occ-helper';
import * as Inputs from '../../../../api/inputs/inputs';

export class OCCTEdge {

    constructor(
        private readonly occ: OpenCascadeInstance,
        private readonly och: OccHelper
    ) {
    }

    filletEdges(inputs: Inputs.OCCT.FilletDto): any {
        if (!inputs.edgeList || (inputs.edgeList.length && inputs.edgeList.length === 0)) {
            const mkFillet = new this.occ.BRepFilletAPI_MakeFillet(
                inputs.shape, (this.occ.ChFi3d_FilletShape.ChFi3d_Rational as ChFi3d_FilletShape)
            );
            const anEdgeExplorer = new this.occ.TopExp_Explorer_2(
                inputs.shape, (this.occ.TopAbs_ShapeEnum.TopAbs_EDGE as TopAbs_ShapeEnum), (this.occ.TopAbs_ShapeEnum.TopAbs_SHAPE as TopAbs_ShapeEnum)
            );
            while (anEdgeExplorer.More()) {
                const anEdge = this.occ.TopoDS.Edge_1(anEdgeExplorer.Current());
                mkFillet.Add_2(inputs.radius, anEdge);
                anEdgeExplorer.Next();
            }
            inputs.shape = mkFillet.Shape();
            return inputs.shape;
        } else if (inputs.edgeList && inputs.edgeList.length > 0) {
            const mkFillet = new this.occ.BRepFilletAPI_MakeFillet(
                inputs.shape, (this.occ.ChFi3d_FilletShape.ChFi3d_Rational as ChFi3d_FilletShape)
            );
            let foundEdges = 0;
            let curFillet;
            this.och.forEachEdge(inputs.shape, (index, edge) => {
                if (inputs.edgeList.includes(index)) {
                    mkFillet.Add_2(inputs.radius, edge);
                    foundEdges++;
                }
            });
            if (foundEdges === 0) {
                throw (new Error('Fillet Edges Not Found!  Make sure you are looking at the object _before_ the Fillet is applied!'));
            }
            else {
                curFillet = mkFillet.Shape();
            }
            return curFillet;
        }
    }

    makeEdgeFromGeom2dCurveAndSurface(inputs: Inputs.OCCT.ShapesDto) {
        const curve2d = new this.occ.Handle_Geom2d_Curve_2(inputs.shapes[0]);
        const surface = new this.occ.Handle_Geom_Surface_2(inputs.shapes[1]);
        const res = new this.occ.BRepBuilderAPI_MakeEdge_30(curve2d, surface);
        return this.och.getActualTypeOfShape(res.Shape());
    }

    line(inputs: Inputs.OCCT.LineDto): any {
        const gpPnt1 = this.och.gpPnt(inputs.start);
        const gpPnt2 = this.och.gpPnt(inputs.end);
        const segment = new this.occ.GC_MakeSegment_1(gpPnt1, gpPnt2);
        const hcurve = new this.occ.Handle_Geom_Curve_2(segment.Value().get())
        return new this.occ.BRepBuilderAPI_MakeEdge_24(hcurve).Edge();
    }

    arcThroughThreePoints(inputs: Inputs.OCCT.ArcEdgeThreePointsDto): any {
        const gpPnt1 = this.och.gpPnt(inputs.start);
        const gpPnt2 = this.och.gpPnt(inputs.middle);
        const gpPnt3 = this.och.gpPnt(inputs.end);
        const segment = new this.occ.GC_MakeArcOfCircle_4(gpPnt1, gpPnt2, gpPnt3);
        const hcurve = new this.occ.Handle_Geom_Curve_2(segment.Value().get())
        return new this.occ.BRepBuilderAPI_MakeEdge_24(hcurve).Edge();
    }

    createCircleEdge(inputs: Inputs.OCCT.CircleDto): any {
        return this.och.createCircle(inputs.radius, inputs.center, inputs.direction, typeSpecificityEnum.edge);
    }

    createEllipseEdge(inputs: Inputs.OCCT.EllipseDto) {
        return this.och.createEllipse(inputs.radiusMinor, inputs.radiusMajor, inputs.center, inputs.direction, typeSpecificityEnum.edge)
    }

    chamferEdges(inputs: Inputs.OCCT.ChamferDto): any {
        if (!inputs.edgeList || (inputs.edgeList.length && inputs.edgeList.length === 0)) {
            const mkChamfer = new this.occ.BRepFilletAPI_MakeChamfer(
                inputs.shape
            );
            const anEdgeExplorer = new this.occ.TopExp_Explorer_2(
                inputs.shape, (this.occ.TopAbs_ShapeEnum.TopAbs_EDGE as TopAbs_ShapeEnum), (this.occ.TopAbs_ShapeEnum.TopAbs_SHAPE as TopAbs_ShapeEnum)
            );
            while (anEdgeExplorer.More()) {
                const anEdge = this.occ.TopoDS.Edge_1(anEdgeExplorer.Current());
                mkChamfer.Add_2(inputs.distance, anEdge);
                anEdgeExplorer.Next();
            }
            inputs.shape = mkChamfer.Shape();
            return inputs.shape;
        } else if (inputs.edgeList && inputs.edgeList.length > 0) {
            const mkChamfer = new this.occ.BRepFilletAPI_MakeChamfer(
                inputs.shape
            );
            let foundEdges = 0;
            let curFillet;
            this.och.forEachEdge(inputs.shape, (index, edge) => {
                if (inputs.edgeList.includes(index)) {
                    mkChamfer.Add_2(inputs.distance, edge);
                    foundEdges++;
                }
            });
            if (foundEdges === 0) {
                console.error('Fillet Edges Not Found!  Make sure you are looking at the object _before_ the Fillet is applied!');
                curFillet = inputs.shape.Solid();
            }
            else {
                curFillet = mkChamfer.Shape();
            }
            return curFillet;
        }
    }

    removeInternalEdges(inputs: Inputs.OCCT.ShapeDto): any {
        const fusor = new this.occ.ShapeUpgrade_UnifySameDomain_2(inputs.shape, true, true, false);
        fusor.Build();
        return fusor.Shape();
    }

    getEdge(inputs: Inputs.OCCT.ShapeIndexDto): any {
        if (!inputs.shape || inputs.shape.ShapeType() > this.occ.TopAbs_ShapeEnum.TopAbs_WIRE || inputs.shape.IsNull()) {
            throw (new Error('Shape is not provided or is of incorrect type'));
        }
        if (!inputs.index) { inputs.index = 0; }
        let innerEdge = {}; let edgesFound = 0;
        this.och.forEachEdge(inputs.shape, (i, s) => {
            if (i === inputs.index) { innerEdge = s; } edgesFound++;
        });
        return innerEdge;
    }

    getEdges(inputs: Inputs.OCCT.ShapeDto) {
        return this.och.getEdges(inputs);
    }

    getCornerPointsOfEdgesForShape(inputs: Inputs.OCCT.ShapeDto): { result: Inputs.Base.Point3[] } {
        const edges = this.och.getEdges(inputs);
        let points = [];
        edges.forEach((edge) => {
            const param1 = { current: 0 };
            const param2 = { current: 0 };
            const crvHandle = this.occ.BRep_Tool.Curve_2(edge, param1, param2);

            try {
                const crv = crvHandle.get();
                const pt1 = crv.Value(param1.current);
                const pt2 = crv.Value(param2.current);
                const pt1g = [pt1.X(), pt1.Y(), pt1.Z()];
                const pt2g = [pt2.X(), pt2.Y(), pt2.Z()];
                points.push(pt1g);
                points.push(pt2g);
            } catch {
            }
        });
        // removes all duplicates
        if (points.length > 0) {
            points = this.och.vecHelper.removeAllDuplicateVectors(points);
        }
        return { result: points };
    }

    filletTwoEdgesInPlaneIntoAWire(inputs: Inputs.OCCT.FilletTwoEdgesInPlaneDto): TopoDS_Wire {
        const pln = this.och.gpPln(inputs.planeOrigin, inputs.planeDirection);
        const fil = new this.occ.ChFi2d_FilletAlgo_3(inputs.shapes[0], inputs.shapes[1], pln);
        fil.Perform(inputs.radius);
        const pt = this.och.gpPnt(inputs.planeOrigin);
        const edge1 = new this.occ.TopoDS_Edge();
        const edge2 = new this.occ.TopoDS_Edge();

        let solution = -1;
        if (inputs.solution !== undefined) {
            solution = inputs.solution;
        }
        const filletedEdge = fil.Result(pt, edge1, edge2, solution);

        return this.och.combineEdgesAndWiresIntoAWire({shapes: [edge1, filletedEdge, edge2]});
    }
}
