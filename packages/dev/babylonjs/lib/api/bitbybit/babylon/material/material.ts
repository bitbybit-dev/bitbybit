
import { Context } from "../../../context";
import { Color } from "@bitbybit-dev/core";
import { BabylonMaterialPbrMetallicRoughness } from "./pbr-metallic-roughness";
import { BabylonMaterialSky } from "./sky-material";

export class BabylonMaterial {

    pbrMetallicRoughness: BabylonMaterialPbrMetallicRoughness;
    skyMaterial: BabylonMaterialSky;
    
    constructor(private readonly context: Context, private readonly color: Color) {
        this.pbrMetallicRoughness = new BabylonMaterialPbrMetallicRoughness(context, color);
        this.skyMaterial = new BabylonMaterialSky(context);
    }

}
