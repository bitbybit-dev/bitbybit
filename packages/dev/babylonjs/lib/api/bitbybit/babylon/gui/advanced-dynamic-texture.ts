
import { Context } from "../../../context";
import * as BABYLON from "../../../../gui-enriched-babylon";
import * as Inputs from "../../../inputs";

/**
 * The surface GUI controls are drawn on: a full-screen layer over the canvas, or a texture wrapped
 * onto a mesh so the controls sit in the 3D scene. Every control has to be added to one of these,
 * directly or through a container, before it shows.
 */
export class BabylonGuiAdvancedDynamicTexture {

    constructor(private readonly context: Context) { }

    /**
     * Creates the full-screen layer that GUI controls are added to, drawn over the whole canvas in
     * front of the scene when `foreground` is true; `adaptiveScaling` scales the layer with the
     * screen's pixel density.
     * @param inputs - The name, the foreground flag and the adaptive scaling flag
     * @returns The full-screen UI texture
     * @group spaces
     * @shortname create full screen ui
     * @disposableOutput true
     * @example
     * ```typescript
     * const ui = bitbybit.babylon.gui.advancedDynamicTexture.createFullScreenUI({ name: "ui", foreground: true, adaptiveScaling: false });
     * const panel = bitbybit.babylon.gui.stackPanel.createStackPanel({ name: "panel", isVertical: true, spacing: 8, width: "300px", height: "400px", color: "#00000000", background: "#00000055" });
     * ui.addControl(panel);
     * ```
     */
    createFullScreenUI(inputs: Inputs.BabylonGui.CreateFullScreenUIDto): BABYLON.GUI.AdvancedDynamicTexture {
        const sampling = BABYLON.Texture.BILINEAR_SAMPLINGMODE;
        const texture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI(inputs.name, inputs.foreground, this.context.scene, sampling, inputs.adaptiveScaling);
        return texture;
    }

    /**
     * Creates a GUI texture wrapped onto a mesh, so controls added to it appear on the mesh's
     * surface in the scene; the mesh needs texture coordinates, a plane being the usual choice.
     *
     * `width` and `height` size the texture in pixels, `supportPointerMove` lets controls react to
     * hover, and `onlyAlphaTesting` draws it without blending.
     * @param inputs - The mesh, the texture size, the pointer, alpha, flip and sampling options
     * @returns The GUI texture on the mesh
     * @group spaces
     * @shortname create for mesh
     * @disposableOutput true
     * @example
     * ```typescript
     * const plane = bitbybit.babylon.meshBuilder.createRectanglePlane({ width: 4, height: 2, sideOrientation: Bit.Inputs.BabylonMesh.sideOrientationEnum.doubleside, enableShadows: false });
     * const ui = bitbybit.babylon.gui.advancedDynamicTexture.createForMesh({ mesh: plane, width: 1024, height: 512, supportPointerMove: true, onlyAlphaTesting: false, invertY: true, sampling: Bit.Inputs.BabylonTexture.samplingModeEnum.trilinear });
     * ```
     */
    createForMesh(inputs: Inputs.BabylonGui.CreateForMeshDto): BABYLON.GUI.AdvancedDynamicTexture {
        const sampling = this.context.getSamplingMode(inputs.sampling);
        const texture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(inputs.mesh, inputs.width, inputs.height, inputs.supportPointerMove, inputs.onlyAlphaTesting, inputs.invertY, undefined, sampling);
        return texture;
    }


}
