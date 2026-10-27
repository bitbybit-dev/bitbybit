import { KernelCallError, messageOf } from "@bitbybit-dev/base";
import type { Inputs, Models } from "@bitbybit-dev/occt";
import type { AsyncFunctionConstructor, CountedPointer, Pointer } from "./design-scripts-types";
import type { OCCTWorkerManager } from "./occ-worker-manager";

const UNSHARED_SHAPES_DELETE = "deleteUnsharedShapes";

function kernelCalls(answered: OCCTWorkerManager["genericCallToWorkerPromise"], path: readonly string[]): unknown {
    const call = (dto: unknown): Promise<unknown> => answered(path.join("."), dto);
    return new Proxy(call, {
        get: (_target, key) => (typeof key === "string" && key !== "then" ? kernelCalls(answered, [...path, key]) : undefined),
    });
}

/**
 * Builds a design document in the worker, runs on this thread the scripts the build lists as pending
 * and builds again with their outcomes, until no script waits or every script has had its turn.
 *
 * Only the last build's shapes reach the caller. Every earlier build's shapes are deleted once the
 * build after it has run, and the shapes the scripts made once the last build has taken them, as a
 * build keeps its own copy of every outcome it is given; on a failure, the last build's shapes too,
 * before it is thrown on. The worker's cache answers an identical call with the same shape, so each
 * is deleted only where every answer that carried it was one of this build's: one the caller or
 * another call was handed too, before the build or while it ran, stays, and so does every shape once
 * the worker's cache has been emptied since the build began. A worker that cannot delete them this
 * way, as one made before it could, keeps them all.
 */
export async function buildWithScripts(manager: OCCTWorkerManager, inputs: Inputs.OCCT.DesignBuildDto<Pointer>): Promise<Models.OCCT.DesignBuildResult<Pointer>> {
    const supplied = inputs.outcomes ?? [];
    const callers = new Set(supplied.map(outcome => outcome.shape.hash));
    const answers = new Map<Pointer["hash"], number>();
    const answered: OCCTWorkerManager["genericCallToWorkerPromise"] = async <T>(functionName: string, dto: unknown): Promise<T> => {
        const answer = await manager.genericCallToWorkerPromise<T>(functionName, dto);
        new Set(shapePointersIn(answer).map(pointer => pointer.hash)).forEach(hash => answers.set(hash, (answers.get(hash) ?? 0) + 1));
        return answer;
    };
    const made: Models.OCCT.DesignSuppliedOutcome<Pointer>[] = [];
    const occt = kernelCalls(answered, []);
    const scripts = scriptFeatures(inputs);
    const rounds = scripts + 1;
    const epoch = scripts === 0 ? undefined : await cacheEpoch(manager);
    const deleteUnshared = (shapes: readonly Pointer[]): Promise<void> => deleteUnsharedShapes(manager, epoch, shapes, answers);
    let held: Pointer[] = [];
    const ours = (): Pointer[] => [...held, ...made.map(outcome => outcome.shape)].filter(pointer => !callers.has(pointer.hash));
    try {
        for (let round = 0; ; round += 1) {
            const outcomes = [...supplied, ...made];
            const result = await answered<Models.OCCT.DesignBuildResult<Pointer>>("design.build", { ...inputs, outcomes });
            const passedOn = new Set(made.map(outcome => outcome.shape.hash));
            const spent = held.filter(pointer => !passedOn.has(pointer.hash));
            const latest = shapePointersIn(result);
            held = [...held, ...latest];
            await deleteUnshared(spent);
            held = held.filter(pointer => !spent.includes(pointer));
            const waiting = (result.pending ?? []).filter(pending => !outcomes.some(outcome => outcome.hash === pending.hash));
            if (waiting.length === 0 || round >= rounds) {
                const returned = new Set(latest.map(pointer => pointer.hash));
                await deleteUnshared(ours().filter(pointer => !returned.has(pointer.hash)));
                return result;
            }
            for (const pending of waiting) {
                made.push(await scriptOutcome(pending, codeOf(inputs.assets, pending.script), occt));
            }
        }
    } catch (error) {
        try {
            await deleteUnshared(ours());
        } catch {
        }
        throw error;
    }
}

