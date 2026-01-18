import {
    BitbybitOcctModule,
    TopoDS_Edge, TopoDS_Face, TopoDS_Shape, TopoDS_Vertex, TopoDS_Wire,
    gp_Ax1, gp_Ax2, gp_Ax22d, gp_Ax2d, gp_Ax3, gp_Dir2d, gp_Dir, gp_Pln,
    gp_Pnt2d, gp_Pnt, gp_Vec2d, gp_Vec, gp_XYZ
} from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../../api/inputs/inputs";
import { Base } from "../../api/inputs/inputs";

export class EntitiesService {

    constructor(
        public readonly occ: BitbybitOcctModule,
    ) { }

    createCircle(radius: number, center: Base.Point3, direction: Base.Vector3, type: Inputs.OCCT.typeSpecificityEnum) {
        const ax = this.gpAx2(center, direction);
        if (type === Inputs.OCCT.typeSpecificityEnum.edge) {
            const edge = this.occ.MakeCircleEdge(ax, radius);
            ax.delete();
            return edge;
        } else if (type === Inputs.OCCT.typeSpecificityEnum.wire) {
            const wire = this.occ.MakeCircleWire(ax, radius);
            ax.delete();
            return wire;
        } else if (type === Inputs.OCCT.typeSpecificityEnum.face) {
            const wire = this.occ.MakeCircleWire(ax, radius);
            ax.delete();
            const face = this.bRepBuilderAPIMakeFaceFromWire(wire, true);
            wire.delete();
            return face;
        }
        // Default: return wire for curve type as well (Geom_Curve not exposed)
        const wire = this.occ.MakeCircleWire(ax, radius);
        ax.delete();
        return wire;
    }

    createEllipse(minorRadius: number, majorRadius: number, center: Base.Point3, direction: Base.Vector3, type: Inputs.OCCT.typeSpecificityEnum) {
        const ax = this.gpAx2(center, direction);
        if (type === Inputs.OCCT.typeSpecificityEnum.edge) {
            const edge = this.occ.MakeEllipseEdge(ax, majorRadius, minorRadius);
            ax.delete();
            return edge;
        } else if (type === Inputs.OCCT.typeSpecificityEnum.wire) {
            const wire = this.occ.MakeEllipseWire(ax, majorRadius, minorRadius);
            ax.delete();
            return wire;
        } else if (type === Inputs.OCCT.typeSpecificityEnum.face) {
            const wire = this.occ.MakeEllipseWire(ax, majorRadius, minorRadius);
            ax.delete();
            const face = this.bRepBuilderAPIMakeFaceFromWire(wire, true);
            wire.delete();
            return face;
        }
        // Default: return wire for curve type as well (Geom_Curve not exposed)
        const wire = this.occ.MakeEllipseWire(ax, majorRadius, minorRadius);
        ax.delete();
        return wire;
    }

    makeVertex(pt: Base.Point3): TopoDS_Vertex {
        const gpPnt = this.gpPnt(pt);
        const vert = new this.occ.BRepBuilderAPI_MakeVertex(gpPnt);
        const vrt = vert.Vertex();
        gpPnt.delete();
        vert.delete();
        return vrt;
    }

    gpPnt2d(point: Base.Point2): gp_Pnt2d {
        return new this.occ.gp_Pnt2d(point[0], point[1]);
    }

    gpPnt(point: Base.Point3): gp_Pnt {
        return new this.occ.gp_Pnt(point[0], point[1], point[2]);
    }

    gpVec(vec: Base.Vector3): gp_Vec {
        return new this.occ.gp_Vec(vec[0], vec[1], vec[2]);
    }

    gpXYZ(point: Base.Point3): gp_XYZ {
        return new this.occ.gp_XYZ(point[0], point[1], point[2]);
    }

    gpVec2d(vec: Base.Vector2): gp_Vec2d {
        return new this.occ.gp_Vec2d(vec[0], vec[1]);
    }

    gpDir(direction: Base.Vector3): gp_Dir {
        return new this.occ.gp_Dir(direction[0], direction[1], direction[2]);
    }

    gpDir2d(direction: Base.Point2): gp_Dir2d {
        return new this.occ.gp_Dir2d(direction[0], direction[1]);
    }

    bRepBuilderAPIMakeWire(edge: TopoDS_Edge): TopoDS_Wire {
        const wire = new this.occ.BRepBuilderAPI_MakeWire(edge);
        const w = wire.Wire();
        wire.delete();
        return w;
    }

    bRepBuilderAPIMakeFaceFromWires(wires: TopoDS_Wire[], planar: boolean, guideFace?: TopoDS_Face, inside?: boolean): TopoDS_Face {
        let face: TopoDS_Face | undefined;
        const faces: TopoDS_Face[] = [];
        wires.forEach(currentWire => {
            if (faces.length > 0) {
                const faceBuilder = new this.occ.BRepBuilderAPI_MakeFace(faces[faces.length - 1], currentWire);
                faces.push(faceBuilder.Face());
                faceBuilder.delete();
            } else {
                if (!guideFace) {
                    // Use factory function to avoid constructor overload conflicts
                    const newFace = this.occ.MakeFaceFromWireOnlyPlane(currentWire, planar);
                    faces.push(newFace);
                } else {
                    // Use factory function for surface-based face creation
                    const newFace = this.occ.MakeFaceFromFaceSurfaceAndWire(guideFace, currentWire, inside ?? true);
                    faces.push(newFace);
                }
            }
        });
        if (faces.length > 0) {
            face = faces.pop();
            faces.forEach(f => f.delete());
        }
        return face as TopoDS_Face;
    }

