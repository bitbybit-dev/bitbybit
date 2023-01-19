import { Adaptor3d_Curve, BRepAdaptor_CompCurve_2, Geom2d_Curve, TopoDS_Shell, TopoDS_Solid, GeomAbs_Shape, Geom_Circle, Geom_Curve, Geom_Ellipse, Geom_Surface, gp_Ax1, gp_Ax2, gp_Ax22d_2, gp_Ax2d_2, gp_Ax3, gp_Dir2d_4, gp_Dir_4, gp_Pln_3, gp_Pnt2d_3, gp_Pnt_3, gp_Vec2d_4, gp_Vec_4, gp_XYZ_2, Handle_Geom_Circle, Handle_Geom_Curve, Handle_Geom_Ellipse, OpenCascadeInstance, TopAbs_ShapeEnum, TopoDS_Compound, TopoDS_Edge, TopoDS_Face, TopoDS_Shape, TopoDS_Vertex, TopoDS_Wire } from '../../../bitbybit-dev-occt/bitbybit-dev-occt';
import { VectorHelperService } from '../../api/vector-helper.service';
import { Base } from '../../api/inputs/base-inputs';
import * as Inputs from '../../api/inputs/inputs';
import { ShapesHelperService } from '../../api/shapes-helper.service';

export enum typeSpecificityEnum {
    curve,
    edge,
    wire,
    face,
}
export class OccHelper {

    constructor(
        public readonly vecHelper: VectorHelperService,
        public readonly shapesHelperServide: ShapesHelperService,
        private readonly occ: OpenCascadeInstance) {
    }


