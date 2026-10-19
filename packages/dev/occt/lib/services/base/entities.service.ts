import type { BitbybitOcctModule, TopoDS_Edge, TopoDS_Face, TopoDS_Shape, TopoDS_Vertex, TopoDS_Wire, gp_Ax1, gp_Ax2, gp_Ax22d, gp_Ax2d, gp_Ax3, gp_Dir2d, gp_Dir, gp_Pln, gp_Pnt2d, gp_Pnt, gp_Vec2d, gp_Vec, gp_XYZ } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../../api/inputs";
import type { Base } from "../../api/inputs";
import { released, releasedOnError } from "./release";
import { withKernelErrorsRead } from "./kernel-refusals";
import { checkedWithin } from "./input-checks";
import { InputError } from "@bitbybit-dev/base";
import { length3, subtract3 } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/vectors";

export class EntitiesService {

    constructor(
        public readonly occ: BitbybitOcctModule,
    ) { }

    createCircle(radius: number, center: Base.Point3, direction: Base.Vector3, type: Inputs.OCCT.typeSpecificityEnum): TopoDS_Edge | TopoDS_Wire | TopoDS_Face {
        const checkedRadius = checkedWithin(radius, "radius", { above: 0 });
        return this.closedCurveOfType(type, axis => this.occ.MakeCircleEdge(axis, checkedRadius), axis => this.occ.MakeCircleWire(axis, checkedRadius), center, direction);
    }

    createEllipse(minorRadius: number, majorRadius: number, center: Base.Point3, direction: Base.Vector3, type: Inputs.OCCT.typeSpecificityEnum): TopoDS_Edge | TopoDS_Wire | TopoDS_Face {
        const radiusMinor = checkedWithin(minorRadius, "radiusMinor", { above: 0 });
        const radiusMajor = checkedWithin(majorRadius, "radiusMajor", { above: 0 });
        if (radiusMinor > radiusMajor) {
            throw new InputError(`\`radiusMinor\` must not exceed \`radiusMajor\`; it is ${radiusMinor} and \`radiusMajor\` is ${radiusMajor}.`, "radiusMinor");
        }
        return this.closedCurveOfType(type, axis => this.occ.MakeEllipseEdge(axis, radiusMajor, radiusMinor), axis => this.occ.MakeEllipseWire(axis, radiusMajor, radiusMinor), center, direction);
    }

    private closedCurveOfType(type: Inputs.OCCT.typeSpecificityEnum, edgeOn: (axis: gp_Ax2) => TopoDS_Edge, wireOn: (axis: gp_Ax2) => TopoDS_Wire, center: Base.Point3, direction: Base.Vector3): TopoDS_Edge | TopoDS_Wire | TopoDS_Face {
        const axis = this.gpAx2(center, direction);
        if (type === Inputs.OCCT.typeSpecificityEnum.edge) {
            return released([axis], () => edgeOn(axis));
        }
        const wire = released([axis], () => wireOn(axis));
        if (type !== Inputs.OCCT.typeSpecificityEnum.face) {
            return wire;
        }
        return released([wire], () => this.bRepBuilderAPIMakeFaceFromWire(wire, true));
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
        const faces: TopoDS_Face[] = [];
        return releasedOnError(faces, () => {
            wires.forEach(wire => faces.push(this.bRepBuilderAPIMakeFaceFromWireOnFace(face, wire, inside)));
            return faces;
        });
    }

    bRepBuilderAPIMakeFaceFromWireOnFace(face: TopoDS_Face, wire: TopoDS_Wire, inside: boolean): TopoDS_Face {
        return withKernelErrorsRead(this.occ, () => this.occ.MakeFaceFromFaceSurfaceAndWire(face, wire, inside));
    }

    bRepPrimAPIMakeSphere(center: Base.Point3, direction: Base.Vector3, radius: number): TopoDS_Shape {
        const ax = this.gpAx2(center, direction);
        try {
            return withKernelErrorsRead(this.occ, () => {
                const sphereMaker = this.occ.MakeSphereFromAx2(ax, radius);
                if (!sphereMaker) {
                    throw new Error("Failed to create the sphere");
                }
                return released([sphereMaker], () => sphereMaker.Shape());
            });
        } finally {
            ax.delete();
        }
    }

