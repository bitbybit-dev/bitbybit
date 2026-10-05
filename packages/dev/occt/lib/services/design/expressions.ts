import { FULL_TURN, HALF_TURN, QUARTER_SINES, RIGHT_ANGLE } from "./constants";

const RADIANS_PER_DEGREE = Math.PI / HALF_TURN;

const EXACT_SINES = new Map<number, number>([...QUARTER_SINES].flatMap(([angle, sine]) => [
    [angle, sine], [HALF_TURN - angle, sine], [HALF_TURN + angle, sine === 0 ? 0 : -sine], [(FULL_TURN - angle) % FULL_TURN, sine === 0 ? 0 : -sine],
]));

function folded(degrees: number): number {
    return ((degrees % FULL_TURN) + FULL_TURN) % FULL_TURN + 0;
}

function sine(degrees: number): number {
    const angle = folded(degrees);
    return EXACT_SINES.get(angle) ?? Math.sin(angle * RADIANS_PER_DEGREE);
}

function cosine(degrees: number): number {
    return sine(degrees + RIGHT_ANGLE);
}

function inverse(value: number, exact: ReadonlyMap<number, number>, fallback: (value: number) => number): number {
    return exact.get(value) ?? fallback(value) / RADIANS_PER_DEGREE;
}

const EXACT_ARCSINES = new Map<number, number>([...QUARTER_SINES].flatMap(([angle, value]) => [[value, angle], [-value, angle === 0 ? 0 : -angle]]));

const EXACT_ARCCOSINES = new Map<number, number>([...QUARTER_SINES].flatMap(([angle, value]) => [[value, RIGHT_ANGLE - angle], [-value, RIGHT_ANGLE + angle]]));

function rounded(value: number): number {
    return Math.sign(value) * Math.round(Math.abs(value)) + 0;
}

const IF_ARITY = 3;

interface LeastArity {
    atLeast: number;
}

interface ExpressionFunction {
    arity: number | LeastArity;
    apply: (...values: number[]) => number;
}

const FUNCTIONS = new Map<string, ExpressionFunction>(Object.entries({
    min: { arity: { atLeast: 1 }, apply: Math.min },
    max: { arity: { atLeast: 1 }, apply: Math.max },
    abs: { arity: 1, apply: Math.abs },
    sqrt: { arity: 1, apply: Math.sqrt },
    sin: { arity: 1, apply: sine },
    cos: { arity: 1, apply: cosine },
    tan: { arity: 1, apply: value => sine(value) / cosine(value) },
    asin: { arity: 1, apply: value => inverse(value, EXACT_ARCSINES, Math.asin) },
    acos: { arity: 1, apply: value => inverse(value, EXACT_ARCCOSINES, Math.acos) },
    atan: { arity: 1, apply: value => Math.atan(value) / RADIANS_PER_DEGREE },
    atan2: { arity: 2, apply: (y, x) => Math.atan2(y, x) / RADIANS_PER_DEGREE },
    round: { arity: 1, apply: rounded },
    floor: { arity: 1, apply: Math.floor },
    ceil: { arity: 1, apply: Math.ceil },
}));

const CONSTANTS = new Map<string, number>([["pi", Math.PI], ["tau", 2 * Math.PI], ["e", Math.E], ["true", 1], ["false", 0]]);

const RESERVED_NAMES = new Set(["inf", "nan"]);

/** Every name a parameter may not take: the constants, the reserved words, `if`, and `configuration`, which holds the configuration in use. */
export const RESERVED_PARAMETER_NAMES: readonly string[] = [...CONSTANTS.keys(), ...RESERVED_NAMES, "if", "configuration"];

/** The longest expression read, in characters: longer ones belong in several parameters. */
export const MAX_EXPRESSION_LENGTH = 2000;

/** How deeply parentheses, calls and signs may nest in one expression. */
export const MAX_EXPRESSION_DEPTH = 64;

/** The value of an expression: a number, or text from a text or choice parameter or a quoted literal. */
export type ExpressionValue = number | string;

type BinaryOperator = "+" | "-" | "*" | "/" | "^" | "<" | "<=" | ">" | ">=" | "==" | "!=" | "&&" | "||";

/** A parsed expression: a tree of numbers, text, names, operators and function calls. */
export type ExpressionNode =
    | { kind: "number"; value: number }
    | { kind: "text"; value: string }
    | { kind: "name"; name: string }
    | { kind: "negate"; operand: ExpressionNode }
    | { kind: "not"; operand: ExpressionNode }
    | { kind: "binary"; operator: BinaryOperator; left: ExpressionNode; right: ExpressionNode }
    | { kind: "call"; name: string; args: ExpressionNode[] };

/** Why an expression could not be read or evaluated, with the character it went wrong at. */
export class ExpressionError extends Error {
    constructor(message: string, readonly position: number) {
        super(message);
        this.name = "ExpressionError";
    }
}

