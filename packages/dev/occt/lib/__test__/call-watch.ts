import type { Callable, KernelHandle } from "../../../__test__/embind-ledger-types";
import { isHandle, namesOf } from "./kernel-ledger";
import type { CallWatcher, WatchedCall, WatchedRun } from "./lifetime-cases-types";

const isService = (value: unknown): value is object => {
    if (typeof value !== "object" || value === null || isHandle(value) || Array.isArray(value) || ArrayBuffer.isView(value)) {
        return false;
    }
    const prototype: unknown = Object.getPrototypeOf(value);
    return prototype !== null && prototype !== Object.prototype;
};

const namesOfClass = (value: object): string | undefined => (Object.getPrototypeOf(value) as { constructor?: { name?: string } } | null)?.constructor?.name;

const pathTo = (path: string, property: string | symbol): string => typeof property !== "string" ? path : path === "" ? property : `${path}.${property}`;

export function callWatcher(): CallWatcher {
    const proxies = new WeakMap<object, object>();
    const handleNumbers = new Map<KernelHandle, number>();
    let recording: WatchedCall[] | undefined;
    let depth = 0;

    const snapshotOf = (value: unknown, seen: Set<object>): unknown => {
        if (typeof value === "function") {
            return { function: value.name };
        }
        if (typeof value !== "object" || value === null) {
            return value;
        }
        if (isHandle(value)) {
            const number = handleNumbers.get(value) ?? handleNumbers.size;
            handleNumbers.set(value, number);
            return { handle: namesOf([value])[0], number };
        }
        if (value instanceof ArrayBuffer) {
            return { arrayBuffer: value.byteLength, bytes: Array.from(new Uint8Array(value)) };
        }
        if (ArrayBuffer.isView(value)) {
            return { view: value.constructor.name, byteOffset: value.byteOffset, bytes: Array.from(new Uint8Array(value.buffer, value.byteOffset, value.byteLength)) };
        }
        if (seen.has(value)) {
            return { cycle: true };
        }
        const inner = new Set([...seen, value]);
        if (Array.isArray(value)) {
            return { length: value.length, items: Array.from(value, (item: unknown) => snapshotOf(item, inner)) };
        }
        if (value instanceof Map) {
            return { map: [...value].map(([key, item]: [unknown, unknown]) => [snapshotOf(key, inner), snapshotOf(item, inner)]) };
        }
        if (value instanceof Set) {
            return { set: [...value].map((item: unknown) => snapshotOf(item, inner)) };
        }
        const keys = Object.keys(value);
        return { type: namesOfClass(value), keys, fields: keys.map(key => snapshotOf(Reflect.get(value, key), inner)) };
    };

    const watchedCall = (method: Callable, owner: object, path: string): Callable => (...args: unknown[]): unknown => {
        const calls = recording;
        if (calls === undefined || depth > 0) {
            return Reflect.apply(method, owner, args);
        }
        const before = snapshotOf(args, new Set());
        depth += 1;
        try {
            return Reflect.apply(method, owner, args);
        } finally {
            depth -= 1;
            calls.push({ path, before, after: snapshotOf(args, new Set()) });
        }
    };

    const watchedAt = <T extends object>(root: T, path: string): T => {
        const known = proxies.get(root);
        if (known !== undefined) {
            return known as T;
        }
        const proxy = new Proxy<T>(root, {
            get(target, property): unknown {
                const value: unknown = Reflect.get(target, property);
                if (typeof value === "function") {
                    return watchedCall(value as Callable, target, pathTo(path, property));
                }
                return isService(value) ? watchedAt(value, pathTo(path, property)) : value;
            },
        });
        proxies.set(root, proxy);
        return proxy;
    };

    return {
        watched: <T extends object>(root: T): T => watchedAt(root, ""),
        callsDuring: <R>(act: () => R): WatchedRun<R> => {
            const calls: WatchedCall[] = [];
            recording = calls;
            try {
                return { value: act(), calls };
            } finally {
                recording = undefined;
            }
        },
    };
}
