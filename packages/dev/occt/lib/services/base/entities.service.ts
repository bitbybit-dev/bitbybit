import {
    Geom_Circle, Geom_Curve, Geom_Ellipse, Geom_Surface, Handle_Geom_Curve, Handle_Geom_Surface, OpenCascadeInstance,
    TopoDS_Edge, TopoDS_Face, TopoDS_Shape, TopoDS_Shell, TopoDS_Vertex, TopoDS_Wire,
    gp_Ax1, gp_Ax2, gp_Ax22d_2, gp_Ax2d_2, gp_Ax3, gp_Dir2d_4, gp_Dir_4, gp_Pln_3,
    gp_Pnt2d_3, gp_Pnt_3, gp_Vec2d_4, gp_Vec_4, gp_XYZ_2
} from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../../api/inputs/inputs";
import { Base } from "../../api/inputs/base-inputs";

export class EntitiesService {

    constructor(
        public readonly occ: OpenCascadeInstance,
    ) { }

    createCircle(radius: number, center: Base.Point3, direction: Base.Vector3, type: Inputs.OCCT.typeSpecificityEnum) {
        const circle = this.gcMakeCircle(center, direction, radius);
        if (type === Inputs.OCCT.typeSpecificityEnum.curve) {
            return circle;
        } else {
            const edge = this.bRepBuilderAPIMakeEdge(circle);
            if (type === Inputs.OCCT.typeSpecificityEnum.edge) {
                return edge;
            } else {
                const circleWire = this.bRepBuilderAPIMakeWire(edge);
                if (type === Inputs.OCCT.typeSpecificityEnum.wire) {
                    edge.delete();
                    return circleWire;
                } else if (type === Inputs.OCCT.typeSpecificityEnum.face) {
                    const face = this.bRepBuilderAPIMakeFaceFromWire(circleWire, true);
                    return face;
                }
            }
        }
        return circle;
    }

    createEllipse(minorRadius: number, majorRadius: number, center: Base.Point3, direction: Base.Vector3, type: Inputs.OCCT.typeSpecificityEnum) {
        const ellipse = this.gcMakeEllipse(center, direction, minorRadius, majorRadius);
        if (type === Inputs.OCCT.typeSpecificityEnum.curve) {
            return ellipse;
        } else {
            const edge = this.bRepBuilderAPIMakeEdge(ellipse);
            if (type === Inputs.OCCT.typeSpecificityEnum.edge) {
                return edge;
            } else {
                const ellipseWire = this.bRepBuilderAPIMakeWire(edge);
                if (type === Inputs.OCCT.typeSpecificityEnum.wire) {
                    edge.delete();
                    return ellipseWire;
                } else if (type === Inputs.OCCT.typeSpecificityEnum.face) {
                    const face = this.bRepBuilderAPIMakeFaceFromWire(ellipseWire, true);
                    return face;
                }
            }
        }
        return ellipse;
    }

    makeVertex(pt: Base.Point3): TopoDS_Vertex {
        const gpPnt = this.gpPnt(pt);
        const vert = new this.occ.BRepBuilderAPI_MakeVertex(gpPnt);
        const vrt = vert.Vertex();
        gpPnt.delete();
        vert.delete();
        return vrt;
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
        const ed = edge.Edge();
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

    bRepBuilderAPIMakeFaceFromWires(wires: TopoDS_Wire[], planar: boolean, guideFace?: TopoDS_Face, inside?: boolean): TopoDS_Face {
        let face;
        const faces = [];
        wires.forEach(currentWire => {
            if (faces.length > 0) {
                const faceBuilder = new this.occ.BRepBuilderAPI_MakeFace_22(faces[faces.length - 1], currentWire);
                faces.push(faceBuilder.Face());
                faceBuilder.delete();
            } else {
                let faceBuilder;
                if (!guideFace) {
                    faceBuilder = new this.occ.BRepBuilderAPI_MakeFace_15(currentWire, planar);
                } else {
                    const surface = this.occ.BRep_Tool.Surface_2(guideFace);
                    faceBuilder = new this.occ.BRepBuilderAPI_MakeFace_21(surface, currentWire, inside);
                }
                faces.push(faceBuilder.Face());
                faceBuilder.delete();
            }

        });
        if (faces.length > 0) {
            face = faces.pop();
            faces.forEach(f => f.delete());
        }
        return face;
    }

    bRepBuilderAPIMakeFaceFromWire(wire: TopoDS_Wire, planar: boolean): TopoDS_Face {
        const faceMaker = new this.occ.BRepBuilderAPI_MakeFace_15(wire, planar);
        const face = faceMaker.Face();
        faceMaker.delete();
        return face;
    }

    bRepBuilderAPIMakeFacesFromWiresOnFace(face: TopoDS_Face, wires: TopoDS_Wire[], inside: boolean): TopoDS_Face[] {
        const surface = this.occ.BRep_Tool.Surface_2(face);
        const res = wires.map(wire => this.bRepBuilderAPIMakeFaceFromWireOnSurface(surface, wire, inside));
        surface.delete();
        return res;
    }

    bRepBuilderAPIMakeFaceFromWireOnFace(face: TopoDS_Face, wire: TopoDS_Wire, inside: boolean): TopoDS_Face {
        const surface = this.occ.BRep_Tool.Surface_2(face);
        const res = this.bRepBuilderAPIMakeFaceFromWireOnSurface(surface, wire, inside);
        surface.delete();
        return res;
    }

    bRepBuilderAPIMakeFaceFromWireOnSurface(surface: Handle_Geom_Surface, wire: TopoDS_Wire, inside: boolean): TopoDS_Face {
        const faceMaker = new this.occ.BRepBuilderAPI_MakeFace_21(surface, wire, inside);
        const f = faceMaker.Face();
        faceMaker.delete();
        return f;
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
        const ax = new this.occ.gp_Ax22d_2(pt, dir1, dir2);
        dir1.delete();
        dir2.delete();
        pt.delete();
        return ax;
    }

    gpPln(point: Base.Point3, direction: Base.Vector3): gp_Pln_3 {
        const gpPnt = this.gpPnt(point);
        const gpDir = this.gpDir(direction);
        const pln = new this.occ.gp_Pln_3(gpPnt, gpDir);
        gpPnt.delete();
        gpDir.delete();
        return pln;
    }

    bRepPrimAPIMakeCylinder(center: Base.Point3, direction: Base.Vector3, radius: number, height: number, angle: number): TopoDS_Shape {
        const ax = this.gpAx2(center, direction);
        const cylinderMaker = new this.occ.BRepPrimAPI_MakeCylinder_4(ax, radius, height, angle);
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

    private castToHandleGeomCurve(curve: Geom_Curve): Handle_Geom_Curve {
        return new this.occ.Handle_Geom_Curve_2(curve);
    }

}
