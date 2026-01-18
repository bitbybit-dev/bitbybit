import {
    BitbybitOcctModule, TopoDS_Edge, TopoDS_Face, TopoDS_Shape,
    TopoDS_Shell, TopoDS_Solid, TopoDS_Vertex, TopoDS_Wire
} from "../../../bitbybit-dev-occt/bitbybit-dev-occt";

export class IteratorService {

    constructor(
        public readonly occ: BitbybitOcctModule,
    ) { }

    forEachWire(shape: TopoDS_Shape, callback: (index: number, wire: TopoDS_Wire) => void): void {
        let wireIndex = 0;
        const anExplorer = new this.occ.TopExp_Explorer(
            shape,
            this.occ.TopAbs_ShapeEnum.WIRE,
            this.occ.TopAbs_ShapeEnum.SHAPE
        );
        for (anExplorer.Init(shape, this.occ.TopAbs_ShapeEnum.WIRE, this.occ.TopAbs_ShapeEnum.SHAPE);
            anExplorer.More();
            anExplorer.Next()
        ) {
            callback(wireIndex++, this.occ.CastToWire(anExplorer.Current()));
        }
        anExplorer.delete();
    }


    forEachEdge(shape: TopoDS_Shape, callback: (index: number, edge: TopoDS_Edge) => void) {
        const edgeHashes = {};
        let edgeIndex = 0;
        const anExplorer = new this.occ.TopExp_Explorer(
            shape,
            this.occ.TopAbs_ShapeEnum.EDGE,
            this.occ.TopAbs_ShapeEnum.SHAPE
        );
        for (anExplorer.Init(shape, this.occ.TopAbs_ShapeEnum.EDGE, this.occ.TopAbs_ShapeEnum.SHAPE);
            anExplorer.More();
            anExplorer.Next()
        ) {
            const edge = this.occ.CastToEdge(anExplorer.Current());
            const edgeHash = this.occ.TopoDS_Shape_HashCode(edge, 100000000);
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
        const anExplorer = new this.occ.BRepTools_WireExplorer(shape);
        for (/* initialized in constructor */; anExplorer.More(); anExplorer.Next()) {
            const edge = this.occ.CastToEdge(anExplorer.Current());
            const edgeHash = this.occ.TopoDS_Shape_HashCode(edge, 100000000);
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
        const anExplorer = new this.occ.TopExp_Explorer(
            shape,
            this.occ.TopAbs_ShapeEnum.FACE,
            this.occ.TopAbs_ShapeEnum.SHAPE
        );
        for (anExplorer.Init(shape, this.occ.TopAbs_ShapeEnum.FACE, this.occ.TopAbs_ShapeEnum.SHAPE);
            anExplorer.More();
            anExplorer.Next()
        ) {
            callback(faceIndex++, this.occ.CastToFace(anExplorer.Current()));
        }
        anExplorer.delete();
    }

    forEachShell(shape: TopoDS_Shape, callback: (index: number, shell: TopoDS_Shell) => void): void {
        let shellIndex = 0;
        const anExplorer = new this.occ.TopExp_Explorer(
            shape,
            this.occ.TopAbs_ShapeEnum.SHELL,
            this.occ.TopAbs_ShapeEnum.SHAPE
        );
        for (anExplorer.Init(shape, this.occ.TopAbs_ShapeEnum.SHELL, this.occ.TopAbs_ShapeEnum.SHAPE);
            anExplorer.More();
            anExplorer.Next()
        ) {
            callback(shellIndex++, this.occ.CastToShell(anExplorer.Current()));
        }
        anExplorer.delete();
    }

    forEachVertex(shape: TopoDS_Shape, callback: (index: number, vertex: TopoDS_Vertex) => void): void {
        let vertexIndex = 0;
        const anExplorer = new this.occ.TopExp_Explorer(
            shape,
            this.occ.TopAbs_ShapeEnum.VERTEX,
            this.occ.TopAbs_ShapeEnum.SHAPE
        );
        for (anExplorer.Init(shape, this.occ.TopAbs_ShapeEnum.VERTEX, this.occ.TopAbs_ShapeEnum.SHAPE);
            anExplorer.More();
            anExplorer.Next()
        ) {
            callback(vertexIndex++, this.occ.CastToVertex(anExplorer.Current()));
        }
        anExplorer.delete();
    }

    forEachSolid(shape: TopoDS_Shape, callback: (index: number, solid: TopoDS_Solid) => void): void {
        let solidIndex = 0;
        const anExplorer = new this.occ.TopExp_Explorer(
            shape,
            this.occ.TopAbs_ShapeEnum.SOLID,
            this.occ.TopAbs_ShapeEnum.SHAPE
        );
        for (anExplorer.Init(shape, this.occ.TopAbs_ShapeEnum.SOLID, this.occ.TopAbs_ShapeEnum.SHAPE);
            anExplorer.More();
            anExplorer.Next()
        ) {
            callback(solidIndex++, this.occ.CastToSolid(anExplorer.Current()));
        }
        anExplorer.delete();
    }

    forEachCompound(shape: TopoDS_Shape, callback: (index: number, shape: TopoDS_Shape) => void): void {
        let compoundIndex = 0;
        const anExplorer = new this.occ.TopExp_Explorer(
            shape,
            this.occ.TopAbs_ShapeEnum.COMPOUND,
            this.occ.TopAbs_ShapeEnum.SHAPE
        );
        for (anExplorer.Init(shape, this.occ.TopAbs_ShapeEnum.COMPOUND, this.occ.TopAbs_ShapeEnum.SHAPE);
            anExplorer.More();
            anExplorer.Next()
        ) {
            callback(compoundIndex++, anExplorer.Current());
        }
        anExplorer.delete();
    }

    forEachCompSolid(shape: TopoDS_Shape, callback: (index: number, shape: TopoDS_Shape) => void): void {
        let compSolidIndex = 0;
        const anExplorer = new this.occ.TopExp_Explorer(
            shape,
            this.occ.TopAbs_ShapeEnum.COMPSOLID,
            this.occ.TopAbs_ShapeEnum.SHAPE
        );
        for (anExplorer.Init(shape, this.occ.TopAbs_ShapeEnum.COMPSOLID, this.occ.TopAbs_ShapeEnum.SHAPE);
            anExplorer.More();
            anExplorer.Next()
        ) {
            callback(compSolidIndex++, anExplorer.Current());
        }
        anExplorer.delete();
    }

    forEachShapeInCompound(shape: TopoDS_Shape, callback: (index: number, shape: TopoDS_Shape) => void): void {
        let shapeIndex = 0;
        const iterator = new this.occ.TopoDS_Iterator(shape);

        for (/* initialized in constructor */; iterator.More(); iterator.Next()) {
            callback(shapeIndex++, iterator.Value());
        }
        iterator.delete();
    }

}
