import {
    BitbybitOcctModule, TopoDS_Edge, TopoDS_Face,
    TopoDS_Shape, TopoDS_Solid, TopoDS_Vertex, TopoDS_Wire, TopoDS_Compound
} from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../../api/inputs";
import { EnumService } from "./enum.service";
import { IteratorService } from "./iterator.service";

interface TopoDS_ShapeHash extends TopoDS_Shape {
    hash?: number;
}

export class ShapeGettersService {

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly enumService: EnumService,
        private readonly iteratorService: IteratorService,
    ) { }

    getNumSolidsInCompound(shape: TopoDS_Shape): number {
        if (!shape ||
            this.enumService.getShapeTypeEnum(shape) !== Inputs.OCCT.shapeTypeEnum.compound ||
            shape.IsNull()
        ) {
            throw new Error("Shape is not a compound or is null.");
        }
        let solidsFound = 0;
        this.iteratorService.forEachSolid(shape, () => { solidsFound++; });
        return solidsFound;
    }

    getSolidFromCompound(shape: TopoDS_ShapeHash, index: number) {
        if (!shape ||
            shape.ShapeType() > this.occ.TopAbs_ShapeEnum.COMPSOLID ||
            shape.IsNull()
        ) {
            console.error("Not a compound shape!");
            return shape;
        }
        if (!index) {
            index = 0;
        }

        let innerSolid = shape;
        let solidsFound = 0;
        this.iteratorService.forEachSolid(shape, (i, s) => {
            if (i === index) { innerSolid = this.occ.CastToSolid(s); } solidsFound++;
        });
        if (solidsFound === 0) { console.error("NO SOLIDS FOUND IN SHAPE!"); }
        innerSolid.hash = shape.hash + 1;
        return innerSolid;
    }

    getEdges(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): TopoDS_Edge[] {
        if (inputs.shape && this.enumService.getShapeTypeEnum(inputs.shape) === Inputs.OCCT.shapeTypeEnum.edge) {
            return [inputs.shape];
        }
        if (!inputs.shape || inputs.shape.IsNull()) {
            throw (new Error("Shape is not provided or is of incorrect type"));
        }
        const edges: TopoDS_Edge[] = [];
        this.iteratorService.forEachEdge(inputs.shape, (i, edge) => {
            edges.push(edge);
        });
        return edges;
    }

    getEdge(inputs: Inputs.OCCT.EdgeIndexDto<TopoDS_Shape>): TopoDS_Edge {
        if (!inputs.shape || (inputs.shape.ShapeType && inputs.shape.ShapeType() > this.occ.TopAbs_ShapeEnum.WIRE) || inputs.shape.IsNull()) {
            throw (new Error("Edge can not be found for shape that is not provided or is of incorrect type"));
        }
        if (!inputs.index) { inputs.index = 0; }
        let innerEdge = {};
        let foundEdge = false;
        this.iteratorService.forEachEdge(inputs.shape, (i: number, s: TopoDS_Edge) => {
            if (i === inputs.index) {
                innerEdge = s;
                foundEdge = true;
            }
        });

        if (!foundEdge) {
            throw (new Error(`Edge can not be found for shape on index ${inputs.index}`));
        } else {
            return innerEdge as TopoDS_Edge;
        }
    }

    getWires(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): TopoDS_Wire[] {
        const wires: TopoDS_Wire[] = [];
        this.iteratorService.forEachWire(inputs.shape, (wireIndex: number, myWire: TopoDS_Wire) => {
            wires.push(myWire);
        });
        return wires;
    }

    getWire(inputs: Inputs.OCCT.ShapeIndexDto<TopoDS_Shape>): TopoDS_Wire {
        if (!inputs.shape || inputs.shape.IsNull()) {
            throw (new Error("Shape is not provided or is null"));
        }
        const shapeType = this.enumService.getShapeTypeEnum(inputs.shape);
        if ((shapeType === Inputs.OCCT.shapeTypeEnum.wire ||
            shapeType === Inputs.OCCT.shapeTypeEnum.edge ||
            shapeType === Inputs.OCCT.shapeTypeEnum.vertex)) {
            throw (new Error("Shape is of incorrect type"));
        }
        if (!inputs.index) { inputs.index = 0; }
        let innerWire: TopoDS_Wire | undefined;
        this.iteratorService.forEachWire(inputs.shape, (i, s) => {
            if (i === inputs.index) { innerWire = this.occ.CastToWire(s); }
        });
        if (!innerWire) {
            throw (Error("Wire not found"));
        }
        return innerWire;
    }

    getFaces(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): TopoDS_Face[] {
        const faces: TopoDS_Face[] = [];
        this.iteratorService.forEachFace(inputs.shape, (faceIndex, myFace) => {
            faces.push(myFace);
        });
        return faces;
    }

    getSolids(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): TopoDS_Solid[] {
        const solids: TopoDS_Face[] = [];
        this.iteratorService.forEachSolid(inputs.shape, (faceIndex, myFace) => {
            solids.push(myFace);
        });
        return solids;
    }

    getFace(inputs: Inputs.OCCT.ShapeIndexDto<TopoDS_Shape>): TopoDS_Face {
        if (!inputs.shape || inputs.shape.IsNull()) {
            throw new Error("Shape is not provided or is null");
        }
        const shapeType = this.enumService.getShapeTypeEnum(inputs.shape);
        if (shapeType === Inputs.OCCT.shapeTypeEnum.wire ||
            shapeType === Inputs.OCCT.shapeTypeEnum.edge ||
            shapeType === Inputs.OCCT.shapeTypeEnum.vertex) {
            throw (new Error("Shape is of incorrect type"));
        }
        if (!inputs.index) { inputs.index = 0; }
        let innerFace = {}; let facesFound = 0;
        this.iteratorService.forEachFace(inputs.shape, (i, s) => {
            if (i === inputs.index) { innerFace = this.occ.CastToFace(s); } facesFound++;
        });
        if (facesFound < inputs.index || inputs.index < 0) {
            throw (new Error("Face index is out of range"));
        }
        else {
            return innerFace as TopoDS_Face;
        }
    }

    getVertices(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): TopoDS_Vertex[] {
        if (inputs.shape && this.enumService.getShapeTypeEnum(inputs.shape) === Inputs.OCCT.shapeTypeEnum.vertex) {
            return [inputs.shape];
        }
        if (!inputs.shape || inputs.shape.IsNull()) {
            throw (new Error("Shape is not provided or is of incorrect type"));
        }
        const vertices: TopoDS_Vertex[] = [];
        this.iteratorService.forEachVertex(inputs.shape, (i, vertex) => {
            vertices.push(vertex);
        });
        return vertices;
    }

    getShapesOfCompound(inputs: Inputs.OCCT.ShapeDto<TopoDS_Compound>): TopoDS_Shape[] {
        const shapes: TopoDS_Shape[] = [];
        this.iteratorService.forEachShapeInCompound(inputs.shape, (_, shape) => { shapes.push(shape); });
        return shapes;
    }

}
