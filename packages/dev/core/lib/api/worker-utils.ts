import { GlobalCDNProvider } from "@bitbybit-dev/base";
import type { WorkerArchitecture, WorkerInstances, WorkerOptions, WorkerUrls } from "./worker-types";

function getClassicWorkerURL(url: string): string {
    const content = `importScripts("${url}");`;
    return URL.createObjectURL(new Blob([content], { type: "text/javascript" }));
}

function classicWorkerFromCDN(baseUrl: string, script: string, name: string): Worker {
    const workerUrl = getClassicWorkerURL(`${baseUrl}/workers/${script}`);
    const worker = new Worker(workerUrl, { name });
    URL.revokeObjectURL(workerUrl);
    return worker;
}

function getModuleWorkerURL(url: string): string {
    const content = `import "${url}";`;
    return URL.createObjectURL(new Blob([content], { type: "text/javascript" }));
}

function getOcctWorkerFilename(architecture: WorkerArchitecture = "32"): string {
    switch (architecture) {
        case "64":
            return "bitbybit-dev-occt-64-bit-webworker.js";
        case "64-mt":
            return "bitbybit-dev-occt-64-bit-mt-webworker.js";
        case "32":
        default:
            return "bitbybit-dev-occt-webworker.js";
    }
}

/**
 * Creates an OCCT worker from CDN.
 * No local files needed - worker is loaded directly from CDN.
 * 
 * @param cdnUrl - Optional custom CDN URL
 * @param loadFonts - Array of font keys to load, or undefined to load all fonts. Empty array skips font loading.
 * @param architecture - Worker architecture: "32" (default), "64", or "64-mt"
 */
export function createOcctWorkerFromCDN(cdnUrl?: string, loadFonts?: string[], architecture?: WorkerArchitecture): Worker {
    const baseUrl = cdnUrl ?? GlobalCDNProvider.BITBYBIT_CDN_URL;
    const filename = getOcctWorkerFilename(architecture);
    const scriptUrl = `${baseUrl}/workers/${filename}`;
    
    const workerUrl = getModuleWorkerURL(scriptUrl);
    const worker = new Worker(workerUrl, { type: "module", name: "OCC_WORKER" });
        URL.revokeObjectURL(workerUrl);
    
    worker.postMessage({ type: "initialise", loadFonts: loadFonts ?? [], cdnUrl: baseUrl });
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
    return classicWorkerFromCDN(cdnUrl ?? GlobalCDNProvider.BITBYBIT_CDN_URL, "bitbybit-dev-jscad-webworker.js", "JSCAD_WORKER");
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
    const worker = classicWorkerFromCDN(baseUrl, "bitbybit-dev-manifold-webworker.js", "MANIFOLD_WORKER");
    worker.postMessage({ type: "initialise", cdnUrl: baseUrl });
    return worker;
}

/**
 * Creates an IFC worker from CDN.
 * No local files needed - worker is loaded from CDN.
 * The IFC library is plain JavaScript, so there is no WebAssembly to choose an architecture for.
 * 
 * @param cdnUrl - Optional custom CDN URL
 */
export function createIfcWorkerFromCDN(cdnUrl?: string): Worker {
    return classicWorkerFromCDN(cdnUrl ?? GlobalCDNProvider.BITBYBIT_CDN_URL, "bitbybit-dev-ifc-webworker.js", "IFC_WORKER");
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
    const loadFonts = options.loadFonts;
    const occtArchitecture = options.occtArchitecture;
    
    if (options.enableOCCT) {
        workers.occtWorker = createOcctWorkerFromCDN(cdnUrl, loadFonts, occtArchitecture);
    }
    if (options.enableJSCAD) {
        workers.jscadWorker = createJscadWorkerFromCDN(cdnUrl);
    }
    if (options.enableIFC) {
        workers.ifcWorker = createIfcWorkerFromCDN(cdnUrl);
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
export function createWorkersFromUrls(workerUrls: WorkerUrls): WorkerInstances {
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
    if (workerUrls.ifcWorkerUrl) {
        workers.ifcWorker = new Worker(workerUrls.ifcWorkerUrl, { name: "IFC_WORKER", type: "module" });
    }
    
    return workers;
}
