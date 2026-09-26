import { DtoConstraints, NumberBounds, PropertyConstraint, ValueKind } from "./constraints";
import { DtoConstructor, DtoRegistry, isRegisteredOperation } from "./resolve-dto";

/**
 * Something wrong with the inputs of a call. `property` names the input at fault, `code` says what
 * is wrong in a form a program can match - an editor can translate it and mark the field - and
 * `params` carries the values the message is built from.
 */
export type InputIssue = {
    readonly property: string;
    readonly code: string;
    readonly params?: Readonly<Record<string, unknown>>;
    readonly message: string;
};

/**
 * One rule over several properties of a DTO. `reads` names the properties it looks at, so it runs
 * only when each of them passed its own check.
 */
export type InputRule<T> = {
    readonly reads: readonly string[];
    readonly check: (inputs: T) => InputIssue | undefined;
};

/**
 * A DTO class rules can be written for, abstract parents included: rules written for a parent
 * apply to every DTO that extends it.
 */
export type RuleTarget = abstract new () => object;

/**
 * The rules of one DTO, as `defineRules` records them.
 */
export type DtoRules = {
    readonly dto: RuleTarget;
    readonly rules: readonly InputRule<unknown>[];
};

/**
 * Every DTO's rules, by the DTO class.
 */
export type RuleBook = ReadonlyMap<RuleTarget, readonly InputRule<unknown>[]>;

const HEX_COLOR = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const TUPLE_LENGTH: Partial<Record<ValueKind, number>> = { point2: 2, vector2: 2, point3: 3, vector3: 3 };

const isRecord = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === "object" && !Array.isArray(value);
const issue = (property: string, code: string, message: string, params?: Record<string, unknown>): InputIssue => (params ? { property, code, message, params } : { property, code, message });

function checkBounds(property: string, value: number, bounds: NumberBounds): InputIssue | undefined {
    const { min, max, exclusiveMin, exclusiveMax } = bounds;
    if (min !== undefined && (exclusiveMin ? value <= min : value < min)) {
        return issue(property, "minimum", `must be ${exclusiveMin ? "above" : "at least"} ${min}`, { limit: min, exclusive: !!exclusiveMin, actual: value });
    }
    if (max !== undefined && (exclusiveMax ? value >= max : value > max)) {
        return issue(property, "maximum", `must be ${exclusiveMax ? "below" : "at most"} ${max}`, { limit: max, exclusive: !!exclusiveMax, actual: value });
    }
    return undefined;
}

function checkValue(property: string, value: unknown, constraint: PropertyConstraint): InputIssue | undefined {
    if (value === undefined || value === null) {
        return constraint.required ? issue(property, "required", "is required") : undefined;
    }
    switch (constraint.kind) {
        case "number":
            if (typeof value !== "number") return issue(property, "type", "must be a number");
            if (Number.isNaN(value)) return issue(property, "not-a-number", "is not a number (NaN)");
            return constraint.bounds ? checkBounds(property, value, constraint.bounds) : undefined;
        case "boolean":
            return typeof value === "boolean" ? undefined : issue(property, "type", "must be true or false");
        case "string":
            return typeof value === "string" ? undefined : issue(property, "type", "must be text");
        case "color":
            return typeof value === "string" && HEX_COLOR.test(value) ? undefined : issue(property, "color", "must be a hex color such as #ff0000");
        case "point":
        case "point2":
        case "point3":
        case "vector2":
        case "vector3": {
            const expected = TUPLE_LENGTH[constraint.kind];
            const count = expected === undefined ? "2 or 3" : String(expected);
            if (!Array.isArray(value)) return issue(property, "type", `must be a list of ${count} numbers`);
            const fits = expected === undefined ? value.length === 2 || value.length === 3 : value.length === expected;
            if (!fits) return issue(property, "arity", `must have ${count} numbers, not ${value.length}`, { expected: expected ?? [2, 3], actual: value.length });
            return value.every((n) => typeof n === "number" && !Number.isNaN(n)) ? undefined : issue(property, "type", `must be a list of ${count} numbers`);
        }
        case "list": {
            if (!Array.isArray(value) && !ArrayBuffer.isView(value)) return issue(property, "type", "must be a list");
            if (!constraint.items || !Array.isArray(value)) return undefined;
            for (let index = 0; index < value.length; index++) {
                const itemIssue = checkValue(property, value[index], { ...constraint.items, required: true });
                if (itemIssue) return { ...itemIssue, message: `item ${index} ${itemIssue.message}`, params: { ...itemIssue.params, index } };
            }
            return undefined;
        }
        case "oneOf":
            return constraint.values?.includes(value as string) ? undefined : issue(property, "enum", `must be one of ${(constraint.values ?? []).join(", ")}`, { allowed: constraint.values });
        default:
            return undefined;
    }
}

/**
 * Checks each property of the inputs against its constraint: present when required, of its kind,
 * a number that is not NaN, a point with as many coordinates as it should have, a hex color, a
 * value its enum lists. A missing value and `null` are the same to it.
 * @param constraints - The constraints of the DTO the inputs are for
 * @param inputs - The inputs, with the DTO's defaults already laid under them
 * @returns Every property that fails, one issue each
 */
