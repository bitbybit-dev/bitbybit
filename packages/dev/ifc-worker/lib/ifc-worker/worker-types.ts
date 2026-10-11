import type { KernelFailureDetails, KernelFailureKind } from "@bitbybit-dev/base";

/**
 * One call as the worker receives it: the dotted path of the method, its inputs, and the id its
 * answer carries back.
 * @beta
 */
export interface DataInput {
    /**
     * The call itself.
     */
    action: DataAction;
    /**
     * The id the answer is matched by.
     */
    uid: string;
}

/**
 * The method to call and its inputs.
 * @beta
 */
export interface DataAction {
    /**
     * The dotted path of the method, such as `walls.add`.
     */
    functionName: string;
    /**
     * The method's inputs.
     */
    inputs: unknown;
}

/**
 * Where the worker sends its messages.
 * @beta
 */
export type PostMessage = (message: unknown) => void;

/**
 * What the worker thread answers: that it is ready, that it is busy, or the answer to one call.
 * @beta
 */
export type IFCWorkerResponse = "ifc-initialised" | "busy" | IFCCallAnswer;

/**
 * The answer to one call, matched to it by `uid`.
 * @beta
 */
export interface IFCCallAnswer {
    /**
     * The id of the call answered.
     */
    uid: string;
    /**
     * What the call returned.
     */
    result?: unknown;
    /**
     * The failure, when the call failed.
     */
    error?: string;
    /**
     * Whether the inputs or the library were at fault.
     */
    errorKind?: KernelFailureKind;
    /**
     * The stable name of a failure the library named.
     */
    code?: string;
    /**
     * The values a named failure's message names.
     */
    details?: KernelFailureDetails;
    /**
     * Where the failure happened, apart from its message.
     */
    stack?: string;
}

/**
 * A message from the worker as the main thread receives it.
 * @beta
 */
export interface IFCWorkerEvent {
    /**
     * What the worker sent.
     */
    data: IFCWorkerResponse;
}
