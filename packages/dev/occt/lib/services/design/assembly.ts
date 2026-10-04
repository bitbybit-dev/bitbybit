import { TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../../api/inputs";
import * as Models from "../../api/models";
import { release, stableJson } from "./cache";
import { cross } from "./helpers";
import { IDENTITY, Matrix, followedBy, frameMatrix, jointMatrix, movedFrame } from "./placement";
import { DesignLibrary, LibraryEntry, sourceEntry, versionIn } from "./library";
import { connectorIdsOf } from "./connectors";
import { DesignProblem, pointer } from "./problems";
import { framingOf, runDesign } from "./runner";
import { ROOT_NODE, structurePartOf } from "./export-structure";
import { DesignRunContext } from "./state";
import { DesignValues, directionOf, formatNumber, isExpressionObject, numberOf, parameterTypeOf, parameterValues, pointOf, propertyValue, textOf, truthOf, valueOf } from "./values";

type Built = Models.OCCT.DesignBuildResult<TopoDS_Shape>;
type Part = Models.OCCT.DesignBuiltPart<TopoDS_Shape>;

/** The documents a build is given beside the one it builds: `validate` has checked that each source names one of them. */
export type BuildLibrary = DesignLibrary<Models.OCCT.DesignDocument>;

function sourceDocument(library: BuildLibrary, source: Models.OCCT.DesignComponentSource): LibraryEntry<Models.OCCT.DesignDocument> {
    return sourceEntry(library, source.document, source.version, "");
}


/** The most occurrences one build places through every level; a sub-assembly placed many times counts all it holds each time. */
export const MAX_OCCURRENCES = 100_000;

/** What an assembly build gathers through every level. */
interface Gathered {
    context: DesignRunContext;
    library: BuildLibrary;
    builds: Map<string, Built>;
    parts: Map<string, Part>;
    components: Models.OCCT.DesignBuiltComponent[];
    products: Map<string, Record<string, string | number | boolean>>;
    joints: { joint: Omit<Models.OCCT.DesignBuiltJoint, "frame">; local: Inputs.Base.Frame; parent: string | undefined }[];
    report: Models.OCCT.DesignFeatureReport[];
    issues: Models.OCCT.DesignIssue[];
}

/** Connectors by id, as frames. */
type Connectors = ReadonlyMap<string, Inputs.Base.Frame>;

/** A joint and its position in its document's list. */
type Placing = { joint: Models.OCCT.DesignJoint; path: string };

/** The joint a replicated component is fastened by on one member of its set, `connector` of `to.component`. */
function replicaJoint(component: Models.OCCT.DesignComponent, replicate: Models.OCCT.DesignReplicate, id: string, connector: string): Models.OCCT.DesignJoint {
    return {
        id, type: "fastened", component: component.id, connector: replicate.connector, to: { component: replicate.to.component, connector },
        ...(replicate.flip === undefined ? {} : { flip: replicate.flip }),
        ...(replicate.angle === undefined ? {} : { angle: replicate.angle }),
        ...(replicate.offset === undefined ? {} : { offset: replicate.offset }),
    };
}

/**
 * The joint that moves each component, by component id, and for a replicated component the joint
 * that fastens it, on its set as a whole; `validate` has refused a component two joints move.
 */
function jointsByComponent(document: Models.OCCT.DesignAssemblyDocument): Map<string, Placing> {
    const replicated = document.components.flatMap((component, index): [string, Placing][] => component.replicate === undefined ? [] : [[component.id, { joint: replicaJoint(component, component.replicate, component.id, component.replicate.to.connector), path: pointer("/components", index, "replicate") }]]);
    return new Map([...(document.joints ?? []).map((joint, index): [string, Placing] => [joint.component, { joint, path: pointer("/joints", index) }]), ...replicated]);
}

/** The members of the connector or set `name` among a placed component's connectors: the one it names, or every `<name>.<member>`. */
function membersOf(connectors: Connectors | undefined, name: string): string[] {
    const ids = [...(connectors?.keys() ?? [])];
    return ids.includes(name) ? [name] : ids.filter(id => id.startsWith(`${name}.`));
}

function frameOf(frame: Models.OCCT.DesignFrame, parameters: DesignValues, path: string): Inputs.Base.Frame {
    const normal = directionOf(frame.normal, parameters, pointer(path, "normal"));
    const direction = directionOf(frame.direction, parameters, pointer(path, "direction"));
    if (Math.hypot(...cross(normal, direction)) <= 1e-9 * Math.hypot(...normal) * Math.hypot(...direction)) {
        throw new DesignProblem(pointer(path, "direction"), "the direction lies along the normal: the x axis needs a direction across it");
    }
    return { origin: pointOf(frame.origin, parameters, pointer(path, "origin")), normal, direction };
}

/** How many occurrences an assembly places through every level, counting no further once past the limit. */
/** How many occurrences a component makes: one, or for a replicated one, one per member of the set it is placed on. */
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

/**
 * The values a component's source gives the parameters of the document it places, read by the kind
 * of each parameter there: text and choice parameters take text as written, or the text a
 * `{ "expr" }` computes over this assembly's parameters; the others take a number, a boolean or an
 * expression over them.
 */
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

/** Runs `run`, reporting a problem it finds in the source document under the component's source `path`. */
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

/**
 * The fingerprint that names a variant of a part: the first eight hexadecimal digits of the SHA-256
 * of its document, configuration and parameter values.
 */
/**
 * Builds the part a component places, once per document version and values, and names it by its item
 * key; when the build is given several versions of the document, the version's first eight digits
 * follow, so two revisions placed together stay two parts.
 */
function builtPart(document: Models.OCCT.DesignPartDocument, index: number, version: string, revisions: number, source: Models.OCCT.DesignComponentSource, overrides: Record<string, number | string | boolean>, gathered: Gathered, path: string): { part: Part; cached: boolean; messages: string[] } {
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
    const id = revisions > 1 ? `${found.id}-${found.itemKey}-${version.slice(0, 8)}` : `${found.id}-${found.itemKey}`;
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

/** The frame a component's joint places it against, found before anything of the component is built. */
function targetOf(placing: Placing | undefined, placed: ReadonlyMap<string, Connectors>, parameters: DesignValues): Inputs.Base.Frame | undefined {
    if (placing === undefined) {
        return undefined;
    }
    const { joint } = placing;
    const path = placing.path;
    if ("frame" in joint.to) {
        return frameOf(joint.to.frame, parameters, pointer(path, "to", "frame"));
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

/** A joint's angle and offset with these parameter values, and its limits, refusing a value outside them. */
function jointValues(placing: Placing, parameters: DesignValues): { angle: number; offset: number; limits: Models.OCCT.DesignBuiltJoint["limits"] } {
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

/** Where a component goes: at its frame, against its joint's target, or where its source has it. */
function placementOf(component: Models.OCCT.DesignComponent, own: Connectors, placing: Placing | undefined, target: Inputs.Base.Frame | undefined, parameters: DesignValues, path: string): { matrix: Matrix; values?: ReturnType<typeof jointValues> } {
    if (component.at !== undefined) {
        return { matrix: frameMatrix(frameOf(component.at, parameters, pointer(path, "at"))) };
    }
    if (placing === undefined || target === undefined) {
        return { matrix: IDENTITY };
    }
    const { joint } = placing;
    const connector = own.get(joint.connector);
    if (connector === undefined) {
        throw new DesignProblem(pointer(placing.path, "connector"), `the connector "${joint.connector}" was not placed in this build`);
    }
    const values = jointValues(placing, parameters);
    return { matrix: jointMatrix(connector, target, joint.flip === true, values.angle, values.offset), values };
}

function moved(matrix: Matrix, connectors: Connectors): Connectors {
    return new Map([...connectors].map(([id, frame]) => [id, movedFrame(matrix, frame)]));
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

/**
 * Places an assembly's components in its own coordinates, each with its matrix relative to this
 * assembly, and returns the connectors the assembly publishes, in the same coordinates. A
 * sub-assembly is laid out before it is placed, so it can be placed by one of its connectors.
 * `validate` has refused an assembly that contains itself, so the recursion ends.
 */
function assemble(document: Models.OCCT.DesignAssemblyDocument, parameters: DesignValues, prefix: string, parent: string | undefined, gathered: Gathered): Connectors {
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
                    const target = targetOf(how, placed, parameters);
                    const joined = (values: ReturnType<typeof jointValues> | undefined): void => {
                        if (how === undefined || target === undefined || values === undefined) {
                            return;
                        }
                        const to = "component" in how.joint.to ? `${prefix}${how.joint.to.component}` : undefined;
                        const joint: Omit<Models.OCCT.DesignBuiltJoint, "frame"> = { path: `${prefix}${how.joint.id}`, type: how.joint.type, component: occurrencePath, ...(to === undefined ? {} : { to }), ...values };
                        gathered.joints.push({ joint, local: target, parent });
                    };
                    const occurrence = { path: occurrencePath, name, ...(parent === undefined ? {} : { parent }), matrix: IDENTITY, world: IDENTITY, properties };
                    if (source.kind === "assembly") {
                        const listedComponent: Models.OCCT.DesignBuiltComponent = { ...occurrence, assembly: true };
                        gathered.components.push(listedComponent);
                        const inner = inSource(sourcePath, () => parameterValues(source.parameters, source.configurations, { configuration: component.source.configuration, overrides }));
                        gathered.products.set(occurrencePath, propertiesOf(source.properties, inner, pointer("/documents", sourceIndex), gathered));
                        const published = assemble(source, inner, `${occurrencePath}/`, occurrencePath, gathered);
                        const placement = placementOf(component, published, how, target, parameters, documentPath);
                        listedComponent.matrix = placement.matrix;
                        joined(placement.values);
                        return moved(listedComponent.matrix, published);
                    }
                    const revisions = gathered.library.get(component.source.document)?.length ?? 1;
                    const { part, cached, messages } = builtPart(source, sourceIndex, versionIn(placedEntry), revisions, component.source, overrides, gathered, sourcePath);
                    entry.cached = cached;
                    entry.messages.push(...messages.filter(message => !entry.messages.includes(message)));
                    const own: Connectors = new Map(part.connectors.map(connector => [connector.id, connector.frame]));
                    const { matrix, values } = placementOf(component, own, how, target, parameters, documentPath);
                    gathered.components.push({ ...occurrence, part: part.id, matrix });
                    joined(values);
                    return moved(matrix, own);
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
export function runAssembly(document: Models.OCCT.DesignAssemblyDocument, choice: { configuration?: string | undefined; overrides?: Readonly<Record<string, unknown>> | undefined }, library: BuildLibrary, context: DesignRunContext): Built {
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
        component.world = component.parent === undefined ? component.matrix : followedBy(component.matrix, worlds.get(component.parent)!);
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
    const withProperties = (values: Record<string, string | number | boolean> | undefined): { properties?: Record<string, string | number | boolean> } => values === undefined || Object.keys(values).length === 0 ? {} : { properties: values };
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
        joints: gathered.joints.map(({ joint, local, parent }) => ({ ...joint, frame: parent === undefined ? local : movedFrame(worlds.get(parent)!, local) })),
        bom,
        structure,
        ...(Object.keys(properties).length === 0 ? {} : { properties }),
        ...framingOf(document),
    };
}
