import type { ApiIndex, Engine, IndexExample, IndexMember } from "./index-types.js";

/** A member with the score the query gave it. */
export interface SearchHit {
    member: IndexMember;
    score: number;
}

export interface SearchOptions {
    engine?: Engine | undefined;
    limit?: number | undefined;
}

const CAMEL_BOUNDARY = /([a-z0-9])([A-Z])/g;
const EXACT_PATH = 20;
const NAME_MATCH = 6;
const PATH_MATCH = 4;
const PATH_PREFIX = 2;
const PHRASE_IN_SUMMARY = 2;
const TEXT_MATCH = 1;
const TEXT_PREFIX = 0.5;
const PREFIX_MIN_LENGTH = 3;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;
const NEAREST_LIMIT = 5;
const MIN_EDIT_TOLERANCE = 2;
const EDIT_TOLERANCE_DIVISOR = 3;

/** Lower-case words of a text, camelCase split apart, punctuation dropped. */
export function tokenize(text: string): string[] {
    return text
        .replace(CAMEL_BOUNDARY, "$1 $2")
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((token) => token.length > 0);
}

interface MemberTokens {
    path: Set<string>;
    name: Set<string>;
    text: Set<string>;
}

const byPathThenLength = (a: SearchHit, b: SearchHit): number =>
    b.score - a.score || a.member.path.length - b.member.path.length || (a.member.path < b.member.path ? -1 : 1);

/** Reads one version of the index: exact lookups, children, lexical search, nearest paths and examples. */
export class IndexReader {
    readonly version: string;
    private readonly byPath = new Map<string, IndexMember>();
    private readonly tokens = new Map<string, MemberTokens>();

    constructor(readonly index: ApiIndex) {
        this.version = index.version;
        for (const member of index.members) {
            this.byPath.set(member.path, member);
            this.tokens.set(member.path, {
                path: new Set(tokenize(member.path)),
                name: new Set(tokenize(member.name)),
                text: new Set(tokenize(`${member.summary} ${member.group ?? ""}`)),
            });
        }
    }

    get(path: string): IndexMember | undefined {
        return this.byPath.get(path);
    }

    all(): IndexMember[] {
        return this.index.members;
    }

    /** The members one level below a path; without a path, the roots. */
    children(path?: string): IndexMember[] {
        const prefix = path ? `${path}.` : "";
        const depth = path ? path.split(".").length + 1 : 1;
        return this.index.members.filter((member) => member.path.startsWith(prefix) && member.path.split(".").length === depth);
    }

    search(query: string, options: SearchOptions = {}): SearchHit[] {
        const queryTokens = [...new Set(tokenize(query))];
        const phrase = query.trim().toLowerCase();
        const limit = Math.min(Math.max(options.limit ?? DEFAULT_LIMIT, 1), MAX_LIMIT);
        const hits: SearchHit[] = [];
        for (const member of this.index.members) {
            if (options.engine && member.engines.length > 0 && !member.engines.includes(options.engine)) continue;
            const score = this.score(member, queryTokens, phrase);
            if (score > 0) hits.push({ member, score });
        }
        return hits.sort(byPathThenLength).slice(0, limit);
    }

    /**
     * Members an unknown path most plausibly meant: a case difference, then siblings under the
     * same parent whose name is a few edits away, then members sharing the last segment anywhere
     * (the closest whole path first), then a lexical match.
     */
    nearest(path: string, limit = NEAREST_LIMIT): IndexMember[] {
        const lower = path.toLowerCase();
        const segments = lower.split(".");
        const lastSegment = segments[segments.length - 1] ?? lower;
        const parent = segments.slice(0, -1).join(".");
        const found: IndexMember[] = [];
        const seen = new Set<string>();
        const add = (member: IndexMember): void => {
            if (seen.has(member.path)) return;
            seen.add(member.path);
            found.push(member);
        };
        for (const member of this.index.members) if (member.path.toLowerCase() === lower) add(member);
        if (parent) {
            const tolerance = Math.max(MIN_EDIT_TOLERANCE, Math.floor(lastSegment.length / EDIT_TOLERANCE_DIVISOR));
            const siblings = this.index.members
                .filter((member) => member.path.toLowerCase().startsWith(`${parent}.`) && member.path.split(".").length === segments.length)
                .map((member) => ({ member, distance: editDistance(member.name.toLowerCase(), lastSegment, tolerance) }))
                .filter(({ distance }) => distance <= tolerance)
                .sort((a, b) => a.distance - b.distance || (a.member.path < b.member.path ? -1 : 1));
            for (const { member } of siblings) add(member);
        }
        const sameName = this.index.members
            .filter((member) => member.name.toLowerCase() === lastSegment)
            .map((member) => ({ member, distance: editDistance(member.path.toLowerCase(), lower, lower.length) }))
            .sort((a, b) => a.distance - b.distance || (a.member.path < b.member.path ? -1 : 1));
        for (const { member } of sameName) add(member);
        for (const hit of this.search(path.replace(/\./g, " "), { limit })) add(hit.member);
        return found.slice(0, limit);
    }

    examplesOf(path: string): IndexExample[] {
        const member = this.byPath.get(path);
        if (!member) return [];
        return member.examples.flatMap((id) => {
            const example = Object.hasOwn(this.index.examples, id) ? this.index.examples[id] : undefined;
            return example ? [example] : [];
        });
    }

    /** Examples of every member under a namespace, in path order. */
    examplesUnder(path: string, limit: number): IndexExample[] {
        const prefix = `${path}.`;
        const examples: IndexExample[] = [];
        for (const member of this.index.members) {
            if (!member.path.startsWith(prefix)) continue;
            for (const example of this.examplesOf(member.path)) {
                examples.push(example);
                if (examples.length >= limit) return examples;
            }
        }
        return examples;
    }

    private score(member: IndexMember, queryTokens: string[], phrase: string): number {
        const tokens = this.tokens.get(member.path);
        if (!tokens || queryTokens.length === 0) return 0;
        let score = member.path.toLowerCase() === phrase ? EXACT_PATH : 0;
        for (const token of queryTokens) {
            if (tokens.name.has(token)) score += NAME_MATCH;
            else if (tokens.path.has(token)) score += PATH_MATCH;
            else if (token.length >= PREFIX_MIN_LENGTH && startsWithAny(tokens.path, token)) score += PATH_PREFIX;
            else if (tokens.text.has(token)) score += TEXT_MATCH;
            else if (token.length >= PREFIX_MIN_LENGTH && startsWithAny(tokens.text, token)) score += TEXT_PREFIX;
        }
        if (phrase.length > 0 && member.summary.toLowerCase().includes(phrase)) score += PHRASE_IN_SUMMARY;
        return score;
    }
}

/** The Levenshtein distance of two strings, or `cap + 1` once it is known to exceed the cap. */
export function editDistance(a: string, b: string, cap: number): number {
    if (Math.abs(a.length - b.length) > cap) return cap + 1;
    let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
    for (let i = 1; i <= a.length; i++) {
        const current = [i];
        let rowMinimum = i;
        for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            const value = Math.min((previous[j] ?? 0) + 1, (current[j - 1] ?? 0) + 1, (previous[j - 1] ?? 0) + cost);
            current.push(value);
            rowMinimum = Math.min(rowMinimum, value);
        }
        if (rowMinimum > cap) return cap + 1;
        previous = current;
    }
    return previous[b.length] ?? cap + 1;
}

function startsWithAny(tokens: Set<string>, prefix: string): boolean {
    for (const token of tokens) if (token.startsWith(prefix)) return true;
    return false;
}
