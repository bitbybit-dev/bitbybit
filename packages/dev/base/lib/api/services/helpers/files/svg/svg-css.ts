import type { WorkBudget } from "../work-budget";
import type { XmlNode } from "./svg-xml";
import {
    MAX_AT_RULE_NESTING, SPECIFICITY_CLASS, SPECIFICITY_ID, SPECIFICITY_TYPE, STEPS_PER_ANCESTOR_TABLE, STEPS_PER_MATCHED_DECLARATION,
} from "./svg-reader.constants";

export interface CssDeclaration {
    property: string;
    value: string;
    important: boolean;
}

type AttributeOperator = "" | "=" | "~=" | "|=" | "^=" | "$=" | "*=";
type Combinator = "descendant" | "child";

interface AttributeTest {
    name: string;
    operator: AttributeOperator;
    value: string;
}

interface CompoundSelector {
    tag?: string;
    id?: string;
    classes: string[];
    attributes: AttributeTest[];
}

interface ComplexSelector {
    compounds: CompoundSelector[];
    combinators: Combinator[];
}

export interface CssRule {
    selector: ComplexSelector;
    specificity: number;
    order: number;
    declarations: CssDeclaration[];
}

export interface Stylesheet {
    rules: CssRule[];
    unsupported: string[];
}

export interface CssMatch {
    declaration: CssDeclaration;
    specificity: number;
    order: number;
}

export type CssMatches = Map<XmlNode, CssMatch[]>;

export interface CssMatching {
    matches: CssMatches;
    exhausted: boolean;
}

type WordsOf = (node: XmlNode, attribute: string) => ReadonlySet<string>;

interface RuleCounter {
    next: number;
}

interface RuleIndex {
    byId: Map<string, CssRule[]>;
    byClass: Map<string, CssRule[]>;
    byTag: Map<string, CssRule[]>;
    universal: CssRule[];
}

const COMMENT_OPEN = "/*";
const COMMENT_CLOSE = "*/";
const UNDECIDED = 0;
const DECIDED_YES = 1;
const DECIDED_NO = 2;
const IMPORTANT = /!\s*important\s*$/i;
const NOT_SPACE = /\S/g;
const IDENTIFIER = /^-?[_a-zA-Z\u00a0-\uffff][\w\u00a0-\uffff-]*/;
const ATTRIBUTE = /^\[\s*([^\s~|^$*=\]]+)\s*(?:([~|^$*]?=)\s*(?:"([^"]*)"|'([^']*)'|([^\s\]]+)))?\s*\]/;
const BLOCK_AT_RULES_WITH_RULES = new Set(["media", "supports", "layer", "document"]);

function splitTopLevel(text: string, separator: string): string[] {
    const parts: string[] = [];
    let depth = 0;
    let quote = "";
    let start = 0;
    for (let i = 0; i < text.length; i++) {
        const ch = text[i]!;
        if (quote) {
            if (ch === quote) { quote = ""; }
        } else if (ch === "\"" || ch === "'") {
            quote = ch;
        } else if (ch === "(" || ch === "[") {
            depth++;
        } else if (ch === ")" || ch === "]") {
            depth = Math.max(0, depth - 1);
        } else if (ch === separator && depth === 0) {
            parts.push(text.slice(start, i));
            start = i + 1;
        }
    }
    parts.push(text.slice(start));
    return parts;
}

function withoutComments(text: string): string {
    const kept: string[] = [];
    let at = 0;
    for (let open = text.indexOf(COMMENT_OPEN); open !== -1; open = text.indexOf(COMMENT_OPEN, at)) {
        kept.push(text.slice(at, open));
        const close = text.indexOf(COMMENT_CLOSE, open + COMMENT_OPEN.length);
        if (close === -1) { return kept.join(""); }
        at = close + COMMENT_CLOSE.length;
    }
    kept.push(text.slice(at));
    return kept.join("");
}

export function parseDeclarations(text: string | undefined): CssDeclaration[] {
    if (!text) { return []; }
    const declarations: CssDeclaration[] = [];
    for (const part of splitTopLevel(withoutComments(text), ";")) {
        const colon = part.indexOf(":");
        if (colon === -1) { continue; }
        const property = part.slice(0, colon).trim().toLowerCase();
        let value = part.slice(colon + 1).trim();
        const important = IMPORTANT.test(value);
        if (important) { value = value.replace(IMPORTANT, "").trim(); }
        if (property && value) { declarations.push({ property, value, important }); }
    }
    return declarations;
}

