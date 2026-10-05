import type { TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import type * as Inputs from "../../api/inputs";
import type * as Models from "../../api/models";
import { release, stableJson } from "./cache";
import type { BaseBitByBit } from "../../base";
import type { Matrix } from "./placement";
import { frameMatrix, jointMatrix, movedFrame, squaredFrame } from "./placement";
import type { DesignLibrary, LibraryEntry } from "./library";
import { sourceEntry, versionIn } from "./library";
import { connectorIdsOf } from "./connectors";
import { DesignProblem, pointer } from "./problems";
import { framingOf, runDesign } from "./runner";
import { ROOT_NODE, structurePartOf, withProperties } from "./export-structure";
import type { DesignRunContext } from "./state";
import type { DesignValues, ParameterChoice } from "./values";
import { directionOf, formatNumber, isExpressionObject, numberOf, parameterTypeOf, parameterValues, pointOf, propertyValue, textOf, truthOf, valueOf } from "./values";

type Built = Models.OCCT.DesignBuildResult<TopoDS_Shape>;
type Part = Models.OCCT.DesignBuiltPart<TopoDS_Shape>;

/** The documents a build is given beside the one it builds: `validate` has checked that each source names one of them. */
export type BuildLibrary = DesignLibrary<Models.OCCT.DesignDocument>;

function sourceDocument(library: BuildLibrary, source: Models.OCCT.DesignComponentSource): LibraryEntry<Models.OCCT.DesignDocument> {
    return sourceEntry(library, source.document, source.version, "");
}


/** The most occurrences one build places through every level; a sub-assembly placed many times counts all it holds each time. */
export const MAX_OCCURRENCES = 100_000;

interface GatheredJoint {
    joint: Omit<Models.OCCT.DesignBuiltJoint, "frame">;
    local: Inputs.Base.Frame;
    parent: string | undefined;
}

interface Gathered {
    context: DesignRunContext;
    library: BuildLibrary;
    builds: Map<string, Built>;
    parts: Map<string, Part>;
    components: Models.OCCT.DesignBuiltComponent[];
    products: Map<string, Record<string, string | number | boolean>>;
    joints: GatheredJoint[];
    report: Models.OCCT.DesignFeatureReport[];
    issues: Models.OCCT.DesignIssue[];
}

type Connectors = ReadonlyMap<string, Inputs.Base.Frame>;

type Placing = { joint: Models.OCCT.DesignJoint; path: string };

function replicaJoint(component: Models.OCCT.DesignComponent, replicate: Models.OCCT.DesignReplicate, id: string, connector: string): Models.OCCT.DesignJoint {
    return {
        id, type: "fastened", component: component.id, connector: replicate.connector, to: { component: replicate.to.component, connector },
        ...(replicate.flip === undefined ? {} : { flip: replicate.flip }),
        ...(replicate.angle === undefined ? {} : { angle: replicate.angle }),
        ...(replicate.offset === undefined ? {} : { offset: replicate.offset }),
    };
}

function jointsByComponent(document: Models.OCCT.DesignAssemblyDocument): Map<string, Placing> {
    const replicated = document.components.flatMap((component, index): [string, Placing][] => component.replicate === undefined ? [] : [[component.id, { joint: replicaJoint(component, component.replicate, component.id, component.replicate.to.connector), path: pointer("/components", index, "replicate") }]]);
    return new Map([...(document.joints ?? []).map((joint, index): [string, Placing] => [joint.component, { joint, path: pointer("/joints", index) }]), ...replicated]);
}

function membersOf(connectors: Connectors | undefined, name: string): string[] {
    const ids = [...(connectors?.keys() ?? [])];
    return ids.includes(name) ? [name] : ids.filter(id => id.startsWith(`${name}.`));
}

function frameOf(frame: Models.OCCT.DesignFrame, parameters: DesignValues, path: string, base: BaseBitByBit): Inputs.Base.Frame {
    const normal = directionOf(frame.normal, parameters, pointer(path, "normal"));
    const direction = directionOf(frame.direction, parameters, pointer(path, "direction"));
    const origin = pointOf(frame.origin, parameters, pointer(path, "origin"));
    if (squaredFrame(origin, normal, direction, base) === undefined) {
        throw new DesignProblem(pointer(path, "direction"), "the direction lies along the normal: the x axis needs a direction across it");
    }
    return { origin, normal, direction };
}

function replicasOf(component: Models.OCCT.DesignComponent, document: Models.OCCT.DesignAssemblyDocument, library: BuildLibrary): number {
    const replicate = component.replicate;
    const target = replicate === undefined ? undefined : document.components.find(other => other.id === replicate.to.component);
    if (replicate === undefined || target === undefined) {
        return 1;
    }
    const placed = sourceDocument(library, target.source).document;
    const ids = placed.kind === "assembly" ? (placed.connectors ?? []).map(connector => connector.id) : connectorIdsOf(placed.parts?.find(part => part.id === target.source.part), placed);
    return Math.max(1, ids.filter(id => id === replicate.to.connector || id.startsWith(`${replicate.to.connector}.`)).length);
}

function occurrencesOf(document: Models.OCCT.DesignAssemblyDocument, library: BuildLibrary, counted: Map<number, number>): number {
    let total = 0;
    for (const component of document.components) {
        const entry = sourceDocument(library, component.source);
        const source = entry.document;
        const replicas = replicasOf(component, document, library);
        if (source.kind === "assembly") {
            let inner = counted.get(entry.index);
            if (inner === undefined) {
                inner = occurrencesOf(source, library, counted);
                counted.set(entry.index, inner);
            }
            total += replicas * (1 + inner);
        } else {
            total += replicas;
        }
        if (total > MAX_OCCURRENCES) {
            return total;
        }
    }
    return total;
}

/** The components in an order that places every joint's target before the component it moves; `validate` has refused joints that close a loop. */
export function placementOrder(components: readonly Models.OCCT.DesignComponent[], moving: ReadonlyMap<string, Placing>): number[] {
    const order: number[] = [];
    const seen = new Set<string>();
    const indexOf = new Map(components.map((component, index) => [component.id, index]));
    components.forEach((_, start) => {
        const chain: number[] = [];
        let index: number | undefined = start;
        while (index !== undefined && !seen.has(components[index]!.id)) {
            const component: Models.OCCT.DesignComponent = components[index]!;
            seen.add(component.id);
            chain.push(index);
            const to = moving.get(component.id)?.joint.to;
            index = to !== undefined && "component" in to ? indexOf.get(to.component) : undefined;
        }
        order.push(...chain.reverse());
    });
    return order;
}

function overridesOf(source: Models.OCCT.DesignComponentSource, declared: Readonly<Record<string, unknown>> | undefined, parameters: DesignValues, path: string): Record<string, number | string | boolean> {
    return Object.fromEntries(Object.entries(source.parameters ?? {}).map(([name, value]) => {
        const at = pointer(path, "parameters", name);
        const type = parameterTypeOf(declared?.[name]);
        if (type === "text" || type === "choice") {
            return [name, typeof value === "number" || typeof value === "boolean" ? value : textOf(value, parameters, at)];
        }
        if (isExpressionObject(value)) {
            throw new DesignProblem(at, `"${name}" is a ${type} parameter: give a number, a boolean or an expression, and keep { expr } for text`);
        }
        return [name, valueOf(value, parameters, at)];
    }));
}

function inSource<T>(path: string, run: () => T): T {
    try {
        return run();
    } catch (error) {
        if (error instanceof DesignProblem) {
            throw new DesignProblem(pointer(path, "parameters"), `${error.path}: ${error.message}`);
        }
        throw error;
    }
}

const VERSION_MARK_LENGTH = 8;

interface BuiltPart {
    part: Part;
    cached: boolean;
    messages: string[];
}

function builtPart(document: Models.OCCT.DesignPartDocument, index: number, version: string, revisions: number, source: Models.OCCT.DesignComponentSource, overrides: Record<string, number | string | boolean>, gathered: Gathered, path: string): BuiltPart {
    const choice = { configuration: source.configuration, overrides };
    const values = inSource(path, () => parameterValues(document.parameters, document.configurations, choice));
    const variant = stableJson({ document: source.document, version, configuration: source.configuration, values: Object.fromEntries([...values].filter(([name]) => name !== "configuration")) });
    let built = gathered.builds.get(variant);
    const cached = built !== undefined;
    if (built === undefined) {
        const made = inSource(path, () => runDesign(document, choice, gathered.context));
        made.issues.forEach(issue => gathered.issues.push({ path: `${pointer("/documents", index)}${issue.path}`, message: issue.message }));
        gathered.builds.set(variant, made);
        built = made;
    }
    const messages = built.report.filter(entry => entry.status === "failed").map(entry => `feature "${entry.id}" failed: ${entry.messages.join("; ")}`);
    const found = built.parts.find(part => part.id === source.part);
    if (found === undefined) {
        throw new DesignProblem(pointer(path, "part"), `the part "${source.part}" was not built${messages.length > 0 ? `: ${messages.join("; ")}` : ""}`);
    }
    const id = revisions > 1 ? `${found.id}-${found.itemKey}-${version.slice(0, VERSION_MARK_LENGTH)}` : `${found.id}-${found.itemKey}`;
    if (!gathered.parts.has(id)) {
        const partNumber = found.properties["partNumber"];
        const sharing = partNumber === undefined ? undefined : [...gathered.parts.values()].find(other => other.properties["partNumber"] === partNumber);
        if (sharing !== undefined) {
            gathered.issues.push({ path: pointer(path, "part"), message: `"${id}" and "${sharing.id}" are different parts with the part number ${JSON.stringify(partNumber)}: its template needs the values that tell them apart` });
        }
        gathered.parts.set(id, { ...found, id, document: source.document });
    }
    return { part: gathered.parts.get(id)!, cached, messages };
}

function targetOf(placing: Placing | undefined, placed: ReadonlyMap<string, Connectors>, parameters: DesignValues, base: BaseBitByBit): Inputs.Base.Frame | undefined {
    if (placing === undefined) {
        return undefined;
    }
    const { joint } = placing;
    const path = placing.path;
    if ("frame" in joint.to) {
        return frameOf(joint.to.frame, parameters, pointer(path, "to", "frame"), base);
    }
    const other = placed.get(joint.to.component);
    if (other === undefined) {
        throw new DesignProblem(pointer(path, "to", "component"), `the component "${joint.to.component}" was not placed, so nothing can be joined to it`);
    }
    const found = other.get(joint.to.connector);
    if (found === undefined) {
        throw new DesignProblem(pointer(path, "to", "connector"), `the connector "${joint.to.connector}" of "${joint.to.component}" was not placed in this build`);
    }
    return found;
}

interface JointValues {
    angle: number;
    offset: number;
    limits: Models.OCCT.DesignBuiltJoint["limits"];
}

function jointValues(placing: Placing, parameters: DesignValues): JointValues {
    const { joint } = placing;
    const path = placing.path;
    const values = {
        angle: joint.angle === undefined ? 0 : numberOf(joint.angle, parameters, pointer(path, "angle")),
        offset: joint.offset === undefined ? 0 : numberOf(joint.offset, parameters, pointer(path, "offset")),
    };
    const limits: Models.OCCT.DesignBuiltJoint["limits"] = {};
    for (const key of ["angle", "offset"] as const) {
        const range = joint.limits?.[key];
        if (range === undefined) {
            continue;
        }
        const least = numberOf(range[0], parameters, pointer(path, "limits", key, 0));
        const most = numberOf(range[1], parameters, pointer(path, "limits", key, 1));
        if (least > most) {
            throw new DesignProblem(pointer(path, "limits", key), `the least, ${formatNumber(least)}, is more than the most, ${formatNumber(most)}`);
        }
        if (values[key] < least || values[key] > most) {
            throw new DesignProblem(pointer(path, key), `${formatNumber(values[key])} is outside the joint's limits, ${formatNumber(least)} to ${formatNumber(most)}`);
        }
        limits[key] = [least, most];
    }
    return { ...values, limits };
}

interface Placement {
    matrix: Matrix;
    values?: JointValues;
}

function placementOf(component: Models.OCCT.DesignComponent, own: Connectors, placing: Placing | undefined, target: Inputs.Base.Frame | undefined, parameters: DesignValues, path: string, base: BaseBitByBit): Placement {
    if (component.at !== undefined) {
        return { matrix: frameMatrix(frameOf(component.at, parameters, pointer(path, "at"), base), base) };
    }
    if (placing === undefined || target === undefined) {
        return { matrix: base.transforms.identity() };
    }
    const { joint } = placing;
    const connector = own.get(joint.connector);
    if (connector === undefined) {
        throw new DesignProblem(pointer(placing.path, "connector"), `the connector "${joint.connector}" was not placed in this build`);
    }
    const values = jointValues(placing, parameters);
    return { matrix: jointMatrix(connector, target, joint.flip === true, values.angle, values.offset, base), values };
}

function moved(matrix: Matrix, connectors: Connectors, base: BaseBitByBit): Connectors {
    return new Map([...connectors].map(([id, frame]) => [id, movedFrame(matrix, frame, base)]));
}

function propertiesOf(properties: Models.OCCT.DesignProperties | undefined, parameters: DesignValues, path: string, gathered: Gathered): Record<string, string | number | boolean> {
    return Object.fromEntries(Object.entries(properties ?? {}).flatMap(([name, value]) => {
        try {
            return [[name, propertyValue(value, parameters, pointer(path, "properties", name))] as const];
        } catch (error) {
            if (!(error instanceof DesignProblem)) {
                throw error;
            }
            gathered.issues.push({ path: error.path, message: error.message });
            return [];
        }
    }));
}

function assemble(document: Models.OCCT.DesignAssemblyDocument, parameters: DesignValues, prefix: string, parent: string | undefined, gathered: Gathered): Connectors {
    const base = gathered.context.base;
    const placed = new Map<string, Connectors>();
    const unplaced = new Map<string, "failed" | "suppressed">();
    const moving = jointsByComponent(document);
    for (const index of placementOrder(document.components, moving)) {
        const component = document.components[index]!;
        const path = `${prefix}${component.id}`;
        const documentPath = pointer("/components", index);
        const started = performance.now();
        const listed = gathered.components.length;
        const jointsListed = gathered.joints.length;
        const reported = gathered.report.length;
        const entry: Models.OCCT.DesignFeatureReport = { id: path, type: "component", status: "ok", ms: 0, cached: false, messages: [] };
        const placing = moving.get(component.id);
        const joinedTo = placing !== undefined && "component" in placing.joint.to ? placing.joint.to.component : undefined;
        const reason = joinedTo === undefined ? undefined : unplaced.get(joinedTo);
        try {
            if (component.suppressed !== undefined && truthOf(component.suppressed, parameters, pointer(documentPath, "suppressed"))) {
                entry.status = "suppressed";
                unplaced.set(component.id, "suppressed");
            } else if (reason !== undefined) {
                entry.status = "skipped";
                entry.messages.push(`the component "${joinedTo}" ${reason === "suppressed" ? "was suppressed" : "failed earlier"}`);
                unplaced.set(component.id, reason);
            } else {
                const placedEntry = sourceDocument(gathered.library, component.source);
                const { document: source, index: sourceIndex } = placedEntry;
                const sourcePath = pointer(documentPath, "source");
                const overrides = overridesOf(component.source, source.parameters, parameters, sourcePath);
                const properties = propertiesOf(component.properties, parameters, documentPath, gathered);
                const place = (occurrencePath: string, name: string, how: Placing | undefined): Connectors => {
                    const target = targetOf(how, placed, parameters, base);
                    const joined = (values: ReturnType<typeof jointValues> | undefined): void => {
                        if (how === undefined || target === undefined || values === undefined) {
                            return;
                        }
                        const to = "component" in how.joint.to ? `${prefix}${how.joint.to.component}` : undefined;
                        const joint: Omit<Models.OCCT.DesignBuiltJoint, "frame"> = { path: `${prefix}${how.joint.id}`, type: how.joint.type, component: occurrencePath, ...(to === undefined ? {} : { to }), ...values };
                        gathered.joints.push({ joint, local: target, parent });
                    };
                    const occurrence = { path: occurrencePath, name, ...(parent === undefined ? {} : { parent }), matrix: base.transforms.identity(), world: base.transforms.identity(), properties };
                    if (source.kind === "assembly") {
                        const listedComponent: Models.OCCT.DesignBuiltComponent = { ...occurrence, assembly: true };
                        gathered.components.push(listedComponent);
                        const inner = inSource(sourcePath, () => parameterValues(source.parameters, source.configurations, { configuration: component.source.configuration, overrides }));
                        gathered.products.set(occurrencePath, propertiesOf(source.properties, inner, pointer("/documents", sourceIndex), gathered));
                        const published = assemble(source, inner, `${occurrencePath}/`, occurrencePath, gathered);
                        const placement = placementOf(component, published, how, target, parameters, documentPath, base);
                        listedComponent.matrix = placement.matrix;
                        joined(placement.values);
                        return moved(listedComponent.matrix, published, base);
                    }
                    const revisions = gathered.library.get(component.source.document)?.length ?? 1;
                    const { part, cached, messages } = builtPart(source, sourceIndex, versionIn(placedEntry), revisions, component.source, overrides, gathered, sourcePath);
                    entry.cached = cached;
                    entry.messages.push(...messages.filter(message => !entry.messages.includes(message)));
                    const own: Connectors = new Map(part.connectors.map(connector => [connector.id, connector.frame]));
                    const { matrix, values } = placementOf(component, own, how, target, parameters, documentPath, base);
                    gathered.components.push({ ...occurrence, part: part.id, matrix });
                    joined(values);
                    return moved(matrix, own, base);
                };
                const replicate = component.replicate;
                if (replicate === undefined) {
                    placed.set(component.id, place(path, component.name ?? component.id, placing));
                } else {
                    const members = membersOf(placed.get(replicate.to.component), replicate.to.connector);
                    if (members.length === 0) {
                        throw new DesignProblem(pointer(documentPath, "replicate", "to", "connector"), `"${replicate.to.connector}" is neither a connector nor a set of connectors of "${replicate.to.component}" in this build`);
                    }
                    for (const member of members) {
                        const suffix = member === replicate.to.connector ? "" : member.slice(replicate.to.connector.length + 1);
                        const id = suffix === "" ? component.id : `${component.id}.${suffix}`;
                        const name = component.name ?? component.id;
                        place(`${prefix}${id}`, suffix === "" ? name : `${name} ${suffix}`, { joint: replicaJoint(component, replicate, id, member), path: pointer(documentPath, "replicate") });
                    }
                }
            }
        } catch (error) {
            if (!(error instanceof DesignProblem)) {
                throw error;
            }
            gathered.components.length = listed;
            gathered.joints.length = jointsListed;
            entry.status = "failed";
            entry.messages.push(`${error.path}: ${error.message}`);
            unplaced.set(component.id, "failed");
            for (const inner of gathered.report.slice(reported)) {
                if (inner.status === "ok") {
                    inner.status = "skipped";
                    inner.messages.push(`the assembly "${path}" failed`);
                }
            }
        }
        entry.ms = performance.now() - started;
        gathered.report.push(entry);
    }
    return new Map((document.connectors ?? []).flatMap(published => {
        const frame = placed.get(published.component)?.get(published.connector);
        return frame === undefined ? [] : [[published.id, frame] as const];
    }));
}

/**
 * Builds an assembly: its parameters, then each component in an order that places every joint's
 * target first, each part built once per document, configuration and parameter values,
 * sub-assemblies laid out before they are placed. Returns the parts it placed, the components with
 * their placements, the bill of materials and the structure the assembly builders take. A component
 * that fails is reported and left out with everything inside it, which is reported skipped; the
 * components joined to it, or to one that was suppressed, are skipped, as features are.
 */
export function runAssembly(document: Models.OCCT.DesignAssemblyDocument, choice: ParameterChoice, library: BuildLibrary, context: DesignRunContext): Built {
    const parameters = parameterValues(document.parameters, document.configurations, choice);
    if (occurrencesOf(document, library, new Map()) > MAX_OCCURRENCES) {
        throw new DesignProblem("/components", `the assembly places more than ${MAX_OCCURRENCES} occurrences through its levels`);
    }
    const usedOutcomes = new Set<string>();
    const gathered: Gathered = { context: { ...context, used: usedOutcomes }, library, builds: new Map(), parts: new Map(), components: [], products: new Map(), joints: [], report: [], issues: [] };
    try {
        assemble(document, parameters, "", undefined, gathered);
    } catch (error) {
        gathered.builds.forEach(built => built.parts.forEach(part => release(part.shape)));
        throw error;
    }
    context.cache.trim(usedOutcomes);
    const worlds = new Map<string, Matrix>();
    const counts = new Map<string, number>();
    gathered.components.forEach(component => {
        component.world = component.parent === undefined ? component.matrix : context.occt.transforms.multiplyTransforms({ transformation: [component.matrix, worlds.get(component.parent)!] });
        worlds.set(component.path, component.world);
        if (component.part !== undefined) {
            counts.set(component.part, (counts.get(component.part) ?? 0) + 1);
        }
    });
    const parts = [...gathered.parts.values()].filter(part => counts.has(part.id));
    const used = new Set(parts.map(part => part.shape));
    gathered.builds.forEach(built => built.parts.forEach(part => {
        if (!used.has(part.shape)) {
            release(part.shape);
        }
    }));
    const bom = parts.map(part => ({ part: part.id, name: part.name, quantity: counts.get(part.id)!, properties: part.properties }));
    const properties = propertiesOf(document.properties, parameters, "", gathered);
    const structure: Models.OCCT.AssemblyStructureDef<TopoDS_Shape> = {
        parts: parts.map(structurePartOf),
        nodes: [
            { id: ROOT_NODE, type: "assembly", name: document.meta?.name ?? "Assembly", ...withProperties(properties) },
            ...gathered.components.map((component): Models.OCCT.AssemblyNodeDef => ({
                id: component.path,
                type: component.part === undefined ? "assembly" : "instance",
                name: component.name,
                parentId: component.parent ?? ROOT_NODE,
                ...(component.part === undefined ? withProperties(gathered.products.get(component.path)) : { partId: component.part }),
                matrix: component.matrix,
            })),
        ],
        clearDocument: false,
        lengthUnit: document.units?.length ?? "mm",
    };
    const values = Object.fromEntries([...parameters].filter(([name]) => name !== "configuration"));
    return {
        parts,
        report: gathered.report,
        issues: gathered.issues,
        ...(choice.configuration === undefined ? {} : { configuration: choice.configuration }),
        parameters: values,
        components: gathered.components,
        joints: gathered.joints.map(({ joint, local, parent }) => ({ ...joint, frame: parent === undefined ? local : movedFrame(worlds.get(parent)!, local, context.base) })),
        bom,
        structure,
        ...(Object.keys(properties).length === 0 ? {} : { properties }),
        ...framingOf(document),
    };
}
