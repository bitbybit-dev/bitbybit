import {
    BitbybitOcctModule, TopoDS_Edge, TopoDS_Face, TopoDS_Shape,
    TopoDS_Shell, TopoDS_Solid, TopoDS_Vertex, TopoDS_Wire
} from "../../../bitbybit-dev-occt/bitbybit-dev-occt";

/**
 * Walks over the sub-shapes of a shape. Each walk is one kernel call that hands back every sub-shape
 * of the type, in the order an explorer reaches them, already cast to its type; the callback owns
 * each shape it is given. Edges are passed once each, however many faces share them; every other
 * type is passed at every occurrence.
 */
export class IteratorService {

    constructor(
        public readonly occ: BitbybitOcctModule,
    ) { }

    forEachWire(shape: TopoDS_Shape, callback: (index: number, wire: TopoDS_Wire) => void): void {
        this.occ.WiresOf(shape, false).forEach((wire, index) => callback(index, wire));
    }

    forEachEdge(shape: TopoDS_Shape, callback: (index: number, edge: TopoDS_Edge) => void): void {
        this.occ.EdgesOf(shape, true).forEach((edge, index) => callback(index, edge));
    }

    forEachFace(shape: TopoDS_Shape, callback: (index: number, face: TopoDS_Face) => void): void {
        this.occ.FacesOf(shape, false).forEach((face, index) => callback(index, face));
    }

    forEachShell(shape: TopoDS_Shape, callback: (index: number, shell: TopoDS_Shell) => void): void {
        this.occ.ShellsOf(shape, false).forEach((shell, index) => callback(index, shell));
    }

    forEachVertex(shape: TopoDS_Shape, callback: (index: number, vertex: TopoDS_Vertex) => void): void {
        this.occ.VerticesOf(shape, false).forEach((vertex, index) => callback(index, vertex));
    }

    forEachSolid(shape: TopoDS_Shape, callback: (index: number, solid: TopoDS_Solid) => void): void {
        this.occ.SolidsOf(shape, false).forEach((solid, index) => callback(index, solid));
    }

    forEachCompound(shape: TopoDS_Shape, callback: (index: number, shape: TopoDS_Shape) => void): void {
        this.occ.CompoundsOf(shape, false).forEach((compound, index) => callback(index, compound));
    }

    forEachCompSolid(shape: TopoDS_Shape, callback: (index: number, shape: TopoDS_Shape) => void): void {
        this.occ.CompSolidsOf(shape, false).forEach((compSolid, index) => callback(index, compSolid));
    }

    forEachShapeInCompound(shape: TopoDS_Shape, callback: (index: number, shape: TopoDS_Shape) => void): void {
        this.occ.ChildrenOf(shape).forEach((child, index) => callback(index, child));
    }

}
