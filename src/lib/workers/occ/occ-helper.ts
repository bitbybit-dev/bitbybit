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
                pt1.delete();
                pt2.delete();
                crv.delete();
                points.push(pt1g);
                points.push(pt2g);
            } catch {
            }
            crvHandle.delete();
        });
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
        builder.delete();
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
        let ax = new this.occ.gp_Ax22d_2(pt, dir1, dir2);
        dir1.delete();
        dir2.delete();
        pt.delete();
        return ax;
    }

    gpPln(point: Base.Point3, direction: Base.Vector3): gp_Pln_3 {
        const gpPnt = this.gpPnt(point);
        const gpDir = this.gpDir(direction);
        let pln = new this.occ.gp_Pln_3(gpPnt, gpDir);
        gpPnt.delete();
        gpDir.delete();
        return pln;
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
        const circle = new this.occ.GC_MakeCircle_2(this.gpAx2(center, direction), radius);
        const cirVal = circle.Value();
        const cir = cirVal.get();
        circle.delete();
        return cir;
    }

    gcMakeEllipse(center: Base.Point3, direction: Base.Vector3, minorRadius: number, majorRadius: number): Geom_Ellipse {
        const ax = this.gpAx2(center, direction);
        const ellipse = new this.occ.GC_MakeEllipse_2(ax, majorRadius, minorRadius);
        if (ellipse.IsDone()) {
            const ellipseVal = ellipse.Value();
            const ell = ellipseVal.get();
            ellipse.delete();
            ax.delete();
            return ell;
        } else {
            throw new Error("Ellipse could not be created.");
        }
    }

    bRepBuilderAPIMakeEdge(curve: Geom_Curve): TopoDS_Edge {
        const crv = this.castToHandleGeomCurve(curve);
        const edge = new this.occ.BRepBuilderAPI_MakeEdge_24(crv);
        let ed = edge.Edge();
        edge.delete();
        crv.delete();
        return ed;
    }

    bRepBuilderAPIMakeWire(edge: TopoDS_Edge): TopoDS_Wire {
        const wire = new this.occ.BRepBuilderAPI_MakeWire_2(edge);
        const w = wire.Wire();
        wire.delete();
        return w;
    }

    makeVertex(pt: Base.Point3): TopoDS_Vertex {
        const gpPnt = this.gpPnt(pt);
        const vert = new this.occ.BRepBuilderAPI_MakeVertex(gpPnt);
        const vrt = vert.Vertex();
        gpPnt.delete();
        vert.delete();
        return vrt;
    }

    bRepBuilderAPIMakeShell(face: TopoDS_Face): TopoDS_Shell {
        const srf = this.occ.BRep_Tool.Surface_2(face);
        const makeShell = new this.occ.BRepBuilderAPI_MakeShell_2(
            srf,
            false);

        const shell = makeShell.Shell();
        makeShell.delete();
        srf.delete();
        return shell;
    }

    bRepBuilderAPIMakeFaceFromWire(wire: TopoDS_Wire, planar: boolean): TopoDS_Face {
        const faceMaker = new this.occ.BRepBuilderAPI_MakeFace_15(wire, planar);
        const face = faceMaker.Face();
        faceMaker.delete();
        return face;
    }

    bRepBuilderAPIMakeFaceFromSurface(surface: Geom_Surface, tolDegen: number): TopoDS_Face {
        const hs = new this.occ.Handle_Geom_Surface_2(surface);
        const faceMaker = new this.occ.BRepBuilderAPI_MakeFace_8(hs, tolDegen);
        const face = faceMaker.Face();
        faceMaker.delete();
        hs.delete();
        return face;
    }

    bRepBuilderAPIMakeFaceFromSurfaceAndWire(surface: Geom_Surface, wire: TopoDS_Wire, inside: boolean): TopoDS_Face {
        const hs = new this.occ.Handle_Geom_Surface_2(surface);
        const faceMaker = new this.occ.BRepBuilderAPI_MakeFace_21(hs, wire, inside);
        const face = faceMaker.Face();
        faceMaker.delete();
        hs.delete();
        return face;
    }

    bRepPrimAPIMakeSphere(center: Base.Point3, direction: Base.Vector3, radius: number): TopoDS_Shape {
        const ax = this.gpAx2(center, direction);
        const sphereMaker = new this.occ.BRepPrimAPI_MakeSphere_9(ax, radius);
        const sphere = sphereMaker.Shape();
        sphereMaker.delete();
        ax.delete();
        return sphere;
    }

    bRepPrimAPIMakeCylinder(center: Base.Point3, direction: Base.Vector3, radius, height): TopoDS_Shape {
        const ax = this.gpAx2(center, direction);
        const cylinderMaker = new this.occ.BRepPrimAPI_MakeCylinder_3(ax, radius, height);
        const cylinder = cylinderMaker.Shape();
        cylinderMaker.delete();
        ax.delete();
        return cylinder;
    }

    bRepPrimAPIMakeCylinderBetweenPoints(start: Base.Point3, end: Base.Point3, radius: number): TopoDS_Shape {
        const center = this.gpPnt(start);
        const pt = this.gpPnt(end);
        const vec = new this.occ.gp_Vec_5(center, pt);
        const distance = vec.Magnitude();
        const ax = this.gpAx2(start, [vec.X(), vec.Y(), vec.Z()]);
        const cylinderMaker = new this.occ.BRepPrimAPI_MakeCylinder_3(ax, radius, distance);
        const cylinder = cylinderMaker.Shape();
        cylinderMaker.delete();
        ax.delete();
        center.delete();
        pt.delete();
        vec.delete();
        return cylinder;
    }

    bRepPrimAPIMakeBox(width: number, length: number, height: number, center: number[]): TopoDS_Shape {
        const pt = this.gpPnt([
            -width / 2 + center[0],
            -height / 2 + center[1],
            -length / 2 + center[2]
        ]);
        const boxMaker = new this.occ.BRepPrimAPI_MakeBox_3(pt, width, height, length);
        const box = boxMaker.Shape();
        boxMaker.delete();
        pt.delete();
        return box;
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
        const edge = inputs.shape;
        const gprops = new this.occ.GProp_GProps_1();
        this.occ.BRepGProp.LinearProperties(edge, gprops, false, false);
        const mass = gprops.Mass();
        gprops.delete();
        return mass;
    }

    getEdgesLengths(inputs: Inputs.OCCT.ShapesDto<TopoDS_Edge>): number[] {
        return inputs.shapes.map(edge => this.getEdgeLength({ shape: edge }));
    }

    getEdgeCenterOfMass(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>): Base.Point3 {
        const edge: TopoDS_Edge = inputs.shape;
        const gprops = new this.occ.GProp_GProps_1();
        this.occ.BRepGProp.LinearProperties(edge, gprops, false, false);
        const gppnt = gprops.CentreOfMass();
        const pt: Base.Point3 = [gppnt.X(), gppnt.Y(), gppnt.Z()];
        gprops.delete();
        return pt;
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
        const area = gprops.Mass();
        gprops.delete();
        return area;
    }

    getFacesAreas(inputs: Inputs.OCCT.ShapesDto<TopoDS_Face>): number[] {
        return inputs.shapes.map(face => this.getFaceArea({ shape: face }));
    }

    getFaceCenterOfMass(inputs: Inputs.OCCT.ShapeDto<TopoDS_Face>): Base.Point3 {
        const gprops = new this.occ.GProp_GProps_1();
        this.occ.BRepGProp.SurfaceProperties_1(inputs.shape, gprops, false, false);
        const gppnt = gprops.CentreOfMass();
        const pt: Base.Point3 = [gppnt.X(), gppnt.Y(), gppnt.Z()];
        gprops.delete();
        gppnt.delete();
        return pt;
    }

    getFacesCentersOfMass(inputs: Inputs.OCCT.ShapesDto<TopoDS_Face>): Base.Point3[] {
        return inputs.shapes.map(face => this.getFaceCenterOfMass({ shape: face }))
    }

    getSolidVolume(inputs: Inputs.OCCT.ShapeDto<TopoDS_Solid>): number {
        const gprops = new this.occ.GProp_GProps_1();
        this.occ.BRepGProp.VolumeProperties_1(inputs.shape, gprops, true, false, false);
        const vol = gprops.Mass();
        gprops.delete();
        return vol;
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
        const pt: Base.Point3 = [gppnt.X(), gppnt.Y(), gppnt.Z()];
        gprops.delete();
        gppnt.delete();
        return pt;
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
                circle.delete();
                return edge;
            } else {
                const circleWire = this.bRepBuilderAPIMakeWire(edge);
                if (type === typeSpecificityEnum.wire) {
                    edge.delete();
                    return circleWire;
                } else if (type === typeSpecificityEnum.face) {
                    const face = this.bRepBuilderAPIMakeFaceFromWire(circleWire, true);
                    return face;
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
                ellipse.delete();
                return edge;
            } else {
                const ellipseWire = this.bRepBuilderAPIMakeWire(edge);
                if (type === typeSpecificityEnum.wire) {
                    edge.delete();
                    return ellipseWire;
                } else if (type === typeSpecificityEnum.face) {
                    const face = this.bRepBuilderAPIMakeFaceFromWire(ellipseWire, true);
                    return face;
                }
            }
        }
        return ellipse;
    }

    createSquareFace(inputs: Inputs.OCCT.SquareDto): TopoDS_Face {
        const squareWire = this.createSquareWire(inputs);
        const faceMakerFromWire = this.bRepBuilderAPIMakeFaceFromWire(squareWire, true);
        squareWire.delete();
        return faceMakerFromWire;
    }

    createRectangleFace(inputs: Inputs.OCCT.RectangleDto): TopoDS_Face {
        const rectangleWire = this.createRectangleWire(inputs);
        const faceMakerFromWire = this.bRepBuilderAPIMakeFaceFromWire(rectangleWire, true);
        rectangleWire.delete();
        return faceMakerFromWire;
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
        const alignedWire = this.alignAndTranslateShape({ shape: wire, direction: inputs.direction, center: inputs.center });
        wire.delete();
        return alignedWire;
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
        alignedWire.delete();
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
        const alignedWire = this.alignAndTranslateShape({ shape: wire, direction: inputs.direction, center: inputs.center });
        wire.delete();
        return alignedWire;
    }

    createParallelogramWire(inputs: Inputs.OCCT.ParallelogramDto) {
        const lines = this.shapesHelperServide.parallelogram(inputs.width, inputs.height, inputs.angle, inputs.aroundCenter);
        const edges = [];
        lines.forEach(line => {
            edges.push(this.lineEdge(line));
        })
        let wire = this.combineEdgesAndWiresIntoAWire({ shapes: edges });
        let aligned = this.alignAndTranslateShape({ shape: wire, direction: inputs.direction, center: inputs.center });
        wire.delete();
        return aligned;
    }

    createPolygonWire(inputs: Inputs.OCCT.PolygonDto) {
        const gpPoints = [];
        for (let ind = 0; ind < inputs.points.length; ind++) {
            gpPoints.push(this.gpPnt(inputs.points[ind]));
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

    private makeWireBetweenTwoPoints(pt1: any, pt2: any) {
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
        const gpPnt = this.gpPnt([0, 0, 0]);
        const param = this.remap(inputs.param, 0, 1, uMin, uMax);
        curve.D0(param, gpPnt);
        const pt: Base.Point3 = [gpPnt.X(), gpPnt.Y(), gpPnt.Z()];
        curve.delete();
        gpPnt.delete();
        return pt;
    }

    tangentOnEdgeAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<TopoDS_Edge>): Base.Vector3 {
        const edge = inputs.shape;
        const { uMin, uMax } = this.getEdgeBounds(edge);
        const curve = this.getGeomCurveFromEdge(edge, uMin, uMax);
        const param = this.remap(inputs.param, 0, 1, uMin, uMax);
        const vec = curve.DN(param, 1);
        const vector: Base.Vector3 = [vec.X(), vec.Y(), vec.Z()];
        curve.delete();
        vec.delete();
        return vector;
    }

    pointOnEdgeAtLength(inputs: Inputs.OCCT.DataOnGeometryAtLengthDto<TopoDS_Edge>): Base.Point3 {
        const edge = inputs.shape;
        const wire = this.combineEdgesAndWiresIntoAWire({ shapes: [edge] });
        const pt = this.pointOnWireAtLength({ ...inputs, shape: wire });
        wire.delete();
        return pt;
    }

    tangentOnEdgeAtLength(inputs: Inputs.OCCT.DataOnGeometryAtLengthDto<TopoDS_Edge>): Base.Point3 {
        const edge = inputs.shape;
        const wire = this.combineEdgesAndWiresIntoAWire({ shapes: [edge] });
        const tangent = this.tangentOnWireAtLength({ ...inputs, shape: wire });
        wire.delete();
        return tangent;
    }

    divideWireByParamsToPoints(inputs: Inputs.OCCT.DivideDto<TopoDS_Wire>): Inputs.Base.Point3[] {
        const wire = inputs.shape;
        const curve = new this.occ.BRepAdaptor_CompCurve_2(wire, false);
        const points = this.divideCurveToNrSegments({ ...inputs, shape: curve }, curve.FirstParameter(), curve.LastParameter());
        curve.delete();
        return points;
    }

    divideWireByEqualDistanceToPoints(inputs: Inputs.OCCT.DivideDto<TopoDS_Wire>): Base.Point3[] {
        const wire = inputs.shape;
        const curve = new this.occ.BRepAdaptor_CompCurve_2(wire, false);
        const points = this.divideCurveByEqualLengthDistance({ ...inputs, shape: curve });
        curve.delete();
        return points;
    }

    pointOnWireAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<TopoDS_Wire>): Base.Point3 {
        const wire = inputs.shape;
        const curve = new this.occ.BRepAdaptor_CompCurve_2(wire, false);
        const pt = this.pointOnCurveAtParam({ ...inputs, shape: curve });
        curve.delete();
        return pt;
    }

    tangentOnWireAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<TopoDS_Wire>): Base.Point3 {
        const wire = inputs.shape;
        const curve = new this.occ.BRepAdaptor_CompCurve_2(wire, false);
        const tangent = this.tangentOnCurveAtParam({ ...inputs, shape: curve });
        curve.delete();
        return tangent;
    }

    pointOnWireAtLength(inputs: Inputs.OCCT.DataOnGeometryAtLengthDto<TopoDS_Wire>): Base.Point3 {
        const wire = inputs.shape;
        const curve = new this.occ.BRepAdaptor_CompCurve_2(wire, false);

        const absc = new this.occ.GCPnts_AbscissaPoint_2(curve, inputs.length, curve.FirstParameter());
        const param = absc.Parameter();

        const gpPnt = this.gpPnt([0, 0, 0]);
        curve.D0(param, gpPnt);
        const pt: Base.Point3 = [gpPnt.X(), gpPnt.Y(), gpPnt.Z()];
        curve.delete();
        absc.delete();
        gpPnt.delete();
        return pt;
    }

    tangentOnWireAtLength(inputs: Inputs.OCCT.DataOnGeometryAtLengthDto<TopoDS_Wire>): Base.Point3 {
        const wire = inputs.shape;
        const curve = new this.occ.BRepAdaptor_CompCurve_2(wire, false);

        const absc = new this.occ.GCPnts_AbscissaPoint_2(curve, inputs.length, curve.FirstParameter());
        const param = absc.Parameter();

        const tanVec = curve.DN(param, 1);
        const pt: Base.Point3 = [tanVec.X(), tanVec.Y(), tanVec.Z()];
        curve.delete();
        absc.delete();
        tanVec.delete();
        return pt;
    }

    pointOnCurveAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<Geom_Curve | BRepAdaptor_CompCurve_2>): Base.Point3 {
        const curve = inputs.shape;
        const gpPnt = this.gpPnt([0, 0, 0]);
        const param = this.remap(inputs.param, 0, 1, curve.FirstParameter(), curve.LastParameter());
        curve.D0(param, gpPnt);
        const pt: Base.Point3 = [gpPnt.X(), gpPnt.Y(), gpPnt.Z()];
        gpPnt.delete();
        return pt;
    }

    tangentOnCurveAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<Geom_Curve | BRepAdaptor_CompCurve_2>): Base.Point3 {
        const curve = inputs.shape;
        const param = this.remap(inputs.param, 0, 1, curve.FirstParameter(), curve.LastParameter());
        const vec = curve.DN(param, 1);
        const pt: Base.Point3 = [vec.X(), vec.Y(), vec.Z()];
        vec.delete();
        return pt;
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
            absc.delete();
            return param;
        })

        const points = paramsLength.map(r => {
            const gpPnt = this.gpPnt([0, 0, 0]);
            curve.D0(r, gpPnt);
            const pt = [gpPnt.X(), gpPnt.Y(), gpPnt.Z()] as Base.Point3;
            gpPnt.delete();
            return pt;
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
            const pt = [gpPnt.X(), gpPnt.Y(), gpPnt.Z()] as Base.Point3;
            gpPnt.delete();
            return pt;
        });

        return points;
    }

    interpolatePoints(inputs: Inputs.OCCT.InterpolationDto) {
        const ptList = new this.occ.TColgp_Array1OfPnt_2(1, inputs.points.length);
        const gpPnts = [];
        for (let pIndex = 1; pIndex <= inputs.points.length; pIndex++) {
            const gpPnt = this.gpPnt(inputs.points[pIndex - 1]);
            gpPnts.push(gpPnt);
            ptList.SetValue(pIndex, gpPnt);
        }
        const geomBSplineHandle = this.occ.BitByBitDev.BitInterpolate(ptList, inputs.periodic, inputs.tolerance);
        const geomBSpline = geomBSplineHandle.get();
        const geomCrvHandle = new this.occ.Handle_Geom_Curve_2(geomBSpline);
        const edgeMaker = new this.occ.BRepBuilderAPI_MakeEdge_24(geomCrvHandle);
        const edge = edgeMaker.Edge();
        const wireMaker = new this.occ.BRepBuilderAPI_MakeWire_2(edge);
        const wire = wireMaker.Wire();

        geomBSplineHandle.delete();
        geomCrvHandle.delete();
        edgeMaker.delete();
        edge.delete();
        wireMaker.delete();
        ptList.delete();
        gpPnts.forEach(p => p.delete());
        return wire;
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
        anExplorer.delete();
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
        anExplorer.delete();
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
        anExplorer.delete();
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
        anExplorer.delete();
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
        anExplorer.delete();
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
        anExplorer.delete();
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

    intersection(inputs: Inputs.OCCT.IntersectionDto<TopoDS_Shape>): TopoDS_Shape[] {
        if (inputs.shapes.length < 2) {
            throw (new Error('Less than 2 shapes provided for intersection'));
        }

        const intersectShape = inputs.shapes[0];
        let intersectionResults: TopoDS_Shape[] = [];

        // TODO Try to make a compound so that this loop would not be needed
        for (let i = 1; i < inputs.shapes.length; i++) {
            let intersectionResult: TopoDS_Shape;
            const messageProgress = new this.occ.Message_ProgressRange_1();
            const intersectedCommon = new this.occ.BRepAlgoAPI_Common_3(
                intersectShape,
                inputs.shapes[i],
                messageProgress
            );
            const messageProgress2 = new this.occ.Message_ProgressRange_1();
            if (intersectedCommon.HasGenerated()) {
                intersectedCommon.Build(messageProgress2);
                intersectionResult = intersectedCommon.Shape();
                intersectionResults.push(intersectionResult);
            }
            messageProgress.delete();
            intersectedCommon.delete();
            messageProgress2.delete();
        }

        if (!inputs.keepEdges && intersectionResults.length > 0) {
            intersectionResults = intersectionResults.map(i => {
                const fusor = new this.occ.ShapeUpgrade_UnifySameDomain_2(i, true, true, false);
                fusor.Build();
                let fusedShape = fusor.Shape();
                fusor.delete();
                return fusedShape;
            });
        }

        return intersectionResults;
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
            const wire = makeWire.Wire();
            makeWire.delete();
            return wire;
        } else {
            makeWire.delete();
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
        const gpPnts = [];
        for (let pIndex = 1; pIndex <= inputs.points.length; pIndex++) {
            const gpPnt = this.gpPnt(inputs.points[pIndex - 1]);
            gpPnts.push(gpPnt);
            ptList.SetValue(pIndex, gpPnt);
        }
        if (inputs.closed) { ptList.SetValue(inputs.points.length + 1, ptList.Value(1)); }

        const ptsToBspline = new this.occ.GeomAPI_PointsToBSpline_2(ptList, 3, 8,
            (this.occ.GeomAbs_Shape.GeomAbs_C2 as GeomAbs_Shape), 1.0e-3);

        const bsplineHandle = ptsToBspline.Curve();
        const bspline = bsplineHandle.get();
        const bsplineCrv = new this.occ.Handle_Geom_Curve_2(bspline)
        const edgeMaker = new this.occ.BRepBuilderAPI_MakeEdge_24(bsplineCrv);
        const edge = edgeMaker.Edge();
        const wireMaker = new this.occ.BRepBuilderAPI_MakeWire_2(edge);
        const wire = wireMaker.Wire();

        gpPnts.forEach(p => p.delete());
        ptList.delete();
        ptsToBspline.delete();
        bsplineHandle.delete();
        bsplineCrv.delete();
        edgeMaker.delete();
        edge.delete();
        wireMaker.delete();

        return wire;
    }

    align(inputs: Inputs.OCCT.AlignDto<TopoDS_Shape>) {
        const transformation = new this.occ.gp_Trsf_1();

        const ax1 = this.gpAx3(inputs.fromOrigin, inputs.fromDirection);
        const ax2 = this.gpAx3(inputs.toOrigin, inputs.toDirection);

        transformation.SetDisplacement(
            ax1,
            ax2,
        );
        const translation = new this.occ.TopLoc_Location_2(transformation);
        const moved = inputs.shape.Moved(translation, false);

        transformation.delete();
        ax1.delete();
        ax2.delete();
        const shp = this.getActualTypeOfShape(moved);
        moved.delete();
        return shp;
    }

    translate(inputs: Inputs.OCCT.TranslateDto<TopoDS_Shape>) {
        const transformation = new this.occ.gp_Trsf_1();
        const gpVec = new this.occ.gp_Vec_4(inputs.translation[0], inputs.translation[1], inputs.translation[2]);
        transformation.SetTranslation_1(gpVec);
        const translation = new this.occ.TopLoc_Location_2(transformation);
        const moved = inputs.shape.Moved(translation, false);
        const shp = this.getActualTypeOfShape(moved);
        moved.delete();
        transformation.delete();
        gpVec.delete();
        return shp;
    }

    mirror(inputs: Inputs.OCCT.MirrorDto<TopoDS_Shape>) {
        const transformation = new this.occ.gp_Trsf_1();
        const ax1 = this.gpAx1(inputs.origin, inputs.direction);
        transformation.SetMirror_2(ax1);
        const transformed = new this.occ.BRepBuilderAPI_Transform_2(inputs.shape, transformation, true);
        const transformedShape = transformed.Shape();
        const shp = this.getActualTypeOfShape(transformedShape);

        transformedShape.delete();
        transformed.delete();
        transformation.delete();
        ax1.delete();

        return shp;
    }

    mirrorAlongNormal(inputs: Inputs.OCCT.MirrorAlongNormalDto<TopoDS_Shape>) {
        const transformation = new this.occ.gp_Trsf_1();
        const ax = this.gpAx2(inputs.origin, inputs.normal);
        transformation.SetMirror_3(ax);
        const transformed = new this.occ.BRepBuilderAPI_Transform_2(inputs.shape, transformation, true);
        const transformedShape = transformed.Shape();
        const shp = this.getActualTypeOfShape(transformedShape);
        ax.delete();
        transformedShape.delete();
        transformed.delete();
        transformation.delete();
        return shp;
    }

    rotate(inputs: Inputs.OCCT.RotateDto<TopoDS_Shape>) {
        let rotated;
        if (inputs.angle === 0) {
            rotated = inputs.shape;
        } else {
            const transformation = new this.occ.gp_Trsf_1();
            const pt1 = new this.occ.gp_Pnt_3(0, 0, 0);
            const gpVec = new this.occ.gp_Vec_4(inputs.axis[0], inputs.axis[1], inputs.axis[2])
            const dir = new this.occ.gp_Dir_2(gpVec);
            const ax = new this.occ.gp_Ax1_2(pt1, dir);
            transformation.SetRotation_1(ax, inputs.angle * 0.0174533);
            const rotation = new this.occ.TopLoc_Location_2(transformation);
            rotated = (inputs.shape as TopoDS_Shape).Moved(rotation, false);

            transformation.delete();
            pt1.delete();
            gpVec.delete();
            dir.delete();
            ax.delete();
            rotation.delete();
        }
        let actualShape = this.getActualTypeOfShape(rotated);
        if (inputs.angle !== 0) {
            rotated.delete();
        }
        return actualShape;
    }

    surfaceFromFace(inputs: Inputs.OCCT.ShapeDto<TopoDS_Face>) {
        const face = inputs.shape;
        const surface = this.occ.BRep_Tool.Surface_2(face);
        const srf = surface.get();
        return srf;
    }


    makeEdgeFromGeom2dCurveAndSurfaceBounded(inputs: Inputs.OCCT.ShapesDto<Geom2d_Curve | Geom_Surface>, umin: number, umax: number): TopoDS_Edge {
        const curve2d = new this.occ.Handle_Geom2d_Curve_2(inputs.shapes[0] as Geom2d_Curve);
        const surface = new this.occ.Handle_Geom_Surface_2(inputs.shapes[1] as Geom_Surface);
        const res = new this.occ.BRepBuilderAPI_MakeEdge_31(curve2d, surface, umin, umax);
        const resShape = res.Shape();
        const r = this.getActualTypeOfShape(resShape);
        resShape.delete();
        res.delete();
        return r;
    }

    makeEdgeFromGeom2dCurveAndSurface(inputs: Inputs.OCCT.ShapesDto<Geom2d_Curve | Geom_Surface>, umin?: number, umax?: number): TopoDS_Edge {
        const curve2d = new this.occ.Handle_Geom2d_Curve_2(inputs.shapes[0] as Geom2d_Curve);
        const surface = new this.occ.Handle_Geom_Surface_2(inputs.shapes[1] as Geom_Surface);
        const res = new this.occ.BRepBuilderAPI_MakeEdge_30(curve2d, surface);
        const resShape = res.Shape();
        const r = this.getActualTypeOfShape(resShape);
        resShape.delete();
        res.delete();
        return r;
    }

    startPointOnEdge(inputs: Inputs.OCCT.ShapeDto<TopoDS_Edge>): Base.Point3 {
        const edge = inputs.shape;
        const { uMin, uMax } = this.getEdgeBounds(edge);
        const curve = this.getGeomCurveFromEdge(edge, uMin, uMax);
        let res = this.startPointOnCurve({ ...inputs, shape: curve });
        curve.delete();
        return res;
    }

    startPointOnWire(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): Base.Point3 {
        const wire = inputs.shape;
        const curve = new this.occ.BRepAdaptor_CompCurve_2(wire, false);
        let res = this.startPointOnCurve({ ...inputs, shape: curve });
        curve.delete();
        return res;
    }

    endPointOnWire(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): Base.Point3 {
        const wire = inputs.shape;
        const curve = new this.occ.BRepAdaptor_CompCurve_2(wire, false);
        let res = this.endPointOnCurve({ ...inputs, shape: curve });
        curve.delete();
        return res;
    }

    startPointOnCurve(inputs: Inputs.OCCT.ShapeDto<Geom_Curve | BRepAdaptor_CompCurve_2>): Inputs.Base.Point3 {
        const curve = inputs.shape;
        const gpPnt = this.gpPnt([0, 0, 0]);
        curve.D0(curve.FirstParameter(), gpPnt);
        let pt: Base.Point3 = [gpPnt.X(), gpPnt.Y(), gpPnt.Z()];
        gpPnt.delete();
        return pt;
    }

    endPointOnCurve(inputs: Inputs.OCCT.ShapeDto<Geom_Curve | BRepAdaptor_CompCurve_2>): Inputs.Base.Point3 {
        const curve = inputs.shape;
        const gpPnt = this.gpPnt([0, 0, 0]);
        curve.D0(curve.LastParameter(), gpPnt);
        const pt: Base.Point3 = [gpPnt.X(), gpPnt.Y(), gpPnt.Z()];
        gpPnt.delete();
        return pt;
    }

    getGeomCurveFromEdge(edge: TopoDS_Edge, uMin: number, uMax: number): Geom_Curve {
        const loc = edge.Location_1();
        const crvHandle = this.occ.BRep_Tool.Curve_1(edge, loc, uMin, uMax);
        const curve = crvHandle.get();
        crvHandle.delete();
        loc.delete();
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

