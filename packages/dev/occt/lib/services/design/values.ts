import type * as Models from "../../api/models";
import { isRecord } from "@bitbybit-dev/base";
import type { ExpressionNode, ExpressionValue } from "./expressions";
import { ExpressionError, RESERVED_PARAMETER_NAMES, evaluateExpression, namesIn, parseExpression } from "./expressions";
import { DesignProblem, pointer } from "./problems";
import { checkKeys, checkLabel, checkText } from "./structure";
import { DIMENSIONS } from "./constants";

const PARAMETER_NAME = /^[A-Za-z_][A-Za-z0-9_]*$/;
const PARAMETER_KEYS = ["value", "type", "unit", "min", "max", "step", "options", "label", "description", "group"];
const TYPES = ["number", "boolean", "choice", "text"] as const;

/** The value of every parameter, and of `configuration`, as expressions read them. */
export type DesignValues = ReadonlyMap<string, ExpressionValue>;

type ParameterType = typeof TYPES[number];

interface ParameterSpec {
    type: ParameterType | undefined;
    value: unknown;
    path: string;
    min?: number;
    max?: number;
    options?: string[];
}

/** Which configuration a build uses and the values that replace the parameters' own. */
export interface ParameterChoice {
    configuration?: string | undefined;
    overrides?: Readonly<Record<string, unknown>> | undefined;
}

/** Parses an expression, turning a parse failure into a problem at `path`. */
export function parsed(text: string, path: string): ExpressionNode {
    try {
        return parseExpression(text);
    } catch (error) {
        if (error instanceof ExpressionError) {
            throw new DesignProblem(path, `${error.message} (at character ${error.position + 1} of "${text}")`);
        }
        throw error;
    }
}

function evaluated(tree: ExpressionNode, values: DesignValues, path: string): ExpressionValue {
    try {
        return evaluateExpression(tree, values);
    } catch (error) {
        if (error instanceof ExpressionError) {
            throw new DesignProblem(path, error.message);
        }
        throw error;
    }
}

function finiteNumber(value: unknown, path: string, what: string): number {
    if (typeof value !== "number" || !Number.isFinite(value)) {
        throw new DesignProblem(path, `${what} is a finite number`);
    }
    return value;
}

function optionsOf(value: unknown, path: string): string[] {
    if (!Array.isArray(value) || value.length === 0) {
        throw new DesignProblem(path, "options is a list of { value, label? }");
    }
    const options = value.map((option, index) => {
        const optionPath = pointer(path, index);
        if (!isRecord(option)) {
            throw new DesignProblem(optionPath, "an option is { value, label? }");
        }
        checkKeys(option, ["value", "label"], optionPath, false);
        if (option["label"] !== undefined) {
            checkLabel(option["label"], pointer(optionPath, "label"));
        }
        return checkText(option["value"], pointer(optionPath, "value"), "an option's value");
    });
    const repeated = options.find((option, index) => options.indexOf(option) !== index);
    if (repeated !== undefined) {
        throw new DesignProblem(path, `"${repeated}" is an option twice`);
    }
    return options;
}

function specOf(name: string, declared: unknown, path: string): ParameterSpec {
    if (!PARAMETER_NAME.test(name)) {
        throw new DesignProblem(path, `"${name}" is not a parameter name: use letters, digits and _, not starting with a digit`);
    }
    if (RESERVED_PARAMETER_NAMES.includes(name)) {
        throw new DesignProblem(path, `"${name}" is reserved: ${RESERVED_PARAMETER_NAMES.join(", ")} cannot name parameters`);
    }
    if (typeof declared === "boolean") {
        return { type: "boolean", value: declared, path };
    }
    if (typeof declared === "number" || typeof declared === "string") {
        return { type: typeof declared === "number" ? "number" : undefined, value: declared, path };
    }
    if (!isRecord(declared)) {
        throw new DesignProblem(path, "a parameter is a number, a boolean, an expression or { value, type, ... }");
    }
    checkKeys(declared, PARAMETER_KEYS, path, true);
    const type = declared["type"] ?? (typeof declared["value"] === "boolean" ? "boolean" : "number");
    const known = TYPES.find(candidate => candidate === type);
    if (known === undefined) {
        throw new DesignProblem(pointer(path, "type"), `one of ${TYPES.join(", ")} is expected`);
    }
    const spec: ParameterSpec = { type: known, value: declared["value"], path };
    for (const bound of ["min", "max", "step"] as const) {
        if (declared[bound] !== undefined) {
            if (spec.type !== "number") {
                throw new DesignProblem(pointer(path, bound), `${bound} is for number parameters`);
            }
            const value = finiteNumber(declared[bound], pointer(path, bound), bound);
            if (bound !== "step") {
                spec[bound] = value;
            }
        }
    }
    if (spec.min !== undefined && spec.max !== undefined && spec.min > spec.max) {
        throw new DesignProblem(pointer(path, "max"), `the maximum ${spec.max} is below the minimum ${spec.min}`);
    }
    if (spec.type === "choice") {
        spec.options = optionsOf(declared["options"], pointer(path, "options"));
    } else if (declared["options"] !== undefined) {
        throw new DesignProblem(pointer(path, "options"), "options are for choice parameters");
    }
    for (const key of ["unit", "group"]) {
        if (declared[key] !== undefined) {
            checkText(declared[key], pointer(path, key), key);
        }
    }
    for (const key of ["label", "description"]) {
        if (declared[key] !== undefined) {
            checkLabel(declared[key], pointer(path, key));
        }
    }
    return spec;
}

