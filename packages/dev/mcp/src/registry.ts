import { z } from "zod";

/** The hints MCP hosts read to decide how a tool may be called. Every tool here is read-only. */
export interface ToolAnnotations {
    title: string;
    readOnlyHint: boolean;
    destructiveHint: boolean;
    idempotentHint?: boolean;
    openWorldHint?: boolean;
}

/** A file a tool produced, handed over as a link that expires with its URL; never inlined. */
export interface ToolLink {
    uri: string;
    name: string;
    mimeType?: string;
    description?: string;
}

/** What a tool answers: text for the model, optionally the same answer as structured data, and links to files. */
export interface ToolResult {
    text: string;
    structured?: Record<string, unknown>;
    links?: ToolLink[];
    isError?: boolean;
}

/** Where a tool's handler runs. A browser tool is declared here and answered by the client application that owns the page. */
export type ToolWhere = "server" | "browser";

/** Every tool takes one object argument, described by a zod object schema. */
export type ToolInput = z.ZodObject<z.ZodRawShape>;

export type ToolHandler<TInput extends ToolInput, TContext> = (args: z.output<TInput>, context: TContext) => Promise<ToolResult> | ToolResult;

/**
 * One tool, described once and independent of any transport: the MCP binding in `server.ts` and the
 * plain HTTP binding in `toHttp` both render it, so a name, a description or a schema can never
 * differ between the two.
 */
export interface ToolDefinition<TInput extends ToolInput, TContext> {
    name: string;
    description: string;
    annotations: ToolAnnotations;
    input: TInput;
    where: ToolWhere;
    scope?: string;
    handler?: ToolHandler<TInput, TContext> | undefined;
}

export type AnyToolDefinition<TContext> = ToolDefinition<ToolInput, TContext>;

/** The most tools one server exposes: past it, agents pick the wrong tool more often than the right one. */
export const TOOL_CEILING = 8;

/** The tools of one server, in registration order. */
export class Registry<TContext> {
    private readonly tools = new Map<string, AnyToolDefinition<TContext>>();

    register<TInput extends ToolInput>(definition: ToolDefinition<TInput, TContext>): this {
        if (this.tools.has(definition.name)) throw new Error(`Tool ${definition.name} is already registered`);
        const { handler } = definition;
        const erased: AnyToolDefinition<TContext> = handler
            ? { ...definition, handler: (args, context) => handler(args as z.output<TInput>, context) }
            : { ...definition, handler: undefined };
        this.tools.set(definition.name, erased);
        return this;
    }

    list(): AnyToolDefinition<TContext>[] {
        return [...this.tools.values()];
    }

    get(name: string): AnyToolDefinition<TContext> | undefined {
        return this.tools.get(name);
    }

    get size(): number {
        return this.tools.size;
    }
}

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

/**
 * Inlines every local `$ref`. A schema registered under an id comes out of zod as a reference
 * into a `$defs` table, and a sub-schema used twice as a pointer to its first occurrence; the
 * hosts that read a tool's arguments (the Claude API among them) want the object itself at every
 * position. A cyclic reference is left in place with the table it needs.
 */
function inlineReferences(schema: Record<string, unknown>): Record<string, unknown> {
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

/**
 * The JSON Schema (draft 2020-12) of a tool's argument object, as MCP hosts and the HTTP binding
 * advertise it: definitions inlined, and rendered for input, so a field with a default is optional.
 */
export function inputJsonSchema(input: ToolInput): Record<string, unknown> {
    return inlineReferences(z.toJSONSchema(input, { target: "draft-2020-12", io: "input" }));
}

/** A tool as the plain HTTP binding serves it: its advertised shape and a call that validates first. */
export interface HttpTool {
    name: string;
    description: string;
    annotations: ToolAnnotations;
    inputSchema: Record<string, unknown>;
    call(args: unknown): Promise<ToolResult>;
}

/**
 * Renders the registry for a plain HTTP endpoint. Only tools with a handler are served; arguments
 * that fail the schema are answered with an error result rather than thrown.
 */
export function toHttp<TContext>(
    registry: Registry<TContext>,
    context: TContext,
    filter?: (definition: AnyToolDefinition<TContext>) => boolean,
): HttpTool[] {
    const tools: HttpTool[] = [];
    for (const definition of registry.list()) {
        const { handler } = definition;
        if (!handler || (filter && !filter(definition))) continue;
        tools.push({
            name: definition.name,
            description: definition.description,
            annotations: definition.annotations,
            inputSchema: inputJsonSchema(definition.input),
            call: async (args: unknown): Promise<ToolResult> => {
                const parsed = definition.input.safeParse(args);
                if (!parsed.success) {
                    return { text: `Invalid arguments for ${definition.name}: ${z.prettifyError(parsed.error)}`, isError: true };
                }
                return handler(parsed.data, context);
            },
        });
    }
    return tools;
}
