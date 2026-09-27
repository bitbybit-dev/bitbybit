import {
    BitbybitOcctModule, TopoDS_Edge, TopoDS_Face,
    TopoDS_Shape, TopoDS_Solid, TopoDS_Vertex, TopoDS_Wire, TopoDS_Compound
} from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../../api/inputs";
import { EnumService } from "./enum.service";
import * as Resolved from "../../api/resolved-inputs";

export class ShapeGettersService {

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly enumService: EnumService,
    ) { }

    getEdges(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): TopoDS_Edge[] {
        if (inputs.shape && this.enumService.getShapeTypeEnum(inputs.shape) === Inputs.OCCT.shapeTypeEnum.edge) {
            return [inputs.shape];
        }
        if (!inputs.shape || inputs.shape.IsNull()) {
            throw (new Error("Shape is not provided or is of incorrect type"));
        }
        return this.occ.EdgesOf(inputs.shape, true);
    }

    getEdge(inputs: Resolved.OCCT.EdgeIndexDto<TopoDS_Shape>): TopoDS_Edge {
        if (!inputs.shape || (inputs.shape.ShapeType && inputs.shape.ShapeType() > this.occ.TopAbs_ShapeEnum.WIRE) || inputs.shape.IsNull()) {
            throw (new Error("Edge can not be found for shape that is not provided or is of incorrect type"));
        }
        const index = inputs.index || 0;
        const edge = this.occ.EdgeAt(inputs.shape, true, index);
        if (edge.IsNull()) {
            edge.delete();
            throw (new Error(`Edge can not be found for shape on index ${index}`));
        }
        return edge;
    }

    getWires(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): TopoDS_Wire[] {
        return this.occ.WiresOf(inputs.shape, false);
    }

    getWire(inputs: Resolved.OCCT.ShapeIndexDto<TopoDS_Shape>): TopoDS_Wire {
        if (!inputs.shape || inputs.shape.IsNull()) {
            throw (new Error("Shape is not provided or is null"));
        }
        const shapeType = this.enumService.getShapeTypeEnum(inputs.shape);
        if ((shapeType === Inputs.OCCT.shapeTypeEnum.wire ||
            shapeType === Inputs.OCCT.shapeTypeEnum.edge ||
            shapeType === Inputs.OCCT.shapeTypeEnum.vertex)) {
            throw (new Error("Shape is of incorrect type"));
        }
        const wire = this.occ.WireAt(inputs.shape, false, inputs.index || 0);
        if (wire.IsNull()) {
            wire.delete();
            throw (Error("Wire not found"));
        }
        return wire;
    }

    getFaces(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): TopoDS_Face[] {
        return this.occ.FacesOf(inputs.shape, false);
    }

    getSolids(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): TopoDS_Solid[] {
        return this.occ.SolidsOf(inputs.shape, false);
    }

    getFace(inputs: Resolved.OCCT.ShapeIndexDto<TopoDS_Shape>): TopoDS_Face {
        if (!inputs.shape || inputs.shape.IsNull()) {
            throw new Error("Shape is not provided or is null");
        }
        const shapeType = this.enumService.getShapeTypeEnum(inputs.shape);
        if (shapeType === Inputs.OCCT.shapeTypeEnum.wire ||
            shapeType === Inputs.OCCT.shapeTypeEnum.edge ||
            shapeType === Inputs.OCCT.shapeTypeEnum.vertex) {
            throw (new Error("Shape is of incorrect type"));
        }
        const face = this.occ.FaceAt(inputs.shape, false, inputs.index || 0);
        if (face.IsNull()) {
            face.delete();
            throw (new Error("Face index is out of range"));
        }
        return face;
    }

    getVertices(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): TopoDS_Vertex[] {
        if (inputs.shape && this.enumService.getShapeTypeEnum(inputs.shape) === Inputs.OCCT.shapeTypeEnum.vertex) {
            return [inputs.shape];
        }
        if (!inputs.shape || inputs.shape.IsNull()) {
            throw (new Error("Shape is not provided or is of incorrect type"));
        }
        return this.occ.VerticesOf(inputs.shape, false);
    }

    getShapesOfCompound(inputs: Inputs.OCCT.ShapeDto<TopoDS_Compound>): TopoDS_Shape[] {
        return this.occ.ChildrenOf(inputs.shape);
    }

}
