import { Context } from "../../../context";
import { BabylonWebXRBase } from "./base";
import { BabylonWebXRSimple } from "./simple";

export class BabylonWebXR {

    simple: BabylonWebXRSimple;
    base: BabylonWebXRBase;

    constructor(
        private readonly context: Context,
    ) {
        this.simple = new BabylonWebXRSimple(context);
        this.base = new BabylonWebXRBase(context);
    }

}
