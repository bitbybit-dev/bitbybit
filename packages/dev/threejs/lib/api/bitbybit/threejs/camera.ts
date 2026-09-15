import { Context } from "../../context";
import { ThreeJSOrbitCamera } from "./orbit-camera";

/**
 * Cameras for the Three.js scene: the `orbitCamera` property builds a camera that circles a pivot
 * point, the way you would turn a product in your hands, with mouse, touch and keyboard controls,
 * and adjusts it afterwards.
 */
export class ThreeJSCamera {

    public orbitCamera: ThreeJSOrbitCamera;

    constructor(
        private readonly context: Context,
    ) {
        this.orbitCamera = new ThreeJSOrbitCamera(this.context);
    }
}
