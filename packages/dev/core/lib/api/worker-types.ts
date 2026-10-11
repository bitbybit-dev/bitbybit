/**
 * Worker architecture type for CDN workers. - "32" - 32-bit WebAssembly (default, widest browser support) -
 * "64-bit" - 64-bit WebAssembly (better performance, requires browser support for Memory64) - "64-bit-mt" -
 * 64-bit multithreaded WebAssembly (best performance, requires SharedArrayBuffer and Memory64)
 */
export type WorkerArchitecture = "32" | "64" | "64-mt";

/**
 * Worker configuration containing the Worker instance or undefined
 */
export interface WorkerInstances {
    /** The worker running the OCCT kernel */
    occtWorker?: Worker | undefined;
    /** The worker running the JSCAD kernel */
    jscadWorker?: Worker | undefined;
    /** The worker running the Manifold kernel */
    manifoldWorker?: Worker | undefined;
    /** The worker running the IFC library */
    ifcWorker?: Worker | undefined;
}

/**
 * Options for worker creation
 */
export interface WorkerOptions {
    /** Enable OCCT (OpenCASCADE) kernel */
    enableOCCT?: boolean | undefined;
    /** Enable JSCAD kernel */
    enableJSCAD?: boolean | undefined;
    /** Enable Manifold kernel */
    enableManifold?: boolean | undefined;
    /** Enable the IFC library, which runs in a worker of its own */
    enableIFC?: boolean | undefined;
    /** Custom CDN URL (defaults to GlobalCDNProvider.BITBYBIT_CDN_URL) */
    cdnUrl?: string | undefined;
    /** 
     * Array of font keys to load for OCCT, or undefined to load all fonts.
     * Pass an empty array to skip loading fonts.
     */
    loadFonts?: string[] | undefined;
    /**
     * OCCT worker architecture to use. Defaults to "32" (32-bit). Note: This only applies to OCCT workers.
     * JSCAD and Manifold always use 32-bit. - "32" - 32-bit WebAssembly (default, widest browser support) -
     * "64" - 64-bit WebAssembly (better performance, requires browser support for Memory64) - "64-mt" -
     * 64-bit multithreaded WebAssembly (best performance, requires SharedArrayBuffer and Memory64)
     */
    occtArchitecture?: WorkerArchitecture | undefined;
}

/**
 * Where the worker scripts of a project are, for `createWorkersFromUrls`.
 */
export interface WorkerUrls {
    /** The OCCT worker script */
    occtWorkerUrl?: URL | string | undefined;
    /** The JSCAD worker script */
    jscadWorkerUrl?: URL | string | undefined;
    /** The Manifold worker script */
    manifoldWorkerUrl?: URL | string | undefined;
    /** The IFC worker script */
    ifcWorkerUrl?: URL | string | undefined;
}