    getCornerPointsOfEdgesForShape(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Inputs.Base.Point3[] {
        const edges = this.getEdges(inputs);
        let points = [];
        edges.forEach((edge) => {
            const param1 = { current: 0 };
            const param2 = { current: 0 };
            const crvHandle = this.occ.BRep_Tool.Curve_2(edge, param1 as any, param2 as any);

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
            points = this.vecHelper.removeAllDuplicateVectors(points);
        }
        return points;
    }

    splitShapeWithShapes(inputs: Inputs.OCCT.SplitDto<TopoDS_Shape>): TopoDS_Shape {
        const listOfShapes = new this.occ.TopTools_ListOfShape_1();
        inputs.shapes.forEach(shape => {
            listOfShapes.Append_1(shape);
        })
        const shape = this.occ.BitByBitDev.BitSplit(inputs.shape, listOfShapes);
        return shape;
    }

    makeCompound(inputs: Inputs.OCCT.CompoundShapesDto<TopoDS_Shape>): TopoDS_Compound {
        const resCompound = new this.occ.TopoDS_Compound();
        const builder = new this.occ.BRep_Builder();
        builder.MakeCompound(resCompound);
        inputs.shapes.forEach(shape => {
            builder.Add(resCompound, shape);
        });
        return resCompound;
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

    gpAx2FromTwoVectors(point: Base.Point3, directionFirst: Base.Vector3, directionSecond: Base.Vector3): gp_Ax2 {
        return new this.occ.gp_Ax2_2(
            this.gpPnt(point),
            this.gpDir(directionFirst),
            this.gpDir(directionSecond)
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

    gpXYZ(point: Base.Point3): gp_XYZ_2 {
        return new this.occ.gp_XYZ_2(point[0], point[1], point[2]);
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

    gcMakeCircle(center: Base.Point3, direction: Base.Vector3, radius: number): Geom_Circle {
        return new this.occ.GC_MakeCircle_2(this.gpAx2(center, direction), radius).Value().get();
    }

    gcMakeEllipse(center: Base.Point3, direction: Base.Vector3, minorRadius: number, majorRadius: number): Geom_Ellipse {
        return new this.occ.GC_MakeEllipse_2(this.gpAx2(center, direction), majorRadius, minorRadius).Value().get();
    }

    bRepBuilderAPIMakeEdge(curve: Geom_Curve): TopoDS_Edge {
        return new this.occ.BRepBuilderAPI_MakeEdge_24(this.castToHandleGeomCurve(curve)).Edge();
    }

    bRepBuilderAPIMakeWire(edge: TopoDS_Edge): TopoDS_Wire {
        return new this.occ.BRepBuilderAPI_MakeWire_2(edge).Wire();
    }

    makeVertex(pt: Base.Point3): TopoDS_Vertex {
        const gpPnt = this.gpPnt(pt);
        const vert = new this.occ.BRepBuilderAPI_MakeVertex(gpPnt);
        return vert.Vertex();
    }

    bRepBuilderAPIMakeShell(face: TopoDS_Face): TopoDS_Shell {
        const srf = this.occ.BRep_Tool.Surface_2(face);

        const d = new this.occ.BRepBuilderAPI_MakeShell_2(
            srf,
            false);

        const x = d.Shell();
        return x;
    }

    bRepBuilderAPIMakeFaceFromWire(wire: TopoDS_Wire, planar: boolean): TopoDS_Face {
        return new this.occ.BRepBuilderAPI_MakeFace_15(wire, planar).Face();
    }

    bRepBuilderAPIMakeFaceFromSurface(surface: Geom_Surface, tolDegen: number): TopoDS_Face {
        const hs = new this.occ.Handle_Geom_Surface_2(surface);
        return new this.occ.BRepBuilderAPI_MakeFace_8(hs, tolDegen).Face();
    }

    bRepBuilderAPIMakeFaceFromSurfaceAndWire(surface: Geom_Surface, wire: TopoDS_Wire, inside: boolean): TopoDS_Face {
        const hs = new this.occ.Handle_Geom_Surface_2(surface);
        return new this.occ.BRepBuilderAPI_MakeFace_21(hs, wire, inside).Face();
    }

    bRepPrimAPIMakeSphere(center: Base.Point3, direction: Base.Vector3, radius: number): TopoDS_Shape {
        const ax = this.gpAx2(center, direction);
        return new this.occ.BRepPrimAPI_MakeSphere_9(ax, radius).Shape();
    }

    bRepPrimAPIMakeCylinder(center: Base.Point3, direction: Base.Vector3, radius, height): TopoDS_Shape {
        const ax = this.gpAx2(center, direction);
        return new this.occ.BRepPrimAPI_MakeCylinder_3(ax, radius, height).Shape();
    }

    bRepPrimAPIMakeCylinderBetweenPoints(start: Base.Point3, end: Base.Point3, radius: number): TopoDS_Shape {
        const center = this.gpPnt(start);
        const vec = new this.occ.gp_Vec_5(center, this.gpPnt(end));
        const distance = vec.Magnitude();
        const ax = this.gpAx2(start, [vec.X(), vec.Y(), vec.Z()]);
        return new this.occ.BRepPrimAPI_MakeCylinder_3(ax, radius, distance).Shape();
    }

    bRepPrimAPIMakeBox(width: number, length: number, height: number, center: number[]): TopoDS_Shape {
        const pt = this.gpPnt([
            -width / 2 + center[0],
            -height / 2 + center[1],
            -length / 2 + center[2]
        ]);
        return new this.occ.BRepPrimAPI_MakeBox_3(pt, width, height, length).Shape();
    }

    getEdges(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): TopoDS_Edge[] {
        if (!inputs.shape || inputs.shape.ShapeType() > this.occ.TopAbs_ShapeEnum.TopAbs_WIRE || inputs.shape.IsNull()) {
            throw (new Error('Shape is not provided or is of incorrect type'));
        }
        const edges = [];
        this.forEachEdge(inputs.shape, (i, edge) => {
            edges.push(edge);
        });
        return edges;
    }

    lineEdge(inputs: Inputs.OCCT.LineDto) {
        const gpPnt1 = this.gpPnt(inputs.start);
        const gpPnt2 = this.gpPnt(inputs.end);
        const segment = new this.occ.GC_MakeSegment_1(gpPnt1, gpPnt2);
        const hcurve = new this.occ.Handle_Geom_Curve_2(segment.Value().get());
        return new this.occ.BRepBuilderAPI_MakeEdge_24(hcurve).Edge();
    }

    getEdgeLength(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>) {
        const edge = inputs.shape;
        const gprops = new this.occ.GProp_GProps_1();
        this.occ.BRepGProp.LinearProperties(edge, gprops, false, false);
        return gprops.Mass();
    }

    getEdgesLengths(inputs: Inputs.OCCT.ShapesDto<TopoDS_Edge>): number[] {
        return inputs.shapes.map(edge => this.getEdgeLength({ shape: edge }));
    }

    getEdgeCenterOfMass(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>): Base.Point3 {
        const edge: TopoDS_Edge = inputs.shape;
        const gprops = new this.occ.GProp_GProps_1();
        this.occ.BRepGProp.LinearProperties(edge, gprops, false, false);
        const gppnt = gprops.CentreOfMass();
        return [gppnt.X(), gppnt.Y(), gppnt.Z()];
    }

    getEdgesCentersOfMass(inputs: Inputs.OCCT.ShapesDto<TopoDS_Edge>): Base.Point3[] {
        return inputs.shapes.map(edge => this.getEdgeCenterOfMass({ shape: edge }));
    }

    getWireLength(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): number {
        const edges = this.getEdges(inputs);
        const lengths = edges.map(edge => this.getEdgeLength({ shape: edge }));
        return lengths.reduce((p, c) => p + c, 0);
    }

    getWiresLengths(inputs: Inputs.OCCT.ShapesDto<TopoDS_Wire>): number[] {
        return inputs.shapes.map(wire => this.getWireLength({ shape: wire }));
    }

    getFaces(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): TopoDS_Face[] {
        const faces = [];
        this.forEachFace(inputs.shape, (faceIndex, myFace) => {
            faces.push(myFace);
        });
        return faces;
    }

    getFaceArea(inputs: Inputs.OCCT.ShapeDto<TopoDS_Face>): number {
        const gprops = new this.occ.GProp_GProps_1();
        this.occ.BRepGProp.SurfaceProperties_1(inputs.shape, gprops, false, false);
        return gprops.Mass();
    }

    getFacesAreas(inputs: Inputs.OCCT.ShapesDto<TopoDS_Face>): number[] {
        return inputs.shapes.map(face => this.getFaceArea({ shape: face }));
    }

    getFaceCenterOfMass(inputs: Inputs.OCCT.ShapeDto<TopoDS_Face>): Base.Point3 {
        const gprops = new this.occ.GProp_GProps_1();
        this.occ.BRepGProp.SurfaceProperties_1(inputs.shape, gprops, false, false);
        const gppnt = gprops.CentreOfMass();
        return [gppnt.X(), gppnt.Y(), gppnt.Z()];
    }

    getFacesCentersOfMass(inputs: Inputs.OCCT.ShapesDto<TopoDS_Face>): Base.Point3[] {
        return inputs.shapes.map(face => this.getFaceCenterOfMass({ shape: face }))
    }

    getSolidVolume(inputs: Inputs.OCCT.ShapeDto<TopoDS_Solid>): number {
        const gprops = new this.occ.GProp_GProps_1();
        this.occ.BRepGProp.VolumeProperties_1(inputs.shape, gprops, true, false, false);
        return gprops.Mass();
    }

    getShellSurfaceArea(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shell>): number {
        const faces = this.getFaces(inputs);
        const faceAreas = this.getFacesAreas({ shapes: faces });
        return faceAreas.reduce((p, c) => p + c, 0);
    }

    getSolidSurfaceArea(inputs: Inputs.OCCT.ShapeDto<TopoDS_Solid>): number {
        const faces = this.getFaces(inputs);
        const faceAreas = this.getFacesAreas({ shapes: faces });
        return faceAreas.reduce((p, c) => p + c, 0);
    }

    getSolidsVolumes(inputs: Inputs.OCCT.ShapesDto<TopoDS_Solid>): number[] {
        return inputs.shapes.map(s => this.getSolidVolume({ shape: s }));
    }

    getSolidCenterOfMass(inputs: Inputs.OCCT.ShapeDto<TopoDS_Solid>): Base.Point3 {
        const gprops = new this.occ.GProp_GProps_1();
        this.occ.BRepGProp.VolumeProperties_1(inputs.shape, gprops, true, false, false);
        const gppnt = gprops.CentreOfMass();
        return [gppnt.X(), gppnt.Y(), gppnt.Z()];
    }

    getSolidsCentersOfMass(inputs: Inputs.OCCT.ShapesDto<TopoDS_Solid>): Base.Point3[] {
        return inputs.shapes.map(s => this.getSolidCenterOfMass({ shape: s }));
    }

    castToHandleGeomCurve(curve: Geom_Curve): Handle_Geom_Curve {
        return new this.occ.Handle_Geom_Curve_2(curve);
    }

    getActualTypeOfShape(shape: TopoDS_Shape): TopoDS_Edge | TopoDS_Wire | TopoDS_Vertex | TopoDS_Solid | TopoDS_Shell | TopoDS_Face | TopoDS_Compound {
        let result = shape;
        if (shape.ShapeType() === this.occ.TopAbs_ShapeEnum.TopAbs_EDGE) {
            result = this.occ.TopoDS.Edge_1(shape);
        } else if (shape.ShapeType() === this.occ.TopAbs_ShapeEnum.TopAbs_WIRE) {
            result = this.occ.TopoDS.Wire_1(shape);
        } else if (shape.ShapeType() === this.occ.TopAbs_ShapeEnum.TopAbs_VERTEX) {
            result = this.occ.TopoDS.Vertex_1(shape);
        } else if (shape.ShapeType() === this.occ.TopAbs_ShapeEnum.TopAbs_SOLID) {
            result = this.occ.TopoDS.Solid_1(shape);
        } else if (shape.ShapeType() === this.occ.TopAbs_ShapeEnum.TopAbs_SHELL) {
            result = this.occ.TopoDS.Shell_1(shape);
        } else if (shape.ShapeType() === this.occ.TopAbs_ShapeEnum.TopAbs_FACE) {
            result = this.occ.TopoDS.Face_1(shape);
        } else if (shape.ShapeType() === this.occ.TopAbs_ShapeEnum.TopAbs_COMPSOLID) {
            result = this.occ.TopoDS.CompSolid_1(shape);
        } else if (shape.ShapeType() === this.occ.TopAbs_ShapeEnum.TopAbs_COMPOUND) {
            result = this.occ.TopoDS.Compound_1(shape);
        } else {
            result = shape;
        }
        return result;
    }

    createCircle(radius: number, center: Base.Point3, direction: Base.Vector3, type: typeSpecificityEnum) {
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
        return circle;
    }

    createEllipse(minorRadius: number, majorRadius: number, center: Base.Point3, direction: Base.Vector3, type: typeSpecificityEnum) {
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
        return ellipse;
    }

    createSquareFace(inputs: Inputs.OCCT.SquareDto): TopoDS_Face {
        return this.bRepBuilderAPIMakeFaceFromWire(this.createSquareWire(inputs), true);
    }

    createRectangleFace(inputs: Inputs.OCCT.RectangleDto): TopoDS_Face {
        return this.bRepBuilderAPIMakeFaceFromWire(this.createRectangleWire(inputs), true);
    }

    createRectangleWire(inputs: Inputs.OCCT.RectangleDto): TopoDS_Wire {
        const cw = inputs.width / 2;
        const cl = inputs.length / 2;
        const pt1: Base.Point3 = [cw, 0, cl];
        const pt2: Base.Point3 = [-cw, 0, cl];
        const pt3: Base.Point3 = [-cw, 0, -cl];
        const pt4: Base.Point3 = [cw, 0, -cl];
        const points = [pt1, pt2, pt3, pt4];
        const wire = this.createPolygonWire({ points });
        return this.alignAndTranslateShape({ shape: wire, direction: inputs.direction, center: inputs.center });
    }

    alignAndTranslateShape(inputs: { shape: TopoDS_Shape, direction: Base.Vector3, center: Base.Vector3 }) {
        const alignedWire = this.align(
            {
                shape: inputs.shape,
                fromOrigin: [0, 0, 0],
                fromDirection: [0, 1, 0],
                toOrigin: [0, 0, 0],
                toDirection: inputs.direction
            }
        );
        const translatedWire = this.translate(
            {
                shape: alignedWire,
                translation: inputs.center
            }
        );
        return translatedWire;
    }

    createSquareWire(inputs: Inputs.OCCT.SquareDto): TopoDS_Wire {
        return this.createRectangleWire({
            width: inputs.size,
            length: inputs.size,
            center: inputs.center,
            direction: inputs.direction
        });
    }

    createStarWire(inputs: Inputs.OCCT.StarDto) {
        const lines = this.shapesHelperServide.starLines(inputs.innerRadius, inputs.outerRadius, inputs.numRays, inputs.half);
        const edges = [];
        lines.forEach(line => {
            edges.push(this.lineEdge(line));
        })
        let wire = this.combineEdgesAndWiresIntoAWire({ shapes: edges });
        return this.alignAndTranslateShape({ shape: wire, direction: inputs.direction, center: inputs.center });
    }

    createParallelogramWire(inputs: Inputs.OCCT.ParallelogramDto) {
        const lines = this.shapesHelperServide.parallelogram(inputs.width, inputs.height, inputs.angle, inputs.aroundCenter);
        const edges = [];
        lines.forEach(line => {
            edges.push(this.lineEdge(line));
        })
        let wire = this.combineEdgesAndWiresIntoAWire({ shapes: edges });
        return this.alignAndTranslateShape({ shape: wire, direction: inputs.direction, center: inputs.center });
    }

    createPolygonWire(inputs: Inputs.OCCT.PolygonDto) {
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

    divideEdgeByParamsToPoints(inputs: Inputs.OCCT.DivideDto<TopoDS_Edge>): Inputs.Base.Point3[] {
        const edge = inputs.shape;
        const { uMin, uMax } = this.getEdgeBounds(edge);
        const curve = this.getGeomCurveFromEdge(edge, uMin, uMax);
        return this.divideCurveToNrSegments({ ...inputs, shape: curve }, uMin, uMax);
    }

    divideEdgeByEqualDistanceToPoints(inputs: Inputs.OCCT.DivideDto<TopoDS_Edge>): Base.Point3[] {
        const edge = inputs.shape;
        const wire = this.combineEdgesAndWiresIntoAWire({ shapes: [edge] });
        const curve = new this.occ.BRepAdaptor_CompCurve_2(wire, false);
        return this.divideCurveByEqualLengthDistance({ ...inputs, shape: curve });
    }

    pointOnEdgeAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<TopoDS_Edge>): Base.Point3 {
        const edge = inputs.shape;
        const { uMin, uMax } = this.getEdgeBounds(edge);
        const curve = this.getGeomCurveFromEdge(edge, uMin, uMax);
        // const curve = inputs.shape;
        const gpPnt = this.gpPnt([0, 0, 0]);
        const param = this.remap(inputs.param, 0, 1, uMin, uMax);
        curve.D0(param, gpPnt);
        return [gpPnt.X(), gpPnt.Y(), gpPnt.Z()];
        // return this.pointOnCurveAtParam({ ...inputs, shape: curve });
    }

    tangentOnEdgeAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<TopoDS_Edge>): Base.Vector3 {
        const edge = inputs.shape;
        const { uMin, uMax } = this.getEdgeBounds(edge);
        const curve = this.getGeomCurveFromEdge(edge, uMin, uMax);
        const param = this.remap(inputs.param, 0, 1, uMin, uMax);
        const vec = curve.DN(param, 1);
        return [vec.X(), vec.Y(), vec.Z()];
    }

    pointOnEdgeAtLength(inputs: Inputs.OCCT.DataOnGeometryAtLengthDto<TopoDS_Edge>): Base.Point3 {
        const edge = inputs.shape;
        const wire = this.combineEdgesAndWiresIntoAWire({ shapes: [edge] });
        return this.pointOnWireAtLength({ ...inputs, shape: wire });
    }

    tangentOnEdgeAtLength(inputs: Inputs.OCCT.DataOnGeometryAtLengthDto<TopoDS_Edge>): Base.Point3 {
        const edge = inputs.shape;
        const wire = this.combineEdgesAndWiresIntoAWire({ shapes: [edge] });
        return this.tangentOnWireAtLength({ ...inputs, shape: wire });
    }

    divideWireByParamsToPoints(inputs: Inputs.OCCT.DivideDto<TopoDS_Wire>): Inputs.Base.Point3[] {
        const wire = inputs.shape;
        const curve = new this.occ.BRepAdaptor_CompCurve_2(wire, false);
        return this.divideCurveToNrSegments({ ...inputs, shape: curve }, curve.FirstParameter(), curve.LastParameter());
    }

    divideWireByEqualDistanceToPoints(inputs: Inputs.OCCT.DivideDto<TopoDS_Wire>): Base.Point3[] {
        const wire = inputs.shape;
        const curve = new this.occ.BRepAdaptor_CompCurve_2(wire, false);
        return this.divideCurveByEqualLengthDistance({ ...inputs, shape: curve });
    }

    pointOnWireAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<TopoDS_Wire>): Base.Point3 {
        const wire = inputs.shape;
        const curve = new this.occ.BRepAdaptor_CompCurve_2(wire, false);
        return this.pointOnCurveAtParam({ ...inputs, shape: curve });
    }

    tangentOnWireAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<TopoDS_Wire>): Base.Point3 {
        const wire = inputs.shape;
        const curve = new this.occ.BRepAdaptor_CompCurve_2(wire, false);
        return this.tangentOnCurveAtParam({ ...inputs, shape: curve });
    }

    pointOnWireAtLength(inputs: Inputs.OCCT.DataOnGeometryAtLengthDto<TopoDS_Wire>): Base.Point3 {
        const wire = inputs.shape;
        const curve = new this.occ.BRepAdaptor_CompCurve_2(wire, false);

        const absc = new this.occ.GCPnts_AbscissaPoint_2(curve, inputs.length, curve.FirstParameter());
        const param = absc.Parameter();

        const gpPnt = this.gpPnt([0, 0, 0]);
        curve.D0(param, gpPnt);
        return [gpPnt.X(), gpPnt.Y(), gpPnt.Z()];
    }

    tangentOnWireAtLength(inputs: Inputs.OCCT.DataOnGeometryAtLengthDto<TopoDS_Wire>): Base.Point3 {
        const wire = inputs.shape;
        const curve = new this.occ.BRepAdaptor_CompCurve_2(wire, false);

        const absc = new this.occ.GCPnts_AbscissaPoint_2(curve, inputs.length, curve.FirstParameter());
        const param = absc.Parameter();

        const tanVec = curve.DN(param, 1);
        return [tanVec.X(), tanVec.Y(), tanVec.Z()];
    }

    pointOnCurveAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<Geom_Curve | BRepAdaptor_CompCurve_2>): Base.Point3 {
        const curve = inputs.shape;
        const gpPnt = this.gpPnt([0, 0, 0]);
        const param = this.remap(inputs.param, 0, 1, curve.FirstParameter(), curve.LastParameter());
        curve.D0(param, gpPnt);
        return [gpPnt.X(), gpPnt.Y(), gpPnt.Z()];
    }

    tangentOnCurveAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<Geom_Curve | BRepAdaptor_CompCurve_2>): Base.Point3 {
        const curve = inputs.shape;
        const param = this.remap(inputs.param, 0, 1, curve.FirstParameter(), curve.LastParameter());
        const vec = curve.DN(param, 1);
        return [vec.X(), vec.Y(), vec.Z()];
    }

    divideCurveByEqualLengthDistance(inputs: Inputs.OCCT.DivideDto<Adaptor3d_Curve>): Base.Point3[] {
        const curve = inputs.shape;
        const curveLength = this.occ.GCPnts_AbscissaPoint.Length_5(curve, curve.FirstParameter(), curve.LastParameter());
        const step = curveLength / inputs.nrOfDivisions;

        const lengths = [];
        for (let i = 0; i <= curveLength + 0.000000001; i += step) {
            lengths.push(i);
        }

        if (inputs.removeStartPoint) {
            lengths.shift();
        }
        if (inputs.removeEndPoint) {
            lengths.pop();
        }

        const paramsLength = lengths.map(l => {
            const absc = new this.occ.GCPnts_AbscissaPoint_2(curve, l, curve.FirstParameter());
            const param = absc.Parameter();
            return param;
        })

        const points = paramsLength.map(r => {
            const gpPnt = this.gpPnt([0, 0, 0]);
            curve.D0(r, gpPnt);
            return [gpPnt.X(), gpPnt.Y(), gpPnt.Z()] as Inputs.Base.Point3;
        });
        return points;
    }

    divideCurveToNrSegments(inputs: Inputs.OCCT.DivideDto<Geom_Curve | BRepAdaptor_CompCurve_2>, uMin: number, uMax: number) {
        const curve = inputs.shape;

        const ranges = [];
        for (let i = 0; i <= inputs.nrOfDivisions; i++) {
            const param = (i / inputs.nrOfDivisions);
            const paramMapped = this.remap(param, 0, 1, uMin, uMax);
            ranges.push(paramMapped);
        }

        if (inputs.removeStartPoint) {
            ranges.shift();
        }
        if (inputs.removeEndPoint) {
            ranges.pop();
        }

        const points = ranges.map(r => {
            const gpPnt = this.gpPnt([0, 0, 0]);
            curve.D0(r, gpPnt);
            return [gpPnt.X(), gpPnt.Y(), gpPnt.Z()] as Inputs.Base.Point3;
        });

        return points;
    }

    interpolatePoints(inputs: Inputs.OCCT.InterpolationDto) {
        const ptList = new this.occ.TColgp_Array1OfPnt_2(1, inputs.points.length);
        for (let pIndex = 1; pIndex <= inputs.points.length; pIndex++) {
            ptList.SetValue(pIndex, this.gpPnt(inputs.points[pIndex - 1]));
        }
        const geomCurveHandle = this.occ.BitByBitDev.BitInterpolate(ptList, inputs.periodic, inputs.tolerance);
        const edge = new this.occ.BRepBuilderAPI_MakeEdge_24(
            new this.occ.Handle_Geom_Curve_2(geomCurveHandle.get())
        ).Edge();
        return new this.occ.BRepBuilderAPI_MakeWire_2(edge).Wire();
    }

    getNumSolidsInCompound(shape: TopoDS_Shape): number | TopoDS_Shape {
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

    getSolidFromCompound(shape: TopoDS_Shape, index: number) {
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
        innerSolid.hash = (shape as any).hash + 1;
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

    getWires(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): TopoDS_Wire[] {
        const wires = [];
        this.forEachWire(inputs.shape, (wireIndex, myWire) => {
            wires.push(myWire);
        });
        return wires;
    }

    forEachWire(shape: TopoDS_Shape, callback): void {
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

    forEachEdge(shape: TopoDS_Shape, callback) {
        const edgeHashes = {};
        let edgeIndex = 0;
        const anExplorer = new this.occ.TopExp_Explorer_2(shape,
            (this.occ.TopAbs_ShapeEnum.TopAbs_EDGE as TopAbs_ShapeEnum), (this.occ.TopAbs_ShapeEnum.TopAbs_SHAPE as TopAbs_ShapeEnum)
        );
        for (anExplorer.Init(shape, (this.occ.TopAbs_ShapeEnum.TopAbs_EDGE as TopAbs_ShapeEnum),
            (this.occ.TopAbs_ShapeEnum.TopAbs_SHAPE as TopAbs_ShapeEnum));
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

    forEachFace(shape: TopoDS_Shape, callback): void {
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

    forEachShell(shape: TopoDS_Shape, callback): void {
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

    forEachVertex(shape: TopoDS_Shape, callback): void {
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

    isArrayLike(item): boolean {
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

    intersection(inputs: Inputs.OCCT.IntersectionDto<TopoDS_Shape>): TopoDS_Shape {
        if (inputs.shapes.length < 2) {
            throw (new Error('Less than 2 shapes provided for intersection'));
        }

        const intersectShape = inputs.shapes[0];
        let intersectionResult: TopoDS_Shape;
        for (let i = 1; i < inputs.shapes.length; i++) {
            const intersectedCommon = new this.occ.BRepAlgoAPI_Common_3(
                intersectShape,
                inputs.shapes[i],
                new this.occ.Message_ProgressRange_1()
            );
            if (intersectedCommon.HasGenerated()) {
                intersectedCommon.Build(new this.occ.Message_ProgressRange_1());
                intersectionResult = intersectedCommon.Shape();
            }
        }

        if (!inputs.keepEdges && intersectionResult) {
            const fusor = new this.occ.ShapeUpgrade_UnifySameDomain_2(intersectionResult, true, true, false);
            fusor.Build();
            intersectionResult = fusor.Shape();
        }

        return intersectionResult;
    }

    combineEdgesAndWiresIntoAWire(inputs: Inputs.OCCT.ShapesDto<TopoDS_Edge | TopoDS_Wire>): TopoDS_Wire {
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

    createBSpline(inputs: Inputs.OCCT.BSplineDto): TopoDS_Wire {
        const ptList = new this.occ.TColgp_Array1OfPnt_2(1, inputs.points.length + (inputs.closed ? 1 : 0));
        for (let pIndex = 1; pIndex <= inputs.points.length; pIndex++) {
            ptList.SetValue(pIndex, this.gpPnt(inputs.points[pIndex - 1]));
        }
        if (inputs.closed) { ptList.SetValue(inputs.points.length + 1, ptList.Value(1)); }

        const geomCurveHandle = new this.occ.GeomAPI_PointsToBSpline_2(ptList, 3, 8,
            (this.occ.GeomAbs_Shape.GeomAbs_C2 as GeomAbs_Shape), 1.0e-3);

        const bspline = geomCurveHandle.Curve().get();
        const edge = new this.occ.BRepBuilderAPI_MakeEdge_24(
            new this.occ.Handle_Geom_Curve_2(bspline)
        ).Edge();

        return new this.occ.BRepBuilderAPI_MakeWire_2(edge).Wire();
    }

    align(inputs: Inputs.OCCT.AlignDto<TopoDS_Shape>) {
        const transformation = new this.occ.gp_Trsf_1();
        transformation.SetDisplacement(
            this.gpAx3(inputs.fromOrigin, inputs.fromDirection),
            this.gpAx3(inputs.toOrigin, inputs.toDirection),
        );
        const translation = new this.occ.TopLoc_Location_2(transformation);
        return this.getActualTypeOfShape(inputs.shape.Moved(translation, false));
    }

    translate(inputs: Inputs.OCCT.TranslateDto<TopoDS_Shape>) {
        const transformation = new this.occ.gp_Trsf_1();
        transformation.SetTranslation_1(new this.occ.gp_Vec_4(inputs.translation[0], inputs.translation[1], inputs.translation[2]));
        const translation = new this.occ.TopLoc_Location_2(transformation);
        return this.getActualTypeOfShape(inputs.shape.Moved(translation, false));
    }

    mirror(inputs: Inputs.OCCT.MirrorDto<TopoDS_Shape>) {
        const transformation = new this.occ.gp_Trsf_1();
        const ax1 = this.gpAx1(inputs.origin, inputs.direction);
        transformation.SetMirror_2(ax1);
        const transformed = new this.occ.BRepBuilderAPI_Transform_2(inputs.shape, transformation, true);
        return this.getActualTypeOfShape(transformed.Shape());
    }

    mirrorAlongNormal(inputs: Inputs.OCCT.MirrorAlongNormalDto<TopoDS_Shape>) {
        const transformation = new this.occ.gp_Trsf_1();
        const ax = this.gpAx2(inputs.origin, inputs.normal);
        transformation.SetMirror_3(ax);
        const transformed = new this.occ.BRepBuilderAPI_Transform_2(inputs.shape, transformation, true);
        return this.getActualTypeOfShape(transformed.Shape());
    }

    rotate(inputs: Inputs.OCCT.RotateDto<TopoDS_Shape>) {
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

    surfaceFromFace(inputs: Inputs.OCCT.ShapeDto<TopoDS_Face>) {
        const face = inputs.shape;
        const surface = this.occ.BRep_Tool.Surface_2(face);
        return surface.get();
    }


    makeEdgeFromGeom2dCurveAndSurfaceBounded(inputs: Inputs.OCCT.ShapesDto<Geom2d_Curve | Geom_Surface>, umin: number, umax: number): TopoDS_Edge {
        const curve2d = new this.occ.Handle_Geom2d_Curve_2(inputs.shapes[0] as Geom2d_Curve);
        const surface = new this.occ.Handle_Geom_Surface_2(inputs.shapes[1] as Geom_Surface);
        const res = new this.occ.BRepBuilderAPI_MakeEdge_31(curve2d, surface, umin, umax);
        return this.getActualTypeOfShape(res.Shape());
    }

    makeEdgeFromGeom2dCurveAndSurface(inputs: Inputs.OCCT.ShapesDto<Geom2d_Curve | Geom_Surface>, umin?: number, umax?: number): TopoDS_Edge {
        const curve2d = new this.occ.Handle_Geom2d_Curve_2(inputs.shapes[0] as Geom2d_Curve);
        const surface = new this.occ.Handle_Geom_Surface_2(inputs.shapes[1] as Geom_Surface);
        const res = new this.occ.BRepBuilderAPI_MakeEdge_30(curve2d, surface);
        return this.getActualTypeOfShape(res.Shape());
    }

    startPointOnEdge(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>): Base.Point3 {
        const edge = inputs.shape;
        const { uMin, uMax } = this.getEdgeBounds(edge);
        const curve = this.getGeomCurveFromEdge(edge, uMin, uMax);
        return this.startPointOnCurve({ ...inputs, shape: curve });
    }

    startPointOnWire(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): Base.Point3 {
        const wire = inputs.shape;
        const curve = new this.occ.BRepAdaptor_CompCurve_2(wire, false);
        return this.startPointOnCurve({ ...inputs, shape: curve });
    }

    endPointOnWire(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): Base.Point3 {
        const wire = inputs.shape;
        const curve = new this.occ.BRepAdaptor_CompCurve_2(wire, false);
        return this.endPointOnCurve({ ...inputs, shape: curve });
    }

    startPointOnCurve(inputs: Inputs.OCCT.ShapeDto<Geom_Curve | BRepAdaptor_CompCurve_2>): Inputs.Base.Point3 {
        const curve = inputs.shape;
        const gpPnt = this.gpPnt([0, 0, 0]);
        curve.D0(curve.FirstParameter(), gpPnt);
        return [gpPnt.X(), gpPnt.Y(), gpPnt.Z()];
    }

    endPointOnCurve(inputs: Inputs.OCCT.ShapeDto<Geom_Curve | BRepAdaptor_CompCurve_2>): Inputs.Base.Point3 {
        const curve = inputs.shape;
        const gpPnt = this.gpPnt([0, 0, 0]);
        curve.D0(curve.LastParameter(), gpPnt);
        return [gpPnt.X(), gpPnt.Y(), gpPnt.Z()];
    }

    getGeomCurveFromEdge(edge: TopoDS_Edge, uMin: number, uMax: number): Geom_Curve {
        const loc = edge.Location_1();
        const crvHandle = this.occ.BRep_Tool.Curve_1(edge, loc, uMin, uMax);
        const curve = crvHandle.get();
        return curve;
    }

    getEdgeBounds(edge: TopoDS_Edge): { uMin: number, uMax: number } {
        const p1 = { current: 0 };
        const p2 = { current: 0 };
        this.occ.BRep_Tool.Range_1(edge, p1 as any, p2 as any);
        return { uMin: p1.current, uMax: p2.current };
    }

    getUVBounds(face: TopoDS_Face): { uMin: number, uMax: number, vMin: number, vMax: number } {
        const uMin = { current: 0 };
        const uMax = { current: 0 };
        const vMin = { current: 0 };
        const vMax = { current: 0 };
        this.occ.BRepTools.UVBounds_1(face, uMin as any, uMax as any, vMin as any, vMax as any);
        return { uMin: uMin.current, uMax: uMax.current, vMin: vMin.current, vMax: vMax.current };
    }

    remap(value: number, from1: number, to1: number, from2: number, to2: number): number {
        return (value - from1) / (to1 - from1) * (to2 - from2) + from2;
    }

}

