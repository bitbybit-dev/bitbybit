import * as pc from "playcanvas";
import { BitByBitBase } from "./bitbybit-base";
import {
    type InitKernelsResult,
    type WorkerInstances,
    type WorkerOptions,
    getOrCreateWorkers,
    waitForKernelInitialization,
} from "@bitbybit-dev/core";

/**
 * Options for initializing bitbybit with PlayCanvas
 */
export interface InitBitbybitOptions extends WorkerOptions {
    /** Pre-created worker instances. If not provided, workers will be created from CDN. */
    workers?: WorkerInstances;
}

// Re-export types for convenience
export { type InitKernelsResult, type WorkerInstances, type WorkerOptions };

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
 * import { BitByBitBase, initBitbybit } from "@bitbybit-dev/playcanvas";
 * 
 * const app = new pc.Application(canvas);
 * const scene = app.root;
 * const bitbybit = new BitByBitBase();
 * 
 * await initBitbybit(app, scene, bitbybit, {
 *   enableOCCT: true,
 *   enableJSCAD: true,
 *   enableManifold: false,
 *   loadFonts: ["roboto"], // Optional: specify fonts, or omit to skip loading
 * });
 * 
 * // Now you can use bitbybit.occt, bitbybit.jscad, etc.
 * ```
 */
export async function initBitbybit(
    app: pc.AppBase,
    scene: pc.Entity,
    bitbybit: BitByBitBase,
    options: InitBitbybitOptions
): Promise<InitKernelsResult & { bitbybit: BitByBitBase }> {
    // Get or create workers
    const workers = getOrCreateWorkers(options);

    // Initialize bitbybit with app, scene and workers
    bitbybit.init(
        app,
        scene,
        workers.occtWorker,
        workers.jscadWorker,
        workers.manifoldWorker
    );

    // Wait for kernel initialization
    const result = await waitForKernelInitialization(bitbybit, options);

    return {
        ...result,
        bitbybit,
    };
}
