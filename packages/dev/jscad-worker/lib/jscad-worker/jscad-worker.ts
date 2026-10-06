import { CacheHelper } from "./cache-helper";
import { Jscad, jscadDtoRegistry, jscadDtoRules } from "@bitbybit-dev/jscad";
import { callByPath, describeKernelFailure, prepareKernelCall, rehydrateReferences } from "@bitbybit-dev/base";

const CACHE_THRESHOLD = 10000;


let jscad: Jscad;
let cacheHelper: CacheHelper;

type Held = { call: DataInput; postMessage: (message: unknown) => void };

let held: Held[] | undefined = [];

export const initializationComplete = (jcd: any, _plugins?: any, doNotPost?: boolean) => {
    cacheHelper = new CacheHelper();
    jscad = new Jscad(jcd);
    if (!doNotPost) {
        postMessage("jscad-initialised");
    }
    const waiting = held ?? [];
    held = undefined;
    waiting.forEach(({ call, postMessage: answer }) => onMessageInput(call, answer));
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

const unreportableFailure = (functionName: unknown): string => typeof functionName === "string" && functionName !== ""
    ? `JSCAD '${functionName}' failed, and the failure could not be reported.`
    : "JSCAD computation failed, and the failure could not be reported.";

const executeStandardFunction = (action: DataInput["action"]): unknown => {
    const call = prepareKernelCall("JSCAD", jscadDtoRegistry, action.functionName, action.inputs, jscadDtoRules);
    return cacheHelper.cacheOp({ functionName: action.functionName, inputs: call.inputs }, () => {
        call.reportIssues();
        return callByPath(jscad, action.functionName, rehydrateReferences(call.inputs, geometryHash, cachedGeometry, isGeometry));
    });
};

export const onMessageInput = (d: DataInput, postMessage: (message: unknown) => void) => {
    if (held !== undefined) {
        held.push({ call: d, postMessage });
        return;
    }
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
                details: failure.details,
                stack: failure.stack,
            });
        } catch {
            postMessage({ uid: d?.uid, result: undefined, error: unreportableFailure(d?.action?.functionName), errorKind: "kernel" });
        }
    }
};
