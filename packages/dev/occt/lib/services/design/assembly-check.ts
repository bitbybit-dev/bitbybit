import * as Models from "../../api/models";
import { DtoRegistry } from "@bitbybit-dev/base";
import { DOCUMENT_KEYS, Known, checkBoolean, checkFrame, checkHeader, checkNumber, checkParameters, checkProperties, checkSwitch, documentIssues, knownFor, lengthUnitOf, oneOf, recorderOf } from "./document-check";
import { DesignProblem, pointer } from "./problems";
import { checkIdList, checkKeys, checkObject, checkText, isRecord } from "./structure";
import { isExpressionObject, parameterTypeOf } from "./values";
import { DesignLibrary, sourceEntry, sourceOf } from "./library";
import { connectorIdsOf } from "./connectors";

function idsOf(value: unknown): string[] {
    return Array.isArray(value) ? value.flatMap(item => isRecord(item) && typeof item["id"] === "string" ? [item["id"]] : []) : [];
}

function partOf(document: Record<string, unknown>, id: unknown): Record<string, unknown> | undefined {
    const parts: unknown[] = Array.isArray(document["parts"]) ? document["parts"] : [];
    const found = parts.find(part => isRecord(part) && part["id"] === id);
    return isRecord(found) ? found : undefined;
}

function checkSource(value: unknown, path: string, known: Known, library: DesignLibrary, lengthUnit: string): void {
    const source = checkObject(value, DOCUMENT_KEYS.source, path, false, "a source { document, part?, version?, configuration?, parameters? }");
    const id = checkText(source["document"], pointer(path, "document"), "a document id");
    const part = source["part"] === undefined ? undefined : checkText(source["part"], pointer(path, "part"), "part");
    const configuration = source["configuration"] === undefined ? undefined : checkText(source["configuration"], pointer(path, "configuration"), "configuration");
    const version = source["version"] === undefined ? undefined : checkText(source["version"], pointer(path, "version"), "a version, the document's SHA-256 or the revision id of the store that keeps it,");
    const parameters = source["parameters"];
    if (parameters !== undefined && !isRecord(parameters)) {
        throw new DesignProblem(pointer(path, "parameters"), "parameters is an object of values by parameter name");
    }
    const document = sourceEntry(library, id, version, path).document;
    if (lengthUnitOf(document) !== lengthUnit) {
        throw new DesignProblem(pointer(path, "document"), `"${id}" is in ${lengthUnitOf(document)} and this assembly in ${lengthUnit}: everything one build places is in one length unit`);
    }
    if (document["kind"] === "assembly") {
        if (part !== undefined) {
            throw new DesignProblem(pointer(path, "part"), "an assembly is placed whole: give no part");
        }
    } else {
        if (part === undefined) {
            throw new DesignProblem(pointer(path, "part"), `the part of "${id}" to place is needed`);
        }
        if (Array.isArray(document["parts"]) && partOf(document, part) === undefined) {
            throw new DesignProblem(pointer(path, "part"), `"${part}" is not a part of "${id}": its parts are ${idsOf(document["parts"]).join(", ")}`);
        }
    }
    if (configuration !== undefined && !idsOf(document["configurations"]).includes(configuration)) {
        throw new DesignProblem(pointer(path, "configuration"), `"${configuration}" is not a configuration of "${id}"`);
    }
    const declaredParameters = isRecord(document["parameters"]) ? document["parameters"] : {};
    const declared = Object.keys(declaredParameters);
    const unknown = Object.keys(isRecord(parameters) ? parameters : {}).find(name => !declared.includes(name));
    if (unknown !== undefined) {
        throw new DesignProblem(pointer(path, "parameters", unknown), `"${unknown}" is not a parameter of "${id}"`);
    }
    Object.entries(isRecord(parameters) ? parameters : {}).forEach(([name, given]) => checkSourceValue(name, given, declaredParameters[name], pointer(path, "parameters", name), known));
}

/**
 * A value a source gives a parameter, read by that parameter's kind: text as written or `{ expr }`
 * for a text or choice parameter, an option of a choice, and a number, a boolean or an expression
 * over this assembly's parameters for the others.
 */
