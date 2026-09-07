import { Context } from "../../../context";
import { BabylonWebXRSimple } from "./simple";

/**
 * WebXR: entering virtual or augmented reality from the browser, with controller input,
 * teleportation and hit testing against the real world. The route to viewing a configured product
 * at full size in the room it is destined for.
 */
export class BabylonWebXR {

    simple: BabylonWebXRSimple;

    constructor(
        context: Context,
    ) {
        this.simple = new BabylonWebXRSimple(context);
    }

}
