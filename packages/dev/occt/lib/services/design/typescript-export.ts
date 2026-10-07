import { isRecord } from "@bitbybit-dev/base";
import type * as Inputs from "../../api/inputs";
import type * as Models from "../../api/models";
import type { ExpressionNode } from "./expressions";
import { namesIn, parseExpression } from "./expressions";
import { tripleOf, unitVector } from "./placement";
import { pointer } from "./problems";
import type { DesignRun, DesignTrace } from "./state";
import { ownValue } from "./structure";
import type { ParameterChoice } from "./values";
import { directionOf, isExpressionObject, numberOf, pointOf, templatePieces } from "./values";
import { FULL_TURN } from "./constants";
import { DELETE, FIRST_PRINTABLE, LAST_CONTROL, LINE_SEPARATOR, NEGLIGIBLE, PARAGRAPH_SEPARATOR, WRITTEN_DIGITS } from "./typescript-export.constants";
import type { MathHelper } from "./typescript-math";
import { DEGREES, MATH_HELPERS, mathHelperDeclarations } from "./typescript-math";

const RESERVED = new Set([
    "break", "case", "catch", "class", "const", "continue", "debugger", "default", "delete", "do", "else", "enum", "export", "extends", "false", "finally",
    "for", "function", "if", "import", "in", "instanceof", "new", "null", "return", "super", "switch", "this", "throw", "true", "try", "typeof", "var",
    "void", "while", "with", "yield", "let", "static", "implements", "interface", "package", "private", "protected", "public", "await", "async",
    "occt", "bitbybit", "Bit", "Math", "Promise", "assets", "parts", "part", "configuration", "copy", "undefined", "NaN", "Infinity",
    "eval", "arguments", "String", "Number",
]);

const CONSTANT_CODE = new Map<string, string>([["pi", "Math.PI"], ["tau", "(2 * Math.PI)"], ["e", "Math.E"], ["true", "1"], ["false", "0"]]);

/** TypeScript text and how tightly it binds, so it is wrapped in parentheses only where needed. */
export type Code = { text: string; level: number };

const LEVEL = { or: 1, and: 2, equality: 3, comparison: 4, sum: 5, product: 6, unary: 7, power: 8, atom: 9 };

interface OperatorText {
    text: string;
    level: number;
}

const OPERATORS: Record<string, OperatorText> = {
    "||": { text: "||", level: LEVEL.or }, "&&": { text: "&&", level: LEVEL.and },
    "==": { text: "===", level: LEVEL.equality }, "!=": { text: "!==", level: LEVEL.equality },
    "<": { text: "<", level: LEVEL.comparison }, "<=": { text: "<=", level: LEVEL.comparison }, ">": { text: ">", level: LEVEL.comparison }, ">=": { text: ">=", level: LEVEL.comparison },
    "+": { text: "+", level: LEVEL.sum }, "-": { text: "-", level: LEVEL.sum }, "*": { text: "*", level: LEVEL.product }, "/": { text: "/", level: LEVEL.product },
    "^": { text: "**", level: LEVEL.power },
};

function wrapped(code: Code, level: number): string {
    return code.level < level ? `(${code.text})` : code.text;
}

function unaryOperand(code: Code): string {
    return code.level === LEVEL.atom || code.level === LEVEL.unary ? code.text : `(${code.text})`;
}

function commentText(text: string): string {
    return Array.from(text, char => {
        const code = char.codePointAt(0)!;
        return code < FIRST_PRINTABLE || (code >= DELETE && code <= LAST_CONTROL) || code === LINE_SEPARATOR || code === PARAGRAPH_SEPARATOR ? " " : char;
    }).join("");
}

function asNumber(condition: Code): Code {
    return { text: `(${wrapped(condition, LEVEL.or)} ? 1 : 0)`, level: LEVEL.atom };
}

const CONDITIONS = new Set(["==", "!=", "<", "<=", ">", ">=", "&&", "||"]);

/**
 * An expression as TypeScript over the constants `names` gives its parameters, with how tightly it
 * binds. A comparison, `&&`, `||` or `!` computes 1 or 0 in a document, so where its result is a
 * value it is written as `(… ? 1 : 0)`; where only its truth counts (a `condition`: the test of an
 * `if`, an operand of `&&`, `||` or `!`) it stays plain TypeScript.
 */