function checkSourceValue(name: string, given: unknown, declared: unknown, path: string, known: Known): void {
    const type = parameterTypeOf(declared);
    if (type === "text" || type === "choice") {
        if (isExpressionObject(given)) {
            checkNumber(given.expr, pointer(path, "expr"), known);
            return;
        }
        if (typeof given !== "string") {
            throw new DesignProblem(path, `"${name}" is a ${type} parameter: give text, or { expr } to compute it`);
        }
        const options = isRecord(declared) && Array.isArray(declared["options"]) ? declared["options"].flatMap(option => isRecord(option) && typeof option["value"] === "string" ? [option["value"]] : []) : [];
        if (type === "choice" && options.length > 0 && !options.includes(given)) {
            throw new DesignProblem(path, `${JSON.stringify(given)} is not one of the options of "${name}": ${options.join(", ")}`);
        }
        return;
    }
    if (isExpressionObject(given)) {
        throw new DesignProblem(path, `"${name}" is a ${type} parameter: give a number, a boolean or an expression, and keep { expr } for text`);
    }
    if (typeof given !== "boolean") {
        checkNumber(given, path, known);
    }
}

/**
 * The connectors a component can be fastened by: the ones its source part declares, or the ones its
 * source assembly publishes; undefined when its document is not given or names no parts.
 */
function connectorsOf(component: Record<string, unknown>, library: DesignLibrary): string[] | undefined {
    const source = isRecord(component["source"]) ? component["source"] : {};
    const entry = sourceOf(library, source);
    if (entry === undefined) {
        return undefined;
    }
    if (entry.document["kind"] === "assembly") {
        return idsOf(entry.document["connectors"]);
    }
    return Array.isArray(entry.document["parts"]) ? connectorIdsOf(partOf(entry.document, source["part"]), entry.document) : undefined;
}

function isAssemblySource(component: Record<string, unknown> | undefined, library: DesignLibrary): boolean {
    return sourceOf(library, component?.["source"])?.document["kind"] === "assembly";
}

/** What each type of joint lets move. */
const FREE: Readonly<Record<string, readonly string[]>> = { fastened: [], revolute: ["angle"], slider: ["offset"], cylindrical: ["angle", "offset"] };

function checkTarget(to: unknown, moved: string, path: string, known: Known, library: DesignLibrary, byId: ReadonlyMap<string, Record<string, unknown>>): void {
    if (isRecord(to) && "frame" in to) {
        checkKeys(to, ["frame"], path, false);
        checkFrame(to["frame"], pointer(path, "frame"), known);
        return;
    }
    const target = checkObject(to, ["component", "connector"], path, false, "a target { component, connector } or { frame }");
    const id = checkText(target["component"], pointer(path, "component"), "a component id");
    const other = byId.get(id);
    if (other === undefined || id === moved) {
        throw new DesignProblem(pointer(path, "component"), `"${id}" is not another component of this assembly`);
    }
    if (other["replicate"] !== undefined) {
        throw new DesignProblem(pointer(path, "component"), `"${id}" is replicated, so it has no one place to be joined to`);
    }
    const targetConnector = checkText(target["connector"], pointer(path, "connector"), "a connector id");
    const theirs = connectorsOf(other, library);
    if (theirs !== undefined && !theirs.includes(targetConnector)) {
        throw new DesignProblem(pointer(path, "connector"), `"${targetConnector}" is not a connector of "${id}": its connectors are ${theirs.join(", ") || "none"}`);
    }
}

function checkLimits(joint: Record<string, unknown>, type: string, jointPath: string, known: Known): void {
    const path = pointer(jointPath, "limits");
    const limits = checkObject(joint["limits"], DOCUMENT_KEYS.jointLimits, path, false, "limits { angle?, offset? }");
    for (const key of Object.keys(limits)) {
        const keyPath = pointer(path, key);
        if (!FREE[type]!.includes(key)) {
            throw new DesignProblem(keyPath, type === "fastened" ? "a fastened joint moves nothing, so it has no limits" : `a ${type} joint lets only its ${FREE[type]!.join(" and ")} move`);
        }
        const range = limits[key];
        if (!Array.isArray(range) || range.length !== 2) {
            throw new DesignProblem(keyPath, "limits are [least, most]");
        }
        range.forEach((bound: unknown, index) => checkNumber(bound, pointer(keyPath, index), known));
        const [least, most] = range as unknown[];
        if (typeof least === "number" && typeof most === "number") {
            if (least > most) {
                throw new DesignProblem(keyPath, `the least, ${least}, is more than the most, ${most}`);
            }
            const value = joint[key];
            if (typeof value === "number" && (value < least || value > most)) {
                throw new DesignProblem(pointer(jointPath, key), `${value} is outside the joint's limits, ${least} to ${most}`);
            }
        }
    }
}