function strongestDeclarations(text: string, properties: ReadonlySet<string>): CssDeclaration[] {
    const strongest = new Map<string, CssDeclaration>();
    for (const declaration of parseDeclarations(text)) {
        if (!properties.has(declaration.property)) { continue; }
        const current = strongest.get(declaration.property);
        if (!current || declaration.important || !current.important) { strongest.set(declaration.property, declaration); }
    }
    return [...strongest.values()];
}

function compileCompound(text: string): CompoundSelector | undefined {
    const compound: CompoundSelector = { classes: [], attributes: [] };
    let rest = text;
    if (rest.startsWith("*")) {
        rest = rest.slice(1);
    } else {
        const tag = IDENTIFIER.exec(rest);
        if (tag) {
            compound.tag = tag[0].toLowerCase();
            rest = rest.slice(tag[0].length);
        }
    }
    while (rest.length > 0) {
        const lead = rest[0];
        if (lead === "#" || lead === ".") {
            const name = IDENTIFIER.exec(rest.slice(1));
            if (!name) { return undefined; }
            if (lead === "#") { compound.id = name[0]; } else { compound.classes.push(name[0]); }
            rest = rest.slice(1 + name[0].length);
        } else if (lead === "[") {
            const attribute = ATTRIBUTE.exec(rest);
            if (!attribute) { return undefined; }
            const operator = (attribute[2] ?? "") as AttributeOperator;
            compound.attributes.push({ name: attribute[1]!, operator, value: attribute[3] ?? attribute[4] ?? attribute[5] ?? "" });
            rest = rest.slice(attribute[0].length);
        } else {
            return undefined;
        }
    }
    return compound;
}

function selectorTokens(text: string): string[] {
    const tokens: string[] = [];
    for (const word of text.trim().split(/\s+/)) {
        word.split(">").forEach((part, k) => {
            if (k > 0) { tokens.push(">"); }
            if (part.length > 0) { tokens.push(part); }
        });
    }
    return tokens;
}

function compileSelector(text: string): ComplexSelector | undefined {
    const tokens = selectorTokens(text);
    const compounds: CompoundSelector[] = [];
    const combinators: Combinator[] = [];
    let pending: Combinator | undefined;
    for (const token of tokens) {
        if (token === ">") {
            if (compounds.length === 0 || pending === "child") { return undefined; }
            pending = "child";
            continue;
        }
        const compound = compileCompound(token);
        if (!compound) { return undefined; }
        if (compounds.length > 0) { combinators.push(pending ?? "descendant"); }
        compounds.push(compound);
        pending = undefined;
    }
    return compounds.length === 0 || pending !== undefined ? undefined : { compounds, combinators };
}

function specificityOf(selector: ComplexSelector): number {
    return selector.compounds.reduce((sum, c) => sum
        + (c.id === undefined ? 0 : SPECIFICITY_ID)
        + (c.classes.length + c.attributes.length) * SPECIFICITY_CLASS
        + (c.tag === undefined ? 0 : SPECIFICITY_TYPE), 0);
}

function firstNotSpace(text: string, from: number): number {
    NOT_SPACE.lastIndex = from;
    return NOT_SPACE.exec(text)?.index ?? text.length;
}

function closingBrace(text: string, open: number): number {
    let depth = 0;
    for (let i = open; i < text.length; i++) {
        if (text[i] === "{") { depth++; }
        if (text[i] === "}") {
            depth--;
            if (depth === 0) { return i; }
        }
    }
    return text.length;
}

