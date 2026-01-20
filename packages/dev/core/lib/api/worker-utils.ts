import { GlobalCDNProvider } from "@bitbybit-dev/base";

/**
 * Worker utilities for bitbybit engine packages.
 * 
 * Provides multiple strategies for creating workers:
 * 1. From CDN URLs (zero configuration, no local files needed)
 * 2. From local project files (for offline/production use)
 */

/**
 * Worker architecture type for CDN workers.
 * - "32" - 32-bit WebAssembly (default, widest browser support)
 * - "64-bit" - 64-bit WebAssembly (better performance, requires browser support for Memory64)
 * - "64-bit-mt" - 64-bit multithreaded WebAssembly (best performance, requires SharedArrayBuffer and Memory64)
 */
export type WorkerArchitecture = "32" | "64-bit" | "64-bit-mt";

/**
 * Worker configuration containing the Worker instance or undefined
 */
export interface WorkerInstances {
    occtWorker?: Worker;
    jscadWorker?: Worker;
    manifoldWorker?: Worker;
}

/**
 * Options for worker creation
 */
export interface WorkerOptions {
    /** Enable OCCT (OpenCASCADE) kernel */
    enableOCCT?: boolean;
    /** Enable JSCAD kernel */
    enableJSCAD?: boolean;
    /** Enable Manifold kernel */
    enableManifold?: boolean;
    /** Custom CDN URL (defaults to GlobalCDNProvider.BITBYBIT_CDN_URL) */
    cdnUrl?: string;
    /** 
     * Array of font keys to load for OCCT, or undefined to load all fonts.
     * Pass an empty array to skip loading fonts.
     */
    loadFonts?: string[];
    /**
     * OCCT worker architecture to use. Defaults to "32" (32-bit).
     * Note: This only applies to OCCT workers. JSCAD and Manifold always use 32-bit.
     * - "32" - 32-bit WebAssembly (default, widest browser support)
     * - "64-bit" - 64-bit WebAssembly (better performance, requires browser support for Memory64)
     * - "64-bit-mt" - 64-bit multithreaded WebAssembly (best performance, requires SharedArrayBuffer and Memory64)
     */
    occtArchitecture?: WorkerArchitecture;
}

/**
 * Helper function to create a cross-origin worker URL using importScripts.
 * This is required for loading workers from CDN.
 */
function getWorkerURL(url: string): string {
    const content = `importScripts("${url}");`;
    return URL.createObjectURL(new Blob([content], { type: "text/javascript" }));
}

/**
 * Gets the OCCT worker filename based on architecture.
 * - "32" -> "bitbybit-occt-webworker.js"
 * - "64-bit" -> "bitbybit-occt-webworker-64-bit.js"
 * - "64-bit-mt" -> "bitbybit-occt-webworker-64-bit-mt.js"
 */
function getOcctWorkerFilename(architecture: WorkerArchitecture = "32"): string {
    switch (architecture) {
        case "64-bit":
            return "bitbybit-occt-webworker-64-bit.js";
        case "64-bit-mt":
            return "bitbybit-occt-webworker-64-bit-mt.js";
        case "32":
        default:
            return "bitbybit-occt-webworker.js";
    }
}

/**
 * Creates an OCCT worker from CDN.
 * No local files needed - worker is loaded from CDN.
 * 
 * @param cdnUrl - Optional custom CDN URL
 * @param loadFonts - Array of font keys to load, or undefined to load all fonts. Empty array skips font loading.
 * @param architecture - Worker architecture: "32" (default), "64-bit", or "64-bit-mt"
 */
export function createOcctWorkerFromCDN(cdnUrl?: string, loadFonts?: string[], architecture?: WorkerArchitecture): Worker {
    const baseUrl = cdnUrl ?? GlobalCDNProvider.BITBYBIT_CDN_URL;
    const filename = getOcctWorkerFilename(architecture);
    const scriptUrl = `${baseUrl}/workers/${filename}`;
    const workerUrl = getWorkerURL(scriptUrl);
    const worker = new Worker(workerUrl, { name: "OCC_WORKER" });
    // Pass empty array if loadFonts is undefined to avoid loading all fonts by default
    worker.postMessage({ type: "initialise", loadFonts: loadFonts ?? [] });
    URL.revokeObjectURL(workerUrl);
    return worker;
}

