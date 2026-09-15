
import { Context } from "../../../context";
import * as BABYLON from "@babylonjs/core";
import * as Inputs from "../../../inputs";

/**
 * Adjusting lights that cast shadows, the point, directional and spot lights, after they were
 * created: aim them at a target or move them, and the shadows follow.
 */
export class BabylonShadowLight {

    constructor(_context: Context) { }

    /**
     * Aims a shadow-casting light at a point in the scene, turning its direction to point from its
     * position toward `target`.
     * @param inputs - The light and the point to aim at
     * @group set
     * @shortname set target
     * @example
     * ```typescript
     * bitbybit.babylon.lights.shadowLight.setDirectionToTarget({ shadowLight: sun, target: [0, 0, 0] });
     * ```
     */
    setDirectionToTarget(inputs: Inputs.BabylonLight.ShadowLightDirectionToTargetDto): void {
        const light = inputs.shadowLight;
        light.setDirectionToTarget(new BABYLON.Vector3(inputs.target[0], inputs.target[1], inputs.target[2]));
    }

    /**
     * Moves a shadow-casting light to a point in the scene; for a directional light the position
     * sets where its shadows are computed from.
     * @param inputs - The light and the position
     * @group set
     * @shortname set position
     * @example
     * ```typescript
     * bitbybit.babylon.lights.shadowLight.setPosition({ shadowLight: sun, position: [50, 100, 50] });
     * ```
     */
    setPosition(inputs: Inputs.BabylonLight.ShadowLightPositionDto): void {
        const light = inputs.shadowLight;
        light.position = new BABYLON.Vector3(inputs.position[0], inputs.position[1], inputs.position[2]);
    }

}