function collectRules(text: string, sheet: Stylesheet, order: RuleCounter, nesting: number, properties: ReadonlySet<string>): void {
    let at = 0;
    let open = text.indexOf("{");
    let semicolon = text.indexOf(";");
    while (at < text.length) {
        if (open !== -1 && open < at) { open = text.indexOf("{", at); }
        if (semicolon !== -1 && semicolon < at) { semicolon = text.indexOf(";", at); }
        const first = firstNotSpace(text, at);
        const endsBeforeBlock = semicolon !== -1 && (open === -1 || semicolon < open);
        if (text[first] === "@" && endsBeforeBlock) {
            const statement = text.slice(first, semicolon).trim();
            if (!/^@charset\b/i.test(statement)) { sheet.unsupported.push(statement); }
            at = semicolon + 1;
            continue;
        }
        if (open === -1) { return; }
        const prelude = text.slice(first, open).trim();
        const close = closingBrace(text, open);
        const body = text.slice(open + 1, close);
        at = close + 1;
        if (prelude.startsWith("@")) {
            const name = /^@([\w-]+)/.exec(prelude)?.[1]?.toLowerCase() ?? "";
            if (BLOCK_AT_RULES_WITH_RULES.has(name)) {
                if (nesting < MAX_AT_RULE_NESTING) { collectRules(body, sheet, order, nesting + 1, properties); } else { sheet.unsupported.push(prelude); }
            }
            continue;
        }
        const declarations = strongestDeclarations(body, properties);
        for (const selectorText of splitTopLevel(prelude, ",")) {
            const selector = compileSelector(selectorText);
            if (!selector) {
                if (selectorText.trim()) { sheet.unsupported.push(selectorText.trim()); }
                continue;
            }
            sheet.rules.push({ selector, specificity: specificityOf(selector), order: order.next++, declarations });
        }
    }
}

export function parseStylesheets(texts: string[], properties: ReadonlySet<string>): Stylesheet {
    const sheet: Stylesheet = { rules: [], unsupported: [] };
    const order: RuleCounter = { next: 0 };
    texts.forEach((text) => collectRules(withoutComments(text), sheet, order, 0, properties));
    return sheet;
}

function wordLists(): WordsOf {
    const known = new Map<XmlNode, Map<string, ReadonlySet<string>>>();
    return (node: XmlNode, attribute: string): ReadonlySet<string> => {
        const ofNode = known.get(node) ?? new Map<string, ReadonlySet<string>>();
        known.set(node, ofNode);
        const listed = ofNode.get(attribute) ?? new Set((node.attrs[attribute] ?? "").split(/\s+/).filter((word) => word.length > 0));
        ofNode.set(attribute, listed);
        return listed;
    };
}

function comparedCharacters(test: AttributeTest, actual: string): number {
    if (test.operator === "" || test.operator === "~=") { return 0; }
    return test.operator === "*=" ? actual.length + test.value.length : test.value.length;
}

function attributeMatches(test: AttributeTest, node: XmlNode, words: WordsOf, budget: WorkBudget): boolean {
    const actual = node.attrs[test.name];
    if (actual === undefined) { return false; }
    if (!budget.spend(comparedCharacters(test, actual))) { return false; }
    switch (test.operator) {
        case "": return true;
        case "=": return actual === test.value;
        case "~=": return words(node, test.name).has(test.value);
        case "|=": return actual === test.value || actual.startsWith(`${test.value}-`);
        case "^=": return test.value !== "" && actual.startsWith(test.value);
        case "$=": return test.value !== "" && actual.endsWith(test.value);
        default: return test.value !== "" && actual.includes(test.value);
    }
}

function compoundMatches(compound: CompoundSelector, node: XmlNode, words: WordsOf, budget: WorkBudget): boolean {
    if (!budget.spend(1 + compound.classes.length + compound.attributes.length)) { return false; }
    if (compound.tag !== undefined && compound.tag !== node.tag) { return false; }
    if (compound.id !== undefined && node.attrs["id"] !== compound.id) { return false; }
    if (compound.classes.length > 0) {
        const own = words(node, "class");
        if (!compound.classes.every((c) => own.has(c))) { return false; }
    }
    return compound.attributes.every((test) => attributeMatches(test, node, words, budget));
}

