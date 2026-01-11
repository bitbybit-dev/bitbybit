import { OccStateEnum, OCCTWorkerManager } from "@bitbybit-dev/occt-worker";
import { JscadStateEnum, JSCADWorkerManager } from "@bitbybit-dev/jscad-worker";
import { ManifoldStateEnum, ManifoldWorkerManager } from "@bitbybit-dev/manifold-worker";
import { firstValueFrom, first, map } from "rxjs";
import type { WorkerInstances, WorkerOptions } from "./worker-utils";
import { createWorkersFromCDN } from "./worker-utils";

/**
 * Options for initializing bitbybit
 */
export interface InitBitbybitOptions extends WorkerOptions {
    /** Pre-created worker instances. If not provided, workers will be created from CDN. */
    workers?: WorkerInstances;
}

/**
 * Interface for worker managers that engine-specific BitByBitBase classes must implement
 */
export interface BitByBitWorkerManagers {
    occtWorkerManager: OCCTWorkerManager;
    jscadWorkerManager: JSCADWorkerManager;
    manifoldWorkerManager: ManifoldWorkerManager;
}

/**
 * Result of kernel initialization
 */
export interface InitKernelsResult {
    message: string;
    initializedKernels: string[];
}

/**
 * Waits for all enabled kernels to be initialized.
 * This is engine-agnostic and can be used by all engine packages.
 * 
 * @param managers - The worker managers from BitByBitBase
 * @param options - Which kernels are enabled
 */
export async function waitForKernelInitialization(
    managers: BitByBitWorkerManagers,
    options: WorkerOptions
): Promise<InitKernelsResult> {
    const initializationPromises: Promise<string>[] = [];
    let anyKernelSelectedForInit = false;

    if (options.enableOCCT) {
        anyKernelSelectedForInit = true;
        if (managers.occtWorkerManager) {
            initializationPromises.push(
                firstValueFrom(
                    managers.occtWorkerManager.occWorkerState$.pipe(
                        first((s) => s.state === OccStateEnum.initialised),
                        map(() => "OCCT")
                    )
                )
            );
        } else {
            console.warn(
                "OCCT enabled in options, but occtWorkerManager not found after init."
            );
        }
    }

    if (options.enableJSCAD) {
        anyKernelSelectedForInit = true;
        if (managers.jscadWorkerManager) {
            initializationPromises.push(
                firstValueFrom(
                    managers.jscadWorkerManager.jscadWorkerState$.pipe(
                        first((s) => s.state === JscadStateEnum.initialised),
                        map(() => "JSCAD")
                    )
                )
            );
        } else {
            console.warn(
                "JSCAD enabled in options, but jscadWorkerManager not found after init."
            );
        }
    }

    if (options.enableManifold) {
        anyKernelSelectedForInit = true;
        if (managers.manifoldWorkerManager?.manifoldWorkerState$) {
            initializationPromises.push(
                firstValueFrom(
                    managers.manifoldWorkerManager.manifoldWorkerState$.pipe(
                        first((s) => s.state === ManifoldStateEnum.initialised),
                        map(() => "Manifold")
                    )
                )
            );
        } else {
            console.warn(
                "Manifold enabled in options, but manifoldWorkerManager not found after init."
            );
        }
    }

    if (!anyKernelSelectedForInit) {
        console.log("No kernels selected for initialization.");
        return { message: "No kernels selected for initialization.", initializedKernels: [] };
    }

    if (initializationPromises.length === 0) {
        console.log(
            "Kernels were selected, but none had managers available for awaiting initialization."
        );
        return {
            message: "Selected kernels were not awaitable for initialization state.",
            initializedKernels: [],
        };
    }

    const initializedKernels = await Promise.all(initializationPromises);
    return {
        message: `Successfully initialized: ${initializedKernels.join(", ")}`,
        initializedKernels,
    };
}

/**
 * Creates worker instances based on options.
 * If workers are provided in options, uses those. Otherwise creates from CDN.
 * 
 * @param options - Initialization options
 */
export function getOrCreateWorkers(options: InitBitbybitOptions): WorkerInstances {
    if (options.workers) {
        return options.workers;
    }
    return createWorkersFromCDN(options);
}
