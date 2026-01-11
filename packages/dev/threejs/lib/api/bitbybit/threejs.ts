import { Context } from "../context";
import { DrawHelper } from "../draw-helper";
import { ThreeJSCamera } from "./threejs/camera";

/**
 * Contains various functions that expose ThreeJS objects
 */
export class ThreeJS {
    public camera: ThreeJSCamera;

    constructor(
        private readonly context: Context,
        private readonly drawHelper: DrawHelper
    ) {
        this.camera = new ThreeJSCamera(this.context);
    }
}