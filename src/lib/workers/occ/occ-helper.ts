import { GeomAbs_Shape, Geom_Surface, gp_Ax1, gp_Ax2, gp_Ax22d_2, gp_Ax2d_2, gp_Ax3, gp_Dir2d_4, gp_Dir_4, gp_Pln_3, gp_Pnt2d_3, gp_Pnt_3, gp_Vec2d_4, gp_Vec_4, OpenCascadeInstance, TopAbs_ShapeEnum, TopoDS_Edge, TopoDS_Shape, TopoDS_Wire } from "opencascade.js";
import { VectorHelperService } from "../../api/vector-helper.service";
import { Base } from "../../api/inputs/base-inputs";
import * as Inputs from '../../api/inputs/inputs';


export enum typeSpecificityEnum {
    curve,
    edge,
    wire,
    face,
}
export class OccHelper {

    constructor(public readonly vecHelper: VectorHelperService, private readonly occ: OpenCascadeInstance) {
    }

    gpAx3(point: Base.Point3, direction: Base.Vector3): gp_Ax3 {
        return new this.occ.gp_Ax3_4(
            this.gpPnt(point),
            this.gpDir(direction)
        );
    }

    gpAx2(point: Base.Point3, direction: Base.Vector3): gp_Ax2 {
        return new this.occ.gp_Ax2_3(
            this.gpPnt(point),
            this.gpDir(direction)
        );
    }

    gpAx1(point: Base.Point3, direction: Base.Vector3): gp_Ax1 {
        return new this.occ.gp_Ax1_2(
            this.gpPnt(point),
            this.gpDir(direction)
        );
    }

    gpAx2d(point: Base.Point2, direction: Base.Vector2): gp_Ax2d_2 {
        const pt = this.gpPnt2d(point);
        const dir = this.gpDir2d(direction);
        return new this.occ.gp_Ax2d_2(pt, dir);
    }

    gpAx22d(point: Base.Point2, direction1: Base.Vector2, direction2: Base.Vector2): gp_Ax22d_2 {
        const pt = this.gpPnt2d(point);
        const dir1 = this.gpDir2d(direction1);
        const dir2 = this.gpDir2d(direction2);
        return new this.occ.gp_Ax22d_2(pt, dir1, dir2);
    }

    gpPln(point: Base.Point3, direction: Base.Vector3): gp_Pln_3 {
        const gpPnt = this.gpPnt(point);
        const gpDir = this.gpDir(direction);
        return new this.occ.gp_Pln_3(gpPnt, gpDir);
    }

    gpPnt2d(point: Base.Point2): gp_Pnt2d_3 {
        return new this.occ.gp_Pnt2d_3(point[0], point[1]);
    }

    gpPnt(point: Base.Point3): gp_Pnt_3 {
        return new this.occ.gp_Pnt_3(point[0], point[1], point[2]);
    }

    gpVec(vec: Base.Vector3): gp_Vec_4 {
        return new this.occ.gp_Vec_4(vec[0], vec[1], vec[2]);
    }

    gpVec2d(vec: Base.Vector2): gp_Vec2d_4 {
        return new this.occ.gp_Vec2d_4(vec[0], vec[1]);
    }

    gpDir(direction: Base.Vector3): gp_Dir_4 {
        return new this.occ.gp_Dir_4(direction[0], direction[1], direction[2]);
    }

    gpDir2d(direction: Base.Point2): gp_Dir2d_4 {
        return new this.occ.gp_Dir2d_4(direction[0], direction[1]);
    }

    gcMakeCircle(center: Base.Point3, direction: Base.Vector3, radius: number): any {
        return new this.occ.GC_MakeCircle_2(this.gpAx2(center, direction), radius).Value();
    }

    gcMakeEllipse(center: Base.Point3, direction: Base.Vector3, minorRadius: number, majorRadius: number): any {
        return new this.occ.GC_MakeEllipse_2(this.gpAx2(center, direction), majorRadius, minorRadius).Value();
    }

