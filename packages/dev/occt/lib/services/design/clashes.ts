import type { TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import type * as Inputs from "../../api/inputs";
import type * as Models from "../../api/models";
import { release } from "../base/release";
import { readKernelException } from "../../kernel-exception";
import type { ClashItem } from "../analysis/clash-types";
import { boxesApart, classifiedStates, meshableSolid, meshErrorFrom, once, pairNeedsMeasuring, placedBox, refinedMeshes, trianglesOf } from "../analysis/clash-candidates";
import { followedBy, movedPoint, rigidInverse } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/matrices";
import { knownBox } from "./boxes";
import type { ClashContext, PlacedPart, ThreadSide } from "./clash-types";
import { beyondThreads, facesInRole } from "./thread-contacts";
import { rounded } from "./section";

const SHARED_VOLUME = 1e-9;
const THREAD_ROLE = "thread";
const END_ROLE = "end";

function pairKey(first: string, second: string): string {
    return first < second ? `${first}\n${second}` : `${second}\n${first}`;
}

function placedOf(built: Models.OCCT.DesignBuildResult<TopoDS_Shape>): PlacedPart[] {
    if (built.components === undefined) {
        return built.parts.map(part => ({ path: part.id, hash: part.shapeHash, shape: part.shape, world: undefined, threads: facesInRole(part.faceNames, THREAD_ROLE), ends: facesInRole(part.faceNames, END_ROLE) }));
    }
    const parts = new Map(built.parts.map(part => [part.id, part]));
    return built.components.flatMap(component => {
        const part = component.part === undefined ? undefined : parts.get(component.part);
        return part === undefined ? [] : [{ path: component.path, hash: part.shapeHash, shape: part.shape, world: component.world, threads: facesInRole(part.faceNames, THREAD_ROLE), ends: facesInRole(part.faceNames, END_ROLE) }];
    });
}

function clashItemOf(entry: PlacedPart, context: ClashContext): ClashItem {
    const local = entry.world === undefined ? undefined : rigidInverse(entry.world);
    return {
        box: once(() => placedBox(knownBox(context.boxes, entry.hash, entry.shape, context.occ), entry.world)),
        meshable: once(() => context.store.meshable(entry.hash, () => meshableSolid(context.occ, entry.shape))),
        mesh: once(() => refinedMeshes(error => context.store.mesh(`${entry.hash}\n${String(error)}`, () => trianglesOf(context.occt.shapeToMesh({ shape: entry.shape, precision: error, adjustYtoZ: false, computeMetadata: false, keepMeshData: false }))), meshErrorFrom(knownBox(context.boxes, entry.hash, entry.shape, context.occ)), entry.world)),
        states: points => classifiedStates(context.occ, entry.shape, local === undefined ? points : points.map(point => movedPoint(local, point))),
    };
}

function pairPrecision(first: PlacedPart, second: PlacedPart, context: ClashContext): number {
    return Math.max(meshErrorFrom(knownBox(context.boxes, first.hash, first.shape, context.occ)), meshErrorFrom(knownBox(context.boxes, second.hash, second.shape, context.occ)));
}

function placedClashes(clashes: readonly Models.OCCT.Clash[], matrix: readonly number[]): Models.OCCT.Clash[] {
    return clashes.map(clash => ({ ...clash, pointA: movedPoint(matrix, clash.pointA), pointB: movedPoint(matrix, clash.pointB) }));
}

function orAfterKernelFailure<T>(context: ClashContext, read: () => T, otherwise: () => T): T {
    try {
        return read();
    } catch (thrown) {
        if (readKernelException(context.occ, thrown) === thrown) {
            throw thrown;
        }
        return otherwise();
    }
}

function isThreaded(first: PlacedPart, second: PlacedPart): boolean {
    return first.threads.length > 0 && second.threads.length > 0;
}

function pairKeyOf(first: PlacedPart, firstInverse: Inputs.Base.TransformMatrix | undefined, second: PlacedPart, clearance: number): string | undefined {
    if (firstInverse === undefined || second.world === undefined) {
        return undefined;
    }
    const relative = followedBy(second.world, firstInverse).map(rounded).join(",");
    const threads = isThreaded(first, second) ? `\n${first.threads.join(",")};${first.ends.join(",")}\n${second.threads.join(",")};${second.ends.join(",")}` : "";
    return `${first.hash}\n${second.hash}\n${String(clearance)}\n${relative}${threads}`;
}

export function clashesOf(built: Models.OCCT.DesignBuildResult<TopoDS_Shape>, clearance: number, context: ClashContext): Models.OCCT.DesignClash[] {
    const joined = new Set((built.joints ?? []).flatMap(joint => joint.to === undefined ? [] : [pairKey(joint.component, joint.to)]));
    const placed = placedOf(built);
    const items = placed.map(entry => clashItemOf(entry, context));
    const copies = new Map<number, TopoDS_Shape>();
    const copyOf = (index: number): TopoDS_Shape => {
        const entry = placed[index]!;
        let copy = copies.get(index);
        if (copy === undefined) {
            copy = entry.world === undefined ? entry.shape : context.occt.transforms.transformByMatrix({ shape: entry.shape, transformation: entry.world });
            copies.set(index, copy);
        }
        return copy;
    };
    const inverses = placed.map(entry => once(() => entry.world === undefined ? undefined : rigidInverse(entry.world)));
    const threadSideOf = (index: number): ThreadSide => ({ shape: copyOf(index), own: placed[index]!.shape, faces: new Set(placed[index]!.threads), ends: new Set(placed[index]!.ends) });
    try {
        return placed.flatMap((first, a) => placed.slice(a + 1).flatMap((second, offset): Models.OCCT.DesignClash[] => {
            const b = a + 1 + offset;
            if (boxesApart(items[a]!.box(), items[b]!.box(), clearance)) {
                return [];
            }
            const needsMeasuring = (): boolean => orAfterKernelFailure(context, () => pairNeedsMeasuring(items[a]!, items[b]!, clearance, precision => context.occt.analysis.clashes.facesWithin({ shapeA: copyOf(a), shapeB: copyOf(b), clearance, precision }).length), () => true);
            const measured = (): Models.OCCT.Clash[] => needsMeasuring()
                ? context.occt.analysis.clashes.betweenShapes({ shapes: [copyOf(a), copyOf(b)], clearance, prefilter: false })
                : [];
            const measure = (): Models.OCCT.Clash[] => isThreaded(first, second)
                ? measured().flatMap(clash => clash.volume <= SHARED_VOLUME ? orAfterKernelFailure(context, () => beyondThreads(clash, [threadSideOf(a), threadSideOf(b)], clearance, pairPrecision(first, second, context), context), () => [clash]) : [clash])
                : measured();
            const inverse = inverses[a]!();
            const key = pairKeyOf(first, inverse, second, clearance);
            const world = first.world;
            const found = key === undefined || world === undefined || inverse === undefined
                ? measure()
                : placedClashes(context.store.pair(key, () => placedClashes(measure(), inverse)), world);
            return found.flatMap((clash): Models.OCCT.DesignClash[] => {
                const components: [string, string] = [first.path, second.path];
                const isJoined = joined.has(pairKey(...components));
                return isJoined && clash.volume <= SHARED_VOLUME ? [] : [{ components, distance: clash.distance, volume: clash.volume, pointA: clash.pointA, pointB: clash.pointB, joined: isJoined }];
            });
        }));
    } finally {
        placed.forEach((entry, index) => {
            const copy = copies.get(index);
            if (copy !== undefined && copy !== entry.shape) {
                release(copy);
            }
        });
    }
}
