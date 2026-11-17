import type { OCCTWorkerManager } from "@bitbybit-dev/occt-worker";
import type { JSCADWorkerManager } from "@bitbybit-dev/jscad-worker";
import type { ManifoldWorkerManager } from "@bitbybit-dev/manifold-worker";
import type { IFCWorkerManager } from "@bitbybit-dev/ifc-worker";
import type { WorkerInstances, WorkerOptions } from "./worker-types";

/**
 * Options for initializing bitbybit
 */
export interface InitBitByBitOptions extends WorkerOptions {
    /** Pre-created worker instances. If not provided, workers will be created from CDN. */
    workers?: WorkerInstances | undefined;
    /**
     * The conventions level to run by, as `setConventions` takes it: 1 for the engine's own
     * coordinate system. Left out, the libraries behave as they did before levels existed.
     */
    conventions?: number | undefined;
}

/**
 * Interface for worker managers that engine-specific BitByBitBase classes must implement
 */
export interface BitByBitWorkerManagers {
    /** Sends OCCT calls to the OCCT worker */
    occtWorkerManager: OCCTWorkerManager;
    /** Sends JSCAD calls to the JSCAD worker */
    jscadWorkerManager: JSCADWorkerManager;
    /** Sends Manifold calls to the Manifold worker */
    manifoldWorkerManager: ManifoldWorkerManager;
    /** Sends IFC calls to the IFC worker */
    ifcWorkerManager: IFCWorkerManager;
}

/**
 * Result of kernel initialization
 */
export interface InitKernelsResult {
    /** What happened, in words */
    message: string;
    /** The kernels that started, such as OCCT and IFC */
    initializedKernels: string[];
}