export function checkStructure(constraints: DtoConstraints, inputs: unknown): InputIssue[] {
    const record = isRecord(inputs) ? inputs : {};
    const issues: InputIssue[] = [];
    for (const [property, constraint] of Object.entries(constraints)) {
        const found = checkValue(property, record[property], constraint);
        if (found) issues.push(found);
    }
    return issues;
}

/**
 * Collects the rules of several DTOs into one book, looked up by the DTO class.
 * @param entries - What `defineRules` returned for each DTO
 * @returns The rules by DTO class
 */
export function ruleBook(...entries: readonly DtoRules[]): RuleBook {
    const book = new Map<RuleTarget, InputRule<unknown>[]>();
    for (const entry of entries) {
        book.set(entry.dto, [...(book.get(entry.dto) ?? []), ...entry.rules]);
    }
    return book;
}

const rulesOf = (dto: DtoConstructor | undefined, rules: RuleBook | undefined): InputRule<unknown>[] => {
    const found: InputRule<unknown>[] = [];
    for (let target: unknown = dto; rules && typeof target === "function" && target !== Function.prototype; target = Object.getPrototypeOf(target)) {
        found.push(...(rules.get(target as RuleTarget) ?? []));
    }
    return found;
};

/**
 * Everything wrong with the inputs of a call: each property checked against the constraints the
 * registry lists for its operation, then the DTO's rules whose properties all passed. An operation
 * the registry does not list, or lists without constraints, has nothing to check.
 * @param registry - A kernel's operations by dotted path
 * @param path - The dotted path of the operation
 * @param inputs - The inputs, with the DTO's defaults already laid under them
 * @param rules - The kernel's rules, when it has any
 * @returns The issues found, empty when the inputs are fine
 */
export function validateInputs(registry: DtoRegistry, path: string, inputs: unknown, rules?: RuleBook): InputIssue[] {
    if (!isRegisteredOperation(registry, path)) {
        return [];
    }
    const entry = registry[path]!;
    if (!entry.constraints) {
        return [];
    }
    const issues = checkStructure(entry.constraints, inputs);
    const failed = new Set(issues.map((found) => found.property));
    for (const rule of rulesOf(entry.dto, rules)) {
        if (rule.reads.some((property) => failed.has(property))) continue;
        const found = rule.check(inputs);
        if (found) issues.push(found);
    }
    return issues;
}

/**
 * The properties a call passed that its operation's DTO does not have. They are ignored, which is
 * usually a typo - `widht` leaves `width` at its default.
 * @param registry - A kernel's operations by dotted path
 * @param path - The dotted path of the operation
 * @param inputs - What the caller passed
 * @returns The names the DTO does not know, empty when the operation has no constraints
 */
export function unknownProperties(registry: DtoRegistry, path: string, inputs: unknown): string[] {
    const constraints = isRegisteredOperation(registry, path) ? registry[path]!.constraints : undefined;
    if (!constraints || !isRecord(inputs)) {
        return [];
    }
    return Object.keys(inputs).filter((key) => !Object.prototype.hasOwnProperty.call(constraints, key));
}

/**
 * One issue as the reporter hands it on: which kernel and operation it came from, and whether it is
 * an issue with a value or a property the operation does not know.
 */
export type InputIssueReport = {
    readonly kernel: string;
    readonly path: string;
    readonly issue: InputIssue;
};

const defaultSink = (report: InputIssueReport): void => {
    console.warn(`${report.kernel} ${report.path}: ${report.issue.property} ${report.issue.message}`);
};
let sink: (report: InputIssueReport) => void = defaultSink;
const reported = new Set<string>();

/**
 * Where input issues go; by default a console warning. Passing nothing restores the default. The
 * reporter says each distinct issue once, so a configurator that redraws on every change is not
 * flooded.
 * @param next - The function that receives each new issue, or undefined for the console
 */
export function setInputIssueSink(next?: (report: InputIssueReport) => void): void {
    sink = next ?? defaultSink;
    reported.clear();
}

/**
 * Reports the issues of one call, and the properties it passed that the operation does not know,
 * each distinct one once. Nothing is thrown: this is how a kernel says what it would reject.
 * @param kernel - The kernel the call went to, such as "OCCT"
 * @param path - The dotted path of the operation
 * @param issues - What `validateInputs` found
 * @param unknown - What `unknownProperties` found
 */
export function reportInputIssues(kernel: string, path: string, issues: readonly InputIssue[], unknown: readonly string[] = []): void {
    const all = [...issues, ...unknown.map((property) => issue(property, "unknown-property", "is not an input of this operation and is ignored"))];
    for (const found of all) {
        const key = `${kernel}|${path}|${found.property}|${found.code}`;
        if (reported.has(key)) continue;
        reported.add(key);
        sink({ kernel, path, issue: found });
    }
}
