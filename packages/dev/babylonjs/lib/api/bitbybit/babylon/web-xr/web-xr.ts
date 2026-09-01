import { Context } from "../../../context";
// import { BabylonWebXRBase } from "./base";
import { BabylonWebXRSimple } from "./simple";

/**
 * WebXR: entering virtual or augmented reality from the browser, with controller input,
 * teleportation and hit testing against the real world. The route to viewing a configured product
 * at full size in the room it is destined for.
 */
export class BabylonWebXR {

    simple: BabylonWebXRSimple;
    // base: BabylonWebXRBase;

    constructor(
        private readonly context: Context,
    ) {
        this.simple = new BabylonWebXRSimple(context);
        // this.base = new BabylonWebXRBase(context);
    }

}
