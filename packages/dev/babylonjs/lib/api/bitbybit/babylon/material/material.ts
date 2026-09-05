
import { Context } from "../../../context";
import { Color } from "@bitbybit-dev/base";
import { BabylonMaterialPbrMetallicRoughness } from "./pbr-metallic-roughness";
import { BabylonMaterialSky } from "./sky-material";

/**
 * Materials: physically-based surfaces with base colour, metallic and roughness, emissive and
 * ambient contributions, transparency, and the texture slots that drive each of them.
 */
export class BabylonMaterial {

    pbrMetallicRoughness: BabylonMaterialPbrMetallicRoughness;
    skyMaterial: BabylonMaterialSky;
    
    constructor(context: Context, color: Color) {
        this.pbrMetallicRoughness = new BabylonMaterialPbrMetallicRoughness(context, color);
        this.skyMaterial = new BabylonMaterialSky(context);
    }

}
