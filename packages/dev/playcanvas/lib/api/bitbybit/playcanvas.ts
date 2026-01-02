import { Context } from "../context";
import { DrawHelper } from "../draw-helper";
import { PlayCanvasCamera } from "./playcanvas/camera";

/**
 * Contains various functions that expose PlayCanvas objects
 */
export class PlayCanvas {
    public camera: PlayCanvasCamera;

    constructor(
        private readonly context: Context,
        private readonly drawHelper: DrawHelper
    ) {
        this.camera = new PlayCanvasCamera(this.context);
    }
}
