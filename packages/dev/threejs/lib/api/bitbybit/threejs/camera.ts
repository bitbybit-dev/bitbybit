import { Context } from "../../context";
import { ThreeJSOrbitCamera } from "./orbit-camera";

export class ThreeJSCamera {

    public orbitCamera: ThreeJSOrbitCamera;

    constructor(
        private readonly context: Context,
    ) {
        this.orbitCamera = new ThreeJSOrbitCamera(this.context);
    }
}