    bRepBuilderAPIMakeFaceFromWire(wire: TopoDS_Wire, planar: boolean): TopoDS_Face {
        const face = this.occ.MakeFaceFromWireOnlyPlane(wire, planar);
        return face;
    }

    bRepBuilderAPIMakeFacesFromWiresOnFace(face: TopoDS_Face, wires: TopoDS_Wire[], inside: boolean): TopoDS_Face[] {
        return wires.map(wire => this.occ.MakeFaceFromFaceSurfaceAndWire(face, wire, inside));
    }

    bRepBuilderAPIMakeFaceFromWireOnFace(face: TopoDS_Face, wire: TopoDS_Wire, inside: boolean): TopoDS_Face {
        return this.occ.MakeFaceFromFaceSurfaceAndWire(face, wire, inside);
    }

    bRepPrimAPIMakeSphere(center: Base.Point3, direction: Base.Vector3, radius: number): TopoDS_Shape {
        const ax = this.gpAx2(center, direction);
        const sphereMaker = this.occ.MakeSphereFromAx2(ax, radius);
        const sphere = sphereMaker.Shape();
        sphereMaker.delete();
        ax.delete();
        return sphere;
    }

    gpAx3_3(point: Base.Point3, normal: Base.Vector3, direction: Base.Vector3): gp_Ax3 {
        return new this.occ.gp_Ax3(
            this.gpPnt(point),
            this.gpDir(normal),
            this.gpDir(direction)
        );
    }

    gpAx3_4(point: Base.Point3, direction: Base.Vector3): gp_Ax3 {
        return new this.occ.gp_Ax3(
            this.gpPnt(point),
            this.gpDir(direction)
        );
    }

    gpAx2(point: Base.Point3, direction: Base.Vector3): gp_Ax2 {
        return new this.occ.gp_Ax2(
            this.gpPnt(point),
            this.gpDir(direction)
        );
    }

    gpAx2FromTwoVectors(point: Base.Point3, directionFirst: Base.Vector3, directionSecond: Base.Vector3): gp_Ax2 {
        return new this.occ.gp_Ax2(
            this.gpPnt(point),
            this.gpDir(directionFirst),
            this.gpDir(directionSecond)
        );
    }

    gpAx1(point: Base.Point3, direction: Base.Vector3): gp_Ax1 {
        return new this.occ.gp_Ax1(
            this.gpPnt(point),
            this.gpDir(direction)
        );
    }

    gpAx2d(point: Base.Point2, direction: Base.Vector2): gp_Ax2d {
        const pt = this.gpPnt2d(point);
        const dir = this.gpDir2d(direction);
        return new this.occ.gp_Ax2d(pt, dir);
    }

    gpAx22d(point: Base.Point2, direction1: Base.Vector2, direction2: Base.Vector2): gp_Ax22d {
        const pt = this.gpPnt2d(point);
        const dir1 = this.gpDir2d(direction1);
        const dir2 = this.gpDir2d(direction2);
        const ax = new this.occ.gp_Ax22d(pt, dir1, dir2);
        dir1.delete();
        dir2.delete();
        pt.delete();
        return ax;
    }

    gpPln(point: Base.Point3, direction: Base.Vector3): gp_Pln {
        const gpPnt = this.gpPnt(point);
        const gpDir = this.gpDir(direction);
        const pln = new this.occ.gp_Pln(gpPnt, gpDir);
        gpPnt.delete();
        gpDir.delete();
        return pln;
    }

    bRepPrimAPIMakeCylinder(center: Base.Point3, direction: Base.Vector3, radius: number, height: number, angle: number): TopoDS_Shape {
        const ax = this.gpAx2(center, direction);
        const cylinderMaker = new this.occ.BRepPrimAPI_MakeCylinder(ax, radius, height, angle);
        const cylinder = cylinderMaker.Shape();
        cylinderMaker.delete();
        ax.delete();
        return cylinder;
    }

    bRepPrimAPIMakeCylinderBetweenPoints(start: Base.Point3, end: Base.Point3, radius: number): TopoDS_Shape {
        const center = this.gpPnt(start);
        const pt = this.gpPnt(end);
        const vec = this.occ.gp_Vec_fromPoints(center, pt);
        const distance = vec.Magnitude();
        const ax = this.gpAx2(start, [vec.X(), vec.Y(), vec.Z()]);
        const cylinderMaker = new this.occ.BRepPrimAPI_MakeCylinder(ax, radius, distance);
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
        const box = this.occ.MakeBoxFromPntAndDims(pt, width, height, length);
        pt.delete();
        return box;
    }

}
