import { OccStateEnum } from "@bitbybit-dev/occt-worker";
import type { BitByBitBase, Inputs } from "@bitbybit-dev/threejs";

let starting: Promise<void> | undefined;

function startOpenCascade(bitbybit: BitByBitBase): Promise<void> {
    starting ??= new Promise<void>((resolve, reject) => {
        const manager = bitbybit.occtWorkerManager;
        const subscription = manager.occWorkerState$.subscribe((info) => {
            if (info.state === OccStateEnum.initialised) {
                subscription.unsubscribe();
                resolve();
            }
        });
        const worker = new Worker(new URL("../workers/occt.worker.ts", import.meta.url), { name: "OCC_WORKER", type: "module" });
        worker.addEventListener("error", (event) => {
            subscription.unsubscribe();
            starting = undefined;
            reject(new Error(`OpenCascade could not start: ${event.message}`));
        });
        manager.setOccWorker(worker);
    });
    return starting;
}

export async function houseStep(bitbybit: BitByBitBase, model: Inputs.IFC.IfcModelPointer): Promise<Uint8Array> {
    await startOpenCascade(bitbybit);
    return bitbybit.ifc.geometry.toStep({ model, name: "Family house", fileName: "house.step", facetedMeshes: true });
}