function checkJoint(value: unknown, path: string, known: Known, library: DesignLibrary, byId: ReadonlyMap<string, Record<string, unknown>>, movedBy: Map<string, string>): void {
    const joint = checkObject(value, DOCUMENT_KEYS.joint, path, true, "a joint { id, type, component, connector, to }");
    oneOf(Object.keys(FREE), false)(joint["type"], pointer(path, "type"));
    const type = joint["type"] as string;
    const moved = checkText(joint["component"], pointer(path, "component"), "a component id");
    const component = byId.get(moved);
    if (component === undefined) {
        throw new DesignProblem(pointer(path, "component"), `"${moved}" is not a component of this assembly`);
    }
    if (component["at"] !== undefined) {
        throw new DesignProblem(pointer(path, "component"), `"${moved}" is placed at a frame, so no joint can move it`);
    }
    if (component["replicate"] !== undefined) {
        throw new DesignProblem(pointer(path, "component"), `"${moved}" is placed on its set by replicate, so no joint can move it`);
    }
    const earlier = movedBy.get(moved);
    if (earlier !== undefined) {
        throw new DesignProblem(pointer(path, "component"), `"${moved}" is moved by the joint "${earlier}" already: a component is moved by one joint at most`);
    }
    movedBy.set(moved, String(joint["id"]));
    const connector = checkText(joint["connector"], pointer(path, "connector"), "a connector id");
    const own = connectorsOf(component, library);
    if (own !== undefined && !own.includes(connector)) {
        const placed = isAssemblySource(component, library) ? "assembly" : "part";
        throw new DesignProblem(pointer(path, "connector"), `"${connector}" is not a connector of the ${placed} "${moved}" places: its connectors are ${own.join(", ") || "none"}`);
    }
    checkTarget(joint["to"], moved, pointer(path, "to"), known, library, byId);
    if (joint["flip"] !== undefined) {
        checkBoolean(joint["flip"], pointer(path, "flip"));
    }
    for (const key of ["angle", "offset"]) {
        if (joint[key] !== undefined) {
            checkNumber(joint[key], pointer(path, key), known);
        }
    }
    if (joint["limits"] !== undefined) {
        checkLimits(joint, type, path, known);
    }
}

/** Checks the joints, and gives the joint that moves each component, by component id, with its position. */
function checkJoints(joints: unknown, known: Known, library: DesignLibrary, byId: ReadonlyMap<string, Record<string, unknown>>, record: (check: () => void) => void): Map<string, { joint: Record<string, unknown>; index: number }> {
    const moving = new Map<string, { joint: Record<string, unknown>; index: number }>();
    if (joints === undefined) {
        return moving;
    }
    if (!Array.isArray(joints)) {
        record(() => {
            throw new DesignProblem("/joints", "joints is a list");
        });
        return moving;
    }
    record(() => checkIdList(joints, "/joints", "joints"));
    const movedBy = new Map<string, string>();
    joints.forEach((joint: unknown, index) => record(() => checkJoint(joint, pointer("/joints", index), known, library, byId, movedBy)));
    joints.forEach((joint: unknown, index) => {
        if (isRecord(joint) && typeof joint["component"] === "string" && !moving.has(joint["component"])) {
            moving.set(joint["component"], { joint, index });
        }
    });
    return moving;
}

