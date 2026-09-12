
import { ContextBase } from "../context";

/**
 * Hooks into the frame loop of the scene: a function registered here runs once per rendered frame
 * and receives the milliseconds elapsed since the previous frame, which is how animations and
 * interactions that change over time are driven.
 */

export class Time {

    private context: ContextBase;
    constructor(context: ContextBase) {
        this.context = context;
    }

    /**
     * Registers a function to run on every rendered frame, for animation; it receives the
     * milliseconds elapsed since the previous frame, so movement can be scaled by it.
     *
     * The function stays registered until the scene is reset.
     * @param update - The function to call each frame with the milliseconds since the previous one
     * @example
     * ```typescript
     * let angle = 0;
     * bitbybit.time.registerRenderFunction((timePassedMs) => {
     *     angle += timePassedMs * 0.001;
     *     mesh.rotation.y = angle;
     * });
     * ```
     */
    registerRenderFunction(update: (timePassedMs: number) => void): void {
        this.context.renderLoopBag.push((timePassedMs) => {
            update(timePassedMs);
        });
    }

}
