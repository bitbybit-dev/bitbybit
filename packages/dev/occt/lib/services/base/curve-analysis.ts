import { InputError } from "@bitbybit-dev/base";
import type { BitbybitOcctModule, TopoDS_Edge, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import type { OccHelper } from "../../occ-helper";

/** Radians in one degree: the public API takes and gives degrees, the kernel radians. */
export const RADIANS_PER_DEGREE = Math.PI / 180;

/** A solution of a tangency problem as the kernel gives it: its edge and where it meets each argument. */
export interface TangentSolution {
    edge: TopoDS_Edge;
    contacts: { isOnArgument: boolean }[];
}

/** A list of shapes, refused unless it holds exactly `count`. */
export function checkedShapeCount<T>(shapes: T[], count: number, property: string, what: string): T[] {
    if (shapes.length !== count) {
        throw new InputError(`\`${property}\` holds ${shapes.length} shapes; it takes ${count} ${what}.`, property);
    }
    return shapes;
}

/** A shape that is an edge or a wire, refused as an input error naming what it is otherwise. */
export function checkedCurve(occ: BitbybitOcctModule, shape: TopoDS_Shape, property: string): TopoDS_Shape {
    const type = shape.ShapeType();
    if (type !== occ.TopAbs_ShapeEnum.EDGE && type !== occ.TopAbs_ShapeEnum.WIRE) {
        throw new InputError(`\`${property}\` is not an edge or a wire.`, property);
    }
    return shape;
}

/**
 * The index `shapes.edge.getEdgesAlongWire` gives each edge the kernel's curve functions report.
 * Both count the edges of a wire in the order it is walked; the kernel leaves degenerated edges out
 * and counts an edge the walk passes twice, such as a seam, each time, while the getter keeps
 * degenerated edges and lists each edge once, where the walk first passes it. An edge alone is
 * edge 0 in both.
 */
export function edgeNumbering(occ: BitbybitOcctModule, curve: TopoDS_Shape): (walked: number) => number {
    if (curve.ShapeType() !== occ.TopAbs_ShapeEnum.WIRE) {
        return walked => walked;
    }
    const wire = occ.CastToWire(curve);
    const explorer = new occ.BRepTools_WireExplorer(wire);
    const distinct: TopoDS_Edge[] = [];
    const numbers: number[] = [];
    try {
        for (; explorer.More(); explorer.Next()) {
            const edge = explorer.Current();
            const seen = distinct.findIndex(earlier => earlier.IsSame(edge));
            const index = seen === -1 ? distinct.push(edge) - 1 : seen;
            if (!occ.BRep_Tool_Degenerated(edge)) {
                numbers.push(index);
            }
            if (seen !== -1) {
                edge.delete();
            }
        }
    } finally {
        explorer.delete();
        wire.delete();
        distinct.forEach(edge => edge.delete());
    }
    return walked => numbers[walked] ?? walked;
}

/**
 * The edges of the tangent lines or circles the kernel found. With `onArgumentsOnly`, a solution is
 * kept only when every contact lies on its argument; the edges of the others are deleted.
 */
export function tangentEdges(solutions: readonly TangentSolution[], onArgumentsOnly: boolean): TopoDS_Edge[] {
    const kept: TopoDS_Edge[] = [];
    solutions.forEach(solution => {
        if (onArgumentsOnly && !solution.contacts.every(contact => contact.isOnArgument)) {
            solution.edge.delete();
        } else {
            kept.push(solution.edge);
        }
    });
    return kept;
}

/**
 * A copy of the shape turned a quarter turn about the x axis, from the ground plane onto the kernel's
 * flat plane: a point (x, 0, z) of a drawing lands at (x, z, 0), the inverse of the turn
 * `shapes.face.unroll` gives its flat faces.
 */
export function fromGroundToKernelPlane(och: OccHelper, shape: TopoDS_Shape): TopoDS_Shape {
    return och.transformsService.rotate({ shape, angle: -90, axis: [1, 0, 0] });
}
