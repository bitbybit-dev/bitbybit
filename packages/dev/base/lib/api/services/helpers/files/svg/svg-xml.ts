import { InputError } from "../../../../kernel-calls";
import { WorkBudget } from "../work-budget";
import {
    DECIMAL_RADIX, ENTITY_EXPANSION_CEILING, ENTITY_EXPANSION_FLOOR, ENTITY_EXPANSION_PER_INPUT_CHARACTER, HEX_RADIX, LAST_CODE_POINT,
    MAX_XML_NESTING, REPLACEMENT_CHARACTER,
} from "./svg-reader.constants";

export type XmlAttributes = Record<string, string>;
type NamespaceScopes = Map<string, string[]>;

export interface XmlNode {
    tag: string;
    prefix: string;
    namespace?: string;
    attrs: XmlAttributes;
    attrNamespaces?: XmlAttributes;
    children: XmlNode[];
    text?: string;
}

interface OpenElement {
    node: XmlNode;
    rawName: string;
    declared: readonly string[];
}

interface StartTag {
    rawName: string;
    attrs: XmlAttributes;
    selfClosing: boolean;
    end: number;
}

interface Entities {
    readonly values: Map<string, string>;
    readonly budget: WorkBudget;
}

const RAW_TEXT_TAGS = new Set(["style", "script"]);
const BUILT_IN_ENTITIES: readonly (readonly [string, string])[] = [["lt", "<"], ["gt", ">"], ["amp", "&"], ["quot", "\""], ["apos", "'"]];
const ENTITY_REFERENCE = /&(#x[0-9a-fA-F]+|#[0-9]+|[A-Za-z_][\w.-]*);/g;
const ENTITY_DECLARATION = /<!ENTITY\s+([A-Za-z_][\w.-]*)\s+(?:"([^"]*)"|'([^']*)')\s*>/g;

const SPACE = /\s/;
const COMMENT_OPEN = "<!--";
const COMMENT_CLOSE = "-->";
const CDATA_OPEN = "<![CDATA[";
const CDATA_CLOSE = "]]>";
const INSTRUCTION_OPEN = "<?";
const INSTRUCTION_CLOSE = "?>";
const DECLARATION_OPEN = "<!";
const END_TAG_OPEN = "</";
const XMLNS_PREFIX = "xmlns:";
const NOTHING_DECLARED: readonly string[] = [];

const isSpace = (ch: string | undefined): boolean => ch !== undefined && SPACE.test(ch);

function entitiesFor(input: string): Entities {
    const budget = WorkBudget.forInput(input.length, ENTITY_EXPANSION_PER_INPUT_CHARACTER, ENTITY_EXPANSION_FLOOR, ENTITY_EXPANSION_CEILING);
    return { values: new Map(BUILT_IN_ENTITIES), budget };
}

function character(codePoint: number): string {
    return codePoint <= LAST_CODE_POINT ? String.fromCodePoint(codePoint) : REPLACEMENT_CHARACTER;
}

function decodeEntities(text: string, entities: Entities): string {
    if (text.indexOf("&") === -1) { return text; }
    return text.replace(ENTITY_REFERENCE, (whole: string, name: string) => {
        if (name.startsWith("#x")) { return character(parseInt(name.slice(2), HEX_RADIX)); }
        if (name.startsWith("#")) { return character(parseInt(name.slice(1), DECIMAL_RADIX)); }
        const value = entities.values.get(name);
        if (value === undefined) { return whole; }
        if (!entities.budget.spend(value.length)) {
            throw new InputError(`The SVG's entities expand to more than ${entities.budget.capacity} characters, more than the importer reads from a file of its size; replace the entity references with their text and import it again.`, "svg");
        }
        return value;
    });
}

function splitName(rawName: string): [string, string] {
    const colon = rawName.indexOf(":");
    return colon >= 0 ? [rawName.slice(0, colon), rawName.slice(colon + 1).toLowerCase()] : ["", rawName.toLowerCase()];
}

