import { CacheHelper, ObjectDefinition } from "./cache-helper";
import { ManifoldService, manifoldDtoRegistry } from "@bitbybit-dev/manifold";
import { callByPath, describeKernelFailure, rehydrateReferences, resolveInputs } from "@bitbybit-dev/base";

/**
 * Maximum number of cached hashes before a run triggers a full cache cleanup. This is the only bound
 * on WASM memory growth across a long editing session, and what it bounds is a count of hashes rather
 * than anything measured from memory. Matches the threshold the other kernel workers use, and is local to this module
 * rather than exported, because nothing outside it sets the bound.
 */
const CACHE_THRESHOLD = 10000;


let manifold: ManifoldService;
let cacheHelper: CacheHelper;

export const initializationComplete = (mnf: any, _plugins?: any, doNotPost?: boolean) => {
    cacheHelper = new CacheHelper();
    manifold = new ManifoldService(mnf);
    if (!doNotPost) {
        postMessage("manifold-initialised");
    }
};

export type DataInput = {
    /**
     * Action data is used for cashing as a hashed number.
     */
    action: {
        functionName: string;
        inputs: any;
    }
    uid: string;
};

type HashedManifold = { hash: string | number };

const MANIFOLD_REFERENCE = "manifold-shape";

/** Commands the worker answers itself rather than by calling a kernel method. */
const WORKER_COMMANDS = new Set([
    "manifoldToMesh", "manifoldsToMeshes", "deleteManifoldOrCrossSection", "deleteManifoldsOrCrossSections",
    "manifoldToMeshPointer", "startedTheRun", "cleanAllCache", "addManifoldPluginDependency",
]);

const manifoldHash = (value: object): string | number | undefined => {
    const candidate = value as { type?: unknown; hash?: unknown };
    return candidate.type === MANIFOLD_REFERENCE && (typeof candidate.hash === "string" || typeof candidate.hash === "number") ? candidate.hash : undefined;
};

const lookupManifold = (hash: string | number): unknown => {
    const cached = cacheHelper.checkCache(hash);
    if (!cached) {
        throw new Error(`Manifold with hash ${hash} not found in cache. The cache may have been cleaned. Please regenerate the manifold.`);
    }
    return cached;
};

type Hashed = { hash: string | number };

const isObjectDefinition = (value: unknown): value is ObjectDefinition<unknown, Hashed> => {
    const candidate = value as { compound?: unknown; data?: unknown; manifolds?: unknown[] } | null;
    return !!candidate && !!candidate.compound && !!candidate.data && Array.isArray(candidate.manifolds) && candidate.manifolds.length > 0;
};

const serializeResult = (res: unknown): unknown => {
    if (!cacheHelper.isManifoldObject(res)) {
        if (isObjectDefinition(res)) {
            return {
                ...res,
                manifolds: res.manifolds!.map(s => ({ id: s.id, manifold: { hash: s.manifold.hash, type: MANIFOLD_REFERENCE } })),
                compound: { hash: res.compound!.hash, type: MANIFOLD_REFERENCE },
            };
        }
        return res;
    }
    if (Array.isArray(res)) {
        return res.map((r: Hashed) => ({ hash: r.hash, type: MANIFOLD_REFERENCE }));
    }
    return { hash: (res as Hashed).hash, type: MANIFOLD_REFERENCE };
};

/**
 * Runs one kernel operation: the inputs are laid over the defaults of the DTO it takes, references
 * in them become the manifolds they stand for, the dotted path is called on the kernel, the result is
 * cached under the inputs as resolved, before any reference was replaced, and every manifold in it
 * goes back as a reference.
 */
const executeStandardFunction = (action: DataInput["action"]): unknown => {
    const inputs = resolveInputs(manifoldDtoRegistry, action.functionName, action.inputs);
    const rehydrated = rehydrateReferences(inputs, manifoldHash, lookupManifold);
    return serializeResult(cacheHelper.cacheOp({ functionName: action.functionName, inputs }, () => callByPath(manifold, action.functionName, rehydrated)));
};

export const onMessageInput = (d: DataInput, postMessage: (message: unknown) => void) => {
    postMessage("busy");

    let result;
    try {
        if (!WORKER_COMMANDS.has(d.action.functionName)) {
            result = executeStandardFunction(d.action);
        }
        if (d.action.functionName === "addManifoldPluginDependency") {
            if (manifold && manifold.plugins) {
                Object.keys(d.action.inputs).forEach(c => {
                    manifold.plugins.dependencies[c] = d.action.inputs[c];
                });
            }
        }
        if (d.action.functionName === "manifoldToMesh") {
            const cachedManifold = cacheHelper.checkCache(d.action.inputs.manifold.hash);
            if (!cachedManifold) {
                throw new Error(`Manifold with hash ${d.action.inputs.manifold.hash} not found in cache. The cache may have been cleaned. Please regenerate the manifold.`);
            }
            d.action.inputs.manifold = cachedManifold;
            result = manifold.decomposeManifoldOrCrossSection(d.action.inputs);
        }
        if (d.action.functionName === "manifoldToMeshPointer") {
            const cachedManifold = cacheHelper.checkCache(d.action.inputs.manifold.hash);
            if (!cachedManifold) {
                throw new Error(`Manifold with hash ${d.action.inputs.manifold.hash} not found in cache. The cache may have been cleaned. Please regenerate the manifold.`);
            }
            d.action.inputs.manifold = cachedManifold;
            const r = manifold.manifold.manifoldToMesh(d.action.inputs);
            const hash = cacheHelper.computeHash(d.action);
            cacheHelper.addToCache(hash, r);
            result = { hash, type: "manifold-shape" };
        }
        if (d.action.functionName === "manifoldsToMeshes") {
            if (d.action.inputs.manifolds && d.action.inputs.manifolds.length > 0) {
                d.action.inputs.manifolds = d.action.inputs.manifolds.map((manifold: HashedManifold) => {
                    const cachedManifold = cacheHelper.checkCache(manifold.hash);
                    if (!cachedManifold) {
                        throw new Error(`Manifold with hash ${manifold.hash} not found in cache. The cache may have been cleaned. Please regenerate the manifold.`);
                    }
                    return cachedManifold;
                });
            } else {
                throw new Error("No manifolds detected");
            }
            result = manifold.decomposeManifoldsOrCrossSections(d.action.inputs);
        }
        if (d.action.functionName === "deleteManifoldOrCrossSection") {
            cacheHelper.cleanCacheForHash(d.action.inputs.manifoldOrCrossSection.hash);
            result = {};
        }
        if (d.action.functionName === "deleteManifoldsOrCrossSections") {
            d.action.inputs.manifoldsOrCrossSections.forEach((manifold: HashedManifold) => cacheHelper.cleanCacheForHash(manifold.hash));
            result = {};
        }
        if (d.action.functionName === "startedTheRun") {
            if (cacheHelper && Object.keys(cacheHelper.usedHashes).length > CACHE_THRESHOLD) {
                cacheHelper.cleanAllCache();
            }
            result = {};
        }

        if (d.action.functionName === "cleanAllCache") {
            cacheHelper.cleanAllCache();
            result = {};
        }

        postMessage({
            uid: d.uid,
            result
        });
    } catch (e) {
        const failure = describeKernelFailure("Manifold", d?.action?.functionName ?? "", d?.action?.inputs, e);
        postMessage({
            uid: d.uid,
            result: undefined,
            error: failure.message,
            errorKind: failure.kind,
            stack: failure.stack,
        });
    }
};