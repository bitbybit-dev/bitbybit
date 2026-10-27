import type { DesignCache } from "./cache";
import type { ClashStore } from "./clash-store";

export interface DesignCaches {
    readonly cache: DesignCache;
    readonly sections: DesignCache;
    readonly boxes: Map<string, readonly number[]>;
    readonly clashStore: ClashStore;
}
