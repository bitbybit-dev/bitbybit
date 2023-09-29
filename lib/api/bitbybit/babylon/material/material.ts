
import { Context } from "../../../context";
import { Color } from "../../color";
import { BabylonMaterialPbrMetallicRoughness } from "./pbr-metallic-roughness";

export class BabylonMaterial {

    pbrMetallicRoughness: BabylonMaterialPbrMetallicRoughness;

    constructor(private readonly context: Context, private readonly color: Color) {
        this.pbrMetallicRoughness = new BabylonMaterialPbrMetallicRoughness(context, color);
    }

}