    bRepBuilderAPIMakeEdge(curve: any): any {
        return new this.occ.BRepBuilderAPI_MakeEdge_24(this.castHandleGeomCurve(curve)).Edge();
    }

    bRepBuilderAPIMakeWire(edge: any): any {
        return new this.occ.BRepBuilderAPI_MakeWire_2(edge).Wire();
    }

    bRepBuilderAPIMakeShell(face: any): any {
        // TODO come back to this later to get UVBounds before creating a surface. Now faces converted
        // to a surface and eventually to a shell get no bounds
        // const uMin = new this.occ.TDataStd_Real();
        // const uMax = new this.occ.TDataStd_Real();
        // const vMin = new this.occ.TDataStd_Real();
        // const vMax = new this.occ.TDataStd_Real();
        // const u0 = { current: 0 };
        // const u1 = { current: 0 };
        // const v0 = { current: 0 };
        // const v1 = { current: 0 };
        // this.occ.BRepTools.UVBounds_1(face, u0, u1, v0, v1);
        // const srf = this.occ.BRep_Tool.Surface_3(face, u0.current, u1.current, v0.current, v1.current);
        const srf = this.occ.BRep_Tool.Surface_2(face);

        const d = new this.occ.BRepBuilderAPI_MakeShell_2(
            srf,
            false);

        const x = d.Shell();
        return x;
    }

    bRepBuilderAPIMakeFaceFromWire(wire: TopoDS_Wire, planar: boolean): any {
        return new this.occ.BRepBuilderAPI_MakeFace_15(wire, planar).Face();
    }

    bRepBuilderAPIMakeFaceFromSurface(surface: Geom_Surface, tolDegen: number): any {
        const hs = new this.occ.Handle_Geom_Surface_2(surface);
        return new this.occ.BRepBuilderAPI_MakeFace_8(hs, tolDegen).Face();
    }

    bRepBuilderAPIMakeFaceFromSurfaceAndWire(surface: Geom_Surface, wire: TopoDS_Wire, inside: boolean): any {
        const hs = new this.occ.Handle_Geom_Surface_2(surface);
        return new this.occ.BRepBuilderAPI_MakeFace_21(hs, wire, inside).Face();
    }

    bRepPrimAPIMakeSphere(center: Base.Point3, direction: Base.Vector3, radius: number): any {
        const ax = this.gpAx2(center, direction);
        return new this.occ.BRepPrimAPI_MakeSphere_9(ax, radius).Shape();
    }

    bRepPrimAPIMakeCylinder(center: Base.Point3, direction: Base.Vector3, radius, height): any {
        const ax = this.gpAx2(center, direction);
        return new this.occ.BRepPrimAPI_MakeCylinder_3(ax, radius, height).Shape();
    }

    bRepPrimAPIMakeCylinderBetweenPoints(start: Base.Point3, end: Base.Point3, radius: number): any {
        const center = this.gpPnt(start);
        const vec = new this.occ.gp_Vec_5(center, this.gpPnt(end));
        const distance = vec.Magnitude();
        const ax = this.gpAx2(start, [vec.X(), vec.Y(), vec.Z()]);
        return new this.occ.BRepPrimAPI_MakeCylinder_3(ax, radius, distance).Shape();
    }

    bRepPrimAPIMakeBox(width: number, length: number, height: number, center: number[]): any {
        const pt = this.gpPnt([
            -width / 2 + center[0],
            -height / 2 + center[1],
            -length / 2 + center[2]
        ]);
        return new this.occ.BRepPrimAPI_MakeBox_3(pt, width, height, length).Shape();
    }