export function expressionCode(node: ExpressionNode, names: ReadonlyMap<string, string>, helper: (kind: MathHelper) => string, condition = false): Code {
    switch (node.kind) {
        case "number":
            return { text: String(node.value), level: LEVEL.atom };
        case "text":
            return { text: JSON.stringify(node.value), level: LEVEL.atom };
        case "name":
            return { text: CONSTANT_CODE.get(node.name) ?? names.get(node.name) ?? node.name, level: LEVEL.atom };
        case "negate": {
            const text = unaryOperand(expressionCode(node.operand, names, helper));
            return { text: text.startsWith("-") ? `-(${text})` : `-${text}`, level: LEVEL.unary };
        }
        case "not": {
            const negated = { text: `!${unaryOperand(expressionCode(node.operand, names, helper, true))}`, level: LEVEL.unary };
            return condition ? negated : asNumber(negated);
        }
        case "binary": {
            const operator = OPERATORS[node.operator]!;
            const logical = node.operator === "&&" || node.operator === "||";
            const left = expressionCode(node.left, names, helper, logical);
            const right = expressionCode(node.right, names, helper, logical);
            const leftText = node.operator === "^" ? wrapped(left, LEVEL.atom) : wrapped(left, operator.level);
            const rightText = node.operator === "^" ? wrapped(right, LEVEL.power) : wrapped(right, operator.level + (operator.level >= LEVEL.sum ? 1 : 0));
            const code = { text: `${leftText} ${operator.text} ${rightText}`, level: operator.level };
            return CONDITIONS.has(node.operator) && !condition ? asNumber(code) : code;
        }
        case "call": {
            if (node.name === "if") {
                const [test, then, otherwise] = [expressionCode(node.args[0]!, names, helper, true), expressionCode(node.args[1]!, names, helper, condition), expressionCode(node.args[2]!, names, helper, condition)];
                return { text: `(${wrapped(test, LEVEL.or)} ? ${wrapped(then, LEVEL.or)} : ${wrapped(otherwise, LEVEL.or)})`, level: LEVEL.atom };
            }
            const args = node.args.map(arg => expressionCode(arg, names, helper));
            switch (node.name) {
                case "sin":
                case "cos":
                case "tan":
                case "asin":
                case "acos":
                case "round":
                    return { text: `${helper(node.name)}(${args[0]!.text})`, level: LEVEL.atom };
                case "atan":
                case "atan2":
                    return { text: `Math.${node.name}(${args.map(arg => arg.text).join(", ")}) / (${DEGREES})`, level: LEVEL.product };
                default:
                    return { text: `Math.${node.name}(${args.map(arg => arg.text).join(", ")})`, level: LEVEL.atom };
            }
        }
    }
}

function quietly(read: () => string[]): string[] {
    try {
        return read();
    } catch {
        return [];
    }
}

function namesInText(text: string): string[] {
    const asExpression = quietly(() => namesIn(parseExpression(text)));
    const asTemplate = quietly(() => templatePieces(text, "").flatMap(piece => "expression" in piece ? namesIn(parseExpression(piece.expression)) : []));
    return [...asExpression, ...asTemplate];
}

function readsConfiguration(value: unknown): boolean {
    if (typeof value === "string") {
        return namesInText(value).includes("configuration");
    }
    if (Array.isArray(value)) {
        return value.some(readsConfiguration);
    }
    return isRecord(value) && Object.values(value).some(readsConfiguration);
}

interface ResultFeature {
    id: string;
    body?: string | undefined;
    join?: Models.OCCT.DesignJoin | undefined;
}

class Exporter {
    private readonly lines: string[] = [];
    private readonly used = new Set<string>();
    private readonly variables = new Map<string, string>();
    private readonly faceSketches = new Set<string>();
    private readonly constants = new Map<string, string>();
    private readonly helpers: string[] = [];
    private readonly mathHelpers = new Map<MathHelper, string>();
    private formatterName: string | undefined = undefined;

    private readonly helperName = (kind: MathHelper): string => {
        if (MATH_HELPERS[kind].uses !== undefined) {
            this.helperName(MATH_HELPERS[kind].uses);
        }
        let name = this.mathHelpers.get(kind);
        if (name === undefined) {
            name = this.fresh(MATH_HELPERS[kind].name);
            this.mathHelpers.set(kind, name);
        }
        return name;
    };

