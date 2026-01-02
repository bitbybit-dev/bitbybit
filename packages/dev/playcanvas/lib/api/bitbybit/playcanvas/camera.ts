import { Context } from "../../context";
import { PlayCanvasOrbitCamera } from "./orbit-camera";

export class PlayCanvasCamera {

    public orbitCamera: PlayCanvasOrbitCamera;

    constructor(
        private readonly context: Context,
    ) {
        this.orbitCamera = new PlayCanvasOrbitCamera(this.context);
    }
}
