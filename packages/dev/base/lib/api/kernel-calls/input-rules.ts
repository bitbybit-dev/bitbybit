import type { DtoRules, InputIssue, InputRule, RuleTarget } from "./input-validation";

type Key<T> = keyof T & string;

const numberAt = <T>(inputs: T, key: Key<T>): number | undefined => {
    const value = inputs[key];
    return typeof value === "number" ? value : undefined;
};

const listAt = <T>(inputs: T, key: Key<T>): readonly unknown[] | undefined => {
    const value = inputs[key];
    return Array.isArray(value) ? value : undefined;
};

/**
 * The rules one DTO's inputs have to satisfy together, beyond what each property accepts on its own.
 * They are written against the DTO as its defaults leave it - `Resolved.<Namespace>.<Dto>` - since
 * they run after the defaults are laid under the inputs.
 * @param dto - The DTO class the rules are for; rules for an abstract parent apply to every DTO that
 * extends it
 * @param rules - The rules, built with `custom`, `lessThan`, `sameLength` and the rest
 * @returns The rules, ready for `ruleBook`
 */
export function defineRules<T>(dto: RuleTarget, rules: readonly InputRule<T>[]): DtoRules {
    return {
        dto,
        rules: rules.map((rule) => ({ reads: rule.reads, check: (inputs: unknown) => rule.check(inputs as T) })),
    };
}

/**
 * A rule stated as a test: the inputs pass when `holds` returns true for them.
 * @param property - The property the issue is reported on
 * @param holds - Whether the inputs are fine
 * @param message - What is wrong, said of `property`
 * @param reads - The properties `holds` looks at, when there are others than `property`
 * @returns The rule
 */
export function custom<T>(property: Key<T>, holds: (inputs: T) => boolean, message: string, reads: readonly Key<T>[] = [property]): InputRule<T> {
    return { reads, check: (inputs) => (holds(inputs) ? undefined : { property, code: "custom", message }) };
}

/**
 * `property` has to be less than another property, or than a limit worked out from the inputs.
 * @param property - The property that has to be smaller
 * @param limit - The property it is compared with, or a function giving the limit
 * @param message - What is wrong, said of `property`; by default "must be less than" the other property
 * @param reads - The properties a limit function looks at
 * @returns The rule
 */
export function lessThan<T>(property: Key<T>, limit: Key<T> | ((inputs: T) => number), message?: string, reads: readonly Key<T>[] = []): InputRule<T> {
    const limitOf = (inputs: T): number | undefined => (typeof limit === "function" ? limit(inputs) : numberAt(inputs, limit));
    return {
        reads: [property, ...(typeof limit === "function" ? reads : [limit])],
        check: (inputs) => {
            const value = numberAt(inputs, property);
            const bound = limitOf(inputs);
            if (value === undefined || bound === undefined || value < bound) {
                return undefined;
            }
            return { property, code: "less-than", params: { limit: bound }, message: message ?? `must be less than ${typeof limit === "function" ? bound : limit}` };
        },
    };
}

/**
 * Two lists that pair up by position must have the same length. A list left out is not compared.
 * @param property - The list the issue is reported on
 * @param other - The list it pairs with
 * @returns The rule
 */
export function sameLength<T>(property: Key<T>, other: Key<T>): InputRule<T> {
    return {
        reads: [property, other],
        check: (inputs) => {
            const list = listAt(inputs, property);
            const partner = listAt(inputs, other);
            if (!list || !partner || list.length === partner.length) {
                return undefined;
            }
            return { property, code: "same-length", params: { expected: partner.length, actual: list.length }, message: `must have as many items as ${other} (${partner.length}), not ${list.length}` };
        },
    };
}

/**
 * Two points have to differ.
 * @param property - The point the issue is reported on
 * @param other - The point it must differ from
 * @returns The rule
 */
export function distinct<T>(property: Key<T>, other: Key<T>): InputRule<T> {
    return {
        reads: [property, other],
        check: (inputs) => {
            const a = listAt(inputs, property);
            const b = listAt(inputs, other);
            if (!a || !b || a.length !== b.length || a.some((value, index) => value !== b[index])) {
                return undefined;
            }
            return { property, code: "distinct", message: `must differ from ${other}` };
        },
    };
}

/**
 * A direction has to have a length: a vector of zeros points nowhere.
 * @param property - The vector
 * @returns The rule
 */
export function notZeroVector<T>(property: Key<T>): InputRule<T> {
    return {
        reads: [property],
        check: (inputs) => {
            const vector = listAt(inputs, property);
            if (!vector || vector.some((value) => value !== 0)) {
                return undefined;
            }
            return { property, code: "zero-vector", message: "must not be a zero vector" };
        },
    };
}

/**
 * At least one item of a list has to pass a test.
 * @param property - The list
 * @param holds - The test an item has to pass
 * @param message - What is wrong, said of `property`
 * @returns The rule
 */
export function atLeastOne<T>(property: Key<T>, holds: (item: unknown) => boolean, message: string): InputRule<T> {
    return {
        reads: [property],
        check: (inputs) => {
            const list = listAt(inputs, property);
            if (!list || list.some(holds)) {
                return undefined;
            }
            return { property, code: "at-least-one", message };
        },
    };
}

/**
 * A rule that applies only when a condition holds, such as a list that has to match another only
 * when it is given.
 * @param condition - When the rule applies
 * @param rule - The rule
 * @returns The rule, checked only when the condition holds
 */
export function when<T>(condition: (inputs: T) => boolean, rule: InputRule<T>): InputRule<T> {
    return { reads: rule.reads, check: (inputs): InputIssue | undefined => (condition(inputs) ? rule.check(inputs) : undefined) };
}