    getEdges(inputs: Inputs.OCCT.ShapeDto): TopoDS_Edge[] {
        if (!inputs.shape || inputs.shape.ShapeType() > this.occ.TopAbs_ShapeEnum.TopAbs_WIRE || inputs.shape.IsNull()) {
            throw (new Error('Shape is not provided or is of incorrect type'));
        }
        const edges = [];
        this.forEachEdge(inputs.shape, (i, edge) => {
            edges.push(edge);
        });
        return edges;
    }

    castHandleGeomCurve(curve: any): any {
        return new this.occ.Handle_Geom_Curve_2(curve.get());
    }

    getActualTypeOfShape(shape: TopoDS_Shape) {
        if (shape.ShapeType() === this.occ.TopAbs_ShapeEnum.TopAbs_EDGE) {
            return this.occ.TopoDS.Edge_1(shape);
        } else if (shape.ShapeType() === this.occ.TopAbs_ShapeEnum.TopAbs_WIRE) {
            return this.occ.TopoDS.Wire_1(shape);
        } else if (shape.ShapeType() === this.occ.TopAbs_ShapeEnum.TopAbs_VERTEX) {
            return this.occ.TopoDS.Vertex_1(shape);
        } else if (shape.ShapeType() === this.occ.TopAbs_ShapeEnum.TopAbs_SOLID) {
            return this.occ.TopoDS.Solid_1(shape);
        } else if (shape.ShapeType() === this.occ.TopAbs_ShapeEnum.TopAbs_SHELL) {
            return this.occ.TopoDS.Shell_1(shape);
        } else if (shape.ShapeType() === this.occ.TopAbs_ShapeEnum.TopAbs_FACE) {
            return this.occ.TopoDS.Face_1(shape);
        } else if (shape.ShapeType() === this.occ.TopAbs_ShapeEnum.TopAbs_COMPSOLID) {
            return this.occ.TopoDS.CompSolid_1(shape);
        } else if (shape.ShapeType() === this.occ.TopAbs_ShapeEnum.TopAbs_COMPOUND) {
            return this.occ.TopoDS.Compound_1(shape);
        } else {
            return shape;
        }
    }

    createCircle(radius: number, center: Base.Point3, direction: Base.Vector3, type: typeSpecificityEnum): any {
        const circle = this.gcMakeCircle(center, direction, radius);
        if (type === typeSpecificityEnum.curve) {
            return circle;
        } else {
            const edge = this.bRepBuilderAPIMakeEdge(circle);
            if (type === typeSpecificityEnum.edge) {
                return edge;
            } else {
                const circleWire = this.bRepBuilderAPIMakeWire(edge);
                if (type === typeSpecificityEnum.wire) {
                    return circleWire;
                } else if (type === typeSpecificityEnum.face) {
                    return this.bRepBuilderAPIMakeFaceFromWire(circleWire, true);
                }
            }
        }
    }

    createEllipse(minorRadius: number, majorRadius: number, center: Base.Point3, direction: Base.Vector3, type: typeSpecificityEnum): any {
        const ellipse = this.gcMakeEllipse(center, direction, minorRadius, majorRadius);
        if (type === typeSpecificityEnum.curve) {
            return ellipse;
        } else {
            const edge = this.bRepBuilderAPIMakeEdge(ellipse);
            if (type === typeSpecificityEnum.edge) {
                return edge;
            } else {
                const ellipseWire = this.bRepBuilderAPIMakeWire(edge);
                if (type === typeSpecificityEnum.wire) {
                    return ellipseWire;
                } else if (type === typeSpecificityEnum.face) {
                    return this.bRepBuilderAPIMakeFaceFromWire(ellipseWire, true);
                }
            }
        }
    }

