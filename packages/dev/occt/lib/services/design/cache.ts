import { TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import type { RebindEntry } from "./hints";
import { FaceNames } from "./names";

/** What one feature made: a body with its face names, or a sketch with the command each edge was drawn by and the way it faces. */
export type DesignOutcome = (
    | { kind: "body"; shape: TopoDS_Shape; names: FaceNames }
    | { kind: "sketch"; shape: TopoDS_Shape; commands: (string | undefined)[]; normal: [number, number, number] }
) & { rebinds?: readonly RebindEntry[] };

/** Frees a shape the cache or a feature owns, once. */
export function release(shape: TopoDS_Shape): void {
    if (!shape.isDeleted()) {
        shape.delete();
    }
}

/** What `use` gives, made with a new `shape` it may keep; when it throws instead, `shape` is freed first. */
export function releasedOnError<T>(shape: TopoDS_Shape, use: () => T): T {
    try {
        return use();
    } catch (error) {
        release(shape);
        throw error;
    }
}

/**
 * What features made, by the hash of what they were made from, so a build that meets the same
 * feature with the same inputs again reuses the shape. It owns every shape it holds and frees the
 * least recently used beyond `capacity` when a build ends, never one that build used.
 */
export class DesignCache {
    private readonly entries = new Map<string, DesignOutcome>();

    constructor(readonly capacity: number) {}

    /** How many outcomes it holds. */
    get size(): number {
        return this.entries.size;
    }

    /** The outcome made under `hash`, now the most recently used, or undefined. */
    take(hash: string): DesignOutcome | undefined {
        const found = this.entries.get(hash);
        if (found !== undefined) {
            this.entries.delete(hash);
            this.entries.set(hash, found);
        }
        return found;
    }

    /** Keeps `outcome` under `hash`; the cache owns its shape from now on. */
    keep(hash: string, outcome: DesignOutcome): void {
        this.entries.set(hash, outcome);
    }

    /** Frees the least recently used outcomes until at most `capacity` remain, keeping those in `inUse`. */
    trim(inUse: ReadonlySet<string>): void {
        for (const [hash, outcome] of this.entries) {
            if (this.entries.size <= this.capacity) {
                return;
            }
            if (!inUse.has(hash)) {
                this.entries.delete(hash);
                release(outcome.shape);
            }
        }
    }

    /** Drops every outcome without freeing it, for a kernel that trapped and can no longer be asked to free anything. */
    forget(): void {
        this.entries.clear();
    }

    /** Frees every outcome. */
    clear(): void {
        this.entries.forEach(outcome => release(outcome.shape));
        this.entries.clear();
    }
}

/** JSON with every object's keys in order, so equal values always read the same. */
export function stableJson(value: unknown): string {
    if (Array.isArray(value)) {
        return `[${value.map(stableJson).join(",")}]`;
    }
    if (typeof value === "object" && value !== null) {
        const record = value as Record<string, unknown>;
        return `{${Object.keys(record).sort().filter(key => record[key] !== undefined).map(key => `${JSON.stringify(key)}:${stableJson(record[key])}`).join(",")}}`;
    }
    return JSON.stringify(value) ?? "null";
}

/** A 53-bit cyrb53 hash of `bytes`, in base 36, as `hashText` hashes text. */
export function hashBytes(bytes: Uint8Array): string {
    let first = 0xdeadbeef;
    let second = 0x41c6ce57;
    for (let index = 0; index < bytes.length; index++) {
        const code = bytes[index]!;
        first = Math.imul(first ^ code, 2654435761);
        second = Math.imul(second ^ code, 1597334677);
    }
    first = Math.imul(first ^ (first >>> 16), 2246822507) ^ Math.imul(second ^ (second >>> 13), 3266489909);
    second = Math.imul(second ^ (second >>> 16), 2246822507) ^ Math.imul(first ^ (first >>> 13), 3266489909);
    return (4294967296 * (2097151 & second) + (first >>> 0)).toString(36);
}

/** A 53-bit cyrb53 hash of `text`, in base 36. */
export function hashText(text: string): string {
    let first = 0xdeadbeef;
    let second = 0x41c6ce57;
    for (let index = 0; index < text.length; index++) {
        const code = text.charCodeAt(index);
        first = Math.imul(first ^ code, 2654435761);
        second = Math.imul(second ^ code, 1597334677);
    }
    first = Math.imul(first ^ (first >>> 16), 2246822507) ^ Math.imul(second ^ (second >>> 13), 3266489909);
    second = Math.imul(second ^ (second >>> 16), 2246822507) ^ Math.imul(first ^ (first >>> 13), 3266489909);
    return (4294967296 * (2097151 & second) + (first >>> 0)).toString(36);
}
