import { GlobalCDNProvider } from "@bitbybit-dev/base";

/**
 * Worker utilities for bitbybit engine packages.
 * 
 * Provides multiple strategies for creating workers:
 * 1. From CDN URLs (zero configuration, no local files needed)
 * 2. From local project files (for offline/production use)
 */

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
 * Creates an OCCT worker from CDN.
 * No local files needed - worker is loaded from CDN.
 * 
 * @param cdnUrl - Optional custom CDN URL
 * @param loadFonts - Array of font keys to load, or undefined to load all fonts. Empty array skips font loading.
 */
export function createOcctWorkerFromCDN(cdnUrl?: string, loadFonts?: string[]): Worker {
    const baseUrl = cdnUrl ?? GlobalCDNProvider.BITBYBIT_CDN_URL;
    const scriptUrl = `${baseUrl}/workers/bitbybit-occt-webworker.js`;
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
 * const workers = createWorkersFromCDN({ enableOCCT: true, enableJSCAD: true });
 * ```
 */
export function createWorkersFromCDN(options: WorkerOptions): WorkerInstances {
    const workers: WorkerInstances = {};
    const cdnUrl = options.cdnUrl;
    // Pass loadFonts as-is; createOcctWorkerFromCDN will handle undefined -> []
    const loadFonts = options.loadFonts;
    
    if (options.enableOCCT) {
        workers.occtWorker = createOcctWorkerFromCDN(cdnUrl, loadFonts);
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
