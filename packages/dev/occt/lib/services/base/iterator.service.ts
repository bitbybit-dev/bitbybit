import {
    OpenCascadeInstance, TopAbs_ShapeEnum, TopoDS_Edge, TopoDS_Face, TopoDS_Shape,
    TopoDS_Shell, TopoDS_Solid, TopoDS_Vertex, TopoDS_Wire
} from "../../../bitbybit-dev-occt/bitbybit-dev-occt";

export class IteratorService {

    constructor(
        public readonly occ: OpenCascadeInstance,
    ) { }

    forEachWire(shape: TopoDS_Shape, callback: (index: number, wire: TopoDS_Wire) => void): void {
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


    forEachEdge(shape: TopoDS_Shape, callback: (index: number, edge: TopoDS_Edge) => void) {
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
            if (!Object.prototype.hasOwnProperty.call(edgeHashes, edgeHash)) {
                edgeHashes[edgeHash] = edgeIndex;
                edgeIndex++;
                callback(edgeIndex, edge);
            }
        }
        anExplorer.delete();
        return edgeHashes;
    }

    forEachEdgeAlongWire(shape: TopoDS_Wire, callback: (index: number, edge: TopoDS_Edge) => void) {
        const edgeHashes = {};
        let edgeIndex = 0;
        const anExplorer = new this.occ.BRepTools_WireExplorer_1();
        for (anExplorer.Init_1(shape);
            anExplorer.More();
            anExplorer.Next()
        ) {
            const edge = this.occ.TopoDS.Edge_1(anExplorer.Current());
            const edgeHash = edge.HashCode(100000000);
            if (!Object.prototype.hasOwnProperty.call(edgeHashes, edgeHash)) {
                edgeHashes[edgeHash] = edgeIndex;
                edgeIndex++;
                callback(edgeIndex, edge);
            }
        }
        anExplorer.delete();
        return edgeHashes;
    }

    forEachFace(shape: TopoDS_Shape, callback: (index: number, face: TopoDS_Face) => void): void {
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

    forEachShell(shape: TopoDS_Shape, callback: (index: number, shell: TopoDS_Shell) => void): void {
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

    forEachVertex(shape: TopoDS_Shape, callback: (index: number, vertex: TopoDS_Vertex) => void): void {
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

    forEachSolid(shape: TopoDS_Shape, callback: (index: number, solid: TopoDS_Solid) => void): void {
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

    forEachCompound(shape: TopoDS_Shape, callback: (index: number, shape: TopoDS_Shape) => void): void {
        let solidIndex = 0;
        const anExplorer = new this.occ.TopExp_Explorer_2(shape,
            (this.occ.TopAbs_ShapeEnum.TopAbs_COMPOUND as TopAbs_ShapeEnum),
            (this.occ.TopAbs_ShapeEnum.TopAbs_SHAPE as TopAbs_ShapeEnum));
        for (anExplorer.Init(shape,
            (this.occ.TopAbs_ShapeEnum.TopAbs_COMPOUND as TopAbs_ShapeEnum),
            (this.occ.TopAbs_ShapeEnum.TopAbs_SHAPE as TopAbs_ShapeEnum)); anExplorer.More(); anExplorer.Next()) {
            callback(solidIndex++, anExplorer.Current());
        }
        anExplorer.delete();
    }

    forEachCompSolid(shape: TopoDS_Shape, callback: (index: number, shape: TopoDS_Shape) => void): void {
        let solidIndex = 0;
        const anExplorer = new this.occ.TopExp_Explorer_2(shape,
            (this.occ.TopAbs_ShapeEnum.TopAbs_COMPSOLID as TopAbs_ShapeEnum),
            (this.occ.TopAbs_ShapeEnum.TopAbs_SHAPE as TopAbs_ShapeEnum));
        for (anExplorer.Init(shape,
            (this.occ.TopAbs_ShapeEnum.TopAbs_COMPSOLID as TopAbs_ShapeEnum),
            (this.occ.TopAbs_ShapeEnum.TopAbs_SHAPE as TopAbs_ShapeEnum)); anExplorer.More(); anExplorer.Next()) {
            callback(solidIndex++, anExplorer.Current());
        }
        anExplorer.delete();
    }
    
    forEachShapeInCompound(shape: TopoDS_Shape, callback: (index: number, shape: TopoDS_Shape) => void): void {
        let solidIndex = 0;
        const iterator = new this.occ.TopoDS_Iterator_1();
    
        for (iterator.Initialize(shape, true, true); iterator.More(); iterator.Next()) {
            callback(solidIndex++, iterator.Value());
        }
        iterator.delete();
    }

}
