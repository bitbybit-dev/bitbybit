
import { Context } from "../../../context";
import { BabylonShadowLight } from "./shadow-light";

/**
 * Scene lighting: point, directional, spot and hemispheric lights, their intensity, colour and
 * range, and the shadow settings that go with them. Lighting is what makes a technically correct
 * model look like a product, so it is usually worth more attention than its size suggests.
 */
export class BabylonLights {
    shadowLight: BabylonShadowLight;
    constructor(context: Context) {
        this.shadowLight = new BabylonShadowLight(context);
    }

}