type Token =
    | { kind: "number"; value: number; at: number }
    | { kind: "text"; value: string; at: number }
    | { kind: "name"; value: string; at: number }
    | { kind: "symbol"; value: string; at: number };

const SYMBOLS = ["<=", ">=", "==", "!=", "&&", "||", "+", "-", "*", "/", "^", "(", ")", ",", "<", ">", "!"];

function tokensOf(text: string): Token[] {
    const tokens: Token[] = [];
    let at = 0;
    while (at < text.length) {
        const char = text[at]!;
        if (/\s/.test(char)) {
            at++;
            continue;
        }
        const number = /^(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/.exec(text.slice(at));
        if (number) {
            tokens.push({ kind: "number", value: Number(number[0]), at });
            at += number[0].length;
            continue;
        }
        const name = /^[A-Za-z_][A-Za-z0-9_]*/.exec(text.slice(at));
        if (name) {
            tokens.push({ kind: "name", value: name[0], at });
            at += name[0].length;
            continue;
        }
        if (char === "'") {
            const end = text.indexOf("'", at + 1);
            if (end === -1) {
                throw new ExpressionError("the quoted text has no closing '", at);
            }
            tokens.push({ kind: "text", value: text.slice(at + 1, end), at });
            at = end + 1;
            continue;
        }
        const symbol = SYMBOLS.find(candidate => text.startsWith(candidate, at));
        if (symbol !== undefined) {
            tokens.push({ kind: "symbol", value: symbol, at });
            at += symbol.length;
            continue;
        }
        throw new ExpressionError(`"${char}" is not part of an expression`, at);
    }
    return tokens;
}

const LEVELS: readonly (readonly BinaryOperator[])[] = [["||"], ["&&"], ["==", "!="], ["<", "<=", ">", ">="], ["+", "-"], ["*", "/"]];

/** Reads an expression into a tree, or throws an `ExpressionError` saying where it stopped making sense. */
export function parseExpression(text: string): ExpressionNode {
    if (text.length > MAX_EXPRESSION_LENGTH) {
        throw new ExpressionError(`an expression is at most ${MAX_EXPRESSION_LENGTH} characters long: put parts of it in parameters`, MAX_EXPRESSION_LENGTH);
    }
    const tokens = tokensOf(text);
    let next = 0;
    let depth = 0;
    const deeper = <T>(at: number, read: () => T): T => {
        depth++;
        if (depth > MAX_EXPRESSION_DEPTH) {
            throw new ExpressionError(`parentheses, calls and signs nest at most ${MAX_EXPRESSION_DEPTH} deep`, at);
        }
        const result = read();
        depth--;
        return result;
    };
    const peek = (): Token | undefined => tokens[next];
    const isSymbol = (value: string): boolean => {
        const token = peek();
        return token !== undefined && token.kind === "symbol" && token.value === value;
    };
    const expect = (value: string): void => {
        if (!isSymbol(value)) {
            throw new ExpressionError(`"${value}" is missing`, peek()?.at ?? text.length);
        }
        next++;
    };
    const level = (index: number): ExpressionNode => {
        const operators = LEVELS[index];
        if (operators === undefined) {
            return unary();
        }
        let left = level(index + 1);
        let operator = operators.find(isSymbol);
        while (operator !== undefined) {
            next++;
            left = { kind: "binary", operator, left, right: level(index + 1) };
            operator = operators.find(isSymbol);
        }
        return left;
    };
    const unary = (): ExpressionNode => {
        const at = peek()?.at ?? text.length;
        if (isSymbol("-")) {
            next++;
            return deeper(at, () => ({ kind: "negate", operand: unary() }));
        }
        if (isSymbol("!")) {
            next++;
            return deeper(at, () => ({ kind: "not", operand: unary() }));
        }
        if (isSymbol("+")) {
            next++;
            return deeper(at, unary);
        }
        return power();
    };
    const power = (): ExpressionNode => {
        const base = primary();
        if (isSymbol("^")) {
            next++;
            return { kind: "binary", operator: "^", left: base, right: unary() };
        }
        return base;
    };
    const call = (name: string, at: number): ExpressionNode => {
        next++;
        const args: ExpressionNode[] = [];
        if (!isSymbol(")")) {
            args.push(deeper(at, () => level(0)));
            while (isSymbol(",")) {
                next++;
                args.push(deeper(at, () => level(0)));
            }
        }
        expect(")");
        const arity = name === "if" ? IF_ARITY : FUNCTIONS.get(name)?.arity;
        if (arity === undefined) {
            throw new ExpressionError(`"${name}" is not a function expressions know`, at);
        }
        if (typeof arity === "number" && args.length !== arity) {
            throw new ExpressionError(`"${name}" takes ${arity} value${arity === 1 ? "" : "s"}, not ${args.length}`, at);
        }
        if (typeof arity === "object" && args.length < arity.atLeast) {
            throw new ExpressionError(`"${name}" takes at least ${arity.atLeast} value${arity.atLeast === 1 ? "" : "s"}, not ${args.length}`, at);
        }
        return { kind: "call", name, args };
    };
    const primary = (): ExpressionNode => {
        const token = peek();
        if (token === undefined) {
            throw new ExpressionError("the expression ends too soon", text.length);
        }
        next++;
        switch (token.kind) {
            case "number":
                return { kind: "number", value: token.value };
            case "text":
                return { kind: "text", value: token.value };
            case "name":
                return isSymbol("(") ? call(token.value, token.at) : { kind: "name", name: token.value };
            default:
                if (token.value === "(") {
                    const inner = deeper(token.at, () => level(0));
                    expect(")");
                    return inner;
                }
                throw new ExpressionError(`"${token.value}" cannot start a value`, token.at);
        }
    };
    const tree = level(0);
    const rest = peek();
    if (rest !== undefined) {
        throw new ExpressionError(`"${rest.value}" is left over after the expression`, rest.at);
    }
    return tree;
}

/** The names of the parameters an expression reads, each once, in the order they are first read. */
export function namesIn(node: ExpressionNode): string[] {
    const names = new Set<string>();
    const pending: ExpressionNode[] = [node];
    while (pending.length > 0) {
        const current = pending.pop()!;
        switch (current.kind) {
            case "name":
                if (!CONSTANTS.has(current.name) && !RESERVED_NAMES.has(current.name)) {
                    names.add(current.name);
                }
                break;
            case "negate":
            case "not":
                pending.push(current.operand);
                break;
            case "binary":
                pending.push(current.right, current.left);
                break;
            case "call":
                pending.push(...[...current.args].reverse());
                break;
        }
    }
    return [...names];
}

/**
 * The value of an expression with `values` for its names. Comparisons and `&&`, `||` and `!` give 1
 * or 0, and 0 is false; text may only be compared with `==` and `!=` or chosen by `if`. A name
 * without a value, arithmetic on text, and a step that gives a number that is not finite throw, at
 * that step, even inside a condition.
 */
export function evaluateExpression(node: ExpressionNode, values: ReadonlyMap<string, ExpressionValue>): ExpressionValue {
    return evaluate(node, values);
}

function finite(value: number, step: string): number {
    if (!Number.isFinite(value)) {
        throw new ExpressionError(`${step} gives ${String(value)}, not a finite number`, 0);
    }
    return value;
}

function numeric(value: ExpressionValue, use: string): number {
    if (typeof value === "string") {
        throw new ExpressionError(`text cannot be used in ${use}`, 0);
    }
    return value;
}

function truth(value: boolean): number {
    return value ? 1 : 0;
}

function evaluate(node: ExpressionNode, values: ReadonlyMap<string, ExpressionValue>): ExpressionValue {
    switch (node.kind) {
        case "number":
        case "text":
            return node.value;
        case "name": {
            if (RESERVED_NAMES.has(node.name)) {
                throw new ExpressionError(`"${node.name}" is reserved and has no value`, 0);
            }
            const value = CONSTANTS.get(node.name) ?? values.get(node.name);
            if (value === undefined) {
                throw new ExpressionError(`"${node.name}" is not a parameter`, 0);
            }
            return typeof value === "number" ? finite(value, `"${node.name}"`) : value;
        }
        case "negate":
            return -numeric(evaluate(node.operand, values), "arithmetic");
        case "not":
            return truth(numeric(evaluate(node.operand, values), "a condition") === 0);
        case "binary":
            return binary(node.operator, evaluate(node.left, values), () => evaluate(node.right, values));
        case "call": {
            if (node.name === "if") {
                const condition = numeric(evaluate(node.args[0]!, values), "a condition");
                return evaluate(node.args[condition === 0 ? 2 : 1]!, values);
            }
            return finite(FUNCTIONS.get(node.name)!.apply(...node.args.map(arg => numeric(evaluate(arg, values), "arithmetic"))), `${node.name}()`);
        }
    }
}

function binary(operator: BinaryOperator, left: ExpressionValue, right: () => ExpressionValue): ExpressionValue {
    switch (operator) {
        case "==":
            return truth(left === right());
        case "!=":
            return truth(left !== right());
        case "&&":
            return truth(numeric(left, "a condition") !== 0 && numeric(right(), "a condition") !== 0);
        case "||":
            return truth(numeric(left, "a condition") !== 0 || numeric(right(), "a condition") !== 0);
        default:
            return finite(arithmetic(operator, numeric(left, "arithmetic"), numeric(right(), "arithmetic")), `"${operator}"`);
    }
}

function arithmetic(operator: BinaryOperator, left: number, right: number): number {
    switch (operator) {
        case "+":
            return left + right;
        case "-":
            return left - right;
        case "*":
            return left * right;
        case "/":
            return left / right;
        case "^":
            return Math.pow(left, right);
        case "<":
            return truth(left < right);
        case "<=":
            return truth(left <= right);
        case ">":
            return truth(left > right);
        default:
            return truth(left >= right);
    }
}
