import type { ClassHandle } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import type { KernelObjects } from "./release-types";

export function release(object: ClassHandle): void {
    if (!object.isDeleted()) {
        object.delete();
    }
}

export function releasedOnError<T>(objects: readonly ClassHandle[], use: () => T): T {
    try {
        return use();
    } catch (error) {
        objects.forEach(release);
        throw error;
    }
}

export function released<T>(objects: readonly ClassHandle[], use: () => T): T {
    try {
        return use();
    } finally {
        objects.forEach(release);
    }
}

export function kernelObjects(): KernelObjects {
    const owned: ClassHandle[] = [];
    return {
        own: <T extends ClassHandle>(object: T): T => {
            owned.push(object);
            return object;
        },
        releaseAll: (): void => {
            owned.splice(0).forEach(release);
        },
    };
}