/** Whether a value is `{ "expr": "..." }`, the form text is computed in. */
export function isExpressionObject(value: unknown): value is Models.OCCT.DesignExpression {
    return isRecord(value) && Object.keys(value).length === 1 && typeof value["expr"] === "string";
}

/** The text a document value stands for: a string as it is written, `{ "expr": "..." }` as the text its expression gives. */
export function textOf(value: unknown, parameters: DesignValues, path: string): string {
    if (typeof value === "string") {
        return value;
    }
    if (!isExpressionObject(value)) {
        throw new DesignProblem(path, "text or { expr } is expected");
    }
    const result = evaluated(parsed(value.expr, pointer(path, "expr")), parameters, pointer(path, "expr"));
    if (typeof result !== "string") {
        throw new DesignProblem(pointer(path, "expr"), `text is expected, and the expression gives ${formatNumber(result)}`);
    }
    return result;
}

/**
 * The kind of value a declared parameter takes: its `type`, a boolean for a boolean value, and a
 * number otherwise, as for a value or an expression with no type given.
 */
export function parameterTypeOf(declared: unknown): ParameterType {
    if (isRecord(declared)) {
        return TYPES.find(type => type === declared["type"]) ?? (typeof declared["value"] === "boolean" ? "boolean" : "number");
    }
    return typeof declared === "boolean" ? "boolean" : "number";
}

function interpreted(spec: ParameterSpec, raw: unknown, path: string): ExpressionValue | ExpressionNode {
    if ((spec.type === "choice" || spec.type === "text") && isExpressionObject(raw)) {
        return parsed(raw.expr, pointer(path, "expr"));
    }
    switch (spec.type) {
        case "choice":
            if (typeof raw !== "string" || !spec.options!.includes(raw)) {
                throw new DesignProblem(path, `${JSON.stringify(raw)} is not one of the options: ${spec.options!.join(", ")}`);
            }
            return raw;
        case "text":
            return checkText(raw, path, "the value");
        case "boolean":
            if (typeof raw === "boolean") {
                return raw ? 1 : 0;
            }
            if (typeof raw === "number") {
                return finiteNumber(raw, path, "the value") === 0 ? 0 : 1;
            }
            if (typeof raw !== "string") {
                throw new DesignProblem(path, "true, false, a number or an expression is expected");
            }
            return parsed(raw, path);
        default:
            if (typeof raw === "number") {
                return finiteNumber(raw, path, "the value");
            }
            if (typeof raw !== "string") {
                throw new DesignProblem(path, "a number or an expression is expected");
            }
            return parsed(raw, path);
    }
}

