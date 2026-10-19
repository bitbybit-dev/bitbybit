import type { ClassHandle, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import type * as Models from "../../api/models";
import { release } from "../base/release";

function isKernelObject(value: unknown): value is ClassHandle {
    return typeof value === "object" && value !== null && typeof Reflect.get(value, "isDeleted") === "function" && typeof Reflect.get(value, "delete") === "function";
}

function releaseWithin(value: unknown): void {
    if (isKernelObject(value)) {
        release(value);
    } else if (Array.isArray(value)) {
        value.forEach(releaseWithin);
    } else if (typeof value === "object" && value !== null) {
        Object.values(value).forEach(releaseWithin);
    }
}

export function releasePending(pending: readonly Models.OCCT.DesignPendingScript<TopoDS_Shape>[]): void {
    pending.forEach(waiting => releaseWithin(waiting.inputs));
}

export function releaseBuild(built: Models.OCCT.DesignBuildResult<TopoDS_Shape>): void {
    built.parts.forEach(part => release(part.shape));
    built.structure?.parts.forEach(part => release(part.shape));
    built.structure?.partUpdates?.forEach(update => releaseWithin(update.shape));
    built.sketches?.forEach(sketch => release(sketch.shape));
    releasePending(built.pending ?? []);
}