    createPolygonWire(inputs: Inputs.OCCT.PolygonDto): any {
        const gpPoints = [];
        for (let ind = 0; ind < inputs.points.length; ind++) {
            gpPoints.push(this.gpPnt(inputs.points[ind]));
        }

        const polygonWire = new this.occ.BRepBuilderAPI_MakeWire_1();
        for (let ind = 0; ind < inputs.points.length - 1; ind++) {
            const seg = new this.occ.GC_MakeSegment_1(gpPoints[ind], gpPoints[ind + 1]).Value();
            const edge = new this.occ.BRepBuilderAPI_MakeEdge_24(
                new this.occ.Handle_Geom_Curve_2(seg.get())
            ).Edge();
            const innerWire = new this.occ.BRepBuilderAPI_MakeWire_2(edge).Wire();
            polygonWire.Add_2(innerWire);
        }
        const seg2 = new this.occ.GC_MakeSegment_1(gpPoints[inputs.points.length - 1], gpPoints[0]).Value();
        const edge2 = new this.occ.BRepBuilderAPI_MakeEdge_24(
            new this.occ.Handle_Geom_Curve_2(seg2.get())
        ).Edge();
        const innerWire2 = new this.occ.BRepBuilderAPI_MakeWire_2(edge2).Wire();
        polygonWire.Add_2(innerWire2);
        return polygonWire.Wire();
    }



    getNumSolidsInCompound(shape): any {
        if (!shape ||
            shape.ShapeType() > this.occ.TopAbs_ShapeEnum.TopAbs_COMPSOLID ||
            shape.IsNull()
        ) {
            console.error('Not a compound shape!');
            return shape;
        }
        let solidsFound = 0;
        this.forEachSolid(shape, (i, s) => { solidsFound++; });
        return solidsFound;
    }

    getSolidFromCompound(shape, index): any {
        if (!shape ||
            shape.ShapeType() > this.occ.TopAbs_ShapeEnum.TopAbs_COMPSOLID ||
            shape.IsNull()
        ) {
            console.error('Not a compound shape!');
            return shape;
        }
        if (!index) {
            index = 0;
        }

        let innerSolid: any = {};
        let solidsFound = 0;
        this.forEachSolid(shape, (i, s) => {
            if (i === index) { innerSolid = this.occ.TopoDS.Solid_1(s); } solidsFound++;
        });
        if (solidsFound === 0) { console.error('NO SOLIDS FOUND IN SHAPE!'); innerSolid = shape; }
        innerSolid.hash = shape.hash + 1;
        return innerSolid;
    }

    forEachSolid(shape, callback): void {
        let solidIndex = 0;
        const anExplorer = new this.occ.TopExp_Explorer_2(shape,
            (this.occ.TopAbs_ShapeEnum.TopAbs_SOLID as TopAbs_ShapeEnum),
            (this.occ.TopAbs_ShapeEnum.TopAbs_SHAPE as TopAbs_ShapeEnum));
        for (anExplorer.Init(shape,
            (this.occ.TopAbs_ShapeEnum.TopAbs_SOLID as TopAbs_ShapeEnum),
            (this.occ.TopAbs_ShapeEnum.TopAbs_SHAPE as TopAbs_ShapeEnum)); anExplorer.More(); anExplorer.Next()) {
            callback(solidIndex++, this.occ.TopoDS.Solid_2(anExplorer.Current()));
        }
    }

    forEachWire(shape, callback): void {
        let wireIndex = 0;
        const anExplorer = new this.occ.TopExp_Explorer_2(shape,
            (this.occ.TopAbs_ShapeEnum.TopAbs_WIRE as TopAbs_ShapeEnum),
            (this.occ.TopAbs_ShapeEnum.TopAbs_SHAPE as TopAbs_ShapeEnum));
        for (anExplorer.Init(shape,
            (this.occ.TopAbs_ShapeEnum.TopAbs_WIRE as TopAbs_ShapeEnum),
            (this.occ.TopAbs_ShapeEnum.TopAbs_SHAPE as TopAbs_ShapeEnum)); anExplorer.More(); anExplorer.Next()) {
            callback(wireIndex++, this.occ.TopoDS.Wire_2(anExplorer.Current()));
        }
    }

