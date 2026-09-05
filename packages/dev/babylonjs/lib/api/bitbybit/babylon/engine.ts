
import { Context } from "../../context";
import * as BABYLON from "@babylonjs/core";

/**
 * The rendering engine itself: the render loop, canvas sizing and resolution, hardware scaling and
 * the frame-level settings that decide how much work each frame does. Reach for it when you need to
 * control rendering rather than what is rendered.
 */
export class BabylonEngine {

    constructor(private readonly context: Context) { }

    /**
     * Gets the engine for the current context
     * @ignore true
     * @group engine
     * @shortname get engine
     */
    getEngine(): BABYLON.Engine | BABYLON.WebGPUEngine {
        return this.context.engine;
    }

    /**
     * Gets the rendering canvas on which scene cameras can be attached
     * @ignore true
     * @group engine
     * @shortname get rendering canvas
     */
    getRenderingCanvas(): HTMLCanvasElement {
        return this.context.engine.getRenderingCanvas();
    }

}
