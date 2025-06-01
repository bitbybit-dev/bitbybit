import type { BitByBitBase } from "@bitbybit-dev/babylonjs";
import type { Scene } from "@babylonjs/core";
import type { KernelOptions } from "../models";
import { first, firstValueFrom, tap } from "rxjs";
import { OccStateEnum } from "@bitbybit-dev/occt-worker";
import { JscadStateEnum } from "@bitbybit-dev/jscad-worker";
import { ManifoldStateEnum } from "@bitbybit-dev/manifold-worker";

export async function initKernels(
  scene: Scene,
  bitbybit: BitByBitBase,
  options: KernelOptions
): Promise<{ message: string }> {
  let occtWorkerInstance: Worker | undefined;
  let jscadWorkerInstance: Worker | undefined;
  let manifoldWorkerInstance: Worker | undefined;

  // 1. Conditionally create worker instances
  if (options.enableOCCT) {
    occtWorkerInstance = new Worker(
      new URL("../workers/occt.worker.ts", import.meta.url),
      { name: "OCC_WORKER", type: "module" }
    );
  }
  if (options.enableJSCAD) {
    jscadWorkerInstance = new Worker(
      new URL("../workers/jscad.worker.ts", import.meta.url),
      { name: "JSCAD_WORKER", type: "module" }
    );
  }
  if (options.enableManifold) {
    manifoldWorkerInstance = new Worker(
      new URL("../workers/manifold.worker.ts", import.meta.url),
      { name: "MANIFOLD_WORKER", type: "module" }
    );
  }

  // 2. Initialize Bitbybit
  await bitbybit.init(
    scene,
    occtWorkerInstance,
    jscadWorkerInstance,
    manifoldWorkerInstance
  );

  // 3. Collect promises for kernel initializations
  const initializationPromises: Promise<void>[] = [];
  let anyKernelSelectedForInit = false;

  if (options.enableOCCT) {
    anyKernelSelectedForInit = true;
    if (bitbybit.occtWorkerManager) {
      initializationPromises.push(
        firstValueFrom(
          bitbybit.occtWorkerManager.occWorkerState$.pipe(
            first((s) => s.state === OccStateEnum.initialised),
            tap(() => console.log("OCCT Initialized"))
          )
        ).then(() => {}) // Ensure the promise resolves to void for Promise.all
      );
    } else {
      console.warn(
        "OCCT enabled in options, but occtWorkerManager not found after init."
      );
    }
  }

  if (options.enableJSCAD) {
    anyKernelSelectedForInit = true;
    if (bitbybit.jscadWorkerManager) {
      initializationPromises.push(
        firstValueFrom(
          bitbybit.jscadWorkerManager.jscadWorkerState$.pipe(
            first((s) => s.state === JscadStateEnum.initialised),
            tap(() => console.log("JSCAD Initialized"))
          )
        ).then(() => {})
      );
    } else {
      console.warn(
        "JSCAD enabled in options, but jscadWorkerManager not found after init."
      );
    }
  }

  if (options.enableManifold) {
    anyKernelSelectedForInit = true;
    if (bitbybit.manifoldWorkerManager) {
      initializationPromises.push(
        firstValueFrom(
          bitbybit.manifoldWorkerManager.manifoldWorkerState$.pipe(
            first((s) => s.state === ManifoldStateEnum.initialised),
            tap(() => console.log("Manifold Initialized"))
          )
        ).then(() => {})
      );
    } else {
      console.warn(
        "Manifold enabled in options, but manifoldWorkerManager not found after init."
      );
    }
  }

  // 4. Wait for selected & available kernels or handle no selection/availability
  if (!anyKernelSelectedForInit) {
    console.log("No kernels selected for initialization.");
    return { message: "No kernels selected for initialization." };
  }

  if (initializationPromises.length === 0) {
    // Kernels were selected, but none were awaitable (e.g., managers missing for all selected)
    console.log(
      "Kernels were selected, but none had managers available for awaiting initialization."
    );
    return {
      message: "Selected kernels were not awaitable for initialization state.",
    };
  }

  await Promise.all(initializationPromises);
  console.log("Selected and awaitable kernels initialized:", options);
  return {
    message: "Selected and awaitable kernels initialized successfully.",
  };
}
