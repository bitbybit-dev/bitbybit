import type { BitbybitOcctModule, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { InputError } from "@bitbybit-dev/base";
import { checkedShape, checkedShapes } from "./input-checks";
import { kernelObjects } from "./release";
import { SameShapes } from "./same-shapes";

const NEW_EDGES = "since an operation that builds a shape from a wire or a face, such as an extrusion, may give it edges of its own";

const partsOf = (occ: BitbybitOcctModule, shape: TopoDS_Shape, kind: "edge" | "face"): TopoDS_Shape[] =>
    kind === "edge" ? occ.EdgesOf(shape, true) : occ.FacesOf(shape, false);

const reasonFor = (kind: "edge" | "face"): string => kind === "edge" ? `, ${NEW_EDGES}` : "";

function firstForeign(occ: BitbybitOcctModule, shape: TopoDS_Shape, parts: readonly TopoDS_Shape[], kind: "edge" | "face"): number {
    const { own, releaseAll } = kernelObjects();
    try {
        const known = new SameShapes(occ, partsOf(occ, shape, kind).map(own));
        return parts.findIndex(part => known.indexOf(part) === undefined);
    } finally {
        releaseAll();
    }
}

export function checkedOwnPart(occ: BitbybitOcctModule, shape: TopoDS_Shape, part: TopoDS_Shape, kind: "edge" | "face", property: string): void {
    checkedShape(shape);
    checkedShape(part, property);
    if (firstForeign(occ, shape, [part], kind) !== -1) {
        throw new InputError(`\`${property}\` is not ${kind === "edge" ? "an edge" : "a face"} of \`shape\`: take it from \`shape\` itself${reasonFor(kind)}.`, property);
    }
}

export function checkedOwnParts(occ: BitbybitOcctModule, shape: TopoDS_Shape, parts: readonly TopoDS_Shape[], kind: "edge" | "face", property: string): void {
    checkedShape(shape);
    checkedShapes(parts, property);
    const foreign = firstForeign(occ, shape, parts, kind);
    if (foreign !== -1) {
        const article = kind === "edge" ? "an edge" : "a face";
        throw new InputError(`\`${property}\` holds ${article} at position ${foreign} that is not ${article} of \`shape\`: take the ${kind}s from \`shape\` itself${reasonFor(kind)}.`, property);
    }
}
