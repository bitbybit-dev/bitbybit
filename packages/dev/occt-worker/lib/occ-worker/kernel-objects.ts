import type { KernelObject } from "./kernel-object-types";

function isKernelObject(value: unknown): value is KernelObject {
    return typeof value === "object" && value !== null && (value as Partial<KernelObject>).$$ !== undefined && typeof (value as Partial<KernelObject>).delete === "function";
}

export function kernelObjectsIn(value: unknown, found: Set<KernelObject> = new Set(), seen: Set<object> = new Set()): Set<KernelObject> {
    if (typeof value !== "object" || value === null || seen.has(value) || ArrayBuffer.isView(value) || value instanceof ArrayBuffer) {
        return found;
    }
    seen.add(value);
    if (isKernelObject(value)) {
        found.add(value);
        return found;
    }
    Object.values(value).forEach(item => kernelObjectsIn(item, found, seen));
    return found;
}

export function releaseMadeObjects(made: unknown, given: unknown): void {
    const kept = kernelObjectsIn(given);
    kernelObjectsIn(made).forEach(object => {
        if (kept.has(object)) {
            return;
        }
        try {
            if (!object.isDeleted()) {
                object.delete();
            }
        } catch {
            return;
        }
    });
}
