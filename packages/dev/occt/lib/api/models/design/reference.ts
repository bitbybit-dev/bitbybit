import type { DesignEdgeReference, DesignFaceReference } from "./document";

/**
 * What `design.referenceFor` found for faces or edges picked on a built body: the `reference` a
 * document should store to name exactly them, hinted as `design.withHints` hints it, or why none
 * names them (`refused`). `nudged` lists the parameters the body depends on that were moved a little,
 * one at a time, to check the reference, and `lost` those after whose move it no longer found elements
 * like the picked ones: a reference that loses its elements under a small change is fragile.
 */
export interface DesignReferenceFound {
    reference?: DesignFaceReference | DesignEdgeReference;
    refused?: string;
    nudged: string[];
    lost: string[];
}
