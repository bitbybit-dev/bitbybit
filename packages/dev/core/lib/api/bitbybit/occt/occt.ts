
import { ContextBase } from "../../context";
// import { DrawHelper } from "../../draw-helper";
import { OCCTWIO } from "./io";
import { OCCTWorkerManager, OCCT } from "@bitbybit-dev/occt-worker";

/**
 * Contains various methods for OpenCascade implementation
 */
export class OCCTW extends OCCT {
    override readonly io: OCCTWIO;

    constructor(
        readonly context: ContextBase,
        override readonly occWorkerManager: OCCTWorkerManager,
        // readonly drawHelper: DrawHelper,
    ) {
        super(occWorkerManager);
        this.io = new OCCTWIO(occWorkerManager, context);
    }

}
