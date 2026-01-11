import * as BABYLON from "@babylonjs/core";
import { BitByBitBase } from "./bitbybit-base";
import {
    type InitKernelsResult,
    type WorkerInstances,
    type WorkerOptions,
    getOrCreateWorkers,
    waitForKernelInitialization,
} from "@bitbybit-dev/core";

/**
 * Options for initializing bitbybit with Babylon.js
 */
export interface InitBitByBitOptions extends WorkerOptions {
    /** Pre-created worker instances. If not provided, workers will be created from CDN. */
    workers?: WorkerInstances;
    /** Havok physics plugin instance (optional) */
    havokPlugin?: BABYLON.HavokPlugin;
}

// Re-export types for convenience
export { type InitKernelsResult, type WorkerInstances, type WorkerOptions };

/**
 * Initialize BitByBit with Babylon.js scene in a single call.
 * This is the recommended way to set up BitByBit for Babylon.js projects.
 * 
 * Workers are automatically created from CDN if not provided in options.
 * If you don't specify loadFonts, fonts will NOT be loaded (empty array is passed).
 * 
 * @param scene - Babylon.js Scene instance
 * @param bitbybit - BitByBitBase instance
 * @param options - Initialization options including which kernels to enable
 * @returns Promise with initialization result and the bitbybit instance
 * 
 * @example
 * ```typescript
 * import { BitByBitBase, initBitByBit } from "@bitbybit-dev/babylonjs";
 * 
 * const scene = new BABYLON.Scene(engine);
 * const bitbybit = new BitByBitBase();
 * 
 * await initBitByBit(scene, bitbybit, {
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
    scene: BABYLON.Scene,
    bitbybit: BitByBitBase,
    options: InitBitByBitOptions
): Promise<InitKernelsResult & { bitbybit: BitByBitBase }> {
    // Get or create workers
    const workers = getOrCreateWorkers(options);

    // Initialize bitbybit with scene and workers
    bitbybit.init(
        scene,
        workers.occtWorker,
        workers.jscadWorker,
        workers.manifoldWorker,
        options.havokPlugin
    );

    // Wait for kernel initialization
    const result = await waitForKernelInitialization(bitbybit, options);

    return {
        ...result,
        bitbybit,
    };
}
