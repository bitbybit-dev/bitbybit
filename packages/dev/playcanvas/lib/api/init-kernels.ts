import type * as pc from "playcanvas";
import type { BitByBitBase } from "./bitbybit-base";
import { type InitBitByBitOptions, type InitKernelsResult, type WorkerInstances, type WorkerOptions, getOrCreateWorkers, waitForKernelInitialization } from "@bitbybit-dev/core";

export { type InitBitByBitOptions, type InitKernelsResult, type WorkerInstances, type WorkerOptions };

/**
 * Initialize BitByBit with PlayCanvas in a single call.
 * This is the recommended way to set up BitByBit for PlayCanvas projects.
 * 
 * Workers are automatically created from CDN if not provided in options.
 * If you don't specify loadFonts, fonts will NOT be loaded (empty array is passed).
 * 
 * @param app - PlayCanvas AppBase instance
 * @param scene - PlayCanvas Entity (root entity for the scene)
 * @param bitbybit - BitByBitBase instance
 * @param options - Initialization options including which kernels to enable
 * @returns Promise with initialization result and the bitbybit instance
 * 
 * @example
 * ```typescript
 * import { BitByBitBase, initBitByBit } from "@bitbybit-dev/playcanvas";
 * 
 * const app = new pc.Application(canvas);
 * const scene = app.root;
 * const bitbybit = new BitByBitBase();
 * 
 * await initBitByBit(app, scene, bitbybit, {
 *   enableOCCT: true,
 *   enableJSCAD: true,
 *   enableManifold: false,
 *   loadFonts: ["roboto"], // Optional: specify fonts, or omit to skip loading
 * });
 * 
 * // Now you can use bitbybit.occt, bitbybit.jscad, etc.
 * ```
 */
export async function initBitByBit(
    app: pc.AppBase,
    scene: pc.Entity,
    bitbybit: BitByBitBase,
    options: InitBitByBitOptions
): Promise<InitKernelsResult & { bitbybit: BitByBitBase }> {
    const workers = getOrCreateWorkers(options);

    bitbybit.init(
        app,
        scene,
        workers.occtWorker,
        workers.jscadWorker,
        workers.manifoldWorker
    );
    if (workers.ifcWorker) {
        bitbybit.ifcWorkerManager.setIfcWorker(workers.ifcWorker);
    }
    const started = waitForKernelInitialization(bitbybit, options);
    const conventionsSet = options.conventions === undefined ? undefined : bitbybit.setConventions(options.conventions);
    const [result] = await Promise.all([started, conventionsSet]);

    return {
        ...result,
        bitbybit,
    };
}
