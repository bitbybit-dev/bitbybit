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
            const current = anExplorer.Current();
            callback(wireIndex++, this.occ.CastToWire(current));
            current.delete();
        }
        anExplorer.delete();
    }


    forEachEdge(shape: TopoDS_Shape, callback: (index: number, edge: TopoDS_Edge) => void) {
        const edgeHashes: Record<number, number> = {};
        const seen = new Map<number, TopoDS_Edge[]>();
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
            const current = anExplorer.Current();
            const edge = this.occ.CastToEdge(current);
            current.delete();
            const edgeHash = this.occ.TopoDS_Shape_HashCode(edge, 100000000);
            if (this.isFirstVisit(seen, edgeHash, edge)) {
                if (!Object.prototype.hasOwnProperty.call(edgeHashes, edgeHash)) {
                    edgeHashes[edgeHash] = edgeIndex;
                }
                callback(edgeIndex++, edge);
            } else {
                edge.delete();
            }
        }
        anExplorer.delete();
        return edgeHashes;
    }

    forEachEdgeAlongWire(shape: TopoDS_Wire, callback: (index: number, edge: TopoDS_Edge) => void) {
        const edgeHashes: Record<number, number> = {};
        const seen = new Map<number, TopoDS_Edge[]>();
        let edgeIndex = 0;
        const anExplorer = new this.occ.BRepTools_WireExplorer(shape);
        for (; anExplorer.More(); anExplorer.Next()) {
            const current = anExplorer.Current();
            const edge = this.occ.CastToEdge(current);
            current.delete();
            const edgeHash = this.occ.TopoDS_Shape_HashCode(edge, 100000000);
            if (this.isFirstVisit(seen, edgeHash, edge)) {
                if (!Object.prototype.hasOwnProperty.call(edgeHashes, edgeHash)) {
                    edgeHashes[edgeHash] = edgeIndex;
                }
                callback(edgeIndex++, edge);
            } else {
                edge.delete();
            }
        }
        anExplorer.delete();
        return edgeHashes;
    }

    /**
     * Whether an edge the explorer reached is one it has not reached before. Edges are bucketed by
     * hash and told apart by IsSame, so two different edges whose hashes collide are both visited.
     */
    private isFirstVisit(seen: Map<number, TopoDS_Edge[]>, hash: number, edge: TopoDS_Edge): boolean {
        const bucket = seen.get(hash);
        if (!bucket) {
            seen.set(hash, [edge]);
            return true;
        }
        if (bucket.some(known => known.IsSame(edge))) {
            return false;
        }
        bucket.push(edge);
        return true;
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
            const current = anExplorer.Current();
            callback(faceIndex++, this.occ.CastToFace(current));
            current.delete();
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
            const current = anExplorer.Current();
            callback(shellIndex++, this.occ.CastToShell(current));
            current.delete();
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
            const current = anExplorer.Current();
            callback(vertexIndex++, this.occ.CastToVertex(current));
            current.delete();
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
            const current = anExplorer.Current();
            callback(solidIndex++, this.occ.CastToSolid(current));
            current.delete();
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

        for (; iterator.More(); iterator.Next()) {
            callback(shapeIndex++, iterator.Value());
        }
        iterator.delete();
    }

}