function checkedResult(spec: ParameterSpec, name: string, value: ExpressionValue, path: string): void {
    if (spec.type === "text" || spec.type === "choice") {
        if (typeof value !== "string") {
            throw new DesignProblem(path, `"${name}" is a ${spec.type} parameter and its expression gives a number`);
        }
        if (spec.type === "choice" && !spec.options!.includes(value)) {
            throw new DesignProblem(path, `"${name}" is ${JSON.stringify(value)}, not one of the options: ${spec.options!.join(", ")}`);
        }
        return;
    }
    if (spec.type !== "number" && spec.type !== "boolean") {
        return;
    }
    if (typeof value === "string") {
        throw new DesignProblem(path, `"${name}" is a ${spec.type} parameter and its expression gives text`);
    }
    if (spec.min !== undefined && value < spec.min) {
        throw new DesignProblem(path, `"${name}" is ${value}, below its minimum ${spec.min}`);
    }
    if (spec.max !== undefined && value > spec.max) {
        throw new DesignProblem(path, `"${name}" is ${value}, above its maximum ${spec.max}`);
    }
}

interface ConfigurationValues {
    values: Record<string, unknown>;
    path: string;
}

function configurationValues(configurations: unknown, id: string): ConfigurationValues {
    const list: unknown[] = Array.isArray(configurations) ? configurations : [];
    const index = list.findIndex(configuration => isRecord(configuration) && configuration["id"] === id);
    const found = list[index];
    if (!isRecord(found)) {
        throw new DesignProblem("/configurations", `"${id}" is not a configuration of this document`);
    }
    const values = found["values"];
    const path = pointer("/configurations", index, "values");
    if (!isRecord(values)) {
        throw new DesignProblem(path, "values is an object of parameter values");
    }
    return { values, path };
}

interface ParsedExpression {
    tree: ExpressionNode;
    path: string;
}

/**
 * The value of every parameter: the document's, replaced by the chosen configuration's and then by
 * `overrides`, each read as the parameter's type says and each expression evaluated after the
 * parameters it reads. Expressions also read `configuration`, the chosen configuration's id or "".
 * A value of the wrong kind, outside its limits or not among its options, an unknown name, and a
 * parameter that reads itself through others are problems. `derived`, when given, receives the
 * parameters each expression-valued one reads; the others, a constant expression such as "2 * 100"
 * among them, are declared values.
 */
export function parameterValues(parameters: unknown, configurations: unknown, choice: ParameterChoice, derived?: Map<string, readonly string[]>): Map<string, ExpressionValue> {
    if (parameters !== undefined && !isRecord(parameters)) {
        throw new DesignProblem("/parameters", "parameters is an object of named values");
    }
    if (parameters !== undefined && Object.keys(parameters).length > MAX_PARAMETERS) {
        throw new DesignProblem("/parameters", `a document declares at most ${MAX_PARAMETERS} parameters`);
    }
    const specs = new Map(Object.entries(parameters ?? {}).map(([name, declared]) => [name, specOf(name, declared, pointer("/parameters", name))]));
    const raws = new Map([...specs].map(([name, spec]) => [name, { raw: spec.value, path: spec.path }]));
    const replace = (values: Readonly<Record<string, unknown>>, pathOf: (name: string) => string): void => {
        for (const [name, raw] of Object.entries(values)) {
            if (!specs.has(name)) {
                throw new DesignProblem(pathOf(name), `"${name}" is not a parameter of this document`);
            }
            raws.set(name, { raw, path: pathOf(name) });
        }
    };
    if (choice.configuration !== undefined) {
        const chosen = configurationValues(configurations, choice.configuration);
        replace(chosen.values, name => pointer(chosen.path, name));
    }
    replace(choice.overrides ?? {}, name => pointer("/parameters", name));
    const values = new Map<string, ExpressionValue>([["configuration", choice.configuration ?? ""]]);
    const trees = new Map<string, ParsedExpression>();
    raws.forEach(({ raw, path }, name) => {
        const value = interpreted(specs.get(name)!, raw, path);
        if (typeof value === "object") {
            trees.set(name, { tree: value, path });
            const reads = namesIn(value);
            if (reads.length > 0) {
                derived?.set(name, reads);
            }
        } else {
            values.set(name, value);
        }
    });
    const visiting = new Set<string>();
    const resolve = (name: string, path: string): ExpressionValue => {
        const known = values.get(name);
        if (known !== undefined) {
            return known;
        }
        const entry = trees.get(name);
        if (entry === undefined) {
            throw new DesignProblem(path, `"${name}" is not a parameter`);
        }
        if (visiting.has(name)) {
            throw new DesignProblem(pointer("/parameters", name), `"${name}" depends on itself`);
        }
        visiting.add(name);
        const inputs = new Map<string, ExpressionValue>();
        for (const used of namesIn(entry.tree)) {
            inputs.set(used, resolve(used, entry.path));
        }
        visiting.delete(name);
        const value = evaluated(entry.tree, inputs, entry.path);
        values.set(name, value);
        return value;
    };
    trees.forEach((entry, name) => resolve(name, entry.path));
    specs.forEach((spec, name) => checkedResult(spec, name, values.get(name)!, raws.get(name)!.path));
    return values;
}

