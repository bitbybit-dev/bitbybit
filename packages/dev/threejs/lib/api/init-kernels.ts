import { Scene } from "three";
import { BitByBitBase } from "./bitbybit-base";
import {
    type InitBitbybitOptions,
    type InitKernelsResult,
    getOrCreateWorkers,
    waitForKernelInitialization,
} from "@bitbybit-dev/core";

// Re-export types from core for convenience
export { type InitBitbybitOptions, type InitKernelsResult } from "@bitbybit-dev/core";

/**
 * Initialize BitByBit with Three.js scene in a single call.
 * This is the recommended way to set up BitByBit for Three.js projects.
 * 
 * Workers are automatically created from CDN if not provided in options.
 * If you don't specify loadFonts, fonts will NOT be loaded (empty array is passed).
 * 
 * @param scene - Three.js Scene instance
 * @param bitbybit - BitByBitBase instance
 * @param options - Initialization options including which kernels to enable
 * @returns Promise with initialization result and the bitbybit instance
 * 
 * @example
 * ```typescript
 * import { BitByBitBase, initBitbybit } from "@bitbybit-dev/threejs";
 * 
 * const scene = new Scene();
 * const bitbybit = new BitByBitBase();
 * 
 * await initBitbybit(scene, bitbybit, {
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
    scene: Scene,
    bitbybit: BitByBitBase,
    options: InitBitbybitOptions
): Promise<InitKernelsResult & { bitbybit: BitByBitBase }> {
    // Get or create workers
    const workers = getOrCreateWorkers(options);

    // Initialize bitbybit with scene and workers
    bitbybit.init(
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

/**
 * @deprecated Use initBitbybit instead for simpler initialization.
 * This function is kept for backward compatibility.
 */
export async function initKernels(
    scene: Scene,
    bitbybit: BitByBitBase,
    options: InitBitbybitOptions,
    workers?: { occtWorker?: Worker; jscadWorker?: Worker; manifoldWorker?: Worker }
): Promise<InitKernelsResult> {
    const mergedOptions: InitBitbybitOptions = {
        ...options,
        workers: workers ?? options.workers,
    };
    const result = await initBitbybit(scene, bitbybit, mergedOptions);
    return {
        message: result.message,
        initializedKernels: result.initializedKernels,
    };
}