function checkComponent(value: unknown, path: string, known: Known, library: DesignLibrary, lengthUnit: string): void {
    const component = checkObject(value, DOCUMENT_KEYS.component, path, true, "a component");
    if (component["name"] !== undefined) {
        checkText(component["name"], pointer(path, "name"), "a name");
    }
    if (component["suppressed"] !== undefined) {
        checkSwitch(component["suppressed"], pointer(path, "suppressed"), known);
    }
    checkProperties(component["properties"], pointer(path, "properties"), known);
    checkSource(component["source"], pointer(path, "source"), known, library, lengthUnit);
    if (component["at"] !== undefined) {
        checkFrame(component["at"], pointer(path, "at"), known);
    }
}

function checkPublished(connectors: unknown, library: DesignLibrary, byId: ReadonlyMap<string, Record<string, unknown>>, record: (check: () => void) => void): void {
    if (connectors === undefined) {
        return;
    }
    if (!Array.isArray(connectors)) {
        record(() => {
            throw new DesignProblem("/connectors", "connectors is a list");
        });
        return;
    }
    record(() => checkIdList(connectors, "/connectors", "connectors"));
    connectors.forEach((value: unknown, index) => record(() => {
        const path = pointer("/connectors", index);
        const connector = checkObject(value, DOCUMENT_KEYS.assemblyConnector, path, true, "a connector { id, component, connector }");
        const id = checkText(connector["component"], pointer(path, "component"), "a component id");
        const component = byId.get(id);
        if (component === undefined) {
            throw new DesignProblem(pointer(path, "component"), `"${id}" is not a component of this assembly`);
        }
        if (component["replicate"] !== undefined) {
            throw new DesignProblem(pointer(path, "component"), `"${id}" is replicated, so it has no one connector to publish`);
        }
        const name = checkText(connector["connector"], pointer(path, "connector"), "a connector id");
        const theirs = connectorsOf(component, library);
        if (theirs !== undefined && !theirs.includes(name)) {
            throw new DesignProblem(pointer(path, "connector"), `"${name}" is not a connector of "${id}": its connectors are ${theirs.join(", ") || "none"}`);
        }
    }));
}

/**
 * Checks how a component is placed on every member of a set: by a connector its source has, onto a
 * connector or a set of connectors of another component placed once, with a joint's flip, angle and
 * offset.
 */
function checkReplicate(component: Record<string, unknown>, path: string, known: Known, library: DesignLibrary, byId: ReadonlyMap<string, Record<string, unknown>>): void {
    const replicate = checkObject(component["replicate"], DOCUMENT_KEYS.replicate, path, false, "replicate { connector, to, flip?, angle?, offset? }");
    const moved = String(component["id"]);
    if (component["at"] !== undefined) {
        throw new DesignProblem(path, "a replicated component is placed on its set, not at a frame: give it at or replicate");
    }
    const connector = checkText(replicate["connector"], pointer(path, "connector"), "a connector id");
    const own = connectorsOf(component, library);
    if (own !== undefined && !own.includes(connector)) {
        throw new DesignProblem(pointer(path, "connector"), `"${connector}" is not a connector of the part "${moved}" places: its connectors are ${own.join(", ") || "none"}`);
    }
    const target = checkObject(replicate["to"], ["component", "connector"], pointer(path, "to"), false, "a target { component, connector }");
    const id = checkText(target["component"], pointer(path, "to", "component"), "a component id");
    const other = byId.get(id);
    if (other === undefined || id === moved) {
        throw new DesignProblem(pointer(path, "to", "component"), `"${id}" is not another component of this assembly`);
    }
    if (other["replicate"] !== undefined) {
        throw new DesignProblem(pointer(path, "to", "component"), `"${id}" is replicated itself: replicate onto a component placed once`);
    }
    const name = checkText(target["connector"], pointer(path, "to", "connector"), "a connector id");
    const theirs = connectorsOf(other, library);
    if (theirs !== undefined && !theirs.some(theirId => theirId === name || theirId.startsWith(`${name}.`))) {
        throw new DesignProblem(pointer(path, "to", "connector"), `"${name}" is neither a connector nor a set of connectors of "${id}": its connectors are ${theirs.join(", ") || "none"}`);
    }
    if (replicate["flip"] !== undefined) {
        checkBoolean(replicate["flip"], pointer(path, "flip"));
    }
    for (const key of ["angle", "offset"]) {
        if (replicate[key] !== undefined) {
            checkNumber(replicate[key], pointer(path, key), known);
        }
    }
}

