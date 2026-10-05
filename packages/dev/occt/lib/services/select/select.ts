import type { BitbybitOcctModule } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OCCTSelectFaces } from "./faces";
import { OCCTSelectEdges } from "./edges";

/**
 * Choosing faces and edges of OpenCascade shapes by what they are, where they lie and how they
 * meet, rather than by an index that shifts whenever the model changes. `faces` and `edges` return
 * index lists in the getters' numbering, which fillets, chamfers and the getters take as they are,
 * and which the selectors narrow further through their `indexes` input. A choice of nothing stays
 * empty through the selectors, but `fillets.filletEdges` and `fillets.chamferEdges` read an empty
 * `indexes` as every edge, and hand out `radiusList` and `distanceList` in the getters' order.
 */
export class OCCTSelect {
    public readonly faces: OCCTSelectFaces;
    public readonly edges: OCCTSelectEdges;

    constructor(
        occ: BitbybitOcctModule,
    ) {
        this.faces = new OCCTSelectFaces(occ);
        this.edges = new OCCTSelectEdges(occ);
    }
}