    constructor(private readonly document: Models.OCCT.DesignPartDocument, private readonly run: DesignRun, private readonly trace: ReadonlyMap<string, DesignTrace>, private readonly choice: ParameterChoice) {}

    private fresh(id: string, suffix = ""): string {
        const words = `${id}${suffix}`.split(/[^A-Za-z0-9]+/).filter(word => word !== "");
        let base = words.map((word, index) => index === 0 ? word : word[0]!.toUpperCase() + word.slice(1)).join("") || "shape";
        if (/^[0-9]/.test(base)) {
            base = `_${base}`;
        }
        let name = base;
        for (let count = 2; RESERVED.has(name) || this.used.has(name); count++) {
            name = `${base}${count}`;
        }
        this.used.add(name);
        return name;
    }

    private variable(id: string): string {
        return this.variables.get(id)!;
    }

    private code(value: unknown): string {
        if (typeof value === "number") {
            return String(value);
        }
        if (typeof value === "boolean") {
            return String(value);
        }
        if (typeof value === "string") {
            return expressionCode(parseExpression(value), this.constants, this.helperName).text;
        }
        if (Array.isArray(value)) {
            return `[${value.map(inner => this.code(inner)).join(", ")}]`;
        }
        return JSON.stringify(value);
    }

    private numbers(values: readonly number[]): string {
        return `[${values.map(value => String(value)).join(", ")}]`;
    }

    private grouped(code: string): string {
        return /^[A-Za-z0-9_.]+$/.test(code) ? code : `(${code})`;
    }

    private negated(code: string): string {
        return code === "0" ? "0" : `-${this.grouped(code)}`;
    }

    private scaledCode(direction: readonly number[], factor: string): string {
        const tidy = direction.map(component => Math.abs(component) < NEGLIGIBLE ? 0 : Number(component.toPrecision(WRITTEN_DIGITS)));
        return `[${tidy.map(component => component === 0 ? "0" : component === 1 ? factor : component === -1 ? this.negated(factor) : `${component} * ${this.grouped(factor)}`).join(", ")}]`;
    }

    private frameCode(frame: Inputs.Base.Frame): string {
        return `{ origin: ${this.numbers(frame.origin)}, normal: ${this.numbers(frame.normal)}, direction: ${this.numbers(frame.direction)} }`;
    }

    private line(text = ""): void {
        this.lines.push(text);
    }

    private parameters(): void {
        const declared = this.document.parameters ?? {};
        const configuration = this.choice.configuration === undefined ? undefined : this.document.configurations?.find(entry => entry.id === this.choice.configuration);
        const sourceOf = (name: string): unknown => {
            const declaredValue = declared[name];
            const own = isRecord(declaredValue) ? declaredValue["value"] : declaredValue;
            return ownValue(this.choice.overrides, name) ?? ownValue(configuration?.values, name) ?? own;
        };
        const typeOf = (name: string): string | undefined => {
            const declaredValue = declared[name];
            return isRecord(declaredValue) ? (declaredValue["type"] as string | undefined) : undefined;
        };
        const usesConfiguration = readsConfiguration(this.document);
        if (this.choice.configuration !== undefined || usesConfiguration) {
            this.constants.set("configuration", "configuration");
            this.used.add("configuration");
            this.line(`const configuration = ${JSON.stringify(this.choice.configuration ?? "")};`);
        }
        const names = Object.keys(declared);
        names.forEach(name => this.constants.set(name, this.fresh(name)));
        const dependencies = new Map(names.map(name => {
            const source = sourceOf(name);
            const isExpression = typeof source === "string" && typeOf(name) !== "text" && typeOf(name) !== "choice";
            const text = isExpressionObject(source) ? source.expr : isExpression ? source : undefined;
            return [name, text === undefined ? [] : namesIn(parseExpression(text)).filter(used => names.includes(used))];
        }));
        const written = new Set<string>();
        const write = (name: string): void => {
            if (written.has(name)) {
                return;
            }
            written.add(name);
            dependencies.get(name)!.forEach(write);
            const source = sourceOf(name);
            const type = typeOf(name);
            const value = isExpressionObject(source) ? this.code(source.expr) : type === "text" || type === "choice" ? JSON.stringify(source) : typeof source === "boolean" ? (source ? "1" : "0") : this.code(source);
            this.line(`const ${this.constants.get(name)!} = ${value};`);
        };
        names.forEach(write);
    }

