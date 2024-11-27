import {
    GeomAbs_Shape, Geom_Curve, OpenCascadeInstance, TopoDS_Compound, TopoDS_Edge, TopoDS_Face, TopoDS_Shape,
    TopoDS_Shell, TopoDS_Solid, TopoDS_Vertex, TopoDS_Wire
} from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../../api/inputs/inputs";

export class ConverterService {

    constructor(
        private readonly occ: OpenCascadeInstance,
    ) { }

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

    combineEdgesAndWiresIntoAWire(inputs: Inputs.OCCT.ShapesDto<TopoDS_Edge | TopoDS_Wire>): TopoDS_Wire {
        if (inputs.shapes === undefined) {
            throw (Error(("Shapes are not defined")));
        }
        const makeWire = new this.occ.BRepBuilderAPI_MakeWire_1();
        inputs.shapes.forEach((shape: TopoDS_Shape) => {
            if (shape.ShapeType() === this.occ.TopAbs_ShapeEnum.TopAbs_EDGE) {
                makeWire.Add_1(shape);
            } else if (shape.ShapeType() === this.occ.TopAbs_ShapeEnum.TopAbs_WIRE) {
                makeWire.Add_2(shape);
            }
        });
        if (makeWire.IsDone()) {
            this.occ.BRepLib.BuildCurves3d_1(makeWire.Wire(), 1.0e-7, this.occ.GeomAbs_Shape.GeomAbs_C1 as GeomAbs_Shape, 14, 0);
            const wire = makeWire.Wire();
            makeWire.delete();
            return wire;
        } else {
            let errorMessage;
            const error = makeWire.Error();
            makeWire.delete();
            if (error === this.occ.BRepBuilderAPI_WireError.BRepBuilderAPI_DisconnectedWire) {
                errorMessage = "Wire is disconnected and can not be constructed";
            } else if (error === this.occ.BRepBuilderAPI_WireError.BRepBuilderAPI_EmptyWire) {
                errorMessage = "Wire is empty and can not be constructed";
            } else if (error === this.occ.BRepBuilderAPI_WireError.BRepBuilderAPI_NonManifoldWire) {
                errorMessage = "Wire is non manifold and can not be constructed";
            } else if (error === this.occ.BRepBuilderAPI_WireError.BRepBuilderAPI_WireDone) {
                errorMessage = "Wire is done";
            }
            throw new Error(errorMessage);
        }
    }

    vertexToPoint(inputs: Inputs.OCCT.ShapeDto<TopoDS_Vertex>): Inputs.Base.Point3 {
        const pt = this.occ.BRep_Tool.Pnt(inputs.shape);
        const res = [pt.X(), pt.Y(), pt.Z()] as Inputs.Base.Point3;
        pt.delete();
        return res;
    }

    getGeomCurveFromEdge(edge: TopoDS_Edge, uMin: number, uMax: number): Geom_Curve {
        const loc = edge.Location_1();
        const crvHandle = this.occ.BRep_Tool.Curve_1(edge, loc, uMin, uMax);
        const curve = crvHandle.get();
        return curve;
    }

    makeCompound(inputs: Inputs.OCCT.CompoundShapesDto<TopoDS_Shape>): TopoDS_Compound {
        const resCompound = new this.occ.TopoDS_Compound();
        const builder = new this.occ.BRep_Builder();
        builder.MakeCompound(resCompound);
        inputs.shapes.forEach(shape => {
            const cp = new this.occ.BRepBuilderAPI_Copy_2(shape, true, false);
            const s = cp.Shape();
            builder.Add(resCompound, s);
            cp.delete();
            s.delete();
        });
        builder.delete();
        return resCompound;
    }

    makeCompoundIfNeeded(shapes: TopoDS_Shape[], returnCompound: boolean) {
        if (returnCompound) {
            const compound = this.makeCompound({ shapes });
            shapes.forEach(w => w.delete());
            return compound;
        } else {
            return shapes;
        }
    }
}