async function cacheEpoch(manager: OCCTWorkerManager): Promise<number | undefined> {
    let answer: unknown;
    try {
        answer = await manager.genericCallToWorkerPromise(UNSHARED_SHAPES_DELETE, { shapes: [] });
    } catch (error) {
        if (error instanceof KernelCallError && error.kind === "kernel") {
            return undefined;
        }
        throw error;
    }
    return typeof answer === "object" && answer !== null && "epoch" in answer && typeof answer.epoch === "number" ? answer.epoch : undefined;
}

async function deleteUnsharedShapes(manager: OCCTWorkerManager, epoch: number | undefined, shapes: readonly Pointer[], answers: ReadonlyMap<Pointer["hash"], number>): Promise<void> {
    const distinct = [...new Map(shapes.map(pointer => [pointer.hash, pointer])).values()].flatMap((pointer): CountedPointer[] => {
        const count = answers.get(pointer.hash);
        return count === undefined ? [] : [{ ...pointer, answers: count }];
    });
    if (epoch !== undefined && distinct.length > 0) {
        await manager.genericCallToWorkerPromise(UNSHARED_SHAPES_DELETE, { epoch, shapes: distinct });
    }
}

function shapePointersIn(value: unknown): Pointer[] {
    if (typeof value !== "object" || value === null || ArrayBuffer.isView(value) || value instanceof ArrayBuffer) {
        return [];
    }
    if (isShapePointer(value)) {
        return [value];
    }
    return Object.values(value).flatMap(shapePointersIn);
}

function scriptFeatures(inputs: Inputs.OCCT.DesignBuildDto<Pointer>): number {
    return [inputs.document, ...(inputs.documents ?? [])].reduce((count, document) => count + ("features" in document ? document.features.filter(feature => feature.type === "script").length : 0), 0);
}

function codeOf(assets: Inputs.OCCT.DesignBuildDto<Pointer>["assets"], script: string): string {
    const given = assets === undefined || !Object.prototype.hasOwnProperty.call(assets, script) ? undefined : assets[script];
    if (given === undefined) {
        throw new Error(`The build was given no code for the script asset "${script}".`);
    }
    return typeof given === "string" ? given : new TextDecoder().decode(given instanceof Uint8Array ? given : new Uint8Array(given));
}

function isShapePointer(value: unknown): value is Pointer {
    return typeof value === "object" && value !== null && "hash" in value && "type" in value && (value as { type: unknown }).type === "occ-shape";
}

async function scriptOutcome(pending: Models.OCCT.DesignPendingScript<Pointer>, code: string, occt: unknown): Promise<Models.OCCT.DesignSuppliedOutcome<Pointer>> {
    const AsyncFunction = Object.getPrototypeOf(scriptOutcome).constructor as AsyncFunctionConstructor;
    let made: unknown;
    try {
        made = await new AsyncFunction("inputs", "occt", code)(pending.inputs, occt);
    } catch (error) {
        throw new Error(`The script of "${pending.id}" failed: ${messageOf(error)}`, { cause: error });
    }
    if (isShapePointer(made)) {
        return { hash: pending.hash, shape: made };
    }
    const result = typeof made === "object" && made !== null ? made as { shape?: unknown; roles?: unknown } : {};
    if (!isShapePointer(result.shape)) {
        throw new Error(`The script of "${pending.id}" returned no shape: it returns a shape, or { shape, roles }.`);
    }
    const roles = typeof result.roles === "object" && result.roles !== null ? result.roles as Record<string, number[]> : undefined;
    return { hash: pending.hash, shape: result.shape, ...(roles === undefined ? {} : { roles }) };
}