    private outline(sketchId: string): string {
        const shape = this.variable(sketchId);
        if (!this.faceSketches.has(sketchId)) {
            return shape;
        }
        const wire = this.fresh(sketchId, "Wire");
        this.line(`const ${wire} = await occt.shapes.wire.getWire({ shape: ${shape}, index: 0 });`);
        return wire;
    }

    private result(feature: ResultFeature, tool: string): void {
        if (feature.body === undefined) {
            const name = this.fresh(feature.id);
            this.variables.set(feature.id, name);
            this.line(`let ${name} = await ${tool};`);
            return;
        }
        const body = this.variable(feature.body);
        const toolName = this.fresh(feature.id, "Tool");
        this.line(`const ${toolName} = await ${tool};`);
        const join = feature.join ?? "add";
        const call = join === "cut" ? `occt.booleans.difference({ shape: ${body}, shapes: [${toolName}] })`
            : join === "intersect" ? `occt.booleans.intersection({ shapes: [${body}, ${toolName}] })`
                : `occt.booleans.union({ shapes: [${body}, ${toolName}] })`;
        this.line(`${body} = await ${call};`);
    }

    private sketch(feature: Models.OCCT.DesignSketchFeature, trace: DesignTrace): void {
        if (feature.loops === undefined && (feature.pen ?? []).length === 0) {
            this.line(`// "${feature.id}" draws nothing yet.`);
            return;
        }
        const name = this.fresh(feature.id);
        this.variables.set(feature.id, name);
        const on = feature.on;
        let frame: string;
        if ("plane" in on) {
            const normal = trace.frame!.normal;
            frame = `{ origin: ${on.offset === undefined ? "[0, 0, 0]" : this.scaledCode(normal, this.code(on.offset))}, normal: ${this.numbers(normal)}, direction: ${this.numbers(trace.frame!.direction)} }`;
        } else if ("frame" in on) {
            frame = `{ origin: ${this.code(on.frame.origin)}, normal: ${this.code(on.frame.normal)}, direction: ${this.code(on.frame.direction)} }`;
        } else {
            frame = this.frameCode(trace.frame!);
        }
        const commands = (feature.pen ?? []).map(command => {
            const fields = Object.entries(command).map(([key, value]) => `${key}: ${key === "type" || key === "id" || typeof value === "boolean" ? JSON.stringify(value) : this.code(value)}`);
            return `        { ${fields.join(", ")} },`;
        });
        const start = feature.start === undefined ? "" : ` start: ${this.code(feature.start)},`;
        if (trace.face === true) {
            this.faceSketches.add(feature.id);
        }
        this.line(`const ${name} = await occt.sketch.pen({${start} frame: ${frame}, makeFace: ${trace.face === true}, commands: [`);
        commands.forEach(command => this.line(command));
        this.line("] });");
    }