    gpAx3_3(point: Base.Point3, normal: Base.Vector3, direction: Base.Vector3): gp_Ax3 {
        return withKernelErrorsRead(this.occ, () => {
            const norm = this.gpDir(normal);
            const dir = releasedOnError([norm], () => this.gpDir(direction));
            const pt = this.gpPnt(point);
            return released([pt, norm, dir], () => new this.occ.gp_Ax3(pt, norm, dir));
        });
    }

    gpAx3_4(point: Base.Point3, direction: Base.Vector3): gp_Ax3 {
        return withKernelErrorsRead(this.occ, () => {
            const dir = this.gpDir(direction);
            const pt = this.gpPnt(point);
            return released([pt, dir], () => new this.occ.gp_Ax3(pt, dir));
        });
    }

    gpAx2(point: Base.Point3, direction: Base.Vector3): gp_Ax2 {
        return withKernelErrorsRead(this.occ, () => {
            const dir = this.gpDir(direction);
            const pt = this.gpPnt(point);
            return released([pt, dir], () => new this.occ.gp_Ax2(pt, dir));
        });
    }

    gpAx2FromTwoVectors(point: Base.Point3, directionFirst: Base.Vector3, directionSecond: Base.Vector3): gp_Ax2 {
        return withKernelErrorsRead(this.occ, () => {
            const first = this.gpDir(directionFirst);
            const second = releasedOnError([first], () => this.gpDir(directionSecond));
            const pt = this.gpPnt(point);
            return released([pt, first, second], () => new this.occ.gp_Ax2(pt, first, second));
        });
    }

    gpAx1(point: Base.Point3, direction: Base.Vector3): gp_Ax1 {
        return withKernelErrorsRead(this.occ, () => {
            const dir = this.gpDir(direction);
            const pt = this.gpPnt(point);
            return released([pt, dir], () => new this.occ.gp_Ax1(pt, dir));
        });
    }

    gpAx2d(point: Base.Point2, direction: Base.Vector2): gp_Ax2d {
        return withKernelErrorsRead(this.occ, () => {
            const dir = this.gpDir2d(direction);
            const pt = this.gpPnt2d(point);
            return released([pt, dir], () => new this.occ.gp_Ax2d(pt, dir));
        });
    }

    gpAx22d(point: Base.Point2, direction1: Base.Vector2, direction2: Base.Vector2): gp_Ax22d {
        return withKernelErrorsRead(this.occ, () => {
            const dir1 = this.gpDir2d(direction1);
            const dir2 = releasedOnError([dir1], () => this.gpDir2d(direction2));
            const pt = this.gpPnt2d(point);
            return released([pt, dir1, dir2], () => new this.occ.gp_Ax22d(pt, dir1, dir2));
        });
    }

    gpPln(point: Base.Point3, direction: Base.Vector3): gp_Pln {
        return withKernelErrorsRead(this.occ, () => {
            const dir = this.gpDir(direction);
            const pt = this.gpPnt(point);
            return released([pt, dir], () => new this.occ.gp_Pln(pt, dir));
        });
    }

    bRepPrimAPIMakeCylinder(center: Base.Point3, direction: Base.Vector3, radius: number, height: number, angle: number): TopoDS_Shape {
        const ax = this.gpAx2(center, direction);
        try {
            return withKernelErrorsRead(this.occ, () => {
                const cylinderMaker = new this.occ.BRepPrimAPI_MakeCylinder(ax, radius, height, angle);
                return released([cylinderMaker], () => cylinderMaker.Shape());
            });
        } finally {
            ax.delete();
        }
    }

    bRepPrimAPIMakeCylinderBetweenPoints(start: Base.Point3, end: Base.Point3, radius: number): TopoDS_Shape {
        const along = subtract3(end, start);
        const ax = this.gpAx2(start, along);
        try {
            return withKernelErrorsRead(this.occ, () => {
                const cylinderMaker = new this.occ.BRepPrimAPI_MakeCylinder(ax, radius, length3(along));
                return released([cylinderMaker], () => cylinderMaker.Shape());
            });
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
            return withKernelErrorsRead(this.occ, () => this.occ.MakeBoxFromPntAndDims(pt, width, height, length));
        } finally {
            pt.delete();
        }
    }

}
