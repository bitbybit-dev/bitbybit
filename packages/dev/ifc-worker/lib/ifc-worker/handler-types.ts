import type { IfcModel } from "@bitbybit-dev/ifc";
import type { DataInput, PostMessage } from "./worker-types";

export interface HeldCall {
    readonly call: DataInput;
    readonly answer: PostMessage;
}

export interface PendingCall {
    readonly functionName: string;
    readonly resolve: (value: unknown) => void;
    readonly reject: (reason?: unknown) => void;
}

export interface CachedModel {
    readonly kind: "model";
    readonly model: IfcModel;
}

export interface CachedValue {
    readonly kind: "value";
    readonly value: unknown;
}

export type CachedResult = CachedModel | CachedValue;
