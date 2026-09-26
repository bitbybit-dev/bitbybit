import { CacheHelper } from "./cache-helper";
import { Jscad, jscadDtoRegistry, jscadDtoRules } from "@bitbybit-dev/jscad";
import { callByPath, describeKernelFailure, rehydrateReferences, reportInputIssues, resolveInputs, unknownProperties, validateInputs } from "@bitbybit-dev/base";

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

/**
 * Runs one kernel operation: the inputs are laid over the defaults of the DTO it takes, references
 * in them become the geometry they stand for, the dotted path is called on the kernel, and the
 * result is cached under the inputs as resolved, before any reference was replaced. A call that is not
 * in the cache first reports what its inputs would be rejected for.
 */
const executeStandardFunction = (action: DataInput["action"]): unknown => {
    const inputs = resolveInputs(jscadDtoRegistry, action.functionName, action.inputs);
    const rehydrated = rehydrateReferences(inputs, geometryHash, cachedGeometry, isGeometry);
    return cacheHelper.cacheOp({ functionName: action.functionName, inputs }, () => {
        reportInputIssues("JSCAD", action.functionName, validateInputs(jscadDtoRegistry, action.functionName, inputs, jscadDtoRules), unknownProperties(jscadDtoRegistry, action.functionName, action.inputs));
        return callByPath(jscad, action.functionName, rehydrated);
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
        const failure = describeKernelFailure("JSCAD", d?.action?.functionName ?? "", d?.action?.inputs, e);
        postMessage({
            uid: d.uid,
            result: undefined,
            error: failure.message,
            errorKind: failure.kind,
            stack: failure.stack,
        });
    }
};
