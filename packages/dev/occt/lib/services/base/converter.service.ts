import {
    BitbybitOcctModule, TopoDS_Compound, TopoDS_Edge, TopoDS_Face, TopoDS_Shape,
    TopoDS_Shell, TopoDS_Solid, TopoDS_Vertex, TopoDS_Wire
} from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../../api/inputs/inputs";

export class ConverterService {

    constructor(
        private readonly occ: BitbybitOcctModule,
    ) { }

    getActualTypeOfShape(shape: TopoDS_Shape): TopoDS_Edge | TopoDS_Wire | TopoDS_Vertex | TopoDS_Solid | TopoDS_Shell | TopoDS_Face | TopoDS_Compound {
        let result = shape;
        if (shape.ShapeType() === this.occ.TopAbs_ShapeEnum.EDGE) {
            result = this.occ.CastToEdge(shape);
        } else if (shape.ShapeType() === this.occ.TopAbs_ShapeEnum.WIRE) {
            result = this.occ.CastToWire(shape);
        } else if (shape.ShapeType() === this.occ.TopAbs_ShapeEnum.VERTEX) {
            result = this.occ.CastToVertex(shape);
        } else if (shape.ShapeType() === this.occ.TopAbs_ShapeEnum.SOLID) {
            result = this.occ.CastToSolid(shape);
        } else if (shape.ShapeType() === this.occ.TopAbs_ShapeEnum.SHELL) {
            result = this.occ.CastToShell(shape);
        } else if (shape.ShapeType() === this.occ.TopAbs_ShapeEnum.FACE) {
            result = this.occ.CastToFace(shape);
        } else if (shape.ShapeType() === this.occ.TopAbs_ShapeEnum.COMPSOLID) {
            result = this.occ.CastToCompSolid(shape);
        } else if (shape.ShapeType() === this.occ.TopAbs_ShapeEnum.COMPOUND) {
            result = this.occ.CastToCompound(shape);
        } else {
            result = shape;
        }
        return result;
    }

    combineEdgesAndWiresIntoAWire(inputs: Inputs.OCCT.ShapesDto<TopoDS_Edge | TopoDS_Wire>): TopoDS_Wire {
        if (inputs.shapes === undefined) {
            throw (Error(("Shapes are not defined")));
        }
        const makeWire = new this.occ.BRepBuilderAPI_MakeWire();
        inputs.shapes.forEach((shape: TopoDS_Shape) => {
            if (shape.ShapeType() === this.occ.TopAbs_ShapeEnum.EDGE) {
                makeWire.AddEdge(shape as TopoDS_Edge);
            } else if (shape.ShapeType() === this.occ.TopAbs_ShapeEnum.WIRE) {
                makeWire.AddWire(shape as TopoDS_Wire);
            }
        });
        if (makeWire.IsDone()) {
            const wire = makeWire.Wire();
            this.occ.BRepLib_BuildCurves3d_Full(wire, 1.0e-7, this.occ.GeomAbs_Shape.C1, 14, 0);
            makeWire.delete();
            return wire;
        } else {
            makeWire.delete();
            throw new Error("Wire could not be constructed");
        }
    }

    vertexToPoint(inputs: Inputs.OCCT.ShapeDto<TopoDS_Vertex>): Inputs.Base.Point3 {
        const pt = this.occ.BRep_Tool_Pnt(inputs.shape);
        const res = [pt.X(), pt.Y(), pt.Z()] as Inputs.Base.Point3;
        pt.delete();
        return res;
    }

    makeCompound(inputs: Inputs.OCCT.CompoundShapesDto<TopoDS_Shape>): TopoDS_Compound {
        const builder = new this.occ.BRep_Builder();
        const resCompound = this.occ.BRep_Builder_MakeCompound(builder);
        inputs.shapes.forEach(shape => {
            const s = this.occ.BRepBuilderAPI_Copy_Shape(shape, true);
            builder.Add(resCompound, s);
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
