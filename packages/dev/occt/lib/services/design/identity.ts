import { stableJson } from "./cache";
import { sha256 } from "./digest";
import { isRecord } from "./structure";

const EDITOR_TEXT = {
    parameter: ["label", "description", "group", "step", "unit"],
    option: ["label"],
    configuration: ["name"],
    feature: ["name"],
};

const NOT_STRUCTURE = new Set(["params", "properties", "parameters", "values", "extras", "extensions"]);

const ITEM_KEY_DIGITS = 16;

function utf8(text: string): Uint8Array {
    return new TextEncoder().encode(text);
}

function bare(value: unknown, required: ReadonlySet<string>, drop: readonly string[] = []): unknown {
    if (!isRecord(value)) {
        return value;
    }
    const kept: [string, unknown][] = [];
    for (const [key, inner] of Object.entries(value)) {
        if (key === "extras" || drop.includes(key)) {
            continue;
        }
        if (key === "extensions" && isRecord(inner)) {
            const known = Object.entries(inner).filter(([name]) => required.has(name));
            if (known.length > 0) {
                kept.push([key, Object.fromEntries(known)]);
            }
            continue;
        }
        kept.push([key, inner]);
    }
    return Object.fromEntries(kept);
}

function withoutHints(value: unknown): unknown {
    if (Array.isArray(value)) {
        return value.map(withoutHints);
    }
    if (!isRecord(value)) {
        return value;
    }
    const pointsAtGeometry = "of" in value || "between" in value || "on" in value;
    return Object.fromEntries(Object.entries(value)
        .filter(([key]) => !(pointsAtGeometry && key === "hint"))
        .map(([key, inner]) => [key, NOT_STRUCTURE.has(key) ? inner : withoutHints(inner)]));
}

function each(list: unknown, map: (item: unknown) => unknown): unknown {
    return Array.isArray(list) ? list.map(map) : list;
}

/**
 * What a document's version is taken over: the document without `meta` but its `name`, which names
 * an assembly's product in STEP, without `extras` and the
 * extensions it does not require anywhere, without the text only editors show (a parameter's
 * `label`, `description`, `group`, `step` and `unit`, an option's `label`, a configuration's and a
 * feature's `name`), and without the `hint` a reference or a connector may carry. What changes
 * geometry, the bill of materials or an export stays, part and component names included.
 */
export function versionProjection(document: Readonly<Record<string, unknown>>): Record<string, unknown> {
    const requires = document["requires"];
    const required = new Set(Array.isArray(requires) ? requires.filter((name): name is string => typeof name === "string") : []);
    const projected = bare(document, required, ["meta", "$schema"]) as Record<string, unknown>;
    const meta = document["meta"];
    if (isRecord(meta) && meta["name"] !== undefined) {
        projected["meta"] = { name: meta["name"] };
    }
    const parameters = projected["parameters"];
    if (isRecord(parameters)) {
        projected["parameters"] = Object.fromEntries(Object.entries(parameters).map(([name, declared]) => {
            const kept = bare(declared, required, EDITOR_TEXT.parameter);
            if (isRecord(kept) && Array.isArray(kept["options"])) {
                kept["options"] = kept["options"].map((option: unknown) => bare(option, required, EDITOR_TEXT.option));
            }
            return [name, kept];
        }));
    }
    projected["configurations"] = each(projected["configurations"], configuration => bare(configuration, required, EDITOR_TEXT.configuration));
    projected["features"] = each(projected["features"], feature => withoutHints(bare(feature, required, EDITOR_TEXT.feature)));
    projected["parts"] = each(projected["parts"], part => {
        const kept = bare(part, required);
        if (isRecord(kept) && kept["connectors"] !== undefined) {
            kept["connectors"] = each(kept["connectors"], connector => bare(connector, required));
        }
        return withoutHints(kept);
    });
    for (const list of ["materials", "assets", "components", "joints", "connectors"]) {
        projected[list] = each(projected[list], item => bare(item, required));
    }
    return Object.fromEntries(Object.entries(projected).filter(([, value]) => value !== undefined));
}

/**
 * A document's version: the SHA-256 of its `versionProjection` written as canonical JSON (RFC 8785,
 * JCS), as 64 lower-case hexadecimal digits. A component pins its source with it, and edits that
 * change only what the projection leaves out keep it.
 */
export function versionOf(document: unknown): string {
    return sha256(utf8(stableJson(isRecord(document) ? versionProjection(document) : document)));
}

/**
 * A part variant's item key: 16 hexadecimal digits (64 bits) of the SHA-256 of the canonical JSON
 * of its document's id, its part id and the declared values it reads. The document's version and the
 * configuration chosen are left out, so a revision keeps the key and a configuration reaches the same
 * item as the values it sets.
 */
export function itemKeyOf(document: string | undefined, part: string, values: Readonly<Record<string, unknown>>): string {
    return sha256(utf8(stableJson({ document: document ?? null, part, values }))).slice(0, ITEM_KEY_DIGITS);
}

/** A build key: the item key with the version of the document it was built from, for caches and editors that must tell revisions apart. */
export function buildKeyOf(itemKey: string, version: string): string {
    return sha256(utf8(stableJson({ item: itemKey, version }))).slice(0, ITEM_KEY_DIGITS);
}
