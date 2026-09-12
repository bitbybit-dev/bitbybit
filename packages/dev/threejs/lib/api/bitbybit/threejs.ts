import { Context } from "../context";
import { DrawHelper } from "../draw-helper";
import { ThreeJSCamera } from "./threejs/camera";

/**
 * The Three.js side of the library: what lives in the rendered scene rather than in a CAD kernel.
 * The `camera` property builds and steers the orbit camera; drawing itself goes through `draw`, and
 * the plain data helpers sit beside it on the base object.
 */
export class ThreeJS {
    public camera: ThreeJSCamera;

    constructor(
        private readonly context: Context,
        _drawHelper: DrawHelper
    ) {
        this.camera = new ThreeJSCamera(this.context);
    }
}