
import { Context } from "../context";

/**
 * Time functions help to create various interactions which happen in time
 */

export class Time {

    private context: Context;
    constructor(context: Context) {
        this.context = context;
    }

    /**
     * Registers a function to render loop
     * @param update The function to call in render loop
     */
    registerRenderFunction(update: (timePassedMs: number) => void): void {
        this.context.BitByBitContextHelperService.renderLoopBag.push((timePassedMs) => {
            update(timePassedMs);
        });
    }

}
