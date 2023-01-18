import { Color3, PBRMetallicRoughnessMaterial, WebXRFeatureName } from '@babylonjs/core';
import { GUI3DManager, NearMenu, TextBlock, TouchHolographicButton } from '@babylonjs/gui';
import { Context } from '../../../context';
import * as Inputs from '../../../inputs/inputs';

export class BabylonWebXR {

    constructor(
        private readonly context: Context,
    ) {
    }

    /**
     * Creates default XR experience with teleportation
     * <div>
     *  <img src="../assets/images/blockly-images/babylon/camera/createdefaultxrexperiencewithteleportation.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_babylon_webxr.BabylonWebXR.html#createDefaultXRExperienceWithTeleportation
     * @param inputs Creates default XR experience with teleportation
     */
    async createDefaultXRExperienceWithTeleportation(inputs: Inputs.BabylonWebXR.DefaultWebXRWithTeleportationDto): Promise<void> {
        const xr = await this.context.scene.createDefaultXRExperienceAsync();
        if (this.context.scene.metadata) {
            this.context.scene.metadata.xr = xr;
        } else {
            this.context.scene.metadata = { xr };
        }
        const meshes = [];
        inputs.groundMeshes.forEach(m => {
            if (m.getChildMeshes) {
                m?.getChildMeshes().forEach(cm => {
                    cm.isPickable = true;
                    meshes.push(cm);
                });
            }
            meshes.push(m);
            m.isPickable = true;
        });
        const featuresManager = xr.baseExperience.featuresManager;
        const torusMat = new PBRMetallicRoughnessMaterial('teleportation');
        torusMat.baseColor = new Color3(0, 0, 1);
        torusMat.metallic = 0;
        torusMat.roughness = 1;

        featuresManager.enableFeature(WebXRFeatureName.TELEPORTATION, 'stable', {
            xrInput: xr.input,
            floorMeshes: meshes,
            defaultTargetMeshOptions: {
                torusArrowMaterial: torusMat,
                disableLighting: false,
            },
        });
        const manager = new GUI3DManager(this.context.scene);
        this.context.scene.metadata.guiManager = manager;
        manager.useRealisticScaling = true;
        const near = new NearMenu('near');
        manager.addControl(near);

        // const button0 = new TouchHolographicButton('button0');
        // button0.text = 'Enter VR';
        // button0.onPointerClickObservable.add(async () => {
        //     await xr.baseExperience.enterXRAsync('immersive-vr', 'local-floor');
        // });
        // near.addButton(button0);

        const button1 = new TouchHolographicButton('button1');

        const text = new TextBlock();
        text.text = 'Exit VR';
        text.color = 'white';
        text.fontSize = '48px';
        button1.onPointerClickObservable.add(async () => {
            await xr.baseExperience.exitXRAsync();
        });
        near.addButton(button1);
        button1.content = text;
        // near.isVisible = false;

        // xr.enterExitUI.activeButtonChangedObservable.add(s => {
        //     if (s && s.sessionMode === 'inline') {
        //         near.isVisible = false;
        //     } else if (s && s.sessionMode === 'immersive-vr') {
        //         near.isVisible = true;
        //     }
        // });
    }

}
