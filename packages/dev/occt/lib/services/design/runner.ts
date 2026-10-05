import { messageOf } from "@bitbybit-dev/base";
import type { TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import type * as Models from "../../api/models";
import type { DesignOutcome } from "./cache";
import { hashText, stableJson } from "./cache";
import type { RebindEntry } from "./hints";
import type { DesignPlan, DesignRun, DesignRunContext, DesignTrace, SketchState } from "./state";
import { bodyKey, isBodyKey, isSketchKey, nameInKey, sketchKey } from "./state";
import { importPlan, localPlan } from "./local-features";
import { scriptPlan, suppliedOutcome } from "./scripts";
import { bodyPlan, operationPlan, sketchPlan, sweepPlan } from "./steps";
import { DesignPending, DesignProblem, isKernelTrap, pointer } from "./problems";
import { readKernelException } from "../../kernel-exception";
import { buildParts } from "./parts";
import type { ParameterChoice } from "./values";
import { parameterValues, parametersIn, truthOf } from "./values";

type Feature = Models.OCCT.DesignFeature;

function drawsNothing(sketch: SketchState | undefined, run: DesignRun): boolean {
    return sketch !== undefined && run.occ.CountSubShapes(sketch.shape, run.occ.TopAbs_ShapeEnum.EDGE, false) === 0;
}

function describeKey(key: string): string {
    const split = key.indexOf(":");
    return `${key.slice(0, split)} "${key.slice(split + 1)}"`;
}

function writesOf(feature: Feature): string {
    switch (feature.type) {
        case "sketch":
            return sketchKey(feature.id);
        case "import":
            return bodyKey(feature.id);
        case "extrude":
        case "revolve":
        case "sweep":
        case "loft":
        case "operation":
        case "script":
            return bodyKey(feature.body ?? feature.id);
        default:
            return bodyKey(feature.body);
    }
}

function planOf(feature: Feature, path: string, run: DesignRun): DesignPlan {
    switch (feature.type) {
        case "sketch":
            return sketchPlan(feature, path, run);
        case "extrude":
        case "revolve":
        case "sweep":
        case "loft":
            return sweepPlan(feature, path, run);
        case "shell":
        case "hole":
        case "pushPull":
        case "boss":
        case "pocket":
            return localPlan(feature, path, run);
        case "import":
            return importPlan(feature, path, run);
        case "operation":
            return operationPlan(feature, path, run);
        case "script":
            return scriptPlan(feature, path, run);
        default:
            return bodyPlan(feature, path, run);
    }
}

function parametersUsed(feature: Feature, parameters: DesignRun["parameters"]): string {
    return [...parametersIn(feature, parameters)].sort().map(name => `${name}=${JSON.stringify(parameters.get(name))}`).join(",");
}

interface KeyState {
    hash: string;
    reads: Set<string>;
}

function stateOf(key: string, run: DesignRun): KeyState {
    return isBodyKey(key) ? run.bodies.get(nameInKey(key))! : run.sketches.get(nameInKey(key))!;
}

function readsOf(feature: Feature, plan: DesignPlan, run: DesignRun): Set<string> {
    return new Set([...parametersIn(feature, run.parameters), ...plan.reads.flatMap(key => [...stateOf(key, run).reads])]);
}

function hashOf(feature: Feature, plan: DesignPlan, run: DesignRun): string {
    const inputs = plan.reads.map(key => stateOf(key, run).hash);
    return hashText([stableJson(feature), parametersUsed(feature, run.parameters), plan.salt ?? "", `rebind:${run.rebinding.mode}`, ...inputs].join("\n"));
}

function reportMessageOf(error: unknown): string {
    if (error instanceof DesignProblem) {
        return `${error.path}: ${error.message}`;
    }
    return messageOf(error);
}

function usedUp(feature: Feature): string[] {
    return feature.type === "boolean" ? feature.tools : [];
}

function fail(feature: Feature, writes: string, run: DesignRun, reason: "failed" | "suppressed" | "pending"): void {
    run.failed.set(writes, reason);
    if (isSketchKey(writes)) {
        run.sketches.delete(feature.id);
        return;
    }
    const name = nameInKey(writes);
    run.bodies.delete(name);
    run.owners.set(feature.id, name);
    usedUp(feature).forEach(tool => run.bodies.delete(tool));
}

function makesItsOwn(feature: Feature): boolean {
    switch (feature.type) {
        case "sketch":
        case "import":
            return true;
        case "extrude":
        case "revolve":
        case "sweep":
        case "loft":
        case "operation":
        case "script":
            return feature.body === undefined;
        default:
            return false;
    }
}

function apply(feature: Feature, writes: string, outcome: DesignOutcome, hash: string, reads: Set<string>, run: DesignRun): void {
    run.failed.delete(writes);
    if (outcome.kind === "sketch") {
        const face = feature.type === "sketch" && "face" in feature.on ? feature.on.face : undefined;
        run.sketches.set(feature.id, { shape: outcome.shape, commands: outcome.commands, normal: outcome.normal, frame: outcome.frame, hash, reads, face });
        return;
    }
    const name = nameInKey(writes);
    run.bodies.set(name, { shape: outcome.shape, names: outcome.names, hash, reads });
    if (!run.order.includes(name)) {
        run.order.push(name);
    }
    run.owners.set(feature.id, name);
    const tools = usedUp(feature);
    tools.forEach(tool => run.bodies.delete(tool));
    run.owners.forEach((owner, id) => {
        if (tools.includes(owner)) {
            run.owners.set(id, name);
        }
    });
}

function withRebinds(report: Models.OCCT.DesignFeatureReport, entries: readonly RebindEntry[]): Models.OCCT.DesignFeatureReport {
    const rebound = entries.filter(entry => entry.kind === "rebound");
    const repairs = entries.filter(entry => entry.kind === "repair");
    return {
        ...report,
        status: report.status === "ok" && rebound.length > 0 ? "rebound" : report.status,
        messages: [...report.messages, ...rebound.map(entry => `${entry.path}: its faces were lost, and it took faces ${entry.faces.join(", ")}, the most like its hint (score ${entry.score})`)],
        ...(report.status === "failed" && repairs.length > 0 ? { repairs: repairs.map(entry => ({ path: entry.path, faces: entry.faces, score: entry.score, clear: entry.clear === true })) } : {}),
    };
}

function step(feature: Feature, path: string, run: DesignRun): Models.OCCT.DesignFeatureReport {
    const started = performance.now();
    const before = run.rebinding.entries.length;
    const report: Models.OCCT.DesignFeatureReport = { id: feature.id, type: feature.type, status: "ok", ms: 0, cached: false, messages: [] };
    const writes = writesOf(feature);
    let hash = "";
    try {
        if (feature.suppressed !== undefined && truthOf(feature.suppressed, run.parameters, pointer(path, "suppressed"))) {
            report.status = "suppressed";
            run.suppressed.add(feature.id);
            if (makesItsOwn(feature)) {
                fail(feature, writes, run, "suppressed");
            } else {
                parametersIn(feature.suppressed, run.parameters).forEach(name => run.bodies.get(nameInKey(writes))?.reads.add(name));
            }
        } else {
            const plan = planOf(feature, path, run);
            const missing = plan.reads.find(key => run.failed.has(key));
            const blank = plan.reads.find(key => isSketchKey(key) && drawsNothing(run.sketches.get(nameInKey(key)), run));
            if (missing === undefined && blank !== undefined) {
                throw new DesignProblem(path, `${describeKey(blank)} draws nothing yet`);
            }
            if (missing === undefined) {
                hash = hashOf(feature, plan, run);
                let outcome = run.cache.take(hash);
                report.cached = outcome !== undefined;
                if (outcome === undefined) {
                    const supplied = isBodyKey(writes) ? run.supplied.get(hash) : undefined;
                    const made = supplied === undefined ? plan.make() : suppliedOutcome(feature, supplied, path, run);
                    const rebinds = run.rebinding.entries.slice(before);
                    outcome = rebinds.length === 0 ? made : { ...made, rebinds };
                    run.cache.keep(hash, outcome);
                } else if (outcome.rebinds !== undefined) {
                    run.rebinding.entries.push(...outcome.rebinds);
                }
                run.used.add(hash);
                apply(feature, writes, outcome, hash, readsOf(feature, plan, run), run);
            } else {
                const reason = run.failed.get(missing)!;
                report.status = "skipped";
                report.messages.push(`${describeKey(missing)} ${reason === "suppressed" ? "was suppressed" : reason === "pending" ? "waits for its outcome" : "failed earlier"}`);
                fail(feature, writes, run, reason);
            }
        }
    } catch (error) {
        if (isKernelTrap(error)) {
            throw error;
        }
        if (error instanceof DesignPending) {
            report.status = "pending";
            report.messages.push("its script has not run: the caller runs it and builds again with its outcome");
            run.pending.push({ ...error.pending, hash });
            fail(feature, writes, run, "pending");
        } else {
            report.status = "failed";
            report.messages.push(reportMessageOf(readKernelException(run.occ, error)));
            fail(feature, writes, run, "failed");
        }
    }
    report.ms = performance.now() - started;
    return withRebinds(report, run.rebinding.entries.slice(before));
}

/** A run of a part document's features, and the report of each feature. */
export interface FeaturesRun {
    run: DesignRun;
    report: Models.OCCT.DesignFeatureReport[];
}

/**
 * A run of a checked document's features: its parameters with the chosen configuration and
 * overrides, then each feature in order. A feature that fails or is suppressed takes the body or
 * sketch it makes with it, and every feature that reads that one is skipped, so one fault never
 * stops the rest. With `trace`, each feature records what it resolved.
 */
export function runFeatures(document: Models.OCCT.DesignPartDocument, choice: ParameterChoice, context: DesignRunContext, trace?: Map<string, DesignTrace>): FeaturesRun {
    const derived = new Map<string, readonly string[]>();
    const run: DesignRun = {
        ...context,
        parameters: parameterValues(document.parameters, document.configurations, choice, derived),
        derived,
        bodies: new Map(),
        sketches: new Map(),
        failed: new Map(),
        suppressed: new Set(),
        owners: new Map(),
        declaredAssets: document.assets ?? [],
        order: [],
        used: context.used ?? new Set(),
        trace,
        rebinding: { mode: context.rebind ?? "never", entries: [], hints: context.hints },
        supplied: new Map((context.outcomes ?? []).map(outcome => [outcome.hash, outcome])),
        pending: [],
    };
    const report = document.features.map((feature, index) => step(feature, pointer("/features", index), run));
    return { run, report };
}

/** The units and up axis a document's build reports: the document's, with the defaults filled in. */
export function framingOf(document: Pick<Models.OCCT.DesignPartDocument, "units" | "up">): Pick<Models.OCCT.DesignBuildResult<TopoDS_Shape>, "units" | "up"> {
    return { units: { length: document.units?.length ?? "mm", angle: "deg" }, up: document.up ?? "y" };
}

/**
 * Builds a checked document: its features as `runFeatures` runs them, then its parts. Outcomes are
 * kept in the cache by what they were made from; the parts handed back hold new handles the caller
 * owns.
 */
export function runDesign(document: Models.OCCT.DesignPartDocument, choice: ParameterChoice, context: DesignRunContext): Models.OCCT.DesignBuildResult<TopoDS_Shape> {
    const { run, report } = runFeatures(document, choice, context);
    if (context.used === undefined) {
        run.cache.trim(run.used);
    }
    const issues: Models.OCCT.DesignIssue[] = [];
    const before = run.rebinding.entries.length;
    const parts = buildParts(document, run, issues);
    run.rebinding.entries.slice(before).forEach(entry => issues.push({
        path: entry.path,
        message: entry.kind === "rebound"
            ? `its faces were lost, and it took faces ${entry.faces.join(", ")}, the most like its hint (score ${entry.score})`
            : `faces ${entry.faces.join(", ")} are the most like its hint (score ${entry.score}); ${entry.clear === true ? "a build with rebind \"report\" takes them" : "they do not stand clear of the others, so no build takes them"}`,
    }));
    const parameters = Object.fromEntries([...run.parameters].filter(([name]) => name !== "configuration"));
    return {
        parts,
        report,
        issues,
        ...(choice.configuration === undefined ? {} : { configuration: choice.configuration }),
        parameters,
        ...framingOf(document),
        ...(run.pending.length === 0 ? {} : { pending: run.pending }),
        ...(context.sketches === true ? { sketches: builtSketches(document, run) } : {}),
    };
}

function builtSketches(document: Models.OCCT.DesignPartDocument, run: DesignRun): Models.OCCT.DesignBuiltSketch<TopoDS_Shape>[] {
    return document.features.flatMap(feature => {
        const state = feature.type === "sketch" ? run.sketches.get(feature.id) : undefined;
        return state === undefined || feature.type !== "sketch" ? [] : [{
            id: feature.id,
            shape: state.shape.clone(),
            face: run.occ.CountSubShapes(state.shape, run.occ.TopAbs_ShapeEnum.FACE, false) > 0,
            frame: state.frame,
            commands: state.commands.map(command => command ?? null),
        }];
    });
}
