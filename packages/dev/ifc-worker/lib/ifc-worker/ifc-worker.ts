import { InputError, callByPath, describeKernelFailure, prepareKernelCall, rehydrateReferences } from "@bitbybit-dev/base";
import { IFCService, ifcDtoRegistry } from "@bitbybit-dev/ifc";
import type { HeldCall } from "./handler-types";
import { ModelCache, isModelReference } from "./model-cache";
import type { DataAction, DataInput, PostMessage } from "./worker-types";

const CACHE_THRESHOLD = 10000;
const KERNEL = "IFC";
const UNREPEATABLE: Readonly<Record<string, string>> = { "model.create": "seed", "model.write": "timeStamp" };

const unreportableFailure = (functionName: unknown): string => typeof functionName === "string" && functionName !== ""
    ? `IFC '${functionName}' failed, and the failure could not be reported.`
    : "IFC call failed, and the failure could not be reported.";

function isUnrepeatable(functionName: string, inputs: unknown): boolean {
    const varying = UNREPEATABLE[functionName];
    return varying !== undefined && (typeof inputs !== "object" || inputs === null || (inputs as Record<string, unknown>)[varying] === undefined);
}

export class IFCWorkerHandler {
    private ifc: IFCService | undefined;
    private cache = new ModelCache();
    private held: HeldCall[] = [];

    initializationComplete(post: PostMessage, doNotPost?: boolean): void {
        this.ifc = new IFCService();
        this.cache = new ModelCache();
        if (!doNotPost) {
            post("ifc-initialised");
        }
        const waiting = this.held;
        this.held = [];
        waiting.forEach(({ call, answer }) => this.onMessageInput(call, answer));
    }

    onMessageInput(data: DataInput, post: PostMessage): void {
        if (!this.ifc) {
            this.held.push({ call: data, answer: post });
            return;
        }
        post("busy");
        try {
            post({ uid: data.uid, result: this.execute(this.ifc, data.action) });
        } catch (error) {
            try {
                const failure = describeKernelFailure(KERNEL, data?.action?.functionName ?? "", data?.action?.inputs, error);
                post({ uid: data.uid, result: undefined, error: failure.message, errorKind: failure.kind, code: failure.code, details: failure.details, stack: failure.stack });
            } catch {
                post({ uid: data?.uid, result: undefined, error: unreportableFailure(data?.action?.functionName), errorKind: "kernel" });
            }
        }
    }

    private execute(service: IFCService, action: DataAction | undefined): unknown {
        if (typeof action?.functionName !== "string" || action.functionName === "") {
            throw new InputError("An IFC call must name the method it calls, such as walls.add");
        }
        if (action.functionName === "isReady") {
            return {};
        }
        if (action.functionName === "startedTheRun") {
            if (this.cache.size > CACHE_THRESHOLD) {
                this.cache.clear();
            }
            return {};
        }
        if (action.functionName === "cleanAllCache") {
            this.cache.clear();
            return {};
        }
        const call = prepareKernelCall(KERNEL, ifcDtoRegistry, action.functionName, action.inputs);
        const key = isUnrepeatable(action.functionName, call.inputs) ? this.cache.freshKey() : this.cache.keyOf(action.functionName, call.inputs);
        const known = this.cache.get(key);
        if (known) {
            return this.cache.answer(key, known);
        }
        call.reportIssues();
        const inputs = rehydrateReferences(call.inputs, (value) => (isModelReference(value) ? value.hash : undefined), (hash) => this.cache.model(Number(hash)));
        return this.cache.answer(key, this.cache.store(key, callByPath(service, action.functionName, inputs)));
    }
}

let shared: IFCWorkerHandler | undefined;

function sharedHandler(): IFCWorkerHandler {
    shared ??= new IFCWorkerHandler();
    return shared;
}

/**
 * Starts the library in this worker and answers the calls that arrived before it was ready.
 * @param doNotPost - When true, the start is not announced with `ifc-initialised`
 * @param post - Where to announce it; the worker's own `postMessage` when left out
 * @beta
 */
export function initializationComplete(doNotPost?: boolean, post: PostMessage = (message) => postMessage(message)): void {
    sharedHandler().initializationComplete(post, doNotPost);
}

/**
 * Answers one call: runs the method it names, or returns what the same call returned before, and
 * posts the result or the failure back with the call's `uid`.
 * @param data - The call
 * @param post - Where to post the answer
 * @beta
 */
export function onMessageInput(data: DataInput, post: PostMessage): void {
    sharedHandler().onMessageInput(data, post);
}