function fitsAncestors(selector: ComplexSelector, ancestors: readonly XmlNode[], words: WordsOf, budget: WorkBudget): boolean {
    const { compounds, combinators } = selector;
    const last = compounds.length - 1;
    if (last === 0) { return true; }
    if (last > ancestors.length) { return false; }
    const width = ancestors.length + 1;
    if (!budget.spend(STEPS_PER_ANCESTOR_TABLE + last * width)) { return false; }
    const placedAt = new Uint8Array(last * width);
    const aboveAt = new Uint8Array(last * width);
    const remembered = (table: Uint8Array, at: number, decide: () => boolean): boolean => {
        if (table[at] === UNDECIDED) { table[at] = decide() ? DECIDED_YES : DECIDED_NO; }
        return table[at] === DECIDED_YES;
    };
    const placed = (k: number, depth: number): boolean => k <= depth
        && remembered(placedAt, k * width + depth, () => compoundMatches(compounds[k]!, ancestors[depth]!, words, budget) && (k === 0 || fitsAbove(k, depth)));
    const someAbove = (k: number, depth: number): boolean => k < depth
        && remembered(aboveAt, k * width + depth, () => placed(k, depth - 1) || someAbove(k, depth - 1));
    const fitsAbove = (k: number, depth: number): boolean => combinators[k - 1] === "child"
        ? depth > 0 && placed(k - 1, depth - 1)
        : someAbove(k - 1, depth);
    return fitsAbove(last, ancestors.length);
}

function indexRules(rules: CssRule[]): RuleIndex {
    const index: RuleIndex = { byId: new Map(), byClass: new Map(), byTag: new Map(), universal: [] };
    const add = (map: Map<string, CssRule[]>, key: string, rule: CssRule): void => {
        const list = map.get(key);
        if (list) { list.push(rule); } else { map.set(key, [rule]); }
    };
    for (const rule of rules) {
        const subject = rule.selector.compounds[rule.selector.compounds.length - 1]!;
        if (subject.id !== undefined) { add(index.byId, subject.id, rule); }
        else if (subject.classes.length > 0) { add(index.byClass, subject.classes[0]!, rule); }
        else if (subject.tag !== undefined) { add(index.byTag, subject.tag, rule); }
        else { index.universal.push(rule); }
    }
    return index;
}

function candidateLists(index: RuleIndex, node: XmlNode, words: WordsOf): CssRule[][] {
    const lists: CssRule[][] = [index.universal];
    const id = node.attrs["id"];
    const byId = id === undefined ? undefined : index.byId.get(id);
    if (byId) { lists.push(byId); }
    for (const word of words(node, "class")) {
        const byClass = index.byClass.get(word);
        if (byClass) { lists.push(byClass); }
    }
    const byTag = index.byTag.get(node.tag);
    if (byTag) { lists.push(byTag); }
    return lists;
}

const strongerInSheet = (a: CssMatch, b: CssMatch): boolean =>
    a.declaration.important !== b.declaration.important
        ? a.declaration.important
        : a.specificity !== b.specificity ? a.specificity > b.specificity : a.order > b.order;

export function matchStylesheet(root: XmlNode, sheet: Stylesheet, budget: WorkBudget): CssMatching {
    const matches: CssMatches = new Map();
    if (sheet.rules.length === 0) { return { matches, exhausted: false }; }
    const index = indexRules(sheet.rules);
    const words = wordLists();
    const ancestors: XmlNode[] = [];
    const fits = (rule: CssRule, underParent: Map<CssRule, boolean>): boolean => {
        const known = underParent.get(rule);
        if (known !== undefined) { return known; }
        const decided = fitsAncestors(rule.selector, ancestors, words, budget);
        underParent.set(rule, decided);
        return decided;
    };
    const visit = (node: XmlNode, underParent: Map<CssRule, boolean>): void => {
        const winners = new Map<string, CssMatch>();
        for (const rules of candidateLists(index, node, words)) {
            for (const rule of rules) {
                const compounds = rule.selector.compounds;
                if (compoundMatches(compounds[compounds.length - 1]!, node, words, budget) && fits(rule, underParent)
                    && budget.spend(STEPS_PER_MATCHED_DECLARATION * rule.declarations.length)) {
                    rule.declarations.forEach((declaration) => {
                        const match: CssMatch = { declaration, specificity: rule.specificity, order: rule.order };
                        const current = winners.get(declaration.property);
                        if (!current || strongerInSheet(match, current)) { winners.set(declaration.property, match); }
                    });
                }
                if (budget.exhausted) { return; }
            }
        }
        if (winners.size > 0) { matches.set(node, [...winners.values()]); }
        const underNode = new Map<CssRule, boolean>();
        ancestors.push(node);
        for (const child of node.children) {
            visit(child, underNode);
            if (budget.exhausted) { break; }
        }
        ancestors.pop();
    };
    visit(root, new Map());
    return { matches, exhausted: budget.exhausted };
}