/**
 * Creates a JSCAD worker from CDN.
 * No local files needed - worker is loaded from CDN.
 * Note: JSCAD only supports 32-bit architecture.
 * 
 * @param cdnUrl - Optional custom CDN URL
 */
export function createJscadWorkerFromCDN(cdnUrl?: string): Worker {
    const baseUrl = cdnUrl ?? GlobalCDNProvider.BITBYBIT_CDN_URL;
    const scriptUrl = `${baseUrl}/workers/bitbybit-jscad-webworker.js`;
    const workerUrl = getWorkerURL(scriptUrl);
    const worker = new Worker(workerUrl, { name: "JSCAD_WORKER" });
    URL.revokeObjectURL(workerUrl);
    return worker;
}

/**
 * Creates a Manifold worker from CDN.
 * No local files needed - worker is loaded from CDN.
 * Note: Manifold only supports 32-bit architecture.
 * 
 * @param cdnUrl - Optional custom CDN URL
 */
export function createManifoldWorkerFromCDN(cdnUrl?: string): Worker {
    const baseUrl = cdnUrl ?? GlobalCDNProvider.BITBYBIT_CDN_URL;
    const scriptUrl = `${baseUrl}/workers/bitbybit-manifold-webworker.js`;
    const workerUrl = getWorkerURL(scriptUrl);
    const worker = new Worker(workerUrl, { name: "MANIFOLD_WORKER" });
    URL.revokeObjectURL(workerUrl);
    return worker;
}

/**
 * Creates all enabled worker instances from CDN.
 * This is the simplest way to get started - no local files needed!
 * 
 * @example
 * ```typescript
 * // Default 32-bit workers
 * const workers = createWorkersFromCDN({ enableOCCT: true, enableJSCAD: true });
 * 
 * // 64-bit OCCT worker for better performance (JSCAD/Manifold remain 32-bit)
 * const workers64 = createWorkersFromCDN({ enableOCCT: true, occtArchitecture: "64" });
 * 
 * // 64-bit multithreaded OCCT worker for best performance
 * const workersMT = createWorkersFromCDN({ enableOCCT: true, occtArchitecture: "64-mt" });
 * ```
 */
export function createWorkersFromCDN(options: WorkerOptions): WorkerInstances {
    const workers: WorkerInstances = {};
    const cdnUrl = options.cdnUrl;
    // Pass loadFonts as-is; createOcctWorkerFromCDN will handle undefined -> []
    const loadFonts = options.loadFonts;
    const occtArchitecture = options.occtArchitecture;
    
    if (options.enableOCCT) {
        workers.occtWorker = createOcctWorkerFromCDN(cdnUrl, loadFonts, occtArchitecture);
    }
    if (options.enableJSCAD) {
        workers.jscadWorker = createJscadWorkerFromCDN(cdnUrl);
    }
    if (options.enableManifold) {
        workers.manifoldWorker = createManifoldWorkerFromCDN(cdnUrl);
    }
    
    return workers;
}

/**
 * Creates workers from local project files (ES module workers).
 * Use this when you have worker files in your project for offline/production use.
 * 
 * @param workerUrls - URLs to your local worker files
 * 
 * @example
 * ```typescript
 * const workers = createWorkersFromUrls({
 *   occtWorkerUrl: new URL("./workers/occt.worker.ts", import.meta.url),
 *   jscadWorkerUrl: new URL("./workers/jscad.worker.ts", import.meta.url),
 * });
 * ```
 */
export function createWorkersFromUrls(workerUrls: {
    occtWorkerUrl?: URL | string;
    jscadWorkerUrl?: URL | string;
    manifoldWorkerUrl?: URL | string;
}): WorkerInstances {
    const workers: WorkerInstances = {};
    
    if (workerUrls.occtWorkerUrl) {
        workers.occtWorker = new Worker(workerUrls.occtWorkerUrl, { name: "OCC_WORKER", type: "module" });
    }
    if (workerUrls.jscadWorkerUrl) {
        workers.jscadWorker = new Worker(workerUrls.jscadWorkerUrl, { name: "JSCAD_WORKER", type: "module" });
    }
    if (workerUrls.manifoldWorkerUrl) {
        workers.manifoldWorker = new Worker(workerUrls.manifoldWorkerUrl, { name: "MANIFOLD_WORKER", type: "module" });
    }
    
    return workers;
}
