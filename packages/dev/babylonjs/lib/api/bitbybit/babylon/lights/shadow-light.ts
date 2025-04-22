
import { Context } from "../../../context";
import * as BABYLON from "@babylonjs/core";
import * as Inputs from "../../../inputs";

export class BabylonShadowLight {

    constructor(private readonly context: Context) { }

    /**
     * Sets the direction of the shadow light
     * @param inputs shadow light and direction
     * @group set
     * @shortname set target
     */
    setDirectionToTarget(inputs: Inputs.BabylonLight.ShadowLightDirectionToTargetDto): void {
        const light = inputs.shadowLight;
        light.setDirectionToTarget(new BABYLON.Vector3(inputs.target[0], inputs.target[1], inputs.target[2]));
    }

    /**
     * Sets the position of the shadow light
     * @param inputs shadow light and position
     * @group set
     * @shortname set position
     */
    setPosition(inputs: Inputs.BabylonLight.ShadowLightPositionDto): void {
        const light = inputs.shadowLight;
        light.position = new BABYLON.Vector3(inputs.position[0], inputs.position[1], inputs.position[2]);
    }

}