    forEachEdge(shape, callback): any {
        const edgeHashes = {};
        let edgeIndex = 0;
        const anExplorer = new this.occ.TopExp_Explorer_2(shape,
            (this.occ.TopAbs_ShapeEnum.TopAbs_EDGE as TopAbs_ShapeEnum), (this.occ.TopAbs_ShapeEnum.TopAbs_SHAPE as TopAbs_ShapeEnum)
        );
        for (anExplorer.Init(shape, (this.occ.TopAbs_ShapeEnum.TopAbs_EDGE as TopAbs_ShapeEnum), (this.occ.TopAbs_ShapeEnum.TopAbs_SHAPE as TopAbs_ShapeEnum));
            anExplorer.More();
            anExplorer.Next()
        ) {
            const edge = this.occ.TopoDS.Edge_1(anExplorer.Current());
            const edgeHash = edge.HashCode(100000000);
            if (!edgeHashes.hasOwnProperty(edgeHash)) {
                edgeHashes[edgeHash] = edgeIndex;
                edgeIndex = edgeIndex += 1;
                callback(edgeIndex, edge);
            }
        }
        return edgeHashes;
    }

    forEachFace(shape, callback): any {
        let faceIndex = 0;
        const anExplorer = new this.occ.TopExp_Explorer_2(
            shape,
            (this.occ.TopAbs_ShapeEnum.TopAbs_FACE as TopAbs_ShapeEnum),
            (this.occ.TopAbs_ShapeEnum.TopAbs_SHAPE as TopAbs_ShapeEnum)
        );
        for (anExplorer.Init(shape, (this.occ.TopAbs_ShapeEnum.TopAbs_FACE as TopAbs_ShapeEnum), (this.occ.TopAbs_ShapeEnum.TopAbs_SHAPE as TopAbs_ShapeEnum));
            anExplorer.More();
            anExplorer.Next()) {
            callback(faceIndex++, this.occ.TopoDS.Face_1(anExplorer.Current()));
        }
    }

    forEachShell(shape, callback): any {
        let faceIndex = 0;
        const anExplorer = new this.occ.TopExp_Explorer_2(
            shape,
            (this.occ.TopAbs_ShapeEnum.TopAbs_SHELL as TopAbs_ShapeEnum),
            (this.occ.TopAbs_ShapeEnum.TopAbs_SHAPE as TopAbs_ShapeEnum)
        );
        for (anExplorer.Init(shape, (this.occ.TopAbs_ShapeEnum.TopAbs_SHELL as TopAbs_ShapeEnum), (this.occ.TopAbs_ShapeEnum.TopAbs_SHAPE as TopAbs_ShapeEnum));
            anExplorer.More();
            anExplorer.Next()) {
            callback(faceIndex++, this.occ.TopoDS.Shell_1(anExplorer.Current()));
        }
    }

    forEachVertex(shape, callback): any {
        let faceIndex = 0;
        const anExplorer = new this.occ.TopExp_Explorer_2(
            shape,
            (this.occ.TopAbs_ShapeEnum.TopAbs_VERTEX as TopAbs_ShapeEnum),
            (this.occ.TopAbs_ShapeEnum.TopAbs_SHAPE as TopAbs_ShapeEnum)
        );
        for (anExplorer.Init(shape, (this.occ.TopAbs_ShapeEnum.TopAbs_VERTEX as TopAbs_ShapeEnum),
            (this.occ.TopAbs_ShapeEnum.TopAbs_SHAPE as TopAbs_ShapeEnum));
            anExplorer.More();
            anExplorer.Next()) {
            callback(faceIndex++, this.occ.TopoDS.Vertex_1(anExplorer.Current()));
        }
    }

    isArrayLike(item): any {
        return (
            Array.isArray(item) ||
            (!!item &&
                typeof item === 'object' &&
                item.hasOwnProperty('length') &&
                typeof item.length === 'number' &&
                item.length > 0 &&
                (item.length - 1) in item
            )
        );
    }