    private sweep(feature: Models.OCCT.DesignExtrudeFeature | Models.OCCT.DesignRevolveFeature | Models.OCCT.DesignSweepFeature | Models.OCCT.DesignLoftFeature, path: string): void {
        const parameters = this.run.parameters;
        switch (feature.type) {
            case "extrude": {
                const along = feature.direction === undefined ? this.run.sketches.get(feature.profile)!.normal : unitVector(directionOf(feature.direction, parameters, pointer(path, "direction")), pointer(path, "direction"), this.run.base);
                this.result(feature, `occt.operations.extrude({ shape: ${this.variable(feature.profile)}, direction: ${this.scaledCode(along, this.code(feature.distance))} })`);
                return;
            }
            case "revolve": {
                const origin = pointOf(feature.axis.origin, parameters, pointer(path, "axis", "origin"));
                const angle = feature.angle === undefined ? "360" : this.code(feature.angle);
                const turn = (shape: string): string => `occt.operations.revolve({ shape: ${shape}, angle: ${angle}, direction: ${this.code(feature.axis.direction)}, copy: false })`;
                if (origin.every(coordinate => coordinate === 0)) {
                    this.result(feature, turn(this.variable(feature.profile)));
                    return;
                }
                const axisOrigin = this.code(feature.axis.origin);
                const moved = this.fresh(feature.id, "Moved");
                const turned = this.fresh(feature.id, "Turned");
                const negated = `[${feature.axis.origin.map(coordinate => this.negated(this.code(coordinate))).join(", ")}]`;
                this.line(`const ${moved} = await occt.transforms.translate({ shape: ${this.variable(feature.profile)}, translation: ${negated} });`);
                this.line(`const ${turned} = await ${turn(moved)};`);
                this.result(feature, `occt.transforms.translate({ shape: ${turned}, translation: ${axisOrigin} })`);
                return;
            }
            case "sweep": {
                const spine = this.outline(feature.path);
                const profile = this.outline(feature.profile);
                this.result(feature, `occt.operations.pipe({ shape: ${spine}, shapes: [${profile}] })`);
                return;
            }
            default: {
                const wires = feature.profiles.map(profile => this.outline(profile));
                this.result(feature, `occt.operations.loft({ shapes: [${wires.join(", ")}], makeSolid: ${feature.solid !== false} })`);
            }
        }
    }

    private copies(feature: Models.OCCT.DesignLinearPatternFeature | Models.OCCT.DesignPolarPatternFeature, path: string): void {
        const body = this.variable(feature.body);
        const list = this.fresh(feature.id, "Copies");
        this.line(`const ${list} = [];`);
        this.line(`for (let copy = 1; copy < ${this.code(feature.count)}; copy++) {`);
        if (feature.type === "linearPattern") {
            const along = unitVector(directionOf(feature.direction, this.run.parameters, pointer(path, "direction")), pointer(path, "direction"), this.run.base);
            this.line(`    ${list}.push(await occt.transforms.translate({ shape: ${body}, translation: ${this.scaledCode(along, `${this.code(feature.spacing)} * copy`)} }));`);
        } else {
            const angle = feature.angle === undefined ? FULL_TURN : numberOf(feature.angle, this.run.parameters, pointer(path, "angle"));
            const angleCode = feature.angle === undefined ? "360" : this.code(feature.angle);
            const step = Math.abs(angle) === FULL_TURN ? `(${angleCode}) / (${this.code(feature.count)})` : `(${angleCode}) / (${this.code(feature.count)} - 1)`;
            this.line(`    ${list}.push(await occt.transforms.rotateAroundCenter({ shape: ${body}, angle: ${step} * copy, center: ${this.code(feature.axis.origin)}, axis: ${this.code(feature.axis.direction)} }));`);
        }
        this.line("}");
        this.line(`${body} = await occt.booleans.union({ shapes: [${body}, ...${list}] });`);
    }

    private cutShell(feature: Models.OCCT.DesignShellFeature, trace: DesignTrace, body: string): void {
        const inner = this.fresh(feature.id, "Inner");
        const lids = (trace.lids ?? []).map(lid => `await occt.operations.extrude({ shape: await occt.shapes.face.getFace({ shape: ${inner}, index: ${lid.face} }), direction: ${this.numbers(lid.direction)} })`);
        this.line(`const ${inner} = await occt.shapes.solid.fromClosedShell({ shape: await occt.operations.offsetAdv({ shape: ${body}, distance: ${this.negated(this.code(feature.thickness))}, tolerance: 1e-7, joinType: Bit.Inputs.OCCT.joinTypeEnum.intersection, removeIntEdges: false }) });`);
        this.line(`${body} = await occt.booleans.difference({ shape: await occt.booleans.difference({ shape: ${body}, shapes: [${inner}], keepEdges: false }), shapes: [${lids.join(", ")}], keepEdges: false });`);
    }