function readStartTag(input: string, from: number, entities: Entities): StartTag | undefined {
    const n = input.length;
    let i = from + 1;
    while (i < n && !isSpace(input[i]) && input[i] !== ">" && input[i] !== "/") { i++; }
    const rawName = input.slice(from + 1, i);
    const attrs = Object.create(null) as XmlAttributes;
    while (i < n) {
        while (i < n && isSpace(input[i])) { i++; }
        if (i >= n) { return undefined; }
        if (input[i] === ">") { return { rawName, attrs, selfClosing: false, end: i + 1 }; }
        if (input[i] === "/" && input[i + 1] === ">") { return { rawName, attrs, selfClosing: true, end: i + 2 }; }
        const nameStart = i;
        while (i < n && !isSpace(input[i]) && input[i] !== "=" && input[i] !== ">" && !(input[i] === "/" && input[i + 1] === ">")) { i++; }
        const name = input.slice(nameStart, i);
        if (name.length === 0) { i++; continue; }
        while (i < n && isSpace(input[i])) { i++; }
        if (input[i] !== "=") { attrs[name] = ""; continue; }
        i++;
        while (i < n && isSpace(input[i])) { i++; }
        const quote = input[i];
        if (quote === "\"" || quote === "'") {
            const close = input.indexOf(quote, i + 1);
            if (close === -1) { return undefined; }
            attrs[name] = decodeEntities(input.slice(i + 1, close), entities);
            i = close + 1;
        } else {
            const valueStart = i;
            while (i < n && !isSpace(input[i]) && input[i] !== ">" && !(input[i] === "/" && input[i + 1] === ">")) { i++; }
            attrs[name] = decodeEntities(input.slice(valueStart, i), entities);
        }
    }
    return undefined;
}

function skipDoctype(input: string, from: number, entities: Entities): number {
    const n = input.length;
    let i = from + DECLARATION_OPEN.length;
    let quote = "";
    while (i < n) {
        const ch = input[i]!;
        if (quote) {
            if (ch === quote) { quote = ""; }
        } else if (ch === "\"" || ch === "'") {
            quote = ch;
        } else if (ch === "[") {
            const close = input.indexOf("]", i + 1);
            const subset = input.slice(i + 1, close === -1 ? n : close);
            for (const declared of subset.matchAll(ENTITY_DECLARATION)) {
                const name = declared[1]!;
                if (!entities.values.has(name)) { entities.values.set(name, decodeEntities(declared[2] ?? declared[3]!, entities)); }
            }
            i = close === -1 ? n : close;
        } else if (ch === ">") {
            return i + 1;
        }
        i++;
    }
    return n;
}

function namedAt(input: string, at: number, rawName: string): boolean {
    for (let k = 0; k < rawName.length; k++) {
        const ch = input[at + k];
        if (ch === undefined || ch.toLowerCase() !== rawName[k]!.toLowerCase()) { return false; }
    }
    return true;
}

function rawTextEnd(input: string, from: number, rawName: string): [number, number] {
    const n = input.length;
    for (let at = input.indexOf(END_TAG_OPEN, from); at !== -1; at = input.indexOf(END_TAG_OPEN, at + END_TAG_OPEN.length)) {
        if (!namedAt(input, at + END_TAG_OPEN.length, rawName)) { continue; }
        let close = at + END_TAG_OPEN.length + rawName.length;
        while (close < n && isSpace(input[close])) { close++; }
        if (input[close] === ">") { return [at, close + 1]; }
    }
    return [n, n];
}

function rawTextOf(raw: string, entities: Entities): string {
    const parts: string[] = [];
    let at = 0;
    while (at < raw.length) {
        const open = raw.indexOf(CDATA_OPEN, at);
        const close = open === -1 ? -1 : raw.indexOf(CDATA_CLOSE, open + CDATA_OPEN.length);
        if (close === -1) {
            parts.push(decodeEntities(raw.slice(at), entities));
            break;
        }
        parts.push(decodeEntities(raw.slice(at, open), entities), raw.slice(open + CDATA_OPEN.length, close));
        at = close + CDATA_CLOSE.length;
    }
    return parts.join("");
}

function readRawText(input: string, from: number, rawName: string, entities: Entities): [string, number] {
    const [end, after] = rawTextEnd(input, from, rawName);
    return [rawTextOf(input.slice(from, end), entities), after];
}

function declarationsOf(attrs: XmlAttributes): Map<string, string> | undefined {
    let own: Map<string, string> | undefined;
    for (const name of Object.keys(attrs)) {
        if (name === "xmlns" || name.startsWith(XMLNS_PREFIX)) {
            own = own ?? new Map();
            own.set(name === "xmlns" ? "" : name.slice(XMLNS_PREFIX.length), attrs[name]!);
        }
    }
    return own;
}

function namespaceIn(scopes: NamespaceScopes, prefix: string): string | undefined {
    const bound = scopes.get(prefix);
    return bound === undefined ? undefined : bound[bound.length - 1];
}

