import type { DesignCaches } from "./cache-registry-types";

const registered = new WeakMap<object, DesignCaches>();

export function registerDesignCaches(design: object, caches: DesignCaches): void {
    registered.set(design, caches);
}

export function releaseCachesOf(design: object): void {
    const caches = registered.get(design);
    if (caches === undefined) {
        return;
    }
    caches.cache.clear();
    caches.sections.clear();
    caches.boxes.clear();
    caches.clashStore.clear();
}