    private holes(feature: Models.OCCT.DesignHoleFeature, trace: DesignTrace): void {
        const body = this.variable(feature.body);
        const frame = trace.frame!;
        const across = tripleOf(this.run.base.vector.cross({ first: frame.normal, second: frame.direction }));
        const term = (coefficient: number, value: string): string => coefficient === 0 ? "" : coefficient === 1 ? ` + ${value}` : coefficient === -1 ? ` - ${value}` : ` + ${coefficient} * ${value}`;
        const frames = feature.at.map(position => {
            const x = this.grouped(this.code(Array.isArray(position) ? position[0] : position.x));
            const y = this.grouped(this.code(Array.isArray(position) ? position[1] : position.y));
            const origin = [0, 1, 2].map(axis => `${frame.origin[axis]}${term(frame.direction[axis]!, x)}${term(across[axis]!, y)}`);
            return `{ origin: [${origin.join(", ")}], normal: ${this.numbers(frame.normal)}, direction: ${this.numbers(frame.direction)} }`;
        });
        const common = `shape: ${body}, frames: [${frames.join(", ")}], diameter: ${this.code(feature.diameter)}, depth: ${feature.depth === undefined ? "0" : this.code(feature.depth)}, tipAngle: ${feature.tipAngle === undefined ? "0" : this.code(feature.tipAngle)}`;
        if (feature.counterbore !== undefined) {
            this.line(`${body} = await occt.features.counterboredHoles({ ${common}, counterboreDiameter: ${this.code(feature.counterbore.diameter)}, counterboreDepth: ${this.code(feature.counterbore.depth)} });`);
        } else if (feature.countersink !== undefined) {
            this.line(`${body} = await occt.features.countersunkHoles({ ${common}, countersinkDiameter: ${this.code(feature.countersink.diameter)}, countersinkAngle: ${this.code(feature.countersink.angle)} });`);
        } else {
            this.line(`${body} = await occt.features.holes({ ${common} });`);
        }
    }

    private prism(feature: Models.OCCT.DesignBossFeature | Models.OCCT.DesignPocketFeature, trace: DesignTrace): void {
        const body = this.variable(feature.body);
        const normal = this.run.sketches.get(feature.profile)!.normal;
        const direction = feature.type === "boss" ? normal : normal.map(component => -component);
        const extent = feature.distance !== undefined ? `extent: Bit.Inputs.OCCT.featureExtentEnum.length, length: ${this.code(feature.distance)}`
            : feature.until !== undefined ? `extent: Bit.Inputs.OCCT.featureExtentEnum.untilFace, untilFaceIndex: ${trace.untilFace}`
                : "extent: Bit.Inputs.OCCT.featureExtentEnum.throughAll";
        this.line(`${body} = await occt.features.${feature.type}({ shape: ${body}, profile: ${this.variable(feature.profile)}, sketchFaceIndex: ${trace.sketchFace}, direction: ${this.numbers(direction)}, ${extent} });`);
    }

    private imported(feature: Models.OCCT.DesignImportFeature, trace: DesignTrace): void {
        const name = this.fresh(feature.id);
        this.variables.set(feature.id, name);
        const data = `assets[${JSON.stringify(feature.asset)}]`;
        const call = trace.format === "brep" ? `occt.io.loadBrep({ brepData: ${data} as string })`
            : trace.format === "brep-binary" ? `occt.io.loadBrepBinary({ brepData: ${data} as Uint8Array })`
                : `occt.io.loadSTEPorIGES({ filetext: ${data} as string | ArrayBuffer, fileName: "asset.${trace.format}", adjustZtoY: false })`;
        this.line(`let ${name} = await ${call};`);
    }

