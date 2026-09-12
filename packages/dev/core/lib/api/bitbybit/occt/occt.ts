
import { ContextBase } from "../../context";
import { OCCTWIO } from "./io";
import { OCCTWorkerManager, OCCT } from "@bitbybit-dev/occt-worker";

/**
 * The OpenCascade (OCCT) API as reached from a script: every method of the `occt` kernel,
 * asynchronous, with the shapes living in the kernel and passed around as references, plus `io`
 * loaders that read STEP and IGES files handed in as a File or as text. The service classes are
 * documented on the kernel's own `OCCTService`.
 */
export class OCCTW extends OCCT {
    override readonly io: OCCTWIO;

    constructor(
        readonly context: ContextBase,
        override readonly occWorkerManager: OCCTWorkerManager,
    ) {
        super(occWorkerManager);
        this.io = new OCCTWIO(occWorkerManager, context);
    }

}
