import type { IFCWorkerManager } from "@bitbybit-dev/ifc-worker";
import { IFCBitByBit } from "@bitbybit-dev/ifc-worker";
import type { OCCT } from "@bitbybit-dev/occt-worker";
import { IFCWElements } from "./elements";
import { IFCWGeometry } from "./geometry";

/**
 * IFC building models as reached from a script: every method of the `ifc` worker, asynchronous,
 * with models living in the worker and passed around as references, plus `geometry.toShapes`,
 * `geometry.toDocument` and `geometry.toStep`, which build a model's elements with OpenCascade, and
 * `elements.addShape`, which adds an OpenCascade shape as an element.
 * In Node, or anywhere without workers, the IFC package's `IFCService` has the same methods,
 * synchronous and with models as values; there those three are `geometry.recipe` handed to the
 * OpenCascade kernel's `recipes.build` or `recipes.buildDocument`, and `addShape` is its
 * `recipes.describe` with `ifcSurfaces` handed to `elements.add`.
 * Experimental, as the IFC library is.
 * @beta
 */
export class IFCW extends IFCBitByBit {
    override readonly geometry: IFCWGeometry;
    override readonly elements: IFCWElements;

    constructor(
        ifcWorkerManager: IFCWorkerManager,
        occt: OCCT,
    ) {
        super(ifcWorkerManager);
        this.geometry = new IFCWGeometry(ifcWorkerManager, occt);
        this.elements = new IFCWElements(ifcWorkerManager, occt);
    }
}