    private operationValue(value: unknown): string {
        if (Array.isArray(value)) {
            return `[${value.map(inner => this.operationValue(inner)).join(", ")}]`;
        }
        if (isRecord(value)) {
            const keys = Object.keys(value);
            if (keys.length === 1 && keys[0] === "body" && typeof value["body"] === "string") {
                return this.variable(value["body"]);
            }
            if (keys.length === 1 && keys[0] === "expr") {
                return this.code(value["expr"]);
            }
            return `{ ${Object.entries(value).map(([key, inner]) => `${/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key) ? key : JSON.stringify(key)}: ${this.operationValue(inner)}`).join(", ")} }`;
        }
        return JSON.stringify(value);
    }

    private feature(feature: Models.OCCT.DesignFeature, path: string): void {
        if (this.run.suppressed.has(feature.id)) {
            this.line(`// "${feature.id}" is suppressed with these values.`);
            return;
        }
        const trace = this.trace.get(path) ?? {};
        switch (feature.type) {
            case "sketch":
                return this.sketch(feature, trace);
            case "extrude":
            case "revolve":
            case "sweep":
            case "loft":
                return this.sweep(feature, path);
            case "boolean": {
                const body = this.variable(feature.body);
                const tools = feature.tools.map(tool => this.variable(tool)).join(", ");
                this.line(feature.operation === "difference" ? `${body} = await occt.booleans.difference({ shape: ${body}, shapes: [${tools}] });` : `${body} = await occt.booleans.${feature.operation}({ shapes: [${body}, ${tools}] });`);
                return;
            }
            case "fillet":
            case "chamfer": {
                const body = this.variable(feature.body);
                const size = feature.type === "fillet" ? `radius: ${this.code(feature.radius)}` : `distance: ${this.code(feature.distance)}`;
                this.line(`${body} = await occt.fillets.${feature.type === "fillet" ? "filletEdges" : "chamferEdges"}({ shape: ${body}, ${size}, indexes: ${this.numbers(trace.indexes!)} });`);
                return;
            }
            case "linearPattern":
            case "polarPattern":
                return this.copies(feature, path);
            case "mirror": {
                const body = this.variable(feature.body);
                const image = this.fresh(feature.id, "Image");
                this.line(`const ${image} = await occt.transforms.mirrorAlongNormal({ shape: ${body}, origin: ${this.code(feature.plane.origin)}, normal: ${this.code(feature.plane.normal)} });`);
                this.line(feature.keepOriginal === false ? `${body} = ${image};` : `${body} = await occt.booleans.union({ shapes: [${body}, ${image}] });`);
                return;
            }
            case "pushPull":
            case "removeFaces": {
                const body = this.variable(feature.body);
                if (feature.type === "pushPull" && feature.mode !== "offset") {
                    const profile = `await occt.shapes.face.getFace({ shape: ${body}, index: ${trace.sketchFace!} })`;
                    this.line(`${body} = await occt.features.${trace.pull === true ? "boss" : "pocket"}({ shape: ${body}, profile: ${profile}, sketchFaceIndex: ${trace.sketchFace!}, direction: ${this.numbers(trace.frame!.normal)}, extent: Bit.Inputs.OCCT.featureExtentEnum.length, length: Math.abs(${this.code(feature.distance)}) });`);
                    return;
                }
                const call = feature.type === "pushPull" ? `pushPullFaces({ shape: ${body}, indexes: ${this.numbers(trace.indexes ?? [])}, distance: ${this.code(feature.distance)} })` : `removeFaces({ shape: ${body}, indexes: ${this.numbers(trace.indexes ?? [])} })`;
                this.line(`${body} = await occt.features.${call};`);
                return;
            }
            case "transform": {
                const body = this.variable(feature.body);
                const pivot = feature.pivot === undefined ? "[0, 0, 0]" : this.code(feature.pivot);
                (feature.rotate ?? [0, 0, 0]).forEach((angle, axis) => {
                    if (angle !== 0) {
                        this.line(`${body} = await occt.transforms.rotateAroundCenter({ shape: ${body}, angle: ${this.code(angle)}, center: ${pivot}, axis: ${["[1, 0, 0]", "[0, 1, 0]", "[0, 0, 1]"][axis]} });`);
                    }
                });
                if (feature.translate !== undefined) {
                    this.line(`${body} = await occt.transforms.translate({ shape: ${body}, translation: ${this.code(feature.translate)} });`);
                }
                return;
            }
            case "shell": {
                const body = this.variable(feature.body);
                if (trace.join === "cut") {
                    return this.cutShell(feature, trace, body);
                }
                const faces = trace.indexes!.map(index => `await occt.shapes.face.getFace({ shape: ${body}, index: ${index} })`).join(", ");
                this.line(`${body} = await occt.operations.makeThickSolidByJoin({ shape: ${body}, shapes: [${faces}], offset: ${this.negated(this.code(feature.thickness))}, joinType: Bit.Inputs.OCCT.joinTypeEnum.${trace.join} });`);
                return;
            }
            case "hole":
                return this.holes(feature, trace);
            case "boss":
            case "pocket":
                return this.prism(feature, trace);
            case "import":
                return this.imported(feature, trace);
            case "operation": {
                const call = `${feature.operation}(${this.operationValue(feature.params)})`;
                if (feature.body === undefined) {
                    const name = this.fresh(feature.id);
                    this.variables.set(feature.id, name);
                    this.line(`let ${name} = await ${call};`);
                } else {
                    this.line(`${this.variable(feature.body)} = await ${call};`);
                }
            }
        }
    }

    private template(value: string, path: string): string {
        const pieces = templatePieces(value, path).map(piece => "text" in piece
            ? piece.text.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${")
            : `\${${this.formatter()}(${expressionCode(parseExpression(piece.expression), this.constants, this.helperName).text})}`);
        return `\`${pieces.join("")}\``;
    }

    private formatter(): string {
        if (this.formatterName === undefined) {
            this.formatterName = this.fresh("formatted");
            this.helpers.push(`const ${this.formatterName} = (value: number | string): string => typeof value === "number" ? String(Number(value.toPrecision(12))) : value;`);
        }
        return this.formatterName;
    }

    private property(value: Models.OCCT.DesignPropertyValue, path: string): string {
        if (typeof value === "string") {
            return this.template(value, path);
        }
        if (typeof value === "object") {
            return this.code(value.expr);
        }
        return String(value);
    }

    private parts(): void {
        const declared = this.document.parts ?? this.run.order.filter(name => this.run.bodies.has(name)).map((name): Models.OCCT.DesignPart => ({ id: name, body: name }));
        const built = declared.filter(part => this.run.bodies.has(part.body));
        const entries = built.map((part, index) => {
            const path = pointer("/parts", index);
            const properties = Object.entries(part.properties ?? {}).map(([key, value]) => `${/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key) ? key : JSON.stringify(key)}: ${this.property(value, pointer(path, "properties", key))}`);
            const material = part.material === undefined ? "" : `, material: ${isExpressionObject(part.material) ? this.code(part.material.expr) : JSON.stringify(part.material)}`;
            return `    { id: ${JSON.stringify(part.id)}, name: ${JSON.stringify(part.name ?? part.id)}, shape: ${this.variable(part.body)}${material}, properties: { ${properties.join(", ")} } },`;
        });
        this.helpers.forEach(helper => this.line(helper));
        this.line("const parts = [");
        entries.forEach(entry => this.line(entry));
        this.line("];");
        this.line("for (const part of parts) {");
        this.line("    await bitbybit.draw.drawAnyAsync({ entity: part.shape });");
        this.line("}");
    }

    write(): string {
        const name = this.document.meta?.name;
        this.line(`// Generated by occt.design.toTypeScript${name === undefined ? "" : ` from "${commentText(name)}"`}${this.choice.configuration === undefined ? "" : `, configuration "${commentText(this.choice.configuration)}"`}.`);
        this.line("// Dimensions follow the constants below. The faces and edges the features pick are the ones a build");
        this.line("// with these values found, so a change that adds or removes faces may need their indexes updated.");
        this.line("const occt = bitbybit.occt;");
        if (this.document.features.some(feature => feature.type === "import")) {
            const listed = (this.document.assets ?? []).map(asset => commentText(`${asset.id}: ${asset.uri}`)).join(", ");
            this.line(`// Fill in the contents of the assets the document imports (${listed}).`);
            this.line("const assets: Record<string, string | Uint8Array | ArrayBuffer> = {};");
        }
        this.line();
        const helpersAt = this.lines.length;
        this.parameters();
        this.line();
        this.document.features.forEach((feature, index) => this.feature(feature, pointer("/features", index)));
        this.line();
        this.parts();
        const helpers = mathHelperDeclarations(this.mathHelpers);
        this.lines.splice(helpersAt, 0, ...helpers, ...(helpers.length > 0 ? [""] : []));
        return `${this.lines.join("\n")}\n`;
    }
}

/**
 * The TypeScript a built run stands for: the parameters as constants, each feature as the calls of
 * this package that make it, with the faces and edges the run resolved written as indexes, and the
 * parts drawn at the end.
 */
export function typescriptOf(document: Models.OCCT.DesignPartDocument, run: DesignRun, trace: ReadonlyMap<string, DesignTrace>, choice: ParameterChoice): string {
    return new Exporter(document, run, trace, choice).write();
}
