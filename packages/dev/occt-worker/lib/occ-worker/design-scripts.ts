import { messageOf } from "@bitbybit-dev/base";
import type { Inputs, Models } from "@bitbybit-dev/occt";
import type { OCCTWorkerManager } from "./occ-worker-manager";

type AsyncFunctionConstructor = new (...parameters: string[]) => (...values: unknown[]) => Promise<unknown>;

function kernelCalls(manager: OCCTWorkerManager, path: readonly string[]): unknown {
    const call = (dto: unknown): Promise<unknown> => manager.genericCallToWorkerPromise(path.join("."), dto);
    return new Proxy(call, {
        get: (_target, key) => (typeof key === "string" && key !== "then" ? kernelCalls(manager, [...path, key]) : undefined),
    });
}

/**
 * Builds a design document in the worker, runs on this thread the scripts the build lists as pending
 * and builds again with their outcomes, until no script waits or every script has had its turn.
 */
export async function buildWithScripts(manager: OCCTWorkerManager, inputs: Inputs.OCCT.DesignBuildDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Models.OCCT.DesignBuildResult<Inputs.OCCT.TopoDSShapePointer>> {
    const outcomes = [...(inputs.outcomes ?? [])];
    const occt = kernelCalls(manager, []);
    const rounds = scriptFeatures(inputs) + 1;
    for (let round = 0; ; round += 1) {
        const result = await manager.genericCallToWorkerPromise<Models.OCCT.DesignBuildResult<Inputs.OCCT.TopoDSShapePointer>>("design.build", { ...inputs, outcomes: [...outcomes] });
        const waiting = (result.pending ?? []).filter(pending => !outcomes.some(outcome => outcome.hash === pending.hash));
        if (waiting.length === 0 || round >= rounds) {
            return result;
        }
        for (const pending of waiting) {
            outcomes.push(await scriptOutcome(pending, codeOf(inputs.assets, pending.script), occt));
        }
    }
}

function scriptFeatures(inputs: Inputs.OCCT.DesignBuildDto<Inputs.OCCT.TopoDSShapePointer>): number {
    return [inputs.document, ...(inputs.documents ?? [])].reduce((count, document) => count + ("features" in document ? document.features.filter(feature => feature.type === "script").length : 0), 0);
}

function codeOf(assets: Inputs.OCCT.DesignBuildDto<Inputs.OCCT.TopoDSShapePointer>["assets"], script: string): string {
    const given = assets === undefined || !Object.prototype.hasOwnProperty.call(assets, script) ? undefined : assets[script];
    if (given === undefined) {
        throw new Error(`The build was given no code for the script asset "${script}".`);
    }
    return typeof given === "string" ? given : new TextDecoder().decode(given instanceof Uint8Array ? given : new Uint8Array(given));
}

function isShapePointer(value: unknown): value is Inputs.OCCT.TopoDSShapePointer {
    return typeof value === "object" && value !== null && "hash" in value && "type" in value && (value as { type: unknown }).type === "occ-shape";
}

async function scriptOutcome(pending: Models.OCCT.DesignPendingScript<Inputs.OCCT.TopoDSShapePointer>, code: string, occt: unknown): Promise<Models.OCCT.DesignSuppliedOutcome<Inputs.OCCT.TopoDSShapePointer>> {
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
