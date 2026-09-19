const LOCAL_POINTER = "#/";

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function resolvePointer(root: unknown, pointer: string): unknown {
    let node: unknown = root;
    for (const part of pointer.slice(LOCAL_POINTER.length).split("/")) {
        const key = part.replace(/~1/g, "/").replace(/~0/g, "~");
        if (Array.isArray(node)) node = node[Number(key)];
        else if (isRecord(node)) node = node[key];
        else return undefined;
    }
    return node;
}

export function inlineJsonSchemaReferences(schema: Record<string, unknown>): Record<string, unknown> {
    const inline = (node: unknown, seen: readonly string[]): unknown => {
        if (Array.isArray(node)) return node.map((item) => inline(item, seen));
        if (!isRecord(node)) return node;
        const reference = node["$ref"];
        if (typeof reference === "string" && reference.startsWith(LOCAL_POINTER) && !seen.includes(reference)) {
            const target = resolvePointer(schema, reference);
            if (isRecord(target)) {
                const { $ref: _reference, ...rest } = node;
                const inlinedTarget = inline(target, [...seen, reference]);
                const inlinedRest = inline(rest, seen);
                return { ...(isRecord(inlinedTarget) ? inlinedTarget : {}), ...(isRecord(inlinedRest) ? inlinedRest : {}) };
            }
        }
        const out: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(node)) if (key !== "$defs") out[key] = inline(value, seen);
        return out;
    };
    const result = inline(schema, []);
    const inlined = isRecord(result) ? result : {};
    if (JSON.stringify(inlined).includes("\"$ref\"") && isRecord(schema["$defs"])) inlined["$defs"] = schema["$defs"];
    return inlined;
}
