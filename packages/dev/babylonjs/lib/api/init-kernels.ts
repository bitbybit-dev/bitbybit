import type * as BABYLON from "@babylonjs/core";
import type { BitByBitBase } from "./bitbybit-base";
import { type InitBitByBitOptions as KernelOptions, type InitKernelsResult, type WorkerInstances, type WorkerOptions, getOrCreateWorkers, waitForKernelInitialization } from "@bitbybit-dev/core";

/**
 * Options for initializing bitbybit with Babylon.js: the kernels, workers and conventions every
 * renderer takes, and the physics plugin.
 */
export interface InitBitByBitOptions extends KernelOptions {
    /** Havok physics plugin instance (optional) */
    havokPlugin?: BABYLON.HavokPlugin | undefined;
}

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
 */
export async function initBitByBit(
    scene: BABYLON.Scene,
    bitbybit: BitByBitBase,
    options: InitBitByBitOptions
): Promise<InitKernelsResult & { bitbybit: BitByBitBase }> {
    const workers = getOrCreateWorkers(options);

    bitbybit.init(
        scene,
        workers.occtWorker,
        workers.jscadWorker,
        workers.manifoldWorker,
        options.havokPlugin
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
