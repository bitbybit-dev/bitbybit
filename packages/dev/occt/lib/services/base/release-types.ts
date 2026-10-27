import type { ClassHandle } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";

export interface KernelObjects {
    readonly own: <T extends ClassHandle>(object: T) => T;
    readonly releaseAll: () => void;
}