function checkJointLoops(moving: ReadonlyMap<string, { joint: Record<string, unknown>; index: number }>): void {
    const targetOf = (id: string): string | undefined => {
        const to = moving.get(id)?.joint["to"];
        return isRecord(to) && typeof to["component"] === "string" ? to["component"] : undefined;
    };
    const done = new Set<string>();
    const inLoops: string[] = [];
    for (const start of moving.keys()) {
        const path: string[] = [];
        const onPath = new Set<string>();
        let current: string | undefined = start;
        while (current !== undefined && !done.has(current) && !onPath.has(current)) {
            path.push(current);
            onPath.add(current);
            const target = targetOf(current);
            current = target === current ? undefined : target;
        }
        if (current !== undefined && onPath.has(current)) {
            inLoops.push(...path.slice(path.indexOf(current)));
        }
        path.forEach(id => done.add(id));
    }
    if (inLoops.length > 0) {
        const first = inLoops.reduce((best, id) => moving.get(id)!.index < moving.get(best)!.index ? id : best);
        throw new DesignProblem(pointer("/joints", moving.get(first)!.index, "to"), `"${first}" is moved, through its joints, by itself: a closed loop of joints needs a constraint solver, which is not built yet`);
    }
}

/**
 * Every problem of an assembly document found without building it: its header, parameters and
 * configurations, each component's source and placement against the documents given in `library`,
 * its joints and their limits, joints that close a loop, the connectors it publishes, and the problems
 * of every document it places, reported under `/documents/<position>` in the list they were given in.
 * Each document placed is checked once, however many paths reach it.
 */
export function assemblyIssues(document: Record<string, unknown>, registry: DtoRegistry, library: DesignLibrary, stack: readonly string[] = [], checked = new Map<number, Models.OCCT.DesignIssue[]>()): Models.OCCT.DesignIssue[] {
    const issues: Models.OCCT.DesignIssue[] = [];
    const record = recorderOf(issues);
    checkHeader(document, record, DOCUMENT_KEYS.assembly, "assembly");
    const known = knownFor(registry);
    checkParameters(document, known, record);
    const components = document["components"];
    if (!Array.isArray(components)) {
        issues.push({ path: "/components", message: "components is a list" });
        return issues;
    }
    record(() => checkIdList(components, "/components", "components"));
    const byId = new Map<string, Record<string, unknown>>();
    components.forEach((component: unknown) => {
        if (isRecord(component) && typeof component["id"] === "string" && !byId.has(component["id"])) {
            byId.set(component["id"], component);
        }
    });
    components.forEach((component: unknown, index) => record(() => checkComponent(component, pointer("/components", index), known, library, lengthUnitOf(document))));
    components.forEach((component: unknown, index) => record(() => {
        if (isRecord(component) && component["replicate"] !== undefined) {
            checkReplicate(component, pointer("/components", index, "replicate"), known, library, byId);
        }
    }));
    const moving = checkJoints(document["joints"], known, library, byId, record);
    record(() => checkJointLoops(moving));
    checkPublished(document["connectors"], library, byId, record);
    record(() => checkProperties(document["properties"], "/properties", known));
    const placed = new Set([...byId.values()].flatMap(component => {
        const entry = sourceOf(library, component["source"]);
        return entry === undefined ? [] : [entry];
    }));
    for (const entry of placed) {
        const id = String(entry.document["id"]);
        if (stack.includes(id)) {
            issues.push({ path: pointer("/documents", entry.index), message: `the assembly "${id}" contains itself` });
            continue;
        }
        let inner = checked.get(entry.index);
        if (inner === undefined) {
            const own = entry.document["kind"] === "assembly" ? assemblyIssues(entry.document, registry, library, [...stack, id], checked) : documentIssues(entry.document, registry);
            inner = own.map(issue => ({ path: issue.path.startsWith("/documents/") ? issue.path : `${pointer("/documents", entry.index)}${issue.path}`, message: issue.message }));
            checked.set(entry.index, inner);
        }
        issues.push(...inner);
    }
    return issues;
}
