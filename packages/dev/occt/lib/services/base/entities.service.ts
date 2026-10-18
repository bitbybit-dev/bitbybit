import type { BitbybitOcctModule, TopoDS_Edge, TopoDS_Face, TopoDS_Shape, TopoDS_Vertex, TopoDS_Wire, gp_Ax1, gp_Ax2, gp_Ax22d, gp_Ax2d, gp_Ax3, gp_Dir2d, gp_Dir, gp_Pln, gp_Pnt2d, gp_Pnt, gp_Vec2d, gp_Vec, gp_XYZ } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../../api/inputs";
import type { Base } from "../../api/inputs";
import { release, releasedOnError } from "./release";
import { length3, subtract3 } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/vectors";

export class EntitiesService {

    constructor(
        public readonly occ: BitbybitOcctModule,
    ) { }

    createCircle(radius: number, center: Base.Point3, direction: Base.Vector3, type: Inputs.OCCT.typeSpecificityEnum): TopoDS_Edge | TopoDS_Wire | TopoDS_Face {
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
        const wire = this.occ.MakeCircleWire(ax, radius);
        ax.delete();
        return wire;
    }

    createEllipse(minorRadius: number, majorRadius: number, center: Base.Point3, direction: Base.Vector3, type: Inputs.OCCT.typeSpecificityEnum): TopoDS_Edge | TopoDS_Wire | TopoDS_Face {
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
        return guideFace === undefined
            ? this.occ.MakeFaceFromWires(wires, planar)
            : this.occ.MakeFaceFromWiresOnFace(guideFace, wires, inside ?? true);
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
        try {
            const sphereMaker = this.occ.MakeSphereFromAx2(ax, radius);
            if (!sphereMaker) {
                throw new Error("Failed to create the sphere");
            }
            const sphere = sphereMaker.Shape();
            sphereMaker.delete();
            return sphere;
        } finally {
            ax.delete();
        }
    }

    gpAx3_3(point: Base.Point3, normal: Base.Vector3, direction: Base.Vector3): gp_Ax3 {
        const norm = this.gpDir(normal);
        const dir = releasedOnError([norm], () => this.gpDir(direction));
        const pt = this.gpPnt(point);
        try {
            return new this.occ.gp_Ax3(pt, norm, dir);
        } finally {
            [pt, norm, dir].forEach(release);
        }
    }

    gpAx3_4(point: Base.Point3, direction: Base.Vector3): gp_Ax3 {
        const dir = this.gpDir(direction);
        const pt = this.gpPnt(point);
        const ax = new this.occ.gp_Ax3(pt, dir);
        pt.delete();
        dir.delete();
        return ax;
    }

    gpAx2(point: Base.Point3, direction: Base.Vector3): gp_Ax2 {
        const dir = this.gpDir(direction);
        const pt = this.gpPnt(point);
        const ax = new this.occ.gp_Ax2(pt, dir);
        pt.delete();
        dir.delete();
        return ax;
    }

    gpAx2FromTwoVectors(point: Base.Point3, directionFirst: Base.Vector3, directionSecond: Base.Vector3): gp_Ax2 {
        const first = this.gpDir(directionFirst);
        const second = releasedOnError([first], () => this.gpDir(directionSecond));
        const pt = this.gpPnt(point);
        try {
            return new this.occ.gp_Ax2(pt, first, second);
        } finally {
            [pt, first, second].forEach(release);
        }
    }

    gpAx1(point: Base.Point3, direction: Base.Vector3): gp_Ax1 {
        const dir = this.gpDir(direction);
        const pt = this.gpPnt(point);
        const ax = new this.occ.gp_Ax1(pt, dir);
        pt.delete();
        dir.delete();
        return ax;
    }

    gpAx2d(point: Base.Point2, direction: Base.Vector2): gp_Ax2d {
        const dir = this.gpDir2d(direction);
        const pt = this.gpPnt2d(point);
        const ax = new this.occ.gp_Ax2d(pt, dir);
        pt.delete();
        dir.delete();
        return ax;
    }

    gpAx22d(point: Base.Point2, direction1: Base.Vector2, direction2: Base.Vector2): gp_Ax22d {
        const dir1 = this.gpDir2d(direction1);
        const dir2 = releasedOnError([dir1], () => this.gpDir2d(direction2));
        const pt = this.gpPnt2d(point);
        try {
            return new this.occ.gp_Ax22d(pt, dir1, dir2);
        } finally {
            [pt, dir1, dir2].forEach(release);
        }
    }

    gpPln(point: Base.Point3, direction: Base.Vector3): gp_Pln {
        const gpDir = this.gpDir(direction);
        const gpPnt = this.gpPnt(point);
        const pln = new this.occ.gp_Pln(gpPnt, gpDir);
        gpPnt.delete();
        gpDir.delete();
        return pln;
    }

    bRepPrimAPIMakeCylinder(center: Base.Point3, direction: Base.Vector3, radius: number, height: number, angle: number): TopoDS_Shape {
        const ax = this.gpAx2(center, direction);
        try {
            const cylinderMaker = new this.occ.BRepPrimAPI_MakeCylinder(ax, radius, height, angle);
            try {
                return cylinderMaker.Shape();
            } finally {
                cylinderMaker.delete();
            }
        } finally {
            ax.delete();
        }
    }

    bRepPrimAPIMakeCylinderBetweenPoints(start: Base.Point3, end: Base.Point3, radius: number): TopoDS_Shape {
        const along = subtract3(end, start);
        const ax = this.gpAx2(start, along);
        try {
            const cylinderMaker = new this.occ.BRepPrimAPI_MakeCylinder(ax, radius, length3(along));
            try {
                return cylinderMaker.Shape();
            } finally {
                cylinderMaker.delete();
            }
        } finally {
            ax.delete();
        }
    }

    bRepPrimAPIMakeBox(width: number, length: number, height: number, center: number[]): TopoDS_Shape {
        const pt = this.gpPnt([
            -width / 2 + center[0]!,
            -height / 2 + center[1]!,
            -length / 2 + center[2]!
        ]);
        try {
            return this.occ.MakeBoxFromPntAndDims(pt, width, height, length);
        } finally {
            pt.delete();
        }
    }

}