    combineEdgesAndWiresIntoAWire(inputs: Inputs.OCCT.ShapesDto): any {
        const makeWire = new this.occ.BRepBuilderAPI_MakeWire_1();
        inputs.shapes.forEach((shape: TopoDS_Shape) => {
            if (shape.ShapeType() === this.occ.TopAbs_ShapeEnum.TopAbs_EDGE) {
                makeWire.Add_1(shape);
            } else if (shape.ShapeType() === this.occ.TopAbs_ShapeEnum.TopAbs_WIRE) {
                makeWire.Add_2(shape);
            }
        });
        if (makeWire.IsDone()) {
            this.occ.BRepLib.BuildCurves3d_2(makeWire.Wire());
            return makeWire.Wire();
        } else {
            let errorMessage;
            const error = makeWire.Error();
            if (error === this.occ.BRepBuilderAPI_WireError.BRepBuilderAPI_DisconnectedWire) {
                errorMessage = 'Wire is disconnected and can not be constructed';
            } else if (error === this.occ.BRepBuilderAPI_WireError.BRepBuilderAPI_EmptyWire) {
                errorMessage = 'Wire is empty and can not be constructed';
            } else if (error === this.occ.BRepBuilderAPI_WireError.BRepBuilderAPI_NonManifoldWire) {
                errorMessage = 'Wire is non manifold and can not be constructed';
            } else if (error === this.occ.BRepBuilderAPI_WireError.BRepBuilderAPI_WireDone) {
                errorMessage = 'Wire is done';
            }
            throw new Error(errorMessage);
        }
    }

    createBSpline(inputs: Inputs.OCCT.BSplineDto): any {
        const ptList = new this.occ.TColgp_Array1OfPnt_2(1, inputs.points.length + (inputs.closed ? 1 : 0));
        for (let pIndex = 1; pIndex <= inputs.points.length; pIndex++) {
            ptList.SetValue(pIndex, this.gpPnt(inputs.points[pIndex - 1]));
        }
        if (inputs.closed) { ptList.SetValue(inputs.points.length + 1, ptList.Value(1)); }

        const geomCurveHandle = new this.occ.GeomAPI_PointsToBSpline_2(ptList, 3, 8,
            (this.occ.GeomAbs_Shape.GeomAbs_C2 as GeomAbs_Shape), 1.0e-3);
        const edge = new this.occ.BRepBuilderAPI_MakeEdge_24(
            new this.occ.Handle_Geom_Curve_2(geomCurveHandle.Curve().get())
        ).Edge();
        return new this.occ.BRepBuilderAPI_MakeWire_2(edge).Wire();
    }

    translate(inputs: Inputs.OCCT.TranslateDto): any {
        const transformation = new this.occ.gp_Trsf_1();
        transformation.SetTranslation_1(new this.occ.gp_Vec_4(inputs.translation[0], inputs.translation[1], inputs.translation[2]));
        const translation = new this.occ.TopLoc_Location_2(transformation);
        return this.getActualTypeOfShape(inputs.shape.Moved(translation, false));
    }

    rotate(inputs: Inputs.OCCT.RotateDto): any {
        let rotated;
        if (inputs.angle === 0) {
            rotated = inputs.shape;
        } else {
            const transformation = new this.occ.gp_Trsf_1();
            transformation.SetRotation_1(
                new this.occ.gp_Ax1_2(
                    new this.occ.gp_Pnt_3(0, 0, 0),
                    new this.occ.gp_Dir_2(
                        new this.occ.gp_Vec_4(inputs.axis[0], inputs.axis[1], inputs.axis[2])
                    )
                ),
                inputs.angle * 0.0174533);
            const rotation = new this.occ.TopLoc_Location_2(transformation);
            rotated = (inputs.shape as TopoDS_Shape).Moved(rotation, false);
        }
        return this.getActualTypeOfShape(rotated);
    }

}