function attributeNamespacesOf(attrs: XmlAttributes, own: ReadonlyMap<string, string> | undefined, scopes: NamespaceScopes): XmlAttributes | undefined {
    let resolved: XmlAttributes | undefined;
    for (const name of Object.keys(attrs)) {
        const colon = name.indexOf(":");
        if (colon <= 0 || name.startsWith(XMLNS_PREFIX)) { continue; }
        const prefix = name.slice(0, colon);
        const namespace = own?.get(prefix) ?? namespaceIn(scopes, prefix);
        if (namespace === undefined) { continue; }
        resolved = resolved ?? Object.create(null) as XmlAttributes;
        resolved[name] = namespace;
    }
    return resolved;
}

function enterScope(scopes: NamespaceScopes, own: ReadonlyMap<string, string>): string[] {
    const declared: string[] = [];
    own.forEach((uri, prefix) => {
        const bound = scopes.get(prefix);
        if (bound) { bound.push(uri); } else { scopes.set(prefix, [uri]); }
        declared.push(prefix);
    });
    return declared;
}

function leaveScope(scopes: NamespaceScopes, declared: readonly string[]): void {
    declared.forEach((prefix) => scopes.get(prefix)!.pop());
}

function skipPast(input: string, marker: string, from: number): number {
    const at = input.indexOf(marker, from);
    return at === -1 ? input.length : at + marker.length;
}

function closeElement(stack: OpenElement[], rawName: string, scopes: NamespaceScopes): void {
    for (let at = stack.length - 1; at > 0; at--) {
        if (stack[at]!.rawName === rawName) {
            for (let closing = stack.length - 1; closing >= at; closing--) { leaveScope(scopes, stack[closing]!.declared); }
            stack.length = at;
            return;
        }
    }
}

export function parseXml(input: string): XmlNode | undefined {
    const n = input.length;
    const entities = entitiesFor(input);
    const root: XmlNode = { tag: "#root", prefix: "", attrs: Object.create(null) as XmlAttributes, children: [] };
    const scopes: NamespaceScopes = new Map();
    const stack: OpenElement[] = [{ node: root, rawName: "", declared: NOTHING_DECLARED }];
    let i = 0;

    while (i < n) {
        const lt = input.indexOf("<", i);
        if (lt === -1) { break; }
        i = lt;
        if (input.startsWith(COMMENT_OPEN, i)) {
            i = skipPast(input, COMMENT_CLOSE, i + COMMENT_OPEN.length);
        } else if (input.startsWith(CDATA_OPEN, i)) {
            i = skipPast(input, CDATA_CLOSE, i + CDATA_OPEN.length);
        } else if (input.startsWith(INSTRUCTION_OPEN, i)) {
            i = skipPast(input, INSTRUCTION_CLOSE, i + INSTRUCTION_OPEN.length);
        } else if (input.startsWith(DECLARATION_OPEN, i)) {
            i = skipDoctype(input, i, entities);
        } else if (input.startsWith(END_TAG_OPEN, i)) {
            const end = input.indexOf(">", i);
            if (end === -1) { break; }
            closeElement(stack, input.slice(i + END_TAG_OPEN.length, end).trim(), scopes);
            i = end + 1;
        } else {
            const start = readStartTag(input, i, entities);
            if (!start) { break; }
            i = start.end;
            const parent = stack[stack.length - 1]!;
            const [prefix, tag] = splitName(start.rawName);
            const own = declarationsOf(start.attrs);
            const node: XmlNode = { tag, prefix, attrs: start.attrs, children: [] };
            const namespace = own?.get(prefix) ?? namespaceIn(scopes, prefix);
            if (namespace !== undefined) { node.namespace = namespace; }
            const attrNamespaces = attributeNamespacesOf(start.attrs, own, scopes);
            if (attrNamespaces) { node.attrNamespaces = attrNamespaces; }
            parent.node.children.push(node);
            if (start.selfClosing) { continue; }
            if (RAW_TEXT_TAGS.has(tag)) {
                const [text, after] = readRawText(input, i, start.rawName, entities);
                node.text = text;
                i = after;
                continue;
            }
            if (stack.length > MAX_XML_NESTING) {
                throw new InputError(`The SVG nests its elements more than ${MAX_XML_NESTING} deep, deeper than the importer reads; flatten its groups and import it again.`, "svg");
            }
            stack.push({ node, rawName: start.rawName, declared: own ? enterScope(scopes, own) : NOTHING_DECLARED });
        }
    }

    return root.children[0];
}