/** The number a document value stands for: a finite number as it is, a string as an expression over `parameters`. */
export function numberOf(value: unknown, parameters: DesignValues, path: string): number {
    if (typeof value === "number") {
        return finiteNumber(value, path, "the value");
    }
    if (typeof value !== "string") {
        throw new DesignProblem(path, "a number or an expression is expected");
    }
    const result = evaluated(parsed(value, path), parameters, path);
    if (typeof result === "string") {
        throw new DesignProblem(path, "a number is expected, and the expression gives text");
    }
    return result;
}

/** The value a document number or expression stands for, text included, as a parameter of another document takes it. */
export function valueOf(value: unknown, parameters: DesignValues, path: string): number | string | boolean {
    if (typeof value === "boolean" || typeof value === "number") {
        return typeof value === "number" ? finiteNumber(value, path, "the value") : value;
    }
    if (typeof value !== "string") {
        throw new DesignProblem(path, "a number, a boolean or an expression is expected");
    }
    return evaluated(parsed(value, path), parameters, path);
}

/** Whether a switch such as `suppressed` is on: a boolean as it is, an expression when it is not 0. */
export function truthOf(value: unknown, parameters: DesignValues, path: string): boolean {
    return typeof value === "boolean" ? value : numberOf(value, parameters, path) !== 0;
}

/** Three numbers a document point or vector stands for. */
export function pointOf(value: unknown, parameters: DesignValues, path: string): [number, number, number] {
    if (!Array.isArray(value) || value.length !== DIMENSIONS) {
        throw new DesignProblem(path, "a point or vector is three numbers or expressions");
    }
    return [numberOf(value[0], parameters, pointer(path, 0)), numberOf(value[1], parameters, pointer(path, 1)), numberOf(value[2], parameters, pointer(path, 2))];
}

/** A vector that must have a length. */
export function directionOf(value: unknown, parameters: DesignValues, path: string): [number, number, number] {
    const vector = pointOf(value, parameters, path);
    if (Math.hypot(...vector) === 0) {
        throw new DesignProblem(path, "the direction has no length");
    }
    return vector;
}

/** The most parameters one document declares; parameters that read each other resolve one level of the stack per link. */
export const MAX_PARAMETERS = 1000;

/** The most copies one pattern makes: each is a shape the kernel fuses, and a pattern of a pattern multiplies them. */
export const MAX_PATTERN_COUNT = 1000;

/** A count: a whole number of at least `least` and at most `most`. */
export function countOf(value: unknown, parameters: DesignValues, path: string, least: number, most = Number.POSITIVE_INFINITY): number {
    const count = numberOf(value, parameters, path);
    if (!Number.isInteger(count) || count < least) {
        throw new DesignProblem(path, `a whole number of at least ${least} is expected, not ${count}`);
    }
    if (count > most) {
        throw new DesignProblem(path, `a count of at most ${most} is expected, not ${count}`);
    }
    return count;
}

const SHOWN_DIGITS = 12;

/** A number written for people: at most twelve significant digits, so sums such as 0.1 + 0.2 read 0.3. */
export function formatNumber(value: number): string {
    return String(Number(value.toPrecision(SHOWN_DIGITS)));
}

/** One piece of a property template: plain text, or the expression inside `{ }`. */
export type TemplatePiece = TextPiece | ExpressionPiece;

interface TextPiece {
    text: string;
}

interface ExpressionPiece {
    expression: string;
}

/** The pieces of a property template: plain text, and the expressions inside `{ }`; `{{` and `}}` write braces. */
export function templatePieces(template: string, path: string): TemplatePiece[] {
    const pieces: TemplatePiece[] = [];
    let text = "";
    let at = 0;
    while (at < template.length) {
        const char = template[at]!;
        if ((char === "{" || char === "}") && template[at + 1] === char) {
            text += char;
            at += 2;
        } else if (char === "{") {
            const end = template.indexOf("}", at + 1);
            if (end === -1) {
                throw new DesignProblem(path, `the { at character ${at + 1} has no closing }`);
            }
            pieces.push({ text }, { expression: template.slice(at + 1, end) });
            text = "";
            at = end + 1;
        } else if (char === "}") {
            throw new DesignProblem(path, `the } at character ${at + 1} has no opening {: write }} for a brace`);
        } else {
            text += char;
            at++;
        }
    }
    pieces.push({ text });
    return pieces.filter(piece => !("text" in piece) || piece.text !== "");
}

