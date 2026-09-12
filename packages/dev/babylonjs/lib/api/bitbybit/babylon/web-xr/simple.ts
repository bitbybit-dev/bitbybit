import { GUI3DManager, NearMenu, TextBlock, TouchHolographicButton } from "@babylonjs/gui";
import * as BABYLON from "@babylonjs/core";
import { Context } from "../../../context";
import * as Inputs from "../../../inputs";

/**
 * One-call entry points into virtual and augmented reality on a WebXR-capable browser and headset:
 * an immersive AR session, or a VR session with teleportation over the ground meshes you name. For
 * finer control, `webXr.base` creates the experience from full options.
 */
export class BabylonWebXRSimple {

    constructor(
        private readonly context: Context,
    ) {
    }

    /**
     * Starts a default WebXR experience in immersive AR mode, showing the scene over the camera
     * view of the room on a device that supports it.
     * @returns The default XR experience
     * @group scene
     * @shortname simple immersive ar experience
     * @disposableOutput true
     * @example
     * ```typescript
     * const xr = await bitbybit.babylon.webXr.simple.createImmersiveARExperience();
     * ```
     */
    async createImmersiveARExperience(): Promise<BABYLON.WebXRDefaultExperience> {
        const isARSupported = await BABYLON.WebXRSessionManager.IsSessionSupportedAsync("immersive-ar");
        if (isARSupported) {
            const xr = await this.context.scene.createDefaultXRExperienceAsync({
                uiOptions: {
                    sessionMode: "immersive-ar",
                    referenceSpaceType: "local-floor"
                },
                outputCanvasOptions: {
                    canvasOptions: {
                        framebufferScaleFactor: 2,
                        antialias: true,
                    }
                },
                optionalFeatures: true,
            });
            return xr;
        } else {
            throw new Error("AR is not supported on this device.");
        }
    }

    /**
     * Starts a default WebXR experience in VR with teleportation over the given ground meshes,
     * enough for simple walkthroughs; nothing is given back.
     * @param inputs - The meshes the user can teleport onto
     * @group scene
     * @shortname simple xr with teleportation
     * @example
     * ```typescript
     * await bitbybit.babylon.webXr.simple.createDefaultXRExperienceWithTeleportation({ groundMeshes: [ground] });
     * ```
     */
    async createDefaultXRExperienceWithTeleportation(inputs: Inputs.BabylonWebXR.DefaultWebXRWithTeleportationDto): Promise<void> {
        await this.createDefaultXRExperienceWithTeleportationReturn(inputs);
    }

    /**
     * Starts a default WebXR experience in VR with teleportation over the given ground meshes, as
     * `createDefaultXRExperienceWithTeleportation` does, and gives back the experience with the
     * near menu, button and text it created plus a `dispose` function to end it.
     * @param inputs - The meshes the user can teleport onto
     * @returns The experience, its menu parts and a dispose function
     * @group scene
     * @shortname simple xr with teleportation return
     * @disposableOutput true
     * @example
     * ```typescript
     * const session = await bitbybit.babylon.webXr.simple.createDefaultXRExperienceWithTeleportationReturn({ groundMeshes: [ground] });
     * session.dispose();
     * ```
     */
    async createDefaultXRExperienceWithTeleportationReturn(inputs: Inputs.BabylonWebXR.DefaultWebXRWithTeleportationDto): Promise<{
        xr: BABYLON.WebXRDefaultExperience,
        torusMat: BABYLON.PBRMetallicRoughnessMaterial,
        manager: GUI3DManager,
        near: NearMenu,
        button: TouchHolographicButton,
        text: TextBlock,
        dispose: () => void
    }> {
        const xr = await this.context.scene.createDefaultXRExperienceAsync();
        if (this.context.scene.metadata) {
            this.context.scene.metadata.xr = xr;
        } else {
            this.context.scene.metadata = { xr };
        }
        const meshes: BABYLON.AbstractMesh[] = [];
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
        const torusMat = new BABYLON.PBRMetallicRoughnessMaterial("teleportation");
        torusMat.baseColor = new BABYLON.Color3(0, 0, 1);
        torusMat.metallic = 0;
        torusMat.roughness = 1;

        featuresManager.enableFeature(BABYLON.WebXRFeatureName.TELEPORTATION, "stable", {
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
        const near = new NearMenu("near");
        manager.addControl(near);

        const button = new TouchHolographicButton("button1");

        const text = new TextBlock();
        text.text = "Exit VR";
        text.color = "white";
        text.fontSize = "48px";
        button.onPointerClickObservable.add(async () => {
            await xr.baseExperience.exitXRAsync();
        });
        near.addButton(button);
        button.content = text;
        return {
            xr,
            torusMat,
            manager,
            near,
            button,
            text,
            dispose: () => {
                xr.dispose();
                torusMat.dispose();
                manager.dispose();
                near.dispose();
                button.dispose();
                text.dispose();
            }
        };

    }
}
