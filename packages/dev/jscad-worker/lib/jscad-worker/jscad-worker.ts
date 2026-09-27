import { CacheHelper } from "./cache-helper";
import { Jscad, jscadDtoRegistry, jscadDtoRules } from "@bitbybit-dev/jscad";
import { callByPath, describeKernelFailure, prepareKernelCall, rehydrateReferences } from "@bitbybit-dev/base";

/**
 * Maximum number of cached hashes before a run triggers a full cache cleanup. This is the only bound
 * on WASM memory growth across a long editing session, and what it bounds is a count of hashes rather
 * than anything measured from memory. Matches the threshold the other kernel workers use, and is local to this module
 * rather than exported, because nothing outside it sets the bound.
 */
const CACHE_THRESHOLD = 10000;


let jscad: Jscad;
let cacheHelper: CacheHelper;

export const initializationComplete = (jcd: any, _plugins?: any, doNotPost?: boolean) => {
    cacheHelper = new CacheHelper();
    jscad = new Jscad(jcd);
    if (!doNotPost) {
        postMessage("jscad-initialised");
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

const GEOMETRY_REFERENCE = "jscad-geometry";

const geometryHash = (value: object): string | number | undefined => {
    const candidate = value as { type?: unknown; hash?: unknown };
    return candidate.type === GEOMETRY_REFERENCE && (typeof candidate.hash === "string" || typeof candidate.hash === "number") ? candidate.hash : undefined;
};

const cachedGeometry = (hash: string | number): unknown => {
    const cached = cacheHelper.checkCache(hash);
    if (!cached) {
        throw new Error(`Geometry with hash ${hash} not found in cache. The cache may have been cleaned. Please regenerate the geometry.`);
    }
    return cached;
};

const isGeometry = (value: object): boolean => "polygons" in value || "sides" in value || "isClosed" in value;

/** What the worker answers when a call failed and even its failure could not be sent back. */
const UNREPORTABLE_FAILURE = "JSCAD computation failed, and the failure could not be reported.";

/**
 * Runs one kernel operation: the inputs are laid over the defaults of the DTO it takes and the result
 * is cached under them, before any reference is replaced. Only a call that is not in the cache
 * reports what its inputs would be rejected for, has the references in them replaced by the geometry
 * they stand for, and calls the dotted path on the kernel.
 */
const executeStandardFunction = (action: DataInput["action"]): unknown => {
    const call = prepareKernelCall("JSCAD", jscadDtoRegistry, action.functionName, action.inputs, jscadDtoRules);
    return cacheHelper.cacheOp({ functionName: action.functionName, inputs: call.inputs }, () => {
        call.reportIssues();
        return callByPath(jscad, action.functionName, rehydrateReferences(call.inputs, geometryHash, cachedGeometry, isGeometry));
    });
};

export const onMessageInput = (d: DataInput, postMessage: (message: unknown) => void) => {
    postMessage("busy");

    let result;
    try {
        if (d.action.functionName === "startedTheRun") {
            if (cacheHelper && Object.keys(cacheHelper.usedHashes).length > CACHE_THRESHOLD) {
                cacheHelper.cleanAllCache();
            }
            result = {};
        } else if (d.action.functionName === "cleanAllCache") {
            cacheHelper.cleanAllCache();
            result = {};
        } else {
            result = executeStandardFunction(d.action);
        }

        postMessage({
            uid: d.uid,
            result
        });
    } catch (e) {
        try {
            const failure = describeKernelFailure("JSCAD", d?.action?.functionName ?? "", d?.action?.inputs, e);
            postMessage({
                uid: d.uid,
                result: undefined,
                error: failure.message,
                errorKind: failure.kind,
                code: failure.code,
                stack: failure.stack,
            });
        } catch {
            postMessage({ uid: d?.uid, result: undefined, error: UNREPORTABLE_FAILURE, errorKind: "kernel" });
        }
    }
};