/** A property's value with every expression in it evaluated. */
export function propertyValue(value: unknown, parameters: DesignValues, path: string): string | number | boolean {
    if (typeof value === "boolean") {
        return value;
    }
    if (typeof value === "number") {
        return finiteNumber(value, path, "the value");
    }
    if (typeof value === "string") {
        return templatePieces(value, path).map(piece => {
            if ("text" in piece) {
                return piece.text;
            }
            const result = evaluated(parsed(piece.expression, path), parameters, path);
            return typeof result === "number" ? formatNumber(result) : result;
        }).join("");
    }
    if (isRecord(value) && Object.keys(value).length === 1 && "expr" in value) {
        return numberOf(value["expr"], parameters, pointer(path, "expr"));
    }
    throw new DesignProblem(path, "a property is text, a number, a boolean or { \"expr\": \"...\" }");
}

function quietNames(read: () => string[]): string[] {
    try {
        return read();
    } catch {
        return [];
    }
}

const TEXT_KEYS = new Set(["type", "id", "name", "of", "role", "from", "body", "profile", "profiles", "tools", "path", "select", "join", "asset", "format", "operation", "plane", "material", "color", "edgeColor", "emissive", "label", "description", "group", "unit", "connector", "component", "document", "part", "configuration", "uri", "sha256", "mediaType", "kind", "up", "standard"]);

type ReadMode = "expression" | "template" | "literal";

/**
 * The parameters an expression or a template anywhere in `value` reads, by where each string sits:
 * a string under a key that names something (`type`, ids, `of`, `role`, a material) is a name; in
 * `properties` a string is a template; in an operation's `params` and a reference's `filter` a string
 * is a literal and only `{ "expr" }` computes; elsewhere a string is an expression.
 */
export function parametersIn(value: unknown, parameters: DesignValues): Set<string> {
    const names = new Set<string>();
    const add = (found: string[]): void => found.forEach(name => names.add(name));
    const visit = (inner: unknown, mode: ReadMode, key: string | undefined): void => {
        if (typeof inner === "string") {
            if (key !== undefined && TEXT_KEYS.has(key) && key !== "expr") {
                return;
            }
            if (mode === "expression" || key === "expr") {
                add(quietNames(() => namesIn(parseExpression(inner))));
            } else if (mode === "template") {
                add(quietNames(() => templatePieces(inner, "").flatMap(piece => "expression" in piece ? namesIn(parseExpression(piece.expression)) : [])));
            }
        } else if (Array.isArray(inner)) {
            inner.forEach(item => visit(item, mode, key));
        } else if (typeof inner === "object" && inner !== null) {
            for (const [innerKey, item] of Object.entries(inner)) {
                const innerMode: ReadMode = innerKey === "properties" ? "template" : innerKey === "params" || innerKey === "filter" ? "literal" : mode;
                visit(item, innerMode, innerKey);
            }
        }
    };
    visit(value, "expression", undefined);
    return new Set([...names].filter(name => parameters.has(name)));
}

/**
 * The declared values behind `names`: each name's own value when it is given, and for one an
 * expression computes, the declared values behind the parameters it reads (`derived`, as
 * `parameterValues` fills it), so values computed from others never reach an identity themselves.
 */
export function declaredValues(names: Iterable<string>, parameters: DesignValues, derived: ReadonlyMap<string, readonly string[]>): Record<string, ExpressionValue> {
    const declared = new Map<string, ExpressionValue>();
    const seen = new Set<string>();
    const visit = (name: string): void => {
        if (seen.has(name) || !parameters.has(name)) {
            return;
        }
        seen.add(name);
        const inputs = derived.get(name);
        if (inputs === undefined) {
            declared.set(name, parameters.get(name)!);
        } else {
            inputs.forEach(visit);
        }
    };
    [...names].forEach(visit);
    return Object.fromEntries([...declared].sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0));
}
