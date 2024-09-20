
import { Context } from "../../../context";
import { BabylonShadowLight } from "./shadow-light";

export class BabylonLights {
    shadowLight: BabylonShadowLight;
    constructor(private readonly context: Context) {
        this.shadowLight = new BabylonShadowLight(context);
    }

}
