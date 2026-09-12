import { Context } from "../../context";
import { PlayCanvasOrbitCamera } from "./orbit-camera";

/**
 * Cameras for the PlayCanvas scene: the `orbitCamera` property builds a camera that circles a pivot
 * point, the way you would turn a product in your hands, with mouse and touch controls, and adjusts
 * it afterwards.
 */
export class PlayCanvasCamera {

    public orbitCamera: PlayCanvasOrbitCamera;

    constructor(
        private readonly context: Context,
    ) {
        this.orbitCamera = new PlayCanvasOrbitCamera(this.context);
    }
}
