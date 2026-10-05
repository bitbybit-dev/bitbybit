import type { ObjectDefinition } from "./cache-helper";
import { CacheHelper } from "./cache-helper";
import { ManifoldService, manifoldDtoRegistry } from "@bitbybit-dev/manifold";
import { callByPath, describeKernelFailure, prepareKernelCall, rehydrateReferences } from "@bitbybit-dev/base";

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

const WORKER_COMMANDS = new Set([
    "deleteManifoldOrCrossSection", "deleteManifoldsOrCrossSections",
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

const UNREPORTABLE_FAILURE = "Manifold computation failed, and the failure could not be reported.";

const executeStandardFunction = (action: DataInput["action"]): unknown => {
    const call = prepareKernelCall("Manifold", manifoldDtoRegistry, action.functionName, action.inputs);
    return serializeResult(cacheHelper.cacheOp({ functionName: action.functionName, inputs: call.inputs }, () => {
        call.reportIssues();
        return callByPath(manifold, action.functionName, rehydrateReferences(call.inputs, manifoldHash, lookupManifold));
    }));
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
        if (d.action.functionName === "manifoldToMeshPointer") {
            const mesh = manifold.manifold.manifoldToMesh({ ...d.action.inputs, manifold: lookupManifold(d.action.inputs.manifold.hash) });
            const hash = cacheHelper.computeHash(d.action);
            cacheHelper.addToCache(hash, mesh);
            result = { hash, type: MANIFOLD_REFERENCE };
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
        try {
            const failure = describeKernelFailure("Manifold", d?.action?.functionName ?? "", d?.action?.inputs, e);
            postMessage({
                uid: d.uid,
                result: undefined,
                error: failure.message,
                errorKind: failure.kind,
                code: failure.code,
                details: failure.details,
                stack: failure.stack,
            });
        } catch {
            postMessage({ uid: d?.uid, result: undefined, error: UNREPORTABLE_FAILURE, errorKind: "kernel" });
        }
    }
};