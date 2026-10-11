import { OccStateEnum } from "@bitbybit-dev/occt-worker";
import { JscadStateEnum } from "@bitbybit-dev/jscad-worker";
import { ManifoldStateEnum } from "@bitbybit-dev/manifold-worker";
import { IFCStateEnum } from "@bitbybit-dev/ifc-worker";
import { firstValueFrom, first, map } from "rxjs";
import type { IFCWorkerManager } from "@bitbybit-dev/ifc-worker";
import type { BitByBitWorkerManagers, InitBitByBitOptions, InitKernelsResult } from "./init-kernels-types";
import type { WorkerInstances, WorkerOptions } from "./worker-types";
import { createWorkersFromCDN } from "./worker-utils";

function ifcStarted(manager: IFCWorkerManager): Promise<string> {
    if (manager.ifcWorkerStarted()) {
        return Promise.resolve("IFC");
    }
    if (!manager.ifcWorkerAlreadyInitialised()) {
        return Promise.reject(new Error("IFC is enabled, but no IFC worker was handed over: pass one as workers.ifcWorker, or leave workers out to load it from the CDN"));
    }
    return firstValueFrom(manager.ifcWorkerState$.pipe(
        first((s) => s.state === IFCStateEnum.initialised || s.state === IFCStateEnum.failed),
        map((s) => {
            if (s.state === IFCStateEnum.failed) {
                throw new Error("The IFC worker failed to start; check that its script can be loaded");
            }
            return "IFC";
        }),
    ));
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

    if (options.enableIFC) {
        anyKernelSelectedForInit = true;
        initializationPromises.push(ifcStarted(managers.ifcWorkerManager));
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
export function getOrCreateWorkers(options: InitBitByBitOptions): WorkerInstances {
    if (options.workers) {
        return options.workers;
    }
    return createWorkersFromCDN(options);
}
