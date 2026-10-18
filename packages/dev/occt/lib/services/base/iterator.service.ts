import type { BitbybitOcctModule, ClassHandle, TopoDS_Edge, TopoDS_Face, TopoDS_Shape, TopoDS_Shell, TopoDS_Solid, TopoDS_Vertex, TopoDS_Wire } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { release } from "./release";

function handedOver<T extends ClassHandle>(shapes: T[], callback: (index: number, shape: T) => void): void {
    let next = 0;
    try {
        for (; next < shapes.length; next++) {
            callback(next, shapes[next]!);
        }
    } finally {
        shapes.slice(next + 1).forEach(release);
    }
}

/**
 * Walks over the sub-shapes of a shape. Each walk is one kernel call that hands back every sub-shape
 * of the type, in the order an explorer reaches them, already cast to its type; the callback owns
 * each shape it is given, and a walk whose callback throws releases the shapes it had not handed
 * over yet. Edges are passed once each, however many faces share them; every other type is passed
 * at every occurrence.
 */
export class IteratorService {

    constructor(
        public readonly occ: BitbybitOcctModule,
    ) { }

    forEachWire(shape: TopoDS_Shape, callback: (index: number, wire: TopoDS_Wire) => void): void {
        handedOver(this.occ.WiresOf(shape, false), callback);
    }

    forEachEdge(shape: TopoDS_Shape, callback: (index: number, edge: TopoDS_Edge) => void): void {
        handedOver(this.occ.EdgesOf(shape, true), callback);
    }

    forEachFace(shape: TopoDS_Shape, callback: (index: number, face: TopoDS_Face) => void): void {
        handedOver(this.occ.FacesOf(shape, false), callback);
    }

    forEachShell(shape: TopoDS_Shape, callback: (index: number, shell: TopoDS_Shell) => void): void {
        handedOver(this.occ.ShellsOf(shape, false), callback);
    }

    forEachVertex(shape: TopoDS_Shape, callback: (index: number, vertex: TopoDS_Vertex) => void): void {
        handedOver(this.occ.VerticesOf(shape, false), callback);
    }

    forEachSolid(shape: TopoDS_Shape, callback: (index: number, solid: TopoDS_Solid) => void): void {
        handedOver(this.occ.SolidsOf(shape, false), callback);
    }

    forEachCompound(shape: TopoDS_Shape, callback: (index: number, shape: TopoDS_Shape) => void): void {
        handedOver(this.occ.CompoundsOf(shape, false), callback);
    }

    forEachCompSolid(shape: TopoDS_Shape, callback: (index: number, shape: TopoDS_Shape) => void): void {
        handedOver(this.occ.CompSolidsOf(shape, false), callback);
    }

    forEachShapeInCompound(shape: TopoDS_Shape, callback: (index: number, shape: TopoDS_Shape) => void): void {
        handedOver(this.occ.ChildrenOf(shape), callback);
    }

}
